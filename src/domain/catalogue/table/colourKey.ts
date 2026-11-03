/* ============================================================
   THE COLOUR KEY — what each letter of a colourway code is, and the
   letters nobody has named yet (the sheet's verifier, 2026-11-03: "No
   legend anywhere", and "I-B-C" drew no stripe at all, not even for
   the Black and Carbon it knows).

   WHAT THE FILE NAMES IS READ, NEVER GUESSED. A letter the production
   map names (`colourwayOf`) is said as that map says it. A letter it
   does not name — I, O, R and WH on Highfield, the four
   `colourway.ts` counts and declines to guess — stays unnamed until
   Northside names it, and a name Northside gives is kept on Northside's
   own profile (`OrgProfile.colours`), changed by a command with its
   way back, and said as Northside's wherever it is drawn.

   A BOUNDED CHOICE. A letter is named with one of the colours this app
   can draw (`SWATCH_NAMES`, each a token in tokens.css), so a name
   given is always a stripe drawn — never a word with no paint.

   AND A CODE IS DRAWN PART BY PART. "I-B-C" is an unnamed stripe, then
   Black, then Carbon: the parts the key knows are drawn, and the one it
   does not is drawn as not named, so half a decode never reads as a
   whole one (the rule `colourwayOf` keeps for words) and a known colour
   is never hidden behind an unknown one.

   Pure: no React, no store.
   ============================================================ */

import { colourwayOf } from '@/domain/quote/colourway'
import { SWATCH_NAMES, swatchesOf } from '@/domain/quote/spoken'
import type { OrgProfile } from '@/domain/model'
import { changeOrg, withKey } from '@/domain/catalogue/orgCommands'
import type { CatalogueCommand } from '@/domain/catalogue/commands'

/** "dark-grey" is "Dark Grey": the colour as a person names it, from the token it is drawn in. */
const titled = (swatch: string): string =>
  swatch
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

/** The colours a letter may be named, each one this app can draw. */
export const COLOUR_CHOICES: readonly string[] = SWATCH_NAMES.map(titled)

const swatchOfName = (name: string): string | undefined => {
  const at = COLOUR_CHOICES.indexOf(name)
  return at < 0 ? undefined : SWATCH_NAMES[at]
}

/** A letter of a colourway code: one to three capitals. */
const LETTER = /^[A-Z]{1,3}$/

/** Is this code shaped like a colourway at all — "B-G-B", "WH" — rather than a size ("340")? */
export const looksLikeColourway = (code: string): boolean =>
  code.trim() !== '' &&
  code
    .trim()
    .split('-')
    .every((t) => LETTER.test(t))

export interface StripePart {
  /** the letter as the code carries it */
  token: string
  /** the colour it is, or null where nobody has named it */
  name: string | null
  /** the swatches it draws, one per colour it names; none where it is not named */
  swatches: string[]
  /** who named it: the price file's own map, or Northside */
  by: 'file' | 'northside' | null
}

/** One letter, as the file's map names it, else as Northside named it, else unnamed. */
export function partOf(token: string, named: Readonly<Record<string, string>> = {}): StripePart {
  const read = colourwayOf(token)
  if (read.read) {
    const swatches = swatchesOf(read).flatMap((p) => p.swatches)
    return { token, name: read.parts.join(' / '), swatches, by: 'file' }
  }
  const own = named[token]
  const swatch = own ? swatchOfName(own) : undefined
  if (own && swatch) return { token, name: own, swatches: [swatch], by: 'northside' }
  return { token, name: null, swatches: [], by: null }
}

/**
 * A colourway code drawn part by part, and said: "I-B-C" is an unnamed colour, Black, Carbon.
 * Null where the code is not shaped like a colourway, or where no part of it is named — a code
 * the key knows nothing of draws nothing, as it always has.
 */
export function stripesOf(
  code: string,
  named: Readonly<Record<string, string>> = {},
): { pieces: StripePart[]; say: string } | null {
  const clean = code.trim()
  if (!looksLikeColourway(clean)) return null
  const pieces = clean.split('-').map((t) => partOf(t, named))
  if (pieces.every((p) => p.name === null)) return null
  return {
    pieces,
    say: pieces.map((p) => p.name ?? `${p.token}, not named`).join(' / '),
  }
}

export interface KeyLine extends StripePart {
  /** how many lines of the list carry this letter */
  lines: number
}

/**
 * EVERY LETTER THE LIST'S CODES CARRY, with how many lines carry it: the ones nobody has named
 * first (they are the key's work), then the rest by how many lines carry them.
 */
export function colourKey(
  codes: readonly string[],
  named: Readonly<Record<string, string>> = {},
): KeyLine[] {
  const count = new Map<string, number>()
  for (const code of codes) {
    const clean = code.trim()
    if (!looksLikeColourway(clean)) continue
    for (const t of new Set(clean.split('-'))) count.set(t, (count.get(t) ?? 0) + 1)
  }
  return [...count.entries()]
    .map(([token, lines]) => ({ ...partOf(token, named), lines }))
    .toSorted(
      (a, b) =>
        (a.name === null ? 0 : 1) - (b.name === null ? 0 : 1) ||
        b.lines - a.lines ||
        a.token.localeCompare(b.token),
    )
}

/** The refusal where a name is not one the key can draw. */
export const NOT_A_COLOUR = (name: string): string =>
  `“${name}” is not a colour the key can draw. Choose one of ${COLOUR_CHOICES.join(', ')}.`

/**
 * NORTHSIDE NAMES A LETTER, or takes its name back (\`name\` null): one settings change on
 * Northside's own profile, with its sentence and its way back. A letter the file's own map names
 * is not Northside's to rename.
 */
export function nameColour(token: string, name: string | null): CatalogueCommand {
  const said =
    name === null
      ? `${token} is no longer named on the colour key`
      : `${token} is named ${name} on the colour key`
  return changeOrg(said, 'colours', (org: OrgProfile) => {
    if (!LETTER.test(token)) return `“${token}” is not a letter of a colourway code.`
    if (colourwayOf(token).read)
      return `${token} is named by the Master Price File itself, as ${colourwayOf(token).say}, so it is not renamed here.`
    if (name !== null && !swatchOfName(name)) return NOT_A_COLOUR(name)
    const next = { ...org.colours }
    if (name === null) delete next[token]
    else next[token] = name
    return withKey(org, 'colours', Object.keys(next).length > 0 ? next : undefined)
  })
}
