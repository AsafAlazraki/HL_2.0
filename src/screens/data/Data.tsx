import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  InfoIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Dialog,
  DialogClose,
  Field,
  Icon,
  Input,
  KindMark,
  Plate as Surface,
  Refusal,
  Select,
  closesStage,
  isField,
  stageKeyOf,
} from '@/ui'
import { TABLE_KINDS, type TableKind } from '@/domain/model'
import { TABLE_NEEDS_NAME, createTable, tableTaken } from '@/domain/catalogue/commands'
import { pageOf, type TablePage } from '@/domain/modules/register'
import { fileIndexOf, findInFile, type FileFound } from '@/domain/catalogue/fileFind'
import { headingDoorOf } from '@/domain/catalogue/headingDoor'
import { makerOfTable } from '@/domain/catalogue/makers'
import { useCatalogue } from '@/app/useStores'
import { fitmentMakerOf, placeOf, pricesOf } from '@/app/ways'
import { placesOf } from '@/domain/modules/places'
import { addressOf, placeOfList } from '@/domain/modules/livery'
import { catalogue } from '@/state/catalogue'
import { readLadder } from '@/screens/levels/read'
import { useFinder } from '@/screens/shell/scope'
import { useFileFacts, type FileFacts } from './facts'
import { packedOn } from './file'
import { lineupOf } from './lineup'
import { NO_WAY_TO_THE_SHEET, Spread, type Arrival } from './Spread'
import { Fresh, Needs, Rooms, needsOf } from './State'
import { Lists, Makers, Matrix, holdsSay, standsSay } from './Holds'
import './data.css'

export { NO_WAY_TO_CUSTOMERS, NO_WAY_TO_THE_SHEET } from './Spread'
export { fitsSay, rowId } from './Holds'

/* ============================================================
   DATA — direction A, "The Monday list" (docs/directions/data-round/
   data/boards/a.html), picked by three judges on 2026-11-03 over B
   ("every list, dated and reviewed") and C ("ask the file"), with C's
   matrix of the lists of what fits and C's answer to a find grafted
   on. Provisional until the owner looks (docs/SCREENS.md).

   THE ONE JOB: the Master Price File as one place — what needs
   Northside, what is new, the rooms, and every list it carries, each
   a door. The judge found the screen before this a well-counted
   register of containers with no place for two of those five things
   (docs/directions/data-round/data/judge.md). So the composition now
   leads with STATE and keeps INVENTORY under it:

     the head      which price list, how big, and its three dates —
                   packed, its headings' own "as at" span, and the last
                   change on this computer — and one find over all of it
     the state     the six ROOMS as counted doors, first and in the first
                   window at every size; NEEDS NORTHSIDE, a checklist
                   with a figure, its numerator and denominator and a
                   door per line; NEW SINCE the packing
     what it holds eight maker tiles (the eighth is every maker), the
                   lists you sell from as a ledger, and the 28 lists of
                   what fits which boat as one table of maker × kind

   A FIND is the file's whole text: makers, lists, sections and lines.
   While a find is answered the state steps aside, the answer is drawn
   under the field, and the tiles and the ledger narrow to what holds
   it. Nothing on it says a thing is not on the price list that is.

   A PRESS ON A MAKER, A LIST OR A FIGURE IN THE TABLE opens its spread
   in the room the ledgers had, under the tiles, at every width
   (`./Spread.tsx`); its act opens the sheet, and each heading of its
   lineup opens the sheet at that heading.

   ONE WRITE, WITH ITS WAY BACK. `New list` applies `createTable`
   through the catalogue store, a command with an inverse and an event,
   and its Undo is pinned to that event in the line under the head. A
   list with no name is refused at the field, in a sentence, before the
   command is asked (the judge, L8: the command named it after its kind).

   EVERY FIGURE IS COUNTED by the reader its own room uses
   (`./facts.ts`); none is typed. Cost and margin are not on this
   screen: a list's spread says only how many cost columns it has, and
   that they never reach a quote.
   ============================================================ */

const KIND_CHOICES: { value: TableKind; label: string }[] = (
  Object.keys(TABLE_KINDS) as TableKind[]
).map((kind) => ({ value: kind, label: kind === 'custom' ? 'Something else' : TABLE_KINDS[kind].label }))

/** WHAT A LIST NEEDS BEFORE IT IS MADE, said at the field. */
export const LIST_NEEDS_NAME = 'A list needs a name.'

export interface DataPosition {
  at?: string
  find?: string
  /** the open spread draws every heading of its lineup, not the first twelve */
  headings?: 'all'
}

/** WHERE A LIST OPENS ON THE SHEET: at a chapter (`in`), at one row (`at`), or narrowed to a
 *  word (`find`). */
export interface SheetAt {
  in?: string
  at?: string
  find?: string
}

export interface DataProps {
  /** accepted and not drawn: the crest on the bar names the business on every screen */
  business?: string | null
  /** accepted and not drawn: the pill carries Home on every screen */
  goHome?: () => void
  /** the door to the Master Price File, for a browser with no copy of it */
  openTheFile?: () => void
  /** ONE LIST, ON THE SHEET — at one of its headings (`in`), or narrowed to a word (`find`) */
  openTable?: (tableId: string, at?: SheetAt) => void
  openCustomers?: () => void
  /** an address this screen links to, followed by the router on a plain press */
  go?: (href: string) => void
  /** the list whose spread is open, by id — a position, in the address */
  at?: string
  /** what was typed into the find */
  find?: string
  /** the open spread's lineup drawn whole */
  headings?: 'all'
  onPosition?: (position: DataPosition) => void
}

interface Step {
  name: string
  eventId: string
  wasUndo: boolean
}

const stepSaid = (step: Step): string =>
  step.wasUndo ? `“${step.name}” is taken off your own lists.` : `“${step.name}” is on your own lists.`

function refusalSaid(refused: string): string {
  if (refused === TABLE_NEEDS_NAME) return LIST_NEEDS_NAME
  const taken = tableTaken('')
  const lead = taken.slice(0, taken.indexOf('“'))
  if (refused.startsWith(lead)) return refused.replace(lead, 'There is already a list called ')
  return refused
}

const n = (value: number): string => value.toLocaleString('en-AU')
const plural = (count: number, one: string, many: string): string =>
  `${n(count)} ${count === 1 ? one : many}`
const nbsp = (s: string): string => s.replace(/ /g, ' ')

export function Data({
  openTheFile,
  openTable,
  openCustomers,
  go,
  at: arrivedAt = '',
  find: askedFor = '',
  headings: arrivedHeadings,
  onPosition,
}: DataProps) {
  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const priceLevels = useCatalogue((s) => s.priceLevels)

  const read = status === 'ready' || status === 'failed'
  const looking = (status === 'empty' || status === 'loading') && problem === null
  const open = status === 'ready' && Object.keys(tables).length > 0

  const facts = useFileFacts(open)
  const register = facts.register

  /* ---- the find, over the whole file ----------------------- */
  const [query, setQuery] = useState(askedFor)
  const asking = query.trim() !== ''
  const deferred = useDeferredValue(query)
  const index = useMemo(
    () => (open && asking ? fileIndexOf(tables, rows) : null),
    [open, asking, tables, rows],
  )
  const found: FileFound | null = useMemo(
    () => (index && deferred.trim() !== '' ? findInFile(index, deferred) : null),
    [index, deferred],
  )
  const answering = found !== null && found.words.length > 0
  const hit = useMemo(() => {
    const ids = new Set<string>()
    if (!found) return ids
    for (const id of found.lists) ids.add(id)
    for (const l of found.lines) ids.add(l.tableId)
    for (const s of found.sections) ids.add(s.tableId)
    return ids
  }, [found])
  const plates = answering
    ? register.plates.filter((p) => hit.has(p.id) || p.pairings.some((j) => hit.has(j.joinId)))
    : register.plates
  const shown = answering ? register.rows.filter((r) => hit.has(r.id)) : register.rows

  /* ---- what is open ---------------------------------------- */
  const [wanted, setCursor] = useState<string>(arrivedAt)
  const [peeking, setPeeking] = useState<boolean>(arrivedAt !== '')
  const [step, setStep] = useState<Step | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const [making, setMaking] = useState(false)
  const [arrival, setArrival] = useState<Arrival>(null)
  const [tabAt, setTabAt] = useState('')
  /* THE LIST WHOSE LINEUP IS DRAWN WHOLE, by id: a position, in the address (`?headings=all`),
     so a reload keeps it and opening another list starts it at its first twelve */
  const [wholeFor, setWholeFor] = useState(arrivedHeadings === 'all' ? arrivedAt : '')

  const list = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLElement>(null)
  const rowsRef = useRef(new Map<string, HTMLDivElement>())
  const focusSpread = useRef(false)
  const backToList = useRef(false)
  /* the list whose spread a press inside it closed, so the keyboard goes back to where it stands */
  const closedFrom = useRef('')

  const known = wanted !== '' && register.facts[wanted] !== undefined
  const onRows = shown.some((r) => r.id === wanted)
  const cursor = onRows ? wanted : known ? wanted : (shown[0]?.id ?? '')
  const page: TablePage | null = useMemo(
    () => (peeking && known ? pageOf(register, wanted) : null),
    [peeking, known, register, wanted],
  )
  const here = shown.findIndex((r) => r.id === cursor)
  const atRow = here >= 0 ? shown[here] : undefined
  const lineup = useMemo(
    () => (page ? lineupOf(tables[page.facts.id], rows[page.facts.id]) : null),
    [page, tables, rows],
  )
  const pricesHref = useMemo(() => {
    if (!page) return undefined
    const column = readLadder({ tables, rows, priceLevels }).find((c) =>
      c.tableIds.includes(page.facts.id),
    )
    return column ? pricesOf(column.id) : undefined
  }, [page, tables, rows, priceLevels])
  /* FITMENT FROM A MAKER IS A CHOICE (the judge, L15): its chooser opened at the maker, its
     models to pick from, never one boat this screen chose for the dealer */
  const fits = useMemo(() => {
    if (!page || page.facts.kind !== 'boat' || page.ends !== null || page.facts.retired) return undefined
    const table = tables[page.facts.id]
    if (!table) return undefined
    const maker = makerOfTable(table)
    return { maker, href: fitmentMakerOf(maker) }
  }, [page, tables])
  const own = useMemo(() => {
    if (!page || page.ends !== null) return undefined
    const place = placeOfList(placesOf(modules, tables, rows), modules, page.facts.id)
    return place ? { name: place.name, href: placeOf(addressOf(place, modules)) } : undefined
  }, [page, modules, tables, rows])
  const plateAt = page ? register.plates.findIndex((p) => p.id === page.facts.id) : -1

  /* THE FOCUS FOLLOWS THE SPREAD IN AND OUT: a spread opened from the ledger's keyboard takes
     it, because the ledger steps away; closing gives it back to the ledger */
  useEffect(() => {
    if (page) {
      if (focusSpread.current) {
        focusSpread.current = false
        backToList.current = true
        pageRef.current?.focus({ preventScroll: true })
      }
      return
    }
    /* CLOSED FROM INSIDE THE SPREAD, THE FOCUS GOES TO WHERE IT STANDS (the verifier of Data,
       round 2: on an address typed straight in, `Back to the lists` was pressed, went away, and
       left the focus on the page's body). A maker goes back to its tile, a list of what fits to
       its figure in the table, and a list you sell from to its row in the ledger. */
    const from = closedFrom.current
    closedFrom.current = ''
    if (from !== '') {
      backToList.current = false
      const place = document.getElementById(`dt-tile-${from}`) ?? document.querySelector<HTMLElement>(`[data-join="${CSS.escape(from)}"]`)
      if (place) place.focus({ preventScroll: true })
      else list.current?.focus({ preventScroll: true })
      return
    }
    if (backToList.current) {
      backToList.current = false
      list.current?.focus({ preventScroll: true })
    }
  }, [page])

  useEffect(() => {
    onPosition?.({
      at: page ? wanted : undefined,
      find: query === '' ? undefined : query,
      headings: page && wholeFor === wanted ? 'all' : undefined,
    })
  }, [onPosition, page, wanted, query, wholeFor])

  useEffect(() => {
    if (cursor === '' || !onRows || page) return
    const row = rowsRef.current.get(cursor)
    const port = list.current
    if (!row || !port || document.activeElement !== port) return
    row.scrollIntoView({ block: 'nearest' })
  }, [cursor, onRows, page])

  /* A SPREAD OPENS WHERE IT CAN BE SEEN. It opens under the maker tiles; when that is not in
     the window it is scrolled to, its head clear of the bar (`scroll-margin-block-start`,
     data.css). Two frames, because the router restores the address's remembered scroll when
     the `?at=` it writes commits, and a scroll made before that is undone. Never smoothed.

     ARRIVING AT AN ADDRESS THAT NAMES A SPREAD (`/data?at=boat_stacer`, Back from a maker's
     own page) brings WHAT THE FILE HOLDS to the top instead — its head, the lit tile and the
     spread under it — once the state above has its whole height (Review is counted after the
     first paint), so the bar at the top stands over the empty ground between the state and
     the head, never over a line of words (`scroll-margin-block-start` on `.dt-holds`). */
  const arrivedFor = useRef(arrivedAt)
  const counted = facts.review !== null
  /* the arrival has come to rest: said on the screen's root, so a ruler measures the window a
     person sees and not the frame before the scroll */
  const [rested, setRested] = useState(arrivedAt === '')
  useEffect(() => {
    if (!page) return
    const arriving = arrivedFor.current !== '' && arrivedFor.current === page.facts.id
    if (arriving && !counted) return
    arrivedFor.current = ''
    let dropped = false
    const bring = (): void => {
      if (dropped) return
      const opened = pageRef.current
      if (!opened) return
      if (arriving) {
        opened.closest('.dt-holds')?.scrollIntoView({ block: 'start' })
        setRested(true)
        return
      }
      /* a write's sentence stands over the spread it opened, and comes into the window with it */
      const before = opened.previousElementSibling
      const head = before instanceof HTMLElement && before.classList.contains('dt-said') ? before : opened
      const top = head.getBoundingClientRect().top
      const margin = Number.parseFloat(getComputedStyle(head).scrollMarginBlockStart) || 0
      if (top >= margin - 1 && top < window.innerHeight * 0.6) return
      /* WITH THE TILES ABOVE IT WHERE THEY FIT (the verifier of Data, round 1: a spread brought
         to the bar left the tiles' feet showing beside it). Where the section's head, the tiles
         and the spread's own head all stand in the window's top three fifths, the section is
         brought to the top and the lit tile stays in view over its spread; in a short window
         the spread itself comes to the bar. */
      const holds = head.closest<HTMLElement>('.dt-holds')
      if (holds) {
        const from = holds.getBoundingClientRect().top
        const air = Number.parseFloat(getComputedStyle(holds).scrollMarginBlockStart) || 0
        if (top - from + air < window.innerHeight * 0.6) {
          holds.scrollIntoView({ block: 'start' })
          return
        }
      }
      head.scrollIntoView({ block: 'start' })
    }
    const frame = requestAnimationFrame(() => requestAnimationFrame(bring))
    return () => {
      dropped = true
      cancelAnimationFrame(frame)
    }
  }, [page, counted])

  const stepRows = useCallback(
    (by: number) => {
      if (shown.length === 0) return
      const start = here < 0 ? 0 : here
      setCursor(shown[Math.min(shown.length - 1, Math.max(0, start + by))]!.id)
    },
    [here, shown],
  )

  /* A HEADING OPENS THE SHEET AT IT (the verifier of Data, round 1: "Oldest first" opened
     Rigging Kits at its top). A list read in chapters stands at the chapter by its name; any
     other list at the first line filed under the heading (`headingDoorOf`). A heading the list
     no longer carries narrows the sheet to its words, so the press still lands on them. */
  const openIt = useCallback(
    (tableId: string, at?: SheetAt) => {
      if (!openTable) {
        setRefused(NO_WAY_TO_THE_SHEET)
        return
      }
      if (at?.in) {
        const store = catalogue.getState()
        const table = store.tables[tableId]
        const door = table ? headingDoorOf(table, store.tables, store.rows[tableId] ?? [], at.in) : null
        openTable(tableId, door ?? { find: at.in })
        return
      }
      openTable(tableId, at)
    },
    [openTable],
  )

  const openPage = useCallback((tableId: string, pointer = false) => {
    setArrival(pointer ? 'risen' : null)
    setCursor(tableId)
    setPeeking(true)
    setRefused(null)
  }, [])

  /* A TILE IS A TOGGLE (`aria-pressed`): pressing the maker that is open closes it */
  const pressTile = useCallback(
    (tableId: string, pointer: boolean) => {
      if (page && page.facts.id === tableId) setPeeking(false)
      else openPage(tableId, pointer)
    },
    [page, openPage],
  )

  const closeSpread = useCallback(() => {
    const active = document.activeElement
    if (pageRef.current && active instanceof Node && pageRef.current.contains(active))
      closedFrom.current = wanted
    setPeeking(false)
  }, [wanted])

  /* ---- the one write, and its way back --------------------- */
  const make = useCallback((name: string, kind: TableKind): string | null => {
    if (name.trim() === '') return LIST_NEEDS_NAME
    const outcome = catalogue.getState().apply(createTable({ name, kind }))
    if ('refused' in outcome) return refusalSaid(outcome.refused)
    setStep({ name: outcome.event.tableName ?? name.trim(), eventId: outcome.event.id, wasUndo: false })
    setRefused(null)
    const made = outcome.event.tableId
    if (made) {
      setArrival(null)
      setCursor(made)
      setPeeking(true)
    }
    return null
  }, [])

  const goBack = useCallback(() => {
    if (!step) return
    const outcome = step.wasUndo ? catalogue.getState().redo() : catalogue.getState().undo(step.eventId)
    if ('refused' in outcome) {
      if (outcome.refused !== '') setRefused(outcome.refused)
      return
    }
    setRefused(null)
    setStep({ name: step.name, eventId: outcome.event.id, wasUndo: !step.wasUndo })
  }, [step])

  /* ---- the ledger's keyboard: arrows, Home, End, Space opens here, Enter its sheet, Escape back */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault()
      stepRows(key === 'ArrowDown' ? 1 : -1)
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault()
      const to = key === 'Home' ? shown[0] : shown[shown.length - 1]
      if (to) setCursor(to.id)
    } else if (key === ' ' || key === 'Spacebar') {
      event.preventDefault()
      if (event.repeat || !atRow) return
      focusSpread.current = true
      openPage(atRow.id)
    } else if (key === 'Enter') {
      event.preventDefault()
      if (atRow) openIt(atRow.id)
    } else if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      event.preventDefault()
      if (query !== '') setQuery('')
    }
  }

  const onFieldKey = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape' && query !== '') {
      event.preventDefault()
      setQuery('')
    }
  }

  const provenance = facts.provenance
  const needs = useMemo(
    () =>
      needsOf(facts, {
        openSpread: (id) => openPage(id, true),
        openSheet: (id, heading) => openIt(id, heading ? { in: heading } : undefined),
        openTheFile,
      }),
    [facts, openPage, openIt, openTheFile],
  )

  const spreadState = (id: string): string | null => {
    if (facts.review === null) return null
    const said = standsSay(facts, id)
    const cases = facts.review.byList.get(id) ?? 0
    const dated = facts.datedByList.get(id) ?? 0
    const changed = facts.changed?.byList.find((l) => l.tableId === id)?.lines ?? 0
    const clauses = [
      cases > 0 ? said.find((s) => s.endsWith('to settle'))! + ' on Review' : 'no Review case',
      dated > 0 ? said.find((s) => s.includes('dated'))! : 'no dated heading',
      changed > 0 ? `${plural(changed, 'line', 'lines')} changed on this computer` : 'nothing changed here',
    ]
    const sentence = clauses.join(', ')
    return `${sentence[0]!.toUpperCase()}${sentence.slice(1)}.`
  }

  const saidLine =
  step || refused ? (
        <div className="dt-said">
          {step ? (
            <output className="dt-step" data-testid="last-step" data-ground="plate">
              <span className="dt-step__done" aria-hidden="true">
                <Icon glyph={CheckCircleIcon} weight="fill" />
              </span>
              <span className="dt-step__said">{stepSaid(step)}</span>
              <Button
                intent="secondary"
                size="sm"
                icon={step.wasUndo ? ArrowClockwiseIcon : ArrowCounterClockwiseIcon}
                onClick={goBack}
              >
                {step.wasUndo ? 'Put it back' : 'Undo'}
              </Button>
            </output>
          ) : null}
          {refused ? (
            <p className="dt-alarm" role="alert" data-ground="plate">
              <Refusal>{refused}</Refusal>
            </p>
          ) : null}
        </div>
  ) : null

  const dated = facts.dated
  const lastChange = facts.changed?.last ?? null

  return (
    <main
      className="dt"
      data-testid="data"
      data-read={read ? '' : undefined}
      data-rested={rested || !open || page === null ? '' : undefined}
    >
      <div className="dt-frame">
        <header className="dt-head">
          <div className="dt-head__title">
            <h1 className="dt-title">Data</h1>
            {problem !== null ? (
              <p className="dt-stamp" role="alert">
                {problem}
              </p>
            ) : looking || !read ? (
              <p className="dt-stamp">Looking for the price list…</p>
            ) : open ? (
              <>
                {/* EACH FACT IS A CLAUSE THAT WRAPS WHOLE (the verifier of Data, round 1: the line
                    broke after a dot at 390, and mid-phrase at 1280 once a line had changed);
                    the dot between two clauses is drawn only where both share a line */}
                <p className="dt-stamp dt-clauses">
                  <span
                    className="dt-clause"
                    data-testid="data-file"
                    title={
                      provenance.known
                        ? `Master Price File · fingerprint ${provenance.file.fingerprint}`
                        : undefined
                    }
                  >
                    {provenance.known ? (
                      <>
                        The price list of <b className="dt-nw">{packedOn(provenance.file.packedAt, 'long')}</b>
                      </>
                    ) : (
                      'The Master Price File'
                    )}
                  </span>
                  <span className="dt-clause dt-nw" data-testid="data-counts">
                    <b>{n(register.head.tables)}</b> lists · <b>{n(register.head.rows)}</b> lines
                  </span>
                </p>
                <p className="dt-dates dt-clauses" data-testid="data-dates">
                  {dated.oldest && dated.newest ? (
                    <span className="dt-clause">
                      Prices dated in their own headings from <b>{nbsp(packedOn(dated.oldest, 'long'))}</b> to{' '}
                      <b>{nbsp(packedOn(dated.newest, 'long'))}</b>
                    </span>
                  ) : null}
                  {facts.changed ? (
                    <span className="dt-clause">
                      Last change on this computer:{' '}
                      <b>{lastChange ? nbsp(packedOn(lastChange, 'long')) : nbsp('none yet')}</b>
                    </span>
                  ) : null}
                </p>
              </>
            ) : null}
          </div>
          {open ? (
            <div className="dt-find">
              <Input
                id="dt-find-field"
                type="search"
                icon={MagnifyingGlassIcon}
                aria-label="Find in the price list"
                value={query}
                onValueChange={setQuery}
                onKeyDown={onFieldKey}
                aria-describedby={answering || found?.tooShort ? 'dt-answer-said' : undefined}
                placeholder="Find a maker, a list, a section or a code"
              />
            </div>
          ) : null}
        </header>

        {open && found && (answering || found.tooShort) ? (
          <Answer
            found={found}
            query={deferred.trim()}
            facts={facts}
            onSpread={(id) => openPage(id, true)}
            onSheet={openIt}
            go={go}
          />
        ) : null}

        {open && !answering ? (
          /* THE ROOMS FIRST, IN THE FIRST WINDOW AT EVERY SIZE (the section critic, 2026-11-04,
             major 3: they began at 1325 at 390, 1195 at 834 and 491 at 1280, under six needs and
             New since). In a hand and on a tablet they are one strip under the head; on a desk
             they head the column beside Needs, with New since under them. First in the reading
             order as well, so the keyboard meets them where the eye does. */
          <div className="dt-state">
            <Rooms facts={facts} go={go} />
            <Needs needs={needs} go={go} />
            <Fresh
              facts={facts}
              openSheet={(id, row) => openIt(id, row ? { at: row } : undefined)}
              openSpread={(id) => openPage(id, true)}
              go={go}
            />
          </div>
        ) : null}

        {open ? (
          plates.length + shown.length > 0 || !answering ? (
            <section className="dt-holds" aria-labelledby="dt-holds-h">
              <header className="dt-holds__head">
                <h2 id="dt-holds-h">{answering ? `What holds “${deferred.trim()}”` : 'What the price list holds'}</h2>
                <p>
                  {answering
                    ? `${plural(plates.length, 'maker', 'makers')} · ${plural(shown.length, 'list', 'lists')} you sell from`
                    : `${plural(register.plates.length, 'maker', 'makers')} · ${plural(register.head.tables, 'list', 'lists')} · ${plural(register.head.rows, 'line', 'lines')}`}
                </p>
              </header>
              {plates.length > 0 ? (
                <Makers
                  plates={plates}
                  facts={facts}
                  open={page && plateAt >= 0 ? page.facts.id : ''}
                  tabAt={tabAt}
                  onTab={setTabAt}
                  onPress={pressTile}
                  every={!answering}
                  go={go}
                />
              ) : null}
              <div className="dt-body" data-open={page ? '' : undefined}>
                {/* WHAT THE LAST WRITE SAID, OR A REFUSAL, WHERE THE PRESS HAPPENED: over the spread
                    it opened or the lists it changed, so its Undo is in the window the spread is
                    scrolled into, never left at the top of the page */}
                {saidLine}
                {page ? (
                  <Spread
                    whole={wholeFor === page.facts.id}
                    onWhole={(whole) => setWholeFor(whole ? page.facts.id : '')}
                    key={page.facts.id}
                    hold={pageRef}
                    page={page}
                    lineup={lineup}
                    arrival={arrival}
                    onClose={closeSpread}
                    onOpen={(id, heading) => openIt(id, heading ? { in: heading } : undefined)}
                    canOpen={Boolean(openTable)}
                    openCustomers={openCustomers}
                    pricesHref={pricesHref}
                    fits={fits}
                    own={own}
                    go={go}
                    holds={
                      plateAt >= 0
                        ? holdsSay(register.plates[plateAt]!, facts.models.get(page.facts.id))
                        : undefined
                    }
                    state={spreadState(page.facts.id)}
                    fromTile={plateAt >= 0 && plates.some((p) => p.id === page.facts.id)}
                  />
                ) : null}
                {/* THE LEDGERS STAY UNDER AN OPEN SPREAD (the verifier of Data, round 1: with
                    Highfield open at 1920 a third of the window was empty floor). The spread
                    opens over them, and the row it came from is marked */}
                <div className="dt-ledgers" data-one={answering ? '' : undefined}>
                    {shown.length > 0 ? (
                      <Lists
                        rows={shown}
                        count={facts.sellFrom.length}
                        facts={facts}
                        cursor={cursor}
                        open={page ? page.facts.id : ''}
                        listRef={list}
                        holdRow={(id, element) => {
                          if (element) rowsRef.current.set(id, element)
                          else rowsRef.current.delete(id)
                        }}
                        onKeyDown={onKeyDown}
                        onPoint={(id) => {
                          focusSpread.current = true
                          openPage(id, true)
                        }}
                        onOpen={(id) => openIt(id)}
                        onMake={answering ? undefined : () => setMaking(true)}
                        head={
                          answering ? (
                            <p className="dt-ledger__said">
                              {`${plural(shown.length, 'of them holds', 'of them hold')} “${deferred.trim()}”`}
                            </p>
                          ) : null
                        }
                      />
                    ) : null}
                  {answering ? null : (
                    <Matrix
                      matrix={facts.matrix}
                      open={page ? page.facts.id : ''}
                      onOpen={(id) => openPage(id, true)}
                    />
                  )}
                </div>
              </div>
            </section>
          ) : null
        ) : read ? (
          <Teach openTheFile={openTheFile} />
        ) : null}
      </div>

      <MakeDialog open={making} onOpenChange={setMaking} make={make} />
    </main>
  )
}

/* ---------------------------------------------------------- */
/* The answer to a find, drawn where the find is               */
/* ---------------------------------------------------------- */

/** Said where the press happened, on a Data drawn with no bar above it. */
export const NO_BAR_FIND = 'Nothing was opened: the bar’s Find stands only where the bar does.'

/** HOW MANY SECTIONS AN ANSWER DRAWS before one press draws the rest. */
const SECTIONS_ROOM = 8

function Answer({
  found,
  query,
  facts,
  onSpread,
  onSheet,
  go,
}: {
  found: FileFound
  query: string
  facts: FileFacts
  onSpread: (tableId: string) => void
  onSheet: (tableId: string, at?: { in?: string; find?: string }) => void
  go?: (href: string) => void
}) {
  const [all, setAll] = useState(false)
  const finder = useFinder()
  const facts2 = facts.register.facts
  const byName = found.lists.filter((id) => facts2[id] !== undefined)
  const anything = byName.length + found.sections.length + found.lines.length > 0
  const sections = all ? found.sections : found.sections.slice(0, SECTIONS_ROOM)
  const listsWithLines = found.lines.length
  return (
    <section className="dt-answer" data-ground="plate" aria-labelledby="dt-answer-said" data-testid="data-answer">
      <p className="dt-answer__said" id="dt-answer-said" role="status">
        {found.tooShort ? (
          'Type one more letter: a single letter is in nearly every line.'
        ) : !anything ? (
          `Nothing on the price list holds “${query}”: no maker, list, section or line.`
        ) : found.totalLines > 0 ? (
          <>
            <b>{n(found.totalLines)}</b>
            {` ${found.totalLines === 1 ? 'line holds' : 'lines hold'} “${query}”, in ${plural(listsWithLines, 'list', 'lists')}`}
          </>
        ) : (
          <>{`No line holds “${query}” in its own words; ${byName.length > 0 ? 'a list’s name does' : 'a section’s heading does'}.`}</>
        )}
      </p>
      {anything ? (
        <div className="dt-answer__groups">
          {byName.length > 0 ? (
            <div className="dt-answer__group">
              <h3 className="dt-eyebrow">{`By name · ${n(byName.length)}`}</h3>
              <ul className="dt-answer__chips">
                {byName.map((id) => (
                  <li key={id}>
                    <button type="button" className="dt-hit" onClick={() => onSpread(id)}>
                      {facts.register.pairings.some((j) => j.joinId === id) ? (
                        <span className="dt-hit__link" aria-hidden="true">
                          <Icon glyph={LinkSimpleIcon} />
                        </span>
                      ) : (
                        <KindMark kind={facts2[id]!.kind} size="sm" />
                      )}
                      <span>{facts2[id]!.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {found.sections.length > 0 ? (
            <div className="dt-answer__group">
              <h3 className="dt-eyebrow">{`Sections · ${n(found.sections.length)}`}</h3>
              <ul className="dt-answer__rows">
                {sections.map((s) => (
                  <li key={`${s.tableId}|${s.heading}`}>
                    <button
                      type="button"
                      className="dt-hitrow"
                      onClick={() => onSheet(s.tableId, { in: s.heading })}
                    >
                      <span className="dt-hitrow__name">
                        <span className="dt-hitrow__in">{s.tableName} › </span>
                        {s.heading}
                      </span>
                      <b>{n(s.lines)}</b>
                      <span className="dt-hitrow__go" aria-hidden="true">
                        <Icon glyph={ArrowRightIcon} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {found.sections.length > SECTIONS_ROOM && !all ? (
                <Button intent="quiet" size="sm" onClick={() => setAll(true)}>
                  {`The other ${n(found.sections.length - SECTIONS_ROOM)} sections`}
                </Button>
              ) : null}
            </div>
          ) : null}
          {found.lines.length > 0 ? (
            <div className="dt-answer__group">
              <h3 className="dt-eyebrow">{`Lines, by list · ${n(found.lines.length)}`}</h3>
              <ul className="dt-answer__rows">
                {found.lines.map((l) => (
                  <li key={l.tableId}>
                    <button
                      type="button"
                      className="dt-hitrow"
                      onClick={() => onSheet(l.tableId, { find: query })}
                      aria-label={`${l.tableName}: ${plural(l.lines, 'line', 'lines')} hold “${query}” — opens the list narrowed to it`}
                    >
                      <span className="dt-hitrow__name">
                        {l.tableName}
                      </span>
                      <b>{n(l.lines)}</b>
                      <span className="dt-hitrow__go" aria-hidden="true">
                        <Icon glyph={ArrowRightIcon} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      {!found.tooShort ? (
        <p className="dt-answer__desk">
          <span className="dt-answer__glyph" aria-hidden="true">
            <Icon glyph={InfoIcon} />
          </span>
          <span className="dt-answer__say">
            With a customer at the desk, the bar’s Find puts a line straight on a quote, and the{' '}
            <a
              href="/catalogue"
              onClick={
                go
                  ? (event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey) return
                      event.preventDefault()
                      go('/catalogue')
                    }
                  : undefined
              }
            >
              Catalogue
            </a>{' '}
            holds every part in its aisle.
          </span>
          <span className="dt-answer__bar">
            <Button
              intent="secondary"
              size="sm"
              icon={MagnifyingGlassIcon}
              onClick={finder ? () => finder(query) : undefined}
              refusedBecause={finder ? undefined : NO_BAR_FIND}
            >
              {`Find “${query}” for a quote`}
            </Button>
          </span>
        </p>
      ) : null}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Teaching, on a computer with no file                        */
/* ---------------------------------------------------------- */

function Teach({ openTheFile }: { openTheFile?: () => void }) {
  return (
    <div className="dt-teach">
      <Surface as="section" label="The price list" pad="lg">
        <div className="dt-teach__in">
          <h2 className="dt-teach__head">No price list is open on this computer.</h2>
          <div>
            <p className="dt-teach__q">What lands here</p>
            <p className="dt-teach__a">
              <b>Every list on the Master Price File</b>: what it needs from Northside, what is new
              on it, and every maker and list it carries.
            </p>
          </div>
          <div>
            <p className="dt-teach__q">Why it is empty today</p>
            <p className="dt-teach__a">
              This computer holds no copy of it: it was read once and not kept, or it was cleared.
            </p>
          </div>
          <div>
            <p className="dt-teach__q">What to do</p>
            <p className="dt-teach__a">Load the Master Price File. It is kept on this computer after that.</p>
          </div>
          {openTheFile ? (
            <div className="dt-teach__door">
              <Button intent="act" icon={ArrowRightIcon} onClick={openTheFile}>
                Load the Master Price File
              </Button>
            </div>
          ) : null}
        </div>
      </Surface>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The dialog that makes a list                                */
/* ---------------------------------------------------------- */

function MakeDialog({
  open,
  onOpenChange,
  make,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  make: (name: string, kind: TableKind) => string | null
}) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<TableKind>('custom')
  const [error, setError] = useState<string | null>(null)

  const submit = (): void => {
    const refusal = make(name, kind)
    if (refusal) {
      setError(refusal)
      return
    }
    setError(null)
    setName('')
    setKind('custom')
    onOpenChange(false)
  }

  return (
    <Dialog
      title="A new list"
      description="A list of your own — boat show leads, a price you keep. It starts with names; add what you need."
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null)
        onOpenChange(next)
      }}
      size="md"
      actions={
        <>
          <DialogClose>
            <Button intent="quiet">Not now</Button>
          </DialogClose>
          <Button intent="primary" icon={PlusIcon} onClick={submit}>
            Make it
          </Button>
        </>
      }
    >
      <div className="dt-make">
        <Field label="What it is called" error={error ?? undefined}>
          <Input
            value={name}
            onValueChange={(next) => {
              setName(next)
              if (error) setError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submit()
              }
            }}
          />
        </Field>
        <Field label="What is on it?">
          <Select<TableKind>
            options={KIND_CHOICES}
            value={kind}
            kind={kind}
            onValueChange={(next) => setKind(next ?? 'custom')}
            aria-label="What is on it?"
          />
        </Field>
      </div>
    </Dialog>
  )
}
