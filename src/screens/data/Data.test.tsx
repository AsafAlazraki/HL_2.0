import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { DESK_PLACE, FILED_AT_THIS_DESK, fittedBoats } from '@/domain/modules/register'
import { queueOf } from '@/domain/rules/review/cases'
import { countBoats } from '@/domain/quote/boats'
import { findBoats } from '@/domain/fitment/boat'
import { review } from '@/domain/rules/review/checks'
import { readLadder } from '@/screens/levels/read'
import { PRICE_LIST_ROOMS } from '@/app/ways'
import { Data, NO_WAY_TO_THE_SHEET, type DataPosition } from './Data'

/* ============================================================
   THE REGISTER OF TABLES, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   The real pack is loaded into the real catalogue store before every
   case, so every figure asserted below is COUNTED off the file twice
   — once by the screen through `domain/modules/register`, and once
   here off `pack.entities` — and a screen that had drifted from the
   file could not make both readings agree. No table, count, maker or
   sentence is written down in this file.

   THE ONE THING THAT IS WRITTEN is the register a dealer makes, and
   it is made the way a dealer makes one: by pressing the act, typing
   a name and pressing Make it. It is then undone, which is the other
   half of what this screen owes.

   The seams are functions handed in, the way the route hands them in,
   so the screen never reaches for a router and the refusal it says
   when it was handed nowhere to go can be read.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

beforeEach(async () => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
})

/* ---- what the file holds, counted here, independently ----- */

const base = () => pack.entities.filter((e) => e.role !== 'join')
const joins = () => pack.entities.filter((e) => e.role === 'join')
const boats = () => base().filter((e) => e.kind === 'boat')
const allRows = () =>
  pack.entities.reduce((n, e) => n + (pack.rowsByEntity[e.id]?.length ?? 0), 0)
const grouped = (n: number): string => n.toLocaleString('en-AU')

let positions: DataPosition[] = []
let openedTable: string[] = []
let wentHome = 0

const seams = {
  onPosition: (p: DataPosition) => {
    positions.push(p)
  },
  openTable: (id: string) => {
    openedTable.push(id)
  },
  goHome: () => {
    wentHome += 1
  },
}

beforeEach(() => {
  positions = []
  openedTable = []
  wentHome = 0
})

const draw = (over: Record<string, unknown> = {}) =>
  render(<Data business="Northside Marine" {...seams} {...over} />)
/** the same screen handed nowhere to go, which is what the refusal is about */
const drawStranded = () => render(<Data business="Northside Marine" />)

const grid = () => screen.getByRole('grid', { name: 'Lists' })
const rowFor = (name: RegExp) => within(grid()).getByRole('row', { name })

/* ---------------------------------------------------------- */

describe('the head, which is the file counted', () => {
  /* the refine round's second pass, 2026-10-21: "28 say what fits which boat" stood over rows
     that each say what they fit */
  it('says the price list’s size once, in lists and lines, and nothing the rows say', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Data')
    const counts = screen.getByTestId('data-counts')
    expect(counts).toHaveTextContent(`${grouped(allRows())} lines`)
    expect(counts).toHaveTextContent(`${grouped(pack.entities.length)} lists`)
    expect(counts).not.toHaveTextContent(/what fits/)
    /* the file in one vocabulary, the dealer's: never the engine's tables, rows or pairings */
    expect(counts.textContent ?? '').not.toMatch(/(tables?|rows?|pairing)/i)
  })

  it('says the price list’s date, and keeps the file’s one fingerprint as that line’s hover', () => {
    draw()
    const stamp = screen.getByTestId('data-file')
    expect(stamp).toHaveTextContent(/^The price list of \d{1,2} [A-Z][a-z]+ \d{4}$/)
    /* the fingerprint is the file's own, said once, where a person who wants it hovers — and
       printed nowhere a dealer reads past it (docs/WORDS.md) */
    expect(stamp.getAttribute('title')).toContain(pack.manifest.sourceFingerprint!)
    expect(screen.queryAllByText(pack.manifest.sourceFingerprint!)).toHaveLength(0)
    /* and the business is the crest's, not a second eyebrow here */
    expect(screen.queryByText('Northside Marine')).toBeNull()
  })
})

describe('the shelf of makers, which is the showpiece', () => {
  it('is one plate per boat table the file brought, and no more', () => {
    draw()
    const plates = screen.getAllByTestId('plate')
    expect(plates).toHaveLength(boats().length)
    /* by the door's own accessible name, which is the maker and what it
       holds; a chip named "Stacer Trailers" is a trailer table on a
       boat's plate and is not a plate */
    const doors = plates.map((p) => p.querySelector('.dt-plate__door')?.getAttribute('aria-label'))
    for (const boat of boats()) {
      expect(doors.some((d) => d?.startsWith(`${boat.name} · `))).toBe(true)
    }
  })

  it('counts a maker in models, as Home and the picker count it, never “rows”', () => {
    draw()
    const shelf = screen.getByTestId('data-shelf')
    const highfield = pack.entities.find((e) => e.id === 'boat_highfield')!
    const lines = pack.rowsByEntity[highfield.id]!.length
    const models = countBoats([highfield], pack.rowsByEntity).boats
    expect(models).toBeLessThan(lines)
    expect(shelf).toHaveTextContent(`${grouped(models)} models in`)
    /* one figure for one maker: its lines are its spread's, not the plate's */
    expect(shelf).not.toHaveTextContent(`${grouped(lines)} variants`)
    /* every plate's count line, and not the whole shelf: the workbook
       sentence under a plate at the showroom width says "rows 4–142",
       which is the file's own words for a range and not this screen
       calling a boat a row */
    for (const line of shelf.querySelectorAll('.dt-plate__holds')) {
      expect(line.textContent ?? '').not.toMatch(/\brows?\b/)
    }
  })

  it('sets a maker with no held mark in type, and stands nothing in for it', () => {
    draw()
    /* Stabicraft's ledger row records "no public wordmark verified", so
       the name IS the mark. Read off the ledger, not named here: the
       one plate that draws no image is the one whose name is typed. */
    const plates = screen.getAllByTestId('plate')
    const typed = plates.filter((p) => p.querySelector('.dt-plate__typed') !== null)
    const drawn = plates.filter((p) => p.querySelector('img') !== null)
    expect(typed.length + drawn.length).toBe(plates.length)
    expect(typed.length).toBeGreaterThan(0)
    for (const plate of typed) expect(plate.querySelector('img')).toBeNull()
  })

  it('names every list that goes with a maker inside its plate, once, with no count', async () => {
    draw()
    const shelf = screen.getByTestId('data-shelf')
    /* by class and not by role: between 640 and 1439 the named lines give
       way to one line of glyphs per plate, and happy-dom has no width, so
       both are in the tree */
    const chips = [...shelf.querySelectorAll<HTMLElement>('.dt-chip')]
    expect(chips.length).toBe(joins().length)
    /* inside the plate: what goes with a maker and the maker share one paper */
    for (const chip of chips) expect(chip.closest('[data-testid="plate"]')).not.toBeNull()
    /* the engine's words and its unit reach no plate */
    expect(shelf.textContent ?? '').not.toMatch(/\b(join|pairings?)\b/i)
    for (const chip of chips) expect(chip.textContent ?? '').not.toMatch(/\d/)
    /* and a line opens the list of which fits which, naming its two ends —
       the same press a plate and a row take */
    await userEvent.click(chips[0]!)
    const page = screen.getByTestId('data-page')
    expect(page).toHaveTextContent('What fits which boat')
    expect(page).toHaveTextContent(/ for /)
  })
})

describe('a row, and the page it opens', () => {
  it('says its count in its own noun and what it fits, and nothing the rows around it share', () => {
    draw()
    const yamaha = rowFor(/Yamaha Outboards/)
    const rows = pack.rowsByEntity['mot_yamaha']!.length
    expect(yamaha).toHaveTextContent(`${grouped(rows)} motors`)
    /* the boats it fits, counted as Rules and the picker count a boat, never the six makers'
       lists that name it (built-critique-m3.md, major 11: "fits 6 boats") */
    const fitted = fittedBoats('mot_yamaha', catalogue.getState().tables, catalogue.getState().rows)
    expect(fitted).toBeGreaterThan(6)
    expect(yamaha).toHaveTextContent(`fits ${grouped(fitted)} boats`)
    /* its kind is its glyph and its count's noun, and its workbook is on its spread: a row
       that said "Motors" and "Motor Module" said what every row beside it said, and the
       place says "Motors" once, on the first row of its run */
    expect(yamaha.querySelector('.dt-cell--kind')?.textContent).toBe('')
    expect(rowFor(/ePropulsion/)).not.toHaveTextContent('Motors')
    expect(yamaha).not.toHaveTextContent('Motor Module')
    /* and no hover carries the pack generator's own notes */
    expect(yamaha.querySelectorAll('[title]')).toHaveLength(0)
    expect(yamaha).not.toHaveAttribute('title')
  })

  it('says so, in a dealer’s words, for a list no boat names', () => {
    draw()
    expect(rowFor(/Dunbier Trailers/)).toHaveTextContent('fits no boat yet')
    expect(rowFor(/Labour Rates/)).toHaveTextContent('not tied to a boat')
  })

  it('opens a page with the table’s own provenance and its prices in the sale’s names', async () => {
    draw()
    await userEvent.click(rowFor(/NSM Custom Trailers/))
    const page = screen.getByTestId('data-page')
    expect(within(page).getByRole('heading', { name: 'NSM Custom Trailers' })).toBeInTheDocument()
    expect(page).toHaveTextContent('Where from')
    expect(page).toHaveTextContent('Trailer Module')
    /* the workbook and its tab, and not the pack generator's reading notes after them */
    const nsm = pack.entities.find((e) => e.name === 'NSM Custom Trailers')!
    expect(page.textContent ?? '').not.toContain(nsm.description!.trim())
    expect(page.textContent ?? '').not.toMatch(/sheet “/)
    /* ITS PRICES IN THE SALE'S NAMES — Cash, as the build and the quote say it — with the
       file's own column name one hover away, and never a count of columns (the refine
       round's third pass, 2026-10-21) */
    expect(page.textContent ?? '').toMatch(/Prices\s*Cash/)
    expect(page.textContent ?? '').not.toMatch(/\bcolumns?\b|Priced at|Sell inc Rego/i)
    /* WHICH EXACT FILE IS THE HEAD'S HOVER, SAID ONCE: no list repeats the whole file's code */
    expect(page).not.toHaveTextContent(pack.manifest.sourceSha256!)
    expect(page.textContent ?? '').not.toMatch(/sha256|fingerprint/i)
    expect(page.textContent ?? '').not.toMatch(/re-?import/i)
    /* a dealer never meets the words for the mechanism */
    expect(page.textContent ?? '').not.toMatch(/\b(entity|schema|field type|reference|join)\b/i)
  })

  it('hands the position back, so the address carries what is open', async () => {
    draw()
    await userEvent.click(rowFor(/Mackay Trailers/))
    expect(positions.at(-1)?.at).toBe('trl_mackay')
  })

  it('opens the sheet at the id the sheet is addressed by', async () => {
    draw()
    await userEvent.click(rowFor(/Mackay Trailers/))
    const page = screen.getByTestId('data-page')
    await userEvent.click(within(page).getByRole('button', { name: /Open the list/ }))
    expect(openedTable).toEqual(['trl_mackay'])
  })

  it('refuses in a sentence where the press happened when there is nowhere to go', async () => {
    drawStranded()
    await userEvent.click(rowFor(/Mackay Trailers/))
    const page = screen.getByTestId('data-page')
    const act = within(page).getByRole('button', { name: /Open the list/ })
    /* never a silently disabled control: it is pressable and it says why */
    expect(act).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(act)
    expect(screen.getAllByText(NO_WAY_TO_THE_SHEET).length).toBeGreaterThan(0)
  })
})

describe('finding one of fifty-three', () => {
  it('narrows on the name, the kind, the place or the workbook, and counts what is left', async () => {
    draw()
    const field = screen.getByRole('searchbox', { name: 'Find a list' })
    await userEvent.type(field, 'trailer')
    expect(within(grid()).queryByRole('row', { name: /Labour Rates/ })).toBeNull()
    expect(within(grid()).getByRole('row', { name: /Dunbier Trailers/ })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('lists match')
    expect(positions.at(-1)?.find).toBe('trailer')
  })

  it('says so when nothing answers to what was typed', async () => {
    draw()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find a list' }), 'zzzz')
    expect(screen.getByText(/Nothing on the price list is called/)).toBeInTheDocument()
  })
})

describe('the one write, and its way back', () => {
  it('makes a list of the dealer’s own and can take it back, on the screen', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'New list' }))
    const dialog = await screen.findByRole('dialog')
    /* in the dealer's words, with no promise about rows and columns */
    expect(dialog.textContent ?? '').not.toMatch(/\b(register|rows?|columns?|workbook|kind)\b/i)
    await userEvent.type(within(dialog).getAllByRole('textbox')[0]!, 'Boat show leads')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Make it' }))

    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent('Boat show leads')
    /* THE FILE DID NOT GROW (critique of Milestone 2's close, blocker 2):
       the head still counts the price file under its fingerprint; the
       table made here is listed apart, under the desk's own place */
    expect(screen.getByTestId('data-counts')).toHaveTextContent(`${grouped(pack.entities.length)} lists`)
    /* the list it made opens as its own spread, made here */
    const spread = screen.getByTestId('data-page')
    expect(within(spread).getByRole('heading', { name: 'Boat show leads' })).toBeInTheDocument()
    expect(spread).toHaveTextContent(FILED_AT_THIS_DESK)
    /* and back at the lists it is a row under the dealer's own place, said once in its head */
    await userEvent.click(within(spread).getByRole('button', { name: /Back to the lists/ }))
    const own = within(grid()).getByRole('rowgroup', { name: DESK_PLACE })
    expect(within(own).getByRole('row', { name: /Boat show leads/ })).toHaveTextContent(DESK_PLACE)

    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(within(grid()).queryByRole('row', { name: /Boat show leads/ })).toBeNull()
    expect(screen.getByTestId('data-counts')).toHaveTextContent(`${grouped(pack.entities.length)} lists`)
    expect(within(step).getByRole('button', { name: 'Put it back' })).toBeInTheDocument()
  })
})

describe('a browser with no file in it', () => {
  it('says so, teaches, stands nothing in, and offers the door back', async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
    draw({ openTheFile: () => {} })
    expect(
      screen.getByRole('heading', { name: 'No price list is open on this computer.' }),
    ).toBeInTheDocument()
    for (const question of ['What lands here', 'Why it is empty today', 'What to do']) {
      expect(screen.getByText(question)).toBeInTheDocument()
    }
    expect(screen.queryAllByTestId('plate')).toHaveLength(0)
    expect(screen.queryByRole('grid', { name: 'Lists' })).toBeNull()
    expect(document.querySelectorAll('main img')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Load the Master Price File' })).toHaveAttribute(
      'aria-disabled',
      'false',
    )
  })
})

describe('the way out', () => {
  it('draws no way home of its own: the pill carries Home on every screen (rule (a))', () => {
    draw()
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
    expect(wentHome).toBe(0)
  })
})

/* ---------------------------------------------------------- */

describe('a maker, opened', () => {
  const highfield = () => boats().find((b) => b.id === 'boat_highfield')!
  const door = (name: string) =>
    screen
      .getAllByTestId('plate')
      .map((p) => p.querySelector<HTMLElement>('.dt-plate__door')!)
      .find((d) => d.getAttribute('aria-label')?.startsWith(`${name} · `))!

  it('opens as a spread in the room the ledger had, not as a column beside it', async () => {
    draw()
    await userEvent.click(door(highfield().name))
    const spread = screen.getByTestId('data-page')
    expect(within(spread).getByRole('heading', { name: highfield().name })).toBeInTheDocument()
    /* the ledger steps away: its rows are kept, and none of them can be read */
    expect(screen.queryByRole('grid', { name: 'Lists' })).toBeNull()
    expect(door(highfield().name)).toHaveAttribute('aria-pressed', 'true')
    expect(positions.at(-1)?.at).toBe('boat_highfield')
  })

  it('draws its lineup off the file, every heading counted and adding back to the maker', async () => {
    draw()
    await userEvent.click(door(highfield().name))
    const spread = screen.getByTestId('data-page')
    const bars = [...spread.querySelectorAll('.dt-bar')]
    /* counted here, off the pack, the way the file cuts it */
    const first = highfield().hierarchy![0]!
    const heads = new Map<string, number>()
    for (const row of pack.rowsByEntity[highfield().id]!) {
      const v = row.values[first]
      if (typeof v === 'string' && v.trim() !== '')
        heads.set(v.trim(), (heads.get(v.trim()) ?? 0) + 1)
    }
    expect(bars.length).toBe(heads.size)
    for (const bar of bars) {
      const name = bar.querySelector('.dt-bar__name')!.textContent!
      expect(bar.querySelector('.dt-bar__n')).toHaveTextContent(grouped(heads.get(name)!))
    }
  })

  it('lists what pairs with it as tiles, each one a door to that pairing list’s sheet', async () => {
    draw()
    await userEvent.click(door(highfield().name))
    const spread = screen.getByTestId('data-page')
    const tiles = within(spread).getAllByRole('button', {
      name: /opens the list of which fits which/,
    })
    const mine = joins().filter(
      (j) =>
        j.fields.find((f) => f.type === 'reference' && f.refEntityId)?.refEntityId ===
        highfield().id,
    )
    expect(tiles.length).toBe(mine.length)
    await userEvent.click(tiles[0]!)
    expect(mine.map((j) => j.id)).toContain(openedTable[0])
  })

  it('goes back to the lists by its own act, by Escape, and by pressing the maker again', async () => {
    draw()
    await userEvent.click(door(highfield().name))
    await userEvent.click(screen.getByRole('button', { name: /Back to the lists/ }))
    expect(screen.queryByTestId('data-page')).toBeNull()
    expect(grid()).toBeInTheDocument()

    await userEvent.click(rowFor(/Mackay Trailers/))
    const spread = screen.getByTestId('data-page')
    /* opened from the ledger, the spread takes the focus the ledger had */
    expect(spread).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByTestId('data-page')).toBeNull()

    await userEvent.click(door(highfield().name))
    await userEvent.click(door(highfield().name))
    expect(screen.queryByTestId('data-page')).toBeNull()
  })

  it('says what a press on its act does in the dealer’s words, never an address', async () => {
    draw()
    await userEvent.click(door(highfield().name))
    const spread = screen.getByTestId('data-page')
    expect(spread).toHaveTextContent('Every line of it, to read and change.')
    /* the lineup names the unit its bars count in, which the head's models are not */
    expect(spread).toHaveTextContent(
      `${grouped(pack.rowsByEntity[highfield().id]!.length)} variants`,
    )
    expect(spread.textContent ?? '').not.toMatch(/\/data|\$table|\/customers/)
    expect(NO_WAY_TO_THE_SHEET).not.toMatch(/\//)
  })
})

describe('while the file is still being looked for', () => {
  it('says it is looking, and does not say the business has no name or the file is not open', () => {
    catalogue.setState({ status: 'loading', problem: null })
    render(<Data business={null} />)
    expect(screen.getByText('Looking for the price list…')).toBeInTheDocument()
    expect(screen.queryByText('This business has not been named yet')).toBeNull()
    expect(screen.queryByText(/No price list is open/)).toBeNull()
  })
})

/* ============================================================
   THE PRICE LIST'S ROOMS, WHICH ARE DOORS (2026-10-22, the critique of
   Milestone 3, blocker 1: "three of the four new screens have no
   door"). Every press below is checked for WHERE IT LANDS — the link's
   own address and the address handed to the router — and the one
   figure is counted here a second time, by Review's own read.
   ============================================================ */
describe('the price list’s rooms, at the head', () => {
  /* read off the one list (src/app/ways.ts), as the finder and the e2e walk read it, so a room
     added or taken away there is drawn here without a second copy of the list to go stale
     (2026-10-30, the critique of Milestone 4, blocker 7: a hand-typed count went red) */
  it('draws every room of the price list, in its order, as links, and a press hands the router their address', async () => {
    const went: string[] = []
    draw({ go: (href: string) => went.push(href) })
    const rooms = within(screen.getByRole('navigation', { name: 'Behind the price list' }))
    const links = rooms.getAllByRole('link')
    expect(PRICE_LIST_ROOMS.length, 'the price list has rooms to draw').toBeGreaterThan(0)
    expect(links.map((a) => a.getAttribute('href'))).toEqual(PRICE_LIST_ROOMS.map((r) => r.href))
    expect(links.map((a) => a.textContent?.replace(/\d[\d,]* to settle/, '').trim())).toEqual(
      PRICE_LIST_ROOMS.map((r) => r.word),
    )
    await userEvent.click(rooms.getByRole('link', { name: /^Rules — / }))
    await userEvent.click(rooms.getByRole('link', { name: /^Prices — / }))
    expect(went).toEqual(['/rules', '/levels'])
  })

  it('says on Review’s door how many cases are left to settle, counted as Review’s queue counts them', async () => {
    draw()
    const s = catalogue.getState()
    const found = review({ entities: s.tables, rowsByEntity: s.rows })
    const wrong = queueOf(found).length
    expect(wrong).toBeGreaterThan(0)
    /* in cases, as Review's "Case 1 of 37" counts, never its lines (built-critique-m3.md,
       major 11: this door said "69 to fix" beside it) */
    expect(wrong).toBeLessThan(found.open)
    const said = `${grouped(wrong)} ${wrong === 1 ? 'case' : 'cases'} to settle in your price list`
    const door = await screen.findByRole('link', { name: `Review — ${said}` })
    expect(door).toHaveAttribute('href', '/review')
    expect(door).toHaveTextContent(`${grouped(wrong)} to settle`)
  })

  it('opens a maker’s prices on Prices at that maker, and Fitment on one of its boats, named', async () => {
    const went: string[] = []
    draw({ at: 'boat_highfield', go: (href: string) => went.push(href) })
    const spread = within(screen.getByTestId('data-page'))
    const prices = spread.getByRole('link', { name: /: set on Prices$/ })
    expect(prices).toHaveAttribute('href', '/levels?list=boat_highfield')
    expect(prices).toHaveTextContent(/^Cash/)
    /* the first Highfield still sold, as Fitment's own finder answers the maker's name */
    const first = findBoats(
      { entities: catalogue.getState().tables, rowsByEntity: catalogue.getState().rows },
      'Highfield Inflatables',
      Infinity,
    ).found.find((b) => b.place.tableId === 'boat_highfield')!
    const fits = spread.getByRole('link', { name: `What fits the ${first.name}` })
    expect(fits).toHaveAttribute('href', `/fitment?boat=${encodeURIComponent(first.place.rowId)}`)
    await userEvent.click(prices)
    await userEvent.click(fits)
    expect(went).toEqual([
      '/levels?list=boat_highfield',
      `/fitment?boat=${encodeURIComponent(first.place.rowId)}`,
    ])
  })

  it('opens a trailer maker’s prices at the one column every trailer shares on Prices', async () => {
    draw({ at: 'trl_mackay' })
    const prices = within(screen.getByTestId('data-page')).getByRole('link', {
      name: /: set on Prices$/,
    })
    const column = readLadder(catalogue.getState()).find((c) => c.tableIds.includes('trl_mackay'))!
    expect(column.tableIds.length).toBeGreaterThan(1)
    expect(prices).toHaveAttribute('href', `/levels?list=${encodeURIComponent(column.id)}`)
    /* and a trailer maker has no one boat to open Fitment on */
    expect(screen.queryByRole('link', { name: /^What fits the / })).toBeNull()
  })

  it('leaves the prices of a list Prices does not carry as words, and links nowhere', () => {
    draw({ at: 'labour_rates' })
    const spread = screen.getByTestId('data-page')
    expect(within(spread).getByRole('heading', { name: 'Labour Rates' })).toBeInTheDocument()
    expect(within(spread).queryByRole('link', { name: /set on Prices/ })).toBeNull()
  })
})

/* ============================================================
   ONE REGISTER, AND EACH PLACE'S OWN PAGE FROM IT (2026-10-30, the
   critique of Milestone 4, major 1: Places and Data were the same 25
   lists drawn twice behind one door). Data is the register; a list
   that is a place opens its own page — its line, mark, photograph and
   colour — from its spread, and a list that is no place offers none.
   ============================================================ */
describe('a place’s own page, from its spread', () => {
  it('draws no second register of the lists among the price list’s rooms', () => {
    draw()
    const rooms = within(screen.getByRole('navigation', { name: 'Behind the price list' }))
    expect(rooms.queryByRole('link', { name: /^Places/ })).toBeNull()
  })

  it('opens a maker’s own page, named on the press, and hands the router its address', async () => {
    const went: string[] = []
    draw({ at: 'boat_stacer', go: (href: string) => went.push(href) })
    const spread = within(screen.getByTestId('data-page'))
    const own = spread.getByRole('link', { name: 'Stacer’s own page' })
    expect(own).toHaveAttribute('href', '/places/boat_stacer')
    expect(own).toHaveAttribute('title', 'Its line, mark, photograph and colour, and its quotes')
    await userEvent.click(own)
    expect(went).toEqual(['/places/boat_stacer'])
  })

  it('opens a list that is one place of many lists at that place, and says no photograph for it', () => {
    draw({ at: 'labour_rates' })
    const spread = within(screen.getByTestId('data-page'))
    const own = spread.getByRole('link', { name: 'Labour Rates’ own page' })
    expect(own).toHaveAttribute('href', '/places/labour_rates')
    expect(own).toHaveAttribute('title', 'Its line, mark and colour, and its quotes')
  })

  it('offers no own page for a list of what fits which boat, which is no place', () => {
    draw({ at: joins()[0]!.id })
    const spread = within(screen.getByTestId('data-page'))
    expect(spread.getByText('What fits which boat')).toBeTruthy()
    expect(spread.queryByRole('link', { name: /own page$/ })).toBeNull()
  })
})
