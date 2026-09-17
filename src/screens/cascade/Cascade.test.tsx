import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { makeCtx, rowLabel } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import {
  addLine,
  buildSteps,
  issue,
  mintQuote,
  quoteLevelChoices,
  quoteTotals,
  setCustomer,
  signedMoney,
  stepOffer,
} from '@/domain/quote'
import { Cascade } from './Cascade'
import { finishFix, levelFix, readProposal, isRefused } from './proposal'

/* ============================================================
   The cascade, rendered against the real pack, read by role and by
   text.

   NOT ONE FIGURE BELOW IS TYPED INTO AN ASSERTION. Every total,
   delta and sentence is computed by the engine in the test and then
   looked for on the screen, so a test cannot agree with a screen that
   has drifted from the price file — the same discipline
   `Configurator.test.tsx` and `Picker.test.tsx` keep.
   ============================================================ */

let pack: PackFixture

const loadTheFile = async (): Promise<void> => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
}

const ctxNow = () => {
  const sheet = catalogue.getState()
  return makeCtx({
    entities: sheet.tables as Record<string, EntityDef>,
    rowsByEntity: sheet.rows as Record<string, RowData[]>,
    views: { ...sheet.views },
    modules: pack.ctx.modules,
    priceLevels: pack.ctx.priceLevels,
    orgId: 'northside',
  })
}

/** A quote on one row of the file, with something on it, filed in the
 *  store exactly as the picker files one. Freshly minted per test. */
function fileAQuote(key: string, find: string): QuoteDef {
  const table: EntityDef = pack.byKey(key)
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const ctx = ctxNow()
  const view = createViewFor(ctx, table.id)
  const minted = mintQuote(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-TEST' })
  expect(minted).not.toBeNull()
  quotes.getState().file(minted!.quote, minted!.event)
  for (const step of buildSteps(minted!.quote)) {
    const here = quotes.getState().get(minted!.quote.id)!
    const candidate = stepOffer(ctx, here, step.section, {}).candidates[0]
    if (!candidate) continue
    quotes.getState().apply(here.id, addLine(step.id, candidate.line))
  }
  return quotes.getState().get(minted!.quote.id)!
}

const otherRung = (quote: QuoteDef) =>
  quoteLevelChoices(quote.lines).find((r) => r.key !== quote.levelKey)!

beforeAll(async () => {
  pack = await loadPack()
  await loadTheFile()
  await quotes.getState().openFor('northside')
  session.getState().signIn('Asaf')
})

describe('the decision', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = fileAQuote('boat_highfield', 'SP560')
  })

  it('opens on the pick named in the address, with the engine’s own headline', () => {
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    expect(isRefused(reading)).toBe(false)
    if (isRefused(reading)) return

    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      reading.proposal.cascade.title,
    )
    expect(screen.getByText(reading.proposal.cascade.subtitle)).toBeInTheDocument()
    /* THE THING ASKED FOR IS NAMED IN ITS OWN BLOCK. The rung's label
       is also the dealer's column name and appears under every figure
       that moves, which is the point of printing it there — so this
       asks the block that is about the ask. */
    const asked = screen.getByRole('region', { name: 'What you chose' })
    expect(within(asked).getByText(rung.label)).toBeInTheDocument()
    expect(within(asked).getByText(reading.proposal.askedSay)).toBeInTheDocument()
  })

  it('is one card per cause, each headed by the sentence the engine wrote', () => {
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)

    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    for (const cause of reading.proposal.causes) {
      const head = screen.getAllByRole('heading', { level: 2 })
      expect(
        head.some((h) => h.textContent?.includes(cause.because)),
        cause.because,
      ).toBe(true)
      /* and every row it explains is under it, by name */
      for (const row of cause.rows) {
        expect(screen.getAllByText(row.label).length).toBeGreaterThan(0)
      }
    }
  })

  it('prices the whole change in one figure, and says both totals in words', () => {
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)
    const { from, to, delta } = reading.proposal.cascade

    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    const decision = within(screen.getByTestId('decision'))
    expect(decision.getByText(signedMoney(delta))).toBeInTheDocument()
    expect(
      decision.getByText(new RegExp(`${money(from)}.*today.*${money(to)}`.replaceAll('$', '\\$'))),
    ).toBeInTheDocument()
  })

  it('counts what it does not touch off the frozen lines, never off a field the contract lacks', () => {
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)

    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    const untouched = reading.proposal.untouched
    expect(
      screen.getByText(
        untouched === 0
          ? /Every line on this quote is accounted for/
          : new RegExp(`${untouched.toLocaleString('en-AU')} other`),
      ),
    ).toBeInTheDocument()
  })
})

describe('accepting and declining', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = fileAQuote('boat_highfield', 'SP560')
  })

  it('writes nothing at all until the act is pressed', () => {
    const rung = otherRung(quote)
    const before = quoteTotals(quotes.getState().get(quote.id)!).total
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(before)
    expect(quotes.getState().get(quote.id)!.levelKey).toBe(quote.levelKey)
  })

  it('leaves the quote exactly as it was when it is declined', async () => {
    const rung = otherRung(quote)
    const before = quotes.getState().get(quote.id)!
    const step = quotes.getState().undoable(quote.id)
    const goBack = vi.fn<(chapterId: string) => void>()
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="motor" goBack={goBack} />)

    await userEvent.click(screen.getByRole('button', { name: 'Leave it as it is' }))
    expect(goBack).toHaveBeenCalledWith('motor')
    /* THE SAME OBJECT, not an equal one: declining did not write, so
       there was nothing for the store to replace. And no step was
       pushed, so the way back still points at whatever the person did
       before they opened this. */
    expect(quotes.getState().get(quote.id)!).toBe(before)
    expect(quotes.getState().undoable(quote.id)).toBe(step)
  })

  it('moves the document to the total it promised, and offers the way back', async () => {
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)
    const promised = reading.proposal.cascade.to
    const was = quoteTotals(quote).total

    render(
      <Cascade
        quoteId={quote.id}
        fix={levelFix(rung.key)}
        from="hull"
        goBack={vi.fn<(chapterId: string) => void>()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: reading.proposal.cascade.accept }))

    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(promised)
    expect(screen.getByText(new RegExp(money(promised).replaceAll('$', '\\$')))).toBeInTheDocument()

    /* THE WAY BACK STANDS ON THE SCREEN, pinned to the step it came
       from — not in a toast that vanishes. */
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(was)

    await userEvent.click(screen.getByRole('button', { name: 'Put it back' }))
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(promised)
  })

  it('refuses an issued quote with the engine’s own sentence, and writes nothing', async () => {
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    quotes.getState().apply(quote.id, issue())
    const given = quotes.getState().get(quote.id)!
    const rung = otherRung(given)
    const reading = readProposal(ctxNow(), given, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)

    render(
      <Cascade
        quoteId={quote.id}
        fix={levelFix(rung.key)}
        from="hull"
        goBack={vi.fn<(chapterId: string) => void>()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: reading.proposal.cascade.accept }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'so nothing can go back on it. Make a new version to change it.',
    )
    expect(quotes.getState().get(quote.id)!.levelKey).toBe(given.levelKey)
  })
})

describe('an address the document has moved past', () => {
  it('says plainly what it asked for and why it cannot be had', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(
      <Cascade
        quoteId={quote.id}
        fix={levelFix(quote.levelKey)}
        from="hull"
        goBack={vi.fn<(chapterId: string) => void>()}
      />,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This quote has moved on.')
    expect(screen.getByText(/already priced at/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to the build' })).toBeInTheDocument()
  })

  it('says so for an address that names no decision at all', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(
      <Cascade quoteId={quote.id} fix="" from="" goBack={vi.fn<(chapterId: string) => void>()} />,
    )
    expect(screen.getByText(/names no decision/)).toBeInTheDocument()
  })

  it('says so for a quote this browser does not hold', () => {
    render(
      <Cascade
        quoteId="not-a-quote"
        fix={levelFix('trade')}
        goBack={vi.fn<(chapterId: string) => void>()}
      />,
    )
    expect(screen.getByText(/No quote is filed at this address/)).toBeInTheDocument()
  })
})

describe('the hull', () => {
  it('shows the re-rooting priced, with what the new hull is paired with instead', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const ctx = ctxNow()
    const table = pack.byKey('boat_highfield')
    const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
    const other = rows.find((r) => {
      if (r.id === quote.rootRowId) return false
      const reading = readProposal(ctx, quote, finishFix(r.id))
      return !isRefused(reading) && reading.proposal.cascade.delta !== 0
    })!
    const reading = readProposal(ctx, quote, finishFix(other.id))
    if (isRefused(reading)) throw new Error(reading.refused)

    render(
      <Cascade
        quoteId={quote.id}
        fix={finishFix(other.id)}
        from="hull"
        goBack={vi.fn<(chapterId: string) => void>()}
      />,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      reading.proposal.cascade.title,
    )
    /* THE DECISION'S OWN FIGURE, in the decision. On a change with one
       cause and one row the same delta is also the card's chip and the
       row's own figure, which is correct and is why this asks the
       footer rather than the page. */
    const decision = within(screen.getByTestId('decision'))
    expect(decision.getByText(signedMoney(reading.proposal.cascade.delta))).toBeInTheDocument()

    const alternatives = screen.getByRole('region', { name: 'What this hull is paired with' })
    for (const alternative of reading.proposal.alternatives) {
      expect(within(alternatives).getByText(alternative.label)).toBeInTheDocument()
    }

    await userEvent.click(screen.getByRole('button', { name: reading.proposal.cascade.accept }))
    expect(quotes.getState().get(quote.id)!.rootRowId).toBe(other.id)
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(reading.proposal.cascade.to)
  })
})

describe('no cost column reaches this screen', () => {
  it('on either channel', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const rung = otherRung(quote)
    render(
      <Cascade
        quoteId={quote.id}
        fix={levelFix(rung.key)}
        from="hull"
        goBack={vi.fn<(chapterId: string) => void>()}
      />,
    )
    const said = screen.getByTestId('cascade').textContent ?? ''
    /* the manifest names 139 of them; these are the ones whose
       spelling could not be ordinary English, which is the same test
       tools/check.ts applies to the source */
    for (const name of [
      'Landed Hull Cost',
      'Total Nett CTD',
      'Nett Price',
      'Dealer List Price',
      'Base Cost',
      'Landed CTD',
      'Total PD Allowance',
      'GP',
    ]) {
      expect(said, `${name} is on a customer-facing surface`).not.toContain(name)
    }
  })
})
