import {
  AngleIcon,
  ArrowLineDownIcon,
  ArrowsLeftRightIcon,
  BedIcon,
  DropIcon,
  EngineIcon,
  GasPumpIcon,
  HandshakeIcon,
  MoneyIcon,
  RulerIcon,
  ScalesIcon,
  StackSimpleIcon,
  UsersIcon,
  WindIcon,
} from '@phosphor-icons/react'
import type { Glyph } from '@/ui'

/* ============================================================
   THE BUILD'S GLYPHS (the component kit, 2026-09-28).

   A SPECIFICATION'S GLYPH IS READ OFF ITS OWN LABEL, the words the
   quote froze with the boat ("Hull Length", "Beam", "Power"): a ruler
   beside a length, scales beside a weight. Asked in the order a
   label's words are specific, so "Hull Weight (Dry)" is a weight
   before it is a hull. A label this does not know has no glyph, and
   then no specification in the strip has one — a strip with holes in
   it, or a glyph beside a word it does not depict, is decoration.

   The picker reads its fact strip the same way from its own folder
   (src/screens/picker/glyphs.ts); a screen's folder is its own, and
   the two strips are two drawings, so neither imports the other's.
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

const specGlyph = (label: string): Glyph | null => {
  for (const [words, glyph] of BY_WORDS) if (words.test(label)) return glyph
  return null
}

/** A glyph for every specification of a strip, or for none of them. */
export function specGlyphs(labels: readonly string[]): (Glyph | null)[] {
  const glyphs = labels.map(specGlyph)
  return glyphs.every((g) => g !== null) ? glyphs : labels.map(() => null)
}

/**
 * A PRICE LEVEL'S GLYPH, by the level's own key — the kit's own pairing
 * (src/screens/kit/Kit.tsx): money for Cash, a handshake for Trade. A
 * level this does not know keeps the money, since every level is a price.
 */
export const levelGlyph = (key: string): Glyph => (key === 'trade' ? HandshakeIcon : MoneyIcon)

export { boatTravel } from '@/screens/picker/travel'
