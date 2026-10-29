/* ============================================================
   THE DEALER'S OWN RULES, ASKED OF ONE BOAT — by the mint and by the
   give, from one place.

   THE FAULT (built-critique-m3-2.md, blocker 1). A dealer wrote "When
   the boat's maker is Stacer, the motor's horsepower must be at most
   20 hp", refusing. The very next draft on a Stacer 659 Ocean Ranger
   started with the refused Yamaha F130XA on it, badged recommended,
   with its rigging kit, and the finale gave it and the paper printed
   it: `mintQuoteFromView` brought the price list's star across without
   ever reading the rules, and nothing between the draft and the give
   read them either. So the milestone's one sentence — writing a rule
   changes what the build refuses on the next pick, with the rule's own
   because — was false for any rule that refuses a boat's star.

   This file is the one reading both ends ask:

     · `rulesOnBoat` — what the rules in force say of one motor or
       trailer on one boat (`pairRuling`, built once per boat). The mint
       asks it before a star comes across; the build asks it per tile.
     · `refusedOnQuote` — the lines a rule refuses that stand on a
       quote anyway (a draft made before the rule, or one the dealer
       kept), grouped one entry per rule, so the give is refused once
       per cause with that rule's own because.

   A rule switched off says nothing, a `warn` rule never refuses, and a
   blank never refuses (`pairRules.ts`). Pure: no React, no store.
   ============================================================ */

import type { ConstraintDef, QuoteDef, QuoteLine } from '@/domain/model'
import { pairRuling, type PairWorld, type PickRuling } from '@/domain/rules/constraints/pairRules'

/** The sheet and the rules in force, as much of a catalogue as a ruling reads. */
export interface RuledWorld extends PairWorld {
  constraintDefs?: readonly ConstraintDef[]
}

/** What the rules say of one thing on this boat, asked by its table and row; null where no rule
 *  refuses or warns about it, or where it is not a motor or a trailer. */
export type AskRules = (entityId: string, rowId: string) => PickRuling | null

/**
 * THE RULES IN FORCE ON ONE BOAT, read once and asked per motor or trailer. null where no rule is
 * on, or where the quote is not rooted on a boat — then nothing is refused and nothing warned.
 */
export function rulesOnBoat(
  world: RuledWorld,
  boatTableId: string,
  boatRowId: string,
): AskRules | null {
  const rules = world.constraintDefs ?? []
  if (!rules.some((r) => r.enabled)) return null
  const table = world.entities[boatTableId]
  if (!table || table.kind !== 'boat') return null
  const row = (world.rowsByEntity[table.id] ?? []).find((r) => r.id === boatRowId)
  if (!row) return null
  const reading = pairRuling(world, rules)
  if (reading.rules.length === 0) return null
  const boat = { table, row }
  return (entityId, rowId) => {
    const partner = world.entities[entityId]
    if (!partner || (partner.kind !== 'motor' && partner.kind !== 'trailer')) return null
    const prow = (world.rowsByEntity[entityId] ?? []).find((r) => r.id === rowId)
    if (!prow) return null
    const ruling = reading.pick(boat, { table: partner, row: prow })
    return ruling.refusedBy || ruling.warnedBy.length > 0 ? ruling : null
  }
}

/** One rule that refuses what stands on a quote, and the lines it refuses there. */
export interface RefusedOnQuote {
  rule: ConstraintDef
  lines: QuoteLine[]
}

/**
 * EVERY LINE ON A QUOTE ITS BOAT'S RULES REFUSE, one entry per rule in the order the rules speak.
 * A refused line is never taken off by a rule — the dealer takes it off — but a quote carrying
 * one is not one the dealer has agreed to sell, so the give asks this first.
 */
export function refusedOnQuote(
  world: RuledWorld,
  quote: Pick<QuoteDef, 'rootTableId' | 'rootRowId' | 'lines'>,
): RefusedOnQuote[] {
  const ask = rulesOnBoat(world, quote.rootTableId, quote.rootRowId)
  if (!ask) return []
  const out: RefusedOnQuote[] = []
  for (const line of quote.lines) {
    const rule = ask(line.entityId, line.rowId)?.refusedBy
    if (!rule) continue
    const entry = out.find((e) => e.rule.id === rule.id)
    if (entry) entry.lines.push(line)
    else out.push({ rule, lines: [line] })
  }
  return out
}

/** The drafts standing today, and how many of them carry a line one rule would refuse. */
export interface DraftsHeld {
  drafts: number
  carrying: number
}

/**
 * THE DRAFTS ONE RULE WOULD HOLD (built-critique-m3.md, blocker 2): counted with that rule as the
 * only rule, switched on and refusing, so the figure Rules prints beside the act is this rule's
 * and nobody else's, read the way the give reads it (`refusedOnQuote`). An issued quote is not
 * counted — it is the customer's already. null, a rule not yet whole, counts no draft as held.
 */
export function draftsARuleWouldHold(
  world: RuledWorld,
  quotes: readonly Pick<QuoteDef, 'state' | 'rootTableId' | 'rootRowId' | 'lines'>[],
  rule: ConstraintDef | null,
): DraftsHeld {
  const drafts = quotes.filter((q) => q.state === 'draft')
  if (!rule || drafts.length === 0) return { drafts: drafts.length, carrying: 0 }
  const ruled: RuledWorld = {
    ...world,
    constraintDefs: [{ ...rule, enabled: true, severity: 'block' }],
  }
  return {
    drafts: drafts.length,
    carrying: drafts.filter((q) => refusedOnQuote(ruled, q).length > 0).length,
  }
}
