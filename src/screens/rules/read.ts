/* ============================================================
   THE RULES SCREEN'S READING — the sentence being written, what it
   would reach, and the three kinds of rule that exist, each counted
   off the loaded sheet. The screen draws; this decides.

   ── THE SENTENCE IS A DRAFT UNTIL IT IS ADDED ─────────────────

   What the open clause holds is never a rule. It is the screen's own state
   (`Draft`), and it becomes a `ConstraintDef` only when the act is
   pressed, through `pairRule` (src/domain/rules/constraints/
   pairRules.ts) and the store's own command (`addRule`). A rule
   nobody wrote cannot arrive by opening this screen — the line
   `startingPoints.draftFrom` holds, held here too.

   ── IN THE DEALER'S WORDS ─────────────────────────────────────

   Every spec the sentence names is a `pairSpecs.ts` spec — the boat's
   maker, steering, shaft or length; the motor's horsepower — never a
   column header, and a figure is typed and compared ("is over 6 m").

   ── WHERE A SENTENCE COMES FROM ───────────────────────────────

   Nothing is open on arrival (since 2026-10-28, board A: the page is
   read first). A clause opens blank in the part that writes its kind,
   or from the one pattern the price list was noticed keeping that a
   sentence can say — F7, whose choices the ledger carries
   (`ruleLedger.ts`, `sentence`), each value one `read.test.ts` finds
   on a row, its because the seed's, verbatim. Nothing is added until
   somebody presses the act.

   ── THREE KINDS OF RULE, THREE OWNERS ─────────────────────────

     yours      Northside's own, written here. They run in the build.
     stated     the price list's own pairing rules, each with the
                measurement the adjudication put on it.
     noticed    patterns the price list follows that nobody wrote
                down. The build does nothing with them until
                Northside says one as its own.

   The price list's rules are READ, never reworded here: each line's
   words and its measure are the ledger's (`PAIRING_RULES`).

   Pure. No React, no store.
   ============================================================ */

import type { ConstraintDef, TableKind } from '@/domain/model'
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
  type PairSide,
  type PairWorld,
  type PartnerKind,
} from '@/domain/rules/constraints/pairRules'
import { specByKey } from '@/domain/rules/constraints/pairSpecs'
import {
  PAIRING_RULES,
  holdRate,
  ledgerFor,
  shownOf,
  type RuleGroupId,
  type RuleMeasure,
} from '@/domain/rules/constraints/ruleLedger'
import { WORKBOOK_RULES, type WorkbookRuleRef } from '@/domain/rules/constraints/workbookRules'
import {
  BUILD_DOES,
  measureClause,
  type BuildDoes,
  type HouseMeasure,
} from '@/domain/rules/constraints/houseMeasures'

/* ---------------------------------------------------------- */
/* The draft                                                   */
/* ---------------------------------------------------------- */

/** What the build does with a rule, as the plate's verb says it. */
export type Verb = RuleDoes

export const VERBS: readonly Verb[] = ['refuses', 'warns', 'off']

/** One more condition on the boat: "and its length is over 6 m", or an exception. */
export interface AlsoDraft {
  key: string
  op: PairOp
  value: string
}

/** The sentence on the plate, as it is being written. */
export interface Draft {
  boatKey: string
  boatOp: PairOp
  boatValue: string
  /** more of the boat, each of which must hold too — "and its …", "except the …" */
  also: AlsoDraft[]
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
  also: [],
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

/** One side, read only where its spec is on THIS sheet, and said as the sheet names its value —
 *  a model as a person says that model, never the file's raw cell. */
function sideOf(column: PairColumn | null, op: PairOp, value: string): PairSide {
  const side = sideFor(column ? specByKey(column.key) : null, op, column ? value : '')
  const named = column?.values.find((v) => v.value === side.value)
  return named ? { ...side, said: named.said } : side
}

/** The draft as the domain's own shape, so the words and the reach are the domain's. */
export function shapeOfDraft(d: Draft, cols: Columns): PairShape {
  const also = d.also.map((a) => sideOf(columnAt(cols.boat, a.key), a.op, a.value))
  return {
    boat: sideOf(columnAt(cols.boat, d.boatKey), d.boatOp, d.boatValue),
    ...(also.length > 0 ? { also } : {}),
    partnerKind: d.partnerKind,
    partner: sideOf(columnAt(cols[d.partnerKind], d.partnerKey), d.partnerOp, d.partnerValue),
  }
}

/** A new "and" on the boat: no spec chosen yet. */
export const blankAnd = (): AlsoDraft => ({ key: '', op: 'eq', value: '' })

/** A new exception: the boat's model, and `is not`, said "except the …". */
export const blankExcept = (): AlsoDraft => ({ key: 'boat::model', op: 'neq', value: '' })

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
    also: (shape.also ?? []).map((a) => ({ key: a.key, op: a.op, value: a.value })),
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
    also: d.also.map((a) => ({ column: columnAt(cols.boat, a.key), op: a.op, value: a.value })),
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
    JSON.stringify(was.also) !==
      JSON.stringify(d.also.map((a) => ({ key: a.key, op: a.op, value: a.value.trim() }))) ||
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
  /** what it is about, as the ledger groups it */
  group: RuleGroupId
  /** the ledger's own words for it */
  said: string
  counted: string
  /** the ledger's own measure, where it carries one */
  measure: RuleMeasure | null
  /** the figure drawn in front of `counted`: how many hold, or, on a clause that is never
   *  refused, how many sit under it (`shownOf`, derived) */
  shown: number
  /** the clause is never refused, so `shown` counts what sits under it and `counted` says so */
  under: boolean
  /** MEASURED ON THE SHEET LOADED HERE, with its exceptions by name — null where this sheet
   *  cannot test it, and the figure drawn is the workbook's, said as the workbook's */
  live: HouseMeasure | null
  /** what the build does with it */
  does: { does: BuildDoes; said: string } | null
  /** `held / tested`, derived */
  rate: string
  /** nobody wrote it down: it is a pattern in the values, and would only ever warn */
  noticed: boolean
  /** a sentence here can say it, so it opens on the plate */
  sayable: boolean
}

/**
 * THE PRICE LIST'S OWN CLAUSES, each measured on the sheet loaded here where the sheet can test it
 * (`houseMeasures.ts`; judge.md, data round, missing item 1: "581 of 581, each measured on it"
 * would still print after a new price list came in). Where it cannot, the workbook's figure is
 * drawn and said to be the workbook's. The words are the ledger's, never reworded here.
 */
export function statedRules(cols: Columns, world?: PairWorld): StatedRule[] {
  return PAIRING_RULES.map((entry) => {
    const seed = WORKBOOK_RULES.find((s) => s.ref === entry.ref)
    const measure = entry.measure ?? null
    const live = world ? measureClause(entry.ref, world) : null
    return {
      ref: entry.ref,
      group: entry.group,
      said: entry.said,
      counted: live ? live.counted : entry.counted,
      measure,
      shown: live
        ? live.under
          ? live.tested - live.held
          : live.held
        : measure
          ? shownOf(entry, measure)
          : 0,
      under: entry.counts === 'under',
      rate: measure ? holdRate(measure) : '',
      noticed: seed?.evidence === 'observed',
      sayable: draftFromPriceList(entry.ref, cols) !== null,
      live,
      does: BUILD_DOES[entry.ref] ?? null,
    }
  })
}

/** The figure a stated clause draws: off the sheet where it was measured here, else the
 *  workbook's. */
export function figureOf(s: StatedRule): { shown: number; of: number } | null {
  if (s.live) return { shown: s.shown, of: s.live.tested }
  return s.measure ? { shown: s.shown, of: s.measure.tested } : null
}

/** "The 3 that break it", "The 72 under it" — or '' where none does. */
export function exceptionsSaid(s: StatedRule): string {
  const n = s.live?.exceptions.length ?? 0
  if (n === 0) return ''
  return s.under
    ? `The ${count(n)} under it`
    : `The ${count(n)} that ${n === 1 ? 'breaks' : 'break'} it`
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
    /* "No sale." read as "you cannot sell" (judge.md, data round, B7): it costs NO sale, said so */
    const them = `${count(reach.refused)} ${reach.refused === 1 ? noun.one : noun.many}`
    if (verb === 'off')
      return `Nothing today: it is off. Switched on, it would cost no sale either: it would refuse ${them} only when one is searched for past the price list.`
    if (verb === 'warns')
      return `It costs no sale: nothing your price list makes for these boats breaks it. It warns about ${them} only when one is searched for past the list.`
    return `It costs no sale: nothing your price list makes for these boats breaks it. It refuses ${them} only when one is searched for past the list.`
  }
  const others = reach.modelsLosing - 1
  const lost = namesSaid(ex.names, ex.more)
  if (verb === 'off')
    return `Nothing today: it is off. Switched on, the ${ex.boat} would lose ${lost}${
      others > 0 ? `, and ${plural(others, 'more model', 'more models')} would lose one too` : ''
    }.`
  if (verb === 'warns')
    return `It costs no sale: the ${ex.boat} keeps ${lost}, with your because beside it${
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

/* ---------------------------------------------------------- */
/* The house rules, by what the customer is buying             */
/* ---------------------------------------------------------- */

/**
 * THE PARTS OF THE PAGE (board A, "The house rules", docs/directions/rules-boards/): the rules
 * grouped by what the customer is buying, so a dealer knows where a new rule goes before writing
 * it. Trailers and motors are where a sentence here can write one — a sentence pairs a boat with
 * a motor or a trailer. Rigging and the boat's own pre-delivery kit hold the price list's rules
 * and what it was noticed doing, and nothing is written there, because no sentence here names a
 * kit.
 */
export type PartId = 'trailers' | 'motors' | 'rigging'

export interface PartPlan {
  id: PartId
  name: string
  writes: PartnerKind | null
  /** the kind its glyph draws: what the part is about, the third part's kit included */
  mark: TableKind
  groups: readonly RuleGroupId[]
}

export const PARTS: readonly PartPlan[] = [
  { id: 'trailers', name: 'Trailers', writes: 'trailer', mark: 'trailer', groups: ['trailers'] },
  { id: 'motors', name: 'Motors', writes: 'motor', mark: 'motor', groups: ['motors'] },
  {
    id: 'rigging',
    name: 'Rigging and pre-delivery',
    writes: null,
    mark: 'accessory',
    groups: ['rigging', 'boat-row'],
  },
]

/** One clause of the page, numbered as the page says it: "2.4". */
export interface Numbered<T> {
  at: string
  item: T
}

export interface Part {
  id: PartId
  /** the part's number on the page: 1, 2, 3 */
  n: number
  name: string
  /** what a sentence in this part names beside the boat; null where none can */
  writes: PartnerKind | null
  mark: TableKind
  /** the price list's own rules, numbered first */
  stated: Numbered<StatedRule>[]
  /** Northside's, numbered after them in the order they were written */
  yours: Numbered<YourRule>[]
  /** what the price list was noticed doing that nobody wrote: never numbered, never a rule */
  noticed: StatedRule[]
  /** the number a new rule written here takes */
  next: string
}

export function partsOf(stated: readonly StatedRule[], yours: readonly YourRule[]): Part[] {
  return PARTS.map((plan, i) => {
    const n = i + 1
    const mine = stated.filter((s) => plan.groups.includes(s.group))
    const said = mine.filter((s) => !s.noticed)
    const written = plan.writes ? yours.filter((y) => y.shape.partnerKind === plan.writes) : []
    return {
      id: plan.id,
      n,
      name: plan.name,
      writes: plan.writes,
      mark: plan.mark,
      stated: said.map((item, k) => ({ at: `${n}.${k + 1}`, item })),
      yours: written.map((item, k) => ({ at: `${n}.${said.length + k + 1}`, item })),
      noticed: mine.filter((s) => s.noticed),
      next: `${n}.${said.length + written.length + 1}`,
    }
  })
}

/** The page's whole count, read once off its parts: what the price list keeps on its own, what
 *  Northside has written, and how many of those are off. */
export interface House {
  kept: number
  written: number
  off: number
  /** of the kept, how many are measured on the sheet loaded here */
  measured?: number
}

/**
 * COUNTED HERE, NEVER IN THE COMPONENT (built-critique-m3-2.md, blocker 1: `Rules.tsx` summed
 * these three for its lede). Read off the same parts the page numbers, so the lede and the
 * clauses under it are one count.
 */
export function houseOf(book: readonly Part[]): House {
  let kept = 0
  let written = 0
  let off = 0
  let measured = 0
  for (const part of book) {
    kept += part.stated.length
    measured += part.stated.filter((s) => s.item.live !== null).length
    written += part.yours.length
    off += part.yours.filter((y) => y.item.verb === 'off').length
  }
  return { kept, written, off, measured }
}

/** The lede's two sentences of fact: "Your price list keeps 7 rules of its own about what may be
 *  sold with what, 6 of them measured on it here. Northside has written 2, 1 of them off." The
 *  noun is said before "these" ever could be (judge.md, data round, B7). */
export function houseSaid({ kept, written, off, measured = kept }: House): string {
  const where =
    measured === kept
      ? 'each measured on it here'
      : measured === 0
        ? 'each measured on the workbook it came from'
        : `${count(measured)} of them measured on it here`
  const keeps = `Your price list keeps ${count(kept)} rules of its own about what may be sold with what, ${where}.`
  if (written === 0) return `${keeps} Northside has written none yet.`
  const offSaid =
    off === 0
      ? ''
      : off === written
        ? written === 1
          ? ', and it is off'
          : ', all of them off'
        : `, ${count(off)} of them off`
  return `${keeps} Northside has written ${count(written)}${offSaid}.`
}

/** Where a new sentence of this kind is written: the part that writes it. */
export const partWriting = (parts: readonly Part[], kind: PartnerKind): Part | null =>
  parts.find((p) => p.writes === kind) ?? null

/** `?open=` for a new sentence in a part: `new:motor`. A bare `new` is a motor, the first kind a
 *  dealer reaches for. */
export function newKindOf(open: string): PartnerKind | null {
  if (open === 'new' || open === 'new:motor') return 'motor'
  if (open === 'new:trailer') return 'trailer'
  return null
}

/** How many motors or trailers are on sale, counted as the census counts them. */
export function onSale(world: PairWorld, kind: PartnerKind): number {
  return pairReach(
    { boat: sideFor(null, 'eq', ''), partnerKind: kind, partner: sideFor(null, 'eq', '') },
    world,
  ).partners
}

/* ---------------------------------------------------------- */
/* What the verb says, where it is said                        */
/* ---------------------------------------------------------- */

/** The verb as the sentence says it, and as its list names it. */
export const VERB_WORD: Record<Verb, string> = {
  refuses: 'refuses',
  warns: 'warns about',
  off: 'is off',
}

/** What each verb does, one line under it where it is chosen (board A's consequence lines). */
export const VERB_DOES: Record<Verb, string> = {
  refuses: 'It leaves the list in the build, and this because is said where it was.',
  warns: 'It stays on the list, with this because beside it.',
  off: 'Kept here in full; the build offers what it would refuse.',
}

/**
 * THE LINE THE VERB STANDS IN, either side of it. On, the verb is the build's: "Otherwise the build
 * refuses the motor, because …". Off, the rule is said kept and not enforced, at full ink, and
 * what it would do comes after in the conditional — so an off rule reads as a decision and never
 * as a broken one (the judge's change to board A). The verb stays the line's second piece in every
 * state, so choosing one never moves the control a person is on.
 */
export function verbLine(
  verb: Verb,
  noun: string,
  severity: 'block' | 'warn' = 'block',
): { lead: string; tail: string } {
  if (verb === 'off')
    return {
      lead: 'This rule',
      tail: `— kept, not enforced. Switched on, the build would ${severity === 'warn' ? 'warn about' : 'refuse'} the ${noun}, because`,
    }
  return { lead: 'Otherwise the build', tail: `the ${noun}, because` }
}

/* ---------------------------------------------------------- */
/* What it does to the drafts standing now                     */
/* ---------------------------------------------------------- */

/**
 * THE QUOTES IT WOULD TOUCH, said in one sentence beside the act: from the next pick it refuses,
 * and a draft already carrying what it refuses keeps that line — the build says so on it, and it
 * cannot be given until the line is off (`refusedOnQuote`, the give's own reading). Counted with
 * the sentence on the page as the only rule, so the figure is this rule's and nobody else's.
 */
export function standingSaid(verb: Verb, drafts: number, carrying: number, noun: string): string {
  if (verb === 'off') return 'Nothing changes while it is off: no pick and no quote.'
  if (verb === 'warns')
    return 'From the next pick, with your because beside it. It refuses nothing, so no quote waits on it.'
  if (drafts === 0) return 'From the next pick. No draft is standing today, so none waits on it.'
  /* "None of your 1 draft" was said over one draft (built-critique-m3-2.md, minor) */
  if (carrying === 0)
    return drafts === 1
      ? `From the next pick. Your one draft carries no ${noun} it refuses.`
      : `From the next pick. None of your ${count(drafts)} drafts carries a ${noun} it refuses.`
  return `From the next pick. ${carrying === 1 ? 'One' : count(carrying)} of your ${plural(drafts, 'draft', 'drafts')} ${carrying === 1 ? 'carries' : 'carry'} a ${noun} it refuses: the build says so there, and ${carrying === 1 ? 'it' : 'each'} cannot be given until it is off.`
}

/** "the Classic 340, 360, 380, 360 LS and 380 LS" — one maker’s models, said once, the first
 *  word kept on the first and dropped where the next one repeats it. */
export function modelsSaid(models: readonly string[]): string {
  const said: string[] = []
  let lead = ''
  for (const m of models) {
    const [first = '', ...rest] = m.split(' ')
    if (said.length > 0 && first === lead && rest.length > 0) said.push(rest.join(' '))
    else said.push(m)
    lead = first
  }
  if (said.length <= 1) return `the ${said[0] ?? ''}`
  return `the ${said.slice(0, -1).join(', ')} and ${said.at(-1)}`
}

/* ---------------------------------------------------------- */
/* Where the workbook and the sheet part                       */
/* ---------------------------------------------------------- */

/**
 * WHERE THE WORKBOOK AND THE PRICE LIST LOADED HERE DISAGREE on how many offers break a clause
 * (verify 1, data round, J2: "the workbook's 16 of 571 on F15 is now 0 of 501, and the page never
 * says so"). Both figures are the files' own: the workbook's from the ledger, the sheet's counted
 * here. '' where they agree, where only one of them counted, or on a clause never refused.
 */
export function workbookSaid(s: StatedRule): string {
  if (!s.live || !s.measure || s.under) return ''
  const book = s.measure.tested - s.measure.held
  const here = s.live.exceptions.length
  if (book === here) return ''
  const was =
    book === 0
      ? `none of ${count(s.measure.tested)}`
      : `${count(book)} of ${count(s.measure.tested)}`
  const now = here === 0 ? 'none does' : here === 1 ? 'one does' : `${count(here)} do`
  return `The workbook this rule was found in counted ${was} breaking it; on the price list loaded here, ${now}.`
}

/* ---------------------------------------------------------- */
/* Said before it is added                                     */
/* ---------------------------------------------------------- */

/** "the Highfield Classic 340, Classic 360, Classic 380 and 2 more" — at most `shown` named. */
export function boatsNamed(boats: readonly string[], shown = 3): string {
  if (boats.length <= shown) return modelsSaid(boats)
  const head = modelsSaid(boats.slice(0, shown)).replace(/ and ([^,]+)$/, ', $1')
  return `${head} and ${count(boats.length - shown)} more`
}

/** A set of rules as one key, whatever order they were named in. */
const keyOf = (ids: readonly string[]): string => ids.toSorted().join('+')

/** What the heads-up reads: everything counted off the sheet before it is added. */
export interface HeadsIn {
  /** the partner's noun: "motor" */
  noun: string
  /** boats it would leave with nothing (`pairEmpties`) */
  empties: readonly { said: string; made: number; with: readonly string[] }[]
  /** rules of Northside's it cannot stand beside (`pairClashes`) */
  clashes: readonly { ruleId: string; boats: readonly string[] }[]
  /** "except the …" words that spare nothing (`pairExceptsIdle`) */
  idle: readonly string[]
  /** the number of a rule of Northside's that already says it, or '' */
  same: string
  /** it says what the price list was noticed doing */
  noticed: boolean
  /** a rule's number on the page, "2.4", or '' where it has none */
  numberOf: (id: string) => string
}

/**
 * THE THINGS SAID BEFORE IT IS ADDED, in the order they matter, EACH OTHER RULE ONCE (verify 1,
 * data round: three heads-ups quoted the other rule's whole sentence, two named 2 of the 5
 * Classics, and the GRT 425 was named twice). A boat it alone would empty; then, for each other
 * rule, the boats the two together would empty and the boats where nothing on sale keeps both —
 * a boat said in the first never said again in the second; an exception that spares nothing; a
 * rule that already says it; a pattern the price list was noticed keeping.
 */
export function headsSaid(h: HeadsIn): string[] {
  const out: string[] = []
  const rule = (id: string): string => {
    const n = h.numberOf(id)
    return n === '' ? 'another of your rules' : `your rule ${n}`
  }
  const alone = h.empties.filter((e) => e.with.length === 0)
  if (alone.length === 1)
    out.push(
      `The ${alone[0]!.said} would be offered no ${h.noun}: all ${count(alone[0]!.made)} your price list makes for it are taken.`,
    )
  else if (alone.length > 1)
    out.push(
      `${boatsNamed(alone.map((e) => e.said)).replace(/^the/, 'The')} would be offered no ${h.noun}: everything your price list makes for them is taken.`,
    )
  /* ONE SENTENCE PER SET OF OTHER RULES: the boats they empty together, and — where the set is one
     rule — the boats where nothing on sale keeps both, a boat said once */
  const sets: string[][] = []
  for (const e of h.empties)
    if (e.with.length > 0 && !sets.some((x) => keyOf(x) === keyOf(e.with))) sets.push([...e.with])
  for (const c of h.clashes) if (!sets.some((x) => keyOf(x) === c.ruleId)) sets.push([c.ruleId])
  const together = ['', '', 'the two', 'the three', 'the four']
  /* every boat already named, so a clash never names one again (verify 1: the GRT 425 twice) */
  const named = new Set(alone.map((e) => e.said))
  for (const ids of sets) {
    const key = keyOf(ids)
    const emptied = h.empties.filter((e) => keyOf(e.with) === key).map((e) => e.said)
    const clash = ids.length === 1 ? (h.clashes.find((c) => c.ruleId === ids[0])?.boats ?? []) : []
    const fights = clash.filter((b) => !emptied.includes(b) && !named.has(b))
    /* the clash's boats said already, in the sentence before (it alone empties them) */
    const known = clash.filter((b) => !emptied.includes(b) && named.has(b)).length
    for (const b of [...emptied, ...fights]) named.add(b)
    const whose =
      ids.length === 1
        ? rule(ids[0]!)
        : `your rules ${modelsSaid(ids.map((id) => h.numberOf(id) || '…')).replace(/^the /, '')}`
    const all = together[ids.length + 1] ?? `the ${count(ids.length + 1)}`
    const lines: string[] = []
    if (emptied.length > 0)
      lines.push(
        `Beside ${whose}, ${boatsNamed(emptied)} would be offered no ${h.noun} at all: ${all} together take everything your price list makes for ${emptied.length === 1 ? 'it' : 'them'}.`,
      )
    const more = fights.length === 1 ? 'one more boat' : `${count(fights.length)} more boats`
    if (fights.length > 0)
      lines.push(
        emptied.length > 0
          ? `On ${more}, ${boatsNamed(fights)}, no ${h.noun} on sale keeps both.`
          : known > 0
            ? `It cannot stand beside ${whose}: on those and ${more}, ${boatsNamed(fights)}, no ${h.noun} on sale keeps both.`
            : `It cannot stand beside ${whose}: on ${boatsNamed(fights)}, no ${h.noun} on sale keeps both.`,
      )
    else if (known > 0 && emptied.length === 0)
      lines.push(
        `Nor can it stand beside ${whose} on ${known === 1 ? 'it' : 'them'}: no ${h.noun} on sale keeps both.`,
      )
    if (lines.length > 0) out.push(lines.join(' '))
  }
  for (const x of h.idle)
    out.push(
      `The exception changes nothing: the ${x} is not among the boats the rest of the sentence speaks of.`,
    )
  if (h.same !== '') out.push(`It says what your rule ${h.same} already says.`)
  if (h.noticed)
    out.push(
      'It says what your price list was noticed doing: nothing it makes breaks it, so it takes nothing today.',
    )
  return out
}

/* ---------------------------------------------------------- */
/* Looked for and not true                                     */
/* ---------------------------------------------------------- */

/** One rule somebody might write, in the dealer's words, and what was counted against it. */
export interface RefutedSaid {
  said: string
  counted: string
}

/**
 * THE SIX, IN THIS PAGE'S OWN VOICE (verify 1, data round, item 9: straight apostrophes, "PLUS",
 * "Motor Library!FF WEIGHT", under a lead that claimed the price list as the source). Each is
 * keyed by its record's place among the workbook's refutations of its number (`refutedKey`:
 * "F10.3" is the third F10), and every figure in it is one that record's measure or verdict
 * carries — `read.test.ts` holds each line to its record, so nothing here is a new figure and a
 * record moved is a red test. They were counted on Northside's workbooks, and the lead says so.
 */
export function refutedKey<T extends { ref: string }>(record: T, all: readonly T[]): string {
  return `${record.ref}.${all.filter((r) => r.ref === record.ref).indexOf(record) + 1}`
}

export const REFUTED_SAID: Readonly<Record<string, RefutedSaid>> = {
  'F10.1': {
    said: 'A trailer’s ATM covers the boat’s weight and its maximum load together.',
    counted:
      'True on 73 of 139 of Highfield’s standard trailer offers. The maximum load is carried afloat, not towed.',
  },
  'F10.2': {
    said: 'A trailer’s width between the guards is at least the boat’s beam.',
    counted: 'True on 0 of 93. The hull sits over the guards, not between them.',
  },
  'F10.3': {
    said: 'A trailer’s boat-size range takes in the boat’s hull length.',
    counted: 'True on 83 of 166, and it could be tested on only 166 of 674 trailer offers.',
  },
  'F10.4': {
    said: 'A trailer’s boat size is at least the boat’s hull length.',
    counted:
      'True on 8 of 85 counted one way and 127 of 166 another. The size is a class, typically 0.34 m under the hull length.',
  },
  'F11.1': {
    said: 'Any rule on a trailer’s width between the guards, or on its length.',
    counted:
      'The width between the guards is written on 74 of 476 trailer lines, and the length on 75: a rule on them could not see six trailers in seven.',
  },
  'F11.2': {
    said: 'A motor never weighs more than the boat’s maximum motor weight.',
    counted:
      'True wherever it could be tested, 49 of 49, but the boat’s maximum motor weight is written on 10 of 2,005 boat lines and a motor’s weight on 121 of 362 models.',
  },
}

/* ---------------------------------------------------------- */
/* The house rules as words, to share                          */
/* ---------------------------------------------------------- */

/**
 * THE HOUSE RULES AS PLAIN WORDS, to share or paste where Northside signs things (verify 1, data
 * round, J15: "no share"). The page's own parts, numbers, sentences and figures — nothing the
 * page does not say — headed by whose rules they are and the price list they were counted on.
 */
export function houseText(book: readonly Part[], who: string, dated: string): string {
  const lines: string[] = []
  lines.push(
    who === ''
      ? 'The house rules: what may be sold with what'
      : `${who} — the house rules: what may be sold with what`,
  )
  if (dated !== '') lines.push(dated)
  for (const part of book) {
    lines.push('', `${part.n} ${part.name}`)
    for (const { at, item } of part.stated) {
      const fig = figureOf(item)
      lines.push(
        `${at} ${item.said}${fig ? ` (${count(fig.shown)} of ${count(fig.of)} ${item.counted})` : ''}`,
      )
    }
    for (const { at, item } of part.yours) {
      const noun = KIND_NOUN[item.reach.kind].one
      const line = verbLine(item.verb, noun, item.rule.severity === 'warn' ? 'warn' : 'block')
      lines.push(
        `${at} ${item.said} ${line.lead} ${VERB_WORD[item.verb]} ${line.tail} ${item.rule.because}.`,
      )
    }
  }
  return lines.join('\n')
}
