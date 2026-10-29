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
  PencilSimpleIcon,
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
import { useCatalogue, usePrefs } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { isCostColumn } from '@/domain/quote/pricing'
import { money } from '@/domain/money'
import { readCell, type EntityDef, type RowData } from '@/domain/model'
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
  meantKeysOf,
  queueOf,
  type Case,
  type CaseKind,
} from '@/domain/rules/review/cases'
import {
  nameLinesCommand,
  nameTwinCommand,
  onePriceCommand,
  priceLinesCommand,
  rebandCommand,
  rebandRefusal,
  typedPrice,
} from '@/domain/rules/review/fixes'
import { markFor, type MarkChoice } from '@/screens/home/ledgers'
import {
  CHECK_WORDS,
  MEANT_PREF,
  TIDY,
  andMore,
  comesBackOf,
  counted,
  joined,
  kg,
  ledeOf,
  leftSaid,
  makerTyped,
  meantOf,
  nameSaid,
  peekOf,
  signed,
  spokenCategory,
  titleOf,
  trailerSaid,
  trailerSeries,
  heading,
  labelRead,
  besideOnce,
  wholeRuns,
  type LeftAs,
} from './read'
import './review.css'

/* ============================================================
   REVIEW — direction E, "The case queue", of docs/directions/review-boards/ (judged
   2026-10-28), with D's editable proposal and grouped acceptance grafted on and the verdict's
   must-change made.

   WHAT IS WRONG IN NORTHSIDE'S OWN PRICE LIST, ONE CASE AT A TIME. A rail counts the cases
   still to settle — 37 on the file as it stands, in five checks, Tidy dashed after them — with
   the money they cost on the right; the stage's "Case 1 of 37" is the same figure. Under it, one stage holds one case: the fix as its title, the
   file's own cells as they read and as they will, and one press. The cases after it wait
   beneath. The queue is ordered by what each costs, most money first, and it ENDS: its last
   case is the clean day, which says what is now true.

   A CASE IS ONE FIX, NOT ONE LINE (the verdict's must-change, `cases.ts`). The 46 lines on
   sale with no price are 18 cases, so the 8 Lone Star winch kits are priced in one: each line
   with the priced line beside it in the price list, a field to type its price into, and one
   press that writes every price typed. Where $0 may be meant (a trailer plug "Std Factory
   Fit"), or where the act is a choice between two named options (one name at two prices, two
   under one name), no option is made amber.

   EVERY PRESS IS THE PRICE LIST'S OWN CHANGE, through the catalogue's command door: one step,
   said in a toast with its Undo, and Ctrl Z takes the last one back here. NEVER "KEPT IN
   HISTORY" (built-critique-m3-2.md, major 3): History reads the quotes' diaries, and the price
   list's steps are kept for this sitting only (`EVENTS_KEPT`, src/state/catalogue.ts), so the
   promise that History keeps them was false. Each act says only what is true of it.
   LEFT ALONE, IT COMES BACK: keyed on what it names and the value that made it a finding
   (`checks.ts`), kept on this computer with its reason, and brought back from the foot.

   A POSITION IS THE ADDRESS: `?case=` names the case on the stage (the route's own comment).
   ============================================================ */

export interface ReviewProps {
  /** the case on the stage by its key, `tidy` for the tidy suggestions, '' for the first */
  at: string
  onAt: (key: string) => void
  /** the price list at one of its lines: its address, and the press that goes there */
  listHref: (tableId: string, at?: string) => string
  go: (href: string) => void
  /** where a computer with no copy of the price list goes to load one */
  openTheFile: () => void
}

const STEP_TOAST = 'review-step'

export function Review(props: ReviewProps) {
  const status = useCatalogue((s) => s.status)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const meantPref = usePrefs((s) => s.values[MEANT_PREF])
  const meant = useMemo(() => meantOf(meantPref), [meantPref])
  const ready = status === 'ready' && Object.keys(tables).length > 0

  const data = useMemo(
    () => (ready ? review({ entities: tables, rowsByEntity: rows }, meant) : null),
    [ready, tables, rows, meant],
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
   THE QUEUE: the rail, the stage, the cases after it, and the foot
   ============================================================ */

type Tables = Readonly<Record<string, EntityDef>>
type Rows = Readonly<Record<string, readonly RowData[]>>

interface QueueProps extends ReviewProps {
  data: ReviewData
  unread: ReturnType<typeof unchecked>
  tables: Tables
  rows: Rows
}

function Queue({ data, unread, tables, rows, at, onAt, listHref, go }: QueueProps) {
  const still = useStill()
  const cases = useMemo(() => queueOf(data), [data])
  const perKind = useMemo(() => casesByKind(cases), [cases])
  const tidyOn = data.tidyCount > 0

  /* WHERE THE STAGE STANDS: the case the address names; the first case when it names none, or
     one already settled (a reload after the press); the tidy suggestions when it says so */
  const named = cases.findIndex((c) => c.key === at)
  const onTidy = at === TIDY && tidyOn
  const index = onTidy ? -1 : named >= 0 ? named : cases.length > 0 ? 0 : -1
  const current = index >= 0 ? cases[index] : undefined
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

  /* ---- the stage's title takes the focus after a press, so a reader hears the next case ---- */
  const title = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)
  const stageKey = onTidy ? TIDY : (current?.key ?? 'clean')
  const shown = useRef(stageKey)
  useEffect(() => {
    if (shown.current === stageKey) return
    shown.current = stageKey
    if (!moved.current) return
    moved.current = false
    title.current?.focus({ preventScroll: true })
  })
  const goTo = useCallback(
    (key: string) => {
      /* the same case again (one settled in part) keeps the focus where the dealer is typing */
      moved.current = key !== shown.current
      onAt(key)
    },
    [onAt],
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

  /** Leave a case alone, with its reason: kept on this computer, and the toast takes it back. */
  const leave = useCallback(
    (c: Case, as: LeftAs, then: string) => {
      const keys = meantKeysOf(c)
      const before = meantOf(prefs.getState().get(MEANT_PREF))
      const stamp = `${as} ${new Date().toISOString()}`
      const next: Record<string, string> = { ...before }
      for (const k of keys) next[k] = stamp
      prefs.getState().set(MEANT_PREF, next)
      undo(
        leftSaid(c, as),
        () => {
          const now = { ...meantOf(prefs.getState().get(MEANT_PREF)) }
          for (const k of keys) if (!(k in before)) delete now[k]
          prefs.getState().set(MEANT_PREF, now)
          say('It is back in the queue.', { id: STEP_TOAST })
          /* and back on the stage, as a fix taken back is: the case left alone, never the one
             that stood after it (built-critique-m3.md, minor) */
          goTo(c.key)
        },
        { id: STEP_TOAST },
      )
      goTo(then)
    },
    [goTo],
  )

  const bringBack = useCallback(() => {
    const before = meantOf(prefs.getState().get(MEANT_PREF))
    prefs.getState().remove(MEANT_PREF)
    undo(
      'Everything left alone is back in the queue.',
      () => prefs.getState().set(MEANT_PREF, before),
      { id: STEP_TOAST },
    )
  }, [])

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
      event.target instanceof HTMLElement && event.target.closest('button, a, [role="dialog"]')
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
    />
  ) : (
    <CleanStage data={data} titleRef={title} onTidy={tidyOn ? () => goTo(TIDY) : null} />
  )

  return (
    <main className="rv" data-testid="review" data-read="" data-clean={clean ? '' : undefined}>
      <Rail
        data={data}
        cases={cases}
        perKind={perKind}
        current={current}
        onTidy={onTidy}
        onKind={(kind) => {
          const first = cases.find((c) => c.kind === kind)
          if (first) goTo(first.key)
        }}
        onTidyChip={tidyOn ? () => goTo(TIDY) : null}
      />

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
            const p = peekOf(c, tables[tableOf(c)]?.kind)
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

      <Foot data={data} unread={unread} bringBack={bringBack} go={go} />
    </main>
  )
}

const tableOf = (c: Case): string =>
  c.kind === 'band'
    ? c.line.tableId
    : c.kind === 'two'
      ? c.tableId
      : c.kind === 'none'
        ? c.group.tableId
        : c.kind === 'twins'
          ? c.twin.tableId
          : c.group.tableId

/* ============================================================
   THE RAIL — what is left, the most money first, and what it costs
   ============================================================ */

function Rail({
  data,
  cases,
  perKind,
  current,
  onTidy,
  onKind,
  onTidyChip,
}: {
  data: ReviewData
  cases: readonly Case[]
  perKind: Record<CaseKind, number>
  current: Case | undefined
  onTidy: boolean
  onKind: (kind: CaseKind) => void
  onTidyChip: (() => void) | null
}) {
  /* THE TICK OF THE CASE ON THE STAGE, lit where it stands in its check. A tick is a case, as the
     head and the chips count cases (built-critique-m3.md, major 11: the rail counted 69 lines
     beside "Case 1 of 37"), so the rail has one figure and the stage walks it. */
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
  return (
    <header className="rv-rail">
      {/* THE SCREEN SAYS ITS NAME (built-critique-m3.md, minor: a stakeholder arriving by link saw
          "69" and a rail, not "Review"), once, small, over the figure it is named for */}
      <h1 className="rv-count">
        <span className="rv-count__name">Review</span>{' '}
        <span className="rv-count__figure">
          <Figure value={cases.length} />
        </span>
        <span className="rv-count__words">
          {cases.length === 0
            ? 'to settle: your price list is clean'
            : 'to settle, the most money first'}
        </span>
      </h1>

      <div className="rv-track">
        {kinds.length > 0 ? (
          <div className="rv-bar" aria-hidden="true">
            {kinds.map((k) => (
              <span
                key={k}
                className="rv-bar__seg"
                data-kind={k}
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
            {onTidyChip ? <span className="rv-bar__seg rv-bar__seg--tidy" /> : null}
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
      </div>

      <dl className="rv-money">
        <div className="rv-money__fact">
          <dt className="rv-money__figure">
            <Figure value={data.band.notCharged} prefix="$" />
          </dt>
          <dd className="rv-money__words">not charged</dd>
        </div>
        <div className="rv-money__fact">
          <dt className="rv-money__figure">
            <Figure value={data.band.chargedOver} prefix="$" />
          </dt>
          <dd className="rv-money__words">charged over</dd>
        </div>
      </dl>
    </header>
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
  from,
  title,
  titleRef,
  lede,
  children,
  acts,
  leaveRow,
  kept,
  kind,
}: {
  eyebrow: string
  from?: ReactNode
  title: string
  titleRef: RefObject<HTMLHeadingElement | null>
  lede: ReactNode
  children?: ReactNode
  acts?: ReactNode
  leaveRow?: ReactNode
  kept?: ReactNode
  kind: string
}) {
  const id = useId()
  return (
    <section className="rv-stage" data-ground="plate" data-kind={kind} aria-labelledby={id}>
      <div className="rv-stage__head">
        <p className="rv-eyebrow">{eyebrow}</p>
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
      {children}
      {acts ? <div className="rv-acts">{acts}</div> : null}
      {leaveRow}
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

function Leave({ c, leave }: { c: Case; leave: (as: LeftAs) => void }) {
  return (
    <div className="rv-leave">
      <span className="rv-leave__lead">Or leave it, as</span>
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

function CaseStage(props: CaseProps) {
  const { c, index, total } = props
  const eyebrow = `Case ${index + 1} of ${total} · ${CHECK_WORDS[c.kind].wrong}`
  switch (c.kind) {
    case 'band':
      return <BandStage {...props} c={c} eyebrow={eyebrow} />
    case 'two':
      return <TwoStage {...props} c={c} eyebrow={eyebrow} />
    case 'none':
      return <NoneStage {...props} c={c} eyebrow={eyebrow} />
    case 'twins':
      return <TwinsStage {...props} c={c} eyebrow={eyebrow} />
    case 'nameless':
      return <NamelessStage {...props} c={c} eyebrow={eyebrow} />
  }
}

type StageOf<K extends Case['kind']> = Omit<CaseProps, 'c'> & {
  c: Extract<Case, { kind: K }>
  eyebrow: string
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

/* ---- 1 · a trailer registered as the wrong size ---- */

const fieldName = (table: EntityDef | undefined, id: string | null, or: string): string =>
  (id ? table?.fields.find((f) => f.id === id)?.name : undefined) ?? or

function BandStage({
  c,
  eyebrow,
  tables,
  rows,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
}: StageOf<'band'>) {
  const l = c.line
  const to = l.to
  const table = tables[l.tableId]
  const row = (rows[l.tableId] ?? []).find((r) => r.id === l.rowId)
  const atm = table?.fields.find((f) => /^atm\b/i.test(f.name.trim()))
  const tare = table?.fields.find((f) => /^tare\b/i.test(f.name.trim()))
  const tareKg = row && tare ? readCell(row, tare.id) : null
  const base = row && l.columns.base ? readCell(row, l.columns.base) : null
  const name = trailerSaid(l)
  const press = to ? () => run(rebandCommand(l, `${makerTyped(l.tableName)} ${name}`)) : null
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

  return (
    <Frame
      kind="band"
      eyebrow={eyebrow}
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
              href={listHref(l.tableId, l.rowId)}
              onClick={() => go(listHref(l.tableId, l.rowId))}
            >
              Choose it in the price list
            </Button>
          )}
          <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
            Skip for now
          </Button>
        </>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter={to ? `makes it ${to.word}` : null} />
        </>
      }
      kept={`Nothing else on the line moves: ${joined(keptBits, 'and')} stay as they are. One step, said with its Undo.`}
    >
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
      {source.length > 0 ? (
        <p className="rv-source">
          The sizes are read from the fee list’s own {source.length === 1 ? 'label' : 'labels'}:{' '}
          {joined(source, 'and')}.
        </p>
      ) : null}
    </Frame>
  )
}

/* ---- 2 · one name, two prices: a choice between the two, neither made amber ---- */

function TwoStage({
  c,
  eyebrow,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
  listHref,
  go,
}: StageOf<'two'>) {
  usePrimary(setPrimary, null)
  const lines = c.item.lines
  const changes = joined(
    (lines[0]?.levels ?? []).map((l) => l.label),
    'and',
  )
  return (
    <Frame
      kind="two"
      eyebrow={eyebrow}
      from={<From tableName={c.tableName} />}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          <Button
            intent="quiet"
            icon={ArrowSquareOutIcon}
            href={listHref(c.tableId, lines[0]?.rowId)}
            onClick={() => go(listHref(c.tableId, lines[0]?.rowId))}
          >
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
      kept={`Only its ${changes} ${(lines[0]?.levels.length ?? 1) === 1 ? 'changes' : 'change'} on the other ${lines.length === 2 ? 'line' : 'lines'}; every code and everything else stays. One step, said with its Undo.`}
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
            </li>
          )
        })}
      </ul>
    </Frame>
  )
}

/* ---- 3 · on sale with no price: a typed price for each, the neighbour beside it ---- */

function NoneStage({
  c,
  eyebrow,
  tables,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
}: StageOf<'none'>) {
  const g = c.group
  const [typed, setTyped] = useState<Record<string, string>>({})
  const [tried, setTried] = useState(false)
  const filled = g.lines.filter((l) => (typed[l.rowId] ?? '').trim() !== '')
  const bad = filled.find((l) => typedPrice(typed[l.rowId] ?? '') === null)
  const priceName = g.priceNames[0] ?? ''
  const refusal = !tried
    ? undefined
    : bad
      ? `“${(typed[bad.rowId] ?? '').trim()}” is not a price. Type it in dollars, like 2,100.`
      : filled.length === 0
        ? `Type a price beside ${g.lines.length === 1 ? 'it' : 'at least one of them'} first.`
        : undefined
  const press = (): void => {
    if (bad || filled.length === 0) {
      setTried(true)
      return
    }
    run(
      priceLinesCommand(
        g.tableId,
        g.tableName,
        g.priceFieldId,
        priceName,
        filled.map((l) => ({ rowId: l.rowId, name: l.name, price: typedPrice(typed[l.rowId]!)! })),
      ),
      filled.length === g.lines.length,
    )
  }
  const meantByDefault = g.kind === 'zero'
  usePrimary(setPrimary, meantByDefault ? null : press)
  const label =
    filled.length === 0
      ? `Price ${g.lines.length === 1 ? 'it' : 'them'} at ${priceName}`
      : filled.length === g.lines.length && g.lines.length > 1
        ? `Price all ${filled.length} at ${priceName}`
        : `Price ${filled.length === 1 ? 'the one typed' : `the ${filled.length} typed`} at ${priceName}`
  const rest = g.priceNames.slice(1)
  const shared = besideOnce(g.lines)
  return (
    <Frame
      kind="none"
      eyebrow={eyebrow}
      from={
        <From tableName={g.tableName} extra={g.category ? spokenCategory(g.category) : undefined} />
      }
      title={titleOf(c, tables[g.tableId]?.kind)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <>
          <span className="rv-acts__main">
            <Button
              intent={meantByDefault ? 'secondary' : 'act'}
              icon={meantByDefault ? TagIcon : ArrowRightIcon}
              refusedBecause={refusal}
              onClick={press}
            >
              {label}
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
          <Keys enter={meantByDefault ? null : 'prices what is typed'} />
        </>
      }
      kept={`Typed at ${priceName}, the price ${g.tableName} is sold at${rest.length > 0 ? `; ${joined(rest, 'and')} ${rest.length === 1 ? 'stays as it is' : 'stay as they are'}` : ''}. Every price typed is written in one step, said with its Undo.`}
    >
      {shared ? (
        <p className="rv-lines__beside">
          Beside them in the price list: {nameSaid(shared.name, g.tableName)} · {priceName}{' '}
          {money(shared.price)}
        </p>
      ) : null}
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
              <span className="rv-line__now">{g.kind === 'zero' ? '$0' : 'No price'}</span>
              {l.beside && !shared ? (
                <span className="rv-line__beside">
                  Beside it: {nameSaid(l.beside.name, g.tableName)} · {priceName}{' '}
                  {money(l.beside.price)}
                </span>
              ) : null}
            </span>
            <span className="rv-line__field">
              <Input
                mono
                inputMode="decimal"
                aria-label={`${priceName} for ${nameSaid(l.name, g.tableName)}`}
                placeholder="$"
                value={typed[l.rowId] ?? ''}
                onValueChange={(v) => {
                  setTyped((t) => ({ ...t, [l.rowId]: v }))
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
        ))}
      </div>
    </Frame>
  )
}

/* ---- 4 · two under one name: the two side by side, either renamed ---- */

function sampleSaid(sample: ReadonlyArray<string | number>, numeric: boolean): string {
  return sample
    .map((v) => (typeof v === 'number' && numeric ? money(Math.round(v * 100) / 100) : String(v)))
    .join(', ')
}

function TwinsStage({
  c,
  eyebrow,
  tables,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
}: StageOf<'twins'>) {
  usePrimary(setPrimary, null)
  const t = c.twin
  const table = tables[t.tableId]
  const tells = new Set(t.columns.map((col) => col.after)).size === t.columns.length
  return (
    <Frame
      kind="twins"
      eyebrow={eyebrow}
      from={<From tableName={t.tableName} />}
      title={titleOf(c)}
      titleRef={titleRef}
      lede={ledeOf(c)}
      acts={
        <Button intent="quiet" icon={SkipForwardIcon} onClick={skip}>
          Skip for now
        </Button>
      }
      leaveRow={
        <>
          <Leave c={c} leave={leave} />
          <Keys enter={null} />
        </>
      }
      kept="Only the name changes: every price and every line under it stays as it is. One step, said with its Undo."
    >
      <ul className="rv-options" aria-label={`The two called ${t.name}`}>
        {t.columns.map((col, i) => {
          const field = table?.fields.find((f) => f.id === col.fieldId)
          const cost = table && field ? isCostColumn(table, field) : true
          const which = `${i === 0 ? 'The first' : i === 1 ? 'The second' : `Number ${i + 1}`}${tells && col.after ? `, after ${col.after}` : ''}`
          return (
            <TwinOption
              key={col.fieldId}
              which={which}
              sample={
                cost ? 'A cost, not shown here' : sampleSaid(col.sample, col.numeric) || 'Empty'
              }
              name={t.name}
              tableName={t.tableName}
              onName={(name) => run(nameTwinCommand(t.tableId, col.fieldId, t.name, name))}
            />
          )
        })}
      </ul>
    </Frame>
  )
}

function TwinOption({
  which,
  sample,
  name,
  tableName,
  onName,
}: {
  which: string
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
      <span className="rv-option__code">{which}</span>
      <span className="rv-option__sample">{sample}</span>
      <span className="rv-option__field">
        <Input
          aria-label={`A name of its own for ${which.charAt(0).toLowerCase()}${which.slice(1)}, called ${name} in ${tableName}`}
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

/* ---- 5 · nothing to name it: a typed name for each ---- */

function NamelessStage({
  c,
  eyebrow,
  titleRef,
  setPrimary,
  skip,
  run,
  leave,
}: StageOf<'nameless'>) {
  const g = c.group
  const field = g.items[0]?.nameField
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
  return (
    <Frame
      kind="nameless"
      eyebrow={eyebrow}
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
      kept={`Only ${field?.name ?? 'the name'} is written; everything else on each line stays. One step, said with its Undo.`}
    >
      <div className="rv-lines">
        <p className="rv-lines__head" aria-hidden="true">
          <span>As the price list reads</span>
          <span className="rv-lines__will">
            <Icon glyph={PencilSimpleIcon} /> Will read as its {field?.name}
          </span>
        </p>
        {g.items.map((item) => (
          <div className="rv-line" key={item.rowId}>
            <span className="rv-line__said">
              <span className="rv-line__name">
                {item.says !== '' ? `Says only “${item.says}”` : 'Nothing else is written on it'}
              </span>
              {item.code !== '' ? <span className="rv-line__beside">Code {item.code}</span> : null}
            </span>
            <span className="rv-line__field">
              <Input
                aria-label={`${field?.name ?? 'Name'} for the line in ${g.tableName} that says ${item.says || 'nothing'}${item.code ? `, code ${item.code}` : ''}`}
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
        ))}
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

/* ---- the clean day: the queue ends, and what is now true is said ---- */

function CleanStage({
  data,
  titleRef,
  onTidy,
}: {
  data: ReviewData
  titleRef: RefObject<HTMLHeadingElement | null>
  onTidy: (() => void) | null
}) {
  return (
    <Frame
      kind="clean"
      eyebrow="The queue is empty"
      title="Nothing in your price list needs you."
      titleRef={titleRef}
      lede="Every check was read just now, and each one holds."
      acts={
        onTidy ? (
          <Button intent="quiet" icon={BroomIcon} onClick={onTidy}>
            {`See the ${counted(data.tidyCount, 'tidy suggestion', 'tidy suggestions')}`}
          </Button>
        ) : undefined
      }
    >
      <ul className="rv-true">
        {CASE_KINDS.map((k) => (
          <li className="rv-true__line" key={k}>
            <span className="rv-true__glyph">
              <Icon glyph={CheckCircleIcon} weight="fill" />
            </span>
            <span>
              {CHECK_WORDS[k].true}
              {k === 'band' && data.band.tested > 0
                ? ` ${counted(data.band.tested, 'trailer', 'trailers')} checked.`
                : ''}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

/* ============================================================
   THE FOOT — what was left alone, and what no check could read
   ============================================================ */

function Foot({
  data,
  unread,
  bringBack,
  go,
}: {
  data: ReviewData
  unread: ReturnType<typeof unchecked>
  bringBack: () => void
  go: (href: string) => void
}) {
  const lines = unread.reduce((n, l) => n + l.lines, 0)
  if (data.meant === 0 && unread.length === 0) return null
  return (
    <footer className="rv-foot">
      {data.meant > 0 ? (
        <div className="rv-foot__part">
          <p className="rv-foot__say">
            <span>
              {counted(data.meant, 'line is', 'lines are')} left alone. Each comes back on its own
              if what made it a case changes.
            </span>
          </p>
          <Button intent="quiet" size="sm" onClick={bringBack}>
            Bring them back
          </Button>
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
              .
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
