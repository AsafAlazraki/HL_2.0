/* ============================================================
   THE CODE A DEALER ORDERS BY, FROZEN ONTO THE LINE.

   WHY THIS WAS ADDED, 2026-09-17, while the configurator was built.
   The sweep's §2 names "the dealer's own code beside the name" as a
   pattern to take — Porsche prints `0Q`, `58X`, `1G8` in grey on
   every summary line and inline in every search result, and a dealer
   tool needs it more than a car brochure does, because the code is
   what goes on the order.

   A frozen line could not say it. It carried the label (prose), the
   figure, the column the figure came from and the workbook cell it
   was read from — and nothing a supplier would recognise on a phone
   call. So `mintLine` now freezes it, by value, like everything else
   a document prints.

   EVERY CASE BELOW IS READ OFF THE REAL PACK. Nothing here is a
   fabricated row: the four spellings, the two-columns-named-`Code`
   collision and the absence are all facts about this file.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { rowLabel, type EntityDef, type RowData } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { makeEngine } from '@/domain/catalogue/views'
import { mintLine, mintFreeLine } from './freeze'

const pack = await loadPack()
const ctx = pack.ctx
const engine = makeEngine(ctx)

/** One line minted from the first row of a table that matches. */
function lineFor(key: string, find?: (label: string) => boolean) {
  const entity: EntityDef = pack.byKey(key)
  const rows = pack.rowsByEntity[entity.id] ?? []
  const row = find
    ? rows.find((r: RowData) => find(rowLabel(entity, r)))
    : (rows[0] as RowData | undefined)
  expect(row, `no row in ${key}`).toBeDefined()
  return { entity, row: row!, line: mintLine({ ctx, engine, entity, row: row!, levelKey: 'cash' }) }
}

describe('the code a dealer orders by', () => {
  it('reads "Model Code" on a hull, and it is not in the label', () => {
    const { line } = lineFor('boat_highfield', (l) => l.includes('SP560'))
    expect(line.code).toBeDefined()
    expect(line.code).toMatch(/^\S+$/)
    /* THE WHOLE POINT: it is news. The hull's label names the model
       and the finish and never the code the order goes out under. */
    expect(line.label.includes(line.code!)).toBe(false)
  })

  it('reads "Model Code" on a motor', () => {
    const { line } = lineFor('mot_yamaha', (l) => l.includes('F90'))
    expect(line.code).toBe('F90LB')
  })

  it('reads "Code" on a trailer, on a part and on a package', () => {
    for (const key of ['trl_nsmcustom', 'parts', 'dealer_fit']) {
      const { line } = lineFor(key)
      expect(line.code, `${key} has no code`).toBeDefined()
      expect(line.code).not.toBe('')
    }
  })

  it('takes the FIRST column named Code where a table has two', () => {
    /* `Dealer Fit Packages` names the package's code and, twenty
       columns later, the accessory's. The line is the package. */
    const entity: EntityDef = pack.byKey('dealer_fit')
    const named = entity.fields.filter((f) => f.name === 'Code')
    expect(named.length).toBe(2)
    const row = (pack.rowsByEntity[entity.id] ?? [])[0] as RowData
    const line = mintLine({ ctx, engine, entity, row, levelKey: 'cash' })
    expect(line.code).toBe(String(row.values[named[0].id]))
  })

  it('reads "Part Number" where that is the spelling', () => {
    const { line } = lineFor('rig_kits')
    expect(line.code).toBeDefined()
  })

  it('is absent, never empty, on a table with no such column', () => {
    const entity: EntityDef = pack.byKey('boat_formosa')
    const has = entity.fields.some((f) =>
      ['Code', 'Model Code', 'Part Number'].includes(f.name.trim()),
    )
    const row = (pack.rowsByEntity[entity.id] ?? [])[0] as RowData
    const line = mintLine({ ctx, engine, entity, row, levelKey: 'cash' })
    if (has) expect(line.code).toBeDefined()
    else expect('code' in line).toBe(false)
  })

  it('is absent on a line somebody typed, which is a row of nothing', () => {
    expect('code' in mintFreeLine('Delivery to Hervey Bay', 450, 'cash')).toBe(false)
  })

  it('is frozen — the same line minted twice reads the same code', () => {
    const a = lineFor('mot_yamaha', (l) => l.includes('F90')).line
    const b = lineFor('mot_yamaha', (l) => l.includes('F90')).line
    expect(a.code).toBe(b.code)
  })
})
