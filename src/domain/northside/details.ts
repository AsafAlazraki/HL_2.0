/* ============================================================
   NORTHSIDE'S DETAILS — what each line is, what it prints, and why a
   typed value is refused, in one sentence each.

   NOTHING IS WRITTEN FOR NORTHSIDE. Every line starts empty and an empty
   line prints nothing (quote-spec.md §4). docs/DECISIONS.md records no
   yes to offering the original HelmLogic's address and phone, so none is
   offered. What IS checked is only what can be measured: an ABN's eleven
   digits and their checksum, an email's shape, a rate and a number of
   days inside what they can mean.
   ============================================================ */

import type { OrgProfile } from '@/domain/model'

/** The lines the letterhead prints, in the order it prints them. */
export const LETTERHEAD_KEYS = [
  'name',
  'legalName',
  'abn',
  'address',
  'phone',
  'email',
  'website',
] as const
export type LetterheadKey = (typeof LETTERHEAD_KEYS)[number]

/** The lines every quote says that are not in the letterhead. */
export const QUOTE_KEYS = ['gstRate', 'validDays', 'deposit', 'quoteTerms'] as const
export type QuoteKey = (typeof QUOTE_KEYS)[number]

export type DetailKey = LetterheadKey | QuoteKey

export interface DetailLine {
  key: DetailKey
  /** what the line is called where it is set */
  label: string
  /** what an empty line prints, in the dealer's words */
  empty: string
  /** typed as a paragraph rather than one line */
  long?: boolean
  /** the keyboard a phone offers */
  mode?: 'text' | 'tel' | 'email' | 'url' | 'decimal' | 'numeric'
}

export const DETAIL_LINES: Record<DetailKey, DetailLine> = {
  name: { key: 'name', label: 'Trading name', empty: 'As the price list names it' },
  legalName: {
    key: 'legalName',
    label: 'Legal name',
    empty: 'Prints only where it differs',
  },
  abn: { key: 'abn', label: 'ABN', empty: 'None given, so none prints', mode: 'numeric' },
  address: { key: 'address', label: 'Street address', empty: 'None given', long: true },
  phone: { key: 'phone', label: 'Phone', empty: 'None given', mode: 'tel' },
  email: { key: 'email', label: 'Email', empty: 'None given', mode: 'email' },
  website: { key: 'website', label: 'Website', empty: 'None given', mode: 'url' },
  gstRate: {
    key: 'gstRate',
    label: 'GST rate',
    empty: 'None is assumed, so a quote says every price includes it',
    mode: 'decimal',
  },
  validDays: {
    key: 'validDays',
    label: 'A quote stands for',
    empty: 'No number of days, so no date prints',
    mode: 'numeric',
  },
  deposit: {
    key: 'deposit',
    label: 'Deposit wording',
    empty: 'None, so none prints',
    long: true,
  },
  quoteTerms: {
    key: 'quoteTerms',
    label: 'Terms',
    empty: 'None, so the last page has none',
    long: true,
  },
}

/** The value as it is kept, or the sentence that refuses it. '' clears the line. */
export type Typed =
  { ok: true; value: string | number | undefined } | { ok: false; refused: string }

/** The eleven digits of an ABN, read the way the Australian Business Register checks them. */
export function abnAddsUp(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
  const sum = digits
    .split('')
    .map(Number)
    .reduce((acc, d, i) => acc + (i === 0 ? d - 1 : d) * weights[i]!, 0)
  return sum % 89 === 0
}

/** An ABN as it is printed: 12 345 678 901. */
export const abnSaid = (digits: string): string =>
  `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`

/** Read what a person typed into a line, or say why it cannot be kept. */
export function readDetail(key: DetailKey, raw: string): Typed {
  const text = raw.replace(/\r\n/g, '\n').trim()
  if (text === '') return { ok: true, value: undefined }
  switch (key) {
    case 'abn': {
      const digits = text.replace(/[\s-]/g, '')
      if (!/^\d+$/.test(digits))
        return { ok: false, refused: 'An ABN is eleven digits and nothing else.' }
      if (digits.length !== 11)
        return {
          ok: false,
          refused: `An ABN is eleven digits, and this is ${digits.length}.`,
        }
      if (!abnAddsUp(digits))
        return {
          ok: false,
          refused:
            'These eleven digits do not add up the way every ABN’s do, so one of them is likely mistyped. Check it against the ABN Lookup.',
        }
      return { ok: true, value: abnSaid(digits) }
    }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
        ? { ok: true, value: text }
        : { ok: false, refused: 'An email address has a name, an @ and a place: sales@… .' }
    case 'phone':
      return /\d{6,}/.test(text.replace(/[\s()+-]/g, ''))
        ? { ok: true, value: text }
        : { ok: false, refused: 'A phone number needs its digits.' }
    case 'gstRate': {
      const n = Number(text.replace(/%$/, '').trim())
      if (!Number.isFinite(n) || n < 0 || n > 100)
        return { ok: false, refused: 'A GST rate is a share from 0 to 100, as in 10 for 10%.' }
      return { ok: true, value: Math.round(n * 100) / 100 }
    }
    case 'validDays': {
      const n = Number(text.replace(/\s*days?$/i, ''))
      if (!Number.isInteger(n) || n < 1 || n > 365)
        return {
          ok: false,
          refused: 'A quote stands for a whole number of days, from 1 to 365.',
        }
      return { ok: true, value: n }
    }
    default:
      return { ok: true, value: text }
  }
}

/** What a kept line holds, as text a field can show again. */
export function detailText(org: OrgProfile | undefined | null, key: DetailKey): string {
  const value = org?.[key]
  if (value === undefined || value === null) return ''
  return String(value)
}

/** What a kept line says where it is set: the value, or what an empty line prints. */
export function detailSaid(
  org: OrgProfile | undefined | null,
  key: DetailKey,
): { set: boolean; said: string } {
  const text = detailText(org, key)
  if (text === '') return { set: false, said: DETAIL_LINES[key].empty }
  if (key === 'gstRate') return { set: true, said: `${text}%` }
  if (key === 'validDays') return { set: true, said: `${text} ${text === '1' ? 'day' : 'days'}` }
  return { set: true, said: text }
}
