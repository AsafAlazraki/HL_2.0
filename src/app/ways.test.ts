import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { APP_NAME, DOORS, FRONT_DOORS, START_A_QUOTE, doorAt, hasShell, surfaceAt } from './ways'

/* ============================================================
   THE APP'S SHAPE, AS ARITHMETIC OVER AN ADDRESS.

   `src/routes/-shell.test.tsx` already mounts the real route tree at
   every href in this file and asserts a real screen arrives. What it
   cannot say is what the SHELL makes of an address it has never been
   told about — which door it is behind, what it is inside, and
   whether a pill should stand on it at all — and those three answers
   are what the pill and the finder are drawn from.
   ============================================================ */

describe('which door an address is behind', () => {
  it('answers each door with itself', () => {
    for (const door of DOORS) expect(doorAt(door.href)?.href).toBe(door.href)
  })

  it('answers by the longest prefix, so a sheet is Data and a build is Quotes', () => {
    expect(doorAt('/data/boat_highfield')?.word).toBe('Data')
    expect(doorAt('/quote/abc')?.word).toBe('Quotes')
    expect(doorAt('/quote/abc/cascade')?.word).toBe('Quotes')
    expect(doorAt('/quote/new')?.word).toBe('Quotes')
    expect(doorAt('/customers?book=all')?.word).toBe('Customers')
  })

  it('is Home only at Home, never at everything under it', () => {
    expect(doorAt('/')?.word).toBe('Home')
    expect(doorAt('/quotes')?.word).toBe('Quotes')
  })

  it('answers nothing for an address behind no door, rather than guessing', () => {
    expect(doorAt('/sign-in')).toBeNull()
    expect(doorAt('/nope')).toBeNull()
  })

  it('reads a trailing slash as the same address', () => {
    expect(doorAt('/quotes/')?.word).toBe('Quotes')
  })
})

describe('whether the shell stands here at all', () => {
  it('stands on every screen but the door', () => {
    expect(hasShell('/sign-in')).toBe(false)
    expect(hasShell('/sign-in?again=true')).toBe(false)
    for (const door of DOORS) expect(hasShell(door.href)).toBe(true)
    expect(hasShell('/nope')).toBe(true)
  })
})

describe('a photograph or a register', () => {
  it('calls the four registers cockpit and everything else showroom', () => {
    expect(surfaceAt('/quotes')).toBe('cockpit')
    expect(surfaceAt('/customers')).toBe('cockpit')
    expect(surfaceAt('/history')).toBe('cockpit')
    expect(surfaceAt('/data')).toBe('cockpit')
    expect(surfaceAt('/data/boat_highfield')).toBe('cockpit')
    expect(surfaceAt('/')).toBe('showroom')
    expect(surfaceAt('/quote/new')).toBe('showroom')
    expect(surfaceAt('/quote/abc/document')).toBe('showroom')
  })
})

describe('the lit door is the way back to its register', () => {
  it('lights the register every screen inside it belongs to', () => {
    /* rule (a), critique #13: the pill drew `‹ Data` beside a lit `Data 53` to one address.
       Every screen inside a register now has exactly one door lit, and it is that register */
    expect(doorAt('/quote/abc')?.href).toBe('/quotes')
    expect(doorAt('/quote/abc/document')?.href).toBe('/quotes')
    expect(doorAt('/quote/new')?.href).toBe('/quotes')
    expect(doorAt('/data/boat_highfield')?.href).toBe('/data')
  })
})

describe('the app’s own name', () => {
  it('is the name the browser’s tab already prints', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
    expect(/<title>([^<]*)<\/title>/.exec(html)?.[1]).toBe(APP_NAME)
  })
})

describe('the two lists, spelled once', () => {
  it('builds the dead end’s offer out of the doors themselves', () => {
    expect(FRONT_DOORS.map((w) => w.href)).toEqual(['/', '/quotes', START_A_QUOTE.href])
    /* the same record, not a copy of it: the register is "The
       register" in a sentence and "Quotes" on the pill, and both
       readings come off one row */
    expect(FRONT_DOORS[1]).toBe(DOORS.find((d) => d.href === '/quotes'))
  })

  it('gives every door a distinct word and address', () => {
    expect(new Set(DOORS.map((d) => d.word)).size).toBe(DOORS.length)
    expect(new Set(DOORS.map((d) => d.href)).size).toBe(DOORS.length)
  })
})
