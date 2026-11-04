/* What the three boards print, read from facts.out (written by extract.facts.ts through the app's
   own fleet, fitment, livery and picture readers). This file only says the figures: it counts
   what the readers handed over and sums nothing a reader did not already count. No cost column
   is ever read: Base Cost, Landed Hull Cost, Nett CTD and MU % are not in facts.out at all. */
import { readFileSync } from 'node:fs'

const F = JSON.parse(readFileSync(new URL('./facts.out', import.meta.url), 'utf8'))

export const HF = F.highfield
export const JE = F.jeanneau
export const PL = F.places
export const MOTORS = F.motors
export const YAM_LEVELS = F.yamLevels
export const LABOUR = F.labour
export const OBS = F.obsolete
export const HEROES = F.heroes
export const ALL_PLACES = F.allPlaces
export const PACKED = new Date(F.packedAt).toLocaleDateString('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Brisbane',
})

const nf = new Intl.NumberFormat('en-AU')
export const n = (x) => nf.format(x)
export const money = (x) => (x == null ? '' : '$' + nf.format(Math.round(x)))
export const plural = (k, one, many = one + 's') => `${n(k)} ${k === 1 ? one : many}`

/* ---- a model's facts, as the file writes them ---- */
const tidy = (s) =>
  String(s)
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/\s+x\s+/gi, ' × ')
    .trim()
export const metres = (sp) => (!sp ? null : sp.lo === sp.hi ? `${sp.lo} m` : `${sp.lo}–${sp.hi} m`)
export const people = (sp) => (!sp ? null : `${sp.words.map(tidy).join(' or ')} people`)
const hpWord = (w) => tidy(w.replace(/\s*HP\s*$/i, '').replace(/HP/gi, ''))
export const hp = (spec) => {
  const lo = spec.minHp?.words?.[0]
  const hi = spec.maxHp?.words?.at(-1)
  if (!lo && !hi) return null
  if (!lo) return `up to ${hpWord(hi)} hp`
  if (!hi || hpWord(lo) === hpWord(hi)) return `${hpWord(lo)} hp`
  const a = hpWord(lo),
    b = hpWord(hi)
  return / /.test(a + b) ? `${a} to ${b} hp` : `${a}–${b} hp`
}
export const kg = (sp) =>
  !sp ? null : sp.lo === sp.hi ? `${n(sp.lo)} kg` : `${n(sp.lo)}–${n(sp.hi)} kg`
export const words = (sp) =>
  !sp
    ? null
    : sp.words
      ? sp.words.map(tidy).join(' / ')
      : sp.lo === sp.hi
        ? String(sp.lo)
        : `${sp.lo}–${sp.hi}`
/** the three a person asks first, in the order they ask: how long, how many, how much motor */
export const three = (m) => [metres(m.spec.length), people(m.spec.people), hp(m.spec)]

/** the model's price at a level, said once: "from $61,700", or one figure where it has one */
export const at = (m, key = 'cash') => {
  const l = m.levels.find((x) => x.key === key)
  if (!l || l.priced === 0)
    return { said: 'No price at ' + (l?.label ?? key), lo: null, hi: null, l }
  return {
    said: l.lo === l.hi ? money(l.lo) : `from ${money(l.lo)}`,
    lo: l.lo,
    hi: l.hi,
    l,
    all: l.priced === l.of,
  }
}

/* ---- the range, in the file's own order ---- */
export const byKey = (brand) => new Map(brand.models.map((m) => [m.key, m]))
export const seriesOf = (brand) =>
  brand.series.map((s) => {
    const k = byKey(brand)
    const models = s.models.map((key) => k.get(key))
    return { ...s, list: models }
  })
export const model = (brand, said) => brand.models.find((m) => m.said === said)

/** a span over models at a level, with the versions priced counted */
export const spanAt = (models, key) => {
  const ls = models.map((m) => m.levels.find((l) => l.key === key)).filter(Boolean)
  const los = ls.filter((l) => l.lo != null)
  return {
    lo: los.length ? Math.min(...los.map((l) => l.lo)) : null,
    hi: los.length ? Math.max(...los.map((l) => l.hi)) : null,
    priced: ls.reduce((a, l) => a + l.priced, 0),
    of: ls.reduce((a, l) => a + l.of, 0),
  }
}
export const lengthSpan = (models) => {
  const ls = models.map((m) => m.spec.length).filter(Boolean)
  return { lo: Math.min(...ls.map((l) => l.lo)), hi: Math.max(...ls.map((l) => l.hi)) }
}

/* ---- what one model carries, from the fitment reading ---- */
export const carries = (m) => {
  const f = m.fit
  if (!f) return null
  const list = (kind) => f.lists.find((l) => l.kind === kind)
  const df = list('package')
  const pd = list('accessory')
  return {
    motors: f.motors,
    starred: f.starred[0] ?? null,
    motorTakes: f.motorTakes,
    trailers: f.trailers,
    trailerStar: f.trailerList.find((t) => t.starred) ?? null,
    dealerFit: df ? df.offered : 0,
    parts: pd ? pd.offered : 0,
    total: f.motors + f.trailers + (df ? df.offered : 0) + (pd ? pd.offered : 0),
    f,
    df,
    pd,
  }
}

export const shortName = (name) => name.replace(/^Highfield\s+/, '')
export const PICK = { a: 'Sport 660', compare: ['Sport 560', 'Sport 600', 'Sport 660'] }
