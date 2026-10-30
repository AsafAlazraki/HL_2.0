/* ============================================================
   A PICTURE NORTHSIDE ADDS TO ONE OPTION — the record, the rule that
   decides whether it is read at all, and the rule that decides when it
   is the picture drawn.

   The book is the real one, built from the three ledgers this
   repository ships, so "a held picture of the exact item" is a real
   one: the ePropulsion eLITE Outboard (LS), `mot_epropulsion:2`, whose
   catalogue picture a person marked as that row. The option with
   nothing held is a rigging kit, which no maker photographs
   (docs/directions/flow/pictures.md); each test says so before it
   leans on it.

   The bytes are a test's own `data:` string, never a picture: these
   rules read the address, its kind and its size, not what it shows.
   ============================================================ */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { pictureBook, type Item, type PictureBook } from './pictures'
import {
  OWN_PICTURE_EDGE,
  OWN_PICTURE_READ_LIMIT,
  addedLine,
  bytesOf,
  daySaid,
  isAnAddress,
  isOwnBytes,
  manyFiles,
  ownPicturePlan,
  pastedWords,
  readOwnPicture,
  withOwnPictures,
  type OwnPicture,
} from './ownPictures'

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

/** noon on 30 October 2026 where the test runs, so the day said is that day in any zone */
const NOON = new Date(2026, 9, 30, 12).toISOString()
const BYTES = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='

const ELITE: Item = { table: 'mot_epropulsion', row: 'mot_epropulsion:2' }
const KIT: Item = { table: 'rig_kits', row: 'rig_kits:1' }
const KIT_NEXT: Item = { table: 'rig_kits', row: 'rig_kits:2' }

const own = (item: Item, more: Partial<OwnPicture> = {}): OwnPicture => ({
  id: `own-${item.row}`,
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

const safeId = (v: unknown): v is string => typeof v === 'string' && /^[\w:.-]{1,200}$/.test(v)

describe('before a byte is read', () => {
  it('reads the four kinds a camera, a maker’s page and a screenshot make', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
      expect(ownPicturePlan({ type, size: 2_000_000 }, 'Battery MFM50')).toEqual({ do: 'read' })
  })

  it('refuses a file that is not a picture, naming it and the option', () => {
    expect(
      ownPicturePlan(
        { type: 'application/pdf', size: 90_000, name: 'brochure.pdf' },
        'Yamaha F60LC',
      ),
    ).toEqual({
      do: 'refuse',
      why: '“brochure.pdf” is not a picture, so it cannot be the Yamaha F60LC’s. A photograph or a drawing can: JPEG, PNG, WebP or GIF.',
    })
  })

  it('refuses a drawing that can carry script, as not a picture', () => {
    const plan = ownPicturePlan({ type: 'image/svg+xml', size: 4_000, name: 'mark.svg' }, 'Hull')
    expect(plan.do).toBe('refuse')
  })

  it('refuses a file too large to read, with both figures', () => {
    const plan = ownPicturePlan(
      { type: 'image/jpeg', size: OWN_PICTURE_READ_LIMIT + 1, name: 'IMG_0412.jpg' },
      'Battery MFM50',
    )
    expect(plan.do).toBe('refuse')
    if (plan.do !== 'refuse') return
    expect(plan.why).toMatch(
      /^“IMG_0412\.jpg” is 32(\.0)? MB, and a picture over 32 MB is not read\./,
    )
    expect(plan.why).toContain(`${OWN_PICTURE_EDGE} pixels across`)
  })

  it('says an address is not fetched, and that several files are one too many', () => {
    expect(isAnAddress('https://www.yamaha-motor.com.au/f60.jpg')).toBe(true)
    expect(isAnAddress('//cdn.example/x.png')).toBe(true)
    expect(isAnAddress('Battery MFM50')).toBe(false)
    expect(pastedWords(true)).toMatch(/^That is an address, not a picture\./)
    expect(pastedWords(false)).toMatch(/^What was pasted is words, not a picture\./)
    expect(manyFiles(3)).toBe(
      'That is 3 files at once. An option has one picture, so drop or paste just the one that shows it.',
    )
  })
})

describe('its provenance, said', () => {
  it('reads "Added by Asaf, 30 October 2026"', () => {
    expect(addedLine({ addedBy: 'Asaf', addedAt: NOON })).toBe('Added by Asaf, 30 October 2026')
    expect(daySaid(NOON)).toBe('30 October 2026')
  })
})

describe('our own bytes, and only ours', () => {
  it('takes a data: picture of the four kinds and nothing else', () => {
    expect(isOwnBytes(BYTES)).toBe(true)
    expect(isOwnBytes('https://example.com/a.webp')).toBe(false)
    expect(isOwnBytes('/seed-images/a.webp')).toBe(false)
    expect(isOwnBytes('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false)
    expect(isOwnBytes('javascript:alert(1)')).toBe(false)
  })

  it('measures the bytes a data: address really holds', () => {
    /* 4 characters for 3 bytes, less the padding */
    expect(bytesOf('data:image/png;base64,AAAA')).toBe(3)
    expect(bytesOf('data:image/png;base64,AAA=')).toBe(2)
    expect(bytesOf('data:image/png;base64,AA==')).toBe(1)
  })
})

describe('a record from outside (a backup) is read field by field', () => {
  const good = own(KIT, { file: 'kit.jpg' })

  it('keeps a good one, whosever the file says it is', () => {
    const read = readOwnPicture({ ...good, orgId: 'somebody-else' }, 'northside', safeId)
    expect(read).toEqual({ ...good, orgId: 'northside' })
  })

  it('drops one whose picture is an address on another host, or a script', () => {
    expect(
      readOwnPicture({ ...good, src: 'https://example.com/a.webp' }, 'northside', safeId),
    ).toBe(null)
    expect(readOwnPicture({ ...good, src: 'javascript:alert(1)' }, 'northside', safeId)).toBe(null)
  })

  it('drops one past the bounds, with no person, or with no day', () => {
    expect(readOwnPicture({ ...good, width: OWN_PICTURE_EDGE + 1 }, 'northside', safeId)).toBe(null)
    expect(readOwnPicture({ ...good, addedBy: '  ' }, 'northside', safeId)).toBe(null)
    expect(readOwnPicture({ ...good, addedAt: 'yesterday' }, 'northside', safeId)).toBe(null)
    expect(readOwnPicture({ ...good, id: '../../etc' }, 'northside', safeId)).toBe(null)
  })

  it('measures the bytes itself and reads only true as chosen', () => {
    const read = readOwnPicture({ ...good, bytes: 1, chosen: 'yes' }, 'northside', safeId)
    expect(read?.bytes).toBe(bytesOf(BYTES))
    expect(read?.chosen).toBe(false)
  })
})

describe('laid over the book', () => {
  it('draws the dealer’s picture where nothing of the exact item is held', () => {
    expect(book.exactHeld(KIT), 'a rigging kit has no held picture').toBeNull()
    const dressed = withOwnPictures(book, [own(KIT)])
    const drawn = dressed.picture(KIT)
    expect(drawn?.src).toBe(BYTES)
    expect(drawn?.exact).toBe(true)
    expect(drawn?.person).toBe(true)
    expect(drawn?.verification).toBe('Added by Asaf, 30 October 2026')
    expect(drawn?.added).toEqual({ by: 'Asaf', at: NOON })
    expect(dressed.catalogue(KIT)?.src).toBe(BYTES)
    expect(dressed.forLine(KIT)).toMatchObject({ held: true, picture: { src: BYTES } })
    expect(dressed.forCover(KIT)).toMatchObject({ held: true, picture: { src: BYTES } })
    expect(dressed.own(KIT)?.id).toBe(`own-${KIT.row}`)
  })

  it('never draws it for another option, however alike', () => {
    const dressed = withOwnPictures(book, [own(KIT)])
    expect(dressed.own(KIT_NEXT)).toBeNull()
    expect(dressed.picture(KIT_NEXT)?.src ?? null).not.toBe(BYTES)
    expect(dressed.forLine(KIT_NEXT)).toEqual(book.forLine(KIT_NEXT))
  })

  it('lets the held picture of the exact item win, unless the dealer chose theirs', () => {
    const held = book.exactHeld(ELITE)
    expect(held, 'the eLITE (LS) has a picture a person marked as that row').not.toBeNull()
    const kept = withOwnPictures(book, [own(ELITE)])
    expect(kept.catalogue(ELITE)?.src).toBe(held!.src)
    expect(kept.own(ELITE)?.id).toBe(`own-${ELITE.row}`)

    const chosen = withOwnPictures(book, [own(ELITE, { chosen: true })])
    expect(chosen.catalogue(ELITE)?.src).toBe(BYTES)
    expect(chosen.picture(ELITE)?.src).toBe(BYTES)
    expect(chosen.notes(ELITE)).toEqual([])
  })

  it('draws it as the model on the water only where the dealer chose it', () => {
    expect(withOwnPictures(book, [own(KIT)]).hero(KIT)).toEqual(book.hero(KIT))
    expect(withOwnPictures(book, [own(KIT, { chosen: true })]).hero(KIT)?.src).toBe(BYTES)
  })

  it('is the book itself when Northside has added none', () => {
    expect(withOwnPictures(book, [])).toBe(book)
  })
})
