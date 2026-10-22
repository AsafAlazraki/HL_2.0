/* ============================================================
   WHAT THE REVIEW SCREEN SAYS — its words, off the counts the
   domain made (`src/domain/rules/review/checks.ts`). Nothing here
   counts anything; every figure arrives counted.

   EVERY CHECK HAS TWO SENTENCES: what is wrong while something is,
   and the sentence that is TRUE once nothing is. The clean day is
   the second set, each with its tick, in the same place — board C's
   answer, grafted onto board A (docs/directions/review-boards/).
   ============================================================ */

import { lineSaid, nameFirst } from '@/domain/quote/spoken'
import { money } from '@/domain/money'
import type { Meant, Reband } from '@/domain/rules/review/checks'
import type { PrefValue } from '@/state/prefs'

/** Where what a dealer left as meant is kept: this computer's own prefs. */
export const MEANT_PREF = 'review.meant'

/** The checks, in the order they cost Northside: money first, then a wrong pick, then tidy. */
export type CheckId = 'band' | 'two' | 'none' | 'twins' | 'nameless' | 'tidy'
export const CHECKS: readonly CheckId[] = ['band', 'two', 'none', 'twins', 'nameless', 'tidy']

export const isCheck = (v: unknown): v is CheckId =>
  typeof v === 'string' && (CHECKS as readonly string[]).includes(v)

/** What a check is called while it finds something, and what is true once it finds nothing. */
export const CHECK_WORDS: Record<CheckId, { wrong: string; true: string }> = {
  band: {
    wrong: 'Registered as the wrong size',
    true: 'Every trailer is registered as the size its weight says.',
  },
  two: { wrong: 'One name, two prices', true: 'Every name on sale has one price.' },
  none: { wrong: 'On sale with no price', true: 'Everything on sale has a price.' },
  twins: { wrong: 'Two under one name', true: 'Nothing in a list shares a name with another.' },
  nameless: { wrong: 'Nothing to name it', true: 'Every line on sale has a name.' },
  tidy: { wrong: 'Tidy', true: 'Nothing about the way the price list is laid out.' },
}

/** The meant record, read off a pref that may hold anything. */
export function meantOf(value: PrefValue | undefined): Meant {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value)) if (typeof v === 'string') out[k] = v
  return out
}

/** A count with its noun. */
export const counted = (n: number, one: string, many: string): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? one : many}`

/** the separator `lineSaid` puts between the parts of a name */
const SAID_SEP = ' · '

/** A typed maker in place of a mark: the list's name less its kind ("REDCO / Tinka"). */
export const makerTyped = (tableName: string): string =>
  tableName.replace(/\s+(trailers|outboards|boats)$/i, '')

/**
 * A CATEGORY AS A PERSON READS IT. The price list types its categories in capitals
 * ("LABOUR ESTIMATES", "TILT LIMIT SWITCHES - Yamaha"); a word in capitals is said with its
 * first letter only, and a code with a figure in it ("E163", "27/9/2022") keeps its case.
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

export const kg = (n: number): string => `${n.toLocaleString('en-AU')} kg`

export const signed = (n: number): string => (n > 0 ? `+${money(n)}` : money(n))

/** A list of names as a person reads one: "A, B and C", or "A, B and 4 more". */
export function andMore(names: readonly string[], shown = 2): string {
  if (names.length === 0) return ''
  if (names.length <= shown + 1) {
    if (names.length === 1) return names[0]!
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }
  return `${names.slice(0, shown).join(', ')} and ${names.length - shown} more`
}

/**
 * A trailer as the build says it (`lineSaid`, `nameFirst`), less the maker's word where the
 * maker's own mark already stands beside it: "GFAB Offroad Single Sportski Trailer" under the
 * GFAB mark reads "Offroad Single Sportski Trailer".
 */
export function trailerSaid(line: Reband, marked: boolean): string {
  const whole = nameFirst(lineSaid(line.label, line.tableName), line.code || undefined)
  /* THE SERIES IS THE FAMILY, NOT THE TRAILER: "Alloy Loader Pro Series · ALP 5.3M-13B" is the
     ALP 5.3M-13B, beside its maker's mark and its weight */
  const pieces = whole.split(SAID_SEP)
  const said =
    marked && pieces.length > 1 && /\bseries$/i.test(pieces[0] ?? '')
      ? pieces.slice(1).join(SAID_SEP)
      : whole
  if (!marked) return said
  /* the maker's word is any word of the list's own name: "TINKA" under REDCO / Tinka */
  const makers = new Set(
    line.tableName
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1),
  )
  const words = said.split(' ')
  return words.length > 1 && makers.has(words[0]?.toLowerCase() ?? '')
    ? words.slice(1).join(' ')
    : said
}

/** A band group's one sentence: "7 weigh over 1,020 kg and are registered Small, at $166." */
export function bandGroupSaid(g: {
  way: 'heavier' | 'lighter'
  word: string
  fee: number | null
  boundKg: number
  lines: readonly unknown[]
}): string {
  const n = g.lines.length
  const weigh = n === 1 ? 'weighs' : 'weigh'
  const are = n === 1 ? 'is' : 'are'
  const at = g.fee !== null ? `, at ${money(g.fee)}` : ''
  const lead = n === 1 ? 'One' : String(n)
  return g.way === 'heavier'
    ? `${lead} ${weigh} over ${kg(g.boundKg)} and ${are} registered ${g.word}${at}.`
    : `${lead} ${weigh} ${kg(g.boundKg - 1)} or less and ${are} registered ${g.word}${at}.`
}

/** The labels the bounds were read from, said once: “Up to 1.02t” and “Over 1.021t”. */
export function readFromSaid(readFrom: readonly string[]): string {
  const words = readFrom.map((r) => r.split(' · ')[0] ?? r)
  return andMore(words, 3)
}
