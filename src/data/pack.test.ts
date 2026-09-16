/// <reference types="node" />
/* ============================================================
   THE PACK IS WHAT THE OLD APP LOADED, AND IT SAYS SO.

   Counts against the old repository's own holds, ids unique across
   every table, every link resolving to a row, no declared rung on a
   cost band, the per-table counts as measured, the fingerprint
   recomputed over the pack and compared with the one the manifest
   recorded off the old builder, and every picture accounted for.
   The Surtees assertions are `seedFidelity.test.ts`'s, kept as they
   were: the seed's job is to be faithful, not tidy.
   ============================================================ */
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DISCONTINUED_FIELD_ID,
  PAIR_FIELDS,
  displayFieldOf,
  type EntityDef,
  type RowData,
} from '@/domain/model'
import { OLD_MODULE_COUNT, seedFingerprint } from '@/data/pack/fingerprint'
import { countLedger } from '@/data/pack/images'
import { loadPack } from '@/test/fixtures/pack'

const pack = await loadPack()
const { manifest, entities, rowsByEntity, images } = pack

/** what `buildNorthsideProject()` put on the sheet, per table, measured
 *  2026-09-16 off the old builder and pinned so a resized table turns
 *  this red and prints the figure to replace it with */
const OLD_COUNTS: Record<string, number> = {
  boat_stacer: 91,
  boat_stabicraft: 37,
  boat_surtees: 19,
  boat_jeanneau: 27,
  boat_haines: 9,
  boat_highfield: 588,
  boat_formosa: 39,
  trl_redco: 52,
  trl_nsmcustom: 73,
  trl_gfab: 32,
  trl_stacertrailers: 34,
  trl_dunbier: 102,
  trl_mackay: 125,
  trl_bmt: 16,
  trl_obsolete: 10,
  mot_yamaha: 209,
  mot_epropulsion: 32,
  mot_pkg_haines: 39,
  mot_pkg_jeanneau: 50,
  parts: 2937,
  dealer_fit: 1777,
  rig_kits: 650,
  labour_rates: 18,
  oils_lubes: 27,
  registration: 19,
  join_hf_yam: 2519,
  join_stacer_yam: 434,
  join_formosa_yam: 270,
  join_stabicraft_yam: 239,
  join_surtees_yam: 144,
  join_jeanneau_yam: 78,
  join_jeanneau_pkg: 156,
  join_haines_pkg: 117,
  join_hf_trl: 146,
  join_stacer_trl: 142,
  join_formosa_trl: 92,
  join_stabicraft_trl: 84,
  join_surtees_trl: 29,
  join_jeanneau_trl: 16,
  join_hf_gfab: 51,
  join_stabicraft_gfab: 47,
  join_surtees_gfab: 11,
  join_haines_trl: 18,
  join_hf_df: 1342,
  join_stabicraft_df: 111,
  join_jeanneau_df: 42,
  join_hf_pd: 1707,
  join_stacer_pd: 363,
  join_stabicraft_pd: 204,
  join_formosa_pd: 130,
  join_jeanneau_pd: 118,
  join_surtees_pd: 39,
  join_surtees_obs: 30,
}

/** the old app's own fingerprint of the seed this pack was made from,
 *  read off `northsideSeedFingerprint()` on 2026-09-16 */
const OLD_FINGERPRINT = '1qz08ne'

const allRows = (): RowData[] => Object.values(rowsByEntity).flat()

describe('what the pack holds', () => {
  it('is 53 tables, 15,691 rows and 28 joins — northsideHolds.ts', () => {
    expect(manifest.counts).toEqual({ tables: 53, rows: 15691, joins: 28 })
    expect(entities.length).toBe(53)
    expect(allRows().length).toBe(15691)
    expect(entities.filter((e) => e.role === 'join').length).toBe(28)
  })

  it('holds every table at the size the old builder made it', () => {
    const measured: Record<string, number> = {}
    for (const t of manifest.tables) measured[t.key] = rowsByEntity[t.id].length
    expect(measured).toEqual(OLD_COUNTS)
    for (const t of manifest.tables) expect(t.rowCount, t.key).toBe(rowsByEntity[t.id].length)
  })

  it('carries orgId northside on every record', () => {
    for (const e of entities) expect(e.orgId, e.id).toBe('northside')
    for (const r of allRows()) expect(r.orgId, r.id).toBe('northside')
  })

  it('lists every table in the manifest once, in the order the sheet holds them', () => {
    expect(manifest.tables.map((t) => t.id)).toEqual(entities.map((e) => e.id))
    expect(new Set(manifest.tables.map((t) => t.key)).size).toBe(manifest.tables.length)
  })
})

describe('ids are deterministic and unique', () => {
  it('names each table by its seed key', () => {
    for (const t of manifest.tables) expect(t.id).toBe(t.key)
  })

  it('names each row key:ordinal, 1-based, in sheet order', () => {
    for (const e of entities) {
      rowsByEntity[e.id].forEach((r, i) => {
        expect(r.id).toBe(`${e.id}:${i + 1}`)
        expect(r.entityId).toBe(e.id)
      })
    }
  })

  it('never repeats a row id across the whole pack', () => {
    const ids = allRows().map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('names each field key.column, except the four the model reads by their literal id', () => {
    const literal = new Set([...PAIR_FIELDS.map((f) => f.id), DISCONTINUED_FIELD_ID])
    for (const e of entities) {
      const ids = e.fields.map((f) => f.id)
      expect(new Set(ids).size, e.id).toBe(ids.length)
      for (const id of ids) {
        if (literal.has(id)) continue
        expect(id.startsWith(`${e.id}.`), `${e.id}: ${id}`).toBe(true)
        expect(id.startsWith('__'), `${e.id}: ${id}`).toBe(false)
      }
    }
  })

  it('keeps the three pair fields on every join under their literal ids', () => {
    for (const e of entities.filter((x) => x.role === 'join')) {
      const ids = new Set(e.fields.map((f) => f.id))
      for (const f of PAIR_FIELDS) expect(ids.has(f.id), `${e.id} lacks ${f.id}`).toBe(true)
    }
  })

  it('resolves the display field and every hierarchy level to a field on the table', () => {
    for (const e of entities) {
      const ids = new Set(e.fields.map((f) => f.id))
      expect(e.displayFieldId && ids.has(e.displayFieldId), e.id).toBe(true)
      for (const h of e.hierarchy ?? []) expect(ids.has(h), `${e.id}: ${h}`).toBe(true)
    }
  })
})

describe('every link resolves', () => {
  it('points every reference column at a table on the pack', () => {
    const tables = new Set(entities.map((e) => e.id))
    for (const e of entities) {
      for (const f of e.fields) {
        if (f.type !== 'reference') continue
        expect(f.refEntityId && tables.has(f.refEntityId), `${e.id}.${f.name}`).toBe(true)
      }
    }
  })

  it('resolves every reference cell to a row of the referenced table', () => {
    const rowIds = new Map<string, Set<string>>()
    for (const e of entities) rowIds.set(e.id, new Set(rowsByEntity[e.id].map((r) => r.id)))
    let links = 0
    for (const e of entities) {
      const refs = e.fields.filter((f) => f.type === 'reference')
      if (refs.length === 0) continue
      for (const r of rowsByEntity[e.id]) {
        for (const f of refs) {
          const v = r.values[f.id]
          if (v === undefined || v === null) continue
          links += 1
          expect(typeof v, `${r.id}.${f.name}`).toBe('string')
          expect(rowIds.get(f.refEntityId as string)?.has(v as string), `${r.id}.${f.name} → ${String(v)}`).toBe(true)
        }
      }
    }
    /* two mandatory links per join row, so at least that many */
    expect(links).toBeGreaterThanOrEqual(8679 * 2)
  })
})

describe('the ladder', () => {
  it('declares priceLevels on every table — empty where the table is not priced', () => {
    for (const e of entities) expect(Array.isArray(e.priceLevels), e.id).toBe(true)
    for (const t of manifest.tables) expect(Array.isArray(t.priceLevels), t.key).toBe(true)
  })

  it('prices every boat, motor, trailer and parts table and nothing else', () => {
    for (const t of manifest.tables) {
      const priced = (t.priceLevels?.length ?? 0) > 0
      const shouldBe = t.kind === 'boat' || t.kind === 'motor' || t.kind === 'trailer' || t.key === 'parts'
      expect(priced, t.key).toBe(shouldBe)
    }
  })

  it('never declares a rung on a cost band', () => {
    for (const t of manifest.tables) {
      const cost = new Set(t.costColumns)
      const e = pack.byKey(t.key)
      for (const l of t.priceLevels ?? []) {
        expect(cost.has(l.fieldId), `${t.key}.${l.key}`).toBe(false)
        const f = e.fields.find((x) => x.id === l.fieldId)
        expect(f, `${t.key}.${l.key} names ${l.fieldId}`).toBeDefined()
        const band = e.sections?.find((s) => s.id === f?.sectionId)?.name.toLowerCase() ?? ''
        expect(band.includes('cost') || band.includes('markup'), `${t.key}.${l.key} under ${band}`).toBe(false)
        expect(l.label).toBe(f?.name)
      }
      expect(e.priceLevels).toEqual(t.priceLevels)
    }
  })

  it('carries the four source cells on the rungs that state what they contain', () => {
    const contains = manifest.tables.flatMap((t) => (t.priceLevels ?? []).map((l) => l.contains))
    for (const c of contains) if (c) expect(c.source.length).toBeGreaterThan(10)
    const stacer = manifest.tables.find((t) => t.key === 'boat_stacer')?.priceLevels ?? []
    expect(stacer.map((l) => l.key)).toEqual(['cash', 'trade', 'warranty'])
    expect(stacer[0].contains?.includesRegistration).toBe(false)
    const trailer = manifest.tables.find((t) => t.key === 'trl_dunbier')?.priceLevels ?? []
    expect(trailer.map((l) => l.label)).toEqual(['Sell inc Rego'])
    expect(trailer[0].contains?.includesRegistration).toBe(true)
    const parts = manifest.tables.find((t) => t.key === 'parts')?.priceLevels ?? []
    expect(parts.map((l) => l.key)).toEqual(['cash', 'fitted'])
    expect(parts[0].contains?.includesInstall).toBe(false)
    expect(parts[1].contains?.includesInstall).toBe(true)
  })

  it('names the cost columns the workbook files under its cost bands', () => {
    const stacer = manifest.tables.find((t) => t.key === 'boat_stacer')
    const e = pack.byKey('boat_stacer')
    const names = (stacer?.costColumns ?? []).map((id) => e.fields.find((f) => f.id === id)?.name)
    expect(names).toEqual(['Base Cost', 'Base Freight', 'Other Charges', 'Road Freight', 'Landed Hull Cost'])
  })
})

describe('the seed is the workbook, verbatim — seedFidelity.test.ts', () => {
  const surtees = entities.find((e) => e.name === 'Surtees') as EntityDef
  const field = displayFieldOf(surtees)
  const names = rowsByEntity[surtees.id].map((r) => String(r.values[field?.id ?? ''] ?? ''))

  it('keeps the dealer’s own misspelling of their own brand', () => {
    /* Boat Module!C223. Two spaces each side of the hyphen, and
       `Surtess` for `Surtees` — the workbook's, not ours. */
    expect(names).toContain('Surtess  -  770 Game Fisher XL')
    /* and the row above it is spelt right, with the same double
       spacing, which is how you can tell neither was normalised */
    expect(names).toContain('Surtees  -  770 Game Fisher')
  })

  it('keeps the trailing full stops the sheet types', () => {
    expect(names).toContain('495 - Pro Fisher.')
    expect(names).toContain('540 - Workmate.')
  })

  it('keeps the brand on the six rows that carry it and off the rest', () => {
    expect(names.length).toBe(19)
    expect(names.filter((n) => n.startsWith('Surte')).length).toBe(6)
  })

  it('keeps every row’s Source, and the retired and discontinued flags', () => {
    for (const e of entities) {
      const src = e.fields.find((f) => f.name === 'Source')
      expect(src, `${e.id} has no Source column`).toBeDefined()
      for (const r of rowsByEntity[e.id]) {
        expect(typeof r.values[src?.id ?? ''], `${r.id} has no Source`).toBe('string')
      }
    }
    expect(pack.byKey('trl_obsolete').retired).toBe(true)
    expect(pack.byKey('join_surtees_obs').retired).toBe(true)
    const flagged = allRows().filter((r) => r.values[DISCONTINUED_FIELD_ID] === true)
    expect(flagged.length).toBeGreaterThan(0)
    expect(flagged.every((r) => r.entityId === 'parts' || r.entityId === 'dealer_fit' || r.entityId === 'rig_kits' || r.entityId === 'trl_obsolete')).toBe(true)
  })
})

describe('the fingerprint', () => {
  it('recomputed over the pack is the one the manifest recorded off the old builder', () => {
    /* the old algorithm hashed every table name and non-join row count
       and then its own module count; the pack has no modules, so the
       nine is carried as the constant it was */
    const computed = seedFingerprint(
      manifest.tables.map((t) => ({ name: t.name, role: t.role, rowCount: t.rowCount })),
      OLD_MODULE_COUNT,
    )
    expect(computed).toBe(manifest.sourceFingerprint)
    expect(computed).toBe(OLD_FINGERPRINT)
  })

  it('records the source it was packed from', () => {
    expect(manifest.sourceSha256).toMatch(/^[0-9a-f]{64}$/)
    expect(manifest.name).toBe('Northside Marine')
    expect(manifest.version.length).toBeGreaterThan(0)
  })
})

describe('the image ledger', () => {
  const seeded = ((): Set<string> => {
    const out = new Set<string>()
    for (const e of entities) {
      const picture = new Set(e.fields.filter((f) => f.type === 'image').map((f) => f.id))
      for (const r of rowsByEntity[e.id]) {
        for (const [id, v] of Object.entries(r.values)) {
          if (picture.has(id) && Array.isArray(v)) for (const img of v) out.add(img.src)
        }
      }
    }
    return out
  })()

  it('accounts for every address the catalogue carries, exactly once, and no other', () => {
    const listed = images.map((e) => e.address)
    expect(new Set(listed).size).toBe(listed.length)
    expect([...listed].sort()).toEqual([...seeded].sort())
    expect(seeded.size).toBeGreaterThan(150)
  })

  it('counts held, unheld and refused off the ledger, and the manifest agrees', () => {
    const counts = countLedger(images)
    expect(manifest.images).toEqual({ file: 'images.json', ...counts })
    expect(counts.held + counts.unheld + counts.refused).toBe(images.length)
  })

  it('gives every held picture its provenance and a file that is really there', () => {
    const onDisk = new Set(readdirSync(pack.imagesDir).filter((f) => f.endsWith('.webp')))
    for (const e of images.filter((x) => x.file)) {
      expect(onDisk.has(e.file as string), e.address).toBe(true)
      expect(e.fetchedAt, e.address).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.width, e.address).toBeGreaterThan(0)
      expect(e.height, e.address).toBeGreaterThan(0)
      expect(e.sha1, e.address).toMatch(/^[0-9a-f]{40}$/)
      expect(e.host, e.address).toBe(new URL(e.address).host)
      expect(['scene', 'studio'], e.address).toContain(e.verdict)
      expect(e.error, e.address).toBeUndefined()
    }
    /* one file per address, one address per file */
    const files = images.map((e) => e.file).filter((f): f is string => f !== undefined)
    expect(new Set(files).size).toBe(files.length)
  })

  it('never says a picture is both held and refused, and never blanks the licence note', () => {
    for (const e of images) {
      expect(e.licenceNote.trim().length, e.address).toBeGreaterThan(0)
      if (e.file) expect(e.error).toBeUndefined()
      if (e.error) expect(e.file).toBeUndefined()
    }
  })

  it('records a measured reason on every refused address, as a clause naming the host', () => {
    for (const e of images.filter((x) => x.error)) {
      const why = e.error as string
      expect(why).not.toMatch(/^(this|it|the picture)\b/i)
      expect(why).not.toMatch(/[.!?]$/)
      expect(why, why).toMatch(/[a-z0-9-]+\.[a-z.]{2,}/)
      expect(why).not.toMatch(/similar|instead|stand-in|placeholder|sorry/i)
      expect(e.verdict).toBe('unknown')
    }
  })

  it('still counts every address nobody has asked for', () => {
    const unheld = images.filter((e) => !e.file && !e.error)
    expect(unheld.length).toBe(manifest.images.unheld)
    for (const e of unheld) expect(e.verdict, e.address).toBe('unknown')
  })

  it('keeps the chain on every copy that came off the mirror', () => {
    for (const e of images.filter((x) => x.via === 'mpf-mirror')) {
      expect(e.mirror, e.address).toMatch(/^mpf-mirror\//)
      expect(e.mirrorKey, e.address).toBe(e.sha1?.slice(0, 16))
    }
  })

  it('has the pack on disk where the loader looks', () => {
    expect(existsSync(path.join(pack.dataDir, 'manifest.json'))).toBe(true)
    for (const t of manifest.tables) expect(existsSync(path.join(pack.dataDir, t.file)), t.file).toBe(true)
  })
})
