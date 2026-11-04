/* ============================================================
   A BOAT NAMED THE WAY A PERSON SAYS IT, from the maker and the model a
   photograph is filed under — never the maker said twice (the judge of
   Settings, 2026-11-04, P6: "Haines Signature Signature Fisher 525F").

   The same rule `spokenBoat` keeps for a row of the price list
   (src/domain/quote/spoken.ts, "A MAKER NOT SAID TWICE"): a maker of
   more than one word whose last word opens the model gives that word
   once, and a model that already begins with its maker is not given the
   maker again. Settings holds the maker and the model apart (Home's
   ledger, `Photographed`), so the rule is applied here to the two.

   Pure.
   ============================================================ */

const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase()

/** "Haines Signature" and "Signature Fisher 525F" are "Haines Signature Fisher 525F". */
export function boatNamed(maker: string, model: string): string {
  const m = maker.trim()
  const words = model.trim()
  if (m === '') return words
  if (words === '') return m
  if (same(words.slice(0, m.length + 1), `${m} `) || same(words, m)) return words
  const makerWords = m.split(/\s+/)
  const first = words.split(/\s+/)[0] ?? ''
  if (makerWords.length > 1 && same(makerWords[makerWords.length - 1]!, first))
    return [...makerWords.slice(0, -1), words].join(' ')
  return `${m} ${words}`
}
