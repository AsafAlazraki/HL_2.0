/* ============================================================
   THE DAY INDEX, PINNED.

   What these pin, in the order it would cost most to get wrong:

   1. ONE HEAD, ONE CALENDAR. A quote started on Monday and issued on
      Friday is under BOTH days, and Friday's line carries only what
      happened on Friday. That is the case the critic found `groupByDay`
      getting wrong (`critique-m2.md` §5) and the one the GitHub frame
      shows failing (`live/github-pr-20463-commits.png`).

   2. THE DAY IS THE READER'S OWN. Every instant below is built from
      LOCAL fields and read back through `localDay`, so the test is
      right in Brisbane and in London — and an instant two hours after
      local midnight is on the local day, whatever UTC day it is.

   3. THE TALLY IS A COUNT OR A SUM OF FROZEN NUMBERS. `given` is an
      `issued` event ON THAT DAY, never the document's state, and
      `givenTotal` is `quoteTotals` over those documents and nothing
      else.

   4. NOTHING IS HIDDEN WITHOUT A COUNT. A document with no diary at
      all is placed under the day it was made, with nothing on it.

   THE FIXTURES ARE SHAPES. Round numbers, plain labels, and every
   event's `said` is built by the real command it names — so a screen
   asserting that it prints the command's own sentence is asserting
   against the sentence `commands.ts` actually says.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import type { QuoteDef, QuoteEvent, QuoteLine } from '@/domain/model'
import { localDay, localDayOf } from '@/domain/quote/day'
import { addLine, apply, issue, removeLine, setCustomer } from '@/domain/quote/commands'
import { quoteTotals } from '@/domain/quote/totals'
import { NO_DIARY, daysFrom, daysOf, indexDays, kindsSay, localTimeOf, tallyOf } from './days'

/* ---------------------------------------------------------- */
/* fixtures                                                   */
/* ---------------------------------------------------------- */

/** A UTC instant that falls on the given LOCAL day and hour. */
const at = (y: number, m: number, d: number, h = 12, min = 0): string =>
  new Date(y, m - 1, d, h, min).toISOString()

const day = (y: number, m: number, d: number): string =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

let n = 0
function line(label: string, unitPrice: number | null): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'tbl',
    rowId: `row_${n}`,
    label,
    qty: 1,
    unitPrice,
    priceFieldId: 'f_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [],
  }
}

function minted(id: string, reference: string, createdAt: string, subject = 'A hull'): QuoteDef {
  n += 1
  const hull = line(subject, 20_000)
  const quote: QuoteDef = {
    id,
    orgId: 'northside',
    reference,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'tbl',
    rootRowId: `subject_${id}`,
    subjectLabel: subject,
    subjectSpecs: [],
    sections: [{ blockId: 'b1', tableId: 'tbl', title: 'Motors', lineIds: [hull.id] }],
    chapters: [],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: '' },
    createdAt,
    updatedAt: createdAt,
  }
  /* the mint's own event, as `mintQuote` writes it and the store now
     keeps it on the document */
  const birth: QuoteEvent = {
    id: `e-${id}-born`,
    kind: 'minted',
    at: createdAt,
    said: `${subject} — quote ${reference}`,
    changed: [],
  }
  return { ...quote, events: [birth] }
}

/** Run a real command at an instant and keep what it did. */
function did(
  quote: QuoteDef,
  command: Parameters<typeof apply>[1],
  stamp: string,
): { next: QuoteDef; event: QuoteEvent } {
  const outcome = apply(quote, command, stamp)
  if (!('next' in outcome)) throw new Error(`refused: ${outcome.refused}`)
  return { next: outcome.next, event: outcome.event }
}

/* ---------------------------------------------------------- */

describe('one head, one calendar', () => {
  it('puts a quote started on Monday and issued on Friday under both days, each with its own events', () => {
    const monday = at(2026, 8, 17, 9)
    const friday = at(2026, 8, 21, 14)
    let q = minted('q1', '20260817-01', monday)
    q = did(q, addLine('b1', line('Yamaha F70', 12_000)), at(2026, 8, 17, 9, 5)).next
    q = did(q, setCustomer({ name: 'R Kelleher' }), at(2026, 8, 21, 13, 50)).next
    q = did(q, issue(), friday).next

    const days = indexDays([q])
    expect(days.map((d) => d.day)).toEqual([day(2026, 8, 21), day(2026, 8, 17)])

    const fri = days[0]
    expect(fri.entries).toHaveLength(1)
    expect(fri.entries[0].events.map((e) => e.kind)).toEqual(['customer-set', 'issued'])
    expect(fri.tally.given).toBe(1)

    const mon = days[1]
    expect(mon.entries[0].events.map((e) => e.kind)).toEqual(['minted', 'line-added'])
    /* the issue happened on Friday, so Monday's tally does not claim it */
    expect(mon.tally.given).toBe(0)
  })

  it('reads the day in the reader’s own zone, not off the ISO string', () => {
    /* two in the morning, local: for any reader east of UTC+2 this
       instant is still the PREVIOUS day in UTC */
    const early = new Date(2026, 7, 18, 2, 28)
    const q = minted('q1', '20260818-01', early.toISOString())
    const [only] = indexDays([q])
    expect(only.day).toBe(localDayOf(early))
    expect(only.day).toBe(day(2026, 8, 18))
    if (early.getTimezoneOffset() <= -150) {
      /* the string's own first ten characters name the wrong day here,
         and the index must not have read them */
      expect(early.toISOString().slice(0, 10)).not.toBe(only.day)
    }
  })

  it('cuts at the reader’s midnight: 23:59 and 00:01 are two days', () => {
    let q = minted('q1', '20260817-01', at(2026, 8, 17, 23, 59))
    q = did(q, addLine('b1', line('Bimini top', 900)), at(2026, 8, 18, 0, 1)).next
    const days = indexDays([q])
    expect(days.map((d) => d.day)).toEqual([day(2026, 8, 18), day(2026, 8, 17)])
    expect(days[0].entries[0].events.map((e) => e.kind)).toEqual(['line-added'])
    expect(days[1].entries[0].events.map((e) => e.kind)).toEqual(['minted'])
  })

  it('orders a day’s events oldest first, whatever order the document holds them in', () => {
    const q = minted('q1', '20260817-01', at(2026, 8, 17, 9))
    const later = did(q, addLine('b1', line('Bimini top', 900)), at(2026, 8, 17, 11)).event
    const earlier = did(q, addLine('b1', line('Anchor', 100)), at(2026, 8, 17, 10)).event
    const shuffled: QuoteDef = { ...q, events: [later, earlier, ...q.events] }
    const [only] = indexDays([shuffled])
    expect(only.entries[0].events.map((e) => e.at)).toEqual([
      q.createdAt,
      at(2026, 8, 17, 10),
      at(2026, 8, 17, 11),
    ])
  })
})

/* ---------------------------------------------------------- */

describe('a day’s entries', () => {
  it('holds one entry per quote touched, most recently touched first', () => {
    const a = minted('qa', 'A', at(2026, 9, 1, 9))
    const b = minted('qb', 'B', at(2026, 9, 1, 10))
    const aAgain = did(a, addLine('b1', line('Bimini top', 900)), at(2026, 9, 1, 15)).next
    const [only] = indexDays([aAgain, b])
    expect(only.entries.map((e) => e.quote.id)).toEqual(['qa', 'qb'])
    expect(only.tally.quotes).toBe(2)
    expect(only.tally.events).toBe(3)
  })

  it('places a document with no diary under the day it was made, with nothing on it, rather than hiding it', () => {
    const bare: QuoteDef = { ...minted('q1', 'X', at(2026, 9, 1, 9)), events: [] }
    const [only] = indexDays([bare])
    expect(only.day).toBe(day(2026, 9, 1))
    expect(only.entries[0].events).toEqual([])
    expect(only.entries[0].lastAt).toBe(bare.createdAt)
    expect(kindsSay(only.entries[0].events)).toBe(NO_DIARY)
  })

  it('names the days one quote was touched on, newest first', () => {
    let q = minted('q1', 'X', at(2026, 8, 17, 9))
    q = did(q, addLine('b1', line('Bimini top', 900)), at(2026, 8, 19, 9)).next
    q = did(q, setCustomer({ name: 'R Kelleher' }), at(2026, 8, 21, 8, 59)).next
    q = did(q, issue(), at(2026, 8, 21, 9)).next
    expect(daysOf(q)).toEqual([day(2026, 8, 21), day(2026, 8, 19), day(2026, 8, 17)])
    expect(daysOf({ ...q, events: [] })).toEqual([day(2026, 8, 17)])
  })

  it('cuts the days by when something happened, not by when the document was made', () => {
    let q = minted('q1', 'X', at(2026, 8, 1, 9))
    q = did(q, setCustomer({ name: 'R Kelleher' }), at(2026, 8, 21, 8, 59)).next
    q = did(q, issue(), at(2026, 8, 21, 9)).next
    const days = indexDays([q])
    const kept = daysFrom(days, day(2026, 8, 15))
    expect(kept.map((d) => d.day)).toEqual([day(2026, 8, 21)])
    expect(daysFrom(days, null)).toHaveLength(2)
  })
})

/* ---------------------------------------------------------- */

describe('the tally', () => {
  it('counts given by the issued event on that day and sums the issued documents’ own totals', () => {
    let a = minted('qa', 'A', at(2026, 9, 1, 9))
    a = did(a, setCustomer({ name: 'R Kelleher' }), at(2026, 9, 1, 9, 1)).next
    a = did(a, addLine('b1', line('Yamaha F70', 12_000)), at(2026, 9, 1, 9, 2)).next
    a = did(a, issue(), at(2026, 9, 1, 10)).next

    let b = minted('qb', 'B', at(2026, 9, 1, 11))
    b = did(b, setCustomer({ name: 'M Ng' }), at(2026, 9, 1, 11, 1)).next
    b = did(b, issue(), at(2026, 9, 1, 12)).next

    /* touched today and issued on another day: not given TODAY */
    let c = minted('qc', 'C', at(2026, 8, 30, 9))
    c = did(c, setCustomer({ name: 'A Lee' }), at(2026, 8, 30, 9, 1)).next
    c = did(c, issue(), at(2026, 8, 30, 10)).next
    const cLater: QuoteDef = { ...c, updatedAt: at(2026, 9, 1, 13) }

    const days = indexDays([a, b, cLater])
    const today = days.find((d) => d.day === day(2026, 9, 1))!
    expect(today.tally.given).toBe(2)
    expect(today.tally.givenSummed).toBe(2)
    expect(today.tally.givenTotal).toBe(quoteTotals(a).total + quoteTotals(b).total)
    const yesterday = days.find((d) => d.day === day(2026, 8, 30))!
    expect(yesterday.tally.given).toBe(1)
    expect(yesterday.tally.givenTotal).toBe(quoteTotals(c).total)
  })

  it('keeps the denominator honest for a document issued with nothing priced on it', () => {
    /* the issue gate refuses this on the engine; a hand-edited file
       can still carry it, and it is counted as given and not as summed */
    const empty: QuoteDef = {
      ...minted('qe', 'E', at(2026, 9, 1, 9)),
      state: 'issued',
      lines: [],
      sections: [],
      events: [
        {
          id: 'e1',
          kind: 'issued',
          at: at(2026, 9, 1, 10),
          said: 'E is issued',
          changed: [],
        },
      ],
    }
    const [only] = indexDays([empty])
    expect(tallyOf(only.entries)).toEqual({
      quotes: 1,
      events: 1,
      given: 1,
      givenTotal: 0,
      givenSummed: 0,
    })
  })
})

/* ---------------------------------------------------------- */

describe('the words on a folded line', () => {
  it('counts same-kind events into one word, in the order each kind first happened', () => {
    let q = minted('q1', 'X', at(2026, 9, 1, 9))
    const picked: QuoteEvent[] = []
    for (let i = 0; i < 7; i += 1) {
      const step = did(q, addLine('b1', line(`Part ${i}`, 100)), at(2026, 9, 1, 9, i + 1))
      q = step.next
      picked.push(step.event)
    }
    const off = did(q, removeLine(q.lines[1].id), at(2026, 9, 1, 9, 30))
    q = did(off.next, setCustomer({ name: 'R Kelleher' }), at(2026, 9, 1, 9, 40)).next
    q = did(q, issue(), at(2026, 9, 1, 10)).next
    const [only] = indexDays([q])
    expect(kindsSay(only.entries[0].events)).toBe(
      'started · 7 picks · 1 taken off · addressed · issued',
    )
  })

  it('says one of a kind as one, and nothing as no diary', () => {
    const q = did(
      minted('q1', 'X', at(2026, 9, 1, 9)),
      addLine('b1', line('Anchor', 100)),
      at(2026, 9, 1, 9, 1),
    )
    expect(kindsSay(q.next.events)).toBe('started · 1 pick')
    expect(kindsSay([])).toBe(NO_DIARY)
  })
})

/* ---------------------------------------------------------- */

describe('the time of day', () => {
  it('prints the reader’s own hour and minute, and nothing for an instant it cannot read', () => {
    expect(localTimeOf(at(2026, 9, 1, 9, 7))).toBe('09:07')
    expect(localTimeOf(at(2026, 9, 1, 23, 59))).toBe('23:59')
    expect(localTimeOf('not a time')).toBe('')
    /* and the day it prints beside agrees with the day index */
    expect(localDay(at(2026, 9, 1, 0, 1))).toBe(day(2026, 9, 1))
  })
})
