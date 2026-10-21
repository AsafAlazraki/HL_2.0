/* ============================================================
   THE CONFIGURATOR'S COUNTED SENTENCES AND ITS PICTURE CAPTION,
   against the real pack.

   Every quote below is minted by the engine from a row of
   `data/northside/`, exactly as the picker mints one; every motor
   name and every finish looked for in a sentence is read off that
   document, never typed here.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { rowLabel, type EntityDef, type QuoteDef, type RowData } from '@/domain/model'
import { chargeAlreadyIn, mintQuoteFromView, priceLevelsFor } from '@/domain/quote'
import { fileLevelNames, fileLevelNamesIn } from '@/domain/quote/levelSaid'
import { HULL_PRICE_REASON, hullLineOf } from '@/domain/quote/nought'
import { saidOnQuote } from '@/domain/quote/spoken'
import { readRail } from './chapters'
import {
  allSay,
  cappedSay,
  chargeSay,
  choiceSay,
  engineWordsIn,
  insteadSay,
  levelCountSay,
  orphanSay,
  pictureSays,
  reasonSay,
  savedSay,
  searchSay,
  severalSay,
  sourcesSay,
  swapSay,
  totalNoteSay,
  unpricedSay,
  unpricedTag,
} from './say'
import { hullHero, stageArt } from './stage'
import { itemOfQuote } from '@/data/pictures'

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

/** the quote's motors as the paper names them — "Yamaha F90XB", never
 *  the file's "Yamaha - F90XB" (m2-last-critique.md, major 4) */
const motorsOn = (quote: QuoteDef): string[] =>
  quote.lines
    .filter((l) => ctx.entities[l.entityId]?.kind === 'motor')
    .map((l) => saidOnQuote(quote, l))

/* WHAT IS NOT IN THE TOTAL, SAID ONCE, UNDER IT (docs/WORDS.md, "one fact, one place"). It was
   "Not priced on this quote" on a chapter's head, a paragraph over Dealer fit, a note under the
   finale's act ("carries no price on this quote, and the paper prints it as not priced") and a
   count under the finale's figure. The same properties are held in the one sentence: its verb
   agrees with its count, it says nothing where everything is priced, and where the boat itself
   has no price that is said first. */
describe('the line under the total', () => {
  it('agrees its verb with the count — one has, two have — in the dealer’s words', () => {
    expect(totalNoteSay(['Rigging kit for the F115LB'], false)).toBe(
      'The rigging kit for the F115LB has no price on the price list, so it is not in this total.',
    )
    expect(
      totalNoteSay(['Rigging kit for the F115LB', 'Tube Covers to suit PVC Boat'], false),
    ).toBe(
      'The rigging kit for the F115LB and the Tube Covers to suit PVC Boat have no price on the price list, so they are not in this total.',
    )
    expect(totalNoteSay(['A', 'B', 'C'], false)).toBe(
      'The A, the B and the C have no price on the price list, so they are not in this total.',
    )
  })

  /* A WHOLE LIST THE PRICE LIST PRICES NOTHING IN IS SAID BY ITS NAME, once, in this line (the
     refine round, 2026-10-21): the tag beside "Rigging Kits" said it a third time in the window */
  it('names a whole list with no price once, and then the item it leaves out', () => {
    expect(totalNoteSay(['Rigging kit for the F90LB'], false, ['Rigging Kits'])).toBe(
      'Rigging Kits have no price on the price list, so the rigging kit for the F90LB is not in this total.',
    )
    expect(
      totalNoteSay(
        ['Rigging kit for the F90LB', 'Rigging kit for the F115LB', 'Tube Covers'],
        false,
        ['Rigging Kits', 'Rigging Kits', ''],
      ),
    ).toBe(
      'Rigging Kits and the Tube Covers have no price on the price list, so the rigging kit for the F90LB, the rigging kit for the F115LB and the Tube Covers are not in this total.',
    )
    expect(totalNoteSay(['Rigging kit for the F90LB'], true, ['Rigging Kits'])).toBe(
      'The boat has no price yet, so this total is everything but the boat. Rigging Kits have no price on the price list either, so the rigging kit for the F90LB is not in it.',
    )
  })

  it('says nothing where every line carries a price', () => {
    expect(totalNoteSay([], false)).toBe('')
    expect(totalNoteSay([], false, [])).toBe('')
  })

  it('says first that the figure is everything but the boat, where the boat has no price', () => {
    expect(totalNoteSay([], true)).toBe(
      'The boat has no price yet, so this total is everything but the boat.',
    )
    expect(totalNoteSay(['Rigging kit for the F90LB'], true)).toBe(
      'The boat has no price yet, so this total is everything but the boat. The rigging kit for the F90LB has no price on the price list either.',
    )
  })

  it('never says an engine word, and never the paper or the price file', () => {
    for (const said of [
      totalNoteSay(['Rigging kit for the F115LB'], false),
      totalNoteSay(['A', 'B'], true),
      totalNoteSay(['Rigging kit for the F90LB'], false, ['Rigging Kits']),
    ]) {
      expect(engineWordsIn(said)).toEqual([])
      expect(said).not.toMatch(/price file|paper|not priced on this quote/i)
    }
  })
})

/* A CHANGE OF MIND, SAID AS A PERSON SAYS IT (build-close-critique.md, 2026-10-19, majors 1 and
   2): never "A pick here goes on BESIDE what is already there and never in its place". */
describe('a change of mind', () => {
  it('says two motors on one boat as a person would, and asks where the hull takes one', () => {
    expect(severalSay('motor', ['Yamaha F90LB'], false)).toBe('')
    expect(severalSay('motor', ['Yamaha F90LB', 'Yamaha F115LB'], false)).toBe(
      'Two motors are on this boat now, the Yamaha F90LB and the Yamaha F115LB, and each is charged. Was that meant? Pressing one takes it off.',
    )
    expect(severalSay('motor', ['Yamaha F250XCA', 'Yamaha F250XCB'], true)).toBe(
      'Two motors are on this boat now, the Yamaha F250XCA and the Yamaha F250XCB, and each is charged.',
    )
    expect(severalSay('accessory', ['Battery MFM50', 'Battery Box · Small'], false)).toBe(
      'Battery MFM50 and Battery Box · Small are both on this quote, and each is charged.',
    )
    for (const said of [
      severalSay('motor', ['A', 'B', 'C'], false),
      severalSay('accessory', ['A', 'B', 'C'], false),
    ])
      expect(engineWordsIn(said)).toEqual([])
  })

  /* THE FIGURE IS WHAT THE CHANGE OF MIND DID TO THE TOTAL (the refine round, 2026-10-21): the
     motor's own price was the chapter head's and the tile's too, three times in one window */
  it('says a swap and its way back, with what it did to the total', () => {
    expect(swapSay('Yamaha F115LB', 'F90LB', true, 2_337)).toEqual({
      said: 'Yamaha F115LB put on the quote instead of the F90LB, with its rigging kit · +$2,337',
      back: 'Yamaha F115LB off the quote again, and the F90LB back on with its rigging kit',
    })
    expect(swapSay('Yamaha F90LB', 'F115LB', false, -2_337).said).toBe(
      'Yamaha F90LB put on the quote instead of the F115LB · −$2,337',
    )
    expect(swapSay('Yamaha F90LB', 'F90LB2', false, 0).said).toBe(
      'Yamaha F90LB put on the quote instead of the F90LB2 · no change to the total',
    )
    expect(swapSay('Yamaha F115LB', 'F90LB', false, null).said).toBe(
      'Yamaha F115LB put on the quote instead of the F90LB · no price on it',
    )
  })

  it('says a kit for a motor the boat does not carry, by the motor it is for', () => {
    expect(orphanSay('Rigging kit for the F90LB', 'Yamaha F90LB')).toBe(
      'The rigging kit for the F90LB is on this quote, and no Yamaha F90LB is on this boat now.',
    )
    /* a kit that names no motor keeps the price list's words, and its capitals */
    expect(orphanSay('Binnacle Mount Rigging Kit', 'Yamaha F90LB')).toBe(
      'The Binnacle Mount Rigging Kit is on this quote, and no Yamaha F90LB is on this boat now.',
    )
  })
})

describe('the caption under the stage photograph', () => {
  const sp560 = quoteOn('boat_highfield', 'SP560')
  const register = ctx.entities[sp560.rootTableId]?.name ?? ''
  const hero = hullHero(ctx, sp560)

  it('says what the photograph shows, in the ledger’s own words, and whose rig it is', () => {
    expect(hero, 'the hero ledger holds no photograph of this hull').not.toBeNull()
    const art = stageArt(itemOfQuote(sp560), register, hero)
    const said = pictureSays(art, sp560, readRail(ctx, sp560), ctx)
    expect(said).not.toBeNull()
    expect(said!.shows.startsWith(hero!.subject)).toBe(true)
    expect(said!.shows).toContain('the maker’s own finish and rig')
  })

  /* THE BOAT, NOT THE APP (the refine critique, 18): "This quote: the Yamaha F40LA · Tiller
     from 02 Motor." pointed at the screen's own chapter. The motor is said; where the screen
     keeps it is not. */
  it('names this quote’s motor off the document itself, and never the chapter it is kept in', () => {
    const rail = readRail(ctx, sp560)
    const said = pictureSays(stageArt(itemOfQuote(sp560), register, hero), sp560, rail, ctx)
    const motors = motorsOn(sp560)
    expect(motors.length).toBeGreaterThan(0)
    for (const motor of motors) expect(said!.ours).toContain(motor)
    const chapter = rail.chapters.find((c) => c.tables.some((t) => t.kind === 'motor'))!
    expect(said!.ours).not.toContain(`${chapter.num} ${chapter.name}`)
    expect(said!.ours).not.toMatch(/\bfrom \d/)
    expect(said!.ours).toBe(`On this quote: the ${motors.join(' and ')}.`)
  })

  /* THE FINISH IS THE HEAD'S (docs/WORDS.md, one fact once): the boat's material and colour
     stand under its name in the masthead with their swatches, a few lines above the caption, so
     the caption says only what the photograph cannot be trusted for — the maker's finish, which
     its first line says, and the motor */
  it('leaves the finish to the head, and says whose finish the photograph shows', () => {
    const rail = readRail(ctx, sp560)
    const finish = rail.chapters
      .find((c) => c.finishes !== undefined)!
      .finishes!.rows.find((f) => f.current)!
    const said = pictureSays(stageArt(itemOfQuote(sp560), register, hero), sp560, rail, ctx)
    expect(finish.colour.read).toBe(true)
    expect(said!.ours).not.toContain(finish.colour.say)
    expect(said!.ours).not.toContain(finish.colour.code)
    expect(said!.shows).toContain('the maker’s own finish')
    expect(said!.ours.startsWith('On this quote: ')).toBe(true)
  })

  it('says there is no motor yet, rather than going quiet, when the motor comes off', () => {
    const bare: QuoteDef = {
      ...sp560,
      lines: sp560.lines.filter((l) => ctx.entities[l.entityId]?.kind !== 'motor'),
    }
    const said = pictureSays(
      stageArt(itemOfQuote(bare), register, hero),
      bare,
      readRail(ctx, bare),
      ctx,
    )
    expect(said!.ours).toContain('no motor yet')
  })

  it('does not invite a motor onto a quote that has been given', () => {
    const given: QuoteDef = {
      ...sp560,
      state: 'issued',
      lines: sp560.lines.filter((l) => ctx.entities[l.entityId]?.kind !== 'motor'),
    }
    const said = pictureSays(
      stageArt(itemOfQuote(given), register, hero),
      given,
      readRail(ctx, given),
      ctx,
    )
    expect(said!.ours).toContain('no motor')
    expect(said!.ours).not.toContain('is where one goes on')
    expect(said!.ours).not.toContain('yet')
  })

  it('says nothing where the stage draws a mark or a name rather than a boat', () => {
    const quote = quoteOn('boat_stacer', '529 Assault Pro')
    const said = pictureSays(
      { kind: 'word', because: 'no picture held' },
      quote,
      readRail(ctx, quote),
      ctx,
    )
    expect(said).toBeNull()
  })
})

/* ============================================================
   THE RAIL'S OWN SENTENCES (M2-close critique #4), each against a
   quote the engine minted from the real pack.
   ============================================================ */
describe('the rail says what a dealer says', () => {
  const sp560 = quoteOn('boat_highfield', 'SP560')
  const rail = readRail(ctx, sp560)
  const chapter = (id: string) => rail.chapters.find((c) => c.id === id)!

  /* NOTHING IS COUNTED OVER A LIST AT REST (build-close-critique-2.md major 2): the head says
     how many more are offered, the switch how many the whole list holds, a search how many it
     found. What only the list can say is that it is not all drawn. */
  it('counts over a list only what is not drawn, and gives a written-down list no reason line', () => {
    const motors = chapter('motor').tables[0]
    expect(motors.paired).toBe(true)
    expect(cappedSay(motors)).toBe('')
    expect(cappedSay({ ...motors, counts: { ...motors.counts, capped: true } })).toMatch(
      /^The first [\d,]+ are shown\.$/,
    )
    /* the list's workbook name and its file-wide rate were the reason
       line; that the list is made for this boat is all of it a salesperson needs */
    expect(reasonSay(motors)).toBe('')
  })

  it('says once, over a list with no price at all, that the file prices none of it', () => {
    const lists = chapter('fit').tables
    const bare = lists.filter((t) => t.unpriced)
    const priced = lists.filter((t) => !t.unpriced)
    expect(bare.length).toBeGreaterThan(0)
    expect(priced.length).toBeGreaterThan(0)
    for (const t of bare) {
      expect(t.rows.every((r) => r.amount === null && r.column === null)).toBe(true)
      expect(unpricedSay(t)).toBe(
        `${t.title} have no price on the price list, so they go on this quote unpriced.`,
      )
    }
    for (const t of priced) expect(unpricedSay(t)).toBe('')
  })

  it('tags a list with no price at all in five words, and a priced list not at all', () => {
    const lists = chapter('fit').tables
    for (const t of lists)
      expect(unpricedTag(t)).toBe(t.unpriced ? 'No price on the price list' : '')
  })

  it('draws no tag over a list the line under the total already names', () => {
    for (const t of chapter('fit').tables) {
      expect(unpricedTag(t, [t.title])).toBe('')
      expect(unpricedTag(t, ['Some other list'])).toBe(
        t.unpriced ? 'No price on the price list' : '',
      )
    }
  })

  it('says once which motor every press on the list takes off, and nothing where none does', () => {
    expect(insteadSay('F90LB')).toBe(
      'Each goes on in place of the F90LB, for the difference shown.',
    )
    expect(insteadSay('')).toBe('')
  })

  it('says what the whole list leaves out as items no longer sold, once it is open', () => {
    const parts = chapter('fit').tables.find((t) => t.counts.pool > t.counts.catalogue)!
    const gone = parts.counts.pool - parts.counts.catalogue
    /* shut, the switch's own words say it: "Show all 2,238 in Parts & Accessories" */
    expect(allSay(parts)).toBe('')
    const open = readRail(ctx, sp560, { showAll: new Set([parts.id]) })
      .chapters.find((c) => c.id === 'fit')!
      .tables.find((t) => t.id === parts.id)!
    expect(allSay(open)).toContain(`${gone.toLocaleString('en-AU')} no longer sold are left out`)
    expect(allSay(open)).not.toMatch(/rows?|table|paired|hull/)
  })

  it('counts the finishes on the hull and says nothing twice on a head that already counts', () => {
    expect(choiceSay(chapter('hull'), false)).toBe(
      ` · ${chapter('hull').finishes!.rows.length} finishes`,
    )
    /* "3 more offered · 4 on the shelf" was one count said twice */
    expect(chapter('motor').fact).toMatch(/offered/)
    expect(choiceSay(chapter('motor'), false)).toBe('')
    expect(choiceSay(chapter('motor'), true)).toBe('')
  })

  it('answers a search, says how many are not made for this boat, and says nothing at rest', () => {
    const found = readRail(ctx, sp560, { query: 'F250' })
    expect(found.beyond).toBeGreaterThan(0)
    expect(searchSay(found, true)).toBe(
      `${found.hits} found, ${found.beyond} of them not made for this boat.`,
    )
    expect(searchSay(rail, true)).toBe('')
    expect(searchSay(null, false)).toContain('price list')
  })

  it('says a charge already inside several prices without the word column', () => {
    const found = [
      { line: 'GFAB Tandem Axel Trailer', column: 'Sell inc Rego', level: 'Cash', source: 'A1' },
      { line: 'REDCO Custom', column: 'Sell inc Rego', level: 'Cash', source: 'A2' },
    ]
    expect(chargeSay(found, 'registration')).toBe(
      '2 items already have registration in their Cash price — GFAB Tandem Axel Trailer and REDCO Custom.',
    )
    expect(chargeSay(found.slice(0, 1), 'registration')).toBe(
      'GFAB Tandem Axel Trailer already has registration in its Cash price.',
    )
    /* lines on two levels each say which */
    expect(
      chargeSay(
        [
          {
            line: 'Racor filter',
            column: 'Sell inc Install (if appl.)',
            level: 'Fitted',
            source: 'A3',
          },
          { line: 'Bilge pump', column: 'Sell', level: 'Cash', source: 'A4' },
        ],
        'install',
      ),
    ).toBe(
      '2 items already have fitting labour in their price — Racor filter (Fitted) and Bilge pump (Cash).',
    )
    expect(chargeSay([], 'registration')).toBeNull()
  })

  it('names the price level by its declared name, never the list’s own column (m2-last major 5)', () => {
    /* the SP660 opens with a trailer priced at Sell inc Rego and a motor at
       Sell Price, and its finale said both columns beside "Priced at Cash" */
    const quote = quoteOn('boat_highfield', 'SP660')
    const names = fileLevelNames(Object.values(pack.entities).map((e) => priceLevelsFor(e)))
    const said = (['registration', 'install', 'preDelivery'] as const)
      .map((charge) => chargeSay(chargeAlreadyIn(quote.lines, charge), charge))
      .filter((line): line is string => line !== null)
    expect(said.length, 'nothing on the SP660 already carries a charge').toBeGreaterThan(0)
    for (const line of said) {
      expect(fileLevelNamesIn(line, names), line).toEqual([])
      expect(line).toContain('Cash price')
    }
  })

  it('says the price as a count of the items it prices', () => {
    expect(levelCountSay(3, 4)).toBe('3 of 4 items priced')
    expect(levelCountSay(1, 1)).toBe('1 of 1 item priced')
  })

  it('passes a storage fault straight through, and otherwise says the work is kept', () => {
    expect(savedSay('The quotes could not be written.')).toBe('The quotes could not be written.')
    expect(savedSay(null)).toContain('Saved as you go')
    /* a given quote is kept, and nobody is invited back to change it — nor told how it is kept
       (docs/WORDS.md: "Kept in this browser exactly as it was given" is not needed) */
    expect(savedSay(null, true)).toBe('')
    expect(savedSay('The quotes could not be written.', true)).toBe(
      'The quotes could not be written.',
    )
  })

  it('draws the hull once: no empty list of the hull under its finishes', () => {
    expect(chapter('hull').tables.every((t) => t.rows.length > 0 || t.also.length === 0)).toBe(true)
  })
})

describe('the words a dealer never reads', () => {
  it('finds every word the critic quoted off the build, the cascade and the customers screen', () => {
    for (const quoted of [
      'A quote is written against ONE row of Highfield Inflatables',
      'Choosing another re-roots the document on that row',
      'no price column on this table',
      "699 of this table's 2,937 rows are no longer sold",
      '15 on the shelf',
      'no picture this repository holds a copy of',
      'READ FROM THIS BROWSER · IN 438 MS',
      'A row in a book that is a table on the sheet',
      'not to this row',
      'Customers · 5 columns',
      'Moving the whole quote to another rung',
      'the same frozen lines, at A4',
      'Pair it on the subject’s own page',
      'The committed total does not move until you accept.',
    ]) {
      expect(engineWordsIn(quoted), quoted).not.toEqual([])
    }
  })

  it('leaves a dealer’s own words alone', () => {
    for (const plain of [
      'Choose another and only the hull changes.',
      '4 of 209 paired with this hull',
      'Arrow Marine BROW-12',
      'Open the document',
      'Priced at Cash · 3 of 4 lines',
    ]) {
      expect(engineWordsIn(plain), plain).toEqual([])
    }
  })
})

describe('where the finale says its figures came from', () => {
  it('says the price file’s own where it is, and whose the boat’s is where it is not', () => {
    const priced = quoteOn('boat_stacer', '529 Assault Pro')
    expect(sourcesSay(priced)).toBe('Every price is the price list’s, and includes tax.')

    /* a Haines Signature: the file holds it at nought, so no price until
       one is put on it — and then that one is his, and the sentence says so */
    const nil = quoteOn('boat_haines', '525F')
    expect(sourcesSay(nil)).toMatch(/^Every price is the price list’s/)
    const hull = hullLineOf(nil)!
    const typed: QuoteDef = {
      ...nil,
      lines: nil.lines.map((l) =>
        l.id === hull.id ? { ...l, overridePrice: 54_900, overrideReason: HULL_PRICE_REASON } : l,
      ),
    }
    expect(sourcesSay(typed)).toMatch(/^Every price but the boat’s is the price list’s/)
    expect(sourcesSay(typed)).toContain('01 The hull')
    expect(engineWordsIn(sourcesSay(typed))).toEqual([])
  })
})
