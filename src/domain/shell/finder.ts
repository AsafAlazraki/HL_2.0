/* ============================================================
   THE FINDER'S GRAMMAR — what a typed line answers with, as a pure
   function of what the matchers already found.

   Written 2026-09-23 with the shell (`src/screens/shell`), direction
   A of `docs/research/refs/shell/notes.md` §5.

   THIS MODULE MATCHES NOTHING. Every kind in this app already has a
   matcher that is pure, tested and used by a screen:

     · the sheet          `src/domain/catalogue/search.ts` — tables,
                          rows, columns, and (handed its facts)
                          documents
     · a quote            `src/domain/quote/find.ts`, which is what
                          the register's own find field uses
     · a person           `src/domain/people/customers.ts`
                          `matchCustomers`, which is what the build's
                          "Who it is for" uses

   A finder that decided for itself what "sp560" hits would be a
   SECOND opinion about the same question, and the day the two
   disagreed the palette would be quietly wrong about the app. So
   this takes each kind's matches from that kind's own matcher and
   answers only the grammar question: which group a row belongs in,
   what it is called, which counted fact stands beside it, what
   pressing it DOES, and in what order a cursor walks them.

   THE GRAMMAR IS THE SWEEP'S, §1.3: `Quotes › 20260918-01 SP560 ·
   Marcus Webb · Open`. The group is the kind, the row is name · fact
   · verb, and the fact is counted rather than written. Vercel's
   palette is the reference — the verb IS the row, under a scope chip
   — and Spotlight's named kinds are why the groups are the kinds a
   dealer would name rather than "results".

   WHAT THE CRITIC ASKED FOR AND THE SWEEP DID NOT ANSWER
   (`docs/research/refs/critique-m2.md` §4): "no table row (an
   `F90LB`, a Dealer Fit code) is shown reached". A row IS a kind
   here — `{ at: 'row' }` — and its verb opens the sheet on it. §4
   also asks what index the finder reads and what its bound is: the
   index is `buildSearchIndex`'s, built once per opening of the
   field, and the bound is `DEFAULT_LIMITS` — 8 per table, 40 rows,
   6 tables, 5 documents — which is the old app's own published bound
   and is applied by `search()` before this file sees anything.

   NO ADDRESS IS WRITTEN HERE. A target is what a row IS, not where
   it lives; `src/app/ways.ts` turns one into an href, because which
   URL a screen answers at is a fact about the app's shape and this
   module is arithmetic over the file.
   ============================================================ */
import type { SearchResult } from '@/domain/catalogue/search'

/* ------------------------------------------------------------ */
/* What a press lands on                                         */
/* ------------------------------------------------------------ */

/** The acts the finder can do rather than open. Two, because two is
 *  what this app has that is a verb and not a place: writing a new
 *  document, and reading the Master Price File in. */
export type FinderActId = 'new-quote' | 'load-the-file'

/** WHAT A ROW IS. `src/app/ways.ts` maps each of these to an address;
 *  nothing here knows one. */
export type FinderTarget =
  | { at: 'door'; href: string }
  | { at: 'act'; act: FinderActId }
  /** a document, opened where its state belongs: a draft where it is
   *  written, an issued quote as the paper the customer was given */
  | { at: 'quote'; id: string; issued: boolean }
  | { at: 'customer'; rowId: string }
  | { at: 'table'; tableId: string }
  | { at: 'row'; tableId: string; rowId: string }
  /** a row the SCREEN underneath owns — the scope chip's group. The
   *  screen handed it in and the screen acts on it; the finder only
   *  puts it first. */
  | { at: 'here'; id: string }

/** One line in the finder: name · fact · verb, and what it opens. */
export interface FinderRow {
  /** stable within one reading, and what a cursor is kept on */
  id: string
  /** what it is called, as the rest of the app spells it */
  name: string
  /** ONE COUNTED FACT, or '' when there honestly is none. Never a
   *  figure this module invented: every one is handed in already
   *  counted by the store that owns it. */
  fact: string
  /** what pressing it does, in the dealer's own words */
  verb: string
  target: FinderTarget
  /** a single key that reaches this row without the arrows, printed
   *  on it. Only the doors and the acts have one. */
  key?: string
  /** the run of `name` that matched, for the mark. -1 is "the match
   *  was not in the name" — a description, a customer on a quote —
   *  and draws no mark, which is `search.ts`'s own rule. */
  at?: number
  length?: number
}

export interface FinderGroup {
  id: string
  /** the kind, as a dealer would name it */
  title: string
  /** one line under the title where the group owes an explanation */
  say?: string
  rows: FinderRow[]
  /** matches in this kind beyond the rows listed. Measured before the
   *  cap by whichever matcher found them; never estimated. */
  more?: number
}

/* ------------------------------------------------------------ */
/* What the caller hands in                                      */
/* ------------------------------------------------------------ */

export interface FinderDoor {
  href: string
  word: string
  say: string
  key: string
}

export interface FinderAct {
  act: FinderActId
  /** the act's own name, which is already a verb */
  name: string
  /** what it does, as a sentence */
  say: string
  /** the doing word, so every row in this list reads the same way */
  verb: string
  key: string
  /** A CAVEAT THIS ACT CARRIES RIGHT NOW, as a sentence, printed in
   *  place of `say` — "no price file is open, so the picker will have
   *  nothing to list". It is not a refusal: the act still acts, and
   *  the screen it opens says the same thing in its own words. It is
   *  the finder declining to let somebody press it without knowing. */
  note?: string
}

/** One person, already matched by `matchCustomers`.
 *
 *  THE FACT BESIDE A NAME IS THE FIRST CONTACT LINE THE REGISTER
 *  HOLDS, not a count of their quotes. Two names in a book are told
 *  apart by a phone number, never by how many documents each has —
 *  and the count would cost a walk of the whole diary index on every
 *  keystroke to answer a question nobody asked at a palette. A row
 *  with nothing filed says so, because '' is a real state here
 *  (`domain/people/customers.ts`) and a placeholder would read as a
 *  contact. */
export interface FinderPerson {
  rowId: string
  name: string
  /** their first printable contact line, or '' */
  contact: string
}

/** THE SCREEN'S OWN ROWS, under a chip naming the scope.
 *
 *  This is how one Ctrl K serves a screen that already had a field of
 *  its own. Linear's 2019 command menu prints what it acts on as a
 *  chip above the field — `Issue · LIN-1615 Changelog` — and that is
 *  what settles the collision the sweep found (§0.3): Home and the
 *  configurator each bound Ctrl K to their own search, and instead of
 *  taking the key away from them, the finder puts their rows FIRST
 *  under their own name. */
export interface FinderScope {
  /** the chip: what this screen is */
  word: string
  /** the group's own title, in the screen's words */
  title: string
  say?: string
  rows: FinderRow[]
  more?: number
}

export interface FinderInput {
  /** exactly what was typed, untrimmed */
  query: string
  doors: readonly FinderDoor[]
  acts: readonly FinderAct[]
  /** the places this browser came back to, newest first, already read
   *  out of prefs by the caller */
  recent: readonly FinderRow[]
  /** what `search()` answered, or null where no file is open */
  result: SearchResult | null
  /** what `matchCustomers()` answered */
  people: readonly FinderPerson[]
  /** the ids of the tables that hold boats, so a hull is answered
   *  under its own word rather than under "In the tables". Read off
   *  the catalogue's own `TABLE_KINDS` by the caller. */
  boatTables: ReadonlySet<string>
  /** the table the customer register lives in, whose rows are lifted
   *  into `People` and are never listed twice */
  customerTableId: string
  scope?: FinderScope | null
}

export interface FinderReading {
  groups: FinderGroup[]
  /** every row a key can land on, in the order they are painted, so
   *  index N here is the Nth line down the sheet. Flat on purpose:
   *  the groups are how the answer READS, and a cursor that has to
   *  understand nesting is a cursor that gets stuck in it —
   *  `search.ts`'s `optionsOf` makes the same argument. */
  options: FinderRow[]
  /** true once enough has been typed to be answering rather than
   *  offering */
  asking: boolean
  /** said where the rows would be, when nothing matched */
  nothing: string | null
}

/** The shortest query worth answering, the same two characters
 *  `search.ts` publishes: one letter matches almost everything and
 *  teaches nothing. */
export const MIN_ASK = 2

const fold = (raw: string): string => raw.trim().replace(/\s+/g, ' ').toLowerCase()

/** WHERE THE MARK GOES, which is not a second matcher: the matcher
 *  has already decided this row is an answer, and this only says
 *  which run of the name to draw it under. A name that matched on
 *  something else — a phone number, a note — answers -1 and draws no
 *  mark, which is `search.ts`'s own rule for a description hit. */
const runIn = (name: string, q: string): { at: number; length: number } => {
  const at = name.toLowerCase().indexOf(q)
  return { at, length: at < 0 ? 0 : q.length }
}

export const NOTHING_MATCHED = (query: string): string =>
  `Nothing in this browser matches “${query.trim()}”. A quote is found by its reference, the customer or the boat; a person by name; a table or a row by what it is called.`

/**
 * THE WHOLE ANSWER, in the order it is painted.
 *
 * AT REST it is what a person came back for and where they can go:
 * the places this browser has been, then the five doors, then the
 * acts. Notion jumps "to a recently visited page" before a character
 * is typed and Stripe's Shortcuts section fills itself with the pages
 * you visit; the sweep's §2 takes both, and `docs/LATER.md` already
 * named the old repo's `moduleRecent` as the thing to bring.
 *
 * WHILE TYPING the doors come first when a word of one begins with
 * what was typed — "cust" is Customers before it is anything else —
 * then the screen's own rows under its chip, then the kinds, biggest
 * thing first, the way `optionsOf` orders its own: a document, a
 * person, a boat, a table, a row inside one, and the acts last
 * because an act is not a thing you were looking for.
 */
export function readFinder(input: FinderInput): FinderReading {
  const q = fold(input.query)
  const asking = q.length >= MIN_ASK
  const groups: FinderGroup[] = []

  const doorRows = (): FinderRow[] =>
    input.doors.map((d) => ({
      id: `door:${d.href}`,
      name: d.word,
      fact: d.say,
      verb: 'Go there',
      target: { at: 'door', href: d.href } as const,
      key: d.key,
      ...runIn(d.word, q),
    }))

  const actRows = (): FinderRow[] =>
    input.acts.map((a) => ({
      id: `act:${a.act}`,
      name: a.name,
      fact: a.note ?? a.say,
      verb: a.verb,
      target: { at: 'act', act: a.act } as const,
      key: a.key,
      ...runIn(a.name, q),
    }))

  if (!asking) {
    if (input.scope && input.scope.rows.length > 0) {
      groups.push({
        id: 'scope',
        title: input.scope.title,
        ...(input.scope.say === undefined ? {} : { say: input.scope.say }),
        rows: input.scope.rows,
        ...(input.scope.more === undefined ? {} : { more: input.scope.more }),
      })
    }
    if (input.recent.length > 0) {
      groups.push({
        id: 'recent',
        title: 'Back to',
        say: 'Where this browser has been, newest first.',
        rows: [...input.recent],
      })
    }
    groups.push({ id: 'doors', title: 'Go', rows: doorRows() })
    groups.push({ id: 'acts', title: 'Do', rows: actRows() })
    return { groups, options: groups.flatMap((g) => g.rows), asking, nothing: null }
  }

  /* -- the doors, when a word of one begins with what was typed ---
     A PREFIX AND NOT A SUBSTRING. "at" is inside "Data" and inside
     nothing a person means by it; a door that answered every third
     keystroke would push the thing somebody is actually looking for
     one line down on every one of them. */
  const doorHits = doorRows().filter((r) => r.name.toLowerCase().startsWith(q))
  if (doorHits.length > 0) groups.push({ id: 'doors', title: 'Go', rows: doorHits })

  if (input.scope && input.scope.rows.length > 0) {
    groups.push({
      id: 'scope',
      title: input.scope.title,
      ...(input.scope.say === undefined ? {} : { say: input.scope.say }),
      rows: input.scope.rows,
      ...(input.scope.more === undefined ? {} : { more: input.scope.more }),
    })
  }

  const result = input.result

  /* -- documents ------------------------------------------------- */
  if (result && result.quotes.length > 0) {
    groups.push({
      id: 'quotes',
      title: 'Quotes',
      rows: result.quotes.map((h) => {
        const facts = [h.quote.subject, h.quote.customer].filter((s) => s.trim() !== '')
        return {
          id: `quote:${h.quote.id}`,
          name: h.quote.reference,
          fact: facts.join(' · '),
          verb: h.quote.issued ? 'Open the paper' : 'Open the build',
          target: { at: 'quote', id: h.quote.id, issued: h.quote.issued } as const,
          /* the run is in the reference only when that is what matched;
             a hit on the customer or the boat marks nothing, because
             the run is not in the name being drawn */
          at: h.where === 'reference' ? h.at : -1,
          length: h.where === 'reference' ? h.length : 0,
        }
      }),
    })
  }

  /* -- people ---------------------------------------------------- */
  if (input.people.length > 0) {
    groups.push({
      id: 'people',
      title: 'Customers',
      rows: input.people.map((p) => ({
        id: `person:${p.rowId}`,
        name: p.name,
        fact: p.contact === '' ? 'no contact filed' : p.contact,
        verb: 'Open their page',
        target: { at: 'customer', rowId: p.rowId } as const,
        ...runIn(p.name, q),
      })),
    })
  }

  /* -- boats, and everything else that is a row ------------------
     THE ROW IS THE KIND THE CRITIC FOUND MISSING. A boat is answered
     under its own word because that is what this dealership sells;
     every other row — an F90LB, a dealer-fit code — is answered under
     the table it lives in, which is the answer to "where does this
     live?" as well as to "what is it called". */
  const rowGroups = result ? result.groups.filter((g) => g.table.id !== input.customerTableId) : []
  const boats = rowGroups.filter((g) => input.boatTables.has(g.table.id))
  const rest = rowGroups.filter((g) => !input.boatTables.has(g.table.id))

  if (boats.length > 0) {
    groups.push({
      id: 'boats',
      title: 'Boats',
      rows: boats.flatMap((g) =>
        g.hits.map((h) => ({
          id: `row:${g.table.id}:${h.rowId}`,
          name: h.label,
          fact: g.table.name,
          verb: 'Open it on the sheet',
          target: { at: 'row', tableId: g.table.id, rowId: h.rowId } as const,
          at: h.at,
          length: h.length,
        })),
      ),
      more: boats.reduce((n, g) => n + g.more, 0),
    })
  }

  /* -- the tables themselves ------------------------------------- */
  if (result && result.tables.length > 0) {
    groups.push({
      id: 'tables',
      title: 'Tables',
      rows: result.tables.map((h) => ({
        id: `table:${h.table.id}`,
        name: h.table.name,
        fact: `${h.table.rowCount.toLocaleString('en-AU')} ${h.table.rowCount === 1 ? 'row' : 'rows'}${h.table.retired ? ' · history' : ''}`,
        verb: 'Open the sheet',
        target: { at: 'table', tableId: h.table.id } as const,
        at: h.at,
        length: h.length,
      })),
    })
  }

  for (const g of rest) {
    groups.push({
      id: `rows:${g.table.id}`,
      title: g.table.name,
      rows: g.hits.map((h) => ({
        id: `row:${g.table.id}:${h.rowId}`,
        name: h.label,
        fact: h.via ?? '',
        verb: 'Open it on the sheet',
        target: { at: 'row', tableId: g.table.id, rowId: h.rowId } as const,
        at: h.at,
        length: h.length,
      })),
      more: g.more,
    })
  }

  /* -- the acts, by verb ----------------------------------------- */
  const actHits = actRows().filter((r) => r.name.toLowerCase().includes(q))
  if (actHits.length > 0) groups.push({ id: 'acts', title: 'Do', rows: actHits })

  const kept = onceEach(groups)
  const options = kept.flatMap((g) => g.rows)
  return {
    groups: kept,
    options,
    asking,
    nothing: options.length === 0 ? NOTHING_MATCHED(input.query) : null,
  }
}

/**
 * ONE ROW, ONCE — and the place it is drawn is the FIRST place it
 * would be drawn.
 *
 * The scope chip is what makes this necessary rather than tidy. A
 * screen that puts its own rows first is putting rows the kinds below
 * it would list again: a draft standing on the desk is a draft in
 * Quotes, and a person reading two identical lines learns that one of
 * them is a lie about the other. Ids are the whole test — every row
 * in this file is keyed by what it opens, so two rows with one id are
 * two drawings of one thing.
 *
 * A group emptied by this is dropped rather than left as a heading
 * over nothing.
 */
function onceEach(groups: FinderGroup[]): FinderGroup[] {
  const seen = new Set<string>()
  const out: FinderGroup[] = []
  for (const group of groups) {
    const rows = group.rows.filter((r) => !seen.has(r.id))
    for (const r of rows) seen.add(r.id)
    if (rows.length > 0) out.push({ ...group, rows })
  }
  return out
}
