/* ============================================================
   UNDO — history over the DATA, and over nothing else.

   Lifted out of the old `useProjectStore` with two changes and no
   others: the CLOCK IS INJECTED (a pure module never calls `Date`
   itself) and recording is `commit(op, fn)` rather than `record(op)`,
   so an entry is kept only if the mutation actually ran. Everything
   below this paragraph is the reasoning that shipped.

   WHAT IT COVERS, and why exactly this line. A cell edit committed
   silently and permanently; Ctrl+Z did nothing; the store had no
   history key at all. The rule drawn here is:

     A STEP IS RECORDED WHEN THE ACT DESTROYS SOMETHING A PERSON
     CANNOT SEE ANY MORE.

   Cell edits, add/delete row, add/rename/retype/reorder/delete
   column, add/delete table, and paste — those are the acts where a
   dealership's real price file loses work. Every one of them is
   recorded.

   WHAT IT DELIBERATELY DOES NOT COVER, and why. Where a table sits
   on the blueprint, where a zone sits or how big it is, where a rule
   step sits, what is selected, which stage is open, which section is
   folded. None of those destroy anything: the drawing is on screen,
   and a drag is re-draggable in the second it took to make.
   Recording them is how an undo stack becomes useless — fifty
   entries deep in scroll positions, with the cell edit you actually
   wanted back pushed off the bottom. "Undo" has never meant
   "un-scroll".

   The line held is DESTRUCTION ONLY. Renaming a rule, switching one
   off, retyping a step's config, and dragging a plate or a zone
   around are all out — nothing about them is invisible a second
   later, and a fifty-deep stack full of them is how undo stops being
   worth pressing.

   ONE ACT IS ONE STEP. A paste is forty `updateCell` calls and a
   dozen `addRow`s; deleting eight selected rows is eight
   `deleteRow`s; applying a structure preset is a run of field moves.
   The grouping is done HERE, by noticing that every one of them is a
   single synchronous loop inside one event handler. All the
   recording that happens in one turn of the event loop collapses
   into one entry, closed on the following microtask. A second
   keypress is a second turn, so it is a second step.

   TYPED TEXT IS ALSO ONE STEP. A few surfaces write on every
   keystroke (a table's description box, a column's option list), so
   an op may carry a coalescing `key`: consecutive single-op steps
   with the same key, inside TYPING_MS, fold into the one that is
   already on the stack — which keeps its original `before`, so
   undoing gives back the whole word rather than its last letter.

   THE STACK IS BOUNDED AT 50. Say the number and defend it: fifty
   is past anything a person holds in their head, and it is what
   bounds the memory. The entries are cheap because the state is
   immutable and structurally shared — an entry keeps six object
   references, and the only thing it actually retains is whatever
   that step replaced. A cell edit retains one row array (651
   pointers, ~5 KB); the expensive step is a column retype, which
   rewrites every row object on the table (~130 KB on the largest
   seeded table). Fifty of the worst case is single-digit megabytes
   with a hard ceiling; unbounded history over 651 rows of image
   cells is a leak with a nice name.

   A PROJECT SWAP CLEARS BOTH STACKS. An import, a fresh pack, a
   reset: none of them is a step, they are a DIFFERENT PROJECT.
   Undoing into a project that is no longer open would restore tables
   the views and modules on screen have never heard of, and each swap
   left on the stack would pin a whole previous workbook in memory. A
   new document has no past. `forget()` is that door.

   THE ONE DEFECT THIS PORT FIXES, AND IT IS NAMED IN THE PLAN.
   `record(op)` had to be called BEFORE the mutation — the pre-state
   and the table's name are read at that moment — and it kept the
   entry whether or not the mutation then ran. The old store had a
   guard that could decline a write after the recording ("DECLINED,
   NOT UNSAVED"), so a declined edit left a PHANTOM ENTRY on the
   stack: press Ctrl+Z and the app puts back a change nobody made,
   silently discarding the one before it. `commit(op, fn)` closes it
   by construction: the op is offered, the mutation runs inside, and
   the entry survives only where the data moved.
   ============================================================ */

/** One recorded act, in the words a toast will use. */
export interface Op {
  /** singular form: "Cell edit", "Row deleted" */
  one: string
  /** plural form when a burst held several of exactly this op */
  many?: (n: number) => string
  /** the table it happened in, resolved BEFORE the mutation ran */
  where?: string
  /** set only for per-keystroke writes — see TYPING_MS above */
  key?: string
}

/** One step back. `before` is the data as it stood BEFORE this step,
 *  by reference: the state is immutable, so an entry costs what that
 *  step replaced and nothing else. */
export interface HistoryEntry<S> {
  /** what a person would call it — "40 cell edits · Boats" */
  label: string
  before: S
  /** coalescing identity, or '' for a step that never merges */
  sig: string
  /** when it was recorded, for the typing window */
  at: number
}

export interface HistoryStacks<S> {
  /** oldest first, so the last element is the next step back */
  past: ReadonlyArray<HistoryEntry<S>>
  future: ReadonlyArray<HistoryEntry<S>>
}

/** See the defence above. Fifty steps, hard ceiling. */
export const HISTORY_DEPTH = 50
/** consecutive same-key steps closer together than this are one step */
export const TYPING_MS = 900

/** "Row deleted · Trailers" · "40 cell edits · Boats" · "12 changes" */
export function labelFor(ops: readonly Op[]): string {
  const first = ops[0]
  const where = ops.every((o) => o.where === first.where) ? first.where : undefined
  const body =
    ops.length === 1
      ? first.one
      : ops.every((o) => o.one === first.one) && first.many
        ? first.many(ops.length)
        : `${ops.length} changes`
  return where ? `${body} · ${where}` : body
}

/* ---------------------------------------------------------- */
/* What the engine needs of its host                          */
/* ---------------------------------------------------------- */

/**
 * The four things the engine cannot know: where the data is, how to
 * put it back, where the stacks live, and what time it is.
 *
 * `read` AND `write` ARE A PAIR AND THEY MUST AGREE ABOUT THE SLICE.
 * Whatever `read` returns is what an entry retains and what `write`
 * is handed on the way back, so a host that reads six maps and
 * writes five loses the sixth on every undo — which is exactly the
 * shape of the module-delete bug the old store's own test pinned
 * ("modules IS in the history slice, which is a different fact").
 *
 * `write` IS ALSO WHERE A HOST MENDS WHAT THE SWAP BROKE. A selection
 * must not outlive its subject: undoing "table added" strikes the
 * table the inspector is pointing at, and leaving the id behind is
 * how a panel draws a rectangle with nothing in it. The engine has no
 * opinion about selections, so the host clears its own inside `write`.
 *
 * `now` IS INJECTED because `src/domain` is pure and because the
 * typing window is a real behaviour a test has to be able to drive.
 * It is milliseconds, the same thing `Date.now()` returns.
 *
 * `schedule` CLOSES THE BURST. It defaults to `queueMicrotask`, which
 * is what makes "one turn of the event loop is one step" true; a host
 * that wants a different grouping supplies its own.
 */
export interface HistoryHost<S> {
  read(): S
  write(slice: S): void
  stacks(): HistoryStacks<S>
  setStacks(next: HistoryStacks<S>): void
  now(): number
  schedule?(fn: () => void): void
}

/** NOT GENERIC, and deliberately: nothing a caller does with the
 *  engine hands a slice back. `commit` takes an op and a mutation,
 *  and `undo` / `redo` return the LABEL, because the caller says what
 *  was undone and the host's own `write` already put the data back.
 *  A phantom type parameter here would suggest a slice crosses this
 *  door, and none does. */
export interface History {
  /**
   * Note what is about to happen, do it, and keep the step only if it
   * happened. Returns whether the mutation ran.
   *
   * `op.where` is read by the CALLER before calling, because the name
   * of a table that is about to be deleted cannot be read afterwards.
   */
  commit(op: Op, fn: () => boolean | void): boolean
  /** Reverts the last recorded change and returns its label, so the
   *  caller can SAY what was undone. null when there was nothing. */
  undo(): string | null
  /** Puts back the last undone change; null when there was nothing.
   *  The redo stack is cleared by any new recorded change. */
  redo(): string | null
  /** A swap is not a step — see the header. */
  forget(): void
  /** Close the open burst now rather than on the next microtask. */
  flush(): void
}

/** Two slices that hold the same data. Shallow by key, because every
 *  map in a slice is replaced whole by a mutation that changed
 *  anything inside it — that is what immutable means here — so a key
 *  that still points at the same object is a key nothing touched. */
function unmoved<S>(a: S, b: S): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  const keys = Object.keys(a as object)
  if (keys.length !== Object.keys(b as object).length) return false
  for (const key of keys) {
    if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) return false
  }
  return true
}

export function createHistory<S>(host: HistoryHost<S>): History {
  const schedule = host.schedule ?? ((fn: () => void) => queueMicrotask(fn))

  /** ops recorded so far in the open burst */
  let burstOps: Op[] = []
  /** the data as it stood before the FIRST of them */
  let burstBefore: S | null = null
  /** bumped whenever a burst closes, so a microtask queued for a burst
   *  that has already been flushed by hand finds itself stale */
  let burstSeq = 0

  const closeBurst = (): void => {
    burstSeq += 1
    const before = burstBefore
    const ops = burstOps
    burstBefore = null
    burstOps = []
    if (!before || ops.length === 0) return

    const at = host.now()
    /* only a lone per-keystroke op can continue the step above it */
    const sig = ops.length === 1 ? (ops[0].key ?? '') : ''
    const { past } = host.stacks()
    const top = past[past.length - 1]
    const merge = sig !== '' && top?.sig === sig && at - top.at < TYPING_MS
    const nextPast = merge
      ? [...past.slice(0, -1), { ...top, at }]
      : [...past, { label: labelFor(ops), before, sig, at }].slice(-HISTORY_DEPTH)
    /* ANY new change clears redo. Everyone expects it; nobody says it. */
    host.setStacks({ past: nextPast, future: [] })
  }

  const commit = (op: Op, fn: () => boolean | void): boolean => {
    const opened = burstBefore === null
    const before = opened ? host.read() : burstBefore
    if (opened) {
      burstBefore = before
      const seq = burstSeq
      schedule(() => {
        if (seq === burstSeq) closeBurst()
      })
    }

    const ran = fn()
    /* TWO WAYS TO SAY NOTHING HAPPENED, and both are honest. An act
       that knows it declined says so by returning false; an act that
       merely wrote the value that was already there is caught by the
       slice, which did not move. Either way no op is pushed, and a
       burst this call OPENED is closed again so the next act starts
       clean rather than inheriting a pre-state from an edit that was
       never made. */
    if (ran === false || unmoved(before as S, host.read())) {
      if (opened && burstOps.length === 0) {
        burstSeq += 1
        burstBefore = null
        burstOps = []
      }
      return false
    }

    burstOps.push(op)
    return true
  }

  /** shared by undo and redo: swap the live data for `entry.before`,
   *  hand the current data to the opposite stack. */
  const travel = (dir: 'undo' | 'redo'): string | null => {
    closeBurst() // anything still open belongs on the stack first
    const { past, future } = host.stacks()
    const from = dir === 'undo' ? past : future
    const entry = from[from.length - 1]
    if (!entry) return null
    const mirror: HistoryEntry<S> = { ...entry, before: host.read() }
    const rest = from.slice(0, -1)
    const onto = [...(dir === 'undo' ? future : past), mirror].slice(-HISTORY_DEPTH)

    host.write(entry.before)
    host.setStacks({
      past: dir === 'undo' ? rest : onto,
      future: dir === 'undo' ? onto : rest,
    })
    return entry.label
  }

  return {
    commit,
    undo: () => travel('undo'),
    redo: () => travel('redo'),
    forget: () => {
      burstSeq += 1
      burstOps = []
      burstBefore = null
      host.setStacks({ past: [], future: [] })
    },
    flush: closeBurst,
  }
}
