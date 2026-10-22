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

function draw(open: ReviewProps['open'] = '') {
  const onOpen = vi.fn<ReviewProps['onOpen']>()
  const openList = vi.fn<ReviewProps['openList']>()
  const openTheFile = vi.fn<() => void>()
  const view = render(
    <Review open={open} onOpen={onOpen} openList={openList} openTheFile={openTheFile} />,
  )
  return { onOpen, openList, openTheFile, ...view }
}

const sportski = (): Record<string, unknown> =>
  catalogue.getState().rows['trl_gfab']!.find((r) => r.id === 'trl_gfab:27')!.values

describe('the first look', () => {
  it('puts the money in the head, counted off the file', () => {
    draw()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'What is wrong in your price list, with the fix beside it.',
      }),
    ).toBeTruthy()
    expect(screen.getByText('registration not charged on 7 trailers')).toBeTruthy()
    expect(screen.getByText('charged over on 2')).toBeTruthy()
    expect(screen.getByText('names at two prices')).toBeTruthy()
    expect(screen.getByText('on sale with no price')).toBeTruthy()
    /* $819 and $234: 7 × $117 and 2 × $117, read as text whatever the figure is drawn with */
    expect(document.body.textContent).toContain('$819')
    expect(document.body.textContent).toContain('$234')
  })

  it('opens the first check that costs something, with the nine trailers and the fix beside each', () => {
    draw()
    const grid = within(screen.getByRole('grid', { name: 'The checks' }))
    expect(grid.getByText('Registered as the wrong size')).toBeTruthy()
    expect(grid.getByText(/430 trailers checked/)).toBeTruthy()
    expect(grid.getByText('7 weigh over 1,020 kg and are registered Small, at $166.')).toBeTruthy()
    expect(
      grid.getByText('2 weigh 1,020 kg or less and are registered Large, at $283.'),
    ).toBeTruthy()
    /* each wrong trailer's press is the row as it would read */
    const presses = grid.getAllByRole('button', { name: /: make it (Large|Small) at/ })
    expect(presses).toHaveLength(9)
    expect(
      grid.getByRole('button', {
        name: 'Offroad Single Sportski Trailer: make it Large at $283, sells at $16,273, +$117',
      }),
    ).toBeTruthy()
    /* one dark act for the check, and only one */
    expect(grid.getAllByRole('button', { name: /^Fix the next/ })).toHaveLength(1)
  })

  it('lists every other check folded, each with its count', () => {
    draw()
    const grid = within(screen.getByRole('grid', { name: 'The checks' }))
    for (const name of [
      'One name, two prices',
      'On sale with no price',
      'Two under one name',
      'Nothing to name it',
      'Tidy',
    ])
      expect(grid.getByText(name)).toBeTruthy()
    expect(grid.getAllByRole('button', { name: 'Open' })).toHaveLength(5)
  })

  it('says nothing in the engine’s words', () => {
    const { container } = draw()
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })
})

describe('a fix, written and taken back', () => {
  it('writes one trailer’s rego, fee and price in one press, and the head counts down', async () => {
    const user = userEvent.setup()
    draw()
    await user.click(
      screen.getByRole('button', {
        name: 'Offroad Single Sportski Trailer: make it Large at $283, sells at $16,273, +$117',
      }),
    )
    expect(sportski()['trl_gfab.by']).toBe('Large Trailers - Over 1.021t')
    expect(sportski()['trl_gfab.bz']).toBe(283)
    expect(sportski()['trl_gfab.ca']).toBe(16273)
    expect(screen.getByText('registration not charged on 6 trailers')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /: make it (Large|Small) at/ })).toHaveLength(8)

    /* the step is the store's own, and its way back puts all three cells back */
    const back = catalogue.getState().undo()
    expect('next' in back).toBe(true)
    expect(sportski()['trl_gfab.ca']).toBe(16156)
    expect(sportski()['trl_gfab.by']).toBe('Small Trailers - Up to 1.02t')
  })

  it('steps through the trailers one at a time from the check’s one act', async () => {
    const user = userEvent.setup()
    draw()
    await user.click(screen.getByRole('button', { name: /^Fix the next · \+\$117$/ }))
    expect(screen.getAllByRole('button', { name: /: make it (Large|Small) at/ })).toHaveLength(8)
    await user.click(screen.getByRole('button', { name: /^Fix the next · \+\$117$/ }))
    expect(screen.getAllByRole('button', { name: /: make it (Large|Small) at/ })).toHaveLength(7)
  })
})

describe('grouped by the press that clears several', () => {
  it('draws 147 lines with no price as their groups, the largest first, each with its two presses', () => {
    draw('none')
    const grid = within(screen.getByRole('grid', { name: 'The checks' }))
    expect(grid.getByText(/· 138 lines by their own category, read at Sell/)).toBeTruthy()
    expect(grid.getByText('Labour Estimates')).toBeTruthy()
    expect(grid.getByRole('button', { name: 'Leave the 86 as meant' })).toBeTruthy()
    expect(grid.getAllByRole('button', { name: /^Price (them|it)$/ })).toHaveLength(21)
    /* Haines Signature is said once, as what is not counted, and never as a fault */
    expect(grid.getByText(/Haines Signature’s 9 boats are sold as a factory package/)).toBeTruthy()
  })

  it('leaves a group as meant: it goes, the count goes with it, and the foot brings it back', async () => {
    const user = userEvent.setup()
    draw('none')
    await user.click(screen.getByRole('button', { name: 'Leave the 86 as meant' }))
    expect(screen.queryByText('Labour Estimates')).toBeNull()
    expect(screen.getByText(/^86 lines are left as meant\./)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Bring them back' }))
    expect(screen.getByText('Labour Estimates')).toBeTruthy()
  })

  it('opens the price list at the first of a group to price it', async () => {
    const user = userEvent.setup()
    const { openList } = draw('none')
    await user.click(screen.getAllByRole('button', { name: 'Price them' })[0]!)
    expect(openList).toHaveBeenCalledWith('parts', expect.stringMatching(/^parts:/))
  })
})

describe('named in place', () => {
  it('names a line with nothing to name it, and the check counts one fewer', async () => {
    const user = userEvent.setup()
    draw('nameless')
    const fields = screen.getAllByRole('textbox')
    expect(fields).toHaveLength(7)
    await user.type(fields[0]!, 'KR 2010 Series')
    await user.click(screen.getAllByRole('button', { name: 'Name it' })[0]!)
    expect(
      catalogue.getState().rows['trl_mackay']!.find((r) => r.id === 'trl_mackay:123')?.values[
        'trl_mackay.c'
      ],
    ).toBe('KR 2010 Series')
    expect(screen.getAllByRole('textbox')).toHaveLength(6)
  })

  it('refuses an empty name with its reason only once it is asked for', async () => {
    const user = userEvent.setup()
    draw('nameless')
    expect(screen.queryByText('Type its name first.')).toBeNull()
    await user.click(screen.getAllByRole('button', { name: 'Name it' })[0]!)
    expect(screen.getByText('Type its name first.')).toBeTruthy()
  })

  it('tells two under one name apart, and never shows a cost', () => {
    draw('twins')
    const grid = within(screen.getByRole('grid', { name: 'The checks' }))
    expect(grid.getAllByText(/^Two called/)).toHaveLength(4)
    expect(grid.getByText('The first, after Kit Sell Price')).toBeTruthy()
    expect(grid.getAllByText('a cost, not shown here').length).toBeGreaterThan(0)
  })
})

describe('the clean day', () => {
  it('keeps every check’s line and reads each as a true sentence with its tick', async () => {
    /* a price list of one list with nothing wrong in it: the fee list alone */
    const fees = pack.entities.filter((e) => e.id === 'registration')
    await catalogue.getState().load({
      entities: fees,
      rowsByEntity: { registration: pack.rowsByEntity['registration']! },
    })
    draw()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nothing in your price list needs you.' }),
    ).toBeTruthy()
    const grid = within(screen.getByRole('grid', { name: 'The checks' }))
    for (const sentence of [
      'Every trailer is registered as the size its weight says.',
      'Every name on sale has one price.',
      'Everything on sale has a price.',
      'Nothing in a list shares a name with another.',
      'Every line on sale has a name.',
    ])
      expect(grid.getByText(sentence)).toBeTruthy()
    /* no money strip of zeros, and nothing to open where nothing is wrong */
    expect(screen.queryByText(/not charged/)).toBeNull()
    expect(grid.queryAllByRole('button', { name: 'Open' }).length).toBeLessThanOrEqual(1)
  })

  it('asks for the price list where there is none, rather than calling it clean', async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
    const { openTheFile } = draw()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Load the Master Price File' }))
    expect(openTheFile).toHaveBeenCalled()
  })
})
