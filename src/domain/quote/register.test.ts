import { afterAll, describe, expect, it } from 'vitest'
import type { QuoteDef, QuoteLine } from '@/domain/model'
import { newestFirst } from '@/data/repository'
import {
  NOTHING_ON_IT,
  NOT_PRICED,
  REGISTER_BANDS,
  ageSay,
  bandOf,
  readRegister,
  registerRow,
  supersededBy,
  versionsOf,
} from './register'

/* ============================================================
   THE REGISTER'S OWN ARITHMETIC, against documents built here.

   Every quote below is constructed in this file rather than seeded
   anywhere: these are the shapes the engine produces, written down so
   the reading can be driven without a browser, a store or a pack.
   Nothing here is data the app would ever show a person.

   THE ZONE IS PINNED, for the same reason `referenceDay.test.ts` pins
   it: `ageSay` falls back to `localDay`, which reads the day in the
   READER'S zone, and in UTC every assertion about it is accidentally
   true. Australia/Brisbane is UTC+10 and is where Northside Marine
   are. Node reads `process.env.TZ` on each `Date` operation, so
   setting it here takes effect immediately and putting it back leaves
   the rest of the suite on whatever zone the machine has.

   `newestFirst` IS THE REPOSITORY'S OWN ORDER, imported rather than
   re-sorted: `supersededBy` promises the NEWEST replacement wins, and
   that promise is only meaningful against the order every adapter
   hands the register.
   ============================================================ */

const ENV = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env
const ORIGINAL_TZ = ENV?.TZ
if (ENV) ENV.TZ = 'Australia/Brisbane'
afterAll(() => {
  if (ENV) ENV.TZ = ORIGINAL_TZ
})

let n = 0

function line(id: string, label: string, unitPrice: number | null): QuoteLine {
  return {
    id,
    entityId: 'tbl_boats',
    rowId: 'row_1',
    label,
    qty: 1,
    unitPrice,
    priceFieldId: 'fld_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: unitPrice, scope: 'quote' }],
  }
}

function quote(over: Partial<QuoteDef> = {}): QuoteDef {
  n += 1
  const hull = line(`l${n}`, 'Stacer 529 Assault Pro', 28_530)
  const at = new Date(Date.UTC(2026, 8, 1 + n, 1)).toISOString()
  return {
    id: `q${n}`,
    orgId: 'northside',
    reference: `2026090${n}-01`,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'tbl_boats',
    rootRowId: 'row_1',
    subjectLabel: 'Stacer 529 Assault Pro',
    subjectSpecs: [],
    sections: [{ blockId: '__subject', tableId: 'tbl_boats', title: 'Boats', lineIds: [hull.id] }],
    chapters: [{ id: '__subject', title: 'Boats', tableId: 'tbl_boats' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: 'R. Kelleher' },
    createdAt: at,
    updatedAt: at,
    ...over,
  }
}

const bare = (): readonly QuoteDef[] => []

describe('which band a document falls in', () => {
  it('puts a draft in Draft and an issued quote in Issued', () => {
    const draft = quote()
    const issued = quote({ state: 'issued', issuedAt: '2026-09-10T00:00:00.000Z' })
    const none = new Set<string>()
    expect(bandOf(draft, none)).toBe('draft')
    expect(bandOf(issued, none)).toBe('issued')
  })

  it('moves an issued quote to Superseded only once something names it', () => {
    const first = quote({ state: 'issued', issuedAt: '2026-09-10T00:00:00.000Z' })
    const second = quote({ supersedesId: first.id })
    const replaced = supersededBy([second, first])
    expect(bandOf(first, new Set(replaced.keys()))).toBe('superseded')
    /* the new version is a DRAFT and stays one: superseding something
       is not a state of your own */
    expect(bandOf(second, new Set(replaced.keys()))).toBe('draft')
  })

  it('names the newest replacement when two versions were made from one quote', () => {
    const first = quote({ state: 'issued' })
    const older = quote({ supersedesId: first.id })
    const newer = quote({ supersedesId: first.id })
    /* newest first, which is the order the repository promises */
    const replaced = supersededBy(newestFirst([first, older, newer]))
    expect(replaced.get(first.id)?.id).toBe(newer.id)
  })
})

describe('one row, read off a frozen document', () => {
  const read = (q: QuoteDef, all: QuoteDef[] = [q]) => {
    const replaced = supersededBy(all)
    return registerRow(q, new Set(replaced.keys()), replaced, new Map(all.map((x) => [x.id, x])))
  }

  it('carries the reference, the customer, the boat and the total', () => {
    const q = quote()
    const row = read(q)
    expect(row.reference).toBe(q.reference)
    expect(row.customer).toBe('R. Kelleher')
    expect(row.boat).toBe('Stacer 529 Assault Pro')
    expect(row.total).toBe(28_530)
    expect(row.insteadOfTotal).toBeNull()
  })

  it('says nobody is named rather than printing an empty name', () => {
    expect(read(quote({ customer: { name: '   ' } })).customer).toBeNull()
  })

  it('puts a sentence where the figure would stand when there is nothing on it', () => {
    const row = read(quote({ lines: [], sections: [] }))
    expect(row.total).toBeNull()
    expect(row.insteadOfTotal).toBe(NOTHING_ON_IT)
  })

  it('refuses to print a nought nobody decided on', () => {
    const row = read(quote({ lines: [line('lx', 'Signature Fisher 525F', null)] }))
    expect(row.total).toBeNull()
    expect(row.insteadOfTotal).toBe(NOT_PRICED)
    expect(row.unpriced).toBe(1)
  })

  it('prints a nought somebody DID decide on, because an even swap is a real document', () => {
    const row = read(
      quote({
        lines: [line('ly', 'Stacer 529 Assault Pro', 62_000)],
        adjustments: [
          { id: 'a1', kind: 'tradeIn', label: 'Trade: 2019 Quintrex', amount: -62_000 },
        ],
      }),
    )
    expect(row.total).toBe(0)
    expect(row.insteadOfTotal).toBeNull()
  })

  it('names both ends of the supersedes link by reference', () => {
    const first = quote({ state: 'issued' })
    const second = quote({ supersedesId: first.id })
    const all = [second, first]
    expect(read(second, all).supersedes).toBe(first.reference)
    expect(read(second, all).supersededBy).toBeNull()
    expect(read(first, all).supersededBy).toBe(second.reference)
    expect(read(first, all).supersedesId).toBeNull()
  })

  it('keeps the id and prints no reference when the document it replaced is gone', () => {
    const orphan = quote({ supersedesId: 'a-quote-that-was-discarded' })
    const row = read(orphan)
    expect(row.supersedesId).toBe('a-quote-that-was-discarded')
    expect(row.supersedes).toBeNull()
  })
})

describe('the whole register', () => {
  it('is bare, with three named bands each holding nothing, when nothing exists', () => {
    const register = readRegister(bare())
    expect(register.bare).toBe(true)
    expect(register.held).toBe(0)
    expect(register.bands).toHaveLength(3)
    expect(register.bands.map((b) => b.spec.id)).toEqual(['draft', 'issued', 'superseded'])
    for (const band of register.bands) {
      expect(band.held).toBe(0)
      expect(band.rows).toEqual([])
      expect(band.sum).toBe(0)
      expect(band.spec.empty).not.toBe('')
    }
  })

  it('bands every document and sums each band off its frozen lines', () => {
    const a = quote({ lines: [line('a', 'Hull', 10_000)] })
    const b = quote({ lines: [line('b', 'Hull', 20_000)] })
    const issued = quote({ state: 'issued', lines: [line('c', 'Hull', 30_000)] })
    const register = readRegister(newestFirst([a, b, issued]))
    const draft = register.bands[0]!
    expect(draft.held).toBe(2)
    expect(draft.sum).toBe(30_000)
    expect(draft.summed).toBe(2)
    expect(register.bands[1]!.sum).toBe(30_000)
    expect(register.held).toBe(3)
    expect(register.bare).toBe(false)
  })

  it('lists the shown rows in the order they are DRAWN, not the order they were filed', () => {
    /* the newest document of the three is an issued one that the
       oldest supersedes, so it belongs in the LAST band — and a
       cursor built in document order would open the register on its
       own bottom row */
    const first = quote({ state: 'issued', reference: 'OLDEST' })
    const middle = quote({ reference: 'MIDDLE' })
    const newest = quote({ reference: 'NEWEST', state: 'issued', supersedesId: 'nothing-here' })
    const replaced = quote({ reference: 'REPLACES-OLDEST', supersedesId: first.id })
    const register = readRegister(newestFirst([first, middle, newest, replaced]))

    expect(register.shown.map((r) => r.reference)).toEqual([
      /* Draft, newest first */
      'REPLACES-OLDEST',
      'MIDDLE',
      /* then Issued */
      'NEWEST',
      /* then Superseded */
      'OLDEST',
    ])
    expect(register.shown).toEqual(register.bands.flatMap((b) => b.rows))
  })

  it('sums only the rows that carry a figure, and counts how many those were', () => {
    const priced = quote({ lines: [line('a', 'Hull', 10_000)] })
    const unpriced = quote({ lines: [line('b', 'Hull', null)] })
    const draft = readRegister(newestFirst([priced, unpriced])).bands[0]!
    expect(draft.rows).toHaveLength(2)
    expect(draft.sum).toBe(10_000)
    expect(draft.summed).toBe(1)
  })

  it('narrows on the query and keeps every band’s own held count', () => {
    const kelleher = quote({ customer: { name: 'R. Kelleher' } })
    const nguyen = quote({ customer: { name: 'T. Nguyen' } })
    const register = readRegister(newestFirst([kelleher, nguyen]), 'nguyen')
    expect(register.shown).toHaveLength(1)
    expect(register.shown[0]!.customer).toBe('T. Nguyen')
    /* the denominator does not move: two drafts are still filed */
    expect(register.bands[0]!.held).toBe(2)
    expect(register.bands[0]!.rows).toHaveLength(1)
  })

  it('finds by reference, by boat and by who prepared it', () => {
    const one = quote({ reference: '20260917-04', preparedBy: 'Asaf' })
    const two = quote({ subjectLabel: 'Highfield SP 560', preparedBy: 'Dana' })
    const all = newestFirst([one, two])
    expect(readRegister(all, '20260917-04').shown.map((r) => r.id)).toEqual([one.id])
    expect(readRegister(all, 'highfield').shown.map((r) => r.id)).toEqual([two.id])
    expect(readRegister(all, 'dana').shown.map((r) => r.id)).toEqual([two.id])
    expect(readRegister(all, 'zzzz').shown).toEqual([])
  })
})

describe('the version chain', () => {
  it('reads one conversation oldest first, from single links', () => {
    const v1 = quote({ state: 'issued', reference: 'A' })
    const v2 = quote({ state: 'issued', reference: 'B', supersedesId: v1.id })
    const v3 = quote({ reference: 'C', supersedesId: v2.id })
    const all = newestFirst([v1, v2, v3])
    expect(versionsOf(all, v2.id).map((q) => q.reference)).toEqual(['A', 'B', 'C'])
    expect(versionsOf(all, v1.id).map((q) => q.reference)).toEqual(['A', 'B', 'C'])
    expect(versionsOf(all, v3.id).map((q) => q.reference)).toEqual(['A', 'B', 'C'])
  })

  it('is one document long when nothing supersedes and nothing was superseded', () => {
    const only = quote()
    expect(versionsOf([only], only.id).map((q) => q.id)).toEqual([only.id])
  })

  it('answers nothing for a document that is not here', () => {
    expect(versionsOf([quote()], 'gone')).toEqual([])
  })

  it('stops rather than hanging on a hand-edited cycle', () => {
    const a = quote({ id: 'qa', supersedesId: 'qb' })
    const b = quote({ id: 'qb', supersedesId: 'qa' })
    expect(versionsOf([a, b], 'qa')).toHaveLength(2)
  })
})

describe('how old a document reads', () => {
  const now = Date.parse('2026-09-17T10:00:00+10:00')
  const ago = (ms: number) => new Date(now - ms).toISOString()

  it('is minutes, then hours, then days, while the work is live', () => {
    expect(ageSay(ago(20_000), now)).toBe('just now')
    expect(ageSay(ago(60_000), now)).toBe('1 minute ago')
    expect(ageSay(ago(25 * 60_000), now)).toBe('25 minutes ago')
    expect(ageSay(ago(3_600_000), now)).toBe('1 hour ago')
    expect(ageSay(ago(5 * 3_600_000), now)).toBe('5 hours ago')
    expect(ageSay(ago(86_400_000), now)).toBe('1 day ago')
    expect(ageSay(ago(6 * 86_400_000), now)).toBe('6 days ago')
  })

  it('becomes the calendar day once the fact is historical', () => {
    /* eight days back from a Brisbane morning: the LOCAL day, which is
       what `day.ts` exists to keep true either side of 10:00 */
    expect(ageSay(ago(8 * 86_400_000), now)).toBe('2026-09-09')
  })

  it('never guesses at an instant it cannot read, and never counts backwards', () => {
    expect(ageSay('not a date', now)).toBe('not a date')
    expect(ageSay(new Date(now + 60_000).toISOString(), now)).toBe('2026-09-17')
  })
})

describe('the bands say what an empty one means', () => {
  it('gives every band a word, a sentence and an empty sentence', () => {
    for (const spec of REGISTER_BANDS) {
      expect(spec.word).not.toBe('')
      expect(spec.say.endsWith('.')).toBe(true)
      expect(spec.empty.endsWith('.')).toBe(true)
    }
  })
})
