import { describe, expect, it } from 'vitest'
import type { CatalogueEvent } from '@/domain/catalogue/commands'
import { NO_STAMPS } from '@/domain/catalogue/table/stamps'
import { pricesStamped } from '@/domain/pricing/chosen'
import { decidedElsewhere, lastSaid, preparedBy, whenSaid } from './decided'
import { lastChanged, settingRow, settingsStamped } from './stamped'
import { boatNamed } from './boatNamed'

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

describe('who last changed each setting, kept with the price list', () => {
  it('stamps each key a settings step changed, and a way back under the whole profile', () => {
    const one = settingsStamped(
      NO_STAMPS,
      ev({
        at: '2026-11-04T00:10:00.000Z',
        by: 'Asaf',
        changed: [{ path: 'org.gstRate', from: null, to: 10 }],
      }),
      'northside',
    )
    expect(lastChanged(one)).toEqual({
      key: 'gstRate',
      at: '2026-11-04T00:10:00.000Z',
      by: 'Asaf',
    })
    const two = settingsStamped(
      one,
      ev({
        kind: 'undone',
        at: '2026-11-04T00:12:00.000Z',
        by: 'Asaf',
        changed: [{ path: 'org', from: 'N', to: 'N' }],
      }),
      'northside',
    )
    expect(lastChanged(two)?.key).toBe('org')
    expect(lastChanged(two, ['gstRate'])?.at).toBe('2026-11-04T00:10:00.000Z')
    expect(
      Object.values(two)
        .map((s) => s.rowId)
        .toSorted(),
    ).toEqual([settingRow('gstRate'), settingRow('org')])
  })

  it('stamps nothing for a step that changed no setting, and hands the same stamps back', () => {
    const cell = ev({ kind: 'cell-set', changed: [{ path: 'boat_x.r1.f1', from: 1, to: 2 }] })
    expect(settingsStamped(NO_STAMPS, cell, 'northside')).toBe(NO_STAMPS)
  })

  it('says the last change with who and when, and nothing where none is kept', () => {
    const now = new Date(2026, 10, 4, 15, 0)
    const at = new Date(2026, 10, 4, 10, 12).toISOString()
    const kept = settingsStamped(
      NO_STAMPS,
      ev({ at, by: 'Asaf', changed: [{ path: 'org.gstRate', from: null, to: 10 }] }),
      'n',
    )
    expect(lastSaid(kept, now)).toMatch(/^The GST rate, by Asaf today at 10:12/)
    expect(lastSaid(NO_STAMPS, now)).toBeNull()
    expect(whenSaid(new Date(2026, 10, 3, 9, 0).toISOString(), now)).toBe('3 November')
  })
})

describe('everything Northside decided elsewhere, counted from its own records', () => {
  it('says nothing decided as nothing, with what that means', () => {
    const all = decidedElsewhere({ org: undefined, stamps: NO_STAMPS, pictures: [], galleries: [] })
    expect(all.map((d) => [d.key, d.count, d.door])).toEqual([
      ['prices', 0, '/levels'],
      ['leftAlone', 0, '/review'],
      ['suppliers', 0, '/catalogue'],
      ['aisles', 0, '/catalogue'],
      ['colours', 0, '/data'],
      ['pictures', 0, '/catalogue'],
    ])
    expect(all.every((d) => d.last === null)).toBe(true)
    expect(all.find((d) => d.key === 'leftAlone')?.said).toBe('None')
  })

  it('counts what Northside made, with the who and when each record keeps', () => {
    const stamps = pricesStamped(
      NO_STAMPS,
      ev({
        kind: 'prices-changed',
        at: '2026-11-04T01:00:00.000Z',
        by: 'Asaf',
        changed: [{ path: 'boat_stacer.priceLevels', from: null, to: 'x' }],
      }),
      'n',
    )
    const all = decidedElsewhere({
      org: {
        name: 'Northside Marine',
        industry: 'marine',
        createdAt: '',
        suppliers: { LOW: 'Lowrance', YAM: 'Yamaha' },
        leftAlone: {
          a: 'meant 2026-11-03T00:00:00.000Z Asaf',
          b: 'wrong 2026-11-04T02:00:00.000Z Sam',
        },
        colours: { I: 'White' },
      },
      stamps,
      pictures: [],
      galleries: [],
    })
    const by = Object.fromEntries(all.map((d) => [d.key, d]))
    expect(by.prices?.said).toBe('1 list chosen here')
    expect(by.prices?.last).toEqual({ at: '2026-11-04T01:00:00.000Z', by: 'Asaf' })
    expect(by.suppliers?.said).toBe('2 codes named')
    expect(by.leftAlone?.said).toBe('2 findings')
    expect(by.leftAlone?.last).toEqual({ at: '2026-11-04T02:00:00.000Z', by: 'Sam' })
    expect(by.colours?.said).toBe('1 letter named')
  })

  it('counts the quotes a person prepared on this computer, by name as a person says it', () => {
    const quotes = [{ preparedBy: 'Asaf' }, { preparedBy: ' asaf ' }, { preparedBy: 'Sam' }, {}]
    expect(preparedBy(quotes, 'Asaf')).toBe(2)
    expect(preparedBy(quotes, 'Nobody')).toBe(0)
  })
})

describe('a boat named the way a person says it', () => {
  it('never says the maker twice', () => {
    expect(boatNamed('Haines Signature', 'Signature Fisher 525F')).toBe(
      'Haines Signature Fisher 525F',
    )
    expect(boatNamed('Highfield', 'Sport 560')).toBe('Highfield Sport 560')
    expect(boatNamed('Stacer', 'Stacer 529 Assault Pro')).toBe('Stacer 529 Assault Pro')
    expect(boatNamed('', 'Sport 560')).toBe('Sport 560')
  })
})
