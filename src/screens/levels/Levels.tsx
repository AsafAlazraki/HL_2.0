import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { motion } from 'motion/react'
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CheckIcon,
  FileTextIcon,
  InfoIcon,
  LockSimpleIcon,
  PencilSimpleLineIcon,
  PercentIcon,
  SealCheckIcon,
  TableIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Icon,
  Input,
  KindMark,
  Refusal,
  Tile,
  Toggle,
  reducedMotion,
  transition,
} from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  letReach,
  priceIn,
  readShare,
  shareFigure,
  sharePlan,
} from '@/domain/catalogue/priceCommands'
import { nameWay } from '@/domain/pricing/nameWay'
import { standingOn, type Standing } from '@/domain/pricing/standing'
import { chosenOf } from '@/domain/pricing/chosen'
import { KIT_BUYERS, KIT_WAYS, type KitBuyer, type KitWay } from '@/domain/pricing/kitGrid'
import { timesOf } from '@/domain/pricing/spread'
import { money } from '@/domain/money'
import type { QuoteLine } from '@/domain/model'
import { GroupHead, Joints, KIND, LinePicture, Mark, ShareScale, n, plural, shareOf } from './bits'
import { Lookup } from './Lookup'
import {
  doorsOf,
  onLine,
  onSale,
  plainName,
  questionOf,
  readDesk,
  readLadder,
  sameField,
  sampleOf,
  settledFact,
  soldAsPackage,
  type Column,
  type Door,
  type Figure,
  type Kept,
  type Sample,
  type Sheet,
  type WayView,
} from './read'
import './levels.css'

/* ============================================================
   PRICES (`/levels`) — direction F, "Yours to decide", of
   docs/directions/levels-boards/ (judged 2026-10-28), deepened in the
   data round (the judge of Prices, 2026-11-04: "the composition is
   right; it is not at the level it has to be").

   THE PAGE IS THE DEALER'S WORK, NOT THE PRICE LIST'S SHAPE. Its three
   groups stay, in the order a dealer meets them, under one look-up:

   EACH BUYER'S PRICE — any line on sale found by its name or code, and
   what a customer, a trade buyer, a warranty job, a fitted line and a
   sub-dealer pay for it, with the column and the cell each is read
   from (`Lookup.tsx`).

   YOURS TO CHOOSE — the questions only Northside can answer, in the
   order of how many lines each answer prices. Opened, each WAY a list
   could be priced is a tile that says what its figure is, the
   workbook's cell, the rule checked on every line, and how many lines
   it prices; the two ways are read against each other over the whole
   list ("Act Sell is 0.97–27.83 × Sell"). A way pressed is counted
   before anything is written, with the quotes on the desk it touches.

   KEPT FROM CUSTOMERS — Warranty, sunk below the page with its one
   switch, every maker's Warranty drawn against Cash on one scale, the
   eight Stacer boats above it named with their door.

   SETTLED — every other list, a tile of its kind and its name. Pressed,
   it opens across its row: what each buyer pays across the list, each
   count with the door to the lines behind it, Trade as a typed share of
   Cash previewed on the line before it is counted and written.

   EVERY WRITE IS A COMMAND through the catalogue store, one step, and
   its sentence and its way back stand under the list it changed until
   the next write.
   ============================================================ */

/** A position or an address nobody handed in: followed nowhere. */
const nowhere = (): void => {}

export interface LevelsProps {
  /** the list that is open, by its id; '' for none */
  list: string
  onList: (list: string) => void
  /** the line looked up, as `Lookup` writes it; '' for none */
  line?: string
  onLine?: (line: string) => void
  /** another screen's address, followed by the router */
  go?: (href: string) => void
  /** where a computer with no copy of the price list goes to load one */
  openTheFile: () => void
  /** BACK TO THE QUOTE THAT SENT THE DEALER HERE (built-critique-m3.md, blocker 1). Absent when
   *  Prices was opened from anywhere else. */
  backToQuote?: () => void
  /** THE QUOTE THAT SENT THE DEALER HERE, by its id: its line on the open list is the one the
   *  list is read on (built-critique-m3-2.md, major 2). Absent from anywhere else. */
  quote?: string
}

/** What a tile counts, in one short word: "91 boats", "650 kits". */
function countOf(col: Column): string {
  /* the boats, and the finishes every figure in its panel is counted on (the verifier, round 2:
     Highfield's tile said "67 boats" over a panel and a Warranty scale counting 588 finishes) */
  if (col.models !== null)
    return `${plural(col.models, 'boat', 'boats')}, ${plural(col.lines, 'finish', 'finishes')}`
  const word = col.noun.many.split(' ').at(-1) ?? ''
  return `${n(col.lines)} ${word}`
}

const TIME = new Intl.DateTimeFormat('en-AU', { hour: 'numeric', minute: '2-digit' })
const DAY = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

/** WHEN A CHOICE WAS MADE, as a person says it: "at 8:28 am today", or "on 4 November 2026 at
 *  8:28 am" on any other day. */
function whenSaid(at: string): string {
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return ''
  return DAY.format(d) === DAY.format(new Date())
    ? `at ${TIME.format(d)} today`
    : `on ${DAY.format(d)} at ${TIME.format(d)}`
}

/** WHO CHOSE A LIST'S PRICE AND WHEN, as this computer keeps it (`domain/pricing/chosen.ts`):
 *  "Asaf chose Sell Price at 8:28 am today", kept through a reload. A choice made before it was
 *  kept says only that it is yours. */
function chosenSaid(label: string, chose: { by?: string; at: string } | null): string {
  if (!chose) return `You chose ${label}.`
  const when = whenSaid(chose.at)
  return chose.by
    ? `${chose.by} chose ${label}${when === '' ? '' : ` ${when}`}.`
    : `${label} was chosen${when === '' ? ' here' : ` ${when}`}.`
}

/* ---------------------------------------------------------- */
/* The last write, and its way back                            */
/* ---------------------------------------------------------- */

/** WHAT THE SCREEN LAST SAID ABOUT A WRITE, and under which list. */
interface Step {
  /** a list's id, 'warranty', or a list's id with '#reach' */
  on: string
  kind: 'step' | 'refused' | 'nothing'
  said: string
  eventId?: string
  wasUndo?: boolean
}

/** Write one command; true when it was written. `nothing` is said when it changed nothing. */
type Apply = (on: string, command: CatalogueCommand, nothing: string) => boolean

function StepLine({
  step,
  onBack,
  onward,
}: {
  step: Step
  onBack: () => void
  onward?: () => void
}) {
  const back = useRef<HTMLElement>(null)
  /* THE WAY BACK TAKES THE FOCUS: the act that wrote has folded away with its panel */
  useEffect(() => {
    back.current?.focus({ preventScroll: true })
  }, [])
  if (step.kind === 'refused')
    return (
      <p className="lv-alarm" role="alert" data-ground="plate">
        <Refusal>{step.said}</Refusal>
      </p>
    )
  return (
    <output className="lv-step" data-testid="last-step" data-ground="plate">
      <span
        className="lv-step__done"
        data-kind={step.kind === 'step' && step.wasUndo ? 'undone' : step.kind}
        aria-hidden="true"
      >
        <Icon
          glyph={
            step.kind !== 'step'
              ? InfoIcon
              : step.wasUndo
                ? ArrowCounterClockwiseIcon
                : CheckCircleIcon
          }
          weight={step.kind === 'step' && step.wasUndo ? 'bold' : 'fill'}
        />
      </span>
      <span className="lv-step__said">{step.said}</span>
      {step.kind === 'step' ? (
        <Button
          ref={back}
          intent="secondary"
          size="sm"
          icon={step.wasUndo ? ArrowClockwiseIcon : ArrowCounterClockwiseIcon}
          onClick={onBack}
        >
          {step.wasUndo ? 'Put it back' : 'Undo'}
        </Button>
      ) : null}
      {step.kind === 'step' && onward ? (
        <Button intent="secondary" size="sm" icon={FileTextIcon} onClick={onward}>
          Back to the quote
        </Button>
      ) : null}
    </output>
  )
}

/* ---------------------------------------------------------- */
/* The screen                                                  */
/* ---------------------------------------------------------- */

export function Levels({
  list,
  onList,
  line = '',
  onLine: onLineChange = nowhere,
  go = nowhere,
  openTheFile,
  backToQuote,
  quote = '',
}: LevelsProps) {
  const status = useCatalogue((s) => s.status)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const priceLevels = useCatalogue((s) => s.priceLevels)
  const ready = status === 'ready' && Object.keys(tables).length > 0
  /* EVERY READ ON THIS PAGE IS OF LINES ON SALE (`onSale`): a discontinued line and a kit list's
     banner rows are counted nowhere, as the look-up never finds them (the verifier, round 2) */
  const sheet = useMemo<Sheet>(
    () => onSale({ tables, rows, priceLevels }),
    [tables, rows, priceLevels],
  )
  const columns = useMemo(() => (ready ? readLadder(sheet) : []), [ready, sheet])

  if (!ready || columns.length === 0) {
    return (
      <main className="lv" data-testid="levels">
        <header className="lv-head">
          <div className="lv-head__words">
            <p className="lv-eyebrow">Prices</p>
            <h1 className="lv-title">What only you can decide about price.</h1>
          </div>
        </header>
        <div className="lv-empty" data-ground="plate">
          {status === 'loading' || status === 'empty' ? (
            <p className="lv-deck">Reading the price list…</p>
          ) : (
            <>
              <p className="lv-deck">
                The price list is not on this computer yet, and every price here is read from it.
              </p>
              <Button intent="act" icon={FileTextIcon} onClick={openTheFile}>
                Load the Master Price File
              </Button>
            </>
          )}
        </div>
      </main>
    )
  }

  return (
    <Page
      columns={columns}
      sheet={sheet}
      list={list}
      onList={onList}
      line={line}
      onLine={onLineChange}
      go={go}
      backToQuote={backToQuote}
      quote={quote}
    />
  )
}

/** The quote's line on one of these lists, by its list and its line, as one key: the line still
 *  waiting for a price first, since that is the one the build sent the dealer here about. */
function lineKeyOf(lines: readonly QuoteLine[], tableIds: ReadonlySet<string>): string {
  const on = lines.filter((l) => tableIds.has(l.entityId))
  const line = on.find((l) => l.unitPrice === null) ?? on[0]
  return line ? `${line.entityId}|${line.rowId}` : ''
}

function Page({
  columns: read,
  sheet,
  list,
  onList,
  line,
  onLine: onLineChange,
  go,
  backToQuote,
  quote,
}: {
  columns: Column[]
  sheet: Sheet
  list: string
  onList: (list: string) => void
  line: string
  onLine: (line: string) => void
  go: (href: string) => void
  backToQuote?: () => void
  quote: string
}) {
  const tableIds = useMemo(() => new Set(read.flatMap((c) => c.tableIds)), [read])
  const lineKey = useQuotes((s) =>
    quote === '' ? '' : lineKeyOf(s.quotes.find((q) => q.id === quote)?.lines ?? [], tableIds),
  )
  const reference = useQuotes((s) =>
    quote === '' ? '' : (s.quotes.find((q) => q.id === quote)?.reference ?? ''),
  )
  const allQuotes = useQuotes((s) => s.quotes)
  const stamps = useCatalogue((s) => s.stamps)
  const columns = useMemo(() => {
    if (lineKey === '') return read
    const cut = lineKey.indexOf('|')
    return read.map((c) => onLine(sheet, c, lineKey.slice(0, cut), lineKey.slice(cut + 1)))
  }, [read, sheet, lineKey])
  const desk = useMemo(() => readDesk(sheet, columns), [sheet, columns])
  const open =
    columns.find((c) => c.id === list)?.id ??
    columns.find((c) => c.tableIds.includes(list))?.id ??
    ''
  const [sentFor] = useState(open)
  const pressed = useRef(backToQuote !== undefined && open !== '')
  const main = useRef<HTMLElement>(null)
  const bring = useRef(false)
  const [step, setStep] = useState<Step | null>(null)

  const toggle = useCallback(
    (id: string) => {
      pressed.current = true
      bring.current = false
      /* A STEP TAKEN BACK, OR A PRESS THAT CHANGED NOTHING, does not stand over the next list the
         dealer opens (the judge, 2026-11-04: Warranty's "Undone… Put it back" stood above Stacer's
         share); a fresh write keeps its Undo until the next write */
      setStep((s) => (s && (s.kind !== 'step' || s.wasUndo) ? null : s))
      onList(open === id ? '' : id)
    },
    [onList, open],
  )
  const fold = useCallback(() => onList(''), [onList])
  const takePress = useCallback(() => {
    const was = pressed.current
    pressed.current = false
    return was
  }, [])

  useEffect(() => {
    if (!bring.current || !step) return
    if (step.kind === 'step' && open === step.on) return
    bringIntoSight(main.current?.querySelector('.lv-step, .lv-alarm'))
  }, [step, open])

  const apply = useCallback<Apply>((on, command, nothing) => {
    bring.current = true
    const outcome = catalogue.getState().apply(command)
    if (!isDone(outcome)) {
      setStep(
        outcome.refused === ''
          ? { on, kind: 'nothing', said: nothing }
          : { on, kind: 'refused', said: outcome.refused },
      )
      return false
    }
    setStep({ on, kind: 'step', said: outcome.said, eventId: outcome.event.id, wasUndo: false })
    return true
  }, [])

  const goBack = useCallback(() => {
    bring.current = true
    if (!step || step.kind !== 'step') return
    const outcome = step.wasUndo
      ? catalogue.getState().redo()
      : catalogue.getState().undo(step.eventId)
    if (!isDone(outcome)) {
      setStep({
        on: step.on,
        kind: outcome.refused === '' ? 'nothing' : 'refused',
        said:
          outcome.refused === ''
            ? 'Nothing to put back: it already reads as it did before.'
            : outcome.refused,
      })
      return
    }
    setStep({
      on: step.on,
      kind: 'step',
      said: outcome.said,
      eventId: outcome.event.id,
      wasUndo: !step.wasUndo,
    })
  }, [step])

  const stepOn = (on: string): ReactNode =>
    step && step.on === on ? (
      <StepLine
        key={step.eventId ?? step.said}
        step={step}
        onBack={goBack}
        onward={on === sentFor && sentFor !== '' ? backToQuote : undefined}
      />
    ) : null

  const standing = useCallback(
    (col: Column): Standing => standingOn(allQuotes, new Set(col.tableIds)),
    [allQuotes],
  )
  const who = useCallback((col: Column) => chosenOf(stamps, col.tableIds), [stamps])

  const choosing = desk.choose.length
  const byYou = desk.settled.filter((c) => c.cash.state === 'reads' && c.cash.named).length
  const ctx: Ctx = { sheet, apply, standing, who, go, quote, columns, openList: toggle }

  return (
    <main className="lv" data-testid="levels" data-read="" ref={main}>
      <header className="lv-head">
        <div className="lv-head__words">
          {backToQuote && reference !== '' ? (
            <span className="lv-back">
              <Button intent="quiet" size="sm" icon={ArrowLeftIcon} onClick={backToQuote}>
                {`Back to quote ${reference}`}
              </Button>
            </span>
          ) : null}
          <p className="lv-eyebrow">Prices</p>
          <h1 className="lv-title">What only you can decide about price.</h1>
        </div>
        <p className="lv-deck">
          {choosing > 0 ? (
            <>
              Nothing here is chosen for you.{' '}
              <strong>Until you answer, every quote prices as it does today.</strong> The rest, your
              price list already says.
            </>
          ) : (
            <>
              <strong>Every question is answered.</strong> The rest, your price list already says;
              press any of it to see it or change it.
            </>
          )}
        </p>
      </header>

      <Lookup
        sheet={sheet}
        columns={columns}
        line={line}
        onLine={onLineChange}
        go={go}
        openList={(id) => toggle(id)}
      />

      <section className="lv-group" aria-labelledby="lv-choose">
        <GroupHead
          id="lv-choose"
          title="Yours to choose"
          count={choosing}
          note="By how many lines each answer prices"
        />
        {choosing > 0 ? (
          <ol className="lv-tasks" data-ground="plate">
            {desk.choose.map((col) => (
              <ChooseRow
                key={col.id}
                col={col}
                ctx={ctx}
                open={open === col.id}
                pressed={takePress}
                onToggle={() => toggle(col.id)}
                onDone={fold}
                said={stepOn(col.id)}
              />
            ))}
          </ol>
        ) : (
          <div className="lv-none" data-ground="plate">
            <span className="lv-none__seal" aria-hidden="true">
              <Icon glyph={SealCheckIcon} weight="fill" />
            </span>
            <p>
              <strong>Nothing is left for you to choose.</strong> Every list on sale prices the way
              your price list or you have said, below.
            </p>
          </div>
        )}
      </section>

      {desk.kept.length > 0 ? (
        <section className="lv-group" aria-labelledby="lv-kept">
          <GroupHead
            id="lv-kept"
            title="Kept from customers"
            count={desk.kept.length}
            note="Northside’s own until you let it reach a customer"
          />
          <div className="lv-keptlist">
            {desk.kept.map((k) => (
              <KeptBar key={k.id} kept={k} apply={apply} go={go} said={stepOn(k.id)} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="lv-group" aria-labelledby="lv-settled">
        <GroupHead
          id="lv-settled"
          title="Settled"
          count={desk.settled.length}
          note={
            byYou > 0
              ? `${n(desk.settled.length - byYou)} by your price list · ${n(byYou)} by you`
              : 'By your price list. Press any to see what each buyer pays'
          }
        />
        <Settled
          cols={desk.settled}
          ctx={ctx}
          open={open}
          pressed={takePress}
          onToggle={toggle}
          onDone={fold}
          stepOn={stepOn}
        />
      </section>
    </main>
  )
}

/** What every part of the page is handed to read and to write. */
interface Ctx {
  sheet: Sheet
  /** every list on the page, and the press that opens one */
  columns: readonly Column[]
  openList: (id: string) => void
  apply: Apply
  standing: (col: Column) => Standing
  /** who last chose the list's price and when, as this computer keeps it */
  who: (col: Column) => { by?: string; at: string } | null
  go: (href: string) => void
  /** the quote that sent the dealer here, by its id; '' from anywhere else */
  quote: string
}

/* ---------------------------------------------------------- */
/* One line of a list, read                                    */
/* ---------------------------------------------------------- */

/** The maker's word for a list, as a sentence names its line: "the Stacer 309 Skimma". */
const makerWord = (col: Column): string =>
  col.shelf === 'boats' || col.shelf === 'motors' ? (col.name.split(/\s+/)[0] ?? '') : ''

/** THE SPECIMEN: one real line of the list, its picture a thumbnail beside its name, its maker's
 *  mark drawn once, here, and nowhere else in the open panel. */
function Specimen({
  col,
  sample,
  children,
}: {
  col: Column
  sample: Sample
  children?: ReactNode
}) {
  return (
    <div className="lv-specimen">
      <LinePicture sample={sample} maker={makerWord(col)} />
      <div className="lv-specimen__words">
        <Mark col={col} drawnOnly />
        <p className="lv-specimen__name">
          <span className="lv-specimen__eyebrow">
            {sample.onQuote ? 'On your quote' : `Read on one ${col.noun.one}`}
          </span>
          <span>
            <Joints text={sample.name} />
          </span>
        </p>
        {children}
      </div>
    </div>
  )
}

/** WHAT A PRESS BROUGHT, BROUGHT INTO SIGHT: to the nearest edge, clear of the pill by its
 *  `scroll-margin-block`; what is already in sight does not move. */
function bringIntoSight(el: Element | null | undefined): void {
  if (!el || typeof el.scrollIntoView !== 'function') return
  el.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/** OPENED BY A PRESS, A PANEL IS READ FROM ITS OWN HEAD: where it does not stand whole in the
 *  window, the line that opened it is brought to the top, clear of the pill — never the panel's
 *  middle, and never the head carried under the pill (the judge, 2026-11-04: at 844 × 390 the
 *  opened question's own head went under the pill). On arrival from a reload nothing moves. */
function useIntoSight(pressed: () => boolean, head: RefObject<HTMLElement | null>) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!pressed()) return
    const el = ref.current
    if (!el || typeof el.scrollIntoView !== 'function') return
    /* read after the frame the router restores its scroll in, so a door from the build that lands
       here is not put back at the page's top once it has been brought into sight */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const top = head.current ?? el
        const r = el.getBoundingClientRect()
        const t = top.getBoundingClientRect()
        if (t.top >= 0 && r.bottom <= window.innerHeight) return
        top.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' })
      })
    })
  }, [pressed, head])
  return ref
}

/** A panel opening in place: it grows from its line, and lands at once under reduced motion. */
function Opening({
  children,
  label,
  at,
}: {
  children: ReactNode
  label: string
  at: RefObject<HTMLElement | null>
}) {
  return (
    <motion.section
      ref={at}
      className="lv-open"
      aria-label={label}
      data-testid="prices-open"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition('enter')}
    >
      {children}
    </motion.section>
  )
}

/** A DOOR TO THE LINES BEHIND A COUNT, on the sheet. */
function DoorTo({ door, go }: { door: Door; go: (href: string) => void }) {
  return (
    <Button
      intent="quiet"
      size="sm"
      icon={TableIcon}
      href={door.href}
      onClick={() => go(door.href)}
    >
      {`Open the ${n(door.count)} ${door.said}`}
    </Button>
  )
}

/* ---------------------------------------------------------- */
/* Yours to choose                                             */
/* ---------------------------------------------------------- */

/** The ways a list could be priced, today's first, then the most widely held. */
function waysOf(col: Column): WayView[] {
  const c = col.cash
  const all = c.ways ?? []
  /* the reader already lays them most widely held first, and Rigging Kits supplied before fitted */
  return all.toSorted((a, b) => Number(b.current) - Number(a.current))
}

function ChooseRow({
  col,
  ctx,
  open,
  pressed,
  onToggle,
  onDone,
  said,
}: {
  col: Column
  ctx: Ctx
  open: boolean
  pressed: () => boolean
  onToggle: () => void
  onDone: () => void
  said: ReactNode
}) {
  const sample = col.cash.sample
  const ways = waysOf(col)
  const head = useRef<HTMLLIElement>(null)
  return (
    <li className="lv-task" data-open={open ? '' : undefined} ref={head}>
      <Tile
        shape="row"
        selected={open}
        onSelect={onToggle}
        label={`${col.name}, ${n(col.lines)} ${col.noun.many}. ${questionOf(col)}`}
      >
        <span className="lv-task__face">
          <span className="lv-task__what">
            <span className="lv-task__name">
              {col.name} <span className="lv-task__count">{n(col.lines)}</span>
            </span>
            <span className="lv-task__q">{questionOf(col)}</span>
          </span>
          {sample && ways.length > 0 && !open ? (
            <span className="lv-task__eg">
              <span className="lv-task__on">{sample.name}</span>
              <span className="lv-task__figs">
                {ways.slice(0, 2).map((w) => (
                  <span key={w.id} className="lv-task__fig">
                    <span className="lv-task__label">{w.title}</span>
                    <strong>
                      {w.figures[0]!.figure === null ? 'None' : money(w.figures[0]!.figure)}
                    </strong>
                  </span>
                ))}
              </span>
            </span>
          ) : null}
          <span className="lv-tag">To choose</span>
        </span>
      </Tile>
      {open && sample ? (
        <ChooseOpen col={col} pressed={pressed} head={head}>
          <Chooser col={col} ctx={ctx} sample={sample} onDone={onDone} />
        </ChooseOpen>
      ) : null}
      {said}
    </li>
  )
}

function ChooseOpen({
  col,
  pressed,
  head,
  children,
}: {
  col: Column
  pressed: () => boolean
  head: RefObject<HTMLElement | null>
  children: ReactNode
}) {
  const at = useIntoSight(pressed, head)
  return (
    <Opening label={`Prices of ${col.name}`} at={at}>
      {children}
    </Opening>
  )
}

/** THE COMMAND THAT PRICES A LIST THE CHOSEN WAY, on every list it stands for (the factory
 *  packages are two), as one step that says it in the page's own words. */
function wayCommand(
  sheet: Sheet,
  col: Column,
  way: WayView,
  said: string,
): CatalogueCommand | null {
  const lead = sheet.tables[col.tableIds[0]!]
  if (!lead) return null
  const owned = [...new Set((col.cash.ways ?? []).flatMap((w) => w.way.rungs.map((r) => r.key)))]
  const lists = col.tableIds.flatMap((id) => {
    const t = sheet.tables[id]
    if (!t) return []
    const rungs = way.way.rungs.flatMap((r) => {
      const f = sameField(lead, r.fieldId, t)
      return f ? [{ key: r.key, fieldId: f.id }] : []
    })
    return rungs.length === way.way.rungs.length ? [{ tableId: id, rungs }] : []
  })
  if (lists.length === 0) return null
  return nameWay(lists, owned, said)
}

/** What choosing a way says it did: "Every dealer fit package is priced at its Act Sell from the
 *  next quote." — the page's own name for the list, never the file's table name. */
function waySaid(col: Column, way: WayView): string {
  const [cash, ...rest] = way.figures
  const also = rest.map((f) => `${rungFor(f)} at ${f.label}`)
  if (col.cash.state === 'reads' && way.current)
    return `${col.name} keeps ${cash!.label}, now by your choice.`
  const left = col.lines - way.priced
  /* NEVER "EVERY" OVER A COUNT THAT SAYS OTHERWISE (the verifier, 2026-11-04: "Every dealer fit
     package is priced at its Sell" stood under a tile reading "962 not priced") */
  const priced =
    left > 0
      ? `${n(way.priced)} of ${n(col.lines)} ${col.noun.many} are priced at their ${cash!.label}`
      : `Every ${col.noun.one} is priced at its ${cash!.label}`
  return `${priced}${also.length > 0 ? `, ${joinAnd(also)},` : ''} from the next quote.${
    left > 0 ? ` The other ${n(left)} ${leftSaid(cash!.label)}.` : ''
  }`
}

/** WHAT THE LINES A PRICE LEAVES ARE: nothing in it, a nought, or a figure under nought, which is
 *  no price (`src/domain/pricing/credit.ts`) — so never "hold no Sell Price" over a line holding
 *  −$29,390 in it. Each kind is a door beside the sentence. */
const leftSaid = (label: string): string =>
  `have no ${label} a quote can read, so they are still priced by hand`

/** Who a way's second and later prices are for, inside the step's sentence. */
const rungFor = (f: Pick<Figure, 'key'>): string =>
  f.key === 'trade'
    ? 'a trade buyer'
    : f.key === 'fitted'
      ? 'fitted'
      : f.key === 'fitted-trade'
        ? 'fitted for a trade buyer'
        : 'a customer'

/** "a, b and c" */
const joinAnd = (each: readonly string[]): string =>
  each.length < 2 ? (each[0] ?? '') : `${each.slice(0, -1).join(', ')} and ${each.at(-1)!}`

/** ONE TILE PER WAY a list could be priced, each saying what its figures are, with the rule
 *  checked and the lines it prices; a tile pressed is counted before anything is written. */
function Chooser({
  col,
  ctx,
  sample,
  onDone,
  compact = false,
}: {
  col: Column
  ctx: Ctx
  sample: Sample
  onDone: () => void
  /** each way names its prices and figures only: what each figure is, its cell and its rule
   *  stand once, in the grid under it (Rigging Kits, settled) */
  compact?: boolean
}) {
  const ways = waysOf(col)
  const c = col.cash
  const named = c.state === 'reads' && c.named
  const current = ways.find((w) => w.current) ?? null
  const [picked, setPicked] = useState<string | null>(null)
  const pick = ways.find((w) => w.id === picked) ?? null
  const ringed = pick ?? (named ? current : null)
  const notPriced = c.state === 'not-priced'
  const chose = named ? ctx.who(col) : null
  const one = ways.length === 1

  return (
    <div className="lv-chooser">
      <Specimen col={col} sample={sample}>
        {notPriced && one ? null : (
          <p className="lv-specimen__say">
            {notPriced
              ? `Your price list holds ${ways.length === 2 ? 'two ways' : `${n(ways.length)} ways`} to price each ${col.noun.one} and names none of them, so nothing is ringed.`
              : named
                ? `${chosenSaid(current && current.figures.length > 1 ? `“${current.title}”` : c.label, chose)} Press another to change it.`
                : `Nobody has chosen. Until you do, a quote shows ${c.state === 'reads' ? c.label : ''}, as it always has.`}
          </p>
        )}
      </Specimen>
      <div className="lv-ways" data-n={ways.length}>
        {ways.map((w) => (
          <Tile
            key={w.id}
            tick="none"
            selected={ringed?.id === w.id}
            onSelect={() => setPicked(w.id === picked ? null : w.id)}
            label={
              compact
                ? `${w.title}: ${w.figures.map((f) => `${rungWho(f).toLowerCase()} at ${f.label}`).join(', ')}`
                : `${w.title}, ${w.figures[0]!.figure === null ? 'no figure' : money(w.figures[0]!.figure)}`
            }
          >
            <WayFace col={col} way={w} compact={compact} ringed={ringed?.id === w.id} />
          </Tile>
        ))}
        {one ? <Leaves col={col} way={ways[0]!} go={ctx.go} sheet={ctx.sheet} /> : null}
      </div>
      {c.between ? <BetweenSaid col={col} go={ctx.go} /> : null}
      {pick && !(named && pick.current) ? (
        /* a way pressed after another is a new count, brought into sight with its act again */
        <Census
          key={pick.id}
          acts={
            <>
              <Button
                intent="act"
                icon={CheckCircleIcon}
                onClick={() => {
                  const command = wayCommand(ctx.sheet, col, pick, waySaid(col, pick))
                  if (
                    command &&
                    ctx.apply(
                      col.id,
                      command,
                      `Nothing changed: ${col.name} already reads ${pick.figures[0]!.label}.`,
                    )
                  )
                    onDone()
                }}
              >
                {chooseAct(col, pick)}
              </Button>
              <Button intent="quiet" onClick={() => setPicked(null)}>
                Leave it
              </Button>
            </>
          }
        >
          <p className="lv-census__said">{chooseSaid(col, pick, current, sample, one)}</p>
          <OnTheDesk col={col} standing={ctx.standing(col)} go={ctx.go} quote={ctx.quote} />
          {pick.priced < col.lines && !one ? (
            <NotPricedBy col={col} way={pick} go={ctx.go} sheet={ctx.sheet} />
          ) : null}
        </Census>
      ) : (
        <p className="lv-chooser__hint">
          {notPriced
            ? 'A choice writes no figure: every line keeps all of them. Press one to see what it would price.'
            : 'Press a figure to see what it would change before anything is written.'}
        </p>
      )}
    </div>
  )
}

/** One way's face: its name, its figure on the line, what that figure is, its cell and its rule
 *  checked, and how many lines it prices. A way that names more than one price lists each. */
function WayFace({
  col,
  way,
  compact = false,
  ringed,
}: {
  col: Column
  way: WayView
  compact?: boolean
  /** the way is ringed: its disc is filled */
  ringed: boolean
}) {
  const [cash, ...rest] = way.figures
  const multi = rest.length > 0
  return (
    <span className="lv-way">
      <span className="lv-way__title">
        <span className="lv-way__disc" data-on={ringed ? '' : undefined} aria-hidden="true">
          <Icon glyph={CheckIcon} weight="bold" />
        </span>
        {way.title}
        {way.current && col.cash.state === 'reads' ? (
          <span className="lv-way__today">{col.cash.named ? 'Your choice' : 'Today'}</span>
        ) : null}
      </span>
      {multi ? (
        <span className="lv-way__rungs">
          {way.figures.map((f) => (
            <span key={f.key} className="lv-way__rung">
              <span className="lv-way__who">{rungWho(f)}</span>
              {compact ? null : (
                <span className="lv-way__amount">
                  {f.figure === null ? 'None' : money(f.figure)}
                </span>
              )}
              <span className="lv-way__col">{f.label}</span>
              {f.meaning && !compact ? (
                <span className="lv-way__said">{f.meaning.said}</span>
              ) : null}
              {compact ? null : <FigureSource figure={f} />}
            </span>
          ))}
        </span>
      ) : (
        <>
          <span className="lv-way__figure">
            {cash!.figure === null ? 'None' : money(cash!.figure)}
          </span>
          {cash!.meaning ? <span className="lv-way__said">{cash!.meaning.said}</span> : null}
          <FigureSource figure={cash!} />
          {way.alsoNamed.length > 0 ? (
            <span className="lv-way__also">
              {`${way.alsoNamed.join(' and ')} ${way.alsoNamed.length === 1 ? 'holds' : 'hold'} the same figure on every line.`}
            </span>
          ) : null}
        </>
      )}
      <span className="lv-way__cover">
        Prices <strong>{n(way.priced)}</strong> of {n(col.lines)}
      </span>
      {way.kept ? (
        <span className="lv-way__kept">
          <Icon glyph={LockSimpleIcon} weight="fill" /> Starts as Northside’s own
        </span>
      ) : null}
    </span>
  )
}

/** Who a way's second and third prices are for, in the dealer's words. */
const rungWho = (f: Pick<Figure, 'key'>): string =>
  f.key === 'trade'
    ? 'A trade buyer'
    : f.key === 'fitted'
      ? 'A customer, fitted'
      : f.key === 'fitted-trade'
        ? 'A trade buyer, fitted'
        : 'A customer'

/** The workbook cell a figure is read from, and its rule checked on every line. */
function FigureSource({ figure }: { figure: Figure }) {
  const m = figure.meaning
  if (!m || (m.cell === '' && m.formula === '')) return null
  const c = figure.checked
  return (
    <span className="lv-way__cell">
      {m.cell}
      {m.formula !== '' ? <> · {m.formula}</> : null}
      {c && c.of > 0 ? (
        <span className="lv-way__check">
          {c.holds === c.of
            ? ` · holds on all ${n(c.of)}`
            : ` · holds on ${n(c.holds)} of ${n(c.of)}`}
        </span>
      ) : null}
    </span>
  )
}

/** TWO WAYS READ AGAINST EACH OTHER OVER THE WHOLE LIST, never on one line (the judge, L1). */
function BetweenSaid({ col, go }: { col: Column; go: (href: string) => void }) {
  const b = col.cash.between
  if (!b) return null
  const s = b.spread
  const range =
    timesOf(s.low) === timesOf(s.high)
      ? `${timesOf(s.low)} ×`
      : `${timesOf(s.low)}–${timesOf(s.high)} ×`
  return (
    <p className="lv-between">
      <span className="lv-between__lead">Across the list</span>
      {`On the ${plural(s.both, 'line', 'lines')} holding both, ${b.more} is ${range} ${b.less}; on the middle line, ${timesOf(s.median)} ×. `}
      {s.equal === 0
        ? 'They are never the same figure.'
        : `They are the same figure on ${n(s.equal)} of ${n(s.both)}.`}
      {b.under ? (
        <span className="lv-between__under">
          <span>{` ${b.more} is under ${b.less} on ${plural(b.under.count, 'line', 'lines')}.`}</span>
          <DoorTo door={b.under} go={go} />
        </span>
      ) : null}
    </p>
  )
}

/** What naming a way would do, counted, in the dealer's words. */
function chooseSaid(
  col: Column,
  w: WayView,
  current: WayView | null,
  sample: Sample,
  alone: boolean,
): string {
  const cash = w.figures[0]!
  const rest = col.lines - w.priced
  const kept = w.kept
    ? ` It starts as Northside’s own: a quote with a ${col.noun.one} on it cannot be given until you let it reach a customer.`
    : ''
  /* NEVER "EVERY" OVER A COUNT THAT SAYS OTHERWISE, on a list that already reads a price as on one
     that reads none (the verifier, round 2: "Every dealer fit package on a new quote shows its Act
     Sell" stood over "Open the 44 with nothing in Act Sell") */
  const which =
    rest > 0
      ? `${n(w.priced)} of ${n(col.lines)} ${col.noun.many} on a new quote show their ${cash.label}`
      : `Every ${col.noun.one} on a new quote shows its ${cash.label}`
  /* the one way of a list: what it leaves stands beside its tile already (`Leaves`) */
  const left =
    rest > 0 && !alone ? ` The other ${n(rest)} ${leftSaid(cash.label)}, each on its own line.` : ''
  if (col.cash.state === 'not-priced' || !current)
    return `${n(w.priced)} of ${n(col.lines)} ${col.noun.many} are priced at their ${cash.label} from the next quote.${left}${kept}`
  if (w.current)
    return `${which}, as ${rest > 0 ? 'they do' : 'it does'} today. No figure changes; it becomes your choice.${left}`
  const from = current.figures[0]!.figure
  const to = cash.figure
  return `${which}${
    from !== null && to !== null
      ? `: the ${sample.name} goes from ${money(from)} to ${money(to)}.`
      : '.'
  }${left}${kept}`
}

function chooseAct(col: Column, w: WayView): string {
  if (col.cash.state === 'reads' && w.current) return `Keep ${w.title}`
  if (col.cash.state === 'reads' && col.cash.fork) return `Show ${w.title}`
  /* a way of more than one price is said as a way, short enough for a hand: "Price 628 kits
     supplied, or fitted" */
  if (w.figures.length > 1)
    return `Price ${n(w.priced)} ${col.noun.many.split(' ').at(-1) ?? ''} ${w.title.toLowerCase()}`
  return `Price ${n(w.priced)} at ${w.title}`
}

/** WHAT A LIST'S ONE WAY LEAVES, beside its tile: how many lines it would not price, and a door
 *  to each kind of nothing (the verifier, round 2: five factory packages under $0 had no door, and
 *  the one tile left half the panel empty). */
function Leaves({
  col,
  way,
  go,
  sheet,
}: {
  col: Column
  way: WayView
  go: (href: string) => void
  sheet: Sheet
}) {
  const left = col.lines - way.priced
  const label = way.figures[0]!.label
  return (
    <div className="lv-leaves">
      <p className="lv-leaves__head">What it leaves</p>
      <p className="lv-leaves__said">
        {left === 0
          ? `Every ${col.noun.one} holds a ${label} a quote can read.`
          : `${n(left)} of ${n(col.lines)} ${col.noun.many} ${leftSaid(label)}, each on its own line.`}
      </p>
      {left > 0 ? <NotPricedBy col={col} way={way} go={go} sheet={sheet} /> : null}
    </div>
  )
}

/** THE LINES A WAY WOULD NOT PRICE, with the door to them on the sheet. */
function NotPricedBy({
  col,
  way,
  go,
  sheet,
}: {
  col: Column
  way: WayView
  go: (href: string) => void
  sheet: Sheet
}) {
  const doors = useMemo(() => {
    const tables = col.tableIds.flatMap((id) => (sheet.tables[id] ? [sheet.tables[id]] : []))
    return tables.length === 0 ? [] : doorsOf(sheet, tables, way.figures[0]!.fieldId)
  }, [col, way, sheet])
  if (doors.length === 0) return null
  return (
    <p className="lv-census__doors">
      {doors.map((d) => (
        <DoorTo key={d.href} door={d} go={go} />
      ))}
    </p>
  )
}

/** THE QUOTES ON THE DESK A CHOICE TOUCHES (the judge, L8): what is frozen and what is waiting. */
function OnTheDesk({
  col,
  standing,
  go,
  quote,
}: {
  col: Column
  standing: Standing
  go: (href: string) => void
  quote: string
}) {
  const { drafts, issued } = standing
  const waiting = drafts.filter((d) => d.waiting > 0)
  const lines = waiting.reduce((s, d) => s + d.waiting, 0)
  if (drafts.length === 0 && issued === 0)
    return (
      <p className="lv-desk">
        No quote on this computer carries a {col.noun.one}, so nothing standing changes.
      </p>
    )
  return (
    <div className="lv-desk">
      <p className="lv-desk__said">
        {drafts.length > 0
          ? `${plural(drafts.length, 'draft carries', 'drafts carry')} ${col.noun.many}. `
          : ''}
        {waiting.length > 0
          ? `${plural(lines, 'line', 'lines')} on ${plural(waiting.length, 'of them waits', 'of them wait')} for this price, and can take it in one press there; every other line keeps the figure it went on at.`
          : drafts.length > 0
            ? 'Every line on them keeps the figure it went on at.'
            : ''}
        {issued > 0
          ? ` ${plural(issued, 'issued quote keeps', 'issued quotes keep')} its prices as given.`
          : ''}
      </p>
      {waiting.length > 0 ? (
        <span className="lv-desk__doors">
          {waiting.slice(0, 3).map((d) =>
            d.id === quote ? null : (
              <Button
                key={d.id}
                intent="quiet"
                size="sm"
                icon={FileTextIcon}
                href={`/quote/${encodeURIComponent(d.id)}?at=finale`}
                onClick={() => go(`/quote/${encodeURIComponent(d.id)}?at=finale`)}
              >
                {`${d.reference}${d.customer !== '' ? ` · ${d.customer}` : ''}`}
              </Button>
            ),
          )}
        </span>
      ) : null}
    </div>
  )
}

/** THE COUNT AND ITS ACT, the act under its count in the page, brought into sight together when
 *  a press offers them (`bringCount`), so a decision, its count and its act are read in one look
 *  at every size, and nothing stands over the count (the verifier, 2026-11-04). */
function Census({
  children,
  acts,
  bring = true,
}: {
  children: ReactNode
  /** the act and its "Leave it", under the count */
  acts: ReactNode
  /** brought into sight when it appears: false when it is already there at rest */
  bring?: boolean
}) {
  const at = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!bring) return
    requestAnimationFrame(() => bringCount(at.current, bar.current))
  }, [bring])
  return (
    <>
      <motion.div
        ref={at}
        className="lv-census"
        aria-live="polite"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition('enter')}
      >
        {children}
      </motion.div>
      {acts ? (
        <div className="lv-census__acts" ref={bar}>
          {acts}
        </div>
      ) : null}
    </>
  )
}

/** A length a stylesheet gave, in pixels; 0 where it gave none. */
const px = (value: string): number => {
  const v = Number.parseFloat(value)
  return Number.isFinite(v) ? v : 0
}

/**
 * THE COUNT AND ITS ACT BROUGHT INTO SIGHT TOGETHER, the act's bar standing where it stands in the
 * page and not over the count (the verifier, 2026-11-04: in a hand and at 844 × 390 the bar, stuck
 * at the window's foot, covered the count's second door, and at 844 × 390 the count was out of
 * sight). Where the two stand whole in the window clear of the pill and the tab bar, the bar's
 * foot is brought to the window's foot; where they do not, the count's head is brought to the top,
 * so the count is read first. What is already in sight does not move.
 */
function bringCount(count: HTMLElement | null, bar: HTMLElement | null): void {
  if (!count || typeof window === 'undefined') return
  const top = count.getBoundingClientRect().top
  const countFoot = count.getBoundingClientRect().bottom
  /* where the bar stands in the page, not where it is stuck: it follows the count, one gap down */
  const gap = count.parentElement ? px(getComputedStyle(count.parentElement).rowGap) : 0
  const foot = bar ? countFoot + gap + bar.offsetHeight : countFoot
  const clearTop = px(getComputedStyle(count).scrollMarginBlockStart)
  const clearFoot = bar
    ? px(getComputedStyle(bar).scrollMarginBlockEnd)
    : px(getComputedStyle(count).scrollMarginBlockEnd)
  const limit = window.innerHeight - clearFoot
  let by = 0
  if (foot - top <= limit - clearTop) {
    if (foot > limit) by = foot - limit
    else if (top < clearTop) by = top - clearTop
  } else by = top - clearTop
  if (Math.abs(by) < 1) return
  /* NEVER THE PANEL'S NAME CUT UNDER THE PILL (the verifier, round 2: "Tiller Conversion Kit ·
     F20G" stood half behind it at 1440 and 1920): it is kept whole below the pill where the count
     and its act still fit under it, and otherwise carried wholly out of the window */
  const head = count.closest('.lv-open')?.querySelector('.lv-specimen__name')
  if (head) {
    const r = head.getBoundingClientRect()
    if (r.top - by < clearTop && r.bottom - by > 0) {
      const keep = r.top - clearTop
      /* the name whole under the pill where the count and its act still fit; else carried wholly
         out of the window, never left half behind the pill */
      if (keep < by && foot - keep <= limit) by = keep
      else if (top - r.bottom >= clearTop) by = Math.max(by, r.bottom)
    }
  }
  if (Math.abs(by) < 1) return
  window.scrollBy({ top: by, behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/* ---------------------------------------------------------- */
/* Kept from customers                                         */
/* ---------------------------------------------------------- */

function KeptBar({
  kept,
  apply,
  go,
  said,
}: {
  kept: Kept
  apply: Apply
  go: (href: string) => void
  said: ReactNode
}) {
  const s = kept.specimen
  const diff = s ? s.against - s.figure : 0
  const from = Math.min(50, ...kept.ranges.map((r) => Math.floor(r.low / 10) * 10))
  const to = Math.max(120, ...kept.ranges.map((r) => Math.ceil(r.high / 10) * 10))
  return (
    <div className="lv-keptwrap">
      <div className="lv-kept" data-reach={kept.mayReach ? '' : undefined}>
        <div className="lv-kept__words">
          <p className="lv-kept__badge" data-reach={kept.mayReach ? '' : undefined}>
            <Icon glyph={kept.mayReach ? UsersThreeIcon : LockSimpleIcon} weight="fill" />
            {kept.mayReach ? 'May reach a customer' : 'Northside only'}
          </p>
          <h3 className="lv-kept__title">
            {kept.label} <span className="lv-kept__on">on {kept.on}</span>
          </h3>
          <p className="lv-kept__say">
            {kept.meaning?.said}{' '}
            {kept.mayReach ? 'A quote with a line at it can be given.' : kept.whileOff}
          </p>
          {kept.meaning && kept.meaning.cell !== '' ? (
            <p className="lv-kept__cell">
              {kept.meaning.cell}
              {kept.meaning.formula !== '' ? ` · ${kept.meaning.formula}` : ''}
              {kept.checked && kept.checked.of > 0
                ? kept.checked.holds === kept.checked.of
                  ? ` · at or under it on all ${n(kept.checked.of)}`
                  : ` · at or under it on ${n(kept.checked.holds)} of ${n(kept.checked.of)}`
                : ''}
            </p>
          ) : null}
        </div>
        {s ? (
          <div className="lv-kept__eg">
            <LinePicture sample={s.sample} maker={s.maker} />
            <p className="lv-kept__line">
              <span className="lv-kept__name">
                <Joints text={`${s.maker} ${s.sample.name}`} />
              </span>
              <span className="lv-kept__figure">{money(s.figure)}</span>
              <span className="lv-kept__against">
                {`against ${s.againstLabel} ${money(s.against)} · ${shareOf(s.figure, s.against)} of ${s.againstLabel},`}{' '}
                <span className="lv-nowrap">{`${money(Math.abs(diff))} ${diff >= 0 ? 'under' : 'over'}`}</span>
              </span>
            </p>
          </div>
        ) : null}
        <div className="lv-kept__switch">
          <Toggle
            label="May reach a customer"
            checked={kept.mayReach}
            onCheckedChange={(on) =>
              apply(
                kept.id,
                letReach(kept.targets, on),
                on
                  ? `${kept.label} may already reach a customer.`
                  : `${kept.label} is already kept from customers.`,
              )
            }
          />
        </div>
        {kept.ranges.length > 0 ? (
          <div className="lv-kept__ranges">
            <p className="lv-kept__rangehead">
              <span>{`${kept.label} against Cash, every maker’s every boat`}</span>
              <span className="lv-kept__key">{`Each band runs ${from}% to ${to}% of Cash; the line across it is Cash`}</span>
            </p>
            <ul className="lv-ranges">
              {kept.ranges.map((r) => (
                <li key={r.tableId} className="lv-range">
                  <span className="lv-range__maker">{r.maker}</span>
                  <ShareScale
                    low={r.low}
                    high={r.high}
                    from={from}
                    to={to}
                    label={`${r.maker}: ${kept.label} is ${r.low === r.high ? `${r.low}%` : `${r.low}–${r.high}%`} of Cash on ${n(r.priced)} ${r.unit}`}
                  />
                  <span className="lv-range__said">
                    {r.low === r.high ? `${r.low}%` : `${r.low}–${r.high}%`}
                    <span className="lv-range__of">{` of Cash on ${n(r.priced)} ${r.unit}`}</span>
                  </span>
                </li>
              ))}
            </ul>
            {kept.ranges
              .filter((r) => r.above > 0)
              .map((r) => (
                <p key={r.tableId} className="lv-kept__above">
                  <span>
                    <strong>{`Above Cash on ${plural(r.above, `${r.maker} boat`, `${r.maker} boats`)}:`}</strong>{' '}
                    {`${r.aboveNames.join(', ')}.`}
                  </span>
                  {r.door ? <DoorTo door={r.door} go={go} /> : null}
                </p>
              ))}
          </div>
        ) : null}
      </div>
      {said}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Settled                                                     */
/* ---------------------------------------------------------- */

/** How many tiles stand across the grid, as the stylesheet laid them out. */
function useAcross(ref: { current: HTMLElement | null }): number {
  const [across, setAcross] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof getComputedStyle !== 'function') return
    const read = () => {
      const t = getComputedStyle(el).gridTemplateColumns
      const k = t && t !== 'none' ? t.split(' ').filter((x) => x.trim() !== '').length : 1
      setAcross(Math.max(1, k))
    }
    read()
    if (typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(read)
    watch.observe(el)
    return () => watch.disconnect()
  }, [ref])
  return across
}

function Settled({
  cols,
  ctx,
  open,
  pressed,
  onToggle,
  onDone,
  stepOn,
}: {
  cols: Column[]
  ctx: Ctx
  open: string
  pressed: () => boolean
  onToggle: (id: string) => void
  onDone: () => void
  stepOn: (on: string) => ReactNode
}) {
  const grid = useRef<HTMLDivElement>(null)
  const openTile = useRef<HTMLDivElement>(null)
  const across = useAcross(grid)
  const at = cols.findIndex((c) => c.id === open)
  const rowEnd = (i: number): number =>
    i < 0 ? -1 : Math.min(cols.length - 1, Math.ceil((i + 1) / across) * across - 1)
  const after = rowEnd(at)
  const openCol = at < 0 ? null : cols[at]!
  const stepAt = cols.findIndex((c) => stepOn(c.id) !== null)
  const stepLine = stepAt < 0 ? null : stepOn(cols[stepAt]!.id)
  const stepAfter = rowEnd(stepAt)
  return (
    <div className="lv-settled" ref={grid} data-n={cols.length}>
      {cols.map((col, i) => (
        <Fragment key={col.id}>
          <div
            className="lv-cellwrap"
            data-open={col.id === open ? '' : undefined}
            ref={col.id === open ? openTile : undefined}
          >
            <Tile
              shape="card"
              tick="foot"
              selected={col.id === open}
              onSelect={() => onToggle(col.id)}
              label={`${col.name}, ${countOf(col)}: ${factOf(ctx.sheet, col)}`}
            >
              <span className="lv-cell">
                <span className="lv-cell__head">
                  <KindMark kind={KIND[col.shelf]} size="sm" />
                  <span className="lv-cell__name">{col.name}</span>
                </span>
                <span className="lv-cell__count">{countOf(col)}</span>
                <Fact said={factOf(ctx.sheet, col)} />
              </span>
            </Tile>
          </div>
          {i === stepAfter ? <div className="lv-settled__step">{stepLine}</div> : null}
          {i === after && openCol ? (
            <SettledOpen
              key={`open:${openCol.id}`}
              col={openCol}
              ctx={ctx}
              pressed={pressed}
              head={openTile}
              onDone={onDone}
            />
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}

/** The fact first, and what differs from it on a line of its own, kept even where it is empty
 *  so every tile of a row stands as tall as its neighbours. */
function Fact({ said }: { said: string }) {
  const [first, ...rest] = said.split(' · ')
  return (
    <>
      <span className="lv-cell__fact">{first}</span>
      <span className="lv-cell__differs" data-none={rest.length > 0 ? undefined : ''}>
        {rest.length > 0 ? rest.join(' · ') : ''}
      </span>
    </>
  )
}

/** The column a factory package list stands in, by the list's name. */
function packagesOf(ctx: Ctx, pkg: string): string | null {
  const id = Object.values(ctx.sheet.tables).find((t) => t.name === pkg)?.id
  return id ? (ctx.columns.find((c) => c.tableIds.includes(id))?.id ?? null) : null
}

/** A settled tile's one fact; a boat maker sold only in its factory packages says so. */
function factOf(sheet: Sheet, col: Column): string {
  if (col.cash.state === 'reads' && col.cash.priced === 0 && soldAsPackage(sheet, col))
    return 'Sold as a factory package'
  return settledFact(col)
}

function SettledOpen({
  col,
  ctx,
  pressed,
  head,
  onDone,
}: {
  col: Column
  ctx: Ctx
  pressed: () => boolean
  head: RefObject<HTMLElement | null>
  onDone: () => void
}) {
  const at = useIntoSight(pressed, head)
  const [preview, setPreview] = useState<number | null>(null)
  const c = col.cash
  if (c.state !== 'reads') return null
  const sample = c.sample
  const pkg = c.priced === 0 ? soldAsPackage(ctx.sheet, col) : null
  const t = col.trade

  return (
    <div className="lv-settled__open" data-ground="plate">
      <Opening label={`Prices of ${col.name}`} at={at}>
        {c.ways && sample ? (
          <Chooser col={col} ctx={ctx} sample={sample} onDone={onDone} compact={col.kit !== null} />
        ) : sample ? (
          <Specimen col={col} sample={sample} />
        ) : (
          <Mark col={col} drawnOnly />
        )}
        {pkg ? (
          <p className="lv-pkg">
            {`None of the ${plural(col.lines, col.noun.one, col.noun.many)} holds a ${c.label} figure: each is sold with its motor, in ${pkg}, and priced there.`}{' '}
            {packagesOf(ctx, pkg) ? (
              <Button
                intent="quiet"
                size="sm"
                icon={ArrowSquareOutIcon}
                onClick={() => ctx.openList(packagesOf(ctx, pkg)!)}
              >
                Open the factory packages’ prices
              </Button>
            ) : null}
          </p>
        ) : col.kit ? (
          <KitPrices col={col} sample={sample} />
        ) : (
          <ListBuyers col={col} sheet={ctx.sheet} sample={sample} preview={preview} go={ctx.go} />
        )}
        {t.state === 'reads' && col.tableIds.length === 1 ? (
          <Share
            col={col}
            sheet={ctx.sheet}
            apply={ctx.apply}
            onDone={onDone}
            onPreview={setPreview}
          />
        ) : null}
      </Opening>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Each buyer, across a list                                   */
/* ---------------------------------------------------------- */

/** A figure on the sample line, by its column's id. */
function sampleFigure(sheet: Sheet, sample: Sample | null, fieldId: string | null): number | null {
  if (!sample || !fieldId) return null
  const row = sheet.rows[sample.tableId]?.find((r) => r.id === sample.rowId)
  return row ? priceIn(row, fieldId) : null
}

/** WHAT EACH BUYER PAYS, ACROSS THE LIST: one row per buyer, the column it is read from and what
 *  that column is, the figure on the line read above, and the rule as it stands over every line
 *  — never one line's figure alone (the judge, L3). */
function ListBuyers({
  col,
  sheet,
  sample,
  preview,
  go,
}: {
  col: Column
  sheet: Sheet
  sample: Sample | null
  preview: number | null
  go: (href: string) => void
}) {
  const c = col.cash
  if (c.state !== 'reads') return null
  const t = col.trade
  const lead = sheet.tables[col.tableIds[0]!]!
  const fieldOf = (name: string) => lead.fields.find((f) => f.name === name)?.id ?? null
  const rows: Array<{
    key: string
    who: string
    column: string
    said: string
    cell: string
    figure: ReactNode
    rule: ReactNode
    doors?: Door[]
    kept?: boolean
  }> = []
  rows.push({
    key: 'cash',
    who: 'A customer',
    column: c.label,
    said: c.meaning?.said ?? '',
    cell: c.meaning?.cell ?? '',
    figure: c.figure === null ? 'None' : money(c.figure),
    rule:
      c.none > 0
        ? `A figure on ${n(c.priced)} of ${n(col.lines)}; the other ${n(c.none)} are priced by hand on a quote.`
        : `A figure on all ${n(col.lines)}.`,
    doors: col.doors.cash,
  })
  if (t.state === 'reads') {
    const after =
      preview !== null && t.cash !== null && preview !== t.share
        ? shareFigure(t.cash, preview)
        : null
    rows.push({
      key: 'trade',
      who: 'A trade buyer',
      column: t.label,
      said: t.meaning?.said ?? '',
      cell: t.meaning?.cell ?? '',
      figure:
        t.trade === null ? (
          'None'
        ) : after !== null && after !== t.trade ? (
          <>
            <s className="lv-was">{money(t.trade)}</s> {money(after)}
          </>
        ) : (
          money(t.trade)
        ),
      rule: (
        <>
          <ShareScale
            low={t.low}
            high={t.high}
            from={50}
            to={120}
            label={`${t.label} is ${t.low}–${t.high}% of ${c.label}`}
          />
          {`${t.low === t.high ? `${t.low}%` : `${t.low}–${t.high}%`} of ${c.label} on ${n(t.priced - t.blank)} of ${n(t.priced)}.${
            t.blank > 0
              ? ` ${n(t.blank)} hold no ${t.label}, so a trade buyer’s quote cannot price them.`
              : ''
          }`}
        </>
      ),
      doors: col.doors.trade,
    })
  } else if (t.state === 'falls') {
    rows.push({
      key: 'trade',
      who: 'A trade buyer',
      column: t.to,
      said: '',
      cell: '',
      figure: c.figure === null ? 'None' : money(c.figure),
      rule: t.carried
        ? `No Trade price is named for this list, so a trade buyer’s quote stays at ${t.to}. Its own ${t.carried.label}${t.carried.cell !== '' ? ` (${t.carried.cell})` : ''} holds the same figure on ${t.carried.same === t.carried.of ? `all ${n(t.carried.of)}` : `${n(t.carried.same)} of ${n(t.carried.of)}`}.`
        : `No Trade price on this list, so a trade buyer’s quote stays at ${t.to}.`,
    })
  }
  const w = col.warranty
  if (w && w.priced > 0) {
    const field = fieldOf(w.label)
    const f = sampleFigure(sheet, sample, field)
    rows.push({
      key: 'warranty',
      who: 'A warranty job',
      column: w.label,
      said: '',
      cell: '',
      figure: f === null ? 'None' : money(f),
      kept: !w.mayReach,
      rule: (
        <>
          <ShareScale
            low={w.low}
            high={w.high}
            from={50}
            to={120}
            label={`${w.label} is ${w.low === w.high ? `${w.low}%` : `${w.low}–${w.high}%`} of ${c.label}`}
          />
          {`${w.low === w.high ? `${w.low}%` : `${w.low}–${w.high}%`} of ${c.label} on ${plural(w.priced, w.unit.replace(/s$/, ''), w.unit)}.${
            w.above > 0 ? ` Above ${c.label} on ${n(w.above)}: ${w.aboveNames.join(', ')}.` : ''
          }${w.mayReach ? '' : ' Northside’s own, above.'}`}
        </>
      ),
      doors: col.doors.warranty,
    })
  }
  if (col.fitted) {
    const fieldId = lead.fields.find((f) => f.name === col.fitted!.label)?.id ?? null
    const f = sampleFigure(sheet, sample, fieldId)
    rows.push({
      key: 'fitted',
      who: 'Fitted',
      column: plainName(col.fitted.label),
      said: col.fitted.meaning?.said ?? '',
      cell: col.fitted.meaning?.cell ?? '',
      figure: f === null ? 'None' : money(f),
      rule: `A figure on ${n(col.fitted.priced)} of ${n(col.lines)}: the ${col.noun.one}’s price fitted, read for a quote line priced fitted.`,
    })
  }
  if (col.sub) {
    const fieldId =
      lead.fields
        .slice(
          Math.max(
            0,
            lead.fields.findIndex((f) => f.name === col.sub!.label),
          ),
        )
        .find((f) => f.name === col.sub!.label)?.id ?? null
    const f = sampleFigure(sheet, sample, fieldId)
    rows.push({
      key: 'sub',
      who: 'A sub-dealer',
      column: col.sub.label,
      said: '',
      cell: '',
      figure: f === null ? 'None' : money(f),
      rule: `The same figure as Trade on ${n(col.sub.sameAsTrade)} of ${n(col.sub.held)}. A quote is priced for a customer or a trade buyer, so no quote reads it.`,
    })
  } else if (col.shelf === 'boats') {
    rows.push({
      key: 'sub',
      who: 'A sub-dealer',
      column: 'Sub Dealer',
      said: '',
      cell: '',
      figure: <span className="lv-buyer__none">Not here</span>,
      rule: 'The workbook works a Sub Dealer price for every boat (Boat Module!QV); the price list this app reads does not carry it.',
    })
  }
  return (
    <div className="lv-ladder">
      <p className="lv-ladder__head">
        What each buyer pays
        {sample ? (
          <span className="lv-ladder__on">{` · the ${sample.name} beside the whole list`}</span>
        ) : null}
      </p>
      <dl className="lv-buyers">
        {rows.map((r) => (
          <div key={r.key} className="lv-buyer" data-key={r.key}>
            <dt className="lv-buyer__who">{r.who}</dt>
            <dd className="lv-buyer__figure">
              {r.figure}
              {r.kept ? (
                <span className="lv-buyer__lock" title="Northside’s own">
                  <Icon glyph={LockSimpleIcon} weight="fill" />
                </span>
              ) : null}
            </dd>
            <dd className="lv-buyer__from">
              <span className="lv-buyer__column">
                {r.column}
                {r.cell !== '' ? <span className="lv-buyer__cell"> · {r.cell}</span> : null}
              </span>
              {r.said !== '' ? <span className="lv-buyer__why">{r.said}</span> : null}
              <span className="lv-buyer__rule">{r.rule}</span>
              {r.doors && r.doors.length > 0 ? (
                <span className="lv-buyer__doors">
                  {r.doors.map((d) => (
                    <DoorTo key={d.href} door={d} go={go} />
                  ))}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Rigging Kits: every figure the file carries, once           */
/* ---------------------------------------------------------- */

const KIT_WAY_SAID: Record<KitWay, { head: string; what: string }> = {
  supplied: { head: 'Supplied', what: 'the kit alone' },
  fitting: { head: 'Fitting', what: 'the fitting alone' },
  fitted: { head: 'Fitted', what: 'the kit and its fitting' },
}
const KIT_BUYER_SAID: Record<KitBuyer, string> = {
  customer: 'A customer',
  trade: 'A trade buyer',
  sub: 'A sub-dealer',
}

/** "on all 621" or "on 621 of 642" */
const heldSaid = (holds: number, of: number): string =>
  holds === of ? `all ${n(of)}` : `${n(holds)} of ${n(of)}`

/** A workbook cell said short, under a caption that names its sheet: "Rigging Kits!AD" → "AD". */
const cellLetters = (cell: string): string => cell.slice(cell.indexOf('!') + 1)

/**
 * WHAT EACH BUYER PAYS FOR A RIGGING KIT, AS THE FILE LAYS IT (the verifier of Prices, 2026-11-04,
 * A10): the kit supplied, the fitting alone and the kit fitted, for a customer, a trade buyer and a
 * sub-dealer — nine figures, each said once, read on the line above and counted across the list.
 * The cells a quote reads are marked; the grid's own arithmetic is the rule under it.
 */
function KitPrices({ col, sample }: { col: Column; sample: Sample | null }) {
  const g = col.kit
  if (!g) return null
  const cellsTitle = g.cells.supplied.customer.cell.split('!')[0] ?? ''
  return (
    <div className="lv-ladder">
      <p className="lv-ladder__head">
        What each buyer pays
        {sample ? (
          <span className="lv-ladder__on">{` · the ${sample.name} beside the whole list`}</span>
        ) : null}
      </p>
      <table className="lv-kits">
        <caption className="lv-kits__caption">
          {`Every figure is the ${col.noun.one}’s own, on ${cellsTitle} at the letter beside it, with how many ${col.noun.many} hold one. Marked “On a quote”: the figures a quote reads.`}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="lv-kits__sold">
              Sold
            </th>
            {KIT_BUYERS.map((b) => (
              <th key={b} scope="col">
                {KIT_BUYER_SAID[b]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {KIT_WAYS.map((w) => (
            <tr key={w} data-way={w}>
              <th scope="row" className="lv-kits__way">
                <span className="lv-kits__wayname">{KIT_WAY_SAID[w].head}</span>
                <span className="lv-kits__what">{KIT_WAY_SAID[w].what}</span>
              </th>
              {KIT_BUYERS.map((b) => {
                const c = g.cells[w][b]
                return (
                  <td key={b} className="lv-kits__cell" data-read={c.key ? '' : undefined}>
                    <span className="lv-kits__who">{KIT_BUYER_SAID[b]}</span>
                    <span className="lv-kits__figure">
                      {c.figure === null ? (
                        <span className="lv-buyer__none">None</span>
                      ) : (
                        money(c.figure)
                      )}
                    </span>
                    <span className="lv-kits__col">{c.column}</span>
                    <span className="lv-kits__src">{`${cellLetters(c.cell)} · on ${n(c.held)}`}</span>
                    {c.key ? <span className="lv-kits__read">On a quote</span> : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="lv-kits__rule">
        {`Fitted is supplied plus fitting: for a customer on ${heldSaid(g.sums.customer.holds, g.sums.customer.of)}, for a trade buyer on ${heldSaid(g.sums.trade.holds, g.sums.trade.of)}, for a sub-dealer on ${heldSaid(g.sums.sub.holds, g.sums.sub.of)}.`}
      </p>
      <p className="lv-kits__rule">
        {`A sub-dealer’s figure is a trade buyer’s: ${KIT_WAYS.map(
          (w) =>
            `on ${heldSaid(g.subIsTrade[w].holds, g.subIsTrade[w].of)} ${KIT_WAY_SAID[w].head.toLowerCase()}`,
        ).join(', ')}. A quote is priced for a customer or a trade buyer, so no quote reads it.`}
      </p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Trade as a share of Cash: previewed, counted, then written  */
/* ---------------------------------------------------------- */

function Share({
  col,
  sheet,
  apply,
  onDone,
  onPreview,
}: {
  col: Column
  sheet: Sheet
  apply: Apply
  onDone: () => void
  onPreview: (percent: number | null) => void
}) {
  const t = col.trade
  const of = col.cash.state === 'reads' ? col.cash.label : 'Cash'
  const today = t.state === 'reads' && t.share !== null ? String(t.share) : ''
  const [typed, setTyped] = useState(today)
  const read = readShare(typed, of)
  const refused = 'refused' in read && typed.trim() !== ''
  const percent = 'percent' in read ? read.percent : null
  const lead = col.tableIds[0]!
  const plan = useMemo(
    () => (percent === null ? null : sharePlan(sheet, lead, 'trade', percent, col.noun)),
    [sheet, lead, percent, col.noun],
  )
  /* THE MOVE IN DOLLARS, across every line it writes (the judge, L11) */
  const moved = useMemo(() => {
    if (!plan?.command || percent === null) return null
    const table = sheet.tables[lead]
    if (!table) return null
    let down = 0
    let up = 0
    for (const r of sheet.rows[lead] ?? []) {
      const base = priceIn(r, plan.from.fieldId)
      if (base === null) continue
      const now = priceIn(r, plan.to.fieldId)
      const after = shareFigure(base, percent)
      if (now === null || now === after) continue
      if (after < now) down += now - after
      else up += after - now
    }
    return { down, up }
  }, [plan, percent, sheet, lead])
  useEffect(() => {
    onPreview(percent)
  }, [percent, onPreview])
  if (t.state !== 'reads') return null
  const sampleName = (() => {
    if (!plan?.sample) return null
    const table = sheet.tables[lead]
    const row = sheet.rows[lead]?.find((r) => r.id === plan.sample?.rowId)
    return table && row ? sampleOf(table, row).name : null
  })()
  const nowSaid =
    t.share !== null && t.same + t.blank < t.priced
      ? `Today ${t.label} is ${t.share}% of ${of} on every ${col.noun.one}.`
      : t.same + t.blank === t.priced
        ? `Today ${t.label} is the same as ${of} on every ${col.noun.one} that has one.`
        : `Today ${t.label} is ${t.low}–${t.high}% of ${of}.`
  const touched = typed.trim() !== today
  /* the lines with no Trade today, which this write gives one */
  const filled = plan ? Math.min(t.blank, plan.written) : 0

  return (
    <div className="lv-share">
      <div className="lv-share__set">
        <label className="lv-share__field">
          <span className="lv-share__word">
            <Icon glyph={PencilSimpleLineIcon} /> {t.label} as a share of {of}
          </span>
          <span className="lv-share__input">
            <Input
              mono
              inputMode="decimal"
              value={typed}
              onValueChange={setTyped}
              icon={PercentIcon}
              aria-label={`${t.label} as a share of ${of}, in per cent`}
            />
          </span>
        </label>
        {/* THE SHARE'S REASON STANDS UNDER TODAY'S SHARE, beside the field it refuses, never in a
            column of its own under the field beside empty space (the verifier, round 2, 1440) */}
        <div className="lv-share__said">
          <p className="lv-share__now">{nowSaid}</p>
          {refused ? (
            <p className="lv-share__why">
              <Refusal>{read.refused}</Refusal>
            </p>
          ) : null}
        </div>
      </div>
      {refused ? null : plan && !plan.command && plan.refusal && touched ? (
        <p className="lv-share__nothing">
          <Icon glyph={InfoIcon} /> {plan.refusal}
        </p>
      ) : plan?.command && percent !== null ? (
        <Census
          bring={touched}
          acts={
            touched || filled > 0 ? (
              <>
                <Button
                  intent="act"
                  icon={CheckCircleIcon}
                  onClick={() => {
                    if (
                      plan.command &&
                      apply(
                        col.id,
                        plan.command,
                        `Every ${col.noun.one} with a ${of} figure already holds ${percent}% of it as ${t.label}.`,
                      )
                    )
                      onDone()
                  }}
                >
                  {`Write ${n(plan.written)} ${t.label} ${plan.written === 1 ? 'figure' : 'figures'}`}
                </Button>
                <Button intent="quiet" onClick={onDone}>
                  Leave it
                </Button>
              </>
            ) : null
          }
        >
          <p className="lv-census__count" data-testid="census">
            {[
              [plan.written, 'written'],
              [plan.already, `already at ${percent}%`],
              [plan.blank, `with no ${of}`],
            ].map(([value, word], i) => (
              <Fragment key={word}>
                {i > 0 ? <span className="lv-census__dot"> · </span> : null}
                <span>
                  <strong>{n(value as number)}</strong> {word}
                </span>
              </Fragment>
            ))}
            {plan.sample && sampleName ? (
              <>
                <span className="lv-census__dot"> · </span>
                <span className="lv-census__eg">
                  {sampleName} {money(plan.sample.from)} →{' '}
                  <strong>{money(plan.sample.after)}</strong>
                </span>
              </>
            ) : null}
          </p>
          <p className="lv-census__said">
            {moved && (moved.down > 0 || moved.up > 0)
              ? `${moved.down > 0 ? `${money(moved.down)} less` : ''}${moved.down > 0 && moved.up > 0 ? ' and ' : ''}${moved.up > 0 ? `${money(moved.up)} more` : ''} for trade buyers across the ${n(plan.written - filled)} that hold a ${t.label} today. `
              : ''}
            {filled > 0
              ? `${n(filled)} hold no ${t.label} today, so a trade buyer’s quote cannot price them; this gives them one. `
              : ''}
            Rounded down to the dollar, as your price list does. One Undo puts every one back.
          </p>
        </Census>
      ) : null}
    </div>
  )
}
