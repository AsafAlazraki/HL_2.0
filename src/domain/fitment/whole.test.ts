/* ============================================================
   SHOW ALL, NARROWED AND FOUND, on the real price list: the figures
   the whole list prints are read here and add up, never summed in the
   screen (built-critique-m3-2.md, blocker 1).
   ============================================================ */
import { describe, expect, it, vi } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { rowLabel } from '@/domain/model'
import { readBoatFit, readWhole } from './boat'
import { findInWhole } from './whole'

vi.setConfig({ testTimeout: 60_000 })

const pack = await loadPack()
const ctx = pack.ctx
const highfield = pack.byKey('boat_highfield')
const sp660 = (pack.rowsByEntity[highfield.id] ?? []).find(
  (r) => rowLabel(highfield, r) === 'Highfield - SP660 (PVC) W-W-WB',
)!
const fit = readBoatFit(ctx, { tableId: highfield.id, rowId: sp660.id })!

describe('the whole list as it is drawn', () => {
  it('draws every group with nothing typed and nothing narrowed', () => {
    const motor = readWhole(ctx, fit, 'motor')!
    const seen = findInWhole(motor, '', '', 150)
    expect(seen.narrowed).toBe(false)
    expect(seen.narrowedTo).toBe(0)
    expect(seen.needles).toEqual([])
    expect(seen.matched).toBe(209)
    expect(seen.groups.map((g) => g.id)).toEqual(motor.groups.map((g) => g.id))
  })

  it('narrows to one reason, counted, and a split reason keeps every maker under it', () => {
    const trailer = readWhole(ctx, fit, 'trailer')!
    const another = findInWhole(trailer, 'another', '', 150)
    expect(another.narrowed).toBe(true)
    expect(another.narrowedTo).toBe(131)
    expect(another.groups.every((g) => g.id.startsWith('another:'))).toBe(true)
    expect(another.groups.reduce((n, g) => n + g.found.length, 0)).toBe(131)
  })

  it('finds by every typed word, and says how many more a group holds than it draws', () => {
    const trailer = readWhole(ctx, fit, 'trailer')!
    const all = findInWhole(trailer, '', '', 150)
    const unnamed = all.groups.find((g) => g.id === 'unnamed')!
    expect(unnamed.found).toHaveLength(291)
    expect(unnamed.drawn).toHaveLength(150)
    expect(unnamed.more).toBe(141)
    const motor = readWhole(ctx, fit, 'motor')!
    const found = findInWhole(motor, '', '  F175XC ', 150)
    expect(found.needles).toEqual(['f175xc'])
    expect(found.matched).toBeGreaterThan(0)
    expect(found.groups.every((g) => g.found.every((r) => r.hay.includes('f175xc')))).toBe(true)
    expect(findInWhole(motor, '', 'no such motor zzz', 150)).toMatchObject({
      matched: 0,
      groups: [],
    })
  })
})
