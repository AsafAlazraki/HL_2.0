import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  heldPictures,
  markFor,
  markLedgerFacts,
  marksFor,
  pictureById,
  pictureForSubject,
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
  variant?: string
  file?: string
  error?: string
}

describe('the picture ledger', () => {
  it('reads every photograph the file records, with its own pixel size', () => {
    const rows = ledger<{ file?: string }[]>('heroes-ledger.json')
    expect(heldPictures()).toHaveLength(rows.filter((r) => r.file).length)
    for (const picture of heldPictures()) {
      expect(picture.width).toBeGreaterThan(0)
      expect(picture.height).toBeGreaterThan(0)
      expect(picture.src.endsWith('.webp')).toBe(true)
    }
  })

  it('answers by id, and answers nothing for an id it does not hold', () => {
    const adv7 = pictureById('highfield-adv7')
    expect(adv7?.table).toBe('boat_highfield')
    expect(adv7?.model).toBe('ADV7')
    expect(pictureById('nothing-of-the-sort')).toBeUndefined()
  })

  it('holds the two this screen hangs', () => {
    expect(pictureById('highfield-adv7')).toBeDefined()
    expect(pictureById('stacer-519-sea-ranger')).toBeDefined()
  })

  /* ONE BOAT ON A FILED QUOTE, matched to a photograph or to nothing.
     Added 2026-09-18 with the card that draws it. The rule it has to
     keep is CLAUDE.md's: a picture belongs only to the exact model it
     depicts, so a near miss answers nothing rather than answering
     with the closest thing in the ledger. */
  describe('the picture for one boat on a quote', () => {
    it('answers for the model it depicts, in the register it is filed in', () => {
      expect(pictureForSubject('boat_highfield', 'Highfield - SP560 PVC')?.id).toBe(
        'highfield-sp560',
      )
      expect(pictureForSubject('boat_highfield', 'ADV7')?.id).toBe('highfield-adv7')
      expect(
        pictureForSubject('boat_stacer', 'Stacer - 519 Sea Ranger SDF (Centre Console)')?.id,
      ).toBe('stacer-519-sea-ranger')
    })

    it('answers nothing where the register is not the one the ledger names', () => {
      expect(pictureForSubject('boat_stacer', 'Highfield - SP560 PVC')).toBeUndefined()
      expect(pictureForSubject('', 'Highfield - SP560 PVC')).toBeUndefined()
      expect(pictureForSubject('boat_highfield', '   ')).toBeUndefined()
    })

    /* THE NEAR MISSES, one per way of missing. A model name inside a
       longer word is not that model; a model this ledger holds nothing
       for is nothing. */
    it('answers nothing for a name that merely contains one it holds', () => {
      expect(pictureForSubject('boat_highfield', 'Highfield SP560X special')).toBeUndefined()
      expect(pictureForSubject('boat_highfield', 'XSP560')).toBeUndefined()
      expect(pictureForSubject('boat_highfield', 'Highfield - CL290 PVC')).toBeUndefined()
    })

    /* and the longest model wins, so a specific name is never beaten
       by a shorter one it contains */
    it('prefers the longest model that stands alone in the label', () => {
      const both = pictureForSubject('boat_stacer', '309 Skimma and 359 Territory Striker')
      expect(both?.id).toBe('stacer-359-territory-striker')
    })
  })
})

describe('the marks ledger', () => {
  it('counts the makers checked, the makers held and the files, off the ledger', () => {
    const rows = ledger<MarkRow[]>('marks-ledger.json')
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

  /* GAP TWO: a maker with no mark at all. The ledger's own reason is
     the sentence the shelf prints. */
  it('refuses a maker with no mark with the ledger own reason', () => {
    const row = ledger<MarkRow[]>('marks-ledger.json').find((r) => r.brand === 'Stabicraft')
    expect(row?.file).toBeUndefined()
    expect(row?.error).toBe('no public wordmark verified')

    for (const ground of ['paper', 'dark'] as const) {
      const choice = markFor('Stabicraft', ground)
      expect(choice.drawn).toBe(false)
      if (!choice.drawn) expect(choice.because).toBe('Stabicraft: no public wordmark verified.')
    }
  })

  it('refuses a maker nobody has looked for, and says that too', () => {
    const choice = markFor('A Maker Nobody Has Checked', 'paper')
    expect(choice.drawn).toBe(false)
    if (!choice.drawn) expect(choice.because).toContain('No mark has been looked for')
  })
})
