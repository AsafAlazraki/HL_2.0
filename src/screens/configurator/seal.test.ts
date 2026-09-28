import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { RESPONSE, settlesIn } from '@/ui'
import { LAST_FRAME, RIM_D, SEAL_BOX, TICK_D, stampData } from './seal'

/* ============================================================
   THE STAMP ENDS ON THE STILL SEAL, AND IS THE KIT'S OWN MOTION.

   `seal.ts` is the source of the one authored moment on the build:
   the Lottie a quote is stamped with when it is given, and the plain
   SVG every other given quote wears. These read the timeline the way
   lottie-web will and hold it to what the header promises.
   ============================================================ */

interface Key {
  t: number
  s: number[]
}
interface Prop {
  a: 0 | 1
  k: unknown
}
interface Item {
  ty: string
  [key: string]: unknown
}
interface Layer {
  nm: string
  cl: string
  ks: Record<string, Prop>
  shapes: { it: Item[] }[]
}

const data = stampData() as unknown as { layers: Layer[]; fr: number; op: number; w: number }
const layer = (name: string): Layer => data.layers.find((l) => l.nm === name)!
const items = (name: string): Item[] => layer(name).shapes[0]!.it

/** A property's value at a frame, as lottie-web holds it once the last key is passed. */
function at(prop: Prop, frame: number): number[] {
  if (prop.a === 0) return ([] as number[]).concat(prop.k as number | number[])
  const keys = prop.k as Key[]
  const passed = keys.filter((k) => k.t <= frame)
  return (passed.at(-1) ?? keys[0]!).s
}

/** every number in an SVG path, in order */
const numbers = (d: string): number[] => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

describe('the stamp', () => {
  it('ends on exactly the still seal: the rim at rest, the tick drawn, the rays and ripple gone', () => {
    const last = LAST_FRAME - 1
    const rim = layer('rim').ks
    expect(at(rim.s!, last)).toEqual([100, 100, 100])
    expect(at(rim.r!, last)).toEqual([0])
    expect(at(rim.o!, last)).toEqual([100])

    const tick = items('tick').find((i) => i.ty === 'tm')!
    expect(at(tick.e as Prop, last)).toEqual([100])
    expect(at(tick.s as Prop, last)).toEqual([0])

    const rays = items('rays').find((i) => i.ty === 'tm')!
    expect(at(rays.s as Prop, last)).toEqual([100])
    expect(at(rays.e as Prop, last)).toEqual([100])

    expect(at(layer('ripple').ks.o!, last)).toEqual([0])
  })

  it('draws the same rim and tick as the still seal, point for point', () => {
    const mid = SEAL_BOX / 2

    const rim = (items('rim').find((i) => i.ty === 'sh')!.ks as Prop).k as { v: number[][] }
    const drawn = numbers(RIM_D)
    /* M then, per vertex, a C whose third point is the next vertex */
    const vertices: number[][] = [[drawn[0]!, drawn[1]!]]
    for (let n = 2; n + 6 <= drawn.length; n += 6) vertices.push([drawn[n + 4]!, drawn[n + 5]!])
    expect(vertices.length).toBe(rim.v.length + 1)
    rim.v.forEach(([x, y], n) => {
      expect(vertices[n]![0]).toBeCloseTo(x! + mid, 2)
      expect(vertices[n]![1]).toBeCloseTo(y! + mid, 2)
    })

    const tick = (items('tick').find((i) => i.ty === 'sh')!.ks as Prop).k as { v: number[][] }
    expect(numbers(TICK_D)).toEqual(tick.v.flatMap(([x, y]) => [x! + mid, y! + mid]))
  })

  it('lands the rim on the settle spring, a frame at a time, and never past its rest', () => {
    const keys = (layer('rim').ks.s!.k as Key[]).map((k) => k.s[0]!)
    expect(keys[0]).toBe(135)
    expect(keys.at(-1)).toBe(100)
    /* critically damped: it comes down to rest and never bounces through it */
    for (let n = 1; n < keys.length; n++) {
      expect(keys[n]!).toBeLessThanOrEqual(keys[n - 1]!)
      expect(keys[n]!).toBeGreaterThanOrEqual(100)
    }
    /* one key a frame for as long as the kit's own spring takes to settle */
    expect(keys.length - 1).toBe(Math.ceil((settlesIn(RESPONSE.settle) / 1000) * data.fr))
  })

  it('carries no colour of its own: every ink is painted by the stylesheet, by its layer', () => {
    const inks = JSON.stringify(data).match(/"c":\{"a":0,"k":\[[^\]]*\]\}/g) ?? []
    expect(inks.length).toBeGreaterThan(0)
    for (const ink of inks) expect(ink).toBe('"c":{"a":0,"k":[0,0,0,1]}')

    const css = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), 'configurator.css'),
      'utf8',
    )
    for (const l of data.layers) expect(css).toContain(`.${l.cl}`)
  })
})
