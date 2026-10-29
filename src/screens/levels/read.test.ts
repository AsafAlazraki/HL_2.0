/* ============================================================
   THE PAGE BY WHO HAS TO ACT, read off the real price list: what is
   the dealer's to choose, what is worked from cost, what is settled,
   and the one line Warranty is read on. Every figure here is the
   price list's own; none is typed into the screen.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { catalogue } from '@/state/catalogue'
import { namePrice, CASH } from '@/domain/catalogue/priceCommands'
import { isDone } from '@/domain/catalogue/commands'
import { readDesk, readLadder, settledFact, soldAsPackage, type Sheet } from './read'

const sheet = (): Sheet => {
  const s = catalogue.getState()
  return { tables: s.tables, rows: s.rows, priceLevels: s.priceLevels }
}

beforeAll(async () => {
  const pack = await loadPack()
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
})

describe('the desk', () => {
  it('puts the four open questions first, by how many lines each answer prices', () => {
    const desk = readDesk(sheet(), readLadder(sheet()))
    expect(desk.choose.map((c) => [c.name, c.lines])).toEqual([
      ['Dealer Fit', 1777],
      ['Rigging Kits', 650],
      ['Yamaha Outboards', 209],
      ['Factory packages', 89],
    ])
    expect(desk.settled).toHaveLength(10)
  })

  it('reads Warranty on the Sport 560 in Hypalon: $32,166 against Cash $48,350, kept from customers', () => {
    const desk = readDesk(sheet(), readLadder(sheet()))
    expect(desk.kept).toHaveLength(1)
    const [warranty] = desk.kept
    expect(warranty!.label).toBe('Warranty')
    expect(warranty!.on).toBe('every boat, from 7 makers')
    expect(warranty!.mayReach).toBe(false)
    expect(warranty!.targets).toHaveLength(7)
    const s = warranty!.specimen!
    expect([s.maker, s.sample.name, s.figure, s.against]).toEqual([
      'Highfield',
      'Sport 560 · Hypalon · White / White / White/Blue',
      32166,
      48350,
    ])
  })

  it('says each settled list’s fact from its own figures', () => {
    const cols = readLadder(sheet())
    const fact = (id: string) => settledFact(cols.find((c) => c.id === id)!)
    expect(fact('boat_stacer')).toBe('One price for every buyer')
    expect(fact('boat_highfield')).toBe('Trade is 95% of Cash')
    expect(fact('boat_formosa')).toBe('One price for every buyer · 9 not priced')
    expect(fact('boat_jeanneau')).toBe('One price for every buyer · 8 with no Trade')
    expect(fact('parts')).toBe('Sell, or Sell inc Install fitted · 146 not priced')
    const haines = cols.find((c) => c.id === 'boat_haines')!
    expect(soldAsPackage(sheet(), haines)).toBe('Haines Signature Factory Packages')
  })
})

describe('a motor pointed at a figure worked from cost', () => {
  it('leaves the questions and stands beside Warranty with its own switch, read on the F90XB', () => {
    const fieldId = catalogue
      .getState()
      .tables.mot_yamaha!.fields.find((f) => f.name === 'RRP + Freight Inc GST')!.id
    const outcome = catalogue.getState().apply(namePrice('mot_yamaha', CASH, fieldId))
    expect(isDone(outcome)).toBe(true)
    const desk = readDesk(sheet(), readLadder(sheet()))
    expect(desk.choose.map((c) => c.name)).not.toContain('Yamaha Outboards')
    const rrp = desk.kept.find((k) => k.id === 'mot_yamaha#reach')!
    expect([rrp.label, rrp.on, rrp.mayReach]).toEqual([
      'RRP + Freight Inc GST',
      'every Yamaha motor',
      false,
    ])
    expect([rrp.specimen?.sample.name, rrp.specimen?.figure, rrp.specimen?.against]).toEqual([
      'F90XB',
      17643,
      14531,
    ])
    if (isDone(outcome)) catalogue.getState().undo(outcome.event.id)
  })
})
