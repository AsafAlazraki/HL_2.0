/* ============================================================
   QUOTE SWITCHED ON FOR A PLACE — on the real places the browser
   mints from the price list. Parts & Accessories starts without the
   verb (measured in walk.md: four of nine places carry it), is given
   it as one step, and its way back gives the verbs back in the very
   order they were.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import type { ModuleDef } from '@/domain/model'
import { emptySheet, type CatalogueData } from './sheet'
import { isDone } from './commands'
import { PLACE_GONE } from './placeCommands'
import { letQuote, quotesOnItsOwn } from './quotingCommand'

const NOW = new Date(2026, 9, 30, 12).toISOString()
let sheet: CatalogueData
let parts: ModuleDef

beforeAll(async () => {
  const pack = await loadPack()
  sheet = { ...emptySheet(), orgId: 'northside', modules: pack.ctx.modules }
  parts = Object.values(pack.ctx.modules).find((m) => m.name === 'Parts & Accessories')!
})

describe('letting a place be quoted on its own', () => {
  it('counts the places that quote today: four of nine', () => {
    const all = Object.values(sheet.modules)
    expect(all).toHaveLength(9)
    expect(
      all
        .filter((m) => quotesOnItsOwn(m.capabilities))
        .map((m) => m.name)
        .sort(),
    ).toEqual(['Boats', 'Factory Packages', 'Motors', 'Trailers'].sort())
  })

  it('switches Quote on for Parts & Accessories as one step, and back exactly', () => {
    expect(quotesOnItsOwn(parts.capabilities)).toBe(false)
    const done = letQuote(parts.id, true)(sheet, NOW)
    if (!isDone(done)) throw new Error('refused')
    expect(done.said).toBe('Parts & Accessories can now be quoted on its own.')
    expect(quotesOnItsOwn(done.next.modules[parts.id]!.capabilities)).toBe(true)

    const back = done.inverse(done.next, NOW)
    if (!isDone(back)) throw new Error('refused')
    expect(back.next.modules[parts.id]!.capabilities).toEqual(parts.capabilities)
    expect(back.said).toBe('Parts & Accessories is sold only with a boat again.')
  })

  it('is silence when nothing changes, and a sentence when the place is gone', () => {
    expect(letQuote(parts.id, false)(sheet, NOW)).toEqual({ refused: '' })
    expect(letQuote('nowhere', true)(sheet, NOW)).toEqual({ refused: PLACE_GONE })
  })
})
