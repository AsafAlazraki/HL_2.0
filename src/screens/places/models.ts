/* ============================================================
   A MAKER'S LINE-UP, READ ONCE FROM THE PRICE LIST — the models the
   page stands on, each with its picture, its figures, its measures and
   what it carries; the series that filter them; the spans the head and
   the Prices plate print. Every figure is a domain reader's
   (`@/domain/lineup`) or the picker's own (`brandOf`, which is what a
   quote is started from), so the from-price on a card is the figure the
   quote would open at.
   ============================================================ */
import type { CatalogueCtx, EntityDef, PriceLevel, RowData } from '@/domain/model'
import type { Picture, PictureBook } from '@/domain/model/pictures'
import { itemOf } from '@/data/pictures'
import { imageAddressOf } from '@/domain/fitment/boat'
import { carriesOf, NOTHING_CARRIED, type Carries } from '@/domain/lineup/carries'
import {
  measuresOf,
  threeFacts,
  type ModelMeasures,
  type ThreeFacts,
} from '@/domain/lineup/measure'
import { headingSaid, lengthSpan, levelsRead, spanAt, type Span } from '@/domain/lineup/range'
import { brandOf, type Model } from '@/screens/picker/fleet'

export interface LineupModel {
  /** the anchor row's id: the picker's model, Fitment's boat */
  key: string
  /** its place in the price list's own order */
  at: number
  /** "Sport 660" */
  said: string
  /** "Highfield Sport 660" */
  spoken: string
  /** the file's Model Code, '' where it files none */
  code: string
  /** the series as filed ('' for none) */
  series: string
  versions: number
  /** the materials it is built in, said — "PVC", "Hypalon" */
  materials: string[]
  from: number | null
  to: number | null
  priced: number
  zeroes: number
  measures: ModelMeasures
  facts: ThreeFacts
  carries: Carries
  /** its own picture: the catalogue render, or its own photograph on the water; null for none */
  picture: Picture | null
  /** every photograph of it on the water */
  photographs: Picture[]
}

export interface LineupSeries {
  /** the series as filed, '' for the models filed under none */
  key: string
  name: string
  models: LineupModel[]
  /** the series' span at the page's price, across its versions */
  span: Span
  /** the first of its models with a picture */
  picture: Picture | null
}

export interface LevelSpans {
  level: PriceLevel
  /** one span per series, then the whole maker */
  bySeries: { key: string; name: string; span: Span }[]
  whole: Span
}

export interface Lineup {
  models: LineupModel[]
  series: LineupSeries[]
  /** the price a card prints, by the register's own name — "Cash" */
  rung: string
  /** the whole maker at that price, across its versions */
  span: Span
  length: { lo: number; hi: number } | null
  /** the register files a series column at all (Formosa files none) */
  filesSeries: boolean
  /** the models filed under no series, named, or [] */
  unfiled: string[]
  /** the spans at every price a customer may be shown, by series */
  prices: LevelSpans[]
  /** declared, and kept as Northside's own: named, never a figure */
  kept: PriceLevel[]
  /** dealer rules switched on, which Fitment reads and these counts do not */
  rulesInForce: number
}

const plain = (s: string): string => s.trim().toLowerCase()

function codeOf(table: EntityDef, row: RowData | undefined): string {
  const field = table.fields.find((f) => plain(f.name) === 'model code')
  const v = field && row ? row.values[field.id] : null
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
}

export function readLineup(ctx: CatalogueCtx, table: EntityDef, book: PictureBook): Lineup {
  const rows = ctx.rowsByEntity[table.id] ?? []
  const brand = brandOf(table, rows)
  const byId = new Map(rows.map((r) => [r.id, r]))
  const carried = carriesOf(
    ctx,
    table.id,
    brand.models.map((m) => m.key),
  )
  const rowsOf = (m: Model): RowData[] =>
    m.variants.map((v) => byId.get(v.rowId)).filter((r): r is RowData => r !== undefined)

  const models: LineupModel[] = brand.models.map((m, at) => {
    const own = rowsOf(m)
    const anchor = byId.get(m.key)
    const item = itemOf(table.id, m.key, anchor ? imageAddressOf(table, anchor) : undefined)
    const measures = measuresOf(table, own)
    const hero = book.hero(item)
    return {
      key: m.key,
      at,
      said: m.shown,
      spoken: m.spoken,
      code: codeOf(table, anchor),
      series: m.series,
      versions: m.rows,
      materials: m.materials.filter((x) => x.name !== '').map((x) => x.label),
      from: m.from,
      to: m.to,
      priced: m.priced,
      zeroes: m.zeroes,
      measures,
      facts: threeFacts(table, measures),
      carries: carried.get(m.key) ?? NOTHING_CARRIED,
      picture: book.catalogue(item) ?? hero,
      photographs: book
        .heroes()
        .filter((h) => h.table === table.id && own.some((r) => h.rows.includes(r.id))),
    }
  })
  const byKey = new Map(models.map((m) => [m.key, m]))
  const levels = levelsRead(table)
  const rung = levels.shown.find((l) => l.label === brand.rung) ?? levels.shown[0]
  const versionsOf = (list: readonly Model[]): RowData[] => list.flatMap(rowsOf)

  const series: LineupSeries[] = brand.series.map((s) => {
    const list = s.models.map((m) => byKey.get(m.key)).filter((m): m is LineupModel => !!m)
    return {
      key: s.name,
      name: s.name === '' ? 'Filed under no series' : headingSaid(s.label),
      models: list,
      span: rung
        ? spanAt(versionsOf(s.models), rung.fieldId)
        : { lo: null, hi: null, priced: 0, of: 0 },
      picture: list.find((m) => m.picture !== null)?.picture ?? null,
    }
  })
  const all = versionsOf(brand.models)
  return {
    models,
    series,
    rung: brand.rung,
    span: rung ? spanAt(all, rung.fieldId) : { lo: null, hi: null, priced: 0, of: all.length },
    length: lengthSpan(models.map((m) => m.measures)),
    filesSeries: brand.filesSeries,
    unfiled: series.find((s) => s.key === '')?.models.map((m) => m.said) ?? [],
    prices: levels.shown.map((level) => ({
      level,
      bySeries: brand.series.map((s) => ({
        key: s.name,
        name: s.name === '' ? 'Filed under no series' : headingSaid(s.label),
        span: spanAt(versionsOf(s.models), level.fieldId),
      })),
      whole: spanAt(all, level.fieldId),
    })),
    kept: levels.kept,
    rulesInForce: (ctx.constraintDefs ?? []).filter((c) => c.enabled !== false).length,
  }
}
