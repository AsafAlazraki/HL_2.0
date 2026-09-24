/* ============================================================
   THE RAIL, AGAINST THE REAL PACK.

   Nothing here is a fixture. Every quote below is minted by the
   engine from a row of `data/northside/`, exactly as the picker
   mints one, and every assertion is a fact about this dealer's own
   price file. A failure is a port bug or a packer bug.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import {
  rowLabel,
  type EntityDef,
  type QuoteDef,
  type QuoteLine,
  type RowData,
} from '@/domain/model'
import { mintQuoteFromView } from '@/domain/quote'
import { readRail, matchesFinish, SEARCH_MIN } from './chapters'
import { readFinishes } from './finishes'

const pack = await loadPack()
const ctx = pack.ctx

function quoteOn(key: string, find: string): QuoteDef {
  const table: EntityDef = pack.byKey(key)
  const rows = pack.rowsByEntity[table.id] ?? []
  const row = rows.find((r: RowData) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const view = createViewFor(ctx, table.id)
  const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-TEST' })
  expect(quote).not.toBeNull()
  return quote!
}

const sp560 = quoteOn('boat_highfield', 'SP560')
const assault = quoteOn('boat_stacer', '529 Assault Pro')

describe('the chapters are the engine’s bands, and two more', () => {
  it('draws one chapter per decision and never one per table', () => {
    const rail = readRail(ctx, sp560)
    const names = rail.chapters.map((c) => c.name)
    /* the SP560's view carries seven tables — two trailer tables and
       three the dealer fits — and they are four chapters plus two */
    expect(sp560.sections.length).toBe(7)
    expect(names).toEqual([
      'The hull',
      'Motor',
      'Trailer',
      'Dealer fit',
      'Who it is for',
      'The finale',
    ])
  })

  it('keeps the engine’s numbers and gives the last two none', () => {
    const rail = readRail(ctx, sp560)
    expect(rail.chapters.filter((c) => c.kind === 'band').map((c) => c.num)).toEqual([
      '01',
      '02',
      '03',
      '04',
    ])
    expect(rail.chapters.filter((c) => c.kind !== 'band').every((c) => c.num === '')).toBe(true)
  })

  it('folds several tables of one kind into one chapter with headings', () => {
    const rail = readRail(ctx, sp560)
    const trailer = rail.chapters.find((c) => c.id === 'trailer')!
    expect(trailer.tables.length).toBe(2)
    const fit = rail.chapters.find((c) => c.id === 'fit')!
    expect(fit.tables.length).toBe(3)
  })

  it('states its own answer on a head that is shut', () => {
    const rail = readRail(ctx, assault)
    const motor = rail.chapters.find((c) => c.id === 'motor')!
    expect(motor.fact).toBe('chosen: Yamaha - F90LB · 5 more offered')
    expect(motor.amount).toBe(14330)
    const trailer = rail.chapters.find((c) => c.id === 'trailer')!
    expect(trailer.amount).toBe(8703)
  })
})

describe('a row on the rail', () => {
  it('stars the file’s own recommendation and nothing else', () => {
    const rail = readRail(ctx, assault)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    expect(motors.filter((r) => r.starred).length).toBe(1)
    expect(motors.find((r) => r.starred)!.tail).toContain('F90LB')
  })

  it('carries the business’s own code beside the name', () => {
    const rail = readRail(ctx, assault)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    expect(motors.every((r) => r.code !== '')).toBe(true)
    expect(motors.find((r) => r.tail.includes('F90LB'))!.code).toBe('F90LB')
  })

  it('prices the press, and a fitted row’s figure is negative', () => {
    const rail = readRail(ctx, assault)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    const fitted = motors.find((r) => r.fitted)!
    expect(fitted.delta).toBe(-14330)
    expect(fitted.act.do).toBe('remove')
    const other = motors.find((r) => !r.fitted && r.amount !== null)!
    expect(other.delta).toBe(other.amount)
    expect(other.act.do).toBe('add')
  })

  it('never prices a row the file does not price, and never as nought', () => {
    const rail = readRail(ctx, sp560)
    const fit = rail.chapters.find((c) => c.id === 'fit')!
    const packages = fit.tables.find((t) => t.title === 'Dealer Fit Packages')!
    expect(packages.rows.length).toBeGreaterThan(0)
    expect(packages.rows.every((r) => r.amount === null)).toBe(true)
    expect(packages.rows.every((r) => r.delta === null)).toBe(true)
  })

  it('quietens the part of a name every row on the shelf shares', () => {
    const rail = readRail(ctx, assault)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    expect(motors.every((r) => r.stem === 'Yamaha -')).toBe(true)
    expect(motors.map((r) => r.tail)).toContain('F90LB')
  })

  it('says what a rung already contains, as a word', () => {
    const rail = readRail(ctx, assault)
    const trailers = rail.chapters.find((c) => c.id === 'trailer')!.tables[0].rows
    expect(trailers[0].contains).toBe('registration included')
  })

  it('leaves the pairing’s slot off the shelf and keeps its other facts', () => {
    const rail = readRail(ctx, assault)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    for (const row of motors) {
      expect(row.facts.some((f) => f.label === 'Slot')).toBe(false)
    }
    expect(motors.some((r) => r.facts.length > 0)).toBe(true)
  })
})

describe('the narrowing explains itself, is searched past and is switched off', () => {
  it('names the list that records the pairings, with its measured rate', () => {
    const rail = readRail(ctx, assault)
    const motor = rail.chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(motor.reason!.what).toContain('names which ones go with this one')
    expect(motor.reason!.measured!.holds).toBe('1,424 of 1,424')
    expect(motor.reason!.measured!.clause).toBe('holds at 100% across the price file')
  })

  it('counts the pool it narrowed from', () => {
    const rail = readRail(ctx, assault)
    const motor = rail.chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(motor.counts.pool).toBe(209)
    expect(motor.counts.narrowed).toBe(6)
  })

  it('reaches past the narrowing when a word is typed, with the reason said once', () => {
    const rail = readRail(ctx, sp560, { query: 'F250' })
    const motor = rail.chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(motor.rows.length).toBeGreaterThan(1)
    expect(motor.rows.every((r) => r.outside)).toBe(true)
    /* twenty-two rows off one shortlist for one reason: the sentence
       is the list's, so it is said above the list and not twenty-two
       times inside it */
    expect(motor.sharedWhy).toContain('never recorded that pairing')
    expect(motor.rows.every((r) => r.why === '')).toBe(true)
    expect(rail.beyond).toBeGreaterThan(0)
    expect(rail.searching).toBe(true)
  })

  it('keeps the reason ON the row where only one row is off the list', () => {
    /* the rule is mechanical — a reason is lifted only when MORE THAN
       ONE row off the shortlist gives the identical one — so a search
       that reaches a single motor leaves its sentence where rule 10
       puts it */
    const rail = readRail(ctx, sp560, { query: 'LF250XCB' })
    const fit = rail.chapters
      .find((c) => c.id === 'fit')!
      .tables.find((t) => t.title === 'Dealer Fit Packages')!
    expect(fit.rows.length).toBe(1)
    expect(fit.sharedWhy).toBe('')
    expect(fit.rows[0].why).toContain('never recorded that pairing')
  })

  it('counts what the search SELECTED and not what it drew', () => {
    /* the figures the sentence above the chapters is built from have
       to be comparable: the first cut counted the DRAWN rows against
       a `beyond` computed over the whole selection, and on this hull
       for "battery" that printed "81 rows carry those words — 170 of
       them the shortlist was standing in front of" */
    const rail = readRail(ctx, sp560, { query: 'battery' })
    expect(rail.hits).toBeGreaterThanOrEqual(rail.beyond)
    expect(rail.drawn).toBeLessThanOrEqual(rail.hits)
    expect(rail.hits).toBe(rail.chapters.reduce((n, c) => n + c.matched, 0))
  })

  it('is not a search under two letters', () => {
    expect(SEARCH_MIN).toBe(2)
    expect(readRail(ctx, sp560, { query: 'F' }).searching).toBe(false)
  })

  it('shows the whole live table when the narrowing is switched off', () => {
    const rail = readRail(ctx, sp560)
    const gfab = rail.chapters
      .find((c) => c.id === 'trailer')!
      .tables.find((t) => t.title === 'GFAB Trailers')!
    expect(gfab.rows.length).toBe(0)
    /* the fact in a dealer's words, and no instruction naming a page
       this app does not have (M2-close critique #4) */
    expect(gfab.why).toBe('Nothing from GFAB Trailers is paired with this hull on the price file.')

    const opened = readRail(ctx, sp560, { showAll: new Set([gfab.id]) })
    const shown = opened.chapters
      .find((c) => c.id === 'trailer')!
      .tables.find((t) => t.title === 'GFAB Trailers')!
    expect(shown.showingAll).toBe(true)
    expect(shown.rows.length).toBe(32)
    expect(shown.rows.every((r) => r.outside)).toBe(true)
    expect(shown.sharedWhy).toContain('never recorded that pairing')
  })
})

describe('what the whole rail knows', () => {
  it('totals through the one summation and counts the unpriced', () => {
    const rail = readRail(ctx, assault)
    expect(rail.total).toBe(51563)
    expect(rail.unpriced).toBe(0)
  })

  it('offers only the rungs the lines actually carry', () => {
    const rail = readRail(ctx, assault)
    expect(rail.rungs.map((r) => r.key)).toEqual(['cash', 'trade'])
    expect(rail.rungs[0].carriedBy).toBe(3)
  })

  it('carries the engine’s own reasons a quote may not go out', () => {
    const rail = readRail(ctx, assault)
    expect(rail.blockers).toEqual([
      'This quote is addressed to nobody. It cannot be given to a customer until it has a name.',
    ])
  })

  it('reports a charge a price column already contains', () => {
    const rail = readRail(ctx, assault)
    expect(rail.doubleCharged.some((s) => s.includes('already has'))).toBe(true)
  })
})

describe('the hull’s other finishes', () => {
  it('prices each one as the document it would produce', () => {
    const finishes = readFinishes(ctx, sp560)
    expect(finishes.rows.length).toBe(15)
    expect(finishes.rows.filter((f) => f.current).length).toBe(1)
    const pvc = finishes.rows.filter((f) => f.material === 'PVC')
    const hyp = finishes.rows.filter((f) => f.material === 'HYP')
    expect(pvc.length).toBe(7)
    expect(hyp.length).toBe(8)
    expect(pvc.every((f) => f.delta === 0)).toBe(true)
    expect(hyp.every((f) => f.delta === 7010)).toBe(true)
  })

  it('decodes a colourway only where the file’s own legend reads it whole', () => {
    const finishes = readFinishes(ctx, sp560)
    const read = finishes.rows.filter((f) => f.colour.read)
    expect(read.length).toBeGreaterThan(0)
    expect(read[0].colour.say).toContain('/')
    /* `I` is one of the four tokens this file carries no decode for */
    const unread = finishes.rows.find((f) => f.colour.code.startsWith('I-'))
    expect(unread?.colour.read).toBe(false)
    expect(unread?.colour.say).toBe(unread?.colour.code)
  })

  it('says why, on a register that files one row per model', () => {
    const finishes = readFinishes(ctx, assault)
    expect(finishes.rows.length).toBe(0)
    expect(finishes.why).not.toBe('')
    expect(finishes.why).toContain('Stacer')
  })

  it('matches a finish word by word', () => {
    expect(matchesFinish('Highfield - SP560 (HYP) B-G-B', 'hyp b-g-b')).toBe(true)
    expect(matchesFinish('Highfield - SP560 (HYP) B-G-B', 'sp660')).toBe(false)
  })
})

describe('the file’s own recommendation, and a second line on one table', () => {
  /* §0 of the sweep counted the stars: 588 of 588 Highfield hulls
     star exactly one motor, and dealer fit and parts star nothing.
     The rail carries the starred row BY NAME so the screen can say
     it in text above the list rather than drawing a glyph on the row
     — §4: "None uses a star, a ribbon or a colour." */
  it('names the starred row, and names nothing where the file stars nothing', () => {
    const rail = readRail(ctx, sp560)
    const motor = rail.chapters.find((c) => c.id === 'motor')!.tables[0]
    const starred = motor.rows.filter((r) => r.starred)
    expect(starred.length).toBe(1)
    expect(motor.recommends).not.toBe('')
    expect(motor.recommends).toContain(starred[0].tail)

    for (const table of rail.chapters.find((c) => c.id === 'fit')!.tables) {
      expect(table.rows.some((r) => r.starred)).toBe(false)
      expect(table.recommends).toBe('')
    }
  })

  it('says nothing about a table carrying one line', () => {
    for (const chapter of readRail(ctx, sp560).chapters) {
      for (const table of chapter.tables) {
        expect(table.severalSay).toBe('')
      }
    }
  })

  /* PRESSING A SECOND MOTOR FITS A SECOND MOTOR, and it always did:
     `addLine` adds, and these chapters are not radio groups. What is
     new is that the rail carries the engine's own sentence about it,
     so a manager is never told nothing. */
  it('carries the engine’s sentence once a second line goes on the same table', () => {
    const rail = readRail(ctx, sp560)
    const motor = rail.chapters.find((c) => c.id === 'motor')!.tables[0]
    const spare = motor.rows.find((r) => !r.fitted && r.act.do === 'add')
    expect(spare, 'the motor chapter offers nothing to add').toBeDefined()
    const line = (spare!.act as { line: QuoteLine }).line

    const with2: QuoteDef = {
      ...sp560,
      lines: [...sp560.lines, line],
      sections: sp560.sections.map((s) =>
        s.blockId === motor.id ? { ...s, lineIds: [...s.lineIds, line.id] } : s,
      ),
    }
    const after = readRail(ctx, with2).chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(after.severalSay).toContain('2 lines from')
    expect(after.severalSay).toContain(line.label)
    expect(after.severalSay).toContain('never in its place')
  })
})
