import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { holdingsOf, modelRowsOf } from './holdings'

/* ============================================================
   Every figure home prints, measured against the pack itself.

   The assertions below are not transcribed from the direction board:
   each one is computed here from `data/northside/` a second way — by
   summing the manifest's own per-table row counts — and compared with
   what `holdingsOf` walked out of the loaded tables. Two readings of
   the same file agreeing is the only thing that makes a figure on a
   screen a measurement rather than a memory.
   ============================================================ */

describe('what the file holds', () => {
  it('counts the tables, the rows and the joins that actually loaded', async () => {
    const pack = await loadPack()
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const held = holdingsOf(tables, pack.rowsByEntity, pack.ctx.modules)

    const rowsInFile = Object.values(pack.rowsByEntity).reduce((n, list) => n + list.length, 0)
    const joins = pack.entities.filter((e) => e.role === 'join')

    expect(held.tables).toBe(pack.entities.length)
    expect(held.rows).toBe(rowsInFile)
    expect(held.joins).toBe(joins.length)
    expect(held.joinRows).toBe(
      joins.reduce((n, e) => n + (pack.rowsByEntity[e.id]?.length ?? 0), 0),
    )
    expect(held.baseRows + held.joinRows).toBe(held.rows)
    expect(held.baseTables + held.joins).toBe(held.tables)

    /* the manifest's own header, read only here — as the second
       opinion, never as the figure a screen prints */
    expect(held.tables).toBe(pack.manifest.counts.tables)
    expect(held.rows).toBe(pack.manifest.counts.rows)
    expect(held.joins).toBe(pack.manifest.counts.joins)
  })

  it('groups the base tables by kind, in the order the panel reads them', async () => {
    const pack = await loadPack()
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const held = holdingsOf(tables, pack.rowsByEntity, pack.ctx.modules)

    expect(held.kinds.map((k) => k.kind)).toEqual([
      'boat',
      'motor',
      'trailer',
      'package',
      'accessory',
      'custom',
    ])
    /* 'dealer' has no register in this file, so it is not drawn as a
       zero: a figure nobody can act on is noise */
    expect(held.kinds.some((k) => k.kind === 'dealer')).toBe(false)

    for (const kind of held.kinds) {
      const mine = pack.entities.filter((e) => e.role !== 'join' && e.kind === kind.kind)
      expect(kind.registers).toHaveLength(mine.length)
      expect(kind.rows).toBe(mine.reduce((n, e) => n + (pack.rowsByEntity[e.id]?.length ?? 0), 0))
    }
    expect(held.kinds.reduce((n, k) => n + k.rows, 0)).toBe(held.baseRows)
  })

  it('names a kind as the dealership names it, and never with a word from the model', async () => {
    const pack = await loadPack()
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const held = holdingsOf(tables, pack.rowsByEntity, pack.ctx.modules)
    const places = new Set(Object.values(pack.ctx.modules).map((m) => m.name))
    const labelOf = (kind: string): string => held.kinds.find((k) => k.kind === kind)?.label ?? ''

    /* one place holds it, so the panel uses that place's own name */
    expect(labelOf('accessory')).toBe('Parts & Accessories')
    expect(labelOf('boat')).toBe('Boats')
    /* two places hold the packages, so the kind's own noun covers both */
    expect(held.kinds.find((k) => k.kind === 'package')?.places).toEqual([
      'Factory Packages',
      'Dealer Fit Packages',
    ])
    expect(labelOf('package')).toBe('Packages')
    /* and 'custom' is the absence of a kind, so its registers are
       named rather than called "Custom table" at a reader */
    expect(labelOf('custom')).toBe('Labour Rates · Oils & Consumables · Registration Costs')

    for (const kind of held.kinds) {
      for (const place of kind.places) expect(places.has(place)).toBe(true)
    }
  })

  it('falls back to the contract own word when no place has been filed', async () => {
    const pack = await loadPack()
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const held = holdingsOf(tables, pack.rowsByEntity)
    expect(held.kinds.find((k) => k.kind === 'boat')?.label).toBe('Boats')
    expect(held.kinds.find((k) => k.kind === 'custom')?.label).toBe('Custom table')
    expect(held.kinds.every((k) => k.places.length === 0)).toBe(true)
  })

  it('lists the boat registers with their own row counts', async () => {
    const pack = await loadPack()
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const held = holdingsOf(tables, pack.rowsByEntity, pack.ctx.modules)

    const boats = pack.entities.filter((e) => e.role !== 'join' && e.kind === 'boat')
    expect(held.boats.map((b) => b.name).toSorted()).toEqual(boats.map((b) => b.name).toSorted())
    for (const register of held.boats) {
      expect(register.rows).toBe(pack.rowsByEntity[register.id]?.length ?? 0)
    }
    expect(held.boats.reduce((n, b) => n + b.rows, 0)).toBe(
      held.kinds.find((k) => k.kind === 'boat')?.rows,
    )
  })

  it('counts nothing at all from an empty sheet', () => {
    const held = holdingsOf({}, {})
    expect(held).toMatchObject({ tables: 0, rows: 0, joins: 0, baseRows: 0, kinds: [], boats: [] })
  })
})

describe('how many rows of a register are one model', () => {
  it('reads a model filed as its own level, and never a model that merely starts the same', async () => {
    const pack = await loadPack()
    const highfield = pack.byKey('boat_highfield')
    const rows = pack.rowsByEntity.boat_highfield ?? []

    /* counted a second way, straight off the rows */
    const level = highfield.hierarchy?.[1] ?? ''
    const bare = rows.filter((r) => r.values[level] === 'ADV7').length
    expect(bare).toBeGreaterThan(0)
    expect(modelRowsOf(highfield, rows, 'ADV7')).toBe(bare)
  })

  it('reads a model spelled inside a longer row name', async () => {
    const pack = await loadPack()
    const stacer = pack.byKey('boat_stacer')
    const rows = pack.rowsByEntity.boat_stacer ?? []
    const level = stacer.hierarchy?.[1] ?? ''

    const containing = rows.filter((r) => {
      const value = r.values[level]
      return typeof value === 'string' && value.toLowerCase().includes('519 sea ranger sdf')
    }).length
    expect(containing).toBeGreaterThan(0)
    expect(modelRowsOf(stacer, rows, '519 Sea Ranger SDF')).toBe(containing)

    /* the near neighbour is not swept in: 519 SeaMaster is a different
       boat that shares the first word and the number */
    expect(modelRowsOf(stacer, rows, '519 SeaMaster')).toBeLessThan(containing + 1)
  })

  /* THE ORDER IS THE SCREEN'S, NOT THE STORAGE ENGINE'S. Measured on the
     built screen: the seven makers arrived in the file's own order on a
     first visit and alphabetically out of IndexedDB on every visit
     after, so the composition of the brightest object on Home changed
     between two opens while no figure changed. The tables are handed in
     here in two different orders and the shelf comes back the same. */
  it('reads its registers biggest first, whatever order the tables arrived in', async () => {
    const pack = await loadPack()
    const forwards = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const backwards = Object.fromEntries(pack.entities.toReversed().map((e) => [e.id, e]))

    const one = holdingsOf(forwards, pack.rowsByEntity, pack.ctx.modules)
    const other = holdingsOf(backwards, pack.rowsByEntity, pack.ctx.modules)

    expect(one.boats.map((b) => b.id)).toEqual(other.boats.map((b) => b.id))
    expect(one.boats.length).toBeGreaterThan(1)
    const counts = one.boats.map((b) => b.rows)
    expect(counts).toEqual(counts.toSorted((a, b) => b - a))
    /* every kind's registers take the same stated order, not just the boats */
    for (const kind of one.kinds) {
      const rows = kind.registers.map((r) => r.rows)
      expect(rows, kind.label).toEqual(rows.toSorted((a, b) => b - a))
    }
  })

  it('answers nothing for a model the register does not carry', async () => {
    const pack = await loadPack()
    const stacer = pack.byKey('boat_stacer')
    expect(modelRowsOf(stacer, pack.rowsByEntity.boat_stacer ?? [], 'ADV7')).toBe(0)
    expect(modelRowsOf(stacer, pack.rowsByEntity.boat_stacer ?? [], '  ')).toBe(0)
  })
})
