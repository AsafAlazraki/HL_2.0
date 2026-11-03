import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, FieldDef } from '@/domain/model'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { viewRowsOf } from './outline'
import {
  moved,
  moveSaid,
  moveWrite,
  planMove,
  planRefusal,
  planTwin,
  readMove,
  twinText,
} from './priceMove'

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

describe('before the press, and a line from its twin', () => {
  it('says before the press why a move below nothing cannot be made', () => {
    const hf = pack.byKey('boat_highfield')
    const rows = viewRowsOf(hf, pack.rowsByEntity.boat_highfield ?? [])
    const cash = field(hf, 'Cash')
    const under = planMove(rows, cash, [0, 1], { kind: 'add', by: -10_000_000 })
    expect(planRefusal(under)).toBe(
      '2 lines would go below $0, so this change cannot be made. Nothing is written while any would.',
    )
    expect(planRefusal(planMove(rows, cash, [0, 1], { kind: 'add', by: 100 }))).toBeNull()
  })

  it('names the same line in the base material, the leading word swapped where it stands', () => {
    const split = { fieldId: 'v', words: ['PVC', 'HYP'] }
    expect(twinText(split, 'HYP B-G-B', 'PVC')).toBe('PVC B-G-B')
    expect(twinText(split, 'Open (HYP) LG-W-DG', 'PVC')).toBe('Open (PVC) LG-W-DG')
    expect(twinText(split, 'PVC WH', 'PVC')).toBe('PVC WH')
    expect(twinText(split, 'WH', 'PVC')).toBe('')
    expect(readMove('twin', '2500', 'PVC')).toEqual({ kind: 'twin', base: 'PVC', by: 2500 })
    expect(readMove('twin', '0', 'PVC')).toEqual({ kind: 'twin', base: 'PVC', by: 0 })
    expect(moveSaid({ kind: 'twin', base: 'PVC', by: 2500 })).toBe('set to its PVC line + $2,500')
  })

  it('sets each Highfield Hypalon Cash to its PVC twin’s Cash and an amount more, as one step', () => {
    const hf = pack.byKey('boat_highfield')
    const rows = viewRowsOf(hf, pack.rowsByEntity.boat_highfield ?? [])
    const cash = field(hf, 'Cash')
    const model = field(hf, 'Model')
    const variant = field(hf, 'Variant')
    const split = { fieldId: variant.id, words: ['PVC', 'HYP'] }
    const key = (r: (typeof rows)[number], text: string): string =>
      `${r.text[model.id] ?? ''}|${text}`
    const pvc = new Map<string, (typeof rows)[number]>()
    for (const r of rows) {
      const t = r.text[variant.id] ?? ''
      if (twinText(split, t, 'PVC') === t.trim()) pvc.set(key(r, t.trim()), r)
    }
    const twinOf = (r: (typeof rows)[number]) => {
      const t = r.text[variant.id] ?? ''
      const twin = twinText(split, t, 'PVC')
      if (twin === '') return undefined
      return twin === t.trim() ? ('base' as const) : pvc.get(key(r, twin))
    }
    /* the first model's four lines: two in PVC, two in Hypalon */
    const first = rows[0]!.text[model.id]
    const picked = rows.flatMap((r, i) => (r.text[model.id] === first ? [i] : []))
    const move = { kind: 'twin' as const, base: 'PVC', by: 2500 }
    const plan = planTwin(rows, cash, picked, move, twinOf)
    expect(plan.based + plan.lines.length + plan.same + plan.alone + plan.blank).toBe(picked.length)
    expect(plan.based).toBeGreaterThan(0)
    for (const l of plan.lines) {
      const row = rows.find((r) => r.rowId === l.rowId)!
      const twin = twinOf(row)
      expect(twin).not.toBe('base')
      expect(l.after).toBe(((twin as (typeof rows)[number]).values[cash.id] as number) + 2500)
    }
    const w = moveWrite(hf, cash, plan, move, NOUN)
    expect('command' in w && w.cells).toBe(plan.lines.length)
  })
})
