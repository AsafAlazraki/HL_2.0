/* ============================================================
   ONE module declaration, for one specifier, for one guard.

   `applied.test.ts` reads the SOURCE TEXT of this feature to prove
   it claims no rate nobody measured and says the discontinued half
   in the contract's own words. A behavioural test cannot see either:
   a hand-typed "holds on 581 of 581" renders perfectly well and is
   exactly the fault the file's own header is about.

   IT WAS EIGHT SPECIFIERS AND IT IS ONE. The other seven were the
   `.tsx` surfaces that curate — a view page's block, the two quote
   pickers, the trailer selector, the module catalogue, the fan-out —
   and the guard over them read whether each imports this feature.
   HL_2.0 has no screens yet; they arrive one at a time in Milestone
   1, each from its own direction, and the line that puts a surface
   back on that list is one line here and one in `applied.test.ts`.
   `docs/LATER.md` is not where this belongs — it is not deferred
   work, it is a guard waiting on the thing it guards.

   Vite serves `?raw`; TypeScript needs telling. Declared one
   specifier at a time rather than as a `*?raw` wildcard — the
   precedent `trailerFitment.raw.d.ts` set next door, and for its
   reason: a wildcard is a quiet way to import anything as a string.
   ADDING A SURFACE MEANS ADDING A LINE HERE, which is the friction
   that makes the list honest.
   ============================================================ */

declare module '@/domain/catalogue/curation/curation.ts?raw' {
  const source: string
  export default source
}
