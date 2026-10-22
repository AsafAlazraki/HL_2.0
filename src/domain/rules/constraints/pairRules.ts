/* ============================================================
   WHAT MAY BE SOLD WITH WHAT — a rule about a BOAT and the thing
   that goes on it, read the way the build reads a pick.

   ── THE GAP THIS FILE CLOSES ─────────────────────────────────

   Every sentence `describe.ts` writes is ONE KIND OF TABLE by
   construction: `state.tablesFor` keeps only the tables that carry
   every column a sentence names, so "When the boat's Eng
   Configuration is Remote, the motor's Control must not be Tiller
   handle" reaches no table and reports itself unscoped. That is the
   wall nine of the sixteen workbook rules are listed behind
   (`workbookRules.ts`, `blocked: 'CROSS-KIND…'`), and it is the wall
   Milestone 3's exit criterion stands on the other side of: a rule a
   dealer writes on /rules has to change what the BUILD refuses on the
   next pick, and every pick in the build is a boat and a second thing.

   So this file reads ONE shape and reads it well: a single condition
   on the boat, a single obligation on the motor or the trailer, each a
   column compared with one of its own values.

     When the boat's  Eng Configuration  is      Remote,
          the motor's Control            must not be Tiller handle.

   It is stored as an ordinary `ConstraintDef` — kind `implies`, one
   clause each side, literal values — so the repository, the observed
   coercion in `adopt.ts`, the switch and the delete in
   `constraintDefs.ts` all hold it exactly as they hold any rule. What
   is new is only the reading: each clause is read off the row of ITS
   OWN kind — the boat's column off the boat, the motor's off the
   motor — which is the pair-scoped reading `workbookRules.ts` names as
   the missing piece ("a pair-scoped FieldPath so a rule can name the
   boat and the motor of one pairing").

   ── A BLANK NEVER REFUSES ────────────────────────────────────

   The ten curation rules are FAIL-OPEN (`catalogue/curation`), and so
   is this: a boat whose cell is empty is not a boat the rule is about,
   and a motor whose cell is empty is not a motor the rule can judge.
   Neither is refused. A rule that refused what it could not read would
   empty a list on a gap in the price list, and nobody would ever know
   why the list was short.

   ── EVERY FIGURE IS COUNTED HERE, NONE IS TYPED ───────────────

   `pairReach` counts the loaded sheet on every call: the boats a rule
   is about, the motors or trailers it would refuse on them, and the
   pairings the price list writes for those boats that it would take
   away. The denominators are the ones every other screen uses —
   what is on sale on live lists, so 434 trailers and 241 motors on the
   Northside file, never the 444 trailer rows the seed carries with
   its obsolete ten, and 289 boats counted as MODELS (`modelKeyOf`),
   the picker's and Home's figure, never the 810 lines behind them.

   ── A SIDE NAMES A SPEC, IN THE DEALER'S WORD ─────────────────

   Since 2026-10-22 a side names a SPEC (`pairSpecs.ts`) — the boat's
   maker, steering, shaft or length; the motor's horsepower — never a
   column header, and a spec may be a word chosen from a list or a
   figure compared ("is over 6 m"). A rule filed before then names one
   column's own id and is read as the spec that column is; nothing
   filed is lost.

   Pure. No React, no store, no DOM.
   ============================================================ */

import { isDiscontinued, isRetired, readCell } from '@/domain/model'
import type {
  CellValue,
  Clause,
  CompareOp,
  ConstraintDef,
  EntityDef,
  RowData,
  TableKind,
} from '@/domain/model'
import { newId } from '@/domain/id'
import { lineSaid, spokenBoat } from '@/domain/quote/spoken'
import { modelKeyOf } from '@/domain/quote/boats'
import { rowLabel } from '@/domain/model'
import {
  PAIR_SPECS,
  norm,
  specByFieldId,
  specByKey,
  specFieldId,
  specKey,
  specOfColumn,
  specValue,
  valueSaid,
  type PairSpec,
  type SpecMeasure,
} from './pairSpecs'

/* ---------------------------------------------------------- */
/* The world it reads                                          */
/* ---------------------------------------------------------- */

/** The sheet, as much of it as a pair rule reads. `CatalogueCtx` and `CatalogueData` both are. */
export interface PairWorld {
  entities: Readonly<Record<string, EntityDef>>
  rowsByEntity: Readonly<Record<string, readonly RowData[]>>
}

/** What goes ON a boat, as a pair rule names it. */
export type PartnerKind = 'motor' | 'trailer'

export const PARTNER_KINDS: readonly PartnerKind[] = ['motor', 'trailer']

/** What a side can say of its spec: a word is or is not; a figure is over, under, at least or at
 *  most. */
export type PairOp = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte'

export const CONDITION_WORD: Record<PairOp, string> = {
  eq: 'is',
  neq: 'is not',
  gt: 'is over',
  lt: 'is under',
  gte: 'is at least',
  lte: 'is at most',
}
export const OBLIGATION_WORD: Record<PairOp, string> = {
  eq: 'must be',
  neq: 'must not be',
  gt: 'must be over',
  lt: 'must be under',
  gte: 'must be at least',
  lte: 'must be at most',
}

/** The words a side of each measure may say, the first its default. */
export const OPS_FOR: Record<SpecMeasure, readonly PairOp[]> = {
  word: ['eq', 'neq'],
  figure: ['gt', 'lt', 'gte', 'lte'],
}

/** The word a figure's condition and obligation open on: "a boat over 6 m", "a motor at most
 *  60 hp". */
export const FIRST_OP: Record<'boat' | 'partner', Record<SpecMeasure, PairOp>> = {
  boat: { word: 'eq', figure: 'gt' },
  partner: { word: 'eq', figure: 'lte' },
}

/** The noun a kind is said by in the sentence: "the boat's", "the motor's". */
export const KIND_NOUN: Record<'boat' | PartnerKind, { one: string; many: string }> = {
  boat: { one: 'boat', many: 'boats' },
  motor: { one: 'motor', many: 'motors' },
  trailer: { one: 'trailer', many: 'trailers' },
}

/** A value as the sentence and the comparison both read it: trimmed text, or nothing. */
export function valueText(v: CellValue | undefined): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

const live = (t: EntityDef): boolean => !isRetired(t)

/** Sellable rows of a live table — the denominator every screen counts by. */
function sellable(world: PairWorld, table: EntityDef): readonly RowData[] {
  if (!live(table)) return []
  return (world.rowsByEntity[table.id] ?? []).filter((r) => !isDiscontinued(r))
}

const tablesOf = (world: PairWorld, kind: TableKind): EntityDef[] =>
  Object.values(world.entities).filter((t) => t.kind === kind && live(t))

/**
 * WHAT ONE THING IS, COUNTED (built-critique-m3-2.md, major 4: "565 of 810 boats" here beside
 * "289" on the picker). A boat is counted as a MODEL — `modelKeyOf`, the one place that decides
 * what a model is, so Highfield's 588 lines are its 67 models here as on Home, Data and the
 * picker. A motor or a trailer is its own line: each one is a thing sold.
 */
const countedAs = (table: EntityDef, row: RowData): string =>
  table.kind === 'boat' ? modelKeyOf(table, row) : row.id

/* ---------------------------------------------------------- */
/* The columns a pair sentence may name                        */
/* ---------------------------------------------------------- */

/** Above this many values a list is read in its own order (a model, a series) rather than
 *  most-carried first, so a person scanning it finds the SP660 after the SP560. */
export const LONG_LIST = 24

export interface PairValue {
  /** the value as a rule files it: the word as the file writes it, a shaft in inches */
  value: string
  /** the value as the sentence says it: "tiller", "long (20″)" */
  said: string
  /** what carries it on sale: boats counted as models (`modelKeyOf`), motors and trailers
   *  as lines */
  count: number
}

/** One spec as this sheet carries it — "steering", on every boat list that writes one. */
export interface PairColumn {
  /** `kind::spec`, stable across reloads */
  key: string
  kind: 'boat' | PartnerKind
  /** the dealer's word for it */
  name: string
  /** the field id a clause stores: the spec's own (`spec:boat:steering`) */
  fieldId: string
  measure: SpecMeasure
  /** a figure's unit ("m", "hp", "kg"); '' for a word */
  unit: string
  /** how a figure is asked for: "in metres" */
  unitAsked: string
  /** a word's values, counted on sellable rows; [] for a figure */
  values: PairValue[]
  /** a figure's spread on sale: the least and the most, and how many things carry one */
  spread: { lo: number; hi: number; count: number } | null
}

const columnOf = (spec: PairSpec): Omit<PairColumn, 'values' | 'spread'> => ({
  key: specKey(spec),
  kind: spec.kind,
  name: spec.word,
  fieldId: specFieldId(spec),
  measure: spec.measure,
  unit: spec.unit,
  unitAsked: spec.unitAsked,
})

/**
 * EVERY SPEC A PAIR SENTENCE MAY NAME FOR ONE KIND, in the dealer's words, each with what the
 * loaded sheet carries for it: a word's values counted, a figure's spread. A spec this sheet
 * writes on fewer than two different values is not offered — there is nothing to choose
 * between.
 */
export function pairColumns(world: PairWorld, kind: 'boat' | PartnerKind): PairColumn[] {
  const tables = tablesOf(world, kind)
  const out: PairColumn[] = []
  for (const spec of PAIR_SPECS) {
    if (spec.kind !== kind) continue
    /* a value's count is the boats (as models) or the motors and trailers carrying it */
    const counts = new Map<string, Set<string>>()
    let lo = Infinity
    let hi = -Infinity
    const carried = new Set<string>()
    for (const table of tables) {
      for (const row of sellable(world, table)) {
        const v = specValue(spec, table, row)
        if (v === null) continue
        const one = countedAs(table, row)
        if (typeof v === 'number') {
          lo = Math.min(lo, v)
          hi = Math.max(hi, v)
          carried.add(one)
          counts.set(String(v), new Set())
        } else counts.set(v, (counts.get(v) ?? new Set()).add(one))
      }
    }
    if (counts.size < 2) continue
    if (spec.measure === 'figure') {
      out.push({ ...columnOf(spec), values: [], spread: { lo, hi, count: carried.size } })
      continue
    }
    const values = [...counts.entries()].map(([value, holders]) => ({
      value,
      said: valueSaid(spec, value),
      count: holders.size,
    }))
    values.sort((a, b) =>
      values.length > LONG_LIST || spec.id === 'shaft'
        ? a.value.localeCompare(b.value, 'en-AU', { numeric: true })
        : b.count - a.count || a.value.localeCompare(b.value, 'en-AU'),
    )
    out.push({ ...columnOf(spec), values, spread: null })
  }
  return out
}

/* ---------------------------------------------------------- */
/* Reading a rule as a pair                                    */
/* ---------------------------------------------------------- */

/** One side of the sentence: a spec, a word and a value. A side not yet answered says so. */
export interface PairSide {
  /** the spec's key (`kind::spec`), or '' while nobody has chosen one */
  key: string
  /** the dealer's word for the spec */
  name: string
  fieldId: string
  measure: SpecMeasure
  op: PairOp
  /** '' while nobody has chosen one; a figure as its digits */
  value: string
  /** the value as the sentence says it: "tiller", "long (20″)", "6 m" */
  said: string
}

/** A side as a spec reads it, for a screen and for a filed clause alike. */
export function sideFor(spec: PairSpec | null, op: PairOp, value: string): PairSide {
  if (!spec) return { key: '', name: '', fieldId: '', measure: 'word', op, value: '', said: '' }
  const ops = OPS_FOR[spec.measure]
  const v = value.trim()
  return {
    key: specKey(spec),
    name: spec.word,
    fieldId: specFieldId(spec),
    measure: spec.measure,
    op: ops.includes(op) ? op : ops[0]!,
    value: v,
    said: v === '' ? '' : valueSaid(spec, v),
  }
}

/** A figure as a person typed it, read as a number, or null where it is not one. */
export function typedFigure(value: string): number | null {
  const t = value.trim().replace(/,/g, '')
  if (!/^\d+(?:\.\d+)?$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** A rule in the one shape this file reads. */
export interface PairShape {
  boat: PairSide
  partnerKind: PartnerKind
  partner: PairSide
}

/** Where a field id lives: its table's kind and its column's normalised name. */
interface Home {
  kind: TableKind
  name: string
  norm: string
}

/** Every field on the sheet, by id — built once per reading, because a clause stores one table's
 *  field id and is read on every table of its kind. */
function homes(world: PairWorld): Map<string, Home> {
  const out = new Map<string, Home>()
  for (const table of Object.values(world.entities)) {
    const kind = table.kind ?? 'custom'
    for (const field of table.fields)
      out.set(field.id, { kind, name: field.name.trim(), norm: norm(field.name) })
  }
  return out
}

const PAIR_OPS: readonly CompareOp[] = ['eq', 'neq', 'gt', 'lt', 'gte', 'lte']
const isPairOp = (op: CompareOp): op is PairOp => PAIR_OPS.includes(op)

/** The spec a clause names: its own (`spec:boat:length`), or, for a rule filed before specs, the
 *  spec its one column is read as. */
function specOfClause(fieldId: string, at: Map<string, Home>): PairSpec | null {
  const own = specByFieldId(fieldId)
  if (own) return own
  const home = at.get(fieldId)
  return home ? specOfColumn(home.kind, home.name) : null
}

function sideOf(clause: Clause | undefined, at: Map<string, Home>): PairSide | null {
  if (!clause || !isPairOp(clause.op) || clause.left.viaFieldId) return null
  const right = clause.right
  if (right && right.kind !== 'literal') return null
  const written = right ? valueText(right.value) : ''
  if (clause.left.fieldId === '') return { ...sideFor(null, clause.op, ''), value: written }
  const spec = specOfClause(clause.left.fieldId, at)
  if (!spec || !OPS_FOR[spec.measure].includes(clause.op)) return null
  /* A RULE FILED BEFORE SPECS wrote a shaft as the boat's own letter ("L"): read it as the
     spec reads a cell, so it is the same 20″ the sentence now says */
  const own = specByFieldId(clause.left.fieldId) !== null
  const read = own || written === '' ? written : spec.read(written)
  const value = read === null ? written : String(read)
  return sideFor(spec, clause.op, value)
}

/**
 * THE RULE AS A PAIR, or null when it is not one: kind `implies`, one clause on a boat column,
 * one on a motor or trailer column, each `is` or `is not` a value. Anything else — a single-kind
 * sentence, a set of values, a workbook whitelist — is read by `state.ts` as it always was.
 */
export function pairShapeOf(
  c: ConstraintDef,
  world: PairWorld,
  at = homes(world),
): PairShape | null {
  if (c.kind !== 'implies') return null
  if (c.if.clauses.length !== 1 || c.then?.clauses.length !== 1) return null
  const boat = sideOf(c.if.clauses[0], at)
  const partner = sideOf(c.then.clauses[0], at)
  if (!boat || !partner) return null
  if (boat.key !== '' && !boat.key.startsWith('boat::')) return null
  /* A FILED RULE NAMES BOTH COLUMNS: a sentence still being written lives on the screen that is
     writing it, and the store is never handed half of one */
  if (boat.key === '' || partner.key === '') return null
  const kind = partner.key.split('::')[0]
  if (kind !== 'motor' && kind !== 'trailer') return null
  return { boat, partnerKind: kind, partner }
}

/** A side is answered: a spec, and a value it can compare — a figure only once it is a number. */
const sideReady = (side: PairSide): boolean =>
  side.key !== '' &&
  side.value !== '' &&
  (side.measure !== 'figure' || typedFigure(side.value) !== null)

/** Every choice the sentence asks for has been made. */
export const pairReady = (s: PairShape): boolean => sideReady(s.boat) && sideReady(s.partner)

/** What one side still asks for, or null. */
function sideMissing(side: PairSide, noun: string): string | null {
  if (side.value === '')
    return side.measure === 'figure'
      ? `Type the ${noun}’s ${side.name}, ${specByKey(side.key)?.unitAsked ?? 'as a figure'}.`
      : `Choose the ${noun}’s ${side.name}.`
  if (side.measure === 'figure' && typedFigure(side.value) === null)
    return `The ${noun}’s ${side.name} is a figure: type it as digits, like 6 or 150.`
  return null
}

/** What is still to be chosen, as one sentence, in reading order — or null when nothing is. */
export function pairMissing(s: PairShape, because: string): string | null {
  if (s.boat.key === '') return 'Choose which of the boat’s specs this rule looks at.'
  const boat = sideMissing(s.boat, 'boat')
  if (boat) return boat
  const noun = KIND_NOUN[s.partnerKind].one
  if (s.partner.key === '') return `Choose which of the ${noun}’s specs this rule decides.`
  const partner = sideMissing(s.partner, noun)
  if (partner) return partner
  if (because.trim() === '') return 'Say why, so the build can say it where it refuses.'
  return null
}

/* ---------------------------------------------------------- */
/* Writing one                                                 */
/* ---------------------------------------------------------- */

export interface PairDraftArgs {
  orgId: string
  boat: { column: PairColumn | null; op: PairOp; value: string }
  partnerKind: PartnerKind
  partner: { column: PairColumn | null; op: PairOp; value: string }
  because: string
  severity: 'block' | 'warn'
  enabled: boolean
  now: string
  /** the rule this draft rewrites, so it keeps its id and its first date */
  was?: ConstraintDef
}

/** A side as the store files it: the spec's own field id, and its value — a figure as a number. */
function clauseFor(
  id: string,
  side: { column: PairColumn | null; op: PairOp; value: string },
): Clause {
  const figure = side.column?.measure === 'figure' ? typedFigure(side.value) : null
  const value: CellValue = figure ?? (side.value.trim() === '' ? null : side.value.trim())
  return {
    id,
    left: { fieldId: side.column?.fieldId ?? '' },
    op: side.op,
    right: { kind: 'literal', value },
  }
}

/** The rule a sentence on screen is, as the store files it. */
export function pairRule(a: PairDraftArgs): ConstraintDef {
  const id = a.was?.id ?? newId()
  return {
    id,
    orgId: a.orgId,
    kind: 'implies',
    if: { combinator: 'AND', clauses: [clauseFor(`${id}#if0`, a.boat)] },
    then: { combinator: 'AND', clauses: [clauseFor(`${id}#then0`, a.partner)] },
    because: a.because.trim(),
    severity: a.severity,
    enabled: a.enabled,
    source: 'Northside',
    ...(a.was ? { edited: true } : {}),
    createdAt: a.was?.createdAt ?? a.now,
    updatedAt: a.now,
  }
}

/* ---------------------------------------------------------- */
/* Saying one                                                  */
/* ---------------------------------------------------------- */

/** One word of the sentence, and which choice it is, so a screen can make that word a control. */
export interface PairWord {
  role:
    | 'word'
    | 'boat-column'
    | 'boat-op'
    | 'boat-value'
    | 'partner-kind'
    | 'partner-column'
    | 'partner-op'
    | 'partner-value'
  text: string
  /** a choice nobody has made yet — drawn as a gap, never as a name */
  unchosen?: boolean
  /** sits against the word before it */
  tight?: boolean
  /** its place in the sentence, as a name a list can be keyed by */
  key: string
}

/** THE SENTENCE, as words. The screen draws it, the build quotes it, and a reader hears it. */
export function pairWords(s: PairShape): PairWord[] {
  const partner = KIND_NOUN[s.partnerKind].one
  const words: Omit<PairWord, 'key'>[] = [
    { role: 'word', text: 'When the boat’s' },
    s.boat.key === ''
      ? { role: 'boat-column', text: 'spec', unchosen: true }
      : { role: 'boat-column', text: s.boat.name },
    { role: 'boat-op', text: CONDITION_WORD[s.boat.op] },
    s.boat.value === ''
      ? { role: 'boat-value', text: '…', unchosen: true }
      : { role: 'boat-value', text: s.boat.said || s.boat.value },
    { role: 'word', text: ',', tight: true },
    { role: 'word', text: 'the' },
    { role: 'partner-kind', text: `${partner}’s` },
    s.partner.key === ''
      ? { role: 'partner-column', text: 'spec', unchosen: true }
      : { role: 'partner-column', text: s.partner.name },
    { role: 'partner-op', text: OBLIGATION_WORD[s.partner.op] },
    s.partner.value === ''
      ? { role: 'partner-value', text: '…', unchosen: true }
      : { role: 'partner-value', text: s.partner.said || s.partner.value },
    { role: 'word', text: '.', tight: true },
  ]
  return words.map((w, at) => ({ ...w, key: `${w.role}:${at}` }))
}

export function joinWords(words: readonly PairWord[]): string {
  let out = ''
  for (const w of words) out += (out === '' || w.tight ? '' : ' ') + w.text
  return out
}

/** The sentence as plain text — the rule's name everywhere it is named. */
export const pairSaid = (s: PairShape): string => joinWords(pairWords(s))

/* ---------------------------------------------------------- */
/* Judging one pick                                            */
/* ---------------------------------------------------------- */

export type PairVerdict = 'keeps' | 'breaks' | 'not-about'

const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase()

/** What one row says for one side's spec, or null where it says nothing the spec reads. */
function readSide(side: PairSide, table: EntityDef, row: RowData): string | number | null {
  const spec = specByKey(side.key)
  return spec ? specValue(spec, table, row) : null
}

/** Whether a row's value keeps the side's word: a word is or is not the value; a figure is over,
 *  under, at least or at most it. A figure compared with a word, or a word with a figure, holds
 *  nothing and refuses nothing — it is not read. */
function holds(op: PairOp, cell: string | number, value: string): boolean | null {
  if (op === 'eq' || op === 'neq') {
    if (typeof cell !== 'string') return null
    return op === 'eq' ? same(cell, value) : !same(cell, value)
  }
  const want = typedFigure(value)
  if (typeof cell !== 'number' || want === null) return null
  if (op === 'gt') return cell > want
  if (op === 'lt') return cell < want
  if (op === 'gte') return cell >= want
  return cell <= want
}

/**
 * WHAT ONE RULE SAYS ABOUT ONE PICK — this boat, that motor. `not-about` where the rule does not
 * speak: the partner is another kind, the boat's condition does not hold, or either cell is
 * blank or missing (a blank never refuses — see the header).
 */
export function judgePair(
  s: PairShape,
  boat: { table: EntityDef; row: RowData },
  partner: { table: EntityDef; row: RowData },
): PairVerdict {
  if (!pairReady(s)) return 'not-about'
  if (partner.table.kind !== s.partnerKind || boat.table.kind !== 'boat') return 'not-about'
  const b = readSide(s.boat, boat.table, boat.row)
  if (b === null || holds(s.boat.op, b, s.boat.value) !== true) return 'not-about'
  const p = readSide(s.partner, partner.table, partner.row)
  if (p === null) return 'not-about'
  const kept = holds(s.partner.op, p, s.partner.value)
  if (kept === null) return 'not-about'
  return kept ? 'keeps' : 'breaks'
}

/** What every rule in force says about one pick: the rule that refuses it, and those that warn. */
export interface PickRuling {
  refusedBy: ConstraintDef | null
  warnedBy: ConstraintDef[]
}

/**
 * ONE READING OF THE RULES IN FORCE, built once per screen paint and asked per pick. Only rules
 * switched ON reach a pick; a rule switched off refuses nothing and warns of nothing, which is
 * the whole of what "off" means. A `warn` rule never refuses (`adopt.ts` holds every observed
 * rule there). Where two rules refuse one pick, the one with the higher priority speaks, then
 * the older.
 */
export function pairRuling(
  world: PairWorld,
  rules: readonly ConstraintDef[],
): {
  rules: { rule: ConstraintDef; shape: PairShape }[]
  pick: (
    boat: { table: EntityDef; row: RowData },
    partner: { table: EntityDef; row: RowData },
  ) => PickRuling
} {
  const at = homes(world)
  const shaped: { rule: ConstraintDef; shape: PairShape }[] = []
  for (const rule of rules) {
    if (!rule.enabled) continue
    const shape = pairShapeOf(rule, world, at)
    if (shape && pairReady(shape)) shaped.push({ rule, shape })
  }
  shaped.sort(
    (a, b) =>
      (b.rule.priority ?? 0) - (a.rule.priority ?? 0) ||
      a.rule.createdAt.localeCompare(b.rule.createdAt),
  )
  return {
    rules: shaped,
    pick: (boat, partner) => {
      let refusedBy: ConstraintDef | null = null
      const warnedBy: ConstraintDef[] = []
      for (const { rule, shape } of shaped) {
        if (judgePair(shape, boat, partner) !== 'breaks') continue
        if (rule.severity === 'warn') warnedBy.push(rule)
        else refusedBy ??= rule
      }
      return { refusedBy, warnedBy }
    },
  }
}

/* ---------------------------------------------------------- */
/* What it would reach, before it is on                        */
/* ---------------------------------------------------------- */

/** A thing on the price list, said as every screen says it: "Yamaha F25SWTC". */
export const thingSaid = (table: EntityDef, row: RowData): string =>
  lineSaid(rowLabel(table, row), table.name)

/** A boat as a person says its model — "Highfield Classic 340" — never its colourway code: the
 *  sale a rule costs is a model, and every colour of it loses the same motor. */
export function boatSaid(table: EntityDef, row: RowData): string {
  const name = spokenBoat(table.id, rowLabel(table, row)).name
  return name === '' ? thingSaid(table, row) : name
}

export interface PairExample {
  /** a real boat the rule is about */
  boat: string
  /** what the rule refuses on it, by name — at most three */
  names: string[]
  /** how many more it refuses on that boat */
  more: number
  /** true when the names are ones the price list makes for this boat; false when they are
   *  reached only by searching past its list */
  made: boolean
}

export interface PairReach {
  kind: PartnerKind
  /** sellable boats on live tables, counted as models (`modelKeyOf`) — the picker's 289 */
  boats: number
  /** of them, the models with a version whose condition holds; 0 until the condition is chosen */
  about: number
  /** sellable motors or trailers on live tables */
  partners: number
  /** of them, the ones whose own cell breaks the obligation; 0 until it is chosen */
  refused: number
  /** what the price list makes for the boats it is about — its own pairings, on sale both sides */
  made: number
  /** of them, the ones the rule would take away */
  taken: number
  /** how many lines of the boat lists lose one of those — a model's colourways each a line */
  boatsLosing: number
  /** how many different models those lines are (`modelKeyOf`) — the colours of one model are
   *  one sale */
  modelsLosing: number
  /** a real boat and what it would no longer be offered, or null when it refuses nothing */
  example: PairExample | null
  /** the condition is chosen */
  conditionReady: boolean
  /** every choice is made */
  ready: boolean
}

/** Every pairing the price list writes between a boat and one kind, on sale on both sides. */
function pairingsOf(
  world: PairWorld,
  kind: PartnerKind,
): { boat: { table: EntityDef; row: RowData }; partner: { table: EntityDef; row: RowData } }[] {
  const rowAt = new Map<string, { table: EntityDef; row: RowData }>()
  for (const table of [...tablesOf(world, 'boat'), ...tablesOf(world, kind)])
    for (const row of sellable(world, table)) rowAt.set(row.id, { table, row })
  const out: ReturnType<typeof pairingsOf> = []
  for (const join of Object.values(world.entities)) {
    if (join.role !== 'join' || !live(join)) continue
    const refs = join.fields.filter((f) => f.type === 'reference' && f.refEntityId)
    const toBoat = refs.find((f) => world.entities[f.refEntityId!]?.kind === 'boat')
    const toPartner = refs.find(
      (f) => f !== toBoat && world.entities[f.refEntityId!]?.kind === kind,
    )
    if (!toBoat || !toPartner) continue
    for (const row of world.rowsByEntity[join.id] ?? []) {
      const boat = rowAt.get(valueText(readCell(row, toBoat.id)))
      const partner = rowAt.get(valueText(readCell(row, toPartner.id)))
      if (boat && partner && boat.table.kind === 'boat' && partner.table.kind === kind)
        out.push({ boat, partner })
    }
  }
  return out
}

/**
 * WHAT THIS SENTENCE WOULD DO TO THE SHEET AS IT STANDS — counted, never stored, so the figure
 * a dealer reads before pressing Add is the figure the build will act on a second later. Half
 * answered, it still counts what it can: with only the condition chosen it says how many boats
 * it is about.
 */
export function pairReach(s: PairShape, world: PairWorld): PairReach {
  const kind = s.partnerKind
  const boats = tablesOf(world, 'boat').flatMap((table) =>
    sellable(world, table).map((row) => ({ table, row })),
  )
  const partners = tablesOf(world, kind).flatMap((table) =>
    sellable(world, table).map((row) => ({ table, row })),
  )
  const conditionReady = s.boat.key !== '' && s.boat.value !== ''
  const ready = pairReady(s)
  const models = (list: readonly { table: EntityDef; row: RowData }[]): number =>
    new Set(list.map((b) => modelKeyOf(b.table, b.row))).size
  const blank: PairReach = {
    kind,
    boats: models(boats),
    about: 0,
    partners: partners.length,
    refused: 0,
    made: 0,
    taken: 0,
    boatsLosing: 0,
    modelsLosing: 0,
    example: null,
    conditionReady,
    ready,
  }
  if (!conditionReady) return blank

  const boatHolds = (b: { table: EntityDef; row: RowData }): boolean => {
    const v = readSide(s.boat, b.table, b.row)
    return v !== null && holds(s.boat.op, v, s.boat.value) === true
  }
  const aboutBoats = boats.filter(boatHolds)
  const about = models(aboutBoats)
  if (!ready) return { ...blank, about }

  const breaks = (p: { table: EntityDef; row: RowData }): boolean => {
    const v = readSide(s.partner, p.table, p.row)
    return v !== null && holds(s.partner.op, v, s.partner.value) === false
  }
  const refusedRows = partners.filter(breaks)

  /* WHAT THE PRICE LIST MAKES FOR THOSE BOATS, and what of it the rule would take away */
  const byBoat = new Map<string, { boat: { table: EntityDef; row: RowData }; names: string[] }>()
  let made = 0
  let taken = 0
  for (const pair of pairingsOf(world, kind)) {
    if (!boatHolds(pair.boat)) continue
    made += 1
    if (!breaks(pair.partner)) continue
    taken += 1
    const entry = byBoat.get(pair.boat.row.id) ?? { boat: pair.boat, names: [] }
    const name = thingSaid(pair.partner.table, pair.partner.row)
    if (!entry.names.includes(name)) entry.names.push(name)
    byBoat.set(pair.boat.row.id, entry)
  }

  /* THE SAME BOAT ON EVERY LOAD: where two boats lose as much, the one said first in the
     file's own order of names speaks — never whichever the store happened to read first
     (built-critique-m3.md: "the boat it names changes from load to load") */
  const byName = (a: string, b: string): number => a.localeCompare(b, 'en-AU', { numeric: true })

  let example: PairExample | null = null
  if (byBoat.size > 0) {
    /* the boat that loses most, so the sentence names the sale it costs most */
    const worst = [...byBoat.values()]
      .map((e) => ({ ...e, said: boatSaid(e.boat.table, e.boat.row) }))
      .sort((a, b) => b.names.length - a.names.length || byName(a.said, b.said))[0]!
    const names = worst.names.toSorted(byName)
    example = {
      boat: worst.said,
      names: names.slice(0, 3),
      more: Math.max(0, names.length - 3),
      made: true,
    }
  } else if (aboutBoats.length > 0 && refusedRows.length > 0) {
    /* NOTHING THE PRICE LIST MAKES IS TAKEN, so the sale it changes is a search past the list:
       the boat it is about that the price list gives most to, and what can no longer go on it */
    const counts = new Map<string, number>()
    for (const pair of pairingsOf(world, kind))
      counts.set(pair.boat.row.id, (counts.get(pair.boat.row.id) ?? 0) + 1)
    const busiest = aboutBoats
      .map((b) => ({ ...b, said: boatSaid(b.table, b.row) }))
      .sort(
        (a, b) =>
          (counts.get(b.row.id) ?? 0) - (counts.get(a.row.id) ?? 0) || byName(a.said, b.said),
      )[0]!
    const names = [...new Set(refusedRows.map((p) => thingSaid(p.table, p.row)))].sort(byName)
    example = {
      boat: busiest.said,
      names: names.slice(0, 3),
      more: Math.max(0, names.length - 3),
      made: false,
    }
  }

  return {
    ...blank,
    about,
    refused: refusedRows.length,
    made,
    taken,
    boatsLosing: byBoat.size,
    modelsLosing: models([...byBoat.values()].map((e) => e.boat)),
    example,
  }
}
