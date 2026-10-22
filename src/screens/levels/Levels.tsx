import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react'
import { motion } from 'motion/react'
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  FileTextIcon,
  InfoIcon,
  LockSimpleIcon,
  PercentIcon,
  SealCheckIcon,
  TagIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Icon,
  Input,
  KindMark,
  Refusal,
  Stat,
  Tile,
  Toggle,
  move,
  reducedMotion,
} from '@/ui'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { markOnPaper } from '@/data/pictures'
import { batch, isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  CASH,
  letReach,
  namePrice,
  readShare,
  shareFigure,
  sharePlan,
} from '@/domain/catalogue/priceCommands'
import { money } from '@/domain/money'
import { workedFromCost } from '@/domain/pricing/worked'
import type { TableKind } from '@/domain/model'
import {
  SHELF_TITLE,
  firstUndecided,
  readLadder,
  warrantyTargets,
  type Candidate,
  type Column,
  type Shelf,
  type Sheet,
} from './read'
import './levels.css'

/* ============================================================
   PRICES (`/levels`) — direction A, "The ladder", with board C's
   fence grafted in as a change of ground and board B's motor fork in
   the dock (docs/directions/levels-boards/, judged 2026-10-22).

   THE PRICE LIST READ AS A LADDER IN TWO FLIGHTS. The prices a customer
   may be quoted run down the left — Cash first, because every price a
   list lacks falls to it, then Trade — and the lists run across, one
   column each. THE BOATS ARE ONE FLIGHT and everything sold with them
   is the second, on the same seven columns so the two read as one
   ladder (built-critique-m3.md: fourteen lists across one ladder at
   1280 drew every maker's mark 46px wide and wrapped cells to five
   lines). Under the boats THE GROUND CHANGES: Warranty, which only a
   boat has, stands on Northside's dark ground, because it never reaches
   a customer, and the change of ground is the fence.

   THE ORDINARY IS QUIET. A price that reads the price list as every
   list does is plain type ("All priced", "Same as Cash"); only what
   differs is a filled cell — Highfield's 95%, Formosa's nine with no
   price, the lists that are not priced, the Yamahas' two figures,
   Warranty. The eye lands on the handful of facts that matter.

   A LIST'S HEAD OPENS ITS PRICES IN PLACE, under its own flight at the
   desk and under its own card in a hand: the figures, the act, and what
   the act would write, counted BEFORE it writes. Every write is a
   command through the catalogue store (`priceCommands.ts`), so the
   hundreds of cells a share writes come back with one Undo — and that
   Undo STAYS where the write was made, on the step line under the open
   list's figures, until the next write replaces it, as the sheet's and
   Data's step lines do. It never lives only in a toast.
   ============================================================ */

export interface LevelsProps {
  /** the list whose figures are open, by its column id; '' for the screen's own choice */
  list: string
  onList: (list: string) => void
  /** where a computer with no copy of the price list goes to load one */
  openTheFile: () => void
}

const COUNT = new Intl.NumberFormat('en-AU')
const n = (value: number): string => COUNT.format(value)

/** The ladder is drawn as a ladder from this width; under it, a card per list. */
const WIDE = '(min-width: 1200px)'

/** Where the step line of Warranty's one switch is said: on the switch's own ground. */
const WARRANTY = 'warranty'

/** A list's head on the screen, by its list. */
const headOf = (id: string): Element | null =>
  typeof document === 'undefined' ? null : document.querySelector(`[data-list="${CSS.escape(id)}"]`)

function useWide(): boolean {
  const [wide, setWide] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(WIDE).matches
      : true,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const q = window.matchMedia(WIDE)
    const on = () => setWide(q.matches)
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  return wide
}

const KIND: Record<Shelf, TableKind> = {
  boats: 'boat',
  trailers: 'trailer',
  motors: 'motor',
  packages: 'package',
  parts: 'accessory',
}

/** What a list's head counts: a boat maker's models, as Data and the picker count them. */
const countOf = (col: Column): string =>
  col.models !== null ? `${n(col.models)} ${col.models === 1 ? 'model' : 'models'}` : ''

/* ---------------------------------------------------------- */
/* What each price says, once                                  */
/* ---------------------------------------------------------- */

/** How a cell is drawn: quiet type, a filled fact that differs, a decision that is the
 *  dealer's to make, or a price Northside keeps to itself. */
type Tone = 'quiet' | 'differs' | 'ask' | 'kept'

interface Said {
  tone: Tone
  /** the price list's own name for the figure, where it is not the price's own name */
  name?: string
  text: string
}

/* EACH CELL IS ONE SHORT FACT. The count of a list's lines is its head's, so a cell never says
   it again ("all 91" under a head that says 91); what a figure is a share of is the row's own
   word; and the long account is the open list's, under the ladder. */
function cashSaid(col: Column): Said {
  const c = col.cash
  if (c.state === 'not-priced')
    return {
      tone: 'ask',
      name: 'Not priced',
      text: `${c.candidates.length} figures to choose from`,
    }
  const name = c.label === 'Cash' ? undefined : c.label
  if (c.priced === 0) return { tone: 'differs', text: 'No price on any' }
  if (c.fork && !c.forkAgrees && !c.named)
    return { tone: 'ask', name, text: 'or another figure? Yours to choose' }
  if (!c.mayReach) return { tone: 'kept', name, text: 'Northside only, for now' }
  if (c.none > 0) return { tone: 'differs', name, text: `${n(c.priced)} of ${n(col.lines)} priced` }
  return { tone: 'quiet', name, text: c.named ? 'All priced · your choice' : 'All priced' }
}

function tradeSaid(col: Column): Said | null {
  const t = col.trade
  if (t.state === 'nothing' || col.cash.state === 'not-priced') return null
  if (t.state === 'falls') return { tone: 'quiet', text: `Stays at ${t.to}` }
  const of = col.cash.state === 'reads' ? col.cash.label : 'Cash'
  const name = t.label === 'Trade' ? undefined : t.label
  if (t.blank > 0)
    return {
      tone: 'differs',
      name,
      text: `Same as ${of} · ${n(t.blank)} have none`,
    }
  if (t.same === t.priced) return { tone: 'quiet', name, text: `Same as ${of}` }
  if (t.share !== null && t.same === 0)
    return { tone: 'differs', name, text: `${t.share}% of ${of}` }
  return { tone: 'differs', name, text: `${t.low}–${t.high}% of ${of}` }
}

function warrantySaid(col: Column): Said | null {
  const w = col.warranty
  if (!w) return null
  if (w.priced === 0) return { tone: 'quiet', text: 'None' }
  const share = w.low === w.high ? `${w.low}%` : `${w.low}–${w.high}%`
  return {
    tone: 'kept',
    text: `${share} of Cash${w.above > 0 ? ` · over Cash on ${n(w.above)}` : ''}`,
  }
}

/* ---------------------------------------------------------- */
/* The last write, and its way back                            */
/* ---------------------------------------------------------- */

/** WHAT THE SCREEN LAST SAID ABOUT A WRITE, and on which list: a step with its way back, a
 *  refusal with its reason, or a press that changed nothing, said as such. */
interface Step {
  /** the open list's id, or WARRANTY for the one switch on the night ground */
  list: string
  kind: 'step' | 'refused' | 'nothing'
  said: string
  eventId?: string
  wasUndo?: boolean
}

type Apply = (command: CatalogueCommand, nothing: string) => void

/** A part of the open list's figures: how it writes, and its last write said where it was made. */
interface Part {
  apply: Apply
  said: ReactNode
}

function StepLine({ step, onBack }: { step: Step; onBack: () => void }) {
  if (step.kind === 'refused')
    return (
      <p className="lv-alarm" role="alert" data-ground="plate">
        <Refusal>{step.said}</Refusal>
      </p>
    )
  return (
    <output className="lv-step" data-testid="last-step" data-ground="plate">
      <span className="lv-step__done" data-kind={step.kind} aria-hidden="true">
        <Icon glyph={step.kind === 'step' ? CheckCircleIcon : InfoIcon} weight="fill" />
      </span>
      <span className="lv-step__said">{step.said}</span>
      {step.kind === 'step' ? (
        <Button
          intent="secondary"
          size="sm"
          icon={step.wasUndo ? ArrowClockwiseIcon : ArrowCounterClockwiseIcon}
          onClick={onBack}
        >
          {step.wasUndo ? 'Put it back' : 'Undo'}
        </Button>
      ) : null}
    </output>
  )
}

/* ---------------------------------------------------------- */
/* The screen                                                  */
/* ---------------------------------------------------------- */

export function Levels({ list, onList, openTheFile }: LevelsProps) {
  const status = useCatalogue((s) => s.status)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const priceLevels = useCatalogue((s) => s.priceLevels)
  const ready = status === 'ready' && Object.keys(tables).length > 0
  const sheet = useMemo<Sheet>(() => ({ tables, rows, priceLevels }), [tables, rows, priceLevels])
  const columns = useMemo(() => (ready ? readLadder(sheet) : []), [ready, sheet])

  if (!ready || columns.length === 0) {
    return (
      <main className="lv" data-testid="levels">
        <header className="lv-head">
          <h1 className="lv-title">Which price each customer pays.</h1>
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

  return <Ladder columns={columns} sheet={sheet} list={list} onList={onList} />
}

function Ladder({
  columns,
  sheet,
  list,
  onList,
}: {
  columns: Column[]
  sheet: Sheet
  list: string
  onList: (list: string) => void
}) {
  const wide = useWide()
  /* ONE LIST IS ALWAYS OPEN: the one the address names, or the first a dealer still has to decide
     for (the Yamahas' two figures nobody has chosen between, a list with no price), or the first */
  const open = columns.find((c) => c.id === list) ?? firstUndecided(columns) ?? columns[0]!
  const dock = useRef<HTMLElement>(null)
  /* the pressed head's place in the window when it was pressed, or null when nothing was pressed */
  const pressed = useRef<number | null>(null)

  /* ---- the writes, and the way back ---------------------------- */

  const [step, setStep] = useState<Step | null>(null)

  const apply = useCallback((on: string, command: CatalogueCommand, nothing: string) => {
    const outcome = catalogue.getState().apply(command)
    if (!isDone(outcome)) {
      /* A PRESS THAT CHANGES NOTHING SAYS SO (CLAUDE.md: never a silent refusal). The command
         answers '' when there was nothing to do; the screen knows what was pressed, and says it. */
      setStep(
        outcome.refused === ''
          ? { list: on, kind: 'nothing', said: nothing }
          : { list: on, kind: 'refused', said: outcome.refused },
      )
      return
    }
    setStep({
      list: on,
      kind: 'step',
      said: outcome.said,
      eventId: outcome.event.id,
      wasUndo: false,
    })
  }, [])

  /* THE WAY BACK, PINNED TO THE STEP IT IS OFFERED FOR: Undo takes that step back and says so
     ("Undone — …"), and the same line then offers to put it back, as the sheet's does. */
  const goBack = useCallback(() => {
    if (!step || step.kind !== 'step') return
    const outcome = step.wasUndo
      ? catalogue.getState().redo()
      : catalogue.getState().undo(step.eventId)
    if (!isDone(outcome)) {
      setStep({
        list: step.list,
        kind: outcome.refused === '' ? 'nothing' : 'refused',
        said:
          outcome.refused === ''
            ? 'Nothing to put back: it already reads as it did before.'
            : outcome.refused,
      })
      return
    }
    setStep({
      list: step.list,
      kind: 'step',
      said: outcome.said,
      eventId: outcome.event.id,
      wasUndo: !step.wasUndo,
    })
  }, [step])

  const stepOn = (on: string): ReactNode =>
    step && step.list === on ? <StepLine step={step} onBack={goBack} /> : null

  const warranty = useMemo(() => warrantyTargets(columns), [columns])
  const warrantyOn = columns.some((c) => c.warranty?.mayReach === true)
  const warrantyLabel = columns.find((c) => c.warranty)?.warranty?.label ?? 'Warranty'
  const flipWarranty = useCallback(
    (on: boolean) =>
      apply(
        WARRANTY,
        letReach(warranty, on),
        on
          ? `${warrantyLabel} may already reach a customer.`
          : `${warrantyLabel} is already kept from customers.`,
      ),
    [apply, warranty, warrantyLabel],
  )

  /* A HEAD PRESSED OPENS ITS LIST'S FIGURES IN PLACE, and the screen moves only when they would
     open out of sight, or when the figures that closed above (another list's, under the first
     flight) carried the pressed flight up under the pill — and then it brings the open list's
     own flight (or card) to the clearance under the pill, so the heads a dealer just pressed are
     never left half under it. Only on a press: the screen never scrolls itself on arrival. */
  const press = useCallback(
    (id: string) => {
      pressed.current = headOf(id)?.getBoundingClientRect().top ?? 0
      onList(id)
    },
    [onList],
  )
  const openId = open.id
  useEffect(() => {
    const was = pressed.current
    if (was === null || openId === '') return
    pressed.current = null
    const at = dock.current
    if (!at || typeof window === 'undefined') return
    const place = at.previousElementSibling ?? at
    const clearance = Number.parseFloat(getComputedStyle(place).scrollMarginBlockStart) || 0
    const placeTop = place.getBoundingClientRect().top
    const top = at.getBoundingClientRect().top
    /* the head stayed where it was pressed, clear of the pill, and its figures open in sight */
    const moved = Math.abs((headOf(openId)?.getBoundingClientRect().top ?? was) - was)
    if (moved < 24 && placeTop >= clearance - 1 && top < window.innerHeight * 0.8) return
    place.scrollIntoView?.({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [openId])

  const docked = (
    <Dock
      key={open.id}
      col={open}
      sheet={sheet}
      cash={{
        apply: (command, nothing) => apply(`${open.id}#cash`, command, nothing),
        said: stepOn(`${open.id}#cash`),
      }}
      trade={{
        apply: (command, nothing) => apply(`${open.id}#trade`, command, nothing),
        said: stepOn(`${open.id}#trade`),
      }}
      ref={dock}
    />
  )
  const sw: WarrantySwitch = {
    warrantyOn,
    warrantyLabel,
    onWarranty: flipWarranty,
    said: stepOn(WARRANTY),
  }

  return (
    <main className="lv" data-testid="levels" data-read="">
      <header className="lv-head">
        <h1 className="lv-title">Which price each customer pays.</h1>
        <p className="lv-deck">
          Every quote starts at a list’s Cash price, and a list with no Trade price stays at its
          Cash for a trade buyer. Press a list to see its figures and set them.
        </p>
      </header>

      {wide ? (
        <Desk columns={columns} open={open} onPress={press} docked={docked} {...sw} />
      ) : (
        <Cards columns={columns} open={open} onPress={press} docked={docked} {...sw} />
      )}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* A list's head: its maker's mark, or its kind and its name   */
/* ---------------------------------------------------------- */

function Mark({ col }: { col: Column }) {
  const choice = col.markOf ? markOnPaper(col.markOf) : null
  if (choice?.drawn)
    return (
      <span className="lv-mark">
        <img
          src={choice.mark.src}
          width={choice.mark.width}
          height={choice.mark.height}
          alt={col.name}
          decoding="async"
        />
      </span>
    )
  return (
    <span className="lv-mark lv-mark--type">
      {col.markOf ? null : <KindMark kind={KIND[col.shelf]} size="sm" />}
      <span className="lv-mark__name">{col.name}</span>
    </span>
  )
}

function Head({ col, open, onPress }: { col: Column; open: boolean; onPress: () => void }) {
  const count = col.models ?? col.lines
  const noun = col.models !== null ? (count === 1 ? 'model' : 'models') : col.noun.many
  return (
    <div className="lv-headbox" data-head="" data-list={col.id}>
      <Tile
        shape="row"
        selected={open}
        onSelect={onPress}
        label={`${col.name}, ${n(count)} ${noun}`}
      >
        <span className="lv-headcell">
          <Mark col={col} />
          <span className="lv-count">{n(count)}</span>
        </span>
      </Tile>
    </div>
  )
}

function Cell({ said, at, on }: { said: Said | null; at: number; on: boolean }) {
  const style = { '--at': at } as CSSProperties
  if (!said) return <div className="lv-cell" style={style} data-on={on ? '' : undefined} />
  return (
    <div className="lv-cell" style={style} data-tone={said.tone} data-on={on ? '' : undefined}>
      {said.name ? <span className="lv-cell__name">{said.name}</span> : null}
      <span className="lv-cell__text">{said.text}</span>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* At the desk: the ladder, in two flights                     */
/* ---------------------------------------------------------- */

interface WarrantySwitch {
  warrantyOn: boolean
  warrantyLabel: string
  onWarranty: (on: boolean) => void
  /** the switch's last write and its way back, said on the switch's own ground */
  said: ReactNode
}

/** WARRANTY'S ONE SWITCH, for every boat list at once, with what it costs a quote while off. */
function WarrantySwitchOf({ warrantyOn, warrantyLabel, onWarranty }: WarrantySwitch) {
  return (
    <div className="lv-switch">
      <Toggle label="May reach a customer" checked={warrantyOn} onCheckedChange={onWarranty} />
      <span className="lv-switch__say">
        {warrantyOn
          ? `A quote with a line at ${warrantyLabel} can be given.`
          : `While it is off, a quote with a line at ${warrantyLabel} cannot be given.`}
      </span>
    </div>
  )
}

function Desk({
  columns,
  open,
  onPress,
  docked,
  ...sw
}: {
  columns: Column[]
  open: Column
  onPress: (id: string) => void
  docked: ReactNode
} & WarrantySwitch) {
  /* THE BOATS, AND WHAT IS SOLD WITH THEM: two flights on the same columns */
  const flights = useMemo(
    () =>
      [
        columns.filter((c) => c.shelf === 'boats'),
        columns.filter((c) => c.shelf !== 'boats'),
      ].filter((f) => f.length > 0),
    [columns],
  )
  const across = Math.max(...flights.map((f) => f.length))
  return (
    <section
      className="lv-ladder"
      aria-label="Every price, list by list"
      style={{ '--lists': across } as CSSProperties}
    >
      {flights.map((flight) => (
        <Fragment key={flight[0]!.id}>
          <Flight columns={flight} open={open} onPress={onPress} {...sw} />
          {flight.some((c) => c.id === open.id) ? docked : null}
        </Fragment>
      ))}
    </section>
  )
}

function Flight({
  columns,
  open,
  onPress,
  ...sw
}: {
  columns: Column[]
  open: Column
  onPress: (id: string) => void
} & WarrantySwitch) {
  const shelves = useMemo(() => {
    const out: Array<{ shelf: Shelf; from: number; span: number }> = []
    columns.forEach((c, i) => {
      const last = out[out.length - 1]
      if (last && last.shelf === c.shelf) last.span += 1
      else out.push({ shelf: c.shelf, from: i, span: 1 })
    })
    return out
  }, [columns])
  const boats = columns.filter((c) => c.warranty !== null)
  const widest = boats
    .map((c) => c.warranty?.widest)
    .filter((w) => w != null)
    .toSorted((a, b) => b.cash - b.warranty - (a.cash - a.warranty))[0]
  const widestOn = columns.find((c) => c.warranty?.widest === widest)
  const worked = workedFromCost({ name: sw.warrantyLabel })?.said ?? ''

  return (
    <div className="lv-flight">
      <div className="lv-paper" data-ground="plate">
        <div className="lv-corner" aria-hidden="true" />
        {shelves.map((s) => (
          <p
            key={s.shelf}
            className="lv-shelf"
            style={{ '--at': s.from + 2, '--span': s.span } as CSSProperties}
          >
            {SHELF_TITLE[s.shelf]}
          </p>
        ))}

        <div className="lv-rowhead lv-rowhead--heads" />
        {columns.map((c, i) => (
          <div key={c.id} className="lv-head-at" style={{ '--at': i + 2 } as CSSProperties}>
            <Head col={c} open={open.id === c.id} onPress={() => onPress(c.id)} />
          </div>
        ))}

        <p className="lv-rowhead">Cash</p>
        {columns.map((c, i) => (
          <Cell key={c.id} said={cashSaid(c)} at={i + 2} on={open.id === c.id} />
        ))}

        <p className="lv-rowhead">Trade</p>
        {columns.map((c, i) => (
          <Cell key={c.id} said={tradeSaid(c)} at={i + 2} on={open.id === c.id} />
        ))}
      </div>

      {/* THE FENCE IS A CHANGE OF GROUND: everything below it is Northside's alone */}
      {boats.length > 0 ? (
        <div className="lv-night" data-ground="night">
          <p className="lv-fence">
            <Icon glyph={LockSimpleIcon} weight="fill" />
            Northside only · never printed on a customer’s quote
          </p>

          <p className="lv-rowhead">{sw.warrantyLabel}</p>
          {columns.map((c, i) =>
            c.warranty ? (
              <Cell key={c.id} said={warrantySaid(c)} at={i + 2} on={open.id === c.id} />
            ) : null,
          )}
          <div className="lv-widest">
            <WarrantySwitchOf {...sw} />
            <p className="lv-widest__eg">
              {worked}
              {widest && widestOn ? (
                <>
                  {' '}
                  The widest gap is the {widestOn.name} {widest.sample.name}:{' '}
                  <strong>{money(widest.warranty)}</strong> at {sw.warrantyLabel} against{' '}
                  <strong>{money(widest.cash)}</strong> at Cash.
                </>
              ) : null}
            </p>
            {sw.said ? <div className="lv-widest__said">{sw.said}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* In a hand: a card per list                                  */
/* ---------------------------------------------------------- */

function Line({ name, said }: { name: string; said: Said | null }) {
  if (!said) return null
  return (
    <div className="lv-line" data-tone={said.tone}>
      <span className="lv-line__price">{name}</span>
      <span className="lv-line__text">
        {said.name ? <span className="lv-cell__name">{said.name} · </span> : null}
        {said.text}
      </span>
    </div>
  )
}

function Cards({
  columns,
  open,
  onPress,
  docked,
  ...sw
}: {
  columns: Column[]
  open: Column
  onPress: (id: string) => void
  docked: ReactNode
} & WarrantySwitch) {
  const shelves: Shelf[] = [...new Set(columns.map((c) => c.shelf))]
  return (
    <section className="lv-cards" aria-label="Every price, list by list">
      {shelves.map((shelf) => (
        <div key={shelf} className="lv-shelfgroup">
          <h2 className="lv-shelfgroup__head">{SHELF_TITLE[shelf]}</h2>
          {shelf === 'boats' ? (
            <div className="lv-night lv-night--band" data-ground="night">
              <p className="lv-band__say">
                <strong>{sw.warrantyLabel}</strong> is Northside’s only.{' '}
                {workedFromCost({ name: sw.warrantyLabel })?.said ?? ''}
              </p>
              <WarrantySwitchOf {...sw} />
              {sw.said}
            </div>
          ) : null}
          <ul className="lv-cardlist">
            {columns
              .filter((c) => c.shelf === shelf)
              .map((c) => (
                <li key={c.id} className="lv-card" data-open={open.id === c.id ? '' : undefined}>
                  <div className="lv-card__face" data-ground="plate">
                    <Head col={c} open={open.id === c.id} onPress={() => onPress(c.id)} />
                    <Line name="Cash" said={cashSaid(c)} />
                    <Line name="Trade" said={tradeSaid(c)} />
                    {c.warranty ? (
                      <div className="lv-card__night" data-ground="night">
                        <Line name={sw.warrantyLabel} said={warrantySaid(c)} />
                      </div>
                    ) : null}
                  </div>
                  {open.id === c.id ? docked : null}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The dock: one list's prices, and what setting them writes   */
/* ---------------------------------------------------------- */

interface DockProps {
  col: Column
  sheet: Sheet
  /** Cash's writes and Trade's, each with its last step said under its own act */
  cash: Part
  trade: Part
  ref?: Ref<HTMLElement>
}

function Dock({ col, sheet, cash, trade, ref }: DockProps) {
  return (
    <motion.section
      ref={ref}
      className="lv-dock"
      data-ground="plate"
      data-testid="prices-open"
      aria-label={`Prices of ${col.name}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={move.enter}
    >
      <header className="lv-dock__head">
        <Mark col={col} />
        <p className="lv-dock__lines">
          {col.models !== null
            ? `${countOf(col)}, in ${n(col.lines)} finishes`
            : `${n(col.lines)} ${col.lines === 1 ? col.noun.one : col.noun.many}`}
        </p>
      </header>

      <div className="lv-dock__body">
        <CashPart col={col} sheet={sheet} apply={cash.apply} said={cash.said} />
        <TradePart col={col} sheet={sheet} part={trade} />
      </div>

      {col.costs.length > 0 ? (
        <footer className="lv-dock__night" data-ground="night">
          <Icon glyph={LockSimpleIcon} weight="fill" />
          <p>
            <strong>Northside only, never a price:</strong> {col.costs.join(', ')}.
          </p>
        </footer>
      ) : null}
    </motion.section>
  )
}

/** The field a column's figure is held in on each list of a column, found by its name. */
function fieldOn(sheet: Sheet, tableId: string, label: string): string | null {
  return sheet.tables[tableId]?.fields.find((f) => f.name === label)?.id ?? null
}

function nameCommand(sheet: Sheet, col: Column, label: string): CatalogueCommand | null {
  const commands = col.tableIds
    .map((id) => {
      const fieldId = fieldOn(sheet, id, label)
      return fieldId ? namePrice(id, CASH, fieldId) : null
    })
    .filter((c): c is CatalogueCommand => c !== null)
  if (commands.length === 0) return null
  return commands.length === 1
    ? commands[0]!
    : batch(commands, {
        said: `Every ${col.noun.one} is priced at its ${label} from the next quote.`,
      })
}

/* A CHOICE LOOKS LIKE ONE: the kit's option card with its ring at the corner, empty until it is
   the one a quote prints (built-critique-m3.md, minor: the motor's two figures read as two
   static cards with nothing at rest to say they were pressable). */
function Choice({
  candidate,
  sample,
  lines,
  selected,
  onChoose,
}: {
  candidate: Candidate
  sample: string | null
  lines: number
  selected: boolean
  onChoose: () => void
}) {
  return (
    <Tile
      selected={selected}
      onSelect={onChoose}
      label={`${candidate.label}, ${candidate.figure === null ? 'no figure' : money(candidate.figure)}`}
    >
      <span className="lv-choice">
        <span className="lv-choice__name">{candidate.label}</span>
        <span className="lv-choice__figure">
          {candidate.figure === null ? 'No figure' : money(candidate.figure)}
        </span>
        {sample ? <span className="lv-choice__on">on the {sample}</span> : null}
        <span className="lv-choice__cover">
          a figure on {n(candidate.priced)} of {n(lines)}
        </span>
        {candidate.worked ? (
          <span className="lv-choice__worked">{candidate.worked.said}</span>
        ) : null}
      </span>
    </Tile>
  )
}

function CashPart({
  col,
  sheet,
  apply,
  said,
}: {
  col: Column
  sheet: Sheet
  apply: Apply
  said: ReactNode
}) {
  const c = col.cash
  const lead = col.tableIds[0]!

  if (c.state === 'not-priced') {
    return (
      <div className="lv-part" data-part="cash">
        <h3 className="lv-part__head">
          <Icon glyph={TagIcon} /> Name the price
        </h3>
        <p className="lv-part__say">
          Every {col.noun.one} prints “Not priced” on a customer’s quote today. The price list holds{' '}
          {c.candidates.length === 1 ? 'one figure' : `${c.candidates.length} figures`} for{' '}
          {col.lines === 1 ? 'it' : 'each'}; say which one a customer pays.
        </p>
        <div className="lv-choices">
          {c.candidates.map((k) => (
            <Choice
              key={k.fieldId}
              candidate={k}
              sample={c.sample?.name ?? null}
              lines={col.lines}
              selected={false}
              onChoose={() => {
                const command = nameCommand(sheet, col, k.label)
                if (command)
                  apply(command, `Every ${col.noun.one} is already priced at its ${k.label}.`)
              }}
            />
          ))}
        </div>
        {said}
      </div>
    )
  }

  if (c.fork) {
    const current = c.fork.find((f) => f.current)
    const chosenWorked = c.named && current?.worked
    return (
      <div className="lv-part lv-part--fork" data-part="cash">
        <h3 className="lv-part__head">Which figure does a customer’s quote print?</h3>
        <p className="lv-part__say">
          {c.forkAgrees
            ? `Both hold the same figure on all ${n(col.lines)} ${col.noun.many}, so the choice changes no price today.`
            : c.named
              ? `You chose ${c.label}. Every ${col.noun.one} on a new quote is priced at it.`
              : `Nobody has chosen. Until you do, a quote prints ${c.label}, as it always has.`}
        </p>
        <div className="lv-choices lv-choices--two">
          {c.fork.map((k) => (
            <Choice
              key={k.fieldId}
              candidate={k}
              sample={c.sample?.name ?? null}
              lines={col.lines}
              selected={c.named && k.current}
              onChoose={() =>
                apply(
                  namePrice(lead, CASH, k.fieldId),
                  `${k.label} is already the figure every ${col.noun.one} is quoted at.`,
                )
              }
            />
          ))}
        </div>
        {chosenWorked ? (
          <div className="lv-reach">
            <Toggle
              label="May reach a customer"
              checked={c.mayReach}
              onCheckedChange={(on) =>
                apply(
                  letReach([{ tableId: lead, key: CASH }], on),
                  on
                    ? `${c.label} may already reach a customer.`
                    : `${c.label} is already kept from customers.`,
                )
              }
            />
            {c.mayReach ? null : (
              <p className="lv-part__kept">
                It is worked from cost, so it starts as Northside’s only: while it is off, a quote
                with a {col.noun.one} on it cannot be given.
              </p>
            )}
          </div>
        ) : null}
        {said}
      </div>
    )
  }

  return (
    <div className="lv-part" data-part="cash">
      <h3 className="lv-part__head">Cash{c.label === 'Cash' ? '' : ` · ${c.label}`}</h3>
      {c.figure !== null && c.sample ? (
        <p className="lv-figure">
          <span className="lv-figure__amount">{money(c.figure)}</span>
          <span className="lv-figure__on">{c.sample.name}</span>
        </p>
      ) : null}
      <p className="lv-part__say">
        {c.priced === 0
          ? `No ${col.noun.one} has a figure, so every one prints “Not priced” on a customer’s quote.`
          : c.none === 0
            ? `A figure on all ${n(c.priced)}. Every price this list lacks reads it.`
            : `A figure on ${n(c.priced)} of ${n(col.lines)}; the other ${n(c.none)} print “Not priced” on a customer’s quote.`}
      </p>
      {col.fitted ? (
        <p className="lv-part__say">
          <strong>Fitted</strong> · {col.fitted.label} holds a figure on {n(col.fitted.priced)} of{' '}
          {n(col.lines)}, chosen on the quote one {col.noun.one} at a time, when it is fitted.
        </p>
      ) : null}
      {said}
    </div>
  )
}

function TradePart({ col, sheet, part }: { col: Column; sheet: Sheet; part: Part }) {
  const t = col.trade
  if (col.cash.state === 'not-priced') return null
  if (t.state === 'nothing')
    return (
      <div className="lv-part" data-part="trade">
        <h3 className="lv-part__head">Trade</h3>
        <p className="lv-part__say">
          No {col.noun.one} has a Cash figure, so there is nothing for Trade to be a share of.
        </p>
      </div>
    )
  if (t.state === 'falls')
    return (
      <div className="lv-part" data-part="trade">
        <h3 className="lv-part__head">Trade</h3>
        <p className="lv-part__say">
          No Trade price on this list, so a trade buyer’s quote stays at {t.to}.
        </p>
      </div>
    )
  return <Share col={col} sheet={sheet} apply={part.apply} said={part.said} />
}

function Share({
  col,
  sheet,
  apply,
  said,
}: {
  col: Column
  sheet: Sheet
  apply: Apply
  said: ReactNode
}) {
  const t = col.trade
  const [typed, setTyped] = useState(() =>
    t.state === 'reads' && t.share !== null ? String(t.share) : '',
  )
  const of = col.cash.state === 'reads' ? col.cash.label : 'Cash'
  const read = readShare(typed, of)
  const lead = col.tableIds[0]!
  const plan = useMemo(
    () => ('percent' in read ? sharePlan(sheet, lead, 'trade', read.percent, col.noun) : null),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the typed share, by its value
    [sheet, lead, 'percent' in read ? read.percent : null, col.noun],
  )
  if (t.state !== 'reads') return null
  const refused = 'refused' in read ? read.refused : (plan?.refusal ?? undefined)

  return (
    <div className="lv-part lv-part--share" data-part="trade">
      <h3 className="lv-part__head">{t.label} · a trade buyer’s quote</h3>
      {t.sample ? (
        <div className="lv-pair" aria-label={`${t.sample.name}, both prices`}>
          <p className="lv-figure">
            <span className="lv-figure__price">{of}</span>
            <span className="lv-figure__amount">{t.cash === null ? '—' : money(t.cash)}</span>
          </p>
          <p className="lv-figure">
            <span className="lv-figure__price">{t.label}</span>
            <span className="lv-figure__amount">{t.trade === null ? 'None' : money(t.trade)}</span>
          </p>
          <p className="lv-figure__on">{t.sample.name}</p>
        </div>
      ) : null}

      <div className="lv-set">
        <label className="lv-set__field">
          <span className="lv-set__word">
            Set {t.label} as a share of {of}
          </span>
          <span className="lv-set__input">
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
        {plan ? (
          <div className="lv-census" aria-live="polite">
            <Stat value={plan.written} label={`${t.label} figures written`} live />
            <Stat value={plan.sameAsFrom} label={`the same as ${of} today`} live />
            <Stat value={plan.blank} label={`with no ${of}, left as they are`} live />
            {t.sample && t.cash !== null && 'percent' in read ? (
              <p className="lv-census__eg">
                {t.sample.name}: {money(t.cash)} →{' '}
                <strong>{money(shareFigure(t.cash, read.percent))}</strong>, rounded down as the
                price list does.
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="lv-set__act">
          <Button
            intent="act"
            icon={CheckCircleIcon}
            refusedBecause={refused}
            onClick={() => {
              if (plan?.command && 'percent' in read)
                apply(
                  plan.command,
                  `Every ${col.noun.one} already holds ${read.percent}% of ${of} as ${t.label}.`,
                )
            }}
          >
            {plan && plan.written > 0
              ? `Set on ${n(plan.written)} ${plan.written === 1 ? col.noun.one : col.noun.many}`
              : `Set on every ${col.noun.one}`}
          </Button>
          {/* said before the write; once written, the step line under the act carries the
              way back itself, and stays until the next write */}
          {said ? null : (
            <p className="lv-set__undo">
              <Icon glyph={SealCheckIcon} /> One Undo puts every one back.
            </p>
          )}
        </div>
        {said}
      </div>
    </div>
  )
}
