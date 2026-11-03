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
import {
  lineEntries,
  questionOf,
  readDesk,
  readLadder,
  settledFact,
  soldAsPackage,
  type Sheet,
} from './read'

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
    /* Haines Signature holds no Warranty figure: its boats are sold as factory packages */
    expect(warranty!.on).toBe('every boat, from 6 makers')
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

describe('what Northside is asked, with its grounds', () => {
  it('offers Dealer Fit its two ways, each saying what it is, and reads them over the whole list', () => {
    const fit = readLadder(sheet()).find((c) => c.id === 'dealer_fit')!
    expect(fit.cash.state).toBe('not-priced')
    if (fit.cash.state !== 'not-priced') return
    const [act, sell] = fit.cash.ways
    expect([act!.title, act!.priced, sell!.title, sell!.priced]).toEqual([
      'Act Sell',
      1733,
      'Sell',
      815,
    ])
    expect(act!.figures[0]!.meaning?.cell).toBe('Dealer Fit Module!R')
    expect(act!.figures[0]!.checked).toEqual({ holds: 1721, of: 1733 })
    const b = fit.cash.between!
    expect([b.more, b.less, b.spread.both, b.spread.equal]).toEqual(['Act Sell', 'Sell', 789, 0])
  })

  it('asks the factory packages one figure under two names, never a cost the engine would refuse', () => {
    const pkgs = readLadder(sheet()).find((c) => c.name === 'Factory packages')!
    if (pkgs.cash.state !== 'not-priced') throw new Error('priced')
    expect(pkgs.cash.ways.map((w) => [w.title, w.alsoNamed, w.kept])).toEqual([
      ['Sell Price', ['RRP + Freight Inc GST'], false],
    ])
    expect(pkgs.cash.sample?.bare).toBe(true)
  })

  it('asks Rigging Kits how a kit is sold, and says a sub-dealer pays the trade figure', () => {
    const kits = readLadder(sheet()).find((c) => c.id === 'rig_kits')!
    expect(questionOf(kits)).toMatch(/^How is a rigging kit sold: supplied, or always fitted?/)
    expect(kits.sub).toEqual({ label: 'Sub Dealer Price', held: 628, sameAsTrade: 628 })
  })

  it('opens the lines behind each count of no figure, one door per kind of nothing', () => {
    const parts = readLadder(sheet()).find((c) => c.id === 'parts')!
    expect(parts.doors.cash.map((d) => [d.count, d.said])).toEqual([
      [27, 'with nothing in Sell'],
      [119, 'at $0 in Sell'],
    ])
    expect(parts.doors.cash[1]!.href).toBe('/data/parts?only=at-most~parts.l~0')
    const stacer = readLadder(sheet()).find((c) => c.id === 'boat_stacer')!
    expect(stacer.warranty?.above).toBe(8)
    expect(stacer.doors.warranty[0]?.count).toBe(8)
  })

  it('names every line on sale for the look-up, as the build names it', () => {
    const entries = lineEntries(sheet(), readLadder(sheet()))
    const f90 = entries.find((e) => e.code === 'F90XB')!
    expect([f90.name, f90.list]).toEqual(['F90XB', 'Yamaha Outboards'])
    expect(entries.some((e) => e.name === 'Tube Covers to suit PVC Boat · 3.4 m')).toBe(true)
    expect(entries.filter((e) => /\d\s*Mtr$/.test(e.name)).map((e) => e.name)).toEqual([])
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
