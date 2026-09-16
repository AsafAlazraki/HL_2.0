/**
 * The judge is pure, so it is proved on pixels typed here: a white
 * ring is a studio shot whatever sits inside it, a grey ring is a
 * studio shot, and a ring with sky and water in it is a scene.
 */
import { describe, expect, it } from 'vitest'
import { SIDE, judge } from './verdict'

/** a 32x32 RGBA picture whose ring is `ring` and whose middle is `mid` */
function picture(ring: [number, number, number, number], mid: [number, number, number, number]) {
  const d = new Uint8Array(SIDE * SIDE * 4)
  for (let y = 0; y < SIDE; y += 1) {
    for (let x = 0; x < SIDE; x += 1) {
      const inner = x > 1 && x < SIDE - 2 && y > 1 && y < SIDE - 2
      const px = inner ? mid : ring
      d.set(px, (y * SIDE + x) * 4)
    }
  }
  return d
}

describe('judge', () => {
  it('calls a white ring a studio shot, whatever the subject is', () => {
    expect(judge(picture([255, 255, 255, 255], [20, 80, 200, 255]), SIDE, SIDE)).toBe('studio')
  })

  it('calls a grey ring a studio shot — a render cropped to its subject', () => {
    expect(judge(picture([120, 120, 122, 255], [20, 80, 200, 255]), SIDE, SIDE)).toBe('studio')
  })

  it('calls a coloured ring a scene — sky and water', () => {
    expect(judge(picture([90, 150, 220, 255], [200, 200, 200, 255]), SIDE, SIDE)).toBe('scene')
  })

  it('reads a transparent ring as black, the way a canvas does', () => {
    /* the colour under a zero alpha is ignored: this ring is loud red
       under alpha 0 and must not count as colour */
    expect(judge(picture([255, 0, 0, 0], [20, 80, 200, 255]), SIDE, SIDE)).toBe('studio')
  })
})
