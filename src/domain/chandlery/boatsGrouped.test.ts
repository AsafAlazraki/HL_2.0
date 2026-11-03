import { describe, expect, it } from 'vitest'
import { boatsByMaker } from './boatsGrouped'

const makers: Record<string, string> = {
  'Stacer 309': 'Stacer',
  'Stacer 529 Assault Pro': 'Stacer',
  'Sport 560': 'Highfield',
  'Haines Signature 575F': 'Haines Signature',
}

describe('every boat a part is made for, by its maker', () => {
  it('says each maker once over its models, in the order the names come', () => {
    const groups = boatsByMaker(Object.keys(makers), (n) => makers[n] ?? '')
    expect(groups.map((g) => [g.maker, g.models.map((m) => m.model)])).toEqual([
      ['Stacer', ['309', '529 Assault Pro']],
      /* the name does not begin with its maker's word, so it is kept whole */
      ['Highfield', ['Sport 560']],
      ['Haines Signature', ['575F']],
    ])
  })

  it('drops and adds no name, and marks the customer’s boat', () => {
    const names = Object.keys(makers)
    const groups = boatsByMaker(names, (n) => makers[n] ?? '', 'Stacer 529 Assault Pro')
    const all = groups.flatMap((g) => g.models)
    expect(all.map((m) => m.name)).toEqual(names)
    expect(all.filter((m) => m.chosen).map((m) => m.name)).toEqual(['Stacer 529 Assault Pro'])
  })

  it('keeps a name with no maker whole, under no maker', () => {
    expect(boatsByMaker(['Coaster'], () => '')).toEqual([
      { maker: '', models: [{ name: 'Coaster', model: 'Coaster', chosen: false }] },
    ])
  })
})
