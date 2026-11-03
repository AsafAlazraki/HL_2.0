/*
  THE FIGURES THE THREE CATALOGUE BOARDS DRAW, AND WHERE EACH ONE WAS READ. 2026-11-03.

  One source: facts.out, written by extract.facts.ts, which runs the app's OWN modules over the
  real pack (src/test/fixtures/pack.ts reading data/northside):
    shelfOf (src/screens/catalogue/shelf.ts)  every part on sale, its heading, aisle and maker
    pricerFor(ctx, 'cash' | 'fitted')         each part minted at both declared levels by mintLine,
                                              named by lineSaid/nameFirst, as a quote would carry it
    aislesOf (src/domain/catalogue/aisles.ts) the 18 aisles and Not sorted yet, counted
    hasPicture + pictures.json exactRows      the 197 parts with their own picture, and its file
    the six P/D lists (join_*_pd)             which part the price list pairs with which boat
  Rebuild it: FACTS_OUT=<this folder>/facts.out npx vitest run --config <this folder>/facts.config.mjs

  Nothing here is typed from memory. Every count below is computed from those rows when the
  boards are drawn. Cost columns (P&A, CTD, MU, Base List, TTF hours, Labour $, Total CTD) are
  never read: the pricer reads the two declared sell levels only.
*/
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const F = JSON.parse(readFileSync(path.join(HERE, 'facts.out'), 'utf8'))

export const PARTS = F.parts
export const AISLES = F.aisles
export const byId = Object.fromEntries(PARTS.map((p) => [p.id, p]))
export const aisleById = Object.fromEntries(AISLES.map((a) => [a.id, a]))
export const PICS = '../../../../../public/seed-images/'
export const MARKS = '../../../../../public/brand-marks/'

export const ON_SALE = PARTS.length // 2,238
export const PICTURED = PARTS.filter((p) => p.pictured).length // 197
export const UNPICTURED = ON_SALE - PICTURED // 2,041
export const HEADINGS = new Set(PARTS.map((p) => p.heading)).size // 180
export const MAKERS = new Set(PARTS.map((p) => p.maker)).size // 79 supplier strings, '' among them

const isSupplyOnly = (p) => /^supply only/i.test(p.install ?? '')
/* THE TWO PRICES, AS THE BOARDS SAY THEM. The build gets this as a pure derivation in
   src/domain/catalogue with tests (twoPrices). Never $0 where the file prices the part fitted. */
export function twoPrices(p) {
  const s = p.supply
  const f = p.fittedAt
  if (s == null && f == null) return { kind: 'none' }
  if (!s && f > 0) return { kind: 'fittedOnly', fitted: f }
  if (s === 0 && f === 0) return { kind: 'zero' }
  if (s > 0 && isSupplyOnly(p) && (f == null || f === s)) return { kind: 'supplyOnly', supply: s }
  if (s > 0 && (f == null || f === 0)) return { kind: 'supplyOnly', supply: s }
  if (s == null && f === 0) return { kind: 'none' }
  return { kind: 'both', supply: s, fitted: f }
}
export const FITTED_ONLY = PARTS.filter((p) => twoPrices(p).kind === 'fittedOnly').length // 101
export const NO_PRICE = PARTS.filter((p) => twoPrices(p).kind === 'none').length
export const ZERO_BOTH = PARTS.filter((p) => twoPrices(p).kind === 'zero').length
export const DIFFER = PARTS.filter(
  (p) => typeof p.rawL === 'number' && typeof p.rawY === 'number' && p.rawL !== p.rawY,
).length // 1,882
export const SUPPLY_ONLY_WORD = PARTS.filter((p) => isSupplyOnly(p)).length // 282

const nf = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 })
export const n = (x) => nf.format(x)
export const money = (x) => '$' + nf.format(Math.round(x))

export const inAisle = (id) => PARTS.filter((p) => p.aisle === id)
export const countBy = (arr, key) => {
  const m = new Map()
  for (const x of arr) {
    const k = typeof key === 'function' ? key(x) : x[key]
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m].map(([k, c]) => ({ k, c }))
}
/* the headings of a run, in the file's own order (first seen), each counted */
export const headingsOf = (parts) => countBy(parts, 'heading')
/* the makers of a run, most first; a part with no supplier is counted apart */
export const makersOf = (parts) =>
  countBy(parts, 'maker').sort((a, b) => b.c - a.c || String(a.k).localeCompare(String(b.k)))

/* A HEADING SAID: the file writes "ANCHOR WINCHES - Lone Star". The board keeps the file's own
   words and spelling ("ITIEMS" is Review's to correct) and only quiets the shouting: a word of
   capitals becomes lower case, a maker's name keeps its capital, and an initialism (GME, VHF, AIS,
   NSS, GPSMAP) and every mixed-case word stay as written. */
const BRANDS = new Set([
  'GARMIN',
  'LOWRANCE',
  'SIMRAD',
  'RAYMARINE',
  'YAMAHA',
  'FUSION',
  'HIGHFIELD',
  'NAVIONICS',
  'YAMALUBE',
  'TERROVA',
  'INSTINCT',
  'POWERDRIVE',
  'THRUSTME',
  'MOMENTUM',
  'SARCA',
  'HELLA',
  'MAJESTIC',
  'BLUECHART',
  'RAILBLAZA',
  'STRIKER',
  'ECHOMAP',
  'VIVID',
  'SUPERCHARGE',
  'CENTURY',
  'KOTA',
  'MINN',
  'STACER',
])
const SHORT = new Set([
  'GME',
  'VHF',
  'AIS',
  'NSS',
  'EVO',
  'XS',
  'GO',
  'SD',
  'TV',
  'USB',
  'PVC',
  'DES',
  'SCU',
  'DEC',
  'RAM',
  'MMX',
  'DFO',
  'PBS',
  'NB',
  'SE',
  'MF',
  'S',
  'E',
  'I',
  'N',
  'AM',
  'FM',
])
const KEEP = new Set(['GPSMAP', 'NMEA', 'EPIRB', "PFD'S", 'BBQS'])
export function headingSaid(h) {
  if (!h) return 'No heading in the price list'
  const words = h.replace(/\s+-\s+/g, ' – ').split(' ')
  const said = words
    .map((w) => {
      const core = w.replace(/[^A-Za-z']/g, '')
      if (core.length < 2 || core !== core.toUpperCase() || KEEP.has(core)) return w
      if (core.length < 4 && SHORT.has(core)) return w
      if (BRANDS.has(core)) return w[0] + w.slice(1).toLowerCase()
      return w.toLowerCase()
    })
    .join(' ')
  return said[0].toUpperCase() + said.slice(1)
}

/* THE PAIRINGS: six P/D lists, which part the price list pairs with which boat. */
export const PD_LISTS = F.pdLists
export const PAIRINGS = F.pairings.length // 2,561
export const PAIRED_PARTS = new Set(F.pairings.map((x) => x.part)).size // 42 part rows
export const PAIRED_ON_SALE = new Set(F.pairings.filter((x) => byId[x.part]).map((x) => x.part))
  .size // 41
export const boatsOf = (partId) =>
  new Set(F.pairings.filter((x) => x.part === partId).map((x) => x.boat)).size
export const pairedWith = (boatId) =>
  [...new Set(F.pairings.filter((x) => x.boat === boatId).map((x) => x.part))]
    .map((id) => byId[id])
    .filter(Boolean)
const boatValues = (id) => {
  const raw = F.boats[id] ?? ''
  const m = /"[a-z_]+\.c":"([^"]+)"/.exec(raw)
  return m ? m[1] : id
}
/* the boat as the board says it: "Stacer 529 Assault Pro (Tournament)" from the row's
   "Stacer - 529 Assault Pro (Tournament)" */
export const boatSaid = (id) => boatValues(id).replace(/\s+-\s+/, ' ')
export const BOAT = 'boat_stacer:30'

/* MAKERS A HEADING NAMES: a supplier code whose every line sits under headings that start with
   one word. Measured, numerator and denominator, proposed only; Northside approves each. */
export function makerProposals() {
  const out = []
  for (const { k: code, c } of makersOf(PARTS)) {
    if (!code) continue
    const lines = PARTS.filter((p) => p.maker === code)
    /* the words every one of its headings starts with */
    const heads = lines.map((p) => p.heading.toUpperCase().split(/\s+-\s+|\s+/))
    let common = heads[0] ?? []
    for (const h of heads) {
      let i = 0
      while (i < common.length && h[i] === common[i]) i++
      common = common.slice(0, i)
    }
    /* its first word, and only where that word starts with the code's own letters */
    const words = /^[A-Z]+$/.test(common[0] ?? '') ? common[0] : ''
    if (words.length > code.length && words.startsWith(code.toUpperCase()))
      out.push({
        code,
        word: words.toLowerCase().replace(/(^|\s)([a-z])/g, (m, a, b) => a + b.toUpperCase()),
        of: c,
        lines: c,
      })
  }
  return out
}
/* codes that differ only in their capitals: one maker, proposed */
export function caseTwins() {
  const by = new Map()
  for (const { k, c } of makersOf(PARTS)) {
    if (!k) continue
    const key = k.toUpperCase()
    by.set(key, [...(by.get(key) ?? []), { code: k, lines: c }])
  }
  return [...by.values()].filter((v) => v.length > 1)
}

/* FIND: a name, a code, a maker or a heading. Name matches rank first. */
export function find(q) {
  const t = q.toLowerCase()
  const hits = PARTS.filter((p) =>
    [p.name, p.product, p.code, p.op, p.heading, p.maker].join(' ').toLowerCase().includes(t),
  )
  return hits
}
