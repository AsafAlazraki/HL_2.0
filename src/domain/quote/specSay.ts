/* ============================================================
   A BOAT'S SPECIFICATION, SAID AS A PERSON SAYS IT (the owner,
   2026-10-30: "for specs, ability to open more of them and design that
   a bit nicer"; the build page's critic, 2026-10-31, P-2: the rows read
   straight off the file — "Min 90 HP", "Max 115 HP", "Shaft Lgth XL",
   "Eng Configuration Remote", "Matrix Highfield Inflatables", "Model
   Code HBS113", "105 ltr", "Hull Weight @ (Dry)").

   WORDS ONLY. No figure is changed and no unit is added: a unit is
   `measured`'s (spoken.ts), which adds one only where the column or its
   maker states it. What is done here is the file's shorthand said in
   full ("Lgth" is "length", "Int" is "inside"), the file's casing put
   in a sentence's, the file's "ltr" and "HP" in the units a person
   writes, and the horsepower range the file splits over two columns
   said as one range — both its figures, as the file has them.

   TWO OF THE FILE'S COLUMNS ARE NOT A BOAT'S SPECIFICATION and never
   reach a customer here: "Matrix" names the price file's own grouping
   ("Highfield Inflatables"), and "Model Code" is the maker's order code
   (the workshop's, which the printed quote's lines carry where a dealer
   needs them).
   ============================================================ */

export interface SpecSaid {
  label: string
  value: string
}

/** The file's columns that describe the price file or an order, not the boat. */
const NOT_THE_BOAT = /^(matrix|model code)$/i

/** The file's shorthand, word by word, in full. Matched on a whole word, any case. */
const SHORTHAND: ReadonlyArray<[RegExp, string]> = [
  [/^int\.?$/i, 'inside'],
  [/^dia\.?$/i, 'diameter'],
  [/^lgth\.?$/i, 'length'],
  [/^eng\.?$/i, 'engine'],
  [/^app\.?$/i, 'approx.'],
  [/^capcity$/i, 'capacity'],
  [/^max\.?$/i, 'maximum'],
  [/^min\.?$/i, 'minimum'],
]

/** A word the file writes in capitals because it is an abbreviation: kept as written. */
const ACRONYM = /^[A-Z]{2,}$|^[A-Z]+\d/

/** A WORD THE FILE SHOUTS: four or more capitals with a vowel among them ("WEIGHT", "DINGHYS"),
 *  which no acronym on this file is — "SDF", "HP", "PVC", "BMT" keep their capitals. */
const shouted = (word: string): boolean => /^[A-Z]{4,}$/.test(word) && /[AEIOU]/.test(word)

/** The file's run-together shorthand, said as two words. */
const RUN_TOGETHER: ReadonlyArray<[RegExp, string]> = [
  [/^bottomsides$/i, 'bottom sides'],
  [/^topsides$/i, 'top sides'],
]

/**
 * A NAME THE FILE WRITES IN CAPITALS, SAID IN A NAME'S CASE: "SEA RANGER SDF (CENTRE CONSOLES)" is
 * "Sea Ranger SDF (Centre Consoles)", "OUTLAW (SIDE CONSOLES)" is "Outlaw (Side Consoles)"
 * (built-m4-2.md: "the series names print as the file shouts them"). Only a name with no lower
 * case in it at all is touched, and in it only the words that are words: three capitals or fewer,
 * or capitals with no vowel ("SDF"), stay as the file wrote them. The letters are the file's; only
 * their case changes, so "Dinghys" keeps the file's spelling.
 */
export function quietCaps(name: string): string {
  if (/[a-z]/.test(name) || !/[A-Z]{4,}/.test(name)) return name
  return name.replace(/[A-Z]+/g, (word) =>
    word.length > 1 && /[AEIOU]/.test(word) ? word.charAt(0) + word.slice(1).toLowerCase() : word,
  )
}

/** One label, in a sentence's casing with its shorthand in full. */
export function specLabel(label: string): string {
  const clean = label
    .replace(/\s*@\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (/^oa length$/i.test(clean)) return 'Length overall'
  const words = clean.split(' ').map((word, at) => {
    const full =
      SHORTHAND.find(([written]) => written.test(word))?.[1] ??
      RUN_TOGETHER.find(([written]) => written.test(word))?.[1]
    if (full !== undefined) return full
    if (shouted(word))
      return at === 0 ? word.charAt(0) + word.slice(1).toLowerCase() : word.toLowerCase()
    if (ACRONYM.test(word)) return word
    /* a bracketed word keeps its brackets: "(Dry)" is "(dry)" */
    return at === 0 ? word : word.toLowerCase()
  })
  const said = words.join(' ')
  return said.charAt(0).toUpperCase() + said.slice(1)
}

/** One value, in the units a person writes: "105 ltr" is "105 L", "90 HP" is "90 hp", and a
 *  figure the file runs into its unit ("4.51m") is set apart from it ("4.51 m"). */
export function specValue(value: string): string {
  return value
    .replace(/(\d)\s*ltrs?\b/gi, '$1 L')
    .replace(/(\d)\s*HP\b/g, '$1 hp')
    .replace(/(\d)(m|cm|mm|kg)\b/g, '$1 $2')
    .trim()
}

/** The figure and the unit after it, where a value is one figure and one unit. */
function figureOf(value: string): { figure: string; unit: string } | null {
  const found = /^(\d+(?:\.\d+)?)\s*([a-z°]*)$/i.exec(value.trim())
  return found ? { figure: found[1]!, unit: found[2]! } : null
}

/**
 * EVERY SPECIFICATION, SAID: the file's order kept, its two columns that are not the boat's left
 * out, and its minimum and maximum horsepower said as one "Power" range where the file gives both
 * in one unit ("90–115 hp"); where it gives only one, that one keeps its own word.
 */
export function specsSaid(specs: readonly { label: string; value: string }[]): SpecSaid[] {
  const kept = specs.filter((spec) => !NOT_THE_BOAT.test(spec.label.trim()))
  const min = kept.find((spec) => /^min(imum)?(\s+(hp|power))?$/i.test(spec.label.trim()))
  const max = kept.find((spec) => /^max(imum)?(\s+(hp|power))?$/i.test(spec.label.trim()))
  const low = min ? figureOf(specValue(min.value)) : null
  const high = max ? figureOf(specValue(max.value)) : null
  const range =
    min && max && low && high && low.unit === high.unit
      ? {
          label: 'Power',
          value: `${low.figure}–${high.figure}${low.unit === '' ? '' : ` ${low.unit}`}`,
        }
      : null
  const out: SpecSaid[] = []
  for (const spec of kept) {
    if (range && spec === max) continue
    if (range && spec === min) {
      out.push(range)
      continue
    }
    const label =
      spec === min ? 'Minimum power' : spec === max ? 'Maximum power' : specLabel(spec.label)
    out.push({ label, value: specValue(spec.value) })
  }
  return out
}
