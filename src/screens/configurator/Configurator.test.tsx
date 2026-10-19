import type { ReactElement } from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { rowLabel } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import {
  ISSUED_REFUSAL,
  addLine,
  mintQuote,
  quoteTotals,
  removeLine,
  setCustomer,
  signedMoney,
} from '@/domain/quote'
import { HULL_PRICE_REASON, HULL_UNPRICED_WHY } from '@/domain/quote/nought'
import { NOT_PRICED_ON_PAPER } from '@/screens/document/paper'
import { makeCtx } from '@/domain/model'
import { Toaster } from '@/ui'
import { Configurator } from './Configurator'
import { readRail } from './chapters'
import { hullHero } from './stage'
import { boatTravel } from './glyphs'
import { engineWordsIn, unpricedNamesSay } from './say'
import { saidOnQuote, spokenBoat } from '@/domain/quote/spoken'

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
    /* the boat as a person says it, and never the file's key string
       (built-critique-m2-close-2.md, the one thing to change first) */
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      spokenBoat(quote.rootTableId, quote.subjectLabel).name,
    )
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toContain(' - ')
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

  /* "The build numbers its last two chapters `·`. `01 02 03 04 · ·`" (the
     M2-close critique, #20): a mark in the number column nobody could
     read. The two closing chapters carry no number, and nothing in its
     place. */
  it('prints no mark in the number column of the two chapters that close the sale', () => {
    render(<Configurator quoteId={quote.id} at="hull" />)
    const printed = [...document.querySelectorAll('.cfg-head__num')].map((n) => n.textContent)
    expect(printed).toEqual(railFor(quote).chapters.map((c) => c.num))
    expect(printed.slice(-2)).toEqual(['', ''])
    expect(printed).not.toContain('·')
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
      /* a closing chapter is named by its name alone: no "·" before it (#20) */
      const at = chapter.num === '' ? '' : chapter.num + ' '
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

  /* THE CHOSEN ONE SAYS ITS PRICE ON THE QUOTE, NOT A MINUS (the components critique,
     2026-09-29, minor 12: "−$14,330 $14,330 at Cash" on the chosen Yamaha read as a discount).
     The press still takes it off, and a reader still hears that it is on the quote. */
  it('prices the press, signed, and a fitted row says its price on the quote and comes off', async () => {
    render(<Configurator quoteId={quote.id} at="motor" />)
    const rail = railFor(quote)
    const motors = rail.chapters.find((c) => c.id === 'motor')!.tables[0].rows
    const fitted = motors.find((r) => r.fitted)!
    expect(fitted.delta).toBeLessThan(0)
    const on = screen.getByRole('button', {
      name: new RegExp(`^${escape(fitted.tail)},.*on the quote$`),
    })
    expect(within(on).getByText(money(fitted.amount!))).toBeInTheDocument()
    expect(within(on).getByText('on the quote')).toBeInTheDocument()
    expect(within(on).queryByText(money(fitted.delta!))).not.toBeInTheDocument()
    const spare = motors.find((r) => !r.fitted && r.amount !== null)!
    expect(screen.getAllByText(`+${money(spare.delta!)}`).length).toBeGreaterThan(0)
    await userEvent.click(on)
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(fitted.would)
  })

  it('says once, over the list, that the file prices nothing in it — never under each row', () => {
    const sp560 = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={sp560.id} at="fit" />)
    /* NO FIGURE IS NO PILL (build-close-critique.md, 2026-10-19, minor 11: the unpriced kits
       ended on "—"): never a blank pill, never a nought, never a dash — the list says it once */
    expect(document.querySelectorAll('.cfg-row__delta[data-way="none"]')).toHaveLength(0)
    const unpriced = railFor(sp560)
      .chapters.find((c) => c.id === 'fit')!
      .tables.filter((t) => t.unpriced)
    expect(unpriced.length, 'the SP560 has a dealer-fit list with no price at all').toBeGreaterThan(
      0,
    )
    for (const table of unpriced) {
      expect(
        screen.getAllByText(new RegExp(`The price file gives ${table.title} no prices`)),
      ).toHaveLength(1)
    }
    /* the engine's sentence, six times in one chapter on the old tree */
    expect(screen.queryByText('no price column on this table')).not.toBeInTheDocument()
  })
})

describe('a motor is the kit’s photographed tile, where the ledger holds its picture', () => {
  it('draws each motor with its own held picture, its power, weight and shaft, and the pairing’s words one press away', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="motor" />)
    const table = railFor(quote).chapters.find((c) => c.id === 'motor')!.tables[0]!
    expect(table.pictured, 'the Yamaha shelf holds pictures').toBe(true)
    const pictured = table.rows.filter((r) => r.picture !== null)
    expect(pictured.length).toBeGreaterThan(0)
    for (const row of pictured) {
      const tile = screen.getByRole('button', { name: new RegExp(`^${escape(row.tail)}\\b`) })
      /* the picture is the row's own, resolved through the ledger — and it says nothing a
         reader has not already heard in the tile's name */
      const img = tile.querySelector('img')!
      expect(img.getAttribute('src')).toBe(row.picture!.src)
      expect(img).toHaveAttribute('alt', '')
      expect(row.spec).toMatch(/^\d[\d.]* hp · \d+ kg · \d+″ shaft$/)
      expect(within(tile).getByText(row.spec)).toBeInTheDocument()
      /* THE PAIRING'S WORDS ARE THE WORKSHOP'S, NOT THE TILE'S (the components critique,
         2026-09-29, blocker 2): none of them is on the tile's face, and each of them, whole,
         is one press away under it — the press described by the option it belongs to */
      expect(row.twin).toBe(false)
      for (const fact of row.facts) expect(tile).not.toHaveTextContent(fact.full)
      const option = tile.closest('.cfg-opt') as HTMLElement
      const shop = within(option).getByRole('button', { name: 'For the workshop' })
      expect(shop).toHaveAttribute('aria-expanded', 'false')
      expect(shop).toHaveAccessibleDescription(new RegExp(escape(row.tail)))
      await userEvent.click(shop)
      expect(shop).toHaveAttribute('aria-expanded', 'true')
      for (const fact of row.facts) {
        expect(option).toHaveTextContent(fact.label)
        expect(option).toHaveTextContent(fact.full)
      }
    }
  })

  it('keeps a list the file gives no pictures as a ruled list of rows', () => {
    const sp560 = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={sp560.id} at="fit" />)
    const fit = railFor(sp560).chapters.find((c) => c.id === 'fit')!
    expect(fit.tables.every((t) => !t.pictured)).toBe(true)
    const open = document.querySelector('.cfg-chapter[data-open]')!
    expect(open.querySelectorAll('.cfg-rows li').length).toBeGreaterThan(0)
    expect(open.querySelectorAll('.cfg-tiles')).toHaveLength(0)
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
      screen.getByText(new RegExp(`${rail.hits.toLocaleString('en-AU')} options? match`)),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        new RegExp(`${rail.beyond.toLocaleString('en-AU')} of them not paired with this hull`),
      ),
    ).toBeInTheDocument()
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

/* THE STEP IS THE KIT'S TOAST (the component critique, 2026-09-28, major 9): the build is
   drawn beside the one Toaster the root mounts, as it is in the app. */
const withTheToaster = (ui: ReactElement): ReactElement => (
  <>
    {ui}
    <Toaster />
  </>
)

describe('undo is on every pick, with the sentence of what it undid', () => {
  it('says what happened and takes it back', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(withTheToaster(<Configurator quoteId={quote.id} at="motor" />))
    const before = quoteTotals(quote).total
    const rail = railFor(quote)
    const spare = rail.chapters
      .find((c) => c.id === 'motor')!
      .tables[0].rows.find((r) => !r.fitted && r.amount !== null)!

    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare.tail)) }))
    const step = await screen.findByTestId('last-step')
    expect(step).toHaveTextContent(spare.tail)
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(spare.would)

    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(before)
    await waitFor(() =>
      expect(screen.getByTestId('last-step')).toHaveTextContent('off the quote again'),
    )
  })

  it('offers to put it back after a way back, and does', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(withTheToaster(<Configurator quoteId={quote.id} at="motor" />))
    const rail = railFor(quote)
    const spare = rail.chapters
      .find((c) => c.id === 'motor')!
      .tables[0].rows.find((r) => !r.fitted && r.amount !== null)!
    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare.tail)) }))
    await userEvent.click(within(await screen.findByTestId('last-step')).getByRole('button'))
    await userEvent.click(
      await within(screen.getByTestId('last-step')).findByRole('button', { name: 'Put it back' }),
    )
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(spare.would)
  })

  it('says it beside the chapters and never above them, wearing the kind of what it wrote', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(withTheToaster(<Configurator quoteId={quote.id} at="motor" />))
    const find = document.querySelector('.cfg-find')!
    const drawn = find.innerHTML
    const spare = railFor(quote)
      .chapters.find((c) => c.id === 'motor')!
      .tables[0].rows.filter((r) => !r.fitted && r.amount !== null)
      /* two rows a press can be told apart by: a tail no other button's name carries */
      .filter(
        (r) => screen.queryAllByRole('button', { name: new RegExp(escape(r.tail)) }).length === 1,
      )
    expect(spare.length).toBeGreaterThanOrEqual(2)
    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare[0].tail)) }))
    const step = await screen.findByTestId('last-step')
    /* nothing grew between the field and the chapters: the press moved nothing there */
    expect(find.innerHTML).toBe(drawn)
    expect(find.contains(step)).toBe(false)
    expect(step.querySelector('.ui-kind')).toHaveAttribute('data-kind', 'motor')

    /* ONE STEP, ONE TOAST: the next press changes the card where it stands, so the way back
       offered is always from the step that is the last */
    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare[1].tail)) }))
    await waitFor(() => expect(screen.getByTestId('last-step')).toHaveTextContent(spare[1].tail))
    expect(screen.getAllByTestId('last-step')).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Undo' })).toHaveLength(1)
  })
})

/** The press on one finish row, by the accessible name the Tile
 *  carries — the material, the colourway and what the press would
 *  move the total by. */
const pressFinish = async (finish: {
  materialSaid: string
  colour: { say: string }
  delta: number
}): Promise<void> => {
  /* heard as a person says it: the colour's name, then the material in
     words ("Hypalon", never HYP), then what it does to the total */
  await userEvent.click(
    screen.getByRole('button', {
      name:
        finish.colour.say +
        (finish.materialSaid === '' ? '' : ', ' + finish.materialSaid) +
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
        `${here.carriedBy.toLocaleString('en-AU')} of ${quote.lines.length.toLocaleString('en-AU')} ${quote.lines.length === 1 ? 'line' : 'lines'}`,
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
    /* the moment the sale exists is stamped, with who it was given to and nothing that counts */
    const seal = screen.getByTestId('given-seal')
    expect(seal).toHaveTextContent('Given to R. Kelleher')
    expect(seal).toHaveTextContent(quote.reference)
    expect(seal.querySelector('data')).toBeNull()

    rerender(<Configurator quoteId={quote.id} at="motor" />)
    expect(
      screen.getAllByText(/given to the customer, so nothing can go back on it/).length,
    ).toBeGreaterThan(0)
    /* THE LEVEL IT WAS GIVEN AT IS A FACT, never a refused offer to see
       another (m2-last-critique.md, minor 14) */
    expect(screen.queryByRole('button', { name: /^See what .* does$/ })).toBeNull()
    expect(screen.getByText('Priced at')).toBeInTheDocument()
  })

  it('puts a typed name on the quote when its chapter closes, and says so with a way back', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    const { rerender } = render(withTheToaster(<Configurator quoteId={quote.id} at="handover" />))
    await userEvent.type(screen.getByLabelText(/Who the quote is addressed to/), 'Jordan Pike')
    /* the field says what closing it will do, before anything is written */
    expect(
      screen.getByText(
        'What is typed goes on the quote when you press this, or when this chapter closes.',
      ),
    ).toBeInTheDocument()
    await userEvent.tab()
    expect(quotes.getState().get(quote.id)!.customer.name).toBe('')

    /* the chapter closes on the name, and the finale opens on a quote that has it */
    rerender(withTheToaster(<Configurator quoteId={quote.id} at="finale" />))
    expect(quotes.getState().get(quote.id)!.customer.name).toBe('Jordan Pike')
    expect(screen.getByRole('button', { name: 'Give it to the customer' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.queryByText(/addressed to nobody/)).toBeNull()
    /* said in the toast, with its way back, like the press it stands for */
    const step = await screen.findByTestId('last-step')
    expect(step).toHaveTextContent('For Jordan Pike')
    await waitFor(() => expect(screen.queryByLabelText(/Who the quote is addressed to/)).toBeNull())
    /* one write, not one for the fold and another for the unmount */
    expect(
      quotes
        .getState()
        .get(quote.id)!
        .events.filter((e) => e.kind === 'customer-set'),
    ).toHaveLength(1)

    await userEvent.click(within(step).getByRole('button'))
    await waitFor(() => expect(quotes.getState().get(quote.id)!.customer.name).toBe(''))
  })

  it('puts it on at Enter, and when the build is left with a name still in the field', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    const first = render(<Configurator quoteId={quote.id} at="handover" />)
    await userEvent.type(
      screen.getByLabelText(/Who the quote is addressed to/),
      'Jordan Pike{Enter}',
    )
    expect(quotes.getState().get(quote.id)!.customer.name).toBe('Jordan Pike')
    /* Enter on a field that already matches the quote writes nothing */
    await userEvent.type(screen.getByLabelText(/Who the quote is addressed to/), '{Enter}')
    expect(
      quotes
        .getState()
        .get(quote.id)!
        .events.filter((e) => e.kind === 'customer-set'),
    ).toHaveLength(1)

    await userEvent.type(screen.getByLabelText(/One line of contact/), '0400 000 000')
    first.unmount()
    expect(quotes.getState().get(quote.id)!.customer.contact).toEqual(['0400 000 000'])
  })
})

/* ============================================================
   THE FINALE IS THE HANDOVER (2026-09-29, the components critique's
   major 3: "the finale is three numbers and a paragraph", its seal "a
   72 px rosette … It reads as a sticker"). The card says the boat, who
   it is for, the total at the level it is given at and one act; the
   give answers where it was pressed, never moves the total, hands the
   keyboard to the way to the paper, and plays once.
   ============================================================ */
describe('the finale is the handover', () => {
  it('says who it is for, the boat, the total at its level and one act — and the total once', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    render(<Configurator quoteId={quote.id} at="finale" />)
    const standing = quotes.getState().get(quote.id)!
    const rail = railFor(standing)
    const finale = screen.getByRole('region', { name: 'The finale' })
    const card = finale.querySelector('.cfg-hand')!
    expect(card).toHaveTextContent('For R. Kelleher')
    expect(card).toHaveTextContent(spokenBoat(quote.rootTableId, quote.subjectLabel).say)
    const level = rail.rungs.find((r) => r.key === standing.levelKey)!.label
    expect(card).toHaveTextContent(`Total at ${level}`)
    /* the head does not say the figure a line above the card that does */
    expect(within(finale).getAllByText(money(rail.total))).toHaveLength(1)
    expect(within(finale).getAllByRole('button')).toHaveLength(2)
    expect(
      within(finale).getByRole('button', { name: 'Give it to the customer' }),
    ).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('says the arithmetic under the finale’s total, and nothing but the figure in the head', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    render(<Configurator quoteId={quote.id} at="finale" />)
    const rail = railFor(quote)
    expect(screen.getByTestId('running-total')).not.toHaveTextContent(
      /picked at|not priced|lines?\b/,
    )
    /* AND NOTHING ABOUT WHAT IS NOT PRICED UNDER THE FIGURE A CUSTOMER READS (build-close-
       critique.md, 2026-10-19, minor 11): the notes name the lines, for the dealer */
    expect(document.querySelector('.cfg-hand__count')?.textContent).toBe(
      `${quote.lines.length} lines`,
    )
    expect(rail.unpriced, 'the 519 carries an unpriced rigging kit').toBeGreaterThan(0)
    expect(document.querySelector('.cfg-hand__notes')).toHaveTextContent(
      unpricedNamesSay(rail.unpricedNames),
    )
  })

  it('gives it where it was pressed: the total unmoved, the keyboard on the paper, and once', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    const openDocument = vi.fn<(id: string) => void>()
    const { rerender } = render(
      <Configurator quoteId={quote.id} at="finale" openDocument={openDocument} />,
    )
    const total = railFor(quotes.getState().get(quote.id)!).total
    await userEvent.click(screen.getByRole('button', { name: 'Give it to the customer' }))
    expect(quotes.getState().get(quote.id)!.state).toBe('issued')

    const given = screen.getByTestId('given-seal')
    expect(given).toHaveTextContent('Given to R. Kelleher')
    /* told to a reader as it lands: an `output` is a status */
    expect(given.tagName).toBe('OUTPUT')
    expect(given.querySelector('data')).toBeNull()
    /* the same figure in the same place on the card, a price and never a count */
    const sum = document.querySelector('.cfg-hand__sum')!
    expect(within(sum as HTMLElement).getByText(money(total)).tagName).toBe('DATA')
    /* the moment plays for the give that happened here, and the way on takes the keyboard */
    expect(document.querySelector('.cfg-hand')).toHaveAttribute('data-arrives')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open the document' })).toHaveFocus(),
    )

    /* shut and opened again, it is simply there, final */
    rerender(<Configurator quoteId={quote.id} at="motor" openDocument={openDocument} />)
    rerender(<Configurator quoteId={quote.id} at="finale" openDocument={openDocument} />)
    expect(screen.getByTestId('given-seal')).toHaveTextContent('Given to R. Kelleher')
    expect(document.querySelector('.cfg-hand')).not.toHaveAttribute('data-arrives')
  })

  it('does not play for a quote that was given before the build was opened', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    const first = render(<Configurator quoteId={quote.id} at="handover" />)
    await issueOne(quote, first.rerender)
    first.unmount()
    render(<Configurator quoteId={quote.id} />)
    expect(screen.getByTestId('given-seal')).toHaveTextContent('Given to R. Kelleher')
    expect(document.querySelector('.cfg-hand')).not.toHaveAttribute('data-arrives')
    expect(screen.getByRole('button', { name: 'Open the document' })).not.toHaveFocus()
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
       own reason once, above the list. The rail's refused "See what Trade
       does" is gone since 2026-09-24 — a given quote states its level and
       offers no other (m2-last-critique.md, minor 14) — so what is counted
       is the open chapter's own rows, four of them on the SP560. */
    expect(refused.length).toBeGreaterThan(3)
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
  it('opens the document from the finale, and the masthead does not grow a second way to it', async () => {
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
    /* ONE, AND IT IS THE FINALE'S (the component critique, 2026-09-28, major 8):
       the masthead's own copy grew the head by a row under the press */
    const acts = screen.getAllByRole('button', { name: 'Open the document' })
    expect(acts.length).toBe(1)
    expect(document.querySelector('.cfg-mast')).not.toContainElement(acts[0])
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

/* built-critique-m2-close-2.md, MAJOR 2: "After `Give it to the
   customer` the build pins '20260924-01 is issued · Undo' … Pressing it
   raises a banner that says 'nothing can go back on it'." An act that
   cannot work is never offered; the way that does work from a given
   quote is a new version, and that one is proved to work here too. */
describe('giving it to the customer offers no way back, and a new version does', () => {
  it('leaves the given step’s sentence with nothing beside it, and raises no refusal', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    const { rerender } = render(withTheToaster(<Configurator quoteId={quote.id} at="handover" />))
    /* the name's own step is said, with its way back, until the quote is given */
    await issueOne(quote, (ui) => rerender(withTheToaster(ui)))

    /* THE GIVE TAKES THE TOAST AWAY: it has no way back, and the seal is where it is said */
    expect(screen.getByTestId('given-seal')).toHaveTextContent('Given to R. Kelleher')
    await waitFor(() => expect(screen.queryByTestId('last-step')).not.toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /^(Undo|Put it back)$/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    /* the way on is where it was: the finale's own two acts */
    expect(screen.getByRole('button', { name: 'Make a new version' })).toBeInTheDocument()
  })

  it('opens the new version clean, and a pick on it offers an Undo that works', async () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    const openQuote = vi.fn<(id: string) => void>()
    const { rerender } = render(
      withTheToaster(<Configurator quoteId={quote.id} at="handover" openQuote={openQuote} />),
    )
    await issueOne(quote, (ui) => rerender(withTheToaster(ui)), { openQuote })

    await userEvent.click(screen.getByRole('button', { name: 'Make a new version' }))
    expect(openQuote).toHaveBeenCalledTimes(1)
    const next = openQuote.mock.calls[0][0]
    expect(next).not.toBe(quote.id)
    expect(quotes.getState().get(next)!.state).toBe('draft')

    /* THE ROUTE KEEPS THIS SCREEN AND HANDS IT THE NEW ID, which is what
       a rerender with the new id is. Measured on the dev server before
       the fix: the new draft opened under "…-01 is issued · Undo" and the
       old refusal, and its Undo said "There is nothing to go back to". */
    rerender(withTheToaster(<Configurator quoteId={next} at="motor" openQuote={openQuote} />))
    await waitFor(() => expect(screen.queryByTestId('last-step')).not.toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    const draft = quotes.getState().get(next)!
    const before = quoteTotals(draft).total
    const spare = railFor(draft)
      .chapters.find((c) => c.id === 'motor')!
      .tables[0].rows.find((r) => !r.fitted && r.amount !== null)!
    await userEvent.click(screen.getByRole('button', { name: new RegExp(escape(spare.tail)) }))
    expect(quoteTotals(quotes.getState().get(next)!).total).toBe(spare.would)

    await userEvent.click(
      within(await screen.findByTestId('last-step')).getByRole('button', { name: 'Undo' }),
    )
    expect(quoteTotals(quotes.getState().get(next)!).total).toBe(before)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('the recommendation is named in words and no star is drawn', () => {
  it('prints the starred row’s name above the list and no glyph on it', () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="motor" />)
    const table = railFor(quote).chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(table.recommends).not.toBe('')
    /* the name set in the sentence above the list — the row below it now
       reads the same words, "Yamaha F90LB" (m2-last-critique.md, major 4) */
    expect(screen.getByText(table.recommends, { selector: 'b' })).toBeInTheDocument()
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

/* A CHANGE OF MIND (build-close-critique.md, 2026-10-19, majors 1 and 2). With the F90LB on the
   519, pressing the F115LB put a second outboard on a hull rated 60–115 hp, and the F90LB's kit
   stayed on the quote with nothing said. The press is one step now, with one way back — and the
   build answers Ctrl Z as the sheet does. */
describe('a change of mind puts the motor on instead, as one step', () => {
  it('swaps the motor and its kit at the engine’s total, and Ctrl Z takes the whole step back', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    const before = quotes.getState().get(quote.id)!
    render(
      <>
        <Toaster />
        <Configurator quoteId={quote.id} at="motor" />
      </>,
    )
    const table = railFor(quote).chapters.find((c) => c.id === 'motor')!.tables[0]
    const fitted = table.rows.find((r) => r.fitted)!
    const other = table.rows.find((r) => r.tail === 'Yamaha F115LB')!
    expect(other.act.do).toBe('swap')
    expect(other.instead).toBe(fitted.tail.replace(/^Yamaha /, ''))
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(`^${escape(other.tail)},`) }),
    )

    const after = quotes.getState().get(quote.id)!
    expect(quoteTotals(after).total).toBe(other.would)
    const motorBlock = table.id
    const motors = after.sections.find((s) => s.blockId === motorBlock)!.lineIds
    expect(motors.map((id) => after.lines.find((l) => l.id === id)!.label)).toEqual([
      'Yamaha - F115LB',
    ])
    /* one event for the whole step, and no second motor said anywhere */
    expect(after.events.length).toBe(before.events.length + 1)
    expect(screen.queryByTestId('several-on-one-table')).not.toBeInTheDocument()
    /* the F90LB's kit went with it, and nothing is left for a motor that is not on the boat */
    expect(railFor(after).orphans).toEqual([])
    expect(await screen.findByTestId('last-step')).toHaveTextContent(/instead of the F90LB/)

    await userEvent.keyboard('{Control>}z{/Control}')
    const back = quotes.getState().get(quote.id)!
    expect(back.lines.map((l) => l.id)).toEqual(before.lines.map((l) => l.id))
    expect(quoteTotals(back).total).toBe(quoteTotals(before).total)
    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(other.would)
  })

  it('says a kit for a motor the boat does not carry, at the kit and in the finale, and puts it right in one press', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    const table = railFor(quote).chapters.find((c) => c.id === 'motor')!.tables[0]
    const fitted = table.rows.find((r) => r.fitted)!
    const other = table.rows.find((r) => r.tail === 'Yamaha F115LB')!
    /* the swap made by hand, in two presses: the F90LB off, the F115LB on */
    if (fitted.act.do !== 'remove' || other.act.do !== 'swap') throw new Error('not a swap')
    const going = other.act.swap.on[0]!
    quotes.getState().apply(quote.id, removeLine(fitted.act.lineId))
    quotes.getState().apply(quote.id, addLine(going.blockId, going.line))
    const odd = railFor(quotes.getState().get(quote.id)!).orphans
    expect(odd).toHaveLength(1)
    expect(odd[0]!.said).toBe(
      'The Yamaha/Stacer · Binnacle Mount Rigging Kit is for the Yamaha F90LB, and no Yamaha F90LB is on this boat now.',
    )

    const { unmount } = render(<Configurator quoteId={quote.id} at="finale" />)
    expect(screen.getByTestId('orphaned-kit')).toHaveTextContent(odd[0]!.said)
    unmount()
    render(<Configurator quoteId={quote.id} at="fit" />)
    const flag = screen.getByTestId('orphaned-kit')
    expect(flag).toHaveTextContent(odd[0]!.said)
    await userEvent.click(within(flag).getByRole('button', { name: odd[0]!.actSay }))
    const fixed = quotes.getState().get(quote.id)!
    expect(railFor(fixed).orphans).toEqual([])
    expect(fixed.lines.some((l) => /Mech Rigging Kit/.test(l.label))).toBe(true)
    expect(fixed.lines.some((l) => /Binnacle Mount Rigging Kit/.test(l.label))).toBe(false)
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
    /* THE LEDGER'S SIZE RIDES ON THE LINE AS DATA, and the line a
       customer reads says only where the photograph came from — it
       printed "Stage copy 2,560 × 1,708 … never enlarged" (M2-close
       critique #4, #21). */
    const prov = screen.getByText(/^Photograph from /)
    expect(prov).toHaveAttribute('data-held', `${hero!.width}x${hero!.height}`)
    expect(screen.queryByText(/Stage copy|never enlarged/)).not.toBeInTheDocument()
    /* AND IT IS WHERE THE PICKER'S PHOTOGRAPH LANDS (the component kit,
       2026-09-28): the stage names its picture by the row this quote is
       written against, the name the picker's plate carries it under */
    expect(drawn.style.getPropertyValue('--cfg-travel')).toBe(
      boatTravel(quote.rootTableId, quote.rootRowId),
    )
  })

  /* THE CUSTOMER READS THE PICTURE (built-critique-m2.md #24). The
     SP560's hero is the maker's own photograph, with the maker's own
     outboard on it; the caption under it says so and names the motor
     THIS document carries, read off its own lines. */
  it('captions the photograph with whose rig it is, and this quote’s own motor', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const hero = hullHero(sheetCtx(), quote)!
    render(<Configurator quoteId={quote.id} at="hull" />)
    const caption = screen.getByTestId('stage-caption')
    expect(caption).toHaveTextContent(hero.subject)
    expect(caption).toHaveTextContent('the maker’s own finish and rig')
    const motors = quote.lines.filter((l) => pack.ctx.entities[l.entityId]?.kind === 'motor')
    expect(motors.length).toBeGreaterThan(0)
    /* named as the paper names it, never by the file's key string */
    for (const motor of motors) expect(caption).toHaveTextContent(saidOnQuote(quote, motor))
  })

  /* THE M2-CLOSE CRITIQUE, FINDING 11: "Home's second hero reads STACER ·
     519 Sea Ranger SDF … Quote either of those two rows (Centre or Side
     Console) and both the picker and the build say 'The row names a
     picture and no copy of it is held here'." The stage asked for a name
     EQUAL to the ledger's model; Stacer files it inside a longer one. */
  it.each(['Centre Console', 'Side Console'])(
    'draws the photograph Home sells on the Stacer 519 Sea Ranger SDF (%s), and says which console this quote is',
    (console) => {
      const quote = fileAQuote('boat_stacer', `519 Sea Ranger SDF (${console})`)
      const hero = hullHero(sheetCtx(), quote)
      expect(hero, 'the build draws no photograph for a boat Home sells with one').not.toBeNull()
      /* THE SAME PICTURE HOME DRAWS: Home picks its second photograph by
         the ledger's id, and this is that file */
      expect(hero!.src).toContain('stacer-519-sea-ranger')
      expect(hero!.beyond).toBe(console)

      render(<Configurator quoteId={quote.id} at="hull" />)
      expect(screen.getByRole('img', { name: hero!.subject })).toHaveAttribute('src', hero!.src)
      expect(screen.getByText(/^Photograph from /)).toBeInTheDocument()
      expect(screen.queryByText(/no photograph of this boat is held/i)).not.toBeInTheDocument()
      const caption = screen.getByTestId('stage-caption')
      expect(caption).toHaveTextContent(`This quote: ${console}`)
    },
  )

  it('never draws the 519’s photograph for the 539, though the file points it at the 519’s picture', () => {
    const quote = fileAQuote('boat_stacer', '539 Sea Ranger SDF (Centre Console)')
    expect(hullHero(sheetCtx(), quote)).toBeNull()
  })

  it('draws the catalogue copy for a hull the hero ledger does not carry', () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    expect(hullHero(sheetCtx(), quote)).toBeNull()
    render(<Configurator quoteId={quote.id} at="hull" />)
    expect(screen.queryByText(/^Photograph from /)).not.toBeInTheDocument()
    expect(screen.getByText(/^Picture from /)).toHaveAttribute('data-held')
  })
})

/* ============================================================
   THE M2-CLOSE CRITIQUE, #4: THE ENGINE'S WORDS ON THE SALE SCREEN.
   "A quote is written against ONE row … re-roots the document", "no
   price column on this table" six times on one SP560, "699 of this
   table's 2,937 rows", "on the shelf", "rung", "frozen lines". Every
   chapter of a Highfield SP560 and of a Stacer, as a draft and as a
   given quote, is read whole and held against the one list of words
   a dealer never reads (`say.ts`). The quotes are the critic's own.
   ============================================================ */
describe('the build speaks the dealer’s words, not the engine’s', () => {
  const chaptersOf = (quote: QuoteDef): string[] => railFor(quote).chapters.map((c) => c.id)

  const wordsOnEveryChapter = (quote: QuoteDef): Record<string, string[]> => {
    const found: Record<string, string[]> = {}
    for (const at of chaptersOf(quote)) {
      const { container, unmount } = render(
        <Configurator
          quoteId={quote.id}
          at={at}
          business="Northside Marine"
          openDocument={() => {}}
          openQuote={() => {}}
        />,
      )
      const hits = engineWordsIn(container.textContent ?? '')
      if (hits.length > 0) found[at] = hits
      unmount()
    }
    return found
  }

  it('on every chapter of a draft Highfield SP560, SP660 and a draft Stacer', () => {
    expect(wordsOnEveryChapter(fileAQuote('boat_highfield', 'SP560'))).toEqual({})
    /* the SP660's finale said "2 lines are priced at a column that already
       has registration in it" — the engine's several-line sentence */
    expect(wordsOnEveryChapter(fileAQuote('boat_highfield', 'SP660'))).toEqual({})
    expect(wordsOnEveryChapter(fileAQuote('boat_stacer', '519 Sea Ranger SDF'))).toEqual({})
  })

  it('on every chapter of a given quote', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const { rerender, unmount } = render(<Configurator quoteId={quote.id} at="handover" />)
    await issueOne(quote, rerender)
    unmount()
    expect(wordsOnEveryChapter(quote)).toEqual({})
  })

  it('draws the hull once, as the lit finish, and not again under an empty list', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={quote.id} at="hull" />)
    const hull = railFor(quote).chapters.find((c) => c.id === 'hull')!
    expect(hull.finishes!.rows.some((f) => f.current)).toBe(true)
    expect(hull.tables.filter((t) => t.rows.length === 0 && t.also.length > 0)).toEqual([])
    expect(screen.queryByText(/0 of 0/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Also on this quote from/)).not.toBeInTheDocument()
  })
})

/* ============================================================
   A BOAT THE PRICE FILE HOLDS AT NOUGHT (m2-last-critique.md,
   blocker 1). The picker promises "you put the price on it"; the build
   read $0 and offered nowhere to put one, and the paper called the
   boat Included. The figure below is the one a person types; every
   total is the engine's.
   ============================================================ */
describe('a Haines Signature hull, which the file holds at nought', () => {
  const TYPED = '54,900'

  it('opens on 01 The hull, says the boat is not priced, and offers the price', () => {
    const quote = fileAQuote('boat_haines', '525F')
    render(<Configurator quoteId={quote.id} />)
    const hull = screen.getByRole('region', { name: /01 The hull/ })
    expect(within(hull).getByRole('button', { name: /The hull/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(within(hull).getByText(NOT_PRICED_ON_PAPER)).toBeInTheDocument()
    expect(within(hull).queryByText(/\$0\b/)).not.toBeInTheDocument()
    /* the masthead's figure is everything but the boat, and says so */
    expect(screen.getByTestId('running-total')).toHaveTextContent(
      'The boat has no price yet, so this is everything but the boat',
    )
    const block = within(hull).getByTestId('hull-price')
    expect(block).toHaveTextContent(/holds no price for the Haines Signature/)
    expect(
      within(block).getByRole('button', { name: 'Put this price on the boat' }),
    ).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('will not be given to the customer while the boat has no price', () => {
    const quote = fileAQuote('boat_haines', '525F')
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    render(<Configurator quoteId={quote.id} at="finale" />)
    expect(railFor(quote).blockers).toEqual([HULL_UNPRICED_WHY])
    expect(screen.getByText(HULL_UNPRICED_WHY)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Give it to the customer' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('refuses a blank with a sentence where it was typed, and writes nothing', async () => {
    const quote = fileAQuote('boat_haines', '525F')
    render(<Configurator quoteId={quote.id} at="hull" />)
    await userEvent.click(screen.getByRole('button', { name: 'Put this price on the boat' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Type the boat’s price first/)
    expect(quotes.getState().get(quote.id)!.lines[0].overridePrice).toBeUndefined()
  })

  it('puts a typed price on the boat with its reason, moves the total, and the Undo takes it off', async () => {
    const quote = fileAQuote('boat_haines', '525F')
    const before = quoteTotals(quote).total
    render(withTheToaster(<Configurator quoteId={quote.id} at="hull" />))
    await userEvent.type(screen.getByLabelText(/The boat’s price, tax included/), TYPED)
    await userEvent.click(screen.getByRole('button', { name: 'Put this price on the boat' }))

    const after = quotes.getState().get(quote.id)!
    const hull = after.lines[0]
    expect(hull.overridePrice).toBe(54_900)
    expect(hull.overrideReason).toBe(HULL_PRICE_REASON)
    expect(hull.unitPrice).toBeNull()
    expect(quoteTotals(after).total).toBe(before + 54_900)
    expect(
      within(screen.getByTestId('running-total')).getByText(money(quoteTotals(after).total)),
    ).toBeInTheDocument()
    const step = await screen.findByTestId('last-step')
    expect(step).toHaveTextContent(`Haines Signature Fisher 525F priced at ${money(54_900)}`)
    expect(step.querySelector('.ui-kind')).toHaveAttribute('data-kind', 'boat')
    expect(screen.getByTestId('hull-price')).toHaveTextContent(`Priced by hand at ${money(54_900)}`)
    expect(railFor(after).blockers.filter((b) => b === HULL_UNPRICED_WHY)).toEqual([])

    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(quotes.getState().get(quote.id)!.lines[0].overridePrice).toBeUndefined()
    expect(screen.getByLabelText(/The boat’s price, tax included/)).toHaveValue('')
  })

  it('draws no price field on a boat the file prices', () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="hull" />)
    expect(screen.queryByTestId('hull-price')).not.toBeInTheDocument()
  })
})

/* ============================================================
   PAST THE MOTOR, EVERY CHAPTER READS THE WAY /kit READS (the
   components critique, 2026-09-29, blocker 2), walked on the quote the
   critic walked — the Stacer 519 Sea Ranger SDF — and the Sport 560
   for its finishes. Every name, code and count is read off the rail.
   ============================================================ */
describe('past the motor, the thing a person recognises leads', () => {
  const chapterOf = (quote: QuoteDef, id: string) =>
    railFor(quote).chapters.find((c) => c.id === id)!

  it('states each shut chapter’s answer as a person says it, with its picture and no code', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    render(<Configurator quoteId={quote.id} at="hull" />)
    const trailer = chapterOf(quote, 'trailer')
    const row = trailer.tables[0]!.rows.find((r) => r.fitted)!
    const head = screen.getByRole('button', { name: /^03 Trailer/ })
    expect(head).not.toHaveTextContent('chosen:')
    expect(within(head).getByText(trailer.said!)).toHaveClass('cfg-head__said')
    expect(row.code).not.toBe('')
    expect(head).not.toHaveTextContent(row.code)
    expect(head.querySelector('img')?.getAttribute('src')).toBe(trailer.picture!.src)
  })

  it('narrows the motors by power with the kit’s chips, and never narrows the one on the quote away', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    render(<Configurator quoteId={quote.id} at="motor" />)
    const rows = chapterOf(quote, 'motor').tables[0]!.rows
    const fitted = rows.find((r) => r.fitted)!
    const other = rows.find((r) => r.power !== fitted.power)!.power
    const tile = (row: (typeof rows)[number]) =>
      screen.queryByRole('button', { name: new RegExp(`^${escape(row.tail)},`) })
    const chip = within(screen.getByRole('group', { name: /by power/ })).getByRole('button', {
      name: new RegExp(`^${other} hp ${rows.filter((r) => r.power === other).length}$`),
    })
    await userEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    for (const row of rows) {
      if (row.power === other || row.fitted) expect(tile(row)).toBeInTheDocument()
      else expect(tile(row)).not.toBeInTheDocument()
    }
    await userEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    for (const row of rows) expect(tile(row)).toBeInTheDocument()
  })

  it('draws a part with its name first and its code quiet under it, its kind once on the chapter', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    render(<Configurator quoteId={quote.id} at="fit" />)
    expect(
      screen.getByRole('region', { name: /Dealer fit/ }).querySelector('.cfg-head__disc .ui-kind'),
    ).not.toBeNull()
    const parts = chapterOf(quote, 'fit').tables.find((t) => t.title === 'Parts & Accessories')!
    const coded = parts.rows.filter((r) => r.code !== '')
    expect(coded.length).toBeGreaterThan(0)
    for (const row of parts.rows) {
      const line = screen.getByRole('button', { name: new RegExp(`^${escape(row.tail)},`) })
      /* THE KIND ONCE, ON THE CHAPTER'S DISC, never down every line (build-close-critique.md,
         2026-10-19, minor 11: "five identical marks down a column") */
      expect(line.querySelector('.ui-kind')).toBeNull()
      const name = line.querySelector('.cfg-row__name')!
      expect(name).toHaveTextContent(row.tail)
      if (row.code === '') continue
      expect(name).not.toHaveTextContent(row.code)
      expect(within(line).getByText(row.code).closest('.cfg-row__code')).not.toBeNull()
    }
  })

  it('opens the workshop’s words while a search runs, with what matched in bold', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    render(<Configurator quoteId={quote.id} />)
    expect(screen.queryAllByRole('button', { name: 'For the workshop' }).length).toBe(0)
    await userEvent.type(screen.getByRole('searchbox'), 'Binnacle')
    const hits = [...document.querySelectorAll('.cfg-shop__val .cfg-hit')]
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.every((b) => /binnacle/i.test(b.textContent ?? ''))).toBe(true)
    /* the search is holding them open, so there is nothing to press */
    expect(screen.queryAllByRole('button', { name: 'For the workshop' })).toEqual([])
  })

  it('says the finish on the quote the way every chosen option says it', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={quote.id} at="hull" />)
    const current = chapterOf(quote, 'hull').finishes!.rows.find((f) => f.current)!
    const line = screen.getByRole('button', {
      name: `${current.colour.say}, ${current.materialSaid}, no change to the total`,
    })
    expect(line).toHaveAttribute('aria-pressed', 'true')
    expect(within(line).getByText('on the quote')).toBeInTheDocument()
    expect(within(line).getByText(money(current.amount!))).toBeInTheDocument()
    expect(within(line).queryByText('fitted')).not.toBeInTheDocument()
  })
})
