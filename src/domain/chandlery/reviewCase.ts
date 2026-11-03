/* ============================================================
   THE REVIEW CASE A PART WITH NO PRICE STANDS IN (the verifier of the
   chandlery, round 1, J10: "An unpriced Reef Anchor Kit says so with
   'Put it right on Review', but that lands on /review's first case,
   and Review does not mention the Reef Anchor Kits").

   Review files a line on sale with no price under one case per
   heading and kind ("none:parts:<heading>:blank"), and its address
   takes the case by that key (`/review?case=`). The key is never
   rebuilt here: the chandlery asks Review's own check (`noPrice`) of
   the parts list alone, so the door opens on the case Review itself
   draws, or says the part was left as meant there.

   PURE: one list, its lines and what Northside left as meant in; each
   unpriced line's case, or that it was left alone, out.
   ============================================================ */
import type { EntityDef, RowData } from '@/domain/model'
import { noPrice, type Meant } from '@/domain/rules/review/checks'

/** Where an unpriced line stands on Review: in a case, by its key, or left as meant. */
export type ReviewStanding = { case: string } | { meant: true }

/** EVERY UNPRICED LINE OF ONE LIST, by its line id, with where it stands on Review. */
export function noPriceStandings(
  table: EntityDef,
  rows: readonly RowData[],
  meant: Meant,
): ReadonlyMap<string, ReviewStanding> {
  const out = new Map<string, ReviewStanding>()
  const one = noPrice(
    { entities: { [table.id]: table }, rowsByEntity: { [table.id]: rows } },
    meant,
  )
  for (const group of one.groups)
    for (const line of group.lines) out.set(line.rowId, { case: group.key })
  /* what Review leaves out because Northside left it as meant: its own key, line by line */
  const prefix = `none:${table.id}:`
  for (const key of Object.keys(meant)) {
    if (!key.startsWith(prefix)) continue
    const rowId = key.slice(prefix.length).replace(/:(zero|blank)$/, '')
    if (!out.has(rowId)) out.set(rowId, { meant: true })
  }
  return out
}
