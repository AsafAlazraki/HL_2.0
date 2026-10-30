/* ============================================================
   WHAT GOES ON A BOAT, CHANGED ON THE REAL PRICE LIST — a motor
   put on and taken off the SP660, read back through the same plate
   the screen draws, each one step whose way back gives the plate
   back as it was.
   ============================================================ */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { makeCtx, rowLabel, type CatalogueCtx, type RowData } from '@/domain/model'
import { emptySheet, indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { isDone, type Done } from '@/domain/catalogue/commands'
import { readBoatFit, readWhole, type BoatFit } from './boat'
import { changeFit } from './change'

vi.setConfig({ testTimeout: 60_000 })

const NOW = new Date(2026, 9, 30, 12).toISOString()

let pack: PackFixture
let sheet: CatalogueData
let place: { tableId: string; rowId: string }

const ctxOf = (data: CatalogueData): CatalogueCtx =>
  makeCtx({ ...pack.ctx, rowsByEntity: data.rows, orgId: 'northside' })
const fitOf = (data: CatalogueData): BoatFit => readBoatFit(ctxOf(data), place)!

function run(
  data: CatalogueData,
  fit: BoatFit,
  target: { tableId: string; rowId: string },
  way: 'on' | 'off',
): Done {
  const change = changeFit(ctxOf(data), fit, target, way)
  if ('refused' in change) throw new Error(`refused: ${change.refused}`)
  const out = change.command(data, NOW)
  if (!isDone(out)) throw new Error(`refused: ${out.refused}`)
  return out
}

beforeAll(async () => {
  pack = await loadPack()
  const rows: Record<string, RowData[]> = {}
  for (const e of pack.entities) rows[e.id] = [...(pack.rowsByEntity[e.id] ?? [])]
  sheet = {
    ...emptySheet(),
    orgId: 'northside',
    tables: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
    rows,
    index: indexRows(rows),
  }
  const highfield = pack.byKey('boat_highfield')
  const sp660 = (pack.rowsByEntity[highfield.id] ?? []).find(
    (r) => rowLabel(highfield, r) === 'Highfield - SP660 (PVC) W-W-WB',
  )!
  place = { tableId: highfield.id, rowId: sp660.id }
})

describe('putting a motor on a boat, and taking it off', () => {
  it('puts a motor inside the horsepower on, as one step with its way back', () => {
    const fit = fitOf(sheet)
    const inside = fit.motor!.dots.find((d) => d.standing === 'inside')!
    expect(inside).toBeDefined()
    const made = fit.motor!.made.length

    const done = run(sheet, fit, inside.place, 'on')
    expect(done.said).toBe(`The ${inside.name} now goes on the ${fit.name}.`)
    const after = fitOf(done.next)
    expect(after.motor!.made.map((m) => m.place.rowId)).toContain(inside.place.rowId)
    expect(after.motor!.made.length).toBe(made + 1)

    const back = done.inverse(done.next, NOW)
    if (!isDone(back)) throw new Error('the way back was refused')
    expect(back.said).toBe(`The ${inside.name} is taken off what goes on the ${fit.name}.`)
    expect(fitOf(back.next).motor!.made.length).toBe(made)
  })

  it('takes a motor made for the boat off, keeping its pairing as a row', () => {
    const fit = fitOf(sheet)
    const first = fit.motor!.made[0]!
    const pairs = (sheet.rows[first.pairing?.tableId ?? ''] ?? []).length

    const done = run(sheet, fit, first.place, 'off')
    const after = fitOf(done.next)
    expect(after.motor!.made.map((m) => m.place.rowId)).not.toContain(first.place.rowId)
    /* the pair is marked, never deleted: its rigging kit and prop are still on the list */
    expect((done.next.rows[first.pairing?.tableId ?? ''] ?? []).length).toBe(pairs)

    const again = run(done.next, after, first.place, 'on')
    expect(fitOf(again.next).motor!.made.map((m) => m.place.rowId)).toContain(first.place.rowId)
  })

  it('refuses a motor over the horsepower the boat takes, with the reason', () => {
    const fit = fitOf(sheet)
    const over = fit.motor!.dots.find((d) => d.standing === 'over')!
    const change = changeFit(ctxOf(sheet), fit, over.place, 'on')
    expect(change).toEqual({
      refused: `The ${over.name} is over the ${fit.motor!.takes} the ${fit.name} takes, so it is not put on. The boat’s own horsepower decides that.`,
    })
  })

  it('puts a part from the whole list on, and the whole list reads it as offered', () => {
    const fit = fitOf(sheet)
    const parts = fit.lists.find((l) => l.pairingTableId !== null && l.kind === 'accessory')!
    const whole = readWhole(ctxOf(sheet), fit, parts.tableId)!
    const rest = whole.groups.find((g) => g.id === 'rest')!.rows[0]!
    const done = run(sheet, fit, rest.place, 'on')
    const again = readWhole(ctxOf(done.next), fitOf(done.next), parts.tableId)!
    expect(again.made).toBe(whole.made + 1)
  })
})
