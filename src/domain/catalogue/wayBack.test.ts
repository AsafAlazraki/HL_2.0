import { describe, expect, it } from 'vitest'
import { wayBackSaid } from './wayBack'

describe('wayBackSaid — what an undo or a redo says', () => {
  it('says a taken-back sentence is no longer so, before the claim', () => {
    const said = wayBackSaid(
      'undone',
      'Trade is 95% of Cash on 91 Stacer boats.',
      '91 cell edits · Stacer',
    )
    expect(said).toBe('Undone. No longer so: Trade is 95% of Cash on 91 Stacer boats.')
    expect(said.startsWith('Undone — Trade')).toBe(false)
  })

  it('says a put-back sentence as true again', () => {
    expect(wayBackSaid('redone', 'Every “Hull” now sells at $1,200.', '3 cell edits · Boats')).toBe(
      'Put back: Every “Hull” now sells at $1,200.',
    )
  })

  it('keeps a label, which claims nothing, behind its prefix', () => {
    expect(wayBackSaid('undone', 'Cell edit · Boats', 'Cell edit · Boats')).toBe(
      'Undone — Cell edit · Boats',
    )
    expect(wayBackSaid('redone', 'Row added · Boats', 'Row added · Boats')).toBe(
      'Redone — Row added · Boats',
    )
  })
})
