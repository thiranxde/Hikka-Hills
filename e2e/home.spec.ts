import { expect, test } from '@playwright/test'

test.describe('home page', () => {
  test('opens on the hero with both calls to action', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: /hikka\s*hills/i })).toBeVisible()
    await expect(page.getByText('A Private Escape Above the Ordinary.').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Discover the villa' })).toBeVisible()
    await expect(page.getByRole('main').getByRole('link', { name: 'Book your stay' }).first()).toBeVisible()
  })

  test('has every section of the design, in order', async ({ page }) => {
    await page.goto('/')
    const headings = page.getByRole('heading', { level: 2 })
    await expect(headings).toHaveText([
      /A private villa/,
      /Space, light/,
      /Nothing to do/,
      /Photographs/,
      /Where you/,
      /Hikkaduwa,/,
      /Tell us when/,
    ])
  })

  test('"Discover the villa" scrolls to the retreat', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Discover the villa' }).click()
    await expect(page).toHaveURL(/#villa$/)
    await expect(page.getByRole('heading', { name: /A private villa/ })).toBeInViewport()
  })

  test('marks facts the owner has not confirmed yet', async ({ page }) => {
    await page.goto('/')
    const retreat = page.locator('#villa')
    await expect(retreat.getByText('CONFIRM: 2–3 sentences in the owner’s words')).toBeVisible()
    await expect(retreat.locator('[data-pending]')).toHaveCount(3) // the intro plus bedrooms and guests
    await expect(page.locator('#location').getByText('[km / min]')).toHaveCount(4)
  })

  test('every photo slot has a real picture', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Photograph to come')).toHaveCount(0)
    const sources = await page.locator('main img, main video').evaluateAll((els) =>
      els.map((el) => el.getAttribute('src') ?? el.querySelector('source')?.getAttribute('src') ?? el.getAttribute('poster')),
    )
    expect(sources.length).toBeGreaterThan(40)
    for (const src of new Set(sources)) {
      const res = await page.request.get(src!)
      expect(res.status(), src!).toBe(200)
    }
  })

  test('never mentions a pool: the villa has none', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).not.toContainText(/pool/i)
  })

  test('the header turns solid once the page scrolls', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header')
    await expect(header).toHaveClass(/bg-transparent/)
    await page.evaluate(() => window.scrollTo(0, 800))
    await expect(header).toHaveClass(/bg-forest-950/)
  })

  test('an unknown address shows the not-found page', async ({ page }) => {
    await page.goto('/no-such-page')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/This path leads/)
    await page.getByRole('link', { name: 'Back to Hikka Hills' }).click()
    await expect(page.getByRole('heading', { level: 1, name: /hikka\s*hills/i })).toBeVisible()
  })
})

test.describe('desktop menu', () => {
  test.skip(({ isMobile }) => isMobile, 'The phone layout uses the menu button')

  test('each link jumps to its section', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Main' })
    for (const [label, id] of [
      ['Gallery', 'gallery'],
      ['Location', 'location'],
      ['Contact', 'book'],
      ['Experience', 'experience'],
    ] as const) {
      await nav.getByRole('link', { name: label, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`#${id}$`))
      await expect(page.locator(`#${id}`)).toBeInViewport()
    }
  })
})

test.describe('phone menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'Only the phone layout has the menu button')

  test('opens full screen, jumps to a section and closes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open the menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Gallery' })).toBeVisible()
    await menu.getByRole('link', { name: 'Gallery' }).click()
    await expect(menu).toBeHidden()
    await expect(page.locator('#gallery')).toBeInViewport()
  })

  test('closes with Escape or the close button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open the menu' }).click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
    await page.getByRole('button', { name: 'Open the menu' }).click()
    await page.getByRole('button', { name: 'Close the menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
  })
})
