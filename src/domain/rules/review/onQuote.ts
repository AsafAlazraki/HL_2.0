/* ============================================================
   WHAT REVIEW FINDS ON A QUOTE'S OWN LINES — said in the build, where
   the line is picked (the judge of Review, J15: "Is the price I am
   about to quote right? Not served anywhere"; the verifier of
   2026-11-04, round 1: "the build warns only 'The boat has no price
   yet'. There is no warning for a wrong rego, two prices or a line
   below cost").

   Two of Review's checks are about a line a salesperson can put on a
   quote and say nothing of themselves:

     band   a trailer registered as the wrong size for its weight: its
            rego on the quote is the price list's, short or over
     two    one name at two prices in its list: the one on the quote is
            one of the two

   The boat with no price is said by the build already, and a part with
   no price too ("has no price on the price list"). A line BELOW COST is
   not said here, and never will be: the build stands at the desk with
   the customer, and cost and margin never reach a surface the customer
   sees (CLAUDE.md). Review says it, at the back of the shop.

   WHAT NORTHSIDE LEFT ALONE IS NOT SAID: a case left as meant is
   Northside's own answer, and the build does not argue with it.

   Only the two checks are run — never the whole of Review, whose rule
   measures the build has no use for — once per price list (the rows
   are one object per load, as `houseMeasures.ts` keeps its figures).

   PURE: the lists, a quote's lines and what was left alone in; one
   sentence per line found out.
   ============================================================ */

import { money } from '@/domain/money'
import type { QuoteDef } from '@/domain/model'
import { saidOnQuote } from '@/domain/quote/spoken'
import { bandReview, twoPrices, type Meant, type ReviewWorld } from './checks'

export interface WrongOnQuote {
  kind: 'band' | 'two'
  /** the quote's line it is said of */
  lineId: string
  said: string
}

interface Found {
  band: ReturnType<typeof bandReview>['lines']
  two: ReturnType<typeof twoPrices>['groups']
}

const FOUND = new WeakMap<ReviewWorld['rowsByEntity'], Found>()

function found(world: ReviewWorld): Found {
  const hit = FOUND.get(world.rowsByEntity)
  if (hit) return hit
  /* nothing left alone is set aside here: what was left is filtered per quote, below */
  const out = { band: bandReview(world).lines, two: twoPrices(world).groups }
  FOUND.set(world.rowsByEntity, out)
  return out
}

const kgSaid = (n: number): string => `${n.toLocaleString('en-AU')} kg`

/** What Review finds on the lines of one quote, one sentence each, in the quote's own order. */
export function wrongOnQuote(
  world: ReviewWorld,
  quote: Pick<QuoteDef, 'lines' | 'sections' | 'rootTableId' | 'subjectLabel'>,
  meant: Meant = {},
): WrongOnQuote[] {
  const { band, two } = found(world)
  const out: WrongOnQuote[] = []
  for (const line of quote.lines) {
    /* named as the quote's screens and its paper name it (`saidOnQuote`) */
    const name = saidOnQuote(quote, line)
    const wrong = band.find(
      (b) => b.tableId === line.entityId && b.rowId === line.rowId && !meant[b.key],
    )
    if (wrong) {
      const delta = wrong.to?.delta ?? 0
      const rego =
        delta > 0
          ? `, so its rego is ${money(delta)} short`
          : delta < 0
            ? `, so its rego is ${money(-delta)} over`
            : ''
      out.push({
        kind: 'band',
        lineId: line.id,
        said: `The price list registers the ${name} as ${wrong.word}, though it is rated ${kgSaid(wrong.atmKg)}${rego}. Review has it.`,
      })
    }
    for (const g of two) {
      if (g.tableId !== line.entityId) continue
      const item = g.items.find((i) => !meant[i.key] && i.lines.some((l) => l.rowId === line.rowId))
      const mine = item?.lines.find((l) => l.rowId === line.rowId)
      if (!item || !mine) continue
      out.push({
        kind: 'two',
        lineId: line.id,
        said: `The ${name} is at two prices in ${g.tableName}, ${money(item.low)} and ${money(item.high)} ${g.priceName}; this quote has the line at ${money(mine.price)}. Review has it.`,
      })
    }
  }
  return out
}
