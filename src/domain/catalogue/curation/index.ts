/* ============================================================
   CURATION — the mechanism, not a widget.

   `docs/plan/hl-journeys.md` §4: "A filter that can explain itself,
   be searched past, and be switched off is the shape every 'curated
   by rule' surface in our modules should take."

   It is exported the way the old repo's `@/lib/actions` was exported — one door,
   one vocabulary, used by four features that cannot see each other.
   A surface that narrows and does not import this is a surface that
   narrows silently, and that is now a one-line thing to spot.

   THE COMPONENT IS NOT HERE. The old barrel also published
   `CurationNote` — the drawing of all this — and `src/domain` holds
   no React. The arithmetic and the words are the part that must not
   be written twice, and they are what this door carries; the screen
   that draws them arrives with its own direction in Milestone 1 and
   re-exports itself from wherever it lands.
   ============================================================ */

export {
  curationChip,
  curationNote,
  measuredRate,
  reachNote,
  readCuration,
  toggleWords,
  type CurationCounts,
  type CurationInput,
  type CurationReading,
  type Narrowing,
} from './curation'

export { searchReach, type SearchReach } from './reach'
