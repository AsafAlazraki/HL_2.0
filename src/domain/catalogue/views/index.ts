/* ============================================================
   VIEWS — the "what goes with this?" derivation, as pure functions.

   ONE DOOR, because other parts of the domain read this one: the
   quote mints its sections from a view's blocks, the module index
   asks which row a table's page opens on, and the curation mechanism
   says what each of them held back.

     import { createViewFor, relatedRows, makeEngine } from
       '@/domain/catalogue/views'

   WHAT IS NOT HERE, AND WHY. The old barrel also published
   `ViewPage`, the drag-and-drop payload helpers, the `useViewDef`
   hooks and the block editors. All four are the SCREEN — React, the
   DOM, and a module-level registry — and `src/domain` holds none of
   those. The page arrives in Milestone 1 from its own reference
   sweep and its own picked direction, and it will read these
   functions rather than reimplement them.

   THE SURFACE IS THE OLD BARREL'S, minus those four. A module this
   barrel did not publish before is still reached by its own path —
   `views/columns`, `views/filter`, `views/relations`, `views/rollup`,
   `views/warnings` — exactly as every caller reached them in the old
   repo. A door that widens on the way through a port is a door
   nobody decided to widen.

   AND ONE RULE THIS FEATURE OWES THE REST OF THE APP

   `ensureJoinTable` CREATES A TABLE. A structural change is never a
   side effect of a browsing or picking action — it is offered, in a
   sentence that names it, and it is undoable. The ask belongs to the
   surface where the press happened, not to the function: the surface
   holds the act back, names the table it is about to make and the
   count the sheet will move to, and raises a toast with UNDO once a
   person has said yes. A new caller does the same, or it
   reintroduces audit finding 14 — one click on an accessory taking
   the sheet from 53 tables to 54, in silence.
   ============================================================ */

/* The default page for a table, minted from the relationships the
   file already declares. See `viewFor.ts` for what the dropped
   registry took with it. */
export { createViewFor } from './viewFor'

/* WHICH ROW A PAGE OPENS ON when the door named a table and nothing
   more — and which row a CATALOGUE should offer as the way in, which is
   the same question asked from one screen further out. One rule, one
   scan depth, so the two can never name different boats. See landing.ts
   for the measurement and the rule. */
export { bestAnsweredRow, LANDING_SCAN } from './landing'
export type { BestAnswered, BestAnsweredArgs } from './landing'

/* The guess, and the plain English — exported because a future
   quote screen has to say the same sentences this page says. */
export { suggestRule } from './suggest'
export type { RuleSuggestion, SuggestionKind } from './suggest'
export { describeRule, summariseRule, countChip, curatedOnly, isCuratedOnly } from './describe'

/* WHICH SURFACES HOLD DISCONTINUED STOCK BACK, and what they say when
   they do. Exported because the module index and the quote picker are
   the other two customer-facing surfaces and must say the same
   sentences this page says — one wording, one policy. */
export {
  sellableRows,
  sellableTables,
  sellableRowCount,
  countDiscontinued,
  heldBackRowCount,
  heldBackSentence,
  retiredTableSentence,
  retiredPairsSentence,
  retiredTablesSentence,
} from './sellable'

/* Reading and writing pairs, for anything else that needs the
   curated menu (a quote, an export, a rule run). */
export {
  findJoinTable,
  joinRefFor,
  ensureJoinTable,
  joinTableName,
  readPairs,
  relatedRows,
  writePair,
  clearRecommended,
  evalPairRule,
  makeEngine,
  PAIR_ORDER_FIELD,
} from './pairs'
export type {
  JoinRef,
  PairInfo,
  RelatedRow,
  BlockResult,
  Ctx,
  PairAddress,
  PairWrites,
  JoinWrites,
} from './pairs'
