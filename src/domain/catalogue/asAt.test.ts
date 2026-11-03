import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import type { EntityDef, RowData } from '@/domain/model'
import { asAtOf, datedSections } from './asAt'

/* THE HEADINGS' OWN DATES, read the way the file writes them and never guessed. The figures on
   the real pack are counted here a second way, off the raw rows, so the reader and this file
   must agree rather than the reader agreeing with a number typed into a test. */

describe('a heading that says when it was priced', () => {
  it('reads the day, the month and the year in the shapes the file writes', () => {
    expect(asAtOf('LOWRANCE – HDS Live (as at 31/10/22)')).toBe('2022-10-31')
    expect(asAtOf('RIGGING KITS – Jeanneau DB/43 OB (as at 19/5/2022)')).toBe('2022-05-19')
    expect(asAtOf('TRAILER PARTS (As At 5.8.26)')).toBe('2026-08-05')
    expect(asAtOf('GFAB (as at 1-2-2024)')).toBe('2024-02-01')
  })

  it('reads nothing where the heading says no date, and never a day the calendar has not', () => {
    expect(asAtOf('SAFETY GEAR EQUIPMENT')).toBeNull()
    expect(asAtOf('Roll-Up')).toBeNull()
    expect(asAtOf('as at 31/2/23')).toBeNull()
    expect(asAtOf('as at 12/13/23')).toBeNull()
    expect(asAtOf('as at 0/5/23')).toBeNull()
    /* a date with no "as at" is not a date a price was set on */
    expect(asAtOf('Fitted 19/5/2022')).toBeNull()
  })
})

describe('the dated headings on a small list', () => {
  const table = (id: string, extra: Partial<EntityDef> = {}): EntityDef =>
    ({
      id,
      name: id.toUpperCase(),
      orgId: 'o',
      role: 'base',
      fields: [],
      hierarchy: [`${id}.cat`],
      position: { x: 0, y: 0 },
      createdAt: '',
      updatedAt: '',
      ...extra,
    }) as unknown as EntityDef
  const row = (t: string, cat: string | null, n: number): RowData => ({
    id: `${t}:${n}`,
    orgId: 'o',
    entityId: t,
    values: cat === null ? {} : { [`${t}.cat`]: cat },
    createdAt: '',
    updatedAt: '',
  })

  it('counts each heading once with its lines, the oldest first, over the headings of the lists that date any', () => {
    const tables = {
      a: table('a'),
      b: table('b'),
      old: table('old', { retired: true }),
      j: table('j', { role: 'join' }),
    }
    const rows = {
      a: [
        row('a', 'X (as at 1/1/24)', 1),
        row('a', 'X (as at 1/1/24)', 2),
        row('a', 'Y', 3),
        row('a', 'Z (as at 3/3/22)', 4),
        row('a', null, 5),
      ],
      b: [row('b', 'Plain', 1), row('b', 'Plain too', 2)],
      old: [row('old', 'O (as at 1/1/20)', 1)],
      j: [row('j', 'J (as at 1/1/19)', 1)],
    }
    const r = datedSections(tables, rows)
    expect(r.sections.map((s) => [s.heading, s.on, s.lines])).toEqual([
      ['Z (as at 3/3/22)', '2022-03-03', 1],
      ['X (as at 1/1/24)', '2024-01-01', 2],
    ])
    expect(r.lists).toEqual(['a'])
    expect(r.headingsInThose).toBe(3)
    expect(r.lines).toBe(3)
    expect(r.byYear).toEqual([
      { year: '2022', sections: 1, lines: 1 },
      { year: '2024', sections: 1, lines: 2 },
    ])
    expect(r.oldest).toBe('2022-03-03')
    expect(r.newest).toBe('2024-01-01')
  })

  it('says none, with no oldest and no newest, for a price list that dates nothing', () => {
    const r = datedSections({ b: table('b') }, { b: [row('b', 'Plain', 1)] })
    expect(r.sections).toEqual([])
    expect(r.oldest).toBeNull()
    expect(r.headingsInThose).toBe(0)
  })
})

describe('the Master Price File', () => {
  let pack: PackFixture
  beforeAll(async () => {
    pack = await loadPack()
  })

  it('dates the sections its headings date, counted a second way off the raw rows', () => {
    const r = datedSections(pack.entities, pack.rowsByEntity)
    /* the second way: every distinct first-level heading with "as at" in it */
    const seen = new Set<string>()
    for (const t of pack.entities) {
      if (t.role === 'join' || t.retired === true || !t.hierarchy?.[0]) continue
      for (const row of pack.rowsByEntity[t.id] ?? []) {
        const v = row.values[t.hierarchy[0]]
        if (typeof v === 'string' && /as at/i.test(v)) seen.add(`${t.id}|${v.trim()}`)
      }
    }
    expect(r.sections.length).toBe(seen.size)
    expect(r.sections.length).toBeGreaterThan(0)
    /* every list it names dates a heading, and the denominator is those lists' headings */
    for (const id of r.lists) expect(r.sections.some((s) => s.tableId === id)).toBe(true)
    expect(r.headingsInThose).toBeGreaterThanOrEqual(r.sections.length)
    /* the years add back to the whole */
    expect(r.byYear.reduce((n, y) => n + y.sections, 0)).toBe(r.sections.length)
    expect(r.byYear.reduce((n, y) => n + y.lines, 0)).toBe(r.lines)
    expect(r.oldest! <= r.newest!).toBe(true)
  })
})
