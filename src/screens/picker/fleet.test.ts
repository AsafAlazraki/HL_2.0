import { beforeAll, describe, expect, it } from 'vitest'
import { isDiscontinued, type EntityDef, type RowData } from '@/domain/model'
import { colourwayOf, splitVariant } from '@/domain/quote/colourway'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import {
  featuredOf,
  flagshipOf,
  fleetOf,
  coverWords,
  markScale,
  matchModels,
  modelByKey,
  seriesOf,
  shownName,
  unreadTokens,
  variantsIn,
  type Brand,
  type Model,
} from './fleet'

/* ============================================================
   The shelf, read off the real pack.

   NO NUMBER IN THIS FILE IS TYPED INTO AN ASSERTION. Every expected
   figure is walked out of `data/northside/` by the test itself and
   then compared with what the module answered, so a test cannot agree
   with a module that has drifted from the file: both have to agree
   with the price file. The one exception is named where it happens —
   the four undecoded colourway tokens, which `docs/STATUS.md` question
   3 asks the dealer about by name, and which the test also proves the
   decoder genuinely cannot read.
   ============================================================ */

let pack: PackFixture
let tables: Record<string, EntityDef>
let rows: Record<string, RowData[]>

beforeAll(async () => {
  pack = await loadPack()
  tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
  rows = pack.rowsByEntity
})

const boats = (): EntityDef[] => pack.entities.filter((e) => e.kind === 'boat')
const cashOf = (table: EntityDef, row: RowData): number | null => {
  const field = (table.priceLevels ?? []).find((l) => l.key === 'cash')?.fieldId
  const held = field === undefined ? null : row.values[field]
  return typeof held === 'number' && held > 0 ? held : null
}

describe('the registers, counted', () => {
  /* BY NAME, AND THE MODULE'S OWN HEADER SAYS WHY: the store holds the
     pack's table order on the visit that reads the file and the
     repository's — alphabetical by id — on every visit after it, so
     the file's order is not a thing this screen can be given twice. */
  it('reads every boat register in the file, in an order that is the same on every visit', () => {
    const fleet = fleetOf(tables, rows)
    expect(fleet.brands.map((b) => b.id).toSorted()).toEqual(
      boats()
        .map((e) => e.id)
        .toSorted(),
    )
    expect(fleet.brands.map((b) => b.name)).toEqual(
      boats()
        .map((e) => e.name)
        .toSorted((a, b) => a.localeCompare(b, 'en-AU')),
    )
    /* and the order does not depend on the order it was handed: the
       same sheet, shuffled, reads the same */
    const shuffled = Object.fromEntries(Object.entries(tables).toReversed())
    expect(fleetOf(shuffled, rows).brands.map((b) => b.id)).toEqual(fleet.brands.map((b) => b.id))
  })

  it('counts each register’s rows off the sheet, not off the manifest header', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      expect(brand.rows, brand.name).toBe(rows[brand.id].length)
    }
    const all = boats().reduce((n, e) => n + rows[e.id].length, 0)
    expect(fleet.rows).toBe(all)
  })

  it('names the rung every register prices at, from the register’s own declaration', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      const declared = (tables[brand.id].priceLevels ?? []).find((l) => l.key === 'cash')
      expect(brand.rung, brand.name).toBe(declared?.label ?? '')
    }
    /* one rung name across the seven, so the masthead may say it once */
    expect(fleet.rung).toBe(fleet.brands[0].rung)
  })
})

describe('the collapse from rows to models', () => {
  it('collapses a three-level register onto series and model, and leaves the others alone', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      const table = tables[brand.id]
      const levels = table.hierarchy ?? []
      const expected =
        levels.length >= 3
          ? new Set(
              rows[brand.id].map((row) =>
                levels
                  .slice(0, -1)
                  .map((id) => String(row.values[id] ?? '').trim())
                  .join(' ▸ '),
              ),
            ).size
          : rows[brand.id].length
      expect(brand.models.length, brand.name).toBe(expected)
    }
  })

  it('files every model under the series the file files its rows under', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      const table = tables[brand.id]
      const levels = table.hierarchy ?? []
      const expected =
        levels.length >= 2
          ? new Set(rows[brand.id].map((row) => String(row.values[levels[0]] ?? '').trim())).size
          : 1
      expect(brand.series.length, brand.name).toBe(expected)
      /* every row of the register is in exactly one series */
      expect(brand.series.reduce((n, s) => n + s.rows, 0)).toBe(brand.rows)
    }
  })

  /* A GROUP IS NOT A SERIES. Two registers on this sheet leave the
     series cell blank on some rows and a third files no series column
     at all; those rows land in a group that says so, and a masthead
     that counted the groups would print series the file does not have. */
  it('counts the series the file NAMES, never the blank group a row falls into', () => {
    const fleet = fleetOf(tables, rows)
    let named = 0
    for (const table of boats()) {
      const levels = table.hierarchy ?? []
      if (levels.length < 2) continue
      named += new Set(
        rows[table.id]
          .map((row) => String(row.values[levels[0]] ?? '').trim())
          .filter((v) => v !== ''),
      ).size
    }
    expect(fleet.series).toBe(named)
    expect(fleet.series).toBeLessThan(fleet.brands.reduce((n, b) => n + b.series.length, 0))
  })

  it('a model is every row of it, and nothing is lost between the two counts', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      expect(
        brand.models.reduce((n, m) => n + m.variants.length, 0),
        brand.name,
      ).toBe(brand.rows)
    }
    expect(fleet.models).toBe(fleet.brands.reduce((n, b) => n + b.models.length, 0))
  })
})

describe('the figure, and the rung it was read at', () => {
  it('takes a model’s from-price as the lowest figure any of its rows carries', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      const table = tables[brand.id]
      const byId = new Map(rows[brand.id].map((row) => [row.id, row]))
      for (const model of brand.models) {
        const held = model.variants
          .map((v) => cashOf(table, byId.get(v.rowId) as RowData))
          .filter((n): n is number => n !== null)
        expect(model.from, `${brand.name} ${model.name}`).toBe(
          held.length === 0 ? null : Math.min(...held),
        )
        expect(model.to).toBe(held.length === 0 ? null : Math.max(...held))
      }
    }
  })

  it('a zero is not a price: it is counted and handed back as no figure', () => {
    const fleet = fleetOf(tables, rows)
    let zeroes = 0
    for (const brand of fleet.brands) {
      const field = (tables[brand.id].priceLevels ?? []).find((l) => l.key === 'cash')?.fieldId
      zeroes += rows[brand.id].filter((row) => row.values[field ?? ''] === 0).length
    }
    expect(fleet.zeroes).toBe(zeroes)
    expect(fleet.priced + fleet.zeroes).toBe(fleet.rows)

    /* the registers this actually happens on say so model by model */
    const unpriced = fleet.brands.flatMap((b) => b.models).filter((m) => m.from === null)
    expect(unpriced.length).toBeGreaterThan(0)
    for (const model of unpriced) {
      expect(model.zeroes + model.priced).toBe(model.rows)
      expect(model.priced).toBe(0)
    }
  })
})

describe('the variant, which is material and colourway', () => {
  it('splits every row’s variant cell the way the domain splits it', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      const table = tables[brand.id]
      const levels = table.hierarchy ?? []
      const field = levels.length >= 3 ? levels[levels.length - 1] : undefined
      const byId = new Map(rows[brand.id].map((row) => [row.id, row]))
      for (const model of brand.models) {
        for (const variant of model.variants) {
          const row = byId.get(variant.rowId) as RowData
          const cell = field === undefined ? '' : String(row.values[field] ?? '').trim()
          expect(variant.cell).toBe(cell)
          expect(variant.material).toBe(splitVariant(cell).material)
          expect(variant.code).toBe(splitVariant(cell).code)
        }
      }
    }
  })

  it('groups a model’s rows by material, and prices each group from its own rows', () => {
    const fleet = fleetOf(tables, rows)
    const deep = fleet.brands.find((b) => (tables[b.id].hierarchy ?? []).length >= 3) as Brand
    expect(deep).toBeDefined()
    for (const model of deep.models) {
      expect(model.materials.reduce((n, g) => n + g.variants.length, 0)).toBe(model.rows)
      for (const group of model.materials) {
        const held = group.variants.map((v) => v.amount).filter((n): n is number => n !== null)
        expect(group.from).toBe(held.length === 0 ? null : Math.min(...held))
        expect(group.to).toBe(held.length === 0 ? null : Math.max(...held))
      }
    }
  })

  it('hands back the codes the decoder cannot read, and never a guess at them', () => {
    const fleet = fleetOf(tables, rows)
    const found = new Set<string>()
    for (const brand of fleet.brands) {
      for (const model of brand.models) for (const token of unreadTokens(model)) found.add(token)
    }
    /* every token this module calls unread really is one the domain's
       own decoder refuses, and every token it does not call unread
       really does decode */
    for (const token of found) expect(colourwayOf(token).read, token).toBe(false)

    /* the four docs/STATUS.md question 3 names are all of them, and
       they are named here rather than counted because the question is
       the point: nobody has decoded them, and nothing invents one */
    expect([...found].toSorted()).toEqual(['I', 'O', 'R', 'WH'])

    /* a code with an unread token keeps the code as what a face prints */
    const withUnread = fleet.brands
      .flatMap((b) => b.models)
      .flatMap((m) => m.variants)
      .filter((v) => v.unread.length > 0)
    expect(withUnread.length).toBeGreaterThan(0)
    for (const variant of withUnread) {
      expect(variant.reads).toBe(false)
      expect(variant.coded).toBe(true)
      expect(variant.say).toBe(variant.code)
    }
  })

  /* THE OTHER WAY A CELL FAILS TO DECODE, AND IT IS NOT A MYSTERY.
     Five Adventure rows name their colourway in plain English, so
     there is no code there to look up and nothing to ask the dealer
     about. Calling those "not decoded" would invent a question the
     sheet has already answered. */
  it('treats a colourway the file names in words as a word, not as a code', () => {
    const fleet = fleetOf(tables, rows)
    const worded = fleet.brands
      .flatMap((b) => b.models)
      .flatMap((m) => m.variants)
      .filter((v) => v.code !== '' && !v.coded)
    expect(worded.length).toBeGreaterThan(0)
    for (const variant of worded) {
      expect(variant.unread).toEqual([])
      expect(variant.say).toBe(variant.code)
      expect(/[a-z]/.test(variant.code), variant.code).toBe(true)
    }
  })

  it('narrows a model’s rows to one material', () => {
    const fleet = fleetOf(tables, rows)
    const model = fleet.brands.flatMap((b) => b.models).find((m) => m.materials.length > 1) as Model
    expect(model).toBeDefined()
    const first = model.materials[0]
    expect(variantsIn(model, first.name)).toEqual(first.variants)
    expect(variantsIn(model, null)).toEqual(model.variants)
  })
})

describe('finding one', () => {
  it('matches word by word over the register, the trail and the name', () => {
    const fleet = fleetOf(tables, rows)
    const all = fleet.brands.flatMap((b) => b.models)
    const brand = fleet.brands[0]
    const hits = matchModels(all, brand.name)
    expect(hits.length).toBe(brand.models.length)

    const series = brand.series.find((s) => s.name !== '')
    if (series) {
      const under = matchModels(all, `${brand.name} ${series.name}`)
      expect(under.length).toBe(series.models.length)
    }

    expect(matchModels(all, '   ').length).toBe(all.length)
    expect(matchModels(all, 'zzzzz-nothing-is-called-this').length).toBe(0)
  })

  it('keeps the file’s own series order when the list is narrowed', () => {
    const fleet = fleetOf(tables, rows)
    const brand = fleet.brands.find((b) => b.series.length > 2) as Brand
    const keep = new Set(brand.models.slice(0, 5).map((m) => m.key))
    const cut = seriesOf(brand, keep)
    expect(cut.map((s) => s.key)).toEqual(
      brand.series.filter((s) => s.models.some((m) => keep.has(m.key))).map((s) => s.key),
    )
    expect(cut.reduce((n, s) => n + s.models.length, 0)).toBe(keep.size)
  })

  it('finds a model by the key a search param carries', () => {
    const fleet = fleetOf(tables, rows)
    const wanted = fleet.brands[0].models[2]
    expect(modelByKey(fleet, wanted.key)).toBe(wanted)
    expect(modelByKey(fleet, null)).toBeNull()
    expect(modelByKey(fleet, 'nothing-is-keyed-this')).toBeNull()
  })

  /* HOME'S PHOTOGRAPH OPENS ITS OWN BOAT HERE (the M2-close critique,
     finding 18, and 11 behind it): it names a row the picture depicts,
     and that row is any one of the model's versions. */
  it('finds the model a row is one version of, for a key that is not its anchor', () => {
    const fleet = fleetOf(tables, rows)
    const split = fleet.brands.flatMap((b) => b.models).find((m) => m.variants.length > 2) as Model
    expect(split).toBeDefined()
    const later = split.variants.at(-1)!
    expect(later.rowId).not.toBe(split.key)
    expect(modelByKey(fleet, later.rowId)).toBe(split)
  })
})

describe('a name set as a cover', () => {
  it('sets the model large and what the file adds in brackets under it', () => {
    expect(coverWords('539 Sea Ranger SDF (Centre Console)')).toEqual({
      main: '539 Sea Ranger SDF',
      rest: 'Centre Console',
    })
    expect(coverWords('SP760WL(Windlass)')).toEqual({ main: 'SP760WL', rest: 'Windlass' })
  })

  it('keeps a name with no bracket, or with nothing either side of one, whole', () => {
    expect(coverWords('2750 Ultra Centrecab')).toEqual({ main: '2750 Ultra Centrecab', rest: '' })
    expect(coverWords('(PVC) WH')).toEqual({ main: '(PVC) WH', rest: '' })
    expect(coverWords('ADV7 ()')).toEqual({ main: 'ADV7 ()', rest: '' })
  })

  it('never drops a word the file wrote', () => {
    const fleet = fleetOf(tables, rows)
    for (const model of fleet.brands.flatMap((b) => b.models)) {
      const { main, rest } = coverWords(model.shown)
      const said = `${main} ${rest}`.replace(/[()\s]/g, '')
      expect(said, model.shown).toBe(model.shown.replace(/[()\s]/g, ''))
    }
  })
})

describe('what is held back', () => {
  it('names the registers it held something back from, and only those', () => {
    const fleet = fleetOf(tables, rows)
    const retired = boats().filter((e) => e.retired === true)
    const withGone = boats().filter(
      (e) => e.retired !== true && rows[e.id].some((r) => isDiscontinued(r)),
    )
    expect(fleet.heldBack.map((h) => h.id).toSorted()).toEqual(
      [...retired, ...withGone].map((e) => e.id).toSorted(),
    )
    for (const held of fleet.heldBack) expect(held.sentence.length).toBeGreaterThan(0)
  })

  it('never lists a row the catalogue must not offer', () => {
    const fleet = fleetOf(tables, rows)
    const offered = new Set(
      fleet.brands.flatMap((b) => b.models).flatMap((m) => m.variants.map((v) => v.rowId)),
    )
    const gone = boats().flatMap((table) => rows[table.id].filter((row) => isDiscontinued(row)))
    expect(gone.filter((row) => offered.has(row.id))).toEqual([])
    /* and everything that is not held back IS offered, so the refusal
       above cannot be passing by listing nothing at all */
    const live = boats().flatMap((table) => rows[table.id].filter((row) => !isDiscontinued(row)))
    expect(live.filter((row) => !offered.has(row.id))).toEqual([])
  })
})

describe('the name a card prints', () => {
  it('takes the maker off the front of a name that carries it, and changes nothing else', () => {
    expect(shownName('Formosa - GRT 425 (Tiller)', 'Formosa')).toBe('GRT 425 (Tiller)')
    expect(shownName('Stacer - 309 Skimma', 'Stacer')).toBe('309 Skimma')
    /* the register's first word is the maker, "Highfield Inflatables" */
    expect(shownName('Highfield - SP560', 'Highfield Inflatables')).toBe('SP560')
    /* the workbook's runs of spaces are one */
    expect(shownName('Merry Fisher  -  695 S2', 'Jeanneau')).toBe('Merry Fisher - 695 S2')
  })

  it('never rewrites a name that does not begin with its maker, typos included', () => {
    expect(shownName('SP560', 'Highfield Inflatables')).toBe('SP560')
    expect(shownName('Surtess  -  770 Game Fisher XL', 'Surtees')).toBe(
      'Surtess - 770 Game Fisher XL',
    )
    expect(shownName('Signature Fisher - 525F', 'Haines Signature')).toBe('Signature Fisher - 525F')
    /* a name that is nothing but its maker keeps it */
    expect(shownName('Formosa - ', 'Formosa')).toBe('Formosa -')
  })

  it('is what every model on the file carries, and never empty', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      for (const model of brand.models) {
        expect(model.shown).toBe(shownName(model.name, brand.name))
        expect(model.shown).not.toBe('')
      }
    }
    /* and on this file the maker really is taken off somewhere, so the
       case above is not passing by changing nothing at all */
    expect(fleet.brands.flatMap((b) => b.models).some((m) => m.shown !== m.name.trim())).toBe(true)
  })
})

const top = (m: Model): number => m.to ?? m.from ?? -1
const held = (m: Model): boolean => m.img !== undefined

describe('the picture on a maker’s door', () => {
  it('is the dearest model the ledger holds a picture of, counted off the file', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) {
      const flagship = flagshipOf(brand, held)
      const pictured = brand.models.filter((m) => held(m) && (m.to ?? m.from) !== null)
      if (pictured.length === 0) {
        /* no price on file anywhere: the first boat it holds a picture of */
        expect(flagship).toBe(brand.models.find(held) ?? null)
        continue
      }
      expect(flagship).not.toBeNull()
      const dearest = Math.max(...pictured.map(top))
      expect(top(flagship as Model)).toBe(dearest)
      /* ties keep the file's order */
      expect(flagship).toBe(pictured.find((m) => top(m) === dearest))
    }
  })

  it('is nothing when nothing is held, rather than a stand-in', () => {
    const fleet = fleetOf(tables, rows)
    for (const brand of fleet.brands) expect(flagshipOf(brand, () => false)).toBeNull()
  })
})

describe('the door drawn twice as wide', () => {
  it('is the maker with the most models, when it fills the last row', () => {
    const fleet = fleetOf(tables, rows)
    const featured = featuredOf(fleet)
    if ((fleet.brands.length + 1) % 4 !== 0) {
      expect(featured).toBeNull()
      return
    }
    const most = Math.max(...fleet.brands.map((b) => b.models.length))
    const brand = fleet.brands.find((b) => b.id === featured) as Brand
    expect(brand.models.length).toBe(most)
  })

  it('singles nobody out when one wide door would not fill the grid', () => {
    const fleet = fleetOf(tables, rows)
    expect(featuredOf({ ...fleet, brands: fleet.brands.slice(0, 4) })).toBeNull()
    expect(featuredOf({ ...fleet, brands: fleet.brands.slice(0, 5) })).toBeNull()
    expect(featuredOf(fleetOf({}, {}))).toBeNull()
  })
})

describe('a mark’s height', () => {
  it('draws marks of every shape at the same area, clamped at both ends', () => {
    expect(markScale(400, 100)).toBe(1)
    /* a long mark is drawn shorter, a square one taller */
    expect(markScale(1672, 288)).toBeLessThan(1)
    expect(markScale(850, 466)).toBeGreaterThan(1)
    expect(markScale(5000, 100)).toBe(0.7)
    expect(markScale(100, 100)).toBe(1.6)
    /* and a ledger row with no size is drawn at the plain height */
    expect(markScale(0, 100)).toBe(1)
  })
})
