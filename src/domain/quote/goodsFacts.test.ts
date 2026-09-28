import { beforeAll, describe, expect, test } from 'vitest'
import type { RowData } from '@/domain/model'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { goodsFacts, motorFactsOf, motorFactsSaid } from './goodsFacts'

/* ============================================================
   A motor's facts are three cells of its own row, read off the real
   pack. The F90LB is Motor Library's own row for it; nothing here is
   typed that the file does not carry — the expected line is built
   from the cells, then compared.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const rowByCode = (tableId: string, code: string): RowData => {
  const table = pack.byKey(tableId)
  const field = table.fields.find((f) => f.name === 'Model Code')!
  const row = (pack.rowsByEntity[tableId] ?? []).find((r) => r.values[field.id] === code)
  expect(row, `${tableId} holds no ${code}`).toBeDefined()
  return row!
}

const cellOf = (tableId: string, row: RowData, name: string): unknown => {
  const field = pack.byKey(tableId).fields.find((f) => f.name === name)
  return field ? row.values[field.id] : undefined
}

describe('a motor’s facts', () => {
  test('are its power, its weight and its shaft, read off its own row', () => {
    const table = pack.byKey('mot_yamaha')
    const row = rowByCode('mot_yamaha', 'F90LB')
    const facts = motorFactsOf(table, row)
    expect(facts).toEqual({
      hp: String(cellOf('mot_yamaha', row, 'HP Rating')),
      kg: cellOf('mot_yamaha', row, 'WEIGHT kg'),
      shaft: String(cellOf('mot_yamaha', row, 'Shaft Length')),
    })
    /* the file's inch mark is set as the double prime it means */
    expect(goodsFacts(table, row)).toBe(
      `${facts.hp} hp · ${facts.kg} kg · ${facts.shaft!.replace(/"$/, '″')} shaft`,
    )
    expect(goodsFacts(table, row)).not.toContain('"')
  })

  test('say only the ones a register carries, and never a dash for the rest', () => {
    const table = pack.byKey('mot_epropulsion')
    expect(table.fields.some((f) => f.name === 'WEIGHT kg')).toBe(false)
    const row = pack.rowsByEntity['mot_epropulsion']![0]!
    const said = goodsFacts(table, row)
    expect(said).not.toMatch(/kg/)
    expect(said).not.toContain('—')
    expect(motorFactsSaid({ hp: null, kg: null, shaft: null })).toBe('')
  })

  test('are nothing for a row that is not a motor’s', () => {
    const trailers = pack.byKey('trl_redco')
    expect(goodsFacts(trailers, pack.rowsByEntity['trl_redco']![0])).toBe('')
    expect(goodsFacts(undefined, undefined)).toBe('')
  })
})
