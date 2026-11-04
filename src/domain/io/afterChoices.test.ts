import { describe, expect, it } from 'vitest'
import type { Candidate, ChangeLine, ChangeSet, Choices } from './changeSet'
import { afterChoices } from './afterChoices'

/* A set of five lines drawn by hand, each fate at least once, so every count below can be read
   off it. */
const line = (
  key: string,
  fate: ChangeLine['fate'],
  over: Partial<ChangeLine> = {},
): ChangeLine => ({
  key,
  fate,
  tableId: 'parts',
  list: 'Parts & Accessories',
  sheet: 'Parts Maintenance',
  at: 1,
  name: key,
  supplier: '',
  code: '',
  category: '',
  cells: [],
  read: null,
  swing: 0,
  ...over,
})

const moves = {
  fieldId: 'parts.l',
  name: 'Sell',
  own: false,
  as: 'money' as const,
  from: 1,
  to: 2,
}

const candidate = (rowId: string, cells: Candidate['cells']): Candidate => ({
  rowId,
  code: '',
  supplier: '',
  read: null,
  from: null,
  cells,
})

const set: ChangeSet = {
  lines: [
    line('c1', 'change', { rowId: 'r1', cells: [moves] }),
    line('c2', 'change', { rowId: 'r2', cells: [moves] }),
    line('n1', 'new'),
    line('k1', 'cannot', { candidates: [candidate('r3', [moves])] }),
    line('k2', 'cannot', { candidates: [candidate('r4', [])] }),
  ],
  lists: [],
  suppliers: [],
  changing: 2,
  adding: 1,
  cannot: 2,
  suggested: 0,
  doubled: 0,
  totalRows: 10,
  unmoved: 8,
}

describe('the price list after this workbook, with the choices made on it', () => {
  it('reads as the workbook offers it when nothing is chosen', () => {
    expect(afterChoices(set, { out: new Set(), placed: new Map() })).toEqual({
      stays: 8,
      change: 2,
      fresh: 1,
      cannot: 2,
      outChange: 0,
      outNew: 0,
      placed: 0,
      placedMoving: 0,
    })
  })

  it('counts a line left out as staying, and a line placed as changing only when it moves', () => {
    const c: Choices = {
      out: new Set(['c1', 'n1']),
      placed: new Map([
        ['k1', 'r3'],
        ['k2', 'r4'],
      ]),
    }
    const after = afterChoices(set, c)
    expect(after).toEqual({
      stays: 8,
      change: 2,
      fresh: 0,
      cannot: 0,
      outChange: 1,
      outNew: 1,
      placed: 2,
      placedMoving: 1,
    })
    /* every line already on the price list is counted once: it stays or it changes */
    expect(after.stays + after.change).toBe(set.totalRows)
  })
})
