import { expect, test, type Page } from '@playwright/test'

/** A date `days` from today, as a date field holds it (yyyy-mm-dd, local time). */
function day(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

async function openForm(page: Page) {
  await page.goto('/#book')
  return page.getByRole('form', { name: 'Booking enquiry' })
}

test.describe('booking enquiry', () => {
  test('says what is missing when sent empty, and focuses the first field to fix', async ({ page }) => {
    const form = await openForm(page)
    await form.getByLabel('Guests').fill('')
    await form.getByRole('button', { name: 'Submit enquiry' }).click()

    await expect(form.getByText('Choose your arrival date.')).toBeVisible()
    await expect(form.getByText('Choose your departure date.')).toBeVisible()
    await expect(form.getByText('How many guests?')).toBeVisible()
    await expect(form.getByText('Please enter your name.')).toBeVisible()
    await expect(form.getByText('Please enter your email, so we can reply.')).toBeVisible()
    await expect(form.getByLabel('Check-in')).toBeFocused()
    await expect(form.getByLabel('Check-in')).toHaveAttribute('aria-invalid', 'true')
    // Phone and message are optional.
    await expect(form.getByLabel('Phone')).toHaveAttribute('aria-invalid', 'false')
  })

  test('checks the dates, guest count, email and phone', async ({ page }) => {
    const form = await openForm(page)
    await form.getByLabel('Check-in').fill(day(-2))
    await form.getByLabel('Check-out').fill(day(-3))
    await form.getByLabel('Guests').fill('0')
    await form.getByLabel('Full name').fill('Ana Perera')
    await form.getByLabel('Email').fill('ana@example')
    await form.getByLabel('Phone').fill('12')
    await form.getByRole('button', { name: 'Submit enquiry' }).click()

    await expect(form.getByText('The arrival date has already passed.')).toBeVisible()
    await expect(form.getByText('Departure must be after arrival.')).toBeVisible()
    await expect(form.getByText(/whole number of guests/)).toBeVisible()
    await expect(form.getByText('That email address does not look right.')).toBeVisible()
    await expect(form.getByText(/phone number with its country code/)).toBeVisible()

    // Errors clear as the fields are corrected.
    await form.getByLabel('Email').fill('ana@example.com')
    await expect(form.getByText('That email address does not look right.')).toBeHidden()
  })

  test('moving check-in past check-out pushes check-out to the next day', async ({ page }) => {
    const form = await openForm(page)
    await form.getByLabel('Check-in').fill(day(10))
    await form.getByLabel('Check-out').fill(day(12))
    await expect(form.getByText('2 nights')).toBeVisible()
    await form.getByLabel('Check-in').fill(day(14))
    await expect(form.getByLabel('Check-out')).toHaveValue(day(15))
  })

  test('a complete enquiry is accepted; until a channel is set up it says nothing was sent', async ({ page }) => {
    const form = await openForm(page)
    await form.getByLabel('Check-in').fill(day(30))
    await form.getByLabel('Check-out').fill(day(34))
    await form.getByLabel('Guests').fill('4')
    await form.getByLabel('Full name').fill('Ana Perera')
    await form.getByLabel('Email').fill('ana@example.com')
    await form.getByLabel('Phone').fill('+94 77 123 4567')
    await form.getByLabel('Message').fill('Arriving in the afternoon.')
    await form.getByRole('button', { name: 'Submit enquiry' }).click()

    const status = page.locator('#book').getByRole('status')
    await expect(status.getByRole('heading', { name: 'Your enquiry is ready, Ana.' })).toBeVisible()
    await expect(status.getByText('nothing has been sent')).toBeVisible()
    await expect(status.getByText(day(30))).toBeVisible()

    await status.getByRole('button', { name: 'Change the details' }).click()
    await expect(page.getByRole('form', { name: 'Booking enquiry' }).getByLabel('Full name')).toHaveValue('Ana Perera')
  })
})
