/* ============================================================
   WHAT REVIEW FINDS ON ONE LINE, SAID WHERE IT IS PICKED — before a
   quote holds it (the verifier of Review, 2026-11-04, round 2: "No
   word where a wrong trailer is picked; the warning stands only on the
   finale"; the judge's missing item 8, what a case touches, "not
   where picked").

   The build's finale says it of a quote's own lines (`onQuote.ts`).
   New quote's chosen plate says it of the one line it is about to
   start a quote on, in the same two checks and for the same reason:

     band   a trailer registered as the wrong size for its weight, so
            its rego is the price list's, short or over
     two    one name at two prices in its list

   Never a line below its cost: the picker stands at the desk with the
   customer (CLAUDE.md). Nothing Northside left alone is said.

   PURE: the lists, the line and what was left alone in; a sentence
   each, in the order the checks run.
   ============================================================ */

import { money } from '@/domain/money'
import { bandReview, twoPrices, type Meant, type ReviewWorld } from './checks'

interface Found {
  band: ReturnType<typeof bandReview>['lines']
  two: ReturnType<typeof twoPrices>['groups']
}

/* once per price list: the rows are one object per load */
const FOUND = new WeakMap<ReviewWorld['rowsByEntity'], Found>()

function found(world: ReviewWorld): Found {
  const hit = FOUND.get(world.rowsByEntity)
  if (hit) return hit
  const out = { band: bandReview(world).lines, two: twoPrices(world).groups }
  FOUND.set(world.rowsByEntity, out)
  return out
}

const kgSaid = (n: number): string => `${n.toLocaleString('en-AU')} kg`

/** What Review finds on one line of the price list, one sentence each; none where it holds. */
export function wrongOnPick(
  world: ReviewWorld,
  tableId: string,
  rowId: string,
  meant: Meant = {},
): string[] {
  const { band, two } = found(world)
  const out: string[] = []
  const wrong = band.find((b) => b.tableId === tableId && b.rowId === rowId && !meant[b.key])
  if (wrong) {
    const delta = wrong.to?.delta ?? 0
    const rego =
      delta > 0
        ? `, so its rego is ${money(delta)} short`
        : delta < 0
          ? `, so its rego is ${money(-delta)} over`
          : ''
    out.push(
      `The price list registers it as ${wrong.word}, though it is rated ${kgSaid(wrong.atmKg)}${rego}. Review has it.`,
    )
  }
  for (const g of two) {
    if (g.tableId !== tableId) continue
    const item = g.items.find((i) => !meant[i.key] && i.lines.some((l) => l.rowId === rowId))
    const mine = item?.lines.find((l) => l.rowId === rowId)
    if (!item || !mine) continue
    out.push(
      `Its name is at two prices in ${g.tableName}, ${money(item.low)} and ${money(item.high)} ${g.priceName}; this one is ${money(mine.price)}. Review has it.`,
    )
  }
  return out
}
