import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { ArrowLeftIcon, FilePdfIcon, FileXIcon, PrinterIcon } from '@phosphor-icons/react'
import { Button, Icon, Plate, PriceFigure, StatusDot, Swatches, type Glyph } from '@/ui'
import { useQuotes } from '@/app/useStores'
import { money } from '@/domain/money'
import { signedMoney } from '@/domain/quote'
import { localDay } from '@/domain/quote/day'
import {
  INCLUDED,
  readDocument,
  type DocumentLine,
  type DocumentTable,
  type PrintedQuote,
} from '@/domain/quote/document'
import type { QuoteDef } from '@/domain/model'
import { DOORS, NO_WAYS, type Way } from '@/app/ways'
import { glyphOfWay } from '@/screens/shell/glyphs'
import { letterheadOf } from '@/data/pictures'
import { coverArt, hostOf, pictured, type CoverArt } from './art'
import { DESK_GLYPH, boatTravel, pricedAtGlyph } from './glyphs'
import { paginate, type Atom } from './paginate'
import {
  ADJUSTMENTS,
  OTHER_ITEMS,
  asLine,
  bandsOnPaper,
  cellWord,
  codeGap,
  codesOf,
  hasQuantity,
  kitsOnPaper,
  noteOnPaper,
  offeredOf,
  offeredSay,
  paperTitle,
  priceRows,
  includedUnsaid,
  pricedAtSay,
  reasonsOf,
  rowFigure,
  totalLabel,
  unitlessOf,
  workshopOf,
} from './paper'
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
   · NOTHING ON THE PAPER MOVES. The total is `PriceFigure`, which is
     a `<data>` element and never a counter: an issued figure that
     counts up reads as a figure still being decided, with the customer
     holding the paper. What arrives (2026-09-28, the component kit) is
     the SHEET — uncovered head first, a clip and never a move — and
     the build's photograph, carried onto the cover by the route's View
     Transition; document.css says how, and that print runs none of it.
   ============================================================ */

/** Said at the act, because that is where the press happens — in the
 *  dealer's words. Until 2026-09-23 it said "the same nodes, with the
 *  floor taken away… there is no second renderer here", which is the
 *  direction's thesis and not something a salesperson needs to be told
 *  to press Print. The thesis is still true and still asserted, by the
 *  print test that counts the PDF's pages against the sheets. */
export const PRINT_IS_THE_PAGE = 'To keep a PDF, choose Save as PDF as the printer.'

/** WHERE A DEALERSHIP'S STANDING TERMS WOULD BE, SAID TO THE DEALER.
 *  Until 2026-09-23 this sentence was printed ON the customer's paper,
 *  in a Terms section that existed to say it had nothing in it — and it
 *  ended "raised on a sheet with no organisation on it", which the file
 *  naming the business made false. The quote spec's checklist, item 17:
 *  terms print only when the dealership wrote them, "and no sentence to
 *  the customer about missing terms". */
export const NO_TERMS = 'None set yet.'

/** The dealer's own mark, where none can be printed: set in type instead. */
export const NO_LETTERHEAD = 'Set in type, because no mark has been added for this dealership yet.'

/** The dealer's own mark, printed: where it came from, and that the owner has the last word. */
export const LETTERHEAD_MARK = 'Northside Marine’s own mark, from northsidemarine.com.au.'

/** A quote whose letterhead froze no name — raised before the file's own
 *  name reached the engine, or on a sheet that names no business. The
 *  paper leaves the line empty rather than printing an apology on it. */
export const NO_NAME_FROZEN =
  'This quote was started before a business name was set, so its letterhead is empty. A new quote prints the name the price list gives.'

/** Why this note exists, said on the note itself, in one line. */
export const THE_DESK_NOTE = 'For you, not the customer.'

/** The air, in CSS px, a cover keeps between its last line and the foot's rule: the foot's own
 *  space above its words (`--spacing(2)`), so the rule stands between two equal gaps. */
const COVER_AIR = 8

/** A link to a quote this browser does not hold, in the dealer's words.
 *  It said "that arrives with the backend at Milestone 6" until
 *  2026-09-23 — a word from this repository's plan, shown to a dealer
 *  (critique of Milestone 2, #14) — and then "Once quotes are kept online,
 *  the same link will open anywhere" until 2026-09-24: the same promise in
 *  new words, of a thing no screen does (built-critique-m2-close-2.md,
 *  major 4). It says what is true today and nothing after it. */
export const NO_QUOTE_HERE =
  'A quote stays on the computer it was written on, so a link to one opens only there. Every quote on this computer is under Quotes.'

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
   * Home, or to the next quote without typing an address.
   *
   * FROM 2026-09-23 THE PILL CARRIES THOSE DOORS, on this screen as on
   * every other, so the paper's own chrome draws none of them (critique
   * of Milestone 2, #13). They are drawn only in the dead end — a link to
   * a quote this browser does not hold — and only the ones the pill does
   * not carry.
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

  if (!quote) return <Missing read={read} problem={problem} ways={ways} go={go} />
  return <Sheaf quote={quote} goBack={goBack} print={print} />
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
  /* THE PILL CARRIES THE DOORS (critique of Milestone 2, #13, and this
     round's rule (a)). Home and the register are on the pill above this
     screen at every width, so a way here that repeated one was a second
     way to the same place in the same window — the walk counted five
     ways off a screen whose subject is one sheet of paper. What is left
     is only what the pill does not carry. */
  const own = ways.filter((way) => !DOORS.some((door) => door.href === way.href))
  if (own.length === 0) return null
  return (
    <nav className="doc-ways" aria-label="Elsewhere in this app">
      {own.map((way) => (
        <Button
          key={way.href}
          intent="veiled"
          size="sm"
          href={way.href}
          /* the place's own glyph, the one the pill and the finder draw it with
             (src/screens/shell/glyphs.ts) */
          icon={glyphOfWay(way.href) ?? undefined}
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
  ways,
  go,
}: {
  read: boolean
  problem: string | null
  ways: readonly Way[]
  go?: (href: string) => void
}) {
  return (
    <main className="doc doc--blank" data-testid="document">
      {/* the kit's white plate on the room: a glyph for a paper that is not here, the
          sentence, and the ways out */}
      <Plate as="section" pad="lg" label="No quote here">
        <div className="doc-blank">
          <span className="doc-blank__glyph" aria-hidden="true">
            <Icon glyph={FileXIcon} size="lg" />
          </span>
          {problem !== null ? (
            <p className="doc-blank__say" role="alert">
              The quotes on this computer could not be read. {problem}
            </p>
          ) : !read ? (
            <p className="doc-blank__say">Reading the quotes…</p>
          ) : (
            <p className="doc-blank__say">
              <b>No quote at this address.</b> {NO_QUOTE_HERE}
            </p>
          )}
          {/* AND THE WAY OUT OF A DEAD END. Before 2026-09-18 this state
            was one sentence with a single control behind it, and that
            control only appeared when a route had handed one down — so
            a shared link to a quote written on another computer was a
            paragraph in an empty window.

            `Back to the build` IS NOT OFFERED HERE, from 2026-09-23: a
            quote this browser does not hold has no build either, and a
            way back to it landed on the configurator's own "no quote at
            this address". A way that leads to the same dead end is not
            a way out. */}
          <Ways ways={ways} go={go} />
        </div>
      </Plate>
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

function Sheaf({
  quote,
  goBack,
  print,
}: {
  quote: QuoteDef
  goBack?: () => void
  print?: () => void
}) {
  const doc = useMemo(() => kitsOnPaper(readDocument(quote)), [quote])
  /* THE BOAT'S PICTURE, READ BY THE ONE READER THE BUILD'S STAGE READS BY (`@/data/pictures`):
     the model on the water, then the row's own copy, then the maker's mark — asked with the
     quote alone, because the paper renders with no catalogue at all */
  const art = useMemo(() => coverArt(quote, registerOf(doc)), [quote, doc])

  /* THE NAME THE BUILD'S PHOTOGRAPH TRAVELS UNDER — the row this quote is written against —
     so the finale's picture lands on the cover (PLAN.md § "Motion choreography for the flow") */
  const travel = boatTravel(quote.rootTableId, quote.rootRowId)
  /* THE COVER FITS ITS PAGE. The photograph's ceiling (`--shot-max`) was measured on four
     covers, and a fifth is taller: the SP660, with five specification rows, the line under its
     photograph and who prepared it, came to 4px more than page 1's room at every width, so
     "Asaf" stood on the foot's rule (the refine round, 2026-10-21). The picture is the one thing
     on a cover that can give, so where the gauged cover is taller than the room the picture is
     drawn that much shorter, whole and in its own proportion. null where the cover fits. */
  const [fitted, setFit] = useState<{ of: string; px: number } | null>(null)
  const fit = fitted?.of === doc.reference ? fitted.px : null
  const blocks = useMemo(() => blocksOf(doc, art, travel, fit), [doc, art, travel, fit])

  /* THE SAVED PDF IS NAMED FOR THE QUOTE, NOT THE APP. The print window
     proposes the page's title as the file's name, so the title is the
     quote's while the paper is open (`paperTitle`) and the app's again
     the moment it closes. */
  useEffect(() => {
    const was = globalThis.document.title
    const ours = paperTitle(doc)
    globalThis.document.title = ours
    /* THE TAB'S OWN NAME ARRIVES AFTER THE PAPER ON A PAPER OPENED BY ITS ADDRESS: the shell
       names the tab for the business the moment the file names it, which on a reload is after
       this paper titled itself, and the print window then proposed "Northside Marine" for the
       PDF. While the paper is open its title is the quote's, whoever wrote the tab's name. */
    const head = globalThis.document.head
    const keep = new MutationObserver(() => {
      if (globalThis.document.title !== ours) globalThis.document.title = ours
    })
    keep.observe(head, { subtree: true, childList: true, characterData: true })
    return () => {
      keep.disconnect()
      globalThis.document.title = was
    }
  }, [doc])

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
    /* the cover picture's box on paper, which is the whole picture: it
       is fitted and never cropped (`.doc-shot__img`) */
    const shot = element.querySelector('.doc-shot__img')?.getBoundingClientRect()
    /* THE COVER STANDS THE ROOM'S HEIGHT WHATEVER IT HOLDS, so what it holds is read from its
       top to the foot of its last block: its own box, and its scroll height, are never less than
       the room, and a reading of either shrank the picture on every pass */
    const coverBox = held.current.get('cover')?.firstElementChild
    const cover = coverBox?.lastElementChild
      ? coverBox.lastElementChild.getBoundingClientRect().bottom -
        coverBox.getBoundingClientRect().top
      : 0
    delete element.dataset.gauging
    /* a cover taller than its room, with a line's air above the foot's rule, takes the
       difference off the picture, never below half of it */
    if (shot && room > 0 && cover + COVER_AIR > room) {
      const next = Math.floor(shot.height - (cover + COVER_AIR - room))
      if (next >= shot.height / 2) {
        const of = doc.reference
        setFit((was) => (was?.of === of && was.px === next ? was : { of, px: next }))
      }
    }
    if (room <= 0 || atoms.every((a) => a.height === 0)) return
    const next = paginate(atoms, room)
    setPages((was) => (was && same(was, next) ? was : next))
  }, [blocks, doc.reference])

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
      <Chrome doc={doc} pages={settled ? sheets.length : null} goBack={goBack} print={print} />

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
              /* its place in the sheaf, for the few frames it waits before it is fed out */
              style={{ '--i': Math.min(i, 4) } as CSSProperties}
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
                  foot. A quote that froze no name hangs nothing: a
                  placeholder repeated on every page would be the
                  loudest thing on the document, and the absence is the
                  dealer's to know — the note beside the sheet says it. */}
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
                    <span>
                      Quotation · <span className="doc-mono">{doc.reference}</span>
                    </span>
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
        <DeskNote doc={doc} art={art} />
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
}: {
  doc: PrintedQuote
  pages: number | null
  goBack?: () => void
  print?: () => void
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
        {/* WHERE THE QUOTE STANDS, the kit's way: a dot in its own ink beside its word —
            given leaf, draft rose (tokens.css, THE KIT) — and the reference beside it */}
        <p className="doc-eyebrow">
          <StatusDot state={doc.issued ? 'given' : 'draft'}>
            {doc.issued ? 'Given to the customer' : 'Not given to the customer yet'}
          </StatusDot>
          <span className="doc-eyebrow__ref doc-mono">{doc.reference}</span>
        </p>
        <p className="doc-chrome__what">
          {doc.subject.title} for {named(doc.customer.name)}
          {/* the count, where no sheet is drawn, is said by each page's own label instead
              (document.css): "2 pages of A4" over "Page 1 of 2 · A4" said it twice in a hand */}
          {pages === null ? null : (
            <span className="doc-chrome__pages">
              {` · ${pages} ${pages === 1 ? 'page' : 'pages'} of A4`}
            </span>
          )}
        </p>
        {/* THE WAY OUT OF THE PAPER IS THE PILL. From 2026-09-18 to
            2026-09-23 this line carried `Home · The register · Start a
            quote`, added because a dealer who opened a document from the
            register could not get back to it. The shell now carries the
            doors over every screen, so those three links were a second
            copy of the pill two inches under it — "five ways off a screen
            whose subject is one sheet of paper" (the walk of Milestone 2).
            What stays is the one way back the pill does not know:
            `Back to the build`, beside `Print`. */}
      </div>

      <div className="doc-chrome__acts">
        {goBack ? (
          <Button intent="veiled" icon={ArrowLeftIcon} onClick={goBack}>
            Back to the build
          </Button>
        ) : null}
        {/* THE ONE THING PRESSED HERE, ending on the printer in its dark disc */}
        <Button intent="act" icon={PrinterIcon} onClick={fire}>
          Print
        </Button>
      </div>

      <p className="doc-chrome__say">
        <span className="doc-chrome__glyph" aria-hidden="true">
          <Icon glyph={FilePdfIcon} />
        </span>
        {PRINT_IS_THE_PAGE}
      </p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The desk note: what is true of this sheet and is not on it  */
/* ---------------------------------------------------------- */

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
 *
 * READ AS THE CUSTOMER, 2026-09-23, THE PAPER STILL CARRIED ELEVEN MORE
 * — the census of every register, the rungs' reasons, the workshop's
 * rigging kit and prop part and slot, the dealer's codes, a paragraph
 * about how tax is stored, the absent terms, and two sentences about
 * freezing and reimporting (`paper.ts` lists them). They moved here by
 * the same rule, and the note is ordered by what a dealer is asked at the
 * desk: what is not on the quote, why a line reads as it does, then the
 * workshop's facts and the codes, then the letterhead and the picture.
 */
function DeskNote({ doc, art }: { doc: PrintedQuote; art: CoverArt }) {
  const census = offeredOf(doc)
  const leftOff = census.filter((o) => o.took === 0)
  const alsoOffered = census.filter((o) => o.took > 0)
  const reasons = reasonsOf(doc)
  const workshop = workshopOf(doc)
  const codes = codesOf(doc)

  const unitless = unitlessOf(doc)
  /* WHAT THE PICTURE SHOWS AND WHOSE IT IS, and not how it is drawn (the refine critique, 18;
     docs/WORDS.md rule 1): it led with "1,917 × 845 pixels, printed whole at 658 × 290, never
     enlarged", the screen's measurement of its own drawing, told to a dealer. */
  const picture =
    art.kind === 'photograph'
      ? `${
          art.held.tier === 'hero'
            ? `The ${art.held.subject}, as its maker photographed it,`
            : art.held.verdict === 'scene'
              ? 'A photograph on the water,'
              : `A ${art.held.verdict} picture,`
        } from ${hostOf(art.held.address)}.`
      : art.because

  return (
    /* THE NOTE IS THE KIT'S WHITE PLATE ON THE FLOOR, beside the paper and never on it. The
       frame says where it stands (the margin at a desk, under the last sheet below that); the
       plate is the surface; its facts are led by the glyph of what each is about. */
    <div className="doc-desk">
      <Plate as="aside" pad="md" label="What is not printed">
        <div className="doc-desk__in">
          <p className="doc-desk__lab">Not printed</p>
          <p className="doc-desk__say">{THE_DESK_NOTE}</p>
          <dl className="doc-desk__list">
            {doc.customer.name.trim() === '' ? (
              <DeskRow word="Named for" glyph={DESK_GLYPH.addressed}>
                Nobody yet. It cannot be given until it has a name, and the printed quote leaves the
                line blank.
              </DeskRow>
            ) : null}
            {leftOff.length + unitless.length > 0 ? (
              <DeskRow word="Left off the printed quote" glyph={DESK_GLYPH.leftOff}>
                <DeskItems
                  items={[
                    ...leftOff.map((o) => asLine(`${o.title}: ${offeredSay(o)}`)),
                    ...unitless.map(asLine),
                  ]}
                />
              </DeskRow>
            ) : null}
            {alsoOffered.length > 0 ? (
              <DeskRow word="Also offered, not taken" glyph={DESK_GLYPH.alsoOffered}>
                <DeskItems items={alsoOffered.map((o) => asLine(`${o.title}: ${offeredSay(o)}`))} />
              </DeskRow>
            ) : null}
            {reasons.length > 0 ? (
              <DeskRow word="Why an item reads as it does" glyph={DESK_GLYPH.why}>
                <DeskItems items={reasons.map((r) => asLine(`${r.said}: ${r.why}`))} />
              </DeskRow>
            ) : null}
            <DeskRow word="Priced at" glyph={pricedAtGlyph(doc.rung?.key)}>
              {/* THE LEVEL BY ITS DECLARED NAME, counted in lines (m2-last-critique.md,
              major 5: "Cash — 3 of the 4 lines carry that rung") */}
              {pricedAtSay(doc)}
              {/* an Included item is named, with why, under "Why an item reads as it does"; only
                  one that row cannot name is counted here, so none is said twice */}
              {includedUnsaid(doc) > 0
                ? ` ${includedUnsaid(doc).toLocaleString('en-AU')} ${includedUnsaid(doc) === 1 ? 'item reads' : 'items read'} ${INCLUDED}, because the price list charges nothing for ${includedUnsaid(doc) === 1 ? 'it' : 'them'}.`
                : ''}
            </DeskRow>
            {workshop.length > 0 ? (
              <DeskRow word="For the workshop" glyph={DESK_GLYPH.workshop}>
                <DeskItems items={workshop.map((w) => asLine(`${w.said}: ${w.facts}`))} />
              </DeskRow>
            ) : null}
            {/* THE BOAT AS THE PRICE FILE WRITES IT — what the dealer orders by,
            and the one place the key string is printed for this quote */}
            <DeskRow word="On the price list" glyph={DESK_GLYPH.file}>
              {doc.subject.label}
            </DeskRow>
            {codes.length > 0 ? (
              <DeskRow word="The codes" glyph={DESK_GLYPH.codes}>
                {/* each beside what it orders, and a gap in one named (`codesOf`, `codeGap`) */}
                <ul className="doc-desk__items">
                  {codes.map(({ said, code }) => (
                    <li key={`${said}|${code}`}>
                      {said}: <DeskCode code={code} />
                    </li>
                  ))}
                </ul>
              </DeskRow>
            ) : null}
            <DeskRow word="Tax" glyph={DESK_GLYPH.tax}>
              {/* IN THE DEALER'S WORDS, NOT THE PRINTER'S (the refine critique, 18): what the
                  price holds, and the honest half — no rate is assumed — said as a fact */}
              {doc.totals.taxRate === null
                ? 'Included in every price. No rate is set on this quote.'
                : `At ${doc.totals.taxRate}%, shown on its own line.`}
            </DeskRow>
            {doc.terms === null ? (
              <DeskRow word="Terms" glyph={DESK_GLYPH.terms}>
                {NO_TERMS}
              </DeskRow>
            ) : null}
            <DeskRow word="The figures" glyph={DESK_GLYPH.figures}>
              Fixed when each item was chosen: a new price list changes the next quote, not this
              one.
              {doc.issued ? ' Make a new version to change it.' : ' Giving it makes it final.'}
            </DeskRow>
            <DeskRow word="The letterhead" glyph={DESK_GLYPH.letterhead}>
              {!doc.business
                ? NO_NAME_FROZEN
                : letterheadOf(doc.business).drawn
                  ? LETTERHEAD_MARK
                  : NO_LETTERHEAD}
            </DeskRow>
            <DeskRow word="The cover picture" glyph={DESK_GLYPH.picture}>
              {picture}
            </DeskRow>
          </dl>
        </div>
      </Plate>
    </div>
  )
}

/** One of the note's facts: the word, led by the glyph of what it is about, over its
 *  sentence. The glyph is hidden from a reader, who hears the word. */
function DeskRow({ word, glyph, children }: { word: string; glyph: Glyph; children: ReactNode }) {
  return (
    <div className="doc-desk__row">
      <dt className="doc-desk__word">
        <span className="doc-desk__glyph" aria-hidden="true">
          <Icon glyph={glyph} />
        </span>
        {word}
      </dt>
      <dd className="doc-desk__means">{children}</dd>
    </div>
  )
}

/** Several facts of one kind, one to a line rather than run together.
 *  Two lines can carry the same name and the same reason, and the same
 *  fact said twice on a note is noise, so each is said once. */
/** A code as the price list writes it, and where it leaves the cable length out, the gap said in
 *  words between its own characters (`codeGap`). */
function DeskCode({ code }: { code: string }) {
  const gap = codeGap(code)
  if (gap === null) return <span className="doc-desk__code">{code}</span>
  return (
    <span className="doc-desk__code">
      {gap.before}
      <span className="doc-desk__gap">{gap.gap}</span>
      {gap.after}
    </span>
  )
}

function DeskItems({ items }: { items: readonly string[] }) {
  return (
    <ul className="doc-desk__items">
      {[...new Set(items)].map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
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
function blocksOf(doc: PrintedQuote, art: CoverArt, travel: string, fit: number | null): Block[] {
  const out: Block[] = []
  out.push({
    id: 'cover',
    breakBefore: true,
    node: <Cover doc={doc} art={art} travel={travel} fit={fit} />,
  })

  /* THE BANDS THE CUSTOMER'S COPY PRINTS, and only those: a register
     that put nothing on the quote is off the paper, and a band left with
     no register is off it whole (`bandsOnPaper`). Until 2026-09-23 each
     of them printed a sentence — "Not taken. 4 rows were offered from
     Dealer Fit Packages and none is on this quote" — and every register
     that did put something on printed "Optional. 6 more were offered"
     under it: the dealer's census, on the buyer's paper. Both are on the
     note beside the sheet now, counted the same way. */
  for (const band of bandsOnPaper(doc)) {
    const { section } = band
    const from = out.length
    /* ONE QUANTITY DECISION PER BAND, so the figures in a band stand in
       one column whichever register they came from. */
    const qty = hasQuantity(band.tables.flatMap((t) => t.lines))
    out.push({
      id: `sec:${section.id}`,
      node: <SectionHead num={section.num} name={section.name} />,
    })
    if (qty) out.push({ id: `cols:${section.id}`, keepWithNext: 1, node: <Columns /> })
    for (const table of band.tables) {
      if (band.named) {
        out.push({ id: `tab:${table.id}`, keepWithNext: 1, node: <TableHead table={table} /> })
      }
      for (const line of table.lines) {
        out.push({ id: `line:${line.id}`, node: <Line line={line} qty={qty} /> })
      }
    }
    /* the head keeps whatever follows it, up to three atoms — the
       register's own name, the column row and the first line — so a
       section never opens at the foot of a page with nothing under it */
    out[from].keepWithNext = Math.min(3, out.length - from - 1)
  }

  if (doc.typed.length > 0) {
    const qty = hasQuantity(doc.typed)
    out.push({
      id: 'typed',
      keepWithNext: Math.min(2, doc.typed.length + 1),
      node: <SectionHead num="—" name={OTHER_ITEMS} />,
    })
    if (qty) out.push({ id: 'typed-cols', keepWithNext: 1, node: <Columns /> })
    for (const line of doc.typed) {
      out.push({ id: `line:${line.id}`, node: <Line line={line} qty={qty} /> })
    }
  }

  if (doc.adjustments.length > 0) {
    out.push({
      id: 'adj',
      keepWithNext: Math.min(2, doc.adjustments.length),
      node: <AdjustmentHead />,
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
            <span className="doc-row__fig doc-mono">{signedMoney(a.amount)}</span>
          </div>
        ),
      })
    }
  }

  out.push({ id: 'price', node: <YourPrice doc={doc} /> })
  /* THE TERMS PRINT ONLY WHERE THE DEALERSHIP WROTE THEM. A section
     whose whole content was a sentence saying it had none was the app
     explaining itself to the buyer; the dealer is told on the note. */
  if (doc.terms !== null) out.push({ id: 'terms', node: <Terms terms={doc.terms} /> })
  /* the one fact from the old record block a buyer needs: that this
     paper replaces one they may already hold. The rest of it — how the
     figures were frozen, that the file "can be reimported twice" — is
     the dealer's, on the note. */
  if (doc.supersedesId !== null) {
    out.push({
      id: 'record',
      node: <p className="doc-replaces">This quotation replaces an earlier one.</p>,
    })
  }
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
  travel,
  fit,
}: {
  doc: PrintedQuote
  art: CoverArt
  travel: string
  /** the picture's height in px where the cover would not fit its page at `--shot-max` */
  fit: number | null
}) {
  const register = registerOf(doc)
  const total = doc.totals.total
  const mark = letterheadOf(doc.business)

  return (
    <div className="doc-cover">
      <div className="doc-cover__mast">
        {/* THE LETTERHEAD. A dealership's name is the largest thing at
            the head of its own quotation, and from 2026-09-23 it is
            there: the file names the business, `ctxFrom` hands that name
            to the engine, and the engine freezes it onto the quote at
            mint (critique of Milestone 2, blocker #2 — "the one object
            that leaves the building has no dealership on it").

            A QUOTE THAT FROZE NO NAME PRINTS NO LETTERHEAD. Until this
            date the absence was a sentence on page 1 — "This business has
            not been named yet" — which is the app apologising to a buyer
            for something only the dealer can act on. The line stays, so
            the mast does not move, and the note beside the sheet says why
            it is empty. */}
        {/* THE DEALERSHIP'S OWN MARK, once held (2026-10-20): Northside Marine's dark-ink mark
            off its own site, up to 20 mm tall as the quote spec's letterhead asks, with the
            name as its words for a reader that does not see it */}
        {mark.drawn ? (
          <p className="doc-cover__house" data-named="" data-mark="">
            <img
              className="doc-cover__mark"
              src={mark.mark.src}
              alt={doc.business ?? mark.mark.brand}
              width={mark.mark.width}
              height={mark.mark.height}
            />
          </p>
        ) : (
          <p className="doc-cover__house" data-named={doc.business ? '' : undefined}>
            {doc.business ?? ''}
          </p>
        )}
        <div className="doc-cover__stamp">
          <p className="doc-cover__kind">
            {doc.issued ? 'Quotation' : 'Quotation · draft'}
            {' · '}
            <span className="doc-mono">{doc.reference}</span>
          </p>
          {/* THE DATE A BUYER READS, where the quote spec's letterhead
              puts it (§3, item 1). It was the first clause of a
              paragraph at the foot of the cover — "Given to the customer
              on …. Every figure on this document was frozen when the line
              was picked and cannot move." — whose second sentence read
              to a buyer as a price guarantee nobody at the dealership
              wrote. */}
          <p className="doc-cover__when">
            {doc.issued
              ? doc.issuedAt
                ? `Issued ${day(doc.issuedAt)}`
                : 'Issued'
              : 'Not issued yet'}
          </p>
        </div>
      </div>

      {/* WHAT THE PACKER MEASURED THE PICTURE TO BE rides on the box,
          because a render and a scene do not sit on paper the same
          way: a studio render is cut out on white and merges with the
          sheet it is printed on, so it takes a hairline to have an
          edge at all, while a photograph on the water already has
          four. The verdict is data — an edge-ring saturation reading
          the packer wrote into the ledger — and never a guess from a
          file name.

          THE WHOLE BOAT, NEVER A CROP OF IT (2026-09-25). The picture was
          `object-fit: cover` in a 72 mm band, which cut the top and the
          bottom off every render wider than the band's shape — the
          ADV7's T-top canopy sat on the frame's edge and its antenna was
          gone (m2-last-critique-2.md, major 2). It is fitted now: the
          held size, the measure and `--shot-max` are three ceilings and
          the picture is drawn at the smallest, whole — so it is never
          wider in CSS px than the pixels held, and never cut. The held
          size rides on the element as numbers, so the box is the
          picture's before a byte of it has loaded and the page's height
          does not move when it lands. */}
      <figure
        className="doc-shot"
        data-art={art.kind}
        data-verdict={art.kind === 'photograph' ? art.held.verdict : undefined}
      >
        {art.kind === 'photograph' ? (
          <img
            className="doc-shot__img"
            src={art.held.src}
            alt={
              doc.subject.finish === ''
                ? doc.subject.title
                : `${doc.subject.title}, ${doc.subject.finish}`
            }
            width={art.held.width}
            height={art.held.height}
            style={
              {
                '--held-w': art.held.width,
                '--held-h': art.held.height,
                /* THE BUILD'S PHOTOGRAPH LANDS HERE (the component kit, 2026-09-28): the
                   build's stage names this row's picture the same way, so the route's View
                   Transition carries it from the finale onto the cover. A name is a thing of
                   the screen and never of the paper: print draws no transition. */
                '--doc-travel': travel,
                ...(fit === null ? {} : { '--shot-fit': `${fit}px` }),
              } as CSSProperties
            }
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
        {/* A PHOTOGRAPH OF THE MODEL SAYS SO, in a line a brochure would print ("shown with
            optional equipment"): the heroes ledger holds one photograph per model, in its
            maker's finish and rig, and the version this quote is for is the title under it.
            The row's own copy is the exact boat and needs no line. */}
        {art.kind === 'photograph' && pictured(art.held) ? (
          <figcaption className="doc-shot__say">{pictured(art.held)}</figcaption>
        ) : null}
      </figure>

      {/* THE MAKER OVER THE NAME ONLY WHERE THE NAME DOES NOT SAY IT (the refine round's second
          pass, 2026-10-21): "HIGHFIELD INFLATABLES" over "Highfield Sport 660", and under a
          Stacer's own mark "STACER" over "Stacer 519 Sea Ranger SDF", said the maker two and
          three times on the cover. */}
      {saysMaker(doc.subject.title, register) ? null : (
        <p className="doc-cover__over">{register}</p>
      )}
      {/* THE BOAT AS A PERSON SAYS IT, on the one object that leaves the
          building (built-critique-m2-close-2.md, the one thing to change
          first): "Highfield ADV7", then "Hypalon · Black / Grey / Black"
          with a swatch of each colour the decode names. The price file's
          own string is the dealer's, in the note beside the paper.

          AND THE EXACT MODEL, WHOLE (2026-09-25, Phase 0): the title is
          `boatTitle`'s, so "Stacer 529 Assault Pro (Tournament)" keeps its
          "(Tournament)" in the headline — that is which 529 it is — where
          it was set under the name as "Tournament" beside nothing. The
          line under the title is the finish alone: the material and the
          colourway. */}
      <h1 className="doc-cover__name">{doc.subject.title}</h1>
      {doc.subject.finish === '' ? null : (
        <p className="doc-cover__detail">
          <Swatches colour={doc.subject.colour} />
          {doc.subject.finish}
        </p>
      )}

      {doc.subject.specs.length > 0 ? (
        /* `live/saxdor-brochure-specs-crop`: hairline rows at about
           55% of the measure, the label light and the value at a fixed
           indent. It is the quietest table in the sweep and it is the
           right one for a fact that is not money.

           A BOAT WITH NO SPECIFICATION COLUMNS PRINTS NONE. It printed
           "This register carries no specification columns for this
           boat" until 2026-09-23 — a sentence about the price file, to
           a buyer. A missing fact is left out, never filled.

           AND A MEASURE NOBODY STATES A UNIT FOR IS LEFT OFF (2026-09-25):
           Jeanneau's "Draft 0.45" was handed to the customer bare
           (m2-last-critique-2.md, minor 4). `readDocument` keeps it off
           `specs` and the note beside the paper says it and why. */
        <dl className="doc-specs">
          {doc.subject.specs.map((spec) => (
            <div className="doc-spec" key={spec.label}>
              <dt className="doc-spec__lab">{spec.label}</dt>
              <dd className="doc-spec__val">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="doc-rule" />
      <p className="doc-cover__summary">Summary</p>

      <div className="doc-money">
        <div className="doc-money__who">
          <p className="doc-lab">Prepared for</p>
          {/* A QUOTE ADDRESSED TO NOBODY PRINTS A BLANK LINE, the way a
              printed form does: "nobody yet" and "This quote is addressed
              to nobody" were the app's words to the dealer, and they are
              on the note beside the sheet. A draft with no name cannot be
              given to anybody, so this is only ever a proof on the desk. */}
          {doc.customer.name.trim() === '' ? (
            <p className="doc-money__name doc-money__blank" aria-hidden="true" />
          ) : (
            <p className="doc-money__name">{doc.customer.name.trim()}</p>
          )}
          {(doc.customer.contact ?? []).map((line) => (
            <p className="doc-money__line" key={line}>
              {line}
            </p>
          ))}
          {doc.preparedBy ? (
            <>
              <p className="doc-lab doc-money__by">Prepared by</p>
              <p className="doc-money__line doc-money__who-by">{doc.preparedBy}</p>
            </>
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
          <p className="doc-lab">{totalLabel(doc)}</p>
          <p className="doc-money__fig" data-testid="document-total">
            <PriceFigure amount={total} />
          </p>
          {/* NOTHING UNDER IT. "Every line below carries a figure, and this is
              their sum" was the app reassuring itself, and "The rigging kit … has no
              price on this quote, so it is not in this total" told the customer, at
              the moment of trust, that the figure was short (build-close-critique-2.md,
              major 5). The kit's own line says "Price to be confirmed", once, and the
              dealer read the sentence under the finale's total before the give. */}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* A section, a register, a row                                */
/* ---------------------------------------------------------- */

/**
 * THE BAND HEAD NAMES THE SECTION, AND ITS SUBTOTAL IS SAID ONCE, UNDER
 * "YOUR PRICE" (the refine round's second pass, 2026-10-21). The head
 * carried the subtotal at its right end — `live/qwilr-interactive-quote-crop`'s
 * shape — and a band of one item then printed one figure three times on
 * page 2: on the head, on its line, and under "Your price". The line
 * says its own figure, "Your price" says what each section comes to and
 * adds them to the total where the reader can see it, and the head says
 * which section this is. The sweep's band stays; its per-row checkbox
 * was rejected for this screen exactly — an issued line cannot be
 * unticked.
 *
 * The number and the name are `bands.ts`' own and are a READING ORDER
 * rather than a count: 03 means Trailer on every document this
 * business ever writes, and a quote with no trailer on it simply has
 * no 03.
 */
function SectionHead({ num, name }: { num: string; name: string }) {
  return (
    <div className="doc-band">
      <p className="doc-band__name">
        <span className="doc-band__num">{num}</span>
        {name}
      </p>
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
 * above them and each line reading name, quantity, amount. That is the
 * same shape Porsche's own configuration PDF carries, and it is why
 * every cell says its state in WORDS: a reader hearing a row gets
 * "Included" or "Price to be confirmed", never a blank where a
 * column header would have had to explain one.
 *
 * TWO COLUMNS, OR THREE, AND NEVER THE CODE. The dealer's code was the
 * second column until 2026-09-23 — `HBS145`, `703-CL51L-18-07` — which
 * is the file's key for a row and nothing a buyer orders by; it is on
 * the note beside the sheet. The quantity is a column only where a line
 * in the band is at more than one: a column of `1`s is a digit the
 * reader has to work out for nothing.
 *
 * AND THE COLUMN ROW IS DRAWN ONLY THEN. With two columns — a name and
 * a figure under a band head that already carries its own subtotal — a
 * row reading `ITEM · AMOUNT` says what the eye can already see, and it
 * said it four times a page, once under every register. With three, the
 * labels tell a quantity from an amount and earn their line.
 */
function Columns() {
  return (
    <div className="doc-row doc-row--cols" data-qty="">
      <span className="doc-row__name">Item</span>
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
function Line({ line, qty }: { line: DocumentLine; qty: boolean }) {
  /* ONE LINE UNDER THE NAME, IN THE BUYER'S WORDS (`noteOnPaper`): the
     arithmetic of a quantity, what the figure already includes, and a
     price agreed by hand with its reason. Until 2026-09-23 it also
     carried the pairing's workshop facts — "Prop Part No. 68F-459xx-xx ·
     Engine Hole TBA · Slot 1" — the reason a cell read as it did —
     "this register carries no price column at all" — and the file's own
     figure under a hand-typed one. Those are the dealer's, on the note. */
  const under = noteOnPaper(line)
  const word = cellWord(line)

  return (
    <div className="doc-row" data-state={line.state} data-qty={qty ? '' : undefined}>
      <span className="doc-row__name">
        {line.said}
        {under !== '' ? <span className="doc-row__facts">{under}</span> : null}
      </span>
      {qty ? (
        <span className="doc-row__qty doc-mono">{line.qty.toLocaleString('en-AU')}</span>
      ) : null}
      <span className="doc-row__fig doc-mono">
        {line.state === 'charged' ? money(line.amount ?? 0) : word}
      </span>
    </div>
  )
}

/** The adjustments band, named and not summed: each adjustment is its own row here and
 *  again under "Your price", which is where they are added up. Every one of them is its own
 *  visible row and is never folded into a subtotal: `model/quote.ts` argues it — the
 *  moment a discount stops being a row, nobody can answer "why is
 *  this $3,000 under the list?". */
function AdjustmentHead() {
  return (
    <div className="doc-band">
      <p className="doc-band__name">
        <span className="doc-band__num">—</span>
        {ADJUSTMENTS}
      </p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Your price, and the terms                                    */
/* ---------------------------------------------------------- */

/**
 * YOUR PRICE — every band the paper printed, then the typed lines,
 * then each adjustment on its own row with its reason, then the tax
 * lines where a person typed a rate, and the total under a rule. The
 * quote spec's §8, and its rule 7: the rows sum to the total, which
 * `paper.test.ts` proves on the real file.
 *
 * IT WAS "WHAT IT COMES TO" UNTIL 2026-09-23, and it printed the total
 * alone with a paragraph under it: "Amounts are what the price file
 * states, and the file states them with tax in — so nothing is
 * converted anywhere on this quote and no discount can land on the
 * wrong side of it. A tax rate is typed by a person or it is absent,
 * and nobody has typed one." That is how this app stores tax, told to
 * a buyer. The label beside the figure says "tax included", which is
 * the one fact the buyer needs; the rest is on the note beside the
 * sheet. And the bands above the total are what make the page add up
 * where a reader can see it do so, which the lone total did not.
 */
function YourPrice({ doc }: { doc: PrintedQuote }) {
  const t = doc.totals
  const rows = priceRows(doc)
  return (
    <section className="doc-sums" aria-label="Your price">
      <p className="doc-lab">Your price</p>
      <dl className="doc-sums__list">
        {rows.map((row) => (
          <div className="doc-sum" key={row.key} data-word={row.included ? 'included' : undefined}>
            <dt>{row.label}</dt>
            <dd className="doc-mono">{rowFigure(row)}</dd>
          </div>
        ))}
        {t.totalExcludingTax !== null ? (
          <>
            <div className="doc-sum doc-sum--step">
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
          <dt>{totalLabel(doc)}</dt>
          <dd>
            <PriceFigure amount={t.total} />
          </dd>
        </div>
      </dl>
      {/* WHAT IS NOT IN THE TOTAL IS SAID ONCE ON THE PAPER, on its own line: "Price to be
          confirmed". This summary repeated the cover's sentence word for word, and printed a row
          for a band with no figure (docs/WORDS.md, rule 2); a band with none is not a row here. */}
    </section>
  )
}

/** The dealer's standing terms, frozen onto this document when it was
 *  raised, and drawn only where there are some — a quote that invented
 *  a validity sentence would be inventing a contract, and a Terms
 *  section whose whole content is "there are none" is the app talking
 *  to itself on the buyer's paper. */
function Terms({ terms }: { terms: string }) {
  return (
    <section className="doc-terms" aria-label="The terms of this quote">
      <p className="doc-lab">Terms</p>
      {/* THE TERMS ARE ONE BLOCK AND KEEP THEIR OWN LINE BREAKS.
          `white-space: pre-line` rather than a split into paragraphs,
          because a dealership's terms are a typed sentence and the
          breaks in it are theirs: splitting would let this screen
          decide where one clause ends. It is one atom, so terms longer
          than a page get a page of their own — the packer's own answer
          for anything it cannot break. */}
      <p className="doc-terms__say">{terms}</p>
    </section>
  )
}

/** Whether a boat's printed name already names its maker: its first word is the maker's. */
function saysMaker(title: string, maker: string): boolean {
  const first = maker.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  return (
    first !== '' &&
    title
      .toLowerCase()
      .split(/[\s·/()-]+/)
      .includes(first)
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
