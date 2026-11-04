/* ============================================================
   io/brought — EVERY WORKBOOK BROUGHT IN ON THIS COMPUTER, AND WHAT
   WAS DONE WITH IT.

   The shelf's judge (docs/directions/data-round/shelf/judge.md, item
   6): the screen never said which price list this computer holds, and
   the applied step lived in memory and was forgotten on reload. This is
   the account a person reads on the shelf's rest page: the file, its
   size, the day the file says it was saved on this computer, the day it
   was read, who was at the desk, what it offered, and what became of
   it — applied (and how many of its changes), put back by Undo, or
   only read. Clearing the price list is an entry too, because from then
   on nothing brought in before it is on the price list.

   KEPT AS ONE PREF (DECISIONS 2026-11-04): it is this computer's own
   account, like the day the last copy was saved beside it; a Dexie
   table of its own lost to that, because nothing but the shelf reads it
   and a copy brought back does not need it. Forgetting everything
   forgets it with the rest.

   Pure: the list is handed in and a new list handed back.
   ============================================================ */

export type BroughtNow = 'read' | 'applied' | 'put-back' | 'cleared'

export interface BroughtNote {
  /** unique: the moment it was read, and the file */
  id: string
  /** the file's own name; empty for a clear */
  file: string
  bytes: number
  /** ISO: when the file says it was last saved on this computer, or null when it does not */
  saved: string | null
  /** ISO: when it was read here */
  read: string
  /** who was at the desk */
  by: string | null
  changes: number
  adding: number
  cannot: number
  now: BroughtNow
  /** how many changes Apply wrote (fewer than offered when lines were left out) */
  applied: number | null
  /** ISO: when it was applied, or put back, or the price list cleared */
  at: string | null
}

/** The most an account keeps; the oldest goes first. */
export const KEEP = 40

const isNote = (v: unknown): v is BroughtNote => {
  if (typeof v !== 'object' || v === null) return false
  const n = v as Record<string, unknown>
  return (
    typeof n.id === 'string' &&
    typeof n.file === 'string' &&
    typeof n.read === 'string' &&
    typeof n.now === 'string' &&
    ['read', 'applied', 'put-back', 'cleared'].includes(n.now as string)
  )
}

/** The account as kept, newest first; anything that does not read as one is left out, not repaired. */
export function notesOf(kept: unknown): BroughtNote[] {
  if (!Array.isArray(kept)) return []
  return kept.filter(isNote).toSorted((a, b) => b.read.localeCompare(a.read))
}

export function noteRead(
  notes: readonly BroughtNote[],
  n: Omit<BroughtNote, 'id' | 'now' | 'applied' | 'at'>,
): { notes: BroughtNote[]; id: string } {
  const id = `${n.read}·${n.file}`
  const note: BroughtNote = { ...n, id, now: 'read', applied: null, at: null }
  return { notes: [note, ...notes.filter((x) => x.id !== id)].slice(0, KEEP), id }
}

const changed = (
  notes: readonly BroughtNote[],
  id: string,
  change: Partial<BroughtNote>,
): BroughtNote[] => notes.map((n) => (n.id === id ? { ...n, ...change } : n))

export const noteApplied = (
  notes: readonly BroughtNote[],
  id: string,
  applied: number,
  at: string,
): BroughtNote[] => changed(notes, id, { now: 'applied', applied, at })

export const notePutBack = (notes: readonly BroughtNote[], id: string, at: string): BroughtNote[] =>
  changed(notes, id, { now: 'put-back', at })

export function noteCleared(
  notes: readonly BroughtNote[],
  at: string,
  by: string | null,
): BroughtNote[] {
  const note: BroughtNote = {
    id: `${at}·clear`,
    file: '',
    bytes: 0,
    saved: null,
    read: at,
    by,
    changes: 0,
    adding: 0,
    cannot: 0,
    now: 'cleared',
    applied: null,
    at,
  }
  return [note, ...notes].slice(0, KEEP)
}

/**
 * WHAT IS ON THE PRICE LIST SINCE IT CAME WITH THE APP: every workbook applied and not put back,
 * since the last clear, oldest first. Empty is the price list as it came.
 */
export function appliedSince(notes: readonly BroughtNote[]): BroughtNote[] {
  const out: BroughtNote[] = []
  for (const n of notes) {
    if (n.now === 'cleared') break
    if (n.now === 'applied') out.push(n)
  }
  return out.reverse()
}
