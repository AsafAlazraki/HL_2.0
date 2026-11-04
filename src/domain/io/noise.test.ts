import { describe, expect, it } from 'vitest'
import type { RowData } from '@/domain/model'
import type { TableUploadPlan } from './tableCsv'
import { movesNothing, withoutNoise } from './noise'

/* The figures are the ones measured on Northside's own Parts Module (2).xlsx against the pack of
   16 September 2026 (src/domain/io/noise.ts). */
describe('a cell that moves nothing', () => {
  it('is a figure the arithmetic spelled twice, or words with a space at their end', () => {
    expect(movesNothing(555.2760000000001, 555.276)).toBe(true)
    expect(movesNothing(35, 34.99999999999999)).toBe(true)
    expect(movesNothing(0.1443940408995622, 0.14439404089956245)).toBe(true)
    expect(movesNothing('EKS Add on Kit Single', 'EKS Add on Kit Single ')).toBe(true)
  })

  it('is never a move the workbook really makes, however small', () => {
    expect(movesNothing(8.41, 8.41464)).toBe(false)
    expect(movesNothing(479.204, 479.2)).toBe(false)
    expect(movesNothing(0.27760657421674373, 0.27840909090909083)).toBe(false)
    expect(movesNothing(null, 0)).toBe(false)
    expect(movesNothing('Garmin GT52', 'Garmin GT54')).toBe(false)
    expect(movesNothing(12, '12')).toBe(false)
  })
})

describe('the plan without them', () => {
  const row = (id: string, values: RowData['values']): RowData =>
    ({ id, entityId: 'parts', values }) as unknown as RowData
  const change = (rowId: string, fieldId: string, value: number | string) => ({
    rowId,
    rowLabel: rowId,
    fieldId,
    columnName: fieldId,
    from: '',
    to: '',
    value,
  })
  const plan = {
    overwritten: 2,
    changes: [change('a', 'ctd', 555.276), change('b', 'ctd', 8.41464), change('b', 'pa', 35)],
  } as unknown as TableUploadPlan
  const rows = [
    row('a', { ctd: 555.2760000000001 }),
    row('b', { ctd: 8.41, pa: 34.99999999999999 }),
  ]

  it('drops what moves nothing and counts the lines that change again', () => {
    const p = withoutNoise(plan, rows)
    expect(p.changes.map((c) => `${c.rowId}.${c.fieldId}`)).toEqual(['b.ctd'])
    expect(p.overwritten).toBe(1)
  })

  it('hands back the very plan when nothing in it is noise', () => {
    const real = {
      overwritten: 1,
      changes: [change('b', 'ctd', 8.41464)],
    } as unknown as TableUploadPlan
    expect(withoutNoise(real, rows)).toBe(real)
  })
})
