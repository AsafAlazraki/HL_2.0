import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { cardName } from '../mint'
import { openingOnASeparator, setNames } from '../lines'
import { wearTheme } from '../rulers/measure/read'
import { THEMES } from '../rulers/measure/theme'

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
    /* AS A PERSON SAYS IT: the card, the plate and the refusal name a
       Highfield code in the maker's own words (data/northside/names.json) */
    name: cardName(HIGHFIELD, trail.split(' ▸ ').at(-1) ?? ''),
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

/* ============================================================
   IN THE WINDOW MEANS WHERE A FINGER CAN REACH IT. The pill floats
   over the head of the window from 600px up and is the tab bar at its
   foot below that, so `toBeInViewport` alone would pass an act drawn
   under the bar — which is exactly where the ADV7's colours stood at
   390 (built-critique-m2-close-2.md, major 9). The room is the window
   less the pill's own box, measured, never a figure about the shell.
   ============================================================ */
const inTheRoom = async (page: Page, seen: Locator[]): Promise<string[]> => {
  const size = page.viewportSize() as { width: number; height: number }
  const pill = await page.getByTestId('shell-pill').boundingBox()
  const atTheFoot = pill !== null && pill.y + pill.height / 2 > size.height / 2
  const top = pill === null || atTheFoot ? 0 : pill.y + pill.height
  const bottom = pill !== null && atTheFoot ? pill.y : size.height
  const faults: string[] = []
  for (const locator of seen) {
    const box = await locator.boundingBox()
    const name = `${locator}`
    if (box === null) faults.push(`${name} is not drawn`)
    else if (box.y < top - 0.5 || box.y + box.height > bottom + 0.5)
      faults.push(
        `${name} spans ${Math.round(box.y)}–${Math.round(box.y + box.height)} outside the room ${Math.round(top)}–${Math.round(bottom)}`,
      )
  }
  return faults
}

/** Press a control the way this window is pressed: a finger where the
 *  project is a touch screen, a pointer where it is not. */
const pressAs = async (target: Locator, touch: boolean | undefined): Promise<void> => {
  if (touch) await target.tap()
  else await target.click()
}

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
   screen, clear of the pill and the tab bar, AT EVERY SIZE.

   This case once scrolled the act into view itself below the fixed
   room, which is the scroll a dealer beside a hull never makes
   (built-critique-m2-close-2.md, blocker 2): and a material pressed at
   390 did take the act off the screen, because the router answers every
   new address by putting the window back at the top. Nothing here
   scrolls now but the presses themselves.
   ============================================================ */
test('the act is on the screen at the moment it becomes live', async ({ page }, testInfo) => {
  await openPicker(page)
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, busiest().name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  await pressAs(panel.locator('.picker-chip__name').first(), testInfo.project.use.hasTouch)
  await expect(page).toHaveURL(/row=/)
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')

  const figure = panel.locator('.picker-money__fig')
  await expect(act).toBeInViewport({ ratio: 1 })
  await expect(figure).toBeInViewport({ ratio: 1 })
  await expect.poll(() => inTheRoom(page, [act, figure])).toEqual([])
})

/* THE QUESTION THE ACT WAITS ON STANDS WHERE THE ACT IS
   (built-critique-m2.md #3): every colour chip is in the plate's foot,
   above the act, and the chips and the act are in ONE window together —
   on arrival, with nothing scrolled for the reader. At 390 the ADV7's
   chips stood under the tab bar and the act at 951 of 844
   (built-critique-m2-close-2.md, major 9). */
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

  /* every colour of the model, named or not: a chip is its colour drawn
     and named where the decode names it, and its code where it cannot */
  const chips = panel.locator('.picker-stage__foot .picker-chips--codes button')
  await expect(chips).toHaveCount(model.rows)

  await expect(chips.first()).toBeInViewport({ ratio: 1 })
  await expect(chips.last()).toBeInViewport({ ratio: 1 })
  await expect(act).toBeInViewport({ ratio: 1 })
  await expect.poll(() => inTheRoom(page, [chips.first(), chips.last(), act])).toEqual([])
  const where = await page.evaluate(() => {
    const codes = [...document.querySelectorAll('.picker-stage__foot .picker-chips--codes button')]
    const press = document.querySelector('.picker-act button') as HTMLElement
    const tops = codes.map((c) => c.getBoundingClientRect().top)
    const bottoms = codes.map((c) => c.getBoundingClientRect().bottom)
    const a = press.getBoundingClientRect()
    return { first: Math.min(...tops), last: Math.max(...bottoms), act: a.top, actEnd: a.bottom }
  })
  expect(where.last).toBeLessThanOrEqual(where.act)
  expect(where.actEnd - where.first).toBeLessThanOrEqual(size.height)

  await chips.first().click()
  await expect(page).toHaveURL(/row=/)
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  /* and the colour pressed does not take the act away with it */
  await expect(act).toBeInViewport({ ratio: 1 })
})

/* ============================================================
   A PRESS ON A BOAT OPENS IT WHERE THE PRESS HAPPENED
   (built-critique-m2-close-2.md, blocker 2). At 834 x 1112 and 844 x
   390 with touch, the ADV7 pressed at the foot of Highfield's list
   ringed its card and changed nothing else in the window: its plate was
   drawn at the top of a 7,127px page while the window stood at 5,983.
   The boat is reached the way a person reaches it — the page scrolled
   to its card, a finger on it where the window is a touch screen — and
   then nothing more is scrolled: the boat's name, the colours its act
   waits on and the act are in the window, clear of the pill and the tab
   bar, and where the list stands beside the plate the card just pressed
   is still in the window too. At every size, because a hand and a desk
   have to hold it as well as the tablet.
   ============================================================ */
test('a boat pressed at the foot of its maker’s list opens in the window, colours and act with it', async ({
  page,
}, testInfo) => {
  await openPicker(page)
  const model = oneMaterialMany()
  const size = page.viewportSize() as { width: number; height: number }
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)

  const card = page
    .getByRole('region', { name: 'Models' })
    .getByRole('button', { name: new RegExp(`^${escapeRe(model.name)},`) })
  await card.scrollIntoViewIfNeeded()
  const from = await page.evaluate(() => (document.scrollingElement as HTMLElement).scrollTop)
  await pressAs(card, testInfo.project.use.hasTouch)
  await expect(page).toHaveURL(/model=/)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const name = panel.getByRole('heading', { level: 2 })
  /* every colour of the model, named or not: a chip is its colour drawn
     and named where the decode names it, and its code where it cannot */
  const chips = panel.locator('.picker-stage__foot .picker-chips--codes button')
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  await expect(name).toHaveText(model.name)
  await expect(chips).toHaveCount(model.rows)

  for (const seen of [name, chips.first(), chips.last(), act])
    await expect(seen, `${seen} after the press, from scrollY ${from}`).toBeInViewport({
      ratio: 1,
    })
  await expect.poll(() => inTheRoom(page, [name, chips.first(), chips.last(), act])).toEqual([])
  if (size.width >= 834) {
    await expect(card).toHaveAttribute('aria-pressed', 'true')
    await expect(card).toBeInViewport()
  }
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
  const model = cardName(HIGHFIELD, cell(row, levels[1]))

  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, model)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()

  await expect(panel.getByText('WH', { exact: true }).first()).toBeVisible()
  await expect(panel).toContainText('question for the dealer, never a guess')
})

/* ============================================================
   EVERY MAKER'S BOAT AS THE BUILD SAYS IT (m2-last-critique.md, major
   6). The picker named a Stacer "519 Sea Ranger SDF (Centre Console)"
   where the build says "Stacer 519 Sea Ranger SDF · Centre Console", a
   Haines Signature by its file's Model Code column ("Fisher 525F"), and
   headed the Haines series "FISHER SERIES (AS AT 18.03.2026)". Walked
   here off the file itself: the first Stacer line whose name ends in the
   file's own bracket, and the first Haines line, with the words the
   build says for each — the maker taken off, a spaced hyphen a space, a
   bracket said after the name — and never the file's brackets.
   ============================================================ */
interface Fielded extends Table {
  fields: { id: string; name: string }[]
}
const tidy = (text: string): string =>
  text
    .replace(/\s+-\s*|\s*-\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

test('a Stacer and a Haines are named as the build names them, and a series without its stamp', async ({
  page,
}) => {
  await openPicker(page)
  const plate = page.getByRole('complementary', { name: 'What is chosen' })

  /* A STACER: the model, then its trim after a dot, never in brackets */
  const stacer = boats.find((t) => t.id === 'boat_stacer') as Table
  const stacerName = (stacer.hierarchy ?? []).at(-1) as string
  const trimmed = rowsOf(stacer.id).find((r) => /\)\s*$/.test(cell(r, stacerName))) as Row
  expect(trimmed, 'no Stacer line on this file ends in a bracket').toBeTruthy()
  const parts = /^Stacer\s*-\s*(.*?)\s*\(([^()]+)\)\s*$/.exec(cell(trimmed, stacerName))
  expect(parts).not.toBeNull()
  const said = tidy(parts![1]!)
  const trim = parts![2]!.trim()
  await page.goto(`/quote/new?brand=${stacer.id}`)
  await page.getByLabel(/Find a model/).fill(said)
  const card = page
    .getByRole('region', { name: 'Models' })
    .getByRole('button', { name: new RegExp(`^${escapeRe(said)} · ${escapeRe(trim)},`) })
  await expect(card).toBeVisible()
  await card.click()
  await expect(plate.getByRole('heading', { level: 2 })).toHaveText(said)
  await expect(plate.locator('.picker-stage__trim')).toHaveText(trim)
  expect(await plate.locator('.picker-stage__crest').innerText()).not.toMatch(/[()]/)

  /* A HAINES SIGNATURE: the row's own words, never its Model Code */
  const haines = (tables as Fielded[]).find((t) => t.id === 'boat_haines') as Fielded
  const [seriesField, hainesName] = haines.hierarchy as [string, string]
  const codeField = haines.fields.find((f) => f.name === 'Model Code')?.id as string
  const first = rowsOf(haines.id)[0] as Row
  const hainesSaid = tidy(cell(first, hainesName))
  expect(hainesSaid).not.toBe(cell(first, codeField))
  const stamp = /^(.*?)\s*\(\s*(as at [^()]*?)\s*\)\s*$/i.exec(cell(first, seriesField))
  expect(stamp, 'the Haines series carries no stamp on this file').not.toBeNull()

  await page.goto(`/quote/new?brand=${haines.id}`)
  const list = page.getByRole('region', { name: 'Models' })
  /* the series by its name, the file's stamp beside its count */
  const head = list.locator('.picker-serieshead').filter({
    has: page.locator('.picker-serieshead__name', {
      hasText: new RegExp(`^${escapeRe(stamp![1]!)}$`),
    }),
  })
  await expect(head).toHaveCount(1)
  await expect(head).toContainText(stamp![2]!)
  expect(await head.innerText()).not.toMatch(/[()]/)

  const hainesCard = list.getByRole('button', { name: new RegExp(`^${escapeRe(hainesSaid)},`) })
  await expect(hainesCard).toHaveCount(1)
  await hainesCard.click()
  await expect(plate.getByRole('heading', { level: 2 })).toHaveText(hainesSaid)
  await expect(plate.locator('.picker-stage__series')).toHaveText(stamp![1]!)
  expect(await plate.locator('.picker-stage__crest').innerText()).not.toMatch(/[()]/)
})

/** WCAG's relative luminance of an sRGB colour, 0–255 a channel. */
const luminance = (rgb: number[]): number => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** One element's ink on another's fill, as the page paints the two: each colour is drawn
 *  on a canvas and read back, so a token the page computes in oklch is compared as the
 *  sRGB it is painted in. */
const ratio = async (ink: Locator, ground: Locator): Promise<number> => {
  const [a, b] = await ink.evaluate(
    (el, on) => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const pen = canvas.getContext('2d') as CanvasRenderingContext2D
      const srgb = (colour: string): number[] => {
        pen.clearRect(0, 0, 1, 1)
        pen.fillStyle = '#000'
        pen.fillStyle = colour
        pen.fillRect(0, 0, 1, 1)
        return [...pen.getImageData(0, 0, 1, 1).data].slice(0, 3)
      }
      return [
        srgb(getComputedStyle(el).color),
        srgb(getComputedStyle(on as Element).backgroundColor),
      ]
    },
    await ground.elementHandle(),
  )
  const [hi, lo] = [luminance(a as number[]), luminance(b as number[])].toSorted((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

/* ============================================================
   WHILE THE ACT WAITS IT IS NOT THE LOUDEST THING ON THE PLATE (the
   M2-close-2 critique's minor 21, again in m2-last-critique.md minor
   11): the ADV7 arrived with `Start the quote` refused in amber, the
   colour that on this screen means "press this", before any colour was
   chosen. It waits in the foot's own blue now, readable in both themes,
   and is the act's amber the moment a colour makes it live.
   ============================================================ */
test('while the act waits it is drawn quietly and read in both themes, and it is amber once live', async ({
  page,
}) => {
  await openPicker(page)
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, oneMaterialMany().name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const act = panel.getByRole('button', { name: 'Start the quote' })
  await expect(act).toHaveAttribute('aria-disabled', 'true')

  /* the colour a token names, as this page computes it */
  const token = (name: string): Promise<string> =>
    page.evaluate((prop) => {
      const probe = document.createElement('span')
      probe.style.backgroundColor = `var(${prop})`
      document.body.append(probe)
      const colour = getComputedStyle(probe).backgroundColor
      probe.remove()
      return colour
    }, name)
  const fill = (): Promise<string> => act.evaluate((el) => getComputedStyle(el).backgroundColor)
  const amber = await token('--color-act')
  const refusedAmber = await token('--color-act-refused')
  await expect.poll(fill).not.toBe(refusedAmber)
  expect(await fill()).not.toBe(amber)

  /* ITS LABEL ON ITS OWN FILL, AND ITS SENTENCE ON THE FOOT, at 4.5 : 1
     or better by day and by night. Read off the colours the page paints —
     through a canvas, so a token the page computes in oklch is compared
     as the sRGB it is painted in — and not off a screenshot. At 844 x 390
     the plate scrolls whole, and the page's contrast reader, bringing
     runs into view, left the plate scrolled 242px inside itself: its
     next reading measured "Colour · 5" at 1.52 : 1 off the band's pixels
     at 15–30, where the run would be were it not clipped by the plate,
     whose box began at 199 (measured 2026-09-25). The reader does not
     know a run can be clipped by its own scroller. */
  const say = panel.locator('.picker-act__say')
  await expect(say).not.toBeEmpty()
  const foot = panel.locator('.picker-stage__foot')
  for (const theme of THEMES) {
    await wearTheme(page, theme)
    expect(await ratio(act, act), `the waiting act's label by ${theme}`).toBeGreaterThanOrEqual(4.5)
    expect(await ratio(say, foot), `the act's sentence by ${theme}`).toBeGreaterThanOrEqual(4.5)
  }
  await wearTheme(page, 'day')

  await panel.locator('.picker-stage__foot .picker-chips--codes button').first().click()
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  await expect.poll(fill).toBe(amber)
})

/* ============================================================
   ON A TABLET HELD UPRIGHT THE COLOURS ARE NAMED ON THEIR CHIPS
   (m2-last-critique.md, minor 11: "at 834 and 390 the chips are
   swatches alone", and a finger has no hover to name one before it
   chooses it). Wherever the plate stands beside the list in a window
   900px tall or more, every colour the decode names is named on its
   chip; a phone and a window turned sideways keep the colours alone and
   name the one chosen under them (`picker.css` says why).
   ============================================================ */
test('where the plate has the room, every named colour is named on its chip', async ({ page }) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(
    size.width < 834 || size.height < 900,
    'a phone and a short window name the chosen colour under the chips instead',
  )
  await openPicker(page)
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, oneMaterialMany().name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const drawn = panel.locator('.picker-chip--colour[data-drawn]')
  expect(await drawn.count()).toBeGreaterThan(0)
  for (const chip of await drawn.all()) {
    const name = chip.locator('.picker-chip__colour')
    await expect(name).toBeVisible()
    /* and no line of a name begins on its separator: the space before
       each " / " is one a line cannot break at */
    expect(await name.textContent()).not.toMatch(/ [/·] /)
  }
  /* READ BACK AS THE BROWSER SET THEM (m2-last-critique.md, minor 8: at
     1440 a chip read "Black / Grey /" over "/ White/Blue"): no line of a
     chip opens on a separator, and a colour breaks inside itself only
     where it is as wide as the chip */
  const set = await setNames(
    panel.locator('.picker-chip--colour[data-drawn] .picker-chip__colour'),
    '.picker-chip__part',
  )
  expect(set.length).toBeGreaterThan(0)
  for (const chip of set) {
    expect(openingOnASeparator(chip.lines), chip.lines.join(' ⏎ ')).toEqual([])
    expect(chip.parts.length, chip.lines.join(' ')).toBeGreaterThan(0)
    for (const part of chip.parts)
      expect(part.lines === 1 || part.full, `"${part.text}" broke inside itself`).toBe(true)
  }
})
