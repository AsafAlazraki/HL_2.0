import { beforeAll, describe, expect, it } from 'vitest'
import {
  isDiscontinued,
  type EntityDef,
  type ModuleDef,
  type PriceLevel,
  type QuoteDef,
  type RowData,
} from '@/domain/model'
import { pictureBook, type PictureBook } from '@/domain/model/pictures'
import { countBoats } from '@/domain/quote/boats'
import { apply, isDone } from '@/domain/catalogue/commands'
import { emptySheet, type CatalogueData } from '@/domain/catalogue/sheet'
import { LINE_MAX, dressPlace, lineTooLong } from '@/domain/catalogue/placeCommands'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import imagesRaw from '../../../data/northside/images.json?raw'
import marksRaw from '../../../data/northside/marks-ledger.json?raw'
import picturesRaw from '../../../data/northside/pictures.json?raw'
import { placesOf, type Place } from './places'
import { readTableRegister, type TableRegister } from './register'
import {
  GROUNDS,
  GROUND_FLOOR,
  addressOf,
  dressOf,
  goesWith,
  groundOf,
  heroesOf,
  holdsSay,
  factsOf,
  liveryHero,
  liveryMark,
  placeAt,
  placeFigure,
  placeQuotes,
  rangeOf,
  tablesOfPlace,
} from './livery'

/* ============================================================
   A PLACE'S LIVERY, READ OFF THE REAL PACK AND THE MARKS AND
   PHOTOGRAPHS THE APP SHIPS WITH. Every figure is walked out of the
   fixture and then looked for in the reading; the only things typed
   are what the sweep counted by hand (docs/research/refs/places/
   notes.md §0), asserted so the sweep and the engine agree.
   ============================================================ */

let pack: PackFixture
let tables: Record<string, EntityDef>
let rows: Record<string, RowData[]>
let modules: Record<string, ModuleDef>
let reg: TableRegister
let places: Place[]
let book: PictureBook
let models: Map<string, number>

const byName = (name: string): Place => {
  const p = places.find((x) => x.name === name)
  if (!p) throw new Error(`no place called ${name}`)
  return p
}

beforeAll(async () => {
  pack = await loadPack()
  tables = {}
  for (const e of pack.entities) tables[e.id] = e
  rows = pack.rowsByEntity
  modules = pack.ctx.modules as Record<string, ModuleDef>
  const levels: Record<string, PriceLevel[]> = {}
  for (const t of pack.manifest.tables) levels[t.id] = t.priceLevels ?? []
  reg = readTableRegister(tables, rows, modules, levels)
  places = placesOf(modules, tables, rows)
  book = pictureBook(
    {
      images: JSON.parse(imagesRaw),
      pictures: JSON.parse(picturesRaw),
      marks: JSON.parse(marksRaw),
    },
    '/',
  )
  models = new Map(countBoats(tables, rows).byMaker.map((m) => [m.id, m.boats]))
})

describe('where a place is', () => {
  it('gives each of the 25 places one address, the table it stands for, and finds it again', () => {
    expect(places).toHaveLength(25)
    const addresses = places.map((p) => addressOf(p, modules))
    expect(new Set(addresses).size).toBe(25)
    expect(addresses).toContain('boat_highfield')
    expect(addresses).toContain('registration')
    for (const p of places) expect(placeAt(places, modules, addressOf(p, modules))).toBe(p)
    expect(placeAt(places, modules, 'nowhere')).toBeUndefined()
  })

  it('reads a module that is one place as its one table', () => {
    const fit = byName('Dealer Fit Packages')
    expect(fit.tableId).toBeUndefined()
    expect(tablesOfPlace(fit, modules)).toEqual(['dealer_fit'])
  })
})

describe('every figure is the one /data prints', () => {
  it('counts a boat maker in models in its series, as Data’s plate does', () => {
    const highfield = byName('Highfield Inflatables')
    const facts = factsOf(reg, 'boat_highfield')!
    const said = holdsSay(facts, models.get('boat_highfield'))
    expect(said).toBe(`${models.get('boat_highfield')} models ${facts.branchSay}`)
    expect(placeFigure(tablesOfPlace(highfield, modules), reg, models, tables, rows).holds).toBe(
      said,
    )
  })

  it('prints the whole list and says what is no longer sold beside it, never a smaller total', () => {
    const parts = byName('Parts & Accessories')
    const all = rows['parts']!.length
    const gone = rows['parts']!.filter((r) => isDiscontinued(r)).length
    const fig = placeFigure(tablesOfPlace(parts, modules), reg, models, tables, rows)
    expect(fig.holds.startsWith(all.toLocaleString('en-AU'))).toBe(true)
    expect(fig.holds).toBe(factsOf(reg, 'parts')!.holds)
    if (gone > 0) expect(fig.held).toBe(`${gone.toLocaleString('en-AU')} no longer sold`)
    /* Rigging Kits' 28: the board printed 622 against Data's 650 with nothing saying why */
    const rig = placeFigure(['rig_kits'], reg, models, tables, rows)
    expect(rig.holds).toBe(factsOf(reg, 'rig_kits')!.holds)
  })

  it('says a list no longer sold is no longer sold', () => {
    const fig = placeFigure(['trl_obsolete'], reg, models, tables, rows)
    expect(fig.held).toBe('No longer sold')
  })
})

describe('the ground', () => {
  it('offers only grounds white words clear at 4.5 : 1, measured', () => {
    expect(GROUNDS.length).toBeGreaterThanOrEqual(6)
    for (const g of GROUNDS) expect(g.contrast).toBeGreaterThanOrEqual(GROUND_FLOOR)
  })

  it('stands a place on its kind’s ink until Northside picks, and on its pick after', () => {
    const stacer = byName('Stacer')
    expect(groundOf(stacer, {}).key).toBe('cobalt')
    expect(groundOf(stacer, { ground: 'carmine' }).key).toBe('carmine')
    expect(groundOf(byName('Yamaha Outboards'), {}).key).toBe('carmine')
    expect(groundOf(byName('OBSOLETE Trailers — No Longer Available'), {}).key).toBe('graphite')
  })
})

describe('the mark', () => {
  it('wears the maker’s white ink on the ground where it is shipped', () => {
    const m = liveryMark('Stabicraft', {}, book)
    expect(m.drawn && m.mark.on).toBe('ground')
  })

  it('puts a maker shipped in its own colours only on a white plate', () => {
    for (const name of ['Formosa', 'Yamaha Outboards', 'Surtees', 'GFAB Trailers']) {
      const m = liveryMark(name, {}, book)
      expect(m.drawn && m.mark.on, name).toBe('plate')
    }
  })

  it('sets the name in type where no mark is shipped, and says so, with no stand-in', () => {
    for (const name of ['REDCO / Tinka Trailers', 'NSM Custom Trailers', 'Registration Costs']) {
      const m = liveryMark(name, {}, book)
      expect(m.drawn).toBe(false)
      if (!m.drawn) expect(m.because).toBe(`No mark for ${name} yet.`)
    }
  })

  it('follows Northside’s pick: Stacer’s own colours on a plate, or its name in type', () => {
    const plate = liveryMark('Stacer', { mark: { from: 'maker', ink: 'dark' } }, book)
    expect(plate.drawn && plate.mark.on).toBe('plate')
    expect(liveryMark('Stacer', { mark: { from: 'name' } }, book).drawn).toBe(false)
    const own = liveryMark(
      'REDCO / Tinka Trailers',
      { mark: { from: 'own', image: { id: 'x', src: 'https://example.test/m.svg' }, ink: 'dark' } },
      book,
    )
    expect(own.drawn && own.mark.own && own.mark.on).toBe('plate')
  })
})

describe('the photograph never lies', () => {
  it('offers a place only its own boats: Highfield 18, Stacer 11, Jeanneau and Yamaha none', () => {
    expect(heroesOf(['boat_highfield'], book)).toHaveLength(18)
    expect(heroesOf(['boat_stacer'], book)).toHaveLength(11)
    expect(heroesOf(['boat_jeanneau'], book)).toHaveLength(0)
    expect(heroesOf(['mot_yamaha'], book)).toHaveLength(0)
    for (const p of heroesOf(['boat_highfield'], book)) expect(p.table).toBe('boat_highfield')
  })

  it('captions every photograph with the model it shows', () => {
    const h = liveryHero('Highfield Inflatables', ['boat_highfield'], {}, book)
    expect(h.shown).toBe(true)
    if (h.shown && h.from === 'maker') {
      expect(h.caption).toBe(h.picture.subject)
      expect(h.caption).toMatch(/on the water$/)
    }
  })

  it('refuses another place’s photograph even when it is asked for by name', () => {
    const stacers = heroesOf(['boat_stacer'], book)
    const h = liveryHero(
      'Highfield Inflatables',
      ['boat_highfield'],
      { hero: { from: 'maker', id: stacers[0]!.id } },
      book,
    )
    expect(h.shown && h.from === 'maker' && h.picture.table).toBe('boat_highfield')
  })

  it('says why a place stands on no photograph', () => {
    const none = liveryHero('Jeanneau', ['boat_jeanneau'], {}, book)
    expect(none).toEqual({
      shown: false,
      because: 'No photograph of Jeanneau on the water yet.',
      chosen: false,
    })
    const off = liveryHero('Stacer', ['boat_stacer'], { hero: { from: 'none' } }, book)
    expect(off.shown).toBe(false)
  })
})

describe('its range, what goes with it, its quotes', () => {
  it('cuts a boat maker into its series in the price list’s order, models adding to the figure', () => {
    const range = rangeOf(
      tables['boat_highfield'],
      rows['boat_highfield']!,
      heroesOf(['boat_highfield'], book),
    )
    expect(range.length).toBe(factsOf(reg, 'boat_highfield')!.branches)
    expect(range.reduce((s, r) => s + r.models, 0)).toBe(models.get('boat_highfield'))
    expect(range.reduce((s, r) => s + r.pictured, 0)).toBe(18)
  })

  it('draws no range for a list with no headings', () => {
    expect(rangeOf(tables['labour_rates'], rows['labour_rates']!, [])).toEqual([])
  })

  it('reads what goes with Highfield from the lists that say what fits, most first', () => {
    const goes = goesWith(['boat_highfield'], reg.pairings, tables)
    const fromLists = new Map<string, number>()
    for (const p of reg.pairings)
      if (p.ownerId === 'boat_highfield' && !p.retired)
        fromLists.set(p.farId, (fromLists.get(p.farId) ?? 0) + p.rows)
    expect(goes.map((g) => g.fits)).toEqual(goes.map((g) => g.fits).toSorted((a, b) => b - a))
    expect(goes[0]!.name).toBe('Yamaha Outboards')
    for (const g of goes) expect(g.fits).toBe(fromLists.get(g.tableId))
    /* and from the other end */
    const yamaha = goesWith(['mot_yamaha'], reg.pairings, tables)
    expect(yamaha.find((g) => g.tableId === 'boat_highfield')?.fits).toBe(goes[0]!.fits)
  })

  it('finds a quote written on one of its boats or carrying one of its lines, newest first', () => {
    const q = (id: string, root: string, line: string, at: string) =>
      ({ id, rootTableId: root, lines: [{ entityId: line }], createdAt: at }) as unknown as QuoteDef
    const all = [
      q('a', 'boat_stacer', 'mot_yamaha', '2026-10-01'),
      q('b', 'boat_highfield', 'parts', '2026-10-02'),
      q('c', 'boat_highfield', 'mot_yamaha', '2026-10-03'),
    ]
    expect(placeQuotes(['boat_highfield'], all).map((x) => x.id)).toEqual(['c', 'b'])
    expect(placeQuotes(['mot_yamaha'], all).map((x) => x.id)).toEqual(['c', 'a'])
    expect(placeQuotes(['registration'], all)).toEqual([])
  })
})

describe('dressPlace, one step with its way back', () => {
  const sheet = (): CatalogueData => ({ ...emptySheet(), modules })

  it('sets one place’s livery, leaves its siblings alone, and Undo puts back exactly what was', () => {
    const stacer = byName('Stacer')
    const data = sheet()
    const done = apply(
      data,
      dressPlace(
        stacer.moduleId,
        'boat_stacer',
        { line: '  Our trailer boats  ', ground: 'carmine' },
        'Stacer is dressed.',
      ),
      '2026-10-29T00:00:00.000Z',
    )
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    expect(dressOf(stacer, done.next.modules)).toEqual({
      line: 'Our trailer boats',
      ground: 'carmine',
    })
    expect(dressOf(byName('Highfield Inflatables'), done.next.modules)).toEqual({})
    expect(done.event.kind).toBe('place-dressed')
    const back = done.inverse(done.next, '2026-10-29T00:00:01.000Z')
    expect(isDone(back)).toBe(true)
    if (isDone(back)) expect(back.next.modules[stacer.moduleId]?.dress).toBeUndefined()
  })

  it('refuses a line longer than a card, with the figure', () => {
    const stacer = byName('Stacer')
    const long = 'x'.repeat(LINE_MAX + 4)
    const out = dressPlace(stacer.moduleId, 'boat_stacer', { line: long }, '')(sheet(), 'now')
    expect(out).toEqual({ refused: lineTooLong(LINE_MAX + 4) })
  })

  it('does nothing, and says nothing, when nothing changes', () => {
    const stacer = byName('Stacer')
    expect(dressPlace(stacer.moduleId, 'boat_stacer', {}, '')(sheet(), 'now')).toEqual({
      refused: '',
    })
  })
})
