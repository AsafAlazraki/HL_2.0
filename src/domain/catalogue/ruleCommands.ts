/* ============================================================
   THE DEALER'S OWN RULES, CHANGED THE WAY EVERYTHING ON THE SHEET
   IS CHANGED — a command with its inverse, the sentence the step
   says, and the event the audit keeps.

   `constraintDefs.ts` already decides what a rule BECOMES when it is
   created, reworded, switched or deleted, and it does it through a
   `put` and a `remove` a caller hands in. That was written for a
   registry with no undo. The catalogue store HAS one — every write a
   `CatalogueCommand` with an `inverse` (`commands.ts`) — so a rule
   written on /rules, switched off from its list or deleted from its
   plate comes back with one press of the toast, exactly as a cell
   edit on the sheet does. Nothing here re-decides what
   `constraintDefs.ts` decides: the observed coercion is the same
   function (`sanitiseObserved`), and off is still the everyday act
   with delete beside it, undoable.

   A RULE IS PUT BACK WHERE IT STOOD. The list on /rules draws the
   rules in the order the store holds them, so a delete undone puts
   the rule back at its own place rather than at the foot.

   Pure: no React, no store. The clock is the one the store hands in.
   ============================================================ */

import { newId } from '@/domain/id'
import { sanitiseObserved } from '@/domain/rules/adopt'
import type { ConstraintDef } from '@/domain/model'
import type {
  CatalogueChange,
  CatalogueCommand,
  CatalogueEvent,
  CatalogueEventKind,
  Done,
} from './commands'
import type { CatalogueData } from './sheet'

/** The words a refusal says, where a press found nothing to do. */
export const RULE_GONE = 'That rule is no longer there.'
export const RULE_TAKEN = 'That rule is already there.'

const LABEL: Record<
  Extract<CatalogueEventKind, 'rule-added' | 'rule-changed' | 'rule-switched' | 'rule-deleted'>,
  string
> = {
  'rule-added': 'Rule added',
  'rule-changed': 'Rule changed',
  'rule-switched': 'Rule switched',
  'rule-deleted': 'Rule deleted',
}

function eventOf(
  kind: keyof typeof LABEL,
  at: string,
  said: string,
  changed: CatalogueChange[],
): CatalogueEvent {
  return { id: newId(), kind, at, said, label: LABEL[kind], changed }
}

const withRules = (data: CatalogueData, rules: ConstraintDef[]): CatalogueData => ({
  ...data,
  constraintDefs: rules,
})

/** What the build now does with it, said the moment it is added. */
function addedSaid(rule: ConstraintDef): string {
  if (!rule.enabled) return 'Your rule is added, switched off.'
  return rule.severity === 'warn'
    ? 'Your rule is on. The build warns from the next pick.'
    : 'Your rule is on. The build refuses from the next pick.'
}

/** Put a rule back at the place it stood. */
function restoreAt(id: string, rule: ConstraintDef, index: number): CatalogueCommand {
  return (data, now) => {
    if (data.constraintDefs.some((c) => c.id === id)) return { refused: '' }
    const list = [...data.constraintDefs]
    list.splice(Math.min(index, list.length), 0, sanitiseObserved(rule))
    return {
      next: withRules(data, list),
      inverse: deleteRule(id),
      said: 'Your rule is back.',
      event: eventOf('rule-added', now, 'Your rule is back.', [
        { path: `rule/${id}`, from: null, to: 'back' },
      ]),
    }
  }
}

/** A NEW RULE, as the plate on /rules files it. Its id is its own; a second press of the same
 *  rule is refused rather than filed twice. */
export function addRule(rule: ConstraintDef): CatalogueCommand {
  return (data, now): Done | { refused: string } => {
    if (data.constraintDefs.some((c) => c.id === rule.id)) return { refused: RULE_TAKEN }
    const filed = sanitiseObserved({ ...rule, updatedAt: now })
    const said = addedSaid(filed)
    return {
      next: withRules(data, [...data.constraintDefs, filed]),
      inverse: deleteRule(rule.id),
      said,
      event: eventOf('rule-added', now, said, [
        { path: `rule/${rule.id}`, from: null, to: 'added' },
      ]),
    }
  }
}

/** A RULE REWORDED — a column, a value, its because or what it does. The way back is the rule
 *  exactly as it was, dates and all. */
export function changeRule(rule: ConstraintDef): CatalogueCommand {
  return (data, now) => {
    const index = data.constraintDefs.findIndex((c) => c.id === rule.id)
    if (index < 0) return { refused: RULE_GONE }
    const was = data.constraintDefs[index]!
    const next = sanitiseObserved({
      ...rule,
      createdAt: was.createdAt,
      edited: true,
      updatedAt: now,
    })
    const list = [...data.constraintDefs]
    list[index] = next
    const said = 'Your rule is changed.'
    return {
      next: withRules(data, list),
      inverse: putBack(was),
      said,
      event: eventOf('rule-changed', now, said, [
        { path: `rule/${rule.id}`, from: was.updatedAt, to: now },
      ]),
    }
  }
}

/** The rule as it stood before a change — the inverse of `changeRule`, and of itself. */
function putBack(was: ConstraintDef): CatalogueCommand {
  return (data, now) => {
    const index = data.constraintDefs.findIndex((c) => c.id === was.id)
    if (index < 0) return { refused: '' }
    const current = data.constraintDefs[index]!
    const list = [...data.constraintDefs]
    list[index] = sanitiseObserved(was)
    const said = 'Your rule is as it was.'
    return {
      next: withRules(data, list),
      inverse: putBack(current),
      said,
      event: eventOf('rule-changed', now, said, [
        { path: `rule/${was.id}`, from: current.updatedAt, to: was.updatedAt },
      ]),
    }
  }
}

/** ON OR OFF — the everyday act. Switching is not an edit, so it never marks the rule edited.
 *  A switch to the state it is already in did nothing and says nothing. */
export function switchRule(id: string, enabled: boolean): CatalogueCommand {
  return (data, now) => {
    const index = data.constraintDefs.findIndex((c) => c.id === id)
    if (index < 0) return { refused: RULE_GONE }
    const was = data.constraintDefs[index]!
    if (was.enabled === enabled) return { refused: '' }
    const list = [...data.constraintDefs]
    list[index] = { ...was, enabled, updatedAt: now }
    const said = enabled ? 'Your rule is on again.' : 'Your rule is switched off.'
    return {
      next: withRules(data, list),
      inverse: switchRule(id, was.enabled),
      said,
      event: eventOf('rule-switched', now, said, [
        { path: `rule/${id}/enabled`, from: was.enabled, to: enabled },
      ]),
    }
  }
}

/** What a rule does in the build, as the plate's three words say it. */
export type RuleDoes = 'refuses' | 'warns' | 'off'

export const RULE_ALREADY = 'Your rule already does that.'

export const ruleDoesNow = (rule: ConstraintDef): RuleDoes =>
  !rule.enabled ? 'off' : rule.severity === 'warn' ? 'warns' : 'refuses'

/**
 * WHAT IT DOES — refuses, warns or off — AT ONCE, the way the switch beside it acts. Until
 * 2026-10-22 the plate's three words waited for "Keep the change" while the list's switch acted
 * at once, so two controls owned one state and a press on the plate was thrown away on leaving
 * (built-critique-m3.md, blocker 3). Like the switch it is not an edit: the rule keeps its words
 * and is not marked changed. Off keeps what it did, so on again does it again.
 */
export function doRule(id: string, does: RuleDoes): CatalogueCommand {
  return (data, now) => {
    const was = data.constraintDefs.find((c) => c.id === id)
    if (!was) return { refused: RULE_GONE }
    if (ruleDoesNow(was) === does) return { refused: RULE_ALREADY }
    const severity = does === 'off' ? was.severity : does === 'warns' ? 'warn' : 'block'
    return setDoes(id, does !== 'off', severity)(data, now)
  }
}

/** One rule set to on or off and to refusing or warning, exactly — `doRule`'s own way back, so an
 *  Undo puts back what it did AND what it would do switched on. */
function setDoes(
  id: string,
  enabled: boolean,
  severity: ConstraintDef['severity'],
): CatalogueCommand {
  return (data, now) => {
    const index = data.constraintDefs.findIndex((c) => c.id === id)
    if (index < 0) return { refused: RULE_GONE }
    const was = data.constraintDefs[index]!
    const next = sanitiseObserved({ ...was, enabled, severity, updatedAt: now })
    const list = [...data.constraintDefs]
    list[index] = next
    const said = !next.enabled
      ? 'Your rule is switched off.'
      : next.severity === 'warn'
        ? 'Your rule warns from the next pick.'
        : 'Your rule refuses from the next pick.'
    return {
      next: withRules(data, list),
      inverse: setDoes(id, was.enabled, was.severity),
      said,
      event: eventOf('rule-switched', now, said, [
        { path: `rule/${id}/does`, from: ruleDoesNow(was), to: ruleDoesNow(next) },
      ]),
    }
  }
}

/** FINISHED WITH IT. The way back puts it at the place it stood. */
export function deleteRule(id: string): CatalogueCommand {
  return (data, now) => {
    const index = data.constraintDefs.findIndex((c) => c.id === id)
    if (index < 0) return { refused: '' }
    const gone = data.constraintDefs[index]!
    const said = 'Your rule is deleted.'
    return {
      next: withRules(
        data,
        data.constraintDefs.filter((c) => c.id !== id),
      ),
      inverse: restoreAt(id, gone, index),
      said,
      event: eventOf('rule-deleted', now, said, [{ path: `rule/${id}`, from: 'filed', to: null }]),
    }
  }
}
