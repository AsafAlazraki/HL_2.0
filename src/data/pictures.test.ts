import { beforeAll, describe, expect, it } from 'vitest'
import { primaryImage, rowLabel, type QuoteDef, type RowData } from '@/domain/model'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { hullHero, stageArt } from '@/screens/configurator/stage'
import { coverArt } from '@/screens/document/art'
import { heldCopy as sheetCopy } from '@/screens/sheet/pictures'
import { pictureOf as pickerPicture } from '@/screens/picker/pictures'
import {
  copyOf,
  coverOfQuote,
  heroOf,
  heroOfQuote,
  itemOf,
  itemOfQuote,
  lineOf,
  markOf,
  pictureOf,
  pictureOfQuote,
  pictures,
  srcSetOf,
} from './pictures'

/* ============================================================
   ONE ANSWER TO "WHAT PICTURE OF THIS ITEM DO WE HOLD", measured on
   the real pack, asked of every screen that draws one.

   The components critique's blocker 3 was one boat — the Stacer 519 Sea
   Ranger SDF — photographed on four screens and "not held" on three,
   because each screen read the ledgers itself. Since 2026-10-20 they all
   ask the one reader; these cases ask every screen-shaped reader the
   same question on every boat row the file carries and expect one
   answer, then hold the real ledgers to the paper's own refusals.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const rowsOf = (kind: string): { tableId: string; row: RowData }[] =>
  pack.entities
    .filter((t) => t.kind === kind)
    .flatMap((t) =>
      ((pack.rowsByEntity[t.id] ?? []) as RowData[]).map((row) => ({ tableId: t.id, row })),
    )

const addressOf = (tableId: string, row: RowData): string | undefined => {
  const field = pack.ctx.entities[tableId]?.fields.find((f) => f.type === 'image')
  return field ? primaryImage(row.values[field.id] ?? null)?.src : undefined
}

/** A quote as far as a picture is concerned: the row it is rooted on and the address it froze. */
const quoteOn = (tableId: string, row: RowData): QuoteDef => {
  const table = pack.ctx.entities[tableId]!
  const src = addressOf(tableId, row)
  return {
    rootTableId: tableId,
    rootRowId: row.id,
    subjectLabel: rowLabel(table, row),
    ...(src ? { subjectImage: { src } } : {}),
  } as QuoteDef
}

const rowNamed = (key: string, label: string): RowData =>
  ((pack.rowsByEntity[pack.byKey(key).id] ?? []) as RowData[]).find(
    (r) => rowLabel(pack.byKey(key), r) === label,
  )!

describe('the one picture reader, on the real pack', () => {
  it('gives the stage, the picker, the sheet and the paper one answer for every boat row', () => {
    let pictured = 0
    for (const { tableId, row } of rowsOf('boat')) {
      const quote = quoteOn(tableId, row)
      const label = rowLabel(pack.ctx.entities[tableId]!, row)
      const ours = pictureOfQuote(quote)
      /* the build's stage */
      expect(hullHero(pack.ctx, quote)?.src ?? null, label).toBe(heroOfQuote(quote)?.src ?? null)
      const art = stageArt(itemOfQuote(quote), pack.ctx.entities[tableId]!.name, hullHero(pack.ctx, quote))
      expect(art.kind === 'photograph' ? art.held.src : null, label).toBe(ours?.src ?? null)
      /* the picker, asked about the row as a model's anchor */
      expect(
        pickerPicture({ tableId, key: row.id, img: quote.subjectImage })?.at ?? null,
        label,
      ).toBe(ours?.src ?? null)
      /* the sheet's cell is the row's own copy, as the reader answers it */
      expect(sheetCopy(quote.subjectImage?.src, row.id)?.at ?? null, label).toBe(
        pictures().rowCopy(itemOfQuote(quote))?.src ?? null,
      )
      /* the paper prints only what the cover may print */
      const cover = coverArt(quote, pack.ctx.entities[tableId]!.name)
      const found = coverOfQuote(quote)
      expect(cover.kind === 'photograph' ? cover.held.src : null, label).toBe(
        found.held ? found.picture.src : null,
      )
      if (ours) pictured += 1
    }
    expect(pictured).toBeGreaterThan(0)
  })

  /* THE GATE ROUND, 2026-10-20: the 519's on-water photograph (Lifestyle (6)) shows a SIDE
     console. It was held as a hull picture over both consoles; it is now the Side Console's
     alone, the same ruling the Lifestyle Tifs (4) finding makes. */
  it('holds the Stacer 519 Sea Ranger SDF on the water for the Side Console only', () => {
    const side = quoteOn(pack.byKey('boat_stacer').id, rowNamed('boat_stacer', 'Stacer - 519 Sea Ranger SDF (Side Console)'))
    const centre = quoteOn(
      pack.byKey('boat_stacer').id,
      rowNamed('boat_stacer', 'Stacer - 519 Sea Ranger SDF (Centre Console)'),
    )
    const held = pictureOfQuote(side)
    expect(held?.tier).toBe('hero')
    expect(held?.src).toMatch(/hero-images\/stacer-519-sea-ranger-4ea6e75c\.webp$/)
    expect(held?.subject).toBe('Stacer 519 Sea Ranger SDF (Side Console) on the water')
    expect(held?.standing).toBe('model')
    expect(srcSetOf(held!)).toContain('stacer-519-sea-ranger-4ea6e75c-640.webp 640w')
    expect(pictureOfQuote(centre)).toBeNull()
    /* the machine chose that photograph, so the paper does not print it: the Side Console's
       cover is the row's own copy */
    const cover = coverOfQuote(side)
    expect(cover.held && cover.picture.standing).toBe('row')
    /* the Lifestyle Tifs (4) frame is the Side Console's alone: a person marked it so, and the
       price file's giving it to the Centre Console as well is refused */
    expect(copyOf(itemOfQuote(side))?.src).toMatch(/519-sea-ranger-lifestyle-tifs-4-/)
    expect(copyOf(itemOfQuote(centre))).toBeNull()
  })

  /* THE GATE ROUND, 2026-10-20: the price file gives the 589 Ocean Ranger's photograph to four
     longer hulls and the 359 Proline's to the 399S. Their own file names say whose they are. */
  it('never draws a picture whose own name is another model’s, on any screen or paper', () => {
    for (const [mine, theirs] of [
      ['Stacer - 759 Ocean Ranger Cen Cab (H/Top)', /589%20Ocean%20Ranger/],
      ['Stacer - 609 Ocean Ranger Cen Cab (H/Top)', /589%20Ocean%20Ranger/],
      ['Stacer - 399S Proline L/S', /359-proline/],
    ] as const) {
      const quote = quoteOn(pack.byKey('boat_stacer').id, rowNamed('boat_stacer', mine))
      expect(quote.subjectImage?.src, mine).toMatch(theirs)
      expect(pictureOfQuote(quote), mine).toBeNull()
      expect(coverOfQuote(quote).held, mine).toBe(false)
    }
    /* and the 589 keeps its own */
    const own = quoteOn(
      pack.byKey('boat_stacer').id,
      rowNamed('boat_stacer', 'Stacer - 589 Ocean Ranger Cen Cab (H/Top)'),
    )
    expect(pictureOfQuote(own)?.src).toMatch(/589-ocean-ranger-cc-lifestyle-2/)
  })

  /* 2026-10-31: the price file gives the F150's studio picture to four F200 rows as well, and
     its held copy shows cowls that read "150". An F200's cover never prints it; the F150's does. */
  it('never prints the F150’s picture on an F200’s cover, and keeps it for the F150', () => {
    const f150 = /yamaha-f150-profile-800-x-600px-grey/
    const f200 = quoteOn(pack.byKey('mot_yamaha').id, rowNamed('mot_yamaha', 'Yamaha - F200XC'))
    expect(f200.subjectImage?.src).toMatch(f150)
    const refused = coverOfQuote(f200)
    expect(refused).toEqual(pictures().forCover(itemOfQuote(f200)))
    expect(refused.held ? refused.picture.src : '').not.toMatch(f150)
    expect(!refused.held && refused.because).toMatch(/refused: not that exact model \(a sister model\)/)
    expect(pictureOfQuote(f200)?.src ?? '').not.toMatch(f150)
    const own = quoteOn(pack.byKey('mot_yamaha').id, rowNamed('mot_yamaha', 'Yamaha - F150LC'))
    const kept = pictures().forCover(itemOfQuote(own))
    expect(kept.held && kept.picture.src).toMatch(/yamaha-f150-profile-800-x-600px-grey-9d6ec17d\.webp$/)
    expect(coverOfQuote(own)).toEqual(kept)
  })

  it('never puts the REDCO and TINKA logos beside a trailer, on a screen, a line or a cover', () => {
    const rows = rowsOf('trailer').filter(({ tableId, row }) =>
      /redco-tinka-logos-01\.png$/.test(addressOf(tableId, row) ?? ''),
    )
    expect(rows.length).toBeGreaterThan(0)
    for (const { tableId, row } of rows) {
      const item = itemOf(tableId, row.id, addressOf(tableId, row))
      expect(copyOf(item)).toBeNull()
      expect(pictureOf(item)?.src ?? '').not.toMatch(/logos/)
      expect(lineOf(item).held).toBe(false)
      expect(pictures().forCover(item).held).toBe(false)
    }
  })

  it('gives the 509 Assault Pro (Tournament) its own render, never the 529’s photograph its row points at', () => {
    const quote = quoteOn('boat_stacer', rowNamed('boat_stacer', 'Stacer - 509 Assault Pro (Tournament)'))
    expect(quote.subjectImage?.src).toMatch(/529-Assault-Lifestyle/)
    expect(pictures().rowCopy(itemOfQuote(quote))).toBeNull()
    const held = copyOf(itemOfQuote(quote))
    expect(held?.src).toMatch(/509-assault-pro-edits-2026/)
    expect(held?.person).toBe(true)
    expect(lineOf(itemOfQuote(quote)).held).toBe(true)
  })

  it('carries what a person saw in a picture, for the paper’s caption', () => {
    const quote = quoteOn('boat_stacer', rowNamed('boat_stacer', 'Stacer - 529 Assault Pro (Tournament)'))
    expect(pictures().rowCopy(itemOfQuote(quote))?.differs.join(' ')).toMatch(/Evinrude/)
    const sp560 = (pack.rowsByEntity[pack.byKey('boat_highfield').id] as RowData[]).find((r) =>
      rowLabel(pack.byKey('boat_highfield'), r).includes('SP560'),
    )!
    const hero = heroOf(itemOf('boat_highfield', sp560.id))
    expect(hero?.differs.join(' ')).toMatch(/Mercury 115/)
    /* the eight heroes held before the contact sheets were chosen by the machine and say so */
    expect(hero?.person).toBe(false)
  })

  it('never answers for another register, a row the file does not carry, or an address it does not ship', () => {
    const row = rowNamed('boat_stacer', 'Stacer - 519 Sea Ranger SDF (Side Console)')
    expect(heroOf(itemOf('boat_highfield', row.id))).toBeNull()
    expect(heroOf(itemOf('boat_stacer', 'boat_stacer:99999'))).toBeNull()
    expect(pictureOf(itemOf('boat_stacer', 'boat_stacer:99999', 'https://example.invalid/b.jpg')))
      .toBeNull()
    expect(sheetCopy('', row.id)).toBeNull()
    expect(sheetCopy(undefined)).toBeNull()
  })

  it('gives a maker’s mark in the ink the ground needs, or the reason there is none', () => {
    const stacer = markOf('Stacer', 'white')
    expect(stacer.drawn && stacer.mark.ink).toBe('white')
    expect(markOf('Stacer', 'dark').drawn).toBe(true)
    /* the match is the maker's name, or the register's name beginning with it */
    expect(markOf('Stacer Trailers', 'dark').drawn).toBe(true)
    expect(markOf('Trailers by Stacer', 'dark').drawn).toBe(false)
    /* Mercury and Stabicraft are held in white ink alone, which a white page cannot carry */
    for (const maker of ['Mercury', 'Stabicraft']) {
      expect(markOf(maker, 'dark')).toEqual({
        drawn: false,
        because: `${maker}’s mark comes in white ink only, which cannot be printed on a white page.`,
      })
      expect(markOf(maker, 'white').drawn).toBe(true)
    }
    expect(markOf('', 'dark').drawn).toBe(false)
  })

  it('holds Northside Marine’s own mark in dark ink for the letterhead and white for the water', () => {
    const paper = pictures().organisation('dark')
    expect(paper.drawn && paper.mark.src).toMatch(/brand-marks\/northside-marine\.png$/)
    const water = pictures().organisation('white')
    expect(water.drawn && water.mark.src).toMatch(/brand-marks\/northside-marine-white\.png$/)
  })
})
