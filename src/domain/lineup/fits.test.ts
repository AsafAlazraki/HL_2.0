/* What a motor or a trailer fits is the cards' own reading turned round: every line's count of
   models is held to what `carriesOf` counts on every model of every boat maker, on the real price
   list. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { modelKeyOf } from '@/domain/quote/boats'
import { isDiscontinued } from '@/domain/model'
import { carriesOf } from './carries'
import { fitsOf, fitsSaid } from './fits'

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

const makers = () =>
  Object.values(pack.ctx.entities)
    .filter((e) => e.kind === 'boat')
    .map((e) => ({ tableId: e.id, anchors: anchors(e.id) }))

const total = (m: Map<string, { models: number }>) =>
  [...m.values()].reduce((n, f) => n + f.models, 0)

describe('what a motor or a trailer fits', () => {
  it('counts, across every trailer list, exactly the trailers the cards count', () => {
    const all = makers()
    const trailerLists = Object.values(pack.ctx.entities).filter((e) => e.kind === 'trailer')
    const fitted = trailerLists.reduce((n, t) => n + total(fitsOf(pack.ctx, t.id, all)), 0)
    let carried = 0
    for (const m of all)
      for (const c of carriesOf(pack.ctx, m.tableId, m.anchors).values()) carried += c.trailers
    expect(fitted).toBe(carried)
    expect(fitted).toBeGreaterThan(0)
  }, 120_000)

  it('counts Yamaha on Highfield exactly as Highfield’s cards count their motors', () => {
    const hf = { tableId: 'boat_highfield', anchors: anchors('boat_highfield') }
    const fits = fitsOf(pack.ctx, 'mot_yamaha', [hf])
    let carried = 0
    for (const c of carriesOf(pack.ctx, hf.tableId, hf.anchors).values()) carried += c.motors
    expect(total(fits)).toBe(carried)
  }, 120_000)

  it('names the Sport 660’s recommended F175XC as fitting a Highfield', () => {
    const fits = fitsOf(pack.ctx, 'mot_yamaha', makers())
    const f175 = (pack.ctx.rowsByEntity['mot_yamaha'] ?? []).find((r) =>
      /"F175XC"/.test(JSON.stringify(r.values)),
    )!
    const f = fits.get(f175.id)!
    expect(f.byMaker.some((m) => m.tableId === 'boat_highfield' && m.models > 0)).toBe(true)
    expect(f.models).toBe(f.byMaker.reduce((n, m) => n + m.models, 0))
  }, 120_000)

  it('says what it fits maker by maker, and says it when nothing does', () => {
    const word = (id: string) => ({ boat_highfield: 'Highfield', boat_stacer: 'Stacer' })[id] ?? id
    expect(
      fitsSaid(
        {
          models: 12,
          byMaker: [
            { tableId: 'boat_highfield', models: 9 },
            { tableId: 'boat_stacer', models: 3 },
          ],
        },
        word,
      ),
    ).toBe('fits 12 models: 9 Highfield, 3 Stacer')
    expect(fitsSaid({ models: 1, byMaker: [{ tableId: 'boat_highfield', models: 1 }] }, word)).toBe(
      'fits 1 Highfield model',
    )
    expect(fitsSaid(undefined, word)).toBe('fits no model in the price list')
  })

  it('fits nothing for a list no boat maker reads', () => {
    expect(fitsOf(pack.ctx, 'labour_rates', makers()).size).toBe(0)
  })
})
