import {
  AngleIcon,
  ArrowLineDownIcon,
  ArrowsLeftRightIcon,
  BedIcon,
  DropIcon,
  EngineIcon,
  GasPumpIcon,
  RulerIcon,
  ScalesIcon,
  StackSimpleIcon,
  UsersIcon,
  WindIcon,
} from '@phosphor-icons/react'
import type { Glyph } from '@/ui'

/* ============================================================
   THE PICKER'S GLYPHS FOR WHAT A FIGURE MEASURES (the component kit,
   2026-09-28).

   A FIGURE'S GLYPH IS READ OFF ITS OWN LABEL, the label the price
   file gives the column (`tileFacts` chooses the columns by measuring
   the sheet, so no column name lives here either): a ruler beside a
   length, a pair of arrows beside a beam, scales beside a weight. It
   is a question about the WORDS, asked in the order a label's words
   are specific — "Max Main Motor Weight" is a weight before it is a
   motor, "Int. Beam" a beam before a length.

   A LABEL THIS DOES NOT KNOW HAS NO GLYPH, and then no figure in its
   strip has one (`stripGlyphs`): three facts with glyphs and one
   without read as a strip with a hole in it, and a stand-in glyph
   beside a word it does not depict is decoration, which the kit
   refuses.
   ============================================================ */

const BY_WORDS: readonly [RegExp, Glyph][] = [
  [/weight|displacement|load/i, ScalesIcon],
  [/thickness|sheets?\b|sides\b|bottomsides|topsides|transom/i, StackSimpleIcon],
  [/dead\s?rise/i, AngleIcon],
  [/\bhp\b|power/i, EngineIcon],
  [/fuel/i, GasPumpIcon],
  [/ballast|water/i, DropIcon],
  [/beam|width/i, ArrowsLeftRightIcon],
  [/draft/i, ArrowLineDownIcon],
  [/length|\bloa\b/i, RulerIcon],
  [/berths?|cabins?/i, BedIcon],
  [/persons?|people|passengers?/i, UsersIcon],
  [/air chambers?/i, WindIcon],
]

/** The glyph for one figure's label, or null where the label names nothing drawn here. */
export function factGlyph(label: string): Glyph | null {
  for (const [words, glyph] of BY_WORDS) if (words.test(label)) return glyph
  return null
}

/** A glyph for every label of a strip, or for none of them. */
export function stripGlyphs(labels: readonly string[]): (Glyph | null)[] {
  const glyphs = labels.map(factGlyph)
  return glyphs.every((g) => g !== null) ? glyphs : labels.map(() => null)
}
