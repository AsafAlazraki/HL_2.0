/* ============================================================
   THE CHECKS, AGAINST THE REAL PRICE LIST.

   Every figure the Review screen draws is asserted here first, on
   the 53 lists the browser loads, so a count on screen is a count
   this file measured. A fix is applied through the same command
   door the screen uses, and its inverse is applied back.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { apply, isDone } from '@/domain/catalogue/commands'
import { indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import type { EntityDef, RowData } from '@/domain/model'
import {
  bandReview,
  bandsAdmitting,
  nameless,
  noPrice,
  review,
  soldAsPackage,
  twoPrices,
  unchecked,
  type ReviewWorld,
} from './checks'
import { nameLineCommand, nameTwinCommand, rebandCommand, rebandRefusal } from './fixes'

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

describe('the band, on the real file', () => {
  it('tests 430 trailers and finds the nine, seven charged too little and two too much', () => {
    const band = bandReview(world())
    expect(band.tested).toBe(430)
    expect(band.lines).toHaveLength(9)
    expect(band.lines.filter((l) => l.way === 'heavier')).toHaveLength(7)
    expect(band.lines.filter((l) => l.way === 'lighter')).toHaveLength(2)
    /* 7 × $117 not charged, 2 × $117 charged over: the fee list's own SELL, $283 and $166 */
    expect(band.notCharged).toBe(819)
    expect(band.chargedOver).toBe(234)
    /* the head says each sum over its own trailers, counted here and not on the screen */
    expect(band.notChargedOn).toBe(7)
    expect(band.chargedOverOn).toBe(2)
    expect(band.groups.map((g) => [g.word, g.lines.length])).toEqual([
      ['Small', 7],
      ['Large', 2],
    ])
  })

  it('proposes the one band whose own label admits the weight, priced by the file’s formula', () => {
    const band = bandReview(world())
    const sportski = band.lines.find((l) => l.rowId === 'trl_gfab:27')
    expect(sportski?.to).toEqual({
      band: 'Large Trailers - Over 1.021t',
      word: 'Large',
      fee: 283,
      /* ROUNDUP(Sell + Rego ($)) = 15,990 + 283 */
      sell: 16273,
      delta: 117,
    })
    const tinka = band.lines.find((l) => l.rowId === 'trl_redco:36')
    expect(tinka?.to?.word).toBe('Small')
    expect(tinka?.to?.sell).toBe(5146)
    expect(tinka?.to?.delta).toBe(-117)
  })

  it('leaves a trailer as meant, its sums with it, and brings it back when its weight moves', () => {
    const w = world()
    const sportski = bandReview(w).lines.find((l) => l.rowId === 'trl_gfab:27')!
    const left = bandReview(w, { [sportski.key]: '2026-10-28' })
    expect(left.lines).toHaveLength(8)
    expect(left.meant).toBe(1)
    expect(left.notCharged).toBe(702)
    /* the key holds the weight that made it a finding: at another weight it is a new finding */
    expect(sportski.key).toBe('band:trl_gfab:trl_gfab:27:Small Trailers - Up to 1.02t:1500')
  })

  it('proposes nothing where two labels admit the weight, and says why', () => {
    expect(bandsAdmitting(5000).map((b) => b.band)).toEqual([
      'Large Trailers - Over 1.021t',
      'Heavy Trailers - Over 4.55t',
    ])
    expect(bandsAdmitting(1500).map((b) => b.band)).toEqual(['Large Trailers - Over 1.021t'])
    const line = { ...bandReview(world()).lines[0]!, to: null, admits: ['A', 'B'] }
    expect(rebandRefusal(line)).toContain('more than one rego type')
    expect(rebandCommand(line, 'x')).toBeNull()
  })

  it('writes one trailer in one step, the check clears it, and its Undo puts all three back', () => {
    const w = world()
    const line = bandReview(w).lines.find((l) => l.rowId === 'trl_gfab:27')!
    const command = rebandCommand(line, 'GFAB Offroad Single Sportski Trailer')!
    const done = apply(sheet(w), command, '2026-10-22T09:00:00.000Z')
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    expect(done.said).toBe(
      'GFAB Offroad Single Sportski Trailer is registered Large at $283, and sells at $16,273.',
    )
    expect(done.event.kind).toBe('batch')
    expect(done.event.events).toHaveLength(3)
    const after = bandReview({ entities: done.next.tables, rowsByEntity: done.next.rows })
    expect(after.lines).toHaveLength(8)
    expect(after.notCharged).toBe(702)

    const back = done.inverse(done.next, '2026-10-22T09:00:01.000Z')
    expect(isDone(back)).toBe(true)
    if (!isDone(back)) return
    const row = back.next.rows['trl_gfab']!.find((r) => r.id === 'trl_gfab:27')!
    expect(row.values['trl_gfab.ca']).toBe(16156)
    expect(
      bandReview({ entities: back.next.tables, rowsByEntity: back.next.rows }).lines,
    ).toHaveLength(9)
  })
})

describe('one name at two prices', () => {
  it('counts only what is on sale: 3 names, 2 in Mackay and 1 in Parts', () => {
    const two = twoPrices(world())
    expect(two.count).toBe(3)
    expect(two.groups.map((g) => [g.tableName, g.items.length])).toEqual([
      ['Mackay Trailers', 2],
      ['Parts & Accessories', 1],
    ])
    /* the Bluetooth battery at $1,899 and $2,890 is not here: the $2,890 line is no longer sold */
    expect(two.groups.flatMap((g) => g.items).some((i) => i.name.includes('Bluetooth'))).toBe(false)
    /* the widest spread is the one the check is said by */
    const spread = (i: { low: number; high: number }) => i.high - i.low
    const all = two.groups.flatMap((g) => g.items)
    expect(two.widest).not.toBeNull()
    expect(all.every((i) => spread(i) <= spread(two.widest!))).toBe(true)
  })

  it('stays quiet once left as meant, and comes back when a price moves', () => {
    const first = twoPrices(world()).groups[0]!.items[0]!
    const left = twoPrices(world(), { [first.key]: '2026-10-22' })
    expect(left.count).toBe(2)
    expect(left.meant).toBe(1)
    expect(first.key).toContain(`${first.low}/${first.high}`)
  })
})

describe('on sale with no price', () => {
  it('groups by the list’s own category, the largest first, and counts what it leaves out', () => {
    const none = noPrice(world())
    /* Formosa's nine SRT boats are $0 at Cash, Trade and Warranty alike: the largest group */
    const top = none.groups[0]!
    expect(top.tableName).toBe('Formosa')
    expect(top.category).toBeNull()
    expect(top.kind).toBe('zero')
    expect(top.lines).toHaveLength(9)
    expect(top.priceNames).toEqual(['Cash', 'Trade', 'Warranty'])
    expect(none.count).toBe(46)
    expect(none.groups).toHaveLength(18)
    /* Haines Signature's nine boats are sold as factory packages, which carry the price */
    expect(none.packages).toEqual([{ tableName: 'Haines Signature', count: 9 }])
    const formosa = none.groups.find((g) => g.tableName === 'Formosa')
    expect(formosa?.lines).toHaveLength(9)
    /* a nameless line is said once, under nothing to name it, and never here too */
    const all = none.groups.flatMap((g) => g.lines.map((l) => l.rowId))
    expect(all).not.toContain('trl_mackay:124')
    expect(all).not.toContain('parts:2228')
    expect(none.count).toBe(all.length)
    /* by list, said once: each list once, its count the sum of its groups, and every group kept */
    expect(new Set(none.lists.map((l) => l.tableId)).size).toBe(none.lists.length)
    for (const l of none.lists)
      expect(l.count).toBe(l.groups.reduce((n, g) => n + g.lines.length, 0))
    expect(none.lists.flatMap((l) => l.groups)).toHaveLength(none.groups.length)
    expect(none.lists.reduce((n, l) => n + l.count, 0)).toBe(none.count)
    expect(none.lists.find((l) => l.tableName === 'Formosa')?.count).toBe(9)
  })

  it('finds the boats a package sells by the file’s shape, not by a maker’s name', () => {
    expect(soldAsPackage(world(), 'boat_haines').size).toBe(9)
    expect(soldAsPackage(world(), 'boat_formosa').size).toBe(0)
  })

  it('reads every price a list declares: a line priced fitted is not a line with no price', () => {
    /* the sweep of 2026-10-28, §0.1: Parts declares Sell and Sell inc Install, and the 86 labour
       estimates, 10 Highfield installs and 5 trailer adjustments are $0 supplied and priced
       fitted. Read at Sell alone, 147 were counted; 101 of them had a price */
    const none = noPrice(world())
    expect(none.groups.some((g) => g.category === 'LABOUR ESTIMATES')).toBe(false)
    const blank = none.groups
      .filter((g) => g.kind === 'blank')
      .reduce((n, g) => n + g.lines.length, 0)
    const zero = none.groups
      .filter((g) => g.kind === 'zero')
      .reduce((n, g) => n + g.lines.length, 0)
    expect([blank, zero]).toEqual([22, 24])
  })

  it('says the priced line beside each one, never a price proposed for it', () => {
    const none = noPrice(world())
    const lines = none.groups.flatMap((g) => g.lines)
    expect(lines.find((l) => l.name === 'Lone Star - GX-1 HS4mm Combo Winch Kit')?.beside).toEqual({
      rowId: 'parts:73',
      name: 'Lone Star - GX-1 6mm Combo Winch Kit',
      price: 2100,
    })
    /* nothing in TRAILER PARTS - Trailer Plugs has a price, so nothing is said beside them */
    const plugs = none.groups.find((g) => g.category === 'TRAILER PARTS - Trailer Plugs')!
    expect(plugs.lines).toHaveLength(4)
    expect(plugs.lines.every((l) => l.beside === null)).toBe(true)
  })

  it('leaves a whole group as meant with one press, and the count goes with it', () => {
    const none = noPrice(world())
    const formosa = none.groups[0]!
    const meant = Object.fromEntries(formosa.lines.map((l) => [l.key, '2026-10-22']))
    const after = noPrice(world(), meant)
    expect(after.count).toBe(none.count - 9)
    expect(after.meant).toBe(9)
    expect(after.groups.some((g) => g.key === formosa.key)).toBe(false)
  })

  it('names the six lists that declare no price and no check reads, so none of their lines can be checked for one', () => {
    const lists = unchecked(world())
    expect(lists.map((l) => l.tableName)).toEqual([
      'Dealer Fit Packages',
      'Haines Signature Factory Packages',
      'Jeanneau Factory Packages',
      'Labour Rates',
      'Oils & Consumables',
      'Rigging Kits',
    ])
    /* Registration Costs declares no price, but the wrong-size check reads its fees */
    expect(lists.map((l) => l.tableName)).not.toContain('Registration Costs')
    expect(lists.reduce((n, l) => n + l.lines, 0)).toBe(2561)
  })
})

describe('nothing to name it, and two under one name', () => {
  it('finds 7 lines on sale with no name, the file’s own “none” lines left out', () => {
    const nl = nameless(world())
    expect(nl.groups.map((g) => [g.tableName, g.items.length])).toEqual([
      ['Mackay Trailers', 3],
      ['Parts & Accessories', 3],
      ['Rigging Kits', 1],
    ])
    expect(nl.groups.flatMap((g) => g.items).map((i) => i.rowId)).not.toContain('rig_kits:1')
  })

  it('names one in place, and the check clears it', () => {
    const w = world()
    const line = nameless(w).groups[0]!.items[0]!
    const done = apply(
      sheet(w),
      nameLineCommand(line.tableId, line.tableName, line.rowId, line.nameField.id, '  KR 2010 ')!,
      '2026-10-22T09:00:00.000Z',
    )
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    expect(done.said).toBe('A line in Mackay Trailers is now called “KR 2010”.')
    expect(nameless({ entities: done.next.tables, rowsByEntity: done.next.rows }).count).toBe(6)
  })

  it('finds the four twins and renames one so it stands alone', () => {
    const w = world()
    const r = review(w)
    expect(r.twins.count).toBe(4)
    const trade = r.twins.items.find((t) => t.name === 'Trade Price')!
    expect(trade.tableName).toBe('Rigging Kits')
    expect(trade.columns.map((c) => c.after)).toEqual(['Kit Sell Price', 'Sell Price'])
    const done = apply(
      sheet(w),
      nameTwinCommand(
        trade.tableId,
        trade.columns[1]!.fieldId,
        'Trade Price',
        'Install Trade Price',
      )!,
      '2026-10-22T09:00:00.000Z',
    )
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    expect(review({ entities: done.next.tables, rowsByEntity: done.next.rows }).twins.count).toBe(3)
  })
})

describe('the whole review', () => {
  it('counts every finding still standing, and folds the 138 tidy marks', () => {
    const r = review(world())
    expect(r.open).toBe(9 + 3 + 46 + 4 + 7)
    expect(r.open).toBe(69)
    expect(r.tidyCount).toBe(138)
    expect(r.tidy.reduce((n, t) => n + t.count, 0)).toBe(r.tidyCount)
    expect(r.tidy[0]).toMatchObject({ ruleId: 'text-low-cardinality', count: 108 })
  })

  it('reads clean on a file with nothing wrong', () => {
    const r = review({ entities: {}, rowsByEntity: {} })
    expect(r.open).toBe(0)
    expect(r.band.tested).toBe(0)
    expect(r.tidyCount).toBe(0)
    expect(r.noPrice.lists).toEqual([])
    expect(r.twoPrices.widest).toBeNull()
    expect([r.band.notChargedOn, r.band.chargedOverOn]).toEqual([0, 0])
  })
})
