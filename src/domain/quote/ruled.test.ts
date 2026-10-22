/* ============================================================
   A NEW DRAFT OBEYS THE DEALER'S RULES — against the real pack.

   built-critique-m3-2.md, blocker 1: with "When the boat's maker is
   Stacer, the motor's horsepower must be at most 20 hp" refusing, a
   new draft on the Stacer 659 Ocean Ranger Cen Cab still opened on the
   price list's starred Yamaha F130XA and the rigging kit for it. The
   boat and the motor are found by their names; the horsepower is read
   off each motor's own row here, not off the reading under test.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { readCell, rowLabel, type EntityDef, type QuoteDef, type RowData } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import {
  pairColumns,
  pairRule,
  type PairOp,
  type PartnerKind,
} from '@/domain/rules/constraints/pairRules'
import { mintQuoteFromView } from './freeze'
import { refusedOnQuote, rulesOnBoat } from './ruled'
import { motorNamedBy } from './kits'

const pack = await loadPack()
const base = pack.ctx

const stacer: EntityDef = pack.byKey('boat_stacer')
const boat = (pack.rowsByEntity[stacer.id] ?? []).find((r: RowData) =>
  rowLabel(stacer, r).includes('659 Ocean Ranger Cen Cab'),
)

function rule(
  boatSide: [string, PairOp, string],
  kind: PartnerKind,
  partner: [string, PairOp, string],
  severity: 'block' | 'warn' = 'block',
) {
  const col = (k: 'boat' | PartnerKind, name: string) => {
    const hit = pairColumns(base, k).find((c) => c.name === name)
    if (!hit) throw new Error(`no spec ${name}`)
    return hit
  }
  return pairRule({
    orgId: base.orgId,
    boat: { column: col('boat', boatSide[0]), op: boatSide[1], value: boatSide[2] },
    partnerKind: kind,
    partner: { column: col(kind, partner[0]), op: partner[1], value: partner[2] },
    because: 'a Stacer this size is sold with a small motor',
    severity,
    enabled: true,
    now: '2026-10-22T09:00:00.000Z',
  })
}

const stacerSmall = rule(['maker', 'eq', 'Stacer'], 'motor', ['horsepower', 'lte', '20'])

function mint(rules: ReturnType<typeof rule>[]): QuoteDef {
  const ctx = { ...base, constraintDefs: rules }
  const view = createViewFor(ctx, stacer.id)
  const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: boat!.id, reference: 'R-1' })
  expect(quote).not.toBeNull()
  return quote!
}

const kindOf = (id: string) => base.entities[id]?.kind
const motorsOn = (q: QuoteDef) => q.lines.filter((l) => kindOf(l.entityId) === 'motor')

/** horsepower off the motor's own row, read here */
function hpOf(entityId: string, rowId: string): number | null {
  const t = base.entities[entityId]!
  const r = (base.rowsByEntity[entityId] ?? []).find((x) => x.id === rowId)!
  const f = t.fields.find((x) => x.name.trim() === 'HP Rating')
  const v = f ? String(readCell(r, f.id) ?? '') : ''
  const m = /(\d+(?:\.\d+)?)\s*$/.exec(v.trim())
  return m ? Number(m[1]) : null
}

describe('a new draft obeys the rules in force on its boat', () => {
  it('without a rule, the Stacer 659 opens on the starred F130XA and its kit', () => {
    expect(boat, 'the pack has no Stacer 659 Ocean Ranger Cen Cab').toBeDefined()
    const q = mint([])
    expect(
      motorsOn(q)
        .map((l) => l.label)
        .join(' '),
    ).toMatch(/F130XA/)
    expect(q.lines.some((l) => /F130XA/i.test(motorNamedBy(l)))).toBe(true)
    /* the horsepower reading below is a real one: the star reads 130 hp off its own row */
    const star = motorsOn(q)[0]!
    expect(hpOf(star.entityId, star.rowId)).toBe(130)
  })

  it('with "a Stacer takes at most 20 hp" refusing, neither the F130XA nor its kit comes across', () => {
    const q = mint([stacerSmall])
    expect(q.lines.some((l) => /F130XA/i.test(l.label))).toBe(false)
    expect(q.lines.some((l) => /F130XA/i.test(motorNamedBy(l)))).toBe(false)
    for (const m of motorsOn(q)) {
      const hp = hpOf(m.entityId, m.rowId)
      expect(hp === null || hp <= 20, `${m.label} at ${hp} hp came across`).toBe(true)
    }
    expect(refusedOnQuote({ ...base, constraintDefs: [stacerSmall] }, q)).toEqual([])
  })

  it('the motors section counts only what is still on offer as waiting', () => {
    const before = mint([])
    const after = mint([stacerSmall])
    const motorSection = (q: QuoteDef) => q.sections.find((s) => kindOf(s.tableId) === 'motor')!
    const ask = rulesOnBoat({ ...base, constraintDefs: [stacerSmall] }, stacer.id, boat!.id)!
    const refusedHere = motorSection(before).pickedCount! - motorSection(after).pickedCount!
    expect(refusedHere).toBeGreaterThan(0)
    expect(ask).not.toBeNull()
  })

  it('a rule that only warns never holds the star back', () => {
    const warn = rule(['maker', 'eq', 'Stacer'], 'motor', ['horsepower', 'lte', '20'], 'warn')
    const q = mint([warn])
    expect(
      motorsOn(q)
        .map((l) => l.label)
        .join(' '),
    ).toMatch(/F130XA/)
  })

  it('a rule switched off says nothing', () => {
    const off = { ...stacerSmall, enabled: false }
    expect(rulesOnBoat({ ...base, constraintDefs: [off] }, stacer.id, boat!.id)).toBeNull()
    expect(
      motorsOn(mint([off]))
        .map((l) => l.label)
        .join(' '),
    ).toMatch(/F130XA/)
  })

  it('a draft made before the rule carries the refused motor, and says which rule refuses it', () => {
    const q = mint([])
    const found = refusedOnQuote({ ...base, constraintDefs: [stacerSmall] }, q)
    expect(found).toHaveLength(1)
    expect(found[0]!.rule.id).toBe(stacerSmall.id)
    expect(found[0]!.lines.map((l) => l.label).join(' ')).toMatch(/F130XA/)
  })

  it('a rule refusing the boat’s starred trailer holds that trailer back too', () => {
    /* the 659's star is a 2000 kg ATM Stacer trailer; a rule capping a Stacer's trailer at
       1500 kg refuses it, and a refused trailer is never a second-best star */
    const q0 = mint([])
    const trailer = q0.lines.find((l) => kindOf(l.entityId) === 'trailer')!
    expect(trailer.label).toMatch(/2000 ATM/)
    const r = rule(['maker', 'eq', 'Stacer'], 'trailer', ['ATM', 'lte', '1500'])
    const q = mint([r])
    expect(q.lines.some((l) => l.rowId === trailer.rowId)).toBe(false)
    expect(refusedOnQuote({ ...base, constraintDefs: [r] }, q)).toEqual([])
    expect(refusedOnQuote({ ...base, constraintDefs: [r] }, q0)[0]!.lines).toEqual([trailer])
  })
})
