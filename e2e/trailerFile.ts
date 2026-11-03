import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, type Page } from '@playwright/test'
import { writeWorkbook, type SheetSpec } from '../src/test/fixtures/workbook'

/* ============================================================
   A NEWER PRICE FILE THAT SETTLES ONE OF REVIEW'S CASES — written for
   Review's walk of J11 ("after a new price file, what is new and what
   was settled"), the way the shelf's own walk writes its Boat Module.

   THE WORKBOOK IS WRITTEN FROM THE PACK'S OWN LINE. Dunbier's
   "ALP 5.3M-13B (1,450kgs) Fibreglass Boat" (trl_dunbier:67, line 398
   of the Trailer Module) is copied back into every column it was read
   from, and only its Rego Type, Rego ($) and Sell inc Rego are
   changed, on purpose, to what the price list itself writes on its
   Large trailers: Dunbier's own ALP 5.3M-13B (trl_dunbier:55) is
   "Large Trailers - Over 1.021t" at $283, and Sell inc Rego is the
   line's Sell plus that rego, as the file adds them. Nothing else is
   invented; the change is the one the test is about.
   ============================================================ */

const DATA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'northside')

interface Field {
  id: string
  description?: string
}
interface Row {
  id: string
  values: Record<string, unknown>
}

const TABLE = 'trl_dunbier'

/** The Trailer Module line of the Fibreglass ALP 5.3M-13B, registered Large as the file's own
 *  Large ALP 5.3M-13B is. */
export function newerTrailerFile(): Uint8Array {
  const entities = JSON.parse(readFileSync(path.join(DATA, 'entities.json'), 'utf8')) as Array<{
    id: string
    fields: Field[]
  }>
  const rows = JSON.parse(readFileSync(path.join(DATA, 'tables', `${TABLE}.json`), 'utf8')) as Row[]
  const entity = entities.find((e) => e.id === TABLE)!
  const line = rows.find((r) => r.id === `${TABLE}:67`)!
  const large = rows.find((r) => r.id === `${TABLE}:55`)!
  const cited = entity.fields.filter((f) => {
    const letters = f.id.slice(TABLE.length + 1)
    return (
      /^[a-z]{1,3}$/.test(letters) &&
      (f.description ?? '').includes(`Trailer Module!${letters.toUpperCase()}`)
    )
  })
  const cells: Record<string, string | number> = {}
  for (const f of cited) {
    const v = line.values[f.id]
    if (typeof v === 'number' || (typeof v === 'string' && v !== ''))
      cells[f.id.slice(TABLE.length + 1).toUpperCase()] = v
  }
  const fee = Number(large.values[`${TABLE}.bz`])
  cells.BY = String(large.values[`${TABLE}.by`])
  cells.BZ = fee
  cells.CA = Number(line.values[`${TABLE}.bw`]) + fee
  const at = Number(String(line.values[`${TABLE}.src`]).split('!R')[1])
  const sheet: SheetSpec = { name: 'Trailer Module', lines: [{ at, cells }] }
  return writeWorkbook([sheet])
}

/** Bring the newer file in on Shelf and apply it, as a dealer does. */
export async function bringInTheNewerFile(page: Page): Promise<void> {
  await page.goto('/shelf')
  await expect(page.locator('[data-testid="shelf"][data-read]')).toBeVisible({ timeout: 30_000 })
  await page.getByTestId('shelf-workbook').setInputFiles({
    name: 'Trailer Module (2).xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(newerTrailerFile()),
  })
  await expect(
    page.getByText('Trailer Module (2).xlsx is read. Nothing is written yet.'),
  ).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'See every change' }).click()
  await page.getByRole('button', { name: /^Apply \d+ changes?$/ }).click()
  await expect(page.getByText(/^\d+ changes? (is|are) on the price list\.$/)).toBeVisible()
}
