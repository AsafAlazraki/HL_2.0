import { describe, expect, it } from 'vitest'
import { alsoBySaid, spineName } from './spineSaid'

/* On the real names ledger (`data/northside/names.json`): every name below is the maker's own
   page's heading, or the file's own string where no page names it. */
describe('a model on the sheet’s spine, as a person says it', () => {
  it('says a Highfield code the maker’s page names in the page’s words, and keeps the code beside it', () => {
    expect(spineName('boat_highfield', 'RU230KAM')).toEqual({
      name: 'Roll Up 230 KAM',
      code: 'RU230KAM',
      whole: 'Highfield Roll Up 230 KAM',
    })
    expect(spineName('boat_highfield', 'SP560').name).toBe('Sport 560')
    expect(spineName('boat_highfield', 'PA600ST').name).toBe('Patrol 600 ST')
  })

  it('keeps the maker’s own name where the page writes the code itself (the ADV7)', () => {
    expect(spineName('boat_highfield', 'ADV7')).toEqual({ name: 'ADV7', code: '', whole: 'ADV7' })
  })

  it('keeps a code no page names as the code, and invents nothing', () => {
    expect(spineName('boat_highfield', 'SP300')).toEqual({
      name: 'SP300',
      code: '',
      whole: 'SP300',
    })
  })

  it('keeps the file’s own words on a register that names its models in words', () => {
    expect(spineName('boat_stacer', '519 Sea Ranger SDF (Centre Console)')).toEqual({
      name: '519 Sea Ranger SDF (Centre Console)',
      code: '',
      whole: '519 Sea Ranger SDF (Centre Console)',
    })
    expect(spineName('boat_highfield', '')).toEqual({ name: '', code: '', whole: '' })
  })
})

describe('what the sheet’s find keeps', () => {
  const rows = ['RU230KAM', 'RU230AL', 'SP560', 'SP300']
  const said = (row: string): string => {
    const n = spineName('boat_highfield', row)
    return n.code === '' ? '' : n.whole
  }

  it('adds the rows whose model is said in words holding the phrase, in the sheet’s order', () => {
    expect(alsoBySaid(rows, [], 'roll up 230', said)).toEqual(['RU230KAM', 'RU230AL'])
    expect(alsoBySaid(rows, [], '  Highfield   SPORT 560 ', said)).toEqual(['SP560'])
  })

  it('keeps what the file’s own search found, and everything for an empty phrase', () => {
    expect(alsoBySaid(rows, ['SP300'], 'sp300', said)).toEqual(['SP300'])
    expect(alsoBySaid(rows, [], ' ', said)).toEqual(rows)
    expect(alsoBySaid(rows, [], 'hovercraft', said)).toEqual([])
  })
})
