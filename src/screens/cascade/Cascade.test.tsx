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
import { copyOf, heroOfQuote, hostOf, itemOfQuote, markOf } from '@/data/pictures'
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
    /* THE PRICE ASKED FOR IS NAMED ONCE, BY THE HEADLINE, with how many items it changes, in
       items and not lines (the refine round, 2026-10-21, cascade at 1440): "WHAT YOU CHOSE ·
       Trade", "NEW PRICE · at Trade" and "Trade" under every new figure said it three more
       times. The price a line stays at is still said, once, by its card ("at Cash: …"). */
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      new RegExp(String.raw`^At ${rung.label}, (one item changes|\d+ items change) price\.$`),
    )
    expect(screen.queryByRole('region', { name: 'What you chose' })).toBeNull()
    for (const head of screen.getAllByRole('heading', { level: 2 })) {
      expect(head.textContent).not.toMatch(new RegExp(`^New price\\s*at ${rung.label}`, 'i'))
    }
    expect(document.querySelector('.csc-col')).toBeNull()
    expect(screen.getByTestId('cascade')).not.toHaveTextContent(/lines? on this quote/)
  })

  it('is one card per cause, each headed by the sentence the engine wrote', () => {
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)

    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    for (const cause of reading.proposal.causes) {
      /* the price's own lines moving to it are headed by the headline, which names the price */
      const head =
        cause.fate === 'moves' && cause.because === `at ${rung.label}`
          ? [screen.getByRole('heading', { level: 1 })]
          : screen.getAllByRole('heading', { level: 2 })
      expect(
        head.some((h) => h.textContent?.toLowerCase().includes(cause.because.toLowerCase())),
        cause.because,
      ).toBe(true)
      /* and every row it explains is under it, by name */
      for (const row of cause.rows) {
        expect(screen.getAllByText(whole(row.label)).length).toBeGreaterThan(0)
      }
    }
  })

  it('prices the whole change in one figure, and says each total once', () => {
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)
    const { from, to, delta } = reading.proposal.cascade

    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    const decision = within(screen.getByTestId('decision'))
    expect(decision.getByText(signedMoney(delta))).toBeInTheDocument()
    /* THE TOTAL IT WOULD BE, in the decision; THE TOTAL IT IS, on the build's card and not again
       beside it (the refine round, 2026-10-21: "$124,421 now · $120,984 if you accept" said the
       card's figure a second time in one view) */
    expect(decision.getByText(`${money(to)} if you accept.`)).toBeInTheDocument()
    expect(screen.getByTestId('decision')).not.toHaveTextContent(money(from))
    /* and the change itself is the foot's: no card's capsule says the same figure again */
    for (const chip of document.querySelectorAll('.csc-cause__chip')) {
      expect(chip).not.toHaveTextContent(signedMoney(delta))
    }
    expect(
      within(
        screen.getByRole('complementary', { name: 'The build this decision is about' }),
      ).getByText(money(from)),
    ).toBeInTheDocument()
  })

  it('never leaves a “·” at a line’s end or start on its eyebrow', () => {
    const rung = otherRung(quote)
    render(
      <Cascade
        quoteId={quote.id}
        fix={levelFix(rung.key)}
        from="hull"
        business="Northside Marine"
      />,
    )
    /* every separator is bound by no-break spaces to the words either side of it (the refine
       round, 2026-10-21: at 390 it read "… QUOTE 20260916-01 ·" over "● DRAFT") */
    const eyebrow = screen.getByText(quote.reference).closest('p')!
    const text = eyebrow.textContent ?? ''
    /* the business is the crest's to say, not the eyebrow's (docs/WORDS.md, 2026-10-21) */
    expect(text).not.toContain('Northside Marine')
    expect(text.startsWith('Quote')).toBe(true)
    expect(text).toContain(`${quote.reference} · draft`)
    expect(text).not.toMatch(/ ·|· /)
  })

  it('prints a line the price list does not price in the paper’s own word, and never Standard', () => {
    /* THE M2 CLOSE'S THIRD BLOCKER: the rigging kit read `Standard`
       here and "Not priced on this quote" on the customer's paper. The
       lines are found by the paper's own reading, not named. */
    const doc = readDocument(quote)
    const unpriced = [
      ...doc.sections.flatMap((s) => s.tables.flatMap((t) => t.lines)),
      ...doc.typed,
    ].filter((line) => line.state === 'unpriced')
    expect(unpriced.length).toBeGreaterThan(0)

    const reading = readProposal(ctxNow(), quote, levelFix(otherRung(quote).key))
    if (isRefused(reading)) throw new Error(reading.refused)
    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)
    for (const line of unpriced) {
      /* found by the line it is, and named as the cascade names it — a rigging kit by the motor
         it is for (docs/WORDS.md, rule 4), anything else as the paper names it */
      const named = reading.proposal.causes.flatMap((c) => c.rows).find((r) => r.id === line.id)
      expect(named, line.said).toBeDefined()
      const row = screen.getAllByText(whole(named!.label))[0].closest('li')
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
    /* where every item is on a card nothing is said: "Every item on this quote is above." was
       about the screen, not the boat (the refine round, 2026-10-21) */
    if (untouched === 0) {
      expect(document.querySelector('.csc-stays')).toBeNull()
      expect(screen.getByTestId('cascade')).not.toHaveTextContent(/is above/)
    } else {
      expect(
        screen.getByText(new RegExp(`${untouched.toLocaleString('en-AU')} other items? stays? as`)),
      ).toBeInTheDocument()
    }
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
    /* THE TOTAL IT PROMISED IS THE TOTAL THE BUILD'S CARD NOW PRINTS, read out of the same
       engine rather than remembered, and printed ONCE (the refine round, 2026-10-21): the foot
       keeps the decision's own figure, the change, and no longer says the card's total beside it */
    const standing = screen.getByRole('complementary', { name: 'The build this decision is about' })
    expect(within(standing).getByText(money(promised))).toBeInTheDocument()
    expect(screen.getAllByText(money(promised))).toHaveLength(1)
    const foot = within(screen.getByTestId('decision'))
    expect(foot.getByText(signedMoney(promised - was))).toBeInTheDocument()

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
    expect(screen.getByText(/There is no quote at this address/)).toBeInTheDocument()
  })
})

describe('the hull', () => {
  it('shows the change of boat priced, with the trailers made for the new one', async () => {
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

    /* THE BOAT IS NAMED BY THE HEADLINE AND ITS CARD, and not a third time between them; the
       boat it has now is the build card's to name (the refine round, 2026-10-21) */
    expect(screen.queryByRole('region', { name: 'What you chose' })).toBeNull()
    expect(reading.proposal.cascade.subtitle).not.toContain(boatOfQuote(quote).say)
    /* and a card of one line carries no capsule: its line's own figure is the card's sum */
    for (const card of document.querySelectorAll('.csc-cause')) {
      if (card.querySelectorAll('.csc-row').length < 2) {
        expect(card.querySelector('.csc-cause__chip')).toBeNull()
      }
    }

    const alternatives = screen.getByRole('region', { name: 'Trailers made for this boat' })
    for (const alternative of reading.proposal.alternatives) {
      expect(within(alternatives).getByText(alternative.label)).toBeInTheDocument()
    }

    await userEvent.click(screen.getByRole('button', { name: reading.proposal.cascade.accept }))
    expect(quotes.getState().get(quote.id)!.rootRowId).toBe(other.id)
    expect(quoteTotals(quotes.getState().get(quote.id)!).total).toBe(reading.proposal.cascade.to)
    /* THE HEADING SAYS THE DECISION, the boat, and not the last thing it took off (the refine
       round, 2026-10-21): a change that took the motor off read "Yamaha F175XC taken off the
       quote · $25,355" */
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Now the /)
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('taken off')
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
  it('names the boat and prints the total that is not moving, and counts nothing under it', () => {
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
    /* the count of the quote's lines went (docs/WORDS.md, "one fact, one place"): the sheet
       says what happens to every item, and nobody decides by the count */
    expect(
      screen.getByRole('complementary', { name: 'The build this decision is about' }),
    ).not.toHaveTextContent(/lines? on this quote/)
  })

  it('draws the row’s own copy at the pixels the ledger holds, and never a larger number', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const held = copyOf(itemOfQuote(quote))
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
    const scene = heroOfQuote(quote)
    expect(scene, 'pictures.json holds an SP560 on the water').not.toBeNull()
    const rung = otherRung(quote)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)

    const said = standing().getByText(/; behind it, the/)
    /* the photograph's own words, as the maker names the model — never the file's code */
    expect(said).toHaveTextContent(`the ${scene!.subject}`)
    expect(scene!.subject).toBe('Highfield Sport 560 on the water')
    expect(said).toHaveTextContent(hostOf(scene!.address))
    /* the model in its maker's colours, not this quote's, said in the same one sentence */
    expect(said).toHaveTextContent('in its maker’s colours, not this quote’s.')
  })

  it('stands on the room and claims no photograph behind it where none of the model is held', () => {
    const quote = fileAQuote('boat_highfield', 'CL290')
    expect(heroOfQuote(quote)).toBeNull()
    const rung = otherRung(quote)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)

    expect(standing().queryByText(/Behind it/)).not.toBeInTheDocument()
    expect(standing().queryByText(/on the water/)).not.toBeInTheDocument()
  })

  it('stands on its maker’s own mark where no photograph of the model is held, and says there is none in one sentence', () => {
    /* the M2-close critique's finding 6: 47% of a 1920 window was the room's
       ground with a small card in it. The ground is now the file's blue under
       the maker's WHITE mark, matched on the register's name and nothing else */
    const quote = fileAQuote('boat_highfield', 'CL290')
    expect(heroOfQuote(quote)).toBeNull()
    const maker = catalogue.getState().tables[quote.rootTableId]!.name
    const marked = markOf(maker, 'white')
    const mark = marked.drawn ? marked.mark : null
    expect(mark, `${maker} has a white mark in the ledger`).not.toBeNull()
    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)

    const build = screen.getByRole('complementary', { name: 'The build this decision is about' })
    expect(build).toHaveAttribute('data-ground', 'maker')
    const drawn = within(build).getByRole('img', { name: mark!.brand })
    expect(drawn).toHaveAttribute('src', mark!.src)
    /* ONE SENTENCE (the refine round, 2026-10-21, cascade at 1440): the mark says who built the
       boat, and "Above it, Stacer's own mark, which is not a picture of this boat." explained a
       logo after the sentence that already says no photograph is held */
    const prov = build.querySelector('.csc-prov')?.textContent ?? ''
    expect(prov.match(/\.(\s|$)/g)).toHaveLength(1)
    expect(build).not.toHaveTextContent(/Above it|own mark/)
  })

  it('says “No photograph of this boat yet.” and nothing more under a maker’s mark with no picture', () => {
    /* the finding itself: the Stacer 519 Centre Console stands on Stacer's mark with no picture */
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF (Centre Console)')
    expect(heroOfQuote(quote)).toBeNull()
    expect(copyOf(itemOfQuote(quote))).toBeNull()
    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)
    const build = screen.getByRole('complementary', { name: 'The build this decision is about' })
    expect(build).toHaveAttribute('data-ground', 'maker')
    expect(build.querySelector('.csc-prov')).toHaveTextContent(/^No photograph of this boat yet\.$/)
    expect(build).not.toHaveTextContent(/Above it|own mark/)
  })

  /* THE COMPONENTS CRITIQUE, BLOCKER 3: the Stacer 519 Sea Ranger SDF's photograph was on the
     picker, the stage, Home and Quotes, and this card said "No picture of this boat is held yet …
     Above it, Stacer's own mark". The one reader answers it here as it does on the stage.
     Since 2026-10-20 that photograph is the Side Console's alone (it shows a side console), and
     the Centre Console stands on Stacer's mark, saying it is not the boat. */
  it('stands the Stacer 519 on its own photograph, on the card and behind it, as the build does', () => {
    const centre = fileAQuote('boat_stacer', '519 Sea Ranger SDF (Centre Console)')
    expect(heroOfQuote(centre)).toBeNull()
    expect(copyOf(itemOfQuote(centre))).toBeNull()
    const quote = fileAQuote('boat_stacer', '519 Sea Ranger SDF (Side Console)')
    const hero = heroOfQuote(quote)
    expect(hero?.src).toMatch(/hero-images\/stacer-519-sea-ranger-/)
    /* the frozen label answers as the row does, so the paper, which has no catalogue, agrees */
    expect(heroOfQuote(quote)?.src).toBe(hero!.src)
    render(<Cascade quoteId={quote.id} fix={levelFix(otherRung(quote).key)} from="hull" />)

    const build = screen.getByRole('complementary', { name: 'The build this decision is about' })
    expect(build).toHaveAttribute('data-ground', 'scene')
    expect(build.querySelector('.csc-maker')).toBeNull()
    /* the card is the row's own copy (the Lifestyle (4) frame a person marked as the Side
       Console); the ground behind it is the model on the water */
    const plate = standing().getByRole('img', { name: boatOfQuote(quote).say })
    expect(plate.getAttribute('src')).toMatch(/519-sea-ranger-lifestyle-tifs-4-/)
    expect(plate.style.getPropertyValue('--csc-travel')).toBe(
      boatTravel(quote.rootTableId, quote.rootRowId),
    )
    expect(build).not.toHaveTextContent(/No picture|Above it/)
    /* one sentence: the card's picture, and what stands behind it in its maker's colours */
    expect(build).toHaveTextContent(
      `; behind it, the ${hero!.subject}, from ${hostOf(hero!.address)}, in its maker’s colours, not this quote’s.`,
    )
    expect((build.querySelector('.csc-prov')?.textContent ?? '').match(/\.(\s|$)/g)).toHaveLength(1)
  })

  it('draws no mark over a photograph of the model, and never another maker’s', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    expect(heroOfQuote(quote)).not.toBeNull()
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
/* AND THE WORDS docs/WORDS.md TAKES OUT OF THE SALE (the refine round, 2026-10-21): the
   workbook's file and level, the cascade's old card words, "paired", and how the app keeps a
   quote. A rigging kit's description from the price list is never the name a line goes by. */
const DESK_NEVER =
  /\b(price file|price levels?|re-priced|held|paired|pairs with|this browser|filed|colourway)\b|Mech Rigging Kit/i
const wordsOn = (element: HTMLElement): string[] => {
  const text = element.textContent ?? ''
  const desk = DESK_NEVER.exec(text)
  return [...engineWordsIn(text), ...(desk ? [desk[0]] : [])]
}

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
    const bare = fileAQuote('boat_stacer', '589 Rebel')
    expect(heroOfQuote(bare)).toBeNull()
    expect(copyOf(itemOfQuote(bare))).toBeNull()
    render(<Cascade quoteId={bare.id} fix={levelFix(otherRung(bare).key)} from="hull" />)
    expect(wordsOn(screen.getByTestId('cascade'))).toEqual([])
    expect(standing().getByText(/No photograph of this boat yet\./)).toBeInTheDocument()
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

  it('says each fate in a word with its glyph, and the price asked for in the headline alone', () => {
    const quote = fileAQuote('boat_highfield', 'SP560')
    const rung = otherRung(quote)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    for (const head of screen.getAllByRole('heading', { level: 2 })) {
      const verb = head.querySelector('.csc-cause__verb')!
      expect(verb.textContent?.trim().length).toBeGreaterThan(0)
      expect(verb.querySelector('svg')).not.toBeNull()
    }
    /* the headline names the price; no capsule beside it says it again (the refine round,
       2026-10-21, cascade at 1440) */
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(`At ${rung.label},`)
    expect(document.querySelector('[data-chosen]')).toBeNull()
  })

  it('names the gap a rigging kit’s code leaves for the cable length, and keeps every other character', () => {
    /* the price list's code "703-6Y82L-##-05" reached the dealer with the file's "##" in it.
       A kit whose code carries the gap is put on the quote from the build's own offer. */
    const filed = fileAQuote('boat_highfield', 'SP560')
    const ctx = ctxNow()
    const gapped = buildSteps(filed)
      .map((step) => ({
        step,
        candidate: stepOffer(ctx, filed, step.section, { all: true }).candidates.find((c) =>
          (c.line.code ?? '').includes('##'),
        ),
      }))
      .find((found) => found.candidate !== undefined)
    expect(gapped, 'the price list offers a kit whose code has a gap').toBeDefined()
    const added = quotes
      .getState()
      .apply(filed.id, addLine(gapped!.step.id, gapped!.candidate!.line))
    expect('refused' in added ? added.refused : '').toBe('')
    const quote = quotes.getState().get(filed.id)!
    expect(quote.lines.some((l) => (l.code ?? '').includes('##'))).toBe(true)
    const rung = otherRung(quote)
    const reading = readProposal(ctxNow(), quote, levelFix(rung.key))
    if (isRefused(reading)) throw new Error(reading.refused)
    render(<Cascade quoteId={quote.id} fix={levelFix(rung.key)} from="hull" />)
    for (const row of reading.proposal.causes.flatMap((c) => c.rows)) {
      if (row.code === '') continue
      const shown = [...document.querySelectorAll('.csc-row__code')].find(
        (el) =>
          (el.textContent ?? '').replace(/cable lengths?/u, '##') ===
          row.code.replace(/#{2,}(?:\/#{2,})*/u, '##'),
      )
      expect(shown, row.code).toBeDefined()
    }
    expect(document.querySelector('.csc-row__gap')).toHaveTextContent(/^cable lengths?$/)
    expect(screen.getByTestId('cascade')).not.toHaveTextContent('##')
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
    /* the total the act moved is the kit's price, on the build's card, and the change the foot
       keeps is too: each a `<data>` element, set once */
    const total = within(
      screen.getByRole('complementary', { name: 'The build this decision is about' }),
    ).getByText(money(quoteTotals(quotes.getState().get(quote.id)!).total))
    expect(total.tagName).toBe('DATA')
    expect(total.closest('.csc-done')).toBeNull()
    const change = within(screen.getByTestId('decision')).getByText(
      signedMoney(reading.proposal.cascade.delta),
    )
    expect(change.closest('data')).not.toBeNull()
    expect(change.closest('.csc-done')).toBeNull()
  })
})
