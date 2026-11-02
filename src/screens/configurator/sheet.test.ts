import { describe, expect, it } from 'vitest'
import { acrossTheSheet } from './sheet'

describe('how many measures stand across the specification sheet', () => {
  /* the audit, round 3, P13: eleven in room for five stood 5, 5 and 1 */
  it('balances eleven in room for five as four, four and three', () => {
    expect(acrossTheSheet(11, 5 * 136, 136)).toBe(4)
  })

  /* a motor's four in room for five stood with an empty cell beside them */
  it('stands four in one row where the room holds five', () => {
    expect(acrossTheSheet(4, 5 * 136 + 40, 136)).toBe(4)
  })

  it('keeps full rows where the count divides', () => {
    expect(acrossTheSheet(12, 4 * 136, 136)).toBe(4)
    expect(acrossTheSheet(9, 3 * 136, 136)).toBe(3)
  })

  const ROOMS = [136, 300, 500, 700, 900, 1200]
  const every = ROOMS.flatMap((room) =>
    Array.from({ length: 30 }, (_, i) => {
      const count = i + 1
      const across = acrossTheSheet(count, room, 136)
      const rows = Math.ceil(count / across)
      return { count, room, across, rows, empty: rows * across - count }
    }),
  )

  it('never stands more across than the room holds', () => {
    expect(every.filter((s) => s.across > Math.max(1, Math.floor(s.room / 136)))).toEqual([])
  })

  it('leaves no last row shorter by as many cells as there are rows', () => {
    expect(every.filter((s) => s.rows > 1 && s.empty >= s.rows)).toEqual([])
  })

  it('stands one across in a room narrower than one measure, and one for nothing', () => {
    expect(acrossTheSheet(5, 80, 136)).toBe(1)
    expect(acrossTheSheet(0, 900, 136)).toBe(1)
  })
})
