/* ============================================================
   THE NAME COLUMN TAKES THE ROOM ITS NAMES NEED.

   THE FAULT, MEASURED. `span.tb-val` inside `div.tb-cell.tb-cell-pin`
   was clipped on 26 of Stacer's 26 rows and 40 of Highfield's 40, at
   1280 AND at 1920 — the two lists byte-identical, because the column
   was a FIXED 184px (`DEFAULT_COL_W.text`) and a wider window bought
   nothing at all. "Stacer - 499 Sea Ranger SDF (Centre Console)" wants
   277px of 12.5px Inter and had 159. Every hull on the sheet read as
   "Stacer - 499 Sea Ranger S…", and the frozen column exists precisely
   so that a salesperson forty columns into the price band still knows
   WHICH boat they are pricing. A register whose name column is
   unreadable is not a register.

   WHY A TYPE DEFAULT CANNOT ANSWER IT. `DEFAULT_COL_W` is keyed on the
   column's TYPE, and a type cannot know that this dealer's model names
   run to forty-four characters while another's run to twelve. The
   width has to come from the data, so it is measured from the data.

   WHAT IS MEASURED, AND WHAT IS NOT. The display column's painted text,
   for every row of the table (not the filtered set — a width that moved
   when a search narrowed would be a second thing to think about). The
   longest few strings by character count are the only ones actually put
   through the canvas: a proportional face means the longest string is
   not always the widest, but among the longest two dozen it is, and
   twenty-four measurements per table is nothing while 2,519 — the
   largest seeded table — would be felt.

   THE CEILING IS A SHARE OF THE WINDOW, WHICH IS THE POINT.
   DESIGN_CONTRACT §2: "a register is allowed to be wider than the
   window; that is what sideways scroll is for". So the name may grow
   past the type default — but the pin FREEZES, and a frozen column that
   ate two thirds of a 1280px screen would leave the price bands
   nowhere to be. It gets at most `NAME_MAX_SHARE` of the scroller,
   never less than the 184px it has today, and never more than
   `MAX_COL_W`. A wider window therefore buys a wider name, which is
   exactly what the fixed width refused to do.

   IT IS A DEFAULT, NOT A DECISION. The result is merged UNDER the
   reader's own widths, so a drag still wins, "reset this column" still
   returns here, and a fit still overlays it.

   Pure at the bottom (`widestOf`, `nameColumnWidth`), a hook on top.

   PORT NOTE (HL_2.0). Only the pure bottom crossed over: `widestOf`,
   `nameColumnWidth` and `dataColumnWidth`, with the three constants
   they are argued from. Everything else in the old file was the
   MEASURING APPARATUS — a shared `<canvas>`, `getComputedStyle` off a
   painted `.tb-val`, a `document.fonts.ready` re-measure, a
   `ResizeObserver` box width and the three hooks over them
   (`usePaintedWidth`, `useBoxWidth`, `useNameColumnWidth`) — and every
   line of it is React or the DOM, which `src/domain` has neither of.

   THE SEAM WAS ALREADY DRAWN HERE, which is why the split costs
   nothing: `widestOf` already took `measure` as an argument, "so this
   is testable without a canvas and cannot depend on a live DOM". The
   sheet screen brings the canvas; this file keeps the arithmetic and
   the reasons for it, including the measured faults at the top that
   say what the numbers are for.
   ============================================================ */
import { DEFAULT_COL_W, MAX_COL_W } from './helpers'

/** Most of the scroller the frozen name column may take. At 1280 that
 *  is 486px, at 1920 the `MAX_COL_W` ceiling takes over — and on a
 *  520px card on the blueprint it is barely more than the default,
 *  which is right: the card is not the place to read a whole name. */
export const NAME_MAX_SHARE = 0.38

/** A cell's own horizontal cost: `.tb-cell`'s `padding: 0 var(--sp-3)`
 *  twice, its 1px right-hand rule, and a pixel of slack so a name that
 *  measures exactly its box does not ellipsise on a rounding error. */
export const CELL_TEXT_INSET = 12 * 2 + 1 + 1

/** What `.tb-grid-grouped .tb-cell-lead` adds to the FIRST column's
 *  left padding, so the run of leaves reads as belonging to its drawer
 *  (table.css). It is stolen from the same box the value is painted in,
 *  so a level column measured without it is 18px short of what it
 *  needs the moment the register is grouped — which is the state a
 *  levelled register is always in. */
export const LEAD_INDENT_W = 18

/** How many of the longest strings are actually measured. */
const PROBE = 24

/** The widest of `values`, in pixels, measuring only the longest
 *  `probe` of them. Pure — `measure` is injected, so this is testable
 *  without a canvas and cannot depend on a live DOM. */
export function widestOf(
  values: readonly string[],
  measure: (s: string) => number,
  probe: number = PROBE,
): number {
  if (values.length === 0) return 0
  const longest = new Set(
    [...values]
      .filter((v) => v !== '')
      .sort((a, b) => b.length - a.length)
      .slice(0, probe),
  )
  let w = 0
  for (const v of longest) w = Math.max(w, measure(v))
  return w
}

/** The width the name column wants, given the widest name in it and the
 *  scroller it has to freeze inside. Never narrower than the type
 *  default, so no register loses room it had today. */
export function nameColumnWidth(widestText: number, available: number): number {
  const floor = DEFAULT_COL_W.text
  const ceiling = Math.max(floor, Math.min(MAX_COL_W, Math.round(available * NAME_MAX_SHARE)))
  return Math.max(floor, Math.min(ceiling, Math.ceil(widestText + CELL_TEXT_INSET)))
}

/* ============================================================
   AND THE SAME ARGUMENT FOR THE OTHER TWO COLUMNS THAT HOLD A NAME.

   THE FAULT, MEASURED, TWICE.

   A LEVEL COLUMN. Haines Signature groups by `Series`, and every one of
   its nine rows drew "Fisher Series (as at 18.03.2026)" as "Fisher
   Series (as at 18…" — 186px of text in a 141px box, on all three of
   1280, 1440 and 1920, because a level column took
   `DEFAULT_COL_W.text` (184px) and then gave 18px of it back to the
   grouping indent.

   A REFERENCE COLUMN. Every one of the 27 relationship registers is
   made of them, and every one of them clipped: "Highfield × Yamaha —
   Motor Fitment" drew 54 clipped cells at 1280, 56 at 1440 and 64 at
   1920, all of them `Boat` and `Motor` at the 184px default while
   "Highfield - RU230KAM (HYP) WH" wanted 197px. "Stacer × Stacer
   Trailers" drew 73. Those registers are 27 of the 51 cards on Home.

   WHY IT IS THE SAME FIX AND NOT A NEW ONE. All three columns hold a
   NAME the dealer chose, not a figure of a known shape: a level column
   holds the value the register is grouped by ("Roll-Up ▸ RU230KAM"), a
   reference column holds another table's display value — the very
   string this module already measures on that other table. A per-TYPE
   default cannot know that this dealer's names run to forty-four
   characters, which is the argument `nameColumnWidth` was written for.

   AND WHY THE CEILING IS THE SAME CEILING. `NAME_MAX_SHARE` was chosen
   so a frozen column could not eat a 1280px screen. The same number
   does a second job here: `available` is the SCROLLER, which is the
   window on a table page and a 520px card on the blueprint, so one
   rule keeps a page generous (456px at 1280) and a card a card (198px)
   without either needing to know which it is. Anything past the
   ceiling still clips and still says so by ellipsis — a register is
   allowed to be wider than the window (DESIGN_CONTRACT §2) but a
   column is not allowed to be wider than the sheet it is on. `Fit
   columns` still overlays all of this, still says out loud what it
   did, and a drag still wins.
   ============================================================ */

/** The width a level or reference column wants, given the widest value
 *  in it. Never narrower than its own type default, never wider than
 *  the name column's ceiling, and it pays for the grouping indent when
 *  it will be drawn with one. */
export function dataColumnWidth(
  widestText: number,
  floor: number,
  available: number,
  /** the grouping indent, for a column that will be drawn as the lead */
  indent = 0,
): number {
  const ceiling = Math.max(floor, Math.min(MAX_COL_W, Math.round(available * NAME_MAX_SHARE)))
  return Math.max(floor, Math.min(ceiling, Math.ceil(widestText + CELL_TEXT_INSET + indent)))
}
