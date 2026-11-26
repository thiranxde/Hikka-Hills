import { site } from '@/config/site'
import { enquiryText, type Enquiry, type EnquiryErrors, type EnquiryField } from './enquiry'

export type EnquiryResult =
  /** The backend emailed it to the owner; `copySent` says whether the guest was sent a copy too. */
  | { status: 'sent'; reference: string; copySent: boolean }
  /** Handed to WhatsApp or the mail app; the guest sends it from there. */
  | { status: 'handed-off'; channel: 'whatsapp' | 'email' }
  /** No channel is set up yet (config/site.ts > booking.channel, or the backend has no owner address). Nothing was sent. */
  | { status: 'not-connected' }
  /** The backend found something to fix; shown under the fields like the form's own checks. */
  | { status: 'invalid'; errors: EnquiryErrors }
  /** It did not go: the backend or the mail server is down, the connection failed, or too many tries. */
  | { status: 'failed'; message: string }

/** Extra fields the form sends with an enquiry. `website` is the hidden field only bots fill in. */
export interface EnquiryExtras {
  website?: string
}

const FIELDS: readonly EnquiryField[] = ['checkIn', 'checkOut', 'guests', 'name', 'email', 'phone', 'message']
const TRY_AGAIN = 'We could not send your enquiry just now. Please try again in a few minutes, or contact us directly.'

/**
 * The single place an enquiry leaves the site (the design's "submit() hook"). To send enquiries to a reservation
 * platform instead, replace the body of this function; the form only reads its result.
 */
export async function submitEnquiry(enquiry: Enquiry, extras: EnquiryExtras = {}): Promise<EnquiryResult> {
  const { channel } = site.booking

  if (channel === 'api') return postToBackend(enquiry, extras)

  const text = enquiryText(enquiry)

  if (channel === 'whatsapp' && site.contact.whatsapp) {
    window.open(`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    return { status: 'handed-off', channel: 'whatsapp' }
  }

  if (channel === 'email' && site.contact.email) {
    const subject = `Enquiry: ${enquiry.checkIn} to ${enquiry.checkOut}, ${enquiry.guests} guests`
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
    return { status: 'handed-off', channel: 'email' }
  }

  return { status: 'not-connected' }
}

/** POST /api/enquiries (backend/app/Http/Controllers/EnquiryController.php lists its answers). */
async function postToBackend(enquiry: Enquiry, extras: EnquiryExtras): Promise<EnquiryResult> {
  let response: Response
  try {
    response = await fetch(site.booking.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...enquiry, website: extras.website ?? '' }),
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    return { status: 'failed', message: TRY_AGAIN }
  }

  const body: unknown = await response.json().catch(() => null)
  const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
  const message = typeof record.message === 'string' ? record.message : TRY_AGAIN

  if (response.ok && record.status === 'sent') {
    return { status: 'sent', reference: String(record.reference ?? ''), copySent: record.copySent === true }
  }
  if (response.status === 503 && record.status === 'not_connected') return { status: 'not-connected' }
  if (response.status === 422) {
    const errors = fieldErrors(record.errors)
    if (Object.keys(errors).length > 0) return { status: 'invalid', errors }
  }
  if (response.status === 429) return { status: 'failed', message }
  return { status: 'failed', message: record.status === 'failed' ? message : TRY_AGAIN }
}

/** Laravel's `{ field: [message, ...] }`, reduced to the first message of each field the form knows. */
function fieldErrors(raw: unknown): EnquiryErrors {
  const errors: EnquiryErrors = {}
  if (typeof raw !== 'object' || raw === null) return errors
  for (const field of FIELDS) {
    const messages = (raw as Record<string, unknown>)[field]
    if (Array.isArray(messages) && typeof messages[0] === 'string') errors[field] = messages[0]
  }
  return errors
}
