/* ============================================================
   THE THING A PERSON RECOGNISES FIRST — an option’s name with the
   dealer’s code taken out of it, and the two or three facts its own
   row states that decide it.

   THE BUILD PAST THE MOTOR WAS STILL THE DATABASE (the components
   critique of 2026-09-29, blocker 2). The trailer was named code
   first — "TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 -
   5.3 m" — on its tile and on its chapter’s shut head; the rigging kit
   was "Yamaha/Stacer · 704-6Y82L-22-07 · Binnacle Mount Rigging Kit";
   a shackle was "110016 · D Shackle · 10 mm Galv". Each of those
   leading codes is the line’s OWN code, the one the dealer orders by,
   written into the file’s name for the row as well as into its Code
   column. A person at the desk says "the T Alloy 1400, skid, braked",
   and the dealer still needs the TA1400S13SB.

   SO THE NAME LOSES ONLY WHAT IS THE LINE’S OWN CODE, and the code is
   kept whole beside it for the dealer (`codeBeside`). A part of the
   spoken name (`lineSaid`, joined by " · ") is the code when it is one
   of the code’s own tokens — "TA1400S13SB" of "TA1400S13SB", "TA600-MOB"
   of "TA600-MOB (SP560)" — or the end of one after a hyphen:
   "704-6Y82L-22-07" of "9ST-704-6Y82L-22-07". That is evidence off the
   line, never a guess at what looks like a code: a shackle whose file
   carries no code keeps every word. And it goes only where nobody says
   it — leading the name, or a part number written with hyphens — so
   "Battery · MRV70 · Qty 2", whose code is its model, keeps the MRV70.
   A name that is only its code keeps it ("Yamaha F90LB" is one part,
   and it is what the motor is called).

   AND A TRAILER’S SIZE IS A FACT, NOT A WORD OF ITS NAME. Stacer writes
   the boat a trailer takes into the name in brackets — "(4.9 - 5.3m)" —
   and into its own `Boat Size (Mtr)` column. Where the column says the
   same figures, the part leaves the name and is said among the facts,
   where it has its meaning: "for a 4.9–5.3 m boat". NSM’s custom
   trailers write a Surtees model ("495") into the same column, with no
   unit, and nothing is read from it: a unit assumed is a figure
   invented (`measured`, src/domain/quote/spoken.ts, says the same).

   THE FACTS ARE THE FILE’S, BY ITS OWN COLUMN NAMES, and no other cell
   of a row is read — no money passes through here. A motor’s are
   `goodsFacts`' (power, weight, shaft). A trailer’s are the boat size,
   the ATM and the wheel size, as Northside’s trailer registers name
   them; a register that files one of them not at all says the others.

   PURE: no React, no store. Tested against the real pack.
   ============================================================ */

import { readCell, type EntityDef, type RowData } from '@/domain/model'
import { motorFactsOf, motorFactsSaid } from '@/domain/quote/goodsFacts'

const SEP = ' · '

/* THE NAME A PERSON SAYS moved to src/domain/quote/spoken.ts (2026-10-19), so the cascade and the
   paper name a line as the build does; re-exported here for the build's own readers. */
export { nameFirst } from '@/domain/quote/spoken'

/** The figures in a span, as numbers: "4.9 - 5.3 m" is 4.9 and 5.3, "3.5 - 4.0m" 3.5 and 4. */
function figuresOf(text: string): number[] {
  return [...text.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
}

/* ---------------------------------------------------------- */
/* A row’s own facts                                           */
/* ---------------------------------------------------------- */

const fieldOf = (entity: EntityDef, names: readonly string[]) =>
  entity.fields.find((f) => names.some((n) => f.name.trim().toLowerCase() === n))

const numberAt = (entity: EntityDef, row: RowData, names: readonly string[]): number | null => {
  const field = fieldOf(entity, names)
  const v = field ? readCell(row, field.id) : undefined
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null
}

const textAt = (entity: EntityDef, row: RowData, names: readonly string[]): string => {
  const field = fieldOf(entity, names)
  const v = field ? readCell(row, field.id) : undefined
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
}

/** THE BOAT A TRAILER TAKES, as the figures of its own `Boat Size (Mtr)` cell — only where the
 *  cell writes its unit ("4.9 - 5.3m"). A bare "495" is a model’s number, not metres. */
export function trailerSizeOf(entity: EntityDef | undefined, row: RowData | undefined): number[] {
  if (!entity || !row || entity.kind !== 'trailer') return []
  const cell = textAt(entity, row, ['boat size (mtr)', 'boat size'])
  if (!/\d\s*m\b/i.test(cell)) return []
  return figuresOf(cell)
}

/** "13″", as the file writes a wheel’s size in inches — a figure, or a figure with its mark. */
function wheelOf(entity: EntityDef, row: RowData): string {
  const inches = numberAt(entity, row, ['wheel size in'])
  if (inches !== null) return `${inches}″`
  /* a figure with the inch mark after it, whichever mark the file typed: what follows the
     last figure is not part of it */
  const said = textAt(entity, row, ['wheel size']).replace(/[^\d.]+$/, '')
  return /^\d+(?:\.\d+)?$/.test(said) ? `${said}″` : ''
}

/** A trailer’s facts, as the file states them — for a 4.9–5.3 m boat, 1,400 kg ATM, 13″ wheels
 *  — the ones its row carries, in that order; none is ever a dash. */
export function trailerFacts(entity: EntityDef | undefined, row: RowData | undefined): string[] {
  if (!entity || !row || entity.kind !== 'trailer') return []
  const facts: string[] = []
  const size = trailerSizeOf(entity, row)
  if (size.length === 1) facts.push(`for a ${size[0]} m boat`)
  else if (size.length === 2) facts.push(`for a ${size[0]}–${size[1]} m boat`)
  const atm = numberAt(entity, row, ['atm (kg)', 'atm'])
  if (atm !== null) facts.push(`${atm.toLocaleString('en-AU')} kg ATM`)
  const wheel = wheelOf(entity, row)
  if (wheel !== '') facts.push(`${wheel} wheels`)
  return facts
}

/** What the build says under an option’s name — a motor’s power, weight and shaft, a trailer’s
 *  boat, ATM and wheels — or nothing for anything else, whose file states nothing that decides it. */
export function goodsSaid(entity: EntityDef | undefined, row: RowData | undefined): string {
  if (!entity || !row) return ''
  if (entity.kind === 'motor') return motorFactsSaid(motorFactsOf(entity, row))
  return trailerFacts(entity, row).join(SEP)
}

/** A motor’s power as its file writes the rating — 90 — for the build’s power chips; nothing
 *  for anything that is not a motor or has none. */
export function powerOf(entity: EntityDef | undefined, row: RowData | undefined): string {
  if (!entity || !row || entity.kind !== 'motor') return ''
  return motorFactsOf(entity, row).hp ?? ''
}
