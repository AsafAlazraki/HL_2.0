import { beforeAll, describe, expect, it } from 'vitest'
import { namesOfRow } from '@/domain/catalogue/depicts'
import { primaryImage, rowLabel, type QuoteDef, type RowData } from '@/domain/model'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { heldPicture, hullHero } from '@/screens/configurator/stage'
import { pictureForSubject } from '@/screens/home/ledgers'
import { copyOf, heroOf, heroOfQuote, markOf, pictureOf, pictureOfQuote, srcSetOf } from './pictures'

/* ============================================================
   ONE ANSWER TO "WHAT PICTURE OF THIS BOAT DO WE HOLD", measured on
   the real pack against the screens that already drew it right.

   The components critique's blocker 3 was one boat — the Stacer 519 Sea
   Ranger SDF — photographed on four screens and "not held" on three.
   These cases hold the reader to the build's stage (the head of the
   choreography, `configurator/stage.ts`) and to Home's reading of a
   filed quote's label, on every boat row the file carries, so a screen
   that asks this reader cannot disagree with either.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const boatRows = (): { tableId: string; row: RowData }[] =>
  pack.entities
    .filter((t) => t.kind === 'boat')
    .flatMap((t) =>
      ((pack.rowsByEntity[t.id] ?? []) as RowData[]).map((row) => ({ tableId: t.id, row })),
    )

const addressOf = (tableId: string, row: RowData): string | undefined => {
  const field = pack.ctx.entities[tableId]?.fields.find((f) => f.type === 'image')
  return field ? primaryImage(row.values[field.id] ?? null)?.src : undefined
}

/** A quote as far as a picture is concerned: the row it is rooted on, the label and the
 *  address it froze. Nothing else of a quote is read. */
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

describe('the one picture reader', () => {
  it('answers every boat row with the picture the build’s stage stands on', () => {
    let pictured = 0
    for (const { tableId, row } of boatRows()) {
      const quote = quoteOn(tableId, row)
      const stage = hullHero(pack.ctx, quote) ?? heldPicture(quote.subjectImage?.src)
      const ours = pictureOfQuote(quote, pack.ctx)
      expect(ours?.src ?? null, rowLabel(pack.ctx.entities[tableId]!, row)).toBe(
        stage?.src ?? null,
      )
      if (ours) pictured += 1
    }
    expect(pictured).toBeGreaterThan(0)
  })

  it('answers a filed quote by its frozen label exactly as by its row, so the paper agrees', () => {
    for (const { tableId, row } of boatRows()) {
      const quote = quoteOn(tableId, row)
      const label = rowLabel(pack.ctx.entities[tableId]!, row)
      expect(pictureOfQuote(quote)?.src ?? null, label).toBe(
        pictureOfQuote(quote, pack.ctx)?.src ?? null,
      )
      /* and Home's reader of a filed quote, which the Quotes register draws by */
      expect(heroOfQuote(quote)?.src ?? null, label).toBe(
        pictureForSubject(tableId, quote.subjectLabel)?.src ?? null,
      )
    }
  })

  it('holds the Stacer 519 Sea Ranger SDF on the water for both consoles, whose own address has no copy', () => {
    const table = pack.byKey('boat_stacer')
    const rows = ((pack.rowsByEntity[table.id] ?? []) as RowData[]).filter((r) =>
      rowLabel(table, r).includes('519 Sea Ranger SDF'),
    )
    expect(rows.map((r) => rowLabel(table, r))).toHaveLength(2)
    for (const row of rows) {
      const quote = quoteOn(table.id, row)
      expect(copyOf(quote.subjectImage?.src)).toBeNull()
      const held = pictureOfQuote(quote)
      expect(held?.tier).toBe('hero')
      expect(held?.src).toMatch(/hero-images\/stacer-519-sea-ranger-4ea6e75c\.webp$/)
      expect(held?.subject).toBe('Stacer 519 Sea Ranger SDF on the water')
      expect(srcSetOf(held!)).toContain('stacer-519-sea-ranger-4ea6e75c-640.webp 640w')
    }
  })

  it('never answers for a longer model, another register, or an address it does not ship', () => {
    const stacer = pack.byKey('boat_stacer')
    const row = ((pack.rowsByEntity[stacer.id] ?? []) as RowData[]).find((r) =>
      rowLabel(stacer, r).includes('519 Sea Ranger SDF'),
    )!
    expect(heroOf('boat_highfield', namesOfRow(stacer, row))).toBeNull()
    expect(heroOf(stacer.id, ['Stacer - 519 Sea Ranger SDFX'])).toBeNull()
    expect(pictureOf(stacer.id, [], 'https://example.invalid/boat.jpg')).toBeNull()
    expect(copyOf('')).toBeNull()
    expect(copyOf(undefined)).toBeNull()
  })

  it('gives a maker’s mark in the ink the ground needs, or the reason there is none', () => {
    const stacer = markOf('Stacer', 'white')
    expect(stacer.drawn && stacer.mark.ink).toBe('white')
    expect(markOf('Stacer', 'dark').drawn).toBe(true)
    /* the match is the maker's name, or the register's name beginning with it */
    expect(markOf('Stacer Trailers', 'dark').drawn).toBe(true)
    expect(markOf('Trailers by Stacer', 'dark').drawn).toBe(false)
    /* Mercury publishes white ink alone, which a white page cannot carry */
    const mercury = markOf('Mercury', 'dark')
    expect(mercury).toEqual({
      drawn: false,
      because: 'Mercury’s mark is held in white ink only, which cannot be printed on a white page.',
    })
    /* a maker looked for and not found says the ledger's own reason */
    const stabicraft = markOf('Stabicraft', 'white')
    expect(stabicraft.drawn).toBe(false)
    expect(!stabicraft.drawn && stabicraft.because).toMatch(/^Stabicraft: no public wordmark/)
    expect(markOf('', 'dark').drawn).toBe(false)
  })
})
