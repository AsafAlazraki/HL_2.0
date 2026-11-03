/* ============================================================
   REVIEW, THE VERIFIER'S ROUND 1 CLOSED, on the real price list:
   the clean day counted as it is said (`leftDay.ts`), the price
   list's other rules said with their measures (`houseHeld.ts`), and
   what is new and what was settled since the price file (`since.ts`).
   Every figure here is measured on the pack of 16 September 2026.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { apply, isDone } from '@/domain/catalogue/commands'
import { indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { rowLabel, type EntityDef, type RowData } from '@/domain/model'
import { review, type ReviewWorld } from './checks'
import { queueOf, type Case } from './cases'
import { countedByKind, distinctLines } from './leftDay'
import { houseHeld } from './houseHeld'
import { aboutOf, listsWrittenSince, sinceTheFile, worldAsFiled } from './since'
import { priceLinesCommand } from './fixes'
import { wrongOnQuote } from './onQuote'

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
    business: 'Northside Marine',
    tables: w.entities as Record<string, EntityDef>,
    rows,
    rowIndex: indexRows(rows),
    modules: {},
    priceLevels: {},
    constraintDefs: [],
  } as unknown as CatalogueData
}

const fileCounts = Object.fromEntries(pack.manifest.tables.map((t) => [t.id, t.rowCount]))
const packedAt = pack.manifest.packedAt
const queue = queueOf(review(world()))

describe('the clean day, counted as it is said', () => {
  it('splits the 9 trailers into 7 charged $819 too little and 2 charged $234 too much', () => {
    const band = countedByKind(queue).band!
    expect([band.cases, band.lines]).toEqual([9, 9])
    expect(band.under).toEqual({ n: 7, sum: 819 })
    expect(band.over).toEqual({ n: 2, sum: 234 })
  })

  it('counts 4 lines below cost, not the 6 findings: 2 of them at both their prices', () => {
    const cost = countedByKind(queue).cost!
    expect([cost.cases, cost.findings, cost.lines, cost.twice]).toEqual([2, 6, 4, 2])
  })

  it('counts a line once however many cases stand on it', () => {
    const cost = queue.filter((c) => c.kind === 'cost')
    expect(distinctLines(cost)).toBe(4)
  })
})

describe('the price list’s other rules', () => {
  it('says the rules that hold with their measure, and the workbook’s 16 where it differs', () => {
    const { held } = houseHeld(world())
    expect(held.map((h) => [h.ref, h.here.held, h.here.tested])).toEqual([
      ['F8', 626, 626],
      ['A1', 1448, 1448],
      ['F15', 501, 501],
    ])
    /* the workbook counted 16 offers breaking the kit rule; this price list has none */
    const f15 = held.find((h) => h.ref === 'F15')!
    expect(f15.workbook).toEqual({ held: 555, tested: 571 })
    expect(held.filter((h) => h.workbook !== null).map((h) => h.ref)).toEqual(['F15'])
  })

  it('says why the propeller rule, the workbook’s 127, cannot be tested on this price list', () => {
    const { untested } = houseHeld(world())
    expect(untested.map((u) => u.ref)).toEqual(['A3'])
    const a3 = untested[0]!
    expect(a3.workbook).toEqual({ held: 3890, tested: 4017 })
    expect(a3.unwritten).toEqual([
      { list: 'Yamaha Outboards', field: 'Prop', written: 'Opt', lines: 181, of: 209 },
    ])
  })
})

describe('since the price file', () => {
  it('reads no list from the file while every list is as it was packed', () => {
    expect(listsWrittenSince(world().entities, world().rowsByEntity, packedAt, fileCounts)).toEqual(
      [],
    )
  })

  it('finds nothing settled and nothing new on the file as it came', () => {
    const since = sinceTheFile(queue, queue)
    expect([since.settled.length, since.arrived.length]).toEqual([0, 0])
  })

  it('says two winch kits priced here as settled, and a priced line set to $0 as new', () => {
    const lone = queue.find(
      (c): c is Extract<Case, { kind: 'none' }> =>
        c.kind === 'none' && (c.group.category ?? '').includes('Lone Star'),
    )!
    const two = lone.group.lines.slice(0, 2)
    const at = '2026-11-04T00:00:00.000Z'
    const priced = apply(
      sheet(world()),
      priceLinesCommand(
        lone.group.tableId,
        lone.group.tableName,
        lone.group.priceFieldId,
        'Sell',
        two.map((l) => ({ rowId: l.rowId, name: l.name, price: 2150 })),
      )!,
      at,
    )
    expect(isDone(priced)).toBe(true)
    if (!isDone(priced)) return
    /* and a line that had a price is given $0 at every price its list declares */
    const parts = priced.next.tables['parts']!
    const pricedLine = priced.next.rows['parts']!.find(
      (r) => typeof r.values['parts.l'] === 'number' && (r.values['parts.l'] as number) > 0,
    )!
    const atL = apply(
      priced.next,
      priceLinesCommand('parts', parts.name, 'parts.l', 'Sell', [
        { rowId: pricedLine.id, name: 'it', price: 0 },
      ])!,
      at,
    )
    if (!isDone(atL)) throw new Error('refused')
    const zeroed = apply(
      atL.next,
      priceLinesCommand('parts', parts.name, 'parts.y', 'Sell inc Install', [
        { rowId: pricedLine.id, name: 'it', price: 0 },
      ])!,
      at,
    )
    expect(isDone(zeroed)).toBe(true)
    if (!isDone(zeroed)) return
    const now: ReviewWorld = { entities: zeroed.next.tables, rowsByEntity: zeroed.next.rows }
    const lists = listsWrittenSince(now.entities, now.rowsByEntity, packedAt, fileCounts)
    expect(lists).toEqual([lone.group.tableId, 'parts'].filter((v, i, a) => a.indexOf(v) === i))
    /* the lists as the file carries them are the pack's own: the queue found on them is the
       queue of the file */
    const filed = worldAsFiled(
      now,
      {
        entities: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
        rows: pack.rowsByEntity,
      },
      lists,
    )
    const asFiled = queueOf(review(filed))
    expect(asFiled.length).toBe(queue.length)
    const since = sinceTheFile(asFiled, queueOf(review(now)))
    /* the two kits priced are settled, the case cut to them */
    expect(since.settled.map((c) => [c.kind, c.key])).toEqual([['none', lone.key]])
    const settled = since.settled[0] as Extract<Case, { kind: 'none' }>
    expect(settled.group.lines.map((l) => l.rowId)).toEqual(two.map((l) => l.rowId))
    /* the line given $0 at both its prices is new, a case cut to it alone */
    expect(since.arrived.map((c) => c.kind)).toEqual(['none'])
    const arrived = since.arrived[0] as Extract<Case, { kind: 'none' }>
    expect(arrived.group.lines.map((l) => l.rowId)).toEqual([pricedLine.id])
  })

  it('knows a finding by what it is about, never by the value that made it', () => {
    const band = queue.find((c) => c.kind === 'band')!
    const moved =
      band.kind === 'band' ? { ...band, line: { ...band.line, key: `${band.line.key}9` } } : band
    expect(aboutOf(band, band.kind === 'band' ? band.line.key : '')).toEqual(
      aboutOf(moved, moved.kind === 'band' ? moved.line.key : ''),
    )
  })
})

describe('what Review finds on a quote’s own lines, said in the build', () => {
  const lines = (...rows: Array<[string, string]>) =>
    rows.map(([entityId, rowId], i) => {
      const r = pack.rowsByEntity[entityId]!.find((x) => x.id === rowId)!
      const t = pack.entities.find((e) => e.id === entityId)!
      const name = rowLabel(t, r)
      return { id: `l${i}`, entityId, rowId, label: String(name) }
    }) as unknown as import('@/domain/model').QuoteDef['lines']
  const quoteOf = (ls: import('@/domain/model').QuoteDef['lines']) => ({
    lines: ls,
    sections: [],
    rootTableId: '',
    subjectLabel: '',
  })

  it('says a trailer registered as the wrong size, with its rego short, and nothing of its cost', () => {
    const band = queue.find((c) => c.kind === 'band')!
    if (band.kind !== 'band') return
    const said = wrongOnQuote(world(), quoteOf(lines([band.line.tableId, band.line.rowId])))
    expect(said.map((s) => s.kind)).toEqual(['band'])
    expect(said[0]!.said).toMatch(
      /registers the .+ as Small, though it is rated 1,450 kg, so its rego is \$117 short\. Review has it\.$/,
    )
    expect(said[0]!.said).not.toMatch(/cost/i)
  })

  it('says one name at two prices, with the one the quote has', () => {
    const two = queue.find((c) => c.kind === 'two')!
    if (two.kind !== 'two') return
    const line = two.item.lines[0]!
    const said = wrongOnQuote(world(), quoteOf(lines([two.tableId, line.rowId])))
    expect(said.map((s) => s.kind)).toEqual(['two'])
    expect(said[0]!.said).toContain(
      `this quote has the line at $${line.price.toLocaleString('en-AU')}`,
    )
  })

  it('never says a line below its cost, and nothing Northside left alone', () => {
    const cost = queue.find((c) => c.kind === 'cost')!
    const band = queue.find((c) => c.kind === 'band')!
    if (cost.kind !== 'cost' || band.kind !== 'band') return
    const q = quoteOf(
      lines([cost.group.tableId, cost.group.lines[0]!.rowId], [band.line.tableId, band.line.rowId]),
    )
    expect(wrongOnQuote(world(), q).map((s) => s.kind)).toEqual(['band'])
    expect(wrongOnQuote(world(), q, { [band.line.key]: 'meant x' })).toEqual([])
  })
})
