/* ============================================================
   THE CHAPTER A BUILD OPENS ON WHEN THE ADDRESS NAMES NONE.

   The shapes below are the build's own six chapters, by the ids the
   engine gives them (`bands.ts`: hull, motor, trailer, fit; the screen's
   handover and finale), with the counts varied case by case. They are
   the reading's inputs and carry no figure: the walk on the real file,
   the ADV7 in B-G-B with the F250XCB pressed, is proved on the screen in
   `src/screens/configurator/onward.test.tsx` and in a browser in
   `e2e/flows/configurator.spec.ts`.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { chapterToOpen, type ChapterPlace, type OpeningFacts } from './opening'

const band = (id: string, lines: number, offered: number): ChapterPlace => ({
  id,
  kind: 'band',
  lines,
  offered,
})
const HANDOVER: ChapterPlace = { id: 'handover', kind: 'handover', lines: 0, offered: 0 }
const FINALE: ChapterPlace = { id: 'finale', kind: 'finale', lines: 0, offered: 0 }

/** The ADV7 as the picker leaves it: the hull, a trailer and the rigging kit on, no motor. */
const fromThePicker = (): ChapterPlace[] => [
  band('hull', 1, 7),
  band('motor', 0, 3),
  band('trailer', 1, 4),
  band('fit', 1, 12),
  HANDOVER,
  FINALE,
]

/** The same build once a motor is on it: no band is empty. */
const everyBandAnswered = (): ChapterPlace[] =>
  fromThePicker().map((c) => (c.id === 'motor' ? { ...c, lines: 1 } : c))

const draft: OpeningFacts = { at: '', issued: false, hullUnpriced: false, named: false }

describe('the chapter a build opens on with no position in the address', () => {
  it('opens the hull on every draft that has one, whatever else is empty (the owner, 2026-10-30)', () => {
    expect(chapterToOpen(fromThePicker(), draft)).toBe('hull')
    expect(chapterToOpen(everyBandAnswered(), draft)).toBe('hull')
    expect(chapterToOpen(everyBandAnswered(), { ...draft, named: true })).toBe('hull')
    expect(chapterToOpen(fromThePicker(), { ...draft, hullUnpriced: true })).toBe('hull')
  })

  it('opens the finale on a quote already given, whatever else is empty on it', () => {
    const facts = { ...draft, issued: true, hullUnpriced: true }
    expect(chapterToOpen(fromThePicker(), facts)).toBe('finale')
  })
})

/** A motor sold on its own (a repower): no hull chapter at all. */
const noHull = (): ChapterPlace[] => fromThePicker().filter((c) => c.id !== 'hull')
const noHullAnswered = (): ChapterPlace[] => everyBandAnswered().filter((c) => c.id !== 'hull')

describe('a build with no hull', () => {
  it('opens the first band with nothing on it that has something to offer', () => {
    expect(chapterToOpen(noHull(), draft)).toBe('motor')
    expect(chapterToOpen(noHull(), { ...draft, named: true })).toBe('motor')
  })

  it('moves on to Who it is for once every band is answered', () => {
    expect(chapterToOpen(noHullAnswered(), draft)).toBe('handover')
  })

  it('moves on to the finale once the quote is addressed to somebody', () => {
    expect(chapterToOpen(noHullAnswered(), { ...draft, named: true })).toBe('finale')
  })

  it('passes over a band that has nothing to offer', () => {
    const chapters = noHull().map((c) => (c.id === 'motor' ? { ...c, offered: 0 } : c))
    expect(chapterToOpen(chapters, draft)).toBe('handover')
  })
})

describe('a position the address names', () => {
  it('is kept whatever is on the document — the dealer put it there', () => {
    for (const at of ['hull', 'motor', 'fit', 'handover', 'finale']) {
      expect(chapterToOpen(everyBandAnswered(), { ...draft, at })).toBe(at)
      expect(chapterToOpen(fromThePicker(), { ...draft, at, issued: true })).toBe(at)
    }
  })

  it('that matches nothing on this build is read as no position at all', () => {
    expect(chapterToOpen(fromThePicker(), { ...draft, at: 'nothing-like-this' })).toBe('hull')
    expect(chapterToOpen(noHullAnswered(), { ...draft, at: 'admin' })).toBe('handover')
  })
})

describe('a build with fewer chapters', () => {
  it('opens chapter one when it has neither closing chapter', () => {
    expect(chapterToOpen([band('hull', 1, 7), band('motor', 1, 3)], draft)).toBe('hull')
  })

  it('says nothing when there is no chapter at all', () => {
    expect(chapterToOpen([], draft)).toBe('')
    expect(chapterToOpen([], { ...draft, at: 'motor' })).toBe('')
  })
})

describe('a build for a motor, a trailer or a part sold on its own', () => {
  /* as the rail reads a repower: the motor first, what goes with it, then a boat, a choice */
  const repower = (): ChapterPlace[] => [
    { ...band('motor', 1, 0), subject: true },
    band('fit', 0, 1),
    { ...band('hull', 0, 44), optional: 'A boat goes on it only if you choose one here.' },
    { id: 'finale', kind: 'finale', lines: 1, offered: 0 },
  ]

  it('opens on the thing sold, never on the boats that take it', () => {
    expect(chapterToOpen(repower(), draft)).toBe('motor')
  })

  it('passes over a chapter nothing waits for when it reads what is still to do', () => {
    const rest = repower().map((c) => ({ ...c, subject: false }))
    expect(chapterToOpen(rest, draft)).toBe('fit')
    const fitted = rest.map((c) => (c.id === 'fit' ? { ...c, lines: 1 } : c))
    expect(chapterToOpen(fitted, draft)).toBe('finale')
  })
})
