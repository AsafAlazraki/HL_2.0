/* ============================================================
   WHAT EACH MODEL CARRIES, COUNTED — the four figures on a model's
   card on its maker's own page: motors, trailers, packages and parts
   the price list makes for it, and the motor it marks recommended.

   THE SAME READING AS FITMENT, WITHOUT PRICING EVERY LINE. Fitment's
   `readBoatFit` reads one boat whole: every list its page draws through
   `relatedRows`, every thing on them minted at the boat's own price, the
   motors measured against the hull. A maker's page needs only how many
   of each and which motor is starred, for every model at once, so this
   reads the same blocks through the same `relatedRows` with one engine
   for the whole maker and mints nothing. The test holds the counts to
   `readBoatFit`'s on every model of the real price list.

   A RULE IN FORCE IS NOT READ HERE. Fitment strikes what a dealer's
   rule refuses and says why; the page says how many rules are in force
   beside these counts, and its "What fits" opens Fitment on the boat.

   Pure: no React, no store, no DOM.
   ============================================================ */
import { rowLabel, type CatalogueCtx, type TableKind } from '@/domain/model'
import { joinRefFor, makeEngine, relatedRows } from '@/domain/catalogue/views'
import { defaultBlocksFor } from '@/domain/catalogue/views/relations'
import { lineSaid } from '@/domain/quote/spoken'
import { nameOnPaper } from '@/domain/quote/paperWords'

export interface Carries {
  motors: number
  trailers: number
  /** the dealer's fit-out and factory packages: every list of kind package */
  packages: number
  /** parts and accessories: every list of kind accessory not carried on the motor's pairing */
  parts: number
  /** the motor the price list marks recommended for this boat, as the build names it, or null */
  recommended: string | null
}

export const NOTHING_CARRIED: Carries = {
  motors: 0,
  trailers: 0,
  packages: 0,
  parts: 0,
  recommended: null,
}

/** What every one of a maker's boats carries, keyed by the boat's row id. */
export function carriesOf(
  ctx: CatalogueCtx,
  tableId: string,
  rowIds: readonly string[],
): Map<string, Carries> {
  const out = new Map<string, Carries>()
  const root = ctx.entities[tableId]
  if (!root || root.kind !== 'boat') return out
  const view = Object.values(ctx.views).find((v) => v.rootTableId === tableId)
  const blocks = view ? view.blocks : defaultBlocksFor(ctx.entities, tableId)
  const read = blocks.flatMap((block) => {
    const target = ctx.entities[block.tableId]
    if (!target) return []
    return [
      { block, target, join: joinRefFor(ctx.entities, block.joinTableId, root.id, target.id) },
    ]
  })
  /* the rigging kits ride on the motor's own pairing and go with the motor, as Fitment reads */
  const motorJoin = read.find((e) => e.target.kind === 'motor')?.join?.entityId
  const engine = makeEngine(ctx)
  const byId = new Map((ctx.rowsByEntity[tableId] ?? []).map((r) => [r.id, r]))
  for (const id of rowIds) {
    const row = byId.get(id)
    if (!row) continue
    const tally: Carries = { ...NOTHING_CARRIED }
    let motorSeen = false
    for (const { block, target, join } of read) {
      const kind: TableKind = target.kind ?? 'custom'
      if (kind !== 'motor' && motorJoin !== undefined && join?.entityId === motorJoin) continue
      if (kind === 'motor' && motorSeen) continue
      const result = relatedRows({
        ctx,
        engine,
        sourceEntity: root,
        sourceRow: row,
        targetEntityId: target.id,
        rule: block.rule,
        join,
      })
      const count = result.rows.length
      if (kind === 'motor') {
        motorSeen = true
        tally.motors = count
        const star = result.rows.find((r) => r.recommended)
        if (star) tally.recommended = nameOnPaper(lineSaid(rowLabel(target, star.row), target.name))
      } else if (kind === 'trailer') tally.trailers += count
      else if (kind === 'package') tally.packages += count
      else if (kind === 'accessory') tally.parts += count
    }
    out.set(id, tally)
  }
  return out
}
