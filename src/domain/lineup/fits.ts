/* ============================================================
   WHAT BOATS A MOTOR OR A TRAILER FITS — the other way round from
   `carriesOf`. A model's card on its maker's page counts the motors and
   trailers the price list makes for it; a motor on Yamaha's page, or a
   trailer on its maker's, says how many models it is made for, maker
   by maker.

   THE SAME READING AS THE CARDS. Every boat maker's blocks are read
   through the same `relatedRows` Fitment reads, for each model's own
   row (the row the card and Fitment open on), and every line a block
   reaches is credited with that model. So the F175XC's "fits 12
   models" is the twelve cards whose motor count includes it, and the
   test holds the two readings to each other on the real price list.

   A RULE IN FORCE IS NOT READ HERE, as it is not on the cards: Fitment
   strikes what a dealer's rule refuses and says why.

   Pure: no React, no store, no DOM.
   ============================================================ */
import { isRetired, type CatalogueCtx } from '@/domain/model'
import { joinRefFor, makeEngine, relatedRows } from '@/domain/catalogue/views'
import { defaultBlocksFor } from '@/domain/catalogue/views/relations'

/** The models one line is made for, maker by maker, in the order the makers were given. */
export interface Fits {
  /** every model, across every maker */
  models: number
  byMaker: { tableId: string; models: number }[]
}

export const FITS_NOTHING: Fits = { models: 0, byMaker: [] }

/**
 * What every line of one list fits, keyed by the line's row id: for each boat maker given, the
 * models (by their own row, `anchors`) whose blocks reach the line. A line no model reaches is
 * not in the map.
 */
export function fitsOf(
  ctx: CatalogueCtx,
  targetTableId: string,
  makers: readonly { tableId: string; anchors: readonly string[] }[],
): Map<string, Fits> {
  const out = new Map<string, Fits>()
  const target = ctx.entities[targetTableId]
  if (!target) return out
  const engine = makeEngine(ctx)
  for (const { tableId, anchors } of makers) {
    const root = ctx.entities[tableId]
    if (!root || root.kind !== 'boat' || isRetired(root)) continue
    const view = Object.values(ctx.views).find((v) => v.rootTableId === tableId)
    const blocks = (view ? view.blocks : defaultBlocksFor(ctx.entities, tableId)).filter(
      (b) => b.tableId === targetTableId,
    )
    if (blocks.length === 0) continue
    const byId = new Map((ctx.rowsByEntity[tableId] ?? []).map((r) => [r.id, r]))
    const reached = new Map<string, number>()
    for (const id of anchors) {
      const row = byId.get(id)
      if (!row) continue
      const lines = new Set<string>()
      for (const block of blocks) {
        const result = relatedRows({
          ctx,
          engine,
          sourceEntity: root,
          sourceRow: row,
          targetEntityId: target.id,
          rule: block.rule,
          join: joinRefFor(ctx.entities, block.joinTableId, root.id, target.id),
        })
        for (const r of result.rows) lines.add(r.row.id)
      }
      for (const line of lines) reached.set(line, (reached.get(line) ?? 0) + 1)
    }
    for (const [line, models] of reached) {
      const fits = out.get(line) ?? { models: 0, byMaker: [] }
      fits.models += models
      fits.byMaker.push({ tableId, models })
      out.set(line, fits)
    }
  }
  return out
}

/** "fits 12 models: 9 Highfield, 3 Stacer", "fits 1 Highfield model", "fits no model in the
 *  price list" — each maker by the word the caller gives it. */
export function fitsSaid(fits: Fits | undefined, makerWord: (tableId: string) => string): string {
  if (!fits || fits.models === 0) return 'fits no model in the price list'
  const noun = (n: number) => (n === 1 ? 'model' : 'models')
  if (fits.byMaker.length === 1) {
    const only = fits.byMaker[0]!
    return `fits ${only.models.toLocaleString('en-AU')} ${makerWord(only.tableId)} ${noun(only.models)}`
  }
  return `fits ${fits.models.toLocaleString('en-AU')} ${noun(fits.models)}: ${fits.byMaker
    .map((m) => `${m.models.toLocaleString('en-AU')} ${makerWord(m.tableId)}`)
    .join(', ')}`
}
