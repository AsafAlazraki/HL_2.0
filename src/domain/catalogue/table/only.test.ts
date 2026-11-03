import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, FieldDef } from '@/domain/model'
import { isCostColumn, priceLevelsFor } from '@/domain/quote/pricing'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { viewRowsOf } from './outline'
import type { ViewRow } from './core'
import {
  applyOnly,
  comparable,
  costFor,
  figureIn,
  joinOnly,
  keptRules,
  onlySaid,
  questionsOf,
  readOnly,
  ruleSaid,
  warningsFor,
  type Only,
} from './only'

/* ============================================================
   THE SHEET'S QUESTIONS AND ITS CHECKS, MEASURED ON THE REAL PACK.
   Every count below is walked out of the file here and compared; no
   figure is typed into an assertion except a value a person would
   type (850 in Cash, 150 in a comparison).
   ============================================================ */

let pack: PackFixture
beforeAll(async () => {
  pack = await loadPack()
})

const table = (id: string): EntityDef => pack.byKey(id)
const view = (id: string): ViewRow[] => viewRowsOf(table(id), pack.rowsByEntity[id] ?? [])
const field = (t: EntityDef, name: string): FieldDef => t.fields.find((f) => f.name === name)!
const cost = (t: EntityDef) => (f: FieldDef) => isCostColumn(t, f)
const prices = (t: EntityDef) => priceLevelsFor(t).map((l) => ({ fieldId: l.fieldId }))
const num = (v: unknown): number | null => (typeof v === 'number' ? v : null)

describe('a question in the address', () => {
  it('reads back what it wrote, and drops what names no column of the list', () => {
    const hf = table('boat_highfield')
    const list: Only[] = [
      { kind: 'empty', fieldId: field(hf, 'Trade').id },
      { kind: 'under', fieldId: field(hf, 'Cash').id, than: field(hf, 'Landed Hull Cost').id },
      { kind: 'at-least', fieldId: field(hf, 'Boat Weight kg').id, value: 150 },
      { kind: 'changed' },
    ]
    const param = joinOnly(list)
    expect(readOnly(param, hf)).toEqual(list)
    expect(
      readOnly(`${param},empty~no_such.column,under~x,at-least~${field(hf, 'Cash').id}~abc`, hf),
    ).toEqual(list)
    expect(joinOnly([])).toBeUndefined()
  })

  it('says each question as a person asks it', () => {
    const hf = table('boat_highfield')
    expect(onlySaid(hf, { kind: 'empty', fieldId: field(hf, 'Trade').id })).toBe('No Trade')
    expect(onlySaid(hf, { kind: 'empty', fieldId: field(hf, 'Image Link').id })).toBe('No picture')
    expect(
      onlySaid(hf, { kind: 'under', fieldId: field(hf, 'Cash').id, than: field(hf, 'Trade').id }),
    ).toBe('Cash under Trade')
    expect(onlySaid(hf, { kind: 'at-least', fieldId: field(hf, 'Max HP').id, value: 150 })).toBe(
      'Max HP at least 150',
    )
  })

  it('reads a figure that opens a text, the way the file types horsepower', () => {
    expect(figureIn('250 HP')).toBe(250)
    expect(figureIn('1,300')).toBe(1300)
    expect(figureIn('TBA')).toBeNull()
    expect(figureIn(42)).toBe(42)
  })
})

describe('the lines a question keeps', () => {
  it('keeps every Highfield line whose Max HP is at least 150, and only those, counted off the file', () => {
    const hf = table('boat_highfield')
    const rows = view('boat_highfield')
    const max = field(hf, 'Max HP')
    const want = rows.filter((r) => (figureIn(r.values[max.id]) ?? -1) >= 150).length
    const got = applyOnly(rows, [{ kind: 'at-least', fieldId: max.id, value: 150 }])
    expect(got).toHaveLength(want)
    expect(want).toBeGreaterThan(0)
    expect(comparable(hf, rows).map((f) => f.name)).toContain('Max HP')
  })

  it('keeps the discontinued parts, as many as the file marks', () => {
    const parts = table('parts')
    const rows = view('parts')
    const disc = field(parts, 'Discontinued')
    const want = rows.filter((r) => r.values[disc.id] === true).length
    expect(applyOnly(rows, [{ kind: 'yes', fieldId: disc.id }])).toHaveLength(want)
  })

  it('keeps a changed line only where the changes are known', () => {
    const rows = view('boat_highfield')
    const one = rows[3]!.rowId
    expect(applyOnly(rows, [{ kind: 'changed' }], { changed: new Set([one]) })).toHaveLength(1)
    expect(applyOnly(rows, [{ kind: 'changed' }])).toHaveLength(0)
  })
})

describe('the rules the file keeps', () => {
  it('holds Highfield’s Cash against its landed cost and its Trade, each counted over the lines with both', () => {
    const hf = table('boat_highfield')
    const rows = view('boat_highfield')
    const cash = field(hf, 'Cash')
    const landed = field(hf, 'Landed Hull Cost')
    const trade = field(hf, 'Trade')
    expect(costFor(hf, cash, cost(hf))?.id).toBe(landed.id)
    const rules = keptRules(hf, rows, prices(hf), cost(hf))
    const both = (a: FieldDef, b: FieldDef) =>
      rows.filter((r) => num(r.values[a.id]) !== null && num(r.values[b.id]) !== null)
    const overLanded = both(cash, landed)
    const holdsLanded = overLanded.filter(
      (r) => num(r.values[cash.id])! >= num(r.values[landed.id])!,
    )
    const r1 = rules.find((r) => r.fieldId === cash.id && r.than === landed.id)!
    expect(r1).toBeDefined()
    expect(r1.of).toBe(overLanded.length)
    expect(r1.holds).toBe(holdsLanded.length)
    expect(r1.cost).toBe(true)
    expect(ruleSaid(r1)).toBe(
      `on ${r1.holds.toLocaleString('en-AU')} of ${r1.of.toLocaleString('en-AU')} lines with both`,
    )
    const r2 = rules.find((r) => r.fieldId === cash.id && r.than === trade.id)!
    expect(r2.of).toBe(both(cash, trade).length)
  })

  it('files a part’s Sell against the CTD of its own section, and its fitted price against Total CTD', () => {
    const parts = table('parts')
    expect(costFor(parts, field(parts, 'Sell'), cost(parts))?.name).toBe('CTD')
    expect(costFor(parts, field(parts, 'Sell inc Install (if appl.)'), cost(parts))?.name).toBe(
      'Total CTD',
    )
  })

  it('warns when $850 is written in Cash on the line with Landed Hull Cost above it, cost first', () => {
    const hf = table('boat_highfield')
    const rows = view('boat_highfield')
    const cash = field(hf, 'Cash')
    const landed = field(hf, 'Landed Hull Cost')
    const line = rows.find((r) => (num(r.values[landed.id]) ?? 0) > 850)!
    const warned = warningsFor(hf, rows, prices(hf), cost(hf), line.rowId, cash.id, 850)
    expect(warned.length).toBeGreaterThan(0)
    expect(warned[0]!.rule.than).toBe(landed.id)
    expect(warned[0]!.than).toBe(num(line.values[landed.id]))
    /* the line's own figure is not in the count it is judged by */
    expect(warned[0]!.rule.of).toBe(
      rows.filter(
        (r) =>
          r.rowId !== line.rowId &&
          num(r.values[cash.id]) !== null &&
          num(r.values[landed.id]) !== null,
      ).length,
    )
    expect(warningsFor(hf, rows, prices(hf), cost(hf), line.rowId, cash.id, 999_999)).toEqual([])
  })

  it('asks Highfield the questions its own columns answer, each counted', () => {
    const hf = table('boat_highfield')
    const rows = view('boat_highfield')
    const asked = questionsOf(hf, rows, prices(hf), cost(hf))
    const said = asked.map((q) => q.said)
    expect(said).toContain('No Cash')
    expect(said).toContain('Cash under Landed Hull Cost')
    expect(said).toContain('No picture')
    expect(said).not.toContain('Changed here')
    const noPicture = asked.find((q) => q.said === 'No picture')!
    const image = field(hf, 'Image Link')
    expect(noPicture.count).toBe(
      rows.filter((r) => {
        const v = r.values[image.id]
        return v === null || v === undefined || (Array.isArray(v) && v.length === 0)
      }).length,
    )
  })
})
