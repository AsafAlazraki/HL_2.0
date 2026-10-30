import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { sellableRows } from '@/domain/catalogue/views/sellable'
import { AISLES, UNSORTED, aisleOf, aislesOf, makersOf, type PartIn } from './aisles'

/* THE AISLES, MEASURED ON THE REAL PRICE LIST. The counts below are the ones the chosen board
   drew (docs/directions/choosing.md, "The catalogue"), read again here off the pack: nothing in
   an aisle is invented, and every live part is in exactly one aisle or in "Not sorted yet". */
let pack: PackFixture
let parts: PartIn[]

beforeAll(async () => {
  pack = await loadPack()
  const table = pack.byKey('parts')
  parts = sellableRows(pack.rowsByEntity[table.id] ?? []).map((row) => ({
    id: row.id,
    heading: String(row.values['parts.cat'] ?? ''),
  }))
})

describe('the chandlery’s aisles', () => {
  it('puts every live part in one aisle or in Not sorted yet, and loses none', () => {
    const counted = aislesOf(parts)
    expect(counted.reduce((sum, a) => sum + a.parts, 0)).toBe(parts.length)
    expect(parts.length).toBe(2238)
  })

  it('holds what the board measured, aisle by aisle', () => {
    const by = Object.fromEntries(aislesOf(parts).map((a) => [a.aisle.id, a.parts]))
    expect(by).toEqual({
      sounders: 246,
      radios: 47,
      stereo: 41,
      safety: 48,
      anchoring: 66,
      power: 105,
      lights: 20,
      trailer: 52,
      covers: 144,
      fishing: 37,
      electric: 119,
      propellers: 447,
      steering: 226,
      plumbing: 160,
      deck: 91,
      highfield: 177,
      decals: 27,
      workshop: 157,
      [UNSORTED]: 28,
    })
  })

  it('has eighteen aisles, each named in the dealer’s words and never a code', () => {
    expect(AISLES).toHaveLength(18)
    for (const aisle of AISLES) expect(aisle.name).not.toMatch(/[A-Z]{4,}/)
  })

  it('reads a heading by its longest named start, so a propeller is not a Yamaha part', () => {
    expect(aisleOf('PROPELLERS - Yamaha')).toBe('propellers')
    expect(aisleOf('YAMAHA SERVICE ITIEMS')).toBe('propellers')
    expect(aisleOf('ELECTRICAL COMPLIANCE COMPONENTS')).toBe('workshop')
    expect(aisleOf('ELECTRICAL - Battery Switches & Relays')).toBe('power')
    expect(aisleOf('GME - MARINE ENTERTAINMENT SPEAKERS')).toBe('stereo')
    expect(aisleOf('GME - MARINE RADIO ACCESSORIES')).toBe('radios')
  })

  it('never guesses a heading it does not name', () => {
    expect(aisleOf('DFO KITS')).toBe(UNSORTED)
    expect(aisleOf('')).toBe(UNSORTED)
    expect(aisleOf(undefined)).toBe(UNSORTED)
  })

  it('counts the pictured parts the reader is asked about, and only those', () => {
    const first = parts.find((p) => aisleOf(p.heading) === 'radios')!
    const counted = aislesOf(parts, (id) => id === first.id)
    expect(counted.find((a) => a.aisle.id === 'radios')!.pictured).toBe(1)
    expect(counted.reduce((sum, a) => sum + a.pictured, 0)).toBe(1)
  })
})

describe('the makers in an aisle', () => {
  it('counts each supplier, most first, and counts no part under a maker it does not name', () => {
    expect(makersOf(['GME', 'Garmin', 'GME', '', null, ' GME '])).toEqual([
      { maker: 'GME', parts: 3 },
      { maker: 'Garmin', parts: 1 },
    ])
  })
})
