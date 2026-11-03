import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { farSaid, fitsMatrixOf } from './fitsMatrix'
import { readTableRegister } from './register'

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

describe('the far side of a list of what fits, in its own words', () => {
  it('is what follows its “×”, with the packer’s “— Motor Fitment” taken off', () => {
    expect(farSaid('Highfield × Yamaha — Motor Fitment', 'Yamaha Outboards')).toBe('Yamaha')
    expect(farSaid('Highfield × NSM Custom — Trailer Fitment', 'NSM Custom Trailers')).toBe(
      'NSM Custom',
    )
    expect(farSaid('Stacer × P/D Parts', 'Parts & Accessories')).toBe('P/D Parts')
  })

  it('is the far list’s own name where the list carries no “×”', () => {
    expect(farSaid('Boats and their motors', 'Yamaha Outboards')).toBe('Yamaha Outboards')
  })
})

describe('the lists of what fits which boat, as one table', () => {
  it('holds every one of them once, and adds back to the file’s own count of them', () => {
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const register = readTableRegister(tables, pack.rowsByEntity, pack.ctx.modules)
    const m = fitsMatrixOf(register.plates, register.pairings)
    const joins = pack.entities.filter((e) => e.role === 'join')
    expect(m.lists).toBe(joins.length)
    expect(m.lines).toBe(joins.reduce((n, j) => n + (pack.rowsByEntity[j.id]?.length ?? 0), 0))
    expect(m.rows.map((r) => r.id)).toEqual(register.plates.map((p) => p.id))
    const ids = m.rows.flatMap((r) => r.cells.flat().map((c) => c.joinId))
    expect(new Set(ids).size).toBe(joins.length)
    /* every column is a kind some maker is paired with, each once */
    expect(new Set(m.columns).size).toBe(m.columns.length)
    /* in the order a boat is built: motor, trailer, packages, parts */
    expect(m.columns).toEqual(['motor', 'trailer', 'package', 'accessory'])
    for (const r of m.rows) {
      expect(r.cells.length).toBe(m.columns.length)
      expect(r.cells.flat().reduce((n, c) => n + c.lines, 0)).toBe(r.lines)
    }
  })
})
