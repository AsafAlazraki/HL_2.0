/* ============================================================
   THE FINDER'S GRAMMAR — what a typed line answers with, as a pure
   function of what the matchers already found.

   Written 2026-09-23 with the shell (`src/screens/shell`), direction
   A of `docs/research/refs/shell/notes.md` §5.

   THIS MODULE MATCHES NOTHING. Every kind in this app already has a
   matcher that is pure, tested and used by a screen:

     · the sheet          `src/domain/catalogue/search.ts` — tables,
                          rows by name AND by the code they are
                          ordered by, and (handed its facts)
                          documents
     · a quote            `src/domain/quote/find.ts`, which is what
                          the register's own find field uses
     · a person           `src/domain/people/customers.ts`
                          `matchCustomers`, which is what the build's
                          "Who it is for" uses
     · what fits a boat   `src/domain/shell/fits.ts`, which asks the
                          quote engine's own `relatedRows`

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

   A BOAT IS SOMETHING TO SELL, NOT A LINE TO READ (the critique of
   Milestone 2's close, #8: "every boat the finder answers has one
   verb, 'Open it on the sheet'. There is no way to quote the boat you
   just found"). So a found boat's verb is the sale:

     · ONE VERSION found — typed by its code, or by enough of its name
       — is "Start a quote", and the press writes the draft exactly as
       the picker's own act does and opens the build on it;
     · SEVERAL VERSIONS of one model found — "sp560" is fifteen lines
       of the file and one boat — collapse into ONE line for the model,
       "Choose the version", which opens the picker's plate on it with
       its colourways, because which of fifteen is a question for the
       customer and not for a palette.

   The sheet is still one press away where it is the precise answer: a
   single line found gets a second row naming it as the file spells it,
   "Open it on the sheet". Motors, trailers, packages and parts keep
   that verb — they are read, and quoted from the build.

   WHAT THE CRITIC ASKED FOR AND THE SWEEP DID NOT ANSWER
   (`docs/research/refs/critique-m2.md` §4): "no table row (an
   `F90LB`, a Dealer Fit code) is shown reached". A row IS a kind
   here — `{ at: 'row' }` — and its verb opens the sheet on it. The
   index is `buildSearchIndex`'s, built once per opening of the field;
   the caller asks `search()` for every match and THIS module caps each
   group at `SHOWN`, so a model is collapsed over all of its versions
   rather than over the first eight.

   NO ADDRESS IS WRITTEN HERE. A target is what a row IS, not where
   it lives; `src/app/ways.ts` and `Shell.tsx` turn one into an href,
   because which URL a screen answers at is a fact about the app's
   shape and this module is arithmetic over the file.
   ============================================================ */
import { money } from '@/domain/money'
import type { AccentKey } from '@/domain/model'
import { markIn, type RowHit, type SearchResult } from '@/domain/catalogue/search'
import type { FitsAnswer, FitsQuestion } from './fits'

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
  /** START A QUOTE ON THIS EXACT BOAT — the one act here that writes.
   *  The shell writes it through the picker's own `startQuote`, so a
   *  draft already standing for the boat is handed back, not doubled. */
  | { at: 'start'; tableId: string; rowId: string }
  /** the picker, open on one model — its key is the picker's own */
  | { at: 'model'; model: string }
  /** a row the SCREEN underneath owns — the scope chip's group. The
   *  screen handed it in and the screen acts on it; the finder only
   *  puts it first. */
  | { at: 'here'; id: string }

/** One line in the finder: name · fact · figure · verb, and what it opens. */
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
  /** THE PRICE, where the line has one: read by the caller through the
   *  table's declared price ladder, at the rung a quote opens at, never
   *  a cost and never a zero. Set in figures at the trailing edge. */
  figure?: string
  /** the code the line is ordered by, and the run of it that matched
   *  (-1 when the code is not what matched) */
  code?: { text: string; at: number; length: number }
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
  /** THE KIND'S OWN INK — `TABLE_KINDS`' accent for what the group
   *  holds, the colour Data already draws a kind in. Absent on a group
   *  that is not a kind of thing (the doors, the acts). */
  ink?: AccentKey
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

/** A BOAT AS THE PICKER FILES IT — the model a line of the file is a
 *  version of. The caller reads it off the picker's own fleet, so the
 *  finder and the picker cannot disagree about which lines are one
 *  boat. */
export interface FinderBoat {
  /** the picker's key for the model, which `?model=` carries */
  model: string
  /** the model as a card prints it, maker taken off: "SP560" */
  modelName: string
  /** the maker, as the file files it: "Highfield Inflatables" */
  maker: string
  /** this version's own name, maker taken off: "SP560 (HYP) B-B-B" */
  name: string
  /** how many versions the model is */
  versions: number
  /** this version's figure at the rung a quote opens at; null where
   *  the cell holds none or holds zero, which is not a price */
  amount: number | null
}

/** WHAT THE CALLER KNOWS ABOUT A LINE that the matcher does not: the
 *  boat it is a version of, its price, and its kind's ink. Every one
 *  is read off the stores through the reader that already owns it. */
export interface FinderLines {
  /** null where the picker does not offer the line — no longer sold,
   *  or on a list that is history */
  boat(tableId: string, rowId: string): FinderBoat | null
  /** the line's price at its list's first rung, or null */
  price(tableId: string, rowId: string): number | null
  /** the ink of the kind a table holds */
  ink(tableId: string): AccentKey
}

export interface FinderInput {
  /** exactly what was typed, untrimmed */
  query: string
  doors: readonly FinderDoor[]
  acts: readonly FinderAct[]
  /** the places this browser came back to, newest first, already read
   *  out of prefs by the caller */
  recent: readonly FinderRow[]
  /** what `search()` answered — with limits wide enough that every
   *  match is in it — or null where no file is open */
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
  /** what the caller can say about a line; absent, lines carry no
   *  figure and a boat is answered as a line of the file */
  lines?: FinderLines
  /** "trailer for sp560", read and answered — `fits.ts` — when the
   *  line was that question and a boat matched it */
  fits?: { question: FitsQuestion; answer: FitsAnswer } | null
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
  /** said ABOVE the rows when the answer owes a sentence the rows
   *  cannot carry — a question asked of real boats with nothing paired */
  note: string | null
}

/** The shortest query worth answering, the same two characters
 *  `search.ts` publishes: one letter matches almost everything and
 *  teaches nothing. */
export const MIN_ASK = 2

/** HOW MANY LINES A GROUP DRAWS before it says how many more it holds.
 *  Eight is a whole series of one maker, and the `search.ts` bound
 *  this module used to inherit. */
export const SHOWN = 8

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

const counted = (n: number, one: string, many: string): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? one : many}`

/** "$41,390" or "$41,390 – $48,350"; '' where nothing is priced. */
const span = (amounts: readonly (number | null)[]): string => {
  const held = amounts.filter((n): n is number => n !== null)
  if (held.length === 0) return ''
  const from = Math.min(...held)
  const to = Math.max(...held)
  return from === to ? money(from) : `${money(from)} – ${money(to)}`
}

const priceOf = (lines: FinderLines | undefined, tableId: string, rowId: string): string => {
  const n = lines?.price(tableId, rowId) ?? null
  return n === null ? '' : money(n)
}

export const NOTHING_MATCHED = (query: string): string =>
  `Nothing matches “${query.trim()}”. Type a boat’s name or the code it is ordered by, a quote’s reference or a customer’s name — or ask for a trailer or a motor “for” a boat.`

/** "Trailers", "Motors" — the kind as a group heading names it. */
const KIND_TITLE = { trailer: 'Trailers', motor: 'Motors' } as const

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
 * then the screen's own rows under its chip, then the kinds, the one
 * this dealership sells first: a document, a person, a boat, a list,
 * a line inside one, and the acts last because an act is not a thing
 * you were looking for.
 *
 * ASKED WHAT FITS A BOAT, the answer is that and the boat itself —
 * the fitted things first, then the boats they were asked of, with
 * their own verb — and nothing that merely contains the words.
 */
export function readFinder(input: FinderInput): FinderReading {
  const q = fold(input.query)
  const asking = q.length >= MIN_ASK
  const groups: FinderGroup[] = []
  const lines = input.lines

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

  const scopeGroup = (): FinderGroup | null =>
    input.scope && input.scope.rows.length > 0
      ? {
          id: 'scope',
          title: input.scope.title,
          ...(input.scope.say === undefined ? {} : { say: input.scope.say }),
          rows: input.scope.rows,
          ...(input.scope.more === undefined ? {} : { more: input.scope.more }),
        }
      : null

  if (!asking) {
    const scope = scopeGroup()
    if (scope) groups.push(scope)
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
    return {
      groups,
      options: groups.flatMap((g) => g.rows),
      asking,
      nothing: null,
      note: null,
    }
  }

  const result = input.result
  const rowGroups = result ? result.groups.filter((g) => g.table.id !== input.customerTableId) : []
  const boats = rowGroups.filter((g) => input.boatTables.has(g.table.id))
  const rest = rowGroups.filter((g) => !input.boatTables.has(g.table.id))
  let note: string | null = null

  /* -- what fits a boat, when that was the question -------------- */
  const fits = input.fits ?? null
  if (fits && boats.length > 0) {
    const { question, answer } = fits
    const title = `${KIND_TITLE[question.kind]} for ${question.boat}`
    if (answer.fits.length === 0) {
      note = `The price file pairs no ${question.kind} with the ${counted(answer.boats, 'boat', 'boats')} matching “${question.boat}”.${answer.held > 0 ? ` ${counted(answer.held, 'pairing names', 'pairings name')} one no longer sold.` : ''}`
    } else {
      const shown = answer.fits.slice(0, SHOWN)
      groups.push({
        id: 'fits',
        title,
        say: `What the price file pairs with the ${counted(answer.boats, 'boat', 'boats')} matching “${question.boat}”, the file’s own pick first.`,
        ink: lines?.ink(shown[0]!.tableId) ?? (question.kind === 'trailer' ? 'ochre' : 'carmine'),
        rows: shown.map((fit) => {
          const reach =
            answer.boats === 1
              ? 'fits it'
              : fit.fits === answer.boats
                ? `fits all ${answer.boats.toLocaleString('en-AU')}`
                : `fits ${fit.fits.toLocaleString('en-AU')} of ${answer.boats.toLocaleString('en-AU')}`
          const figure = priceOf(lines, fit.tableId, fit.rowId)
          return {
            id: `row:${fit.tableId}:${fit.rowId}`,
            name: fit.label,
            fact: fit.picks > 0 ? `${reach} · the file’s pick` : reach,
            verb: 'Open it on the sheet',
            target: { at: 'row', tableId: fit.tableId, rowId: fit.rowId } as const,
            ...(figure === '' ? {} : { figure }),
            at: -1,
            length: 0,
          }
        }),
        ...(answer.fits.length > SHOWN ? { more: answer.fits.length - SHOWN } : {}),
      })
    }
    groups.push(boatGroup(boats, question.boat, lines))
    return finish(groups, input.query, note)
  }

  /* -- the doors, when a word of one begins with what was typed ---
     A PREFIX AND NOT A SUBSTRING. "at" is inside "Data" and inside
     nothing a person means by it; a door that answered every third
     keystroke would push the thing somebody is actually looking for
     one line down on every one of them. */
  const doorHits = doorRows().filter((r) => r.name.toLowerCase().startsWith(q))
  if (doorHits.length > 0) groups.push({ id: 'doors', title: 'Go', rows: doorHits })

  const scope = scopeGroup()
  if (scope) groups.push(scope)

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

  /* -- boats: something to sell ---------------------------------- */
  if (boats.length > 0) groups.push(boatGroup(boats, input.query, lines))

  /* -- the lists themselves -------------------------------------- */
  if (result && result.tables.length > 0) {
    groups.push({
      id: 'tables',
      title: 'Lists',
      rows: result.tables.map((h) => ({
        id: `table:${h.table.id}`,
        name: h.table.name,
        fact: `${counted(h.table.rowCount, 'line', 'lines')}${h.table.retired ? ' · no longer sold' : ''}`,
        verb: 'Open the sheet',
        target: { at: 'table', tableId: h.table.id } as const,
        at: h.at,
        length: h.length,
      })),
    })
  }

  /* -- every other line, under the list it lives in ------------- */
  for (const g of rest) {
    const shown = g.hits.slice(0, SHOWN)
    groups.push({
      id: `rows:${g.table.id}`,
      title: g.table.name,
      ...(g.table.retired
        ? { say: 'No longer sold — kept for the quotes that were written against it.' }
        : {}),
      ink: g.table.accent,
      rows: shown.map((h) => lineRow(g.table.id, h, lines)),
      ...(g.hits.length + g.more > SHOWN ? { more: g.hits.length + g.more - SHOWN } : {}),
    })
  }

  /* -- the acts, by verb ----------------------------------------- */
  const actHits = actRows().filter((r) => r.name.toLowerCase().includes(q))
  if (actHits.length > 0) groups.push({ id: 'acts', title: 'Do', rows: actHits })

  return finish(groups, input.query, note)
}

/** One line of a list that is not a boat: its name, its code, its
 *  price, and the sheet. */
function lineRow(tableId: string, h: RowHit, lines: FinderLines | undefined): FinderRow {
  const figure = priceOf(lines, tableId, h.rowId)
  return {
    id: `row:${tableId}:${h.rowId}`,
    name: h.label,
    fact: h.via ?? '',
    verb: 'Open it on the sheet',
    target: { at: 'row', tableId, rowId: h.rowId } as const,
    ...(figure === '' ? {} : { figure }),
    ...(h.code ? { code: h.code } : {}),
    at: h.at,
    length: h.length,
  }
}

/**
 * THE BOATS, AS THINGS TO SELL.
 *
 * Every matched line is read through `lines.boat` to the model the
 * picker files it under. A model with several versions matched is one
 * line — "Choose the version", onto the picker's plate; a model with
 * one is that version — "Start a quote". A line the picker does not
 * offer (no longer sold) is answered as a line of the file, and says so.
 *
 * And where exactly ONE line of a list matched — the dealer typed a
 * code, or a name down to its colourway — the file's own line for it
 * follows, as the file spells it, one press from the sheet.
 */
function boatGroup(
  groups: SearchResult['groups'],
  query: string,
  lines: FinderLines | undefined,
): FinderGroup {
  interface Seen {
    tableId: string
    maker: string
    boat: FinderBoat | null
    hits: RowHit[]
  }
  const seen = new Map<string, Seen>()
  for (const g of groups) {
    for (const hit of g.hits) {
      const boat = lines?.boat(g.table.id, hit.rowId) ?? null
      const key = boat ? `model:${boat.model}` : `line:${g.table.id}:${hit.rowId}`
      const held = seen.get(key)
      if (held) held.hits.push(hit)
      else seen.set(key, { tableId: g.table.id, maker: g.table.name, boat, hits: [hit] })
    }
  }

  const all: FinderRow[] = []
  for (const { tableId, maker, boat, hits } of seen.values()) {
    const first = hits[0]!
    if (boat && hits.length > 1) {
      const amounts = hits.map((h) => lines?.boat(tableId, h.rowId)?.amount ?? null)
      const figure = span(amounts)
      all.push({
        id: `model:${boat.model}`,
        name: boat.modelName,
        fact: `${boat.maker} · ${
          hits.length === boat.versions
            ? counted(boat.versions, 'version', 'versions')
            : `${hits.length.toLocaleString('en-AU')} of its ${boat.versions.toLocaleString('en-AU')} versions`
        }`,
        verb: 'Choose the version',
        target: { at: 'model', model: boat.model },
        ...(figure === '' ? {} : { figure }),
        ...markIn(boat.modelName, query),
      })
      continue
    }
    if (boat) {
      all.push({
        id: `start:${tableId}:${first.rowId}`,
        name: boat.name,
        fact:
          boat.versions > 1
            ? `${boat.maker} · one of ${boat.versions.toLocaleString('en-AU')} versions`
            : boat.maker,
        verb: 'Start a quote',
        target: { at: 'start', tableId, rowId: first.rowId },
        ...(boat.amount === null ? {} : { figure: money(boat.amount) }),
        ...(first.code ? { code: first.code } : {}),
        ...markIn(boat.name, query),
      })
      continue
    }
    /* the picker does not offer it — or, with nothing handed in to
       ask, nobody here can say, and the line is only what it is */
    all.push({ ...lineRow(tableId, first, lines), fact: lines ? 'no longer sold' : maker })
  }

  const shown = all.slice(0, SHOWN)
  /* THE FILE'S OWN LINE, where the answer is one line of one list */
  for (const g of groups) {
    if (g.hits.length !== 1 || !lines) continue
    const hit = g.hits[0]!
    if (shown.some((r) => r.id === `row:${g.table.id}:${hit.rowId}`)) continue
    shown.push({
      id: `row:${g.table.id}:${hit.rowId}`,
      name: hit.label,
      fact: `as ${g.table.name} lists it`,
      verb: 'Open it on the sheet',
      target: { at: 'row', tableId: g.table.id, rowId: hit.rowId },
      ...(hit.code ? { code: hit.code } : {}),
      at: hit.at,
      length: hit.length,
    })
  }

  return {
    id: 'boats',
    title: 'Boats',
    ink: groups[0]?.table.accent ?? 'blue',
    rows: shown,
    ...(all.length > SHOWN ? { more: all.length - SHOWN } : {}),
  }
}

function finish(groups: FinderGroup[], query: string, note: string | null): FinderReading {
  const kept = onceEach(groups)
  const options = kept.flatMap((g) => g.rows)
  return {
    groups: kept,
    options,
    asking: true,
    nothing: options.length === 0 && note === null ? NOTHING_MATCHED(query) : null,
    note,
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
