/* ============================================================
   WHAT FITS THE BOAT, AS THE BUILD READS IT (fit flow, round 2).

   The cold walk found the build and What fits saying two things about
   one motor. What fits filed the 20-inch-shaft F115LB under "its
   shaft is not the extra-long (25″) this boat's transom takes"; the
   build's whole range filed it under "Nothing is wrong with it", and
   one press put it on the quote. Asked "why can't I pick this motor?",
   the build had no answer and no way to where it is decided.

   So the build reads What fits' own reading and says its sentences,
   word for word: `readBoatFit` and `readWhole` (src/domain/fitment/
   boat.ts) group every motor on sale by why it is or is not offered,
   and `motorHeldSaid` words each group once. Where the boat's own
   figures rule a motor out — under or over the horsepower it takes,
   a shaft its transom does not take, controls it is not steered by,
   a rig its figures cannot place — the build refuses it with that
   sentence. Where nothing is measured wrong and the price list simply
   does not list it, the build says so, in What fits' words, and lets
   it go on.

   It also says the boat as What fits titles it (the model, with the
   version under it: the walk chose "Highfield Patrol 600" and the
   build was titled "Highfield Patrol 600 Open"), what a line named
   for the boat is (its own name carries the model's code, "PA600"),
   and the code a typed model name stands for, so "Patrol 600" finds
   "GFAB Tandem Axel Trailer t/s Highfield PA600".

   Pure: no React, no store. The boat's reading is the slow part (a
   tenth of a second cold, 40 ms warm on the PA600, measured
   2026-11-05), so it is read only when a row asks, and kept per
   catalogue and boat.
   ============================================================ */

import { readCell, rowLabel, type CatalogueCtx, type QuoteDef, type RowData } from '@/domain/model'
import { readBoatFit, readWhole } from '@/domain/fitment/boat'
import { versionsOf, versionSaid } from '@/domain/fitment/versions'
import { carriesCode } from '@/domain/fitment/page'
import { trailOf } from '@/domain/modules/read'
import { boatOfQuote, spokenModel } from '@/domain/quote/spoken'

/** Why a motor stands where it does on this boat, in What fits' own words. */
export interface MotorFitSaid {
  why: string
  /** the boat's own figures rule it out: it is not put on the quote */
  refuses: boolean
}

/** The groups of What fits' whole list whose motors the boat's own figures rule out. */
const RULED_OUT: ReadonlySet<string> = new Set(['under', 'over', 'shaft', 'steering', 'rigs'])

/** The groups whose motors nothing measures wrong: the price list does not list them here. */
const NOT_LISTED: ReadonlySet<string> = new Set(['inside', 'unplaced', 'unrated'])

type MotorReading = Map<string, MotorFitSaid>

const readings = new WeakMap<CatalogueCtx, Map<string, MotorReading | null>>()

/** Every motor on sale that is not offered on this boat, by its row, with What fits' sentence.
 *  Null where the quote is not for a boat or the boat has no motor list. */
function motorReading(ctx: CatalogueCtx, quote: QuoteDef): MotorReading | null {
  const key = `${quote.rootTableId}#${quote.rootRowId}`
  let byBoat = readings.get(ctx)
  if (!byBoat) {
    byBoat = new Map()
    readings.set(ctx, byBoat)
  }
  if (byBoat.has(key)) return byBoat.get(key) ?? null
  const fit = readBoatFit(ctx, { tableId: quote.rootTableId, rowId: quote.rootRowId })
  const whole = fit ? readWhole(ctx, fit, 'motor') : null
  let out: MotorReading | null = null
  if (whole) {
    out = new Map()
    for (const group of whole.groups) {
      const refuses = RULED_OUT.has(group.id)
      if (!refuses && !NOT_LISTED.has(group.id)) continue
      for (const row of group.rows) out.set(row.place.rowId, { why: group.head, refuses })
    }
  }
  byBoat.set(key, out)
  return out
}

/**
 * WHERE ONE MOTOR STANDS ON THE QUOTE'S BOAT, as What fits says it: null where it is offered on
 * this boat (or a rule of Northside's speaks for it, which the build already says), or where the
 * quote is not for a boat.
 */
export function motorFitOf(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  motor: { tableId: string; rowId: string },
): MotorFitSaid | null {
  if (ctx.entities[motor.tableId]?.kind !== 'motor') return null
  if (ctx.entities[quote.rootTableId]?.kind !== 'boat') return null
  return motorReading(ctx, quote)?.get(motor.rowId) ?? null
}

/* ---------------------------------------------------------- */
/* The boat, as What fits titles it                            */
/* ---------------------------------------------------------- */

export interface BoatTitle {
  /** "Highfield Patrol 600" */
  name: string
  /** "Open · PVC · Light Grey / White / Dark Grey" */
  detail: string
  /** "Patrol 600": the name a sentence says after "the" */
  short: string
}

/**
 * THE BOAT AS WHAT FITS TITLES IT: the model as its maker files it, and the version under it
 * (`versionsOf`, `versionSaid`). A quote that is not for a boat, or a boat no longer on the
 * price list, keeps the words its quote froze (`boatOfQuote`).
 */
export function boatTitleOf(ctx: CatalogueCtx, quote: QuoteDef): BoatTitle {
  const frozen = boatOfQuote(quote)
  const shortOf = (name: string): string =>
    frozen.maker !== '' && name.startsWith(`${frozen.maker} `)
      ? name.slice(frozen.maker.length + 1)
      : name
  const fallback = { name: frozen.name, detail: frozen.detail, short: shortOf(frozen.name) }
  if (ctx.entities[quote.rootTableId]?.kind !== 'boat') return fallback
  const model = versionsOf(ctx, { tableId: quote.rootTableId, rowId: quote.rootRowId })
  const version = model?.versions[model.at]
  if (!model || !version) return fallback
  return { name: model.name, detail: versionSaid(model, version), short: shortOf(model.name) }
}

/* ---------------------------------------------------------- */
/* A line named for the boat                                   */
/* ---------------------------------------------------------- */

const cellText = (row: RowData, id: string): string => {
  const v = readCell(row, id)
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
}

/**
 * THE BOAT'S MODEL CODE, read where the price list files it: the middle of Series ▸ Model ▸
 * Finish, and only a code with a letter and a figure in it ("PA600", "SP560") — the reading What
 * fits makes (`modelWordsOf`). '' where the boat's list files none.
 */
export function boatCodeOf(ctx: CatalogueCtx, quote: QuoteDef): string {
  const root = ctx.entities[quote.rootTableId]
  if (root?.kind !== 'boat') return ''
  const row = (ctx.rowsByEntity[root.id] ?? []).find((r) => r.id === quote.rootRowId)
  if (!row) return ''
  const path = (root.hierarchy ?? []).map((id) => cellText(row, id)).filter((v) => v !== '')
  const filed = path.length >= 3 ? (path[1] ?? '') : ''
  return /[a-z]/i.test(filed) && /\d/.test(filed) && filed.length >= 3 ? filed : ''
}

/** A line whose own name carries the boat's model code as a word of its own: "GFAB Tandem Axel
 *  Trailer t/s Highfield PA600" is named for the PA600, and never for the PA600EW. */
export const namedForBoat = (label: string, code: string): boolean => carriesCode(label, code)

/* ---------------------------------------------------------- */
/* A typed model name, and the code it stands for              */
/* ---------------------------------------------------------- */

interface CodeWords {
  /** the model's words, lower case, one per token: ["patrol", "600"] */
  words: string[]
  /** its code as the price list writes it in a line's name: "PA600" */
  code: string
}

const codeBooks = new WeakMap<CatalogueCtx, CodeWords[]>()

/** Every boat model the maker files by a code, with the words its names ledger says for it. */
function codeBook(ctx: CatalogueCtx): CodeWords[] {
  const kept = codeBooks.get(ctx)
  if (kept) return kept
  const seen = new Map<string, CodeWords>()
  for (const entity of Object.values(ctx.entities)) {
    if (entity.kind !== 'boat' || (entity.hierarchy ?? []).length < 3) continue
    for (const row of ctx.rowsByEntity[entity.id] ?? []) {
      const filed = trailOf(entity, row).split(' ▸ ').at(-1)?.trim() ?? ''
      if (!/[a-z]/i.test(filed) || !/\d/.test(filed) || seen.has(filed)) continue
      const words = spokenModel(entity.id, filed).model
      if (words.toLowerCase() === filed.toLowerCase()) continue
      seen.set(filed, { words: words.toLowerCase().split(/\s+/).filter(Boolean), code: filed })
    }
  }
  const book = [...seen.values()]
  codeBooks.set(ctx, book)
  return book
}

const tableHays = new WeakMap<CatalogueCtx, Map<string, string>>()

/** Every name a list holds, lower case, as one text: what a word the list never uses is told by. */
function tableHay(ctx: CatalogueCtx, tableId: string): string {
  let byTable = tableHays.get(ctx)
  if (!byTable) {
    byTable = new Map()
    tableHays.set(ctx, byTable)
  }
  const kept = byTable.get(tableId)
  if (kept !== undefined) return kept
  const list = ctx.entities[tableId]
  const hay = list
    ? (ctx.rowsByEntity[tableId] ?? [])
        .map((r) => [rowLabel(list, r), trailOf(list, r)].join(' '))
        .join('\n')
        .toLowerCase()
    : ''
  byTable.set(tableId, hay)
  return hay
}

/** One more way to ask a list for what was typed: the query with a model's words said as its code,
 *  and the code a row's own name must carry as a word of its own. */
export interface SaidAs {
  query: string
  code: string
}

/**
 * A MODEL'S NAME TYPED WHERE THE LIST WRITES ITS CODE (the walk: "Patrol" and "Patrol 600" said
 * "Nothing in GFAB Trailers is called that", and the list holds "GFAB Tandem Axel Trailer t/s
 * Highfield PA600", which the build itself says as "…Highfield Patrol 600"). Asked only where a
 * typed word appears nowhere in the list: each model whose words that word begins, and whose code
 * the list does carry, gives the query again with the model's words as its code. "600" alone is
 * a figure, not a model, and asks nothing.
 */
export function saidAs(ctx: CatalogueCtx, tableId: string, query: string): SaidAs[] {
  const needles = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (needles.length === 0) return []
  const hay = tableHay(ctx, tableId)
  const strange = needles.filter((n) => !hay.includes(n))
  if (strange.length === 0 || strange.some((n) => !/[a-z]/.test(n))) return []
  const out: SaidAs[] = []
  for (const model of codeBook(ctx)) {
    const touches = (n: string): boolean => model.words.some((w) => w.startsWith(n))
    if (!strange.every(touches)) continue
    if (!hay.includes(model.code.toLowerCase())) continue
    /* the words the model's name does not answer are still asked of the row: "Patrol 600 tandem"
       is the PA600 with "tandem" in its name, and "Patrol 600" is never the Patrol 660 */
    const rest = needles.filter((n) => !touches(n))
    out.push({ query: [model.code.toLowerCase(), ...rest].join(' '), code: model.code })
  }
  return out
}
