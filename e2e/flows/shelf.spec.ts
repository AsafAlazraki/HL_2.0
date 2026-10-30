import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { DEEPEST, issueIt, openTheDocument, startAQuote, written } from '../mint'
import { writeWorkbook, type SheetSpec } from '../../src/test/fixtures/workbook'

/* ============================================================
   THE SHELF — what the rulers cannot see. Milestone 4's exit criterion,
   the shelf's half of it, pressed and read rather than counted:

     · a new version of the price list comes in as an Excel workbook,
       every change is shown before anything is written, it applies as
       one step and undoes as one, and a quote already given does not
       move: its printed figures read the same before and after;
     · a copy of Northside's work is saved to the computer's Downloads,
       everything on this computer is forgotten, and the copy brought
       back into the fresh computer returns the quote it held.

   THE WORKBOOK IS WRITTEN HERE FROM THE PACK'S OWN LINES. Each line of
   the deepest model's boats is copied back into the Boat Module's
   columns it was read from — every column that cites its sheet — and
   only Cash (column QR) is changed, by a thousand dollars, on purpose.
   Nothing is planted in IndexedDB: the quote is a walk, the copy is a
   real download, and the restore is the screen's own button.
   ============================================================ */

const DATA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'data',
  'northside',
)

interface Field {
  id: string
  description?: string
}
interface Entity {
  id: string
  fields: Field[]
}

const entities = JSON.parse(readFileSync(path.join(DATA, 'entities.json'), 'utf8')) as Entity[]

/** The Boat Module lines the deepest model's boats were read from, Cash raised by 1,000. */
function boatModule(): { sheet: SheetSpec; lines: number } {
  const table = DEEPEST.table.id
  const entity = entities.find((e) => e.id === table)!
  const cited = entity.fields.filter((f) => {
    const letters = f.id.slice(table.length + 1)
    return (
      f.id.startsWith(`${table}.`) &&
      /^[a-z]{1,3}$/.test(letters) &&
      (f.description ?? '').includes(`Boat Module!${letters.toUpperCase()}`)
    )
  })
  const lines = DEEPEST.rows.map((row) => {
    const cells: Record<string, string | number> = {}
    for (const f of cited) {
      const v = row.values[f.id]
      if (typeof v === 'number' || (typeof v === 'string' && v !== '')) {
        cells[f.id.slice(table.length + 1).toUpperCase()] = v
      }
    }
    cells.QR = Number(row.values[`${table}.qr`]) + 1000
    const at = Number(String(row.values[`${table}.src`]).split('!R')[1])
    return { at, cells }
  })
  return { sheet: { name: 'Boat Module', lines }, lines: lines.length }
}

/** The Australian Business Register's own published example, as Settings' flow uses it. */
const ABN = '51 824 753 556'

async function toSettings(page: Page): Promise<void> {
  await page.goto('/manage')
  await expect(page.locator('[data-testid="manage"][data-read]')).toBeVisible({ timeout: 30_000 })
}

/** Open a letterhead line on Settings, type into it and keep it. */
async function setLine(page: Page, open: RegExp | string, field: string, value: string) {
  await page.getByRole('button', { name: open }).click()
  await page.getByRole('textbox', { name: field, exact: true }).fill(value)
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByTestId('manage-editor')).toHaveCount(0)
}

const shelfReady = (page: Page) =>
  expect(page.locator('[data-testid="shelf"][data-read]')).toBeVisible({ timeout: 30_000 })

async function bringIn(page: Page, bytes: Uint8Array): Promise<void> {
  await page.getByTestId('shelf-workbook').setInputFiles({
    name: 'Boat Module (2).xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(bytes),
  })
  await expect(page.getByText('Boat Module (2).xlsx is read. Nothing is written yet.')).toBeVisible(
    {
      timeout: 30_000,
    },
  )
}

test('the shelf: a new price list is shown before it is written, applies, undoes, and moves no quote already given', async ({
  page,
}, info) => {
  test.skip(
    !['desktop', 'phone'].includes(info.project.name),
    'the whole sale is walked at a desk and in a hand; the rulers measure the shelf at all six',
  )
  test.setTimeout(300_000)

  const id = await startAQuote(page)
  await issueIt(page)
  await openTheDocument(page)
  const given = await page.locator('.doc-money').innerText()
  const printed = await page.getByTestId('document').innerText()

  const { sheet, lines } = boatModule()
  const bytes = writeWorkbook([sheet])

  await page.goto('/shelf')
  await shelfReady(page)
  await bringIn(page, bytes)
  /* the band counts the change before anything is written */
  const band = page.getByRole('region', { name: 'A new Master Price File' })
  await expect(band).toContainText(String(lines))

  await page.getByRole('button', { name: 'See every change' }).click()
  await expect(page.locator('[data-see="changes"]')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'lines stay exactly as they are.',
  )
  await expect(page.getByText(`Undo puts all ${lines} back in one step.`)).toBeVisible()
  /* the list is folded to one sentence a dealer reads, its Cash said going up */
  await expect(
    page.getByText(new RegExp(`${lines} lines? changes? at Cash: ${lines} higher`)),
  ).toBeVisible()

  /* EVERY LINE IS NAMED AS A PERSON SAYS IT, never the workbook's cell (built-critique-m4.md,
     major 4): the boat's own words lead, and where it sits in the workbook is said under them */
  await page
    .getByRole('button', { name: new RegExp(`^See the ${lines}$`) })
    .first()
    .click()
  const names = page.locator('.sf-lists .sf-line__name')
  await expect(names).toHaveCount(lines)
  /* the workbook writes every one of these boats "Maker - Model …"; a person never says it so */
  await expect(names.filter({ hasText: / - / })).toHaveCount(0)
  await expect(names.first()).toContainText(/Line \d[\d,]* in the workbook$/)

  const apply = page.getByRole('button', { name: new RegExp(`^Apply ${lines} changes?$`) })
  await apply.click()
  await expect(
    page.getByText(new RegExp(`^${lines} changes? (is|are) on the price list\\.$`)),
  ).toBeVisible()

  /* THE UNDO OUTLIVES A WALK AWAY (built-critique-m4.md, minor 3): Home on the pill and back,
     and the shelf still offers the one step back, and takes it */
  await page.getByRole('link', { name: 'Home' }).first().click()
  await expect(page).not.toHaveURL(/\/shelf/)
  await page.goBack()
  /* back on the change sheet it was applied from, which still shows what it applied */
  await expect(page.locator('[data-see="changes"]')).toBeVisible({ timeout: 30_000 })
  await expect(
    page.getByText(new RegExp(`^${lines} changes? (is|are) on the price list\\.$`)),
  ).toBeVisible()
  /* UNDO IS ONE STEP: the same sheet asks again for all of them */
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(apply).toBeVisible()
  await apply.click()
  await expect(
    page.getByText(new RegExp(`^${lines} changes? (is|are) on the price list\\.$`)),
  ).toBeVisible()
  await written(page)

  /* the quote already given prints exactly what it printed before */
  await page.goto(`/quote/${id}/document`)
  await expect(page.getByTestId('document')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.doc-money')).toBeVisible()
  expect(await page.locator('.doc-money').innerText()).toBe(given)
  /* every word and figure the customer was handed, not only the total */
  expect(await page.getByTestId('document').innerText()).toBe(printed)

  /* and the price list really moved: the same workbook brought in again changes nothing */
  await page.goto('/shelf')
  await shelfReady(page)
  await bringIn(page, bytes)
  await page.getByRole('button', { name: 'See every change' }).click()
  await expect(page.getByText('Nothing to apply.')).toBeVisible()

  /* CLEARING THE PRICE LIST is a page of its own; it puts the Master Price File back as it came
     and keeps the quote, and the same workbook then has its changes to make again */
  await page.getByRole('button', { name: 'Back to the shelf' }).first().click()
  await shelfReady(page)
  await page.getByRole('button', { name: 'Clear the price list…' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Clear the price list from this computer',
  )
  await expect(page.getByText(/^1 quote: a clear never reaches a quote\./)).toBeVisible()
  await page.getByRole('button', { name: 'Clear the price list from this computer' }).click()
  await expect(page).toHaveURL(/\/shelf\?see=cleared/, { timeout: 60_000 })
  await shelfReady(page)
  await expect(
    page.getByText(/^The price list is back as the Master Price File came with the app\. 1 quote,/),
  ).toBeVisible()
  await bringIn(page, bytes)
  await expect(band).toContainText(String(lines))
  await page.goto(`/quote/${id}/document`)
  await expect(page.getByTestId('document')).toBeVisible({ timeout: 30_000 })
  expect(await page.getByTestId('document').innerText()).toBe(printed)
})

test('the shelf: a copy saved, everything forgotten, and the copy brought back into the fresh computer', async ({
  page,
}, info) => {
  test.skip(
    !['desktop', 'phone'].includes(info.project.name),
    'the round trip is walked at a desk and in a hand; the rulers measure the shelf at all six',
  )
  test.setTimeout(300_000)

  /* A GIVEN QUOTE WITH NORTHSIDE'S DETAILS ON IT, so the trip carries what the give froze: the
     letterhead's ABN, phone and valid-until day, and who prepared it with their title and phone
     (built-critique-m4.md, blocker 1: a restore used to bring the quote back without them) */
  const id = await startAQuote(page)
  await written(page)
  await toSettings(page)
  await setLine(page, /^ABN — none given/, 'ABN', ABN)
  await setLine(page, /^Phone — none given/, 'Phone', '07 3265 1022')
  await setLine(page, 'Set a quote stands for', 'A quote stands for', '30')
  await page.getByRole('button', { name: 'Keep Asaf as a person' }).click()
  await page.getByRole('textbox', { name: 'Title' }).fill('Sales manager')
  await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('0400 111 222')
  await page.getByTestId('manage-person').getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByText('Sales manager')).toBeVisible()
  await written(page)
  await page.goto(`/quote/${id}`)
  await expect(page.getByTestId('configurator')).toBeVisible({ timeout: 30_000 })
  await issueIt(page)
  await openTheDocument(page)
  const head = page.getByTestId('document').getByTestId('letterhead')
  await expect(head).toContainText(`ABN ${ABN}`)
  await expect(head).toContainText('07 3265 1022')
  await expect(head).toContainText(/Valid until \d{1,2} \w+ \d{4}/)
  await expect(page.locator('.doc-money')).toContainText('Sales manager')
  const printed = await page.getByTestId('document').innerText()
  await written(page)

  /* Settings changes after the give: the copy saved below carries the NEW phone, and the given
     quote must still print the one it was given with */
  await toSettings(page)
  await page.getByRole('button', { name: 'Phone, 07 3265 1022 — change it' }).click()
  await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('07 3265 9999')
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByTestId('manage-editor')).toHaveCount(0)
  await written(page)

  await page.goto('/shelf')
  await shelfReady(page)
  const quotesKind = page.locator('.sf-kind', { hasText: 'Quotes' })
  await expect(quotesKind.locator('.sf-kind__figure')).toHaveText('1')
  await expect(page.getByText('No copy saved yet')).toBeVisible()

  const saving = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Save a copy' }).click()
  const download = await saving
  expect(download.suggestedFilename()).toMatch(
    /^Northside Marine copy \d{4}-\d{2}-\d{2} \d{4}\.json$/,
  )
  const copy = info.outputPath('copy.json')
  await download.saveAs(copy)
  await expect(page.getByText(/^Last copy saved today at/)).toBeVisible()

  /* forgetting is a page of its own, and says what goes before it takes it */
  await page.getByRole('button', { name: 'Forget everything…' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Forget everything on this computer',
  )
  await expect(page.getByText('Goes')).toBeVisible()
  await page.getByRole('button', { name: 'Forget everything on this computer' }).click()
  await expect(page).toHaveURL(/\/sign-in/, { timeout: 30_000 })

  /* a fresh computer: the door again, and nothing of Northside's on it */
  await throughTheDoor(page)
  await page.goto('/shelf')
  await shelfReady(page)
  await expect(quotesKind.locator('.sf-kind__figure')).toHaveText('0')

  await page.getByTestId('shelf-copy').setInputFiles(copy)
  await expect(page.locator('[data-see="restore"]')).toBeVisible()
  await expect(page.getByText(/It holds 1 quote,/)).toBeVisible()
  await page.getByRole('button', { name: 'Bring this copy back' }).click()
  await expect(page).toHaveURL(/\/shelf\?see=back/, { timeout: 60_000 })
  await shelfReady(page)
  await expect(page.getByText(/^The copy is back: 1 quote,/)).toBeVisible()
  await expect(quotesKind.locator('.sf-kind__figure')).toHaveText('1')

  /* AND THE QUOTE THAT CAME BACK PRINTS THE PAPER IT WAS GIVEN AS — every word, read whole */
  await page.goto(`/quote/${id}/document`)
  await expect(page.locator('.doc-page__foot').first()).toContainText(/Page 1 of \d+/, {
    timeout: 30_000,
  })
  const back = page.getByTestId('document').getByTestId('letterhead')
  await expect(back).toContainText(`ABN ${ABN}`)
  await expect(back).toContainText('07 3265 1022')
  await expect(back).not.toContainText('07 3265 9999')
  expect(await page.getByTestId('document').innerText()).toBe(printed)
})
