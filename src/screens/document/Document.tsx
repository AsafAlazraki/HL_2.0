import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Button, PriceFigure } from '@/ui'
import { useQuotes } from '@/app/useStores'
import { money } from '@/domain/money'
import { signedMoney } from '@/domain/quote'
import { localDay } from '@/domain/quote/day'
import {
  HOW_TO_READ,
  INCLUDED,
  OPTIONAL,
  readDocument,
  type DocumentLine,
  type DocumentTable,
  type PrintedQuote,
} from '@/domain/quote/document'
import type { QuoteDef } from '@/domain/model'
import { NO_WAYS, type Way } from '@/app/ways'
import { coverArt, hostOf, type CoverArt } from './art'
import { paginate, type Atom } from './paginate'
import './document.css'

/* ============================================================
   THE DOCUMENT — "The sheet, at true size", direction A of
   docs/research/refs/document/notes.md §5.

   THE OWNER HANDED THE PICKS OVER, so the direction is chosen here
   and the screen is PROVISIONAL in docs/SCREENS.md until he has
   looked at it.

   WHY A AND NOT THE OTHER THREE. The requirement on this screen is
   not "show the quote", it is "screen and paper cannot be allowed to
   disagree" — and A is the only direction where that is STRUCTURAL
   rather than promised. The A4 page is the object on screen, at 1:1
   where the window allows, on the dark floor the rest of this app is
   drawn in; print is the same nodes with the floor taken away. B
   ("the rail and the record") is the configurator's own shape a
   second time and would have made the document a second editor; C
   ("the ledger") is the register's shape a second time, and the owner
   has called that a database twice; D ("the brochure") puts money
   last, which loses "the price beside who it is for" — and it must
   survive a render, which Highfield's 115 held catalogue pictures
   cannot supply a scene for.

   THE TWO FRAMES NO EARLIER BOARD USED. `live/pagedjs-home.png` —
   crop marks in the corners and the site set inside a page box, the
   only frame in the sweep where the PAGE is the object and not the
   viewport — and `live/saxdor-brochure-pdf.png` with its
   `-specs-crop`, a marine A4 through a viewer: white sheets on a grey
   floor, hairline spec rows at about 55% of the measure, the lower
   third of a page left white. Entry leaned on Riviera, Zodiac and
   Lucid; Home on Rapha, Sotheby's and Hagerty; the picker on Williams
   and Surtees; the configurator on Porsche's search panel and
   PCPartPicker.

   WHAT ONLY THIS SCREEN DOES: it is the only one whose output is a
   physical object. Everything else in this app is read on glass.

   ── WHAT IS TRUE HERE AND IS NOT TRUE ON A FRAME ──────────────

   · THERE IS NO SECOND RENDERER. Porsche's PDF is a different
     program from Porsche's summary screen, and the sweep MEASURED
     the cost of that: the same `Basic equipment` chip is mid green on
     the screen and neutral grey in the PDF of the identical
     configuration, so the meaning — green reads included, grey reads
     inert — did not survive the print. Ours prints from these nodes,
     so there is nothing for a second renderer to lose.
   · THE COVER PICTURE IS A BAND, NOT A BLEED, and that is arithmetic
     rather than taste. A4 at 300 dpi is 2480 × 3508 px and not one
     held picture in this repository is 3508 px tall (the sweep's §6).
     A full-page bleed would be an enlargement, and nothing in this
     app is enlarged past its own pixels.
   · THE PAGE COUNT IS MEASURED, NOT GUESSED. `paginate.ts` packs
     measured atoms into pages, so the page boxes on the floor are the
     pages that come out of the printer — asserted in
     `e2e/flows/document.spec.ts`, which prints one A4 PDF and counts
     its pages against the sheets in this DOM.
   · NOTHING ON THIS SCREEN ANIMATES. The total is `PriceFigure`,
     which is a `<data>` element and never a counter: an issued figure
     that counts up reads as a figure still being decided, with the
     customer holding the paper.
   ============================================================ */

/** Said at the act, because that is where the press happens. */
export const PRINT_IS_THE_PAGE =
  'Print gives A4 at true size from the sheet above — the same nodes, with the floor taken away. Your browser’s print dialogue is also where it is saved as a PDF; there is no second renderer here, so the paper cannot disagree with the page.'

/** What a document with no organisation behind it says where a
 *  dealership's standing terms would be. It names where they are
 *  typed rather than inventing a validity sentence, which is the one
 *  thing a quote must never do. */
export const NO_TERMS =
  'No terms are printed, because this business has not typed any. A dealership’s standing terms are copied onto a quote when it is raised, and this one was raised on a sheet with no organisation on it. Nothing is invented to fill the space.'

/** The dealer's own mark, which this repository does not hold. */
export const NO_LETTERHEAD =
  'The business’s name is set in type: no mark is held for this dealership. Uploading one puts it here, at this size, and nothing below it moves.'

export interface DocumentProps {
  /** which document this is */
  quoteId: string
  /** the way back to the build. A test hands in a spy, which is why
   *  this screen never reaches for the router. */
  goBack?: () => void
  /** the printer, injected so a test can say that the act fired
   *  without a print dialogue opening over the run */
  print?: () => void
  /**
   * WHERE ELSE THIS APP HAS A SCREEN, as real addresses — `src/app/ways.ts`
   * holds the list and the route hands it down, because an address belongs
   * to the route and not to a screen's layout.
   *
   * Added 2026-09-18 against a measured finding: this screen carried
   * `Back to the build` and `Print` and nothing else, so a dealer who
   * opened a document from the register had no way to the register, to
   * Home, or to the next quote without typing an address. They are links
   * rather than buttons, which is what lets a dealer open the register in
   * a second tab and keep the customer's sheet on screen.
   */
  ways?: readonly Way[]
  /** follow a way without a page load; without it the links are still
   *  links and the browser follows them itself */
  go?: (href: string) => void
}

export function Document({ quoteId, goBack, print, ways = NO_WAYS, go }: DocumentProps) {
  const filed = useQuotes((s) => s.quotes)
  const read = useQuotes((s) => s.loaded)
  const problem = useQuotes((s) => s.problem)
  const quote = filed.find((q) => q.id === quoteId)

  if (!quote) return <Missing read={read} problem={problem} goBack={goBack} ways={ways} go={go} />
  return <Sheaf quote={quote} goBack={goBack} print={print} ways={ways} go={go} />
}

/**
 * THE OTHER SCREENS, AS LINKS. Drawn in the chrome and in the blank
 * state, small and quiet, because they are not what a person came here
 * to do — they are what stops this screen being somewhere a person
 * cannot leave. The `<a>` is the primitive's (`href` in src/ui/Button),
 * so a dealer can open the register in a second tab and keep the
 * customer's sheet on the screen in front of them.
 */
function Ways({ ways, go }: { ways: readonly Way[]; go?: (href: string) => void }) {
  if (ways.length === 0) return null
  return (
    <nav className="doc-ways" aria-label="Elsewhere in this app">
      {ways.map((way) => (
        <Button
          key={way.href}
          intent="veiled"
          size="sm"
          href={way.href}
          onClick={
            go
              ? () => {
                  go(way.href)
                }
              : undefined
          }
        >
          {way.title}
        </Button>
      ))}
    </nav>
  )
}

/* ---------------------------------------------------------- */
/* No document at this address                                 */
/* ---------------------------------------------------------- */

/**
 * THREE DIFFERENT ABSENCES AND ONLY ONE OF THEM IS AN ERROR — the
 * same three the configurator tells apart, in the same order, because
 * a browser still reading its own database has not yet failed to find
 * anything.
 */
function Missing({
  read,
  problem,
  goBack,
  ways,
  go,
}: {
  read: boolean
  problem: string | null
  goBack?: () => void
  ways: readonly Way[]
  go?: (href: string) => void
}) {
  return (
    <main className="doc doc--blank" data-testid="document">
      <section className="doc-blank" aria-label="No quote here">
        {problem !== null ? (
          <p className="doc-blank__say" role="alert">
            The quotes in this browser could not be read. {problem}
          </p>
        ) : !read ? (
          <p className="doc-blank__say">Reading what this browser has kept…</p>
        ) : (
          <p className="doc-blank__say">
            <b>No quote is filed at this address.</b> A quote lives in the browser it was written
            in, so a link to one does not travel between computers yet — that arrives with the
            backend at Milestone 6.
          </p>
        )}
        {goBack ? (
          <Button intent="veiled" onClick={goBack}>
            Back to the build
          </Button>
        ) : null}
        {/* AND THE WAY OUT OF A DEAD END. Before 2026-09-18 this state
            was one sentence with a single control behind it, and that
            control only appeared when a route had handed one down — so
            a shared link to a quote written on another computer was a
            paragraph in an empty window. */}
        <Ways ways={ways} go={go} />
      </section>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The sheaf: the chrome, the floor, and the pages             */
/* ---------------------------------------------------------- */

/** One thing a reader reads as one, and the unit a page break may
 *  fall between but never through. */
interface Block extends Omit<Atom, 'height'> {
  node: ReactNode
}

/** The cover picture at the size it is really painted, measured off
 *  the element rather than claimed. Read by the desk note. */
export interface Drawn {
  w: number
  h: number
}

function Sheaf({
  quote,
  goBack,
  print,
  ways,
  go,
}: {
  ways: readonly Way[]
  go?: (href: string) => void
  quote: QuoteDef
  goBack?: () => void
  print?: () => void
}) {
  const doc = useMemo(() => readDocument(quote), [quote])
  const art = useMemo(() => coverArt(doc.subject.image?.src, registerOf(doc)), [doc])

  /* THE COVER MEASURES ITS OWN PICTURE AND THE NOTE SAYS THE FIGURE.
     The measurement has to happen where the element is — inside a
     block, on a page — and the sentence about it belongs beside the
     sheet and not on it, so the number is lifted here between them.
     Compared before it is set, because a ResizeObserver that handed
     back an equal pair on every layout would re-render this screen
     for nothing. */
  const [drawn, setDrawn] = useState<Drawn | null>(null)
  const onDrawn = useCallback((next: Drawn) => {
    setDrawn((was) => (was && was.w === next.w && was.h === next.h ? was : next))
  }, [])
  const blocks = useMemo(() => blocksOf(doc, art, onDrawn), [doc, art, onDrawn])

  const root = useRef<HTMLElement>(null)
  const gauge = useRef<HTMLSpanElement>(null)
  const held = useRef(new Map<string, HTMLElement>())
  const [pages, setPages] = useState<string[][] | null>(null)

  const keep = useCallback((id: string, element: HTMLElement | null) => {
    if (element) held.current.set(id, element)
    else held.current.delete(id)
  }, [])

  /*
    THE MEASUREMENT, AND WHY IT FORCES THE PAPER'S OWN GEOMETRY FIRST.

    The page assignment has to be the A4 one at EVERY window size,
    because print is always A4 whatever the window was: a grouping
    measured at 390px would pack a phone's taller blocks into pages
    the printer never produces, and the page count on the floor would
    stop being the page count in the tray. So the measurement puts the
    sheaf into the paper's geometry for one synchronous layout —
    `data-gauging`, read by the stylesheet — reads every atom's height
    and the page's own content box, and takes it straight back out.
    It happens inside a layout effect, so nothing is ever painted in
    that state.

    THE ROOM IS READ OFF THE BROWSER AND NOT WRITTEN HERE. The
    stylesheet states the paper, the margins, the running head and the
    running foot; `--page-room` is what they come to, and the gauge is
    an empty element that IS that box. Writing the number twice is how
    a stylesheet and a paginator start to disagree about where a page
    ends.
  */
  const measure = useCallback(() => {
    const element = root.current
    const box = gauge.current
    if (!element || !box) return
    element.dataset.gauging = ''
    const room = box.clientHeight
    const atoms: Atom[] = blocks.map((block) => ({
      ...block,
      height: held.current.get(block.id)?.offsetHeight ?? 0,
    }))
    delete element.dataset.gauging
    if (room <= 0 || atoms.every((a) => a.height === 0)) return
    const next = paginate(atoms, room)
    setPages((was) => (was && same(was, next) ? was : next))
  }, [blocks])

  useLayoutEffect(measure)

  /* A FACE LANDING AFTER THE FIRST LAYOUT CHANGES EVERY HEIGHT, and a
     page assignment made against the fallback's metrics is a page
     assignment that is wrong by one line per page. `fonts.ready` is
     the one event that says the measurement can be trusted; a browser
     without it simply keeps the first reading, which is what it would
     have had anyway. */
  useEffect(() => {
    const fonts = (globalThis as { document?: { fonts?: { ready?: Promise<unknown> } } }).document
      ?.fonts
    if (!fonts?.ready) return
    let alive = true
    void fonts.ready.then(() => {
      if (alive) measure()
    })
    return () => {
      alive = false
    }
  }, [measure])

  /* THE PAGE IS IN MILLIMETRES AND THE BROWSER IS NOT. A zoom, a
     changed root font size or a different device pixel ratio moves
     what a millimetre comes to in CSS pixels, and the gauge is the
     one element that says so. */
  useEffect(() => {
    const box = gauge.current
    if (!box || typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(() => measure())
    watch.observe(box)
    return () => {
      watch.disconnect()
    }
  }, [measure])

  const settled = pages !== null
  const sheets = pages ?? [blocks.map((b) => b.id)]
  const byId = new Map(blocks.map((b) => [b.id, b]))

  return (
    <main className="doc" data-testid="document" ref={root}>
      <Chrome
        doc={doc}
        pages={settled ? sheets.length : null}
        goBack={goBack}
        print={print}
        ways={ways}
        go={go}
      />

      <div className="doc-floor">
        <article
          className="doc-sheaf"
          data-settled={settled ? 'yes' : 'no'}
          aria-label={`Quote ${doc.reference} for ${named(doc.customer.name)}`}
        >
          {sheets.map((ids, i) => (
            <section
              className="doc-page"
              key={ids[0] ?? i}
              data-page={i + 1}
              aria-label={`Page ${i + 1}${settled ? ` of ${sheets.length}` : ''}`}
            >
              {/* pagedjs-home's own furniture: four marks that say the
                  sheet has edges, on the floor rather than on the paper */}
              <span className="doc-page__marks" aria-hidden="true" />
              {/* WHERE THERE IS NO SHEET TO DRAW, THE EDGE IS SAID.
                  Under 826px the page boxes leave and the same nodes
                  set as one column, so this is the only thing that
                  still tells a reader where a break will fall on the
                  paper. It is the page assignment measured in the
                  paper's own geometry, so it is the page the printer
                  will put it on and not a guess about this window. */}
              <p className="doc-page__label doc-mono">
                Page {i + 1}
                {settled ? ` of ${sheets.length}` : ''} · A4
              </p>
              {/* THE RUNNING HEAD CARRIES THE LETTERHEAD AND THE
                  REFERENCE — `porsche-pdf-1..6` repeats its code on
                  every page and `govuk-confirmation` asks for the
                  reference to be findable, so it is here and in the
                  foot. A business with no name in the file hangs
                  nothing: a placeholder repeated on every page would
                  be the loudest thing on the document. The absence is
                  said once, on the cover, where it can be explained. */}
              <header className="doc-page__head" data-cover={i === 0 ? '' : undefined}>
                {/* THE COVER CARRIES NO RUNNING HEAD, and `porsche-pdf-1`
                    is why: its own cover has none either. The reference
                    is on the mast four millimetres below this, so a
                    running head here would print one fact twice within
                    a line of itself. The element stays so the page's
                    three rows do not move between the cover and the
                    pages after it. */}
                {i === 0 ? null : (
                  <>
                    {doc.business ? (
                      <span className="doc-page__house">{doc.business}</span>
                    ) : (
                      <span />
                    )}
                    <span className="doc-mono">{doc.reference}</span>
                  </>
                )}
              </header>
              <div className="doc-page__flow">
                {ids.map((id) => {
                  const block = byId.get(id)
                  if (!block) return null
                  return (
                    <div
                      className="doc-atom"
                      key={id}
                      ref={(element) => keep(id, element)}
                      data-atom={id.split(':')[0]}
                    >
                      {block.node}
                    </div>
                  )
                })}
              </div>
              <footer className="doc-page__foot">
                <span className="doc-mono">{doc.reference}</span>
                <span>
                  Page {i + 1}
                  {settled ? ` of ${sheets.length}` : ''}
                </span>
              </footer>
            </section>
          ))}
        </article>
        {/* the page's own content box, measured rather than written
            down twice. Zero width, no text, out of the reading order. */}
        <span className="doc-gauge" ref={gauge} aria-hidden="true" />

        {/* AFTER THE PAPER IN THE READING ORDER AND BESIDE IT ON THE
            FLOOR. The sheet is the subject of this screen, so a reader
            with no screen meets the whole document before anything the
            room has to say about it; a grid puts the note in the margin
            at a desk width, which changes where it is drawn and never
            where it is read. */}
        <DeskNote doc={doc} art={art} drawn={drawn} />
      </div>
    </main>
  )
}

/** Two page assignments that are the same assignment. Compared member
 *  by member rather than by joining on a separator: an id is a nanoid
 *  with a prefix, and a separator that could ever appear inside one
 *  would make two different assignments compare equal. */
function same(a: string[][], b: string[][]): boolean {
  if (a.length !== b.length) return false
  return a.every((page, i) => page.length === b[i].length && page.every((id, k) => id === b[i][k]))
}

/** The register the hull came from, as the document froze its name:
 *  the first section is the subject's own. */
function registerOf(doc: PrintedQuote): string {
  for (const section of doc.sections) {
    for (const table of section.tables) if (table.subject) return table.title
  }
  return doc.sections[0]?.tables[0]?.title ?? ''
}

/** A name, or the honest absence. Never a placeholder that could be
 *  mistaken for one. */
const named = (name: string): string => (name.trim() === '' ? 'nobody yet' : name.trim())

/* ---------------------------------------------------------- */
/* The chrome: the room's controls, and never the paper's      */
/* ---------------------------------------------------------- */

/**
 * EVERY CONTROL ON THIS SCREEN STANDS ON THE FLOOR AND NOT ON THE
 * PAPER, which is the decision that lets the print be the page
 * without a single thing being hidden from it: there is nothing on a
 * sheet that print has to take away. It is also the reason the
 * palette holds — `tokens.css` records that neither picked board
 * draws a control on a light ground and that the first screen to do
 * so owes a measured border. This screen does not do so.
 *
 * PRINT AND DOWNLOAD ARE ONE PRESS. `live/notion-print.png` gives
 * "Export as PDF" and "Print a Notion page" as two separate
 * operations with two different results; ours is one DOM and one
 * dialogue, and the sentence under the act says where the PDF comes
 * from rather than offering a second button that would produce it a
 * second way.
 */
function Chrome({
  doc,
  pages,
  goBack,
  print,
  ways,
  go,
}: {
  doc: PrintedQuote
  pages: number | null
  goBack?: () => void
  print?: () => void
  ways: readonly Way[]
  go?: (href: string) => void
}) {
  const fire = useCallback(() => {
    if (print) {
      print()
      return
    }
    globalThis.print?.()
  }, [print])

  return (
    <div className="doc-chrome">
      <div className="doc-chrome__who">
        <p className="doc-eyebrow">
          {doc.issued ? 'Given to the customer' : 'Not given to the customer yet'}
          {' · '}
          <span className="doc-mono">{doc.reference}</span>
        </p>
        <p className="doc-chrome__what">
          {doc.subject.label} for {named(doc.customer.name)}
          {pages === null ? '' : ` · ${pages} ${pages === 1 ? 'page' : 'pages'} of A4`}
        </p>
        {/* THE WAY OUT OF THE PAPER. Measured before 2026-09-18: the two
            controls on this screen were `Back to the build` and `Print`,
            so a dealer who opened a document FROM the register could not
            get back to it. These sit with the document's own line rather
            than in the acts beside `Print`, because a person at this
            screen is holding one act and this is not it — and because a
            fourth control in that flex row overflows a 390px window. */}
        <Ways ways={ways} go={go} />
      </div>

      <div className="doc-chrome__acts">
        {goBack ? (
          <Button intent="veiled" onClick={goBack}>
            Back to the build
          </Button>
        ) : null}
        <Button intent="act" onClick={fire}>
          Print
        </Button>
      </div>

      <p className="doc-chrome__say">{PRINT_IS_THE_PAGE}</p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The desk note: what is true of this sheet and is not on it  */
/* ---------------------------------------------------------- */

/** What the note says where a document names no rung at all. */
export const NO_RUNG =
  'Each register on this quote carries a single price column, so there is no whole-quote level to name.'

/** Why this note exists, said on the note itself. */
export const THE_DESK_NOTE =
  'What a dealer needs to know about this sheet and a customer does not. It stands on the floor with the controls, never on the paper — so print takes it away with the room and there is still nothing hidden from the page.'

/**
 * THE DEALER'S MARGIN.
 *
 * MEASURED ON THE ISSUED DOCUMENT, 2026-09-18: the sheet a customer
 * keeps carried five things written for the person who made it —
 * *"Uploading one puts it here, at this size, and nothing below it
 * moves"*, *"pair it on the subject's own page and it shows here"*,
 * a census of the register reading *"0 lines are included, 12 rows
 * were offered and not taken"*, the provenance of the cover picture
 * down to its held pixel size, and `TOTAL AT CASH` with *"Priced at
 * Cash, which 3 of the 3 lines carry"*, which tells a buyer which one
 * of the dealer's eight price columns he is being quoted from.
 *
 * NONE OF IT WAS WRONG AND NONE OF IT IS DELETED. Every figure and
 * every sentence is still on this screen, one object to the left of
 * where it was: the paper is the customer's and the room around it is
 * the dealer's, which is the distinction this screen already draws for
 * its CONTROLS — "every control stands on the floor and not on the
 * paper" — extended to the words that were only ever addressed to the
 * same person as the controls.
 *
 * AND IT COSTS THE DIRECTION NOTHING. There is still one renderer and
 * one set of nodes for the page; this is not a second rendering of the
 * document, it is the room, and `@media print` takes the room away
 * exactly as it already took the chrome away. Nothing on a sheet has
 * to be hidden from the printer, which was the whole thesis.
 */
function DeskNote({ doc, art, drawn }: { doc: PrintedQuote; art: CoverArt; drawn: Drawn | null }) {
  /* the registers this hull has never been paired with, and the one
     sentence about what to do, which `steps.ts` writes once */
  const unpaired: string[] = []
  let andThen = ''
  for (const section of doc.sections) {
    for (const table of section.tables) {
      if (table.next === '') continue
      if (!unpaired.includes(table.title)) unpaired.push(table.title)
      andThen = table.next
    }
  }

  const picture =
    art.kind === 'photograph'
      ? `Held ${art.held.width.toLocaleString('en-AU')} × ${art.held.height.toLocaleString('en-AU')}${
          drawn
            ? `, printed at ${drawn.w.toLocaleString('en-AU')} × ${drawn.h.toLocaleString('en-AU')}`
            : ''
        }, never enlarged · ${
          art.held.verdict === 'scene'
            ? 'a photograph on the water'
            : `a ${art.held.verdict} picture`
        } from ${hostOf(art.held.address)}`
      : art.because

  return (
    <aside className="doc-desk" aria-label="What is not on the paper">
      <p className="doc-desk__lab">Not on the paper</p>
      <p className="doc-desk__say">{THE_DESK_NOTE}</p>
      <dl className="doc-desk__list">
        <div className="doc-desk__row">
          <dt className="doc-desk__word">Priced at</dt>
          <dd className="doc-desk__means">
            {doc.rung
              ? `${doc.rung.label} — ${doc.rung.carriedBy.toLocaleString('en-AU')} of the ${doc.rung.of.toLocaleString('en-AU')} lines carry that rung.`
              : NO_RUNG}
          </dd>
        </div>
        <div className="doc-desk__row">
          <dt className="doc-desk__word">The three words</dt>
          <dd className="doc-desk__means">
            {doc.included.toLocaleString('en-AU')} {doc.included === 1 ? 'line is' : 'lines are'}{' '}
            {INCLUDED.toLowerCase()},{' '}
            {doc.optional === null
              ? 'the number offered and not taken cannot be said'
              : `${doc.optional.toLocaleString('en-AU')} ${doc.optional === 1 ? 'row was' : 'rows were'} offered and not taken`}
            , and {doc.unpriced.toLocaleString('en-AU')}{' '}
            {doc.unpriced === 1 ? 'line carries' : 'lines carry'} no price at this level. The count
            of what was offered is the one frozen when the quote was raised.
          </dd>
        </div>
        {unpaired.length > 0 ? (
          <div className="doc-desk__row">
            <dt className="doc-desk__word">Not paired yet</dt>
            <dd className="doc-desk__means">
              {unpaired.join(' · ')}. {andThen}
            </dd>
          </div>
        ) : null}
        <div className="doc-desk__row">
          <dt className="doc-desk__word">The cover picture</dt>
          <dd className="doc-desk__means">{picture}</dd>
        </div>
        <div className="doc-desk__row">
          <dt className="doc-desk__word">The letterhead</dt>
          <dd className="doc-desk__means">{NO_LETTERHEAD}</dd>
        </div>
      </dl>
    </aside>
  )
}

/* ---------------------------------------------------------- */
/* The blocks — everything that is on paper                     */
/* ---------------------------------------------------------- */

/**
 * THE WHOLE DOCUMENT AS A FLAT LIST OF ATOMS, in printing order.
 *
 * Flat rather than nested, because that is what makes the page break
 * a decision this app makes rather than one the browser makes for it:
 * an atom is the smallest thing a reader reads as one, and a break
 * can only fall between two of them. The nesting a reader sees — a
 * section holding registers holding rows — is carried by the atoms'
 * own shapes and by `keepWithNext`, which is how a heading is never
 * left alone at the foot of a page.
 */
function blocksOf(doc: PrintedQuote, art: CoverArt, onDrawn: (drawn: Drawn) => void): Block[] {
  const out: Block[] = []
  out.push({
    id: 'cover',
    breakBefore: true,
    node: <Cover doc={doc} art={art} onDrawn={onDrawn} />,
  })

  for (const section of doc.sections) {
    const from = out.length
    out.push({
      id: `sec:${section.id}`,
      node: <SectionHead num={section.num} name={section.name} subtotal={section.subtotal} />,
    })
    for (const table of section.tables) {
      if (section.named) {
        out.push({ id: `tab:${table.id}`, keepWithNext: 2, node: <TableHead table={table} /> })
      }
      if (table.lines.length > 0) {
        out.push({ id: `cols:${table.id}`, keepWithNext: 1, node: <Columns /> })
        for (const line of table.lines) {
          out.push({ id: `line:${line.id}`, node: <Line line={line} /> })
        }
        /* WHAT IT OFFERED AND NOBODY TOOK, under the rows it did put
           on the quote. Only where there is something to say: a
           register that offered exactly what was taken says nothing,
           because a line reading "0 more were offered" is a fact
           nobody needed. */
        if (table.optional !== 0) {
          out.push({ id: `also:${table.id}`, node: <Also table={table} /> })
        }
      } else {
        /* A REGISTER WITH NOTHING ON IT SAYS IT ONCE. The first cut
           drew two lines here — "Not taken. Nothing from this register
           is on the quote." and then "Optional. 4 more were offered" —
           which is the four-surfaces-one-fact defect `bands.ts` counts
           and removes, in miniature, and the word "more" was wrong
           besides: nothing was taken, so nothing is more. */
        out.push({ id: `bare:${table.id}`, node: <Bare table={table} /> })
      }
    }
    /* the head keeps whatever follows it, up to three atoms — the
       register's own name, the column row and the first line — so a
       section never opens at the foot of a page with nothing under it */
    out[from].keepWithNext = Math.min(3, out.length - from - 1)
  }

  if (doc.typed.length > 0) {
    out.push({
      id: 'typed',
      keepWithNext: Math.min(2, doc.typed.length + 1),
      node: (
        <SectionHead
          num="—"
          name="Typed on this quote"
          subtotal={doc.typed.reduce<number | null>(
            (n, l) => (l.amount === null ? n : (n ?? 0) + l.amount),
            null,
          )}
        />
      ),
    })
    out.push({ id: 'typed-cols', keepWithNext: 1, node: <Columns /> })
    for (const line of doc.typed) {
      out.push({ id: `line:${line.id}`, node: <Line line={line} /> })
    }
  }

  if (doc.adjustments.length > 0) {
    out.push({
      id: 'adj',
      keepWithNext: Math.min(2, doc.adjustments.length),
      node: <AdjustmentHead doc={doc} />,
    })
    for (const a of doc.adjustments) {
      out.push({
        id: `adj:${a.id}`,
        node: (
          <div className="doc-row" data-kind="adjustment">
            <span className="doc-row__name">
              {a.label}
              {a.note ? <span className="doc-row__facts">{a.note}</span> : null}
            </span>
            <span className="doc-row__code" />
            <span className="doc-row__qty" />
            <span className="doc-row__fig doc-mono">{signedMoney(a.amount)}</span>
          </div>
        ),
      })
    }
  }

  out.push({ id: 'arith', node: <Arithmetic doc={doc} /> })
  out.push({ id: 'read', node: <HowToRead /> })
  out.push({ id: 'terms', node: <Terms doc={doc} /> })
  out.push({ id: 'record', node: <Record doc={doc} /> })
  return out
}

/* ---------------------------------------------------------- */
/* The cover                                                   */
/* ---------------------------------------------------------- */

/**
 * PORSCHE'S COVER, READ OFF `porsche-pdf-1` AND THEN ANSWERED FOR A
 * DEALER. Theirs is a render on a pale panel, the name centred under
 * it, a code, a resolvable link, a date — then a rule, `Summary`, ONE
 * money row reading `Price for equipment`, and a six-point footnote,
 * with the lower 35% of the page deliberately empty.
 *
 * Ours keeps the order and changes one thing, because the sweep names
 * it as this screen's own requirement: THE PRICE STANDS BESIDE WHO IT
 * IS FOR. A configuration belongs to a code; a quote belongs to a
 * person, and a document whose total is not next to the name it is
 * addressed to is a price list. So the summary is two columns —
 * prepared for, and what it comes to — and `govuk-confirmation`'s
 * rule about a reference is kept: it is in the panel AND in the foot
 * of every page.
 *
 * THE PRICE SAYS WHAT IT IS A PRICE FOR. Porsche writes `Price for
 * equipment*` and Saxdor names the exact engines behind its starting
 * figure; ours prints the rung in the dealer's own word and the tax
 * convention, always, because a figure with no configuration named is
 * `live/yachtworld-boat-detail` — three prices and a town.
 */
function Cover({
  doc,
  art,
  onDrawn,
}: {
  doc: PrintedQuote
  art: CoverArt
  onDrawn: (drawn: Drawn) => void
}) {
  const photo = useRef<HTMLImageElement>(null)
  const held = art.kind === 'photograph' ? art.held : null

  /* THE PAINTED SIZE, NOT THE BOX — the same arithmetic entry, home
     and the configurator run on theirs. `object-fit: cover` scales
     the whole picture until it covers the box and the box crops the
     rest, so the scale is the larger of the two ratios and the size
     reported is the whole picture at that scale. Printing it is how
     "never enlarged" stays checkable on a page whose width is fixed
     in millimetres and whose pixel size is the browser's business. */
  /* AND THE MEASUREMENT IS REPORTED UPWARDS RATHER THAN PRINTED HERE.
     Until 2026-09-18 the cover printed its own provenance line on the
     paper; that line is the dealer's and now stands in the note beside
     the sheet, so what the cover keeps is the measuring and the note
     does the saying. */
  useEffect(() => {
    const img = photo.current
    if (!held || !img || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const box = img.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) return
      const scale = Math.max(box.width / held.width, box.height / held.height)
      onDrawn({ w: Math.round(held.width * scale), h: Math.round(held.height * scale) })
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(img)
    return () => {
      watch.disconnect()
    }
  }, [held, onDrawn])

  const register = registerOf(doc)
  const total = doc.totals.total

  return (
    <div className="doc-cover">
      <div className="doc-cover__mast">
        {/* THE LETTERHEAD, AND THE ABSENCE OF ONE. A dealership's name
            is the largest thing at the head of its own quotation; a
            sheet packed with no organisation on it has none, and a
            placeholder set at letterhead size would be the loudest
            word on a customer's document. So the absence is set
            quietly, in the caption ink, as a sentence. */}
        <p className="doc-cover__house" data-named={doc.business ? '' : undefined}>
          {doc.business ?? 'This business has not been named yet'}
        </p>
        <p className="doc-cover__kind">
          {doc.issued ? 'Quotation' : 'Quotation · draft'}
          {' · '}
          <span className="doc-mono">{doc.reference}</span>
        </p>
      </div>

      {/* WHAT THE PACKER MEASURED THE PICTURE TO BE rides on the box,
          because a render and a scene do not sit on paper the same
          way: a studio render is cut out on white and merges with the
          sheet it is printed on, so it takes a hairline to have an
          edge at all, while a photograph on the water already has
          four. The verdict is data — an edge-ring saturation reading
          the packer wrote into the ledger — and never a guess from a
          file name. */}
      <figure
        className="doc-shot"
        data-art={art.kind}
        data-verdict={art.kind === 'photograph' ? art.held.verdict : undefined}
      >
        {art.kind === 'photograph' ? (
          <img
            className="doc-shot__img"
            ref={photo}
            src={art.held.src}
            alt={doc.subject.label}
            width={art.held.width}
            height={art.held.height}
            decoding="async"
            fetchPriority="high"
          />
        ) : art.kind === 'mark' ? (
          <img
            className="doc-shot__mark"
            src={art.mark.src}
            alt={art.mark.brand}
            width={art.mark.width}
            height={art.mark.height}
          />
        ) : (
          <span className="doc-shot__word">{register}</span>
        )}
      </figure>

      <p className="doc-cover__over">{register}</p>
      <h1 className="doc-cover__name">{doc.subject.label}</h1>

      {doc.subject.specs.length > 0 ? (
        /* `live/saxdor-brochure-specs-crop`: hairline rows at about
           55% of the measure, the label light and the value at a fixed
           indent. It is the quietest table in the sweep and it is the
           right one for a fact that is not money. */
        <dl className="doc-specs">
          {doc.subject.specs.map((spec) => (
            <div className="doc-spec" key={spec.label}>
              <dt className="doc-spec__lab">{spec.label}</dt>
              <dd className="doc-spec__val">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="doc-note">This register carries no specification columns for this boat.</p>
      )}

      <div className="doc-rule" />
      <p className="doc-cover__summary">Summary</p>

      <div className="doc-money">
        <div className="doc-money__who">
          <p className="doc-lab">Prepared for</p>
          <p className="doc-money__name">{named(doc.customer.name)}</p>
          {(doc.customer.contact ?? []).map((line) => (
            <p className="doc-money__line" key={line}>
              {line}
            </p>
          ))}
          {doc.customer.name.trim() === '' ? (
            <p className="doc-note">
              This quote is addressed to nobody. It cannot be given to a customer until it has a
              name.
            </p>
          ) : null}
        </div>

        <div className="doc-money__sum">
          {/* THE TOTAL, AND NOT THE COLUMN IT WAS READ FROM. It said
              `Total at Cash, tax included` until 2026-09-18: `Cash` is
              a declared price level and no guard was wrong, but it is
              the dealer's own column name and it told a buyer which one
              of eight he was being priced from. The tax convention
              stays — that is a fact about the figure beside it — and
              the rung is said in the note beside the sheet, with the
              count of the lines that carry it, where the dealer reads
              it. */}
          <p className="doc-lab">Total{doc.totals.taxRate === null ? ', tax included' : ''}</p>
          <p className="doc-money__fig" data-testid="document-total">
            <PriceFigure amount={total} />
          </p>
          <p className="doc-money__of">
            {doc.totals.unpricedCount > 0
              ? doc.totals.unpricedCount === 1
                ? 'One line below carries no price at this level and is not in this figure.'
                : `${doc.totals.unpricedCount.toLocaleString('en-AU')} of the lines below carry no price at this level and are not in this figure.`
              : 'Every line below carries a figure, and this is their sum.'}
          </p>
        </div>
      </div>

      <p className="doc-cover__foot">
        {doc.issued
          ? `Given to the customer${doc.issuedAt ? ` on ${day(doc.issuedAt)}` : ''}. Every figure on this document was frozen when the line was picked and cannot move.`
          : 'This has not been given to the customer yet. Every figure on it is already frozen; issuing it is what makes the document final.'}
        {doc.preparedBy ? ` Prepared by ${doc.preparedBy}.` : ''}
      </p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* A section, a register, a row                                */
/* ---------------------------------------------------------- */

/**
 * THE BAND HEAD CARRIES THE SUBTOTAL, which is
 * `live/qwilr-interactive-quote-crop`'s own shape: a band reading
 * `Add-ons`, the subtotal at its right end, the column row beneath.
 * The sweep adopts the band and REJECTS the per-row checkbox beside
 * it, and the reason is this screen exactly — an issued line cannot
 * be unticked.
 *
 * The number and the name are `bands.ts`' own and are a READING ORDER
 * rather than a count: 03 means Trailer on every document this
 * business ever writes, and a quote with no trailer on it simply has
 * no 03.
 */
function SectionHead({
  num,
  name,
  subtotal,
}: {
  num: string
  name: string
  subtotal: number | null
}) {
  return (
    <div className="doc-band">
      <p className="doc-band__name">
        <span className="doc-band__num">{num}</span>
        {name}
      </p>
      {/* A BAND WITH NOTHING PRICED IN IT PRINTS AN EM DASH AND NEVER
          A NOUGHT. PCPartPicker sets one in every empty cell of a
          build for the same reason: a nought in a money column is a
          claim that something is free. */}
      <p className="doc-band__sum doc-mono">{subtotal === null ? '—' : money(subtotal)}</p>
    </div>
  )
}

/** The register's own name, drawn only where a section holds more
 *  than one — `bands.ts`: a heading belongs "only where a place
 *  really spans more than one table". */
function TableHead({ table }: { table: DocumentTable }) {
  return <p className="doc-shelf">{table.title}</p>
}

/**
 * `butterick-tables`: the borders go off first, and the column row is
 * a label rather than a rule. Four columns and no vertical ones —
 * that frame's own `CLUTTERED` example is a border round every cell.
 *
 * WHY THIS IS NOT A `<table>`, SAID OUT LOUD. A table element cannot
 * be split across two page elements, and a page break is the one
 * thing this screen has to decide for itself — so the rows are
 * labelled lines, in reading order, with the column names given once
 * above them and each line reading name, code, quantity, amount. That
 * is the same shape Porsche's own configuration PDF carries, and it
 * is why every cell says its state in WORDS: a reader hearing a row
 * gets "Included" or "Not priced at this level", never a blank where
 * a column header would have had to explain one.
 */
function Columns() {
  return (
    <div className="doc-row doc-row--cols">
      <span className="doc-row__name">Item</span>
      <span className="doc-row__code">Code</span>
      <span className="doc-row__qty">Qty</span>
      <span className="doc-row__fig">Amount</span>
    </div>
  )
}

/**
 * ONE FROZEN LINE.
 *
 * THE MONEY COLUMN HOLDS THREE STATES AND THEY READ AS THREE WORDS,
 * not as three colours: the sweep measured Porsche printing the same
 * chip mid green on screen and neutral grey on paper, so the meaning
 * died in the printer. `@/domain/quote/document` decides which of the
 * three this line is and publishes the words; this draws them.
 *
 * THE ARITHMETIC IS PRINTED UNDER THE NAME — `live/stripe-billing`
 * sets `10,000 × A$0.0023/request` under `API requests` — so a line
 * at a quantity reads its own sum and the total is auditable without
 * a calculator.
 */
function Line({ line }: { line: DocumentLine }) {
  /* EVERYTHING THAT IS NOT THE NAME AND NOT THE FIGURE, IN ONE LINE
     UNDER THE NAME: the arithmetic of a quantity, the join's own
     facts, what the price column already contains, why a cell says
     `Included` or `Not priced at this level`, and a price somebody
     typed with the frozen one beside it. Built as a list and joined
     once, because the first cut concatenated five conditional
     fragments and had to carry the separator inside each of them. */
  const under = [
    line.qty > 1 && line.unit !== null ? `${line.qty} × ${money(line.unit)}` : '',
    line.facts.map((f) => `${f.label} ${f.value}`).join(' · '),
    line.why,
    line.contains.length > 0 ? `this figure already has ${line.contains.join(' and ')} in it` : '',
    line.overridden
      ? `priced by hand at ${money(line.unit ?? 0)}${line.frozenUnit === null ? '' : `, against ${money(line.frozenUnit)} on the file`} — ${line.overrideReason ?? 'no reason was written beside it'}`
      : '',
  ].filter((said) => said !== '')

  return (
    <div className="doc-row" data-state={line.state}>
      <span className="doc-row__name">
        {line.label}
        {under.length > 0 ? <span className="doc-row__facts">{under.join(' · ')}</span> : null}
      </span>
      <span className="doc-row__code doc-mono">{line.code ?? '—'}</span>
      <span className="doc-row__qty doc-mono">{line.qty.toLocaleString('en-AU')}</span>
      <span className="doc-row__fig doc-mono">
        {line.state === 'charged' ? money(line.amount ?? 0) : line.say}
      </span>
    </div>
  )
}

/**
 * A REGISTER WITH NOTHING ON IT, IN ONE LINE.
 *
 * `steps.ts` already tells the four empties apart — waiting for a
 * choice, held back as no longer sold, never paired at all, and a
 * document too old to say — and writes the sentence for the two that
 * have one. Where it has nothing to say, the count IS the sentence:
 * a register that offered four and put none on the quote is four
 * optional rows, said here in the same words `Also` uses so a reader
 * meets one phrasing and not two.
 */
function Bare({ table }: { table: DocumentTable }) {
  return (
    <p className="doc-bare">
      <b>Not taken.</b>{' '}
      {table.say !== ''
        ? table.say
        : table.optional === null
          ? `Nothing from ${table.title} is on this quote, and this document was raised before the count existed, so how many it offered cannot be said.`
          : table.optional > 0
            ? `${table.optional.toLocaleString('en-AU')} ${table.optional === 1 ? 'row was' : 'rows were'} offered from ${table.title} and none is on this quote — ${OPTIONAL.toLowerCase()}, so not on the boat and not in the total.`
            : `Nothing from ${table.title} is on this quote.`}
      {table.held > 0
        ? ` A further ${table.held.toLocaleString('en-AU')} ${table.held === 1 ? 'was' : 'were'} held back as no longer sold.`
        : ''}
    </p>
  )
}

/**
 * OPTIONAL, WHICH IS THE THIRD WORD AND IS A FACT ABOUT A REGISTER.
 *
 * Every line on a frozen document is charged or included, so nothing
 * in a table can be optional; what is optional is what the register
 * OFFERED and nobody took, and that count was frozen onto the section
 * when the quote was raised. `live/govuk-check-answers` is the
 * published rule this follows — "if you have questions that are
 * optional, let users know they've skipped it… by showing their
 * response as 'Not provided'" — an absence stated, never an absent
 * row.
 */
function Also({ table }: { table: DocumentTable }) {
  return (
    <p className="doc-also">
      <b>{OPTIONAL}.</b>{' '}
      {table.optional === null
        ? `This quote was raised before the count existed, so how many more ${table.title} offers cannot be said. It is not nought.`
        : `${table.optional.toLocaleString('en-AU')} more ${table.optional === 1 ? 'was' : 'were'} offered from ${table.title} and ${table.optional === 1 ? 'is' : 'are'} not on this quote — not on the boat, and not in the total.`}
      {table.held > 0
        ? ` A further ${table.held.toLocaleString('en-AU')} ${table.held === 1 ? 'was' : 'were'} held back as no longer sold.`
        : ''}
    </p>
  )
}

/** The adjustments band. Every one of them is its own visible row and
 *  is never folded into a subtotal: `model/quote.ts` argues it — the
 *  moment a discount stops being a row, nobody can answer "why is
 *  this $3,000 under the list?". */
function AdjustmentHead({ doc }: { doc: PrintedQuote }) {
  return (
    <div className="doc-band">
      <p className="doc-band__name">
        <span className="doc-band__num">—</span>
        Against the package
      </p>
      <p className="doc-band__sum doc-mono">{signedMoney(doc.totals.adjustmentsTotal)}</p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The arithmetic, the legend, the terms, the record           */
/* ---------------------------------------------------------- */

/** The total at the foot, under the lines it is the sum of —
 *  `live/stripe-billing`'s `Estimated monthly total` in the place a
 *  reader looks for it after reading the rows. */
function Arithmetic({ doc }: { doc: PrintedQuote }) {
  const t = doc.totals
  /* THE PACKAGE LINE IS DRAWN ONLY WHERE IT IS NOT THE TOTAL. With no
     adjustment and no typed tax rate the two are the same number, and
     a document that printed $124,421 twice, eight millimetres apart,
     would be asking a customer which one to read. */
  const stepped = doc.adjustments.length > 0 || t.totalExcludingTax !== null
  return (
    <section className="doc-sums" aria-label="What it comes to">
      <p className="doc-lab">What it comes to</p>
      <dl className="doc-sums__list">
        {stepped ? (
          <div className="doc-sum">
            <dt>The package</dt>
            <dd className="doc-mono">{money(t.packageTotal)}</dd>
          </div>
        ) : null}
        {doc.adjustments.length > 0 ? (
          <div className="doc-sum">
            <dt>Against it</dt>
            <dd className="doc-mono">{signedMoney(t.adjustmentsTotal)}</dd>
          </div>
        ) : null}
        {t.totalExcludingTax !== null ? (
          <>
            <div className="doc-sum">
              <dt>Before tax</dt>
              <dd className="doc-mono">{money(t.totalExcludingTax)}</dd>
            </div>
            <div className="doc-sum">
              <dt>Tax at {t.taxRate}%</dt>
              <dd className="doc-mono">{money(t.taxAmount ?? 0)}</dd>
            </div>
          </>
        ) : null}
        <div className="doc-sum doc-sum--total">
          <dt>Total</dt>
          <dd>
            <PriceFigure amount={t.total} />
          </dd>
        </div>
      </dl>
      <p className="doc-note">
        {t.taxRate === null
          ? 'Amounts are what the price file states, and the file states them with tax in — so nothing is converted anywhere on this quote and no discount can land on the wrong side of it. A tax rate is typed by a person or it is absent, and nobody has typed one.'
          : 'A tax rate was typed on this quote, so the figures above show it separately. Every amount on the lines is still what the price file states.'}
      </p>
    </section>
  )
}

/** The three words, defined where a reader meets them. The words and
 *  their meanings are the domain's own (`HOW_TO_READ`), so the cell
 *  and the explanation cannot drift apart. */
function HowToRead() {
  return (
    <section className="doc-legend" aria-label="How to read a line">
      <p className="doc-lab">How to read a line</p>
      <dl className="doc-legend__list">
        {HOW_TO_READ.map((row) => (
          <div className="doc-legend__row" key={row.word}>
            <dt className="doc-legend__word">{row.word}</dt>
            <dd className="doc-legend__means">{row.means}</dd>
          </div>
        ))}
      </dl>
      {/* THE CENSUS THAT USED TO STAND HERE IS ON THE DESK NOTE. It
          read "On this document: 0 lines are included, 12 rows were
          offered and not taken, and 0 lines carry no price at this
          level." — a count of the REGISTER, printed to the person the
          quote is addressed to. The three words above are the
          customer's, because they are printed in the money column of
          their own sheet; the tally of how many fell into each is the
          dealer's check that the sheet came out right. */}
    </section>
  )
}

/** The dealer's standing terms, frozen onto this document when it was
 *  raised. Where the organisation had none, the absence is printed
 *  with the reason — a quote that invented a validity sentence would
 *  be inventing a contract. */
function Terms({ doc }: { doc: PrintedQuote }) {
  return (
    <section className="doc-terms" aria-label="The terms of this quote">
      <p className="doc-lab">Terms</p>
      {doc.terms === null ? (
        <p className="doc-terms__none">{NO_TERMS}</p>
      ) : (
        /* THE TERMS ARE ONE BLOCK AND KEEP THEIR OWN LINE BREAKS.
           `white-space: pre-line` rather than a split into paragraphs,
           because a dealership's terms are a typed sentence and the
           breaks in it are theirs: splitting would let this screen
           decide where one clause ends. It is one atom, so terms
           longer than a page get a page of their own — the packer's
           own answer for anything it cannot break. */
        <p className="doc-terms__say">{doc.terms}</p>
      )}
    </section>
  )
}

/** What happened to this document, and what cannot happen to it now.
 *  `govuk-confirmation` asks a confirmation page for the reference,
 *  what happens next and a way to keep a record; the reference is on
 *  every page already and the record is the Print act on the floor. */
function Record({ doc }: { doc: PrintedQuote }) {
  return (
    <section className="doc-record" aria-label="The record">
      <p className="doc-lab">This document</p>
      <p className="doc-record__say">
        <span className="doc-mono">{doc.reference}</span>
        {doc.issued
          ? `, given to the customer${doc.issuedAt ? ` on ${day(doc.issuedAt)}` : ''}.`
          : ', not yet given to the customer.'}{' '}
        {doc.preparedBy ? `Prepared by ${doc.preparedBy}. ` : ''}
        Every figure on it was read from the price file at the moment the line was picked and
        written onto the document, so the file can be reimported twice and nothing here moves.
        {doc.issued
          ? ' Nothing on it can be changed; the only way on is a new version, which carries these figures across.'
          : ''}
      </p>
      {doc.supersedesId !== null ? (
        <p className="doc-note">
          This quote replaces an earlier one, which is still filed and was not edited.
        </p>
      ) : null}
    </section>
  )
}

/**
 * A stamp as a customer reads it, off the app's own day reader.
 *
 * `localDay` is the one place this repository decides which calendar
 * day a stored instant falls on, and its header records the morning
 * it was written for: Brisbane is UTC+10, so every quote raised
 * between midnight and ten printed two different dates on one screen.
 * A quotation is a document with a date on it and a dealer cannot
 * explain two, so the day comes from there and only the WORDS are
 * this screen's — `YYYY-MM-DD` is right in a register's mono column
 * and wrong in a sentence a customer reads.
 *
 * The Date is built from the three local fields, so re-reading it
 * cannot shift the day back across the zone it was just resolved in.
 */
function day(iso: string): string {
  const ymd = localDay(iso)
  const [y, m, d] = ymd.split('-').map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return ymd
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
