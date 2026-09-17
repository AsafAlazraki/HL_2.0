import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { QuoteDef, QuoteLine } from '@/domain/model'
import { money } from '@/domain/money'
import { NOTHING_FOUND } from '@/domain/quote/find'
import { quoteTotals } from '@/domain/quote/totals'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { quotes } from '@/state/quotes'
import {
  ISSUED_IS_NOT_DISCARDED,
  NO_DOCUMENT,
  NO_PICKER_HERE,
  ONLY_ISSUED_IS_VERSIONED,
  Quotes,
} from './Quotes'

/* ============================================================
   THE REGISTER, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   Every document below is built in this file. Nothing is seeded into
   the app and nothing is invented for a person to look at: these are
   the shapes `mintQuote` and `newVersionOf` produce, written down so
   the screen can be driven without a picker, which is the screen this
   milestone has not built yet.

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

beforeEach(async () => {
  n = 0
  await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
})

const draw = () => render(<Quotes business="Northside Marine" now={clock} />)

const grid = () => screen.getByRole('grid', { name: 'Quotes' })
const rows = () => within(grid()).getAllByRole('row')
const panel = () => screen.getByRole('complementary', { name: 'The quote under the cursor' })

/* ---------------------------------------------------------- */

describe('the empty state, which is what the owner sees first', () => {
  it('teaches rather than apologises, and prints three honest zeros', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quotes')
    expect(
      screen.getByText((_, el) => el?.textContent === '0 quotes are filed in this browser'),
    ).toBeInTheDocument()

    /* the three bands, each standing at nothing, each saying what it
       is — the structure IS the teaching */
    for (const word of ['Draft', 'Issued', 'Superseded']) {
      expect(within(grid()).getByText(word)).toBeInTheDocument()
    }
    expect(within(grid()).getByText('Nothing is being written right now.')).toBeInTheDocument()
    expect(
      within(grid()).getByText('Nothing has been given to a customer yet.'),
    ).toBeInTheDocument()
    expect(
      within(grid()).getByText('No quote has been replaced by a newer version.'),
    ).toBeInTheDocument()

    expect(
      within(panel()).getByRole('heading', { name: 'No quote has been written here yet.' }),
    ).toBeInTheDocument()
    expect(within(panel()).getByText('What lands here')).toBeInTheDocument()
    expect(within(panel()).getByText('Why it is empty today')).toBeInTheDocument()
    expect(within(panel()).getByText('What to do')).toBeInTheDocument()
  })

  it('invents no photograph to fill the hole, and says so', () => {
    draw()
    expect(within(panel()).getByText(/No photograph stands on this screen/)).toBeInTheDocument()
    expect(document.querySelectorAll('img')).toHaveLength(0)
  })

  it('keeps the act reachable and gives it its reason, rather than dimming it silently', () => {
    draw()
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(act).toHaveAttribute('aria-describedby')
    expect(screen.getAllByText(NO_PICKER_HERE).length).toBeGreaterThan(0)
  })

  it('draws no find field over a list that hides nothing', () => {
    draw()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })

  it('says, beside the count, that every quote filed is on this screen', () => {
    fileIt(doc())
    fileIt(doc())
    draw()
    expect(
      screen.getByText(
        (_, el) =>
          el?.textContent ===
          '2 quotes are filed in this browser, and all of them are on this screen',
      ),
    ).toBeInTheDocument()
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

  it('says nobody is named rather than printing a blank where a customer goes', () => {
    fileIt(doc({ customer: { name: '' } }))
    draw()
    expect(within(grid()).getByText('Addressed to nobody yet')).toBeInTheDocument()
  })

  it('puts a sentence where the figure would stand when no figure was decided', () => {
    fileIt(doc({ lines: [line('Signature Fisher 525F', null)], sections: [] }))
    draw()
    expect(within(grid()).getByText('Not priced yet')).toBeInTheDocument()
  })

  it('shows an issued quote as something other than a draft, without a coloured pill', () => {
    fileIt(doc({ state: 'issued', issuedAt: NOW.toISOString() }))
    draw()
    expect(within(grid()).getByRole('gridcell', { name: 'Issued' })).toBeInTheDocument()
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
    expect(
      within(within(grid()).getByRole('rowgroup', { name: 'Issued' })).getAllByText(
        money(quoteTotals(c).total),
      ),
    ).toHaveLength(2)
  })

  it('moves an issued quote into Superseded the moment a version names it', async () => {
    const first = fileIt(doc({ state: 'issued', reference: 'FIRST-01' }))
    fileIt(doc({ reference: 'SECOND-01', supersedesId: first.id }))
    draw()
    expect(within(grid()).getByRole('gridcell', { name: 'Superseded' })).toBeInTheDocument()
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
    expect(field).toHaveAttribute('placeholder', 'Reference, customer, boat, or who prepared it')
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
  it('moves the cursor with the arrows and with J and K', async () => {
    const person = userEvent.setup()
    fileIt(doc({ reference: 'ONE-01' }))
    fileIt(doc({ reference: 'TWO-01' }))
    draw()

    grid().focus()
    await person.keyboard('{ArrowDown}')
    expect(grid()).toHaveAttribute('aria-activedescendant', 'qr-row-TWO-01')
    await person.keyboard('k')
    expect(grid()).toHaveAttribute('aria-activedescendant', 'qr-row-ONE-01')
    await person.keyboard('j')
    expect(grid()).toHaveAttribute('aria-activedescendant', 'qr-row-TWO-01')
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

  it('prints the shortcut where the act is', async () => {
    const person = userEvent.setup()
    fileIt(doc({ state: 'issued' }))
    draw()

    /* the four that move and read, on the register's own line, because
       their act has no control of its own to sit beside */
    const keys = screen.getByText(/move/)
    for (const key of ['J', 'K', 'Space', 'Enter', 'Esc']) {
      expect(within(keys).getByText(key)).toBeInTheDocument()
    }

    /* and the three that DO have a control, each printed on it */
    const act = screen.getByRole('button', { name: 'New quote' }).closest('.qr-act')!
    expect(within(act as HTMLElement).getByText('N')).toBeInTheDocument()

    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    const open = panel()
    const version = within(open).getByRole('button', { name: 'Make a new version' })
    expect(within(version.parentElement!.parentElement!).getByText('V')).toBeInTheDocument()
    expect(within(open).getByText('Esc')).toBeInTheDocument()
  })
})

/* ---------------------------------------------------------- */

describe('reading one without leaving the list', () => {
  it('shows the frozen figures, the rung and who prepared it', async () => {
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
    expect(within(open).getByText('cash')).toBeInTheDocument()
    expect(within(open).getAllByText(money(quoteTotals(quote).total)).length).toBeGreaterThan(0)
    expect(within(open).getByText(/no rate has been typed on this quote/)).toBeInTheDocument()
  })

  it('says why a draft cannot go to a customer yet, in the engine’s own words', async () => {
    const person = userEvent.setup()
    fileIt(doc({ customer: { name: '' } }))
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    expect(within(panel()).getByText(/This quote is addressed to nobody\./)).toBeInTheDocument()
  })

  it('refuses to open the document, and says where that screen is', async () => {
    const person = userEvent.setup()
    fileIt(doc())
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    const open = within(panel()).getByRole('button', { name: 'Open it' })
    expect(open).toHaveAttribute('aria-disabled', 'true')
    expect(within(panel()).getByText(NO_DOCUMENT)).toBeInTheDocument()
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
    expect(within(grid()).getByRole('gridcell', { name: 'Superseded' })).toBeInTheDocument()
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

  it('refuses on a draft with the reason, because a draft can simply be changed', async () => {
    const person = userEvent.setup()
    fileIt(doc())
    draw()
    await person.click(within(grid()).getByRole('row', { name: /Stacer 529 Assault Pro/ }))
    const act = within(panel()).getByRole('button', { name: 'Make a new version' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(within(panel()).getByText(ONLY_ISSUED_IS_VERSIONED)).toBeInTheDocument()
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
    const act = within(panel()).getByRole('button', { name: 'Discard this draft' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(within(panel()).getByText(ISSUED_IS_NOT_DISCARDED)).toBeInTheDocument()
  })
})
