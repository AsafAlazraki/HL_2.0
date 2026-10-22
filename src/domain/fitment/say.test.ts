/* ============================================================
   EVERY VERDICT HAS ITS SENTENCE, IN THE DEALER'S WORDS.

   `offer.ts` keeps reasons as facts; `say.ts` is the one place they become
   words. These cases pin each kind, and pin that no sentence uses a word
   docs/WORDS.md keeps off a dealer's screen — the fitment screen prints
   them as they come.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { Verdict } from '@/domain/model'
import {
  BOAT_NOT_WEIGHED,
  NAMES_NO_MAKER,
  NOT_MADE_FOR_IT,
  ONE_TRAILER,
  TRAILER_NOT_RATED,
  floorSaid,
  rigSaid,
  sayVerdict,
} from './say'

const EVERY: Verdict[] = [
  { kind: 'outside-rule', failed: [] },
  { kind: 'outside-rule', failed: [{ field: 'Shaft Length', op: 'eq', value: '20"' }] },
  { kind: 'removed' },
  { kind: 'discontinued' },
  { kind: 'retired-table', tableId: 't' },
  { kind: 'retired-pairs', joinId: 'j' },
  { kind: 'blocked', constraintId: 'c', because: 'the transom is too short for it' },
  { kind: 'warned', constraintId: 'c', because: 'it is heavy for the transom' },
  { kind: 'built-for-another', bannerMarque: 'Stacer', subjectMarque: 'Highfield' },
  { kind: 'built-for-another', bannerMarque: 'Stacer', subjectMarque: null },
  { kind: 'under-floor', capacity: 650, load: 740, source: 'x' },
  { kind: 'floor-not-evaluable', why: 'measured' },
  { kind: 'outside-envelope', hp: 2.5, min: 40, max: 60 },
  { kind: 'outside-envelope', hp: 300, min: null, max: 250, count: 2 },
]

const ENGINE = /\b(paired|pairing|row|rows|hull|price file|the file|slot|column|record)\b/i

describe('sayVerdict', () => {
  it('says each kind of fact', () => {
    expect(EVERY.map(sayVerdict)).toEqual([
      'Not made for this boat.',
      'Its Shaft Length does not suit this boat.',
      'Taken off this boat by hand.',
      'No longer sold.',
      'From a list that is no longer sold.',
      'What fits this boat from this list is no longer sold.',
      'the transom is too short for it',
      'it is heavy for the transom',
      'Built for Stacer, not Highfield.',
      'Built for Stacer.',
      'Rated 650 kg, under the 740 kg this boat weighs.',
      'measured',
      'Under the 40–60 hp this boat takes.',
      'Over the 2 × up to 250 hp this boat takes.',
    ])
  })

  it('quotes a dealer’s rule as written, and says nothing where they wrote nothing', () => {
    expect(sayVerdict({ kind: 'blocked', constraintId: 'c', because: '' })).toBe('')
  })

  it('never uses a word a dealer does not say', () => {
    const said = [
      ...EVERY.filter((v) => v.kind !== 'floor-not-evaluable').map(sayVerdict),
      NOT_MADE_FOR_IT,
      NAMES_NO_MAKER,
      ONE_TRAILER,
      BOAT_NOT_WEIGHED,
      TRAILER_NOT_RATED,
    ]
    for (const s of said) expect(s, s).not.toMatch(ENGINE)
  })
})

describe('the ATM floor, as one line', () => {
  it('says the clearance, the shortfall, and which side has no figure', () => {
    expect(floorSaid({ kind: 'clears', capacity: 1990, load: 740 }, true)).toBe(
      'Rated 1,990 kg · the boat weighs 740 kg · clears it by 1,250 kg',
    )
    expect(floorSaid({ kind: 'under', capacity: 650, load: 740 }, true)).toBe(
      'Rated 650 kg · the boat weighs 740 kg · 90 kg short',
    )
    expect(floorSaid({ kind: 'not-evaluable', why: '' }, false)).toBe(BOAT_NOT_WEIGHED)
    expect(floorSaid({ kind: 'not-evaluable', why: '' }, true)).toBe(TRAILER_NOT_RATED)
  })

  it('says a rig as the trade does', () => {
    expect(rigSaid({ count: 1, each: 2.5 })).toBe('2.5 hp')
    expect(rigSaid({ count: 2, each: 225 })).toBe('2 × 225 hp')
  })
})
