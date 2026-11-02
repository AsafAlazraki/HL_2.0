import { describe, expect, it } from 'vitest'
import { AIR, FOOT_HEAD, NARROWEST, laneBeside } from './lane'

/* WHERE THE TOAST STANDS WHILE A PLATE IS OPEN (./lane.ts). The plates are the ones the quote-3
   audit measured: the motor's gallery at 1440 × 900 (317–1,123 by 24–876) and at 1920 × 1080
   (544–1,376 by 104–976). */
const desk = { width: 1440, height: 900 }
const wide = { width: 1920, height: 1080 }

describe('the toast’s lane beside an open plate', () => {
  it('keeps the foot while no plate is open', () => {
    expect(laneBeside(null, desk)).toEqual({ at: 'foot' })
  })

  it('keeps the foot where the plate ends above it', () => {
    expect(laneBeside({ left: 544, top: 104, right: 1376, bottom: 976 }, wide)).toEqual({
      at: 'foot',
    })
  })

  it('stands 16px past a plate that reaches the foot, in the band it leaves at its right', () => {
    const lane = laneBeside({ left: 317, top: 24, right: 1123, bottom: 876 }, desk)
    expect(lane).toEqual({ at: 'side', left: 1123 + AIR })
    /* the band it stands in: 1,139 to 1,424, 285px */
    if (lane.at === 'side') expect(desk.width - AIR - lane.left).toBe(285)
  })

  it('measures the foot from the lane’s own head, with half the air between', () => {
    const room = { width: 1440, height: 900 }
    const free = room.height - FOOT_HEAD - AIR / 2
    expect(laneBeside({ left: 300, top: 24, right: 1140, bottom: free }, room).at).toBe('foot')
    expect(laneBeside({ left: 300, top: 24, right: 1140, bottom: free + 1 }, room).at).toBe('side')
  })

  it('keeps the foot when the band beside the plate cannot hold the card', () => {
    const right = desk.width - AIR - NARROWEST - AIR + 1
    expect(laneBeside({ left: 100, top: 24, right, bottom: 876 }, desk)).toEqual({ at: 'foot' })
    expect(laneBeside({ left: 100, top: 24, right: right - 1, bottom: 876 }, desk).at).toBe('side')
  })
})
