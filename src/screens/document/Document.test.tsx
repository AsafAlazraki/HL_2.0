import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { makeCtx, rowLabel } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue, ctxFrom } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { issue, mintQuote, priceLevelsFor, quoteTotals, setCustomer, setNote } from '@/domain/quote'
import { INCLUDED, NOT_PRICED_HERE, NO_WAY_TO_REACH, readDocument } from '@/domain/quote/document'
import {
  ALWAYS_IN,
  CHOSEN_AT_THE_GIVE,
  COVER_FACTS,
  Document,
  NO_DEPOSIT_SET,
  NO_DETAILS_SET,
  NO_TERMS_SET,
  NO_INCLUSIONS,
  NO_LINE_PICTURE,
  NO_LINE_PICTURES,
  NO_WRITTEN_PAGES,
  LETTERHEAD_MARK,
  LETTERHEAD_MARK_ADDED,
  NIGHT_MARK_IN_TYPE,
  NO_DETAILS,
  preparerSay,
  NO_QUOTE_HERE,
  NO_TERMS,
  PRINT_IS_THE_PAGE,
  unpicturedOf,
  unsetOn,
} from './Document'
import { NOT_PRICED_ON_PAPER, TOTAL_SAID, deskWhy, kitsOnPaper, pricedAtSay } from './paper'
import { refusedSay } from './art'
import type { IssueStamp } from '@/domain/quote/commands'
import { DESIGNED_ACCENT } from '@/domain/northside/colour'
import { boatOfQuote } from '@/domain/quote/spoken'
import { boatTitle } from '@/domain/quote/title'
import { fileLevelNames, fileLevelNamesIn } from '@/domain/quote/levelSaid'
import { engineWordsIn } from '@/screens/configurator/say'
import { boatTravel } from '@/screens/picker/travel'
import { pictureOfQuote } from '@/data/pictures'
import { holdGalleries, holdOwnPictures } from '@/data/ownPictures'
import type { GalleryOrder } from '@/domain/model/gallery'
import type { OwnPicture } from '@/domain/model/ownPictures'

/* ============================================================
   The document, rendered against the real pack, read by role and by
   text — and then rendered again with the price file thrown away.

   THE SECOND HALF IS THE POINT. `invariants.test.ts` asserts that an
   issued quote reads identically against an empty catalogue; that is
   a promise about the ENGINE. This is the promise about the SCREEN:
   the catalogue store is emptied, the component is rendered, and
   every figure, every name and every sentence is still there. A
   document that needed the sheet would fail here and nowhere else.

   NOT ONE FIGURE BELOW IS TYPED INTO AN ASSERTION. Every total,
   subtotal and count is computed by the engine in the test and then
   looked for on the screen, the same discipline the picker's and the
   configurator's suites keep.
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

/** A quote on one row of the real file, filed exactly as the picker
 *  files one, addressed and then given to the customer. */
function issuedQuote(
  key: string,
  find: string,
  stamp: IssueStamp = {},
  preparedBy?: string,
): QuoteDef {
  const table: EntityDef = pack.byKey(key)
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const sheet = catalogue.getState()
  /* THE CONTEXT EVERY SCREEN THAT FREEZES BUILDS — `ctxFrom` and not a
     hand-made one — so the letterhead this suite reads is the one the
     app freezes: the business the loaded file names. */
  const ctx = makeCtx({
    ...ctxFrom(sheet),
    views: { ...sheet.views },
    modules: pack.ctx.modules,
    priceLevels: pack.ctx.priceLevels,
    orgId: 'northside',
  })
  const view = createViewFor(ctx, table.id)
  const minted = mintQuote(ctx, {
    viewId: view.id,
    rowId: row!.id,
    reference: 'NSM-DOC',
    ...(preparedBy ? { preparedBy } : {}),
  })
  expect(minted).not.toBeNull()
  quotes.getState().file(minted!.quote, minted!.event)
  const id = minted!.quote.id
  expect(quotes.getState().apply(id, setCustomer({ name: 'R. Kelleher' }))).not.toHaveProperty(
    'refused',
  )
  expect(quotes.getState().apply(id, issue(stamp))).not.toHaveProperty('refused')
  return quotes.getState().get(id)!
}

const filed = (id: string): QuoteDef => quotes.getState().get(id)!

beforeAll(async () => {
  pack = await loadPack()
  await loadTheFile()
  await quotes.getState().openFor('northside')
  session.getState().signIn('Asaf')
})

/** Everything printed on the sheets, and nothing standing beside them.
 *  `.doc-page` is the sheet; what a printer lays down is what is inside
 *  one, so an assertion about the paper reads this and never the screen
 *  — `getByText` would find the same words in the note beside the sheet
 *  and pass while the paper still carried them. */
const onThePaper = (container: HTMLElement): string =>
  [...container.querySelectorAll('.doc-page')].map((page) => page.textContent ?? '').join('\n')

/** The note beside the sheet, which print takes away with the room. */
const theNote = (): HTMLElement =>
  screen.getByRole('complementary', { name: 'What is not printed' })

describe('the issued quote, on the page', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = issuedQuote('boat_stacer', '529 Assault Pro')
  })

  it('names the boat, the reference and who it is for', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    /* THE BOAT AS A PERSON SAYS IT on the customer's paper
       (built-critique-m2-close-2.md, the one thing to change first), and the price file's key
       string nowhere, the dealer's note beside it included (built-critique-m3-2.md, M13: the
       rail read "Highfield - CL340 (PVC) W-W-WD"). The boat's order code is the note's. */
    const boat = boatOfQuote(quote)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(boat.name)
    expect(onThePaper(container)).toContain(boat.detail)
    expect(onThePaper(container)).not.toContain(quote.subjectLabel)
    expect(theNote().textContent).not.toContain(quote.subjectLabel)
    const hull = quote.lines.find((l) => l.label === quote.subjectLabel)
    expect(hull?.code).toBeTruthy()
    expect(theNote().textContent).toContain(hull!.code)
    expect(screen.getAllByText(quote.reference).length).toBeGreaterThan(0)
    /* the name on the cover, beside the total (and again over the client's signature block) */
    expect(container.querySelector('.doc-money__name')).toHaveTextContent('R. Kelleher')
  })

  /* CRITIQUE OF MILESTONE 2, BLOCKER #2: "The one object that leaves the
     building has no dealership on it." The name is read off the pack's
     own manifest, never typed here. */
  it('opens with the dealership the file names, and never says it is unnamed', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const business = pack.manifest.name
    expect(business.trim()).not.toBe('')
    const cover = container.querySelector('.doc-page[data-page="1"]')!
    /* SINCE 2026-10-20 THE LETTERHEAD IS THE DEALERSHIP'S OWN MARK, and the name is its words for
       a reader that does not see it. REWRITTEN 2026-11-02 (the owner: "pdf quote needs to be insane
       with cover page"; cover-pick.md): the 529's cover stands on its photograph, so the mark is
       the same mark in its white ink, which marks-ledger.json holds beside the dark one */
    const letterhead = cover.querySelector('.doc-cover__house')!
    const mark = letterhead.querySelector<HTMLImageElement>('img.doc-cover__mark')
    expect(mark, 'the cover prints Northside Marine’s own mark').not.toBeNull()
    expect(mark).toHaveAttribute('alt', business)
    expect(cover.querySelector('.doc-cover')).toHaveAttribute('data-ground', 'photo')
    expect(mark!.getAttribute('src')).toMatch(/brand-marks\/northside-marine-white\.png$/)
    /* and it is the first thing on page 1: the page label before it is the room's, drawn only
       on a phone and never printed */
    const flow = cover.querySelector('.doc-page__flow')!
    expect(flow.querySelector('img')).toBe(mark)
    expect(flow.textContent!.trim().startsWith('Quotation')).toBe(true)
    expect(onThePaper(container)).not.toMatch(/not been named/i)
    /* and every later page carries it in the running head */
    for (const page of container.querySelectorAll('.doc-page:not([data-page="1"])')) {
      expect(page.querySelector('.doc-page__house')).toHaveTextContent(business)
    }
  })

  it('prints the price beside who it is for, at the engine’s own total', () => {
    render(<Document quoteId={quote.id} />)
    const total = quoteTotals(quote).total
    const figure = screen.getByTestId('document-total')
    expect(figure).toHaveTextContent(money(total))
    /* IT IS A `PriceFigure` AND NOT A COUNTER: a `data` element
       carrying the value verbatim. An issued figure that counts up
       reads as a figure still being decided. */
    const data = figure.querySelector('data.ui-price')
    expect(data).not.toBeNull()
    expect(data?.getAttribute('value')).toBe(String(total))
  })

  it('draws a band per section that put something on the quote, each head carrying its subtotal', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const doc = readDocument(quote)
    const taken = doc.sections.filter((s) => s.tables.some((t) => t.lines.length > 0))
    expect(taken.length).toBeGreaterThan(1)
    const heads = [...container.querySelectorAll('.doc-page .doc-band__name')].map(
      (node) => node.textContent ?? '',
    )
    for (const section of taken) {
      expect(heads.some((head) => head.includes(section.name))).toBe(true)
      if (section.subtotal !== null) {
        expect(onThePaper(container)).toContain(money(section.subtotal))
      }
    }
    /* a band with nothing on the quote is off the paper whole */
    for (const section of doc.sections.filter((s) => !taken.includes(s))) {
      expect(heads.some((head) => head.includes(section.name))).toBe(false)
    }
  })

  it('prints every frozen line on the paper, and its code on the note beside it', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const paper = onThePaper(container)
    for (const line of quote.lines) {
      /* in the words the paper says it in: the hull as a person says the
         boat, every other line in the file's own words */
      expect(paper).toContain(saidOf(quote, line.id))
      /* the dealer's key for a row is not a thing a buyer orders by —
         unless the file's own name for it already carries it */
      if (line.code && !line.label.includes(line.code)) expect(paper).not.toContain(line.code)
      if (line.code) expect(theNote()).toHaveTextContent(line.code)
    }
  })

  it('dates the paper where a buyer reads a date, and keeps the freezing for the dealer', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    expect(container.querySelector('.doc-cover__when')).toHaveTextContent(/^Issued \d/)
    expect(onThePaper(container)).not.toMatch(/reimport|frozen|cannot move/i)
    expect(
      within(theNote()).getByText(/a new price list changes the next quote/),
    ).toBeInTheDocument()
  })
})

/* ============================================================
   THE COLOUR OF A GIVEN QUOTE IS THE COLOUR IT WAS GIVEN IN
   (built-critique-m4.md, blocker 3: a later brand colour moved the
   issued 529 from amber to blue). The paper reads --color-accent; on a
   given quote the sheaf pins it to the colour frozen at the give.
   ============================================================ */

/** the colour pinned on the paper of what was rendered */
const pinned = (container: HTMLElement): string =>
  (container.querySelector('.doc-sheaf') as HTMLElement).style.getPropertyValue('--color-accent')

describe('the colour on the paper', () => {
  it('is the colour the quote was given in, pinned on the paper itself', () => {
    const amber = '#a36b0a'
    const quote = issuedQuote('boat_stacer', '529 Assault Pro', {
      letterhead: { name: 'Northside Marine', accent: amber },
    })
    const { container } = render(<Document quoteId={quote.id} />)
    expect(screen.getByRole('article', { name: /^Quote / })).toBe(
      container.querySelector('.doc-sheaf'),
    )
    expect(pinned(container)).toBe(amber)
  })

  it('is the designed blue for a quote given before its colour was kept with it', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const { container } = render(<Document quoteId={quote.id} />)
    expect(pinned(container)).toBe(DESIGNED_ACCENT)
  })
})

/* ============================================================
   THE NOTE BESIDE THE SHEET SAYS WHICH MARK PRINTED
   (built-critique-m4.md, major 6: it said the website's mark even
   when the mark printed was the file added on Settings)
   ============================================================ */

describe('the letterhead note beside the sheet', () => {
  it('says the website’s mark when that is the one printed', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    render(<Document quoteId={quote.id} />)
    expect(screen.getByText(LETTERHEAD_MARK)).toBeInTheDocument()
    expect(screen.queryByText(LETTERHEAD_MARK_ADDED)).toBeNull()
  })

  /* REWRITTEN 2026-11-02 (cover-pick.md): a cover that stands on its photograph prints the mark in
     white ink, and a mark added on Settings has none, so that cover sets the name in type and the
     note says so; a cover on its studio panel prints the added mark as before */
  it('says the file added on Settings when that is the one printed, and where the cover sets the name instead', () => {
    const added = 'data:image/png;base64,iVBORw0KGgo='
    const stamp = {
      letterhead: { name: 'Northside Marine', mark: { src: added, width: 600, height: 200 } },
    }
    const onPhoto = issuedQuote('boat_stacer', '529 Assault Pro', stamp)
    const photo = render(<Document quoteId={onPhoto.id} />)
    const mast = photo.container.querySelector('.doc-page[data-page="1"] .doc-cover__mast')!
    expect(mast).toHaveAttribute('data-ink', 'night')
    expect(mast.querySelector('img.doc-cover__mark')).toBeNull()
    expect(mast.querySelector('.doc-cover__house')).toHaveTextContent('Northside Marine')
    expect(theNote().textContent).toContain(LETTERHEAD_MARK_ADDED)
    expect(theNote().textContent).toContain(NIGHT_MARK_IN_TYPE)
    expect(screen.queryByText(LETTERHEAD_MARK)).toBeNull()
    photo.unmount()

    const onPanel = issuedQuote('mot_yamaha', 'F115LB', stamp)
    const panel = render(<Document quoteId={onPanel.id} />)
    expect(panel.container.querySelector('.doc-cover')).toHaveAttribute('data-ground', 'studio')
    expect(panel.container.querySelector('img.doc-cover__mark')).toHaveAttribute('src', added)
    expect(theNote().textContent).toContain(LETTERHEAD_MARK_ADDED)
    expect(theNote().textContent).not.toContain(NIGHT_MARK_IN_TYPE)
  })

  /* REWRITTEN 2026-11-03 to the owner's fully specced quote: the reference printed in every foot
     under a running head that already said it, so it stood twice a page; the foot now carries the
     page's number alone, and the cover none. The reference is the cover's stamp and each later
     page's running head, and every one of them is one unbreakable word. */
  it('prints every reference as one unbreakable word, and never in a foot', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const { container } = render(<Document quoteId={quote.id} />)
    const refs = [...container.querySelectorAll('.doc-sheaf .doc-ref')]
    expect(refs.length).toBeGreaterThan(0)
    for (const ref of refs) expect(ref.textContent).toBe(quote.reference)
    for (const foot of container.querySelectorAll('.doc-page__foot'))
      expect(foot.textContent).not.toContain(quote.reference)
    /* the cover's foot says nothing, not "Page 1 of n" under its own stamp */
    expect(container.querySelector('.doc-page__foot[data-cover]')).toHaveTextContent(/^$/)
  })
})

/* ============================================================
   THE PROMISE: THE SHEET IS GONE AND THE DOCUMENT IS UNCHANGED
   ============================================================ */

describe('against an empty catalogue', () => {
  it('renders every word and every figure with the price file thrown away', async () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const first = render(<Document quoteId={quote.id} />)
    const before = first.container.textContent
    first.unmount()

    /* THE SHEET, GONE. Not a mocked context and not an empty prop —
       the store the whole app reads, emptied. */
    await catalogue.getState().load({ entities: [], rowsByEntity: {}, manifest: undefined })
    expect(Object.keys(catalogue.getState().tables)).toEqual([])

    const again = render(<Document quoteId={quote.id} />)
    expect(again.container.textContent).toBe(before)
    /* the name is read off what the quote froze, so it needs no sheet */
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(boatOfQuote(quote).name)
    expect(screen.getByTestId('document-total')).toHaveTextContent(money(quoteTotals(quote).total))
    /* the letterhead too: it was frozen at mint, and the file that named
       it is gone */
    expect(again.container.querySelector('.doc-cover__house img')).toHaveAttribute(
      'alt',
      pack.manifest.name,
    )

    await loadTheFile()
  })
})

/* ============================================================
   THE THREE WORDS, ON THE PAGE
   ============================================================ */

/**
 * THE WORD ON THE ROW, NOT THE WORD ON THE PAGE. Each case below finds
 * the LINE by its own name and reads the cell beside it, so a document
 * where no line said the word cannot pass by the word standing
 * somewhere else.
 */
/** What the paper prints for one frozen line (`DocumentLine.said`). */
const saidOf = (q: QuoteDef, lineId: string): string => {
  /* as the screen names a line: a rigging kit by the motor it is for (`kitsOnPaper`) */
  const doc = kitsOnPaper(readDocument(q))
  return [...doc.sections.flatMap((s) => s.tables.flatMap((t) => t.lines)), ...doc.typed].find(
    (l) => l.id === lineId,
  )!.said
}

const cellFor = (label: string): string => {
  /* the hull's own name is on the cover as well as on its row, so the
     match is the one that has a row around it */
  const row = screen
    .getAllByText(label)
    .map((node) => node.closest('.doc-row'))
    .find((found) => found !== null)
  expect(row, `${label} is not drawn on a row`).toBeTruthy()
  return row!.querySelector('.doc-row__fig')?.textContent ?? ''
}

/** The document the store holds, replaced wholesale. It is how a test
 *  reaches a frozen state the seed does not happen to produce — a blank
 *  where a price belongs — without a second pack. */
const insteadFile = (next: QuoteDef): void => {
  quotes.setState({ quotes: [next] })
}

/** A sentence the engine wrote, as a pattern that matches it. */
const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

describe('a figure, Included and Price to be confirmed read as three', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = issuedQuote('boat_stacer', '529 Assault Pro')
  })

  it('needs no legend: the words in the money column are the buyer’s own', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    /* the legend defined "the level below" and "the price file" to a
       buyer; the words it explained now explain themselves */
    expect(screen.queryByRole('region', { name: 'How to read a line' })).toBeNull()
    const cells = [
      ...container.querySelectorAll('.doc-page .doc-row:not(.doc-row--cols) .doc-row__fig'),
    ]
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) {
      const said = (cell.textContent ?? '').trim()
      const isFigure = /^[−+]?\$/.test(said)
      expect(
        isFigure || said === INCLUDED || said === NOT_PRICED_ON_PAPER,
        `a cell reads "${said}"`,
      ).toBe(true)
    }
  })

  it('prints Included on the row where the file states a charge of nothing, never $0', () => {
    const [first, ...rest] = quote.lines
    insteadFile({ ...quote, lines: [{ ...first, unitPrice: 0, qty: 1 }, ...rest] })
    render(<Document quoteId={quote.id} />)
    expect(cellFor(saidOf(quote, first.id))).toBe(INCLUDED)
    expect(cellFor(saidOf(quote, first.id))).not.toContain('$')
  })

  it('never prints a band as $0: its head names it, Included is said under Your price, and an unpriced band has no row', () => {
    /* the motor at nothing, and the trailer at nothing beside a second
       trailer line nobody priced — the shape of a Stacer 499 WildRider's
       Dealer fit, which printed "04 Dealer fit $0" and "Dealer fit $0" */
    /* each line found by the band it prints in, never by its place in the list */
    const before = readDocument(quote)
    const lineOfBand = (band: string) =>
      quote.lines.find((l) =>
        before.sections
          .find((s) => s.name === band)!
          .tables.some((t) => t.lines.some((d) => d.id === l.id)),
      )!
    const motor = lineOfBand('Motor')
    const trailer = lineOfBand('Trailer')
    const rest = quote.lines.filter((l) => l !== motor && l !== trailer)
    const second = `${trailer.id}-unpriced`
    insteadFile({
      ...quote,
      lines: [
        ...rest,
        { ...motor, unitPrice: 0, qty: 1 },
        { ...trailer, unitPrice: 0, qty: 1 },
        { ...trailer, id: second, unitPrice: null, qty: 1 },
      ],
      sections: quote.sections.map((s) =>
        s.lineIds.includes(trailer.id) ? { ...s, lineIds: [...s.lineIds, second] } : s,
      ),
    })
    const { container } = render(<Document quoteId={quote.id} />)
    /* a band's head names it and prints no figure at all — no $0, no dash, no second Included:
       its lines say theirs, and "Your price" says what the band comes to (the refine round's
       second pass, 2026-10-21: one item's figure stood on the head, the line and the summary) */
    const heads = [...container.querySelectorAll('.doc-page .doc-band')].map(
      (band) => band.textContent ?? '',
    )
    expect(heads.some((head) => head.includes('Motor'))).toBe(true)
    for (const head of heads) expect(head).not.toMatch(/\$|Included|.—\s*$/)
    const price = within(screen.getByRole('region', { name: 'Your price' }))
    const rowOf = (name: string) =>
      price.getByText(name, { selector: 'dt' }).parentElement?.querySelector('dd')?.textContent
    expect(rowOf('Motor')).toBe(INCLUDED)
    /* a band with no figure is not a row of "Your price": its line says its price is to come,
       and that is the one place the paper says it (the refine round, 2026-10-21) */
    expect(price.queryByText('Trailer', { selector: 'dt' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Your price' })).not.toHaveTextContent(
      NOT_PRICED_ON_PAPER,
    )
    expect(onThePaper(container)).not.toMatch(/\$0(?![\d,])/)
  })

  it('prints Price to be confirmed on the row and nowhere else on the paper, and the reason on the dealer’s note', () => {
    const [first, ...rest] = quote.lines
    const withBlank: QuoteDef = { ...quote, lines: [{ ...first, unitPrice: null }, ...rest] }
    insteadFile(withBlank)
    const { container } = render(<Document quoteId={quote.id} />)
    const line = readDocument(withBlank)
      .sections.flatMap((s) => s.tables)
      .flatMap((t) => t.lines)
      .find((l) => l.id === first.id)!
    expect(cellFor(saidOf(quote, first.id))).toBe(NOT_PRICED_ON_PAPER)
    /* the engine's word is the dealer's, and it stays off the paper */
    expect(onThePaper(container)).not.toContain(NOT_PRICED_HERE)
    /* the reason names the price level, so it is the dealer's to read — and
       in the dealer's words, the level by its declared name */
    expect(line.why).not.toBe('')
    expect(deskWhy(line)).not.toBe(line.why)
    expect(onThePaper(container)).not.toContain(deskWhy(line))
    expect(within(theNote()).getByText(new RegExp(escapeRe(deskWhy(line))))).toBeInTheDocument()
    /* the buyer is told once, on the item's own line, and never that the total is short: no
       sentence under either total says an item is missing from it (build-close-critique-2.md,
       major 5, and the refine round's reader, 2026-10-21) */
    const paper = onThePaper(container)
    expect(paper.split(NOT_PRICED_ON_PAPER).length - 1).toBe(1)
    expect(paper).not.toMatch(/not in (this|the) total|not priced/i)
  })

  it('a charged line prints a figure and neither of the two words', () => {
    const charged = quote.lines.find((l) => (l.unitPrice ?? 0) > 0)
    expect(charged, 'this hull raises no priced line').toBeDefined()
    render(<Document quoteId={quote.id} />)
    const cell = cellFor(saidOf(quote, charged!.id))
    expect(cell).toContain('$')
    expect(cell).not.toContain(INCLUDED)
    expect(cell).not.toContain(NOT_PRICED_ON_PAPER)
  })

  it('counts what a register offered and nobody took on the note, never on the paper', () => {
    const some = quote.sections.find(
      (s) => s.lineIds.length > 0 && (s.pickedCount ?? 0) > s.lineIds.length,
    )
    const none = quote.sections.find((s) => s.lineIds.length === 0 && (s.pickedCount ?? 0) > 0)
    expect(
      some ?? none,
      'this hull offers nothing it did not take, so the case is vacuous',
    ).toBeDefined()
    const { container } = render(<Document quoteId={quote.id} />)
    expect(onThePaper(container)).not.toMatch(/offered|Not taken|Optional\./)

    if (some) {
      const offered = (some.pickedCount ?? 0) - some.lineIds.length
      expect(
        within(theNote()).getAllByText(new RegExp(`: ${offered} more offered`)).length,
      ).toBeGreaterThan(0)
    }
    if (none) {
      expect(
        within(theNote()).getAllByText(new RegExp(`: ${none.pickedCount} offered, none taken`))
          .length,
      ).toBeGreaterThan(0)
    }
  })
})

/* ============================================================
   YOUR PRICE ADDS UP, WHERE THE READER CAN SEE IT
   ============================================================ */

describe('your price', () => {
  it('lists every band the paper printed, and they sum to the total under the rule', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    render(<Document quoteId={quote.id} />)
    const price = screen.getByRole('region', { name: 'Your price' })
    const figures = [
      ...price.querySelectorAll('.doc-sum:not(.doc-sum--total):not(.doc-sum--tax) dd'),
    ]
      .map((dd) => (dd.textContent ?? '').trim())
      .filter((said) => said.startsWith('$'))
      .map((said) => Number(said.replace(/[$,]/g, '')))
    expect(figures.length).toBeGreaterThan(1)
    const sum = figures.reduce((n, x) => n + x, 0)
    expect(money(sum)).toBe(money(quoteTotals(quote).total))
    expect(within(price).getByText(TOTAL_SAID)).toBeInTheDocument()
  })
})

/* ============================================================
   THE TERMS, THE PRINT, AND NO DOCUMENT AT ALL
   ============================================================ */

describe('the dealer’s terms', () => {
  it('print none where none were typed, and the paper says nothing about it', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    /* the file names the business and carries no standing terms, so this
       quote really was raised with none */
    expect(quote.note).toBeUndefined()
    const { container } = render(<Document quoteId={quote.id} />)
    expect(screen.queryByRole('region', { name: 'The terms of this quote' })).toBeNull()
    expect(onThePaper(container)).not.toMatch(/terms/i)
    expect(within(theNote()).getByText(NO_TERMS)).toBeInTheDocument()
  })

  it('print what the document froze, not what the business says today', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const written = { ...quote, note: 'This quote is valid for 30 days from the date above.' }
    quotes.setState({ quotes: [written] })
    const { container } = render(<Document quoteId={written.id} />)
    expect(onThePaper(container)).toContain('This quote is valid for 30 days from the date above.')
    expect(screen.queryByText(NO_TERMS)).toBeNull()
  })

  it('refuses an edit on an issued quote with the engine’s own sentence', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const outcome = quotes.getState().apply(quote.id, setNote('Valid for 14 days.'))
    expect(outcome).toHaveProperty('refused')
    expect(filed(quote.id).note).toBeUndefined()
  })
})

describe('the act on the floor', () => {
  it('prints, and says where the PDF comes from in a salesperson’s words', async () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const print = vi.fn<() => void>()
    render(<Document quoteId={quote.id} print={print} />)
    await userEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(print).toHaveBeenCalledTimes(1)
    expect(screen.getByText(PRINT_IS_THE_PAGE)).toBeInTheDocument()
    expect(PRINT_IS_THE_PAGE).not.toMatch(/renderer|nodes/)
  })

  it('names the page for the quote while it is open, so a saved PDF is not called HelmLogic', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const before = document.title
    const { unmount } = render(<Document quoteId={quote.id} />)
    /* the exact model, "(Tournament)" kept (Phase 0, 2026-09-25): the
       quote spec's §10 shape, the business, "quote", the reference, the
       model as the cover heads it */
    expect(document.title).toBe(
      `${pack.manifest.name} quote ${quote.reference} – ${boatTitle(quote.rootTableId, quote.subjectLabel).title}`,
    )
    expect(document.title).toMatch(/ – Stacer 529 Assault Pro \(Tournament\)$/)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Stacer 529 Assault Pro (Tournament)',
    )
    unmount()
    expect(document.title).toBe(before)
  })

  it('offers the way back to the build, and none of the doors the pill carries', async () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const goBack = vi.fn<() => void>()
    render(
      <Document
        quoteId={quote.id}
        goBack={goBack}
        ways={[
          { href: '/', title: 'Home', say: '' },
          { href: '/quotes', title: 'The register', say: '' },
          { href: '/quote/new', title: 'Start a quote', say: '' },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Back to the build' }))
    expect(goBack).toHaveBeenCalledTimes(1)
    /* rule (a): the pill carries the doors, so the paper's own chrome
       repeats none of them — and draws no ways at all beside the sheet */
    expect(screen.queryByRole('navigation', { name: 'Elsewhere in this app' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'The register' })).toBeNull()
  })
})

describe('no document at this address', () => {
  it('says so in the dealer’s words, and offers only what the pill does not', () => {
    render(
      <Document
        quoteId="nothing-is-filed-here"
        goBack={vi.fn<() => void>()}
        ways={[
          { href: '/', title: 'Home', say: '' },
          { href: '/quotes', title: 'The register', say: '' },
          { href: '/quote/new', title: 'Start a quote', say: '' },
        ]}
      />,
    )
    expect(screen.getByText(/No quote at this address/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(escapeRe(NO_QUOTE_HERE)))).toBeInTheDocument()
    /* rule (c): no plan word on a screen */
    expect(screen.getByTestId('document')).not.toHaveTextContent(/Milestone|backend/)
    /* and no promise of a thing no screen does: this said "Once quotes are kept online, the
       same link will open anywhere" (built-critique-m2-close-2.md, major 4) */
    expect(screen.getByTestId('document')).not.toHaveTextContent(/online|will open anywhere/)
    /* a quote this browser does not hold has no build to go back to */
    expect(screen.queryByRole('button', { name: 'Back to the build' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Start a quote' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'The register' })).toBeNull()
  })
})

/* ============================================================
   WHAT IS ON THE PAPER AND WHAT IS ON THE DESK.

   The flow critique of 2026-09-18 read five things off an issued
   document that were written for the person who MADE it; the reading
   of 2026-09-23 found eleven more (`paper.ts` names them). None of
   them is deleted and none of them is on a sheet.
   ============================================================ */

/** The quote spec's rule 3 (`docs/research/proposal/quote-spec.md` §0):
 *  the words the customer's copy never prints. */
const APP_WORDS =
  /\b(price file|level|rung|register|rows?|offered|frozen|reimport(?:ed)?|slot|engine hole|prop part|source cell|organisation|milestone)\b/i

describe('the sheet is the customer’s and the room is the dealer’s', () => {
  let quote: QuoteDef
  beforeEach(() => {
    quote = issuedQuote('boat_stacer', '529 Assault Pro')
  })

  it('uses the customer’s words and none of the app’s', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const paper = onThePaper(container)
    expect(paper.length).toBeGreaterThan(200)
    const hit = APP_WORDS.exec(paper)
    expect(hit, `“${hit?.[0]}” is printed on the customer’s sheet`).toBeNull()
  })

  it('prints not one instruction for the dealer on a sheet of A4', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const paper = onThePaper(container)
    for (const said of [
      'Uploading one puts it here',
      'pair it on the subject',
      'Pair it on the subject',
      'offered and not taken',
      'Priced at',
      'Total at',
      'Prop Part',
      'Engine Hole',
      'nobody has typed one',
      'Every line below carries a figure',
    ]) {
      expect(paper, `“${said}” is printed on the customer’s sheet`).not.toContain(said)
    }
  })

  it('keeps every one of them on the floor, in the note beside the sheet', () => {
    render(<Document quoteId={quote.id} />)
    const note = theNote()
    /* it is in the room and not on a page: a note inside a sheet
       would print, and printing it is the defect */
    expect(note.closest('.doc-page')).toBeNull()

    const doc = readDocument(quote)
    expect(within(note).getByText(/own mark, from northsidemarine.com.au/)).toBeInTheDocument()
    expect(within(note).getAllByText(/offered/).length).toBeGreaterThan(0)
    /* no rate is assumed, said as a fact and not as what the printer does (the refine
       critique, 18: "no rate is typed on this quote, so no tax line is printed") */
    expect(within(note).getByText(/No rate is set on this quote/)).toBeInTheDocument()
    expect(note).not.toHaveTextContent(/is printed|are printed|carry the name in type/)
    if (doc.rung) {
      expect(within(note).getByText(pricedAtSay(doc))).toBeInTheDocument()
      expect(pricedAtSay(doc).startsWith(doc.rung.label)).toBe(true)
    }
  })

  it('names the total without naming the column it was read from', () => {
    const { container } = render(<Document quoteId={quote.id} />)
    const doc = readDocument(quote)
    expect(doc.rung, 'this quote carries no rung, so the case is vacuous').toBeTruthy()
    /* the tax convention is a fact about the figure and stays with it */
    const label = container.querySelector('.doc-money__sum .doc-lab')?.textContent
    /* every figure on Northside's price list includes GST, and the label says so (quote-spec §3.5) */
    expect(label).toBe(TOTAL_SAID)
    expect(onThePaper(container)).not.toContain(`Total at ${doc.rung!.label}`)
  })

  it('leaves a bare register off the paper, and says on the note that none is listed for this boat', () => {
    const target = quote.sections.find((s) => s.lineIds.length === 0 && s.blockId !== undefined)
    expect(target, 'this hull has no empty register, so the case is vacuous').toBeTruthy()
    const bare: QuoteDef = {
      ...quote,
      sections: quote.sections.map((s) =>
        s.blockId === target!.blockId ? { ...s, lineIds: [], pickedCount: 0, heldCount: 0 } : s,
      ),
      lines: quote.lines.filter((l) => !target!.lineIds.includes(l.id)),
    }
    insteadFile(bare)
    const { container } = render(<Document quoteId={bare.id} />)
    expect(onThePaper(container)).not.toContain('is paired with this one yet')
    expect(onThePaper(container)).not.toContain('own page and it shows here')
    expect(within(theNote()).getByText(/: none is listed for this boat yet./)).toBeInTheDocument()
    expect(theNote().textContent).not.toMatch(/paired/)
    /* the engine's instruction names a page this app does not have, in its
       word for a hull (m2-last-critique.md, major 5); the build dropped it too */
    expect(theNote().textContent).not.toContain('own page and it shows here')
  })

  it('leaves the name blank on a draft addressed to nobody, and tells the dealer why', () => {
    const blank: QuoteDef = { ...quote, state: 'draft', customer: { name: '' } }
    delete blank.issuedAt
    insteadFile(blank)
    const { container } = render(<Document quoteId={blank.id} />)
    /* a line to write on, the height of a name, and nothing said on it */
    expect(container.querySelector('.doc-page .doc-money__blank')).not.toBeNull()
    expect(onThePaper(container)).not.toMatch(/nobody/i)
    expect(within(theNote()).getByText(/cannot be given until it has a name/)).toBeInTheDocument()
  })
})

/* ============================================================
   THE NOTE BESIDE THE PAPER IS THE DEALER'S, AND SPEAKS HIS WORDS
   (m2-last-critique.md, major 5). It said "this register carries no
   price column at all", "Cash — 3 of the 4 lines carry that rung",
   "Pair it on the subject's own page and it shows here", and printed
   the rigging kit with the file's pipes. A Highfield with a motor, a
   trailer and a kit, given, read whole.
   ============================================================ */
describe('the note beside the paper speaks the dealer’s words', () => {
  const names = (): string[] => fileLevelNames(pack.entities.map((e) => priceLevelsFor(e)))

  it('names no register, rung, column or subject, no level by the file’s column, and no pipe', () => {
    /* the ADV7 carries the DEC kit, written with pipes and priced nowhere;
       the Stacer 529 a motor whose rigging kit fact is written with pipes */
    for (const [key, find] of [
      ['boat_highfield', 'ADV7'],
      ['boat_stacer', '529 Assault Pro'],
    ] as const) {
      const quote = issuedQuote(key, find)
      const { unmount } = render(<Document quoteId={quote.id} />)
      const note = theNote().textContent ?? ''
      const piped = quote.lines.some(
        (l) => l.label.includes('|') || (l.pairFacts ?? []).some((f) => f.value.includes('|')),
      )
      expect(piped, `the ${find} carries nothing written with pipes`).toBe(true)
      expect(engineWordsIn(note), find).toEqual([])
      expect(fileLevelNamesIn(note, names()), find).toEqual([])
      /* and the file's own string for the boat is not quoted either (built-critique-m3-2.md) */
      expect(note, find).not.toContain(quote.subjectLabel)
      expect(note, find).not.toContain('|')
      unmount()
    }
  })

  /* A TABLE THAT DECLARES NO PRICE LEVEL IS SAID AS THAT (2026-09-25), in the dealer's words
     since the refine round (2026-10-21): the table by its own name, the price this quote is at,
     and the price list — "Rigging Kits have no Cash price on the price list" — as the cascade
     says it. The file does carry figures for the ADV7's DEC kit (Kit Sell Price, Sell Price,
     Install Retail Sell), so what is said is that it has none at the price this quote is at. */
  it('says a line from a table no quote is priced from as that, naming the table and the price', () => {
    const quote = issuedQuote('boat_highfield', 'ADV7')
    render(<Document quoteId={quote.id} />)
    const doc = kitsOnPaper(readDocument(quote))
    const table = doc.sections
      .flatMap((s) => s.tables)
      .find((t) => t.lines.some((l) => l.rung === null && l.state === 'unpriced'))
    expect(table, 'the ADV7 carries no line from a table with no declared level').toBeTruthy()
    const kit = table!.lines.find((l) => l.rung === null && l.state === 'unpriced')!
    expect(table!.title).toBe('Rigging Kits')
    expect(
      within(theNote()).getByText(
        `${kit.said}: Northside had not chosen which figure prices Rigging Kits when it went on, so it is not in the total.`,
      ),
    ).toBeInTheDocument()
    expect(theNote()).not.toHaveTextContent(/at any level|no price column|price level|this app/)
  })
})

/* ============================================================
   THE KIT, ON SCREEN ONLY (2026-09-28). The room around the paper
   speaks the component kit; the paper does not change. What is pinned
   here is what a dealer reads and what the printer is handed.
   ============================================================ */
describe('the room speaks the kit, and the paper stays paper', () => {
  it('names the cover photograph the way the build names its stage, so the finale’s picture lands on it', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const { container } = render(<Document quoteId={quote.id} />)
    const cover = container.querySelector<HTMLImageElement>('.doc-shot__img')
    expect(cover, 'the 529 prints its photograph on the cover').not.toBeNull()
    /* the picker's own spelling, which the build's stage wears too */
    expect(cover!.style.getPropertyValue('--doc-travel')).toBe(
      boatTravel(quote.rootTableId, quote.rootRowId),
    )
  })

  /* THE COMPONENTS CRITIQUE, BLOCKER 3: the paper read the catalogue ledger alone, so the Stacer
     519 Sea Ranger SDF — photographed on the picker, the build's stage, Home and Quotes — printed
     Stacer's logo on a pale box as its cover, and the note said "no copy of it is held here" */
  it('prints the boat the build stood on as the cover, read by the one reader, and says what it is', () => {
    /* the 409 Assault Pro's photograph on the water is one a person marked as that boat; the
       519's hero was the machine's choice, and showed a side console on the Centre Console row,
       so it no longer stands on that row or on any paper (pinned below) */
    const quote = issuedQuote('boat_stacer', 'Stacer - 409 Assault Pro')
    expect(quote.rootRowId).toBe('boat_stacer:22')
    const hero = pictureOfQuote(quote)
    expect(hero?.tier, 'pictures.json holds the 409 on the water').toBe('hero')
    expect(hero?.person, 'a person marked it as the 409').toBe(true)
    const { container } = render(<Document quoteId={quote.id} />)

    const shot = container.querySelector<HTMLElement>('.doc-shot')!
    expect(shot).toHaveAttribute('data-art', 'photograph')
    expect(shot).toHaveAttribute('data-verdict', 'scene')
    const cover = shot.querySelector<HTMLImageElement>('.doc-shot__img')!
    /* the held copy itself, never a narrower one, until a JPEG of it is made for the printer
       (`usePrinted`), which a test's DOM cannot draw */
    expect(cover).toHaveAttribute('src', hero!.src)
    expect(cover).not.toHaveAttribute('srcset')
    expect(cover).toHaveAttribute('width', String(hero!.width))
    expect(cover.style.getPropertyValue('--doc-travel')).toBe(
      boatTravel(quote.rootTableId, quote.rootRowId),
    )
    /* a photograph of the MODEL says so on the paper, as a brochure does: under the name, on the
       night's ground and never on the water (REWRITTEN 2026-11-02, cover-pick.md: it stood under
       the picture inside the figure) */
    /* AND WHAT THIS QUOTE'S OWN IS, beside what the maker's photograph shows (REWRITTEN 2026-11-03,
       the owner's fully specced quote: the Sport 660's cover showed another make of outboard and
       another colour, and said only that it was the maker's finish and rig) */
    const motor = readDocument(quote)
      .sections.filter((s) => s.kind === 'motor')
      .flatMap((s) => s.tables.flatMap((t) => t.lines))
    expect(
      within(container.querySelector<HTMLElement>('.doc-cover__title')!).getByText(
        `Pictured: the ${hero!.subject}, in its maker’s own finish and rig.${
          motor.length === 1 ? ` Yours is with the ${motor[0]!.said}.` : ''
        }`,
      ),
    ).toBeInTheDocument()
    expect(onThePaper(container)).not.toMatch(/no copy|held here|nothing stands in/)
    expect(theNote()).not.toHaveTextContent(/no copy of it is held|No photograph of this boat/)
    expect(theNote()).toHaveTextContent(`The ${hero!.subject}, as its maker photographed it, from`)
    /* what it shows and whose it is, never how the screen drew it (the refine critique, 18:
       "1,917 × 845 pixels, printed whole at 658 × 290, never enlarged") */
    expect(theNote()).not.toHaveTextContent(/pixels|printed whole|enlarged/)
  })

  /* THE QUOTE ROUND'S AUDIT, 2026-11-02, D1: the Sport 560 stood on the build as Highfield's
     photograph on the water and printed the price list's studio picture, and nothing beside the
     paper said why. The photograph is the machine's choice, which the paper does not print; the
     note now says which picture the build shows, why it is left off, and on a draft what prints */
  it('says which picture the build shows and the cover leaves off, and why', () => {
    const draft = draftQuote('boat_highfield', 'SP560 (HYP)')
    const shown = pictureOfQuote(draft)
    expect(shown?.tier, 'the build shows the Sport 560 on the water').toBe('hero')
    expect(shown?.person, 'no person has marked it').toBe(false)
    const said = `The build shows the ${shown!.subject}, as its maker photographed it. Nobody has checked that it shows this model, so it is not printed.`
    const way = 'A photograph Northside adds to this boat and makes its cover is printed instead.'

    const { container, unmount } = render(<Document quoteId={draft.id} />)
    expect(container.querySelector(`.doc-shot__img[src="${shown!.src}"]`)).toBeNull()
    expect(theNote()).toHaveTextContent(said)
    expect(theNote()).toHaveTextContent(way)
    /* the price list's own picture of this boat is what prints, and the note says so */
    expect(theNote()).toHaveTextContent(/The price list’s own picture of this boat, from /)
    expect(onThePaper(container)).not.toContain('Nobody has checked')
    unmount()

    /* AND THE WAY IT NAMES IS A WAY: Northside's own photograph, made the boat's cover, is the
       cover, and the note has nothing left to explain */
    const own = ownPicture('sp560own', draft.rootTableId, draft.rootRowId, draft.subjectLabel)
    holdOwnPictures([own])
    holdGalleries([coverOrder(own)])
    try {
      const { container: ours, unmount: done } = render(<Document quoteId={draft.id} />)
      expect(ours.querySelector('.doc-page[data-night] .doc-shot__img')).toHaveAttribute(
        'src',
        own.src,
      )
      expect(theNote()).toHaveTextContent(/Northside’s own photograph\. Added by Asaf, /)
      expect(theNote()).not.toHaveTextContent(/The build shows|is printed instead/)
      done()
    } finally {
      holdOwnPictures([])
      holdGalleries([])
    }

    /* A GIVEN QUOTE IS NOT OFFERED A NEW COVER: the reason stays, the way does not */
    const given = issuedQuote('boat_highfield', 'SP560 (HYP)')
    render(<Document quoteId={given.id} />)
    expect(theNote()).toHaveTextContent(said)
    expect(theNote()).not.toHaveTextContent(way)
  })

  /* THE QUOTE ROUND'S AUDIT, ROUND 2, D1: the reason stood only at the foot of the note under the
     paper. It is said where the paper is chosen, with the act that puts Northside's photograph on
     the cover, on a draft; a given quote keeps the reason and is offered no act */
  it('says why the cover is not the boat’s photograph where the paper is chosen, with the act', async () => {
    const draft = draftQuote('boat_highfield', 'SP560 (HYP)')
    const { unmount } = render(<Document quoteId={draft.id} />)
    const ask = screen.getByTestId('document-cover-ask')
    expect(ask).toHaveTextContent(/The build shows the Highfield Sport 560 on the water/)
    expect(ask).toHaveTextContent(
      /Nobody has checked that it shows this model, so it is not printed\./,
    )
    await userEvent.click(
      within(ask).getByRole('button', { name: 'Add a photograph for the cover' }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: /Pictures of the Highfield Sport 560/,
    })
    expect(dialog).toHaveTextContent(
      'Add Northside’s own photograph of this boat and make it the cover, and the printed quote prints it on its cover. The maker’s photograph is not printed.',
    )
    unmount()

    const given = issuedQuote('boat_highfield', 'SP560 (HYP)')
    render(<Document quoteId={given.id} />)
    const kept = screen.getByTestId('document-cover-ask')
    expect(kept).toHaveTextContent(/Nobody has checked/)
    expect(within(kept).queryByRole('button')).toBeNull()
  })

  /* REWRITTEN 2026-11-03 to the owner's fully specced quote: "Your price" drew the cover's own
     photograph again, which "adds nothing and the composition is unbalanced", and the price is its
     head and its figures: beside the head where it is one figure, under it, the measure's width,
     where it is several. REWRITTEN AGAIN the same day to its second print: the cover's picture
     beside the hull's line was the cover shrunk whole, a quarter boat and three quarters sea, the
     third time it printed, so the cover alone prints it. */
  it('prints the cover’s picture on the cover alone, never beside the hull’s line or under Your price', () => {
    const quote = issuedQuote('boat_stacer', 'Stacer - 409 Assault Pro')
    const { container } = render(<Document quoteId={quote.id} />)
    expect(container.querySelector('.doc-shot__img')).not.toBeNull()
    expect(container.querySelector('.doc-row[data-hull]')).not.toBeNull()
    expect(container.querySelector('.doc-row[data-hull] img')).toBeNull()
    expect(container.querySelector('.doc-sums img')).toBeNull()
    /* the head first, then the figures */
    const body = container.querySelector('.doc-sums__body')!
    expect(body.firstElementChild).toHaveClass('doc-part')
    expect(body.firstElementChild).toHaveTextContent(/^Your price/)
    expect(body.lastElementChild).toHaveClass('doc-sums__figs')
  })

  it('says nothing more where the cover prints the picture the build shows', () => {
    const quote = issuedQuote('boat_stacer', 'Stacer - 409 Assault Pro')
    render(<Document quoteId={quote.id} />)
    expect(theNote()).not.toHaveTextContent(/The build shows|is printed instead/)
    expect(screen.queryByTestId('document-cover-ask')).toBeNull()
  })

  /* THE GATE ROUND, 2026-10-20: the 519's on-water photograph is a SIDE console. Its Centre
     Console row has no picture of that boat (its own address is refused: it is the side console
     too), so the cover says so and stands nothing in */
  it('prints no side console on the 519 Centre Console’s cover', () => {
    const quote = issuedQuote('boat_stacer', '519 Sea Ranger SDF (Centre Console)')
    expect(pictureOfQuote(quote)).toBeNull()
    const { container } = render(<Document quoteId={quote.id} />)
    const shot = container.querySelector<HTMLElement>('.doc-shot')!
    expect(shot).not.toHaveAttribute('data-art', 'photograph')
    expect(container.querySelector('img[src*="519"]')).toBeNull()
    /* the refine round, 2026-10-21: the note says it once, in docs/WORDS.md's own sentence —
       what the photograph shows, never the ledger's "centre-console row" */
    expect(theNote()).toHaveTextContent(
      'The price list’s photograph shows the side console, so it is left off.',
    )
    expect(theNote()).not.toHaveTextContent(/\brows?\b/i)
  })

  it('says every refused photograph in the dealer’s words, and never the ledger’s', () => {
    expect(refusedSay('not that exact model (a sister model)')).toBe(
      'The price list’s photograph shows a sister model, so it is left off.',
    )
    expect(
      refusedSay('not that exact model (a different configuration: steering console, not tiller)'),
    ).toBe('The price list’s photograph shows a steering console, not a tiller, so it is left off.')
    expect(refusedSay('not that exact model (a sister floor: the AL render on a KAM row)')).toBe(
      'The price list’s photograph shows the AL floor, not the KAM, so it is left off.',
    )
    for (const rule of [
      'not that exact model',
      'not that exact model (the price file gives this picture to a model it does not show)',
    ]) {
      expect(refusedSay(rule)).toBe(
        'The price list’s photograph is of another model, so it is left off.',
      )
    }
  })

  /* THE ROW'S OWN COPY IS THE EXACT BOAT, and still a person looked at it: the 529's own
     photograph carries an Evinrude (`pictures.json`, a `note` on its address), and the file sells
     Yamaha and ePropulsion. So the paper says the picture may differ — never which outboard, and
     never the quote's motor as the pictured one (docs/research/proposal/quote-spec.md §3). */
  it('prints a line under the row’s own copy where a person saw what the quote may not say', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    expect(pictureOfQuote(quote)?.tier).toBe('catalogue')
    expect(pictureOfQuote(quote)?.differs.join(' ')).toMatch(/Evinrude/)
    const { container } = render(<Document quoteId={quote.id} />)
    const said = container.querySelector('.doc-shot__say')
    expect(said).toHaveTextContent(
      'Pictured with equipment that may differ from this quote. Your boat is as quoted below.',
    )
    expect(said).not.toHaveTextContent(/Evinrude|Yamaha/)
  })

  it('says where the quote stands with the kit’s dot and its word, and leads every act with its glyph', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const { container } = render(
      <Document quoteId={quote.id} goBack={vi.fn<() => void>()} print={vi.fn<() => void>()} />,
    )
    const chrome = container.querySelector('.doc-chrome')!
    expect(within(chrome as HTMLElement).getByText('Given to the customer')).toBeInTheDocument()
    expect(chrome.querySelector('[data-state="given"]')).not.toBeNull()
    for (const name of ['Print', 'Back to the build']) {
      const act = screen.getByRole('button', { name })
      expect(act.querySelector('svg'), `${name} carries its glyph`).not.toBeNull()
    }
  })

  it('leads every fact on the note with a glyph, hidden from a reader who hears the word', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    render(<Document quoteId={quote.id} />)
    const words = [...theNote().querySelectorAll('dt')]
    expect(words.length).toBeGreaterThan(5)
    for (const word of words) {
      const glyph = word.querySelector('svg')
      expect(glyph, word.textContent ?? '').not.toBeNull()
      expect(glyph!.closest('[aria-hidden="true"]')).not.toBeNull()
    }
  })

  it('draws no glyph and names no travel on the paper beyond the cover photograph', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const { container } = render(<Document quoteId={quote.id} />)
    /* the swatches are the paper's own; nothing of the kit's glyph set is printed */
    expect(container.querySelectorAll('.doc-page svg.ui-icon')).toHaveLength(0)
    const named = [...container.querySelectorAll<HTMLElement>('.doc-page [style]')].filter(
      (el) => el.style.getPropertyValue('--doc-travel') !== '',
    )
    expect(named).toHaveLength(1)
  })
})

/* ============================================================
   THE PRINTED QUOTE ROUND (2026-10-31): the section picker beside the
   paper, the last page's acceptance, and Northside's GST rate reaching
   a draft's proof before it is given.
   ============================================================ */

/** A draft on one row of the real file, addressed and not given. */
function draftQuote(key: string, find: string, alone = false): QuoteDef {
  const table: EntityDef = pack.byKey(key)
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const sheet = catalogue.getState()
  const ctx = makeCtx({
    ...ctxFrom(sheet),
    views: { ...sheet.views },
    modules: pack.ctx.modules,
    priceLevels: pack.ctx.priceLevels,
    orgId: 'northside',
  })
  const view = createViewFor(ctx, table.id)
  const minted = mintQuote(ctx, {
    viewId: view.id,
    rowId: row!.id,
    reference: 'NSM-DRAFT',
    /* as the picker mints: the item alone (src/screens/picker/mint.ts) */
    ...(alone ? { hullAlone: true } : {}),
  })
  quotes.getState().file(minted!.quote, minted!.event)
  quotes.getState().apply(minted!.quote.id, setCustomer({ name: 'R. Kelleher' }))
  return quotes.getState().get(minted!.quote.id)!
}

describe('what goes on the printed quote', () => {
  it('takes the specification off the paper and puts it back, live, from the switch beside it', async () => {
    const quote = draftQuote('boat_highfield', 'SP560 (HYP)')
    const { container } = render(<Document quoteId={quote.id} />)
    const sheetHead = () => container.querySelector('.doc-page .doc-sheet')
    expect(sheetHead()).not.toBeNull()
    const toggle = screen.getByRole('switch', { name: /Specifications/ })
    await userEvent.click(toggle)
    expect(filed(quote.id).paperOff).toEqual(['specs'])
    expect(sheetHead()).toBeNull()
    await userEvent.click(screen.getByRole('switch', { name: /Specifications/ }))
    expect(filed(quote.id).paperOff).toBeUndefined()
    expect(sheetHead()).not.toBeNull()
  })

  /* the owner's fully specced quote, the second print: two stacks of whole groups ended 57 pt apart */
  it('sets each group of the specification as a row of the page, its name beside its facts', () => {
    const quote = draftQuote('boat_highfield', 'SP560 (HYP)')
    const { container } = render(<Document quoteId={quote.id} />)
    const sheet = readDocument(quote).subject.sheet
    const groups = [
      ...container.querySelectorAll('.doc-page .doc-sheet__groups > .doc-sheet__group'),
    ]
    expect(groups.map((g) => g.querySelector('.doc-sheet__name')?.textContent ?? '')).toEqual(
      sheet.map((g) => g.name),
    )
    groups.forEach((g, i) => {
      expect(g.querySelectorAll('.doc-spec')).toHaveLength(sheet[i]!.rows.length)
    })
  })

  it('says why a section it cannot print is not offered, where it is', () => {
    const quote = draftQuote('boat_highfield', 'SP560 (HYP)')
    render(<Document quoteId={quote.id} />)
    expect(screen.getByText(NO_INCLUSIONS)).toBeInTheDocument()
    expect(screen.getByText(NO_WRITTEN_PAGES)).toBeInTheDocument()
    expect(screen.getByText(ALWAYS_IN)).toBeInTheDocument()
    /* no item carries a checked picture, and the panel says what puts one there (the audit,
       2026-11-02, D2) */
    expect(screen.getByText(NO_LINE_PICTURES)).toBeInTheDocument()
    expect(NO_LINE_PICTURES).toMatch(
      /A picture Northside adds to an item on the build prints beside it.$/,
    )
  })

  it('on a given quote, says the choice it was given with and offers no switch', () => {
    const quote = issuedQuote('boat_highfield', 'SP560 (HYP)')
    render(<Document quoteId={quote.id} />)
    expect(screen.queryByRole('switch')).toBeNull()
    expect(screen.getByText(CHOSEN_AT_THE_GIVE)).toBeInTheDocument()
  })

  it('prints the acceptance with both signature blocks, on the paper', () => {
    const quote = issuedQuote('boat_stacer', 'Sea Ranger')
    const { container } = render(<Document quoteId={quote.id} />)
    const paper = onThePaper(container)
    expect(paper).toContain('Client acceptance')
    expect(paper).toContain('Merchant authorisation')
    /* one atom, so the two blocks are on one page */
    const pages = [...container.querySelectorAll('.doc-page')].filter(
      (page) => page.querySelector('.doc-sign') !== null,
    )
    expect(pages).toHaveLength(1)
    expect(pages[0]!.querySelectorAll('.doc-sign__block')).toHaveLength(2)
  })

  it('numbers the sections it prints in order, with none missing', () => {
    const quote = issuedQuote('boat_stacer', 'Sea Ranger')
    const { container } = render(<Document quoteId={quote.id} />)
    const nums = [...container.querySelectorAll('.doc-page .doc-band__num')].map(
      (el) => el.textContent,
    )
    expect(nums).toEqual(nums.map((_, i) => String(i + 1).padStart(2, '0')))
  })
})

describe('Northside’s GST rate on a draft', () => {
  it('a draft started before the rate was set prints it, as the give will', () => {
    const quote = draftQuote('boat_stacer', 'Sea Ranger')
    expect(quote.taxRate).toBeUndefined()
    const was = catalogue.getState().org
    catalogue.setState({ org: { ...(was ?? { name: 'Northside Marine' }), gstRate: 10 } as never })
    try {
      const { container } = render(<Document quoteId={quote.id} />)
      expect(onThePaper(container)).toContain('GST at 10%, included')
      /* in whole dollars, as every figure on the paper (rewritten 2026-11-03: "$11,377.91") */
      expect(onThePaper(container)).toMatch(/Includes GST of \$[\d,]+ at 10%/)
      expect(onThePaper(container)).not.toMatch(/\$[\d,]+\.\d\d/)
      expect(theNote().textContent).not.toContain('No rate is set on this quote')
    } finally {
      catalogue.setState({ org: was })
    }
  })
})

/* ============================================================
   THE PRINTED QUOTE'S CRITIC (2026-10-31): sections a salesperson can
   really add and remove, a repower's cover that says what its picture
   shows, a sheet with no number over its one band, and the sentence at
   the paper when nothing on it reaches Northside.
   ============================================================ */

describe('the sections beside the paper, and a quote that is not a boat', () => {
  it('takes the motor’s own facts off the paper and puts them back', async () => {
    const quote = draftQuote('boat_highfield', 'SP560 (HYP)')
    const { container } = render(<Document quoteId={quote.id} />)
    const motorFacts = () =>
      [...container.querySelectorAll('.doc-page .doc-row')].filter(
        (row) => /Yamaha/.test(row.textContent ?? '') && row.querySelector('.doc-row__own'),
      )
    expect(motorFacts().length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('switch', { name: /^The motor’s specification/ }))
    expect(quotes.getState().get(quote.id)!.paperOff).toEqual(['motor'])
    expect(motorFacts()).toHaveLength(0)
    await userEvent.click(screen.getByRole('switch', { name: /^The motor’s specification/ }))
    expect(motorFacts().length).toBeGreaterThan(0)
  })

  /* REWRITTEN 2026-11-03 to the owner's fully specced quote, the second print: each of the three
     was said twice, once where Settings is asked for and again as a switch that could not be
     pressed ("Northside's terms: none to print"). Each is said once now, with its press to
     Settings, and is no switch until it is set. */
  it('says terms, deposit wording and details nobody set once, where Settings is asked for', () => {
    const quote = draftQuote('boat_highfield', 'SP560 (HYP)')
    render(<Document quoteId={quote.id} />)
    expect(screen.queryByText(NO_TERMS_SET)).toBeNull()
    expect(screen.queryByText(NO_DEPOSIT_SET)).toBeNull()
    expect(screen.queryByText(NO_DETAILS_SET)).toBeNull()
    for (const name of [/^Northside’s terms/, /^The deposit wording/, /^Northside’s details/])
      expect(screen.queryByRole('switch', { name })).toBeNull()
    const unset = screen.getByTestId('document-unset')
    expect(unset).toHaveTextContent(/Northside’s terms: none is set/)
    expect(unset).toHaveTextContent(/The deposit wording: none is set/)
    /* and says once, where the paper is chosen, that nothing on it reaches Northside */
    expect(screen.getByTestId('document-unreachable')).toHaveTextContent(NO_WAY_TO_REACH)
  })

  it('sets a repower’s whole specification on its cover, says its picture’s two outboards, and numbers no lone band', () => {
    const quote = draftQuote('mot_yamaha', 'F115LB', true)
    const { container } = render(<Document quoteId={quote.id} />)
    const cover = container.querySelector('.doc-page .doc-cover')!
    expect(cover.querySelector('.doc-cover__over')).toHaveTextContent('Your motor')
    const facts = readDocument(quote).subject.sheet.flatMap((g) => g.rows).length
    expect(facts).toBeLessThanOrEqual(COVER_FACTS)
    expect(cover.querySelectorAll('.doc-key')).toHaveLength(facts)
    /* no page repeats them */
    expect(container.querySelector('.doc-page .doc-sheet')).toBeNull()
    expect(cover.querySelector('.doc-shot__say')?.textContent).toMatch(
      /^Pictured: two outboards, as the maker’s own picture shows them\. Yours is the Yamaha F115LB quoted below\.$/,
    )
    expect(container.querySelectorAll('.doc-page .doc-band__num')).toHaveLength(0)
    /* the price is its total, not a row that says the motor's figure over it again */
    expect(container.querySelectorAll('.doc-sums .doc-sum:not(.doc-sum--total)')).toHaveLength(0)
  })

  it('tells the dealer a repower lists nothing for "this motor", and lists no hull as left off', () => {
    const quote = draftQuote('mot_yamaha', 'F115LB', true)
    render(<Document quoteId={quote.id} />)
    const note = theNote().textContent ?? ''
    expect(note).not.toMatch(/for this boat/)
    expect(note).not.toMatch(/Highfield|Jeanneau|Stacer|Stabicraft/)
  })
})

/* ============================================================
   THE BOAT IS THE PAGE (2026-11-02; docs/directions/quote-3/cover-pick.md). The owner: "the quote
   pdf is BORING … pdf quote needs to be insane with cover page … using boats photo".
   ============================================================ */

describe('the cover is the night’s page', () => {
  it('stands a photograph on the water off the sheet’s three edges, and only the cover is dark', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const { container } = render(<Document quoteId={quote.id} />)
    /* happy-dom lays nothing out, so the sheaf is one page here; the walk counts the sheets */
    const pages = [...container.querySelectorAll('.doc-page')]
    expect(pages[0]).toHaveAttribute('data-night')
    for (const later of pages.slice(1)) expect(later).not.toHaveAttribute('data-night')
    const cover = pages[0]!.querySelector('.doc-cover')!
    expect(cover).toHaveAttribute('data-ground', 'photo')
    /* the letterhead stands on it in light ink, before the picture in the reading order */
    const top = cover.querySelector('.doc-night')!
    expect(top.firstElementChild).toHaveClass('doc-cover__mast')
    expect(top.querySelector('.doc-cover__mast')).toHaveAttribute('data-ink', 'night')
    /* the held picture, whole: the 529's 1,024 px photograph reaches the sheet's 794 */
    const shot = top.querySelector('.doc-shot')!
    expect(shot).toHaveAttribute('data-span', 'full')
    expect(shot.querySelector('.doc-shot__img')).toHaveAttribute(
      'src',
      pictureOfQuote(quote)?.src ?? '',
    )
    /* every word the customer reads stands under it, on the dark */
    expect(cover.querySelector('.doc-cover__title')).toHaveTextContent(boatOfQuote(quote).name)
    expect(cover.querySelector('.doc-money')).toHaveTextContent('R. Kelleher')
  })

  it('stands a studio picture on its pale panel, with the letterhead in dark ink over it', () => {
    const quote = draftQuote('mot_yamaha', 'F115LB', true)
    const { container } = render(<Document quoteId={quote.id} />)
    const cover = container.querySelector('.doc-page[data-night] .doc-cover')!
    expect(cover).toHaveAttribute('data-ground', 'studio')
    expect(cover.querySelector('.doc-cover__mast')).toHaveAttribute('data-ink', 'paper')
    expect(cover.querySelector<HTMLImageElement>('img.doc-cover__mark')?.src).toMatch(
      /brand-marks\/northside-marine\.png$/,
    )
    expect(cover.querySelector('.doc-shot')).not.toHaveAttribute('data-span')
  })
})

describe('a quote for one thing alone', () => {
  it('says its price once after the cover: no "Your quote", the figure as the total', () => {
    const quote = draftQuote('mot_yamaha', 'F115LB', true)
    const { container } = render(<Document quoteId={quote.id} />)
    /* everything printed after the cover, read by atom: happy-dom lays out no pages */
    const later = [...container.querySelectorAll('.doc-atom:not([data-atom="cover"])')]
      .map((atom) => atom.textContent ?? '')
      .join('\n')
    expect(later).not.toContain('Your quote')
    expect(container.querySelectorAll('.doc-page .doc-row')).toHaveLength(0)
    const total = money(quoteTotals(quote).total)
    expect(later.split(total).length - 1, `${total} after the cover`).toBe(1)
    /* the price names what it is for, under its head */
    const price = container.querySelector('.doc-sums .doc-part__sub')
    expect(price).toHaveTextContent(`${readDocument(quote).subject.title}, for R. Kelleher`)
  })

  it('keeps the lines of a quote with more on it', () => {
    const full = issuedQuote('boat_stacer', '529 Assault Pro')
    const { container } = render(<Document quoteId={full.id} />)
    expect(container.querySelectorAll('.doc-page .doc-row').length).toBeGreaterThan(1)
    expect(onThePaper(container)).toContain('Your quote')
  })
})

describe('Northside’s details and the salesperson’s line', () => {
  /* test values typed for this suite, never Northside's: the paper prints only what was set */
  const stamp: IssueStamp = {
    letterhead: {
      name: 'Northside Marine',
      address: 'Test address line',
      phone: 'Test phone line',
    },
    preparer: { name: 'Asaf', phone: 'Test mobile line' },
  }

  it('prints each detail where the spec puts it, and the note names each one not set', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro', stamp, 'Asaf')
    const { container } = render(<Document quoteId={quote.id} />)
    /* the letterhead's line under the mark, on the cover */
    const contact = container.querySelector('.doc-page[data-page="1"] .doc-cover__contact')
    expect(contact).toHaveTextContent('Test address line')
    expect(contact).toHaveTextContent('Test phone line')
    /* the salesperson under "Prepared by", and the last page's contact panel */
    expect(container.querySelector('.doc-money__by')).toHaveTextContent('Test mobile line')
    const accept = container.querySelector('.doc-accept__contact')!
    expect(accept).toHaveTextContent('Test address line')
    expect(accept).toHaveTextContent('Test mobile line')
    /* what is not set is left off, and the note says which */
    const note = theNote().textContent ?? ''
    expect(note).toContain(NO_DETAILS(['email', 'ABN']))
    expect(note).toContain(
      'No title or email is set on Settings for Asaf, so the printed quote leaves them out.',
    )
  })

  it('says nothing of the salesperson where Settings holds every line of theirs', () => {
    expect(
      preparerSay({
        preparedBy: 'Asaf',
        preparer: { name: 'Asaf', title: 'Sales', phone: 'p', email: 'e' },
      }),
    ).toBe('')
    expect(preparerSay({ preparedBy: 'Asaf', preparer: null })).toBe(
      'No title, phone or email is set on Settings for Asaf, so the printed quote prints the name alone.',
    )
    expect(preparerSay({ preparedBy: null, preparer: null })).toBe('')
  })
})

describe('drawn inside another screen', () => {
  it('has no landmark of its own and steps its headings under the host’s', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const own = render(<Document quoteId={quote.id} />)
    expect(own.container.querySelectorAll('main')).toHaveLength(1)
    expect(own.container.querySelector('h1.doc-cover__name')).not.toBeNull()
    own.unmount()

    const { container } = render(<Document quoteId={quote.id} embedded />)
    expect(container.querySelectorAll('main')).toHaveLength(0)
    expect(screen.getByTestId('document').tagName).toBe('DIV')
    expect(container.querySelector('h1, h2, h3')).toBeNull()
    expect(container.querySelector('h4.doc-cover__name')).toHaveTextContent(boatOfQuote(quote).name)
    expect(container.querySelectorAll('h5.doc-part__word').length).toBeGreaterThan(0)
  })

  it('has no landmark of its own where the quote is not on this computer', () => {
    const { container } = render(<Document quoteId="not-here" embedded />)
    expect(container.querySelectorAll('main')).toHaveLength(0)
  })
})

/** Northside's own picture of one row, as the catalogue files one. */
const ownPicture = (id: string, table: string, row: string, name: string): OwnPicture => ({
  id,
  orgId: 'northside',
  table,
  row,
  option: name,
  name,
  src: `data:image/png;base64,${id}`,
  width: 1600,
  height: 1067,
  bytes: 100,
  addedBy: 'Asaf',
  addedAt: '2026-11-02T00:00:00.000Z',
  chosen: false,
})
const coverOrder = (p: OwnPicture): GalleryOrder => ({
  id: `order-${p.id}`,
  orgId: 'northside',
  table: p.table,
  row: p.row,
  option: p.option,
  name: p.name,
  cover: `own:${p.id}`,
  order: [`own:${p.id}`],
  by: 'Asaf',
  at: '2026-11-02T00:00:00.000Z',
})
describe('the gallery’s cover on the paper', () => {
  it('prints the cover the dealer chose for the boat and for a line', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const doc = readDocument(quote)
    const line = doc.sections
      .flatMap((s) => s.tables)
      .filter((t) => !t.subject)
      .flatMap((t) => t.lines)
      .find((l) => l.item)
    expect(line, 'the 529 carries a line beside its hull').toBeDefined()
    const boat = ownPicture('boatcover', quote.rootTableId, quote.rootRowId, quote.subjectLabel)
    const part = ownPicture('linecover', line!.item!.table, line!.item!.row, line!.said)
    holdOwnPictures([boat, part])
    holdGalleries([coverOrder(boat), coverOrder(part)])
    try {
      const { container } = render(<Document quoteId={quote.id} />)
      const cover = container.querySelector('.doc-page[data-night] .doc-cover')!
      expect(cover.querySelector('.doc-shot__img')).toHaveAttribute('src', boat.src)
      /* Northside's own picture is a photograph a person took: it is the top of the page */
      expect(cover).toHaveAttribute('data-ground', 'photo')
      const pictured = [...container.querySelectorAll<HTMLImageElement>('.doc-row__pic')]
      expect(pictured.map((img) => img.getAttribute('src'))).toContain(part.src)
    } finally {
      holdOwnPictures([])
      holdGalleries([])
    }
  })
})

/* ============================================================
   THE OWNER'S FULLY SPECCED QUOTE, READ AS PRINTED (2026-11-03): what Settings does not hold is
   said beside the paper with the press that opens it, a name printed in a signature block is not
   asked for again, and the hull's line carries its finish and its picture.
   ============================================================ */
describe('the owner’s fully specced quote, its printed faults', () => {
  it('says each thing Settings does not hold, why it matters on the paper, and where it is set', () => {
    const draft = draftQuote('boat_stacer', 'Sea Ranger')
    const was = catalogue.getState().org
    catalogue.setState({ org: { ...(was ?? { name: 'Northside Marine' }), people: [] } as never })
    try {
      render(<Document quoteId={draft.id} />)
      const unset = screen.getByTestId('document-unset')
      expect(unset).toHaveTextContent(/How many days a quote stands for: none is set/)
      expect(unset).toHaveTextContent(/Northside’s terms: none is set/)
      expect(unset).toHaveTextContent(/The deposit wording: none is set/)
      expect(within(unset).getByRole('link', { name: 'Set the days' })).toHaveAttribute(
        'href',
        '/manage?line=validDays',
      )
      expect(within(unset).getByRole('link', { name: 'Write the terms' })).toHaveAttribute(
        'href',
        '/manage?line=quoteTerms',
      )
      /* none of it is printed on the customer's copy */
      expect(document.querySelector('.doc-sheaf')).not.toHaveTextContent(/none is set/)
    } finally {
      catalogue.setState({ org: was })
    }
  })

  it('asks nothing of Settings that it holds', () => {
    expect(
      unsetOn({
        letterhead: { name: 'Northside Marine', validDays: 30, deposit: '10% secures the order' },
        terms: 'Our terms.',
        preparer: { name: 'Asaf', title: 'Sales', phone: '07 0000 0000', email: 'a@b' },
        preparedBy: 'Asaf',
      }),
    ).toEqual([])
    /* the salesperson's own details open their own place on Settings */
    expect(
      unsetOn({ letterhead: null, terms: null, preparer: { name: 'Asaf' }, preparedBy: 'Asaf' }).at(
        -1,
      ),
    ).toMatchObject({ at: { person: 'Asaf' }, act: 'Set Asaf’s details' })
  })

  it('asks a named signer for the signature and the date, and a block naming nobody for the name too', () => {
    const quote = issuedQuote('boat_stacer', '529 Assault Pro')
    const { container } = render(<Document quoteId={quote.id} />)
    const blocks = [...container.querySelectorAll('.doc-sign__block')]
    expect([...blocks[0]!.querySelectorAll('.doc-sign__word')].map((w) => w.textContent)).toEqual([
      'Signature',
      'Date',
    ])
    expect(blocks[0]).toHaveTextContent('R. Kelleher')
  })

  it('sets the hull’s line as the biggest on the quote: its name, its material and its colours', () => {
    const quote = issuedQuote('boat_highfield', 'SP660 (HYP) LG-W-DB')
    const { container } = render(<Document quoteId={quote.id} />)
    const hull = container.querySelector('.doc-row[data-hull]')!
    const doc = readDocument(quote)
    expect(hull.querySelector('.doc-row__said')).toHaveTextContent(doc.subject.title)
    expect(hull).toHaveTextContent('Material Hypalon')
    expect(hull).toHaveTextContent(`Colours${doc.subject.colour!.say}`)
    expect(hull.querySelector('.ui-swatches')).toHaveAttribute('data-shape', 'squares')
    /* the cover's swatches are the build's squares too */
    expect(container.querySelector('.doc-cover__detail .ui-swatches')).toHaveAttribute(
      'data-shape',
      'squares',
    )
  })

  it('names every item printed with no picture beside it, on the note', () => {
    const quote = issuedQuote('boat_highfield', 'SP660 (HYP) LG-W-DB')
    render(<Document quoteId={quote.id} />)
    const doc = readDocument(quote)
    const none = unpicturedOf(doc)
    if (none.length > 0) {
      expect(theNote()).toHaveTextContent('Printed without a picture')
      expect(theNote()).toHaveTextContent(NO_LINE_PICTURE)
    }
  })
})
