/* ============================================================
   WHAT A DEALER TYPES, ON THE REAL FILE.

   The critique of Milestone 2's close (#8) drove the finder with the
   words a person at a boat dealership uses and measured three misses:

     · `HBS126` — the code the SP560 (HYP) B-B-B is ordered by —
       answered "Nothing in this browser matches";
     · `yamaha f90` put four Pre-Delivery packages above the F90
       motors, because the file prints the motor "Yamaha - F90LB" and
       the package "… Installation - Yamaha F90LB w …";
     · `trailer for sp560` answered nothing (that one is the finder's
       grammar, `src/domain/shell/fits.test.ts`).

   Every assertion is a PROPERTY over the pack rather than a figure off
   it, the same discipline `search.northside.test.ts` keeps: "every
   code finds its own line" stays true when a model is added.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import type { EntityDef, RowData } from '@/domain/model'
import { codeFieldOf, CODE_NAMES } from './code'
import { buildSearchIndex, RANK, search, spaced, type SearchIndex } from './search'

let entities: Record<string, EntityDef>
let rowsByEntity: Record<string, RowData[]>
let index: SearchIndex

beforeAll(async () => {
  const pack = await loadPack()
  entities = pack.ctx.entities
  rowsByEntity = pack.ctx.rowsByEntity
  index = buildSearchIndex(entities, rowsByEntity)
})

const EVERYTHING = {
  perTable: 10_000,
  total: 100_000,
  tables: 6,
  modules: 4,
  quotes: 5,
  columns: 6,
}

const codeOf = (entity: EntityDef, row: RowData): string => {
  const field = codeFieldOf(entity)
  const v = field ? row.values[field.id] : undefined
  return typeof v === 'string' ? v.trim() : ''
}

describe('the code a dealer orders by', () => {
  it('names a code column on every boat, motor and trailer table', () => {
    for (const entity of Object.values(entities)) {
      if (!['boat', 'motor', 'trailer'].includes(entity.kind ?? '')) continue
      expect(codeFieldOf(entity), entity.name).toBeDefined()
    }
  })

  it('reads the five spellings the quote engine reads a line’s code by', () => {
    /* freeze.ts keeps its own copy of this list (code.ts says why);
       this pins the one here so the two cannot drift unseen */
    expect(CODE_NAMES).toEqual(['model code', 'part number', 'part no', 'product code', 'code'])
  })

  it('finds every boat by its own code, first in its table, with the code lit', () => {
    let asked = 0
    for (const entity of Object.values(entities)) {
      if (entity.kind !== 'boat') continue
      const rows = rowsByEntity[entity.id] ?? []
      /* a code two rows share cannot name one of them; the file has
         none on a boat table, and a row that shares one is skipped
         rather than asserted wrongly */
      const counted = new Map<string, number>()
      for (const row of rows) {
        const code = codeOf(entity, row)
        if (code !== '') counted.set(code, (counted.get(code) ?? 0) + 1)
      }
      for (const row of rows) {
        const code = codeOf(entity, row)
        if (code === '' || counted.get(code) !== 1) continue
        asked += 1
        const group = search(index, code, EVERYTHING).groups.find((g) => g.table.id === entity.id)
        const first = group?.hits[0]
        expect(first?.rowId, `${code} on ${entity.name}`).toBe(row.id)
        expect(first?.rank, code).toBe(RANK.prefix)
        /* the code is lit — unless the name STARTS with it too ("495 -
           Pro Fisher", coded 495), where the name is the equal reading
           and is the one lit */
        if (first?.at === -1) {
          expect(first.code?.at, code).toBe(0)
          expect(first.code?.length, code).toBe(code.length)
        } else {
          expect(first?.label.toLowerCase().startsWith(code.toLowerCase()), code).toBe(true)
        }
      }
    }
    /* and it asked about something: a pack with no codes would pass
       every line above by asking nothing */
    expect(asked).toBeGreaterThan(500)
  })

  it('HBS126 — the critique’s own query — answers the one boat it orders, first', () => {
    const result = search(index, 'HBS126')
    const boats = result.groups.filter((g) => g.table.kind === 'boat')
    expect(boats.flatMap((g) => g.hits)).toHaveLength(1)
    const boat = result.groups[0]!.hits[0]!
    expect(result.groups[0]!.table.kind).toBe('boat')
    expect(boat.code?.text).toBe('HBS126')
    /* the name is not what matched, so the name carries no mark */
    expect(boat.at).toBe(-1)
    /* and anything else it answers — the boat's own pre-delivery
       package, coded 9HI_HBS126_PD — holds the code INSIDE its own, so
       it ranks below the boat whose code it is */
    for (const hit of result.groups.slice(1).flatMap((g) => g.hits)) {
      expect(hit.rank).toBeGreaterThan(RANK.prefix)
    }
  })
})

describe('a name read as it is typed', () => {
  it('spaces the separators and keeps a dash inside a word', () => {
    expect(spaced('Highfield - SP560 (HYP) B-B-B')).toBe('highfield sp560 hyp b-b-b')
    expect(spaced('Yamaha - F90LB')).toBe('yamaha f90lb')
    expect(spaced('Stern Mesh Shade - SP560/600')).toBe('stern mesh shade sp560/600')
    expect(spaced('  --  ')).toBe('')
  })

  it('yamaha f90 answers the Yamaha motors before anything that installs one', () => {
    const result = search(index, 'yamaha f90')
    const first = result.groups[0]!
    expect(first.table.kind).toBe('motor')
    /* the motors that START with what was typed, as typed, lead; a
       twin rig ("Yamaha - Twin F90LB's") holds the words apart and
       follows them */
    const lead = first.hits.filter((h) => h.rank === RANK.prefix)
    expect(lead.length).toBeGreaterThan(0)
    for (const hit of lead) expect(spaced(hit.label).startsWith('yamaha f90'), hit.label).toBe(true)
    expect(first.hits.map((h) => h.rank)).toEqual(first.hits.map((h) => h.rank).toSorted())
  })

  it('marks the run on the name as printed, across the separator', () => {
    const motor = search(index, 'yamaha f90').groups[0]!.hits[0]!
    expect(motor.label.slice(motor.at, motor.at + motor.length).toLowerCase()).toBe('yamaha - f90')
  })

  it('a query that is only separators finds nothing rather than everything', () => {
    expect(search(index, '--').rowTotal).toBe(0)
  })
})
