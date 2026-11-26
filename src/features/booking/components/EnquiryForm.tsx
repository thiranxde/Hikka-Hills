import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Pending } from '@/components/ui/Pending'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'
import { emptyEnquiry, nextDay, nights, todayIso, validateEnquiry, type Enquiry, type EnquiryErrors, type EnquiryField } from '../lib/enquiry'
import { submitEnquiry, type EnquiryResult } from '../lib/submitEnquiry'

/**
 * The enquiry form on the cream card. Checks each field in the browser, then hands the enquiry to submitEnquiry().
 * If the backend finds something else to fix, its message shows under the field; if the enquiry could not be sent,
 * an alert says so and the form keeps what was typed.
 */
export function EnquiryForm() {
  const [values, setValues] = useState<Enquiry>(emptyEnquiry)
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Outcome | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const today = todayIso()

  const set = (field: EnquiryField, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    // After a first attempt, errors clear (or appear) as the guest types.
    if (tried) setErrors(validateEnquiry(next, today))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTried(true)
    const found = validateEnquiry(values, today)
    setErrors(found)
    if (focusFirst(found)) return

    const website = new FormData(e.currentTarget).get('website')
    setFailure(null)
    setSending(true)
    try {
      const answer = await submitEnquiry(values, { website: typeof website === 'string' ? website : '' })
      if (answer.status === 'invalid') {
        setErrors(answer.errors)
        focusFirst(answer.errors)
      } else if (answer.status === 'failed') {
        setFailure(answer.message)
      } else {
        setResult(answer)
      }
    } finally {
      setSending(false)
    }
  }

  if (result) return <Sent result={result} enquiry={values} onEdit={() => setResult(null)} />

  const n = nights(values)
  return (
    <form noValidate onSubmit={onSubmit} aria-label="Booking enquiry" className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
      <Field label="Check-in" field="checkIn" error={errors.checkIn}>
        {(props) => (
          <input
            {...props}
            type="date"
            min={today}
            value={values.checkIn}
            onChange={(e) => {
              const checkIn = e.target.value
              // Keep check-out after check-in when the arrival moves past it.
              if (checkIn && values.checkOut && values.checkOut <= checkIn) {
                const next = { ...values, checkIn, checkOut: nextDay(checkIn) }
                setValues(next)
                if (tried) setErrors(validateEnquiry(next, today))
              } else set('checkIn', checkIn)
            }}
          />
        )}
      </Field>
      <Field label="Check-out" field="checkOut" error={errors.checkOut} hint={n ? `${n} night${n === 1 ? '' : 's'}` : undefined}>
        {(props) => (
          <input {...props} type="date" min={values.checkIn ? nextDay(values.checkIn) : today} value={values.checkOut} onChange={(e) => set('checkOut', e.target.value)} />
        )}
      </Field>
      <Field label="Guests" field="guests" error={errors.guests} wide>
        {(props) => (
          <input {...props} type="number" inputMode="numeric" min={1} max={site.booking.maxGuests} value={values.guests} onChange={(e) => set('guests', e.target.value)} />
        )}
      </Field>
      <Field label="Full name" field="name" error={errors.name} wide>
        {(props) => <input {...props} type="text" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} />}
      </Field>
      <Field label="Email" field="email" error={errors.email}>
        {(props) => <input {...props} type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} />}
      </Field>
      <Field label="Phone" field="phone" error={errors.phone} optional>
        {(props) => <input {...props} type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set('phone', e.target.value)} />}
      </Field>
      <Field label="Message" field="message" error={errors.message} wide optional>
        {(props) => (
          <textarea
            {...props}
            rows={4}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="Anything we should know: the occasion, arrival time, questions"
            className={cn(props.className, 'resize-y placeholder:text-muted/60')}
          />
        )}
      </Field>

      {/* Only bots fill this in: hidden from view, from screen readers and from the Tab key. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="sm:col-span-2">
        {failure && (
          <p role="alert" className="mb-6 border-l-2 border-error pl-4 text-sm leading-relaxed text-error">
            {failure}
          </p>
        )}
        <Button type="submit" variant="forest" disabled={sending} className="w-full px-8 py-5 sm:w-auto sm:py-4">
          {sending ? 'Sending…' : 'Submit enquiry'}
        </Button>
      </div>
    </form>
  )
}

/** Focuses the first field with a problem. Returns whether there was one. */
function focusFirst(errors: EnquiryErrors): boolean {
  const first = Object.keys(errors)[0]
  if (first) document.getElementById(`enquiry-${first}`)?.focus()
  return Boolean(first)
}

interface ControlProps {
  id: string
  name: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
  required: boolean
  className: string
}

interface FieldProps {
  label: string
  field: EnquiryField
  error?: string
  hint?: string
  wide?: boolean
  optional?: boolean
  children: (props: ControlProps) => ReactNode
}

function Field({ label, field, error, hint, wide, optional, children }: FieldProps) {
  const id = `enquiry-${field}`
  const messageId = useId()
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <label htmlFor={id} className="flex items-baseline justify-between text-[0.64rem] uppercase tracking-label text-ink-soft">
        {label}
        {optional && <span className="normal-case tracking-normal text-muted">Optional</span>}
        {hint && !error && <span className="normal-case tracking-normal text-muted">{hint}</span>}
      </label>
      {children({
        id,
        name: field,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? messageId : undefined,
        required: !optional,
        className: cn(
          'mt-2 block w-full border-0 border-b bg-transparent px-0 py-2 text-[1.05rem] text-ink outline-none transition-colors focus:border-forest-900 sm:text-base',
          error ? 'border-error' : 'border-forest-900/70',
        ),
      })}
      {error && (
        <p id={messageId} className="mt-2 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}

type Outcome = Exclude<EnquiryResult, { status: 'invalid' } | { status: 'failed' }>

function Sent({ result, enquiry, onEdit }: { result: Outcome; enquiry: Enquiry; onEdit: () => void }) {
  const first = enquiry.name.trim().split(/\s+/)[0]
  return (
    <div role="status" className="py-4">
      <p className="text-[0.64rem] uppercase tracking-label text-ink-soft">Thank you</p>
      <h3 className="mt-4 font-serif text-4xl font-light leading-tight">
        {result.status === 'sent' && `Thank you, ${first}.`}
        {result.status === 'handed-off' && `Almost there, ${first}.`}
        {result.status === 'not-connected' && `Your enquiry is ready, ${first}.`}
      </h3>
      <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
        {result.status === 'sent' && (
          <>
            Your enquiry has been sent. We will reply personally with availability and rates.
            {result.copySent && ` A copy is on its way to ${enquiry.email.trim()}.`}
          </>
        )}
        {result.status === 'handed-off' && result.channel === 'whatsapp' && 'WhatsApp has opened with your enquiry typed out. Press send there and we will reply personally.'}
        {result.status === 'handed-off' && result.channel === 'email' && 'Your email app has opened with your enquiry. Press send there and we will reply personally.'}
        {result.status === 'not-connected' && (
          <>
            Online enquiries are not switched on yet, so nothing has been sent. <Pending note="enquiry channel" />
          </>
        )}
      </p>
      <dl className="mt-8 grid max-w-sm grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-5 text-sm">
        <dt className="text-muted">Arrival</dt>
        <dd>{enquiry.checkIn}</dd>
        <dt className="text-muted">Departure</dt>
        <dd>{enquiry.checkOut}</dd>
        <dt className="text-muted">Guests</dt>
        <dd>{enquiry.guests}</dd>
        {result.status === 'sent' && result.reference && (
          <>
            <dt className="text-muted">Reference</dt>
            <dd>{result.reference}</dd>
          </>
        )}
      </dl>
      <Button variant="forest-outline" onClick={onEdit} className="mt-8">
        Change the details
      </Button>
    </div>
  )
}
