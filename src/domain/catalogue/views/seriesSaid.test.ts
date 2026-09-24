/* ============================================================
   A series as a person says it — every series cell of the price file's
   boat registers, read off the real pack, and the three shapes on it.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { seriesSaid } from './seriesSaid'

let pack: PackFixture
beforeAll(async () => {
  pack = await loadPack()
})

/** Every distinct series cell of every boat register, as the file writes it. */
function seriesCells(): string[] {
  const out = new Set<string>()
  for (const table of pack.entities.filter((e) => e.kind === 'boat')) {
    const field = (table.hierarchy ?? []).length >= 2 ? table.hierarchy![0] : undefined
    if (field === undefined) continue
    for (const row of pack.rowsByEntity[table.id] ?? []) {
      const cell = row.values[field]
      if (typeof cell === 'string' && cell.trim() !== '') out.add(cell)
    }
  }
  return [...out]
}

const words = (text: string): string[] =>
  text
    .replace(/[()·]/g, ' ')
    .split(/\s+/)
    .filter((w) => w !== '')

describe('a series cell, said', () => {
  it('sets the date the file stamped a series with apart from its name', () => {
    expect(seriesSaid('Fisher Series (as at 18.03.2026)')).toEqual({
      name: 'Fisher Series',
      note: 'as at 18.03.2026',
    })
    expect(seriesSaid('Bow Rider Series  (As at 18.03.2026) ')).toEqual({
      name: 'Bow Rider Series',
      note: 'As at 18.03.2026',
    })
  })

  it('says a trim after the series with a dot, as a boat’s own trim is said', () => {
    expect(seriesSaid('OUTLAW (SIDE CONSOLES)')).toEqual({
      name: 'OUTLAW · SIDE CONSOLES',
      note: '',
    })
    expect(seriesSaid('OCEAN RANGER CENTRE CAB (HARD TOPS)').name).toBe(
      'OCEAN RANGER CENTRE CAB · HARD TOPS',
    )
  })

  it('leaves a plain series, and a blank one, exactly as the file writes it', () => {
    expect(seriesSaid('SKIMMAS')).toEqual({ name: 'SKIMMAS', note: '' })
    expect(seriesSaid('Roll-Up')).toEqual({ name: 'Roll-Up', note: '' })
    expect(seriesSaid('')).toEqual({ name: '', note: '' })
    /* a cell that is nothing but a stamp keeps it as its name */
    expect(seriesSaid('(as at 18.03.2026)')).toEqual({ name: '(as at 18.03.2026)', note: '' })
  })

  it('drops no word of any series on the file, and prints no bracket', () => {
    const cells = seriesCells()
    expect(cells.length).toBeGreaterThan(0)
    let stamped = 0
    for (const cell of cells) {
      const said = seriesSaid(cell)
      expect(words(`${said.name} ${said.note}`), cell).toEqual(words(cell))
      expect(said.name, cell).not.toMatch(/[()]/)
      expect(said.name, cell).not.toBe('')
      if (said.note !== '') stamped += 1
    }
    /* the Haines series are the stamped ones on this file; the count is
       the file's, not typed here */
    expect(stamped).toBe(cells.filter((c) => /\(\s*as at/i.test(c)).length)
    expect(stamped).toBeGreaterThan(0)
  })
})
