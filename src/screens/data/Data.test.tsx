import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { DESK_PLACE, FILED_AT_THIS_DESK, fittedBoats } from '@/domain/modules/register'
import { queueOf } from '@/domain/rules/review/cases'
import { countBoats } from '@/domain/quote/boats'
import { review } from '@/domain/rules/review/checks'
import { datedSections } from '@/domain/catalogue/asAt'
import { headingDoorOf } from '@/domain/catalogue/headingDoor'
import { readLadder, undecided } from '@/screens/levels/read'
import { PRICE_LIST_ROOMS } from '@/app/ways'
import { Data, LIST_NEEDS_NAME, NO_WAY_TO_THE_SHEET, type DataPosition } from './Data'

/* ============================================================
   DATA, RENDERED AND PRESSED, BY ROLE AND BY TEXT — direction A, "The
   Monday list" (2026-11-03).

   The real pack is loaded into the real catalogue store before every
   case, so every figure asserted below is COUNTED twice: once by the
   screen through the readers its rooms use, and once here off the pack
   or by the same reader called a second way. No count is typed here.

   THE ONE THING WRITTEN is a list a dealer makes, made the way a dealer
   makes one — the act, a name, Make it — and then undone.
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

const base = () => pack.entities.filter((e) => e.role !== 'join')
const joins = () => pack.entities.filter((e) => e.role === 'join')
const boats = () => base().filter((e) => e.kind === 'boat')
const allRows = () =>
  pack.entities.reduce((n, e) => n + (pack.rowsByEntity[e.id]?.length ?? 0), 0)
const grouped = (n: number): string => n.toLocaleString('en-AU')

let positions: DataPosition[] = []
let opened: Array<{ id: string; at?: { in?: string; find?: string } }> = []

const seams = {
  onPosition: (p: DataPosition) => {
    positions.push(p)
  },
  openTable: (id: string, at?: { in?: string; find?: string }) => {
    opened.push(at ? { id, at } : { id })
  },
}

beforeEach(() => {
  positions = []
  opened = []
})

const draw = (over: Record<string, unknown> = {}) =>
  render(<Data business="Northside Marine" {...seams} {...over} />)
const drawStranded = () => render(<Data business="Northside Marine" />)

const grid = () => screen.getByRole('grid', { name: 'Lists' })
const rowFor = (name: RegExp) => within(grid()).getByRole('row', { name })
const tile = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name} · `) })
const need = (id: string) =>
  screen.getByTestId('data-needs').querySelector<HTMLElement>(`[data-need="${id}"]`)!

/* ---------------------------------------------------------- */

describe('the head: which price list, how big, how current', () => {
  it('says the price list’s size once, in lists and lines', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Data')
    const counts = screen.getByTestId('data-counts')
    expect(counts).toHaveTextContent(`${grouped(pack.entities.length)} lists · ${grouped(allRows())} lines`)
    expect(counts.textContent ?? '').not.toMatch(/(tables?|rows?|pairing)/i)
  })

  it('says its date, keeping the file’s one fingerprint as that line’s hover', () => {
    draw()
    const stamp = screen.getByTestId('data-file')
    expect(stamp).toHaveTextContent(/^The price list of \d{1,2} [A-Z][a-z]+ \d{4}$/)
    expect(stamp.getAttribute('title')).toContain(pack.manifest.sourceFingerprint!)
    expect(screen.queryAllByText(pack.manifest.sourceFingerprint!)).toHaveLength(0)
    expect(screen.queryByText('Northside Marine')).toBeNull()
  })

  it('says how current its prices are, from its own headings, and its last change here', () => {
    draw()
    const d = datedSections(pack.entities, pack.rowsByEntity)
    const day = (iso: string) =>
      new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    const dates = screen.getByTestId('data-dates')
    expect(dates.textContent?.replace(/ /g, ' ')).toContain(
      `from ${day(d.oldest!)} to ${day(d.newest!)}`,
    )
    expect(dates.textContent?.replace(/ /g, ' ')).toContain('Last change on this computer: none yet')
  })
})

describe('Needs Northside, the state above the inventory', () => {
  it('counts what Review has to settle as Review’s queue counts it, with its door', async () => {
    draw()
    const wrong = queueOf(review({ entities: catalogue.getState().tables, rowsByEntity: catalogue.getState().rows })).length
    expect(wrong).toBeGreaterThan(0)
    await screen.findByTestId('data-wrong')
    const r = need('review')
    expect(r.querySelector('.dt-need__fig')).toHaveTextContent(grouped(wrong))
    expect(r).toHaveTextContent(`of ${grouped(allRows())}`)
    expect(within(r).getByRole('link', { name: /Settle them/ })).toHaveAttribute('href', '/review')
  })

  it('counts the answers about price only Northside can give, as Prices reads them', () => {
    draw()
    const asked = readLadder(catalogue.getState()).filter(undecided)
    const lines = asked.reduce((n, c) => n + c.lines, 0)
    const p = need('prices')
    expect(p.querySelector('.dt-need__fig')).toHaveTextContent(grouped(asked.length))
    expect(p).toHaveTextContent(`${grouped(lines)} of ${grouped(allRows())} lines`)
  })

  it('counts the headings that date themselves out of the headings of the lists that date any', async () => {
    draw()
    const d = datedSections(pack.entities, pack.rowsByEntity)
    const n = need('dated')
    expect(n.querySelector('.dt-need__fig')).toHaveTextContent(grouped(d.sections.length))
    expect(n).toHaveTextContent(
      `of ${grouped(d.headingsInThose)} headings in the ${grouped(d.lists.length)} lists that date any`,
    )
    /* the oldest first: its list opens on the sheet AT that heading, by the door the sheet reads
       for that list — a chapter's name, or the first line filed under the heading (the verifier
       of Data, round 1: a chapter name Rigging Kits does not have opened it at its top) */
    await userEvent.click(within(n).getByRole('button', { name: /Oldest first/ }))
    const oldest = d.sections[0]!
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const door = headingDoorOf(
      tables[oldest.tableId]!,
      tables,
      pack.rowsByEntity[oldest.tableId]!,
      oldest.heading,
    )
    expect(door, 'the heading has a door').not.toBeNull()
    expect(opened).toEqual([{ id: oldest.tableId, at: door }])
  })

  it('counts the lines in the lists no list of what fits names, and opens the largest', async () => {
    draw()
    const named = new Set(
      joins().flatMap((j) =>
        j.fields.filter((f) => f.type === 'reference').map((f) => f.refEntityId as string),
      ),
    )
    const lone = base().filter(
      (t) =>
        t.kind !== 'boat' &&
        t.retired !== true &&
        ['motor', 'trailer', 'package', 'accessory'].includes(t.kind ?? '') &&
        !named.has(t.id),
    )
    const lines = lone.reduce((n, t) => n + pack.rowsByEntity[t.id]!.length, 0)
    const u = need('unnamed')
    expect(u.querySelector('.dt-need__fig')).toHaveTextContent(grouped(lines))
    await userEvent.click(within(u).getByRole('button', { name: /Largest first/ }))
    const largest = lone.toSorted(
      (a, b) => pack.rowsByEntity[b.id]!.length - pack.rowsByEntity[a.id]!.length,
    )[0]!
    expect(within(screen.getByTestId('data-page')).getByRole('heading', { name: largest.name })).toBeInTheDocument()
  })

  it('turns an item with nothing left to a tick and says what is true: every list is here', () => {
    draw()
    const l = need('loaded')
    expect(l).toHaveAttribute('data-done')
    expect(l).toHaveTextContent(`${grouped(pack.entities.length)}, done:lists of ${grouped(pack.entities.length)} are on this computer`)
    const open = screen.getByTestId('data-needs').querySelectorAll('.dt-need:not([data-done])').length
    expect(screen.getByTestId('data-needs').querySelector('.dt-sec-count')).toHaveTextContent(
      `${open} open · 1 done`,
    )
  })
})

describe('what is new since the price list landed', () => {
  it('says the zero as a figure, out of every line', () => {
    draw()
    const fresh = screen.getByTestId('data-new')
    expect(fresh).toHaveTextContent('New since 16 September 2026')
    expect(fresh).toHaveTextContent(`0lines changed on this computer, of ${grouped(allRows())}`)
    expect(fresh).toHaveTextContent('Lists made here0')
  })
})

describe('the rooms of the price list, as counted doors', () => {
  it('draws every room in the one list’s order, as links, and a press hands the router their address', async () => {
    const went: string[] = []
    draw({ go: (href: string) => went.push(href) })
    const rooms = within(screen.getByRole('navigation', { name: 'The rooms of the price list' }))
    const links = rooms.getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(PRICE_LIST_ROOMS.map((r) => r.href))
    await userEvent.click(rooms.getByRole('link', { name: /^Rules — / }))
    await userEvent.click(rooms.getByRole('link', { name: /^Prices — / }))
    expect(went).toEqual(['/rules', '/levels'])
    expect(rooms.queryByRole('link', { name: /^Places/ })).toBeNull()
  })

  it('says on Review’s door the cases to settle, and on Fitment’s the models Home counts', async () => {
    draw()
    const s = catalogue.getState()
    const wrong = queueOf(review({ entities: s.tables, rowsByEntity: s.rows })).length
    const said = `${grouped(wrong)} ${wrong === 1 ? 'case' : 'cases'} to settle in your price list`
    const door = await screen.findByRole('link', { name: `Review — ${said}` })
    expect(door).toHaveTextContent(`${grouped(wrong)} to settle`)
    const models = countBoats(boats(), pack.rowsByEntity).boats
    expect(screen.getByRole('link', { name: `Fitment — ${grouped(models)} models` })).toBeInTheDocument()
  })
})

describe('the makers, as tiles', () => {
  it('is one tile per boat list the file brought, counted in models, and a tile for every maker', () => {
    draw()
    expect(screen.getAllByTestId('plate')).toHaveLength(boats().length)
    const highfield = pack.entities.find((e) => e.id === 'boat_highfield')!
    const models = countBoats([highfield], pack.rowsByEntity).boats
    expect(tile(highfield.name)).toHaveTextContent(`${grouped(models)} models in`)
    expect(screen.getByRole('link', { name: /^Every maker · / })).toHaveAttribute('href', '/fitment')
  })

  it('draws each mark once, and a maker with no held mark in type with nothing standing in', () => {
    draw()
    const tiles = screen.getAllByTestId('plate')
    const typed = tiles.filter((p) => p.querySelector('.dt-mark__typed') !== null)
    expect(typed.length).toBeGreaterThan(0)
    for (const t of typed) expect(t.querySelector('img')).toBeNull()
    for (const t of tiles) expect(t.querySelectorAll('img').length).toBeLessThanOrEqual(1)
  })
})

describe('the lists you sell from', () => {
  it('says each list’s count in its own noun and what it fits', () => {
    draw()
    const yamaha = rowFor(/Yamaha Outboards/)
    expect(yamaha).toHaveTextContent(`${grouped(pack.rowsByEntity['mot_yamaha']!.length)} motors`)
    const fitted = fittedBoats('mot_yamaha', catalogue.getState().tables, catalogue.getState().rows)
    expect(yamaha).toHaveTextContent(`fits ${grouped(fitted)} boats`)
    expect(rowFor(/Dunbier Trailers/)).toHaveTextContent('named by no boat')
    expect(rowFor(/Labour Rates/)).toHaveTextContent('not tied to a boat')
  })

  it('says on a row what stands on it: its Review cases and its dated headings', async () => {
    draw()
    await screen.findByTestId('data-wrong')
    expect(rowFor(/Parts & Accessories/)).toHaveTextContent(/\d+ to settle · \d+ dated headings/)
  })

  it('opens a row’s spread, hands the position back, and its act opens the sheet', async () => {
    draw()
    await userEvent.click(rowFor(/Mackay Trailers/))
    expect(positions.at(-1)?.at).toBe('trl_mackay')
    await userEvent.click(within(screen.getByTestId('data-page')).getByRole('button', { name: /Open the list/ }))
    expect(opened).toEqual([{ id: 'trl_mackay' }])
  })

  it('refuses in a sentence where the press happened when there is nowhere to go', async () => {
    drawStranded()
    await userEvent.click(rowFor(/Mackay Trailers/))
    const act = within(screen.getByTestId('data-page')).getByRole('button', { name: /Open the list/ })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(act)
    expect(screen.getAllByText(NO_WAY_TO_THE_SHEET).length).toBeGreaterThan(0)
  })
})

describe('the lists of what fits which boat, as one table', () => {
  it('holds every one of them, each figure a door to its own spread', async () => {
    draw()
    const table = screen.getByRole('table')
    const pairs = within(table).getAllByRole('button')
    expect(pairs).toHaveLength(joins().length)
    await userEvent.click(pairs[0]!)
    expect(screen.getByTestId('data-page')).toHaveTextContent('What fits which boat')
  })
})

describe('one find over the whole price file', () => {
  const field = () => screen.getByRole('searchbox', { name: 'Find in the price list' })

  it('finds a maker that is on the price list, and never says it is not', async () => {
    draw()
    await userEvent.type(field(), 'Highfield')
    expect(await screen.findByTestId('data-answer')).toBeInTheDocument()
    expect(screen.queryByText(/Nothing on the price list/)).toBeNull()
    /* the tiles narrow to the maker that holds it */
    expect(screen.getAllByTestId('plate')).toHaveLength(1)
    expect(positions.at(-1)?.find).toBe('Highfield')
  })

  it('finds a code in the lines that carry it, and opens a list narrowed to it', async () => {
    draw()
    await userEvent.type(field(), 'F115')
    const answer = await screen.findByTestId('data-answer')
    expect(within(answer).getByRole('status')).toHaveTextContent(/lines hold “F115”, in \d+ lists/)
    await userEvent.click(within(answer).getByRole('button', { name: /^Yamaha Outboards: / }))
    expect(opened).toEqual([{ id: 'mot_yamaha', at: { find: 'F115' } }])
  })

  it('says so when nothing on the price list holds what was typed, and why one letter is not read', async () => {
    draw()
    await userEvent.type(field(), 'zzqqxx')
    expect(await screen.findByText(/Nothing on the price list holds “zzqqxx”/)).toBeInTheDocument()
    await userEvent.clear(field())
    await userEvent.type(field(), 'a')
    expect(await screen.findByText(/Type one more letter/)).toBeInTheDocument()
  })
})

describe('the one write, and its way back', () => {
  it('refuses a list with no name at the field, and makes nothing', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'New list' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Make it' }))
    expect(within(dialog).getByText(LIST_NEEDS_NAME)).toBeInTheDocument()
    expect(screen.queryByTestId('last-step')).toBeNull()
    expect(Object.keys(catalogue.getState().tables)).toHaveLength(pack.entities.length)
  })

  it('makes a list of the dealer’s own and can take it back, on the screen', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'New list' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent ?? '').not.toMatch(/\b(register|rows?|columns?|workbook|kind)\b/i)
    await userEvent.type(within(dialog).getAllByRole('textbox')[0]!, 'Boat show leads')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Make it' }))

    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent('Boat show leads')
    expect(screen.getByTestId('data-counts')).toHaveTextContent(`${grouped(pack.entities.length)} lists`)
    const spread = screen.getByTestId('data-page')
    expect(within(spread).getByRole('heading', { name: 'Boat show leads' })).toBeInTheDocument()
    expect(spread).toHaveTextContent(FILED_AT_THIS_DESK)
    /* its lines, never the engine's "0 rows" */
    expect(spread).toHaveTextContent('0 lines')
    expect(spread.textContent ?? '').not.toMatch(/\brows?\b/)
    await userEvent.click(within(spread).getByRole('button', { name: /Back to the lists/ }))
    const own = within(grid()).getByRole('rowgroup', { name: DESK_PLACE })
    expect(within(own).getByRole('row', { name: /Boat show leads/ })).toBeInTheDocument()
    expect(screen.getByTestId('data-new')).toHaveTextContent('Boat show leads')

    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(within(grid()).queryByRole('row', { name: /Boat show leads/ })).toBeNull()
    expect(within(step).getByRole('button', { name: 'Put it back' })).toBeInTheDocument()
  })
})

describe('a maker, opened', () => {
  const highfield = () => boats().find((b) => b.id === 'boat_highfield')!

  it('opens as a spread under the tiles, the tile lit, and its mark drawn once', async () => {
    draw()
    await userEvent.click(tile(highfield().name))
    const spread = screen.getByTestId('data-page')
    expect(within(spread).getByRole('heading', { name: highfield().name })).toBeInTheDocument()
    /* the ledgers stay under an open spread (the verifier of Data, round 1: with a maker open
       a third of a wide window was empty floor) */
    expect(screen.getByRole('grid', { name: 'Lists' })).toBeInTheDocument()
    expect(tile(highfield().name)).toHaveAttribute('aria-pressed', 'true')
    expect(spread.querySelectorAll('img[alt$="own mark"]')).toHaveLength(0)
    expect(positions.at(-1)?.at).toBe('boat_highfield')
  })

  it('draws every heading off the file, each a door to the sheet at that heading', async () => {
    draw()
    await userEvent.click(tile(highfield().name))
    const spread = screen.getByTestId('data-page')
    const first = highfield().hierarchy![0]!
    const heads = new Map<string, number>()
    for (const row of pack.rowsByEntity[highfield().id]!) {
      const v = row.values[first]
      if (typeof v === 'string' && v.trim() !== '') heads.set(v.trim(), (heads.get(v.trim()) ?? 0) + 1)
    }
    const bars = [...spread.querySelectorAll<HTMLElement>('.dt-bar')]
    expect(bars.length).toBe(heads.size)
    for (const bar of bars) {
      const name = bar.querySelector('.dt-bar__name')!.textContent!
      expect(bar.querySelector('.dt-bar__n')).toHaveTextContent(grouped(heads.get(name)!))
    }
    await userEvent.click(bars[0]!)
    expect(opened).toEqual([{ id: 'boat_highfield', at: { in: bars[0]!.querySelector('.dt-bar__name')!.textContent! } }])
  })

  it('reaches every heading of a long list: the rest are one press away, never a dead count', async () => {
    draw({ at: 'parts' })
    const spread = screen.getByTestId('data-page')
    const parts = pack.entities.find((e) => e.id === 'parts')!
    const heads = new Set(
      pack.rowsByEntity.parts!.map((r) => String(r.values[parts.hierarchy![0]!] ?? '').trim()).filter(Boolean),
    )
    expect(spread.querySelectorAll('.dt-bar').length).toBeLessThan(heads.size)
    await userEvent.click(within(spread).getByRole('button', { name: /^The other / }))
    expect(spread.querySelectorAll('.dt-bar').length).toBe(heads.size)
    /* a heading that dates itself is marked */
    expect(spread.querySelectorAll('.dt-bar[data-dated]').length).toBeGreaterThan(0)
  })

  it('opens Fitment on the maker, its models to choose, and Prices at the maker', async () => {
    const went: string[] = []
    draw({ at: 'boat_highfield', go: (href: string) => went.push(href) })
    const spread = within(screen.getByTestId('data-page'))
    const prices = spread.getByRole('link', { name: /: set on Prices$/ })
    expect(prices).toHaveAttribute('href', '/levels?list=boat_highfield')
    const fits = spread.getByRole('link', { name: 'Choose its model on Fitment' })
    expect(fits).toHaveAttribute('href', '/fitment?maker=Highfield')
    await userEvent.click(fits)
    expect(went).toEqual(['/fitment?maker=Highfield'])
  })

  it('goes back to the lists by its own act, by Escape, and by pressing the tile again', async () => {
    draw()
    await userEvent.click(tile(highfield().name))
    await userEvent.click(screen.getByRole('button', { name: /Back to the lists/ }))
    expect(screen.queryByTestId('data-page')).toBeNull()
    await userEvent.click(rowFor(/Mackay Trailers/))
    expect(screen.getByTestId('data-page')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByTestId('data-page')).toBeNull()
    await userEvent.click(tile(highfield().name))
    await userEvent.click(tile(highfield().name))
    expect(screen.queryByTestId('data-page')).toBeNull()
  })
})

describe('a place’s own page, from its spread', () => {
  it('opens a maker’s own page, named on the press', async () => {
    const went: string[] = []
    draw({ at: 'boat_stacer', go: (href: string) => went.push(href) })
    const own = within(screen.getByTestId('data-page')).getByRole('link', { name: 'Stacer’s own page' })
    expect(own).toHaveAttribute('href', '/places/boat_stacer')
    await userEvent.click(own)
    expect(went).toEqual(['/places/boat_stacer'])
  })

  it('offers no own page for a list of what fits which boat, which is no place', () => {
    draw({ at: joins()[0]!.id })
    const spread = within(screen.getByTestId('data-page'))
    expect(spread.getByText('What fits which boat')).toBeTruthy()
    expect(spread.queryByRole('link', { name: /own page$/ })).toBeNull()
  })
})

describe('a computer with no file, and one still looking', () => {
  it('says so, teaches, stands nothing in, and offers the door back', async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
    draw({ openTheFile: () => {} })
    expect(screen.getByRole('heading', { name: 'No price list is open on this computer.' })).toBeInTheDocument()
    expect(screen.queryAllByTestId('plate')).toHaveLength(0)
    expect(screen.queryByTestId('data-needs')).toBeNull()
    expect(document.querySelectorAll('main img')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Load the Master Price File' })).toBeInTheDocument()
  })

  it('says it is looking, and not that the file is missing', () => {
    catalogue.setState({ status: 'loading', problem: null })
    render(<Data business={null} />)
    expect(screen.getByText('Looking for the price list…')).toBeInTheDocument()
    expect(screen.queryByText(/No price list is open/)).toBeNull()
  })
})

describe('a long lineup, opened and folded back', () => {
  it('draws every heading, says so in the address, and folds back to the first twelve', async () => {
    draw({ at: 'parts' })
    const spread = await screen.findByTestId('data-page')
    const bars = () => spread.querySelectorAll('.dt-bar').length
    const first = bars()
    const parts = pack.entities.find((e) => e.id === 'parts')!
    const level = parts.hierarchy![0]!
    const headings = new Set(
      pack.rowsByEntity['parts']!.map((r) => String(r.values[level] ?? '').trim()).filter(Boolean),
    )
    await userEvent.click(within(spread).getByRole('button', { name: /^The other / }))
    expect(bars()).toBe(headings.size)
    expect(positions.at(-1)).toMatchObject({ at: 'parts', headings: 'all' })
    const fold = within(spread).getByRole('button', { name: `Fold back to the first ${first}` })
    expect(fold).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(fold)
    expect(bars()).toBe(first)
    expect(positions.at(-1)?.headings).toBeUndefined()
  })

  it('opens drawn whole when the address says so', async () => {
    draw({ at: 'parts', headings: 'all' })
    const spread = await screen.findByTestId('data-page')
    expect(within(spread).getByRole('button', { name: /^Fold back/ })).toBeInTheDocument()
  })
})

describe('the bar’s Find, offered from an answer', () => {
  it('is refused in a sentence where no bar stands', async () => {
    draw({ find: 'F115' })
    const answer = await screen.findByTestId('data-answer')
    const press = within(answer).getByRole('button', { name: /Find “F115” for a quote/ })
    expect(press).toHaveAccessibleDescription(/the bar’s Find stands only where the bar does/)
  })
})
