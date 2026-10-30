/* ============================================================
   A GIVEN QUOTE PRINTS IN THE COLOUR IT WAS GIVEN IN.

   built-critique-m4.md, blocker 3: the paper's rules, reference and
   band numbers read the live `--color-accent`, and the frozen
   letterhead carried no colour, so keeping a new brand colour on
   Settings moved the issued 529 from amber to blue. The give now copies
   the colour onto the letterhead with everything else it prints, the
   printed quote pins its paper to it, and a copy brought back off the
   shelf keeps it. The trip below is the dealer's, in order: give in
   amber; keep blue; save a copy; forget everything; bring it back.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { makeCtx, type OrgProfile, type QuoteDef, type QuoteLine } from '@/domain/model'
import { isDone, issue } from '@/domain/quote/commands'
import { readDocument } from '@/domain/quote/document'
import { buildExportPayload } from '@/domain/io/exportPayload'
import { validateEnvelope } from '@/domain/io/envelope'
import { applyReplace } from '@/domain/io/apply'
import { memoryApply } from '@/domain/io/memoryApply'
import { DESIGNED_ACCENT, readBrand } from './colour'
import { accentOf, accentOnQuote, letterheadOf } from './letterhead'

const ORG = 'northside'
const PROJECT = { name: 'Northside Marine', rev: 1 }
/** the amber the walk gave the 529 in: one of the nearest that pass, offered by Settings */
const AMBER = '#a36b0a'
const NOW = '2026-10-30T02:00:00.000Z'

const northside = (brand?: string): OrgProfile => ({
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: '2026-01-01T00:00:00.000Z',
  slug: ORG,
  phone: '07 0000 0000',
  ...(brand ? { look: { brand } } : {}),
})

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
  levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: 62000, scope: 'quote' }],
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
  customer: { name: 'R. Kelleher' },
  preparedBy: 'Asaf',
  organisation: 'Northside Marine',
  createdAt: '2026-10-30T01:00:00.000Z',
  updatedAt: '2026-10-30T01:00:00.000Z',
}

function given(org: OrgProfile): QuoteDef {
  const out = issue({ letterhead: letterheadOf(org, org.name, null) })(DRAFT, NOW)
  if (!isDone(out)) throw new Error(out.refused)
  return out.next
}

describe('the colour a quote is given in', () => {
  it('the amber of the walk is a colour Settings would keep', () => {
    expect(readBrand(AMBER).refused).toBeNull()
  })

  it('IS COPIED ON AT THE GIVE, AND A COLOUR KEPT AFTERWARDS NEVER REACHES ITS PAPER', () => {
    const org = northside(AMBER)
    const quote = given(org)
    expect(quote.letterhead?.accent).toBe(AMBER)
    expect(readDocument(quote).accent).toBe(AMBER)

    /* Settings keeps the designed blue again the next day */
    org.look = {}
    expect(accentOf(org)).toBe(DESIGNED_ACCENT)
    expect(readDocument(quote).accent).toBe(AMBER)
  })

  it('survives a copy saved with today’s colour, a forget and a restore', () => {
    const quote = given(northside(AMBER))
    const copy = buildExportPayload(
      makeCtx({ orgId: ORG, org: northside(DESIGNED_ACCENT), quotes: [quote] }),
      PROJECT,
      true,
    )
    const sheet = memoryApply(makeCtx({ orgId: ORG }), PROJECT)
    const read = validateEnvelope(JSON.parse(JSON.stringify(copy)), ORG)
    expect(read.ok ? null : read.error).toBeNull()
    if (!read.ok) return
    applyReplace(read.data, sheet.ports)
    const back = sheet.ports.getQuote('qt_529') as QuoteDef
    expect(back.letterhead?.accent).toBe(AMBER)
    expect(readDocument(back).accent).toBe(AMBER)
  })

  it('a give with no colour kept freezes the designed blue, so a later amber never reaches it', () => {
    const quote = given(northside())
    expect(quote.letterhead?.accent).toBe(DESIGNED_ACCENT)
    expect(readDocument(quote).accent).toBe(DESIGNED_ACCENT)
  })

  it('a colour refused at the floor is never frozen: the give prints in what the app wore', () => {
    /* a stored colour Settings would refuse is never written to the screens either (look.ts) */
    const pale = '#ffea28'
    expect(readBrand(pale).refused).not.toBeNull()
    expect(given(northside(pale)).letterhead?.accent).toBe(DESIGNED_ACCENT)
  })

  it('a draft is pinned to nothing: it wears today’s colour like every screen', () => {
    expect(accentOnQuote({ state: 'draft', letterhead: { name: 'N', accent: AMBER } })).toBeNull()
    expect(readDocument(DRAFT).accent).toBeNull()
  })

  it('a quote given before the colour was frozen is pinned to the designed blue it was given in', () => {
    expect(accentOnQuote({ state: 'issued', letterhead: { name: 'Northside Marine' } })).toBe(
      DESIGNED_ACCENT,
    )
    expect(accentOnQuote({ state: 'issued' })).toBe(DESIGNED_ACCENT)
  })

  it('a colour from outside is a hex or nothing', () => {
    const file = buildExportPayload(
      makeCtx({ orgId: ORG, quotes: [given(northside(AMBER))] }),
      PROJECT,
      true,
    )
    const raw = JSON.parse(JSON.stringify(file)) as {
      quotes: { letterhead: Record<string, unknown> }[]
    }
    raw.quotes[0]!.letterhead.accent = 'red; background: url(//elsewhere)'
    const read = validateEnvelope(raw, ORG)
    expect(read.ok).toBe(true)
    if (!read.ok) return
    const back = read.data.quotes?.[0] as QuoteDef
    expect(back.letterhead?.accent).toBeUndefined()
    expect(accentOnQuote(back)).toBe(DESIGNED_ACCENT)
  })
})
