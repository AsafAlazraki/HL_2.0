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
   the file, when the file drifts from the screen, and when a maker does
   not arrive at all, which is the case no unit test can see.

   IT RUNS UNDER ALL SIX VIEWPORT PROJECTS, so every assertion is one
   that has to hold in a hand as well as on a desk. Under 834px the list
   and the plate take turns — that is the screen's own ladder, written in
   `picker.css` — so every step below reaches for what is on screen at
   the stage it is at, and never for a column the width has put away.
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
const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A maker's models, counted the way the screen counts them: a table
 *  filed three levels deep is one model per trail above its last level,
 *  and any other table is one model per line. */
function modelsIn(table: Table): number {
  const list = rowsOf(table.id)
  const levels = table.hierarchy ?? []
  if (levels.length < 3) return list.length
  return new Set(
    list.map((row) =>
      levels
        .slice(0, -1)
        .map((id) => cell(row, id))
        .join(' ▸ '),
    ),
  ).size
}

const MODELS = boats.reduce((n, t) => n + modelsIn(t), 0)
const RUNG = boats[0].priceLevels?.find((l) => l.key === 'cash')?.label ?? ''
const HIGHFIELD = 'boat_highfield'

/* THE DATABASE'S OWN WORDS, which the M2-close critique counted on this
   screen at 1440 — 128 "row" or "rows" and 10 "register" — and which a
   showroom never says. "rung" is the engine's name for a price level. */
const DATABASE = /\brows?\b|\bregisters?\b|\brung\b/gi

/** Highfield's models grouped by their trail, with the materials each
 *  is built in, in the file's own order. */
function highfield(): { name: string; rows: number; materials: number }[] {
  const table = boats.find((t) => t.id === HIGHFIELD) as Table
  const levels = table.hierarchy ?? []
  const variantField = levels[levels.length - 1]
  const by = new Map<string, Row[]>()
  for (const row of rowsOf(HIGHFIELD)) {
    const trail = levels
      .slice(0, -1)
      .map((id) => cell(row, id))
      .join(' ▸ ')
    by.set(trail, [...(by.get(trail) ?? []), row])
  }
  return [...by].map(([trail, rows]) => ({
    name: trail.split(' ▸ ').at(-1) ?? '',
    rows: rows.length,
    materials: new Set(
      rows.map((row) => {
        const text = cell(row, variantField)
        const at = text.lastIndexOf(' ')
        return at < 0 ? '' : text.slice(0, at).trim()
      }),
    ).size,
  }))
}

/** The Highfield model with the most versions behind it — the sweep's
 *  own hard case, found rather than named. */
const busiest = (): { name: string; rows: number; materials: number } =>
  highfield().reduce((best, m) => (m.rows > best.rows ? m : best))

/** A model of several versions built in ONE material, so its colour is
 *  the only question — the ADV7 on this file, found by counting. */
const oneMaterialMany = (): { name: string; rows: number } => {
  const found = highfield().find((m) => m.rows > 1 && m.materials === 1)
  if (!found) throw new Error('no model on this file is several versions in one material')
  return found
}

const openPicker = async (page: Page): Promise<void> => {
  await throughTheDoor(page)
  await page.goto('/quote/new')
  await expect(page.getByTestId('picker-counts')).toBeVisible()
}

/** Find a model by name and press its card, the way a person does. */
const chooseModel = async (page: Page, name: string): Promise<void> => {
  await page.getByLabel(/Find a model/).fill(name)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(name)}\\b`) })
    .first()
    .click()
}

const fixedRoom = (size: { width: number; height: number }): boolean =>
  size.width >= 1200 && size.height >= 700

test('the picker opens on the makers, each a door with its models counted off the file', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await openPicker(page)

  const counts = page.getByTestId('picker-counts')
  await expect(counts).toContainText(`${au(MODELS)} models`)
  await expect(counts).toContainText(`${boats.length} makers`)
  await expect(counts).toContainText(`${RUNG} prices`)

  const doors = page.getByRole('region', { name: 'Makers' })
  for (const table of boats) {
    await expect(
      doors.getByRole('button', {
        name: new RegExp(`^${escapeRe(table.name)}, ${au(modelsIn(table))} models`),
      }),
    ).toBeVisible()
  }
  /* no list of every boat is drawn before a maker is asked for */
  await expect(page.getByRole('region', { name: 'Models' })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('pressing a door puts the maker in the address and lists its boats with their prices', async ({
  page,
}) => {
  await openPicker(page)
  const table = boats.find((t) => t.id === HIGHFIELD) as Table
  await page
    .getByRole('region', { name: 'Makers' })
    .getByRole('button', { name: new RegExp(`^${escapeRe(table.name)},`) })
    .click()

  await expect(page).toHaveURL(new RegExp(`brand=${HIGHFIELD}`))
  const list = page.getByRole('region', { name: 'Models' })
  /* headed by the maker's own mark, named for a reader by the maker's name */
  await expect(list.getByRole('heading', { level: 2, name: table.name })).toBeVisible()
  await expect(list).toContainText(`${au(modelsIn(table))} models`)
  /* the first model the file lists is a card whose name leads its label */
  const first = highfield()[0]
  await expect(
    list.getByRole('button', { name: new RegExp(`^${escapeRe(first.name)}, (from )?\\$`) }),
  ).toBeVisible()
})

/* THE CRITIQUE'S OWN MEASURE, AS A GATE AT EVERY SIZE: the words a
   reader sees at each of the three stages — the doors, a maker's boats
   and one boat on its plate — carry no row, register or rung. */
test('says nothing about rows, registers or rungs at any stage', async ({ page }) => {
  await openPicker(page)
  const words = async (): Promise<string[]> =>
    (await page.locator('main').innerText()).match(DATABASE) ?? []
  expect(await words(), 'at rest').toEqual([])

  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await expect(page.getByRole('region', { name: 'Models' })).toBeVisible()
  expect(await words(), 'a maker').toEqual([])

  await chooseModel(page, busiest().name)
  await page
    .getByRole('complementary', { name: 'What is chosen' })
    .locator('.picker-chip__name')
    .first()
    .click()
  await expect(page).toHaveURL(/row=/)
  expect(await words(), 'a boat').toEqual([])
})

test('a model of many versions refuses the act with its reason, and takes it once one is chosen', async ({
  page,
}) => {
  await openPicker(page)
  const model = busiest()
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, model.name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText(model.name)

  /* REFUSED, WITH A SENTENCE, IN THE PLACE IT IS REFUSED — and still
     focusable, still named, never a dead control. */
  const act = panel.getByRole('button', { name: 'Start the quote' })
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await expect(act).toHaveAccessibleDescription(
    `A quote is for one ${model.name} in one material and colour, so choose a material above first.`,
  )

  /* EVERY MATERIAL THE FILE GIVES THIS MODEL, AND THE COLOUR NOT YET. */
  await expect(panel.getByText('Material', { exact: true })).toBeVisible()
  await expect(panel.getByText(/^Colour ·/)).toHaveCount(0)

  const chips = panel.locator('.picker-chip__name')
  expect(await chips.count()).toBe(model.materials)
  await chips.first().click()

  /* choosing a material chooses its first colour, so the act comes live
     and the colours of that material are now the refinement */
  await expect(page).toHaveURL(/row=/)
  await expect(panel.getByText(/^Colour ·/)).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Start the quote' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  )
})

/* ============================================================
   THE ONE GEOMETRY THIS FLOW DOES ASSERT, and it is here because the
   screen shipped green without it: at 1440 x 900 `Start the quote` once
   stood nine pixels below the window, and choosing a material moved it
   219 pixels further. At the moment the act becomes live it is ON the
   screen where the room is fixed, and REACHABLE BY THE PAGE'S OWN
   SCROLL everywhere else.
   ============================================================ */
test('the act is on the screen at the moment it becomes live', async ({ page }) => {
  await openPicker(page)
  const size = page.viewportSize() as { width: number; height: number }
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, busiest().name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  await panel.locator('.picker-chip__name').first().click()
  await expect(page).toHaveURL(/row=/)
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')

  if (fixedRoom(size)) {
    await expect(act).toBeInViewport({ ratio: 1 })
    await expect(panel.locator('.picker-money__fig')).toBeInViewport({ ratio: 1 })
  } else {
    await act.scrollIntoViewIfNeeded()
    await expect(act).toBeInViewport({ ratio: 1 })
  }
})

/* THE QUESTION THE ACT WAITS ON STANDS WHERE THE ACT IS
   (built-critique-m2.md #3): every colour chip is in the plate's foot,
   above the act, and the chips and the act fit in ONE window together. */
test('the colours the act waits on are on screen with it, above it', async ({ page }) => {
  await openPicker(page)
  const model = oneMaterialMany()
  const size = page.viewportSize() as { width: number; height: number }
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, model.name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await expect(act).toHaveAccessibleDescription(
    `A quote is for one ${model.name} in one colour, so choose a colour above first.`,
  )

  const chips = panel.locator('.picker-stage__foot .picker-chip__code')
  await expect(chips).toHaveCount(model.rows)

  if (!fixedRoom(size)) await act.scrollIntoViewIfNeeded()
  const where = await page.evaluate(() => {
    const codes = [...document.querySelectorAll('.picker-stage__foot .picker-chip__code')]
    const press = document.querySelector('.picker-act button') as HTMLElement
    const tops = codes.map((c) => c.getBoundingClientRect().top)
    const bottoms = codes.map((c) => c.getBoundingClientRect().bottom)
    const a = press.getBoundingClientRect()
    return { first: Math.min(...tops), last: Math.max(...bottoms), act: a.top, actEnd: a.bottom }
  })
  expect(where.last).toBeLessThanOrEqual(where.act)
  expect(where.actEnd - where.first).toBeLessThanOrEqual(size.height)

  if (fixedRoom(size)) {
    await expect(chips.first()).toBeInViewport({ ratio: 1 })
    await expect(chips.last()).toBeInViewport({ ratio: 1 })
    await expect(act).toBeInViewport({ ratio: 1 })
  }

  await chips.first().click()
  await expect(page).toHaveURL(/row=/)
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
})

/* ============================================================
   THE ROOM FITS THE WINDOW IT IS DRAWN AT (rule d) — at rest, with a
   maker's boats listed, and with a two-material boat chosen, the
   plate's tallest foot.
   ============================================================ */
test('where the room is fixed, the page is exactly the window at every stage', async ({ page }) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(!fixedRoom(size), `the page scrolls on purpose at ${size.width} x ${size.height}`)
  await openPicker(page)
  const fits = async (): Promise<{ scroll: number; inner: number }> =>
    page.evaluate(() => ({
      scroll: (document.scrollingElement as HTMLElement).scrollHeight,
      inner: innerHeight,
    }))
  let m = await fits()
  expect(m.scroll, `${m.scroll} in ${m.inner} at rest`).toBeLessThanOrEqual(m.inner)

  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await expect(page.getByRole('region', { name: 'Models' })).toBeVisible()
  m = await fits()
  expect(m.scroll, `${m.scroll} in ${m.inner} with a maker`).toBeLessThanOrEqual(m.inner)

  await chooseModel(page, busiest().name)
  await page
    .getByRole('complementary', { name: 'What is chosen' })
    .locator('.picker-chip__name')
    .first()
    .click()
  await expect(page).toHaveURL(/row=/)
  m = await fits()
  expect(m.scroll, `${m.scroll} in ${m.inner} with a boat chosen`).toBeLessThanOrEqual(m.inner)
})

/* ============================================================
   THE ROOM NEVER MOVES UNDER THE BAND, AND THE CHOSEN BOAT STAYS IN
   VIEW. Measured while this screen was redrawn (2026-09-24, 1440 x
   900): a boat chosen by name and the search then cleared, the list
   put 66 models back above it and the card was out of sight; and the
   first fix, `scrollIntoView`, scrolled the whole room 700px because a
   `overflow: hidden` box is still a scroller a script can move. Both
   are asserted here: the question is still at the top of the window,
   and the chosen card is in it.
   ============================================================ */
test('the chosen boat stays in view when the search is cleared, and the room does not move', async ({
  page,
}) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(!fixedRoom(size), `the page is the scroller at ${size.width} x ${size.height}`)
  await openPicker(page)
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, busiest().name)
  await expect(page.getByRole('complementary', { name: 'What is chosen' })).toBeVisible()
  await page.getByLabel(/Find a model/).fill('')

  const chosen = page.getByRole('region', { name: 'Models' }).locator('button[aria-pressed="true"]')
  await expect(chosen).toHaveCount(1)
  await expect(chosen).toBeInViewport()
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
  expect(await page.evaluate(() => (document.scrollingElement as HTMLElement).scrollTop)).toBe(0)
})

/* IN A HAND, THE LIST ARRIVES WHEN IT IS ASKED FOR: nothing chosen is
   the makers' doors, a short page; a door brings its maker's boats. */
test('in a hand, nothing chosen is the doors, and a door brings its list', async ({ page }) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(size.width >= 834, `the list stands beside the plate at ${size.width}`)
  await openPicker(page)
  await expect(page.getByRole('region', { name: 'Models' })).toHaveCount(0)
  const tall = await page.evaluate(() => (document.scrollingElement as HTMLElement).scrollHeight)
  expect(tall, `${tall}px of page with nothing chosen`).toBeLessThan(size.height * 3)

  const table = boats.find((t) => t.id === HIGHFIELD) as Table
  await page
    .getByRole('region', { name: 'Makers' })
    .getByRole('button', { name: new RegExp(`^${escapeRe(table.name)},`) })
    .click()
  await expect(page.getByRole('region', { name: 'Models' })).toBeVisible()

  /* and "← All makers" is the way back, named for where it goes */
  await page.getByRole('button', { name: '← All makers' }).click()
  await expect(page.getByRole('region', { name: 'Makers' })).toBeVisible()

  /* and typing reaches any model from the doors too */
  await page.getByLabel(/Find a model/).fill(busiest().name)
  await expect(page.getByRole('region', { name: 'Models' })).toBeVisible()
})

test('starting a quote writes a document and opens it', async ({ page }) => {
  await openPicker(page)

  /* a maker that files one line per model, so the act is live at once —
     chosen off the file rather than named here */
  const flat = boats.find((t) => (t.hierarchy ?? []).length < 3) as Table
  const first = rowsOf(flat.id)[0]
  const nameField = (flat.hierarchy ?? []).at(-1) ?? ''
  const label = nameField === '' ? '' : cell(first, nameField)
  expect(label).not.toBe('')

  await page.goto(`/quote/new?brand=${flat.id}`)
  await page.getByLabel(/Find a model/).fill(label)
  await page.getByRole('region', { name: 'Models' }).locator('.picker-cards button').first().click()

  /* THE CARD PRINTS THE FILE'S NAME WITH THE MAKER TAKEN OFF ITS FRONT,
     and nothing else changed: what the plate names is the end of it */
  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const named = (await panel.getByRole('heading', { level: 2 }).innerText()).trim()
  expect(named).not.toBe('')
  expect(label.replace(/\s+/g, ' ').endsWith(named)).toBe(true)
  await panel
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()

  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('running-total')).toBeVisible()
  await expect(page.getByTestId('configurator')).toContainText(/\d{8}-\d{2}/)
})

test('an undecoded colour is printed as the code it is', async ({ page }) => {
  await openPicker(page)
  const table = boats.find((t) => t.id === HIGHFIELD) as Table
  const levels = table.hierarchy ?? []
  const variantField = levels[levels.length - 1]

  /* the first Highfield model whose colour code is `WH`, found in the
     file rather than named here */
  const row = rowsOf(HIGHFIELD).find((r) => cell(r, variantField).endsWith(' WH')) as Row
  expect(row).toBeTruthy()
  const model = cell(row, levels[1])

  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, model)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()

  await expect(panel.getByText('WH', { exact: true }).first()).toBeVisible()
  await expect(panel).toContainText('question for the dealer, never a guess')
})
