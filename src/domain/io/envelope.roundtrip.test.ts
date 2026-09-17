/* ============================================================
   THE TRIP NOBODY HAD WALKED: EXPORT, THEN IMPORT WHAT CAME OUT.

   Every other test in this directory feeds `validateEnvelope` a
   hand-written fixture. A fixture is written by the same person
   thinking about the same rule, so it agrees with the importer by
   construction — and a fixture can never catch the one failure that
   matters most here, which is the EXPORTER and the IMPORTER
   disagreeing about the same file.

   They have disagreed twice, and both times the whole file was
   refused, so a person who saved a copy of their work could not
   open it again:

     "DUPLICATE ID __origin"        any project with two curated
                                    joins — the file-wide uniqueness
                                    rule did not know the pair columns
                                    are constants shared by design
     "DUPLICATE ID __discontinued"  the entire demo seed — the same
                                    oversight, one constant later.
                                    `isDiscontinued(row)` reads that
                                    literal id on ANY table, and the
                                    seed carries it on three

   The second was found the day the Import / export door was hung
   back on Home after the masthead was removed: the menu had been
   reachable from nothing, so nobody had pressed Everything against
   the real seed in a long time.

   So this walks the real trip, against the REAL seed, through the
   REAL exporter (`buildExportPayload`, which is the function the
   Everything card calls) and the REAL importer. It is deliberately
   coarse — counts, not shapes — because its job is to notice that
   the two halves have stopped agreeing, not to re-test what
   envelope.design.test.ts and envelope.images.test.ts already pin
   field by field.

   THE SEED IS THE PACK NOW, AND NOTHING ELSE MOVED. The old file
   built it with `loadNorthsideProject()` into the project store and
   read the store back; this reads `data/northside/` through the pack
   fixture and hands the exporter a `CatalogueCtx`, which is the same
   53 tables and 15,691 rows by a shorter road. Every count below is
   read off the pack on one side and off the validated file on the
   other, exactly as before.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { CatalogueCtx, OrgProfile, ProjectExport, RowData } from '@/domain/model'
import { makeCtx } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { buildExportPayload } from './exportPayload'
import { validateEnvelope } from './envelope'

const ORG = 'northside'

/* THE DEALERSHIP, NAMED — because the file is supposed to carry it.
   The pack has no `OrgProfile` on purpose (onboarding mints one), so
   a context without this would make "keeps the dealer's own name on
   the file" an assertion that undefined equals undefined, which is a
   test that cannot fail. This is Northside Marine, whose price file
   the pack is; nothing about it is invented. */
const NORTHSIDE: OrgProfile = {
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: '2026-01-01T00:00:00.000Z',
  slug: ORG,
}

/* ------------------------------------------------------------ */
/* helpers — read the same figure off either side of the trip     */
/* ------------------------------------------------------------ */

const rowsIn = (rows: Record<string, RowData[]> | undefined): number =>
  Object.values(rows ?? {}).reduce((n, list) => n + list.length, 0)

/** Every picture in every cell, as {cells, pictures}. A picture cell is
 *  an array of `ImageRef`, which is the shape that was once dropped
 *  wholesale by `isCellValue` — see envelope.images.test.ts. */
function picturesIn(rows: Record<string, RowData[]> | undefined): {
  cells: number
  pictures: number
} {
  let cells = 0
  let pictures = 0
  for (const list of Object.values(rows ?? {})) {
    for (const row of list) {
      for (const value of Object.values(row.values)) {
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === 'object' &&
          value[0] !== null &&
          'src' in value[0]
        ) {
          cells += 1
          pictures += value.length
        }
      }
    }
  }
  return { cells, pictures }
}

const columnsIn = (data: Pick<ProjectExport, 'entities'>): number =>
  data.entities.reduce((n, e) => n + e.fields.length, 0)

/* ------------------------------------------------------------ */

const PROJECT = { name: 'Northside Marine', rev: 1 }

/** The sheet as the seed leaves it, measured before anything moves. */
async function seeded(): Promise<
  { ctx: CatalogueCtx } & {
    tables: number
    rows: number
    pictures: { cells: number; pictures: number }
    orgName: string
  }
> {
  const pack = await loadPack()
  const ctx = makeCtx({ ...pack.ctx, org: NORTHSIDE })
  return {
    ctx,
    tables: Object.keys(ctx.entities).length,
    rows: rowsIn(ctx.rowsByEntity),
    pictures: picturesIn(ctx.rowsByEntity),
    orgName: NORTHSIDE.name,
  }
}

describe('the real seed survives a round trip through its own file', () => {
  it('EXPORTS A FILE ITS OWN IMPORTER ACCEPTS — the bug this test exists for', async () => {
    const before = await seeded()
    const file = buildExportPayload(before.ctx, PROJECT, true)
    const result = validateEnvelope(file, ORG)
    /* If this fails with an id sentence, a shared constant column has
       been added to the model without being taught to
       `isWellKnownFieldId` in envelope.ts. That is the whole bug,
       twice over. */
    expect(result.ok ? null : result.error).toBeNull()
  })

  it('brings every table and every row back', async () => {
    const before = await seeded()
    const result = validateEnvelope(buildExportPayload(before.ctx, PROJECT, true), ORG)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.entities).toHaveLength(before.tables)
    expect(rowsIn(result.data.rows)).toBe(before.rows)
    /* 15,691 rows across 53 tables is the seed as measured; a trip that
       silently halved it would still pass a "more than zero" check */
    expect(before.rows).toBeGreaterThan(3000)
  })

  it('brings every picture back, which is what silently vanished once', async () => {
    const before = await seeded()
    const result = validateEnvelope(buildExportPayload(before.ctx, PROJECT, true), ORG)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(picturesIn(result.data.rows)).toEqual(before.pictures)
    /* the seed really does carry pictures — without this the equality
       above would pass just as happily on two zeroes */
    expect(before.pictures.pictures).toBeGreaterThan(0)
  })

  it('brings every column back, bands and all', async () => {
    const before = await seeded()
    const file = buildExportPayload(before.ctx, PROJECT, true)
    const result = validateEnvelope(file, ORG)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(columnsIn(result.data)).toBe(columnsIn(file))
  })

  it('keeps the dealer’s own name on the file, so an imported set knows whose it is', async () => {
    const before = await seeded()
    const result = validateEnvelope(buildExportPayload(before.ctx, PROJECT, true), ORG)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.org?.name).toBe(before.orgName)
  })

  it('carries the three columns that are the same id on every table that has one', async () => {
    const before = await seeded()
    const result = validateEnvelope(buildExportPayload(before.ctx, PROJECT, true), ORG)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const carrying = result.data.entities.filter((e) =>
      e.fields.some((f) => f.id === '__discontinued'),
    )
    /* OBSOLETE Trailers, Parts & Accessories, Rigging Kits — the three
       that made the seed un-reimportable — and now Dealer Fit Packages,
       which joined them the moment that table stopped being scoped to the
       70 packages a hull names and started carrying its whole sheet. Its
       own divider was there all along, at Dealer Fit Module!C2032; nothing
       had ever read far enough down to meet it. */
    expect(carrying).toHaveLength(4)
  })

  it('keeps a retired table retired, instead of resurrecting it as live stock', async () => {
    const before = await seeded()
    const file = buildExportPayload(before.ctx, PROJECT, true)
    const wasRetired = file.entities.filter((e) => e.retired === true).map((e) => e.name)
    const result = validateEnvelope(file, ORG)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    /* the seed retires "OBSOLETE Trailers — No Longer Available". The
       import used to drop the flag, so Home went from counting 50 of
       53 tables to counting 53 — the app offering discontinued
       trailers to a customer because a file went out and came back. */
    expect(wasRetired.length).toBeGreaterThan(0)
    expect(result.data.entities.filter((e) => e.retired === true).map((e) => e.name)).toEqual(
      wasRetired,
    )
  })

  /* "everything else" was the old name of this test, and it stopped
     being true when the quotes came out of a structure-only copy — the
     privacy fix in exportPayload.ts, pinned in quotes.envelope.test.ts.
     What this one is about is the STRUCTURE surviving: every table, and
     none of the rows. */
  it('“Structure only” drops the rows and keeps every table', async () => {
    const before = await seeded()
    const file = buildExportPayload(before.ctx, PROJECT, false)
    const result = validateEnvelope(file, ORG)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(rowsIn(result.data.rows)).toBe(0)
    expect(result.data.entities).toHaveLength(before.tables)
    /* and no customer documents: structure is tables, columns, pages
       and rules — a quote names a person */
    expect(result.data.quotes).toBeUndefined()
  })

  /* THE TENANT KEY IS THE READER'S, NOT THE FILE'S — the one thing
     this build added to the trip. Every record `validateEnvelope`
     mints carries the `orgId` it was handed, so a set a colleague
     sends over is filed under the business opening it rather than
     under theirs. */
  it('files every record under the business that opened the file', async () => {
    const before = await seeded()
    const result = validateEnvelope(buildExportPayload(before.ctx, PROJECT, true), 'another-yard')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(new Set(result.data.entities.map((e) => e.orgId))).toEqual(new Set(['another-yard']))
    const rows = Object.values(result.data.rows ?? {}).flat()
    expect(rows.length).toBeGreaterThan(3000)
    expect(new Set(rows.map((r) => r.orgId))).toEqual(new Set(['another-yard']))
  })
})
