/* ============================================================
   WHAT GOES ON A BOAT, CHANGED WHERE IT IS SEEN (the flow round,
   2026-10-30).

   The owner, 2026-10-28: "managing what fits on a boat should be
   really easy to get to". Fitment's plate read what goes on a boat
   and could change none of it: adding a motor was four presses into
   the sheet and typing, and nothing on the plate could be taken off
   (exposure.md §2). This file is the one act both directions need.

   ONE CATALOGUE STEP, WITH ITS WAY BACK. Putting a thing on writes
   the pairing the boat's own page reads (`relatedRows`): a new pair
   marked `added` where the price list has none, or the pair it has
   marked `added` again. Taking one off marks its pair `removed`,
   which the page already reads as "a person took it out; kept as a
   row so it can be restored" (`PairOrigin`), so the rigging kit, the
   prop and the engine hole the file carries on that pair are never
   lost by a press. Both are `addRow` and `updateCell` in one `batch`,
   so Undo gives back exactly what was there.

   ON EVERY VERSION OF THE MODEL, COUNTED (the fitment judge,
   2026-11-03, blocker 1). "Take it off" said the whole Sport 660 and
   changed one of its sixteen versions. Handed the model's versions,
   the step is made on each of them in one batch, and its sentence
   counts what it reached: "on all 16 of its versions", or "on the 15
   of its 16 versions that carried it".

   WHAT IS REFUSED, WITH ITS REASON. A motor OVER the horsepower the
   boat takes is not put on, and since 2026-11-03 neither is one UNDER
   it: a 2.5 hp went onto a 150–200 hp boat and its dot was drawn at
   the band's 150 end. The price list's own figure decides both. A
   thing whose list has no pairing with this boat's maker cannot be put
   on, and the sentence names both lists.

   THE RECOMMENDED, SET HERE (major 10). The star is what a new quote
   starts from, and it was read-only on the screen that shows it. One
   press stars this pairing and takes the star off every other one in
   the same place, on every version, as one step with its Undo.

   Pure: no React, no store. The screen applies the command.
   ============================================================ */
import {
  PAIR_ORIGIN_FIELD,
  PAIR_RECOMMENDED_FIELD,
  rowLabel,
  type CatalogueCtx,
  type EntityDef,
  type RowData,
} from '@/domain/model'
import { isCuratedOnly, joinRefFor, readPairs, type JoinRef } from '@/domain/catalogue/views'
import { defaultBlocksFor } from '@/domain/catalogue/views/relations'
import {
  addRow,
  batch,
  isDone,
  updateCell,
  type CatalogueCommand,
} from '@/domain/catalogue/commands'
import { lineSaid } from '@/domain/quote/spoken'
import type { BoatFit, Place } from './boat'

export type FitWay = 'on' | 'off'

export type FitChange = { command: CatalogueCommand; said: string } | { refused: string }

const AU = new Intl.NumberFormat('en-AU')

const rowOf = (ctx: CatalogueCtx, place: Place): RowData | undefined =>
  (ctx.rowsByEntity[place.tableId] ?? []).find((r) => r.id === place.rowId)

/** The pairing list between this boat's table and the thing's table: the one the boat's page
 *  draws, or the one the price list carries between the two. Null where there is none. */
export function pairingFor(ctx: CatalogueCtx, boat: Place, target: Place): JoinRef | null {
  const view = Object.values(ctx.views).find((v) => v.rootTableId === boat.tableId)
  const blocks = view ? view.blocks : defaultBlocksFor(ctx.entities, boat.tableId)
  const block = blocks.find((b) => b.tableId === target.tableId)
  return joinRefFor(ctx.entities, block?.joinTableId, boat.tableId, target.tableId)
}

/** "on all 16 of its versions", "on the 15 of its 16 versions that carried it"; '' for one. */
function reach(done: number, of: number, way: FitWay): string {
  if (of <= 1) return ''
  if (done === of) return `, on all ${AU.format(of)} of its versions`
  return `, on the ${AU.format(done)} of its ${AU.format(of)} versions that ${way === 'on' ? 'did not carry' : 'carried'} it`
}

/**
 * Put one thing on a boat, or take it off: the command, and the sentence its step says.
 *
 * `fit` is the plate as it reads now, so a motor's standing against the boat's horsepower is
 * the same reading the plate drew. `versions` is every version of the boat's model
 * (`versionsOf`); absent, the boat alone. Refused with a sentence where the boat cannot take it.
 */
export function changeFit(
  ctx: CatalogueCtx,
  fit: BoatFit,
  target: Place,
  way: FitWay,
  versions: readonly Place[] = [fit.place],
): FitChange {
  const boatTable = ctx.entities[fit.place.tableId]
  const boatRow = rowOf(ctx, fit.place)
  const table = ctx.entities[target.tableId]
  const row = rowOf(ctx, target)
  if (!boatTable || !boatRow) return { refused: 'That boat is no longer on the price list.' }
  if (!table || !row) return { refused: 'That is no longer on the price list.' }
  const thing = lineSaid(rowLabel(table, row), table.name)

  if (way === 'on') {
    const dot = fit.motor?.dots.find((d) => d.place.rowId === target.rowId)
    if (fit.motor?.tableId === target.tableId && dot?.standing === 'over') {
      return {
        refused: `The ${thing} is over the ${fit.motor.takes} the ${fit.name} takes, so it is not put on. The boat’s own horsepower decides that.`,
      }
    }
    if (fit.motor?.tableId === target.tableId && dot?.standing === 'under') {
      return {
        refused: `The ${thing} is under the ${fit.motor.takes} the ${fit.name} takes, so it is not put on. The boat’s own horsepower decides that.`,
      }
    }
  }

  const join = pairingFor(ctx, fit.place, target)
  if (!join) {
    return {
      refused: `The price list keeps no list of which ${table.name} go with ${boatTable.name}, so the ${thing} cannot be put on the ${fit.name} here.`,
    }
  }
  const joinTable = ctx.entities[join.entityId]
  if (!joinTable?.fields.some((f) => f.id === PAIR_ORIGIN_FIELD)) {
    return {
      refused: `${joinTable?.name ?? 'That list'} cannot record a change by hand, so the ${fit.name} keeps what it has.`,
    }
  }

  const origin = way === 'on' ? 'added' : 'removed'
  const view = Object.values(ctx.views).find((v) => v.rootTableId === fit.place.tableId)
  const blocks = view ? view.blocks : defaultBlocksFor(ctx.entities, fit.place.tableId)
  const curated = isCuratedOnly(blocks.find((b) => b.tableId === target.tableId)?.rule)
  const steps: CatalogueCommand[] = []
  const every = versions.length > 0 ? versions : [fit.place]
  for (const version of every) {
    const vRow = rowOf(ctx, version)
    if (!vRow || version.tableId !== boatTable.id) continue
    const pair = readPairs(ctx, join, boatTable, vRow).get(target.rowId)
    if (pair) {
      /* on: a pairing a person has not taken off already carries it; off: one taken off is off */
      if (way === 'on' ? pair.origin !== 'removed' : pair.origin === 'removed') continue
      steps.push(updateCell(join.entityId, pair.rowId, PAIR_ORIGIN_FIELD, origin))
      continue
    }
    /* off, with no pairing: a thing a rule makes for the boat is held off by a pairing marked
       taken off; on a list that is its pairings alone, there is nothing to take off */
    if (way === 'off' && curated) continue
    const values: Record<string, string> = {
      [join.sourceFieldId]: version.rowId,
      [join.targetFieldId]: target.rowId,
      [PAIR_ORIGIN_FIELD]: origin,
    }
    if (join.labelFieldId) {
      values[join.labelFieldId] = `${rowLabel(boatTable, vRow)} · ${rowLabel(table, row)}`
    }
    steps.push(addRow(join.entityId, values))
  }
  if (steps.length === 0) return { refused: '' }

  const scope = reach(steps.length, every.length, way)
  const onSaid = `The ${thing} now goes on the ${fit.name}${scope}.`
  const offSaid =
    every.length > 1
      ? `The ${thing} is taken off the ${fit.name}${scope}.`
      : `The ${thing} is taken off what goes on the ${fit.name}.`
  const said = way === 'on' ? onSaid : offSaid
  const back =
    way === 'on'
      ? every.length > 1
        ? `The ${thing} is taken off the ${fit.name} again${scope}.`
        : `The ${thing} is taken off what goes on the ${fit.name}.`
      : every.length > 1
        ? `The ${thing} goes on the ${fit.name} again${scope}.`
        : `The ${thing} now goes on the ${fit.name}.`
  const command = steps.length === 1 ? steps[0]! : batch(steps, { said })
  return { command: saying(command, said, back), said }
}

/** The pairing lists of one of the boat's places: the motor's, or every trailer list's. */
function joinsOf(ctx: CatalogueCtx, fit: BoatFit, place: 'motor' | 'trailer'): JoinRef[] {
  const tables =
    place === 'motor'
      ? fit.motor
        ? [fit.motor.tableId]
        : []
      : (fit.trailer?.lists ?? []).map((l) => l.tableId)
  return tables
    .map((tableId) => pairingFor(ctx, fit.place, { tableId, rowId: '' }))
    .filter((j): j is JoinRef => j !== null)
}

/**
 * MAKE ONE THING THE RECOMMENDED for its place on the boat — a motor, or a trailer across every
 * trailer list — on every version of the model: its pairing is starred and every other star in
 * that place is taken off, so "at most one" is true of the data. One step, with its way back.
 */
export function starFit(
  ctx: CatalogueCtx,
  fit: BoatFit,
  target: Place,
  place: 'motor' | 'trailer',
  versions: readonly Place[] = [fit.place],
): FitChange {
  const boatTable: EntityDef | undefined = ctx.entities[fit.place.tableId]
  const table = ctx.entities[target.tableId]
  const row = rowOf(ctx, target)
  if (!boatTable) return { refused: 'That boat is no longer on the price list.' }
  if (!table || !row) return { refused: 'That is no longer on the price list.' }
  const thing = lineSaid(rowLabel(table, row), table.name)
  const joins = joinsOf(ctx, fit, place)
  const own = pairingFor(ctx, fit.place, target)
  if (!own || !joins.some((j) => j.entityId === own.entityId)) {
    return {
      refused: `The ${thing} is not made for the ${fit.name}, so it cannot be its recommended ${place}.`,
    }
  }
  if (!ctx.entities[own.entityId]?.fields.some((f) => f.id === PAIR_RECOMMENDED_FIELD)) {
    return {
      refused: `${ctx.entities[own.entityId]?.name ?? 'That list'} keeps no recommended, so the ${fit.name} keeps what it has.`,
    }
  }
  const steps: CatalogueCommand[] = []
  let reached = 0
  const every = versions.length > 0 ? versions : [fit.place]
  for (const version of every) {
    const vRow = rowOf(ctx, version)
    if (!vRow || version.tableId !== boatTable.id) continue
    const mine = readPairs(ctx, own, boatTable, vRow).get(target.rowId)
    if (!mine || mine.origin === 'removed') continue
    reached += 1
    if (!mine.recommended) {
      steps.push(updateCell(own.entityId, mine.rowId, PAIR_RECOMMENDED_FIELD, true))
    }
    for (const join of joins) {
      for (const pair of readPairs(ctx, join, boatTable, vRow).values()) {
        if (!pair.recommended || pair.rowId === mine.rowId) continue
        steps.push(updateCell(join.entityId, pair.rowId, PAIR_RECOMMENDED_FIELD, false))
      }
    }
  }
  if (reached === 0) {
    return {
      refused: `The ${thing} is not made for the ${fit.name}, so it cannot be its recommended ${place}.`,
    }
  }
  if (steps.length === 0) return { refused: '' }
  const scope =
    every.length <= 1
      ? ''
      : reached === every.length
        ? `, on all ${AU.format(every.length)} of its versions`
        : `, on the ${AU.format(reached)} of its ${AU.format(every.length)} versions it is made for`
  const said = `The ${thing} is now the recommended ${place} for the ${fit.name}${scope}: a new quote starts with it.`
  const back = `The recommended ${place} for the ${fit.name} is as it was${scope}.`
  return { command: saying(batch(steps, { said }), said, back), said }
}

/** A step that says the boat's own sentence, and whose way back says the opposite one. */
function saying(command: CatalogueCommand, said: string, back: string): CatalogueCommand {
  return (data, now) => {
    const outcome = command(data, now)
    if (!isDone(outcome)) return outcome
    return {
      ...outcome,
      said,
      event: { ...outcome.event, said },
      inverse: saying(outcome.inverse, back, said),
    }
  }
}
