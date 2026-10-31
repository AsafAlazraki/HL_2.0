import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { cardName } from '../mint'
import { acrossTheBar } from '../fold'
import { decodePng } from '../rulers/measure/pixels'
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

  /* THE HEAD SAYS WHAT TO DO AND STOPS (the refine round, 2026-10-21): the doors count their
     own models, and the price's name is said by the price on the plate, not here as well */
  /* REWRITTEN 2026-10-30: the first question is what is being sold (the owner: "quotes are not
     just boats"), so the doors' line is no longer "Choose the maker, then the boat." */
  const counts = page.getByTestId('picker-counts')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('What are you selling?')
  await expect(counts).toHaveText('A boat, or a motor, a trailer or a part on its own.')
  await expect(page.getByText(`${au(MODELS)} models`)).toHaveCount(0)
  await expect(page.getByText(`${RUNG} prices`)).toHaveCount(0)

  const doors = page.getByRole('region', { name: 'Boats' })
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
    .getByRole('region', { name: 'Boats' })
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
  await expect(page.getByRole('complementary', { name: 'What is chosen' })).toBeVisible()
  expect(await words(), 'a boat').toEqual([])
})

/* REWRITTEN 2026-10-31 (the owner, 2026-10-30: "the picking model color and all of that nonsense
   to be done in hull section and same for all boats"): a model of many versions no longer asks
   its material and colour on the plate, and the act no longer waits for them. It is live the
   moment the boat is chosen, and its sentence says where the rest is chosen. */
test('a model of many versions starts on its own, and says its material and colour are chosen in the hull section', async ({
  page,
}) => {
  await openPicker(page)
  const model = busiest()
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, model.name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText(model.name)
  const act = panel.getByRole('button', { name: 'Start the quote' })
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  await expect(panel.locator('.picker-act__say')).toHaveText(
    'Its material and colour are chosen in the hull section, where the price follows each one.',
  )
  /* nothing of the material or the colour is asked here */
  await expect(panel.getByText('Material', { exact: true })).toHaveCount(0)
  await expect(panel.getByText(/^Colour ·/)).toHaveCount(0)
  await expect(panel.locator('.picker-money__fig')).toHaveText(/^from \$/)

  /* and the hull chapter is where they are chosen */
  await act.click()
  await expect(page).toHaveURL(/\/quote\/[^/?]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('boat-choices')).toBeVisible()
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
test('the act is on the screen, live, the moment a boat is chosen', async ({ page }) => {
  await openPicker(page)
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, busiest().name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')

  const figure = panel.locator('.picker-money__fig')
  await expect(act).toBeInViewport({ ratio: 1 })
  await expect(figure).toBeInViewport({ ratio: 1 })
  await expect.poll(() => inTheRoom(page, [act, figure])).toEqual([])
})

/* IN A HAND, A BOAT WITH NOTHING TO ASK OPENS WITH ITS ACT IN REACH, AT REST
   (the refine round, 2026-10-21). With the 519 Sea Ranger SDF chosen at 390 x 844 only the top
   edge of "Start the quote" stood above the tab bar, and a scroll freed it, so no ruler saw it.
   The cause was the find field over the plate, filtering a list the plate had replaced: it now
   goes with the list, and the page is read with the window at the top, never scrolled for it. */
test('in a hand, a boat of one version has its act above the tab bar with nothing scrolled', async ({
  page,
}) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(size.width >= 834, `the list stands beside the plate at ${size.width}`)
  await openPicker(page)
  await page.getByLabel(/Find a model/).fill('519')
  await page
    .getByRole('region', { name: 'Models' })
    .getByRole('button', { name: /^519 Sea Ranger SDF · Centre Console,/ })
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  /* the field finds in the list, so it leaves with the list, and the way back stays */
  await expect(page.getByLabel(/Find a model/)).toBeHidden()
  await expect(panel.getByRole('button', { name: 'All the models' })).toBeVisible()

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  const figure = panel.locator('.picker-money__fig')
  await expect.poll(() => inTheRoom(page, [act, figure])).toEqual([])

  /* and back on the list the field stands over it with the words still in it */
  await panel.getByRole('button', { name: 'All the models' }).click()
  await expect(page.getByLabel(/Find a model/)).toHaveValue('519')
})

/* REWRITTEN 2026-10-31: the ADV7's colours stood in the plate's foot over a refused act; they are
   chosen in the hull section now, so a boat of one material and many colours is live at once,
   says so, and its name, its price and its act are in one window with nothing scrolled. */
test('a boat of one material and many colours is live at once, its price and act in the window', async ({
  page,
}) => {
  await openPicker(page)
  const model = oneMaterialMany()
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await chooseModel(page, model.name)

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  await expect(panel.locator('.picker-act__say')).toHaveText(
    'Its colour is chosen in the hull section, where the price follows it.',
  )
  await expect(panel.locator('.picker-chips--codes')).toHaveCount(0)
  const figure = panel.locator('.picker-money__fig')
  await expect(act).toBeInViewport({ ratio: 1 })
  await expect.poll(() => inTheRoom(page, [figure, act])).toEqual([])
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
test('a boat pressed at the foot of its maker’s list opens in the window, price and act with it', async ({
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
  const figure = panel.locator('.picker-money__fig')
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  await expect(name).toHaveText(model.name)

  for (const seen of [name, figure, act])
    await expect(seen, `${seen} after the press, from scrollY ${from}`).toBeInViewport({
      ratio: 1,
    })
  await expect.poll(() => inTheRoom(page, [name, figure, act])).toEqual([])
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
  await expect(page.getByRole('complementary', { name: 'What is chosen' })).toBeVisible()
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
  /* REWRITTEN 2026-10-30: the doors page now also holds what is sold on its own under the boats
     (the owner: "quotes are not just boats"), so the page's measure is the boats' part of it —
     the whole less the shelves' own height — and that is still under three windows */
  const tall = await page.evaluate(() => {
    const whole = (document.scrollingElement as HTMLElement).scrollHeight
    const shelves = document.querySelector<HTMLElement>('.picker-alone')
    return whole - (shelves ? shelves.getBoundingClientRect().height : 0)
  })
  expect(tall, `${tall}px of boats' page with nothing chosen`).toBeLessThan(size.height * 3)

  const table = boats.find((t) => t.id === HIGHFIELD) as Table
  await page
    .getByRole('region', { name: 'Boats' })
    .getByRole('button', { name: new RegExp(`^${escapeRe(table.name)},`) })
    .click()
  await expect(page.getByRole('region', { name: 'Models' })).toBeVisible()

  /* and "All makers" is the way back, named for where it goes — its arrow is a glyph
     beside the words since the component kit (2026-09-28), so a reader hears the words */
  await page.getByRole('button', { name: 'All makers', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Boats' })).toBeVisible()

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

/* ============================================================
   THE ACT NEVER COVERS THE PRICE, AND EVERY WORD ON IT IS TRUE WHEN IT IS
   READ (components-critique-2.md, major 4). Caught frame by frame at 1440
   on a boat with no draft: the press filed its draft, the render that
   caused found a draft standing, and for the route's crossfade the act
   re-labelled itself "Open the draft already standing", widened over the
   price — its left edge at x 1041, "$28,450" ending at 1053 — and said
   "…so this reopens it rather than starting a second" directly above
   "Quote … is started — opening the build". With a draft really standing
   the long label ran over the price at rest too, at 1280 and 1440; and on
   the tablet "Start the quote" ran over "$1,456,990" by a pixel.

   Walked on the dearest boat a maker files one line for, found off the
   file: its figure is the widest a plate is asked to hold. The act is read
   at rest, on every frame and every change of the page from the press to
   the build, and again once its draft really stands. AT EVERY SIZE.
   ============================================================ */
/** The dearest line of any maker that files one line per model, off the file. */
const dearestOneLine = (): { table: Table; price: number } => {
  let best: { table: Table; price: number } | null = null
  for (const table of boats) {
    if ((table.hierarchy ?? []).length >= 3) continue
    const field = table.priceLevels?.find((l) => l.key === 'cash')?.fieldId
    if (!field) continue
    for (const row of rowsOf(table.id)) {
      const price = Number(row.values[field])
      if (Number.isFinite(price) && (best === null || price > best.price)) best = { table, price }
    }
  }
  if (!best) throw new Error('no maker on this file files one priced line per model')
  return best
}

/** What stands between the act and the price, read off the page as it is painted: the
 *  price's own words against the act's box, and each of them against the plate's edges. */
interface Measured {
  actFaults: () => string[]
  actSeen: { label: string; say: string; made: string; faults: string[] }[]
  actStop: boolean
}
const measureTheAct = (): void => {
  ;(window as unknown as Measured).actFaults = () => {
    const fig = document.querySelector('.picker-money__fig')
    const act = document.querySelector('.picker-act button')
    const plate = document.querySelector('.picker-stage')
    if (!fig || !act || !plate) return []
    const words = document.createRange()
    words.selectNodeContents(fig)
    const t = words.getBoundingClientRect()
    const a = act.getBoundingClientRect()
    const p = plate.getBoundingClientRect()
    /* spans in whole pixels, for the sentence a failure says */
    const [tl, tr, al, ar] = [t.left, t.right, a.left, a.right].map((n) => Math.round(n))
    const faults: string[] = []
    if (t.right > a.left && t.left < a.right && t.bottom > a.top && t.top < a.bottom)
      faults.push(
        `"${act.textContent}" at x ${al}–${ar} covers "${fig.textContent}" at x ${tl}–${tr}`,
      )
    if (t.left < p.left - 0.5 || t.right > p.right + 0.5)
      faults.push(`"${fig.textContent}" runs out of the plate at x ${tl}–${tr}`)
    if (a.left < p.left - 0.5 || a.right > p.right + 0.5)
      faults.push(`"${act.textContent}" runs out of the plate at x ${al}–${ar}`)
    return faults
  }
}

test('the act never covers the price, and says only what is true, from rest to the build', async ({
  page,
}, testInfo) => {
  await page.addInitScript(measureTheAct)
  await openPicker(page)
  const { table, price } = dearestOneLine()
  const figure = `$${au(price)}`
  const faults = (): Promise<string[]> =>
    page.evaluate(() => (window as unknown as Measured).actFaults())

  /* AT REST, on a boat with no draft */
  await page.goto(`/quote/new?brand=${table.id}`)
  await pressAs(
    page
      .getByRole('region', { name: 'Models' })
      .getByRole('button', { name: new RegExp(`, ${escapeRe(figure)}$`) })
      .first(),
    testInfo.project.use.hasTouch,
  )
  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(panel.locator('.picker-money__fig')).toHaveText(figure)
  const act = panel.getByRole('button', { name: 'Start the quote' })
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  expect(await faults(), 'at rest').toEqual([])

  /* PRESSED: every change of the page and every frame until the build is drawn */
  await page.evaluate(() => {
    const w = window as unknown as Measured
    w.actSeen = []
    w.actStop = false
    const read = (): void => {
      const button = document.querySelector('.picker-act button')
      if (!button) return
      w.actSeen.push({
        label: button.textContent ?? '',
        say: document.querySelector('.picker-act__say')?.textContent ?? '',
        made: document.querySelector('.picker-made')?.textContent ?? '',
        faults: w.actFaults(),
      })
    }
    new MutationObserver(read).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    })
    const frame = (): void => {
      read()
      if (!w.actStop) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  })
  await pressAs(act, testInfo.project.use.hasTouch)
  await expect(page).toHaveURL(/\/quote\/(?!new\b)[^/?]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('running-total')).toBeVisible()
  const seen = await page.evaluate(() => {
    const w = window as unknown as Measured
    w.actStop = true
    return w.actSeen
  })
  /* the render the press caused was read: the plate said what the press wrote */
  expect(seen.some((s) => /is started/.test(s.made))).toBe(true)
  expect([...new Set(seen.map((s) => s.label))], 'the act, pressed').toEqual(['Start the quote'])
  expect([...new Set(seen.map((s) => s.say))], "the act's sentence, pressed").toEqual([''])
  expect(seen.flatMap((s) => s.faults)).toEqual([])

  /* BACK TO THE SAME BOAT, whose draft now really stands: the act says so, and still clear */
  await page.goBack()
  await expect(panel.locator('.picker-money__fig')).toHaveText(figure)
  await expect(panel.getByRole('button', { name: 'Open the draft already standing' })).toBeVisible()
  await expect(panel.locator('.picker-act__say')).toHaveText(
    'A draft for this boat is already started with nobody named on it, so this reopens it rather than starting a second.',
  )
  expect(await faults(), 'with the draft standing').toEqual([])
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
  /* the series is said once on the plate: "Fisher Series" stood over "Signature Fisher 525F",
     so where the name carries it there is no eyebrow (the refine round's second pass) */
  const crest = await plate.locator('.picker-stage__crest').innerText()
  const stem = (stamp![1]!.split(/\s+/)[0] ?? '').toLowerCase()
  expect(crest.toLowerCase().split(stem).length - 1).toBe(1)
  expect(crest).not.toMatch(/[()]/)
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
   11). REWRITTEN 2026-10-31: a boat's colour no longer holds the act
   back (it is chosen in the hull section), so the act that waits is a
   product's on a shelf sold only with a boat: it waits in the foot's own
   blue, readable in both themes, and is the act's amber the moment the
   switch beside its sentence sells the shelf on its own.
   ============================================================ */
test('while the act waits it is drawn quietly and read in both themes, and it is amber once live', async ({
  page,
}) => {
  await openPicker(page)
  const shelves = page.getByRole('region', { name: 'Sold on its own' })
  const shut = shelves.locator('.picker-shelf').filter({ has: page.locator('.picker-shelf__shut') })
  const row = shut.first().locator('.picker-shelf__rows button').first()
  await row.scrollIntoViewIfNeeded()
  await row.click()
  await page
    .getByRole('region', { name: 'Models' })
    .locator('.picker-cards__item button')
    .first()
    .click()

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

  await panel.getByRole('button', { name: 'Sell it on its own too' }).click()
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  await expect.poll(fill).toBe(amber)
})

/* ============================================================
   SCROLLED, THE BOATS GO UNDER THE CAP AND NEVER STAND BESIDE OR
   THROUGH THE PILL (components critique, major 15). Measured before at
   834 x 1112 on Highfield scrolled 520px: a series head stuck at 0–33
   under a pill at 8–50, "ROLL-UP" read out beside the crest, and the
   tiles' discs showed through the glass. Where the page is the
   scroller and the pill is at the top, a stuck series head now stands
   below the pill's box, and the strip beside the pill is the list's
   own floor and nothing else — one colour, read off the pixels.
   ============================================================ */
test('scrolled, the list goes under a floor at the top and its series head stands clear of the pill', async ({
  page,
}, info) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(size.width < 600, 'in a hand the pill is the tab bar at the foot')
  test.skip(
    fixedRoom(size),
    'where the room is fixed the list scrolls inside itself, below the band',
  )

  await openPicker(page)
  await page.goto(`/quote/new?brand=${HIGHFIELD}`)
  await expect(page.getByTestId('picker-counts')).toBeVisible()

  /* the page brought well past the list's first series head, so it is stuck */
  const head = page.locator('.picker-serieshead').first()
  const at = await head.evaluate((el) => el.getBoundingClientRect().top + scrollY)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), at + 240)
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )

  const pill = (await page.getByTestId('shell-pill').boundingBox()) as {
    x: number
    y: number
    width: number
    height: number
  }
  const stuck = await page.evaluate(() => {
    const heads = [...document.querySelectorAll('.picker-serieshead')].map((el) =>
      el.getBoundingClientRect(),
    )
    const top = heads.filter((r) => r.bottom > 0).toSorted((a, b) => a.top - b.top)[0]
    return top ? { top: top.top, bottom: top.bottom } : null
  })
  expect(stuck, 'no series head is on the screen').not.toBeNull()
  expect(stuck!.top, 'the series head sticks under the pill, not behind it').toBeGreaterThanOrEqual(
    pill.y + pill.height - 0.5,
  )

  /* the strip beside the pill, clear of its shadow: the floor alone */
  const clip = {
    x: 0,
    y: 0,
    width: Math.floor(pill.x - 24),
    height: Math.floor(pill.y + pill.height),
  }
  const shot = await page.screenshot({ clip })
  await info.attach('beside the pill, scrolled', { body: shot, contentType: 'image/png' })
  const img = decodePng(shot)
  const first = [img.data[0]!, img.data[1]!, img.data[2]!]
  let worst = 0
  for (let i = 0; i < img.data.length; i += 4) {
    for (let c = 0; c < 3; c++) worst = Math.max(worst, Math.abs(img.data[i + c]! - first[c]!))
  }
  expect(worst, 'a tile or a word stands in the strip beside the pill').toBeLessThanOrEqual(2)
})

/* ============================================================
   build-close-critique.md, minors 13 and 14 of the second critique:
   an empty ring on every card's photograph, and "519" drawn one card
   to a row with two thirds of the list blank.
   ============================================================ */
test('a search sets its boats side by side, and no tick lies on a photograph', async ({ page }) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(size.width < 834, 'in a hand the plate is the page, and the list is not beside it')

  await openPicker(page)
  await page.getByLabel(/Find a model/).fill('519')
  const list = page.getByRole('region', { name: 'Models' })
  await expect(list.locator('.picker-cards__item').first()).toBeVisible()

  /* one run of cards, no series head, and as many cards on the first row as it holds */
  await expect(list.locator('.picker-serieshead')).toHaveCount(0)
  const tops = await list
    .locator('.picker-cards__item')
    .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)))
  expect(tops.length).toBeGreaterThan(2)
  expect(tops.filter((t) => t === tops[0]).length, 'one card to a row').toBeGreaterThan(1)

  /* at rest nothing is drawn at a card's corner */
  const lit = await list
    .locator('.ui-tile-tick')
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== '0').length)
  expect(lit, 'a tick is drawn on a card nobody chose').toBe(0)

  /* chosen, its tick stands clear of its photograph */
  await list.getByRole('button', { name: /^519 Sea Ranger SDF · Centre Console,/ }).click()
  const chosen = list.locator('.ui-tile[aria-pressed="true"]')
  await expect(chosen.locator('.ui-tile-tick')).toHaveCSS('opacity', '1')
  const tick = (await chosen.locator('.ui-tile-tick').boundingBox())!
  const frame = (await chosen.locator('.picker-card__frame').boundingBox())!
  expect(tick.y, 'the tick lies on the photograph').toBeGreaterThanOrEqual(frame.y + frame.height)
  const card = (await chosen.boundingBox())!
  expect(tick.y + tick.height).toBeLessThanOrEqual(card.y + card.height)
  expect(tick.x + tick.width).toBeLessThanOrEqual(card.x + card.width)
})

/* THE FIRST WINDOW ENDS ON A SEAM (refine-critique.md, major 5): at 390 the second row's "from
   $2,770" and "from $74,410" stood half over the tab bar and half under it with nothing scrolled.
   REWRITTEN 2026-10-31: in a hand a maker's door is its mark and its figures on one row, so the
   seven makers take one window and the shelves begin in it (the critic's S-4, "quotes are not
   just boats"); nothing stands across the bar, and the first shelf is in the window. */
test('in a hand, the makers and the first shelf are in the first window, and nothing stands across the bar', async ({
  page,
}) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(size.width >= 600, `the pill is not at the foot at ${size.width}`)
  await openPicker(page)
  await expect(page.getByRole('region', { name: 'Boats' })).toBeVisible()
  await expect.poll(() => acrossTheBar(page, '[data-testid="picker"]')).toEqual([])
  const doors = page.getByRole('region', { name: 'Boats' }).getByRole('listitem')
  await expect(doors.last()).toBeInViewport({ ratio: 1 })
  const shelves = page.getByRole('region', { name: 'Sold on its own' })
  await expect.poll(() => inTheRoom(page, [shelves.getByRole('heading', { level: 2 })])).toEqual([])
  /* and the field is still named for a reader, by the words its line no longer spends */
  await expect(page.getByLabel(/Find a model/)).toBeVisible()
})

/* ============================================================
   NOT JUST BOATS (the owner, 2026-10-30: "quotes are not just boats - also motors or trailers
   or even dealer fit things as well and you can sell those as well"). A motor on its own (a
   repower), a trailer on its own and a part on its own each start from New quote's shelves and
   reach the build at the quote's own address. Parts & Accessories is sold only with a boat until
   Northside says otherwise, which it says where it is refused (`letQuote`, one step with Undo).
   ============================================================ */
test('a motor, a trailer and a part each start a quote of their own and reach the build', async ({
  page,
}, testInfo) => {
  /* THREE WALKS INTO THE BUILD, AND THE BUILD NOW OPENS WITH EVERY CHAPTER STANDING (the owner,
     2026-10-31). Measured alone on one worker, 2026-10-31: 22.5 s at 1440, 25.1 s at 834 and
     30.7 s at 390 — over the 30 s default at a phone, and every project ran out of it while
     other runs shared the machine. The walk is the same; its budget is three builds' worth. */
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const touch = testInfo.project.use.hasTouch
  await openPicker(page)

  /* `fresh` opens New quote at its address; a switch just pressed is pressed on, in the same
     page, rather than across a reload that would race its own write */
  const startOn = async (list: RegExp, which: string, fresh = true): Promise<void> => {
    if (fresh) await page.goto('/quote/new')
    const shelves = page.getByRole('region', { name: 'Sold on its own' })
    const door = shelves.getByRole('button', { name: list })
    await door.scrollIntoViewIfNeeded()
    await pressAs(door, touch)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(which)
    const card = page.getByRole('region', { name: 'Models' }).locator('.picker-cards__item button')
    await pressAs(card.first(), touch)
    const act = page
      .getByRole('complementary', { name: 'What is chosen' })
      .getByRole('button', { name: 'Start the quote' })
    await act.scrollIntoViewIfNeeded()
    await pressAs(act, touch)
    await expect(page).toHaveURL(/\/quote\/(?!new)[^/?]+$/)
    await expect(page.getByTestId('configurator')).toBeVisible()
  }

  await startOn(/^Yamaha Outboards, /, 'Which motor is it?')
  await startOn(/^Dunbier Trailers, /, 'Which trailer is it?')

  /* THE SHELF SOLD ONLY WITH A BOAT SAYS SO, AND IS SWITCHED WHERE IT IS REFUSED */
  await page.goto('/quote/new')
  const parts = page.getByRole('region', { name: 'Sold on its own' })
  await expect(
    parts.getByText(
      'Parts & Accessories is sold only with a boat today, so it cannot start a quote on its own.',
    ),
  ).toBeVisible()
  const sell = parts.getByRole('button', { name: 'Sell it on its own too' }).first()
  await sell.scrollIntoViewIfNeeded()
  await pressAs(sell, touch)
  await expect(parts.getByText(/^Parts & Accessories is sold only with a boat/)).toHaveCount(0)
  await startOn(/^Parts & Accessories, /, 'Which product is it?', false)

  expect(errors).toEqual([])
})
