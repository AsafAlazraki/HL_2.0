/* What each model carries, counted for a whole maker at once, is Fitment's own reading of each
   boat: every model of all seven boat makers on the real price list is held to `readBoatFit`. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { offeredIn, readBoatFit } from '@/domain/fitment/boat'
import { modelKeyOf } from '@/domain/quote/boats'
import { isDiscontinued } from '@/domain/model'
import { carriesOf } from './carries'

let pack: PackFixture
beforeAll(async () => {
  pack = await loadPack()
})

/** one anchor row per model, as the page reads its models */
function anchors(tableId: string): string[] {
  const table = pack.ctx.entities[tableId]!
  const seen = new Set<string>()
  const out: string[] = []
  for (const row of pack.ctx.rowsByEntity[tableId] ?? []) {
    if (isDiscontinued(row)) continue
    const key = modelKeyOf(table, row)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row.id)
  }
  return out
}

describe('what each model carries', () => {
  it('counts what Fitment reads, model by model, for every boat maker', () => {
    const boats = Object.values(pack.ctx.entities).filter((e) => e.kind === 'boat')
    expect(boats.length).toBe(7)
    let models = 0
    for (const table of boats) {
      const ids = anchors(table.id)
      const counted = carriesOf(pack.ctx, table.id, ids)
      for (const id of ids) {
        const fit = readBoatFit(pack.ctx, { tableId: table.id, rowId: id })!
        const c = counted.get(id)!
        expect(c.motors, `${id} motors`).toBe(fit.motor ? offeredIn(fit.motor.made).length : 0)
        expect(c.trailers, `${id} trailers`).toBe(
          fit.trailer ? offeredIn(fit.trailer.made).length : 0,
        )
        const of = (kind: string) =>
          fit.lists.filter((l) => l.kind === kind).reduce((n, l) => n + offeredIn(l.made).length, 0)
        expect(c.packages, `${id} packages`).toBe(of('package'))
        expect(c.parts, `${id} parts`).toBe(of('accessory'))
        const star = fit.motor ? offeredIn(fit.motor.made).find((m) => m.starred) : undefined
        expect(c.recommended, `${id} recommended`).toBe(star?.name ?? null)
        models += 1
      }
    }
    /* Highfield 67, Stacer 91, Stabicraft 37, Formosa 39, Jeanneau 27, Surtees 19, Haines 9 */
    expect(models).toBe(289)
  }, 120_000)

  it('reads the Sport 660 as the board measured it: 7 motors with the F175XC marked, 2 trailers, 4 packages, 3 parts', () => {
    const sport660 = (pack.ctx.rowsByEntity['boat_highfield'] ?? []).find((r) =>
      /SP660/.test(JSON.stringify(r.values)),
    )!
    const c = carriesOf(pack.ctx, 'boat_highfield', [sport660.id]).get(sport660.id)!
    expect(c).toEqual({
      motors: 7,
      trailers: 2,
      packages: 4,
      parts: 3,
      recommended: 'Yamaha F175XC',
    })
  })

  it('reads a whole maker in well under the time Fitment takes boat by boat', () => {
    const ids = anchors('boat_stacer')
    const t = performance.now()
    carriesOf(pack.ctx, 'boat_stacer', ids)
    const took = performance.now() - t
    expect(ids.length).toBe(91)
    /* measured 2026-11-04: readBoatFit took 4,402 ms for Stacer's 91 in node */
    expect(took).toBeLessThan(2000)
  })

  it('carries nothing for a list that is not a boat maker', () => {
    expect(carriesOf(pack.ctx, 'mot_yamaha', ['mot_yamaha:1']).size).toBe(0)
  })
})
