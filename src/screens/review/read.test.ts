/* ============================================================
   WHAT REVIEW SAYS OF A LINE, in the dealer's words and never the
   file's (built-critique-m3-2.md, M13: the first case printed "ATM
   (KG)", "Rego ($)", "Registration Costs!C16 / C17", "Dunbier Trailers
   · 9304 + 9083L" and "DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B
   (1,450kgs) Fibreglass Boat").
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { TRAILER_MASS_BANDS } from '@/domain/rules/constraints/registration'
import { heading, labelRead, nameSaid, trailerSaid, trailerSeries, titleOf } from './read'

const ALP = {
  label: 'DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B (1,450kgs) Fibreglass Boat',
  tableName: 'Dunbier Trailers',
  code: '9304 + 9083L',
}

describe('a trailer, said', () => {
  it('names the model, and the series beside the maker’s mark, in a person’s casing', () => {
    expect(trailerSaid(ALP).replace(/\s*\(.*$/, '')).toBe('ALP 5.3M-13B')
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
        kind: 'blank',
        priceFieldId: 'f',
        priceNames: ['Sell'],
        lines: [
          {
            key: 'l',
            rowId: 'r',
            name: 'Battery - E163 t/s E Powered Highfield',
            beside: null,
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
