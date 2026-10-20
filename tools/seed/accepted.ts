/**
 * WHAT THE JUDGES SAID, READ ONCE FOR EVERY TOOL THAT HOLDS A PICTURE OF A MODEL.
 *
 * `propose-images.ts` writes one proposal file per group under
 * `docs/research/imagery/proposals/` with a contact sheet beside it, and a person writes the
 * verdicts beside that (`<group>.verdicts.json`): accept or reject, what the picture depicts,
 * what it shows that a quote may not say, and the verification line. Nothing is held that a
 * verdict did not accept. This module reads both files and hands the tools that fetch —
 * `fetch-images.ts --accepted` (the catalogue tier), `heroes.ts` (the hero tier) and
 * `marks.ts` (a maker's mark) — one list, so the three cannot read the verdicts three ways.
 *
 * THE FILE'S NAMES ARE THE TRUTH. A verdict names its model the way the picker's own `fleetOf`
 * does, and `fleetIndex` resolves that name to the rows of the price file through the app's
 * own code (run under `app.hooks.mjs`), so a model the file does not carry fails loudly rather
 * than attaching a picture to nothing.
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '..', '..')
export const PROPOSALS = path.join(ROOT, 'docs', 'research', 'imagery', 'proposals')

/** One verdict, joined to the proposal it judged. */
export interface Judged {
  group: string
  n: number
  decision: 'accept' | 'reject'
  /** what it would be held as */
  kind: 'catalogue' | 'hero' | 'mark'
  /** `row-address` (the price file's own Image Link), `model`, `hull`, or `organisation` */
  scope: string
  table: string
  /** the file's own model names */
  models: string[]
  url: string
  pageUrl: string
  host: string
  depicts: string
  differs: string[]
  reason: string
  /** the rule a rejection names */
  rule: string
  verification: string
  /** who judged it, and when the judging was done */
  judgedBy: string
  judgedAt: string
  /** a licence line that bars holding the picture at all */
  licence: string
  licenceNote: string
  sourceWidth: number
  sourceHeight: number
  /** the findings the judge wrote for the whole group */
  findings: string[]
  /** where the verdict is */
  ref: string
}

type Loose = Record<string, unknown>
const s = (v: unknown): string => (typeof v === 'string' ? v : '')
const n = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

/** Every verdict in every group, in group then number order. */
export function readVerdicts(): Judged[] {
  const out: Judged[] = []
  const files = readdirSync(PROPOSALS)
    .filter((f) => f.endsWith('.verdicts.json'))
    .toSorted()
  for (const f of files) {
    const group = f.replace(/\.verdicts\.json$/, '')
    const v = JSON.parse(readFileSync(path.join(PROPOSALS, f), 'utf8')) as Loose
    const p = JSON.parse(readFileSync(path.join(PROPOSALS, `${group}.json`), 'utf8')) as Loose
    const proposals = (Array.isArray(p['proposals']) ? p['proposals'] : []) as Loose[]
    const verdicts = (Array.isArray(v['verdicts']) ? v['verdicts'] : []) as Loose[]
    for (const x of verdicts) {
      const q = proposals.find((y) => y['n'] === x['n']) ?? {}
      const decision = s(x['decision'])
      if (decision !== 'accept' && decision !== 'reject') continue
      const kind = s(x['kind']) || s(q['kind'])
      out.push({
        group,
        n: n(x['n']),
        decision,
        kind: kind === 'hero' ? 'hero' : kind === 'mark' ? 'mark' : 'catalogue',
        scope: s(q['scope']) || s(x['scope']),
        table: s(x['table']) || s(q['table']),
        models:
          list(x['models']).length > 0
            ? list(x['models'])
            : list(q['models']).length > 0
              ? list(q['models'])
              : [s(x['model']) || s(q['model'])],
        url: s(x['url']) || s(q['url']),
        pageUrl: s(x['pageUrl']) || s(q['pageUrl']),
        host: s(q['host']),
        depicts: s(x['depicts']) || s(q['depicts']),
        differs: list(x['differs']),
        reason: s(x['reason']),
        rule: s(x['rule']) || s(x['breaks']),
        verification: s(x['verification']),
        judgedBy: s(v['by']) || 'Claude (imagery judge)',
        judgedAt: s(v['judgedAt']),
        licence: s(x['licence']),
        licenceNote: s(q['licenceNote']),
        sourceWidth: n(q['sourceWidth']),
        sourceHeight: n(q['sourceHeight']),
        findings: list(v['findings']),
        ref: `docs/research/imagery/proposals/${f}#${n(x['n'])}`,
      })
    }
  }
  return out
}

/** Who verified it and how, in one sentence a ledger keeps. */
export const verifiedByOf = (j: Judged): string =>
  `${j.judgedBy.replace(/,?\s*by eye.*$/i, '')}, by eye on the contact sheet docs/research/imagery/proposals/${j.group}.png, judged ${j.judgedAt}; the sheet's verification line reads "${j.verification}"`

/* ------------------------------------------------------------------ */
/* The file's models, read through the app's own code                  */
/* ------------------------------------------------------------------ */

export interface FleetModel {
  tableId: string
  register: string
  name: string
  variants: { rowId: string; label: string; cell: string; code: string }[]
}
export interface PackRow {
  id: string
  values: Record<string, unknown>
}
export interface PackTable {
  id: string
  name: string
  kind?: string
  hierarchy?: string[]
  displayFieldId?: string
  fields?: { id: string; name?: string; type?: string }[]
}

export interface FleetIndex {
  /** `table::model name` → the model */
  models: Map<string, FleetModel>
  tables: Record<string, PackTable>
  rowsByEntity: Record<string, PackRow[]>
  /** the price file's own picture address on a row, or '' */
  addressOf(table: string, rowId: string): string
  /** the names the file gives a row (the domain's `namesOfRow`) */
  namesOfRow(table: PackTable, row: PackRow): string[]
  depictionOf: <P extends { table: string; model: string }>(
    p: readonly P[],
    tableId: string,
    names: readonly string[],
  ) => { picture: P } | null
}

const appModule = async <T>(rel: string): Promise<T> =>
  (await import(pathToFileURL(path.join(ROOT, rel)).href)) as T

/**
 * A MODEL AS EVERY SCREEN SAYS IT — "Highfield Classic 420", not the file's "CL420" — through
 * the app's own `spokenModel` and the names ledger, where it names the model; the caption's
 * words (`said`) otherwise. Needs the preload, as `fleetIndex` does.
 */
export async function spokenNamer(): Promise<
  (table: string, model: string, said: string) => string
> {
  const { spokenModel } = await appModule<{
    spokenModel: (table: string, model: string) => { name: string; from: string }
  }>('src/domain/quote/spoken.ts')
  return (table, model, said) => {
    const spoken = spokenModel(table, model)
    return spoken.from === 'maker' ? spoken.name : said
  }
}

/**
 * The picker's own models for every boat, motor and trailer register. Needs the preload:
 *
 *   npx tsx --tsconfig tsconfig.app.json --import ./tools/seed/app.hooks.mjs <tool>.ts
 */
export async function fleetIndex(): Promise<FleetIndex> {
  const { loadPack } = await appModule<{
    loadPack: () => Promise<{ entities: PackTable[]; rowsByEntity: Record<string, PackRow[]> }>
  }>('src/test/fixtures/pack.ts')
  const { fleetOf } = await appModule<{
    fleetOf: (
      t: Record<string, PackTable>,
      r: Record<string, PackRow[]>,
      kind: string,
    ) => { brands: { models: FleetModel[] }[] }
  }>('src/screens/picker/fleet.ts')
  const depicts = await appModule<Pick<FleetIndex, 'namesOfRow' | 'depictionOf'>>(
    'src/domain/catalogue/depicts.ts',
  )
  const pack = await loadPack()
  const tables: Record<string, PackTable> = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
  const models = new Map<string, FleetModel>()
  for (const kind of ['boat', 'motor', 'trailer']) {
    for (const brand of fleetOf(tables, pack.rowsByEntity, kind).brands) {
      for (const m of brand.models) models.set(`${m.tableId}::${m.name}`, m)
    }
  }
  const addressOf = (table: string, rowId: string): string => {
    const field = tables[table]?.fields?.find((f) => f.type === 'image')?.id
    const row = pack.rowsByEntity[table]?.find((r) => r.id === rowId)
    const cell = field ? row?.values[field] : undefined
    return Array.isArray(cell) ? s((cell[0] as Loose | undefined)?.['src']) : ''
  }
  return {
    models,
    tables,
    rowsByEntity: pack.rowsByEntity,
    addressOf,
    namesOfRow: depicts.namesOfRow,
    depictionOf: depicts.depictionOf,
  }
}

/** The model a verdict names, or a loud failure: never a picture attached to nothing. */
export function modelNamed(index: FleetIndex, table: string, name: string): FleetModel {
  const m = index.models.get(`${table}::${name}`)
  if (!m) throw new Error(`the price file carries no model "${name}" on ${table}`)
  return m
}

/**
 * THE ROWS A PICTURE SHOWS EXACTLY. On a model the file sells as one row, that row. On a model
 * the file splits into colourways (Highfield), only the rows whose own Image Link is this
 * address, or the rows the judge named by id in the depicts line ("row boat_highfield:392") —
 * every other colourway row gets the picture as the model's, never as its own. A hull's
 * picture, which cannot tell its packages apart, is exact for none of them.
 */
export function exactRowsOf(index: FleetIndex, j: Judged, models: FleetModel[]): string[] {
  if (j.scope === 'hull' || models.length !== 1) return []
  const model = models[0]!
  if (model.variants.length === 1) return [model.variants[0]!.rowId]
  const named = new Set([...j.depicts.matchAll(/\b([a-z]+_[a-z]+:\d+)\b/g)].map((m) => m[1]!))
  /* the judge's shorthand ":259" after a full id names a row of the same register */
  for (const m of j.depicts.matchAll(/(?:,|and|\()\s*:(\d+)\b/g)) named.add(`${j.table}:${m[1]}`)
  return model.variants
    .map((v) => v.rowId)
    .filter((id) => index.addressOf(j.table, id) === j.url || named.has(id))
}

/** A short, stable slug. */
export const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** The maker as a person says it, by register. */
const MAKER: Record<string, string> = {
  boat_highfield: 'Highfield',
  boat_stacer: 'Stacer',
  boat_stabicraft: 'Stabicraft',
  boat_surtees: 'Surtees',
  boat_formosa: 'Formosa',
  boat_haines: 'Haines',
  boat_jeanneau: 'Jeanneau',
  mot_epropulsion: 'ePropulsion',
  mot_yamaha: 'Yamaha',
  trl_dunbier: 'Dunbier',
  trl_mackay: 'Mackay',
  trl_redco: 'REDCO',
  trl_gfab: 'GFAB',
}

/** The id prefix for a register: its maker, slugged. */
export const makerSlug = (table: string): string => slug(MAKER[table] ?? table.split('_').at(-1)!)

/**
 * A model's name as a caption says it, maker first: "Stacer 409 Assault Pro", "ePropulsion
 * X12 Outboard (LS)", "TINKA Aluminium TA900TRI-EH". The file's own spelling, less the
 * separators and the maker it already repeats; a model filed under another maker's name in a
 * register (TINKA in REDCO's) keeps the name the file gives it.
 */
export function saidOf(table: string, model: string): string {
  const maker = MAKER[table] ?? ''
  let rest = model.replace(/\s+/g, ' ').trim().replace(/\.$/, '')
  if (maker !== '' && rest.toLowerCase().startsWith(maker.toLowerCase())) {
    rest = rest.slice(maker.length).replace(/^[\s-]+/, '')
    return `${maker} ${rest.replace(/\s+-\s+/g, ' ')}`.trim()
  }
  if (/^[A-Z]{3,}\b/.test(rest)) return rest.replace(/\s+-\s+/g, ' ')
  return `${maker} ${rest.replace(/\s+-\s+/g, ' ')}`.trim()
}

/** The words every model of a hull shares, as its caption says them: "Stabicraft 1550 Frontier". */
export function hullSaid(table: string, models: readonly string[]): string {
  let common = models[0] ?? ''
  for (const m of models) {
    let i = 0
    while (i < common.length && i < m.length && common[i] === m[i]) i += 1
    common = common.slice(0, i)
  }
  return saidOf(table, common.replace(/[\s(]+$/, ''))
}
