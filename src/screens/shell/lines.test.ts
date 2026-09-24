/* ============================================================
   THE FINDER, AS A DEALER DROVE IT, ON THE REAL FILE.

   The critique of Milestone 2's close (#8) typed four lines into Ctrl K
   and wrote down what came back. Each is asked again here, through the
   same three pieces the shell composes — `search()` with every match,
   `readLines` over the picker's own fleet, and `readFinder` — and every
   figure the assertions compare against is read off the pack by the
   reader that owns it, never typed.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { money } from '@/domain/money'
import type { EntityDef, RowData } from '@/domain/model'
import { isCostColumn } from '@/domain/quote/pricing'
import { priceReadOf } from '@/domain/modules/read'
import { buildSearchIndex, search, spaced, type SearchIndex } from '@/domain/catalogue/search'
import { spokenBoat } from '@/domain/quote/spoken'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { askedForFits, fitsFor } from '@/domain/shell/fits'
import { readFinder, type FinderLines, type FinderReading } from '@/domain/shell/finder'
import { fleetOf, modelByKey, type Fleet } from '@/screens/picker/fleet'
import { readLines } from './lines'

let entities: Record<string, EntityDef>
let rowsByEntity: Record<string, RowData[]>
let index: SearchIndex
let lines: FinderLines
let fleet: Fleet
let boatTables: Set<string>

const EVERY = { perTable: 5_000, total: 20_000, tables: 6, modules: 0, quotes: 5, columns: 0 }

beforeAll(async () => {
  const pack = await loadPack()
  entities = pack.ctx.entities
  rowsByEntity = pack.ctx.rowsByEntity
  index = buildSearchIndex(entities, rowsByEntity)
  const rowById = Object.fromEntries(
    Object.values(rowsByEntity).flatMap((rs) => rs.map((r) => [r.id, r])),
  )
  lines = readLines(entities, rowsByEntity, rowById)
  fleet = fleetOf(entities, rowsByEntity)
  boatTables = new Set(
    Object.values(entities)
      .filter((e) => e.kind === 'boat')
      .map((e) => e.id),
  )
})

/** What the finder answers to a line, composed exactly as the shell composes it. */
const ask = (query: string): FinderReading => {
  const question = askedForFits(query)
  const result = search(index, question ? question.boat : query, EVERY)
  const boats = result.groups
    .filter((g) => boatTables.has(g.table.id))
    .flatMap((g) => g.hits.map((h) => ({ tableId: g.table.id, rowId: h.rowId })))
  const fits =
    question && boats.length > 0
      ? { question, answer: fitsFor({ entities, rowsByEntity, views: {} }, boats, question.kind) }
      : null
  return readFinder({
    query,
    doors: [],
    acts: [],
    recent: [],
    result,
    people: [],
    boatTables,
    customerTableId: CUSTOMER_TABLE_ID,
    lines,
    fits,
  })
}

const rowWithCode = (code: string): { table: EntityDef; row: RowData } => {
  for (const table of Object.values(entities)) {
    const field = table.fields.find((f) => f.name === 'Model Code')
    if (!field) continue
    const row = (rowsByEntity[table.id] ?? []).find((r) => r.values[field.id] === code)
    if (row) return { table, row }
  }
  throw new Error(`no row is coded ${code}`)
}

describe('HBS126 — a code finds the one boat, and the verb is the sale', () => {
  it('answers the boat as something to quote, with its code lit and its price', () => {
    const { table, row } = rowWithCode('HBS126')
    const reading = ask('HBS126')
    const boats = reading.groups.find((g) => g.id === 'boats')!
    expect(reading.groups[0]).toBe(boats)
    const first = boats.rows[0]!
    expect(first.verb).toBe('Start a quote')
    expect(first.target).toEqual({ at: 'start', tableId: table.id, rowId: row.id })
    expect(first.code).toEqual({ text: 'HBS126', at: 0, length: 6 })
    /* the figure is the picker's own, the quote engine's read at the rung a quote opens at */
    const model = fleet.brands
      .flatMap((b) => b.models)
      .find((m) => m.variants.some((v) => v.rowId === row.id))!
    const amount = model.variants.find((v) => v.rowId === row.id)!.amount
    expect(first.figure).toBe(amount === null ? undefined : money(amount))
    /* and the maker's name is not repeated at the front of the boat's */
    expect(first.name.startsWith('Highfield')).toBe(false)
    /* the boat as a person says it, not the file's key (built-critique-m2-close-2.md) */
    expect(first.name).toBe('Sport 560 · Hypalon · Black / Black / Black')
    expect(first.fact).toContain(table.name)
  })

  it('keeps the file’s own line one row down, on the sheet', () => {
    const { table, row } = rowWithCode('HBS126')
    const boats = ask('HBS126').groups.find((g) => g.id === 'boats')!
    const sheet = boats.rows.find((r) => r.target.at === 'row')!
    expect(sheet.verb).toBe('Open it on the sheet')
    expect(sheet.target).toEqual({ at: 'row', tableId: table.id, rowId: row.id })
    expect(sheet.name).toBe(row.values[table.displayFieldId ?? ''])
  })
})

describe('sp560 — fifteen lines of the file, one boat', () => {
  it('is one line for the model, onto the picker’s own plate', () => {
    const boats = ask('sp560').groups.find((g) => g.id === 'boats')!
    const line = boats.rows[0]!
    expect(line.verb).toBe('Choose the version')
    expect(line.target.at).toBe('model')
    const key = line.target.at === 'model' ? line.target.model : ''
    const model = modelByKey(fleet, key)!
    /* the picker's own key, for the picker's own model — which holds every SP560 line */
    expect(model.shown).toBe(line.name)
    expect(line.fact).toContain(`${model.rows} versions`)
    /* the figure is the span of the versions' own prices */
    const amounts = model.variants.map((v) => v.amount).filter((n): n is number => n !== null)
    expect(line.figure).toBe(`${money(Math.min(...amounts))} – ${money(Math.max(...amounts))}`)
    /* and no boat line of this model is drawn twice */
    expect(boats.rows.filter((r) => r.target.at === 'start')).toHaveLength(0)
  })
})

describe('yamaha f90 — the motors first', () => {
  it('leads with the Yamaha motors, in the motors’ own ink, each with its price', () => {
    const reading = ask('yamaha f90')
    const first = reading.groups[0]!
    const table = entities[first.id.replace(/^rows:/, '')]!
    expect(table.kind).toBe('motor')
    expect(first.ink).toBe(table.accent)
    expect(first.rows[0]!.name.toLowerCase()).toMatch(/^yamaha - f90/)
    /* A PRICE, NEVER A COST: the figure is the list's first declared rung, and that column
       is not a cost column */
    const read = priceReadOf(table)!
    expect(isCostColumn(table, read.field)).toBe(false)
    for (const row of first.rows) {
      if (row.target.at !== 'row') continue
      const cell = rowsByEntity[table.id]!.find(
        (r) => r.id === (row.target as { rowId: string }).rowId,
      )!.values[read.field.id]
      if (typeof cell === 'number' && cell > 0) expect(row.figure).toBe(money(cell))
      else expect(row.figure).toBeUndefined()
    }
  })
})

describe('trailer for sp560 — the question that is not a name', () => {
  it('answers the trailers the file pairs with the SP560, then the boat', () => {
    const reading = ask('trailer for sp560')
    expect(reading.nothing).toBeNull()
    const [fits, boats] = reading.groups
    expect(fits!.id).toBe('fits')
    expect(fits!.title).toBe('Trailers for sp560')
    expect(fits!.rows.length).toBeGreaterThan(0)
    for (const row of fits!.rows) {
      const tableId = row.target.at === 'row' ? row.target.tableId : ''
      expect(entities[tableId]?.kind).toBe('trailer')
      expect(row.fact).toMatch(/^fits (all \d+|\d+ of \d+|it)/)
    }
    expect(boats!.id).toBe('boats')
    expect(boats!.rows[0]!.verb).toBe('Choose the version')
  })

  it('says so, above the boat, where the file pairs nothing of that kind', () => {
    /* a boat the file pairs no trailer with: found by asking every boat, not named here */
    let said = false
    for (const table of Object.values(entities)) {
      if (said) break
      if (table.kind !== 'boat') continue
      for (const row of rowsByEntity[table.id] ?? []) {
        const answer = fitsFor(
          { entities, rowsByEntity, views: {} },
          [{ tableId: table.id, rowId: row.id }],
          'trailer',
        )
        if (answer.fits.length > 0) continue
        const code = row.values[table.fields.find((f) => f.name === 'Model Code')?.id ?? '']
        if (typeof code !== 'string' || code === '') continue
        const reading = ask(`trailer for ${code}`)
        if (reading.groups.find((g) => g.id === 'fits')) continue
        expect(reading.note).toMatch(/^The price file pairs no trailer with the 1 boat matching/)
        /* and the boat is still there to quote, under the sentence */
        expect(reading.groups.find((g) => g.id === 'boats')?.rows[0]?.verb).toBe('Start a quote')
        said = true
        break
      }
    }
    expect(said, 'the file has a boat with no trailer paired, and it was asked').toBe(true)
  })
})

/* ============================================================
   THE NAMES THE SCREENS PRINT ARE THE NAMES IT FINDS
   (docs/directions/m2-last-critique.md, blocker 2).

   The round that named every boat as a person says it changed what the
   finder PRINTS and not what it MATCHES: Ctrl K answered "Nothing
   matches" for "sport 560", the words on the line it had just drawn for
   "sp560". Each line the critic typed is asked again here, and every
   expectation is read off the file by `spokenBoat` and the picker's own
   fleet — never typed.
   ============================================================ */

describe('the names the screens print — found, and sold', () => {
  const boatsOf = (query: string) => ask(query).groups.find((g) => g.id === 'boats')

  it('answers every name the critic typed with a boat, and never "Nothing matches"', () => {
    for (const query of [
      'sport 560',
      'highfield sport 560',
      'sport 560 hypalon',
      'patrol 700',
      'roll up 230',
      'haines signature fisher 525f',
      'jeanneau merry fisher 605',
      'adv7 black',
    ]) {
      const reading = ask(query)
      expect(reading.nothing, query).toBeNull()
      const boats = reading.groups.find((g) => g.id === 'boats')
      expect(boats, query).toBeDefined()
      expect(['Choose the version', 'Start a quote'], query).toContain(boats!.rows[0]!.verb)
    }
  })

  it('answers "sport 560" exactly as it answers "sp560": one line, onto the same plate', () => {
    const said = boatsOf('sport 560')!.rows[0]!
    const coded = boatsOf('sp560')!.rows[0]!
    expect(said.target).toEqual(coded.target)
    expect(said.name).toBe(coded.name)
    expect(said.fact).toBe(coded.fact)
    expect(said.figure).toBe(coded.figure)
    /* and it lights the words it was asked for, on the name it prints */
    const at = said.at ?? -1
    expect(at).toBeGreaterThanOrEqual(0)
    expect(said.name.slice(at, at + (said.length ?? 0)).toLowerCase()).toBe('sport 560')
  })

  it('lights the words of the line that the name it prints holds', () => {
    const lit = (query: string): string => {
      const row = boatsOf(query)!.rows[0]!
      const at = row.at ?? -1
      return at < 0 ? '' : row.name.slice(at, at + (row.length ?? 0))
    }
    const sp560 = boatsOf('sp560')!.rows[0]!.name
    expect(lit('highfield sport 560')).toBe(sp560)
    expect(lit('sport 560 hypalon')).toBe(sp560)
    const adv7 = boatsOf('adv7 black')!.rows[0]!.name
    expect(lit('adv7 black')).toBe(adv7)
  })

  it('narrows by the material as the app says it: "sport 560 hypalon"', () => {
    const line = boatsOf('sport 560 hypalon')!.rows[0]!
    const key = line.target.at === 'model' ? line.target.model : ''
    const model = modelByKey(fleet, key)!
    const hypalon = model.variants.filter((v) => v.materialSaid === 'Hypalon').length
    expect(hypalon).toBeGreaterThan(0)
    expect(hypalon).toBeLessThan(model.rows)
    expect(line.fact).toContain(`${hypalon} of its ${model.rows} versions`)
  })

  it('reads the file’s words and the said ones together: "adv7 black" is the ADV7 in black', () => {
    const line = boatsOf('adv7 black')!.rows[0]!
    const key = line.target.at === 'model' ? line.target.model : ''
    const model = modelByKey(fleet, key)!
    expect(model.name).toBe('ADV7')
    const black = model.variants.filter((v) => /\bBlack\b/.test(v.say)).length
    expect(black).toBeGreaterThan(0)
    expect(line.fact).toContain(
      black === model.rows ? `${model.rows} versions` : `${black} of its ${model.rows} versions`,
    )
  })

  it('starts a quote on the very boat a one-line name names', () => {
    for (const query of ['haines signature fisher 525f', 'jeanneau merry fisher 605']) {
      const line = boatsOf(query)!.rows[0]!
      expect(line.verb, query).toBe('Start a quote')
      const rowId = line.target.at === 'start' ? line.target.rowId : ''
      const tableId = line.target.at === 'start' ? line.target.tableId : ''
      const table = entities[tableId]!
      const row = rowsByEntity[tableId]!.find((r) => r.id === rowId)!
      const say = spokenBoat(table.id, String(row.values[table.displayFieldId ?? ''])).say
      expect(spaced(say), query).toContain(spaced(query))
    }
  })

  it('names a one-line boat with the words its card uses, never the Model Code', () => {
    /* it read "Fisher 525F", the file's Model Code, where the card says
       "Signature Fisher 525F" and the build "Haines Signature Fisher 525F" */
    const line = boatsOf('haines signature fisher 525f')!.rows[0]!
    expect(line.name).toBe('Signature Fisher 525F')
    expect(line.fact).toBe('Haines Signature')
    /* and its Model Code, every word of which the name already says, is not printed beside it */
    expect(line.code).toBeUndefined()
  })

  it('never prints a code beside a name that reads the same', () => {
    /* Haines files "Fisher 525F" as its Model Code and the line read "Fisher 525F  Fisher
       525F" at 834 on 2026-09-24. Every boat of every maker is asked by its own code. */
    let asked = 0
    for (const table of Object.values(entities)) {
      if (table.kind !== 'boat') continue
      const field = table.fields.find((f) => f.name === 'Model Code')
      if (!field) continue
      for (const row of (rowsByEntity[table.id] ?? []).slice(0, 12)) {
        const code = row.values[field.id]
        if (typeof code !== 'string' || code.trim().length < 2) continue
        for (const line of boatsOf(code)?.rows ?? []) {
          if (line.target.at !== 'start' || !line.code) continue
          expect(spaced(line.code.text), code).not.toBe(spaced(line.name))
        }
        asked += 1
      }
    }
    expect(asked).toBeGreaterThan(0)
  })

  it('asks what fits a boat by its said name as it asks by its code', () => {
    const said = ask('trailer for sport 560').groups.find((g) => g.id === 'fits')!
    const coded = ask('trailer for sp560').groups.find((g) => g.id === 'fits')!
    expect(said.rows.map((r) => r.id)).toEqual(coded.rows.map((r) => r.id))
    expect(said.rows.map((r) => r.fact)).toEqual(coded.rows.map((r) => r.fact))
  })

  it('still lights the code when the code is what was typed', () => {
    const { table, row } = rowWithCode('HBS126')
    const first = boatsOf('HBS126')!.rows[0]!
    expect(first.target).toEqual({ at: 'start', tableId: table.id, rowId: row.id })
    expect(first.code).toEqual({ text: 'HBS126', at: 0, length: 6 })
  })
})
