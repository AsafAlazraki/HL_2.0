/* ============================================================
   THE PRICE LIST'S OWN HEADINGS, AS THE SECTIONS OF AN AISLE (the
   judge of the chandlery, major 7: "Propellers & motor care is 447
   parts behind 18 presses of Show the next 24").

   The parts list files every line under a heading the workbook writes
   ("PROPELLERS - Yamaha", "YAMAHA SERVICE ITIEMS", "ANCHOR WINCHES -
   Lone Star"). An aisle is a name over some of them; inside it, the
   headings are the sub-groups, each counted, in the file's own order.

   A HEADING SAID keeps the file's own words and spelling — "ITIEMS" is
   Review's to correct, not this page's — and only quiets the
   shouting: a word in capitals is set in lower case, a maker's name
   keeps its capital, and a short initialism (GME, VHF, AIS) and every
   word already in mixed case stay exactly as written. A line with no
   heading is said to have none.

   PURE: headings in, sections and words out.
   ============================================================ */

/** Names whose capital is kept when the rest of a heading is quieted. */
const NAMES = new Set([
  'GARMIN',
  'LOWRANCE',
  'SIMRAD',
  'RAYMARINE',
  'YAMAHA',
  'FUSION',
  'HIGHFIELD',
  'NAVIONICS',
  'YAMALUBE',
  'TERROVA',
  'INSTINCT',
  'POWERDRIVE',
  'THRUSTME',
  'MOMENTUM',
  'SARCA',
  'HELLA',
  'MAJESTIC',
  'BLUECHART',
  'RAILBLAZA',
  'STRIKER',
  'ECHOMAP',
  'VIVID',
  'SUPERCHARGE',
  'CENTURY',
  'KOTA',
  'MINN',
  'STACER',
  'SALTY',
  'CAPTAIN',
])

/** Initialisms of three letters or fewer, kept as written. */
const SHORT = new Set([
  'GME',
  'VHF',
  'AIS',
  'NSS',
  'EVO',
  'XS',
  'GO',
  'SD',
  'TV',
  'USB',
  'PVC',
  'DES',
  'SCU',
  'DEC',
  'RAM',
  'MMX',
  'DFO',
  'PBS',
  'NB',
  'SE',
  'MF',
  'AM',
  'FM',
  'BBQ',
  'LED',
  'GPS',
  'PFD',
  'UHF',
  'HDS',
  'DSC',
  'ATM',
  'SS',
])

/** Long words that are names or initialisms in their own right, kept as written. */
const KEEP = new Set(['GPSMAP', 'NMEA', 'EPIRB', "PFD'S", 'BBQS', 'LIVESCOPE'])

export const NO_HEADING = 'No heading in the price list'

/** A HEADING AS A PERSON READS IT: "ANCHOR WINCHES - Lone Star" → "Anchor winches – Lone Star". */
export function headingSaid(heading: string | null | undefined): string {
  const h = (heading ?? '').trim()
  if (h === '') return NO_HEADING
  const words = h.replace(/\s+-\s+/g, ' – ').split(' ')
  const said = words
    .map((w) => {
      const core = w.replace(/[^A-Za-z']/g, '')
      if (core.length < 2 || core !== core.toUpperCase() || KEEP.has(core)) return w
      if (core.length <= 3 && SHORT.has(core)) return w
      if (NAMES.has(core)) return w[0]! + w.slice(1).toLowerCase()
      return w.toLowerCase()
    })
    .join(' ')
  return said.charAt(0).toUpperCase() + said.slice(1)
}

/** One section of an aisle: a heading of the price list and the lines under it, in file order. */
export interface Section<P> {
  heading: string
  said: string
  parts: P[]
}

/** THE SECTIONS OF A RUN OF PARTS: each heading once, in the order the file first writes it. */
export function sectionsOf<P extends { heading: string }>(parts: readonly P[]): Section<P>[] {
  const by = new Map<string, P[]>()
  for (const part of parts) {
    const h = part.heading.trim()
    const run = by.get(h)
    if (run) run.push(part)
    else by.set(h, [part])
  }
  return [...by].map(([heading, run]) => ({ heading, said: headingSaid(heading), parts: run }))
}

/**
 * THE PHOTOGRAPHS FIRST (the judges' graft from board C: "in a pictured aisle, the photograph
 * grid has to be what the owner sees first"). The headings that hold a pictured part come before
 * those that hold none, each run kept in the file's own order; an aisle with no picture is
 * untouched.
 */
export function picturedFirst<P>(
  sections: readonly Section<P>[],
  pictured: (part: P) => boolean,
): Section<P>[] {
  const withPictures = sections.filter((s) => s.parts.some(pictured))
  return [...withPictures, ...sections.filter((s) => !withPictures.includes(s))]
}
