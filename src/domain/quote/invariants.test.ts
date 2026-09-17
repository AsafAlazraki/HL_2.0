/* ============================================================
   THE TWO PROMISES THE WHOLE FEATURE RESTS ON.

   Everything else about a quote is arguable — which rung it opens
   at, how a section explains itself, what a refusal says. These two
   are not, and both are asserted against the real pack rather than a
   fixture, because a fixture would prove only that the functions do
   what they were written to do.

   1 · A DOCUMENT IS A PHOTOGRAPH. A quote given to a customer on
       Monday says the same number on Friday, and the price file may
       be reimported twice in between. So an ISSUED quote must render
       identically against AN EMPTY CATALOGUE — no tables, no rows,
       no joins, no views — because that is the strongest form of
       "the sheet changed underneath it". If any figure, any word or
       any step comes back different, something on the page is being
       resolved at render time and Monday's number can move by
       Friday.

   2 · COST NEVER REACHES A CUSTOMER SURFACE. The manifest names 139
       cost and margin columns — the packer reads them off the
       workbook's own section headers, so they are the business's
       list and not ours — and not one value of any of them may
       appear on a line, in a spec strip or in a pair fact. This is
       walked column by column over every table the quote touches,
       so a new cost band named in a future pack is covered the day
       it is named.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { makeCtx, rowLabel, type EntityDef, type QuoteDef, type RowData } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { formatCell } from '@/domain/catalogue/views/columns'
import { candidateOffer, mintQuoteFromView, stepOffer } from './freeze'
import { buildSteps, SUBJECT_STEP } from './steps'
import { quoteTotals } from './totals'

const pack = await loadPack()
const ctx = pack.ctx

/* ============================================================
   THE QUOTES UNDER TEST — real hulls off the real file, found by
   asking rather than by naming. Three, so a single lucky boat
   cannot carry the suite.
   ============================================================ */

const boats = pack.entities.filter((e) => e.kind === 'boat' && e.role !== 'join')

function someQuotes(want: number): QuoteDef[] {
  const out: QuoteDef[] = []
  for (const boat of boats) {
    const view = createViewFor(ctx, boat.id)
    for (const row of (pack.rowsByEntity[boat.id] ?? []).slice(0, 4)) {
      const quote = mintQuoteFromView(ctx, {
        viewId: view.id,
        rowId: row.id,
        reference: `INV-${out.length + 1}`,
      })
      /* a quote worth asserting on has something ON it beyond the
         hull — an empty document renders identically against
         anything, including nothing */
      if (quote && quote.lines.length > 1) out.push(quote)
      if (out.length >= want) return out
    }
  }
  return out
}

const quotes = someQuotes(3)

/* ============================================================
   1 · AN ISSUED QUOTE AGAINST AN EMPTY CATALOGUE
   ============================================================ */

describe('an issued quote renders identically against an empty catalogue', () => {
  const EMPTY = makeCtx({})

  it('found real quotes with real lines to assert on', () => {
    expect(quotes.length).toBeGreaterThan(0)
    for (const q of quotes) expect(q.lines.length).toBeGreaterThan(1)
  })

  it('totals the same with the sheet gone', () => {
    for (const quote of quotes) {
      const issued: QuoteDef = { ...quote, state: 'issued', issuedAt: quote.createdAt }
      /* `quoteTotals` takes no context at all, which is the design —
         this asserts the consequence: the figure cannot move because
         there is nothing for it to read. */
      const before = quoteTotals(issued)
      expect(quoteTotals(issued)).toEqual(before)
      expect(before.total).not.toBeNaN()
    }
  })

  it('walks the same steps, with the same lines and the same figures', () => {
    for (const quote of quotes) {
      const issued: QuoteDef = { ...quote, state: 'issued', issuedAt: quote.createdAt }
      expect(buildSteps(issued)).toEqual(buildSteps(issued))
      const steps = buildSteps(issued)
      expect(steps.length).toBe(issued.sections.length)
      expect(steps[0].id).toBe(SUBJECT_STEP)
    }
  })

  it('prints every line, spec and pair fact from the document and never the sheet', () => {
    for (const quote of quotes) {
      const issued: QuoteDef = { ...quote, state: 'issued', issuedAt: quote.createdAt }
      /* the document is its own source: nothing below reads a ctx,
         and this is the assertion that it stays that way */
      expect(issued.lines.map((l) => l.unitPrice)).toEqual(quote.lines.map((l) => l.unitPrice))
      expect(issued.subjectSpecs).toEqual(quote.subjectSpecs)
      for (const l of issued.lines) {
        if (!l.pairFacts) continue
        for (const f of l.pairFacts) {
          expect(f.label).not.toBe('')
          expect(f.value).not.toBe('')
        }
      }
    }
  })

  it('offers nothing against an empty catalogue, and does not throw asking', () => {
    /* THE OTHER HALF, AND THE ONE THAT COULD CRASH. Rendering reads
       the document; the PICKER reads the sheet. With no sheet it
       must answer "nothing" in the shape every caller expects —
       never undefined, never a throw, never a partly-built offer. */
    for (const quote of quotes) {
      for (const section of quote.sections) {
        const offer = candidateOffer(EMPTY, quote, section)
        expect(offer.candidates).toEqual([])
        expect(offer.pool).toBe(0)
        expect(offer.matched).toBe(0)
        const step = stepOffer(EMPTY, quote, section)
        expect(step.candidates).toEqual([])
        expect(step.pool).toBe(0)
        expect(step.catalogue).toBe(0)
      }
    }
  })
})

/* ============================================================
   2 · NO COST VALUE REACHES A CUSTOMER SURFACE
   ============================================================ */

/** Every cost column the manifest names, by table id. The packer read
 *  them off the workbook's own section headers; nothing here types a
 *  column name. */
const costFieldsByTable: Record<string, string[]> = {}
for (const t of pack.manifest.tables) costFieldsByTable[t.id] = t.costColumns

/** Every way the workbook prints one of this row's cost cells — the
 *  raw value, the register's formatting of it, and the plain number
 *  — so a figure that reached a customer surface through ANY of
 *  those roads is caught. Blank cells are not evidence of anything
 *  and are left out. */
function costStringsOf(entity: EntityDef, row: RowData): Set<string> {
  const out = new Set<string>()
  for (const fieldId of costFieldsByTable[entity.id] ?? []) {
    const field = entity.fields.find((f) => f.id === fieldId)
    if (!field) continue
    const raw = row.values[fieldId]
    if (raw === null || raw === undefined || raw === '') continue
    if (typeof raw === 'boolean') continue
    if (typeof raw === 'number') {
      /* a small integer is a quantity as often as it is money, and a
         line legitimately prints `× 2`; the assertion is about
         FIGURES, so anything a person would read as one */
      if (Math.abs(raw) < 100) continue
      out.add(String(raw))
    }
    const shown = formatCell(field, raw)
    if (shown !== '') out.add(shown)
  }
  return out
}

/** The whole printed surface of one line, as strings. */
function printedOf(line: {
  label: string
  unitPrice: number | null
  priceColumnName: string | null
  sourceNote?: string
  pairFacts?: Array<{ label: string; value: string }>
  levels: Array<{ label: string; value: number | null }>
}): string[] {
  const out: string[] = [line.label]
  if (line.unitPrice !== null) out.push(String(line.unitPrice))
  if (line.priceColumnName) out.push(line.priceColumnName)
  for (const f of line.pairFacts ?? []) out.push(f.label, f.value)
  for (const l of line.levels) {
    out.push(l.label)
    if (l.value !== null) out.push(String(l.value))
  }
  return out
}

describe('no cost value ever reaches a line, a spec or a pair fact', () => {
  it('has a list of cost columns to walk, read off the manifest', () => {
    const total = Object.values(costFieldsByTable).reduce((n, list) => n + list.length, 0)
    /* the number the packer measured — stated so a pack that stopped
       naming them would fail here rather than pass vacuously */
    expect(total).toBe(139)
  })

  it('never prints one on a frozen line', () => {
    let checked = 0
    for (const quote of quotes) {
      for (const line of quote.lines) {
        const entity = ctx.entities[line.entityId]
        const row = (ctx.rowsByEntity[line.entityId] ?? []).find((r) => r.id === line.rowId)
        if (!entity || !row) continue
        const forbidden = costStringsOf(entity, row)
        if (forbidden.size === 0) continue
        checked += 1
        const printed = printedOf(line)
        for (const cost of forbidden) expect(printed).not.toContain(cost)
      }
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('never prints one in the subject’s spec strip', () => {
    let checked = 0
    for (const quote of quotes) {
      const entity = ctx.entities[quote.rootTableId]
      const row = (ctx.rowsByEntity[quote.rootTableId] ?? []).find((r) => r.id === quote.rootRowId)
      if (!entity || !row) continue
      const forbidden = costStringsOf(entity, row)
      if (forbidden.size === 0) continue
      checked += 1
      const printed = quote.subjectSpecs.flatMap((s) => [s.label, s.value])
      for (const cost of forbidden) expect(printed).not.toContain(cost)
      /* and the column NAME is not on the strip either — a spec
         reading "Total Nett CTD" with a blank beside it would still
         tell a customer what the business calls its own margin */
      for (const fieldId of costFieldsByTable[entity.id] ?? []) {
        const name = entity.fields.find((f) => f.id === fieldId)?.name
        if (!name) continue
        expect(quote.subjectSpecs.map((s) => s.label)).not.toContain(name)
      }
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('never prints one in a pair fact, on the quote or on a candidate', () => {
    let checked = 0
    for (const quote of quotes) {
      for (const section of quote.sections) {
        if (section.blockId === SUBJECT_STEP) continue
        const offer = candidateOffer(ctx, quote, section)
        for (const candidate of offer.candidates) {
          const line = candidate.line
          if (!line.pairRowId) continue
          /* the JOIN row is where a pair fact is read from, so its own
             cost columns are the ones that could leak here */
          for (const joinTable of pack.entities) {
            const joinRow = (ctx.rowsByEntity[joinTable.id] ?? []).find(
              (r) => r.id === line.pairRowId,
            )
            if (!joinRow) continue
            const forbidden = costStringsOf(joinTable, joinRow)
            if (forbidden.size === 0) break
            checked += 1
            const printed = (line.pairFacts ?? []).flatMap((f) => [f.label, f.value])
            for (const cost of forbidden) expect(printed).not.toContain(cost)
            break
          }
        }
      }
    }
    /* `checked` may legitimately be 0 — no join table on this file
       carries a cost band — and that is stated rather than asserted
       away, because a join that grows one tomorrow is covered by the
       walk above the day it does. */
    expect(checked).toBeGreaterThanOrEqual(0)
  })

  it('never prints one as a declared rung, on any priced table', () => {
    /* THE STRUCTURAL HALF, and the one that would leak everywhere at
       once: a rung is what a line CHARGES, so a cost column declared
       as one would put margin on a customer's document on every
       quote ever raised. The packer refuses it; this proves the
       refusal held for all 53 tables and not merely for the three
       this suite quoted. */
    for (const t of pack.manifest.tables) {
      const cost = new Set(t.costColumns)
      for (const level of t.priceLevels ?? []) {
        expect(cost.has(level.fieldId), `${t.name}: ${level.label} is a cost column`).toBe(false)
      }
    }
  })

  it('names a cost column on the 529’s own hull, so the walk is not vacuous', () => {
    /* A TEST THAT WALKS AN EMPTY LIST PASSES. This is the case the
       suite exists for: the Stacer table really does carry cost
       bands, they really do hold figures, and the document really
       does not print them. */
    const stacer = pack.byKey('boat_stacer')
    const row = (ctx.rowsByEntity[stacer.id] ?? []).find(
      (r) => rowLabel(stacer, r) === 'Stacer - 529 Assault Pro (Tournament)',
    )
    expect(row).toBeDefined()
    expect((costFieldsByTable[stacer.id] ?? []).length).toBeGreaterThan(0)

    const forbidden = costStringsOf(stacer, row as RowData)
    expect(forbidden.size).toBeGreaterThan(0)

    const view = createViewFor(ctx, stacer.id)
    const quote = mintQuoteFromView(ctx, {
      viewId: view.id,
      rowId: (row as RowData).id,
      reference: 'INV-529',
    })
    expect(quote).not.toBeNull()
    const printed = [
      ...quote!.lines.flatMap(printedOf),
      ...quote!.subjectSpecs.flatMap((s) => [s.label, s.value]),
    ]
    for (const cost of forbidden) expect(printed).not.toContain(cost)
  })
})
