/* ============================================================
   "TRAILER FOR SP560", ON THE REAL FILE.

   The critique of Milestone 2's close (#8) typed the sentence and got
   nothing. Every assertion below is a property over the pack — every
   trailer answered is one a trailer fitment list pairs with a boat
   that was asked about — rather than a count off today's file.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { buildSearchIndex, search } from '@/domain/catalogue/search'
import { PAIR_ORIGIN_FIELD, type EntityDef, type RowData } from '@/domain/model'
import { askedForFits, fitsFor, type BoatRef, type FitsWorld } from './fits'

let world: FitsWorld
let boatsFor: (words: string) => BoatRef[]

beforeAll(async () => {
  const pack = await loadPack()
  world = { entities: pack.ctx.entities, rowsByEntity: pack.ctx.rowsByEntity, views: {} }
  const index = buildSearchIndex(pack.ctx.entities, pack.ctx.rowsByEntity)
  const all = { perTable: 10_000, total: 100_000, tables: 6, modules: 4, quotes: 5, columns: 6 }
  boatsFor = (words) =>
    search(index, words, all)
      .groups.filter((g) => g.table.kind === 'boat')
      .flatMap((g) => g.hits.map((h) => ({ tableId: g.table.id, rowId: h.rowId })))
})

describe('reading the sentence', () => {
  it('takes the kind before the boat, with or without the joining words', () => {
    expect(askedForFits('trailer for sp560')).toEqual({
      kind: 'trailer',
      word: 'trailer',
      boat: 'sp560',
    })
    expect(askedForFits('Trailers SP560')).toMatchObject({ kind: 'trailer', boat: 'SP560' })
    expect(askedForFits('which engine fits the 519 sea ranger')).toMatchObject({
      kind: 'motor',
      boat: '519 sea ranger',
    })
    expect(askedForFits('motors to fit an ADV7')).toMatchObject({ kind: 'motor', boat: 'ADV7' })
    expect(askedForFits('outboards on sp560')).toMatchObject({ kind: 'motor', boat: 'sp560' })
  })

  it('takes the kind after the boat', () => {
    expect(askedForFits('sp560 trailer')).toMatchObject({ kind: 'trailer', boat: 'sp560' })
    expect(askedForFits('crossfire 449 motors')).toMatchObject({
      kind: 'motor',
      boat: 'crossfire 449',
    })
  })

  it('is not a question without a boat, or without a kind', () => {
    expect(askedForFits('trailer')).toBeNull()
    expect(askedForFits('trailer for')).toBeNull()
    expect(askedForFits('trailers x')).toBeNull()
    expect(askedForFits('sp560')).toBeNull()
    expect(askedForFits('yamaha f90')).toBeNull()
    /* a word that CONTAINS a kind is not one */
    expect(askedForFits('trailered sp560')).toBeNull()
  })
})

describe('answering it with what the build would offer', () => {
  /** every pair row on a join, as (boat, other, origin) */
  const pairsOn = (join: EntityDef): Array<{ a: string; b: string; origin: unknown }> => {
    const links = join.fields.filter((f) => f.type === 'reference')
    return (world.rowsByEntity[join.id] ?? []).map((r: RowData) => ({
      a: String(r.values[links[0]!.id] ?? ''),
      b: String(r.values[links[1]!.id] ?? ''),
      origin: r.values[PAIR_ORIGIN_FIELD],
    }))
  }

  it('trailer for sp560: every trailer answered is paired with an SP560 in the file', () => {
    const boats = boatsFor('sp560')
    expect(boats.length).toBeGreaterThan(1)
    const answer = fitsFor(world, boats, 'trailer')
    expect(answer.boats).toBe(boats.length)
    expect(answer.fits.length).toBeGreaterThan(0)

    const asked = new Set(boats.map((b) => b.rowId))
    const joins = Object.values(world.entities).filter((e) => e.role === 'join')
    for (const fit of answer.fits) {
      expect(world.entities[fit.tableId]?.kind, fit.label).toBe('trailer')
      expect(fit.fits).toBeGreaterThan(0)
      expect(fit.fits).toBeLessThanOrEqual(answer.boats)
      const paired = joins.some((j) =>
        pairsOn(j).some((p) => asked.has(p.a) && p.b === fit.rowId && p.origin !== 'removed'),
      )
      expect(paired, `${fit.label} is paired with an SP560 in a fitment list`).toBe(true)
    }
  })

  it('puts the file’s own pick first, then the widest fit', () => {
    const answer = fitsFor(world, boatsFor('sp560'), 'trailer')
    for (let i = 1; i < answer.fits.length; i += 1) {
      const a = answer.fits[i - 1]!
      const b = answer.fits[i]!
      expect(a.picks > b.picks || (a.picks === b.picks && a.fits >= b.fits)).toBe(true)
    }
  })

  it('motor for sp560 answers motors, and nothing but', () => {
    const answer = fitsFor(world, boatsFor('sp560'), 'motor')
    expect(answer.fits.length).toBeGreaterThan(0)
    for (const fit of answer.fits) {
      expect(world.entities[fit.tableId]?.kind, fit.label).toBe('motor')
    }
  })

  it('writes no view into the world it was handed', () => {
    const views = {}
    fitsFor({ ...world, views }, boatsFor('sp560'), 'trailer')
    expect(views).toEqual({})
  })
})
