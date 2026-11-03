/* ============================================================
   WHAT REVIEW SAYS OF A LINE, in the dealer's words and never the
   file's (built-critique-m3-2.md, M13: the first case printed "ATM
   (KG)", "Rego ($)", "Registration Costs!C16 / C17", "Dunbier Trailers
   · 9304 + 9083L" and "DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B
   (1,450kgs) Fibreglass Boat").
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { TRAILER_MASS_BANDS } from '@/domain/rules/constraints/registration'
import {
  capsSaid,
  columnLetter,
  heading,
  labelRead,
  nameSaid,
  priceSaid,
  trailerModel,
  trailerSaid,
  trailerSeries,
  titleOf,
} from './read'

const ALP = {
  label: 'DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B (1,450kgs) Fibreglass Boat',
  tableName: 'Dunbier Trailers',
  code: '9304 + 9083L',
}

describe('a trailer, said', () => {
  it('names the model, and the series beside the maker’s mark, in a person’s casing', () => {
    expect(trailerSaid(ALP).replace(/\s*\(.*$/, '')).toBe('ALP 5.3M-13B')
    /* the file carries two ALP 5.3M-13Bs in Dunbier; the words after the rating tell them apart
       (the verifier of 2026-11-04, round 2, minor 2) */
    expect(trailerModel(ALP)).toBe('ALP 5.3M-13B Fibreglass Boat')
    expect(
      trailerModel({
        ...ALP,
        label: 'DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B (1,450kgs)',
        code: '9304',
      }),
    ).toBe('ALP 5.3M-13B')
    /* a model the namer would say only by its maker's word keeps its code: Tinka's two are told
       apart by it (trl_redco:36 and :37 in the pack) */
    expect(
      trailerModel({
        label: 'TINKA Aluminium - TA450MO-B',
        tableName: 'REDCO / Tinka Trailers',
        code: 'TA450MO-B',
      }),
    ).toBe('Aluminium · TA450MO-B')
    expect(trailerSeries(ALP)).toBe('Alloy Loader Pro Series')
    /* a name that does not lead with a series has none to say */
    expect(
      trailerSeries({
        label: 'MACKAY PU Series Trailer - PU5000-14-M',
        tableName: 'Mackay Trailers',
        code: '',
      }),
    ).toBe('')
  })
})

describe('a column, as a heading', () => {
  it('leaves the bracketed unit to the figure', () => {
    expect(heading('ATM (KG)')).toBe('ATM')
    expect(heading('Rego ($)')).toBe('Rego')
    expect(heading('Sell inc Rego')).toBe('Sell inc Rego')
    expect(heading('Rego Type')).toBe('Rego Type')
  })
})

describe('where a size is read from', () => {
  it('quotes the fee list’s own label, without the workbook’s cell', () => {
    const said = TRAILER_MASS_BANDS.map((b) => (b.readFrom ? labelRead(b.readFrom) : null)).filter(
      (s): s is string => s !== null,
    )
    expect(said).toContain('“Up to 1.02t”')
    expect(said).toContain('“Over 1.021t”')
    for (const s of said) expect(s).not.toMatch(/![A-Z]+\d/)
    /* a record with no quoted label says nothing rather than its address */
    expect(labelRead('a catalogued decline · Registration Costs!C19 · states no mass')).toBeNull()
  })
})

describe('a line with no price, alone in its case', () => {
  it('is named in its title as the build names it, not as the file keys it', () => {
    const title = titleOf({
      kind: 'none',
      key: 'k',
      group: {
        key: 'g',
        tableId: 'parts',
        tableName: 'Parts & Accessories',
        priceName: 'Sell',
        category: 'BATTERIES - Highfield E163',
        boat: false,
        kind: 'blank',
        priceFieldId: 'f',
        priceNames: ['Sell'],
        lines: [
          {
            key: 'l',
            rowId: 'r',
            name: 'Battery - E163 t/s E Powered Highfield',
            beside: null,
            staysBlank: [],
          },
        ],
      },
    })
    expect(title).toBe(
      `Give ${nameSaid('Battery - E163 t/s E Powered Highfield', 'Parts & Accessories')} a price.`,
    )
    expect(title).not.toContain(' - ')
  })
})

describe('the file’s capitals, said in a person’s case (the judge’s B5)', () => {
  it('lowers a run with a long word in it, and keeps short codes and model numbers', () => {
    expect(capsSaid('Outboard Vented Cover · YAMAHA 4 CYL 2.8L F150D F175A F200F')).toBe(
      'Outboard Vented Cover · Yamaha 4 CYL 2.8L F150D F175A F200F',
    )
    expect(capsSaid('MINN KOTA · RT Terrova')).toBe('Minn Kota · RT Terrova')
    expect(capsSaid('Hose, Clear PVC · 25mm')).toBe('Hose, Clear PVC · 25mm')
    expect(capsSaid('NB: No Rego Decals · NOT TO BE SUPPLIED')).toBe(
      'NB: No Rego Decals · Not To Be Supplied',
    )
  })

  it('says a price without its “(if appl.)”, and a column by its letter', () => {
    expect(priceSaid('Sell inc Install (if appl.)')).toBe('Sell inc Install')
    expect(columnLetter('Rigging Kits!AE · labelled here by header row 1.')).toBe('AE')
    expect(columnLetter(undefined)).toBe('')
  })
})

describe('the verifier’s round 1: only what every line holds, counted as it is said', async () => {
  const { onSaleAt, pricesOfLine, sinceSaid, staysSaid } = await import('./read')
  const { pricesSaid } = await import('@/domain/rules/review/pricesNow')
  const both = [
    { label: 'Sell', zero: true },
    { label: 'Sell inc Install (if appl.)', zero: true },
  ]
  const blankFitted = [
    { label: 'Sell', zero: true },
    { label: 'Sell inc Install (if appl.)', zero: false },
  ]
  const names = ['Sell', 'Sell inc Install (if appl.)']

  it('says $0 at both prices only where every line holds $0 at both', () => {
    expect(onSaleAt('zero', names, pricesSaid([both, both]))).toBe(
      'on sale at $0 at Sell and Sell inc Install',
    )
    expect(onSaleAt('zero', names, pricesSaid([blankFitted, blankFitted]))).toBe(
      'on sale at $0 at Sell and with no Sell inc Install',
    )
    expect(onSaleAt('zero', names, pricesSaid([both, blankFitted]))).toBe(
      'on sale at $0 at Sell and at $0 or blank at Sell inc Install',
    )
    expect(pricesOfLine(blankFitted)).toBe('$0 at Sell · no Sell inc Install')
  })

  it('never says blank of a price that holds $0', () => {
    const needs = ['Sell inc Install (if appl.)']
    expect(staysSaid([{ needs, now: both }], false)).toBe(
      'Its Sell inc Install stays $0 until it is set on its line in the price list.',
    )
    expect(staysSaid([{ needs, now: blankFitted }], false)).toBe(
      'Its Sell inc Install stays blank until it is set on its line in the price list.',
    )
    expect(
      staysSaid(
        [
          { needs, now: both },
          { needs, now: blankFitted },
        ],
        false,
      ),
    ).toBe(
      'Each one’s Sell inc Install stays as each reads until it is set on its line in the price list.',
    )
  })

  it('counts what was settled and what is new since the file', () => {
    expect(sinceSaid(2, 1)).toBe('2 cases settled and 1 case new')
    expect(sinceSaid(1, 0)).toBe('1 case settled')
  })
})
