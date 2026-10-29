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
  CheckCircleIcon,
  FileTextIcon,
  InfoIcon,
  LockSimpleIcon,
  PencilSimpleLineIcon,
  PercentIcon,
  SealCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Icon,
  Input,
  KindMark,
  Picture,
  Refusal,
  Tile,
  Toggle,
  reducedMotion,
  transition,
} from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { copyOf, itemOf, markOnPaper, pictureOf, srcSetOf } from '@/data/pictures'
import { batch, isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { CASH, letReach, namePrice, readShare, sharePlan } from '@/domain/catalogue/priceCommands'
import { money } from '@/domain/money'
import type { QuoteLine, TableKind } from '@/domain/model'
import {
  onLine,
  questionOf,
  readDesk,
  readLadder,
  sampleOf,
  settledFact,
  soldAsPackage,
  type Candidate,
  type Column,
  type Kept,
  type Sample,
  type Shelf,
  type Sheet,
} from './read'
import './levels.css'

/* ============================================================
   PRICES (`/levels`) — direction F, "Yours to decide", of
   docs/directions/levels-boards/ (judged 2026-10-28: owner 6 ·
   dealer 9 · design 8), with board D's specimen grafted on and the
   verdict's must-change made.

   THE PAGE IS THE DEALER'S WORK, NOT THE PRICE LIST'S SHAPE. Three
   groups, in the order a dealer meets them:

   YOURS TO CHOOSE — the questions only Northside can answer, counted
   and in the order of how many lines each answer prices: Dealer Fit,
   Rigging Kits, the Yamahas' two figures, the factory packages. Each
   is one ruled line with its question, one real line's figures and an
   ochre "To choose". Pressed, it opens in place: the line read large
   (D's specimen: its picture where one is held, its maker's mark),
   one tile per figure it could print, each counting the lines it would
   price, none ringed. A tile pressed is counted BEFORE anything is
   written, with one amber act beside "Leave it".

   WORKED FROM COST — Warranty, which the price list works from what a
   boat cost Northside, on Northside's own dark ground with its one
   switch, off, read on the pictured SP560 (HYP): $32,166 against Cash
   $48,350. The change of ground is the boundary.

   SETTLED BY YOUR PRICE LIST — every other list as a tile led by its
   maker's mark, with the one fact that says how it prices. A tile
   pressed opens in place across its row (the must-change): its line
   read large, Trade as a typed share of Cash, and the counted line
   before it writes — "91 written · 91 equal Cash today · 0 already · 0
   with no Cash · 309 Skimma $1,730 → $1,643" — with one amber "Write 91
   Trade figures" beside "Leave it". Written, the tile folds back with
   its new fact and ONE Undo that puts all 91 back.

   EVERY WRITE IS A COMMAND through the catalogue store
   (`priceCommands.ts`), so a write of hundreds of cells is one step.
   Its sentence and its way back stand under the list it changed —
   wherever that list now stands — until the next write.
   ============================================================ */

export interface LevelsProps {
  /** the list that is open, by its id; '' for none */
  list: string
  onList: (list: string) => void
  /** where a computer with no copy of the price list goes to load one */
  openTheFile: () => void
  /** BACK TO THE QUOTE THAT SENT THE DEALER HERE (built-critique-m3.md, blocker 1): the build
   *  says a line's price is not chosen and opens its list here; once it is chosen, this is the
   *  way back to price the line. Absent when Prices was opened from anywhere else. */
  backToQuote?: () => void
  /** THE QUOTE THAT SENT THE DEALER HERE, by its id: its line on the open list is the one the
   *  list is read on (built-critique-m3-2.md, major 2). Absent from anywhere else. */
  quote?: string
}

const COUNT = new Intl.NumberFormat('en-AU')
const n = (value: number): string => COUNT.format(value)

const KIND: Record<Shelf, TableKind> = {
  boats: 'boat',
  trailers: 'trailer',
  motors: 'motor',
  packages: 'package',
  parts: 'accessory',
}

/** What a tile counts, in one short word: "91 boats", "650 kits". A maker whose lines are its
 *  boats in their finishes counts its BOATS too, as every other maker's tile does and as Home and
 *  the picker do: Highfield is "67 boats", never "67 models" beside "91 boats" (built-critique-
 *  m3.md, major 11). */
function countOf(col: Column): string {
  if (col.models !== null) return `${n(col.models)} ${col.models === 1 ? 'boat' : 'boats'}`
  const word = col.noun.many.split(' ').at(-1) ?? ''
  return `${n(col.lines)} ${word}`
}

/** A share of one figure in another, to one place: 66.5%. */
const shareOf = (part: number, whole: number): string =>
  `${(Math.round((part / whole) * 1000) / 10).toLocaleString('en-AU')}%`

/* ---------------------------------------------------------- */
/* The last write, and its way back                            */
/* ---------------------------------------------------------- */

/** WHAT THE SCREEN LAST SAID ABOUT A WRITE, and under which list: a step with its way back, a
 *  refusal with its reason, or a press that changed nothing, said as such. */
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
  /** the way back to the quote that opened this list, beside the Undo */
  onward?: () => void
}) {
  const back = useRef<HTMLElement>(null)
  /* THE WAY BACK TAKES THE FOCUS: the act that wrote has folded away with its panel, so the
     keyboard lands on the one thing that can be done next, never on the page's top */
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
      {/* a step taken back is not a done tick: it wears the way-back glyph, in the quiet ink */}
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

export function Levels({ list, onList, openTheFile, backToQuote, quote = '' }: LevelsProps) {
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
          <p className="lv-eyebrow">Prices</p>
          <h1 className="lv-title">What only you can decide about price.</h1>
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
  backToQuote,
  quote,
}: {
  columns: Column[]
  sheet: Sheet
  list: string
  onList: (list: string) => void
  backToQuote?: () => void
  quote: string
}) {
  /* THE LIST IS READ ON THE QUOTE'S OWN LINE when the build's door sent the dealer here: the Tube
     Covers on the Classic 340, never another line of Dealer Fit (built-critique-m3-2.md, major 2) */
  const tableIds = useMemo(() => new Set(read.flatMap((c) => c.tableIds)), [read])
  const lineKey = useQuotes((s) =>
    quote === '' ? '' : lineKeyOf(s.quotes.find((q) => q.id === quote)?.lines ?? [], tableIds),
  )
  const columns = useMemo(() => {
    if (lineKey === '') return read
    const cut = lineKey.indexOf('|')
    const tableId = lineKey.slice(0, cut)
    const rowId = lineKey.slice(cut + 1)
    return read.map((c) => onLine(sheet, c, tableId, rowId))
  }, [read, sheet, lineKey])
  const desk = useMemo(() => readDesk(sheet, columns), [sheet, columns])
  /* A LIST IS OPENED BY ITS COLUMN HERE, OR BY ITS OWN ID FROM THE BUILD (`dealer_fit`), which
     names one list and not the column it shares: the factory packages are two lists, one column */
  const open =
    columns.find((c) => c.id === list)?.id ??
    columns.find((c) => c.tableIds.includes(list))?.id ??
    ''
  /* the list the build sent the dealer to, where "Back to the quote" is offered once it is chosen */
  const [sentFor] = useState(open)
  /* a panel scrolls itself into sight when a press opened it, and when a door from the build
     arrived on it — never on a plain reload of the page */
  const pressed = useRef(backToQuote !== undefined && open !== '')
  /* the page, and whether the last write's line is still to be brought into sight */
  const main = useRef<HTMLElement>(null)
  const bring = useRef(false)
  const toggle = useCallback(
    (id: string) => {
      pressed.current = true
      bring.current = false
      onList(open === id ? '' : id)
    },
    [onList, open],
  )
  const fold = useCallback(() => onList(''), [onList])
  /* the press is taken once, by the panel it opened */
  const takePress = useCallback(() => {
    const was = pressed.current
    pressed.current = false
    return was
  }, [])

  /* ---- the writes, and the way back ---------------------------- */

  const [step, setStep] = useState<Step | null>(null)

  /* WHAT A WRITE SAID IS BROUGHT INTO SIGHT (built-critique-m3-2.md, major 2). A choice folds its
     panel and its list moves to the settled tiles, so the step line with its Undo and "Back to the
     quote" stood at y 1,006 at 1440 × 900 and y 2,022 at 390 × 844 with the page still at its top.
     It is brought to the nearest edge once the step is said and again once the panel has folded,
     clear of the pill; a press on any list after it leaves the page where the dealer put it. */
  useEffect(() => {
    if (!bring.current || !step) return
    /* a write folds the panel it was made in, and the line moves once more: brought then */
    if (step.kind === 'step' && open === step.on) return
    bringIntoSight(main.current?.querySelector('.lv-step, .lv-alarm'))
  }, [step, open])

  const apply = useCallback<Apply>((on, command, nothing) => {
    bring.current = true
    const outcome = catalogue.getState().apply(command)
    if (!isDone(outcome)) {
      /* A PRESS THAT CHANGES NOTHING SAYS SO (CLAUDE.md: never a silent refusal). The command
         answers '' when there was nothing to do; the screen knows what was pressed, and says it. */
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

  /* THE WAY BACK, PINNED TO THE STEP IT IS OFFERED FOR: Undo takes that step back and says so
     ("Undone. No longer so: …", never the claim alone under a tick), and the same line then offers
     to put it back, as the sheet's does. */
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

  const choosing = desk.choose.length

  return (
    <main className="lv" data-testid="levels" data-read="" ref={main}>
      <header className="lv-head">
        <div className="lv-head__words">
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
                sheet={sheet}
                open={open === col.id}
                pressed={takePress}
                onToggle={() => toggle(col.id)}
                onDone={fold}
                apply={apply}
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
            title="Worked from cost"
            count={desk.kept.length}
            note="Northside’s own until you let it reach a customer"
          />
          <div className="lv-keptlist">
            {desk.kept.map((k) => (
              <KeptBar key={k.id} kept={k} apply={apply} said={stepOn(k.id)} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="lv-group" aria-labelledby="lv-settled">
        <GroupHead
          id="lv-settled"
          title="Settled by your price list"
          count={desk.settled.length}
          note="Press any to see it or change it"
        />
        <Settled
          cols={desk.settled}
          sheet={sheet}
          open={open}
          pressed={takePress}
          onToggle={toggle}
          onDone={fold}
          apply={apply}
          stepOn={stepOn}
        />
      </section>
    </main>
  )
}

function GroupHead({
  id,
  title,
  count,
  note,
}: {
  id: string
  title: string
  count: number
  note: string
}) {
  return (
    <div className="lv-grouphead">
      <h2 className="lv-grouphead__title" id={id}>
        {title} <span className="lv-grouphead__count">{n(count)}</span>
      </h2>
      <p className="lv-grouphead__note">{note}</p>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* A list's mark, and one of its lines read large              */
/* ---------------------------------------------------------- */

/** THE MAKER'S MARK, in the ink paper needs; a list with no maker's mark held in that ink
 *  (Stabicraft publishes white ink alone) is its kind and its name in type. */
function Mark({ col, named = true }: { col: Column; named?: boolean }) {
  const choice = col.markOf ? markOnPaper(col.markOf) : null
  if (choice?.drawn)
    return (
      <span className="lv-mark" data-drawn="">
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
    <span className="lv-mark">
      <KindMark kind={KIND[col.shelf]} size="sm" />
      {named ? <span className="lv-mark__name">{col.name}</span> : null}
    </span>
  )
}

/** ONE LINE'S OWN PICTURE, from the one picture reader, or nothing: never a stand-in. */
function LinePicture({ sample, maker }: { sample: Sample; maker: string }) {
  const item = itemOf(sample.tableId, sample.rowId, sample.image)
  const shown = copyOf(item) ?? pictureOf(item)
  if (!shown) return null
  return (
    <figure className="lv-pic">
      <Picture
        src={shown.src}
        srcSet={srcSetOf(shown)}
        sizes="(min-width: 834px) 220px, 40vw"
        alt={`The ${maker} ${sample.name}`}
        width={shown.width}
        height={shown.height}
        fit="contain"
      />
    </figure>
  )
}

/** The maker's word for a list, as a sentence names its line: "the Stacer 309 Skimma". */
const makerWord = (col: Column): string =>
  col.shelf === 'boats' || col.shelf === 'motors' ? (col.name.split(/\s+/)[0] ?? '') : ''

/** THE SPECIMEN: one real line of the list, read large — its picture, its mark, its name. */
function Specimen({
  col,
  sample,
  children,
}: {
  col: Column
  sample: Sample
  children?: ReactNode
}) {
  const maker = makerWord(col)
  return (
    <div className="lv-specimen">
      <LinePicture sample={sample} maker={maker} />
      <div className="lv-specimen__words">
        <Mark col={col} named={false} />
        <p className="lv-specimen__name">
          <span className="lv-specimen__eyebrow">
            {sample.onQuote ? 'On your quote' : `Read on one ${col.noun.one}`}
          </span>
          {sample.name}
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

/** Opened by a press, a panel brings itself into sight; on arrival nothing moves. */
function useIntoSight(pressed: () => boolean) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!pressed()) return
    const el = ref.current
    if (!el || typeof el.scrollIntoView !== 'function') return
    const r = el.getBoundingClientRect()
    if (r.top >= 0 && r.bottom <= window.innerHeight) return
    el.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [pressed])
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

/* ---------------------------------------------------------- */
/* Yours to choose                                             */
/* ---------------------------------------------------------- */

/** The figures a list could print, the most widely held first. */
function choicesOf(col: Column): Candidate[] {
  const c = col.cash
  const all = c.state === 'not-priced' ? c.candidates : (c.choices ?? [])
  return all.toSorted((a, b) => Number(b.current) - Number(a.current) || b.priced - a.priced)
}

function ChooseRow({
  col,
  sheet,
  open,
  pressed,
  onToggle,
  onDone,
  apply,
  said,
}: {
  col: Column
  sheet: Sheet
  open: boolean
  pressed: () => boolean
  onToggle: () => void
  onDone: () => void
  apply: Apply
  said: ReactNode
}) {
  const c = col.cash
  const sample = c.sample
  const choices = choicesOf(col)
  const held = choices.filter((k) => k.figure !== null).slice(0, 2)
  /* TWO FIGURES THAT ARE ONE FIGURE ARE SAID ONCE (built-critique-m3.md, minor: the factory
     packages offered "$69,716 or $69,716"): the figure, with both its names */
  const alike = held.length === 2 && held[0]!.figure === held[1]!.figure
  const shown = alike ? [{ ...held[0]!, label: `${held[0]!.label} and ${held[1]!.label}` }] : held
  const more = choices.length - held.length
  return (
    <li className="lv-task" data-open={open ? '' : undefined}>
      <Tile
        shape="row"
        selected={open}
        onSelect={onToggle}
        label={`${col.name}, ${n(col.lines)} ${col.noun.many}. ${questionOf(col)}`}
      >
        <span className="lv-task__face">
          <span className="lv-task__mark">
            <Mark col={col} named={false} />
          </span>
          <span className="lv-task__what">
            <span className="lv-task__name">
              {col.name} <span className="lv-task__count">{n(col.lines)}</span>
            </span>
            <span className="lv-task__q">{questionOf(col)}</span>
          </span>
          {sample && shown.length > 0 ? (
            <span className="lv-task__eg">
              <span className="lv-task__on">{sample.name}</span>
              {shown.map((k, i) => (
                <span key={k.fieldId} className="lv-task__fig">
                  {i > 0 ? <span className="lv-task__or">or</span> : null}
                  <strong>{money(k.figure!)}</strong>
                  <span className="lv-task__label">{k.label}</span>
                </span>
              ))}
              {more > 0 ? <span className="lv-task__more">and {n(more)} more</span> : null}
            </span>
          ) : null}
          <span className="lv-tag">To choose</span>
        </span>
      </Tile>
      {open && sample ? (
        <ChooseOpen col={col} pressed={pressed}>
          <Chooser col={col} sheet={sheet} sample={sample} apply={apply} onDone={onDone} />
        </ChooseOpen>
      ) : null}
      {said}
    </li>
  )
}

function ChooseOpen({
  col,
  pressed,
  children,
}: {
  col: Column
  pressed: () => boolean
  children: ReactNode
}) {
  const at = useIntoSight(pressed)
  return (
    <Opening label={`Prices of ${col.name}`} at={at}>
      {children}
    </Opening>
  )
}

/** THE COMMAND THAT NAMES A LIST'S PRICE, on every list it stands for (the factory packages are
 *  two), as one step. */
function nameCommand(sheet: Sheet, col: Column, label: string): CatalogueCommand | null {
  const commands = col.tableIds
    .map((id) => {
      const fieldId = sheet.tables[id]?.fields.find((f) => f.name === label)?.id
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

/** ONE TILE PER FIGURE a list could print, each counting what it would price; a tile pressed is
 *  counted before anything is written, with one amber act beside "Leave it". */
function Chooser({
  col,
  sheet,
  sample,
  apply,
  onDone,
}: {
  col: Column
  sheet: Sheet
  sample: Sample
  apply: Apply
  onDone: () => void
}) {
  const choices = choicesOf(col)
  const c = col.cash
  const named = c.state === 'reads' && c.named
  const current = choices.find((k) => k.current) ?? null
  const [picked, setPicked] = useState<string | null>(null)
  const pick = choices.find((k) => k.fieldId === picked) ?? null
  const ringed = pick ?? (named ? current : null)
  const notPriced = c.state === 'not-priced'

  return (
    <div className="lv-chooser">
      <Specimen col={col} sample={sample}>
        <p className="lv-specimen__say">
          {notPriced
            ? `Your price list holds ${choices.length === 2 ? 'two' : n(choices.length)} sell figures for each ${col.noun.one} and names none of them, so nothing is ringed.`
            : named
              ? `You chose ${c.label}. Press another to change it.`
              : `Nobody has chosen. Until you do, a quote shows ${c.state === 'reads' ? c.label : ''}, as it always has.`}
        </p>
      </Specimen>
      <div className="lv-choices" data-n={choices.length}>
        {choices.map((k) => (
          <Tile
            key={k.fieldId}
            selected={ringed?.fieldId === k.fieldId}
            onSelect={() => setPicked(k.fieldId === picked ? null : k.fieldId)}
            label={`${k.label}, ${k.figure === null ? 'no figure' : money(k.figure)}`}
          >
            <span className="lv-choice">
              <span className="lv-choice__name">{k.label}</span>
              <span className="lv-choice__figure">
                {k.figure === null ? 'None' : money(k.figure)}
              </span>
              <span className="lv-choice__cover">
                Prices <strong>{n(k.priced)}</strong> of {n(col.lines)}
              </span>
              {k.worked ? <span className="lv-choice__worked">{k.worked.said}</span> : null}
            </span>
          </Tile>
        ))}
      </div>
      {pick && !(named && pick.current) ? (
        <Census>
          <p className="lv-census__said">{chooseSaid(col, pick, current, sample)}</p>
          <div className="lv-census__acts">
            <Button
              intent="act"
              icon={CheckCircleIcon}
              onClick={() => {
                const command = nameCommand(sheet, col, pick.label)
                if (
                  command &&
                  apply(
                    col.id,
                    command,
                    `Every ${col.noun.one} is already priced at its ${pick.label}.`,
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
          </div>
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

/** What naming a figure would do, counted, in the dealer's words. */
function chooseSaid(col: Column, k: Candidate, current: Candidate | null, sample: Sample): string {
  const rest = col.lines - k.priced
  if (col.cash.state === 'not-priced' || !current)
    return `${n(k.priced)} of ${n(col.lines)} ${col.noun.many} are priced at their ${k.label} from the next quote.${
      rest > 0
        ? ` The other ${n(rest)} hold no ${k.label}, so they still show Not priced, each on its own line.`
        : ''
    }${k.worked ? ` ${k.worked.said} So it starts as Northside’s only.` : ''}`
  if (k.current)
    return `Every ${col.noun.one} on a new quote shows its ${k.label}, as it does today. No figure changes; it becomes your choice.`
  const from = current.figure
  const to = k.figure
  return `Every ${col.noun.one} on a new quote shows its ${k.label}${
    from !== null && to !== null
      ? `: the ${sample.name} goes from ${money(from)} to ${money(to)}.`
      : '.'
  }${
    k.worked
      ? ` ${k.worked.said} So it starts as Northside’s only: a quote with a ${col.noun.one} on it cannot be given until you let it reach a customer.`
      : ''
  }`
}

function chooseAct(col: Column, k: Candidate): string {
  if (col.cash.state === 'reads' && k.current) return `Keep ${k.label}`
  /* the count is the census's, said above it; the act stays short enough for a hand */
  if (col.cash.state === 'reads' && col.cash.fork) return `Show ${k.label}`
  return `Price ${n(k.priced)} at ${k.label}`
}

/** THE COUNT AND ITS ACT ARRIVE IN SIGHT: at 390 × 844 "Price 1,733 at Act Sell" stood at y 977
 *  once a figure was pressed (built-critique-m3-2.md, major 2). */
function Census({ children }: { children: ReactNode }) {
  const at = useRef<HTMLDivElement>(null)
  useEffect(() => bringIntoSight(at.current), [])
  return (
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
  )
}

/* ---------------------------------------------------------- */
/* Worked from cost                                            */
/* ---------------------------------------------------------- */

function KeptBar({ kept, apply, said }: { kept: Kept; apply: Apply; said: ReactNode }) {
  const s = kept.specimen
  const diff = s ? s.against - s.figure : 0
  return (
    <div className="lv-keptwrap">
      {/* SUNK BELOW THE PAGE while it is Northside's only, and risen to a plate once it may
          reach a customer: the boundary is the object's depth, not a second dark band beside
          Fitment's riveted plate (built-critique-m3.md, major 10) */}
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
            {kept.worked.said}{' '}
            {kept.mayReach ? 'A quote with a line at it can be given.' : kept.whileOff}
          </p>
        </div>
        {s ? (
          <div className="lv-kept__eg">
            <LinePicture sample={s.sample} maker={s.maker} />
            <p className="lv-kept__line">
              <span className="lv-kept__name">
                {s.maker} {s.sample.name}
              </span>
              <span className="lv-kept__figure">{money(s.figure)}</span>
              <span className="lv-kept__against">
                against {s.againstLabel} {money(s.against)} · {shareOf(s.figure, s.against)} of{' '}
                {s.againstLabel}, {money(Math.abs(diff))} {diff >= 0 ? 'under' : 'over'}
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
      </div>
      {said}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Settled by your price list                                  */
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
  sheet,
  open,
  pressed,
  onToggle,
  onDone,
  apply,
  stepOn,
}: {
  cols: Column[]
  sheet: Sheet
  open: string
  pressed: () => boolean
  onToggle: (id: string) => void
  onDone: () => void
  apply: Apply
  stepOn: (on: string) => ReactNode
}) {
  const grid = useRef<HTMLDivElement>(null)
  const across = useAcross(grid)
  const at = cols.findIndex((c) => c.id === open)
  /* THE OPEN TILE OPENS ACROSS ITS OWN ROW: its panel stands after the last tile of that row, so
     what is read and what is tabbed through run in the same order */
  const rowEnd = (i: number): number =>
    i < 0 ? -1 : Math.min(cols.length - 1, Math.ceil((i + 1) / across) * across - 1)
  const after = rowEnd(at)
  const openCol = at < 0 ? null : cols[at]!
  /* THE STEP LINE STANDS ACROSS ITS TILE'S ROW TOO, never inside the tile's own cell: in the
     cell it made that row tall and left a hole beside it (built-critique-m3, minors) */
  const stepAt = cols.findIndex((c) => stepOn(c.id) !== null)
  const stepLine = stepAt < 0 ? null : stepOn(cols[stepAt]!.id)
  const stepAfter = rowEnd(stepAt)
  return (
    <div className="lv-settled" ref={grid}>
      {cols.map((col, i) => (
        <Fragment key={col.id}>
          <div className="lv-cellwrap" data-open={col.id === open ? '' : undefined}>
            <Tile
              shape="card"
              tick="foot"
              selected={col.id === open}
              onSelect={() => onToggle(col.id)}
              label={`${col.name}, ${countOf(col)}: ${factOf(sheet, col)}`}
            >
              <span className="lv-cell">
                <span className="lv-cell__mark">
                  <Mark col={col} />
                </span>
                <span className="lv-cell__count">{countOf(col)}</span>
                <Fact said={factOf(sheet, col)} />
              </span>
            </Tile>
          </div>
          {i === stepAfter ? <div className="lv-settled__step">{stepLine}</div> : null}
          {i === after && openCol ? (
            <SettledOpen
              key={`open:${openCol.id}`}
              col={openCol}
              sheet={sheet}
              pressed={pressed}
              onDone={onDone}
              apply={apply}
            />
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}

/** The fact first, and what differs from it on a line of its own. */
function Fact({ said }: { said: string }) {
  const [first, ...rest] = said.split(' · ')
  return (
    <>
      <span className="lv-cell__fact">{first}</span>
      {rest.length > 0 ? <span className="lv-cell__differs">{rest.join(' · ')}</span> : null}
    </>
  )
}

/** A settled tile's one fact; a boat maker sold only in its factory packages says so. */
function factOf(sheet: Sheet, col: Column): string {
  if (col.cash.state === 'reads' && col.cash.priced === 0 && soldAsPackage(sheet, col))
    return 'Sold as a factory package'
  return settledFact(col)
}

function SettledOpen({
  col,
  sheet,
  pressed,
  onDone,
  apply,
}: {
  col: Column
  sheet: Sheet
  pressed: () => boolean
  onDone: () => void
  apply: Apply
}) {
  const at = useIntoSight(pressed)
  const c = col.cash
  if (c.state !== 'reads') return null
  const t = col.trade
  const sample = c.sample
  const pkg = c.priced === 0 ? soldAsPackage(sheet, col) : null
  const facts: string[] = []
  if (c.priced === 0)
    facts.push(
      `None of the ${n(col.lines)} holds a ${c.label} figure${pkg ? `; they are sold in ${pkg}` : ''}.`,
    )
  else if (c.none > 0)
    facts.push(
      `${n(c.priced)} of ${n(col.lines)} hold a ${c.label} figure; the other ${n(c.none)} show Not priced on a quote.`,
    )
  else facts.push(`A ${c.label} figure on all ${n(col.lines)}, and every quote starts at it.`)
  if (c.fork && c.forkAgrees)
    facts.push(
      `${c.fork.map((k) => k.label).join(' and ')} hold the same figure on all ${n(col.lines)}, so a quote shows the same either way.`,
    )
  if (t.state === 'falls')
    facts.push(`No Trade price on this list, so a trade buyer’s quote stays at ${t.to}.`)
  if (col.fitted)
    facts.push(
      `${col.fitted.label} holds a figure on ${n(col.fitted.priced)} of ${n(col.lines)}, chosen on the quote one ${col.noun.one} at a time, when it is fitted.`,
    )

  return (
    <div className="lv-settled__open" data-ground="plate">
      <Opening label={`Prices of ${col.name}`} at={at}>
        {c.choices && sample ? (
          <Chooser col={col} sheet={sheet} sample={sample} apply={apply} onDone={onDone} />
        ) : sample ? (
          <Specimen col={col} sample={sample}>
            <Figures col={col} />
          </Specimen>
        ) : null}
        <ul className="lv-facts">
          {facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {t.state === 'reads' && col.tableIds.length === 1 ? (
          <Share col={col} sheet={sheet} apply={apply} onDone={onDone} />
        ) : null}
      </Opening>
    </div>
  )
}

/** The specimen's own prices, in the price list's order: Cash, then Trade. */
function Figures({ col }: { col: Column }) {
  const c = col.cash
  const t = col.trade
  if (c.state !== 'reads' || c.figure === null) return null
  return (
    <p className="lv-figures">
      <span className="lv-figures__one">
        <span className="lv-figures__label">{c.label}</span>
        <span className="lv-figures__amount">{money(c.figure)}</span>
      </span>
      {t.state === 'reads' && t.sample?.rowId === c.sample?.rowId ? (
        <span className="lv-figures__one">
          <span className="lv-figures__label">{t.label}</span>
          <span className="lv-figures__amount">{t.trade === null ? 'None' : money(t.trade)}</span>
          {t.trade !== null && c.figure !== null && t.trade !== c.figure ? (
            <span className="lv-figures__share">
              {shareOf(t.trade, c.figure)} of {c.label}, {money(c.figure - t.trade)} less
            </span>
          ) : null}
        </span>
      ) : null}
    </p>
  )
}

/* ---------------------------------------------------------- */
/* Trade as a share of Cash: counted, then written             */
/* ---------------------------------------------------------- */

function Share({
  col,
  sheet,
  apply,
  onDone,
}: {
  col: Column
  sheet: Sheet
  apply: Apply
  onDone: () => void
}) {
  const t = col.trade
  const of = col.cash.state === 'reads' ? col.cash.label : 'Cash'
  const today = t.state === 'reads' && t.share !== null ? String(t.share) : ''
  const [typed, setTyped] = useState(today)
  const read = readShare(typed, of)
  const percent = 'percent' in read ? read.percent : null
  const lead = col.tableIds[0]!
  const plan = useMemo(
    () => (percent === null ? null : sharePlan(sheet, lead, 'trade', percent, col.noun)),
    [sheet, lead, percent, col.noun],
  )
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
        <p className="lv-share__now">{nowSaid}</p>
      </div>
      {'refused' in read && typed.trim() !== '' ? (
        <p className="lv-share__why">
          <Refusal>{read.refused}</Refusal>
        </p>
      ) : plan && !plan.command && plan.refusal ? (
        <p className="lv-share__nothing">
          <Icon glyph={InfoIcon} /> {plan.refusal}
        </p>
      ) : plan?.command && percent !== null ? (
        <Census>
          <p className="lv-census__count" data-testid="census">
            {[
              [plan.written, 'written'],
              [plan.sameAsFrom, `equal ${of} today`],
              [plan.already, 'already'],
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
            Rounded down to the dollar, as your price list does. One Undo puts every one back.
          </p>
          <div className="lv-census__acts">
            <Button
              intent="act"
              icon={CheckCircleIcon}
              onClick={() => {
                if (
                  plan.command &&
                  apply(
                    col.id,
                    plan.command,
                    `Every ${col.noun.one} already holds ${percent}% of ${of} as ${t.label}.`,
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
          </div>
        </Census>
      ) : null}
    </div>
  )
}
