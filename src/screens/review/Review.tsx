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
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BroomIcon,
  CheckCircleIcon,
  FileTextIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  ProhibitIcon,
  SkipForwardIcon,
  TagIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Chip,
  Figure,
  Icon,
  Input,
  Kbd,
  Tile,
  isField,
  say,
  transition,
  undo,
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
import { quotesTouching, type QuoteTouch } from '@/domain/rules/review/touching'
import { caseFound, wordsOfCase, writtenSince } from '@/domain/rules/review/finding'
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
  meantOf,
  nameSaid,
  peekOf,
  priceSaid,
  signed,
  sourceSaid,
  spokenCategory,
  titleOf,
  trailerModel,
  trailerSeries,
  whenSaid,
  wholeRuns,
  type LeftAs,
} from './read'
import { useLeftAlone } from './left'
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
   whom, each brought back on its own. What is left alone is kept with Northside's file
   (`OrgProfile.leftAlone`), so every desk sees one queue.

   EVERY PRESS IS THE PRICE LIST'S OWN CHANGE, through the catalogue's command door: one step,
   said in a toast with its Undo, and Ctrl Z takes the last one back here. Leaving a case alone
   is a step too. Each act says only what is true of it.

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
}

export interface ReviewProps {
  position: ReviewPosition
  onPosition: (next: ReviewPosition) => void
  /** the price list at one of its lines: its address, and the press that goes there */
  listHref: (tableId: string, at?: string) => string
  go: (href: string) => void
  /** where a computer with no copy of the price list goes to load one */
  openTheFile: () => void
}

const STEP_TOAST = 'review-step'

type Tables = Readonly<Record<string, EntityDef>>
type Rows = Readonly<Record<string, readonly RowData[]>>

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

function Queue({ data, unread, tables, rows, position, onPosition, listHref, go }: QueueProps) {
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

  /* WHAT EACH CASE TOUCHES, AND WHAT IS NEW: the quotes carrying its lines, and whether a line it
     stands on was written after the price file was packed */
  const touching = useMemo(() => quotesTouching(cases, quoteList), [cases, quoteList])
  const provenance = provenanceOfSheet(version)
  const packedAt = provenance.known ? provenance.file.packedAt : null
  const fresh = useMemo(() => {
    const out = new Set<string>()
    if (packedAt) for (const c of cases) if (writtenSince(c, rows, packedAt)) out.add(c.key)
    return out
  }, [cases, rows, packedAt])

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
  useEffect(() => {
    if (shown.current === stageKey) return
    shown.current = stageKey
    if (!moved.current) return
    moved.current = false
    const h = title.current
    if (!h) return
    h.focus({ preventScroll: true })
    const box = h.getBoundingClientRect()
    if (box.top < 0 || box.bottom > window.innerHeight * 0.6)
      h.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' })
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
  const run = useCallback(
    (command: CatalogueCommand | null, then: string): boolean => {
      if (!command) return false
      const outcome = catalogue.getState().apply(command)
      if (!isDone(outcome)) {
        if (outcome.refused !== '') say(outcome.refused, { id: STEP_TOAST })
        return false
      }
      const eventId = outcome.event.id
      const from = shown.current
      steps.current.push({ eventId, from })
      undo(
        outcome.said,
        () => {
          steps.current = steps.current.filter((s) => s.eventId !== eventId)
          const back = catalogue.getState().undo(eventId)
          if (isDone(back)) {
            say(back.said, { id: STEP_TOAST })
            goTo(from)
          } else if (back.refused !== '') say(back.refused, { id: STEP_TOAST })
        },
        { id: STEP_TOAST },
      )
      goTo(then)
      return true
    },
    [goTo],
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
        say(said, { id: STEP_TOAST })
        goTo(l.c.key)
      }
    },
    [run, goTo],
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
      const last = steps.current.pop()
      if (!last) return
      event.preventDefault()
      const back = catalogue.getState().undo(last.eventId)
      if (isDone(back)) {
        say(back.said, { id: STEP_TOAST })
        goTo(last.from)
      } else if (back.refused !== '') say(back.refused, { id: STEP_TOAST })
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
    />
  ) : (
    <CleanStage
      data={data}
      left={left}
      leftMoney={leftMoney}
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
      <Rail
        data={data}
        cases={cases}
        perKind={perKind}
        current={current}
        onTidy={onTidy}
        money={openMoney}
        leftMoney={leftMoney}
        leftCount={left.length}
        fresh={fresh.size}
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

        <div className="rv-main">
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

/* ============================================================
   THE RAIL — what is left, what it risks, and what it costs
   ============================================================ */

function Rail({
  data,
  cases,
  perKind,
  current,
  onTidy,
  money: m,
  leftMoney,
  leftCount,
  fresh,
  packedAt,
  onKind,
  onTidyChip,
  indexOpen,
  onIndex,
}: {
  data: ReviewData
  cases: readonly Case[]
  perKind: Record<CaseKind, number>
  current: Case | undefined
  onTidy: boolean
  money: ReturnType<typeof moneyOfCases>
  leftMoney: ReturnType<typeof moneyOfCases>
  leftCount: number
  fresh: number
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
    <header className="rv-rail">
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
        <div className="rv-indexdoor">
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
        {fresh > 0 && packedAt ? (
          <p className="rv-money__each">
            {counted(fresh, 'case stands', 'cases stand')} on lines written since the price file of{' '}
            {packedOn(packedAt)}
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
    <nav className="rv-index" id="rv-index" aria-labelledby={headId}>
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
  actsFirst,
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
  acts?: ReactNode
  /** the press stands right under the lede, the evidence after it (the trailer: one press) */
  actsFirst?: boolean
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
      {actsFirst ? actRow : null}
      {evidence}
      {children}
      {actsFirst ? null : actRow}
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

function Leave({
  c,
  leave,
  meantFirst,
}: {
  c: Case
  leave: (as: LeftAs) => void
  meantFirst?: boolean
}) {
  return (
    <div className="rv-leave">
      <span className="rv-leave__lead">{meantFirst ? 'Or leave it, as' : 'Or leave it, as'}</span>
      <Chip onSelect={() => leave('meant')}>It’s meant</Chip>
      <span className="rv-leave__or">or</span>
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
function useTyped<L extends { rowId: string }>(lines: readonly L[]) {
  const [typed, setTyped] = useState<Record<string, string>>({})
  const [tried, setTried] = useState(false)
  const fields = useRef(new Map<string, HTMLElement>())
  const filled = lines.filter((l) => (typed[l.rowId] ?? '').trim() !== '')
  const bad = filled.find((l) => typedPrice(typed[l.rowId] ?? '') === null)
  useEffect(() => {
    if (!tried || !bad) return
    const field = fields.current.get(bad.rowId)
    field?.focus({ preventScroll: true })
    field?.scrollIntoView({ block: 'center' })
  }, [tried, bad])
  return {
    typed,
    tried,
    filled,
    bad,
    setTried,
    set: (rowId: string, v: string) => {
      setTyped((t) => ({ ...t, [rowId]: v }))
      setTried(false)
    },
    fieldRef: (rowId: string) => (el: HTMLElement | null) => {
      if (el) fields.current.set(rowId, el)
      else fields.current.delete(rowId)
    },
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
      actsFirst
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
                  lines.map((l) => ({ rowId: l.rowId, name: names[l.rowId] ?? '' })),
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
  const t = useTyped(g.lines)
  const priceName = g.priceNames[0] ?? ''
  const boat = c.kind === 'boat'
  const comesWith = c.kind === 'none' && allSayWhatTheyComeWith(c)
  const lineName = (name: string): string =>
    boat ? boatSaid(name, g.tableName) : nameSaid(name, g.tableName)
  const refusal = !t.tried
    ? undefined
    : t.bad
      ? `“${(t.typed[t.bad.rowId] ?? '').trim()}” is not a price. Type it in dollars, like 2,100.`
      : t.filled.length === 0
        ? `Type a price beside ${g.lines.length === 1 ? 'it' : 'at least one of them'} first.`
        : undefined
  const press = (): void => {
    if (t.bad || t.filled.length === 0) {
      t.setTried(true)
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
  usePrimary(setPrimary, meantByDefault ? null : press)
  const label =
    t.filled.length === 0
      ? `Price ${g.lines.length === 1 ? 'it' : 'them'} at ${priceSaid(priceName)}`
      : t.filled.length === g.lines.length && g.lines.length > 1
        ? `Price all ${t.filled.length} at ${priceSaid(priceName)}`
        : `Price ${t.filled.length === 1 ? 'the one typed' : `the ${t.filled.length} typed`} at ${priceSaid(priceName)}`
  const shared = besideOnce(g.lines)
  /* A LINE PRICED WHOLE (the judge's J3b): the other prices a typed figure leaves blank are said,
     never "stays as it is" */
  const blankAfter = [...new Set(g.lines.flatMap((l) => l.staysBlank))]
  const withBlank = g.lines.filter((l) => l.staysBlank.length > 0).length
  const offSaid =
    g.lines.length === 1
      ? `${lineName(g.lines[0]!.name)} is off sale.`
      : `The ${g.lines.length} ${boat ? `${g.tableName.replace(/\s+boats$/i, '')} boats` : 'lines'} are off sale.`
  const keptBlank =
    blankAfter.length === 0
      ? ''
      : boat
        ? ` ${joined(blankAfter, 'and')} stay $0 until they are set on the line in the price list.`
        : ` ${withBlank === g.lines.length ? (g.lines.length === 1 ? 'Its' : 'Each one’s') : `${withBlank} of them carry an install type, and each one’s`} ${joined(blankAfter.map(priceSaid), 'and')} stays blank until it is set on its line in the price list.`
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
      lede={ledeOf(c)}
      acts={
        <>
          <span className="rv-acts__main">
            {comesWith ? (
              <Button intent="secondary" icon={TagIcon} onClick={() => leave('meant')}>
                {g.lines.length === 1 ? 'Leave it at $0' : 'Leave them at $0'}
              </Button>
            ) : null}
            <Button
              intent={meantByDefault ? 'secondary' : 'act'}
              icon={meantByDefault ? TagIcon : ArrowRightIcon}
              refusedBecause={refusal}
              onClick={press}
            >
              {label}
            </Button>
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
            {g.lines.length === 1 ? 'Take it off sale' : 'Take them off sale'}
          </Button>
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter={meantByDefault ? null : 'prices what is typed'} />
        </>
      }
      touches={touchesNode}
      kept={`Typed at ${priceSaid(priceName)}, the price ${g.tableName} is sold at.${keptBlank} Every price typed is written in one step, said with its Undo; taken off sale, a line stays in the price list with its Discontinued ticked.`}
    >
      {/* a boat's like is said once, in the lede, as its sense of scale */}
      {shared && !boat ? (
        <p className="rv-lines__beside">
          Most like them in the price list: {lineName(shared.name)} · {priceSaid(priceName)}{' '}
          {money(shared.price)}
        </p>
      ) : null}
      <div className="rv-lines">
        <p className="rv-lines__head" aria-hidden="true">
          <span>As the price list reads</span>
          <span className="rv-lines__will">
            <Icon glyph={PencilSimpleIcon} /> Will read at {priceSaid(priceName)}
          </span>
        </p>
        {g.lines.map((l) => {
          const wrong = t.tried && t.bad?.rowId === l.rowId
          return (
            <div className="rv-line" key={l.rowId}>
              <span className="rv-line__said">
                <span className="rv-line__name">{lineName(l.name)}</span>
                <span className="rv-line__meta">
                  <span className="rv-line__now">
                    {g.kind === 'zero' ? `$0 at ${priceSaid(priceName)}` : 'No price'}
                    {l.staysBlank.length > 0 && !boat
                      ? ` · its ${joined(l.staysBlank.map(priceSaid), 'and')} stays blank`
                      : ''}
                  </span>
                  <LineDoor
                    href={listHref(g.tableId, l.rowId)}
                    go={go}
                    label={`Open ${lineName(l.name)} in the price list`}
                  />
                </span>
                {l.beside && !shared ? (
                  <span className="rv-line__beside">
                    Most like it: {lineName(l.beside.name)} · {priceSaid(priceName)}{' '}
                    {money(l.beside.price)}
                  </span>
                ) : !shared && !boat ? (
                  <span className="rv-line__beside">
                    Nothing like it in its heading has a price.
                  </span>
                ) : null}
              </span>
              <span className="rv-line__field">
                <Input
                  mono
                  inputMode="decimal"
                  ref={t.fieldRef(l.rowId)}
                  aria-label={`${priceSaid(priceName)} for ${lineName(l.name)}`}
                  aria-invalid={wrong ? true : undefined}
                  placeholder={`$ at ${priceSaid(priceName)}`}
                  value={t.typed[l.rowId] ?? ''}
                  onValueChange={(v) => t.set(l.rowId, v)}
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
  const t = useTyped(g.lines)
  const priceName = priceSaid(g.priceName)
  const refusal = !t.tried
    ? undefined
    : t.bad
      ? `“${(t.typed[t.bad.rowId] ?? '').trim()}” is not a price. Type it in dollars, like 2,100.`
      : t.filled.length === 0
        ? `Type a new price beside ${g.lines.length === 1 ? 'it' : 'at least one of them'} first.`
        : undefined
  const press = (): void => {
    if (t.bad || t.filled.length === 0) {
      t.setTried(true)
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
  usePrimary(setPrimary, press)
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
            <Button intent="act" icon={ArrowRightIcon} refusedBecause={refusal} onClick={press}>
              {t.filled.length === 0
                ? `Reprice ${g.lines.length === 1 ? 'it' : 'them'} at ${priceName}`
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
        {g.lines.map((l) => (
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
                aria-invalid={t.tried && t.bad?.rowId === l.rowId ? true : undefined}
                placeholder={`$ at ${priceName}`}
                value={t.typed[l.rowId] ?? ''}
                onValueChange={(v) => t.set(l.rowId, v)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    press()
                  }
                }}
              />
            </span>
          </div>
        ))}
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
    </Frame>
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
  const every = `${listHref(tw.tableId)}?door=every`
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

function leftSentence(kind: CaseKind, cases: readonly LeftCase[], notCharged: number): string {
  const lines = cases.reduce((n, l) => n + linesIn(l.c), 0)
  const by = 'left alone by your choice'
  switch (kind) {
    case 'band':
      return `${counted(lines, 'trailer is', 'trailers are')} still registered as the wrong size, ${by}${notCharged > 0 ? `: ${notCharged.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 })} on one sale of each, not charged` : ''}.`
    case 'boat':
      return `${counted(lines, 'boat is', 'boats are')} still on sale at $0, ${by}.`
    case 'none':
      return `${counted(lines, 'line is', 'lines are')} still on sale with no price, ${by}.`
    case 'cost':
      return `${counted(lines, 'line still sells below its cost', 'lines still sell below their cost')}, ${by}.`
    case 'two':
      return `${counted(lines, 'name is', 'names are')} still at two prices, ${by}.`
    case 'note':
      return `${counted(lines, 'note is', 'notes are')} still on sale, ${by}.`
    case 'house':
      return `${counted(lines, 'offer still breaks', 'offers still break')} a rule your price list asserts, ${by}.`
    case 'twins':
      return `${counted(lines, 'pair of headings still shares', 'pairs of headings still share')} a name, ${by}.`
    case 'nameless':
      return `${counted(lines, 'line is', 'lines are')} still on sale with no name, ${by}.`
  }
}

function CleanStage({
  data,
  left,
  leftMoney,
  titleRef,
  onTidy,
  onLeft,
}: {
  data: ReviewData
  left: readonly LeftCase[]
  leftMoney: ReturnType<typeof moneyOfCases>
  titleRef: RefObject<HTMLHeadingElement | null>
  onTidy: (() => void) | null
  onLeft: () => void
}) {
  const anyLeft = left.length > 0
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
          const mine = left.filter((l) => l.c.kind === k)
          const held = mine.length === 0
          return (
            <li className="rv-true__line" key={k} data-left={held ? undefined : ''}>
              <span className="rv-true__glyph">
                <Icon
                  glyph={held ? CheckCircleIcon : ArrowArcLeftIcon}
                  weight={held ? 'fill' : 'regular'}
                />
              </span>
              <span>
                {held
                  ? `${CHECK_WORDS[k].true}${k === 'band' && data.band.tested > 0 ? ` ${counted(data.band.tested, 'trailer', 'trailers')} checked.` : k === 'cost' && data.belowCost.tested > 0 ? ` ${counted(data.belowCost.tested, 'price', 'prices')} checked against their cost.` : ''}`
                  : leftSentence(k, mine, k === 'band' ? leftMoney.notCharged : 0)}
              </span>
            </li>
          )
        })}
      </ul>
    </Frame>
  )
}

/* ============================================================
   THE FOOT — what was left alone, each brought back on its own, and what no check could read
   ============================================================ */

function Foot({
  left,
  leftOpen,
  onLeftOpen,
  unread,
  bringBack,
  tables,
  go,
}: {
  left: readonly LeftCase[]
  leftOpen: boolean
  onLeftOpen: (open: boolean) => void
  unread: ReturnType<typeof unchecked>
  bringBack: (l: LeftCase) => void
  tables: Tables
  go: (href: string) => void
}) {
  const lines = unread.reduce((n, l) => n + l.lines, 0)
  const leftLines = left.reduce((n, l) => n + linesIn(l.c), 0)
  const listId = useId()
  if (left.length === 0 && unread.length === 0) return null
  return (
    <footer className="rv-foot">
      {left.length > 0 ? (
        <div className="rv-foot__block">
          <div className="rv-foot__part">
            <p className="rv-foot__say">
              <span>
                {counted(left.length, 'case is', 'cases are')} left alone, on{' '}
                {counted(leftLines, 'line', 'lines')}. Each comes back on its own if what made it a
                case changes, and is kept with Northside’s price list, so every desk sees the same
                queue.
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
