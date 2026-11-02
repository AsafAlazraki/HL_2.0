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
import {
  NOBODY_AT_THE_DESK,
  NOT_IN_GALLERY,
  OPTION_GONE,
  PICTURE_GONE,
} from '@/domain/model/ownPictures'
import { emptySheet, indexRows, type CatalogueData } from './sheet'
import { isDone, type CatalogueCommand, type Done } from './commands'
import {
  COVER_STAYS_FIRST,
  NOT_OUR_BYTES,
  addOwnPicture,
  addOwnPictures,
  coverPicture,
  galleryFor,
  movePicture,
  optionNamed,
  overTheBounds,
  ownPictureFor,
  ownPicturesFor,
  removeOwnPicture,
  standingGalleries,
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

  /* REWRITTEN 2026-11-02 to the owner's new truth ("per boat and product the ability to have more
     than one image"): it was 'replaces the one before it, says whose, and the way back puts that
     one back exactly'. A second picture now stands beside the first. */
  it('stands beside the one before it, oldest first, and its way back takes only itself', () => {
    const first = run(sheet, addOwnPicture({ ...BATTERY, picture: taken(), by: 'Mia' }))
    const was = ownPictureFor(first.next, BATTERY.table, BATTERY.row)!
    const second = run(first.next, add('Asaf', { file: 'mfm50-front.jpg' }), LATER)
    expect(second.said).toBe('Your picture is on the Battery MFM50 now.')
    const both = ownPicturesFor(second.next, BATTERY.table, BATTERY.row)
    expect(both.map((p) => p.addedBy)).toEqual(['Mia', 'Asaf'])
    expect(both[0]).toBe(was)
    const back = run(second.next, second.inverse, LATER)
    expect(back.said).toBe('Your picture is off the Battery MFM50.')
    expect(ownPicturesFor(back.next, BATTERY.table, BATTERY.row)).toEqual([was])
  })

  it('takes several at once as one step, in the order of their files, or none of them', () => {
    const done = run(
      sheet,
      addOwnPictures({
        ...BATTERY,
        name: 'Battery MFM50',
        pictures: [taken({ file: 'mfm50-2.jpg' }), taken({ file: 'mfm50-10.jpg' })],
        by: 'Asaf',
      }),
    )
    expect(done.said).toBe('Your 2 pictures are on the Battery MFM50 now.')
    expect(ownPicturesFor(done.next, BATTERY.table, BATTERY.row).map((p) => p.file)).toEqual([
      'mfm50-2.jpg',
      'mfm50-10.jpg',
    ])
    expect(run(done.next, done.inverse).said).toBe('Your 2 pictures are off the Battery MFM50.')
    const half = addOwnPictures({
      ...BATTERY,
      pictures: [taken(), taken({ src: 'https://example.com/b.jpg' })],
      by: 'Asaf',
    })(sheet, NOW)
    expect(half).toEqual({ refused: NOT_OUR_BYTES })
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

/* REWRITTEN 2026-11-02 to the owner's new truth ("cover image and whatnot"): it was 'choosing it
   over the maker’s · is one step each way, and choosing what is chosen is nothing'. Choosing one
   picture over another is now choosing the row's cover, among all its pictures. */
describe('the cover', () => {
  /** two of the dealer's on the battery, and the ids the reader would draw them by */
  const two = () => {
    const done = run(
      sheet,
      addOwnPictures({
        ...BATTERY,
        name: 'Battery MFM50',
        pictures: [taken(), taken()],
        by: 'Asaf',
      }),
    )
    const shown = ownPicturesFor(done.next, BATTERY.table, BATTERY.row).map((p) => `own:${p.id}`)
    return { data: done.next, shown }
  }
  const cover = (shown: readonly string[], id: string, by: string | null = 'Asaf') =>
    coverPicture({ ...BATTERY, name: 'Battery MFM50', shown, id, by })

  it('is one step, said, filed for the option by its own name, and its way back leaves none', () => {
    const { data, shown } = two()
    const done = run(data, cover(shown, shown[1]!), LATER)
    expect(done.said).toBe('The Battery MFM50’s cover is your picture now.')
    expect(galleryFor(done.next, BATTERY.table, BATTERY.row)).toMatchObject({
      option: 'MFM50 - Battery MFM50',
      cover: shown[1],
      order: shown,
      by: 'Asaf',
      at: LATER,
    })
    expect(done.event).toMatchObject({ kind: 'picture-set', rowId: BATTERY.row })
    const back = run(done.next, done.inverse, LATER)
    expect(back.said).toBe('The Battery MFM50’s cover is as it was.')
    expect(back.next.galleries).toBeUndefined()
  })

  it('may be a picture the app holds of the item, said as the maker’s', () => {
    const { data, shown } = two()
    const held = 'row:https://example.com/mfm50.jpg'
    const mine = run(data, cover([shown[0]!, held], held))
    expect(mine.said).toBe('The Battery MFM50’s cover is the maker’s picture now.')
  })

  it('keeps one record per option: a second choice changes it, and its way back puts it back', () => {
    const { data, shown } = two()
    const first = run(data, cover(shown, shown[1]!))
    const was = galleryFor(first.next, BATTERY.table, BATTERY.row)!
    const again = run(first.next, cover([shown[1]!, shown[0]!], shown[0]!), LATER)
    expect(Object.keys(again.next.galleries ?? {})).toEqual([was.id])
    expect(galleryFor(again.next, BATTERY.table, BATTERY.row)?.cover).toBe(shown[0])
    expect(galleryFor(run(again.next, again.inverse).next, BATTERY.table, BATTERY.row)).toBe(was)
  })

  it('is nothing where it is the cover already, and refused for a picture not of this option', () => {
    const { data, shown } = two()
    expect(cover(shown, shown[0]!)(data, NOW)).toEqual({ refused: '' })
    expect(cover(shown, 'own:elsewhere')(data, NOW)).toEqual({ refused: NOT_IN_GALLERY })
    /* one of Northside's that is another option's is not this one's, whatever a screen says */
    const other = run(data, addOwnPicture({ ...TWO, picture: taken(), by: 'Asaf' }))
    const theirs = `own:${ownPictureFor(other.next, TWO.table, TWO.row)!.id}`
    expect(cover([...shown, theirs], theirs)(other.next, NOW)).toEqual({ refused: NOT_IN_GALLERY })
    expect(cover(shown, shown[1]!, null)(data, NOW)).toEqual({ refused: NOBODY_AT_THE_DESK })
  })
})

describe('the order', () => {
  const three = () => {
    const done = run(
      sheet,
      addOwnPictures({
        ...BATTERY,
        name: 'Battery MFM50',
        pictures: [taken({ file: 'a.jpg' }), taken({ file: 'b.jpg' }), taken({ file: 'c.jpg' })],
        by: 'Asaf',
      }),
    )
    const shown = ownPicturesFor(done.next, BATTERY.table, BATTERY.row).map((p) => `own:${p.id}`)
    return { data: done.next, shown }
  }
  const move = (shown: readonly string[], id: string, to: number) =>
    movePicture({ ...BATTERY, name: 'Battery MFM50', shown, id, to, by: 'Asaf' })

  it('moves one picture among the others as one step, says where, and its way back undoes it', () => {
    const { data, shown } = three()
    const [a, b, c] = shown as [string, string, string]
    const done = run(data, move(shown, c, 1))
    expect(done.said).toBe('Your picture is 2 of 3 on the Battery MFM50 now.')
    expect(galleryFor(done.next, BATTERY.table, BATTERY.row)?.order).toEqual([a, c, b])
    expect(galleryFor(done.next, BATTERY.table, BATTERY.row)?.cover).toBeUndefined()
    const back = run(done.next, done.inverse)
    expect(back.said).toBe('The Battery MFM50’s pictures are in the order they were.')
    expect(back.next.galleries).toBeUndefined()
  })

  it('keeps the cover first: it is not moved, and nothing is moved before it', () => {
    const { data, shown } = three()
    const [a, b, c] = shown as [string, string, string]
    expect(move(shown, a, 2)(data, NOW)).toEqual({ refused: COVER_STAYS_FIRST })
    const done = run(data, move(shown, c, 0))
    expect(galleryFor(done.next, BATTERY.table, BATTERY.row)?.order).toEqual([a, c, b])
    expect(move(shown, b, 1)(data, NOW)).toEqual({ refused: '' })
  })

  it('keeps the cover chosen when the others are moved', () => {
    const { data, shown } = three()
    const [a, b, c] = shown as [string, string, string]
    const chosen = run(data, coverPicture({ ...BATTERY, shown, id: c, by: 'Asaf' }))
    const moved = run(chosen.next, move([c, a, b], b, 1))
    expect(galleryFor(moved.next, BATTERY.table, BATTERY.row)).toMatchObject({
      cover: c,
      order: [c, b, a],
    })
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

  it('and so does its arrangement: kept, and not read for whatever stands there now', () => {
    const added = run(
      sheet,
      addOwnPictures({ ...BATTERY, pictures: [taken(), taken()], by: 'Asaf' }),
    )
    const shown = ownPicturesFor(added.next, BATTERY.table, BATTERY.row).map((p) => `own:${p.id}`)
    const chosen = run(added.next, coverPicture({ ...BATTERY, shown, id: shown[1]!, by: 'Asaf' }))
    expect(standingGalleries(chosen.next)).toHaveLength(1)
    const entity = sheet.tables.parts!
    const nameField = entity.fields.find(
      (f) => String(sheet.index.rowById['parts:119']!.values[f.id]) === 'MFM50 - Battery MFM50',
    )!
    const rows = {
      ...chosen.next.rows,
      parts: (chosen.next.rows.parts ?? []).map((r) =>
        r.id === 'parts:119' ? { ...r, values: { ...r.values, [nameField.id]: 'D Shackle' } } : r,
      ),
    }
    const next: CatalogueData = { ...chosen.next, rows, index: indexRows(rows) }
    expect(standingGalleries(next)).toEqual([])
    expect(galleryFor(next, BATTERY.table, BATTERY.row)).toBeNull()
    expect(Object.keys(next.galleries ?? {})).toHaveLength(1)
  })
})
