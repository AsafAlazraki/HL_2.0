/* ============================================================
   PRICES, by role and text, on the real price list. What the screen
   says is read the way a person reads it; what it writes is read back
   out of the store it wrote it in, and a quote line priced after it.
   ============================================================ */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { engineWordsIn } from '@/screens/configurator/say'
import { freezeLevels, priceLevelsFor } from '@/domain/quote/pricing'
import { frozenMayReach } from '@/domain/pricing/worked'
import { Levels } from './Levels'

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

beforeEach(async () => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
})

function draw(list = '') {
  const onList = vi.fn<(list: string) => void>()
  const openTheFile = vi.fn<() => void>()
  const view = render(<Levels list={list} onList={onList} openTheFile={openTheFile} />)
  return { onList, openTheFile, ...view }
}

const opened = () => within(screen.getByTestId('prices-open'))

/** the 309 Skimma's Trade figure, as the store holds it */
const skimma = () =>
  catalogue.getState().rows.boat_stacer!.find((r) => r.id === 'boat_stacer:1')!.values[
    'boat_stacer.qt'
  ]

describe('at rest', () => {
  it('asks which price each customer pays, and opens on the Yamahas, which nobody has chosen for', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1, name: 'Which price each customer pays.' }))
    const yamaha = opened()
    expect(screen.getByRole('region', { name: 'Prices of Yamaha Outboards' })).toBeTruthy()
    expect(yamaha.getByRole('heading', { name: 'Which figure does a customer’s quote print?' }))
    /* the F90XB's two figures, side by side, neither chosen */
    const sell = yamaha.getByRole('button', { name: 'Sell Price, $14,531' })
    const rrp = yamaha.getByRole('button', { name: 'RRP + Freight Inc GST, $17,643' })
    expect(sell.getAttribute('aria-pressed')).toBe('false')
    expect(rrp.getAttribute('aria-pressed')).toBe('false')
    expect(
      yamaha.getByText(
        'Nobody has chosen. Until you do, a quote prints Sell Price, as it always has.',
      ),
    ).toBeTruthy()
  })

  it('says a list with no Trade price stays at its Cash, as a fact', () => {
    draw('trailers:trl_redco')
    expect(
      opened().getByText(
        'No Trade price on this list, so a trade buyer’s quote stays at Sell inc Rego.',
      ),
    ).toBeTruthy()
  })

  it('says nothing in the engine’s words', () => {
    const { container } = draw()
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })
})

describe('the motor’s two figures', () => {
  it('points a Yamaha quote at RRP + Freight, which starts as Northside’s only, until it may reach a customer', async () => {
    const user = userEvent.setup()
    const { rerender, onList, openTheFile } = draw()
    await user.click(opened().getByRole('button', { name: 'RRP + Freight Inc GST, $17,643' }))

    const motor = catalogue.getState().tables.mot_yamaha!
    const cash = priceLevelsFor(motor).find((l) => l.key === 'cash')!
    expect([cash.label, cash.named]).toEqual(['RRP + Freight Inc GST', true])
    const f90xb = catalogue.getState().rows.mot_yamaha!.find((r) => r.id === 'mot_yamaha:56')!
    expect(frozenMayReach(freezeLevels(motor, f90xb.values)[0]!)).toBe(false)

    rerender(<Levels list="mot_yamaha" onList={onList} openTheFile={openTheFile} />)
    expect(
      opened()
        .getByRole('button', { name: 'RRP + Freight Inc GST, $17,643' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    await user.click(opened().getByRole('switch', { name: 'May reach a customer' }))
    const after = catalogue.getState().tables.mot_yamaha!
    expect(frozenMayReach(freezeLevels(after, f90xb.values)[0]!)).toBe(true)
  })
})

describe('a share of Cash, written into every line', () => {
  it('counts Stacer before it writes, writes 91 Trade figures as one step, and one undo puts them back', async () => {
    const user = userEvent.setup()
    draw('boat_stacer')
    const stacer = opened()
    const field = stacer.getByRole('textbox', { name: 'Trade as a share of Cash, in per cent' })
    expect((field as HTMLInputElement).value).toBe('100')
    /* at today's share nothing would change, and the button says why where it is */
    expect(
      stacer.getByText('Every Stacer boat with a Cash figure already holds 100% of it as Trade.'),
    ).toBeTruthy()

    await user.clear(field)
    await user.type(field, '95')
    expect(stacer.getByText('Trade figures written').previousElementSibling?.textContent).toBe('91')
    expect(stacer.getByText('309 Skimma: $1,730 →', { exact: false })).toBeTruthy()

    await user.click(stacer.getByRole('button', { name: 'Set on 91 Stacer boats' }))
    expect(skimma()).toBe(1643)
    const step = catalogue.getState().events.at(-1)!
    expect(step.said).toBe('Trade is 95% of Cash on 91 Stacer boats.')
    expect(step.events).toHaveLength(91)

    catalogue.getState().undo(step.id)
    expect(skimma()).toBe(1730)
  })

  it('keeps the write’s Undo on the screen under the act, says the undo, and offers to put it back', async () => {
    const user = userEvent.setup()
    draw('boat_stacer')
    const stacer = opened()
    const field = stacer.getByRole('textbox', { name: 'Trade as a share of Cash, in per cent' })
    await user.clear(field)
    await user.type(field, '95')
    await user.click(stacer.getByRole('button', { name: 'Set on 91 Stacer boats' }))

    /* the step line, not a toast: it is inside the open list's figures and stays there */
    const step = within(stacer.getByTestId('last-step'))
    expect(step.getByText('Trade is 95% of Cash on 91 Stacer boats.')).toBeTruthy()
    expect(stacer.queryByText('One Undo puts every one back.')).toBeNull()

    await user.click(step.getByRole('button', { name: 'Undo' }))
    expect(skimma()).toBe(1730)
    const undone = within(stacer.getByTestId('last-step'))
    expect(undone.getByText('Undone — Trade is 95% of Cash on 91 Stacer boats.')).toBeTruthy()

    await user.click(undone.getByRole('button', { name: 'Put it back' }))
    expect(skimma()).toBe(1643)
    expect(within(stacer.getByTestId('last-step')).getByRole('button', { name: 'Undo' }))
  })
})

describe('a press that changes nothing', () => {
  it('says so, where it was pressed, rather than nothing at all', async () => {
    const user = userEvent.setup()
    draw('mot_yamaha')
    const sell = () => opened().getByRole('button', { name: 'Sell Price, $14,531' })
    await user.click(sell())
    expect(within(opened().getByTestId('last-step')).getByRole('button', { name: 'Undo' }))
    await user.click(sell())
    const said = within(opened().getByTestId('last-step'))
    expect(
      said.getByText('Sell Price is already the figure every Yamaha motor is quoted at.'),
    ).toBeTruthy()
    /* nothing was written, so there is nothing to undo */
    expect(said.queryByRole('button', { name: 'Undo' })).toBeNull()
  })
})

describe('the heads count what Data counts', () => {
  it('counts Highfield in models, as every maker is counted, and names its lines as finishes', () => {
    draw('boat_highfield')
    const head = screen.getByRole('button', { name: /^Highfield.*, 67 models$/ })
    expect(head.textContent).toContain('67')
    expect(opened().getByText('67 models, in 588 finishes')).toBeTruthy()
  })
})

describe('a list with no price', () => {
  it('names Rigging Kits’ price from its own figures, none chosen for it', async () => {
    const user = userEvent.setup()
    draw('rig_kits')
    const kits = opened()
    expect(kits.getByRole('heading', { name: 'Name the price' })).toBeTruthy()
    const choices = ['Kit Sell Price', 'Install Retail Sell', 'Sell Price'].map((name) =>
      kits.getByRole('button', { name: new RegExp(`^${name}, `) }),
    )
    for (const c of choices) expect(c.getAttribute('aria-pressed')).toBe('false')
    expect(priceLevelsFor(catalogue.getState().tables.rig_kits)).toEqual([])

    await user.click(choices[0]!)
    expect(
      priceLevelsFor(catalogue.getState().tables.rig_kits).map((l) => [l.key, l.label]),
    ).toEqual([['cash', 'Kit Sell Price']])
  })
})

describe('the fence', () => {
  it('keeps Warranty Northside’s until one switch lets it reach a customer on every boat list', async () => {
    const user = userEvent.setup()
    draw()
    expect(
      screen.getByText('While it is off, a quote with a line at Warranty cannot be given.'),
    ).toBeTruthy()
    await user.click(screen.getByRole('switch', { name: 'May reach a customer' }))
    const boats = Object.values(catalogue.getState().tables).filter(
      (t) => t.kind === 'boat' && t.role !== 'join',
    )
    expect(boats).toHaveLength(7)
    for (const b of boats)
      expect(b.priceLevels?.find((l) => l.key === 'warranty')?.mayReachCustomer).toBe(true)
  })
})

describe('at the desk, one ladder', () => {
  it('draws the ordinary quiet and only what differs filled, Northside’s ground under the fence', () => {
    const wide = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('min-width: 1200px'),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    )
    const { container } = draw()
    const ladder = within(screen.getByRole('region', { name: 'Every price, list by list' }))
    /* fourteen lists in two flights of seven — the boats, then what is sold with them — each a
       head that opens its figures */
    expect(container.querySelectorAll('[data-head]')).toHaveLength(14)
    expect(container.querySelectorAll('.lv-flight')).toHaveLength(2)
    const differs = [...container.querySelectorAll('.lv-cell[data-tone="differs"]')].map(
      (c) => c.textContent,
    )
    expect(differs).toContain('95% of Cash')
    expect(differs).toContain('30 of 39 priced')
    expect(differs).toContain('Same as Cash · 8 have none')
    const asks = container.querySelectorAll('.lv-cell[data-tone="ask"]')
    /* the Yamahas' two figures, the factory packages, Dealer Fit and Rigging Kits */
    expect(asks).toHaveLength(4)
    expect(ladder.getAllByText('Same as Cash').length).toBeGreaterThan(3)
    expect(container.querySelector('.lv-night[data-ground="night"]')?.textContent).toContain(
      'Northside only',
    )
    /* a cell never says its list's count again: the head says it once */
    expect(ladder.queryByText(/^all d/)).toBeNull()
    expect(ladder.getAllByText('All priced').length).toBeGreaterThan(3)
    wide.mockRestore()
  })
})
