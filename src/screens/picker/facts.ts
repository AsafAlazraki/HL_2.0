/* ============================================================
   A FIGURE SAID WITH ITS NOUN, IN THE BUILD'S OWN WORDS.

   `measured` (src/domain/quote/spoken.ts) has already moved the unit onto
   the figure; what it leaves is the price file's own column words. Until
   2026-11-02 the picker said them its own way ("OA length", "Int length",
   "Max power") while the build said "Length overall", "Inside length" and
   "Maximum power" (the quote round's audit, S5): two names for one
   measure, a press apart. So the strip asks the build's one namer,
   `specsSaid` (src/domain/quote/specSay.ts): the file's shorthand in full,
   a sentence's casing, "hp" and "L" as a person writes them, and the
   horsepower range the file splits over two columns said as one "Power".

   ONE RULE STAYS THE PICKER'S, because the namer does not have it: a
   trailing " in" on a bare figure is the inch it names ("Wheel Size in"
   13 → "Wheel size" 13 in), moved onto the figure before it is said.

   Nothing is invented: every word is the file's or the unit its own
   figure carries. Pure, so it is tested without a screen.
   ============================================================ */
import { specsSaid } from '@/domain/quote/specSay'

const FIGURE = /^[\d.,]+$/

interface Fact {
  label: string
  value: string
}

/** The file's "Wheel Size in" over a bare 13 is 13 inches: the unit moves onto the figure. */
function inchOf(fact: Fact): Fact {
  const label = fact.label.trim()
  const value = fact.value.trim()
  const inch = /^(.*\S)\s+in$/i.exec(label)
  return inch && FIGURE.test(value) ? { label: inch[1]!, value: `${value} in` } : { label, value }
}

/** A strip's figures, labelled and valued as the build says them. */
export function spokenFacts(facts: readonly Fact[]): Fact[] {
  return specsSaid(facts.map(inchOf))
}
