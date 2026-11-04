/* ============================================================
   A MAKER'S OWN PAGE, by role and text, on the real price list. What
   the page says is read the way a person reads it; what Settings writes
   is read back out of the store it wrote it in, and on the page's head.

   REWRITTEN FOR THE LINE-UP (2026-11-04, the data round's direction
   A). The range is now one card per model, so the tests that pressed a
   series tile into the sheet, read a series photograph's caption and
   opened the Quotes tab assert what replaced them: a series filters in
   place, each model carries its price, facts and fits, and the quotes
   stand on a plate after the range.
   ============================================================ */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { engineWordsIn } from '@/screens/configurator/say'
import { readTableRegister } from '@/domain/modules/register'
import type { EntityDef, ModuleDef, PriceLevel } from '@/domain/model'
import { Place, type PlaceTab } from './Place'
import type { PlaceAt } from './tabs'

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

function drawPlace(address: string, tab: PlaceTab = 'range', at: PlaceAt = {}) {
  const go = vi.fn<(href: string) => void>()
  const onTab = vi.fn<(t: PlaceTab) => void>()
  const onAt = vi.fn<(next: PlaceAt) => void>()
  const view = render(
    <Place address={address} tab={tab} at={at} go={go} onTab={onTab} onAt={onAt} />,
  )
  return { go, onTab, onAt, ...view }
}

const cards = () => [...document.querySelectorAll('.pl-cards > .pl-card')] as HTMLElement[]
const card = (said: string): HTMLElement =>
  cards().find((c) => c.querySelector('.pl-card__name')?.textContent === said)!

const SPORT_600 = 'boat_highfield:498'
const SPORT_660 = 'boat_highfield:513'

describe('opened from Data, the one register', () => {
  it('prints the figure Data prints for the same list', () => {
    drawPlace('parts')
    const s = catalogue.getState()
    const reg = readTableRegister(
      s.tables as Record<string, EntityDef>,
      s.rows,
      s.modules as Record<string, ModuleDef>,
      s.priceLevels as Record<string, PriceLevel[]>,
    )
    const parts = reg.rows.find((r) => r.id === 'parts')!
    const [, big, small] = /^([\d,]+) (.*)$/.exec(parts.holds)!
    const head = document.querySelector('.pl-livery')!
    expect(within(head as HTMLElement).getByText(big!)).toBeTruthy()
    expect(head.textContent).toContain(small!)
  })

  it('goes back to the list’s spread on Data, with the list still open', async () => {
    const { go } = drawPlace('boat_stacer')
    await userEvent.click(screen.getByRole('link', { name: 'Back to the price list' }))
    expect(go).toHaveBeenCalledWith('/data?at=boat_stacer')
  })

  it('says nothing in the engine’s words', () => {
    const { container } = drawPlace('boat_highfield')
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })
})

describe('the head', () => {
  it('heads Highfield with its mark, its span measured from the file, and its one act', async () => {
    const { go } = drawPlace('boat_highfield')
    expect(screen.getByRole('heading', { level: 1, name: /Highfield Inflatables/ })).toBeTruthy()
    const head = document.querySelector('.pl-livery') as HTMLElement
    expect(within(head).getByText('67')).toBeTruthy()
    expect(within(head).getByText('models in 7 series')).toBeTruthy()
    expect(within(head).getByText('2.3–9.2 m')).toBeTruthy()
    expect(within(head).getByText('$2,770–$198,610')).toBeTruthy()
    expect(within(head).getByText('at Cash · 588 of 588 versions priced')).toBeTruthy()
    expect(within(head).getByText(/^Price list of 16 September 2026$/)).toBeTruthy()
    await userEvent.click(screen.getByRole('link', { name: /Quote a Highfield/ }))
    expect(go).toHaveBeenCalledWith('/quote/new?brand=boat_highfield')
  })

  it('opens every one of the maker’s photographs in one lightbox from the head', async () => {
    drawPlace('boat_highfield')
    await userEvent.click(screen.getByRole('button', { name: 'See the 18 photographs' }))
    expect(document.querySelector('.ui-lightbox-count')?.textContent).toMatch(/^1 of 18/)
  })

  it('never prints the name twice under a mark that already says it', () => {
    drawPlace('boat_highfield')
    const head = document.querySelector('.pl-livery') as HTMLElement
    const printed = [...head.querySelectorAll('*')].filter(
      (el) =>
        el.children.length === 0 &&
        /Highfield Inflatables/i.test(el.textContent ?? '') &&
        !el.classList.contains('pl-unseen'),
    )
    expect(printed).toEqual([])
  })
})

describe('the line-up', () => {
  it('draws every model the head counts: Highfield 67, two dozen first and the rest one press away', async () => {
    const { onAt } = drawPlace('boat_highfield')
    expect(cards().length).toBe(24)
    await userEvent.click(screen.getByRole('button', { name: 'Show all 67 models' }))
    expect(onAt).toHaveBeenCalledWith({ all: true })
    cleanup()
    drawPlace('boat_highfield', 'range', { all: true })
    expect(cards().length).toBe(67)
    expect(screen.queryByRole('button', { name: /^Show all/ })).toBeNull()
  })

  it('filters to a series in place, in the address', async () => {
    const { onAt, go } = drawPlace('boat_highfield')
    await userEvent.click(screen.getByRole('button', { name: /^Sport/ }))
    expect(onAt).toHaveBeenCalledWith({ series: 'Sport', find: undefined, all: undefined })
    expect(go).not.toHaveBeenCalled()
  })

  it('carries the Sport 660’s price, facts and what fits it, as the file and Fitment read them', async () => {
    const { go } = drawPlace('boat_highfield', 'range', { series: 'Sport' })
    expect(cards().length).toBe(16)
    const sport = card('Sport 660')
    expect(sport.textContent).toContain('from $61,700')
    expect(sport.textContent).toContain('HBS145')
    expect(sport.textContent).toContain('16 versions in PVC or Hypalon')
    expect(sport.textContent).toContain('6.52 m')
    expect(sport.textContent).toContain('13 people')
    expect(sport.textContent).toContain('150–200 hp')
    expect(sport.textContent).toContain('Yamaha F175XC recommended')
    const kit = [...sport.querySelectorAll('.pl-card__kit dd')].map((d) => d.textContent)
    expect(kit).toEqual(['7', '2', '4', '3'])
    await userEvent.click(
      within(sport).getByRole('link', { name: /What fits the Highfield Sport 660/ }),
    )
    expect(go).toHaveBeenCalledWith(`/fitment?boat=${encodeURIComponent(SPORT_660)}`)
    await userEvent.click(
      within(sport).getByRole('link', { name: /Quote the Highfield Sport 660/ }),
    )
    expect(go).toHaveBeenCalledWith(
      `/quote/new?brand=boat_highfield&model=${encodeURIComponent(SPORT_660)}`,
    )
  })

  it('says where the file leaves people empty, and says what comes standard is not held, once', () => {
    drawPlace('boat_highfield', 'range', { series: 'Sport' })
    expect(card('SP300').textContent).toContain('people not in the price list')
    expect(screen.getAllByText(/What comes standard on each boat is not held yet/).length).toBe(1)
  })

  it('draws Jeanneau’s 27, the four filed under no series named in a sentence', () => {
    drawPlace('boat_jeanneau')
    expect(cards().length).toBe(27)
    expect(
      screen.getByText(
        /4 Jeanneau models have no series in the price list: DB 37 OB, DB 43 OB, TH33, TH38/,
      ),
    ).toBeTruthy()
  })

  it('orders by price from the least, in the address', async () => {
    const { onAt } = drawPlace('boat_highfield', 'range', { series: 'Sport', sort: 'price' })
    const prices = cards().map((c) =>
      Number(
        /\$([\d,]+)/
          .exec(c.querySelector('.pl-card__price')?.textContent ?? '')![1]!
          .replace(/,/g, ''),
      ),
    )
    expect(prices).toEqual(prices.toSorted((a, b) => a - b))
    await userEvent.click(screen.getByRole('radio', { name: 'Length' }))
    expect(onAt).toHaveBeenCalledWith({ series: 'Sport', sort: 'length' })
  })

  it('sets the boats chosen side by side in bands, a dash where the file is empty', () => {
    drawPlace('boat_highfield', 'range', {
      series: 'Sport',
      compare: [SPORT_600, SPORT_660],
      see: 'compare',
    })
    const sheet = screen.getByRole('region', { name: /Sport 600 and Sport 660, side by side/ })
    const row = (label: string) =>
      [...within(sheet).getByRole('rowheader', { name: label }).parentElement!.children].map(
        (c) => c.textContent,
      )
    expect(row('Length')).toEqual(['Length', '6.52 m', '6.52 m'])
    expect(row('From, at Cash')).toEqual(['From, at Cash', 'from $54,470', 'from $61,700'])
    /* never a price a customer may not be shown */
    expect(sheet.textContent).not.toMatch(/Trade|Warranty|Cost/)
  })

  it('refuses a fourth boat in the compare with a sentence where it is refused', async () => {
    drawPlace('boat_highfield', 'range', {
      series: 'Sport',
      compare: ['boat_highfield:483', SPORT_600, SPORT_660],
    })
    const press = within(card('Sport 700 ST')).getByRole('button', { name: /Compare/ })
    await userEvent.click(press)
    const said = 'Three boats are set side by side at most. Take one off to add the Sport 700 ST.'
    /* on the card whose Compare was pressed, described by it, and said to a screen reader */
    expect(within(card('Sport 700 ST')).getByText(said)).toBeTruthy()
    const described = document.getElementById(press.getAttribute('aria-describedby') ?? '')
    expect(described?.textContent).toBe(said)
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe(said)
    /* and nowhere else */
    expect(screen.getAllByText(said).length).toBe(2)
  })

  it('never begins or ends a wrapped line of facts on a dot: each dot stands before its fact', () => {
    drawPlace('boat_highfield', 'range', { series: 'Sport', all: true })
    const facts = card('Sport 800').querySelector('.pl-card__facts')!
    const items = [...facts.querySelectorAll('.pl-run__item')].map((i) => i.textContent)
    /* the file's "350 / 2 x 200 HP" said for each count of motors, and no dot in any fact */
    expect(items).toEqual(['8.11 m', '15 people', '250–350 hp or up to 2 × 200 hp'])
    expect(facts.textContent).not.toContain('·')
  })
})

describe('a list that is not a boat maker', () => {
  it('reads Yamaha by its own horsepower, and opens a rating in the address', async () => {
    const { onAt } = drawPlace('mot_yamaha', 'range', { in: '150' })
    const ladder = screen.getByRole('group', { name: 'By horsepower' })
    expect(within(ladder).getAllByRole('button')[0]!.textContent).toMatch(/^2\.5 hp/)
    expect(
      within(ladder)
        .getByRole('button', { name: /^150 hp/ })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(screen.getByText('F150XC')).toBeTruthy()
    await userEvent.click(within(ladder).getByRole('button', { name: /^2 × 70 hp/ }))
    expect(onAt).toHaveBeenCalledWith({ in: '2 x 70' })
  })

  it('prints what an hour costs at the file’s own Rate (inc GST), and says why, never its cost', () => {
    drawPlace('labour_rates')
    expect(
      screen.getByText(
        /Labour Rates declares no price of its own, so each rate is printed at the price list’s Rate \(inc GST\)/,
      ),
    ).toBeTruthy()
    /* the head answers it at once: the file's own first rate, the one its sheets sell an hour at */
    expect(document.querySelector('.pl-figs')?.textContent).toMatch(
      /\$159\.00 an hour of Retail Labour · Rate \(inc GST\)/,
    )
    const lines = [...document.querySelectorAll('.pl-line')]
    expect(lines.length).toBe(18)
    const retail = lines.find((l) => /Retail Labour/.test(l.textContent ?? ''))!
    /* to the cent, as the column is said on the sheet: 7 of its 18 carry cents */
    expect(retail.querySelector('.pl-line__price')?.textContent).toBe('$159.00')
    const trade = lines.find((l) => l.querySelector('.pl-line__name')?.textContent === 'Trade')!
    expect(trade.querySelector('.pl-line__price')?.textContent).toBe('$143.10')
    /* never Actual's $105 nor the ex-GST $144.55 the file's other sheets cost an hour at */
    expect(document.body.textContent).not.toMatch(/\$105\b|\$144\.55|\$130\.09/)
  })

  it('says each trailer by the boats it takes in the file’s own words, its length and what it fits', () => {
    drawPlace('trl_nsmcustom', 'range', { find: 'formosa' })
    const facts = [...document.querySelectorAll('.pl-line .pl-run__item')].map(
      (i) => i.textContent ?? '',
    )
    /* a size in metres only where the file writes metres, never "boats of Formosa 495 m" */
    for (const f of facts.filter((x) => x.startsWith('boats of ')))
      expect(f).toMatch(/^boats of \d{1,2}(?:\.\d+)?(?:(?:–| or )\d{1,2}(?:\.\d+)?)? m$/)
    expect(facts).toContain('for the Formosa 495')
    expect(facts).toContain('5.93 m long')
    expect(facts.some((f) => /^fits \d+ Formosa models?$/.test(f))).toBe(true)
    /* the head says how many carry a length, measured, once the find is cleared */
    cleanup()
    drawPlace('trl_nsmcustom')
    expect(screen.getByText(/24 of the 73 carry their own length in the price list/)).toBeTruthy()
  })

  it('says which models each Yamaha motor fits, maker by maker', () => {
    drawPlace('mot_yamaha', 'range', { in: '175' })
    const line = [...document.querySelectorAll('.pl-line')].find((l) =>
      /F175XC/.test(l.querySelector('.pl-line__name')?.textContent ?? ''),
    )!
    expect(line.textContent).toMatch(/fits \d+ models: .*\d+ Highfield/)
  })

  it('draws OBSOLETE Trailers’ ten, each no longer sold', () => {
    drawPlace('trl_obsolete')
    expect(document.querySelectorAll('.pl-line').length).toBe(10)
    expect(screen.getAllByText('No longer sold').length).toBeGreaterThanOrEqual(10)
  })

  it('hands Parts to the chandlery, which reads the same list with find and aisles', async () => {
    const { go } = drawPlace('parts')
    /* the sentence says why, with no count that disagrees with the head's 2,937 */
    const why = screen.getByText(/The chandlery reads Parts & Accessories with find, aisles/)
    expect(why.textContent).not.toMatch(/2,238|180|187/)
    expect(why.textContent).toMatch(/25 carry no category in the price list/)
    /* one door to the chandlery, beside the sentence that says why */
    expect(screen.getAllByRole('link', { name: 'Open the chandlery' }).length).toBe(1)
    await userEvent.click(screen.getByRole('link', { name: 'Open the chandlery' }))
    expect(go).toHaveBeenCalledWith('/catalogue')
    expect(document.querySelectorAll('.pl-line').length).toBe(0)
  })
})

describe('after the range', () => {
  it('lists what it goes with, most first, each a door to that place', async () => {
    const { go } = drawPlace('boat_highfield')
    const rail = within(screen.getByRole('complementary', { name: /Goes with/ }))
    const rows = rail.getAllByRole('button').map((b) => b.getAttribute('aria-label'))
    expect(rows[0]).toMatch(/^Yamaha Outboards: 2,519 fits with Highfield Inflatables$/)
    await userEvent.click(rail.getByRole('button', { name: /^Yamaha Outboards/ }))
    expect(go).toHaveBeenCalledWith('/places/mot_yamaha')
  })

  it('draws a place it goes with that has no mark by its kind, never as a blank swatch', () => {
    drawPlace('boat_stacer')
    const parts = within(screen.getByRole('complementary', { name: /Goes with/ })).getByRole(
      'button',
      { name: /^Parts & Accessories/ },
    )
    expect(parts.querySelector('.pl-partner__chip svg')).not.toBeNull()
  })

  it('spans its prices series by series with their denominators, and names Warranty as kept', () => {
    drawPlace('boat_highfield')
    const prices = screen.getByRole('region', { name: /Its prices/ })
    const sport = within(prices).getByRole('rowheader', { name: /^Sport/ })
    expect(sport.textContent).toContain('199 of 199 priced')
    expect(sport.parentElement!.textContent).toContain('$15,040–$129,830')
    expect(prices.textContent).toContain('Warranty is kept as Northside’s own')
  })

  it('says a maker with no quote has none, and refuses an address no place answers to', () => {
    drawPlace('boat_highfield')
    expect(screen.getByText(/No quote on a Highfield is held on this computer yet/)).toBeTruthy()
  })

  it('says an address that is no place, in a sentence', () => {
    drawPlace('nowhere')
    expect(
      screen.getByRole('heading', { level: 1, name: 'No place is called “nowhere”' }),
    ).toBeTruthy()
  })
})

describe('its settings', () => {
  it('writes a line that lands on its head, with an Undo that takes it off again', async () => {
    drawPlace('boat_stacer', 'settings')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'What is Stacer to Northside, in a line?' }),
      'Our everyday tinnies',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Keep this line' }))
    const m = Object.values(catalogue.getState().modules).find((x) => x.name === 'Boats')!
    expect(m.dress?.['boat_stacer']?.line).toBe('Our everyday tinnies')
    expect(document.querySelector('.pl-livery__line')?.textContent).toBe('Our everyday tinnies')
    catalogue.getState().undo()
    const after = Object.values(catalogue.getState().modules).find((x) => x.name === 'Boats')!
    expect(after.dress).toBeUndefined()
  })

  it('refuses an ink the maker does not ship, with the reason', () => {
    drawPlace('boat_formosa', 'settings')
    const white = screen.getByRole('radio', { name: 'In white' })
    expect(white.getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByText(/Formosa’s mark comes in dark ink only/)).toBeTruthy()
  })

  it('says a maker with no mark in either ink once, not once per ink', () => {
    drawPlace('trl_redco', 'settings')
    expect(screen.getAllByText('No mark for REDCO / Tinka Trailers yet.').length).toBe(1)
    expect(screen.queryByRole('radio', { name: 'In white' })).toBeNull()
  })

  it('offers only its own boats as its photograph, and its ground with white measured on it', async () => {
    drawPlace('boat_stacer', 'settings')
    const offered = screen
      .getAllByRole('button', { name: /on the water$/ })
      .map((b) => b.getAttribute('aria-label') ?? '')
    expect(offered.length).toBe(11)
    for (const o of offered) expect(o).toMatch(/^Stacer /)
    await userEvent.click(screen.getByRole('button', { name: /^Carmine/ }))
    expect(screen.getByTestId('place-contrast').textContent).toMatch(
      /^White words on carmine read at \d+\.\d : 1/,
    )
  })

  it('says a name that ends in s as a person writes it: Inflatables’, never Inflatables’s', () => {
    drawPlace('boat_highfield', 'settings')
    expect(screen.getByText(/Only Highfield Inflatables’ own boats are offered/)).toBeTruthy()
    expect(document.body.textContent).not.toContain('Inflatables’s')
  })

  it('tells a place with no photograph of its own why, and offers Northside’s own', () => {
    drawPlace('mot_yamaha', 'settings')
    expect(
      screen.getByText(
        'No photograph of Yamaha Outboards on the water yet. Upload Northside’s own, or paste its address.',
      ),
    ).toBeTruthy()
  })
})

/* SOLD ON ITS OWN (the flow round, 2026-10-30): the owner, "quotes are not just boats", and
   Parts & Accessories "never had Quote switched on" — switched on here as Northside's own
   setting, one step with its Undo, never by editing the price list */
describe('how a place is sold', () => {
  it('lets Parts & Accessories be quoted on its own, as one step', async () => {
    drawPlace('parts', 'settings')
    const sold = screen.getByRole('group', { name: /Can a quote start from/ })
    expect(within(sold).getByRole('radio', { name: 'Only with a boat' })).toBeChecked()
    await userEvent.click(within(sold).getByRole('radio', { name: 'On its own too' }))
    const parts = Object.values(catalogue.getState().modules).find(
      (m) => m.name === 'Parts & Accessories',
    )!
    expect(parts.capabilities).toContain('quote')
    expect(screen.getByText(/can start from .* with no boat on it/)).toBeTruthy()
  })

  it('does not offer the choice on a boat maker, whose boats are always quoted', () => {
    drawPlace('boat_stacer', 'settings')
    expect(screen.queryByRole('group', { name: /Can a quote start from/ })).toBeNull()
  })
})
