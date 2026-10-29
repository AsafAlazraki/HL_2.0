/**
 * WHAT THE WORKBOOKS HOLD AND THE OLD SEED DROPPED — three bands, carried onto the rows that
 * hold them (Milestone 4, the shelf; docs/research/proposal/quote-spec.md §§6 and 9).
 *
 * The old builder (`buildNorthsideProject`) never read these columns, so the pack never carried
 * them. They are in the old repository's committed extracts of the very workbooks the seed was
 * built from (`HL_Playground/tools/seed/extracts/b2_data.json` for the Boat Module and
 * `t1_data.json` for the Trailer Module: one object per workbook row, keyed by row number, each
 * holding its cells by column letter). A pack row already names the cell it was read from
 * (`Source = Boat Module!R5`), so each band is carried by that row number and nothing else.
 *
 *   · Boat Module, DEPOSIT PAYMENT SCHEDULE — QD..QH: the share of the price due at each stage,
 *     as the workbook holds it (0.2 is 20%). QC is the band's own label, repeated on every row,
 *     and is not a figure.
 *   · Boat Module, Factory Lead Times (in Days) — QK..QO. QJ is the band's label.
 *   · Trailer Module, TRAILER FEATURES — R..AL. Q is the band's label. A feature column no
 *     carried trailer fills is not made into an empty column.
 *
 * THEY ARE PACKED BESIDE THE ROWS, in `data/northside/bands.json`, by row id, each cell by its
 * column letter with the row's Source cell, and each column named by the workbook's own header
 * row. Not as columns on the lists, and that was measured rather than supposed (2026-10-30): as
 * columns, the deposit and lead-time figures moved Review's counts (138 tidy marks to 145) and
 * the price list editor's layout at 1280, and the trailer features — which name boats — moved
 * the fitment reading, which reads every text column of a trailer (Stacer's hulls naming their
 * own model went from 0 to 24). Each of those is a decision for the screen that owns it, so the
 * bands are carried where nothing reads them yet. Packing them invents nothing; printing them
 * on a quote is the owner's call (analysis.md §7 question 10).
 *
 * The STANDARD INCLUSIONS (Boat Module W..BV) and the FACTORY OPTIONS (BX..IG) are on no row of
 * the extracts: they live in Northside's Boat Module and Factory Options Module workbooks, which
 * are not on this machine. `carryBands` counts them and says so; it carries nothing it does not
 * find.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { EntityDef, RowData } from '../../src/domain/model'

type Extract = Record<string, Record<string, unknown>>

interface Band {
  sheet: 'Boat Module' | 'Trailer Module'
  kind: 'boat' | 'trailer'
  section: { id: string; name: string }
  letters: string[]
  type: 'number' | 'text'
  says: string
}

const index = (l: string): number => [...l].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0)

const name = (at: number): string => {
  let n = at
  let out = ''
  while (n > 0) {
    const r = (n - 1) % 26
    out = String.fromCharCode(65 + r) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

const letters = (from: string, to: string): string[] => {
  const out: string[] = []
  for (let n = index(from); n <= index(to); n += 1) out.push(name(n))
  return out
}

const BANDS: readonly Band[] = [
  {
    sheet: 'Boat Module',
    kind: 'boat',
    section: { id: 'deposit', name: 'Deposit schedule' },
    letters: letters('QD', 'QH'),
    type: 'number',
    says: 'The DEPOSIT PAYMENT SCHEDULE band (Boat Module!QC..QH): the share of the price due at this stage, as the workbook holds it (0.2 is 20%).',
  },
  {
    sheet: 'Boat Module',
    kind: 'boat',
    section: { id: 'lead', name: 'Factory lead times' },
    letters: letters('QK', 'QO'),
    type: 'number',
    says: 'The Factory Lead Times (in Days) band (Boat Module!QJ..QO): days, as the workbook holds them.',
  },
  {
    sheet: 'Trailer Module',
    kind: 'trailer',
    section: { id: 'features', name: 'Trailer features' },
    letters: letters('R', 'AL'),
    type: 'text',
    says: 'The TRAILER FEATURES band (Trailer Module!Q..AL), as the workbook writes it.',
  },
]

const filled = (v: unknown): boolean =>
  v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '')

/** One band as the pack's `bands.json` declares it. */
export interface BandDecl {
  id: string
  name: string
  sheet: Band['sheet']
  /** the band's own columns, each by its letter and the workbook's header */
  columns: { letter: string; name: string }[]
  type: Band['type']
  says: string
}

/** `data/northside/bands.json`: each band, and per row the cells it holds, by letter. */
export interface BandsFile {
  note: string
  bands: BandDecl[]
  /** row id → band id → { source, cells by letter } */
  rows: Record<string, Record<string, { source: string; cells: Record<string, number | string> }>>
}

export interface BandsCarried {
  file: BandsFile
  /** per band, how many pack rows hold it, and how many rows of the extract do */
  carried: { band: string; rows: number; columns: number; extractRows: number }[]
  /** rows of the Boat Module extract holding anything in W..BV and in BX..IG */
  inclusions: number
  options: number
}

const NOTE =
  'What the Boat Module and the Trailer Module hold and the old seed dropped, carried by each row’s own Source cell from the old repository’s extracts (tools/seed/bands.ts). BESIDE the rows and not yet columns on them: as columns they would be read by Review’s checks, by the price list editor’s layout and — the trailer features name boats — by the fitment reading of every text column of a trailer, each a decision for the screen that owns it. Printing them on a quote is the owner’s call (docs/research/proposal/analysis.md §7 question 10).'

/** Read the three bands for every row that holds them. Nothing it is handed is changed. */
export function carryBands(
  oldRepo: string,
  entities: readonly EntityDef[],
  rowsByEntity: Readonly<Record<string, readonly RowData[]>>,
): BandsCarried {
  const dir = path.join(oldRepo, 'tools', 'seed', 'extracts')
  const read = (file: string): Extract => {
    const at = path.join(dir, file)
    if (!existsSync(at)) throw new Error(`no extract at ${at}: the bands cannot be carried`)
    return JSON.parse(readFileSync(at, 'utf8')) as Extract
  }
  const extracts: Record<Band['sheet'], Extract> = {
    'Boat Module': read('b2_data.json'),
    'Trailer Module': read('t1_data.json'),
  }

  const file: BandsFile = { note: NOTE, bands: [], rows: {} }
  const carried: BandsCarried['carried'] = []
  for (const band of BANDS) {
    const extract = extracts[band.sheet]
    const header = extract['1'] ?? {}
    const extractRows = Object.entries(extract).filter(
      ([n, row]) => n !== '1' && band.letters.some((l) => filled(row[l])),
    ).length
    let rows = 0
    const used = new Set<string>()
    for (const e of entities) {
      if (e.kind !== band.kind || e.role === 'join') continue
      for (const r of rowsByEntity[e.id] ?? []) {
        const source = String(r.values[`${e.id}.src`] ?? '')
        const at = source.split('!R')[1]
        const row = at && source.startsWith(`${band.sheet}!`) ? extract[at] : undefined
        if (!row) continue
        const cells: Record<string, number | string> = {}
        for (const l of band.letters) {
          const v = row[l]
          if (!filled(v)) continue
          if (band.type === 'number' && typeof v !== 'number') continue
          cells[l] = typeof v === 'number' ? v : String(v).trim()
          used.add(l)
        }
        if (Object.keys(cells).length === 0) continue
        rows += 1
        file.rows[r.id] = { ...file.rows[r.id], [band.section.id]: { source, cells } }
      }
    }
    file.bands.push({
      id: band.section.id,
      name: band.section.name,
      sheet: band.sheet,
      columns: band.letters
        .filter((l) => used.has(l))
        .map((l) => ({ letter: l, name: String(header[l] ?? l).trim() })),
      type: band.type,
      says: band.says,
    })
    carried.push({ band: band.section.name, rows, columns: used.size, extractRows })
  }

  const boats = extracts['Boat Module']
  const holds = (from: string, to: string): number => {
    const span = letters(from, to)
    return Object.entries(boats).filter(([n, row]) => n !== '1' && span.some((l) => filled(row[l])))
      .length
  }
  return { file, carried, inclusions: holds('W', 'BV'), options: holds('BX', 'IG') }
}
