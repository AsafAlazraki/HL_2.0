import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, RowData } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { spokenBoat } from '@/domain/quote/spoken'
import {
  featuredOf,
  flagshipOf,
  fleetOf,
  matchModels,
  modelsOf,
  seriesOf,
  type Brand,
  type Fleet,
  type Model,
} from './fleet'
import { heldCopy, pictureOf } from './pictures'
import { Picker, type PickerAt } from './Picker'
import { boatTravel } from './travel'

/* ============================================================
   The picker, rendered against the real pack, read by role and by
   text.

   Not one figure below is typed into an assertion: each is counted off
   the fixture by `fleetOf` and then looked for on the screen, so a test
   cannot agree with a screen that has drifted from the price file.
   ============================================================ */

let pack: PackFixture
let fleet: Fleet

const AT = new Date('2026-09-16T09:00:00+10:00')

const tablesOf = (): Record<string, EntityDef> =>
  Object.fromEntries(pack.entities.map((e) => [e.id, e]))

const loadTheFile = async (): Promise<void> => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
}

const au = (n: number): string => n.toLocaleString('en-AU')
const models = (n: number): string => `${au(n)} ${n === 1 ? 'model' : 'models'}`

/* THE DATABASE'S OWN WORDS, which the M2-close critique counted on this
   screen — 128 "row" or "rows" and 10 "register" at 1440 — and which a
   showroom never says. "rung" is the engine's word for a price level. */
const DATABASE = /\brows?\b|\bregisters?\b|\brung\b/i
/* AND THE FILE'S (docs/WORDS.md, the refine round of 2026-10-21): "on file", "the price file",
   "the sheet" and "held" are how the app stores things, and a dealer says "the price list". */
const FILED = /\bon file\b|\bprice file\b|\bsheet\b|\bheld\b/i

beforeAll(async () => {
  pack = await loadPack()
  fleet = fleetOf(tablesOf(), pack.rowsByEntity as Record<string, RowData[]>)
})

describe('the picker with the price file open', () => {
  beforeAll(async () => {
    await loadTheFile()
    await quotes.getState().openFor('northside')
    session.getState().signIn('Asaf')
  })

  /* THE HEAD SAYS WHAT TO DO AND STOPS (the refine round, 2026-10-21): "289 models from 7
     makers, at Cash prices" stood beside "All makers 289" and each door's count, and "Cash
     prices" beside the plate's "Cash price". Each is said once: a count by its door or its rail
     row, the price's name by the price. */
  it('asks what is sold, then for the maker and the boat, and says the price’s name once, by the price', () => {
    /* THE FIRST QUESTION IS WHAT IS SOLD (the owner, 2026-10-30: "quotes are not just boats"):
       rewritten from "Choose the maker, then the boat." on the doors, which the redesign made
       untrue there; a maker's page still says it */
    const { unmount } = render(<Picker />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('What are you selling?')
    expect(screen.getByTestId('picker-counts')).toHaveTextContent(
      /^A boat, or a motor, a trailer or a part on its own\.$/,
    )
    expect(document.body.textContent).not.toContain(models(fleet.models))
    expect(document.body.textContent).not.toContain(`${fleet.rung} price`)
    unmount()
    const model = fleet.brands
      .flatMap((b) => b.models)
      .find((m) => !m.splits && m.from !== null) as Model
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Which boat is it?')
    expect(screen.getByTestId('picker-counts')).toHaveTextContent(
      /^Choose the maker, then the boat\.$/,
    )
    expect((document.body.textContent ?? '').split(`${fleet.rung} price`)).toHaveLength(2)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(within(panel).getByText(`${fleet.rung} price`)).toBeInTheDocument()
  })

  it('opens on the makers: one door each, with its models and the price they start from', () => {
    render(<Picker />)
    const doors = screen.getByRole('region', { name: 'Boats' })
    for (const brand of fleet.brands) {
      const door = within(doors).getByRole('button', {
        name: `${brand.name}, ${models(brand.models.length)}${brand.from === null ? '' : `, from ${money(brand.from)}`}`,
      })
      /* a door opens something; it is not a toggle */
      expect(door).not.toHaveAttribute('aria-pressed')
    }
    expect(within(doors).getAllByRole('listitem')).toHaveLength(fleet.brands.length)
    /* and no list of 289 boats is drawn before a maker is asked for */
    expect(screen.queryByRole('region', { name: 'Models' })).toBeNull()
  })

  /* REWRITTEN 2026-10-31: the door's picture is the dearest boat on the WATER where the maker
     has one (Stacer's dearest was a cut-out on white, the critic's S-4), and the boat is no longer
     named under it (the owner: "we dont need that little text under the photo") */
  it('puts on each door the dearest boat it holds on the water, else its dearest render, and names no boat under it', () => {
    render(<Picker />)
    const doors = screen.getByRole('region', { name: 'Boats' })
    for (const brand of fleet.brands) {
      const flagship =
        flagshipOf(brand, (m) => pictureOf(m)?.verdict === 'scene') ??
        flagshipOf(brand, (m) => pictureOf(m) !== null)
      const door = within(doors).getByRole('button', {
        name: new RegExp(`^${escape(brand.name)},`),
      })
      if (flagship === null) {
        expect(door.querySelector('img.picker-photo')).toBeNull()
        continue
      }
      expect(door.querySelector('img.picker-photo')?.getAttribute('src')).toBe(
        pictureOf(flagship)?.at,
      )
      expect(door.textContent).not.toContain(flagship.shown)
    }
  })

  /* NOT JUST BOATS (the owner, 2026-10-30): before a maker is chosen, the field searches
     everything sold, and says so */
  it('searches everything sold from the first question, a motor as well as a boat', async () => {
    const motors = fleetOf(
      Object.fromEntries(pack.entities.filter((e) => e.kind === 'motor').map((e) => [e.id, e])),
      pack.rowsByEntity as Record<string, RowData[]>,
      'motor',
    )
    const motor = motors.brands
      .flatMap((b) => b.models)
      .find((m) => matchModels(modelsOf(fleet, null), m.name).length === 0) as Model
    expect(motor).toBeDefined()
    render(<Picker />)
    const field = screen.getByLabelText(/Find a model/)
    expect(field).toHaveAttribute('placeholder', 'Search everything sold')
    await userEvent.type(field, motor.name)
    const index = screen.getByRole('region', { name: 'Models' })
    expect(
      within(index).getAllByRole('button', { name: new RegExp(`^${escape(motor.shown)},`) }).length,
    ).toBeGreaterThan(0)
  })

  it('draws one door two cells wide when that fills the last row, and only that one', () => {
    render(<Picker />)
    const featured = featuredOf(fleet)
    const wide = document.querySelectorAll('.picker-door[data-featured]')
    expect(wide.length).toBe(featured === null ? 0 : 1)
    /* and it is the LAST door, so it ends the grid whole at four abreast and at two, rather
       than leaving a cell empty on either side of it where the doors stand two abreast */
    if (featured !== null) {
      const doors = within(screen.getByRole('region', { name: 'Boats' })).getAllByRole('listitem')
      expect(doors.at(-1)).toBe(wide[0])
    }
  })

  it('writes the maker into the position when a door is pressed', async () => {
    const goTo = vi.fn<(next: PickerAt, how?: { stay?: boolean }) => void>()
    render(<Picker goTo={goTo} />)
    const wanted = fleet.brands[0]
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(`^${escape(wanted.name)}, `) }),
    )
    expect(goTo).toHaveBeenCalledWith({ brand: wanted.id })
  })

  /* Opened on the SMALLEST maker on the sheet, because this case is
     about the rail and not about the cards. */
  it('keeps the makers as a rail once one is chosen, and All makers goes back to the doors', async () => {
    const goTo = vi.fn<(next: PickerAt, how?: { stay?: boolean }) => void>()
    const smallest = fleet.brands.toSorted((a, b) => a.models.length - b.models.length)[0]
    const wanted = fleet.brands.find((b) => b.id !== smallest.id) as Brand
    render(<Picker at={{ brand: smallest.id }} goTo={goTo} />)
    const rail = screen.getByRole('navigation', { name: 'Makers' })
    expect(
      within(rail).getByRole('button', {
        name: `${smallest.name}, ${models(smallest.models.length)}`,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(
      within(rail).getByRole('button', { name: `${wanted.name}, ${models(wanted.models.length)}` }),
    )
    expect(goTo).toHaveBeenCalledWith({ brand: wanted.id })

    await userEvent.click(
      within(rail).getByRole('button', { name: `All makers, ${models(fleet.models)}` }),
    )
    expect(goTo).toHaveBeenLastCalledWith({})
  })

  it('lists a maker’s boats series by series, each with its name and its price', () => {
    const brand = fleet.brands.find((b) => b.id === 'boat_highfield') as Brand
    render(<Picker at={{ brand: brand.id }} />)
    const index = screen.getByRole('region', { name: 'Models' })
    for (const series of brand.series) {
      expect(
        within(index).getByRole('heading', { level: 3, name: new RegExp(escape(series.label)) }),
      ).toBeInTheDocument()
    }
    for (const model of brand.models) {
      const card = within(index).getByRole('button', {
        name: new RegExp(`^${escape(model.shown)},`),
      })
      if (model.from !== null) expect(card).toHaveTextContent(money(model.from))
    }
  })

  it('draws a boat’s photograph where one is held, and says there is none where none is', () => {
    const brand = fleet.brands.find((b) => b.id === 'boat_highfield') as Brand
    render(<Picker at={{ brand: brand.id }} />)
    const index = screen.getByRole('region', { name: 'Models' })
    const held = brand.models.find((m) => pictureOf(m) !== null) as Model
    const none = brand.models.find((m) => pictureOf(m) === null) as Model
    expect(held).toBeDefined()
    expect(none).toBeDefined()
    const withPicture = within(index).getByRole('button', {
      name: new RegExp(`^${escape(held.shown)},`),
    })
    expect(withPicture.querySelector('img')?.getAttribute('src')).toBe(pictureOf(held)?.at)
    const without = within(index).getByRole('button', {
      name: new RegExp(`^${escape(none.shown)},`),
    })
    /* nothing stands in: no picture at all, and the cover says so quietly in its corner. No
       longer the big crossed camera (the owner, 2026-10-30: shown honestly, "not as a big
       crossed-camera tile"; rewritten from the camera's assertion, which the redesign made
       untrue), and it does not set the boat's name over its own name a second time */
    expect(without.querySelector('img')).toBeNull()
    const cover = without.querySelector('.picker-card__cover')
    expect(cover?.querySelector('svg')).toBeNull()
    expect(cover?.textContent ?? '').toBe('No photograph yet')
    expect(without.textContent?.split(none.said).length).toBe(2)
  })

  /* EVERY MAKER'S BOAT AS THE BUILD SAYS IT (m2-last-critique.md, major
     6): the card, the door's caption and the plate are the one namer's
     words — the build's name less only the maker the mark states — and a
     trim is said after the model, never in the file's brackets. */
  it('names a Stacer and a Haines as the build does, card and plate', () => {
    const stacer = fleet.brands.find((b) => b.id === 'boat_stacer') as Brand
    const trimmed = stacer.models.find((m) => m.trim !== '' && pictureOf(m) !== null) as Model
    expect(trimmed).toBeDefined()
    const { unmount } = render(<Picker at={{ brand: stacer.id, model: trimmed.key }} />)
    const card = screen
      .getByRole('region', { name: 'Models' })
      .querySelector(`[data-key="${trimmed.key}"] .picker-card__name`)
    expect(card?.textContent?.replaceAll(' ', ' ')).toBe(`${trimmed.said} · ${trimmed.trim}`)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent(trimmed.said)
    expect(within(panel).getByText(trimmed.trim, { selector: 'p' })).toBeInTheDocument()
    /* the boat's name, its trim and its series: no bracket of the file's */
    expect(panel.querySelector('.picker-stage__crest')?.textContent).not.toMatch(/\(/)
    unmount()

    const haines = fleet.brands.find((b) => b.id === 'boat_haines') as Brand
    const boat = haines.models[0]
    render(<Picker at={{ brand: haines.id, model: boat.key }} />)
    const plate = screen.getByRole('complementary', { name: 'What is chosen' })
    const heading = within(plate).getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent(boat.said)
    /* the build's words, less the maker the mark above it states */
    expect(`Haines ${heading.textContent}`).toBe(spokenBoat('boat_haines', boat.name).name)
    /* and the series is its name; the file's stamp stands beside its count */
    const group = haines.series[0]
    expect(group.note).not.toBe('')
    /* said once on the plate (the refine round's second pass, 2026-10-21): over the name where
       the name does not carry it, and not at all where it does — "Sea Ranger" stood over "519
       Sea Ranger SDF" */
    const stem = (group.label.split(/\s+/)[0] ?? '').toLowerCase().replace(/s$/, '')
    const crest = (plate.querySelector('.picker-stage__crest')?.textContent ?? '').toLowerCase()
    expect(crest.split(stem).length - 1).toBe(1)
    const eyebrow = plate.querySelector('.picker-stage__series')
    if (eyebrow) expect(eyebrow.textContent).toBe(group.label)
    const head = screen.getByRole('heading', {
      level: 3,
      name: new RegExp(`^${escape(group.label)}`),
    })
    expect(head).toHaveTextContent(`${group.label}${models(group.models.length)} · ${group.note}`)
    expect(head.textContent).not.toMatch(/\(/)
  })

  it('says what the plate will ask before it is asked, never how many lines are behind it', () => {
    const brand = fleet.brands.find((b) => b.id === 'boat_highfield') as Brand
    render(<Picker at={{ brand: brand.id }} />)
    const index = screen.getByRole('region', { name: 'Models' })
    const twoMaterials = brand.models.find((m) => m.materials.length > 1) as Model
    const card = within(index).getByRole('button', {
      name: new RegExp(`^${escape(twoMaterials.shown)},`),
    })
    expect(card).toHaveTextContent(`${twoMaterials.materials.length} materials`)
  })

  it('writes the model and its maker into the position when a card is pressed', async () => {
    const goTo = vi.fn<(next: PickerAt, how?: { stay?: boolean }) => void>()
    const brand = fleet.brands.toSorted((a, b) => a.models.length - b.models.length)[0]
    const model = brand.models[0]
    render(<Picker at={{ brand: brand.id }} goTo={goTo} />)
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(`^${escape(model.shown)},`) }),
    )
    /* a new boat is a new plate, so nothing asks the window to stay */
    expect(goTo.mock.calls.at(-1)).toEqual([{ brand: brand.id, model: model.key }])
  })

  it('says where the price would be when the file holds only a zero there', () => {
    const none = fleet.brands.find((b) => b.from === null) as Brand
    expect(none).toBeDefined()
    const model = none.models[0]
    render(<Picker at={{ brand: none.id, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(within(panel).getByText('Not priced')).toBeInTheDocument()
    expect(within(panel).getByText(/you put the price on it/)).toBeInTheDocument()
    /* and the act is live all the same — never a dimmed control */
    expect(within(panel).getByRole('button', { name: 'Start the quote' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  /* THE CRITIQUE'S OWN MEASURE, AS A GATE: the database's words, at
     each of the three stages, on a maker that files a line per colour
     and one that files a line per boat. */
  it('says nothing about rows, registers or rungs at any of its three stages', () => {
    const deep = fleet.brands.find((b) => b.id === 'boat_highfield') as Brand
    const many = deep.models.find((m) => m.materials.length > 1) as Model
    const flat = fleet.brands.find((b) => b.models.length === b.rows) as Brand
    const places: PickerAt[] = [
      {},
      { brand: deep.id },
      { brand: flat.id },
      { brand: deep.id, model: many.key },
      { brand: deep.id, model: many.key, row: many.variants[0].rowId },
      { brand: flat.id, model: flat.models[0].key },
    ]
    for (const at of places) {
      const { container, unmount } = render(<Picker at={at} />)
      /* what a pointer resting on a figure shows is said too */
      const titles = [...container.querySelectorAll('[title]')].map((e) => e.getAttribute('title'))
      const words = [container.textContent ?? '', ...titles].join(' ')
      expect(words, JSON.stringify(at)).not.toMatch(DATABASE)
      expect(words, JSON.stringify(at)).not.toMatch(FILED)
      unmount()
    }
  })
})

/* ============================================================
   A MODEL BUILT IN MANY VERSIONS STARTS ON ITS OWN (the owner, 2026-10-30: "the picking model
   color and all of that nonsense to be done in hull section and same for all boats please so
   they can see differences in real time"). REWRITTEN 2026-10-31 from the cases that held the
   plate's material and colour chips and the act's refusal until one was chosen, which the
   redesign made untrue: the plate asks nothing, the quote opens on the version its "from"
   figure prices, and the act says where the rest is chosen.
   ============================================================ */
describe('a model built in many versions', () => {
  beforeAll(async () => {
    await loadTheFile()
    await quotes.getState().openFor('northside')
    session.getState().signIn('Asaf')
  })

  const manyMaterials = (): Model =>
    fleet.brands
      .flatMap((b) => b.models)
      .find((m) => m.materials.length > 1 && m.from !== m.to) as Model

  it('starts on the model alone, live at once, and says where its material and colour are chosen', () => {
    const model = manyMaterials()
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Start the quote' })
    expect(act).not.toHaveAttribute('aria-disabled', 'true')
    expect(act.closest('.picker-act')).not.toHaveAttribute('data-waits')
    expect(
      within(panel).getByText(/^Its material and colour are chosen in the hull section/),
    ).toBeInTheDocument()
    /* no material and no colour is asked on the plate */
    expect(panel.querySelector('.picker-pick, .picker-chips')).toBeNull()
    for (const group of model.materials)
      expect(
        within(panel).queryByRole('button', { name: new RegExp(`^${escape(group.label)},`) }),
      ).toBeNull()
    /* the price is the span its versions run over, as its card said it */
    expect(panel.querySelector('.picker-money__fig')).toHaveTextContent(
      `from ${money(model.from as number)}`,
    )
    expect(panel.querySelector('.picker-money__rung')).toHaveTextContent(
      `up to ${money(model.to as number)}`,
    )
  })

  it('says a one-material model’s colour is chosen in the hull section too — the ADV7 case', () => {
    const model = fleet.brands
      .flatMap((b) => b.models)
      .find((m) => m.splits && m.materials.length === 1) as Model
    expect(model).toBeDefined()
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Start the quote' })
    expect(act).not.toHaveAttribute('aria-disabled', 'true')
    expect(within(panel).getByText(/^Its colour is chosen in the hull section/)).toBeInTheDocument()
  })

  it('opens the build on the version its "from" figure prices', async () => {
    const model = manyMaterials()
    const opening = model.variants.find((v) => v.amount === model.from)
    expect(opening).toBeDefined()
    const openQuote = vi.fn<(quoteId: string) => void>()
    render(
      <Picker
        at={{ brand: model.tableId, model: model.key }}
        now={() => AT}
        openQuote={openQuote}
      />,
    )
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    await userEvent.click(
      within(panel).getByRole('button', {
        name: /^(Start the quote|Open the draft already standing)$/,
      }),
    )
    await screen.findByTestId('picker-made')
    const filed = quotes
      .getState()
      .quotes.find((q) => q.rootTableId === model.tableId && q.rootRowId === opening?.rowId)
    expect(filed).toBeDefined()
    expect(openQuote).toHaveBeenCalledWith(filed?.id)
  })

  it('hands back a draft standing for any version of the model rather than writing a second', () => {
    const model = manyMaterials()
    /* the draft the case above filed, on the opening version */
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(
      within(panel).getByRole('button', { name: 'Open the draft already standing' }),
    ).toBeInTheDocument()
  })

  it('opens on the version an address names, at that version’s own price', () => {
    const model = manyMaterials()
    const row = model.variants.findLast((v) => v.amount !== null && v.amount !== model.from)
    expect(row).toBeDefined()
    render(<Picker at={{ brand: model.tableId, model: model.key, row: row?.rowId }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(panel.querySelector('.picker-money__fig')).toHaveTextContent(
      new RegExp(`^${escape(money(row?.amount as number))}$`),
    )
  })
})

describe('pressing the act', () => {
  beforeAll(async () => {
    await loadTheFile()
    await quotes.getState().openFor('northside')
    session.getState().signIn('Asaf')
  })

  const oneLine = (): Model =>
    fleet.brands
      .find((b) => b.id === 'boat_stacer')
      ?.models.find((m) => !m.splits && m.from !== null) as Model

  it('mints a quote, files it in this browser, names it, and opens the build on it', async () => {
    const model = oneLine()
    const openQuote = vi.fn<(quoteId: string) => void>()
    render(
      <Picker
        at={{ brand: model.tableId, model: model.key }}
        now={() => AT}
        openQuote={openQuote}
      />,
    )
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    await userEvent.click(within(panel).getByRole('button', { name: 'Start the quote' }))

    const made = await screen.findByTestId('picker-made')
    const filed = quotes.getState().quotes.find((q) => q.rootRowId === model.variants[0].rowId)
    expect(filed).toBeDefined()
    expect(openQuote).toHaveBeenCalledWith(filed?.id)
    expect(within(made).getByText(filed?.reference as string)).toBeInTheDocument()
    /* no route is written out as text on a showroom screen (rule c) and
       nothing says a screen is missing */
    expect(made.textContent).not.toMatch(/\/quote\//)
    expect(made.textContent).not.toMatch(/not built/)
  })

  it('says what it wrote and claims to go nowhere when it is handed nowhere to go', async () => {
    const model = fleet.brands
      .find((b) => b.id === 'boat_stacer')
      ?.models.filter((m) => !m.splits && m.from !== null)[1] as Model
    render(<Picker at={{ brand: model.tableId, model: model.key }} now={() => AT} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    await userEvent.click(within(panel).getByRole('button', { name: 'Start the quote' }))
    const made = await screen.findByTestId('picker-made')
    expect(made).toHaveTextContent(/is started/)
    expect(made.textContent).not.toMatch(/opening/)
  })

  it('hands back the draft already standing for that boat rather than writing a second', async () => {
    const model = oneLine()
    const before = quotes.getState().quotes.length
    render(<Picker at={{ brand: model.tableId, model: model.key }} now={() => AT} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Open the draft already standing' })
    expect(panel).toHaveTextContent(/reopens it rather than starting a second/)
    await userEvent.click(act)
    expect(await screen.findByText(/was already open/)).toBeInTheDocument()
    expect(quotes.getState().quotes.length).toBe(before)
  })

  /* THE ACT KEEPS THE WORDS IT WAS PRESSED UNDER (components-critique-2.md,
     major 4). The press files its draft, and the render that filing caused
     found a draft standing for this boat: on a boat that had none, the act
     re-labelled itself "Open the draft already standing" and said it
     "reopens it rather than starting a second" directly above "Quote … is
     started — opening the build". A draft does stand now, and the act still
     says what was pressed; the next plate for this boat says the draft. */
  it('keeps the words it was pressed under while the quote it wrote opens', async () => {
    const model = fleet.brands
      .find((b) => b.id === 'boat_stacer')
      ?.models.findLast((m) => !m.splits && m.from !== null) as Model
    const row = model.variants[0].rowId
    expect(quotes.getState().unaddressedDraftFor(model.tableId, row)).toBeUndefined()
    const openQuote = vi.fn<(quoteId: string) => void>()
    const at = { brand: model.tableId, model: model.key }
    const first = render(<Picker at={at} now={() => AT} openQuote={openQuote} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    await userEvent.click(within(panel).getByRole('button', { name: 'Start the quote' }))

    const made = await screen.findByTestId('picker-made')
    expect(made).toHaveTextContent(/is started — opening the build/)
    expect(quotes.getState().unaddressedDraftFor(model.tableId, row)).toBeDefined()
    expect(within(panel).getByRole('button', { name: 'Start the quote' })).toBeInTheDocument()
    expect(
      within(panel).queryByRole('button', { name: 'Open the draft already standing' }),
    ).toBeNull()
    expect(panel).not.toHaveTextContent(/reopens|already started/)
    first.unmount()

    render(<Picker at={at} now={() => AT} openQuote={openQuote} />)
    const again = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(
      within(again).getByRole('button', { name: 'Open the draft already standing' }),
    ).toBeInTheDocument()
    expect(again).toHaveTextContent(/reopens it rather than starting a second/)
  })

  /* THE PHOTOGRAPH THE ACT CARRIES ONTO THE BUILD'S STAGE (the component kit,
     2026-09-28). The route's View Transition morphs a picture only where the
     same name stands on both screens, and the build names its stage by the
     row the quote was written against — so the plate must name its picture
     by exactly that row, read here off the quote the act really filed. */
  it('names the plate’s photograph by the row the quote it writes is for', async () => {
    const model = fleet.brands
      .find((b) => b.id === 'boat_stacer')
      ?.models.filter((m) => !m.splits && m.from !== null && pictureOf(m) !== null)[2] as Model
    render(<Picker at={{ brand: model.tableId, model: model.key }} now={() => AT} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    await userEvent.click(within(panel).getByRole('button', { name: 'Start the quote' }))
    await screen.findByTestId('picker-made')
    const filed = quotes.getState().quotes.find((q) => q.rootRowId === model.variants[0].rowId)
    expect(filed).toBeDefined()
    const photo = panel.querySelector<HTMLImageElement>('img.picker-shot__img')
    expect(photo?.style.getPropertyValue('--picker-travel')).toBe(
      boatTravel(filed!.rootTableId, filed!.rootRowId),
    )
  })
})

/* ============================================================
   THE PLATE'S FOOT. The first fault these answer was measured at 1440
   x 900: the whole plate was one scroller, so `Start the quote` stood
   at top 857 with nine pixels sliced by the window. The fix put the
   price and the act in a FOOT that never scrolls — and left the chips
   in the BODY that does, which was the second fault
   (built-critique-m2.md #3). A component test cannot measure a pixel,
   but it can hold the structure the fix rests on: EVERYTHING THE ACT
   WAITS ON is in the foot with it, before it; only what the boat IS —
   its picture and its figures — is in the body.
   ============================================================ */
describe("the plate's foot", () => {
  beforeAll(async () => {
    await loadTheFile()
    await quotes.getState().openFor('northside')
    session.getState().signIn('Asaf')
  })

  const manyMaterials = (): Model =>
    fleet.brands
      .flatMap((b) => b.models)
      .find((m) => m.materials.length > 1 && pictureOf(m) !== null) as Model

  /* REWRITTEN 2026-10-31: the foot held the material and colour chips over the act; they are
     chosen in the hull section now, so the foot is the price, the act and its sentence */
  it('holds the price, the act and its sentence in one block, and the picture in the body', () => {
    const model = manyMaterials()
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: /Start the quote|Open the draft/ })
    const foot = act.closest('.picker-stage__foot')
    expect(foot).not.toBeNull()
    const block = act.closest('.picker-go') as HTMLElement
    expect(block).not.toBeNull()
    expect(block).toContainElement(panel.querySelector('.picker-money__fig'))
    expect(block).toContainElement(panel.querySelector('.picker-act__say'))
    /* the act is the foot's one press */
    expect(foot?.querySelectorAll('button')).toHaveLength(1)
    /* while the boat's own picture is in the body, which may scroll */
    expect(
      panel.querySelector('img.picker-shot__img')?.closest('.picker-stage__body'),
    ).not.toBeNull()
  })

  /* THE M2-CLOSE CRITIQUE, FINDING 11: Home sells the Stacer 519 Sea
     Ranger SDF with its photograph on the water, and this plate drew
     "No photograph of the 519 Sea Ranger SDF … is held yet" for both of
     its versions — the row's own address is one nobody holds, and the
     picker never read the heroes ledger Home and the build stand it on. */
  /* THE GATE ROUND, 2026-10-20: that photograph shows a SIDE console, so it is drawn on the Side
     Console's card and plate and never on the Centre Console's. */
  it('draws the photograph Home sells on the Stacer 519 Side Console, card and plate, and never on the Centre Console', () => {
    const stacer = fleet.brands.find((b) => b.id === 'boat_stacer') as Brand
    const both = stacer.models.filter((m) => m.name.includes('519 Sea Ranger SDF'))
    expect(both.map((m) => m.shown)).toHaveLength(2)
    const centre = both.find((m) => m.name.includes('Centre Console'))!
    expect(pictureOf(centre)?.at ?? '').not.toContain('stacer-519-sea-ranger')
    for (const model of both.filter((m) => m !== centre)) {
      /* the reason the old screen said no photograph: the row's own copy */
      expect(heldCopy(model), model.shown).toBeNull()
      const picture = pictureOf(model)
      expect(picture?.at, model.shown).toContain('stacer-519-sea-ranger')

      const { unmount } = render(<Picker at={{ brand: stacer.id, model: model.key }} />)
      const card = within(screen.getByRole('region', { name: 'Models' })).getByRole('button', {
        name: new RegExp(`^${escape(model.shown)},`),
      })
      const onCard = card.querySelector('img.picker-photo')
      expect(onCard?.getAttribute('src')).toBe(picture?.at)
      /* a photograph held at 2,560 reaches a card at its narrowest copy */
      expect(onCard?.getAttribute('srcset')).toMatch(/ 640w/)

      const panel = screen.getByRole('complementary', { name: 'What is chosen' })
      const onPlate = panel.querySelector('img.picker-shot__img')
      expect(onPlate?.getAttribute('src')).toBe(picture?.at)
      expect(onPlate?.getAttribute('alt')).toBe(picture?.subject)
      expect(within(panel).queryByText(/No photograph/)).toBeNull()
      unmount()
    }
  })

  it('never draws the 519’s photograph for the 539, though the file points it at the 519’s picture', () => {
    const stacer = fleet.brands.find((b) => b.id === 'boat_stacer') as Brand
    const others = stacer.models.filter((m) => /\b(539|589) Sea Ranger SDF/u.test(m.name))
    expect(others.length).toBeGreaterThan(0)
    for (const model of others) expect(pictureOf(model)?.at ?? '').not.toContain('stacer-519')
  })

  it('names no picture it does not hold, in one line where the picture would be', () => {
    const model = fleet.brands.flatMap((b) => b.models).find((m) => pictureOf(m) === null) as Model
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(panel.querySelector('img.picker-shot__img')).toBeNull()
    expect(within(panel).getByText('No photograph of this boat yet.')).toBeInTheDocument()
    /* THE PLATE NAMES ITS BOAT ONCE, in its heading: the absence is not the name set large
       and then the name again in a sentence (the refine round, 2026-10-21) */
    expect(panel.querySelector('.picker-shot')?.textContent).not.toContain(model.said)
  })

  /* build-close-critique.md, minor 14 of the second critique: "519" drew one card per
     series row and left two thirds of the list blank */
  it('sets what a search found side by side, each card naming its series', async () => {
    const stacer = fleet.brands.find((b) => b.name === 'Stacer') as Brand
    const found = matchModels(modelsOf(fleet, stacer.id), '519')
    const groups = seriesOf(stacer, new Set(found.map((m) => m.key)))
    expect(groups.length).toBeGreaterThan(1)
    render(<Picker at={{ brand: stacer.id }} />)
    await userEvent.type(screen.getByLabelText(/Find a model/), '519')
    const index = screen.getByRole('region', { name: 'Models' })
    expect(within(index).queryAllByRole('heading', { level: 3 })).toHaveLength(0)
    expect(index.querySelectorAll('ul.picker-cards')).toHaveLength(1)
    for (const group of groups) {
      for (const model of group.models) {
        const card = within(index).getByRole('button', {
          name: new RegExp(`^${escape(model.shown)},.*${escape(group.label)}$`),
        })
        /* the series is named once on the card: over the name where the name does not carry
           it, and by the name alone where it does — "SEA RANGER · CENTRE CONSOLES" stood over
           "519 Sea Ranger SDF · Centre Console" (the refine round's second pass) */
        const eyebrow = card.querySelector('.picker-card__series')
        if (eyebrow) {
          expect(eyebrow.textContent?.replace(/\s+/g, ' ')).toBe(group.label.replace(/\s+/g, ' '))
        }
        const stem = (group.label.split(/\s+/)[0] ?? '').toLowerCase().replace(/s$/, '')
        const text = (card.textContent ?? '').toLowerCase()
        expect(text.split(stem).length - 1).toBe(1)
      }
    }
  })
})

/* Counts on this screen were once written down rather than measured.
   A second dealership's file would have made each of them a lie. */
describe('the words that are counts', () => {
  beforeAll(async () => {
    await loadTheFile()
    await quotes.getState().openFor('northside')
    session.getState().signIn('Asaf')
  })

  /* REWRITTEN 2026-10-31: from the first question the field searches everything sold, so what
     it says when nothing matches is about the price list and not about seven makers */
  it('says what nothing matched in, when nothing matches what was typed', async () => {
    const { unmount } = render(<Picker />)
    await userEvent.type(screen.getByLabelText(/Find a model/), 'zzzzqx')
    expect(screen.getByText('Nothing on the price list is called that.')).toBeInTheDocument()
    unmount()
    const brand = fleet.brands[0] as Brand
    render(<Picker at={{ brand: brand.id }} />)
    await userEvent.type(screen.getByLabelText(/Find a model/), 'zzzzqx')
    expect(screen.getByText(`No model from ${brand.name} is called that.`)).toBeInTheDocument()
  })

  it('has a singular: one model MATCHES', async () => {
    const found = fleet.brands
      .flatMap((b) => b.models.map((m) => ({ brand: b, model: m })))
      .find(({ brand, model }) => matchModels(brand.models, model.name).length === 1)
    expect(found).toBeDefined()
    const only = found?.model as Model
    render(<Picker at={{ brand: found?.brand.id }} />)
    await userEvent.type(screen.getByLabelText(/Find a model/), only.name)
    /* the whole sentence, read off its paragraph: the count is the kit's Figure, an element
       of its own inside it (2026-09-29), so no one element's own text is the sentence */
    expect(document.getElementById('picker-find-said')).toHaveTextContent(
      `1 model matches from ${found?.brand.name ?? ''}.`,
    )
  })
})

describe('the picker with no price file in this browser', () => {
  beforeAll(async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
  })

  /* A SCREEN MAY SAY IT DOES NOT KNOW YET; it may not say the opposite
     of what it is about to say. */
  it('says it is still looking while this browser is being read', () => {
    catalogue.setState({ status: 'loading', problem: null })
    render(<Picker openTheFile={() => undefined} />)
    expect(screen.getByText(/Looking for the price list/)).toBeInTheDocument()
    expect(screen.queryByText(/No boats to choose from yet/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Load the Master Price File' })).toBeNull()
    catalogue.setState({ status: 'ready' })
  })

  it('says there is nothing to choose and offers the door back to the file', async () => {
    const openTheFile = vi.fn<() => void>()
    render(<Picker openTheFile={openTheFile} />)
    expect(screen.getByText(/No boats to choose from yet/)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Boats' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Load the Master Price File' }))
    expect(openTheFile).toHaveBeenCalled()
  })
})

/** A literal string, safe inside a RegExp. */
const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
