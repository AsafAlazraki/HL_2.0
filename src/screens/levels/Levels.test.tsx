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
      .getAllByRole('button', { name: /\. (Which figure|How is|Your price list names no price)/ })
      .map((b) => b.getAttribute('aria-label')?.split(',')[0])
    expect(rows).toEqual(['Dealer Fit', 'Rigging Kits', 'Yamaha Outboards', 'Factory packages'])
    expect(screen.getAllByText('To choose')).toHaveLength(4)

    expect(screen.getByRole('heading', { level: 2, name: /^Settled/ }).textContent).toBe(
      'Settled 10',
    )
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
    const settled = group(/^Settled/)
    /* the boats, and the finishes its panel counts (the verifier of Prices, round 2) */
    expect(
      settled.getByRole('button', {
        name: /^Highfield.*67 boats, 588 finishes: Trade is 95% of Cash$/,
      }),
    )
    /* never "one price for every buyer" over eight boats a trade buyer cannot be priced on */
    expect(
      settled.getByRole('button', {
        name: /^Jeanneau, 27 boats: Trade is Cash on 19 · 8 with no Trade$/,
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
    const kept = group(/^Kept from customers/)
    expect(kept.getByText('Northside only')).toBeTruthy()
    expect(kept.getByText('$32,166')).toBeTruthy()
    expect(kept.getByText('against Cash $48,350 · 66.5% of Cash,', { exact: false })).toBeTruthy()
    /* the gap is one phrase that never breaks: "$16,184 under", never "$16,184 ⏎ under" */
    expect(kept.getByText('$16,184 under').className).toBe('lv-nowrap')
    /* and every maker's Warranty across its list, the eight Stacer boats above Cash named */
    expect(container.querySelector('.lv-range')?.textContent).toBe(
      'Stacer93–110% of Cash on 91 boats',
    )
    expect(kept.getByText(/^Above Cash on 8 Stacer boats:/)).toBeTruthy()
    expect(
      kept.getByRole('link', { name: 'Open the 8 with Warranty above Cash' }).getAttribute('href'),
    ).toBe('/data/boat_stacer?only=under~boat_stacer.qr~boat_stacer.rb')
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
      group(/^Kept from customers/).getByText('May reach a customer', { selector: 'p' }),
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
  it('asks how a kit is sold, counts what a way would price before it names it, and the list then settles', async () => {
    const user = userEvent.setup()
    const { onList, again } = draw('rig_kits')
    const kits = opened()
    /* two ways, never the fitting labour alone as a rival to the kit (the judge, L6) */
    const tiles = ['Supplied, or fitted', 'Always fitted'].map((name) =>
      kits.getByRole('button', { name: new RegExp(`^${name}, `) }),
    )
    for (const t of tiles) expect(t.getAttribute('aria-pressed')).toBe('false')
    expect(kits.queryByRole('button', { name: /^Install Retail Sell, / })).toBeNull()
    /* each figure says what it is */
    expect(kits.getAllByText(/^The kit alone, supplied and not fitted/).length).toBeGreaterThan(0)
    expect(priceLevelsFor(catalogue.getState().tables.rig_kits)).toEqual([])

    /* pressed, it is counted and nothing is written */
    await user.click(tiles[0]!)
    expect(
      kits.getByText(/^600 of 615 rigging kits are priced at their Kit Sell Price/),
    ).toBeTruthy()
    expect(kits.getByText(/^No quote on this computer carries a rigging kit/)).toBeTruthy()
    expect(priceLevelsFor(catalogue.getState().tables.rig_kits)).toEqual([])

    await user.click(kits.getByRole('button', { name: 'Price 600 kits supplied, or fitted' }))
    expect(
      priceLevelsFor(catalogue.getState().tables.rig_kits).map((l) => [l.key, l.fieldId]),
    ).toEqual([
      ['cash', 'rig_kits.k'],
      ['trade', 'rig_kits.l'],
      ['fitted', 'rig_kits.ac'],
      /* the file's own fitted trade figure, Rigging Kits!AD (the verifier, 2026-11-04) */
      ['fitted-trade', 'rig_kits.ad'],
    ])
    expect(onList).toHaveBeenLastCalledWith('')

    /* folded: it stands under Settled now, with its step and one Undo */
    again('')
    expect(screen.getByRole('heading', { level: 2, name: /^Yours to choose/ }).textContent).toBe(
      'Yours to choose 3',
    )
    const settled = group(/^Settled/)
    /* the kits on sale: 650 less 28 discontinued and 7 banner rows (the verifier, round 2) */
    expect(settled.getByRole('button', { name: /^Rigging Kits, 615 kits: .* · 15 not priced$/ }))
    const step = within(settled.getByTestId('last-step'))
    expect(
      step.getByText(
        '600 of 615 rigging kits are priced at their Kit Sell Price, a trade buyer at Trade Price, fitted at Sell Price and fitted for a trade buyer at Trade Price, from the next quote. The other 15 have no Kit Sell Price a quote can read, so they are still priced by hand.',
      ),
    ).toBeTruthy()

    /* opened, every figure the file carries stands once, the four a quote reads marked, and who
       chose it is kept with the price list (the verifier, 2026-11-04) */
    again('rig_kits')
    const grid = within(opened().getByRole('table'))
    expect(grid.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Sold',
      'A customer',
      'A trade buyer',
      'A sub-dealer',
    ])
    expect(grid.getAllByText('On a quote')).toHaveLength(4)
    expect(grid.getByText('AD · on 612')).toBeTruthy()
    expect(grid.getByText('X · on 612')).toBeTruthy()
    expect(grid.getByText('AE · on 612')).toBeTruthy()
    /* on the kits on sale the file's own arithmetic holds on every one */
    expect(
      opened().getByText(
        'Fitted is supplied plus fitting: for a customer on all 612, for a trade buyer on all 612, for a sub-dealer on all 612.',
      ),
    ).toBeTruthy()
    expect(
      opened().getByText(/^“Supplied, or fitted” was chosen at .* today\. Press another/),
    ).toBeTruthy()
    /* each way names its prices once; what each is, and every figure, is the grid's (the verifier,
       round 2: the settled tiles gave every figure the grid gives) */
    expect(opened().queryAllByText(/^The kit alone, supplied and not fitted/)).toHaveLength(0)
    const supplied = opened().getByRole('button', { name: /^Supplied, or fitted: / })
    expect(within(supplied).queryByText('$900')).toBeNull()
    /* the 21 kits whose fitted price stood under the kit alone are none of them on sale */
    expect(opened().queryByText(/Sell Price is under Kit Sell Price/)).toBeNull()

    again('')
    await user.click(
      within(group(/^Settled/).getByTestId('last-step')).getByRole('button', { name: 'Undo' }),
    )
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
  /* the verifier of Prices, 2026-11-04, a blocker: RRP + Freight was kept from customers as worked
     from cost, a formula that holds on 0 of 209 Yamaha lines (worked.pack.test.ts) */
  it('shows RRP + Freight on every Yamaha only when written, and a quote at it can be given', async () => {
    const user = userEvent.setup()
    const { again } = draw('mot_yamaha')
    await user.click(opened().getByRole('button', { name: 'RRP + Freight Inc GST, $17,643' }))
    expect(
      opened().getByText(/the F90XB goes from \$14,531 to \$17,643/, { exact: false }),
    ).toBeTruthy()
    /* the two read against each other over all 209, never on one motor (the judge, L3) */
    expect(
      opened().getByText(
        /On the 209 lines holding both, RRP \+ Freight Inc GST is 1\.01–1\.26 × Sell Price/,
      ),
    ).toBeTruthy()
    await user.click(opened().getByRole('button', { name: 'Show RRP + Freight Inc GST' }))

    const motor = catalogue.getState().tables.mot_yamaha!
    const cash = priceLevelsFor(motor).find((l) => l.key === 'cash')!
    expect([cash.label, cash.named]).toEqual(['RRP + Freight Inc GST', true])
    const f90xb = catalogue.getState().rows.mot_yamaha!.find((r) => r.id === 'mot_yamaha:56')!
    expect(frozenMayReach(freezeLevels(motor, f90xb.values)[0]!)).toBe(true)

    /* nothing is kept from customers but Warranty, with its one switch */
    again('')
    const kept = group(/^Kept from customers/)
    expect(kept.queryByRole('heading', { name: /^RRP \+ Freight Inc GST/ })).toBeNull()
    expect(kept.getAllByRole('switch', { name: 'May reach a customer' })).toHaveLength(1)
    expect(screen.queryByText(/Starts as Northside’s own/)).toBeNull()
  })
})

describe('a share of Cash, written into every line', () => {
  it('counts Stacer before it writes, writes 91 Trade figures as one step, and one Undo puts all 91 back', async () => {
    const user = userEvent.setup()
    const { onList, again } = draw('boat_stacer')
    const stacer = opened()
    const field = stacer.getByRole('textbox', { name: 'Trade as a share of Cash, in per cent' })
    expect((field as HTMLInputElement).value).toBe('100')
    /* at today's share nothing would be written: today's share is said once, with no act to press
       (the verifier, round 2: it was said twice) */
    expect(
      stacer.getByText('Today Trade is the same as Cash on every Stacer boat that has one.'),
    ).toBeTruthy()
    expect(stacer.queryByText(/already holds 100% of it as Trade/)).toBeNull()
    expect(stacer.queryByRole('button', { name: /^Write/ })).toBeNull()

    await user.clear(field)
    await user.type(field, '95')
    const census = stacer.getByTestId('census')
    expect(census.textContent?.replace(/\s+/g, ' ')).toBe(
      '91 written · 0 already at 95% · 0 with no Cash · 309 Skimma $1,730 → $1,643',
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
    const settled = group(/^Settled/)
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

describe('each buyer’s price', () => {
  it('finds a motor by its code and says what a customer and a trade buyer pay, with each cell', async () => {
    const user = userEvent.setup()
    const onLine = vi.fn<(line: string) => void>()
    const props = { onList: () => {}, openTheFile: () => {}, onLine }
    const view = render(<Levels list="" {...props} />)
    await user.type(
      screen.getByRole('searchbox', { name: 'Find a line by its name or its code' }),
      'F90XB',
    )
    const hits = within(screen.getByRole('list', { name: 'Lines found' }))
    await user.click(hits.getAllByRole('button')[0]!)
    const token = onLine.mock.calls.at(-1)![0]
    view.rerender(<Levels list="" line={token} {...props} />)
    const buyers = within(screen.getByTestId('buyers'))
    expect(buyers.getByText('$14,531')).toBeTruthy()
    expect(buyers.getByText('Motor Library!BF', { exact: false })).toBeTruthy()
    expect(buyers.getByText('A trade buyer')).toBeTruthy()
  })

  it('says, where nothing is found, that nothing on sale is called it', async () => {
    const user = userEvent.setup()
    draw()
    await user.type(
      screen.getByRole('searchbox', { name: 'Find a line by its name or its code' }),
      'zzqq',
    )
    expect(screen.getByText(/^Nothing on sale is called “zzqq”/)).toBeTruthy()
  })
})

describe('Dealer Fit’s two figures, with their grounds', () => {
  it('says what Act Sell and Sell are, the rule checked, and how far apart they run', () => {
    draw('dealer_fit')
    const fit = opened()
    expect(fit.getByText(/^The whole package fitted/)).toBeTruthy()
    expect(fit.getByText(/primary accessory alone/)).toBeTruthy()
    /* the 1,576 packages on sale */
    expect(fit.getByText(/holds on 1,562 of 1,574/)).toBeTruthy()
    expect(
      fit.getByText(
        /On the 635 lines holding both, Act Sell is 0\.97–27\.83 × Sell; on the middle line, 2\.39 ×/,
      ),
    ).toBeTruthy()
    expect(fit.getByText('They are never the same figure.', { exact: false })).toBeTruthy()
  })

  /* the verifier of Prices, round 2: changing a settled Dealer Fit from Sell to Act Sell said
     "Every dealer fit package on a new quote shows its Act Sell" over the door to those with none */
  it('never says "every" when a list already priced is changed to a figure some lines lack', async () => {
    const user = userEvent.setup()
    const { again } = draw('dealer_fit')
    await user.click(opened().getByRole('button', { name: /^Sell, / }))
    await user.click(opened().getByRole('button', { name: /^Price [\d,]+ at Sell$/ }))
    again('dealer_fit')
    await user.click(opened().getByRole('button', { name: /^Act Sell, / }))
    const said = opened().getByText(/on a new quote show/)
    expect(said.textContent).toMatch(
      /^1,574 of 1,576 dealer fit packages on a new quote show their Act Sell: the .* goes from \$[\d,]+ to \$[\d,]+\. The other 2 have no Act Sell a quote can read, so they are still priced by hand, each on its own line\.$/,
    )
    expect(opened().queryByText(/^Every dealer fit package/)).toBeNull()
  })
})

describe('the factory packages, five of them under $0', () => {
  it('counts them apart from the priced, with their own door beside the one way', () => {
    draw('packages:mot_pkg_haines')
    const pkgs = opened()
    expect(pkgs.getByText('Prices', { exact: false }).textContent).toBe('Prices 73 of 89')
    expect(
      pkgs.getByText(
        '16 of 89 factory packages have no Sell Price a quote can read, so they are still priced by hand, each on its own line.',
      ),
    ).toBeTruthy()
    expect(
      pkgs.getByRole('link', {
        name: 'Open the 5 under $0 on Jeanneau',
      }),
    ).toBeTruthy()
    /* the figure's two names are said once, on its tile */
    expect(pkgs.queryByText(/under 2 names/)).toBeNull()
  })
})
