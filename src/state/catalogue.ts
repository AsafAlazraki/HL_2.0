import { createStore, type StoreApi } from 'zustand/vanilla'
import type {
  CatalogueCtx,
  ConstraintDef,
  DiscoveredRule,
  EntityDef,
  GroupDef,
  IndustryKey,
  ModuleDef,
  OrgProfile,
  PackManifest,
  PriceLevel,
  RoleDef,
  RowData,
  RuleDef,
  ViewDef,
} from '@/domain/model'
import {
  apply as applyCommand,
  isDone,
  type CatalogueCommand,
  type CatalogueEvent,
  type Outcome,
} from '@/domain/catalogue/commands'
import {
  emptySheet,
  indexRows,
  type CatalogueData,
  type CatalogueIndex,
} from '@/domain/catalogue/sheet'
import type { CatalogueRepository } from '@/data/repository'
import { repositories } from '@/data'

/* ============================================================
   THE CATALOGUE STORE — the sheet and its registries, in memory,
   changed through commands with inverses and events.

   IT LOADS FROM TWO PLACES AND HOLDS ONE SHAPE. From the pack, once,
   the first time the app opens (the pack is then written to the
   repository by whoever loaded it); from the repository on every open
   after that. Either way the state below is what a screen reads and
   what `ctxFrom` hands to a pure module — and it says WHICH of the two
   answered, in `from`, because the screen that reads the file and the
   screen that prints what was read are two different screens with a
   navigation between them.

   ORDER. Loaded from the pack, rows keep the pack's own order —
   nothing is re-sorted on the way in. Loaded from a repository,
   which promises no order, rows are put back in the sheet's order by
   `rowOrder`: `createdAt` first, then the id with numbers compared
   as numbers, so the pack's `key:ordinal` ids ('boat_stacer:2'
   before 'boat_stacer:10') come back as the sheet wrote them and a
   row a person adds later lands at the end.

   WHAT THIS FILE IS RESPONSIBLE FOR, AND WHAT IT IS NOT — the same
   line `state/quotes.ts` draws.

     · IT IS NOT the rules. What a change does, what the way back is
       and what the label says live in `domain/catalogue/commands.ts`,
       pure and tested without a store. This file holds the sheet,
       calls `apply`, and writes.
     · IT IS NOT the toast. A screen subscribes with `onApplied` and
       pins its UNDO to the event id it is handed. Nothing here knows
       what a toast is.

   THE FOUR PROMISES IT KEEPS

   1. A REFUSAL IS A SENTENCE RETURNED, where the act was attempted.
      The command decides; this returns what it said.

   2. THE WAY BACK IS PINNED TO THE STEP IT CAME FROM. The inverse the
      command handed back is pushed onto ONE stack — the sheet is one
      document — and `undo(eventId)` refuses when the top of the
      stack is no longer that step. Fifty deep, the same fifty the
      old history kept and for its reason: past anything a person
      holds in their head, and it bounds the memory. An entry costs
      what the step replaced, by reference, and nothing else.

   3. A CELL EDIT WRITES ONE ROW, NEVER THE TABLE. Every 300 ms of
      quiet the sheet is handed to the repository whole, and the
      repository writes the DIFFERENCE by object identity
      (`data/dexie/ledger.ts`): a row that did not change is the same
      object it wrote last time. The old repo measured the wholesale
      write at 10,539 ms on 10,698 rows; this is the mechanism that
      makes that number never come back. Only the maps a command
      touched are handed over at all — a cell edit hands over the
      rows and not the tables.

   4. THE WRITE IS FORCED OUT WHEN THE PAGE GOES AWAY. `pagehide` and
      not `beforeunload`, and `visibilitychange` as its second half,
      for the reasons `state/quotes.ts` gives.

   A SHEET WIPE NEVER CLEARS QUOTES, and this store cannot make it
   otherwise: the quotes live behind `QuoteRepository`, which no
   catalogue command and no write here can reach. `data/contract.test.ts`
   holds the repository to it.

   A LOAD IS NOT A STEP. A fresh pack, a reopen: the stacks are
   cleared, because undoing into a sheet that is no longer open would
   restore tables the screens have never heard of. A new document has
   no past.
   ============================================================ */

export type CatalogueStatus = 'empty' | 'loading' | 'ready' | 'failed'

export type { CatalogueData, CatalogueIndex }

/** How many steps back the sheet keeps. */
export const UNDO_DEPTH = 50

/** The write-behind interval. Long enough that a paste is one
 *  write, short enough that nothing is owed for long. */
export const WRITE_BEHIND_MS = 300

/** How many events this session keeps in memory for a screen to
 *  draw. The audit of a sheet is not persisted in this milestone —
 *  the repository has no events table and adding one is a schema
 *  change to argue about — so this is the session's own record and
 *  says so. */
export const EVENTS_KEPT = 200

/** The pack, or any set of tables with their rows, handed in whole.
 *
 *  `modules` is here because the pack does not carry the places: a
 *  module name is a business string, so the plan mints the nine from
 *  table keys in app code when the file lands (`@/data/pack/boot`)
 *  and files them beside the tables. A source that carries them hands
 *  the store the same sheet the repository would give back on the
 *  next open; a source that does not is a sheet with no doors, which
 *  is the honest answer for a blank file. */
export interface PackSource {
  entities: readonly EntityDef[]
  rowsByEntity: Readonly<Record<string, readonly RowData[]>>
  manifest?: PackManifest
  modules?: readonly ModuleDef[]
}

export type CatalogueSource = CatalogueRepository | PackSource

/** One step back on the sheet. `eventId` is what a toast's UNDO is
 *  pinned to: press it after something else has happened and this
 *  is no longer the top of the stack, and the press is refused with
 *  a sentence rather than undoing the wrong thing. */
export interface UndoEntry {
  eventId: string
  /** the sentence the step said when it happened */
  said: string
  /** what the history calls it — "5 cell edits · Highfield Inflatables" */
  label: string
  command: CatalogueCommand
}

/** What a surface is told the moment a command lands. */
export interface Applied {
  said: string
  event: CatalogueEvent
  /** true when there is a step to go back to */
  undoable: boolean
}

export type AppliedListener = (applied: Applied) => void

export interface LoadOptions {
  /** where changes are written. Absent, a repository source writes to
   *  itself and a pack source writes to the organisation's own
   *  repository through `src/data`, which is the instance the pack
   *  was filed into. */
  writeTo?: CatalogueRepository
}

export interface CatalogueState extends CatalogueData {
  status: CatalogueStatus
  /** the sentence, when `status` is 'failed' or a write was refused; null otherwise */
  problem: string | null
  /** this session's audit of the sheet, oldest first, bounded */
  events: CatalogueEvent[]
  load(source: CatalogueSource, options?: LoadOptions): Promise<void>

  /** change the sheet; refuses with the command's sentence */
  apply(command: CatalogueCommand): Outcome
  /** take the last step back. `eventId` pins the press to a step. */
  undo(eventId?: string): Outcome
  /** put an undone step back again */
  redo(): Outcome
  /** what the next step back would be called, or null */
  undoable(): UndoEntry | null
  /** the whole stack, oldest first — the last element is the next step back */
  undoStack(): readonly UndoEntry[]
  redoStack(): readonly UndoEntry[]

  /** tell me when a command lands; returns the way to stop listening */
  onApplied(listener: AppliedListener): () => void
  /** force every pending write out now */
  flush(): Promise<void>
}

export type CatalogueStore = StoreApi<CatalogueState>

/* ---------------------------------------------------------- */
/* Sentences                                                  */
/* ---------------------------------------------------------- */

export const NOT_READY = 'The sheet has not loaded, so there is nothing to change yet.'
export const NOTHING_TO_UNDO = 'There is nothing to go back to on the sheet.'
export const NOTHING_TO_REDO = 'There is nothing to put back on the sheet.'
/** The pinned UNDO, pressed after the sheet moved on. The old note
 *  said "Something else has happened since", and this keeps those
 *  words: a screen that matched on them still matches. */
export const STEP_MOVED_ON =
  'Something else has happened since, so that step is no longer the one to go back on.'

/* ---------------------------------------------------------- */
/* Selectors                                                  */
/* ---------------------------------------------------------- */

/** ON THE PACK A TABLE'S ID IS ITS SEED KEY ('boat_stacer'), so
 *  looking a table up by key is looking it up by id. A table a person
 *  makes has no seed key and nobody asks `byKey` for one. */
export const byKey = (state: CatalogueData, key: string): EntityDef | undefined => state.tables[key]

export const byId = (state: CatalogueData, rowId: string): RowData | undefined =>
  state.index.rowById[rowId]

/** the table a row belongs to, through the row's own `entityId` */
export const tableOf = (state: CatalogueData, rowId: string): EntityDef | undefined => {
  const row = byId(state, rowId)
  return row ? state.tables[row.entityId] : undefined
}

/**
 * THE BUSINESS AS THE LOADED FILE NAMES ITSELF — an organisation
 * profile nobody typed, carrying where it was read.
 *
 * WHY IT EXISTS (critique of Milestone 2, blocker #2). `freeze.ts`
 * writes the letterhead from `ctx.org?.name`, and this pack has no
 * organisation record — Milestone 4's `/manage` is where one is made.
 * So every quote minted on the real file froze no name, and page 1 of
 * the customer's quotation read "This business has not been named yet"
 * while the pill two inches above it said Northside Marine, read off
 * the same file's manifest into `business`. The engine was right about
 * what it was handed and the app was handing it less than it knew.
 *
 * WHY HERE AND NOT IN THE ENGINE. `freeze.ts` and `document.ts` are
 * the golden path, and neither was wrong: a context with no
 * organisation SHOULD freeze no name, and `golden.test.ts` builds its
 * own context and never passes through this function. The fault was
 * in how the app builds the context, so the fix is in how the app
 * builds the context — one function every screen that freezes already
 * calls.
 *
 * WHAT IS NOT INVENTED. The name is the file's own (`manifest.name`
 * when the file was just read, `CatalogueMeta.packName` when it came
 * back out of this browser). `slug` is the tenant key the file's own
 * records carry — `OrgProfile` says the slug IS that id in this build.
 * `industry` is the one industry this build is built for, and the
 * only one `IndustryKey` names. `createdAt` is EMPTY, because the
 * file does not say when the business was set up and a date here
 * would be a date nobody said; nothing on the freeze path reads it.
 * No `quoteTerms`: the file carries none, so a quote minted on it
 * prints none.
 */
export interface OrgNamedByTheFile extends OrgProfile {
  /** PROVENANCE: this profile was read off the price file and typed
   *  by nobody. `version` is the pack's own; `from` says whether the
   *  file was read on this open or filed in this browser earlier. */
  namedBy: {
    source: 'the price file'
    version: string | null
    from: CatalogueData['from']
  }
}

/** The one industry this build is built for. It was read off the
 *  registry's `available` flag, with 'other' behind it, until the
 *  registry held only marine (2026-09-25); the type now names one key,
 *  so the compiler holds this to the registry. */
const BUILT_FOR: IndustryKey = 'marine'

/** The business the loaded file names, as a profile with its
 *  provenance — or undefined where no source named one, which is the
 *  honest state of a blank sheet. */
export function orgNamedByTheFile(state: CatalogueData): OrgNamedByTheFile | undefined {
  const name = state.business?.trim() ?? ''
  if (name === '') return undefined
  return {
    name,
    industry: BUILT_FOR,
    createdAt: '',
    ...(state.orgId ? { slug: state.orgId } : {}),
    namedBy: { source: 'the price file', version: state.version, from: state.from },
  }
}

/** True of a profile that was read off the file rather than set by a person. */
export const isNamedByTheFile = (org: OrgProfile | undefined): org is OrgNamedByTheFile =>
  org !== undefined && 'namedBy' in org

/** The part of a `CatalogueCtx` the catalogue owns, by reference —
 *  the caller adds `orgId`, `access`, `quotes`, `customers` and the
 *  clock through `makeCtx`.
 *
 *  `org` IS THE ORGANISATION RECORD WHEN THERE IS ONE, AND THE FILE'S
 *  OWN NAME WHEN THERE IS NOT. `record` is Milestone 4's: the profile
 *  a person sets in `/manage`, handed in by whoever holds it, and it
 *  wins outright — a dealership that corrects its trading name is not
 *  overruled by the file it happens to have loaded. Nothing passes one
 *  today, so the context carries `orgNamedByTheFile`, and a quote
 *  minted on the Master Price File prints Northside Marine. */
export function ctxFrom(
  state: CatalogueData,
  record?: OrgProfile,
): Pick<
  CatalogueCtx,
  | 'org'
  | 'entities'
  | 'rowsByEntity'
  | 'groups'
  | 'rules'
  | 'views'
  | 'modules'
  | 'roles'
  | 'constraintDefs'
  | 'discoveredRules'
  | 'priceLevels'
> {
  const org = record ?? orgNamedByTheFile(state)
  return {
    ...(org ? { org } : {}),
    entities: state.tables as Record<string, EntityDef>,
    rowsByEntity: state.rows as Record<string, RowData[]>,
    groups: state.groups as Record<string, GroupDef>,
    rules: state.rules as Record<string, RuleDef>,
    views: state.views as Record<string, ViewDef>,
    modules: state.modules as Record<string, ModuleDef>,
    roles: state.roles as Record<string, RoleDef>,
    constraintDefs: state.constraintDefs as ConstraintDef[],
    discoveredRules: state.discoveredRules as DiscoveredRule[],
    priceLevels: state.priceLevels as Record<string, PriceLevel[]>,
  }
}

/** The sheet, and nothing else, out of the state — what a command is
 *  handed and what the repository is handed. */
export const dataOf = (s: CatalogueData): CatalogueData => ({
  orgId: s.orgId,
  version: s.version,
  from: s.from,
  business: s.business,
  tables: s.tables,
  rows: s.rows,
  index: s.index,
  groups: s.groups,
  rules: s.rules,
  views: s.views,
  modules: s.modules,
  roles: s.roles,
  constraintDefs: s.constraintDefs,
  discoveredRules: s.discoveredRules,
  priceLevels: s.priceLevels,
})

/* ---------------------------------------------------------- */
/* Loading                                                     */
/* ---------------------------------------------------------- */

const numeric = new Intl.Collator('en', { numeric: true })

/** the sheet's order, recovered from a repository that promises none */
export const rowOrder = (a: RowData, b: RowData): number =>
  a.createdAt.localeCompare(b.createdAt) || numeric.compare(a.id, b.id)

const byIdMap = <T extends { id: string }>(items: readonly T[]): Record<string, T> => {
  const out: Record<string, T> = {}
  for (const item of items) out[item.id] = item
  return out
}

function fromPack(source: PackSource): CatalogueData {
  const rows: Record<string, RowData[]> = {}
  const priceLevels: Record<string, PriceLevel[]> = {}
  for (const entity of source.entities) {
    rows[entity.id] = [...(source.rowsByEntity[entity.id] ?? [])]
    if (entity.priceLevels && entity.priceLevels.length > 0) {
      priceLevels[entity.id] = entity.priceLevels
    }
  }
  /* WHOSE SHEET: the pack's own records say. Every one carries the
     tenant key; a pack with nothing on it names nobody. */
  const orgId = source.entities[0]?.orgId ?? source.modules?.[0]?.orgId ?? null
  return {
    ...emptySheet(),
    orgId,
    version: source.manifest?.version ?? null,
    from: 'pack',
    business: source.manifest?.name ?? null,
    tables: byIdMap(source.entities),
    rows,
    index: indexRows(rows),
    modules: byIdMap(source.modules ?? []),
    priceLevels,
  }
}

async function fromRepository(repository: CatalogueRepository): Promise<CatalogueData> {
  const [
    meta,
    entities,
    allRows,
    groups,
    rules,
    views,
    modules,
    roles,
    constraintDefs,
    discoveredRules,
    ladders,
  ] = await Promise.all([
    repository.meta.get(),
    repository.tables.all(),
    repository.rows.all(),
    repository.groups.all(),
    repository.rules.all(),
    repository.views.all(),
    repository.modules.all(),
    repository.roles.all(),
    repository.constraintDefs.all(),
    repository.discoveredRules.all(),
    repository.priceLevels.all(),
  ])
  const rows: Record<string, RowData[]> = {}
  for (const entity of entities) rows[entity.id] = []
  for (const row of allRows) (rows[row.entityId] ??= []).push(row)
  for (const list of Object.values(rows)) list.sort(rowOrder)
  const priceLevels: Record<string, PriceLevel[]> = {}
  /* the filed ladder wins; a table that declares one and has no record
     yet (a table made before the Levels screen filed it) still reads */
  for (const entity of entities) {
    if (entity.priceLevels && entity.priceLevels.length > 0) {
      priceLevels[entity.id] = entity.priceLevels
    }
  }
  for (const ladder of ladders) priceLevels[ladder.tableId] = ladder.levels
  return {
    orgId: repository.orgId,
    version: meta?.packVersion ?? null,
    from: 'repository',
    business: meta?.packName ?? null,
    tables: byIdMap(entities),
    rows,
    index: indexRows(rows),
    groups: byIdMap(groups),
    rules: byIdMap(rules),
    views: byIdMap(views),
    modules: byIdMap(modules),
    roles: byIdMap(roles),
    constraintDefs,
    discoveredRules,
    priceLevels,
  }
}

const isPack = (source: CatalogueSource): source is PackSource => 'entities' in source

/* ---------------------------------------------------------- */
/* The store                                                   */
/* ---------------------------------------------------------- */

export interface CatalogueStoreOptions {
  /** the clock, injected: a store never reaches for `Date` in a test */
  now?: () => string
  /** who, when the session has a name */
  by?: () => string | undefined
  /** the write-behind interval; 0 writes on the next tick */
  writeBehindMs?: number
}

export function createCatalogueStore(options: CatalogueStoreOptions = {}): CatalogueStore {
  const now = options.now ?? (() => new Date().toISOString())
  const who = options.by ?? (() => undefined)
  const wait = options.writeBehindMs ?? WRITE_BEHIND_MS

  let repository: CatalogueRepository | null = null
  const listeners = new Set<AppliedListener>()
  let undoStack: UndoEntry[] = []
  let redoStack: UndoEntry[] = []

  /* -- write-behind ------------------------------------------ */

  /** THE SHEET AS THE REPOSITORY LAST SAW IT. A flush hands over only
   *  the maps whose identity moved since; the repository then writes
   *  only the records whose identity moved inside them. */
  let written: CatalogueData | null = null
  let owed = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let writing: Promise<void> = Promise.resolve()

  const writeNow = (store: CatalogueStore): Promise<void> => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    if (!owed) return writing
    owed = false
    const repo = repository
    const prev = written
    if (!repo || !prev) return writing
    const next = dataOf(store.getState())
    writing = writing
      .then(async () => {
        if (prev.tables !== next.tables) await repo.tables.saveAll(Object.values(next.tables))
        if (prev.rows !== next.rows) await repo.rows.saveAll(Object.values(next.rows).flat())
        if (prev.groups !== next.groups) await repo.groups.saveAll(Object.values(next.groups))
        if (prev.rules !== next.rules) await repo.rules.saveAll(Object.values(next.rules))
        if (prev.views !== next.views) await repo.views.saveAll(Object.values(next.views))
        if (prev.modules !== next.modules) await repo.modules.saveAll(Object.values(next.modules))
        if (prev.roles !== next.roles) await repo.roles.saveAll(Object.values(next.roles))
        if (prev.constraintDefs !== next.constraintDefs) {
          await repo.constraintDefs.saveAll(next.constraintDefs)
        }
        if (prev.discoveredRules !== next.discoveredRules) {
          await repo.discoveredRules.saveAll(next.discoveredRules)
        }
        /* A LADDER IS ONE RECORD PER TABLE, and the store holds the
           list rather than the record, so the record is written per
           ladder that moved — never rebuilt for the fifty that did
           not, which would hand the ledger fifty new objects. */
        if (prev.priceLevels !== next.priceLevels) {
          const stamp = now()
          for (const [tableId, levels] of Object.entries(next.priceLevels)) {
            if (prev.priceLevels[tableId] === levels) continue
            await repo.priceLevels.put({
              id: tableId,
              orgId: repo.orgId,
              tableId,
              levels,
              updatedAt: stamp,
            })
          }
          for (const tableId of Object.keys(prev.priceLevels)) {
            if (!(tableId in next.priceLevels)) await repo.priceLevels.delete(tableId)
          }
        }
        written = next
      })
      .catch((error: unknown) => {
        /* A SHEET THAT DID NOT SAVE SAYS SO. Everything on screen is
           right; what is not on disk is what was changed since the
           last save, and the next flush will try the same difference
           again because `written` did not move. */
        owed = true
        store.setState({
          problem:
            error instanceof Error
              ? `This browser would not keep the change to the sheet: ${error.message}. What is on screen is right; it is not on disk yet.`
              : 'This browser would not keep the change to the sheet. What is on screen is right; it is not on disk yet.',
        })
      })
    return writing
  }

  const writeSoon = (store: CatalogueStore): void => {
    owed = true
    if (!repository) return
    if (wait <= 0) {
      void writeNow(store)
      return
    }
    if (timer !== undefined) return
    timer = setTimeout(() => {
      timer = undefined
      void writeNow(store)
    }, wait)
  }

  /* -- the store --------------------------------------------- */

  const store: CatalogueStore = createStore<CatalogueState>()((set, get) => {
    const announce = (said: string, e: CatalogueEvent): void => {
      const applied: Applied = { said, event: e, undoable: undoStack.length > 0 }
      /* A COPY, AND IT IS NOT SPARE — a listener may unsubscribe from
         inside its own call, and mutating a Set while iterating it
         skips the neighbour. */
      for (const listener of Array.from(listeners)) listener(applied)
    }

    const keep = (e: CatalogueEvent): void => {
      set({ events: [...get().events, e].slice(-EVENTS_KEPT) })
    }

    /**
     * Run one command against the sheet and file what it did.
     *
     * `restamp` REWRITES THE EVENT'S KIND AND ITS LABEL, and only for
     * the two directions of travel: a command cannot know whether it
     * is being run forward or backwards, and the audit wants to know
     * that this one was a WAY BACK and which step it reverses. The
     * label is prefixed rather than replaced — "Undone — Column
     * retyped · Boats" — so the words the step carried are still the
     * words the note says.
     */
    const run = (
      command: CatalogueCommand,
      restamp?: { kind: 'undone' | 'redone'; undoes: string; said: string },
    ): Outcome => {
      const state = get()
      if (state.status !== 'ready') return { refused: NOT_READY }
      const outcome = applyCommand(dataOf(state), command, now(), who())
      if (!isDone(outcome)) return outcome
      let { event, said } = outcome
      if (restamp) {
        said = `${restamp.kind === 'undone' ? 'Undone' : 'Redone'} — ${restamp.said}`
        event = { ...event, kind: restamp.kind, undoes: restamp.undoes, said }
      }
      set({ ...outcome.next })
      keep(event)
      writeSoon(store)
      return { ...outcome, event, said }
    }

    const push = (stack: UndoEntry[], entry: UndoEntry): UndoEntry[] =>
      [...stack, entry].slice(-UNDO_DEPTH)

    return {
      ...emptySheet(),
      status: 'empty',
      problem: null,
      events: [],

      load: async (source, loadOptions = {}) => {
        set({ status: 'loading', problem: null })
        /* A LOAD IS NOT A STEP — see the header */
        undoStack = []
        redoStack = []
        try {
          const data = isPack(source) ? fromPack(source) : await fromRepository(source)
          repository =
            loadOptions.writeTo ??
            (isPack(source)
              ? data.orgId === null
                ? null
                : repositories(data.orgId).catalogue
              : source)
          written = data
          owed = false
          set({ ...data, status: 'ready', problem: null, events: [] })
        } catch (error) {
          /* a failed load leaves NOTHING behind: showing the previous
             sheet under a failure would be showing it as current */
          repository = null
          written = null
          set({
            ...emptySheet(),
            status: 'failed',
            problem: error instanceof Error ? error.message : String(error),
            events: [],
          })
        }
      },

      apply: (command) => {
        const outcome = run(command)
        if (!isDone(outcome)) return outcome
        undoStack = push(undoStack, {
          eventId: outcome.event.id,
          said: outcome.said,
          label: outcome.event.label,
          command: outcome.inverse,
        })
        /* ANY NEW CHANGE CLEARS REDO. Everyone expects it; nobody
           says it. */
        redoStack = []
        announce(outcome.said, outcome.event)
        return outcome
      },

      undo: (eventId) => {
        const entry = undoStack[undoStack.length - 1]
        if (!entry) return { refused: NOTHING_TO_UNDO }
        /* THE PRESS IS PINNED TO THE STEP IT WAS OFFERED FOR. A toast
           still on screen after somebody has done something else must
           not undo that something else. */
        if (eventId !== undefined && entry.eventId !== eventId) return { refused: STEP_MOVED_ON }

        const outcome = run(entry.command, {
          kind: 'undone',
          undoes: entry.eventId,
          said: entry.said,
        })
        if (!isDone(outcome)) {
          /* AN INVERSE THAT FOUND NOTHING TO DO IS STILL THE STEP
             DONE WITH: the row it would have put back was put back
             by hand, and leaving the entry on the stack would offer
             the same nothing again. */
          if (outcome.refused === '') undoStack = undoStack.slice(0, -1)
          return outcome
        }
        undoStack = undoStack.slice(0, -1)
        redoStack = push(redoStack, {
          eventId: outcome.event.id,
          said: entry.said,
          label: entry.label,
          command: outcome.inverse,
        })
        announce(outcome.said, outcome.event)
        return outcome
      },

      redo: () => {
        const entry = redoStack[redoStack.length - 1]
        if (!entry) return { refused: NOTHING_TO_REDO }
        const outcome = run(entry.command, {
          kind: 'redone',
          undoes: entry.eventId,
          said: entry.said,
        })
        if (!isDone(outcome)) {
          if (outcome.refused === '') redoStack = redoStack.slice(0, -1)
          return outcome
        }
        redoStack = redoStack.slice(0, -1)
        undoStack = push(undoStack, {
          eventId: outcome.event.id,
          said: entry.said,
          label: entry.label,
          command: outcome.inverse,
        })
        announce(outcome.said, outcome.event)
        return outcome
      },

      undoable: () => undoStack[undoStack.length - 1] ?? null,
      undoStack: () => undoStack,
      redoStack: () => redoStack,

      onApplied: (listener) => {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },

      flush: () => writeNow(store),
    }
  })

  /* ============================================================
     THE TAB GOING AWAY. Guarded, so a node suite runs; hooked once
     per store, because a second listener per call is a leak with a
     nice name — see `state/quotes.ts`, which this mirrors.
     ============================================================ */
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('pagehide', () => {
      void store.getState().flush()
    })
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void store.getState().flush()
    })
  }

  return store
}

/** The app's catalogue. */
export const catalogue: CatalogueStore = createCatalogueStore()
