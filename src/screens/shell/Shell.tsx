import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { APP_NAME, DOORS, START_A_QUOTE, doorAt, hasShell, surfaceAt, type Door } from '@/app/ways'
import { useCatalogue, usePrefs, useQuotes } from '@/app/useStores'
import { prefs } from '@/state/prefs'
import { catalogue } from '@/state/catalogue'
import { quotes as quotesStore } from '@/state/quotes'
import { session } from '@/state/session'
import { countPriceFile } from '@/domain/catalogue/priceFile'
import {
  buildSearchIndex,
  search,
  type QuoteFacts,
  type SearchLimits,
} from '@/domain/catalogue/search'
import { askedForFits, fitsFor } from '@/domain/shell/fits'
import { CUSTOMER_TABLE_ID, customerRegister, matchCustomers } from '@/domain/people/customers'
import { readEveryone } from '@/domain/people/book'
import { indexQuotes } from '@/domain/quote/diary/history'
import { readRegister } from '@/domain/quote/register'
import {
  MIN_ASK,
  readFinder,
  type FinderAct,
  type FinderRow,
  type FinderTarget,
} from '@/domain/shell/finder'
import { crestOf } from '@/domain/shell/crest'
import { readDoorCounts, type DoorCount, type DoorCounts } from '@/domain/shell/doors'
import { isField } from '@/ui'
import { Pill, type PillDoor } from './Pill'
import { Finder } from './Finder'
import { Shortcuts } from './Shortcuts'
import { ScopeSeat, useLendFinder, useScope } from './scope'
import { readLines } from './lines'
import { startQuote } from '@/screens/picker/mint'
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

/** Said in the finder, under the field, before anything is typed —
 *  the four things a dealer types, and the one question it answers
 *  that is not a name. */
export const FINDER_AT_REST =
  'Type a boat or the code it is ordered by, a quote, a customer — or ask for a trailer or a motor “for” a boat.'

/** Said instead when no price file has been read in. It is a fact and
 *  not a refusal: the finder still finds every document, every person
 *  and every door. */
export const NO_FILE_YET =
  'No price file has been read into this browser yet, so there are no boats to find. Quotes, customers and the doors are all here.'

/** Said where the finder was asked to start a quote and no dealership
 *  is signed in to write it for — a desk the router never draws, and a
 *  component test that hands the shell no org. */
export const NO_DESK =
  'A quote is written for the dealership signed in at this desk, and none is, so nothing was written.'

/**
 * EVERY MATCH, NOT THE FIRST EIGHT. `search()`'s own bound is the
 * popover's — eight a list, forty in all — and the finder draws its
 * groups at its own `SHOWN` instead, because a boat is collapsed into
 * its model over ALL of its versions: "sp560" is fifteen lines, and a
 * model built from the first eight would say "8 of its 15" about a
 * search that found all fifteen. Scanning is arithmetic (the matcher's
 * header measures it); only painting costs, and the finder paints eight.
 */
const EVERY_MATCH: SearchLimits = {
  perTable: 5_000,
  total: 20_000,
  tables: 6,
  modules: 0,
  quotes: 5,
  columns: 0,
}

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
  /* WHY THE LAST PRESS WROTE NOTHING, said in the finder where it was
     pressed, and gone the moment anything else is typed */
  const [refused, setRefused] = useState<string | null>(null)
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
  /* EVERYONE THE CUSTOMERS SCREEN COUNTS AS A CUSTOMER — the people the
     book keeps AND every name a quote carries, since Customers began
     reading a quoted name as a customer the moment it is typed
     (`readEveryone`, `src/domain/people/book.ts`, 2026-09-24). Read by
     the same function, so the door's figure and the finder's people are
     the screen's own: before this the door counted the book alone and
     Ctrl K found nobody a quote named until the book had kept them. */
  const everyone = useMemo(
    () =>
      quotesRead
        ? readEveryone(book, book ? (rows[book.id] ?? []) : [], filed, indexQuotes(filed))
        : null,
    [quotesRead, book, rows, filed],
  )
  const people = useMemo(() => everyone?.people ?? [], [everyone])
  /* THE DOOR COUNTS WHAT THE SCREEN BEHIND IT COUNTS, and that is the
     whole rule — `src/domain/shell/doors.ts` holds it with its suite.
     Each figure below is the one the screen behind the door prints:
     the register's own `held` (critique #9 — the door printed open
     drafts, `Quotes 0` beside "1 quote is filed in this browser"),
     the book's own people, and the 53 that Home's stamp and the data
     register's head both print (`liveTableCount` answered 51, which is
     what Home GROUPS by, and was the first door to disagree).

     THE 53 IS THE PRICE FILE'S, NOT THE SHEET'S (the critique of
     Milestone 2's close, blocker 2): the customers book is a table on
     the sheet, so the door read `Data 54` the moment the first person
     was filed while the file under it had 53. Home's stamp and Data's
     head now count the file by `countPriceFile`, and so does the door. */
  const fileTables = useMemo(
    () => countPriceFile(tables, rows, modules).tables,
    [tables, rows, modules],
  )
  const counts = useMemo(
    () =>
      readDoorCounts({
        quotesRead,
        filed: register.held,
        drafts,
        people: everyone ? everyone.rows.length : null,
        tables: sheetOpen ? fileTables : null,
      }),
    [quotesRead, register.held, drafts, everyone, sheetOpen, fileTables],
  )

  const standing = doorAt(at)
  const doors: PillDoor[] = DOORS.map((door) => ({
    door,
    here: standing?.href === door.href,
    count: countOn(door, counts),
  }))

  /* THE CREST IS NEVER A HOLE (critique #21): the business's initials
     once the file names one, and the helm this app is named for until
     then. `src/domain/shell/crest.ts` says why it is the helm and not
     the person's initials or two letters of the product's name. */
  const crest = useMemo(() => crestOf(business, APP_NAME), [business])

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
  /* THE INDEX IS BUILT ONCE PER OPENING, not once per keystroke — the
     fold is the one cost `search.ts` measures as worth paying once (it
     was paid on EVERY key until 2026-09-24) — and NOT ON THE OPENING
     FRAME. Built there with the fleet below, the sheet took 204–315 ms
     to paint on the dev server at 1440; in node the fold is 94–150 ms and
     the fleet 70–77 ms (measured 2026-09-24). So the sheet paints on its
     doors and acts first, and `warm` turns true one frame later, while
     the dealer's hand is still on the way to the second key. */
  const [opening, setOpening] = useState(0)
  const [warmFor, setWarmFor] = useState(-1)
  useEffect(() => {
    if (!finding) return
    let timer = 0
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setWarmFor(opening), 0)
    })
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [finding, opening])
  const ready = finding && (warmFor === opening || asking)
  const index = useMemo(
    () => (ready ? buildSearchIndex(tables, rows, { modules, quotes: quoteFacts }) : null),
    [ready, tables, rows, modules, quoteFacts],
  )

  /* "TRAILER FOR SP560" — the one question that is not a name. The boat
     half is searched; the kind half is answered by `fitsFor`, which asks
     the quote engine what the build would offer those boats. */
  const question = useMemo(() => (asking ? askedForFits(query) : null), [asking, query])
  const result = useMemo(() => {
    if (!index || !asking) return null
    return search(index, question ? question.boat : query, EVERY_MATCH)
  }, [index, asking, question, query])

  const views = useCatalogue((s) => s.views)
  const fits = useMemo(() => {
    if (!question || !result) return null
    const boats = result.groups
      .filter((g) => g.table.kind === 'boat')
      .flatMap((g) => g.hits.map((h) => ({ tableId: g.table.id, rowId: h.rowId })))
    if (boats.length === 0) return null
    return {
      question,
      answer: fitsFor({ entities: tables, rowsByEntity: rows, views }, boats, question.kind),
    }
  }, [question, result, tables, rows, views])

  /* THE BOAT A LINE IS A VERSION OF, its price and its kind's ink — read
     off the picker's own fleet (`lines.ts` says why it is the picker's),
     once per opening, with the index above and after the opening frame */
  const rowIndex = useCatalogue((s) => s.index)
  const lines = useMemo(
    () => (ready && sheetOpen ? readLines(tables, rows, rowIndex.rowById) : undefined),
    [ready, sheetOpen, tables, rows, rowIndex],
  )

  const matchedPeople = useMemo(() => {
    if (!asking) return []
    return matchCustomers(people, query, 6).map((p) => ({
      rowId: p.rowId,
      name: p.name,
      contact: p.contact[0] ?? '',
    }))
  }, [asking, people, query])

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
        /* asked what fits a boat, the answer is the fitted things and
           the boat — a customer whose name holds "trailer" is not one */
        people: fits ? [] : matchedPeople,
        boatTables,
        customerTableId: CUSTOMER_TABLE_ID,
        ...(lines ? { lines } : {}),
        fits,
        scope: scope
          ? {
              word: scope.word,
              title: scope.title,
              ...(scope.say === undefined ? {} : { say: scope.say }),
              rows: scope.rows(query),
            }
          : null,
      }),
    [query, finderDoors, acts, recent, at, result, matchedPeople, boatTables, scope, lines, fits],
  )

  const open = useCallback(() => {
    setQuery('')
    setRefused(null)
    /* a new opening, so the index is folded again for it — the file may
       have changed since the last one — one frame after it paints */
    setOpening((n) => n + 1)
    setFinding(true)
  }, [])

  const ask = useCallback((next: string) => {
    setQuery(next)
    setRefused(null)
  }, [])

  /* OPENED ON A QUERY A SCREEN HANDS OVER — Home's own field, on Enter.
     The same opening as the chord's, with the words already typed, so
     the fold and the answer are the finder's own. */
  const openOn = useCallback((next: string) => {
    setQuery(next)
    setRefused(null)
    setOpening((n) => n + 1)
    setFinding(true)
  }, [])
  useLendFinder(openOn)

  const choose = useCallback(
    (row: FinderRow) => {
      /* START A QUOTE — the one row that writes. It writes through the
         picker's own act (`startQuote`), so what a quote IS is decided
         in one place: a draft already standing for this boat, with
         nobody named on it, is handed back rather than written twice,
         and the document is filed with the event that made it. The
         build opens on it, where every later change has its Undo. */
      if (row.target.at === 'start') {
        if (org === undefined) {
          setRefused(NO_DESK)
          return
        }
        const outcome = startQuote(
          {
            tableId: row.target.tableId,
            rowId: row.target.rowId,
            sheet: catalogue.getState(),
            orgId: org,
            filed: quotesStore.getState().quotes,
            preparedBy: session.getState().name,
          },
          (tableId, rowId) => quotesStore.getState().unaddressedDraftFor(tableId, rowId),
        )
        if (!outcome.ok) {
          setRefused(outcome.refused)
          return
        }
        if (outcome.event) quotesStore.getState().file(outcome.quote, outcome.event)
        setFinding(false)
        go(outcome.goTo)
        return
      }
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
    [go, scope, org],
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
        /* NOT ON A COARSE POINTER. Every cap on the sheet is drawn away
           there by `src/ui/kbd.css`, so what `?` would open is a list of
           acts with no keys beside them — a sheet offered and then
           emptied. A tablet with a keyboard clipped on still reaches
           every key; it is the LIST of them that is withheld, the same
           call the sheet's own stylesheet already made. */
        if (coarse()) return
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
        crest={crest}
        doors={doors}
        surface={surfaceAt(at)}
        go={go}
        find={open}
        finding={finding}
      />
      <Finder
        open={finding}
        close={() => setFinding(false)}
        query={query}
        onQuery={ask}
        reading={reading}
        refused={refused}
        scope={scope?.word ?? null}
        choose={choose}
        business={business}
        say={sheetOpen ? FINDER_AT_REST : NO_FILE_YET}
        sayAlways={!sheetOpen}
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
 * WHICH OF THE COUNTS STANDS ON WHICH DOOR. The figures themselves,
 * and why each is the one the screen behind the door prints, are
 * `readDoorCounts`'s (`src/domain/shell/doors.ts`); this is only the
 * join between a door's address and its figure, which is the app's
 * shape and so is here rather than in the domain. Home and History
 * carry none.
 */
function countOn(door: Door, counts: DoorCounts): DoorCount | null {
  if (door.href === '/quotes') return counts.quotes
  if (door.href === '/customers') return counts.customers
  if (door.href === '/data') return counts.data
  return null
}

/** Whether the primary pointer is a finger — the browser's own answer, read at the moment of
 *  the keystroke rather than remembered, because a tablet can gain a trackpad mid-session. */
function coarse(): boolean {
  return typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia('(pointer: coarse)').matches
    : false
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
    case 'model':
      /* the picker's own address for one model, the key its own fleet
         mints (`src/routes/quote.new.tsx`: "a link to one hull opens on
         that hull") */
      return `${START_A_QUOTE.href}?model=${encodeURIComponent(target.model)}`
    case 'start':
      /* an act that WRITES, and so not an address: `choose` writes the
         draft and then goes to the build it opened */
      return null
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
    return { href: path, name: START_A_QUOTE.title, fact: 'choosing the boat' }
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
    return found ? { href: path, name: found.name, fact: 'a price list' } : null
  }
  return null
}
