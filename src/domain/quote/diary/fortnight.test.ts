import { describe, expect, it } from 'vitest'
import type { QuoteDef } from '@/domain/model'
import { indexDays, rhythmOf } from './days'
import { fortnightOf, spanWritten } from './fortnight'

/* ============================================================
   THE FORTNIGHT A DESK DRAWS, PINNED (m2-last-critique.md major 7:
   thirteen empty dashed boxes, every one a day before the diary began).
   ============================================================ */

const at = (y: number, m: number, d: number, h = 12): string =>
  new Date(y, m - 1, d, h, 0).toISOString()
const day = (y: number, m: number, d: number): string =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

/** A document born at an instant, with the mint's own event and nothing else. */
function born(id: string, stamp: string): QuoteDef {
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
    sections: [],
    chapters: [],
    lines: [],
    adjustments: [],
    events: [{ id: `e-${id}`, kind: 'minted', at: stamp, said: 'A hull', changed: [] }],
    levelKey: 'cash',
    customer: { name: '' },
    createdAt: stamp,
    updatedAt: stamp,
  }
}

describe('the fortnight, as a desk draws it', () => {
  it('says the days before the diary began once, as one span, and keeps every kept day with its quotes', () => {
    const today = day(2026, 9, 25)
    const q = born('q1', at(2026, 9, 25, 0))
    const days = indexDays([q])
    const f = fortnightOf(rhythmOf(days, today, 14, today), days)
    expect(f.before?.days).toBe(13)
    expect(f.before?.first.day).toBe(day(2026, 9, 12))
    expect(f.before?.last.day).toBe(day(2026, 9, 24))
    expect(spanWritten(f.before!.first, f.before!.last)).toBe('12 – 24 Sep')
    expect(f.kept.map((d) => d.day)).toEqual([today])
    expect(f.kept[0]!.touched.map((t) => t.id)).toEqual(['q1'])
  })

  it('keeps a quiet day the diary kept, with nothing touched, and has no span when every day was kept', () => {
    const today = day(2026, 9, 16)
    const a = born('a', at(2026, 9, 14, 9))
    const b = born('b', at(2026, 9, 16, 9))
    const c = born('c', at(2026, 9, 16, 11))
    const days = indexDays([a, b, c])
    const f = fortnightOf(rhythmOf(days, today, 3, day(2026, 9, 14)), days)
    expect(f.before).toBeNull()
    expect(f.kept.map((d) => [d.day, d.touched.map((t) => t.id)])).toEqual([
      [day(2026, 9, 14), ['a']],
      [day(2026, 9, 15), []],
      /* most recently touched first, as the day's own lines are */
      [day(2026, 9, 16), ['c', 'b']],
    ])
  })

  it('writes a span across a month’s end with both months, and one day as one date', () => {
    const f = fortnightOf(rhythmOf([], day(2026, 9, 3), 5, day(2026, 9, 3)), [])
    expect(spanWritten(f.before!.first, f.before!.last)).toBe('30 Aug – 2 Sep')
    const one = fortnightOf(rhythmOf([], day(2026, 9, 3), 2, day(2026, 9, 3)), [])
    expect(spanWritten(one.before!.first, one.before!.last)).toBe('2 Sep')
  })
})
