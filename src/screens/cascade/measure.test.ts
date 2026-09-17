import { describe, expect, it } from 'vitest'
import { appendFileSync, writeFileSync } from 'node:fs'
const OUT = 'measure.out.txt'
writeFileSync(OUT, '')
const console = { log: (...a: unknown[]) => appendFileSync(OUT, a.map(String).join(' ') + String.fromCharCode(10)) }
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { type RowData } from '@/domain/model'
import { rowLabel } from '@/domain/model'
import { mintQuote, quoteTotals, buildSteps, stepOffer, apply, addLine, refinishSubject } from '@/domain/quote'
import { fitmentCascade } from '@/domain/quote/cascade'
import { selectPartners, TRAILER_FITMENT } from '@/domain/fitment/trailerFitment'
import { readFinishes } from '@/screens/configurator/finishes'

describe('measure', () => {
  it('fitment properly', async () => {
    const pack = await loadPack()
    const ctx = pack.ctx
    for (const key of ['boat_highfield', 'boat_stacer']) {
      const table = pack.byKey(key)
      const rows = pack.rowsByEntity[table.id] ?? []
      const row = rows.find((r: RowData) => rowLabel(table, r).includes(key === 'boat_stacer' ? '529 Assault Pro' : 'SP560'))!
      const view = createViewFor(ctx, table.id)
      const minted = mintQuote(ctx, { viewId: view.id, rowId: row.id, reference: 'NSM-M' })!
      let quote = minted.quote
      const steps = buildSteps(quote)
      for (const step of steps) {
        const offer = stepOffer(ctx, quote, step.section, {})
        const cand = offer.candidates[0]
        if (!cand) continue
        const out = apply(quote, addLine(step.id, cand.line), '2026-01-01T00:00:00.000Z')
        if ('next' in out) quote = out.next
      }
      console.log('=====', key, quote.subjectLabel, 'lines', quote.lines.length, 'total', quoteTotals(quote).total)
      const onQuote = quote.lines.map((l) => ({ lineId: l.id, partnerTableId: l.entityId, rowId: l.rowId, label: l.label, amount: l.unitPrice }))
      console.log('ONQUOTE', JSON.stringify(onQuote.map(l => [l.partnerTableId, l.label.slice(0,45)])))
      const fit = selectPartners(ctx, TRAILER_FITMENT, table.id, row.id)
      if (!fit) { console.log('no fit'); continue }
      console.log('FIT', JSON.stringify({ marque: fit.marque?.name, cat: fit.catalogue, sel: fit.selected.length, un: fit.unnamed.length, rej: fit.rejected.length, floorW: fit.floorWarnings.length, notEval: fit.floorNotEvaluable }))
      const cas = fitmentCascade(fit, { label: quote.subjectLabel, amount: null }, onQuote, quoteTotals(quote).total, () => null)
      console.log('FITCASCADE', cas ? JSON.stringify({ title: cas.title, sub: cas.subtitle, removed: cas.removed, unchecked: cas.unchecked, alts: cas.alternatives, from: cas.from, to: cas.to, delta: cas.delta, accept: cas.accept }, null, 1) : 'NULL')

      // refinish to another material, then fitment on the NEW row
      const fin = readFinishes(ctx, quote)
      console.log('FINISHES', fin.model, fin.rows.length, JSON.stringify(fin.rows.map(f => [f.leaf, f.material, f.amount, f.delta])))
      const other = fin.rows.find((f) => !f.current && f.material !== fin.rows.find(x => x.current)?.material)
        ?? fin.rows.find((f) => !f.current)
      if (other) {
        const next = refinishSubject(ctx, quote, other.rowId)
        const fit2 = selectPartners(ctx, TRAILER_FITMENT, table.id, other.rowId)
        console.log('REFINISH to', other.label, 'delta', other.delta, 'newtotal', next ? quoteTotals(next).total : 'null')
        if (fit2 && next) {
          const oq = next.lines.map((l) => ({ lineId: l.id, partnerTableId: l.entityId, rowId: l.rowId, label: l.label, amount: l.unitPrice }))
          const c2 = fitmentCascade(fit2, { label: next.subjectLabel, amount: null }, oq, quoteTotals(quote).total, () => null)
          console.log('FITCASCADE2', c2 ? JSON.stringify({ removed: c2.removed, unchecked: c2.unchecked.map(u=>u.because), alts: c2.alternatives.length, from: c2.from, to: c2.to }, null, 1) : 'NULL')
        }
      }
    }
    expect(true).toBe(true)
  }, 200000)
})
