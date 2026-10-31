import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { idOnScreen, issueIt, openTheDocument, startAQuote, written } from '../mint'
import { HOME_READY } from '../routes'

/* ============================================================
   SETTINGS — what the rulers cannot see. Milestone 4's exit criterion,
   Settings' half of it, pressed and read rather than counted:

     · Northside's details set once on /manage print on the next quote
       given: its name, its mark in dark ink, its ABN, its phone, who
       prepared it with their title and phone, and the day it stands
       until — read off the printed quote's own letterhead;
     · /manage edited again afterwards, the given quote prints exactly
       what it printed before, after a reload;
     · a colour refused at the floor is refused with its ratio and the
       nearest that pass; one tried shows on the stage as "changed, not
       kept" and, kept, is written into the one style element every
       screen reads;
     · a section hidden on /manage is gone from Home and comes back in
       one press, and Home's own "Arrange Home" opens Settings there;
     · a line opened stands clear of the pill.

   Every value typed is typed here, at the desk, by the walk; nothing is
   planted. The ABN is the Australian Business Register's own published
   example, whose digits add up as every ABN's do.
   ============================================================ */

const ABN = '51 824 753 556'
const ABN_LATER = '53 004 085 616'

async function toSettings(page: Page, search = ''): Promise<void> {
  await page.goto(`/manage${search}`)
  await expect(page.locator('[data-testid="manage"][data-read]')).toBeVisible({ timeout: 30_000 })
}

/** Open a letterhead line or a quote line, type into it and keep it. */
async function setLine(page: Page, open: RegExp | string, field: string, value: string) {
  await page.getByRole('button', { name: open }).click()
  const box = page.getByRole('textbox', { name: field, exact: true })
  await box.fill(value)
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByTestId('manage-editor')).toHaveCount(0)
}

test('the details set on /manage print on the next quote given, and never move on it again', async ({
  page,
}) => {
  test.setTimeout(240_000)
  const id = await startAQuote(page)
  await written(page)

  await toSettings(page)
  /* the letterhead is drawn on the draft the walk just started, never on a made-up quote */
  await expect(page.getByText(/^Drawn on .+, the newest quote on this computer./)).toBeVisible()
  await setLine(page, /^ABN — none given/, 'ABN', ABN)
  await setLine(page, /^Phone — none given/, 'Phone', '07 3265 1022')
  await setLine(page, 'Set a quote stands for', 'A quote stands for', '30')
  await page.getByRole('button', { name: 'Keep Asaf as a person' }).click()
  await page.getByRole('textbox', { name: 'Title' }).fill('Sales manager')
  await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('0400 111 222')
  await page.getByTestId('manage-person').getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByText('Sales manager')).toBeVisible()
  await written(page)

  /* the draft is given on the build, and its printed quote opened from the finale */
  await page.goto(`/quote/${id}`)
  await expect(page.getByTestId('configurator')).toBeVisible({ timeout: 30_000 })
  expect(idOnScreen(page)).toBe(id)
  await issueIt(page)
  await openTheDocument(page)

  const head = page.getByTestId('document').getByTestId('letterhead')
  await expect(head.getByRole('img', { name: 'Northside Marine' })).toBeVisible()
  await expect(head).toContainText(`ABN ${ABN}`)
  await expect(head).toContainText('07 3265 1022')
  await expect(head).toContainText(/Valid until \d{1,2} \w+ \d{4}/)
  const money = page.locator('.doc-money')
  await expect(money).toContainText('Prepared by')
  await expect(money).toContainText('Sales manager')
  await expect(money).toContainText('0400 111 222')
  const printed = await head.innerText()
  const documentAt = page.url()
  await written(page)

  /* /manage is edited again: a new ABN */
  await toSettings(page)
  await page.getByRole('button', { name: `ABN, ABN ${ABN} — change it` }).click()
  await page.getByRole('textbox', { name: 'ABN', exact: true }).fill(ABN_LATER)
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await expect(
    page.getByRole('button', { name: `ABN, ABN ${ABN_LATER} — change it` }),
  ).toBeVisible()
  await written(page)

  /* the given quote prints what it printed before, read again after a reload */
  await page.goto(documentAt)
  await expect(page.locator('.doc-page__foot').first()).toContainText(/Page 1 of \d+/, {
    timeout: 30_000,
  })
  const again = page.getByTestId('document').getByTestId('letterhead')
  await expect(again).toContainText(`ABN ${ABN}`)
  await expect(again).not.toContainText(ABN_LATER)
  expect(await again.innerText()).toBe(printed)
})

test('a colour is refused at the floor with the nearest that pass, and one tried is kept for every screen', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await toSettings(page)
  await page.getByRole('textbox', { name: 'Any other colour' }).fill('#FFEA28')
  await page.getByRole('button', { name: 'Try it' }).click()
  const refused = page.getByTestId('manage-colour-refused')
  await expect(refused).toContainText('White on #FFEA28 is 1.23 : 1, under the 4.5 : 1')
  await expect(refused.getByRole('button')).toHaveCount(2)
  await expect(page.getByTestId('manage-staged')).toHaveCount(0)

  await page.getByRole('button', { name: /^From the mark, #0066CC/ }).click()
  const staged = page.getByTestId('manage-staged')
  await expect(staged).toContainText('Colour #0066CC in place of #1A65BD')
  /* the stage wears it before it is kept; the app does not */
  const look = () => page.evaluate(() => document.getElementById('hl2-look')?.textContent ?? '')
  expect(await look()).not.toContain('--color-blue-600')
  await staged.getByRole('button', { name: 'Keep' }).click()
  await expect(staged).toHaveCount(0)
  await expect.poll(look).toContain('--color-blue-600')

  /* and it stands after a reload, on another screen */
  await written(page)
  await page.goto('/quotes')
  await expect.poll(look).toContain('--color-blue-600')
})

test('a section hidden on /manage is gone from Home and back in one press; Home’s Arrange opens it', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await expect(page.locator('.home-makers')).toBeVisible()
  await page.getByRole('button', { name: 'Arrange Home' }).click()
  await expect(page).toHaveURL(/\/manage\?at=home/)
  await expect(page.locator('[data-testid="manage"][data-read]')).toBeVisible({ timeout: 30_000 })
  /* it LANDS there: the critique found it at the top of Settings, 4,360px above Home's section */
  await expect(page.getByRole('heading', { name: 'Home', exact: true })).toBeInViewport()

  const makers = page.locator('.mg-section').filter({ hasText: 'What Northside sells' })
  await makers.getByRole('switch', { name: 'Shown' }).click()
  await expect(makers.getByRole('switch', { name: 'Hidden' })).toBeVisible()
  await written(page)
  await page.goto('/')
  await expect(page.locator(HOME_READY)).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.home-makers')).toHaveCount(0)

  await toSettings(page)
  await page
    .locator('.mg-section')
    .filter({ hasText: 'What Northside sells' })
    .getByRole('switch', { name: 'Hidden' })
    .click()
  await written(page)
  await page.goto('/')
  await expect(page.locator('.home-makers')).toBeVisible({ timeout: 30_000 })
})

test('a line opened stands clear of the pill', async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await toSettings(page, '?line=abn')
  const editor = page.getByTestId('manage-editor')
  await expect(editor).toBeVisible()
  await editor.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const clear = await page.evaluate(() => {
    const pill = document.querySelector('[data-testid="shell-pill"]')?.getBoundingClientRect()
    const box = document.querySelector('[data-testid="manage-editor"]')?.getBoundingClientRect()
    if (!pill || !box) return false
    const overlaps =
      box.left < pill.right &&
      box.right > pill.left &&
      box.top < pill.bottom &&
      box.bottom > pill.top
    return !overlaps
  })
  expect(clear).toBe(true)
})

test('in a hand, a long address never pushes the page sideways and the stamp stays on the sheet', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await throughTheDoor(page)
  await toSettings(page)
  await setLine(
    page,
    /^Street address — none given/,
    'Street address',
    'Unit 4, 1234 Gympie Road, Strathpine-Lawnton Industrial Estate, Brisbane QLD 4500',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  const inside = await page.evaluate(() => {
    const sheet = document.querySelector('[data-testid="manage-letterhead"]')
    const stamp = sheet?.querySelector('.doc-cover__stamp')
    if (!sheet || !stamp) return false
    const a = sheet.getBoundingClientRect()
    const b = stamp.getBoundingClientRect()
    return b.right <= a.right + 0.5 && b.left >= a.left - 0.5
  })
  expect(inside).toBe(true)
})
