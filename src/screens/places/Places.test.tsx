/* ============================================================
   A MAKER'S OWN PAGE, by role and text, on the real price list. What
   the page says is read the way a person reads it; what Settings writes
   is read back out of the store it wrote it in, and on the page's head.
   There is no wall of place cards to read it on any more: Data is the
   one register (built-critique-m4.md major 1).
   ============================================================ */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { engineWordsIn } from '@/screens/configurator/say'
import { readTableRegister } from '@/domain/modules/register'
import type { EntityDef, ModuleDef, PriceLevel } from '@/domain/model'
import { Place, type PlaceTab } from './Place'

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

function drawPlace(address: string, tab: PlaceTab = 'range') {
  const go = vi.fn<(href: string) => void>()
  const onTab = vi.fn<(t: PlaceTab) => void>()
  const view = render(<Place address={address} tab={tab} go={go} onTab={onTab} />)
  return { go, onTab, ...view }
}

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
    expect(screen.getByText(parts.holds)).toBeTruthy()
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

describe('one place, opened', () => {
  it('heads Highfield with its mark, its figure and its one act, which starts a quote on it', async () => {
    const { go } = drawPlace('boat_highfield')
    expect(screen.getByRole('heading', { level: 1, name: /Highfield Inflatables/ })).toBeTruthy()
    expect(screen.getByText('67 models in 7 series')).toBeTruthy()
    await userEvent.click(screen.getByRole('link', { name: /Quote a Highfield/ }))
    expect(go).toHaveBeenCalledWith('/quote/new?brand=boat_highfield')
  })

  it('lists what it goes with, most first, each a door to that place', async () => {
    const { go } = drawPlace('boat_highfield')
    const rail = within(screen.getByRole('complementary'))
    const rows = rail.getAllByRole('button').map((b) => b.getAttribute('aria-label'))
    expect(rows[0]).toMatch(/^Yamaha Outboards: 2,519 fits with Highfield Inflatables$/)
    await userEvent.click(rail.getByRole('button', { name: /^Yamaha Outboards/ }))
    expect(go).toHaveBeenCalledWith('/places/mot_yamaha')
  })

  it('opens its range on one tile per series, each a door to that series in the price list', async () => {
    const { go } = drawPlace('boat_highfield')
    await userEvent.click(screen.getByRole('button', { name: /^Classic · 16 models/ }))
    expect(go).toHaveBeenCalledWith('/data/boat_highfield?in=Classic')
  })

  it('names the model every series photograph shows, and never draws the head’s photograph twice', () => {
    drawPlace('boat_stacer')
    const skimmas = screen.getByRole('button', { name: /^SKIMMAS · 5 models/ })
    expect(skimmas.getAttribute('aria-label')).toContain('Stacer 309 Skimma on the water')
    /* the maker is named once, on the head; the tile's caption is the model */
    expect(within(skimmas).getByText('309 Skimma on the water')).toBeTruthy()
    /* the head stands on the 409 Assault Pro, so its series says so instead of wearing it */
    const pros = screen.getByRole('button', { name: /^ASSAULT PROS · / })
    expect(within(pros).getByText('On the water above')).toBeTruthy()
    expect(pros.querySelector('img')).toBeNull()
    /* a series with no photograph wears none */
    expect(screen.getByRole('button', { name: /^PROLINES · / }).querySelector('img')).toBeNull()
  })

  it('draws a place it goes with that has no mark by its kind, never as a blank swatch', () => {
    drawPlace('boat_stacer')
    const parts = within(screen.getByRole('complementary')).getByRole('button', {
      name: /^Parts & Accessories/,
    })
    expect(parts.querySelector('.pl-partner__chip svg')).not.toBeNull()
  })

  it('opens a list with no headings on its lines', () => {
    drawPlace('labour_rates')
    expect(screen.getByRole('region', { name: /Labour Rates, line by line/ })).toBeTruthy()
  })

  it('says a place with no quote has none, and refuses an address no place answers to', () => {
    drawPlace('boat_highfield', 'quotes')
    expect(screen.getByText(/No quote has Highfield Inflatables on it yet/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Back to the price list' })).toBeTruthy()
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

  it('opens what goes on a maker’s boats from its range', async () => {
    const { go } = drawPlace('boat_stacer')
    await userEvent.click(screen.getByRole('link', { name: 'What goes on its boats' }))
    expect(go).toHaveBeenCalledWith('/fitment?maker=Stacer')
  })
})
