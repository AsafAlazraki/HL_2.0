import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { fileIndexOf, findInFile, type FileIndex } from './fileFind'

/* THE FIND OVER THE WHOLE PRICE FILE, on the real pack. The three queries the judge of Data
   found answering nothing (2026-11-03): a maker on screen, a motor's code, and a list of what
   fits which boat. Each count is read a second way off the raw rows. */

let pack: PackFixture
let index: FileIndex

beforeAll(async () => {
  pack = await loadPack()
  index = fileIndexOf(pack.entities, pack.rowsByEntity)
})

/** A line's own words, the second way: its text cells, not a reference, a source cell or a key. */
const linesNaming = (word: string): Map<string, number> => {
  const out = new Map<string, number>()
  const w = word.toLowerCase()
  for (const t of pack.entities) {
    const refs = new Set(t.fields.filter((f) => f.type === 'reference').map((f) => f.id))
    let n = 0
    for (const row of pack.rowsByEntity[t.id] ?? []) {
      const hit = Object.entries(row.values).some(
        ([k, v]) =>
          typeof v === 'string' &&
          !k.startsWith('__') &&
          !k.endsWith('.src') &&
          !refs.has(k) &&
          v.toLowerCase().includes(w),
      )
      if (hit) n += 1
    }
    if (n > 0) out.set(t.id, n)
  }
  return out
}

describe('one find over the price file', () => {
  it('finds a maker that is on the price list, as a maker and as a list', () => {
    const r = findInFile(index, 'Highfield')
    expect(r.makers).toEqual(['boat_highfield'])
    expect(r.lists).toContain('boat_highfield')
    /* the lists of what fits which boat that name Highfield are lists too */
    expect(r.lists.filter((id) => id.startsWith('join_hf_')).length).toBeGreaterThan(0)
  })

  it('finds a code in the lines that carry it, counted by list', () => {
    const r = findInFile(index, 'F115')
    const second = linesNaming('F115')
    expect(r.totalLines).toBe([...second.values()].reduce((a, b) => a + b, 0))
    expect(r.totalLines).toBeGreaterThan(0)
    for (const l of r.lines) expect(l.lines).toBe(second.get(l.tableId))
    expect(r.lines.some((l) => l.tableId === 'mot_yamaha')).toBe(true)
    expect(r.lines.some((l) => l.role === 'join')).toBe(true)
    /* the most first */
    for (let i = 1; i < r.lines.length; i++)
      expect(r.lines[i - 1]!.lines).toBeGreaterThanOrEqual(r.lines[i]!.lines)
  })

  it('finds a list of what fits by its own name, every word', () => {
    const r = findInFile(index, 'yamaha motor fitment')
    expect(r.lists.length).toBe(
      pack.entities.filter((e) => /yamaha/i.test(e.name) && /motor fitment/i.test(e.name)).length,
    )
    expect(r.lists.length).toBeGreaterThan(0)
  })

  it('finds a section by its heading, with the lines under it', () => {
    const r = findInFile(index, 'HDS Live')
    expect(r.sections.length).toBeGreaterThan(0)
    for (const s of r.sections) {
      const t = pack.entities.find((e) => e.id === s.tableId)!
      const under = (pack.rowsByEntity[t.id] ?? []).filter(
        (row) => String(row.values[t.hierarchy![0]!] ?? '').trim() === s.heading,
      ).length
      expect(s.lines).toBe(under)
    }
  })

  it('never answers a price for a number: a figure is not a word', () => {
    const r = findInFile(index, '115')
    const second = linesNaming('115')
    expect(r.totalLines).toBe([...second.values()].reduce((a, b) => a + b, 0))
  })

  it('reads nothing for fewer than two letters, and says it was too short', () => {
    expect(findInFile(index, 'a')).toMatchObject({ tooShort: true, totalLines: 0, lists: [] })
    expect(findInFile(index, '   ')).toMatchObject({ tooShort: false, totalLines: 0 })
  })

  it('finds nothing at all for words nothing on the price list holds', () => {
    const r = findInFile(index, 'zzqqxx')
    expect(r).toMatchObject({ makers: [], lists: [], sections: [], lines: [], totalLines: 0 })
  })
})
