import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE PICKER, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   Nothing here is typed into an assertion. Every figure is walked out
   of `data/northside/` — the same files the browser fetches — and then
   looked for on the screen, so this fails when the screen drifts from
   the file, when the file drifts from the screen, and when a register
   does not arrive at all, which is the case no unit test can see.

   IT RUNS UNDER ALL SIX VIEWPORT PROJECTS, so every assertion is one
   that has to hold in a hand as well as on a desk. Under 834px the
   index and the panel take turns — that is the screen's own ladder,
   written in `picker.css` — so every step below reaches for what is on
   screen at the stage it is at, and never for a column the width has
   put away. Nothing here asserts a position: the reflow is the
   rulers' job.
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

interface Manifest {
  tables: { id: string; file: string; rowCount: number }[]
}
interface Table {
  id: string
  name: string
  kind: string
  hierarchy?: string[]
  priceLevels?: { key: string; label: string; fieldId: string }[]
}
interface Row {
  id: string
  values: Record<string, unknown>
}

const manifest = readJson<Manifest>('manifest.json')
const tables = readJson<Table[]>('entities.json')
const boats = tables.filter((t) => t.kind === 'boat')
const rowsOf = (id: string): Row[] =>
  readJson<Row[]>(manifest.tables.find((t) => t.id === id)?.file ?? '')

const au = (n: number): string => n.toLocaleString('en-AU')
const cell = (row: Row, id: string): string => String(row.values[id] ?? '').trim()

/** The file's own tiers, counted the way the screen counts them. */
function shelf(): { rows: number; models: number; series: number; rung: string } {
  let rows = 0
  let models = 0
  let series = 0
  for (const table of boats) {
    const list = rowsOf(table.id)
    const levels = table.hierarchy ?? []
    rows += list.length
    models +=
      levels.length >= 3
        ? new Set(
            list.map((row) =>
              levels
                .slice(0, -1)
                .map((id) => cell(row, id))
                .join(' ▸ '),
            ),
          ).size
        : list.length
    /* THE SERIES THE FILE NAMES, and not the group a blank cell falls
       into: two registers here leave it empty on some rows and one
       files no series column at all. */
    series +=
      levels.length >= 2
        ? new Set(list.map((row) => cell(row, levels[0])).filter((v) => v !== '')).size
        : 0
  }
  const rung = boats[0].priceLevels?.find((l) => l.key === 'cash')?.label ?? ''
  return { rows, models, series, rung }
}

const HIGHFIELD = 'boat_highfield'

/** The Highfield model with the most rows behind it — the sweep's own
 *  hard case, found rather than named. */
function busiest(): { name: string; rows: number; materials: number } {
  const table = boats.find((t) => t.id === HIGHFIELD) as Table
  const levels = table.hierarchy ?? []
  const by = new Map<string, Row[]>()
  for (const row of rowsOf(HIGHFIELD)) {
    const trail = levels
      .slice(0, -1)
      .map((id) => cell(row, id))
      .join(' ▸ ')
    by.set(trail, [...(by.get(trail) ?? []), row])
  }
  let best: [string, Row[]] = ['', []]
  for (const entry of by) if (entry[1].length > best[1].length) best = entry
  const variantField = levels[levels.length - 1]
  const materials = new Set(
    best[1].map((row) => {
      const text = cell(row, variantField)
      const at = text.lastIndexOf(' ')
      return at < 0 ? '' : text.slice(0, at).trim()
    }),
  )
  return {
    name: best[0].split(' ▸ ').at(-1) ?? '',
    rows: best[1].length,
    materials: materials.size,
  }
}

const openPicker = async (page: Page): Promise<void> => {
  await throughTheDoor(page)
  await page.goto('/quote/new')
  await expect(page.getByTestId('picker-counts')).toBeVisible()
}

test('the picker counts the registers it actually loaded, and names the rung', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await openPicker(page)

  const facts = shelf()
  const counts = page.getByTestId('picker-counts')
  await expect(counts).toContainText(au(facts.rows))
  await expect(counts).toContainText(au(facts.models))
  await expect(counts).toContainText(au(facts.series))
  await expect(counts).toContainText(String(boats.length))
  await expect(counts).toContainText(facts.rung)

  /* the counted rail: every register with its own row count */
  const rail = page.getByRole('region', { name: 'Registers' })
  await expect(
    rail.getByRole('button', { name: `All registers, ${au(facts.rows)} rows` }),
  ).toBeVisible()
  for (const table of boats) {
    const rows = manifest.tables.find((t) => t.id === table.id)?.rowCount ?? 0
    await expect(
      rail.getByRole('button', { name: `${table.name}, ${au(rows)} rows` }),
    ).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('pressing a register puts it in the address and re-fills the panel', async ({ page }) => {
  await openPicker(page)
  const highfield = boats.find((t) => t.id === HIGHFIELD) as Table
  const rows = manifest.tables.find((t) => t.id === HIGHFIELD)?.rowCount ?? 0

  await page
    .getByRole('region', { name: 'Registers' })
    .getByRole('button', { name: `${highfield.name}, ${au(rows)} rows` })
    .click()

  await expect(page).toHaveURL(new RegExp(`brand=${HIGHFIELD}`))
  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText(highfield.name)
  await expect(panel).toContainText(au(rows))
})

test('a model of many rows refuses the act with its reason, and takes it once a row is chosen', async ({
  page,
}) => {
  await openPicker(page)
  const model = busiest()

  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(model.name)}\\b`) })
    .first()
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText(model.name)

  /* REFUSED, WITH A SENTENCE, IN THE PLACE IT IS REFUSED — and still
     focusable, still named, never a dead control. */
  const act = panel.getByRole('button', { name: 'Start the quote' })
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await expect(panel).toContainText(`This model is ${model.rows} rows of the price file`)

  /* EVERY MATERIAL THE FILE GIVES THIS MODEL, AND THE COLOURWAY NOT
     YET. Two questions asked one at a time: the material is what moves
     the figure, so it is asked first and its colourways follow. */
  await expect(panel.getByText('Material —', { exact: false })).toBeVisible()
  await expect(panel.getByText('Colourway —', { exact: false })).toHaveCount(0)

  const chips = panel.locator('.picker-chip__name')
  expect(await chips.count()).toBe(model.materials)
  await chips.first().click()

  /* choosing a material chooses its first row, so the act comes live
     and the colourways of that material are now the refinement */
  await expect(page).toHaveURL(/row=/)
  await expect(panel.getByText('Colourway —', { exact: false })).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Start the quote' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  )
})

/* ============================================================
   THE ONE GEOMETRY THIS FLOW DOES ASSERT, and it is here because the
   screen shipped green without it.

   Measured in a browser on the built screen at 1440 x 900: the plate
   was a single 1,093px scroller in a 692px scrollport, so `Start the
   quote` stood at top 857 with nine pixels sliced by the window — and
   choosing a material, which is the press that MAKES THE ACT LIVE,
   moved it to top 1119, two hundred and nineteen pixels below the
   window. At 1920 x 1080 it was at 1119 in a 1,080px window. Nothing
   caught it: the rulers open this address with nothing chosen, so no
   gate in this repository had ever looked at the plate with a hull on
   it, and the page's own scrollHeight equalled the window at both
   sizes because the overflow was inside a panel.

   So: at the moment the act becomes live, it is ON the screen where
   the room is fixed (1200px of width and 700px of window, which is
   `picker.css`'s own condition), and REACHABLE BY THE PAGE'S OWN
   SCROLL everywhere else — never stranded inside a scroller the page
   cannot reach, which is the failure being guarded against and not
   the position, which is the ladder's business.
   ============================================================ */
test('the act is on the screen at the moment it becomes live', async ({ page }) => {
  await openPicker(page)
  const model = busiest()
  const size = page.viewportSize() as { width: number; height: number }

  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(model.name)}\\b`) })
    .first()
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })

  /* the press that makes it live */
  await panel.locator('.picker-chip__name').first().click()
  await expect(page).toHaveURL(/row=/)
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')

  if (size.width >= 1200 && size.height >= 700) {
    /* THE WHOLE OF IT, WITHOUT SCROLLING ANYTHING. `ratio: 1` is the
       assertion: nine sliced pixels is what this screen was failed
       on, so nine sliced pixels has to fail here. */
    await expect(act).toBeInViewport({ ratio: 1 })
    /* and the figure it would quote at is on screen with it, in the
       same foot, because the material just changed it */
    await expect(panel.locator('.picker-money__fig')).toBeInViewport({ ratio: 1 })
  } else {
    /* a hand and a tablet scroll the page, which is the ladder's own
       decision; what must be true is that the page can reach it */
    await act.scrollIntoViewIfNeeded()
    await expect(act).toBeInViewport({ ratio: 1 })
  }
})

test('starting a quote writes a document and says where it opens', async ({ page }) => {
  await openPicker(page)

  /* a register that files one row per model, so the act is live at
     once — chosen off the file rather than named here */
  const flat = boats.find((t) => (t.hierarchy ?? []).length < 3) as Table
  const first = rowsOf(flat.id)[0]
  const nameField = (flat.hierarchy ?? []).at(-1) ?? ''
  const label = nameField === '' ? '' : cell(first, nameField)
  expect(label).not.toBe('')

  await page.goto(`/quote/new?brand=${flat.id}`)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(label)}`) })
    .first()
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText(label)
  await panel
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()

  /* AND IT OPENS THERE. Until 2026-09-17 this asserted the opposite —
     that the act wrote the document and then said "the configurator is
     not built yet" — which was true of that day and is exactly the
     sort of gate that goes quietly stale the morning the screen
     arrives. The configurator is built; the act navigates; and the
     proof that it landed is the reference the day stamped, on the
     masthead of the screen it landed on.

     THE REFUSAL IS STILL A REAL PATH AND IS STILL TESTED.
     `Picker.test.tsx` renders the screen with no `openQuote`, which is
     what a component test with no router has, and asserts the sentence
     there. */
  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('running-total')).toBeVisible()
  await expect(page.getByTestId('configurator')).toContainText(/\d{8}-\d{2}/)
})

test('an undecoded colourway is printed as the code it is', async ({ page }) => {
  await openPicker(page)
  const table = boats.find((t) => t.id === HIGHFIELD) as Table
  const levels = table.hierarchy ?? []
  const variantField = levels[levels.length - 1]

  /* the first Highfield model whose colourway code is `WH`, found in
     the file rather than named here */
  const row = rowsOf(HIGHFIELD).find((r) => cell(r, variantField).endsWith(' WH')) as Row
  expect(row).toBeTruthy()
  const model = cell(row, levels[1])

  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(model)}\\b`) })
    .first()
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  /* the colourways of a model built in more than one material follow
     the material, so ask that question first where it is asked */
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()

  await expect(panel.getByText('WH', { exact: true }).first()).toBeVisible()
  await expect(panel).toContainText('question for the dealer, never a guess')
})

const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
