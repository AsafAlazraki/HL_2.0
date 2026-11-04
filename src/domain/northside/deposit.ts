/* ============================================================
   THE DEPOSIT AS NORTHSIDE'S RULE — a share of the quote's own total,
   or one fixed figure, worked out on each quote and printed under its
   total (the judge of Settings, 2026-11-04, L3: "a customer at the desk
   asks what do I pay today, and the quote can only print words").

   NOTHING IS WRITTEN FOR NORTHSIDE. Absent, no figure prints and the
   deposit wording, where one was typed, prints alone, as before. The
   rule is Northside's own decision; the figure is that decision applied
   to the quote's own total, never a figure asked of the price file.

   A QUOTE IS A PHOTOGRAPH. The rule rides the letterhead
   (`FrozenLetterhead.depositRule`), which the give copies on by value,
   and the total is frozen on the quote's lines, so a share changed on
   Settings tomorrow never moves a deposit printed on a quote given
   today. A draft prints the rule as it stands, on its own total.

   Pure: no React, no store, no clock.
   ============================================================ */

import type { DepositRule } from '@/domain/model'
import { money } from '@/domain/money'

/** The two ways a deposit can be set, and none. */
export type DepositWay = 'none' | 'share' | 'amount'

/** The rule as it is kept, or the sentence that refuses what was typed. */
export type DepositTyped = { ok: true; rule: DepositRule | undefined } | { ok: false; refused: string }

/** The most a fixed deposit may be: a figure past this is a slip of the keyboard. */
export const DEPOSIT_MOST = 10_000_000

export const SHARE_REFUSED = 'A deposit share is from 1 to 100, as in 10 for 10% of the total.'
export const AMOUNT_REFUSED = 'A fixed deposit is an amount in dollars over $0, as in 5000 for $5,000.'

/** Read what a person typed for a deposit rule, or say why it cannot be kept. */
export function readDepositRule(way: DepositWay, raw: string): DepositTyped {
  if (way === 'none') return { ok: true, rule: undefined }
  const text = raw.trim()
  if (way === 'share') {
    const n = Number(text.replace(/%$/, '').trim())
    if (text === '' || !Number.isFinite(n) || n < 1 || n > 100)
      return { ok: false, refused: SHARE_REFUSED }
    return { ok: true, rule: { share: Math.round(n * 100) / 100 } }
  }
  const n = Number(text.replace(/^\$/, '').replace(/,/g, '').trim())
  if (text === '' || !Number.isFinite(n) || n <= 0 || n > DEPOSIT_MOST)
    return { ok: false, refused: AMOUNT_REFUSED }
  return { ok: true, rule: { amount: Math.round(n * 100) / 100 } }
}

/** Which way a kept rule is. */
export const depositWayOf = (rule: DepositRule | undefined): DepositWay =>
  !rule ? 'none' : 'share' in rule ? 'share' : 'amount'

/** The figure a kept rule is typed as again in its field. */
export const depositTypedOf = (rule: DepositRule | undefined): string =>
  !rule ? '' : 'share' in rule ? String(rule.share) : String(rule.amount)

const shareSaid = (share: number): string => `${String(share)}%`

/** The rule as Settings says it, value first. */
export function depositRuleSaid(rule: DepositRule | undefined): string {
  if (!rule) return 'None, so no figure prints'
  if ('share' in rule) return `${shareSaid(rule.share)} of each quote’s total`
  return `${money(rule.amount)} on every quote`
}

/**
 * THE DEPOSIT ON ONE QUOTE, in dollars to the cent: the share of its total, or the fixed figure,
 * never more than the total itself. Null where it cannot be worked: no rule, or no total yet
 * (a line still to be priced), or a total of nothing.
 */
export function depositDue(rule: DepositRule | undefined, total: number | null): number | null {
  if (!rule || total === null || !Number.isFinite(total) || total <= 0) return null
  if ('share' in rule) return Math.round(total * rule.share) / 100
  return Math.min(rule.amount, total)
}

/**
 * THE LINE THE PAPER PRINTS UNDER THE TOTAL, or null where there is no rule. Where the total cannot
 * be worked yet the line says so in the customer's words instead of a figure; a fixed figure at
 * or over the total is the whole total, and says so.
 */
export function depositOnPaper(rule: DepositRule | undefined, total: number | null): string | null {
  if (!rule) return null
  const due = depositDue(rule, total)
  if ('share' in rule) {
    return due === null
      ? `Deposit: ${shareSaid(rule.share)} of the total, worked out once every price is confirmed.`
      : `Deposit, ${shareSaid(rule.share)} of the total: ${money(due)}`
  }
  if (due === null)
    return `Deposit: ${money(rule.amount)}, or the whole total where the total is less.`
  return due < rule.amount
    ? `Deposit: ${money(due)}, the whole total`
    : `Deposit: ${money(due)}`
}
