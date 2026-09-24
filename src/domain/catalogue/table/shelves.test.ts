import { describe, expect, it } from 'vitest'
import { rowLabel } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { shapeOf, sharedLead, shelvesOf, shortName, tallyOf, type ShelfItem } from './shelves'

/* ============================================================
   THE PICTURES DOOR'S SHELVES.

   The small cases are strings written to exercise one rule each. The
   pack cases read every table on the file that carries a picture
   column and assert the one property the door depends on, measured
   rather than typed: whatever lead a shelf drops, every name on it
   keeps something of its own, and no two names on a shelf become one.
   ============================================================ */

const card = (
  name: string,
  under = '',
  picture: unknown = null,
  linkedOnly = false,
): ShelfItem => ({
  name,
  under,
  picture,
  linkedOnly,
})

describe('sharedLead', () => {
  it('cuts at a spaced dash every name carries', () => {
    expect(sharedLead(['Acme - 309 Skiff', 'Acme - 319 Skiff (HS)'])).toBe('Acme - ')
  })

  it('takes the longest such lead', () => {
    expect(
      sharedLead(['ACME K Series Trailer - K4250-13', 'ACME K Series Trailer - K4500-13']),
    ).toBe('ACME K Series Trailer - ')
  })

  it('cuts at an en dash too', () => {
    expect(sharedLead(['Acme – A1', 'Acme – B2'])).toBe('Acme – ')
  })

  it('never cuts inside a word, or where there is no dash', () => {
    expect(sharedLead(['RU230KAM', 'RU250KAM'])).toBe('')
    expect(sharedLead(['Acme-1', 'Acme-2'])).toBe('')
  })

  it('never cuts where one name would be left with nothing', () => {
    expect(sharedLead(['Acme - ', 'Acme - B2'])).toBe('')
  })

  it('says nothing for one name, or where the leads differ', () => {
    expect(sharedLead(['Acme - A1'])).toBe('')
    expect(sharedLead(['Acme - A1', 'Other - B2'])).toBe('')
  })
})

describe('shortName', () => {
  it('drops the lead and keeps the rest', () => {
    expect(shortName('Acme - 309 Skiff', 'Acme - ')).toBe('309 Skiff')
  })

  it('keeps the whole name where the lead is not its own', () => {
    expect(shortName('Other - 1', 'Acme - ')).toBe('Other - 1')
    expect(shortName('RU230KAM', '')).toBe('RU230KAM')
  })
})

describe('shapeOf', () => {
  it('draws one lone picture as a feature, and one or two beside names as a spread', () => {
    expect(shapeOf(1, 0)).toBe('feature')
    expect(shapeOf(1, 7)).toBe('spread')
    expect(shapeOf(2, 3)).toBe('spread')
  })

  it('draws three pictures or more as a wall, two alone as a wall, and none as names', () => {
    expect(shapeOf(3, 0)).toBe('wall')
    expect(shapeOf(10, 6)).toBe('wall')
    expect(shapeOf(2, 0)).toBe('wall')
    expect(shapeOf(0, 5)).toBe('names')
  })
})

describe('shelvesOf', () => {
  it('keeps the file’s order, a heading that recurs starting a shelf of its own', () => {
    const shelves = shelvesOf([card('a', 'X'), card('b', 'X'), card('c', 'Y'), card('d', 'X')])
    expect(shelves.map((s) => s.under)).toEqual(['X', 'Y', 'X'])
  })

  it('stands the pictures apart from the names, each in the file’s order', () => {
    const [shelf] = shelvesOf([
      card('a', 'X', null, true),
      card('b', 'X', { at: 'b.webp' }),
      card('c', 'X', null),
      card('d', 'X', { at: 'd.webp' }),
    ])
    expect(shelf!.pictured.map((c) => c.name)).toEqual(['b', 'd'])
    expect(shelf!.bare.map((c) => c.name)).toEqual(['a', 'c'])
    expect(shelf!.shape).toBe('spread')
  })

  it('gives a shelf of one card the lead the whole door shares', () => {
    const shelves = shelvesOf([
      card('Acme - A1', 'X'),
      card('Acme - A2', 'X'),
      card('Acme - B1', 'Y'),
    ])
    expect(shelves.map((s) => s.lead)).toEqual(['Acme - ', 'Acme - '])
  })

  it('counts the door once', () => {
    const shelves = shelvesOf([
      card('a', 'X', { at: 'a.webp' }),
      card('b', 'X', null, true),
      card('c', 'Y', null, false),
      card('d', 'Y', null, true),
    ])
    expect(tallyOf(shelves)).toEqual({
      cards: 4,
      pictured: 1,
      bare: 3,
      linked: 2,
      shelvesWithBare: 2,
    })
  })
})

describe('on the pack', () => {
  it('leaves every name on every shelf something of its own, and no two alike', async () => {
    const pack = await loadPack()
    let tables = 0
    let dropped = 0
    for (const table of pack.entities) {
      const image = table.fields.find((f) => f.type === 'image')
      if (!image) continue
      tables += 1
      const series = table.hierarchy?.[0]
      const cards = (pack.rowsByEntity[table.id] ?? []).map((r) =>
        card(rowLabel(table, r), series ? String(r.values[series] ?? '') : ''),
      )
      for (const shelf of shelvesOf(cards)) {
        const all = [...shelf.pictured, ...shelf.bare]
        const shorts = all.map((c) => shortName(c.name, shelf.lead))
        for (const [i, s] of shorts.entries()) {
          if (all[i]!.name.trim() !== '')
            expect(s.trim(), `${table.name} · ${all[i]!.name}`).not.toBe('')
          if (shelf.lead !== '') expect(all[i]!.name.startsWith(shelf.lead)).toBe(true)
        }
        /* a name the file repeats is still repeated, and one the file
           tells apart is still told apart */
        expect(new Set(shorts).size, table.name).toBe(new Set(all.map((c) => c.name)).size)
        if (shelf.lead !== '') dropped += all.length
      }
    }
    /* the walk read something, and the lead was dropped somewhere */
    expect(tables).toBeGreaterThan(0)
    expect(dropped).toBeGreaterThan(0)
  })
})
