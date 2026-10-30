/* ============================================================
   THE LETTERHEAD — what Northside's quote prints at its head, worked
   from what /manage holds, and the copy a quote keeps when it is given.

   A DRAFT PRINTS THE LETTERHEAD AS IT STANDS TODAY; A GIVEN QUOTE PRINTS
   THE ONE IT WAS GIVEN WITH. `freezeLetterhead` is called by the give
   and by nothing else, exactly as `freeze.ts` copies a price onto a line:
   the ABN corrected tomorrow never rewrites the quote handed over today.
   ============================================================ */

import type {
  FrozenLetterhead,
  FrozenPreparer,
  OrgPerson,
  OrgProfile,
  QuoteDef,
} from '@/domain/model'
import { localDay } from '@/domain/quote/day'
import { DESIGNED_ACCENT, parseHex, readBrand } from './colour'

/** A mark the letterhead may print: dark ink, by address and held size. */
export interface PaperMark {
  src: string
  width: number
  height: number
}

const said = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? ''
  return text === '' ? undefined : text
}

/**
 * THE LETTERHEAD AS IT STANDS. `org` is what /manage keeps (absent before anything is set);
 * `fileName` is what the price list calls the business; `heldMark` is Northside's own dark mark
 * where the app carries one. Northside's own dark file wins over the held one; a light file is
 * never printed on paper. The legal name is printed only where it differs from the trading name.
 */
export function letterheadOf(
  org: OrgProfile | null | undefined,
  fileName: string | null,
  heldMark: PaperMark | null,
): FrozenLetterhead | null {
  const name = said(org?.name) ?? said(fileName ?? undefined)
  if (!name) return null
  const own = org?.marks?.paper
  const mark =
    own && own.ink === 'dark'
      ? { src: own.src, width: own.width, height: own.height }
      : (heldMark ?? undefined)
  const legal = said(org?.legalName)
  const out: FrozenLetterhead = { name }
  if (legal && legal.toLowerCase() !== name.toLowerCase()) out.legalName = legal
  for (const key of ['abn', 'address', 'phone', 'email', 'website', 'deposit'] as const) {
    const value = said(org?.[key])
    if (value) out[key] = value
  }
  if (mark) out.mark = mark
  if (org?.validDays !== undefined) out.validDays = org.validDays
  out.accent = accentOf(org)
  return out
}

/**
 * THE COLOUR THE PAPER PRINTS IN, AS IT STANDS: Northside's kept brand colour where it is one
 * the app would wear (the same floor `propertiesOf` writes it under), else the designed blue.
 * Copied onto the quote by the give with the rest of the letterhead.
 */
export function accentOf(org: OrgProfile | null | undefined): string {
  const hex = org?.look?.brand ? parseHex(org.look.brand) : null
  return hex && readBrand(hex).refused === null ? hex : DESIGNED_ACCENT
}

/**
 * THE COLOUR A QUOTE'S PAPER IS PINNED TO, or null where it wears today's. A draft wears today's,
 * as it prints today's letterhead. A given quote prints the colour it was given in; one given
 * before the colour was frozen (every quote given before Settings had a colour) was given in the
 * designed blue, and is pinned to it so that no later colour reaches it.
 */
export function accentOnQuote(quote: Pick<QuoteDef, 'state' | 'letterhead'>): string | null {
  if (quote.state === 'draft') return null
  const frozen = quote.letterhead?.accent ? parseHex(quote.letterhead.accent) : null
  return frozen ?? DESIGNED_ACCENT
}

/** The day a quote stands until: the local day it was given, plus its days. `YYYY-MM-DD`. */
export function validUntil(givenAt: string, days: number): string {
  const [y, m, d] = localDay(givenAt).split('-').map(Number) as [number, number, number]
  const at = new Date(Date.UTC(y, m - 1, d + days))
  return at.toISOString().slice(0, 10)
}

/** The letterhead a quote keeps, worked at the moment it is given. */
export function freezeLetterhead(letterhead: FrozenLetterhead, givenAt: string): FrozenLetterhead {
  const kept: FrozenLetterhead = { ...letterhead }
  if (letterhead.mark) kept.mark = { ...letterhead.mark }
  if (letterhead.validDays !== undefined)
    kept.validUntil = validUntil(givenAt, letterhead.validDays)
  return kept
}

/** The person on /manage who carries this name, matched as a person would say it. */
export function personNamed(
  people: readonly OrgPerson[] | undefined,
  name: string | null | undefined,
): OrgPerson | undefined {
  const asked = name?.trim().toLowerCase() ?? ''
  if (asked === '') return undefined
  return (people ?? []).find((p) => p.name.trim().toLowerCase() === asked)
}

/** Who prepared it, as the quote keeps it: the person by name, or the name alone. */
export function preparerOf(
  people: readonly OrgPerson[] | undefined,
  name: string | null | undefined,
): FrozenPreparer | undefined {
  const clean = name?.trim() ?? ''
  if (clean === '') return undefined
  const person = personNamed(people, clean)
  const out: FrozenPreparer = { name: person?.name.trim() ?? clean }
  for (const key of ['title', 'phone', 'email'] as const) {
    const value = said(person?.[key])
    if (value) out[key] = value
  }
  return out
}

/** What a quote prints at its head: what it was given with, or today's for a draft. */
export function letterheadOnQuote(
  quote: Pick<QuoteDef, 'state' | 'letterhead'>,
  today: FrozenLetterhead | null,
): FrozenLetterhead | null {
  if (quote.letterhead) return quote.letterhead
  return quote.state === 'draft' ? today : null
}

/** The contact line under the mark, in the order a letterhead prints it. */
export function contactLine(letterhead: FrozenLetterhead): string[] {
  return [
    letterhead.legalName,
    letterhead.abn ? `ABN ${letterhead.abn}` : undefined,
    letterhead.address?.replace(/\s*\n\s*/g, ', '),
    letterhead.phone,
    letterhead.email,
    letterhead.website,
  ].filter((v): v is string => v !== undefined && v !== '')
}
