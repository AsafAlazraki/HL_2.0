import { describe, expect, it } from 'vitest'
import { rowLabel, type EntityDef } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { buildGroups, groupLevelIds, layoutGroups, leafFieldsOf } from './grouping'
import { ROW_H } from './helpers'
import {
  chunkLines,
  chunkOfLeaf,
  collapsedAtDepth,
  drawnLines,
  handColumns,
  labelIndex,
  ladderRungs,
  OUTLINE_GROUP_H,
  outlineLevels,
  ROW_HEIGHTS,
  viewRowsOf,
} from './outline'

/* ============================================================
   THE OUTLINE'S DERIVATIONS, MEASURED ON THE REAL PACK.

   Every figure asserted below is counted off `data/northside/`, never
   typed: how many hulls a pairing files under, how many drawers the
   depth ladder shuts, how many pieces a virtualiser is handed. The
   one number written by hand is the resting geometry, and it is the
   number `outline.ts` argues for at length.
   ============================================================ */

const pack = await loadPack()
const tables: Record<string, EntityDef> = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
const byName = (name: string): EntityDef => {
  const e = pack.entities.find((t) => t.name === name)
  if (!e) throw new Error(`no table called ${name} on the pack`)
  return e
}
const rowsOf = (e: EntityDef) => pack.rowsByEntity[e.id] ?? []

const refLabel = (refEntityId: string | undefined, rowId: string): string | undefined => {
  if (!refEntityId) return undefined
  const target = tables[refEntityId]
  const row = rowsOf(target).find((r) => r.id === rowId)
  return target && row ? rowLabel(target, row) : undefined
}

/* ---------------------------------------------------------- */

describe('outlineLevels', () => {
  it('is the table’s own hierarchy on a base table, drawers only', () => {
    const hf = byName('Highfield Inflatables')
    expect(outlineLevels(hf, tables)).toEqual(groupLevelIds(hf))
    expect(outlineLevels(hf, tables)).toHaveLength(2)
    expect(outlineLevels(byName('Formosa'), tables)).toEqual([])
  })

  it('hands a pairing the boat side, which the sweep never said and the critic asked for', () => {
    const join = byName('Highfield × Yamaha — Motor Fitment')
    expect(join.hierarchy ?? []).toEqual([])
    const levels = outlineLevels(join, tables)
    expect(levels).toHaveLength(1)
    const field = join.fields.find((f) => f.id === levels[0])
    expect(field?.type).toBe('reference')
    expect(tables[field?.refEntityId ?? '']?.kind).toBe('boat')
  })

  it('files the 2,519 pairings under exactly the 588 hulls, one drawer each', () => {
    const join = byName('Highfield × Yamaha — Motor Fitment')
    const hulls = rowsOf(byName('Highfield Inflatables'))
    const view = viewRowsOf(join, rowsOf(join), refLabel)
    const levels = outlineLevels(join, tables)
    const roots = buildGroups(view, levels, (r, id) => r.text[id] ?? '')
    expect(view.length).toBe(2519)
    expect(roots.length).toBe(hulls.length)
    expect(roots.reduce((n, r) => n + r.leafCount, 0)).toBe(2519)
    /* the drawer is named by the hull's own label, never by an id */
    expect(roots[0]?.value).toBe(rowLabel(byName('Highfield Inflatables'), hulls[0]!))
  })

  it('reads every one of the 28 pairings from one of its two ends', () => {
    for (const e of pack.entities.filter((t) => t.role === 'join')) {
      expect(outlineLevels(e, tables), e.name).toHaveLength(1)
    }
  })
})

describe('viewRowsOf', () => {
  it('gives a link column the linked row’s name, so search and the clipboard read a boat', () => {
    const join = byName('Highfield × Yamaha — Motor Fitment')
    const view = viewRowsOf(join, rowsOf(join).slice(0, 1), refLabel)
    const boat = join.fields.find((f) => f.type === 'reference')!
    expect(view[0]!.text[boat.id]).toMatch(/^Highfield - /)
  })

  it('carries the clipboard text of a price, not the painted one', () => {
    const hf = byName('Highfield Inflatables')
    const view = viewRowsOf(hf, rowsOf(hf).slice(0, 1))
    const price = hf.fields.find((f) => f.id === hf.priceLevels?.[0]?.fieldId)!
    expect(view[0]!.text[price.id]).toBe('2770')
  })

  it('indexes every row label for a typed link, lower-cased', () => {
    const hf = byName('Highfield Inflatables')
    const index = labelIndex(hf, rowsOf(hf))
    expect(index.size).toBe(588)
    expect(index.get('highfield - ru230kam (pvc) wh')).toBe('boat_highfield:1')
  })
})

describe('chunkLines', () => {
  const hf = byName('Highfield Inflatables')
  const view = viewRowsOf(hf, rowsOf(hf))
  const levels = groupLevelIds(hf)
  const roots = buildGroups(view, levels, (r, id) => r.text[id] ?? '')
  const metrics = { rowH: ROW_H, groupH: OUTLINE_GROUP_H, addH: 0 }

  it('hands a virtualiser one piece per series and one per model, with the rows inside', () => {
    const layout = layoutGroups(view, roots, new Set(), metrics)
    const chunks = chunkLines(layout.lines)
    const branches = chunks.filter((c) => c.kind === 'branch')
    const drawers = chunks.filter((c) => c.kind === 'drawer')
    expect(branches).toHaveLength(7)
    expect(drawers).toHaveLength(67)
    expect(drawers.reduce((n, d) => n + (d.kind === 'drawer' ? d.leaves.length : 0), 0)).toBe(588)
    /* every drawer keeps the engine's own + ROW, whose words its head carries */
    expect(drawers.every((d) => d.kind === 'drawer' && d.add !== undefined)).toBe(true)
  })

  it('folds the add line into its head: the layout is exactly rows and heads tall', () => {
    const layout = layoutGroups(view, roots, new Set(), metrics)
    expect(layout.bodyH).toBe(588 * ROW_H + (7 + 67) * OUTLINE_GROUP_H)
  })

  it('tells a reader the drawn count — rows and heads, never the add lines', () => {
    const layout = layoutGroups(view, roots, new Set(), metrics)
    const chunks = chunkLines(layout.lines)
    expect(layout.lines.length).toBe(588 + 7 + 67 + 67)
    expect(drawnLines(chunks)).toBe(588 + 7 + 67)
    /* and every piece's `at` is its place in that drawn run */
    const last = chunks[chunks.length - 1]!
    expect(last.at + (last.kind === 'drawer' ? 1 + last.leaves.length : 1)).toBe(588 + 7 + 67)
  })

  it('finds the piece a row is drawn in', () => {
    const layout = layoutGroups(view, roots, new Set(), metrics)
    const chunks = chunkLines(layout.lines)
    expect(chunkOfLeaf(chunks, 0)).toBe(1)
    expect(chunkOfLeaf(chunks, 587)).toBe(chunks.length - 1)
    expect(chunkOfLeaf(chunks, 588)).toBe(-1)
    /* the first drawer's head is the second drawn line, after its series */
    expect(chunks[1]!.at).toBe(1)
  })

  it('draws a flat table as one piece per row', () => {
    const formosa = byName('Formosa')
    const flat = layoutGroups(viewRowsOf(formosa, rowsOf(formosa)), [], new Set(), metrics)
    const chunks = chunkLines(flat.lines)
    expect(chunks.every((c) => c.kind === 'leaf')).toBe(true)
    expect(chunks).toHaveLength(rowsOf(formosa).length)
  })

  it('keeps a shut drawer as a head with nothing under it', () => {
    const shut = collapsedAtDepth(roots, 2)
    const layout = layoutGroups(view, roots, shut, metrics)
    const chunks = chunkLines(layout.lines)
    expect(chunks.filter((c) => c.kind === 'drawer')).toHaveLength(67)
    expect(chunks.every((c) => c.kind !== 'drawer' || c.leaves.length === 0)).toBe(true)
  })
})

describe('the depth ladder', () => {
  const hf = byName('Highfield Inflatables')
  const view = viewRowsOf(hf, rowsOf(hf))
  const roots = buildGroups(view, groupLevelIds(hf), (r, id) => r.text[id] ?? '')

  it('shuts the seven series at depth 1, the 67 models at depth 2, and nothing at depth 3', () => {
    expect(collapsedAtDepth(roots, 1).size).toBe(7)
    expect(collapsedAtDepth(roots, 2).size).toBe(67)
    expect(collapsedAtDepth(roots, 3).size).toBe(0)
  })

  it('names its rungs in the dealer’s own column names, then "Every row"', () => {
    expect(ladderRungs(hf, groupLevelIds(hf))).toEqual(['Series', 'Model', 'Every row'])
    const parts = byName('Parts & Accessories')
    expect(ladderRungs(parts, groupLevelIds(parts))).toEqual(['Category', 'Every row'])
    expect(ladderRungs(byName('Formosa'), [])).toEqual([])
  })
})

describe('a hand', () => {
  it('keeps the name and one fact, and never a picture as the fact', () => {
    const hf = byName('Highfield Inflatables')
    const leaves = leafFieldsOf(hf.fields, groupLevelIds(hf))
    const two = handColumns(hf, leaves)
    expect(two).toHaveLength(2)
    expect(two[0]!.id).toBe(hf.displayFieldId)
    expect(two[1]!.type).not.toBe('image')
  })

  it('reads a pairing’s two identities', () => {
    const join = byName('Highfield × Yamaha — Motor Fitment')
    const two = handColumns(join, leafFieldsOf(join.fields, outlineLevels(join, tables)))
    expect(two.map((f) => f.name)).toEqual(['Label', 'Motor'])
  })
})

describe('the resting geometry', () => {
  it('rests dense at the engine’s own row height, and each height names the picture it carries', () => {
    expect(ROW_HEIGHTS.dense.rowH).toBe(ROW_H)
    for (const key of Object.keys(ROW_HEIGHTS) as (keyof typeof ROW_HEIGHTS)[]) {
      expect(ROW_HEIGHTS[key].rowH - ROW_HEIGHTS[key].thumb).toBe(4)
    }
  })

  it('holds eighteen Roll-Up rows in the room the screen gives it, which 30/24 lines do not', () => {
    /* the sweep's arithmetic, re-run on the real first screen rather
       than the median model: Roll-Up is eight models of four */
    const hf = byName('Highfield Inflatables')
    const view = viewRowsOf(hf, rowsOf(hf))
    const roots = buildGroups(view, groupLevelIds(hf), (r, id) => r.text[id] ?? '')
    const rollUp = roots[0]!
    expect(rollUp.value).toBe('Roll-Up')
    expect(rollUp.children.map((m) => m.leafCount)).toEqual([4, 4, 4, 4, 4, 4, 4, 4])

    const room = 660
    const count = (groupH: number, addH: number): number => {
      let y = groupH
      let rows = 0
      for (const model of rollUp.children) {
        y += groupH
        for (let i = 0; i < model.leafCount; i += 1) {
          y += ROW_H
          if (y > room) return rows
          rows += 1
        }
        y += addH
      }
      return rows
    }
    expect(count(30, 24)).toBeLessThan(18)
    expect(count(OUTLINE_GROUP_H, 0)).toBeGreaterThanOrEqual(18)
  })
})
