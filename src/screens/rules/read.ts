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
      group: entry.group,
      said: entry.said,
      counted: entry.counted,
      measure,
      shown: measure ? shownOf(entry, measure) : 0,
      under: entry.counts === 'under',
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
  for (const part of book) {
    kept += part.stated.length
    written += part.yours.length
    off += part.yours.filter((y) => y.item.verb === 'off').length
  }
  return { kept, written, off }
}

/** The lede's two sentences of fact: "Your price list keeps 7 of these on its own, each measured
 *  on it. Northside has written 2, 1 of them off." */
export function houseSaid({ kept, written, off }: House): string {
  const keeps = `Your price list keeps ${count(kept)} of these on its own, each measured on it.`
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
