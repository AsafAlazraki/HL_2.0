/* ============================================================
   THE TOP OF THE COVER (2026-11-02; docs/directions/quote-3/cover-pick.md): which ground it is,
   and how far a photograph spans the sheet, read off the held picture alone.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { HeldPicture } from '@/data/pictures'
import { NIGHT_MAX_PX, SHEET_PX, groundOf, spanOf, type CoverArt } from './art'

const held = (over: Partial<HeldPicture>): HeldPicture =>
  ({ width: 1100, height: 733, verdict: 'scene', ...over }) as HeldPicture
const photo = (over: Partial<HeldPicture>): CoverArt => ({ kind: 'photograph', held: held(over) })

describe('the ground the top of the cover is', () => {
  it('is the photograph for one on the water and for Northside’s own', () => {
    expect(groundOf(photo({ verdict: 'scene' }))).toBe('photo')
    expect(groundOf(photo({ verdict: 'own' }))).toBe('photo')
  })

  it('is the studio panel for a studio picture, one never measured, a mark or a name', () => {
    expect(groundOf(photo({ verdict: 'studio' }))).toBe('studio')
    expect(groundOf(photo({ verdict: 'unknown' }))).toBe('studio')
    expect(groundOf({ kind: 'word', because: '' })).toBe('studio')
  })
})

describe('how far a photograph spans the sheet', () => {
  it('reads A4 and the photograph’s ceiling in CSS px', () => {
    expect(Math.round(SHEET_PX * 10) / 10).toBe(793.7)
    expect(Math.round(NIGHT_MAX_PX)).toBe(643)
  })

  it('runs off both sides where its held pixels reach the sheet and its proportion stands under the ceiling', () => {
    /* the SP560's maker's photograph, the Stacer 499's row copy, the 529's */
    expect(spanOf({ width: 2560, height: 1708 })).toBe('full')
    expect(spanOf({ width: 1100, height: 733 })).toBe('full')
    expect(spanOf({ width: 1024, height: 676 })).toBe('full')
  })

  it('stands centred, never enlarged, where its pixels stop short or it is too tall', () => {
    expect(spanOf({ width: 640, height: 427 })).toBe('narrow')
    expect(spanOf({ width: 1100, height: 1100 })).toBe('narrow')
    expect(spanOf({ width: 0, height: 0 })).toBe('narrow')
  })
})
