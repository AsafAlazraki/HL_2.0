/* ============================================================
   PLACES, by role and text, on the real price list. What the screen
   says is read the way a person reads it; what Settings writes is read
   back out of the store it wrote it in, on the card the index draws.
   ============================================================ */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { engineWordsIn } from '@/screens/configurator/say'
import { readTableRegister } from '@/domain/modules/register'
import type { EntityDef, ModuleDef, PriceLevel } from '@/domain/model'
import { Places } from './Places'
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

const card = (name: RegExp) => screen.getByRole('button', { name })

describe('the index', () => {
  it('draws every place as a card, by kind, each counted as /data counts it', () => {
    render(<Places kind="all" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Places' })).toBeTruthy()
    const s = catalogue.getState()
    const reg = readTableRegister(
      s.tables as Record<string, EntityDef>,
      s.rows,
      s.modules as Record<string, ModuleDef>,
      s.priceLevels as Record<string, PriceLevel[]>,
    )
    const parts = reg.rows.find((r) => r.id === 'parts')!
    /* the figure /data prints for the list, never the board's smaller one */
    expect(card(/^Parts & Accessories · /).getAttribute('aria-label')).toContain(parts.holds)
    expect(card(/^Highfield Inflatables · /).getAttribute('aria-label')).toContain(
      '67 models in 7 series',
    )
    const heads = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(heads).toEqual(['Boats', 'Motors', 'Packages', 'Trailers', 'Accessories', 'Other lists'])
    expect(screen.getAllByRole('listitem').filter((li) => li.dataset.place)).toHaveLength(25)
  })

  it('captions every photograph with the model it shows, and gives a boat with none its sentence', () => {
    render(<Places kind="all" />)
    expect(screen.getAllByText(/on the water$/).length).toBeGreaterThan(6)
    expect(screen.getByText(/Jeanneau has no photograph on the water yet/)).toBeTruthy()
  })

  it('sets a place with no mark in type, and never another maker’s mark', () => {
    render(<Places kind="all" />)
    const redco = card(/^REDCO \/ Tinka Trailers · /)
    expect(within(redco).getByText('REDCO / Tinka Trailers')).toBeTruthy()
    expect(redco.querySelector('img')).toBeNull()
  })

  it('narrows to one kind by its chip, and hands the kind back to the address', async () => {
    const onKind = vi.fn<(k: string) => void>()
    const { rerender } = render(<Places kind="all" onKind={onKind} />)
    await userEvent.click(screen.getByRole('button', { name: /^Trailers/ }))
    expect(onKind).toHaveBeenCalledWith('trailer')
    rerender(<Places kind="trailer" onKind={onKind} />)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Trailers',
    ])
  })

  it('opens a place at its own address', async () => {
    const open = vi.fn<(a: string) => void>()
    render(<Places kind="all" open={open} />)
    await userEvent.click(card(/^Stacer · /))
    expect(open).toHaveBeenCalledWith('boat_stacer')
  })

  it('says nothing in the engine’s words', () => {
    const { container } = render(<Places kind="all" />)
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })
})

function drawPlace(address: string, tab: PlaceTab = 'range') {
  const go = vi.fn<(href: string) => void>()
  const onTab = vi.fn<(t: PlaceTab) => void>()
  const view = render(<Place address={address} tab={tab} go={go} onTab={onTab} />)
  return { go, onTab, ...view }
}

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

  it('opens a list with no headings on its lines', () => {
    drawPlace('labour_rates')
    expect(screen.getByRole('region', { name: /Labour Rates, line by line/ })).toBeTruthy()
  })

  it('says a place with no quote has none, and refuses an address no place answers to', () => {
    drawPlace('boat_highfield', 'quotes')
    expect(screen.getByText(/No quote has Highfield Inflatables on it yet/)).toBeTruthy()
    screen.getByText(/Every place/)
  })

  it('says an address that is no place, in a sentence', () => {
    drawPlace('nowhere')
    expect(
      screen.getByRole('heading', { level: 1, name: 'No place is called “nowhere”' }),
    ).toBeTruthy()
  })
})

describe('its settings', () => {
  it('writes a line that lands on its card, with an Undo that takes it off again', async () => {
    drawPlace('boat_stacer', 'settings')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'What is Stacer to Northside, in a line?' }),
      'Our everyday tinnies',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Keep this line' }))
    const m = Object.values(catalogue.getState().modules).find((x) => x.name === 'Boats')!
    expect(m.dress?.['boat_stacer']?.line).toBe('Our everyday tinnies')
    render(<Places kind="boat" />)
    expect(screen.getAllByText('Our everyday tinnies').length).toBeGreaterThan(0)
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
