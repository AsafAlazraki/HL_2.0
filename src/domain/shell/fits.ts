/* ============================================================
   "TRAILER FOR SP560" — the question a dealer asks the finder that
   is not a name.

   Written 2026-09-24 for the critique of Milestone 2's close, #8:
   "`trailer for sp560` answers nothing." Nothing in the file is
   CALLED that. What the dealer is asking is which trailers the price
   file pairs with the SP560, and the file answers it in its trailer
   fitment lists — `Highfield × NSM Custom`, `Highfield × GFAB` —
   which the finder, rightly, never offers as places (a pair is not a
   place: `src/domain/catalogue/search.ts`'s header argues it).

   TWO HALVES, BOTH PURE.

     · `askedForFits` reads the SENTENCE: a kind word — trailer,
       motor, engine, outboard, singular or plural — before or after
       the boat, with the joining words a person uses ("for", "to
       fit", "that fits", "on"). It answers null for anything else,
       and a line that merely CONTAINS "trailer" is anything else.
     · `fitsFor` answers the QUESTION, and it answers it with the
       quote engine's own derivation rather than a second one:
       `relatedRows` over the boat's view block — the same call
       `candidateOffer` makes when the build offers a trailer — so the
       finder can never name a trailer the build would not offer for
       that boat, or miss one it would. Removed pairs, stock no longer
       sold and a retired list are held back there, once, and counted.

   THE VIEW IS READ, NEVER MADE. `createViewFor` files the view it
   makes into the map it is handed, and a finder that wrote a view
   into the catalogue store on a keystroke would be a structural change
   as the side effect of typing. So a stored view is used where the
   dealer has one, and otherwise the blocks `createViewFor` WOULD make
   (`defaultBlocksFor`) are read without keeping them.
   ============================================================ */
import { rowLabel, type EntityDef, type RowData, type ViewDef } from '@/domain/model'
import { joinRefFor, makeEngine, relatedRows } from '@/domain/catalogue/views'
import { defaultBlocksFor } from '@/domain/catalogue/views/relations'

/** The two things a boat is fitted WITH that a dealer asks for by kind. */
export type FitKind = 'trailer' | 'motor'

export interface FitsQuestion {
  kind: FitKind
  /** the kind word as it was typed — "trailers", "engine" */
  word: string
  /** the boat as it was typed, trimmed — "sp560", "the 519 sea ranger" */
  boat: string
}

const KIND_WORDS: Record<string, FitKind> = {
  trailer: 'trailer',
  trailers: 'trailer',
  motor: 'motor',
  motors: 'motor',
  engine: 'motor',
  engines: 'motor',
  outboard: 'motor',
  outboards: 'motor',
}

const KIND = '(trailers?|motors?|engines?|outboards?)'
/* what a person puts between the kind and the boat — longest first,
   so "to fit" is not read as "to" and a boat called "fit" */
const JOIN = '(?:that\\s+fits?|which\\s+fits?|to\\s+fit|fits?|for|on|with)'
const LEAD = /^(?:(?:what|which|show(?:\s+me)?|find|list)\s+)?/i
const BEFORE = new RegExp(`^${KIND}\\s+(?:${JOIN}\\s+)?(?:the\\s+|an?\\s+)?(.+)$`, 'i')
const AFTER = new RegExp(`^(.+?)\\s+${KIND}$`, 'i')

/** THE SENTENCE, or null where the line is not one. The boat must be
 *  at least two characters — the finder's own shortest question. */
export function askedForFits(query: string): FitsQuestion | null {
  const line = query.trim().replace(/\s+/g, ' ').replace(LEAD, '')
  const before = BEFORE.exec(line)
  const after = before ? null : AFTER.exec(line)
  const word = before ? before[1]! : after ? after[2]! : ''
  const boat = (before ? before[2]! : after ? after[1]! : '').trim()
  const kind = KIND_WORDS[word.toLowerCase()]
  if (!kind || boat.length < 2) return null
  /* "trailer for" with nothing after it has no boat, and "for" is not
     one; the joining words alone are never a boat */
  if (new RegExp(`^${JOIN}$`, 'i').test(boat)) return null
  return { kind, word, boat }
}

/* ------------------------------------------------------------ */
/* The answer                                                    */
/* ------------------------------------------------------------ */

/** What the finder needs of the catalogue, and no more. */
export interface FitsWorld {
  entities: Record<string, EntityDef>
  rowsByEntity: Record<string, RowData[]>
  views: Record<string, ViewDef>
}

/** One thing the file pairs with at least one of the boats asked about. */
export interface Fit {
  tableId: string
  rowId: string
  /** as the file spells it */
  label: string
  /** how many of the boats asked about it is paired with */
  fits: number
  /** how many of them name it as the file's own pick (the star) */
  picks: number
  /** the best slot the file gives it on any of them; lower is sooner */
  order: number
}

export interface FitsAnswer {
  /** the boats the question was asked of */
  boats: number
  fits: Fit[]
  /** pairings held back because what they name is no longer sold — the
   *  count `relatedRows` hands back, said rather than dropped */
  held: number
}

/** A boat the question is asked of, by where it lives. */
export interface BoatRef {
  tableId: string
  rowId: string
}

/**
 * WHAT THE FILE PAIRS WITH THESE BOATS, of one kind — the most often
 * picked first, then the most widely fitting, then in the file's own
 * slot order, then by name, so the list does not move between two
 * keystrokes that asked the same question.
 */
export function fitsFor(world: FitsWorld, boats: readonly BoatRef[], kind: FitKind): FitsAnswer {
  const engine = makeEngine(world)
  const tally = new Map<string, Fit & { on: Set<string> }>()
  let held = 0
  let asked = 0

  const byTable = new Map<string, string[]>()
  for (const b of boats) {
    const list = byTable.get(b.tableId) ?? []
    list.push(b.rowId)
    byTable.set(b.tableId, list)
  }

  for (const [tableId, rowIds] of byTable) {
    const root = world.entities[tableId]
    if (!root) continue
    const rows = world.rowsByEntity[tableId] ?? []
    const wanted = new Set(rowIds)
    const found = rows.filter((r) => wanted.has(r.id))
    asked += found.length
    const view = Object.values(world.views).find((v) => v.rootTableId === tableId)
    const blocks = view ? view.blocks : defaultBlocksFor(world.entities, tableId)
    for (const block of blocks) {
      const target = world.entities[block.tableId]
      if (!target || target.kind !== kind) continue
      const join = joinRefFor(world.entities, block.joinTableId, root.id, target.id)
      for (const row of found) {
        const offer = relatedRows({
          ctx: world,
          engine,
          sourceEntity: root,
          sourceRow: row,
          targetEntityId: target.id,
          rule: block.rule,
          join,
        })
        held += offer.heldCount
        for (const r of offer.rows) {
          const key = `${target.id}\u001f${r.row.id}`
          let fit = tally.get(key)
          if (!fit) {
            fit = {
              tableId: target.id,
              rowId: r.row.id,
              label: rowLabel(target, r.row),
              fits: 0,
              picks: 0,
              order: r.sortKey,
              on: new Set<string>(),
            }
            tally.set(key, fit)
          }
          if (!fit.on.has(row.id)) {
            fit.on.add(row.id)
            fit.fits += 1
          }
          if (r.recommended) fit.picks += 1
          fit.order = Math.min(fit.order, r.sortKey)
        }
      }
    }
  }

  const fits = [...tally.values()]
    .map((f): Fit => ({
      tableId: f.tableId,
      rowId: f.rowId,
      label: f.label,
      fits: f.fits,
      picks: f.picks,
      order: f.order,
    }))
    .toSorted(
      (a, b) =>
        b.picks - a.picks ||
        b.fits - a.fits ||
        a.order - b.order ||
        a.label.localeCompare(b.label, 'en-AU'),
    )
  return { boats: asked, fits, held }
}
