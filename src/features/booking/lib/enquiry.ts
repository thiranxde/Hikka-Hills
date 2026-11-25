import { site } from '@/config/site'

export interface Enquiry {
  checkIn: string
  checkOut: string
  guests: string
  name: string
  email: string
  phone: string
  message: string
}

export type EnquiryField = keyof Enquiry
export type EnquiryErrors = Partial<Record<EnquiryField, string>>

export const emptyEnquiry: Enquiry = {
  checkIn: '',
  checkOut: '',
  guests: '2',
  name: '',
  email: '',
  phone: '',
  message: '',
}

/** Today as "yyyy-mm-dd" in the visitor's own time zone (what a date field holds). */
export function todayIso(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

/** The day after a "yyyy-mm-dd" date. */
export function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Checks an enquiry. Returns one message per field that needs fixing; an empty object means it can be sent. */
export function validateEnquiry(e: Enquiry, today = todayIso()): EnquiryErrors {
  const errors: EnquiryErrors = {}

  if (!e.checkIn) errors.checkIn = 'Choose your arrival date.'
  else if (e.checkIn < today) errors.checkIn = 'The arrival date has already passed.'

  if (!e.checkOut) errors.checkOut = 'Choose your departure date.'
  else if (e.checkIn && e.checkOut <= e.checkIn) errors.checkOut = 'Departure must be after arrival.'

  const guests = Number(e.guests)
  if (!e.guests.trim()) errors.guests = 'How many guests?'
  else if (!Number.isInteger(guests) || guests < 1) errors.guests = 'Enter a whole number of guests, at least 1.'
  else if (guests > site.booking.maxGuests) errors.guests = `For more than ${site.booking.maxGuests} guests, tell us in the message.`

  if (e.name.trim().length < 2) errors.name = 'Please enter your name.'

  if (!e.email.trim()) errors.email = 'Please enter your email, so we can reply.'
  else if (!EMAIL.test(e.email.trim())) errors.email = 'That email address does not look right.'

  if (e.phone.trim()) {
    const digits = e.phone.replace(/\D/g, '')
    if (!/^[+\d\s().-]+$/.test(e.phone.trim()) || digits.length < 7 || digits.length > 15) {
      errors.phone = 'Enter a phone number with its country code, e.g. +94 77 123 4567.'
    }
  }

  if (e.message.length > 2000) errors.message = 'Please keep the message under 2,000 characters.'

  return errors
}

/** Number of nights between the two dates, or null if they are not both valid. */
export function nights(e: Pick<Enquiry, 'checkIn' | 'checkOut'>): number | null {
  if (!e.checkIn || !e.checkOut) return null
  const n = (Date.parse(e.checkOut) - Date.parse(e.checkIn)) / 86_400_000
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

/** The enquiry as plain text, for a WhatsApp message or an email body. */
export function enquiryText(e: Enquiry): string {
  const n = nights(e)
  return [
    `Enquiry for ${site.name}`,
    `Arrival: ${e.checkIn}`,
    `Departure: ${e.checkOut}${n ? ` (${n} night${n === 1 ? '' : 's'})` : ''}`,
    `Guests: ${e.guests}`,
    `Name: ${e.name.trim()}`,
    `Email: ${e.email.trim()}`,
    e.phone.trim() ? `Phone: ${e.phone.trim()}` : null,
    e.message.trim() ? `\n${e.message.trim()}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n')
}
