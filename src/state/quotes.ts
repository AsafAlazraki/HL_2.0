import { createStore, type StoreApi } from 'zustand/vanilla'
import type { QuoteDef, QuoteEvent } from '@/domain/model'
import {
  apply as applyCommand,
  isDone,
  ISSUED_REFUSAL,
  type Outcome,
  type QuoteCommand,
} from '@/domain/quote/commands'
import { newestFirst, type QuoteRepository } from '@/data/repository'
import { repositories } from '@/data'

/* ============================================================
   THE QUOTES STORE — one command log per document, with inverses
   and events.

   WHERE THE OLD ONE LIVED AND WHY IT COULD NOT STAY. The file this
   replaces held every quote in module state and wrote them to
   localStorage under `helmlogic.quotes.v1:<org>`, and its own header
   argued for that: "A view definition lost on reload costs a person
   one drag. A QUOTE lost on reload is a document a customer was
   promised." The argument is kept and the mechanism is not. Quotes
   go through `QuoteRepository` now — one document per row, so the
   Postgres adapter of Milestone 6 never joins — and QUOTES NEVER
   TOUCH localStorage. `prefs` is the only module that may.

   WHAT THIS FILE IS RESPONSIBLE FOR, AND WHAT IT IS NOT.

     · IT IS NOT the rules. Every rule about what a change does, what
       the way back is and what the sentence says lives in
       `domain/quote/commands.ts`, which is pure and tested without a
       store. This file holds documents, calls `apply`, and writes.
     · IT IS NOT the toast. The shell raises the note and pins its
       UNDO to the entry `onApplied` names. Nothing here imports
       sonner, and nothing here knows what a toast is — a store that
       drew would be a store that could not be tested in node.

   THE THREE PROMISES IT KEEPS

   1. AN ISSUED QUOTE REFUSES, WITH A SENTENCE. `apply` in the domain
      is the line that makes it true; this returns the sentence so a
      caller prints it where the act was attempted, rather than
      quietly doing nothing — which is what production did, while
      toasting "Saved".

   2. THE WAY BACK IS PINNED TO THE STEP IT CAME FROM. The old file
      explained, at length, why it could not use the app's own undo
      helper: that helper pinned a `HistoryEntry` off the project
      store's `past`, and a quote is not in that stack, so the toast
      would have offered to undo a column rename instead. Here the
      inverse the command handed back is pushed onto THIS DOCUMENT'S
      stack, and `undo(id, eventId)` refuses when the top of the
      stack is no longer that step. A toast whose UNDO does not undo
      is worse than no toast.

   3. THE 400 ms A PERSON COULD STILL LOSE IS CLOSED — at 300 ms now,
      the interval the plan names. Write-behind stops the customer's
      name being written once per keystroke; the pending write is
      forced out when the page goes away, because closing the tab is
      exactly what a person does when they have just made the last
      pick and are done. `pagehide` AND NOT `beforeunload`: pagehide
      is the one that fires on mobile Safari, and beforeunload
      additionally suppresses the back/forward cache.
      `visibilitychange` is the second half of the pair, because a
      hidden tab can be killed by the OS without pagehide ever
      running.
   ============================================================ */

/** How many steps back one document keeps. The same fifty the
 *  catalogue's history keeps, and for the same reason: fifty is past
 *  anything a person holds in their head, and it bounds the memory. */
export const UNDO_DEPTH = 50

/** The write-behind interval. Long enough that typing a name is one
 *  write, short enough that nothing is owed for long. */
export const WRITE_BEHIND_MS = 300

/** One step back on one document. `eventId` is what a toast's UNDO
 *  is pinned to: press it after somebody else has changed the
 *  document and this is no longer the top of the stack, and the
 *  press is refused with a sentence rather than undoing the wrong
 *  thing. */
export interface UndoEntry {
  eventId: string
  /** the sentence the step said when it happened */
  said: string
  command: QuoteCommand
}

/** What a surface is told the moment a command lands. It carries the
 *  sentence and the step, and nothing about how either is drawn. */
export interface Applied {
  quoteId: string
  said: string
  event: QuoteEvent
  /** true when this document has a step to go back to */
  undoable: boolean
}

export type AppliedListener = (applied: Applied) => void

export interface QuotesState {
  /** every quote of this organisation, newest first */
  quotes: QuoteDef[]
  /** the sentence when the repository refused, or null */
  problem: string | null
  /** true once a repository has been opened and read */
  loaded: boolean

  /** one document, or undefined */
  get(id: string): QuoteDef | undefined
  /** every quote addressed to one row of the register, newest first */
  forCustomer(rowId: string): QuoteDef[]
  /** the draft already standing for this row with nobody named on it */
  unaddressedDraftFor(tableId: string, rowId: string): QuoteDef | undefined

  /** read the repository and hold it for write-through */
  open(repository: QuoteRepository): Promise<void>
  /** the same, choosing the adapter through `src/data` */
  openFor(orgId: string): Promise<void>

  /** put a minted document in, with the event that minted it */
  file(quote: QuoteDef, event: QuoteEvent): void
  /** change one document; refuses an issued one with the sentence */
  apply(quoteId: string, command: QuoteCommand): Outcome
  /** take the last step back. `eventId` pins the press to a step. */
  undo(quoteId: string, eventId?: string): Outcome
  /** put an undone step back again */
  redo(quoteId: string): Outcome
  /** what the next step back would be called, or null */
  undoable(quoteId: string): UndoEntry | null

  /** throw away a draft nobody wants. An issued quote is never
   *  deleted: it was given to a customer, and a document that can
   *  vanish cannot answer "what did we quote them?" a month later. */
  discard(quoteId: string): Outcome

  /** tell me when a command lands; returns the way to stop listening */
  onApplied(listener: AppliedListener): () => void

  /** force every pending write out now */
  flush(): Promise<void>
}

export type QuotesStore = StoreApi<QuotesState>

/* ---------------------------------------------------------- */
/* Sentences                                                  */
/* ---------------------------------------------------------- */

/** Said where the act was attempted, never as a disabled control. */
export const GONE = 'That quote is no longer here.'
export const NOTHING_TO_UNDO = 'There is nothing to go back to on this quote.'
export const NOTHING_TO_REDO = 'There is nothing to put back on this quote.'
/** The pinned UNDO, pressed after the document moved on. */
export const STEP_MOVED_ON =
  'Something else has happened on this quote since, so that step is no longer the one to go back on.'
export const ISSUED_NEVER_DELETED =
  'This quote has been given to the customer, so it stays. Make a new version if the deal has changed.'

/* ---------------------------------------------------------- */
/* The store                                                   */
/* ---------------------------------------------------------- */

export interface QuotesStoreOptions {
  /** the clock, injected: a store never reaches for `Date` in a test */
  now?: () => string
  /** who, as the document prints it, when the session has a name */
  by?: () => string | undefined
  /** the write-behind interval; 0 writes on the next tick */
  writeBehindMs?: number
}

export function createQuotesStore(options: QuotesStoreOptions = {}): QuotesStore {
  const now = options.now ?? (() => new Date().toISOString())
  const who = options.by ?? (() => undefined)
  const wait = options.writeBehindMs ?? WRITE_BEHIND_MS

  let repository: QuoteRepository | null = null
  const listeners = new Set<AppliedListener>()
  /** the two stacks, per document */
  const undoStacks = new Map<string, UndoEntry[]>()
  const redoStacks = new Map<string, UndoEntry[]>()

  /* -- write-behind ------------------------------------------ */

  /** documents owed to the repository, by id */
  const owed = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | undefined
  let writing: Promise<void> = Promise.resolve()

  const writeNow = (store: QuotesStore): Promise<void> => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    const ids = [...owed]
    owed.clear()
    if (!repository || ids.length === 0) return writing
    const repo = repository
    const state = store.getState()
    writing = writing
      .then(async () => {
        for (const id of ids) {
          const quote = state.quotes.find((q) => q.id === id)
          /* GONE MEANS DELETED, not skipped: a draft discarded while
             a write was owed must not be written back by the write
             it was discarded during. */
          if (quote) await repo.put(quote)
          else await repo.delete(id)
        }
      })
      .catch((error: unknown) => {
        /* A DOCUMENT THAT DID NOT SAVE SAYS SO. A person who is told
           nothing assumes their quote is safe, and every figure on it
           is already in memory — so the sentence is the honest thing
           to offer, not a silent retry loop. */
        store.setState({
          problem:
            error instanceof Error
              ? `This browser would not save these quotes: ${error.message}. Print anything you need before closing the tab.`
              : 'This browser would not save these quotes. Print anything you need before closing the tab.',
        })
      })
    return writing
  }

  const writeSoon = (store: QuotesStore, id: string): void => {
    owed.add(id)
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

  const store: QuotesStore = createStore<QuotesState>()((set, get) => {
    const put = (quote: QuoteDef): void => {
      const rest = get().quotes.filter((q) => q.id !== quote.id)
      set({ quotes: newestFirst([...rest, quote]) })
      writeSoon(store, quote.id)
    }

    const announce = (quoteId: string, said: string, e: QuoteEvent): void => {
      const applied: Applied = {
        quoteId,
        said,
        event: e,
        undoable: (undoStacks.get(quoteId)?.length ?? 0) > 0,
      }
      /* A COPY, AND IT IS NOT SPARE. A listener may unsubscribe from
         inside its own call — a toast that dismisses itself does
         exactly that — and mutating a Set while iterating it skips
         the neighbour. The old bus took the same copy for the same
         reason. */
      const waiting = Array.from(listeners)
      for (const listener of waiting) listener(applied)
    }

    /**
     * Run one command against one document and file what it did.
     *
     * `restamp` REWRITES THE EVENT'S KIND, and only for the two
     * directions of travel. `domain/quote/commands` mints the event a
     * command naturally makes — an inverse of "line added" honestly
     * mints "line removed" — and the audit additionally wants to know
     * that this one was a WAY BACK and which step it reverses. That is
     * `QuoteEventKind`'s own `undone` / `redone` with `undoes`, and it
     * is knowledge the store has and the command does not: a command
     * cannot know whether it is being run forward or backwards.
     */
    const run = (
      quoteId: string,
      command: QuoteCommand,
      restamp?: { kind: 'undone' | 'redone'; undoes: string },
    ): Outcome => {
      const quote = get().quotes.find((q) => q.id === quoteId)
      if (!quote) return { refused: GONE }

      const stamp = now()
      const outcome = applyCommand(quote, command, stamp, who())
      if (!isDone(outcome)) return outcome

      let { next, event } = outcome
      if (restamp) {
        event = { ...event, kind: restamp.kind, undoes: restamp.undoes }
        next = { ...next, events: [...next.events.slice(0, -1), event] }
      }
      put(next)
      return { ...outcome, next, event }
    }

    const pushUndo = (quoteId: string, entry: UndoEntry): void => {
      const stack = [...(undoStacks.get(quoteId) ?? []), entry].slice(-UNDO_DEPTH)
      undoStacks.set(quoteId, stack)
    }

    return {
      quotes: [],
      problem: null,
      loaded: false,

      get: (id) => get().quotes.find((q) => q.id === id),

      /* IT MATCHES ON THE ID, NEVER ON THE NAME, because two people
         called R. Kelleher are two customers and one person who
         changed their name is still one. A quote addressed to a typed
         name has no id and therefore no history; that is honest
         rather than a gap — nothing in this app ever knew those were
         the same person. */
      forCustomer: (rowId) =>
        rowId === '' ? [] : get().quotes.filter((q) => q.customerRef?.rowId === rowId),

      /* THE PICKER ASKS FIRST. Stepping back from the configurator to
         the picker and forward again used to mint a SECOND quote for
         the same boat and strand the first, with the salesperson's
         work on the screen they had just left. A draft is offered
         back when it is for the same row of the same table and NOBODY
         HAS BEEN NAMED ON IT: an addressed quote is a deal in
         progress and a second quote for the same hull to a different
         customer is an ordinary Tuesday. `issued` is never offered
         back — it is a photograph and takes no edits. THE NEWEST
         WINS, which is what the list is already sorted by. */
      unaddressedDraftFor: (tableId, rowId) => {
        if (tableId === '' || rowId === '') return undefined
        return get().quotes.find(
          (q) =>
            q.state === 'draft' &&
            q.rootTableId === tableId &&
            q.rootRowId === rowId &&
            q.customer.name.trim() === '',
        )
      },

      open: async (repo) => {
        repository = repo
        try {
          const list = await repo.list()
          set({ quotes: newestFirst(list), loaded: true, problem: null })
        } catch (error) {
          set({
            quotes: [],
            loaded: true,
            problem:
              error instanceof Error
                ? `Saved quotes could not be read back, and were left alone: ${error.message}`
                : 'Saved quotes could not be read back, and were left alone.',
          })
        }
      },

      openFor: async (orgId) => {
        await get().open(repositories(orgId).quotes)
      },

      file: (quote, event) => {
        /* THE EVENT THAT MADE IT IS KEPT ON IT. `domain/quote/commands`
           promises that a minted or versioned document "carries the
           first event, because a document with no history of how it
           began is a document whose audit starts in the middle", and
           `freeze.ts` leaves `events: []` on the mint because "the
           mint's own event is written by the command that called
           this, beside the inverse it pushes" — which is here, and
           until 2026-09-22 this put the document away without it. So
           every document filed through the picker, the configurator's
           new version and the register's carried an empty diary until
           a command touched it, and a reader over `events[].at` could
           not see the day a quote was started at all. Kept once: a
           caller that already wrote it onto the document is not
           given a second copy. */
        const kept = quote.events.some((e) => e.id === event.id)
          ? quote
          : { ...quote, events: [...quote.events, event] }
        put(kept)
        /* A MINT HAS NO WAY BACK ON THIS DOCUMENT. Undoing a document
           into existence is discarding it, which is its own act with
           its own refusal — see `discard`. */
        announce(kept.id, event.said, event)
      },

      apply: (quoteId, command) => {
        const outcome = run(quoteId, command)
        if (!isDone(outcome)) return outcome
        pushUndo(quoteId, {
          eventId: outcome.event.id,
          said: outcome.said,
          command: outcome.inverse,
        })
        /* ANY NEW CHANGE CLEARS REDO. Everyone expects it; nobody
           says it. */
        redoStacks.delete(quoteId)
        announce(quoteId, outcome.said, outcome.event)
        return outcome
      },

      undo: (quoteId, eventId) => {
        /* WHICH DOCUMENT OUTRANKS WHICH STEP. A quote thrown away
           while its note was still on screen is gone, not stepless,
           and "There is nothing to go back to" would be the wrong
           answer to the right question — a person who discarded a
           draft needs to be told that is what happened. */
        if (!get().quotes.some((q) => q.id === quoteId)) return { refused: GONE }
        const stack = undoStacks.get(quoteId) ?? []
        const entry = stack[stack.length - 1]
        if (!entry) return { refused: NOTHING_TO_UNDO }
        /* THE PRESS IS PINNED TO THE STEP IT WAS OFFERED FOR. A toast
           still on screen after somebody has done something else must
           not undo that something else. */
        if (eventId !== undefined && entry.eventId !== eventId) {
          return { refused: STEP_MOVED_ON }
        }

        const outcome = run(quoteId, entry.command, {
          kind: 'undone',
          undoes: entry.eventId,
        })
        if (!isDone(outcome)) return outcome

        undoStacks.set(quoteId, stack.slice(0, -1))
        const redo = [
          ...(redoStacks.get(quoteId) ?? []),
          { eventId: outcome.event.id, said: outcome.said, command: outcome.inverse },
        ].slice(-UNDO_DEPTH)
        redoStacks.set(quoteId, redo)
        announce(quoteId, outcome.said, outcome.event)
        return outcome
      },

      redo: (quoteId) => {
        if (!get().quotes.some((q) => q.id === quoteId)) return { refused: GONE }
        const stack = redoStacks.get(quoteId) ?? []
        const entry = stack[stack.length - 1]
        if (!entry) return { refused: NOTHING_TO_REDO }

        const outcome = run(quoteId, entry.command, {
          kind: 'redone',
          undoes: entry.eventId,
        })
        if (!isDone(outcome)) return outcome

        redoStacks.set(quoteId, stack.slice(0, -1))
        pushUndo(quoteId, {
          eventId: outcome.event.id,
          said: outcome.said,
          command: outcome.inverse,
        })
        announce(quoteId, outcome.said, outcome.event)
        return outcome
      },

      undoable: (quoteId) => {
        const stack = undoStacks.get(quoteId) ?? []
        return stack[stack.length - 1] ?? null
      },

      discard: (quoteId) => {
        const quote = get().quotes.find((q) => q.id === quoteId)
        if (!quote) return { refused: GONE }
        if (quote.state !== 'draft') return { refused: ISSUED_NEVER_DELETED }
        set({ quotes: get().quotes.filter((q) => q.id !== quoteId) })
        undoStacks.delete(quoteId)
        redoStacks.delete(quoteId)
        writeSoon(store, quoteId)
        return { refused: '' }
      },

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
     THE TAB GOING AWAY.

     GUARDED, so a node suite runs. `src/state` may touch the DOM —
     `src/domain` may not — but a store that assumed a window would
     throw on import under vitest, and a store nobody can test in
     node is a store nobody tests.

     HOOKED ONCE PER STORE, because a second listener per call is a
     leak with a nice name. Nothing is unhooked: the app has one
     quotes store and it lives as long as the page does.
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

/** The app's quotes. Opened by the shell against the organisation it
 *  signed in to; a test makes its own with its own clock. */
export const quotes: QuotesStore = createQuotesStore()

/** Re-exported so a caller that only holds this store can print the
 *  refusal without reaching into the domain for the wording. */
export { ISSUED_REFUSAL }
