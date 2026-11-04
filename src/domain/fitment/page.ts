/* ============================================================
   ONE BOAT'S PAGE, READ (the fit flow, direction A, 2026-11-05:
   docs/directions/fit-flow/directions.md).

   The walk found the boat's page answering with the wrong word in
   three places, and each answer here is a reading of the price list
   the page then only draws:

     · NAMED FOR IT, NOT LISTED FOR IT. "GFAB Tandem Axel Trailer t/s
       Highfield PA600" sat under "not made for the Patrol 600", and 40
       dealer-fit packages called "Patrol - PA600 …" under "Not made for
       this boat". A line whose own name carries the model's code, on a
       list the boat's page reads, but which the price list does not
       list for this boat, is counted as exactly that (`namedForOf`). It
       is never offered on a quote until Northside offers it.
     · TAKEN OFF. A motor Northside took off this boat was filed among
       the motors that never fitted. Its pairing is kept, marked taken
       off, with the moment it was written (`takenOffOf`), so the page
       keeps it in its own place with Put it back.
     · THE QUOTE THIS STARTS. The parts ticked on the page are lines of
       the quote it starts (`quoteStartOf`), counted as the build counts
       its lines, with the price it comes to and what that leaves out.

   Pure: no React, no store. Every count is off the price list and
   Northside's own changes to it.
   ============================================================ */
import { isDiscontinued, isRetired, rowLabel } from '@/domain/model'
import type { CatalogueCtx, EntityDef, RowData } from '@/domain/model'
import { readPairs } from '@/domain/catalogue/views'
import { goodsFacts } from '@/domain/quote/goodsFacts'
import { lineSaid } from '@/domain/quote/spoken'
import { nameOnPaper } from '@/domain/quote/paperWords'
import { pricer, type BoatFit, type Made, type Place, type TrailerMade } from './boat'
import { pairingFor } from './change'
import type { Rigged } from './rigged'

const AU = new Intl.NumberFormat('en-AU')
const count = (n: number): string => AU.format(n)

/** A place on the boat's page: its motor, its trailer, or one of its other lists by its id. */
export type Slot = 'motor' | 'trailer' | string

/** One line of the price list, as the boat's page says it. */
export interface PageLine {
  slot: Slot
  place: Place
  /** as a dealer says it: "Sundeck for PA600" */
  name: string
  /** its own deciding facts: "150 hp · 228 kg · 25″ shaft"; '' where it has none */
  facts: string
  /** at the boat's own price; null where the line has none */
  price: number | null
}

/** The slots of a boat and the list each reads, in the page's order. */
function slotsOf(fit: BoatFit): Array<{ slot: Slot; tableId: string }> {
  return [
    ...(fit.motor ? [{ slot: 'motor', tableId: fit.motor.tableId }] : []),
    ...(fit.trailer?.lists ?? []).map((l) => ({ slot: 'trailer', tableId: l.tableId })),
    ...fit.lists.map((l) => ({ slot: l.tableId, tableId: l.tableId })),
  ]
}

const rowOf = (ctx: CatalogueCtx, place: Place): RowData | undefined =>
  (ctx.rowsByEntity[place.tableId] ?? []).find((r) => r.id === place.rowId)

function lineOf(
  price: (entity: EntityDef, row: RowData) => number | null,
  slot: Slot,
  table: EntityDef,
  row: RowData,
): PageLine {
  return {
    slot,
    place: { tableId: table.id, rowId: row.id },
    name: nameOnPaper(lineSaid(rowLabel(table, row), table.name)),
    facts: goodsFacts(table, row),
    price: price(table, row),
  }
}

/* ---------------------------------------------------------- */
/* The model: its name, its short name, its code               */
/* ---------------------------------------------------------- */

export interface ModelWords {
  /** "Highfield Patrol 600" */
  name: string
  /** "Patrol 600": the name a sentence says after "the" */
  short: string
  /** "PA600": the model's own code on the price list, '' where the list files none that can be
   *  read in another line's name */
  code: string
}

/**
 * THE MODEL'S OWN CODE, read where the price list files it: the middle of Series ▸ Model ▸ Finish.
 * Only a code with a letter and a figure in it is a code another line's name can carry ("PA600",
 * "SP560", "ADV9"); "Coaster" is a word, and a line called "Coaster brake" is not named for it.
 */
export function modelWordsOf(fit: BoatFit, name: string, maker: string): ModelWords {
  const filed = fit.path.length >= 3 ? (fit.path[1] ?? '').trim() : ''
  const code = /[a-z]/i.test(filed) && /\d/.test(filed) && filed.length >= 3 ? filed : ''
  const lead = maker === '' ? '' : `${maker} `
  const short = lead !== '' && name.startsWith(lead) ? name.slice(lead.length) : name
  return { name, short, code }
}

/** The code standing as a word of its own: "PA600" in "Sundeck for PA600", never in "PA600EW". */
export function carriesCode(label: string, code: string): boolean {
  if (code === '') return false
  const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?![a-z0-9])`, 'i').test(label)
}

/* ---------------------------------------------------------- */
/* Taken off by Northside                                      */
/* ---------------------------------------------------------- */

export interface TakenOff extends PageLine {
  /** when Northside took it off, as the change was written (ISO) */
  on: string
}

/**
 * EVERY LINE NORTHSIDE TOOK OFF THIS BOAT, by slot: the pairing kept and marked taken off
 * (`change.ts`), read off this version's own row. A line the price list no longer sells is left
 * out: there is nothing to put back.
 */
export function takenOffOf(ctx: CatalogueCtx, fit: BoatFit): TakenOff[] {
  const boatTable = ctx.entities[fit.place.tableId]
  const boatRow = rowOf(ctx, fit.place)
  if (!boatTable || !boatRow) return []
  const price = pricer(ctx, fit)
  const out: TakenOff[] = []
  const seen = new Set<string>()
  for (const { slot, tableId } of slotsOf(fit)) {
    const table = ctx.entities[tableId]
    const join = pairingFor(ctx, fit.place, { tableId, rowId: '' })
    if (!table || !join || isRetired(table)) continue
    const joinRows = new Map((ctx.rowsByEntity[join.entityId] ?? []).map((r) => [r.id, r]))
    const rows = new Map((ctx.rowsByEntity[tableId] ?? []).map((r) => [r.id, r]))
    for (const pair of readPairs(ctx, join, boatTable, boatRow).values()) {
      if (pair.origin !== 'removed') continue
      const row = rows.get(pair.targetRowId)
      if (!row || isDiscontinued(row) || seen.has(`${tableId}:${row.id}`)) continue
      seen.add(`${tableId}:${row.id}`)
      out.push({
        ...lineOf(price, slot, table, row),
        on: joinRows.get(pair.rowId)?.updatedAt ?? '',
      })
    }
  }
  return out
}

/** "Taken off today", "Taken off yesterday", "Taken off on 3 November". */
export function takenOffSaid(on: string, today: Date): string {
  const when = new Date(on)
  if (on === '' || Number.isNaN(when.getTime())) return 'Taken off by Northside'
  const day = (d: Date): number => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const days = Math.round((day(today) - day(when)) / 86_400_000)
  if (days <= 0) return 'Taken off today'
  if (days === 1) return 'Taken off yesterday'
  const date = new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    ...(when.getFullYear() === today.getFullYear() ? {} : { year: 'numeric' }),
  }).format(when)
  return `Taken off on ${date}`
}

/* ---------------------------------------------------------- */
/* Named for it, and not listed for it                         */
/* ---------------------------------------------------------- */

/**
 * THE LINES WHOSE OWN NAME CARRIES THIS MODEL'S CODE, on the trailer lists and the other lists the
 * boat's page reads, that the price list does not list for this boat. Never what is made for it,
 * and never a line Northside took off (that is said as taken off). Counted from the names alone:
 * nothing here says it fits.
 */
export function namedForOf(
  ctx: CatalogueCtx,
  fit: BoatFit,
  code: string,
  taken: readonly TakenOff[] = [],
): PageLine[] {
  if (code === '') return []
  const price = pricer(ctx, fit)
  const made = new Set<string>([
    ...(fit.trailer?.made ?? []).map((m) => m.place.rowId),
    ...fit.lists.flatMap((l) => l.made.map((m) => m.place.rowId)),
  ])
  const off = new Set(taken.map((t) => t.place.rowId))
  const out: PageLine[] = []
  for (const { slot, tableId } of slotsOf(fit)) {
    if (slot === 'motor') continue
    const table = ctx.entities[tableId]
    if (!table || isRetired(table)) continue
    for (const row of ctx.rowsByEntity[tableId] ?? []) {
      if (isDiscontinued(row) || made.has(row.id) || off.has(row.id)) continue
      if (!carriesCode(rowLabel(table, row), code)) continue
      out.push(lineOf(price, slot, table, row))
    }
  }
  return out
}

/* ---------------------------------------------------------- */
/* The motors Northside could put on                           */
/* ---------------------------------------------------------- */

/**
 * THE MOTORS THE BOAT CAN TAKE THAT THE PRICE LIST DOES NOT LIST FOR IT: inside its horsepower,
 * on its shaft and its steering, and not taken off. These, and only these, can be put on by
 * Northside here; a motor outside the boat's own figures is refused by the price list's own
 * figures (`changeFit`), so it is never offered as a press.
 */
export function canPutOnOf(
  ctx: CatalogueCtx,
  fit: BoatFit,
  taken: readonly TakenOff[],
): PageLine[] {
  const motor = fit.motor
  const table = motor ? ctx.entities[motor.tableId] : undefined
  if (!motor || !table) return []
  const off = new Set(taken.map((t) => t.place.rowId))
  const rows = new Map((ctx.rowsByEntity[table.id] ?? []).map((r) => [r.id, r]))
  const price = pricer(ctx, fit)
  return motor.dots
    .filter((d) => d.standing === 'inside' && !off.has(d.place.rowId))
    .flatMap((d) => {
      const row = rows.get(d.place.rowId)
      return row ? [lineOf(price, 'motor', table, row)] : []
    })
}

/* ---------------------------------------------------------- */
/* What decides the page                                       */
/* ---------------------------------------------------------- */

export interface ChangesOn {
  /** lines Northside put on this boat by hand */
  added: number
  /** lines Northside took off this boat */
  removed: number
}

/** Northside's own changes to what goes on this version, counted off its pairings. The price list
 *  itself ships pairings marked put on (the PA600 carries 12), so a line counts as put on BY
 *  NORTHSIDE only where its pairing was written after the boat's own line was: the price list's
 *  lines are all written at the moment it was brought in, one stamp. */
export function changesOn(ctx: CatalogueCtx, fit: BoatFit): ChangesOn {
  const boatTable = ctx.entities[fit.place.tableId]
  const boatRow = rowOf(ctx, fit.place)
  const out: ChangesOn = { added: 0, removed: 0 }
  if (!boatTable || !boatRow) return out
  const joins = new Set<string>()
  for (const { tableId } of slotsOf(fit)) {
    const join = pairingFor(ctx, fit.place, { tableId, rowId: '' })
    if (!join || joins.has(join.entityId)) continue
    joins.add(join.entityId)
    const written = new Map((ctx.rowsByEntity[join.entityId] ?? []).map((r) => [r.id, r]))
    for (const pair of readPairs(ctx, join, boatTable, boatRow).values()) {
      const at = written.get(pair.rowId)?.createdAt ?? ''
      if (pair.origin === 'added' && at !== boatRow.createdAt) out.added += 1
      if (pair.origin === 'removed') out.removed += 1
    }
  }
  return out
}

/** The page's last sentence: what decides it, Northside's rules and Northside's changes named. */
export function decidesSaid(rulesInForce: number, changes: ChangesOn): string {
  const rules =
    rulesInForce === 0
      ? 'None of Northside’s rules is switched on'
      : `${count(rulesInForce)} of Northside’s rules ${rulesInForce === 1 ? 'is' : 'are'} switched on`
  const parts: string[] = []
  if (changes.added > 0) parts.push(`put ${count(changes.added)} on this boat by hand`)
  if (changes.removed > 0) parts.push(`taken ${count(changes.removed)} off it`)
  const changed =
    parts.length === 0
      ? 'Northside has changed nothing on this boat'
      : `Northside has ${parts.join(' and ')}`
  return `What decides this page: the price list says what fits which boat. ${rules}, and ${changed}.`
}

/* ---------------------------------------------------------- */
/* The quote this starts                                       */
/* ---------------------------------------------------------- */

export interface QuoteStart {
  /** what the bar lists, as a person says it */
  names: string[]
  /** the lines the build will hold, the rigging kit its own line, as the build counts them */
  lines: number
  /** what the priced lines come to */
  total: number
  /** a rigging kit goes on with no price set yet, so the total is before it */
  kitOut: boolean
  /** lines with no price yet, the kit apart */
  unpriced: number
}

/**
 * THE QUOTE "START THE QUOTE" MAKES, read before it is made: the boat, the motor chosen and the
 * rigging kit its pairing names, the trailer chosen, and every fit-out line ticked — the same
 * lines the build is handed (`useStart`, `pickedLines`). A kit the price list no longer sells is
 * never a line.
 */
export function quoteStartOf(
  boat: { name: string; price: number | null },
  motor: Rigged | null,
  trailer: TrailerMade | null,
  fitOut: readonly Made[],
): QuoteStart {
  const names = [boat.name]
  const prices: Array<number | null> = [boat.price]
  let lines = 1
  let kitOut = false
  let kitPrice = 0
  if (motor) {
    const kit = motor.kit && !motor.kit.retired ? motor.kit : null
    names.push(kit ? `${motor.motor.name} and its rigging kit` : motor.motor.name)
    prices.push(motor.motor.price)
    lines += kit ? 2 : 1
    if (kit && kit.price === null) kitOut = true
    if (kit && kit.price !== null) kitPrice = kit.price
  }
  if (trailer) {
    names.push(trailer.name)
    prices.push(trailer.price)
    lines += 1
  }
  for (const m of fitOut) {
    names.push(m.name)
    prices.push(m.price)
    lines += 1
  }
  const priced = prices.filter((p): p is number => p !== null)
  return {
    names,
    lines,
    total: priced.reduce((n, p) => n + p, 0) + kitPrice,
    kitOut,
    unpriced: prices.length - priced.length,
  }
}

/** "at Cash, before the rigging kit, and 4 with no price yet" */
export function quoteStartSaid(q: QuoteStart, priceName: string): string {
  const parts = [priceName === '' ? 'together' : `at ${priceName}`]
  if (q.kitOut) parts.push('before the rigging kit')
  if (q.unpriced > 0) parts.push(`and ${count(q.unpriced)} with no price yet`)
  return parts.join(', ')
}
