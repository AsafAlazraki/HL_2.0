/* ============================================================
   A FIGURE SAID WITH ITS NOUN (the owner, 2026-10-30: "Max power 90 hp",
   not "MAX 90 HP").

   `measured` (src/domain/quote/spoken.ts) has already moved the unit onto
   the figure; what it leaves is the price file's own column words, and
   two of them are not nouns at all: Formosa's and Stacer's "Min" and
   "Max" are the motor's power, which the figure's own "HP" says. So:

     · "Min" / "Max" over a figure in horsepower is "Min power" / "Max
       power", and the unit is set as a unit is written, "hp";
     · a label the file wrote in capitals ("WEIGHT") is set in sentence
       case, and every label is: the strip no longer shouts its words,
       so a short capital run the file means as letters (OA, ATM) stays;
     · the file's "@" before a bracket ("Hull Weight @ (Dry)") is
       dropped, and a trailing " in" on a bare figure is the inch it
       names ("Wheel Size in" 13 → "Wheel size" 13 in).

   Nothing is invented: every word is the file's or the unit its own
   figure carries. Pure, so it is tested without a screen.
   ============================================================ */

const POWER = /^(min|max)\.?$/i
const HP = /^([\d.,]+)\s*hp$/i
const FIGURE = /^[\d.,]+$/

/** One word as a sentence sets it after its first: lower-cased, unless the file means it as
 *  letters — a capital run of two or three (OA, ATM, HP) that is not an ordinary word. */
function inSentence(word: string, first: boolean): string {
  if (/^[A-Z]{2,3}$/.test(word)) return word
  const lower = word.toLowerCase()
  return first ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower
}

/** A figure's label and value as a person says them. */
export function spokenFact(fact: { label: string; value: string }): {
  label: string
  value: string
} {
  let label = fact.label.replace(/\s*@\s*/g, ' ').trim()
  let value = fact.value.trim()

  const hp = HP.exec(value)
  if (hp) value = `${hp[1]} hp`
  if (POWER.test(label) && hp) label = `${label.replace('.', '')} power`

  const inch = /^(.*\S)\s+in$/i.exec(label)
  if (inch && FIGURE.test(value)) {
    label = inch[1]
    value = `${value} in`
  }

  label = label
    .split(/\s+/)
    .map((word, i) => inSentence(word, i === 0))
    .join(' ')
  return { label, value }
}
