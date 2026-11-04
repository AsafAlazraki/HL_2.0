import { mkdirSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import sharp from 'sharp'
import { throughTheDoor } from '../door'
import { newerTrailerFile } from '../trailerFile'

/* ============================================================
   THE DOCK CUTS NOTHING IN THE FIRST WINDOW — the section critic's
   finding of 2026-10-31, at every size: the sticky Apply bar covered
   the "other lists" sentence through its second line at 1280, the
   tiles' captions at 390, and after Apply let a card's top edge show
   in the air above it.

   MEASURED IN PIXELS, NOT IN STYLES. The change sheet is shot as it
   opens, and again with everything of the page but the dock's bay
   hidden (visibility only, so nothing moves). Beside the dock, in its
   corners and below it to the window's foot (or the phone's tab bar) the two shots must be the
   same pixels to the compositor's rounding: nothing of the page shows there. In the strip just
   above the dock's edge the page may show only faintly, fading under.

   The workbook is Review's newer Trailer Module (e2e/trailerFile.ts),
   written from the pack's own line; nothing is invented. Shots are
   written into docs only when HL2_SHELF_DOCK_SHOTS is set.
   ============================================================ */

const OUT = 'docs/directions/data-round/shelf/dock'

async function raw(page: Page) {
  const { data, info } = await sharp(await page.screenshot())
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, channels: info.channels }
}

/** The dock's first window measured: the most any pixel beside or below it differs from the bare
 *  ground, and the most one differs in the strip just above its edge. */
async function measure(page: Page, label: string) {
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const box = await page.evaluate(() => {
    const d = document.querySelector('.sf-dock')!.getBoundingClientRect()
    return {
      top: Math.ceil(d.top),
      bottom: Math.floor(d.bottom),
      left: Math.floor(d.left),
      right: Math.ceil(d.right),
      inner: window.innerHeight,
      /* the phone's tab bar, at the foot, is the shell's and is read by its own rulers */
      foot: Math.floor(
        Math.min(
          window.innerHeight,
          ...[...document.querySelectorAll('.way-pill')]
            .map((el) => el.getBoundingClientRect().top)
            .filter((t) => t > d.bottom),
        ),
      ),
      page: document.documentElement.scrollHeight,
    }
  })
  if (process.env.HL2_SHELF_DOCK_SHOTS) {
    mkdirSync(OUT, { recursive: true })
    await page.screenshot({ path: `${OUT}/${size}-${label}.png` })
  }
  const seen = await raw(page)
  const hide = await page.addStyleTag({
    content:
      '[data-see="changes"] > :not(.sf-bay) { visibility: hidden !important; } [data-see="changes"] * { transition: none !important; }',
  })
  await page.waitForTimeout(200)
  const bare = await raw(page)
  await hide.evaluate((el) => (el as Element).remove())

  const most = (x0: number, x1: number, y0: number, y1: number) => {
    let m = 0
    for (let y = Math.max(0, y0); y < y1; y++)
      for (let x = Math.max(0, x0); x < Math.min(x1, seen.width); x++)
        for (let c = 0; c < 3; c++) {
          const i = (y * seen.width + x) * seen.channels + c
          m = Math.max(m, Math.abs(seen.data[i]! - bare.data[i]!))
        }
    return m
  }
  const beside = Math.max(
    most(0, box.left, box.top, box.bottom),
    most(box.right, seen.width, box.top, box.bottom),
  )
  const below = most(0, seen.width, box.bottom, box.foot)
  const edge = most(0, seen.width, box.top - 4, box.top)
  console.log(
    `[${size}] ${label}: dock ${box.top}-${box.bottom} of ${box.inner} (${box.page > box.inner ? 'the page scrolls' : 'the page fits'}); beside ${beside}, below ${below}, 4px above ${edge}`,
  )
  /* two levels of a channel are the compositor's rounding of the dock's own shadow; a page's
     word or a card's edge differs by tens */
  expect(beside, `${size} ${label}: the page shows beside the dock`).toBeLessThanOrEqual(2)
  expect(below, `${size} ${label}: the page shows below the dock`).toBeLessThanOrEqual(2)
  /* the strip above the edge is all but ground: the page fades under, it is not cut. Measured
     2026-11-05 at 1280 and 390: 182 with no ground, 30 with a fade one gap long (a card's edge
     and half a cut line still showed), 8 with the fade twice the gap the bay keeps when stuck */
  expect(edge, `${size} ${label}: the page is cut at the dock's edge`).toBeLessThanOrEqual(16)
}

test('the dock cuts nothing in the change sheet’s first window, before Apply and after', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/shelf')
  await expect(page.locator('[data-testid="shelf"][data-read]')).toBeVisible({ timeout: 30_000 })
  await page.getByTestId('shelf-workbook').setInputFiles({
    name: 'Trailer Module.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(newerTrailerFile()),
  })
  await expect(page.getByText('Trailer Module.xlsx is read. Nothing is written yet.')).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole('button', { name: 'See every change' }).click()
  await expect(page.locator('[data-see="changes"]')).toBeVisible()
  await measure(page, 'changes')

  await page.getByRole('button', { name: /^Apply \d+ changes?$/ }).click()
  await expect(page.getByText(/^\d+ changes? (is|are) on the price list\.$/)).toBeVisible({
    timeout: 60_000,
  })
  await measure(page, 'applied')

  /* and its acts are still pressed through the bay */
  await page.locator('.sf-dock').getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('button', { name: /^Apply \d+ changes?$/ })).toBeVisible({
    timeout: 60_000,
  })
})
