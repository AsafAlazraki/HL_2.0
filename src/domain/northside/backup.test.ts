/* ============================================================
   NORTHSIDE'S SETTINGS TRAVEL WHOLE IN A BACKUP (Milestone 4). The
   export envelope carried `org` and kept its name, industry and date;
   everything set on /manage would have been dropped on the way back into
   a wiped browser. It is read now by the one reader the store uses.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { EXPORT_KIND, EXPORT_VERSION } from '@/domain/model'
import { validateEnvelope } from '@/domain/io/envelope'

const settings = {
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: '2019-04-01T00:00:00.000Z',
  abn: '51 824 753 556',
  gstRate: 10,
  validDays: 30,
  deposit: 'A deposit of 10% holds the boat.',
  quoteTerms: 'Valid for 30 days.',
  people: [{ id: 'p1', name: 'Asaf', title: 'Sales manager', mayChange: false }],
  look: { brand: '#0066cc', corners: 'soft' },
  home: { hidden: ['makers'] },
}

describe('a backup with Northside’s settings in it', () => {
  it('reads every one of them back', () => {
    const read = validateEnvelope(
      {
        kind: EXPORT_KIND,
        version: EXPORT_VERSION,
        exportedAt: '2026-10-29T00:00:00.000Z',
        project: { name: 'Northside Marine', rev: 1 },
        entities: [],
        groups: [],
        rules: [],
        org: settings,
      },
      'northside',
    )
    if (!read.ok) throw new Error(read.error)
    expect(read.data.org).toEqual(settings)
  })
})
