/* ============================================================
   ONE BOAT, READ — the SP660 the fitment board was drawn on.

   Every figure below is counted off the real price list, and the one the
   fitment verdict asked to be fixed before anything was built is asserted
   first: the trailers add up to ONE universe. Board C said "12 of 434" and
   "the other 432" over reasons summing to 442, because the ten no longer
   sold sat outside the 434 on sale. Here what is made for the boat plus
   every counted reason is what is on sale, for every boat on the list, and
   what is no longer sold is said beside it, never inside it.
   ============================================================ */
import { describe, expect, it, vi } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { readCell, rowLabel } from '@/domain/model'
import { buildConcepts, fieldOn, representativeFieldId } from '@/domain/rules/constraints/columns'
import type { ConstraintDef } from '@/domain/model'
import { pairColumns, pairRule } from '@/domain/rules/constraints/pairRules'
import {
  boatMakers,
  findBoats,
  offeredIn,
  offeredOf,
  readBoatFit,
  readWhole,
  refusedByRule,
  refusedIn,
} from './boat'
import { ONE_TRAILER, RULE_REFUSES, refusedSaid } from './say'
import { countBoats } from '@/domain/quote/boats'
import { makerDoors } from '@/domain/catalogue/makers'

vi.setConfig({ testTimeout: 60_000 })

const pack = await loadPack()
const ctx = pack.ctx
const highfield = pack.byKey('boat_highfield')
const sp660 = (pack.rowsByEntity[highfield.id] ?? []).find(
  (r) => rowLabel(highfield, r) === 'Highfield - SP660 (PVC) W-W-WB',
)!
const place = { tableId: highfield.id, rowId: sp660.id }
const fit = readBoatFit(ctx, place)!

describe('the boat', () => {
  it('names it as a dealer does, with its own code and picture address', () => {
    expect(fit.name).toBe('Highfield Sport 660')
    expect(fit.path).toEqual(['Sport', 'SP660', 'PVC W-W-WB'])
    expect(fit.code).toBe('HBS145')
    expect(fit.imageAddress).toContain('SP660-W-W-WB-top-view')
    expect(fit.priceName).toBe('Cash')
  })

  it('is null for something that is not a boat', () => {
    expect(readBoatFit(ctx, { tableId: 'mot_yamaha', rowId: 'mot_yamaha:1' })).toBeNull()
    expect(readBoatFit(ctx, { tableId: highfield.id, rowId: 'nope' })).toBeNull()
  })
})

describe('the motor', () => {
  const motor = fit.motor!

  it('takes 150–200 hp, from the boat’s own row', () => {
    expect(motor.takes).toBe('150–200 hp')
  })

  it('counts all 209 Yamahas into one of five places, with nothing left over', () => {
    const c = motor.counts
    expect(c).toMatchObject({
      live: 209,
      made: 7,
      refused: 0,
      inside: 30,
      under: 74,
      over: 51,
      rigs: 47,
    })
    expect(c.made + c.refused + c.inside + c.under + c.over + c.unplaced + c.rigs + c.unrated).toBe(
      c.live,
    )
    expect(motor.dots).toHaveLength(209 - 47)
  })

  it('stars the F175XC and gives it the price and the rigging kit the build would', () => {
    const star = motor.made[0]!
    expect(star.starred).toBe(true)
    expect(star.name).toBe('Yamaha F175XC')
    expect(star.price).toBe(25355)
    expect(star.goesWith.find((f) => f.label === 'Rigging Kit Option')?.value).toContain(
      'Mech Rigging Kit - 703 Side Mount',
    )
    expect(star.pairing?.tableId).toBe('join_hf_yam')
  })

  it('gives every dot not made for the boat a reason, and the made ones none', () => {
    for (const dot of motor.dots) {
      if (dot.standing === 'made') expect(dot.because).toBe('')
      else expect(dot.because).not.toBe('')
    }
    const small = motor.dots.find((d) => d.hp === 2.5)!
    expect(small.because).toBe('Under the 150–200 hp this boat takes.')
    const inside = motor.dots.find((d) => d.standing === 'inside')!
    expect(inside.because).toBe(
      'Not made for this boat, though it is inside the 150–200 hp it takes.',
    )
  })
})

describe('the trailer', () => {
  const trailer = fit.trailer!

  it('adds what is made for the boat and every reason up to the 434 on sale', () => {
    expect(trailer.onSale).toBe(434)
    expect(trailer.made).toHaveLength(2)
    expect(trailer.groups.map((g) => [g.id, g.count])).toEqual([
      ['this', 10],
      ['another', 131],
      ['unnamed', 291],
    ])
    expect(trailer.made.length + trailer.groups.reduce((n, g) => n + g.count, 0)).toBe(434)
    /* the other 432, counted here so the screen only says it */
    expect(trailer.others).toBe(432)
    expect(trailer.held).toEqual({ count: 10, lists: ['OBSOLETE Trailers — No Longer Available'] })
  })

  it('holds on one universe for every boat on the price list', () => {
    for (const table of pack.entities) {
      if (table.kind !== 'boat') continue
      for (const row of pack.rowsByEntity[table.id] ?? []) {
        const t = readBoatFit(ctx, { tableId: table.id, rowId: row.id })?.trailer
        if (!t) continue
        const sum = t.made.length + t.groups.reduce((n, g) => n + g.count, 0)
        expect(sum, rowLabel(table, row)).toBe(t.onSale)
        expect(t.made.length + t.others, rowLabel(table, row)).toBe(t.onSale)
        for (const g of t.groups) expect(g.members).toHaveLength(g.count)
      }
    }
  })

  it('puts the starred REDCO on the quote and offers the GFAB in its place, by the rule', () => {
    const [first, second] = trailer.made
    expect(first?.crosses).toBe(true)
    expect(first?.starred).toBe(true)
    expect(first?.label).toContain('TA600T-MOB')
    expect(first?.price).toBe(12643)
    expect(first?.floorSays).toBe('Rated 1,990 kg · the boat weighs 740 kg · clears it by 1,250 kg')
    expect(second?.crosses).toBe(false)
    expect(second?.price).toBe(24723)
    expect(trailer.oneTrailer).toBe(ONE_TRAILER)
  })

  it('names the six makers the other trailers are built for, most first, a range under its maker', () => {
    const another = trailer.groups.find((g) => g.id === 'another')!
    /* Cap Camarat and Merry Fisher are Jeanneau's ranges, not makers (built-critique-m3.md) */
    expect(another.makers.map((m) => [m.maker, m.count])).toEqual([
      ['Stacer', 34],
      ['Stabicraft', 26],
      ['Formosa', 24],
      ['Surtees', 22],
      ['Haines', 16],
      ['Jeanneau', 9],
    ])
    expect(another.head).toBe('Built for another boat, across 6 makers.')
    expect(another.makers[0]!.example.because).toBe('Built for Stacer, not Highfield.')
    expect(another.makers[0]!.example.series).not.toBe('')
    const jeanneau = another.makers.find((m) => m.maker === 'Jeanneau')!
    expect(jeanneau.because).toBe('Built for Jeanneau Cap Camarat and Merry Fisher, not Highfield.')
    expect(another.members.filter((m) => m.maker === 'Jeanneau')).toHaveLength(9)
    expect(
      another.members.some((m) => /Built for (Cap Camarat|Merry Fisher)/.test(m.because)),
    ).toBe(false)
  })

  it('opens Show all with one group per maker, every member under it', () => {
    const whole = readWhole(ctx, fit, 'trailer')!
    const jeanneau = whole.groups.find((g) => g.id === 'another:Jeanneau')!
    expect(jeanneau.head).toBe('Built for Jeanneau Cap Camarat and Merry Fisher, not Highfield.')
    expect(jeanneau.rows).toHaveLength(9)
  })

  it('draws the same struck example on every load, whatever order the lists arrived in', () => {
    const reversed = Object.fromEntries(
      Object.entries(ctx.rowsByEntity).map(([id, rows]) => [id, rows.toReversed()]),
    )
    const shuffled = readBoatFit(
      {
        ...ctx,
        entities: Object.fromEntries(Object.entries(ctx.entities).toReversed()),
        rowsByEntity: reversed,
      },
      place,
    )!
    const examples = (f: typeof fit) =>
      f.trailer!.groups.map((g) => [g.members[0]?.key, ...g.makers.map((m) => m.example.key)])
    expect(examples(shuffled)).toEqual(examples(fit))
    expect(shuffled.lists.map((l) => l.name)).toEqual(fit.lists.map((l) => l.name))
  })
})

describe('the rest of what the boat’s page lists', () => {
  it('counts dealer fit and parts against their whole lists, and leaves the rigging kits with the motor', () => {
    const named = fit.lists.map((l) => [l.name, l.made.length, l.live])
    /* the dealer's own fit-out first, on every load (built-critique-m3.md: 3 and 4 swapped) */
    expect(named).toEqual([
      ['Dealer Fit Packages', 4, 1576],
      ['Parts & Accessories', 3, 2238],
    ])
  })
})

describe('a dealer’s own rule', () => {
  it('strikes the motors it refuses with the rule’s own because, and leaves the rest alone', () => {
    const concepts = buildConcepts(ctx.entities)
    const series = concepts.find((c) => c.key === 'boat::series')!
    const control = concepts.find((c) => c.key === 'motor::control')!
    const yamaha = pack.byKey('mot_yamaha')
    const controlOf = (rowId: string): string => {
      const field = fieldOn(control, yamaha)!
      const row = (pack.rowsByEntity[yamaha.id] ?? []).find((r) => r.id === rowId)!
      return String(readCell(row, field.id))
    }
    const starred = fit.motor!.made[0]!
    /* a control the starred motor does NOT have, read off the price list */
    const other = (pack.rowsByEntity[yamaha.id] ?? [])
      .map((r) => controlOf(r.id))
      .find((v) => v !== controlOf(starred.place.rowId) && v !== 'null')!
    const BECAUSE = 'a Sport is rigged the one way the dealer rigs it'
    const rule: ConstraintDef = {
      id: 'test:fitment',
      orgId: 'northside',
      kind: 'implies',
      if: {
        combinator: 'AND',
        clauses: [
          {
            id: 'if-1',
            left: { fieldId: representativeFieldId(series) },
            op: 'eq',
            right: { kind: 'literal', value: 'Sport' },
          },
        ],
      },
      then: {
        combinator: 'AND',
        clauses: [
          {
            id: 'then-1',
            left: { fieldId: representativeFieldId(control) },
            op: 'eq',
            right: { kind: 'literal', value: other },
          },
        ],
      },
      because: BECAUSE,
      severity: 'block',
      enabled: true,
      createdAt: '2026-10-22T00:00:00.000Z',
      updatedAt: '2026-10-22T00:00:00.000Z',
    }
    const ruled = readBoatFit({ ...ctx, constraintDefs: [rule] }, place)!
    expect(ruled.rulesInForce).toBe(1)
    const star = ruled.motor!.made[0]!
    expect(star.rule).toEqual({
      constraintId: 'test:fitment',
      because: BECAUSE,
      severity: 'blocked',
    })
    /* switched off, it says nothing */
    const off = readBoatFit({ ...ctx, constraintDefs: [{ ...rule, enabled: false }] }, place)!
    expect(off.rulesInForce).toBe(0)
    expect(off.motor!.made.every((m) => m.rule === null)).toBe(true)
    expect(fit.motor!.made.every((m) => m.rule === null)).toBe(true)
  })
})

/* THE COUNT OVER A LIST IS THE COUNT THE BUILD OFFERS (built-critique-m3.md, blocker 4). The
   critic's own case: the rule "a tiller boat must take a tiller motor", written on /rules, on the
   Highfield Classic 340 (PVC), whose price list makes three Yamahas for it. It refuses the
   F25SWTC, and Fitment said "3 of 209 made for this boat" beside the struck motor while the build
   offered 2. The figures here were counted by the critic on the built screens. */
describe('what a dealer’s rule refuses is not counted as made for this boat', () => {
  const boatCols = pairColumns(ctx, 'boat')
  const motorCols = pairColumns(ctx, 'motor')
  const tillerTakesTiller = pairRule({
    orgId: 'northside',
    boat: { column: boatCols.find((c) => c.name === 'steering')!, op: 'eq', value: 'Tiller' },
    partnerKind: 'motor',
    partner: {
      column: motorCols.find((c) => c.name === 'controls')!,
      op: 'eq',
      value: 'Tiller handle',
    },
    because: 'a tiller boat has no helm to steer a remote motor from',
    severity: 'block',
    enabled: true,
    now: '2026-10-22T09:00:00.000Z',
  })
  const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
    (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
  )!
  const at = { tableId: highfield.id, rowId: cl340.id }
  const before = readBoatFit(ctx, at)!
  const ruled = readBoatFit({ ...ctx, constraintDefs: [tillerTakesTiller] }, at)!

  it('counts three made for the Classic 340 with no rule, and two once the rule refuses one', () => {
    expect(before.motor!.made).toHaveLength(3)
    expect(before.motor!.counts).toMatchObject({ made: 3, refused: 0 })
    expect(offeredOf(before.motor!.made)).toEqual({ offered: 3, refused: 0, rules: 0 })

    const motor = ruled.motor!
    /* the refused motor is still drawn, struck, with the rule's own because */
    expect(motor.made).toHaveLength(3)
    const struck = motor.made.filter((m) => m.rule?.severity === 'blocked')
    expect(struck.map((m) => m.name)).toEqual(['Yamaha F25SWTC'])
    expect(struck[0]!.rule!.because).toBe('a tiller boat has no helm to steer a remote motor from')
    expect(motor.counts).toMatchObject({ live: 209, made: 2, refused: 1 })
    expect(offeredOf(motor.made)).toEqual({ offered: 2, refused: 1, rules: 1 })
    const c = motor.counts
    expect(c.made + c.refused + c.inside + c.under + c.over + c.unplaced + c.rigs + c.unrated).toBe(
      c.live,
    )
  })

  it('opens the whole list on the two offered, and the refused one apart under its own reason', () => {
    const whole = readWhole({ ...ctx, constraintDefs: [tillerTakesTiller] }, ruled, 'motor')!
    expect(whole).toMatchObject({ total: 209, made: 2, refused: 1 })
    const made = whole.groups.find((g) => g.id === 'made')!
    const apart = whole.groups.find((g) => g.id === 'ruled')!
    expect(made.rows.map((r) => r.name)).not.toContain('Yamaha F25SWTC')
    expect(made.rows).toHaveLength(2)
    expect(apart.head).toBe(RULE_REFUSES)
    expect(apart.rows.map((r) => r.name)).toEqual(['Yamaha F25SWTC'])
    /* and nothing on sale is lost or counted twice between the groups */
    expect(whole.groups.reduce((n, g) => n + g.rows.length, 0)).toBe(whole.total)
    /* with no rule there is no such group */
    const plain = readWhole(ctx, before, 'motor')!
    expect(plain.groups.some((g) => g.id === 'ruled')).toBe(false)
  })

  /* ONE DERIVATION (built-critique-m3.md m3, blocker 2): Fitment's trailer list re-derived what a
     rule leaves offered beside `offeredOf`; the list drawn and the count over it now read one
     predicate, so they cannot drift apart */
  it('draws exactly what it counts as offered, and strikes exactly what it counts as refused', () => {
    const made = ruled.motor!.made
    expect(offeredIn(made).map((m) => m.name)).not.toContain('Yamaha F25SWTC')
    expect(offeredIn(made)).toHaveLength(offeredOf(made).offered)
    expect(refusedIn(made).map((m) => m.name)).toEqual(['Yamaha F25SWTC'])
    expect(refusedIn(made)).toHaveLength(offeredOf(made).refused)
    expect(made.filter(refusedByRule)).toEqual(refusedIn(made))
    /* a rule that only warns leaves the motor offered, as the build offers it */
    const warned = made.map((m) =>
      m.rule ? { ...m, rule: { ...m.rule, severity: 'warned' as const } } : m,
    )
    expect(offeredIn(warned)).toHaveLength(3)
    expect(offeredOf(warned)).toEqual({ offered: 3, refused: 0, rules: 0 })
  })

  it('says the refused count in the dealer’s words, and nothing where none is refused', () => {
    expect(refusedSaid(1, 1)).toBe('1 refused by your rule')
    expect(refusedSaid(3, 2)).toBe('3 refused by your rules')
    expect(refusedSaid(0, 0)).toBe('')
  })
})

describe('finding a boat', () => {
  it('finds the SP660 by its words or its code, word by word', () => {
    const byWords = findBoats(ctx, 'sport 660 pvc')
    expect(byWords.found.some((b) => b.place.rowId === sp660.id)).toBe(true)
    expect(findBoats(ctx, 'HBS145').found[0]?.place.rowId).toBe(sp660.id)
    expect(findBoats(ctx, '   ').matched).toBe(0)
  })
})

describe('every boat, by maker and model', () => {
  const makers = boatMakers(ctx)

  /* ONE PRICE LIST, ONE SIZE (built-critique-m3-2.md, major 4): the chooser said "Highfield 69
     models · 588 versions" beside a Home and a picker that say 67, and 810 boats beside 289 */
  it('counts every maker in models exactly as Home, Data and the picker do (countBoats)', () => {
    expect(makers.map((m) => [m.maker, m.boats, m.lines])).toEqual([
      ['Formosa', 39, 39],
      ['Haines Signature', 9, 9],
      ['Highfield', 67, 588],
      ['Jeanneau', 27, 27],
      ['Stabicraft', 37, 37],
      ['Stacer', 91, 91],
      ['Surtees', 19, 19],
    ])
    const counted = countBoats(ctx.entities, ctx.rowsByEntity)
    expect(makers.reduce((n, m) => n + m.boats, 0)).toBe(counted.boats)
    expect(counted.boats).toBe(289)
    const doors = makerDoors(ctx.entities, ctx.rowsByEntity).filter((d) => d.kind === 'boat')
    for (const door of doors) {
      expect(makers.find((m) => m.maker === door.name)?.boats).toBe(door.count)
    }
    for (const m of makers) {
      expect(m.models).toHaveLength(m.boats)
      expect(m.models.reduce((n, model) => n + model.versions.length, 0)).toBe(m.lines)
    }
  })

  it('holds the SP660 among the Highfield Sport 660s, models in the order a person counts', () => {
    const hf = makers.find((m) => m.maker === 'Highfield')!
    const sport = hf.models.find((m) => m.name === 'Highfield Sport 660')!
    expect(sport.versions.some((v) => v.place.rowId === sp660.id)).toBe(true)
    const names = hf.models.map((m) => m.name)
    expect(names.indexOf('Highfield Classic 260')).toBeLessThan(
      names.indexOf('Highfield Classic 310'),
    )
  })

  it('files Highfield’s three Coasters as its one Coaster, and a Stacer line as its own model', () => {
    const hf = makers.find((m) => m.maker === 'Highfield')!
    const coaster = hf.models.filter((m) => m.name === 'Highfield Coaster')
    expect(coaster).toHaveLength(1)
    expect(new Set(coaster[0]!.versions.map((v) => v.name)).size).toBe(3)
    const stacer = makers.find((m) => m.maker === 'Stacer')!
    const skimma = stacer.models.filter((m) => m.name === 'Stacer 319 Skimma')
    expect(skimma.map((m) => m.trim)).toEqual(['', 'HS'])
    expect(skimma.every((m) => m.versions.length === 1)).toBe(true)
  })
})
