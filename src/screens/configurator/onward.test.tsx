import { beforeAll, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { makeCtx, rowLabel } from '@/domain/model'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuote } from '@/domain/quote'
import { Configurator } from './Configurator'
import { readRail } from './chapters'

/* ============================================================
   THE BUILD OPENS ON THE HULL AND MOVES ONLY WHEN THE DEALER MOVES IT
   (the owner, 2026-10-30). Until that day it moved on to what was left
   and never back to the hull:

   m2-last-critique.md, major 3: "Arriving from the picker (no ?at=),
   the motor chapter is open. After the F250XCB is pressed, the default
   chapter falls back to chapters[0] … so 'ADV7 — 7 finishes' opens
   under the hand. It does not move on to 'Who it is for'."

   Walked here on the real pack, on the quote the critic drove: the
   Highfield ADV7 in Black / Grey / Black, minted by the engine's own
   door exactly as the picker mints it, with no position in the address.
   Nothing below is typed into an assertion that the engine or the file
   could say instead.
   ============================================================ */

let pack: PackFixture

/** The ADV7 in B-G-B, filed in the store as the picker files it. */
function theAdv7(): QuoteDef {
  const table: EntityDef = pack.byKey('boat_highfield')
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes('ADV7 (HYP) B-G-B'))
  expect(row, 'the price file has no ADV7 in Hypalon, Black / Grey / Black').toBeDefined()
  const sheet = catalogue.getState()
  const ctx = makeCtx({
    entities: sheet.tables as Record<string, EntityDef>,
    rowsByEntity: sheet.rows as Record<string, RowData[]>,
    views: { ...sheet.views },
    modules: pack.ctx.modules,
    priceLevels: pack.ctx.priceLevels,
    orgId: 'northside',
  })
  const view = createViewFor(ctx, table.id)
  const minted = mintQuote(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-TEST' })
  expect(minted).not.toBeNull()
  quotes.getState().file(minted!.quote, minted!.event)
  return minted!.quote
}

/** The rail the engine reads for the document as it now stands. */
function railFor(quote: QuoteDef) {
  const sheet = catalogue.getState()
  const ctx = makeCtx({
    entities: sheet.tables as Record<string, EntityDef>,
    rowsByEntity: sheet.rows as Record<string, RowData[]>,
    views: { ...sheet.views },
    priceLevels: pack.ctx.priceLevels,
    orgId: 'northside',
  })
  return readRail(ctx, quotes.getState().get(quote.id)!)
}

const head = (name: RegExp): HTMLElement => screen.getByRole('button', { name })
const HULL = /^01 The hull/
const MOTOR = /^02 Motor/
const WHO = /^Who it is for/
const FINALE = /^The finale/

/** The motor the critic pressed, where the file pairs it with this hull;
 *  otherwise the first motor it does pair. */
function aMotor(): HTMLElement {
  const chapter = screen.getByRole('region', { name: /02 Motor/ })
  const offered = within(chapter).getAllByRole('button', { pressed: false })
  expect(offered.length, 'the ADV7 is offered no motor at all').toBeGreaterThan(0)
  return offered.find((b) => b.textContent?.includes('F250XCB')) ?? offered[0]!
}

beforeAll(async () => {
  pack = await loadPack()
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
  await quotes.getState().openFor('northside')
  session.getState().signIn('Asaf')
})

describe('arriving from the picker, with no position in the address', () => {
  /* THE OWNER, 2026-10-30: "always hull expanded first". The build opens on the boat, and moves
     on only when the dealer presses another chapter — never by itself (the flow walk: the first
     part pressed closed Dealer fit and jumped to Who it is for, and the behaviour changed under
     the finger). */
  it('opens on 01 The hull, whatever band is still empty', () => {
    const quote = theAdv7()
    const rail = railFor(quote)
    expect(rail.chapters.some((c) => c.kind === 'band' && c.lines === 0)).toBe(true)
    render(<Configurator quoteId={quote.id} />)
    expect(head(HULL)).toHaveAttribute('aria-expanded', 'true')
    expect(head(MOTOR)).toHaveAttribute('aria-expanded', 'false')
  })

  it('stays on the hull when a write answers the empty band, and moves on only by a press', async () => {
    const quote = theAdv7()
    const goTo = (at: string): void => {
      view.rerender(<Configurator quoteId={quote.id} at={at} />)
    }
    const view = render(<Configurator quoteId={quote.id} goTo={goTo} />)
    await userEvent.click(head(MOTOR))
    expect(head(MOTOR)).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(aMotor())
    /* the motor went on, and the chapter the dealer opened stays open under the press */
    expect(railFor(quote).chapters.find((c) => c.id === 'motor')!.lines).toBe(1)
    expect(head(MOTOR)).toHaveAttribute('aria-expanded', 'true')
    expect(head(WHO)).toHaveAttribute('aria-expanded', 'false')
    expect(head(FINALE)).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('a chapter the dealer opened himself', () => {
  it('stays open under the press, with the motor now on it', async () => {
    const quote = theAdv7()
    render(<Configurator quoteId={quote.id} at="motor" />)
    const chapter = screen.getByRole('region', { name: /02 Motor/ })
    expect(within(chapter).queryAllByRole('button', { pressed: true })).toEqual([])
    await userEvent.click(aMotor())
    expect(head(MOTOR)).toHaveAttribute('aria-expanded', 'true')
    expect(head(WHO)).toHaveAttribute('aria-expanded', 'false')
    /* the motor it took is lit where it was pressed */
    expect(within(chapter).getAllByRole('button', { pressed: true })).toHaveLength(1)
  })
})
