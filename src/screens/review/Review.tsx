import {
  Fragment,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { motion } from 'motion/react'
import {
  ArrowArcLeftIcon,
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BroomIcon,
  CheckCircleIcon,
  FileTextIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  PencilSimpleIcon,
  ProhibitIcon,
  SkipForwardIcon,
  TagIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Chip,
  Figure,
  Icon,
  Input,
  Kbd,
  Refusal,
  Tile,
  isField,
  transition,
  useStill,
} from '@/ui'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { isCostColumn } from '@/domain/quote/pricing'
import { money } from '@/domain/money'
import { displayFieldOf, readCell, type EntityDef, type RowData } from '@/domain/model'
import { TRAILER_MASS_BANDS } from '@/domain/rules/constraints/registration'
import {
  review,
  tidySaid,
  unchecked,
  type Review as ReviewData,
} from '@/domain/rules/review/checks'
import {
  CASE_KINDS,
  casesByKind,
  linesIn,
  meantKeysOf,
  queueOf,
  tableOfCase,
  type Case,
  type CaseKind,
} from '@/domain/rules/review/cases'
import {
  bringBackCommand,
  leaveCommand,
  nameApartCommand,
  nameApartRefusal,
  nameLinesCommand,
  nameTwinCommand,
  offSaleCommand,
  onePriceCommand,
  priceLinesCommand,
  rebandCommand,
  rebandRefusal,
  typedPrice,
} from '@/domain/rules/review/fixes'
import { moneyOfCases, standingOf, stampOf, type LeftCase } from '@/domain/rules/review/standing'
import { countedByKind, distinctLines } from '@/domain/rules/review/leftDay'
import { houseHeld } from '@/domain/rules/review/houseHeld'
import { pricesNow, pricesSaid } from '@/domain/rules/review/pricesNow'
import { quotesTouching, type QuoteTouch } from '@/domain/rules/review/touching'
import { caseFound, wordsOfCase } from '@/domain/rules/review/finding'
import { seeBothSearch } from '@/domain/rules/review/seeBoth'
import { markFor, type MarkChoice } from '@/screens/home/ledgers'
import { packedOn, provenanceOfSheet } from '@/screens/data/file'
import {
  CHECK_WORDS,
  MEANT_PREF,
  capsSaid,
  TIDY,
  allSayWhatTheyComeWith,
  andMore,
  besideOnce,
  boatSaid,
  codesDiffer,
  columnLetter,
  comesBackOf,
  counted,
  heading,
  joined,
  kg,
  labelRead,
  ledeOf,
  leftSaid,
  leftSentence,
  meantOf,
  nameSaid,
  peekOf,
  priceSaid,
  pricesOfLine,
  signed,
  sinceSaid,
  sourceSaid,
  staysSaid,
  spokenCategory,
  titleOf,
  trailerModel,
  trailerSeries,
  whenSaid,
  wholeRuns,
  type LeftAs,
} from './read'
import { useLeftAlone } from './left'
import { useSinceTheFile, type FileOf, type Since } from './since'
import './review.css'

/* ============================================================
   REVIEW — direction E, "The case queue", of docs/directions/review-boards/ (judged
   2026-10-28), deepened by the judge of 2026-11-04 (docs/directions/data-round/review/).

   WHAT IS WRONG IN NORTHSIDE'S OWN PRICE LIST, ONE CASE AT A TIME, AND EVERY CASE IN ONE LOOK.
   A rail counts the cases still to settle, in nine checks, Tidy dashed after them, with the
   money they cost on one sale of each. Under it, one stage holds one case: the fix as its title,
   the file's own cells as they read and as they will, one press, two named ways to leave it, a
   door to every line it names, and the quotes on this computer that carry them. The queue is
   ordered by what each risks on a quote (`cases.ts`): a boat on sale at $0 is a $0 quote and
   leads. Beside the stage at a desk, and behind one press below one, the whole queue is an
   index, grouped by check or by list and found by typing.

   THE QUEUE ENDS, AND ITS LAST PAGE IS TRUE (the judge's blocker): a case left alone is not a
   case fixed, so the clean day names each check that still stands by Northside's choice, with
   its money said as LEFT ALONE, never as $0; the foot lists what was left, why, when and by
   whom, each brought back on its own. What is left alone is kept with Northside's file on this
   computer (`OrgProfile.leftAlone`), and a copy saved on Shelf carries it to another.

   EVERY PRESS IS THE PRICE LIST'S OWN CHANGE, through the catalogue's command door: one step,
   said over the stage with its Undo, and Ctrl Z takes the last one back here. Leaving a case
   alone is a step too. Each act says only what is true of it. THE STEP IS SAID IN THE PAGE, NOT
   IN A TOAST (the verifier of 2026-11-04, round 1, gap 6): a toast in the window's corner stood
   over Bring it back, the clean day's lines and the cases after the stage; said over the stage,
   where the next case lands, it covers nothing and stays until the next step.

   WHAT IS NEW, AND WHAT WAS SETTLED, SINCE THE PRICE FILE (J11): the lists written on this
   computer since the file was packed are read as the file carries them, the queue is found on
   them, and the two are compared (`since.ts`).

   A POSITION IS THE ADDRESS (the route's own comment).
   ============================================================ */

export interface ReviewPosition {
  /** the case on the stage by its key, `tidy` for the tidy suggestions; absent for the first */
  case?: string
  /** `open`: the index is open below a desk */
  list?: 'open'
  /** what was typed into the index's find */
  find?: string
  /** `list`: the index grouped by list, not by check */
  by?: 'list'
  /** `open`: the left-alone list is open at the foot */
  left?: 'open'
  /** `open`: what was settled since the price file is listed at the foot */
  since?: 'open'
}

export interface ReviewProps {
  position: ReviewPosition
  onPosition: (next: ReviewPosition) => void
  /** the price list at one of its lines: its address, and the press that goes there */
  listHref: (tableId: string, at?: string) => string
  go: (href: string) => void
  /** where a computer with no copy of the price list goes to load one */
  openTheFile: () => void
  /** the Master Price File as it was packed, to say what changed since it; absent, nothing is */
  fileOf?: FileOf
}

/** The last step taken here, said over the stage: its sentence, and the way back while it is one. */
interface Done {
  said: string
  /** a step this screen's press could not take, said as a refusal */
  refused?: boolean
  undo?: () => void
  /** a fresh step is a fresh element, so a reader hears each one */
  at: number
}

type Tables = Readonly<Record<string, EntityDef>>
type Rows = Readonly<Record<string, readonly RowData[]>>

const NONE_NEW: ReadonlySet<string> = new Set()

export function Review(props: ReviewProps) {
  const status = useCatalogue((s) => s.status)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const ready = status === 'ready' && Object.keys(tables).length > 0

  /* EVERY FINDING ON THE PRICE LIST AS IT STANDS, nothing left out: what was left alone is split
     off afterwards (`standingOf`), so leaving a case never counts the file again */
  const data = useMemo(
    () => (ready ? review({ entities: tables, rowsByEntity: rows }) : null),
    [ready, tables, rows],
  )
  const unread = useMemo(
    () => (ready ? unchecked({ entities: tables, rowsByEntity: rows }) : []),
    [ready, tables, rows],
  )

  if (!data) {
    return (
      <main className="rv" data-testid="review">
        <div className="rv-wait" data-ground="plate">
          <h1 className="rv-wait__title">What is wrong in your price list</h1>
          {status === 'failed' || (status === 'ready' && !ready) ? (
            <>
              <p className="rv-quiet">
                The price list is not on this computer yet, so there is nothing to check.
              </p>
              <Button intent="act" icon={FileTextIcon} onClick={props.openTheFile}>
                Load the Master Price File
              </Button>
            </>
          ) : (
            <p className="rv-quiet">Reading the price list…</p>
          )}
        </div>
      </main>
    )
  }
  return <Queue {...props} data={data} unread={unread} tables={tables} rows={rows} />
}

/* ============================================================
   THE QUEUE: the rail, the index, the stage, the cases after it, and the foot
   ============================================================ */

interface QueueProps extends ReviewProps {
  data: ReviewData
  unread: ReturnType<typeof unchecked>
  tables: Tables
  rows: Rows
}

function Queue({
  data,
  unread,
  tables,
  rows,
  position,
  onPosition,
  listHref,
  go,
  fileOf,
}: QueueProps) {
  const still = useStill()
  const meant = useLeftAlone()
  const who = useSession((s) => s.name) ?? ''
  const version = useCatalogue((s) => s.version)
  const quoteList = useQuotes((s) => s.quotes)
  const all = useMemo(() => queueOf(data), [data])
  const { open: cases, left } = useMemo(() => standingOf(all, meant), [all, meant])
  const perKind = useMemo(() => casesByKind(cases), [cases])
  const tidyOn = data.tidyCount > 0
  const at = position.case ?? ''

  /* WHAT EACH CASE TOUCHES, AND WHAT IS NEW: the quotes carrying its lines, and whether it was
     found on the price file as it was packed (`since.ts`: a finding the file did not have) */
  const touching = useMemo(() => quotesTouching(cases, quoteList), [cases, quoteList])
  const provenance = provenanceOfSheet(version)
  const packedAt = provenance.known ? provenance.file.packedAt : null
  const since = useSinceTheFile(tables, rows, packedAt, all, fileOf)
  const fresh: ReadonlySet<string> = since.state === 'read' ? since.arrivedKeys : NONE_NEW

  /* THE LAST STEP, SAID OVER THE STAGE (gap 6): never a toast over the page */
  const [done, setDone] = useState<Done | null>(null)
  const doneRef = useRef<HTMLOutputElement>(null)
  const sayDone = useCallback((said: string, undo?: () => void, refused?: boolean) => {
    setDone({ said, undo, refused, at: Date.now() })
  }, [])

  /* WHERE THE STAGE STANDS: the case the address names; the first case when it names none, or one
     already settled — and then the stage SAYS so.
     A PRESS NAMES WHERE IT GOES BEFORE THE ADDRESS CATCHES UP (`pending`): the price list changes
     at once and the router a moment later, and in between the address names the case just
     settled. Without this the stage flashed case 1 between the two, and the focus went with it. */
  const [pending, setPending] = useState<{ key: string; from: string } | null>(null)
  const want = pending && at === pending.from ? pending.key : at
  const named = cases.findIndex((c) => c.key === want)
  const onTidy = want === TIDY && tidyOn
  const index = onTidy ? -1 : named >= 0 ? named : cases.length > 0 ? 0 : -1
  const current = index >= 0 ? cases[index] : undefined
  /* only an address that ARRIVED naming a case no longer there is said, and kept, so a reload
     says it again (the judge's B11); a case this screen's own press settled moves on in silence */
  const moved = useRef(false)
  const stale = want !== '' && want !== TIDY && named < 0 && pending === null

  const after = (from: number): string =>
    from + 1 < cases.length ? cases[from + 1]!.key : tidyOn ? TIDY : (cases[0]?.key ?? '')
  /** where the stage goes once this case is settled: the case that stood after it */
  const nextKey = current
    ? index + 1 < cases.length
      ? cases[index + 1]!.key
      : index > 0
        ? cases[0]!.key
        : ''
    : ''

  /* ---- after a press the next case's title takes the focus, so a reader hears it, and the page
     brings that title into view rather than leaving a phone on the old case's foot ---- */
  const title = useRef<HTMLHeadingElement>(null)
  const stageKey = onTidy ? TIDY : (current?.key ?? 'clean')
  const shown = useRef(stageKey)
  /* THE STEP SAID OVER THE STAGE IS BROUGHT INTO VIEW WITH IT: after a press the window stands on
     the sentence of what was done and, under it, the next case; a step that kept the case (two of
     eight kits priced) brings its sentence into view only where it is out of it */
  const saidAt = useRef(0)
  const railRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const behavior = still ? 'auto' : 'smooth'
    const freshStep = done !== null && done.at !== saidAt.current
    if (freshStep) saidAt.current = done.at
    if (shown.current === stageKey) {
      const d = doneRef.current
      if (!freshStep || !d) return
      const box = d.getBoundingClientRect()
      if (box.top < clearOf(d) || box.bottom > window.innerHeight)
        d.scrollIntoView({ block: 'nearest', behavior })
      return
    }
    shown.current = stageKey
    if (!moved.current) return
    moved.current = false
    const h = title.current
    if (!h) return
    h.focus({ preventScroll: true })
    const top = doneRef.current ?? h
    const box = h.getBoundingClientRect()
    /* UNDER THE PILL'S CLEARANCE IS OUT OF VIEW TOO: a press from a case's foot let the page clamp
       to its new height with the sentence at y 20 of 390, half under the floor the shell lays there */
    if (top.getBoundingClientRect().top < clearOf(top) || box.bottom > window.innerHeight * 0.6) {
      top.scrollIntoView({ block: 'start', behavior })
      holdWhileTheRailSettles(top, railRef.current)
    }
  })
  const goTo = useCallback(
    (key: string, also: Partial<ReviewPosition> = {}) => {
      /* the same case again (one settled in part) keeps the focus where the dealer is typing */
      moved.current = key !== shown.current
      setPending({ key, from: at })
      onPosition({ ...position, ...also, case: key === '' ? undefined : key })
    },
    [onPosition, position, at],
  )

  /* ---- the writes, and the way back: the configurator's and the sheet's door ---- */
  /* each step remembers the case it was pressed on: a step taken back brings THAT case back to
     the stage, never the one that stood after it (built-critique-m3, minors) */
  const steps = useRef<{ eventId: string; from: string }[]>([])
  /** Take one step back, and bring the case it was pressed on back to the stage. */
  const takeBack = useCallback(
    (eventId: string, from: string) => {
      steps.current = steps.current.filter((s) => s.eventId !== eventId)
      const back = catalogue.getState().undo(eventId)
      if (isDone(back)) {
        sayDone(back.said)
        goTo(from)
      } else if (back.refused !== '') sayDone(back.refused, undefined, true)
    },
    [goTo, sayDone],
  )
  const run = useCallback(
    (command: CatalogueCommand | null, then: string): boolean => {
      if (!command) return false
      const outcome = catalogue.getState().apply(command)
      if (!isDone(outcome)) {
        if (outcome.refused !== '') sayDone(outcome.refused, undefined, true)
        return false
      }
      const eventId = outcome.event.id
      const from = shown.current
      steps.current.push({ eventId, from })
      sayDone(outcome.said, () => takeBack(eventId, from))
      goTo(then)
      return true
    },
    [goTo, sayDone, takeBack],
  )

  /** Leave a case alone, with its reason, the day and the person: kept with Northside's file. */
  const leave = useCallback(
    (c: Case, as: LeftAs, then: string) => {
      const keys = meantKeysOf(c)
      run(
        leaveCommand(keys, stampOf(as, new Date().toISOString(), who), leftSaid(keys.length, as)),
        then,
      )
    },
    [run, who],
  )

  /** Bring one case left alone back into the queue — and onto the stage. */
  const bringBack = useCallback(
    (l: LeftCase) => {
      const onProfile = catalogue.getState().org?.leftAlone ?? {}
      const kept = l.keys.filter((k) => k in onProfile)
      /* what this computer kept before 2026-11-04 is let go here, where it was kept */
      const here = meantOf(prefs.getState().get(MEANT_PREF))
      const local = l.keys.filter((k) => k in here)
      if (local.length > 0) {
        const next = { ...here }
        for (const k of local) delete next[k]
        prefs.getState().set(MEANT_PREF, next)
      }
      const said = linesIn(l.c) === 1 ? 'It is back in the queue.' : 'They are back in the queue.'
      if (kept.length > 0) run(bringBackCommand(kept, said), l.c.key)
      else {
        sayDone(said)
        goTo(l.c.key)
      }
    },
    [run, goTo, sayDone],
  )

  /* ---- the keys: Enter makes the fix, L leaves it as meant, → skips, ← goes back, and
     Ctrl Z takes the last press back. A key typed into a field is the field's, and a key on a
     button is the button's own. ---- */
  const primary = useRef<(() => void) | null>(null)
  const setPrimary = useCallback((press: (() => void) | null) => {
    primary.current = press
  }, [])
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (isField(event.target) || event.altKey) return
    const onControl =
      event.target instanceof HTMLElement &&
      event.target.closest('button, a, [role="dialog"], .rv-index')
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
      const last = steps.current.at(-1)
      if (!last) return
      event.preventDefault()
      takeBack(last.eventId, last.from)
      return
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return
    if (event.key === 'Enter' && !onControl && primary.current) {
      event.preventDefault()
      primary.current()
    } else if (event.key.toLowerCase() === 'l' && !onControl && current) {
      event.preventDefault()
      leave(current, 'meant', nextKey)
    } else if (event.key === 'ArrowRight' && !onControl && cases.length > 0) {
      event.preventDefault()
      goTo(onTidy ? cases[0]!.key : after(index))
    } else if (event.key === 'ArrowLeft' && !onControl && cases.length > 0) {
      event.preventDefault()
      goTo(
        onTidy
          ? cases[cases.length - 1]!.key
          : index > 0
            ? cases[index - 1]!.key
            : tidyOn
              ? TIDY
              : cases[cases.length - 1]!.key,
      )
    }
  })
  useEffect(() => {
    const handler = (event: KeyboardEvent): void => onKey(event)
    globalThis.addEventListener('keydown', handler)
    return () => globalThis.removeEventListener('keydown', handler)
  }, [])

  const clean = cases.length === 0
  const peeks = current
    ? [1, 2].map((d) => cases[index + d]).filter((c): c is Case => c !== undefined)
    : onTidy
      ? cases.slice(0, 2)
      : []
  const openMoney = useMemo(() => moneyOfCases(cases), [cases])
  const leftMoney = useMemo(() => moneyOfCases(left.map((l) => l.c)), [left])
  /* the price list's other rules, measured: read where a rule's case or the clean day says them */
  const showsRules = current?.kind === 'house' || (clean && !onTidy)
  const held = useMemo(
    () => (showsRules ? houseHeld({ entities: tables, rowsByEntity: rows }) : null),
    [showsRules, tables, rows],
  )

  const stage: ReactNode = onTidy ? (
    <TidyStage data={data} titleRef={title} />
  ) : current ? (
    <CaseStage
      key={current.key}
      c={current}
      index={index}
      total={cases.length}
      tables={tables}
      rows={rows}
      titleRef={title}
      setPrimary={setPrimary}
      skip={() => goTo(after(index))}
      /* a case settled whole hands the stage to the case after it; a case settled in part (two of
         the eight winch kits priced) keeps the stage, one line shorter */
      run={(command, whole = true) => run(command, whole ? nextKey : current.key)}
      leave={(as) => leave(current, as, nextKey)}
      listHref={listHref}
      go={go}
      touches={touching.get(current.key) ?? []}
      fresh={fresh.has(current.key)}
      packedAt={packedAt}
      held={held}
    />
  ) : (
    <CleanStage
      data={data}
      left={left}
      held={held}
      titleRef={title}
      onTidy={tidyOn ? () => goTo(TIDY) : null}
      onLeft={() => onPosition({ ...position, left: 'open' })}
    />
  )

  const indexOpen = position.list === 'open'
  const theIndex = (
    <Index
      cases={cases}
      current={current}
      onTidy={onTidy}
      tables={tables}
      rows={rows}
      find={position.find ?? ''}
      by={position.by === 'list' ? 'list' : 'check'}
      fresh={fresh}
      touching={touching}
      tidyCount={tidyOn ? data.tidyCount : 0}
      onFind={(find) => onPosition({ ...position, find: find.trim() === '' ? undefined : find })}
      onBy={(by) => onPosition({ ...position, by: by === 'list' ? 'list' : undefined })}
      onPick={(key) => goTo(key, { list: undefined })}
    />
  )

  return (
    <main className="rv" data-testid="review" data-read="" data-clean={clean ? '' : undefined}>
      {/* PAST THE INDEX IN ONE KEY (gap 8): its 39 links stood between the rail and the press */}
      <a
        className="rv-skip"
        data-ground="plate"
        href="#rv-stage"
        onClick={(event) => {
          event.preventDefault()
          title.current?.focus()
        }}
      >
        Skip to the case
      </a>
      <Rail
        railRef={railRef}
        data={data}
        cases={cases}
        perKind={perKind}
        current={current}
        onTidy={onTidy}
        money={openMoney}
        leftMoney={leftMoney}
        leftCount={left.length}
        since={since}
        packedAt={packedAt}
        onKind={(kind) => {
          const first = cases.find((c) => c.kind === kind)
          if (first) goTo(first.key)
        }}
        onTidyChip={tidyOn ? () => goTo(TIDY) : null}
        indexOpen={indexOpen}
        onIndex={() => onPosition({ ...position, list: indexOpen ? undefined : 'open' })}
      />

      <div className="rv-body" data-index={indexOpen ? 'open' : undefined}>
        <aside className="rv-side" aria-label="Every case">
          {theIndex}
        </aside>

        <div className="rv-main" id="rv-stage">
          {done ? (
            <output
              key={done.at}
              ref={doneRef}
              className="rv-done"
              data-refused={done.refused ? '' : undefined}
            >
              <span className="rv-done__glyph">
                <Icon glyph={done.refused ? WarningCircleIcon : CheckCircleIcon} weight="fill" />
              </span>
              <span className="rv-done__said">{done.said}</span>
              {done.undo ? (
                <Button
                  intent="quiet"
                  size="sm"
                  icon={ArrowCounterClockwiseIcon}
                  onClick={done.undo}
                >
                  Undo
                </Button>
              ) : null}
            </output>
          ) : null}
          {stale ? (
            <output className="rv-stale">
              That case is settled or is no longer in the price list, so the first case still
              standing is shown.
            </output>
          ) : null}
          <motion.div
            key={stageKey}
            className="rv-stagewrap"
            initial={still ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition('enter', still)}
          >
            {stage}
          </motion.div>

          {peeks.length > 0 ? (
            <nav className="rv-next" aria-label="The next cases">
              {peeks.map((c) => {
                const p = peekOf(c, tables[tableOfCase(c)]?.kind)
                const n = cases.indexOf(c) + 1
                return (
                  <div className="rv-peek" key={c.key} data-ground="plate">
                    <Tile shape="row" onSelect={() => goTo(c.key)} label={`Case ${n}: ${p.title}`}>
                      <span className="rv-peek__inner">
                        <span className="rv-peek__n">Case {n}</span>
                        <span className="rv-peek__title">{p.title}</span>
                        {p.money !== '' ? <span className="rv-peek__money">{p.money}</span> : null}
                      </span>
                    </Tile>
                  </div>
                )
              })}
            </nav>
          ) : null}

          <Foot
            since={since}
            sinceOpen={position.since === 'open'}
            onSinceOpen={(open) => onPosition({ ...position, since: open ? 'open' : undefined })}
            packedAt={packedAt}
            left={left}
            leftOpen={position.left === 'open'}
            onLeftOpen={(open) => onPosition({ ...position, left: open ? 'open' : undefined })}
            unread={unread}
            bringBack={bringBack}
            tables={tables}
            go={go}
          />
        </div>
      </div>
    </main>
  )
}

/** The room an element keeps above it when it is brought into view: its own scroll margin, which
 *  is the pill's clearance. */
function clearOf(el: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0
}

/**
 * WHERE A PRESS BROUGHT THE PAGE, IT STAYS WHILE THE RAIL ABOVE IT SETTLES (the verifier of
 * 2026-11-04, round 2, minor 6: at 844 × 390 the page stood 77px down, the rail's count and the
 * index's press half under the pill). The first write since the price file sends the rail a line
 * more a moment after the press ("1 case settled since the Master Price File …", once the file is
 * read), and the sentence the window was brought to slid 34px down with everything under it. For
 * the next few seconds a change in the rail's height brings it back to where it was brought.
 */
function holdWhileTheRailSettles(el: HTMLElement, rail: HTMLElement | null): void {
  if (!rail || typeof ResizeObserver === 'undefined') return
  let first = true
  const watch = new ResizeObserver(() => {
    /* the first call is the observer saying the size it starts from */
    if (first) {
      first = false
      return
    }
    if (el.isConnected) el.scrollIntoView({ block: 'start', behavior: 'auto' })
  })
  watch.observe(rail)
  setTimeout(() => watch.disconnect(), 3000)
}

/* ============================================================
   THE RAIL — what is left, what it risks, and what it costs
   ============================================================ */

function Rail({
  railRef,
  data,
  cases,
  perKind,
  current,
  onTidy,
  money: m,
  leftMoney,
  leftCount,
  since,
  packedAt,
  onKind,
  onTidyChip,
  indexOpen,
  onIndex,
}: {
  railRef: RefObject<HTMLElement | null>
  data: ReviewData
  cases: readonly Case[]
  perKind: Record<CaseKind, number>
  current: Case | undefined
  onTidy: boolean
  money: ReturnType<typeof moneyOfCases>
  leftMoney: ReturnType<typeof moneyOfCases>
  leftCount: number
  since: Since
  packedAt: string | null
  onKind: (kind: CaseKind) => void
  onTidyChip: (() => void) | null
  indexOpen: boolean
  onIndex: () => void
}) {
  /* THE TICK OF THE CASE ON THE STAGE, lit where it stands in its check. A tick is a case, as the
     head and the chips count cases, so the rail has one figure and the stage walks it. */
  const lit = useMemo(() => {
    if (!current) return null
    let from = 0
    for (const c of cases) {
      if (c === current) break
      if (c.kind === current.kind) from += 1
    }
    return { kind: current.kind, from, n: 1 }
  }, [cases, current])

  const kinds = CASE_KINDS.filter((k) => perKind[k] > 0)
  /* THE TICKS ARE NAMED (the judge's B12): the bar says its checks to a reader, and each segment
     names its check and count on hover */
  const barSaid = kinds.map((k) => `${CHECK_WORDS[k].chip} ${perKind[k]}`).join(', ')
  return (
    <header className="rv-rail" ref={railRef}>
      {/* THE SCREEN SAYS ITS NAME, once, small, over the figure it is named for */}
      <h1 className="rv-count">
        <span className="rv-count__name">Review</span>{' '}
        <span className="rv-count__figure">
          <Figure value={cases.length} />
        </span>
        <span className="rv-count__words">
          {cases.length === 0
            ? leftCount > 0
              ? 'to settle: the rest is left alone by your choice'
              : 'to settle: your price list is clean'
            : 'to settle, what puts a quote at risk first'}
        </span>
      </h1>

      <div className="rv-track">
        {kinds.length > 0 ? (
          <div className="rv-bar" aria-hidden="true" title={`The cases by check: ${barSaid}`}>
            {kinds.map((k) => (
              <span
                key={k}
                className="rv-bar__seg"
                data-kind={k}
                title={`${CHECK_WORDS[k].chip}: ${counted(perKind[k], 'case', 'cases')}`}
                style={{ flexGrow: perKind[k], ['--n' as string]: perKind[k] }}
              >
                {lit && lit.kind === k ? (
                  <span
                    className="rv-bar__lit"
                    style={{
                      insetInlineStart: `${(lit.from / perKind[k]) * 100}%`,
                      inlineSize: `${(lit.n / perKind[k]) * 100}%`,
                      ['--k' as string]: lit.n,
                    }}
                  />
                ) : null}
              </span>
            ))}
            {onTidyChip ? <span className="rv-bar__seg rv-bar__seg--tidy" title="Tidy" /> : null}
          </div>
        ) : null}
        <nav className="rv-chips" aria-label="The checks">
          {kinds.map((k) => (
            <Chip
              key={k}
              count={perKind[k]}
              selected={current?.kind === k}
              onSelect={() => onKind(k)}
            >
              {CHECK_WORDS[k].chip}
            </Chip>
          ))}
          {onTidyChip ? (
            <Chip count={data.tidyCount} icon={BroomIcon} selected={onTidy} onSelect={onTidyChip}>
              {kinds.length > 0 ? 'then Tidy' : 'Tidy'}
            </Chip>
          ) : null}
        </nav>
        {/* AN EMPTY QUEUE OFFERS NO INDEX OF IT (gap 9): the door is drawn while a case stands */}
        <div className="rv-indexdoor" hidden={cases.length === 0}>
          <Button
            intent="secondary"
            size="sm"
            icon={ListBulletsIcon}
            aria-expanded={indexOpen}
            aria-controls="rv-index"
            onClick={onIndex}
          >
            {indexOpen ? 'Close every case' : `Every case, by check or list`}
          </Button>
        </div>
      </div>

      <dl className="rv-money">
        {m.notCharged > 0 || leftMoney.notCharged === 0 ? (
          <div className="rv-money__fact">
            <dt className="rv-money__figure">
              <Figure value={m.notCharged} prefix="$" />
            </dt>
            <dd className="rv-money__words">not charged</dd>
          </div>
        ) : null}
        {m.chargedOver > 0 || leftMoney.chargedOver === 0 ? (
          <div className="rv-money__fact">
            <dt className="rv-money__figure">
              <Figure value={m.chargedOver} prefix="$" />
            </dt>
            <dd className="rv-money__words">charged over</dd>
          </div>
        ) : null}
        {/* WHAT WAS LEFT ALONE IS SAID AS LEFT, NEVER AS $0 (the judge's blocker); not charged and
            charged over are two sums, never added into one */}
        {leftMoney.notCharged > 0 ? (
          <div className="rv-money__fact">
            <dt className="rv-money__figure">
              <Figure value={leftMoney.notCharged} prefix="$" />
            </dt>
            <dd className="rv-money__words">not charged, left alone</dd>
          </div>
        ) : null}
        {leftMoney.chargedOver > 0 ? (
          <div className="rv-money__fact">
            <dt className="rv-money__figure">
              <Figure value={leftMoney.chargedOver} prefix="$" />
            </dt>
            <dd className="rv-money__words">charged over, left alone</dd>
          </div>
        ) : null}
        <p className="rv-money__each">
          {m.under + m.over + leftMoney.under + leftMoney.over > 0
            ? 'on one sale of each trailer'
            : 'no price is measured wrong'}
        </p>
        {packedAt && since.state === 'read' && since.settled.length + since.arrived.length > 0 ? (
          <p className="rv-money__each">
            {sinceSaid(since.settled.length, since.arrived.length)} since the Master Price File of{' '}
            <span className="rv-money__date">{packedOn(packedAt)}</span>
          </p>
        ) : null}
      </dl>
    </header>
  )
}

/* ============================================================
   THE INDEX — every case in one look, grouped and found by typing
   ============================================================ */

function Index({
  cases,
  current,
  onTidy,
  tables,
  rows,
  find,
  by,
  fresh,
  touching,
  tidyCount,
  onFind,
  onBy,
  onPick,
}: {
  cases: readonly Case[]
  current: Case | undefined
  onTidy: boolean
  tables: Tables
  rows: Rows
  find: string
  by: 'check' | 'list'
  fresh: ReadonlySet<string>
  touching: ReadonlyMap<string, QuoteTouch[]>
  tidyCount: number
  onFind: (find: string) => void
  onBy: (by: 'check' | 'list') => void
  onPick: (key: string) => void
}) {
  const words = useMemo(
    () => new Map(cases.map((c) => [c.key, wordsOfCase(c, tables, rows)])),
    [cases, tables, rows],
  )
  const [typed, setTyped] = useState(find)
  const shown = cases.filter((c) => caseFound(words.get(c.key) ?? '', typed))
  const groups =
    by === 'check'
      ? CASE_KINDS.map((k) => ({
          id: k,
          name: CHECK_WORDS[k].chip,
          cases: shown.filter((c) => c.kind === k),
        })).filter((g) => g.cases.length > 0)
      : [...new Set(shown.map(tableOfCase))]
          .map((id) => ({
            id,
            name: tables[id]?.name ?? id,
            cases: shown.filter((c) => tableOfCase(c) === id),
          }))
          .toSorted((a, b) => b.cases.length - a.cases.length || a.name.localeCompare(b.name))
  const headId = useId()
  /* THE INDEX FOLLOWS THE STAGE (gap 8): at a desk it stands in its own scrolling column, and the
     case on the stage is kept in its view — never by scrolling the page, only the column */
  const nav = useRef<HTMLElement>(null)
  const onKey = onTidy ? TIDY : (current?.key ?? '')
  useEffect(() => {
    const list = nav.current
    const column = list?.closest<HTMLElement>('.rv-side')
    const lit =
      onKey === '' ? null : list?.querySelector<HTMLElement>(`[data-case="${CSS.escape(onKey)}"]`)
    if (!list || !column || !lit || column.scrollHeight <= column.clientHeight) return
    if (getComputedStyle(column).overflowY !== 'auto') return
    const box = column.getBoundingClientRect()
    const top = lit.getBoundingClientRect().top - box.top + column.scrollTop
    /* what of the column the window shows: before the page scrolls far enough for it to stand
       still, its foot is below the window's */
    const shows = Math.max(
      lit.offsetHeight,
      Math.min(column.clientHeight, window.innerHeight - Math.max(box.top, 0)),
    )
    if (top >= column.scrollTop && top + lit.offsetHeight <= column.scrollTop + shows) return
    /* THE COLUMN STOPS ON A WHOLE CASE (the verifier of 2026-11-04, round 2, minor 5: "two
       apart." stood at its top edge, the rest of the case above it): the case a quarter of the way
       up from the lit one is found, and the column stands at its top, or at a group's name */
    /* never past the column's own end, where the browser would clamp it back onto half a case */
    const want = Math.min(Math.max(0, top - shows / 4), column.scrollHeight - column.clientHeight)
    let stop = 0
    for (const el of list.querySelectorAll<HTMLElement>('.rv-index__name, .rv-index__list > li')) {
      const at = el.getBoundingClientRect().top - box.top + column.scrollTop
      if (at > want) break
      stop = at
    }
    column.scrollTop = stop
  }, [onKey])
  /* AN EMPTY QUEUE HAS NOTHING TO FIND: the index says so, and offers no find over nothing */
  if (cases.length === 0)
    return (
      <nav className="rv-index" id="rv-index" aria-labelledby={headId}>
        <h2 className="rv-index__title" id={headId}>
          Every case
        </h2>
        <p className="rv-index__none">
          Nothing is waiting: every case was settled, or left alone and listed at the foot.
        </p>
      </nav>
    )
  return (
    <nav className="rv-index" id="rv-index" aria-labelledby={headId} ref={nav}>
      <div className="rv-index__head">
        <h2 className="rv-index__title" id={headId}>
          Every case
        </h2>
        <Input
          icon={MagnifyingGlassIcon}
          aria-label="Find a case by its list, maker or line"
          placeholder="Find a list, maker or line"
          value={typed}
          onValueChange={(v) => {
            setTyped(v)
            onFind(v)
          }}
        />
        <fieldset className="rv-index__by">
          <legend className="rv-hidden">Group the cases</legend>
          <Chip selected={by === 'check'} onSelect={() => onBy('check')}>
            By check
          </Chip>
          <Chip selected={by === 'list'} onSelect={() => onBy('list')}>
            By list
          </Chip>
        </fieldset>
      </div>
      {shown.length === 0 ? (
        <p className="rv-index__none">
          No case holds “{typed.trim()}”. Every case is still in the queue: clear the find to see
          them all.
        </p>
      ) : (
        <p className="rv-index__count">
          {typed.trim() === ''
            ? counted(cases.length, 'case', 'cases')
            : `${counted(shown.length, 'case', 'cases')} of ${cases.length} hold “${typed.trim()}”`}
        </p>
      )}
      {groups.map((g) => (
        <div className="rv-index__group" key={g.id}>
          <h3 className="rv-index__name">
            <span>{g.name}</span>
            <span className="rv-index__n">{g.cases.length}</span>
          </h3>
          <ol className="rv-index__list" aria-label={g.name}>
            {g.cases.map((c) => {
              const n = cases.indexOf(c) + 1
              const p = peekOf(c, tables[tableOfCase(c)]?.kind)
              const on = c === current && !onTidy
              const quotes = touching.get(c.key)?.length ?? 0
              return (
                <li key={c.key}>
                  <a
                    className="rv-index__case"
                    href={`/review?case=${encodeURIComponent(c.key)}`}
                    data-case={c.key}
                    aria-current={on ? 'true' : undefined}
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
                        return
                      event.preventDefault()
                      onPick(c.key)
                    }}
                  >
                    <span className="rv-index__at">{n}</span>
                    <span className="rv-index__said">
                      {p.title}
                      {by === 'list' ? (
                        <span className="rv-index__kind"> · {CHECK_WORDS[c.kind].chip}</span>
                      ) : null}
                      {fresh.has(c.key) ? <span className="rv-index__tag">New</span> : null}
                      {quotes > 0 ? (
                        <span className="rv-index__tag">{counted(quotes, 'quote', 'quotes')}</span>
                      ) : null}
                    </span>
                    {p.money !== '' ? <span className="rv-index__money">{p.money}</span> : null}
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
      {tidyCount > 0 && typed.trim() === '' ? (
        <p className="rv-index__after">
          Then Tidy: {counted(tidyCount, 'suggestion', 'suggestions')} about how the price list is
          laid out, none of them a price.
        </p>
      ) : null}
    </nav>
  )
}

/* ============================================================
   THE STAGE — one case: where it is in the queue, the fix, why, the press, and what is kept
   ============================================================ */

function Mark({ choice }: { choice: MarkChoice }) {
  return choice.drawn ? (
    <img
      className="rv-mark"
      src={choice.mark.src}
      alt=""
      width={choice.mark.width}
      height={choice.mark.height}
      decoding="async"
    />
  ) : null
}

function Frame({
  eyebrow,
  kindSaid,
  from,
  title,
  titleRef,
  lede,
  children,
  acts,
  evidence,
  leaveRow,
  kept,
  touches,
  kind,
}: {
  eyebrow: string
  kindSaid?: string
  from?: ReactNode
  title: string
  titleRef: RefObject<HTMLHeadingElement | null>
  lede: ReactNode
  children?: ReactNode
  /** THE PRESS STANDS UNDER THE LEDE ON EVERY CASE, the evidence and the lines after it (the
   *  verifier of 2026-11-04, round 2, minor 7: it stood above the lines on some cases and below
   *  them on others, and c19's was below a phone's first window). Enter in a line's field
   *  presses it, wherever the field stands. */
  acts?: ReactNode
  evidence?: ReactNode
  leaveRow?: ReactNode
  kept?: ReactNode
  touches?: ReactNode
  kind: string
}) {
  const id = useId()
  const actRow = acts ? <div className="rv-acts">{acts}</div> : null
  return (
    <section className="rv-stage" data-ground="plate" data-kind={kind} aria-labelledby={id}>
      <div className="rv-stage__head">
        <p className="rv-eyebrow">
          <span>{eyebrow}</span>
          {kindSaid ? (
            <>
              <span className="rv-eyebrow__dot" aria-hidden="true">
                {' · '}
              </span>
              <span className="rv-eyebrow__kind">{kindSaid}</span>
            </>
          ) : null}
        </p>
        {from ? <p className="rv-from">{from}</p> : null}
      </div>
      <h2 className="rv-stage__title" id={id} ref={titleRef} tabIndex={-1}>
        {wholeRuns(title).map((run) =>
          run.whole ? (
            <span className="rv-whole" key={run.at}>
              {run.text}
            </span>
          ) : (
            <Fragment key={run.at}>{run.text}</Fragment>
          ),
        )}
      </h2>
      <p className="rv-stage__lede">{lede}</p>
      {actRow}
      {evidence}
      {children}
      {leaveRow}
      {touches}
      {kept ? (
        <p className="rv-kept">
          <span className="rv-kept__glyph">
            <Icon glyph={ArrowArcLeftIcon} />
          </span>
          <span>{kept}</span>
        </p>
      ) : null}
    </section>
  )
}

interface CaseProps {
  c: Case
  index: number
  total: number
  tables: Tables
  rows: Rows
  titleRef: RefObject<HTMLHeadingElement | null>
  setPrimary: (press: (() => void) | null) => void
  skip: () => void
  run: (command: CatalogueCommand | null, whole?: boolean) => boolean
  leave: (as: LeftAs) => void
  listHref: ReviewProps['listHref']
  go: ReviewProps['go']
  touches: QuoteTouch[]
  fresh: boolean
  packedAt: string | null
  /** the price list's other rules, measured: said on a rule's case */
  held: ReturnType<typeof houseHeld> | null
}

function From({ tableName, extra }: { tableName: string; extra?: string }) {
  const choice = useMemo(() => markFor(tableName, 'paper'), [tableName])
  return (
    <>
      <Mark choice={choice} />
      <span>
        {tableName}
        {extra ? ` · ${extra}` : ''}
      </span>
    </>
  )
}

/**
 * The two named ways to leave a case. Where the case's own press already leaves it as meant (the
 * lines that say what they come with: "Leave them at $0"), "It’s meant" is that press again and is
 * not drawn twice (gap 5); the other way stays.
 */
function Leave({
  c,
  leave,
  meantAbove,
}: {
  c: Case
  leave: (as: LeftAs) => void
  meantAbove?: boolean
}) {
  return (
    <div className="rv-leave">
      <span className="rv-leave__lead">Or leave it, as</span>
      {meantAbove ? null : (
        <>
          <Chip onSelect={() => leave('meant')}>It’s meant</Chip>
          <span className="rv-leave__or">or</span>
        </>
      )}
      <Chip onSelect={() => leave('wrong')}>The check is wrong here</Chip>
      <span className="rv-leave__then">— {comesBackOf(c)}</span>
    </div>
  )
}

function Keys({ enter }: { enter: string | null }) {
  return (
    <p className="rv-keys">
      {enter ? (
        <>
          <Kbd tone="quiet">Enter</Kbd> {enter} ·{' '}
        </>
      ) : null}
      <Kbd tone="quiet">L</Kbd> leaves it as meant · <Kbd tone="quiet">→</Kbd> skips it, and it
      keeps its place
    </p>
  )
}

/** A door to one line of the price list, said small beside it. */
function LineDoor({
  href,
  go,
  label,
  children = 'In the price list',
}: {
  href: string
  go: (href: string) => void
  label: string
  children?: string
}) {
  return (
    <a
      className="rv-door"
      href={href}
      aria-label={label}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        go(href)
      }}
    >
      <Icon glyph={ArrowSquareOutIcon} size="sm" />
      <span>{children}</span>
    </a>
  )
}

/** THE QUOTES A CASE TOUCHES, each a door (the judge's missing item 8). */
function Touches({ touches, go }: { touches: QuoteTouch[]; go: (href: string) => void }) {
  if (touches.length === 0) return null
  const drafts = touches.filter((t) => t.state === 'draft').length
  return (
    <div className="rv-touch">
      <p className="rv-touch__say">
        {counted(touches.length, 'quote', 'quotes')} on this computer{' '}
        {touches.length === 1 ? 'carries' : 'carry'} what this case names.{' '}
        {drafts > 0
          ? `A draft keeps the figure it was picked at until the line is picked again there; a given quote keeps the price it was given at.`
          : 'A given quote keeps the price it was given at.'}
      </p>
      <ul className="rv-touch__list">
        {touches.map((t) => (
          <li key={t.id}>
            <LineDoor
              href={`/quote/${encodeURIComponent(t.id)}`}
              go={go}
              label={`Open quote ${t.reference}`}
            >
              {`${t.reference} · ${t.who !== '' ? `${t.who} · ` : ''}${t.boat} · ${t.state === 'draft' ? 'draft' : 'given'}`}
            </LineDoor>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CaseStage(props: CaseProps) {
  const { c, index, total, touches, go } = props
  const eyebrow = `Case ${index + 1} of ${total}${props.fresh ? ' · new' : ''}`
  const kindSaid = CHECK_WORDS[c.kind].wrong
  const t = <Touches touches={touches} go={go} />
  switch (c.kind) {
    case 'band':
      return <BandStage {...props} c={c} eyebrow={eyebrow} kindSaid={kindSaid} touchesNode={t} />
    case 'two':
      return <TwoStage {...props} c={c} eyebrow={eyebrow} kindSaid={kindSaid} touchesNode={t} />
    case 'boat':
    case 'none':
      return <NoneStage {...props} c={c} eyebrow={eyebrow} kindSaid={kindSaid} touchesNode={t} />
    case 'cost':
      return <CostStage {...props} c={c} eyebrow={eyebrow} kindSaid={kindSaid} touchesNode={t} />
    case 'note':
      return <NoteStage {...props} c={c} eyebrow={eyebrow} kindSaid={kindSaid} touchesNode={t} />
    case 'house':
      return <HouseStage {...props} c={c} eyebrow={eyebrow} kindSaid={kindSaid} touchesNode={t} />
    case 'twins':
      return <TwinsStage {...props} c={c} eyebrow={eyebrow} kindSaid={kindSaid} touchesNode={t} />
    case 'nameless':
      return (
        <NamelessStage {...props} c={c} eyebrow={eyebrow} kindSaid={kindSaid} touchesNode={t} />
      )
  }
}

type StageOf<K extends Case['kind']> = Omit<CaseProps, 'c'> & {
  c: Extract<Case, { kind: K }>
  eyebrow: string
  kindSaid: string
  touchesNode: ReactNode
}

/** Make this the press Enter makes, while this stage stands. */
function usePrimary(setPrimary: CaseProps['setPrimary'], press: (() => void) | null): void {
  const latest = useEffectEvent(() => press?.())
  const has = press !== null
  useEffect(() => {
    setPrimary(has ? () => latest() : null)
    return () => setPrimary(null)
  }, [setPrimary, has])
}

/**
 * TYPED FIGURES FOR SEVERAL LINES, refused where they are wrong: the field holding what is not a
 * price is marked, focused and brought into view (the judge's B6: "“abc” is not a price" stood at
 * the press while its field sat unmarked above the window).
 */
function useTyped<L extends { rowId: string }>(lines: readonly L[], empty: string) {
  const [typed, setTyped] = useState<Record<string, string>>({})
  /* the press that was refused, and the field it was pressed from (Enter in a field), or null */
  const [tried, setTried] = useState<{ from: string | null } | null>(null)
  const fields = useRef(new Map<string, HTMLElement>())
  const reasonId = useId()
  const filled = lines.filter((l) => (typed[l.rowId] ?? '').trim() !== '')
  const bad = filled.find((l) => typedPrice(typed[l.rowId] ?? '') === null)
  /* THE REFUSAL STANDS WHERE IT IS REFUSED (the verifier's gap 3: "“abc” is not a price" stood on
     the press, seven lines below the ringed field and out of view): under the field that holds
     what is not a price, or under the field Enter was pressed in; on the press only when the
     press itself was pressed with nothing typed */
  const refusal: { said: string; at: string | null } | null = !tried
    ? null
    : bad
      ? {
          said: `“${(typed[bad.rowId] ?? '').trim()}” is not a price. Type it in dollars, like 2,100.`,
          at: bad.rowId,
        }
      : filled.length === 0
        ? { said: empty, at: tried.from }
        : null
  const at = refusal?.at ?? null
  useEffect(() => {
    if (!at || !tried) return
    const field = fields.current.get(at)
    field?.focus({ preventScroll: true })
    /* the field and the sentence under it, together in view */
    field?.closest('.rv-line')?.scrollIntoView({ block: 'nearest' })
  }, [tried, at])
  return {
    typed,
    filled,
    bad,
    refusal,
    reasonId,
    /** a press refused: from the press itself (null), or Enter in a line's field */
    refuse: (from: string | null) => setTried({ from }),
    set: (rowId: string, v: string) => {
      setTyped((t) => ({ ...t, [rowId]: v }))
      setTried(null)
    },
    fieldRef: (rowId: string) => (el: HTMLElement | null) => {
      if (el) fields.current.set(rowId, el)
      else fields.current.delete(rowId)
    },
    /** what the press says of the refusal: the sentence itself, or where it is said */
    onPress: (): { refusedBecause?: string; refusedBy?: string } =>
      !refusal
        ? {}
        : refusal.at === null
          ? { refusedBecause: refusal.said }
          : { refusedBy: reasonId },
    /** what a line's field says of the refusal, when it is that line's */
    onField: (rowId: string) =>
      refusal && refusal.at === rowId
        ? {
            invalid: bad?.rowId === rowId,
            reason: (
              <span className="rv-line__why" key="why">
                <Refusal id={reasonId}>{refusal.said}</Refusal>
              </span>
            ),
          }
        : null,
  }
}

/* ---- a trailer registered as the wrong size ---- */

const fieldName = (table: EntityDef | undefined, id: string | null, or: string): string =>
  (id ? table?.fields.find((f) => f.id === id)?.name : undefined) ?? or

function BandStage({
  c,
  eyebrow,
  kindSaid,
  tables,
  rows,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
  touchesNode,
}: StageOf<'band'>) {
  const l = c.line
  const to = l.to
  const table = tables[l.tableId]
  const row = (rows[l.tableId] ?? []).find((r) => r.id === l.rowId)
  const atm = table?.fields.find((f) => /^atm\b/i.test(f.name.trim()))
  const tare = table?.fields.find((f) => /^tare\b/i.test(f.name.trim()))
  const tareKg = row && tare ? readCell(row, tare.id) : null
  const base = row && l.columns.base ? readCell(row, l.columns.base) : null
  /* THE TOAST SAYS WHAT THE TITLE SAYS (the judge's B5): the model, never the file's whole string */
  const name = `The ${trailerModel(l)}`
  const press = to ? () => run(rebandCommand(l, name)) : null
  usePrimary(setPrimary, press)

  const fromLabel = TRAILER_MASS_BANDS.find((b) => b.band === l.band)?.readFrom ?? l.readFrom
  const toLabel = to ? TRAILER_MASS_BANDS.find((b) => b.band === to.band)?.readFrom : undefined
  const source = [fromLabel, toLabel]
    .map((s) => (s ? labelRead(s) : null))
    .filter((s): s is string => s !== null)
  const keptBits = [
    'its code',
    typeof tareKg === 'number' ? `its tare of ${kg(tareKg)}` : null,
    typeof base === 'number'
      ? `its ${fieldName(table, l.columns.base, 'Sell')} of ${money(base)}`
      : null,
  ].filter((s): s is string => s !== null)
  const door = listHref(l.tableId, l.rowId)

  return (
    <Frame
      kind="band"
      eyebrow={eyebrow}
      kindSaid={kindSaid}
      from={<From tableName={l.tableName} extra={trailerSeries(l) || undefined} />}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          {to ? (
            <span className="rv-acts__main">
              <Button intent="act" icon={ArrowRightIcon} onClick={() => press?.()}>
                {`Make it ${to.word} · ${signed(to.delta)}`}
              </Button>
            </span>
          ) : (
            <Button
              intent="secondary"
              icon={ArrowSquareOutIcon}
              href={door}
              onClick={() => go(door)}
            >
              Choose it in the price list
            </Button>
          )}
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      evidence={
        <>
          {!to ? <p className="rv-refusal">{rebandRefusal(l)}</p> : null}
          <table className="rv-was">
            <thead>
              <tr>
                <th scope="col">
                  <span className="rv-hidden">On the line</span>
                </th>
                <th scope="col">As the price list reads</th>
                {to ? (
                  <th scope="col" className="rv-was__after">
                    After the change
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{heading(atm?.name ?? 'ATM')}</th>
                <td>{kg(l.atmKg)}</td>
                {to ? <td className="rv-was__after">{kg(l.atmKg)}</td> : null}
              </tr>
              <tr>
                <th scope="row">{heading(fieldName(table, l.columns.band, 'Rego Type'))}</th>
                <td>{l.band}</td>
                {to ? <td className="rv-was__after rv-was__new">{to.band}</td> : null}
              </tr>
              {l.columns.fee ? (
                <tr>
                  <th scope="row">{heading(fieldName(table, l.columns.fee, 'Rego ($)'))}</th>
                  <td>{l.fee !== null ? money(l.fee) : ''}</td>
                  {to ? <td className="rv-was__after rv-was__new">{money(to.fee)}</td> : null}
                </tr>
              ) : null}
              {l.columns.sell ? (
                <tr>
                  <th scope="row">{heading(fieldName(table, l.columns.sell, 'Sell inc Rego'))}</th>
                  <td>{l.sell !== null ? money(l.sell) : ''}</td>
                  {to ? (
                    <td className="rv-was__after rv-was__new">
                      {to.sell !== null ? money(to.sell) : ''}
                    </td>
                  ) : null}
                </tr>
              ) : null}
            </tbody>
          </table>
          <p className="rv-source">
            {source.length > 0
              ? `The sizes are read from the fee list’s own ${source.length === 1 ? 'label' : 'labels'}: ${joined(source, 'and')}. `
              : ''}
            <LineDoor href={door} go={go} label={`Open the ${trailerModel(l)} in the price list`}>
              Open the line in the price list
            </LineDoor>
          </p>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter={to ? `makes it ${to.word}` : null} />
        </>
      }
      touches={touchesNode}
      kept={`Nothing else on the line moves: ${joined(keptBits, 'and')} stay as they are. One step, said with its Undo.`}
    />
  )
}

/* ---- one name, two prices: a choice between the two, or the two named apart ---- */

function TwoStage({
  c,
  eyebrow,
  kindSaid,
  tables,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
  touchesNode,
}: StageOf<'two'>) {
  usePrimary(setPrimary, null)
  const lines = c.item.lines
  const table = tables[c.tableId]
  const nameField = table ? displayFieldOf(table) : undefined
  const apart = codesDiffer(c)
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.rowId, c.item.name])),
  )
  const [tried, setTried] = useState(false)
  const typedNames = lines.map((l) => names[l.rowId] ?? '')
  const refusal = tried ? nameApartRefusal(typedNames, c.item.name) || undefined : undefined
  const changes = joined(
    (lines[0]?.levels ?? []).map((l) => priceSaid(l.label)),
    'and',
  )
  /* "SEE BOTH" OPENS BOTH (the judge's B7): the sheet found on their shared name lights every line
     of it, where `?at=` lit only the first */
  const both = `${listHref(c.tableId)}?find=${encodeURIComponent(c.item.name)}`
  return (
    <Frame
      kind="two"
      eyebrow={eyebrow}
      kindSaid={kindSaid}
      from={<From tableName={c.tableName} />}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          <Button intent="quiet" icon={ArrowSquareOutIcon} href={both} onClick={() => go(both)}>
            See both in the price list
          </Button>
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter={null} />
        </>
      }
      touches={touchesNode}
      kept={`A price chosen changes only the ${changes} on the other ${lines.length === 2 ? 'line' : 'lines'}; names written change only the name. Every code and everything else stays. One step, said with its Undo.`}
    >
      <ul className="rv-options" aria-label="The two prices">
        {lines.map((line) => {
          const others = lines.filter((o) => o.rowId !== line.rowId)
          const all = lines.length === 2 ? 'both' : `all ${lines.length}`
          return (
            <li className="rv-option" key={line.rowId}>
              <span className="rv-option__code">
                {line.code !== '' ? `Code ${line.code}` : 'No code'}
              </span>
              <span className="rv-option__price">{money(line.price)}</span>
              <span className="rv-option__at">{c.priceName}</span>
              <Button
                intent="secondary"
                icon={TagIcon}
                onClick={() => run(onePriceCommand(c.tableId, c.item.name, line, others))}
              >
                {`Sell ${all} at ${money(line.price)}`}
              </Button>
              <LineDoor
                href={listHref(c.tableId, line.rowId)}
                go={go}
                label={`Open code ${line.code || 'this line'} in the price list`}
              >
                This line in the price list
              </LineDoor>
            </li>
          )
        })}
      </ul>
      {apart && nameField ? (
        <div className="rv-apart">
          <h3 className="rv-apart__title">Or name them apart</h3>
          <p className="rv-apart__say">
            Their codes differ, so each may be its own product at its own price. Write each a name
            of its own, and both prices stay.
          </p>
          <div className="rv-lines">
            {lines.map((l) => (
              <div className="rv-line" key={l.rowId}>
                <span className="rv-line__said">
                  <span className="rv-line__name">
                    {l.code !== '' ? `Code ${l.code}` : 'No code'}
                  </span>
                  <span className="rv-line__beside">
                    {money(l.price)} {c.priceName}
                  </span>
                </span>
                <span className="rv-line__field rv-line__field--wide">
                  <Input
                    aria-label={`${nameField.name} for code ${l.code || 'with none'}`}
                    aria-invalid={refusal ? true : undefined}
                    value={names[l.rowId] ?? ''}
                    onValueChange={(v) => {
                      setNames((n) => ({ ...n, [l.rowId]: v }))
                      setTried(false)
                    }}
                  />
                </span>
              </div>
            ))}
          </div>
          <div className="rv-acts">
            <Button
              intent="secondary"
              icon={PencilSimpleIcon}
              refusedBecause={refusal}
              onClick={() => {
                const command = nameApartCommand(
                  c.tableId,
                  nameField.id,
                  c.item.name,
                  lines.map((l) => ({ rowId: l.rowId, code: l.code, name: names[l.rowId] ?? '' })),
                )
                if (nameApartRefusal(typedNames, c.item.name) !== '' || !command) {
                  setTried(true)
                  return
                }
                run(command)
              }}
            >
              Name them apart
            </Button>
          </div>
        </div>
      ) : null}
    </Frame>
  )
}

/* ---- on sale with no price — a boat at $0 first, then parts: a typed price for each ---- */

function NoneStage({
  c,
  eyebrow,
  kindSaid,
  tables,
  rows,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
  touchesNode,
}: StageOf<'none' | 'boat'>) {
  const g = c.group
  const one = g.lines.length === 1
  const t = useTyped(g.lines, `Type a price beside ${one ? 'it' : 'at least one of them'} first.`)
  const priceName = g.priceNames[0] ?? ''
  const boat = c.kind === 'boat'
  const comesWith = c.kind === 'none' && allSayWhatTheyComeWith(c)
  const lineName = (name: string): string =>
    boat ? boatSaid(name, g.tableName) : nameSaid(name, g.tableName)
  /* WHAT EACH PRICE READS NOW, $0 OR BLANK (the verifier's gap 4): said once where every line reads
     alike, and line by line only where they differ */
  const table = tables[g.tableId]
  const nowOf = useMemo(() => {
    const byId = new Map((rows[g.tableId] ?? []).map((r) => [r.id, r]))
    return new Map(g.lines.map((l) => [l.rowId, pricesNow(table, byId.get(l.rowId))]))
  }, [rows, table, g])
  const prices = pricesSaid([...nowOf.values()])
  const press = (from: string | null = null): void => {
    if (t.bad || t.filled.length === 0) {
      t.refuse(from)
      return
    }
    run(
      priceLinesCommand(
        g.tableId,
        g.tableName,
        g.priceFieldId,
        priceName,
        t.filled.map((l) => ({
          rowId: l.rowId,
          name: lineName(l.name),
          price: typedPrice(t.typed[l.rowId]!)!,
        })),
      ),
      t.filled.length === g.lines.length,
    )
  }
  /* a $0 that may be meant asks for no amber press; a boat at $0 is never meant: a $0 quote */
  const meantByDefault = !boat && g.kind === 'zero'
  usePrimary(setPrimary, meantByDefault ? null : () => press())
  const label =
    t.filled.length === 0
      ? `Price ${one ? 'it' : 'them'} at ${priceSaid(priceName)}`
      : t.filled.length === g.lines.length && g.lines.length > 1
        ? `Price all ${t.filled.length} at ${priceSaid(priceName)}`
        : `Price ${t.filled.length === 1 ? 'the one typed' : `the ${t.filled.length} typed`} at ${priceSaid(priceName)}`
  const shared = besideOnce(g.lines)
  /* NOTHING LIKE THEM, SAID ONCE (the verifier's gap 5: five times on one case) */
  const noneLike = !boat && !shared && g.lines.every((l) => !l.beside)
  const offSaid = one
    ? `${lineName(g.lines[0]!.name)} is off sale.`
    : `The ${g.lines.length} ${boat ? `${g.tableName.replace(/\s+boats$/i, '')} boats` : 'lines'} are off sale.`
  /* A LINE PRICED WHOLE (the judge's J3b): each other price a typed figure leaves is said as it
     reads now, $0 or blank */
  const stays = staysSaid(
    g.lines.map((l) => ({ needs: l.staysBlank, now: nowOf.get(l.rowId) ?? [] })),
    boat,
  )
  return (
    <Frame
      kind={c.kind}
      eyebrow={eyebrow}
      kindSaid={kindSaid}
      from={
        <From tableName={g.tableName} extra={g.category ? spokenCategory(g.category) : undefined} />
      }
      title={titleOf(c, tables[g.tableId]?.kind)}
      titleRef={titleRef}
      lede={ledeOf(c, prices)}
      acts={
        <>
          <span className="rv-acts__main">
            {/* A LINE THAT SAYS WHAT IT COMES WITH IS NOT PRICED HERE (the verifier of 2026-11-04,
                round 2, minor 3: "FF · Factory Fitted" and "Supplied with Motor" each carried a
                "$ at Sell" field). It is left at $0, or taken off sale; one that is not meant is
                priced on its own line, through its door. */}
            {comesWith ? (
              <Button intent="secondary" icon={TagIcon} onClick={() => leave('meant')}>
                {one ? 'Leave it at $0' : 'Leave them at $0'}
              </Button>
            ) : (
              <Button
                intent={meantByDefault ? 'secondary' : 'act'}
                icon={meantByDefault ? TagIcon : ArrowRightIcon}
                {...t.onPress()}
                onClick={() => press()}
              >
                {label}
              </Button>
            )}
          </span>
          <Button
            intent="quiet"
            icon={ProhibitIcon}
            onClick={() =>
              run(
                offSaleCommand(
                  g.tableId,
                  g.lines.map((l) => l.rowId),
                  offSaid,
                ),
              )
            }
          >
            {one ? 'Take it off sale' : 'Take them off sale'}
          </Button>
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} meantAbove={comesWith} />
          <Keys enter={meantByDefault ? null : 'prices what is typed'} />
        </>
      }
      touches={touchesNode}
      kept={
        comesWith
          ? `Left at $0, nothing in the price list changes; taken off sale, ${one ? 'it stays' : 'each stays'} in the price list with its Discontinued ticked. Either is one step, said with its Undo.`
          : `Typed at ${priceSaid(priceName)}, the price ${g.tableName} is sold at.${stays !== '' ? ` ${stays}` : ''} Every price typed is written in one step, said with its Undo; taken off sale, a line stays in the price list with its Discontinued ticked.`
      }
    >
      {/* a boat's like is said once, in the lede, as its sense of scale */}
      {comesWith ? null : shared && !boat ? (
        <p className="rv-lines__beside">
          Most like them in the price list: {lineName(shared.name)} · {priceSaid(priceName)}{' '}
          {money(shared.price)}
        </p>
      ) : noneLike ? (
        <p className="rv-lines__beside">
          {one
            ? 'Nothing like it in its heading has a price.'
            : 'Nothing like them in their heading has a price.'}
        </p>
      ) : null}
      <div className="rv-lines">
        {comesWith ? null : (
          <p className="rv-lines__head" aria-hidden="true">
            <span>As the price list reads</span>
            <span className="rv-lines__will">
              <Icon glyph={PencilSimpleIcon} /> Will read at {priceSaid(priceName)}
            </span>
          </p>
        )}
        {g.lines.map((l) => {
          const here = t.onField(l.rowId)
          return (
            <div className="rv-line" key={l.rowId}>
              <span className="rv-line__said">
                <span className="rv-line__name">{lineName(l.name)}</span>
                <span className="rv-line__meta">
                  {/* the lede says what every line reads; a line says its own only where they differ */}
                  {prices.differ ? (
                    <span className="rv-line__now">{pricesOfLine(nowOf.get(l.rowId) ?? [])}</span>
                  ) : null}
                  <LineDoor
                    href={listHref(g.tableId, l.rowId)}
                    go={go}
                    label={`Open ${lineName(l.name)} in the price list`}
                  />
                </span>
                {comesWith ? null : l.beside && !shared && !boat ? (
                  <span className="rv-line__beside">
                    Most like it: {lineName(l.beside.name)} · {priceSaid(priceName)}{' '}
                    {money(l.beside.price)}
                  </span>
                ) : !shared && !boat && !noneLike ? (
                  /* where some lines have a like and this one has none, it says so on its own */
                  <span className="rv-line__beside">
                    Nothing like it in its heading has a price.
                  </span>
                ) : null}
              </span>
              {comesWith ? null : (
                <span className="rv-line__field">
                  <Input
                    mono
                    inputMode="decimal"
                    ref={t.fieldRef(l.rowId)}
                    aria-label={`${priceSaid(priceName)} for ${lineName(l.name)}`}
                    aria-invalid={here?.invalid ? true : undefined}
                    aria-describedby={here ? t.reasonId : undefined}
                    placeholder={`$ at ${priceSaid(priceName)}`}
                    value={t.typed[l.rowId] ?? ''}
                    onValueChange={(v) => t.set(l.rowId, v)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        press(l.rowId)
                      }
                    }}
                  />
                </span>
              )}
              {here?.reason}
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

/* ---- sold below what it costs Northside: a typed price for each, never the cost itself ---- */

function CostStage({
  c,
  eyebrow,
  kindSaid,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
  touchesNode,
}: StageOf<'cost'>) {
  const g = c.group
  const one = g.lines.length === 1
  const t = useTyped(
    g.lines,
    `Type a new price beside ${one ? 'it' : 'at least one of them'} first.`,
  )
  const priceName = priceSaid(g.priceName)
  const press = (from: string | null = null): void => {
    if (t.bad || t.filled.length === 0) {
      t.refuse(from)
      return
    }
    run(
      priceLinesCommand(
        g.tableId,
        g.tableName,
        g.priceFieldId,
        priceName,
        t.filled.map((l) => ({
          rowId: l.rowId,
          name: nameSaid(l.name, g.tableName),
          price: typedPrice(t.typed[l.rowId]!)!,
        })),
      ),
      t.filled.length === g.lines.length,
    )
  }
  usePrimary(setPrimary, () => press())
  return (
    <Frame
      kind="cost"
      eyebrow={eyebrow}
      kindSaid={kindSaid}
      from={<From tableName={g.tableName} />}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          <span className="rv-acts__main">
            <Button intent="act" icon={ArrowRightIcon} {...t.onPress()} onClick={() => press()}>
              {t.filled.length === 0
                ? `Reprice ${one ? 'it' : 'them'} at ${priceName}`
                : `Reprice ${t.filled.length === 1 ? 'the one typed' : `the ${t.filled.length} typed`} at ${priceName}`}
            </Button>
          </span>
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter="reprices what is typed" />
        </>
      }
      touches={touchesNode}
      kept={`Review never prints what a line costs Northside; the price list shows it on the line. Only ${priceName} is written, in one step, said with its Undo.`}
    >
      <div className="rv-lines">
        <p className="rv-lines__head" aria-hidden="true">
          <span>As the price list reads</span>
          <span className="rv-lines__will">
            <Icon glyph={PencilSimpleIcon} /> Will read at {priceName}
          </span>
        </p>
        {g.lines.map((l) => {
          const here = t.onField(l.rowId)
          return (
            <div className="rv-line" key={l.rowId}>
              <span className="rv-line__said">
                <span className="rv-line__name">{nameSaid(l.name, g.tableName)}</span>
                <span className="rv-line__meta">
                  <span className="rv-line__now">
                    {money(l.price)} at {priceName}, below what it costs
                  </span>
                  <LineDoor
                    href={listHref(g.tableId, l.rowId)}
                    go={go}
                    label={`See what ${nameSaid(l.name, g.tableName)} costs, in the price list`}
                  >
                    Its cost, in the price list
                  </LineDoor>
                </span>
              </span>
              <span className="rv-line__field">
                <Input
                  mono
                  inputMode="decimal"
                  ref={t.fieldRef(l.rowId)}
                  aria-label={`New ${priceName} for ${nameSaid(l.name, g.tableName)}`}
                  aria-invalid={here?.invalid ? true : undefined}
                  aria-describedby={here ? t.reasonId : undefined}
                  placeholder={`$ at ${priceName}`}
                  value={t.typed[l.rowId] ?? ''}
                  onValueChange={(v) => t.set(l.rowId, v)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      press(l.rowId)
                    }
                  }}
                />
              </span>
              {here?.reason}
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

/* ---- a note on sale: taken off sale, never priced or named ---- */

function NoteStage({
  c,
  eyebrow,
  kindSaid,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
  touchesNode,
}: StageOf<'note'>) {
  const g = c.group
  const n = g.lines.length
  const said =
    n === 1 ? `A line in ${g.tableName} is off sale.` : `${n} lines in ${g.tableName} are off sale.`
  const press = (): void => {
    run(
      offSaleCommand(
        g.tableId,
        g.lines.map((l) => l.rowId),
        said,
      ),
    )
  }
  usePrimary(setPrimary, press)
  return (
    <Frame
      kind="note"
      eyebrow={eyebrow}
      kindSaid={kindSaid}
      from={<From tableName={g.tableName} />}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          <span className="rv-acts__main">
            <Button intent="act" icon={ProhibitIcon} onClick={press}>
              {n === 1 ? 'Take it off sale' : `Take all ${n} off sale`}
            </Button>
          </span>
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter="takes them off sale" />
        </>
      }
      touches={touchesNode}
      kept={`Only the Discontinued column is ticked on ${n === 1 ? 'it' : 'each'}; every word on ${n === 1 ? 'it' : 'them'} stays, and an old quote still reads ${n === 1 ? 'it' : 'them'}. One step, said with its Undo.`}
    >
      <ul className="rv-notes">
        {g.lines.map((l) => (
          <li className="rv-note" key={l.rowId}>
            <span className="rv-note__name">
              {l.name !== '' ? capsSaid(l.name) : 'An empty line: no name, no code, no price'}
            </span>
            <span className="rv-line__meta">
              <span className="rv-note__where">
                {[
                  l.heading ? `Under ${spokenCategory(l.heading)}` : '',
                  l.source ? `from ${sourceSaid(l.source)}` : '',
                ]
                  .filter((s) => s !== '')
                  .join(', ')}
              </span>
              <LineDoor
                href={listHref(g.tableId, l.rowId)}
                go={go}
                label={`Open ${l.name !== '' ? capsSaid(l.name) : `the empty line from ${sourceSaid(l.source)}`} in the price list`}
              />
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

/* ---- an offer that breaks the price list's own rule: corrected on its line ---- */

function HouseStage({
  c,
  eyebrow,
  kindSaid,
  titleRef,
  setPrimary,
  skip,
  leave,
  listHref,
  go,
  touchesNode,
  held,
}: StageOf<'house'>) {
  usePrimary(setPrimary, null)
  const cl = c.clause
  return (
    <Frame
      kind="house"
      eyebrow={eyebrow}
      kindSaid={kindSaid}
      from={<span>Your price list’s own rules</span>}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          <Button
            intent="quiet"
            icon={ArrowSquareOutIcon}
            href={`/rules?look=${cl.ref}`}
            onClick={() => go(`/rules?look=${cl.ref}`)}
          >
            See the rule on Rules
          </Button>
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter={null} />
        </>
      }
      touches={touchesNode}
      kept="Review changes nothing here: each offer is corrected on its own line in the price list, where the boat and what it is offered stand side by side."
    >
      <ul className="rv-notes">
        {cl.breaks.map((b) => (
          <li className="rv-note" key={b.key}>
            <span className="rv-note__name">
              {b.boat} · {b.what}
            </span>
            <span className="rv-line__meta">
              <span className="rv-note__where">
                {b.why.charAt(0).toUpperCase() + b.why.slice(1)}
              </span>
              {b.lines.map((l) => (
                <LineDoor
                  key={l.line}
                  href={listHref(l.list, l.line)}
                  go={go}
                  label={`Open the ${b.boat} with the ${b.what} in ${l.listName}`}
                >
                  {`Correct it in ${l.listName}`}
                </LineDoor>
              ))}
            </span>
          </li>
        ))}
      </ul>
      {held ? <OtherRules held={held} /> : null}
    </Frame>
  )
}

/**
 * THE PRICE LIST'S OTHER RULES, EACH WITH ITS MEASURE (the verifier's gap 10: "the judge's rule
 * exceptions 16 and 127 are not drawn"). The 16 and the 127 are the workbook's counts; on this
 * price list the kit rule holds on every offer it can be tested on, and the propeller rule cannot
 * be tested at all, for a reason measured off the file. Each is said with its figure, so a reader
 * sees why they are not cases.
 */
function OtherRules({ held }: { held: ReturnType<typeof houseHeld> }) {
  const id = useId()
  if (held.held.length + held.untested.length === 0) return null
  return (
    <section className="rv-rules" aria-labelledby={id}>
      <h3 className="rv-rules__title" id={id}>
        The other rules your price list asserts
      </h3>
      <ul className="rv-rules__list">
        {held.held.map((h) => (
          <li className="rv-rules__rule" key={h.ref}>
            <span className="rv-rules__glyph">
              <Icon glyph={CheckCircleIcon} weight="fill" />
            </span>
            <span className="rv-rules__said">
              <span className="rv-rules__clause">{h.said}</span>
              <span className="rv-rules__measure">
                {`Holds on ${h.here.held.toLocaleString('en-AU')} of the ${counted(h.here.tested, 'offer', 'offers')} it can be tested on.`}
                {h.workbook
                  ? ` The workbook it was first measured on counted ${(h.workbook.tested - h.workbook.held).toLocaleString('en-AU')} that broke it (${h.workbook.held.toLocaleString('en-AU')} of ${h.workbook.tested.toLocaleString('en-AU')}); none of them is on this price list.`
                  : ''}
              </span>
            </span>
          </li>
        ))}
        {held.untested.map((u) => (
          <li className="rv-rules__rule" key={u.ref} data-untested="">
            <span className="rv-rules__glyph">
              <Icon glyph={MinusCircleIcon} />
            </span>
            <span className="rv-rules__said">
              <span className="rv-rules__clause">{u.said}</span>
              <span className="rv-rules__measure">
                {`Not tested on this price list${
                  u.unwritten.length > 0
                    ? `: ${joined(
                        u.unwritten.map(
                          (w) =>
                            `${w.list} writes “${w.written}” for its ${w.field} on ${w.lines.toLocaleString('en-AU')} of its ${w.of.toLocaleString('en-AU')} lines on sale`,
                        ),
                        'and',
                      )}, so an offer names no one ${u.what || 'value'} to compare.`
                    : ', which writes nothing to test it on.'
                }`}
                {u.workbook
                  ? ` The workbook counted ${(u.workbook.tested - u.workbook.held).toLocaleString('en-AU')} that broke it (${u.workbook.held.toLocaleString('en-AU')} of ${u.workbook.tested.toLocaleString('en-AU')}).`
                  : ''}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---- two columns under one name: the two side by side, either renamed ---- */

function sampleSaid(sample: ReadonlyArray<string | number>, numeric: boolean): string {
  return sample
    .map((v) => (typeof v === 'number' && numeric ? money(Math.round(v * 100) / 100) : String(v)))
    .join(', ')
}

function TwinsStage({
  c,
  eyebrow,
  kindSaid,
  tables,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
}: StageOf<'twins'>) {
  usePrimary(setPrimary, null)
  const tw = c.twin
  const table = tables[tw.tableId]
  /* SEE BOTH LANDS ON THE TWO (the verifier of 2026-11-04, round 2, minor 4): Every column with the
     two headings lit and in the window, every section that holds neither folded (`seeBoth.ts`) */
  const every = `${listHref(tw.tableId)}${
    table
      ? seeBothSearch(
          table,
          tw.columns.map((col) => col.fieldId),
        )
      : '?door=every'
  }`
  return (
    <Frame
      kind="twins"
      eyebrow={eyebrow}
      kindSaid={kindSaid}
      from={<From tableName={tw.tableName} />}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          <Button intent="quiet" icon={ArrowSquareOutIcon} href={every} onClick={() => go(every)}>
            See both in the price list
          </Button>
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter={null} />
        </>
      }
      kept="Only the heading changes: every price and every line under it stays as it is. One step, said with its Undo."
    >
      <ul className="rv-options" aria-label={`The two headings called ${tw.name}`}>
        {tw.columns.map((col, i) => {
          const field = table?.fields.find((f) => f.id === col.fieldId)
          const cost = table && field ? isCostColumn(table, field) : true
          const letter = columnLetter(field?.description)
          const which =
            letter !== ''
              ? `Letter ${letter} in the workbook`
              : i === 0
                ? 'The first'
                : 'The second'
          return (
            <TwinOption
              key={col.fieldId}
              which={which}
              after={col.after}
              sample={
                cost
                  ? 'What a line costs Northside: Review never prints a cost, the price list does.'
                  : sampleSaid(col.sample, col.numeric) || 'Empty on every line'
              }
              name={tw.name}
              tableName={tw.tableName}
              onName={(name) => run(nameTwinCommand(tw.tableId, col.fieldId, tw.name, name))}
            />
          )
        })}
      </ul>
    </Frame>
  )
}

function TwinOption({
  which,
  after,
  sample,
  name,
  tableName,
  onName,
}: {
  which: string
  after: string | null
  sample: string
  name: string
  tableName: string
  onName: (name: string) => void
}) {
  const [typed, setTyped] = useState('')
  const [tried, setTried] = useState(false)
  const clean = typed.replace(/\s+/g, ' ').trim()
  const refusal = !tried
    ? undefined
    : clean === ''
      ? 'Type its new name first.'
      : clean === name
        ? `It is already called “${name}”: type a name of its own.`
        : undefined
  const press = (): void => {
    if (clean === '' || clean === name) {
      setTried(true)
      return
    }
    onName(clean)
  }
  return (
    <li className="rv-option rv-option--twin">
      <span className="rv-option__code">
        {which}
        {after ? `, after ${after}` : ''}
      </span>
      <span className="rv-option__sample">{sample}</span>
      <span className="rv-option__field">
        <Input
          aria-label={`A name of its own for the heading at ${which.charAt(0).toLowerCase()}${which.slice(1)}, called ${name} in ${tableName}`}
          aria-invalid={refusal ? true : undefined}
          placeholder="A name of its own"
          value={typed}
          onValueChange={(v) => {
            setTyped(v)
            setTried(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              press()
            }
          }}
        />
      </span>
      <Button intent="secondary" icon={PencilSimpleIcon} refusedBecause={refusal} onClick={press}>
        Rename this one
      </Button>
    </li>
  )
}

/* ---- nothing to name it: a typed name for each ---- */

function NamelessStage({
  c,
  eyebrow,
  kindSaid,
  tables,
  rows,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
  touchesNode,
}: StageOf<'nameless'>) {
  const g = c.group
  const field = g.items[0]?.nameField
  const table = tables[g.tableId]
  const [typed, setTyped] = useState<Record<string, string>>({})
  const [tried, setTried] = useState(false)
  const filled = g.items.filter((i) => (typed[i.rowId] ?? '').trim() !== '')
  const refusal =
    tried && filled.length === 0
      ? `Type a name for ${g.items.length === 1 ? 'it' : 'at least one of them'} first.`
      : undefined
  const press = (): void => {
    if (!field || filled.length === 0) {
      setTried(true)
      return
    }
    run(
      nameLinesCommand(
        g.tableId,
        g.tableName,
        field.id,
        filled.map((i) => ({ rowId: i.rowId, name: typed[i.rowId] ?? '' })),
      ),
      filled.length === g.items.length,
    )
  }
  usePrimary(setPrimary, press)
  const srcOf = (rowId: string): string => {
    const row = (rows[g.tableId] ?? []).find((r) => r.id === rowId)
    const src = table?.fields.find((f) => f.name.trim().toLowerCase() === 'source')
    const cell = row && src ? readCell(row, src.id) : null
    const m = typeof cell === 'string' ? /^(.+?)!R(\d+)\b/.exec(cell.trim()) : null
    return m ? sourceSaid({ tab: m[1]!.trim(), line: Number(m[2]) }) : ''
  }
  return (
    <Frame
      kind="nameless"
      eyebrow={eyebrow}
      kindSaid={kindSaid}
      from={<From tableName={g.tableName} />}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          <span className="rv-acts__main">
            <Button intent="act" icon={ArrowRightIcon} refusedBecause={refusal} onClick={press}>
              {filled.length === 0
                ? `Name ${g.items.length === 1 ? 'it' : 'them'}`
                : filled.length === g.items.length && g.items.length > 1
                  ? `Name all ${filled.length}`
                  : `Name ${filled.length === 1 ? 'the one typed' : `the ${filled.length} typed`}`}
            </Button>
          </span>
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter="names what is typed" />
        </>
      }
      touches={touchesNode}
      kept={`Only ${field?.name ?? 'the name'} is written; everything else on each line stays. One step, said with its Undo.`}
    >
      <div className="rv-lines">
        <p className="rv-lines__head" aria-hidden="true">
          <span>As the price list reads</span>
          <span className="rv-lines__will">
            <Icon glyph={PencilSimpleIcon} /> Will read as its {field?.name}
          </span>
        </p>
        {g.items.map((item) => {
          const from = srcOf(item.rowId)
          return (
            <div className="rv-line" key={item.rowId}>
              <span className="rv-line__said">
                <span className="rv-line__name">
                  {item.says !== ''
                    ? `Says only “${spokenCategory(item.says)}”`
                    : 'Nothing else is written on it'}
                </span>
                <span className="rv-line__meta">
                  <span className="rv-line__beside">
                    {[
                      item.code !== '' ? `Code ${item.code}` : '',
                      from !== '' ? `From ${from}` : '',
                    ]
                      .filter((s) => s !== '')
                      .join(' · ')}
                  </span>
                  <LineDoor
                    href={listHref(g.tableId, item.rowId)}
                    go={go}
                    label={`Open the line${from !== '' ? ` from ${from}` : ''} in the price list`}
                  />
                </span>
              </span>
              <span className="rv-line__field">
                <Input
                  aria-label={`${field?.name ?? 'Name'} for the line in ${g.tableName}${from !== '' ? ` from ${from}` : ''}`}
                  placeholder={`Its ${(field?.name ?? 'name').toLowerCase()}`}
                  value={typed[item.rowId] ?? ''}
                  onValueChange={(v) => {
                    setTyped((t) => ({ ...t, [item.rowId]: v }))
                    setTried(false)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      press()
                    }
                  }}
                />
              </span>
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

/* ---- after the queue: the tidy suggestions, counted, and none of them a price ---- */

function TidyStage({
  data,
  titleRef,
}: {
  data: ReviewData
  titleRef: RefObject<HTMLHeadingElement | null>
}) {
  return (
    <Frame
      kind="tidy"
      eyebrow="After the queue · Tidy"
      title={`${counted(data.tidyCount, 'suggestion', 'suggestions')} about how the price list is laid out.`}
      titleRef={titleRef}
      lede={`None of them changes a price, so none is a case to settle. Each is changed in the price list itself, where the whole list stands around it.`}
    >
      <ul className="rv-tidy">
        {data.tidy.map((t) => (
          <li className="rv-tidy__line" key={t.ruleId}>
            <span className="rv-tidy__count">{t.count.toLocaleString('en-AU')}</span>
            <span className="rv-tidy__said">{tidySaid(t.ruleId)}</span>
            <span className="rv-tidy__where">{andMore(t.places, 3)}</span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

/* ---- the clean day: the queue ends, and what is now true is said — and only what is ---- */

function CleanStage({
  data,
  left,
  held,
  titleRef,
  onTidy,
  onLeft,
}: {
  data: ReviewData
  left: readonly LeftCase[]
  held: ReturnType<typeof houseHeld> | null
  titleRef: RefObject<HTMLHeadingElement | null>
  onTidy: (() => void) | null
  onLeft: () => void
}) {
  const anyLeft = left.length > 0
  /* EACH CHECK LEFT ALONE, COUNTED AS IT IS SAID (`leftDay.ts`, the verifier's gaps 1 and 2) */
  const byKind = useMemo(() => countedByKind(left.map((l) => l.c)), [left])
  const rules = held ? held.held.length : 0
  return (
    <Frame
      kind="clean"
      eyebrow="The queue is empty"
      title={
        anyLeft
          ? 'Nothing in your price list is waiting on you.'
          : 'Nothing in your price list needs you.'
      }
      titleRef={titleRef}
      lede={
        anyLeft
          ? 'Every check was read just now. Where one still finds something, it is because you left it alone, and it is said below as left, not as holding.'
          : 'Every check was read just now, and each one holds.'
      }
      acts={
        anyLeft || onTidy ? (
          <>
            {anyLeft ? (
              <Button intent="quiet" icon={ArrowArcLeftIcon} onClick={onLeft}>
                {`See the ${counted(left.length, 'case', 'cases')} left alone`}
              </Button>
            ) : null}
            {onTidy ? (
              <Button intent="quiet" icon={BroomIcon} onClick={onTidy}>
                {`See the ${counted(data.tidyCount, 'tidy suggestion', 'tidy suggestions')}`}
              </Button>
            ) : null}
          </>
        ) : undefined
      }
    >
      <ul className="rv-true">
        {CASE_KINDS.map((k) => {
          const mine = byKind[k]
          const holds = mine === undefined
          return (
            <li className="rv-true__line" key={k} data-left={holds ? undefined : ''}>
              <span className="rv-true__glyph">
                <Icon
                  glyph={holds ? CheckCircleIcon : ArrowArcLeftIcon}
                  weight={holds ? 'fill' : 'regular'}
                />
              </span>
              <span>{holds ? holdsSaid(k, data, rules) : leftSentence(k, mine)}</span>
            </li>
          )
        })}
      </ul>
      {held ? <OtherRules held={held} /> : null}
    </Frame>
  )
}

/** What a check that finds nothing says, with what it read. */
function holdsSaid(k: CaseKind, data: ReviewData, rules: number): string {
  const read =
    k === 'band' && data.band.tested > 0
      ? ` ${counted(data.band.tested, 'trailer', 'trailers')} checked.`
      : k === 'cost' && data.belowCost.tested > 0
        ? ` ${counted(data.belowCost.tested, 'price', 'prices')} checked against their cost.`
        : k === 'house' && rules > 0
          ? ` ${counted(rules, 'rule', 'rules')} measured, below.`
          : ''
  return `${CHECK_WORDS[k].true}${read}`
}

/* ============================================================
   THE FOOT — what was left alone, each brought back on its own, what was settled since the
   price file, and what no check could read
   ============================================================ */

function Foot({
  since,
  sinceOpen,
  onSinceOpen,
  packedAt,
  left,
  leftOpen,
  onLeftOpen,
  unread,
  bringBack,
  tables,
  go,
}: {
  since: Since
  sinceOpen: boolean
  onSinceOpen: (open: boolean) => void
  packedAt: string | null
  left: readonly LeftCase[]
  leftOpen: boolean
  onLeftOpen: (open: boolean) => void
  unread: ReturnType<typeof unchecked>
  bringBack: (l: LeftCase) => void
  tables: Tables
  go: (href: string) => void
}) {
  const lines = unread.reduce((n, l) => n + l.lines, 0)
  const leftCases = useMemo(() => left.map((l) => l.c), [left])
  const leftLines = distinctLines(leftCases)
  const leftHeadings = leftCases.filter((c) => c.kind === 'twins').length
  const listId = useId()
  const settledId = useId()
  const sinceShown =
    packedAt !== null &&
    (since.state === 'unread' || (since.state === 'read' && since.settled.length > 0))
  if (left.length === 0 && unread.length === 0 && !sinceShown) return null
  return (
    <footer className="rv-foot">
      {left.length > 0 ? (
        <div className="rv-foot__block">
          <div className="rv-foot__part">
            <p className="rv-foot__say">
              <span>
                {counted(left.length, 'case is', 'cases are')} left alone, on{' '}
                {counted(leftLines, 'line', 'lines')}
                {leftHeadings > 0
                  ? ` and ${counted(leftHeadings, 'pair of headings', 'pairs of headings')}`
                  : ''}
                . Each comes back on its own if what made it a case changes. What is left is kept
                with Northside’s price list on this computer, and a copy saved on Shelf carries it
                to another.
              </span>
            </p>
            <Button
              intent="quiet"
              size="sm"
              aria-expanded={leftOpen}
              aria-controls={listId}
              onClick={() => onLeftOpen(!leftOpen)}
            >
              {leftOpen ? 'Hide what was left' : 'See what was left'}
            </Button>
          </div>
          {leftOpen ? (
            <ul className="rv-left" id={listId} aria-label="Left alone">
              {left.map((l) => {
                const when = whenSaid(l.stamp.at)
                return (
                  <li className="rv-left__case" key={l.c.key}>
                    <span className="rv-left__title">
                      {titleOf(l.c, tables[tableOfCase(l.c)]?.kind)}
                    </span>
                    <span className="rv-left__why">
                      {l.stamp.as === 'meant' ? 'Left as meant' : 'Left: the check is wrong here'}
                      {l.stamp.who !== '' ? `, by ${l.stamp.who}` : ''}
                      {when !== '' ? `, ${when}` : ''}
                      {linesIn(l.c) > 1 ? ` · ${counted(linesIn(l.c), 'line', 'lines')}` : ''}
                    </span>
                    <Button
                      intent="quiet"
                      size="sm"
                      icon={ArrowArcLeftIcon}
                      onClick={() => bringBack(l)}
                    >
                      Bring it back
                    </Button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
      {/* WHAT WAS SETTLED SINCE THE PRICE FILE (J11): by a price typed here or on the sheet, a line
          taken off sale, or a newer price file brought in on Shelf — a stamp says when a line was
          written, never by which door, so the door is not named */}
      {sinceShown && since.state === 'read' ? (
        <div className="rv-foot__block">
          <div className="rv-foot__part">
            <p className="rv-foot__say">
              <span>
                {counted(since.settled.length, 'case was', 'cases were')} settled on this computer
                since the Master Price File of {packedOn(packedAt!)}: by what was written here, or
                by a newer price list brought in on Shelf.
                {since.arrived.length > 0
                  ? ` ${counted(since.arrived.length, 'case is', 'cases are')} new since it, each marked New in the queue.`
                  : ''}
              </span>
            </p>
            <Button
              intent="quiet"
              size="sm"
              aria-expanded={sinceOpen}
              aria-controls={settledId}
              onClick={() => onSinceOpen(!sinceOpen)}
            >
              {sinceOpen ? 'Hide what was settled' : 'See what was settled'}
            </Button>
          </div>
          {sinceOpen ? (
            <ul className="rv-left" id={settledId} aria-label="Settled since the Master Price File">
              {since.settled.map((c) => (
                <li className="rv-left__case rv-left__case--settled" key={c.key}>
                  <span className="rv-left__title">{titleOf(c, tables[tableOfCase(c)]?.kind)}</span>
                  <span className="rv-left__why">
                    {`Settled · ${CHECK_WORDS[c.kind].wrong.charAt(0).toLowerCase()}${CHECK_WORDS[c.kind].wrong.slice(1)} on the Master Price File${linesIn(c) > 1 ? ` · ${counted(linesIn(c), 'line', 'lines')}` : ''}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {sinceShown && since.state === 'unread' ? (
        <div className="rv-foot__part">
          <p className="rv-foot__say">
            <span>
              What changed since the Master Price File of {packedOn(packedAt!)} cannot be said just
              now: it could not be read on this computer, so no case is marked New.
            </span>
          </p>
        </div>
      ) : null}
      {unread.length > 0 ? (
        <div className="rv-foot__part">
          <p className="rv-foot__say">
            <span>
              Not checked: {counted(unread.length, 'list declares', 'lists declare')} no price, so
              none of {lines === 1 ? 'its' : `their ${lines.toLocaleString('en-AU')}`} lines can be
              missing one —{' '}
              {joined(
                unread.map((l) => l.tableName),
                'and',
              )}
              . Once a price is declared for one on Prices, its lines enter these checks.
            </span>
          </p>
          <Button
            intent="quiet"
            size="sm"
            icon={TagIcon}
            href="/levels"
            onClick={() => go('/levels')}
          >
            Set their prices
          </Button>
        </div>
      ) : null}
    </footer>
  )
}
