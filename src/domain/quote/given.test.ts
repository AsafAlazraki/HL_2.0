/* ============================================================
   WHAT WAS GIVEN, PINNED — and pinned as the ONE count two screens read.

   The case first is the critic's own (components-critique-2.md #9): a
   quote given to a customer, then a new version made of it. Customers
   read "GIVEN 0 · $0" for that person and History "1 given · $55,223".
   Every document below is built by the real commands — `issue`,
   `newVersionOf` — so the standing the index reads off it is the one
   the app would read, and no figure is typed twice: each sum is
   `quoteTotals` of the document it sums.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import type { QuoteDef, QuoteEvent, QuoteLine } from '@/domain/model'
import { apply, issue, newVersionOf, setCustomer } from '@/domain/quote/commands'
import { quoteTotals } from '@/domain/quote/totals'
import { indexQuotes, standingOf } from '@/domain/quote/diary/history'
import { diarySince, indexDays } from '@/domain/quote/diary/days'
import { QUOTED, readEveryone, readPage } from '@/domain/people/book'
import { givenTally, wasGiven } from './given'

/* ---------------------------------------------------------- */
/* fixtures                                                   */
/* ---------------------------------------------------------- */

const at = (d: number, h = 12): string => new Date(2026, 8, d, h).toISOString()

let n = 0
function line(unitPrice: number | null): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'tbl',
    rowId: `row_${n}`,
    label: 'A hull',
    qty: 1,
    unitPrice,
    priceFieldId: 'f_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [],
  }
}

function minted(reference: string, createdAt: string, unitPrice: number | null = 55_000): QuoteDef {
  n += 1
  const hull = line(unitPrice)
  const birth: QuoteEvent = {
    id: `e${n}`,
    kind: 'minted',
    at: createdAt,
    said: `A hull — quote ${reference}`,
    changed: [],
  }
  return {
    id: `q${n}`,
    orgId: 'northside',
    reference,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'tbl',
    rootRowId: `subject_${n}`,
    subjectLabel: 'A hull',
    subjectSpecs: [],
    sections: [{ blockId: 'b1', tableId: 'tbl', title: 'Boats', lineIds: [hull.id] }],
    chapters: [],
    lines: [hull],
    adjustments: [],
    events: [birth],
    levelKey: 'cash',
    customer: { name: '' },
    createdAt,
    updatedAt: createdAt,
  }
}

/** Run a real command and keep the document it left. */
function did(quote: QuoteDef, command: Parameters<typeof apply>[1], stamp: string): QuoteDef {
  const outcome = apply(quote, command, stamp)
  if (!('next' in outcome)) throw new Error(`refused: ${outcome.refused}`)
  return outcome.next
}

/** Address it and give it to the customer, as the build does. */
function givenTo(quote: QuoteDef, name: string, stamp: string): QuoteDef {
  return did(did(quote, setCustomer({ name }), stamp), issue(), stamp)
}

/** A new version of a given quote, carrying its own first event as the store keeps it. */
function versionOf(from: QuoteDef, reference: string, stamp: string): QuoteDef {
  const made = newVersionOf(from, reference, stamp)
  return { ...made.quote, events: [made.event] }
}

/* ---------------------------------------------------------- */

describe('a quote given and then versioned was still given', () => {
  const first = givenTo(minted('20260929-01', at(29, 9)), 'Jordan Test', at(29, 10))
  const second = versionOf(first, '20260929-02', at(29, 11))
  const quotes = [first, second]
  const index = indexQuotes(quotes)
  const once = { given: 1, givenTotal: quoteTotals(first).total, givenSummed: 1 }

  it('counts the replaced document the customer holds, and not the draft that replaced it', () => {
    /* the standing the old count asked, which is why it read nought */
    expect(standingOf(index, first.id)).toBe('replaced')
    expect(standingOf(index, second.id)).toBe('draft')
    expect(wasGiven(first)).toBe(true)
    expect(wasGiven(second)).toBe(false)
    expect(givenTally(quotes)).toEqual(once)
    expect(once.givenTotal).toBeGreaterThan(0)
  })

  it('is what History counts, on the day it was given and at the foot of the diary', () => {
    const since = diarySince(quotes)!
    expect({
      given: since.given,
      givenTotal: since.givenTotal,
      givenSummed: since.givenSummed,
    }).toEqual(once)
    const [today] = indexDays(quotes)
    expect(today.tally).toMatchObject(once)
  })

  it('is what that person’s page counts, over the quotes the page lists', () => {
    const everyone = readEveryone(undefined, [], quotes, index)
    const page = readPage(`${QUOTED}${first.id}`, undefined, [], quotes, index, everyone, 'f-n')!
    expect(page.name).toBe('Jordan Test')
    expect(page.quotes.map((q) => q.id).sort()).toEqual([first.id, second.id].sort())
    expect(givenTally(page.quotes)).toEqual(once)
  })

  it('counts both sheets once the new version is given too, each at what it printed', () => {
    const secondGiven = did(second, issue(), at(29, 12))
    expect(givenTally([first, secondGiven])).toEqual({
      given: 2,
      givenTotal: quoteTotals(first).total + quoteTotals(secondGiven).total,
      givenSummed: 2,
    })
  })
})

describe('what is not given, and what is counted but not summed', () => {
  it('counts no draft, and nothing for an empty list', () => {
    expect(givenTally([minted('D', at(1))])).toEqual({ given: 0, givenTotal: 0, givenSummed: 0 })
    expect(givenTally([])).toEqual({ given: 0, givenTotal: 0, givenSummed: 0 })
  })

  it('counts a given document with nothing priced on it as given and not as summed', () => {
    /* the issue gate refuses this on the engine; a hand-edited file can still carry it */
    const bare: QuoteDef = {
      ...minted('E', at(1)),
      state: 'issued',
      issuedAt: at(1, 13),
      lines: [],
      sections: [],
    }
    expect(givenTally([bare])).toEqual({ given: 1, givenTotal: 0, givenSummed: 0 })
  })

  it('counts one document once, however many times a list carries it', () => {
    const given = givenTo(minted('F', at(2)), 'R. Kelleher', at(2, 13))
    expect(givenTally([given, given])).toEqual({
      given: 1,
      givenTotal: quoteTotals(given).total,
      givenSummed: 1,
    })
  })

  it('counts a document given with no diary kept at the foot of the diary, as a page does', () => {
    const given = givenTo(minted('G', at(3)), 'R. Kelleher', at(3, 13))
    const noDiary: QuoteDef = { ...given, events: [] }
    const since = diarySince([noDiary])!
    expect(since.given).toBe(givenTally([noDiary]).given)
    expect(since.givenTotal).toBe(quoteTotals(noDiary).total)
  })
})
