import { describe, expect, test } from 'vitest'
import { closesStage, type StageKey } from './keys'

/**
 * The ladder, in node and with no DOM at all — which is the claim the module makes about
 * itself. A precedence order nobody can exercise is a precedence order that drifts, and the
 * old shell's version could only be exercised by dispatching a real keydown at a window.
 */
const key = (over: Partial<StageKey> = {}): StageKey => ({
  key: 'Escape',
  alt: false,
  ctrl: false,
  meta: false,
  shift: false,
  handled: false,
  inField: false,
  ...over,
})

describe('the Escape precedence ladder', () => {
  test('bare Escape on a surface closes it', () => {
    expect(closesStage(key())).toBe(true)
  })

  test('any other key is not ours', () => {
    expect(closesStage(key({ key: 'Enter' }))).toBe(false)
    expect(closesStage(key({ key: 'Backspace' }))).toBe(false)
  })

  test('rung 2 — a field owns its own Escape', () => {
    // A live cell editor's Escape means REVERT THIS EDIT; a search box's means clear the
    // search. Neither means throw the page away.
    expect(closesStage(key({ inField: true }))).toBe(false)
  })

  test('rung 3 — an event that arrives already handled is not ours', () => {
    expect(closesStage(key({ handled: true }))).toBe(false)
  })

  test('rung 4 — a modifier makes it somebody else’s shortcut', () => {
    expect(closesStage(key({ alt: true }))).toBe(false)
    expect(closesStage(key({ ctrl: true }))).toBe(false)
    expect(closesStage(key({ meta: true }))).toBe(false)
    expect(closesStage(key({ shift: true }))).toBe(false)
  })

  test('the rungs do not rescue each other: two reasons to decline still decline', () => {
    expect(closesStage(key({ inField: true, handled: true }))).toBe(false)
  })
})
