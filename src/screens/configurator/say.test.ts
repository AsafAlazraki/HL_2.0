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
import { mintQuoteFromView } from '@/domain/quote'
import { readRail } from './chapters'
import {
  allSay,
  chargeSay,
  choiceSay,
  countsSay,
  engineWordsIn,
  levelCountSay,
  linesSay,
  pictureSays,
  reasonSay,
  savedSay,
  searchSay,
  unpricedSay,
} from './say'
import { hullHero, stageArt } from './stage'

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

const motorsOn = (quote: QuoteDef): string[] =>
  quote.lines.filter((l) => ctx.entities[l.entityId]?.kind === 'motor').map((l) => l.label)

describe('the line under the running total', () => {
  it('agrees its verb with the count — one carries, two carry', () => {
    /* the fault as the critic read it: "3 lines … · 1 of them carry" */
    expect(linesSay(3, 1)).toBe(
      '3 lines, each at the price it was picked at · 1 of them carries no price at all',
    )
    expect(linesSay(3, 2)).toBe(
      '3 lines, each at the price it was picked at · 2 of them carry no price at all',
    )
  })

  it('says nothing about price where every line carries one, and one line is a line', () => {
    expect(linesSay(3, 0)).toBe('3 lines, each at the price it was picked at')
    expect(linesSay(1, 0)).toBe('1 line, at the price it was picked at')
    expect(linesSay(1, 1)).toBe(
      '1 line, at the price it was picked at · it carries no price at all',
    )
  })

  it('writes a large count the way the rest of the screen does', () => {
    expect(linesSay(1200, 1100)).toContain('1,100 of them carry')
  })
})

describe('the caption under the stage photograph', () => {
  const sp560 = quoteOn('boat_highfield', 'SP560')
  const register = ctx.entities[sp560.rootTableId]?.name ?? ''
  const hero = hullHero(ctx, sp560)

  it('says what the photograph shows, in the ledger’s own words, and whose rig it is', () => {
    expect(hero, 'the hero ledger holds no photograph of this hull').not.toBeNull()
    const art = stageArt(sp560.subjectImage?.src, register, hero)
    const said = pictureSays(art, sp560, readRail(ctx, sp560), ctx)
    expect(said).not.toBeNull()
    expect(said!.shows.startsWith(hero!.subject)).toBe(true)
    expect(said!.shows).toContain('the maker’s own finish and rig')
  })

  it('names this quote’s motor, and the chapter it is chosen in, off the document itself', () => {
    const rail = readRail(ctx, sp560)
    const said = pictureSays(stageArt(sp560.subjectImage?.src, register, hero), sp560, rail, ctx)
    const motors = motorsOn(sp560)
    expect(motors.length).toBeGreaterThan(0)
    for (const motor of motors) expect(said!.ours).toContain(motor)
    const chapter = rail.chapters.find((c) => c.tables.some((t) => t.kind === 'motor'))!
    expect(said!.ours).toContain(`${chapter.num} ${chapter.name}`)
  })

  it('names the finish this quote is rooted on, where the model comes in more than one', () => {
    const rail = readRail(ctx, sp560)
    const finish = rail.chapters
      .find((c) => c.finishes !== undefined)!
      .finishes!.rows.find((f) => f.current)!
    const said = pictureSays(stageArt(sp560.subjectImage?.src, register, hero), sp560, rail, ctx)
    expect(said!.ours).toContain(finish.colour.code)
    expect(said!.ours.startsWith('This quote: ')).toBe(true)
  })

  it('says there is no motor yet, rather than going quiet, when the motor comes off', () => {
    const bare: QuoteDef = {
      ...sp560,
      lines: sp560.lines.filter((l) => ctx.entities[l.entityId]?.kind !== 'motor'),
    }
    const said = pictureSays(
      stageArt(bare.subjectImage?.src, register, hero),
      bare,
      readRail(ctx, bare),
      ctx,
    )
    expect(said!.ours).toContain('no motor yet')
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

  it('counts a list the price file wrote down as paired with this hull', () => {
    const motors = chapter('motor').tables[0]
    expect(motors.paired).toBe(true)
    const drawn = motors.counts.admitted - motors.counts.heldCount
    expect(countsSay(motors, '')).toBe(
      `${drawn} of ${motors.counts.catalogue.toLocaleString('en-AU')} paired with this hull`,
    )
    /* the list's workbook name and its file-wide rate were the reason
       line; "paired with this hull" is all of it a salesperson needs */
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
      expect(unpricedSay(t)).toContain(`The price file gives ${t.title} no prices`)
    }
    for (const t of priced) expect(unpricedSay(t)).toBe('')
  })

  it('says what the switch leaves out as items no longer sold, counted by the engine', () => {
    const parts = chapter('fit').tables.find((t) => t.counts.pool > t.counts.catalogue)!
    const gone = parts.counts.pool - parts.counts.catalogue
    expect(allSay(parts)).toContain(`${gone.toLocaleString('en-AU')} are no longer sold`)
    expect(allSay(parts)).not.toMatch(/rows?|table/)
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

  it('answers a search in options, and says how many are not paired with this hull', () => {
    const found = readRail(ctx, sp560, { query: 'F250' })
    expect(found.beyond).toBeGreaterThan(0)
    expect(searchSay(found, true)).toBe(
      `${found.hits} ${found.hits === 1 ? 'option matches' : 'options match'}, each under its chapter — ${found.beyond} of them not paired with this hull.`,
    )
    expect(searchSay(null, false)).toContain('Master Price File')
  })

  it('says a charge already inside several prices without the word column', () => {
    const found = [
      { line: 'GFAB Tandem Axel Trailer', column: 'Sell inc Rego', source: 'A1' },
      { line: 'REDCO Custom', column: 'Sell inc Rego', source: 'A2' },
    ]
    expect(chargeSay(found, 'registration')).toBe(
      '2 lines already have registration in their price — GFAB Tandem Axel Trailer (Sell inc Rego) and REDCO Custom (Sell inc Rego).',
    )
    /* the one-line case is the engine's own, word for word */
    expect(chargeSay(found.slice(0, 1), 'registration')).toBe(
      'GFAB Tandem Axel Trailer is priced at Sell inc Rego, and that number already has registration in it.',
    )
    expect(chargeSay([], 'registration')).toBeNull()
  })

  it('says the price level as a count of lines', () => {
    expect(levelCountSay(3, 4)).toBe('3 of 4 lines')
    expect(levelCountSay(1, 1)).toBe('1 of 1 line')
  })

  it('passes a storage fault straight through, and otherwise says the work is kept', () => {
    expect(savedSay('The quotes could not be written.')).toBe('The quotes could not be written.')
    expect(savedSay(null)).toContain('Saved as you go')
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
