import { describe, expect, it } from 'vitest'
import {
  AMOUNT_REFUSED,
  SHARE_REFUSED,
  depositDue,
  depositOnPaper,
  depositRuleSaid,
  depositTypedOf,
  depositWayOf,
  readDepositRule,
} from './deposit'
import { depositRule } from './read'
import { freezeLetterhead, letterheadOf } from './letterhead'

describe('the deposit as Northside’s rule', () => {
  it('reads a share and a fixed figure, and refuses what cannot be one, in a sentence', () => {
    expect(readDepositRule('share', '10')).toEqual({ ok: true, rule: { share: 10 } })
    expect(readDepositRule('share', '12.5%')).toEqual({ ok: true, rule: { share: 12.5 } })
    expect(readDepositRule('share', '0')).toEqual({ ok: false, refused: SHARE_REFUSED })
    expect(readDepositRule('share', '101')).toEqual({ ok: false, refused: SHARE_REFUSED })
    expect(readDepositRule('share', 'ten')).toEqual({ ok: false, refused: SHARE_REFUSED })
    expect(readDepositRule('amount', '$5,000')).toEqual({ ok: true, rule: { amount: 5000 } })
    expect(readDepositRule('amount', '0')).toEqual({ ok: false, refused: AMOUNT_REFUSED })
    expect(readDepositRule('amount', '')).toEqual({ ok: false, refused: AMOUNT_REFUSED })
    expect(readDepositRule('none', 'anything')).toEqual({ ok: true, rule: undefined })
  })

  it('works the figure from the quote’s own total, to the cent, never past the total', () => {
    expect(depositDue({ share: 10 }, 84_499)).toBe(8449.9)
    expect(depositDue({ share: 12.5 }, 1000.01)).toBe(125)
    expect(depositDue({ amount: 5000 }, 84_499)).toBe(5000)
    expect(depositDue({ amount: 5000 }, 3200)).toBe(3200)
    expect(depositDue({ share: 10 }, null)).toBeNull()
    expect(depositDue({ share: 10 }, 0)).toBeNull()
    expect(depositDue(undefined, 84_499)).toBeNull()
  })

  it('prints a line under the total, or says why no figure can be worked yet', () => {
    expect(depositOnPaper({ share: 10 }, 84_499)).toBe('Deposit, 10% of the total: $8,449.90')
    expect(depositOnPaper({ amount: 5000 }, 84_499)).toBe('Deposit: $5,000')
    expect(depositOnPaper({ amount: 5000 }, 3200)).toBe('Deposit: $3,200, the whole total')
    expect(depositOnPaper({ share: 10 }, null)).toBe(
      'Deposit: 10% of the total, worked out once every price is confirmed.',
    )
    expect(depositOnPaper(undefined, 84_499)).toBeNull()
  })

  it('says the rule value first on Settings, and gives it back to its field', () => {
    expect(depositRuleSaid(undefined)).toBe('None, so no figure prints')
    expect(depositRuleSaid({ share: 10 })).toBe('10% of each quote’s total')
    expect(depositRuleSaid({ amount: 5000 })).toBe('$5,000 on every quote')
    expect(depositWayOf({ amount: 5000 })).toBe('amount')
    expect(depositTypedOf({ share: 12.5 })).toBe('12.5')
  })

  it('is read back defensively, one way or the other and never both', () => {
    expect(depositRule({ share: 10 })).toEqual({ share: 10 })
    expect(depositRule({ amount: 5000 })).toEqual({ amount: 5000 })
    expect(depositRule({ share: 10, amount: 5000 })).toBeUndefined()
    expect(depositRule({ share: 0 })).toBeUndefined()
    expect(depositRule('10%')).toBeUndefined()
  })

  it('rides the letterhead, so the give freezes it with the rest', () => {
    const today = letterheadOf(
      { name: 'Northside Marine', industry: 'marine', createdAt: '', depositRule: { share: 10 } },
      'Northside Marine',
      null,
    )
    expect(today?.depositRule).toEqual({ share: 10 })
    const kept = freezeLetterhead(today!, '2026-11-04T00:00:00.000Z')
    expect(kept.depositRule).toEqual({ share: 10 })
    expect(kept.depositRule).not.toBe(today?.depositRule)
  })
})
