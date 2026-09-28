import { beforeAll, describe, expect, test } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { boatFacts, motorFacts, specimenOf, type KitSpecimen } from './specimen'

/* ============================================================
   The kit's specimen reads the 529 off the real pack, never off a
   copy typed into the page. Every figure asserted here is a cell of
   data/northside: Boat Module!R50 for the hull, the six Stacer ×
   Yamaha pairings in the file's order, the ledger's own pictures.
   ============================================================ */

let pack: PackFixture
let kit: KitSpecimen

beforeAll(async () => {
  pack = await loadPack()
  const read = specimenOf({
    business: pack.manifest.name,
    entities: pack.entities,
    rows: pack.rowsByEntity,
    images: pack.images,
  })
  if ('refused' in read) throw new Error(read.refused)
  kit = read
})

describe('the kit specimen, read off the price file', () => {
  test('is the 529 Assault Pro (Tournament), named as its paper names it', () => {
    expect(kit.business).toBe('Northside Marine')
    expect(kit.boat.code).toBe('SA529APTR')
    expect(kit.boat.title).toBe('Stacer 529 Assault Pro (Tournament)')
    expect(kit.boat.maker).toBe('Stacer')
    expect(kit.boat.number).toBe('529')
  })

  test('prices it only at the levels the file declares for a quote — Cash and Trade, never cost', () => {
    expect(kit.boat.levels).toEqual([
      { key: 'cash', label: 'Cash', amount: 28530 },
      { key: 'trade', label: 'Trade', amount: 28530 },
    ])
  })

  test('says its facts from the columns that hold them', () => {
    expect(boatFacts(kit.boat)).toEqual([
      '5.29 m',
      '2.04 m beam',
      '80 ltr',
      '598 kg hull',
      '90–150 hp',
    ])
  })

  test('pairs the six Yamahas in the file’s own order, starring the one the file stars', () => {
    expect(kit.boat.motors.map((m) => m.said)).toEqual([
      'Yamaha F90LB',
      'Yamaha F90LB2 · White',
      'Yamaha F115LB',
      'Yamaha F115LB2 · White',
      'Yamaha F130LA',
      'Yamaha F150LC',
    ])
    expect(kit.boat.motors.filter((m) => m.recommended).map((m) => m.code)).toEqual(['F90LB'])
    const f115 = kit.boat.motors.find((m) => m.code === 'F115LB')!
    /* the file's column is "Sell Price"; the dealership's name for the level is Cash */
    expect(f115.levels).toEqual([
      { key: 'cash', label: 'Cash', amount: 16667 },
      { key: 'trade', label: 'Trade', amount: 16434 },
    ])
    expect(motorFacts(f115)).toBe('115 hp · 171 kg · 20″ shaft')
  })

  test('draws only the pictures the ledger holds, at their own size', () => {
    expect(kit.boat.picture).toMatchObject({
      file: '529-assault-lifestyle-tiffs-7-1024x676-fbf66995.webp',
      width: 1024,
      height: 676,
      verdict: 'scene',
    })
    expect(kit.boat.motors.every((m) => m.picture?.verdict === 'studio')).toBe(true)
  })

  test('finds the other two 529s in the register, and counts its registers', () => {
    expect(kit.siblings.map((b) => b.title)).toEqual([
      'Stacer 529 Outlaw (Side Console)',
      'Stacer 529 Outlaw (Centre Console)',
    ])
    expect(kit.boat.trailers.map((x) => x.code)).toEqual(['TA1400S13SB'])
    /* every 529 carries its own pairings, so the kit never shows one hull's motors on another */
    expect(kit.siblings.map((b) => b.motors.length).every((n) => n > 0)).toBe(true)
    expect(kit.siblings[0]!.motors.map((m) => m.code)).not.toEqual(
      kit.boat.motors.map((m) => m.code),
    )
    expect(kit.registers.boat).toMatchObject({ name: 'Stacer', kind: 'boat', rows: 91 })
    expect(kit.registers.motor).toMatchObject({ name: 'Yamaha Outboards', kind: 'motor' })
    expect(kit.registers.trailer).toMatchObject({ name: 'Stacer Trailers', kind: 'trailer' })
  })

  test('refuses with a sentence, never a stand-in, when the file has no such boat', () => {
    expect(
      specimenOf(
        {
          business: pack.manifest.name,
          entities: pack.entities,
          rows: pack.rowsByEntity,
          images: pack.images,
        },
        'NOPE000',
      ),
    ).toEqual({ refused: 'The price file holds no boat with the Model Code NOPE000.' })
  })
})
