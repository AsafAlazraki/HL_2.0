import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, ModuleDef, PriceLevel, RowData } from '@/domain/model'
import { isCostColumn } from '@/domain/quote/pricing'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import {
  DESK_PLACE,
  FILED_AT_THIS_DESK,
  REGISTER_WORD,
  matchesTable,
  pageOf,
  provenanceLine,
  readTableRegister,
  type TableRegister,
} from './register'

/* ============================================================
   THE REGISTER OF TABLES, READ OFF THE REAL PACK.

   Every figure asserted here is walked out of the pack fixture and
   then looked for in the reading — 53 tables, 15,691 rows, 28 joins,
   how many hang off each boat — never typed. The one thing typed is
   the SHAPE the sweep counted by hand (docs/research/refs/data/
   notes.md §0.3: 5 · 5 · 5 · 5 · 3 · 3 · 2), and it is asserted
   against the file so that the sweep and the engine are shown to
   agree rather than assumed to.
   ============================================================ */

let pack: PackFixture
let reg: TableRegister
let tables: Record<string, EntityDef>
let rows: Record<string, RowData[]>
let modules: Record<string, ModuleDef>
let levels: Record<string, PriceLevel[]>

beforeAll(async () => {
  pack = await loadPack()
  tables = {}
  for (const e of pack.entities) tables[e.id] = e
  rows = pack.rowsByEntity
  modules = pack.ctx.modules as Record<string, ModuleDef>
  levels = {}
  for (const t of pack.manifest.tables) levels[t.id] = t.priceLevels ?? []
  reg = readTableRegister(tables, rows, modules, levels)
})

describe('the head', () => {
  it('counts what loaded, and agrees with the manifest to the row', () => {
    expect(reg.head.tables).toBe(pack.manifest.tables.length)
    expect(reg.head.rows).toBe(pack.manifest.tables.reduce((n, t) => n + t.rowCount, 0))
    expect(reg.head.joins).toBe(pack.manifest.tables.filter((t) => t.role === 'join').length)
    expect(reg.head.base + reg.head.joins).toBe(reg.head.tables)
    expect(reg.head.baseRows + reg.head.joinRows).toBe(reg.head.rows)
    expect(reg.head.tables).toBe(pack.manifest.counts.tables)
    expect(reg.head.rows).toBe(pack.manifest.counts.rows)
    expect(reg.head.joins).toBe(pack.manifest.counts.joins)
  })
})

describe('the plates', () => {
  it('is one plate per boat table, in the places’ own order', () => {
    const boats = pack.entities.filter((e) => e.kind === 'boat' && e.role !== 'join')
    expect(reg.plates).toHaveLength(boats.length)
    expect(reg.head.boats).toBe(boats.length)
    /* the Boats module's own table order, not the alphabet's */
    const boatsModule = Object.values(modules).find((m) =>
      m.tableIds.every((id) => tables[id]?.kind === 'boat'),
    )!
    expect(reg.plates.map((p) => p.id)).toEqual(boatsModule.tableIds)
  })

  it('hangs every join off exactly one boat, and the sweep’s census reproduces', () => {
    const joins = pack.entities.filter((e) => e.role === 'join')
    expect(reg.pairings).toHaveLength(joins.length)
    for (const p of reg.pairings) {
      expect(tables[p.ownerId]?.kind).toBe('boat')
      expect(p.farId).not.toBe(p.ownerId)
      expect(p.rows).toBe(rows[p.joinId]!.length)
      /* a chip says what it pairs, never the word for the mechanism */
      expect(p.farName.toLowerCase()).not.toContain('join')
    }
    const hanging = reg.plates.map((p) => p.pairings.length)
    expect(hanging.reduce((n, k) => n + k, 0)).toBe(joins.length)
    expect([...hanging].toSorted((a, b) => b - a)).toEqual([5, 5, 5, 5, 3, 3, 2])
    /* every pairing row of the file is on some plate */
    expect(reg.plates.reduce((n, p) => n + p.pairingRows, 0)).toBe(reg.head.joinRows)
  })

  it('carries the riders on the eight motor joins', () => {
    const riders = reg.pairings.filter((p) => p.extras.length > 0)
    expect(riders.length).toBeGreaterThan(0)
    for (const p of riders) {
      for (const x of p.extras) expect(tables[x.id]).toBeDefined()
    }
  })

  it('marks the one retired pairing list as history', () => {
    const retired = reg.pairings.filter((p) => p.retired)
    expect(retired.map((p) => p.joinId)).toEqual(
      pack.entities.filter((e) => e.role === 'join' && e.retired).map((e) => e.id),
    )
  })
})

describe('the rows', () => {
  it('lists every base table that is not a boat, once, under its place', () => {
    const others = pack.entities.filter((e) => e.role !== 'join' && e.kind !== 'boat')
    expect(reg.rows).toHaveLength(others.length)
    expect(new Set(reg.rows.map((r) => r.id)).size).toBe(others.length)
    for (const r of reg.rows) {
      const module = modules[r.placeId]
      expect(module, `${r.name} is filed under a real place`).toBeDefined()
      expect(module!.tableIds).toContain(r.id)
      expect(r.place).toBe(module!.name)
    }
  })

  it('leads each place once and heads it only where the head says something new', () => {
    const leads = reg.rows.filter((r) => r.leads)
    expect(new Set(leads.map((r) => r.placeId)).size).toBe(leads.length)
    for (const r of reg.rows) {
      if (!r.leads) expect(r.headed).toBe(false)
      else expect(r.headed).toBe(r.placeSize > 1 || r.place !== r.name)
    }
    /* a place named for its one table does not print its name twice */
    const single = reg.rows.filter((r) => r.placeSize === 1 && r.place === r.name)
    expect(single.length).toBeGreaterThan(0)
    for (const r of single) expect(r.headed).toBe(false)
  })

  it('says what one row of each table is, in the table’s own word, never “rows”', () => {
    for (const r of reg.rows) {
      expect(r.holds).toMatch(new RegExp(`^${r.rows.toLocaleString('en-AU')} `))
      expect(r.holds).not.toMatch(/\brows?\b/)
      if (r.branch) {
        expect(r.branches).toBeGreaterThan(0)
        expect(r.holds).toContain(` in ${r.branches.toLocaleString('en-AU')} `)
      }
    }
    for (const p of reg.plates) expect(p.holds).not.toMatch(/\brows?\b/)
  })

  it('groups a count of thousands, and hands the screen the two halves apart', () => {
    /* the figure that was printed as "87 products" when one cell had to
       carry both halves — measured on this pack, 2026-09-23 */
    const parts = reg.rows.find((r) => r.rows > 999 && r.branch !== null)
    expect(parts, 'the pack has a table of more than a thousand rows under headings').toBeTruthy()
    expect(parts!.leafSay).toContain(',')
    expect(parts!.leafSay).toBe(`${parts!.rows.toLocaleString('en-AU')} ${parts!.leaf.many}`)
    expect(parts!.branchSay).toBe(
      `in ${parts!.branches.toLocaleString('en-AU')} ${parts!.branch!.many}`,
    )
    /* and the two halves ARE the whole, so nothing has to cut a string */
    for (const r of [...reg.rows, ...reg.plates]) {
      expect(r.branchSay === null ? r.leafSay : `${r.leafSay} ${r.branchSay}`).toBe(r.holds)
    }
  })

  it('counts the boats whose pairing lists name a table, and names the seven that none does', () => {
    const named = reg.rows.filter((r) => r.namedBy.boats.length > 0)
    const orphan = reg.rows.filter((r) => r.namedBy.boats.length === 0)
    expect(named.length + orphan.length).toBe(reg.rows.length)
    /* walked off the joins' own reference columns */
    const referenced = new Set<string>()
    for (const j of pack.entities.filter((e) => e.role === 'join')) {
      for (const f of j.fields)
        if (f.type === 'reference' && f.refEntityId) referenced.add(f.refEntityId)
    }
    for (const r of named) expect(referenced.has(r.id)).toBe(true)
    for (const r of orphan) expect(referenced.has(r.id)).toBe(false)
    expect(orphan.length).toBe(7)
  })

  it('calls a table with no kind a register, and every other by its kind’s own label', () => {
    for (const r of reg.rows) {
      if (r.kind === 'custom') expect(r.kindWord).toBe(REGISTER_WORD)
      else expect(r.kindWord).not.toBe(REGISTER_WORD)
      expect(r.kindWord).not.toMatch(/custom/i)
    }
  })

  it('flags the retired table and counts its cost columns without naming one', () => {
    const retired = reg.rows.filter((r) => r.retired)
    expect(retired.map((r) => r.id)).toEqual(
      pack.entities.filter((e) => e.role !== 'join' && e.retired).map((e) => e.id),
    )
    /* THE COST COUNT IS THE ENGINE'S RULE, NOT THE PACKER'S LIST, and
       the two disagree — measured here rather than assumed away. The
       store carries no per-table cost list, so a screen can only count
       what `isCostColumn` refuses, which is what the sheet marks at its
       heads; the packer's manifest names four more words on eleven
       tables (`docs/STATUS.md`, "the four it missed"), and the engine
       does not know them yet. This register counts the engine's answer
       so it can never disagree with the sheet, and this case holds the
       gap to exactly those four words so that the day `pricing.ts`
       learns them the count rises and the assertion below fails loudly. */
    const missed = new Set(['Total Nett CTD', 'Settlement', 'Discount', 'GP', 'GP ($)'])
    let short = 0
    for (const t of pack.manifest.tables) {
      const f = reg.facts[t.id]!
      const table = tables[t.id]!
      const engine = new Set(table.fields.filter((x) => isCostColumn(table, x)).map((x) => x.id))
      expect(f.costColumns).toBe(engine.size)
      expect(f.costColumns).toBeLessThanOrEqual(t.costColumns.length)
      for (const id of t.costColumns) {
        if (engine.has(id)) continue
        short += 1
        expect(missed.has(table.fields.find((x) => x.id === id)?.name ?? '')).toBe(true)
      }
      expect(f.columns).toBe(table.fields.length)
      expect(f.levels).toEqual((t.priceLevels ?? []).map((l) => l.label))
    }
    expect(short, 'the packer names cost columns the engine does not yet').toBeGreaterThan(0)
  })
})

describe('provenance', () => {
  it('is the first sentence of the file’s own description, for every table on the pack', () => {
    for (const e of pack.entities) {
      const f = reg.facts[e.id]!
      expect(f.provenance.kind).toBe('file')
      const line = f.provenance.line!
      expect(line.length).toBeGreaterThan(0)
      expect(e.description!.startsWith(line)).toBe(true)
      /* a workbook, a sheet, and no reading notes */
      expect(line).toMatch(/Module/)
      expect(line).not.toContain(' — ')
    }
  })

  it('cuts at a stop that starts a new sentence and not at a stop inside a file name', () => {
    expect(
      provenanceLine(
        'Boat Module (5).xlsx · sheet “Boat Module”, rows 4–142. Its columns are read.',
      ),
    ).toBe('Boat Module (5).xlsx · sheet “Boat Module”, rows 4–142.')
    expect(
      provenanceLine('Rigging Module.xlsx · rows 4–1350 — the eighth workbook, read directly.'),
    ).toBe('Rigging Module.xlsx · rows 4–1350')
    expect(provenanceLine('One sentence with no stop')).toBe('One sentence with no stop')
    expect(provenanceLine('')).toBeNull()
    expect(provenanceLine(undefined)).toBeNull()
  })

  it('says a table in no place was filed at this desk, on the day its record says', () => {
    const made: EntityDef = {
      id: 'mine',
      orgId: 'northside',
      name: 'Boat show leads',
      accent: 'blue',
      kind: 'custom',
      role: 'base',
      fields: [{ id: 'n', name: 'Name', type: 'text' }],
      position: { x: 0, y: 0 },
      createdAt: '2026-09-22T09:12:00.000Z',
      updatedAt: '2026-09-22T09:12:00.000Z',
    }
    const r = readTableRegister({ ...tables, mine: made }, { ...rows, mine: [] }, modules, levels)
    const row = r.rows.find((x) => x.id === 'mine')!
    expect(row.place).toBe(DESK_PLACE)
    expect(row.provenance.kind).toBe('desk')
    expect(row.provenance.line).toBe(`${FILED_AT_THIS_DESK} · 2026-09-22`)
    expect(row.headed).toBe(true)
    expect(row.holds).toBe('0 rows')
    /* it is last: the file's own places come first */
    expect(r.rows[r.rows.length - 1]!.id).toBe('mine')
    /* a boat made here is a plate, with no mark and no pairing */
    const boat = readTableRegister(
      { ...tables, mine: { ...made, kind: 'boat' } },
      { ...rows, mine: [] },
      modules,
      levels,
    )
    const plate = boat.plates.find((p) => p.id === 'mine')!
    expect(plate.pairings).toEqual([])
    expect(boat.rows.find((x) => x.id === 'mine')).toBeUndefined()
  })

  it('says nothing for a table from the file whose description is empty', () => {
    const blank = { ...tables.labour_rates!, description: '' }
    const r = readTableRegister({ ...tables, labour_rates: blank }, rows, modules, levels)
    expect(r.facts.labour_rates!.provenance).toEqual({ kind: 'none', line: null, whole: '' })
  })
})

describe('a page', () => {
  it('lists a boat’s pairings from its side and a motor’s from the other', () => {
    const boat = reg.plates[0]!
    const page = pageOf(reg, boat.id)!
    expect(page.pairings).toHaveLength(boat.pairings.length)
    for (const p of page.pairings) {
      expect(p.standing).toBe('owner')
      expect(p.otherId).toBe(p.farId)
    }
    const motor = reg.rows.find((r) => r.kind === 'motor' && r.namedBy.boats.length > 0)!
    const motorPage = pageOf(reg, motor.id)!
    expect(motorPage.pairings.length).toBeGreaterThan(0)
    for (const p of motorPage.pairings) {
      expect(p.standing).toBe('far')
      expect(p.otherName).toBe(p.ownerName)
    }
    expect(new Set(motorPage.pairings.map((p) => p.ownerName))).toEqual(
      new Set(motor.namedBy.boats),
    )
  })

  it('lists a rider’s pairings as the ones it rides on, and names a pairing list’s two ends', () => {
    const rider = reg.rows.find((r) =>
      reg.pairings.some((p) => p.extras.some((x) => x.id === r.id)),
    )!
    const page = pageOf(reg, rider.id)!
    expect(page.pairings.every((p) => p.standing === 'rider')).toBe(true)
    const join = reg.pairings[0]!
    const joinPage = pageOf(reg, join.joinId)!
    expect(joinPage.ends).toEqual({
      ownerName: join.ownerName,
      farName: join.farName,
      extras: join.extras.map((x) => x.name),
    })
    expect(pageOf(reg, 'nothing-here')).toBeNull()
  })
})

describe('finding one', () => {
  it('needs every word to hit the name, the kind, the place or the workbook', () => {
    const trailer = reg.rows.find((r) => r.kind === 'trailer')!
    expect(matchesTable(trailer, '')).toBe(true)
    expect(matchesTable(trailer, trailer.name.split(' ')[0]!)).toBe(true)
    expect(matchesTable(trailer, 'trailers')).toBe(true)
    expect(matchesTable(trailer, trailer.place.toLowerCase())).toBe(true)
    expect(matchesTable(trailer, 'Trailer Module')).toBe(true)
    expect(matchesTable(trailer, `${trailer.name} zzzz`)).toBe(false)
    const plate = reg.plates[0]!
    expect(matchesTable(plate, 'boats')).toBe(true)
  })
})
