/// <reference types="node" />
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isDiscontinued, rowLabel, type EntityDef, type RowData } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import {
  depictionOf,
  depictionOfRow,
  firstRowDepicted,
  namesOfRow,
  rowsOfModel,
  standing,
  type Depicts,
} from './depicts'

/* ============================================================
   ONE ANSWER TO "WHICH BOAT IS THIS PHOTOGRAPH OF", measured against
   the real pack and the real heroes ledger — the same bytes the
   browser reads. The M2-close critique's finding 11 was two screens
   answering it two ways; every case below is a property the screens
   now share because they call this.
   ============================================================ */

interface HeroRow extends Depicts {
  id: string
}

const LEDGER = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../data/northside/heroes-ledger.json',
)
const heroes: HeroRow[] = (JSON.parse(readFileSync(LEDGER, 'utf8')) as HeroRow[]).map((h) => ({
  id: h.id,
  table: h.table,
  model: h.model,
}))
const hero = (id: string): HeroRow => {
  const found = heroes.find((h) => h.id === id)
  if (!found) throw new Error(`the heroes ledger holds no ${id}`)
  return found
}

/** The model-level name of a row, as the register files it. */
const modelName = (table: EntityDef, row: RowData): string =>
  String(row.values[table.displayFieldId ?? ''] ?? '')

describe('the rule, on names', () => {
  it('is the name, or a whole run of words inside it — never the front of a longer code', () => {
    expect(standing('SP560', 'SP560')).toBe('same')
    expect(standing('sp560 ', 'SP560')).toBe('same')
    expect(standing('519 Sea Ranger SDF', 'Stacer - 519 Sea Ranger SDF (Side Console)')).toBe(
      'within',
    )
    expect(standing('PA600', 'PA600EW')).toBeNull()
    expect(standing('PA600', 'XPA600')).toBeNull()
    expect(standing('519 Sea Ranger SDF', 'Stacer - 519 SeaMaster')).toBeNull()
    expect(standing('', 'SP560')).toBeNull()
    expect(standing('SP560', '  ')).toBeNull()
  })

  it('reads the names off the register’s own hierarchy, never the label', async () => {
    const pack = await loadPack()
    const stacer = pack.byKey('boat_stacer')
    const row = (pack.rowsByEntity.boat_stacer ?? []).find((r) =>
      modelName(stacer, r).includes('519 Sea Ranger SDF (Side'),
    )
    expect(row).toBeDefined()
    expect(namesOfRow(stacer, row!)).toEqual([
      'SEA RANGER (SIDE CONSOLES)',
      'Stacer - 519 Sea Ranger SDF (Side Console)',
    ])
  })
})

describe('every photograph the ledger holds, against every boat row', () => {
  it('draws the Stacer 519 Sea Ranger SDF for both of its consoles, and says which is which', async () => {
    const pack = await loadPack()
    const stacer = pack.byKey('boat_stacer')
    const rows = pack.rowsByEntity.boat_stacer ?? []
    const photo = hero('stacer-519-sea-ranger')

    const drawn = rows
      .map((row) => ({ row, depiction: depictionOfRow(heroes, stacer, row) }))
      .filter((d) => d.depiction?.picture === photo)
    expect(drawn.map((d) => modelName(stacer, d.row))).toEqual([
      'Stacer - 519 Sea Ranger SDF (Centre Console)',
      'Stacer - 519 Sea Ranger SDF (Side Console)',
    ])
    expect(drawn.map((d) => d.depiction?.beyond)).toEqual(['Centre Console', 'Side Console'])
    expect(drawn.every((d) => d.depiction?.standing === 'within')).toBe(true)
  })

  it('never draws it for the 539 or the 589, though the file points both at the 519’s picture', async () => {
    const pack = await loadPack()
    const stacer = pack.byKey('boat_stacer')
    const rows = pack.rowsByEntity.boat_stacer ?? []
    const imageField = stacer.fields.find((f) => f.name === 'Image Link')?.id ?? ''

    /* THE MAKER'S OWN MIS-FILING, read off the rows: the 539 and 589
       carry the 519's picture address. A match on the address would put
       the 519 on their stage; the match is on the model, so it does not. */
    const borrowing = rows.filter((row) => {
      const cell = JSON.stringify(row.values[imageField] ?? '')
      return cell.includes('519%20Sea%20Ranger') && !modelName(stacer, row).includes('519')
    })
    expect(borrowing.length).toBeGreaterThan(0)
    for (const row of borrowing) expect(depictionOfRow(heroes, stacer, row)).toBeNull()
  })

  it('draws a Highfield photograph for its model’s every colourway, and never for a longer code', async () => {
    const pack = await loadPack()
    const highfield = pack.byKey('boat_highfield')
    const rows = pack.rowsByEntity.boat_highfield ?? []
    const level = highfield.hierarchy?.[1] ?? ''

    for (const id of ['highfield-adv7', 'highfield-pa600', 'highfield-sp560', 'highfield-sp600']) {
      const photo = hero(id)
      /* counted a second way: the rows whose model level IS the model */
      const exact = rows.filter((r) => r.values[level] === photo.model).map((r) => r.id)
      const drawn = rows
        .filter((r) => depictionOfRow(heroes, highfield, r)?.picture === photo)
        .map((r) => r.id)
      expect(exact.length, id).toBeGreaterThan(0)
      expect(drawn, id).toEqual(exact)
    }
    /* PA600's longer codes are other boats */
    const longer = rows.filter((r) => /^PA600\w/u.test(String(r.values[level] ?? '')))
    expect(longer.length).toBeGreaterThan(0)
    for (const row of longer) expect(depictionOfRow(heroes, highfield, row)).toBeNull()
  })

  it('counts, for every photograph, exactly the rows it is drawn for', async () => {
    const pack = await loadPack()
    for (const photo of heroes) {
      const table = pack.byKey(photo.table)
      const rows = pack.rowsByEntity[photo.table] ?? []
      const drawn = rows.filter((r) => depictionOfRow(heroes, table, r)?.picture === photo).length
      expect(drawn, photo.id).toBeGreaterThan(0)
      expect(rowsOfModel(table, rows, photo.model), photo.id).toBe(drawn)
    }
  })

  it('answers the same off a frozen label as off the row, on every boat row of the file', async () => {
    const pack = await loadPack()
    let asked = 0
    for (const table of pack.entities.filter((e) => e.kind === 'boat')) {
      for (const row of pack.rowsByEntity[table.id] ?? []) {
        const byRow = depictionOfRow(heroes, table, row)?.picture
        const byLabel = depictionOf(heroes, table.id, [rowLabel(table, row)])?.picture
        expect(byLabel, `${table.id} ${row.id}`).toBe(byRow)
        asked += 1
      }
    }
    expect(asked).toBeGreaterThan(800)
  })

  it('answers nothing for another register, a blank name or a register it holds no picture of', async () => {
    const pack = await loadPack()
    const formosa = pack.byKey('boat_formosa')
    for (const row of pack.rowsByEntity.boat_formosa ?? []) {
      expect(depictionOfRow(heroes, formosa, row)).toBeNull()
    }
    expect(depictionOf(heroes, 'boat_stacer', [])).toBeNull()
    expect(depictionOf(heroes, '', ['SP560'])).toBeNull()
    expect(depictionOf(heroes, 'boat_stacer', ['SP560'])).toBeNull()
  })
})

describe('the longer model answers first', () => {
  it('lets a more specific name win over the shorter one inside it', () => {
    const short = { table: 't', model: '519 Sea Ranger' }
    const long = { table: 't', model: '519 Sea Ranger SDF' }
    const found = depictionOf([short, long], 't', ['Stacer - 519 Sea Ranger SDF (Side Console)'])
    expect(found?.picture).toBe(long)
    expect(depictionOf([short, long], 't', ['Stacer - 519 Sea Ranger XL'])?.picture).toBe(short)
  })

  it('prefers a name the model IS over one it stands inside', () => {
    const photo = { table: 't', model: 'SP560' }
    expect(depictionOf([photo], 't', ['Sport SP560 range', 'SP560'])).toEqual({
      picture: photo,
      standing: 'same',
      beyond: '',
    })
  })
})

describe('the version a pressed photograph opens on', () => {
  it('is the first row the file still sells that the photograph depicts', async () => {
    const pack = await loadPack()
    for (const photo of heroes) {
      const table = pack.byKey(photo.table)
      const rows = pack.rowsByEntity[photo.table] ?? []
      const first = firstRowDepicted(heroes, photo, table, rows)
      expect(first, photo.id).toBeDefined()
      expect(isDiscontinued(first!)).toBe(false)
      expect(depictionOfRow(heroes, table, first!)?.picture).toBe(photo)
      /* and no row before it in the file is a sellable row of the same photograph */
      const before = rows.slice(0, rows.indexOf(first!))
      expect(
        before.some(
          (r) => !isDiscontinued(r) && depictionOfRow(heroes, table, r)?.picture === photo,
        ),
      ).toBe(false)
    }
  })

  it('is nothing for a photograph of another register', async () => {
    const pack = await loadPack()
    const stacer = pack.byKey('boat_stacer')
    expect(
      firstRowDepicted(heroes, hero('highfield-adv7'), stacer, pack.rowsByEntity.boat_stacer ?? []),
    ).toBeUndefined()
  })
})
