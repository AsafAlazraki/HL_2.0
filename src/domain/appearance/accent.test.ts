/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { ACCENT_PREVIEWS, RESERVED_INKS, accentRefusal, cssOf, hueGap, whiteOn } from './accent'

const tokens = readFileSync(
  fileURLToPath(new URL('../../styles/tokens.css', import.meta.url)),
  'utf8',
)

/** A token's OKLCH value as tokens.css writes it: `--name: oklch(50% 0.16 22);` */
function oklchOf(name: string): { l: number; c: number; h: number } {
  const m = new RegExp(String.raw`${name}:\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)`).exec(tokens)
  if (!m) throw new Error(`tokens.css writes no oklch() for ${name}`)
  return { l: Number((Number(m[1]) / 100).toFixed(4)), c: Number(m[2]), h: Number(m[3]) }
}

describe('the accent Northside may choose', () => {
  test('the file’s blue, the default, is allowed — and carries white at 5.77 : 1', () => {
    const blue = oklchOf('--color-blue-600')
    expect(accentRefusal(blue)).toBeNull()
    expect(whiteOn(blue)).toBeCloseTo(5.77, 1)
  })

  test('a plum and a rust keep every other ink its job, so they are allowed', () => {
    expect(accentRefusal({ l: 0.42, c: 0.13, h: 325 })).toBeNull()
    expect(accentRefusal({ l: 0.42, c: 0.11, h: 45 })).toBeNull()
  })

  test('amber is refused with its reason: it is the one thing a person presses', () => {
    expect(accentRefusal({ l: 0.55, c: 0.11, h: 70 })).toBe(
      'The accent cannot be the act’s amber: amber is the one thing a person presses, and a chosen motor would read as an act waiting.',
    )
  })

  test('a kind’s ink is refused with its reason', () => {
    expect(accentRefusal({ l: 0.5, c: 0.17, h: 25 })).toMatch(
      /^The accent cannot be a motor’s carmine/,
    )
    expect(accentRefusal({ l: 0.5, c: 0.09, h: 100 })).toMatch(
      /^The accent cannot be a trailer’s ochre/,
    )
  })

  test('the boat’s cobalt is guarded by nearness, not by hue, so the default blue stays allowed', () => {
    expect(hueGap(255.7, 268)).toBeLessThan(15)
    expect(accentRefusal({ l: 0.39, c: 0.14, h: 266 })).toMatch(
      /^The accent cannot be a boat’s cobalt/,
    )
  })

  test('a colour white cannot stand on is refused with the measured ratio', () => {
    expect(accentRefusal({ l: 0.72, c: 0.12, h: 240 })).toBe(
      'White on this colour is 2.44 : 1, under the 4.5 : 1 that Northside’s name on the band and the words on a chosen chip need.',
    )
  })

  test('a grey is not an accent', () => {
    expect(accentRefusal({ l: 0.45, c: 0.02, h: 240 })).toMatch(/^An accent has to be a colour/)
  })

  test('the reserved inks are the tokens’ own values, byte for byte', () => {
    const names: Record<string, string> = {
      'a motor’s carmine': '--color-carmine-600',
      'a trailer’s ochre': '--color-ochre-600',
      'an accessory’s viridian': '--color-viridian-600',
      'a package’s violet': '--color-violet-600',
      'a dealer’s teal': '--color-teal-600',
      'a boat’s cobalt': '--color-cobalt-700',
      'a draft’s rose': '--color-rose-600',
      'a given quote’s leaf': '--color-leaf-600',
      'the act’s amber': '--color-amber-400',
    }
    for (const r of RESERVED_INKS) expect(r.ink, r.name).toEqual(oklchOf(names[r.name]!))
  })
})

describe('the accents the kit lets a person try', () => {
  test('begin with the accent the app has, and refuse exactly the two that take another ink’s job', () => {
    const [first] = ACCENT_PREVIEWS
    expect(cssOf(first!.colour)).toBe('oklch(51.2% 0.1554 255.7)')
    expect(
      ACCENT_PREVIEWS.filter((a) => accentRefusal(a.colour) !== null).map((a) => a.key),
    ).toEqual(['amber', 'carmine'])
  })
})
