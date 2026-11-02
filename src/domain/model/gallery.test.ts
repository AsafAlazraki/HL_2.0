/* ============================================================
   A ROW'S GALLERY, ASKED OF THE REAL BOOK — the three ledgers this
   repository ships, so every held picture here is a real one:

     · the Formosa GRT 425 (Tiller), `boat_formosa:1`: a photograph on
       the water and a studio picture, both marked by a person as that
       exact row;
     · the Highfield CL420 at `boat_highfield:162`: a photograph and a
       studio picture of the MODEL, neither recorded as this row's
       finish;
     · a rigging kit, `rig_kits:1`, which no maker photographs.

   The dealer's bytes are a test's own `data:` string, never a picture:
   these rules read ids and order, not what a picture shows.
   ============================================================ */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { bytesOf, type OwnPicture } from './ownPictures'
import { pictureBook, type Item, type PictureBook } from './pictures'
import {
  GALLERY_ORDER_LIMIT,
  heldGallery,
  moveIn,
  onceEach,
  ownId,
  printableOnCover,
  printableOnLine,
  readGalleryOrder,
  sourceOf,
  standingOf,
  withGalleries,
  type GalleryOrder,
} from './gallery'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const ledger = (name: string): unknown =>
  JSON.parse(readFileSync(path.join(ROOT, 'data', 'northside', name), 'utf8'))

const book: PictureBook = pictureBook(
  {
    images: ledger('images.json'),
    pictures: ledger('pictures.json'),
    marks: ledger('marks-ledger.json'),
  },
  '/',
)

const NOON = new Date(2026, 10, 2, 12).toISOString()
const LATER = new Date(2026, 10, 2, 13).toISOString()
const BYTES = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='

const FORMOSA: Item = { table: 'boat_formosa', row: 'boat_formosa:1' }
const CL420: Item = { table: 'boat_highfield', row: 'boat_highfield:162' }
const KIT: Item = { table: 'rig_kits', row: 'rig_kits:1' }
const KIT_NEXT: Item = { table: 'rig_kits', row: 'rig_kits:2' }

const own = (item: Item, id: string, more: Partial<OwnPicture> = {}): OwnPicture => ({
  id,
  orgId: 'northside',
  table: item.table,
  row: item.row,
  option: 'as the price list names it',
  name: 'as the screen said it',
  src: BYTES,
  width: 1100,
  height: 825,
  bytes: bytesOf(BYTES),
  addedBy: 'Asaf',
  addedAt: NOON,
  chosen: false,
  ...more,
})

const order = (item: Item, more: Partial<GalleryOrder> = {}): GalleryOrder => ({
  id: `order-${item.row}`,
  orgId: 'northside',
  table: item.table,
  row: item.row,
  option: 'as the price list names it',
  name: 'as the screen said it',
  order: [],
  by: 'Asaf',
  at: NOON,
  ...more,
})

const ids = (b: PictureBook, item: Item): string[] => b.gallery(item).map((p) => p.id)
const safeId = (v: unknown): v is string => typeof v === 'string' && /^[\w:.-]{1,200}$/.test(v)

describe('the held pictures of a row, as one gallery', () => {
  it('opens on the picture the row was always drawn with, then the rest of the ladder', () => {
    const g = book.gallery(FORMOSA)
    expect(g.map((p) => p.tier)).toEqual(['hero', 'catalogue'])
    expect(g[0]?.id).toBe(book.picture(FORMOSA)?.id)
    expect(book.cover(FORMOSA)?.id).toBe(g[0]?.id)
    expect(book.chosenCover(FORMOSA)).toBeNull()
    /* every one of them is a picture of this row's model, and of no other table */
    expect(g.every((p) => p.table === FORMOSA.table && p.rows.includes(FORMOSA.row))).toBe(true)
  })

  it('on every row a model picture is held for, holds each once and opens on the one drawn', () => {
    const file = ledger('pictures.json') as {
      pictures: { table: string; rows: Record<string, string[]> }[]
    }
    const items = new Map<string, Item>()
    for (const e of file.pictures)
      for (const row of Object.values(e.rows).flat())
        items.set(`${e.table}\n${row}`, { table: e.table, row })
    expect(items.size, 'rows with a model picture, measured 2026-11-02').toBe(545)
    for (const item of items.values()) {
      const g = book.gallery(item)
      expect(new Set(g.map((p) => p.id)).size).toBe(g.length)
      expect(new Set(g.map((p) => p.address)).size).toBe(g.length)
      expect(g[0]?.id).toBe(book.picture(item)?.id)
      expect(heldGallery(book, item).map((p) => p.id)).toEqual(g.map((p) => p.id))
    }
  })

  it('is empty for a row nothing is held of: never a stand-in', () => {
    expect(book.gallery(KIT)).toEqual([])
    expect(book.cover(KIT)).toBeNull()
  })

  it('keeps the first of two copies, by id and by address', () => {
    const [a, b] = book.gallery(FORMOSA)
    expect(onceEach([a, a, b, null, undefined]).map((p) => p.id)).toEqual([a!.id, b!.id])
    expect(onceEach([a, { ...b!, id: 'other', address: a!.address }])).toEqual([a])
  })
})

describe('Northside’s pictures join the gallery of their row', () => {
  it('after the held ones, oldest first, without moving what the row is drawn with', () => {
    const dressed = withGalleries(book, [own(FORMOSA, 'a'), own(FORMOSA, 'b', { addedAt: LATER })])
    expect(ids(dressed, FORMOSA)).toEqual([...ids(book, FORMOSA), 'own:a', 'own:b'])
    expect(dressed.picture(FORMOSA)?.id).toBe(book.picture(FORMOSA)?.id)
    expect(dressed.owns(FORMOSA).map((p) => p.id)).toEqual(['a', 'b'])
    /* each keeps its own provenance */
    expect(dressed.gallery(FORMOSA).at(-1)?.added).toEqual({ by: 'Asaf', at: LATER })
  })

  it('lead it where nothing of the exact row is held, as one picture did before', () => {
    const dressed = withGalleries(book, [own(KIT, 'a'), own(KIT, 'b')])
    expect(ids(dressed, KIT)).toEqual(['own:a', 'own:b'])
    expect(dressed.cover(KIT)?.id).toBe('own:a')
    expect(dressed.picture(KIT)?.id).toBe('own:a')
  })

  it('never reach another row, however alike', () => {
    const dressed = withGalleries(book, [own(KIT, 'a')], [order(KIT, { cover: 'own:a' })])
    expect(dressed.gallery(KIT_NEXT)).toEqual(book.gallery(KIT_NEXT))
    expect(dressed.arrangement(KIT_NEXT)).toBeNull()
  })

  it('keep a picture chosen over the maker’s before galleries as the cover, until one is chosen', () => {
    const chosen = withGalleries(book, [own(FORMOSA, 'a', { chosen: true })])
    expect(ids(chosen, FORMOSA)[0]).toBe('own:a')
    const since = withGalleries(
      book,
      [own(FORMOSA, 'a', { chosen: true })],
      [order(FORMOSA, { cover: book.gallery(FORMOSA)[1]!.id })],
    )
    expect(since.cover(FORMOSA)?.id).toBe(book.gallery(FORMOSA)[1]!.id)
  })
})

describe('the cover the dealer chose', () => {
  it('is drawn first, and answers every question a screen and the paper ask of the row', () => {
    const dressed = withGalleries(book, [own(FORMOSA, 'a')], [order(FORMOSA, { cover: 'own:a' })])
    expect(ids(dressed, FORMOSA)[0]).toBe('own:a')
    expect(dressed.chosenCover(FORMOSA)?.id).toBe('own:a')
    for (const asked of [dressed.picture, dressed.hero, dressed.catalogue]) {
      expect(asked(FORMOSA)?.id).toBe('own:a')
    }
    expect(dressed.forCover(FORMOSA)).toMatchObject({ held: true, picture: { id: 'own:a' } })
    expect(dressed.forLine(FORMOSA)).toMatchObject({ held: true, picture: { id: 'own:a' } })
    expect(dressed.own(FORMOSA)?.id).toBe('a')
  })

  it('may be a held picture other than the one drawn by default', () => {
    const studio = book.gallery(FORMOSA)[1]!
    const dressed = withGalleries(book, [], [order(FORMOSA, { cover: studio.id })])
    expect(ids(dressed, FORMOSA)).toEqual([studio.id, book.gallery(FORMOSA)[0]!.id])
    expect(dressed.picture(FORMOSA)?.id).toBe(studio.id)
    /* a studio picture a person marked as this exact boat may print on the cover and the line */
    expect(dressed.forCover(FORMOSA)).toMatchObject({ held: true, picture: { id: studio.id } })
  })

  it('is printed only where the paper may print it, and the paper keeps its own ladder otherwise', () => {
    const studio = book.gallery(CL420).find((p) => p.tier === 'catalogue')!
    expect(studio.exact, 'the CL420’s studio picture is not recorded as this finish').toBe(false)
    const dressed = withGalleries(book, [], [order(CL420, { cover: studio.id })])
    expect(dressed.picture(CL420)?.id).toBe(studio.id)
    expect(dressed.forCover(CL420)).toEqual(book.forCover(CL420))
    expect(dressed.forLine(CL420)).toEqual(book.forLine(CL420))
  })

  it('stops being the cover when it leaves the gallery, and the row is drawn as by default', () => {
    const dressed = withGalleries(book, [], [order(FORMOSA, { cover: 'own:gone' })])
    expect(dressed.chosenCover(FORMOSA)).toBeNull()
    expect(ids(dressed, FORMOSA)).toEqual(ids(book, FORMOSA))
    expect(dressed.picture(FORMOSA)?.id).toBe(book.picture(FORMOSA)?.id)
  })
})

describe('the dealer’s order', () => {
  it('places the others behind the cover, skips what is gone, and keeps what it never named', () => {
    const [hero, studio] = book.gallery(FORMOSA)
    const dressed = withGalleries(
      book,
      [own(FORMOSA, 'a'), own(FORMOSA, 'b', { addedAt: LATER })],
      [order(FORMOSA, { order: ['own:b', 'gone', studio!.id] })],
    )
    /* no cover chosen: the one drawn by default still leads */
    expect(ids(dressed, FORMOSA)).toEqual([hero!.id, 'own:b', studio!.id, 'own:a'])
    expect(dressed.picture(FORMOSA)?.id).toBe(hero!.id)
  })

  it('takes the latest arrangement where two stand for one row', () => {
    const studio = book.gallery(FORMOSA)[1]!
    const dressed = withGalleries(
      book,
      [],
      [order(FORMOSA, { id: 'old' }), order(FORMOSA, { id: 'new', at: LATER, cover: studio.id })],
    )
    expect(dressed.arrangement(FORMOSA)?.id).toBe('new')
    expect(dressed.cover(FORMOSA)?.id).toBe(studio.id)
  })

  it('moves one id to a new place and keeps the rest in theirs', () => {
    expect(moveIn(['a', 'b', 'c', 'd'], 'd', 1)).toEqual(['a', 'd', 'b', 'c'])
    expect(moveIn(['a', 'b', 'c'], 'a', 9)).toEqual(['b', 'c', 'a'])
    expect(moveIn(['a', 'b'], 'z', 0)).toEqual(['a', 'b'])
  })
})

describe('what the paper may print', () => {
  it('prints the dealer’s, a photograph a person marked, the row’s own and an exact studio picture', () => {
    const [hero, studio] = book.gallery(FORMOSA)
    expect(printableOnCover(hero!)).toBe(true)
    expect(printableOnCover(studio!)).toBe(true)
    expect(printableOnCover({ ...hero!, person: false })).toBe(false)
    expect(printableOnCover({ ...studio!, exact: false })).toBe(false)
    expect(printableOnLine(studio!)).toBe(true)
    expect(printableOnLine(hero!)).toBe(false)
    const dealers = withGalleries(book, [own(KIT, 'a')]).gallery(KIT)[0]!
    expect(printableOnCover(dealers) && printableOnLine(dealers)).toBe(true)
  })
})

describe('what is said under a picture large', () => {
  it('names where it came from and what it shows that is not exactly this row', () => {
    const [hero] = book.gallery(FORMOSA)
    expect(sourceOf(hero!)).toMatch(/^Photograph from [a-z0-9.-]+$/)
    expect(sourceOf({ added: { by: 'Asaf', at: NOON }, address: '', tier: 'catalogue' })).toBe(
      'Added by Asaf, 2 November 2026',
    )
    expect(standingOf(hero!)).toBe('')
    const studio = book.gallery(CL420).find((p) => p.tier === 'catalogue')!
    expect(standingOf(studio)).toBe('The model; its finish may not be this one’s.')
  })
})

describe('an arrangement from outside (a backup) is read field by field', () => {
  const good = {
    id: 'o1',
    orgId: 'elsewhere',
    table: 'parts',
    row: 'parts:119',
    option: 'MFM50 - Battery MFM50',
    name: 'Battery MFM50',
    cover: 'own:p1',
    order: ['own:p1', 'row:https://example.com/a.jpg', 7, 'own:p1'],
    by: 'Asaf',
    at: NOON,
  }

  it('keeps a good one for whoever brings it back, its order of ids only, each once', () => {
    const read = readGalleryOrder(good, 'northside', safeId)
    expect(read).toMatchObject({ orgId: 'northside', cover: 'own:p1' })
    expect(read?.order).toEqual(['own:p1', 'row:https://example.com/a.jpg'])
  })

  it('drops one with no option, no person, no day or an unsafe id, and bounds a long order', () => {
    expect(readGalleryOrder({ ...good, option: ' ' }, 'northside', safeId)).toBeNull()
    expect(readGalleryOrder({ ...good, by: '' }, 'northside', safeId)).toBeNull()
    expect(readGalleryOrder({ ...good, at: 'soon' }, 'northside', safeId)).toBeNull()
    expect(readGalleryOrder({ ...good, id: '../x' }, 'northside', safeId)).toBeNull()
    expect(readGalleryOrder([good], 'northside', safeId)).toBeNull()
    const long = Array.from({ length: GALLERY_ORDER_LIMIT + 50 }, (_, i) => `own:${i}`)
    expect(readGalleryOrder({ ...good, order: long }, 'northside', safeId)?.order).toHaveLength(
      GALLERY_ORDER_LIMIT,
    )
    expect(ownId({ id: 'p1' })).toBe('own:p1')
  })
})
