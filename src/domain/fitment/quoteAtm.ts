/* ============================================================
   A TRAILER OVER ITS ATM IS NOT PUT ON A QUOTE BY THE BUILD EITHER
   (the fitment verifier, 2026-11-03, major: Fitment refused the SP660's
   GFAB with its sentence, and on the quote started there one press of
   the build's Add put it on at $111,778 with no word).

   The weighing is Fitment's own (`loadOf`, `towOf`, `atmSaid`), set
   against what the quote will carry once the press is made: the boat,
   and the motor on the quote — not the recommended one, which is what a
   quote not yet started would carry. A trailer with no ATM on the price
   list, or a boat with no weight, is not refused: nothing is measured,
   so nothing is decided.

   Pure: no React, no store.
   ============================================================ */
import type { CatalogueCtx, QuoteDef, QuoteLine } from '@/domain/model'
import { lineSaid } from '@/domain/quote/spoken'
import { nameOnPaper } from '@/domain/quote/paperWords'
import { readBoatFit } from './boat'
import { loadOf, towOf } from './plate'
import { atmSaid } from './atm'

/**
 * The sentence a press is refused with where a trailer it puts on the quote would be over its ATM,
 * or '' where none is. `coming` are the lines the press puts on; `going` the ids it takes off (a
 * swap), so the motor weighed is the one the quote will carry.
 */
export function atmOnQuote(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  coming: readonly QuoteLine[],
  going: readonly string[] = [],
): string {
  const kind = (line: QuoteLine) => ctx.entities[line.entityId]?.kind
  const trailers = coming.filter((l) => kind(l) === 'trailer')
  if (trailers.length === 0) return ''
  const root = ctx.entities[quote.rootTableId]
  if (!root || root.kind !== 'boat') return ''
  const fit = readBoatFit(ctx, { tableId: root.id, rowId: quote.rootRowId })
  if (!fit) return ''
  const after = [...quote.lines.filter((l) => !going.includes(l.id)), ...coming]
  const motor = after.find((l) => kind(l) === 'motor') ?? null
  const load = loadOf(ctx, fit, motor ? { tableId: motor.entityId, rowId: motor.rowId } : null)
  for (const line of trailers) {
    const tow = towOf(ctx, load, {
      key: line.pairRowId ?? line.rowId,
      place: { tableId: line.entityId, rowId: line.rowId },
    })
    if (tow.standing !== 'over' || tow.rated === null || tow.total === null) continue
    const table = ctx.entities[line.entityId]
    return atmSaid(nameOnPaper(lineSaid(line.label, table?.name ?? '')), tow, 'quote')
  }
  return ''
}
