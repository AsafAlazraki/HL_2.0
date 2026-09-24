import { beforeAll, describe, expect, it } from 'vitest'
import { boatOfQuote, saidOnQuote } from '@/domain/quote/spoken'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { rowLabel, type CatalogueCtx, type QuoteDef, type RowData } from '@/domain/model'
import {
  addLine,
  apply,
  buildSteps,
  isDone,
  issue,
  lineAmount,
  mintQuote,
  quoteLevelChoices,
  quoteTotals,
  setCustomer,
  stepOffer,
} from '@/domain/quote'
import { cascadeOfConflict, rowFigure } from '@/domain/quote/cascade'
import { levelConflict } from '@/domain/quote/conflict'
import { readDocument } from '@/domain/quote/document'
import { selectPartners, TRAILER_FITMENT } from '@/domain/fitment/trailerFitment'
import { readRail, type ChapterTable, type OptionRow } from '@/screens/configurator/chapters'
import { NOT_PRICED_ON_PAPER, cellWord, underTheTotal } from '@/screens/document/paper'
import {
  NO_FIX,
  finishFix,
  isRefused,
  levelFix,
  readFix,
  readProposal,
  type Proposal,
  FLOOR_UNCHECKED,
  heldSay,
  movedSay,
} from './proposal'
import {
  fileLevelNames,
  fileLevelNamesIn,
  levelWord,
  lineLevelSaid,
} from '@/domain/quote/levelSaid'
import { priceLevelsFor } from '@/domain/quote'
import { engineWordsIn, unpricedSay } from '@/screens/configurator/say'

/* ============================================================
   THE PROPOSAL, AGAINST THE REAL PACK.

   NOT ONE FIGURE BELOW IS TYPED INTO AN ASSERTION. Every total,
   delta, count and sentence is computed by the engine in the test
   and then looked for in the reading, so a test cannot agree with a
   module that has drifted from the price file — the same discipline
   `chapters.test.ts` and `fleet.test.ts` keep.

   THE ONE THING IT REALLY PROVES. A sheet that promises a total and
   an act that produces a different one is the worst defect this
   screen could have, and it is invisible to every other kind of test:
   `to` is computed by `levelConflict` and `quoteTotals(next)` while
   the act is `setLevel` and `refinish`, two different code paths over
   the same document. Every case below runs the act and asserts the
   total the sheet had promised, then runs the inverse and asserts the
   document is back.
   ============================================================ */

let pack: PackFixture
const NOW = '2026-09-17T02:00:00.000Z'

/** A quote on one row of the file, with something on it: the starred
 *  lines the mint carries plus the first candidate of every chapter,
 *  so a rung move has motors, trailers, parts and rigging to move. */
function aQuote(key: string, find: string): { ctx: CatalogueCtx; quote: QuoteDef } {
  const ctx = pack.ctx
  const table = pack.byKey(key)
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const view = createViewFor(ctx, table.id)
  const minted = mintQuote(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-TEST' })
  expect(minted).not.toBeNull()
  let quote = minted!.quote
  for (const step of buildSteps(quote)) {
    const candidate = stepOffer(ctx, quote, step.section, {}).candidates[0]
    if (!candidate) continue
    const outcome = apply(quote, addLine(step.id, candidate.line), NOW)
    if (isDone(outcome)) quote = outcome.next
  }
  return { ctx, quote }
}

/** The proposal, or the test fails with the sentence that refused it. */
function proposalFor(ctx: CatalogueCtx, quote: QuoteDef, fix: string): Proposal {
  const reading = readProposal(ctx, quote, fix)
  expect(isRefused(reading) ? reading.refused : '').toBe('')
  if (isRefused(reading)) throw new Error(reading.refused)
  return reading.proposal
}

/** Run every act of a proposal, in order, and hand back the document
 *  they produced and the inverses that undo them. */
function take(quote: QuoteDef, proposal: Proposal): { next: QuoteDef; back: QuoteDef } {
  let next = quote
  const inverses: Array<(q: QuoteDef, at: string) => unknown> = []
  for (const act of proposal.acts) {
    const outcome = apply(next, act, NOW)
    expect(isDone(outcome)).toBe(true)
    if (!isDone(outcome)) throw new Error('refused')
    next = outcome.next
    inverses.push(outcome.inverse)
  }
  let back = next
  for (const inverse of inverses.toReversed()) {
    const outcome = apply(back, inverse as never, NOW)
    expect(isDone(outcome)).toBe(true)
    if (!isDone(outcome)) throw new Error('refused')
    back = outcome.next
  }
  return { next, back }
}

beforeAll(async () => {
  pack = await loadPack()
})

describe('the address', () => {
  it('reads the channel off the first colon and never off a later one', () => {
    expect(readFix('level:trade')).toEqual({ kind: 'level', key: 'trade' })
    /* a row id carries its own colon, which is the whole reason this
       splits once rather than on every separator */
    expect(readFix('finish:boat_highfield:483')).toEqual({
      kind: 'finish',
      rowId: 'boat_highfield:483',
    })
  })

  it('is a string somebody typed, so nothing it does not recognise is a decision', () => {
    for (const said of ['', 'level', ':trade', 'level:', 'nonsense:1', 'finish']) {
      expect(readFix(said), said).toBeNull()
    }
  })

  it('is spelled in one place, so the screen that raises and the screen that reads agree', () => {
    expect(readFix(levelFix('trade'))).toEqual({ kind: 'level', key: 'trade' })
    expect(readFix(finishFix('boat_highfield:9'))).toEqual({
      kind: 'finish',
      rowId: 'boat_highfield:9',
    })
  })

  it('says so, in a sentence, when it names no decision at all', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const reading = readProposal(ctx, quote, 'not-a-fix')
    expect(isRefused(reading) && reading.refused).toBe(NO_FIX)
  })
})

describe('the rung', () => {
  it('groups the engine’s own sentences by cause, and every heading is one of them', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const conflict = levelConflict(quote, other.key, other.label)!
    const engine = cascadeOfConflict(conflict, { label: other.label, amount: null })
    /* EVERY HEADING IS THE ENGINE'S DECISION: a moving line's sentence
       verbatim, and a held line's in the dealer's words that `heldSay`
       gives the engine's own — never a reason this file made up. */
    const levelOf = (lineId: string): string =>
      lineLevelSaid(quote.lines.find((l) => l.id === lineId)!)
    /* the table each held line was picked from, named as the paper names
       it — the chapter's title from the same `buildSteps` */
    const tableOf = new Map(
      buildSteps(quote).flatMap((step) => step.lines.map((l) => [l.id, step.title] as const)),
    )
    const said = new Set([
      ...conflict.changed.map((line) =>
        movedSay(
          engine.added.find((r) => r.id === line.lineId)?.because ?? '',
          line,
          levelWord(other.key, line.toColumn),
        ),
      ),
      ...conflict.held.map((line) =>
        heldSay(line, other.label, levelOf(line.lineId), tableOf.get(line.lineId)),
      ),
    ])

    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    expect(proposal.causes.length).toBeGreaterThan(0)
    for (const cause of proposal.causes) {
      expect(said.has(cause.because), cause.because).toBe(true)
      /* and none of them is the workbook talking (M2-close critique #4) */
      expect(engineWordsIn(cause.because), cause.because).toEqual([])
    }
    /* and it really is more cards than a grouping by verb would give */
    expect(proposal.causes.length).toBeGreaterThan(2)
  })

  it('accounts for every line exactly once, between the causes and what stays', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    const rows = proposal.causes.reduce((n, c) => n + c.rows.length, 0)
    expect(rows + proposal.untouched).toBe(quote.lines.length)
  })

  /* EVERY ROW IN THE WORDS THE PAPER PRINTS (built-critique-m2-close-2.md):
     the hull as a person says it, never the file's key string, and a
     kit's "|" said as " · " */
  it('names every row as the customer’s paper names it', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    const labels = proposal.causes.flatMap((c) => c.rows.map((r) => r.label))
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      expect(label).not.toBe(quote.subjectLabel)
      expect(label).not.toContain('|')
    }
    const hull = quote.lines.find((l) => l.label === quote.subjectLabel)!
    const hullRow = proposal.causes.flatMap((c) => c.rows).find((r) => r.id === hull.id)
    if (hullRow) expect(hullRow.label).toBe(boatOfQuote(quote).say)
  })

  it('has every cause’s arithmetic add up to the one figure in the footer', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    let moved = 0
    for (const cause of proposal.causes) moved += cause.moves ?? 0
    expect(moved).toBe(proposal.cascade.delta)
    expect(proposal.cascade.from).toBe(quoteTotals(quote).total)
    expect(proposal.cascade.to - proposal.cascade.from).toBe(proposal.cascade.delta)
  })

  it('promises a total the act then produces, and an inverse that puts it back', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    expect(proposal.acts.length).toBe(1)

    const { next, back } = take(quote, proposal)
    expect(quoteTotals(next).total).toBe(proposal.cascade.to)
    expect(next.levelKey).toBe(other.key)
    expect(quoteTotals(back).total).toBe(quoteTotals(quote).total)
    expect(back.levelKey).toBe(quote.levelKey)
  })

  it('carries both figures and both column names on a row that moves', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    const moving = proposal.causes.find((c) => c.fate === 'moves')!
    expect(moving.rows.length).toBeGreaterThan(0)
    for (const row of moving.rows) {
      expect(row.from).not.toBeNull()
      expect(row.to).not.toBeNull()
      expect(row.fromColumn).not.toBe('')
      expect(row.toColumn).not.toBe('')
      expect(row.delta).toBe((row.to ?? 0) - (row.from ?? 0))
    }
  })

  it('refuses a rung the quote is already on, and one no line carries', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const here = readProposal(ctx, quote, levelFix(quote.levelKey))
    expect(isRefused(here) && here.refused).toContain('already priced at')

    const nowhere = readProposal(ctx, quote, levelFix('no-such-rung'))
    expect(isRefused(nowhere) && nowhere.refused).toContain('no-such-rung')
    /* and it names the ones the document really does carry */
    for (const rung of quoteLevelChoices(quote.lines)) {
      expect(isRefused(nowhere) && nowhere.refused).toContain(rung.label)
    }
  })

  it('is refused by an issued quote with the engine’s own sentence, before anything is written', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const named = apply(quote, setCustomer({ name: 'R. Kelleher' }), NOW)
    expect(isDone(named)).toBe(true)
    if (!isDone(named)) return
    const given = apply(named.next, issue(), NOW)
    expect(isDone(given)).toBe(true)
    if (!isDone(given)) return

    /* THE READING STILL WORKS — an issued document can be looked at,
       and saying "there is nothing to see here" would be a different
       lie. It is the ACT that is refused, by the one line in the
       engine that makes it true. */
    const other = quoteLevelChoices(given.next.lines).find((r) => r.key !== given.next.levelKey)!
    const proposal = proposalFor(ctx, given.next, levelFix(other.key))
    const outcome = apply(given.next, proposal.acts[0], NOW)
    expect(isDone(outcome)).toBe(false)
    expect(quoteTotals(given.next).total).toBe(quoteTotals(named.next).total)
  })
})

describe('the hull', () => {
  it('prices the re-rooting as the document it would produce, and the act produces it', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const table = pack.byKey('boat_highfield')
    const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
    /* another finish of THIS model, found by asking the engine what
       re-rooting onto it would total rather than by naming one */
    const other = rows.find((r) => {
      if (r.id === quote.rootRowId) return false
      const reading = readProposal(ctx, quote, finishFix(r.id))
      return !isRefused(reading) && reading.proposal.cascade.delta !== 0
    })
    expect(other, 'no other row of this register re-prices the hull').toBeDefined()

    const proposal = proposalFor(ctx, quote, finishFix(other!.id))
    expect(proposal.kind).toBe('finish')
    expect(proposal.cascade.from).toBe(quoteTotals(quote).total)

    const { next, back } = take(quote, proposal)
    expect(quoteTotals(next).total).toBe(proposal.cascade.to)
    expect(next.rootRowId).toBe(other!.id)
    expect(quoteTotals(back).total).toBe(quoteTotals(quote).total)
    expect(back.rootRowId).toBe(quote.rootRowId)
  })

  it('asks fitment what the new hull makes of the trailers already on the quote', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const table = pack.byKey('boat_highfield')
    const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
    const other = rows.find((r) => r.id !== quote.rootRowId)!
    const fit = selectPartners(ctx, TRAILER_FITMENT, table.id, other.id)
    expect(fit, 'the trailer fitment reading does not run on this hull').not.toBeNull()

    const proposal = proposalFor(ctx, quote, finishFix(other.id))
    /* THE SENTENCE IS THE READING'S OWN. On this file the floor
       cannot run at all — no column on any boat register is headed
       with a weight — and that is a fact about the price file, said
       once, on the subject it is about. */
    const unchecked = proposal.causes.filter((c) => c.fate === 'unchecked')
    for (const cause of unchecked) {
      expect(cause.because).not.toBe('')
      expect(
        [
          fit!.floorNotEvaluable === null ? null : FLOOR_UNCHECKED,
          ...fit!.floorWarnings.map(() => cause.because),
        ].some((said) => said === cause.because),
      ).toBe(true)
    }
    /* THE LOAD THAT CANNOT BE CHECKED IS SAID ONCE, WITH NO LINE UNDER
       IT — the engine's placeholder line read "Towing weight — —" */
    if (fit!.floorNotEvaluable !== null) {
      const floor = unchecked.find((c) => c.because === FLOOR_UNCHECKED)
      expect(floor, 'the load check that cannot run is not said').toBeDefined()
      expect(floor!.rows).toEqual([])
    }
  })

  it('offers the trailers this hull is paired with, priced, cheapest first', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const table = pack.byKey('boat_highfield')
    const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
    const other = rows.find((r) => r.id !== quote.rootRowId)!
    const proposal = proposalFor(ctx, quote, finishFix(other.id))
    expect(proposal.alternatives.length).toBeGreaterThan(0)

    const priced = proposal.alternatives.filter((a) => a.amount !== null).map((a) => a.amount!)
    expect(priced).toEqual(priced.toSorted((a, b) => a - b))
    /* AND THEY ARE THE PRICE FILE'S OWN FIGURES, read off the frozen
       candidates rather than off a live cell — the same number the
       trailer chapter would freeze if one were picked. */
    for (const alternative of proposal.alternatives) {
      if (alternative.amount === null) continue
      const [tableId, ...rest] = alternative.id.split(':')
      const rowId = rest.join(':')
      let found: number | null = null
      for (const step of buildSteps(quote)) {
        for (const candidate of stepOffer(ctx, quote, step.section, { all: true }).candidates) {
          if (candidate.line.entityId === tableId && candidate.line.rowId === rowId) {
            found = lineAmount(candidate.line).amount
          }
        }
      }
      expect(found).toBe(alternative.amount)
    }
  })

  it('refuses the row the quote is already written against', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const reading = readProposal(ctx, quote, finishFix(quote.rootRowId))
    expect(isRefused(reading) && reading.refused).toContain(boatOfQuote(quote).say)
  })

  it('refuses a row this price file does not carry', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const reading = readProposal(ctx, quote, finishFix('boat_highfield:not-a-row'))
    expect(isRefused(reading) && reading.refused).toContain('That finish is not on the price file')
  })

  it('takes a partner off when the reading says it is built for another marque, and puts it back', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const table = pack.byKey('boat_highfield')
    const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
    const other = rows.find((r) => r.id !== quote.rootRowId)!
    const fit = selectPartners(ctx, TRAILER_FITMENT, table.id, other.id)!
    const wrong = new Set(
      fit.rejected
        .filter((v) => v.series === 'built-for-another')
        .map((v) => `${v.partnerTableId}:${v.rowId}`),
    )

    /* A TRAILER BUILT FOR ANOTHER MARQUE, PUT ON THIS QUOTE THE WAY A
       PERSON CAN REALLY PUT ONE ON: through the configurator's "show
       the whole table" switch, which reaches every live row whether or
       not the price file paired it with this hull. */
    let carrying = quote
    let put = ''
    for (const step of buildSteps(quote)) {
      if (put !== '') break
      for (const candidate of stepOffer(ctx, quote, step.section, { all: true }).candidates) {
        if (!wrong.has(`${candidate.line.entityId}:${candidate.line.rowId}`)) continue
        const outcome = apply(carrying, addLine(step.id, candidate.line), NOW)
        if (!isDone(outcome)) continue
        carrying = outcome.next
        put = candidate.line.label
        break
      }
    }
    expect(put, 'no live trailer on this file is built for another marque').not.toBe('')

    const proposal = proposalFor(ctx, carrying, finishFix(other.id))
    const off = proposal.causes.filter((c) => c.fate === 'off')
    expect(off.length).toBeGreaterThan(0)
    /* the row is named as the paper names it, never by the file's key
       (m2-last-critique.md, major 4) */
    const said = saidOnQuote(
      carrying,
      carrying.lines.find((l) => l.label === put)!,
    )
    expect(
      said.replace(/(^|\s)(\d[\d,.]*(?: (?:mm|m|kgs|kg))?) - (?=\d)/g, '$1$2 ~ '),
    ).not.toContain(' - ')
    expect(off.some((c) => c.rows.some((r) => r.label === said))).toBe(true)
    /* THE REASON IS THE READING'S, WITH BOTH MARQUES IN IT — the
       sentence Porsche's architecture cannot reconstruct. */
    for (const cause of off) expect(cause.because).toContain('Not offered —')

    /* AND ACCEPTING REALLY TAKES IT OFF: one act for the re-rooting
       and one for each row the sheet said would go. */
    expect(proposal.acts.length).toBe(1 + off.reduce((n, c) => n + c.rows.length, 0))
    const { next, back } = take(carrying, proposal)
    expect(next.lines.some((l) => l.label === put)).toBe(false)
    expect(quoteTotals(next).total).toBe(proposal.cascade.to)
    expect(back.lines.some((l) => l.label === put)).toBe(true)
    expect(quoteTotals(back).total).toBe(quoteTotals(carrying).total)
  })
})

describe('a register that files one row per model', () => {
  it('has nothing to re-root onto, and says so rather than drawing a sheet', () => {
    const { ctx, quote } = aQuote('boat_stacer', '529 Assault Pro')
    const reading = readProposal(ctx, quote, finishFix(quote.rootRowId))
    expect(isRefused(reading)).toBe(true)
  })

  it('still moves its rung, which is the channel that fires on every document', () => {
    const { ctx, quote } = aQuote('boat_stacer', '529 Assault Pro')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    const { next } = take(quote, proposal)
    expect(quoteTotals(next).total).toBe(proposal.cascade.to)
  })
})

const heldLine = (why: string, toColumn: string) => ({
  lineId: 'l',
  label: 'Tube Covers',
  fromColumn: toColumn,
  from: null,
  toColumn,
  to: null,
  why,
})

describe('a held line is said in the dealer’s words (M2-close critique #4)', () => {
  it('says the engine’s three workbook sentences as a dealer would, exactly and only those', () => {
    /* the paper's own reason, with the table named as the paper names it:
       Rigging Kits carries sell columns, and what it lacks is a DECLARED
       level — "no price at any level" was false until 2026-09-25 */
    expect(
      heldSay(heldLine('no price column on this table', ''), 'Trade', '', 'Rigging Kits'),
    ).toBe('no price level is declared for Rigging Kits, so it is not in the total')
    expect(heldSay(heldLine('no price column on this table', ''), 'Trade', '')).toBe(
      'no price level is declared for it, so it is not in the total',
    )
    /* the level it keeps by its declared name: the trailer's Sell inc Rego
       IS its Cash price (m2-last-critique.md, major 5) */
    expect(
      heldSay(
        heldLine('no Trade column — stays at Sell inc Rego', 'Sell inc Rego'),
        'Trade',
        'Cash',
      ),
    ).toBe('no Trade price on the price file — it stays at its Cash price')
    expect(
      heldSay(
        heldLine('priced by hand at Sell inc Install (if appl.)', 'Sell inc Install (if appl.)'),
        'Trade',
        'Fitted',
      ),
    ).toBe('priced by hand at Fitted')
    /* anything else is the engine's own, untouched */
    expect(heldSay(heldLine('the price was agreed', 'Cash'), 'Trade', 'Cash')).toBe(
      'the price was agreed',
    )
  })

  it('says a moving line’s level by its declared name, exactly and only the engine’s sentence', () => {
    const line = { ...heldLine('', 'Sell Price'), toColumn: 'Trade Price' }
    expect(movedSay('now priced at Trade Price', line, 'Trade')).toBe('now priced at Trade')
    expect(movedSay('built for another marque', line, 'Trade')).toBe('built for another marque')
    expect(movedSay('now priced at Trade Price', line, '')).toBe('now priced at Trade Price')
  })

  it('reads the engine’s real sentences on the SP560, so a change of wording there fails here', () => {
    const { quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const conflict = levelConflict(quote, other.key, other.label)!
    expect(conflict.held.length).toBeGreaterThan(0)
    for (const held of conflict.held) {
      const stays = lineLevelSaid(quote.lines.find((l) => l.id === held.lineId)!)
      expect(heldSay(held, other.label, stays)).not.toBe(held.why)
    }
  })
})

/** The paper's word for one line of one printed document, '' where it prints a figure. */
const wordOf = (doc: ReturnType<typeof readDocument>, id: string): string => {
  const line = [
    ...doc.sections.flatMap((s) => s.tables.flatMap((t) => t.lines)),
    ...doc.typed,
  ].find((l) => l.id === id)
  return line ? cellWord(line) : ''
}

/* THE CRITIC'S THIRD BLOCKER OF THE M2 CLOSE, pinned. On the ADV7 the
   DEC rigging kit read `Standard` on this sheet, "Not priced yet" on the
   build and "Not priced on this quote" on the customer's paper: three
   answers to one question, and the first was a claim the price file
   never makes. The paper's derivation now decides for all of them. */
describe('a line the price file does not price reads the same on the cascade, the build and the paper', () => {
  it('is not priced on all three, in the paper’s own word where a word is printed, and never Standard', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const doc = readDocument(quote)
    const printed = [...doc.sections.flatMap((s) => s.tables.flatMap((t) => t.lines)), ...doc.typed]
    const unpriced = printed.filter((line) => line.state === 'unpriced')
    expect(unpriced.length, 'this quote carries no line the file does not price').toBeGreaterThan(0)

    /* the cascade, raised the way the build raises it */
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    const onSheet = new Map(proposal.causes.flatMap((c) => c.rows).map((row) => [row.id, row]))

    /* the build, read by the configurator's own reading of the rail */
    const rail = readRail(ctx, quote)
    const onBuild = new Map<string, { row: OptionRow; table: ChapterTable }>()
    for (const chapter of rail.chapters) {
      for (const table of chapter.tables) {
        for (const row of [...table.rows, ...table.also]) {
          if (row.act.do === 'remove') onBuild.set(row.act.lineId, { row, table })
        }
      }
    }

    for (const line of unpriced) {
      /* THE PAPER prints its word where the figure would be */
      const word = cellWord(line)
      expect(word).toBe(NOT_PRICED_ON_PAPER)

      /* THE CASCADE prints that same word, in the same place */
      const row = onSheet.get(line.id)
      expect(row, `${line.label} is not on the sheet`).toBeDefined()
      expect(row!.to).toBeNull()
      expect(row!.toWord).toBe(word)
      expect(rowFigure(row!.to, row!.toWord)).toBe(word)
      expect(row!.delta).toBeNull()

      /* THE BUILD gives it no figure, and says why once over its list
         where the list has no price at all */
      const built = onBuild.get(line.id)
      expect(built, `${line.label} is not on the build`).toBeDefined()
      expect(built!.row.amount).toBeNull()
      expect(built!.row.delta).toBeNull()
      if (line.rung === null) expect(unpricedSay(built!.table)).toContain('unpriced')
    }

    /* AND ALL THREE COUNT THE SAME LINES out of the total */
    expect(rail.unpriced).toBe(doc.unpriced)
    expect(doc.unpriced).toBe(unpriced.length)
    expect(underTheTotal(doc)).not.toBe('')

    /* the word the file never says is on none of them */
    for (const row of onSheet.values()) {
      expect(rowFigure(row.from, row.fromWord)).not.toMatch(/standard/i)
      expect(rowFigure(row.to, row.toWord)).not.toMatch(/standard/i)
    }
    for (const cause of proposal.causes) expect(cause.because).not.toMatch(/standard|of its own/i)
  })

  it('reads a figure the new level prices at nothing as the paper would print it after accepting', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    const { next } = take(quote, proposal)
    /* EVERY WORD ON THE SHEET'S "AFTER" SIDE IS THE WORD THE PAPER
       PRINTS ONCE THE ACT HAS RUN — read off the document the act
       really wrote, not off the preview — and every word on its
       "before" side is the paper's word for the quote as it stands. */
    const paperAfter = readDocument(next)
    const paperBefore = readDocument(quote)
    for (const row of proposal.causes.flatMap((c) => c.rows)) {
      expect(row.toWord, row.label).toBe(wordOf(paperAfter, row.id))
      expect(row.fromWord, row.label).toBe(wordOf(paperBefore, row.id))
    }
  })
})

/* ============================================================
   ONE LEVEL, ONE NAME (m2-last-critique.md, major 5). The cascade
   printed "Sell Price → Trade Price" under a motor, "now priced at
   Trade Price" beside "now priced at Trade" as two headings, and "it
   stays at Sell inc Rego" — the price file's own column names beside
   the declared Cash and Trade, so one quote showed four level names.
   ============================================================ */
describe('the cascade names every price level as the dealership declared it', () => {
  it('on a Highfield with a motor and a trailer, moved to the other level', () => {
    const { ctx, quote } = aQuote('boat_highfield', 'SP560')
    const other = quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!
    const proposal = proposalFor(ctx, quote, levelFix(other.key))
    const names = fileLevelNames(pack.entities.map((e) => priceLevelsFor(e)))
    /* the file really does name this quote's lines another way */
    const columns = quote.lines.map((l) => l.priceColumnName ?? '')
    expect(columns.some((c) => fileLevelNamesIn(c, names).length > 0)).toBe(true)

    for (const cause of proposal.causes) {
      expect(fileLevelNamesIn(cause.because, names), cause.because).toEqual([])
      for (const row of cause.rows) {
        expect(fileLevelNamesIn(`${row.fromColumn} ${row.toColumn}`, names)).toEqual([])
      }
    }
    /* every line that moves moves to the one level asked for, so it is one heading */
    const moving = proposal.causes.filter((c) => c.fate === 'moves')
    expect(moving.map((c) => c.because)).toEqual([`now priced at ${other.label}`])
    for (const row of moving[0].rows) expect(row.toColumn).toBe(other.label)
  })
})
