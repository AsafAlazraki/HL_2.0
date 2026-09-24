/* ============================================================
   A SERIES AS A PERSON SAYS IT — "Fisher Series", where the file's
   cell writes "Fisher Series (as at 18.03.2026)".

   m2-last-critique.md, major 6: the picker's plate printed the Haines
   series header as "FISHER SERIES (AS AT 18.03.2026)". The bracket is
   not part of the series' name. It is the date the dealer's workbook
   stamped the list with, written into the same cell, and every one of
   Haines Signature's three series carries it. A heading that says the
   stamp as if it were the name reads like the file's own header row.

   TWO KINDS OF BRACKET ARE ON THIS FILE, AND THEY ARE SAID TWO WAYS.

     a stamp   "(as at 18.03.2026)" — a trailing bracket that begins
               "as at". It is set apart from the name as a NOTE,
               "as at 18.03.2026", in the file's own words and the
               file's own date: nothing reads the date, reorders it or
               spells its month, because the file wrote it and a
               screen that re-wrote it would be claiming to know which
               of the two figures is the day.
     a trim    "OUTLAW (SIDE CONSOLES)", "SEA RANGER (CENTRE
               CONSOLES)" — a trailing bracket that says which kind of
               the series it is. It stays in the name and is said
               after it with " · ", "OUTLAW · SIDE CONSOLES", the way
               `spokenBoat` says a boat's own trim ("519 Sea Ranger SDF
               · Centre Console").

   ONLY PUNCTUATION IS TIDIED, NEVER A WORD, which is `spokenBoat`'s
   rule too: every word of the cell is in `name` or in `note`, runs of
   spaces are one, and the file's casing ("SKIMMAS", "Fisher Series")
   is kept. A blank cell answers a blank name, and a screen says that
   in its own words.

   PURE. A string in, two strings out.
   ============================================================ */

export interface SeriesSaid {
  /** the series' name — "Fisher Series", "OUTLAW · SIDE CONSOLES" */
  name: string
  /** what the file stamped the cell with — "as at 18.03.2026"; '' when
   *  the cell carries no stamp */
  note: string
}

const SEP = ' · '

/** A trailing bracket that stamps the cell with a date — "(as at …)". */
const STAMP = /^(.*?)\s*\(\s*(as at\b[^()]*?)\s*\)\s*$/i

/** A trailing bracket after a name, that is not a stamp. */
const TRIM = /^(.*\S)\s*\(\s*([^()]+?)\s*\)\s*$/

const tidy = (text: string): string => text.replace(/\s+/g, ' ').trim()

/** One series cell, said: its name, and the stamp set apart from it. */
export function seriesSaid(cell: string): SeriesSaid {
  let name = tidy(cell)
  let note = ''
  const stamp = STAMP.exec(name)
  if (stamp && stamp[1]!.trim() !== '') {
    name = tidy(stamp[1]!)
    note = tidy(stamp[2]!)
  }
  const trim = TRIM.exec(name)
  if (trim) name = `${tidy(trim[1]!)}${SEP}${tidy(trim[2]!)}`
  return { name, note }
}
