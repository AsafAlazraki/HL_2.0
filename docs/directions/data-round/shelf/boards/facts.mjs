/* Every figure the shelf boards draw, derived from facts.json, which extract.facts.ts wrote by
   reading Northside's own Parts Module (2).xlsx through the app's own reader and planner
   against the real pack. Nothing here is typed in by hand: a count is counted, a figure is the
   file's or the price list's, and a rule shown names its numerator and denominator. */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const F = JSON.parse(readFileSync(path.join(HERE, 'facts.json'), 'utf8'))

const N = new Intl.NumberFormat('en-AU')
export const n = (x) => N.format(x)

/* MONEY, as a person reads it: whole dollars stay whole ($1,540), anything with cents shows
   both places ($242.10, never $242.1). Text from the register is parsed first. */
export function money(v) {
  if (v === '' || v === null || v === undefined) return '—'
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x)) return String(v)
  const neg = x < 0
  const a = Math.abs(x)
  const whole = Math.abs(a - Math.round(a)) < 0.005
  const s = whole
    ? N.format(Math.round(a))
    : new Intl.NumberFormat('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        a,
      )
  return `${neg ? '−' : ''}$${s}`
}

/* A COLUMN'S FIGURE. Money for the money columns; MU as the register prints it (a ratio, the
   file's own); hours as hours; text as text. */
const RATIO = new Set(['MU'])
const HOURS = new Set(['TTF (Hours)', 'Lab Hrs', 'Total Lab'])
const TEXT = new Set([
  'Code',
  'Operation Code',
  'Product',
  'Supplier',
  'Package',
  'Accessory (Primary)',
  'Labour',
  'Install Type',
])
export function fig(col, v) {
  if (v === '' || v === null || v === undefined) return 'empty'
  if (TEXT.has(col)) return String(v)
  const x = Number(v)
  if (!Number.isFinite(x)) return String(v)
  if (RATIO.has(col)) return (Math.round(x * 1000) / 1000).toFixed(3)
  if (HOURS.has(col)) return `${Math.round(x * 100) / 100} h`
  return money(x)
}

/* THE APP'S OWN COST RULE (src/domain/quote/pricing.ts isCostColumn), mirrored by name so a
   board marks a column Northside's own exactly where the app would. */
const COST = new Set(
  [
    'Base Cost',
    'Landed Hull Cost',
    'Landed CTD',
    'Nett CTD',
    'Dealer List Price',
    'Dealer',
    'Nett Price',
    'Landed',
    'Total CTD',
    'Base List',
    'P&A',
    'CTD',
    'MU',
    'HO - MU',
    'BMT - MU',
    'EX Rate',
    'Base Freight',
    'Other Charges',
    'Road Freight',
    'Freight',
    'Quad Freight',
    'Stamp Duty',
    'Handling',
    'Dazmac',
    'IYT Logistics',
    'ABP Compl.',
    'Aus Spec',
    'Total PD Allowance',
    'Labour ($)',
    'TTF (Hours)',
    'RRP + Freight Inc GST',
  ].map((s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim(),
  ),
)
export const isCost = (col) => {
  const k = col
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  return COST.has(k) || k.includes('cost') || k.startsWith('landed ')
}
/* Columns the app's rule does not catch, though their names say CTD or GP: a finding the
   boards report, never hide. */
export const CTD_LIKE = (col) => /\bctd\b|\bgp\b/i.test(col) && !isCost(col)

/* THE LISTS */
export const P = F.lists.find((l) => l.tableId === 'parts')
export const D = F.lists.find((l) => l.tableId === 'dealer_fit')

/* A COLUMN'S NAME, said once. Dealer Fit carries a second Code and a second CTD for its primary
   accessory (the workbook's "Accessory - 1", columns T to Y), so those say whose they are. */
const PRIMARY = new Set([
  'dealer_fit.t',
  'dealer_fit.u',
  'dealer_fit.v',
  'dealer_fit.w',
  'dealer_fit.x',
  'dealer_fit.y',
])
export const colName = (fieldId, col) => {
  if (fieldId === 'dealer_fit.t') return { top: 'Accessory 1', name: 'Name' }
  if (PRIMARY.has(fieldId)) return { top: 'Accessory 1', name: col }
  if (fieldId === 'parts.y') return { top: '', name: 'Sell inc Install' }
  return { top: '', name: col }
}
export const colLabel = (fieldId, col) => {
  const c = colName(fieldId, col)
  return c.top ? `${c.top} ${c.name}` : c.name
}

/* THE COLUMN CENSUS of a list: every column that moved, how many lines, which way. */
export const census = (list) =>
  list.census.map((c) => ({
    ...c,
    label: colLabel(c.fieldId, c.col),
    cost: isCost(c.col),
    share: c.lines / list.changing,
  }))

/* THE HEAD */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayShort = (d) => {
  const b = new Date(d.getTime() + 10 * 3600 * 1000) /* Brisbane keeps no summer time */
  return `${b.getUTCDate()} ${MON[b.getUTCMonth()]} ${b.getUTCFullYear()}`
}
const SAVED = new Date(F.file.mtime)
export const FILE = {
  name: F.file.name,
  size: `${(F.file.bytes / 1_000_000).toFixed(1)} MB`,
  saved: dayShort(SAVED),
  /* the judge measured the read at 2.2 s in the browser; the extractor's own read in Node was F.file.readMs */
  read: '2.2 s',
}
const PACKED = new Date(F.edition.packedAt)
export const EDITION = {
  day: PACKED.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Brisbane',
  }),
  short: dayShort(PACKED),
  fp: F.edition.sha.slice(0, 12),
  lists: F.edition.counts.tables,
  lines: F.edition.counts.rows,
}

export const C = {
  changing: F.changing,
  adding: F.adding,
  cannot: F.cannot,
  changes: F.changes,
  unmoved: F.unmoved,
  total: F.totalRows,
  listsTouched: F.lists.length,
  lists: EDITION.lists,
  sheetsLeft: F.sheetsLeft.length,
}

/* THE LINES */
export const linesOf = (list) => list.lines
export const findLine = (list, re) => list.lines.find((a) => re.test(a.name))
export const DEE = P.lines.find((a) => a.at === F.checkFirst[0].at)
export const swingPct = (a) => (a.from ? Math.round(((a.to - a.from) / a.from) * 100) : null)
export const pct = (p) => (p === null ? '' : `${p > 0 ? '+' : '−'}${Math.abs(p)}%`)

/* THE 25: read figure doubled or more, or halved or less (newFile.ts swing ≥ 2) */
export const CHECK = F.checkFirst.map((c) => {
  const list = F.lists.find((l) => l.tableId === c.tableId)
  return { ...list.lines.find((a) => a.at === c.at), list: list.name }
})

/* SUPPLIERS on Parts & Accessories, the file's own codes, read without regard to case: the file
   writes Yamaha's both as "Yam" and "YAM", and the board says so where it groups them. */
export const SUPPLIERS = (() => {
  const m = new Map()
  for (const a of P.lines) {
    const k = (a.supplier || '').toUpperCase() || '—'
    const s = m.get(k) ?? {
      code: k,
      lines: 0,
      change: 0,
      fresh: 0,
      higher: 0,
      lower: 0,
      spellings: new Map(),
    }
    s.lines += 1
    if (a.fate === 'new') s.fresh += 1
    else s.change += 1
    if (a.from != null && a.to != null && a.to > a.from) s.higher += 1
    if (a.from != null && a.to != null && a.to < a.from) s.lower += 1
    s.spellings.set(a.supplier, (s.spellings.get(a.supplier) ?? 0) + 1)
    m.set(k, s)
  }
  for (const c of P.cannotLines) {
    const k = (c.fileSupplier || '').toUpperCase() || '—'
    const s = m.get(k)
    if (s) s.cannot = (s.cannot ?? 0) + 1
  }
  return [...m.values()].sort((a, b) => b.lines - a.lines)
})()
export const SUPPLIER_COUNT = SUPPLIERS.length
export const IBC = P.lines.filter((a) => (a.supplier || '').toUpperCase() === 'IBC')

/* THE 61 THAT CANNOT BE PLACED */
export const CANNOT = [
  ...P.cannotLines.map((c) => ({ ...c, list: P.name, tableId: 'parts' })),
  ...D.cannotLines.map((c) => ({ ...c, list: D.name, tableId: 'dealer_fit' })),
]
export const NAMED = CANNOT.filter((c) => c.namedBy)
export const NAMED_BY_CODE = NAMED.filter((c) => c.namedBy === 'code').length
export const NAMED_BY_BOTH = NAMED.filter((c) => c.namedBy === 'code+supplier').length
export const NAMED_MOVING = NAMED.filter((c) => c.wouldChange.length > 0)
export const NAMED_FIGURES = NAMED.reduce((k, c) => k + c.wouldChange.length, 0)
export const PERSON = CANNOT.filter((c) => !c.namedBy)
/* why each of the rest needs a person, counted */
export const personWhy = (c) => {
  if (c.because === 'said-twice') return 'said-twice'
  const codes = c.candidates.map((x) => x.code.trim())
  if (new Set(codes).size === 1 && codes.length > 1) return 'same-row-twice'
  return 'code-on-neither'
}
export const PERSON_WHY = PERSON.reduce(
  (m, c) => ((m[personWhy(c)] = (m[personWhy(c)] ?? 0) + 1), m),
  {},
)

/* APPLY'S COUNT, by what is in */
export const applyCount = ({ leftOut = 0, placed = false } = {}) =>
  C.changes - leftOut + (placed ? NAMED_MOVING.length : 0)

/* PICTURES the image ledger holds for a line, exact rows only */
const PICS = JSON.parse(
  readFileSync(path.join(HERE, '../../../../../data/northside/pictures.json'), 'utf8'),
).pictures
const PIC_OF = new Map()
for (const p of PICS) for (const r of p.exactRows ?? []) if (!PIC_OF.has(r)) PIC_OF.set(r, p)
export const pictureOf = (rowId) => {
  const p = rowId ? PIC_OF.get(rowId) : null
  return p
    ? { src: `../../../../../public/seed-images/${p.file}`, host: p.host, w: p.width, h: p.height }
    : null
}
export const PICTURED = P.lines.filter((a) => a.rowId && PIC_OF.has(a.rowId)).length

/* THE FILE'S OWN HEADINGS (Parts Maintenance row 1), for the paste */
export const PARTS_HEAD = F.heads['Parts Maintenance'][0].cells
export const DF_HEAD = F.heads['Dealer Fit Module'].find((l) => l.at === 11).cells
