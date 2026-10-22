/* ============================================================
   THE DEALER'S RULES THROUGH THE STORE'S OWN DOOR — every write a
   command, every command a way back, and the way back exact.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { ConstraintDef } from '@/domain/model'
import { emptySheet, type CatalogueData } from './sheet'
import { isDone, type CatalogueCommand, type Done } from './commands'
import {
  addRule,
  changeRule,
  deleteRule,
  doRule,
  RULE_ALREADY,
  RULE_GONE,
  RULE_TAKEN,
  switchRule,
} from './ruleCommands'

const NOW = '2026-10-22T09:00:00.000Z'
const LATER = '2026-10-22T09:05:00.000Z'

const rule = (id: string, extra: Partial<ConstraintDef> = {}): ConstraintDef => ({
  id,
  orgId: 'northside',
  kind: 'implies',
  if: { combinator: 'AND', clauses: [] },
  then: { combinator: 'AND', clauses: [] },
  because: 'the hull is set up for a remote helm',
  enabled: true,
  severity: 'block',
  createdAt: NOW,
  updatedAt: NOW,
  ...extra,
})

const sheet = (rules: ConstraintDef[] = []): CatalogueData => ({
  ...emptySheet(),
  orgId: 'northside',
  constraintDefs: rules,
})

function run(data: CatalogueData, command: CatalogueCommand, at = LATER): Done {
  const out = command(data, at)
  if (!isDone(out)) throw new Error(`refused: ${out.refused}`)
  return out
}

describe('adding a rule', () => {
  it('files it, says what the build now does, and the way back takes it off', () => {
    const done = run(sheet(), addRule(rule('a')))
    expect(done.next.constraintDefs.map((c) => c.id)).toEqual(['a'])
    expect(done.said).toBe('Your rule is on. The build refuses from the next pick.')
    expect(done.event.kind).toBe('rule-added')
    const back = run(done.next, done.inverse)
    expect(back.next.constraintDefs).toEqual([])
  })

  it('says a warning warns and a rule added switched off is off', () => {
    expect(run(sheet(), addRule(rule('w', { severity: 'warn' }))).said).toBe(
      'Your rule is on. The build warns from the next pick.',
    )
    expect(run(sheet(), addRule(rule('o', { enabled: false }))).said).toBe(
      'Your rule is added, switched off.',
    )
  })

  it('refuses the same rule twice, in words', () => {
    expect(addRule(rule('a'))(sheet([rule('a')]), LATER)).toEqual({ refused: RULE_TAKEN })
  })

  it('never files an observed rule as one that refuses', () => {
    const observed = rule('observed:x', { severity: 'block' })
    expect(run(sheet(), addRule(observed)).next.constraintDefs[0]!.severity).toBe('warn')
  })
})

describe('switching a rule', () => {
  it('turns it off without calling it edited, and back on with the way back', () => {
    const done = run(sheet([rule('a')]), switchRule('a', false))
    const off = done.next.constraintDefs[0]!
    expect(off.enabled).toBe(false)
    expect(off.edited).toBeUndefined()
    expect(done.said).toBe('Your rule is switched off.')
    expect(run(done.next, done.inverse).next.constraintDefs[0]!.enabled).toBe(true)
  })

  it('a switch to where it already stands did nothing and says nothing', () => {
    expect(switchRule('a', true)(sheet([rule('a')]), LATER)).toEqual({ refused: '' })
  })

  it('a rule that is gone says so', () => {
    expect(switchRule('nope', false)(sheet(), LATER)).toEqual({ refused: RULE_GONE })
  })
})

describe('what a rule does, from the plate', () => {
  it('acts at once, like the switch: warns, off and back, never marked edited', () => {
    const warns = run(sheet([rule('a')]), doRule('a', 'warns'))
    expect(warns.next.constraintDefs[0]!).toMatchObject({ enabled: true, severity: 'warn' })
    expect(warns.next.constraintDefs[0]!.edited).toBeUndefined()
    expect(warns.said).toBe('Your rule warns from the next pick.')
    const off = run(warns.next, doRule('a', 'off'))
    expect(off.next.constraintDefs[0]!).toMatchObject({ enabled: false, severity: 'warn' })
    expect(off.said).toBe('Your rule is switched off.')
    const refuses = run(off.next, doRule('a', 'refuses'))
    expect(refuses.next.constraintDefs[0]!).toMatchObject({ enabled: true, severity: 'block' })
    expect(refuses.said).toBe('Your rule refuses from the next pick.')
  })

  it('the way back puts back what it did and what it would do switched on', () => {
    const was = rule('a', { enabled: false, severity: 'warn' })
    const done = run(sheet([was]), doRule('a', 'refuses'))
    const back = run(done.next, done.inverse).next.constraintDefs[0]!
    expect(back).toMatchObject({ enabled: false, severity: 'warn' })
  })

  it('a press on what it already does says so, and a rule that is gone says so', () => {
    expect(doRule('a', 'refuses')(sheet([rule('a')]), LATER)).toEqual({ refused: RULE_ALREADY })
    expect(doRule('nope', 'off')(sheet(), LATER)).toEqual({ refused: RULE_GONE })
  })
})

describe('changing a rule', () => {
  it('keeps its first date, marks it edited, and the way back is the rule exactly as it was', () => {
    const was = rule('a')
    const done = run(sheet([was]), changeRule({ ...was, because: 'a new reason' }))
    const now = done.next.constraintDefs[0]!
    expect(now.because).toBe('a new reason')
    expect(now.createdAt).toBe(NOW)
    expect(now.edited).toBe(true)
    expect(run(done.next, done.inverse).next.constraintDefs[0]).toEqual(was)
  })
})

describe('deleting a rule', () => {
  it('takes it off, and the way back puts it at the place it stood', () => {
    const done = run(sheet([rule('a'), rule('b'), rule('c')]), deleteRule('b'))
    expect(done.next.constraintDefs.map((c) => c.id)).toEqual(['a', 'c'])
    expect(done.said).toBe('Your rule is deleted.')
    const back = run(done.next, done.inverse)
    expect(back.next.constraintDefs.map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })
})
