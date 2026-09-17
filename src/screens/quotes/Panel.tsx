import { useState } from 'react'
import { Button, Kbd, PriceFigure } from '@/ui'
import type { QuoteDef } from '@/domain/model'
import { issueBlockers, quoteTotals } from '@/domain/quote/totals'
import { ageSay, versionsOf, type Register, type RegisterRow } from '@/domain/quote/register'
import { localDay } from '@/domain/quote/day'
import {
  ISSUED_IS_NOT_DISCARDED,
  NO_WAY_TO_OPEN,
  ONLY_ISSUED_IS_VERSIONED,
  stateWord,
} from './Quotes'

/** en-AU grouping, once, because four sentences on this panel count. */
const au = (n: number): string => n.toLocaleString('en-AU')

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
        <Teaching register={register} sheetOpen={props.sheetOpen} openTheFile={props.openTheFile} />
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
  openTheFile,
}: {
  register: Register
  sheetOpen: boolean
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
          <b>superseded</b> one when a newer version replaces it. The register&rsquo;s three bands
          are those three, and they are standing at{' '}
          {register.bands.map((b) => b.held.toLocaleString('en-AU')).join(', ')} because that is
          what is filed.
        </p>
      </section>

      <section className="qr-teach__block">
        <p className="qr-teach__q">Why it is empty today</p>
        <p className="qr-teach__a">
          Nothing has been quoted in this browser. Work is kept here — not on a server — until the
          file is exported, so a new machine starts with an empty register and that is the true
          state rather than a fault. No quote is invented to fill it.
        </p>
      </section>

      <section className="qr-teach__block">
        <p className="qr-teach__q">What to do</p>
        {/* THIS PARAGRAPH USED TO BE A REFUSAL. It read "It cannot act
            yet: the picker is not built yet", printed under the one
            act on an empty register — on a tree where the picker had
            been live for a day. It is now what actually happens when
            you press it. */}
        <p className="qr-teach__a">
          <b>New quote</b> is the last row of the register, and it opens the picker: every boat on
          the price file, by register and by model. The moment one is chosen the first draft lands
          at the top of the <b>Draft</b> band, and this panel becomes the way to read it without
          leaving the list.
        </p>
        {sheetOpen ? null : (
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

      {/* THE ANATOMY, DRAWN EMPTY, EVERY REGION NAMED — the one way to
          show what a row will be without writing a quote nobody made.
          Out of the reading order entirely: it is a diagram, not a
          control and not a record. */}
      <p className="qr-teach__cap">A row will read like this</p>
      <div className="qr-spec" aria-hidden="true">
        <span className="qr-spec__glyph" />
        <span className="qr-spec__who">
          <span className="qr-spec__well">the boat</span>
          <span className="qr-spec__well qr-spec__well--quiet">the customer</span>
        </span>
        <span className="qr-spec__well qr-spec__well--right">the total</span>
        <span className="qr-spec__well qr-spec__well--quiet qr-spec__well--ref">reference</span>
        <span className="qr-spec__well qr-spec__well--quiet qr-spec__well--age">age</span>
      </div>

      <p className="qr-teach__foot">
        No photograph stands on this screen. A picture belongs to the boat it depicts, and an empty
        register has no boat to depict — so nothing stands in for one. The total on a row is written
        from frozen lines, never from a live price read.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Standing — rows exist, none is open                          */
/* ---------------------------------------------------------- */

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
    <div className="qr-teach">
      <h2 className="qr-teach__head">
        {au(register.held)} {register.held === 1 ? 'quote' : 'quotes'}, in three bands.
      </h2>

      <dl className="qr-tally">
        {register.bands.map((band) => (
          <div className="qr-tally__row" key={band.spec.id}>
            <dt className="qr-tally__word">
              <span className="qr-glyph" data-state={band.spec.id} aria-hidden="true" />
              {band.spec.word}
            </dt>
            <dd className="qr-tally__n">
              {narrowed ? `${au(band.rows.length)} / ${au(band.held)}` : au(band.held)}
            </dd>
            <dd className="qr-tally__sum">
              {band.summed > 0 ? <PriceFigure amount={band.sum} /> : <span>—</span>}
            </dd>
          </div>
        ))}
      </dl>

      <p className="qr-teach__a">
        {narrowed
          ? `A query is narrowing the register, so each figure above is the sum of what it matched — ${au(shown)} of ${au(register.held)}.`
          : summed === register.held
            ? 'Every one of them carries a figure, and each figure is the sum of that document’s own frozen lines.'
            : `${au(summed)} of ${au(register.held)} carry a figure; the rest are drafts with nothing priced on them yet, so the sums above are of those ${au(summed)}.`}
      </p>

      {/* HOW TO READ ONE, TOLD IN THE VOCABULARY THE DEVICE HAS.
          Every word below is true of both devices, and only one of
          them is drawn: `quotes.css` keeps the keyboard's version
          where `pointer: fine` says there is a keyboard and the
          touch version where `pointer: coarse` says there is not.
          The critique counted a `J K Space Enter Esc` legend on a
          390px phone; a register that teaches keys nobody has is
          teaching nothing. */}
      <div className="qr-keysay">
        <p className="qr-teach__a">
          Press <Kbd>Space</Kbd> on a row to read it here without leaving the list, and hold it to
          glance. <Kbd>Enter</Kbd> opens the one under the cursor — a draft where it is written, an
          issued quote as the paper it became — and so does a second press on the row itself. The
          arrows keep moving while it is open.
        </p>

        <p className="qr-teach__a">
          Those keys belong to the register and to nothing else: a single letter does nothing at all
          unless the list itself has the focus, so none of them can fire while you are typing.
        </p>
      </div>

      {/* THE TOUCH SENTENCE CLAIMS NOTHING A FINGER CANNOT DO. It does
          not offer the double press: a double tap is the browser's own
          zoom gesture on a phone and `dblclick` is not something to
          promise there. What is always true on a touch screen is that
          the act is at the foot of this panel, so that is what it
          says. */}
      <p className="qr-teach__a qr-touchsay">
        Press a row to read it here without leaving the list. The act at the foot of this panel
        opens it — a draft where it is written, an issued quote as the paper it became.
      </p>
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
    'It opens as the sheet the customer was given: the same frozen lines, at A4, ready to print. Nothing on it can be edited.',
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
          <Kbd>Esc</Kbd>
        </Button>
      </div>

      <h2 className="qr-peek__boat">{quote.subjectLabel}</h2>
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
          <dt>Prepared by</dt>
          <dd>{row.preparedBy ?? 'Nobody is named on it'}</dd>
        </div>
        <div className="qr-facts__row">
          <dt>Lines</dt>
          <dd>
            {row.lines.toLocaleString('en-AU')}
            {row.unpriced > 0
              ? `, ${row.unpriced.toLocaleString('en-AU')} of them carrying no price`
              : ''}
          </dd>
        </div>
        <div className="qr-facts__row">
          <dt>Rung</dt>
          <dd>{quote.levelKey}</dd>
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
            the customer was given. `Enter` is on it, and the sentence
            under it is what that press does rather than a caption. */}
        <div className="qr-acts__one">
          <Button
            intent="act"
            aria-label={opensAs(row.state)}
            refusedBecause={canOpen ? undefined : NO_WAY_TO_OPEN}
            onClick={() => onOpen(row)}
          >
            {opensAs(row.state)}
            <Kbd>Enter</Kbd>
          </Button>
        </div>
        <p className="qr-acts__where">{WHAT_OPENING_DOES[row.state]}</p>

        <div className="qr-acts__one">
          {/* AND THIS ONE STEPPED DOWN FROM THE AMBER IT USED TO
              CARRY. It held the act's colour on an issued quote
              because opening was refused and it was the only live
              control on the panel; it is now the second thing you
              might do to a document you have just opened, which is a
              dark chip with its keycap and, on a draft, its sentence.
              `docs/DECISIONS.md` settles the ownership: one amber, on
              whatever the screen is for at that moment. */}
          <Button
            intent="veiled"
            aria-label="Make a new version"
            refusedBecause={quote.state === 'issued' ? undefined : ONLY_ISSUED_IS_VERSIONED}
            onClick={() => onNewVersion(quote)}
          >
            Make a new version
            <Kbd>V</Kbd>
          </Button>
        </div>

        {/* DISCARD IS NOT A KEYSTROKE. Every other act on this screen
            has a single letter; this one does not, because the sweep's
            keyboard vocabulary is for moving and reading and a
            document thrown away by a mis-typed letter is not
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
