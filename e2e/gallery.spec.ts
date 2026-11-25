import { expect, test } from '@playwright/test'

test.describe('gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#gallery')
  })

  test('filters by category, and offers only categories that have pictures', async ({ page }) => {
    const gallery = page.locator('#gallery')
    const filters = gallery.getByRole('group', { name: 'Show' })
    await expect(filters.getByRole('button')).toHaveText(['All', 'Exterior', 'Interiors', 'Bedrooms', 'Dining', 'Surroundings', 'Video'])

    const tiles = gallery.getByRole('listitem')
    const all = await tiles.count()
    expect(all).toBeGreaterThan(40)

    await filters.getByRole('button', { name: 'Bedrooms' }).click()
    await expect(filters.getByRole('button', { name: 'Bedrooms' })).toHaveAttribute('aria-pressed', 'true')
    await expect(tiles).toHaveCount(8)

    await filters.getByRole('button', { name: 'Dining' }).click()
    await expect(tiles).toHaveCount(4)

    await filters.getByRole('button', { name: 'Video' }).click()
    await expect(tiles).toHaveCount(5)
    await expect(gallery.getByRole('button', { name: /^Play video/ })).toHaveCount(5)

    await filters.getByRole('button', { name: 'All' }).click()
    await expect(tiles).toHaveCount(all)
  })

  test('the lightbox browses the current filter and closes with Escape', async ({ page }) => {
    const gallery = page.locator('#gallery')
    await gallery.getByRole('button', { name: 'Bedrooms', exact: true }).click()
    const first = gallery.getByRole('button', { name: /^Enlarge photo/ }).first()
    await first.click()

    const box = page.getByRole('dialog', { name: 'Gallery' })
    await expect(box).toBeVisible()
    await expect(box.getByText('01 / 08 · Bedrooms')).toBeVisible()
    await expect(box.getByRole('img')).toBeVisible()

    await page.keyboard.press('ArrowRight')
    await expect(box.getByText('02 / 08 · Bedrooms')).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(box.getByText('08 / 08 · Bedrooms')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(box).toBeHidden()
    await expect(first).toBeFocused()
  })

  test('a video opens with player controls', async ({ page }) => {
    await page.locator('#gallery').getByRole('button', { name: /^Play video/ }).first().click()
    const box = page.getByRole('dialog', { name: 'Gallery' })
    const video = box.locator('video')
    await expect(video).toBeVisible()
    await expect(video).toHaveAttribute('controls', '')
    await box.getByRole('button', { name: 'Close' }).click()
    await expect(box).toBeHidden()
  })

  test('next and previous buttons move through the pictures', async ({ page }) => {
    await page.locator('#gallery').getByRole('button', { name: /^Enlarge photo/ }).first().click()
    const box = page.getByRole('dialog', { name: 'Gallery' })
    const counter = box.getByText(/^\d\d \/ \d\d · /)
    await expect(counter).toHaveText(/^01 \//)
    // Phones have the buttons under the picture, wider screens beside it: use whichever is shown.
    await box.getByRole('button', { name: 'Next' }).filter({ visible: true }).click()
    await expect(counter).toHaveText(/^02 \//)
    await box.getByRole('button', { name: 'Previous' }).filter({ visible: true }).click()
    await expect(counter).toHaveText(/^01 \//)
  })

  test('every picture file exists', async ({ page, request }) => {
    const sources = await page.locator('#gallery img').evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).getAttribute('src')))
    for (const src of new Set(sources)) {
      const res = await request.get(src!)
      expect(res.status(), src!).toBe(200)
    }
  })
})
