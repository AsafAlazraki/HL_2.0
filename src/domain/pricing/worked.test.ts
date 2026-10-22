/* ============================================================
   A PRICE WORKED FROM COST STARTS AS NORTHSIDE'S ONLY, AND A QUOTE
   PRICED AT ONE IS NOT GIVEN.

   Warranty is the case the brief named (docs/research/proposal/
   analysis.md §4 item 1): $32,166 against Cash $48,350 on the
   Highfield SP560 (HYP), worked from landed cost, and the cost guard
   cannot see it because it is not a cost column. These pin the four
   places that have to agree: the column (`workedFromCost`), the
   dealer's flag (`mayReachCustomer`), the figure fixed on a line
   (`freezeLevels`), and the refusal when the quote is given
   (`issueBlockers`).
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { EntityDef, FrozenLevel, QuoteDef, QuoteLine } from '@/domain/model'
import { freezeLevels, priceLevelsFor } from '@/domain/quote/pricing'
import { issueBlockers, keptFromCustomers } from '@/domain/quote/totals'
import { frozenMayReach, mayReachCustomer, workedFromCost } from './worked'

const boat: EntityDef = {
  id: 'boat_highfield',
  orgId: 'northside',
  name: 'Highfield Inflatables',
  kind: 'boat',
  accent: 'blue',
  position: { x: 0, y: 0 },
  fields: [
    { id: 'boat_highfield.iy', name: 'Landed Hull Cost', type: 'number', sectionId: 'cost-build' },
    { id: 'boat_highfield.qr', name: 'Cash', type: 'number', sectionId: 'pricing' },
    { id: 'boat_highfield.rb', name: 'Warranty', type: 'number', sectionId: 'pricing' },
  ],
  sections: [
    { id: 'cost-build', name: 'Cost Build' },
    { id: 'pricing', name: 'Hull Only Pricing' },
  ],
  priceLevels: [
    { key: 'cash', label: 'Cash', fieldId: 'boat_highfield.qr', scope: 'quote' },
    { key: 'warranty', label: 'Warranty', fieldId: 'boat_highfield.rb', scope: 'line' },
  ],
  createdAt: '2026-09-16T00:00:00.000Z',
  updatedAt: '2026-09-16T00:00:00.000Z',
}

const motor: EntityDef = {
  id: 'mot_yamaha',
  orgId: 'northside',
  name: 'Yamaha Outboards',
  kind: 'motor',
  accent: 'carmine',
  position: { x: 1, y: 0 },
  fields: [
    { id: 'mot_yamaha.bb', name: 'RRP + Freight Inc GST', type: 'number', sectionId: 'retail' },
    { id: 'mot_yamaha.bf', name: 'Sell Price', type: 'number', sectionId: 'retail' },
  ],
  sections: [{ id: 'retail', name: 'Retail Pricing' }],
  priceLevels: [{ key: 'cash', label: 'Sell Price', fieldId: 'mot_yamaha.bf', scope: 'quote' }],
  createdAt: '2026-09-16T00:00:00.000Z',
  updatedAt: '2026-09-16T00:00:00.000Z',
}

/* the SP560 (HYP) W-W-WB's own figures, boat_highfield:490 */
const SP560 = { 'boat_highfield.qr': 48350, 'boat_highfield.rb': 32166 }

describe('which prices are worked from cost', () => {
  it('names Warranty and RRP + Freight, each with the cell that works it, and nothing else', () => {
    expect(workedFromCost({ name: 'Warranty' })?.formula).toBe('ROUNDUP((IY − IW) × 1.01 × 1.1)')
    expect(workedFromCost({ name: 'Warranty' })?.source).toContain('Boat Module!RB')
    expect(workedFromCost({ name: 'RRP + Freight Inc GST' })?.source).toContain('Motor Library!BB')
    expect(workedFromCost({ name: 'Cash' })).toBeNull()
    expect(workedFromCost({ name: 'Sell Price' })).toBeNull()
  })

  it('starts such a price as Northside’s only, and the dealer’s answer wins', () => {
    const [cash, warranty] = boat.priceLevels!
    expect(mayReachCustomer(boat, cash!)).toBe(true)
    expect(mayReachCustomer(boat, warranty!)).toBe(false)
    expect(mayReachCustomer(boat, { ...warranty!, mayReachCustomer: true })).toBe(true)
    expect(mayReachCustomer(boat, { ...cash!, mayReachCustomer: false })).toBe(false)
  })
})

describe('the figure fixed on a line carries who may read it', () => {
  it('a Warranty line made at the price list’s default reads as Northside’s only', () => {
    const levels = freezeLevels(boat, SP560)
    const warranty = levels.find((l) => l.key === 'warranty')!
    expect(warranty.value).toBe(32166)
    expect(warranty.reach).toBeUndefined()
    expect(frozenMayReach(warranty)).toBe(false)
    expect(frozenMayReach(levels.find((l) => l.key === 'cash')!)).toBe(true)
  })

  it('once Warranty may reach a customer, a line made after says so', () => {
    const reaching = {
      ...boat,
      priceLevels: boat.priceLevels!.map((l) =>
        l.key === 'warranty' ? { ...l, mayReachCustomer: true } : l,
      ),
    }
    const warranty = freezeLevels(reaching, SP560).find((l) => l.key === 'warranty')!
    expect(warranty.reach).toBe('customer')
    expect(frozenMayReach(warranty)).toBe(true)
  })

  it('a Cash the dealer keeps to himself is fixed as Northside’s', () => {
    const kept = {
      ...boat,
      priceLevels: boat.priceLevels!.map((l) =>
        l.key === 'cash' ? { ...l, mayReachCustomer: false } : l,
      ),
    }
    expect(freezeLevels(kept, SP560).find((l) => l.key === 'cash')!.reach).toBe('northside')
  })
})

describe('the motor’s RRP + Freight passes the cost guard only when the dealer named it', () => {
  it('is refused as a price while nobody chose it, and read once he did', () => {
    const asked = {
      ...motor,
      priceLevels: [
        { key: 'cash', label: 'RRP + Freight Inc GST', fieldId: 'mot_yamaha.bb', scope: 'quote' },
      ],
    } satisfies EntityDef
    expect(priceLevelsFor(asked)).toEqual([])
    const named = {
      ...asked,
      priceLevels: [{ ...asked.priceLevels[0]!, named: true }],
    } satisfies EntityDef
    expect(priceLevelsFor(named).map((l) => l.fieldId)).toEqual(['mot_yamaha.bb'])
    /* and, worked from cost, it is still Northside's only until he lets it reach a customer */
    const fixed = freezeLevels(named, { 'mot_yamaha.bb': 17643 })
    expect(frozenMayReach(fixed[0]!)).toBe(false)
  })
})

/* ---------------------------------------------------------- */
/* the refusal when the quote is given                         */
/* ---------------------------------------------------------- */

function lineAt(levels: FrozenLevel[], key: string): QuoteLine {
  const at = levels.find((l) => l.key === key)!
  return {
    id: 'hull',
    entityId: boat.id,
    rowId: 'boat_highfield:490',
    label: 'Highfield SP560 (HYP) W-W-WB',
    qty: 1,
    unitPrice: at.value,
    priceFieldId: at.fieldId,
    priceColumnName: at.label,
    levelKey: key,
    levelResolved: key,
    levels,
    pinnedLevel: true,
  }
}

function quoteOf(line: QuoteLine): QuoteDef {
  return {
    id: 'q1',
    orgId: 'northside',
    reference: 'Q-1',
    state: 'draft',
    viewId: 'view_1',
    rootTableId: boat.id,
    rootRowId: line.rowId,
    subjectLabel: 'Highfield SP560 (HYP) W-W-WB',
    subjectSpecs: [],
    sections: [{ blockId: '__subject', tableId: boat.id, title: 'Boat', lineIds: [line.id] }],
    chapters: [{ id: '__subject', title: 'Boat', tableId: boat.id }],
    lines: [line],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: 'A customer' },
    createdAt: '2026-10-22T00:00:00.000Z',
    updatedAt: '2026-10-22T00:00:00.000Z',
  }
}

describe('a quote with a line at a price Northside keeps is not given', () => {
  it('refuses the SP560 at Warranty, once, with the price and the way out', () => {
    const quote = quoteOf(lineAt(freezeLevels(boat, SP560), 'warranty'))
    expect(keptFromCustomers(quote).map((k) => k.price)).toEqual(['Warranty'])
    const why = issueBlockers(quote)
    expect(why).toHaveLength(1)
    expect(why[0]).toMatch(/is at Warranty, a price Northside keeps to itself/)
    expect(why[0]).toMatch(/let Warranty reach a customer on Prices, in Data\.$/)
  })

  it('gives the same quote at Cash, and at Warranty once Warranty may reach a customer', () => {
    expect(issueBlockers(quoteOf(lineAt(freezeLevels(boat, SP560), 'cash')))).toEqual([])
    const reaching = {
      ...boat,
      priceLevels: boat.priceLevels!.map((l) => ({ ...l, mayReachCustomer: true })),
    }
    expect(issueBlockers(quoteOf(lineAt(freezeLevels(reaching, SP560), 'warranty')))).toEqual([])
  })
})
