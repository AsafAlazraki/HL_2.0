/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- a grid of rows, as History's spine is: the keyboard is the grid's, bound once on it, and a row's click is the pointer's shortcut to the same act */
import { Fragment, useCallback, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BroomIcon,
  CaretDownIcon,
  CheckCircleIcon,
  CoinsIcon,
  FileTextIcon,
  HandPointingIcon,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'
import { Button, Figure, Icon, Input, Tile, Tooltip, say, transition, undo, useStill } from '@/ui'
import { useCatalogue, usePrefs } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { isCostColumn } from '@/domain/quote/pricing'
import { money } from '@/domain/money'
import {
  review,
  tidySaid,
  type NoPriceGroup,
  type PlaceGroup,
  type Reband,
  type Review as ReviewData,
  type TwoPrices,
  type Twins,
  type Nameless,
} from '@/domain/rules/review/checks'
import {
  nameLineCommand,
  nameTwinCommand,
  rebandCommand,
  rebandRefusal,
} from '@/domain/rules/review/fixes'
import { closesStage, isField, stageKeyOf } from '@/ui/keys'
import { markFor, type MarkChoice } from '@/screens/home/ledgers'
import {
  CHECKS,
  CHECK_WORDS,
  MEANT_PREF,
  andMore,
  bandGroupSaid,
  counted,
  kg,
  makerTyped,
  spokenCategory,
  meantOf,
  readFromSaid,
  signed,
  trailerSaid,
  type CheckId,
} from './read'
import './review.css'

/* ============================================================
   REVIEW — direction A, "Reconcile", of docs/directions/review-boards/ (judged 2026-10-22),
   with C's grouping grafted onto the $0 check and the verdict's must-change made.

   WHAT IS WRONG IN NORTHSIDE'S OWN PRICE LIST, WITH THE FIX BESIDE IT. One list of checks,
   ordered by what each costs: money first (a trailer in the wrong band, one name at two
   prices, a line on sale with no price), then a wrong pick (two things under one name, a line
   with nothing to name it), then the tidy suggestions folded to one line. A check reads as
   what is wrong while something is, and as the sentence that is true, with a tick, once
   nothing is — so the clean day is the same screen in the same shape.

   THE FIX IS THE ROW ITSELF. A wrong band stands as the price list reads it, and beside it
   the line as it would read, on the accent's wash: that half is the press. One press writes
   one trailer — its band, its fee and its Sell inc Rego — as one step through the catalogue's
   command door, said in a toast whose Undo puts all three back. A band is never chosen for
   several at once ("Never derive the band", `registration.ts`), so the check's one dark act
   steps through them, the next one at a time.

   GROUPED BY THE PRESS THAT CLEARS SEVERAL. 147 lines on sale with no price are 21 groups by
   the list's own category, each with its count and two presses — leave them as meant, or
   price them in the price list — never 147 rows with a button each.

   LEFT AS MEANT, AND IT COMES BACK. Keyed on what it names and the value that made it a
   finding (`checks.ts`), so it returns on its own the day that value changes. Kept on this
   computer, beside the dealer's other conveniences; the toast takes it back.
   ============================================================ */

export interface ReviewProps {
  /** which check is open; '' for the screen's own choice, 'none' would be a check, so '-' folds all */
  open: CheckId | '' | '-'
  onOpen: (open: CheckId | '-') => void
  /** the price list, at one of its lines */
  openList: (tableId: string, at?: string, find?: string) => void
  /** where a computer with no copy of the price list goes to load one */
  openTheFile: () => void
}

const STEP_TOAST = 'review-step'

const GLYPH: Record<CheckId, PhosphorIcon> = {
  band: CoinsIcon,
  two: CoinsIcon,
  none: CoinsIcon,
  twins: HandPointingIcon,
  nameless: HandPointingIcon,
  tidy: BroomIcon,
}

const domId = (s: string): string => `rv-${s.replace(/[^A-Za-z0-9_-]/g, '-')}`

export function Review({ open, onOpen, openList, openTheFile }: ReviewProps) {
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

  if (!data) {
    return (
      <main className="rv" data-testid="review">
        <header className="rv-head">
          <h1 className="rv-title">What is wrong in your price list, with the fix beside it.</h1>
        </header>
        <div className="rv-wait">
          {status === 'failed' || (status === 'ready' && !ready) ? (
            <>
              <p className="rv-quiet">
                The price list is not on this computer yet, so there is nothing to check.
              </p>
              <Button intent="act" icon={FileTextIcon} onClick={openTheFile}>
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

  return (
    <Checks data={data} open={open} onOpen={onOpen} openList={openList} meantCount={data.meant} />
  )
}

/* ============================================================
   THE CHECKS
   ============================================================ */

interface Line {
  id: string
  check: CheckId
  /** what Enter does on this line */
  enter?: () => void
}

function countOf(data: ReviewData, id: CheckId): number {
  switch (id) {
    case 'band':
      return data.band.lines.length
    case 'two':
      return data.twoPrices.count
    case 'none':
      return data.noPrice.count
    case 'twins':
      return data.twins.count
    case 'nameless':
      return data.nameless.count
    case 'tidy':
      return data.tidyCount
  }
}

function Checks({
  data,
  open: asked,
  onOpen,
  openList,
  meantCount,
}: {
  data: ReviewData
  open: CheckId | '' | '-'
  onOpen: (open: CheckId | '-') => void
  openList: ReviewProps['openList']
  meantCount: number
}) {
  const still = useStill()
  const clean = data.open === 0
  /* THE SCREEN'S OWN CHOICE: the first check that costs something, open */
  const open: CheckId | '' =
    asked === '-'
      ? ''
      : asked !== ''
        ? asked
        : (CHECKS.find((c) => c !== 'tidy' && countOf(data, c) > 0) ?? '')
  const toggle = useCallback((id: CheckId) => onOpen(open === id ? '-' : id), [open, onOpen])

  /* ---- the writes, and the way back: the configurator's and the rules' door ---- */

  const run = useCallback((command: CatalogueCommand | null) => {
    if (!command) return
    const outcome = catalogue.getState().apply(command)
    if (!isDone(outcome)) {
      if (outcome.refused !== '') say(outcome.refused, { id: STEP_TOAST })
      return
    }
    const eventId = outcome.event.id
    undo(
      outcome.said,
      () => {
        const back = catalogue.getState().undo(eventId)
        if (isDone(back)) say(back.said, { id: STEP_TOAST })
        else if (back.refused !== '') say(back.refused, { id: STEP_TOAST })
      },
      { id: STEP_TOAST },
    )
  }, [])

  /** Leave these as meant: kept on this computer, and the toast takes them back. */
  const leave = useCallback((keys: readonly string[], said: string) => {
    if (keys.length === 0) return
    const before = meantOf(prefs.getState().get(MEANT_PREF))
    const now = new Date().toISOString()
    const next: Record<string, string> = { ...before }
    for (const k of keys) next[k] = now
    prefs.getState().set(MEANT_PREF, next)
    undo(
      said,
      () => {
        const at = { ...meantOf(prefs.getState().get(MEANT_PREF)) }
        for (const k of keys) if (!(k in before)) delete at[k]
        prefs.getState().set(MEANT_PREF, at)
        say('They are back on the list.', { id: STEP_TOAST })
      },
      { id: STEP_TOAST },
    )
  }, [])

  const bringBack = useCallback(() => {
    const before = meantOf(prefs.getState().get(MEANT_PREF))
    prefs.getState().remove(MEANT_PREF)
    undo(
      'Everything left as meant is back on the list.',
      () => prefs.getState().set(MEANT_PREF, before),
      { id: STEP_TOAST },
    )
  }, [])

  /* ---- the band's one act: the next trailer, one at a time ---- */
  const bandNext = data.band.lines.find((l) => l.to !== null) ?? null
  const reband = useCallback(
    /* the maker, then the trailer as its row says it under the mark: "Dunbier ALP 5.3M-13B …" */
    (line: Reband) =>
      run(rebandCommand(line, `${makerTyped(line.tableName)} ${trailerSaid(line, true)}`)),
    [run],
  )

  /* ---- the keyboard, bound to the list: History's vocabulary ---- */
  const lines: Line[] = []
  for (const id of CHECKS) {
    lines.push({ id: domId(`check-${id}`), check: id, enter: () => toggle(id) })
    if (open !== id) continue
    if (id === 'band')
      for (const l of data.band.lines)
        lines.push({
          id: domId(`band-${l.rowId}`),
          check: id,
          enter: l.to ? () => reband(l) : undefined,
        })
  }
  const [cursor, setCursor] = useState('')
  const at = lines.findIndex((l) => l.id === cursor)
  const moveBy = (step: number): void => {
    if (lines.length === 0) return
    const next = lines[Math.min(lines.length - 1, Math.max(0, (at < 0 ? -1 : at) + step))]
    if (!next) return
    setCursor(next.id)
    document.getElementById(next.id)?.scrollIntoView({ block: 'nearest' })
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget || isField(event.target)) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault()
      moveBy(key === 'ArrowDown' ? 1 : -1)
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault()
      const to = key === 'Home' ? lines[0] : lines[lines.length - 1]
      if (to) setCursor(to.id)
    } else if (key === ' ' || key === 'Spacebar') {
      event.preventDefault()
      if (event.repeat) return
      const line = lines[at]
      if (line) toggle(line.check)
    } else if (key === 'Enter') {
      event.preventDefault()
      lines[at]?.enter?.()
    } else if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent)) && open !== '') {
      event.preventDefault()
      onOpen('-')
      setCursor(domId(`check-${open}`))
    }
  }

  const live = cursor !== '' && at >= 0 ? cursor : undefined

  return (
    <main className="rv" data-testid="review" data-read="" data-clean={clean ? '' : undefined}>
      <header className="rv-head">
        <h1 className="rv-title">
          {clean
            ? 'Nothing in your price list needs you.'
            : 'What is wrong in your price list, with the fix beside it.'}
        </h1>
        <p className="rv-quiet">
          {clean
            ? 'Every check below was read just now, and each one holds.'
            : 'Nothing changes until you press.'}
        </p>
      </header>

      {clean ? null : <Money data={data} />}

      <div
        className="rv-list"
        role="grid"
        tabIndex={0}
        aria-label="The checks"
        aria-activedescendant={live}
        onKeyDown={onKeyDown}
      >
        {CHECKS.map((id) => (
          <Check
            key={id}
            id={id}
            data={data}
            open={open === id}
            cursor={cursor}
            onToggle={() => {
              setCursor(domId(`check-${id}`))
              toggle(id)
            }}
          >
            {id === 'band' ? (
              <BandBody
                data={data}
                next={bandNext}
                cursor={cursor}
                onReband={reband}
                onOpenList={openList}
                still={still}
              />
            ) : id === 'two' ? (
              <TwoBody groups={data.twoPrices.groups} onLeave={leave} onOpenList={openList} />
            ) : id === 'none' ? (
              <NoneBody data={data} onLeave={leave} onOpenList={openList} />
            ) : id === 'twins' ? (
              <TwinsBody items={data.twins.items} onName={run} onLeave={leave} />
            ) : id === 'nameless' ? (
              <NamelessBody
                groups={data.nameless.groups}
                onName={run}
                onLeave={leave}
                onOpenList={openList}
              />
            ) : (
              <TidyBody data={data} />
            )}
          </Check>
        ))}
      </div>

      {meantCount > 0 ? (
        <footer className="rv-foot">
          <p className="rv-quiet">
            {counted(meantCount, 'line is', 'lines are')} left as meant. Each comes back on its own
            if what it names changes.
          </p>
          <Button intent="quiet" size="sm" onClick={bringBack}>
            Bring them back
          </Button>
        </footer>
      ) : null}
    </main>
  )
}

/* ============================================================
   THE MONEY, IN THE HEAD — said here, and the checks below say their counts
   ============================================================ */

function Money({ data }: { data: ReviewData }) {
  const facts: Array<{ key: string; figure: ReactNode; words: string }> = []
  if (data.band.notCharged > 0)
    facts.push({
      key: 'not',
      figure: <Figure value={data.band.notCharged} prefix="$" />,
      words: `registration not charged on ${counted(data.band.notChargedOn, 'trailer', 'trailers')}`,
    })
  if (data.band.chargedOver > 0)
    facts.push({
      key: 'over',
      figure: <Figure value={data.band.chargedOver} prefix="$" />,
      words: `charged over on ${data.band.chargedOverOn}`,
    })
  if (data.twoPrices.count > 0)
    facts.push({
      key: 'two',
      figure: <Figure value={data.twoPrices.count} />,
      words: data.twoPrices.count === 1 ? 'name at two prices' : 'names at two prices',
    })
  if (data.noPrice.count > 0)
    facts.push({
      key: 'none',
      figure: <Figure value={data.noPrice.count} />,
      words: 'on sale with no price',
    })
  if (facts.length === 0) return null
  return (
    <dl className="rv-money" aria-label="What it costs" data-ground="plate">
      {facts.map((f) => (
        <div className="rv-money__fact" key={f.key}>
          <dt className="rv-money__figure">{f.figure}</dt>
          <dd className="rv-money__words">{f.words}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ============================================================
   ONE CHECK: its line, and what it opens into
   ============================================================ */

function summaryOf(data: ReviewData, id: CheckId): string {
  switch (id) {
    case 'band':
      return `Read from the fee list’s own labels, ${readFromSaid(data.band.readFrom)} · ${counted(data.band.tested, 'trailer', 'trailers')} checked`
    case 'two': {
      const widest = data.twoPrices.widest
      const where = data.twoPrices.groups.map((g) => `${g.tableName} ${g.items.length}`).join(' · ')
      return widest
        ? `${where} · widest: ${widest.name}, at ${money(widest.low)} and ${money(widest.high)}`
        : where
    }
    case 'none': {
      return data.noPrice.lists
        .map((l) => `${l.tableName} ${l.count.toLocaleString('en-AU')}`)
        .concat(
          data.noPrice.packages.map(
            (p) =>
              `${p.tableName}’s ${counted(p.count, 'boat is', 'boats are')} sold as a factory package, which carries the price, so not counted`,
          ),
        )
        .join(' · ')
    }
    case 'twins': {
      const byList = new Map<string, string[]>()
      for (const t of data.twins.items)
        byList.set(t.tableName, [...(byList.get(t.tableName) ?? []), `two ${t.name}`])
      return `${[...byList.entries()].map(([n, w]) => `${n} has ${andMore(w, 3)}`).join('; ')}. Which one does a quote read?`
    }
    case 'nameless':
      return `${data.nameless.groups.map((g) => `${g.tableName} ${g.items.length}`).join(' · ')} · a salesperson sees a blank line`
    case 'tidy':
      return 'None of them changes a price.'
  }
}

function Check({
  id,
  data,
  open,
  cursor,
  onToggle,
  children,
}: {
  id: CheckId
  data: ReviewData
  open: boolean
  cursor: string
  onToggle: () => void
  children: ReactNode
}) {
  const n = countOf(data, id)
  const holds = n === 0
  const rowId = domId(`check-${id}`)
  const words = CHECK_WORDS[id]
  const bodyId = domId(`body-${id}`)
  return (
    <div
      role="rowgroup"
      className="rv-check"
      data-check={id}
      data-open={open && !holds ? '' : undefined}
      data-holds={holds ? '' : undefined}
      /* a check that finds something is a white plate, the day in both themes; one that holds
         is a sentence on the ground */
      data-ground={holds ? undefined : 'plate'}
    >
      <div
        role="row"
        id={rowId}
        className="rv-checkhead"
        data-on={cursor === rowId ? '' : undefined}
        onClick={holds ? undefined : onToggle}
      >
        <span role="gridcell" className="rv-checkhead__name">
          <span className="rv-checkhead__glyph" data-holds={holds ? '' : undefined}>
            <Icon glyph={holds ? CheckCircleIcon : GLYPH[id]} weight={holds ? 'fill' : 'bold'} />
          </span>
          {holds ? (
            <span className="rv-checkhead__true">{words.true}</span>
          ) : (
            <>
              <span className="rv-checkhead__title">{words.wrong}</span>
              <span className="rv-count">
                <Figure value={n} />
              </span>
            </>
          )}
        </span>
        <span role="gridcell" className="rv-checkhead__say">
          {holds
            ? id === 'band' && data.band.tested > 0
              ? `${counted(data.band.tested, 'trailer', 'trailers')} checked`
              : ''
            : summaryOf(data, id)}
        </span>
        <span role="gridcell" className="rv-checkhead__act">
          {holds ? null : (
            <Button
              intent="quiet"
              size="sm"
              icon={CaretDownIcon}
              aria-expanded={open}
              aria-controls={open ? bodyId : undefined}
              onClick={(event) => {
                event.stopPropagation()
                onToggle()
              }}
            >
              {open ? 'Fold' : 'Open'}
            </Button>
          )}
        </span>
      </div>
      {open && !holds ? (
        <div role="presentation" id={bodyId} className="rv-body">
          {children}
        </div>
      ) : null}
    </div>
  )
}

/* ============================================================
   THE BAND: the file as it reads, and beside it the line as it would — the press
   ============================================================ */

function Mark({ choice, name }: { choice: MarkChoice; name: string }) {
  return choice.drawn ? (
    <img
      className="rv-mark"
      src={choice.mark.src}
      alt={name}
      width={choice.mark.width}
      height={choice.mark.height}
      decoding="async"
    />
  ) : (
    <span className="rv-mark rv-mark--typed">{makerTyped(name)}</span>
  )
}

function BandBody({
  data,
  next,
  cursor,
  onReband,
  onOpenList,
  still,
}: {
  data: ReviewData
  next: Reband | null
  cursor: string
  onReband: (line: Reband) => void
  onOpenList: ReviewProps['openList']
  still: boolean
}) {
  const marks = useMemo(() => {
    const out = new Map<string, MarkChoice>()
    for (const l of data.band.lines)
      if (!out.has(l.tableName)) out.set(l.tableName, markFor(l.tableName, 'paper'))
    return out
  }, [data.band.lines])
  return (
    <>
      <div role="row" className="rv-cols">
        <span role="columnheader" className="rv-cols__as">
          As your price list reads · weight · rego · Sell inc Rego
        </span>
        <span role="columnheader" className="rv-cols__would">
          As it would read · press to change it
        </span>
      </div>
      {data.band.groups.map((g, gi) => (
        <Fragment key={g.key}>
          <div role="row" className="rv-say">
            <span role="gridcell" className="rv-say__words">
              {bandGroupSaid(g)}{' '}
              <span className="rv-quiet">
                {g.way === 'heavier'
                  ? 'The customer is charged too little on each.'
                  : 'The customer is charged too much on each.'}
              </span>
            </span>
            <span role="gridcell" className="rv-say__act">
              {gi === 0 && next ? (
                <Button
                  intent="primary"
                  size="sm"
                  icon={ArrowRightIcon}
                  onClick={() => onReband(next)}
                >
                  {`Fix the next · ${signed(next.to?.delta ?? 0)}`}
                </Button>
              ) : null}
            </span>
          </div>
          <AnimatePresence initial={false}>
            {g.lines.map((line) => {
              const choice = marks.get(line.tableName) ?? { drawn: false as const, because: '' }
              const id = domId(`band-${line.rowId}`)
              const refusal = rebandRefusal(line)
              const said = trailerSaid(line, true)
              return (
                <motion.div
                  key={line.rowId}
                  role="row"
                  id={id}
                  className="rv-band"
                  data-on={cursor === id ? '' : undefined}
                  layout={!still}
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={transition('travel', still)}
                >
                  <span role="gridcell" className="rv-band__as">
                    <span className="rv-band__mark">
                      <Mark choice={choice} name={line.tableName} />
                    </span>
                    <span className="rv-band__name">{said}</span>
                    <span className="rv-band__kg">{kg(line.atmKg)}</span>
                    <span className="rv-band__reg">
                      {line.word}
                      {line.fee !== null ? ` · ${money(line.fee)}` : ''}
                    </span>
                    <span className="rv-band__sell">
                      {line.sell !== null ? money(line.sell) : ''}
                    </span>
                  </span>
                  <span role="gridcell" className="rv-band__would">
                    {line.to ? (
                      <Tile
                        shape="row"
                        tone="fix"
                        current={next?.rowId === line.rowId}
                        label={`${said}: make it ${line.to.word} at ${money(line.to.fee)}, sells at ${line.to.sell !== null ? money(line.to.sell) : 'the same'}, ${signed(line.to.delta)}`}
                        onSelect={() => onReband(line)}
                      >
                        <span className="rv-fix">
                          <span className="rv-fix__reg">
                            {line.to.word} · {money(line.to.fee)}
                          </span>
                          <span className="rv-fix__sell">
                            {line.to.sell !== null ? money(line.to.sell) : ''}
                          </span>
                          <span
                            className="rv-fix__delta"
                            data-way={line.to.delta > 0 ? 'up' : 'down'}
                          >
                            {signed(line.to.delta)}
                          </span>
                          <span className="rv-fix__go" aria-hidden="true">
                            <Icon glyph={ArrowRightIcon} />
                          </span>
                        </span>
                      </Tile>
                    ) : (
                      <span className="rv-band__refused">
                        <span>{refusal}</span>
                        <Button
                          intent="quiet"
                          size="sm"
                          icon={ArrowSquareOutIcon}
                          onClick={() => onOpenList(line.tableId, line.rowId)}
                        >
                          Open it in the price list
                        </Button>
                      </span>
                    )}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </Fragment>
      ))}
      <div role="row" className="rv-note">
        <span role="gridcell">
          One press writes one trailer: its rego type, its fee and its Sell inc Rego, as one step
          the toast can undo. A size is never chosen for several trailers at once.
        </span>
      </div>
    </>
  )
}

/* ============================================================
   ONE NAME, TWO PRICES — grouped by list, with the two presses that clear a group
   ============================================================ */

function LeaveAct({
  keys,
  n,
  said,
  onLeave,
}: {
  keys: readonly string[]
  n: number
  said: string
  onLeave: (keys: readonly string[], said: string) => void
}) {
  return (
    <Tooltip content="Nothing in the price list changes. They stay off this list until what they name changes.">
      <Button intent="quiet" size="sm" onClick={() => onLeave(keys, said)}>
        {n === 1 ? 'Leave it as meant' : `Leave the ${n.toLocaleString('en-AU')} as meant`}
      </Button>
    </Tooltip>
  )
}

function TwoBody({
  groups,
  onLeave,
  onOpenList,
}: {
  groups: PlaceGroup<TwoPrices>[]
  onLeave: (keys: readonly string[], said: string) => void
  onOpenList: ReviewProps['openList']
}) {
  return (
    <>
      {groups.map((g) => (
        <Fragment key={g.tableId}>
          <div role="row" className="rv-group">
            <span role="gridcell" className="rv-group__name">
              {g.tableName}
            </span>
            <span role="gridcell" className="rv-group__count">
              {counted(g.items.length, 'name', 'names')} at two {g.priceName} prices
            </span>
            <span role="gridcell" className="rv-group__acts">
              <LeaveAct
                keys={g.items.map((i) => i.key)}
                n={g.items.length}
                said={`${counted(g.items.length, 'name', 'names')} in ${g.tableName} left as meant.`}
                onLeave={onLeave}
              />
            </span>
          </div>
          {g.items.map((item) => (
            <div role="row" className="rv-item" key={item.key}>
              <span role="gridcell" className="rv-item__name">
                {item.name}
              </span>
              <span role="gridcell" className="rv-item__lines">
                {item.lines.map((l) => (
                  <span key={l.rowId} className="rv-item__line">
                    {l.code !== '' ? <span className="rv-code">{l.code}</span> : null}
                    <span className="rv-item__price">{money(l.price)}</span>
                  </span>
                ))}
              </span>
              <span role="gridcell" className="rv-item__acts">
                <Button
                  intent="quiet"
                  size="sm"
                  icon={ArrowSquareOutIcon}
                  onClick={() => onOpenList(g.tableId, undefined, item.name)}
                >
                  Open in the price list
                </Button>
              </span>
            </div>
          ))}
        </Fragment>
      ))}
    </>
  )
}

/* ============================================================
   ON SALE, NO PRICE — one line per group, the press that clears several
   ============================================================ */

function NoneBody({
  data,
  onLeave,
  onOpenList,
}: {
  data: ReviewData
  onLeave: (keys: readonly string[], said: string) => void
  onOpenList: ReviewProps['openList']
}) {
  /* BY LIST, SAID ONCE: the list and the price it was read at stand over its groups, so no
     group repeats them */
  return (
    <>
      {data.noPrice.lists.map((list) => {
        const alone = list.groups.length === 1 && list.groups[0]!.category === null
        return (
          <Fragment key={list.tableId}>
            {alone ? null : (
              <div role="row" className="rv-sub">
                <span role="gridcell">
                  {list.tableName}
                  <span className="rv-sub__quiet">
                    {` · ${counted(list.count, 'line', 'lines')} by their own category, read at ${list.priceName}`}
                  </span>
                </span>
              </div>
            )}
            {list.groups.map((g) => (
              <NoneGroup
                key={g.key}
                group={g}
                name={g.category ? spokenCategory(g.category) : g.tableName}
                price={alone ? g.priceName : ''}
                onLeave={onLeave}
                onOpenList={onOpenList}
              />
            ))}
          </Fragment>
        )
      })}
    </>
  )
}

function NoneGroup({
  group: g,
  name,
  price,
  onLeave,
  onOpenList,
}: {
  group: NoPriceGroup
  name: string
  price: string
  onLeave: (keys: readonly string[], said: string) => void
  onOpenList: ReviewProps['openList']
}) {
  const n = g.lines.length
  const what =
    g.kind === 'zero'
      ? `${n.toLocaleString('en-AU')} at $0`
      : `${n.toLocaleString('en-AU')} with no price`
  return (
    <div role="row" className="rv-group rv-group--none">
      <span role="gridcell" className="rv-group__name">
        {name}
      </span>
      <span role="gridcell" className="rv-group__sample">
        {andMore(g.lines.map((l) => l.name))}
      </span>
      <span role="gridcell" className="rv-group__count">
        {what}
        {price !== '' ? <span className="rv-quiet"> · {price}</span> : null}
      </span>
      <span role="gridcell" className="rv-group__acts">
        <LeaveAct
          keys={g.lines.map((l) => l.key)}
          n={n}
          said={`${what} in ${name} left as meant.`}
          onLeave={onLeave}
        />
        <Button
          intent="quiet"
          size="sm"
          icon={ArrowSquareOutIcon}
          onClick={() => onOpenList(g.tableId, g.lines[0]?.rowId)}
        >
          {n === 1 ? 'Price it' : 'Price them'}
        </Button>
      </span>
    </div>
  )
}

/* ============================================================
   TWO UNDER ONE NAME — each named in place
   ============================================================ */

function sampleSaid(sample: ReadonlyArray<string | number>, numeric: boolean): string {
  return sample
    .map((v) => (typeof v === 'number' && numeric ? money(Math.round(v * 100) / 100) : String(v)))
    .join(', ')
}

function TwinsBody({
  items,
  onName,
  onLeave,
}: {
  items: Twins[]
  onName: (command: CatalogueCommand | null) => void
  onLeave: (keys: readonly string[], said: string) => void
}) {
  const tables = useCatalogue((s) => s.tables)
  return (
    <>
      {items.map((t) => (
        <TwinRow key={t.key} twin={t} tables={tables} onName={onName} onLeave={onLeave} />
      ))}
    </>
  )
}

function TwinRow({
  twin,
  tables,
  onName,
  onLeave,
}: {
  twin: Twins
  tables: ReturnType<typeof catalogue.getState>['tables']
  onName: (command: CatalogueCommand | null) => void
  onLeave: (keys: readonly string[], said: string) => void
}) {
  const [name, setName] = useState('')
  /* THE REFUSAL IS SAID ONLY ONCE IT IS ASKED FOR: never at rest, under every empty field */
  const [tried, setTried] = useState(false)
  const table = tables[twin.tableId]
  const second = twin.columns[twin.columns.length - 1]!
  const press = (): void => {
    onName(nameTwinCommand(twin.tableId, second.fieldId, twin.name, name))
    setName('')
    setTried(false)
  }
  const neighbours = new Set(twin.columns.map((c) => c.after))
  const tells = neighbours.size === twin.columns.length
  return (
    <div role="row" className="rv-twin">
      <span role="gridcell" className="rv-twin__name">
        Two called <q>{twin.name}</q>
        <span className="rv-group__list"> · {twin.tableName}</span>
      </span>
      <span role="gridcell" className="rv-twin__cols">
        {twin.columns.map((c, i) => {
          const field = table?.fields.find((f) => f.id === c.fieldId)
          const cost = table && field ? isCostColumn(table, field) : true
          return (
            <span key={c.fieldId} className="rv-twin__col">
              <span className="rv-twin__which">
                {i === 0 ? 'The first' : i === 1 ? 'The second' : `Number ${i + 1}`}
                {tells && c.after ? `, after ${c.after}` : ''}
              </span>
              <span className="rv-twin__sample">
                {cost ? 'a cost, not shown here' : sampleSaid(c.sample, c.numeric) || 'empty'}
              </span>
            </span>
          )
        })}
      </span>
      <span role="gridcell" className="rv-twin__acts">
        <span className="rv-twin__field">
          <Input
            aria-label={`A name of its own for the second ${twin.name} in ${twin.tableName}`}
            placeholder="A name for the second"
            value={name}
            onValueChange={setName}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && name.trim() !== '') {
                event.preventDefault()
                press()
              }
            }}
          />
        </span>
        <Button
          intent="secondary"
          size="sm"
          refusedBecause={
            tried && name.trim() === '' ? 'Type the second one’s name first.' : undefined
          }
          onClick={() => (name.trim() === '' ? setTried(true) : press())}
        >
          Name it
        </Button>
        <LeaveAct
          keys={[twin.key]}
          n={1}
          said={`The two called “${twin.name}” in ${twin.tableName} are left as meant.`}
          onLeave={onLeave}
        />
      </span>
    </div>
  )
}

/* ============================================================
   NOTHING TO NAME IT — each named in place
   ============================================================ */

function NamelessBody({
  groups,
  onName,
  onLeave,
  onOpenList,
}: {
  groups: PlaceGroup<Nameless>[]
  onName: (command: CatalogueCommand | null) => void
  onLeave: (keys: readonly string[], said: string) => void
  onOpenList: ReviewProps['openList']
}) {
  return (
    <>
      {groups.map((g) => (
        <Fragment key={g.tableId}>
          <div role="row" className="rv-group">
            <span role="gridcell" className="rv-group__name">
              {g.tableName}
            </span>
            <span role="gridcell" className="rv-group__count">
              {counted(g.items.length, 'line', 'lines')} with nothing in{' '}
              {g.items[0]?.nameField.name}
            </span>
            <span role="gridcell" className="rv-group__acts">
              <LeaveAct
                keys={g.items.map((i) => i.key)}
                n={g.items.length}
                said={`${counted(g.items.length, 'line', 'lines')} in ${g.tableName} left as meant.`}
                onLeave={onLeave}
              />
              <Button
                intent="quiet"
                size="sm"
                icon={ArrowSquareOutIcon}
                onClick={() => onOpenList(g.tableId, g.items[0]?.rowId)}
              >
                Open in the price list
              </Button>
            </span>
          </div>
          {g.items.map((item) => (
            <NamelessRow key={item.key} item={item} onName={onName} />
          ))}
        </Fragment>
      ))}
    </>
  )
}

function NamelessRow({
  item,
  onName,
}: {
  item: Nameless
  onName: (command: CatalogueCommand | null) => void
}) {
  const [name, setName] = useState('')
  /* THE REFUSAL IS SAID ONLY ONCE IT IS ASKED FOR: never at rest, under every empty field */
  const [tried, setTried] = useState(false)
  const press = (): void => {
    onName(nameLineCommand(item.tableId, item.tableName, item.rowId, item.nameField.id, name))
    setName('')
    setTried(false)
  }
  return (
    <div role="row" className="rv-item">
      <span role="gridcell" className="rv-item__name rv-quiet">
        {item.says !== '' ? `Says only “${item.says}”` : 'Nothing else is written on it'}
      </span>
      <span role="gridcell" className="rv-item__field">
        <Input
          aria-label={`${item.nameField.name} for a line in ${item.tableName} that says ${item.says || 'nothing'}`}
          placeholder={`Its ${item.nameField.name.toLowerCase()}`}
          value={name}
          onValueChange={setName}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && name.trim() !== '') {
              event.preventDefault()
              press()
            }
          }}
        />
      </span>
      <span role="gridcell" className="rv-item__acts">
        <Button
          intent="secondary"
          size="sm"
          refusedBecause={tried && name.trim() === '' ? 'Type its name first.' : undefined}
          onClick={() => (name.trim() === '' ? setTried(true) : press())}
        >
          Name it
        </Button>
      </span>
    </div>
  )
}

/* ============================================================
   TIDY — counted, folded, and none of it a price
   ============================================================ */

function TidyBody({ data }: { data: ReviewData }) {
  return (
    <>
      {data.tidy.map((t) => (
        <div role="row" className="rv-group rv-group--tidy" key={t.ruleId}>
          <span role="gridcell" className="rv-group__name">
            {tidySaid(t.ruleId)}
          </span>
          <span role="gridcell" className="rv-group__count">
            {t.count.toLocaleString('en-AU')}
          </span>
          <span role="gridcell" className="rv-group__sample">
            {andMore(t.places, 3)}
          </span>
        </div>
      ))}
      <div role="row" className="rv-note">
        <span role="gridcell">
          These are about how the price list is laid out. Each is changed in the price list itself,
          where the whole list stands around it.
        </span>
      </div>
    </>
  )
}
