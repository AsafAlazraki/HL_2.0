/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { RESPONSE, effect, move, settlesIn, springEasing } from './motion'

/* ============================================================
   ONE LADDER, NOT TWO. src/ui/motion.ts hands `motion` the same
   names and the same durations src/styles/tokens.css declares under
   "THE MOTION VOCABULARY", and the springs settle in exactly the
   durations the stylesheet samples `--ease-spring` over. This reads
   the stylesheet off the disk and fails the day the two drift.
   ============================================================ */

const tokens = readFileSync(fileURLToPath(new URL('../styles/tokens.css', import.meta.url)), 'utf8')

function token(name: string): number {
  const m = new RegExp(String.raw`--duration-${name}:\s*(\d+)ms`).exec(tokens)
  if (!m) throw new Error(`tokens.css declares no --duration-${name}`)
  return Number(m[1])
}

describe('the motion vocabulary and the tokens', () => {
  test('every tween is the duration the stylesheet names', () => {
    for (const name of ['press', 'hover', 'enter', 'exit', 'route'] as const)
      expect(Math.round(move[name].duration * 1000)).toBe(token(name))
  })

  test('every spring settles in the duration the stylesheet samples it over', () => {
    expect(settlesIn(RESPONSE.settle)).toBe(token('settle'))
    expect(settlesIn(RESPONSE.travel)).toBe(token('travel'))
    expect(settlesIn(RESPONSE.morph)).toBe(token('morph'))
  })

  test('the sampled curve is the critically damped spring, to three places', () => {
    const m = /--ease-spring:\s*linear\(([^)]*)\)/.exec(tokens)
    expect(m).not.toBeNull()
    const points = m![1]!.split(',').map((s) => Number(s.trim()))
    const omega = (2 * Math.PI) / RESPONSE.travel
    const end = settlesIn(RESPONSE.travel) / 1000
    points.forEach((y, i) => {
      if (i === points.length - 1) return expect(y).toBe(1)
      const t = (end * i) / (points.length - 1)
      return expect(y).toBeCloseTo(1 - (1 + omega * t) * Math.exp(-omega * t), 2)
    })
  })

  /* NumberFlow, under the kit's Figure, moves its digits with `element.animate()` and takes
     its timing in that form: the same names, and the stylesheet's own curve, point for point */
  test('the Web Animations form is the same ladder and the same curve', () => {
    const m = /--ease-spring:\s*(linear\([^)]*\))/.exec(tokens)
    expect(m).not.toBeNull()
    expect(springEasing()).toBe(m![1]!.replace(/\s+/g, ' ').replace('( ', '(').replace(' )', ')'))
    for (const name of ['press', 'hover', 'enter', 'exit', 'route'] as const) {
      expect(effect(name)).toEqual({ duration: token(name), easing: 'cubic-bezier(0.2, 0, 0, 1)' })
    }
    for (const name of ['settle', 'travel', 'morph'] as const) {
      expect(effect(name)).toEqual({ duration: token(name), easing: springEasing() })
    }
  })
})
