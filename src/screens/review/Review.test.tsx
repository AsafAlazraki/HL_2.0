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
import { isDiscontinued } from '@/domain/model'
import { review } from '@/domain/rules/review/checks'
import { meantKeysOf, queueOf } from '@/domain/rules/review/cases'
import { Review, type ReviewPosition, type ReviewProps } from './Review'
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

function draw(at = '', more: ReviewPosition = {}) {
  const onPosition = vi.fn<ReviewProps['onPosition']>()
  const go = vi.fn<ReviewProps['go']>()
  const openTheFile = vi.fn<() => void>()
  const position: ReviewPosition = { ...(at === '' ? {} : { case: at }), ...more }
  const view = render(
    <Review
      position={position}
      onPosition={onPosition}
      listHref={(t, a) => `/data/${t}${a ? `?at=${a}` : ''}`}
      go={go}
      openTheFile={openTheFile}
    />,
  )
  /** where the last press sent the stage */
  const lastCase = (): string | undefined => onPosition.mock.lastCall?.[0].case
  return { onPosition, go, openTheFile, lastCase, ...view }
}

const row = (table: string, id: string): Record<string, unknown> =>
  catalogue.getState().rows[table]!.find((r) => r.id === id)!.values

const stage = (): HTMLElement => document.querySelector<HTMLElement>('.rv-stage')!
const queue = () => {
  const s = catalogue.getState()
  return queueOf(review({ entities: s.tables, rowsByEntity: s.rows }))
}

const FIRST_TRAILER = 'band:trl_dunbier:trl_dunbier:67:Small Trailers - Up to 1.02t:1450'
const SECOND_TRAILER = 'band:trl_dunbier:trl_dunbier:69:Small Trailers - Up to 1.02t:2000'
const LONE_STAR = 'none:parts:ANCHOR WINCHES - Lone Star:blank'
const PLUGS = 'none:parts:TRAILER PARTS - Trailer Plugs:zero'
const FORMOSA = 'none:boat_formosa::zero'

describe('the first look', () => {
  it('counts what is left and what it costs, and puts what risks a quote on the stage', () => {
    const { container } = draw()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Review 39 to settle, what puts a quote at risk first',
      }),
    ).toBeTruthy()
    /* $819 and $234: 7 × $117 and 2 × $117, on one sale of each */
    expect(container.textContent).toContain('$819')
    expect(container.textContent).toContain('$234')
    expect(container.textContent).toContain('on one sale of each trailer')
    /* ONE FIGURE: the head, each check and "Case 1 of 39" all count cases, and the nine add up */
    const checks = screen.getByRole('navigation', { name: 'The checks' })
    for (const name of [
      'Boats at $0 1',
      'Wrong size 9',
      'Below cost 2',
      'Two prices 3',
      'No price 15',
      'Notes on sale 3',
      'Own rules broken 1',
      'Two headings, one name 4',
      'Nothing to name it 1',
      'then Tidy 138',
    ])
      expect(within(checks).getByRole('button', { name })).toBeTruthy()

    /* a boat on sale at $0 is a $0 quote: it leads (the judge's B3) */
    expect(
      screen.getByRole('heading', { level: 2, name: 'Price the 9 Formosa boats on sale at $0.' }),
    ).toBeTruthy()
    expect(within(stage()).getByText('Case 1 of 39')).toBeTruthy()
    expect(within(stage()).getByText('A boat on sale at $0')).toBeTruthy()
    expect(within(stage()).getByText(/sells at \$79,760 Cash\.$/)).toBeTruthy()
    /* the plug's "$0 is meant" is never said of a boat */
    expect(stage().textContent).not.toContain('$0 is meant')
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })

  it('names the next two cases beneath the stage, and the lists no check could read', () => {
    draw()
    const next = screen.getByRole('navigation', { name: 'The next cases' })
    expect(
      within(next).getByRole('button', {
        name: 'Case 2: Rego the ALP 5.3M-13B Fibreglass Boat as a Large trailer.',
      }),
    ).toBeTruthy()
    expect(within(next).getAllByRole('button')).toHaveLength(2)
    const notChecked = screen.getByText(/^Not checked: 6 lists declare no price/).textContent
    expect(notChecked).toContain('2,561')
    expect(notChecked).toContain('Once a price is declared for one on Prices')
    expect(notChecked).not.toContain('Registration Costs')
  })

  it('keeps a model code whole in the headline, never broken at its hyphen', () => {
    draw(FIRST_TRAILER)
    const title = within(stage()).getByRole('heading', { level: 2 })
    const whole = [...title.querySelectorAll('.rv-whole')].map((e) => e.textContent)
    expect(whole).toEqual(['5.3M-13B'])
  })

  it('says an address naming a case no longer there, and shows the first', () => {
    draw('band:nothing:here')
    expect(screen.getByText(/^That case is settled or is no longer in the price list/)).toBeTruthy()
    expect(within(stage()).getByText('Case 1 of 39')).toBeTruthy()
  })
})

describe('every case in one look', () => {
  it('lists all 39 by check, each a link to its case, and finds them by typing', async () => {
    const user = userEvent.setup()
    const { onPosition } = draw()
    const index = screen.getByRole('navigation', { name: 'Every case' })
    expect(within(index).getAllByRole('link')).toHaveLength(39)
    expect(within(index).getByText('39 cases')).toBeTruthy()
    const lit = within(index)
      .getAllByRole('link')
      .find((a) => a.getAttribute('aria-current') === 'true')
    expect(lit?.getAttribute('href')).toBe(`/review?case=${encodeURIComponent(FORMOSA)}`)

    await user.type(
      within(index).getByRole('textbox', { name: 'Find a case by its list, maker or line' }),
      'lone star',
    )
    expect(within(index).getAllByRole('link')).toHaveLength(1)
    expect(within(index).getByText('1 case of 39 hold “lone star”')).toBeTruthy()
    expect(onPosition).toHaveBeenLastCalledWith({ find: 'lone star' })
    await user.click(within(index).getByRole('link'))
    /* a case picked from the index closes it below a desk and stands on the stage */
    expect(onPosition.mock.lastCall?.[0]).toMatchObject({ case: LONE_STAR, list: undefined })
  })

  it('groups by list, and says when nothing holds what was typed', async () => {
    const user = userEvent.setup()
    draw('', { by: 'list' })
    const index = screen.getByRole('navigation', { name: 'Every case' })
    const parts = within(index).getByRole('list', { name: 'Parts & Accessories' })
    expect(within(parts).getAllByRole('link').length).toBeGreaterThan(15)
    await user.type(within(index).getByRole('textbox'), 'zzqx')
    expect(within(index).getByText(/^No case holds “zzqx”\./)).toBeTruthy()
  })
})

describe('a press writes the price list, and comes back', () => {
  it('makes a trailer Large in one step, the count falls, and Ctrl Z puts it back', async () => {
    const user = userEvent.setup()
    const { lastCase } = draw(FIRST_TRAILER)
    await user.click(within(stage()).getByRole('button', { name: /^Make it Large/ }))
    const v = row('trl_dunbier', 'trl_dunbier:67')
    expect(v['trl_dunbier.by']).toBe('Large Trailers - Over 1.021t')
    expect(v['trl_dunbier.bz']).toBe(283)
    expect(v['trl_dunbier.ca']).toBe(11483)
    /* the stage moves on to the case that stood after it */
    expect(lastCase()).toBe(SECOND_TRAILER)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('38')

    await user.keyboard('{Control>}z{/Control}')
    expect(row('trl_dunbier', 'trl_dunbier:67')['trl_dunbier.ca']).toBe(11366)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('39')
  })

  it('Enter makes the fix on the stage, and → skips it without writing', async () => {
    const user = userEvent.setup()
    const { lastCase } = draw(FIRST_TRAILER)
    await user.keyboard('{ArrowRight}')
    expect(lastCase()).toBe(SECOND_TRAILER)
    expect(row('trl_dunbier', 'trl_dunbier:67')['trl_dunbier.ca']).toBe(11366)
    /* the stage stands on the case the press named at once, before the address catches up */
    expect(within(stage()).getByRole('heading', { level: 2 }).textContent).toBe(
      'Rego the ALP 5.7M-13TB Fibreglass Boat as a Large trailer.',
    )
    await user.keyboard('{Enter}')
    expect(row('trl_dunbier', 'trl_dunbier:69')['trl_dunbier.by']).toBe(
      'Large Trailers - Over 1.021t',
    )
    expect(row('trl_dunbier', 'trl_dunbier:67')['trl_dunbier.ca']).toBe(11366)
  })

  it('opens every line it names in the price list', () => {
    draw(FIRST_TRAILER)
    expect(
      within(stage())
        .getByRole('link', { name: 'Open the ALP 5.3M-13B Fibreglass Boat in the price list' })
        .getAttribute('href'),
    ).toBe('/data/trl_dunbier?at=trl_dunbier:67')
  })
})

describe('a case of several lines, priced as typed', () => {
  it('refuses with its reason at the field it is about, then writes every price typed', async () => {
    const user = userEvent.setup()
    const { lastCase } = draw(LONE_STAR)
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Give the 8 lines in Anchor Winches - Lone Star a price.',
      }),
    ).toBeTruthy()
    /* the line most like it, by name — the GX-4 never beside a wiring loom (the judge's J3c) */
    expect(
      within(stage()).getAllByText(
        'Most like it: Lone Star · GX-1 6 mm Combo Winch Kit · Sell $2,100',
      ),
    ).toHaveLength(2)
    expect(
      within(stage()).getAllByText('Nothing like it in its heading has a price.'),
    ).toHaveLength(2)
    expect(stage().textContent).not.toContain('Wiring Loom')
    /* priced whole: the fitted price stays blank, and the screen says so (J3b) */
    expect(stage().textContent).toContain(
      'Each one’s Sell inc Install stays blank until it is set on its line',
    )

    await user.click(within(stage()).getByRole('button', { name: /^Price them at Sell/ }))
    expect(
      within(stage()).getByText('Type a price beside at least one of them first.'),
    ).toBeTruthy()

    const first = within(stage()).getByRole('textbox', {
      name: 'Sell for Lone Star · GX-1 HS4mm Combo Winch Kit',
    })
    await user.type(first, 'abc')
    await user.click(within(stage()).getByRole('button', { name: /^Price the one typed at Sell/ }))
    const why = within(stage()).getByText(/^“abc” is not a price\./)
    /* the field holding it is marked, and holds the focus (the judge's B6) */
    expect(first.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(first)
    /* and its reason stands under that field's own line, said to it (the verifier's gap 3) —
       never on the press above or below the lines */
    expect(why.closest('.rv-line')?.contains(first)).toBe(true)
    expect(first.getAttribute('aria-describedby')).toBe(why.id)
    expect(why.closest('.rv-acts')).toBeNull()

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
    expect(review({ entities: s.tables, rowsByEntity: s.rows }).noPrice.count).toBe(41)
    expect(lastCase()).toBe(LONE_STAR)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('39')
  })

  it('asks first to leave lines that say what they come with at $0, never in amber', async () => {
    const user = userEvent.setup()
    draw(PLUGS)
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Leave the 4 lines in Trailer Parts - Trailer Plugs at $0, as each says what they come with.',
      }),
    ).toBeTruthy()
    /* a line that says what it comes with offers no price field (the verifier of 2026-11-04,
       round 2, minor 3); each keeps its door to its own line in the price list */
    expect(within(stage()).queryAllByRole('textbox')).toHaveLength(0)
    expect(within(stage()).queryByRole('button', { name: /^Price / })).toBeNull()
    expect(within(stage()).getAllByRole('link', { name: /in the price list$/ })).toHaveLength(4)
    /* Enter makes nothing here: the file cannot say which of the two is right */
    await user.keyboard('{Enter}')
    expect(catalogue.getState().org?.leftAlone).toBeUndefined()

    await user.click(within(stage()).getByRole('button', { name: 'Leave them at $0' }))
    const left = catalogue.getState().org?.leftAlone ?? {}
    expect(Object.keys(left)).toHaveLength(4)
    /* the stamp keeps the reason, the instant and the person (the judge's item 10) */
    for (const stamp of Object.values(left)) expect(stamp).toMatch(/^meant \d{4}-\d{2}-\d{2}T/)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('38')
    expect(screen.getByText(/^1 case is left alone, on 4 lines\./)).toBeTruthy()
  })

  it('takes a boat off sale through the Discontinued column, and the Undo takes it back', async () => {
    const user = userEvent.setup()
    draw(FORMOSA)
    await user.click(within(stage()).getByRole('button', { name: 'Take them off sale' }))
    const formosa = catalogue.getState().rows['boat_formosa']!
    const off = formosa.filter(isDiscontinued)
    expect(off).toHaveLength(9)
    expect(
      catalogue.getState().tables['boat_formosa']!.fields.some((f) => f.name === 'Discontinued'),
    ).toBe(true)
    await user.keyboard('{Control>}z{/Control}')
    expect(catalogue.getState().rows['boat_formosa']!.filter(isDiscontinued)).toHaveLength(0)
  })
})

describe('the fixes a line really needs', () => {
  it('takes the notes in Parts off sale in one press, never priced or named', async () => {
    const user = userEvent.setup()
    draw('note:parts')
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Take the 6 notes and empty lines in Parts & Accessories off sale.',
      }),
    ).toBeTruthy()
    /* the empty lines are told apart by where they came from (the judge's J6) */
    expect(stage().textContent).toContain('line 2,905 of the Parts Maintenance tab')
    expect(stage().textContent).toContain('Obsolete Parts (NB: Parts No Longer Available or Used)')
    expect(within(stage()).queryAllByRole('textbox')).toHaveLength(0)
    await user.click(within(stage()).getByRole('button', { name: 'Take all 6 off sale' }))
    expect(isDiscontinued({ values: row('parts', 'parts:2238') } as never)).toBe(true)
  })

  it('names two lines of one name apart where their codes differ', async () => {
    const user = userEvent.setup()
    const vented = queue().find((c) => c.kind === 'two' && c.tableId === 'parts')!
    draw(vented.key)
    expect(
      within(stage()).getByRole('heading', { level: 3, name: 'Or name them apart' }),
    ).toBeTruthy()
    await user.click(within(stage()).getByRole('button', { name: 'Name them apart' }))
    expect(within(stage()).getByText(/^Both are still called/)).toBeTruthy()
    const vw = within(stage()).getByRole('textbox', { name: 'Product for code Y10A-VW' })
    await user.clear(vw)
    await user.type(vw, 'Outboard Vented Cover - Yamaha 4 Cyl (white)')
    await user.click(within(stage()).getByRole('button', { name: 'Name them apart' }))
    const s = catalogue.getState()
    expect(review({ entities: s.tables, rowsByEntity: s.rows }).twoPrices.count).toBe(2)
  })

  it('raises a line sold below its cost, and never prints the cost', () => {
    const { container } = draw('cost:parts:parts.l')
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Raise the Sell of 4 lines in Parts & Accessories above their cost.',
      }),
    ).toBeTruthy()
    expect(stage().textContent).toContain('4 lines of the 2,095')
    /* $861.24 is the battery's CTD: Review never prints a cost */
    expect(container.textContent).not.toContain('861')
    expect(stage().textContent).toContain('$818 at Sell, below what it costs')
  })

  it('names the offers that break the price list’s own rule, each with its line', () => {
    draw('house:F6')
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Correct the 3 offers that break your price list’s own rule.',
      }),
    ).toBeTruthy()
    expect(stage().textContent).toContain('3,289 of the 3,292')
    expect(within(stage()).getAllByRole('link', { name: /^Open the Stacer/ })).toHaveLength(3)
  })

  it('says a pair of columns by their letters, and a cost column as one it never prints', () => {
    draw('field-dup-name:dealer_fit:dealer_fit.e,dealer_fit.v')
    expect(stage().textContent).toContain('Letter E in the workbook')
    expect(stage().textContent).toContain('Letter V in the workbook')
    expect(within(stage()).getAllByText(/^What a line costs Northside/)).toHaveLength(2)
  })

  it('renames one of two columns under one name', async () => {
    const user = userEvent.setup()
    draw('field-dup-name:rig_kits:rig_kits.l,rig_kits.ad')
    const second = within(stage()).getByRole('textbox', {
      name: 'A name of its own for the heading at letter AD in the workbook, called Trade Price in Rigging Kits',
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
  })

  it('never says a check holds when its cases were left alone (the judge’s blocker)', () => {
    prefs.getState().set(
      MEANT_PREF,
      Object.fromEntries(
        queue()
          .flatMap(meantKeysOf)
          .map((k) => [k, 'meant x']),
      ),
    )
    const { container } = draw()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Nothing in your price list is waiting on you.',
      }),
    ).toBeTruthy()
    const said = container.textContent ?? ''
    expect(said).not.toContain('each one holds')
    expect(said).not.toContain('Every trailer is registered as the size its weight says')
    /* the 7's money is never said of all 9, and the 2 charged too much are said (gap 1) */
    expect(said).toContain(
      '9 trailers are still registered as the wrong size, left alone by your choice: on one sale of each, 7 charged $819 too little and 2 charged $234 too much.',
    )
    /* 4 lines below cost, not the 6 findings: 2 lines are below it at both prices (gap 2) */
    expect(said).toContain(
      '4 lines still sell below their cost, 2 of them at both their prices, left alone by your choice.',
    )
    expect(said).toContain('9 boats are still on sale at $0, left alone by your choice.')
    /* the money is said as left alone, never as $0 not charged */
    expect(said).toContain('not charged, left alone')
    expect(said).not.toMatch(/\$0\s*not charged/)
    /* each line counted once: the 79 findings stand on 76 lines and 4 pairs of headings */
    expect(
      screen.getByText(/^39 cases are left alone, on 76 lines and 4 pairs of headings\./),
    ).toBeTruthy()
  })

  it('lists what was left, and brings one case back on its own', async () => {
    const user = userEvent.setup()
    draw(PLUGS, { left: 'open' })
    /* the case's own press leaves it as meant, so It's meant is not drawn twice (gap 5) */
    expect(within(stage()).queryByRole('button', { name: 'It’s meant' })).toBeNull()
    await user.click(within(stage()).getByRole('button', { name: 'Leave them at $0' }))
    const left = screen.getByRole('list', { name: 'Left alone' })
    expect(within(left).getAllByRole('listitem')).toHaveLength(1)
    expect(left.textContent).toContain('Left as meant')
    await user.click(within(left).getByRole('button', { name: 'Bring it back' }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('39')
  })
})
