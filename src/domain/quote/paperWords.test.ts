import { describe, expect, it } from 'vitest'
import { factOnPaper, nameOnPaper, paperFacts, trailerOnPaper } from './paperWords'

/* ============================================================
   THE FILE'S WORDS ON THE CUSTOMER'S COPY (the printed quote's critic,
   2026-10-31, major 4 and minor 11). Every value below is one this
   file writes (`data/northside/tables`, read 2026-10-31): the shaft
   letters of the boat registers, the motor library's control, trim,
   starting and engine columns, the Stacer trailers' coded names and
   the parts' shorthand.
   ============================================================ */

describe('a fact the file writes short, said in full or left off', () => {
  it('says a boat’s shaft by its letters, all or nothing', () => {
    expect(factOnPaper('Shaft length', 'XL')?.value).toBe('Extra long')
    expect(factOnPaper('Shaft length', 'LS')?.value).toBe('Long')
    expect(factOnPaper('Shaft length', 'SS')?.value).toBe('Short')
    expect(factOnPaper('Shaft length', 'XL / UL / XL')?.value).toBe('Extra long or ultra long')
    expect(factOnPaper('Shaft length', 'UL / 2 x XL')?.value).toBe('Ultra long or 2 × extra long')
    expect(factOnPaper('Shaft length', 'Twin XL')?.value).toBe('Twin extra long')
    /* a letter no rule reads is left off rather than printed as a code */
    expect(factOnPaper('Shaft length', 'XQ')).toBeNull()
    /* a motor's shaft the column already says in inches */
    expect(factOnPaper('Shaft', '20 in')?.value).toBe('20 in')
    expect(factOnPaper('Shaft', '25 in / 30 in / 25 in')?.value).toBe('25 in or 30 in')
  })

  it('leaves off a value that is no fact', () => {
    for (const none of ['Opt', 'Optional', 'TBA', '0', '-']) {
      expect(factOnPaper('Fuel capacity', none), none).toBeNull()
    }
    expect(factOnPaper('Fuel capacity', '80 L')?.value).toBe('80 L')
    expect(factOnPaper('Fuel capacity', 'External Tank')?.value).toBe('External Tank')
  })

  it('says a motor’s control, trim, starting and engine as a person says them', () => {
    expect(factOnPaper('Control', 'Remote mech')?.value).toBe('Mechanical remote')
    expect(factOnPaper('Control', 'Tiller handle')?.value).toBe('Tiller handle')
    expect(factOnPaper('Control', 'Mech with Hydraulic Steering')?.value).toBe(
      'Mechanical, with hydraulic steering',
    )
    expect(factOnPaper('Control', 'DEC - Digital Electronic Control')?.value).toBe(
      'Digital electronic',
    )
    expect(factOnPaper('Control', 'DEC with Digital Electric Steering')?.value).toBe(
      'Digital electronic, with digital electric steering',
    )
    /* a note to the dealer, not a fact about the motor */
    expect(factOnPaper('Control', 'Mech. Tie Bar Required for Steering^')).toBeNull()
    /* the label is not said twice */
    expect(factOnPaper('Trim and tilt', 'Power Trim & Tilt')?.value).toBe('Power')
    expect(factOnPaper('Trim and tilt', 'Power Tilt')?.value).toBe('Power tilt')
    expect(factOnPaper('Starting', 'Manual (E-Kit OP)')?.value).toBe('Manual')
    expect(factOnPaper('Starting', 'Manual & Electric')?.value).toBe('Manual and electric')
    expect(factOnPaper('Engine', 'L4 / 1832cc')?.value).toBe('In-line 4, 1,832 cc')
    expect(factOnPaper('Engine', 'V6 / 4,256 cc')?.value).toBe('V6, 4,256 cc')
    expect(factOnPaper('Engine', '2cyl / 212cc')?.value).toBe('2 cylinders, 212 cc')
    expect(factOnPaper('Engine', '1cyl / 72cc')?.value).toBe('1 cylinder, 72 cc')
    expect(factOnPaper('Engine', '5,559 cc')?.value).toBe('5,559 cc')
  })

  it('hands the dealer every fact it leaves off', () => {
    const { printed, left } = paperFacts([
      { label: 'Power', value: '70 hp' },
      { label: 'Fuel capacity', value: 'Opt' },
      { label: 'Control', value: 'In Box - 703 Remote' },
    ])
    expect(printed).toEqual([{ label: 'Power', value: '70 hp' }])
    expect(left.map((f) => f.value)).toEqual(['Opt', 'In Box - 703 Remote'])
  })
})

describe('a name with the file’s shorthand said in full', () => {
  it('says "w", "c/w", "2mtr" and "ltr" as words and units, and keeps a product’s own code', () => {
    expect(nameOnPaper('Striker Vivid 4cv w GT20-TM Transducer')).toBe(
      'Striker Vivid 4cv with GT20-TM Transducer',
    )
    expect(nameOnPaper('Anchor c/w 10m chain')).toBe('Anchor complete with 10m chain')
    expect(nameOnPaper('Garmin NMEA Backbone/Drop Cable · 2mtr')).toBe(
      'Garmin NMEA Backbone/Drop Cable · 2 m',
    )
    expect(nameOnPaper('Tank 105ltr')).toBe('Tank 105 L')
    /* a "w" inside a word or a code is not "with" */
    expect(nameOnPaper('Windlass W50 Wiring')).toBe('Windlass W50 Wiring')
  })
})

describe('a trailer the file codes, said as a person says it', () => {
  it('says the series, rating, axle and kind, leaving the rating’s figures to its facts', () => {
    expect(trailerOnPaper('T Alloy 1100 ATM S 13" Skid Braked · 4.5 - 4.9 m', true)).toBe(
      'T Alloy 1100, single axle, skid, braked',
    )
    expect(trailerOnPaper('T Alloy 1100 ATM S 13" Skid Braked · 4.5 - 4.9 m', false)).toBe(
      'T Alloy 1100, single axle, skid, braked · for boats of 4.5–4.9 m',
    )
    expect(trailerOnPaper('T Alloy 1098 ATM S 13" Skid Braked - 4.1m - 4.5m', false)).toBe(
      'T Alloy 1098, single axle, skid, braked · for boats of 4.1–4.5 m',
    )
  })

  it('keeps a name in no shape it reads as the file froze it', () => {
    expect(trailerOnPaper('REDCO Custom / Highfield Sport 560 Aluminium', false)).toBe(
      'REDCO Custom / Highfield Sport 560 Aluminium',
    )
    expect(trailerOnPaper('T Light Alloy Short 650 ATM S 13" L/Skid', false)).toBe(
      'T Light Alloy Short 650, single axle, L/Skid',
    )
  })
})
