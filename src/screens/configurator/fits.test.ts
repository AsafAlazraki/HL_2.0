/* ============================================================
   WHAT FITS, AS THE BUILD READS IT — against the real pack. Every
   figure and sentence is the price file's, read through What fits'
   own reading (src/domain/fitment/boat.ts). A failure is a port bug.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { rowLabel, type QuoteDef } from '@/domain/model'
import { mintQuote } from '@/domain/quote'
import { boatCodeOf, boatTitleOf, motorFitOf, namedForBoat, saidAs } from './fits'

const pack = await loadPack()
const ctx = pack.ctx
const highfield = pack.byKey('boat_highfield')
const yamaha = pack.byKey('mot_yamaha')
const gfab = pack.byKey('trl_gfab')

function quoteOn(label: string): QuoteDef {
  const row = (pack.rowsByEntity[highfield.id] ?? []).find((r) => rowLabel(highfield, r) === label)
  expect(row, label).toBeDefined()
  const view = createViewFor(ctx, highfield.id)
  return mintQuote(ctx, {
    viewId: view.id,
    rowId: row!.id,
    reference: 'NSM-TEST',
    hullAlone: true,
  })!.quote
}

const motor = (code: string): { tableId: string; rowId: string } => {
  const row = (pack.rowsByEntity[yamaha.id] ?? []).find(
    (r) => rowLabel(yamaha, r) === `Yamaha - ${code}`,
  )
  expect(row, code).toBeDefined()
  return { tableId: yamaha.id, rowId: row!.id }
}

const pa600 = quoteOn('Highfield - PA600 Open (PVC) LG-W-DG')

describe('a motor on the build says what What fits says of it', () => {
  it('refuses the 20″ F115LB on the PA600’s 25″ transom, with its reason', () => {
    const said = motorFitOf(ctx, pa600, motor('F115LB'))
    expect(said).toEqual({
      why: 'Inside the 115–150 hp this boat takes, but its shaft is not the extra-long (25″) this boat’s transom takes.',
      refuses: true,
    })
  })

  it('refuses one over and one under the 115–150 hp the boat takes', () => {
    expect(motorFitOf(ctx, pa600, motor('F175LB'))).toEqual({
      why: 'Over the 115–150 hp this boat takes.',
      refuses: true,
    })
    expect(motorFitOf(ctx, pa600, motor('F2.5SMHB'))?.refuses).toBe(true)
  })

  it('lets one inside the range that the price list does not list go on, and says so', () => {
    expect(motorFitOf(ctx, pa600, motor('LF115XB'))).toEqual({
      why: 'Inside the 115–150 hp this boat takes, but the price list does not list it for this boat.',
      refuses: false,
    })
  })

  it('says nothing of a motor offered on the boat', () => {
    expect(motorFitOf(ctx, pa600, motor('F115XB'))).toBeNull()
  })
})

describe('the boat, as What fits titles it', () => {
  it('is the Highfield Patrol 600, with Open under it, never "Patrol 600 Open"', () => {
    const title = boatTitleOf(ctx, pa600)
    expect(title.name).toBe('Highfield Patrol 600')
    expect(title.short).toBe('Patrol 600')
    expect(title.detail).toBe('Open · PVC · Light Grey / White / Dark Grey')
  })
})

describe('a line named for the boat', () => {
  it('reads the PA600’s code where the price list files it', () => {
    expect(boatCodeOf(ctx, pa600)).toBe('PA600')
  })

  it('carries the code as a word of its own, never inside another', () => {
    expect(namedForBoat('GFAB Tandem Axel Trailer t/s Highfield PA600', 'PA600')).toBe(true)
    expect(namedForBoat('Sundeck for PA600EW', 'PA600')).toBe(false)
  })
})

describe('a model’s name typed where the list writes its code', () => {
  it('asks GFAB for the PA600 when "Patrol 600" or "Patrol" is typed', () => {
    expect(saidAs(ctx, gfab.id, 'Patrol 600')).toEqual([{ query: 'pa600', code: 'PA600' }])
    expect(saidAs(ctx, gfab.id, 'Patrol').map((s) => s.code)).toContain('PA600')
  })

  it('asks nothing for a word the list already uses, or a figure alone', () => {
    expect(saidAs(ctx, gfab.id, 'Tandem')).toEqual([])
    expect(saidAs(ctx, gfab.id, '600')).toEqual([])
  })
})
