import { describe, expect, it } from 'vitest'
import { readDoorCounts } from './doors'
import { crestOf, initialsOf } from './crest'

/* The counts on the pill's doors and the mark in its crest, as arithmetic. The walk through
   the real app — the register's printed figure against the pill's, on a minted quote — is
   `e2e/flows/shell.spec.ts`. */

const quiet = { quotesRead: true, filed: 0, drafts: 0, people: null, tables: null }

describe('the Quotes door', () => {
  it('counts what the register counts: every quote filed, not the drafts among them', () => {
    /* the critique's desk: one issued quote, no draft open. The register prints "1 quote is
       filed in this browser"; the door printed 0 until 2026-09-23. */
    const one = readDoorCounts({ ...quiet, filed: 1, drafts: 0 }).quotes
    expect(one).toEqual({ count: 1, say: '1 filed', waiting: false })
  })

  it('says the open drafts aloud, and calls only them work waiting', () => {
    expect(readDoorCounts({ ...quiet, filed: 3, drafts: 1 }).quotes).toEqual({
      count: 3,
      say: '3 filed, 1 of them an open draft',
      waiting: true,
    })
    expect(readDoorCounts({ ...quiet, filed: 1_204, drafts: 12 }).quotes?.say).toBe(
      '1,204 filed, 12 of them open drafts',
    )
  })

  it('prints a real zero once the store has answered, and nothing before', () => {
    expect(readDoorCounts(quiet).quotes).toEqual({ count: 0, say: '0 filed', waiting: false })
    expect(readDoorCounts({ ...quiet, quotesRead: false }).quotes).toBeNull()
  })
})

describe('the Customers and Data doors', () => {
  it('draws no figure where nobody is a customer yet, and says customers where somebody is', () => {
    /* "filed" left the Customers screen on 2026-09-24 — a name typed on a quote is a customer
       the moment it is typed — so the door no longer says it either */
    expect(readDoorCounts(quiet).customers).toBeNull()
    expect(readDoorCounts({ ...quiet, people: 0 }).customers).toBeNull()
    expect(readDoorCounts({ ...quiet, people: 1 }).customers?.say).toBe('1 customer')
    expect(readDoorCounts({ ...quiet, people: 12 }).customers?.say).toBe('12 customers')
  })

  it('counts the tables the file carries, and nothing when no file is open', () => {
    expect(readDoorCounts(quiet).data).toBeNull()
    expect(readDoorCounts({ ...quiet, tables: 53 }).data).toEqual({
      count: 53,
      say: '53 tables',
      waiting: false,
    })
  })
})

describe('the crest', () => {
  it('is the business’s initials once the file names one', () => {
    expect(initialsOf('Northside Marine')).toBe('NM')
    expect(initialsOf('Whitworths')).toBe('W')
    expect(initialsOf('J. & R. Marine Services')).toBe('JR')
    expect(crestOf('Northside Marine', 'HelmLogic')).toEqual({
      kind: 'initials',
      initials: 'NM',
      name: 'Northside Marine',
    })
  })

  it('is never a hole: before a business is named it is the product’s own sign', () => {
    /* critique #21 — `initialsOf(null)` was the empty string in a blue disc */
    expect(initialsOf(null)).toBe('')
    expect(crestOf(null, 'HelmLogic')).toEqual({ kind: 'helm', name: 'HelmLogic' })
    /* a name with no letter in it is not a name to take initials from */
    expect(crestOf('   ', 'HelmLogic')).toEqual({ kind: 'helm', name: 'HelmLogic' })
    expect(crestOf('—', 'HelmLogic').kind).toBe('helm')
  })
})
