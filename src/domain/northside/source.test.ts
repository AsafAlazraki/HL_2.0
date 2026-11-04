import { describe, expect, it } from 'vitest'
import { readBrand } from './colour'
import { sourceColourOf } from './source'

/** RGBA bytes: `n` pixels of each colour given. */
const pixels = (...runs: Array<[number, number, number, number]>): Uint8ClampedArray => {
  const out: number[] = []
  for (const [r, g, b, n] of runs) for (let i = 0; i < n; i += 1) out.push(r, g, b, 255)
  return new Uint8ClampedArray(out)
}

describe('a colour taken from a photograph’s own pixels', () => {
  it('takes the colour its pixels carry, not its grey sky or white hull', () => {
    const read = sourceColourOf(
      pixels([200, 200, 205, 600], [250, 250, 250, 300], [0, 110, 90, 100]),
    )
    expect(read).not.toBeNull()
    const own = read!.own
    /* a teal: more green than red */
    const r = Number.parseInt(own.slice(1, 3), 16)
    const g = Number.parseInt(own.slice(3, 5), 16)
    expect(g).toBeGreaterThan(r)
    expect(readBrand(read!.offered).refused).toBeNull()
  })

  it('offers the nearest that reads where white words on its own colour do not', () => {
    const read = sourceColourOf(pixels([255, 214, 40, 400]))
    expect(read?.moved).toBe(true)
    expect(readBrand(read!.own).refused).not.toBeNull()
    expect(readBrand(read!.offered).refused).toBeNull()
  })

  it('has none to give where the photograph is grey through', () => {
    expect(sourceColourOf(pixels([120, 120, 120, 500], [30, 30, 30, 500]))).toBeNull()
  })
})
