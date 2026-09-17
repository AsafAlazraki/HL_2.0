/* ============================================================
   A SWAP MAY NOT COST THE BUSINESS ITS IDENTITY.

   `replaceProject` rebuilds the sheet from scratch, organisation
   and all, so every import and every prepared set would throw the
   dealer back to "what's the name of your business?".
   `keepingOrganisation` is the wrapper that makes the swap
   invisible: capture the profile, swap, put it back.

   IT PUT BACK TWO OF FIVE FIELDS. The old wrapper called
   `setOrganisation(keep.name, keep.industry)` into an action that
   rebuilt the profile from its arguments and fell back to the
   sheet's own `createdAt` — which the swap it was wrapping had just
   deleted. So the function written to make a swap invisible was
   re-dating the business to the moment of the swap, re-deriving the
   tenant key off whatever the business is called TODAY, and dropping
   the dealership's standing quote terms. TENANCY §4.6 happening
   inside the single caller the rule was written for.

   The port carried that faithfully and nothing measured it, because
   the memory harness kept the profile across its own replace and so
   could not tell a wrapper that works from one that does nothing.
   Both are fixed; these are what hold them fixed.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { makeCtx, type OrgProfile, type ProjectExport } from '@/domain/model'
import { keepingOrganisation } from './apply'
import { memoryApply } from './memoryApply'

const NORTHSIDE: OrgProfile = {
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: '2019-04-01T00:00:00.000Z',
  slug: 'northside-marine',
  quoteTerms: 'This quote is valid for 30 days.',
}

/** A sheet with this organisation on it, and a swap that empties it
 *  exactly as `replaceProject` does. */
function sheetWith(org: OrgProfile | undefined) {
  const sheet = memoryApply(makeCtx({ orgId: 'northside-marine', ...(org ? { org } : {}) }))
  const swap = () =>
    sheet.ports.replaceProject({
      name: 'Another sheet',
      rev: 0,
      entities: [],
      groups: [],
      rules: [],
      rowsByEntity: {},
    })
  return { sheet, swap }
}

describe('an organisation across a project swap', () => {
  it('KEEPS THE BUSINESS WHOLE — the date, the key and the terms, not only the name', () => {
    const { sheet, swap } = sheetWith(NORTHSIDE)
    keepingOrganisation(sheet.ports, swap)
    expect(sheet.ctx().org).toEqual(NORTHSIDE)
  })

  it('is really put back by the wrapper and not merely left alone by the swap', () => {
    /* the assertion above would pass on a wrapper that did nothing if
       the swap kept the profile; this is the half that proves the
       swap drops it */
    const { sheet, swap } = sheetWith(NORTHSIDE)
    swap()
    expect(sheet.ctx().org).toBeUndefined()
  })

  it('takes the file’s organisation only when this machine has none', () => {
    const incoming: OrgProfile = {
      name: 'Harbour Boats',
      industry: 'marine',
      createdAt: '2020-06-01T00:00:00.000Z',
      slug: 'harbour-boats',
    }

    /* the business already here wins: a set sent over by a colleague
       must not rename the person opening it */
    const mine = sheetWith(NORTHSIDE)
    keepingOrganisation(mine.sheet.ports, mine.swap, incoming)
    expect(mine.sheet.ctx().org).toEqual(NORTHSIDE)

    /* and it matters when there is none — otherwise the import lands
       and immediately bounces the user back to onboarding while
       holding a file that already answers it */
    const fresh = sheetWith(undefined)
    keepingOrganisation(fresh.sheet.ports, fresh.swap, incoming)
    expect(fresh.sheet.ctx().org).toEqual(incoming)
  })

  it('invents nothing when neither the sheet nor the file names a business', () => {
    const { sheet, swap } = sheetWith(undefined)
    keepingOrganisation(sheet.ports, swap, undefined satisfies ProjectExport['org'])
    expect(sheet.ctx().org).toBeUndefined()
  })
})
