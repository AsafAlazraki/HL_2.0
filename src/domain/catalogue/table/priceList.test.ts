import { describe, expect, it } from 'vitest'
import { isImageValue, primaryImage, rowLabel, type EntityDef, type FieldDef } from '@/domain/model'
import { isCostColumn, priceLevelsFor } from '@/domain/quote/pricing'
import type { ViewRow } from '@/domain/catalogue/table/core'
import { loadPack } from '@/test/fixtures/pack'
import { buildGroups, layoutGroups, leafFieldsOf, type GroupNode } from './grouping'
import { ROW_H } from './helpers'
import { outlineLevels, viewRowsOf } from './outline'
import { saidOnce } from './saidOnce'
import {
  blockPicture,
  chaptersOf,
  leadFigures,
  leadLevelOf,
  leadOf,
  leadSplit,
  leavesIn,
  packFacts,
  packOneLine,
  piecesOf,
  readingColumns,
  restOf,
  spineFit,
  type FactRun,
  type PackedLine,
  type SpineMeasure,
} from './priceList'

/* ============================================================
   THE PRICE LIST'S DERIVATIONS, MEASURED ON THE REAL PACK.

   Each figure is counted a second way here, off `data/northside/`,
   without the function under test: how many of Highfield's variants
   are typed `PVC …` or `HYP …`, how many of its models hold a render
   this repository ships, which of its columns a dealer is shown. The
   only numbers written by hand are the spine's own type measures,
   which are the screen's and are said as such.
   ============================================================ */

const pack = await loadPack()
const tables: Record<string, EntityDef> = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
const rowsOf = (e: EntityDef) => pack.rowsByEntity[e.id] ?? []
const refLabel = (refEntityId: string | undefined, rowId: string): string | undefined => {
  const target = refEntityId ? tables[refEntityId] : undefined
  const row = target ? rowsOf(target).find((r) => r.id === rowId) : undefined
  return target && row ? rowLabel(target, row) : undefined
}
const textOf = (r: ViewRow, id: string): string => r.text[id] ?? ''

const setUp = (id: string) => {
  const table = pack.byKey(id)
  const view = viewRowsOf(table, rowsOf(table), refLabel)
  const levels = outlineLevels(table, tables)
  const fields = leafFieldsOf(table.fields, levels)
  const roots = buildGroups(view, levels, textOf)
  const said = saidOnce(view, fields, roots)
  return { table, view, levels, fields, roots, said }
}

const hf = setUp('boat_highfield')
/** the innermost drawers' rows, which is what a leading word splits */
const blocksOf = (roots: readonly GroupNode[]): ViewRow[][] =>
  roots.flatMap((n) => (n.children.length > 0 ? blocksOf(n.children) : [n.leaves]))
const variant = hf.table.fields.find((f) => f.name === 'Variant')!
const field = (t: EntityDef, name: string): FieldDef => t.fields.find((f) => f.name === name)!

/* the held copies, read off the pack's own image ledger */
const held = new Map(
  pack.images.filter((i) => i.file && i.width && i.height).map((i) => [i.address, i]),
)
const heldCopy = (address: string | undefined) => (address ? (held.get(address) ?? null) : null)

/* ---------------------------------------------------------- */

describe('leadSplit — the material, found by counting', () => {
  const split = leadSplit(blocksOf(hf.roots), variant.id)

  it('finds the two words that lead Highfield’s variants, in the order they first appear', () => {
    expect(split).not.toBeNull()
    const leads = new Map<string, number>()
    for (const r of hf.view) {
      const [lead, ...rest] = (r.text[variant.id] ?? '').trim().split(/\s+/)
      if (lead && rest.length > 0) leads.set(lead, (leads.get(lead) ?? 0) + 1)
    }
    const common = [...leads.entries()]
      .filter(([, n]) => n >= Math.ceil(hf.view.length / 10))
      .map(([w]) => w)
    expect(split!.words).toEqual(common)
    expect(split!.words).toHaveLength(2)
  })

  it('cuts the word off only where it leads, and prints every other variant as typed', () => {
    const led = hf.view.filter((r) =>
      split!.words.some((w) => (r.text[variant.id] ?? '').startsWith(`${w} `)),
    )
    let cut = 0
    for (const r of hf.view) {
      const text = r.text[variant.id] ?? ''
      if (restOf(split!, text) !== text.trim()) cut += 1
    }
    expect(cut).toBe(led.length)
    expect(cut).toBeLessThan(hf.view.length)
    /* a variant the word does not lead still names its material */
    const odd = hf.view.find((r) => !led.includes(r) && leadOf(split!, r.text[variant.id]!) !== '')
    expect(odd).toBeDefined()
    expect(restOf(split!, odd!.text[variant.id]!)).toBe(odd!.text[variant.id]!.trim())
  })

  it('names a material in at least four variants in five, which is what makes it a level', () => {
    const named = hf.view.filter((r) => leadOf(split!, r.text[variant.id] ?? '') !== '').length
    expect(named * 5).toBeGreaterThanOrEqual(hf.view.length * 4)
  })

  it('finds no second level in any other table’s rows', () => {
    for (const t of pack.entities) {
      if (t.id === hf.table.id || !t.hierarchy || t.hierarchy.length === 0) continue
      const leaf = t.hierarchy[t.hierarchy.length - 1]
      const view = viewRowsOf(t, rowsOf(t), refLabel)
      const roots = buildGroups(view, outlineLevels(t, tables), textOf)
      expect(leadSplit(roots.length > 0 ? blocksOf(roots) : [view], leaf), t.name).toBeNull()
    }
  })

  it('as a level of the engine’s own grouping, files every PVC variant before every HYP one', () => {
    const lead = leadLevelOf(variant.id)
    const leadText = (r: ViewRow, id: string): string =>
      id === lead ? leadOf(split!, textOf(r, variant.id)) : textOf(r, id)
    const roots = buildGroups(hf.view, [...hf.levels, lead], leadText)
    const layout = layoutGroups(hf.view, roots, new Set())
    /* no row lost, none gained */
    expect(layout.leafRows).toHaveLength(hf.view.length)
    /* inside every model, the rows run one material at a time */
    for (const series of roots) {
      for (const model of series.children) {
        const order = model.children.flatMap((m) => m.leaves.map(() => m.value))
        const runs = order.filter((v, i) => i === 0 || order[i - 1] !== v)
        expect(new Set(runs).size, `${series.value} ${model.value}`).toBe(runs.length)
      }
    }
  })
})

describe('readingColumns — what a dealer reads first', () => {
  const prices = priceLevelsFor(hf.table)
  const reading = readingColumns({
    table: hf.table,
    leafFields: hf.fields,
    rows: hf.view,
    said: hf.said,
    levels: hf.levels,
    prices,
    isCost: (f) => isCostColumn(hf.table, f),
  })

  it('draws the variant, the code he orders by, and the price ladder — in that order', () => {
    expect(reading.columns.map((c) => c.job)).toEqual([
      'name',
      'code',
      ...prices.map(() => 'price'),
    ])
    expect(reading.columns[0]!.field.id).toBe(variant.id)
    expect(reading.columns[1]!.field.id).toBe(field(hf.table, 'Model Code').id)
    expect(reading.columns.slice(2).map((c) => c.field.id)).toEqual(prices.map((p) => p.fieldId))
  })

  it('never draws a column that says one thing, a picture, or a cost', () => {
    for (const c of reading.columns) {
      expect(hf.said.settled.has(c.field.id), c.field.name).toBe(false)
      expect(c.field.type).not.toBe('image')
      expect(isCostColumn(hf.table, c.field)).toBe(false)
    }
  })

  it('holds every other column one press away, saying where its words are now', () => {
    expect(reading.columns.length + reading.extras.length + reading.held.length).toBe(
      hf.fields.length,
    )
    const where = new Map(reading.held.map((h) => [h.field.name, h.where]))
    expect(where.get('Matrix')).toBe('head')
    expect(where.get('Image Link')).toBe('picture')
    expect(where.get('Boat')).toBe('name')
    expect(where.get('OA Length')).toBe('spine')
    for (const f of hf.fields.filter((x) => isCostColumn(hf.table, x))) {
      expect(['cost', 'head', 'spine', 'empty']).toContain(where.get(f.name))
    }
  })

  it('draws a column a person pressed into the grid, after the ones it chose', () => {
    const beam = field(hf.table, 'Beam')
    const pressed = readingColumns({
      table: hf.table,
      leafFields: hf.fields,
      rows: hf.view,
      said: hf.said,
      levels: hf.levels,
      prices,
      isCost: (f) => isCostColumn(hf.table, f),
      shown: [beam.id],
    })
    expect(pressed.columns.at(-1)?.field.id).toBe(beam.id)
    expect(pressed.held.some((h) => h.field.id === beam.id)).toBe(false)
  })

  it('on a table whose rows are different hulls, offers each hull’s own specs, never a stray figure', () => {
    const stacer = setUp('boat_stacer')
    const r = readingColumns({
      table: stacer.table,
      leafFields: stacer.fields,
      rows: stacer.view,
      said: stacer.said,
      levels: stacer.levels,
      prices: priceLevelsFor(stacer.table),
      isCost: (f) => isCostColumn(stacer.table, f),
    })
    const names = r.extras.map((f) => f.name)
    /* a spec that varies between a series' hulls is the row's own */
    const hp = field(stacer.table, 'Max HP')
    expect(stacer.said.mostly.has(hp.id)).toBe(false)
    expect(names).toContain('Max HP')
    for (const f of r.extras) {
      expect(isCostColumn(stacer.table, f), f.name).toBe(false)
      expect(stacer.said.mostly.has(f.id), f.name).toBe(false)
      expect(f.type).not.toBe('image')
    }
    /* and Highfield's specs are its models' own, said on the spine */
    const hfExtras = readingColumns({
      table: hf.table,
      leafFields: hf.fields,
      rows: hf.view,
      said: hf.said,
      levels: hf.levels,
      prices: priceLevelsFor(hf.table),
      isCost: (f) => isCostColumn(hf.table, f),
    }).extras
    expect(hfExtras.map((f) => f.name)).not.toContain('OA Length')
  })

  it('reads a pairing boat side first: the motor is the name, recommended is a mark', () => {
    const yam = setUp('join_hf_yam')
    const r = readingColumns({
      table: yam.table,
      leafFields: yam.fields,
      rows: yam.view,
      said: yam.said,
      levels: yam.levels,
      prices: priceLevelsFor(yam.table),
      isCost: (f) => isCostColumn(yam.table, f),
    })
    expect(r.columns[0]!.field.name).toBe('Motor')
    expect(r.columns.find((c) => c.job === 'mark')?.field.name).toBe('Recommended')
    /* the label is the two ends typed together, and says nothing the spine and the motor do not */
    expect(r.held.find((h) => h.field.name === 'Label')?.where).toBe('name')
  })

  it('reads Parts by its product, its code and its own two prices', () => {
    const parts = setUp('parts')
    const ladder = priceLevelsFor(parts.table)
    const r = readingColumns({
      table: parts.table,
      leafFields: parts.fields,
      rows: parts.view,
      said: parts.said,
      levels: parts.levels,
      prices: ladder,
      isCost: (f) => isCostColumn(parts.table, f),
    })
    expect(r.columns[0]!.field.name).toBe('Product')
    expect(r.columns.find((c) => c.job === 'code')?.field.name).toBe('Code')
    expect(r.columns.filter((c) => c.job === 'price').map((c) => c.field.id)).toEqual(
      ladder.map((l) => l.fieldId),
    )
  })
})

describe('leadFigures — the spine’s price, per material, at the lit rung', () => {
  const split = leadSplit(blocksOf(hf.roots), variant.id)!
  const cash = priceLevelsFor(hf.table)[0]!

  it('says one figure where the colourway does not change it, and a range where it does', () => {
    const [, modelId] = hf.levels as [string, string]
    let ranges = 0
    let groups = 0
    for (const series of hf.roots) {
      for (const model of series.children) {
        const figures = leadFigures(model.leaves, cash.fieldId, split)
        for (const f of figures) {
          groups += 1
          const rows = model.leaves.filter((r) => leadOf(split, r.text[variant.id]!) === f.lead)
          const values = rows
            .map((r) => r.values[cash.fieldId])
            .filter((v): v is number => typeof v === 'number')
          expect(f.lo).toBe(Math.min(...values))
          expect(f.hi).toBe(Math.max(...values))
          if (f.lo !== f.hi) ranges += 1
        }
        expect(model.leaves.every((r) => r.text[modelId] === model.value)).toBe(true)
      }
    }
    /* most model-and-material groups carry one figure; some do vary */
    expect(ranges).toBeGreaterThan(0)
    expect(ranges).toBeLessThan(groups)
  })
})

describe('spineFit — a spine is never taller than its block', () => {
  /* the screen's own type: a 22 px name, 16 px lines, 12 px of padding,
     and a render between 64 and 92 px tall */
  const m: SpineMeasure = { pad: 12, nameH: 22, lineH: 16, pictureMinH: 64, pictureMaxH: 92 }

  it('carries the name alone on a one-row block, and never a render', () => {
    expect(spineFit(1, ROW_H, true, m)).toEqual({ fit: 'name', lines: 0, pictureH: 0 })
  })

  it('moves the render to the record when the block is too short to draw one worth drawing', () => {
    const two = spineFit(2, ROW_H, true, m)
    expect(two.pictureH).toBe(0)
    expect(two.fit).toBe('words')
  })

  it('draws the render on a model of four variants, no taller than the rows', () => {
    const four = spineFit(4, ROW_H, true, m)
    expect(four.fit).toBe('full')
    expect(four.pictureH).toBeGreaterThanOrEqual(m.pictureMinH)
    expect(four.pictureH).toBeLessThanOrEqual(4 * ROW_H - m.pad)
  })

  it('fits inside every block from one row to twenty, with or without a render', () => {
    for (let n = 1; n <= 20; n += 1) {
      for (const pic of [true, false]) {
        const fit = spineFit(n, ROW_H, pic, m)
        if (fit.fit !== 'name') {
          expect(m.pad + m.nameH + fit.lines * m.lineH).toBeLessThanOrEqual(n * ROW_H)
        }
        expect(fit.pictureH).toBeLessThanOrEqual(Math.max(0, n * ROW_H - m.pad))
      }
    }
  })
})

/* A MEASURE OF ONE PIXEL A CHARACTER, so a width in these cases is a
   count of characters a reader can check by eye. The screen hands in
   the browser's own measure of its own face. */
const chars = (s: string): number => s.length
const more = (n: number): string => `+${n} more`
const dims: FactRun = {
  key: 'dims',
  accent: 'blue',
  facts: ['OA Length 2.3', 'Beam 1.37', 'Tube Dia 36 cm', 'Int Length 154 cm'],
}
const motor: FactRun = { key: 'motor', accent: 'carmine', facts: ['4 HP'] }
const load: FactRun = { key: 'load', facts: ['Max Load 350 kg', 'Max People 2'] }

describe('packFacts — a spine says every fact whole, or counts it', () => {
  /* a line's first section costs 2 before its words (its square), a later
     one on the same line 4 (the air and its square) — in characters here */
  const box = { indent: 2, markW: 4 }
  const cost = (l: PackedLine): number =>
    l.runs.reduce((w, r, i) => w + (i === 0 ? box.indent : box.markW) + r.text.length, 0) +
    (l.more ? ` · ${l.more}`.length : 0)

  it('lays a section into lines of the width it has, whole facts only, running on under its accent', () => {
    const p = packFacts([dims], 5, { width: 32, measure: chars, more, ...box })
    expect(p.lines.map((l) => l.runs.map((r) => [r.text, r.lead]))).toEqual([
      [['OA Length 2.3 · Beam 1.37', true]],
      [['Tube Dia 36 cm', false]],
      [['Int Length 154 cm', false]],
    ])
    for (const l of p.lines) expect(cost(l)).toBeLessThanOrEqual(32)
    expect(p.said).toBe(4)
    expect(p.lines.some((l) => l.more !== undefined)).toBe(false)
  })

  it('lets a section follow the one before it on its line, each after its own accent', () => {
    const p = packFacts([motor, load], 3, { width: 60, measure: chars, more, ...box })
    expect(p.lines).toHaveLength(1)
    expect(p.lines[0]!.runs.map((r) => [r.text, r.accent, r.lead])).toEqual([
      ['4 HP', 'carmine', true],
      ['Max Load 350 kg · Max People 2', undefined, true],
    ])
    expect(p.left).toBe(0)
  })

  it('gives every section its first line before any gets a second, where that says more', () => {
    /* flowing, two lines hold only the dimensions; a section to a line,
       breadth first, holds the dimensions' first line and the motor */
    const p = packFacts([dims, motor, load], 2, { width: 32, measure: chars, ...box })
    expect(p.lines.map((l) => l.runs.map((r) => r.key.split(':')[0]))).toEqual([
      ['dims'],
      ['motor'],
    ])
    expect(p.lines[0]!.runs[0]!.text).toBe('OA Length 2.3 · Beam 1.37')
    expect(p.left).toBe(4)
  })

  it('counts what it left after the last fact, and the last line gives up a fact to fit the count', () => {
    /* "OA Length 2.3 · Beam 1.37 · +2 more" is 37 with its square; the line is 32 */
    const p = packFacts([dims], 1, { width: 32, measure: chars, more, ...box })
    const last = p.lines[p.lines.length - 1]!
    expect(last.runs.map((r) => r.text)).toEqual(['OA Length 2.3'])
    expect(last.more).toBe('+3 more')
    expect(p.left).toBe(3)
    expect(cost(last)).toBeLessThanOrEqual(32)
  })

  it('breaks a fact wider than the line at its spaces, never inside a word', () => {
    const fact = 'Boat Rego Decals Rego Decals (Std) t/s PVC Tubes'
    const p = packFacts([{ key: 'rego', facts: [fact] }], 6, { width: 22, measure: chars, ...box })
    for (const l of p.lines) expect(cost(l)).toBeLessThanOrEqual(22)
    expect(p.lines.map((l) => l.runs.map((r) => r.text).join(' ')).join(' ')).toBe(fact)
    expect(p.said).toBe(1)
  })

  it('takes a fact broken across the last line off whole, and counts it', () => {
    const fact = 'Boat Rego Decals Rego Decals (Std) t/s PVC Tubes'
    const p = packFacts([{ key: 'rego', facts: [fact] }, motor], 1, {
      width: 22,
      measure: chars,
      more,
      ...box,
    })
    expect(p.lines.flatMap((l) => l.runs.map((r) => r.text)).join(' ')).not.toContain('Boat')
    expect(p.said).toBe(0)
    expect(p.lines[p.lines.length - 1]!.more).toBe('+2 more')
  })

  it('with no room says nothing, and counts everything as left for the record', () => {
    const p = packFacts([dims, motor], 0, { width: 100, measure: chars, more, ...box })
    expect(p.lines).toEqual([])
    expect(p.left).toBe(5)
  })

  it('never draws a line wider than it was given, on every Highfield model at a laptop’s spine', () => {
    let models = 0
    for (const [, facts] of hf.said.groups) {
      if (facts.length === 0) continue
      models += 1
      /* the model's facts, two to a section, so sections share lines and run on */
      const texts = facts.map((s) => s.text)
      const runs: FactRun[] = []
      for (let i = 0; i < texts.length; i += 2)
        runs.push({ key: `s${i}`, facts: texts.slice(i, i + 2) })
      for (const width of [180, 240, 320]) {
        const p = packFacts(runs, 3, { width, measure: chars, more, ...box })
        expect(p.lines.length).toBeLessThanOrEqual(3)
        for (const l of p.lines) expect(cost(l), JSON.stringify(l)).toBeLessThanOrEqual(width)
        expect(p.said + p.left).toBe(facts.length)
      }
    }
    expect(models).toBeGreaterThan(0)
  })
})

describe('packOneLine — a shut model’s line, every section on it', () => {
  it('gives every section its first fact before any section its second, in the file’s order', () => {
    /* turn one: "OA Length 2.3" 4 + 13, "4 HP" 4 + 4, "Max Load 350 kg" 4 + 15 — 44;
       turn two: " · Beam 1.37" makes 56, " · Max People 2" would make 71 of 60 */
    const p = packOneLine([dims, motor, load], { width: 60, measure: chars, markW: 4 })
    expect(p.runs.map((r) => [r.key, r.text, r.accent])).toEqual([
      ['dims', 'OA Length 2.3 · Beam 1.37', 'blue'],
      ['motor', '4 HP', 'carmine'],
      ['load', 'Max Load 350 kg', undefined],
    ])
    expect(p.said).toBe(4)
    expect(p.left).toBe(3)
  })

  it('says everything, with no count, when everything fits', () => {
    const p = packOneLine([motor, load], { width: 100, measure: chars, markW: 4, more })
    expect(p.runs.map((r) => r.text)).toEqual(['4 HP', 'Max Load 350 kg · Max People 2'])
    expect(p.more).toBeUndefined()
    expect(p.left).toBe(0)
  })

  it('counts what it left, and the fact taken last gives way to make room for the count', () => {
    /* 56 of 60 as above; " · +3 more" is 10 more, so "Beam 1.37" — taken
       last — gives way, and every section keeps its first fact */
    const p = packOneLine([dims, motor, load], { width: 60, measure: chars, markW: 4, more })
    expect(p.runs.map((r) => r.text)).toEqual(['OA Length 2.3', '4 HP', 'Max Load 350 kg'])
    expect(p.more).toBe('+4 more')
    expect(p.said + p.left).toBe(7)
  })
})

describe('piecesOf — the engine’s lines, cut into bands, blocks and runs', () => {
  it('keeps every row in the engine’s own order and index', () => {
    const layout = layoutGroups(hf.view, hf.roots, new Set())
    const pieces = piecesOf(layout.lines, hf.levels.length - 1)
    const leaves = pieces.flatMap((p) =>
      p.kind === 'block' ? p.runs.flatMap((r) => r.leaves) : p.kind === 'row' ? [p.leaf] : [],
    )
    expect(leaves.map((l) => l.r)).toEqual(layout.leafRows.map((_, i) => i))
    expect(leaves.map((l) => l.rowId)).toEqual(layout.leafRows.map((r) => r.rowId))
    expect(pieces.filter((p) => p.kind === 'band')).toHaveLength(hf.roots.length)
    const models = hf.roots.flatMap((s) => s.children)
    expect(pieces.filter((p) => p.kind === 'block')).toHaveLength(models.length)
  })

  it('draws a shut block as its spine alone, and its rows leave the addressable set', () => {
    const first = hf.roots[0]!.children[0]!
    const layout = layoutGroups(hf.view, hf.roots, new Set([first.key]))
    const pieces = piecesOf(layout.lines, 1)
    const shut = pieces.find((p) => p.kind === 'block' && p.key === first.key)
    expect(shut?.kind === 'block' && shut.shut).toBe(true)
    expect(shut?.kind === 'block' ? leavesIn(shut) : -1).toBe(0)
    expect(layout.leafRows).toHaveLength(hf.view.length - first.leafCount)
  })

  it('draws a flat table as rows', () => {
    const flat = setUp('boat_formosa')
    const layout = layoutGroups(flat.view, flat.roots, new Set())
    const pieces = piecesOf(layout.lines, -1)
    expect(pieces.every((p) => p.kind === 'row')).toBe(true)
    expect(pieces).toHaveLength(flat.view.length)
  })
})

describe('chaptersOf', () => {
  it('reads Highfield’s series as chapters, every variant in one of them', () => {
    const chapters = chaptersOf(hf.roots, hf.levels)
    expect(chapters.map((c) => c.value)).toEqual(hf.roots.map((n) => n.value))
    expect(chapters.reduce((n, c) => n + c.count, 0)).toBe(hf.view.length)
  })

  it('makes no chapters where the spine is the outermost level, or where there are too many', () => {
    for (const id of ['boat_stacer', 'parts', 'join_hf_yam', 'boat_formosa']) {
      const t = setUp(id)
      expect(chaptersOf(t.roots, t.levels), id).toEqual([])
    }
  })
})

describe('blockPicture — a render only beside the rows it depicts', () => {
  const image = hf.table.fields.find((f) => f.type === 'image')!
  const addressOf = (r: ViewRow): string | undefined => {
    const v = r.values[image.id]
    return v !== undefined && v !== null && isImageValue(v) ? primaryImage(v)?.src : undefined
  }

  it('finds a held render for exactly the models whose rows carry a held address', () => {
    const models = hf.roots.flatMap((s) => s.children)
    let holding = 0
    for (const model of models) {
      const pic = blockPicture(model.leaves, image, 1, heldCopy)
      const expected = model.leaves.some((r) => held.has(addressOf(r) ?? ''))
      expect(pic !== null, model.value).toBe(expected)
      if (!pic) continue
      holding += 1
      const address = addressOf(model.leaves.find((r) => r.rowId === pic.rowId)!)
      expect(pic.depicts).toBe(model.leaves.filter((r) => addressOf(r) === address).length)
      expect(pic.of).toBe(model.leaves.length)
    }
    expect(holding).toBeGreaterThan(0)
    expect(holding).toBeLessThan(models.length)
  })

  it('never stands one hull’s photograph beside a series of different hulls', () => {
    const stacer = setUp('boat_stacer')
    const img = stacer.table.fields.find((f) => f.type === 'image')
    for (const series of stacer.roots) {
      expect(blockPicture(series.leaves, img, 0, heldCopy)).toBeNull()
    }
  })
})
