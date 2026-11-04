/// <reference types="node" />
import { beforeAll, describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'
import type { EntityDef, QuoteDef } from '@/domain/model'
import { emptySheet, indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import { apply, isDone } from '@/domain/catalogue/commands'
import { loadPack } from '@/test/fixtures/pack'
import { writeWorkbook } from '@/test/fixtures/workbook'

/** The workbook line a line here was read from, every cited figure copied back, then changed. */
function lineOf(
  data: CatalogueData,
  row: RowData,
  change: Record<string, string | number> = {},
  at?: number,
): SheetSpec['lines'][number] {
  const entity = data.tables[row.entityId]
  const sheet = sheetOf(entity, data.rows[entity.id]) as string
  const cells: Record<string, string | number> = {}
  for (const f of writableColumns(entity, sheet).values()) {
    const v = row.values[f.id]
    if (typeof v === 'number' || (typeof v === 'string' && v !== '')) {
      cells[f.id.slice(entity.id.length + 1).toUpperCase()] = v
    }
  }
  return {
    at: at ?? Number(String(row.values[`${entity.id}.src`]).split('!R')[1]),
    cells: { ...cells, ...change },
  }
}
import { readWorkbook } from './workbook'
import { planNewFile, sheetOf, sheetsOnThePriceList, writableColumns } from './newFile'
import type { RowData } from '@/domain/model'
import type { SheetSpec } from '@/test/fixtures/workbook'
import {
  DOUBLED,
  NO_CHOICES,
  changeSetOf,
  chosenCommand,
  draftsMoved,
  figureNames,
  isOwnFigure,
  narrowed,
  placeRefusal,
  placeSuggested,
  tally,
  wayOf,
  type ChangeSet,
} from './changeSet'

/* ============================================================
   THE CHANGE SET, ON THE REAL PACK. The workbook is written here from
   the pack's own lines, each change named where it is made:

     · line 597, the 2.0 Mtr tube cover: Sell 1,640 → 1,540, P&A
       1,240 → 1,200 (two figures, each named);
     · line 676, the Dee Shackle the judge named: Sell 98 → 3 (a swing
       far past double, the line to hold back);
     · line 9001, a part the price list does not carry: new;
     · line 275, "Battery, Lithium 24v 100Amp (Bluetooth)": two lines
       here share that name (111234 at $1,899, 111180 at $2,890), and
       the workbook's own Code, 111180, names one of them.
   ============================================================ */

const inflate = async (raw: Uint8Array): Promise<Uint8Array> => new Uint8Array(inflateRawSync(raw))

let data: CatalogueData
let set: ChangeSet
let plan: ReturnType<typeof planNewFile>

const TUBE = 'Tube Covers to suit PVC Boat - 2.0 Mtr'
const BATTERY = 'Battery, Lithium 24v 100Amp (Bluetooth)'

beforeAll(async () => {
  const pack = await loadPack()
  const tables: Record<string, EntityDef> = {}
  for (const e of pack.entities) tables[e.id] = e
  data = {
    ...emptySheet(),
    orgId: 'northside',
    tables,
    rows: pack.rowsByEntity,
    index: indexRows(pack.rowsByEntity),
  }
  const shackle = data.rows.parts.find((r) =>
    String(r.values['parts.c']).startsWith('Dee Shackle (Forged) w Captive Bolt 6mm'),
  )!
  const tube = data.rows.parts.find((r) => r.values['parts.c'] === TUBE)!
  const battery = data.rows.parts.find(
    (r) => r.values['parts.c'] === BATTERY && r.values['parts.e'] === '111180',
  )!
  const bytes = writeWorkbook([
    {
      name: 'Parts Maintenance',
      lines: [
        lineOf(data, battery, { L: 2990 }, 275),
        lineOf(data, tube, { G: 1200, L: 1540 }, 597),
        lineOf(data, shackle, { L: 3 }, 676),
        { at: 9001, cells: { C: 'Shelf Test Bracket 40mm', D: 'IBC', E: 'STB-40', L: 55 } },
      ],
    },
  ])
  const book = await readWorkbook(bytes, inflate, (n) => sheetsOnThePriceList(data).has(n))
  plan = planNewFile(book, data, 'Parts Module (2).xlsx')
  set = changeSetOf(plan, book, data)
})

describe('the change set', () => {
  it('keeps every line in workbook order, the one that cannot be placed where it stands', () => {
    expect(set.lines.map((l) => [l.at, l.fate])).toEqual([
      [275, 'cannot'],
      [597, 'change'],
      [676, 'change'],
      [9001, 'new'],
    ])
  })

  it('names every figure that moves, old and new, and marks Northside’s own', () => {
    const tube = set.lines.find((l) => l.at === 597)!
    expect(tube.cells.map((c) => [c.name, c.from, c.to, c.own])).toEqual([
      ['P&A', 1240, 1200, true],
      ['Sell', 1640, 1540, false],
    ])
    expect(tube.read).toEqual({ label: 'Sell', fieldId: 'parts.l', from: 1640, to: 1540 })
    expect(tube.supplier).toBe('IBC')
    expect(tube.category).toBe('TUBE COVERS - To suit Highfield Boats')
    expect(wayOf(tube)).toBe('lower')
  })

  it('counts each list’s figures, busiest first', () => {
    const parts = set.lists.find((l) => l.tableId === 'parts')!
    expect(parts.figures.map((f) => [f.name, f.lines, f.higher, f.lower])).toEqual([
      ['Sell', 2, 0, 2],
      ['P&A', 1, 0, 1],
    ])
    expect(parts.suppliers).toBe(true)
  })

  it('says how far a price swung, and counts the doubled or halved', () => {
    const shackle = set.lines.find((l) => l.at === 676)!
    expect(shackle.swing).toBeGreaterThan(DOUBLED)
    expect(set.doubled).toBe(1)
  })

  it('offers the lines that share a name, with the one the workbook’s own Code names', () => {
    const battery = set.lines.find((l) => l.at === 275)!
    expect(battery.because).toBe('shared-name')
    expect(battery.candidates?.map((c) => [c.code, c.read])).toEqual([
      ['111234', 1899],
      ['111180', 2890],
    ])
    const named = battery.candidates!.find((c) => c.code === '111180')!
    expect(battery.suggested).toEqual({ rowId: named.rowId, by: 'code' })
    expect(named.cells.map((c) => [c.name, c.from, c.to])).toContainEqual(['Sell', 2890, 2990])
    expect(set.suggested).toBe(1)
  })

  it('tells namesakes on one list apart by the group they are filed under', () => {
    const fit = data.tables.dealer_fit
    const names = figureNames(fit)
    expect(names.get('dealer_fit.d')).toBe('Code')
    expect(names.get('dealer_fit.u')).toBe('Primary Accessory Code')
    expect(names.get('dealer_fit.v')).toBe('Primary Accessory CTD')
    expect(names.get('dealer_fit.t')).toBe('Accessory (Primary)')
    const gp = fit.fields.find((f) => f.id === 'dealer_fit.q')!
    expect(isOwnFigure(fit, gp)).toBe(true)
  })
})

describe('narrowing', () => {
  it('finds by supplier, by words, by way and by figure', () => {
    expect(narrowed(set.lines, { supplier: 'ibc' }).map((l) => l.at)).toEqual([597, 9001])
    expect(narrowed(set.lines, { q: 'tcpvc 2.0' }).map((l) => l.at)).toEqual([597])
    expect(narrowed(set.lines, { way: 'cannot' }).map((l) => l.at)).toEqual([275])
    expect(narrowed(set.lines, { way: 'new' }).map((l) => l.at)).toEqual([9001])
    expect(narrowed(set.lines, { figure: 'parts.g' }).map((l) => l.at)).toEqual([597])
    expect(narrowed(set.lines, { doubled: true }).map((l) => l.at)).toEqual([676])
  })
})

describe('the choices, as one step', () => {
  it('holds a line back and writes the rest, with one way back', () => {
    const shackle = set.lines.find((l) => l.at === 676)!
    const choices = { out: new Set([shackle.key]), placed: new Map<string, string>() }
    const t = tally(set, choices)
    expect([t.in, t.of, t.leftOut.map((l) => l.at), t.stillOut]).toEqual([2, 3, [676], 1])

    const command = chosenCommand(plan, set, choices, 'two of three')!
    const done = apply(data, command, 'now')
    if (!isDone(done)) throw new Error(done.refused)
    const row = (id: string) => done.next.rows.parts.find((r) => r.id === id)
    expect(row(shackle.rowId!)?.values['parts.l']).toBe(98)
    expect(row(set.lines.find((l) => l.at === 597)!.rowId!)?.values['parts.l']).toBe(1540)
    expect(done.next.rows.parts.length).toBe(data.rows.parts.length + 1)
    const back = apply(done.next, done.inverse, 'later')
    if (!isDone(back)) throw new Error(back.refused)
    expect(back.next.rows.parts.length).toBe(data.rows.parts.length)
  })

  it('places a line on the one its Code names, and refuses a second line on the same one', () => {
    const placed = placeSuggested(set, NO_CHOICES)
    const battery = set.lines.find((l) => l.at === 275)!
    expect(placed.placed.get(battery.key)).toBe(battery.suggested?.rowId)
    expect(tally(set, placed).in).toBe(4)
    /* the tube cover's own line, asked to be placed where its change already writes */
    const tube = set.lines.find((l) => l.at === 597)!
    expect(placeRefusal(set, placed, battery.key, tube.rowId!)).toMatch(/already changes that one/)
    const done = apply(data, chosenCommand(plan, set, placed, 'all')!, 'now')
    if (!isDone(done)) throw new Error(done.refused)
    expect(
      done.next.rows.parts.find((r) => r.id === battery.suggested?.rowId)?.values['parts.l'],
    ).toBe(2990)
  })

  it('writes nothing when every line is left out', () => {
    const out = new Set(set.lines.filter((l) => l.fate !== 'cannot').map((l) => l.key))
    expect(chosenCommand(plan, set, { out, placed: new Map() }, 'none')).toBeNull()
  })
})

describe('the quotes being written', () => {
  it('names the draft lines a kept change would move, and by how much; a given quote is not one', () => {
    const tube = set.lines.find((l) => l.at === 597)!
    const draft = {
      id: 'q1',
      reference: '20261104-01',
      state: 'draft',
      subjectLabel: 'Highfield Sport 560',
      customer: { name: 'R. Kelleher' },
      lines: [
        {
          id: 'l1',
          entityId: 'parts',
          rowId: tube.rowId!,
          label: TUBE,
          qty: 2,
          unitPrice: 1640,
          priceFieldId: 'parts.l',
        },
      ],
    } as unknown as QuoteDef
    const given = { ...draft, id: 'q2', state: 'issued' } as QuoteDef
    const moved = draftsMoved([draft, given], set, NO_CHOICES)
    expect(moved).toEqual([
      {
        quoteId: 'q1',
        reference: '20261104-01',
        subject: 'Highfield Sport 560',
        customer: 'R. Kelleher',
        lines: [{ label: TUBE, qty: 2, carries: 1640, would: 1540 }],
        by: -200,
      },
    ])
    expect(draftsMoved([draft], set, { out: new Set([tube.key]), placed: new Map() })).toEqual([])
  })
})

/* ---- Northside's own workbook, where this computer has it ---- */

const REAL = 'C:/Users/Asaf/dev/mpf-workbooks/Parts Module (2).xlsx'

describe.runIf(existsSync(REAL))('Northside’s Parts Module (2), as the judge measured it', () => {
  it('reads every figure the round names', async () => {
    const book = await readWorkbook(new Uint8Array(readFileSync(REAL)), inflate, (n) =>
      sheetsOnThePriceList(data).has(n),
    )
    const real = changeSetOf(planNewFile(book, data, 'Parts Module (2).xlsx'), book, data)
    expect([real.changing, real.adding, real.cannot, real.suggested, real.doubled]).toEqual([
      3082, 817, 61, 47, 25,
    ])
    expect(real.unmoved).toBe(12609)
    /* no Dealer Fit line is a bare count of figures: each names what moves */
    const fit = real.lines.filter((l) => l.tableId === 'dealer_fit' && l.fate === 'change')
    expect(fit.length).toBe(1625)
    expect(fit.every((l) => l.cells.length > 0 && l.cells.every((c) => c.name !== ''))).toBe(true)
    /* IBC, found by its supplier: 58 tube covers, every one lower at Sell */
    const ibc = narrowed(real.lines, { supplier: 'IBC' })
    expect(ibc.length).toBe(58)
    expect(ibc.every((l) => wayOf(l) === 'lower')).toBe(true)
    /* placing what the Code names adds 20 changes */
    const placed = placeSuggested(real, NO_CHOICES)
    expect(tally(real, placed).in - tally(real, NO_CHOICES).in).toBe(20)
  }, 120_000)
})
