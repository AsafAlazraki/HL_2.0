/* ============================================================
   THE SHELF — a short list a business keeps between sessions,
   behind a seam a pure module may hold.

   TWO MODULES IN THIS FOLDER KEEP ONE. `mapMemory` keeps the column
   mappings a person chose for a supplier's block; `evidence` keeps
   the apply-log of the last few merges. Both were written against
   `globalThis.localStorage` directly, with every read and every
   write wrapped in a try/catch because a browser may refuse storage
   outright. Neither may do that here: `src/domain` is pure, and the
   one file in this app allowed to touch the browser's own store is
   `src/state/prefs.ts`.

   SO THE STORE IS HANDED IN, AND THE DEFAULT IS MEMORY. That is not
   a downgrade of what those two files did — under vitest's node
   project there was never a `localStorage` to reach, the `?.` on
   every call returned undefined, and both modules already ran on
   their own in-memory cache. This makes that the declared
   arrangement rather than an accident of the runtime, and leaves the
   browser half to the layer that owns it.

   IT MAY THROW, AND THAT IS PART OF THE CONTRACT. `evidence`'s write
   drops its oldest record and tries again when the drawer is full,
   because the browser's own store throws rather than evicting. A
   shelf that could never refuse would leave that reasoning untested
   in every adapter; the interface therefore says a write may fail,
   and the memory shelf simply never does.
   ============================================================ */

/** Where a kept list lives. One key, one string of text — the same
 *  two calls the browser's own store offers, and nothing else. */
export interface Shelf {
  /** the text under this key, or null when nothing is kept there */
  read(key: string): string | null
  /** keep this text under this key. May throw when there is no room. */
  write(key: string, text: string): void
}

/** A shelf in this process's memory. It forgets everything when the
 *  process does, which is the honest behaviour for a test and for a
 *  server; a browser passes one backed by its own store. */
export function memoryShelf(): Shelf {
  const held = new Map<string, string>()
  return {
    read: (key) => held.get(key) ?? null,
    write: (key, text) => {
      held.set(key, text)
    },
  }
}

let current: Shelf = memoryShelf()

/** The shelf the io modules keep their lists on. */
export const shelf = (): Shelf => current

/** Hand them a different one — the browser's own store at start-up,
 *  a fresh memory shelf between two suites. */
export function setShelf(next: Shelf): void {
  current = next
}
