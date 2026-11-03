import { describe, expect, it } from 'vitest'
import type { CatalogueEvent } from '@/domain/catalogue/commands'
import { NO_STAMPS, cellsWritten, stampId, stampOf, stamped } from './stamps'

const AT = '2026-11-03T01:00:00.000Z'
const LATER = '2026-11-03T02:00:00.000Z'

const cellSet = (rowId: string, fieldId: string, at = AT): CatalogueEvent => ({
  id: `e-${rowId}-${fieldId}`,
  kind: 'cell-set',
  at,
  said: 'Cell changed',
  label: 'Cell changed',
  tableId: 't1',
  rowId,
  fieldId,
  changed: [{ path: `t1.${rowId}.${fieldId}`, from: 2770, to: 850 }],
})

describe('who last wrote a cell, and when', () => {
  it('stamps the one cell a step wrote, with its who and when', () => {
    const e = { ...cellSet('r1', 'cash'), by: 'Asaf' }
    const s = stamped(NO_STAMPS, e, 'o1')
    expect(s[stampId('r1', 'cash')]).toEqual({
      id: 'r1#cash',
      orgId: 'o1',
      rowId: 'r1',
      fieldId: 'cash',
      at: AT,
      by: 'Asaf',
    })
    expect(stampOf(s, 'r1', 'cash')).toEqual({ at: AT, by: 'Asaf' })
    expect(stampOf(s, 'r1', 'trade')).toBeUndefined()
  })

  it('stamps every cell of a batch with the batch’s name where the act has none', () => {
    const e: CatalogueEvent = {
      id: 'b1',
      kind: 'batch',
      at: LATER,
      by: 'Asaf',
      said: '3 cells changed',
      label: '3 cells changed',
      changed: [],
      events: [cellSet('r1', 'cash', ''), cellSet('r2', 'cash', ''), cellSet('r3', 'cash', '')],
    }
    expect(cellsWritten(e)).toEqual([
      { rowId: 'r1', fieldId: 'cash', at: LATER, by: 'Asaf' },
      { rowId: 'r2', fieldId: 'cash', at: LATER, by: 'Asaf' },
      { rowId: 'r3', fieldId: 'cash', at: LATER, by: 'Asaf' },
    ])
  })

  it('reads the cells a way back put back from its changes, which name no column', () => {
    const back: CatalogueEvent = {
      id: 'u1',
      kind: 'undone',
      at: LATER,
      said: 'Undone',
      label: 'Undone',
      tableId: 't1',
      rowId: 'r1',
      undoes: 'e-r1-cash',
      changed: [
        { path: 't1.r1.cash', from: 850, to: 2770 },
        { path: 't1.r1.trade', from: 1, to: 2 },
      ],
    }
    const s = stamped(stamped(NO_STAMPS, cellSet('r1', 'cash'), 'o1'), back, 'o1')
    expect(stampOf(s, 'r1', 'cash')).toEqual({ at: LATER })
    expect(stampOf(s, 'r1', 'trade')).toEqual({ at: LATER })
  })

  it('hands the same object back for a step that wrote no cell', () => {
    const renamed: CatalogueEvent = {
      id: 'c1',
      kind: 'column-renamed',
      at: AT,
      said: 'Column renamed',
      label: 'Column renamed',
      tableId: 't1',
      fieldId: 'cash',
      changed: [],
    }
    const s = stamped(NO_STAMPS, cellSet('r1', 'cash'), 'o1')
    expect(stamped(s, renamed, 'o1')).toBe(s)
  })
})
