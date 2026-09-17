import type { ReactElement } from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { rowLabel } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { ISSUED_REFUSAL, mintQuote, quoteTotals, signedMoney } from '@/domain/quote'
import { makeCtx } from '@/domain/model'
import { Configurator } from './Configurator'
import { readRail } from './chapters'
import { hullHero } from './stage'

/* ============================================================
   The configurator, rendered against the real pack, read by role
   and by text.

   NOT ONE FIGURE BELOW IS TYPED INTO AN ASSERTION. Every total,
   delta, count and sentence is computed by the engine in the test
   and then looked for on the screen, so a test cannot agree with a
   screen that has drifted from the price file — the same discipline
   `Picker.test.tsx` keeps.
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

/** A quote on one row of the file, filed in the store exactly as the
 *  picker files one. Freshly minted per test, so no case can see
 *  another's picks. */
function fileAQuote(key: string, find: string): QuoteDef {
  const table: EntityDef = pack.byKey(key)
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
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

/** The rail the engine reads for a document, so an assertion can ask
 *  for the figure the engine computed rather than one typed here. */
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

beforeAll(async () => {
  pack = await loadPack()
  await loadTheFile()
  await quotes.getState().openFor('northside')
  session.getState().signIn('Asaf')
})

describe('the running price', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = fileAQuote('boat_stacer', '529 Assault Pro')
  })

  it('is on screen from the first paint, at the engine’s own total', () => {
    render(<Configurator quoteId={quote.id} />)
    const total = screen.getByTestId('running-total')
    expect(within(total).getByText(money(quoteTotals(quote).total))).toBeInTheDocument()
  })

  it('names the document, the business and the state beside it', () => {
    render(<Configurator quoteId={quote.id} business="Northside Marine" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(quote.subjectLabel)
    expect(screen.getByText(/Northside Marine/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(quote.reference))).toBeInTheDocument()
  })

  it('moves to the engine’s new total when a line goes on', async () => {
    render(<Configurator quoteId={quote.id} at="motor" />)
    const rail = railFor(quote)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    const spare = motors.find((r) => !r.fitted && r.amount !== null)!
    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare.tail)) }))
    const after = quotes.getState().get(quote.id)!
    expect(quoteTotals(after).total).toBe(spare.would)
    const total = screen.getByTestId('running-total')
    expect(within(total).getByText(money(spare.would))).toBeInTheDocument()
  })
})

describe('a chapter head states its own answer while it is shut', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = fileAQuote('boat_stacer', '529 Assault Pro')
  })

  it('carries the number, the name, the engine’s clause and the subtotal', () => {
    render(<Configurator quoteId={quote.id} at="hull" />)
    const rail = railFor(quote)
    for (const chapter of rail.chapters.filter((c) => c.kind === 'band')) {
      const head = screen.getByRole('button', {
        name: new RegExp('^' + escape(chapter.num + ' ' + chapter.name)),
      })
      expect(head).toHaveAttribute('aria-expanded', String(chapter.id === 'hull'))
      expect(head).toHaveTextContent(chapter.num)
      expect(head).toHaveTextContent(chapter.fact)
      if (chapter.amount !== null) expect(head).toHaveTextContent(money(chapter.amount))
    }
  })

  it('draws the six chapters of a quote raised on a hull', () => {
    render(<Configurator quoteId={quote.id} />)
    const rail = railFor(quote)
    for (const chapter of rail.chapters) {
      const at = chapter.num === '' ? '· ' : chapter.num + ' '
      expect(
        screen.getByRole('button', { name: new RegExp('^' + escape(at + chapter.name)) }),
      ).toBeInTheDocument()
    }
    expect(rail.chapters.map((c) => c.name)).toEqual([
      'The hull',
      'Motor',
      'Trailer',
      'Dealer fit',
      'Who it is for',
      'The finale',
    ])
  })

  it('writes the chapter into the position when a head is pressed', async () => {
    const goTo = vi.fn<(id: string) => void>()
    render(<Configurator quoteId={quote.id} at="hull" goTo={goTo} />)
    await userEvent.click(screen.getByRole('button', { name: /^03 Trailer/ }))
    expect(goTo).toHaveBeenCalledWith('trailer')
  })
})

describe('an option row', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = fileAQuote('boat_stacer', '529 Assault Pro')
  })

  it('stars the file’s own recommendation and only that one', () => {
    render(<Configurator quoteId={quote.id} at="motor" />)
    const rail = railFor(quote)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    expect(motors.filter((r) => r.starred).length).toBe(1)
    expect(
      screen.getByRole('button', {
        name: new RegExp(`recommended by the price file`),
      }),
    ).toBeInTheDocument()
  })

  it('prints the dealer’s own code beside the name', () => {
    render(<Configurator quoteId={quote.id} at="motor" />)
    const rail = railFor(quote)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    for (const row of motors.slice(0, 3)) {
      expect(screen.getAllByText(row.code).length).toBeGreaterThan(0)
    }
  })

  it('prices the press, signed, and a fitted row comes off', () => {
    render(<Configurator quoteId={quote.id} at="motor" />)
    const rail = railFor(quote)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    const fitted = motors.find((r) => r.fitted)!
    expect(fitted.delta).toBeLessThan(0)
    expect(screen.getAllByText(money(fitted.delta!)).length).toBeGreaterThan(0)
    const spare = motors.find((r) => !r.fitted && r.amount !== null)!
    expect(screen.getAllByText(`+${money(spare.delta!)}`).length).toBeGreaterThan(0)
  })

  it('says the column instead of a figure where the file prices nothing', () => {
    const sp560 = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={sp560.id} at="fit" />)
    /* THE EM-DASH IN EVERY EMPTY CELL, never a blank and never a nought */
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(screen.getAllByText('no price column on this table').length).toBeGreaterThan(0)
  })
})

describe('the search is the navigation', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = fileAQuote('boat_highfield', 'SP560')
  })

  it('reaches past every chapter’s shortlist and says how many', async () => {
    render(<Configurator quoteId={quote.id} />)
    await userEvent.type(screen.getByRole('searchbox'), 'F250')
    const rail = readRailFor(quote, 'F250')
    expect(
      screen.getByText(new RegExp(`${rail.hits.toLocaleString('en-AU')} rows carry those words`)),
    ).toBeInTheDocument()
    expect(screen.getByText(/the shortlist was standing in front of/)).toBeInTheDocument()
  })

  it('leaves a row the pairings left out visible, with the engine’s reason on it', async () => {
    render(<Configurator quoteId={quote.id} />)
    await userEvent.type(screen.getByRole('searchbox'), 'F250')
    const rail = readRailFor(quote, 'F250')
    const outside = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows[0]
    expect(outside.outside).toBe(true)
    expect(screen.getAllByText(outside.why).length).toBeGreaterThan(0)
    /* AND THE CONTROL IS LIVE. Nothing is greyed, nothing is hidden. */
    const row = screen.getByRole('button', { name: new RegExp(escape(outside.tail)) })
    expect(row).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('says so, once, when nothing anywhere carries the word', async () => {
    render(<Configurator quoteId={quote.id} />)
    await userEvent.type(screen.getByRole('searchbox'), 'zzzz')
    expect(
      screen.getByText('Nothing on this quote is called that, in any chapter.'),
    ).toBeInTheDocument()
  })

  function readRailFor(q: QuoteDef, query: string) {
    const sheet = catalogue.getState()
    const ctx = makeCtx({
      entities: sheet.tables as Record<string, EntityDef>,
      rowsByEntity: sheet.rows as Record<string, RowData[]>,
      views: { ...sheet.views },
      priceLevels: pack.ctx.priceLevels,
      orgId: 'northside',
    })
    return readRail(ctx, quotes.getState().get(q.id)!, { query })
  }
})

describe('a chapter with nothing to offer says why, and offers the way past', () => {
  it('prints the engine’s own sentence and reaches the whole table', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={quote.id} at="trailer" />)
    const rail = railFor(quote)
    const gfab = rail.chapters
      .find((c) => c.id === 'trailer')!
      .tables.find((t) => t.title === 'GFAB Trailers')!
    expect(screen.getByText(gfab.why)).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', {
        name: new RegExp(`Show all ${gfab.counts.catalogue} in GFAB Trailers`),
      }),
    )
    expect(screen.getByText(/Back to the .* paired with this hull/)).toBeInTheDocument()
    expect(screen.getAllByText(/never recorded that pairing/).length).toBeGreaterThan(0)
  })
})

describe('undo is on every pick, with the sentence of what it undid', () => {
  it('says what happened and takes it back', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="motor" />)
    const before = quoteTotals(quote).total
    const rail = railFor(quote)
    const spare = rail.chapters
      .find((c) => c.id === 'motor')!
      .tables[0].rows.find((r) => !r.fitted && r.amount !== null)!

    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare.tail)) }))
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent(spare.tail)
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(spare.would)

    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(before)
    expect(screen.getByTestId('last-step')).toHaveTextContent('off the quote again')
  })

  it('offers to put it back after a way back, and does', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="motor" />)
    const rail = railFor(quote)
    const spare = rail.chapters
      .find((c) => c.id === 'motor')!
      .tables[0].rows.find((r) => !r.fitted && r.amount !== null)!
    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare.tail)) }))
    await userEvent.click(within(screen.getByTestId('last-step')).getByRole('button'))
    await userEvent.click(
      within(screen.getByTestId('last-step')).getByRole('button', { name: 'Put it back' }),
    )
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(spare.would)
  })
})

/** The press on one finish row, by the accessible name the Tile
 *  carries — the material, the colourway and what the press would
 *  move the total by. */
const pressFinish = async (finish: {
  material: string
  colour: { say: string }
  delta: number
}): Promise<void> => {
  await userEvent.click(
    screen.getByRole('button', {
      name:
        finish.material +
        ' ' +
        finish.colour.say +
        ', ' +
        (finish.delta === 0 ? 'no change to the total' : signedMoney(finish.delta)),
    }),
  )
}

describe('the hull in another finish', () => {
  it('prices each finish as the document it would produce', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={quote.id} at="hull" />)
    const finishes = railFor(quote).chapters.find((c) => c.id === 'hull')!.finishes!
    const other = finishes.rows.find((f) => !f.current && f.delta !== 0)!
    expect(screen.getAllByText(`+${money(other.delta)}`).length).toBeGreaterThan(0)
  })

  /* A FINISH THAT COSTS SOMETHING IS A DECISION, and a decision is
     the cascade's. This used to re-root on the press; it raises the
     sheet now, and the sheet is what writes. */
  it('raises the cascade for a finish that moves the total, and writes nothing here', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const goCascade = vi.fn<(fix: string, from: string) => void>()
    render(<Configurator quoteId={quote.id} at="hull" goCascade={goCascade} />)
    const finishes = railFor(quote).chapters.find((c) => c.id === 'hull')!.finishes!
    const other = finishes.rows.find((f) => !f.current && f.delta !== 0)!

    await pressFinish(other)
    expect(goCascade).toHaveBeenCalledWith(`finish:${other.rowId}`, 'hull')
    expect(quotes.getState().get(quote.id)!.rootRowId).toBe(quote.rootRowId)
  })

  /* AND ONE THAT MOVES NOTHING IS APPLIED HERE. A sheet that opens to
     say "nothing happens" is a full stop in the middle of somebody's
     work — the engine's own rule, one level up. */
  it('re-roots in place for a finish that costs the same', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const goCascade = vi.fn<(fix: string, from: string) => void>()
    render(<Configurator quoteId={quote.id} at="hull" goCascade={goCascade} />)
    const finishes = railFor(quote).chapters.find((c) => c.id === 'hull')!.finishes!
    const same = finishes.rows.find((f) => !f.current && f.delta === 0)!

    await pressFinish(same)
    expect(goCascade).not.toHaveBeenCalled()
    expect(quotes.getState().get(quote.id)!.subjectLabel).toBe(same.label)
  })

  it('says why on a register that files one row per model', () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="hull" />)
    const finishes = railFor(quote).chapters.find((c) => c.id === 'hull')!.finishes!
    expect(finishes.rows.length).toBe(0)
    expect(finishes.why).toContain('Stacer')
    expect(screen.getByText(finishes.why)).toBeInTheDocument()
  })
})

describe('the rung', () => {
  /* IT IS A FACT AND THEN A PROPOSAL, never a switch. This retired a
     refusal — "the sheet that shows what that costs line by line is
     not built yet" — by having built the sheet. */
  it('prints the rung this document is on, with the engine’s own count of the lines that carry it', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={quote.id} at="hull" />)
    const rungs = railFor(quote).rungs
    const here = rungs.find((r) => r.key === quote.levelKey)!
    expect(screen.getByText(here.label)).toBeInTheDocument()
    expect(
      screen.getByText(
        `${here.carriedBy.toLocaleString('en-AU')} of ${quote.lines.length.toLocaleString('en-AU')}`,
      ),
    ).toBeInTheDocument()
  })

  it('raises the cascade for another rung, and writes nothing here', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const goCascade = vi.fn<(fix: string, from: string) => void>()
    render(<Configurator quoteId={quote.id} at="hull" goCascade={goCascade} />)
    const other = railFor(quote).rungs.find((r) => r.key !== quote.levelKey)!

    await userEvent.click(screen.getByRole('button', { name: `See what ${other.label} does` }))
    expect(goCascade).toHaveBeenCalledWith(`level:${other.key}`, 'hull')
    expect(quotes.getState().get(quote.id)!.levelKey).toBe(quote.levelKey)
  })
})

describe('who it is for, and the finale', () => {
  it('refuses to issue an unaddressed quote, with the engine’s own sentence', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="finale" />)
    const rail = railFor(quote)
    expect(rail.blockers.length).toBe(1)
    expect(screen.getByText(rail.blockers[0])).toBeInTheDocument()
    const act = screen.getByRole('button', { name: 'Give it to the customer' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(act)
    expect(quotes.getState().get(quote.id)!.state).toBe('draft')
  })

  it('addresses the quote, then issues it, then refuses every edit', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    const { rerender } = render(<Configurator quoteId={quote.id} at="handover" />)
    await userEvent.type(screen.getByLabelText(/Who the quote is addressed to/), 'R. Kelleher')
    await userEvent.click(screen.getByRole('button', { name: 'Address this quote' }))
    expect(quotes.getState().get(quote.id)!.customer.name).toBe('R. Kelleher')

    rerender(<Configurator quoteId={quote.id} at="finale" />)
    await userEvent.click(screen.getByRole('button', { name: 'Give it to the customer' }))
    expect(quotes.getState().get(quote.id)!.state).toBe('issued')

    rerender(<Configurator quoteId={quote.id} at="motor" />)
    expect(
      screen.getAllByText(/given to the customer, so nothing can go back on it/).length,
    ).toBeGreaterThan(0)
  })
})

describe('no document at this address', () => {
  it('says so rather than drawing an empty screen', () => {
    render(<Configurator quoteId="not-a-quote" />)
    expect(screen.getByText(/No quote is filed at this address/)).toBeInTheDocument()
  })
})

/** A sentence used inside a regular expression. */
const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A context over the loaded sheet, for the stage ladder's own
 *  reader — which asks the register and the row rather than the
 *  quote's label. */
const sheetCtx = () =>
  makeCtx({
    entities: catalogue.getState().tables as Record<string, EntityDef>,
    rowsByEntity: catalogue.getState().rows as Record<string, RowData[]>,
    orgId: 'northside',
  })

/* ============================================================
   WHAT THE CRITIQUE OF 2026-09-17 MEASURED, AND WHAT ANSWERS IT.
   Each block below is one finding, named, so a regression says which
   one came back.
   ============================================================ */

/** Address a fresh quote and give it to the customer, which is the
 *  one irreversible act in this app and the state four of the
 *  findings below are about. */
async function issueOne(quote: QuoteDef, rerender: (ui: ReactElement) => void, extra = {}) {
  await userEvent.type(screen.getByLabelText(/Who the quote is addressed to/), 'R. Kelleher')
  await userEvent.click(screen.getByRole('button', { name: 'Address this quote' }))
  rerender(<Configurator quoteId={quote.id} at="finale" {...extra} />)
  await userEvent.click(screen.getByRole('button', { name: 'Give it to the customer' }))
  expect(quotes.getState().get(quote.id)!.state).toBe('issued')
}

describe('the issued refusal is said once above a list, not once per row', () => {
  it('refuses every row, describes every row, and prints the sentence per list', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const openDocument = vi.fn<(id: string) => void>()
    const { rerender } = render(
      <Configurator quoteId={quote.id} at="handover" openDocument={openDocument} />,
    )
    await issueOne(quote, rerender, { openDocument })

    rerender(<Configurator quoteId={quote.id} at="motor" openDocument={openDocument} />)
    const refused = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-disabled') === 'true')
    /* MEASURED BEFORE THE FIX: five copies of this sentence on one
       open chapter — one in the rail and one under every row, four of
       them wedged BETWEEN two rows — where the chapter above said its
       own reason once, above the list. */
    expect(refused.length).toBeGreaterThan(4)
    expect(screen.getAllByText(ISSUED_REFUSAL).length).toBeLessThan(refused.length)
    /* and not one control lost its reason: a refusal is a sentence
       with its reason, where it is refused, and `aria-describedby` is
       what keeps that true of a shared one */
    for (const control of refused) {
      expect(control).toHaveAccessibleDescription(ISSUED_REFUSAL)
    }
  })
})

describe('the act of selling leads to the thing you hand over', () => {
  it('opens the document from the finale and from the masthead', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const openDocument = vi.fn<(id: string) => void>()
    const { rerender } = render(
      <Configurator quoteId={quote.id} at="handover" openDocument={openDocument} />,
    )
    /* A DRAFT HAS NO SHEET TO OPEN — the document renders from FROZEN
       lines and a draft's are still moving — so the control appears
       when there is something to open rather than standing refused. */
    rerender(<Configurator quoteId={quote.id} at="finale" openDocument={openDocument} />)
    expect(screen.queryByRole('button', { name: 'Open the document' })).not.toBeInTheDocument()

    rerender(<Configurator quoteId={quote.id} at="handover" openDocument={openDocument} />)
    await issueOne(quote, rerender, { openDocument })

    rerender(<Configurator quoteId={quote.id} at="finale" openDocument={openDocument} />)
    const acts = screen.getAllByRole('button', { name: 'Open the document' })
    expect(acts.length).toBe(2)
    await userEvent.click(acts[0])
    expect(openDocument).toHaveBeenCalledWith(quote.id)
  })

  it('opens the finale by itself on an issued quote, because it is the only chapter left', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const { rerender } = render(<Configurator quoteId={quote.id} at="handover" />)
    await issueOne(quote, rerender)

    rerender(<Configurator quoteId={quote.id} />)
    expect(screen.getByRole('button', { name: /The finale/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})

describe('the recommendation is named in words and no star is drawn', () => {
  it('prints the starred row’s name above the list and no glyph on it', () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="motor" />)
    const table = railFor(quote).chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(table.recommends).not.toBe('')
    expect(screen.getByText(table.recommends)).toBeInTheDocument()
    /* §4 of docs/research/refs/configurator/notes.md, measured across
       Saxdor, Apple, Whaler and Porsche: "None uses a star, a ribbon
       or a colour." */
    expect(screen.getByTestId('configurator').textContent).not.toContain('★')
    /* and the recommendation is still on the row for a reader */
    expect(
      screen.getByRole('button', { name: /recommended by the price file/ }),
    ).toBeInTheDocument()
  })
})

describe('a second line from one table is never silent', () => {
  it('says so, in the engine’s own sentence, as soon as the second one goes on', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={quote.id} at="motor" />)
    expect(screen.queryByTestId('several-on-one-table')).not.toBeInTheDocument()

    const spare = railFor(quote)
      .chapters.find((c) => c.id === 'motor')!
      .tables[0].rows.find((r) => !r.fitted && r.amount !== null)!
    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare.tail)) }))

    const table = railFor(quote).chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(table.severalSay).not.toBe('')
    expect(screen.getByTestId('several-on-one-table')).toHaveTextContent(spare.tail)
  })
})

describe('the stage draws the model’s own photograph where the ledger holds one', () => {
  it('takes the hero tier over the catalogue copy, at the ledger’s own pixels', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const hero = hullHero(sheetCtx(), quote)
    expect(hero, 'the ledger holds no stage photograph for this hull').not.toBeNull()
    /* the catalogue tier is capped at long edge 1100; a hero is
       resampled to 2560 for a stage and nothing else */
    expect(hero!.width).toBeGreaterThan(1100)

    render(<Configurator quoteId={quote.id} at="hull" />)
    const drawn = screen.getByRole('img', { name: hero!.subject })
    expect(drawn).toHaveAttribute('src', hero!.src)
    expect(drawn).toHaveAttribute('width', String(hero!.width))
    expect(
      screen.getByText(new RegExp(`Stage copy ${hero!.width.toLocaleString('en-AU')}`)),
    ).toBeInTheDocument()
  })

  it('draws the catalogue copy for a hull the hero ledger does not carry', () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    expect(hullHero(sheetCtx(), quote)).toBeNull()
    render(<Configurator quoteId={quote.id} at="hull" />)
    expect(screen.queryByText(/Stage copy/)).not.toBeInTheDocument()
  })
})
