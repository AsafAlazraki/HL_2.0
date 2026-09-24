import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ModuleDef, QuoteDef, QuoteEvent, QuoteLine } from '@/domain/model'
import { money } from '@/domain/money'
import {
  addLine,
  apply,
  issue,
  newVersionOf,
  setCustomer,
  type QuoteCommand,
} from '@/domain/quote/commands'
import { localDayOf } from '@/domain/quote/day'
import { dayTitle } from '@/domain/quote/diary/history'
import { dayWritten } from '@/domain/quote/diary/days'
import { quoteTotals } from '@/domain/quote/totals'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import {
  History,
  NO_DIARY_SAY,
  NO_SHEET_TO_PRICE_FROM,
  NO_WAY_TO_THE_PICKER,
  type HistoryPosition,
} from './History'

/* ============================================================
   THE DIARY, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   This is the intent of the old repo's `features/history/render.test.ts`
   (twenty cases, evidence only, HL_Playground) carried across: it
   pinned the shape of fault where the logic is right and the screen
   never says it — a list that renders nothing because a hook returned
   early, a sentence missing because its condition was inverted, a
   version mark drawn on every row because "more than one" was `>= 1`.
   None of those is visible to a unit test of the function underneath,
   and every one of them is a case below.

   EVERY SENTENCE ASSERTED ON AN OPENED LINE IS ONE A REAL COMMAND
   SAID. The documents here are built by running `apply` with the
   engine's own commands at chosen instants, so a test that looks for
   `event.said` on the screen is looking for the sentence
   `commands.ts` actually produced, not one typed twice.

   THE STORE IS REOPENED ON A FRESH MEMORY DATABASE BEFORE EVERY CASE,
   for the register's reason: vitest gives one module instance to a
   whole file. The one suite that needs the price file loads the real
   pack, and it runs LAST because the catalogue store has no reset.
   ============================================================ */

const ORG = 'northside'
/** THE WALL CLOCK, AND NOT A FIXED MORNING. The screen is handed this
 *  clock, and the store singleton it writes through stamps every event
 *  with the wall clock of its own; a fixed instant here put the
 *  customer-set event of a re-raised quote on the real today and the
 *  mint on the fixed one, which is a disagreement only a test can
 *  produce. Every day below is relative to this instant, so 'Today' is
 *  still a fact — it is the day the suite runs on. */
const NOW = new Date()
const clock = () => NOW
const au = (n: number): string => n.toLocaleString('en-AU')

/** An instant `n` days before NOW at a local hour — built from local
 *  fields, so "today" and "ten days ago" are the reader's own days. */
const daysAgo = (n: number, hour = 9, minute = 0): Date => {
  const d = new Date(NOW.getTime())
  d.setDate(d.getDate() - n)
  d.setHours(hour, minute, 0, 0)
  return d
}
const iso = (d: Date): string => d.toISOString()

let n = 0
function line(label: string, unitPrice: number | null): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'boat_stacer',
    rowId: `row_${n}`,
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

/** A document as `mintQuote` makes one, and the event that made it. */
function born(at: Date, over: Partial<QuoteDef> = {}): { quote: QuoteDef; event: QuoteEvent } {
  n += 1
  const subject = over.subjectLabel ?? 'Stacer 529 Assault Pro'
  const hull = line(subject, 28_530)
  const reference = over.reference ?? `${localDayOf(at).replaceAll('-', '')}-0${n}`
  const quote: QuoteDef = {
    id: `q${n}`,
    orgId: ORG,
    reference,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'boat_stacer',
    rootRowId: 'row_1',
    subjectLabel: subject,
    subjectSpecs: [],
    sections: [
      { blockId: '__subject', tableId: 'boat_stacer', title: 'Stacer', lineIds: [hull.id] },
      { blockId: 'b1', tableId: 'motor_yamaha', title: 'Motors', lineIds: [] },
    ],
    chapters: [{ id: '__subject', title: 'Stacer', tableId: 'boat_stacer' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: '' },
    preparedBy: 'Asaf',
    createdAt: iso(at),
    updatedAt: iso(at),
    ...over,
  }
  const event: QuoteEvent = {
    id: `e-${quote.id}-born`,
    kind: 'minted',
    at: iso(at),
    said: `${quote.subjectLabel} — quote ${quote.reference}`,
    changed: [],
  }
  return { quote: { ...quote, events: [event] }, event }
}

/** Run a real command at an instant. */
function did(quote: QuoteDef, command: QuoteCommand, at: Date): QuoteDef {
  const outcome = apply(quote, command, iso(at), 'Asaf')
  if (!('next' in outcome)) throw new Error(`refused: ${outcome.refused}`)
  return outcome.next
}

/** File one document the way the app files one: through the store. */
const fileIt = (quote: QuoteDef, event: QuoteEvent): QuoteDef => {
  quotes.getState().file(quote, event)
  return quotes.getState().get(quote.id) ?? quote
}

interface Seeded {
  v1: QuoteDef
  v2: QuoteDef
  draft: QuoteDef
  walkin: QuoteDef
}

/** Four documents: a conversation of two versions to a customer in
 *  the register, a draft started today to the same person, and a
 *  walk-in with a typed name. Every day below is relative to NOW. */
function seed(): Seeded {
  /* v1: started twelve days ago with two picks; addressed and issued
     ten days ago — the two-calendars case */
  let v1 = born(daysAgo(12, 9)).quote
  const v1Birth = v1.events[0]!
  v1 = did(v1, addLine('b1', line('Yamaha F70', 12_000)), daysAgo(12, 9, 5))
  v1 = did(v1, addLine('b1', line('Bimini top', 900)), daysAgo(12, 9, 10))
  v1 = did(v1, setCustomer({ name: 'R Kelleher', contact: ['0400 111 222'] }), daysAgo(10, 14, 0))
  v1 = { ...v1, customerRef: { tableId: '__customers', rowId: 'cust_a' } }
  v1 = did(v1, issue(), daysAgo(10, 14, 30))
  v1 = fileIt(v1, v1Birth)

  /* v2: a new version made three days ago, issued the same day */
  const made = newVersionOf(v1, '20260914-01', iso(daysAgo(3, 11)))
  let v2 = made.quote
  v2 = { ...v2, events: [made.event] }
  v2 = did(v2, setCustomer({ name: 'Rob Kelleher', contact: ['0400 111 222'] }), daysAgo(3, 11, 5))
  v2 = { ...v2, customerRef: { tableId: '__customers', rowId: 'cust_a' } }
  v2 = did(v2, issue(), daysAgo(3, 11, 30))
  v2 = fileIt(v2, made.event)

  /* a draft started today */
  const d = born(daysAgo(0, 9), { subjectLabel: 'Stacer 429 Proline' })
  let draft = did(d.quote, addLine('b1', line('Dunbier trailer', 4_000)), daysAgo(0, 9, 20))
  draft = did(draft, setCustomer({ name: 'Rob Kelleher' }), daysAgo(0, 9, 25))
  draft = { ...draft, customerRef: { tableId: '__customers', rowId: 'cust_a' } }
  draft = fileIt(draft, d.event)

  /* a walk-in, forty days ago, a typed name and no row behind it */
  const w = born(daysAgo(40, 15), { subjectLabel: 'Highfield SP520' })
  let walkin = did(w.quote, setCustomer({ name: 'Dave' }), daysAgo(40, 15, 10))
  walkin = did(walkin, issue(), daysAgo(40, 15, 20))
  walkin = fileIt(walkin, w.event)

  return { v1, v2, draft, walkin }
}

/* THE SEAMS, AS SPIES. The screen never reaches for the router. */
let opened: { id: string; state: string }[] = []
let started = 0
let positions: HistoryPosition[] = []
const seams = {
  openQuote: (id: string, state: string) => {
    opened.push({ id, state })
  },
  newQuote: () => {
    started += 1
  },
  onPosition: (p: HistoryPosition) => {
    positions.push(p)
  },
}

beforeEach(async () => {
  n = 0
  opened = []
  started = 0
  positions = []
  await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
})

const draw = (extra: Partial<React.ComponentProps<typeof History>> = {}) =>
  render(<History business="Northside Marine" now={clock} {...seams} {...extra} />)
const drawStranded = () => render(<History business="Northside Marine" now={clock} />)

const spine = () => screen.getByRole('grid', { name: 'History' })
const group = (name: string | RegExp) => within(spine()).getByRole('rowgroup', { name })
const linesIn = (g: HTMLElement) =>
  within(g)
    .getAllByRole('row')
    .filter((row) => row.classList.contains('hy-line'))
const fold = () => screen.getByTestId('fold')
const title = (d: Date): string => dayTitle(localDayOf(d), localDayOf(NOW))
/** A day's head as the spine writes it: `Today` and `Yesterday` by name, every other day as
 *  its date written out (`Monday 14 September`), which is also the rowgroup's name. */
const heading = (d: Date): string => {
  const word = title(d)
  return word === 'Today' || word === 'Yesterday'
    ? word
    : dayWritten(localDayOf(d), localDayOf(NOW))
}

/* ---------------------------------------------------------- */

describe('an empty diary is honest about being empty', () => {
  it('names the place, counts what you already have, and gives one act that works', async () => {
    const person = userEvent.setup()
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('History')
    expect(
      screen.getByText((_, el) => el?.textContent === '0 quotes · 0 days · 0 events'),
    ).toBeInTheDocument()

    /* Today is a node whether or not anything has happened */
    const today = group('Today')
    expect(
      within(today).getByRole('heading', { name: 'Nothing has been written in this diary yet.' }),
    ).toBeInTheDocument()
    for (const q of ['What will appear here', 'Why it is empty today', 'Where a quote starts']) {
      expect(within(today).getByText(q)).toBeInTheDocument()
    }
    /* where a quote starts is said in a dealer's words — and no router pattern or address is
       printed anywhere on the screen (built-critique-m2.md #14) */
    expect(within(today).getByText('Where a quote starts').nextElementSibling).toHaveTextContent(
      /New quote, on the Today node above, opens the picker/,
    )
    expect(document.body.textContent).not.toMatch(/\/quote\b|\$id|\/customers|\/quotes/)

    const act = within(today).getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'false')
    expect(act, 'the one amber on the screen').toHaveAttribute('data-intent', 'act')
    await person.click(act)
    expect(started).toBe(1)
  })

  it('draws no spans and no find field when there is nothing to cut', () => {
    draw()
    expect(screen.queryByRole('group', { name: 'Which days' })).toBeNull()
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('invents no photograph and no entry to fill the hole', () => {
    draw()
    expect(document.querySelectorAll('img')).toHaveLength(0)
    expect(screen.getByText(/No entry is invented to fill it/)).toBeInTheDocument()
  })

  it('says where the picker is when the screen was handed no way there, and keeps its focus', () => {
    drawStranded()
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getAllByText(NO_WAY_TO_THE_PICKER).length).toBeGreaterThan(0)
  })
})

/* ---------------------------------------------------------- */

describe('the diary, with quotes in it', () => {
  it('heads the page with counted facts and nothing projected', () => {
    const { v1, v2, draft, walkin } = seed()
    draw()
    const events = [v1, v2, draft, walkin].reduce((t, q) => t + q.events.length, 0)
    /* 4 quotes over 5 days: today, three, ten, twelve and forty days ago */
    expect(
      screen.getByText((_, el) => el?.textContent === `4 quotes · 5 days · ${au(events)} events`),
    ).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Which days' })).toBeInTheDocument()
  })

  it('cuts the spine into days, names today as Today, and puts the draft started today under it', () => {
    const { draft } = seed()
    draw()
    const today = group('Today')
    const [only] = linesIn(today)
    expect(only).toHaveTextContent(draft.reference)
    expect(only).toHaveTextContent('Stacer 429 Proline')
    /* the day it was made is a fact and the spine says which one in
       two ways: written out for a person, and as the ISO day in the
       `<time>` a machine reads — never printed as a database's date */
    expect(group(heading(daysAgo(12)))).toBeInTheDocument()
    expect(spine().querySelector(`time[datetime="${localDayOf(daysAgo(12))}"]`)).toHaveTextContent(
      heading(daysAgo(12)),
    )
    expect(within(spine()).queryByText(localDayOf(daysAgo(12)))).toBeNull()
  })

  it('puts a quote started on one day and issued on another under BOTH days, each line counting only its own day', () => {
    const { v1 } = seed()
    draw()
    const startDay = group(heading(daysAgo(12)))
    const issueDay = group(heading(daysAgo(10)))
    const [startLine] = linesIn(startDay)
    const [issued] = linesIn(issueDay)
    expect(startLine).toHaveTextContent(v1.reference)
    expect(startLine).toHaveTextContent('started · 2 picks')
    expect(startLine).not.toHaveTextContent('issued')
    expect(issued).toHaveTextContent(v1.reference)
    expect(issued).toHaveTextContent('addressed · issued')
    expect(issued).not.toHaveTextContent('picks')
  })

  it('marks a reissued quote with its version and leaves a one-off unmarked', () => {
    seed()
    draw()
    expect(within(spine()).getAllByText('v2 of 2').length).toBeGreaterThan(0)
    expect(within(spine()).getAllByText('v1 of 2').length).toBeGreaterThan(0)
    expect(within(spine()).queryByText('v1 of 1')).toBeNull()
  })

  it('opens a line in place to the sentences the commands said, each with its time, and nothing written here', async () => {
    const person = userEvent.setup()
    const { v2 } = seed()
    draw()
    const [row] = linesIn(group(heading(daysAgo(3))))
    await person.click(row)
    const openedLine = fold()
    for (const e of v2.events) {
      expect(within(openedLine).getByText(e.said)).toBeInTheDocument()
    }
    /* the stamp beside each is the reader's own day and hour */
    expect(within(openedLine).getAllByText(/^\S.* · \d\d:\d\d$/).length).toBe(v2.events.length)
    expect(
      within(openedLine).getByText(
        `${au(v2.events.length)} events in all · ${au(v2.events.length)} on ${title(daysAgo(3))}`,
      ),
    ).toBeInTheDocument()
    expect(row).toHaveAttribute('aria-expanded', 'true')
    /* who said it is on the entry */
    expect(within(openedLine).getAllByText('by Asaf').length).toBeGreaterThan(0)
  })

  it('reads the chain as a sentence, and its versions as dated entries in order', async () => {
    const person = userEvent.setup()
    const { v1, v2 } = seed()
    draw()
    await person.click(linesIn(group(heading(daysAgo(3))))[0]!)
    const f = fold()
    expect(within(f).getByText(`v2 of 2 · replaces ${v1.reference}`)).toBeInTheDocument()
    const versions = within(f).getByRole('region', { name: 'Its versions' })
    const items = within(versions).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent(v1.reference)
    expect(items[0]).toHaveTextContent(`${title(daysAgo(12))} · Replaced`)
    expect(items[1]).toHaveTextContent(v2.reference)
    expect(items[1]).toHaveTextContent(`${title(daysAgo(3))} · Given`)
  })

  it('moves to another version’s line when its entry is pressed, and writes it into the address', async () => {
    const person = userEvent.setup()
    const { v1 } = seed()
    draw()
    await person.click(linesIn(group(heading(daysAgo(3))))[0]!)
    const versions = within(fold()).getByRole('region', { name: 'Its versions' })
    await person.click(within(versions).getByRole('button', { name: v1.reference }))
    const f = fold()
    expect(within(f).getByText(`v1 of 2 · replaced by 20260914-01`)).toBeInTheDocument()
    expect(positions.at(-1)?.open).toBe(v1.id)
    /* the newest day it is drawn on: the day it was issued */
    expect(positions.at(-1)?.day).toBe(localDayOf(daysAgo(10)))
  })

  it('says a quote has no customer rather than leaving the space blank', () => {
    const { quote, event } = born(daysAgo(1, 9))
    fileIt(quote, event)
    draw()
    expect(within(spine()).getByText('Nobody named on it')).toBeInTheDocument()
  })

  it('shows a document with no diary under the day it was made, and says so when opened', async () => {
    const person = userEvent.setup()
    /* read back out of a file that dropped the log — the store keeps
       the log on anything IT files, so this one is placed directly */
    const bare: QuoteDef = { ...born(daysAgo(2, 9)).quote, events: [] }
    quotes.setState((s) => ({ quotes: [bare, ...s.quotes] }))
    draw()
    const [row] = linesIn(group(heading(daysAgo(2))))
    expect(row).toHaveTextContent('no diary kept')
    await person.click(row)
    expect(within(fold()).getByText(NO_DIARY_SAY)).toBeInTheDocument()
  })

  it('carries the day’s tally on its head: quotes, events, given, and the sum of what was given', () => {
    const { v1 } = seed()
    draw()
    const head = within(group(heading(daysAgo(10)))).getAllByRole('row')[0]!
    expect(head).toHaveTextContent('1 quote · 2 events · 1 given')
    expect(within(head).getByText(money(quoteTotals(v1).total))).toBeInTheDocument()
    /* and a day with nothing given carries no figure */
    const startHead = within(group(heading(daysAgo(12)))).getAllByRole('row')[0]!
    expect(startHead).toHaveTextContent('1 quote · 3 events')
    expect(startHead).not.toHaveTextContent('given')
  })

  it('narrows to a span from the address, says what it hid, and comes back on Any day', async () => {
    const person = userEvent.setup()
    seed()
    draw({ span: 'today' })
    expect(linesIn(group('Today'))).toHaveLength(1)
    expect(screen.queryByRole('rowgroup', { name: heading(daysAgo(3)) })).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Today: 3 quotes on 4 earlier days are outside it.',
    )
    expect(screen.getByRole('button', { name: /^Today/ })).toHaveAttribute('aria-pressed', 'true')
    await person.click(screen.getByRole('button', { name: /^Any day/ }))
    expect(screen.getByRole('rowgroup', { name: heading(daysAgo(3)) })).toBeInTheDocument()
    expect(positions.at(-1)?.span).toBeUndefined()
  })

  it('finds by what was typed, and quotes it back when nothing matches', () => {
    seed()
    const { unmount } = draw({ who: 'Proline' })
    expect(screen.getByRole('status')).toHaveTextContent('1 of 4 match “Proline”.')
    expect(screen.queryByRole('rowgroup', { name: heading(daysAgo(3)) })).toBeNull()
    unmount()
    draw({ who: 'zzz' })
    expect(screen.getByRole('status')).toHaveTextContent('Nothing in the diary matches “zzz”.')
  })

  it('narrows to one customer of the register by the row, and clears on Everyone', async () => {
    const person = userEvent.setup()
    seed()
    draw({ customer: 'cust_a' })
    expect(screen.getByRole('status')).toHaveTextContent('3 of 4 are addressed to Rob Kelleher.')
    expect(screen.queryByRole('rowgroup', { name: heading(daysAgo(40)) })).toBeNull()
    await person.click(screen.getByRole('button', { name: /^Everyone/ }))
    expect(screen.getByRole('rowgroup', { name: heading(daysAgo(40)) })).toBeInTheDocument()
    expect(positions.at(-1)?.customer).toBeUndefined()
  })

  it('offers a customer their own history only when there is somewhere to send it', async () => {
    const person = userEvent.setup()
    seed()
    const openCustomer = vi.fn<(rowId: string) => void>()
    const { unmount } = draw({ openCustomer })
    await person.click(linesIn(group(heading(daysAgo(3))))[0]!)
    await person.click(within(fold()).getByRole('button', { name: 'Their history' }))
    expect(openCustomer).toHaveBeenCalledWith('cust_a')
    /* the walk-in has no row behind the name, so there is nowhere to go */
    await person.click(linesIn(group(heading(daysAgo(40))))[0]!)
    expect(within(fold()).queryByRole('button', { name: 'Their history' })).toBeNull()
    unmount()
    draw()
    await person.click(linesIn(group(heading(daysAgo(3))))[0]!)
    expect(within(fold()).queryByRole('button', { name: 'Their history' })).toBeNull()
  })
})

/* ---------------------------------------------------------- */

describe('the keyboard, bound to the spine', () => {
  it('Space opens the line under the cursor in place and Enter opens the document where it belongs', async () => {
    const person = userEvent.setup()
    const { draft, v2, v1 } = seed()
    draw()
    spine().focus()
    await person.keyboard(' ')
    expect(within(fold()).getByText(draft.reference)).toBeInTheDocument()
    await person.keyboard('{Enter}')
    expect(opened.at(-1)).toEqual({ id: draft.id, state: 'draft' })

    await person.keyboard('j')
    await person.keyboard('{Enter}')
    expect(opened.at(-1)).toEqual({ id: v2.id, state: 'issued' })

    await person.keyboard('j')
    await person.keyboard('{Enter}')
    expect(opened.at(-1)).toEqual({ id: v1.id, state: 'superseded' })
  })

  it('Escape climbs the ladder: the fold first, then the span', async () => {
    const person = userEvent.setup()
    seed()
    draw()
    spine().focus()
    await person.keyboard('t')
    expect(screen.getByRole('status')).toHaveTextContent(/^Today:/)
    await person.keyboard(' ')
    expect(screen.getByTestId('fold')).toBeInTheDocument()
    await person.keyboard('{Escape}')
    expect(screen.queryByTestId('fold')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent(/^Today:/)
    await person.keyboard('{Escape}')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('N starts a quote and the keys are printed on the acts', async () => {
    const person = userEvent.setup()
    seed()
    draw()
    spine().focus()
    await person.keyboard('n')
    expect(started).toBe(1)
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(within(act).getByText('N')).toBeInTheDocument()
    await person.keyboard(' ')
    const f = fold()
    expect(
      within(within(f).getByRole('button', { name: 'Open the build' })).getByText('Enter'),
    ).toBeInTheDocument()
    expect(
      within(
        within(f).getByRole('button', { name: 'Quote this again, at today’s prices' }),
      ).getByText('Q'),
    ).toBeInTheDocument()
  })

  it('refuses to quote again on a desk with no price file open, with the reason where the act is', async () => {
    const person = userEvent.setup()
    seed()
    draw()
    await person.click(linesIn(group(heading(daysAgo(3))))[0]!)
    const act = within(fold()).getByRole('button', { name: 'Quote this again, at today’s prices' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(within(fold()).getByText(NO_SHEET_TO_PRICE_FROM)).toBeInTheDocument()
    /* the door, beside the refusal, when the screen was handed one */
    expect(within(fold()).queryByRole('button', { name: 'Load the Master Price File' })).toBeNull()
  })
})

/* ---------------------------------------------------------- */

/* THE ONE SUITE THAT NEEDS THE PRICE FILE, and it runs last: the
   catalogue store is a module singleton with no reset, so once the
   pack is in it every later render would find a sheet open. */
/* ---------------------------------------------------------- */

/* WHAT THE BUILT CRITIQUE OF 2026-09-23 FOUND, pinned where a person sees it
   (docs/directions/built-critique-m2.md): #4 a day printed in an order that cannot have
   happened, #14 router patterns shown to a dealer, #17 one line over a floor, #18 keycaps
   on a device with no keys, and rule (a) of the round — the pill carries the doors. */
describe('the spine, as the critique asked for it', () => {
  it('prints a sitting that shared one instant in the order it happened, each word in its strand', () => {
    const at = daysAgo(0, 9)
    const b = born(at, { subjectLabel: 'Highfield SP660' })
    let q = did(b.quote, setCustomer({ name: 'R. Kelleher' }), at)
    q = did(q, issue(), at)
    /* ids that sort AGAINST the log, as a random id did on one of the critic's two shots */
    q = {
      ...q,
      events: q.events.map((e, i) => ({ ...e, id: ['e-zz', 'e-mm', 'e-aa'][i] ?? e.id })),
    }
    fileIt(q, q.events[0]!)
    draw()
    const [only] = linesIn(group('Today'))
    const what = only!.querySelector('.hy-cell--what')!
    expect(what).toHaveTextContent('started · addressed · issued')
    expect(
      [...what.querySelectorAll('[data-strand]')].map((e) => e.getAttribute('data-strand')),
    ).toEqual(['begun', 'addressed', 'given'])
  })

  it('carries no Home of its own: the pill carries the doors', () => {
    seed()
    draw({ goHome: () => {} })
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull()
  })

  it('says every place a press lands in words, never as an address', async () => {
    const person = userEvent.setup()
    seed()
    draw({ openCustomer: () => {} })
    await person.click(linesIn(group(heading(daysAgo(3))))[0]!)
    expect(fold()).toHaveTextContent('ready to print on A4')
    expect(fold()).toHaveTextContent('on their own page in Customers')
    expect(document.body.textContent).not.toMatch(/\/quote\b|\$id|\/customers|\/quotes/)
  })

  it('ends the spine where the diary began, counted, and says where a span ends instead', async () => {
    const person = userEvent.setup()
    const { v1, v2, walkin } = seed()
    draw()
    const end = screen.getByRole('region', { name: 'Where this diary begins' })
    const began = dayWritten(localDayOf(daysAgo(40)), localDayOf(NOW))
    expect(end).toHaveTextContent(`Since 15:00, ${began}`)
    expect(within(end).getByText('quotes written').parentElement).toHaveTextContent('4')
    expect(within(end).getByText('given to customers').parentElement).toHaveTextContent('3')
    const given = quoteTotals(v1).total + quoteTotals(v2).total + quoteTotals(walkin).total
    expect(within(end).getByText(money(given))).toBeInTheDocument()

    await person.click(screen.getByRole('button', { name: /^Last 7 days/ }))
    expect(screen.queryByRole('region', { name: 'Where this diary begins' })).toBeNull()
    expect(screen.getByText('Last 7 days ends here')).toBeInTheDocument()
  })

  it('draws the last fourteen days as a dot for every event, and says each day in words', () => {
    seed()
    draw()
    const rhythm = screen.getByRole('figure', { name: /The last fourteen days/ })
    const days = within(rhythm).getAllByRole('listitem')
    expect(days).toHaveLength(14)
    const today = days.at(-1)!
    /* the draft started today: minted, a trailer on it, addressed */
    expect(today.querySelectorAll('.hy-bead')).toHaveLength(3)
    expect(today).toHaveTextContent(
      `${dayWritten(localDayOf(NOW), localDayOf(NOW))}: 3 things done, on 1 quote`,
    )
    /* three days ago, the second version: made, addressed, issued — in that order */
    const three = days.at(-4)!
    expect(
      [...three.querySelectorAll('.hy-bead')].map((b) => b.getAttribute('data-strand')),
    ).toEqual(['begun', 'addressed', 'given'])
  })

  it('draws every keycap inside a box that a coarse pointer takes away', () => {
    seed()
    draw()
    const caps = [...document.querySelectorAll('kbd')].filter(
      (k) => !k.parentElement?.closest('kbd'),
    )
    expect(caps.length).toBeGreaterThan(5)
    for (const cap of caps) expect(cap.closest('.hy-cap, .hy-keys')).not.toBeNull()
  })

  it('says the price file is being looked for while it is read, never that none is open', () => {
    seed()
    draw()
    expect(catalogue.getState().status).not.toBe('ready')
    expect(screen.getByText('Looking for a price file in this browser…')).toBeInTheDocument()
    expect(screen.queryByText(/No price file is open/)).toBeNull()
  })
})

describe('quote this again, with the price file open', () => {
  let pack: PackFixture
  let assaultPro: string

  beforeAll(async () => {
    pack = await loadPack()
    await catalogue.getState().load({
      entities: pack.entities,
      rowsByEntity: pack.rowsByEntity,
      manifest: pack.manifest,
      modules: Object.values(pack.ctx.modules) as ModuleDef[],
    })
    const found = pack.rowsByEntity.boat_stacer?.find((row) =>
      String(row.values['boat_stacer.c'] ?? '').includes('529 Assault Pro'),
    )
    if (!found) throw new Error('the pack no longer holds the Stacer 529 Assault Pro')
    assaultPro = found.id
    session.getState().signIn('Asaf')
  })

  it('mints a new draft for the same row at today’s prices, says so on the head of the spine, and takes it back on Discard', async () => {
    const person = userEvent.setup()
    /* an issued quote against the real row, to a typed name */
    const b = born(daysAgo(5, 9), { rootRowId: assaultPro })
    let old = did(
      b.quote,
      setCustomer({ name: 'R Kelleher', contact: ['0400 111 222'] }),
      daysAgo(5, 9, 5),
    )
    old = did(old, issue(), daysAgo(5, 10))
    old = fileIt(old, b.event)
    draw()

    await person.click(linesIn(group(heading(daysAgo(5))))[0]!)
    const act = within(fold()).getByRole('button', { name: 'Quote this again, at today’s prices' })
    expect(act).toHaveAttribute('aria-disabled', 'false')
    expect(within(fold()).getByText(/Not one figure is copied from this one/)).toBeInTheDocument()
    await person.click(act)

    /* a new document, filed, addressed to the same person, priced from
       the file and not copied from the old one */
    const filed = quotes.getState().quotes
    expect(filed).toHaveLength(2)
    const made = filed.find((q) => q.id !== old.id)!
    expect(made.state).toBe('draft')
    expect(made.rootRowId).toBe(assaultPro)
    expect(made.customer.name).toBe('R Kelleher')
    expect(made.customerRef).toBeUndefined()
    const hull = made.lines.find((l) => l.rowId === assaultPro)!
    const row = pack.rowsByEntity.boat_stacer!.find((r) => r.id === assaultPro)!
    expect(hull.unitPrice).toBe(row.values['boat_stacer.qr'])
    expect(made.events.map((e) => e.kind)).toEqual(['minted', 'customer-set'])

    /* the step, on the head of the spine, in the commands' own words */
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent(made.events[0]!.said)
    expect(step).toHaveTextContent(made.events[1]!.said)
    /* and the diary records the act it just did: a new line under Today */
    const [newest] = linesIn(group('Today'))
    expect(newest).toHaveTextContent(made.reference)
    expect(newest).toHaveTextContent('started · addressed')

    /* the way back, pinned to the document it made */
    await person.click(within(step).getByRole('button', { name: 'Discard it' }))
    expect(quotes.getState().quotes).toHaveLength(1)
    expect(screen.getByTestId('last-step')).toHaveTextContent(`${made.reference} was discarded`)
    expect(screen.queryByRole('button', { name: 'Discard it' })).toBeNull()
  })

  it('refuses with the engine’s own sentence when the row is no longer on the sheet', async () => {
    const person = userEvent.setup()
    const b = born(daysAgo(6, 9), {
      rootRowId: 'row_that_was_deleted',
      subjectLabel: 'Stacer 400 Gone',
    })
    fileIt(b.quote, b.event)
    draw()
    await person.click(linesIn(group(heading(daysAgo(6))))[0]!)
    const act = within(fold()).getByRole('button', { name: 'Quote this again, at today’s prices' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(
      within(fold()).getByText(
        /Stacer 400 Gone is not on the sheet any more, so there is nothing to price/,
      ),
    ).toBeInTheDocument()
    expect(within(fold()).getByText(/still opens and still prints/)).toBeInTheDocument()
  })
})
