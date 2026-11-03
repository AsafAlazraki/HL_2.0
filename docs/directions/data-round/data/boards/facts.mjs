/*
  THE FIGURES THE THREE BOARDS DRAW, AND WHERE EACH ONE WAS READ. 2026-11-03.

  Nothing here is typed from memory. Three sources, each named on its line:

    FILE  read by this module from data/northside (manifest.json and tables/*.json) when the
          boards are drawn: the lists, their lines, the 28 lists of what fits, the headings
          that carry an "as at" date, the sections named Highfield, the lines naming F115.
    APP   read off the built app (e2e/out/dist-6230, the judge's own build) through the real
          door on 2026-11-03, by the screen that owns the figure: /data, /review, /levels,
          /rules, /fitment, /catalogue, /shelf. The walk's text dumps were read, not kept.
    READER  the Review queue's own reader (src/domain/rules/review/cases.ts queueOf over
          checks.ts review), run over the seed through src/test/fixtures/pack.ts: 37 cases,
          the same 37 /review prints, split here by the list each case is on.
*/
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const REPO = path.resolve(HERE, '../../../../..')
const DATA = path.join(REPO, 'data/northside')
const json = (rel) => JSON.parse(readFileSync(path.join(DATA, rel), 'utf8'))

export const manifest = json('manifest.json')
const rowsOf = (t) => json(t.file)

/* FILE ------------------------------------------------------------------------------------ */
export const LISTS = manifest.counts.tables // 53
export const LINES = manifest.counts.rows // 15,691
export const PACKED = manifest.packedAt // 2026-09-16T08:16:21.258Z

const tables = manifest.tables
export const byKey = Object.fromEntries(tables.map((t) => [t.key, t]))
export const joins = tables.filter((t) => t.role === 'join')
export const JOIN_LINES = joins.reduce((a, t) => a + t.rowCount, 0) // 8,679
export const boats = tables.filter((t) => t.role === 'base' && t.kind === 'boat')
export const BOAT_LINES = boats.reduce((a, t) => a + t.rowCount, 0) // 810
export const base = tables.filter((t) => t.role === 'base' && t.kind !== 'boat')
export const BASE_LINES = base.reduce((a, t) => a + t.rowCount, 0) // 6,202

/* Every row carries updatedAt; a line Northside changed is one whose updatedAt is after the
   packing. On the file as it arrives, that is none of them. */
let changed = 0
for (const t of tables) for (const r of rowsOf(t)) if (r.updatedAt > PACKED) changed++
export const CHANGED = changed

/* THE "AS AT" HEADINGS: a section heading (a list's series, category or section) that says in
   its own words the date it was priced. The parser here is the board's; the build gets a pure
   one in src/domain with tests. It reads d.m.yy, d.m.yyyy and d/m/yy as the heading writes
   them and never infers a date the heading does not carry. */
const HEAD = /\.(series|cat|sect)$/
const AS_AT = /as at (\d{1,2})[./](\d{1,2})[./](\d{2,4})/i
const dated = new Map()
const headsIn = new Map()
for (const t of tables) {
  if (t.role !== 'base') continue
  for (const r of rowsOf(t)) {
    for (const [k, v] of Object.entries(r.values)) {
      if (!HEAD.test(k) || typeof v !== 'string') continue
      const key = t.key + '|' + v
      if (!headsIn.has(t.key)) headsIn.set(t.key, new Set())
      headsIn.get(t.key).add(v)
      const m = AS_AT.exec(v)
      if (!m) continue
      const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])
      const iso = `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
      const d = dated.get(key) ?? { list: t.key, listName: t.name, heading: v, iso, lines: 0 }
      d.lines++
      dated.set(key, d)
    }
  }
}
export const DATED = [...dated.values()].sort((a, b) => a.iso.localeCompare(b.iso))
export const DATED_LISTS = [...new Set(DATED.map((d) => d.list))]
export const DATED_HEADINGS_IN_THOSE = DATED_LISTS.reduce((a, k) => a + headsIn.get(k).size, 0)
export const DATED_LINES = DATED.reduce((a, d) => a + d.lines, 0)
export const LINES_IN_DATED_LISTS = DATED_LISTS.reduce((a, k) => a + byKey[k].rowCount, 0)
export const datedByYear = (() => {
  const o = {}
  for (const d of DATED) {
    const y = d.iso.slice(0, 4)
    o[y] ??= { year: y, headings: 0, lines: 0 }
    o[y].headings++
    o[y].lines += d.lines
  }
  return Object.values(o)
})()
export const datedOf = (key) => DATED.filter((d) => d.list === key)

/* THE 28 LISTS OF WHAT FITS WHICH BOAT, by the boat maker each one names first. */
const MAKER_OF_JOIN = {
  hf: 'boat_highfield',
  stacer: 'boat_stacer',
  formosa: 'boat_formosa',
  stabicraft: 'boat_stabicraft',
  surtees: 'boat_surtees',
  jeanneau: 'boat_jeanneau',
  haines: 'boat_haines',
}
export const joinsOf = (boatKey) =>
  joins.filter((j) => MAKER_OF_JOIN[j.key.split('_')[1]] === boatKey)
/* the far side of a list of what fits, in the file's own words after the "×" */
export const farSide = (j) =>
  j.name
    .split('×')[1]
    .replace(/ — (Motor|Trailer) Fitment$/, '')
    .trim()

/* Which workbook tab a base list was read from: its first line's own source cell. */
export const tabOf = (key) => {
  const rows = rowsOf(byKey[key])
  const src = Object.entries(rows[0].values).find(([k]) => k.endsWith('.src'))?.[1] ?? ''
  return String(src).split('!')[0]
}

/* F115, AS A FIND WOULD ANSWER IT: the lines in each list whose own words name it. */
export function linesNaming(word) {
  const re = new RegExp(word, 'i')
  const out = []
  for (const t of tables) {
    let n = 0
    for (const r of rowsOf(t)) {
      for (const [k, v] of Object.entries(r.values)) {
        if (k.endsWith('.src')) continue
        if (typeof v === 'string' && re.test(v)) {
          n++
          break
        }
      }
    }
    if (n) out.push({ key: t.key, name: t.name, role: t.role, kind: t.kind, n })
  }
  return out
}
export function headingsNaming(word) {
  const re = new RegExp(word, 'i')
  const out = {}
  for (const t of tables) {
    if (t.role !== 'base' || t.kind === 'boat') continue
    for (const r of rowsOf(t))
      for (const [k, v] of Object.entries(r.values))
        if (HEAD.test(k) && typeof v === 'string' && re.test(v)) {
          out[t.key] ??= { name: t.name, heads: new Set(), lines: 0 }
          out[t.key].heads.add(v)
          out[t.key].lines++
        }
  }
  return Object.entries(out).map(([key, o]) => ({ key, name: o.name, heads: o.heads.size, lines: o.lines }))
}
export const yamahaF115 = rowsOf(byKey.mot_yamaha)
  .map((r) => r.values)
  .filter((v) => /F115/.test(v['mot_yamaha.d'] ?? ''))
  .map((v) => ({ series: v['mot_yamaha.series'], name: v['mot_yamaha.c'], code: v['mot_yamaha.d'], shaft: v['mot_yamaha.f'], steer: v['mot_yamaha.j'] }))

/* Series of a boat maker, counted in lines, in file order. */
export const seriesOf = (boatKey) => {
  const o = {}
  for (const r of rowsOf(byKey[boatKey])) {
    const s = r.values[boatKey + '.series']
    o[s] = (o[s] ?? 0) + 1
  }
  return Object.entries(o)
}
/* A base list's sections by size, largest first: the order a lineup is said in. */
export const sectionsOf = (key) => {
  const field = Object.keys(rowsOf(byKey[key])[0].values).find((k) => HEAD.test(k))
  const o = {}
  for (const r of rowsOf(byKey[key])) {
    const s = r.values[field]
    if (s == null || s === '') continue
    o[s] = (o[s] ?? 0) + 1
  }
  return Object.entries(o).sort((a, b) => b[1] - a[1])
}

/* APP ------------------------------------------------------------------------------------- */
/* The maker plates on /data (the judge's 1440 arrival frame and this walk agree). */
export const MAKERS = [
  { key: 'boat_highfield', name: 'Highfield', models: 67, series: 7, mark: 'highfield.svg' },
  { key: 'boat_stabicraft', name: 'Stabicraft', models: 37, series: 5, mark: null },
  { key: 'boat_stacer', name: 'Stacer', models: 91, series: 22, mark: 'stacer.png' },
  { key: 'boat_formosa', name: 'Formosa', models: 39, series: null, mark: 'formosa.png' },
  { key: 'boat_jeanneau', name: 'Jeanneau', models: 27, series: 2, mark: 'jeanneau.svg' },
  { key: 'boat_surtees', name: 'Surtees', models: 19, series: 3, mark: 'surtees.png' },
  { key: 'boat_haines', name: 'Haines Signature', models: 9, series: 3, mark: 'haines-signature.png' },
]
export const MODELS = MAKERS.reduce((a, m) => a + m.models, 0) // 289, as /fitment says

/* The eighteen base lists in /data's own nouns, groups and "fits" figures. */
export const BASE = [
  { group: 'Motors', rows: [
    { key: 'mot_yamaha', noun: 'motors', in: '9 series', fits: 264 },
    { key: 'mot_epropulsion', noun: 'motors', in: '1 series', fits: 0 },
  ] },
  { group: 'Factory packages', rows: [
    { key: 'mot_pkg_haines', noun: 'packages', in: '1 series', fits: 9 },
    { key: 'mot_pkg_jeanneau', noun: 'packages', in: '4 series', fits: 12 },
  ] },
  { group: 'Trailers', rows: [
    { key: 'trl_nsmcustom', noun: 'trailers', in: '8 series', fits: 116 },
    { key: 'trl_dunbier', noun: 'trailers', in: '15 series', fits: 0 },
    { key: 'trl_bmt', noun: 'trailers', in: '3 series', fits: 9 },
    { key: 'trl_mackay', noun: 'trailers', in: '6 series', fits: 0 },
    { key: 'trl_redco', noun: 'trailers', in: '4 series', fits: 0 },
    { key: 'trl_gfab', noun: 'trailers', in: '5 series', fits: 52 },
    { key: 'trl_stacertrailers', noun: 'trailers', in: '6 series', fits: 88 },
    { key: 'trl_obsolete', noun: 'trailers', in: '1 series', fits: null, gone: true },
  ] },
  { group: 'Parts and accessories', rows: [
    { key: 'parts', noun: 'products', in: '187 categories', fits: 273 },
    { key: 'rig_kits', noun: 'rigging kits', in: '26 sections', fits: 232 },
    { key: 'dealer_fit', noun: 'packages', in: '91 categories', fits: 118 },
  ] },
  { group: 'Northside’s own rates', rows: [
    { key: 'labour_rates', noun: 'rates', in: '', fits: 'own' },
    { key: 'oils_lubes', noun: 'consumables', in: '', fits: 'own' },
    { key: 'registration', noun: 'bands', in: '4 sections', fits: 'own' },
  ] },
]
export const UNNAMED = BASE.flatMap((g) => g.rows).filter((r) => r.fits === 0) // 4 lists
export const UNNAMED_LINES = UNNAMED.reduce((a, r) => a + byKey[r.key].rowCount, 0) // 311

/* /review: 37 to settle, the most money first, and 138 to tidy after them. */
export const REVIEW = {
  open: 37,
  tidy: 138,
  kinds: [
    ['the wrong size', 9],
    ['two prices', 3],
    ['no price', 18],
    ['two under one name', 4],
    ['nothing to name it', 3],
  ],
}
/* READER: the same 37, by the list each case is on. */
export const REVIEW_BY_LIST = {
  parts: 19,
  trl_gfab: 4,
  trl_dunbier: 3,
  trl_mackay: 3,
  rig_kits: 3,
  trl_redco: 2,
  dealer_fit: 2,
  boat_formosa: 1,
}
/* /levels: four answers yours to choose, by how many lines each prices; ten settled. */
export const PRICES = {
  open: 4,
  settled: 10,
  answers: [
    ['Dealer Fit', 1777, 'dealer_fit'],
    ['Rigging Kits', 650, 'rig_kits'],
    ['Yamaha Outboards', 209, 'mot_yamaha'],
    ['Factory packages', 89, 'mot_pkg_haines mot_pkg_jeanneau'],
  ],
}
export const PRICE_LINES = PRICES.answers.reduce((a, x) => a + x[1], 0) // 2,725
export const priceAsk = (key) => PRICES.answers.find((a) => a[2].split(' ').includes(key))
/* /rules: seven kept by the price list, none written by Northside, three noticed. */
export const RULES = { kept: 7, written: 0, noticed: 3 }
/* /catalogue: 2,238 parts on sale in 18 aisles, 197 with their own picture. */
export const CATALOGUE = { onSale: 2238, aisles: 18, pictured: 197 }
/* /shelf: no copy saved yet; quotes, customers, rules, settings and pictures of Northside's
   own all 0. No new price list has been brought in. */
export const SHELF = { copies: 0, own: 0, brought: 0 }
export const MADE_HERE = 0 // /data: no list made on this computer

export const fmt = (n) => n.toLocaleString('en-AU')
export const day = (iso) =>
  new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
