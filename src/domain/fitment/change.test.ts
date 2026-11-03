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
import { changeFit, starFit } from './change'
import { versionsOf } from './versions'

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

/* THE FITMENT JUDGE, 2026-11-03: "Take it off" said the whole Sport 660 and changed one of its
   sixteen versions; a 2.5 hp went onto a 150–200 hp boat; the recommended could not be set here */
describe('on every version of the model, counted', () => {
  const versionsOfSp660 = () => {
    const model = versionsOf(ctxOf(sheet), place)!
    return model.versions.map((v) => v.place)
  }

  it('takes a motor off all sixteen Sport 660s in one step, and gives all sixteen back', () => {
    const fit = fitOf(sheet)
    const xcc = fit.motor!.made.find((m) => m.name === 'Yamaha F200XCC')!
    const versions = versionsOfSp660()
    expect(versions).toHaveLength(16)
    const change = changeFit(ctxOf(sheet), fit, xcc.place, 'off', versions)
    if ('refused' in change) throw new Error(change.refused)
    expect(change.said).toBe(
      'The Yamaha F200XCC is taken off the Highfield Sport 660, on all 16 of its versions.',
    )
    const done = change.command(sheet, NOW)
    if (!isDone(done)) throw new Error('refused')
    const carrying = (data: CatalogueData) =>
      versions.filter((v) =>
        readBoatFit(ctxOf(data), v)!.motor!.made.some((m) => m.name === 'Yamaha F200XCC'),
      ).length
    expect(carrying(done.next)).toBe(0)
    const back = done.inverse(done.next, NOW)
    if (!isDone(back)) throw new Error('the way back was refused')
    expect(back.said).toBe(
      'The Yamaha F200XCC goes on the Highfield Sport 660 again, on all 16 of its versions.',
    )
    expect(carrying(back.next)).toBe(16)
  })

  it('refuses a motor under the horsepower the boat takes, with the reason', () => {
    const fit = fitOf(sheet)
    const under = fit.motor!.dots.find((d) => d.name === 'Yamaha F2.5SMHB')!
    expect(changeFit(ctxOf(sheet), fit, under.place, 'on', versionsOfSp660())).toEqual({
      refused:
        'The Yamaha F2.5SMHB is under the 150–200 hp the Highfield Sport 660 takes, so it is not put on. The boat’s own horsepower decides that.',
    })
  })

  it('makes the F200XC the recommended motor on every version, and the F175XC loses its star', () => {
    const fit = fitOf(sheet)
    const f200xc = fit.motor!.made.find((m) => m.name === 'Yamaha F200XC')!
    const versions = versionsOfSp660()
    const star = starFit(ctxOf(sheet), fit, f200xc.place, 'motor', versions)
    if ('refused' in star) throw new Error(star.refused)
    expect(star.said).toBe(
      'The Yamaha F200XC is now the recommended motor for the Highfield Sport 660, on all 16 of its versions: a new quote starts with it.',
    )
    const done = star.command(sheet, NOW)
    if (!isDone(done)) throw new Error('refused')
    for (const v of versions) {
      const starred = readBoatFit(ctxOf(done.next), v)!.motor!.made.filter((m) => m.starred)
      expect(starred.map((m) => m.name)).toEqual(['Yamaha F200XC'])
    }
    const back = done.inverse(done.next, NOW)
    if (!isDone(back)) throw new Error('the way back was refused')
    expect(
      readBoatFit(ctxOf(back.next), place)!
        .motor!.made.filter((m) => m.starred)
        .map((m) => m.name),
    ).toEqual(['Yamaha F175XC'])
  })

  it('makes the GFAB the recommended trailer across both trailer lists', () => {
    const fit = fitOf(sheet)
    const gfab = fit.trailer!.made.find((t) => !t.starred)!
    const star = starFit(ctxOf(sheet), fit, gfab.place, 'trailer', versionsOfSp660())
    if ('refused' in star) throw new Error(star.refused)
    const done = star.command(sheet, NOW)
    if (!isDone(done)) throw new Error('refused')
    const after = readBoatFit(ctxOf(done.next), place)!
    expect(after.trailer!.made.filter((t) => t.starred).map((t) => t.key)).toEqual([gfab.key])
    expect(after.trailer!.made.find((t) => t.crosses)?.key).toBe(gfab.key)
  })

  it('refuses to recommend what is not made for the boat', () => {
    const fit = fitOf(sheet)
    const over = fit.motor!.dots.find((d) => d.standing === 'over')!
    expect(starFit(ctxOf(sheet), fit, over.place, 'motor')).toEqual({
      refused: `The ${over.name} is not made for the Highfield Sport 660, so it cannot be its recommended motor.`,
    })
  })
})
