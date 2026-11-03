import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { sellableRows } from '@/domain/catalogue/views/sellable'
import type { RowData } from '@/domain/model'
import { findLines } from './find'
import { madeForOf } from './madeFor'
import { twoKeysOf, twoPrices, lineKindOf } from './prices'
import { caseTwinsOf, headingProposals } from './suppliers'
import { codeBookOf, matchByCode } from './byCode'

/* THE CHANDLERY'S READINGS, MEASURED ON THE REAL PRICE LIST (data/northside). Every figure the
   judge and the boards quoted is read again here off the pack, so a new price list that moves one
   moves this suite, never a sentence on the screen. */

let pack: PackFixture
let live: RowData[]
const text = (v: unknown): string =>
  typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
const num = (v: unknown): number | null => (typeof v === 'number' ? v : null)

beforeAll(async () => {
  pack = await loadPack()
  live = sellableRows(pack.rowsByEntity[pack.byKey('parts').id] ?? [])
})

const lineOf = (row: RowData) => ({
  id: row.id,
  name: text(row.values['parts.c']),
  product: text(row.values['parts.c']),
  code: text(row.values['parts.e']),
  op: text(row.values['parts.aa']),
  heading: text(row.values['parts.cat']),
  maker: text(row.values['parts.d']),
})

describe('the two prices, on the live parts list', () => {
  it('reads supply and fitted off the list’s own declarations', () => {
    const keys = twoKeysOf(pack.byKey('parts').priceLevels)
    expect(keys.supply?.fieldId).toBe('parts.l')
    expect(keys.fitted?.fieldId).toBe('parts.y')
  })

  it('differ on 1,882 of 2,238, and 101 are priced fitted alone — none of them read $0', () => {
    expect(live.length).toBe(2238)
    const said = live.map((r) =>
      twoPrices(num(r.values['parts.l']), num(r.values['parts.y']), text(r.values['parts.n'])),
    )
    const differ = live.filter(
      (r) =>
        typeof r.values['parts.l'] === 'number' &&
        typeof r.values['parts.y'] === 'number' &&
        r.values['parts.l'] !== r.values['parts.y'],
    ).length
    expect(differ).toBe(1882)
    expect(said.filter((p) => p.kind === 'fittedOnly').length).toBe(101)
    /* Trailer Adjustment 15 to 17ft: $0 supply on the old card, $206 fitted on the file */
    const adjust = live.find((r) =>
      /^Trailer Adjustment - 15 to 17/i.test(text(r.values['parts.c'])),
    )
    expect(adjust).toBeDefined()
    expect(twoPrices(num(adjust!.values['parts.l']), num(adjust!.values['parts.y']))).toEqual({
      kind: 'fittedOnly',
      fitted: 206,
    })
  })

  it('reads the workbook’s two notes as notes', () => {
    const notes = live.filter((r) => lineKindOf(text(r.values['parts.c'])) === 'note')
    expect(notes.map((r) => text(r.values['parts.c'])).toSorted()).toEqual([
      'NB: Fuel Filter - Order w Rigging Kit',
      'NB: No Rego Decals - NOT TO BE SUPPLIED',
    ])
  })
})

describe('find, on the live parts list', () => {
  it('finds all 144 Lowrance lines by their heading, and SG002 by its code', () => {
    const lines = live.map(lineOf)
    const lowrance = live.filter((r) => text(r.values['parts.d']) === 'LOW').length
    expect(lowrance).toBe(144)
    const found = findLines(lines, 'lowrance').found
    expect(found.filter((l) => l.maker === 'LOW').length).toBe(144)
    const code = findLines(lines, 'SG002').found
    expect(code.map((l) => l.product)).toEqual(['Safety Gear - Smooth Waters'])
  })
})

describe('the suppliers, on the live parts list', () => {
  it('proposes the names every heading agrees on, with their numerators', () => {
    const lines = live.map(lineOf)
    const proposed = headingProposals(lines, undefined).map((p) => [
      p.code,
      p.name,
      p.agree,
      p.lines,
    ])
    expect(proposed).toContainEqual(['LOW', 'Lowrance', 144, 144])
    expect(proposed).toContainEqual(['GAR', 'Garmin', 72, 72])
    expect(proposed).toContainEqual(['SIM', 'Simrad', 34, 34])
  })

  it('finds YAM and Yam as one maker written two ways', () => {
    const twins = caseTwinsOf(live.map(lineOf), undefined)
    expect(twins).toContainEqual({
      codes: [
        { code: 'YAM', lines: 459 },
        { code: 'Yam', lines: 212 },
      ],
    })
  })
})

describe('what the price list makes for a boat', () => {
  it('reads the six lists of pairs: 2,561 pairs over 42 parts', () => {
    const made = madeForOf(pack.ctx.entities, pack.rowsByEntity, pack.byKey('parts').id)
    expect(made.lists).toBe(6)
    expect(made.pairs).toBe(2561)
    expect(made.boatsOf.size).toBe(42)
    /* the Stacer 529 Assault Pro (Tournament) the board drew */
    expect(made.partsOf.get('boat_stacer:30')?.length).toBe(4)
  })
})

describe('pictures by code, on the live parts list', () => {
  it('places SG002.jpg on Safety Gear · Smooth Waters, and refuses a code two parts carry', () => {
    const book = codeBookOf(live.map(lineOf))
    const hit = matchByCode('SG002.jpg', book)
    expect(hit.ok && hit.line.product).toBe('Safety Gear - Smooth Waters')
    const twice = [...book.byCode].find(([, l]) => l.length > 1)
    expect(twice).toBeDefined()
    expect(matchByCode(`${twice![0]}.jpg`, book).ok).toBe(false)
  })
})
