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
import {
  NO_DIARY,
  dayWritten,
  daysFrom,
  diarySince,
  daysOf,
  inDiaryOrder,
  indexDays,
  kindParts,
  kindsSay,
  localTimeOf,
  rhythmOf,
  STRAND_TITLE,
  STRANDS,
  strandOf,
  tallyOf,
} from './days'

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

  it('gives each counted word its strand, so a screen can ink it without knowing the kinds', () => {
    let q = minted('q1', 'X', at(2026, 9, 1, 9))
    q = did(q, addLine('b1', line('Anchor', 100)), at(2026, 9, 1, 9, 1)).next
    q = did(q, setCustomer({ name: 'R Kelleher' }), at(2026, 9, 1, 9, 2)).next
    q = did(q, issue(), at(2026, 9, 1, 9, 3)).next
    expect(kindParts(q.events).map((p) => [p.words, p.strand])).toEqual([
      ['started', 'begun'],
      ['1 pick', 'built'],
      ['addressed', 'addressed'],
      ['issued', 'given'],
    ])
    expect(strandOf('undone')).toBe('back')
    expect(strandOf('level-set')).toBe('priced')
  })

  it('keys each strand by a word its own lines print, so the key and the lines agree', () => {
    /* the M2-close critique's minor 15: a line said `started · addressed · issued` over a key
       that said "begun · built · priced · addressed · given · taken back" */
    let q = minted('q1', 'X', at(2026, 9, 1, 9))
    q = did(q, addLine('b1', line('Anchor', 100)), at(2026, 9, 1, 9, 1)).next
    q = did(q, addLine('b2', line('Cover', 50)), at(2026, 9, 1, 9, 2)).next
    q = did(q, setCustomer({ name: 'R Kelleher' }), at(2026, 9, 1, 9, 3)).next
    q = did(q, issue(), at(2026, 9, 1, 9, 4)).next
    const said = kindParts(q.events)
    for (const part of said) {
      expect(part.words, `the ${part.strand} strand`).toContain(STRAND_TITLE[part.strand])
    }
    expect(STRANDS.map((s) => STRAND_TITLE[s])).toEqual([
      'started',
      'picks',
      'repriced',
      'addressed',
      'issued',
      'put back',
    ])
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

/* THE ORDER A DAY WENT IN, when the clock cannot say it. Every event on a minted walk
   shares one instant — the walk's clock is fixed — and on 2026-09-23 the critic read
   `addressed · started · issued` off one shot and `issued · addressed · started` off another
   of the same tree (built-critique-m2.md #4): the tie fell to each event's id, and an id is
   random. These pin the rule that replaced it — instant, then the event's place in the
   quote's own log — and pin it the way the fault showed itself: two runs must agree. */

/** The walk the rulers mint: started, addressed and issued, all in one instant. */
function oneSitting(stamp: string, id = 'q1', reference = '20260916-01'): QuoteDef {
  let q = minted(id, reference, stamp)
  q = did(q, setCustomer({ name: 'R Kelleher' }), stamp).next
  q = did(q, issue(), stamp).next
  return q
}

/** The same document with every event id replaced, so an order read off ids would move. */
const reIded = (q: QuoteDef, ids: readonly string[]): QuoteDef => ({
  ...q,
  events: q.events.map((e, i) => ({ ...e, id: ids[i] ?? e.id })),
})

describe('the order a day went in, when every event shares an instant', () => {
  it('keeps the log’s own order for events that share an instant', () => {
    const q = oneSitting(at(2026, 9, 16, 9))
    expect(new Set(q.events.map((e) => e.at)).size, 'one instant, as on the walk').toBe(1)
    const [only] = indexDays([q])
    expect(only.entries[0].events.map((e) => e.kind)).toEqual(['minted', 'customer-set', 'issued'])
    expect(kindsSay(only.entries[0].events)).toBe('started · addressed · issued')
  })

  it('reads the same on two runs of the same walk, whatever ids the runs were given', () => {
    const stamp = at(2026, 9, 16, 9)
    /* two runs: fresh random ids each time, as two browsers would mint them */
    const first = oneSitting(stamp)
    const second = oneSitting(stamp)
    expect(first.events.map((e) => e.id)).not.toEqual(second.events.map((e) => e.id))
    /* and two runs whose ids happen to sort AGAINST the log and WITH it — the two shots
       the critic compared came from exactly this */
    const against = reIded(first, ['e-zz', 'e-mm', 'e-aa'])
    const along = reIded(first, ['e-aa', 'e-mm', 'e-zz'])
    const said = [first, second, against, along].map((q) =>
      kindsSay(indexDays([q])[0].entries[0].events),
    )
    expect(new Set(said).size, `every run says one thing: ${said.join(' | ')}`).toBe(1)
    expect(said[0]).toBe('started · addressed · issued')
  })

  it('orders by the instant first, and by the log only where the instants agree', () => {
    const stamp = at(2026, 9, 16, 9)
    let q = minted('q1', '20260916-01', stamp)
    q = did(q, setCustomer({ name: 'R Kelleher' }), stamp).next
    /* a later instant, placed EARLIER in the log than two events it came after, still
       reads after them — the log breaks ties, it does not overrule the clock */
    const late = did(q, addLine('b1', line('Bimini top', 900)), at(2026, 9, 16, 11)).event
    const shuffled: QuoteDef = { ...q, events: [late, ...q.events] }
    expect(inDiaryOrder(shuffled.events).map((e) => e.kind)).toEqual([
      'minted',
      'customer-set',
      'line-added',
    ])
    /* and an ordered slice is a fixed point: ordering it again moves nothing */
    const once = inDiaryOrder(shuffled.events)
    expect(inDiaryOrder(once)).toEqual(once)
  })

  it('says a raw log in the order it happened, not only a day index’s slice of it', () => {
    const q = reIded(oneSitting(at(2026, 9, 16, 9)), ['e-zz', 'e-mm', 'e-aa'])
    expect(kindsSay(q.events)).toBe('started · addressed · issued')
  })

  it('tells two quotes touched in one instant apart by reference, newest first, on every run', () => {
    const stamp = at(2026, 9, 16, 9)
    const a = oneSitting(stamp, 'q-zz', '20260916-01')
    const b = oneSitting(stamp, 'q-aa', '20260916-02')
    const one = indexDays([a, b])[0].entries.map((e) => e.quote.reference)
    const other = indexDays([b, a])[0].entries.map((e) => e.quote.reference)
    expect(one).toEqual(['20260916-02', '20260916-01'])
    expect(other).toEqual(one)
  })
})

/* ---------------------------------------------------------- */

describe('where the diary begins', () => {
  it('names the first thing kept, and adds up what was given since without counting a quote twice', () => {
    /* a quote started on the 1st and given on the 3rd: under two heads, one document */
    let a = minted('qa', 'A', at(2026, 9, 1, 9))
    a = did(a, setCustomer({ name: 'R Kelleher' }), at(2026, 9, 3, 9)).next
    a = did(a, issue(), at(2026, 9, 3, 10)).next
    /* a draft started on the 2nd, never given */
    const b = minted('qb', 'B', at(2026, 9, 2, 9))
    const since = diarySince([b, a])!
    expect(since.day).toBe(day(2026, 9, 1))
    expect(since.at).toBe(at(2026, 9, 1, 9))
    expect(since.kept).toBe(2)
    expect(since.given).toBe(1)
    expect(since.givenTotal).toBe(quoteTotals(a).total)
    expect(since.givenSummed).toBe(1)
  })

  it('begins a document with no diary on the day it was made, and says nothing for an empty browser', () => {
    const bare: QuoteDef = { ...minted('q1', 'X', at(2026, 8, 30, 9)), events: [] }
    expect(diarySince([bare])?.day).toBe(day(2026, 8, 30))
    expect(diarySince([])).toBeNull()
  })
})

/* ---------------------------------------------------------- */

describe('the rhythm of the last few days', () => {
  it('draws one day per calendar day up to today, oldest first, one strand per event in the order it happened', () => {
    const stamp = at(2026, 9, 16, 9)
    const q = oneSitting(stamp)
    let older = minted('q2', '20260914-01', at(2026, 9, 14, 10))
    older = did(older, addLine('b1', line('Anchor', 100)), at(2026, 9, 14, 11)).next
    const days = indexDays([q, older])
    const rhythm = rhythmOf(days, day(2026, 9, 16), 4, day(2026, 9, 14))
    expect(rhythm.map((r) => r.day)).toEqual([
      day(2026, 9, 13),
      day(2026, 9, 14),
      day(2026, 9, 15),
      day(2026, 9, 16),
    ])
    expect(rhythm.map((r) => r.strands)).toEqual([
      [],
      ['begun', 'built'],
      [],
      ['begun', 'addressed', 'given'],
    ])
    expect(rhythm.map((r) => r.quotes)).toEqual([0, 1, 0, 1])
    expect(rhythm[3]).toMatchObject({ weekday: 'Wed', date: 16, written: 'Wednesday 16 September' })
  })

  it('says a day before the diary began was not kept, rather than drawing it as a quiet one', () => {
    const q = oneSitting(at(2026, 9, 16, 9))
    const rhythm = rhythmOf(indexDays([q]), day(2026, 9, 16), 3, day(2026, 9, 16))
    expect(rhythm.map((r) => r.kept)).toEqual([false, false, true])
    expect(rhythmOf([], day(2026, 9, 16), 2, null).every((r) => !r.kept)).toBe(true)
  })

  it('crosses a month’s end on the reader’s own calendar', () => {
    const rhythm = rhythmOf([], day(2026, 10, 2), 3, null)
    expect(rhythm.map((r) => r.day)).toEqual([day(2026, 9, 30), day(2026, 10, 1), day(2026, 10, 2)])
  })
})

/* ---------------------------------------------------------- */

describe('the day, written out', () => {
  it('writes a day as a diary page does, with the year only when it is not this one', () => {
    expect(dayWritten('2026-09-16', '2026-09-16')).toBe('Wednesday 16 September')
    expect(dayWritten('2026-09-15', '2026-09-16')).toBe('Tuesday 15 September')
    expect(dayWritten('2025-12-31', '2026-09-16')).toBe('Wednesday 31 December 2025')
  })

  it('writes nothing for a day it cannot read, rather than a wrong one', () => {
    expect(dayWritten('not a day', '2026-09-16')).toBe('')
    expect(dayWritten('2026-02-30', '2026-09-16')).toBe('')
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
