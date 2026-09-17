import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, PriceFigure, Tile } from '@/ui'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { makeCtx, type CatalogueCtx, type QuoteDef } from '@/domain/model'
import { money } from '@/domain/money'
import {
  ISSUED_REFUSAL,
  addLine,
  issue,
  newVersionOf,
  referenceForNow,
  refinish,
  removeLine,
  savedNote,
  setCustomer,
  signedMoney,
} from '@/domain/quote'
import type { ShownFact } from '@/domain/quote/distinguish'
import {
  OFFER_CAP,
  matchesFinish,
  readRail,
  type Act,
  type Chapter,
  type ChapterTable,
  type OptionRow,
  type Rail,
} from './chapters'
import type { Finish, Finishes } from './finishes'
import { hostOf, stageArt, type StageArt } from './stage'
import './configurator.css'

/* ============================================================
   THE CONFIGURATOR — "Stage and rail", direction B of
   docs/research/refs/configurator/notes.md §5.

   THE OWNER HANDED THE PICKS OVER, so the direction is chosen here
   and the screen is marked PROVISIONAL in docs/SCREENS.md until he
   has looked at it.

   WHY B AND NOT THE OTHER THREE. The only instruction the owner has
   ever given about this screen is "More like Porsche the right side,
   not less. STUDY IT.", and B is the only direction that IS the
   Porsche right side: one rail whose FIRST element is a search over
   every pairing on the quote, then a card per chapter, four row
   shapes for four kinds of content, the delta in the head. A is a
   flat register with no stage — the shape the owner has already
   called a database twice. C is strictly sequential, which is a
   brochure's flow and not a dealer's: a salesperson with a customer
   at the desk jumps to the chapter being argued about. D makes the
   document the configurator, which is the best idea in the sweep and
   belongs to the DOCUMENT screen, where the same table is the thing
   itself rather than a picture of it.

   And the second reason is measured. This chapter has to reach 588
   hull rows and a 2,937-row parts table; B is the one direction that
   reaches either without a second screen.

   THE TWO FRAMES NO EARLIER BOARD USED: `deep/porsche-search-open.png`
   — a field above the chapters turning the whole panel into grouped,
   priced, tickable rows with no mode change — and `premium/
   pcpartpicker-list.png`, a build as a priced table with a warning
   banner that names the problem in words and DISABLES NOT ONE ROW.
   Entry's boards leaned on Riviera, Zodiac and Lucid; Home's on
   Rapha, Sotheby's and Hagerty; the picker's on Williams and Surtees.

   WHAT THIS SCREEN DOES THAT NO OTHER DOES: it is the only one where
   a press changes a document. Everything else in this app reads.

   ── WHAT IS TRUE HERE AND IS NOT TRUE ON A FRAME ──────────────

   · THE CHAPTERS ARE NOT RADIO GROUPS. Whaler's engine chapter
     prices the 25hp at −$853 against the fitted 40hp because it is
     a radio group. Our sections hold as many lines as a dealer puts
     on them — `Highfield ADV7` slots 4–9 are six pairings of the
     same motor told apart by six rigging kits — so the delta on
     every row is what the PRESS does: plus to put it on, minus to
     take it off. `chapters.ts` argues it in full.
   · THE STAGE DOES NOT ANSWER THE RAIL. The pack holds one picture
     per model, so the stage shows the hull and moves only when the
     hull does. Promising otherwise would be promising a render
     pipeline that does not exist (the sweep's §6).
   · THE RUNG IS A FACT, NOT A SWITCH. Moving a whole quote between
     Cash and Trade re-prices every line, and what that costs line by
     line is the CASCADE SHEET — screen 5 of this milestone, with its
     own sweep and its own directions. `levelConflict` in the engine
     is ready for it. So this screen prints which rung the document
     is on and says where the switch will live.
   · THE UNDO IS ON THE SCREEN AND NOT IN A TOAST. `src/ui/Toaster`
     exists and nothing in this app mounts it; a way back that
     vanishes after eight seconds is also a way back a person cannot
     reach with a keyboard while reading a list. The last step and
     its way back stand in the rail's head, where every press on this
     screen can see them.
   ============================================================ */

/** Said where the press would have happened. */
export const NO_DOCUMENT =
  'The document is the next screen of this milestone and it is not built yet, so nothing was opened. The quote is written and kept in this browser either way.'

export const NO_CASCADE =
  'Moving the whole quote to another rung re-prices every line, and the sheet that shows what that costs line by line is not built yet.'

export interface ConfiguratorProps {
  /** which document this is */
  quoteId: string
  /** WHICH CHAPTER IS OPEN, which is a position and therefore a URL
   *  search param (CLAUDE.md). Back, a refresh and a shared link all
   *  land on the same chapter — and the sweep's own warning is that
   *  a chapter address that dies is one of the failures it counted
   *  (`deep/porsche-911-packages.png`). '' opens the first chapter
   *  with something still to decide. */
  at?: string
  /** where a press writes the new position. A test hands in a spy,
   *  which is why this screen never reaches for the router. */
  goTo?: (chapterId: string) => void
  /** whose file this is, read off the store by the route */
  business?: string | null
  /** the way back to the door, for a desk with no price file in it */
  openTheFile?: () => void
  /** where a new version of an issued quote opens */
  openQuote?: (quoteId: string) => void
  /** the clock, injected so a test can say which instant it means */
  now?: () => Date
}

/** The last thing that happened, and the way back from it. */
interface Step {
  said: string
  eventId: string
  /** this step was itself a way back, so the offer is to put it back */
  wasUndo: boolean
}

export function Configurator({
  quoteId,
  at = '',
  goTo,
  business = null,
  openTheFile,
  openQuote,
  now,
}: ConfiguratorProps) {
  const sheet = useCatalogue((s) => s)
  const filed = useQuotes((s) => s.quotes)
  const read = useQuotes((s) => s.loaded)
  const kept = useQuotes((s) => s.problem)
  const who = useSession((s) => s.name)

  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState<ReadonlySet<string>>(() => new Set())
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const field = useRef<HTMLElement>(null)

  const quote = filed.find((q) => q.id === quoteId)
  const open = sheet.status === 'ready' && Object.keys(sheet.tables).length > 0

  /* THE SHEET BECOMES A CONTEXT ONCE, AND NOT ONCE PER KEYSTROKE.
     `viewForQuote` rebuilds the page a quote was raised from when
     the stored view has not survived a reload, and files it into
     `ctx.views` — so the map handed over is a COPY and the catalogue
     store is never quietly mutated (the picker's `mint.ts` says the
     same). The quotes are deliberately NOT a dependency: a keystroke
     in the customer's name writes a document, and rebuilding the
     whole context for it would re-derive a view page per letter. */
  const ctx = useMemo(
    () => makeCtx({ ...ctxFrom(sheet), views: { ...sheet.views }, orgId: PACK_ORG_ID }),
    [sheet],
  )

  /* EVERY PICK ON THIS SCREEN COMES THROUGH HERE, so there is one
     place a refusal is caught and one place the way back is pinned.
     The store returns the engine's own sentence and the event the
     command minted; nothing is phrased here. */
  const press = useCallback(
    (act: Act) => {
      const command =
        act.do === 'add'
          ? addLine(act.blockId, act.line)
          : act.do === 'remove'
            ? removeLine(act.lineId)
            : refinish(ctx, act.rowId)
      const outcome = quotesStore.getState().apply(quoteId, command)
      if ('refused' in outcome) {
        setRefused(outcome.refused === '' ? null : outcome.refused)
        return
      }
      setRefused(null)
      setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
    },
    [ctx, quoteId],
  )

  const goBack = useCallback(() => {
    if (!step) return
    const outcome = step.wasUndo
      ? quotesStore.getState().redo(quoteId)
      : quotesStore.getState().undo(quoteId, step.eventId)
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: !step.wasUndo })
  }, [quoteId, step])

  /* CTRL K PUTS THE CURSOR IN THE FIELD. The field IS the navigation
     on this screen, which is the sweep's first pattern, so the
     shortcut goes to the one control that reaches every chapter. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      field.current?.focus()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [])

  const rail: Rail | null = useMemo(
    () => (quote && open ? readRail(ctx, quote, { query, showAll }) : null),
    [ctx, quote, open, query, showAll],
  )

  if (!quote) {
    return (
      <Missing
        read={read}
        status={sheet.status}
        problem={sheet.problem}
        openTheFile={openTheFile}
      />
    )
  }

  const issued = quote.state !== 'draft'
  const refusal = issued ? ISSUED_REFUSAL : undefined
  /* THE CHAPTER THE READER IS ON, and a chapter id that no longer
     matches anything simply opens the first one with a decision left
     in it, rather than a screen with every card shut. */
  const chapters = rail?.chapters ?? []
  const here =
    chapters.find((c) => c.id === at)?.id ??
    chapters.find((c) => c.kind === 'band' && c.lines === 0 && c.offered > 0)?.id ??
    chapters[0]?.id ??
    ''

  return (
    <main className="cfg" data-testid="configurator">
      <Mast
        quote={quote}
        business={business}
        total={rail?.total ?? null}
        unpriced={rail?.unpriced ?? 0}
        open={open}
      />

      <div className="cfg-floor">
        <Stage quote={quote} ctx={ctx} open={open} kept={kept} who={who} rail={rail} />

        <section className="cfg-rail" aria-label="The chapters of this quote">
          <div className="cfg-find">
            <label className="cfg-find__label" htmlFor="cfg-find">
              Search every option on this quote
            </label>
            <Input
              id="cfg-find"
              ref={field}
              type="search"
              value={query}
              onValueChange={setQuery}
              aria-describedby="cfg-find-said"
              placeholder={open ? 'Ctrl K — a name, a code, a rigging kit' : 'Nothing to search'}
            />
            <p className="cfg-find__said" id="cfg-find-said">
              {!open
                ? 'There is nothing to search until a price file is read into this browser.'
                : rail === null
                  ? ''
                  : rail.searching
                    ? rail.hits === 0
                      ? 'Nothing on this quote is called that, in any chapter.'
                      : `${rail.hits.toLocaleString('en-AU')} ${rail.hits === 1 ? 'row carries' : 'rows carry'} those words, grouped under the chapter each belongs to${rail.beyond > 0 ? ` — ${rail.beyond.toLocaleString('en-AU')} of them the shortlist was standing in front of` : ''}.`
                    : 'Typing narrows every chapter at once and reaches past each one’s shortlist. Nothing changes mode.'}
            </p>

            {step ? (
              <output className="cfg-step" data-testid="last-step">
                <span className="cfg-step__said">{step.said}</span>
                <Button intent="veiled" size="sm" onClick={goBack}>
                  {step.wasUndo ? 'Put it back' : 'Undo'}
                </Button>
              </output>
            ) : null}

            {refused ? (
              <p className="cfg-alarm" role="alert">
                {refused}
              </p>
            ) : null}
          </div>

          <div className="cfg-chapters">
            {chapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                quote={quote}
                rail={rail!}
                open={chapter.id === here}
                searching={rail?.searching === true}
                query={query}
                onOpen={() => goTo?.(chapter.id)}
                onPress={press}
                onShowAll={(id) =>
                  setShowAll((was) => {
                    const next = new Set(was)
                    if (next.has(id)) next.delete(id)
                    else next.add(id)
                    return next
                  })
                }
                refusal={refusal}
                quoteId={quoteId}
                openQuote={openQuote}
                now={now}
                setStep={setStep}
                setRefused={setRefused}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* No document at this address                                 */
/* ---------------------------------------------------------- */

/**
 * THREE DIFFERENT ABSENCES AND ONLY ONE OF THEM IS AN ERROR. A
 * browser still reading its own database has not yet failed to find
 * anything; a browser that read it and found nothing has; and a
 * database that would not open is a third thing with its own
 * sentence. The picker's blank state records measuring exactly this
 * and saying the opposite of what it was about to say.
 */
function Missing({
  read,
  status,
  problem,
  openTheFile,
}: {
  read: boolean
  status: string
  problem: string | null
  openTheFile?: () => void
}) {
  return (
    <main className="cfg cfg--blank" data-testid="configurator">
      <section className="cfg-blank" aria-label="No quote here">
        {problem !== null ? (
          <p className="cfg-blank__say" role="alert">
            The quotes in this browser could not be read. {problem}
          </p>
        ) : !read ? (
          <p className="cfg-blank__say">Reading what this browser has kept…</p>
        ) : (
          <p className="cfg-blank__say">
            <b>No quote is filed at this address.</b> A quote lives in the browser it was written
            in, so a link to one does not travel between computers yet — that arrives with the
            backend at Milestone 6.
          </p>
        )}
        {read && status !== 'ready' && openTheFile ? (
          <Button intent="veiled" onClick={openTheFile}>
            Load the Master Price File
          </Button>
        ) : null}
      </section>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The masthead: what it is, and what it comes to               */
/* ---------------------------------------------------------- */

/**
 * THE RUNNING PRICE IS ALWAYS VISIBLE AND IT NEVER COUNTS UP.
 *
 * It is here and in no second place, which is a decision rather than
 * an omission. Four surfaces within a screen's width each owe ONE
 * fact (`bands.ts` counts the same defect and removes it): the
 * masthead owes the total, a chapter head owes its own subtotal, a
 * row owes what the press would move the total BY, and the finale
 * owes the arithmetic. Printing the total twice would make two of
 * those the same sentence.
 *
 * It is `PriceFigure` and never `Figure`: NumberFlow moves a figure
 * digit by digit when it changes, and a price that animates reads as
 * a price still being decided, with a customer watching.
 *
 * AND IT IS AT THE TOP RATHER THAN THE FOOT. Axopar puts its
 * configuration price in a pill beside the pager at the foot of the
 * window; the owner has called a floating bottom bar disgusting, and
 * he is right that a bar hanging over the work is not where a person
 * looks. A masthead that stays put is the same promise with none of
 * that: it is the head of the document, and the document is what the
 * figure belongs to.
 */
function Mast({
  quote,
  business,
  total,
  unpriced,
  open,
}: {
  quote: QuoteDef
  business: string | null
  total: number | null
  unpriced: number
  open: boolean
}) {
  return (
    <header className="cfg-mast">
      <div className="cfg-mast__who">
        <p className="cfg-eyebrow">
          {business ? `${business} · ` : ''}Quote{' '}
          <span className="cfg-mono">{quote.reference}</span>
          {quote.state === 'draft' ? ' · draft' : ' · given to the customer'}
        </p>
        <h1 className="cfg-mast__name">{quote.subjectLabel}</h1>
      </div>

      <div className="cfg-money" data-testid="running-total">
        <p className="cfg-money__lab">Total</p>
        {total === null || !open ? (
          <p className="cfg-money__none">—</p>
        ) : (
          <p className="cfg-money__fig">
            <PriceFigure amount={total} />
          </p>
        )}
        <p className="cfg-money__sub">
          {quote.lines.length.toLocaleString('en-AU')} {quote.lines.length === 1 ? 'line' : 'lines'}
          , every figure frozen when it was picked
          {unpriced > 0
            ? ` · ${unpriced.toLocaleString('en-AU')} of them carry no price at all`
            : ''}
        </p>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------- */
/* The stage: the hull, and only the hull                       */
/* ---------------------------------------------------------- */

function Stage({
  quote,
  ctx,
  open,
  kept,
  who,
  rail,
}: {
  quote: QuoteDef
  ctx: CatalogueCtx
  open: boolean
  kept: string | null
  who: string | null
  rail: Rail | null
}) {
  const register = ctx.entities[quote.rootTableId]?.name ?? ''
  const art: StageArt = stageArt(quote.subjectImage?.src, register)
  const [drawn, setDrawn] = useState<{ w: number; h: number } | null>(null)
  const photo = useRef<HTMLImageElement>(null)
  const held = art.kind === 'photograph' ? art.held : null

  /* THE PAINTED SIZE, NOT THE BOX — the same arithmetic entry and
     home run on theirs. `object-fit: cover` scales the whole picture
     until it covers the box and the box crops the rest, so the scale
     is the larger of the two ratios and the size reported is the
     whole picture at that scale. Printing it is how "never enlarged"
     stays checkable at every width instead of being a promise. */
  useEffect(() => {
    const img = photo.current
    if (!held || !img || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const box = img.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) return
      const scale = Math.max(box.width / held.width, box.height / held.height)
      setDrawn({ w: Math.round(held.width * scale), h: Math.round(held.height * scale) })
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(img)
    return () => {
      watch.disconnect()
    }
  }, [held])

  return (
    <section className="cfg-stage" aria-label="The boat this quote is about">
      <figure className="cfg-shot" data-art={art.kind}>
        {art.kind === 'photograph' ? (
          <img
            className="cfg-shot__img"
            ref={photo}
            src={art.held.src}
            alt={quote.subjectLabel}
            width={art.held.width}
            height={art.held.height}
            decoding="async"
            fetchPriority="high"
          />
        ) : art.kind === 'mark' ? (
          <img
            className="cfg-shot__mark"
            src={art.mark.src}
            alt={art.mark.brand}
            width={art.mark.width}
            height={art.mark.height}
          />
        ) : (
          <span className="cfg-shot__word">{register}</span>
        )}
      </figure>

      <p className="cfg-stage__over">{register}</p>
      <h2 className="cfg-stage__name">{quote.subjectLabel}</h2>

      {quote.subjectSpecs.length > 0 ? (
        <dl className="cfg-specs">
          {quote.subjectSpecs.map((spec) => (
            <div className="cfg-spec" key={spec.label}>
              <dt className="cfg-spec__lab">{spec.label}</dt>
              <dd className="cfg-spec__val">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="cfg-note">This register carries no specification columns for this boat.</p>
      )}

      <p className="cfg-prov">
        {art.kind === 'photograph'
          ? `Held copy ${art.held.width.toLocaleString('en-AU')} × ${art.held.height.toLocaleString('en-AU')}${drawn ? `, drawn here at ${drawn.w.toLocaleString('en-AU')} × ${drawn.h.toLocaleString('en-AU')}` : ''}, never enlarged · ${art.held.verdict === 'scene' ? 'a photograph on the water' : `a ${art.held.verdict} picture`} from ${hostOf(art.held.address)}`
          : art.because}
      </p>

      <div className="cfg-hair" />

      <p className="cfg-note">
        {open
          ? `Priced at the ${rungSay(rail)} rung. ${NO_CASCADE}`
          : 'No price file is open in this browser, so nothing below can be offered. Every figure already on this quote was frozen when it was picked and is unchanged.'}
      </p>
      <p className="cfg-note">
        {who ? `Prepared by ${quote.preparedBy ?? who}. ` : ''}
        {savedNote(kept)}
      </p>
    </section>
  )
}

/** Which rung this document is on, in the business's own word for
 *  it. The key is ours; the label is the dealer's column. */
function rungSay(rail: Rail | null): string {
  const found = rail?.rungs.find((r) => r.carriedBy > 0)
  return found ? found.label : 'first declared'
}

/* ---------------------------------------------------------- */
/* One chapter                                                  */
/* ---------------------------------------------------------- */

function ChapterCard({
  chapter,
  quote,
  rail,
  open,
  searching,
  query,
  onOpen,
  onPress,
  onShowAll,
  refusal,
  quoteId,
  openQuote,
  now,
  setStep,
  setRefused,
}: {
  chapter: Chapter
  quote: QuoteDef
  rail: Rail
  open: boolean
  searching: boolean
  query: string
  onOpen: () => void
  onPress: (act: Act) => void
  onShowAll: (id: string) => void
  refusal: string | undefined
  quoteId: string
  openQuote?: (id: string) => void
  now?: () => Date
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  /* A SEARCH OPENS EVERY CHAPTER THAT HAS AN ANSWER, which is the
     whole of "no mode change": the rail is the same rail, narrowed
     in place, and a chapter with nothing matching stays shut and
     says so rather than disappearing. */
  const hits = chapter.tables.reduce((n, t) => n + t.rows.length, 0)
  const finishHits = searching
    ? (chapter.finishes?.rows.filter((f) => matchesFinish(f.label, query)).length ?? 0)
    : (chapter.finishes?.rows.length ?? 0)
  const showing = searching ? hits + finishHits > 0 : open

  return (
    <section
      className="cfg-chapter"
      data-open={showing ? '' : undefined}
      data-kind={chapter.kind}
      aria-label={`${chapter.num ? `${chapter.num} ` : ''}${chapter.name}`}
    >
      {/* THE BAND STATES ITS OWN ANSWER — number, name, where the
          decision stands and its subtotal — so the whole build reads
          without opening anything (the sweep's §2, off
          `premium/hermanmiller-aeron-config.png`). The clause is the
          engine's own `stateSay`; no wording is invented here. */}
      <h2 className="cfg-head">
        <button type="button" className="cfg-head__press" aria-expanded={showing} onClick={onOpen}>
          <span className="cfg-head__num">{chapter.num === '' ? '·' : chapter.num}</span>
          <span className="cfg-head__body">
            <span className="cfg-head__name">{chapter.name}</span>
            <span className="cfg-head__fact">
              {chapter.fact}
              {chapter.kind === 'band' && !searching && chapter.offered > 0
                ? ` · ${chapter.offered.toLocaleString('en-AU')} on the shelf`
                : ''}
              {searching && hits + finishHits > 0
                ? ` · ${(hits + finishHits).toLocaleString('en-AU')} match`
                : ''}
            </span>
          </span>
          <span className="cfg-head__sum">
            {chapter.amount === null ? (
              <span className="cfg-head__nosum">not priced</span>
            ) : (
              <PriceFigure amount={chapter.amount} />
            )}
          </span>
          <span className="cfg-head__chev" aria-hidden="true">
            {showing ? '–' : '+'}
          </span>
        </button>
      </h2>

      {showing ? (
        <div className="cfg-body">
          {chapter.finishes ? (
            <FinishBlock
              finishes={chapter.finishes}
              query={searching ? query : ''}
              onPress={onPress}
              refusal={refusal}
            />
          ) : null}

          {chapter.tables.map((table) => (
            <TableBlock
              key={table.id}
              table={table}
              named={chapter.tables.length > 1}
              query={searching ? query : ''}
              onPress={onPress}
              onShowAll={onShowAll}
              refusal={refusal}
            />
          ))}

          {chapter.kind === 'handover' ? (
            <Handover
              quote={quote}
              quoteId={quoteId}
              refusal={refusal}
              setStep={setStep}
              setRefused={setRefused}
            />
          ) : null}

          {chapter.kind === 'finale' ? (
            <Finale
              quote={quote}
              quoteId={quoteId}
              rail={rail}
              openQuote={openQuote}
              now={now}
              setStep={setStep}
              setRefused={setRefused}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The hull in another finish                                   */
/* ---------------------------------------------------------- */

function FinishBlock({
  finishes,
  query,
  onPress,
  refusal,
}: {
  finishes: Finishes
  query: string
  onPress: (act: Act) => void
  refusal: string | undefined
}) {
  const rows =
    query === '' ? finishes.rows : finishes.rows.filter((f) => matchesFinish(f.label, query))

  if (finishes.rows.length === 0) {
    return <p className="cfg-why">{finishes.why}</p>
  }
  if (rows.length === 0) {
    return <p className="cfg-why">No finish of this hull is called that.</p>
  }

  return (
    <div className="cfg-table">
      <div className="cfg-table__head">
        <h3 className="cfg-table__name">
          {finishes.model} — {finishes.rows.length.toLocaleString('en-AU')} finishes
        </h3>
        <p className="cfg-table__why">
          A quote is written against ONE row of {finishes.register}, and this model is{' '}
          {finishes.rows.length.toLocaleString('en-AU')} of them. Choosing another re-roots the
          document on that row and leaves every other line exactly where it is.
        </p>
      </div>
      <ul className="cfg-rows">
        {rows.map((finish) => (
          <li key={finish.rowId}>
            <FinishCard finish={finish} onPress={onPress} refusal={refusal} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function FinishCard({
  finish,
  onPress,
  refusal,
}: {
  finish: Finish
  onPress: (act: Act) => void
  refusal: string | undefined
}) {
  return (
    <Tile
      tone="room"
      shape="row"
      selected={finish.current}
      onSelect={() => onPress({ do: 'refinish', rowId: finish.rowId, label: finish.label })}
      refusedBecause={refusal}
      label={`${finish.material} ${finish.colour.say}, ${finish.delta === 0 ? 'no change to the total' : signedMoney(finish.delta)}`}
    >
      <span className="cfg-row">
        <span className="cfg-row__main">
          <span className="cfg-row__name">
            {/* THE CODE IS THE CONTENT AND NO SWATCH IS DRAWN. Four
                tokens in this file have no decode at all, and a
                colour nobody can name is a colour nobody may paint —
                the picker settled that and the same rule holds here. */}
            <span className="cfg-mono">{finish.colour.code === '' ? '—' : finish.colour.code}</span>
            {finish.material === '' ? '' : ` · ${finish.material}`}
          </span>
          <span className="cfg-row__facts">
            {finish.colour.read ? finish.colour.say : 'this file carries no decode for that code'}
            {finish.code === '' ? '' : ` · ${finish.code}`}
          </span>
        </span>
        <span className="cfg-row__money">
          <span className="cfg-row__delta" data-way={way(finish.delta)}>
            {finish.current
              ? 'fitted'
              : finish.delta === 0
                ? 'no change'
                : signedMoney(finish.delta)}
          </span>
          {finish.amount === null ? null : (
            <span className="cfg-row__at">{money(finish.amount)} for the hull</span>
          )}
        </span>
      </span>
    </Tile>
  )
}

/* ---------------------------------------------------------- */
/* One table inside a chapter                                   */
/* ---------------------------------------------------------- */

function TableBlock({
  table,
  named,
  query,
  onPress,
  onShowAll,
  refusal,
}: {
  table: ChapterTable
  /** the chapter holds more than one table, so each needs its name */
  named: boolean
  query: string
  onPress: (act: Act) => void
  onShowAll: (id: string) => void
  refusal: string | undefined
}) {
  const counts = table.counts
  const offered = Math.max(0, counts.admitted - counts.heldCount)

  return (
    <div className="cfg-table">
      <div className="cfg-table__head">
        {named ? <h3 className="cfg-table__name">{table.title}</h3> : null}
        {/* THE COUNTED RAIL, and every figure in it comes back from
            the engine so the screen never works out its own
            denominator (`freeze.ts` Offer, at length). */}
        <p className="cfg-table__counts">
          <b>{offered.toLocaleString('en-AU')}</b> of {counts.pool.toLocaleString('en-AU')} offered
          {counts.heldCount > 0
            ? ` · ${counts.heldCount.toLocaleString('en-AU')} no longer sold`
            : ''}
          {query !== '' && counts.matched > 0
            ? ` · ${counts.matched.toLocaleString('en-AU')} match`
            : ''}
          {counts.capped ? ` · the first ${OFFER_CAP} are drawn` : ''}
        </p>
        {table.reason ? (
          <p className="cfg-table__why">
            {sentenceOf(table.reason.what)}
            {table.reason.measured
              ? ` It ${table.reason.measured.clause} — ${table.reason.measured.holds} ${table.reason.measured.of}.`
              : ''}
          </p>
        ) : null}
      </div>

      {table.rows.length === 0 ? (
        <p className="cfg-why">
          {query !== ''
            ? `Nothing in ${table.title} is called that.`
            : table.why !== ''
              ? table.why
              : 'This chapter has nothing left on its shelf.'}
        </p>
      ) : (
        <ul className="cfg-rows">
          {table.rows.map((row) => (
            <li key={row.key}>
              <OptionCard row={row} query={query} onPress={onPress} refusal={refusal} />
            </li>
          ))}
        </ul>
      )}

      {table.also.length > 0 ? (
        <div className="cfg-also">
          <p className="cfg-also__lab">
            Also on this quote from {table.title}, and not in the list above
          </p>
          <ul className="cfg-rows">
            {table.also.map((row) => (
              <li key={row.key}>
                <OptionCard row={row} query="" onPress={onPress} refusal={refusal} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* THE WAY PAST THE NARROWING, and it is a control rather than a
          promise. Production's trailer step has no catalogue browse at
          all, so a salesperson who can SEE a trailer on the yard is
          told by their own system that it does not exist. */}
      {counts.catalogue > counts.narrowed ? (
        <div className="cfg-all">
          <Button intent="veiled" size="sm" onClick={() => onShowAll(table.id)}>
            {table.showingAll
              ? `Back to the ${offered.toLocaleString('en-AU')} paired with this hull`
              : `Show all ${counts.catalogue.toLocaleString('en-AU')} in ${table.title}`}
          </Button>
          <p className="cfg-all__say">
            {table.showingAll
              ? 'Everything the whole live table holds is listed, and each row the pairings left out says why.'
              : 'Everything here can be reached, whether or not the price file paired it with this hull. What it may not do is look paired when it is not.'}
          </p>
        </div>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* One option                                                   */
/* ---------------------------------------------------------- */

/**
 * A ROW THE NARROWING LEFT OUT IS AN ORDINARY ROW WITH A SENTENCE.
 * `premium/pcpartpicker-list.png` is the frame: a full-width banner
 * names the severity in words, and NOT ONE CONTROL IS DISABLED — the
 * clashing board and CPU sit as ordinary rows, every Buy live, the
 * total still summed. Ours is the same and one better: the sentence
 * is on the row it is about, and it is the engine's own `outsideWhy`
 * — every clause re-run through the rule that rejected it, with the
 * figures on both sides.
 */
function OptionCard({
  row,
  query,
  onPress,
  refusal,
}: {
  row: OptionRow
  query: string
  onPress: (act: Act) => void
  refusal: string | undefined
}) {
  return (
    <div className="cfg-opt" data-outside={row.outside ? '' : undefined}>
      <Tile
        tone="room"
        shape="row"
        selected={row.fitted}
        onSelect={() => onPress(row.act)}
        refusedBecause={refusal}
        label={`${row.tail}${row.starred ? ', recommended by the price file' : ''}, ${row.fitted ? 'on the quote' : 'not on the quote'}`}
      >
        <span className="cfg-row">
          <span className="cfg-row__main">
            <span className="cfg-row__name">
              {row.starred ? (
                <span className="cfg-star" aria-hidden="true">
                  ★
                </span>
              ) : null}
              {row.stem === '' ? null : <span className="cfg-row__stem">{row.stem} </span>}
              <Marked text={row.tail} query={query} />
              {row.code === '' ? null : <span className="cfg-row__code">{row.code}</span>}
            </span>
            {row.facts.length > 0 ? <Facts facts={row.facts} /> : null}
            {row.contains === '' ? null : <span className="cfg-row__contains">{row.contains}</span>}
          </span>
          <span className="cfg-row__money">
            {/* PRICE THE DELTA. The figure is what this press moves
                the running total by — plus to put it on, minus to
                take it off — and it is `weighPick`'s, which is the
                one summation run over the document this press would
                produce. */}
            <span className="cfg-row__delta" data-way={way(row.delta)}>
              {row.delta === null ? 'no price' : signedMoney(row.delta)}
            </span>
            {row.amount === null ? (
              /* STANDARD IS A WORD AND NOT $0.00. This file's version
                 of the distinction is a table with no price column at
                 all, and the column name is the honest thing to print
                 where the figure would be. */
              <span className="cfg-row__at">
                {row.column === null ? 'no price column on this table' : row.column}
              </span>
            ) : (
              <span className="cfg-row__at">
                {money(row.amount)}
                {row.column === null ? '' : ` at ${row.column}`}
              </span>
            )}
          </span>
        </span>
      </Tile>
      {row.why === '' ? null : <p className="cfg-opt__why">{row.why}</p>}
    </div>
  )
}

/** The pairing's own columns, reduced to what tells this shelf
 *  apart. `full` rides in `title`, so nothing is hidden. */
function Facts({ facts }: { facts: ShownFact[] }) {
  return (
    <span className="cfg-row__facts">
      {facts.map((fact, i) => (
        <span className="cfg-fact" key={fact.label} title={fact.full}>
          {i > 0 ? ' · ' : ''}
          <span className="cfg-fact__lab">{fact.label}</span> {fact.value}
        </span>
      ))}
    </span>
  )
}

/** THE MATCH IS BOLDED, which is the half of Porsche's search that
 *  makes a long name readable at a glance. Whole words only, the
 *  same needles the engine matched on, and the text is never
 *  truncated — nothing is hidden to make room for a mark. */
function Marked({ text, query }: { text: string; query: string }) {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  if (words.length === 0) return <>{text}</>

  const lower = text.toLowerCase()
  const hits: Array<[number, number]> = []
  for (const word of words) {
    let from = 0
    for (;;) {
      const at = lower.indexOf(word, from)
      if (at < 0) break
      hits.push([at, at + word.length])
      from = at + word.length
    }
  }
  if (hits.length === 0) return <>{text}</>
  hits.sort((a, b) => a[0] - b[0])

  /* EACH PIECE KEEPS WHERE IN THE NAME IT STARTS, which is what keys
     it: a position in this string is a fact about the content, and an
     array index is a fact about the loop. */
  const out: Array<{ said: string; hit: boolean; from: number }> = []
  let at = 0
  for (const [from, to] of hits) {
    if (to <= at) continue
    const start = Math.max(from, at)
    if (start > at) out.push({ said: text.slice(at, start), hit: false, from: at })
    out.push({ said: text.slice(start, to), hit: true, from: start })
    at = to
  }
  if (at < text.length) out.push({ said: text.slice(at), hit: false, from: at })

  return (
    <>
      {out.map((piece) =>
        piece.hit ? (
          <b className="cfg-hit" key={piece.from}>
            {piece.said}
          </b>
        ) : (
          <span key={piece.from}>{piece.said}</span>
        ),
      )}
    </>
  )
}

/* ---------------------------------------------------------- */
/* Who it is for                                                */
/* ---------------------------------------------------------- */

/**
 * THE ONE CHAPTER NO TABLE CAN CARRY. This file has no customer
 * register — `hasCustomerRegister` reads false on the pack, measured
 * — so the name is typed, frozen onto the document the moment it is
 * typed, and belongs to this quote alone. That is not a shortcut: a
 * quote is a photograph, and a name corrected in a register on
 * Friday must not rewrite the document handed over on Monday.
 */
function Handover({
  quote,
  quoteId,
  refusal,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  refusal: string | undefined
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const [name, setName] = useState(quote.customer.name)
  const [contact, setContact] = useState(quote.customer.contact?.[0] ?? '')
  const issued = refusal !== undefined

  const save = useCallback(() => {
    const outcome = quotesStore.getState().apply(
      quoteId,
      setCustomer({
        name: name.trim(),
        ...(contact.trim() === '' ? {} : { contact: [contact.trim()] }),
      }),
    )
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
  }, [contact, name, quoteId, setRefused, setStep])

  return (
    <div className="cfg-table">
      <div className="cfg-table__head">
        <p className="cfg-table__why">
          This price file carries no customer register, so the name is typed here and belongs to
          this quote alone. It is frozen onto the document the moment it is saved — a quote is a
          photograph, and a name corrected somewhere else on Friday does not rewrite the document
          handed over on Monday.
        </p>
      </div>

      <div className="cfg-ask">
        <label className="cfg-ask__lab" htmlFor="cfg-customer">
          Who the quote is addressed to
        </label>
        <Input
          id="cfg-customer"
          value={name}
          onValueChange={setName}
          readOnly={issued}
          autoComplete="name"
          placeholder="Nobody named yet"
        />
      </div>
      <div className="cfg-ask">
        <label className="cfg-ask__lab" htmlFor="cfg-contact">
          One line of contact, as it should print
        </label>
        <Input
          id="cfg-contact"
          value={contact}
          onValueChange={setContact}
          readOnly={issued}
          placeholder="A phone number, an email, an address"
        />
      </div>
      <div className="cfg-act">
        <Button intent="act" onClick={save} refusedBecause={refusal}>
          {quote.customer.name.trim() === '' ? 'Address this quote' : 'Save the name'}
        </Button>
        <p className="cfg-act__say">
          {quote.customer.name.trim() === ''
            ? 'Until it has a name it cannot be given to anybody, and the finale says so.'
            : `This quote is addressed to ${quote.customer.name}.`}
        </p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The finale                                                   */
/* ---------------------------------------------------------- */

/**
 * ISSUING IS THE ONE IRREVERSIBLE ACT IN THIS APP, so everything
 * that cannot be repaired afterwards is refused BEFORE the press,
 * with a sentence, in the place it is refused. Every one of those
 * sentences is `issueBlockers`' own: the button, this chapter and
 * the command itself ask the same pure function, and none of them
 * may disagree.
 */
function Finale({
  quote,
  quoteId,
  rail,
  openQuote,
  now,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  rail: Rail
  openQuote?: (id: string) => void
  now?: () => Date
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  const issued = quote.state !== 'draft'

  const give = useCallback(() => {
    const outcome = quotesStore.getState().apply(quoteId, issue())
    if ('refused' in outcome) {
      setRefused(outcome.refused === '' ? null : outcome.refused)
      return
    }
    setRefused(null)
    setStep({ said: outcome.said, eventId: outcome.event.id, wasUndo: false })
  }, [quoteId, setRefused, setStep])

  /* THE ONLY WAY ON FROM AN ISSUED DOCUMENT, and the engine's own:
     the frozen lines are copied across so the new draft carries the
     figures that were agreed, not today's reading of them. */
  const again = useCallback(() => {
    const filed = quotesStore.getState().quotes
    const at = now ? now() : new Date()
    const minted = newVersionOf(quote, referenceForNow(filed, at), at.toISOString())
    quotesStore.getState().file(minted.quote, minted.event)
    openQuote?.(minted.quote.id)
  }, [now, openQuote, quote])

  return (
    <div className="cfg-table">
      <dl className="cfg-sums">
        <div className="cfg-sum">
          <dt className="cfg-sum__lab">Lines</dt>
          <dd className="cfg-sum__val">{quote.lines.length.toLocaleString('en-AU')}</dd>
        </div>
        <div className="cfg-sum">
          <dt className="cfg-sum__lab">Carrying no price</dt>
          <dd className="cfg-sum__val">{rail.unpriced.toLocaleString('en-AU')}</dd>
        </div>
        <div className="cfg-sum">
          <dt className="cfg-sum__lab">Total</dt>
          <dd className="cfg-sum__val">
            <PriceFigure amount={rail.total} />
          </dd>
        </div>
      </dl>

      <p className="cfg-table__why">
        Amounts are what the price file states, and the file states them with tax in — so nothing is
        converted anywhere on this quote and no discount can land on the wrong side of it. A tax
        rate is typed by a person or it is absent, and nobody has typed one.
      </p>

      {rail.doubleCharged.length > 0 ? (
        <div className="cfg-flag">
          {/* EVIDENCE, NEVER A REFUSAL. A dealer may legitimately add
              a transfer fee to a quote whose trailer is priced at a
              rung that already has registration in it — `Registration
              Costs` holds several such rows — so this says what is
              true and changes nothing. */}
          {rail.doubleCharged.map((said) => (
            <p className="cfg-flag__say" key={said}>
              {said}
            </p>
          ))}
        </div>
      ) : null}

      {issued ? (
        <div className="cfg-act">
          {/* an `output` rather than a paragraph with `role="status"`:
              the element already carries that role, and it is the tag
              for a result the page computed from what somebody did */}
          <output className="cfg-act__say">{ISSUED_REFUSAL}</output>
          <Button intent="act" onClick={again} refusedBecause={openQuote ? undefined : NO_DOCUMENT}>
            Make a new version
          </Button>
          <p className="cfg-act__say">
            The new draft carries these frozen figures across — the ones that were agreed, never
            today&rsquo;s reading of them.
          </p>
        </div>
      ) : (
        <div className="cfg-act">
          <Button
            intent="act"
            onClick={give}
            refusedBecause={rail.blockers.length > 0 ? rail.blockers.join(' ') : undefined}
          >
            Give it to the customer
          </Button>
          <p className="cfg-act__say">
            This freezes the document for good: nothing can go back on it afterwards, and the only
            way on is a new version. {NO_DOCUMENT}
          </p>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Small pieces                                                 */
/* ---------------------------------------------------------- */

/** Which way a figure moves the total, for the stylesheet. A null
 *  is a third answer and never a zero. */
const way = (delta: number | null): string =>
  delta === null ? 'none' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'

/** A clause the engine hands back with no leading capital and no
 *  full stop, as a sentence. */
const sentenceOf = (clause: string): string =>
  clause === ''
    ? ''
    : `${clause.charAt(0).toUpperCase()}${clause.slice(1)}${/[.?!]$/.test(clause) ? '' : '.'}`
