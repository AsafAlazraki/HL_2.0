/* ============================================================
   WHICH CHAPTERS OF A BUILD A PERSON HAS FOLDED.

   The owner, 2026-10-31: "all cards on the right should be open by
   default". Every chapter of the build stands open, and a person may
   fold one; what is folded is a per-browser convenience (a collapsed
   band, in `src/state/prefs.ts`'s own words), kept by the chapter's
   id, so the dealer who folds Dealer fit finds it folded on the next
   quote too.

   A PREF IS SOMETHING A BROWSER KEPT, so it is read rather than
   trusted: anything that is not a list of short words is no fold at
   all, and every chapter is open.
   ============================================================ */

/** The chapter ids a kept value names as folded: a list of short strings, in its own order,
 *  each once. Anything else is nothing folded. */
export function foldedOf(kept: unknown): readonly string[] {
  if (!Array.isArray(kept)) return []
  const out: string[] = []
  for (const id of kept) {
    if (typeof id !== 'string') continue
    const word = id.trim()
    if (word === '' || word.length > 60 || out.includes(word)) continue
    out.push(word)
  }
  return out
}

/** The list after a press on one chapter's head: folded if it was open, open if it was folded. */
export function foldToggled(folded: readonly string[], id: string): string[] {
  return folded.includes(id) ? folded.filter((f) => f !== id) : [...folded, id]
}

/** The list with one chapter open again, as a chapter the reader is taken to is opened. */
export function unfolded(folded: readonly string[], id: string): string[] {
  return folded.filter((f) => f !== id)
}
