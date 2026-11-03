/* ============================================================
   WHAT A RULE TAKES, BY NAME — before it is added, and after.

   `pairReach` counts and `pairField` draws one mark a model; neither
   hands a reader the 45 offers behind "45 of 540 taken away", and the
   lit marks had no names (judge.md, data round, 2026-11-03, J4 and
   missing items 2 and 6). This file says, off the same pairings and
   the same `judgePair` the build asks:

     · `pairTaken`   every offer it takes away, boat by boat, maker by
                     maker — "Classic 340 → Yamaha F25SWTC".
     · `pairOnBoat`  one boat's own list with the rule on, which is what
                     the salesperson will see on the build.
     · `pairEmpties` a boat the rule (alone, or beside Northside's other
                     rules) would leave with nothing at all of that kind
                     — "the 2350 Ultra Centrecab would be offered no
                     trailer" — said before it is added.
     · `pairClashes` another of Northside's rules the sentence cannot
                     stand beside: both speak of one boat and no motor or
                     trailer on sale keeps both.
     · `pairOnQuotes` the quotes standing in this browser whose boat it
                     speaks of, and what on them it would refuse.

   Nothing here is stored and nothing is typed: every name is a row's
   own, said as every screen says it, and every figure is counted on
   the call. Pure. No React, no store, no DOM.
   ============================================================ */

import { isDiscontinued, isRetired } from '@/domain/model'
import type { ConstraintDef, EntityDef, QuoteDef, RowData } from '@/domain/model'
import { modelKeyOf } from '@/domain/quote/boats'
import {
  boatSaid,
  judgePair,
  pairAbout,
  pairReady,
  pairShapeOf,
  pairingsOf,
  thingSaid,
  type PairShape,
  type PairWorld,
} from './pairRules'
import { makerOfTable } from '@/domain/catalogue/makers'

interface Thing {
  table: EntityDef
  row: RowData
}

const byName = (a: string, b: string): number => a.localeCompare(b, 'en-AU', { numeric: true })

/** One boat model and what the rule takes from what the price list makes for it. */
export interface TakenModel {
  key: string
  /** the model as a person says it: "Highfield Classic 340" */
  said: string
  /** what it loses, by name, each once */
  what: string[]
  /** how many it was made: what it loses is out of this many */
  made: number
}

export interface TakenMaker {
  maker: string
  models: TakenModel[]
  /** offers taken from this maker's boats, colourways each an offer, as `pairReach.taken` counts */
  offers: number
}

/** A boat model and everything the price list makes for it of one kind, once per model. */
interface ModelOffers {
  key: string
  said: string
  maker: string
  /** each partner once, by its row id */
  partners: Map<string, Thing>
  /** the boat rows of this model, for asking a rule */
  boats: Thing[]
  /** every pairing line, colourways each one */
  lines: { boat: Thing; partner: Thing }[]
}

function modelsOffered(world: PairWorld, kind: 'motor' | 'trailer'): Map<string, ModelOffers> {
  const out = new Map<string, ModelOffers>()
  for (const pair of pairingsOf(world, kind)) {
    const key = modelKeyOf(pair.boat.table, pair.boat.row)
    let m = out.get(key)
    if (!m) {
      m = {
        key,
        said: boatSaid(pair.boat.table, pair.boat.row),
        maker: makerOfTable(pair.boat.table),
        partners: new Map(),
        boats: [],
        lines: [],
      }
      out.set(key, m)
    }
    m.partners.set(pair.partner.row.id, pair.partner)
    if (!m.boats.some((b) => b.row.id === pair.boat.row.id)) m.boats.push(pair.boat)
    m.lines.push(pair)
  }
  return out
}

/**
 * EVERY OFFER THE RULE TAKES AWAY, maker by maker, model by model, in the price list's order of
 * makers — the 45 of "45 of 540", named. Empty until every choice of the sentence is made.
 * `offers` summed over the makers is `pairReach.taken`.
 */
export function pairTaken(s: PairShape, world: PairWorld): TakenMaker[] {
  if (!pairReady(s)) return []
  const makers = new Map<string, TakenMaker>()
  for (const m of modelsOffered(world, s.partnerKind).values()) {
    const what = new Set<string>()
    let offers = 0
    for (const line of m.lines) {
      if (judgePair(s, line.boat, line.partner) !== 'breaks') continue
      offers += 1
      what.add(thingSaid(line.partner.table, line.partner.row))
    }
    if (offers === 0) continue
    const maker = makers.get(m.maker) ?? { maker: m.maker, models: [], offers: 0 }
    maker.models.push({
      key: m.key,
      said: m.said,
      what: [...what].sort(byName),
      made: m.partners.size,
    })
    maker.offers += offers
    makers.set(m.maker, maker)
  }
  const out = [...makers.values()]
  for (const maker of out) maker.models.sort((a, b) => byName(a.said, b.said))
  return out
}

/** What one boat's list is with the rule on: each thing the price list makes for it, kept or
 *  taken, or not read where the rule cannot read it (a blank never refuses). */
export interface OnBoat {
  said: string
  /** the rule speaks of this boat */
  about: boolean
  items: { what: string; verdict: 'keeps' | 'taken' | 'unread' }[]
}

export function pairOnBoat(s: PairShape, world: PairWorld, key: string): OnBoat | null {
  const m = modelsOffered(world, s.partnerKind).get(key)
  if (!m) return null
  const boat = m.boats[0]!
  let about = false
  const items: OnBoat['items'] = []
  for (const partner of m.partners.values()) {
    const verdict = judgePair(s, boat, partner)
    if (verdict !== 'not-about') about = true
    items.push({
      what: thingSaid(partner.table, partner.row),
      verdict: verdict === 'breaks' ? 'taken' : verdict === 'keeps' ? 'keeps' : 'unread',
    })
  }
  /* about the boat even where every item is unread: ask the boat alone */
  if (!about && pairReady(s)) about = m.boats.some((b) => judgeBoat(s, b))
  items.sort((a, b) => byName(a.what, b.what))
  return { said: m.said, about, items }
}

const judgeBoat = (s: PairShape, boat: Thing): boolean => pairAbout(s, boat)

/** The boats a rule could be asked of on its own: models, said, in the order they are offered. */
export function pairBoats(
  world: PairWorld,
  kind: 'motor' | 'trailer',
): { key: string; said: string; maker: string }[] {
  return [...modelsOffered(world, kind).values()].map((m) => ({
    key: m.key,
    said: m.said,
    maker: m.maker,
  }))
}

/* ---------------------------------------------------------- */
/* Said before it is added                                     */
/* ---------------------------------------------------------- */

/** A boat model a rule would leave with nothing of its kind. */
export interface Emptied {
  said: string
  /** how many the price list makes for it, every one of them taken */
  made: number
  /** the other rules of Northside's that take the rest, by id; empty where this one alone does */
  with: string[]
}

/**
 * THE BOATS IT WOULD LEAVE WITH NOTHING (judge.md, missing item 7: "the 2350 Ultra Centrecab
 * would be offered no trailer", measured 3 of 3 taken). First alone; then beside every rule of
 * Northside's in force that refuses, so a rule that empties a list only together with another is
 * said too, naming the other. A warning or a rule switched off takes nothing.
 */
export function pairEmpties(
  s: PairShape,
  world: PairWorld,
  others: readonly ConstraintDef[] = [],
): Emptied[] {
  if (!pairReady(s)) return []
  const refusing = others
    .filter((r) => r.enabled && r.severity !== 'warn')
    .map((rule) => ({ rule, shape: pairShapeOf(rule, world) }))
    .filter(
      (o): o is { rule: ConstraintDef; shape: PairShape } =>
        o.shape !== null && o.shape.partnerKind === s.partnerKind && pairReady(o.shape),
    )
  const out: Emptied[] = []
  for (const m of modelsOffered(world, s.partnerKind).values()) {
    const boat = m.boats[0]!
    const partners = [...m.partners.values()]
    const mine = partners.map((p) => judgePair(s, boat, p) === 'breaks')
    if (!mine.some(Boolean)) continue
    if (mine.every(Boolean)) {
      out.push({ said: m.said, made: partners.length, with: [] })
      continue
    }
    const by = new Set<string>()
    const all = partners.every((p, i) => {
      if (mine[i]) return true
      const other = refusing.find((o) => judgePair(o.shape, boat, p) === 'breaks')
      if (other) by.add(other.rule.id)
      return other !== undefined
    })
    if (all) out.push({ said: m.said, made: partners.length, with: [...by] })
  }
  return out.sort((a, b) => byName(a.said, b.said))
}

/** Another of Northside's rules this sentence cannot stand beside. */
export interface Clash {
  ruleId: string
  /** a boat both speak of, as a person says it */
  boat: string
}

/**
 * THE RULES IT CONTRADICTS: both speak of one boat on sale, both decide the same kind, and not one
 * motor or trailer on sale keeps both — so on that boat the two together refuse everything of
 * that kind it can read, made for it or not. Counted over what is on sale, never typed.
 */
export function pairClashes(
  s: PairShape,
  world: PairWorld,
  others: readonly ConstraintDef[],
): Clash[] {
  if (!pairReady(s)) return []
  const tables = Object.values(world.entities)
  const partners: Thing[] = []
  const boats: Thing[] = []
  for (const table of tables) {
    if (isRetired(table)) continue
    const rows = (world.rowsByEntity[table.id] ?? []).filter((r) => !isDiscontinued(r))
    if (table.kind === s.partnerKind) for (const row of rows) partners.push({ table, row })
    if (table.kind === 'boat') for (const row of rows) boats.push({ table, row })
  }
  const out: Clash[] = []
  for (const rule of others) {
    const other = pairShapeOf(rule, world)
    if (!other || other.partnerKind !== s.partnerKind || !pairReady(other)) continue
    for (const boat of boats) {
      if (!judgeBoat(s, boat) || !judgeBoat(other, boat)) continue
      /* a motor neither rule can read keeps both only by saying nothing: it is no answer */
      const both = partners.some((p) => {
        const a = judgePair(s, boat, p)
        const b = judgePair(other, boat, p)
        return a !== 'breaks' && b !== 'breaks' && (a === 'keeps' || b === 'keeps')
      })
      if (!both) out.push({ ruleId: rule.id, boat: boatSaid(boat.table, boat.row) })
      break
    }
  }
  return out
}

/* ---------------------------------------------------------- */
/* On the quotes standing in this browser                      */
/* ---------------------------------------------------------- */

/** One quote a rule speaks of, and what on it the rule refuses. */
export interface OnQuote {
  id: string
  reference: string
  state: QuoteDef['state']
  /** the boat, as the quote names it */
  boat: string
  /** lines on it the rule refuses, by name */
  refuses: string[]
}

/**
 * THE QUOTES WHOSE BOAT IT SPEAKS OF — every quote in this browser, drafts and given alike, with
 * the lines on it the rule refuses. This is what the sheet and the quotes say TODAY; what a rule
 * refused at the moment of a pick is not recorded anywhere, and nothing here pretends it was.
 */
export function pairOnQuotes(
  s: PairShape,
  world: PairWorld,
  quotes: readonly Pick<
    QuoteDef,
    'id' | 'reference' | 'state' | 'rootTableId' | 'rootRowId' | 'subjectLabel' | 'lines'
  >[],
): OnQuote[] {
  if (!pairReady(s)) return []
  const out: OnQuote[] = []
  for (const q of quotes) {
    const table = world.entities[q.rootTableId]
    if (!table || table.kind !== 'boat') continue
    const row = (world.rowsByEntity[table.id] ?? []).find((r) => r.id === q.rootRowId)
    if (!row) continue
    const boat = { table, row }
    if (!judgeBoat(s, boat)) continue
    const refuses: string[] = []
    for (const line of q.lines) {
      const ptable = world.entities[line.entityId]
      if (!ptable || ptable.kind !== s.partnerKind) continue
      const prow = (world.rowsByEntity[ptable.id] ?? []).find((r) => r.id === line.rowId)
      if (prow && judgePair(s, boat, { table: ptable, row: prow }) === 'breaks')
        refuses.push(thingSaid(ptable, prow))
    }
    out.push({
      id: q.id,
      reference: q.reference,
      state: q.state,
      boat: boatSaid(table, row),
      refuses,
    })
  }
  return out.sort((a, b) => byName(a.reference, b.reference))
}
