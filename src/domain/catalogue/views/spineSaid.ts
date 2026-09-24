/* ============================================================
   A MODEL ON THE SHEET'S SPINE, AS A PERSON SAYS IT — "Roll Up 230
   KAM", where the file's hierarchy writes "RU230KAM".

   m2-last-critique.md major 7 (the specification's majors 7 and 8):
   the sheet named its models by code on its spine while the picker,
   the build, the paper, the register, History and Customers said them
   in words. The words are `spokenModel`'s — the one namer — so the
   sheet and every other screen cannot drift apart.

   ONLY A CODE THE MAKER'S OWN PAGE NAMES IS RE-SAID. On a register
   that files its models in words (Stacer's "519 Sea Ranger SDF", a
   trailer list's "TA700T-EH") the spine keeps the file's own string,
   because the sheet is where the dealer reads and corrects his file;
   and a code no page names (Highfield's SP300, CO360) stays the code,
   because a name nobody published is a name invented. Where the name
   IS re-said, the file's code is handed back beside it, so the spine
   can print it quietly for the dealer who orders by it.

   AND WHAT THE SPINE SAYS, THE FIND FIELD FINDS. A name the sheet
   prints has to be a name the sheet can be asked for: the finder and
   Home learned that the hard way (m2-last-critique.md blocker 2). The
   sheet's own search reads the file's strings (`applyView`), so
   `alsoBySaid` adds the rows whose model the app says in words that
   hold what was typed.

   PURE: the ledger is static bytes, and nothing here reads a store.
   ============================================================ */

import { LEDGER, spokenModel, type NamesLedger } from '@/domain/quote/spoken'

export interface SpineName {
  /** what the spine prints large: the maker's words, or the file's own */
  name: string
  /** the file's code, where `name` is not it; '' where the name is the file's own */
  code: string
  /** maker and name — "Highfield Roll Up 230 KAM" — what the find field reads */
  whole: string
}

/** One model token of one register, as the spine says it. */
export function spineName(tableId: string, token: string, ledger: NamesLedger = LEDGER): SpineName {
  const clean = token.trim()
  if (clean === '') return { name: '', code: '', whole: '' }
  const said = spokenModel(tableId, clean, ledger)
  if (said.from === 'maker' && said.model !== clean) {
    return { name: said.model, code: clean, whole: said.name }
  }
  return { name: clean, code: '', whole: clean }
}

/** Lower case, one space between words: how a typed phrase and a name are compared. */
const fold = (text: string): string => text.toLowerCase().replace(/\s+/g, ' ').trim()

/**
 * THE ROWS A FIND KEEPS, in the order the sheet holds them: those the
 * file's own search found, and those whose model the app says in words
 * that hold the typed phrase. `saidOf` is the model's name in words for
 * a row, or '' where the row's model is not re-said.
 */
export function alsoBySaid<T>(
  all: readonly T[],
  found: readonly T[],
  query: string,
  saidOf: (row: T) => string,
): T[] {
  const needle = fold(query)
  if (needle === '') return [...all]
  const hit = new Set(found)
  return all.filter((row) => {
    if (hit.has(row)) return true
    const said = saidOf(row)
    return said !== '' && fold(said).includes(needle)
  })
}
