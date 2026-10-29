/* ============================================================
   THE REACH AS A PICTURE (`pairField`), against the real pack.

   The picture is drawn beside the figures `pairReach` counts, so it
   is held to them here: the marks a maker's line lights sum to the
   boats the rule is about, and the marks it rings sum to the models
   that lose a sale. The blank motors are counted by a walk of the
   ePropulsion list's own Control cells written in this test.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { isDiscontinued, type EntityDef } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { countBoats } from '@/domain/quote/boats'
import {
  pairColumns,
  pairField,
  pairReach,
  pairRule,
  pairShapeOf,
  sideFor,
  type PairOp,
  type PairShape,
} from './pairRules'
import { specByKey } from './pairSpecs'

const pack = await loadPack()
const world = pack.ctx
const boatCols = pairColumns(world, 'boat')
const motorCols = pairColumns(world, 'motor')

function shape(boat: [string, PairOp, string], motor: [string, PairOp, string]): PairShape {
  const r = pairRule({
    orgId: 'northside',
    boat: { column: boatCols.find((c) => c.name === boat[0])!, op: boat[1], value: boat[2] },
    partnerKind: 'motor',
    partner: {
      column: motorCols.find((c) => c.name === motor[0])!,
      op: motor[1],
      value: motor[2],
    },
    because: 'a tiller boat has no helm to steer a remote motor from',
    severity: 'block',
    enabled: true,
    now: '2026-10-28T09:00:00.000Z',
  })
  return pairShapeOf(r, world)!
}

const tiller = shape(['steering', 'eq', 'Tiller'], ['controls', 'eq', 'Tiller handle'])
const sum = (ns: number[]): number => ns.reduce((a, b) => a + b, 0)

describe('one line of marks per boat maker', () => {
  const field = pairField(tiller, world)
  const reach = pairReach(tiller, world)

  it('draws every model the picker counts, once, on its maker’s line', () => {
    expect(sum(field.makers.map((m) => m.models.length))).toBe(
      countBoats(world.entities, world.rowsByEntity).boats,
    )
    expect(sum(field.makers.map((m) => m.models.length))).toBe(289)
    expect(field.makers.find((m) => m.id === 'boat_highfield')?.maker).toBe('Highfield')
  })

  it('lights as many as the figure beside it counts, and rings as many as lose a sale', () => {
    expect(sum(field.makers.map((m) => m.about))).toBe(reach.about)
    expect(sum(field.makers.map((m) => m.losing))).toBe(reach.modelsLosing)
    for (const m of field.makers) {
      expect(m.about).toBe(m.models.filter((x) => x.about).length)
      /* a model can only lose a sale the rule is about */
      for (const x of m.models) if (x.loses) expect(x.about).toBe(true)
    }
  })

  it('names the five Highfield Classics, and what they lose', () => {
    const highfield = field.makers.find((m) => m.id === 'boat_highfield')!
    expect(highfield.models.filter((m) => m.loses).map((m) => m.said)).toEqual([
      'Classic 340',
      'Classic 360',
      'Classic 380',
      'Classic 360 LS',
      'Classic 380 LS',
    ])
    expect(highfield.lose).toEqual(['Yamaha F25SWTC'])
    expect(field.makers.filter((m) => m.losing > 0).map((m) => m.id)).toEqual(['boat_highfield'])
  })

  it('says which motors it cannot read: the ePropulsion list writes no controls at all', () => {
    const ep = Object.values(world.entities).find((t) => t.id === 'mot_epropulsion') as EntityDef
    expect(ep.fields.some((f) => f.name.trim().toLowerCase() === 'control')).toBe(false)
    const onSale = (world.rowsByEntity[ep.id] ?? []).filter((r) => !isDiscontinued(r)).length
    expect(field.blank).toEqual([{ maker: 'ePropulsion', count: onSale }])
    expect(onSale).toBe(32)
    /* and those it cannot read are never among those it refuses */
    expect(reach.refused + onSale).toBeLessThanOrEqual(reach.partners)
  })
})

describe('half answered', () => {
  it('lights the boats it is about and rings nothing until the motor is chosen', () => {
    const half: PairShape = {
      boat: tiller.boat,
      partnerKind: 'motor',
      partner: sideFor(specByKey('motor::controls'), 'eq', ''),
    }
    const field = pairField(half, world)
    expect(sum(field.makers.map((m) => m.about))).toBe(61)
    expect(sum(field.makers.map((m) => m.losing))).toBe(0)
    expect(field.blank).toEqual([])
  })

  it('lights nothing before the boat is chosen', () => {
    const none: PairShape = {
      boat: sideFor(null, 'eq', ''),
      partnerKind: 'motor',
      partner: sideFor(null, 'eq', ''),
    }
    const field = pairField(none, world)
    expect(sum(field.makers.map((m) => m.about))).toBe(0)
    expect(sum(field.makers.map((m) => m.models.length))).toBe(289)
  })
})
