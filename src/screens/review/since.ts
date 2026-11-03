import { useEffect, useMemo, useState } from 'react'
import manifestRaw from '../../../data/northside/manifest.json?raw'
import type { EntityDef, RowData } from '@/domain/model'
import { review } from '@/domain/rules/review/checks'
import { queueOf, type Case } from '@/domain/rules/review/cases'
import { listsWrittenSince, sinceTheFile, worldAsFiled } from '@/domain/rules/review/since'

/* ============================================================
   WHAT IS NEW, AND WHAT WAS SETTLED, SINCE THE PRICE FILE (J11) — the
   screen's half of `src/domain/rules/review/since.ts`.

   The lists written on this computer since the file was packed are
   fetched as the file carries them, once each for the life of the tab
   (the file does not change under a running app), the queue is found
   on them, and the two queues compared. A list as the file packed it
   is never fetched, so a computer that changed nothing reads nothing
   over the network. Where the file cannot be fetched, the screen says
   so and marks nothing — never a guess.

   The file's own count of each list rides in the bundle (the manifest,
   as src/screens/data/file.ts reads it), so a deleted line is seen
   without a fetch.
   ============================================================ */

/** The Master Price File as it was packed: its lists' definitions, and one list's lines. */
export interface FileOf {
  entities: () => Promise<readonly EntityDef[]>
  rows: (tableId: string) => Promise<readonly RowData[]>
}

function countsOf(raw: string): Record<string, number> | null {
  try {
    const m = JSON.parse(raw) as { tables?: Array<{ id?: unknown; rowCount?: unknown }> }
    const out: Record<string, number> = {}
    for (const t of m.tables ?? [])
      if (typeof t.id === 'string' && typeof t.rowCount === 'number') out[t.id] = t.rowCount
    return Object.keys(out).length > 0 ? out : null
  } catch {
    return null
  }
}

const FILE_COUNTS = countsOf(manifestRaw)

/* ONCE A TAB: the file is the file */
let entitiesRead: Promise<Record<string, EntityDef>> | null = null
const rowsRead = new Map<string, Promise<readonly RowData[]>>()

function readFile(fileOf: FileOf, lists: readonly string[]) {
  entitiesRead ??= fileOf
    .entities()
    .then((all) => Object.fromEntries(all.map((e) => [e.id, e])))
    .catch((error: unknown) => {
      entitiesRead = null
      throw error
    })
  const rows = lists.map((id) => {
    let read = rowsRead.get(id)
    if (!read) {
      read = fileOf.rows(id).catch((error: unknown) => {
        rowsRead.delete(id)
        throw error
      })
      rowsRead.set(id, read)
    }
    return read.then((r) => [id, r] as const)
  })
  return Promise.all([entitiesRead, Promise.all(rows)] as const)
}

export type Since =
  /** nothing on this computer was written since the file: nothing is new, nothing settled */
  | { state: 'same' }
  /** the file is being read */
  | { state: 'reading' }
  /** the file could not be read, so nothing is said */
  | { state: 'unread' }
  | { state: 'read'; settled: Case[]; arrived: Case[]; arrivedKeys: ReadonlySet<string> }

/** What is new and what was settled since the price file, for the cases found now (`all`: every
 *  case, nothing left alone set aside). */
export function useSinceTheFile(
  tables: Readonly<Record<string, EntityDef>>,
  rows: Readonly<Record<string, readonly RowData[]>>,
  packedAt: string | null,
  all: readonly Case[],
  fileOf: FileOf | undefined,
): Since {
  const lists = useMemo(
    () => (packedAt && FILE_COUNTS ? listsWrittenSince(tables, rows, packedAt, FILE_COUNTS) : null),
    [tables, rows, packedAt],
  )
  const listsKey = lists ? lists.join('\u0000') : ''
  const [asFiled, setAsFiled] = useState<{ key: string; queue: Case[] | null } | null>(null)

  useEffect(() => {
    if (!fileOf || !lists || lists.length === 0) return
    let current = true
    readFile(fileOf, lists)
      /* the stage the press moved to paints first; the file's queue is counted after it */
      .then((read) => new Promise<typeof read>((done) => setTimeout(() => done(read), 0)))
      .then(([entities, read]) => {
        if (!current) return
        const filed = worldAsFiled(
          { entities: tables, rowsByEntity: rows },
          { entities, rows: Object.fromEntries(read) },
          lists,
        )
        setAsFiled({ key: listsKey, queue: queueOf(review(filed)) })
      })
      .catch(() => {
        if (current) setAsFiled({ key: listsKey, queue: null })
      })
    return () => {
      current = false
    }
    /* the queue on the file moves only when the set of lists written since does: a second price
       typed on a list already written re-reads nothing */
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the lists written since move the file's queue, not every price typed
  }, [fileOf, listsKey])

  return useMemo((): Since => {
    if (!lists || !fileOf) return { state: 'same' }
    if (lists.length === 0) return { state: 'same' }
    if (!asFiled || asFiled.key !== listsKey) return { state: 'reading' }
    if (!asFiled.queue) return { state: 'unread' }
    const { settled, arrived } = sinceTheFile(asFiled.queue, all)
    return { state: 'read', settled, arrived, arrivedKeys: new Set(arrived.map((c) => c.key)) }
  }, [lists, fileOf, asFiled, listsKey, all])
}
