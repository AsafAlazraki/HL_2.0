import { beforeEach, describe, expect, it } from 'vitest'
import type { QuoteDef, QuoteLine } from '@/domain/model'
import { REGISTER_BANDS, readRegister } from '@/domain/quote/register'
import { quoteTotals } from '@/domain/quote/totals'
import { deskOf } from './filed'

/* ============================================================
   WHAT THE DRAFTS COLUMN READS, against documents built here.

   Every expectation below is asked of `domain/quote/register` first
   and then looked for in what `deskOf` handed back, so this suite
   cannot agree with a reading that has drifted from the engine: both
   have to agree with the document. Nothing here asserts a phrase this
   module wrote, because it writes none.
   ============================================================ */

const NOW = new Date('2026-09-18T10:00:00+10:00')

let n = 0

function line(unitPrice: number | null): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'boat_highfield',
    rowId: 'row_1',
    label: 'Highfield SP560',
    qty: 1,
    unitPrice,
    priceFieldId: 'fld_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: unitPrice, scope: 'quote' }],
  }
}

function doc(over: Partial<QuoteDef> = {}): QuoteDef {
  n += 1
  const hull = line(41_340)
  const at = new Date(NOW.getTime() - n * 3_600_000).toISOString()
  return {
    id: `q${n}`,
    orgId: 'northside',
    reference: `2026091${n}-01`,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'boat_highfield',
    rootRowId: 'row_1',
    subjectLabel: 'Highfield - SP560 PVC',
    subjectSpecs: [],
    sections: [
      { blockId: '__subject', tableId: 'boat_highfield', title: 'Highfield', lineIds: [hull.id] },
    ],
    chapters: [{ id: '__subject', title: 'Highfield', tableId: 'boat_highfield' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: 'R. Kelleher' },
    createdAt: at,
    updatedAt: at,
    ...over,
  }
}

const at = NOW.getTime()

describe('the desk, read off what is filed', () => {
  /* the documents are numbered from zero in every case, so "2 hours
     ago" is a fact about this document and not about how many cases
     ran before it */
  beforeEach(() => {
    n = 0
  })

  it('holds nothing, and says so in the register’s own sentence', () => {
    const desk = deskOf([], at)
    expect(desk.held).toBe(0)
    expect(desk.drafts).toBe(0)
    expect(desk.bands).toEqual([])
    expect(desk.newest).toBeNull()
    expect(desk.nothingOpen).toBe(REGISTER_BANDS.find((b) => b.id === 'draft')?.empty)
  })

  it('counts exactly what the register counts, band by band', () => {
    const filed = [doc(), doc({ state: 'issued', issuedAt: NOW.toISOString() }), doc()]
    const register = readRegister(filed)
    const desk = deskOf(filed, at)

    expect(desk.held).toBe(register.held)
    expect(desk.drafts).toBe(register.bands.find((b) => b.spec.id === 'draft')?.held)
    expect(desk.bands).toEqual(
      register.bands
        .filter((band) => band.held > 0)
        .map((band) => ({ id: band.spec.id, word: band.spec.word, held: band.held })),
    )
  })

  /* THE ONE TO COME BACK TO IS THE NEWEST DRAFT, not the newest
     document: `readRegister` draws band by band and newest first
     inside each, and this takes the first row it hands back. */
  it('takes the newest draft ahead of a newer issued quote', () => {
    const older = doc()
    const newer = doc({
      state: 'issued',
      issuedAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    })
    const desk = deskOf([newer, older], at)
    expect(desk.newest?.id).toBe(older.id)
    expect(desk.newest?.word).toBe('Draft')
  })

  it('falls to the newest issued quote where no draft is open', () => {
    const issued = doc({ state: 'issued', issuedAt: NOW.toISOString() })
    const desk = deskOf([issued], at)
    expect(desk.newest?.id).toBe(issued.id)
    expect(desk.newest?.word).toBe('Issued')
    expect(desk.drafts).toBe(0)
  })

  it('carries the figure the engine totals, the rung the document is on, and its age', () => {
    const quote = doc()
    const desk = deskOf([quote], at)
    expect(desk.newest?.total).toBe(quoteTotals(quote).total)
    expect(desk.newest?.insteadOfTotal).toBeNull()
    expect(desk.newest?.rung).toBe('Cash')
    expect(desk.newest?.lines).toBe(quote.lines.length)
    expect(desk.newest?.age).toBe('2 hours ago')
    expect(desk.newest?.customer).toBe('R. Kelleher')
  })

  /* WHERE A FIGURE CANNOT STAND, THE REGISTER'S OWN SENTENCE DOES —
     this module never writes one and never computes one. */
  it('hands back the register’s sentence in place of a figure it has not got', () => {
    const desk = deskOf([doc({ lines: [] })], at)
    expect(desk.newest?.total).toBeNull()
    expect(desk.newest?.insteadOfTotal).toBeTruthy()
    expect(desk.newest?.rung).toBeNull()
  })

  it('names nobody where nobody has been named', () => {
    const desk = deskOf([doc({ customer: { name: '  ' } })], at)
    expect(desk.newest?.customer).toBeNull()
  })

  /* A PICTURE BELONGS ONLY TO THE EXACT MODEL IT DEPICTS. The ledger
     holds an SP560 photograph for the Highfield register and nothing
     at all for the Stacer built below, and no substitution happens in
     either direction. */
  it('draws the held photograph of that model, and stands in for nothing', () => {
    expect(deskOf([doc()], at).newest?.picture?.id).toBe('highfield-sp560')
    expect(
      deskOf([doc({ rootTableId: 'boat_stacer', subjectLabel: 'Stacer 529 Assault Pro' })], at)
        .newest?.picture,
    ).toBeUndefined()
    /* the same model name against the wrong register is not a match */
    expect(
      deskOf([doc({ rootTableId: 'boat_stacer', subjectLabel: 'Highfield - SP560 PVC' })], at)
        .newest?.picture,
    ).toBeUndefined()
  })
})
