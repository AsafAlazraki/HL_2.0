import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { boatOfQuote } from '@/domain/quote/spoken'
import { jointsOf } from '@/domain/quote/wrap'
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
import { copyOf, heroOfQuote, hostOf, markOf } from '@/data/pictures'
import { finishFix, levelFix, readProposal, isRefused } from './proposal'
import { engineWordsIn } from '@/screens/configurator/say'
import { readDocument } from '@/domain/quote/document'
import { cellWord } from '@/screens/document/paper'
import { boatTravel } from '@/screens/picker/travel'

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

/** A NAME DRAWN AT ITS JOINTS (`Joints`, Cascade.tsx; m2-last-critique.md
 *  minor 8) is one element whose words are its parts' boxes: it is found by
 *  its whole text, read as a reader reads it, and only the element that
 *  holds the parts answers — never a part alone. */
const whole =
  (said: string) =>
  (_: string, element: Element | null): boolean =>
    element !== null &&
    [...element.children].some((child) => child.classList.contains('csc-joint')) &&
    (element.textContent ?? '').replace(/\s+/g, ' ').trim() === said

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

/** The white mark the ledger holds for a register, or nothing. */
const white = (register: string) => {
  const marked = markOf(register, 'white')
  return marked.drawn ? marked.mark : null
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
        expect(screen.getAllByText(whole(row.label)).length).toBeGreaterThan(0)
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
      decision.getByText(new RegExp(`${money(from)}.*now.*${money(to)}`.replaceAll('$', '\\$'))),
    ).toBeInTheDocument()
  })

  it('prints a line the price file does not price in the paper’s own word, and never Standard', () => {
    /* THE M2 CLOSE'S THIRD BLOCKER: the rigging kit read `Standard`
       here and "Not priced on this quote" on the customer's paper. The
       lines are found by the paper's own reading, not named. */
    const doc = readDocument(quote)
    const unpriced = [
      ...doc.sections.flatMap((s) => s.tables.flatMap((t) => t.lines)),
      ...doc.typed,
    ].filter((line) => line.state === 'unpriced')
    expect(unpriced.length).toBeGreaterThan(0)

    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)
    for (const line of unpriced) {
      /* named as the paper names it (m2-last-critique.md, major 4) */
      const row = screen.getAllByText(whole(line.said))[0].closest('li')
      expect(row, line.said).not.toBeNull()
      expect(row!).toHaveTextContent(cellWord(line))
    }
    expect(screen.getByTestId('cascade')).not.toHaveTextContent(/standard/i)
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
    /* IN BOTH PLACES THE SCREEN PRINTS A TOTAL, and that is the point
       of the build column: the figure it promised would not move
       until you accept is the figure that has now moved, and the two
       are read out of the same engine rather than one being
       remembered. `getAllByText` because the agreement is what is
       being asserted — a single match would mean one of them had
       stopped saying it. */
    const said = screen.getAllByText(new RegExp(money(promised).replaceAll('$', '\\$')))
    expect(said.length).toBeGreaterThanOrEqual(2)
    const standing = screen.getByRole('complementary', { name: 'The build this decision is about' })
    expect(within(standing).getByText(money(promised))).toBeInTheDocument()

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
    expect(screen.getByText(/does not say which change to price/)).toBeInTheDocument()
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

/* ============================================================
   THE BUILD, AS IT STANDS — the column the critique's major finding
   turned into an object. Every figure on it is read off the document
   through the engine here, exactly as it is on the screen, and the
   two ledgers are asked for the pixels rather than told them.
   ============================================================ */

const standing = () =>
  within(screen.getByRole('complementary', { name: 'The build this decision is about' }))

describe('the build the decision is about', () => {
  it('names the boat, counts its lines and prints the total that is not moving', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const rung = otherRung(quote)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)

    const column = standing()
    /* the boat as a person says it, never the file's key string */
    const said = boatOfQuote(quote).say
    const name = column.getByText(whole(said))
    /* drawn at its joints: the boat, its material and its colourway, each
       one box keeping the "·" after it (m2-last-critique.md, minor 8) */
    const parts = [...name.querySelectorAll('.csc-joint')].map((part) => part.textContent)
    expect(parts).toEqual(jointsOf(said))
    expect(parts.length, said).toBeGreaterThan(1)
    expect(
      screen.getByRole('complementary', { name: 'The build this decision is about' }).textContent,
    ).not.toContain(quote.subjectLabel)
    expect(column.getByText(money(quoteTotals(quote).total))).toBeInTheDocument()
    expect(
      column.getByText(
        `${quote.lines.length} ${quote.lines.length === 1 ? 'line' : 'lines'} on this quote.`,
      ),
    ).toBeInTheDocument()
  })

  it('draws the row’s own copy at the pixels the ledger holds, and never a larger number', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const held = copyOf(quote.subjectImage?.src)
    expect(held, 'the SP560 row on this pack carries a held copy').not.toBeNull()
    const rung = otherRung(quote)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)

    const plate = standing().getByRole('img', { name: boatOfQuote(quote).say })
    expect(plate).toHaveAttribute('src', held!.src)
    expect(plate).toHaveAttribute('width', String(held!.width))
    expect(plate).toHaveAttribute('height', String(held!.height))
    /* WHERE IT CAME FROM, in a line a customer can read — never the
       ledger's arithmetic ("this row's own copy, 1,100 × 619, never
       enlarged", M2-close critique #4 and #21) */
    const said = standing().getByText(new RegExp(`of this boat from ${hostOf(held!.address)}`))
    expect(said).not.toHaveTextContent(/row|never enlarged|×/)
  })

  it('says the photograph behind the sheet is of the MODEL, not of this colourway', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const scene = heroOfQuote(quote, ctxNow())
    expect(scene, 'heroes-ledger.json holds an SP560 on the water').not.toBeNull()
    const rung = otherRung(quote)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)

    const said = standing().getByText(/Behind it, the/)
    expect(said).toHaveTextContent(`the ${scene!.model} on the water`)
    expect(said).toHaveTextContent(hostOf(scene!.address))
    expect(said).toHaveTextContent('the model, not the colourway on this quote')
  })

  it('stands on the room and claims no photograph behind it where none of the model is held', () => {
    const quote = fileAQuote('boat_highfield', 'CL290')
    expect(heroOfQuote(quote, ctxNow())).toBeNull()
    const rung = otherRung(quote)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)

    expect(standing().queryByText(/Behind it/)).not.toBeInTheDocument()
    expect(standing().queryByText(/on the water/)).not.toBeInTheDocument()
  })

  it('stands on its maker’s own mark where no photograph of the model is held, and says it is not the boat', () => {
    /* the M2-close critique's finding 6: 47% of a 1920 window was the room's
       ground with a small card in it. The ground is now the file's blue under
       the maker's WHITE mark, matched on the register's name and nothing else */
    const quote = fileAQuote('boat_highfield', 'CL290')
    expect(heroOfQuote(quote, ctxNow())).toBeNull()
    const maker = catalogue.getState().tables[quote.rootTableId]!.name
    const marked = markOf(maker, 'white')
    const mark = marked.drawn ? marked.mark : null
    expect(mark, `${maker} has a white mark in the ledger`).not.toBeNull()
    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)

    const build = screen.getByRole('complementary', { name: 'The build this decision is about' })
    expect(build).toHaveAttribute('data-ground', 'maker')
    const drawn = within(build).getByRole('img', { name: mark!.brand })
    expect(drawn).toHaveAttribute('src', mark!.src)
    expect(build).toHaveTextContent(
      `Above it, ${mark!.brand}’s own mark, which is not a picture of this boat.`,
    )
  })

  /* THE COMPONENTS CRITIQUE, BLOCKER 3: the Stacer 519 Sea Ranger SDF's photograph was on the
     picker, the stage, Home and Quotes, and this card said "No picture of this boat is held yet …
     Above it, Stacer's own mark". The one reader answers it here as it does on the stage. */
  it('stands the Stacer 519 on its own photograph, on the card and behind it, as the build does', () => {
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF (Centre Console)')
    expect(copyOf(quote.subjectImage?.src), 'no copy of the 519’s own address is held').toBeNull()
    const hero = heroOfQuote(quote, ctxNow())
    expect(hero?.src).toMatch(/hero-images\/stacer-519-sea-ranger-/)
    /* the frozen label answers as the row does, so the paper, which has no catalogue, agrees */
    expect(heroOfQuote(quote)?.src).toBe(hero!.src)
    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)

    const build = screen.getByRole('complementary', { name: 'The build this decision is about' })
    expect(build).toHaveAttribute('data-ground', 'scene')
    expect(build.querySelector('.csc-maker')).toBeNull()
    const plate = standing().getByRole('img', { name: boatOfQuote(quote).say })
    expect(plate).toHaveAttribute('src', hero!.src)
    expect(plate.getAttribute('srcset')).toContain('-640.webp 640w')
    expect(plate.style.getPropertyValue('--csc-travel')).toBe(
      boatTravel(quote.rootTableId, quote.rootRowId),
    )
    expect(build).not.toHaveTextContent(/No picture|Above it/)
    expect(build).toHaveTextContent(
      `The ${hero!.subject}, from ${hostOf(hero!.address)}, on the card and behind it`,
    )
  })

  it('draws no mark over a photograph of the model, and never another maker’s', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    expect(heroOfQuote(quote, ctxNow())).not.toBeNull()
    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)
    const build = screen.getByRole('complementary', { name: 'The build this decision is about' })
    expect(build).toHaveAttribute('data-ground', 'scene')
    expect(build.querySelector('.csc-maker')).toBeNull()
    /* the match is the maker's name, or the register's name beginning with it */
    expect(white('Stacer Trailers')?.brand).toBe('Stacer')
    expect(white('Trailers by Stacer')).toBeNull()
    expect(white('Surtees')).toBeNull()
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

/* THE M2-CLOSE CRITIQUE, #4: "This boat's row carries no picture this
   repository holds a copy of", "lines stand on this document", "carry
   that rung", "the committed figure", "the row you asked for". Both
   channels, before and after the act, read whole against the one list
   of words a dealer never reads. */
const wordsOn = (element: HTMLElement): string[] => engineWordsIn(element.textContent ?? '')

describe('the cascade speaks the dealer’s words, not the engine’s', () => {
  it('on a price level, before and after it is accepted', async () => {
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
    expect(wordsOn(screen.getByTestId('cascade'))).toEqual([])
    await userEvent.click(screen.getByRole('button', { name: new RegExp(rung.label) }))
    expect(wordsOn(screen.getByTestId('cascade'))).toEqual([])
  })

  it('on another finish of the hull, and on a boat with no picture held', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const table = pack.byKey('boat_highfield')
    const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
    const other = rows.find((r) => r.id !== quote.rootRowId)!
    const { unmount } = render(
      <Cascade
        quoteId={quote.id}
        fix={finishFix(other.id)}
        from="hull"
        goBack={vi.fn<(chapterId: string) => void>()}
      />,
    )
    expect(wordsOn(screen.getByTestId('cascade'))).toEqual([])
    unmount()

    /* a boat the price file names no picture for, and the heroes ledger holds no photograph of.
       Until 2026-09-28 this case was the Stacer 519 Sea Ranger SDF, whose photograph the build's
       stage draws: the sentence this asserted was the untrue one the components critique read
       (blocker 3), and the 519 now has its own case below. */
    const bare = fileAQuote('boat_stacer', '539 Rebel')
    expect(heroOfQuote(bare, ctxNow())).toBeNull()
    expect(copyOf(bare.subjectImage?.src)).toBeNull()
    render(<Cascade quoteId={bare.id} fix={levelFix(otherRung(bare).key)} from="hull" />)
    expect(wordsOn(screen.getByTestId('cascade'))).toEqual([])
    expect(standing().getByText(/No picture of this boat is held yet/)).toBeInTheDocument()
  })
})

/* ============================================================
   THE KIT (2026-09-28). The sheet speaks the component kit: the
   build's photograph travels onto its card under the build's own
   name, every line wears its kind's mark, every fate its glyph beside
   its word, and the rung asked for is the build's chosen capsule.
   ============================================================ */
describe('the cascade speaks the kit', () => {
  it('names the card’s photograph the way the build names its stage', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)
    const plate = standing().getByRole('img', { name: boatOfQuote(quote).say })
    /* the picker's own spelling, which the build's stage wears too */
    expect(plate.style.getPropertyValue('--csc-travel')).toBe(
      boatTravel(quote.rootTableId, quote.rootRowId),
    )
  })

  it('marks every line with the kind of the table it was picked from', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    const tables = catalogue.getState().tables
    for (const row of reading.proposal.causes.flatMap((c) => c.rows)) {
      const line = quote.lines.find((l) => l.id === row.id)!
      const kind = tables[line.entityId]?.kind
      const li = screen
        .getAllByText(whole(row.label))
        .map((el) => el.closest('li.csc-row'))
        .find((el) => el !== null)!
      if (kind) expect(li.querySelector(`[data-kind="${kind}"]`), row.label).not.toBeNull()
    }
    /* and the hull reads as a boat */
    expect(document.querySelector('.csc-row [data-kind="boat"]')).not.toBeNull()
  })

  it('says each fate in a word with its glyph, and the rung asked for as the chosen capsule', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const rung = otherRung(quote)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    for (const head of screen.getAllByRole('heading', { level: 2 })) {
      const verb = head.querySelector('.csc-cause__verb')!
      expect(verb.textContent?.trim().length).toBeGreaterThan(0)
      expect(verb.querySelector('svg')).not.toBeNull()
    }
    const asked = within(screen.getByRole('region', { name: 'What you chose' }))
    expect(asked.getByText(rung.label)).toHaveAttribute('data-chosen')
  })

  it('lands a tick beside what was done, and never animates the figure', async () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
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
    const title = screen.getByRole('heading', { level: 1 })
    expect(title.querySelector('.csc-done svg')).not.toBeNull()
    /* the total the act moved is the kit's price: a `<data>` element, set once */
    const total = within(screen.getByTestId('decision')).getByText(
      money(quoteTotals(quotes.getState().get(quote.id)!).total),
    )
    expect(total.tagName).toBe('DATA')
    expect(total.closest('.csc-done')).toBeNull()
  })
})
