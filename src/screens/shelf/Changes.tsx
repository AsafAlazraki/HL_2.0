import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Virtuoso } from 'react-virtuoso'
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
  CrosshairIcon,
  DownloadSimpleIcon,
  EqualsIcon,
  FileXlsIcon,
  FunnelSimpleIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QuestionIcon,
  ReceiptIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Button, Chip, Icon, Input, Kbd, Select, isField } from '@/ui'
import {
  DOUBLED,
  narrowed,
  placeRefusal,
  placeSuggested,
  tally,
  type Candidate,
  type ChangeLine,
  type ChangeSet,
  type Choices,
  type DraftMove,
  type Moved,
  type Narrow,
  type Way,
} from '@/domain/io/changeSet'
import type { NewFilePlan } from '@/domain/io/newFile'
import { lineSaid, nameFirst } from '@/domain/quote/spoken'
import type { Applied } from './Shelf'
import { sizeOf } from './files'
import { count, dollars, figureSaid, lineName, plural, shareMoved, whenSaid } from './read'
import { useMedia } from './media'

/* ============================================================
   THE CHANGE SHEET — board A, "One working table" (docs/directions/
   data-round/shelf/boards/a.html): census → filter → lines → act.

     · IT OPENS ON WHAT DOES NOT MOVE, as a sentence (C's graft), with a
       bar in the census's four inks and its legend;
     · FOUR COUNTS THAT ARE ALSO FILTERS: change, new, can't be placed,
       doubled or halved;
     · A TOOLBAR THAT STAYS IN VIEW: find, list, supplier, which way,
       doubled or halved, and "Showing N of M";
     · ONE TABLE, VIRTUALISED, IN WORKBOOK ORDER. Its figures are the
       figures that move, each named and counted, Northside's own (cost
       and margin) marked by a lock; a line's rarer figures are named in
       the line itself, so nothing is ever "other figures". From 1,200px
       a table, below that each line a labelled card, the same content;
     · A TICK ON EVERY LINE, a tick for every line in view, and Space on
       a focused tick. A line that cannot be placed is settled in place,
       by choosing which of the lines that share its name it means;
     · APPLY PINNED IN VIEW, with what it writes counted beside it, its
       Undo said before the press, and after it the next safe act: Save a
       copy now (B's graft).
   ============================================================ */

export interface ChangesProps {
  plan: NewFilePlan
  set: ChangeSet
  file: { name: string; size: number | null; saved: string | null; readMs: number | null }
  edition: string
  fingerprint: string | null
  choices: Choices
  setChoices: (next: Choices) => void
  looked: ReadonlySet<string>
  setLooked: (next: ReadonlySet<string>) => void
  narrow: Narrow
  onNarrow: (next: Narrow) => void
  applied: Applied | null
  apply: () => string | null
  undo: () => string | null
  drafts: DraftMove[]
  save: () => Promise<void>
  saved: string | null
  lastCopy: string | null
  back: () => void
  paste: () => void
  putDown: () => void
}

const WAYS: { value: Way | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'higher', label: 'Higher' },
  { value: 'lower', label: 'Lower' },
  { value: 'new', label: 'New' },
  { value: 'cannot', label: 'Can’t place' },
  { value: 'others', label: 'Other figures only' },
]

const isNarrowed = (n: Narrow): boolean =>
  Boolean(n.list || n.supplier || n.way || n.doubled || n.q || n.figure)

export function Changes(props: ChangesProps) {
  const { plan, set, choices, setChoices, narrow, onNarrow, applied } = props
  const view = useMemo(() => narrowed(set.lines, narrow), [set, narrow])
  const counted = tally(set, choices)
  const settled = applied !== null
  const table = useMedia('(min-width: 1200px)')
  const mid = useMedia('(min-width: 1400px)')
  const widest = useMedia('(min-width: 1800px)')
  const room = table ? (widest ? 9 : mid ? 7 : 5) : 0
  const columns = useMemo(() => columnsOf(view, room), [view, room])

  return (
    <main className="sf sf-ch" data-testid="shelf" data-read="" data-see="changes">
      <nav className="sf-crumb" aria-label="The shelf">
        <Button intent="quiet" icon={ArrowLeftIcon} onClick={props.back}>
          Back to the shelf
        </Button>
      </nav>

      <Head {...props} />
      <Stay set={set} drafts={props.drafts} past={settled} choices={choices} />
      <Tiles
        set={set}
        narrow={narrow}
        onNarrow={onNarrow}
        counted={counted}
        looked={props.looked}
      />
      {narrow.list ? <Figures set={set} narrow={narrow} onNarrow={onNarrow} /> : null}
      {narrow.way === 'cannot' ? (
        <SettleHead set={set} choices={choices} setChoices={setChoices} settled={settled} />
      ) : null}
      {narrow.doubled ? <LookedHead set={set} looked={props.looked} choices={choices} /> : null}
      <Tools
        set={set}
        narrow={narrow}
        onNarrow={onNarrow}
        shown={view.length}
        table={table}
        columns={columns.length}
        head={
          view.some((l) => l.fate !== 'cannot') ? (
            <TableHead
              view={view}
              choices={choices}
              setChoices={settled ? null : setChoices}
              columns={columns}
            />
          ) : null
        }
      />

      <Lines
        view={view}
        set={set}
        narrow={narrow}
        choices={choices}
        setChoices={settled ? null : setChoices}
        looked={props.looked}
        setLooked={settled ? null : props.setLooked}
        columns={columns}
        table={table}
      />

      <p className="sf-ch-rest">
        <Glyph fate="kept" />
        <span>
          {plural(plan.listsUntouched, 'other list is', 'other lists are')} not in this workbook and
          stay exactly as they are.
          {plan.sheetsLeft.length > 0
            ? ` ${plural(plan.sheetsLeft.length, 'sheet', 'sheets')} of it feed${plan.sheetsLeft.length === 1 ? 's' : ''} no list here and ${plan.sheetsLeft.length === 1 ? 'is' : 'are'} not read: ${plan.sheetsLeft.slice(0, 5).join(', ')}${plan.sheetsLeft.length > 5 ? ' and more' : ''}.`
            : ''}{' '}
          A workbook never takes a line away. Standard inclusions and factory options are on no line
          here: they arrive with Northside’s Boat Module and Factory Options Module workbooks.
        </span>
      </p>

      <Dock {...props} counted={counted} />
    </main>
  )
}

/* ---------------------------------------------------------- */
/* the head: the workbook, and the price list it was read against */
/* ---------------------------------------------------------- */

function Head({ file, edition, fingerprint, applied, paste, putDown, lastCopy }: ChangesProps) {
  const now = new Date()
  return (
    <header className="sf-ch-head">
      <span className="sf-ch-head__glyph" aria-hidden="true">
        <Icon glyph={FileXlsIcon} size="lg" />
      </span>
      <div className="sf-ch-head__words">
        <p className="sf-eyebrow">
          {applied
            ? `Applied · ${plural(applied.changes, 'change is', 'changes are')} on the price list`
            : 'A new price list · nothing is written until you apply'}
        </p>
        <h1 className="sf-ch-title">{file.name}</h1>
        <p className="sf-ch-meta">
          {file.size !== null ? <span>{sizeOf(file.size)}</span> : null}
          {file.saved ? (
            <span>
              saved on this computer{' '}
              {new Date(file.saved).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          ) : null}
          {file.readMs !== null ? <span>read in {(file.readMs / 1000).toFixed(1)} s</span> : null}
          <span>
            against <strong>{edition.replace(/^The p/, 'the p')}</strong>
            {fingerprint ? (
              <>
                {' '}
                <code className="sf-code">{fingerprint}</code>
              </>
            ) : null}
          </span>
          {applied && lastCopy ? <span>last copy saved {whenSaid(lastCopy, now)}</span> : null}
        </p>
      </div>
      {applied ? null : (
        <div className="sf-ch-head__acts">
          <Button intent="quiet" icon={ClipboardTextIcon} onClick={paste}>
            Paste lines instead
          </Button>
          <Button intent="quiet" icon={XIcon} onClick={putDown}>
            Put the workbook down
          </Button>
        </div>
      )}
    </header>
  )
}

/* ---------------------------------------------------------- */
/* what stays, said first, with the four inks and their legend */
/* ---------------------------------------------------------- */

const share = (n: number): CSSProperties => ({ flexGrow: n, flexBasis: 0 })

function Stay({
  set,
  drafts,
  past,
  choices,
}: {
  set: ChangeSet
  drafts: DraftMove[]
  past: boolean
  choices: Choices
}) {
  /* WHAT STAYS IS WHAT IS KEPT OUT AS WELL: a change left out stays as it is, and a line placed
     by a person moves one that would otherwise have stayed */
  let outChange = 0
  let outNew = 0
  let placed = 0
  for (const l of set.lines) {
    if (l.fate === 'change' && choices.out.has(l.key)) outChange += 1
    else if (l.fate === 'new' && choices.out.has(l.key)) outNew += 1
    else if (l.fate === 'cannot') {
      const rowId = choices.placed.get(l.key)
      if ((l.candidates?.find((c) => c.rowId === rowId)?.cells.length ?? 0) > 0) placed += 1
    }
  }
  const stays = set.unmoved + outChange - placed
  const whole = set.totalRows + set.adding + set.cannot
  const inks = [
    { fate: 'kept' as const, n: stays, say: past ? 'stayed as they were' : 'stay as they are' },
    {
      fate: 'change' as const,
      n: set.changing - outChange + placed,
      say: past ? 'changed' : 'change',
    },
    { fate: 'new' as const, n: set.adding - outNew, say: 'new' },
    {
      fate: 'cannot' as const,
      n: set.cannot - choices.placed.size,
      say: past ? 'were not placed' : 'can’t be placed',
    },
  ]
  return (
    <section className="sf-stay" aria-labelledby="sf-stay-title">
      <h2 id="sf-stay-title" className="sf-stay__title">
        <span className="sf-stay__figure">{count(stays)}</span> of {count(set.totalRows)}{' '}
        {past ? 'lines were left exactly as they were.' : 'lines stay exactly as they are.'}
      </h2>
      <div className="sf-share" aria-hidden="true">
        {whole > 0
          ? inks.map((p) =>
              p.n > 0 ? (
                <span
                  key={p.fate}
                  className="sf-share__part"
                  data-fate={p.fate}
                  style={share(p.n)}
                />
              ) : null,
            )
          : null}
      </div>
      <ul className="sf-legend" aria-label="The price list after this workbook">
        {inks.map((p) => (
          <li key={p.fate} data-fate={p.fate}>
            <span className="sf-legend__ink" aria-hidden="true" />
            <strong>{count(p.n)}</strong> {p.say}
          </li>
        ))}
      </ul>
      <DraftsSaid drafts={drafts} />
    </section>
  )
}

function DraftsSaid({ drafts }: { drafts: DraftMove[] }) {
  if (drafts.length === 0) {
    return (
      <p className="sf-drafts sf-drafts--sheet">
        <Icon glyph={ReceiptIcon} />
        <span>
          <strong>No quote being written carries a line this moves.</strong> A quote already given
          never moves.
        </span>
      </p>
    )
  }
  const lines = drafts.reduce((n, d) => n + d.lines.length, 0)
  return (
    <div className="sf-drafts sf-drafts--sheet">
      <Icon glyph={ReceiptIcon} />
      <div>
        <p>
          <strong>
            {plural(drafts.length, 'quote being written carries', 'quotes being written carry')}{' '}
            {plural(lines, 'line', 'lines')} this moves.
          </strong>{' '}
          Each keeps the price it had when it was chosen; a line chosen after Apply reads the new
          one.
        </p>
        <ul className="sf-drafts__list">
          {drafts.map((d) => (
            <li key={d.quoteId}>
              <strong>{d.reference}</strong> {nameFirst(lineSaid(d.subject))}
              {d.customer ? ` · ${d.customer}` : ''} ·{' '}
              {d.lines
                .map(
                  (l) =>
                    `${l.label} ${l.carries !== null ? dollars(l.carries) : '—'} → ${dollars(l.would)}`,
                )
                .join(', ')}{' '}
              <span className="sf-fig" data-up={d.by > 0 ? '' : undefined}>
                {d.by >= 0 ? '+' : '−'}
                {dollars(Math.abs(d.by))} in all
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* the four counts, which are also filters                      */
/* ---------------------------------------------------------- */

function Tiles({
  set,
  narrow,
  onNarrow,
  counted,
  looked,
}: {
  set: ChangeSet
  narrow: Narrow
  onNarrow: (n: Narrow) => void
  counted: ReturnType<typeof tally>
  looked: ReadonlySet<string>
}) {
  const by = (pick: (l: ChangeSet['lists'][number]) => number): string =>
    set.lists
      .filter((l) => pick(l) > 0)
      .map((l) => `${count(pick(l))} ${l.name}`)
      .join(' · ')
  const doubledLooked = set.lines.filter(
    (l) => l.fate === 'change' && l.swing >= DOUBLED && looked.has(l.key),
  ).length
  const tiles = [
    {
      key: 'change',
      figure: set.changing,
      word: plural(set.changing, 'line changes', 'lines change').replace(/^[\d,]+ /, ''),
      say: by((l) => l.changing),
      on: narrow.way === 'higher' || narrow.way === 'lower' || narrow.way === 'others',
      go: { way: 'higher' as Way },
      fate: 'change',
    },
    {
      key: 'new',
      figure: set.adding,
      word: set.adding === 1 ? 'new line' : 'new lines',
      say: by((l) => l.adding) || 'none',
      on: narrow.way === 'new',
      go: { way: 'new' as Way },
      fate: 'new',
    },
    {
      key: 'cannot',
      figure: set.cannot,
      word: 'can’t be placed',
      say:
        counted.placed > 0
          ? `${count(counted.placed)} placed by you`
          : set.suggested > 0
            ? `${count(set.suggested)} named by their own Code`
            : 'each says why',
      on: narrow.way === 'cannot',
      go: { way: 'cannot' as Way },
      fate: 'cannot',
    },
    {
      key: 'doubled',
      figure: set.doubled,
      word: 'doubled or halved',
      say:
        set.doubled === 0
          ? 'none'
          : `${count(doubledLooked)} of ${count(set.doubled)} looked at${counted.leftOut.length > 0 ? ` · ${count(counted.leftOut.length)} left out` : ''}`,
      on: Boolean(narrow.doubled),
      go: { doubled: true },
      fate: 'doubled',
    },
  ]
  return (
    <fieldset className="sf-tiles">
      <legend className="sf-visually-hidden">What it would do: press one to see only those</legend>
      {tiles.map((t) => (
        <button
          key={t.key}
          type="button"
          className="sf-tile"
          data-fate={t.fate}
          aria-pressed={t.on}
          onClick={() => onNarrow(t.on ? {} : t.go)}
        >
          <span className="sf-tile__figure">{count(t.figure)}</span>
          <span className="sf-tile__word">{t.word}</span>
          <span className="sf-tile__say">{t.say}</span>
        </button>
      ))}
    </fieldset>
  )
}

/* ---------------------------------------------------------- */
/* the toolbar: find, list, supplier, way, doubled              */
/* ---------------------------------------------------------- */

function Tools({
  set,
  narrow,
  onNarrow,
  shown,
  table,
  columns,
  head,
}: {
  set: ChangeSet
  narrow: Narrow
  onNarrow: (n: Narrow) => void
  shown: number
  table: boolean
  columns: number
  head: ReactNode
}) {
  const hand = !useMedia('(min-width: 834px)')
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState(narrow.q ?? '')
  const find = useRef<HTMLElement>(null)
  /* the words go to the address a breath after the last key, so typing is never held up */
  const latest = useRef(narrow)
  latest.current = narrow
  useEffect(() => {
    if ((latest.current.q ?? '') === q.trim()) return
    const t = setTimeout(() => {
      const { q: _was, ...rest } = latest.current
      onNarrow(q.trim() === '' ? rest : { ...rest, q: q.trim() })
    }, 180)
    return () => clearTimeout(t)
  }, [q, onNarrow])
  useEffect(() => {
    if ((narrow.q ?? '') !== q.trim()) setQ(narrow.q ?? '')
    // only when the address changes from elsewhere (Clear, a tile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrow.q])
  /* "/" finds, as on every find field that shows the key */
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== '/' || isField(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      e.preventDefault()
      const el = find.current
      ;(el?.querySelector('input') ?? el)?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const listsOffered = [
    { value: 'all', label: 'Every list', trail: count(set.lines.length) },
    ...set.lists.map((l) => ({
      value: l.tableId,
      label: l.name,
      trail: count(l.changing + l.adding + l.cannot),
    })),
  ]
  const supplied = set.lists.some((l) => l.suppliers && (!narrow.list || l.tableId === narrow.list))
  const suppliersOffered = [
    { value: 'all', label: 'Every supplier', trail: '' },
    ...set.suppliers.map((s) => ({ value: s.name, label: s.name, trail: count(s.lines) })),
  ]
  const filters =
    (narrow.list ? 1 : 0) +
    (narrow.supplier ? 1 : 0) +
    (narrow.way ? 1 : 0) +
    (narrow.doubled ? 1 : 0) +
    (narrow.figure ? 1 : 0)
  const showFilters = !hand || open

  return (
    <section
      className="sf-tools"
      aria-label="Find and narrow the changes"
      data-table={table ? '' : undefined}
      style={{ '--sf-cols': columns } as CSSProperties}
    >
      <div className="sf-tools__in">
        <div className="sf-tools__find">
          <Input
            ref={find}
            icon={MagnifyingGlassIcon}
            value={q}
            onValueChange={setQ}
            placeholder="Find a name or a code"
            aria-label="Find a name, a code or a supplier"
          />
          <span className="sf-tools__key" aria-hidden="true">
            <Kbd tone="quiet">/</Kbd>
          </span>
        </div>
        {hand ? (
          <span className="sf-tools__open">
            <Button
              intent="secondary"
              icon={FunnelSimpleIcon}
              aria-expanded={open}
              aria-controls="sf-tools-more"
              onClick={() => setOpen((v) => !v)}
            >
              {filters > 0 ? `Filters ${filters}` : 'Filters'}
            </Button>
          </span>
        ) : null}
        {showFilters ? (
          <div className="sf-tools__more" id="sf-tools-more">
            <span className="sf-tools__select">
              <Select
                options={listsOffered}
                value={narrow.list ?? 'all'}
                onValueChange={(v) => {
                  const { list: _l, figure: _f, ...rest } = narrow
                  onNarrow(v && v !== 'all' ? { ...rest, list: v } : rest)
                }}
                aria-label="The list"
              />
            </span>
            {supplied ? (
              <span className="sf-tools__select">
                <Select
                  options={suppliersOffered}
                  value={narrow.supplier ?? 'all'}
                  onValueChange={(v) => {
                    const { supplier: _s, ...rest } = narrow
                    onNarrow(v && v !== 'all' ? { ...rest, supplier: v } : rest)
                  }}
                  aria-label="The supplier"
                />
              </span>
            ) : null}
            <fieldset className="sf-tools__ways">
              <legend className="sf-visually-hidden">Which way it moves</legend>
              {WAYS.map((w) => (
                <Chip
                  key={w.value}
                  selected={(narrow.way ?? 'all') === w.value}
                  onSelect={() => {
                    const { way: _w, ...rest } = narrow
                    onNarrow(w.value === 'all' ? rest : { ...rest, way: w.value })
                  }}
                >
                  {w.label}
                </Chip>
              ))}
              <Chip
                selected={Boolean(narrow.doubled)}
                onSelect={() => {
                  const { doubled: _d, ...rest } = narrow
                  onNarrow(narrow.doubled ? rest : { ...rest, doubled: true })
                }}
              >
                Doubled or halved
              </Chip>
            </fieldset>
          </div>
        ) : null}
        <p className="sf-tools__shown" aria-live="polite">
          <strong>{count(shown)}</strong> of {count(set.lines.length)} lines
          {isNarrowed(narrow) ? (
            <span className="sf-tools__clear">
              <Button intent="quiet" onClick={() => onNarrow({})}>
                Show every line
              </Button>
            </span>
          ) : null}
        </p>
        {head}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* what moves on one list, counted, before its lines (C's graft) */
/* ---------------------------------------------------------- */

function Figures({
  set,
  narrow,
  onNarrow,
}: {
  set: ChangeSet
  narrow: Narrow
  onNarrow: (n: Narrow) => void
}) {
  const list = set.lists.find((l) => l.tableId === narrow.list)
  if (!list || list.figures.length === 0) return null
  return (
    <section className="sf-figures" aria-labelledby="sf-figures-title">
      <h2 id="sf-figures-title" className="sf-figures__title">
        What moves on {list.name}: {plural(list.figures.length, 'figure', 'figures')}
        {list.readAt ? '' : ' · no price a quote reads is set on this list, so none leads'}
      </h2>
      <fieldset className="sf-figures__chips">
        <legend className="sf-visually-hidden">What moves on {list.name}</legend>
        {list.figures.map((f) => (
          <Chip
            key={f.fieldId}
            count={f.lines}
            icon={f.own ? LockSimpleIcon : undefined}
            selected={narrow.figure === f.fieldId}
            onSelect={() => {
              const { figure: _f, ...rest } = narrow
              onNarrow(narrow.figure === f.fieldId ? rest : { ...rest, figure: f.fieldId })
            }}
          >
            {f.name}
          </Chip>
        ))}
      </fieldset>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* the lines that cannot be placed: the Code's own suggestion    */
/* ---------------------------------------------------------- */

function SettleHead({
  set,
  choices,
  setChoices,
  settled,
}: {
  set: ChangeSet
  choices: Choices
  setChoices: (c: Choices) => void
  settled: boolean
}) {
  const suggested = set.lines.filter((l) => l.suggested)
  const bySupplier = suggested.filter((l) => l.suggested?.by === 'code-supplier').length
  const adds = suggested.filter(
    (l) => (l.candidates?.find((c) => c.rowId === l.suggested?.rowId)?.cells.length ?? 0) > 0,
  )
  const figures = adds.reduce(
    (n, l) => n + (l.candidates?.find((c) => c.rowId === l.suggested?.rowId)?.cells.length ?? 0),
    0,
  )
  const allPlaced =
    suggested.length > 0 && suggested.every((l) => choices.placed.get(l.key) === l.suggested?.rowId)
  const yours = set.cannot - suggested.length
  return (
    <section className="sf-settle" aria-label="Lines that can’t be placed" data-ground="plate">
      <p className="sf-settle__say">
        {suggested.length > 0 ? (
          <>
            <strong>
              {count(suggested.length)} of {count(set.cannot)}
            </strong>{' '}
            are named by the workbook’s own Code
            {bySupplier > 0 ? ` (${count(bySupplier)} with its Supplier)` : ''}. Placing them adds{' '}
            <strong>{plural(adds.length, 'change', 'changes')}</strong> (
            {plural(figures, 'figure', 'figures')}); the other{' '}
            {count(suggested.length - adds.length)} already read exactly so.{' '}
            {plural(yours, 'is', 'are')} yours to choose.
          </>
        ) : (
          <>
            {plural(set.cannot, 'line', 'lines')} can’t be placed, and each says why. None is named
            by its own Code, so each is yours to choose or to leave out.
          </>
        )}
      </p>
      {suggested.length > 0 && !settled ? (
        <span className="sf-settle__act">
          <Button
            intent="secondary"
            icon={CrosshairIcon}
            onClick={() =>
              setChoices(
                allPlaced
                  ? {
                      out: choices.out,
                      placed: new Map(
                        [...choices.placed].filter(([k]) => !suggested.some((l) => l.key === k)),
                      ),
                    }
                  : placeSuggested(set, choices),
              )
            }
          >
            {allPlaced
              ? `Leave the ${count(suggested.length)} out again`
              : `Place the ${count(suggested.length)} the Code names`}
          </Button>
        </span>
      ) : null}
    </section>
  )
}

function LookedHead({
  set,
  looked,
  choices,
}: {
  set: ChangeSet
  looked: ReadonlySet<string>
  choices: Choices
}) {
  const doubled = set.lines.filter((l) => l.fate === 'change' && l.swing >= DOUBLED)
  const seen = doubled.filter((l) => looked.has(l.key)).length
  const out = doubled.filter((l) => choices.out.has(l.key)).length
  return (
    <section className="sf-settle" aria-label="Doubled or halved" data-ground="plate">
      <p className="sf-settle__say" aria-live="polite">
        <strong>
          {count(seen)} of {count(doubled.length)} looked at
        </strong>
        {out > 0 ? ` · ${count(out)} left out` : ''}. Each price here doubled or more, or fell to
        half or less. Each may be right: keep it, or leave it out of this Apply.
      </p>
      <div className="sf-progress" aria-hidden="true">
        <span
          className="sf-progress__done"
          style={{ inlineSize: `${doubled.length === 0 ? 0 : (seen / doubled.length) * 100}%` }}
        />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* the lines                                                   */
/* ---------------------------------------------------------- */

interface Column {
  name: string
  own: boolean
  lines: number
}

type Item =
  | { kind: 'head'; key: string; title: string; say: string }
  | { kind: 'line'; key: string; line: ChangeLine }

function itemsOf(view: readonly ChangeLine[], set: ChangeSet, narrow: Narrow): Item[] {
  const out: Item[] = []
  let list: string | null = null
  let category: string | null = null
  const byList = new Map<string, ChangeLine[]>()
  for (const l of view) byList.set(l.tableId, [...(byList.get(l.tableId) ?? []), l])
  for (const l of view) {
    if (l.tableId !== list && !narrow.doubled) {
      list = l.tableId
      category = null
      const mine = byList.get(l.tableId) ?? []
      const census = set.lists.find((x) => x.tableId === l.tableId)
      const c = mine.filter((x) => x.fate === 'change').length
      const n = mine.filter((x) => x.fate === 'new').length
      const k = mine.filter((x) => x.fate === 'cannot').length
      out.push({
        kind: 'head',
        key: `head:${l.tableId}`,
        title: l.tableId === '' ? `On ${l.sheet}, which feeds several lists` : l.list,
        say: [
          c > 0 ? `${count(c)} change` : null,
          n > 0 ? `${count(n)} new` : null,
          k > 0 ? `${count(k)} can’t be placed` : null,
          census && !census.readAt && l.tableId !== ''
            ? 'no price a quote reads is set on this list'
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
      })
    }
    /* by a supplier, the lines fall into the workbook's own categories, each said once */
    if (narrow.supplier && l.category !== '' && l.category !== category) {
      category = l.category
      const mine = view.filter((x) => x.tableId === l.tableId && x.category === l.category)
      const lower = mine.filter(
        (x) => x.read && x.read.to != null && x.read.from != null && x.read.to < x.read.from,
      ).length
      const higher = mine.filter(
        (x) => x.read && x.read.to != null && x.read.from != null && x.read.to > x.read.from,
      ).length
      const at = mine.find((x) => x.read)?.read?.label
      out.push({
        kind: 'head',
        key: `cat:${l.tableId}:${l.category}:${l.at}`,
        title: l.category,
        say: [
          plural(mine.length, 'line', 'lines'),
          at && lower === mine.length ? `all ${count(lower)} lower at ${at}` : null,
          at && higher === mine.length ? `all ${count(higher)} higher at ${at}` : null,
          at && lower !== mine.length && higher !== mine.length && lower + higher > 0
            ? `${count(higher)} higher, ${count(lower)} lower at ${at}`
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
      })
    }
    out.push({ kind: 'line', key: l.key, line: l })
  }
  return out
}

function columnsOf(view: readonly ChangeLine[], room: number): Column[] {
  const by = new Map<string, Column & { first: number; read: boolean }>()
  let i = 0
  for (const l of view) {
    for (const c of l.cells) {
      const k = by.get(c.name)
      if (k) k.lines += 1
      else by.set(c.name, { name: c.name, own: c.own, lines: 1, first: i++, read: false })
      if (l.read && l.read.fieldId === c.fieldId) by.get(c.name)!.read = true
    }
  }
  return [...by.values()]
    .toSorted((a, b) => Number(b.read) - Number(a.read) || b.lines - a.lines || a.first - b.first)
    .slice(0, room)
}

/** What every drawn line needs from the table, handed to the list once rather than closed over. */
interface Drawn {
  set: ChangeSet
  choices: Choices
  columns: Column[]
  table: boolean
  looked: ReadonlySet<string>
  triage: boolean
  place: ((l: ChangeLine, rowId: string | null) => void) | null
  toggle: ((l: ChangeLine, keep: boolean) => void) | null
  lookAt: ((l: ChangeLine, keep: boolean) => void) | null
}

const VIEWPORT = { top: 600, bottom: 900 }
const keyOf = (_i: number, item: Item): string => item.key

function drawItem(_i: number, item: Item, d: Drawn) {
  if (item.kind === 'head') {
    return (
      <h3 className="sf-group">
        <strong>{item.title}</strong>
        {item.say ? <span> · {item.say}</span> : null}
      </h3>
    )
  }
  const l = item.line
  if (l.fate === 'cannot') {
    const place = d.place
    return (
      <CannotLine
        line={l}
        set={d.set}
        choices={d.choices}
        place={place ? (rowId) => place(l, rowId) : null}
      />
    )
  }
  const toggle = d.toggle
  const lookAt = d.lookAt
  return (
    <Line
      line={l}
      columns={d.columns}
      table={d.table}
      keep={!d.choices.out.has(l.key)}
      toggle={toggle ? (keep) => toggle(l, keep) : null}
      triage={d.triage && lookAt ? (keep) => lookAt(l, keep) : null}
      looked={d.looked.has(l.key)}
    />
  )
}

/** THE HEAD OF THE TABLE, which stands in the toolbar so it stays in view with it: a tick for
 *  every line in view, the lock's legend, and each figure that moves, named and counted. */
function TableHead({
  view,
  choices,
  setChoices,
  columns,
}: {
  view: readonly ChangeLine[]
  choices: Choices
  setChoices: ((c: Choices) => void) | null
  columns: Column[]
}) {
  const tickable = view.filter((l) => l.fate !== 'cannot')
  const inView = tickable.filter((l) => !choices.out.has(l.key)).length
  const all = tickable.length > 0 && inView === tickable.length
  const none = inView === 0
  const master = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (master.current) master.current.indeterminate = !all && !none
  }, [all, none])
  const toggleAll = (): void => {
    if (!setChoices) return
    const out = new Set(choices.out)
    for (const l of tickable) {
      if (all) out.add(l.key)
      else out.delete(l.key)
    }
    setChoices({ out, placed: choices.placed })
  }
  return (
    <>
      {tickable.length > 0 ? (
        <div className="sf-table__head">
          <label className="sf-tickcell">
            <input
              ref={master}
              type="checkbox"
              className="sf-tick"
              checked={all}
              onChange={toggleAll}
              aria-describedby={setChoices ? undefined : 'sf-applied-why'}
              readOnly={!setChoices}
            />
            <span className="sf-visually-hidden">
              {setChoices
                ? `Keep every line in view (${count(tickable.length)})`
                : 'Applied: these are what was written'}
            </span>
          </label>
          <span className="sf-table__line">
            <span>
              {setChoices ? `Keep every line in view · ${count(tickable.length)}` : 'Line'}
            </span>
            <small>
              <Icon glyph={LockSimpleIcon} /> Northside’s own: cost and margin
            </small>
          </span>
          {columns.map((c) => (
            <span key={c.name} className="sf-table__col" data-own={c.own ? '' : undefined}>
              <span>
                {c.own ? <Icon glyph={LockSimpleIcon} /> : null}
                {c.name}
              </span>
              <small>{count(c.lines)}</small>
            </span>
          ))}
        </div>
      ) : null}
    </>
  )
}

function Lines({
  view,
  set,
  narrow,
  choices,
  setChoices,
  looked,
  setLooked,
  columns,
  table,
}: {
  view: ChangeLine[]
  set: ChangeSet
  narrow: Narrow
  choices: Choices
  setChoices: ((c: Choices) => void) | null
  looked: ReadonlySet<string>
  setLooked: ((s: ReadonlySet<string>) => void) | null
  columns: Column[]
  table: boolean
}) {
  const items = useMemo(() => itemsOf(view, set, narrow), [view, set, narrow])

  const toggle = (l: ChangeLine, keep: boolean): void => {
    if (!setChoices) return
    const out = new Set(choices.out)
    if (keep) out.delete(l.key)
    else out.add(l.key)
    setChoices({ out, placed: choices.placed })
  }
  const lookAt = (l: ChangeLine, keep: boolean): void => {
    toggle(l, keep)
    if (setLooked) setLooked(new Set([...looked, l.key]))
  }
  const place = (l: ChangeLine, rowId: string | null): void => {
    if (!setChoices) return
    const placed = new Map(choices.placed)
    if (rowId) placed.set(l.key, rowId)
    else placed.delete(l.key)
    setChoices({ out: choices.out, placed })
  }

  if (view.length === 0) {
    return (
      <p className="sf-none" aria-live="polite">
        No line of this workbook is {narrow.q ? `found by “${narrow.q}” ` : ''}in what is shown.
        Show every line to see them all.
      </p>
    )
  }

  const gridStyle = { '--sf-cols': columns.length } as CSSProperties
  return (
    <section
      className="sf-table"
      data-table={table ? '' : undefined}
      aria-label="The changes, line by line"
      style={gridStyle}
    >
      {setChoices ? null : (
        <p id="sf-applied-why" className="sf-table__why">
          Applied: the ticks say what was written and what was left out. Undo puts it all back, and
          then they can be changed.
        </p>
      )}
      <Virtuoso<Item, Drawn>
        useWindowScroll
        data={items}
        context={{
          set,
          choices,
          columns,
          table,
          looked,
          triage: Boolean(narrow.doubled),
          place: setChoices ? place : null,
          toggle: setChoices ? toggle : null,
          lookAt: setChoices ? lookAt : null,
        }}
        computeItemKey={keyOf}
        initialItemCount={Math.min(items.length, 24)}
        increaseViewportBy={VIEWPORT}
        itemContent={drawItem}
      />
    </section>
  )
}

/* ---------------------------------------------------------- */

function Glyph({ fate }: { fate: 'change' | 'new' | 'cannot' | 'kept' }) {
  const glyph =
    fate === 'change'
      ? ArrowRightIcon
      : fate === 'new'
        ? PlusIcon
        : fate === 'cannot'
          ? QuestionIcon
          : EqualsIcon
  return (
    <span className="sf-glyph" data-fate={fate} aria-hidden="true">
      <Icon glyph={glyph} />
    </span>
  )
}

const said = (l: ChangeLine): string =>
  l.tableId === ''
    ? nameFirst(lineSaid(l.name.replace(/\s+/g, ' ').trim()))
    : lineName(l.name, { tableId: l.tableId, name: l.list }, false)

function Meta({ line, withList = false }: { line: ChangeLine; withList?: boolean }) {
  return (
    <span className="sf-line__meta">
      {withList && line.list ? <span>{line.list}</span> : null}
      {line.supplier ? <span>{line.supplier}</span> : null}
      {line.code ? <code className="sf-code">{line.code}</code> : null}
      <span className="sf-line__at">
        {line.sheet}, line {count(line.at)}
      </span>
    </span>
  )
}

function Figure({ m, read }: { m: Moved; read: boolean }) {
  const pct = read ? shareMoved(m.from, m.to) : null
  const up = typeof m.from === 'number' && typeof m.to === 'number' ? m.to > m.from : false
  return (
    <span className="sf-fig sf-move">
      {m.from !== null && m.from !== '' ? (
        <s className="sf-move__was">{figureSaid(m.from, m.as)}</s>
      ) : null}
      <strong className="sf-move__now">{figureSaid(m.to, m.as)}</strong>
      {pct ? (
        <span className="sf-move__pct" data-up={up ? '' : undefined}>
          {pct}
        </span>
      ) : null}
    </span>
  )
}

function Line({
  line,
  columns,
  table,
  keep,
  toggle,
  triage,
  looked,
}: {
  line: ChangeLine
  columns: Column[]
  table: boolean
  keep: boolean
  toggle: ((keep: boolean) => void) | null
  triage: ((keep: boolean) => void) | null
  looked: boolean
}) {
  const name = said(line)
  const shown = new Set(table ? columns.map((c) => c.name) : [])
  /* in a card the price a quote reads leads, then the rest in the list's own order */
  const rest = line.cells
    .filter((c) => !shown.has(c.name))
    .toSorted(
      (a, b) => Number(b.fieldId === line.read?.fieldId) - Number(a.fieldId === line.read?.fieldId),
    )
  const isRead = (m: Moved): boolean => line.read?.fieldId === m.fieldId
  return (
    <div className="sf-line" data-fate={line.fate} data-out={keep ? undefined : ''}>
      <label className="sf-tickcell">
        <input
          type="checkbox"
          className="sf-tick"
          checked={keep}
          readOnly={!toggle}
          aria-describedby={toggle ? undefined : 'sf-applied-why'}
          onChange={(e) => toggle?.(e.target.checked)}
        />
        <span className="sf-visually-hidden">Keep {name}</span>
      </label>
      <div className="sf-line__words">
        <span className="sf-line__name">
          <Glyph fate={line.fate} />
          <span className="sf-visually-hidden">
            {line.fate === 'new' ? 'New line: ' : 'Changes: '}
          </span>
          {name}
          {keep ? null : <span className="sf-line__outsaid">Left out</span>}
        </span>
        <Meta line={line} withList={triage !== null} />
        {rest.length > 0 ? (
          table ? (
            <span className="sf-line__also">
              {rest.map((m) => (
                <span key={m.fieldId} className="sf-also">
                  {m.own ? <Icon glyph={LockSimpleIcon} /> : null}
                  {m.name}{' '}
                  {m.from !== null && m.from !== '' ? <s>{figureSaid(m.from, m.as)}</s> : null} →{' '}
                  <strong>{figureSaid(m.to, m.as)}</strong>
                </span>
              ))}
            </span>
          ) : (
            <dl className="sf-line__cells">
              {rest.map((m) => (
                <div key={m.fieldId}>
                  <dt>
                    {m.name}
                    {m.own ? (
                      <>
                        {' '}
                        <Icon glyph={LockSimpleIcon} />
                        <span className="sf-visually-hidden"> Northside’s own</span>
                      </>
                    ) : null}
                  </dt>
                  <dd>
                    <Figure m={m} read={isRead(m)} />
                  </dd>
                </div>
              ))}
            </dl>
          )
        ) : null}
        {triage ? (
          <fieldset className="sf-triage">
            <legend className="sf-visually-hidden">{name}: keep it or leave it out</legend>
            <Button
              intent={looked && keep ? 'primary' : 'secondary'}
              aria-pressed={looked && keep}
              onClick={() => triage(true)}
            >
              Keep
            </Button>
            <Button
              intent={looked && !keep ? 'primary' : 'secondary'}
              aria-pressed={looked && !keep}
              onClick={() => triage(false)}
            >
              Leave out
            </Button>
          </fieldset>
        ) : null}
      </div>
      {table
        ? columns.map((c) => {
            const m = line.cells.find((x) => x.name === c.name)
            return (
              <span key={c.name} className="sf-line__cell" data-own={c.own ? '' : undefined}>
                {m ? <Figure m={m} read={isRead(m)} /> : null}
              </span>
            )
          })
        : null}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* a line that cannot be placed, settled in place               */
/* ---------------------------------------------------------- */

const BECAUSE = {
  'said-twice':
    'An earlier line of the workbook already names the same line here, so this one stays out.',
  'no-list':
    'No list here carries this name, and its sheet feeds several, so nothing says which maker’s list it belongs on. It stays out.',
  'two-lists': 'Two lists here carry this name, so it cannot say which it means. It stays out.',
} as const

function whySaid(l: ChangeLine): string {
  if (l.because && l.because !== 'shared-name') return BECAUSE[l.because]
  const c = l.candidates ?? []
  const lead = `${count(c.length)} lines here share this name.`
  const sameTwice =
    c.length > 1 &&
    c.every((x) => x.code === c[0].code && x.read === c[0].read && x.supplier === c[0].supplier)
  if (sameTwice) {
    return `${lead} They are the same line twice, Code and price alike: either is right, and Review can fold them into one.`
  }
  if (l.suggested?.by === 'code') {
    return `${lead} The workbook’s own Code, ${l.code}, is on one of them.`
  }
  if (l.suggested?.by === 'code-supplier') {
    return `${lead} Both carry Code ${l.code}; the workbook’s Supplier, ${l.supplier}, is on one of them.`
  }
  if (l.code) return `${lead} The workbook’s Code, ${l.code}, is on neither, so only you can say.`
  return `${lead} The workbook gives no Code, so only you can say.`
}

function placedSaid(c: Candidate | undefined): string | null {
  if (!c) return null
  if (c.cells.length === 0) return 'Placed, it changes nothing: that line already reads exactly so.'
  const first = c.cells
    .slice(0, 3)
    .map((m) => `${m.name} ${figureSaid(m.from, m.as)} → ${figureSaid(m.to, m.as)}`)
    .join(' · ')
  return `Placed, it changes ${count(c.cells.length)}: ${first}${c.cells.length > 3 ? ` and ${count(c.cells.length - 3)} more` : ''}.`
}

function CannotLine({
  line,
  set,
  choices,
  place,
}: {
  line: ChangeLine
  set: ChangeSet
  choices: Choices
  place: ((rowId: string | null) => void) | null
}) {
  const chosen = choices.placed.get(line.key) ?? null
  const candidates = line.candidates ?? []
  const group = `sf-place-${line.key.replace(/[^a-z0-9]/gi, '-')}`
  const name = said(line)
  return (
    <div
      className="sf-line sf-line--cannot"
      data-fate="cannot"
      data-placed={chosen ? '' : undefined}
    >
      <span className="sf-tickcell" aria-hidden="true">
        <Glyph fate="cannot" />
      </span>
      <div className="sf-cannot">
        <div className="sf-cannot__words">
          <span className="sf-line__name">
            <span className="sf-visually-hidden">Can’t be placed: </span>
            {name}
          </span>
          <span className="sf-line__meta">
            {line.list ? <span>{line.list}</span> : null}
            {line.supplier ? <span>{line.supplier}</span> : null}
            {line.code ? <code className="sf-code">{line.code}</code> : null}
            <span className="sf-line__at">
              {line.sheet}, line {count(line.at)}
            </span>
          </span>
          <p className="sf-cannot__why">{whySaid(line)}</p>
        </div>
        {candidates.length > 0 ? (
          <fieldset className="sf-cannot__choose">
            <legend className="sf-visually-hidden">Which line here {name} means</legend>
            {candidates.map((c) => {
              const refused = place ? placeRefusal(set, choices, line.key, c.rowId) : null
              const id = `${group}-${c.rowId}`
              return (
                <label
                  key={c.rowId}
                  className="sf-option"
                  htmlFor={id}
                  data-chosen={chosen === c.rowId ? '' : undefined}
                  data-refused={refused ? '' : undefined}
                >
                  <input
                    id={id}
                    type="radio"
                    name={group}
                    checked={chosen === c.rowId}
                    readOnly={!place}
                    aria-describedby={refused ? `${id}-no` : undefined}
                    onChange={() => {
                      if (place && !refused) place(c.rowId)
                    }}
                  />
                  <span className="sf-option__words">
                    <strong>
                      {c.code || 'No Code'}
                      {c.supplier ? ` · ${c.supplier}` : ''}
                      {c.read !== null ? ` · ${dollars(c.read)}` : ''}
                    </strong>
                    <small>
                      {c.from ? `${c.from.sheet}, line ${count(c.from.at)} at first` : 'added here'}
                      {line.suggested?.rowId === c.rowId ? ' · the Code says this one' : ''}
                    </small>
                    {refused ? (
                      <small id={`${id}-no`} className="sf-option__no">
                        {refused}
                      </small>
                    ) : null}
                  </span>
                </label>
              )
            })}
            <label
              className="sf-option sf-option--out"
              htmlFor={`${group}-out`}
              data-chosen={chosen ? undefined : ''}
            >
              <input
                id={`${group}-out`}
                type="radio"
                name={group}
                checked={!chosen}
                readOnly={!place}
                onChange={() => place?.(null)}
              />
              <strong className="sf-option__out">Leave it out</strong>
              <small className="sf-option__under">it stays out of this Apply</small>
            </label>
          </fieldset>
        ) : null}
        {chosen ? (
          <p className="sf-cannot__placed">
            {placedSaid(candidates.find((c) => c.rowId === chosen))}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* the dock: what Apply writes, pinned in view                  */
/* ---------------------------------------------------------- */

function Dock({
  set,
  applied,
  apply,
  undo,
  back,
  save,
  saved,
  counted,
}: ChangesProps & { counted: ReturnType<typeof tally> }) {
  const [refused, setRefused] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  if (applied) {
    return (
      <footer className="sf-dock" data-applied="" aria-label="Applied">
        <p className="sf-dock__said" aria-live="polite">
          <Icon glyph={CheckCircleIcon} weight="fill" />
          <span>
            <strong>
              {plural(applied.changes, 'change is', 'changes are')} on the price list.
            </strong>{' '}
            {saved ? (
              `Saved as ${saved}.`
            ) : (
              <span className="sf-dock__more">
                No copy holds them yet: save a copy now. Undo puts every one back in one step.
              </span>
            )}
          </span>
        </p>
        <span className="sf-dock__acts">
          <Button
            intent="secondary"
            icon={ArrowCounterClockwiseIcon}
            onClick={() => setRefused(undo())}
            refusedBecause={refused ?? undefined}
          >
            Undo
          </Button>
          <span className="sf-dock__act">
            <Button
              intent="act"
              icon={DownloadSimpleIcon}
              onClick={() => {
                setSaving(true)
                void save().finally(() => setSaving(false))
              }}
              refusedBecause={saving ? 'Saving: the copy is being written.' : undefined}
            >
              {saved ? 'Save another copy' : 'Save a copy now'}
            </Button>
          </span>
        </span>
      </footer>
    )
  }
  if (counted.of === 0 && counted.placed === 0) {
    return (
      <footer className="sf-dock" aria-label="Nothing to apply">
        <p className="sf-dock__said" aria-live="polite">
          <Icon glyph={EqualsIcon} />
          <span>
            <strong>Nothing to apply.</strong> Every line this workbook names already reads as it
            does here
            {set.cannot > 0 ? `, and ${plural(set.cannot, 'line', 'lines')} can’t be placed` : ''}.
          </span>
        </p>
        <span className="sf-dock__acts">
          <Button intent="secondary" icon={ArrowLeftIcon} onClick={back}>
            Back to the shelf
          </Button>
        </span>
      </footer>
    )
  }
  const out = counted.leftOut
  return (
    <footer className="sf-dock" aria-label="Apply">
      <p className="sf-dock__said" aria-live="polite">
        <span>
          <strong>
            {count(counted.in)} of {count(counted.of)}
          </strong>{' '}
          changes in
          {out.length > 0 ? (
            <span className="sf-dock__more">
              {' · '}
              {count(out.length)} left out
              {out.length <= 2 ? `: ${out.map((l) => said(l)).join(', ')}` : ''}
            </span>
          ) : null}
          {counted.placed > 0 ? (
            <span className="sf-dock__more"> · {count(counted.placed)} placed by you</span>
          ) : null}
          {counted.stillOut > 0 ? (
            <span className="sf-dock__more">
              {' · '}
              {plural(
                counted.stillOut,
                'can’t be placed and stays out',
                'can’t be placed and stay out',
              )}
            </span>
          ) : null}
        </span>
        <small className="sf-dock__undo">
          {counted.in === 1
            ? 'Undo puts it back in one step.'
            : `Undo puts all ${count(counted.in)} back in one step.`}{' '}
          A quote already given never moves.
        </small>
      </p>
      <span className="sf-dock__acts">
        <span className="sf-dock__act">
          <Button
            intent="act"
            icon={ArrowRightIcon}
            onClick={() => setRefused(apply())}
            refusedBecause={
              counted.in === 0
                ? 'Every line is left out, so nothing would change the price list. Tick a line to keep it.'
                : (refused ?? undefined)
            }
          >
            {`Apply ${plural(counted.in, 'change', 'changes')}`}
          </Button>
        </span>
      </span>
    </footer>
  )
}
