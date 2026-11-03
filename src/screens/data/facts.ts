/* ============================================================
   WHAT DATA SAYS ABOUT THE PRICE FILE'S STATE, gathered once from the
   readers that already count each thing on its own room — so every
   figure on Data's head is the same figure the room behind its door
   prints (direction A, "The Monday list", 2026-11-03).

     Review    `review` → `queueOf`, counted in cases as Review's queue
               walks them; `casesByList` puts each case on its list
     Prices    `readLadder` → `undecided`, as Prices' own head reads it
     Rules     `readColumns` → `statedRules` / `yourRules` → `partsOf`
               → `houseOf`, and what the price list was noticed doing
     Catalogue `shelfOf` → `aislesOf`, with each part's own picture
     Fitment   `countBoats`, the models Home and the picker count
     Shelf     the last copy saved, the shelf's own preference
     the file  `datedSections` (the headings' own "as at" dates),
               `changedSince` (lines written after the packing),
               `fitsMatrixOf` (the 28 lists of what fits)

   Review is the slow one — a tenth of a second on this file, measured
   2026-10-22 — so it is read after the screen has drawn, and until
   then its figure is null and the screen says it is counting. Every
   other figure is a pure function of the store, memoised on the store.
   ============================================================ */
import { useEffect, useMemo, useState } from 'react'
import { makeCtx, type TableKind } from '@/domain/model'
import { catalogue as catalogueStore, ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { useCatalogue, usePrefs } from '@/app/useStores'
import { readTableRegister, type RegisterRow, type TableRegister } from '@/domain/modules/register'
import { fitsMatrixOf, type FitsMatrix } from '@/domain/modules/fitsMatrix'
import { countBoats } from '@/domain/quote/boats'
import { review } from '@/domain/rules/review/checks'
import { casesByKind, linesIn, queueOf, type CaseKind } from '@/domain/rules/review/cases'
import { casesByList } from '@/domain/rules/review/byList'
import { datedSections, type DatedReport } from '@/domain/catalogue/asAt'
import { changedSince, type ChangedReport } from '@/domain/catalogue/changed'
import { aislesOf, UNSORTED } from '@/domain/catalogue/aisles'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { readLadder, undecided, type Column } from '@/screens/levels/read'
import { houseOf, partsOf, readColumns, statedRules, yourRules } from '@/screens/rules/read'
import { MEANT_PREF, meantOf } from '@/screens/review/read'
import { hasPicture, shelfOf } from '@/screens/catalogue/shelf'
import { LAST_COPY_PREF } from '@/screens/shelf/acts'
import { provenanceOfSheet, type FileProvenance } from './file'

export interface ReviewFacts {
  cases: number
  byKind: Record<CaseKind, number>
  /** the lines those cases stand on */
  lines: number
  tidy: number
  byList: Map<string, number>
}

export interface FileFacts {
  register: TableRegister
  provenance: FileProvenance
  /** the boat makers' models, by list id, as Home and the picker count them */
  models: Map<string, number>
  boats: { models: number; makers: number; lines: number }
  /** the lists the price file brought, the boat lists apart: what a dealer sells from */
  sellFrom: RegisterRow[]
  /** the lists made on this computer, the customers book apart */
  madeHere: RegisterRow[]
  /** a list you sell from that no list of what fits names, and that can be fitted to a boat */
  unnamed: RegisterRow[]
  dated: DatedReport
  datedByList: Map<string, number>
  /** null where the file's packing instant is not known, so nothing can be said to be new */
  changed: ChangedReport | null
  matrix: FitsMatrix
  prices: { open: Column[]; openLines: number; settled: number }
  rules: { kept: number; written: number; noticed: number }
  catalogue: { onSale: number; aisles: number; pictured: number }
  lastCopy: string | null
  /** read after the first paint; null until it has been */
  review: ReviewFacts | null
  /** every list the file says it carries is on this computer: loaded of expected */
  loaded: { lists: number; expected: number | null }
}

const FITTABLE: ReadonlySet<TableKind> = new Set(['motor', 'trailer', 'package', 'accessory'])

export function useFileFacts(open: boolean): FileFacts {
  const version = useCatalogue((s) => s.version)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const priceLevels = useCatalogue((s) => s.priceLevels)
  const constraintDefs = useCatalogue((s) => s.constraintDefs)
  const meantPref = usePrefs((s) => s.values[MEANT_PREF])
  const lastCopy = usePrefs((s) => s.values[LAST_COPY_PREF])

  const register = useMemo(
    () => readTableRegister(tables, rows, modules, priceLevels),
    [tables, rows, modules, priceLevels],
  )
  const provenance = provenanceOfSheet(version)

  const boatCount = useMemo(() => countBoats(tables, rows), [tables, rows])
  const models = useMemo(() => {
    const byId = new Map<string, number>()
    for (const m of boatCount.byMaker) byId.set(m.id, m.boats)
    return byId
  }, [boatCount])

  const lists = useMemo(() => {
    const desk = (r: RegisterRow): boolean => r.provenance.kind === 'desk'
    const sellFrom = register.rows.filter((r) => !desk(r))
    return {
      sellFrom,
      madeHere: register.rows.filter((r) => desk(r) && r.id !== CUSTOMER_TABLE_ID),
      unnamed: sellFrom.filter(
        (r) => !r.retired && FITTABLE.has(r.kind) && r.namedBy.models === 0,
      ),
    }
  }, [register])

  const dated = useMemo(() => datedSections(tables, rows), [tables, rows])
  const datedByList = useMemo(() => {
    const out = new Map<string, number>()
    for (const s of dated.sections) out.set(s.tableId, (out.get(s.tableId) ?? 0) + 1)
    return out
  }, [dated])

  const packedAt = provenance.known ? provenance.file.packedAt : null
  const changed = useMemo(() => {
    if (packedAt === null) return null
    return changedSince(
      tables,
      rows,
      packedAt,
      (id) => register.facts[id] !== undefined && register.facts[id].provenance.kind !== 'desk',
    )
  }, [tables, rows, packedAt, register])

  const matrix = useMemo(() => fitsMatrixOf(register.plates, register.pairings), [register])

  const prices = useMemo(() => {
    if (!open) return { open: [], openLines: 0, settled: 0 }
    const ladder = readLadder({ tables, rows, priceLevels })
    const asked = ladder.filter(undecided).toSorted((a, b) => b.lines - a.lines)
    return {
      open: asked,
      openLines: asked.reduce((n, c) => n + c.lines, 0),
      settled: ladder.length - asked.length,
    }
  }, [open, tables, rows, priceLevels])

  const rules = useMemo(() => {
    if (!open) return { kept: 0, written: 0, noticed: 0 }
    const world = { entities: tables, rowsByEntity: rows }
    const cols = readColumns(world)
    const book = partsOf(statedRules(cols), yourRules(constraintDefs, world))
    const house = houseOf(book)
    return {
      kept: house.kept,
      written: house.written,
      noticed: book.reduce((n, p) => n + p.noticed.length, 0),
    }
  }, [open, tables, rows, constraintDefs])

  const catalogue = useMemo(() => {
    if (!open) return { onSale: 0, aisles: 0, pictured: 0 }
    const ctx = makeCtx({
      ...ctxFrom(catalogueStore.getState()),
      orgId: PACK_ORG_ID,
    })
    const shelf = shelfOf(ctx)
    const counted = aislesOf(shelf, hasPicture)
    return {
      onSale: shelf.length,
      aisles: counted.filter((a) => a.aisle.id !== UNSORTED).length,
      pictured: counted.reduce((n, a) => n + a.pictured, 0),
    }
    /* the store's tables and rows are what the shelf is read off */
  }, [open, tables, rows]) // eslint-disable-line react-hooks/exhaustive-deps

  /* REVIEW, AFTER THE FIRST PAINT, as Review counts it (see the header) */
  const [reviewFacts, setReview] = useState<ReviewFacts | null>(null)
  useEffect(() => {
    if (!open) {
      setReview(null)
      return
    }
    let dropped = false
    const timer = window.setTimeout(() => {
      if (dropped) return
      const read = review({ entities: tables, rowsByEntity: rows }, meantOf(meantPref))
      const cases = queueOf(read)
      setReview({
        cases: cases.length,
        byKind: casesByKind(cases),
        lines: cases.reduce((n, c) => n + linesIn(c), 0),
        tidy: read.tidyCount,
        byList: casesByList(cases),
      })
    }, 0)
    return () => {
      dropped = true
      window.clearTimeout(timer)
    }
  }, [open, tables, rows, meantPref])

  const expected = provenance.known ? (provenance.file.counts?.tables ?? null) : null

  return {
    register,
    provenance,
    models,
    boats: { models: boatCount.boats, makers: boatCount.makers, lines: boatCount.lines },
    ...lists,
    dated,
    datedByList,
    changed,
    matrix,
    prices,
    rules,
    catalogue,
    lastCopy: typeof lastCopy === 'string' ? lastCopy : null,
    review: reviewFacts,
    loaded: { lists: register.head.tables, expected },
  }
}
