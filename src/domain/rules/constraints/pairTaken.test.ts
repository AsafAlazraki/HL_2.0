/* ============================================================
   WHAT A RULE TAKES, BY NAME, against the real pack — and the two
   pieces of grammar the data round added: "and its …" and "except
   the …" on the boat, and a model said as a person says it.

   The tiller rule is the one `pairRules.test.ts` counts: 45 of the
   540 offers on a tiller boat are a remote motor, every one of them
   the Yamaha F25SWTC on five Highfield Classics. The Ultra Centrecab
   trailer rule is the one the judge measured taking 3 of 3 (judge.md,
   data round, J8).
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import type { ConstraintDef } from '@/domain/model'
import {
  judgePair,
  pairColumns,
  pairReach,
  pairRule,
  pairSaid,
  pairShapeOf,
  sideFor,
  type PairShape,
} from './pairRules'
import { specByKey, specValue } from './pairSpecs'
import { modelKeyOf } from '@/domain/quote/boats'
import {
  pairBoats,
  pairClashes,
  pairEmpties,
  pairOnBoat,
  pairOnQuotes,
  pairTaken,
} from './pairTaken'

const world = (await loadPack()).ctx
const side = (key: string, op: 'eq' | 'neq', value: string) => sideFor(specByKey(key), op, value)
const tiller: PairShape = {
  boat: side('boat::steering', 'eq', 'Tiller'),
  partnerKind: 'motor',
  partner: side('motor::controls', 'eq', 'Tiller handle'),
}
const models = pairColumns(world, 'boat').find((c) => c.name === 'model')!
const modelOf = (said: string): string => models.values.find((v) => v.said === said)!.value

describe('what the tiller rule takes, by name', () => {
  it('names the 45 offers: the F25SWTC on five Highfield Classics', () => {
    const taken = pairTaken(tiller, world)
    expect(taken.map((t) => t.maker)).toEqual(['Highfield'])
    expect(taken[0]!.offers).toBe(pairReach(tiller, world).taken)
    expect(taken[0]!.models.map((x) => `${x.said}: ${x.what.join(', ')} (of ${x.made})`)).toEqual([
      'Highfield Classic 340: Yamaha F25SWTC (of 3)',
      'Highfield Classic 360: Yamaha F25SWTC (of 2)',
      'Highfield Classic 360 LS: Yamaha F25SWTC (of 2)',
      'Highfield Classic 380: Yamaha F25SWTC (of 2)',
      'Highfield Classic 380 LS: Yamaha F25SWTC (of 2)',
    ])
  })

  it('tries it on one boat: the Classic 340 keeps two Yamahas and loses the F25SWTC', () => {
    const cl = pairBoats(world, 'motor').find((b) => b.said === 'Highfield Classic 340')!
    const read = pairOnBoat(tiller, world, cl.key)!
    expect(read.about).toBe(true)
    expect(read.items.map((i) => `${i.what} ${i.verdict}`)).toEqual([
      'Yamaha F20SMHB keeps',
      'Yamaha F25SMHC keeps',
      'Yamaha F25SWTC taken',
    ])
  })

  it('leaves no boat with nothing', () => {
    expect(pairEmpties(tiller, world)).toEqual([])
  })
})

describe('said before it is added', () => {
  const ultra: PairShape = {
    boat: side('boat::model', 'eq', modelOf('Stabicraft 2350 Ultra Centrecab')),
    partnerKind: 'trailer',
    partner: side('trailer::series', 'eq', 'ALLOY CENTRE-LINE SERIES'),
  }

  it('the Ultra Centrecab trailer rule would leave the boat offered no trailer: 3 of 3 taken', () => {
    expect(pairReach(ultra, world).taken).toBe(3)
    expect(pairEmpties(ultra, world)).toEqual([
      { said: 'Stabicraft 2350 Ultra Centrecab', made: 3, with: [] },
    ])
  })

  it('a rule that asks for one thing and another that asks for its opposite clash', () => {
    const filed = (shape: PairShape, id: string): ConstraintDef => ({
      ...pairRule({
        orgId: 'northside',
        boat: { column: null, op: 'eq', value: '' },
        partnerKind: 'motor',
        partner: { column: null, op: 'eq', value: '' },
        because: 'x',
        severity: 'block',
        enabled: true,
        now: '2026-11-03T00:00:00.000Z',
      }),
      id,
      if: { combinator: 'AND', clauses: [clause(shape.boat, `${id}#if0`)] },
      then: { combinator: 'AND', clauses: [clause(shape.partner, `${id}#then0`)] },
    })
    const clause = (s: PairShape['boat'], id: string) => ({
      id,
      left: { fieldId: s.fieldId },
      op: s.op,
      right: { kind: 'literal' as const, value: s.value },
    })
    const remoteOnly = filed(
      { ...tiller, partner: side('motor::controls', 'neq', 'Tiller handle') },
      'other',
    )
    expect(pairShapeOf(remoteOnly, world)).not.toBeNull()
    expect(pairClashes(tiller, world, [remoteOnly]).map((c) => c.ruleId)).toEqual(['other'])
  })
})

describe('"and" and "except", and a model said as a person says it', () => {
  it('an exception spares the model it names, and only it', () => {
    const except: PairShape = {
      ...tiller,
      also: [side('boat::model', 'neq', modelOf('Highfield Classic 340'))],
    }
    expect(pairReach(except, world).taken).toBe(pairReach(tiller, world).taken - 9)
    expect(pairTaken(except, world)[0]!.models.map((x) => x.said)).not.toContain(
      'Highfield Classic 340',
    )
  })

  it('files and reads back with its "and", the sentence the dealer wrote', () => {
    const cols = pairColumns(world, 'boat')
    const col = (name: string) => cols.find((c) => c.name === name)!
    const rule = pairRule({
      orgId: 'northside',
      boat: { column: col('maker'), op: 'eq', value: 'Stacer' },
      also: [{ column: col('length'), op: 'gt', value: '6' }],
      partnerKind: 'motor',
      partner: {
        column: pairColumns(world, 'motor').find((c) => c.name === 'horsepower')!,
        op: 'gte',
        value: '90',
      },
      because: 'a hull that long wants the power to plane',
      severity: 'block',
      enabled: true,
      now: '2026-11-03T00:00:00.000Z',
    })
    expect(rule.if.clauses).toHaveLength(2)
    const shape = pairShapeOf(rule, world)!
    expect(pairSaid(shape)).toBe(
      'When the boat’s maker is Stacer and its length is over 6 m, the motor’s horsepower must be at least 90 hp.',
    )
    /* a Stacer of 6 m or under is not one it speaks of */
    const stacer = world.entities['boat_stacer']!
    const motor = world.entities['mot_yamaha']!
    const small = (world.rowsByEntity[stacer.id] ?? []).find((r) => {
      const len = specValue(specByKey('boat::length')!, stacer, r)
      return typeof len === 'number' && len <= 6
    })!
    const anyMotor = { table: motor, row: world.rowsByEntity[motor.id]![0]! }
    expect(judgePair(shape, { table: stacer, row: small }, anyMotor)).toBe('not-about')
  })

  it('says a boat model, a trailer series and a motor model the way a person says them', () => {
    expect(models.values.find((v) => v.value === '495 - Pro Fisher.')?.said).toBe(
      'Surtees 495 Pro Fisher',
    )
    expect(models.values.find((v) => v.value === '495 - Pro Fisher.')?.group).toBe('Surtees')
    const series = pairColumns(world, 'trailer').find((c) => c.name === 'series')!
    expect(series.values.find((v) => v.value === 'ALLOY CENTRE-LINE SERIES')?.said).toBe(
      'Alloy Centre-Line Series',
    )
    expect(pairColumns(world, 'motor').some((c) => c.name === 'model')).toBe(true)
  })
})

describe('on the quotes standing on this computer', () => {
  it('names a quote whose boat it speaks of, and the line on it that it refuses', () => {
    const table = world.entities['boat_highfield']!
    const cl = pairBoats(world, 'motor').find((b) => b.said === 'Highfield Classic 340')!
    const row = (world.rowsByEntity[table.id] ?? []).find((r) => modelKeyOf(table, r) === cl.key)!
    const f25 = (world.rowsByEntity['mot_yamaha'] ?? []).find((r) =>
      JSON.stringify(r.values).includes('F25SWTC'),
    )!
    const quote = {
      id: 'q1',
      reference: 'Q-0001',
      state: 'draft' as const,
      rootTableId: table.id,
      rootRowId: row.id,
      subjectLabel: 'Classic 340',
      lines: [{ entityId: 'mot_yamaha', rowId: f25.id }] as never,
    }
    const on = pairOnQuotes(tiller, world, [quote])
    expect(on.map((q) => [q.reference, q.boat, q.refuses])).toEqual([
      ['Q-0001', 'Highfield Classic 340', ['Yamaha F25SWTC']],
    ])
  })
})
