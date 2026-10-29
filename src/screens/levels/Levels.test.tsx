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
import { quotes } from '@/state/quotes'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuote } from '@/domain/quote'
import { makeCtx, rowLabel, type EntityDef, type RowData } from '@/domain/model'
import { money } from '@/domain/money'
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
  const again = (next: string) =>
    view.rerender(<Levels list={next} onList={onList} openTheFile={openTheFile} />)
  return { onList, again, ...view }
}

/** the seven boat makers' lists, as the store holds them */
const boats = () =>
  Object.values(catalogue.getState().tables).filter((t) => t.kind === 'boat' && t.role !== 'join')

const opened = () => within(screen.getByTestId('prices-open'))
const group = (name: RegExp) => within(screen.getByRole('region', { name }))

/** the 309 Skimma's Trade figure, as the store holds it */
const skimma = () =>
  catalogue.getState().rows.boat_stacer!.find((r) => r.id === 'boat_stacer:1')!.values[
    'boat_stacer.qt'
  ]

describe('at rest', () => {
  it('asks only what Northside can answer, counted, and opens nothing', () => {
    draw()
    expect(
      screen.getByRole('heading', { level: 1, name: 'What only you can decide about price.' }),
    ).toBeTruthy()
    expect(screen.getByText('Until you answer, every quote prices as it does today.')).toBeTruthy()
    expect(screen.queryByTestId('prices-open')).toBeNull()

    /* four questions, in the order of how many lines each answer prices */
    const choose = screen.getByRole('heading', { level: 2, name: /^Yours to choose/ })
    expect(choose.textContent).toBe('Yours to choose 4')
    const rows = screen
      .getAllByRole('button', { name: /\. Which figure/ })
      .map((b) => b.getAttribute('aria-label')?.split(',')[0])
    expect(rows).toEqual(['Dealer Fit', 'Rigging Kits', 'Yamaha Outboards', 'Factory packages'])
    expect(screen.getAllByText('To choose')).toHaveLength(4)

    expect(
      screen.getByRole('heading', { level: 2, name: /^Settled by your price list/ }).textContent,
    ).toBe('Settled by your price list 10')
  })

  it('reads the Yamahas’ two figures on the F90XB, neither chosen', () => {
    draw()
    const yamaha = screen.getByRole('button', { name: /^Yamaha Outboards, 209/ })
    expect(yamaha.getAttribute('aria-pressed')).toBe('false')
    expect(within(yamaha).getByText('$14,531')).toBeTruthy()
    expect(within(yamaha).getByText('$17,643')).toBeTruthy()
    expect(within(yamaha).getByText('RRP + Freight Inc GST')).toBeTruthy()
  })

  it('says each settled list’s one fact, the different one in its own words', () => {
    draw()
    const settled = group(/^Settled by your price list/)
    expect(settled.getByRole('button', { name: /^Highfield.*67 boats: Trade is 95% of Cash$/ }))
    expect(
      settled.getByRole('button', {
        name: /^Jeanneau, 27 boats: One price for every buyer · 8 with no Trade$/,
      }),
    )
    expect(settled.getByRole('button', { name: /^Haines Signature.*Sold as a factory package$/ }))
    expect(settled.getByRole('button', { name: /^Stacer, 91 boats: One price for every buyer$/ }))
    /* the trailers on sale, as Rules and Fitment count them: the ten obsolete ones are no
       longer sold, so there is no price of theirs to decide (built-critique-m3.md, major 11) */
    expect(settled.getByRole('button', { name: /^Every trailer, 434 trailers: / }))
    expect(screen.queryByText(/444 trailers/)).toBeNull()
  })

  it('says nothing in the engine’s words', () => {
    const { container } = draw()
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })
})

describe('the boundary', () => {
  it('reads Warranty on the Sport 560 on Northside’s ground, switched off', () => {
    const { container } = draw()
    const kept = group(/^Worked from cost/)
    expect(kept.getByText('Northside only')).toBeTruthy()
    expect(kept.getByText('$32,166')).toBeTruthy()
    expect(
      kept.getByText('against Cash $48,350 · 66.5% of Cash, $16,184 under', { exact: false }),
    ).toBeTruthy()
    expect(
      kept.getByText('While it is off, a quote with a line at Warranty cannot be given.', {
        exact: false,
      }),
    ).toBeTruthy()
    /* kept from customers, it is sunk below the page: not yet risen to a plate */
    expect(container.querySelector('.lv-kept:not([data-reach])')).not.toBeNull()
    expect(
      kept.getByRole('switch', { name: 'May reach a customer' }).getAttribute('aria-checked'),
    ).toBe('false')
  })

  it('lets Warranty reach a customer on every boat with one switch, and one Undo takes it back', async () => {
    const user = userEvent.setup()
    const { container } = draw()
    await user.click(screen.getByRole('switch', { name: 'May reach a customer' }))
    /* let out, the well rises to a plate; the badge says so in words, not only by depth */
    expect(container.querySelector('.lv-kept[data-reach]')).not.toBeNull()
    expect(
      group(/^Worked from cost/).getByText('May reach a customer', { selector: 'p' }),
    ).toBeTruthy()
    expect(boats()).toHaveLength(7)
    for (const b of boats())
      expect(b.priceLevels?.find((l) => l.key === 'warranty')?.mayReachCustomer).toBe(true)

    await user.click(within(screen.getByTestId('last-step')).getByRole('button', { name: 'Undo' }))
    for (const b of boats())
      expect(b.priceLevels?.find((l) => l.key === 'warranty')?.mayReachCustomer).not.toBe(true)
  })
})

describe('a list with no price', () => {
  it('counts what a figure would price before it names it, and the list then settles', async () => {
    const user = userEvent.setup()
    const { onList, again } = draw('rig_kits')
    const kits = opened()
    const tiles = ['Kit Sell Price', 'Install Retail Sell', 'Sell Price'].map((name) =>
      kits.getByRole('button', { name: new RegExp(`^${name}, `) }),
    )
    for (const t of tiles) expect(t.getAttribute('aria-pressed')).toBe('false')
    expect(priceLevelsFor(catalogue.getState().tables.rig_kits)).toEqual([])

    /* pressed, it is counted and nothing is written */
    await user.click(tiles[0]!)
    expect(
      kits.getByText(/^628 of 650 rigging kits are priced at their Kit Sell Price/),
    ).toBeTruthy()
    expect(priceLevelsFor(catalogue.getState().tables.rig_kits)).toEqual([])

    await user.click(kits.getByRole('button', { name: 'Price 628 at Kit Sell Price' }))
    expect(
      priceLevelsFor(catalogue.getState().tables.rig_kits).map((l) => [l.key, l.label]),
    ).toEqual([['cash', 'Kit Sell Price']])
    expect(onList).toHaveBeenLastCalledWith('')

    /* folded: it stands under Settled now, with its step and one Undo */
    again('')
    expect(screen.getByRole('heading', { level: 2, name: /^Yours to choose/ }).textContent).toBe(
      'Yours to choose 3',
    )
    const settled = group(/^Settled by your price list/)
    expect(
      settled.getByRole('button', {
        name: /^Rigging Kits.*Priced at Kit Sell Price · 22 not priced$/,
      }),
    )
    await user.click(within(settled.getByTestId('last-step')).getByRole('button', { name: 'Undo' }))
    expect(priceLevelsFor(catalogue.getState().tables.rig_kits)).toEqual([])
  })

  /* THE BUILD'S DOOR (built-critique-m3.md, blocker 1): the Classic 340's build says Northside has
     not chosen which figure prices Dealer Fit Packages and opens the list here by its own id; once
     it is chosen, the step offers the way back to the quote it came from, beside its Undo */
  it('opens the list the build named by its own id, and leads back to the quote once chosen', async () => {
    const user = userEvent.setup()
    const onList = vi.fn<(list: string) => void>()
    const backToQuote = vi.fn<() => void>()
    const props = { onList, openTheFile: () => {}, backToQuote }
    const view = render(<Levels list="dealer_fit" {...props} />)
    const fit = opened()
    const tiles = fit.getAllByRole('button', { name: /, \$[\d,]+$/ })
    expect(tiles.length).toBeGreaterThan(1)
    expect(screen.queryByRole('button', { name: 'Back to the quote' })).toBeNull()

    await user.click(tiles[0]!)
    await user.click(fit.getByRole('button', { name: /^Price [\d,]+ at / }))
    expect(priceLevelsFor(catalogue.getState().tables.dealer_fit)).toHaveLength(1)
    view.rerender(<Levels list="" {...props} />)
    const step = screen.getByTestId('last-step')
    await user.click(within(step).getByRole('button', { name: 'Back to the quote' }))
    expect(backToQuote).toHaveBeenCalledTimes(1)
    await user.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(priceLevelsFor(catalogue.getState().tables.dealer_fit)).toEqual([])
  })

  /* THE LIST IS READ ON THE QUOTE'S OWN LINE (built-critique-m3-2.md, major 2): from the Classic
     340's finale Prices showed the VHF Radio's $982 or $249 while the quote carried the Tube
     Covers. The line is read off a quote filed in the store, as the build files one. */
  it('reads the list on the line the quote that sent the dealer here carries', async () => {
    const sheet = catalogue.getState()
    const hull = pack.byKey('boat_highfield')
    const ctx = makeCtx({
      entities: sheet.tables as Record<string, EntityDef>,
      rowsByEntity: sheet.rows as Record<string, RowData[]>,
      views: { ...sheet.views },
      modules: pack.ctx.modules,
      priceLevels: pack.ctx.priceLevels,
      orgId: 'northside',
    })
    const cl340 = (sheet.rows[hull.id] ?? []).find((r) => rowLabel(hull, r).includes('CL340'))!
    const minted = mintQuote(ctx, {
      viewId: createViewFor(ctx, hull.id).id,
      rowId: cl340.id,
      reference: 'NSM-TEST',
    })!
    const fit = sheet.tables.dealer_fit!
    const tube = sheet.rows.dealer_fit!.find((r) => rowLabel(fit, r).includes('PVC Boat - 3.4'))!
    const onTheQuote = minted.quote.lines.some((l) => l.rowId === tube.id)
      ? minted.quote
      : {
          ...minted.quote,
          lines: [
            ...minted.quote.lines,
            {
              ...minted.quote.lines[0]!,
              id: 'line-tube-covers',
              entityId: fit.id,
              rowId: tube.id,
              label: rowLabel(fit, tube),
              unitPrice: null,
            },
          ],
        }
    quotes.getState().file(onTheQuote, minted.event)

    const props = { onList: () => {}, openTheFile: () => {}, backToQuote: () => {} }
    render(<Levels list="dealer_fit" quote={onTheQuote.id} {...props} />)
    const open = opened()
    expect(open.getByText('On your quote')).toBeTruthy()
    expect(open.getByText(/Tube Covers to suit PVC Boat/)).toBeTruthy()
    expect(open.queryByText(/VHF Radio/)).toBeNull()
    /* its own two figures, as the price list holds them on that line */
    const act = fit.fields.find((f) => f.name === 'Act Sell')!
    const figure = Number(tube.values[act.id])
    expect(figure).toBeGreaterThan(0)
    expect(open.getByRole('button', { name: `Act Sell, ${money(figure)}` })).toBeTruthy()
  })

  it('offers no way back to a quote when Prices was not opened from one', () => {
    draw('dealer_fit')
    expect(screen.getByTestId('prices-open')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Back to the quote' })).toBeNull()
  })
})

describe('the motor’s two figures', () => {
  it('shows RRP + Freight on every Yamaha only when written, and then keeps it Northside’s until it may reach a customer', async () => {
    const user = userEvent.setup()
    const { again } = draw('mot_yamaha')
    await user.click(opened().getByRole('button', { name: 'RRP + Freight Inc GST, $17,643' }))
    expect(
      opened().getByText(/the F90XB goes from \$14,531 to \$17,643/, { exact: false }),
    ).toBeTruthy()
    await user.click(opened().getByRole('button', { name: 'Show RRP + Freight Inc GST' }))

    const motor = catalogue.getState().tables.mot_yamaha!
    const cash = priceLevelsFor(motor).find((l) => l.key === 'cash')!
    expect([cash.label, cash.named]).toEqual(['RRP + Freight Inc GST', true])
    const f90xb = catalogue.getState().rows.mot_yamaha!.find((r) => r.id === 'mot_yamaha:56')!
    expect(frozenMayReach(freezeLevels(motor, f90xb.values)[0]!)).toBe(false)

    /* it stands on Northside's ground now, beside Warranty, with its own switch */
    again('')
    const kept = group(/^Worked from cost/)
    expect(kept.getByRole('heading', { name: /^RRP \+ Freight Inc GST on every Yamaha motor/ }))
    const switches = kept.getAllByRole('switch', { name: 'May reach a customer' })
    expect(switches).toHaveLength(2)
    await user.click(switches[1]!)
    const after = catalogue.getState().tables.mot_yamaha!
    expect(frozenMayReach(freezeLevels(after, f90xb.values)[0]!)).toBe(true)
  })
})

describe('a share of Cash, written into every line', () => {
  it('counts Stacer before it writes, writes 91 Trade figures as one step, and one Undo puts all 91 back', async () => {
    const user = userEvent.setup()
    const { onList, again } = draw('boat_stacer')
    const stacer = opened()
    const field = stacer.getByRole('textbox', { name: 'Trade as a share of Cash, in per cent' })
    expect((field as HTMLInputElement).value).toBe('100')
    /* at today's share nothing would be written, and it says why, with no act to press */
    expect(
      stacer.getByText('Every Stacer boat with a Cash figure already holds 100% of it as Trade.'),
    ).toBeTruthy()
    expect(stacer.queryByRole('button', { name: /^Write/ })).toBeNull()

    await user.clear(field)
    await user.type(field, '95')
    const census = stacer.getByTestId('census')
    expect(census.textContent?.replace(/\s+/g, ' ')).toBe(
      '91 written · 91 equal Cash today · 0 already · 0 with no Cash · 309 Skimma $1,730 → $1,643',
    )
    expect(skimma()).toBe(1730)

    await user.click(stacer.getByRole('button', { name: 'Write 91 Trade figures' }))
    expect(skimma()).toBe(1643)
    const step = catalogue.getState().events.at(-1)!
    expect(step.said).toBe('Trade is 95% of Cash on 91 Stacer boats.')
    expect(step.events).toHaveLength(91)
    expect(onList).toHaveBeenLastCalledWith('')

    /* folded back: the tile says its new fact, and its one Undo stands under it */
    again('')
    const settled = group(/^Settled by your price list/)
    expect(settled.getByRole('button', { name: /^Stacer, 91 boats: Trade is 95% of Cash$/ }))
    const line = within(settled.getByTestId('last-step'))
    expect(line.getByText('Trade is 95% of Cash on 91 Stacer boats.')).toBeTruthy()
    await user.click(line.getByRole('button', { name: 'Undo' }))
    expect(skimma()).toBe(1730)
    const undone = within(settled.getByTestId('last-step'))
    /* the undo says the price is NO LONGER so, before the claim (built-critique-m3 §3) */
    expect(
      undone.getByText('Undone. No longer so: Trade is 95% of Cash on 91 Stacer boats.'),
    ).toBeTruthy()
    expect(undone.queryByText(/^Undone — Trade/)).toBeNull()
    await user.click(undone.getByRole('button', { name: 'Put it back' }))
    expect(skimma()).toBe(1643)
  })

  it('refuses a share above Cash with its reason, where it was typed', async () => {
    const user = userEvent.setup()
    draw('boat_stacer')
    const field = opened().getByRole('textbox', { name: 'Trade as a share of Cash, in per cent' })
    await user.clear(field)
    await user.type(field, '120')
    expect(
      opened().getByText(
        'Above 100% of Cash, a trade buyer would pay more than a customer off the street.',
      ),
    ).toBeTruthy()
    expect(opened().queryByRole('button', { name: /^Write/ })).toBeNull()
  })

  it('says a list with no Trade price stays at its own price for a trade buyer, as a fact', () => {
    draw('trailers:trl_redco')
    expect(
      opened().getByText(
        'No Trade price on this list, so a trade buyer’s quote stays at Sell inc Rego.',
      ),
    ).toBeTruthy()
  })
})
