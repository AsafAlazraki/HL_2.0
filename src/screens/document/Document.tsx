import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  ArrowLeftIcon,
  CameraPlusIcon,
  FilePdfIcon,
  FileXIcon,
  GearSixIcon,
  ListChecksIcon,
  PrinterIcon,
} from '@phosphor-icons/react'
import {
  AddPicture,
  Button,
  Dialog,
  Icon,
  Plate,
  PriceFigure,
  Refusal,
  StatusDot,
  Swatches,
  Toggle,
  type Glyph,
} from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { useOptionPicture } from '@/app/optionPicture'
import { letterheadNow, preparerNow } from '@/app/northside'
import { contactLine } from '@/domain/northside/letterhead'
import type { FrozenLetterhead, OrgProfile, PaperSection, TableKind } from '@/domain/model'
import { money } from '@/domain/money'
import { setPaperSection, signedMoney } from '@/domain/quote'
import { localDay } from '@/domain/quote/day'
import {
  INCLUDED,
  detailToSet,
  readDocument,
  unreachableSay,
  type DocumentLine,
  type DocumentTable,
  type PrintedQuote,
} from '@/domain/quote/document'
import type { QuoteDef } from '@/domain/model'
import { DOORS, NO_WAYS, type Way } from '@/app/ways'
import { glyphOfWay } from '@/screens/shell/glyphs'
import {
  itemOf,
  itemOfQuote,
  letterheadOf,
  lineOf,
  pictureOfQuote,
  type HeldPicture,
} from '@/data/pictures'
import {
  coverArt,
  coverAskAct,
  coverAskSay,
  coverSay,
  groundOf,
  nightMarkOf,
  notPrintedSay,
  pictured,
  spanOf,
  type CoverArt,
} from './art'
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
  gstOnPaper,
  gstSay,
  hasQuantity,
  includesSay,
  kitsOnPaper,
  namesOnPaper,
  noteOnPaper,
  quantityShown,
  offeredOf,
  offeredSay,
  paperTitle,
  priceRows,
  includedUnsaid,
  pricedAtSay,
  reasonsOf,
  rowFigure,
  soleLine,
  totalLabel,
  unitlessOf,
  unsaidOf,
  subjectNoun,
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
   · THE COVER IS THE BOAT (2026-11-02, direction A of
     docs/directions/quote-3/cover-boards, picked in cover-pick.md). The
     page is the night's ink and the photograph runs off its top and both
     sides, whole and never past its own pixels in CSS px, its water
     melting into the dark; a studio picture stands on a pale panel that
     bleeds the same three edges. It reverses the band of 2026-09-25
     ("a full-page bleed would be an enlargement"): nothing here fills
     the page, so nothing is enlarged to.
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

/** The mark printed is the file added on Settings, not the one the app carries
 *  (built-critique-m4.md, major 6: the note said the website's for both). */
export const LETTERHEAD_MARK_ADDED = 'Northside Marine’s own mark, as added on Settings.'

/** The cover stands on a photograph and the mark printed has no light ink: said to the dealer. */
export const NIGHT_MARK_IN_TYPE =
  'The cover stands on its photograph, and the mark added on Settings is in dark ink only, so the cover sets the name in type there.'

/** Which mark the letterhead prints, said truly: the same choice `Letterhead` makes, and on a
 *  cover that stands on its photograph, the light ink it is set in there. */
export function letterheadSay(
  doc: Pick<PrintedQuote, 'business' | 'letterhead'>,
  onPhoto = false,
): string {
  if (!doc.business) return NO_NAME_FROZEN
  const held = letterheadOf(doc.business)
  const printed = doc.letterhead?.mark ?? (held.drawn ? held.mark : null)
  if (!printed) return NO_LETTERHEAD
  const said = held.drawn && held.mark.src === printed.src ? LETTERHEAD_MARK : LETTERHEAD_MARK_ADDED
  return onPhoto && nightMarkOf(doc.business, doc.letterhead) === null
    ? `${said} ${NIGHT_MARK_IN_TYPE}`
    : said
}

/** A quote whose letterhead froze no name — raised before the file's own
 *  name reached the engine, or on a sheet that names no business. The
 *  paper leaves the line empty rather than printing an apology on it. */
export const NO_NAME_FROZEN =
  'This quote was started before a business name was set, so its letterhead is empty. A new quote prints the name the price list gives.'

/** Northside's details the letterhead and the last page would print, and which are not set. */
export function missingDetails(letterhead: FrozenLetterhead): string[] {
  const words: Array<[keyof FrozenLetterhead, string]> = [
    ['address', 'address'],
    ['phone', 'phone'],
    ['email', 'email'],
    ['abn', 'ABN'],
  ]
  return words.filter(([key]) => !letterhead[key]).map(([, word]) => word)
}

/** Said on the note of the details nobody has set, which print nowhere until they are. */
export const NO_DETAILS = (missing: readonly string[]): string =>
  `No ${orList(missing)} is set on Settings, so the printed quote carries none.`

/** "phone", "phone or email", "title, phone or email". */
const orList = (items: readonly string[]): string =>
  items.length === 1
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`

/**
 * WHAT THE SALESPERSON'S LINE LEAVES OUT, said to the dealer (the quote round, 2026-11-02:
 * "Northside's contact details … the salesperson's line … where one is not set the paper leaves it
 * out and the desk note beside the paper says which"). The paper prints under "Prepared by" and on
 * the last page only the title, phone and email Settings holds for this person; '' where all three
 * are set, or where nobody prepared the quote (the note says so elsewhere).
 */
export function preparerSay(doc: Pick<PrintedQuote, 'preparedBy' | 'preparer'>): string {
  const name = doc.preparer?.name ?? doc.preparedBy
  if (!name) return ''
  const p = doc.preparer
  const missing = (
    [
      ['title', p?.title],
      ['phone', p?.phone],
      ['email', p?.email],
    ] as const
  )
    .filter(([, v]) => v === undefined || v.trim() === '')
    .map(([word]) => word)
  if (missing.length === 0) return ''
  const left =
    missing.length === 3
      ? 'prints the name alone'
      : missing.length === 1
        ? 'leaves it out'
        : 'leaves them out'
  return `No ${orList(missing)} is set on Settings for ${name}, so the printed quote ${left}.`
}

/** One thing the printed quote leaves off because Settings does not hold it, with where it is set. */
export interface Unset {
  /** what it is, as the panel names it */
  what: string
  /** what the paper does without it */
  so: string
  /** the press that opens it on Settings */
  act: string
  /** where Settings opens it: a letterhead line, or the person who prepared the quote */
  at: { line: string } | { person: string }
}

/**
 * WHAT THE PRINTED QUOTE LEAVES OFF BECAUSE NOBODY HAS WRITTEN IT, said where the paper is chosen,
 * each with where it is set (the owner's fully specced quote, read 2026-11-03: no way to reach
 * Northside, no terms, no deposit, no days a quote stands for, and "Prepared by Asaf" with no title,
 * phone or email). None of it is Northside's to be invented here, so the paper leaves each one off
 * and this says which, why it matters on the paper, and the one press that opens its field on
 * Settings. Northside's own contact details are said by `unreachableSay`, above these. [] where
 * Settings holds everything the paper prints.
 */
export function unsetOn(
  doc: Pick<PrintedQuote, 'letterhead' | 'terms' | 'preparer' | 'preparedBy'>,
): Unset[] {
  const lh = doc.letterhead
  const out: Unset[] = []
  if (!lh?.validDays && !lh?.validUntil)
    out.push({
      what: 'How many days a quote stands for',
      so: 'so no date it stands until prints',
      act: 'Set the days',
      at: { line: 'validDays' },
    })
  if (doc.terms === null)
    out.push({
      what: 'Northside’s terms',
      so: 'so the customer signs under the total with no terms above it',
      act: 'Write the terms',
      at: { line: 'quoteTerms' },
    })
  if (!lh?.deposit?.trim())
    out.push({
      what: 'The deposit wording',
      so: 'so nothing under the total says what secures the order',
      act: 'Write the deposit wording',
      at: { line: 'deposit' },
    })
  const name = doc.preparer?.name ?? doc.preparedBy
  if (name && preparerSay(doc) !== '')
    out.push({
      what: `${name}’s title, phone and email`,
      so: 'so “Prepared by” prints the name and nothing to reach them by',
      act: `Set ${name}’s details`,
      at: { person: name },
    })
  return out
}

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
  /**
   * DRAWN INSIDE ANOTHER SCREEN, as the build page's final package draws it (the quote round,
   * 2026-11-02: the package's own `<main>` held this one's, so the page had two main landmarks).
   * Embedded, the paper is a plain block with no landmark of its own, and its headings step down
   * under the host's h3: the cover's name is an h4 and each part's word an h5. On its own address
   * it is the page's `<main>` and the cover's name its h1.
   */
  embedded?: boolean
}

/** THE LEVEL THE PAPER'S HEADINGS START AT: 1 on its own address, 4 drawn inside the package. */
const HeadAt = createContext<1 | 4>(1)

/** A heading of the paper, `at` steps under the cover's name. */
function Heading({
  at,
  className,
  children,
}: {
  at: 0 | 1
  className: string
  children: ReactNode
}) {
  const base = useContext(HeadAt)
  const Tag = `h${base + at}` as 'h1' | 'h2' | 'h4' | 'h5'
  return <Tag className={className}>{children}</Tag>
}

export function Document({
  quoteId,
  goBack,
  print,
  ways = NO_WAYS,
  go,
  embedded = false,
}: DocumentProps) {
  const filed = useQuotes((s) => s.quotes)
  const apply = useQuotes((s) => s.apply)
  const read = useQuotes((s) => s.loaded)
  const problem = useQuotes((s) => s.problem)
  const quote = filed.find((q) => q.id === quoteId)

  if (!quote)
    return <Missing read={read} problem={problem} ways={ways} go={go} embedded={embedded} />
  return (
    <HeadAt.Provider value={embedded ? 4 : 1}>
      <Sheaf quote={quote} goBack={goBack} print={print} apply={apply} embedded={embedded} />
    </HeadAt.Provider>
  )
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
  embedded,
}: {
  read: boolean
  problem: string | null
  ways: readonly Way[]
  go?: (href: string) => void
  embedded: boolean
}) {
  const Root = embedded ? 'div' : 'main'
  return (
    <Root className="doc doc--blank" data-testid="document">
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
    </Root>
  )
}

/* ---------------------------------------------------------- */
/* The sheaf: the chrome, the floor, and the pages             */
/* ---------------------------------------------------------- */

/** One thing a reader reads as one, and the unit a page break may
 *  fall between but never through. */
interface Block extends Omit<Atom, 'height' | 'carry'> {
  node: ReactNode
  /** THE HEAD THIS ATOM IS PRINTED UNDER WHERE IT OPENS A PAGE: the block whose height it carries
   *  (its band's head), and the "continued" head drawn over it there */
  under?: { head: string; node: ReactNode }
}

function Sheaf({
  quote,
  goBack,
  print,
  apply,
  embedded,
}: {
  quote: QuoteDef
  goBack?: () => void
  print?: () => void
  apply: (quoteId: string, command: ReturnType<typeof setPaperSection>) => unknown
  embedded: boolean
}) {
  /* A DRAFT PRINTS NORTHSIDE'S LETTERHEAD AS IT STANDS TODAY; a given quote prints the one it was
     given with, and nothing on /manage reaches it (Milestone 4) */
  const org = useCatalogue((s) => s.org)
  const business = useCatalogue((s) => s.business)
  const drawn = useMemo(() => withToday(quote, { org, business }), [quote, org, business])
  const doc = useMemo(() => namesOnPaper(kitsOnPaper(readDocument(drawn))), [drawn])
  /* THE BOAT'S PICTURE, READ BY THE ONE READER THE BUILD'S STAGE READS BY (`@/data/pictures`):
     the model on the water, then the row's own copy, then the maker's mark — asked with the
     quote alone, because the paper renders with no catalogue at all. Read again when Northside's
     own pictures or a gallery's cover move, which the reader lays over the ledgers. */
  const own = useCatalogue((s) => s.ownPictures)
  const galleries = useCatalogue((s) => s.galleries)
  const art = useMemo(
    () => coverArt(quote, registerOf(doc)),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the store's records move the reader's answer
    [quote, doc, own, galleries],
  )
  /* AND THE PICTURE THE BUILD SHOWS, so the note can say where the two differ, and why */
  const shown = useMemo(
    () => pictureOfQuote(quote),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the store's records move the reader's answer
    [quote, own, galleries],
  )

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
  /* THE PICTURES AS THE PRINTER IS HANDED THEM (`usePrinted`): each held picture drawn once as a
     JPEG no wider than the sheet needs, so the saved PDF carries a photograph and not its pixels
     unpacked */
  const { printed, ready } = usePrinted(doc, art)
  const blocks = useMemo(
    () => blocksOf(doc, art, travel, fit, printed),
    [doc, art, travel, fit, printed],
  )

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
  /* THE COVER'S OWN ROOM, which keeps the foot's: its foot prints nothing, so its words stand as
     far over the sheet's lower edge as the letterhead stands under its top (document.css) */
  const coverGauge = useRef<HTMLSpanElement>(null)
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
    const coverRoom = coverGauge.current?.clientHeight || room
    const leads = new Map(blocks.map((b) => [b.id, leadOf(held.current.get(b.id))]))
    const atoms: Atom[] = blocks.map(({ under, ...block }) => ({
      ...block,
      height: held.current.get(block.id)?.offsetHeight ?? 0,
      lead: leads.get(block.id) ?? 0,
      /* a continued head stands the height of the head it repeats where that opens a sheet */
      ...(under
        ? {
            carry: (held.current.get(under.head)?.offsetHeight ?? 0) - (leads.get(under.head) ?? 0),
          }
        : {}),
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
    const laid = room > 0 && !atoms.every((a) => a.height === 0) ? paginate(atoms, room) : null
    delete element.dataset.gauging
    /* a cover taller than its room, with a line's air above the foot's rule, takes the
       difference off the picture, never below half of it */
    if (shot && coverRoom > 0 && cover + COVER_AIR > coverRoom) {
      const next = Math.floor(shot.height - (cover + COVER_AIR - coverRoom))
      if (next >= shot.height / 2) {
        const of = doc.reference
        setFit((was) => (was?.of === of && was.px === next ? was : { of, px: next }))
      }
    }
    if (laid === null) return
    setPages((was) => (was && same(was, laid) ? was : laid))
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

  /* THE CHROME'S HEIGHT, for the note that stays beside the sheets under it at a desk
     (document.css, `--chrome-h`): read off the bar, since its words wrap with the window */
  useEffect(() => {
    const element = root.current
    const bar = element?.querySelector<HTMLElement>('.doc-chrome')
    if (!element || !bar || typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(() => {
      element.style.setProperty('--chrome-h', `${bar.offsetHeight}px`)
    })
    watch.observe(bar)
    return () => {
      watch.disconnect()
    }
  }, [])

  const settled = pages !== null
  const sheets = pages ?? [blocks.map((b) => b.id)]
  const byId = new Map(blocks.map((b) => [b.id, b]))
  /* ON ITS OWN ADDRESS THE PAPER IS THE PAGE'S MAIN; inside the package it is a block of the
     host's, which already has one */
  const Root = embedded ? 'div' : 'main'

  return (
    <Root
      className="doc"
      data-testid="document"
      ref={(element: HTMLElement | null) => {
        root.current = element
      }}
    >
      <Chrome
        doc={doc}
        pages={settled ? sheets.length : null}
        goBack={goBack}
        print={print}
        ready={ready}
      />

      <div className="doc-floor">
        {/* WHAT GOES ON THE PAPER, chosen beside it: first in the reading order, so a salesperson
            on a phone meets the switches before the pages they change */}
        <SectionsPanel
          doc={doc}
          apply={apply}
          quote={quote}
          art={art}
          shown={shown}
          people={org?.people ?? []}
        />
        <article
          className="doc-sheaf"
          data-settled={settled ? 'yes' : 'no'}
          /* the pictures as the printer is handed them are made (`usePrinted`) */
          data-pictures={ready ? 'ready' : 'packing'}
          /* A GIVEN QUOTE PRINTS IN THE COLOUR IT WAS GIVEN IN. The paper's rules, reference and
             band numbers read `--color-accent`; on a given quote it is pinned here, on the paper,
             to the colour frozen at the give, so a brand colour kept tomorrow repaints every
             screen and never this paper (built-critique-m4.md, blocker 3). A draft wears today's. */
          style={doc.accent ? ({ '--color-accent': doc.accent } as CSSProperties) : undefined}
          data-accent={doc.accent ?? undefined}
          aria-label={`Quote ${doc.reference} for ${named(doc.customer.name)}`}
        >
          {sheets.map((ids, i) => (
            <section
              className="doc-page"
              key={ids[0] ?? i}
              data-page={i + 1}
              /* THE COVER IS THE NIGHT'S PAGE: its ground, its foot and its letterhead in light ink
                 (document.css, "the boat is the page") */
              data-night={i === 0 && ids[0] === 'cover' ? '' : undefined}
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
                  reference to be findable, so it is here, once a page,
                  and not again in the foot. A quote that froze no name hangs nothing: a
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
                      Quotation · <span className="doc-ref">{doc.reference}</span>
                    </span>
                  </>
                )}
              </header>
              <div className="doc-page__flow">
                {/* A BAND THAT RUNS OVER A PAGE BREAK SAYS SO AT THE TOP OF THE NEXT SHEET, so the
                    line that opens it belongs to something on its own page */}
                {i > 0 && byId.get(ids[0] ?? '')?.under ? (
                  <div className="doc-atom" data-atom="cont">
                    {byId.get(ids[0] ?? '')?.under?.node}
                  </div>
                ) : null}
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
              {/* THE FOOT CARRIES THE PAGE'S NUMBER ALONE, AND THE COVER'S CARRIES NOTHING (the
                  owner's fully specced quote, read 2026-11-03): the reference printed in every foot
                  right under a running head that already says it, so it stood twice on every page
                  and three times on the cover, which also said "Page 1 of 4" under its own
                  stamp. The reference is the cover's stamp and every later page's running head. */}
              <footer className="doc-page__foot" data-cover={i === 0 ? '' : undefined}>
                {i === 0 ? null : (
                  <span>
                    Page {i + 1}
                    {settled ? ` of ${sheets.length}` : ''}
                  </span>
                )}
              </footer>
            </section>
          ))}
        </article>
        {/* the page's own content box, measured rather than written
            down twice. Zero width, no text, out of the reading order. */}
        <span className="doc-gauge" ref={gauge} aria-hidden="true" />
        <span className="doc-gauge" data-cover="" ref={coverGauge} aria-hidden="true" />

        {/* AFTER THE PAPER IN THE READING ORDER AND BESIDE IT ON THE
            FLOOR. The sheet is the subject of this screen, so a reader
            with no screen meets the whole document before anything the
            room has to say about it; a grid puts the note in the margin
            at a desk width, which changes where it is drawn and never
            where it is read. */}
        <DeskNote doc={doc} art={art} shown={shown} />
      </div>
    </Root>
  )
}

/* ---------------------------------------------------------- */
/* The pictures as the printer is handed them                   */
/* ---------------------------------------------------------- */

/** The widest a picture is handed to the printer, in its own pixels: the cover runs the sheet's
 *  210 mm, which this is at 240 dpi; a line's picture stands in 28 mm, which `LINE_PX` is at 500. */
const COVER_PX = 2000
const LINE_PX = 560

/** How long a press of Print waits for the pictures to be packed, in ms, before it prints anyway. */
const PACK_WAIT = 3000

/** The pictures the printer is handed, by the held address and the width asked: a JPEG's address. */
type Printed = ReadonlyMap<string, string>

/** Where a held picture is drawn from on the paper: its JPEG where one is made, else itself. */
const printedSrc = (printed: Printed, src: string, px: number): string =>
  printed.get(`${src}@${px}`) ?? src

/** Every held picture this paper prints, with the width it is handed at. */
function picturesOn(doc: PrintedQuote, art: CoverArt): Array<{ src: string; px: number }> {
  const out: Array<{ src: string; px: number }> = []
  if (art.kind === 'photograph') {
    out.push({ src: art.held.src, px: COVER_PX })
    /* the hull's line carries the cover's own picture, small */
    out.push({ src: art.held.src, px: LINE_PX })
  }
  for (const band of bandsOnPaper(doc))
    for (const table of band.tables)
      for (const line of table.lines) {
        const held = table.subject ? null : heldFor(line)
        if (held) out.push({ src: held.src, px: LINE_PX })
      }
  return out
}

/**
 * ONE HELD PICTURE AS A JPEG, no wider than `px`, on white — or null where this browser cannot draw
 * one (a test's DOM, a picture that will not decode), and the paper keeps the held file.
 */
async function jpegOf(src: string, px: number): Promise<string | null> {
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = src
    await img.decode()
    const scale = Math.min(1, px / img.naturalWidth)
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = globalThis.document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const pen = canvas.getContext('2d')
    if (!pen) return null
    /* A CUT-OUT ON WHITE STAYS ON WHITE: a JPEG holds no transparency, and a part's clear ground
       would print black. The sheet is white, so its white is the sheet's. */
    pen.fillStyle = getComputedStyle(globalThis.document.documentElement)
      .getPropertyValue('--color-white')
      .trim()
    pen.fillRect(0, 0, w, h)
    pen.drawImage(img, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((done) => {
      canvas.toBlob(done, 'image/jpeg', 0.86)
    })
    return blob ? URL.createObjectURL(blob) : null
  } catch {
    return null
  }
}

/**
 * THE SAVED PDF IS A FILE A MAIL SYSTEM TAKES (the owner's fully specced quote, read 2026-11-03: 13.9
 * MB for four pages, "most of it the cover photograph", against an app whose own flow is "Email it"
 * with the PDF attached). A browser hands a WebP to its PDF as raw pixels — the Sport 660's 2,560 x
 * 1,918 photograph came to most of that — and hands a JPEG over as the JPEG it is. So each held
 * picture the paper prints is drawn once here as a JPEG, no wider than the sheet needs it
 * (`COVER_PX`, `LINE_PX`), and the paper draws that. It is the same picture, of the same model, only
 * packed for paper: nothing is cropped, and nothing is drawn larger than its own pixels.
 * Until a JPEG is made, and in a browser that cannot make one, the held file is drawn.
 */
function usePrinted(doc: PrintedQuote, art: CoverArt): { printed: Printed; ready: boolean } {
  const wanted = useMemo(() => picturesOn(doc, art), [doc, art])
  const key = wanted.map((w) => `${w.src}@${w.px}`).join('|')
  const [made, setMade] = useState<{ of: string; urls: Printed }>(() => ({
    of: '',
    urls: new Map(),
  }))
  const all = useRef<string[]>([])
  useEffect(() => {
    let alive = true
    void Promise.all(
      wanted.map(async (w): Promise<[string, string | null]> => [
        `${w.src}@${w.px}`,
        await jpegOf(w.src, w.px),
      ]),
    ).then((pairs) => {
      const urls = new Map<string, string>()
      for (const [at, url] of pairs) if (url !== null) urls.set(at, url)
      all.current.push(...urls.values())
      /* MADE, OR TRIED: a browser that could not make one keeps the held file, and is ready too */
      if (alive) setMade((was) => ({ of: key, urls: urls.size > 0 ? urls : was.urls }))
    })
    return () => {
      alive = false
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the key is what the list holds
  }, [key])
  useEffect(
    () => () => {
      for (const url of all.current) URL.revokeObjectURL(url)
    },
    [],
  )
  return { printed: made.urls, ready: key === '' || made.of === key }
}

/** What an atom gives up where it opens a sheet (`Atom.lead`), read while gauging, where no atom
 *  opens one: its height drawn as the first on a sheet, taken from its height drawn after another.
 *  Measured rather than read off the head's padding, because a head beside taller figures gives up
 *  nothing (`.doc-sums__body[data-beside]`). */
function leadOf(atom: HTMLElement | undefined): number {
  /* a band's head opens a sheet at the same air a part's word does (document.css, `--open-cap`),
     which can be more than it keeps after a line: then it gives up less than nothing */
  if (
    !atom ||
    (atom.getElementsByClassName('doc-part').length === 0 &&
      atom.getElementsByClassName('doc-band').length === 0)
  )
    return 0
  const after = atom.offsetHeight
  atom.dataset.opening = ''
  const first = atom.offsetHeight
  delete atom.dataset.opening
  return after - first
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
  ready = true,
}: {
  doc: PrintedQuote
  pages: number | null
  goBack?: () => void
  print?: () => void
  /** the pictures are packed for the printer (`usePrinted`) */
  ready?: boolean
}) {
  const fire = useCallback(() => {
    if (print) {
      print()
      return
    }
    globalThis.print?.()
  }, [print])
  /* A PRESS BEFORE THE PICTURES ARE PACKED WAITS FOR THEM, for a moment and no longer: the printer
     is handed the JPEGs the saved PDF should carry, or, past `PACK_WAIT`, the held files */
  const waiting = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fireOnce = useCallback(() => {
    if (waiting.current === null) return
    clearTimeout(waiting.current)
    waiting.current = null
    fire()
  }, [fire])
  useEffect(() => {
    if (ready) fireOnce()
  }, [ready, fireOnce])
  useEffect(
    () => () => {
      if (waiting.current !== null) clearTimeout(waiting.current)
    },
    [],
  )
  const press = useCallback(() => {
    if (ready) {
      fire()
      return
    }
    if (waiting.current === null) waiting.current = setTimeout(fireOnce, PACK_WAIT)
  }, [ready, fire, fireOnce])

  return (
    <div className="doc-chrome">
      <div className="doc-chrome__who">
        {/* WHERE THE QUOTE STANDS, the kit's way: a dot in its own ink beside its word —
            given leaf, draft rose (tokens.css, THE KIT) — and the reference beside it */}
        <p className="doc-eyebrow">
          <StatusDot state={doc.issued ? 'given' : 'draft'}>
            {doc.issued ? 'Given to the customer' : 'Not given to the customer yet'}
          </StatusDot>
          <span className="doc-eyebrow__ref doc-mono doc-ref">{doc.reference}</span>
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
        <Button intent="act" icon={PrinterIcon} onClick={press}>
          Print
        </Button>
      </div>

      <p className="doc-chrome__say">
        <span className="doc-chrome__glyph" aria-hidden="true">
          <Icon glyph={FilePdfIcon} />
        </span>
        {PRINT_IS_THE_PAGE}
      </p>
      {/* IN A HAND THE PAPER COMES FIRST AND WHAT PRINTS AFTER IT (the owner's fully specced quote,
          read 2026-11-03, the second print: at 390 x 844 the first screen was the panel down to
          y 740 and no part of the paper). The panel moves under the paper there (document.css),
          and this is the way to it from the top. */}
      <p className="doc-chrome__to-pick">
        <Button intent="veiled" size="sm" icon={ListChecksIcon} onClick={toThePick}>
          What goes on it, and what is not set
        </Button>
      </p>
    </div>
  )
}

/** Down to the panel where the paper is chosen, and onto it for a keyboard. */
function toThePick(): void {
  const panel = globalThis.document.querySelector<HTMLElement>('.doc-pick')
  if (!panel) return
  const still = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true
  panel.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
  panel.focus({ preventScroll: true })
}

/* ---------------------------------------------------------- */
/* What goes on the paper                                      */
/* ---------------------------------------------------------- */

/** Said where the salesperson chooses, of the parts that are never optional, and why. */
export const ALWAYS_IN =
  'The cover, every item the customer pays for, the price and the signatures are always printed: nothing charged is ever left off the printed quote.'

/** Said on a given quote's choice: it is the quote's, as it was given. */
export const CHOSEN_AT_THE_GIVE =
  'Given with this choice, so the printed quote is the one the customer holds. Make a new version to change it.'

/** Why "What comes with your boat" cannot be printed: Northside's price list carries no list. */
export const NO_INCLUSIONS =
  'Northside’s price list carries no list of what comes with each boat, so there is nothing to print yet.'

/** Why no page in Northside's own words can be printed. */
export const NO_WRITTEN_PAGES =
  'No page in Northside’s own words has been written, so there is none to print.'

/** Why the specification cannot be printed on this quote. */
export const NO_SPECS =
  'The price list gives no specifications for this, so there is none to print.'

/** Why there are no pictures to put beside the lines, and what puts one there (the quote round's
 *  audit, 2026-11-02, D2: the build shows the makers' pictures on the tiles, and the panel said only
 *  that none could print). A maker's picture on the build is not a person's check that it shows
 *  the exact item, so the customer's copy carries only one a person checked or Northside added. */
export const NO_LINE_PICTURES =
  'No item on this quote has a picture checked as that exact item yet. A picture Northside adds to an item on the build prints beside it.'

/** Why an item on the paper has no picture beside it, and what puts one there. */
export const NO_LINE_PICTURE =
  'No picture of these exact items has been checked, so none prints beside them. A picture Northside adds to one on the build prints beside it.'

/** The items the paper prints with no picture beside them, by the names it prints them under: every
 *  item but the hull (whose picture is the cover's) that holds no picture checked as itself. */
export function unpicturedOf(doc: PrintedQuote): string[] {
  return bandsOnPaper(doc)
    .flatMap((band) => band.tables.filter((t) => !t.subject))
    .flatMap((t) => t.lines)
    .filter((line) => heldFor(line) === null)
    .map((line) => line.said)
}

/** Why Northside's terms cannot be printed. */
export const NO_TERMS_SET = 'No terms are written on Settings yet.'

/** Why no deposit wording can be printed. */
export const NO_DEPOSIT_SET = 'No deposit wording is written on Settings yet.'

/** Why Northside's details cannot be printed. */
export const NO_DETAILS_SET = 'No address, phone, email or ABN is set on Settings yet.'

/** One section the salesperson may print or leave off, or the sentence why it cannot print. */
export interface PaperChoice {
  /** the section it switches; null for one this quote can never print (it is refused) */
  section: PaperSection | null
  label: string
  /** what it holds, where a count says it: "8 facts", "3" */
  holds: string
  on: boolean
  refused?: string
}

/** "8 facts", "1 picture", or '' for none. */
const count = (n: number, one: string, many: string): string =>
  n === 0 ? '' : `${n.toLocaleString('en-AU')} ${n === 1 ? one : many}`

/** A switch's words: the section, and what it holds where a count says it. */
const choiceSaid = (choice: PaperChoice): string =>
  choice.holds === '' ? choice.label : `${choice.label} · ${choice.holds}`

/** Northside's details the paper would print, where any is set. */
const hasDetails = (lh: FrozenLetterhead | null): boolean =>
  lh !== null &&
  [lh.legalName, lh.abn, lh.address, lh.phone, lh.email, lh.website].some(
    (v) => v !== undefined && v.trim() !== '',
  )

/** The lines on the paper of one kind that carry their own facts. */
const withFacts = (doc: PrintedQuote, kinds: readonly TableKind[]): number =>
  bandsOnPaper(doc)
    .flatMap((band) => band.tables.filter((t) => !t.subject && kinds.includes(t.kind)))
    .flatMap((table) => table.lines)
    .filter((line) => line.own.length > 0).length

/**
 * EVERY SECTION THE PANEL OFFERS, in the order the paper prints them: the specification, the
 * pictures beside the items, the motor's and the trailer's own facts (only where the quote carries
 * such a line), Northside's terms, its deposit wording and its details — and the two it cannot
 * print, each with its reason. A section with nothing to print is refused where it is, with why.
 */
export function choicesOf(doc: PrintedQuote): PaperChoice[] {
  const facts = doc.subject.sheet.reduce((n, g) => n + g.rows.length, 0)
  const withPictures = bandsOnPaper(doc)
    .flatMap((band) => band.tables.filter((table) => !table.subject))
    .flatMap((table) => table.lines)
    .filter((line) => heldFor(line) !== null).length
  const motors = withFacts(doc, ['motor', 'package'])
  const trailers = withFacts(doc, ['trailer'])
  const out: PaperChoice[] = [
    {
      section: 'specs',
      label: 'Specifications',
      holds:
        facts === 0
          ? ''
          : `${count(facts, 'fact', 'facts')}${facts <= COVER_FACTS ? ', on the cover' : ''}`,
      on: doc.chosen.specs && facts > 0,
      ...(facts === 0 ? { refused: NO_SPECS } : {}),
    },
    {
      section: 'pictures',
      label: 'Pictures beside the items',
      holds: count(withPictures, 'picture', 'pictures'),
      on: doc.chosen.pictures && withPictures > 0,
      ...(withPictures === 0 ? { refused: NO_LINE_PICTURES } : {}),
    },
  ]
  if (motors > 0)
    out.push({
      section: 'motor',
      label: 'The motor’s specification',
      holds: motors > 1 ? count(motors, 'motor', 'motors') : '',
      on: doc.chosen.motor,
    })
  if (trailers > 0)
    out.push({
      section: 'trailer',
      label: 'The trailer’s specification',
      holds: trailers > 1 ? count(trailers, 'trailer', 'trailers') : '',
      on: doc.chosen.trailer,
    })
  out.push(
    {
      section: 'terms',
      label: 'Northside’s terms',
      holds: '',
      on: doc.chosen.terms && doc.terms !== null,
      ...(doc.terms === null ? { refused: NO_TERMS_SET } : {}),
    },
    {
      section: 'deposit',
      label: 'The deposit wording',
      holds: '',
      on: doc.chosen.deposit && Boolean(doc.letterhead?.deposit),
      ...(doc.letterhead?.deposit ? {} : { refused: NO_DEPOSIT_SET }),
    },
    {
      section: 'details',
      label: 'Northside’s details',
      holds: '',
      on: doc.chosen.details && hasDetails(doc.letterhead),
      ...(hasDetails(doc.letterhead) ? {} : { refused: NO_DETAILS_SET }),
    },
  )
  if (doc.subject.kind === 'boat' || doc.subject.kind === null)
    out.push({
      section: null,
      label: 'What comes with your boat',
      holds: '',
      on: false,
      refused: NO_INCLUSIONS,
    })
  out.push({
    section: null,
    label: 'Pages in Northside’s words',
    holds: '',
    on: false,
    refused: NO_WRITTEN_PAGES,
  })
  return out
}

/**
 * THE SECTION PICKER (quote-spec §7a; the owner, 2026-10-30: "ability to add/remove sections that
 * appear there"). Porsche's "Select PDF content", beside the paper rather than in a dialogue, so
 * the sheet itself is the live preview: a switch pressed here takes its pages on or off the
 * paper in the same moment. It stands on the floor and never on the paper, and print takes it
 * away with the rest of the room.
 *
 * EACH SWITCH SAYS WHAT IT HOLDS, AND ONE THAT CANNOT BE PRESSED SAYS WHY, where it is (CLAUDE.md:
 * "a refusal is a sentence with its reason, where it is refused"): a specification the file does
 * not hold, a quote with no pictured item, terms, deposit wording or details nobody set, the
 * inclusions list Northside's file does not carry, the written pages nobody has written — and, on
 * a given quote, the choice it was given with, which no switch can change. What is never optional
 * is said once, with why: an item the customer pays for is never left off the paper.
 */
function SectionsPanel({
  doc,
  apply,
  quote,
  art,
  shown,
  people,
}: {
  doc: PrintedQuote
  apply: (quoteId: string, command: ReturnType<typeof setPaperSection>) => unknown
  quote: QuoteDef
  art: CoverArt
  shown: HeldPicture | null
  /** Northside's people as Settings holds them, so a person's own details open by their id */
  people: ReadonlyArray<{ id: string; name: string }>
}) {
  const quoteId = quote.id
  /* EACH THING SAID ONCE (the owner's fully specced quote, read 2026-11-03, the second print: "Not
     set when it was given" said the terms and the deposit wording were not set, and the list under
     it said "Northside's terms: none to print" and "The deposit wording: none to print" again, and
     "Northside's details: none to print" repeated the warning above it). A section that cannot
     print for want of a word on Settings is said where Settings is asked for, with its press, and
     is no switch of its own until it is set. Lost: three refused switches on every quote. */
  const asked = new Set<PaperSection>(['terms', 'deposit', 'details'])
  const choices = choicesOf(doc).filter(
    (choice) => !(choice.refused && choice.section !== null && asked.has(choice.section)),
  )
  const noun = subjectNoun(doc)
  const cover = coverAskSay(art, shown, noun, { finish: doc.subject.finish, motor: motorOn(doc) })
  const unreachable = unreachableSay(doc.letterhead, doc.preparer, doc.chosen.details)
  const unset = unsetOn(doc)
  /* where Settings opens each: its line, or the person by their id (one not held yet is added) */
  const hrefOf = (at: Unset['at']): string =>
    'line' in at
      ? `/manage?line=${at.line}`
      : `/manage?person=${people.find((p) => p.name.toLowerCase() === at.person.toLowerCase())?.id ?? 'new'}`
  const set = (section: PaperSection) => (on: boolean) => {
    apply(quoteId, setPaperSection(section, on))
  }
  return (
    <div className="doc-pick" tabIndex={-1}>
      <Plate as="section" pad="md" label="What goes on the printed quote">
        <div className="doc-pick__in">
          <p className="doc-desk__lab">On the printed quote</p>
          <p className="doc-desk__say">{ALWAYS_IN}</p>
          {unreachable === '' && cover === '' && unset.length === 0 ? null : (
            <div className="doc-pick__asks">
              {/* NOTHING ON THIS PAPER REACHES NORTHSIDE, said where the paper is chosen and given
                (quote-spec §0, rule 5), with the way to put it right on a draft; the customer's
                copy says nothing of it */}
              {unreachable === '' ? null : (
                <div className="doc-pick__reach" data-testid="document-unreachable">
                  <Refusal on="room">{unreachable}</Refusal>
                  {doc.issued ? null : (
                    <Button
                      intent="veiled"
                      size="sm"
                      href={`/manage?line=${detailToSet(doc.letterhead)}`}
                      icon={GearSixIcon}
                    >
                      Open Settings
                    </Button>
                  )}
                </div>
              )}
              {/* AND EVERYTHING ELSE THE PAPER LEAVES OFF FOR WANT OF A WORD ON SETTINGS, each with the
                  press that opens its field (`unsetOn`); a given quote says what it was given
                  without, and offers nothing, since Settings no longer reaches it */}
              {unset.length === 0 ? null : (
                <div className="doc-pick__reach" data-testid="document-unset">
                  <p className="doc-desk__lab">
                    {doc.issued ? 'Not set when it was given' : 'Not set on Settings'}
                  </p>
                  <ul className="doc-pick__unset">
                    {unset.map((u) => (
                      <li key={u.what}>
                        <span className="doc-pick__unset-say">
                          <b>{u.what}</b>: {doc.issued ? 'none was set' : 'none is set'}, {u.so}.
                        </span>
                        {doc.issued ? null : (
                          <Button intent="veiled" size="sm" href={hrefOf(u.at)} icon={GearSixIcon}>
                            {u.act}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* WHY THE COVER IS NOT THE BOAT'S PHOTOGRAPH, said where the paper is chosen, with the one
                act that changes it on a draft (the quote round's audit, round 2, D1) */}
              {cover === '' ? null : (
                <div className="doc-pick__reach" data-testid="document-cover-ask">
                  <p className="doc-desk__lab">The cover</p>
                  <Refusal on="room">{cover}</Refusal>
                  {doc.issued ? null : (
                    <CoverPhotograph quote={quote} doc={doc} noun={noun} shown={shown} />
                  )}
                </div>
              )}
            </div>
          )}
          {doc.issued ? (
            /* A GIVEN QUOTE'S CHOICE IS ITS OWN: said, not offered as switches that cannot move */
            <>
              <ul className="doc-pick__list doc-pick__list--given">
                {choices
                  .filter((choice) => choice.section !== null)
                  .map((choice) => (
                    <li key={choice.label} data-on={choice.on ? '' : undefined}>
                      {choice.label}:{' '}
                      {choice.refused ? 'none to print' : choice.on ? 'printed' : 'left off'}
                    </li>
                  ))}
              </ul>
              <p className="doc-desk__say">{CHOSEN_AT_THE_GIVE}</p>
            </>
          ) : (
            <ul className="doc-pick__list">
              {choices.map((choice) => (
                <li key={choice.label}>
                  <Toggle
                    label={choiceSaid(choice)}
                    checked={choice.on}
                    {...(choice.section !== null && !choice.refused
                      ? { onCheckedChange: set(choice.section) }
                      : {})}
                    refusedBecause={choice.refused}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Plate>
    </div>
  )
}

/**
 * NORTHSIDE'S OWN PHOTOGRAPH FOR THE COVER, ADDED BESIDE THE PAPER (the owner, 2026-10-30: "a
 * cover page ... using boats photo"; the quote round's audit, round 2, D1). The kit's control for
 * one option's pictures (`AddPicture`), bound to the row this quote is written against by the same
 * hand the build's stage uses (`useOptionPicture`): drop, paste or choose a photograph, then press
 * "Make it the cover". Each is one step on the catalogue's stack with its Undo, and the paper
 * beside it reads the new cover the moment it is taken (`coverArt` is read again when Northside's
 * pictures or a gallery's cover move). Nothing here checks a maker's photograph on the dealer's
 * behalf: only a picture Northside adds, or one a person marked, prints.
 */
function CoverPhotograph({
  quote,
  doc,
  noun,
  shown,
}: {
  quote: QuoteDef
  doc: PrintedQuote
  noun: string
  shown: HeldPicture | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={`Pictures of the ${doc.subject.title}`}
      description={coverAskAct(noun, shown)}
      trigger={
        <Button intent="veiled" size="sm" icon={CameraPlusIcon} aria-haspopup="dialog">
          Add a photograph for the cover
        </Button>
      }
    >
      {open ? <CoverPictures quote={quote} doc={doc} /> : null}
    </Dialog>
  )
}

/** The control, bound only while its dialog stands. */
function CoverPictures({ quote, doc }: { quote: QuoteDef; doc: PrintedQuote }) {
  const item = useMemo(() => itemOfQuote(quote), [quote])
  return (
    <AddPicture {...useOptionPicture(item, doc.subject.title, doc.subject.kind ?? undefined)} />
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
function DeskNote({
  doc,
  art,
  shown,
}: {
  doc: PrintedQuote
  art: CoverArt
  /** the picture the build shows for what is sold, or null */
  shown: HeldPicture | null
}) {
  const census = offeredOf(doc)
  const leftOff = census.filter((o) => o.took === 0)
  const alsoOffered = census.filter((o) => o.took > 0)
  const reasons = reasonsOf(doc)
  const workshop = workshopOf(doc)
  const codes = codesOf(doc)

  const unitless = unitlessOf(doc)
  const unsaid = unsaidOf(doc)
  const unpictured = unpicturedOf(doc)
  const noun = subjectNoun(doc)
  /* WHAT THE PICTURE SHOWS AND WHOSE IT IS, and not how it is drawn (the refine critique, 18;
     docs/WORDS.md rule 1): it led with "1,917 × 845 pixels, printed whole at 658 × 290, never
     enlarged", the screen's measurement of its own drawing, told to a dealer. And where the build
     shows a picture the cover does not print, which one and why (`notPrintedSay`). */
  const picture = coverSay(art, noun)
  const unprinted = notPrintedSay(shown, art, noun, !doc.issued)

  return (
    /* THE NOTE IS THE KIT'S WHITE PLATE ON THE FLOOR, beside the paper and never on it. The
       frame says where it stands (the margin at a desk, under the last sheet below that); the
       plate is the surface; its facts are led by the glyph of what each is about. */
    <div className="doc-desk">
      <Plate as="aside" pad="md" label="What is not printed">
        {/* at a desk it scrolls inside its card (document.css); a scroller with nothing to press in
            it is a stop of its own for a keyboard in the browser */}
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
            {leftOff.length + unitless.length + unsaid.length > 0 ? (
              <DeskRow word="Left off the printed quote" glyph={DESK_GLYPH.leftOff}>
                <DeskItems
                  items={[
                    ...leftOff.map((o) => asLine(`${o.title}: ${offeredSay(o, noun)}`)),
                    ...unitless.map(asLine),
                    ...unsaid.map(asLine),
                  ]}
                />
              </DeskRow>
            ) : null}
            {alsoOffered.length > 0 ? (
              <DeskRow word="Also offered, not taken" glyph={DESK_GLYPH.alsoOffered}>
                <DeskItems
                  items={alsoOffered.map((o) => asLine(`${o.title}: ${offeredSay(o, noun)}`))}
                />
              </DeskRow>
            ) : null}
            {reasons.length > 0 ? (
              <DeskRow word="Why an item reads as it does" glyph={DESK_GLYPH.why}>
                <DeskItems items={reasons.map((r) => asLine(`${r.said}: ${r.why}`))} />
              </DeskRow>
            ) : null}
            {/* WHICH ITEMS PRINT WITH NO PICTURE BESIDE THEM, AND WHY (the owner's fully specced quote,
                2026-11-03: "only 4 of the 9 lines are pictured, and the two largest items after the
                hull are not among them"). Only a picture a person checked as that exact item, or
                one Northside added, prints beside it; the maker's picture on the build is neither. */}
            {doc.chosen.pictures && unpictured.length > 0 ? (
              <DeskRow word="Printed without a picture" glyph={DESK_GLYPH.picture}>
                <DeskItems items={unpictured.map(asLine)} />
                {NO_LINE_PICTURE}
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
            {/* NO KEY STRING HERE ANY MORE (built-critique-m3-2.md, M13): the rail printed the
                boat as the price file writes it, "Highfield - CL340 (PVC) W-W-WD", the file's key
                read aloud. What the dealer orders the boat by is its code, which "The codes"
                below prints beside the boat's own name. */}
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
              {letterheadSay(doc, groundOf(art) === 'photo')}
              {/* WHAT IS NOT ON IT, said to the dealer where the customer's copy simply leaves it
                  out (paper-handoff.md, item 6) */}
              {doc.letterhead && missingDetails(doc.letterhead).length > 0
                ? ` ${NO_DETAILS(missingDetails(doc.letterhead))}`
                : ''}
              {/* AND THE SALESPERSON'S LINE, which prints under "Prepared by" and on the last
                  page: what of it Settings does not hold (the quote round, 2026-11-02) */}
              {preparerSay(doc) === '' ? '' : ` ${preparerSay(doc)}`}
            </DeskRow>
            <DeskRow word="The cover picture" glyph={DESK_GLYPH.picture}>
              {picture}
              {unprinted === '' ? '' : ` ${unprinted}`}
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
function blocksOf(
  doc: PrintedQuote,
  art: CoverArt,
  travel: string,
  fit: number | null,
  printed: Printed,
): Block[] {
  const out: Block[] = []
  /* A SHORT SPECIFICATION IS THE COVER'S (the printed quote's critic, 2026-10-31: a repower's
     Specifications page repeated the cover's four facts and added four, on a sheet of its own).
     Where every fact fits the cover's strip, the strip carries them all and no page repeats them;
     a longer one has its own page after the cover, and the strip sets its four key facts. */
  const onCover = coverCarriesSpecs(doc)
  out.push({
    id: 'cover',
    breakBefore: true,
    node: (
      <Cover
        doc={doc}
        art={art}
        travel={travel}
        fit={fit}
        facts={coverFacts(doc)}
        src={art.kind === 'photograph' ? printedSrc(printed, art.held.src, COVER_PX) : ''}
      />
    ),
  })

  /* THE SPECIFICATION, WHERE IT IS CHOSEN AND THE FILE HOLDS MORE THAN THE COVER CAN SET (quote-spec
     §5 and §7a; the owner, 2026-10-30: "full spec of the quote and the boat"). Every fact the price
     list carries for what is sold, grouped as a brochure groups it. It opens the pages after the
     cover, so the customer reads what the thing is before what it costs. */
  const specPage = doc.chosen.specs && !onCover && doc.subject.sheet.length > 0
  if (specPage) {
    out.push({
      id: 'specs',
      breakBefore: true,
      node: <SpecPage doc={doc} />,
    })
  }

  /* A QUOTE FOR ONE THING ALONE SAYS ITS PRICE ONCE (the owner's round, 2026-11-02: "a one-motor
     quote fits the fewest pages the spec allows, the price said once where it belongs"). Its
     cover names it, sets its facts and its picture, so "Your quote" would be one line repeating
     the cover's name over the figure "Your price" says again under it; the price page names what
     it is for under its head instead, and the figure prints once, as the total. */
  const sole = soleLine(doc)
  /* YOUR QUOTE: the lines, band by band. THE BANDS THE CUSTOMER'S COPY PRINTS, and only those: a
     register that put nothing on the quote is off the paper, and a band left with no register is
     off it whole (`bandsOnPaper`); what was offered and not taken is the dealer's, on the note. */
  const bands = sole ? [] : bandsOnPaper(doc)
  /* A NUMBER ONLY WHERE THERE IS A SECOND: "01" over a quote's only band numbers nothing */
  const numbered = bands.length + (doc.typed.length > 0 ? 1 : 0) > 1
  /* ITS HEAD SAYS ITS WORD ALONE (the owner's fully specced quote, read 2026-11-03, the second
     print): "Highfield Sport 660, for Asaf Alazraki" under it repeated the cover's name and boat,
     on a page whose running head already names the quote, so one pair of facts printed three times
     in two pages. Lost: the line under "Your quote". */
  if (!sole)
    out.push({
      id: 'quote-head',
      keepWithNext: 1,
      ...(specPage ? {} : { breakBefore: true }),
      node: <PartHead word="Your quote" />,
    })
  for (const band of bands) {
    const { section } = band
    const from = out.length
    const num = numbered ? band.num : ''
    /* ONE QUANTITY DECISION PER BAND, so the figures in a band stand in
       one column whichever register they came from: every band of parts, and any other with a
       line at more than one (`quantityShown`) */
    const qty = quantityShown(band)
    /* ONE LEFT EDGE PER BAND AND ONE HEIGHT PER ROW (the owner's fully specced quote, 2026-11-03,
       both prints). The first had pictured parts start their names at x 139 pt and the Tube Covers
       at x 51 pt; the second, every name at 139 pt but an empty 77 pt slot left of each item with
       no picture and those rows 30 pt tall among rows of 52, so the table's left edge read as
       holes. Every name now starts at the band's own edge, and where any item in a band prints its
       picture, every row of the band keeps a picture's column after its name and a picture's
       height, empty where it has none, as a gap in a column of figures is. Lost: the picture
       column before the name.
       THE HULL PRINTS NO PICTURE OF ITS OWN (the same read): its only picture is the cover's
       photograph, which shrunk whole to 68 x 51 pt was a quarter boat and three quarters sea, the
       third time it printed. The cover is the boat; the hull's line names it with its finish. */
    const well =
      doc.chosen.pictures &&
      band.tables.some((table) => !table.subject && table.lines.some((l) => heldFor(l) !== null))
    const head = `sec:${section.id}`
    const under = {
      head,
      node: <SectionHead num={num} name={section.name} continued />,
    }
    out.push({ id: head, node: <SectionHead num={num} name={section.name} /> })
    if (qty) out.push({ id: `cols:${section.id}`, keepWithNext: 1, node: <Columns /> })
    for (const table of band.tables) {
      if (band.named) {
        out.push({
          id: `tab:${table.id}`,
          keepWithNext: 1,
          under,
          node: <TableHead table={table} />,
        })
      }
      for (const line of table.lines) {
        const held = table.subject ? null : heldFor(line)
        out.push({
          id: `line:${line.id}`,
          under,
          node: table.subject ? (
            <HullLine doc={doc} line={line} qty={qty} well={well} />
          ) : (
            <Line
              line={line}
              qty={qty}
              well={well}
              /* a motor's and a trailer's own facts print where their sections are chosen */
              facts={factsChosen(doc, table.kind)}
              picture={
                doc.chosen.pictures && held
                  ? { held, src: printedSrc(printed, held.src, LINE_PX) }
                  : null
              }
            />
          ),
        })
      }
    }
    /* the head keeps what follows it UP TO ITS FIRST LINE — the register's own name, the column
       row and that line — so a section never opens at the foot of a page with nothing under it,
       and never more: keeping three lines with it carried a band of three pictured parts whole
       onto the next page and left a third of the page before it empty (2026-10-31) */
    const firstLine = out.findIndex((block, k) => k > from && block.id.startsWith('line:'))
    out[from].keepWithNext = firstLine < 0 ? 0 : firstLine - from
    /* AND A BAND'S LAST LINE NEVER OPENS A SHEET ALONE (the owner's fully specced quote, read
       2026-11-03, the second print: page 4 opened "04 Dealer fit, continued" over one row, the
       Rigging kit at $14,660, under 82 pt of white at the foot of page 3). The line before it
       keeps it, and whatever stands between them, so a band that runs over a break carries two
       of its lines onto the next sheet or none. */
    const lines = out.flatMap((block, k) => (k > from && block.id.startsWith('line:') ? [k] : []))
    const [penult, last] = lines.slice(-2)
    if (penult !== undefined && last !== undefined) {
      out[penult]!.keepWithNext = Math.max(out[penult]!.keepWithNext ?? 0, last - penult)
    }
  }

  if (doc.typed.length > 0) {
    const qty = hasQuantity(doc.typed)
    const num = numbered ? String(bands.length + 1).padStart(2, '0') : ''
    const under = { head: 'typed', node: <SectionHead num={num} name={OTHER_ITEMS} continued /> }
    out.push({
      id: 'typed',
      keepWithNext: Math.min(2, doc.typed.length + 1),
      node: <SectionHead num={num} name={OTHER_ITEMS} />,
    })
    if (qty) out.push({ id: 'typed-cols', keepWithNext: 1, node: <Columns /> })
    for (const line of doc.typed) {
      out.push({
        id: `line:${line.id}`,
        under,
        node: <Line line={line} qty={qty} facts={false} picture={null} well={false} />,
      })
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
            <span className="doc-row__fig doc-fig">{signedMoney(a.amount)}</span>
          </div>
        ),
      })
    }
  }

  /* YOUR PRICE STANDS WITH WHAT IS SIGNED FOR: it keeps the next part on its page, so the
     last page is the figure and the signatures under it, never a signature page on its own */
  out.push({
    id: 'price',
    keepWithNext: 1,
    /* the price opens the page after the cover where nothing stands between them */
    ...(sole && !specPage ? { breakBefore: true } : {}),
    node: <YourPrice doc={doc} sub={sole ? quoteSub(doc) : undefined} />,
  })
  /* THE TERMS PRINT ONLY WHERE THE DEALERSHIP WROTE THEM AND THEY ARE KEPT ON. A section whose
     whole content was a sentence saying it had none was the app explaining itself to the buyer;
     the dealer is told on the note. */
  if (doc.terms !== null && doc.chosen.terms) {
    out.push({ id: 'terms', node: <Terms terms={doc.terms} /> })
  }
  /* the one fact from the old record block a buyer needs: that this
     paper replaces one they may already hold */
  if (doc.supersedesId !== null) {
    out.push({
      id: 'record',
      node: <p className="doc-replaces">This quotation replaces an earlier one.</p>,
    })
  }
  /* THE LAST PAGE'S OWN PART (quote-spec §9): how long it stands, who to call, and the two
     signature blocks, kept together as one atom so the blocks never part across a page */
  out.push({ id: 'accept', node: <Acceptance doc={doc} /> })
  return out
}

/** The most facts the cover's strip sets: two rows of four. */
export const COVER_FACTS = 8

/** Every fact of what is sold, in the sheet's order. */
const allFacts = (doc: PrintedQuote): ReadonlyArray<{ label: string; value: string }> =>
  doc.subject.sheet.flatMap((group) => group.rows)

/** True where the whole specification is chosen and fits the cover's strip, so no page repeats it. */
export function coverCarriesSpecs(doc: PrintedQuote): boolean {
  const n = allFacts(doc).length
  return doc.chosen.specs && n > 0 && n <= COVER_FACTS
}

/** The facts the cover's strip sets: all of them where they fit and are chosen, else its key four. */
export function coverFacts(doc: PrintedQuote): ReadonlyArray<{ label: string; value: string }> {
  return coverCarriesSpecs(doc) ? allFacts(doc) : doc.subject.key
}

/** Whether an item's own facts print under its line: a motor's and a trailer's where chosen. */
export function factsChosen(doc: PrintedQuote, kind: TableKind): boolean {
  if (kind === 'motor' || kind === 'package') return doc.chosen.motor
  if (kind === 'trailer') return doc.chosen.trailer
  return true
}

/** The motor on the quote, by the name its line prints ('' where it carries none, or more than one). */
function motorOn(doc: PrintedQuote): string {
  const motors = doc.sections
    .filter((s) => s.kind === 'motor')
    .flatMap((s) => s.tables.filter((t) => !t.subject))
    .flatMap((t) => t.lines)
  return motors.length === 1 ? motors[0]!.said : ''
}

/** What "Your quote" is a quote for, said under its head: the item and who it is for. */
function quoteSub(doc: PrintedQuote): string {
  const name = doc.customer.name.trim()
  return name === '' ? doc.subject.title : `${doc.subject.title}, for ${name}`
}

/* ---------------------------------------------------------- */
/* The cover                                                   */
/* ---------------------------------------------------------- */

/**
 * THE BOAT IS THE PAGE (2026-11-02; direction A of docs/directions/quote-3/cover-boards, picked in
 * docs/directions/quote-3/cover-pick.md). The owner: "the quote pdf is BORING … pdf quote needs to
 * be insane with cover page … using boats photo". The cover is the one page of the paper on the
 * night's ink, and the boat's photograph is its top: it runs off the sheet's top and both sides,
 * whole, as wide as the sheet where its own pixels allow and never wider in CSS px than they are,
 * and the water under the boat melts into the dark. A studio picture — a motor on white, a
 * maker's render — has no water to melt, so it stands on a pale studio panel that bleeds the same
 * three edges; a maker's mark or the name in type stands there too. Every word the customer reads
 * stands on the dark, at least 18 mm inside the edge: what it is, its name, its finish and the
 * line a picture owes, the key facts, and the price beside who it is for at the foot (quote-spec
 * §3.5 keeps them in those places, and `club-marine-cover` and `rmsothebys-auctions` are the
 * frames: a headline on the boat's own water, one object lit on black).
 *
 * NOTHING IS CROPPED OR GUESSED. The board cropped each photograph by hand and set the name under
 * the boat's lowest point; neither value is held for a picture, so the photograph is drawn whole
 * and the name starts under its foot, never on the water.
 *
 * THE PRICE STANDS BESIDE WHO IT IS FOR, which is this screen's own requirement since Porsche's
 * cover (`porsche-pdf-1`) was answered for a dealer: a configuration belongs to a code, a quote
 * belongs to a person. The reference is in the stamp, and in the running head of every page after
 * it (`govuk-confirmation`).
 */
function Cover({
  doc,
  art,
  travel,
  fit,
  facts,
  src,
}: {
  doc: PrintedQuote
  art: CoverArt
  travel: string
  /** where the photograph is drawn from: its JPEG for the printer where one is made (`usePrinted`) */
  src: string
  /** the picture's height in px where the cover would not fit its page at its ceiling */
  fit: number | null
  /** the facts the strip sets: all of them where they fit, else the four key ones */
  facts: ReadonlyArray<{ label: string; value: string }>
}) {
  const register = registerOf(doc)
  const total = doc.totals.total
  const over = eyebrowOf(doc)
  const includes = includesSay(doc)
  const gst = gstSay(doc)
  const boat = doc.subject.kind === 'boat' || doc.subject.kind === null
  const caption =
    art.kind === 'photograph'
      ? pictured(art.held, doc.subject.title, boat, {
          finish: doc.subject.finish !== '',
          motor: motorOn(doc),
        })
      : null
  const by = doc.preparedBy ? (doc.preparer?.name ?? doc.preparedBy) : null
  /* THE GROUND THE TOP OF THE PAGE IS: the photograph itself, or the studio's panel (`groundOf`) */
  const ground = groundOf(art)
  const span = art.kind === 'photograph' && ground === 'photo' ? spanOf(art.held) : null

  return (
    <div
      className="doc-cover"
      data-kind={doc.subject.kind ?? 'boat'}
      data-ground={ground}
      data-long={longTitle(doc.subject.title) ? '' : undefined}
    >
      {/* THE TOP OF THE PAGE, OFF ITS THREE EDGES: the letterhead over the photograph's veil, or
          over the studio's panel above the picture */}
      <div className="doc-night">
        <Letterhead
          business={doc.business}
          letterhead={doc.letterhead}
          reference={doc.reference}
          kind={doc.issued ? 'Quotation' : 'Quotation · draft'}
          when={
            doc.issued
              ? doc.issuedAt
                ? `Issued ${day(doc.issuedAt)}`
                : 'Issued'
              : 'Not issued yet'
          }
          details={doc.chosen.details}
          ink={ground === 'photo' ? 'night' : 'paper'}
        />
        {/* THE PICTURE OF WHAT IS SOLD. The held size rides on the element as numbers, so the box
            is the picture's before a byte has loaded and the page's height does not move when it
            lands. */}
        <figure
          className="doc-shot"
          data-art={art.kind}
          data-verdict={art.kind === 'photograph' ? art.held.verdict : undefined}
          data-span={span ?? undefined}
          data-fit={fit === null ? undefined : ''}
        >
          {art.kind === 'photograph' ? (
            <img
              className="doc-shot__img"
              src={src}
              /* the held picture it is drawn from, where `src` is its JPEG for the printer */
              data-held={art.held.src}
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
        </figure>
      </div>

      {/* WHAT IS SOLD, AS A PERSON SAYS IT: what kind of thing it is over its name — "Your boat",
          "Your motor", the same on every cover and never the file's heading — the exact model
          whole, "(Tournament)" kept, its finish with a swatch of each colour the decode names, and
          the line a brochure prints where the picture shows what the quote does not sell ("shown
          with optional equipment"): the maker's finish, another outboard, more outboards. */}
      <div className="doc-cover__title">
        <p className="doc-cover__over">{over}</p>
        <Heading at={0} className="doc-cover__name">
          <TitleSaid title={doc.subject.title} />
        </Heading>
        {doc.subject.finish === '' ? null : (
          <p className="doc-cover__detail">
            {/* THE SAME SQUARES THE BUILD DRAWS THE COLOURWAY IN (the owner's fully specced quote,
                2026-11-03: the build and the package drew three squares and the paper three
                overlapping circles, so one colourway had two pictures) */}
            <Swatches colour={doc.subject.colour} />
            {doc.subject.finish}
          </p>
        )}
        {caption ? <p className="doc-shot__say">{caption}</p> : null}
      </div>

      {/* THE FACTS A BROCHURE SETS UNDER THE NAME, large: the whole specification where it fits
          two rows of four, else its length and beam, its power and its weight (`keyFacts`), each
          only where the file holds it */}
      {facts.length > 0 ? (
        <dl className="doc-keys" data-count={facts.length}>
          {facts.map((fact) => (
            <div className="doc-key" key={fact.label}>
              <dd className="doc-key__val">{fact.value}</dd>
              <dt className="doc-key__lab">{fact.label}</dt>
            </div>
          ))}
        </dl>
      ) : null}

      {/* THE PRICE BESIDE WHO IT IS FOR, at the foot of the cover — a quote belongs to a person,
          and a total that is not next to the name it is addressed to is a price list. The total is
          the largest figure on the paper (ACL s48 asks only that it be at least as prominent as
          any other price). */}
      <div className="doc-money">
        <div className="doc-money__who">
          <p className="doc-lab">Prepared for</p>
          {/* A QUOTE ADDRESSED TO NOBODY PRINTS A BLANK LINE, the way a printed form does; a
              draft with no name cannot be given, so this is only ever a proof on the desk. */}
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
          {by ? (
            <div className="doc-money__by">
              <p className="doc-lab">Prepared by</p>
              <p className="doc-money__who-by">{by}</p>
              {/* HOW TO REACH THEM, as Northside set them on Settings: the title, the phone and
                  the email, each only where it was given */}
              {[doc.preparer?.title, doc.preparer?.phone, doc.preparer?.email]
                .filter((line): line is string => line !== undefined && line !== '')
                .map((line) => (
                  <p className="doc-money__line" key={line}>
                    {line}
                  </p>
                ))}
            </div>
          ) : null}
        </div>

        <div className="doc-money__sum">
          <p className="doc-lab">{totalLabel(doc)}</p>
          <p className="doc-money__fig" data-testid="document-total">
            <PriceFigure amount={total} />
          </p>
          {/* WHAT THE FIGURE ALREADY HOLDS, in one sentence (quote-spec §3.5), and the GST in it
              once Northside's rate is on the quote — both read off the quote, never assumed */}
          {includes === '' ? null : <p className="doc-money__line">{includes}</p>}
          {gst === '' ? null : <p className="doc-money__line">{gst}.</p>}
          {/* NORTHSIDE'S OWN DEPOSIT WORDING, under the figure it is about, where it was set on
              Settings and kept on. Never written for Northside: absent, nothing is said. */}
          {doc.letterhead?.deposit && doc.chosen.deposit ? (
            <p className="doc-money__line doc-money__deposit">{doc.letterhead.deposit}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** THE LONGEST NAME SET AT THE COVER'S FULL SIZE: "Highfield Sport 560" is 19 characters and fits
 *  the measure on one line at 64px; a longer name, or one with a bracket ("Stacer 499 Sea Ranger
 *  SDF (Centre Console)"), is set a step down on two balanced lines. */
const FULL_TITLE = 20

/** True where the cover sets the name a step down (`FULL_TITLE`). */
export const longTitle = (title: string): boolean =>
  title.length > FULL_TITLE || /\([^()]+\)$/.test(title)

/** A model's name with its closing bracket as one piece, so a line breaks before the bracket and
 *  never inside the name: "Stacer 499 Sea Ranger SDF" over "(Centre Console)". */
function TitleSaid({ title }: { title: string }) {
  const m = /^(.+?)\s(\([^()]+\))$/.exec(title)
  if (!m) return <>{title}</>
  return (
    <>
      {m[1]} <span className="doc-cover__bracket">{m[2]}</span>
    </>
  )
}

/** What a cover says it is over the name, by the kind of thing sold. */
const KIND_SAID: Partial<Record<TableKind, string>> = {
  boat: 'Your boat',
  motor: 'Your motor',
  package: 'Your motor',
  trailer: 'Your trailer',
}

/**
 * THE LINE OVER THE NAME: what is sold, in the customer's words, the same on every cover of its
 * kind (the printed quote's critic, 2026-10-31: it came and went, and where it printed it was the
 * file's heading, "SEA MASTERS" over "Stacer 481 SeaMaster" and "FOUR STROKE MODELS" over a Yamaha).
 * The maker and the model are the name's own; the series a file files it under is the dealer's.
 */
export function eyebrowOf(doc: Pick<PrintedQuote, 'subject'>): string {
  return KIND_SAID[doc.subject.kind ?? 'boat'] ?? 'Your quote'
}

/* ---------------------------------------------------------- */
/* The specification page                                      */
/* ---------------------------------------------------------- */

/**
 * EVERY FACT THE FILE HOLDS FOR WHAT IS SOLD, laid out as a brochure lays a specification: grouped
 * (size, power, capacity, details), the label light and the value in full ink, over hairlines
 * (`live/saxdor-brochure-specs-crop`).
 *
 * EACH GROUP IS A ROW OF THE PAGE: its name in a margin of its own and its facts two to a line
 * beside it (the owner's fully specced quote, read 2026-11-03, the second print). Two columns of
 * whole groups could only be as even as the groups were: the Sport 660's Size and Details ended
 * 57 pt under Power and Capacity, a block 232 pt wide left empty under "Maximum people", and no
 * parting of groups of 6, 3, 3 and 2 does better. Read across, each group ends where its facts do
 * and the sheet ends where its last group does. Lost: `specColumns`, the two stacks of groups.
 */
function SpecPage({ doc }: { doc: PrintedQuote }) {
  return (
    <section className="doc-sheet" aria-label="Specifications">
      <PartHead word="Specifications" sub={doc.subject.title} />
      <div className="doc-sheet__groups">
        {doc.subject.sheet.map((g) => (
          <SpecGroupBlock group={g} key={g.id} />
        ))}
      </div>
    </section>
  )
}

/** One group of the specification: its name in the margin, its facts two to a line beside it. */
function SpecGroupBlock({ group: g }: { group: PrintedQuote['subject']['sheet'][number] }) {
  return (
    <div
      className="doc-sheet__group"
      /* ONE LIST, NO HEADING: a sheet whose groups would each hold one fact (`sheetOnPaper`) */
      data-flat={g.name === '' ? '' : undefined}
    >
      {g.name === '' ? null : <p className="doc-sheet__name">{g.name}</p>}
      <dl className="doc-specs">
        {g.rows.map((spec) => (
          <div className="doc-spec" key={spec.label}>
            <dt className="doc-spec__lab">{spec.label}</dt>
            <dd className="doc-spec__val">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** A part of the paper's own head: its word set large, and what it is about under it. */
function PartHead({ word, sub }: { word: string; sub?: string }) {
  return (
    <header className="doc-part">
      <Heading at={1} className="doc-part__word">
        {word}
      </Heading>
      {sub ? <p className="doc-part__sub">{sub}</p> : null}
    </header>
  )
}

/* ---------------------------------------------------------- */
/* The letterhead                                              */
/* ---------------------------------------------------------- */

/** A line of the letterhead under the mark, in the order it prints. */
export type LetterheadLine = 'legalName' | 'abn' | 'address' | 'phone' | 'email' | 'website'

export const LETTERHEAD_LINES: readonly LetterheadLine[] = [
  'legalName',
  'abn',
  'address',
  'phone',
  'email',
  'website',
]

export interface LetterheadProps {
  /** the business the quote carries, which the mark is looked up by */
  business: string | null
  /** Northside's letterhead: as given, or as it stands for a draft */
  letterhead: FrozenLetterhead | null
  reference: string
  /** "Quotation", or "Quotation · draft" */
  kind: string
  /** "Issued 29 October 2026" */
  when: string
  /** NORTHSIDE'S DETAILS UNDER THE MARK (address, phone, email, ABN): printed unless the
   *  salesperson took them off this quote (quote-spec §7a). Settings always shows them. */
  details?: boolean
  /**
   * THE GROUND IT STANDS ON: paper (Settings, a studio panel) in dark ink, or the cover's
   * photograph, in light — the white ink of the same mark where it is held (`nightMarkOf`), else
   * the name in type, which the note beside the paper says.
   */
  ink?: 'paper' | 'night'
  /**
   * WHERE A LINE IS SET RATHER THAN PRINTED (/manage, Milestone 4): handed each line of the
   * letterhead in order — the mark first — with what it prints, and returns what stands there.
   * The printed quote passes nothing and prints only the lines that hold something.
   */
  renderLine?: (line: LetterheadLine | 'mark', printed: ReactNode | null) => ReactNode
}

/**
 * THE LETTERHEAD STRIP — the quote's own, exported so /manage sets Northside's details on the
 * very component a customer's quote prints them with (the judge's must-change, 2026-10-29).
 *
 * A dealership's name is the largest thing at the head of its own quotation: its mark in dark
 * ink up to 20 mm tall (quote-spec.md §3.1), or its name in type where no mark is held. Under it
 * the contact line, each part only where Northside gave it; to the right, the kind of quote, its
 * number, the day it was given and the day it stands until. A quote that carries no name prints
 * no letterhead, and the note beside the sheet says why.
 */
export function Letterhead({
  business,
  letterhead,
  reference,
  kind,
  when,
  details = true,
  ink = 'paper',
  renderLine: setting,
}: LetterheadProps) {
  const held = letterheadOf(business)
  const name = letterhead?.name ?? business
  const mark =
    ink === 'night'
      ? nightMarkOf(business, letterhead)
      : (letterhead?.mark ?? (held.drawn ? held.mark : null))
  const printedMark = mark ? (
    <p className="doc-cover__house" data-named="" data-mark="">
      <img
        className="doc-cover__mark"
        src={mark.src}
        alt={name ?? ''}
        width={mark.width}
        height={mark.height}
      />
    </p>
  ) : (
    <p className="doc-cover__house" data-named={name ? '' : undefined}>
      {name ?? ''}
    </p>
  )
  const lines = letterhead && details ? contactParts(letterhead) : {}
  const valid = letterhead?.validUntil
    ? `Valid until ${day(letterhead.validUntil)}`
    : letterhead?.validDays !== undefined
      ? `Valid for ${letterhead.validDays} ${letterhead.validDays === 1 ? 'day' : 'days'} from the day it is given`
      : null
  return (
    <div className="doc-cover__mast" data-testid="letterhead" data-ink={ink}>
      <div className="doc-cover__who">
        {setting ? setting('mark', printedMark) : printedMark}
        {setting ? (
          <p className="doc-cover__contact" data-setting="">
            {LETTERHEAD_LINES.map((line) => (
              <span key={line}>{setting(line, lines[line] ?? null)}</span>
            ))}
          </p>
        ) : Object.keys(lines).length > 0 ? (
          <p className="doc-cover__contact">
            {LETTERHEAD_LINES.filter((line) => lines[line]).map((line) => (
              <span key={line}>{lines[line]}</span>
            ))}
          </p>
        ) : null}
      </div>
      <div className="doc-cover__stamp">
        <p className="doc-cover__kind">
          {kind}
          {reference !== '' ? (
            <>
              {' · '}
              <span className="doc-ref">{reference}</span>
            </>
          ) : null}
        </p>
        {/* THE DATE A BUYER READS, where the quote spec's letterhead puts it (§3, item 1) */}
        <p className="doc-cover__when">{when}</p>
        {valid ? <p className="doc-cover__when doc-cover__valid">{valid}</p> : null}
      </div>
    </div>
  )
}

/** The contact line, by part: only the parts Northside gave. */
function contactParts(letterhead: FrozenLetterhead): Partial<Record<LetterheadLine, string>> {
  const said = contactLine(letterhead)
  const out: Partial<Record<LetterheadLine, string>> = {}
  let at = 0
  for (const line of LETTERHEAD_LINES) {
    if (!letterhead[line]) continue
    out[line] = said[at] ?? ''
    at += 1
  }
  return out
}

/** A draft, with Northside's letterhead and its preparer as they stand today laid over it. */
export function withToday(
  quote: QuoteDef,
  today: { org?: OrgProfile | undefined; business: string | null },
): QuoteDef {
  if (quote.state !== 'draft') return quote
  const letterhead = letterheadNow({
    org: today.org,
    business: today.business ?? quote.organisation ?? null,
  })
  const preparer = preparerNow(today, quote.preparedBy)
  const out: QuoteDef = { ...quote }
  if (letterhead) out.letterhead = letterhead
  if (preparer) out.preparer = preparer
  /* AND NORTHSIDE'S RATE AND TERMS AS THEY STAND: the give copies them on (`issueStampNow`), so
     the draft's proof prints what the given quote will */
  const rate = today.org?.gstRate
  if (rate !== undefined && Number.isFinite(rate)) out.taxRate = rate
  const terms = today.org?.quoteTerms?.trim()
  if (terms) out.note = terms
  return out
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
function SectionHead({
  num,
  name,
  continued = false,
}: {
  /** '' on a quote with one band: a number with no second numbers nothing */
  num: string
  name: string
  /** the head said again over the lines it runs on to, at the top of the next sheet */
  continued?: boolean
}) {
  return (
    <div className="doc-band" data-continued={continued ? '' : undefined}>
      <p className="doc-band__name">
        {num === '' ? null : <span className="doc-band__num">{num}</span>}
        {name}
        {continued ? <span className="doc-band__cont">, continued</span> : null}
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
function Line({
  line,
  qty,
  facts,
  picture,
  well,
}: {
  line: DocumentLine
  qty: boolean
  /** print the item's own facts under its name (never the subject's: those are the cover's) */
  facts: boolean
  /** THE PICTURE OF THIS EXACT ITEM, where one is held and the section is chosen (`heldFor`), with
   *  the address the paper draws it from (`usePrinted`); null for none */
  picture: { held: HeldPicture; src: string } | null
  /** the band keeps a picture's column, so a line with none still starts its name at its edge */
  well: boolean
}) {
  /* ONE LINE UNDER THE NAME, IN THE BUYER'S WORDS (`noteOnPaper`): the
     arithmetic of a quantity, what the figure already includes, and a
     price agreed by hand with its reason. The workshop's facts — the prop
     part, the engine hole, the slot — are the dealer's, on the note. */
  const under = noteOnPaper(line)
  const own = facts ? line.own : []
  return (
    <Row line={line} qty={qty} well={well} picture={picture}>
      <span className="doc-row__said">{line.said}</span>
      {own.length > 0 ? (
        /* THE ITEM'S OWN FACTS, as the price list states them and a person asks for them —
           "Power 90 hp · Weight 166 kg · Shaft 25″" — frozen with the line at the pick */
        <span className="doc-row__own">
          {own.map((fact) => (
            <span className="doc-row__fact" key={fact.label}>
              <span className="doc-row__fact-lab">{fact.label}</span> {fact.value}
            </span>
          ))}
        </span>
      ) : null}
      {under !== '' ? <span className="doc-row__facts">{under}</span> : null}
    </Row>
  )
}

/**
 * THE HULL'S LINE, THE BIGGEST ON THE QUOTE, SET AS THE BIGGEST (the owner's fully specced quote,
 * read 2026-11-03: "one bare row … no picture beside it and no line about the Hypalon or the colour
 * choice. It is the biggest line on the quote ($72,170) and it reads like the smallest"). Its name is
 * the exact model, as the cover heads it; under it, its material and its colours with the same
 * squares the cover and the build draw them in. No picture beside it: its only one is the cover's
 * photograph, which the second print found shrunk to a quarter boat and three quarters sea, the third
 * time it printed. A quote that is not for a boat sets its item's name as it always did.
 */
function HullLine({
  doc,
  line,
  qty,
  well,
}: {
  doc: PrintedQuote
  line: DocumentLine
  qty: boolean
  well: boolean
}) {
  const under = noteOnPaper(line)
  const material = doc.subject.material
  const colour = doc.subject.colour
  const finished = doc.subject.finish !== ''
  return (
    <Row line={line} qty={qty} well={well} picture={null} hull>
      <span className="doc-row__said">{finished ? doc.subject.title : line.said}</span>
      {finished ? (
        <span className="doc-row__own">
          {material === '' ? null : (
            <span className="doc-row__fact">
              <span className="doc-row__fact-lab">Material</span> {material}
            </span>
          )}
          {colour === null ? null : (
            <span className="doc-row__fact doc-row__fact--colour">
              <span className="doc-row__fact-lab">Colours</span>
              <Swatches colour={colour} size="sm" />
              {colour.say}
            </span>
          )}
        </span>
      ) : null}
      {under !== '' ? <span className="doc-row__facts">{under}</span> : null}
    </Row>
  )
}

/** A row of the paper: the picture's column where the band keeps one, the name and what is said
 *  under it, the quantity where the band counts, and the money column's figure or word. */
function Row({
  line,
  qty,
  well,
  picture,
  hull = false,
  children,
}: {
  line: DocumentLine
  qty: boolean
  well: boolean
  picture: { held: HeldPicture; src: string } | null
  hull?: boolean
  children: ReactNode
}) {
  const word = cellWord(line)
  return (
    <div
      className="doc-row"
      data-state={line.state}
      data-qty={qty ? '' : undefined}
      data-pictured={well ? '' : undefined}
      data-hull={hull ? '' : undefined}
    >
      <span className="doc-row__name">{children}</span>
      {well ? (
        <span className="doc-row__well">
          {picture ? (
            /* never drawn wider than its held pixels, nor past its well */
            <img
              className="doc-row__pic"
              src={picture.src}
              alt=""
              width={picture.held.width}
              height={picture.held.height}
              style={
                {
                  '--held-w': picture.held.width,
                  '--held-h': picture.held.height,
                } as CSSProperties
              }
              decoding="async"
            />
          ) : null}
        </span>
      ) : null}
      {qty ? (
        <span className="doc-row__qty doc-fig">{line.qty.toLocaleString('en-AU')}</span>
      ) : null}
      <span className="doc-row__fig doc-fig">
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
function YourPrice({ doc, sub }: { doc: PrintedQuote; sub?: string }) {
  const t = doc.totals
  /* A PRICE OF ONE ROW IS ITS TOTAL (the printed quote's critic, 2026-10-31: a one-motor quote
     printed $16,667 four times): the row that would say the motor's figure over the total that is
     the same figure is left out, and the total stands alone under its head */
  const all = priceRows(doc)
  const rows = all.length === 1 && !all[0]!.signed && all[0]!.amount === t.total ? [] : all
  const includes = includesSay(doc)
  const gst = gstOnPaper(doc)
  /* WHAT THE PRICE IS FOR HOLDS THE LEFT COLUMN, THE FIGURES THE RIGHT (the quote round's audit,
     round 3, D5), as an invoice's summary sets them. THE COVER'S PHOTOGRAPH IS NOT DRAWN HERE AGAIN
     (the owner's fully specced quote, read 2026-11-03: "the photograph is the cover's photograph
     again … The second copy adds nothing and the composition is unbalanced", its name and finish at
     its foot under a 200 x 130 pt block of air). The boat is the cover's, and the hull's own line
     carries it small. Lost: the picture beside the price, and the sheet's room given to it.
     A PRICE OF A ROW OR TWO STANDS BESIDE ITS HEAD; one of four bands and the GST stands under it,
     the measure's width, as an invoice's summary does, so its rows do not stand over the head's
     own air (the same read's page 4). */
  const beside = rows.length <= 1
  return (
    <section className="doc-sums" aria-label="Your price">
      <div className="doc-sums__body" data-beside={beside ? '' : undefined}>
        <PartHead word="Your price" {...(sub ? { sub } : {})} />
        <div className="doc-sums__figs">
          <dl className="doc-sums__list">
            {rows.map((row) => (
              <div
                className="doc-sum"
                key={row.key}
                data-word={row.included ? 'included' : undefined}
              >
                <dt>{row.label}</dt>
                <dd className="doc-fig">{rowFigure(row)}</dd>
              </div>
            ))}
            <div className="doc-sum doc-sum--total">
              <dt>{totalLabel(doc)}</dt>
              <dd className="doc-fig">
                <PriceFigure amount={t.total} />
              </dd>
            </div>
            {/* THE GST IN IT, ONCE NORTHSIDE'S RATE IS ON THE QUOTE (quote-spec §8), in whole
            dollars as every figure on the paper is (`gstOnPaper`), under the total rather than
            above it, because every figure above already includes it. Absent where no rate is set:
            no rate is ever assumed. */}
            {gst !== null ? (
              <>
                <div className="doc-sum doc-sum--tax">
                  <dt>GST at {gst.rate.toLocaleString('en-AU')}%, included</dt>
                  <dd className="doc-fig">{money(gst.gst)}</dd>
                </div>
                <div className="doc-sum doc-sum--tax">
                  <dt>Before GST</dt>
                  <dd className="doc-fig">{money(gst.before)}</dd>
                </div>
              </>
            ) : null}
          </dl>
          {includes === '' ? null : <p className="doc-sums__say">{includes}</p>}
        </div>
      </div>
    </section>
  )
}

/** The dealer's standing terms, as they stood when the quote was given, drawn only where there
 *  are some — a quote that invented a validity sentence would be inventing a contract. */
function Terms({ terms }: { terms: string }) {
  return (
    <section className="doc-terms" aria-label="The terms of this quote">
      <p className="doc-lab">Terms</p>
      {/* THE TERMS KEEP THEIR OWN LINE BREAKS: a dealership's terms are a typed sentence and
          the breaks in it are theirs */}
      <p className="doc-terms__say">{terms}</p>
    </section>
  )
}

/**
 * THE LAST PAGE'S OWN PART (quote-spec §9): how long the quote stands, where Northside and the
 * salesperson are reached, and the two signature blocks — the labels the original printed and
 * the dealership used ("Client acceptance", "Merchant authorisation"), never a clause about what
 * signing means, which only Northside's own terms may say. One atom, so the blocks are always
 * together on one page.
 */
function Acceptance({ doc }: { doc: PrintedQuote }) {
  const lh = doc.letterhead
  const house = lh?.name ?? doc.business ?? ''
  const valid = lh?.validUntil
    ? `This quotation is valid until ${day(lh.validUntil)}.`
    : lh?.validDays !== undefined
      ? `This quotation is valid for ${lh.validDays} ${lh.validDays === 1 ? 'day' : 'days'} from the day it is given.`
      : ''
  /* NORTHSIDE'S DETAILS, unless the salesperson took them off this quote (quote-spec §7a) */
  const dealer = [
    lh?.legalName && lh.legalName !== house ? lh.legalName : undefined,
    lh?.address,
    lh?.phone,
    lh?.email,
    lh?.website,
    lh?.abn ? `ABN ${lh.abn}` : undefined,
  ].filter((line): line is string => doc.chosen.details && line !== undefined && line.trim() !== '')
  const person = doc.preparer ?? (doc.preparedBy ? { name: doc.preparedBy } : null)
  const reach = person
    ? [person.title, person.phone, person.email].filter(
        (line): line is string => line !== undefined && line !== '',
      )
    : []
  return (
    <section className="doc-accept" aria-label="Acceptance">
      <PartHead word="Acceptance" />
      {valid === '' ? null : <p className="doc-accept__valid">{valid}</p>}
      <div className="doc-accept__contact">
        {house === '' || dealer.length === 0 ? null : (
          <div>
            <p className="doc-lab">{house}</p>
            {dealer.map((line) => (
              <p className="doc-money__line" key={line}>
                {line}
              </p>
            ))}
          </div>
        )}
        {person ? (
          <div>
            <p className="doc-lab">Your salesperson</p>
            <p className="doc-money__line doc-money__who-by">{person.name}</p>
            {reach.map((line) => (
              <p className="doc-money__line" key={line}>
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </div>
      <div className="doc-sign">
        <SignBlock title="Client acceptance" who={doc.customer.name.trim()} />
        <SignBlock title="Merchant authorisation" who={house} />
      </div>
    </section>
  )
}

/** THE PICTURE OF THIS EXACT ITEM, or null: only one a person marked as this item (`lineOf`, the
 *  imagery round's one reader for a line), asked by the ids the line kept for exactly this. */
function heldFor(line: DocumentLine): HeldPicture | null {
  if (!line.item) return null
  const found = lineOf(itemOf(line.item.table, line.item.row, line.item.address))
  return found.held ? found.picture : null
}

/**
 * One signature block: the lines to write on, each with its word under it. A NAME PRINTED IS NOT
 * ASKED FOR AGAIN (the owner's fully specced quote, read 2026-11-03: "the name 'Asaf Alazraki' is
 * printed, then a blank 'Name' line asks for it again"): where the block names its signer, the
 * signature and the date stand side by side under the name; where it names nobody, a line for the
 * name is kept, as a printed form keeps one.
 */
function SignBlock({ title, who }: { title: string; who: string }) {
  const fields = who === '' ? ['Signature', 'Name', 'Date'] : ['Signature', 'Date']
  return (
    <div className="doc-sign__block" data-named={who === '' ? undefined : ''}>
      <p className="doc-lab">{title}</p>
      {/* whose block it is, on its own line so the two blocks' lines stand level */}
      <p className="doc-sign__who">{who === '' ? ' ' : who}</p>
      {fields.map((word) => (
        <p className="doc-sign__field" data-word={word} key={word}>
          <span className="doc-sign__rule" />
          <span className="doc-sign__word">{word}</span>
        </p>
      ))}
    </div>
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
