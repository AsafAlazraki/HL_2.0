/* ============================================================
   REVIEW'S FIRST CASE IN THE DEALER'S WORDS, by role and text on the
   real price list (built-critique-m3-2.md, M13). Its own file, beside
   Review.test.tsx, so the words are pinned where they are read.
   ============================================================ */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, within } from '@testing-library/react'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { Review, type ReviewProps } from './Review'
import { MEANT_PREF } from './read'

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

beforeEach(async () => {
  prefs.getState().remove(MEANT_PREF)
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
})

describe('the wrong-size trailer, as the dealer reads it', () => {
  it('says the series, the weight and the labels, and none of the file’s keys or cells', () => {
    render(
      <Review
        position={{ case: 'band:trl_dunbier:trl_dunbier:67:Small Trailers - Up to 1.02t:1450' }}
        onPosition={vi.fn<ReviewProps['onPosition']>()}
        listHref={(t) => `/data/${t}`}
        go={vi.fn<ReviewProps['go']>()}
        openTheFile={vi.fn<() => void>()}
      />,
    )
    const stage = document.querySelector<HTMLElement>('.rv-stage')!
    expect(
      within(stage).getByRole('heading', {
        name: 'Rego the ALP 5.3M-13B Fibreglass Boat as a Large trailer.',
      }),
    ).toBeInTheDocument()
    const said = stage.textContent ?? ''
    expect(said).toContain('Dunbier Trailers · Alloy Loader Pro Series')
    expect(within(stage).getByRole('rowheader', { name: 'ATM' })).toBeInTheDocument()
    expect(within(stage).getByRole('rowheader', { name: 'Rego' })).toBeInTheDocument()
    expect(within(stage).getAllByRole('cell', { name: '1,450 kg' }).length).toBeGreaterThan(0)
    expect(said).toContain('“Up to 1.02t” and “Over 1.021t”')
    for (const fileWord of [
      'ATM (KG)',
      'Rego ($)',
      'Registration Costs!',
      '9304 + 9083L',
      'DUNBIER',
      '(1,450kgs)',
    ])
      expect(said, fileWord).not.toContain(fileWord)
  })
})
