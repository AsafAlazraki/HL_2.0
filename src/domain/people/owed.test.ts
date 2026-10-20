import { describe, expect, it } from 'vitest'
import type { QuoteDef } from '@/domain/model'
import { indexQuotes } from '@/domain/quote/diary/history'
import { boatOfQuote } from '@/domain/quote/spoken'
import { dayWritten } from '@/domain/quote/diary/days'
import type { BookRow } from './book'
import { NO_QUOTE_YET, OWED_FOR_DAYS, dayBefore, givenSaid, owedACall } from './owed'

/* ============================================================
   WHO IS OWED A CALL, PINNED: a standing and a day off a document,
   and nothing a document does not carry.
   ============================================================ */

const TODAY = '2026-10-20'

function quote(id: string, over: Partial<QuoteDef> = {}): QuoteDef {
  return {
    id,
    orgId: 'northside',
    reference: `R-${id}`,
    state: 'draft',
    viewId: 'v',
    rootTableId: 'boat_highfield',
    rootRowId: 'r',
    subjectLabel: 'Highfield - ADV7 (HYP) B-G-B',
    subjectSpecs: [],
    sections: [],
    chapters: [],
    lines: [],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: '' },
    createdAt: '2026-10-16T00:00:00.000Z',
    updatedAt: '2026-10-16T00:00:00.000Z',
    ...over,
  }
}

function row(over: Partial<BookRow> & { name: string }): BookRow {
  return {
    rowId: over.name,
    kept: true,
    contact: '',
    quotes: 0,
    byName: 0,
    latest: null,
    touched: '2026-10-19T00:00:00.000Z',
    ...over,
  }
}

describe('owedACall', () => {
  it('rings the person given a quote, with the boat and the day it was given', () => {
    const q = quote('a', { state: 'issued', issuedAt: '2026-10-16T01:00:00.000Z' })
    const index = indexQuotes([q])
    const owed = owedACall(
      [
        row({
          name: 'R. Kelleher',
          quotes: 1,
          latest: {
            id: 'a',
            reference: 'R-a',
            standing: 'given',
            day: '2026-10-16',
            byName: false,
          },
        }),
      ],
      index,
      TODAY,
    )
    expect(owed).toHaveLength(1)
    const boat = boatOfQuote(q).name
    expect(owed[0]).toMatchObject({ why: 'given', quoteId: 'a', boat })
    expect(owed[0]?.said).toBe(`Given the ${boat} on ${dayWritten('2026-10-16', TODAY)}.`)
    expect(owed[0]?.said).not.toMatch(/ago/)
  })

  it('says a quote given this morning as today', () => {
    expect(givenSaid('Highfield ADV7', TODAY, TODAY)).toBe('Given the Highfield ADV7 today.')
  })

  it('rings a person filed with no quote, after everybody waiting on one', () => {
    const q = quote('a', { state: 'issued', issuedAt: '2026-10-16T01:00:00.000Z' })
    const owed = owedACall(
      [
        row({ name: 'J. Harrow' }),
        row({
          name: 'R. Kelleher',
          latest: {
            id: 'a',
            reference: 'R-a',
            standing: 'given',
            day: '2026-10-16',
            byName: false,
          },
        }),
      ],
      indexQuotes([q]),
      TODAY,
    )
    expect(owed.map((o) => o.name)).toEqual(['R. Kelleher', 'J. Harrow'])
    expect(owed[1]).toMatchObject({ why: 'unquoted', said: NO_QUOTE_YET, quoteId: null })
  })

  it('rings the one who has waited longest first', () => {
    const owed = owedACall(
      [
        row({
          name: 'B',
          latest: {
            id: 'b',
            reference: 'R-b',
            standing: 'given',
            day: '2026-10-19',
            byName: false,
          },
        }),
        row({
          name: 'A',
          latest: {
            id: 'a',
            reference: 'R-a',
            standing: 'given',
            day: '2026-10-14',
            byName: false,
          },
        }),
      ],
      indexQuotes([quote('a'), quote('b')]),
      TODAY,
    )
    expect(owed.map((o) => o.name)).toEqual(['A', 'B'])
  })

  it('leaves out a person whose newest quote is a draft or was replaced, and a row with no name', () => {
    const owed = owedACall(
      [
        row({
          name: 'On a draft',
          latest: {
            id: 'a',
            reference: 'R-a',
            standing: 'draft',
            day: '2026-10-20',
            byName: false,
          },
        }),
        row({
          name: 'Replaced',
          latest: {
            id: 'b',
            reference: 'R-b',
            standing: 'replaced',
            day: '2026-10-15',
            byName: false,
          },
        }),
        row({ name: '   ' }),
        /* a name typed on a quote with nothing given is not a person in the book */
        row({ name: 'Typed only', kept: false }),
      ],
      indexQuotes([quote('a'), quote('b')]),
      TODAY,
    )
    expect(owed).toEqual([])
  })

  /* THE CRITIQUE OF THE BUILT HOME, MAJOR 9: the list must be able to empty, and a person
     given a quote a minute ago, still at the desk, is not owed a call */
  it('keeps to the seven days before today, and leaves out a quote given today', () => {
    const given = (name: string, day: string): BookRow =>
      row({
        name,
        latest: { id: name, reference: `R-${name}`, standing: 'given', day, byName: false },
      })
    const owed = owedACall(
      [
        given('This morning', TODAY),
        given('A week ago', dayBefore(TODAY, OWED_FOR_DAYS)),
        given('Eight days ago', dayBefore(TODAY, OWED_FOR_DAYS + 1)),
        given('Yesterday', dayBefore(TODAY, 1)),
        row({ name: 'Kept today', touched: '2026-10-20T03:00:00.000Z' }),
        row({ name: 'Kept last month', touched: '2026-09-20T03:00:00.000Z' }),
      ],
      indexQuotes([
        quote('This morning'),
        quote('A week ago'),
        quote('Eight days ago'),
        quote('Yesterday'),
      ]),
      TODAY,
    )
    expect(owed.map((o) => o.name)).toEqual(['A week ago', 'Yesterday', 'Kept today'])
  })

  it('carries the number to ring, read as a phone by its look', () => {
    const owed = owedACall(
      [
        row({ name: 'J. Harrow', contact: '0412 345 678' }),
        row({ name: 'M. Duffy', contact: 'm@duffy.test' }),
      ],
      indexQuotes([]),
      TODAY,
    )
    expect(owed.find((o) => o.name === 'J. Harrow')).toMatchObject({
      contact: '0412 345 678',
      phone: '0412 345 678',
    })
    expect(owed.find((o) => o.name === 'M. Duffy')).toMatchObject({
      contact: 'm@duffy.test',
      phone: '',
    })
  })

  it('counts days back across a month', () => {
    expect(dayBefore('2026-10-03', 7)).toBe('2026-09-26')
    expect(dayBefore('2026-03-01', 1)).toBe('2026-02-28')
  })
})
