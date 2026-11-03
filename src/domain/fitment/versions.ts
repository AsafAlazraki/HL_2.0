/* ============================================================
   FITMENT IS A MODEL'S, NOT A COLOURWAY'S (the fitment judge,
   2026-11-03, blocker 1).

   Taking the F200XCC off "the Highfield Sport 660" changed one of its
   sixteen versions while the sentence named the whole model, and 66 of
   Highfield's 67 models carry one motor set on every version. So the
   unit Fitment reads, chooses and changes is the MODEL — `modelKeyOf`,
   the one place that decides what a model is, so this counts exactly
   what Home, Data and the picker count — and a version is only the
   finish whose price and weight the plate shows.

   WHAT IS HERE: the versions of a boat's model in the price list's own
   order (`versionsOf`), whether they all take the motors this one does
   (`sameAcross`), a maker's models under the series the file files
   them in (`bySeries`), and a search that answers in models, not in
   colourways (`findModels`).

   Pure: no React, no store.
   ============================================================ */

import { isDiscontinued, isRetired, readCell, rowLabel } from '@/domain/model'
import type { CatalogueCtx, EntityDef, RowData } from '@/domain/model'
import { modelKeyOf } from '@/domain/quote/boats'
import { spokenBoat, spokenModel } from '@/domain/quote/spoken'
import { trailOf } from '@/domain/modules/read'
import { makerOfTable } from '@/domain/catalogue/makers'
import { readPairs } from '@/domain/catalogue/views'
import { pairingFor } from './change'
import type { BoatFound, BoatMaker, BoatModel, Place } from './boat'

type World = { entities: Record<string, EntityDef>; rowsByEntity: Record<string, RowData[]> }

const COUNTED = new Intl.Collator('en-AU', { numeric: true, sensitivity: 'base' })
const AU = new Intl.NumberFormat('en-AU')

const textCell = (entity: EntityDef, row: RowData, name: string): string => {
  const field = entity.fields.find((f) => f.name.trim().toLowerCase() === name.toLowerCase())
  const v = field ? readCell(row, field.id) : null
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
}

/** One boat's model and every version of it still sold. */
export interface BoatVersions {
  key: string
  /** the model as a person says it: "Highfield Sport 660" */
  name: string
  /** every version still sold, in the price list's own order */
  versions: BoatFound[]
  /** where the boat itself stands among them; -1 where it is no longer sold */
  at: number
}

/** The versions a model files under it. A list with no Series ▸ Model ▸ Variant has one line per
 *  model, so its model is the boat alone. Null where the boat is not on the price list. */
export function versionsOf(world: World, place: Place): BoatVersions | null {
  const entity = world.entities[place.tableId]
  if (!entity || entity.kind !== 'boat') return null
  const rows = world.rowsByEntity[entity.id] ?? []
  const row = rows.find((r) => r.id === place.rowId)
  if (!row) return null
  const key = modelKeyOf(entity, row)
  const deep = (entity.hierarchy ?? []).length >= 3
  const filed = deep ? (trailOf(entity, row).split(' ▸ ').at(-1) ?? '') : ''
  const spoken = spokenBoat(entity.id, rowLabel(entity, row))
  const name = filed === '' ? spoken.name : spokenModel(entity.id, filed).name
  const versions = rows
    .filter((r) => !isDiscontinued(r) && modelKeyOf(entity, r) === key)
    .map((r): BoatFound => {
      const said = spokenBoat(entity.id, rowLabel(entity, r))
      return {
        place: { tableId: entity.id, rowId: r.id },
        name: said.name,
        detail: said.detail,
        maker: said.maker || makerOfTable(entity),
        code: textCell(entity, r, 'Model Code'),
      }
    })
  return { key, name, versions, at: versions.findIndex((v) => v.place.rowId === place.rowId) }
}

/** One version as its model's list says it: what the model's name does not already say —
 *  "PVC · White / White / White-Black" under the Highfield Sport 660. */
export function versionSaid(model: { name: string }, b: BoatFound): string {
  const extra = b.name.toLowerCase().startsWith(`${model.name.toLowerCase()} `)
    ? b.name.slice(model.name.length + 1)
    : b.name === model.name
      ? ''
      : b.name
  return [extra, b.detail].filter((said) => said !== '').join(' · ') || b.name
}

/** What one boat is paired with in one of its places, as the boat's page reads it: every pairing
 *  a person has not taken off. */
function pairedOn(ctx: CatalogueCtx, version: Place, target: string): Set<string> | null {
  const entity = ctx.entities[version.tableId]
  const row = (ctx.rowsByEntity[version.tableId] ?? []).find((r) => r.id === version.rowId)
  const join = pairingFor(ctx, version, { tableId: target, rowId: '' })
  if (!entity || !row || !join) return null
  const out = new Set<string>()
  for (const pair of readPairs(ctx, join, entity, row).values()) {
    if (pair.origin !== 'removed') out.add(pair.targetRowId)
  }
  return out
}

/**
 * HOW MANY OF THE MODEL'S VERSIONS TAKE EXACTLY THE MOTORS THIS ONE DOES — the one exception
 * where versions differ is said, never hidden behind the version chosen. `of` counts every version
 * still sold; `same` includes the boat itself.
 */
export function sameAcross(
  ctx: CatalogueCtx,
  model: BoatVersions,
  place: Place,
  motorTable: string,
): { same: number; of: number } {
  const mine = pairedOn(ctx, place, motorTable)
  if (!mine) return { same: model.versions.length, of: model.versions.length }
  let same = 0
  for (const v of model.versions) {
    const theirs = pairedOn(ctx, v.place, motorTable)
    if (theirs && theirs.size === mine.size && [...mine].every((id) => theirs.has(id))) same += 1
  }
  return { same, of: model.versions.length }
}

/** The sentence over the motors that says what a change here reaches. '' for a model of one. */
export function acrossSaid(name: string, across: { same: number; of: number }): string {
  if (across.of <= 1) return ''
  if (across.same === across.of) {
    return `All ${AU.format(across.of)} versions of the ${name} take these motors, and a change here is made on every one.`
  }
  const other = across.of - across.same
  return `${AU.format(across.same)} of the ${name}’s ${AU.format(across.of)} versions take these motors, and ${AU.format(other)} ${other === 1 ? 'takes' : 'take'} others. A change here is made on every version.`
}

/* ---------------------------------------------------------- */
/* A maker's models under their series                         */
/* ---------------------------------------------------------- */

export interface SeriesOfModels {
  /** the series as the file files it ("Sport", "Classic"); '' where the list keeps none */
  series: string
  models: BoatModel[]
}

/** The series one model is filed under: the list's first level, read off its first version. */
function seriesOfModel(world: World, model: BoatModel): string {
  const first = model.versions[0]
  if (!first) return ''
  const entity = world.entities[first.place.tableId]
  const row = (world.rowsByEntity[first.place.tableId] ?? []).find(
    (r) => r.id === first.place.rowId,
  )
  if (!entity || !row) return ''
  const field =
    entity.fields.find((f) => f.id === entity.hierarchy?.[0]) ??
    entity.fields.find((f) => f.name.trim().toLowerCase() === 'series')
  const v = field ? readCell(row, field.id) : null
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * A MAKER'S MODELS UNDER THE SERIES THE PRICE LIST FILES THEM IN (the fitment judge, major 12:
 * 67 models flat A to Z). Series in the order the file first names them; models within one in
 * the order a person counts them. A maker whose list keeps no series is one group with no head.
 */
export function bySeries(world: World, maker: BoatMaker): SeriesOfModels[] {
  const groups = new Map<string, BoatModel[]>()
  const order: string[] = []
  const firstAt = new Map<string, number>()
  for (const model of maker.models) {
    const series = seriesOfModel(world, model)
    if (!groups.has(series)) {
      groups.set(series, [])
      order.push(series)
    }
    groups.get(series)!.push(model)
    const at = Number(model.versions[0]?.place.rowId.split(':').at(-1) ?? 0)
    firstAt.set(series, Math.min(firstAt.get(series) ?? Number.POSITIVE_INFINITY, at))
  }
  return order
    .toSorted((a, b) => (firstAt.get(a) ?? 0) - (firstAt.get(b) ?? 0) || COUNTED.compare(a, b))
    .map((series) => ({ series, models: groups.get(series)! }))
}

/* ---------------------------------------------------------- */
/* Finding a model by its words                                */
/* ---------------------------------------------------------- */

export interface ModelFound {
  model: BoatModel
  maker: string
  /** its versions the typed words find, in the price list's order: the first is opened */
  found: BoatFound[]
}

/**
 * THE MODELS A FEW TYPED WORDS FIND — every word somewhere in one version's name, finish, code or
 * list, word by word, for `findBoats`' reason. A search for "660" answered in 36 colourways and
 * drew the first 12 (the fitment judge, major 12); it answers in models, every one drawn, each
 * with how many of its versions carry the words. Models no longer sold are left out.
 */
export function findModels(
  world: World,
  makers: readonly BoatMaker[],
  query: string,
): { models: ModelFound[]; versions: number } {
  const needles = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  if (needles.length === 0) return { models: [], versions: 0 }
  const out: ModelFound[] = []
  let versions = 0
  for (const maker of makers) {
    for (const model of maker.models) {
      const found = model.versions.filter((v) => {
        const entity = world.entities[v.place.tableId]
        if (!entity || isRetired(entity)) return false
        const row = (world.rowsByEntity[v.place.tableId] ?? []).find((r) => r.id === v.place.rowId)
        const label = row ? rowLabel(entity, row) : ''
        const hay =
          `${model.name} ${v.name} ${v.detail} ${label} ${v.code} ${entity.name} ${maker.maker}`.toLowerCase()
        return needles.every((n) => hay.includes(n))
      })
      if (found.length === 0) continue
      versions += found.length
      out.push({ model, maker: maker.maker, found })
    }
  }
  return { models: out, versions }
}
