import { describe, expect, it } from 'vitest'
import { priceLevelsFor } from './pricing'
import { loadPack } from '@/test/fixtures/pack'
import { fileLevelNames, fileLevelNamesIn, levelWord, lineLevelSaid } from './levelSaid'

const pack = await loadPack()
const ladders = pack.entities.map((e) => priceLevelsFor(e))

describe('a price level is said by the name the dealership declared', () => {
  it('says a motor’s Sell Price and a trailer’s Sell inc Rego as Cash, and Trade Price as Trade', () => {
    expect(levelWord('cash', 'Sell Price')).toBe('Cash')
    expect(levelWord('cash', 'Sell inc Rego')).toBe('Cash')
    expect(levelWord('cash', 'Sell')).toBe('Cash')
    expect(levelWord('trade', 'Trade Price')).toBe('Trade')
    expect(levelWord('fitted', 'Sell inc Install (if appl.)')).toBe('Fitted')
  })

  it('says a key nobody declared a name for by the file’s own column name, never a guess', () => {
    expect(levelWord('rrp', 'RRP')).toBe('RRP')
    expect(levelWord('rrp', '')).toBe('rrp')
  })

  it('says nothing for a line with no price column at all', () => {
    expect(lineLevelSaid({ levelResolved: 'cash', priceColumnName: null })).toBe('')
    expect(lineLevelSaid({ levelResolved: 'cash', priceColumnName: 'Sell Price' })).toBe('Cash')
  })

  it('says every level the price file declares by one of the declared names', () => {
    const said = new Set(
      ladders.flatMap((l) => l.map((level) => levelWord(level.key, level.label))),
    )
    /* measured on the file, 2026-09-24: four keys across 53 lists */
    expect([...said].sort()).toEqual(['Cash', 'Fitted', 'Trade', 'Warranty'])
  })
})

describe('the file’s own level names, which a dealer’s screen never prints', () => {
  const names = fileLevelNames(ladders)

  it('are read off the declared ladders: every column name that is not its level’s word', () => {
    expect(names).toEqual(
      expect.arrayContaining(['Sell inc Rego', 'Sell Price', 'Trade Price', 'Sell']),
    )
    for (const declared of ['Cash', 'Trade', 'Warranty', 'Fitted']) {
      expect(names).not.toContain(declared)
    }
  })

  it('finds them as whole phrases, the longest first, and nothing inside another word', () => {
    expect(fileLevelNamesIn('$31,850 at Sell Price', names)).toEqual(['Sell Price'])
    expect(fileLevelNamesIn('it stays at Sell inc Rego', names)).toEqual(['Sell inc Rego'])
    expect(fileLevelNamesIn('Northside sells boats · Cash · Trade', names)).toEqual([])
    expect(fileLevelNamesIn('$31,850 at Cash', names)).toEqual([])
  })
})
