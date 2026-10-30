import { describe, expect, it } from 'vitest'
import { KITS_WAIT, kitsForMotors, kitsNone, type OptionRow } from './chapters'

/* The rows are shapes with the words a kit's tile says (`kitSaid`), not price-list rows. */
const kit = (tail: string, fitted = false): OptionRow =>
  ({ stem: '', tail, listed: '', fitted }) as unknown as OptionRow

describe('rigging kits said against the quote’s motor', () => {
  const rows = [
    kit('Rigging kit for the F90LB'),
    kit('Rigging kit for the F90LB2 · White'),
    kit('Rigging kit for the F115LB'),
  ]

  it('offers only the kit for a motor on the quote, by its whole code', () => {
    expect(kitsForMotors(rows, ['F90LB']).map((r) => r.tail)).toEqual(['Rigging kit for the F90LB'])
  })

  it('offers none while the quote has no motor, and keeps a kit already on it', () => {
    expect(kitsForMotors(rows, [])).toEqual([])
    const on = kit('Rigging kit for the F115LB', true)
    expect(kitsForMotors([on], [])).toEqual([on])
  })

  it('says why in one sentence', () => {
    expect(KITS_WAIT).toMatch(/Choose the motor/)
    expect(kitsNone(['F60LC'])).toBe('The price list has no rigging kit for the F60LC.')
  })
})
