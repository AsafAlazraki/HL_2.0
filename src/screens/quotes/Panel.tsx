import { Fragment, useState } from 'react'
import { Button, PriceFigure } from '@/ui'
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

/** en-AU grouping, once, because four sentences on this panel count. */
const au = (n: number): string => n.toLocaleString('en-AU')

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
  /** true while a query is narrowing the register */
  narrowed: boolean
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
  return (
    <aside className="qr-panel" aria-label="The quote under the cursor">
      {quote && row ? (
        <Peek {...props} quote={quote} row={row} />
      ) : bare && read ? (
        <Teaching
          register={register}
          sheetOpen={props.sheetOpen}
          sheetLooking={props.sheetLooking}
          openTheFile={props.openTheFile}
        />
      ) : (
        <Standing register={register} read={read} narrowed={props.narrowed} />
      )}
      {said ? <output className="qr-said">{said}</output> : null}
    </aside>
  )
}

/* ---------------------------------------------------------- */
/* Bare — the screen the owner sees first, and for a while      */
/* ---------------------------------------------------------- */

function Teaching({
  register,
  sheetOpen,
  sheetLooking,
  openTheFile,
}: {
  register: Register
  sheetOpen: boolean
  sheetLooking: boolean
  openTheFile?: () => void
}) {
  return (
    <div className="qr-teach">
      <h2 className="qr-teach__head">No quote has been written here yet.</h2>

      <section className="qr-teach__block">
        <p className="qr-teach__q">What lands here</p>
        <p className="qr-teach__a">
          Every quote this business writes. A <b>draft</b> from the moment a boat is picked, an{' '}
          <b>issued</b> quote from the moment it is given to a customer — read-only for good — and a{' '}
          <b>superseded</b> one when a newer version replaces it. Those are the list&rsquo;s three
          groups, and they stand at{' '}
          {register.bands.map((b) => b.held.toLocaleString('en-AU')).join(', ')} because that is
          what is filed.
        </p>
      </section>

      <section className="qr-teach__block">
        <p className="qr-teach__q">Why it is empty today</p>
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
        <p className="qr-teach__q">What to do</p>
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
              <Button intent="veiled" onClick={openTheFile}>
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
      <p className="qr-teach__foot">
        The first quote you start stands here, with its boat under the list and its total beside it.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Standing — rows exist, none is open                          */
/* ---------------------------------------------------------- */

/** What each band holds, said once on its tile in the dealer's words. */
const BAND_HOLDS: Record<RegisterStateId, string> = {
  draft: 'Written here, and still changeable.',
  issued: 'Given to a customer, and read-only for good.',
  superseded: 'Given, then replaced by a newer version.',
}

function Standing({
  register,
  read,
  narrowed,
}: {
  register: Register
  read: boolean
  narrowed: boolean
}) {
  if (!read) {
    return (
      <div className="qr-teach">
        <h2 className="qr-teach__head">Reading what this browser has kept…</h2>
      </div>
    )
  }
  /* THE SUMS ARE OF WHAT IS SHOWN, AND THE COUNTS ARE OF WHAT IS
     FILED, so the sentence under them has to say which is which. A
     register narrowed to nothing would otherwise read "0 of 23 carry
     a figure", which is a claim about the documents and not about the
     query. */
  const shown = register.shown.length
  const summed = register.bands.reduce((n, b) => n + b.summed, 0)

  return (
    <div className="qr-teach qr-standing">
      {/* IN THE DEALER'S WORDS (m2-last-critique.md, major 5): this said
          "1 quote, in three bands", the design's word for the groups */}
      <h2 className="qr-teach__head">
        {au(register.held)}{' '}
        {register.held === 1 ? 'quote, by where it stands.' : 'quotes, by where they stand.'}
      </h2>

      {/* THREE TILES, ONE PER BAND, and at a desk they share the panel's height
          (quotes.css): the count large, the sum under it, and one line saying
          what the band holds in the dealer's words. With one quote filed the
          panel's middle was 500px of white between this tally and the help at
          its foot (the M2-close critique's finding 6); the tally is what the
          panel is FOR at rest, so it is what takes the room. */}
      <dl className="qr-tally">
        {register.bands.map((band) => (
          <div className="qr-tally__row" key={band.spec.id} data-state={band.spec.id}>
            <dt className="qr-tally__word">
              <span className="qr-glyph" data-state={band.spec.id} aria-hidden="true" />
              {band.spec.word}
            </dt>
            <dd className="qr-tally__n">
              {narrowed ? `${au(band.rows.length)} / ${au(band.held)}` : au(band.held)}
            </dd>
            <dd className="qr-tally__say">{BAND_HOLDS[band.spec.id]}</dd>
            <dd className="qr-tally__sum">
              {band.summed > 0 ? <PriceFigure amount={band.sum} /> : <span>—</span>}
            </dd>
          </div>
        ))}
      </dl>

      <p className="qr-teach__a">
        {/* "each figure is the sum of that document's own frozen lines" was the
            engine describing itself (m2-last-critique.md, major 5); what a dealer
            is owed is what the figure adds up, and at which prices */}
        {narrowed
          ? `A search is narrowing the list, so each figure above adds up what it found — ${au(shown)} of ${au(register.held)}.`
          : summed === register.held
            ? register.held === 1
              ? 'The figure above is its total, at the prices it was written at.'
              : 'Each figure above adds up the quotes in that group, at the prices they were written at.'
            : `${au(summed)} of ${au(register.held)} have a price; the rest are drafts with nothing priced on them yet, so the figures above add up those ${au(summed)}.`}
      </p>

      {/* HOW TO READ ONE, IN ONE SENTENCE TRUE OF A FINGER AND A MOUSE ALIKE. Until
          2026-09-25 a desk read two paragraphs of keys here — Space, Enter, and why a single
          letter does nothing unless the list has the focus — and a phone read this sentence
          (m2-last-critique.md major 7: "The Quotes panel spends two paragraphs on them"). The
          keys still work; the `?` sheet names them. It does not offer the double press: a
          double tap is a phone's own zoom gesture. */}
      {/* THE HELP STANDS AT THE PANEL'S FOOT. At a desk the panel runs the
          height of the window beside the register (rule (e)), and the two
          things it says at rest are what is filed, at the top, and how to
          read one, at the foot — so the panel is composed top and bottom
          rather than a card with its lower half empty. */}
      <div className="qr-help">
        <p className="qr-teach__a">
          Press a quote to read it here without leaving the list. The act at the foot of this panel
          opens it — a draft where it is written, an issued quote as the paper it became.
        </p>
      </div>
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

const WHAT_OPENING_DOES: Record<RegisterRow['state'], string> = {
  draft:
    'It opens where it is written — every chapter of it, still changeable, with the running total at the top.',
  issued:
    'It opens as the sheet the customer was given, exactly as it was given, at A4 and ready to print. Nothing on it can be edited.',
  superseded:
    'It opens as the sheet that customer was given. A newer version has replaced it, and this is still the document they hold.',
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
    <div className="qr-peek">
      <div className="qr-peek__top">
        <span className="qr-glyph" data-state={row.state} aria-hidden="true" />
        <span className="qr-peek__state">{stateWord(row.state)}</span>
        <span className="qr-peek__ref">{quote.reference}</span>
        <Button intent="veiled" aria-label="Close" onClick={onClose}>
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
      <p className="qr-peek__customer">{row.customer ?? 'Addressed to nobody yet'}</p>

      <dl className="qr-facts">
        <div className="qr-facts__row">
          <dt>Written</dt>
          <dd>
            {ageSay(quote.createdAt, now().getTime())} · {localDay(quote.createdAt)}
          </dd>
        </div>
        <div className="qr-facts__row">
          <dt>{row.issuedAt ? 'Given to the customer' : 'Last touched'}</dt>
          <dd>
            {row.issuedAt
              ? `${ageSay(row.issuedAt, now().getTime())} · ${localDay(row.issuedAt)}`
              : ageSay(quote.updatedAt, now().getTime())}
          </dd>
        </div>
        <div className="qr-facts__row">
          <dt>In the price file</dt>
          <dd>{row.label}</dd>
        </div>
        <div className="qr-facts__row">
          <dt>Prepared by</dt>
          <dd>{row.preparedBy ?? 'Nobody is named on it'}</dd>
        </div>
        <div className="qr-facts__row">
          <dt>Lines</dt>
          <dd>
            {row.lines.toLocaleString('en-AU')}
            {row.unpriced > 0
              ? `, ${row.unpriced.toLocaleString('en-AU')} of them not priced on this quote`
              : ''}
          </dd>
        </div>
        {/* THE LEVEL BY ITS DECLARED NAME, as the build's "Priced at" says it:
            this printed the engine's key, "RUNG cash" (m2-last-critique.md,
            major 5) */}
        <div className="qr-facts__row">
          <dt>Priced at</dt>
          <dd>{levelWord(quote.levelKey)}</dd>
        </div>
      </dl>

      <div className="qr-sums">
        <div className="qr-sums__row">
          <span>The lines</span>
          <PriceFigure amount={totals.packageTotal} />
        </div>
        {quote.adjustments.length > 0 ? (
          <div className="qr-sums__row">
            <span>
              {quote.adjustments.length.toLocaleString('en-AU')}{' '}
              {quote.adjustments.length === 1 ? 'adjustment' : 'adjustments'}
            </span>
            <PriceFigure amount={totals.adjustmentsTotal} />
          </div>
        ) : null}
        <div className="qr-sums__row qr-sums__row--total">
          <span>Total</span>
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
          <p className="qr-why__head">Not ready to go to a customer</p>
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
          decoration. */}
      {versions.length > 1 ? (
        <section className="qr-versions" aria-label="Every version of this quote">
          <p className="qr-versions__head">
            {versions.length.toLocaleString('en-AU')} versions of this conversation
          </p>
          <ol className="qr-versions__list">
            {versions.map((version) => (
              <li
                className="qr-versions__item"
                key={version.id}
                data-here={version.id === quote.id ? '' : undefined}
              >
                <Button intent="veiled" onClick={() => onGoTo(version.reference)}>
                  {version.reference}
                </Button>
                <span className="qr-versions__state">
                  {version.state === 'draft' ? 'Draft' : 'Issued'}
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
        <div className="qr-acts__one">
          <Button
            intent="act"
            aria-label={opensAs(row.state)}
            refusedBecause={canOpen ? undefined : NO_WAY_TO_OPEN}
            onClick={() => onOpen(row)}
          >
            {opensAs(row.state)}
          </Button>
        </div>
        <p className="qr-acts__where">{WHAT_OPENING_DOES[row.state]}</p>

        <div className="qr-acts__one">
          {/* AND THIS ONE STEPPED DOWN FROM THE AMBER IT USED TO
              CARRY. It held the act's colour on an issued quote
              because opening was refused and it was the only live
              control on the panel; it is now the second thing you
              might do to a document you have just opened, which is a
              dark chip with, on a draft, its sentence.
              `docs/DECISIONS.md` settles the ownership: one amber, on
              whatever the screen is for at that moment. */}
          <Button
            intent="veiled"
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
            <Button intent="veiled" refusedBecause={ISSUED_IS_NOT_DISCARDED}>
              Discard this quote
            </Button>
          ) : confirming ? (
            <>
              <Button
                intent="veiled"
                onClick={() => {
                  setConfirming(false)
                  onDiscard(quote)
                }}
              >
                Discard {quote.reference} for good
              </Button>
              <Button intent="veiled" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </>
          ) : (
            <Button intent="veiled" onClick={() => setConfirming(true)}>
              Discard this draft
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
