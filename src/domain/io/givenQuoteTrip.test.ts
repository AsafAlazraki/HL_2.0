/* ============================================================
   A GIVEN QUOTE COMES BACK OFF THE SHELF PRINTING THE SAME PAPER.

   `issue` copies Northside's letterhead and the person who prepared the
   quote onto it, by value, so that Settings changed tomorrow never
   reaches a quote given today. The envelope's reader named neither, so a
   copy saved on the shelf and brought back after "Forget everything"
   came home without its ABN, address, phone, email, valid-until day or
   preparer: a different paper under the same number (built-critique-m4.md,
   blocker 1, measured on the 529).

   THE TRIP BELOW IS THE DEALER'S, IN ORDER, through the real functions:
   give a quote with the letterhead as it stands; change the phone and
   the person's title on Settings; save a copy; forget everything; bring
   the copy back. Then the quote is read with the SAME function the
   document prints its head from (`letterheadOnQuote`, `contactLine`),
   against the letterhead as it stands AFTER the change, and must print
   what it was given with — not today's phone.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { makeCtx, type OrgProfile, type QuoteDef, type QuoteLine } from '@/domain/model'
import { isDone, issue } from '@/domain/quote/commands'
import {
  contactLine,
  letterheadOf,
  letterheadOnQuote,
  preparerOf,
} from '@/domain/northside/letterhead'
import { buildExportPayload } from './exportPayload'
import { validateEnvelope } from './envelope'
import { applyReplace } from './apply'
import { memoryApply } from './memoryApply'

const ORG = 'northside'
const PROJECT = { name: 'Northside Marine', rev: 1 }

/** the mark the app ships, by its address on this site, as the give freezes it */
const HELD_MARK = { src: '/HL_2.0/brand-marks/northside-marine.png', width: 640, height: 160 }

const NORTHSIDE: OrgProfile = {
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: '2026-01-01T00:00:00.000Z',
  slug: ORG,
  legalName: 'Northside Marine Pty Ltd',
  abn: '12 345 678 901',
  address: '1 Example Street\nBrendale QLD 4500',
  phone: '07 0000 0000',
  email: 'sales@example.com.au',
  website: 'example.com.au',
  deposit: 'A deposit of 10% holds the boat.',
  validDays: 14,
  people: [{ id: 'p1', name: 'Asaf', title: 'Sales manager', phone: '0400 111 222' }],
}

const hull: QuoteLine = {
  id: 'ln_hull',
  label: 'Stacer 529 Assault Pro',
  entityId: 'tbl_boats',
  rowId: 'row_529',
  qty: 1,
  unitPrice: 62000,
  priceFieldId: 'fld_cash',
  priceColumnName: 'Cash',
  levelKey: 'cash',
  levelResolved: 'cash',
  /* what the paper says under the line and in "The codes": the business's own code, what the
     price already holds, and a rung the ladder keeps for Northside — each of which the restore
     also used to drop (measured by the shelf's walk, 2026-10-30) */
  code: 'HBS145',
  levels: [
    {
      key: 'cash',
      label: 'Cash',
      fieldId: 'fld_cash',
      value: 62000,
      scope: 'quote',
      reach: 'customer',
      contains: { includesPreDelivery: true, source: 'Boat Module!QR' },
    },
    {
      key: 'cost',
      label: 'Nett',
      fieldId: 'fld_nett',
      value: 51000,
      scope: 'quote',
      reach: 'northside',
    },
  ],
}

const DRAFT: QuoteDef = {
  id: 'qt_529',
  orgId: ORG,
  reference: '20261030-01',
  state: 'draft',
  viewId: 'view_boats',
  rootTableId: 'tbl_boats',
  rootRowId: 'row_529',
  subjectLabel: 'Stacer 529 Assault Pro',
  subjectSpecs: [],
  sections: [{ blockId: '__subject', tableId: 'tbl_boats', title: 'Boat', lineIds: ['ln_hull'] }],
  chapters: [],
  lines: [hull],
  adjustments: [],
  events: [],
  levelKey: 'cash',
  taxRate: 10,
  customer: { name: 'R. Kelleher' },
  preparedBy: 'Asaf',
  createdAt: '2026-10-30T01:00:00.000Z',
  updatedAt: '2026-10-30T01:00:00.000Z',
}

/** give it, with the letterhead and the person exactly as they stand */
function given(org: OrgProfile): QuoteDef {
  const out = issue({
    letterhead: letterheadOf(org, org.name, HELD_MARK),
    preparer: preparerOf(org.people, DRAFT.preparedBy),
  })(DRAFT, '2026-10-30T02:00:00.000Z')
  if (!isDone(out)) throw new Error(out.refused)
  return out.next
}

describe('a given quote, saved, forgotten and brought back', () => {
  it('PRINTS THE SAME LETTERHEAD AND THE SAME PERSON — not today’s', () => {
    const quote = given(NORTHSIDE)
    const printed = letterheadOnQuote(quote, null)
    expect(printed?.phone).toBe('07 0000 0000')
    expect(printed?.validUntil).toBe('2026-11-13')
    expect(quote.preparer).toEqual({ name: 'Asaf', title: 'Sales manager', phone: '0400 111 222' })

    /* Settings changes the next day: a new phone, a new title */
    const changed: OrgProfile = {
      ...NORTHSIDE,
      phone: '07 9999 9999',
      people: [{ id: 'p1', name: 'Asaf', title: 'Dealer principal', phone: '0400 111 222' }],
    }

    /* save a copy, with Settings as it now stands */
    const copy = buildExportPayload(
      makeCtx({ orgId: ORG, org: changed, quotes: [quote] }),
      PROJECT,
      true,
    )

    /* forget everything, then bring the copy back */
    const sheet = memoryApply(makeCtx({ orgId: ORG }), PROJECT)
    expect(sheet.quotes()).toHaveLength(0)
    const read = validateEnvelope(JSON.parse(JSON.stringify(copy)), ORG)
    expect(read.ok ? null : read.error).toBeNull()
    if (!read.ok) return
    applyReplace(read.data, sheet.ports)

    const back = sheet.ports.getQuote('qt_529') as QuoteDef
    expect(back.state).toBe('issued')

    /* the head of the paper, read the way the document reads it, against
       today's letterhead — which now says 07 9999 9999 */
    const today = letterheadOf(changed, changed.name, HELD_MARK)
    const after = letterheadOnQuote(back, today)
    expect(after).toEqual(printed)
    expect(contactLine(after!)).toEqual(contactLine(printed!))
    expect(contactLine(after!)).toContain('07 0000 0000')
    expect(contactLine(after!)).not.toContain('07 9999 9999')
    expect(back.preparer).toEqual(quote.preparer)
    /* the whole document, every key: nothing else was dropped on the way */
    expect(back).toEqual(quote)
  })

  it('a draft keeps printing the letterhead as it stands, because it was never given', () => {
    const copy = buildExportPayload(makeCtx({ orgId: ORG, quotes: [DRAFT] }), PROJECT, true)
    const read = validateEnvelope(copy, ORG)
    expect(read.ok).toBe(true)
    if (!read.ok) return
    const back = read.data.quotes?.[0] as QuoteDef
    expect(back.letterhead).toBeUndefined()
    const today = letterheadOf(NORTHSIDE, NORTHSIDE.name, HELD_MARK)
    expect(letterheadOnQuote(back, today)).toEqual(today)
  })
})

describe('a letterhead from outside is narrowed at the door', () => {
  const withLetterhead = (letterhead: unknown, preparer?: unknown): QuoteDef | undefined => {
    const file = buildExportPayload(
      makeCtx({ orgId: ORG, quotes: [given(NORTHSIDE)] }),
      PROJECT,
      true,
    )
    const raw = JSON.parse(JSON.stringify(file)) as { quotes: Record<string, unknown>[] }
    raw.quotes[0].letterhead = letterhead
    if (preparer !== undefined) raw.quotes[0].preparer = preparer
    const read = validateEnvelope(raw, ORG)
    return read.ok ? read.data.quotes?.[0] : undefined
  }

  it('REFUSES A MARK ADDRESS THAT COULD RUN OR LEAVE THE SITE, and keeps every other line', () => {
    for (const src of [
      'javascript:alert(1)',
      'data:text/html,<script>',
      '//elsewhere.example/mark.svg',
      'brand-marks/../mark.png',
      '/brand-marks/mark.html',
    ]) {
      const back = withLetterhead({
        name: 'Northside Marine',
        phone: '07 0000 0000',
        mark: { src, width: 10, height: 10 },
      })
      expect(back?.letterhead?.mark, src).toBeUndefined()
      expect(back?.letterhead?.phone).toBe('07 0000 0000')
    }
  })

  it('keeps a mark Northside uploaded, and the one the app ships', () => {
    for (const src of ['data:image/png;base64,AAAA', HELD_MARK.src, 'https://example.com/m.png']) {
      const back = withLetterhead({ name: 'N', mark: { src, width: 10, height: 10 } })
      expect(back?.letterhead?.mark?.src).toBe(src)
    }
  })

  it('drops a letterhead with no name, a damaged day and a line that is not a line', () => {
    expect(withLetterhead({ phone: '07 0000 0000' })?.letterhead).toBeUndefined()
    const back = withLetterhead({
      name: '  Northside Marine ',
      validUntil: 'next Tuesday',
      validDays: 4.5,
      abn: 12345678901,
      email: 'x'.repeat(401),
    })
    expect(back?.letterhead).toEqual({ name: 'Northside Marine' })
  })

  it('keeps the preparer by name and drops one with none', () => {
    expect(withLetterhead(undefined, { title: 'Sales' })?.preparer).toBeUndefined()
    expect(withLetterhead(undefined, { name: 'Asaf', phone: 7 })?.preparer).toEqual({
      name: 'Asaf',
    })
  })
})
