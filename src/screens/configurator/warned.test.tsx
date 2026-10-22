import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { makeCtx, rowLabel } from '@/domain/model'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuote, setCustomer } from '@/domain/quote'
import { pairColumns, pairRule } from '@/domain/rules/constraints/pairRules'
import { addRule } from '@/domain/catalogue/ruleCommands'
import { Configurator } from './Configurator'
import { readRail } from './chapters'

/* ============================================================
   A RULE THAT WARNS, WHERE THE CHOICE IS MADE (built-critique-m3-2.md, major 3).

   The critic wrote a rule that warns and found it said only in a sentence above the motor list:
   the warned F25SWTC's tile read "Yamaha F25SWTC / 25 hp · 57 kg · 15″ shaft / +$532", its name
   to a reader said nothing either, and once it was chosen the finale said nothing and Give was
   live. Here the rule goes in through the catalogue's own command, as Rules files it, and the
   screen is read by role and text: the tile wears the mark and says it in its name, the finale
   says the rule's because over the give, and the give stays the dealer's to press — a warning
   never refuses.

   NO NAME OR FIGURE IS TYPED INTO AN ASSERTION BUT THE RULE'S OWN WORDS: which motors it warns
   about is read off the engine's rail for the same quote.
   ============================================================ */

let pack: PackFixture

const BECAUSE = 'a small motor will not plane a Stacer'
const PROLINE = '379 Proline L/S'

/** "When the boat's maker is Stacer, the motor's horsepower must be at least {hp} hp", warning. */
function warning(hp: number) {
  const boat = pairColumns(pack.ctx, 'boat')
  const motor = pairColumns(pack.ctx, 'motor')
  return pairRule({
    orgId: 'northside',
    boat: { column: boat.find((c) => c.name === 'maker')!, op: 'eq', value: 'Stacer' },
    partnerKind: 'motor',
    partner: { column: motor.find((c) => c.name === 'horsepower')!, op: 'gte', value: String(hp) },
    because: BECAUSE,
    severity: 'warn',
    enabled: true,
    now: '2026-10-22T09:00:00.000Z',
  })
}

function ctxNow() {
  const sheet = catalogue.getState()
  return makeCtx({
    entities: sheet.tables as Record<string, EntityDef>,
    rowsByEntity: sheet.rows as Record<string, RowData[]>,
    views: { ...sheet.views },
    modules: pack.ctx.modules,
    priceLevels: pack.ctx.priceLevels,
    constraintDefs: [...sheet.constraintDefs],
    orgId: 'northside',
  })
}

function fileAQuote(find: string): QuoteDef {
  const table: EntityDef = pack.byKey('boat_stacer')
  const row = ((pack.rowsByEntity[table.id] ?? []) as RowData[]).find((r) =>
    rowLabel(table, r).includes(find),
  )
  expect(row, `no Stacer row matching ${find}`).toBeDefined()
  const ctx = ctxNow()
  const view = createViewFor(ctx, table.id)
  const minted = mintQuote(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-WARN' })
  expect(minted).not.toBeNull()
  quotes.getState().file(minted!.quote, minted!.event)
  return minted!.quote
}

const motorList = (quote: QuoteDef) =>
  readRail(ctxNow(), quotes.getState().get(quote.id)!).chapters.find((c) => c.id === 'motor')!
    .tables[0]!

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

afterEach(() => {
  catalogue.setState({ constraintDefs: [] })
})

describe('a rule that warns about a motor', () => {
  it('marks every tile it warns about, in the tile and in its name, and no other', () => {
    const quote = fileAQuote(PROLINE)
    expect('refused' in catalogue.getState().apply(addRule(warning(15)))).toBe(false)
    const list = motorList(quote)
    const warned = list.rows.filter((r) => r.warned)
    const clear = list.rows.filter((r) => !r.warned)
    expect(warned.length).toBeGreaterThan(0)
    expect(clear.length).toBeGreaterThan(0)

    render(<Configurator quoteId={quote.id} at="motor" />)
    const motor = screen.getByRole('region', { name: /Motor/ })
    for (const row of warned) {
      const tile = within(motor).getByRole('button', { name: new RegExp(`^${esc(row.tail)},`) })
      expect(tile).toHaveAccessibleName(expect.stringContaining('your rule warns about it'))
      expect(within(tile).getByText('Your rule warns')).toBeInTheDocument()
    }
    for (const row of clear) {
      const tile = within(motor).getByRole('button', { name: new RegExp(`^${esc(row.tail)},`) })
      expect(tile).not.toHaveAccessibleName(expect.stringContaining('warns'))
      expect(within(tile).queryByText('Your rule warns')).toBeNull()
    }
    /* the because is said once, above the list, naming what it warns about */
    const said = screen.getByTestId('ruled-here')
    expect(said).toHaveTextContent(`because ${BECAUSE}.`)
    expect(said).toHaveTextContent(warned[0]!.tail)
  })

  it('says "every motor offered here" when it warns about all of them, not three names and "more"', () => {
    const quote = fileAQuote(PROLINE)
    catalogue.getState().apply(addRule(warning(30)))
    const list = motorList(quote)
    expect(list.rows.length).toBeGreaterThan(1)
    expect(list.rows.every((r) => r.warned)).toBe(true)

    render(<Configurator quoteId={quote.id} at="motor" />)
    expect(screen.getByTestId('ruled-here')).toHaveTextContent(
      `Your rule warns about every motor offered here, because ${BECAUSE}.`,
    )
    expect(screen.getByTestId('ruled-here')).not.toHaveTextContent(/more,/)
  })

  it('once chosen, is said over the give with its because, and the give stays live', async () => {
    const quote = fileAQuote(PROLINE)
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    catalogue.getState().apply(addRule(warning(30)))
    const fitted = motorList(quote).rows.find((r) => r.fitted)!
    expect(fitted.warned).toBe(true)

    render(<Configurator quoteId={quote.id} at="finale" />)
    const over = screen.getByTestId('warned-on-quote')
    expect(over).toHaveTextContent(
      new RegExp(
        `^Your rule warns about the ${esc(fitted.tail)} on this quote, because ${BECAUSE}\\.$`,
      ),
    )
    const give = screen.getByRole('button', { name: 'Give it to the customer' })
    expect(give).not.toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(give)
    expect(quotes.getState().get(quote.id)!.state).toBe('issued')
  })

  it('leaves the give once the warned motor is changed for one it does not warn about', async () => {
    const quote = fileAQuote(PROLINE)
    catalogue.getState().apply(addRule(warning(15)))
    const list = motorList(quote)
    expect(list.rows.find((r) => r.fitted)?.warned).toBe(true)
    const clear = list.rows.find((r) => !r.warned)!

    const first = render(<Configurator quoteId={quote.id} at="finale" />)
    expect(screen.getByTestId('warned-on-quote')).toHaveTextContent(`because ${BECAUSE}.`)
    first.unmount()

    render(<Configurator quoteId={quote.id} at="motor" />)
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${esc(clear.tail)},`) }))
    expect(motorList(quote).rows.find((r) => r.fitted)?.tail).toBe(clear.tail)
    expect(readRail(ctxNow(), quotes.getState().get(quote.id)!).warnedOnQuote).toEqual([])
  })
})

function esc(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
