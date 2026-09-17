/* ============================================================
   THE WHOLE TRIP, NOT HALF OF IT.

   `envelope.roundtrip.test.ts` walks the real exporter into the real
   VALIDATOR, which is where two "the importer refuses its own export"
   bugs were caught. It stops there. Nothing in this directory has ever
   walked the other half — validator into `applyReplace`, into the
   store, and back OUT through the exporter a second time — and that is
   the half a person actually performs when they restore a backup.

   ACTION_BAR.md §4.2 names five things that must survive it:
   columns, SECTIONS, HIERARCHY, images and PROVENANCE (`Source` cells
   like `Boat Module!R829`). Three of those five had no test at all.
   They are counted here on BOTH SIDES of the trip — the sheet as the
   seed leaves it, and the sheet after export → import → export — and
   the counts are printed by the assertion when they disagree.

   WHAT IS NOT HERE YET, AND WHY IT IS NOT A SILENCE.

   The old file went on to pin the IDENTITIES: tables, columns and
   rows keep their ids on a replace, and so must PAGES and MODULES,
   because a quote keeps `viewId` among the exactly two ids it is
   allowed to keep — so a dealer who restored a backup found every
   quote's "make another like this one" pointing at a page id that no
   longer existed. Five tests, and two more about a MERGE giving an
   imported page a fresh id instead.

   Every one of those drives `restoreDesign` through the project
   store's own commands — `createView`, `createModule`, `createRole`,
   `updateView`, `updateModule` — and this build has none of them:
   `src/state/catalogue.ts` is read-only until the commands land.
   `memoryApply` refuses those five doors out loud for exactly this
   reason: a double that guessed at `createView`'s idempotency by root
   table would let the identity tests PASS against behaviour nobody
   has written, which is worse than not running them.

   SO THE SHEET BELOW IS THE SEED WITH ITS PLACES SET ASIDE, and that
   line is here because it was once true by accident. The pack does
   not carry modules — a module name is a business string, so the nine
   places are minted from table keys when the file lands — and while
   nothing minted them the fixture's sheet had none, so an export
   carried none and a restore never reached `createModule`. The
   minting has since landed (`@/data/pack/boot`, and the fixture calls
   it), so this file now empties `modules` itself, in one place, with
   this sentence beside it. Nothing below asserts anything about a
   place: the five tests that do are the ones named above, and they
   come back with the commands, on a sheet that keeps its places.

   So the two trips below are the two that can be walked today, and
   the seven that cannot are named here rather than quietly dropped.
   They come back with the store's design-layer commands.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { makeCtx, type EntityDef, type OrgProfile, type RowData } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { buildExportPayload } from './exportPayload'
import { validateEnvelope } from './envelope'
import { applyReplace } from './apply'
import { memoryApply } from './memoryApply'

const ORG = 'northside'

const NORTHSIDE: OrgProfile = {
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: '2026-01-01T00:00:00.000Z',
  slug: ORG,
}

/* ------------------------------------------------------------ */
/* every figure ACTION_BAR §4.2 names, read off one snapshot      */
/* ------------------------------------------------------------ */

interface Census {
  tables: number
  columns: number
  /** named bands of columns — "Pricing", "Dimensions", "Rego" */
  sections: number
  /** every column that declares which band it is in */
  banded: number
  /** grouping levels across every table: Brand▸Range▸Model▸Variant */
  hierarchyLevels: number
  /** tables that group at all */
  hierarchies: number
  rows: number
  imageCells: number
  images: number
  /** cells citing the workbook they came from */
  provenance: number
  /** distinct citations, so a trip cannot pass by writing one of them
   *  into every row */
  provenanceDistinct: number
}

const PROVENANCE = /^[A-Za-z][A-Za-z0-9 &'’()/-]*![A-Z]{1,3}\d+$/

function censusOf(entities: EntityDef[], rowsByEntity: Record<string, RowData[]>): Census {
  let columns = 0
  let sections = 0
  let banded = 0
  let hierarchyLevels = 0
  let hierarchies = 0
  for (const e of entities) {
    columns += e.fields.length
    sections += e.sections?.length ?? 0
    banded += e.fields.filter((f) => f.sectionId !== undefined).length
    const levels = e.hierarchy?.length ?? 0
    hierarchyLevels += levels
    if (levels > 0) hierarchies += 1
  }

  let rows = 0
  let imageCells = 0
  let images = 0
  let provenance = 0
  const citations = new Set<string>()
  for (const list of Object.values(rowsByEntity)) {
    rows += list.length
    for (const row of list) {
      for (const value of Object.values(row.values)) {
        if (Array.isArray(value)) {
          imageCells += 1
          images += value.length
          continue
        }
        if (typeof value === 'string' && PROVENANCE.test(value)) {
          provenance += 1
          citations.add(value)
        }
      }
    }
  }

  return {
    tables: entities.length,
    columns,
    sections,
    banded,
    hierarchyLevels,
    hierarchies,
    rows,
    imageCells,
    images,
    provenance,
    provenanceDistinct: citations.size,
  }
}

/** The seed on a sheet an apply can be driven into, counted through
 *  the same reader on both sides of the trip. */
async function seededSheet() {
  const pack = await loadPack()
  /* `modules: {}` — see the last paragraph of this file's header. The
     trip is tables, columns, rows and their provenance; restoring a
     PLACE needs `createModule`, which this build does not have. */
  const sheet = memoryApply(makeCtx({ ...pack.ctx, org: NORTHSIDE, modules: {} }), {
    name: 'Test Sheet',
    rev: 1,
  })
  const census = () => {
    const s = sheet.ctx()
    return censusOf(Object.values(s.entities), s.rowsByEntity)
  }
  return { sheet, census }
}

/* ------------------------------------------------------------ */

describe('export → import → export, on the real seed', () => {
  it('carries every column, section, grouping level, picture and citation home', async () => {
    const { sheet, census } = await seededSheet()
    const before = census()

    /* out */
    const file = buildExportPayload(sheet.ctx(), { name: 'Test Sheet', rev: 1 }, true)
    const read = validateEnvelope(file, ORG)
    expect(read.ok ? null : read.error).toBeNull()
    if (!read.ok) return

    /* and back into a real sheet, through the door the menu uses */
    applyReplace({ ...read.data, quotes: file.quotes }, sheet.ports)

    const after = census()

    /* THE FIGURES THIS TEST EXISTS FOR — printed side by side when
       they disagree, rather than as one failing boolean. */
    expect({
      tables: after.tables,
      columns: after.columns,
      sections: after.sections,
      banded: after.banded,
      hierarchies: after.hierarchies,
      hierarchyLevels: after.hierarchyLevels,
      rows: after.rows,
      imageCells: after.imageCells,
      images: after.images,
      provenance: after.provenance,
      provenanceDistinct: after.provenanceDistinct,
    }).toEqual({
      tables: before.tables,
      columns: before.columns,
      sections: before.sections,
      banded: before.banded,
      hierarchies: before.hierarchies,
      hierarchyLevels: before.hierarchyLevels,
      rows: before.rows,
      imageCells: before.imageCells,
      images: before.images,
      provenance: before.provenance,
      provenanceDistinct: before.provenanceDistinct,
    })

    /* and none of those is zero, or the equality above would hold on a
       sheet that lost the lot */
    expect(before.sections).toBeGreaterThan(0)
    expect(before.banded).toBeGreaterThan(0)
    expect(before.hierarchies).toBeGreaterThan(0)
    expect(before.images).toBeGreaterThan(0)
    expect(before.provenanceDistinct).toBeGreaterThan(100)
  })

  it('writes the same file the second time — the trip is a loop, not a drift', async () => {
    const { sheet } = await seededSheet()
    const first = buildExportPayload(sheet.ctx(), { name: 'Test Sheet', rev: 1 }, true)
    const read = validateEnvelope(first, ORG)
    expect(read.ok).toBe(true)
    if (!read.ok) return
    applyReplace({ ...read.data, quotes: first.quotes }, sheet.ports)
    const second = buildExportPayload(sheet.ctx(), { name: 'Test Sheet', rev: 2 }, true)

    const shapeOf = (e: EntityDef) => ({
      id: e.id,
      name: e.name,
      retired: e.retired ?? false,
      hierarchy: e.hierarchy ?? [],
      sections: (e.sections ?? []).map((s) => s.name),
      fields: e.fields.map((f) => `${f.id}:${f.name}:${f.type}:${f.sectionId ?? ''}`),
    })
    expect(second.entities.map(shapeOf)).toEqual(first.entities.map(shapeOf))
  })

  it('keeps a table’s own column DESCRIPTIONS, which are where the citations live', async () => {
    const { sheet } = await seededSheet()
    const before = Object.values(sheet.ctx().entities)
      .flatMap((e) => e.fields)
      .filter((f) => (f.description ?? '') !== '').length

    const file = buildExportPayload(sheet.ctx(), { name: 'Test Sheet', rev: 1 }, true)
    const read = validateEnvelope(file, ORG)
    expect(read.ok).toBe(true)
    if (!read.ok) return
    applyReplace({ ...read.data, quotes: file.quotes }, sheet.ports)

    const after = Object.values(sheet.ctx().entities)
      .flatMap((e) => e.fields)
      .filter((f) => (f.description ?? '') !== '').length

    expect(after).toBe(before)
    expect(before).toBeGreaterThan(100)
  })

  /* ---------------------------------------------------------- */
  /* IDENTITY                                                    */
  /* ---------------------------------------------------------- */

  it('gives every table, column and row back its own id', async () => {
    const { sheet } = await seededSheet()
    const s0 = sheet.ctx()
    const tableIds = Object.keys(s0.entities).sort()
    const rowIds = Object.values(s0.rowsByEntity)
      .flat()
      .map((r) => r.id)
      .sort()

    const file = buildExportPayload(s0, { name: 'Test Sheet', rev: 1 }, true)
    const read = validateEnvelope(file, ORG)
    expect(read.ok).toBe(true)
    if (!read.ok) return
    applyReplace({ ...read.data, quotes: file.quotes }, sheet.ports)

    const s1 = sheet.ctx()
    expect(Object.keys(s1.entities).sort()).toEqual(tableIds)
    expect(
      Object.values(s1.rowsByEntity)
        .flat()
        .map((r) => r.id)
        .sort(),
    ).toEqual(rowIds)
  })
})
