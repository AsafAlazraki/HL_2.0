/* ============================================================
   THE CASCADE — what the sheet is allowed to say.

   The point of these is not that the arithmetic adds up. It is that
   EVERY SENTENCE A PERSON READS CARRIES THE FACTS IT CLAIMS. The
   teardown's finding was that Porsche prints one sentence on every
   removed row — "not compatible with your selection" — which names
   neither side of the conflict, and that PCPartPicker does the same
   on socket conflicts while doing it properly on dimensional ones.
   Ours cannot regress to that, because a `because` that has lost its
   numbers is a test failure here.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import type { FitmentResult, PartnerVerdict } from '@/domain/fitment/trailerFitment'
import type { QuoteDef, QuoteLine } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { loadPack } from '@/test/fixtures/pack'
import {
  cascadeOfConflict,
  fitmentCascade,
  groupDelta,
  linesAsRead,
  removedValue,
  rowFigure,
  totalAfterRemoval,
} from './cascade'
import type { Conflict } from './conflict'
import { INCLUDED, NOT_PRICED_HERE, readDocument } from './document'
import { mintQuoteFromView } from './freeze'
import { lineAmount } from './totals'

/* ---------------------------------------------------------- */
/* Fixtures — shaped like the real reading, not like the test  */
/* ---------------------------------------------------------- */

const verdict = (over: Partial<PartnerVerdict> = {}): PartnerVerdict => ({
  partnerTableId: 'trl_stacer',
  partnerTableName: 'Stacer Trailers',
  rowId: 'r1',
  label: 'Stacer SRT 1800',
  banner: 'SRT Series',
  series: 'built-for-another',
  bannerMarque: 'Stacer',
  namesModel: false,
  floor: { kind: 'clears', capacity: 2000, load: 1300 },
  ...over,
})

const fitment = (over: Partial<FitmentResult> = {}): FitmentResult => ({
  subjectTableId: 'boat_highfield',
  subjectRowId: 'adv7',
  subjectLabel: 'Highfield ADV 700',
  marque: { name: 'Highfield' } as FitmentResult['marque'],
  catalogue: 434,
  selected: [],
  unnamed: [],
  rejected: [],
  heldBack: { retiredRows: 0, retiredTables: [], discontinued: 0 },
  regime: {} as FitmentResult['regime'],
  floorWarnings: [],
  floorNotEvaluable: null,
  ...over,
})

const line = (over: Partial<Parameters<typeof fitmentCascade>[2][number]> = {}) => ({
  lineId: 'l1',
  partnerTableId: 'trl_stacer',
  rowId: 'r1',
  label: 'Stacer SRT 1800',
  amount: 6_480,
  ...over,
})

const noPrice = () => null

/* ---------------------------------------------------------- */

describe('a removed row names both sides of the conflict', () => {
  it('names the banner, the marque it is built for, and the marque it is not', () => {
    const out = fitmentCascade(
      fitment({ rejected: [verdict()] }),
      { label: 'Highfield ADV 700', amount: 105_930 },
      [line()],
      120_000,
      noPrice,
    )

    expect(out).not.toBeNull()
    expect(out!.removed).toHaveLength(1)
    /* All three facts, in one sentence. Porsche's equivalent row
       carries none of them. */
    expect(out!.removed[0].because).toBe(
      'Not offered — SRT Series is built for Stacer. This is a Highfield.',
    )
  })

  it('still names both sides when the banner names no marque of its own', () => {
    const out = fitmentCascade(
      fitment({ rejected: [verdict({ bannerMarque: null })] }),
      { label: 'Highfield ADV 700', amount: 105_930 },
      [line()],
      120_000,
      noPrice,
    )
    expect(out!.removed[0].because).toContain('built for another marque')
    expect(out!.removed[0].because).toContain('This is a Highfield')
  })
})

describe('the floor sentence carries both numbers', () => {
  it('states the capacity and the load, never one of them', () => {
    const under = verdict({
      partnerTableId: 'trl_nsm',
      rowId: 'r9',
      label: 'NSM Tandem 1600',
      series: 'built-for-this',
      floor: { kind: 'under', capacity: 1_600, load: 1_950 },
    })
    const out = fitmentCascade(
      fitment({ selected: [under], floorWarnings: [under] }),
      { label: 'Highfield ADV 700', amount: 105_930 },
      [line({ partnerTableId: 'trl_nsm', rowId: 'r9', label: 'NSM Tandem 1600' })],
      120_000,
      noPrice,
    )

    expect(out!.unchecked).toHaveLength(1)
    expect(out!.unchecked[0].because).toBe('Rated to 1,600 kg — Highfield ADV 700 tows 1,950 kg.')
  })

  it('a floor warning is never promoted into a removal', () => {
    /* `FitmentResult` is explicit that nothing in `floorWarnings` has
       been taken out of `selected`. This module does not get to
       overrule the reading it was handed. */
    const under = verdict({
      series: 'built-for-this',
      floor: { kind: 'under', capacity: 1_600, load: 1_950 },
    })
    const out = fitmentCascade(
      fitment({ selected: [under], floorWarnings: [under] }),
      { label: 'Highfield ADV 700', amount: 105_930 },
      [line()],
      120_000,
      noPrice,
    )
    expect(out!.removed).toHaveLength(0)
    expect(out!.unchecked).toHaveLength(1)
  })
})

describe('what it refuses to say', () => {
  it('says nothing at all when nothing is affected', () => {
    /* A sheet that opens to announce "nothing happens" is a full stop
       in the middle of somebody's work. */
    expect(fitmentCascade(fitment(), { label: 'x', amount: 1 }, [line()], 100, noPrice)).toBeNull()
  })

  it('never files a verdict on a line the reading never saw', () => {
    /* The partner table may simply be outside this rule's reach.
       Calling that "removed" would be inventing a verdict. */
    const out = fitmentCascade(
      fitment({ rejected: [verdict()] }),
      { label: 'x', amount: 1 },
      [line({ partnerTableId: 'trl_somewhere_else', rowId: 'zz' })],
      100,
      noPrice,
    )
    expect(out).toBeNull()
  })

  it('names the subject it could not check, rather than a page-wide disclaimer', () => {
    const out = fitmentCascade(
      fitment({
        rejected: [verdict()],
        floorNotEvaluable: 'Jeanneau has no weight-headed column, so the floor cannot run.',
      }),
      { label: 'x', amount: 1 },
      [line()],
      100,
      noPrice,
    )
    expect(out!.unchecked.at(-1)!.because).toContain('the floor cannot run')
  })
})

describe('the alternatives, and what the total does', () => {
  it('offers admitted partners cheapest first, so the sheet can pre-select one', () => {
    const cheap = verdict({ rowId: 'a', label: 'NSM 1400', series: 'built-for-this' })
    const dear = verdict({ rowId: 'b', label: 'NSM 2000', series: 'built-for-this' })
    const prices: Record<string, number> = { a: 5_200, b: 8_900 }

    const out = fitmentCascade(
      fitment({ rejected: [verdict()], selected: [dear, cheap] }),
      { label: 'Highfield ADV 700', amount: 105_930 },
      [line()],
      120_000,
      (_t, rowId) => prices[rowId] ?? null,
    )

    expect(out!.alternatives.map((a) => a.label)).toEqual(['NSM 1400', 'NSM 2000'])
    expect(out!.alternatives[0].amount).toBe(5_200)
  })

  it('an alternative that is under the floor is not offered as a fix', () => {
    const bad = verdict({
      rowId: 'a',
      label: 'NSM 1400',
      series: 'built-for-this',
      floor: { kind: 'under', capacity: 1_400, load: 1_950 },
    })
    const out = fitmentCascade(
      fitment({ rejected: [verdict()], selected: [bad], floorWarnings: [bad] }),
      { label: 'x', amount: 1 },
      [line()],
      120_000,
      () => 5_200,
    )
    expect(out!.alternatives).toHaveLength(0)
  })

  it('prices the decision: what comes off, and what goes on in its place', () => {
    const swap = verdict({ rowId: 'a', label: 'NSM 1400', series: 'built-for-this' })
    const out = fitmentCascade(
      fitment({ rejected: [verdict()], selected: [swap] }),
      { label: 'Highfield ADV 700', amount: 105_930 },
      [line({ amount: 6_480 })],
      120_000,
      () => 5_200,
    )
    /* 120,000 committed − 6,480 off + 5,200 on = 118,720 */
    expect(out!.to).toBe(118_720)
    expect(out!.delta).toBe(-1_280)
    expect(out!.from).toBe(120_000)
  })
})

describe('the arithmetic of a removal, which no screen performs for itself', () => {
  const row = (amount: number | null) => ({
    id: String(amount),
    label: 'x',
    amount,
    because: '',
  })

  it('is what the rows coming off are worth on the document today', () => {
    expect(removedValue([row(6_480), row(1_200)])).toBe(7_680)
  })

  it('takes nothing off for a row the price file carries no figure for', () => {
    /* null is not a zero and is not a loss: a line that never added to
       the total cannot subtract from it. */
    expect(removedValue([row(6_480), row(null)])).toBe(6_480)
    expect(totalAfterRemoval(120_000, [row(null)])).toBe(120_000)
  })

  it('subtracts them from a summation that still has them standing in it', () => {
    expect(totalAfterRemoval(120_000, [row(6_480)])).toBe(113_520)
  })

  it('takes nothing off an empty removal', () => {
    expect(removedValue([])).toBe(0)
    expect(totalAfterRemoval(66_584, [])).toBe(66_584)
  })

  it('is the same subtraction the fitment channel makes before it adds a swap', () => {
    const swap = verdict({ rowId: 'a', label: 'NSM 1400', series: 'built-for-this' })
    const out = fitmentCascade(
      fitment({ rejected: [verdict()], selected: [swap] }),
      { label: 'Highfield ADV 700', amount: 105_930 },
      [line({ amount: 6_480 })],
      120_000,
      () => 5_200,
    )
    expect(out!.to).toBe(totalAfterRemoval(120_000, out!.removed) + 5_200)
  })
})

describe('a figure, the document’s word, and no figure are three different things', () => {
  it('prints the document’s word where it has one, a figure where it has one, and a dash where neither', () => {
    expect(rowFigure(2_120, '')).toBe('$2,120')
    expect(rowFigure(0, INCLUDED)).toBe(INCLUDED)
    expect(rowFigure(null, NOT_PRICED_HERE)).toBe(NOT_PRICED_HERE)
    expect(rowFigure(null, '')).toBe('—')
  })

  it('never says Standard, which no column on the price file says', () => {
    /* THE INFERENCE THAT WAS DELETED (2026-09-24): a held line with no
       price column read `Standard`, on a line the customer's paper
       printed as not priced. Every input rowFigure can be handed, and
       not one comes back as a word the file never wrote. */
    for (const amount of [null, 0, 2_120]) {
      for (const word of ['', INCLUDED, NOT_PRICED_HERE]) {
        expect(rowFigure(amount, word)).not.toMatch(/standard/i)
      }
    }
  })

  it('a group of rows with no figures at all reads as no figure, not as zero', () => {
    expect(groupDelta([{ id: '1', label: 'x', amount: null, because: '' }])).toBe('—')
  })

  it('signs a group chip that moves the total', () => {
    expect(
      groupDelta([
        { id: '1', label: 'x', amount: 2_120, because: '' },
        { id: '2', label: 'y', amount: 0, because: '' },
      ]),
    ).toBe('+$2,120')
  })
})

describe('the level channel arrives in the same shape', () => {
  const conflict: Conflict = {
    id: 'level:trade',
    title: 'Pricing at Trade changes one line.',
    changed: [
      {
        lineId: 'l1',
        label: 'Highfield ADV 700',
        fromColumn: 'Cash',
        from: 105_930,
        toColumn: 'Trade',
        to: 99_400,
        why: '',
      },
    ],
    held: [
      {
        lineId: 'l2',
        label: 'NSM Tandem',
        fromColumn: '',
        from: null,
        toColumn: '',
        to: null,
        why: 'no price column on this table',
      },
    ],
    from: 120_000,
    to: 113_470,
    delta: -6_530,
    accept: 'Price it at Trade',
  }

  it('maps a moved line onto a row that says which column it moved to', () => {
    const c = cascadeOfConflict(conflict, { label: 'Trade', amount: null })
    expect(c.added[0].because).toBe('now priced at Trade')
    expect(c.added[0].amount).toBe(99_400)
  })

  it('carries a held line’s own reason through untouched', () => {
    const c = cascadeOfConflict(conflict, { label: 'Trade', amount: null })
    expect(c.unchecked[0].because).toBe('no price column on this table')
  })

  it('infers nothing from a missing price column: a line with no figure is not called standard', () => {
    const c = cascadeOfConflict(conflict, { label: 'Trade', amount: null })
    expect(c.unchecked[0].amount).toBeNull()
    /* and the contract has no flag to carry the claim at all */
    for (const row of [...c.added, ...c.removed, ...c.unchecked])
      expect(row).not.toHaveProperty('standard')
  })

  it('keeps the arithmetic the conflict already computed', () => {
    const c = cascadeOfConflict(conflict, { label: 'Trade', amount: null })
    expect([c.from, c.to, c.delta]).toEqual([120_000, 113_470, -6_530])
  })
})

/* ---------------------------------------------------------- */
/* The paper's reading, which is the cascade's reading          */
/* ---------------------------------------------------------- */

describe('the cascade reads every line the way the paper does', () => {
  /** A real hull off the real file whose minted quote carries a line
   *  the price file gives no figure — found by asking, never named. On
   *  this file it is a Highfield with its paired rigging kit, whose
   *  register has no price column at all. */
  const quoteWithAnUnpricedLine = async (): Promise<{ quote: QuoteDef; blank: QuoteLine }> => {
    const pack = await loadPack()
    for (const boat of pack.entities.filter((e) => e.kind === 'boat' && e.role !== 'join')) {
      const view = createViewFor(pack.ctx, boat.id)
      for (const row of (pack.rowsByEntity[boat.id] ?? []).slice(0, 8)) {
        const quote = mintQuoteFromView(pack.ctx, {
          viewId: view.id,
          rowId: row.id,
          reference: 'X',
        })
        const blank = quote?.lines.find((l) => lineAmount(l).amount === null)
        if (quote && blank) return { quote, blank }
      }
    }
    throw new Error('no boat on this file raises a quote with a line the file does not price')
  }

  it('reads every line on the document, and each exactly as readDocument does', async () => {
    const { quote } = await quoteWithAnUnpricedLine()
    const read = linesAsRead(quote)
    const doc = readDocument(quote)
    const printed = [...doc.sections.flatMap((s) => s.tables.flatMap((t) => t.lines)), ...doc.typed]
    expect(read.size).toBe(quote.lines.length)
    expect(printed.length).toBe(quote.lines.length)
    for (const printedLine of printed) expect(read.get(printedLine.id)).toEqual(printedLine)
  })

  it('reads a line the file does not price as not priced — the paper’s state, not Standard', async () => {
    const { quote, blank } = await quoteWithAnUnpricedLine()
    const read = linesAsRead(quote).get(blank.id)
    expect(read?.state).toBe('unpriced')
    expect(read?.say).toBe(NOT_PRICED_HERE)
    expect(rowFigure(lineAmount(blank).amount, read?.say ?? '')).toBe(NOT_PRICED_HERE)
  })
})
