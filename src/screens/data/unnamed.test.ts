/* Against the real pack: where REDCO's fitted trailers are, read off the lines themselves. */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { readTableRegister } from '@/domain/modules/register'
import { elsewhereSay } from './unnamed'

const pack = await loadPack()
const world = { entities: pack.ctx.entities, rowsByEntity: pack.ctx.rowsByEntity }
const register = readTableRegister(
  pack.ctx.entities,
  pack.ctx.rowsByEntity,
  pack.ctx.modules,
  pack.ctx.priceLevels,
)
const fittable = register.rows.filter(
  (r) => r.provenance.kind !== 'desk' && !r.retired && r.kind === 'trailer',
)
const unnamed = fittable.filter((r) => r.namedBy.models === 0)
const fitted = fittable.filter((r) => r.namedBy.models > 0)

describe('a list no list of what fits names, and where its makers’ fitted lines are', () => {
  it('holds REDCO / Tinka Trailers among the trailer lists on this file', () => {
    expect(unnamed.map((r) => r.name)).toContain('REDCO / Tinka Trailers')
  })

  it('says the REDCO and Tinka trailers What fits offers are in NSM Custom Trailers', () => {
    expect(elsewhereSay(world, unnamed, fitted)).toBe(
      'The REDCO and Tinka trailers What fits offers for a boat are in NSM Custom Trailers.',
    )
  })

  it('says nothing where no list of what fits carries the same makers', () => {
    expect(elsewhereSay(world, unnamed, [])).toBe('')
  })
})
