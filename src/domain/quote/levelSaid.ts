import { LEVEL_TITLE, type PriceLevel } from '@/domain/model'

/* ============================================================
   A PRICE LEVEL IS SAID BY THE NAME THE DEALERSHIP DECLARED FOR IT.

   The price file writes one level under a different column name in
   almost every list: a boat's cash price is `Cash`, a motor's is
   `Sell Price`, a trailer's is `Sell inc Rego`, a part's is `Sell`,
   and trade is `Trade` on a boat and `Trade Price` on a motor. The
   engine keeps each line's column name, and it must — it is where the
   figure was read from. But a dealer who pressed "Cash" once, for the
   whole quote, was then shown four level names on one quote: the
   build's "$31,850 at Sell Price", the cascade's "Sell Price → Trade
   Price" and "it stays at Sell inc Rego", the finale's "priced at Sell
   inc Rego" — beside the declared "Cash" and "Trade"
   (docs/directions/m2-last-critique.md, major 5).

   The declared words are `LEVEL_TITLE` (`domain/model/pricing.ts`):
   one per level KEY, which is what every column of one level shares.
   A key the business declared with no title here is said by the
   file's own column name, because the business's vocabulary outranks
   ours and nothing is invented to replace it.
   ============================================================ */

/** A price level by its declared name: `cash` → `Cash`, and the file's
 *  own column name only where no name is declared for its key. */
export const levelWord = (key: string, column?: string | null): string =>
  LEVEL_TITLE[key] ?? (column && column.trim() !== '' ? column : key)

/** The level ONE LINE of a quote is priced at, by its declared name.
 *  '' where the line has no price column at all, which is a fact and
 *  never a level. */
export function lineLevelSaid(line: {
  levelResolved: string
  priceColumnName: string | null
}): string {
  if (line.priceColumnName === null || line.priceColumnName.trim() === '') return ''
  return levelWord(line.levelResolved, line.priceColumnName)
}

/** THE FILE'S OWN NAMES FOR A LEVEL THAT THE APP SAYS ANOTHER WAY —
 *  `Sell Price`, `Trade Price`, `Sell inc Rego`, `Sell` — read off the
 *  declared ladders rather than typed, so the day the file renames a
 *  column the guard reads the new name. A dealer's screen prints none
 *  of them; the screens' tests read their text against this list. */
export function fileLevelNames(ladders: Iterable<readonly PriceLevel[]>): string[] {
  const names = new Set<string>()
  for (const ladder of ladders) {
    for (const level of ladder) {
      const said = levelWord(level.key, level.label)
      if (level.label.trim() !== '' && level.label !== said) names.add(level.label)
    }
  }
  /* the longest first, so "Sell inc Rego" is reported rather than "Sell" */
  return [...names].sort((a, b) => b.length - a.length)
}

const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Every file level name a text prints, as a whole phrase and case as
 *  the file writes it ("Sell" in "Sell Price", never in "sells"). */
export function fileLevelNamesIn(text: string, names: readonly string[]): string[] {
  const found: string[] = []
  let rest = text
  for (const name of names) {
    const at = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, 'u')
    if (at.test(rest)) {
      found.push(name)
      rest = rest.replace(new RegExp(escapeRe(name), 'g'), ' ')
    }
  }
  return found
}
