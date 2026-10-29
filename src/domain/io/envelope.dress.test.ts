/* ============================================================
   WHAT NORTHSIDE SET ON /places COMES BACK FROM A SAVED COPY.

   The shelf's inventory counts the marks and photographs chosen on
   Places as part of a copy. Before 2026-10-30 `normModule` dropped the
   module's `dress`, so this round trip came back with none of them:
   the count would have said "saved" over a copy that held nothing.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { makeCtx, type ModuleDef } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { buildExportPayload } from './exportPayload'
import { validateEnvelope } from './envelope'

describe('a saved copy carries a place’s livery', () => {
  it('keeps the line, the mark, the photograph and the ground, and drops what is unsafe', async () => {
    const pack = await loadPack()
    const boats = Object.values(pack.ctx.modules).find((m) => m.tableIds.includes('boat_stacer'))
    if (!boats) throw new Error('no place holds Stacer')
    const dressed: ModuleDef = {
      ...boats,
      dress: {
        boat_stacer: {
          line: 'Aluminium for the bay and the dam',
          mark: { from: 'maker', ink: 'white' },
          hero: { from: 'own', image: { id: 'own1', src: 'data:image/webp;base64,AAAA' } },
          ground: 'navy',
        },
        /* a picture whose address is a script, which no file may carry in */
        boat_highfield: {
          hero: { from: 'own', image: { id: 'bad', src: 'javascript:alert(1)' } },
          ground: 'navy',
        },
        /* a key that is no table of this place */
        nowhere: { line: 'not a place here' },
      },
    }
    const ctx = makeCtx({ ...pack.ctx, modules: { ...pack.ctx.modules, [boats.id]: dressed } })
    const saved = buildExportPayload(ctx, { name: 'Northside Marine', rev: 1 }, true)
    const read = validateEnvelope(JSON.parse(JSON.stringify(saved)), 'northside')
    if (!read.ok) throw new Error(read.error)
    const back = read.data.modules?.find((m) => m.id === boats.id)
    expect(back?.dress?.boat_stacer).toEqual(dressed.dress?.boat_stacer)
    expect(back?.dress?.boat_highfield).toEqual(
      boats.tableIds.includes('boat_highfield') ? { ground: 'navy' } : undefined,
    )
    expect(back?.dress?.nowhere).toBeUndefined()
  })
})
