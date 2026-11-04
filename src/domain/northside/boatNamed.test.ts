import { describe, expect, it } from 'vitest'
import { boatNamed } from './boatNamed'

/* A boat named the way a person says it, from the maker and the model its photograph is filed
   under (Home's ledger): the maker said once, never twice. */
describe('a boat named the way a person says it', () => {
  it('gives a maker of two words its last word once where the model opens with it', () => {
    expect(boatNamed('Haines Signature', 'Signature Fisher 525F')).toBe(
      'Haines Signature Fisher 525F',
    )
    expect(boatNamed('Haines Signature', 'signature Fisher 525F')).toBe(
      'Haines signature Fisher 525F',
    )
  })

  it('puts the maker before a model that does not name it', () => {
    expect(boatNamed('Highfield', 'Sport 560')).toBe('Highfield Sport 560')
    expect(boatNamed('Haines Signature', 'Offshore 600')).toBe('Haines Signature Offshore 600')
  })

  it('never puts the maker before a model that already begins with it', () => {
    expect(boatNamed('Stacer', 'Stacer 529 Assault Pro')).toBe('Stacer 529 Assault Pro')
    expect(boatNamed('Stacer', 'STACER 529 Assault Pro')).toBe('STACER 529 Assault Pro')
    expect(boatNamed('Stacer', 'Stacer')).toBe('Stacer')
  })

  it('does not take a model whose first word only starts like the maker for the maker', () => {
    expect(boatNamed('Stacer', 'Stacers 529')).toBe('Stacer Stacers 529')
  })

  it('says what there is where the maker or the model is missing, trimmed', () => {
    expect(boatNamed('', 'Sport 560')).toBe('Sport 560')
    expect(boatNamed('Highfield', '')).toBe('Highfield')
    expect(boatNamed('  Highfield ', ' Sport 560  ')).toBe('Highfield Sport 560')
    expect(boatNamed('', '')).toBe('')
  })
})
