import { describe, expect, it } from 'vitest'
import { hullName, pictureBook, type PictureEntry, type PictureFinding } from './pictures'

/* ============================================================
   THE RULES THE ONE READER KEEPS, PINNED ON LEDGERS SMALL ENOUGH TO
   READ IN ONE SITTING.

   Each case below is one of the rules a picture keeps on its way to a
   screen or to the customer's paper: the row's own address first, then
   its model's; never a stand-in, never a sister model; a colourway
   render exact only on its colourway; never enlarged; a gap returned as
   a gap, with its reason. The real ledgers are held to the same rules by
   `src/data/imagery.test.ts`.
   ============================================================ */

const entry = (over: Partial<PictureEntry>): PictureEntry => ({
  id: 'highfield-sp330-catalogue',
  tier: 'catalogue',
  table: 'boat_highfield',
  scope: 'model',
  models: ['SP330'],
  rows: { SP330: ['boat_highfield:393', 'boat_highfield:394', 'boat_highfield:400'] },
  exactRows: ['boat_highfield:393', 'boat_highfield:400'],
  rowAddress: true,
  subject: 'Highfield SP330',
  depicts: 'Highfield Sport 330, W-W-WB, top-down render',
  differs: ['a W-W-WB colourway render: on any other SP330 row it is the model’s picture'],
  verdict: 'studio',
  url: 'https://maker.example/SP330-W-W-WB.jpg',
  pageUrl: '',
  host: 'maker.example',
  licenceNote: 'No licence is recorded.',
  fetchedAt: '2026-10-20',
  sourceWidth: 1920,
  sourceHeight: 1080,
  file: 'sp330-w-w-wb.webp',
  width: 1100,
  height: 619,
  bytes: 24000,
  sha256: 'a'.repeat(64),
  verification: 'verified by eye, contact sheet, 2026-09-23',
  verifiedBy: 'a person, by eye on the contact sheet',
  person: true,
  verdicts: 'docs/research/imagery/proposals/highfield-ribs.verdicts.json#8',
  ...over,
})

const hero = entry({
  id: 'highfield-sp330',
  tier: 'hero',
  exactRows: [],
  rowAddress: false,
  subject: 'Highfield SP330 on the water',
  verdict: 'scene',
  file: 'highfield-sp330-1.webp',
  width: 2560,
  height: 1920,
  sourceWidth: 4000,
  sourceHeight: 3000,
  widths: [
    { width: 640, height: 480, file: 'highfield-sp330-1-640.webp', bytes: 1, sha256: '' },
    { width: 1280, height: 960, file: 'highfield-sp330-1-1280.webp', bytes: 1, sha256: '' },
    /* a "narrower" copy wider than the held one is a different picture: dropped */
    { width: 4000, height: 3000, file: 'enlarged.webp', bytes: 1, sha256: '' },
  ],
})

const logo: PictureFinding = {
  address: 'https://dealer.example/redco-tinka-logos-01.png',
  table: 'trl_nsmcustom',
  rows: [],
  decision: 'refuse',
  rule: 'a logo, not the item',
  shows: 'the REDCO and TINKA logos',
  differs: [],
  verification: 'looked at',
  person: true,
  source: 'quote-spec.md',
}

const sister: PictureFinding = {
  ...logo,
  address: 'https://maker.example/529-assault.jpg',
  table: 'boat_stacer',
  rows: ['boat_stacer:29'],
  rule: 'not that exact model (a sister model)',
  shows: 'a 529 Assault',
}

const evinrude: PictureFinding = {
  ...sister,
  rows: ['boat_stacer:30'],
  decision: 'note',
  rule: 'shows an outboard the file does not sell',
  differs: ['an Evinrude outboard'],
}

const images = {
  images: [
    { address: logo.address, file: 'logos.webp', width: 1100, height: 400, verdict: 'scene' },
    { address: sister.address, file: '529.webp', width: 1024, height: 676, verdict: 'scene' },
    { address: 'https://maker.example/own.jpg', file: 'own.webp', width: 900, height: 600 },
    { address: 'https://maker.example/unheld.jpg' },
  ],
}

const hull = entry({
  id: 'stacer-519-sea-ranger',
  tier: 'hero',
  table: 'boat_stacer',
  scope: 'hull',
  models: [
    'Stacer - 519 Sea Ranger SDF (Centre Console)',
    'Stacer - 519 Sea Ranger SDF (Side Console)',
  ],
  rows: {
    'Stacer - 519 Sea Ranger SDF (Centre Console)': ['boat_stacer:71'],
    'Stacer - 519 Sea Ranger SDF (Side Console)': ['boat_stacer:77'],
  },
  exactRows: [],
  rowAddress: false,
  person: false,
  file: 'stacer-519.webp',
  width: 2560,
  height: 1694,
})

const book = pictureBook(
  {
    images,
    pictures: { pictures: [entry({}), hero, hull], findings: [logo, sister, evinrude] },
    marks: [
      {
        id: 'stacer',
        brand: 'Stacer',
        slug: 'stacer',
        variant: 'dark',
        file: 's.png',
        width: 1200,
        height: 368,
      },
      {
        id: 'mercury-white',
        brand: 'Mercury',
        slug: 'mercury',
        variant: 'white',
        file: 'm.png',
        width: 1200,
        height: 292,
      },
      {
        id: 'northside-marine',
        role: 'organisation',
        brand: 'Northside Marine',
        slug: 'northside-marine',
        variant: 'dark',
        file: 'n.png',
        width: 1798,
        height: 448,
      },
    ],
  },
  '/HL_2.0/',
)

describe('the one picture reader', () => {
  it('serves every picture under the deployment’s own base, so a sub-path works', () => {
    expect(book.hero({ table: 'boat_highfield', row: 'boat_highfield:394' })?.src).toBe(
      '/HL_2.0/hero-images/highfield-sp330-1.webp',
    )
    expect(
      book.rowCopy({ table: 'boat_x', row: 'boat_x:1', address: 'https://maker.example/own.jpg' })
        ?.src,
    ).toBe('/HL_2.0/seed-images/own.webp')
  })

  it('reads the row’s own address first, then its model’s', () => {
    const own = book.catalogue({
      table: 'boat_highfield',
      row: 'boat_highfield:394',
      address: 'https://maker.example/own.jpg',
    })
    expect(own?.standing).toBe('row')
    expect(own?.src).toMatch(/own\.webp$/)
    const model = book.catalogue({ table: 'boat_highfield', row: 'boat_highfield:394' })
    expect(model?.id).toBe('highfield-sp330-catalogue')
  })

  it('never answers with a stand-in: another register, another model, an unheld address', () => {
    expect(book.catalogue({ table: 'boat_stacer', row: 'boat_highfield:393' })).toBeNull()
    expect(book.catalogue({ table: 'boat_highfield', row: 'boat_highfield:999' })).toBeNull()
    expect(
      book.catalogue({
        table: 'boat_x',
        row: 'boat_x:1',
        address: 'https://maker.example/unheld.jpg',
      }),
    ).toBeNull()
    expect(book.hero({ table: 'boat_highfield', row: 'boat_highfield:999' })).toBeNull()
  })

  it('refuses a logo for every row, and a sister model for the row it was refused for', () => {
    for (const row of ['trl_nsmcustom:1', 'trl_nsmcustom:2']) {
      expect(book.rowCopy({ table: 'trl_nsmcustom', row, address: logo.address })).toBeNull()
    }
    expect(
      book.rowCopy({ table: 'boat_stacer', row: 'boat_stacer:29', address: sister.address }),
    ).toBeNull()
    /* the same photograph, on the row it is of, is drawn — with what a person saw in it */
    const its = book.rowCopy({
      table: 'boat_stacer',
      row: 'boat_stacer:30',
      address: sister.address,
    })
    expect(its?.differs).toEqual(['an Evinrude outboard'])
    expect(
      book.notes({ table: 'boat_stacer', row: 'boat_stacer:30', address: sister.address }),
    ).toEqual(['an Evinrude outboard'])
  })

  it('holds a colourway render exact only on its colourway; elsewhere it is the model’s', () => {
    const on = book.modelPicture(
      { table: 'boat_highfield', row: 'boat_highfield:400' },
      'catalogue',
    )
    expect(on?.exact).toBe(true)
    expect(on?.standing).toBe('row')
    const off = book.modelPicture(
      { table: 'boat_highfield', row: 'boat_highfield:394' },
      'catalogue',
    )
    expect(off?.exact).toBe(false)
    expect(off?.standing).toBe('model')
  })

  it('never enlarges: the held pixels ride with every answer, and a wider "narrower" copy is dropped', () => {
    const h = book.hero({ table: 'boat_highfield', row: 'boat_highfield:393' })!
    expect([h.width, h.height]).toEqual([2560, 1920])
    expect(h.widths.map((w) => w.width)).toEqual([640, 1280, 2560])
    expect(h.widths.every((w) => w.width <= h.width)).toBe(true)
  })

  it('says the version a hull’s picture does not pin, and names the hull it does', () => {
    const side = book.hero({ table: 'boat_stacer', row: 'boat_stacer:77' })!
    expect(side.standing).toBe('hull')
    expect(side.exact).toBe(false)
    expect(side.beyond).toBe('Side Console')
    expect(side.model).toBe('Stacer - 519 Sea Ranger SDF')
    expect(hullName(hull.models)).toBe('Stacer - 519 Sea Ranger SDF')
  })

  describe('the customer’s paper', () => {
    it('lets a line carry only a picture a person marked as exactly that item', () => {
      const exact = book.forLine({ table: 'boat_highfield', row: 'boat_highfield:393' })
      expect(exact.held && exact.picture.id).toBe('highfield-sp330-catalogue')
      /* another colourway of the model: a gap, returned as a gap with its reason */
      const other = book.forLine({ table: 'boat_highfield', row: 'boat_highfield:394' })
      expect(other).toEqual({
        held: false,
        because:
          'No picture of this exact item has been marked by a person, so the line carries none.',
      })
      /* the dealer's own held copy is not enough: nobody marked it */
      expect(
        book.forLine({ table: 'boat_x', row: 'boat_x:1', address: 'https://maker.example/own.jpg' })
          .held,
      ).toBe(false)
      /* and a logo is refused, saying so */
      const logoLine = book.forLine({
        table: 'trl_nsmcustom',
        row: 'trl_nsmcustom:1',
        address: logo.address,
      })
      expect(logoLine).toEqual({
        held: false,
        because: 'The price file’s own picture for this item is refused: a logo, not the item.',
      })
    })

    it('refuses a logo, a sister model and another colourway on a cover', () => {
      expect(
        book.forCover({ table: 'trl_nsmcustom', row: 'trl_nsmcustom:1', address: logo.address })
          .held,
      ).toBe(false)
      expect(
        book.forCover({ table: 'boat_stacer', row: 'boat_stacer:29', address: sister.address })
          .held,
      ).toBe(false)
      /* a cover may be the model on the water, captioned — and is, before the render */
      const covered = book.forCover({ table: 'boat_highfield', row: 'boat_highfield:394' })
      expect(covered.held && covered.picture.tier).toBe('hero')
      /* but never a hero the machine chose and no person marked: the screen may draw it, the
         paper falls to the row's own copy, and with none, to a gap */
      expect(book.hero({ table: 'boat_stacer', row: 'boat_stacer:77' })?.person).toBe(false)
      expect(book.forCover({ table: 'boat_stacer', row: 'boat_stacer:77' }).held).toBe(false)
      const own = book.forCover({
        table: 'boat_stacer',
        row: 'boat_stacer:77',
        address: 'https://maker.example/own.jpg',
      })
      expect(own.held && own.picture.standing).toBe('row')
      /* with no hero, a render of another colourway is refused on the paper */
      const bare = pictureBook({ images, pictures: { pictures: [entry({})], findings: [] } }, '/')
      expect(bare.forCover({ table: 'boat_highfield', row: 'boat_highfield:394' }).held).toBe(false)
      expect(bare.forCover({ table: 'boat_highfield', row: 'boat_highfield:393' }).held).toBe(true)
    })
  })

  it('answers a mark in the ink the ground needs, or the reason there is none', () => {
    expect(book.mark('Stacer Trailers', 'dark').drawn).toBe(true)
    expect(book.mark('Trailers by Stacer', 'dark').drawn).toBe(false)
    expect(book.mark('Mercury', 'dark')).toEqual({
      drawn: false,
      because: 'Mercury’s mark is held in white ink only, which cannot be printed on a white page.',
    })
    const own = book.organisation('dark')
    expect(own.drawn && own.mark.src).toBe('/HL_2.0/brand-marks/n.png')
    expect(book.organisation('white').drawn).toBe(false)
    /* the dealership's own mark is not a maker the shelf counts */
    expect(book.markFacts()).toEqual({ checked: 2, held: 2, files: 2 })
  })

  it('answers with gaps, never a broken picture, when a ledger will not parse', () => {
    const empty = pictureBook({ images: 'nonsense', pictures: null, marks: 42 }, '/')
    expect(empty.picture({ table: 'boat_highfield', row: 'boat_highfield:393' })).toBeNull()
    expect(empty.heroes()).toEqual([])
    expect(empty.organisation('dark').drawn).toBe(false)
  })
})
