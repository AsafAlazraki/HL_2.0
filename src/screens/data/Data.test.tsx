import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { FILED_AT_THIS_DESK } from '@/domain/modules/register'
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

const grid = () => screen.getByRole('grid', { name: 'Tables' })
const rowFor = (name: RegExp) => within(grid()).getByRole('row', { name })

/* ---------------------------------------------------------- */

describe('the head, which is the file counted', () => {
  it('says how many tables, how many rows and how many of them are pairing lists', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Data')
    const counts = screen.getByTestId('data-counts')
    expect(counts).toHaveTextContent(`${grouped(pack.entities.length)} tables`)
    expect(counts).toHaveTextContent(`${grouped(allRows())} rows`)
    expect(counts).toHaveTextContent(`${grouped(joins().length)} of them pairing lists`)
  })

  it('prints the one fingerprint the file has, once, and no other', () => {
    draw()
    const stamp = screen.getByTestId('data-file')
    expect(stamp).toHaveTextContent('Master Price File')
    expect(stamp).toHaveTextContent(pack.manifest.sourceFingerprint!)
    expect(screen.getAllByText(pack.manifest.sourceFingerprint!)).toHaveLength(1)
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

  it('says what a maker holds in its own noun, never “rows”', () => {
    draw()
    const shelf = screen.getByTestId('data-shelf')
    const highfield = pack.entities.find((e) => e.id === 'boat_highfield')!
    expect(shelf).toHaveTextContent(
      `${grouped(pack.rowsByEntity[highfield.id]!.length)} variants in`,
    )
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

  it('hangs every pairing list off exactly one maker, and calls it what it pairs with', async () => {
    draw()
    const shelf = screen.getByTestId('data-shelf')
    const chips = within(shelf).getAllByRole('button', { name: /pairings/ })
    /* between 640 and 1439 a plate draws three lines and counts the
       rest, but jsdom/happy-dom has no width and no media query, so
       every one of the file's joins is here */
    expect(chips.length).toBe(joins().length)
    expect(shelf.textContent ?? '').not.toMatch(/\bjoin/i)
    /* and a pairing line opens that pairing list's own page, which
       names its two ends — the same press a plate and a row take */
    await userEvent.click(chips[0]!)
    const page = screen.getByTestId('data-page')
    expect(page).toHaveTextContent('Pairing list')
    expect(page).toHaveTextContent('Its two ends')
  })
})

describe('a row, and the page it opens', () => {
  it('says its kind, its count, what pairs with it and where it came from', () => {
    draw()
    const yamaha = rowFor(/Yamaha Outboards/)
    const rows = pack.rowsByEntity['mot_yamaha']!.length
    expect(yamaha).toHaveTextContent('Motors')
    expect(yamaha).toHaveTextContent(`${grouped(rows)} motors`)
    expect(yamaha).toHaveTextContent(/pairs with \d+ boats/)
    expect(yamaha).toHaveTextContent('Motor Module')
  })

  it('says “no boat pairs with it” for a table no pairing list names', () => {
    draw()
    expect(rowFor(/Labour Rates/)).toHaveTextContent('no boat pairs with it')
  })

  it('opens a page with the table’s own provenance and the file’s own hash', async () => {
    draw()
    await userEvent.click(rowFor(/NSM Custom Trailers/))
    const page = screen.getByTestId('data-page')
    expect(within(page).getByRole('heading', { name: 'NSM Custom Trailers' })).toBeInTheDocument()
    expect(page).toHaveTextContent('Where from')
    expect(page).toHaveTextContent('Trailer Module')
    expect(page).toHaveTextContent('sha256')
    expect(page).toHaveTextContent(pack.manifest.sourceSha256!)
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
    await userEvent.click(within(page).getByRole('button', { name: /Open the sheet/ }))
    expect(openedTable).toEqual(['trl_mackay'])
  })

  it('refuses in a sentence where the press happened when there is nowhere to go', async () => {
    drawStranded()
    await userEvent.click(rowFor(/Mackay Trailers/))
    const page = screen.getByTestId('data-page')
    const act = within(page).getByRole('button', { name: /Open the sheet/ })
    /* never a silently disabled control: it is pressable and it says why */
    expect(act).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(act)
    expect(screen.getAllByText(NO_WAY_TO_THE_SHEET).length).toBeGreaterThan(0)
  })
})

describe('finding one of fifty-three', () => {
  it('narrows on the name, the kind, the place or the workbook, and counts what is left', async () => {
    draw()
    const field = screen.getByRole('searchbox', { name: 'Find a table' })
    await userEvent.type(field, 'trailer')
    expect(within(grid()).queryByRole('row', { name: /Labour Rates/ })).toBeNull()
    expect(within(grid()).getByRole('row', { name: /Dunbier Trailers/ })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('tables match')
    expect(positions.at(-1)?.find).toBe('trailer')
  })

  it('says so when nothing answers to what was typed', async () => {
    draw()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find a table' }), 'zzzz')
    expect(screen.getByText(/Nothing on this sheet is called/)).toBeInTheDocument()
  })
})

describe('the one write, and its way back', () => {
  it('files a register at this desk and can take it back, on the screen', async () => {
    draw()
    const before = pack.entities.length
    await userEvent.click(screen.getByRole('button', { name: 'New register' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getAllByRole('textbox')[0]!, 'Boat show leads')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Make it' }))

    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent('Boat show leads')
    expect(screen.getByTestId('data-counts')).toHaveTextContent(`${grouped(before + 1)} tables`)
    expect(rowFor(/Boat show leads/)).toHaveTextContent(FILED_AT_THIS_DESK)

    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(within(grid()).queryByRole('row', { name: /Boat show leads/ })).toBeNull()
    expect(screen.getByTestId('data-counts')).toHaveTextContent(`${grouped(before)} tables`)
    expect(within(step).getByRole('button', { name: 'Put it back' })).toBeInTheDocument()
  })
})

describe('a browser with no file in it', () => {
  it('says so, teaches, stands nothing in, and offers the door back', async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
    draw({ openTheFile: () => {} })
    expect(
      screen.getByRole('heading', { name: 'No price file is open in this browser.' }),
    ).toBeInTheDocument()
    for (const question of ['What lands here', 'Why it is empty today', 'What to do']) {
      expect(screen.getByText(question)).toBeInTheDocument()
    }
    expect(screen.queryAllByTestId('plate')).toHaveLength(0)
    expect(screen.queryByRole('grid', { name: 'Tables' })).toBeNull()
    expect(document.querySelectorAll('main img')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Load the Master Price File' })).toHaveAttribute(
      'aria-disabled',
      'false',
    )
  })
})

describe('the way out', () => {
  it('goes home when the way home is pressed', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'Home' }))
    expect(wentHome).toBe(1)
  })
})
