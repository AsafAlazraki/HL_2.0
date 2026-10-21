import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, QuoteDef, QuoteLine } from '@/domain/model'
import { money } from '@/domain/money'
import { NOTHING_FOUND } from '@/domain/quote/find'
import { quoteTotals } from '@/domain/quote/totals'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import {
  ISSUED_IS_NOT_DISCARDED,
  NO_NAME,
  NO_PHOTOGRAPH,
  NO_WAY_TO_OPEN,
  NO_WAY_TO_THE_PICKER,
  Quotes,
} from './Quotes'
import { WHAT_THE_WORDS_MEAN, WHERE_QUOTES_ARE_KEPT } from './Panel'
import { engineWordsIn } from '@/screens/configurator/say'
import { jointsOf, keepSeparators } from '@/domain/quote/wrap'

/* ============================================================
   THE REGISTER, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   Every document below is built in this file. Nothing is seeded into
   the app and nothing is invented for a person to look at: these are
   the shapes `mintQuote` and `newVersionOf` produce, written down so
   the register can be driven in a page with no router and no price
   file in it. The walk through the real picker is in
   `e2e/flows/quotes.spec.ts`, which is where a document that a person
   made gets opened by the screen that lists it.

   NO FIGURE HERE IS TYPED TWICE. Where a test asserts a total it asks
   `quoteTotals` for it and looks for that on the screen, so a test
   cannot agree with a register that has drifted from the engine —
   both have to agree with the document.

   THE STORE IS REOPENED ON A FRESH MEMORY DATABASE BEFORE EVERY CASE.
   vitest gives one module instance to a whole file, so a document
   filed in one case is filed for the rest of it otherwise — and the
   first assertion this suite makes is that an empty register is
   empty.
   ============================================================ */

const ORG = 'northside'
/** Every act a screen could promise and none of this app's screens does:
 *  an export or import, a backup or restore, a sync, a server or the
 *  internet, an upload or download, an email, a send, a share or a sign-in.
 *  Printing is real and is not on the list. */
const NO_PROMISED_ACT =
  /\b(export|import|backup|back up|restore|sync|server|online|upload|download|e-?mail|send|share|sign-?in|signature)/i
/** a Brisbane morning, fixed, so "2 hours ago" is a fact and not a clock */
const NOW = new Date('2026-09-17T10:00:00+10:00')
const clock = () => NOW

let n = 0

function line(label: string, unitPrice: number | null): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'boat_stacer',
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
  const hull = line('Stacer 529 Assault Pro', 28_530)
  const at = new Date(NOW.getTime() - n * 3_600_000).toISOString()
  return {
    id: `q${n}`,
    orgId: ORG,
    reference: `2026091${n}-01`,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'boat_stacer',
    rootRowId: 'row_1',
    subjectLabel: 'Stacer 529 Assault Pro',
    subjectSpecs: [],
    sections: [
      { blockId: '__subject', tableId: 'boat_stacer', title: 'Stacer', lineIds: [hull.id] },
    ],
    chapters: [{ id: '__subject', title: 'Stacer', tableId: 'boat_stacer' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: 'R. Kelleher' },
    preparedBy: 'Asaf',
    createdAt: at,
    updatedAt: at,
    ...over,
  }
}

/** File one document the way the app files one: through the store. */
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

/* THE TWO SEAMS, AS SPIES. The screen never reaches for the router,
   so what a press does is a function this suite hands in and then
   reads back — which is the same shape the route hands in, and the
   reason a register can be driven at all without a browser. */
interface Opened {
  id: string
  state: string
}
let opened: Opened[] = []
let started = 0
const seams = {
  openQuote: (id: string, state: string) => {
    opened.push({ id, state })
  },
  newQuote: () => {
    started += 1
  },
}

beforeEach(async () => {
  n = 0
  opened = []
  started = 0
  await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
})

const draw = () => render(<Quotes business="Northside Marine" now={clock} {...seams} />)
/** the same screen handed nowhere to go, which is the one state the
 *  two remaining refusals are about */
const drawStranded = () => render(<Quotes business="Northside Marine" now={clock} />)

const grid = () => screen.getByRole('grid', { name: 'Quotes' })
const rows = () => within(grid()).getAllByRole('row')
const panel = () => screen.getByRole('complementary', { name: 'The quote you are on' })
/** the quote in hand, in the room under the rows */
const room = () => screen.getByRole('button', { name: /: .+ · \S+-\d{2}$/ })

/* ---------------------------------------------------------- */

describe('the empty state, which is what the owner sees first', () => {
  it('teaches in four sentences and three honest zeros, each said once', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quotes')
    /* THE PILL COUNTS, AND THE HEAD DOES NOT (docs/WORDS.md, one fact, one place): "0 quotes
       are filed in this browser" stood beside the pill's count and three heads at 0 */
    expect(screen.queryByText(/filed in this browser/)).toBeNull()

    /* the three bands, in the dealer's three words, each standing at nothing — a head that
       says 0 and nothing under it to say it again (no "DRAFT 0" over "—") */
    for (const word of ['Draft', 'Given', 'Replaced']) {
      const band = within(grid()).getByRole('rowgroup', { name: word })
      expect(within(band).getByText('0')).toBeInTheDocument()
      expect(within(band).getAllByRole('row')).toHaveLength(1)
      expect(band).not.toHaveTextContent('—')
    }
    for (const engine of ['Issued', 'Superseded']) {
      expect(screen.queryByText(new RegExp(`\b${engine}\b`, 'i'))).toBeNull()
    }

    /* the panel says what is true, what to do, and what the words mean — once each */
    expect(within(panel()).getByRole('heading', { name: 'No quotes yet' })).toBeInTheDocument()
    expect(within(panel()).getByText(WHAT_THE_WORDS_MEAN)).toBeInTheDocument()
    expect(document.body.textContent?.split('Replaced').length).toBe(3) // the head, the sentence
  })

  it('invents no photograph to fill the hole', () => {
    draw()
    expect(document.querySelectorAll('img')).toHaveLength(0)
    /* no wireframe of a row nobody wrote (the M2-close critique's minor 17) */
    expect(screen.queryByText(/A row will read like this/i)).toBeNull()
  })

  /* A PROMISE NOBODY CAN PRESS (built-critique-m2-close-2.md, major 4):
     this said "Work is kept here — not on a server — until the file is
     exported", and no screen has an export. It says where a quote is kept
     today, and names no act that does not exist. */
  it('says where quotes are kept today, and promises no export, backup or sign-in', () => {
    const { container } = draw()
    expect(within(panel()).getByText(WHERE_QUOTES_ARE_KEPT)).toBeInTheDocument()
    expect(WHERE_QUOTES_ARE_KEPT).toMatch(/this computer/)
    expect(container.textContent).not.toMatch(NO_PROMISED_ACT)
    expect(container.textContent).not.toMatch(/\b(until|once|when)\b[^.]*\b(exported|online)\b/i)
  })

  it('offers the act, live, on the day there is nothing to list', async () => {
    const person = userEvent.setup()
    draw()
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'false')
    expect(act, 'the register’s one amber, while nothing is open').toHaveAttribute(
      'data-intent',
      'act',
    )
    await person.click(act)
    expect(started).toBe(1)
  })

  it('says where the picker is when the screen was handed no way there, and keeps its focus', () => {
    drawStranded()
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(act).toHaveAttribute('aria-describedby')
    expect(screen.getAllByText(NO_WAY_TO_THE_PICKER).length).toBeGreaterThan(0)
  })

  it('draws no find field over a list that hides nothing', () => {
    draw()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })

  /* THE COUNT IS SAID ONCE ON THIS SCREEN, on the band it counts (the refine round,
     2026-10-21): the head's "2 quotes are filed in this browser, and all of them are on this
     screen" said it a second time beside the pill's own count */
  it('counts the quotes on their bands and nowhere else on the screen', () => {
    fileIt(doc())
    fileIt(doc())
    const { container } = draw()
    const drafts = within(grid()).getByRole('rowgroup', { name: 'Draft' })
    expect(within(drafts).getByText('2')).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/filed in this browser|on this screen/)
    expect(container.textContent).not.toMatch(/\blists\b|\blines\b/)
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
})

/* ---------------------------------------------------------- */

describe('a row', () => {
  it('carries the reference, the customer, the boat, the total and the state', () => {
    const quote = fileIt(doc())
    draw()
    const row = within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ })
    expect(within(row).getByText(quote.reference)).toBeInTheDocument()
    expect(within(row).getByText('R. Kelleher')).toBeInTheDocument()
    expect(within(row).getByText('Stacer 529 Assault Pro')).toBeInTheDocument()
    /* asked of the engine, then looked for on the screen */
    expect(within(row).getByText(money(quoteTotals(quote).total))).toBeInTheDocument()
    expect(within(row).getByRole('gridcell', { name: 'Draft' })).toBeInTheDocument()
  })

  /* THE ONE THING TO CHANGE FIRST (built-critique-m2-close-2.md): the
     register says the boat the way a person says it, and keeps the file's
     own string for the dealer in the peek, not in the row */
  it('names a Highfield boat as a person says it, with the file’s string only in the peek', async () => {
    const person = userEvent.setup()
    const quote = fileIt(
      doc({ rootTableId: 'boat_highfield', subjectLabel: 'Highfield - ADV7 (HYP) B-G-B' }),
    )
    draw()
    const row = within(grid()).getByRole('row', { name: /Highfield ADV7/ })
    expect(
      within(row).getByText('Highfield ADV7 · Hypalon · Black / Grey / Black'),
    ).toBeInTheDocument()
    expect(row.textContent).not.toContain('(HYP)')
    await person.click(row)
    /* the peek keeps each separator on the word before it with a no-break
       space, so no line of the name opens on "·" or "/" (m2-last-critique.md,
       minor 8); read as words, it is the same name */
    const heading = within(panel()).getByRole('heading', { level: 2 })
    expect(heading.textContent?.replaceAll(' ', ' ')).toBe(
      'Highfield ADV7 · Hypalon · Black / Grey / Black',
    )
    expect(heading.textContent).toBe(
      keepSeparators('Highfield ADV7 · Hypalon · Black / Grey / Black'),
    )
    /* and drawn at its joints, so a line breaks between the boat, its
       material and its colourway before inside "Black / Grey / Black" */
    expect(
      [...heading.querySelectorAll('.qr-peek__joint')].map((part) => part.textContent),
    ).toEqual(jointsOf('Highfield ADV7 · Hypalon · Black / Grey / Black'))
    expect(within(panel()).getByText(quote.subjectLabel)).toBeInTheDocument()
  })

  /* THE MISSING NAME, SAID ONCE (the refine round, 2026-10-21): it stood on the row, on the
     peek's own line and in the peek's refusal. The row says only the boat, with no blank cell
     where a name goes, and the refusal is the one place it is said. */
  it('says the missing name once, in the refusal, and the row says only the boat', async () => {
    const person = userEvent.setup()
    fileIt(doc({ customer: { name: '' } }))
    draw()
    const row = within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ })
    expect(within(row).queryByText(NO_NAME)).toBeNull()
    expect(row.querySelector('.qr-customer')).toBeNull()
    await person.click(row)
    expect(within(panel()).queryByText(NO_NAME)).toBeNull()
    expect(within(panel()).getAllByText(/No customer’s name is on this quote/)).toHaveLength(1)
    expect(NO_NAME).toBe('No name yet')
  })

  it('names the customer on the row and in the peek when there is one', async () => {
    const person = userEvent.setup()
    fileIt(doc())
    draw()
    const row = within(grid()).getByRole('row', { name: /R\. Kelleher/ })
    await person.click(row)
    expect(within(panel()).getByText('R. Kelleher')).toBeInTheDocument()
  })

  it('puts a sentence where the figure would stand when no figure was decided', () => {
    fileIt(doc({ lines: [line('Signature Fisher 525F', null)], sections: [] }))
    draw()
    expect(within(grid()).getByText('Not priced yet')).toBeInTheDocument()
  })

  it('shows an issued quote as something other than a draft, without a coloured pill', () => {
    fileIt(doc({ state: 'issued', issuedAt: NOW.toISOString() }))
    draw()
    expect(within(grid()).getByRole('gridcell', { name: 'Given' })).toBeInTheDocument()
    expect(within(grid()).queryByRole('gridcell', { name: 'Draft' })).toBeNull()
  })

  it('ages by the act rather than by the record', () => {
    fileIt(
      doc({
        state: 'issued',
        issuedAt: new Date(NOW.getTime() - 2 * 3_600_000).toISOString(),
        updatedAt: new Date(NOW.getTime() - 9 * 3_600_000).toISOString(),
      }),
    )
    draw()
    expect(within(grid()).getByText('2 hours ago')).toBeInTheDocument()
  })
})

/* ---------------------------------------------------------- */

describe('the bands', () => {
  it('counts and sums each band off the documents in it', () => {
    const a = fileIt(doc({ lines: [line('Hull', 10_000)], reference: 'A-01' }))
    const b = fileIt(doc({ lines: [line('Hull', 20_000)], reference: 'B-01' }))
    const c = fileIt(doc({ state: 'issued', lines: [line('Hull', 45_000)], reference: 'C-01' }))
    draw()

    const sum = quoteTotals(a).total + quoteTotals(b).total
    expect(within(grid()).getByText(money(sum))).toBeInTheDocument()
    /* A SUM ONLY WHERE IT ADDS (the second components critique, finding 10): the Issued
       band holds one priced quote, so its head says no figure and its row says it once */
    const issued = within(grid()).getByRole('rowgroup', { name: 'Given' })
    expect(within(issued).getAllByText(money(quoteTotals(c).total))).toHaveLength(1)
    expect(
      within(issued).getByRole('row', { name: /C-01/ }),
      'the one figure is the row’s',
    ).toHaveTextContent(money(quoteTotals(c).total))
  })

  it('says each figure once at rest: on its row, never again on a head, a tile or the room', () => {
    const quote = fileIt(doc({ lines: [line('Hull', 61_250)] }))
    const { container } = draw()
    const figure = money(quoteTotals(quote).total)
    expect(within(container).getAllByText(figure)).toHaveLength(1)
    /* and the panel at rest counts nothing at all: the heads and the head's stamp do */
    expect(panel().textContent).not.toMatch(/\d/)
  })

  it('moves an issued quote into Superseded the moment a version names it', async () => {
    const first = fileIt(doc({ state: 'issued', reference: 'FIRST-01' }))
    fileIt(doc({ reference: 'SECOND-01', supersedesId: first.id }))
    draw()
    expect(within(grid()).getByRole('gridcell', { name: 'Replaced' })).toBeInTheDocument()
    expect(within(grid()).getByText('replaced by SECOND-01')).toBeInTheDocument()
    expect(within(grid()).getByText('replaces FIRST-01')).toBeInTheDocument()
    await Promise.resolve()
  })
})

/* ---------------------------------------------------------- */

describe('finding one', () => {
  const eight = () => {
    for (const who of ['Kelleher', 'Nguyen', 'Zhou', 'Adamo', 'Britten', 'Cho', 'Doust', 'Ege']) {
      fileIt(doc({ customer: { name: who }, reference: `REF-${who}` }))
    }
  }

  it('is one field, not a filter bar, once the list starts hiding rows', () => {
    eight()
    draw()
    const field = screen.getByRole('searchbox', { name: 'Find a quote' })
    expect(field).toHaveAttribute('placeholder', 'Quote number, customer, boat, or who prepared it')
  })

  it('narrows across customer, reference and who prepared it', async () => {
    const person = userEvent.setup()
    eight()
    draw()
    const field = screen.getByRole('searchbox', { name: 'Find a quote' })
    await person.type(field, 'nguyen')
    expect(within(grid()).getByText('Nguyen')).toBeInTheDocument()
    expect(within(grid()).queryByText('Zhou')).toBeNull()
    expect(screen.getByText(/1 of 8 match/)).toBeInTheDocument()
  })

  it('quotes the query back when nothing matches, rather than showing a blank', async () => {
    const person = userEvent.setup()
    eight()
    draw()
    await person.type(screen.getByRole('searchbox', { name: 'Find a quote' }), 'zzzz')
    expect(screen.getByText(NOTHING_FOUND('zzzz'))).toBeInTheDocument()
  })
})

/* ---------------------------------------------------------- */

describe('the keyboard, which belongs to the register and not to the window', () => {
  it('moves the cursor with the arrows, and answers no single letter (WCAG 2.1.4)', async () => {
    const person = userEvent.setup()
    fileIt(doc({ reference: 'ONE-01' }))
    fileIt(doc({ reference: 'TWO-01' }))
    draw()

    grid().focus()
    await person.keyboard('{ArrowDown}')
    expect(grid()).toHaveAttribute('aria-activedescendant', 'qr-row-TWO-01')
    await person.keyboard('{ArrowUp}')
    expect(grid()).toHaveAttribute('aria-activedescendant', 'qr-row-ONE-01')
    /* m2-last-critique.md major 7: J, K, N, V and the slash were
       single-character shortcuts; none of them does anything now */
    await person.keyboard('jkvn/')
    expect(grid()).toHaveAttribute('aria-activedescendant', 'qr-row-ONE-01')
    expect(started).toBe(0)
    expect(grid()).toHaveFocus()
  })

  it('peeks on Space and closes on Escape, without leaving the list', async () => {
    const person = userEvent.setup()
    const quote = fileIt(doc())
    draw()

    grid().focus()
    await person.keyboard(' ')
    expect(within(panel()).getByRole('heading', { name: quote.subjectLabel })).toBeInTheDocument()
    await person.keyboard('{Escape}')
    expect(within(panel()).queryByRole('heading', { name: quote.subjectLabel })).toBeNull()
    /* the list still holds every row: a peek is a second level of
       disclosure, never a page somebody has to come back from */
    expect(rows().length).toBeGreaterThan(0)
  })

  it('prints no keycap, at rest or on an open quote', async () => {
    const person = userEvent.setup()
    fileIt(doc({ state: 'issued' }))
    draw()

    /* nineteen caps stood on this screen at a desk (m2-last-critique.md major 7) */
    expect(document.querySelectorAll('kbd')).toHaveLength(0)
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    expect(within(panel()).getByRole('button', { name: 'Make a new version' })).toBeInTheDocument()
    expect(document.querySelectorAll('kbd')).toHaveLength(0)
  })
})

/* ---------------------------------------------------------- */

describe('reading one without leaving the list', () => {
  it('shows the figures, the price level and who prepared it', async () => {
    const person = userEvent.setup()
    const quote = fileIt(doc())
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))

    const open = panel()
    expect(
      within(open).getByRole('heading', { name: 'Stacer 529 Assault Pro' }),
    ).toBeInTheDocument()
    expect(within(open).getByText(quote.reference)).toBeInTheDocument()
    expect(within(open).getByText('Asaf')).toBeInTheDocument()
    /* the level by its declared name, as the build says it — never the
       engine's key (m2-last-critique.md, major 5: "RUNG cash") */
    expect(within(open).getByText('Priced at')).toBeInTheDocument()
    expect(within(open).getByText('Cash')).toBeInTheDocument()
    expect(within(open).queryByText('cash')).toBeNull()
    expect(within(open).getAllByText(money(quoteTotals(quote).total)).length).toBeGreaterThan(0)
    /* no tax rate is assumed: the price includes tax, and no rate is said where none is set —
       in the customer's words, not the printer's (the refine critique, 18) */
    expect(within(open).getByText('Includes tax.')).toBeInTheDocument()
    expect(open).not.toHaveTextContent(/% tax|separate tax line/)
    /* what the quote is made of, as items (docs/WORDS.md), never the engine's "Lines" */
    expect(within(open).getByText('Items')).toBeInTheDocument()
    expect(within(open).queryByText('Lines')).toBeNull()
    /* how long ago is the row's, beside the panel; the peek says the day it was started, once
       (the refine critique, 16: "4 minutes ago" on the row and "4 minutes ago · 2026-10-21") */
    expect(within(open).getByText('Started')).toBeInTheDocument()
    expect(open).not.toHaveTextContent(/\bago\b/)
  })

  it('says why a draft cannot go to a customer yet, in the engine’s own words', async () => {
    const person = userEvent.setup()
    fileIt(doc({ customer: { name: '' } }))
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    expect(
      within(panel()).getByText(/No customer’s name is on this quote yet, so it cannot be given\./),
    ).toBeInTheDocument()
  })
})

/* ---------------------------------------------------------- */

describe('opening the one under the cursor, which is what a register is for', () => {
  it('opens a draft where it is written, and says so on the act before it is pressed', async () => {
    const person = userEvent.setup()
    const quote = fileIt(doc())
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))

    const act = within(panel()).getByRole('button', { name: 'Open the build' })
    expect(act).toHaveAttribute('aria-disabled', 'false')
    expect(act, 'the amber follows what the screen is for').toHaveAttribute('data-intent', 'act')
    expect(
      screen.getByRole('button', { name: 'New quote' }),
      'and there is never a second amber arguing with it',
    ).toHaveAttribute('data-intent', 'veiled')
    /* said once, by the act's own name: no sentence under it says it again */
    expect(within(panel()).queryByText(/It opens where it is written/)).toBeNull()

    await person.click(act)
    expect(opened).toEqual([{ id: quote.id, state: 'draft' }])
  })

  it('opens a given quote as the printed quote the customer was given', async () => {
    const person = userEvent.setup()
    const quote = fileIt(doc({ state: 'issued', issuedAt: NOW.toISOString() }))
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))

    await person.click(within(panel()).getByRole('button', { name: 'Open the printed quote' }))
    expect(opened).toEqual([{ id: quote.id, state: 'issued' }])
  })

  it('opens a replaced quote as the printed quote too, and says a newer one replaced it', async () => {
    const person = userEvent.setup()
    const first = fileIt(doc({ state: 'issued', reference: 'FIRST-01' }))
    fileIt(doc({ reference: 'SECOND-01', supersedesId: first.id }))
    draw()
    await person.click(within(grid()).getByRole('row', { name: /replaced by SECOND-01/ }))

    expect(
      within(panel()).getByText('Replaced', { selector: '.qr-peek__state' }),
    ).toBeInTheDocument()
    expect(
      within(panel()).getByRole('button', { name: 'See SECOND-01, the latest' }),
    ).toBeInTheDocument()
    await person.click(within(panel()).getByRole('button', { name: 'Open the printed quote' }))
    expect(opened).toEqual([{ id: first.id, state: 'superseded' }])
  })

  it('opens on Enter and on a second press of the row, never on the first', async () => {
    const person = userEvent.setup()
    const quote = fileIt(doc())
    draw()

    grid().focus()
    await person.keyboard('{Enter}')
    expect(opened).toEqual([{ id: quote.id, state: 'draft' }])

    opened = []
    const row = within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ })
    await person.click(row)
    expect(opened, 'one press reads it, it does not leave the register').toEqual([])
    await person.dblClick(row)
    expect(opened).toEqual([{ id: quote.id, state: 'draft' }])
  })

  it('says where a document opens when the screen was handed nowhere, rather than dying quietly', async () => {
    const person = userEvent.setup()
    fileIt(doc())
    drawStranded()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    const act = within(panel()).getByRole('button', { name: 'Open the build' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(within(panel()).getByText(NO_WAY_TO_OPEN)).toBeInTheDocument()
  })

  it('starts a new quote from its act, and not from a letter', async () => {
    const person = userEvent.setup()
    fileIt(doc())
    draw()
    grid().focus()
    await person.keyboard('n')
    expect(started).toBe(0)
    await person.click(screen.getByRole('button', { name: 'New quote' }))
    expect(started).toBe(1)
  })
})

/* ---------------------------------------------------------- */

describe('making a new version', () => {
  it('copies an issued quote into a fresh draft that supersedes it', async () => {
    const person = userEvent.setup()
    const issued = fileIt(doc({ state: 'issued', reference: 'ISSUED-01' }))
    draw()

    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    await person.click(within(panel()).getByRole('button', { name: 'Make a new version' }))

    const filed = quotes.getState().quotes
    expect(filed).toHaveLength(2)
    const fresh = filed.find((q) => q.id !== issued.id)!
    expect(fresh.state).toBe('draft')
    expect(fresh.supersedesId).toBe(issued.id)
    expect(fresh.reference).not.toBe(issued.reference)
    /* the issued document was NOT edited */
    expect(quotes.getState().get(issued.id)?.state).toBe('issued')
    expect(quotes.getState().get(issued.id)?.reference).toBe('ISSUED-01')

    expect(
      screen.getByText(new RegExp(`${fresh.reference} is a new version of ISSUED-01`)),
    ).toBeInTheDocument()
    expect(within(grid()).getByRole('gridcell', { name: 'Replaced' })).toBeInTheDocument()
  })

  it('rails every version of the conversation, and marks the newest', async () => {
    const person = userEvent.setup()
    const issued = fileIt(doc({ state: 'issued', reference: 'V1' }))
    fileIt(doc({ reference: 'V2', supersedesId: issued.id }))
    draw()

    await person.click(within(grid()).getByRole('row', { name: /replaces V1/ }))
    const rail = within(panel()).getByRole('region', { name: 'Every version of this quote' })
    expect(within(rail).getByRole('button', { name: 'V1' })).toBeInTheDocument()
    expect(within(rail).getByRole('button', { name: 'V2' })).toBeInTheDocument()
    expect(within(rail).getByText('Latest')).toBeInTheDocument()
  })

  /* build-close-critique.md, minor 9: -01 given and replaced read "Nothing has been given" on
     the Issued band, and "Issued" on the rail beside a head that said "Superseded" */
  it('never says nothing was given when the one given quote was replaced', async () => {
    const person = userEvent.setup()
    const issued = fileIt(doc({ state: 'issued', reference: 'V1' }))
    fileIt(doc({ reference: 'V2', supersedesId: issued.id }))
    draw()

    /* the empty Given band is its head at 0, which claims nothing, beside a Replaced band of one */
    expect(within(grid()).queryByText(/Nothing has been given/)).toBeNull()
    const given = within(grid()).getByRole('rowgroup', { name: 'Given' })
    expect(within(given).getByText('0')).toBeInTheDocument()
    expect(within(given).getAllByRole('row')).toHaveLength(1)
    const replaced = within(grid()).getByRole('rowgroup', { name: 'Replaced' })
    expect(within(replaced).getByText('1')).toBeInTheDocument()

    await person.click(within(grid()).getByRole('row', { name: /replaced by V2/ }))
    const rail = within(panel()).getByRole('region', { name: 'Every version of this quote' })
    const [first, second] = within(rail).getAllByRole('listitem')
    expect(within(first!).getByText('Replaced')).toBeInTheDocument()
    expect(within(second!).getByText('Draft')).toBeInTheDocument()
    expect(within(rail).queryByText('Given')).toBeNull()
  })

  /* build-close-critique.md, minor 10 */
  it('offers a replaced quote only the way to what replaced it', async () => {
    const person = userEvent.setup()
    const issued = fileIt(doc({ state: 'issued', reference: 'V1' }))
    fileIt(doc({ reference: 'V2', supersedesId: issued.id }))
    draw()

    await person.click(within(grid()).getByRole('row', { name: /replaced by V2/ }))
    expect(within(panel()).queryByRole('button', { name: 'Make a new version' })).toBeNull()
    expect(within(panel()).queryByRole('button', { name: /^Discard/ })).toBeNull()
    await person.click(within(panel()).getByRole('button', { name: 'See V2, the latest' }))
    expect(within(panel()).getByText('V2', { selector: '.qr-peek__ref' })).toBeInTheDocument()
    expect(within(panel()).getByRole('button', { name: 'Discard this draft' })).toBeInTheDocument()
  })

  /* THE PROPERTY IS UNCHANGED, AND SAID BY ITS ABSENCE (the refine round, 2026-10-21): a draft
     is never versioned. It stood refused at rest on every draft with two sentences why, which
     pushed the panel's last act under its foot at 1280 × 800; a draft is changed where it is
     written, and that is the act its peek offers. */
  it('offers no new version of a draft, which is changed where it is written', async () => {
    const person = userEvent.setup()
    fileIt(doc())
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    expect(within(panel()).queryByRole('button', { name: 'Make a new version' })).toBeNull()
    expect(within(panel()).getByRole('button', { name: 'Open the build' })).toBeInTheDocument()
    expect(quotes.getState().quotes).toHaveLength(1)
  })
})

/* ---------------------------------------------------------- */

describe('discarding', () => {
  it('asks once before throwing a draft away, and then throws it away', async () => {
    const person = userEvent.setup()
    const quote = fileIt(doc())
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    await person.click(within(panel()).getByRole('button', { name: 'Discard this draft' }))
    await person.click(
      within(panel()).getByRole('button', { name: `Discard ${quote.reference} for good` }),
    )
    expect(quotes.getState().quotes).toHaveLength(0)
    expect(screen.getByText(new RegExp(`${quote.reference} was discarded`))).toBeInTheDocument()
  })

  it('never discards an issued quote, and says what to do instead', async () => {
    const person = userEvent.setup()
    fileIt(doc({ state: 'issued' }))
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    /* and it calls the document what it is: an issued quote is not a
       draft, and the control that refuses to throw it away says so */
    expect(within(panel()).queryByRole('button', { name: 'Discard this draft' })).toBeNull()
    const act = within(panel()).getByRole('button', { name: 'Discard this quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(within(panel()).getByText(ISSUED_IS_NOT_DISCARDED)).toBeInTheDocument()
  })
})

/* ---------------------------------------------------------- */

/** A table on the open file, as much of one as the register reads: its id, name and kind. */
const table = (id: string, name: string, kind: string) =>
  ({ id, name, kind, fields: [] }) as unknown as EntityDef

describe('this round’s rules (2026-09-23)', () => {
  it('draws no way home of its own: the pill carries Home on every screen (rule (a))', () => {
    draw()
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
  })

  it('says it is looking for the file while it is looking, and names no absence (critique #15)', () => {
    catalogue.setState({ status: 'loading', problem: null })
    render(<Quotes business={null} now={clock} {...seams} />)
    /* and says it once: while nothing is filed the panel says it, and the head does not */
    expect(screen.getAllByText('Looking for the price list…')).toHaveLength(1)
    expect(screen.queryByText('This business has not been named yet')).toBeNull()
    expect(screen.queryByText(/No price list is loaded/)).toBeNull()
  })

  it('offers every boat maker on the file as a door, in an empty register’s room', async () => {
    /* the M2-close critique's finding 6 and rule (e): the room under an empty
       register was the page's own paper. It holds where a quote starts — the
       boat makers the open file carries, and nothing else */
    const person = userEvent.setup()
    const before = catalogue.getState()
    catalogue.setState({
      status: 'ready',
      problem: null,
      tables: {
        boat_stacer: table('boat_stacer', 'Stacer', 'boat'),
        motor_yamaha: table('motor_yamaha', 'Yamaha', 'motor'),
        boat_stabicraft: table('boat_stabicraft', 'Stabicraft', 'boat'),
      },
    })
    const begun: string[] = []
    try {
      render(
        <Quotes
          business="Northside Marine"
          now={clock}
          {...seams}
          newQuoteOf={(id) => begun.push(id)}
        />,
      )
      const doors = screen.getByRole('region', { name: 'Start the first quote with a maker' })
      expect(within(doors).getAllByRole('button')).toHaveLength(2)
      expect(within(doors).queryByText('Yamaha')).toBeNull()
      /* Stacer's own mark is held in dark ink; Stabicraft's is not, so its name is set in type */
      expect(doors.querySelectorAll('img')).toHaveLength(1)
      expect(within(doors).getByText('Stabicraft')).toBeInTheDocument()
      await person.click(
        within(doors).getByRole('button', { name: 'Start a quote on a Stacer boat' }),
      )
      expect(begun).toEqual(['boat_stacer'])
    } finally {
      catalogue.setState(before, true)
    }
  })

  it('says what would have happened, never a router’s address (rule (c))', () => {
    for (const refusal of [NO_WAY_TO_OPEN, NO_WAY_TO_THE_PICKER]) {
      expect(refusal).not.toMatch(/\/quote|\$id/)
    }
  })

  it('draws the boat of the quote in hand and of no other, and moves with the cursor', async () => {
    const person = userEvent.setup()
    /* the heroes ledger holds the Highfield Sport 560 and not the Stacer
       529 Assault Pro. The Stacer is a draft, so its row is the register's
       first and the cursor stands on it at rest; until 2026-09-29 the room
       passed over it to the newest quote whose boat was photographed, and
       went on showing that one while the panel read another (the second
       components critique, finding 10) */
    const stacer = fileIt(doc())
    const held = fileIt(
      doc({
        state: 'issued',
        rootTableId: 'boat_highfield',
        rootRowId: 'boat_highfield:483',
        subjectLabel: 'Highfield - SP560 (PVC) W-W-WB',
      }),
    )
    draw()
    expect(room()).toHaveAccessibleName(
      new RegExp(`^Stacer 529 Assault Pro: R\\. Kelleher · ${stacer.reference}$`),
    )
    expect(screen.queryByRole('button', { name: /on the water/ })).toBeNull()

    /* the Highfield pressed: the panel reads it, and the room is its boat */
    await person.click(within(grid()).getByRole('row', { name: new RegExp(held.reference) }))
    expect(within(panel()).getByText(held.reference)).toBeInTheDocument()
    expect(room()).toHaveAccessibleName(
      new RegExp(`Sport 560 on the water: R\\. Kelleher · ${held.reference}$`),
    )
    expect(room().querySelectorAll('img')).toHaveLength(1)

    /* an arrow back to the Stacer: the panel follows it, and so does the picture */
    await person.keyboard('{ArrowUp}')
    expect(within(panel()).getByText(stacer.reference)).toBeInTheDocument()
    expect(room()).toHaveAccessibleName(new RegExp(` · ${stacer.reference}$`))
    expect(document.querySelectorAll('main img')).toHaveLength(0)
  })

  /* the refine round's second pass, 2026-10-21: the number stood on the row, under the picture
     and on the peek's head, three times in one window */
  it('names whose quote the picture is to a reader, and prints none of what its row says', async () => {
    const person = userEvent.setup()
    const held = fileIt(
      doc({
        state: 'issued',
        rootTableId: 'boat_highfield',
        rootRowId: 'boat_highfield:483',
        subjectLabel: 'Highfield - SP560 (PVC) W-W-WB',
        lines: [line('Highfield Sport 560', 66_584)],
      }),
    )
    draw()
    const shown = screen.getByRole('button', {
      name: new RegExp(`on the water: R\\. Kelleher · ${held.reference}$`),
    })
    expect(shown).not.toHaveTextContent(held.reference)
    expect(shown).not.toHaveTextContent('R. Kelleher')
    expect(shown).not.toHaveTextContent(/the hull on/)
    expect(shown).not.toHaveTextContent(money(quoteTotals(held).total))
    expect(shown).not.toHaveTextContent(/Issued|Given/i)
    await person.click(shown)
    expect(within(panel()).getByText(held.reference)).toBeInTheDocument()
  })

  it('draws no photograph when the boat in hand is not photographed, and says so on its cover', async () => {
    const person = userEvent.setup()
    const newest = fileIt(doc())
    draw()
    expect(screen.queryByRole('button', { name: /on the water/ })).toBeNull()
    expect(document.querySelectorAll('main img')).toHaveLength(0)
    /* THE ROOM IS NEVER AN EMPTY FRAME WITH A QUOTE FILED (the M2-close
       critique's finding 6): no price file is open here, so neither the
       row's copy nor the maker's mark can be read, and the cover is the
       name set in type — which says that nothing stands in for a picture */
    const cover = screen.getByRole('button', {
      name: new RegExp(`^Stacer 529 Assault Pro: R\\. Kelleher · ${newest.reference}$`),
    })
    expect(cover).toHaveTextContent(NO_PHOTOGRAPH)
    /* and no heading over the stand-in names the boat a second time: the row names it */
    expect(cover).not.toHaveTextContent('Stacer 529 Assault Pro')
    await person.click(cover)
    expect(within(panel()).getByText(newest.reference)).toBeInTheDocument()
  })

  /* the refine round, 2026-10-21: the panel at rest explained the app ("The act at the foot of
     this panel opens the quote…") and defined the three bands beside the heads that name them */
  it('says at rest what the panel is for, in one line, and defines nothing the heads say', () => {
    fileIt(doc())
    draw()
    expect(
      within(panel()).getByRole('heading', { name: 'Press a quote to see it' }),
    ).toBeInTheDocument()
    expect(panel().textContent).not.toMatch(/Draft|Given|Replaced|Issued|read-only/)
  })
})

/* ============================================================
   THE PANEL IN THE DEALER'S WORDS (m2-last-critique.md, major 5):
   "1 quote, in three bands", "each figure is the sum of that
   document's own frozen lines", "RUNG cash", "the same frozen lines",
   and "53 tables · 15,691 rows" on the head. Read whole at rest, on a
   draft's peek and on an issued quote's, against the one list of words
   a dealer never reads.
   ============================================================ */
describe('the register speaks the dealer’s words, not the engine’s', () => {
  it('when nothing is filed', () => {
    draw()
    expect(engineWordsIn(panel().textContent ?? '')).toEqual([])
  })

  it('at rest over what is filed, and on each quote read in the panel', async () => {
    const person = userEvent.setup()
    fileIt(doc({ state: 'issued', issuedAt: NOW.toISOString(), reference: 'GIVEN-01' }))
    fileIt(doc({ subjectLabel: 'Stacer 449 Assault', reference: 'DRAFT-01' }))
    const { container } = draw()
    const head = container.querySelector('header')?.textContent ?? ''
    expect(engineWordsIn(head)).toEqual([])
    expect(engineWordsIn(panel().textContent ?? '')).toEqual([])
    expect(panel()).toHaveTextContent('Press a quote to see it')

    for (const reference of ['GIVEN-01', 'DRAFT-01']) {
      await person.click(within(grid()).getByRole('row', { name: new RegExp(reference) }))
      expect(engineWordsIn(panel().textContent ?? ''), reference).toEqual([])
    }
  })
})
