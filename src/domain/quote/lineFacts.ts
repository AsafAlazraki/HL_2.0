import type { EntityDef, TableKind } from '@/domain/model'

/* ============================================================
   AN ITEM'S OWN FACTS, AS THE PRINTED QUOTE SAYS THEM.

   The owner, 2026-10-30: "full spec of the quote and the boat". A motor
   on the paper was a name, "Includes pre-delivery" and a price; the
   build drew the same motor with its power, weight and shaft. These are
   the facts a person chooses an item by, read off the item's own row by
   the column names Northside's registers carry, and frozen onto the line
   at the pick (`mintLine`) exactly as its price is, so the paper says
   them with the price list gone.

   A WHITELIST, NOT A READING OF EVERY COLUMN. A motor's row carries
   "Landed CTD", "Nett CTD" and "Total PD Allowance" beside its power; a
   trailer's carries "Nett Price", "MU %" and "Landed". A list of the
   columns that ARE facts can never put a cost on a customer's paper,
   however a table is re-curated; a filter of the columns that are not
   could. So each kind names its facts, with the word a person uses and
   the unit the column's own name states — never a unit guessed:

     - a trailer's "Trailer Length (Mtr)" is written in millimetres on
       this file (4430 under "(Mtr)"), so it is left out rather than
       printed as a 4,430 m trailer;
     - a package's bare "WEIGHT" states no unit, so it is left out.

   NOT A PART'S CATEGORY. Parts carry "Category", and on this file it is
   the shelf the dealer files a part on, not what the part is: a 32-inch
   television is filed under "Control Cables (Supplied in Kit) - 26 Ft".
   A part's own name says what it is; its picture, where one is held,
   shows it.

   PURE. No React, no store, no DOM.
   ============================================================ */

export interface LineFact {
  label: string
  value: string
}

type Say = (raw: unknown) => string | null

const text = (raw: unknown): string | null =>
  typeof raw === 'string' && raw.trim() !== ''
    ? raw.trim()
    : typeof raw === 'number' && Number.isFinite(raw)
      ? String(raw)
      : null

const num = (raw: unknown): number | null => {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string' && /^\d[\d,]*(\.\d+)?$/.test(raw.trim()))
    return Number(raw.replace(/,/g, ''))
  return null
}

/** A figure with the unit the column's own name states. */
const withUnit =
  (unit: string): Say =>
  (raw) => {
    const n = num(raw)
    return n === null || n <= 0 ? null : `${n.toLocaleString('en-AU')} ${unit}`
  }

const BARE = /^\d+(\.\d+)?$/

/** INCHES, SAID AS "IN": the file's inch mark ('20"') and a bare figure under a column whose
 *  own name says inches ("Wheel Size in") both read "20 in". The double prime the build sets has
 *  no glyph in the paper's face, and printed from a fallback face it stood apart from its figure. */
const inches: Say = (raw) => {
  const said = text(raw)
  if (said === null) return null
  return BARE.test(said) ? `${said} in` : said.replace(/(\d)\s*"/g, '$1 in')
}

/** "4.9 - 5.3" or "5.9", in metres, as the column's own "(Mtr)" says. */
const metres: Say = (raw) => {
  const said = text(raw)
  if (said === null) return null
  const span = /^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/.exec(said)
  if (span) return `${span[1]}–${span[2]} m`
  return /^\d+(?:\.\d+)?$/.test(said) ? `${said} m` : null
}

/** A word the file writes as a word, unless it is the file's "Opt" or "TBA". */
const word: Say = (raw) => {
  const said = text(raw)
  if (said === null || /^(opt|tba|n\/?a|-)$/i.test(said)) return null
  return said
}

/** Horsepower, which the file writes bare. */
const hp: Say = (raw) => {
  const said = text(raw)
  return said === null || !/^\d+(\.\d+)?$/.test(said) ? null : `${said} hp`
}

/** One fact: the column names it may be filed under, what a person calls it, and how it reads. */
interface Fact {
  columns: readonly string[]
  label: string
  say: Say
}

const MOTOR: readonly Fact[] = [
  { columns: ['HP Rating'], label: 'Power', say: hp },
  { columns: ['WEIGHT kg'], label: 'Weight', say: withUnit('kg') },
  { columns: ['Shaft Length', 'Shaft Length in'], label: 'Shaft', say: inches },
  { columns: ['Cylinders / Displacement'], label: 'Engine', say: word },
  { columns: ['Starting'], label: 'Starting', say: word },
  { columns: ['Control'], label: 'Control', say: word },
  { columns: ['Tilt & Trim'], label: 'Trim and tilt', say: word },
  { columns: ['Engine Colour'], label: 'Colour', say: word },
]

const TRAILER: readonly Fact[] = [
  { columns: ['Boat Size (Mtr)'], label: 'For boats of', say: metres },
  { columns: ['ATM (KG)'], label: 'Rated to (ATM)', say: withUnit('kg') },
  { columns: ['Tare (Kg)'], label: 'Tare', say: withUnit('kg') },
  { columns: ['Wheel Size in'], label: 'Wheels', say: inches },
  {
    columns: ['Wheel Size'],
    label: 'Wheels',
    /* a bare figure under "Wheel Size" states no unit, so only a written one is said */
    say: (raw) => {
      const said = text(raw)
      return said === null || BARE.test(said) ? null : said.replace(/(\d)\s*"/g, '$1 in')
    },
  },
  { columns: ['Winch'], label: 'Winch', say: word },
  { columns: ['Between Guards (mm)'], label: 'Between guards', say: withUnit('mm') },
]

/** The facts each kind of item is chosen by. A boat's are its specification, said elsewhere. */
const BY_KIND: Partial<Record<TableKind, readonly Fact[]>> = {
  motor: MOTOR,
  trailer: TRAILER,
  /* a factory package is a motor sold with a hull, filed with a motor's columns */
  package: MOTOR,
}

/**
 * The facts one row carries, in the order a person asks for them. `read` hands back a cell by
 * its field id, so the caller decides whether that is the row as stored or as the engine
 * reads it. A row with none of them says none.
 */
export function lineFactsOf(entity: EntityDef, read: (fieldId: string) => unknown): LineFact[] {
  const facts = entity.kind ? BY_KIND[entity.kind] : undefined
  if (!facts) return []
  const out: LineFact[] = []
  for (const fact of facts) {
    const field = entity.fields.find((f) => fact.columns.includes(f.name))
    if (!field) continue
    const value = fact.say(read(field.id))
    if (value !== null) out.push({ label: fact.label, value })
  }
  return out
}
