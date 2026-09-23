import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { FinderRow } from '@/domain/shell/finder'

/* ============================================================
   THE SCOPE CHIP — how ONE Ctrl K serves a screen that already had a
   field of its own.

   THE COLLISION, MEASURED BEFORE THE SHELL WAS DRAWN. Two screens
   bound Ctrl K to their own search: `Home.tsx` (the desk's field) and
   `Configurator.tsx` (the field that reaches every chapter of a
   build). `docs/research/refs/shell/notes.md` §0.3 counted them and
   §2 names the reference that settles it: Linear's 2019 command menu
   prints what it acts on as a CHIP above the field — `Issue · LIN-1615
   Changelog` — and GitHub's palette does the same. So the finder takes
   the key everywhere, and on those two screens it opens with that
   screen's own rows first, under a chip naming what it is scoped to.
   Neither screen loses its field: each keeps `/`, which is the key
   every other find field in this app already answers to.

   WHY A CONTEXT AND NOT A FIFTH STORE. CLAUDE.md declares four stores
   and names them; a scope is not state the app keeps, it is one
   screen telling the surface above it what it is looking at while it
   is on screen. It lives exactly as long as the screen does, which is
   what a context is for. A screen rendered with no shell above it —
   every component test in this repository — finds no seat and says
   nothing, so publishing a scope cannot break a screen that is being
   pressed on its own.

   WHAT A SCREEN PUBLISHES IS A MATCHER, NOT ROWS. The finder owns the
   query and the screen owns the content, so handing over a list would
   mean the finder filtering it — a second opinion about what "battery"
   hits, in the one place this app has been most careful to have only
   one. A screen hands over a function of the query, answered by the
   same module the screen's own field answers with.
   ============================================================ */

/** What a screen says about itself while the finder is open on it. */
export interface ShellScope {
  /** the chip: what the finder is scoped to, in the screen's words */
  word: string
  /** the first group's title */
  title: string
  /** one line under it, where the group owes an explanation */
  say?: string
  /** the screen's own answer to what was typed, its own matcher's */
  rows: (query: string) => FinderRow[]
  /** what to do with a row that is not an address — a chapter, a
   *  heading. A row whose target is a real place is opened by the
   *  shell like any other. */
  go?: (id: string) => void
}

interface Seat {
  scope: ShellScope | null
  sit: (scope: ShellScope | null) => void
}

const SCOPE = createContext<Seat | null>(null)

/** The shell's own seat. Mounted once, around the outlet. */
export function ScopeSeat({ children }: { children: ReactNode }) {
  const [scope, sit] = useState<ShellScope | null>(null)
  const seat = useMemo<Seat>(() => ({ scope, sit }), [scope])
  return <SCOPE.Provider value={seat}>{children}</SCOPE.Provider>
}

/** Read by the shell. */
export function useScope(): ShellScope | null {
  return useContext(SCOPE)?.scope ?? null
}

/**
 * Called by a screen that has a field of its own, with a scope it has
 * already memoised — an object minted on every render would sit down
 * and stand up on every keystroke.
 *
 * `null` takes the seat back, which is also what unmounting does.
 */
export function useSetScope(scope: ShellScope | null): void {
  const seat = useContext(SCOPE)
  const sit = seat?.sit
  useEffect(() => {
    if (!sit) return
    sit(scope)
    return () => sit(null)
  }, [sit, scope])
}
