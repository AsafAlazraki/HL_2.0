/* ============================================================
   REVIEW, by role and text, on the real price list. What the screen
   says is read the way a person reads it; what a press writes is read
   back out of the store it wrote to, and taken back the same way.
   ============================================================ */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { engineWordsIn } from '@/screens/configurator/say'
import { review } from '@/domain/rules/review/checks'
import { meantKeysOf, queueOf } from '@/domain/rules/review/cases'
import { Review, type ReviewProps } from './Review'
import { MEANT_PREF, TIDY } from './read'

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

function draw(at = '') {
  const onAt = vi.fn<ReviewProps['onAt']>()
  const go = vi.fn<ReviewProps['go']>()
  const openTheFile = vi.fn<() => void>()
  const view = render(
    <Review
      at={at}
      onAt={onAt}
      listHref={(t, a) => `/data/${t}${a ? `?at=${a}` : ''}`}
      go={go}
      openTheFile={openTheFile}
    />,
  )
  return { onAt, go, openTheFile, ...view }
}

const row = (table: string, id: string): Record<string, unknown> =>
  catalogue.getState().rows[table]!.find((r) => r.id === id)!.values

const stage = (): HTMLElement => screen.getByRole('region')

const LONE_STAR = 'none:parts:ANCHOR WINCHES - Lone Star:blank'
const PLUGS = 'none:parts:TRAILER PARTS - Trailer Plugs:zero'

describe('the first look', () => {
  it('counts what is left and what it costs, and puts the most money on the stage', () => {
    const { container } = draw()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Review 37 to settle, the most money first' }),
    ).toBeTruthy()
    /* $819 and $234: 7 × $117 and 2 × $117, read as text whatever the figure is drawn with */
    expect(container.textContent).toContain('$819')
    expect(container.textContent).toContain('$234')
    /* ONE FIGURE: the head, each check and "Case 1 of 37" all count cases, and the five add to
       the 37 (built-critique-m3.md, major 11: "69 to settle" beside "Case 1 of 37") */
    const checks = screen.getByRole('navigation', { name: 'The checks' })
    for (const name of [
      'Wrong size 9',
      'Two prices 3',
      'No price 18',
      'Two under one name 4',
      'Nothing to name it 3',
      'then Tidy 138',
    ])
      expect(within(checks).getByRole('button', { name })).toBeTruthy()

    expect(
      screen.getByRole('heading', { level: 2, name: 'Rego the ALP 5.3M-13B as a Large trailer.' }),
    ).toBeTruthy()
    expect(within(stage()).getByText('Case 1 of 37 · Registered as the wrong size')).toBeTruthy()
    expect(within(stage()).getByRole('button', { name: /^Make it Large · \+\$117/ })).toBeTruthy()
    /* the file's own cells, as they read and after the change */
    expect(within(stage()).getByRole('cell', { name: 'Small Trailers - Up to 1.02t' })).toBeTruthy()
    expect(within(stage()).getByRole('cell', { name: 'Large Trailers - Over 1.021t' })).toBeTruthy()
    expect(within(stage()).getByRole('cell', { name: '$11,483' })).toBeTruthy()
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })

  it('names the next two cases beneath the stage, and the lists no check could read', () => {
    draw()
    const next = screen.getByRole('navigation', { name: 'The next cases' })
    expect(
      within(next).getByRole('button', {
        name: 'Case 2: Rego the ALP 5.7M-13TB as a Large trailer.',
      }),
    ).toBeTruthy()
    expect(within(next).getAllByRole('button')).toHaveLength(2)
    /* six, not seven: Registration Costs declares no price, but the first case reads its fees */
    const notChecked = screen.getByText(/^Not checked: 6 lists declare no price/).textContent
    expect(notChecked).toContain('2,561')
    expect(notChecked).not.toContain('Registration Costs')
  })

  it('keeps a model code whole in the headline, never broken at its hyphen', () => {
    draw()
    const title = screen.getByRole('heading', { level: 2 })
    const whole = [...title.querySelectorAll('.rv-whole')].map((e) => e.textContent)
    expect(whole).toEqual(['5.3M-13B'])
  })

  it('promises only what is true of a press: History keeps quotes, not the price list', () => {
    const { container } = draw()
    expect(within(stage()).getByText(/One step, said with its Undo./)).toBeTruthy()
    expect(container.textContent).not.toMatch(/History/)
  })
})

describe('one neighbour said once', () => {
  it('says the priced line beside Formosa’s nine boats once, over them, not nine times', () => {
    const s = catalogue.getState()
    const formosa = queueOf(review({ entities: s.tables, rowsByEntity: s.rows })).find(
      (c) => c.kind === 'none' && c.group.tableName === 'Formosa',
    )!
    draw(formosa.key)
    expect(within(stage()).getAllByText(/^Beside them in the price list: /)).toHaveLength(1)
    expect(within(stage()).queryByText(/^Beside it: /)).toBeNull()
    expect(within(stage()).getAllByRole('textbox')).toHaveLength(9)
  })
})

describe('a press writes the price list, and comes back', () => {
  it('makes a trailer Large in one step, the count falls, and Ctrl Z puts it back', async () => {
    const user = userEvent.setup()
    const { onAt } = draw()
    await user.click(within(stage()).getByRole('button', { name: /^Make it Large/ }))
    const v = row('trl_dunbier', 'trl_dunbier:67')
    expect(v['trl_dunbier.by']).toBe('Large Trailers - Over 1.021t')
    expect(v['trl_dunbier.bz']).toBe(283)
    expect(v['trl_dunbier.ca']).toBe(11483)
    /* the stage moves on to the case that stood after it */
    expect(onAt).toHaveBeenLastCalledWith(
      'band:trl_dunbier:trl_dunbier:69:Small Trailers - Up to 1.02t:2000',
    )
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('36')

    await user.keyboard('{Control>}z{/Control}')
    expect(row('trl_dunbier', 'trl_dunbier:67')['trl_dunbier.ca']).toBe(11366)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('37')
  })

  it('Enter makes the fix on the stage, and → skips it without writing', async () => {
    const user = userEvent.setup()
    const { onAt } = draw()
    await user.keyboard('{ArrowRight}')
    expect(onAt).toHaveBeenLastCalledWith(
      'band:trl_dunbier:trl_dunbier:69:Small Trailers - Up to 1.02t:2000',
    )
    expect(row('trl_dunbier', 'trl_dunbier:67')['trl_dunbier.ca']).toBe(11366)
    await user.keyboard('{Enter}')
    expect(row('trl_dunbier', 'trl_dunbier:67')['trl_dunbier.ca']).toBe(11483)
  })
})

describe('a case of several lines, priced as typed', () => {
  it('refuses with its reason until a price is typed, then writes every price typed', async () => {
    const user = userEvent.setup()
    const { onAt } = draw(LONE_STAR)
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Give the 8 lines in Anchor Winches - Lone Star a price.',
      }),
    ).toBeTruthy()
    /* the priced line beside it, for the dealer to type against — never proposed */
    expect(
      within(stage()).getAllByText(
        'Beside it: Lone Star · GX-1 6 mm Combo Winch Kit · Sell $2,100',
      ),
    ).toHaveLength(2)

    await user.click(within(stage()).getByRole('button', { name: /^Price them at Sell/ }))
    expect(
      within(stage()).getByText('Type a price beside at least one of them first.'),
    ).toBeTruthy()

    const first = within(stage()).getByRole('textbox', {
      /* the line as the dealer says it, not as the file writes it (`nameSaid`) */
      name: 'Sell for Lone Star · GX-1 HS4mm Combo Winch Kit',
    })
    await user.type(first, 'abc')
    await user.click(within(stage()).getByRole('button', { name: /^Price the one typed at Sell/ }))
    expect(within(stage()).getByText(/^“abc” is not a price\./)).toBeTruthy()

    await user.clear(first)
    await user.type(first, '$2,150')
    await user.type(
      within(stage()).getByRole('textbox', {
        name: 'Sell for Lone Star · GX-2 8 mm Combo Winch Kit',
      }),
      '2250',
    )
    await user.click(within(stage()).getByRole('button', { name: /^Price the 2 typed at Sell/ }))
    const s = catalogue.getState()
    expect(review({ entities: s.tables, rowsByEntity: s.rows }).noPrice.count).toBe(44)
    /* six of the eight still have no price, so the stage keeps the case, two lines shorter, and
       the queue still holds it: the count is of cases */
    expect(onAt).toHaveBeenLastCalledWith(LONE_STAR)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('37')
  })

  it('makes no default amber where $0 may be meant, and leaves all four plugs in one press', async () => {
    const user = userEvent.setup()
    draw(PLUGS)
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Price the 4 lines in Trailer Parts - Trailer Plugs, or leave them at $0.',
      }),
    ).toBeTruthy()
    /* Enter makes nothing here: the file cannot say which of the two is right */
    await user.keyboard('{Enter}')
    expect(prefs.getState().get(MEANT_PREF)).toBeUndefined()

    await user.click(within(stage()).getByRole('button', { name: 'It’s meant' }))
    const s = catalogue.getState()
    expect(review({ entities: s.tables, rowsByEntity: s.rows }, prefsMeant()).open).toBe(65)
    expect(screen.getByText(/^4 lines are left alone\./)).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Bring them back' }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('37')
  })
})

const prefsMeant = (): Record<string, string> =>
  (prefs.getState().get(MEANT_PREF) as Record<string, string> | undefined) ?? {}

describe('a choice between two named options', () => {
  it('sells one name at the price chosen', async () => {
    const user = userEvent.setup()
    draw('two:trl_mackay:mackay pu series trailer - pu5000-14-m:9423/10043')
    await user.click(within(stage()).getByRole('button', { name: /^Sell both at \$9,423/ }))
    expect(row('trl_mackay', 'trl_mackay:57')['trl_mackay.ca']).toBe(9423)
    const s = catalogue.getState()
    expect(review({ entities: s.tables, rowsByEntity: s.rows }).twoPrices.count).toBe(2)
  })

  it('keeps a cost out of sight where two under one name are both costs', () => {
    draw('field-dup-name:dealer_fit:dealer_fit.e,dealer_fit.v')
    expect(within(stage()).getAllByText('A cost, not shown here')).toHaveLength(2)
  })

  it('renames one of two under one name', async () => {
    const user = userEvent.setup()
    draw('field-dup-name:rig_kits:rig_kits.l,rig_kits.ad')
    const second = within(stage()).getByRole('textbox', {
      name: 'A name of its own for the second, after Sell Price, called Trade Price in Rigging Kits',
    })
    await user.type(second, 'Install Trade Price{Enter}')
    const s = catalogue.getState()
    expect(s.tables['rig_kits']!.fields.find((f) => f.id === 'rig_kits.ad')!.name).toBe(
      'Install Trade Price',
    )
    expect(review({ entities: s.tables, rowsByEntity: s.rows }).twins.count).toBe(3)
  })
})

describe('after the queue, and the clean day', () => {
  it('counts the tidy suggestions after the queue, and none of them is a case in it', () => {
    draw(TIDY)
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: '138 suggestions about how the price list is laid out.',
      }),
    ).toBeTruthy()
    expect(
      within(stage()).getByText('Typed words that could be chosen from a short list'),
    ).toBeTruthy()
  })

  it('says what is now true when nothing is left, and the money reads $0', () => {
    const s = catalogue.getState()
    const all = queueOf(review({ entities: s.tables, rowsByEntity: s.rows }))
    prefs
      .getState()
      .set(MEANT_PREF, Object.fromEntries(all.flatMap(meantKeysOf).map((k) => [k, 'meant x'])))
    const { container } = draw()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nothing in your price list needs you.' }),
    ).toBeTruthy()
    expect(
      screen.getByText(/^Every trailer is registered as the size its weight says\./),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('0')
    expect(container.textContent).toContain('$0')
    expect(screen.getByText(/^69 lines are left alone\./)).toBeTruthy()
  })
})
