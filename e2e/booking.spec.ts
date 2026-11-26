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

/** Opens the form and fills in a complete enquiry. */
async function fillComplete(page: Page) {
  const form = await openForm(page)
  await form.getByLabel('Check-in').fill(day(30))
  await form.getByLabel('Check-out').fill(day(34))
  await form.getByLabel('Guests').fill('4')
  await form.getByLabel('Full name').fill('Ana Perera')
  await form.getByLabel('Email').fill('ana@example.com')
  await form.getByLabel('Phone').fill('+94 77 123 4567')
  await form.getByLabel('Message').fill('Arriving in the afternoon.')
  return form
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

  test('a complete enquiry is sent to the backend, which emails it; the guest sees the reference', async ({ page }) => {
    let posted: Record<string, unknown> | null = null
    await page.route('**/api/enquiries', async (route) => {
      posted = route.request().postDataJSON() as Record<string, unknown>
      await route.fulfill({ status: 201, json: { status: 'sent', reference: 'HH-261126-K7QM', copySent: true } })
    })
    const form = await fillComplete(page)
    await form.getByRole('button', { name: 'Submit enquiry' }).click()

    const status = page.locator('#book').getByRole('status')
    await expect(status.getByRole('heading', { name: 'Thank you, Ana.' })).toBeVisible()
    await expect(status.getByText('Your enquiry has been sent.')).toBeVisible()
    await expect(status.getByText('A copy is on its way to ana@example.com.')).toBeVisible()
    await expect(status.getByText('HH-261126-K7QM')).toBeVisible()
    await expect(status.locator('[data-pending]')).toHaveCount(0)

    expect(posted).toEqual({
      checkIn: day(30),
      checkOut: day(34),
      guests: '4',
      name: 'Ana Perera',
      email: 'ana@example.com',
      phone: '+94 77 123 4567',
      message: 'Arriving in the afternoon.',
      website: '',
    })

    await status.getByRole('button', { name: 'Change the details' }).click()
    await expect(page.getByRole('form', { name: 'Booking enquiry' }).getByLabel('Full name')).toHaveValue('Ana Perera')
  })

  test('until the owner address is set on the backend it says nothing was sent', async ({ page }) => {
    await page.route('**/api/enquiries', (route) => route.fulfill({ status: 503, json: { status: 'not_connected' } }))
    const form = await fillComplete(page)
    await form.getByRole('button', { name: 'Submit enquiry' }).click()

    const status = page.locator('#book').getByRole('status')
    await expect(status.getByRole('heading', { name: 'Your enquiry is ready, Ana.' })).toBeVisible()
    await expect(status.getByText('nothing has been sent')).toBeVisible()
    await expect(status.getByText(day(30))).toBeVisible()
  })

  test('a problem the backend finds is shown under its field', async ({ page }) => {
    await page.route('**/api/enquiries', (route) =>
      route.fulfill({
        status: 422,
        json: { message: 'invalid', errors: { checkIn: ['That arrival date is too far ahead to enquire about yet.'] } },
      }),
    )
    const form = await fillComplete(page)
    await form.getByRole('button', { name: 'Submit enquiry' }).click()

    await expect(form.getByText('That arrival date is too far ahead to enquire about yet.')).toBeVisible()
    await expect(form.getByLabel('Check-in')).toBeFocused()
    await expect(form.getByLabel('Check-in')).toHaveAttribute('aria-invalid', 'true')
  })

  test('when sending fails it says so, keeps the details, and a second try can go through', async ({ page }) => {
    let calls = 0
    await page.route('**/api/enquiries', (route) => {
      calls += 1
      return calls === 1
        ? route.fulfill({ status: 502, json: { status: 'failed', message: 'We could not send your enquiry just now.' } })
        : route.fulfill({ status: 201, json: { status: 'sent', reference: 'HH-261126-ABCD', copySent: false } })
    })
    const form = await fillComplete(page)
    await form.getByRole('button', { name: 'Submit enquiry' }).click()

    await expect(form.getByRole('alert')).toHaveText('We could not send your enquiry just now.')
    await expect(form.getByLabel('Full name')).toHaveValue('Ana Perera')

    await form.getByRole('button', { name: 'Submit enquiry' }).click()
    const status = page.locator('#book').getByRole('status')
    await expect(status.getByRole('heading', { name: 'Thank you, Ana.' })).toBeVisible()
    await expect(status.getByText('A copy is on its way')).toHaveCount(0)
  })

  test('when the backend cannot be reached it asks the guest to try again', async ({ page }) => {
    await page.route('**/api/enquiries', (route) => route.abort('connectionrefused'))
    const form = await fillComplete(page)
    await form.getByRole('button', { name: 'Submit enquiry' }).click()

    await expect(form.getByRole('alert')).toContainText('Please try again in a few minutes')
    await expect(form.getByRole('button', { name: 'Submit enquiry' })).toBeEnabled()
  })

  test('the hidden spam trap cannot be reached with the keyboard or a screen reader', async ({ page }) => {
    const form = await openForm(page)
    const trap = form.locator('input[name="website"]')
    await expect(trap).toHaveAttribute('tabindex', '-1')
    await expect(trap).toHaveCount(1)
    // Inside aria-hidden, so it is not in the accessibility tree.
    await expect(form.getByRole('textbox', { name: 'Leave this empty' })).toHaveCount(0)
    await expect(form.getByRole('textbox', { name: 'Full name' })).toHaveCount(1)
  })
})
