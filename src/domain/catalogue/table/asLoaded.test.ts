import { beforeAll, describe, expect, it } from 'vitest'
import type { RowData } from '@/domain/model'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { asLoaded, sameValue, wasInFile } from './asLoaded'
import { elsewhere, lineCarries, wordsOf } from './elsewhere'

let pack: PackFixture
beforeAll(async () => {
  pack = await loadPack()
})

describe('what changed against the file as it came', () => {
  it('finds nothing changed on the file compared with itself', () => {
    const hf = pack.byKey('boat_highfield')
    const rows = pack.rowsByEntity.boat_highfield ?? []
    const got = asLoaded(rows, rows, hf.fields)
    expect(got.rows.size).toBe(0)
  })

  it('names the one cell written, and what the file held in it; a line the file lacks is new', () => {
    const hf = pack.byKey('boat_highfield')
    const rows = pack.rowsByEntity.boat_highfield ?? []
    const cash = hf.fields.find((f) => f.name === 'Cash')!
    const first = rows[0]!
    const now: RowData[] = [
      { ...first, values: { ...first.values, [cash.id]: 850 } },
      ...rows.slice(1),
      { ...first, id: 'new-line' },
    ]
    const got = asLoaded(now, rows, hf.fields)
    expect(wasInFile(got, first.id, cash.id)).toEqual({ was: first.values[cash.id] })
    expect(got.cells.get(first.id)?.size).toBe(1)
    expect(got.added).toEqual(new Set(['new-line']))
    expect(got.rows).toEqual(new Set([first.id, 'new-line']))
  })

  it('reads an emptied text, a number typed as text, and the same picture list as the same', () => {
    expect(sameValue('', null)).toBe(true)
    expect(sameValue(2770, '2770')).toBe(true)
    expect(sameValue([{ id: 'a', src: 'x' }], [{ id: 'b', src: 'x' }])).toBe(true)
    expect(sameValue([{ id: 'a', src: 'x' }], [{ id: 'a', src: 'y' }])).toBe(false)
  })
})

describe('where else a word is', () => {
  it('counts the lists that carry every word, never the list being read', () => {
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const found = elsewhere(tables, pack.rowsByEntity, 'F4SMHA', 'mot_yamaha')
    expect(found.every((f) => f.tableId !== 'mot_yamaha')).toBe(true)
    for (const f of found) {
      const want = (pack.rowsByEntity[f.tableId] ?? []).filter((r) =>
        lineCarries(r, wordsOf('F4SMHA')),
      ).length
      expect(f.count).toBe(want)
    }
    expect(found.length).toBeGreaterThan(0)
    expect(elsewhere(tables, pack.rowsByEntity, 'zzqx', 'boat_highfield')).toEqual([])
  })
})
