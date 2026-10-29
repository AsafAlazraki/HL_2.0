import { Fragment, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRightIcon,
  ArrowUUpLeftIcon,
  BookOpenTextIcon,
  CalendarBlankIcon,
  CopySimpleIcon,
  FileTextIcon,
  FolderOpenIcon,
  HandCoinsIcon,
  InfoIcon,
  ListBulletsIcon,
  PaperPlaneTiltIcon,
  TableIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { Button, Icon, PriceFigure, STATE_GLYPH, move, type Glyph, type QuoteState } from '@/ui'
import type { QuoteDef } from '@/domain/model'
import { issueBlockers, quoteTotals } from '@/domain/quote/totals'
import { versionsOf, type RegisterRow, type RegisterStateId } from '@/domain/quote/register'
import { localDay } from '@/domain/quote/day'
import { levelWord } from '@/domain/quote/levelSaid'
import { jointsOf } from '@/domain/quote/wrap'
import { ISSUED_IS_NOT_DISCARDED, NO_NAME, NO_WAY_TO_OPEN, stateWord } from './Quotes'

/** The kit's word for where a quote stands (src/ui/glyphs.ts): an issued quote is given. */
const kitState = (state: RegisterStateId): QuoteState =>
  state === 'issued' ? 'given' : state === 'superseded' ? 'superseded' : 'draft'

/** A state's glyph in its ink, beside the word that says it. */
function StateGlyph({ state }: { state: RegisterStateId }) {
  return (
    <span className="qr-glyph" data-state={state} aria-hidden="true">
      <Icon glyph={STATE_GLYPH[kitState(state)]} />
    </span>
  )
}

/** Why an empty register is empty, said as what is true today. It never
 *  names an export, a backup, a sync or a server: none of them is on any
 *  screen, and a sentence that points at one is a promise nobody can press
 *  (built-critique-m2-close-2.md, major 4). */
export const WHERE_QUOTES_ARE_KEPT =
  'Quotes stay on this computer, so one written on another is not listed here.'

/** THE THREE WORDS, DEFINED ONCE, and only while nothing is filed: the band heads carry the
 *  word and its count, and the dealer's own day teaches the rest. */
export const WHAT_THE_WORDS_MEAN =
  'A quote is a draft until it is given to the customer. To change a given quote, make a new version; the old one moves to Replaced.'

/* ============================================================
   THE RIGHT-HAND COLUMN, which is one place and three states.

   NN/g's governing constraint on progressive disclosure, quoted in
   `docs/reference/dense-tables-and-selection.md`: "designs that go
   beyond 2 disclosure levels typically have low usability". The list
   is level one and this is level two; there is no third. Airtable
   names the two shapes this can take — a SIDESHEET, list still
   visible, and a FULL-SCREEN record, "recommended for deep single
   record focus" — and it is the sidesheet at both ends: a column
   beside the register at a desk, and a full-width block UNDER it in a
   hand. Never the full-screen one, and that is the deliberate half of
   Airtable's pair: the device that shows the least of the list is the
   worst one to make somebody CLOSE something to see it again. It is a
   reflow in `quotes.css` rather than a setting nobody would find.

   Its three states are the register's three states, so the column is
   never a hole:

     BARE      nothing is filed. The panel teaches: what will land
               here, why it is empty today, and what a row will look
               like when one does. `live3/primer-empty-states-scrolled.png`
               separates a first run from an error and says the action
               should initiate the creation flow;
               `marine/stacer-boats.png` and `marine/quintrex-boats.png`
               — both Telwater sites, both brands on this dealer's own
               price file — answer an absence with WHAT HAPPENED? and
               WHAT DO I DO?, which is the shape used here.
     STANDING  rows exist and none is open. It says what the register
               holds and how to read one without leaving the list.
     PEEK      one document, read without losing your place.

   NOTHING HERE IS A SECOND ENGINE. Every figure is `quoteTotals`,
   every refusal is `issueBlockers`, and the version rail is
   `versionsOf` — the same functions the document and the editor will
   call, so this panel cannot describe a quote differently from the
   screen that writes it.

   IN THE KIT'S LANGUAGE (2026-09-28). The column is a plate; each of
   its three states RISES INTO IT on the kit's `enter` when the column
   changes state — a peek opening, a peek closing — and never when the
   cursor moves from one quote to the next, which only changes what the
   peek says. The panel's first paint is simply there: the route's
   crossfade has already brought it. Every heading the panel prints
   leads with the glyph of what it is about, and every act with the
   glyph of what it does.
   ============================================================ */

export interface PanelProps {
  bare: boolean
  read: boolean
  /** the document under the cursor: the panel reads it whenever there is one */
  quote?: QuoteDef
  row?: RegisterRow
  /** the quote has been taken in hand (pressed, Space, or named by the address), so its
   *  opening act is the screen's amber; at rest New quote keeps it */
  chosen: boolean
  all: readonly QuoteDef[]
  now: () => Date
  /** what the last act said, printed where the act was attempted */
  said: string | null
  sheetOpen: boolean
  /** the price file is still being looked for in this browser — not yet found, not yet missing */
  sheetLooking: boolean
  openTheFile?: () => void
  onGoTo: (reference: string) => void
  onNewVersion: (quote: QuoteDef) => void
  onDiscard: (quote: QuoteDef) => void
  /** open the document under the cursor, where that document belongs */
  onOpen: (row: RegisterRow) => void
  /** whether the screen was handed anywhere to open one; false is a
   *  component test and never a browser, and it draws the sentence
   *  rather than a silently dead control */
  canOpen: boolean
}

export function Panel(props: PanelProps) {
  const { bare, read, quote, row, said } = props
  const state = quote && row ? 'peek' : bare && read ? 'teach' : 'standing'
  /* THE FIRST PAINT IS SIMPLY THERE; A CHANGE OF STATE AFTER IT RISES IN. The state the column
     was first drawn in is remembered, and the first render that finds it changed says so —
     React's own way of deriving a value from the one before, with no effect and no ref. */
  const [first] = useState(state)
  const [changed, setChanged] = useState(false)
  if (!changed && state !== first) setChanged(true)
  return (
    <aside className="qr-panel" aria-label="The quote you are on">
      <motion.div
        key={state}
        className="qr-panel__state"
        initial={changed || state !== first ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={move.enter}
      >
        {quote && row ? (
          <Peek {...props} quote={quote} row={row} />
        ) : bare && read ? (
          <Teaching
            sheetOpen={props.sheetOpen}
            sheetLooking={props.sheetLooking}
            openTheFile={props.openTheFile}
          />
        ) : (
          <Standing read={read} />
        )}
      </motion.div>
      {said ? (
        <output className="qr-said">
          <span className="qr-said__glyph" aria-hidden="true">
            <Icon glyph={InfoIcon} weight="fill" />
          </span>
          <span>{said}</span>
        </output>
      ) : null}
    </aside>
  )
}

/* ---------------------------------------------------------- */
/* Bare — the screen the owner sees first, and for a while      */
/* ---------------------------------------------------------- */

/* ============================================================
   NOTHING FILED: WHAT IS TRUE, WHAT TO DO, AND WHAT THE THREE WORDS MEAN — ONCE
   (the refine round, 2026-10-21).

   This panel was three questions with a paragraph each ("What lands here", "Why it is empty
   today", "What to do"), the bands under it said three more sentences, and a foot promised
   what the panel would do later: the app explaining itself, in the engine's words ("issued",
   "read-only for good", "superseded", "price file"). What a dealer needs on the first morning
   is four facts, said once each: there are no quotes yet; quotes stay on this computer, so
   one written elsewhere is not here; New quote starts one; and what Given and Replaced mean,
   which is the only place on the screen the three words are defined — the band heads carry
   only the word and its count.
   ============================================================ */
function Teaching({
  sheetOpen,
  sheetLooking,
  openTheFile,
}: {
  sheetOpen: boolean
  sheetLooking: boolean
  openTheFile?: () => void
}) {
  return (
    <div className="qr-teach">
      <h2 className="qr-teach__head">No quotes yet</h2>
      <p className="qr-teach__a">{WHERE_QUOTES_ARE_KEPT}</p>
      {sheetOpen ? (
        <p className="qr-teach__a">
          Press <b>New quote</b> to choose a boat.
        </p>
      ) : sheetLooking ? (
        /* still looking, which is not the same as not found (critique #15) */
        <p className="qr-teach__a">Looking for the price list…</p>
      ) : (
        <div className="qr-teach__door">
          <p className="qr-teach__a">No price list is loaded, so there is nothing to quote from.</p>
          {openTheFile ? (
            <Button intent="secondary" icon={FolderOpenIcon} onClick={openTheFile}>
              Load the Master Price File
            </Button>
          ) : null}
        </div>
      )}
      <p className="qr-teach__foot">{WHAT_THE_WORDS_MEAN}</p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Standing — quotes exist, none is under the cursor            */
/* ---------------------------------------------------------- */

/* ============================================================
   AT REST, THE PANEL SAYS WHAT IT IS FOR, AND NOTHING ELSE (the refine round, 2026-10-21).

   It said "Press a quote to read it here", then "The list stays where it is. The act at the
   foot of this panel opens the quote — a draft where it is written, an issued quote as the
   paper it became.", then defined the three bands again beside the heads that name them —
   the app explaining itself, and "Issued" here where every other screen says "Given". One
   line is what Mail's reading pane says with nothing selected, and it stands in the plate's
   middle at a desk (quotes.css). The open act names what it opens when there is one.

   AND SINCE 2026-10-29 IT IS RARE. The panel reads the quote under the cursor at rest, so this
   is drawn only while the quotes are being read, or while a find matches none of them — and
   then "Press a quote" was false, with nothing in the list to press. It says what is true:
   the find left nothing to read. How to find one is said once, over the list (NOTHING_FOUND).
   ============================================================ */
function Standing({ read }: { read: boolean }) {
  if (!read) {
    return (
      <div className="qr-teach">
        <h2 className="qr-teach__head">Reading your quotes…</h2>
      </div>
    )
  }

  return (
    <div className="qr-standing">
      <span className="qr-standing__disc" aria-hidden="true">
        <Icon glyph={BookOpenTextIcon} size="lg" />
      </span>
      <h2 className="qr-standing__head">No quote to read</h2>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Peek — one document                                          */
/* ---------------------------------------------------------- */

/* ============================================================
   WHAT "OPEN IT" OPENS, IN THE TWO WORDS A DEALER WOULD USE.

   The register shipped with one control called `Open it` and a
   sentence saying there was nowhere for it to go. There are two
   places, and which one a press lands on is a fact about the
   DOCUMENT, so the control says it rather than making somebody find
   out. The addresses themselves are the route's (`src/routes/
   quotes.tsx`); these are the objects.
   ============================================================ */
/* AND IT SAYS IT ONCE, ON THE CONTROL (the refine round, 2026-10-21). A sentence under it
   said again what the press opens ("It opens as the sheet the customer was given, exactly as it
   was given, at A4 and ready to print"): the app explaining itself, a line under its own label.
   A given quote opens as the printed quote (docs/WORDS.md: "the document" is the engine's). */
const opensAs = (state: RegisterRow['state']): string =>
  state === 'draft' ? 'Open the build' : 'Open the printed quote'

/** THE GLYPH THE OPENING ACT ENDS ON: an arrow into the build a draft is written on, and the
 *  paper — the glyph the build's own way to the printed quote carries — for a quote given. */
const opensWith = (state: RegisterRow['state']): Glyph =>
  state === 'draft' ? ArrowRightIcon : FileTextIcon

/** WHERE ONE VERSION ON THE RAIL STANDS, in the register's own three words (build-close-critique.md,
 *  minor 9). The rail called -01 "Issued" while the peek's head and the register called it
 *  "Superseded". A version with one after it on the rail has been replaced — only a given quote
 *  is ever versioned — so it is superseded, exactly as `bandOf` files it. */
const railState = (version: QuoteDef, at: number, of: number): RegisterStateId =>
  version.state === 'draft' ? 'draft' : at < of - 1 ? 'superseded' : 'issued'

/** A fact about the quote, its label led by the glyph of what it is. */
function Fact({ glyph, label, children }: { glyph: Glyph; label: string; children: ReactNode }) {
  return (
    <div className="qr-facts__row">
      <dt>
        <span className="qr-facts__glyph" aria-hidden="true">
          <Icon glyph={glyph} />
        </span>
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  )
}

/* A DAY IS ONE WORD AND NEVER BREAKS AT ITS HYPHENS (`.qr-facts__when`). The value's
   `overflow-wrap: anywhere` took a hyphen as a place to break, and the peek said "5 minutes ago ·
   2026-" over "10-19" (components-critique-2 minor 17, build-close-critique minor 17). How long
   ago is the row's to say, beside the panel, and the peek says only the day. */

function Peek({
  quote,
  row,
  all,
  chosen,
  canOpen,
  onGoTo,
  onNewVersion,
  onDiscard,
  onOpen,
}: PanelProps & { quote: QuoteDef; row: RegisterRow }) {
  const totals = quoteTotals(quote)
  const blockers = quote.state === 'draft' ? issueBlockers(quote) : []
  const versions = versionsOf(all, quote.id)
  const latest = versions[versions.length - 1]
  /* A CONFIRM BELONGS TO THE DOCUMENT IT WAS OPENED ON, so what is
     remembered is WHICH document it was opened on and not a boolean.
     Arrowing to the next row with a discard half-pressed would
     otherwise leave the second press pointing at somebody else's
     quote; here the half-press simply does not belong to the row that
     arrived, and nothing has to be reset. */
  const [confirmingFor, setConfirmingFor] = useState<string | null>(null)
  const confirming = confirmingFor === quote.id
  const setConfirming = (yes: boolean): void => {
    setConfirmingFor(yes ? quote.id : null)
  }

  /* WHAT THE QUOTE IS MADE OF, said as items priced (docs/WORDS.md: "Cash · 3 of 4 items
     priced"): it said "Lines 5, 1 of them not priced on this quote". What is not priced stays
     said, here, once; the total says what stands where no figure can. */
  const priced = row.lines - row.unpriced
  const items =
    row.unpriced > 0
      ? `${priced.toLocaleString('en-AU')} of ${row.lines.toLocaleString('en-AU')} priced`
      : row.lines.toLocaleString('en-AU')

  return (
    <div className="qr-peek" data-state={row.state}>
      <div className="qr-peek__top">
        <StateGlyph state={row.state} />
        <span className="qr-peek__state">{stateWord(row.state)}</span>
        <span className="qr-peek__ref">{quote.reference}</span>
        {/* NO CLOSE (2026-10-29): the panel reads the quote under the cursor at rest too, so
            there is no empty panel for a Close to go back to. */}
      </div>

      {/* WHAT IS READ SCROLLS, AND THE ACTS STAND AT THE PANEL'S FOOT (the refine round,
          2026-10-21). At 1280 × 800 a draft's "Make a new version" was drawn half under the
          panel's bottom edge with nothing to say there was more. At a desk this part is the
          panel's scroller and the acts are a foot under its rule, so the act is always whole
          and in reach; under 1200 the page scrolls and both simply run on (quotes.css). */}
      <div className="qr-peek__read">
        {/* THE BOAT AS A PERSON SAYS IT (built-critique-m2-close-2.md, the one
            thing to change first); the price list's own string for it is a
            fact below, for the dealer who orders by it */}
        {/* never a line that opens on its "·" or "/": at 1440 this read "…Black /
            Grey / / Black", and then "…Hypalon · Black /" over "Grey / Black". Each
            part of the name is one box (`jointsOf`), so the line breaks between the
            boat, its material and its colourway first (m2-last-critique.md, minor 8) */}
        <h2 className="qr-peek__boat">
          {jointsOf(row.boat).map((part, i) => (
            /* a part's identity IS its place in the name, and it never reorders */
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={i}>
              {i === 0 ? null : ' '}
              <span className="qr-peek__joint">{part}</span>
            </Fragment>
          ))}
        </h2>
        {/* WHOM IT IS FOR, AND A MISSING NAME SAID ONCE (the refine round, 2026-10-21). A
            draft with no name read "No name yet" here and "This quote is addressed to nobody" in
            the refusal under it: where the refusal says it, this line is not drawn. */}
        {row.customer || blockers.length === 0 ? (
          <p className="qr-peek__customer">
            <span className="qr-peek__glyph" aria-hidden="true">
              <Icon glyph={UserIcon} />
            </span>
            {row.customer ?? NO_NAME}
          </p>
        ) : null}

        <dl className="qr-facts">
          {/* ONE DAY, SAID ONCE (the refine round's second pass, 2026-10-21). The row beside
              this panel already says how long ago — "4 minutes ago" — and the peek said it
              again before the day, and a given quote then said the same day twice, written and
              given. A given quote says the day it was given; a draft says the day it was
              started, and its last change is the row's own age. */}
          {row.issuedAt ? (
            <Fact glyph={PaperPlaneTiltIcon} label="Given">
              <span className="qr-facts__when">{localDay(row.issuedAt)}</span>
            </Fact>
          ) : (
            /* the day alone: "2 minutes ago · 2026-10-21" stood beside the row's own "2 minutes
               ago" (the refine critique, 16) */
            <Fact glyph={CalendarBlankIcon} label="Started">
              <span className="qr-facts__when">{localDay(quote.createdAt)}</span>
            </Fact>
          )}
          <Fact glyph={TableIcon} label="On the price list">
            {/* each word of the list's own string is whole: at 1920 "W-W-WD" broke at its
                hyphen into "W-" over "W-WD" (2026-10-29) */}
            {row.label.split(' ').map((word, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={i}>
                {i === 0 ? null : ' '}
                <span className="qr-facts__when">{word}</span>
              </Fragment>
            ))}
          </Fact>
          <Fact glyph={UserIcon} label="Prepared by">
            {row.preparedBy ?? 'No one named'}
          </Fact>
          <Fact glyph={ListBulletsIcon} label="Items">
            {items}
          </Fact>
          {/* THE PRICE BY ITS DECLARED NAME, as the build's "Priced at" says it:
              this printed the engine's key, "RUNG cash" (m2-last-critique.md,
              major 5) */}
          <Fact glyph={TagIcon} label="Priced at">
            {levelWord(quote.levelKey)}
          </Fact>
        </dl>

        {/* THE SUMS ON THE PLATE'S PALE WELL, the total largest: a figure is read here, and
            it is set once and stays — a PriceFigure never counts up. */}
        {/* THE ITEMS ARE SUMMED APART FROM THE TOTAL ONLY WHEN SOMETHING STANDS BETWEEN THEM.
            With no adjustment the two were one figure said twice, a line apart (the second
            components critique, finding 10); the total says it once. */}
        <div className="qr-sums">
          {quote.adjustments.length > 0 ? (
            <>
              <div className="qr-sums__row">
                <span>The items</span>
                <PriceFigure amount={totals.packageTotal} />
              </div>
              <div className="qr-sums__row">
                <span>
                  {quote.adjustments.length.toLocaleString('en-AU')}{' '}
                  {quote.adjustments.length === 1 ? 'adjustment' : 'adjustments'}
                </span>
                <PriceFigure amount={totals.adjustmentsTotal} />
              </div>
            </>
          ) : null}
          <div className="qr-sums__row qr-sums__row--total">
            <span className="qr-sums__word">
              <Icon glyph={HandCoinsIcon} />
              Total
            </span>
            {row.total === null ? (
              <span className="qr-nofigure">{row.insteadOfTotal}</span>
            ) : (
              <PriceFigure amount={totals.total} />
            )}
          </div>
          {/* TAX, SAID AS THE QUOTE PRINTS IT, in the customer's words: the price includes tax,
              and at a rate only where one is set. "No tax rate is set on this quote, so no
              separate tax line is printed" explained the printer (the refine critique, 18). */}
          <p className="qr-sums__note">
            {totals.taxRate === null ? 'Includes tax.' : `Includes ${totals.taxRate}% tax.`}
          </p>
        </div>

        {blockers.length > 0 ? (
          <section className="qr-why" aria-label="Why this quote cannot go out yet">
            <p className="qr-why__head">
              <span className="qr-why__glyph" aria-hidden="true">
                <Icon glyph={WarningCircleIcon} weight="fill" />
              </span>
              Not ready to go to a customer
            </p>
            <ul className="qr-why__list">
              {blockers.map((why) => (
                <li key={why}>{why}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* THE VERSION RAIL. `live/github-releases-vscode.png`: every
            version in a rail, the newest carrying Latest. Drawn only
            where there is more than one, because a rail of one is a
            decoration. IN THE KIT each version stands on the rail on its
            own state's glyph, and the one being read wears the accent. */}
        {versions.length > 1 ? (
          <section className="qr-versions" aria-label="Every version of this quote">
            <p className="qr-versions__head">{versions.length.toLocaleString('en-AU')} versions</p>
            <ol className="qr-versions__list">
              {versions.map((version, at) => (
                <li
                  className="qr-versions__item"
                  key={version.id}
                  data-here={version.id === quote.id ? '' : undefined}
                >
                  <StateGlyph state={railState(version, at, versions.length)} />
                  <Button intent="quiet" size="sm" onClick={() => onGoTo(version.reference)}>
                    {version.reference}
                  </Button>
                  <span className="qr-versions__state">
                    {stateWord(railState(version, at, versions.length))}
                  </span>
                  {version.id === latest?.id ? (
                    <span className="qr-versions__latest">Latest</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>

      <div className="qr-acts">
        {/* THE ACT, AND IT IS THE REGISTER'S ONE AMBER ONCE A QUOTE IS
            TAKEN IN HAND. A person who has found their quote came here
            to open it, so this is the thing they press and it is drawn
            as the thing you press (`src/ui/Button.tsx`: a screen with
            an act has one — the foot of the register steps down to
            veiled while this is). At rest the panel reads the cursor's
            quote without anyone having chosen it, so New quote keeps
            the amber and this stands veiled beside it (2026-10-29).

            IT SAYS WHICH OF THE TWO IT OPENS, because they are two
            different objects and a dealer must never be surprised by
            which one arrived: a draft opens in the build, where it can
            still be changed; a given quote opens as the printed quote. */}
        <div className="qr-acts__one qr-acts__one--act">
          <Button
            intent={chosen ? 'act' : 'veiled'}
            icon={opensWith(row.state)}
            aria-label={opensAs(row.state)}
            refusedBecause={canOpen ? undefined : NO_WAY_TO_OPEN}
            onClick={() => onOpen(row)}
          >
            {opensAs(row.state)}
          </Button>
        </div>

        {row.state === 'superseded' && latest && latest.id !== quote.id ? (
          /* A REPLACED QUOTE OFFERS ONLY THE WAY TO WHAT REPLACED IT (build-close-critique.md,
             minor 10). The conversation is on the latest version, so that is where its one
             onward act goes — to the latest's own peek, in this same panel. The sentence that
             stood under it ("…so a change is made on the latest — never on this one") is what
             the act already says by being the only one. */
          <div className="qr-acts__one">
            <Button intent="veiled" icon={ArrowRightIcon} onClick={() => onGoTo(latest.reference)}>
              {`See ${latest.reference}, the latest`}
            </Button>
          </div>
        ) : (
          <IssuedOrDraftActs
            quote={quote}
            confirming={confirming}
            setConfirming={setConfirming}
            onNewVersion={onNewVersion}
            onDiscard={onDiscard}
          />
        )}
      </div>
    </div>
  )
}

/** THE TWO SECOND ACTS OF A QUOTE THAT IS NOT REPLACED: a new version of a given one, and the
 *  two-press discard of a draft. */
function IssuedOrDraftActs({
  quote,
  confirming,
  setConfirming,
  onNewVersion,
  onDiscard,
}: {
  quote: QuoteDef
  confirming: boolean
  setConfirming: (yes: boolean) => void
  onNewVersion: (quote: QuoteDef) => void
  onDiscard: (quote: QuoteDef) => void
}) {
  return (
    <>
      {/* A NEW VERSION IS OFFERED ONLY ON A GIVEN QUOTE (the refine round, 2026-10-21). On a
          draft it stood refused at rest, with two sentences on why a draft needs none — the
          app explaining itself, and the line that pushed the panel's last act under its foot
          at 1280 × 800. A draft is changed where it is written, which its amber act opens.

          VEILED AND NOT SECONDARY, in the kit's white plate on its own shadow: one amber, on
          whatever the screen is for at that moment (`docs/DECISIONS.md`), and a veiled
          control's sentence turns with the theme where a secondary one read 2.23 : 1 on this
          panel at night (e2e/rulers/refusal.spec.ts). The discard beside it, for the same
          reason. */}
      {quote.state === 'issued' ? (
        <div className="qr-acts__one">
          <Button
            intent="veiled"
            icon={CopySimpleIcon}
            aria-label="Make a new version"
            onClick={() => onNewVersion(quote)}
          >
            Make a new version
          </Button>
        </div>
      ) : null}

      {/* DISCARD IS TWO PRESSES. A document thrown away is not
            recoverable — `file` says a mint has no way back. The
            second press is the confirmation, in the panel where the
            first was made, rather than a dialog over the list. */}
      <div className="qr-acts__one">
        {quote.state === 'issued' ? (
          /* AND IT CALLS THE DOCUMENT WHAT IT IS. This control read
               "Discard this draft" on a quote that is not a draft,
               over a sentence explaining that it had gone to a
               customer — the label arguing with its own refusal. */
          <Button intent="veiled" icon={TrashIcon} refusedBecause={ISSUED_IS_NOT_DISCARDED}>
            Discard this quote
          </Button>
        ) : confirming ? (
          <>
            <Button
              intent="primary"
              icon={TrashIcon}
              onClick={() => {
                setConfirming(false)
                onDiscard(quote)
              }}
            >
              Discard {quote.reference} for good
            </Button>
            <Button intent="quiet" icon={ArrowUUpLeftIcon} onClick={() => setConfirming(false)}>
              Keep it
            </Button>
          </>
        ) : (
          <Button intent="veiled" icon={TrashIcon} onClick={() => setConfirming(true)}>
            Discard this draft
          </Button>
        )}
      </div>
    </>
  )
}
