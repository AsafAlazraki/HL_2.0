import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, FieldDef } from '@/domain/model'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { cellText } from '@/domain/catalogue/table/helpers'
import { splitUnit } from '@/domain/catalogue/views/columns'
import { changeSaid, factLines, factText, rangeSaid } from './read'

/* ============================================================
   A UNIT ON EVERY MEASURE (built-critique-m2-close-2.md): the sheet's
   spine says a figure with the unit its column or its maker states, and
   never a bare 6.98 beside "Tube Dia 32 cm". Read off the real pack:
   every column named here is a column of the Northside file.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const fieldOf = (table: EntityDef, name: string): FieldDef =>
  table.fields.find((f) => f.name === name)!

describe('a spine fact carries its unit', () => {
  it('reads the unit off the column’s name, its bracket or the maker’s ledger', () => {
    const hf = pack.byKey('boat_highfield')
    const stacer = pack.byKey('boat_stacer')
    expect(factText(hf, fieldOf(hf, 'OA Length'), '6.98')).toBe('OA Length 6.98 m')
    expect(factText(hf, fieldOf(hf, 'Tube Dia. cm'), '32')).toBe('Tube Dia 32 cm')
    expect(factText(hf, fieldOf(hf, 'Deadrise °'), '20')).toBe('Deadrise 20°')
    expect(factText(stacer, fieldOf(stacer, 'Hull Length (Mtr)'), '3.07')).toBe(
      'Hull Length 3.07 m',
    )
  })

  it('never says a unit twice when the cell was typed with it', () => {
    /* the ADV7's Max HP cell holds "250 HP": its spine read "Max 250 HP HP"
       (m2-last-critique.md minor 10) */
    const hf = pack.byKey('boat_highfield')
    expect(factText(hf, fieldOf(hf, 'Max HP'), '250 HP')).toBe('Max 250 HP')
    expect(factText(hf, fieldOf(hf, 'Max HP'), '250')).toBe('Max 250 HP')
  })

  it('says a horsepower range with its unit once, after its figures, as each maker typed it', () => {
    /* the file's own pairs: Stacer types bare figures, Highfield and
       Stabicraft type the unit, sometimes closed up on the figure */
    expect(rangeSaid('HP', '40', '60')).toBe('40–60 HP')
    expect(rangeSaid('HP', '90', '90')).toBe('90 HP')
    expect(rangeSaid('HP', '8 HP', '10 HP')).toBe('8–10 HP')
    expect(rangeSaid('HP', '4 HP', '4 HP')).toBe('4 HP')
    expect(rangeSaid('HP', '150 HP', '200HP')).toBe('150–200 HP')
    expect(rangeSaid('HP', '2 x 150HP', '2 x 200HP')).toBe('2 x 150 HP–2 x 200 HP')
    expect(rangeSaid('HP', '2 x 300HP', '425 / 2 x 300 HP')).toBe('2 x 300 HP–425 / 2 x 300 HP')
    expect(rangeSaid('HP', '150 HP', 'TBA')).toBe('150 HP–TBA')
    expect(rangeSaid('HP', 'TBA', 'TBA')).toBe('HP TBA')
    /* a label that is not a unit leads its range, as it did */
    expect(rangeSaid('Length', '3.5 m', '4 m')).toBe('Length 3.5–4 m')
  })

  it('no spine on the whole file says a unit twice, before its bare figures, or its column twice', () => {
    /* every row of every table, its facts laid into spine lines exactly
       as the sheet lays a drawer's — 123,354 facts, measured 2026-09-25.
       At HEAD 6ad43ad this found 7 Highfield rows saying "Max 250 HP HP",
       14 saying the unit as a label and again in the value (Highfield 8
       "HP 2 x 300HP–425 / 2 x 300 HP", Surtees 4, Stabicraft 2), and 139
       saying it before bare figures (Stacer 91 "HP 40–60", Formosa 39,
       Haines 9), and 556 Highfield rows saying "Boat Rego Decals Rego
       Decals (Std) t/s …" */
    const twice = /\b(hp|kg|cm|mm|ltr|lbs|ft)\s+\1\b/i
    const labelThenCarried = /^(hp|kg|cm|mm|ltr|lbs|ft)\s.*\d\s*\1\b/i
    const unitFirst = /^(hp|kg|cm|mm|ltr|lbs|ft)\s+\d[\d,.]*(–\d[\d,.]*)?$/i
    const wrong: string[] = []
    let facts = 0
    for (const table of pack.entities) {
      for (const row of pack.rowsByEntity[table.id] ?? []) {
        const tails = table.fields.flatMap((f) => {
          const words = splitUnit(f.name).base.trim().split(/s+/)
          return words.slice(1).map((_, k) => ({
            name: words.join(' '),
            tail: words.slice(k + 1).join(' '),
          }))
        })
        const echoes = (fact: string): boolean =>
          tails.some(
            ({ name, tail }) =>
              fact.startsWith(`${name} `) &&
              fact
                .slice(name.length + 1)
                .toLowerCase()
                .startsWith(`${tail.toLowerCase()} `),
          )
        const said = table.fields
          .filter((f) => f.type !== 'reference')
          .map((f) => ({ fieldId: f.id, text: cellText(row.values[f.id] ?? null, f).trim() }))
        for (const line of factLines(table, said)) {
          for (const fact of line.facts) {
            facts += 1
            if (
              twice.test(fact) ||
              labelThenCarried.test(fact) ||
              unitFirst.test(fact) ||
              echoes(fact)
            )
              wrong.push(`${table.id}: ${fact}`)
          }
        }
      }
    }
    expect(facts).toBeGreaterThan(10_000)
    expect([...new Set(wrong)]).toEqual([])
  })

  it('never says its column’s name again where the value already opens on it', () => {
    /* Highfield's "Boat Rego Decals" holds "Rego Decals (Std) t/s Hypalon
       Tubes": the spine and the band read "Boat Rego Decals Rego Decals …" */
    const hf = pack.byKey('boat_highfield')
    expect(
      factText(hf, fieldOf(hf, 'Boat Rego Decals'), 'Rego Decals (Std) t/s Hypalon Tubes'),
    ).toBe('Rego Decals (Std) t/s Hypalon Tubes')
    expect(factText(hf, fieldOf(hf, 'Boat Registration'), 'Boat Registration Not Required')).toBe(
      'Boat Registration Not Required',
    )
    /* and a value that does not open on its column's name keeps the name */
    expect(factText(hf, fieldOf(hf, 'Eng Configuration'), 'Remote')).toBe(
      'Eng Configuration Remote',
    )
  })

  it('never assumes a unit nobody states', () => {
    const jeanneau = pack.byKey('boat_jeanneau')
    expect(factText(jeanneau, fieldOf(jeanneau, 'Draft'), '1.03')).toBe('Draft 1.03')
  })
})

describe('what one write changed', () => {
  it('names the column, the row and the figure it moved from and to, as the cell paints them', () => {
    /* the step line said only "Cell edit · Highfield Inflatables"
       (built-critique-m2-close-2.md minor 15) */
    const hf = pack.byKey('boat_highfield')
    const cash = fieldOf(hf, 'Cash')
    const row = { rowId: 'r', values: { [cash.id]: 3060 }, text: { [cash.id]: '3060' } }
    expect(changeSaid(hf, cash, 'HBR009', row, 12345)).toBe('Cash on HBR009: $3,060 → $12,345')
    expect(changeSaid(hf, cash, '', row, null)).toBe('Cash: $3,060 → nothing')
  })
})
