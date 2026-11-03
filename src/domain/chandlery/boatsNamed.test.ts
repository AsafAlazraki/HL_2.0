import { describe, expect, it } from 'vitest'
import { boatsNamed } from './boatsNamed'

const names: Record<string, string> = {
  a1: 'Stacer 309 Skimma',
  a2: 'Stacer 309 Skimma',
  b: 'Stacer 319 Skimma',
  c: 'Stacer 359 Skimma',
  d: 'Stacer 389 Skimma',
  e: 'Stacer 429 Assault',
  blank: '  ',
}
const nameOf = (id: string): string | undefined => names[id]

describe('the boats a part is made for, said as they are counted', () => {
  it('counts boats by their names, so two lines of one boat are one boat', () => {
    const said = boatsNamed(['a1', 'a2', 'b', 'c', 'd', 'e'], nameOf)
    expect(said.count).toBe(5)
    expect(said.shown).toEqual(['Stacer 309 Skimma', 'Stacer 319 Skimma', 'Stacer 359 Skimma'])
    expect(said.rest).toEqual(['Stacer 389 Skimma', 'Stacer 429 Assault'])
  })

  it('names exactly as many as it counts: the shown and the rest add to the count', () => {
    const said = boatsNamed(['a1', 'a2', 'b', 'c', 'd', 'e', 'nope', 'blank'], nameOf)
    expect(said.shown.length + said.rest.length).toBe(said.count)
    expect(new Set([...said.shown, ...said.rest]).size).toBe(said.count)
  })

  it('names a single one left rather than saying "and 1 more"', () => {
    const said = boatsNamed(['a1', 'b', 'c', 'd'], nameOf)
    expect(said).toEqual({
      count: 4,
      shown: ['Stacer 309 Skimma', 'Stacer 319 Skimma', 'Stacer 359 Skimma', 'Stacer 389 Skimma'],
      rest: [],
    })
  })

  it('leaves out a line with no name, and says none where there are none', () => {
    expect(boatsNamed(['blank', 'nope'], nameOf)).toEqual({ count: 0, shown: [], rest: [] })
    expect(boatsNamed([], nameOf)).toEqual({ count: 0, shown: [], rest: [] })
  })
})
