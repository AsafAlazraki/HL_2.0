/* ============================================================
   THE CONTRACT'S OWN PROOFS.

   The old `@/types/model` was one file; this one is a folder behind
   a barrel. The first suite is the barrel's promise, measured: every
   runtime name the old file exported resolves from '@/domain/model'.
   Types cannot be listed at runtime; the typecheck of the ported
   modules is their proof. The rest are the additions that carry
   logic — `makeCtx` and `standingOf` — because a helper with no test
   is a helper whose next edit can go quietly wrong.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import * as model from '@/domain/model'
import { makeCtx, standingOf, type Verdict } from '@/domain/model'

/* Every `export const` / `export function` of the old model.ts, in
   the order the file declared them. Read off the file, not recalled. */
const OLD_RUNTIME_EXPORTS = [
  'ACCENT_KEYS',
  'accentVar',
  'FIELD_TYPES',
  'isImageValue',
  'primaryImage',
  'imageCellText',
  'INDUSTRIES',
  'TABLE_KINDS',
  'orgSlug',
  'UNARY_OPS',
  'ELSE_HANDLE',
  'OUT_HANDLE',
  'LOOP_BODY_HANDLE',
  'LOOP_NEXT_HANDLE',
  'MODULE_CAPABILITIES',
  'DEFAULT_CAPABILITIES',
  'canBeModuleMaster',
  'PAIR_ORIGIN_FIELD',
  'PAIR_RECOMMENDED_FIELD',
  'PAIR_ORDER_FIELD',
  'PAIR_FIELDS',
  'isPairFieldId',
  'defaultRuleNodeConfig',
  'RULE_NODE_KINDS',
  'EXPORT_KIND',
  'EXPORT_VERSION',
  'UID_FIELD_ID',
  'UID_FIELD',
  'DISCONTINUED_FIELD_ID',
  'DISCONTINUED_FIELD',
  'isDiscontinued',
  'isRetired',
  'isSystemFieldId',
  'visibleFields',
  'readCell',
  'displayFieldOf',
  'rowLabel',
  'CHARGE_TITLE',
  'QUOTE_LEVEL_ORDER',
  'LEVEL_TITLE',
] as const

describe('the barrel carries every old name', () => {
  it('counts forty runtime exports, so a shortened list cannot pass', () => {
    expect(OLD_RUNTIME_EXPORTS.length).toBe(40)
  })

  for (const name of OLD_RUNTIME_EXPORTS) {
    it(`exports ${name}`, () => {
      expect(name in model, `${name} is missing from '@/domain/model'`).toBe(true)
      expect((model as Record<string, unknown>)[name]).toBeDefined()
    })
  }

  it('keeps the pair fields under their literal ids', () => {
    expect(model.PAIR_FIELDS.map((f) => f.id)).toEqual(['__origin', '__recommended', '__order'])
  })

  it('names the subject chapter with the subject section’s own block id', () => {
    /* freeze.ts `SUBJECT_BLOCK` and steps.ts `SUBJECT_STEP` are both
       '__subject'; the chapter list must file the subject under the
       same id or the walk and the sections disagree about stop one. */
    expect(model.SUBJECT_CHAPTER).toBe('__subject')
    expect(model.HANDOVER_CHAPTER).toBe('__handover')
  })
})

describe('makeCtx', () => {
  it('fills every map and list so a module can read an empty world', () => {
    const ctx = makeCtx()
    expect(ctx.orgId).toBe('')
    expect(ctx.org).toBeUndefined()
    expect(ctx.entities).toEqual({})
    expect(ctx.rowsByEntity).toEqual({})
    expect(ctx.groups).toEqual({})
    expect(ctx.rules).toEqual({})
    expect(ctx.views).toEqual({})
    expect(ctx.modules).toEqual({})
    expect(ctx.roles).toEqual({})
    expect(ctx.access).toEqual({ roleId: null })
    expect(ctx.constraintDefs).toEqual([])
    expect(ctx.discoveredRules).toEqual([])
    expect(ctx.priceLevels).toEqual({})
    expect(ctx.quotes).toEqual([])
    expect(ctx.customers).toEqual([])
  })

  it('keeps what it is given, by reference, and nothing is re-sorted', () => {
    const rows = [
      { id: 'b:2', orgId: 'o', entityId: 'b', values: {}, createdAt: '', updatedAt: '' },
      { id: 'b:1', orgId: 'o', entityId: 'b', values: {}, createdAt: '', updatedAt: '' },
    ]
    const ctx = makeCtx({ orgId: 'o', rowsByEntity: { b: rows } })
    expect(ctx.orgId).toBe('o')
    expect(ctx.rowsByEntity.b).toBe(rows)
    expect(ctx.rowsByEntity.b.map((r) => r.id)).toEqual(['b:2', 'b:1'])
  })

  it('takes an injected clock and otherwise reads the real one as ISO', () => {
    const fixed = makeCtx({ now: () => '2026-09-16T00:00:00.000Z' })
    expect(fixed.now()).toBe('2026-09-16T00:00:00.000Z')
    const real = makeCtx()
    expect(Number.isNaN(Date.parse(real.now()))).toBe(false)
  })
})

describe('standingOf', () => {
  const outside: Verdict = { kind: 'outside-rule', failed: [] }
  const warned: Verdict = { kind: 'warned', constraintId: 'c1', because: 'the hull says so' }
  const unchecked: Verdict = { kind: 'floor-not-evaluable', why: 'no weight column' }
  const held: Verdict = { kind: 'discontinued' }

  it('is offered when nothing disagrees', () => {
    expect(standingOf([])).toBe('offered')
  })

  it('ranks held over outside over flagged over unchecked, whatever the order', () => {
    expect(standingOf([unchecked])).toBe('unchecked')
    expect(standingOf([unchecked, warned])).toBe('flagged')
    expect(standingOf([warned, unchecked])).toBe('flagged')
    expect(standingOf([warned, outside])).toBe('outside')
    expect(standingOf([outside, warned])).toBe('outside')
    expect(standingOf([outside, held])).toBe('held')
    expect(standingOf([held, outside, warned, unchecked])).toBe('held')
  })

  it('holds a row on every fact that keeps it off a customer surface', () => {
    const holding: Verdict[] = [
      { kind: 'removed' },
      { kind: 'discontinued' },
      { kind: 'retired-table', tableId: 't' },
      { kind: 'retired-pairs', joinId: 'j' },
      { kind: 'blocked', constraintId: 'c', because: 'the rule says so' },
    ]
    expect(holding.map((v) => [v.kind, standingOf([v])])).toEqual(
      holding.map((v) => [v.kind, 'held']),
    )
  })

  it('puts a row outside on the rule, the banner and the envelope', () => {
    const out: Verdict[] = [
      outside,
      { kind: 'built-for-another', bannerMarque: 'Stacer', subjectMarque: 'Highfield' },
      { kind: 'outside-envelope', hp: 300, min: 40, max: 115 },
    ]
    expect(out.map((v) => [v.kind, standingOf([v])])).toEqual(out.map((v) => [v.kind, 'outside']))
  })

  it('only flags on a warning and an under-floor reading', () => {
    expect(standingOf([warned])).toBe('flagged')
    expect(
      standingOf([{ kind: 'under-floor', capacity: 750, load: 812, source: 'Trailer Module!K' }]),
    ).toBe('flagged')
  })
})
