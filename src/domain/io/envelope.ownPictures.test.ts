/* ============================================================
   THE PICTURES NORTHSIDE ADDED, IN A SAVED COPY AND BACK.

   A picture a dealer adds lives on this computer only; the copy saved
   from the shelf is the one way it reaches another computer or
   survives this one. So a full copy carries each picture with its
   bytes and its provenance, and bringing the copy back reads each one
   as untrusted: our own bytes only, within the bounds, with a person
   and a day, whosever the file says it is.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { bytesOf, type OwnPicture } from '@/domain/model/ownPictures'
import { buildExportPayload } from './exportPayload'
import { validateEnvelope } from './envelope'

const BYTES = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='
const NOON = new Date(2026, 9, 30, 12).toISOString()

const picture = (row: string, more: Partial<OwnPicture> = {}): OwnPicture => ({
  id: `own-${row.replace(':', '-')}`,
  orgId: 'northside',
  table: 'parts',
  row,
  option: 'MFM50 - Battery MFM50',
  name: 'Battery MFM50',
  src: BYTES,
  width: 1100,
  height: 825,
  bytes: bytesOf(BYTES),
  file: 'mfm50.jpg',
  addedBy: 'Asaf',
  addedAt: NOON,
  chosen: false,
  ...more,
})

let pack: PackFixture
beforeAll(async () => {
  pack = await loadPack()
})

const PROJECT = { name: 'Northside Marine', rev: 1 }

/** saved, written out as the shelf writes it, and read back as a stranger's file */
function trip(payload: unknown, orgId = 'northside') {
  return validateEnvelope(JSON.parse(JSON.stringify(payload)), orgId)
}

describe('a full copy carries the pictures Northside added', () => {
  it('keeps each with its bytes and its provenance, and files them for whoever brings it back', () => {
    const kept = [picture('parts:119'), picture('parts:787', { chosen: true, name: 'GME GX700W' })]
    const saved = buildExportPayload(pack.ctx, PROJECT, true, kept)
    expect(saved.ownPictures).toHaveLength(2)
    const read = trip(saved, 'northside-again')
    expect(read.ok).toBe(true)
    if (!read.ok) return
    expect(read.data.ownPictures).toEqual(kept.map((p) => ({ ...p, orgId: 'northside-again' })))
  })

  it('says a copy that held none as none, so bringing it back leaves none', () => {
    const read = trip(buildExportPayload(pack.ctx, PROJECT, true, []))
    expect(read.ok && read.data.ownPictures).toEqual([])
  })

  it('leaves them out of a copy of the structure alone, which carries no lines', () => {
    const saved = buildExportPayload(pack.ctx, PROJECT, false, [picture('parts:119')])
    expect(saved.ownPictures).toBeUndefined()
    const read = trip(saved)
    expect(read.ok && read.data.ownPictures).toBeUndefined()
  })
})

describe('bringing a copy back reads each picture as untrusted', () => {
  it('drops a picture that is an address on another host, a script, or past the bounds', () => {
    const saved = buildExportPayload(pack.ctx, PROJECT, true, [
      picture('parts:119'),
      picture('parts:120', { src: 'https://example.com/hotlinked.jpg' }),
      picture('parts:121', { src: 'javascript:alert(1)' }),
      picture('parts:122', { width: 4032, height: 3024 }),
      picture('parts:123', { addedBy: '' }),
    ])
    const read = trip(saved)
    expect(read.ok).toBe(true)
    if (!read.ok) return
    expect(read.data.ownPictures?.map((p) => p.row)).toEqual(['parts:119'])
  })

  it('keeps one picture per id', () => {
    const saved = buildExportPayload(pack.ctx, PROJECT, true, [picture('parts:119')])
    const twice = { ...saved, ownPictures: [...saved.ownPictures!, ...saved.ownPictures!] }
    const read = trip(twice)
    expect(read.ok && read.data.ownPictures).toHaveLength(1)
  })

  it('refuses a copy whose pictures cannot be read at all, with a sentence', () => {
    const saved = buildExportPayload(pack.ctx, PROJECT, true, [])
    expect(trip({ ...saved, ownPictures: 'not a list' })).toEqual({
      ok: false,
      error: 'That copy is damaged: the pictures Northside added to its options cannot be read.',
    })
  })
})
