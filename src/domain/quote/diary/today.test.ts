import { describe, expect, it } from 'vitest'
import type { QuoteDef, QuoteEvent, QuoteLine } from '@/domain/model'
import { apply, issue, setCustomer } from '@/domain/quote/commands'
import { localDayOf } from '@/domain/quote/day'
import { dayWritten, localTimeOf } from './days'
import { givenOn, todayOf } from './today'

/* ============================================================
   TODAY'S LINE, PINNED. Every instant is built from LOCAL fields, so
   the case is right in Brisbane and in London, and every event is
   written by the real command it names.
   ============================================================ */

const at = (y: number, m: number, d: number, h = 12, min = 0): string =>
  new Date(y, m - 1, d, h, min).toISOString()

const TODAY = localDayOf(new Date(2026, 9, 20, 12))

let n = 0
function line(label: string): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'tbl',
    rowId: `row_${n}`,
    label,
    qty: 1,
    unitPrice: 20_000,
    priceFieldId: 'f_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [],
  }
}

function minted(id: string, createdAt: string): QuoteDef {
  const hull = line('A hull')
  const birth: QuoteEvent = {
    id: `e-${id}`,
    kind: 'minted',
    at: createdAt,
    said: `A hull — quote ${id}`,
    changed: [],
  }
  return {
    id,
    orgId: 'northside',
    reference: id,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'tbl',
    rootRowId: `subject_${id}`,
    subjectLabel: 'A hull',
    subjectSpecs: [],
    sections: [{ blockId: 'b1', tableId: 'tbl', title: 'Hull', lineIds: [hull.id] }],
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

function given(quote: QuoteDef, stamp: string): QuoteDef {
  const named = apply(quote, setCustomer({ name: 'R. Kelleher' }), stamp)
  if (!('next' in named)) throw new Error(named.refused)
  const out = apply(named.next, issue(), stamp)
  if (!('next' in out)) throw new Error(out.refused)
  return out.next
}

describe('todayOf', () => {
  it('asks nothing of a browser that has kept no quote', () => {
    expect(todayOf([], TODAY)).toBeNull()
  })

  it('counts the quotes started today and says when the last thing was kept', () => {
    const first = minted('a', at(2026, 10, 20, 8, 52))
    const second = minted('b', at(2026, 10, 20, 9, 48))
    const said = todayOf([first, second], TODAY)!
    expect(said.started).toBe(2)
    expect(said.given).toBe(0)
    expect(said.lastAt).toBe(localTimeOf(at(2026, 10, 20, 9, 48)))
    expect(said.said).toBe('Today: 2 quotes started.')
  })

  it('counts a quote given today beside the ones started, in the singular where it is one', () => {
    const old = given(minted('a', at(2026, 10, 16, 9)), at(2026, 10, 20, 10, 5))
    const fresh = minted('b', at(2026, 10, 20, 11, 30))
    const said = todayOf([old, fresh], TODAY)!
    expect(said.started).toBe(1)
    expect(said.given).toBe(1)
    expect(said.said).toBe('Today: 1 quote started and 1 given.')
  })

  it('says a day with nothing kept as that, and names the last day something was', () => {
    const friday = minted('a', at(2026, 10, 16, 9))
    const said = todayOf([friday], TODAY)!
    expect(said.touched).toBe(0)
    expect(said.said).toBe(
      `Nothing has moved today. The last thing kept was on ${dayWritten(said.lastDay, TODAY)}.`,
    )
    /* a day, never a count of days a reader could count differently */
    expect(said.said).not.toMatch(/\d+ days? ago/)
  })

  it('never says a rate, a target or a trend', () => {
    const said = todayOf([minted('a', at(2026, 10, 20, 9))], TODAY)!
    expect(said.said).not.toMatch(/%|target|rate|trend|up|down/i)
  })
})

describe('givenOn', () => {
  it('reads the quotes given on a day, newest given first, and no draft', () => {
    const early = given(minted('a', at(2026, 10, 19, 9)), at(2026, 10, 20, 8, 15))
    const late = given(minted('b', at(2026, 10, 20, 9)), at(2026, 10, 20, 11, 40))
    const friday = given(minted('c', at(2026, 10, 16, 9)), at(2026, 10, 16, 10))
    const draft = minted('d', at(2026, 10, 20, 12))
    expect(givenOn([early, friday, draft, late], TODAY).map((q) => q.id)).toEqual(['b', 'a'])
    expect(givenOn([draft], TODAY)).toEqual([])
  })
})
