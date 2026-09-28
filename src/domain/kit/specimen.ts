import {
  PAIR_ORDER_FIELD,
  PAIR_RECOMMENDED_FIELD,
  type CellValue,
  type EntityDef,
  type ImageLedgerEntry,
  type RowData,
  type TableKind,
} from '@/domain/model'
import { motorFactsSaid } from '@/domain/quote/goodsFacts'
import { levelWord } from '@/domain/quote/levelSaid'
import { lineSaid, spokenBoat } from '@/domain/quote/spoken'
import { boatTitle } from '@/domain/quote/title'

/* ============================================================
   WHAT THE KIT'S SPECIMEN DRAWS, READ OFF THE PRICE FILE.

   The component kit is shown whole at /kit on the boat its board was
   drawn on — the Stacer 529 Assault Pro (Tournament), SA529APTR,
   Boat Module!R50 — and on nothing invented: its name as a person
   says it, its facts, its price at every level the file DECLARES for
   a quote, the motors the file pairs with it in the file's own order
   with their Sell Price, its picture from the image ledger, the other
   529s the register holds, and how many rows its registers carry.

   COST NEVER COMES THROUGH HERE. A price is read only through a
   table's declared `priceLevels`, and a fact only by the column's own
   name from a short list of specifications; no other cell of a row is
   touched.
   ============================================================ */

export interface SpecimenPicture {
  /** the held copy's file under public/seed-images */
  file: string
  width: number
  height: number
  /** scene or studio, as the packer measured it */
  verdict: string
  host: string
}

export interface SpecimenLevel {
  key: string
  label: string
  amount: number
}

export interface SpecimenBoat {
  rowId: string
  code: string
  /** "Stacer 529 Assault Pro (Tournament)" — the paper's own title */
  title: string
  /** "Stacer 529 Assault Pro" */
  name: string
  /** "Tournament" */
  trim: string
  maker: string
  /** "529" — the model's number, what the finder is asked */
  number: string
  levels: SpecimenLevel[]
  lengthM: number | null
  beamM: number | null
  fuel: string | null
  hullKg: number | null
  minHp: number | null
  maxHp: number | null
  picture: SpecimenPicture | null
  /** the motors the file pairs with this hull, in the file's own order */
  motors: SpecimenMotor[]
  /** the trailers the file pairs with it, as a person says them */
  trailers: SpecimenTrailer[]
}

export interface SpecimenTrailer {
  rowId: string
  said: string
  code: string
}

export interface SpecimenMotor {
  rowId: string
  /** "Yamaha F115LB" */
  said: string
  code: string
  hp: string | null
  kg: number | null
  shaft: string | null
  /** the motor at every level its table declares for a quote */
  levels: SpecimenLevel[]
  /** the file's own star on this pairing */
  recommended: boolean
  picture: SpecimenPicture | null
}

export interface SpecimenRegister {
  id: string
  name: string
  kind: TableKind
  rows: number
}

export interface KitSpecimen {
  business: string
  boat: SpecimenBoat
  /** the register's other boats with the same model number, in the register's order */
  siblings: SpecimenBoat[]
  registers: {
    boat: SpecimenRegister
    motor: SpecimenRegister | null
    trailer: SpecimenRegister | null
  }
}

export interface SpecimenPack {
  business: string
  entities: readonly EntityDef[]
  rows: Readonly<Record<string, readonly RowData[]>>
  images: readonly ImageLedgerEntry[]
}

/** The boat the kit's board was drawn on. */
export const SPECIMEN_CODE = 'SA529APTR'

const fieldId = (entity: EntityDef, name: string): string | null =>
  entity.fields.find((f) => f.name === name)?.id ?? null

const cell = (entity: EntityDef, row: RowData, name: string): CellValue | undefined => {
  const id = fieldId(entity, name)
  return id ? row.values[id] : undefined
}

const num = (v: CellValue | undefined): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

const text = (v: CellValue | undefined): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null

function pictureOf(
  entity: EntityDef,
  row: RowData,
  ledger: ReadonlyMap<string, ImageLedgerEntry>,
): SpecimenPicture | null {
  for (const f of entity.fields) {
    if (f.type !== 'image') continue
    const v = row.values[f.id]
    const first = Array.isArray(v) ? (v[0] as { src?: unknown } | undefined) : undefined
    const address = typeof first?.src === 'string' ? first.src : null
    const held = address ? ledger.get(address) : undefined
    if (held?.file && held.width && held.height)
      return {
        file: held.file,
        width: held.width,
        height: held.height,
        verdict: held.verdict,
        host: held.host,
      }
  }
  return null
}

/** Every level a table declares for a quote, with this row's figure at it, each said by the
 *  name the dealership declared for its key (`levelWord`) — "Cash" on a motor too, never the
 *  file's own "Sell Price" (the rule src/domain/quote/levelSaid.ts states). */
function levelsOf(entity: EntityDef, row: RowData): SpecimenLevel[] {
  return (entity.priceLevels ?? [])
    .filter((l) => l.scope === 'quote')
    .flatMap((l) => {
      const amount = num(row.values[l.fieldId])
      return amount === null ? [] : [{ key: l.key, label: levelWord(l.key, l.label), amount }]
    })
}

function boatOf(
  pack: SpecimenPack,
  entity: EntityDef,
  row: RowData,
  ledger: ReadonlyMap<string, ImageLedgerEntry>,
): SpecimenBoat {
  const label =
    text(row.values[entity.displayFieldId ?? '']) ?? text(cell(entity, row, 'Model')) ?? ''
  const spoken = spokenBoat(entity.id, label)
  return {
    rowId: row.id,
    code: text(cell(entity, row, 'Model Code')) ?? '',
    title: boatTitle(entity.id, label).title,
    name: spoken.name,
    trim: spoken.trim,
    maker: spoken.maker,
    number: /\d{3,}/.exec(spoken.model)?.[0] ?? '',
    levels: levelsOf(entity, row),
    lengthM: num(cell(entity, row, 'Hull Length (Mtr)')),
    beamM: num(cell(entity, row, 'Beam (Mtr)')),
    fuel: text(cell(entity, row, 'Fuel Capacity')),
    hullKg: num(cell(entity, row, 'Hull Weight (Dry) kg')),
    minHp: num(cell(entity, row, 'Min HP')),
    maxHp: num(cell(entity, row, 'Max HP')),
    picture: pictureOf(entity, row, ledger),
    motors: paired(pack, row.id, 'motor').map(({ row: m, entity: table, recommended }) => ({
      rowId: m.id,
      said: lineSaid(text(m.values[table.displayFieldId ?? '']) ?? '', table.name),
      code: text(cell(table, m, 'Model Code')) ?? '',
      hp: text(cell(table, m, 'HP Rating')),
      kg: num(cell(table, m, 'WEIGHT kg')),
      shaft: text(cell(table, m, 'Shaft Length')),
      levels: levelsOf(table, m),
      recommended,
      picture: pictureOf(table, m, ledger),
    })),
    trailers: paired(pack, row.id, 'trailer').map(({ row: t, entity: table }) => ({
      rowId: t.id,
      said: lineSaid(text(t.values[table.displayFieldId ?? '']) ?? '', table.name),
      code: text(cell(table, t, 'Code')) ?? text(cell(table, t, 'Model Code')) ?? '',
    })),
  }
}

/** The pairings of one row in the join tables, to rows of a table of one kind, in order. */
function paired(
  pack: SpecimenPack,
  rowId: string,
  kind: TableKind,
): { row: RowData; entity: EntityDef; recommended: boolean; order: number }[] {
  const byId = new Map(pack.entities.map((e) => [e.id, e]))
  const out: { row: RowData; entity: EntityDef; recommended: boolean; order: number }[] = []
  for (const join of pack.entities) {
    if (join.role !== 'join') continue
    for (const link of pack.rows[join.id] ?? []) {
      const refs = Object.values(link.values).filter(
        (v): v is string => typeof v === 'string' && /^[a-z0-9_]+:\d+$/.test(v),
      )
      if (!refs.includes(rowId)) continue
      for (const ref of refs) {
        if (ref === rowId) continue
        const tableId = ref.slice(0, ref.lastIndexOf(':'))
        const entity = byId.get(tableId)
        if (entity?.kind !== kind) continue
        const row = (pack.rows[tableId] ?? []).find((r) => r.id === ref)
        if (!row) continue
        const order = link.values[PAIR_ORDER_FIELD]
        out.push({
          row,
          entity,
          recommended: link.values[PAIR_RECOMMENDED_FIELD] === true,
          order: typeof order === 'number' ? order : out.length + 1,
        })
      }
    }
  }
  return out.toSorted((a, b) => a.order - b.order)
}

function registerOf(entity: EntityDef, pack: SpecimenPack): SpecimenRegister {
  return {
    id: entity.id,
    name: entity.name,
    kind: entity.kind ?? 'custom',
    rows: (pack.rows[entity.id] ?? []).length,
  }
}

/**
 * The specimen, or a sentence saying why the file cannot give it — never a stand-in boat.
 */
export function specimenOf(
  pack: SpecimenPack,
  code: string = SPECIMEN_CODE,
): KitSpecimen | { refused: string } {
  const ledger = new Map(pack.images.map((i) => [i.address, i]))
  for (const entity of pack.entities) {
    if (entity.kind !== 'boat') continue
    const codeField = fieldId(entity, 'Model Code')
    if (!codeField) continue
    const rows = pack.rows[entity.id] ?? []
    const row = rows.find((r) => r.values[codeField] === code)
    if (!row) continue
    const boat = boatOf(pack, entity, row, ledger)
    const siblings = rows
      .filter((r) => r.id !== row.id)
      .map((r) => boatOf(pack, entity, r, ledger))
      .filter((b) => b.number !== '' && b.number === boat.number)
    const motorTable = paired(pack, row.id, 'motor')[0]?.entity
    const trailerTable = paired(pack, row.id, 'trailer')[0]?.entity
    return {
      business: pack.business,
      boat,
      siblings,
      registers: {
        boat: registerOf(entity, pack),
        motor: motorTable ? registerOf(motorTable, pack) : null,
        trailer: trailerTable ? registerOf(trailerTable, pack) : null,
      },
    }
  }
  return { refused: `The price file holds no boat with the Model Code ${code}.` }
}

/** The facts a person reads about a boat, as short phrases: "5.29 m", "80 ltr", "90–150 hp". */
export function boatFacts(boat: SpecimenBoat): string[] {
  const out: string[] = []
  if (boat.lengthM !== null) out.push(`${boat.lengthM} m`)
  if (boat.beamM !== null) out.push(`${boat.beamM} m beam`)
  if (boat.fuel) out.push(boat.fuel)
  if (boat.hullKg !== null) out.push(`${boat.hullKg} kg hull`)
  if (boat.minHp !== null && boat.maxHp !== null) out.push(`${boat.minHp}–${boat.maxHp} hp`)
  return out
}

/** A motor's facts on one line: "115 hp · 171 kg · 20″ shaft" — the build's own line
 *  (`motorFactsSaid`), so /kit and the build can never say one motor two ways. */
export function motorFacts(motor: SpecimenMotor): string {
  return motorFactsSaid(motor)
}
