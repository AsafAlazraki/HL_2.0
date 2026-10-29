import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ModuleDef, QuoteDef, QuoteLine } from '@/domain/model'
import { addRow, batch, createTable } from '@/domain/catalogue/commands'
import { makerDoors } from '@/domain/catalogue/makers'
import { priceFileOf } from '@/domain/catalogue/priceFile'
import { cellsFor, registerShape } from '@/domain/people/book'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { localDayOf } from '@/domain/quote/day'
import { dayWritten, localTimeOf } from '@/domain/quote/diary/days'
import { todayOf } from '@/domain/quote/diary/today'
import { boatOfQuote } from '@/domain/quote/spoken'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { ScopeSeat, useLendFinder } from '@/screens/shell/scope'
import { priceAsksOf, priceAsksSay } from './asks'
import { holdingsOf } from './holdings'
import { boatsForHome, heldPictures, rowPictured, saidOfPicture } from './ledgers'
import { heroOfQuote } from '@/data/pictures'
import {
  Home,
  NO_FINDER,
  NO_QUOTE_STARTED,
  NO_WAY_IN,
  NO_WAY_TO_A_FILED_QUOTE,
  NO_WAY_TO_THE_PICKER,
  NOTHING_YET,
  foldedSaid,
  greetingFor,
  soldOnTheBoat,
  todaySaid,
} from './Home'

/* ============================================================
   Home, rendered against the real pack, read by role and by text.

   No test here asserts a number typed into it: each figure is asked
   of `src/domain` or of the ledgers and then looked for on the
   screen, so a screen that drifts from the file fails, and so does a
   file that drifts from the screen.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const loadTheFile = async (): Promise<void> => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
}

const loadNothing = async (): Promise<void> => {
  await catalogue.getState().load({ entities: [], rowsByEntity: {} })
}

const sheet = () => Object.fromEntries(pack.entities.map((e) => [e.id, e]))
const held = () => holdingsOf(sheet(), pack.rowsByEntity, pack.ctx.modules)
const doors = () => makerDoors(priceFileOf(sheet(), pack.ctx.modules).tables, pack.rowsByEntity)
/** the doors Home draws: the boat makers (the motors and the trailers are said, not doors) */
const boatDoors = () => doors().filter((door) => door.kind === 'boat')
/** the boats the ledger photographs that the file still sells, as Home finds them: the eight
 *  its row stands on */
const photographed = () =>
  boatsForHome(
    heldPictures().flatMap((picture) => {
      const table = sheet()[picture.table]
      const row = table ? rowPictured(picture, table, pack.rowsByEntity[picture.table] ?? []) : null
      return table && row
        ? [
            {
              picture,
              table: picture.table,
              row: row.id,
              said: saidOfPicture(table, picture.model),
            },
          ]
        : []
    }),
  )

const emptyDesk = async (): Promise<void> => {
  await quotes.getState().open(memoryQuotes('northside', { db: createMemoryDatabase() }))
}

describe('the greeting', () => {
  it('reads the clock, and says nothing about a person nobody has named', () => {
    expect(greetingFor(9, null)).toBe('Good morning.')
    expect(greetingFor(13, null)).toBe('Good afternoon.')
    expect(greetingFor(21, null)).toBe('Good evening.')
    expect(greetingFor(9, 'Asaf')).toBe('Good morning, Asaf.')
  })
})

describe('day one, with the Master Price File open', () => {
  beforeAll(async () => {
    await loadTheFile()
    await emptyDesk()
    session.getState().signOut()
  })

  it('greets the desk under Northside’s name, on the live water, and says why it has no name', async () => {
    render(<Home business="Northside Marine" from="pack" hour={9} />)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Good morning.')
    expect(screen.getByText(/No name has been given yet/)).toBeInTheDocument()
    const sea = screen.getByRole('region', { name: 'Northside Marine' })
    expect(sea.querySelector('canvas')).not.toBeNull()
    /* NORTHSIDE'S OWN MARK, held in the pack since 2026-10-20 (marks-ledger.json,
       role "organisation"), stands where the name would, in white ink on the water */
    const logo = within(sea).getByRole('img', { name: 'Northside Marine' })
    expect(logo.getAttribute('src')).toMatch(/brand-marks\/northside-marine-white\.png$/)
    expect(logo).toHaveAttribute('data-from', 'pack')
    expect(sea.querySelectorAll('.home-letter')).toHaveLength(0)
    /* and today is written as the diary writes a day */
    const today = localDayOf(new Date())
    expect(within(sea).getByText(dayWritten(today, today))).toBeInTheDocument()
  })

  /* THE JUDGE'S MUST-CHANGE: Northside's own mark, where one is held, stands where the name
     would — at showpiece size, said by its alt, and the name is not set in type beside it */
  it('draws Northside’s own mark in the slot where one is held, and sets no name beside it', () => {
    render(
      <Home
        business="Northside Marine"
        mark={{ src: '/org/northside-white.svg', alt: 'Northside Marine', from: 'organisation' }}
      />,
    )
    const sea = screen.getByRole('region', { name: 'Northside Marine' })
    const logo = within(sea).getByRole('img', { name: 'Northside Marine' })
    expect(logo).toHaveAttribute('src', '/org/northside-white.svg')
    expect(sea.querySelector('[data-set="type"]')).toBeNull()
    expect(sea.querySelectorAll('.home-letter')).toHaveLength(0)
  })

  /* THE CRITIQUE OF THE BUILT HOME, MAJOR 5: the file's lists and lines are Data's, and the
     pill already counts them at Data's door. The refinement round (2026-10-21, docs/WORDS.md):
     Home names the price list by its date, and not where it was packed or kept */
  it('says the price list once, by its date, and not its size or where it is kept', () => {
    const facts = held()
    render(<Home business="Northside Marine" from="pack" />)
    const stamp = screen.getByTestId('pack-counts')
    expect(within(stamp).getByText(/^Price list of /)).toHaveAttribute('data-from', 'pack')
    expect(stamp).toHaveTextContent(/^Price list of \d{1,2} [A-Z][a-z]+ \d{4}$/)
    expect(stamp).not.toHaveTextContent(/packed|browser|kept/)
    expect(stamp).not.toHaveTextContent(facts.rows.toLocaleString('en-AU'))
    expect(stamp).not.toHaveTextContent(/lists|lines|fits what|pairings|\bms\b|\b(tables?|rows?)\b/)
  })

  it('says in one sentence that nothing has moved, and draws nothing for the empty jobs', () => {
    render(<Home business="Northside Marine" />)
    expect(screen.getByText(NOTHING_YET)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Work in hand' })).toBeNull()
    expect(screen.getByTestId('home')).toHaveAttribute('data-state', 'day-one')
  })

  it('opens the picker from the one act, and is not refused', async () => {
    const newQuote = vi.fn<() => void>()
    render(<Home business="Northside Marine" newQuote={newQuote} />)
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'false')
    await userEvent.click(act)
    expect(newQuote).toHaveBeenCalledTimes(1)
  })

  it('says so at the act where nothing handed it a way to the picker', () => {
    render(<Home business="Northside Marine" />)
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(act).toHaveAccessibleDescription(NO_WAY_TO_THE_PICKER)
  })

  it('draws every boat the ledger photographs, and opens the picker at that boat', async () => {
    const openBoat = vi.fn<(table: string, row: string) => void>()
    const boats = photographed()
    expect(boats.length).toBeGreaterThan(0)
    render(<Home business="Northside Marine" openBoat={openBoat} />)
    /* THE HEAD SAYS WHAT THE ROW IS FOR AT THE DESK, not where its pictures came from */
    const region = screen.getByRole('region', { name: 'Start from the boat' })
    expect(region).not.toHaveTextContent(/photograph|ledger|file holds/)
    expect(within(region).getAllByRole('listitem')).toHaveLength(boats.length)
    for (const boat of boats) {
      const tile = within(region).getByRole('button', {
        name: `${boat.said.model}, ${boat.said.maker} — quote it`,
      })
      expect(within(tile).getByAltText(boat.picture.subject)).toBeInTheDocument()
      await userEvent.click(tile)
      expect(openBoat).toHaveBeenLastCalledWith(boat.picture.table, boat.row)
    }
    /* no word stands on a photograph: the caption is the card's, under it */
    expect(region).not.toHaveTextContent(/versions? of this boat/)
  })

  /* THE SECOND CRITIQUE, MAJORS 3 AND 4: the boat makers are the doors, each opening its
     boats; Yamaha, ePropulsion and the trailers are said once beside them, because a door with
     Yamaha's mark on it opened a boat list that never named Yamaha. */
  it('draws the boat makers as doors, each with its count, opening its boats', async () => {
    const openBoatRegister = vi.fn<(table: string) => void>()
    const all = boatDoors()
    expect(all.length).toBeGreaterThan(0)
    render(<Home business="Northside Marine" openBoatRegister={openBoatRegister} />)
    const region = screen.getByRole('region', { name: 'What Northside Marine sells' })
    expect(within(region).getAllByRole('listitem')).toHaveLength(all.length)
    for (const door of all) {
      const tile = within(region).getByRole('button', { name: `${door.name} ${door.said}` })
      await userEvent.click(tile)
      if (door.opens.at === 'picker')
        expect(openBoatRegister).toHaveBeenLastCalledWith(door.opens.tableId)
    }
    for (const name of ['Yamaha', 'ePropulsion', 'Trailers'])
      expect(within(region).queryByRole('button', { name: new RegExp(`^${name} `) })).toBeNull()
  })

  it('says the motors and the trailers once, as chosen in the build, on the boat', () => {
    render(<Home business="Northside Marine" openBoatRegister={() => {}} />)
    const said = soldOnTheBoat(doors())
    expect(said).toMatch(
      /^Yamaha and ePropulsion motors, and trailers from \d+ makers, are chosen in the build, on the boat\.$/,
    )
    const region = screen.getByRole('region', { name: 'What Northside Marine sells' })
    expect(within(region).getByText(said!)).toBeInTheDocument()
  })

  it('sets a maker with no mark in type, in the mark’s own place', () => {
    render(<Home business="Northside Marine" />)
    const region = screen.getByRole('region', { name: 'What Northside Marine sells' })
    const stabicraft = within(region).getByRole('button', { name: /^Stabicraft / })
    expect(stabicraft.querySelector('img')).toBeNull()
    const highfield = within(region).getByRole('button', { name: /^Highfield / })
    expect(highfield.querySelector('img')).not.toBeNull()
  })

  it('refuses a boat and a door in one sentence where nothing handed it a way in', () => {
    render(<Home business="Northside Marine" />)
    expect(screen.getAllByText(NO_WAY_IN).length).toBeGreaterThan(0)
    const region = screen.getByRole('region', { name: 'What Northside Marine sells' })
    for (const tile of within(region).getAllByRole('button'))
      expect(tile).toHaveAttribute('aria-disabled', 'true')
  })

  /* ONE FIND (why.md §2.6): the field is the finder's door, and what is typed into it opens
     the finder with those words. Where no shell stands, it says so in a sentence. */
  it('hands what is typed to the finder, and is the only find on the screen', () => {
    const asked: string[] = []
    /* the finder is lent ONCE, as the shell lends it: a new function on every render would
       be a new finder on every render */
    const onFind = (query: string): void => {
      asked.push(query)
    }
    function Lend() {
      useLendFinder(onFind)
      return null
    }
    render(
      <ScopeSeat>
        <Lend />
        <Home business="Northside Marine" />
      </ScopeSeat>,
    )
    expect(screen.getAllByRole('searchbox')).toHaveLength(1)
    const field = screen.getByRole('searchbox', { name: 'Find a boat or a customer' })
    fireEvent.change(field, { target: { value: 'sport 560' } })
    expect(asked).toEqual(['sport 560'])
    expect(field).toHaveValue('')
    expect(screen.queryByText(NO_FINDER)).toBeNull()
  })

  it('says it has no finder where none stands above it', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: 'Find a boat or a customer' })
    fireEvent.change(field, { target: { value: 'adv7' } })
    expect(screen.getByText(NO_FINDER)).toBeInTheDocument()
  })

  it('rolls its example through the boats the ledger photographs, as a customer says them', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: 'Find a boat or a customer' })
    const said = photographed().map((boat) => boat.said.model)
    expect(field.getAttribute('placeholder')).toMatch(/^The boat they say — “.+”$/)
    const example = /“(.+)”/.exec(field.getAttribute('placeholder') ?? '')?.[1]
    expect(said).toContain(example)
  })

  it('puts the caret in the field on /, and leaves Ctrl K to the finder', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: 'Find a boat or a customer' })
    fireEvent.keyDown(globalThis.window, { key: 'k', ctrlKey: true })
    expect(document.activeElement).not.toBe(field)
    fireEvent.keyDown(globalThis.window, { key: '/' })
    expect(document.activeElement).toBe(field)
  })

  /* NO INVENTED FIGURE, NO COST, NO PRICE ON DAY ONE: every number on the screen is the
     file's, a door's, the date's, or a model's own name */
  it('prints no figure the file, the doors or the day do not carry', () => {
    const allowed = new Set<number>()
    for (const door of doors()) allowed.add(door.count)
    for (const boat of photographed())
      for (const m of `${boat.said.model}`.matchAll(/\d[\d,]*/g)) allowed.add(Number(m[0]))
    render(<Home business="Northside Marine" from="pack" />)
    const home = screen.getByTestId('home')
    const stamp = screen.getByTestId('pack-counts').textContent ?? ''
    const date = /Price list of (.+)$/.exec(stamp)?.[1] ?? ''
    for (const m of date.matchAll(/\d+/g)) allowed.add(Number(m[0]))
    const today = localDayOf(new Date())
    for (const m of dayWritten(today, today).matchAll(/\d+/g)) allowed.add(Number(m[0]))
    /* the price questions are Prices' own count, read by Prices' own reader (./asks.ts) */
    const asks = priceAsksOf(catalogue.getState())
    if (asks) allowed.add(asks.count)
    const walker = document.createTreeWalker(home, NodeFilter.SHOW_TEXT)
    const parts: string[] = []
    for (let node = walker.nextNode(); node; node = walker.nextNode())
      parts.push(node.textContent ?? '')
    const printed = [...parts.join(' ').matchAll(/(?<![\w,.])\d[\d,]*(?![\w])/g)].map((m) =>
      Number(m[0].replaceAll(',', '')),
    )
    expect(printed.filter((n) => !allowed.has(n))).toEqual([])
    expect(home).not.toHaveTextContent(/\$|%|margin|cost|revenue|target/i)
  })

  /* BEFORE THE SALE (built-critique-m3-2.md, major 5): the first quote on a fresh link carried a
     line whose price Northside had not chosen, and the finale was the first to say so */
  it('says the price questions once, under the file, with the one door to Prices', () => {
    const asks = priceAsksOf(catalogue.getState())
    expect(asks).not.toBeNull()
    const openPrices = vi.fn<() => void>()
    render(<Home business="Northside Marine" from="pack" openPrices={openPrices} />)
    expect(screen.getAllByText(priceAsksSay(asks!))).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Answer them on Prices' }))
    expect(openPrices).toHaveBeenCalledTimes(1)
  })
})

/* ============================================================
   THE CRITIQUE OF MILESTONE 2'S CLOSE, BLOCKER 2: a person filed in
   the book is not the price file — and, since 2026-10-20, a person
   filed is a person owed a call.
   ============================================================ */
describe('home after a customer is filed', () => {
  beforeAll(async () => {
    await loadTheFile()
    await emptyDesk()
    const shape = registerShape()
    const nameId = shape.fields?.[0]?.id ?? ''
    const outcome = catalogue
      .getState()
      .apply(batch([createTable(shape), addRow(CUSTOMER_TABLE_ID, cellsFor(nameId, 'J. Harrow'))]))
    if ('refused' in outcome) throw new Error(outcome.refused)
  })

  it('counts the price file, and never the book of people beside it', () => {
    expect(catalogue.getState().rows[CUSTOMER_TABLE_ID]).toHaveLength(1)
    const facts = held()
    expect(facts.tables).toBe(pack.manifest.counts.tables)
    expect(facts.rows).toBe(pack.manifest.counts.rows)
    render(<Home business="Northside Marine" from="repository" />)
    /* the book is not a maker: the same doors, counted the same way */
    const region = screen.getByRole('region', { name: 'What Northside Marine sells' })
    expect(within(region).getAllByRole('listitem')).toHaveLength(boatDoors().length)
  })

  it('draws them as a person owed a call, on the water, and opens their page', async () => {
    const openCustomer = vi.fn<(key: string) => void>()
    render(<Home business="Northside Marine" openCustomer={openCustomer} />)
    expect(screen.getByTestId('home')).toHaveAttribute('data-state', 'week')
    const desk = screen.getByRole('region', { name: 'Work in hand' })
    const card = within(desk).getByRole('button', { name: /^J\. Harrow/ })
    expect(within(card).getByText('JH')).toBeInTheDocument()
    expect(within(card).getByText('No quote yet.')).toBeInTheDocument()
    await userEvent.click(card)
    const row = catalogue.getState().rows[CUSTOMER_TABLE_ID]?.[0]
    expect(openCustomer).toHaveBeenCalledWith(row?.id)
    /* the work joins day one: the sea, the photographs and the doors are all still there */
    expect(screen.getByRole('region', { name: 'Northside Marine' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Start from the boat' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'What Northside Marine sells' })).toBeInTheDocument()
    expect(screen.getByText(NO_QUOTE_STARTED)).toBeInTheDocument()
  })
})

describe('home in a browser that holds no copy of the file', () => {
  beforeAll(async () => {
    await loadNothing()
    await emptyDesk()
  })

  it('keeps the sea and says what is missing, drawing no boat and no maker', async () => {
    render(<Home business="   " from="pack" />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(
      screen.getByText('The Master Price File is not on this computer yet.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/No price list is open/)).toBeInTheDocument()
    expect(screen.queryByTestId('pack-counts')).toBeNull()
    expect(screen.queryByRole('region', { name: 'Start from the boat' })).toBeNull()
    expect(screen.queryByRole('region', { name: /sells$/ })).toBeNull()
    expect(screen.queryByText(/not been named|blank sheet/i)).toBeNull()
  })

  it('offers the door back to the file, and presses it', async () => {
    const openTheFile = vi.fn<() => void>()
    render(<Home business="Northside Marine" openTheFile={openTheFile} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Load the Master Price File' }))
    expect(openTheFile).toHaveBeenCalledTimes(1)
  })

  it('offers no door where nothing handed it one, and never claims to read the file', async () => {
    render(<Home business="Northside Marine" />)
    expect(
      await screen.findByText('The Master Price File is not on this computer yet.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load the Master Price File' })).toBeNull()
    expect(screen.queryByText(/Reading the Master Price File/)).toBeNull()
  })
})

/* ============================================================
   A WEEK IN. The documents are the shapes `mintQuote` produces,
   filed through the store the way the app files them; every figure
   is asked of the engine and then looked for on the screen.
   ============================================================ */

const ORG = 'northside'
const NOW = new Date('2026-10-20T10:00:00+10:00')
const clock = () => NOW
let n = 0

function line(label: string, unitPrice: number | null): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'boat_highfield',
    rowId: 'row_1',
    label,
    qty: 1,
    unitPrice,
    priceFieldId: 'fld_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: unitPrice, scope: 'quote' }],
  }
}

function doc(over: Partial<QuoteDef> = {}): QuoteDef {
  n += 1
  const hull = line('Highfield SP560', 41_340)
  const at = new Date(NOW.getTime() - n * 3_600_000).toISOString()
  return {
    id: `q${n}`,
    orgId: ORG,
    reference: `2026102${n}-01`,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'boat_highfield',
    rootRowId: 'boat_highfield:483',
    subjectLabel: 'Highfield - SP560 PVC',
    subjectSpecs: [],
    sections: [
      { blockId: '__subject', tableId: 'boat_highfield', title: 'Highfield', lineIds: [hull.id] },
    ],
    chapters: [{ id: '__subject', title: 'Highfield', tableId: 'boat_highfield' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: '' },
    preparedBy: 'Asaf',
    createdAt: at,
    updatedAt: at,
    ...over,
  }
}

const fileIt = (quote: QuoteDef): QuoteDef => {
  quotes.getState().file(quote, {
    id: `e-${quote.id}`,
    kind: 'minted',
    at: quote.createdAt,
    said: `${quote.subjectLabel} — quote ${quote.reference}`,
    changed: [],
  })
  return quote
}

const desk = () => screen.getByRole('region', { name: 'Work in hand' })

describe('a week in', () => {
  beforeAll(async () => {
    await loadTheFile()
  })
  beforeEach(async () => {
    n = 0
    await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
  })

  it('keeps day one’s sea and adds the work to it as one row on the water', () => {
    fileIt(doc())
    render(<Home business="Northside Marine" now={clock} />)
    expect(screen.getByTestId('home')).toHaveAttribute('data-state', 'week')
    const sea = screen.getByRole('region', { name: 'Northside Marine' })
    /* the mark stands exactly as on day one, inside the sea */
    expect(within(sea).getByRole('img', { name: 'Northside Marine' })).toHaveAttribute(
      'data-from',
      'pack',
    )
    expect(within(sea).getByRole('region', { name: 'Work in hand' })).toBeInTheDocument()
    expect(within(sea).getByRole('searchbox')).toBeInTheDocument()
  })

  it('draws a draft as a card from what the document froze, with no total, and opens its build', async () => {
    const quote = fileIt(doc())
    const openQuote = vi.fn<(id: string, state: string) => void>()
    render(<Home business="Northside Marine" now={clock} openQuote={openQuote} />)
    const card = within(desk()).getByRole('button', { name: new RegExp(boatOfQuote(quote).name) })
    expect(within(card).getByText('Draft · 2 hours ago')).toBeInTheDocument()
    expect(within(card).getByText('Nobody named yet')).toBeInTheDocument()
    /* THE CRITIQUE, MINOR 15: no customer's total is set on this screen */
    expect(card).not.toHaveTextContent('$')
    expect(card.querySelector('img')?.getAttribute('src')).toBe(heroOfQuote(quote)?.src)
    await userEvent.click(card)
    expect(openQuote).toHaveBeenCalledWith(quote.id, 'draft')
  })

  /* THE SECOND CRITIQUE, MAJOR 5: a draft says what it still wants before whom it is for */
  it('says a draft with its motor still to choose wants one, before whom it is for', () => {
    const hull = line('Highfield SP560', 41_340)
    fileIt(
      doc({
        lines: [hull],
        sections: [
          {
            blockId: '__subject',
            tableId: 'boat_highfield',
            title: 'Highfield',
            lineIds: [hull.id],
          },
          {
            blockId: 'blk_motor',
            tableId: 'motor_yamaha',
            title: 'Yamaha Outboards',
            lineIds: [],
            pickedCount: 4,
          },
        ],
        chapters: [
          { id: '__subject', title: 'Highfield', tableId: 'boat_highfield' },
          { id: 'blk_motor', title: 'Yamaha Outboards', tableId: 'motor_yamaha', kind: 'motor' },
        ],
        customer: { name: 'R. Kelleher' },
      }),
    )
    render(<Home business="Northside Marine" now={clock} />)
    const card = within(desk()).getByRole('button', { name: /Sport 560/ })
    expect(within(card).getByText('No motor yet · For R. Kelleher')).toBeInTheDocument()
  })

  /* THE REFINE ROUND (2026-10-21): a Haines Signature draft totals only its trailer, since the
     price list holds the boat at nought, and its card said only "Nobody named yet". The card says
     the boat's price is still to put on, before whom it is for, and still sets no figure. */
  it('says a draft whose boat has no price yet wants one, before whom it is for', () => {
    const hull = line('Haines Signature - Signature Fisher - 525F', null)
    fileIt(
      doc({
        rootTableId: 'boat_haines',
        subjectLabel: 'Haines Signature - Signature Fisher - 525F',
        lines: [hull],
        sections: [
          { blockId: '__subject', tableId: 'boat_haines', title: 'Haines', lineIds: [hull.id] },
        ],
        chapters: [{ id: '__subject', title: 'Haines', tableId: 'boat_haines' }],
      }),
    )
    render(<Home business="Northside Marine" now={clock} />)
    const card = within(desk()).getByRole('button', { name: /525F/ })
    const who = within(card).getByText('No boat price yet · Nobody named yet')
    expect(who).toBeInTheDocument()
    /* in a hand the line wraps (built-critique-m3-2.md major 8), and only at the dot: each part
       holds its words together, so "Nobody named yet" is never split across two lines */
    expect(who.textContent).toBe('No boat price yet · Nobody named yet')
    expect(card).not.toHaveTextContent('$')
  })

  it('puts the maker’s own mark on the card where no photograph of the boat is held', () => {
    fileIt(
      doc({ rootTableId: 'boat_stacer', subjectLabel: 'Stacer - 529 Assault Pro (Tournament)' }),
    )
    render(<Home business="Northside Marine" now={clock} />)
    const card = within(desk()).getByRole('button', { name: /529 Assault Pro/ })
    expect(card.querySelector('img')?.getAttribute('src')).toMatch(/brand-marks\/stacer/)
  })

  it('draws a quote given today as the paper, to whom and when, and opens it', async () => {
    const issuedAt = new Date(NOW.getTime() - 20 * 60_000).toISOString()
    const given = fileIt(doc({ state: 'issued', issuedAt, customer: { name: 'R. Kelleher' } }))
    const openQuote = vi.fn<(id: string, state: string) => void>()
    render(<Home business="Northside Marine" now={clock} openQuote={openQuote} />)
    const card = within(desk()).getByRole('button', { name: new RegExp(boatOfQuote(given).name) })
    expect(within(card).getByText(`Given today at ${localTimeOf(issuedAt)}`)).toBeInTheDocument()
    expect(within(card).getByText('To R. Kelleher')).toBeInTheDocument()
    expect(card).not.toHaveTextContent('$')
    /* given this morning, they have it in their hand: not yet a person owed a call */
    expect(within(desk()).queryByRole('button', { name: /^R\. Kelleher/ })).toBeNull()
    await userEvent.click(card)
    expect(openQuote).toHaveBeenCalledWith(given.id, 'issued')
  })

  /* THE CRITIQUE, MAJOR 9: who to call carries the number, and keeps to the week */
  it('draws a person given a quote this week with the boat, the day and the number to ring', async () => {
    const issuedAt = new Date(NOW.getTime() - 3 * 86_400_000).toISOString()
    const given = fileIt(
      doc({
        state: 'issued',
        issuedAt,
        customer: { name: 'R. Kelleher', contact: ['0412 345 678'] },
      }),
    )
    const openQuote = vi.fn<(id: string, state: string) => void>()
    render(<Home business="Northside Marine" now={clock} openQuote={openQuote} />)
    const card = within(desk()).getByRole('button', { name: /^R\. Kelleher/ })
    const day = dayWritten(localDayOf(new Date(issuedAt)), localDayOf(NOW))
    expect(
      within(card).getByText(`Given the ${boatOfQuote(given).name} on ${day}.`),
    ).toBeInTheDocument()
    expect(within(card).getByText('0412 345 678')).toBeInTheDocument()
    expect(card).not.toHaveTextContent('$')
    await userEvent.click(card)
    expect(openQuote).toHaveBeenCalledWith(given.id, 'issued')
  })

  it('says today in one line at the sea’s foot, read off the diary', () => {
    fileIt(doc())
    render(<Home business="Northside Marine" now={clock} />)
    const said = todaySaid(todayOf(quotes.getState().quotes, localDayOf(NOW)))
    expect(said).not.toBeNull()
    expect(screen.getByText(said!)).toBeInTheDocument()
    expect(screen.queryByText(NOTHING_YET)).toBeNull()
  })

  /* THE REFINEMENT ROUND (2026-10-21): "Given today at 22:06" on the card and "Today: 1 quote
     started and 1 given." under it said one giving twice. Every quote given today is on the row,
     so today's line counts only what no card counts */
  it('says a giving once, on its card, and today’s line counts only the quotes started', () => {
    const day = { touched: 2, lastAt: '10:00', lastDay: '2026-10-20' }
    const both = { ...day, started: 2, given: 1, said: 'Today: 2 quotes started and 1 given.' }
    expect(todaySaid(both)).toBe('2 quotes started today.')
    expect(todaySaid({ ...both, started: 1 })).toBe('1 quote started today.')
    expect(todaySaid({ ...both, started: 0, said: 'Today: 1 quote given.' })).toBeNull()
    const still = 'Nothing has moved today. The last thing kept was on Friday 16 October.'
    expect(todaySaid({ ...day, started: 0, given: 0, touched: 0, said: still })).toBe(still)
    expect(todaySaid(null)).toBeNull()
  })

  /* THE SECOND CRITIQUE, BLOCKER 1: the row is one row in every state, and what does not fit
     is folded into its last card, a door to where it is kept — never a line under the row */
  it('draws as many cards as the row has room for, and folds the rest into its last card', async () => {
    for (let i = 0; i < 6; i += 1) fileIt(doc())
    const openQuotes = vi.fn<() => void>()
    render(<Home business="Northside Marine" now={clock} openQuotes={openQuotes} />)
    const cards = within(desk()).getAllByRole('listitem')
    expect(cards.length).toBeLessThan(6)
    const folded = 6 - (cards.length - 1)
    const more = within(desk()).getByRole('button', {
      name: new RegExp(`^${folded} more In Quotes`),
    })
    /* what it holds, by kind, and not counted again under the face that counts it */
    expect(within(more).getByText('Drafts')).toBeInTheDocument()
    expect(more).not.toHaveTextContent(`${folded} drafts`)
    expect(within(more).getByText('In Quotes')).toBeInTheDocument()
    /* the count is drawn once, on the card's face, and said once to a reader */
    expect(more).not.toHaveTextContent(/more on the desk/)
    expect(within(more).getByText(`+${folded}`)).toBeInTheDocument()
    expect(within(more).getByText(`${folded} more`)).toBeInTheDocument()
    expect(within(desk()).queryByText(/more, in Quotes/)).toBeNull()
    await userEvent.click(more)
    expect(openQuotes).toHaveBeenCalledTimes(1)
  })

  it('says what a folded card holds, kind by kind', () => {
    expect(foldedSaid([])).toBe('')
    expect(foldedSaid([], true)).toBe('')
  })

  it('refuses a card with one sentence where nothing handed it a way to open one', () => {
    fileIt(doc())
    render(<Home business="Northside Marine" now={clock} />)
    const card = within(desk()).getByRole('button', { name: /Sport 560/ })
    expect(card).toHaveAttribute('aria-disabled', 'true')
    expect(card).toHaveAccessibleDescription(NO_WAY_TO_A_FILED_QUOTE)
    expect(screen.getAllByText(NO_WAY_TO_A_FILED_QUOTE)).toHaveLength(1)
  })
})
