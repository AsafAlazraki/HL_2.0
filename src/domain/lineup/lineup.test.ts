/* A maker's own page reads its range off the real price list: each model's measures, the spans
   its head prints with their denominators, the order its models stand in, the compare's rows,
   and the lists that are not boat makers read as their own ranges with nothing dropped. */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { isDiscontinued, type RowData } from '@/domain/model'
import { modelKeyOf } from '@/domain/quote/boats'
import {
  hpSaid,
  measureOf,
  measureSaid,
  measuresOf,
  threeFacts,
  wordsSaid,
  type Measure,
} from './measure'
import {
  compareRows,
  headingSaid,
  lengthSpan,
  levelsRead,
  ordered,
  spanAt,
  NOTHING_FILED,
} from './range'
import { boatSizeSaid, chargeOf, findOnShelf, isRig, shelfOf, trailerLengthSaid } from './shelf'

let pack: PackFixture
beforeAll(async () => {
  pack = await loadPack()
})

const table = (id: string) => pack.ctx.entities[id]!
const rows = (id: string) => pack.ctx.rowsByEntity[id] ?? []
/** a model's rows, by its Model Code, as the page groups them */
function modelRows(id: string, code: string): RowData[] {
  const t = table(id)
  const anchor = rows(id).find((r) => JSON.stringify(r.values).includes(`"${code}"`))!
  const key = modelKeyOf(t, anchor)
  return rows(id).filter((r) => !isDiscontinued(r) && modelKeyOf(t, r) === key)
}

describe('a model, measured from its own rows', () => {
  it('reads the Sport 660 as the file carries it across its 16 versions', () => {
    const t = table('boat_highfield')
    const r = modelRows('boat_highfield', 'HBS145')
    expect(r.length).toBe(16)
    const m = measuresOf(t, r)
    expect(measureSaid('length', m.length)).toBe('6.52 m')
    expect(measureSaid('beam', m.beam)).toBe('2.59 m')
    expect(measureSaid('load', m.load)).toBe('1,287 kg')
    expect(measureSaid('weight', m.weight)).toBe('740 kg')
    expect(measureSaid('fuel', m.fuel)).toBe('140 L')
    expect(threeFacts(t, m)).toEqual({
      length: '6.52 m',
      people: '13 people',
      peopleUnfiled: false,
      hp: '150–200 hp',
    })
  })

  it('says where the file leaves a column empty, and only where it files the column', () => {
    const hf = table('boat_highfield')
    /* SP300 carries no Max People on any version (directions.md, correction 1) */
    const sp300 = measuresOf(hf, modelRows('boat_highfield', 'HBS001'))
    expect(threeFacts(hf, sp300).people).toBeNull()
    expect(threeFacts(hf, sp300).peopleUnfiled).toBe(true)
    /* Stacer files no people column at all, so a Stacer card says nothing of people */
    const st = table('boat_stacer')
    const first = rows('boat_stacer').find((r) => !isDiscontinued(r))!
    expect(threeFacts(st, measuresOf(st, [first])).peopleUnfiled).toBe(false)
  })

  it('reads a twin as a rig, "up to" where no least is filed, and the file’s own words otherwise', () => {
    const span = (lo: number, hi: number): Measure => ({ kind: 'span', lo, hi, n: 1, of: 1 })
    const words = (...w: string[]): Measure => ({ kind: 'words', words: w, n: 1, of: 1 })
    expect(hpSaid(words('2 x 350 HP'), words('2 x 450 HP'))).toBe('2 × 350–450 hp')
    expect(hpSaid(null, span(250, 250))).toBe('up to 250 hp')
    expect(hpSaid(span(150, 150), words('TBA'))).toBe('150 hp to TBA')
    expect(hpSaid(null, null)).toBeNull()
    /* a choice the file writes with a slash is said for each count of motors, singles first
       (Highfield's Sport 800, Sport 900 and ADV9, as the file carries them) */
    expect(hpSaid(span(250, 250), words('350 / 2 x 200 HP'))).toBe('250–350 hp or up to 2 × 200 hp')
    expect(hpSaid(words('2 x 300HP'), words('425 / 2 x 300 HP'))).toBe('up to 425 hp or 2 × 300 hp')
    expect(hpSaid(span(450, 450), words('450 / 2 x 300 HP'))).toBe('450 hp or up to 2 × 300 hp')
    expect(wordsSaid('2 x 480 ltr')).toBe('2 × 480 L')
    expect(wordsSaid('External Tank')).toBe('External Tank')
  })

  it('reads a cell the file wrote with its unit as the figure', () => {
    const hf = table('boat_highfield')
    const m = measureOf(hf, modelRows('boat_highfield', 'HBS145'), 'maxHp')
    expect(m).toEqual({ kind: 'span', lo: 200, hi: 200, n: 16, of: 16 })
  })
})

describe('the range, spanned with its denominators', () => {
  it('spans Highfield at Cash: $2,770 to $198,610, 588 of 588 priced, 2.3 to 9.2 m', () => {
    const t = table('boat_highfield')
    const live = rows('boat_highfield').filter((r) => !isDiscontinued(r))
    const cash = t.priceLevels!.find((l) => l.label === 'Cash')!
    expect(spanAt(live, cash.fieldId)).toEqual({ lo: 2770, hi: 198610, priced: 588, of: 588 })
    expect(lengthSpan([measuresOf(t, live)])).toEqual({ lo: 2.3, hi: 9.2 })
  })

  it('shows Cash and Trade, and keeps Warranty, worked from landed cost, as Northside’s own', () => {
    const read = levelsRead(table('boat_highfield'))
    expect(read.shown.map((l) => l.label)).toEqual(['Cash', 'Trade'])
    expect(read.kept.map((l) => l.label)).toEqual(['Warranty'])
    expect(levelsRead(table('labour_rates'))).toEqual({ shown: [], kept: [] })
  })

  it('says a heading the file wrote in capitals as a person says it, and leaves mixed case alone', () => {
    expect(headingSaid('SKIMMAS')).toBe('Skimmas')
    expect(headingSaid('OCEAN RANGER SDFS')).toBe('Ocean Ranger SDFs')
    expect(headingSaid('OUTLAW · TILLER STEERS')).toBe('Outlaw · Tiller Steers')
    expect(headingSaid('REDCO - Sportsman Trailers')).toBe('REDCO - Sportsman Trailers')
    expect(headingSaid('Sport')).toBe('Sport')
  })

  it('orders by price and by length from the least, the unmeasured last, else in file order', () => {
    const m = (at: number, from: number | null, len: number | null) => ({
      at,
      from,
      measures: {
        ...measuresOf(table('boat_highfield'), []),
        length: len === null ? null : ({ kind: 'span', lo: len, hi: len, n: 1, of: 1 } as Measure),
      },
    })
    const list = [m(0, 300, 5), m(1, null, 4), m(2, 100, null), m(3, 100, 6)]
    expect(ordered(list, 'file').map((x) => x.at)).toEqual([0, 1, 2, 3])
    expect(ordered(list, 'price').map((x) => x.at)).toEqual([2, 3, 0, 1])
    expect(ordered(list, 'length').map((x) => x.at)).toEqual([1, 0, 3, 2])
  })

  it('sets the compare’s rows with a dash where the file is empty, and marks what differs', () => {
    const set = compareRows([
      { band: 'Price', label: 'From, at Cash', cells: ['$54,470', '$61,700'] },
      { band: 'Specifications', label: 'Length', cells: ['6.52 m', '6.52 m'] },
      { band: 'Specifications', label: 'People', cells: [null, '13 people'] },
      { band: 'Specifications', label: 'Cabins', cells: [null, null] },
    ])
    expect(set.map((r) => [r.label, r.differs])).toEqual([
      ['From, at Cash', true],
      ['Length', false],
      ['People', true],
    ])
    expect(set[2]!.cells[0]).toBe(NOTHING_FILED)
  })
})

describe('a list that is not a boat maker, read as its own range', () => {
  it('reads Yamaha by its own horsepower: 162 singles in 27 ratings from 2.5 hp, then 47 rigs', () => {
    const shelf = shelfOf(table('mot_yamaha'), rows('mot_yamaha'))
    expect(shelf.by).toBe('hp')
    expect(shelf.lines).toBe(209)
    const singles = shelf.groups.filter((g) => !isRig(g.key))
    const rigs = shelf.groups.filter((g) => isRig(g.key))
    expect(singles.length).toBe(27)
    expect(singles.reduce((n, g) => n + g.lines.length, 0)).toBe(162)
    expect(rigs.reduce((n, g) => n + g.lines.length, 0)).toBe(47)
    expect(shelf.groups[0]!.name).toBe('2.5 hp')
    expect(singles.at(-1)!.name).toBe('450 hp')
    expect(rigs[0]!.name).toBe('2 × 70 hp')
    expect(shelf.level?.label).toBe('Sell Price')
    /* never a cost: every printed figure is the line's Sell Price */
    const f = shelf.groups[0]!.lines[0]!
    expect(f.price).toBe(1468)
    expect(f.facts).toEqual(['17 kg', '15″ shaft', 'Tiller handle', 'Four Stroke Models'])
  })

  it('draws every line it counts: Parts 2,238 still sold, 25 of them under no category', () => {
    const shelf = shelfOf(table('parts'), rows('parts'))
    expect(shelf.lines).toBe(2238)
    expect(shelf.unfiled).toBe(25)
    expect(shelf.held).toBe(699)
    expect(shelf.groups[0]!.name).toBe('Filed under no category')
    const dealer = shelfOf(table('dealer_fit'), rows('dealer_fit'))
    expect([dealer.lines, dealer.unfiled, dealer.held]).toEqual([1576, 74, 201])
    /* Dealer Fit declares no price a customer may see, so no figure is drawn */
    expect(dealer.level).toBeNull()
    expect(dealer.groups.every((g) => g.lines.every((l) => l.price === null))).toBe(true)
  })

  it('draws OBSOLETE Trailers’ ten, each no longer sold and priced at nothing', () => {
    const shelf = shelfOf(table('trl_obsolete'), rows('trl_obsolete'))
    expect(shelf.retired).toBe(true)
    expect(shelf.lines).toBe(10)
    const all = shelf.groups.flatMap((g) => g.lines)
    expect(all.every((l) => l.gone && l.price === null)).toBe(true)
    expect(all[0]!.facts.some((f) => f.startsWith('ATM '))).toBe(true)
  })

  it('reads Labour Rates as its 18 rates, each at the file’s own Rate (inc GST), never its cost', () => {
    const shelf = shelfOf(table('labour_rates'), rows('labour_rates'))
    expect(shelf.by).toBe('none')
    expect(shelf.lines).toBe(18)
    /* it declares no price, so none is a level; the hour is read at the column the file sells it at */
    expect(shelf.level).toBeNull()
    expect(shelf.charge?.label).toBe('Rate (inc GST)')
    expect(shelf.groups.length).toBe(1)
    const lines = shelf.groups[0]!.lines
    expect(lines[0]!.name).toMatch(/Retail Labour/)
    expect(lines[0]!.price).toBe(159)
    expect(lines.every((l) => l.price !== null)).toBe(true)
    /* 7 of 18 carry cents, so every figure is said to the cent, as the sheet says the column */
    expect(shelf.cents).toBe(true)
    /* never Actual (105 on every line) nor Rate (Exc GST), which the file's other sheets cost at */
    expect(lines.some((l) => l.price === 105)).toBe(false)
    /* a list that declares a price is read at it, never at a charge column */
    expect(chargeOf(table('mot_yamaha'))).toBeNull()
    expect(shelfOf(table('dealer_fit'), rows('dealer_fit')).charge).toBeNull()
  })

  it('reads a trailer by the boats it takes and its ATM, at Sell inc Rego', () => {
    const shelf = shelfOf(table('trl_redco'), rows('trl_redco'))
    expect(shelf.level?.label).toBe('Sell inc Rego')
    const line = shelf.groups.flatMap((g) => g.lines).find((l) => l.code === 'TA600TMO-B')!
    expect(line.facts).toContain('ATM 1,990 kg')
    /* its own length: 6,700 in a column named in metres, millimetres on every line */
    expect(line.facts).toEqual(['boats of 5.5–5.8 m', '6.7 m long', 'ATM 1,990 kg'])
    expect(line.price).toBe(9643)
    expect(shelf.lengths).toEqual({ filed: true, n: 49, of: 52 })
  })

  it('says a boat size the file writes as a boat by its own words, never with a unit it lacks', () => {
    expect(boatSizeSaid('5.0-5.2')).toBe('boats of 5.0–5.2 m')
    expect(boatSizeSaid('3.5 - 4.0m')).toBe('boats of 3.5–4.0 m')
    expect(boatSizeSaid('6.2 M')).toBe('boats of 6.2 m')
    expect(boatSizeSaid('4.7/5.0M')).toBe('boats of 4.7 or 5.0 m')
    expect(boatSizeSaid('495')).toBe('for the 495')
    expect(boatSizeSaid('540/575')).toBe('for the 540/575')
    expect(boatSizeSaid('Highfield ADV7')).toBe('for the Highfield ADV7')
    expect(boatSizeSaid('Jet Ski')).toBe('for the Jet Ski')
    expect(boatSizeSaid('')).toBeNull()
    expect(trailerLengthSaid(4430)).toBe('4.43 m long')
    expect(trailerLengthSaid(6.5)).toBe('6.5 m long')
    expect(trailerLengthSaid(150)).toBeNull()
    /* on every trailer list of the real price list, no line is said "boats of" a figure over 30 m */
    const trailers = Object.values(pack.ctx.entities).filter((e) => e.kind === 'trailer')
    const facts = trailers.flatMap((t) =>
      shelfOf(t, rows(t.id)).groups.flatMap((g) => g.lines.flatMap((l) => l.facts)),
    )
    const sizes = facts.filter((f) => f.startsWith('boats of '))
    expect(sizes.length).toBeGreaterThan(0)
    for (const f of sizes) expect(f, f).toMatch(/^boats of [\d.]+(?:(?:–| or )[\d.]+)? m$/)
    for (const f of sizes)
      for (const n of f.match(/[\d.]+/g) ?? []) expect(Number(n), f).toBeLessThan(30)
    /* NSM Custom: 24 of 73 carry their own length; GFAB files no such column */
    expect(shelfOf(table('trl_nsmcustom'), rows('trl_nsmcustom')).lengths).toEqual({
      filed: true,
      n: 24,
      of: 73,
    })
    expect(shelfOf(table('trl_gfab'), rows('trl_gfab')).lengths?.filed).toBe(false)
  })

  it('finds by every word of a find, across headings', () => {
    const shelf = shelfOf(table('mot_yamaha'), rows('mot_yamaha'))
    const found = findOnShelf(shelf, 'f175 xc')
    expect(found.flatMap((g) => g.lines).some((l) => /F175XC/.test(l.name))).toBe(true)
    expect(findOnShelf(shelf, '').length).toBe(shelf.groups.length)
    expect(findOnShelf(shelf, 'nothing-like-this')).toEqual([])
  })
})
