/* ============================================================
   REVIEW, DEEPENED (the judge of 2026-11-04), on the real price list:
   the checks the file honestly carries and the old five did not, the
   queue ordered by what a case risks on a quote, what was left alone
   split from what stands, the quotes a case touches, and the whole
   queue found by typing. Every figure here is measured on the pack.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { apply, isDone } from '@/domain/catalogue/commands'
import { indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import {
  DISCONTINUED_FIELD_ID,
  isDiscontinued,
  type EntityDef,
  type QuoteDef,
  type RowData,
} from '@/domain/model'
import { review, type ReviewWorld } from './checks'
import { CASE_KINDS, casesByKind, linesOfCase, meantKeysOf, queueOf } from './cases'
import { belowCost, costBeside } from './belowCost'
import { houseBreaks } from './houseBreaks'
import { isEmptyLine, isNoteName, notesOnSale, saysWhatItComesWith, sourceOf } from './notes'
import { meantFrom, moneyOfCases, readStamp, restrict, stampOf, standingOf } from './standing'
import { quotesTouching } from './touching'
import { readOrg } from '@/domain/northside/read'
import { caseFound, wordsOfCase, writtenSince } from './finding'
import {
  bringBackCommand,
  leaveCommand,
  nameApartCommand,
  nameApartRefusal,
  offSaleCommand,
} from './fixes'

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

describe('the checks the file carries', () => {
  it('finds 4 of the 2,095 parts sold below their CTD, and 2 of the 2,196 fitted', () => {
    const cost = belowCost(world())
    const supply = cost.groups.find((g) => g.key === 'cost:parts:parts.l')!
    const fitted = cost.groups.find((g) => g.key === 'cost:parts:parts.y')!
    expect([supply.lines.length, supply.tested]).toEqual([4, 2095])
    expect([fitted.lines.length, fitted.tested]).toEqual([2, 2196])
    expect(supply.lines.map((l) => l.name)).toContain('Battery, Lithium 12v 50Amp (Bluetooth)')
    /* the cost each price is set against is read off the list's own layout */
    const parts = world().entities['parts']!
    expect(costBeside(parts, 'parts.l')?.name).toBe('CTD')
    expect(costBeside(parts, 'parts.y')?.name).toBe('Total CTD')
    /* a finding never carries what the line costs */
    for (const l of supply.lines)
      expect(Object.keys(l).sort()).toEqual(['key', 'name', 'price', 'rowId'])
  })

  it('finds the 3 offers that break the shaft rule, and nothing on a rule never refused', () => {
    const house = houseBreaks(world())
    expect(house.clauses.map((c) => [c.ref, c.held, c.tested, c.breaks.length])).toEqual([
      ['F6', 3289, 3292, 3],
    ])
    for (const b of house.clauses[0]!.breaks) expect(b.boat).toMatch(/^Stacer /)
  })

  it('reads a note by the file’s own opening words, and an empty line by nothing on it', () => {
    expect(isNoteName('OBSOLETE PARTS (NB: Parts No Longer Available or Used)')).toBe(true)
    expect(isNoteName('NB: Fuel Filter - Order w Rigging Kit')).toBe(true)
    /* a product that only carries a note in brackets is still a product */
    expect(isNoteName('Transom Mount Prop Light (NB: 2 Required)')).toBe(false)
    expect(saysWhatItComesWith('Trailer Plug - Std Factory Fit (7 Pin Flat)')).toBe(true)
    expect(saysWhatItComesWith('Reef Anchor Kit - 8mm w 50mtr Rope & 4mtr Chain')).toBe(false)

    const notes = notesOnSale(world())
    expect(notes.groups.map((g) => [g.tableId, g.lines.length])).toEqual([
      ['trl_mackay', 3],
      ['parts', 6],
      ['rig_kits', 1],
    ])
    const parts = world().entities['parts']!
    const blank = pack.rowsByEntity['parts']!.find((r) => r.id === 'parts:2228')!
    expect(isEmptyLine(parts, blank)).toBe(true)
    expect(sourceOf(parts, blank)).toEqual({ tab: 'Parts Maintenance', line: 2905 })
  })
})

describe('the queue, by what it risks on a quote', () => {
  const r = review(world())
  const q = queueOf(r)

  it('holds 39 cases in nine checks, a $0 boat first', () => {
    expect(q).toHaveLength(39)
    expect(casesByKind(q)).toEqual({
      boat: 1,
      band: 9,
      cost: 2,
      two: 3,
      none: 15,
      note: 3,
      house: 1,
      twins: 4,
      nameless: 1,
    })
    expect(q[0]?.kind).toBe('boat')
    const order = q.map((c) => CASE_KINDS.indexOf(c.kind))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    /* the no-price lines no longer hold a note */
    expect(r.noPrice.count).toBe(43)
    expect(r.open).toBe(79)
  })

  it('names every line a case stands on, each with the key that leaves it alone', () => {
    for (const c of q) {
      const lines = linesOfCase(c)
      if (c.kind === 'twins') expect(lines).toEqual([])
      else for (const l of lines) expect(meantKeysOf(c)).toContain(l.key)
    }
  })
})

describe('what was left alone, split from what stands', () => {
  const q = queueOf(review(world()))

  it('reads a stamp back: its reason, its instant and its person', () => {
    expect(readStamp(stampOf('wrong', '2026-11-04T09:12:00.000Z', 'Asaf'))).toEqual({
      as: 'wrong',
      at: '2026-11-04T09:12:00.000Z',
      who: 'Asaf',
    })
    /* a stamp from before the person was written names nobody */
    expect(readStamp('meant 2026-10-22T01:00:00.000Z')).toEqual({
      as: 'meant',
      at: '2026-10-22T01:00:00.000Z',
      who: '',
    })
  })

  it('leaves a case alone line by line, and the open queue matches Review run with it', () => {
    const lone = q.find((c) => c.key === 'none:parts:ANCHOR WINCHES - Lone Star:blank')!
    const [one] = meantKeysOf(lone)
    const meant = { [one!]: stampOf('meant', '2026-11-04T00:00:00.000Z', 'Asaf') }
    const { open, left } = standingOf(q, meant)
    expect(open).toHaveLength(39)
    expect(left).toHaveLength(1)
    expect(meantKeysOf(left[0]!.c)).toEqual([one])
    expect(left[0]!.stamp.who).toBe('Asaf')
    /* one figure: the screen's split and Data's door, which runs review() with the record */
    expect(open.reduce((n, c) => n + meantKeysOf(c).length, 0)).toBe(review(world(), meant).open)
  })

  it('says the money left alone as left, never as $0', () => {
    const every = Object.fromEntries(q.flatMap(meantKeysOf).map((k) => [k, 'meant x']))
    const { open, left } = standingOf(q, every)
    expect(open).toEqual([])
    expect(moneyOfCases(left.map((l) => l.c))).toEqual({
      notCharged: 819,
      chargedOver: 234,
      under: 7,
      over: 2,
    })
    expect(restrict(q[0]!, () => false)).toBeNull()
  })

  it('reads the profile over this computer', () => {
    expect(meantFrom({ a: 'meant 1' }, { a: 'wrong 0', b: 'meant 0' })).toEqual({
      a: 'meant 1',
      b: 'meant 0',
    })
  })
})

describe('the quotes a case touches, and the queue found by typing', () => {
  const w = world()
  const q = queueOf(review(w))

  it('names the quotes that carry a line a case names, and only those', () => {
    const formosa = q.find((c) => c.kind === 'boat')!
    const line = linesOfCase(formosa)[0]!
    const quote = {
      id: 'q1',
      reference: '20261104-01',
      state: 'draft',
      rootTableId: line.tableId,
      rootRowId: line.rowId,
      subjectLabel: 'Formosa - SRT 715 (Territory)',
      lines: [],
      customer: { name: 'A walk-in' },
    } as unknown as QuoteDef
    const touched = quotesTouching(q, [quote])
    expect([...touched.keys()]).toEqual([formosa.key])
    expect(touched.get(formosa.key)).toMatchObject([
      { id: 'q1', state: 'draft', who: 'A walk-in', carries: 'boat' },
    ])
  })

  it('finds a case by its list, its maker or its line, every word typed', () => {
    const words = new Map(q.map((c) => [c.key, wordsOfCase(c, w.entities, w.rowsByEntity)]))
    const found = (typed: string) => q.filter((c) => caseFound(words.get(c.key)!, typed))
    expect(found('lone star').map((c) => c.key)).toEqual([
      'none:parts:ANCHOR WINCHES - Lone Star:blank',
    ])
    expect(found('formosa').map((c) => c.kind)).toEqual(['boat'])
    expect(found('')).toHaveLength(39)
    expect(found('Y10A-VW')).toHaveLength(1)
  })

  it('marks a case new where a line it stands on was written after the file was packed', () => {
    const band = q.find((c) => c.kind === 'band')!
    const line = linesOfCase(band)[0]!
    const rows = { ...w.rowsByEntity }
    const packedAt = pack.rowsByEntity[line.tableId]![0]!.updatedAt
    expect(writtenSince(band, rows, packedAt)).toBe(false)
    rows[line.tableId] = rows[line.tableId]!.map((r) =>
      r.id === line.rowId ? { ...r, updatedAt: '2099-01-01T00:00:00.000Z' } : r,
    )
    expect(writtenSince(band, rows, packedAt)).toBe(true)
  })
})

describe('the fixes a line needs, each one step with its inverse', () => {
  it('takes lines off sale, giving a list the Discontinued column it lacks, and puts it back', () => {
    const data = sheet(world())
    const ids = pack.rowsByEntity['boat_formosa']!.slice(0, 2).map((r) => r.id)
    const out = apply(data, offSaleCommand('boat_formosa', ids, 'Two are off sale.')!, 'n')
    expect(isDone(out)).toBe(true)
    if (!isDone(out)) return
    const has = (d: CatalogueData): boolean =>
      d.tables['boat_formosa']!.fields.some((f) => f.id === DISCONTINUED_FIELD_ID)
    expect(has(out.next)).toBe(true)
    expect(out.next.rows['boat_formosa']!.filter(isDiscontinued)).toHaveLength(2)
    const back = apply(out.next, out.inverse, 'n')
    expect(isDone(back)).toBe(true)
    if (!isDone(back)) return
    expect(back.next.rows['boat_formosa']!.filter(isDiscontinued)).toHaveLength(0)
    expect(has(back.next)).toBe(false)
  })

  it('names two lines apart only when both names are written and differ', () => {
    expect(nameApartRefusal(['A', ''], 'A')).toBe('Type a name for each of them first.')
    expect(nameApartRefusal(['A', 'a'], 'A')).toBe(
      'Both are still called “A”. Change at least one.',
    )
    expect(nameApartRefusal(['B', 'b'], 'A')).toMatch(/^The names are the same/)
    expect(nameApartRefusal(['A', 'B'], 'A')).toBe('')
    expect(
      nameApartCommand('parts', 'parts.c', 'A', [
        { rowId: 'x', name: 'B' },
        { rowId: 'y', name: 'b' },
      ]),
    ).toBeNull()
  })

  it('says which code took which name, and never speaks the old name again', () => {
    const was = 'Outboard Vented Cover - YAMAHA 4 CYL 2.8L F150D F175A F200F (2023>)'
    const data = sheet(world())
    const out = apply(
      data,
      nameApartCommand('parts', 'parts.c', was, [
        { rowId: 'parts:399', code: 'Y10A-V', name: `${was} Grey` },
        { rowId: 'parts:400', code: 'Y10A-VW', name: was },
      ])!,
      'n',
    )
    expect(isDone(out)).toBe(true)
    if (!isDone(out)) return
    expect(out.said).toBe(`Code Y10A-V is now “${was} Grey”, and code Y10A-VW keeps its name.`)
    expect(out.next.rows['parts']!.find((r) => r.id === 'parts:399')?.values['parts.c']).toBe(
      `${was} Grey`,
    )
  })

  it('leaves keys alone on Northside’s profile and brings them back, each with its Undo', () => {
    const data = sheet(world())
    const left = apply(data, leaveCommand(['k1', 'k2'], 'meant t Asaf', 'Left.'), 'n')
    expect(isDone(left)).toBe(true)
    if (!isDone(left)) return
    expect(left.next.org?.leftAlone).toEqual({ k1: 'meant t Asaf', k2: 'meant t Asaf' })
    const back = apply(left.next, bringBackCommand(['k1'], 'Back.'), 'n')
    expect(isDone(back) && back.next.org?.leftAlone).toEqual({ k2: 'meant t Asaf' })
    const undone = apply(left.next, left.inverse, 'n')
    expect(isDone(undone) && undone.next.org?.leftAlone).toBeUndefined()
    /* and it is read back the way the store reads Northside's profile off this computer */
    expect(readOrg(JSON.parse(JSON.stringify(left.next.org)))?.leftAlone).toEqual({
      k1: 'meant t Asaf',
      k2: 'meant t Asaf',
    })
  })
})
