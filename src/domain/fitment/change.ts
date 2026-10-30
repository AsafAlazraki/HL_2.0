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

   WHAT IS REFUSED, WITH ITS REASON. A motor over the horsepower the
   boat takes is not put on: the price list's own figure says the boat
   cannot carry it, and a press here must not overrule the hull. A
   thing whose list has no pairing with this boat's maker cannot be
   put on, and the sentence names both lists.

   Pure: no React, no store. The screen applies the command.
   ============================================================ */
import { PAIR_ORIGIN_FIELD, rowLabel, type CatalogueCtx, type RowData } from '@/domain/model'
import { joinRefFor, readPairs, type JoinRef } from '@/domain/catalogue/views'
import { defaultBlocksFor } from '@/domain/catalogue/views/relations'
import { addRow, isDone, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import { lineSaid } from '@/domain/quote/spoken'
import type { BoatFit, Place } from './boat'

export type FitWay = 'on' | 'off'

export type FitChange = { command: CatalogueCommand; said: string } | { refused: string }

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

/**
 * Put one thing on a boat, or take it off: the command, and the sentence its step says.
 *
 * `fit` is the plate as it reads now, so a motor's standing against the boat's horsepower is
 * the same reading the plate drew. Refused with a sentence where the boat cannot take it.
 */
export function changeFit(ctx: CatalogueCtx, fit: BoatFit, target: Place, way: FitWay): FitChange {
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

  const pair = readPairs(ctx, join, boatTable, boatRow).get(target.rowId)
  const origin = way === 'on' ? 'added' : 'removed'
  const onSaid = `The ${thing} now goes on the ${fit.name}.`
  const offSaid = `The ${thing} is taken off what goes on the ${fit.name}.`
  const said = way === 'on' ? onSaid : offSaid
  const back = way === 'on' ? offSaid : onSaid

  if (pair) {
    if (pair.origin === origin) return { refused: '' }
    return {
      command: saying(updateCell(join.entityId, pair.rowId, PAIR_ORIGIN_FIELD, origin), said, back),
      said,
    }
  }
  const values: Record<string, string> = {
    [join.sourceFieldId]: fit.place.rowId,
    [join.targetFieldId]: target.rowId,
    [PAIR_ORIGIN_FIELD]: origin,
  }
  if (join.labelFieldId) values[join.labelFieldId] = `${fit.label} · ${rowLabel(table, row)}`
  return { command: saying(addRow(join.entityId, values), said, back), said }
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
