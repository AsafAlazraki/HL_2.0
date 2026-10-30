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
import { rowLabel, type EntityDef, type QuoteDef, type RowData } from '@/domain/model'
import { isDone, mintQuoteFromView, quoteTotals } from '@/domain/quote'
import { hullTakesTwo, swapLines } from '@/domain/quote/swap'
import { lineSaid } from '@/domain/quote/spoken'
import { readBoatFit } from '@/domain/fitment/boat'
import { pairColumns, pairRule } from '@/domain/rules/constraints/pairRules'
import {
  bareListsSay,
  matchesFinish,
  offeredHere,
  readRail,
  SEARCH_MIN,
  tallyParts,
} from './chapters'
import { choiceSay } from './say'
import { NO_OTHER_FINISH, readFinishes } from './finishes'

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
       three the dealer fits — and they are four chapters and the finale; whom it is for is the
       bar's (the owner, 2026-10-30) */
    expect(sp560.sections.length).toBe(7)
    expect(names).toEqual(['The hull', 'Motor', 'Trailer', 'Dealer fit', 'The summary'])
  })

  it('keeps the engine’s numbers and gives the finale none', () => {
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
    /* WITH ONE MOTOR ON, ANOTHER GOES ON INSTEAD (build-close-critique.md, 2026-10-19, major 1),
       and its figure is what the whole step does to the engine's own total */
    const other = motors.find((r) => !r.fitted && r.amount !== null)!
    expect(other.act.do).toBe('swap')
    if (other.act.do !== 'swap') return
    const done = swapLines(other.act.swap)(assault, '2026-10-19T00:00:00.000Z')
    if (!isDone(done)) throw new Error('the swap was refused')
    expect(other.would).toBe(quoteTotals(done.next).total)
    expect(other.delta).toBe(other.would - quoteTotals(assault).total)
    expect(other.instead).not.toBe('')
  })

  it('weighs another motor on a given quote as the change it would be, and offers no press', () => {
    /* REFINE, 2026-10-21, BLOCKER: given, the same quote's other motors read their whole price
       with a plus sign ("F90LB2 +$14,934") where the draft read the difference ("−$1,733"), as if
       the customer would carry two. The figure is the draft's; the press stays the draft's. */
    const draft = readRail(ctx, assault).chapters.find((c) => c.id === 'motor')!.tables[0].rows
    const given: QuoteDef = { ...assault, state: 'issued', issuedAt: '2026-10-21T00:00:00.000Z' }
    const shut = readRail(ctx, given).chapters.find((c) => c.id === 'motor')!.tables[0].rows
    const others = shut.filter((r) => !r.fitted && r.amount !== null)
    expect(others.length).toBeGreaterThan(0)
    for (const row of others) {
      const was = draft.find((r) => r.key === row.key)!
      expect(row.delta).toBe(was.delta)
      expect(row.delta).not.toBe(row.amount)
      expect(row.instead).toBe(was.instead)
      expect(row.act.do).toBe('add')
      expect(row.beside).toBeNull()
    }
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
    /* AND THE REASON IS THE BOAT'S OWN HORSEPOWER (2026-10-22, refine-critique-2.md, 11). Every
       F250 is 250 hp and the SP560's own row says 90–115 hp, so "nothing is wrong with it" was
       false of all twenty-two: the sentence is the engine's envelope, from `@/domain/fitment`.
       It names the hull as the dealer does — "this boat", never by the file's key
       (m2-last-critique.md, major 4), nor by the pairing list's name and "the price file"
       (docs/WORDS.md) */
    expect(motor.sharedWhy).toBe('Over the 90–115 hp this boat takes.')
    expect(motor.sharedWhy).not.toContain(sp560.subjectLabel)
    /* the shared reason is said once and on no row; a twin F250 rig is not measured against a
       single-motor envelope the boat's row states, so it keeps the reason that is true of it */
    const own = motor.rows.filter((r) => r.why !== '')
    expect(own.every((r) => r.why !== motor.sharedWhy)).toBe(true)
    expect(
      own.every(
        (r) => r.why === 'The price list does not list it for this boat. Nothing is wrong with it.',
      ),
    ).toBe(true)
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
    expect(fit.rows[0].why).toContain('Nothing is wrong with it')
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
    expect(gfab.why).toBe('Nothing from GFAB Trailers is made for this boat.')

    const opened = readRail(ctx, sp560, { showAll: new Set([gfab.id]) })
    const shown = opened.chapters
      .find((c) => c.id === 'trailer')!
      .tables.find((t) => t.title === 'GFAB Trailers')!
    expect(shown.showingAll).toBe(true)
    expect(shown.rows.length).toBe(32)
    expect(shown.rows.every((r) => r.outside)).toBe(true)
    expect(shown.sharedWhy).toContain('Nothing is wrong with it')
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
      'No customer’s name is on this quote yet, so it cannot be given.',
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

  /* said as the boat, not as how the maker's list is laid out (the refine critique, 18: "Haines
     Signature does not list its boats by finish…", "Stacer lists each of its boats once…") */
  it('says why, on a register that files one row per model, in the dealer’s words', () => {
    const finishes = readFinishes(ctx, assault)
    expect(finishes.rows.length).toBe(0)
    expect(finishes.why).toBe(NO_OTHER_FINISH)
    expect(finishes.why).not.toMatch(/lists? (each|its boats)|by finish|Stacer/)
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

  /* TWO MOTORS ON ONE BOAT ARE NEVER SILENT. A press on a motor puts it on instead of the one
     there now (build-close-critique.md, 2026-10-19), so two are on a boat only where somebody
     put the second beside the first, or on a quote written before; the rail says so as a person
     would, and never in the engine's "A pick here goes on BESIDE what is already there". */
  it('says two motors as a person would once a second one is on', () => {
    const rail = readRail(ctx, sp560)
    const motor = rail.chapters.find((c) => c.id === 'motor')!.tables[0]
    const spare = motor.rows.find((r) => !r.fitted && r.act.do === 'swap')
    expect(spare, 'the motor chapter offers nothing to put on instead').toBeDefined()
    if (spare?.act.do !== 'swap') return
    const line = spare.act.swap.on[0]!.line

    const with2: QuoteDef = {
      ...sp560,
      lines: [...sp560.lines, line],
      sections: sp560.sections.map((s) =>
        s.blockId === motor.id ? { ...s, lineIds: [...s.lineIds, line.id] } : s,
      ),
    }
    const after = readRail(ctx, with2).chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(after.severalSay).toMatch(/^Two motors are on this boat now, /)
    expect(after.severalSay).toContain(spare.tail)
    expect(after.severalSay).not.toContain(line.label)
    expect(after.severalSay).not.toMatch(/BESIDE|lines from/)
  })

  it('offers a motor beside the one there only on a hull whose own row says it takes two', () => {
    /* the PA860's row rates it "2 x 300 HP"; the Assault Pro's says nothing of two */
    const twin = quoteOn('boat_highfield', 'PA860')
    const seen = [assault, twin].map((quote) => {
      const swaps = readRail(ctx, quote)
        .chapters.find((c) => c.id === 'motor')!
        .tables.flatMap((t) => t.rows)
        .filter((r) => r.act.do === 'swap')
      return { two: hullTakesTwo(ctx, quote), swaps, beside: swaps.filter((r) => r.beside) }
    })
    expect(seen.map((s) => s.two)).toEqual([false, true])
    for (const { two, swaps, beside } of seen) {
      expect(swaps.length, 'the hull offers nothing to put on instead').toBeGreaterThan(0)
      expect(beside.length).toBe(two ? swaps.length : 0)
    }
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

  /* AND A RIGGING KIT BY THE MOTOR IT IS FOR (build-close-critique-2.md major 1; docs/WORDS.md
     rule 4): after a change of mind the kit was named by the price list's description — "Mech
     Rigging Kit · 704 Binnacle Mount w 6Y8 2 Gauges, 5 m Harness, Cables & Filter" — in the
     chapter head and the finale. The description is the workshop's, kept whole on the row. */
  it('names a rigging kit by the motor it is for, with the price list’s words and its code kept', () => {
    const fit = chapter('fit')
    const kits = fit.tables.find((t) => t.title === 'Rigging Kits')!
    const kit = kits.rows.find((r) => r.fitted)!
    const motor = chapter('motor').tables[0]!.rows.find((r) => r.fitted)!
    const model = `${motor.stem} ${motor.tail}`.trim().replace(/^\S+\s+/, '')
    expect(`${kit.stem} ${kit.tail}`.trim()).toBe(`Rigging kit for the ${model}`)
    expect(kit.listed).toBe('Yamaha/Stacer · Binnacle Mount Rigging Kit')
    expect(kit.code).toBe('9ST-704-6Y82L-22-07')
    expect(fit.said).toBe(`Rigging kit for the ${model}`)
    expect(fit.rest).toMatch(/^\d+ more offered$/)
    expect(fit.fact).not.toMatch(/chosen:|704-6Y82L|Binnacle/)
    /* a kit offered for another motor is said by that motor, from its own row */
    for (const row of kits.rows.filter((r) => !r.fitted)) {
      if (row.listed !== '') expect(`${row.stem} ${row.tail}`).toMatch(/^Rigging kit for the \S/)
    }
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

/* THE HAINES BUILD (the refine round, 2026-10-21, refine-critique.md major 17): Dealer fit's head
   led with "SIG 525F w Yamaha · F90XB", the price list's key for a factory package. */
describe('a factory package is said by the motor it comes with', () => {
  const haines = quoteOn('boat_haines', 'Signature Fisher - 525F')
  const packs = (showAll: boolean) => {
    const first = readRail(ctx, haines)
    const table = first.chapters
      .flatMap((c) => c.tables)
      .find((t) => t.title === 'Haines Signature Factory Packages')!
    if (!showAll) return { chapter: first.chapters.find((c) => c.tables.includes(table))!, table }
    const opened = readRail(ctx, haines, { showAll: new Set([table.id]) })
    const all = opened.chapters
      .flatMap((c) => c.tables)
      .find((t) => t.title === 'Haines Signature Factory Packages')!
    return { chapter: opened.chapters.find((c) => c.tables.includes(all))!, table: all }
  }

  it('names the package on the quote by its motor, and never by the file’s key', () => {
    const { chapter, table } = packs(false)
    const names = [...table.rows, ...table.also].map((r) => `${r.stem} ${r.tail}`.trim())
    expect(names).toContain('Yamaha F90XB package')
    for (const name of names) expect(name).not.toMatch(/\bSIG\b| w /)
    /* the shut head says it the same way */
    expect(chapter.said).toBe('Yamaha F90XB package')
    expect(chapter.fact).toMatch(/^Yamaha F90XB package · /)
  })

  it('says which boat a package is for where Show all lists another boat’s', () => {
    const { table } = packs(true)
    const outside = table.rows.filter((r) => r.outside)
    expect(outside.length).toBeGreaterThan(0)
    for (const row of outside) expect(`${row.stem} ${row.tail}`).toMatch(/ · for the SIG \S+/)
    /* and two packages of one motor for two boats are never one name */
    const said = table.rows.map((r) => `${r.stem} ${r.tail}`.trim())
    expect(new Set(said).size).toBe(said.length)
  })
})

/* ============================================================
   THE FITMENT ROUND'S TWO CHANGES TO THE BUILD (2026-10-22).

   A motor outside the boat's own horsepower says so where it is offered
   and where it sits on the quote (refine-critique-2.md, 11: a 2.5 hp
   Yamaha went on a Formosa GRT 425 rated 40–60 hp beside "Nothing is
   wrong with it"). And one boat goes home on one trailer: a second
   trailer is offered in place of the first, with the rule said once.
   ============================================================ */
/** the line a press would put on, whether it adds or swaps */
const lineOf = (r: { act: { do: string } }): QuoteDef['lines'][number] | undefined => {
  const act = r.act as {
    do: string
    line?: QuoteDef['lines'][number]
    swap?: { on: { line: QuoteDef['lines'][number] }[] }
  }
  return act.do === 'add' ? act.line : act.do === 'swap' ? act.swap?.on[0]?.line : undefined
}

describe('the boat’s horsepower and its one trailer, on the build', () => {
  const grt = quoteOn('boat_formosa', 'GRT 425')

  it('says the envelope on a motor outside it, offered under Show all', () => {
    const motorStep = readRail(ctx, grt).chapters.find((c) => c.id === 'motor')!.tables[0]!
    const rail = readRail(ctx, grt, { showAll: new Set([motorStep.id]) })
    const motor = rail.chapters.find((c) => c.id === 'motor')!.tables[0]!
    const small = motor.rows.find((r) => lineOf(r)?.label.includes('F2.5') === true)
    expect(small?.outside).toBe(true)
    const said = [small?.why, motor.sharedWhy]
    expect(said).toContain('Under the 40–60 hp this boat takes.')
    expect(said.join(' ')).not.toContain('Nothing is wrong')
  })

  it('says it again where the 2.5 hp sits on the quote', () => {
    const motorStep = readRail(ctx, grt).chapters.find((c) => c.id === 'motor')!.tables[0]!
    const all = readRail(ctx, grt, { showAll: new Set([motorStep.id]) })
    const row = all.chapters
      .find((c) => c.id === 'motor')!
      .tables[0]!.rows.find((r) => lineOf(r)?.label.includes('F2.5') === true)!
    const line = lineOf(row)!
    const blockId =
      row.act.do === 'add'
        ? row.act.blockId
        : row.act.do === 'swap'
          ? row.act.swap.on[0]!.blockId
          : ''
    const withIt: QuoteDef = {
      ...grt,
      lines: [...grt.lines, line],
      sections: grt.sections.map((s) =>
        s.blockId === blockId ? { ...s, lineIds: [...s.lineIds, line.id] } : s,
      ),
    }
    const motor = readRail(ctx, withIt).chapters.find((c) => c.id === 'motor')!.tables[0]!
    const onQuote = [...motor.rows, ...motor.also].find((r) => r.fitted && r.tail.includes('F2.5'))
    expect(onQuote?.why).toBe('Under the 40–60 hp this boat takes.')
  })

  it('offers the SP660’s GFAB in place of the REDCO, and says the rule once', () => {
    const sp660 = quoteOn('boat_highfield', 'SP660 (PVC) W-W-WB')
    const trailer = readRail(ctx, sp660).chapters.find((c) => c.id === 'trailer')!
    const gfab = trailer.tables.find((t) => t.title === 'GFAB Trailers')!
    expect(gfab.rows).toHaveLength(1)
    expect(gfab.rows[0]!.act.do).toBe('swap')
    expect(gfab.rows[0]!.instead).toContain('REDCO')
    expect(gfab.oneTrailer).toBe('One trailer to a boat, because a boat sits on one trailer.')
    expect(trailer.tables.filter((t) => t.oneTrailer !== '')).toHaveLength(1)
    /* pressed, the step leaves one trailer on the boat */
    const act = gfab.rows[0]!.act
    if (act.do !== 'swap') return
    const done = swapLines(act.swap)(sp660, '')
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    const trailers = done.next.lines.filter((l) => ctx.entities[l.entityId]?.kind === 'trailer')
    expect(trailers).toHaveLength(1)
    expect(trailers[0]!.label).toContain('GFAB')
  })
})

const motorOf = (rail: ReturnType<typeof readRail>) =>
  rail.chapters.find((c) => c.id === 'motor')!.tables[0]!

/* ONE NUMBER ON BOTH SCREENS (built-critique-m3.md, blocker 4): with "a tiller boat must take a
   tiller motor" in force, the Classic 340's motor list offers 2 of the 3 the price list makes,
   and "Back to the n made for this boat" says 2 — the count Fitment puts over the same list. */
describe('what the dealer’s rule refuses is not counted as on offer', () => {
  const boatCols = pairColumns(ctx, 'boat')
  const motorCols = pairColumns(ctx, 'motor')
  const rule = pairRule({
    orgId: 'northside',
    boat: { column: boatCols.find((c) => c.name === 'steering')!, op: 'eq', value: 'Tiller' },
    partnerKind: 'motor',
    partner: {
      column: motorCols.find((c) => c.name === 'controls')!,
      op: 'eq',
      value: 'Tiller handle',
    },
    because: 'a tiller boat has no helm to steer a remote motor from',
    severity: 'block',
    enabled: true,
    now: '2026-10-22T09:00:00.000Z',
  })
  const ruledCtx = { ...ctx, constraintDefs: [rule] }
  const cl340 = quoteOn('boat_highfield', 'CL340 (PVC) W-W-WD')

  it('offers 2 on the motor list, and Fitment counts the same 2 made for this boat', () => {
    const plain = motorOf(readRail(ctx, cl340))
    const ruled = motorOf(readRail(ruledCtx, cl340))
    expect(offeredHere(plain)).toBe(3)
    expect(offeredHere(ruled)).toBe(2)
    /* the tiles under the list, fitted or offered, are the two */
    expect(ruled.rows.filter((r) => r.outside !== true)).toHaveLength(2)

    const boat = pack.byKey('boat_highfield')
    const fit = readBoatFit(ruledCtx, { tableId: boat.id, rowId: cl340.rootRowId })!
    expect(fit.motor!.counts.made).toBe(offeredHere(ruled))
  })
})

describe('a rule that refuses a boat’s starred motor, on the next pick and at the give', () => {
  /* built-critique-m3-2.md, blocker 1: "When the boat's maker is Stacer, the motor's horsepower
     must be at most 20 hp", and the next Stacer 659 draft opened on the refused F130XA */
  const cols = (kind: 'boat' | 'motor') => pairColumns(ctx, kind)
  const stacerRule = (severity: 'block' | 'warn') =>
    pairRule({
      orgId: 'northside',
      boat: { column: cols('boat').find((c) => c.name === 'maker')!, op: 'eq', value: 'Stacer' },
      partnerKind: 'motor',
      partner: {
        column: cols('motor').find((c) => c.name === 'horsepower')!,
        op: 'lte',
        value: '20',
      },
      because: 'a Stacer this size is sold with a small motor',
      severity,
      enabled: true,
      now: '2026-10-22T09:00:00.000Z',
    })
  const refusing = { ...ctx, constraintDefs: [stacerRule('block')] }
  const warning = { ...ctx, constraintDefs: [stacerRule('warn')] }
  const mintIn = (world: typeof ctx): QuoteDef => {
    const table: EntityDef = pack.byKey('boat_stacer')
    const row = (pack.rowsByEntity[table.id] ?? []).find((r: RowData) =>
      rowLabel(table, r).includes('659 Ocean Ranger Cen Cab'),
    )!
    const view = createViewFor(world, table.id)
    return mintQuoteFromView(world, { viewId: view.id, rowId: row.id, reference: 'NSM-R' })!
  }

  it('a new draft carries neither the refused motor nor its kit, and nothing stands in the give', () => {
    const quote = mintIn(refusing)
    expect(quote.lines.some((l) => /F130XA/.test(l.label))).toBe(false)
    const rail = readRail(refusing, quote)
    expect(rail.blockers.some((b) => /your rule refuses/.test(b))).toBe(false)
    /* the list still says, once, what it does not offer and why */
    const motor = motorOf(rail)
    const said = motor.ruled.find((r) => r.refuses)!
    expect(said.names.some((n) => /F130XA/.test(n))).toBe(true)
    expect(said.onQuote).toEqual([])
    /* the shut head says whose decision the empty list is, and counts what the list says */
    const head = rail.chapters.find((c) => c.id === 'motor')!
    expect(head.fact).toBe('none your rule allows')
    expect(said.fromTheList).toBe(said.names.length)
  })

  it('a draft made before the rule is refused at the give, once, with the rule’s because', () => {
    const before = mintIn(ctx)
    expect(before.lines.some((l) => /F130XA/.test(l.label))).toBe(true)
    const rail = readRail(refusing, before)
    const refused = rail.blockers.filter((b) => /your rule refuses/.test(b))
    expect(refused).toHaveLength(1)
    expect(refused[0]).toMatch(/^The Yamaha F130XA is on this quote/)
    expect(refused[0]).toContain('because a Stacer this size is sold with a small motor')
    expect(rail.chapters.find((c) => c.id === 'finale')!.fact).toBe('not ready to give yet')
  })

  it('a rule that warns marks the tile and is said over the give, and never refuses it', () => {
    const quote = mintIn(warning)
    const rail = readRail(warning, quote)
    expect(rail.blockers.some((b) => /your rule/i.test(b))).toBe(false)
    expect(rail.warnedOnQuote).toHaveLength(1)
    expect(rail.warnedOnQuote[0]).toMatch(/^Your rule warns about the Yamaha F130XA on this quote/)
    const tile = motorOf(rail).rows.find((r) => /F130XA/.test(r.tail))!
    expect(tile.warned).toBe(true)
  })
})

/* ============================================================
   A QUOTE THAT IS NOT A BOAT READS AS WHAT IT SELLS (the owner,
   2026-10-30: "quotes are not just boats - also motors or trailers or
   even dealer fit things as well"; start-needs.md). Measured on the
   pack, 2026-10-31.
   ============================================================ */
/** the bands of a rail, each with its number */
const bands = (rail: ReturnType<typeof readRail>) =>
  rail.chapters.filter((c) => c.kind === 'band').map((c) => `${c.num} ${c.name}`)

describe('a motor, a trailer or a part sold on its own', () => {
  /* minted as New quote mints one: the thing alone, nothing of the file's put on beside it */
  const aloneOn = (tableId: string, find: string): QuoteDef => {
    const table = ctx.entities[tableId]!
    const row = (pack.rowsByEntity[tableId] ?? []).find((r: RowData) =>
      rowLabel(table, r).includes(find),
    )
    expect(row, `${tableId} has no row matching ${find}`).toBeDefined()
    const view = createViewFor(ctx, tableId)
    return mintQuoteFromView(ctx, {
      viewId: view.id,
      rowId: row!.id,
      reference: 'NSM-TEST',
      hullAlone: true,
    })!
  }
  const motor = aloneOn('mot_yamaha', 'F90LB')
  const trailer = aloneOn('trl_dunbier', '4M-13SL')
  const part = aloneOn('parts', 'Sand Anchor Kit - 10lb')

  it('leads with the thing sold, and a boat is a choice at the end', () => {
    const rail = readRail(ctx, motor)
    expect(rail.sells).toEqual({ boat: false, kind: 'motor', noun: 'motor' })
    expect(bands(rail)).toEqual(['01 The motor', '02 Dealer fit', '03 Add a boat'])
    const first = rail.chapters[0]!
    expect(first.subject).toBe(true)
    expect(first.goods).toBe('motor')
    expect(first.said).toBe('Yamaha F90LB')
    expect(first.amount).toBe(14330)
    /* its own list is not drawn under it: it is the lit card of its choices */
    expect(first.tables).toEqual([])
    expect(first.boat?.axes.map((a) => a.title)).toEqual(['Motor'])
    expect(first.finishes).toBeUndefined()
    const boats = rail.chapters.find((c) => c.id === 'hull')!
    expect(boats.optional).toBe(
      'This quote is for the motor on its own. A boat goes on it only if you choose one here.',
    )
    expect(boats.boat).toBeUndefined()
    expect(boats.finishes).toBeUndefined()
    expect(boats.lines).toBe(0)
  })

  it('says a boat as a person says one, and nothing as “this boat”', () => {
    const rail = readRail(ctx, motor)
    const boats = rail.chapters.find((c) => c.id === 'hull')!
    const named = boats.tables.flatMap((t) => t.rows.map((r) => `${r.stem} ${r.tail}`.trim()))
    expect(named).toContain('Highfield Sport 460 · PVC · White / White / White/Blue')
    expect(named.some((n) => /\(PVC\)|W-W-WB/.test(n))).toBe(false)
    for (const quote of [motor, trailer, part]) {
      const said = JSON.stringify(readRail(ctx, quote).chapters)
      expect(said).not.toMatch(/this boat|The hull|No other finish/)
    }
    expect(boats.tables.find((t) => t.title === 'Surtees')?.why).toBe(
      'Nothing from Surtees goes with this motor.',
    )
  })

  it('waits for no boat in the total, and colours the thing as itself', () => {
    const parts = tallyParts(readRail(ctx, motor).chapters)
    expect(parts.map((p) => `${p.name} ${p.kind}`)).toEqual([
      'The motor motor',
      'Dealer fit accessory',
    ])
    const sold = tallyParts(readRail(ctx, part).chapters)
    expect(sold.map((p) => `${p.name} ${p.kind} ${p.amount}`)).toEqual([
      'The product accessory 138',
    ])
  })

  it('reads a trailer on its own as one chapter, its own', () => {
    const rail = readRail(ctx, trailer)
    expect(bands(rail)).toEqual(['01 The trailer'])
    expect(rail.chapters[0]!.boat?.axes[0]?.title).toBe('Trailer')
  })

  it('says several lists with nothing on them as one sentence', () => {
    expect(bareListsSay(['Formosa', 'Jeanneau', 'Surtees'], { boat: false, noun: 'product' })).toBe(
      'Nothing from Formosa, Jeanneau or Surtees goes with this product.',
    )
    expect(bareListsSay(['GFAB Trailers'], { boat: true, noun: 'boat' })).toBe(
      'Nothing from GFAB Trailers is made for this boat.',
    )
  })

  it('leaves a boat’s quote as it was: the hull first, numbered by the engine', () => {
    const rail = readRail(ctx, sp560)
    expect(rail.sells.boat).toBe(true)
    const hull = rail.chapters[0]!
    expect(`${hull.num} ${hull.name}`).toBe('01 The hull')
    expect(hull.subject).toBe(true)
    expect(hull.goods).toBe('boat')
    expect(hull.optional).toBeUndefined()
  })
})
