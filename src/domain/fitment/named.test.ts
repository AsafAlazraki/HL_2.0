/* ============================================================
   THE FIT FLOW'S SECOND WALK, READ OFF THE REAL PRICE LIST
   (docs/directions/fit-flow/walk-2-1.md, 2026-11-05).

   Each figure below was counted on the Master Price File as loaded:
   the 40 dealer-fit packages that carry PA600, one per Patrol 600
   version by its own code; the F150XC and F150XCB told apart; the
   Patrol 600's ten prices; and a take-off undone counted as none.
   ============================================================ */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { makeCtx, type CatalogueCtx } from '@/domain/model'
import { readBoatFit, type BoatFit } from './boat'
import { versionsOf } from './versions'
import { namedForOf, standingChanges, takenOffOf, versionSpanOf } from './page'
import {
  codeIn,
  codeStem,
  namedApartSaid,
  namedFactsSaid,
  namedScopeOf,
  namedSplitOf,
  offerableOf,
} from './named'
import { differsOf } from './differs'
import { riggedOf } from './rigged'

vi.setConfig({ testTimeout: 60_000 })

/** the Patrol 600 Open, PVC, Light Grey / White / Dark Grey: HBP181 */
const PA600 = 'boat_highfield:298'
/** the Patrol 600 Open, PVC, Black / Black / Black: HBP189, the one Home's photograph opens */
const PA600_BLACK = 'boat_highfield:306'

let pack: PackFixture
let ctx: CatalogueCtx

const fitOf = (rowId: string): BoatFit => readBoatFit(ctx, { tableId: 'boat_highfield', rowId })!

beforeAll(async () => {
  pack = await loadPack()
  ctx = makeCtx({ ...pack.ctx, orgId: 'northside' })
})

describe('a version code inside a line’s code', () => {
  it('reads it with the file’s spaces read out, and only as a code of its own', () => {
    expect(codeIn('9HI_HBP 189_PD', 'HBP189')).toBe(true)
    expect(codeIn('9HI_HBP 189_PD', 'HBP18')).toBe(false)
    expect(codeIn('9HI_HBP 1890_PD', 'HBP189')).toBe(false)
    expect(codeIn('', 'HBP189')).toBe(false)
  })

  it('reads the stem the model’s versions share, and none where they share none', () => {
    const model = versionsOf(ctx, { tableId: 'boat_highfield', rowId: PA600 })!
    expect(codeStem(model.versions)).toBe('HBP')
    expect(codeStem([...model.versions, { ...model.versions[0]!, code: 'X12' }])).toBe('')
  })
})

describe('the lines named for the Patrol 600, by the version each is made for', () => {
  const read = (rowId: string) => {
    const fit = fitOf(rowId)
    const model = versionsOf(ctx, fit.place)!
    const named = namedForOf(ctx, fit, 'PA600', takenOffOf(ctx, fit))
    return { fit, model, named }
  }

  it('finds its own pre-delivery package by its code, and the black boat’s is not the grey one', () => {
    const grey = read(PA600)
    const own = grey.named.filter(
      (l) => namedScopeOf(ctx, l, grey.model.versions, grey.fit.place).kind === 'this',
    )
    expect(own.map((l) => [l.name, l.facts])).toEqual([
      ['Patrol · PA600 OB PVC · LG-W-DG', 'Pre Delivery Allowance (8 hrs)'],
    ])

    const black = read(PA600_BLACK)
    const blacks = black.named.filter(
      (l) => namedScopeOf(ctx, l, black.model.versions, black.fit.place).kind === 'this',
    )
    expect(blacks.map((l) => l.name)).toEqual(['Patrol · PA600 OB PVC · B-B-B'])
  })

  it('splits the 41: two shown, 9 for its other versions, 30 for versions not on the price list', () => {
    const { fit, model, named } = read(PA600)
    const split = namedSplitOf(
      ctx,
      named.filter((n) => n.slot !== 'trailer'),
      model.versions,
      fit.place,
    )
    expect(split.shown.map((l) => [l.name, l.scope.kind, l.price])).toEqual([
      ['Patrol · PA600 OB PVC · LG-W-DG', 'this', null],
      ['Sundeck for PA600', 'model', 1750],
    ])
    expect(split.otherVersions).toBe(9)
    expect(split.unlisted).toHaveLength(30)
    expect([split.unlisted[0], split.unlisted.at(-1)]).toEqual(['HBP191', 'HBP220'])
    expect(namedFactsSaid(split.shown[0]!)).toBe(
      'Pre Delivery Allowance (8 hrs) · made for this version, HBP181',
    )
    expect(namedApartSaid(split, 'Patrol 600')).toBe(
      '9 more are made for the Patrol 600’s other versions, and can be offered only there; 30 are made for versions the price list does not carry (HBP191 to HBP220), so they are offered on none.',
    )
  })

  it('keeps the trailer named for the model as the model’s, offered on every version', () => {
    const { fit, model, named } = read(PA600)
    const split = namedSplitOf(
      ctx,
      named.filter((n) => n.slot === 'trailer'),
      model.versions,
      fit.place,
    )
    expect(split.shown.map((l) => [l.name, l.scope.kind])).toEqual([
      ['GFAB Tandem Axel Trailer t/s Highfield Patrol 600', 'model'],
    ])
    expect(namedApartSaid(split, 'Patrol 600')).toBe('')
  })
})

describe('something else to offer', () => {
  it('finds by every word, leaves out what is already offered or named, and counts the rest', () => {
    const fit = fitOf(PA600)
    const named = namedForOf(ctx, fit, 'PA600')
    const apart = new Set(named.map((n) => n.place.rowId))
    const vhf = offerableOf(ctx, fit, 'vhf', apart)
    expect(vhf.found).toBeGreaterThan(vhf.lines.length)
    expect(vhf.lines).toHaveLength(8)
    const offered = new Set(fit.lists.flatMap((l) => l.made.map((m) => m.place.rowId)))
    expect(vhf.lines.some((l) => offered.has(l.place.rowId) || apart.has(l.place.rowId))).toBe(
      false,
    )
    expect(vhf.lines.every((l) => /vhf/i.test(`${l.name} ${l.facts}`))).toBe(true)
    expect(offerableOf(ctx, fit, 'v', apart)).toEqual({ lines: [], found: 0 })
    expect(offerableOf(ctx, fit, 'PA600', apart).found).toBe(0)
  })
})

describe('two motors of one rating, told apart', () => {
  it('says how the F150XC and the F150XCB differ, in the price list’s own columns', () => {
    const fit = fitOf(PA600)
    const rigs = riggedOf(ctx, fit)
    const byName = new Map(rigs.map((r) => [r.motor.name, r.motor.place.rowId]))
    const tells = differsOf(
      ctx,
      rigs.map((r) => r.motor.place),
    )
    expect(tells.get(byName.get('Yamaha F150XC')!)).toBe(
      'Cylinders / Displacement: L4 / 2670cc · Control: Mech with Hydraulic Steering · Tilt & Trim: Power Trim & Tilt',
    )
    expect(tells.get(byName.get('Yamaha F150XCB')!)).toBe(
      'Cylinders / Displacement: L4 / 2785cc · Control: DEC with Hydraulic Steering · Tilt & Trim: TotalTilt',
    )
    expect(tells.get(byName.get('Yamaha F115XB')!)).toBe('Engine Colour: Grey')
    /* the F130XA has no other of its rating here, so nothing is said */
    expect(tells.has(byName.get('Yamaha F130XA')!)).toBe(false)
  })
})

describe('the versions the picker stands among', () => {
  it('reads the ten Patrol 600 prices, and says which is the lowest', () => {
    const fit = fitOf(PA600)
    const model = versionsOf(ctx, fit.place)!
    const span = versionSpanOf(
      ctx,
      fit,
      model.versions.map((v) => v.place),
    )
    expect(span).toEqual({ count: 10, low: 30190, high: 40670, lowest: true })
    expect(versionSpanOf(ctx, fit, [fit.place])).toBeNull()
  })
})

describe('the changes that still stand', () => {
  it('counts off and back on as none, either way round, and a recommendation as one', () => {
    expect(standingChanges([])).toBe(0)
    expect(
      standingChanges([
        { target: 'a', act: 'off' },
        { target: 'a', act: 'on' },
      ]),
    ).toBe(0)
    expect(
      standingChanges([
        { target: 'a', act: 'on' },
        { target: 'b', act: 'off' },
        { target: 'a', act: 'off' },
      ]),
    ).toBe(1)
    expect(
      standingChanges([
        { target: 'a', act: 'star' },
        { target: 'a', act: 'star' },
      ]),
    ).toBe(2)
  })
})
