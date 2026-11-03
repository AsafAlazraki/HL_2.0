import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { noPrice } from '@/domain/rules/review/checks'
import { queueOf } from '@/domain/rules/review/cases'
import type { EntityDef, RowData } from '@/domain/model'
import { noPriceStandings } from './reviewCase'

/* MEASURED ON THE REAL PRICE LIST: every unpriced part the chandlery sends to Review lands on a
   case Review's own queue holds, and that case names the part. */

let pack: PackFixture
let parts: EntityDef
let rows: RowData[]

beforeAll(async () => {
  pack = await loadPack()
  parts = pack.byKey('parts')
  rows = pack.rowsByEntity[parts.id] ?? []
})

const whole = () =>
  noPrice({
    entities: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
    rowsByEntity: pack.rowsByEntity,
  })

describe('the Review case an unpriced part stands in', () => {
  it('is a case Review’s own queue holds, and the case names the part', () => {
    const standings = noPriceStandings(parts, rows, {})
    expect(standings.size).toBeGreaterThan(0)
    const queue = new Map(queueOf({ ...emptyReview(), noPrice: whole() }).map((c) => [c.key, c]))
    for (const [rowId, standing] of standings) {
      expect('case' in standing).toBe(true)
      if (!('case' in standing)) continue
      const c = queue.get(standing.case)
      expect(c?.kind, `${rowId} lands on ${standing.case}`).toBe('none')
      if (c?.kind === 'none') expect(c.group.lines.map((l) => l.rowId)).toContain(rowId)
    }
  })

  it('finds the Reef Anchor Kits a case of their own, not Review’s first', () => {
    const reef = rows.filter((r) => /reef anchor kit/i.test(String(r.values['parts.c'] ?? '')))
    const standings = noPriceStandings(parts, rows, {})
    const unpriced = reef.filter((r) => standings.has(r.id))
    expect(unpriced.length).toBeGreaterThan(0)
    for (const r of unpriced) expect(standings.get(r.id)).toMatchObject({ case: /^none:parts:/ })
  })

  it('says a line Northside left as meant was left, and puts it in no case', () => {
    const first = [...noPriceStandings(parts, rows, {})][0]!
    const [rowId] = first
    const meant = {
      [`none:${parts.id}:${rowId}:blank`]: '2026-11-03',
      [`none:${parts.id}:${rowId}:zero`]: '2026-11-03',
    }
    expect(noPriceStandings(parts, rows, meant).get(rowId)).toEqual({ meant: true })
  })
})

/** A Review with every other check empty, so the queue holds the no-price cases alone. */
function emptyReview(): Parameters<typeof queueOf>[0] {
  return {
    band: { lines: [] },
    twoPrices: { groups: [] },
    twins: { items: [] },
    nameless: { groups: [] },
  } as unknown as Parameters<typeof queueOf>[0]
}
