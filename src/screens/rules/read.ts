/* ============================================================
   THE RULES SCREEN'S READING — the sentence being written, what it
   would reach, and the three kinds of rule that exist, each counted
   off the loaded sheet. The screen draws; this decides.

   ── THE SENTENCE IS A DRAFT UNTIL IT IS ADDED ─────────────────

   What the plate holds is never a rule. It is the screen's own state
   (`Draft`), and it becomes a `ConstraintDef` only when the act is
   pressed, through `pairRule` (src/domain/rules/constraints/
   pairRules.ts) and the store's own command (`addRule`). A rule
   nobody wrote cannot arrive by opening this screen — the line
   `startingPoints.draftFrom` holds, held here too.

   ── IN THE DEALER'S WORDS ─────────────────────────────────────

   Every spec the sentence names is a `pairSpecs.ts` spec — the boat's
   maker, steering, shaft or length; the motor's horsepower — never a
   column header, and a figure is typed and compared ("is over 6 m").

   ── WHERE THE OPENING SENTENCE COMES FROM ─────────────────────

   On the day Northside has written nothing, the plate opens on the
   one rule its price list already keeps that a sentence can say: F7,
   whose choices the ledger carries (`ruleLedger.ts`, `sentence`), each
   value one `read.test.ts` finds on a row. Its because is the seed's,
   verbatim. Nothing is added until somebody presses the act.

   ── THREE KINDS OF RULE, THREE OWNERS ─────────────────────────

     yours      Northside's own, written here. They run in the build.
     stated     the price list's own pairing rules, each with the
                measurement the adjudication put on it.
     noticed    patterns the price list follows that nobody wrote
                down. They would only ever warn.

   The price list's rules are READ, never reworded here: each line's
   words and its measure are the ledger's (`PAIRING_RULES`).

   Pure. No React, no store.
   ============================================================ */

import type { ConstraintDef } from '@/domain/model'
import { ruleDoesNow, type RuleDoes } from '@/domain/catalogue/ruleCommands'
import {
  FIRST_OP,
  KIND_NOUN,
  OPS_FOR,
  pairColumns,
  pairMissing,
  pairReach,
  pairReady,
  pairRule,
  pairSaid,
  pairShapeOf,
  sideFor,
  type PairColumn,
  type PairOp,
  type PairReach,
  type PairShape,
  type PairWorld,
  type PartnerKind,
} from '@/domain/rules/constraints/pairRules'
import { specByKey } from '@/domain/rules/constraints/pairSpecs'
import {
  PAIRING_RULES,
  holdRate,
  ledgerFor,
  type RuleMeasure,
} from '@/domain/rules/constraints/ruleLedger'
import { WORKBOOK_RULES, type WorkbookRuleRef } from '@/domain/rules/constraints/workbookRules'

/* ---------------------------------------------------------- */
/* The draft                                                   */
/* ---------------------------------------------------------- */

/** What the build does with a rule, as the plate's verb says it. */
export type Verb = RuleDoes

export const VERBS: readonly Verb[] = ['refuses', 'warns', 'off']

/** The sentence on the plate, as it is being written. */
export interface Draft {
  boatKey: string
  boatOp: PairOp
  boatValue: string
  partnerKind: PartnerKind
  partnerKey: string
  partnerOp: PairOp
  partnerValue: string
  because: string
  verb: Verb
  /** the rule this draft rewrites, where it is one of Northside's */
  ruleId: string | null
  /** the price list's rule this draft was opened from, where it was */
  from: WorkbookRuleRef | null
}

export const blankDraft = (): Draft => ({
  boatKey: '',
  boatOp: 'eq',
  boatValue: '',
  partnerKind: 'motor',
  partnerKey: '',
  partnerOp: 'eq',
  partnerValue: '',
  because: '',
  verb: 'refuses',
  ruleId: null,
  from: null,
})

/** The specs of every kind the sentence can name, read once per sheet. */
export interface Columns {
  boat: PairColumn[]
  motor: PairColumn[]
  trailer: PairColumn[]
}

export function readColumns(world: PairWorld): Columns {
  return {
    boat: pairColumns(world, 'boat'),
    motor: pairColumns(world, 'motor'),
    trailer: pairColumns(world, 'trailer'),
  }
}

export const columnAt = (cols: readonly PairColumn[], key: string): PairColumn | null =>
  cols.find((c) => c.key === key) ?? null

/** One side, read only where its spec is on THIS sheet. */
const sideOf = (column: PairColumn | null, op: PairOp, value: string) =>
  sideFor(column ? specByKey(column.key) : null, op, column ? value : '')

/** The draft as the domain's own shape, so the words and the reach are the domain's. */
export function shapeOfDraft(d: Draft, cols: Columns): PairShape {
  return {
    boat: sideOf(columnAt(cols.boat, d.boatKey), d.boatOp, d.boatValue),
    partnerKind: d.partnerKind,
    partner: sideOf(columnAt(cols[d.partnerKind], d.partnerKey), d.partnerOp, d.partnerValue),
  }
}

/** A side moved to another spec: its word kept where the new spec can say it, its value kept
 *  where the new spec carries it — a figure is retyped, a word chosen again. */
export function sideMovedTo(
  column: PairColumn | null,
  side: 'boat' | 'partner',
  op: PairOp,
  value: string,
): { op: PairOp; value: string } {
  if (!column) return { op, value: '' }
  const nextOp = OPS_FOR[column.measure].includes(op) ? op : FIRST_OP[side][column.measure]
  const keep = column.measure === 'word' ? column.values.some((v) => v.value === value) : false
  return { op: nextOp, value: keep ? value : '' }
}

/** One of Northside's rules, opened on the plate to be rewritten. */
export function draftOf(rule: ConstraintDef, world: PairWorld): Draft | null {
  const shape = pairShapeOf(rule, world)
  if (!shape) return null
  return {
    boatKey: shape.boat.key,
    boatOp: shape.boat.op,
    boatValue: shape.boat.value,
    partnerKind: shape.partnerKind,
    partnerKey: shape.partner.key,
    partnerOp: shape.partner.op,
    partnerValue: shape.partner.value,
    because: rule.because,
    verb: ruleDoesNow(rule),
    ruleId: rule.id,
    from: null,
  }
}

/** What still stops the act, in one sentence, or null. */
export const draftMissing = (d: Draft, cols: Columns): string | null =>
  pairMissing(shapeOfDraft(d, cols), d.because)

/** The rule the act files. Only called once `draftMissing` is null. */
export function ruleOfDraft(
  d: Draft,
  cols: Columns,
  orgId: string,
  now: string,
  was?: ConstraintDef,
): ConstraintDef {
  return pairRule({
    orgId,
    boat: { column: columnAt(cols.boat, d.boatKey), op: d.boatOp, value: d.boatValue },
    partnerKind: d.partnerKind,
    partner: {
      column: columnAt(cols[d.partnerKind], d.partnerKey),
      op: d.partnerOp,
      value: d.partnerValue,
    },
    because: d.because,
    severity: d.verb === 'warns' ? 'warn' : 'block',
    enabled: d.verb !== 'off',
    now,
    ...(was ? { was } : {}),
  })
}

/**
 * WHETHER THE PLATE'S WORDS ARE OTHER THAN THE RULE'S. What the rule DOES is not among them: on a
 * written rule refuses, warns and off act at once (`doRule`), as its switch does, so the only
 * change that waits for "Keep the change" is a change of words.
 */
export function draftChanged(d: Draft, rule: ConstraintDef, world: PairWorld): boolean {
  const was = draftOf(rule, world)
  if (!was) return true
  return (
    was.boatKey !== d.boatKey ||
    was.boatOp !== d.boatOp ||
    was.boatValue.trim() !== d.boatValue.trim() ||
    was.partnerKind !== d.partnerKind ||
    was.partnerKey !== d.partnerKey ||
    was.partnerOp !== d.partnerOp ||
    was.partnerValue.trim() !== d.partnerValue.trim() ||
    was.because.trim() !== d.because.trim()
  )
}

/** The words of a filed rule — its sentence and its because, never what it does — so the plate
 *  starts again only when the WORDS changed, and a switch never throws away what is being typed. */
export const wordsKey = (rule: ConstraintDef): string =>
  JSON.stringify([rule.if.clauses, rule.then?.clauses ?? [], rule.because])

/* ---------------------------------------------------------- */
/* The price list's own rules                                  */
/* ---------------------------------------------------------- */

/** A draft opened from the price list's own rule, or null where no sentence here can say it. */
export function draftFromPriceList(ref: WorkbookRuleRef, cols: Columns): Draft | null {
  const words = ledgerFor(ref)?.sentence
  const seed = WORKBOOK_RULES.find((s) => s.ref === ref)
  if (!words || !seed) return null
  /* the specs must be on THIS sheet, with those values on a row, or it is not offered */
  const boat = columnAt(cols.boat, words.boat)
  const partner = columnAt(cols[words.partnerKind], words.partner)
  if (!boat?.values.some((v) => v.value === words.boatValue)) return null
  if (!partner?.values.some((v) => v.value === words.partnerValue)) return null
  return {
    ...blankDraft(),
    boatKey: words.boat,
    boatOp: words.boatOp,
    boatValue: words.boatValue,
    partnerKind: words.partnerKind,
    partnerKey: words.partner,
    partnerOp: words.partnerOp,
    partnerValue: words.partnerValue,
    because: seed.because,
    from: ref,
  }
}

/** One of the price list's rules, as its line in the list draws it. */
export interface StatedRule {
  ref: WorkbookRuleRef
  /** the ledger's own words for it */
  said: string
  counted: string
  /** the ledger's own measure, where it carries one */
  measure: RuleMeasure | null
  /** `held / tested`, derived */
  rate: string
  /** nobody wrote it down: it is a pattern in the values, and would only ever warn */
  noticed: boolean
  /** a sentence here can say it, so it opens on the plate */
  sayable: boolean
}

export function statedRules(cols: Columns): StatedRule[] {
  return PAIRING_RULES.map((entry) => {
    const seed = WORKBOOK_RULES.find((s) => s.ref === entry.ref)
    const measure = entry.measure ?? null
    return {
      ref: entry.ref,
      said: entry.said,
      counted: entry.counted,
      measure,
      rate: measure ? holdRate(measure) : '',
      noticed: seed?.evidence === 'observed',
      sayable: draftFromPriceList(entry.ref, cols) !== null,
    }
  })
}

/* ---------------------------------------------------------- */
/* Northside's own                                             */
/* ---------------------------------------------------------- */

/** One of Northside's rules, as its line draws it. */
export interface YourRule {
  rule: ConstraintDef
  shape: PairShape
  said: string
  verb: Verb
  reach: PairReach
}

/** Northside's rules in the order the store holds them — the order they were written in. A rule
 *  this screen cannot read as a pair (none today) is left to the screen that wrote it. */
export function yourRules(rules: readonly ConstraintDef[], world: PairWorld): YourRule[] {
  const out: YourRule[] = []
  for (const rule of rules) {
    const shape = pairShapeOf(rule, world)
    if (!shape || !pairReady(shape)) continue
    out.push({
      rule,
      shape,
      said: pairSaid(shape),
      verb: ruleDoesNow(rule),
      reach: pairReach(shape, world),
    })
  }
  return out
}

/** Whether Northside has already said the price list's rule in its own words. */
export function alreadySaid(
  ref: WorkbookRuleRef,
  yours: readonly YourRule[],
  cols: Columns,
): boolean {
  const draft = draftFromPriceList(ref, cols)
  if (!draft) return false
  const said = pairSaid(shapeOfDraft(draft, cols))
  return yours.some((y) => y.said === said)
}

/* ---------------------------------------------------------- */
/* What the census says                                        */
/* ---------------------------------------------------------- */

const count = (n: number): string => n.toLocaleString('en-AU')

const plural = (n: number, one: string, many: string): string =>
  `${count(n)} ${n === 1 ? one : many}`

/** "the Yamaha F2.5SMHB, the Yamaha F4SMHA, the Yamaha F4LMHA and 35 more" */
export function namesSaid(names: readonly string[], more: number): string {
  const all = names.map((n) => `the ${n}`)
  if (more > 0) all.push(`${count(more)} more`)
  if (all.length <= 1) return all[0] ?? ''
  return `${all.slice(0, -1).join(', ')} and ${all.at(-1)}`
}

/**
 * WHAT IT COSTS A SALE TODAY — a real model, and what its next pick will no longer be offered.
 * '' until every choice is made, because the act already says what is missing.
 *
 * TRUE IN EVERY STATE (built-critique-m3.md, blocker 2): switched off it costs nothing today and
 * says so first, then what it WOULD cost, in the conditional. Where the price list loses nothing,
 * it says so in one sentence and names no boat beside a list of motors — what a search past the
 * list loses is a count, said once.
 */
export function costSaid(reach: PairReach, verb: Verb): string {
  if (!reach.ready) return ''
  const noun = KIND_NOUN[reach.kind]
  const ex = reach.example
  if (!ex) return `Nothing. No ${noun.one} on the price list breaks it today.`
  if (!ex.made) {
    const fewer = `${count(reach.refused)} fewer ${reach.refused === 1 ? noun.one : noun.many}`
    if (verb === 'off')
      return `Nothing today: it is off. Switched on it would cost no sale either — only a search past the price list would find ${fewer} for these boats.`
    if (verb === 'warns')
      return `No sale. Nothing the price list makes for these boats breaks it; a search past the list warns about ${count(reach.refused)} ${reach.refused === 1 ? noun.one : noun.many}.`
    return `No sale. Nothing the price list makes for these boats breaks it; a search past the list finds ${fewer}.`
  }
  const others = reach.modelsLosing - 1
  const lost = namesSaid(ex.names, ex.more)
  if (verb === 'off')
    return `Nothing today: it is off. Switched on, the ${ex.boat} would lose ${lost}${
      others > 0 ? `, and ${plural(others, 'more model', 'more models')} would lose one too` : ''
    }.`
  if (verb === 'warns')
    return `No sale: the ${ex.boat} keeps ${lost}, with your because beside it${
      others > 0
        ? `, and so ${others === 1 ? 'does' : 'do'} ${plural(others, 'more model', 'more models')}`
        : ''
    }.`
  return `The ${ex.boat} loses ${lost}${
    others > 0 ? `, and ${plural(others, 'more model loses', 'more models lose')} one too` : ''
  }.`
}

/** The census's words for the verb: what the rule does to the partners it breaks. */
export function doesSaid(verb: Verb): string {
  if (verb === 'warns') return 'it warns about on them'
  if (verb === 'off') return 'it refuses on them once it is on'
  return 'it refuses on them'
}

/** The census's words for what the price list makes that it takes away. */
export function takenSaid(verb: Verb): string {
  if (verb === 'warns') return 'warned about'
  if (verb === 'off') return 'taken away once it is on'
  return 'taken away'
}

/**
 * WHAT ONE OF NORTHSIDE'S RULES COSTS, as its line in the list says it — the sale first, never
 * the alarming count of everything a search could reach (built-critique-m3.md: "Refuses 171
 * motors on 245 boats" while the true cost was 45 lines of five models).
 */
export function costLine(y: YourRule): string {
  const r = y.reach
  const noun = KIND_NOUN[r.kind].one
  const models = r.modelsLosing
  if (y.verb === 'off')
    return models > 0
      ? `Switched on, ${plural(models, 'model', 'models')} would lose a ${noun} the price list makes for ${models === 1 ? 'it' : 'them'}.`
      : 'Switched on, it would cost no sale.'
  if (y.verb === 'warns')
    return models > 0
      ? `Warns on ${plural(models, 'model', 'models')} about a ${noun} the price list makes for ${models === 1 ? 'it' : 'them'}.`
      : 'Costs no sale: it warns only past the price list.'
  return models > 0
    ? `${plural(models, 'model loses', 'models lose')} a ${noun} the price list makes for ${models === 1 ? 'it' : 'them'}.`
    : 'Costs no sale: it refuses only past the price list.'
}
