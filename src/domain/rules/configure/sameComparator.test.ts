/* ============================================================
   THE PREVIEW AND THE RUN ORDER VALUES THE SAME WAY, because there
   is only one ordering left.

   `values.ts` used to carry a second copy of the rule engine's
   comparison with a comment saying it "deliberately mirrors" the
   first. Two copies of an ordering is two answers to the same
   question, and the copies had already drifted: the engine learned to
   read a measurement ("10 HP" is ten horsepower, not the word "10
   HP") and the solver's copy did not, so the configurator's preview
   pruned values the run would have kept — silently, on the exact
   column the defect was measured on.

   The plan names the repair: ONE measurement-aware comparator for the
   solver and the rule engine. This file is the seam test for it. It
   pins the two cases that were wrong on the real file, the
   translation between the two answers ('mismatch' on one side,
   `undefined` on the other), and the two image cases the solver's own
   layer still carries.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { compareValues } from '@/domain/compare'
import type { CellValue, CompareOp, ImageRef } from '@/domain/model'
import { compare } from './values'

const pic = (id: string): ImageRef[] => [{ id, src: `https://example.test/${id}.webp` }]

describe('the solver reads a measurement, because it asks the shared comparator', () => {
  it('orders horsepower as horsepower and not as an alphabet', () => {
    /* the two that were wrong on the real price file */
    expect(compare('lte', '8', '10 HP')).toBe(true)
    expect(compare('lte', '115', '20 HP')).toBe(false)
    expect(compare('gt', '300 HP', '250')).toBe(true)
    expect(compare('gte', '1,188 kg', 1000)).toBe(true)
  })

  it('CANNOT TELL rather than guessing, which is what makes a rule fail open', () => {
    /* two different units do not order */
    expect(compare('gt', '500 mm', '20 in')).toBeUndefined()
    /* a twin rig is not one number, so nothing is invented for it */
    expect(compare('lte', '2 x 300 HP', '250 HP')).toBeUndefined()
    /* a number against prose */
    expect(compare('gt', 60, 'Blue')).toBeUndefined()
  })

  it('still answers equality where ordering cannot be answered', () => {
    expect(compare('eq', '10 HP', '10 HP')).toBe(true)
    expect(compare('neq', '10 HP', 'Blue')).toBe(true)
  })
})

describe('one ordering, two spellings of the same answer', () => {
  const pairs: [CompareOp, CellValue, CellValue][] = [
    ['gt', 300, 250],
    ['lte', '8', '10 HP'],
    ['eq', 'Blue', 'blue'],
    ['lt', '2026-01-01', '2026-06-30'],
    ['gte', true, true],
    ['gt', '500 mm', '20 in'],
    ['lte', 'Yamaha', 'Suzuki'],
    ['neq', 4, 'four'],
  ]

  it('is `undefined` on the solver wherever the engine reports a mismatch, and the same boolean everywhere else', () => {
    for (const [op, left, right] of pairs) {
      const engine = compareValues(op, left, right)
      const expected = engine.mismatch === undefined ? engine.result : undefined
      expect(compare(op, left, right)).toBe(expected)
    }
  })
})

describe('the two image cases the solver keeps for itself', () => {
  it('reads an empty image list as blank', () => {
    expect(compare('eq', [], '')).toBe(true)
    expect(compare('eq', [], 'Blue')).toBe(false)
  })

  it('orders a picture against nothing', () => {
    expect(compare('gt', pic('a'), 'Blue')).toBeUndefined()
    expect(compare('lte', pic('a'), pic('b'))).toBeUndefined()
  })

  it('reads a picture as its own text for the text operators', () => {
    /* `imageCellText` is the solver's coercion and stays here: nothing
       on the engine's side of the house holds pictures in a clause */
    expect(compare('contains', pic('hull'), '1 image')).toBe(true)
  })
})
