import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  boatsForHome,
  HOME_BOATS,
  heldPictures,
  markFor,
  markLedgerFacts,
  marksFor,
  pictureById,
} from './ledgers'

/* ============================================================
   The two ledgers, read back against the files themselves.

   The point of these cases is the two GAPS. A ledger that only
   recorded what was found would need no reading code at all; this one
   records a maker whose mark was looked for and not found, and a maker
   whose mark exists in one ink only. Both are answered on the screen
   with a sentence and a name set in type, and both are answered here
   with a case, because "handled without a hole in the row" is a claim
   about the two rows nobody notices.
   ============================================================ */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const ledger = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(ROOT, 'data', 'northside', file), 'utf8')) as T

interface MarkRow {
  brand: string
  role?: string
  variant?: string
  file?: string
  error?: string
}

describe('the picture ledger', () => {
  it('reads every photograph on the water the file records, with its own pixel size', () => {
    const doc = ledger<{ pictures: { tier: string; file?: string }[] }>('pictures.json')
    expect(heldPictures()).toHaveLength(
      doc.pictures.filter((r) => r.tier === 'hero' && r.file).length,
    )
    for (const picture of heldPictures()) {
      expect(picture.width).toBeGreaterThan(0)
      expect(picture.height).toBeGreaterThan(0)
      expect(picture.src.endsWith('.webp')).toBe(true)
      expect(picture.tier).toBe('hero')
    }
  })

  it('answers by id, and answers nothing for an id it does not hold', () => {
    const adv7 = pictureById('highfield-adv7')
    expect(adv7?.table).toBe('boat_highfield')
    expect(adv7?.model).toBe('ADV7')
    expect(pictureById('nothing-of-the-sort')).toBeUndefined()
  })

  /* Home is drawn to fit one row of boats: 35 photographs drawn whole were five rows deep */
  it('stands Home on one row of eight, every maker with a photograph in it, a person’s first', () => {
    const all = heldPictures().map((picture) => ({ table: picture.table, picture }))
    expect(all.length).toBeGreaterThan(HOME_BOATS)
    const row = boatsForHome(all)
    expect(row).toHaveLength(HOME_BOATS)
    expect(new Set(row.map((b) => b.table))).toEqual(new Set(all.map((b) => b.table)))
    expect(row.every((b) => b.picture.person)).toBe(true)
    expect(boatsForHome(all.slice(0, 3))).toHaveLength(3)
  })

  it('holds the two this screen hangs', () => {
    expect(pictureById('highfield-adv7')).toBeDefined()
    expect(pictureById('stacer-519-sea-ranger')).toBeDefined()
  })

  /* A PICTURE BELONGS ONLY TO THE EXACT MODEL IT DEPICTS (CLAUDE.md). Since 2026-10-20 a
     photograph is attached to the rows of its model by id, written into the ledger, so a near
     miss — a longer model, another register — cannot answer at all. */
  describe('the rows a photograph is drawn for', () => {
    it('are rows of the register it depicts, and only that register', () => {
      for (const picture of heldPictures()) {
        expect(picture.rows.length, picture.id).toBeGreaterThan(0)
        for (const row of picture.rows) expect(row.startsWith(`${picture.table}:`), row).toBe(true)
      }
    })

    /* the gate round, 2026-10-20: the photograph shows a SIDE console, so it is that model's
       alone, and the Centre Console (boat_stacer:71) is not one of its rows */
    it('is the Stacer 519 Side Console’s alone, the console its photograph shows', () => {
      const sea = pictureById('stacer-519-sea-ranger')!
      expect(sea.model).toBe('Stacer - 519 Sea Ranger SDF (Side Console)')
      expect(sea.rows).toEqual(['boat_stacer:77'])
      expect(sea.exact).toBe(false)
    })

    it('never share a row between two photographs', () => {
      const rows = heldPictures().flatMap((p) => p.rows)
      expect(new Set(rows).size).toBe(rows.length)
    })
  })
})

describe('the marks ledger', () => {
  it('counts the makers checked, the makers held and the files, off the ledger', () => {
    /* the dealership's own mark is not a maker's: the shelf counts makers */
    const rows = ledger<MarkRow[]>('marks-ledger.json').filter((r) => r.role !== 'organisation')
    const brands = new Set(rows.map((r) => r.brand))
    const held = new Set(rows.filter((r) => r.file).map((r) => r.brand))
    expect(markLedgerFacts()).toEqual({
      checked: brands.size,
      held: held.size,
      files: rows.filter((r) => r.file).length,
    })
  })

  it('matches a register name that carries more words than the maker', () => {
    /* the price file calls Highfield's register "Highfield
       Inflatables" and the ledger calls the maker "Highfield"; a
       register named for a maker and something else is still that
       maker's, which is why "Stacer Trailers" is Stacer's too */
    expect(marksFor('Highfield Inflatables').map((m) => m.brand)).toContain('Highfield')
    expect(marksFor('Stacer Trailers').map((m) => m.brand)).toContain('Stacer')
    /* and never a substring anywhere: a name has to BEGIN with the
       maker's, or a register called after somebody else would wear
       their mark */
    expect(marksFor('Boats by Stacer').map((m) => m.brand)).toEqual([])
    expect(marksFor('Superhighfield').map((m) => m.brand)).toEqual([])
  })

  it('draws the dark ink on paper', () => {
    const choice = markFor('Stacer', 'paper')
    expect(choice.drawn).toBe(true)
    if (choice.drawn) {
      expect(choice.mark.variant).toBe('dark')
      expect(choice.mark.src).toContain('brand-marks/')
    }
  })

  it('draws the white ink in the dark room', () => {
    const choice = markFor('Highfield Inflatables', 'dark')
    expect(choice.drawn).toBe(true)
    if (choice.drawn) expect(choice.mark.variant).toBe('white')
  })

  /* GAP ONE: a maker held in one ink only. Mercury publishes a white
     wordmark and nothing else, so on paper it is refused with that
     reason rather than recoloured — and the shelf sets the name in
     type instead, which is true. */
  it('refuses a white-ink mark on paper, and says which ink is held', () => {
    const rows = ledger<MarkRow[]>('marks-ledger.json').filter((r) => r.brand === 'Mercury')
    expect(rows.map((r) => r.variant)).toEqual(['white'])

    const onPaper = markFor('Mercury', 'paper')
    expect(onPaper.drawn).toBe(false)
    if (!onPaper.drawn) expect(onPaper.because).toContain('white ink only')

    const inTheRoom = markFor('Mercury', 'dark')
    expect(inTheRoom.drawn).toBe(true)
  })

  /* GAP TWO WAS STABICRAFT, which had no mark at all until 2026-10-20, when a person accepted
     its full mark off Northside's own site — in white ink only, so it is now GAP ONE's shape:
     drawn in the dark room, its name in type on paper. */
  it('holds Stabicraft in white ink only, as Mercury is', () => {
    const rows = ledger<MarkRow[]>('marks-ledger.json').filter((r) => r.brand === 'Stabicraft')
    expect(rows.map((r) => r.variant)).toEqual(['white'])
    const onPaper = markFor('Stabicraft', 'paper')
    expect(onPaper.drawn).toBe(false)
    if (!onPaper.drawn) expect(onPaper.because).toContain('white ink only')
    expect(markFor('Stabicraft', 'dark').drawn).toBe(true)
  })

  it('refuses a maker nobody has looked for, and says that too', () => {
    const choice = markFor('A Maker Nobody Has Checked', 'paper')
    expect(choice.drawn).toBe(false)
    if (!choice.drawn) expect(choice.because).toContain('No mark has been looked for')
  })
})
