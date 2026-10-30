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
  issue,
  mintQuote,
  quoteTotals,
  removeLine,
  setCustomer,
  setOverride,
  signedMoney,
} from '@/domain/quote'
import { HULL_PRICE_REASON, HULL_UNPRICED_WHY } from '@/domain/quote/nought'
import { NOT_PRICED_ON_PAPER } from '@/screens/document/paper'
import { makeCtx } from '@/domain/model'
import { Toaster } from '@/ui'
import { Configurator, LINE_PRICE_REASON, LINE_UNCHOSEN_REASON, PUT_A_PRICE } from './Configurator'
import { namePrice } from '@/domain/catalogue/priceCommands'
import { readRail } from './chapters'
import { hullHero } from './stage'
import { boatTravel } from './glyphs'
import { engineWordsIn, giveWaitsLead, totalNoteSay } from './say'
import { saidOnQuote, spokenBoat } from '@/domain/quote/spoken'
import { pairColumns, pairRule } from '@/domain/rules/constraints/pairRules'
import { addRule } from '@/domain/catalogue/ruleCommands'
import { startQuote } from '@/screens/picker/mint'
import { PACK_ORG_ID } from '@/data/pack/boot'

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

  it('names the document and the state beside it, and leaves the business to the crest', () => {
    render(<Configurator quoteId={quote.id} business="Northside Marine" />)
    /* the boat as a person says it, and never the file's key string
       (built-critique-m2-close-2.md, the one thing to change first) */
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      spokenBoat(quote.rootTableId, quote.subjectLabel).name,
    )
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toContain(' - ')
    /* the crest is Northside's own mark, so the masthead does not say the name again
       (docs/WORDS.md, one fact once; 2026-10-21) */
    expect(screen.queryByText(/Northside Marine/)).toBeNull()
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
    /* said on the tile it is about, in one word, and heard in its name (docs/WORDS.md) */
    const starred = screen.getByRole('button', { name: /, recommended,/ })
    expect(starred).toHaveTextContent('Recommended')
    expect(screen.getAllByText('Recommended')).toHaveLength(1)
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
    /* said once per list (the refine round, 2026-10-21): no line under it carries a figure, so the
       list says why — as a tag beside its name, or, once something from it is on the quote, in
       the line under the total, which names the list, and then no tag repeats it */
    const told = railFor(sp560).unpricedLists
    const note = screen.getByTestId('running-total').textContent ?? ''
    /* A LIST WHOSE PRICE NORTHSIDE HAS NOT CHOSEN is not a list with no price (built-critique-m3.md,
       blocker 1): its tag is the door to it on Prices, and only a list with no figure at all is
       tagged "No price on the price list" */
    const untold = unpriced.filter((t) => !told.includes(t.title))
    const tags = [...document.querySelectorAll('.cfg-table__tag')]
    expect(tags).toHaveLength(untold.filter((t) => t.unchosen === '').length)
    for (const tag of tags) expect(tag).toHaveTextContent(/^No price on the price list$/)
    const doors = screen.queryAllByRole('link', { name: 'Choose its price' })
    expect(doors).toHaveLength(untold.filter((t) => t.unchosen !== '').length)
    expect(
      untold.some((t) => t.unchosen !== ''),
      'Dealer Fit holds figures to choose',
    ).toBe(true)
    for (const door of doors) {
      expect(door.getAttribute('href')).toMatch(/^\/levels\?list=[^&]+&quote=/)
    }
    for (const table of unpriced) {
      if (told.includes(table.title)) {
        expect(note).toContain(table.title)
        continue
      }
      const name = screen.queryByRole('heading', { name: table.title, level: 3 })
      if (name)
        expect(
          name.parentElement!.querySelector(table.unchosen !== '' ? 'a' : '.cfg-table__tag'),
        ).not.toBeNull()
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
      for (const fact of row.facts) expect(option).not.toHaveTextContent(fact.full)
    }
    /* ONE "FOR THE WORKSHOP" FOR THE CHAPTER, never one under every tile (the refine round,
       2026-10-21), and it opens every motor's words at once */
    const chapter = document.querySelector('.cfg-chapter[data-open]') as HTMLElement
    const shops = within(chapter).getAllByRole('button', { name: 'For the workshop' })
    expect(shops).toHaveLength(1)
    const shop = shops[0]!
    expect(shop).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(shop)
    expect(shop).toHaveAttribute('aria-expanded', 'true')
    for (const row of pictured) {
      const option = screen
        .getByRole('button', { name: new RegExp(`^${escape(row.tail)}\\b`) })
        .closest('.cfg-opt') as HTMLElement
      for (const fact of row.facts) {
        expect(option).toHaveTextContent(fact.label)
        expect(option).toHaveTextContent(fact.full)
      }
    }
  })

  /* WHAT EVERY PRESS ON THE MOTORS DOES IS SAID ONCE, over the list (the refine round,
     2026-10-21: "instead of the F90LB" three times), and a reader still hears it on each tile */
  it('says once over the motors which one each replaces, and each tile keeps only its difference', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    render(<Configurator quoteId={quote.id} at="motor" />)
    const rows = railFor(quote).chapters.find((c) => c.id === 'motor')!.tables[0]!.rows
    const swaps = rows.filter((r) => !r.fitted && r.instead !== '')
    expect(swaps.length).toBeGreaterThan(1)
    const off = swaps[0]!.instead
    expect(screen.getAllByText(new RegExp(`in place of the ${escape(off)}`))).toHaveLength(1)
    expect(screen.queryAllByText(`instead of the ${off}`)).toEqual([])
    for (const row of swaps) {
      const tile = screen.getByRole('button', { name: new RegExp(`^${escape(row.tail)},`) })
      expect(tile).toHaveAccessibleName(new RegExp(`goes on instead of the ${escape(off)}$`))
      /* one figure: the difference, never its own price beside it */
      expect(tile).not.toHaveTextContent(money(row.amount!))
    }
  })

  /* A LIST OF PARTS IS A LINE EACH, LED BY ITS KIND (build-close-critique-2.md major 2: "radio
     circles, each with a part code under it … no glyph and no picture"): no circle, the kind's
     glyph, the name, one figure */
  it('keeps a list the file gives no pictures as a ruled list, each line led by its kind', () => {
    const sp560 = fileAQuote('boat_highfield', 'SP560')
    render(<Configurator quoteId={sp560.id} at="fit" />)
    const fit = railFor(sp560).chapters.find((c) => c.id === 'fit')!
    expect(fit.tables.every((t) => !t.pictured)).toBe(true)
    const open = document.querySelector('.cfg-chapter[data-open]')!
    const lines = open.querySelectorAll('.cfg-rows li')
    expect(lines.length).toBeGreaterThan(0)
    expect(open.querySelectorAll('.cfg-tiles')).toHaveLength(0)
    expect(open.querySelectorAll('.cfg-rows .cfg-tick')).toHaveLength(0)
    expect(open.querySelectorAll('.cfg-rows .cfg-row__mark .ui-kind')).toHaveLength(lines.length)
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
      screen.getByText(
        `${rail.hits.toLocaleString('en-AU')} found, ${rail.beyond.toLocaleString('en-AU')} of them not made for this boat.`,
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
    expect(screen.getByText('Nothing on this quote is called that.')).toBeInTheDocument()
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
    expect(screen.getByText(/Back to the .* made for this boat/)).toBeInTheDocument()
    expect(screen.getAllByText(/Nothing is wrong with it/).length).toBeGreaterThan(0)
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

  /* as the boat, not as how the maker's list is laid out (the refine critique, 18: "Stacer lists
     each of its boats once…", "Haines Signature does not list its boats by finish…") */
  it('says why on a register that files one row per model, in the dealer’s words', () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="hull" />)
    const finishes = railFor(quote).chapters.find((c) => c.id === 'hull')!.finishes!
    expect(finishes.rows.length).toBe(0)
    expect(finishes.why).toBe('No other finish of this boat is on the price list.')
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
    /* the count where the price does not price every item, and none where it does */
    const count = `${here.carriedBy.toLocaleString('en-AU')} of ${quote.lines.length.toLocaleString('en-AU')} ${quote.lines.length === 1 ? 'item' : 'items'} priced`
    if (here.carriedBy < quote.lines.length) expect(screen.getByText(count)).toBeInTheDocument()
    else expect(screen.queryByText(count)).toBeNull()
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
    await userEvent.type(screen.getByLabelText(/Who the quote is for/), 'R. Kelleher')
    await userEvent.click(screen.getByRole('button', { name: 'Put their name on it' }))
    expect(quotes.getState().get(quote.id)!.customer.name).toBe('R. Kelleher')

    rerender(<Configurator quoteId={quote.id} at="finale" />)
    await userEvent.click(screen.getByRole('button', { name: 'Give it to the customer' }))
    expect(quotes.getState().get(quote.id)!.state).toBe('issued')
    /* the moment the sale exists is stamped, with who it was given to and nothing that counts */
    const seal = screen.getByTestId('given-seal')
    expect(seal).toHaveTextContent('Given to R. Kelleher')
    /* the quote's number is said once, over the card; the open head leaves "given" to the seal,
       and once it is shut the head says the state in a word */
    expect(document.querySelector('.cfg-mast')).toHaveTextContent(quote.reference)
    expect(seal).not.toHaveTextContent(quote.reference)
    expect(screen.getByRole('button', { name: /The finale/ })).toHaveTextContent(/^The finale$/)
    expect(seal.querySelector('data')).toBeNull()

    rerender(<Configurator quoteId={quote.id} at="motor" />)
    expect(screen.getByRole('button', { name: /The finale/ })).toHaveTextContent(/given$/)
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
    await userEvent.type(screen.getByLabelText(/Who the quote is for/), 'Jordan Pike')
    /* the field says what closing it will do, before anything is written */
    expect(
      screen.getByText('It goes on the quote when you press this, or when you move on.'),
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
    expect(screen.queryByText(/No customer’s name is on this quote/)).toBeNull()
    /* said in the toast, with its way back, like the press it stands for */
    const step = await screen.findByTestId('last-step')
    expect(step).toHaveTextContent('For Jordan Pike')
    await waitFor(() => expect(screen.queryByLabelText(/Who the quote is for/)).toBeNull())
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
    await userEvent.type(screen.getByLabelText(/Who the quote is for/), 'Jordan Pike{Enter}')
    expect(quotes.getState().get(quote.id)!.customer.name).toBe('Jordan Pike')
    /* Enter on a field that already matches the quote writes nothing */
    await userEvent.type(screen.getByLabelText(/Who the quote is for/), '{Enter}')
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
/** The one line on a quote the price list gives no price, the boat aside. */
const unpricedKit = (q: QuoteDef) =>
  q.lines.find((l) => l.label !== q.subjectLabel && l.unitPrice === null)!

/** The finale's head and Who it is for's, as a reader reaches them. */
const finaleHead = () => screen.getByRole('button', { name: /The finale/ })
const whoHead = () => screen.getByRole('button', { name: /Who it is for/ })

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
    /* the boat by its name; its finish is the masthead's, said once there */
    const boat = spokenBoat(quote.rootTableId, quote.subjectLabel)
    expect(card.querySelector('.cfg-hand__boat')).toHaveTextContent(
      new RegExp(`^${escape(boat.name)}$`),
    )
    const level = rail.rungs.find((r) => r.key === standing.levelKey)!.label
    expect(card).toHaveTextContent(`Total at ${level}`)
    /* the head does not say the figure a line above the card that does */
    expect(within(finale).getAllByText(money(rail.total))).toHaveLength(1)
    /* the chapter's head, the one act, and a quiet press per line with no price (the 519's kit) */
    expect(rail.unpriced).toBeGreaterThan(0)
    expect(within(finale).getAllByRole('button')).toHaveLength(2 + rail.unpriced)
    expect(within(finale).getAllByRole('button', { name: PUT_A_PRICE })).toHaveLength(rail.unpriced)
    /* THE KIT'S PRICE IS NOT CHOSEN, SO THE QUOTE IS NOT GIVEN (built-critique-m3.md, blocker 1):
       the act says why, in its own words, and each such line has the door to its list on Prices */
    expect(rail.unpricedWhy).toEqual(['unchosen'])
    const doors = within(finale).getAllByRole('link', { name: 'Choose on Prices' })
    expect(doors).toHaveLength(1)
    expect(doors[0]).toHaveAttribute(
      'href',
      `/levels?list=${rail.unpricedTables[0]}&quote=${encodeURIComponent(quote.id)}`,
    )
    expect(rail.blockers).toEqual([
      expect.stringMatching(
        /^Northside has not chosen which figure prices Rigging Kits, so the rigging kit for the \S+ has no price and this quote cannot be given\. Choose it on Prices, or put a price on the line here\.$/,
      ),
    ])
    expect(within(finale).getByRole('button', { name: 'Give it to the customer' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  /* AND ONCE IT IS CHOSEN ON PRICES, THE LINE ALREADY ON THE QUOTE TAKES THAT PRICE IN ONE PRESS,
     the give opens, and the Undo takes the price off again */
  it('prices a line put on before its list had a price, in one press, and then gives', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    const kits = catalogue.getState().tables['rig_kits']!
    const sell = kits.fields.find((f) => f.name === 'Kit Sell Price')!
    const named = catalogue.getState().apply(namePrice('rig_kits', 'cash', sell.id))
    expect('next' in named || 'event' in named).toBe(true)
    try {
      render(withTheToaster(<Configurator quoteId={quote.id} at="finale" />))
      const rail = railFor(quote)
      expect(rail.unpricedWhy).toEqual(['before'])
      const to = rail.unpricedAgain[0]!.to!
      expect(to).toBeGreaterThan(0)
      /* said once, by the give it stops, and not again under the total */
      expect(screen.queryByTestId('total-note')).toBeNull()
      expect(
        screen.getByText(/went on before Rigging Kits had a price, so this quote cannot be given/),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Give it to the customer' })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      await userEvent.click(screen.getByRole('button', { name: `Price it at ${money(to)}` }))
      const after = quotes.getState().get(quote.id)!
      expect(quoteTotals(after).total).toBe(quoteTotals(quote).total + to)
      expect(screen.queryByTestId('total-note')).toBeNull()
      expect(screen.getByRole('button', { name: 'Give it to the customer' })).not.toHaveAttribute(
        'aria-disabled',
        'true',
      )
      const step = await screen.findByTestId('last-step')
      await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
      expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(quoteTotals(quote).total)
    } finally {
      catalogue.getState().undo()
    }
  })

  /* EVERY FACT ONCE WHILE THE FINALE IS OPEN (the refine round, 2026-10-21): the name was in the
     masthead's eyebrow, Who it is for's head and the card; the number of items in the price pill
     and the finale's head; "given" in the eyebrow, the head, the card and the act's sentence. */
  /* AND THE MISSING NAME ONCE, WHERE IT IS ACTED ON (the refine round's reader, 2026-10-21:
     "nobody named yet", "A quote needs a name before it can be given." and "The finale · not
     ready to give yet" in one window, and the card's "For nobody named yet" over the give's
     refusal made four). */
  it('says who it is for on the card and not in the masthead, and the head says only whether it can be given', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    const head = finaleHead
    const who = whoHead
    const nobody = /nobody named yet|name before it can be given|not ready to give/

    /* no name, Motor open: Who it is for's head says so, and the shut finale says only where
       it comes, never the gap again */
    const motor = render(<Configurator quoteId={quote.id} at="motor" />)
    expect(who()).toHaveTextContent(/nobody named yet$/)
    expect(head()).toHaveTextContent(/^The finale\s*after their name$/)
    expect(screen.getAllByText(nobody)).toHaveLength(1)
    motor.unmount()

    /* no name, Who it is for open: the sentence under its act says it, and its head does not */
    const asking = render(<Configurator quoteId={quote.id} at="handover" />)
    expect(who()).toHaveTextContent(/^Who it is for$/)
    expect(screen.getAllByText(nobody)).toHaveLength(1)
    asking.unmount()

    /* no name, the finale open: the give's refusal says it once, and the card offers the way to it */
    const goTo = vi.fn<(id: string) => void>()
    const shut = render(<Configurator quoteId={quote.id} at="finale" goTo={goTo} />)
    expect(head()).toHaveTextContent(/^The finale$/)
    expect(who()).toHaveTextContent(/^Who it is for$/)
    expect(screen.queryAllByText(nobody)).toEqual([])
    /* said once, as one of the give's causes or as its one (built-critique-m3-2.md, major 5) */
    expect(screen.getAllByText(/No customer’s name is on (this quote|it)/)).toHaveLength(1)
    const card = document.querySelector<HTMLElement>('.cfg-hand')!
    await userEvent.click(within(card).getByRole('button', { name: 'Put their name on it' }))
    expect(goTo).toHaveBeenCalledWith('handover')
    shut.unmount()

    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    const open = render(<Configurator quoteId={quote.id} at="finale" />)
    /* open, the card and its act say where the give stands; the head is its name */
    expect(head()).toHaveTextContent(/^The finale$/)
    expect(document.querySelector('.cfg-hand')).toHaveTextContent('For R. Kelleher')
    /* THE MASTHEAD IS THE QUOTE'S IDENTITY AND ALWAYS SAYS WHOM IT IS FOR (the owner, 2026-10-30:
       "the header section should be way nicer"; it is what is sold, for whom, its number and
       state), the finale's card saying it again where the quote is given */
    expect(document.querySelector('.cfg-mast')).toHaveTextContent('R. Kelleher')
    open.unmount()

    /* and with the card not on screen the shut finale's head says it is ready, never with a
       count or "draft" */
    render(<Configurator quoteId={quote.id} at="motor" />)
    expect(document.querySelector('.cfg-mast')).toHaveTextContent('R. Kelleher')
    expect(head()).toHaveTextContent(/ready to give$/)
    expect(head()).not.toHaveTextContent(/items?\b|draft|not ready/)
  })

  /* WHAT IS NOT IN THE TOTAL IS SAID ONCE, UNDER THE TOTAL IT IS ABOUT (docs/WORDS.md): under
     the finale's figure while the finale is open — and then the head says no figure and no note
     — and under the head's figure everywhere else. Never "lines", never "not priced on this
     quote", never a second time in the finale's notes. */
  it('says what is not in the total once, under the total that is showing', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    const { unmount } = render(<Configurator quoteId={quote.id} at="finale" />)
    const rail = railFor(quote)
    expect(rail.unpriced, 'the 519 carries an unpriced rigging kit').toBeGreaterThan(0)
    const note = totalNoteSay(rail.unpricedNames, false, rail.unpricedLists, rail.unpricedWhy)
    /* the kit's whole list names no price and holds sell figures, so the line says the choice
       Northside has not made, and then the kit (built-critique-m3.md, blocker 1) */
    expect(note).toMatch(
      /^Northside has not chosen which figure prices Rigging Kits, so the rigging kit for the \S+ is not in this total\.$/,
    )
    /* ON A DRAFT'S FINALE THE GIVE SAYS IT, ONCE, with what to do beside it, and the sentence
       under the total does not say it again (one fact once) */
    expect(screen.queryAllByText(note)).toHaveLength(0)
    expect(document.querySelector('.cfg-hand__count')).toBeNull()
    /* the give's causes, one line each under one lead that says what they stop, once
       (built-critique-m3-2.md, major 5: two refusals ran into one paragraph) */
    expect(rail.waits.length).toBeGreaterThan(1)
    expect(screen.getAllByText(giveWaitsLead(rail.waits.length))).toHaveLength(1)
    for (const said of rail.waits) expect(screen.getAllByText(said)).toHaveLength(1)
    expect(screen.getAllByText(/cannot be given/)).toHaveLength(1)
    /* the tally says no figure while the finale's card says the total */
    expect(screen.getByTestId('running-total')).not.toHaveTextContent(/Total|\$\d/)
    expect(document.querySelector('.cfg-hand__notes')).not.toHaveTextContent(/not priced|paper/)
    expect(screen.getByTestId('configurator')).not.toHaveTextContent(/not priced on this quote/i)
    unmount()

    render(<Configurator quoteId={quote.id} at="motor" />)
    expect(screen.getAllByText(note)).toHaveLength(1)
    expect(screen.getByTestId('running-total')).toHaveTextContent(note)
    expect(screen.getByTestId('running-total')).not.toHaveTextContent(/picked at|lines?\b/)
  })

  /* AND NOWHERE ELSE IN THE WINDOW (the refine round's reader at 1440, 2026-10-21): on a draft
     too, "Cash · 3 of 4 items priced" beside the level counted the kit the line under the total
     names, and "No price on the price list" beside "Rigging Kits" in Dealer fit said it again.
     The level stays and the list stays named; the count and the tag go where the line says it. */
  it('on a draft, counts nothing beside the level and tags no list the line under the total names', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    const rail = railFor(quote)
    expect(rail.unpricedLists, 'the 519’s kit comes from a list with no price').toContain(
      'Rigging Kits',
    )
    const note = totalNoteSay(rail.unpricedNames, false, rail.unpricedLists, rail.unpricedWhy)
    render(<Configurator quoteId={quote.id} at="fit" />)
    expect(screen.getAllByText(note)).toHaveLength(1)
    expect(screen.getByText('Priced at')).toBeInTheDocument()
    expect(screen.getByTestId('configurator')).not.toHaveTextContent(/items? priced/)
    const kits = screen.getByRole('heading', { name: 'Rigging Kits', level: 3 })
    expect(kits.parentElement!.querySelector('.cfg-table__tag')).toBeNull()
    expect(screen.queryAllByText('No price on the price list')).toHaveLength(0)
    expect(kits.parentElement!.querySelector('a')).toBeNull()
  })

  /* build-close-critique-2.md, major 5: "Let the dealer price the line before the customer reads
     the gap." The finale offers a price for each line the price list gives none, as 01 offers
     the boat's: the engine's own command, its reason written beside it, and the Undo on the step. */
  it('puts a price on a line the price list gives none, before the give, and the Undo takes it off', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    const rail = railFor(quote)
    expect(rail.unpriced, 'the 519 carries an unpriced rigging kit').toBe(1)
    const before = quoteTotals(quote).total
    render(withTheToaster(<Configurator quoteId={quote.id} at="finale" />))

    /* a blank press is a sentence where it was typed, and writes nothing */
    await userEvent.click(screen.getByRole('button', { name: PUT_A_PRICE }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Type its price first/)
    expect(unpricedKit(quotes.getState().get(quote.id)!).overridePrice).toBeUndefined()

    await userEvent.type(
      screen.getByLabelText(/^Price for the rigging kit for the \S+, tax included$/),
      '2,210',
    )
    await userEvent.click(screen.getByRole('button', { name: PUT_A_PRICE }))
    const after = quotes.getState().get(quote.id)!
    expect(unpricedKit(after).overridePrice).toBe(2_210)
    /* its list holds sell figures and names none, so the reason kept beside the price says that,
       never "the price list has no price for it" (built-critique-m3.md, blocker 1) */
    expect(unpricedKit(after).overrideReason).toBe(LINE_UNCHOSEN_REASON)
    expect(LINE_UNCHOSEN_REASON).not.toBe(LINE_PRICE_REASON)
    expect(quoteTotals(after).total).toBe(before + 2_210)
    /* the line is in the total now, so nothing says it is not, and nothing offers to price it */
    expect(document.querySelector('.cfg-hand__count')).toBeNull()
    expect(screen.queryByRole('button', { name: PUT_A_PRICE })).not.toBeInTheDocument()
    const step = await screen.findByTestId('last-step')
    expect(step).toHaveTextContent(/^Rigging kit for the \S+ priced at \$2,210/)

    await userEvent.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(unpricedKit(quotes.getState().get(quote.id)!).overridePrice).toBeUndefined()
    expect(screen.getByRole('button', { name: PUT_A_PRICE })).toBeInTheDocument()
  })

  it('gives it where it was pressed: the total unmoved, the keyboard on the paper, and once', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    priceTheKit(quote)
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
      expect(screen.getByRole('button', { name: 'Open the printed quote' })).toHaveFocus(),
    )
    /* what given means is said once, under the way back to work, and with which prices */
    expect(screen.getAllByText(/\bfinal\b/)).toHaveLength(1)
    expect(
      screen.getByText(/Every price on it is final\. A new version keeps these prices/),
    ).toBeVisible()

    /* shut and opened again, it is simply there, final */
    rerender(<Configurator quoteId={quote.id} at="motor" openDocument={openDocument} />)
    rerender(<Configurator quoteId={quote.id} at="finale" openDocument={openDocument} />)
    expect(screen.getByTestId('given-seal')).toHaveTextContent('Given to R. Kelleher')
    expect(document.querySelector('.cfg-hand')).not.toHaveAttribute('data-arrives')
  })

  it('does not play for a quote that was given before the build was opened', async () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    priceTheKit(quote)
    const first = render(<Configurator quoteId={quote.id} at="handover" />)
    await issueOne(quote, first.rerender)
    first.unmount()
    render(<Configurator quoteId={quote.id} />)
    expect(screen.getByTestId('given-seal')).toHaveTextContent('Given to R. Kelleher')
    expect(document.querySelector('.cfg-hand')).not.toHaveAttribute('data-arrives')
    expect(screen.getByRole('button', { name: 'Open the printed quote' })).not.toHaveFocus()
  })
})

describe('no document at this address', () => {
  it('says so rather than drawing an empty screen', () => {
    render(<Configurator quoteId="not-a-quote" />)
    expect(screen.getByText(/No quote at this address/)).toBeInTheDocument()
  })
})

/** THE DEALER PUTS A PRICE ON THE 519'S KIT AT THE DESK, as the finale offers, so the quote can be
 *  given: Rigging Kits name no price, and a quote carrying one unpriced is not given
 *  (built-critique-m3.md, blocker 1). The figure is the line's own Kit Sell Price, read off the
 *  file, never typed here. */
function priceTheKit(quote: QuoteDef): void {
  const standing = quotes.getState().get(quote.id)!
  const kit = standing.lines.find((l) => l.entityId === 'rig_kits')!
  const table = catalogue.getState().tables['rig_kits']!
  const row = (catalogue.getState().rows['rig_kits'] ?? []).find((r) => r.id === kit.rowId)!
  const field = table.fields.find((f) => f.name === 'Kit Sell Price')!
  const figure = Number(row.values[field.id])
  expect(figure, 'the kit holds a Kit Sell Price').toBeGreaterThan(0)
  quotes.getState().apply(quote.id, setOverride(kit.id, figure, LINE_UNCHOSEN_REASON))
}

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
  await userEvent.type(screen.getByLabelText(/Who the quote is for/), 'R. Kelleher')
  await userEvent.click(screen.getByRole('button', { name: 'Put their name on it' }))
  rerender(<Configurator quoteId={quote.id} at="finale" {...extra} />)
  await userEvent.click(screen.getByRole('button', { name: 'Give it to the customer' }))
  expect(quotes.getState().get(quote.id)!.state).toBe('issued')
}

/* WHAT IS NOT PRICED IS SAID ONCE ON A GIVEN QUOTE TOO (the refine round, 2026-10-21): with no
   other price to compare it with, "Cash · 4 of 5 items priced" beside the level said again what
   the line under the total names, in the same window. The level stays; the count goes where the
   line under the total already says it. */
describe('a given quote says what is not priced once', () => {
  it('names the unpriced kit under the total and does not count it again beside the level', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    /* A QUOTE GIVEN WITH ITS KIT UNPRICED is one given before the build refused it
       (built-critique-m3.md, blocker 1), so it is given here as the engine gave it then */
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    quotes.getState().apply(quote.id, issue())
    const { rerender } = render(<Configurator quoteId={quote.id} at="handover" />)
    const given = quotes.getState().get(quote.id)!
    expect(given.state).toBe('issued')
    const rail = railFor(given)
    expect(rail.unpriced, 'the 519 carries an unpriced rigging kit').toBe(1)
    for (const at of ['finale', 'motor'] as const) {
      rerender(<Configurator quoteId={quote.id} at={at} />)
      expect(
        screen.getAllByText(
          totalNoteSay(rail.unpricedNames, false, rail.unpricedLists, rail.unpricedWhy),
        ),
      ).toHaveLength(1)
      /* the price it is at stands beside the total in the tally; with the finale open its card
         says it ("Total at Cash") */
      if (at === 'motor') expect(screen.getByText('Priced at')).toBeInTheDocument()
      expect(screen.getByTestId('configurator')).not.toHaveTextContent(/items? priced/)
    }
  })
})

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
    expect(screen.queryByRole('button', { name: 'Open the printed quote' })).not.toBeInTheDocument()

    rerender(<Configurator quoteId={quote.id} at="handover" openDocument={openDocument} />)
    await issueOne(quote, rerender, { openDocument })

    rerender(<Configurator quoteId={quote.id} at="finale" openDocument={openDocument} />)
    /* ONE, AND IT IS THE FINALE'S (the component critique, 2026-09-28, major 8):
       the masthead's own copy grew the head by a row under the press */
    const acts = screen.getAllByRole('button', { name: 'Open the printed quote' })
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
  /* ON THE TILE IT IS ABOUT, IN ONE WORD (docs/WORDS.md: "The price file recommends … for this
     hull" → "Recommended" on the tile): the sentence over the list named the file and the hull,
     and the tile below it said the same name again */
  it('says the starred row is recommended on its own tile, and draws no glyph for it', () => {
    const quote = fileAQuote('boat_stacer', '529 Assault Pro')
    render(<Configurator quoteId={quote.id} at="motor" />)
    const table = railFor(quote).chapters.find((c) => c.id === 'motor')!.tables[0]
    expect(table.recommends).not.toBe('')
    const tile = screen.getByRole('button', {
      name: new RegExp(`^${escape(table.recommends)}, recommended,`),
    })
    expect(tile).toHaveTextContent('Recommended')
    expect(screen.queryByText(/price file recommends/)).toBeNull()
    /* §4 of docs/research/refs/configurator/notes.md, measured across
       Saxdor, Apple, Whaler and Porsche: "None uses a star, a ribbon
       or a colour." */
    expect(screen.getByTestId('configurator').textContent).not.toContain('★')
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
    const recommended = (q: QuoteDef) =>
      railFor(q)
        .chapters.find((c) => c.id === 'fit')!
        .tables.flatMap((t) => [...t.rows, ...t.also])
        .filter((r) => r.starred)
        .map((r) => [r.stem, r.tail].filter((w) => w !== '').join(' '))
    expect(recommended(before)).toContain('Rigging kit for the F90LB')
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
    /* EACH FIGURE ONCE (the refine round, 2026-10-21: "$16,667" in the toast, the chapter's head
       and the tile's "on the quote" pill): the toast says what the change of mind did to the
       total, the tile it was pressed on had said the same, and the motor's own price is said once
       in the open chapter, on its tile. */
    const step = await screen.findByTestId('last-step')
    expect(step).toHaveTextContent(/instead of the F90LB/)
    expect(step).toHaveTextContent(new RegExp(`· ${escape(signedMoney(other.delta!))}`))
    const price = money(other.amount!)
    const chapter = document.querySelector<HTMLElement>('[data-chapter="motor"]')!
    expect(within(chapter).getAllByText(price)).toHaveLength(1)
    expect(chapter.querySelector('.cfg-head')).not.toHaveTextContent(price)
    /* the F90LB's kit is no longer the one recommended, now the F115LB is on the boat */
    expect(recommended(after)).not.toContain('Rigging kit for the F90LB')

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
    /* the kit by the motor it is for, never by the price list's description of it
       (build-close-critique-2.md major 1) */
    expect(odd[0]!.said).toBe(
      'The rigging kit for the F90LB is on this quote, and no Yamaha F90LB is on this boat now.',
    )
    expect(odd[0]!.actSay).toBe('Put on the kit for the F115LB instead')

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
  it('draws the photograph Home sells on the Stacer 519 Sea Ranger SDF (Side Console)', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF (Side Console)')
    const hero = hullHero(sheetCtx(), quote)
    expect(hero, 'the build draws no photograph for a boat Home sells with one').not.toBeNull()
    /* THE SAME PICTURE HOME DRAWS: Home picks its photograph by the ledger's id, and this is
       that file — a picture of THIS model, so it says nothing beyond it */
    expect(hero!.src).toContain('stacer-519-sea-ranger')
    expect(hero!.standing).toBe('model')
    expect(hero!.beyond).toBe('')

    render(<Configurator quoteId={quote.id} at="hull" />)
    expect(screen.getByRole('img', { name: hero!.subject })).toHaveAttribute('src', hero!.src)
    expect(screen.getByText(/^Photograph from /)).toBeInTheDocument()
    expect(screen.queryByText(/no photograph of this boat is held/i)).not.toBeInTheDocument()
  })

  /* THE GATE ROUND, 2026-10-20: that photograph shows a SIDE console. It stood on the Centre
     Console's stage too, captioned "This quote: Centre Console" under a boat that is not one. */
  it('never draws the 519 Side Console’s photograph on the Centre Console’s stage', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF (Centre Console)')
    expect(hullHero(sheetCtx(), quote)).toBeNull()
    const { container } = render(<Configurator quoteId={quote.id} at="hull" />)
    expect(container.querySelector('img[src*="stacer-519-sea-ranger"]')).toBeNull()
  })

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
const DEALER_NEVER: readonly RegExp[] = [
  /price file/i,
  /* "paired", "pairing" — never "2 Pairs of XS 6.5" Speakers", which is a product's own name */
  /\bpair(ed|ing)\b/i,
  /this browser/i,
  /\bre-?prices?\b/i,
  /price level/i,
  /not priced on this quote/i,
  /\bthe paper\b/i,
  /\bin any chapter\b/i,
]

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
      const text = container.textContent ?? ''
      /* AND THE WORDS THE REFINE ROUND TOOK OUT OF THIS SCREEN (docs/WORDS.md): the file
         explaining itself, the pairing list's word, where the app keeps things, and one fact
         said the paper's way four times over */
      const hits = [
        ...engineWordsIn(text),
        ...DEALER_NEVER.flatMap((word) => word.exec(text)?.[0] ?? []),
      ]
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
    /* no nought and no figure on its head: the line under the total says what is not in it, once */
    expect(within(hull).queryByText(/\$0\b/)).not.toBeInTheDocument()
    expect(within(hull).queryByText(NOT_PRICED_ON_PAPER)).not.toBeInTheDocument()
    /* the masthead's figure is everything but the boat, and says so */
    expect(screen.getByTestId('running-total')).toHaveTextContent(
      'The boat has no price yet, so this total is everything but the boat.',
    )
    /* AND ONLY THERE (the refine round, 2026-10-21): the hull's block offers the act without
       saying the missing price again, and no count beside the level says it a third time */
    const block = within(hull).getByTestId('hull-price')
    expect(block).toHaveTextContent(
      'It goes on this quote only, and prints on the customer’s quote as the boat’s price.',
    )
    expect(block).not.toHaveTextContent(/no price/)
    expect(screen.getByTestId('configurator')).not.toHaveTextContent(/items? priced/)
    expect(
      within(block).getByRole('button', { name: 'Put this price on the boat' }),
    ).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('will not be given to the customer while the boat has no price', () => {
    const quote = fileAQuote('boat_haines', '525F')
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    render(<Configurator quoteId={quote.id} at="finale" />)
    /* the boat first; and the factory package beside it, whose price Northside has not chosen,
       is said after it (built-critique-m3.md, blocker 1) */
    const blockers = railFor(quote).blockers
    expect(blockers[0]).toBe(HULL_UNPRICED_WHY)
    for (const why of blockers.slice(1))
      expect(why).toMatch(/^Northside has not chosen which figure prices /)
    const waits = within(screen.getByTestId('give-waits'))
    expect(waits.getByText(HULL_UNPRICED_WHY)).toBeInTheDocument()
    expect(waits.getAllByRole('listitem')).toHaveLength(blockers.length)
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

  /* A PART IS LED BY ITS KIND AND SAYS ITS NAME; ITS CODE IS THE WORKSHOP'S (build-close-
     critique-2.md major 2: "radio circles, each with a part code under it, '+$18 at Cash' five
     times … no glyph"). The code the order goes out under is still one press away, whole. */
  /* THE PARTS ARE THE CHANDLERY'S (direction B, picked 2026-10-30): each part the price list makes
     for this boat a card with its name and one figure, its code never on the card, and Add */
  it('draws the parts made for this boat as the chandlery’s cards, named, priced and never coded', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF')
    render(<Configurator quoteId={quote.id} at="fit" />)
    const parts = chapterOf(quote, 'fit').tables.find((t) => t.title === 'Parts & Accessories')!
    const made = parts.rows.filter((r) => !r.outside)
    expect(made.length).toBeGreaterThan(0)
    const shelf = within(screen.getByTestId('chandlery')).getByRole('region', {
      name: /^Made for the /,
    })
    for (const row of made) {
      const card = within(shelf)
        .getAllByRole('listitem')
        .find((li) => li.textContent?.includes(row.tail))
      expect(card, row.tail).toBeDefined()
      if (row.code !== '') expect(card).not.toHaveTextContent(row.code)
      expect(card).not.toHaveTextContent(/at Cash/)
    }
    expect(within(shelf).getAllByRole('button', { name: /^Add the .* to the quote$/ }).length).toBe(
      made.filter((r) => !r.fitted).length,
    )
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

/* built-critique-m3-2.md, blocker 1: a rule written on Rules refusing a Stacer's motor over
   20 hp, and the very next draft on the Stacer 659 opened on the refused F130XA, gave, and
   printed. The rule goes in through the catalogue's own command, as Rules files it, and the new
   draft is started by the picker's own act. */
describe('a rule that refuses a boat’s starred motor', () => {
  const refusing = () => {
    const boatCols = pairColumns(pack.ctx, 'boat')
    const motorCols = pairColumns(pack.ctx, 'motor')
    return pairRule({
      orgId: 'northside',
      boat: { column: boatCols.find((c) => c.name === 'maker')!, op: 'eq', value: 'Stacer' },
      partnerKind: 'motor',
      partner: {
        column: motorCols.find((c) => c.name === 'horsepower')!,
        op: 'lte',
        value: '20',
      },
      because: 'a Stacer this size is sold with a small motor',
      severity: 'block',
      enabled: true,
      now: '2026-10-22T09:00:00.000Z',
    })
  }
  const OCEAN_RANGER = '659 Ocean Ranger Cen Cab'

  it('is obeyed by the next new draft: the refused motor is named once over the list, not put on', async () => {
    const rule = refusing()
    const done = catalogue.getState().apply(addRule(rule))
    expect('refused' in done).toBe(false)
    try {
      const table: EntityDef = pack.byKey('boat_stacer')
      const row = (pack.rowsByEntity[table.id] as RowData[]).find((r) =>
        rowLabel(table, r).includes(OCEAN_RANGER),
      )!
      const started = startQuote(
        {
          tableId: table.id,
          rowId: row.id,
          sheet: catalogue.getState(),
          orgId: PACK_ORG_ID,
          filed: quotes.getState().quotes,
        },
        () => undefined,
      )
      expect(started.ok).toBe(true)
      if (!started.ok) return
      quotes.getState().file(started.quote, started.event!)
      expect(started.quote.lines.some((l) => /F130XA/.test(l.label))).toBe(false)

      render(<Configurator quoteId={started.quote.id} at="motor" />)
      const said = screen.getByTestId('ruled-here')
      expect(said).toHaveTextContent(/Not offered on this boat: .*Yamaha F130XA/)
      expect(said).toHaveTextContent('because a Stacer this size is sold with a small motor')
      expect(said).not.toHaveTextContent(/on this quote already/)
    } finally {
      catalogue.setState({ constraintDefs: [] })
    }
  })

  it('refuses the give of a draft made before it, with its because, until the motor is off', async () => {
    const quote = fileAQuote('boat_stacer', OCEAN_RANGER)
    expect(quote.lines.some((l) => /F130XA/.test(l.label))).toBe(true)
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))
    catalogue.getState().apply(addRule(refusing()))
    try {
      render(<Configurator quoteId={quote.id} at="finale" />)
      const refusal = screen.getByText(
        /The Yamaha F130XA is on this quote, and your rule refuses it on this boat, because a Stacer this size is sold with a small motor\. Take it off before it goes to the customer\./,
      )
      expect(refusal).toBeInTheDocument()
      const act = screen.getByRole('button', { name: 'Give it to the customer' })
      expect(act).toHaveAttribute('aria-disabled', 'true')
      await userEvent.click(act)
      expect(quotes.getState().get(quote.id)!.state).toBe('draft')
    } finally {
      catalogue.setState({ constraintDefs: [] })
    }
  })
})
