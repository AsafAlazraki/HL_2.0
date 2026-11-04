/* Against the real pack: a line written twice and back to the file's own words is not changed. */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { changedSince } from '@/domain/catalogue/changed'
import type { RowData } from '@/domain/model'
import { netChanged } from './net'

const pack = await loadPack()
const tables = pack.ctx.entities
const PACKED = '2026-09-16T12:00:00.000Z'
const join = 'join_hf_yam'
const file = (pack.ctx.rowsByEntity[join] ?? []) as RowData[]

/** The join as it stands after ten of its lines were written at `at`, each with `origin`. */
function written(origin: (was: RowData) => string, at: string): RowData[] {
  return file.map((row, i) =>
    i < 10
      ? { ...row, updatedAt: at, values: { ...row.values, __origin: origin(row) } }
      : row,
  )
}

describe('what changed, net of a change taken back', () => {
  it('counts nothing where ten lines were taken off and put back as the file had them', () => {
    const rows = { [join]: written((was) => String(was.values['__origin']), '2026-11-05T01:00:00.000Z') }
    const stamped = changedSince(tables, rows, PACKED)
    expect(stamped.lines).toBe(10)
    const net = netChanged(stamped, tables, rows, new Map([[join, file]]))
    expect(net).toEqual({ lines: 0, byList: [], last: null })
  })

  it('counts the lines that still differ, and opens the list at the last of them', () => {
    const rows = { [join]: written(() => 'removed', '2026-11-05T01:00:00.000Z') }
    const net = netChanged(changedSince(tables, rows, PACKED), tables, rows, new Map([[join, file]]))
    expect(net.lines).toBe(10)
    expect(net.byList.map((l) => [l.tableId, l.lines])).toEqual([[join, 10]])
    expect(net.last).toBe('2026-11-05T01:00:00.000Z')
  })

  it('keeps the written figure for a list the file could not be fetched for', () => {
    const rows = { [join]: written(() => 'removed', '2026-11-05T01:00:00.000Z') }
    const stamped = changedSince(tables, rows, PACKED)
    expect(netChanged(stamped, tables, rows, new Map()).lines).toBe(10)
  })
})
