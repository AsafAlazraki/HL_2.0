/**
 * Every figure the sheet-redesign boards state, re-measured off the pack.
 *
 *   node docs/directions/sheet-redesign/measure.mjs
 *
 * The boards were drawn by a generator that read the same files; this is the part of it a
 * critic needs, so a sentence on a board can be checked against the file without trusting it.
 * Reads data/northside only. Writes nothing.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const read = (p) => JSON.parse(readFileSync(join(root, 'data', 'northside', p), 'utf8'))
const entities = read('entities.json')
const list = Array.isArray(entities) ? entities : (entities.entities ?? Object.values(entities))
const images = new Map(read('images.json').images.map((i) => [i.address, i]))
const txt = (x) => (x == null ? '' : Array.isArray(x) ? x.map((y) => y.src).join('|') : String(x))

const E = list.find((x) => x.id === 'boat_highfield')
const rows = read('tables/boat_highfield.json')
const v = (r, k) => r.values[`boat_highfield.${k}`]
const out = (label, value) => console.log(`${label.padEnd(72)} ${value}`)

/* ---- said once: across the table, across a series, across a model ---------------------- */
const tableConst = E.fields.filter((f) => new Set(rows.map((r) => txt(r.values[f.id]))).size === 1)
out(
  'Highfield columns with one value on all 588 rows',
  tableConst.map((f) => `${f.name}=${txt(rows[0].values[f.id])}`).join(' · '),
)

const series = new Map()
for (const r of rows) {
  const s = v(r, 'series')
  const m = v(r, 'model')
  if (!series.has(s)) series.set(s, new Map())
  if (!series.get(s).has(m)) series.get(s).set(m, [])
  series.get(s).get(m).push(r)
}
const spec = ['g', 'h', 'i', 'k', 'l', 'm', 'o', 'p', 'q', 's', 't', 'kv', 'kw', 'kx', 'ky', 'km']
const models = [...series.values()].flatMap((ms) => [...ms.entries()])
const sharing = models.filter(([, rs]) =>
  spec.every((k) => new Set(rs.map((r) => txt(v(r, k)))).size === 1),
)
out(
  'models holding one value in each of the 16 spec columns',
  `${sharing.length} of ${models.length}`,
)
const coaster = models.find(([m]) => m === 'Coaster')
out(
  'Coaster spec columns that differ between its rows',
  spec.filter((k) => new Set(coaster[1].map((r) => txt(v(r, k)))).size > 1).length,
)
const rollUp = [...series.get('Roll-Up').values()].flat()
out(
  'Roll-Up columns every row shares (said on its band)',
  ['ky', 'kx', 'o', 't'].map((k) => `${k}=${txt(v(rollUp[0], k))}`).join(' · '),
)

/* ---- the pack: columns that say one thing ------------------------------------------------ */
let said = 0
let empty = 0
let tables = 0
let cols = 0
for (const T of list) {
  let rs
  try {
    rs = read(`tables/${T.id}.json`)
  } catch {
    continue
  }
  cols += T.fields.length
  let here = 0
  for (const f of T.fields) {
    const s = new Set(rs.map((r) => txt(r.values[f.id])))
    if (s.size !== 1) continue
    if ([...s][0] === '') empty++
    else (said++, here++)
  }
  if (here) tables++
}
out(
  'pack: columns with one non-empty value on every row / tables / empty columns',
  `${said} of ${cols} in ${tables} of 53 tables · ${empty} empty on every row`,
)

/* ---- material × colourway ------------------------------------------------------------------ */
const split = (s) => /^(PVC|HYP) (\S+)$/.exec(s)
out(
  'variants whose Variant reads as material and colourway',
  `${rows.filter((r) => split(v(r, 'variant'))).length} of ${rows.length}`,
)
let byMaterial = 0
let colourToo = 0
let single = 0
for (const [, rs] of models) {
  if (rs.some((r) => !split(v(r, 'variant')))) continue
  const by = new Map()
  for (const r of rs) {
    const k = split(v(r, 'variant'))[1]
    if (!by.has(k)) by.set(k, new Set())
    by.get(k).add(v(r, 'qr'))
  }
  if (by.size === 1) single++
  else if ([...by.values()].every((s) => s.size === 1)) byMaterial++
  else colourToo++
}
out(
  'models in PVC and HYP priced by material alone / colourway too / one material',
  `${byMaterial} / ${colourToo} (of ${byMaterial + colourToo}) / ${single}`,
)

/* ---- pictures ------------------------------------------------------------------------------ */
const pic = (r) => {
  const f = v(r, 'f')
  if (!f?.length) return 'none'
  return images.get(f[0].src)?.file ? 'held' : 'link'
}
const held = rows.filter((r) => pic(r) === 'held').length
const link = rows.filter((r) => pic(r) === 'link').length
out(
  'rows with a held copy / held as a link / no address',
  `${held} / ${link} / ${rows.length - held - link}`,
)
out(
  'models with at least one held copy',
  `${models.filter(([, rs]) => rs.some((r) => pic(r) === 'held')).length} of ${models.length}`,
)
out(
  'Roll-Up models with a held copy',
  `${[...series.get('Roll-Up').values()].filter((rs) => rs.some((r) => pic(r) === 'held')).length} of ${series.get('Roll-Up').size}`,
)

/* ---- the row the finder opens -------------------------------------------------------------- */
const r496 = rows.find((r) => r.id === 'boat_highfield:496')
out('boat_highfield:496', `${v(r496, 'c')} · ${v(r496, 'd')} · Cash ${v(r496, 'qr')}`)
const pairs = read('tables/join_hf_yam.json').filter(
  (p) => p.values['join_hf_yam.boat'] === r496.id,
)
out(
  'its motors on Highfield × Yamaha, recommended first',
  pairs
    .map(
      (p) =>
        `${p.values['join_hf_yam.label'].split(' · ')[1]}${p.values.__recommended ? ' ★' : ''}`,
    )
    .join(', '),
)

/* ---- tables the engine windows ------------------------------------------------------------- */
const manifest = read('manifest.json')
out(
  'tables over VIRTUALIZE_ABOVE (150 rows)',
  `${manifest.tables.filter((t) => t.rowCount > 150).length} of ${manifest.tables.length}`,
)
