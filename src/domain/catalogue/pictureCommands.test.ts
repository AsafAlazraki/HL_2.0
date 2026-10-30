/* ============================================================
   A PICTURE NORTHSIDE ADDS, AS A COMMAND, ON THE REAL PRICE LIST —
   each act one step with its sentence, its provenance read off the
   desk and the clock, and a way back that puts back the very record.

   The options are the price list's own: the Battery MFM50
   (`parts:119`, "MFM50 - Battery MFM50" in the list) and its
   neighbour, the 2 x MFM50 Batteries (`parts:121`), the alike option
   a picture must never reach.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import type { RowData } from '@/domain/model'
import { NOBODY_AT_THE_DESK, OPTION_GONE, PICTURE_GONE } from '@/domain/model/ownPictures'
import { emptySheet, indexRows, type CatalogueData } from './sheet'
import { isDone, type CatalogueCommand, type Done } from './commands'
import {
  NOT_OUR_BYTES,
  addOwnPicture,
  chooseOwnPicture,
  optionNamed,
  overTheBounds,
  ownPictureFor,
  removeOwnPicture,
  standingOwnPictures,
  type PictureTaken,
} from './pictureCommands'

const NOW = new Date(2026, 9, 30, 12).toISOString()
const LATER = new Date(2026, 10, 2, 9).toISOString()
const BATTERY = { table: 'parts', row: 'parts:119' }
const TWO = { table: 'parts', row: 'parts:121' }

const taken = (more: Partial<PictureTaken> = {}): PictureTaken => ({
  src: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA=',
  width: 1100,
  height: 825,
  file: 'mfm50.jpg',
  ...more,
})

let sheet: CatalogueData

beforeAll(async () => {
  const pack = await loadPack()
  const rows: Record<string, RowData[]> = {}
  for (const e of pack.entities) rows[e.id] = [...(pack.rowsByEntity[e.id] ?? [])]
  sheet = {
    ...emptySheet(),
    orgId: 'northside',
    tables: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
    rows,
    index: indexRows(rows),
  }
})

function run(data: CatalogueData, command: CatalogueCommand, at = NOW): Done {
  const out = command(data, at)
  if (!isDone(out)) throw new Error(`refused: ${out.refused}`)
  return out
}

const add = (by: string | null = 'Asaf', more: Partial<PictureTaken> = {}) =>
  addOwnPicture({ ...BATTERY, name: 'Battery MFM50', picture: taken(more), by })

describe('adding a picture to one option', () => {
  it('files it with the option’s own name, who and when, as one step', () => {
    expect(optionNamed(sheet, BATTERY.table, BATTERY.row)).toBe('MFM50 - Battery MFM50')
    const done = run(sheet, add())
    expect(done.said).toBe('Your picture is on the Battery MFM50 now.')
    const p = ownPictureFor(done.next, BATTERY.table, BATTERY.row)!
    expect(p).toMatchObject({
      orgId: 'northside',
      table: 'parts',
      row: 'parts:119',
      option: 'MFM50 - Battery MFM50',
      name: 'Battery MFM50',
      width: 1100,
      height: 825,
      file: 'mfm50.jpg',
      addedBy: 'Asaf',
      addedAt: NOW,
      chosen: false,
    })
    expect(p.bytes).toBeGreaterThan(0)
    expect(done.event).toMatchObject({
      kind: 'picture-set',
      tableId: 'parts',
      rowId: 'parts:119',
      label: 'Picture · Battery MFM50',
    })
  })

  it('belongs to that option only: its alike neighbour has none', () => {
    const done = run(sheet, add())
    expect(ownPictureFor(done.next, TWO.table, TWO.row)).toBeNull()
    expect(standingOwnPictures(done.next)).toHaveLength(1)
  })

  it('is taken back by its way back, leaving nothing behind', () => {
    const done = run(sheet, add())
    const back = run(done.next, done.inverse)
    expect(back.said).toBe('Your picture is off the Battery MFM50.')
    expect(back.next.ownPictures).toBeUndefined()
  })

  it('replaces the one before it, says whose, and the way back puts that one back exactly', () => {
    const first = run(sheet, addOwnPicture({ ...BATTERY, picture: taken(), by: 'Mia' }))
    const was = ownPictureFor(first.next, BATTERY.table, BATTERY.row)!
    const second = run(first.next, add('Asaf', { file: 'mfm50-front.jpg' }), LATER)
    expect(second.said).toBe(
      'Your picture is on the Battery MFM50 now, in place of the one Mia added on 30 October 2026.',
    )
    expect(Object.keys(second.next.ownPictures ?? {})).toHaveLength(1)
    const back = run(second.next, second.inverse, LATER)
    expect(back.said).toBe('The Battery MFM50 has Mia’s picture again.')
    expect(ownPictureFor(back.next, BATTERY.table, BATTERY.row)).toBe(was)
  })
})

describe('taking it off', () => {
  it('is one step, and Undo puts back the same picture with the same day', () => {
    const added = run(sheet, add())
    const p = ownPictureFor(added.next, BATTERY.table, BATTERY.row)!
    const off = run(added.next, removeOwnPicture(p.id, 'Asaf'), LATER)
    expect(off.said).toBe('Your picture is off the Battery MFM50.')
    expect(off.next.ownPictures).toBeUndefined()
    const back = run(off.next, off.inverse, LATER)
    expect(back.said).toBe('Your picture is back on the Battery MFM50.')
    const again = ownPictureFor(back.next, BATTERY.table, BATTERY.row)
    expect(again).toBe(p)
    expect(again?.addedAt).toBe(NOW)
  })

  it('names the person who added it to anybody else', () => {
    const added = run(sheet, add('Mia'))
    const p = ownPictureFor(added.next, BATTERY.table, BATTERY.row)!
    expect(run(added.next, removeOwnPicture(p.id, 'Asaf')).said).toBe(
      'Mia’s picture is off the Battery MFM50.',
    )
  })

  it('refuses a picture already off', () => {
    expect(removeOwnPicture('gone', 'Asaf')(sheet, NOW)).toEqual({ refused: PICTURE_GONE })
  })
})

describe('choosing it over the maker’s', () => {
  it('is one step each way, and choosing what is chosen is nothing', () => {
    const added = run(sheet, add())
    const p = ownPictureFor(added.next, BATTERY.table, BATTERY.row)!
    const chose = run(added.next, chooseOwnPicture(p.id, true, 'Asaf'))
    expect(chose.said).toBe('The Battery MFM50 shows your picture instead of the maker’s.')
    expect(ownPictureFor(chose.next, BATTERY.table, BATTERY.row)?.chosen).toBe(true)
    expect(chooseOwnPicture(p.id, true, 'Asaf')(chose.next, NOW)).toEqual({ refused: '' })
    const back = run(chose.next, chose.inverse)
    expect(ownPictureFor(back.next, BATTERY.table, BATTERY.row)).toBe(p)
  })
})

describe('what is refused, each with its sentence', () => {
  it('a picture nobody at the desk could have added', () => {
    expect(add(null)(sheet, NOW)).toEqual({ refused: NOBODY_AT_THE_DESK })
    expect(add('  ')(sheet, NOW)).toEqual({ refused: NOBODY_AT_THE_DESK })
  })

  it('an option the price list does not have', () => {
    const out = addOwnPicture({ table: 'parts', row: 'parts:999999', picture: taken(), by: 'Asaf' })
    expect(out(sheet, NOW)).toEqual({ refused: OPTION_GONE })
  })

  it('a picture this app did not make, or one past the bounds', () => {
    expect(add('Asaf', { src: 'https://example.com/mfm50.jpg' })(sheet, NOW)).toEqual({
      refused: NOT_OUR_BYTES,
    })
    expect(add('Asaf', { width: 2400, height: 1600 })(sheet, NOW)).toEqual({
      refused: overTheBounds(2400, 1600),
    })
  })
})

describe('a picture stands only while its option is named as it was', () => {
  it('is kept but not drawn when a new price list puts another option at its place', () => {
    const added = run(sheet, add())
    const p = ownPictureFor(added.next, BATTERY.table, BATTERY.row)!
    /* the price list's next version moved another line to this place */
    const entity = sheet.tables.parts!
    const nameField = entity.fields.find(
      (f) => String(sheet.index.rowById['parts:119']!.values[f.id]) === 'MFM50 - Battery MFM50',
    )
    expect(nameField, 'the field the option is named by').toBeDefined()
    const moved: RowData[] = (added.next.rows.parts ?? []).map((r) =>
      r.id === 'parts:119'
        ? { ...r, values: { ...r.values, [nameField!.id]: 'D Shackle - 10 mm Galv' } }
        : r,
    )
    const rows = { ...added.next.rows, parts: moved }
    const next: CatalogueData = { ...added.next, rows, index: indexRows(rows) }
    expect(ownPictureFor(next, BATTERY.table, BATTERY.row)).toBeNull()
    expect(standingOwnPictures(next)).toEqual([])
    expect(next.ownPictures?.[p.id]).toBe(p)
  })
})
