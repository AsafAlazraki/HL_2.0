import { describe, expect, it } from 'vitest'
import { RECENT_KEPT, readRecent, recentRows, remember } from './recent'

const place = (href: string) => ({ href, name: href, fact: 'a place' })

describe('what was kept, read back', () => {
  it('gives nothing back for anything that is not a list of places', () => {
    expect(readRecent(undefined)).toEqual([])
    expect(readRecent(null)).toEqual([])
    expect(readRecent('/data')).toEqual([])
    expect(readRecent({ href: '/data' })).toEqual([])
  })

  it('drops a broken row rather than repairing it, and keeps the rest', () => {
    expect(readRecent([place('/data'), { href: '/x' }, 7, place('/history')])).toEqual([
      place('/data'),
      place('/history'),
    ])
  })

  it('never hands back more than it keeps', () => {
    const many = Array.from({ length: 20 }, (_, i) => place(`/p${i}`))
    expect(readRecent(many)).toHaveLength(RECENT_KEPT)
  })
})

describe('remembering one', () => {
  it('puts it at the head, keeps each address once, and stops at the bound', () => {
    let list = [place('/a'), place('/b')]
    list = remember(list, place('/c'))
    expect(list.map((p) => p.href)).toEqual(['/c', '/a', '/b'])
    list = remember(list, place('/a'))
    expect(list.map((p) => p.href)).toEqual(['/a', '/c', '/b'])
    for (let i = 0; i < 10; i += 1) list = remember(list, place(`/n${i}`))
    expect(list).toHaveLength(RECENT_KEPT)
  })
})

describe('as rows the finder can draw', () => {
  it('leaves out the address somebody is standing on', () => {
    const rows = recentRows([place('/data'), place('/history')], '/data')
    expect(rows.map((r) => r.name)).toEqual(['/history'])
  })

  it('keys itself apart from the doors, so the five doors stay five', () => {
    const rows = recentRows([place('/data')], '/history')
    expect(rows[0]?.id).toBe('recent:/data')
    expect(rows[0]?.verb).toBe('Go back to it')
    expect(rows[0]?.target).toEqual({ at: 'door', href: '/data' })
  })
})
