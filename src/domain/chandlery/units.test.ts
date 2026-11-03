import { describe, expect, it } from 'vitest'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import { isDone } from '@/domain/catalogue/commands'
import { headingSaid, NO_HEADING, picturedFirst, sectionsOf } from './headings'
import { findLines } from './find'
import {
  caseTwinsOf,
  headingProposals,
  nameSuppliers,
  supplierSaid,
  suppliersIn,
} from './suppliers'
import { aisleWithPlacings, isPlaced, placeInAisle, placeKeyOf } from './placing'
import { codeBookOf, matchByCode, stemOf } from './byCode'

/* THE CHANDLERY'S PURE READINGS, case by case. Each one is measured on the real price list in
   chandlery.northside.test.ts; here each rule is shown to hold, and to fail where it should. */

describe('a heading said', () => {
  it('quiets the shouting and keeps the file’s own words', () => {
    expect(headingSaid('ANCHOR WINCHES - Lone Star')).toBe('Anchor winches – Lone Star')
    expect(headingSaid('PROPELLERS - Yamaha')).toBe('Propellers – Yamaha')
    expect(headingSaid('GME - VHF MARINE RADIOS')).toBe('GME – VHF marine radios')
    expect(headingSaid('LOWRANCE')).toBe('Lowrance')
    /* the file's typo is Review's to correct, not this page's */
    expect(headingSaid('YAMAHA SERVICE ITIEMS')).toBe('Yamaha service itiems')
    expect(headingSaid('')).toBe(NO_HEADING)
  })

  it('groups lines under their headings in the order the file first writes them', () => {
    const s = sectionsOf([
      { id: 'a', heading: 'B' },
      { id: 'b', heading: 'A' },
      { id: 'c', heading: 'B' },
    ])
    expect(s.map((x) => [x.heading, x.parts.map((p) => p.id)])).toEqual([
      ['B', ['a', 'c']],
      ['A', ['b']],
    ])
  })
})

describe('the photographs first', () => {
  it('puts the headings that hold a picture first, each run in the file’s order', () => {
    const s = sectionsOf([
      { id: 'a', heading: 'NAVIONICS', pic: false },
      { id: 'b', heading: 'LOWRANCE', pic: true },
      { id: 'c', heading: 'RADAR', pic: false },
      { id: 'd', heading: 'GARMIN', pic: true },
    ])
    expect(picturedFirst(s, (p) => p.pic).map((x) => x.heading)).toEqual([
      'LOWRANCE',
      'GARMIN',
      'NAVIONICS',
      'RADAR',
    ])
    expect(picturedFirst(s, () => false).map((x) => x.heading)).toEqual(s.map((x) => x.heading))
  })
})

describe('find', () => {
  const lines = [
    {
      id: '1',
      name: 'HDS PRO 9',
      product: 'HDS PRO 9',
      code: '000-1',
      heading: 'LOWRANCE',
      maker: 'LOW',
    },
    {
      id: '2',
      name: 'Safety Gear · Smooth Waters',
      product: 'Safety Gear - Smooth Waters',
      code: 'SG002',
      heading: 'SAFETY GEAR',
      maker: 'NSM',
    },
    {
      id: '3',
      name: 'Lowrance cable',
      product: 'Lowrance cable',
      code: 'X1',
      heading: 'NMEA 2000',
      maker: 'LOW',
    },
    {
      id: '4',
      name: 'Propeller 13',
      product: 'Propeller 13',
      code: 'P13',
      heading: 'PROPELLERS',
      maker: 'YAM',
      makerSaid: 'Yamaha',
    },
  ]

  it('reads the name, the code, the supplier and the heading, the name’s matches first', () => {
    expect(findLines(lines, 'lowrance').found.map((l) => l.id)).toEqual(['3', '1'])
    expect(findLines(lines, 'lowrance').byName).toBe(1)
    expect(findLines(lines, 'SG002').found.map((l) => l.id)).toEqual(['2'])
    expect(findLines(lines, 'yamaha').found.map((l) => l.id)).toEqual(['4'])
  })

  it('wants every word, and answers nothing to one letter', () => {
    expect(findLines(lines, 'hds 9').found.map((l) => l.id)).toEqual(['1'])
    expect(findLines(lines, 'hds 7').found).toEqual([])
    expect(findLines(lines, 'l').found).toEqual([])
  })
})

describe('the suppliers in Northside’s words', () => {
  const lines = [
    { maker: 'YAM', heading: 'PROPELLERS - Yamaha' },
    { maker: 'YAM', heading: 'YAMAHA SERVICE' },
    { maker: 'Yam', heading: 'PROPELLERS - Yamaha' },
    { maker: 'LOW', heading: 'LOWRANCE' },
    { maker: 'LOW', heading: 'LOWRANCE' },
    { maker: 'GAR', heading: 'GARMIN STRIKER' },
    { maker: 'GAR', heading: 'NMEA 2000' },
    { maker: '', heading: '' },
  ]

  it('reads a code as the file writes it until Northside names it', () => {
    expect(supplierSaid('LOW', undefined)).toBe('LOW')
    expect(supplierSaid('LOW', { LOW: 'Lowrance' })).toBe('Lowrance')
    expect(supplierSaid(' ', undefined)).toBe('No supplier')
  })

  it('counts two codes given one name as one maker, and a line with none last', () => {
    expect(
      suppliersIn(lines, { YAM: 'Yamaha', Yam: 'Yamaha' }).map((s) => [s.said, s.lines, s.codes]),
    ).toEqual([
      ['Yamaha', 3, ['YAM', 'Yam']],
      ['GAR', 2, ['GAR']],
      ['LOW', 2, ['LOW']],
      ['No supplier', 1, ['']],
    ])
  })

  it('proposes a heading’s name only where every one of a code’s lines agrees', () => {
    expect(headingProposals(lines, undefined)).toEqual([
      { code: 'LOW', name: 'Lowrance', agree: 2, lines: 2 },
    ])
    /* once named, nothing is proposed for it */
    expect(headingProposals(lines, { LOW: 'Lowrance' })).toEqual([])
  })

  it('finds the codes that differ only in their capitals, until they are one maker', () => {
    expect(caseTwinsOf(lines, undefined)).toEqual([
      {
        codes: [
          { code: 'YAM', lines: 2 },
          { code: 'Yam', lines: 1 },
        ],
      },
    ])
    expect(caseTwinsOf(lines, { YAM: 'Yamaha', Yam: 'Yamaha' })).toEqual([])
  })
})

/** A sheet with an organisation, enough for a settings change. */
const sheet = (org?: CatalogueData['org']): CatalogueData =>
  ({ orgId: 'northside', business: 'Northside Marine', org }) as unknown as CatalogueData

describe('naming a supplier, as a command with its way back', () => {
  it('names two codes as one maker, and its inverse puts the profile back', () => {
    const out = nameSuppliers(['YAM', 'Yam'], 'Yamaha')(sheet(), '2026-11-03T00:00:00Z')
    if (!isDone(out)) throw new Error(out.refused)
    expect(out.next.org?.suppliers).toEqual({ YAM: 'Yamaha', Yam: 'Yamaha' })
    expect(out.said).toBe('YAM and Yam are named Yamaha')
    expect(out.event.kind).toBe('settings-changed')
    const back = out.inverse(out.next, '2026-11-03T00:00:01Z')
    if (!isDone(back)) throw new Error(back.refused)
    expect(back.next.org?.suppliers).toBeUndefined()
  })

  it('takes a name back, refuses a sentence for a name, and says nothing changed as nothing', () => {
    const named = sheet({
      name: 'Northside Marine',
      industry: 'marine',
      createdAt: '',
      suppliers: { LOW: 'Lowrance' },
    })
    const off = nameSuppliers(['LOW'], null)(named, 'now')
    if (!isDone(off)) throw new Error(off.refused)
    expect(off.next.org?.suppliers).toBeUndefined()
    const long = nameSuppliers(['LOW'], 'L'.repeat(41))(named, 'now')
    expect(isDone(long) ? '' : long.refused).toMatch(/longer than a maker’s name/)
    const same = nameSuppliers(['LOW'], 'Lowrance')(named, 'now')
    expect(isDone(same) ? 'done' : same.refused).toBe('')
  })
})

describe('placing what no aisle names', () => {
  it('places a heading whole, and a line with none on its own', () => {
    expect(placeKeyOf({ id: 'parts:9', heading: 'DFO KITS' })).toBe('heading:DFO KITS')
    expect(placeKeyOf({ id: 'parts:9', heading: '' })).toBe('line:parts:9')
  })

  it('stands a line where Northside put it, else where its heading names', () => {
    const placed = { 'heading:DFO KITS': 'anchoring', 'line:parts:9': 'power' }
    expect(aisleWithPlacings({ id: 'x', heading: 'DFO KITS' }, undefined)).toBe('unsorted')
    expect(aisleWithPlacings({ id: 'x', heading: 'DFO KITS' }, placed)).toBe('anchoring')
    expect(aisleWithPlacings({ id: 'parts:9', heading: '' }, placed)).toBe('power')
    expect(aisleWithPlacings({ id: 'y', heading: 'LIGHTING - Hella' }, placed)).toBe('lights')
    expect(isPlaced({ id: 'parts:9', heading: '' }, placed)).toBe(true)
    /* a placing that names no aisle is no placing */
    expect(aisleWithPlacings({ id: 'z', heading: 'X' }, { 'heading:X': 'nowhere' })).toBe(
      'unsorted',
    )
  })

  it('is a command with its sentence and its way back, and refuses an aisle that is not one', () => {
    const out = placeInAisle('heading:DFO KITS', 'anchoring', 'DFO kits')(sheet(), 'now')
    if (!isDone(out)) throw new Error(out.refused)
    expect(out.said).toBe('DFO kits is now in Anchoring & mooring')
    expect(out.next.org?.aisles).toEqual({ 'heading:DFO KITS': 'anchoring' })
    const back = out.inverse(out.next, 'later')
    if (!isDone(back)) throw new Error(back.refused)
    expect(back.next.org?.aisles).toBeUndefined()
    const wrong = placeInAisle('heading:DFO KITS', 'nope', 'DFO kits')(sheet(), 'now')
    expect(isDone(wrong) ? '' : wrong.refused).toBe(
      'There is no aisle called “nope” to put DFO kits in.',
    )
  })
})

describe('a picture placed by the code its file name carries', () => {
  const book = codeBookOf([
    { id: 'p1', code: 'SG002', name: 'Safety Gear · Smooth Waters' },
    { id: 'p2', code: '46070', name: 'Sand Anchor Kit · 4lb' },
    { id: 'p3', code: '4607', name: 'A shorter code' },
    { id: 'p4', code: 'TWICE', name: 'One' },
    { id: 'p5', code: 'TWICE', name: 'Two' },
    { id: 'p6', code: '12', name: 'Too short to match' },
    { id: 'p7', code: 'GX1 6mm Combo', name: 'Lone Star · GX-1 6 mm Combo Winch Kit' },
  ])

  it('lands a file on the one part its name is the code of, the longest code first', () => {
    const one = matchByCode('SG002.jpg', book)
    expect(one.ok && one.line.id).toBe('p1')
    const front = matchByCode('46070 front.png', book)
    expect(front.ok && front.line.id).toBe('p2')
    const spaced = matchByCode('GX1-6mm-Combo.webp', book)
    expect(spaced.ok && spaced.line.id).toBe('p7')
    expect(stemOf('SG002.front.jpg')).toBe('SG002.front')
  })

  it('refuses a name with no code, a code two parts carry, and a code too short to check', () => {
    const none = matchByCode('IMG_2041.jpg', book)
    expect(none.ok ? '' : none.why).toMatch(/names no part’s code/)
    const twice = matchByCode('TWICE.jpg', book)
    expect(twice.ok ? '' : twice.why).toMatch(/which 2 parts carry/)
    expect(matchByCode('12.jpg', book).ok).toBe(false)
    /* a code followed by more digits is a different code */
    expect(matchByCode('SG0021.jpg', book).ok).toBe(false)
  })
})
