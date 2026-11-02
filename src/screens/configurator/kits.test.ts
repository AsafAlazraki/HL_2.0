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

/** A kit as the build's list holds it: the shared stem, and the motor as its own tail. */
const shelf = (tail: string): OptionRow =>
  ({
    stem: 'Rigging kit for the',
    tail,
    listed: 'Helm Master L2 · 6X9 Binnacle',
    fitted: false,
  }) as unknown as OptionRow

describe('a kit’s name read as the build’s list holds it', () => {
  /* THE SHARED STEM AND THE MOTOR ARE TWO WORDS (the owner's fully specced quote, 2026-11-03): the
     list keeps "Rigging kit for the" as every row's stem and the motor as each one's own tail, and
     read run together the F200XCB's kit was "theF200XCB", so the list said it had none */

  it('offers the kit for the motor on the quote when the name is split into stem and tail', () => {
    const rows = [shelf('F200XC'), shelf('F200XCB'), shelf('F200XCC')]
    expect(kitsForMotors(rows, ['F200XCB']).map((r) => r.tail)).toEqual(['F200XCB'])
  })
})
