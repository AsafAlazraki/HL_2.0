/* ============================================================
   FITMENT IS A MODEL'S — read off the real price list (the fitment
   judge, 2026-11-03, blocker 1 and major 12).
   ============================================================ */
import { describe, expect, it, vi } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { boatMakers, readBoatFit } from './boat'
import { acrossSaid, bySeries, findModels, sameAcross, versionSaid, versionsOf } from './versions'

vi.setConfig({ testTimeout: 60_000 })

const pack = await loadPack()
const ctx = pack.ctx
const SP660 = { tableId: 'boat_highfield', rowId: 'boat_highfield:513' }

describe('a boat’s model and its versions', () => {
  const model = versionsOf(ctx, SP660)!

  it('reads the Sport 660 as one model of sixteen versions, the boat among them', () => {
    expect(model.name).toBe('Highfield Sport 660')
    expect(model.versions).toHaveLength(16)
    expect(model.versions[model.at]!.place).toEqual(SP660)
    expect(versionSaid(model, model.versions[model.at]!)).toBe('PVC · White / White / White/Blue')
  })

  it('says all sixteen take the same motors, so a change here is made on every one', () => {
    const fit = readBoatFit(ctx, SP660)!
    const across = sameAcross(ctx, model, SP660, fit.motor!.tableId)
    expect(across).toEqual({ same: 16, of: 16 })
    expect(acrossSaid(model.name, across)).toBe(
      'All 16 versions of the Highfield Sport 660 take these motors, and a change here is made on every one.',
    )
    expect(acrossSaid(model.name, { same: 11, of: 16 })).toMatch(/^11 of the .* and 5 take others/)
    expect(acrossSaid('A boat', { same: 1, of: 1 })).toBe('')
  })

  it('is the boat alone on a list with no versions', () => {
    const stab = versionsOf(ctx, { tableId: 'boat_stabicraft', rowId: 'boat_stabicraft:30' })!
    expect(stab.versions).toHaveLength(1)
    expect(versionsOf(ctx, { tableId: 'boat_highfield', rowId: 'nothing:1' })).toBeNull()
  })
})

describe('a maker’s models, under their series', () => {
  const makers = boatMakers(ctx)

  it('files Highfield’s 67 models under seven series, in the price list’s own order', () => {
    const highfield = makers.find((m) => m.maker === 'Highfield')!
    const series = bySeries(ctx, highfield)
    expect(series.map((s) => s.series)).toEqual([
      'Roll-Up',
      'Ultralite',
      'Classic',
      'Coaster',
      'Patrol',
      'Sport',
      'Adventure',
    ])
    expect(series.reduce((n, s) => n + s.models.length, 0)).toBe(67)
  })

  it('keeps every maker’s every model, series or none', () => {
    for (const maker of makers) {
      expect(bySeries(ctx, maker).reduce((n, s) => n + s.models.length, 0)).toBe(maker.boats)
    }
  })

  it('answers a search in models, every one, with how many versions carry the words', () => {
    const found = findModels(ctx, makers, '660')
    expect(found.models.map((f) => [f.model.name, f.found.length])).toEqual([
      ['Highfield Patrol 660 EW', 10],
      ['Highfield Patrol 660 ST', 10],
      ['Highfield Sport 660', 16],
    ])
    expect(found.versions).toBe(36)
    expect(findModels(ctx, makers, 'HBS145').models.map((f) => f.found[0]!.place)).toEqual([SP660])
    expect(findModels(ctx, makers, '   ')).toEqual({ models: [], versions: 0 })
  })
})
