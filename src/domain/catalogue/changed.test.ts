import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import type { EntityDef, RowData } from '@/domain/model'
import { changedSince } from './changed'

const PACKED = '2026-09-16T08:16:21.258Z'

const table = (id: string): EntityDef =>
  ({ id, name: id.toUpperCase(), fields: [] }) as unknown as EntityDef
const row = (id: string, createdAt: string, updatedAt: string): RowData => ({
  id,
  orgId: 'o',
  entityId: 't',
  values: {},
  createdAt,
  updatedAt,
})

describe('what is new since the price list landed', () => {
  it('counts a line written after the packing, by its list, the most first', () => {
    const r = changedSince(
      { a: table('a'), b: table('b'), c: table('c') },
      {
        a: [row('1', PACKED, PACKED), row('2', PACKED, '2026-10-01T00:00:00.000Z')],
        b: [
          row('3', '2026-10-02T00:00:00.000Z', '2026-10-02T00:00:00.000Z'),
          row('4', PACKED, '2026-10-03T09:00:00.000Z'),
        ],
        c: [row('5', PACKED, PACKED)],
      },
      PACKED,
    )
    expect(r.lines).toBe(3)
    expect(r.byList).toEqual([
      /* each list names the line written on it last, so its door opens at the change */
      { tableId: 'b', tableName: 'B', lines: 2, lastRowId: '4' },
      { tableId: 'a', tableName: 'A', lines: 1, lastRowId: '2' },
    ])
    expect(r.last).toBe('2026-10-03T09:00:00.000Z')
  })

  it('reads only the lists it is asked about', () => {
    const r = changedSince(
      { a: table('a'), b: table('b') },
      {
        a: [row('1', PACKED, '2026-10-01T00:00:00.000Z')],
        b: [row('2', PACKED, '2026-10-01T00:00:00.000Z')],
      },
      PACKED,
      (id) => id === 'a',
    )
    expect(r.byList.map((l) => l.tableId)).toEqual(['a'])
  })

  it('says nothing changed, rather than everything, when the packing is not a date', () => {
    const r = changedSince({ a: table('a') }, { a: [row('1', PACKED, PACKED)] }, 'not a date')
    expect(r).toEqual({ lines: 0, byList: [], last: null })
  })
})

describe('the Master Price File as it arrives', () => {
  let pack: PackFixture
  beforeAll(async () => {
    pack = await loadPack()
  })

  it('has no line changed since its own packing', () => {
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const r = changedSince(tables, pack.rowsByEntity, pack.manifest.packedAt)
    expect(r.lines).toBe(0)
    expect(r.last).toBeNull()
  })
})
