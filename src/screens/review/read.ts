/* ============================================================
   WHAT THE REVIEW SCREEN SAYS — its words, off the counts and the
   cases the domain made (`src/domain/rules/review/checks.ts`,
   `cases.ts`). Nothing here counts anything; every figure arrives
   counted, and every sentence is built from what the file says.

   EVERY CASE IS SAID AS ITS FIX (direction E, judged 2026-10-28,
   after Dependabot's "Upgrade addressable to fix 1 alert"): the
   title is what the press does, the lede is why, in the file's own
   figures, and what does not move is said before the press, as
   Apple's storage panel says what is kept.
   ============================================================ */

import { lineSaid, nameFirst } from '@/domain/quote/spoken'
import { money } from '@/domain/money'
import type { Meant, Reband } from '@/domain/rules/review/checks'
import type { Case, CaseKind } from '@/domain/rules/review/cases'
import type { PrefValue } from '@/state/prefs'

/** Where what a dealer left alone is kept: this computer's own prefs (Data counts it too). */
export const MEANT_PREF = 'review.meant'

/** The two reasons a case is left alone (Dependabot asks why; two are enough here). */
export type LeftAs = 'meant' | 'wrong'

/** The meant record, read off a pref that may hold anything. */
export function meantOf(value: PrefValue | undefined): Meant {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value)) if (typeof v === 'string') out[k] = v
  return out
}

/** The address's word for the case after the queue: the tidy suggestions. */
export const TIDY = 'tidy'

/** What each check is called while it finds something, the rail's chip, and what is true once
 *  it finds nothing — the clean day says the second, each with its tick, in the same order. */
export const CHECK_WORDS: Record<CaseKind, { wrong: string; chip: string; true: string }> = {
  band: {
    wrong: 'Registered as the wrong size',
    chip: 'Wrong size',
    true: 'Every trailer is registered as the size its weight says.',
  },
  two: {
    wrong: 'One name, two prices',
    chip: 'Two prices',
    true: 'Every name on sale has one price.',
  },
  none: {
    wrong: 'On sale with no price',
    chip: 'No price',
    true: 'Everything on sale has a price.',
  },
  twins: {
    wrong: 'Two under one name',
    chip: 'Two under one name',
    true: 'Nothing in a list shares a name with another.',
  },
  nameless: {
    wrong: 'Nothing to name it',
    chip: 'Nothing to name it',
    true: 'Every line on sale has a name.',
  },
}

/** A count with its noun. */
export const counted = (n: number, one: string, many: string): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? one : many}`

export const kg = (n: number): string => `${n.toLocaleString('en-AU')} kg`

export const signed = (n: number): string => (n > 0 ? `+${money(n)}` : `−${money(-n)}`)

/** A list of names as a person reads one: "A, B and C", or "A, B and 4 more". */
export function andMore(names: readonly string[], shown = 2): string {
  if (names.length === 0) return ''
  if (names.length <= shown + 1) {
    if (names.length === 1) return names[0]!
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }
  return `${names.slice(0, shown).join(', ')} and ${names.length - shown} more`
}

/** "Sell", "Sell or Sell inc Install (if appl.)", "Cash, Trade or Warranty". */
export function joined(words: readonly string[], last: 'or' | 'and'): string {
  if (words.length <= 1) return words[0] ?? ''
  return `${words.slice(0, -1).join(', ')} ${last} ${words[words.length - 1]}`
}

/** A typed maker in place of a mark: the list's name less its kind ("REDCO / Tinka"). */
export const makerTyped = (tableName: string): string =>
  tableName.replace(/\s+(trailers|outboards|boats)$/i, '')

/**
 * A CATEGORY AS A PERSON READS IT. The price list types its categories in capitals
 * ("ANCHOR WINCHES - Lone Star"); a word in capitals is said with its first letter only, and a
 * code with a figure in it ("E163") keeps its case.
 */
export const spokenCategory = (category: string): string =>
  category
    .split(' ')
    .map((w) =>
      w.length > 2 && w === w.toUpperCase() && !/[0-9]/.test(w)
        ? w.charAt(0) + w.slice(1).toLowerCase()
        : w,
    )
    .join(' ')

/** the separator `lineSaid` puts between the parts of a name */
const SAID_SEP = ' · '

/**
 * A trailer as the build says it, less its series and the maker's word where the maker's mark
 * stands beside it: "DUNBIER Alloy Loader Pro Series – ALP 5.3M-13B …" under Dunbier's mark is
 * the ALP 5.3M-13B.
 */
export function trailerSaid(line: TrailerLine): string {
  const whole = nameFirst(lineSaid(line.label, line.tableName), line.code || undefined)
  const pieces = whole.split(SAID_SEP)
  const said =
    pieces.length > 1 && /\bseries$/i.test(pieces[0] ?? '') ? pieces.slice(1).join(SAID_SEP) : whole
  const words = said.split(' ')
  return words.length > 1 && makersOf(line.tableName).has(words[0]?.toLowerCase() ?? '')
    ? words.slice(1).join(' ')
    : said
}

/** What a trailer namer reads off a line: its name in the file, its list and its code. */
type TrailerLine = Pick<Reband, 'label' | 'tableName' | 'code'>

/** The words of a list's own name, lower-cased: "Dunbier Trailers" is dunbier and trailers. */
const makersOf = (tableName: string): Set<string> =>
  new Set(
    tableName
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1),
  )

/**
 * THE SERIES A TRAILER IS SOLD IN, as a person reads it beside the maker's mark: the file's
 * "DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B …" under Dunbier's mark is the Alloy Loader
 * Pro Series (built-critique-m3-2.md, M13: the stage's eyebrow printed the line's codes, "9304 +
 * 9083L", and its table the file's whole string). The maker's own word is left to the mark, and
 * a word the file types in capitals is said with its first letter only. '' where the name does
 * not lead with a series.
 */
export function trailerSeries(line: TrailerLine): string {
  const pieces = nameFirst(lineSaid(line.label, line.tableName), line.code || undefined).split(
    SAID_SEP,
  )
  const first = pieces[0] ?? ''
  if (pieces.length < 2 || !/\bseries$/i.test(first)) return ''
  const words = spokenCategory(first).split(' ')
  return (
    makersOf(line.tableName).has(words[0]?.toLowerCase() ?? '') ? words.slice(1) : words
  ).join(' ')
}

/**
 * A COLUMN'S NAME AS A HEADING, without the unit the file writes after it in brackets: "ATM (KG)"
 * is ATM and "Rego ($)" is Rego (built-critique-m3-2.md, M13). The unit is said with the figure
 * instead, "1,450 kg" and "$166", so it is said once.
 */
export const heading = (name: string): string =>
  name.replace(/\s*\((?:kgs?|\$|%|mm|m|hp|ltr)\)\s*$/i, '').trim() || name

/**
 * WHERE A SIZE IS READ FROM, as the dealer reads it: the fee list's own label alone ("“Up to
 * 1.02t”"), without the workbook's cell address ("Registration Costs!C16") the band record keeps
 * beside it. null where the record holds no quoted label.
 */
export function labelRead(readFrom: string): string | null {
  const label = readFrom.split(' · ')[0]?.trim() ?? ''
  return /^“.+”$/.test(label) ? label : null
}

/** A name in a list as the build says it: "MACKAY PU Series Trailer - PU5000-14-M". */
export const nameSaid = (name: string, tableName: string): string => lineSaid(name, tableName)

/** What a list's lines are, in a title: "boats", "trailers", or "lines". */
const nounOf = (tableKind: string | undefined, n: number): string =>
  tableKind === 'boat'
    ? n === 1
      ? 'boat'
      : 'boats'
    : tableKind === 'trailer'
      ? n === 1
        ? 'trailer'
        : 'trailers'
      : n === 1
        ? 'line'
        : 'lines'

/**
 * THE CASE'S TITLE: the fix, said as the press does it. A wrong size names the size; a name at
 * two prices asks for one price; lines with no price are priced, or — at $0, where $0 may be
 * meant — priced or left; two under one name, and nothing to name it, are named.
 */
export function titleOf(c: Case, tableKind?: string): string {
  switch (c.kind) {
    case 'band': {
      /* the model, as a dealer says it in a sentence: "ALP 5.3M-13B", without its rating in
         brackets or the word "Trailer" the sentence already ends on */
      const name = trailerSaid(c.line)
        .replace(/\s*\(.*$/, '')
        .replace(/\s+trailer$/i, '')
      return c.line.to
        ? `Rego the ${name} as a ${c.line.to.word} trailer.`
        : `Choose the rego type for the ${name}.`
    }
    case 'two':
      return `Choose one price for the ${trailerSaid({ label: c.item.name, tableName: c.tableName, code: '' })}.`
    case 'none': {
      const g = c.group
      const n = g.lines.length
      const what =
        n === 1
          ? nameSaid(g.lines[0]?.name ?? '', g.tableName)
          : g.category
            ? `the ${n} lines in ${spokenCategory(g.category)}`
            : `the ${n} ${g.tableName} ${nounOf(tableKind, n)}`
      return g.kind === 'zero'
        ? `Price ${what}, or leave ${n === 1 ? 'it' : 'them'} at $0.`
        : `Give ${what} a price.`
    }
    case 'twins':
      return `Give one of the two called “${c.twin.name}” a name of its own.`
    case 'nameless': {
      const n = c.group.items.length
      const field = c.group.items[0]?.nameField.name ?? ''
      return n === 1
        ? `Name the line in ${c.group.tableName} that has no ${field}.`
        : `Name the ${n} lines in ${c.group.tableName} that have no ${field}.`
    }
  }
}

/** THE CASE'S LEDE: why, in the file's own figures. */
export function ledeOf(c: Case): string {
  switch (c.kind) {
    case 'band': {
      const l = c.line
      const size =
        l.way === 'heavier'
          ? `a size the fee list’s own label stops at ${kg(l.boundKg)}`
          : `a size the fee list’s own label starts at ${kg(l.boundKg)}`
      const cost = !l.to
        ? ''
        : l.to.delta > 0
          ? ` Every one sold is charged ${money(l.to.delta)} too little.`
          : l.to.delta < 0
            ? ` Every one sold is charged ${money(-l.to.delta)} too much.`
            : ''
      return `It is rated ${kg(l.atmKg)} and registered ${l.word}, ${size}.${cost}`
    }
    case 'two': {
      const n = c.item.lines.length
      return `${n === 2 ? 'Two' : n} lines in ${c.tableName} carry this name, at ${money(c.item.low)} and ${money(c.item.high)} ${c.priceName}. A salesperson who finds it by name could quote either.`
    }
    case 'none': {
      const g = c.group
      const one = g.lines.length === 1
      return g.kind === 'zero'
        ? `${one ? 'It is' : 'They are'} on sale at $0 at ${joined(g.priceNames, 'and')}. If ${one ? 'it comes' : 'they come'} with something else, $0 is meant; if not, type ${one ? 'its' : 'each one’s'} price.`
        : `${one ? 'It is' : 'They are'} on sale with no price at ${joined(g.priceNames, 'or')}, so a quote with ${one ? 'it' : 'one'} on it is $0.`
    }
    case 'twins':
      return `${c.twin.tableName} has two called “${c.twin.name}”, so anything that reads “${c.twin.name}” could read either.`
    case 'nameless': {
      const one = c.group.items.length === 1
      const field = c.group.items[0]?.nameField.name ?? ''
      return `${one ? 'It is' : 'They are'} on sale with nothing in ${field}, so a salesperson sees a blank line where ${one ? 'its' : 'each'} name should be.`
    }
  }
}

/** When a case left alone comes back on its own: said beside the two reasons, before the press. */
export function comesBackOf(c: Case): string {
  switch (c.kind) {
    case 'band':
      return 'it comes back if its weight or its size changes.'
    case 'two':
      return 'it comes back if either price changes.'
    case 'none':
      return c.group.kind === 'zero'
        ? `${c.group.lines.length === 1 ? 'it comes' : 'each comes'} back if its $0 is cleared.`
        : `${c.group.lines.length === 1 ? 'it comes' : 'each comes'} back if it is given $0.`
    case 'twins':
    case 'nameless':
      return 'nothing in the price list changes.'
  }
}

/** How a case is said in the queue under the stage: its title, and its money where it has some. */
export function peekOf(c: Case, tableKind?: string): { title: string; money: string } {
  const delta = c.kind === 'band' ? (c.line.to?.delta ?? 0) : 0
  return { title: titleOf(c, tableKind), money: delta === 0 ? '' : signed(delta) }
}

/** What leaving it as meant writes, said in the toast. */
export function leftSaid(c: Case, as: LeftAs): string {
  const n =
    c.kind === 'none' ? c.group.lines.length : c.kind === 'nameless' ? c.group.items.length : 1
  const what = n === 1 ? 'It is' : `All ${n} are`
  return as === 'meant' ? `${what} left as meant.` : `${what} left, as a place the check is wrong.`
}

/**
 * ONE NEIGHBOUR, SAID ONCE (built-critique-m3-2.md, minor): the nine Formosa lines with no price
 * all sit beside the same priced line, and "Beside it: Formosa SRT 675 Enc · Half Cabin · Cash
 * $79,760" was said nine times. When every line of a case has the same priced line beside it,
 * that line is said once over them; null when there is one line, or when they differ.
 */
export function besideOnce<B extends { rowId: string }>(
  lines: ReadonlyArray<{ beside: B | null }>,
): B | null {
  const first = lines[0]?.beside
  if (lines.length < 2 || !first) return null
  return lines.every((l) => l.beside?.rowId === first.rowId) ? first : null
}

/**
 * A MODEL CODE IS NEVER BROKEN AT ITS HYPHEN (built-critique-m3-2.md, minor): at 390 the
 * headline wrapped "ALP 5.3M-13B" as "ALP 5.3M-" over "13B". A word joined by a hyphen between
 * two letters or figures, up to 20 characters, is handed back as one run to keep whole; every
 * other run may wrap where it likes.
 */
export function wholeRuns(text: string): Array<{ at: number; text: string; whole: boolean }> {
  const out: Array<{ at: number; text: string; whole: boolean }> = []
  let at = 0
  for (const m of text.matchAll(/[^\s]*[A-Za-z0-9]-[A-Za-z0-9][^\s]*/g)) {
    if (m[0].length > 20) continue
    if (m.index > at) out.push({ at, text: text.slice(at, m.index), whole: false })
    out.push({ at: m.index, text: m[0], whole: true })
    at = m.index + m[0].length
  }
  if (at < text.length) out.push({ at, text: text.slice(at), whole: false })
  return out
}
