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
  it('opens the first band with nothing on it that has something to offer', () => {
    expect(chapterToOpen(fromThePicker(), draft)).toBe('motor')
  })

  it('moves on to Who it is for once every band is answered, and never back to the hull', () => {
    /* m2-last-critique.md major 3: this read 'hull' — the motor list
       folded and the hull's seven finishes opened under the hand */
    expect(chapterToOpen(everyBandAnswered(), draft)).toBe('handover')
    expect(chapterToOpen(everyBandAnswered(), draft)).not.toBe('hull')
  })

  it('moves on to the finale once the quote is addressed to somebody', () => {
    expect(chapterToOpen(everyBandAnswered(), { ...draft, named: true })).toBe('finale')
  })

  it('still opens an empty band before the name, whether or not the quote is named', () => {
    expect(chapterToOpen(fromThePicker(), { ...draft, named: true })).toBe('motor')
  })

  it('passes over a band that has nothing to offer', () => {
    const chapters = fromThePicker().map((c) => (c.id === 'motor' ? { ...c, offered: 0 } : c))
    expect(chapterToOpen(chapters, draft)).toBe('handover')
  })

  it('opens the hull on a boat the file holds no price for, before any band', () => {
    expect(chapterToOpen(fromThePicker(), { ...draft, hullUnpriced: true })).toBe('hull')
  })

  it('opens the finale on a quote already given, whatever else is empty on it', () => {
    const facts = { ...draft, issued: true, hullUnpriced: true }
    expect(chapterToOpen(fromThePicker(), facts)).toBe('finale')
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
    expect(chapterToOpen(fromThePicker(), { ...draft, at: 'nothing-like-this' })).toBe('motor')
    expect(chapterToOpen(everyBandAnswered(), { ...draft, at: 'admin' })).toBe('handover')
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
