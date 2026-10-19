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
import { boatOfQuote, lineSaid } from '@/domain/quote/spoken'
import { readRail, matchesFinish, SEARCH_MIN } from './chapters'
import { choiceSay } from './say'
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
    /* said as the paper says it, never the file's "Yamaha - F90LB"
       (m2-last-critique.md, major 4) — and as a person says it, the answer
       first and no "chosen:" before it (the components critique,
       2026-09-29, blocker 2) */
    expect(motor.fact).toBe('Yamaha F90LB · 5 more offered')
    expect(motor.said).toBe('Yamaha F90LB')
    expect(motor.rest).toBe('5 more offered')
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

  it('carries the business’s own code beside the name, and never a second time', () => {
    /* THE ROW READ "Yamaha - F250XCB F250XCB": the file's key string
       and then the Model Code column, which is the same six characters
       (m2-last-critique.md, major 4). A motor's name carries its code,
       so the code is not printed again; a kit's name does not, so its
       code — what the dealer orders by — stands beside it. */
    const rail = readRail(ctx, assault)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    expect(motors.find((r) => r.tail === 'Yamaha F90LB')).toBeDefined()
    expect(motors.every((r) => r.code === '')).toBe(true)
    const kits = rail.chapters
      .find((c) => c.id === 'fit')!
      .tables.find((t) => t.title === 'Rigging Kits')!
    expect(kits.rows.length).toBeGreaterThan(0)
    for (const row of kits.rows) {
      expect(row.code).not.toBe('')
      expect(`${row.stem} ${row.tail}`).not.toContain(row.code)
    }
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
    /* on the SP560's rigging kits, which share their first five words */
    const kits = readRail(ctx, sp560)
      .chapters.find((c) => c.id === 'fit')!
      .tables.find((t) => t.title === 'Rigging Kits')!.rows
    expect(kits.length).toBeGreaterThan(1)
    const stem = kits[0].stem
    expect(stem.split(' ').length).toBeGreaterThan(1)
    expect(kits.every((r) => r.stem === stem)).toBe(true)
    /* and a maker's one word is the brand, not a stem worth two inks:
       "Yamaha F90LB" is drawn whole */
    const motors = readRail(ctx, assault).chapters.find((c) => c.id === 'motor')!.tables[0].rows
    expect(motors.every((r) => r.stem === '')).toBe(true)
    expect(motors.map((r) => r.tail)).toContain('Yamaha F90LB')
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

  it('says a pairing’s facts as the line is said, never with the file’s key " - "', () => {
    /* the ADV7's motors read "Rigging Kit Option Helm Master L2 - 6X9
       Binnacle" under "Yamaha F250XCB" (m2-last-critique.md, major 4) */
    const adv7 = quoteOn('boat_highfield', 'ADV7 (HYP) B-G-B')
    let seen = 0
    for (const quote of [adv7, sp560, assault]) {
      for (const chapter of readRail(ctx, quote).chapters) {
        for (const table of chapter.tables) {
          for (const row of [...table.rows, ...table.also]) {
            for (const fact of row.facts) {
              seen += 1
              expect(fact.value).toBe(lineSaid(fact.value))
              expect(fact.full).not.toContain('|')
              expect(
                fact.full.replace(/(^|\s)(\d[\d,.]*(?: (?:mm|m|kgs|kg))?) - (?=\d)/g, '$1$2 ~ '),
              ).not.toContain(' - ')
            }
          }
        }
      }
    }
    expect(seen).toBeGreaterThan(0)
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
    /* and it names the hull as every other line of the build does, never
       by the file's key (m2-last-critique.md, major 4) */
    expect(motor.sharedWhy).toContain(boatOfQuote(sp560).say)
    expect(motor.sharedWhy).not.toContain(sp560.subjectLabel)
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
    expect(after.severalSay).toContain(lineSaid(line.label, motor.title))
    expect(after.severalSay).not.toContain(line.label)
    expect(after.severalSay).toContain('never in its place')
  })
})

/* ============================================================
   PAST THE MOTOR, THE THING LEADS AND ITS CODE DOES NOT (the
   components critique, 2026-09-29, blocker 2). Walked on the quote
   the critic walked: the Stacer 519 Sea Ranger SDF, whose trailer
   head read "chosen: TA1400S13SB · T Alloy 1400 ATM S 13" Skid
   Braked · 4.9 - 5.3 m · 1 to choose from" and whose dealer fit read
   "chosen: Yamaha/Stacer · 704-6Y82L-22-07 · Binnacle Mount Rigging
   Kit · 6 more offered".
   ============================================================ */
describe('every chapter says the thing a person recognises first', () => {
  const sea = quoteOn('boat_stacer', '519 Sea Ranger SDF')
  const rail = readRail(ctx, sea)
  const chapter = (id: string) => rail.chapters.find((c) => c.id === id)!

  it('names the trailer by its words, keeps its code for the dealer, and says its facts', () => {
    const trailer = chapter('trailer')
    const row = trailer.tables[0]!.rows.find((r) => r.fitted)!
    expect(row.tail).toBe('T Alloy 1400 ATM S 13" Skid Braked')
    expect(row.code).toBe('TA1400S13SB')
    /* the boat it takes, its ATM and its wheels, off its own row */
    expect(row.spec).toBe('for a 4.9–5.3 m boat · 1,400 kg ATM · 13″ wheels')
    /* the shut head says the same name, with no "chosen:" and no count of the one on it */
    expect(trailer.said).toBe(row.tail)
    expect(trailer.fact).toBe(row.tail)
    expect(choiceSay(trailer, false)).toBe('')
    /* and its picture, which the ledger holds for that row */
    expect(trailer.picture?.src).toBe(row.picture?.src)
  })

  /* the components critique's minor 15, on the finale: its note about the trailer's price read
     "TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m already has registration in
     its Cash price", the paper's reading, under the act */
  it('names the trailer by its words in the finale’s note about what its price already has', () => {
    const trailer = chapter('trailer').tables[0]!.rows.find((r) => r.fitted)!
    const said = rail.doubleCharged.find((s) => s.includes('registration'))
    expect(said, 'the trailer’s price holds no registration on this quote').toBeDefined()
    expect(said).toContain(`${trailer.tail} already has registration`)
    expect(said).not.toMatch(/TA1400S13SB|4\.9 - 5\.3 m/)
  })

  it('names a rigging kit without its part number, which stays whole beside it', () => {
    const fit = chapter('fit')
    const kits = fit.tables.find((t) => t.title === 'Rigging Kits')!
    const kit = kits.rows.find((r) => r.fitted)!
    expect(kit.tail).toBe('Yamaha/Stacer · Binnacle Mount Rigging Kit')
    expect(kit.code).toBe('9ST-704-6Y82L-22-07')
    expect(fit.said).toBe(kit.tail)
    expect(fit.rest).toMatch(/^\d+ more offered$/)
    expect(fit.fact).not.toMatch(/chosen:|704-6Y82L/)
  })

  it('never leads a shut head with a code the line orders by', () => {
    for (const quote of [sea, sp560, assault]) {
      for (const c of readRail(ctx, quote).chapters.filter((x) => x.kind === 'band')) {
        expect(c.fact).not.toMatch(/^chosen:/)
        for (const table of c.tables) {
          for (const row of [...table.rows, ...table.also]) {
            const line =
              row.act.do === 'add'
                ? row.act.line
                : quote.lines.find((l) => l.id === (row.act as { lineId: string }).lineId)
            /* the name's first part is never one of the code's own tokens, where the name has
               more to it than that */
            const tokens = (line?.code ?? '').toLowerCase().split(/[\s()]+/)
            const parts = `${row.stem} ${row.tail}`.trim().split(' · ')
            if (parts.length > 1) {
              expect(tokens.includes(parts[0]!.toLowerCase()), `${row.tail} [${line?.code}]`).toBe(
                false,
              )
            }
          }
        }
      }
    }
  })

  it('rates each motor’s power for the chips, and says once what every price includes', () => {
    const motors = chapter('motor').tables[0]!
    expect(motors.rows.every((r) => /^\d+(\.\d+)?$/.test(r.power))).toBe(true)
    expect(new Set(motors.rows.map((r) => r.power)).size).toBeGreaterThan(1)
    expect(motors.rows.every((r) => r.contains === 'pre-delivery included')).toBe(true)
    expect(motors.includes).toBe('Every price here includes pre-delivery.')
    /* a list whose rows say nothing about it says nothing */
    expect(chapter('fit').tables.every((t) => t.includes === '')).toBe(true)
  })

  it('shows the chosen motor’s own picture on the head of its chapter', () => {
    const motor = chapter('motor')
    const on = motor.tables[0]!.rows.find((r) => r.fitted)!
    expect(motor.picture).not.toBeNull()
    expect(motor.picture?.src).toBe(on.picture?.src)
    /* and a chapter with nothing pictured on it shows none */
    expect(chapter('fit').picture).toBeNull()
  })
})
