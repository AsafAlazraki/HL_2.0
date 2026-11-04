import { describe, expect, it } from 'vitest'
import type { BroughtNote } from './brought'
import { EDITION_KEY, copyHolds, editionHere, editionOfCopy, sameEdition } from './copyEdition'

const SHIPPED = {
  version: '1',
  packedAt: '2026-09-16T08:16:21.258Z',
  sha256: 'a22d3e1051af2f56e80041201ae11d1ece762873d708f33d6bd557389576685a',
}

const note = (over: Partial<BroughtNote>): BroughtNote => ({
  id: 'x',
  file: 'Parts Module (2).xlsx',
  bytes: 1,
  saved: null,
  read: '2026-11-04T06:00:00.000Z',
  by: null,
  changes: 3082,
  adding: 817,
  cannot: 61,
  now: 'read',
  applied: null,
  at: null,
  ...over,
})

describe('the price list a copy names', () => {
  it('names the pack it came from and every workbook applied since, oldest first', () => {
    const notes = [
      note({
        id: 'b',
        read: '2026-11-04T07:00:00.000Z',
        now: 'applied',
        applied: 12,
        at: '2026-11-04T07:01:00.000Z',
        file: 'Second.xlsx',
      }),
      note({ id: 'a', now: 'applied', applied: 3899, at: '2026-11-04T06:09:00.000Z' }),
      note({
        id: 'c',
        read: '2026-11-03T00:00:00.000Z',
        now: 'put-back',
        at: '2026-11-03T00:01:00.000Z',
      }),
    ]
    const here = editionHere(SHIPPED, '1', notes)
    expect(here.fingerprint).toBe('a22d3e1051af')
    expect(here.packedAt).toBe(SHIPPED.packedAt)
    expect(here.applied).toEqual([
      { file: 'Parts Module (2).xlsx', at: '2026-11-04T06:09:00.000Z', changes: 3899 },
      { file: 'Second.xlsx', at: '2026-11-04T07:01:00.000Z', changes: 12 },
    ])
  })

  it('says no day and no fingerprint for a price list from a pack this app was not shipped with', () => {
    const here = editionHere(SHIPPED, '2', [])
    expect(here).toEqual({ version: '2', packedAt: null, fingerprint: null, applied: [] })
  })

  it('reads what a copy carries back, and nothing from a copy that carries none', () => {
    const here = editionHere(SHIPPED, '1', [
      note({ now: 'applied', applied: 3899, at: '2026-11-04T06:09:00.000Z' }),
    ])
    const copy = JSON.parse(JSON.stringify({ kind: 'x', [EDITION_KEY]: here }))
    const read = editionOfCopy(copy)
    expect(read).toEqual(here)
    expect(sameEdition(read!, here)).toBe(true)
    expect(sameEdition(read!, editionHere(SHIPPED, '1', []))).toBe(false)
    expect(editionOfCopy({ kind: 'x' })).toBeNull()
    expect(editionOfCopy({ [EDITION_KEY]: [] })).toBeNull()
  })

  it('drops what does not read as a workbook applied, and a fingerprint that is not one', () => {
    const read = editionOfCopy({
      [EDITION_KEY]: {
        version: '1',
        fingerprint: '<script>',
        applied: [
          { file: 'A.xlsx', at: 'not a day', changes: 1 },
          { file: 'B.xlsx', at: '2026-11-04T06:09:00.000Z', changes: -4 },
        ],
      },
    })
    expect(read).toEqual({
      version: '1',
      packedAt: null,
      fingerprint: null,
      applied: [{ file: 'B.xlsx', at: '2026-11-04T06:09:00.000Z', changes: 0 }],
    })
  })
})

describe('whether the last copy holds what was applied', () => {
  it('holds it only when it was saved at or after the Apply (verify-1.md, gap 2)', () => {
    expect(copyHolds('2026-11-04T06:13:00.000Z', '2026-11-04T06:20:00.000Z')).toBe(false)
    expect(copyHolds('2026-11-04T06:21:00.000Z', '2026-11-04T06:20:00.000Z')).toBe(true)
    expect(copyHolds(null, '2026-11-04T06:20:00.000Z')).toBe(false)
    expect(copyHolds('2026-11-04T06:13:00.000Z', null)).toBe(true)
    expect(copyHolds(null, null)).toBe(false)
  })
})
