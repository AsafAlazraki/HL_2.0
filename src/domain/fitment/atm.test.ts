/* ============================================================
   A TRAILER OVER ITS ATM, ON THE REAL PRICE LIST — the SP660's GFAB,
   2,950 kg on the road against its 2,200 kg ATM, is refused for the
   quote, for the recommended and on the quote the plate starts; the
   REDCO, which clears it, is refused nothing.
   ============================================================ */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { makeCtx, rowLabel, type CatalogueCtx } from '@/domain/model'
import { isDone } from '@/domain/catalogue/commands'
import { emptySheet, indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { offeredIn, readBoatFit, type BoatFit } from './boat'
import { atmRefusal, atmSaid, overAtm } from './atm'
import { starFit } from './change'
import { finishSaid } from './finish'
import { versionsOf } from './versions'
import { compareOf, riggedOf } from './rigged'

vi.setConfig({ testTimeout: 60_000 })

let pack: PackFixture
let ctx: CatalogueCtx
let fit: BoatFit

beforeAll(async () => {
  pack = await loadPack()
  ctx = makeCtx({ ...pack.ctx, orgId: 'northside' })
  const highfield = pack.byKey('boat_highfield')
  const sp660 = (pack.rowsByEntity[highfield.id] ?? []).find(
    (r) => rowLabel(highfield, r) === 'Highfield - SP660 (PVC) W-W-WB',
  )!
  fit = readBoatFit(ctx, { tableId: highfield.id, rowId: sp660.id })!
})

describe('a trailer over its ATM', () => {
  it('finds the GFAB over and the REDCO clear, on the plate’s own weighing', () => {
    const [redco, gfab] = fit.trailer!.made
    expect(overAtm(ctx, fit, redco!)).toBeNull()
    expect(overAtm(ctx, fit, gfab!)).toMatchObject({ rated: 2200, total: 2950, standing: 'over' })
  })

  it('refuses the GFAB for the quote and leaves it off the quote started here, with its figures', () => {
    const gfab = fit.trailer!.made[1]!
    expect(atmRefusal(ctx, fit, gfab, 'quote')).toBe(
      `The ${gfab.name} is rated 2,200 kg and would carry 2,950 kg, 750 kg over, so it is not put on the quote. Its ATM decides that.`,
    )
    expect(atmRefusal(ctx, fit, gfab, 'start')).toBe(
      `The ${gfab.name} is rated 2,200 kg and would carry 2,950 kg, 750 kg over, so it is left off this quote. Its ATM decides that.`,
    )
  })

  it('refuses nothing for a trailer that clears its ATM', () => {
    const redco = fit.trailer!.made[0]!
    expect(atmRefusal(ctx, fit, redco, 'quote')).toBe('')
    expect(atmRefusal(ctx, fit, redco, 'star')).toBe('')
  })

  it('says nothing is decided where nothing is weighed', () => {
    expect(
      atmSaid(
        'X',
        { key: 'x', rated: 1000, own: 100, total: 1200, standing: 'over', says: '' },
        'star',
      ),
    ).toBe(
      'The X is rated 1,000 kg and would carry 1,200 kg, 200 kg over, so it is not made the recommended trailer. Its ATM decides that.',
    )
  })

  it('still makes a trailer that clears its ATM the recommended', () => {
    /* the Stacer 399 Territory Striker L/S offers a second trailer that clears what it carries */
    const place = { tableId: pack.byKey('boat_stacer').id, rowId: 'boat_stacer:9' }
    const f = readBoatFit(ctx, place)!
    const other = offeredIn(f.trailer!.made).find((t) => !t.starred)!
    expect(overAtm(ctx, f, other)).toBeNull()
    const versions = versionsOf(ctx, f.place)!.versions.map((v) => v.place)
    const star = starFit(ctx, f, other.place, 'trailer', versions)
    if ('refused' in star) throw new Error(star.refused)
    const data: CatalogueData = {
      ...emptySheet(),
      orgId: 'northside',
      tables: Object.fromEntries(pack.entities.map((e) => [e.id, e])),
      rows: pack.rowsByEntity,
      index: indexRows(pack.rowsByEntity),
    }
    const done = star.command(data, new Date(2026, 10, 3).toISOString())
    if (!isDone(done)) throw new Error(done.refused)
    const after = readBoatFit(makeCtx({ ...pack.ctx, rowsByEntity: done.next.rows }), place)!
    expect(after.trailer!.made.filter((t) => t.starred).map((t) => t.key)).toEqual([other.key])
  })

  it('never leaves the trailer a new quote starts with over its ATM, on any boat on the list', () => {
    /* measured 2026-11-03: of 810 boats, 51 offered trailers are over their ATM and none of them
       is the one a new quote starts with, so the Trailer line's "one on a new quote" stays true */
    let over = 0
    for (const e of pack.entities) {
      if (e.kind !== 'boat') continue
      for (const r of pack.rowsByEntity[e.id] ?? []) {
        const f = readBoatFit(ctx, { tableId: e.id, rowId: r.id })
        for (const t of f?.trailer ? offeredIn(f.trailer.made) : []) {
          if (!overAtm(ctx, f!, t)) continue
          over += 1
          expect(t.crosses).toBe(false)
        }
      }
    }
    expect(over).toBe(51)
  })
})

describe('the words the verifier found raw or out of case', () => {
  it('names an unread colourway as the code it is, never bare', () => {
    expect(
      finishSaid({
        trim: '',
        material: 'Hypalon',
        colour: { code: 'I-B-C', parts: [], say: 'I-B-C', read: false },
        detail: 'Hypalon · I-B-C',
      }),
    ).toBe('Hypalon · colour code I-B-C')
    expect(
      finishSaid({
        trim: '',
        material: 'PVC',
        colour: { code: 'W-W-WB', parts: [], say: 'White / White / White/Blue', read: true },
        detail: 'PVC · White / White / White/Blue',
      }),
    ).toBe('PVC · White / White / White/Blue')
  })

  it('says the SP660’s Hypalon I-B-C version by its code in its version list', () => {
    const model = versionsOf(ctx, fit.place)!
    const ibc = model.versions.filter((v) => v.detail.includes('I-B-C'))
    expect(ibc.length).toBeGreaterThan(0)
    for (const v of ibc) expect(v.detail).toBe('Hypalon · colour code I-B-C')
  })

  it('begins the compare’s shaft cells with a capital, as the plate does', () => {
    const shaft = compareOf(ctx, riggedOf(ctx, fit)).find((r) => r.label === 'Shaft')!
    expect(shaft.cells.every((c) => c === '—' || /^[A-Z0-9]/.test(c))).toBe(true)
    expect(shaft.cells).toContain('Extra-long (25″)')
  })
})
