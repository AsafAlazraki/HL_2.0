/* ============================================================
   THE MAKERS AS DOORS — what Northside sells, grouped the way the
   original HelmLogic dashboard grouped it and the stakeholders
   already know: by the brands, boats and motors alike, each a door.

   WHY IT EXISTS (docs/research/refs/home2/why.md §3, job 5, and the
   judge's graft onto direction D, 2026-10-20). Home drew seven boat
   makers on a shelf a quarter of the window wide, and Yamaha — the
   maker of the motor on almost every quote — was absent, because the
   shelf listed boat registers only. The doors are read here, once,
   from the file that loaded:

     · A BOAT MAKER is a boat register, counted in MODELS as the
       picker counts them (`countBoats`): Highfield's 67, not its 588
       lines. Named as its rows name it, by the names ledger
       ("Highfield", where the register is filed "Highfield
       Inflatables").
     · A MOTOR MAKER is a motor register, counted in motors — the
       lines it still sells, each one a motor. Named as the register
       names it without the kind's own word at its end ("Yamaha", where
       the register is filed "Yamaha Outboards").
     · THE TRAILERS ARE ONE DOOR, as the original drew them: a
       salesperson reaches for "a trailer" before a trailer maker. It
       counts the trailer registers the file still sells from.

   WHAT A PERSON COULD BE SOLD, and nothing else: a retired register
   and a line marked no longer sold are not counted, the two refusals
   the picker makes. A register with nothing left to sell draws no
   door, because a door into nothing is a dead control.

   THE ORDER IS THE FILE'S WEIGHT: the boat makers by the lines behind
   them, most first (the picker's own reading order, so Highfield
   leads), then the motor makers the same way, then the trailers. Not a
   ranking anybody chose.

   NOTHING HERE IS A PICTURE. Which mark a door draws is the screen's
   question for the marks ledger; this module says only which doors
   there are, what each counts and where it opens.
   ============================================================ */
import { isDiscontinued, isRetired, type EntityDef, type RowData } from '@/domain/model'
import { countBoats } from '@/domain/quote/boats'
import { LEDGER, type NamesLedger } from '@/domain/quote/spoken'

export type MakerKind = 'boat' | 'motor' | 'trailer'

/** Where a door opens: a boat maker's boats in the picker; a motor or
 *  the trailers where they are sold, which is the build, on a boat.
 *
 *  A MOTOR AND A TRAILER ARE CHOSEN IN THE BUILD (2026-10-20, the cold
 *  critique of the built Home, major 8). Their doors opened the price
 *  file — Yamaha's sheet, whose head counts its cost columns, and Data's
 *  register of trailer workbooks — which is the back office, on the
 *  screen a customer may be sitting beside. Nothing in this app sells a
 *  motor or a trailer on its own: every quote starts from the boat, and
 *  the motor and the trailer are chapters of its build. So their doors
 *  start a quote, which is where a Yamaha is sold. */
export type MakerOpens = { at: 'picker'; tableId: string } | { at: 'build' }

export interface MakerDoor {
  /** stable across reads: the register's id, or `trailers` */
  key: string
  kind: MakerKind
  /** the maker as a dealer says it — "Highfield", "Yamaha", "Trailers" */
  name: string
  /** the registers behind the door, in the order they were counted */
  tableIds: string[]
  count: number
  /** the noun the count takes, already singular or plural */
  noun: string
  /** the count and its noun — "67 models", "209 motors", "7 makers" */
  said: string
  opens: MakerOpens
}

/** The word the trailers' door says for itself. */
export const TRAILERS = 'Trailers'

const said = (n: number, one: string, many: string): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? one : many}`

/** A motor register's maker: its name without the kind's own word at
 *  the end ("Yamaha Outboards" is Yamaha). A name that is only that
 *  word is kept whole rather than emptied. */
function motorMaker(name: string): string {
  const bare = name.replace(/\s+(outboards?|motors?|engines?)$/i, '').trim()
  return bare === '' ? name.trim() : bare
}

/** A boat register's maker, as its rows write it before every model. */
function boatMaker(table: EntityDef, ledger: NamesLedger): string {
  return ledger.makers.find((m) => m.table === table.id)?.maker ?? table.name.trim()
}

const liveRows = (rows: readonly RowData[] | undefined): number =>
  (rows ?? []).filter((row) => !isDiscontinued(row)).length

const heaviestFirst = <T extends { lines: number; name: string }>(list: T[]): T[] =>
  list.toSorted((a, b) => b.lines - a.lines || a.name.localeCompare(b.name, 'en-AU'))

/**
 * Every door, in the file's own weight. Hand it the PRICE FILE's
 * tables (`priceFileOf(...).tables`), so a register made at this desk
 * is never a maker.
 */
export function makerDoors(
  tables: Readonly<Record<string, EntityDef>> | readonly EntityDef[],
  rows: Readonly<Record<string, readonly RowData[]>>,
  ledger: NamesLedger = LEDGER,
): MakerDoor[] {
  const list = (Array.isArray(tables) ? tables : Object.values(tables)) as EntityDef[]
  const live = list.filter((t) => t.role !== 'join' && !isRetired(t))
  const byId = new Map(live.map((t) => [t.id, t]))

  const boats = heaviestFirst(
    countBoats(
      live.filter((t) => t.kind === 'boat'),
      rows,
    ).byMaker.filter((m) => m.boats > 0),
  ).map((m): MakerDoor => {
    const table = byId.get(m.id)
    return {
      key: m.id,
      kind: 'boat',
      name: table ? boatMaker(table, ledger) : m.name,
      tableIds: [m.id],
      count: m.boats,
      noun: m.boats === 1 ? 'model' : 'models',
      said: said(m.boats, 'model', 'models'),
      opens: { at: 'picker', tableId: m.id },
    }
  })

  const motors = heaviestFirst(
    live
      .filter((t) => t.kind === 'motor')
      .map((t) => ({ table: t, name: t.name, lines: liveRows(rows[t.id]) }))
      .filter((m) => m.lines > 0),
  ).map((m): MakerDoor => ({
    key: m.table.id,
    kind: 'motor',
    name: motorMaker(m.table.name),
    tableIds: [m.table.id],
    count: m.lines,
    noun: m.lines === 1 ? 'motor' : 'motors',
    said: said(m.lines, 'motor', 'motors'),
    opens: { at: 'build' },
  }))

  const trailerLists = heaviestFirst(
    live
      .filter((t) => t.kind === 'trailer')
      .map((t) => ({ table: t, name: t.name, lines: liveRows(rows[t.id]) }))
      .filter((m) => m.lines > 0),
  )
  const trailers: MakerDoor[] =
    trailerLists.length === 0
      ? []
      : [
          {
            key: 'trailers',
            kind: 'trailer',
            name: TRAILERS,
            tableIds: trailerLists.map((m) => m.table.id),
            count: trailerLists.length,
            noun: trailerLists.length === 1 ? 'maker' : 'makers',
            said: said(trailerLists.length, 'maker', 'makers'),
            opens: { at: 'build' },
          },
        ]

  return [...boats, ...motors, ...trailers]
}
