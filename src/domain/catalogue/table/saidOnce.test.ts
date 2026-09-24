import { describe, expect, it } from 'vitest'
import { rowLabel, type EntityDef, type FieldDef } from '@/domain/model'
import type { ViewRow } from '@/domain/catalogue/table/core'
import { loadPack } from '@/test/fixtures/pack'
import { buildGroups, groupKey, leafFieldsOf } from './grouping'
import { outlineLevels, viewRowsOf } from './outline'
import { saidAlong, saidOnce } from './saidOnce'

/* ============================================================
   SAID ONCE, MEASURED ON THE REAL PACK.

   Every figure below is counted a second way off `data/northside/`
   — a plain distinct-value count per column, written here without
   the function under test — and the two readings are asserted equal.
   Nothing is typed: not how many columns Highfield says once for the
   whole table, not which ones Roll-Up shares, not how many models
   hold one value in a spec column.
   ============================================================ */

const pack = await loadPack()
const tables: Record<string, EntityDef> = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
const rowsOf = (e: EntityDef) => pack.rowsByEntity[e.id] ?? []
const refLabel = (refEntityId: string | undefined, rowId: string): string | undefined => {
  const target = refEntityId ? tables[refEntityId] : undefined
  const row = target ? rowsOf(target).find((r) => r.id === rowId) : undefined
  return target && row ? rowLabel(target, row) : undefined
}

const setUp = (id: string) => {
  const table = pack.byKey(id)
  const view = viewRowsOf(table, rowsOf(table), refLabel)
  const levels = outlineLevels(table, tables)
  const fields = leafFieldsOf(table.fields, levels)
  const roots = buildGroups(view, levels, (r, f) => r.text[f] ?? '')
  return { table, view, levels, fields, roots, said: saidOnce(view, fields, roots) }
}

/** The second reading: the columns whose text is one value across these rows. */
const constantIn = (rows: readonly ViewRow[], fields: readonly FieldDef[]): string[] =>
  rows.length < 2
    ? []
    : fields
        .filter((f) => new Set(rows.map((r) => (r.text[f.id] ?? '').trim())).size === 1)
        .map((f) => f.id)

describe('saidOnce on Highfield Inflatables', () => {
  const hf = setUp('boat_highfield')
  const [seriesId, modelId] = hf.levels as [string, string]

  it('says once, for the whole table, exactly the columns that hold one value on every row', () => {
    const constant = constantIn(hf.view, hf.fields)
    const filled = constant.filter((id) => hf.view[0]!.text[id]!.trim() !== '')
    const blank = constant.filter((id) => hf.view[0]!.text[id]!.trim() === '')
    expect(hf.said.table.map((s) => s.fieldId)).toEqual(filled)
    expect(hf.said.empty).toEqual(blank)
    expect(filled.length).toBeGreaterThan(0)
    /* Matrix is the one the critic named: "Highfield Inflatables" on all 588 */
    const matrix = hf.table.fields.find((f) => f.name === 'Matrix')!
    expect(hf.said.table.find((s) => s.fieldId === matrix.id)?.text).toBe(
      String(rowsOf(hf.table)[0]!.values[matrix.id]),
    )
  })

  it('says once for each series what its rows share and the table did not already say', () => {
    const tableIds = new Set(constantIn(hf.view, hf.fields))
    for (const series of hf.roots) {
      const rows = hf.view.filter((r) => r.text[seriesId] === series.value)
      const expected = constantIn(rows, hf.fields).filter((id) => !tableIds.has(id))
      expect(hf.said.groups.get(series.key)?.map((s) => s.fieldId)).toEqual(expected)
    }
    /* the first screen's band says something: Roll-Up shares more than the file does */
    expect(hf.said.groups.get(hf.roots[0]!.key)!.length).toBeGreaterThan(0)
  })

  it('says once for each model what its variants share, below the series', () => {
    const tableIds = new Set(constantIn(hf.view, hf.fields))
    let models = 0
    let saying = 0
    for (const series of hf.roots) {
      const seriesRows = hf.view.filter((r) => r.text[seriesId] === series.value)
      const seriesIds = new Set(constantIn(seriesRows, hf.fields))
      for (const model of series.children) {
        models += 1
        const rows = seriesRows.filter((r) => r.text[modelId] === model.value)
        const expected = constantIn(rows, hf.fields).filter(
          (id) => !tableIds.has(id) && !seriesIds.has(id),
        )
        expect(hf.said.groups.get(model.key)?.map((s) => s.fieldId)).toEqual(expected)
        if (expected.length > 0) saying += 1
      }
    }
    expect(models).toBe(new Set(hf.view.map((r) => `${r.text[seriesId]}|${r.text[modelId]}`)).size)
    expect(saying).toBeGreaterThan(models / 2)
  })

  it('settles a column only when no model of two or more variants varies in it', () => {
    const models = hf.roots.flatMap((s) => s.children).filter((m) => m.leaves.length >= 2)
    for (const f of hf.fields) {
      const everywhere =
        constantIn(hf.view, [f]).length === 1 ||
        models.every((m) => constantIn(m.leaves, [f]).length === 1)
      expect(hf.said.settled.has(f.id), f.name).toBe(everywhere)
    }
    /* the figures and the code differ inside a model, and are never settled */
    for (const name of ['Cash', 'Trade', 'Warranty', 'Model Code', 'Variant']) {
      const f = hf.table.fields.find((x) => x.name === name)!
      expect(hf.said.settled.has(f.id), name).toBe(false)
    }
  })

  it('says where a spec went even where one model of many varies in it', () => {
    const inner = hf.roots.flatMap((s) => s.children).filter((m) => m.leaves.length >= 2)
    const tableIds = new Set(constantIn(hf.view, hf.fields))
    for (const f of hf.fields) {
      const saying = inner.filter(
        (m) => tableIds.has(f.id) || constantIn(m.leaves, [f]).length === 1,
      ).length
      expect(hf.said.mostly.has(f.id), f.name).toBe(
        hf.said.settled.has(f.id) || saying * 2 >= inner.length,
      )
    }
    const length = hf.table.fields.find((x) => x.name === 'OA Length')!
    expect(hf.said.mostly.has(length.id)).toBe(true)
  })

  it('reads a model’s whole story along its path, series first', () => {
    const series = hf.roots[0]!
    const model = series.children[0]!
    const along = saidAlong(hf.said, model.path)
    expect(along).toEqual([
      ...(hf.said.groups.get(groupKey([series.value])) ?? []),
      ...(hf.said.groups.get(model.key) ?? []),
    ])
  })
})

describe('a drawer of one row says nothing once', () => {
  it('leaves every column on the row of a pairing where each hull has one trailer', () => {
    const trl = setUp('join_hf_trl')
    const single = trl.roots.filter((n) => n.leafCount === 1)
    expect(single.length).toBeGreaterThan(0)
    for (const node of single) expect(trl.said.groups.get(node.key)).toEqual([])
    /* with no hull of two trailers to measure against, nothing but the
       table's own constants is settled — so the trailer stays a column */
    const trailer = trl.fields.find((f) => f.name === 'Trailer')!
    const plural = trl.roots.filter((n) => n.leafCount >= 2)
    const settledAnyway =
      constantIn(trl.view, [trailer]).length === 1 ||
      (plural.length > 0 && plural.every((n) => constantIn(n.leaves, [trailer]).length === 1))
    expect(trl.said.settled.has(trailer.id)).toBe(settledAnyway)
    expect(settledAnyway).toBe(false)
    expect(trl.said.settled.size).toBe(constantIn(trl.view, trl.fields).length)
  })

  it('on a flat table, says only what the whole table shares', () => {
    const flat = setUp('boat_formosa')
    expect(flat.levels).toEqual([])
    expect(flat.said.groups.size).toBe(0)
    const constant = constantIn(flat.view, flat.fields)
    expect(flat.said.settled.size).toBe(constant.length)
  })
})
