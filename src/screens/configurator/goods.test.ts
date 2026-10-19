/* ============================================================
   THE THING A PERSON RECOGNISES FIRST, against the rule and against
   the real pack. The names are the build's own (`lineSaid`); what is
   tested here is only what comes off them, and why.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { rowLabel, type EntityDef, type RowData } from '@/domain/model'
import { goodsSaid, nameFirst, powerOf, trailerFacts, trailerSizeOf } from './goods'

const pack = await loadPack()
const ctx = pack.ctx

const tableNamed = (name: string): EntityDef =>
  Object.values(ctx.entities).find((e) => e.name === name)!
const rowOf = (table: EntityDef, find: string): RowData =>
  ((pack.rowsByEntity[table.id] ?? []) as RowData[]).find((r) => rowLabel(table, r).includes(find))!

describe('a name loses only the code nobody says', () => {
  it('takes a leading code off, where the line’s own code is that code', () => {
    expect(nameFirst('110016 · D Shackle · 10 mm Galv', '110016')).toBe('D Shackle · 10 mm Galv')
    expect(nameFirst('MFM50 · Battery MFM50', 'MFM50')).toBe('Battery MFM50')
  })

  it('takes a part number off wherever it stands, as the end of the line’s code', () => {
    expect(
      nameFirst(
        'Yamaha/Stacer · 704-6Y82L-22-07 · Binnacle Mount Rigging Kit',
        '9ST-704-6Y82L-22-07',
      ),
    ).toBe('Yamaha/Stacer · Binnacle Mount Rigging Kit')
    expect(
      nameFirst('REDCO Stabicraft Alloy · TA600T-MOB · 2,200 kg', 'TA600T-MOB 2200kg Stabicraft'),
    ).toBe('REDCO Stabicraft Alloy · 2,200 kg')
  })

  it('keeps a code that is the model a person names, and a word that is not a code', () => {
    /* the MRV70 battery, two of them */
    expect(nameFirst('Battery · MRV70 · Qty 2', 'MRV70 (Qty 2)')).toBe('Battery · MRV70 · Qty 2')
    /* "White" is in the Model Code and is still the colour of the motor */
    expect(nameFirst('Yamaha F250XSB2 · White', 'F250XSB2 White')).toBe('Yamaha F250XSB2 · White')
    /* a motor's name is its code, and it is what the motor is called */
    expect(nameFirst('Yamaha F90LB', 'F90LB')).toBe('Yamaha F90LB')
  })

  it('takes nothing off where the line carries no code, and never empties a name', () => {
    expect(nameFirst('110016 · D Shackle · 10 mm Galv')).toBe('110016 · D Shackle · 10 mm Galv')
    expect(nameFirst('TA600 · 704-6Y82L-22-07', 'TA600 704-6Y82L-22-07')).toBe(
      'TA600 · 704-6Y82L-22-07',
    )
  })

  it('moves a trailer’s boat size to its facts only where its own column says the same', () => {
    const said = 'TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m'
    expect(nameFirst(said, 'TA1400S13SB', [4.9, 5.3])).toBe('T Alloy 1400 ATM S 13" Skid Braked')
    /* other figures are another size, and stay a word of the name */
    expect(nameFirst(said, 'TA1400S13SB', [4.5, 4.9])).toBe(
      'T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m',
    )
  })
})

describe('a row’s own facts, by its register’s own columns', () => {
  it('says a Stacer trailer’s boat, ATM and wheels off its row', () => {
    const table = tableNamed('Stacer Trailers')
    const row = rowOf(table, 'TA1400S13SB')
    expect(trailerSizeOf(table, row)).toEqual([4.9, 5.3])
    expect(trailerFacts(table, row)).toEqual(['for a 4.9–5.3 m boat', '1,400 kg ATM', '13″ wheels'])
    expect(goodsSaid(table, row)).toBe('for a 4.9–5.3 m boat · 1,400 kg ATM · 13″ wheels')
  })

  it('reads no boat size where the column writes a model’s number with no unit', () => {
    /* NSM's custom trailers write a Surtees model ("495") in the same column */
    const table = tableNamed('NSM Custom Trailers')
    const row = ((pack.rowsByEntity[table.id] ?? []) as RowData[])[0]!
    expect(trailerSizeOf(table, row)).toEqual([])
    expect(trailerFacts(table, row).some((f) => f.startsWith('for a'))).toBe(false)
    /* and a wheel the file writes as text with its own inch mark is still its size */
    expect(trailerFacts(table, row)).toContain('13″ wheels')
  })

  it('rates a motor’s power, and says nothing for a part', () => {
    const yamaha = tableNamed('Yamaha Outboards')
    const f90 = rowOf(yamaha, 'F90LB')
    expect(powerOf(yamaha, f90)).toBe('90')
    expect(goodsSaid(yamaha, f90)).toMatch(/^90 hp · \d+ kg · \d+″ shaft$/)
    const parts = tableNamed('Parts & Accessories')
    const part = ((pack.rowsByEntity[parts.id] ?? []) as RowData[])[0]!
    expect(goodsSaid(parts, part)).toBe('')
    expect(powerOf(parts, part)).toBe('')
  })
})
