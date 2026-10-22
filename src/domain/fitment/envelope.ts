/* ============================================================
   THE HORSEPOWER A BOAT TAKES — read off its own row, as a fact.

   WHY THIS FILE EXISTS. `offer.ts` declares an `outside-envelope`
   verdict and, until this file, nothing produced it: every boat's
   `Min HP` and `Max HP` and every motor's `HP Rating` arrived from the
   spreadsheet as text ("150 HP", "2 x 225", "350 / 2 x 200 HP"), so no
   comparison could run. The refinement critic measured what that cost
   on the build (refine-critique-2.md, 11): under Show all, a Yamaha
   F2.5SMHB — 2.5 hp — went onto a Formosa GRT 425 rated 40–60 hp, and
   the only sentence beside it said nothing was wrong with it.

   ── WHAT IS READ, AND WHERE ────────────────────────────────────

   The columns are found BY THEIR NAME, never by a letter: `Min HP` and
   `Max HP` on a boat's own list, `HP Rating` on a motor's. Every boat
   maker's list on the Master Price File carries the first two (as a
   number on Stacer, Formosa and Haines; as text on the rest) and
   Yamaha carries the third. ePropulsion's motors say "Electric", which
   is not a horsepower, and so no verdict is drawn for them at all.

   ── A RIG IS A COUNT AND A FIGURE EACH ────────────────────────

   "2 x 225" is two motors of 225 hp, not one of 450, and a boat's Max
   HP of "350 / 2 x 200 HP" is two envelopes, one per way of rigging
   it: a single motor up to 350 hp, or twins up to 200 hp each. So a
   cell reads as a list of rigs, and an envelope is kept per number of
   motors. A motor is measured only against the envelope for ITS number
   of motors. Where the boat names no envelope for that number, the
   answer is `unstated`, never `outside`: the boat's own row does not
   say, and FITMENT_RULES.md F1 is explicit that Max HP has to be split
   into total, count and per-engine before a twin can be judged. A bound
   the boat does not state is `null`, the same discipline as the
   verdict's own type.

   NOTHING HERE IS A SENTENCE. `say.ts` beside this file says it.
   ============================================================ */

import { readCell } from '@/domain/model'
import type { CellValue, EntityDef, FieldDef, RowData, Verdict } from '@/domain/model'

/** One way of putting motors on a boat: how many, and the hp of each. */
export interface Rig {
  count: number
  each: number
}

/** The hp a boat takes for one number of motors. A null bound is one
 *  the boat's row does not state. */
export interface Envelope {
  count: number
  min: number | null
  max: number | null
}

/** Everything a boat's row says about the motors it takes. */
export interface HullEnvelope {
  /** one per number of motors the row names, fewest first */
  rigs: Envelope[]
  /** the columns read, by the price list's own names */
  minColumn: string
  maxColumn: string
}

export const MIN_HP = 'Min HP'
export const MAX_HP = 'Max HP'
export const HP_RATING = 'HP Rating'

const PART = /^(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*(?:hp)?$/i

/** Every rig a cell names. A number is one motor of that hp; a text is
 *  split on `/`, and a part that is not a horsepower ("TBA",
 *  "Electric") is left out rather than guessed at. */
export function readRigs(value: CellValue): Rig[] {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? [{ count: 1, each: value }] : []
  }
  if (typeof value !== 'string') return []
  const out: Rig[] = []
  for (const raw of value.split('/')) {
    const hit = PART.exec(raw.trim())
    if (!hit) continue
    const count = hit[1] ? Number(hit[1]) : 1
    const each = Number(hit[2])
    if (!Number.isFinite(each) || each <= 0 || count < 1) continue
    out.push({ count, each })
  }
  return out
}

const fieldNamed = (entity: EntityDef, name: string): FieldDef | undefined =>
  entity.fields.find((f) => f.name.trim().toLowerCase() === name.toLowerCase())

/** The envelope a boat's own row states, or null where it states none
 *  — no `Min HP` or `Max HP` column, or both empty or unreadable. */
export function envelopeOf(entity: EntityDef, row: RowData): HullEnvelope | null {
  const minField = fieldNamed(entity, MIN_HP)
  const maxField = fieldNamed(entity, MAX_HP)
  if (!minField && !maxField) return null
  const mins = minField ? readRigs(readCell(row, minField.id)) : []
  const maxs = maxField ? readRigs(readCell(row, maxField.id)) : []
  const counts = [...new Set([...mins, ...maxs].map((r) => r.count))].sort((a, b) => a - b)
  if (counts.length === 0) return null
  return {
    rigs: counts.map((count) => ({
      count,
      min: mins.find((r) => r.count === count)?.each ?? null,
      max: maxs.find((r) => r.count === count)?.each ?? null,
    })),
    minColumn: minField?.name ?? MIN_HP,
    maxColumn: maxField?.name ?? MAX_HP,
  }
}

/** A motor's own rig, read off its `HP Rating`, or null where the cell
 *  is not a horsepower. A motor row names one rig. */
export function rigOf(entity: EntityDef, row: RowData): Rig | null {
  const field = fieldNamed(entity, HP_RATING)
  if (!field) return null
  return readRigs(readCell(row, field.id))[0] ?? null
}

/** Where a motor stands against a boat's envelope. */
export type EnvelopeStanding =
  | { kind: 'inside'; envelope: Envelope }
  | { kind: 'outside'; envelope: Envelope; side: 'under' | 'over'; verdict: Verdict }
  /** the boat states no envelope for this many motors, or the motor no hp */
  | { kind: 'unstated' }

/** The one comparison. Pure, total, and it invents no bound. */
export function measureRig(hull: HullEnvelope | null, rig: Rig | null): EnvelopeStanding {
  if (!hull || !rig) return { kind: 'unstated' }
  const envelope = hull.rigs.find((e) => e.count === rig.count)
  if (!envelope || (envelope.min === null && envelope.max === null)) return { kind: 'unstated' }
  const verdict: Verdict = {
    kind: 'outside-envelope',
    hp: rig.each,
    min: envelope.min,
    max: envelope.max,
    ...(rig.count > 1 ? { count: rig.count } : {}),
  }
  if (envelope.min !== null && rig.each < envelope.min) {
    return { kind: 'outside', envelope, side: 'under', verdict }
  }
  if (envelope.max !== null && rig.each > envelope.max) {
    return { kind: 'outside', envelope, side: 'over', verdict }
  }
  return { kind: 'inside', envelope }
}

/** A motor against a boat, both found on the catalogue by id. The
 *  configurator asks this of a line already on a quote, which is why
 *  it takes ids rather than rows. */
export function measureMotorOnBoat(
  world: { entities: Record<string, EntityDef>; rowsByEntity: Record<string, RowData[]> },
  boat: { tableId: string; rowId: string },
  motor: { tableId: string; rowId: string },
): EnvelopeStanding {
  const boatTable = world.entities[boat.tableId]
  const motorTable = world.entities[motor.tableId]
  if (!boatTable || !motorTable || motorTable.kind !== 'motor') return { kind: 'unstated' }
  const boatRow = (world.rowsByEntity[boat.tableId] ?? []).find((r) => r.id === boat.rowId)
  const motorRow = (world.rowsByEntity[motor.tableId] ?? []).find((r) => r.id === motor.rowId)
  if (!boatRow || !motorRow) return { kind: 'unstated' }
  return measureRig(envelopeOf(boatTable, boatRow), rigOf(motorTable, motorRow))
}
