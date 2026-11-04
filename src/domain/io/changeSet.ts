/* ============================================================
   io/changeSet — A NEW PRICE LIST'S CHANGES AS ONE WORKING TABLE.

   The shelf, round 2 (docs/directions/data-round/shelf/, board A,
   "One working table"). `./newFile` reads a workbook against the
   price list and says what would change, list by list; this turns
   that plan into the table a person works through before Apply:

     · EVERY LINE, IN WORKBOOK ORDER, list by list — a change, a new
       line, and a line that cannot be placed where it stands in the
       workbook, never gathered at the foot;
     · EVERY FIGURE THAT MOVES, NAMED. A line carries each cell the
       engine would write, by the list's own name for it, old and new.
       Nothing is "other figures". Two figures a list names alike
       (Dealer Fit's two Codes and two CTDs) are told apart by the
       group the list files them under ("Primary Accessory Code");
     · WHICH FIGURES ARE NORTHSIDE'S OWN — cost and margin — marked, so
       the shelf (never a customer surface) can show them as such;
     · A COUNT PER FIGURE, per list: how many lines move it, higher and
       lower — the list's "what moves" before any line;
     · FOR A LINE THAT CANNOT BE PLACED, the lines here that share its
       name, each with what placing it there would change (the engine's
       own merge against that one line), and the one the workbook's own
       Code names, when exactly one does (or Code and Supplier together).

   AND THE CHOICES A PERSON MAKES ON IT: a line left out, a line that
   could not be placed placed on the one they chose. `chosenCommand`
   builds ONE batch from what is kept, so Apply is still one step with
   one inverse, whatever was left out.

   Pure: no React, no store, no DOM.
   ============================================================ */

import {
  displayFieldOf,
  type CellValue,
  type EntityDef,
  type FieldDef,
  type QuoteDef,
  type RowData,
} from '@/domain/model'
import { cellToText } from '@/domain/catalogue/table/core/coerce'
import { addRow, batch, updateCell, type CatalogueCommand } from '@/domain/catalogue/commands'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import { bandOf, isMoney, isRatio } from '@/domain/catalogue/views/columns'
import { isCostColumn, priceLevelsFor } from '@/domain/quote/pricing'
import { mergeLines } from './tableCsv'
import { writableColumns, type CannotBecause, type LineFate, type NewFilePlan } from './newFile'
import type { Workbook } from './workbook'

/* ------------------------------------------------------------ */
/* the shapes                                                    */
/* ------------------------------------------------------------ */

/** One figure of a line, before and after. */
export interface Moved {
  fieldId: string
  /** the list's own name for it, told apart from a namesake on the same list */
  name: string
  /** Northside's own: cost or margin */
  own: boolean
  /** an amount of money, a proportion, or neither (a count, a code, words) */
  as: 'money' | 'ratio' | 'plain'
  /** what the line here carries now; null on a new line */
  from: CellValue
  to: CellValue
}

/** A line here a workbook line that cannot be placed could mean. */
export interface Candidate {
  rowId: string
  code: string
  supplier: string
  /** the price a quote reads on it, where the list declares one */
  read: number | null
  /** the workbook line it was first read from, when it says ("Parts Maintenance", 219) */
  from: { sheet: string; at: number } | null
  /** what placing the workbook's line on this one would change; empty when it already reads so */
  cells: Moved[]
}

export interface ChangeLine {
  /** unique in the set: the sheet and the workbook line */
  key: string
  fate: LineFate
  /** the list it is on; '' for a line whose sheet feeds several lists and names none */
  tableId: string
  list: string
  sheet: string
  /** the workbook's row number */
  at: number
  /** the line's own name, as the workbook writes it */
  name: string
  rowId?: string
  supplier: string
  code: string
  category: string
  /** every figure it writes, in the list's own order */
  cells: Moved[]
  /** the price a quote reads on this list, before and after, when the list declares one and it moves */
  read: { label: string; fieldId: string; from: number | null; to: number | null } | null
  /** how far the read price swung, as a ratio either way (98 → 3 is 32.7); 0 when it did not */
  swing: number
  /** a new line's place among its list's new lines, for the write */
  newAt?: number
  because?: CannotBecause
  candidates?: Candidate[]
  /** the one candidate the workbook's own Code names (with its Supplier, where Code alone does not) */
  suggested?: { rowId: string; by: 'code' | 'code-supplier' }
}

/** One figure a list moves, counted. */
export interface MovedFigure {
  fieldId: string
  name: string
  own: boolean
  as: Moved['as']
  lines: number
  higher: number
  lower: number
}

export interface ListCensus {
  tableId: string
  name: string
  kind: EntityDef['kind']
  readAt: string | null
  changing: number
  adding: number
  cannot: number
  /** every figure the list moves, busiest first */
  figures: MovedFigure[]
  /** whether the list carries a supplier for each line */
  suppliers: boolean
}

export interface Supplier {
  /** the spelling most of its lines use ("Yam" over "YAM") */
  name: string
  lines: number
}

export interface ChangeSet {
  lines: ChangeLine[]
  lists: ListCensus[]
  suppliers: Supplier[]
  changing: number
  adding: number
  cannot: number
  /** lines that cannot be placed but whose own Code names one line here */
  suggested: number
  /** changes whose read price doubles or more, or halves or less */
  doubled: number
  totalRows: number
  unmoved: number
}

/* ------------------------------------------------------------ */
/* naming a figure                                               */
/* ------------------------------------------------------------ */

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase()

/** A FIGURE WHICH IS NORTHSIDE'S OWN. The app's cost rule (`isCostColumn`), widened here for the
 *  names Dealer Fit uses for its cost and margin that the rule does not know (Tot Parts CTD, Act
 *  CTD, Labour CTD, GP, MU): measured on the pack, 2026-11-04 (directions.md, finding 4). */
export function isOwnFigure(entity: EntityDef, field: FieldDef): boolean {
  if (isCostColumn(entity, field)) return true
  return /\b(ctd|gp|mu|margin|mark ?up)\b/i.test(field.name)
}

/** A list's own name for each figure, a namesake told apart by the group it is filed under. */
export function figureNames(entity: EntityDef): Map<string, string> {
  const out = new Map<string, string>()
  const seen = new Map<string, number>()
  for (const f of entity.fields) seen.set(norm(f.name), (seen.get(norm(f.name)) ?? 0) + 1)
  /* a group with a namesake in it is named on each of its figures, unless the figure says it already */
  const clashing = new Set<string>()
  const first = new Set<string>()
  for (const f of entity.fields) {
    const n = norm(f.name)
    if ((seen.get(n) ?? 0) < 2) continue
    if (!first.has(n)) {
      first.add(n)
      continue
    }
    if (f.sectionId) clashing.add(f.sectionId)
  }
  for (const f of entity.fields) {
    const band = bandOf(entity, f)
    const words = norm(band).split(' ')
    const says = words.some((w) => w.length > 2 && norm(f.name).includes(w))
    out.set(
      f.id,
      f.sectionId && clashing.has(f.sectionId) && band !== '' && !says
        ? `${band} ${f.name}`
        : f.name,
    )
  }
  return out
}

const asOf = (entity: EntityDef, field: FieldDef): Moved['as'] =>
  field.type !== 'number'
    ? 'plain'
    : isRatio(field.name)
      ? 'ratio'
      : isMoney(field.name, bandOf(entity, field))
        ? 'money'
        : 'plain'

const numberOf = (v: CellValue | undefined): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

/** How far a figure swung, as a ratio either way. One that crosses or leaves nought has swung as
 *  far as a figure can. The same reckoning as `./newFile`'s lines to look at first. */
export function swingOf(from: number | null, to: number | null): number {
  if (from == null || to == null || from === to) return 0
  if (from === 0 || to === 0 || from < 0 !== to < 0) return Number.POSITIVE_INFINITY
  const ratio = Math.abs(to / from)
  return Math.max(ratio, 1 / ratio)
}

/** Doubled or more, or halved or less: the lines worth a look before Apply. */
export const DOUBLED = 2

/* ------------------------------------------------------------ */
/* the set                                                       */
/* ------------------------------------------------------------ */

const textOf = (row: RowData | undefined, field: FieldDef | undefined): string =>
  row && field ? cellToText(row.values[field.id] ?? null, field).trim() : ''

const fieldNamed = (entity: EntityDef, name: string): FieldDef | undefined =>
  entity.fields.find((f) => norm(f.name) === norm(name))

/** "Parts Maintenance!R219" → the sheet and the line; null when the cell says otherwise. */
export function sourceLine(src: CellValue | undefined): { sheet: string; at: number } | null {
  if (typeof src !== 'string') return null
  const m = /^(.+)!R(\d+)/.exec(src)
  return m ? { sheet: m[1], at: Number(m[2]) } : null
}

/**
 * THE PLAN, AS ONE TABLE. `book` is the workbook the plan was read from (a line that cannot be
 * placed is merged again from its own cells); `data` is the price list as it was read against.
 */
export function changeSetOf(
  plan: NewFilePlan,
  book: Workbook,
  data: Pick<CatalogueData, 'tables' | 'rows'>,
): ChangeSet {
  const lines: ChangeLine[] = []
  const lists: ListCensus[] = []
  const sheetLines = new Map<string, Map<number, string[]>>()
  for (const s of book.sheets) sheetLines.set(s.name, new Map(s.lines.map((l) => [l.at, l.cells])))

  for (const list of plan.lists) {
    const entity = data.tables[list.tableId]
    if (!entity) continue
    const rows = data.rows[list.tableId] ?? []
    const byId = new Map(rows.map((r) => [r.id, r]))
    const names = figureNames(entity)
    const fieldById = new Map(entity.fields.map((f) => [f.id, f]))
    const supplierField = fieldNamed(entity, 'Supplier')
    const codeField = fieldNamed(entity, 'Code')
    const categoryField = entity.fields.find((f) => f.id === `${entity.id}.cat`)
    const readField = list.readAt
      ? priceLevelsFor(entity).find((l) => l.label === list.readAt)?.fieldId
      : undefined
    const movedOf = (fieldId: string, from: CellValue, to: CellValue): Moved => {
      const f = fieldById.get(fieldId)
      return {
        fieldId,
        name: names.get(fieldId) ?? f?.name ?? fieldId,
        own: f ? isOwnFigure(entity, f) : false,
        as: f ? asOf(entity, f) : 'plain',
        from,
        to,
      }
    }
    const order = (cells: Moved[]): Moved[] => {
      const at = new Map(entity.fields.map((f, i) => [f.id, i]))
      return cells.toSorted((a, b) => (at.get(a.fieldId) ?? 0) - (at.get(b.fieldId) ?? 0))
    }

    /* every cell the engine would write, by the line it is on */
    const byRow = new Map<string, Moved[]>()
    const census = new Map<string, MovedFigure>()
    for (const c of list.plan.changes) {
      const was = byId.get(c.rowId)?.values[c.fieldId] ?? null
      const m = movedOf(c.fieldId, was, c.value)
      const cells = byRow.get(c.rowId)
      if (cells) cells.push(m)
      else byRow.set(c.rowId, [m])
      const k = census.get(c.fieldId) ?? {
        fieldId: c.fieldId,
        name: m.name,
        own: m.own,
        as: m.as,
        lines: 0,
        higher: 0,
        lower: 0,
      }
      k.lines += 1
      const a = numberOf(was)
      const b = numberOf(c.value)
      if (a !== null && b !== null) {
        if (b > a) k.higher += 1
        else if (b < a) k.lower += 1
      }
      census.set(c.fieldId, k)
    }

    const mine: ChangeLine[] = []
    let fresh = 0
    for (const l of list.lines) {
      const base = {
        key: `${l.sheet}!${l.at}`,
        fate: l.fate,
        tableId: list.tableId,
        list: list.name,
        sheet: l.sheet,
        at: l.at,
        name: l.name,
      }
      if (l.fate === 'new') {
        const values = list.plan.newRows[fresh]?.values ?? {}
        const cells = order(
          Object.entries(values)
            .filter(([id]) => {
              const f = fieldById.get(id)
              return f !== undefined && f.type === 'number' && id !== entity.displayFieldId
            })
            .map(([id, v]) => movedOf(id, null, v)),
        )
        mine.push({
          ...base,
          newAt: fresh,
          supplier: supplierField ? String(values[supplierField.id] ?? '').trim() : '',
          code: codeField ? String(values[codeField.id] ?? '').trim() : '',
          category: categoryField ? String(values[categoryField.id] ?? '').trim() : '',
          cells,
          read:
            readField && list.readAt
              ? {
                  label: list.readAt,
                  fieldId: readField,
                  from: null,
                  to: numberOf(values[readField]),
                }
              : null,
          swing: 0,
        })
        fresh += 1
        continue
      }
      const row = l.rowId ? byId.get(l.rowId) : undefined
      const cells = order(l.rowId ? (byRow.get(l.rowId) ?? []) : [])
      const readCell = readField ? cells.find((c) => c.fieldId === readField) : undefined
      const from = readCell ? numberOf(readCell.from) : null
      const to = readCell ? numberOf(readCell.to) : null
      mine.push({
        ...base,
        ...(l.rowId ? { rowId: l.rowId } : {}),
        supplier: textOf(row, supplierField),
        code: textOf(row, codeField),
        category: textOf(row, categoryField),
        cells,
        read:
          readCell && list.readAt
            ? { label: list.readAt, fieldId: readCell.fieldId, from, to }
            : null,
        swing: swingOf(from, to),
      })
    }

    /* the lines that cannot be placed, with the lines here they could mean */
    const display = displayFieldOf(entity)
    const writable = writableColumns(entity, list.sheet)
    const nameAt = [...writable.entries()].find(([, f]) => f.id === display?.id)?.[0]
    const codeAt = [...writable.entries()].find(([, f]) => f.id === codeField?.id)?.[0]
    const supAt = [...writable.entries()].find(([, f]) => f.id === supplierField?.id)?.[0]
    const cellsOf = sheetLines.get(list.sheet)
    for (const c of list.cannotLines) {
      const fileCells = cellsOf?.get(c.at) ?? []
      const same = display ? rows.filter((r) => norm(textOf(r, display)) === norm(c.name)) : []
      const candidates: Candidate[] = same.map((r) => {
        let cells: Moved[] = []
        if (display && nameAt !== undefined && fileCells.length > 0) {
          const p = mergeLines({
            entity,
            rows: [r],
            lines: [fileCells],
            writable,
            identity: { on: 'name', at: nameAt, field: display },
            columns: { matched: [], unknown: [], ambiguous: [], readOnly: [], missing: [] },
            fileName: plan.fileName,
            fileColumns: fileCells.length,
          })
          cells = order(
            p.changes.map((x) => movedOf(x.fieldId, r.values[x.fieldId] ?? null, x.value)),
          )
        }
        return {
          rowId: r.id,
          code: textOf(r, codeField),
          supplier: textOf(r, supplierField),
          read: readField ? numberOf(r.values[readField]) : null,
          from: sourceLine(r.values[`${entity.id}.src`]),
          cells,
        }
      })
      const code = codeAt === undefined ? '' : (fileCells[codeAt] ?? '').trim()
      const sup = supAt === undefined ? '' : (fileCells[supAt] ?? '').trim()
      const byCode = code === '' ? [] : candidates.filter((x) => x.code === code)
      const byBoth = supAt === undefined ? [] : byCode.filter((x) => norm(x.supplier) === norm(sup))
      const suggested =
        c.because === 'shared-name' && byCode.length === 1
          ? { rowId: byCode[0].rowId, by: 'code' as const }
          : c.because === 'shared-name' && byBoth.length === 1
            ? { rowId: byBoth[0].rowId, by: 'code-supplier' as const }
            : undefined
      mine.push({
        key: `${c.sheet}!${c.at}`,
        fate: 'cannot',
        tableId: list.tableId,
        list: list.name,
        sheet: c.sheet,
        at: c.at,
        name: c.name,
        supplier: sup,
        code,
        category: '',
        cells: [],
        read: null,
        swing: 0,
        because: c.because ?? 'shared-name',
        candidates,
        ...(suggested ? { suggested } : {}),
      })
    }
    mine.sort((a, b) => a.at - b.at)
    lines.push(...mine)

    lists.push({
      tableId: list.tableId,
      name: list.name,
      kind: list.kind,
      readAt: list.readAt,
      changing: list.changing,
      adding: list.adding,
      cannot: list.cannot,
      figures: [...census.values()].sort(
        (a, b) => b.lines - a.lines || a.name.localeCompare(b.name),
      ),
      suppliers: supplierField !== undefined,
    })
  }

  for (const u of plan.unplaced) {
    lines.push({
      key: `${u.sheet}!${u.at}`,
      fate: 'cannot',
      tableId: '',
      list: '',
      sheet: u.sheet,
      at: u.at,
      name: u.name,
      supplier: '',
      code: '',
      category: '',
      cells: [],
      read: null,
      swing: 0,
      because: u.because ?? 'no-list',
      candidates: [],
    })
  }

  /* suppliers, case ignored: "Yam" and "YAM" are one supplier, named as most of its lines write it */
  const spellings = new Map<string, Map<string, number>>()
  for (const l of lines) {
    if (l.supplier === '') continue
    const k = norm(l.supplier)
    const by = spellings.get(k) ?? new Map<string, number>()
    by.set(l.supplier, (by.get(l.supplier) ?? 0) + 1)
    spellings.set(k, by)
  }
  const suppliers = [...spellings.values()]
    .map((by) => {
      const [name] = [...by.entries()].sort((a, b) => b[1] - a[1])[0]
      return { name, lines: [...by.values()].reduce((n, x) => n + x, 0) }
    })
    .sort((a, b) => b.lines - a.lines || a.name.localeCompare(b.name))

  return {
    lines,
    lists,
    suppliers,
    changing: plan.changing,
    adding: plan.adding,
    cannot: plan.cannot,
    suggested: lines.filter((l) => l.suggested).length,
    doubled: lines.filter((l) => l.fate === 'change' && l.swing >= DOUBLED).length,
    totalRows: plan.totalRows,
    unmoved: plan.unmoved,
  }
}

/* ------------------------------------------------------------ */
/* narrowing it                                                  */
/* ------------------------------------------------------------ */

/** What a line does to the price a quote reads, or that it is new, or cannot be placed. */
export type Way = 'higher' | 'lower' | 'new' | 'cannot' | 'others'

export interface Narrow {
  /** words of a name, a code, a supplier or a category */
  q?: string | undefined
  list?: string | undefined
  supplier?: string | undefined
  way?: Way | undefined
  /** doubled or more, or halved or less, at the price a quote reads */
  doubled?: boolean | undefined
  /** a figure that moves, by its field */
  figure?: string | undefined
}

export function wayOf(l: ChangeLine): Way {
  if (l.fate === 'new') return 'new'
  if (l.fate === 'cannot') return 'cannot'
  if (l.read && l.read.from != null && l.read.to != null && l.read.from !== l.read.to) {
    return l.read.to > l.read.from ? 'higher' : 'lower'
  }
  return 'others'
}

export function narrowed(lines: readonly ChangeLine[], n: Narrow): ChangeLine[] {
  const words = norm(n.q ?? '')
    .split(' ')
    .filter(Boolean)
  const supplier = n.supplier ? norm(n.supplier) : null
  const kept = lines.filter((l) => {
    if (n.list && l.tableId !== n.list) return false
    if (supplier !== null && norm(l.supplier) !== supplier) return false
    if (n.way && wayOf(l) !== n.way) return false
    if (n.doubled && !(l.fate === 'change' && l.swing >= DOUBLED)) return false
    if (n.figure && !l.cells.some((c) => c.fieldId === n.figure)) return false
    if (words.length > 0) {
      const hay = norm(`${l.name} ${l.code} ${l.supplier} ${l.category}`)
      if (!words.every((w) => hay.includes(w))) return false
    }
    return true
  })
  /* THE DOUBLED AND HALVED ARE LOOKED AT FURTHEST FIRST, as the list of what to look at first is */
  return n.doubled ? kept.toSorted((a, b) => b.swing - a.swing || a.at - b.at) : kept
}

/* ------------------------------------------------------------ */
/* the choices, and the one step they make                       */
/* ------------------------------------------------------------ */

export interface Choices {
  /** lines left out, by key */
  out: ReadonlySet<string>
  /** lines that could not be placed, placed: key → the line here it was placed on */
  placed: ReadonlyMap<string, string>
}

export const NO_CHOICES: Choices = { out: new Set(), placed: new Map() }

/** Whether a line is in what Apply writes. */
export function isIn(l: ChangeLine, c: Choices): boolean {
  if (l.fate === 'cannot') return c.placed.has(l.key)
  return !c.out.has(l.key)
}

export interface Tally {
  /** what Apply writes: changes and new lines kept, and lines placed that change something */
  in: number
  /** what is on offer: every change and new line, and every line placed that changes something */
  of: number
  leftOut: ChangeLine[]
  placed: number
  /** lines that cannot be placed and are not */
  stillOut: number
}

export function tally(set: ChangeSet, c: Choices): Tally {
  let inn = 0
  let of = 0
  let placed = 0
  let stillOut = 0
  const leftOut: ChangeLine[] = []
  for (const l of set.lines) {
    if (l.fate === 'cannot') {
      const rowId = c.placed.get(l.key)
      const cand = rowId ? l.candidates?.find((x) => x.rowId === rowId) : undefined
      if (cand) {
        placed += 1
        if (cand.cells.length > 0) {
          inn += 1
          of += 1
        }
      } else stillOut += 1
      continue
    }
    of += 1
    if (c.out.has(l.key)) leftOut.push(l)
    else inn += 1
  }
  return { in: inn, of, leftOut, placed, stillOut }
}

/**
 * WHY A LINE CANNOT BE PLACED ON THIS ONE, or null. A line here that the workbook already
 * changes elsewhere, or that another line has been placed on, would be written twice, and the
 * second write would undo the first without a word.
 */
export function placeRefusal(
  set: ChangeSet,
  c: Choices,
  key: string,
  rowId: string,
): string | null {
  for (const l of set.lines) {
    if (l.key === key) continue
    if (l.fate === 'change' && l.rowId === rowId && !c.out.has(l.key)) {
      return `Line ${l.at.toLocaleString('en-AU')} of the workbook already changes that one, so this would write over it.`
    }
    if (l.fate === 'cannot' && c.placed.get(l.key) === rowId) {
      return `Line ${l.at.toLocaleString('en-AU')} of the workbook is already placed on that one.`
    }
  }
  return null
}

/** Every line whose own Code names one line here, placed there — save where that is refused. */
export function placeSuggested(set: ChangeSet, c: Choices): Choices {
  const placed = new Map(c.placed)
  for (const l of set.lines) {
    if (!l.suggested || placed.has(l.key)) continue
    if (placeRefusal(set, { out: c.out, placed }, l.key, l.suggested.rowId)) continue
    placed.set(l.key, l.suggested.rowId)
  }
  return { out: c.out, placed }
}

/**
 * WHAT IS KEPT, AS ONE STEP. A cell edit per figure of every change kept, a new line per new
 * line kept, and the figures of every line placed; batched so one Undo puts all of it back.
 * Null when nothing kept would change anything.
 */
export function chosenCommand(
  plan: NewFilePlan,
  set: ChangeSet,
  c: Choices,
  said: string,
): CatalogueCommand | null {
  const commands: CatalogueCommand[] = []
  const lists = new Map(plan.lists.map((l) => [l.tableId, l]))
  for (const l of set.lines) {
    const list = lists.get(l.tableId)
    if (!list) continue
    if (l.fate === 'change' && l.rowId && !c.out.has(l.key)) {
      for (const x of list.plan.changes) {
        if (x.rowId === l.rowId) commands.push(updateCell(l.tableId, x.rowId, x.fieldId, x.value))
      }
    } else if (l.fate === 'new' && l.newAt !== undefined && !c.out.has(l.key)) {
      const r = list.plan.newRows[l.newAt]
      if (r) commands.push(addRow(l.tableId, r.values))
    } else if (l.fate === 'cannot') {
      const rowId = c.placed.get(l.key)
      const cand = rowId ? l.candidates?.find((x) => x.rowId === rowId) : undefined
      for (const m of cand?.cells ?? [])
        commands.push(updateCell(l.tableId, cand!.rowId, m.fieldId, m.to))
    }
  }
  return commands.length === 0 ? null : batch(commands, { said })
}

/* ------------------------------------------------------------ */
/* the quotes being written                                      */
/* ------------------------------------------------------------ */

export interface DraftMove {
  quoteId: string
  reference: string
  subject: string
  customer: string | null
  lines: { label: string; qty: number; carries: number | null; would: number }[]
  /** the sum each line would move by, quantity counted; lines with no price of their own are not summed */
  by: number
}

/**
 * THE QUOTES BEING WRITTEN THAT CARRY A LINE THIS WOULD MOVE. A quote's line keeps the price it
 * had when it was chosen (`src/domain/quote/freeze.ts`, "the pick IS the write"), so nothing
 * written here moves a quote: this says which lines of which drafts read a figure that Apply
 * changes, and what that figure would be, so a salesperson knows before they choose again.
 */
export function draftsMoved(quotes: readonly QuoteDef[], set: ChangeSet, c: Choices): DraftMove[] {
  const moved = new Map<string, Map<string, CellValue>>()
  for (const l of set.lines) {
    let rowId: string | undefined
    let cells: Moved[] = []
    if (l.fate === 'change' && !c.out.has(l.key)) {
      rowId = l.rowId
      cells = l.cells
    } else if (l.fate === 'cannot') {
      rowId = c.placed.get(l.key)
      cells = l.candidates?.find((x) => x.rowId === rowId)?.cells ?? []
    }
    if (!rowId || cells.length === 0) continue
    moved.set(`${l.tableId}:${rowId}`, new Map(cells.map((m) => [m.fieldId, m.to])))
  }
  const out: DraftMove[] = []
  for (const q of quotes) {
    if (q.state !== 'draft') continue
    const lines: DraftMove['lines'] = []
    let by = 0
    for (const line of q.lines) {
      if (!line.priceFieldId) continue
      const would = moved.get(`${line.entityId}:${line.rowId}`)?.get(line.priceFieldId)
      if (typeof would !== 'number' || would === line.unitPrice) continue
      lines.push({ label: line.label, qty: line.qty, carries: line.unitPrice, would })
      if (line.unitPrice !== null) by += (would - line.unitPrice) * line.qty
    }
    if (lines.length === 0) continue
    out.push({
      quoteId: q.id,
      reference: q.reference,
      subject: q.subjectLabel,
      customer: q.customer?.name ?? null,
      lines,
      by: Math.round(by * 100) / 100,
    })
  }
  return out
}
