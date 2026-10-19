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
  QuestionIcon,
  SignpostIcon,
  TableIcon,
  TagIcon,
  TrashIcon,
  TrayIcon,
  UserIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Button, Icon, PriceFigure, STATE_GLYPH, move, type Glyph, type QuoteState } from '@/ui'
import type { QuoteDef } from '@/domain/model'
import { issueBlockers, quoteTotals } from '@/domain/quote/totals'
import {
  ageSay,
  versionsOf,
  type Register,
  type RegisterRow,
  type RegisterStateId,
} from '@/domain/quote/register'
import { localDay } from '@/domain/quote/day'
import { levelWord } from '@/domain/quote/levelSaid'
import { jointsOf } from '@/domain/quote/wrap'
import {
  ISSUED_IS_NOT_DISCARDED,
  NO_WAY_TO_OPEN,
  ONLY_ISSUED_IS_VERSIONED,
  stateWord,
} from './Quotes'

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
  'Nothing has been quoted in this browser. A quote is kept in the browser it was written in, so one written on another computer — or in another browser on this one — is not listed here. An empty list is the true state, not a fault. No quote is invented to fill it.'

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
  register: Register
  /** the document under the cursor, when the panel is open on one */
  quote?: QuoteDef
  row?: RegisterRow
  all: readonly QuoteDef[]
  now: () => Date
  /** what the last act said, printed where the act was attempted */
  said: string | null
  sheetOpen: boolean
  /** the price file is still being looked for in this browser — not yet found, not yet missing */
  sheetLooking: boolean
  openTheFile?: () => void
  onGoTo: (reference: string) => void
  onClose: () => void
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
  const { bare, read, register, quote, row, said } = props
  const state = quote && row ? 'peek' : bare && read ? 'teach' : 'standing'
  /* THE FIRST PAINT IS SIMPLY THERE; A CHANGE OF STATE AFTER IT RISES IN. The state the column
     was first drawn in is remembered, and the first render that finds it changed says so —
     React's own way of deriving a value from the one before, with no effect and no ref. */
  const [first] = useState(state)
  const [changed, setChanged] = useState(false)
  if (!changed && state !== first) setChanged(true)
  return (
    <aside className="qr-panel" aria-label="The quote under the cursor">
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
          <Standing register={register} read={read} />
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

/** A question the empty panel answers, led by the glyph of what it is about. */
function Question({ glyph, children }: { glyph: Glyph; children: string }) {
  return (
    <p className="qr-teach__q">
      <span className="qr-teach__glyph" aria-hidden="true">
        <Icon glyph={glyph} />
      </span>
      {children}
    </p>
  )
}

/* ---------------------------------------------------------- */
/* Bare — the screen the owner sees first, and for a while      */
/* ---------------------------------------------------------- */

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
      <h2 className="qr-teach__head">No quote has been written here yet.</h2>

      <section className="qr-teach__block">
        <Question glyph={TrayIcon}>What lands here</Question>
        <p className="qr-teach__a">
          Every quote this business writes. A <b>draft</b> from the moment a boat is picked, an{' '}
          <b>issued</b> quote from the moment it is given to a customer — read-only for good — and a{' '}
          <b>superseded</b> one when a newer version replaces it. Those are the list&rsquo;s three
          groups.
          {/* THEIR COUNTS ARE ON THEIR HEADS, and only there (the second components critique,
              finding 10): this sentence said "they stand at 0, 0, 0" beside three heads that
              each already say 0. */}
        </p>
      </section>

      <section className="qr-teach__block">
        <Question glyph={QuestionIcon}>Why it is empty today</Question>
        {/* WHAT IS TRUE TODAY, AND NOTHING ELSE (built-critique-m2-close-2.md,
            major 4). This said "Work is kept here — not on a server — until the
            file is exported": a promise of an export no screen has, the same
            fault as a plan's milestone in new words. A quote is kept in the
            browser it was written in, which is the sentence the build and the
            paper already say about a link; moving quotes between computers is
            said nowhere until something on a screen does it. */}
        <p className="qr-teach__a">{WHERE_QUOTES_ARE_KEPT}</p>
      </section>

      <section className="qr-teach__block">
        <Question glyph={SignpostIcon}>What to do</Question>
        {/* THIS PARAGRAPH USED TO BE A REFUSAL. It read "It cannot act
            yet: the picker is not built yet", printed under the one
            act on an empty register — on a tree where the picker had
            been live for a day. It is now what actually happens when
            you press it. */}
        <p className="qr-teach__a">
          <b>New quote</b> is the last line of the list, and it opens the picker: every boat on the
          price file, by maker and by model. The moment one is chosen the first draft lands at the
          top of the <b>Draft</b> band, and this panel becomes the way to read it without leaving
          the list.
        </p>
        {sheetOpen ? null : sheetLooking ? (
          /* still looking, which is not the same as not found (critique #15) */
          <p className="qr-teach__a">Looking for a price file in this browser…</p>
        ) : (
          <div className="qr-teach__door">
            <p className="qr-teach__a">
              No price file is open in this browser either, so there is nothing to quote from.
            </p>
            {openTheFile ? (
              <Button intent="secondary" icon={FolderOpenIcon} onClick={openTheFile}>
                Load the Master Price File
              </Button>
            ) : null}
          </div>
        )}
      </section>

      {/* NO WIREFRAME AND NO SENTENCE TO A CRITIC (the M2-close critique's
          minor 17). A diagram of dashed boxes labelled "the boat", "the
          total" stood here, and a paragraph explaining that no photograph
          stood on the screen. What the owner needs is what will happen, said
          once: the first quote stands under the rows with its boat. */}
      {/* AND ONLY WHAT IS TRUE AT EVERY SIZE: this promised "its boat under the list and its
          total beside it", and under 1200 there is no room under the list for a boat. */}
      <p className="qr-teach__foot">
        The first quote you start stands here when it is pressed in the list.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Standing — rows exist, none is open                          */
/* ---------------------------------------------------------- */

/** What each band holds, said once in the dealer's words. */
const BAND_HOLDS: Record<RegisterStateId, string> = {
  draft: 'Written here, and still changeable.',
  issued: 'Given to a customer, and read-only for good.',
  superseded: 'Given, then replaced by a newer version.',
}

/* ============================================================
   AT REST, THE PANEL SAYS WHAT IT IS FOR, AND COUNTS NOTHING (the second
   components critique, finding 10, 2026-09-29).

   It was three tinted tiles, one per band, each about 175px tall at 1440
   and each holding the band's count, its sum and a line — the same three
   counts and the same three sums the band heads print beside it, under a
   heading that counted the quotes a third time ("2 quotes, by where they
   stand") beside the head's "2 quotes are filed in this browser". A count
   is said once, where it is about something: on the head of the band it
   counts, with the rows it counts under it.

   What the panel says at rest is what nothing else on the screen says:
   that it is the reader of the list, how a quote comes to be read in it
   and what its act will open, and what the list's three words mean. It
   is Mail's reading pane with nothing selected, which says what it is for
   in its middle rather than drawing a frame with nothing in it — and at a
   desk that is where it stands, in the middle of the plate (quotes.css).
   ============================================================ */
function Standing({ register, read }: { register: Register; read: boolean }) {
  if (!read) {
    return (
      <div className="qr-teach">
        <h2 className="qr-teach__head">Reading what this browser has kept…</h2>
      </div>
    )
  }

  return (
    <div className="qr-standing">
      <span className="qr-standing__disc" aria-hidden="true">
        <Icon glyph={BookOpenTextIcon} size="lg" />
      </span>
      <h2 className="qr-standing__head">Press a quote to read it here</h2>
      {/* HOW TO READ ONE, IN ONE SENTENCE TRUE OF A FINGER AND A MOUSE ALIKE. Until
          2026-09-25 a desk read two paragraphs of keys here — Space, Enter, and why a single
          letter does nothing unless the list has the focus — and a phone read this sentence
          (m2-last-critique.md major 7: "The Quotes panel spends two paragraphs on them"). The
          keys still work; the `?` sheet names them. It does not offer the double press: a
          double tap is a phone's own zoom gesture. */}
      <p className="qr-standing__say">
        The list stays where it is. The act at the foot of this panel opens the quote — a draft
        where it is written, an issued quote as the paper it became.
      </p>

      {/* THE LIST'S THREE WORDS, each led by its state's glyph in a disc of its own ink —
          rose, leaf, graphite — as the band heads draw them, and said in the dealer's words.
          No figure: the heads carry those. */}
      <dl className="qr-legend">
        {register.bands.map(({ spec }) => (
          <div className="qr-legend__row" key={spec.id} data-state={spec.id}>
            <dt className="qr-legend__word">
              <StateGlyph state={spec.id} />
              {spec.word}
            </dt>
            <dd className="qr-legend__say">{BAND_HOLDS[spec.id]}</dd>
          </div>
        ))}
      </dl>
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
const opensAs = (state: RegisterRow['state']): string =>
  state === 'draft' ? 'Open the build' : 'Open the document'

/** THE GLYPH THE OPENING ACT ENDS ON: an arrow into the build a draft is written on, and the
 *  paper — the glyph the build's own "Open the document" carries — for a quote given. */
const opensWith = (state: RegisterRow['state']): Glyph =>
  state === 'draft' ? ArrowRightIcon : FileTextIcon

const WHAT_OPENING_DOES: Record<RegisterRow['state'], string> = {
  draft:
    'It opens where it is written — every chapter of it, still changeable, with the running total at the top.',
  issued:
    'It opens as the sheet the customer was given, exactly as it was given, at A4 and ready to print. Nothing on it can be edited.',
  superseded:
    'It opens as the sheet that customer was given. A newer version has replaced it, and this is still the document they hold.',
}

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

/* A DAY IS ONE WORD AND NEVER BREAKS AT ITS HYPHENS. The value's `overflow-wrap: anywhere`
   took a hyphen as a place to break, and the peek said "5 minutes ago · 2026-" over "10-19"
   (components-critique-2 minor 17, build-close-critique minor 17). The line may break at its
   " · ", between how long ago and which day, and nowhere inside either. */
function When({ age, day }: { age: string; day: string }) {
  return (
    <>
      <span className="qr-facts__when">{age}</span> · <span className="qr-facts__when">{day}</span>
    </>
  )
}

function Peek({
  quote,
  row,
  all,
  now,
  canOpen,
  onGoTo,
  onClose,
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

  return (
    <div className="qr-peek" data-state={row.state}>
      <div className="qr-peek__top">
        <StateGlyph state={row.state} />
        <span className="qr-peek__state">{stateWord(row.state)}</span>
        <span className="qr-peek__ref">{quote.reference}</span>
        <Button intent="quiet" size="sm" icon={XIcon} aria-label="Close" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* THE BOAT AS A PERSON SAYS IT (built-critique-m2-close-2.md, the one
          thing to change first); the price file's own string for it is a
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
      <p className="qr-peek__customer">
        <span className="qr-peek__glyph" aria-hidden="true">
          <Icon glyph={UserIcon} />
        </span>
        {row.customer ?? 'Addressed to nobody yet'}
      </p>

      <dl className="qr-facts">
        <Fact glyph={CalendarBlankIcon} label="Written">
          <When age={ageSay(quote.createdAt, now().getTime())} day={localDay(quote.createdAt)} />
        </Fact>
        <Fact
          glyph={row.issuedAt ? PaperPlaneTiltIcon : CalendarBlankIcon}
          label={row.issuedAt ? 'Given to the customer' : 'Last touched'}
        >
          {row.issuedAt ? (
            <When age={ageSay(row.issuedAt, now().getTime())} day={localDay(row.issuedAt)} />
          ) : (
            ageSay(quote.updatedAt, now().getTime())
          )}
        </Fact>
        <Fact glyph={TableIcon} label="In the price file">
          {row.label}
        </Fact>
        <Fact glyph={UserIcon} label="Prepared by">
          {row.preparedBy ?? 'Nobody is named on it'}
        </Fact>
        <Fact glyph={ListBulletsIcon} label="Lines">
          {`${row.lines.toLocaleString('en-AU')}${
            row.unpriced > 0
              ? `, ${row.unpriced.toLocaleString('en-AU')} of them not priced on this quote`
              : ''
          }`}
        </Fact>
        {/* THE LEVEL BY ITS DECLARED NAME, as the build's "Priced at" says it:
            this printed the engine's key, "RUNG cash" (m2-last-critique.md,
            major 5) */}
        <Fact glyph={TagIcon} label="Priced at">
          {levelWord(quote.levelKey)}
        </Fact>
      </dl>

      {/* THE SUMS ON THE PLATE'S PALE WELL, the total largest: a figure is read here, and
          it is set once and stays — a PriceFigure never counts up. */}
      {/* THE LINES ARE SUMMED APART FROM THE TOTAL ONLY WHEN SOMETHING STANDS BETWEEN THEM.
          With no adjustment the two were one figure said twice, a line apart (the second
          components critique, finding 10); the total says it once. */}
      <div className="qr-sums">
        {quote.adjustments.length > 0 ? (
          <>
            <div className="qr-sums__row">
              <span>The lines</span>
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
        {totals.taxRate === null ? (
          <p className="qr-sums__note">
            Tax-inclusive, and no rate has been typed on this quote — so it prints no separate tax
            line and none is assumed.
          </p>
        ) : (
          <p className="qr-sums__note">
            Inclusive of {totals.taxRate}% tax, which somebody typed on this quote.
          </p>
        )}
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
          <p className="qr-versions__head">
            {versions.length.toLocaleString('en-AU')} versions of this conversation
          </p>
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

      <div className="qr-acts">
        {/* THE ACT, AND IT IS THE REGISTER'S ONE AMBER WHILE A
            DOCUMENT IS OPEN. A person who has found their quote came
            here to open it, so this is the thing they press and it is
            drawn as the thing you press (`src/ui/Button.tsx`: a screen
            with an act has one — the foot of the register steps down
            to veiled while this is on screen).

            IT SAYS WHICH OF THE TWO IT OPENS, because they are two
            different objects and a dealer must never be surprised by
            which one arrived. A draft opens where it is written and
            can still be changed; an issued quote opens as the paper
            the customer was given. The sentence
            under it is what that press does rather than a caption. */}
        <div className="qr-acts__one qr-acts__one--act">
          <Button
            intent="act"
            icon={opensWith(row.state)}
            aria-label={opensAs(row.state)}
            refusedBecause={canOpen ? undefined : NO_WAY_TO_OPEN}
            onClick={() => onOpen(row)}
          >
            {opensAs(row.state)}
          </Button>
        </div>
        <p className="qr-acts__where">{WHAT_OPENING_DOES[row.state]}</p>

        {row.state === 'superseded' && latest && latest.id !== quote.id ? (
          /* A REPLACED QUOTE OFFERS ONLY THE WAY TO WHAT REPLACED IT (build-close-critique.md,
             minor 10). Its peek offered "Make a new version" and "Discard this quote" on a quote
             -02 already replaces: a second version of an old paper, and a refusal of a throw-away
             nobody would ask for. The conversation is on the latest version, so that is where
             its one onward act goes — to the latest's own peek, in this same panel. */
          <>
            <div className="qr-acts__one">
              <Button
                intent="veiled"
                icon={ArrowRightIcon}
                onClick={() => onGoTo(latest.reference)}
              >
                {`Read ${latest.reference}, the latest`}
              </Button>
            </div>
            <p className="qr-acts__where">
              {`${row.supersededBy ?? latest.reference} replaced it, so a change is made on the latest — never on this one.`}
            </p>
          </>
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
      <div className="qr-acts__one">
        {/* AND THIS ONE STEPPED DOWN FROM THE AMBER IT USED TO
              CARRY. It held the act's colour on an issued quote
              because opening was refused and it was the only live
              control on the panel; it is now the second thing you
              might do to a document you have just opened — in the
              kit, the white plate on its own shadow (`veiled`) — with,
              on a draft, its sentence. `docs/DECISIONS.md` settles the
              ownership: one amber, on whatever the screen is for at that
              moment.

              VEILED AND NOT SECONDARY, because it can refuse: the kit
              inks a secondary control's sentence for a ground that is
              light in both themes, and this panel is the room's own
              panel, navy at night, where that sentence read 2.23 : 1
              (e2e/rulers/refusal.spec.ts); a veiled control's sentence
              turns with the theme. The discard beside it, for the same
              reason. */}
        <Button
          intent="veiled"
          icon={CopySimpleIcon}
          aria-label="Make a new version"
          refusedBecause={quote.state === 'issued' ? undefined : ONLY_ISSUED_IS_VERSIONED}
          onClick={() => onNewVersion(quote)}
        >
          Make a new version
        </Button>
      </div>

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
