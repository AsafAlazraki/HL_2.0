/* ============================================================
   A RULE ABOUT A BOAT AND WHAT GOES ON IT, against the real pack.

   The figures below were counted independently of this file, by a
   walk of the price list's own motor pairings (boat Eng
   Configuration × motor Control) before `pairReach` was written:
   1,165 + 512 + 479 + 352 + 342 + 294 = 3,144 pairings on a remote
   boat, none of them a tiller motor; 495 + 45 = 540 on a tiller boat,
   45 of them a remote motor. A figure here that moves is a finding
   about the reading, never a reason to edit the number.

   Since 2026-10-22 a side names a SPEC in the dealer's word
   (`pairSpecs.ts`): the same rules, said "steering" and "controls"
   where they said "Eng Configuration" and "Control", and the same
   counts. The maker, the model and the figures are new, and each is
   held below to a walk of the file written in this test, not to
   the reading it tests.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import {
  isDiscontinued,
  readCell,
  rowLabel,
  type ConstraintDef,
  type EntityDef,
  type RowData,
} from '@/domain/model'
import {
  judgePair,
  pairColumns,
  pairMissing,
  pairReach,
  pairRule,
  pairRuling,
  pairSaid,
  pairShapeOf,
  type PairColumn,
  type PairOp,
  type PartnerKind,
} from './pairRules'
import { shaftInches } from './pairSpecs'
import { countBoats, modelKeyOf } from '@/domain/quote/boats'

const pack = await loadPack()
const world = pack.ctx

const boatCols = pairColumns(world, 'boat')
const motorCols = pairColumns(world, 'motor')
const trailerCols = pairColumns(world, 'trailer')
const col = (cols: PairColumn[], name: string): PairColumn => {
  const hit = cols.find((c) => c.name === name)
  if (!hit) throw new Error(`no spec ${name}`)
  return hit
}

function rule(
  boat: [string, PairOp, string],
  kind: PartnerKind,
  partner: [string, PairOp, string],
  extra: Partial<Pick<ConstraintDef, 'severity' | 'enabled'>> = {},
): ConstraintDef {
  const pc = kind === 'motor' ? motorCols : trailerCols
  return pairRule({
    orgId: 'northside',
    boat: { column: col(boatCols, boat[0]), op: boat[1], value: boat[2] },
    partnerKind: kind,
    partner: { column: col(pc, partner[0]), op: partner[1], value: partner[2] },
    because: 'the hull is set up for a remote helm, and a tiller motor is steered from the engine',
    severity: extra.severity ?? 'block',
    enabled: extra.enabled ?? true,
    now: '2026-10-22T09:00:00.000Z',
  })
}

const remoteNoTiller = rule(['steering', 'eq', 'Remote'], 'motor', [
  'controls',
  'neq',
  'Tiller handle',
])
const tillerTakesTiller = rule(['steering', 'eq', 'Tiller'], 'motor', [
  'controls',
  'eq',
  'Tiller handle',
])

const table = (name: string): EntityDef =>
  Object.values(world.entities).find((e) => e.name === name)!
const row = (t: EntityDef, label: string): RowData =>
  (world.rowsByEntity[t.id] ?? []).find((r) => rowLabel(t, r) === label)!
const onSale = (t: EntityDef): RowData[] =>
  (world.rowsByEntity[t.id] ?? []).filter((r) => !isDiscontinued(r))
const field = (t: EntityDef, name: string): string | undefined =>
  t.fields.find((f) => f.name.trim() === name)?.id
const liveOf = (kind: string): EntityDef[] =>
  Object.values(world.entities).filter((t) => t.kind === kind && !t.retired)

describe('the specs a pair sentence may name, in the dealer’s words', () => {
  /* ONE PRICE LIST, ONE SIZE (built-critique-m3-2.md, major 4): a boat is counted as the
     picker, Home and Data count it — a model (countBoats) — so the 565 remote and 245 tiller
     lines are 228 and 61 models, and they add up to the picker's 289 */
  it('offers the boat’s steering with its two values, counted in models on sale', () => {
    expect(col(boatCols, 'steering').values).toEqual([
      { value: 'Remote', said: 'remote', count: 228 },
      { value: 'Tiller', said: 'tiller', count: 61 },
    ])
    const all = countBoats(world.entities, world.rowsByEntity).boats
    expect(all).toBe(289)
    expect(228 + 61).toBe(all)
  })

  it('offers the motor’s controls, Tiller handle on 38 motors', () => {
    expect(col(motorCols, 'controls').values.find((v) => v.value === 'Tiller handle')?.count).toBe(
      38,
    )
  })

  it('names a maker, a model and a figure, and never a header, a code, a cost or bookkeeping', () => {
    const names = [...boatCols, ...motorCols, ...trailerCols].map((c) => c.name)
    for (const header of [
      'Eng Configuration',
      'Shaft Lgth',
      'Matrix',
      'Head/s',
      'Boat Rego Decals',
      'Model Code',
      'Source',
      'Cash',
      'Sell Price',
    ])
      expect(names).not.toContain(header)
    expect(boatCols.map((c) => c.name)).toEqual([
      'maker',
      'series',
      'model',
      'steering',
      'shaft',
      'length',
      'max hp',
    ])
    expect(motorCols.map((c) => c.name)).toContain('horsepower')
    expect(trailerCols.map((c) => c.name)).toContain('ATM')
  })

  it('the boat’s makers are its lists, each counted in the models Home’s doors print', () => {
    const makers = col(boatCols, 'maker').values
    const byList = countBoats(world.entities, world.rowsByEntity).byMaker
    expect(makers.find((m) => m.value === 'Highfield')?.count).toBe(67)
    expect(makers.find((m) => m.value === 'Stacer')?.count).toBe(91)
    expect(makers.map((m) => m.count).toSorted((a, b) => a - b)).toEqual(
      byList
        .filter((m) => m.boats > 0)
        .map((m) => m.boats)
        .toSorted((a, b) => a - b),
    )
    expect(makers.reduce((sum, m) => sum + m.count, 0)).toBe(289)
    expect(makers.map((m) => m.value)).toContain('Haines Signature')
  })

  it('says one shaft in inches on both sides, by the price list’s own fold', () => {
    expect(['S', 'SS', 'L', 'LS', 'XL', 'UL', 'XXL'].map((s) => shaftInches(s))).toEqual([
      15, 15, 20, 20, 25, 30, 30,
    ])
    expect(shaftInches('25"')).toBe(25)
    expect(shaftInches('Sng UL / Twin XL')).toBeNull()
    expect(col(boatCols, 'shaft').values.map((v) => v.said)).toEqual([
      'short (15″)',
      'long (20″)',
      'extra-long (25″)',
      'ultra-long (30″)',
    ])
    expect(col(motorCols, 'shaft').values.map((v) => v.value)).toEqual(['15', '20', '25', '30'])
  })

  it('a figure is offered with its spread on sale, never a list', () => {
    const length = col(boatCols, 'length')
    expect(length.measure).toBe('figure')
    expect(length.values).toEqual([])
    expect(length.spread!.lo).toBeGreaterThan(2)
    expect(length.spread!.hi).toBeLessThan(20)
  })
})

describe('reading a filed rule as a pair', () => {
  it('reads the rule back as the sentence it was written as', () => {
    const shape = pairShapeOf(remoteNoTiller, world)!
    expect(pairSaid(shape)).toBe(
      'When the boat’s steering is remote, the motor’s controls must not be Tiller handle.',
    )
  })

  it('reads a rule filed before specs, on a column’s own id, as the spec it is', () => {
    const boats = table('Highfield Inflatables')
    const motors = table('Yamaha Outboards')
    const old: ConstraintDef = {
      ...tillerTakesTiller,
      if: {
        combinator: 'AND',
        clauses: [
          {
            id: 'x#if0',
            left: { fieldId: field(boats, 'Shaft Lgth')! },
            op: 'eq',
            right: { kind: 'literal', value: 'L' },
          },
        ],
      },
      then: {
        combinator: 'AND',
        clauses: [
          {
            id: 'x#then0',
            left: { fieldId: field(motors, 'Control')! },
            op: 'eq',
            right: { kind: 'literal', value: 'Tiller handle' },
          },
        ],
      },
    }
    expect(pairSaid(pairShapeOf(old, world)!)).toBe(
      'When the boat’s shaft is long (20″), the motor’s controls must be Tiller handle.',
    )
  })

  it('is not a pair when it is about one kind only', () => {
    const one: ConstraintDef = {
      ...remoteNoTiller,
      then: { combinator: 'AND', clauses: [{ ...remoteNoTiller.if.clauses[0]! }] },
    }
    expect(pairShapeOf(one, world)).toBeNull()
  })

  it('says the first thing still to choose, and asks for the because last', () => {
    const shape = pairShapeOf(remoteNoTiller, world)!
    expect(pairMissing(shape, '')).toBe('Say why, so the build can say it where it refuses.')
    expect(pairMissing({ ...shape, partner: { ...shape.partner, value: '' } }, 'x')).toBe(
      'Choose the motor’s controls.',
    )
    expect(pairMissing(shape, 'because')).toBeNull()
  })

  it('asks for a figure as a figure', () => {
    const r = rule(['length', 'gt', '6'], 'motor', ['horsepower', 'gte', '90'])
    const shape = pairShapeOf(r, world)!
    expect(pairSaid(shape)).toBe(
      'When the boat’s length is over 6 m, the motor’s horsepower must be at least 90 hp.',
    )
    expect(pairMissing({ ...shape, boat: { ...shape.boat, value: '' } }, 'x')).toBe(
      'Type the boat’s length, in metres.',
    )
    expect(pairMissing({ ...shape, boat: { ...shape.boat, value: 'six' } }, 'x')).toBe(
      'The boat’s length is a figure: type it as digits, like 6 or 150.',
    )
  })
})

describe('what a rule reaches before it is on', () => {
  it('a remote boat never takes a tiller motor: 228 models, 38 motors, nothing the list makes', () => {
    const reach = pairReach(pairShapeOf(remoteNoTiller, world)!, world)
    /* the boats are the picker's 289 models, never the 810 lines behind them */
    expect(reach.boats).toBe(289)
    expect(reach.about).toBe(228)
    expect(reach.partners).toBe(241)
    expect(reach.refused).toBe(38)
    expect(reach.made).toBe(3144)
    expect(reach.taken).toBe(0)
    /* so the sale it changes is a search past the list, on a real boat */
    expect(reach.example?.made).toBe(false)
    expect(reach.example?.boat).toMatch(/^\S+ /)
    expect(reach.example?.names.length).toBe(3)
    expect(reach.example?.more).toBeGreaterThan(0)
  })

  it('a tiller boat must take a tiller motor: it takes 45 of the 540 the list makes away', () => {
    const reach = pairReach(pairShapeOf(tillerTakesTiller, world)!, world)
    expect(reach.about).toBe(61)
    expect(reach.made).toBe(540)
    expect(reach.taken).toBe(45)
    expect(reach.boatsLosing).toBe(45)
    /* 45 lines of five models: the colours of one model are one sale */
    expect(reach.modelsLosing).toBe(5)
    expect(reach.example?.made).toBe(true)
    expect(reach.example?.boat).toBe('Highfield Classic 340')
    expect(reach.example?.names).toContain('Yamaha F25SWTC')
  })

  it('names the same boat on every reading, whatever order the lists arrive in', () => {
    const shape = pairShapeOf(tillerTakesTiller, world)!
    const reversed = {
      entities: Object.fromEntries(Object.entries(world.entities).reverse()),
      rowsByEntity: Object.fromEntries(
        Object.entries(world.rowsByEntity).map(([k, rows]) => [k, [...rows].reverse()]),
      ),
    }
    expect(pairReach(shape, reversed).example).toEqual(pairReach(shape, world).example)
    const search = pairShapeOf(remoteNoTiller, world)!
    expect(pairReach(search, reversed).example).toEqual(pairReach(search, world).example)
  })

  it('a maker: a Haines Signature boat is every boat on its own list, and no other', () => {
    const haines = table('Haines Signature')
    const r = rule(['maker', 'eq', 'Haines Signature'], 'motor', ['horsepower', 'lte', '150'])
    const reach = pairReach(pairShapeOf(r, world)!, world)
    expect(reach.about).toBe(onSale(haines).length)
    /* every Yamaha over 150 hp per motor, counted off its own HP Rating here */
    const yamaha = table('Yamaha Outboards')
    const hp = field(yamaha, 'HP Rating')!
    const over = onSale(yamaha).filter((m) => {
      const t = String(readCell(m, hp) ?? '')
      const each = /^(?:\d+\s*x\s*)?(\d+(?:\.\d+)?)$/.exec(t.trim())
      return each !== null && Number(each[1]) > 150
    }).length
    expect(reach.refused).toBe(over)
  })

  it('a figure: a boat over 6 m is every boat whose own length says so', () => {
    const r = rule(['length', 'gt', '6'], 'motor', ['horsepower', 'gte', '90'])
    const reach = pairReach(pairShapeOf(r, world)!, world)
    const counted = new Set<string>()
    for (const t of liveOf('boat')) {
      const ids = [
        'Hull Length (Mtr)',
        'Hull Length',
        'Hull Length (mtr)',
        'OA Length',
        'Length (mtr)',
      ]
        .map((n) => field(t, n))
        .filter((id): id is string => id !== undefined)
      for (const b of onSale(t)) {
        const v = ids.map((id) => readCell(b, id)).find((x) => typeof x === 'number' && x > 0)
        if (typeof v === 'number' && v > 6) counted.add(modelKeyOf(t, b))
      }
    }
    expect(counted.size).toBeGreaterThan(0)
    expect(reach.about).toBe(counted.size)
  })

  it('counts the trailers every other screen counts: 434 on sale', () => {
    const r = rule(['steering', 'eq', 'Tiller'], 'trailer', ['ATM', 'gte', '1000'])
    expect(pairReach(pairShapeOf(r, world)!, world).partners).toBe(434)
  })
})

describe('judging one pick', () => {
  const boats = table('Highfield Inflatables')
  const motors = table('Yamaha Outboards')
  const tillerBoat = (world.rowsByEntity[boats.id] ?? []).find((r) =>
    rowLabel(boats, r).startsWith('Highfield - CL340'),
  )!
  const remoteMotor = row(motors, 'Yamaha - F25SWTC')
  const tillerMotor = (world.rowsByEntity[motors.id] ?? []).find((r) =>
    rowLabel(motors, r).startsWith('Yamaha - F4SMHA'),
  )!

  it('refuses a remote motor on a tiller boat, and keeps a tiller one', () => {
    const shape = pairShapeOf(tillerTakesTiller, world)!
    const boat = { table: boats, row: tillerBoat }
    expect(judgePair(shape, boat, { table: motors, row: remoteMotor })).toBe('breaks')
    expect(judgePair(shape, boat, { table: motors, row: tillerMotor })).toBe('keeps')
  })

  it('a figure judges a figure: the F25SWTC is not over 30 hp, so a rule asking for one refuses it', () => {
    const shape = pairShapeOf(
      rule(['steering', 'eq', 'Tiller'], 'motor', ['horsepower', 'gt', '30']),
      world,
    )!
    const boat = { table: boats, row: tillerBoat }
    expect(judgePair(shape, boat, { table: motors, row: remoteMotor })).toBe('breaks')
  })

  it('a blank never refuses: an electric motor with no horsepower is not judged', () => {
    const electric = table('ePropulsion Outboards')
    const shape = pairShapeOf(
      rule(['steering', 'eq', 'Tiller'], 'motor', ['horsepower', 'lte', '30']),
      world,
    )!
    expect(
      judgePair(
        shape,
        { table: boats, row: tillerBoat },
        { table: electric, row: world.rowsByEntity[electric.id]![0]! },
      ),
    ).toBe('not-about')
  })

  it('a rule switched off refuses nothing, and a warning never refuses', () => {
    const boat = { table: boats, row: tillerBoat }
    const pick = { table: motors, row: remoteMotor }
    expect(pairRuling(world, [tillerTakesTiller]).pick(boat, pick).refusedBy?.id).toBe(
      tillerTakesTiller.id,
    )
    expect(
      pairRuling(world, [{ ...tillerTakesTiller, enabled: false }]).pick(boat, pick).refusedBy,
    ).toBeNull()
    const warned = pairRuling(world, [{ ...tillerTakesTiller, severity: 'warn' }]).pick(boat, pick)
    expect(warned.refusedBy).toBeNull()
    expect(warned.warnedBy).toHaveLength(1)
  })
})
