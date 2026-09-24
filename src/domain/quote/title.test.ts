/// <reference types="node" />
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { readCell, type EntityDef, type RowData } from '@/domain/model'
import { colourwayOf, splitVariant } from './colourway'
import { spokenBoat } from './spoken'
import { boatTitle, paperFileTitle } from './title'

/* ============================================================
   The title a buyer would say, read off the real file.

   Every label below is a real cell of the Northside file, and the
   whole-file case walks every boat row it carries, so the title
   cannot agree with a string typed here and disagree with the sheet.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const boatTables = (): EntityDef[] =>
  pack.entities.filter((e) => e.kind === 'boat' && e.role !== 'join')
const labelOf = (table: EntityDef, row: RowData): string =>
  String(readCell(row, table.displayFieldId ?? '') ?? '')

describe('boatTitle — the exact model, as a buyer says it', () => {
  it('keeps the golden 529’s (Tournament), because that is the exact model', () => {
    const t = boatTitle('boat_stacer', 'Stacer - 529 Assault Pro (Tournament)')
    expect(t.title).toBe('Stacer 529 Assault Pro (Tournament)')
    expect(t.finish).toBe('')
    expect(t.say).toBe('Stacer 529 Assault Pro (Tournament)')
  })

  it('sets a Highfield’s material and colourway under the title, HYP as Hypalon', () => {
    const adv7 = boatTitle('boat_highfield', 'Highfield - ADV7 (HYP) B-G-B')
    expect(adv7).toEqual({
      title: 'Highfield ADV7',
      finish: 'Hypalon · Black / Grey / Black',
      say: 'Highfield ADV7 · Hypalon · Black / Grey / Black',
    })
    expect(boatTitle('boat_highfield', 'Highfield - SP560 (HYP) LG-W-WB').finish).toBe(
      'Hypalon · Light Grey / White / White/Blue',
    )
  })

  it('prints a colourway it cannot decode whole, as the file writes it', () => {
    expect(boatTitle('boat_highfield', 'Highfield - PA540 Open (PVC) O-G-DG')).toMatchObject({
      title: 'Highfield Patrol 540 Open',
      finish: 'PVC · O-G-DG',
    })
  })

  it('keeps a bracket that names which model it is, and strips only a maker written before " - "', () => {
    expect(boatTitle('boat_highfield', 'Highfield - ADV9 (Dune)').title).toBe(
      'Highfield ADV9 (Dune)',
    )
    expect(boatTitle('boat_stacer', 'Stacer - 519 Sea Ranger SDF (Centre Console)').title).toBe(
      'Stacer 519 Sea Ranger SDF (Centre Console)',
    )
    /* a label that begins with the range and not the maker keeps every word */
    expect(boatTitle('boat_jeanneau', 'Merry Fisher  -  695 S2').title).toBe(
      'Jeanneau Merry Fisher 695 S2',
    )
    /* and a maker the file misspells is said once, as the maker */
    expect(boatTitle('boat_surtees', 'Surtess  -  770 Game Fisher XL').title).toBe(
      'Surtees 770 Game Fisher XL',
    )
  })

  it('reads every boat on the file: no key " - ", no material code, every bracketed word kept', () => {
    let read = 0
    for (const table of boatTables()) {
      for (const row of pack.rowsByEntity[table.id] ?? []) {
        const label = labelOf(table, row)
        if (label.trim() === '') continue
        const t = boatTitle(table.id, label)
        const b = spokenBoat(table.id, label)
        read += 1
        expect(t.title, label).not.toMatch(/ - |\((?:HYP|PVC)\)/)
        expect(t.say.startsWith(t.title), label).toBe(true)
        if (b.trim !== '') expect(t.title, label).toContain(`(${b.trim})`)
        if (table.id === 'boat_highfield') {
          const { material, code } = splitVariant(
            String(readCell(row, 'boat_highfield.variant') ?? ''),
          )
          if (material !== '') expect(t.finish, label).toContain(colourwayOf(code).say)
          if (/HYP/.test(material)) expect(t.finish, label).toContain('Hypalon')
        }
      }
    }
    expect(read).toBeGreaterThan(800)
  })
})

describe('paperFileTitle — what the saved PDF is called', () => {
  it('is the business, then quote, the reference and the model', () => {
    const { title } = boatTitle('boat_stacer', 'Stacer - 529 Assault Pro (Tournament)')
    expect(paperFileTitle('Northside Marine', '20260923-01', title)).toBe(
      'Northside Marine quote 20260923-01 – Stacer 529 Assault Pro (Tournament)',
    )
  })

  it('is called by its reference where no business name was frozen, never by the app', () => {
    expect(paperFileTitle(null, '20260923-01', 'Highfield ADV7')).toBe(
      'Quote 20260923-01 – Highfield ADV7',
    )
    expect(paperFileTitle('  ', '20260923-01', 'Highfield ADV7')).toBe(
      'Quote 20260923-01 – Highfield ADV7',
    )
    expect(paperFileTitle(null, 'X', 'Y')).not.toMatch(/HelmLogic/)
  })
})
