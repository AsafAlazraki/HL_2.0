/* ============================================================
   THE HORSEPOWER ENVELOPE, ON THE REAL PRICE LIST.

   The refinement critic's case is the first one asserted: a Yamaha
   F2.5SMHB, 2.5 hp, offered under Show all on a Formosa GRT 425 whose own
   row says 40–60 hp, read "Nothing is wrong with it" (refine-critique-2.md,
   11). The engine now reads the envelope and says the fact, and the build's
   own offer carries that sentence rather than the curated one.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { rowLabel } from '@/domain/model'
import type { EntityDef, RowData } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView, stepOffer } from '@/domain/quote/freeze'
import { envelopeOf, measureMotorOnBoat, measureRig, readRigs, rigOf } from './envelope'
import { envelopeSaid, hullEnvelopeSaid, sayVerdict } from './say'

const pack = await loadPack()
const rowNamed = (table: EntityDef, label: string): RowData => {
  const row = (pack.rowsByEntity[table.id] ?? []).find((r) => rowLabel(table, r) === label)
  if (!row) throw new Error(`no ${label} on ${table.name}`)
  return row
}

const formosa = pack.byKey('boat_formosa')
const highfield = pack.byKey('boat_highfield')
const yamaha = pack.byKey('mot_yamaha')
const grt425 = rowNamed(formosa, 'Formosa - GRT 425 (Tiller)')
const sp660 = rowNamed(highfield, 'Highfield - SP660 (PVC) W-W-WB')
const f25 = rowNamed(yamaha, 'Yamaha - F2.5SMHB')

describe('a cell read as rigs', () => {
  it('reads a number, a text, a twin and the alternatives a boat names', () => {
    expect(readRigs(150)).toEqual([{ count: 1, each: 150 }])
    expect(readRigs('150 HP')).toEqual([{ count: 1, each: 150 }])
    expect(readRigs('2.5')).toEqual([{ count: 1, each: 2.5 }])
    expect(readRigs('2 x 225')).toEqual([{ count: 2, each: 225 }])
    expect(readRigs('2 x 300HP')).toEqual([{ count: 2, each: 300 }])
    expect(readRigs('350 / 2 x 200 HP')).toEqual([
      { count: 1, each: 350 },
      { count: 2, each: 200 },
    ])
  })

  it('invents nothing where the cell is not a horsepower', () => {
    expect(readRigs('Electric')).toEqual([])
    expect(readRigs('TBA')).toEqual([])
    expect(readRigs(null)).toEqual([])
    expect(readRigs('')).toEqual([])
  })
})

describe('a boat’s own envelope', () => {
  it('reads the SP660 as 150–200 hp from its own Min HP and Max HP', () => {
    const env = envelopeOf(highfield, sp660)
    expect(env?.rigs).toEqual([{ count: 1, min: 150, max: 200 }])
    expect(env && hullEnvelopeSaid(env)).toBe('150–200 hp')
  })

  it('keeps a twin envelope apart from the single one, and says a bound it lacks as absent', () => {
    const sp800 = (pack.rowsByEntity[highfield.id] ?? []).find((r) =>
      rowLabel(highfield, r).startsWith('Highfield - SP800 (HYP)'),
    )!
    const env = envelopeOf(highfield, sp800)
    expect(env?.rigs).toEqual([
      { count: 1, min: 250, max: 350 },
      { count: 2, min: null, max: 200 },
    ])
    expect(env && hullEnvelopeSaid(env)).toBe('250–350 hp, or 2 × up to 200 hp')
  })

  it('says each shape of envelope in the trade’s words', () => {
    expect(envelopeSaid({ count: 1, min: 40, max: 60 })).toBe('40–60 hp')
    expect(envelopeSaid({ count: 1, min: 20, max: 20 })).toBe('20 hp')
    expect(envelopeSaid({ count: 1, min: null, max: 250 })).toBe('up to 250 hp')
    expect(envelopeSaid({ count: 2, min: 300, max: 350 })).toBe('2 × 300–350 hp')
  })
})

describe('a motor measured against a boat', () => {
  it('puts the 2.5 hp Yamaha under the GRT 425’s 40–60 hp, with the reason said', () => {
    const standing = measureMotorOnBoat(
      pack.ctx,
      { tableId: formosa.id, rowId: grt425.id },
      { tableId: yamaha.id, rowId: f25.id },
    )
    expect(standing.kind).toBe('outside')
    if (standing.kind !== 'outside') return
    expect(standing.side).toBe('under')
    expect(standing.verdict).toEqual({ kind: 'outside-envelope', hp: 2.5, min: 40, max: 60 })
    expect(sayVerdict(standing.verdict)).toBe('Under the 40–60 hp this boat takes.')
  })

  it('finds a 175 hp motor inside the SP660 and a 250 over it', () => {
    const env = envelopeOf(highfield, sp660)
    expect(measureRig(env, { count: 1, each: 175 }).kind).toBe('inside')
    const over = measureRig(env, { count: 1, each: 250 })
    expect(over.kind === 'outside' && over.side).toBe('over')
    if (over.kind === 'outside') {
      expect(sayVerdict(over.verdict)).toBe('Over the 150–200 hp this boat takes.')
    }
  })

  it('never calls a twin outside a boat that names no twin envelope', () => {
    const env = envelopeOf(highfield, sp660)
    expect(measureRig(env, { count: 2, each: 225 }).kind).toBe('unstated')
    expect(measureRig(null, { count: 1, each: 2.5 }).kind).toBe('unstated')
  })

  it('reads every Yamaha’s own rating, and no ePropulsion as a horsepower', () => {
    const live = pack.rowsByEntity[yamaha.id] ?? []
    expect(live.filter((r) => rigOf(yamaha, r) === null)).toHaveLength(0)
    const electric = pack.byKey('mot_epropulsion')
    expect((pack.rowsByEntity[electric.id] ?? []).every((r) => rigOf(electric, r) === null)).toBe(
      true,
    )
  })
})

describe('where the motor is offered, the build says it', () => {
  it('replaces "nothing is wrong with it" with the envelope for the GRT 425’s 2.5 hp', () => {
    const ctx = { ...pack.ctx, views: { ...pack.ctx.views } }
    const view = createViewFor(ctx, formosa.id)
    const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: grt425.id, reference: 'T-1' })!
    const section = quote.sections.find((s) => s.tableId === yamaha.id)!
    const offer = stepOffer(ctx, quote, section, { all: true })
    const small = offer.candidates.find((c) => c.line.rowId === f25.id)
    expect(small?.outside).toBe(true)
    expect(small?.outsideWhy).toBe('Under the 40–60 hp this boat takes.')
    expect(small?.outsideWhy).not.toContain('Nothing is wrong')
  })
})
