import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DOORS, START_A_QUOTE, backFrom, doorAt, hasShell, surfaceAt, type Door } from '@/app/ways'
import { useCatalogue, usePrefs, useQuotes } from '@/app/useStores'
import { prefs } from '@/state/prefs'
import { buildSearchIndex, search, type QuoteFacts } from '@/domain/catalogue/search'
import {
  CUSTOMER_TABLE_ID,
  customerRegister,
  matchCustomers,
  readCustomers,
} from '@/domain/people/customers'
import { readRegister } from '@/domain/quote/register'
import {
  MIN_ASK,
  readFinder,
  type FinderAct,
  type FinderRow,
  type FinderTarget,
} from '@/domain/shell/finder'
import { isField } from '@/ui'
import { Pill, type PillDoor } from './Pill'
import { Finder } from './Finder'
import { Shortcuts } from './Shortcuts'
import { ScopeSeat, useScope } from './scope'
import { RECENT_KEY, readRecent, recentRows, remember, type RecentPlace } from './recent'
import './shell.css'

/* ============================================================
   THE SHELL — the way between screens, and the finder.

   Direction A, "The pill", of `docs/research/refs/shell/notes.md` §5,
   ASSIGNED rather than picked: the critic found that the obvious pick
   on four Cockpit screens was the same list-left/detail-right shape,
   so this round assigns a composition per screen
   (`docs/DECISIONS.md`, 2026-09-23). Provisional in `docs/SCREENS.md`
   until the owner has looked.

   WHY A HOLDS, IN TWO SENTENCES. Twelve screens, five of them
   Showroom surfaces on full-bleed photography and four of them
   Cockpit registers that owe eighteen rows at 1280×800: a rail takes
   72px of width off a photograph composed as two folds, and a bar
   takes about 200px of height off a register with none to give —
   which is direction D, and is also §4's own first avoid. A pill
   floats, so the showroom stays full-bleed AND the register keeps its
   rows, and it is the only one of the four compositions that leaves
   Data a door AT REST, which is the one instruction the owner gave
   about this screen in capitals.

   THIS FILE IS THE BRAIN AND DRAWS NOTHING. `Pill.tsx` is the object
   on screen, `Finder.tsx` the sheet it opens, `Shortcuts.tsx` the
   sheet `?` opens; here are the stores, the keyboard and the
   addresses. It is mounted ONCE, by `src/routes/__root.tsx`.
   ============================================================ */

/** Said in the finder, under the field, before anything is typed. */
export const FINDER_AT_REST =
  'Type a reference, a name, a model or a table. Everything this browser holds is in here.'

/** Said instead when no price file has been read in. It is a fact and
 *  not a refusal: the finder still finds every document, every person
 *  and every door. */
export const NO_FILE_YET =
  'No price file is open in this browser, so there are no boats, tables or rows to find yet.'

export interface ShellProps {
  /** the address, as the router knows it */
  at: string
  /** a plain press on a link, handled by the router */
  go: (href: string) => void
  /**
   * WHOSE DOCUMENTS TO COUNT. Handed in rather than reached for: a
   * screen in this app never imports `@/data`, and the org is the
   * route's to know (`src/routes/__root.tsx` already holds it). Left
   * out, the shell counts nothing it has not been given and the doors
   * print no figure — which is what a component test is.
   */
  org?: string
}

export function Shell({ at, go, org }: ShellProps) {
  /* ENTRY HAS NO SHELL, AND PAYS FOR NONE OF IT. The decision is made
     before a store is read, a listener is bound or an index is built:
     a pill offering five screens to somebody who has not said who
     they are would be five refusals in a row, and every board in the
     sweep says the same (§5). */
  if (!hasShell(at)) return null
  return <Standing at={at} go={go} {...(org === undefined ? {} : { org })} />
}

function Standing({ at, go, org }: ShellProps) {
  const business = useCatalogue((s) => s.business)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const status = useCatalogue((s) => s.status)
  const filed = useQuotes((s) => s.quotes)
  const quotesRead = useQuotes((s) => s.loaded)
  const openQuotes = useQuotes((s) => s.openFor)
  const keptRecent = usePrefs((s) => s.values[RECENT_KEY])

  const [finding, setFinding] = useState(false)
  const [query, setQuery] = useState('')
  const [helping, setHelping] = useState(false)
  const scope = useScope()

  /* THE DOCUMENTS, READ ONCE, BY WHOEVER GETS THERE FIRST. Ten of the
     twelve routes already do this; the two that do not are `/data`
     and a sheet, and a Quotes door that printed nothing on exactly
     those two would be a shell disagreeing with itself. It is a READ
     of this browser and never a fetch — the blue door on Entry is the
     only thing in this app that can fetch the Master Price File, and
     `openFor` cannot. */
  useEffect(() => {
    if (org !== undefined && !quotesRead) void openQuotes(org)
  }, [org, quotesRead, openQuotes])

  const sheetOpen = status === 'ready' && Object.keys(tables).length > 0

  /* ── THE COUNTS ON THE DOORS, EVERY ONE OF THEM COUNTED ──────── */
  const register = useMemo(() => readRegister(filed), [filed])
  const drafts = register.bands.find((b) => b.spec.id === 'draft')?.held ?? 0
  const book = useMemo(() => customerRegister(tables), [tables])
  const people = useMemo(() => (book ? readCustomers(book, rows[book.id] ?? []) : []), [book, rows])
  /* THE DOOR COUNTS WHAT THE SCREEN BEHIND IT COUNTS, and that is the
     whole rule. `liveTableCount` was the first cut — it drops a retired
     table, which is what Home's header GROUPS by — and it answered 51
     on the prepared file while Home's own stamp and the data register's
     own head both print 53. A door that disagrees with the screen it
     opens is the "dialogs stop lying" fault in one word, so the figure
     here is the one those two screens print. */
  const liveTables = sheetOpen ? Object.keys(tables).length : null

  const standing = doorAt(at)
  const doors: PillDoor[] = DOORS.map((door) => ({
    door,
    here: standing?.href === door.href,
    count: countOn(door, { drafts, people: people.length, tables: liveTables, quotesRead }),
    ...(countingOn(door) === undefined ? {} : { counting: countingOn(door) }),
    /* open drafts are work waiting; a table count and a head count are the size of what
       is behind the door. `Pill.tsx` says why the difference shows at 390 and nowhere else. */
    ...(door.href === '/quotes' ? { waiting: true } : {}),
  }))

  /* ── WHERE THIS BROWSER HAS BEEN ─────────────────────────────
     An address is remembered when a person LEAVES it, so the first
     row of the recall list is never the screen already on the
     display. Only a place the stores can NAME is kept: a row reading
     "/quote/a1b2c3" would be a link to a document whose reference the
     list does not know. */
  const recent = useMemo(() => readRecent(keptRecent), [keptRecent])
  const named = useMemo(() => nameOf(at, filed, tables), [at, filed, tables])
  const leaving = useRef<RecentPlace | null>(null)
  useEffect(() => {
    const last = leaving.current
    if (last && last.href !== at) {
      const store = prefs.getState()
      store.set(RECENT_KEY, remember(readRecent(store.get(RECENT_KEY)), last))
    }
    leaving.current = named
  }, [at, named])

  /* ── THE FINDER'S WORLD, BUILT ONLY WHEN SOMEBODY ASKS ────────
     `buildSearchIndex` folds every label on the sheet, and that is
     work nobody should pay for on a paint they may never search from.
     Home's own field makes the same argument; this follows it, and
     adds the documents to the same index so that one matcher, one
     ranking and one order answer all five kinds. */
  const asking = query.trim().length >= MIN_ASK
  const quoteFacts = useMemo<QuoteFacts[]>(
    () =>
      register.bands.flatMap((band) =>
        band.rows.map((row) => ({
          id: row.id,
          reference: row.reference,
          subject: row.boat,
          customer: row.customer ?? '',
          issued: row.state !== 'draft',
          total: row.total,
        })),
      ),
    [register],
  )
  const result = useMemo(() => {
    if (!finding || !asking) return null
    return search(buildSearchIndex(tables, rows, { modules, quotes: quoteFacts }), query)
  }, [finding, asking, tables, rows, modules, quoteFacts, query])

  const matchedPeople = useMemo(() => {
    if (!asking || !book) return []
    return matchCustomers(people, query, 6).map((p) => ({
      rowId: p.rowId,
      name: p.name,
      contact: p.contact[0] ?? '',
    }))
  }, [asking, book, people, query])

  const boatTables = useMemo(
    () =>
      new Set(
        Object.values(tables)
          .filter((t) => t.kind === 'boat')
          .map((t) => t.id),
      ),
    [tables],
  )

  const acts: FinderAct[] = useMemo(
    () => [
      {
        act: 'new-quote',
        name: 'New quote',
        say: START_A_QUOTE.say,
        verb: 'Start one',
        key: 'N',
        ...(sheetOpen
          ? {}
          : { note: 'No price file is open in this browser, so the picker has nothing to list.' }),
      },
      {
        act: 'load-the-file',
        name: 'Load the file',
        say: 'The blue door: read the Master Price File into this browser.',
        verb: 'Open the door',
        key: 'L',
      },
    ],
    [sheetOpen],
  )

  const finderDoors = useMemo(
    () => DOORS.map((d) => ({ href: d.href, word: d.word, say: d.say, key: `G ${d.key}` })),
    [],
  )

  const reading = useMemo(
    () =>
      readFinder({
        query,
        doors: finderDoors,
        acts,
        recent: recentRows(recent, at),
        result,
        people: matchedPeople,
        boatTables,
        customerTableId: CUSTOMER_TABLE_ID,
        scope: scope
          ? {
              word: scope.word,
              title: scope.title,
              ...(scope.say === undefined ? {} : { say: scope.say }),
              rows: scope.rows(query),
            }
          : null,
      }),
    [query, finderDoors, acts, recent, at, result, matchedPeople, boatTables, scope],
  )

  const open = useCallback(() => {
    setQuery('')
    setFinding(true)
  }, [])

  const choose = useCallback(
    (row: FinderRow) => {
      setFinding(false)
      const href = addressOf(row.target)
      if (href !== null) {
        go(href)
        return
      }
      /* a row the SCREEN owns — a chapter on a build, a heading. It is
         the screen's to act on, and the screen published the way. */
      if (row.target.at === 'here') scope?.go?.(row.target.id)
    },
    [go, scope],
  )

  /* ── THE KEYBOARD, BOUND TO THE WINDOW BECAUSE IT IS THE SHELL'S ──
     Every other vocabulary in this app is bound to the surface that
     owns it, which is WCAG 2.2 SC 2.1.4's own third exemption —
     "active only on focus". These are the exception and have to be: a
     shortcut that reaches the finder from any of twelve screens
     cannot live on any one of them. So each either takes a modifier
     or is refused inside a field, which is the criterion's other
     exemption, and each is PRINTED: `Mod K` on the pill's bubble, `?`
     and the `G` chord on the sheet that `?` opens. */
  const chord = useRef<number>(0)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        open()
        return
      }
      if (mod || event.altKey || isField(event.target)) return

      if (event.key === '?') {
        event.preventDefault()
        setHelping(true)
        return
      }

      /* G THEN A DOOR'S LETTER — Linear's own "go to" chord, and the
         only way five keys reach five screens without taking five
         letters away from every register's own single-key vocabulary.
         A letter arriving more than a second after the G is a letter
         and not the tail of a chord. */
      const key = event.key.toLowerCase()
      if (key === 'g') {
        chord.current = Date.now()
        return
      }
      const started = chord.current
      chord.current = 0
      if (started === 0 || Date.now() - started > 1_000) return
      const door = DOORS.find((d) => d.key.toLowerCase() === key)
      if (!door) return
      event.preventDefault()
      go(door.href)
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [go, open])

  return (
    <>
      <Pill
        business={business}
        doors={doors}
        back={backFrom(at)}
        surface={surfaceAt(at)}
        go={go}
        find={open}
        finding={finding}
      />
      <Finder
        open={finding}
        close={() => setFinding(false)}
        query={query}
        onQuery={setQuery}
        reading={reading}
        scope={scope?.word ?? null}
        choose={choose}
        business={business}
        say={sheetOpen ? FINDER_AT_REST : NO_FILE_YET}
      />
      <Shortcuts open={helping} onOpenChange={setHelping} />
    </>
  )
}

/** The shell, with the seat a screen publishes its own rows into.
 *  One mount, one seat, around the outlet. */
export function ShellAround({ at, go, org, children }: ShellProps & { children: ReactNode }) {
  return (
    <ScopeSeat>
      <Shell at={at} go={go} {...(org === undefined ? {} : { org })} />
      {children}
    </ScopeSeat>
  )
}

/* ------------------------------------------------------------ */
/* The counts, and what each one is of                           */
/* ------------------------------------------------------------ */

/**
 * WHAT STANDS ON A DOOR, and it is never "everything behind it". A
 * figure is worth a glance when it is WORK WAITING or the size of the
 * thing behind the door; a count of every quote ever written is
 * neither, and a diary has no count at all, because every event in it
 * is already on a document counted somewhere else.
 *
 * `null` draws nothing, which is what an unread store honestly is — a
 * zero printed before a read is a figure nobody measured. A real zero
 * is printed AS zero: three honest zeros on day one is the decision
 * the quotes register's three bands already made.
 */
function countOn(
  door: Door,
  seen: { drafts: number; people: number; tables: number | null; quotesRead: boolean },
): number | null {
  if (door.href === '/quotes') return seen.quotesRead ? seen.drafts : null
  /* THE BOOK IS A TABLE THAT DOES NOT EXIST until the first person is
     filed, so "0 people" would be a count of a register nobody has
     made. Nothing is drawn until there is one. */
  if (door.href === '/customers') return seen.people === 0 ? null : seen.people
  if (door.href === '/data') return seen.tables
  return null
}

function countingOn(door: Door): string | undefined {
  if (door.href === '/quotes') return 'open drafts'
  if (door.href === '/customers') return 'people filed'
  if (door.href === '/data') return 'tables'
  return undefined
}

/* ------------------------------------------------------------ */
/* Addresses                                                     */
/* ------------------------------------------------------------ */

/**
 * WHAT A FINDER ROW OPENS. `null` means the row is not an address at
 * all — a chapter on a build — which the screen underneath owns.
 *
 * It is here rather than in `domain/shell/finder.ts` for the reason
 * `src/app/ways.ts` gives at length: which URL a screen answers at is
 * a fact about the app's shape, and the domain is arithmetic over the
 * file.
 */
export function addressOf(target: FinderTarget): string | null {
  switch (target.at) {
    case 'door':
      return target.href
    case 'act':
      /* the picker; and the blue door with the name already in the
         field, which is the address Home's blank desk already offers */
      return target.act === 'new-quote' ? START_A_QUOTE.href : '/sign-in?again=true'
    case 'quote':
      return target.issued ? `/quote/${target.id}/document` : `/quote/${target.id}`
    case 'customer':
      return `/customers?who=${encodeURIComponent(target.rowId)}`
    case 'table':
      return `/data/${encodeURIComponent(target.tableId)}`
    case 'row':
      /* `?at=` is the sheet's own word for the row a record is open on
         (`src/screens/sheet/Sheet.tsx`), so a found row opens with its
         record showing rather than at the top of its table */
      return `/data/${encodeURIComponent(target.tableId)}?at=${encodeURIComponent(target.rowId)}`
    case 'here':
      return null
  }
}

/* ------------------------------------------------------------ */
/* Naming a place before remembering it                          */
/* ------------------------------------------------------------ */

/**
 * WHAT TO CALL THE ADDRESS SOMEBODY IS ON — and `null` where nothing
 * can say. A recall list is only worth having if every row is a place
 * a person recognises, so an address this cannot name is not kept.
 */
export function nameOf(
  at: string,
  filed: readonly { id: string; reference: string }[],
  tables: Record<string, { id: string; name: string }>,
): RecentPlace | null {
  const path = at.split('?')[0]!
  const door = DOORS.find((d) => d.href === path)
  if (door) return { href: door.href, name: door.word, fact: door.title }

  if (path === START_A_QUOTE.href) {
    return { href: path, name: START_A_QUOTE.title, fact: 'the picker' }
  }

  const quote = /^\/quote\/([^/]+)(\/[a-z]+)?$/.exec(path)
  if (quote) {
    const found = filed.find((q) => q.id === quote[1])
    if (!found) return null
    const tail = quote[2] ?? ''
    return {
      href: at,
      name: found.reference,
      fact: tail === '/document' ? 'the paper' : tail === '/cascade' ? 'a decision' : 'the build',
    }
  }

  const table = /^\/data\/([^/]+)$/.exec(path)
  if (table) {
    const found = tables[table[1]!]
    return found ? { href: path, name: found.name, fact: 'a sheet' } : null
  }
  return null
}
