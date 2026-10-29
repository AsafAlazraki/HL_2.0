import { describe, expect, it } from 'vitest'
import type { QuoteDef } from '@/domain/model'
import imagesRaw from '../../../data/northside/images.json?raw'
import { coverOf, heldCopyOf, type CoverReaders, type HeldCopy } from './cover'

/* ============================================================
   THE PICTURE OF THE QUOTE IN HAND, READ DOWN ITS TWO RUNGS.

   The readers are handed in, so each rung is asked of a reader that
   holds exactly what the case says it holds — and `heldCopyOf`, which
   asks the one reader by the quote's own row, is held to the image
   ledger itself: an address the ledger holds a copy of answers with that
   file, an address it does not list answers nothing, and a logo the
   price file points a trailer at answers nothing either.
   ============================================================ */

const quote = (over: Partial<QuoteDef> = {}): QuoteDef =>
  ({
    id: 'q1',
    rootTableId: 'boat_stacer',
    subjectLabel: 'Stacer - 539 Rebel',
    subjectImage: { id: 'i1', src: 'https://maker.example/rebel.jpg' },
    ...over,
  }) as unknown as QuoteDef

const copy: HeldCopy = { src: '/seed-images/rebel.webp', width: 1100, height: 619 }

const holding = (held: Partial<Record<'photo' | 'copy', boolean>>): CoverReaders<string> => ({
  photo: () => (held.photo ? 'on the water' : undefined),
  copy: (q) =>
    held.copy && q.subjectImage?.src === 'https://maker.example/rebel.jpg' ? copy : undefined,
})

describe('the picture of the quote in hand', () => {
  it('is the photograph on the water where one is held, before anything else', () => {
    expect(coverOf(quote(), holding({ photo: true, copy: true }))).toEqual({
      rung: 'photo',
      picture: 'on the water',
    })
  })

  it('is the row’s own copy of the address the quote froze, and of no other address', () => {
    expect(coverOf(quote(), holding({ copy: true }))).toEqual({ rung: 'studio', copy })
    const elsewhere = quote({ subjectImage: { id: 'i2', src: 'https://maker.example/other.jpg' } })
    expect(coverOf(elsewhere, holding({ copy: true }))).toBeUndefined()
  })

  it('is nothing where no picture of the boat is held — never a mark or a caption standing in', () => {
    expect(coverOf(quote(), holding({}))).toBeUndefined()
    expect(coverOf(quote({ subjectImage: undefined }), holding({ copy: true }))).toBeUndefined()
  })
})

describe('the copy this repository ships of a quote’s own address', () => {
  const ledger = (
    JSON.parse(imagesRaw) as {
      images: { address: string; file?: string; width?: number; height?: number }[]
    }
  ).images
  const first = ledger.find((e) => e.file && !/logo/i.test(e.address))!
  const on = (address: string): QuoteDef =>
    quote({ rootRowId: 'boat_x:1', subjectImage: { id: 'i', src: address } } as Partial<QuoteDef>)

  it('answers with the ledger’s own file and size for an address it holds', () => {
    const held = heldCopyOf(on(first.address))
    expect(held?.src.endsWith(`seed-images/${first.file}`)).toBe(true)
    expect(held?.width).toBe(first.width)
    expect(held?.height).toBe(first.height)
  })

  it('answers nothing for an address it does not list', () => {
    expect(heldCopyOf(on('https://nobody.example/not-a-boat.jpg'))).toBeUndefined()
  })

  it('answers nothing for a logo, though the ledger holds a copy of it', () => {
    const logo = ledger.find((e) => /redco-tinka-logos-01.png$/.test(e.address))!
    expect(logo.file).toBeTruthy()
    expect(heldCopyOf(on(logo.address))).toBeUndefined()
  })
})
