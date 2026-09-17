import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   HOME, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   The figures asserted here are not typed into this file: they are
   computed from `data/northside/` — the same files the browser fetches
   — and then looked for on the screen. So this fails when the screen
   drifts from the file, when the file drifts from the screen, and when
   a table does not arrive at all, which is the one case a unit test
   cannot see.

   It runs under all six viewport projects, so every assertion is one
   that must hold in a hand as well as on a desk. Nothing here asserts
   a position: the reflow is measured by the rulers.
   ============================================================ */

const DATA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'data',
  'northside',
)
const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(DATA, file), 'utf8')) as T

interface ManifestTable {
  id: string
  rowCount: number
}
interface Manifest {
  name: string
  tables: ManifestTable[]
}
interface Table {
  id: string
  name: string
  kind: string
  role: string
}

const manifest = readJson<Manifest>('manifest.json')
const tables = readJson<Table[]>('entities.json')
const rowsOf = (id: string): number => manifest.tables.find((t) => t.id === id)?.rowCount ?? 0
const sum = (list: Table[]): number => list.reduce((n, t) => n + rowsOf(t.id), 0)

const base = tables.filter((t) => t.role !== 'join')
const joins = tables.filter((t) => t.role === 'join')
const boats = base.filter((t) => t.kind === 'boat')
const au = (n: number): string => n.toLocaleString('en-AU')

test('home counts the file it actually loaded, and says what it cannot do yet', async ({
  page,
}) => {
  const errors: string[] = []
  const missed: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('requestfailed', (r) => missed.push(r.url()))

  /* Home is reached the way a person reaches it: a name at the door
     and the blue door pressed. There is no other way — this screen
     reads what this browser has kept, never the file. */
  await throughTheDoor(page)
  await expect(page.getByTestId('home')).toBeVisible()

  /* ---- the stamp: the sheet, as it arrived ---------------- */
  const stamp = page.getByTestId('pack-counts')
  await expect(stamp).toBeVisible({ timeout: 30_000 })
  await expect(stamp.getByText(au(tables.length), { exact: true })).toBeVisible()
  await expect(stamp.getByText(au(sum(tables)), { exact: true })).toBeVisible()
  await expect(stamp.getByText(au(joins.length), { exact: true })).toBeVisible()

  /* the business is named from what was opened, never typed in */
  await expect(page.getByText(manifest.name, { exact: true }).first()).toBeVisible()

  /* ---- what they sell: one figure per kind, counted ------- */
  const sells = page.getByRole('region', { name: 'What this business sells' })
  const kinds = ['boat', 'motor', 'trailer', 'package', 'accessory', 'custom']
  for (const kind of kinds) {
    const rows = sum(base.filter((t) => t.kind === kind))
    await expect(sells.getByText(au(rows), { exact: true }).first()).toBeVisible()
  }
  /* and no invented total: the sum of the six is a row count, never a
     count of boats for sale */
  await expect(
    sells.getByText('A row is a line of the price file, not a boat on the floor.'),
  ).toBeVisible()

  /* ---- the makers, with the ledger's own gap -------------- */
  const shelf = page.getByRole('region', { name: 'The boat makers' })
  for (const boat of boats) {
    await expect(shelf.getByText(`${au(rowsOf(boat.id))} rows`).first()).toBeVisible()
  }
  await expect(shelf.getByRole('listitem')).toHaveCount(boats.length)
  /* Stabicraft has no mark in the ledger, so it is named in type and
     the reason is printed under the shelf */
  const stabicraft = shelf.getByRole('listitem').filter({ hasText: 'Stabicraft' })
  await expect(stabicraft.locator('img')).toHaveCount(0)
  await expect(shelf.getByText(/no public wordmark verified/)).toBeVisible()
  /* the makers that do hold one draw it, and no mark is enlarged */
  const marks = shelf.locator('img')
  await expect(marks).toHaveCount(boats.length - 1)
  for (let i = 0; i < boats.length - 1; i += 1) {
    const mark = marks.nth(i)
    const drawn = await mark.evaluate((el) => {
      const image = el as HTMLImageElement
      return { natural: image.naturalWidth, width: image.getBoundingClientRect().width }
    })
    expect(drawn.natural, 'the mark loaded').toBeGreaterThan(0)
    expect(drawn.width).toBeLessThanOrEqual(drawn.natural)
  }

  /* ---- the two photographs, neither enlarged -------------- */
  const fold = page.getByRole('region', { name: 'Two boats from the file' })
  const pictures = fold.locator('img')
  await expect(pictures).toHaveCount(2)
  for (const index of [0, 1]) {
    const drawn = await pictures.nth(index).evaluate((el) => {
      const image = el as HTMLImageElement
      const box = image.getBoundingClientRect()
      return {
        natural: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        width: box.width,
        height: box.height,
      }
    })
    expect(drawn.natural, 'the photograph loaded').toBeGreaterThan(0)
    expect(drawn.width).toBeLessThanOrEqual(drawn.natural)
    expect(drawn.height).toBeLessThanOrEqual(drawn.naturalHeight)
  }

  /* ---- the act that cannot act, and says so --------------- */
  const act = page.getByRole('button', { name: 'New quote' })
  await expect(act).toBeVisible()
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByText(/The picker is not built yet/)).toBeVisible()

  /* ---- the drafts, which is the true empty state ---------- */
  const drafts = page.getByRole('region', { name: 'Open drafts' })
  await expect(drafts.getByTestId('draft-count')).toHaveText('0')
  await expect(
    drafts.getByText(/No customer, no quote and no draft exists in this browser yet/),
  ).toBeVisible()

  /* ---- the search field is real ------------------------- */
  const field = page.getByRole('searchbox', { name: /Search the file/ })
  await expect(field).toHaveAttribute('placeholder', `Search ${au(sum(tables))} rows`)
  await page.keyboard.press('Control+k')
  await expect(field).toBeFocused()
  await field.fill('crossfire')
  await expect(page.getByText(/rows carry that word/)).toBeVisible()

  expect(errors, 'no page error').toEqual([])
  expect(missed, 'every picture and every table arrived').toEqual([])
})

test('the second visit draws the same screen without reading the file again', async ({ page }) => {
  let packRequests = 0
  await page.route('**/data/northside/**', (route) => {
    packRequests += 1
    return route.continue()
  })

  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/read from the file/)).toBeVisible()
  const onFirstVisit = packRequests

  await page.reload()
  const stamp = page.getByTestId('pack-counts')
  await expect(stamp).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/read from this browser/)).toBeVisible()
  await expect(stamp.getByText(au(sum(tables)), { exact: true })).toBeVisible()

  /* THE PICTURE LEDGERS RIDE IN THE BUNDLE, which is what makes this
     pass: a screen that fetched them on every paint would read the
     file again on a visit that is supposed to read nothing. */
  expect(packRequests, 'the second visit fetched nothing').toBe(onFirstVisit)
})
