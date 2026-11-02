/* ============================================================
   THE TOP OF THE COVER (2026-11-02; docs/directions/quote-3/cover-pick.md): which ground it is,
   and how far a photograph spans the sheet, read off the held picture alone.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { HeldPicture } from '@/data/pictures'
import {
  NIGHT_MAX_PX,
  SHEET_PX,
  coverAskAct,
  coverAskSay,
  coverSay,
  groundOf,
  notPrintedSay,
  spanOf,
  type CoverArt,
} from './art'

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

/* ============================================================
   WHAT THE NOTE BESIDE THE PAPER SAYS OF THE COVER'S PICTURE (the quote round's audit, 2026-11-02,
   D1): what prints and whose it is, and — where the build shows another — which, and why not.
   ============================================================ */
describe('what the note says the cover prints', () => {
  it('says whose the picture is, never how it is drawn', () => {
    const hero = photo({
      tier: 'hero',
      subject: 'Stacer 409 Assault Pro on the water',
      address: 'https://www.stacer.com.au/a.jpg',
    })
    expect(coverSay(hero, 'boat')).toBe(
      'The Stacer 409 Assault Pro on the water, as its maker photographed it, from www.stacer.com.au.',
    )
    const row = photo({
      id: 'row:https://www.highfieldboats.com/x.jpg',
      tier: 'catalogue',
      verdict: 'studio',
      address: 'https://www.highfieldboats.com/x.jpg',
    })
    expect(coverSay(row, 'boat')).toBe(
      'The price list’s own picture of this boat, from www.highfieldboats.com.',
    )
    const own = photo({ added: { by: 'Asaf', at: '2026-11-02T12:00:00.000Z' }, address: '' })
    expect(coverSay(own, 'boat')).toBe(
      'Northside’s own photograph. Added by Asaf, 2 November 2026.',
    )
    expect(coverSay({ kind: 'word', because: 'No photograph of this boat yet.' }, 'boat')).toBe(
      'No photograph of this boat yet.',
    )
  })
})

describe('why the build’s picture is not the cover’s', () => {
  const printed = photo({ id: 'row:a', src: '/a.webp', tier: 'catalogue', verdict: 'studio' })
  const machine = held({
    id: 'highfield-sp560',
    src: '/sp560.webp',
    tier: 'hero',
    person: false,
    exact: false,
    subject: 'Highfield Sport 560 on the water',
  })

  it('names a maker’s photograph nobody checked, and on a draft what prints instead', () => {
    expect(notPrintedSay(machine, printed, 'boat', true)).toBe(
      'The build shows the Highfield Sport 560 on the water, as its maker photographed it. Nobody has checked that it shows this model, so it is not printed. A photograph Northside adds to this boat and makes its cover is printed instead.',
    )
  })

  it('offers a given quote no new cover', () => {
    expect(notPrintedSay(machine, printed, 'boat', false)).toBe(
      'The build shows the Highfield Sport 560 on the water, as its maker photographed it. Nobody has checked that it shows this model, so it is not printed.',
    )
  })

  it('names a picture of the model in a finish that may not be this one', () => {
    const model = held({ id: 'm', src: '/m.webp', tier: 'catalogue', exact: false, person: true })
    expect(notPrintedSay(model, { kind: 'word', because: '' }, 'trailer', false)).toBe(
      'The build shows a picture of the model that may not be this trailer’s finish, so it is not printed.',
    )
  })

  it('says nothing where the cover prints what the build shows, or the build shows nothing', () => {
    expect(notPrintedSay(null, printed, 'boat', true)).toBe('')
    expect(notPrintedSay(held({ id: 'row:a', src: '/a.webp' }), printed, 'boat', true)).toBe('')
    /* a photograph a person marked is printed wherever it is shown, so there is nothing to explain */
    const marked = held({ id: 'h', src: '/h.webp', tier: 'hero', person: true, exact: true })
    expect(notPrintedSay(marked, printed, 'boat', true)).toBe('')
  })
})

describe('what the panel where the paper is chosen says of the cover', () => {
  const machine = held({
    id: 'highfield-sp560',
    src: '/sp560.webp',
    tier: 'hero',
    person: false,
    exact: false,
    subject: 'Highfield Sport 560 on the water',
  })

  it('says which photograph the build shows and why the cover leaves it off', () => {
    const render = photo({ id: 'row:a', src: '/a.webp', tier: 'catalogue', verdict: 'studio' })
    expect(coverAskSay(render, machine, 'boat')).toBe(
      'The build shows the Highfield Sport 560 on the water, as its maker photographed it. Nobody has checked that it shows this model, so it is not printed.',
    )
  })

  it('gives the cover’s own reason where it prints no picture and the build shows none', () => {
    expect(
      coverAskSay({ kind: 'word', because: 'No photograph of this boat yet.' }, null, 'boat'),
    ).toBe('No photograph of this boat yet.')
  })

  it('says nothing where the cover prints what the build shows', () => {
    const marked = held({ id: 'h', src: '/h.webp', tier: 'hero', person: true, exact: true })
    expect(coverAskSay({ kind: 'photograph', held: marked }, marked, 'boat')).toBe('')
    expect(coverAskSay(photo({ id: 'row:m', verdict: 'studio' }), null, 'motor')).toBe('')
  })

  it('names the act on a draft in the noun of what is sold', () => {
    expect(coverAskAct('trailer', null)).toBe(
      'Add Northside’s own photograph of this trailer and make it the cover, and the printed quote prints it on its cover.',
    )
  })

  it('says the maker’s photograph the gallery marks as its cover is not the one printed', () => {
    expect(coverAskAct('boat', machine)).toBe(
      'Add Northside’s own photograph of this boat and make it the cover, and the printed quote prints it on its cover. The maker’s photograph is not printed.',
    )
    const marked = held({ id: 'h', tier: 'hero', person: true })
    expect(coverAskAct('boat', marked)).not.toMatch(/maker’s photograph is not printed/)
  })
})
