/* ============================================================
   A MOTOR'S RRP + FREIGHT IS NOT WORKED FROM COST — measured on
   Northside's own file, not believed from the documentation.

   MPF_GROUND_TRUTH.md line 941 documents Motor Library!BB as
   ROUNDUP(AX × 1.19 × 1.1). The verifier of Prices (2026-11-04) found
   it holds on 0 of 209 Yamaha lines, while the engine kept every
   Yamaha quote from being given for that reason once a dealer chose
   RRP + Freight. These pin what the file says, so the claim cannot
   come back without the file changing first.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { priceIn } from '@/domain/catalogue/priceCommands'
import { freezeLevels, priceLevelsFor } from '@/domain/quote/pricing'
import { frozenMayReach, mayBeNamed, workedFromCost } from './worked'

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

/** ROUNDUP to the dollar, settled to six places first, as the workbook rounds. */
const up = (n: number): number => Math.ceil(Number(n.toFixed(6)))

describe('RRP + Freight Inc GST on the Yamahas', () => {
  it('is not ROUNDUP(Total CTD × 1.19 × 1.1) on any of the 209 lines, even within a dollar', () => {
    const motor = pack.byKey('mot_yamaha')
    const ax = motor.fields.find((f) => f.name === 'Total CTD')!
    const bb = motor.fields.find((f) => f.name === 'RRP + Freight Inc GST')!
    let of = 0
    let holds = 0
    let low = Infinity
    let high = -Infinity
    for (const row of pack.rowsByEntity[motor.id] ?? []) {
      const cost = priceIn(row, ax.id)
      const rrp = priceIn(row, bb.id)
      if (cost === null || rrp === null) continue
      of += 1
      if (Math.abs(up(cost * 1.19 * 1.1) - rrp) <= 1) holds += 1
      low = Math.min(low, rrp / cost)
      high = Math.max(high, rrp / cost)
    }
    expect([holds, of]).toEqual([0, 209])
    expect([Math.round(low * 100) / 100, Math.round(high * 100) / 100]).toEqual([1.22, 1.51])
    expect(workedFromCost(bb)).toBeNull()
    expect(mayBeNamed(bb)).toBe(true)
  })

  it('once named, prices the F90XB at $17,643 and reaches a customer', () => {
    const motor = pack.byKey('mot_yamaha')
    const bb = motor.fields.find((f) => f.name === 'RRP + Freight Inc GST')!
    const named = {
      ...motor,
      priceLevels: [
        { key: 'cash', label: bb.name, fieldId: bb.id, scope: 'quote' as const, named: true },
      ],
    }
    expect(priceLevelsFor(named).map((l) => l.fieldId)).toEqual([bb.id])
    const f90xb = (pack.rowsByEntity[motor.id] ?? []).find(
      (r) => r.values['mot_yamaha.d'] === 'F90XB',
    )!
    const [cash] = freezeLevels(named, f90xb.values)
    expect(cash!.value).toBe(17643)
    expect(frozenMayReach(cash!)).toBe(true)
  })
})
