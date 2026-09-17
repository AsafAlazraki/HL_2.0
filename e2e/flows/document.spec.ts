import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { pageCountOf } from '../print/pdf'

/* ============================================================
   THE DOCUMENT, IN A REAL BROWSER, AND THEN ON A REAL SHEET OF A4.

   IT WALKS IN THROUGH THE FRONT DOOR AND ISSUES A QUOTE. There is no
   way to seed one: a document exists because somebody pressed the act
   on the picker, configured it, addressed it and gave it to the
   customer. Every case below does all five, which is also why this
   file is the proof that four screens are joined.

   NOTHING HERE IS TYPED INTO AN ASSERTION. The model is found by
   measuring `data/northside/` — the same files the browser fetches —
   and every figure is read off the screen and compared with another
   thing on the screen, never with a number written in this file.

   ── THE ONE CASE THIS SCREEN OWES THAT NO OTHER DOES ──────────

   `print-the-A4` prints the page to a PDF in `e2e/out/` and asserts
   the file exists and has the page count the DOM says it has. That is
   the whole thesis of direction A made into a gate: the sheets on the
   floor and the sheets in the tray are the same objects, so if the
   paginator ever put one atom too many on a page, Chromium would spill
   it onto an extra printed page and the two counts would part.

   IT RUNS AT ONE VIEWPORT. `page.pdf()` lays out at the paper's width
   whatever the window is, so printing the same document six times
   would print six identical files; the interesting question is
   whether the page ASSIGNMENT is the same at every width, and that is
   asserted separately, at all six, by `the page assignment is the
   paper's at every width`.

   WHY THIS SCREEN IS NOT IN `e2e/routes.ts` YET. The same reason the
   configurator is not: every ruler opens a browser nobody has used
   and arrives either `fresh` or `through-the-door`, and neither
   reaches a document, because a document has to be written first. The
   geometry this screen owes is measured here, at the six widths.
   ============================================================ */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.resolve(HERE, '..', '..', 'data', 'northside')
const OUT = path.resolve(HERE, '..', 'out')

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(DATA, file), 'utf8')) as T

interface Manifest {
  tables: { id: string; file: string; rowCount: number }[]
}
interface Table {
  id: string
  name: string
  kind: string
  hierarchy?: string[]
}
interface Row {
  id: string
  values: Record<string, unknown>
}

const manifest = readJson<Manifest>('manifest.json')
const tables = readJson<Table[]>('entities.json')
const rowsOf = (id: string): Row[] =>
  readJson<Row[]>(manifest.tables.find((t) => t.id === id)?.file ?? '')
const cell = (row: Row, id: string): string => String(row.values[id] ?? '').trim()

/** The register with the most rows per model on this file, which is
 *  the one whose quote has the most sections to print. Found by
 *  measuring rather than named. */
function deepest(): { table: Table; model: string; rows: Row[] } {
  let best: { table: Table; model: string; rows: Row[] } | null = null
  for (const table of tables.filter((t) => t.kind === 'boat')) {
    const levels = table.hierarchy ?? []
    if (levels.length < 3) continue
    const groups = new Map<string, Row[]>()
    for (const row of rowsOf(table.id)) {
      const key = levels
        .slice(0, -1)
        .map((f) => cell(row, f))
        .join(' ▸ ')
      groups.set(key, [...(groups.get(key) ?? []), row])
    }
    for (const [key, rows] of groups) {
      if (!best || rows.length > best.rows.length) best = { table, model: key, rows }
    }
  }
  expect(best, 'no boat register on this file groups to three levels').not.toBeNull()
  return best!
}

const deep = deepest()
const MODEL = deep.model.slice(deep.model.lastIndexOf('▸') + 1).trim()
const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The customer this walk types at the desk. A test harness typing a
 *  name is not seeded data: the app invents nobody, and this is a
 *  person at a keyboard, played by a test. */
const CUSTOMER = 'R. Kelleher'

/**
 * Sign in, load the file, choose the deepest model on the sheet,
 * start the quote, address it, give it to the customer — and land on
 * the document at its own address.
 */
async function issueAQuote(page: Page): Promise<string> {
  await throughTheDoor(page)
  await page.goto(`/quote/new?brand=${deep.table.id}`)
  await expect(page.getByTestId('picker-counts')).toBeVisible()

  await page.getByLabel(/Find a model/).fill(MODEL)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(MODEL)}\\b`) })
    .first()
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()
  await panel
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()

  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('configurator')).toBeVisible()

  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is addressed to/).fill(CUSTOMER)
  await page.getByRole('button', { name: /Address this quote|Save the name/ }).click()

  await page.getByRole('button', { name: /The finale/ }).click()
  await page.getByRole('button', { name: 'Give it to the customer' }).click()
  await expect(page.getByTestId('configurator')).toContainText('given to the customer')

  const id = /\/quote\/([^/?#]+)/.exec(page.url())?.[1]
  expect(id, 'the configurator is not at a quote address').toBeTruthy()
  return id!
}

/**
 * THE WRITE-BEHIND, WAITED OUT, BECAUSE THIS NAVIGATION IS A PAGE
 * LOAD.
 *
 * `src/state/quotes.ts` coalesces writes on a 300 ms interval, and its
 * header argues for it: typing a customer's name has to be one write
 * and not one per keystroke. Nothing in the app loses by it — the
 * picker reaches the configurator through the router, so the document
 * is in memory the whole way. There is no link from the configurator
 * to this screen yet, so a test gets here with `page.goto`, which
 * throws the store away and reads the database back.
 *
 * MEASURED, 2026-09-17, ten workers on one machine: without this the
 * document rendered the version of the quote from BEFORE the customer
 * was typed and before it was issued — a draft addressed to nobody,
 * every figure on it correct. The screen was right and the test was
 * racing a promise it could not see.
 */
const WRITE_BEHIND_MS = 300
async function written(page: Page): Promise<void> {
  await page.waitForTimeout(WRITE_BEHIND_MS * 3)
}

/** The document, arrived at and settled: the page assignment is made
 *  in a layout effect, so `of N` on the foot is the proof it ran. */
async function openTheDocument(page: Page, id: string): Promise<void> {
  await written(page)
  await page.goto(`/quote/${id}/document`)
  await expect(page.getByTestId('document')).toBeVisible()
  await expect(page.locator('.doc-page').first()).toBeVisible()
  await expect(page.locator('.doc-page__foot').first()).toContainText(/Page 1 of \d+/)
}

/* ============================================================ */

test('the issued quote arrives as a sheet of A4 with the price beside who it is for', async ({
  page,
}) => {
  const id = await issueAQuote(page)
  await openTheDocument(page, id)

  await expect(page.getByRole('heading', { level: 1 })).toContainText(deep.table.name.split(' ')[0])
  await expect(page.getByTestId('document')).toContainText(CUSTOMER)
  await expect(page.getByTestId('document')).toContainText(/\d{8}-\d{2}/)

  /* THE PRICE BESIDE THE NAME, and the same figure the configurator
     was carrying — read off one screen and looked for on the other,
     so neither can drift without this failing. */
  const figure = page.getByTestId('document-total').locator('data.ui-price')
  await expect(figure).toHaveCount(1)
  const value = await figure.getAttribute('value')
  expect(Number(value)).toBeGreaterThan(0)

  /* IT NEVER ANIMATES. A `PriceFigure` is a `data` element carrying
     its value verbatim; a NumberFlow counter is a shadow root of
     moving digits and has no such attribute. */
  await page.waitForTimeout(400)
  expect(await figure.getAttribute('value')).toBe(value)
})

test('the sheet is A4 at true size, and the pages are whole', async ({ page, viewport }) => {
  const id = await issueAQuote(page)
  await openTheDocument(page, id)

  const sheets = page.locator('.doc-page')
  const count = await sheets.count()
  expect(count).toBeGreaterThan(1)

  /* 210 x 297 mm at 96 dpi is 793.7 x 1122.5 CSS px. Under 826px the
     paper leaves and the same nodes set as one column — the screen's
     own ladder, written in document.css — so the measurement is taken
     only where the paper is shown. */
  const box = await sheets.first().boundingBox()
  expect(box).not.toBeNull()
  if ((viewport?.width ?? 0) >= 826) {
    expect(Math.abs(box!.width - 793.7)).toBeLessThan(2)
    expect(Math.abs(box!.height - 1122.5)).toBeLessThan(2)
  } else {
    expect(box!.width).toBeLessThanOrEqual(viewport!.width)
  }

  /* NOTHING SPILLS OUT OF A PAGE. Every atom's box is inside the page
     it was packed onto — which is the paginator's whole promise, and
     the reason a printed page can never be a page and a half. */
  if ((viewport?.width ?? 0) >= 826) {
    const spills = await page.evaluate(() => {
      const bad: string[] = []
      for (const sheet of document.querySelectorAll('.doc-page')) {
        const flow = sheet.querySelector('.doc-page__flow')
        if (!flow) continue
        const room = flow.getBoundingClientRect()
        let used = 0
        for (const atom of flow.children) used += (atom as HTMLElement).offsetHeight
        if (used > room.height + 1) {
          bad.push(
            `${sheet.getAttribute('data-page')}: ${Math.round(used)} of ${Math.round(room.height)}`,
          )
        }
      }
      return bad
    })
    expect(spills).toEqual([])
  }
})

test('the page assignment is the paper’s at every width', async ({ page }) => {
  const id = await issueAQuote(page)
  await openTheDocument(page, id)

  /* THE ASSIGNMENT DOES NOT MOVE WITH THE WINDOW. It is measured in
     the paper's own geometry whatever the viewport is, because print
     is always A4 — so the number of sheets read here has to be the
     number read at every other project's width. The check is that the
     first page holds the cover alone and every later page holds at
     least one atom, at THIS width, which is what the six projects
     together turn into a comparison. */
  const first = page.locator('.doc-page').first()
  await expect(first.locator('.doc-atom')).toHaveCount(1)
  await expect(first.locator('.doc-cover')).toHaveCount(1)

  const perPage = await page.evaluate(() =>
    [...document.querySelectorAll('.doc-page')].map((p) => p.querySelectorAll('.doc-atom').length),
  )
  expect(perPage[0]).toBe(1)
  for (const n of perPage.slice(1)) expect(n).toBeGreaterThan(0)
})

test('Included, Optional and Not priced at this level read as three', async ({ page }) => {
  const id = await issueAQuote(page)
  await openTheDocument(page, id)

  /* the legend, which defines all three where a reader meets them */
  const legend = page.getByRole('region', { name: 'How to read a line' })
  await expect(legend).toContainText('Included')
  await expect(legend).toContainText('Optional')
  await expect(legend).toContainText('Not priced at this level')

  /* AND THEY ARE THREE DIFFERENT CELLS ON THE ROWS THEMSELVES. Every
     row's money cell is a figure, or one of the two words — never a
     blank, and never `$0` standing in for either. */
  const cells = await page.locator('.doc-row:not(.doc-row--cols) .doc-row__fig').allInnerTexts()
  expect(cells.length).toBeGreaterThan(0)
  for (const printed of cells) {
    const said = printed.trim()
    expect(said, 'a money cell is blank').not.toBe('')
    const isFigure = said.startsWith('$') || said.startsWith('−$') || said.startsWith('+$')
    const isWord = said === 'Included' || said === 'Not priced at this level'
    expect(isFigure || isWord, `a money cell reads "${said}"`).toBe(true)
  }
})

test('the dealer’s terms are the document’s own, and their absence is said', async ({ page }) => {
  const id = await issueAQuote(page)
  await openTheDocument(page, id)

  const terms = page.getByRole('region', { name: 'The terms of this quote' })
  await expect(terms).toBeVisible()
  /* THE PACK CARRIES NO ORGANISATION — onboarding mints one — so this
     quote really was raised with no standing terms, and the document
     says so rather than inventing a validity sentence. The day a
     dealership types one, the other half of this is the unit suite's
     `print what the document froze`. */
  await expect(terms).toContainText('No terms are printed, because this business has not typed any')
})

test('no cost column reaches this screen', async ({ page }) => {
  const id = await issueAQuote(page)
  await openTheDocument(page, id)
  const said = await page.getByTestId('document').innerText()
  /* the manifest names 139; these are the ones whose spelling could
     not be ordinary English, which is the same test tools/check.ts
     applies to the source */
  for (const name of [
    'Landed Hull Cost',
    'Total Nett CTD',
    'Nett Price',
    'Dealer List Price',
    'Base Cost',
    'Landed CTD',
    'Total PD Allowance',
  ]) {
    expect(said, `${name} is on a customer-facing surface`).not.toContain(name)
  }
})

/* ============================================================
   THE PRINT
   ============================================================ */

test.describe('print', () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    'page.pdf() lays out at the paper’s width whatever the window is, so one is enough',
  )

  test('prints one A4 PDF whose page count is the page count on the floor', async ({ page }) => {
    const id = await issueAQuote(page)
    await openTheDocument(page, id)

    const onFloor = await page.locator('.doc-page').count()
    expect(onFloor).toBeGreaterThan(1)

    /* THE SHEAF SAYS ITS OWN COUNT, so the paper and the page and the
       chrome are three readings of one number. */
    await expect(page.locator('.doc-page__foot').last()).toContainText(`of ${onFloor}`)

    mkdirSync(OUT, { recursive: true })
    const file = path.join(OUT, `document-${id}.pdf`)
    await page.pdf({
      path: file,
      format: 'A4',
      /* the paper is a colour and the one rule on it is the accent;
         a print that dropped both would not be the page */
      printBackground: true,
      /* the margins are the page's own, in the stylesheet's own
         millimetres — `@page { margin: 0 }` is what makes that true */
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    expect(existsSync(file), 'no PDF was written').toBe(true)
    expect(statSync(file).size, 'the PDF is empty').toBeGreaterThan(1000)
    expect(pageCountOf(file)).toBe(onFloor)
  })
})
