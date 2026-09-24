import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Button, Input, Kbd, PriceFigure, Tile, isField } from '@/ui'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { NO_WAYS, type Way } from '@/app/ways'
import { useSetScope } from '@/screens/shell/scope'
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
  setCustomer,
  signedMoney,
} from '@/domain/quote'
import type { ShownFact } from '@/domain/quote/distinguish'
/* THE REGISTER'S OWN TWO WORDS for the two ways a chapter has no
   subtotal, so the configurator and the quotes register never
   describe the same state with two different phrases. */
import { NOTHING_ON_IT, NOT_PRICED } from '@/domain/quote/register'
import {
  matchesFinish,
  readRail,
  type Act,
  type Chapter,
  type ChapterTable,
  type OptionRow,
  type Rail,
} from './chapters'
import type { Finish, Finishes } from './finishes'
import { hostOf, hullHero, stageArt, type StageArt } from './stage'
import {
  LEVEL_SAY,
  NO_LEVEL_SAY,
  allSay,
  choiceSay,
  countsSay,
  levelCountSay,
  linesSay,
  pictureSays,
  reasonSay,
  savedSay,
  searchSay,
  unpricedSay,
} from './say'
/* THE ADDRESS GRAMMAR OF A CASCADE, from the screen that owns it.
   This is the one import in this file that reaches into another
   screen and it is two pure functions rather than a component: the
   screen that RAISES a decision and the screen that READS it must not
   be able to spell the same `fix` two ways, and a constant in one
   place is the only thing that makes that true. */
import { finishFix, levelFix } from '@/screens/cascade/proposal'
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

/** WHERE THE ACT OF SELLING LEADS, AND IT IS NOW A PLACE.
 *
 *  This used to be a refusal — "the document is the next screen of
 *  this milestone and it is not built yet, so nothing was opened" —
 *  printed permanently under `Give it to the customer`, so issuing a
 *  quote correctly left a dealer on a read-only screen whose only
 *  onward control was `Make a new version`. The document is built, at
 *  `/quote/$id/document`, so the refusal is retired the way the
 *  picker's and the cascade's were: by having built the thing. */
export const DOCUMENT_SAY =
  'The printed quote opens from here the moment it is given — on A4, exactly as it stands, ready to print.'

/** Said where the press would have happened, on a host that handed
 *  this screen no way to open one. A test renders it with no router. */
export const NO_DOCUMENT_HERE =
  'Nothing on this page can open the document, because this screen was given no way to. The quote is written and kept in this browser either way.'

/** WHAT MOVING THE RUNG DOES, AND WHERE IT IS DECIDED. This used to
 *  be a refusal — "the sheet that shows what that costs line by line
 *  is not built yet" — and it is retired the way the picker's was, by
 *  having built the thing. The sheet is `/quote/$id/cascade`, its own
 *  address, and nothing is written to the document until it is
 *  accepted there. */
export const CASCADE_SAY = LEVEL_SAY

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
  /** where the thing you hand the customer opens — the frozen
   *  document at its own address. This is the onward route from the
   *  one irreversible act on this screen. */
  openDocument?: (quoteId: string) => void
  /** WHERE A DECISION THAT CHANGES WHAT IS ALREADY CHOSEN IS TAKEN.
   *  `fix` names the pick; `from` is the chapter it was raised in, so
   *  declining lands back on this chapter. Nothing is written here
   *  when this is called — the cascade owns the act. */
  goCascade?: (fix: string, from: string) => void
  /**
   * WHERE ELSE THIS APP HAS A SCREEN, as real addresses — the list is
   * `src/app/ways.ts`'s and the route hands it down. It is drawn in one
   * place only: the state this screen shows when no quote is filed at
   * the address somebody opened. Measured 2026-09-18 at
   * `/quote/<unknown-id>`, that state was one honest sentence with zero
   * controls on it — a dead end rather than a wrong answer, but a dead
   * end, and the one a shared link to another computer's quote lands on.
   */
  ways?: readonly Way[]
  /** follow one without a page load; without it they are still links
   *  and the browser follows them itself */
  go?: (href: string) => void
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
  openDocument,
  goCascade,
  ways = NO_WAYS,
  go,
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

  /* THE MASTHEAD'S OWN HEIGHT, MEASURED, so the two things that stick
     under it stick UNDER it.

     The search field and the stage were pinned at a typed 112px. The
     masthead is as tall as its content and as the pill's clearance
     (`--shell-inset`, a floor under its head) — and when the shell
     arrived it grew to 144.69px at 1280, 1440 and 1920, so the field
     ran 32.69px up behind it and the stage's photograph lost its top
     third of an inch the moment the page moved
     (built-critique-m2.md #8). A number typed into a stylesheet cannot
     follow a head that also grows a line when a quote is issued and
     wraps a long business name, so the head is measured where it is
     drawn and the measure is handed to the stylesheet as
     `--cfg-mast`. Without a ResizeObserver (a test's DOM) the
     stylesheet's own floor stands. */
  const [mastHeight, setMastHeight] = useState<number | null>(null)
  const measureMast = useCallback((node: HTMLElement | null) => {
    if (!node || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const height = Math.ceil(node.getBoundingClientRect().height)
      if (height > 0) setMastHeight(height)
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(node)
    return () => {
      watch.disconnect()
    }
  }, [])

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

  /* THE FIELD'S KEY IS `/`, AND IT USED TO BE CTRL K. The field IS
     the navigation on this screen — the sweep's first pattern — and it
     keeps a key of its own; what it no longer keeps is the chord the
     shell's finder answers to on all twelve screens. `/` is what every
     other find field in this app already answers to, and the finder
     opens with THIS build's chapters first, under a chip carrying the
     quote's own reference, so the two do not compete for the same
     press (`src/screens/shell/scope.tsx`).

     A KEY TYPED INTO A FIELD IS A CHARACTER — `isField` is the same
     guard the Escape ladder uses. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isField(event.target)) return
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

  /* ── WHAT THE FINDER IS SCOPED TO WHILE IT IS OPEN ON THIS BUILD ──
     The chip is this document's own reference and the first group is
     this build's chapters, answered by the SAME module the field above
     answers with — `readRail`, with the finder's words instead of the
     field's. A row here is not an address (a chapter is a place inside
     one screen), so it carries `at: 'here'` and the shell hands the id
     straight back to `goTo`, which is the route's own way of opening a
     chapter. */
  const scope = useMemo(
    () =>
      quote && open
        ? {
            word: quote.reference,
            title: 'On this build',
            say: 'The chapters of the document open on this screen.',
            rows: (words: string) =>
              readRail(ctx, quote, { query: words, showAll }).chapters.map((chapter) => ({
                id: `here:${chapter.id}`,
                name: chapter.num === '' ? chapter.name : `${chapter.num} ${chapter.name}`,
                fact: chapter.fact,
                verb: 'Go to it',
                target: { at: 'here' as const, id: chapter.id },
              })),
            go: (id: string) => goTo?.(id),
          }
        : null,
    [ctx, quote, open, showAll, goTo],
  )
  useSetScope(scope)

  if (!quote) {
    return (
      <Missing
        read={read}
        status={sheet.status}
        problem={sheet.problem}
        openTheFile={openTheFile}
        ways={ways}
        go={go}
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
    /* AN ISSUED DOCUMENT HAS ONE CHAPTER THAT STILL DOES ANYTHING,
       and it is the finale: every other chapter is read-only, and
       what a person arriving at an issued quote wants is the sheet
       they hand over. Opening on the first outstanding decision would
       open a chapter on which no decision can be taken. */
    (issued ? chapters.find((c) => c.kind === 'finale')?.id : undefined) ??
    chapters.find((c) => c.kind === 'band' && c.lines === 0 && c.offered > 0)?.id ??
    chapters[0]?.id ??
    ''

  /* RAISING A DECISION IS NOT MAKING ONE. This writes nothing: it
     navigates to the cascade with the pick in the address and the
     chapter it was raised in beside it, so declining lands back here
     and the document is untouched either way. */
  const raise = (fix: string): void => goCascade?.(fix, here)

  return (
    <main
      className="cfg"
      data-testid="configurator"
      style={
        mastHeight === null ? undefined : ({ '--cfg-mast': `${mastHeight}px` } as CSSProperties)
      }
    >
      <Mast
        head={measureMast}
        quote={quote}
        business={business}
        total={rail?.total ?? null}
        unpriced={rail?.unpriced ?? 0}
        open={open}
        openDocument={openDocument}
      />

      <div className="cfg-floor">
        <Stage
          quote={quote}
          ctx={ctx}
          open={open}
          kept={kept}
          who={who}
          rail={rail}
          raise={raise}
          refusal={refusal}
        />

        <section className="cfg-rail" aria-label="The chapters of this quote">
          <div className="cfg-find">
            {/* THE KEY IS A CAP BESIDE THE LABEL, NOT A WORD IN THE FIELD.
                The placeholder read "/ — a name, a code, a rigging kit",
                which names a key on a phone that has none (rule b,
                built-critique-m2.md #18) and cannot be taken away by a
                stylesheet. `Kbd` is withdrawn under `pointer: coarse` by
                its own primitive; the field keeps only what it is for. */}
            <div className="cfg-find__top">
              <label className="cfg-find__label" htmlFor="cfg-find">
                Search every option on this quote
              </label>
              {open ? <Kbd tone="quiet">/</Kbd> : null}
            </div>
            <Input
              id="cfg-find"
              ref={field}
              type="search"
              value={query}
              onValueChange={setQuery}
              aria-describedby="cfg-find-said"
              placeholder={open ? 'A name, a code, a rigging kit' : 'Nothing to search'}
            />
            <p className="cfg-find__said" id="cfg-find-said">
              {searchSay(rail, open)}
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
                onRaise={raise}
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
                openDocument={openDocument}
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
  ways,
  go,
}: {
  read: boolean
  status: string
  problem: string | null
  openTheFile?: () => void
  ways: readonly Way[]
  go?: (href: string) => void
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
          /* IN THE DEALER'S WORDS, WHAT IS TRUE TODAY. This ended "that
             arrives with the backend at Milestone 6" — a word from this
             repository's plan, shown to a dealership (rule c,
             built-critique-m2.md #14). What a person at this desk needs
             is where their quote is, not when the plan says it moves. */
          <p className="cfg-blank__say">
            <b>No quote is filed at this address in this browser.</b> A quote is kept in the browser
            it was written in, so a link to one opens only on the computer that wrote it.
          </p>
        )}
        {read && status !== 'ready' && openTheFile ? (
          <Button intent="veiled" onClick={openTheFile}>
            Load the Master Price File
          </Button>
        ) : null}
        {/* AND A WAY OUT OF IT. That control appears only on a desk whose
            price file is shut, so on a desk with the file open this
            state was a paragraph in an empty window with nothing on it
            to press — measured at `/quote/<unknown-id>` on 2026-09-18.
            They are links, so the address can be corrected and tried
            again in the same tab or a new one. */}
        {ways.length > 0 ? (
          <nav className="cfg-blank__ways" aria-label="Elsewhere in this app">
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
  head,
  quote,
  business,
  total,
  unpriced,
  open,
  openDocument,
}: {
  /** where the screen measures this head, so what sticks under it
   *  sticks under it */
  head?: (node: HTMLElement | null) => void
  quote: QuoteDef
  business: string | null
  total: number | null
  unpriced: number
  open: boolean
  openDocument?: (quoteId: string) => void
}) {
  return (
    <header className="cfg-mast" ref={head}>
      <div className="cfg-mast__who">
        <p className="cfg-eyebrow">
          {business ? `${business} · ` : ''}Quote{' '}
          <span className="cfg-mono">{quote.reference}</span>
          {quote.state === 'draft' ? ' · draft' : ' · given to the customer'}
        </p>
        <h1 className="cfg-mast__name">{quote.subjectLabel}</h1>
        {/* THE WAY TO THE THING YOU HAND OVER, from anywhere on an
            issued document rather than only from the foot of the last
            chapter. A draft has no sheet to open — the document
            renders from FROZEN lines and a draft's are still moving —
            so this is not a control that appears refused, it is a
            control that appears when there is something to open. */}
        {quote.state === 'draft' ? null : (
          <p className="cfg-mast__on">
            <Button
              intent="veiled"
              size="sm"
              onClick={() => openDocument?.(quote.id)}
              refusedBecause={openDocument ? undefined : NO_DOCUMENT_HERE}
            >
              Open the document
            </Button>
          </p>
        )}
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
        {/* THE VERB AGREES WITH THE COUNT — "1 of them carry" was the
            fault (#25), and `linesSay` holds a case per count. */}
        <p className="cfg-money__sub">{linesSay(quote.lines.length, unpriced)}</p>
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
  raise,
  refusal,
}: {
  quote: QuoteDef
  ctx: CatalogueCtx
  open: boolean
  kept: string | null
  who: string | null
  rail: Rail | null
  raise: (fix: string) => void
  refusal: string | undefined
}) {
  const register = ctx.entities[quote.rootTableId]?.name ?? ''
  /* THE HULL'S OWN PHOTOGRAPH ON THE WATER WHERE THE LEDGER HOLDS
     ONE, and the catalogue copy where it does not. `stage.ts` argues
     the rung at length; what it buys this screen is a stage worth the
     name — 2560px of scene instead of 1100px of studio render, so the
     boat can be drawn at the size the direction promised without ever
     passing the pixels the ledger holds. */
  const hero = useMemo(() => hullHero(ctx, quote), [ctx, quote])
  const art: StageArt = stageArt(quote.subjectImage?.src, register, hero)
  /* WHAT THE PICTURE SHOWS AND WHAT THIS QUOTE CARRIES, because the
     customer at the desk reads the picture (#24). `say.ts` argues it. */
  const said = pictureSays(art, quote, rail, ctx)
  const [drawn, setDrawn] = useState<{ w: number; h: number } | null>(null)
  const photo = useRef<HTMLImageElement>(null)
  const held = art.kind === 'photograph' ? art.held : null

  /* THE PAINTED SIZE, NOT THE BOX — the same arithmetic entry and
     home run on theirs. `object-fit: cover` scales the whole picture
     until it covers the box and the box crops the rest, so the scale
     is the larger of the two ratios and the size reported is the
     whole picture at that scale. It rides on the provenance line as
     `data-drawn`, beside `data-held`, so "never enlarged" stays
     checkable at every width — by a test, not by a customer. */
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
      {/* WHAT THE PACKER MEASURED THE PICTURE TO BE rides on the box,
          because a render and a scene are not drawn the same way and
          the difference is data rather than taste. See the
          stylesheet. */}
      <figure
        className="cfg-shot"
        data-art={art.kind}
        data-verdict={art.kind === 'photograph' ? art.held.verdict : undefined}
        /* NEVER ENLARGED, STRUCTURALLY. `object-fit: cover` scales a
           picture until it covers its box, so a box wider than the
           bytes is an enlargement — the cascade screen measured
           exactly that and it is recorded in docs/DECISIONS.md. The
           ledger's own pixels are the ceiling on the BOX, which makes
           the promise a bound rather than a caption: at or under the
           held size, `cover` can only scale down. Home caps its two
           plates the same way. */
        style={
          art.kind === 'photograph'
            ? { maxInlineSize: art.held.width, maxBlockSize: art.held.height }
            : undefined
        }
      >
        {art.kind === 'photograph' ? (
          <img
            className="cfg-shot__img"
            ref={photo}
            src={art.held.src}
            /* THE LEDGER'S OWN WORDS FOR WHAT IT SHOWS, where a ledger
               has them — the hero rows carry a `subject` line and the
               catalogue rows do not, so the fallback is the boat this
               document is about. */
            alt={art.held.subject === '' ? quote.subjectLabel : art.held.subject}
            width={art.held.width}
            height={art.held.height}
            /* THE NARROWER COPIES THE LEDGER ALREADY HOLDS. A 2560px
               hero fetched to be drawn 913px wide is 400 kB of stall
               on the fold of the screen a sale happens on — the
               critique measured that on home and it is the same
               picture set. `sizes` is the stage's own share of the
               window at each step of this screen's ladder. */
            {...(art.held.widths.length > 1
              ? {
                  srcSet: art.held.widths.map((w) => `${w.src} ${w.width}w`).join(', '),
                  sizes:
                    '(max-width: 639px) 100vw, (max-width: 1199px) 288px, (max-width: 1439px) 44vw, 48vw',
                }
              : {})}
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

      {/* EVERYTHING THAT IS NOT THE PICTURE, IN ONE BLOCK, because at
          every width under 1200 the stage is a band and the picture
          stands beside the rest of it. Without the wrapper the band is
          a grid of eight loose children and the picture spans a fixed
          number of rows — which is a count that goes wrong the day a
          line is added. Measured at 834x1112: the last two sentences
          wrapped under the photograph instead of beside it. */}
      <div className="cfg-stage__say">
        {/* THE CAPTION STANDS DIRECTLY UNDER THE PHOTOGRAPH IT IS ABOUT.
            On the Sport 560 the maker's photograph has a Mercury on the
            transom and the quote may carry a Yamaha; the picture is the
            model's own and is neither swapped nor cropped, and this says
            in two lines whose rig it is and what is on this quote. */}
        {said ? (
          <p className="cfg-caption" data-testid="stage-caption">
            <span className="cfg-caption__shows">{said.shows}</span>
            {said.ours === '' ? null : <span className="cfg-caption__ours">{said.ours}</span>}
          </p>
        ) : null}
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
          <p className="cfg-note">The price file lists no specifications for this boat.</p>
        )}

        {/* WHERE THE PICTURE CAME FROM, IN ONE SHORT LINE. It read "Stage
            copy 2,560 × 1,708, drawn here at 624 × 416, never enlarged ·
            from media.highfieldboats.com" — the image ledger's arithmetic,
            printed to a customer at the desk (M2-close critique #4 and
            #21). The provenance is the ledger's and stays there; "never
            enlarged" is a bound the box already enforces (its max size is
            the held pixels) and is not a sentence anybody reads. The held
            and drawn sizes ride on the line as data, so a test can still
            check the bound at every width. */}
        <p
          className="cfg-prov"
          data-held={art.kind === 'photograph' ? `${art.held.width}x${art.held.height}` : undefined}
          data-drawn={drawn ? `${drawn.w}x${drawn.h}` : undefined}
        >
          {art.kind === 'photograph'
            ? `${art.held.tier === 'hero' ? 'Photograph' : 'Picture'} from ${hostOf(art.held.address)}`
            : art.because}
        </p>

        <div className="cfg-hair" />

        {open ? (
          <Rungs quote={quote} rail={rail} raise={raise} refusal={refusal} />
        ) : (
          <p className="cfg-note">
            The Master Price File is not loaded in this browser, so nothing below can be offered.
            Every price already on this quote stays as it was picked.
          </p>
        )}
        <p className="cfg-note">
          {who ? `Prepared by ${quote.preparedBy ?? who}. ` : ''}
          {savedSay(kept)}
        </p>
      </div>
    </section>
  )
}

/**
 * THE RUNG, AND THE WAY TO ANOTHER ONE.
 *
 * It is a FACT and then a proposal, never a switch. Pressing a rung
 * here writes nothing: it opens `/quote/$id/cascade?fix=level:<key>`,
 * where the move is shown line by line with the reason each line
 * gives and is accepted or declined. That is the difference between
 * this and production, which re-prices instantly and silently and
 * loses the level on save.
 *
 * The rungs are `quoteLevelChoices`', read off the document's own
 * frozen levels, and the count beside each is the engine's own
 * `carriedBy` — how many of this quote's lines actually carry that
 * column — so a rung two tables out of eight can offer never looks
 * universal.
 */
function Rungs({
  quote,
  rail,
  raise,
  refusal,
}: {
  quote: QuoteDef
  rail: Rail | null
  raise: (fix: string) => void
  refusal: string | undefined
}) {
  const rungs = rail?.rungs ?? []
  /* ONE REASON, SAID ONCE, ABOVE THE CONTROLS IT REFUSES. Three
     refused rungs each printing `ISSUED_REFUSAL` under itself put
     three copies of a two-line sentence in a 27rem column; the
     primitive's `refusedBy` is the same refusal with the sentence in
     one place. */
  const shutId = 'cfg-rungs-shut'
  if (rungs.length === 0) {
    return <p className="cfg-note">{NO_LEVEL_SAY}</p>
  }
  return (
    <div className="cfg-rungs">
      <p className="cfg-rungs__lab">Priced at</p>
      {refusal === undefined ? null : (
        <p className="cfg-shut" id={shutId}>
          {refusal}
        </p>
      )}
      <ul className="cfg-rungs__list">
        {rungs.map((rung) => (
          <li className="cfg-rung" key={rung.key}>
            {rung.key === quote.levelKey ? (
              <span className="cfg-rung__on">
                {rung.label}
                <span className="cfg-rung__count">
                  {levelCountSay(rung.carriedBy, quote.lines.length)}
                </span>
              </span>
            ) : (
              <Button
                intent="veiled"
                size="sm"
                onClick={() => raise(levelFix(rung.key))}
                refusedBy={refusal === undefined ? undefined : shutId}
              >
                See what {rung.label} does
              </Button>
            )}
          </li>
        ))}
      </ul>
      <p className="cfg-note">{CASCADE_SAY}</p>
    </div>
  )
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
  onRaise,
  onShowAll,
  refusal,
  quoteId,
  openQuote,
  openDocument,
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
  onRaise: (fix: string) => void
  onShowAll: (id: string) => void
  refusal: string | undefined
  quoteId: string
  openQuote?: (id: string) => void
  openDocument?: (id: string) => void
  now?: () => Date
  setStep: (step: Step) => void
  setRefused: (said: string | null) => void
}) {
  /* A SEARCH OPENS EVERY CHAPTER THAT HAS AN ANSWER, which is the
     whole of "no mode change": the rail is the same rail, narrowed
     in place, and a chapter with nothing matching stays shut and
     says so rather than disappearing. */
  const showing = searching ? chapter.matched > 0 : open

  /* THE ONE REASON EVERY ROW IN THIS CHAPTER IS REFUSED FOR, ONCE,
     ABOVE THEM ALL.
     MEASURED after issuing with chapter 02 open, 2026-09-17: five
     copies of `ISSUED_REFUSAL`, four of them a 58.5px paragraph
     wedged BETWEEN two rows, so each read as though it belonged to
     the row beneath it — and `Show all 209 in Yamaha Outboards` would
     have made it 209. One chapter above, the fitment refusal already
     said its reason once, above the list, with every row still live:
     the same screen held the right pattern and the wrong one. This is
     the right one, and the primitive gained `refusedBy` so the tiles
     still carry `aria-describedby` to the sentence. */
  const shutId = `cfg-shut-${chapter.id}`
  const refusedBy = refusal === undefined ? undefined : shutId

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
          {/* THE TWO CLOSING CHAPTERS CARRY NO NUMBER AND NO MARK IN ITS
              PLACE. The numbers are the engine's fixed reading order —
              "03" is the trailer on every quote, and 05 belongs to
              Administration where a business has it — so "Who it is for"
              and the finale cannot take 05 and 06 without the column
              meaning two things. They printed "·" instead, which read as
              a number nobody could decode (the M2-close critique, #20);
              the cell stays, empty, so the names still stand in line. */}
          <span className="cfg-head__num" aria-hidden={chapter.num === '' ? true : undefined}>
            {chapter.num}
          </span>
          <span className="cfg-head__body">
            <span className="cfg-head__name">{chapter.name}</span>
            <span className="cfg-head__fact">
              {chapter.fact}
              {choiceSay(chapter, searching)}
              {/* A CHAPTER THE SEARCH DID NOT REACH SAYS SO ON ITS OWN
                  HEAD. It stays shut, in its place, still stating its
                  answer — but a head reading "3 more offered" over a
                  rail that has narrowed reads as a chapter with
                  matches in it that simply is not open. */}
              {searching
                ? chapter.matched > 0
                  ? ` · ${chapter.matched.toLocaleString('en-AU')} match`
                  : ' · nothing here matches'
                : ''}
            </span>
          </span>
          {/* THE SUBTOTAL, AND THE TWO WAYS THERE IS NOT ONE — which
              are different facts and are the register's own two
              words for them. A chapter with nothing on it has not
              been answered; a chapter whose lines carry no figure
              has, and the price file prices none of them. The
              handover is neither: it is a question about a person
              and owes no figure at all, so its cell is empty rather
              than carrying a word about money. */}
          <span className="cfg-head__sum">
            {chapter.kind === 'handover' ? null : chapter.amount === null ? (
              <span className="cfg-head__nosum">
                {chapter.lines === 0 ? NOTHING_ON_IT : NOT_PRICED}
              </span>
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
          {refusal !== undefined && chapter.kind === 'band' ? (
            <p className="cfg-shut" id={shutId}>
              {refusal}
            </p>
          ) : null}

          {chapter.finishes ? (
            <FinishBlock
              finishes={chapter.finishes}
              query={searching ? query : ''}
              onPress={onPress}
              onRaise={onRaise}
              refusedBy={refusedBy}
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
              refusedBy={refusedBy}
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
              openDocument={openDocument}
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
  onRaise,
  refusedBy,
}: {
  finishes: Finishes
  query: string
  onPress: (act: Act) => void
  onRaise: (fix: string) => void
  /** the element holding the one reason every row here is refused
   *  for, where there is one. The sentence is drawn once, by the
   *  chapter, above every block in it. */
  refusedBy: string | undefined
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
        {/* ONE FACT, IN THE WORDS A SALESPERSON SAYS IT. It read "A quote
            is written against ONE row of Highfield Inflatables … Choosing
            another re-roots the document on that row" (M2-close critique
            #4). What the press does is change the hull and nothing else. */}
        <p className="cfg-table__why">
          Choose another and only the hull changes. The motor, the trailer and everything else on
          this quote stay as they are.
        </p>
      </div>
      <ul className="cfg-rows">
        {rows.map((finish) => (
          <li key={finish.rowId}>
            <FinishCard finish={finish} onPress={onPress} onRaise={onRaise} refusedBy={refusedBy} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * A FINISH THAT COSTS SOMETHING IS A DECISION, AND A DECISION IS THE
 * CASCADE'S. Re-rooting the document on another row of the register
 * re-prices the hull and asks fitment again what the trailers already
 * on this quote are, so where the press moves the total it opens
 * `/quote/$id/cascade?fix=finish:<rowId>` and writes nothing until it
 * is accepted there.
 *
 * WHERE IT MOVES NOTHING IT IS APPLIED HERE. Seven of the SP560's
 * fifteen finishes are the same price as the one on the quote, and a
 * sheet that opens to say "nothing happens" is a full stop in the
 * middle of somebody's work — `src/domain/quote/cascade.ts` refuses to
 * build one for exactly that reason, and this is the same rule one
 * level up.
 */
function FinishCard({
  finish,
  onPress,
  onRaise,
  refusedBy,
}: {
  finish: Finish
  onPress: (act: Act) => void
  onRaise: (fix: string) => void
  refusedBy: string | undefined
}) {
  return (
    <Tile
      tone="room"
      shape="row"
      selected={finish.current}
      onSelect={() =>
        finish.delta === 0
          ? onPress({ do: 'refinish', rowId: finish.rowId, label: finish.label })
          : onRaise(finishFix(finish.rowId))
      }
      refusedBy={refusedBy}
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
            {finish.colour.read ? finish.colour.say : 'no colour name on file for this code'}
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
  refusedBy,
}: {
  table: ChapterTable
  /** the chapter holds more than one table, so each needs its name */
  named: boolean
  query: string
  onPress: (act: Act) => void
  onShowAll: (id: string) => void
  /** the element holding the one reason every row here is refused
   *  for, where there is one */
  refusedBy: string | undefined
}) {
  const counts = table.counts
  const offered = Math.max(0, counts.admitted - counts.heldCount)
  const reason = reasonSay(table)
  const unpriced = unpricedSay(table)

  return (
    <div className="cfg-table">
      <div className="cfg-table__head">
        {named ? <h3 className="cfg-table__name">{table.title}</h3> : null}
        {/* THE COUNTED RAIL, and every figure in it comes back from
            the engine so the screen never works out its own
            denominator (`freeze.ts` Offer, at length). The
            denominator is what the switch below would show — "4 of
            1,777" over "Show all 1,576" gave a dealer two totals for
            one question. The words are `countsSay`'s: "4 of 209
            paired with this hull", which is the whole of what the
            list's workbook name and its file-wide rate were saying. */}
        <p className="cfg-table__counts">{countsSay(table, query)}</p>
        {reason === '' ? null : <p className="cfg-table__why">{reason}</p>}
        {unpriced === '' ? null : <p className="cfg-table__why">{unpriced}</p>}
        {/* THE FILE'S OWN PICK, NAMED IN TEXT ABOVE THE ROWS, which
            is what §4 of the sweep measured every good reference
            doing — "None uses a star, a ribbon or a colour." The
            substance was already right: `mintQuote` brings the
            starred motor and the starred trailer across at mint, so
            the recommended row is the row already on the quote when
            the chapter opens. The ★ that used to ride on it was the
            one treatment the sweep counted its references avoiding. */}
        {table.recommends === '' ? null : (
          <p className="cfg-table__pick">
            The price file recommends <b>{table.recommends}</b> for this hull.
          </p>
        )}
      </div>

      {/* EVIDENCE, NEVER A REFUSAL — the same category the finale's
          double-charge flag is in, and the same treatment. A press on
          this screen ADDS: the chapters are not radio groups, because
          a section really does hold as many lines as a dealer puts on
          it. What was missing is that nothing said so, so pressing a
          second motor quietly fitted a second outboard to a 5.66 m
          RIB. The sentence is `severalOnStepSentence`'s, in the
          engine, beside the command whose behaviour it describes. */}
      {table.severalSay === '' ? null : (
        <p className="cfg-several" data-testid="several-on-one-table">
          {table.severalSay}
        </p>
      )}

      {table.rows.length === 0 ? (
        <p className="cfg-why">
          {query !== ''
            ? `Nothing in ${table.title} is called that.`
            : table.why !== ''
              ? table.why
              : `Nothing more from ${table.title} is paired with this hull.`}
        </p>
      ) : (
        <>
          {/* THE ONE REASON THEY ALL SHARE, said once above them —
              `chapters.ts` records what forty copies of it looked
              like. Not one row is hidden, greyed or disabled by it:
              this is `premium/pcpartpicker-list.png`'s banner, which
              names the problem in words and leaves every control
              live. */}
          {table.sharedWhy === '' ? null : <p className="cfg-shared">{table.sharedWhy}</p>}
          <ul className="cfg-rows">
            {table.rows.map((row) => (
              <li key={row.key}>
                <OptionCard row={row} query={query} onPress={onPress} refusedBy={refusedBy} />
              </li>
            ))}
          </ul>
        </>
      )}

      {table.also.length > 0 ? (
        <div className="cfg-also">
          <p className="cfg-also__lab">
            Also on this quote from {table.title}, and not in the list above
          </p>
          <ul className="cfg-rows">
            {table.also.map((row) => (
              <li key={row.key}>
                <OptionCard row={row} query="" onPress={onPress} refusedBy={refusedBy} />
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
          <p className="cfg-all__say">{allSay(table)}</p>
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
  refusedBy,
}: {
  row: OptionRow
  query: string
  onPress: (act: Act) => void
  refusedBy: string | undefined
}) {
  return (
    <div className="cfg-opt" data-outside={row.outside ? '' : undefined}>
      <Tile
        tone="room"
        shape="row"
        selected={row.fitted}
        onSelect={() => onPress(row.act)}
        refusedBy={refusedBy}
        /* THE RECOMMENDATION IS STILL ON THE ROW FOR A READER, and it
           is the same words the table head prints for an eye. What
           left is the ★ glyph beside the name: §4 of the sweep
           measured Saxdor, Apple, Whaler and Porsche and found that
           "None uses a star, a ribbon or a colour." */
        label={`${row.tail}${row.starred ? ', recommended by the price file' : ''}, ${row.fitted ? 'on the quote' : 'not on the quote'}`}
      >
        <span className="cfg-row">
          <span className="cfg-row__main">
            <span className="cfg-row__name">
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
            {/* AND AN EMPTY CELL IS AN EM-DASH, never a blank and
                never a nought — the sweep's §2, off
                `premium/pcpartpicker-list.png`, a table still being
                built where every unanswered cell carries one. */}
            <span className="cfg-row__delta" data-way={way(row.delta)}>
              {row.delta === null ? '—' : signedMoney(row.delta)}
            </span>
            {row.amount === null ? (
              /* STANDARD IS A WORD AND NOT $0.00. Where the list has a
                 price level and this row leaves it empty, the level's
                 name is printed where the figure would be. Where the
                 list has no price at all, the head of the list says so
                 ONCE (`unpricedSay`) and the row carries only its dash:
                 "no price column on this table" under every dealer-fit
                 and rigging row was six copies of one engine sentence
                 in one chapter (M2-close critique #4). */
              row.column === null ? null : (
                <span className="cfg-row__at">{row.column}</span>
              )
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
        {/* WHAT HAPPENS TO A NAME TYPED HERE, and nothing about where it
            is stored. This said "This price file carries no customer
            register … It is frozen onto the document", which was the
            engine explaining itself — and on this tree it was also
            wrong, since Customers keeps a book. */}
        <p className="cfg-table__why">
          The name and the contact line print on this quote exactly as typed. Once the quote is
          given they stay as they were, even if the customer&rsquo;s details change later.
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
  openDocument,
  now,
  setStep,
  setRefused,
}: {
  quote: QuoteDef
  quoteId: string
  rail: Rail
  openQuote?: (id: string) => void
  openDocument?: (id: string) => void
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
        Every price is the price file&rsquo;s own, with tax included, so nothing on this quote is
        converted and no tax is added on top.
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
          {/* THE ACT OF SELLING LEADS SOMEWHERE NOW. It used to end
              here, under a sentence saying the document was not built
              yet, with `Make a new version` as the only onward
              control — so pressing the one irreversible act in this
              app stranded a dealer. The sheet is the act; the new
              version is the way BACK to work, and is quieter. */}
          <Button
            intent="act"
            onClick={() => openDocument?.(quoteId)}
            refusedBecause={openDocument ? undefined : NO_DOCUMENT_HERE}
          >
            Open the document
          </Button>
          <p className="cfg-act__say">
            The printed quote, on A4, exactly as it was given — and it prints from the same page.
          </p>
          <Button
            intent="veiled"
            onClick={again}
            refusedBecause={openQuote ? undefined : NO_DOCUMENT_HERE}
          >
            Make a new version
          </Button>
          <p className="cfg-act__say">
            A new version starts from the prices agreed on this one, never today&rsquo;s.
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
            Once it is given it cannot be changed, only copied into a new version. {DOCUMENT_SAY}
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
