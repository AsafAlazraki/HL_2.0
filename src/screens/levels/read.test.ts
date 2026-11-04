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
  doorsOf,
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
  it('puts the four open questions first, by how many lines on sale each answer prices', () => {
    const desk = readDesk(sheet(), readLadder(sheet()))
    /* lines on sale only: Dealer Fit's 1,777 less its 201 discontinued, Rigging Kits' 650 less 28
       discontinued and 7 banner rows (the verifier of Prices, round 2) */
    expect(desk.choose.map((c) => [c.name, c.lines])).toEqual([
      ['Dealer Fit', 1576],
      ['Rigging Kits', 615],
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
    /* never "one price for every buyer" over eight boats a trade buyer cannot be priced on */
    expect(fact('boat_jeanneau')).toBe('Trade is Cash on 19 · 8 with no Trade')
    expect(fact('parts')).toBe('Sell, or Sell inc Install fitted · 141 not priced')
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
    expect([fit.lines, act!.title, act!.priced, sell!.title, sell!.priced]).toEqual([
      1576,
      'Act Sell',
      1574,
      'Sell',
      635,
    ])
    expect(act!.figures[0]!.meaning?.cell).toBe('Dealer Fit Module!R')
    expect(act!.figures[0]!.checked).toEqual({ holds: 1562, of: 1574 })
    const b = fit.cash.between!
    expect([b.more, b.less, b.spread.both, b.spread.equal]).toEqual(['Act Sell', 'Sell', 635, 0])
    /* the door asks the sheet the lines counted: on sale, Act Sell under Sell */
    expect([b.under?.count, b.under?.href]).toEqual([
      7,
      '/data/dealer_fit?only=under~dealer_fit.r~dealer_fit.w%2Cnot~__discontinued',
    ])
  })

  it('asks the factory packages one figure under two names, never a cost the engine would refuse', () => {
    const pkgs = readLadder(sheet()).find((c) => c.name === 'Factory packages')!
    if (pkgs.cash.state !== 'not-priced') throw new Error('priced')
    expect(pkgs.cash.ways.map((w) => [w.title, w.alsoNamed, w.kept])).toEqual([
      ['Sell Price', ['RRP + Freight Inc GST'], false],
    ])
    expect(pkgs.cash.sample?.bare).toBe(true)
  })

  it('never counts a factory package under $0 as priced, and opens those five with their own door', () => {
    const pkgs = readLadder(sheet()).find((c) => c.name === 'Factory packages')!
    if (pkgs.cash.state !== 'not-priced') throw new Error('priced')
    /* 39 Haines and 34 Jeanneau hold a Sell Price above $0; 11 Jeanneau hold $0 and 5 under it */
    expect([pkgs.lines, pkgs.cash.ways[0]!.priced]).toEqual([89, 73])
    const tables = pkgs.tableIds.map((id) => sheet().tables[id]!)
    const doors = doorsOf(sheet(), tables, pkgs.cash.ways[0]!.figures[0]!.fieldId)
    expect(doors.map((d) => [d.count, d.said, d.href])).toEqual([
      [
        11,
        'at $0 on Jeanneau',
        '/data/mot_pkg_jeanneau?only=at-most~mot_pkg_jeanneau.bf~0%2Cat-least~mot_pkg_jeanneau.bf~0',
      ],
      [5, 'under $0 on Jeanneau', '/data/mot_pkg_jeanneau?only=below~mot_pkg_jeanneau.bf~0'],
    ])
  })

  it('says, once Sell Price is named, that the packages carry their own Trade Price, equal to it', () => {
    const named = ['mot_pkg_haines', 'mot_pkg_jeanneau'].map((id) =>
      catalogue.getState().apply(namePrice(id, CASH, `${id}.bf`)),
    )
    const pkgs = readLadder(sheet()).find((c) => c.name === 'Factory packages')!
    expect(pkgs.cash.state === 'reads' && [pkgs.cash.priced, pkgs.cash.none]).toEqual([73, 16])
    expect(pkgs.trade).toEqual({
      state: 'falls',
      to: 'Sell Price',
      carried: { label: 'Trade Price', cell: 'Motor Library!BL', same: 73, of: 73 },
    })
    for (const o of named.toReversed()) if (isDone(o)) catalogue.getState().undo(o.event.id)
  })

  it('asks Rigging Kits how a kit is sold, and says a sub-dealer pays the trade figure', () => {
    const kits = readLadder(sheet()).find((c) => c.id === 'rig_kits')!
    expect(questionOf(kits)).toMatch(/^How is a rigging kit sold: supplied, or always fitted?/)
    expect(kits.sub).toEqual({ label: 'Sub Dealer Price', held: 600, sameAsTrade: 600 })
  })

  it('opens the lines behind each count of no figure, one door per kind of nothing', () => {
    const parts = readLadder(sheet()).find((c) => c.id === 'parts')!
    /* of the 2,238 parts on sale; Parts' two credits (−$531, −$115) are prices, and "at most 0"
       alone would show them beside the noughts, so the nought door asks "at least 0" too */
    expect(parts.doors.cash.map((d) => [d.count, d.said])).toEqual([
      [25, 'with nothing in Sell'],
      [116, 'at $0 in Sell'],
    ])
    expect(parts.doors.cash[1]!.href).toBe(
      '/data/parts?only=at-most~parts.l~0%2Cat-least~parts.l~0%2Cnot~__discontinued',
    )
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

describe('a motor pointed at its RRP + Freight', () => {
  /* the verifier of Prices, 2026-11-04, a blocker: the engine kept RRP + Freight from customers as
     worked from cost, a formula that holds on 0 of 209 Yamaha lines (worked.pack.test.ts) */
  it('leaves the questions, settles by your choice, and keeps nothing from customers', () => {
    const fieldId = catalogue
      .getState()
      .tables.mot_yamaha!.fields.find((f) => f.name === 'RRP + Freight Inc GST')!.id
    const outcome = catalogue.getState().apply(namePrice('mot_yamaha', CASH, fieldId))
    expect(isDone(outcome)).toBe(true)
    const desk = readDesk(sheet(), readLadder(sheet()))
    expect(desk.choose.map((c) => c.name)).not.toContain('Yamaha Outboards')
    expect(desk.kept.map((k) => k.id)).toEqual(['warranty'])
    const yamaha = desk.settled.find((c) => c.name === 'Yamaha Outboards')!
    expect(
      yamaha.cash.state === 'reads' && [
        yamaha.cash.label,
        yamaha.cash.figure,
        yamaha.cash.mayReach,
      ],
    ).toEqual(['RRP + Freight Inc GST', 17643, true])
    expect(yamaha.cash.state === 'reads' && yamaha.cash.ways?.every((w) => !w.kept)).toBe(true)
    if (isDone(outcome)) catalogue.getState().undo(outcome.event.id)
  })
})
