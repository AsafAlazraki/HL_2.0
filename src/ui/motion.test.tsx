import { afterEach, describe, expect, test, vi } from 'vitest'
import { critically, holdsCaret, move, reducedMotion, transition } from './motion'

/**
 * `.test.tsx` rather than `.test.ts` because `reducedMotion()` asks a window and `holdsCaret`
 * asks the DOM. That the vocabulary is one ladder with tokens.css, and that the springs are
 * the springs the stylesheet samples, is proved beside it in `motion.tokens.test.ts`, which
 * reads the stylesheet off the disk.
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

describe('the motion vocabulary', () => {
  test('is named for what moves', () => {
    expect(Object.keys(move)).toEqual([
      'press',
      'hover',
      'enter',
      'exit',
      'settle',
      'travel',
      'morph',
      'route',
    ])
  })

  test('an exit is faster than an entry', () => {
    expect(move.exit.duration).toBeLessThan(move.enter.duration)
  })

  test('every spring is critically damped: nothing here was flicked, so nothing bounces', () => {
    for (const name of ['settle', 'travel', 'morph'] as const) {
      const s = move[name]
      expect(s.damping ** 2).toBeCloseTo(4 * s.stiffness * s.mass, 6)
    }
    expect(critically(0.3).stiffness).toBeCloseTo((2 * Math.PI) ** 2 / 0.09, 6)
  })
})

describe('reduced motion', () => {
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

  test('removes movement and keeps the fade: colour and opacity survive', () => {
    expect(transition('travel', true)).toEqual({
      default: { duration: 0 },
      opacity: { duration: 0.15, ease: [0.2, 0, 0, 1] },
    })
    expect(transition('travel', false)).toBe(move.travel)
  })
})

describe('a caret in a field', () => {
  test('is a text field, a text area or an editable block that can be typed in', () => {
    const text = document.createElement('input')
    const search = Object.assign(document.createElement('input'), { type: 'search' })
    const area = document.createElement('textarea')
    const block = document.createElement('div')
    block.contentEditable = 'true'
    document.body.append(block)
    expect(holdsCaret(text)).toBe(true)
    expect(holdsCaret(search)).toBe(true)
    expect(holdsCaret(area)).toBe(true)
    expect(holdsCaret(block)).toBe(true)
    block.remove()
  })

  test('is not a focused checkbox, a button, or a field that cannot be typed in', () => {
    const box = Object.assign(document.createElement('input'), { type: 'checkbox' })
    const kept = Object.assign(document.createElement('input'), { readOnly: true })
    expect(holdsCaret(box)).toBe(false)
    expect(holdsCaret(kept)).toBe(false)
    expect(holdsCaret(document.createElement('button'))).toBe(false)
    expect(holdsCaret(null)).toBe(false)
  })
})
