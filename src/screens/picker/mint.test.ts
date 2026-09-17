import { beforeAll, describe, expect, it } from 'vitest'
import type { ModuleDef, QuoteDef, RowData } from '@/domain/model'
import { createCatalogueStore, type CatalogueData } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { addressOf, startQuote } from './mint'

/* ============================================================
   Pressing the act, against the real pack.

   The golden proof of Milestone 0 is the Stacer 529 Assault Pro, and
   it is the hull this file presses, so that what the picker writes can
   be read against a document the repository has already frozen once by
   two different engines.
   ============================================================ */

let pack: PackFixture
let sheet: CatalogueData
let assaultPro: RowData

beforeAll(async () => {
  pack = await loadPack()
  const store = createCatalogueStore()
  await store.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
  sheet = store.getState()
  const found = pack.rowsByEntity.boat_stacer.find((row) =>
    String(row.values['boat_stacer.c'] ?? '').includes('529 Assault Pro'),
  )
  if (!found) throw new Error('the pack no longer holds the Stacer 529 Assault Pro')
  assaultPro = found
})

const nothingStanding = (): QuoteDef | undefined => undefined
/* Brisbane is UTC+10 and the reference is stamped in local time; the
   quote engine's own suites pin the same instant for the same reason. */
const AT = new Date('2026-09-16T09:00:00+10:00')

describe('starting a quote from one row', () => {
  it('writes a document against that row, at the rung a new quote opens at', () => {
    const outcome = startQuote(
      {
        tableId: 'boat_stacer',
        rowId: assaultPro.id,
        sheet,
        orgId: 'northside',
        filed: [],
        preparedBy: 'Asaf',
        at: AT,
      },
      nothingStanding,
    )
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.already).toBe(false)
    expect(outcome.quote.rootTableId).toBe('boat_stacer')
    expect(outcome.quote.rootRowId).toBe(assaultPro.id)
    expect(outcome.quote.levelKey).toBe('cash')
    expect(outcome.quote.preparedBy).toBe('Asaf')
    expect(outcome.event).toBeDefined()

    /* THE HULL IS A LINE, AND ITS FIGURE IS THE FILE'S OWN CELL read
       at the declared rung — not a figure this screen worked out. */
    const hull = outcome.quote.lines.find((l) => l.rowId === assaultPro.id)
    expect(hull).toBeDefined()
    expect(hull?.unitPrice).toBe(assaultPro.values['boat_stacer.qr'])
    expect(hull?.priceColumnName).toBe(
      pack.byKey('boat_stacer').priceLevels?.find((l) => l.key === 'cash')?.label,
    )

    /* the boat brings what the file says goes with it, so a quote for a
       hull is never just the hull */
    expect(outcome.quote.lines.length).toBeGreaterThan(1)
    expect(outcome.quote.sections.length).toBeGreaterThan(1)
  })

  it('stamps the reference from the instant it was handed, and counts the day', () => {
    const first = startQuote(
      {
        tableId: 'boat_stacer',
        rowId: assaultPro.id,
        sheet,
        orgId: 'northside',
        filed: [],
        at: AT,
      },
      nothingStanding,
    )
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.quote.reference).toBe('20260916-01')

    const second = startQuote(
      {
        tableId: 'boat_stacer',
        rowId: assaultPro.id,
        sheet,
        orgId: 'northside',
        filed: [first.quote],
        at: AT,
      },
      nothingStanding,
    )
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.quote.reference).toBe('20260916-02')
  })

  it('says where the document opens, whether or not that screen is built', () => {
    const outcome = startQuote(
      {
        tableId: 'boat_stacer',
        rowId: assaultPro.id,
        sheet,
        orgId: 'northside',
        filed: [],
        at: AT,
      },
      nothingStanding,
    )
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.goTo).toBe(addressOf(outcome.quote.id))
    expect(outcome.goTo).toBe(`/quote/${outcome.quote.id}`)
  })

  /* THE ONE WRITE THIS FUNCTION MUST NOT MAKE. `createViewFor` files
     the view it derives into the context it is handed, and the context
     is built from the catalogue store's own maps. A quote that quietly
     added a view to the sheet would be structure as a side effect of
     pressing a button. */
  it('leaves the sheet it read exactly as it found it', () => {
    const before = Object.keys(sheet.views).length
    startQuote(
      {
        tableId: 'boat_stacer',
        rowId: assaultPro.id,
        sheet,
        orgId: 'northside',
        filed: [],
        at: AT,
      },
      nothingStanding,
    )
    expect(Object.keys(sheet.views).length).toBe(before)
  })
})

describe('the picker asks first', () => {
  it('hands back a draft already standing for the same row rather than writing a second', () => {
    const first = startQuote(
      {
        tableId: 'boat_stacer',
        rowId: assaultPro.id,
        sheet,
        orgId: 'northside',
        filed: [],
        at: AT,
      },
      nothingStanding,
    )
    expect(first.ok).toBe(true)
    if (!first.ok) return

    const again = startQuote(
      {
        tableId: 'boat_stacer',
        rowId: assaultPro.id,
        sheet,
        orgId: 'northside',
        filed: [first.quote],
        at: AT,
      },
      () => first.quote,
    )
    expect(again.ok).toBe(true)
    if (!again.ok) return
    expect(again.already).toBe(true)
    expect(again.quote.id).toBe(first.quote.id)
    expect(again.event).toBeUndefined()
    expect(again.said).toContain(first.quote.reference)
  })
})

describe('refusing, with a sentence', () => {
  it('refuses a register this browser no longer holds', () => {
    const outcome = startQuote(
      {
        tableId: 'boat_nothing',
        rowId: assaultPro.id,
        sheet,
        orgId: 'northside',
        filed: [],
        at: AT,
      },
      nothingStanding,
    )
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.refused).toMatch(/no longer in this browser/)
  })

  it('refuses a row that is not on the sheet, and names the register', () => {
    const outcome = startQuote(
      {
        tableId: 'boat_stacer',
        rowId: 'boat_stacer:nothing',
        sheet,
        orgId: 'northside',
        filed: [],
        at: AT,
      },
      nothingStanding,
    )
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.refused).toContain(pack.byKey('boat_stacer').name)
  })
})
