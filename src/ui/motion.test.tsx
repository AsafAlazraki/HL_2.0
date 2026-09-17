import { afterEach, describe, expect, test, vi } from 'vitest'
import { reducedMotion, spring, transition } from './motion'

/**
 * `.test.tsx` rather than `.test.ts` because `reducedMotion()` asks a window; the file is
 * here to prove it answers honestly when the window says yes, when it says no, and when
 * there is no window at all.
 */
function saysReduced(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion: reduce') ? matches : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('motion', () => {
  test('every spring is named for what moves and stays under the durations it claims', () => {
    expect(Object.keys(spring)).toEqual(['press', 'pop', 'open', 'layout', 'drawer'])
    expect(spring.press.duration).toBeLessThan(spring.pop.duration)
    expect(spring.pop.duration).toBeLessThan(spring.open.duration)
    // UI motion stays under 300ms; layout and drawer are watched, not waited for.
    expect(spring.open.duration).toBeLessThanOrEqual(0.3)
  })

  test('reads the preference from the window', () => {
    saysReduced(true)
    expect(reducedMotion()).toBe(true)
    saysReduced(false)
    expect(reducedMotion()).toBe(false)
  })

  test('with no window at all it does not guess', () => {
    vi.stubGlobal('window', undefined)
    expect(reducedMotion()).toBe(false)
  })

  test('reduced motion removes movement and keeps the fade: colour and opacity survive', () => {
    const reduced = transition('open', true)
    expect(reduced).toEqual({
      default: { duration: 0 },
      opacity: { duration: 0.15, ease: 'easeOut' },
    })
    expect(transition('open', false)).toBe(spring.open)
  })
})
