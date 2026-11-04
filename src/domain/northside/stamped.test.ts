import { describe, expect, it } from 'vitest'
import type { CatalogueEvent } from '@/domain/catalogue/commands'
import { NO_STAMPS, stampId, type Stamps } from '@/domain/catalogue/table/stamps'
import { lastChanged, settingRow, settingsStamped } from './stamped'

/* Who last changed each of Northside's settings, and when: one stamp per key of the profile,
   kept with the price list under a row id no list's line carries. */

const ev = (over: Partial<CatalogueEvent>): CatalogueEvent =>
  ({
    id: 'e',
    kind: 'settings-changed',
    at: '',
    said: '',
    label: '',
    changed: [],
    ...over,
  }) as CatalogueEvent

describe('a settings step, stamped', () => {
  it('stamps every key one step changed, once each, under its own row', () => {
    const out = settingsStamped(
      NO_STAMPS,
      ev({
        at: '2026-11-04T01:00:00.000Z',
        by: 'Asaf',
        changed: [
          { path: 'org.depositRule', from: null, to: 'share 10' },
          { path: 'org.deposit', from: null, to: 'Paid on order' },
          { path: 'org.depositRule.share', from: null, to: 10 },
        ],
      }),
      'northside',
    )
    expect(Object.keys(out).toSorted()).toEqual([
      stampId(settingRow('deposit'), 'last'),
      stampId(settingRow('depositRule'), 'last'),
    ])
    expect(out[stampId(settingRow('deposit'), 'last')]).toEqual({
      id: stampId(settingRow('deposit'), 'last'),
      orgId: 'northside',
      rowId: 'settings:deposit',
      fieldId: 'last',
      at: '2026-11-04T01:00:00.000Z',
      by: 'Asaf',
    })
  })

  it('keeps no name where the step was taken by nobody named', () => {
    const out = settingsStamped(
      NO_STAMPS,
      ev({
        at: '2026-11-04T01:00:00.000Z',
        changed: [{ path: 'org.phone', from: null, to: '07' }],
      }),
      'northside',
    )
    expect(Object.values(out)[0]).not.toHaveProperty('by')
  })

  it('stamps the steps inside a batch with the batch’s own who and when where theirs are not kept', () => {
    const out = settingsStamped(
      NO_STAMPS,
      ev({
        kind: 'batch',
        at: '2026-11-04T02:00:00.000Z',
        by: 'Jordan',
        events: [
          ev({ changed: [{ path: 'org.abn', from: null, to: '51824753556' }] }),
          ev({ kind: 'cell-set', changed: [{ path: 'boat_x.r1.f1', from: 1, to: 2 }] }),
        ],
      }),
      'northside',
    )
    expect(lastChanged(out)).toEqual({ key: 'abn', at: '2026-11-04T02:00:00.000Z', by: 'Jordan' })
    expect(Object.keys(out)).toHaveLength(1)
  })

  it('writes over a key’s earlier stamp, and leaves every other stamp as it was', () => {
    const before: Stamps = {
      'r1#f1': { id: 'r1#f1', orgId: 'northside', rowId: 'r1', fieldId: 'f1', at: '2026-11-01' },
    }
    const once = settingsStamped(
      before,
      ev({
        at: '2026-11-02T00:00:00.000Z',
        changed: [{ path: 'org.gstRate', from: null, to: 10 }],
      }),
      'northside',
    )
    const twice = settingsStamped(
      once,
      ev({ at: '2026-11-03T00:00:00.000Z', changed: [{ path: 'org.gstRate', from: 10, to: 15 }] }),
      'northside',
    )
    expect(Object.keys(twice)).toHaveLength(2)
    expect(twice['r1#f1']).toBe(before['r1#f1'])
    expect(lastChanged(twice)?.at).toBe('2026-11-03T00:00:00.000Z')
  })
})

describe('the last change, read back', () => {
  const stamps: Stamps = {
    a: { id: 'a', orgId: 'n', rowId: 'settings:abn', fieldId: 'last', at: '2026-11-02T00:00:00Z' },
    b: {
      id: 'b',
      orgId: 'n',
      rowId: 'settings:people',
      fieldId: 'last',
      at: '2026-11-03T00:00:00Z',
      by: 'Asaf',
    },
    c: {
      id: 'c',
      orgId: 'n',
      rowId: 'prices:boat_x',
      fieldId: 'level',
      at: '2026-11-09T00:00:00Z',
    },
    d: { id: 'd', orgId: 'n', rowId: 'r9', fieldId: 'f1', at: '2026-11-09T00:00:00Z' },
  }

  it('is the newest of the settings alone, never a list’s price or a cell', () => {
    expect(lastChanged(stamps)).toEqual({ key: 'people', at: '2026-11-03T00:00:00Z', by: 'Asaf' })
  })

  it('is the newest of the keys asked for, and nothing where none of them is kept', () => {
    expect(lastChanged(stamps, ['abn', 'phone'])).toEqual({
      key: 'abn',
      at: '2026-11-02T00:00:00Z',
    })
    expect(lastChanged(stamps, ['phone'])).toBeNull()
    expect(lastChanged(NO_STAMPS)).toBeNull()
  })
})
