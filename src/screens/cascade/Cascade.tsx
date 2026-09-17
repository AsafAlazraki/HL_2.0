import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Button, PriceFigure } from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { makeCtx } from '@/domain/model'
import { money } from '@/domain/money'
import { quoteTotals, signedMoney } from '@/domain/quote'
import { groundFor, hostOf, type Ground } from './ground'
import {
  NO_FILE,
  NO_QUOTE,
  isRefused,
  readProposal,
  type Cause,
  type CauseRow,
  type Fate,
  type Proposal,
} from './proposal'
import './cascade.css'

/* ============================================================
   THE CASCADE — "Because", direction B of
   docs/research/refs/cascade/notes.md §6.

   THE OWNER HANDED THE PICKS OVER, so the direction is chosen here
   and the screen is marked PROVISIONAL in docs/SCREENS.md until he
   has looked at it.

   WHY B AND NOT THE OTHER THREE. Only B is ORDERED BY CAUSE, and the
   whole brief for this screen is a causal story rather than a list.
   A ("The plan") leads with a census and groups by verb, which is
   Porsche's own shape and carries Porsche's own defect — five removed
   rows reading one sentence that names nothing. C ("In the document")
   is the best idea in the sweep and belongs to the DOCUMENT screen,
   where the frozen lines are the thing itself rather than a picture
   of it. D ("The two builds") shows two wholes side by side, which on
   a rung move means printing forty lines twice to show that three of
   them differ.

   And the second reason is measured. On a Highfield SP560 with eight
   lines moved from Cash to Trade the engine gives three changed and
   five held — TWO cards by verb, FOUR by cause — and the four are the
   dealer's own column names and the two ways a table can fail to
   carry a rung. Grouping by verb throws that away.

   THE TWO FRAMES NO EARLIER BOARD USED: `software/helm-diff.png` — a
   heading that is a SENTENCE naming the object and its fate before
   the object (`postgresql/templates/pvc.yaml has been removed:`) —
   and `software/gdocs-suggestions.png`, where a suggested change is
   crossed out where it dies, previewable with or without, and
   accepted rather than merely announced. Entry's boards leaned on
   Riviera, Zodiac and Lucid; Home's on Rapha, Sotheby's and Hagerty;
   the picker's on Williams and Surtees; the configurator's on
   Porsche's search-open panel and PCPartPicker's list.

   WHAT THIS SCREEN DOES THAT NO OTHER DOES: it prices a decision
   before it is taken. Everything else in this app either reads a
   document or changes one; this is the only screen that shows what a
   change WOULD cost and then lets it be declined.

   ── WHAT IS TRUE HERE AND IS NOT TRUE ON A FRAME ──────────────

   · IT IS A ROUTE AND NOT A MODAL STATE. `/quote/$id/cascade?fix=&
     from=` — the pick that raised it and the chapter it was raised
     in, both in the address, so Back, a refresh and a shared link all
     behave. That is the teardown's finding and it is worth more than
     the layout.
   · EVERY REASON IS THE ENGINE'S. Porsche cannot say why a row went
     because they reconstruct the removal server-side and no longer
     hold the reason. `proposal.ts` reads every `because` off
     `src/domain/quote/cascade.ts` and NOTHING on this screen composes
     one.
   · DECLINING WRITES NOTHING. Not a rollback, not a restore: the
     sheet has not touched the document, so leaving it is leaving it.
     The committed total on the footer is the document's own total
     until the moment it is accepted.
   · THE WAY BACK STANDS ON THIS SCREEN, not in a toast. Accepting
     does not navigate away — it turns the sheet into what happened,
     with the step's own sentence and its way back, and the way on is
     a control rather than a redirect. A way back that vanishes after
     eight seconds is also a way back nobody can reach with a
     keyboard.
   · TWO FILLED BUTTONS SIDE BY SIDE IS THE THING TO AVOID (§5, off
     Porsche's own black Accept beside a grey-filled Cancel, which
     reads as a second primary). One amber act, one veiled way back.
   ============================================================ */

/** Said where a press would have happened, when the route was given
 *  no way to leave. */
export const NO_WAY_BACK =
  'There is nowhere to go back to from here: this screen was opened without the build it belongs to.'

export interface CascadeProps {
  /** which document this decision is about */
  quoteId: string
  /** THE PICK THAT RAISED IT — `level:trade`, `finish:<rowId>`. A
   *  position is a URL search param (CLAUDE.md), and so is a
   *  proposal: this one IS the screen. */
  fix?: string
  /** the chapter it was raised in, so declining lands where it began */
  from?: string
  /** whose file this is, read off the store by the route */
  business?: string | null
  /** back to the build, at the chapter named by `from` */
  goBack?: (chapterId: string) => void
  /** the way to the door, for a desk with no price file in it */
  openTheFile?: () => void
}

/** What happened when the decision was accepted, and the way back
 *  from it.
 *
 *  IT KEEPS THE WHOLE PROPOSAL, and not just the arithmetic. The
 *  reading cannot be taken a second time — accepting is exactly what
 *  makes it stop existing, and asking for it again gets "this quote is
 *  already priced at Trade" — so the cards stay on screen as the
 *  record of the decision that was taken. A sheet that emptied itself
 *  on Accept would leave the reader with a figure and no reasons, and
 *  400px of the dead space §5 counts on both Porsche's sheet and our
 *  own old one. */
interface Applied {
  said: string
  /** the events, oldest first, so the way back runs newest first */
  eventIds: string[]
  proposal: Proposal
  /** this step was itself a way back, so the offer is to put it back */
  wasUndo: boolean
}

export function Cascade({
  quoteId,
  fix = '',
  from = '',
  business = null,
  goBack,
  openTheFile,
}: CascadeProps) {
  const sheet = useCatalogue((s) => s)
  const filed = useQuotes((s) => s.quotes)
  const read = useQuotes((s) => s.loaded)

  const [applied, setApplied] = useState<Applied | null>(null)
  const [refused, setRefused] = useState<string | null>(null)

  const quote = filed.find((q) => q.id === quoteId)
  const open = sheet.status === 'ready' && Object.keys(sheet.tables).length > 0

  /* THE SHEET BECOMES A CONTEXT ONCE, and the map handed over is a
     COPY, so the catalogue store is never quietly mutated — the same
     arrangement the configurator and the picker keep. */
  const ctx = useMemo(
    () => makeCtx({ ...ctxFrom(sheet), views: { ...sheet.views }, orgId: PACK_ORG_ID }),
    [sheet],
  )

  const reading = useMemo(
    () => (quote && open ? readProposal(ctx, quote, fix) : null),
    [ctx, quote, open, fix],
  )

  const leave = useCallback(() => {
    goBack?.(from)
  }, [from, goBack])

  /* EVERY ACT OF THE DECISION GOES THROUGH THE STORE, in order, each
     as its own command with its own inverse and its own typed event.
     A refusal stops the run where it happened and is printed there:
     an issued quote refuses the first one, and a sheet that carried
     on would be writing half a decision. */
  const accept = useCallback(() => {
    if (!reading || isRefused(reading)) return
    const proposal = reading.proposal
    const events: string[] = []
    let said = ''
    for (const act of proposal.acts) {
      const outcome = quotesStore.getState().apply(quoteId, act)
      if ('refused' in outcome) {
        setRefused(outcome.refused === '' ? null : outcome.refused)
        if (events.length === 0) return
        break
      }
      events.push(outcome.event.id)
      said = outcome.said
    }
    if (events.length === 0) return
    setRefused(null)
    setApplied({ said, eventIds: events, proposal, wasUndo: false })
  }, [quoteId, reading])

  /* THE WAY BACK, NEWEST FIRST. `undo` is pinned to the event it was
     offered for and refuses when the document has moved on since —
     which is the whole reason a way back is worth offering at all. */
  const goBackOnIt = useCallback(() => {
    if (!applied) return
    const store = quotesStore.getState()
    if (applied.wasUndo) {
      let said = ''
      const events: string[] = []
      for (let i = 0; i < applied.eventIds.length; i += 1) {
        const outcome = store.redo(quoteId)
        if ('refused' in outcome) {
          setRefused(outcome.refused === '' ? null : outcome.refused)
          break
        }
        events.push(outcome.event.id)
        said = outcome.said
      }
      if (events.length === 0) return
      setRefused(null)
      setApplied({ ...applied, said, eventIds: events, wasUndo: false })
      return
    }
    let said = ''
    const events: string[] = []
    for (const eventId of applied.eventIds.toReversed()) {
      const outcome = store.undo(quoteId, eventId)
      if ('refused' in outcome) {
        setRefused(outcome.refused === '' ? null : outcome.refused)
        break
      }
      events.push(outcome.event.id)
      said = outcome.said
    }
    if (events.length === 0) return
    setRefused(null)
    setApplied({ ...applied, said, eventIds: events.toReversed(), wasUndo: true })
  }, [applied, quoteId])

  if (!quote) {
    return (
      <Blank testid="cascade" say={read ? NO_QUOTE : 'Reading what this browser has kept…'}>
        {read && goBack ? (
          <Button intent="veiled" onClick={leave}>
            Back to the build
          </Button>
        ) : null}
      </Blank>
    )
  }

  const ground = groundFor(quote.subjectImage?.src)
  /* WHAT THE SHEET IS ABOUT. Before the act it is the reading; after
     it, the reading FROZEN AT THE MOMENT THE ACT WAS PRESSED, because
     that is the decision that was taken and the document has since
     moved past it. Either way the cards are on screen, which is what
     keeps the record and the reasons together. */
  const proposal = applied
    ? applied.proposal
    : reading && !isRefused(reading)
      ? reading.proposal
      : null
  const total = quoteTotals(quote).total

  return (
    <main className="csc" data-testid="cascade" data-ground={ground ? '' : undefined}>
      <GroundShot ground={ground} label={quote.subjectLabel} />

      <div className="csc-sheet">
        <header className="csc-head">
          <p className="csc-eyebrow">
            {business ? `${business} · ` : ''}Quote{' '}
            <span className="csc-mono">{quote.reference}</span> · {quote.subjectLabel}
          </p>

          {applied ? (
            <>
              <h1 className="csc-title">{applied.said}.</h1>
              <p className="csc-sub">
                {applied.wasUndo
                  ? 'The document is back where it was, and this is the decision that was taken off it.'
                  : 'This is what went onto the document, and the way back from it is below.'}
              </p>
            </>
          ) : !open ? (
            <>
              <h1 className="csc-title">There is nothing to decide with the file shut.</h1>
              <p className="csc-sub">{NO_FILE}</p>
            </>
          ) : proposal ? (
            <>
              <h1 className="csc-title">{proposal.cascade.title}</h1>
              <p className="csc-sub">{proposal.cascade.subtitle}</p>
            </>
          ) : (
            <>
              <h1 className="csc-title">This quote has moved on.</h1>
              <p className="csc-sub">{reading && isRefused(reading) ? reading.refused : ''}</p>
            </>
          )}
        </header>

        {proposal ? (
          <>
            <section className="csc-asked" aria-label="What you chose">
              <p className="csc-lab">{applied ? 'What was chosen' : 'What you chose'}</p>
              <div className="csc-asked__row">
                <span className="csc-asked__name">{proposal.cascade.asked.label}</span>
                <span className="csc-asked__fig">
                  {proposal.cascade.asked.amount === null ? (
                    <span className="csc-none">—</span>
                  ) : (
                    <PriceFigure amount={proposal.cascade.asked.amount} />
                  )}
                </span>
              </div>
              <p className="csc-asked__say">{proposal.askedSay}</p>
            </section>

            <ol className="csc-causes">
              {proposal.causes.map((cause) => (
                <CauseCard key={cause.id} cause={cause} />
              ))}
            </ol>

            {/* WHAT STAYS, DERIVED FROM THE FROZEN LINES ALREADY ON
                THE DOCUMENT and never from a field the contract lacks
                — `Cascade` has no `stays` list and inventing one
                would be inventing a figure. */}
            <p className="csc-stays">
              {proposal.untouched === 0
                ? 'Every line on this quote is accounted for above.'
                : `${proposal.untouched.toLocaleString('en-AU')} other ${proposal.untouched === 1 ? 'line stays' : 'lines stay'} exactly as ${proposal.untouched === 1 ? 'it is' : 'they are'}.`}
            </p>

            {proposal.alternatives.length > 0 ? (
              <section className="csc-alts" aria-label="What this hull is paired with">
                <p className="csc-lab">What this hull is paired with</p>
                <ul className="csc-alts__list">
                  {proposal.alternatives.map((alt) => (
                    <li className="csc-alt" key={alt.id}>
                      <span className="csc-alt__name">{alt.label}</span>
                      {alt.note === '' ? null : <span className="csc-alt__note">{alt.note}</span>}
                      <span className="csc-alt__fig">
                        {alt.amount === null ? (
                          <span className="csc-none">—</span>
                        ) : (
                          money(alt.amount)
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="csc-alts__say">
                  Nothing here is put on by accepting. They are what the pairings admit for this
                  hull, cheapest first, and they are picked in the trailer chapter like anything
                  else.
                </p>
              </section>
            ) : null}
          </>
        ) : null}

        {refused ? (
          <p className="csc-alarm" role="alert">
            {refused}
          </p>
        ) : null}

        <footer className="csc-decide" data-testid="decision">
          {applied ? (
            <>
              <div className="csc-arith">
                <p className="csc-lab">The total now</p>
                {/* THE DOCUMENT'S OWN TOTAL, asked of the engine after
                    the act rather than remembered from before it. A
                    figure the screen predicted and then kept printing
                    would be a figure nobody had checked. */}
                <p
                  className="csc-arith__fig"
                  data-way={way(applied.wasUndo ? 0 : applied.proposal.cascade.delta)}
                >
                  <PriceFigure amount={total} />
                </p>
                <p className="csc-arith__say">
                  {applied.wasUndo
                    ? 'The document is back where it was, and the decision above is on nothing.'
                    : `Moved by ${signedMoney(applied.proposal.cascade.delta)} by this decision.`}
                </p>
              </div>
              <div className="csc-acts">
                <Button
                  intent="act"
                  onClick={leave}
                  refusedBecause={goBack ? undefined : NO_WAY_BACK}
                >
                  Back to the build
                </Button>
                <Button intent="veiled" onClick={goBackOnIt}>
                  {applied.wasUndo ? 'Put it back' : 'Undo'}
                </Button>
              </div>
            </>
          ) : proposal ? (
            <>
              <div className="csc-arith">
                <p className="csc-lab">Change to the total</p>
                {/* THE LARGEST OBJECT ON THE SHEET IS THE MONEY, not
                    the headline — measured off `porsche-cascade.png`,
                    where the footer's +$26,460.00 out-ranks a ~24px
                    title. It is a plain figure and not `PriceFigure`,
                    because a delta carries its sign and `money` does
                    not print one for a positive. */}
                <p className="csc-arith__fig" data-way={way(proposal.cascade.delta)}>
                  {signedMoney(proposal.cascade.delta)}
                </p>
                <p className="csc-arith__say">
                  {money(proposal.cascade.from)} today · {money(proposal.cascade.to)} if you accept.
                  The committed figure does not move until you do.
                </p>
              </div>
              <div className="csc-acts">
                <Button intent="act" onClick={accept}>
                  {proposal.cascade.accept}
                </Button>
                <Button
                  intent="veiled"
                  onClick={leave}
                  refusedBecause={goBack ? undefined : NO_WAY_BACK}
                >
                  Leave it as it is
                </Button>
              </div>
            </>
          ) : (
            <div className="csc-acts">
              <Button
                intent="act"
                onClick={leave}
                refusedBecause={goBack ? undefined : NO_WAY_BACK}
              >
                Back to the build
              </Button>
              {!open && openTheFile ? (
                <Button intent="veiled" onClick={openTheFile}>
                  Load the Master Price File
                </Button>
              ) : null}
            </div>
          )}
        </footer>

        {ground ? (
          <p className="csc-prov">
            Behind this sheet: the held copy of this boat&rsquo;s own picture,{' '}
            {ground.width.toLocaleString('en-AU')} × {ground.height.toLocaleString('en-AU')}, never
            enlarged ·{' '}
            {ground.verdict === 'scene'
              ? 'a photograph on the water'
              : `a ${ground.verdict} picture`}{' '}
            from {hostOf(ground.address)}, blurred so the build it belongs to is still there and
            frozen rather than replaced.
          </p>
        ) : (
          <p className="csc-prov">
            This boat&rsquo;s row carries no picture this repository holds a copy of, so the sheet
            stands on the room and nothing stands in for it.
          </p>
        )}
      </div>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The ground                                                   */
/* ---------------------------------------------------------- */

/**
 * THE BLUR IS THE ONE THING THE 110 FRAMES LICENSE. It says the build
 * is still there and frozen rather than replaced, and it is also the
 * only honest use of a 1,100px catalogue copy behind a 1440px window:
 * a blurred picture needs a fraction of the resolution a sharp one
 * does. It is `aria-hidden` because it carries no information a
 * reader needs — the provenance line at the foot of the sheet names
 * it in words.
 */
function GroundShot({ ground, label }: { ground: Ground | null; label: string }) {
  if (!ground) return null
  return (
    <div className="csc-ground" aria-hidden="true">
      <img
        className="csc-ground__img"
        src={ground.src}
        alt={label}
        width={ground.width}
        height={ground.height}
        decoding="async"
        fetchPriority="low"
      />
    </div>
  )
}

/* ---------------------------------------------------------- */
/* One cause, and everything it explains                        */
/* ---------------------------------------------------------- */

/** What a fate is called on the head of its card. The word says what
 *  happens; the sentence beside it says why, and the sentence is the
 *  engine's. */
const FATE_SAY: Record<Fate, string> = {
  moves: 'Re-priced',
  holds: 'Held',
  off: 'Comes off',
  on: 'Goes on',
  unchecked: 'Not checked',
}

/**
 * A HEADING THAT IS A SENTENCE ABOUT THE ROWS UNDER IT —
 * `software/helm-diff.png`'s `postgresql/templates/pvc.yaml has been
 * removed:`, and `software2/terraform-plan-output.png`'s `# (because
 * aws_s3_bucket.old_bucket is not in configuration)` on its own line.
 * Grouping by verb is not the only grouping, and on a rung move it is
 * the worse one.
 */
function CauseCard({ cause }: { cause: Cause }) {
  return (
    <li className="csc-cause" data-fate={cause.fate}>
      <h2 className="csc-cause__head">
        <span className="csc-cause__verb">{FATE_SAY[cause.fate]}</span>
        <span className="csc-cause__why">
          {cause.because === '' ? 'the row you asked for' : cause.because}
        </span>
        <span className="csc-cause__chip" data-way={way(cause.moves)}>
          {cause.moves === null ? '—' : cause.moves === 0 ? 'no change' : signedMoney(cause.moves)}
        </span>
      </h2>
      <ul className="csc-rows">
        {cause.rows.map((row) => (
          <li className="csc-row" key={row.id}>
            <RowLine row={row} fate={cause.fate} />
          </li>
        ))}
      </ul>
    </li>
  )
}

/**
 * THREE KINDS OF NOTHING AND THEY ARE THREE DIFFERENT FACTS: a
 * figure, the word `Standard` for a zero that is zero because the
 * thing is standard equipment, and an em dash for "there is no figure
 * here at all". Porsche keeps the first two apart and collapses
 * nothing; `rowFigure` in the engine keeps all three, and so does
 * this.
 *
 * AND THE COLUMN IS PRINTED UNDER EACH FIGURE, because on a rung move
 * the column IS the story: `Cash` becoming `Trade` on a hull and
 * `Sell Price` becoming `Trade Price` on a motor are two different
 * causes, and a sheet that showed only the money would show one.
 */
function RowLine({ row, fate }: { row: CauseRow; fate: Fate }) {
  const gone = fate === 'off'
  /* WHAT STAYS IS SHOWN BY NOT MOVING — `software2/wikipedia-diff-
     real.png`, where the unchanged lines print on both sides and only
     the changed words are pilled. A held row printing $10,713 → $10,713
     with an arrow between them is a change drawn where there is none,
     and the card it sits under already says in words why it does not
     move. So one figure, at the column it stays on. */
  const moved = gone || row.from !== row.to || row.fromColumn !== row.toColumn
  return (
    <>
      <span className="csc-row__main">
        <span className="csc-row__name" data-gone={gone ? '' : undefined}>
          {row.label}
        </span>
        {row.code === '' ? null : <span className="csc-row__code">{row.code}</span>}
      </span>
      <span className="csc-row__money" data-moved={moved ? '' : undefined}>
        {moved ? (
          <>
            <span className="csc-row__side" data-side="from">
              <Figure amount={row.from} standard={false} />
              {row.fromColumn === '' ? null : <small className="csc-col">{row.fromColumn}</small>}
            </span>
            {/* THE ARROW IS DECORATION AND THE WORD IS THE FACT. A
                reader hearing this line gets "$41,340 Cash to $39,273
                Trade", which is what a person sees. */}
            <span className="csc-row__arrow" aria-hidden="true">
              →
            </span>
            <span className="csc-said">to</span>
          </>
        ) : null}
        <span className="csc-row__side" data-side="to">
          {gone ? (
            <span className="csc-none">off the quote</span>
          ) : (
            <>
              <Figure amount={row.to} standard={row.standard} />
              {row.toColumn === '' ? null : <small className="csc-col">{row.toColumn}</small>}
            </>
          )}
        </span>
        <span className="csc-row__delta" data-way={way(row.delta)}>
          {row.delta === null ? '—' : row.delta === 0 ? 'no change' : signedMoney(row.delta)}
        </span>
      </span>
    </>
  )
}

function Figure({ amount, standard }: { amount: number | null; standard: boolean }) {
  if (standard) return <span className="csc-word">Standard</span>
  if (amount === null) return <span className="csc-none">—</span>
  return <PriceFigure amount={amount} />
}

/* ---------------------------------------------------------- */
/* Nothing at this address                                      */
/* ---------------------------------------------------------- */

function Blank({ testid, say, children }: { testid: string; say: string; children?: ReactNode }) {
  return (
    <main className="csc csc--blank" data-testid={testid}>
      <section className="csc-blank" aria-label="No decision here">
        <p className="csc-blank__say">{say}</p>
        {children}
      </section>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* Small pieces                                                 */
/* ---------------------------------------------------------- */

/** Which way a figure moves the total, for the stylesheet. A null is
 *  a third answer and never a zero. */
const way = (delta: number | null): string =>
  delta === null ? 'none' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
