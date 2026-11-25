import { site } from '@/config/site'
import { enquiryText, type Enquiry } from './enquiry'

export type EnquiryResult =
  /** Handed to WhatsApp or the mail app; the guest sends it from there. */
  | { status: 'handed-off'; channel: 'whatsapp' | 'email' }
  /** No channel is set up yet (config/site.ts > booking.channel). Nothing was sent. */
  | { status: 'not-connected' }

/**
 * The single place an enquiry leaves the site (the design's "submit() hook"). To send enquiries to a reservation
 * platform or your own server instead, replace the body of this function; the form only reads its result.
 */
export async function submitEnquiry(enquiry: Enquiry): Promise<EnquiryResult> {
  const { channel } = site.booking
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
