/* ============================================================
   THE PLATE, READ OFF THE REAL PRICE LIST — the SP660 board F was drawn
   on. Every figure is counted from the file; the sums are asserted so a
   reason can never lose or double-count a motor or a trailer.
   ============================================================ */
import { describe, expect, it, vi } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { rowLabel } from '@/domain/model'
import { readBoatFit, readWhole } from './boat'
import { pairColumns, pairRule } from '@/domain/rules/constraints/pairRules'
import {
  figuresOf,
  heldBack,
  loadOf,
  modelOf,
  motorHeld,
  motorTiles,
  plateLines,
  rulesHere,
  towOf,
  trailerHeld,
} from './plate'
import { motorHeldSaid, rulesHereSaid } from './say'

vi.setConfig({ testTimeout: 60_000 })

const pack = await loadPack()
const ctx = pack.ctx
const highfield = pack.byKey('boat_highfield')
const sp660 = (pack.rowsByEntity[highfield.id] ?? []).find(
  (r) => rowLabel(highfield, r) === 'Highfield - SP660 (PVC) W-W-WB',
)!
const fit = readBoatFit(ctx, { tableId: highfield.id, rowId: sp660.id })!

describe('the plate’s lines', () => {
  it('says the motor’s range, the trailers it is built for and what else is made for it', () => {
    const lines = plateLines(fit)
    expect(lines.map((l) => l.id)).toEqual(['motor', 'trailer', 'also'])
    expect(lines[0]).toMatchObject({ value: '150–200 hp', sub: 'one motor', offered: 7, of: 209 })
    expect(lines[1]).toMatchObject({
      value: 'built for Highfield',
      offered: 2,
      of: 434,
      note: 'one on a new quote',
    })
    /* the list's name, then its count: never '1 Dealer Fit Packages' (built-critique-m3.md) */
    expect(lines[2]!.value).toBe('Dealer Fit Packages 4 · Parts & Accessories 3')
  })

  it('carries no word of the price list’s own columns or cells', () => {
    const words = JSON.stringify(plateLines(fit))
    expect(words).not.toMatch(/Min HP|Max HP|Boat Module|Boat Weight|×/)
  })
})

describe('the motors made for it, on the boat’s range', () => {
  const tiles = motorTiles(ctx, fit)!

  it('says the maker once and each model without it', () => {
    expect(tiles.maker).toBe('Yamaha')
    expect(tiles.tiles.map((t) => t.model)).toEqual([
      'F175XC',
      'F175XCB',
      'F200XC',
      'F200XCB',
      'F200XCC',
      'F200XSA',
      'F200XSA2 · White',
    ])
    expect(modelOf('Yamaha F175XC', '')).toBe('Yamaha F175XC')
  })

  it('pins each horsepower on 150–200, and none of these is outside it', () => {
    expect(tiles.tiles.map((t) => [t.hp, t.at])).toEqual([
      [175, 0.5],
      [175, 0.5],
      [200, 1],
      [200, 1],
      [200, 1],
      [200, 1],
      [200, 1],
    ])
    expect(tiles.tiles.every((t) => t.outside === '')).toBe(true)
  })

  it('says the engine’s reason on a motor made for a boat outside the range it takes', () => {
    /* a 2.5 hp motor put on a boat that takes 150–200 hp is never "nothing wrong"
       (refine-critique-2.md, finding 11): the pairing list is given one, and the tile says why */
    const motor = fit.motor!
    const small = motor.dots.find((d) => d.hp === 2.5)!
    const made = { ...motor.made[0]!, key: small.key, place: small.place, name: small.name }
    const widened = { ...fit, motor: { ...motor, made: [...motor.made, made] } }
    const tile = motorTiles(ctx, widened)!.tiles.at(-1)!
    expect(tile.hp).toBe(2.5)
    expect(tile.at).toBe(0)
    expect(tile.outside).toBe('Under the 150–200 hp this boat takes.')
  })
})

describe('what is held back, by why', () => {
  it('groups the other 202 motors by four reasons that add up to every one on sale', () => {
    const held = motorHeld(ctx, fit)
    expect(held.map((h) => [h.id, h.count])).toEqual([
      ['under', 74],
      ['over', 51],
      ['inside', 30],
      ['rigs', 47],
    ])
    expect(fit.motor!.counts.made + held.reduce((n, h) => n + h.count, 0)).toBe(209)
  })

  it('strikes the nearest miss on each side of the range, and opens the boat’s own line', () => {
    const held = motorHeld(ctx, fit)
    const under = held.find((h) => h.id === 'under')!
    const over = held.find((h) => h.id === 'over')!
    expect(under.nearest && over.nearest).toBe(true)
    expect(under.example!.facts).toMatch(/^130 hp/)
    expect(over.example).toMatchObject({ name: 'Yamaha F225UCB', facts: '225 hp · 30″ shaft' })
    expect(over.door).toEqual({
      kind: 'boat',
      opens: { tableId: 'boat_highfield', at: 'boat_highfield:513' },
    })
    const inside = held.find((h) => h.id === 'inside')!
    expect(inside.door).toEqual({
      kind: 'pairing',
      opens: { tableId: 'join_hf_yam', find: 'Highfield - SP660 (PVC) W-W-WB' },
    })
  })

  it('says each reason in the same words Show all heads its group with', () => {
    const whole = readWhole(ctx, fit, 'motor')!
    for (const h of motorHeld(ctx, fit)) {
      const group = whole.groups.find((g) => g.id === h.id)!
      expect(group.head).toBe(h.because)
      expect(group.rows).toHaveLength(h.count)
    }
    expect(motorHeldSaid('over', '150–200 hp', '')).toBe('Over the 150–200 hp this boat takes.')
  })

  it('groups the other 432 trailers by three reasons, the makers counted under one', () => {
    const held = trailerHeld(fit)
    expect(held.map((h) => [h.id, h.count])).toEqual([
      ['this', 10],
      ['another', 131],
      ['unnamed', 291],
    ])
    expect(2 + held.reduce((n, h) => n + h.count, 0)).toBe(fit.trailer!.onSale)
    const another = held.find((h) => h.id === 'another')!
    expect(another.makers.reduce((n, m) => n + m.count, 0)).toBe(131)
    expect(another.door?.kind).toBe('series')
  })

  it('strikes an example only where its reason holds it off the boat, never under "not ruled out"', () => {
    /* built-critique-m3.md, major 5: the 291 whose series names no maker are not ruled out
       (trailerFitment.ts, SeriesVerdict), and their example was drawn struck */
    const held = trailerHeld(fit)
    expect(held.map((h) => [h.id, h.struck])).toEqual([
      ['this', true],
      ['another', true],
      ['unnamed', false],
    ])
    expect(held.find((h) => h.id === 'unnamed')!.because).toMatch(/not ruled out/)
    expect(motorHeld(ctx, fit).every((h) => h.struck)).toBe(true)
  })

  it('says what the dealer’s rules do here in one line, and nothing where one refuses', () => {
    expect(rulesHere(fit, motorHeld(ctx, fit), 'motor')).toBe(rulesHereSaid(0, 0, 'motor'))
    /* the line speaks of its own place: a rule refusing a motor here leaves the trailer's foot
       true only if it says "a trailer", never "anything on this boat" (built-m3-2.md) */
    expect(rulesHereSaid(3, 0, 'trailer')).toBe(
      'None of your rules refuses a trailer on this boat.',
    )
    expect(rulesHereSaid(3, 0, 'motor')).toBe('None of your rules refuses a motor on this boat.')
    expect(rulesHereSaid(3, 1, 'motor')).toBe('')
  })
})

/* ONE SUBTRACTION, NOT TWO COUNTS (built-critique-m3-2.md, blocker 1). The screen summed "The
   other 207" out of the reasons while the plate's "2 of 209" came from here, so the two could
   drift. Both are now read off `figuresOf`, and the reasons are asserted to add up to it, on the
   SP660 and on the critic's own Classic 340 with the tiller rule on. */
describe('the other n, and why: the plate’s own figures', () => {
  const boatCols = pairColumns(ctx, 'boat')
  const motorCols = pairColumns(ctx, 'motor')
  const tiller = pairRule({
    orgId: 'northside',
    boat: { column: boatCols.find((c) => c.name === 'steering')!, op: 'eq', value: 'Tiller' },
    partnerKind: 'motor',
    partner: {
      column: motorCols.find((c) => c.name === 'controls')!,
      op: 'eq',
      value: 'Tiller handle',
    },
    because: 'a tiller boat has no helm to steer a remote motor from',
    severity: 'block',
    enabled: true,
    now: '2026-10-22T09:00:00.000Z',
  })
  const ruledCtx = { ...ctx, constraintDefs: [tiller] }
  const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
    (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
  )!
  const ruled = readBoatFit(ruledCtx, { tableId: highfield.id, rowId: cl340.id })!

  it('heads the reasons with of − offered, the plate line’s own pair', () => {
    const lines = plateLines(fit)
    for (const place of ['motor', 'trailer'] as const) {
      const line = lines.find((l) => l.id === place)!
      expect(figuresOf(fit, place)).toEqual({ offered: line.offered, of: line.of })
      expect(heldBack(ctx, fit, place).others).toBe(line.of - line.offered)
    }
    expect(heldBack(ctx, fit, 'motor').others).toBe(202)
    expect(heldBack(ctx, fit, 'trailer').others).toBe(432)
  })

  it('says 2 of 209 and the other 207 on the Classic 340 with the rule on, the refused one among them', () => {
    const motor = plateLines(ruled).find((l) => l.id === 'motor')!
    expect([motor.offered, motor.of]).toEqual([2, 209])
    const held = heldBack(ruledCtx, ruled, 'motor')
    expect(held.others).toBe(207)
    expect(held.groups[0]).toMatchObject({ id: 'ruled', count: 1 })
  })

  it('adds the reasons up to the others, and their shares to the whole gauge', () => {
    for (const [c, f] of [
      [ctx, fit],
      [ruledCtx, ruled],
    ] as const) {
      for (const place of ['motor', 'trailer'] as const) {
        const held = heldBack(c, f, place)
        expect(held.groups.reduce((n, h) => n + h.count, 0)).toBe(held.others)
        if (held.others > 0) expect(held.groups.reduce((n, h) => n + h.share, 0)).toBeCloseTo(1, 9)
      }
    }
  })
})

describe('what goes on the trailer', () => {
  const load = loadOf(ctx, fit)

  it('is the boat and the motor on a new quote, each weighed off the price list', () => {
    expect(load).toMatchObject({ kg: 960, towed: false, motor: 'F175XC' })
    expect(load.parts).toEqual([
      { said: 'the Highfield Sport 660', kg: 740 },
      { said: 'its F175XC', kg: 220 },
    ])
    expect(load.says).toBe(
      'The Highfield Sport 660, 740 kg, and its F175XC, 220 kg: 960 kg on the trailer, before fuel and gear.',
    )
  })

  it('sets each ATM against the load and the trailer’s own weight, never the bare hull', () => {
    const [redco, gfab] = fit.trailer!.made.map((t) => towOf(ctx, load, t))
    expect(redco).toMatchObject({ rated: 1990, own: 380, total: 1340, standing: 'clears' })
    expect(redco!.says).toBe(
      'Rated 1,990 kg. With its own weight, 380 kg by the price list, 1,340 kg on the road: 650 kg to spare.',
    )
    /* the GFAB's own weight on the price list is 1,990 kg against an ATM of 2,200: what the list
       says is said, with its source, and the trailer stays offered (a warning, never a removal) */
    expect(gfab).toMatchObject({ rated: 2200, own: 1990, total: 2950, standing: 'over' })
    expect(gfab!.says).toContain('750 kg over it')
    expect(JSON.stringify([redco, gfab])).not.toContain('1,250')
  })
})
