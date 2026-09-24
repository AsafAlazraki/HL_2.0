/* ============================================================
   THE TITLE A BUYER WOULD SAY, AND THE NAME OF THE PDF THEY ARE SENT.

   Phase 0 of the proposal (docs/research/proposal/analysis.md §6, and
   quote-spec.md §3 item 3 and §10): the customer's paper heads with
   the exact model as a buyer says it, and the saved PDF is named for
   the dealership, the quote and that model —

       Northside Marine quote 20260923-01 – Stacer 529 Assault Pro (Tournament)

   WHERE EVERY WORD COMES FROM. `spokenBoat` (./spoken.ts) is the one
   place a boat's name is said, and this reads it and nothing else:

     - the maker's prefix comes off only where the file's label begins
       with that maker (or a misspelling of it the names ledger records
       with its evidence) and " - ";
     - the rest is kept whole. A bracket that ends the model's own
       words is part of WHICH model it is — "529 Assault Pro
       (Tournament)" is not the 529 Assault Pro, and "519 Sea Ranger
       SDF (Centre Console)" is not its Side Console sister — so the
       title keeps it in its brackets, as the file writes it. The
       build and the register say it after a dot ("· Tournament");
       the paper is the object a buyer keeps and files, and it keeps
       the model's name in one piece;
     - the material and the colourway are the FINISH, set under the
       title: HYP is "Hypalon" (the word the original HelmLogic put on
       customer paper for exactly this reason, RELEASE_NOTES_v1.16.0,
       ticket lXRbKtH8), and a colourway is `colourwayOf`, all or
       nothing — B-G-B is "Black / Grey / Black", O-G-DG stays O-G-DG.

   THE PDF'S NAME CARRIES THE TITLE AND NOT THE FINISH. A colourway's
   " / " is a path separator to every file system the PDF will land
   on, and a name that a save dialogue mangles into "Black _ Grey _
   Black" is worse than one that stops at the model.

   PURE. No store, no DOM, no clock.
   ============================================================ */

import { LEDGER, spokenBoat, type NamesLedger } from './spoken'

const SEP = ' · '

export interface BoatTitle {
  /** the exact model as a buyer says it — "Stacer 529 Assault Pro
   *  (Tournament)", "Highfield ADV7", "Highfield ADV9 (Dune)" */
  title: string
  /** its material and colourway in words — "Hypalon · Black / Grey /
   *  Black"; '' when the file names neither */
  finish: string
  /** both on one line, as a line of the paper prints the hull —
   *  "Highfield ADV7 · Hypalon · Black / Grey / Black" */
  say: string
}

/** The boat a quote is for, as its paper heads it. */
export function boatTitle(tableId: string, label: string, ledger: NamesLedger = LEDGER): BoatTitle {
  const boat = spokenBoat(tableId, label, ledger)
  const title = boat.trim === '' ? boat.name : `${boat.name} (${boat.trim})`
  const finish = [boat.material, boat.colour?.say ?? ''].filter((s) => s !== '').join(SEP)
  return { title, finish, say: finish === '' ? title : `${title}${SEP}${finish}` }
}

/**
 * WHAT THE SAVED PDF IS CALLED: the business, "quote", the reference,
 * then the model. A quote that froze no business name is called by its
 * reference alone — "Quote 20260923-01 – …" — and never by the app.
 */
export function paperFileTitle(business: string | null, reference: string, title: string): string {
  const who = business !== null && business.trim() !== '' ? `${business.trim()} quote` : 'Quote'
  return `${who} ${reference} – ${title}`
}
