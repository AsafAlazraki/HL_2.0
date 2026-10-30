/* ============================================================
   A QUOTE KEEPS THE LETTERHEAD IT WAS GIVEN WITH (Milestone 4).

   The give copies Northside's letterhead and the person who prepared it
   onto the quote, by value, and the printed quote reads that copy and
   nothing else. So the ABN corrected on /manage tomorrow never changes
   the quote handed over today, and a person's phone number changed
   afterwards never reaches it either. `golden.test.ts` is untouched: a
   give with no stamp is the give it always was.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { OrgProfile, QuoteDef, QuoteLine } from '@/domain/model'
import { apply, isDone, issue } from '@/domain/quote/commands'
import { readDocument } from '@/domain/quote/document'
import { letterheadOf, preparerOf } from './letterhead'
import { DESIGNED_ACCENT } from './colour'

const NOW = '2026-10-29T02:00:00.000Z'

function line(id: string, label: string, unitPrice: number): QuoteLine {
  return {
    id,
    entityId: 'tbl_boats',
    rowId: `row_${id}`,
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

function draft(): QuoteDef {
  const hull = line('l1', 'Highfield SP 560', 62000)
  return {
    id: 'q1',
    orgId: 'northside',
    reference: 'Q-1',
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'tbl_boats',
    rootRowId: 'row_1',
    subjectLabel: 'Highfield SP 560',
    subjectSpecs: [],
    sections: [{ blockId: '__subject', tableId: 'tbl_boats', title: 'Boats', lineIds: [hull.id] }],
    chapters: [{ id: '__subject', title: 'Boats', tableId: 'tbl_boats' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: 'R. Kelleher' },
    preparedBy: 'Mia Tran',
    organisation: 'Northside Marine',
    createdAt: NOW,
    updatedAt: NOW,
  }
}

const org = (abn: string, phone: string): OrgProfile => ({
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: '',
  abn,
  phone: '07 3000 0000',
  validDays: 30,
  deposit: 'A deposit of 10% holds the boat.',
  people: [{ id: 'm', name: 'Mia Tran', title: 'Sales', phone }],
})

const mark = { src: '/brand-marks/northside-marine.png', width: 1798, height: 448 }

function give(profile: OrgProfile): QuoteDef {
  const quote = draft()
  const done = apply(
    quote,
    issue({
      letterhead: letterheadOf(profile, 'Northside Marine', mark),
      preparer: preparerOf(profile.people, quote.preparedBy),
    }),
    NOW,
  )
  if (!isDone(done)) throw new Error(done.refused)
  return done.next
}

describe('the give keeps the letterhead and the person by value', () => {
  it('prints the ABN, the phone, the mark in dark ink, the date it stands until and who prepared it', () => {
    const printed = readDocument(give(org('51 824 753 556', '0400 111 222')))
    expect(printed.letterhead).toEqual({
      name: 'Northside Marine',
      abn: '51 824 753 556',
      phone: '07 3000 0000',
      deposit: 'A deposit of 10% holds the boat.',
      mark,
      validDays: 30,
      validUntil: '2026-11-28',
      /* no colour was kept, so the paper was given in the designed blue */
      accent: DESIGNED_ACCENT,
    })
    expect(printed.preparer).toEqual({ name: 'Mia Tran', title: 'Sales', phone: '0400 111 222' })
  })

  it('leaves a given quote’s text unchanged when the ABN and the phone change afterwards', () => {
    const profile = org('51 824 753 556', '0400 111 222')
    const given = give(profile)
    const before = JSON.stringify(readDocument(given))
    /* /manage is edited again: a new ABN, a new number for the person */
    profile.abn = '53 004 085 616'
    profile.people = [{ id: 'm', name: 'Mia Tran', title: 'Sales', phone: '0499 999 999' }]
    expect(JSON.stringify(readDocument(given))).toBe(before)
    expect(readDocument(given).letterhead?.abn).toBe('51 824 753 556')
  })

  it('a give with no stamp is the give it always was', () => {
    const done = apply(draft(), issue(), NOW)
    if (!isDone(done)) throw new Error(done.refused)
    expect(done.next.letterhead).toBeUndefined()
    expect(done.next.preparer).toBeUndefined()
    expect(readDocument(done.next).letterhead).toBeNull()
  })
})
