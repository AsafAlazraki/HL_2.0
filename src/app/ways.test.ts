import { describe, expect, it } from 'vitest'
import { DOORS, FRONT_DOORS, START_A_QUOTE, backFrom, doorAt, hasShell, surfaceAt } from './ways'

/* ============================================================
   THE APP'S SHAPE, AS ARITHMETIC OVER AN ADDRESS.

   `src/routes/shell.test.tsx` already mounts the real route tree at
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

describe('back, named for its destination', () => {
  it('names the build from the two screens that are inside one', () => {
    expect(backFrom('/quote/abc/cascade')).toEqual({ href: '/quote/abc', word: 'The build' })
    expect(backFrom('/quote/abc/document')).toEqual({ href: '/quote/abc', word: 'The build' })
  })

  it('names the register from a build and from the picker', () => {
    expect(backFrom('/quote/abc')).toEqual({ href: '/quotes', word: 'Quotes' })
    expect(backFrom('/quote/new')).toEqual({ href: '/quotes', word: 'Quotes' })
  })

  it('names Data from a sheet', () => {
    expect(backFrom('/data/boat_highfield')).toEqual({ href: '/data', word: 'Data' })
  })

  it('names nothing from a door, because a door is where you already are', () => {
    for (const door of DOORS) expect(backFrom(door.href)).toBeNull()
    expect(backFrom('/nope')).toBeNull()
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

  it('gives every door a distinct word, address and key', () => {
    expect(new Set(DOORS.map((d) => d.word)).size).toBe(DOORS.length)
    expect(new Set(DOORS.map((d) => d.href)).size).toBe(DOORS.length)
    expect(new Set(DOORS.map((d) => d.key)).size).toBe(DOORS.length)
  })
})
