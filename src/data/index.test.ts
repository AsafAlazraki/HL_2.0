import { describe, expect, it } from 'vitest'
import type { QuoteDef } from '@/domain/model'
import { repositories } from './index'

const NOW = '2026-09-16T00:00:00.000Z'

const quote = (id: string): QuoteDef => ({
  id,
  orgId: 'o1',
  reference: id,
  state: 'draft',
  viewId: 'v',
  rootTableId: 't-a',
  rootRowId: 't-a:1',
  subjectLabel: '',
  subjectSpecs: [],
  sections: [],
  chapters: [],
  lines: [],
  adjustments: [],
  events: [],
  levelKey: 'cash',
  customer: { name: '' },
  createdAt: NOW,
  updatedAt: NOW,
})

describe('repositories(orgId)', () => {
  it('chooses the memory adapter under vitest', () => {
    expect(repositories('o1').kind).toBe('memory')
  })

  it('files the catalogue and the quotes into one database, so a wipe provably keeps the quotes', async () => {
    const { catalogue, quotes } = repositories('o1')
    await quotes.put(quote('q1'))
    await catalogue.tables.put({
      id: 't-a',
      orgId: 'o1',
      name: 'Table A',
      accent: 'blue',
      fields: [],
      position: { x: 0, y: 0 },
      createdAt: NOW,
      updatedAt: NOW,
    })
    await catalogue.wipe()
    expect(await catalogue.tables.all()).toEqual([])
    expect((await quotes.list()).map((q) => q.id)).toEqual(['q1'])
  })

  it('two calls for one organisation see the same disk', async () => {
    const first = repositories('o1')
    const second = repositories('o1')
    await first.quotes.put(quote('q2'))
    expect((await second.quotes.get('q2'))?.id).toBe('q2')
  })
})
