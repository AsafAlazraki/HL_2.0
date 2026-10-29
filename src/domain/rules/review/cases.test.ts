/* ============================================================
   THE CASE QUEUE, ON THE REAL PRICE LIST — and the writes a case
   makes, each one step through the catalogue's command door with
   its inverse applied back.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { apply, isDone } from '@/domain/catalogue/commands'
import { indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import type { EntityDef, RowData } from '@/domain/model'
import { review, type ReviewWorld } from './checks'
import {
  casesByKind,
  linesByKind,
  linesIn,
  meantKeysOf,
  moneyOf,
  queueOf,
  type Case,
} from './cases'
import { nameLinesCommand, onePriceCommand, priceLinesCommand, typedPrice } from './fixes'

const pack = await loadPack()

function world(): ReviewWorld {
  const entities: Record<string, EntityDef> = {}
  for (const e of pack.entities) entities[e.id] = e
  return { entities, rowsByEntity: pack.rowsByEntity }
}

function sheet(w: ReviewWorld): CatalogueData {
  const rows = w.rowsByEntity as Record<string, RowData[]>
  return {
    orgId: 'northside',
    version: null,
    from: 'pack',
    business: null,
    tables: w.entities,
    rows,
    index: indexRows(rows),
    groups: {},
    rules: {},
    views: {},
    modules: {},
    roles: {},
    constraintDefs: {},
    discoveredRules: {},
    priceLevels: {},
  } as unknown as CatalogueData
}

const of = <K extends Case['kind']>(cases: Case[], kind: K) =>
  cases.filter((c): c is Extract<Case, { kind: K }> => c.kind === kind)

describe('the queue, by the fix', () => {
  it('holds the 69 lines as 37 cases, and the rail’s five counts add to the review’s', () => {
    const r = review(world())
    const cases = queueOf(r)
    expect(cases).toHaveLength(37)
    expect(linesByKind(cases)).toEqual({ band: 9, two: 3, none: 46, twins: 4, nameless: 7 })
    expect(cases.reduce((n, c) => n + linesIn(c), 0)).toBe(r.open)
    expect(new Set(cases.map((c) => c.key)).size).toBe(cases.length)
  })

  it('counts each check in cases, so the five counts add to the queue’s 37 and never to 69', () => {
    const cases = queueOf(review(world()))
    const perKind = casesByKind(cases)
    expect(perKind).toEqual({ band: 9, two: 3, none: 18, twins: 4, nameless: 3 })
    expect(Object.values(perKind).reduce((n, k) => n + k, 0)).toBe(cases.length)
  })

  it('puts the most money first: charged too little, then over, then the rest in check order', () => {
    const cases = queueOf(review(world()))
    expect(cases.slice(0, 9).map(moneyOf)).toEqual([117, 117, 117, 117, 117, 117, 117, -117, -117])
    expect(cases.map((c) => c.kind).filter((k, i, a) => a.indexOf(k) === i)).toEqual([
      'band',
      'two',
      'none',
      'twins',
      'nameless',
    ])
    /* one name at two prices: the widest apart first — PU5000 by $620 */
    expect(of(cases, 'two')[0]!.item.name).toBe('MACKAY PU Series Trailer - PU5000-14-M')
  })

  it('makes the 46 lines with no price 18 cases, Formosa’s nine boats one of them', () => {
    const none = of(queueOf(review(world())), 'none')
    expect(none).toHaveLength(18)
    expect(none[0]!.group.tableName).toBe('Formosa')
    expect(linesIn(none[0]!)).toBe(9)
    const plugs = none.find((c) => c.group.category === 'TRAILER PARTS - Trailer Plugs')!
    expect(meantKeysOf(plugs)).toHaveLength(4)
  })

  it('leaves a whole case as meant, and the queue closes over it', () => {
    const w = world()
    const before = queueOf(review(w))
    const plugs = of(before, 'none').find(
      (c) => c.group.category === 'TRAILER PARTS - Trailer Plugs',
    )!
    const meant = Object.fromEntries(meantKeysOf(plugs).map((k) => [k, 'meant 2026-10-28']))
    const r = review(w, meant)
    expect(r.open).toBe(65)
    expect(r.meant).toBe(4)
    expect(queueOf(r).some((c) => c.key === plugs.key)).toBe(false)
  })

  it('is empty on the clean day', () => {
    expect(queueOf(review({ entities: {}, rowsByEntity: {} }))).toEqual([])
  })
})

describe('a case’s writes', () => {
  it('reads a price as a dealer types one, and refuses what is not', () => {
    expect(typedPrice('2100')).toBe(2100)
    expect(typedPrice(' $2,100.50 ')).toBe(2100.5)
    expect(typedPrice('')).toBeNull()
    expect(typedPrice('0')).toBeNull()
    expect(typedPrice('abc')).toBeNull()
    expect(typedPrice('2.125')).toBeNull()
  })

  it('prices several lines in one step, the case clears, and its Undo puts them back', () => {
    const w = world()
    const kits = of(queueOf(review(w)), 'none').find(
      (c) => c.group.category === 'ANCHOR WINCHES - Lone Star',
    )!
    const [a, b] = kits.group.lines
    const command = priceLinesCommand(
      kits.group.tableId,
      kits.group.tableName,
      kits.group.priceFieldId,
      'Sell',
      [
        { rowId: a!.rowId, name: a!.name, price: 2100 },
        { rowId: b!.rowId, name: b!.name, price: 2250 },
      ],
    )!
    const done = apply(sheet(w), command, '2026-10-28T09:00:00.000Z')
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    expect(done.said).toBe('2 lines in Parts & Accessories are now priced at Sell.')
    expect(done.event.kind).toBe('batch')
    const after = review({ entities: done.next.tables, rowsByEntity: done.next.rows })
    expect(after.noPrice.count).toBe(44)

    const back = done.inverse(done.next, '2026-10-28T09:00:01.000Z')
    expect(isDone(back)).toBe(true)
    if (!isDone(back)) return
    expect(review({ entities: back.next.tables, rowsByEntity: back.next.rows }).noPrice.count).toBe(
      46,
    )
  })

  it('says one priced line by its own name', () => {
    const w = world()
    const promo = of(queueOf(review(w)), 'none').find(
      (c) => c.group.category === 'BOAT SALES PROMO PACKS',
    )!
    const line = promo.group.lines[0]!
    expect(line.name).toBe('Promo Pack 2')
    const command = priceLinesCommand(
      promo.group.tableId,
      promo.group.tableName,
      promo.group.priceFieldId,
      'Sell',
      [{ rowId: line.rowId, name: line.name, price: 39 }],
    )
    const done = apply(sheet(w), command!, '2026-10-28T09:00:00.000Z')
    expect(isDone(done) && done.said).toBe('Promo Pack 2 is now $39 at Sell.')
    expect(priceLinesCommand('parts', 'Parts', 'parts.l', 'Sell', [])).toBeNull()
  })

  it('names the lines typed, skips the ones left empty, and the case clears by that many', () => {
    const w = world()
    const mackay = of(queueOf(review(w)), 'nameless')[0]!
    const items = mackay.group.items
    const command = nameLinesCommand(
      mackay.group.tableId,
      mackay.group.tableName,
      items[0]!.nameField.id,
      [
        { rowId: items[0]!.rowId, name: ' KR 2010 single ' },
        { rowId: items[1]!.rowId, name: '   ' },
      ],
    )!
    const done = apply(sheet(w), command, '2026-10-28T09:00:00.000Z')
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    expect(done.said).toBe('A line in Mackay Trailers is now called “KR 2010 single”.')
    expect(
      review({ entities: done.next.tables, rowsByEntity: done.next.rows }).nameless.count,
    ).toBe(6)
    expect(nameLinesCommand('x', 'X', 'f', [{ rowId: 'r', name: '' }])).toBeNull()
  })

  it('gives one name one price by copying every price of the line chosen', () => {
    const w = world()
    const pu = of(queueOf(review(w)), 'two')[0]!
    const low = pu.item.lines.find((l) => l.price === pu.item.low)!
    const others = pu.item.lines.filter((l) => l.rowId !== low.rowId)
    const done = apply(
      sheet(w),
      onePriceCommand(pu.tableId, pu.item.name, low, others)!,
      '2026-10-28T09:00:00.000Z',
    )
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    expect(done.said).toBe('Every “MACKAY PU Series Trailer - PU5000-14-M” now sells at $9,423.')
    const after = review({ entities: done.next.tables, rowsByEntity: done.next.rows })
    expect(after.twoPrices.count).toBe(2)
    expect(onePriceCommand(pu.tableId, pu.item.name, low, [])).toBeNull()
  })
})
