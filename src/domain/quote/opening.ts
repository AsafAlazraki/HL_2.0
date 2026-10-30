/* ============================================================
   WHICH CHAPTER OF A BUILD STANDS OPEN WHEN THE ADDRESS NAMES NONE.

   The build's position is a search param, `?at=`. A person who
   pressed a chapter's head put it there, and that chapter stays open
   whatever happens on it. Arriving from the picker there is none, and
   the open chapter is then this reading of the document: the first
   thing still to do on it.

   THE FAULT THIS WAS WRITTEN TO END (m2-last-critique.md, major 3).
   The reading was "the first band with nothing on it, else chapter
   one". On the Highfield ADV7 in Black / Grey / Black the motor is the
   only band the picker leaves empty, so the build opens on 02 Motor —
   and the moment the F250XCB went on, no band was empty any more and
   the reading fell back to chapter one: the motor list folded and
   "ADV7 — 7 finishes" opened under the hand, at 1440, 834 and 390. It
   showed the dealer the decision he made on the picker, and not the one
   in front of him. That fault came from the reading moving by itself;
   since 2026-10-30 a draft with a hull opens on the hull and stays
   there until the dealer presses another chapter (rule 3).

   SO THE ORDER IS THE SALE'S OWN, and every step of it is a fact read
   off the document:

     1. the chapter the address names, when it names one this build has
     2. a quote already given: the finale, the one chapter on it that
        still does anything (every other chapter is read-only)
     3. A DRAFT WITH A HULL OPENS ON 01 THE HULL, ALWAYS (the owner,
        2026-10-30: "always hull expanded first"). The boat is what is
        sold and what the customer looks at first. The dealer moves on
        by pressing the next chapter's head, which writes `?at=`, and
        nothing moves on by itself (the flow walk: "never auto-advance").
        A boat the file holds no price for opens here too, where the
        dealer puts the price on it (`nought.ts`).
     4. on a build with no hull (a motor, a trailer or parts sold on
        their own): the first band with nothing on it and something to
        offer
     5. nobody named yet: Who it is for
     6. the finale, where the quote is given
     7. chapter one, only for a build that has neither closing chapter

   WHAT IT DOES NOT DO. It never decides how many lines a chapter
   "should" take: the engine adds and removes, and a band can carry two
   motors. A band with one line on it has been answered; a dealer who
   wants a second presses the chapter's head, which writes `?at=`, and
   from then on the chapter stays open under every press.

   PURE. It reads the chapters' ids, kinds and counts, and four facts
   about the document, and hands back an id. No React, no store, no DOM.
   ============================================================ */

/** What the reading needs of one chapter, and nothing more. */
export interface ChapterPlace {
  id: string
  /** a decision the price file carries, or one of the two that close the sale */
  kind: 'band' | 'handover' | 'finale'
  /** how many lines of the quote this chapter holds */
  lines: number
  /** how many rows it has to offer */
  offered: number
}

/** The four facts about the document the reading turns on. */
export interface OpeningFacts {
  /** the chapter the address names; '' when it names none */
  at: string
  /** the quote has been given to the customer */
  issued: boolean
  /** the boat itself carries no price (`hullHasNoPrice`) */
  hullUnpriced: boolean
  /** the quote is addressed to somebody */
  named: boolean
}

/** The id of the chapter that stands open, or '' when there is no chapter at all. */
export function chapterToOpen(chapters: readonly ChapterPlace[], facts: OpeningFacts): string {
  const first = (test: (c: ChapterPlace) => boolean): string | undefined => chapters.find(test)?.id
  return (
    (facts.at === '' ? undefined : first((c) => c.id === facts.at)) ??
    (facts.issued ? first((c) => c.kind === 'finale') : undefined) ??
    (facts.issued ? undefined : first((c) => c.id === 'hull')) ??
    first((c) => c.kind === 'band' && c.lines === 0 && c.offered > 0) ??
    (facts.named ? undefined : first((c) => c.kind === 'handover')) ??
    first((c) => c.kind === 'finale') ??
    chapters[0]?.id ??
    ''
  )
}
