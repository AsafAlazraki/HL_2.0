/* ============================================================
   THE FILE'S WORDS, SAID AS THE CUSTOMER'S COPY SAYS THEM.

   The printed quote's critic, 2026-10-31: the file's own words printed
   as facts — "Shaft length XL", "Fuel capacity Opt", "Control Remote
   mech", "Trim and tilt Power Trim & Tilt" (the label said twice), a
   part "w" a transducer, a cable "· 2mtr", and a trailer as the file
   codes it, "T Alloy 1100 ATM S 13" Skid Braked · 4.5 - 4.9 m".

   EACH VALUE IS SAID IN FULL, OR LEFT OFF. A shorthand is expanded only
   where it has one meaning on an outboard's or a trailer's sheet ("XL"
   is an extra-long shaft, "mech" is mechanical, "c/w" is complete
   with); a value that is not a fact at all ("Opt", "TBA", "0") is left
   off; and a value this file writes that no rule here reads is left off
   rather than printed as a code. Every value left off is named to the
   dealer, on the note beside the sheet (`paperFacts` returns them). No
   figure changes and no unit is added: a unit is `measured`'s and
   `lineFacts`'s, which add one only where the column states it.

   READ AT THE PAPER, NEVER WRITTEN BACK. The quote keeps the file's
   words as they were frozen; this is how the paper reads them, the way
   `boatTitle` reads a frozen label.

   PURE. No React, no store, no DOM.
   ============================================================ */

export interface PaperFact {
  label: string
  value: string
}

/** A value the file writes where it has no fact: "Opt", "Optional", "TBA", "N/A", a dash, a nought. */
const NOT_A_VALUE = /^(opt\.?|optional|tba|tbc|n\/?a|-|–|—|\?|0)$/i

/** An outboard's shaft, by the letters a price list writes it in. */
const SHAFT: Readonly<Record<string, string>> = {
  S: 'short',
  SS: 'short',
  L: 'long',
  LS: 'long',
  X: 'extra long',
  XL: 'extra long',
  XXL: 'extra extra long',
  U: 'ultra long',
  UL: 'ultra long',
}

const capital = (said: string): string => said.charAt(0).toUpperCase() + said.slice(1)

/** "XL / UL / XL" → "Extra long or ultra long"; "Twin XL" → "Twin extra long"; all or nothing. */
function shaftSaid(value: string): string | null {
  const parts = value.split('/').map((part) => part.trim())
  const said: string[] = []
  for (const part of parts) {
    /* inches, already said by the column ("20 in"), kept as they are */
    if (/^\d+(\.\d+)?\s*in$/.test(part)) {
      said.push(part)
      continue
    }
    const m = /^(?:(twin)\s+|(\d)\s*x\s*)?([A-Z]{1,3})$/i.exec(part)
    const word = m ? SHAFT[m[3].toUpperCase()] : undefined
    if (!m || word === undefined) return null
    said.push(m[1] ? `twin ${word}` : m[2] ? `${m[2]} × ${word}` : word)
  }
  const unique = [...new Set(said)]
  return unique.length === 0 ? null : capital(unique.join(' or '))
}

/** A motor's control, as the file writes it, in words; null where the file's words are a note. */
function controlSaid(value: string): string | null {
  const v = value.trim()
  if (/^tiller( handle)?$/i.test(v)) return 'Tiller handle'
  if (/^remote$/i.test(v)) return 'Remote'
  if (/^remote mech\.?$/i.test(v)) return 'Mechanical remote'
  const mech = /^mech\.? with (.+)$/i.exec(v)
  if (mech) return `Mechanical, with ${mech[1].toLowerCase()}`
  if (/^DEC - Digital Electronic Control$/i.test(v)) return 'Digital electronic'
  const dec = /^DEC with (.+)$/i.exec(v)
  if (dec) return `Digital electronic, with ${dec[1].toLowerCase()}`
  return null
}

/** "Power Trim & Tilt" under "Trim and tilt" is "Power": the label is not said twice. */
function trimSaid(value: string): string | null {
  const v = value.trim()
  if (/^manual$/i.test(v)) return 'Manual'
  if (/^power trim\s*(&|and)\s*tilt$/i.test(v)) return 'Power'
  if (/^power tilt$/i.test(v)) return 'Power tilt'
  if (/^totaltilt$/i.test(v)) return 'TotalTilt'
  return null
}

function startingSaid(value: string): string | null {
  const v = value.trim()
  if (/^manual( \(e-kit op\))?$/i.test(v)) return 'Manual'
  if (/^electric$/i.test(v)) return 'Electric'
  if (/^manual\s*(&|and)\s*electric$/i.test(v)) return 'Manual and electric'
  return null
}

const figure = (raw: string): string => Number(raw.replace(/,/g, '')).toLocaleString('en-AU')

/** "L4 / 1832cc" → "In-line 4, 1,832 cc"; "V6 / 4169cc" → "V6, 4,169 cc"; "2cyl / 212cc" →
 *  "2 cylinders, 212 cc"; "5,559 cc" → "5,559 cc". */
function engineSaid(value: string): string | null {
  const v = value.trim()
  const cc = /^([\d,]+)\s*cc$/i.exec(v)
  if (cc) return `${figure(cc[1])} cc`
  const m = /^(?:(L|V)(\d+)|(\d+)\s*cyl)\s*\/\s*([\d,]+)\s*cc$/i.exec(v)
  if (!m) return null
  const size = `${figure(m[4])} cc`
  if (m[1]) return `${m[1].toUpperCase() === 'L' ? 'In-line ' : 'V'}${m[2]}, ${size}`
  const n = Number(m[3])
  return `${n} ${n === 1 ? 'cylinder' : 'cylinders'}, ${size}`
}

/**
 * ONE FACT AS THE PAPER PRINTS IT, or null where it is left off. The label is the one already
 * said (`specsSaid`, `lineFacts`); the value is said in full where the file writes it short.
 */
export function factOnPaper(label: string, value: string): PaperFact | null {
  const v = value.trim()
  if (v === '' || NOT_A_VALUE.test(v)) return null
  if (/shaft/i.test(label)) {
    const said = shaftSaid(v)
    return said === null ? null : { label, value: said }
  }
  if (/^control$/i.test(label)) {
    const said = controlSaid(v)
    return said === null ? null : { label, value: said }
  }
  if (/trim|tilt/i.test(label)) {
    const said = trimSaid(v)
    return said === null ? null : { label, value: said }
  }
  if (/^starting$/i.test(label)) {
    const said = startingSaid(v)
    return said === null ? null : { label, value: said }
  }
  if (/^engine$/i.test(label)) {
    const said = engineSaid(v)
    return said === null ? null : { label, value: said }
  }
  return { label, value: v }
}

/** Every fact as the paper prints it, and the ones it leaves off, for the dealer's note. */
export function paperFacts(facts: readonly { label: string; value: string }[]): {
  printed: PaperFact[]
  left: PaperFact[]
} {
  const printed: PaperFact[] = []
  const left: PaperFact[] = []
  for (const fact of facts) {
    const said = factOnPaper(fact.label, fact.value)
    if (said === null) left.push({ label: fact.label, value: fact.value })
    else printed.push(said)
  }
  return { printed, left }
}

/**
 * A PART'S NAME WITH THE FILE'S SHORTHAND SAID IN FULL: "c/w" is "complete with", a lone "w" or
 * "w/" is "with", "2mtr" is "2 m", "105ltr" is "105 L". Codes inside a name ("GT20-TM") are the
 * product's public name and are kept.
 */
export function nameOnPaper(said: string): string {
  return said
    .replace(/\bc\/w\b/gi, 'complete with')
    .replace(/(^|\s)w\/(?=\s|$)/g, '$1with')
    .replace(/(^|\s)w(?=\s)/g, '$1with')
    .replace(/(\d)\s*mtrs?\b/gi, '$1 m')
    .replace(/(\d)\s*ltrs?\b/gi, '$1 L')
}

/** A boat-length span as the file writes it — "4.5 - 4.9 m", "4.1m - 4.5m", "3.5 - 4 m". */
const SPAN = /^(\d+(?:\.\d+)?)\s*m?\s*[-–]\s*(\d+(?:\.\d+)?)\s*m$/i

/** "Skid Braked" → "skid, braked": plain words only, else the file's own words kept. */
const restSaid = (rest: string): string =>
  /^[A-Za-z]+(\s+[A-Za-z]+)*$/.test(rest) ? rest.toLowerCase().split(/\s+/).join(', ') : rest

/**
 * A TRAILER AS A PERSON SAYS IT, where the price file codes it: "T Alloy 1100 ATM S 13" Skid
 * Braked · 4.5 - 4.9 m" is the T Alloy 1100, single axle, skid, braked — its rating, its wheels
 * and the boats it carries are its facts, printed under it. The boat-length span is dropped only
 * where the line carries it as a fact; elsewhere it is said with a true dash. A name in no shape
 * this reads is the file's own, as frozen.
 */
export function trailerOnPaper(said: string, sizeIsAFact: boolean): string {
  const parts = said.split(' · ')
  const kept: string[] = []
  for (const part of parts) {
    const span = SPAN.exec(part.trim())
    if (span) {
      if (!sizeIsAFact) kept.push(`for boats of ${span[1]}–${span[2]} m`)
      continue
    }
    /* "<series> <rating> ATM <S|T> <wheel>" <rest> [- <span>]" */
    const m =
      /^(.+?)\s+([\d,]+)\s+ATM\s+(S|T)\s+(\d+)"\s*(.*?)\s*(?:-\s*(\d+(?:\.\d+)?\s*m?\s*[-–]\s*\d+(?:\.\d+)?\s*m))?\s*$/.exec(
        part.trim(),
      )
    if (!m) {
      kept.push(part)
      continue
    }
    const bits = [`${m[1]} ${m[2]}`, m[3] === 'S' ? 'single axle' : 'tandem axle']
    if (m[5]) bits.push(restSaid(m[5]))
    kept.push(bits.join(', '))
    if (m[6] && !sizeIsAFact) {
      const tail = SPAN.exec(m[6])
      if (tail) kept.push(`for boats of ${tail[1]}–${tail[2]} m`)
    }
  }
  return kept.join(' · ')
}
