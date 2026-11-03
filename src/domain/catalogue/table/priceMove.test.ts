import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, FieldDef } from '@/domain/model'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { viewRowsOf } from './outline'
import { moved, moveSaid, moveWrite, planMove, readMove } from './priceMove'

let pack: PackFixture
beforeAll(async () => {
  pack = await loadPack()
})

const field = (t: EntityDef, name: string): FieldDef => t.fields.find((f) => f.name === name)!
const NOUN = { one: 'variant', many: 'variants' }

describe('a move on many figures', () => {
  it('raises by a share to the cent, adds an amount, and rounds to the nearest step', () => {
    expect(moved(2770, { kind: 'percent', by: 4 })).toBe(2880.8)
    expect(moved(2770, { kind: 'add', by: 100 })).toBe(2870)
    expect(moved(2883, { kind: 'round', to: 10 })).toBe(2880)
    expect(moved(2885, { kind: 'round', to: 10 })).toBe(2890)
  })

  it('reads what a person typed, and says why not where it cannot', () => {
    expect(readMove('percent', '+4%')).toEqual({ kind: 'percent', by: 4 })
    expect(readMove('add', '−$50')).toEqual({ kind: 'add', by: -50 })
    expect(readMove('round', '10')).toEqual({ kind: 'round', to: 10 })
    expect(readMove('percent', '')).toEqual({ refused: 'Type how much first.' })
    expect(readMove('percent', 'abc')).toEqual({ refused: '“abc” is not a number.' })
    expect(readMove('percent', '-100')).toHaveProperty('refused')
    expect(readMove('round', '0')).toHaveProperty('refused')
  })

  it('plans every selected Highfield Cash before and after, and writes it as one step', () => {
    const hf = pack.byKey('boat_highfield')
    const rows = viewRowsOf(hf, pack.rowsByEntity.boat_highfield ?? [])
    const cash = field(hf, 'Cash')
    const picked = [0, 1, 2, 3]
    const plan = planMove(rows, cash, picked, { kind: 'percent', by: 4 })
    const filled = picked.filter((i) => typeof rows[i]!.values[cash.id] === 'number')
    expect(plan.lines.length + plan.same).toBe(filled.length)
    expect(plan.blank).toBe(picked.length - filled.length)
    for (const l of plan.lines) expect(l.after).toBe(moved(l.before, { kind: 'percent', by: 4 }))
    const w = moveWrite(hf, cash, plan, { kind: 'percent', by: 4 }, NOUN)
    expect('command' in w && w.cells).toBe(plan.lines.length)
    expect(moveSaid({ kind: 'percent', by: 4 })).toBe('raised 4 %')
    expect(moveSaid({ kind: 'add', by: -50 })).toBe('$50 taken off')
  })

  it('refuses whole a move that would take a line below nothing', () => {
    const hf = pack.byKey('boat_highfield')
    const rows = viewRowsOf(hf, pack.rowsByEntity.boat_highfield ?? [])
    const cash = field(hf, 'Cash')
    const plan = planMove(rows, cash, [0], { kind: 'add', by: -10_000_000 })
    expect(plan.negative).toBe(1)
    expect(moveWrite(hf, cash, plan, { kind: 'add', by: -10_000_000 }, NOUN)).toEqual({
      refused: '1 line would go below $0, so nothing was changed.',
    })
  })
})
