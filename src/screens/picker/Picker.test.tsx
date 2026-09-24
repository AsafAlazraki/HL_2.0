import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, RowData } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import {
  featuredOf,
  flagshipOf,
  fleetOf,
  matchModels,
  modelsOf,
  unreadIn,
  variantsIn,
  type Brand,
  type Fleet,
  type Model,
} from './fleet'
import { heldCopy, pictureOf } from './pictures'
import { Picker, type PickerAt } from './Picker'

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
const colours = (n: number): string => `${n} ${n === 1 ? 'colour' : 'colours'}`

/* THE DATABASE'S OWN WORDS, which the M2-close critique counted on this
   screen — 128 "row" or "rows" and 10 "register" at 1440 — and which a
   showroom never says. "rung" is the engine's word for a price level. */
const DATABASE = /\brows?\b|\bregisters?\b|\brung\b/i

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

  it('counts the boats and the makers in the band, and names the price they are read at', () => {
    render(<Picker />)
    const counts = screen.getByTestId('picker-counts')
    expect(counts).toHaveTextContent(models(fleet.models))
    expect(counts).toHaveTextContent(`${fleet.brands.length} makers`)
    expect(counts).toHaveTextContent(`${fleet.rung} prices`)
  })

  it('opens on the makers: one door each, with its models and the price they start from', () => {
    render(<Picker />)
    const doors = screen.getByRole('region', { name: 'Makers' })
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

  it('puts on each door the dearest boat it holds a photograph of, and names it there', () => {
    render(<Picker />)
    const doors = screen.getByRole('region', { name: 'Makers' })
    for (const brand of fleet.brands) {
      const flagship = flagshipOf(brand, (m) => pictureOf(m) !== null)
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
      expect(within(door).getByText(flagship.shown)).toBeInTheDocument()
    }
  })

  it('draws one door two cells wide when that fills the last row, and only that one', () => {
    render(<Picker />)
    const featured = featuredOf(fleet)
    const wide = document.querySelectorAll('.picker-door[data-featured]')
    expect(wide.length).toBe(featured === null ? 0 : 1)
  })

  it('writes the maker into the position when a door is pressed', async () => {
    const goTo = vi.fn<(next: PickerAt) => void>()
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
    const goTo = vi.fn<(next: PickerAt) => void>()
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

  it('draws a boat’s photograph where one is held, and its name as a cover where none is', () => {
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
    /* nothing stands in: no picture at all, and the cover is the boat's own name */
    expect(without.querySelector('img')).toBeNull()
    expect(without.querySelector('.picker-card__cover')).toHaveTextContent(none.shown)
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
    const goTo = vi.fn<(next: PickerAt) => void>()
    const brand = fleet.brands.toSorted((a, b) => a.models.length - b.models.length)[0]
    const model = brand.models[0]
    render(<Picker at={{ brand: brand.id }} goTo={goTo} />)
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(`^${escape(model.shown)},`) }),
    )
    expect(goTo).toHaveBeenCalledWith({ brand: brand.id, model: model.key })
  })

  it('says where the price would be when the file holds only a zero there', () => {
    const none = fleet.brands.find((b) => b.from === null) as Brand
    expect(none).toBeDefined()
    const model = none.models[0]
    render(<Picker at={{ brand: none.id, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(within(panel).getByText('No price on file')).toBeInTheDocument()
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
      const words = container.textContent ?? ''
      expect(words, JSON.stringify(at)).not.toMatch(DATABASE)
      unmount()
    }
  })
})

describe('a model built in many versions', () => {
  beforeAll(async () => {
    await loadTheFile()
    session.getState().signIn('Asaf')
  })

  const manyMaterials = (): Model =>
    fleet.brands.flatMap((b) => b.models).find((m) => m.materials.length > 1) as Model

  it('refuses the act with its reason until one is chosen, and never with a dead control', () => {
    const model = manyMaterials()
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Start the quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    /* refused, and still reachable by a keyboard and still named */
    expect(act).toHaveAccessibleDescription(
      `A quote is for one ${model.shown} in one material and colour, so choose a material above first.`,
    )
  })

  /* TWO QUESTIONS, ASKED ONE AT A TIME. The material is what moves the
     price, so it is asked first and the colours of that material follow
     — which is also what keeps fifteen chips off the plate before
     anybody has narrowed anything. */
  it('offers every material with its own price, and asks the colour only after one', async () => {
    const model = manyMaterials()
    const goTo = vi.fn<(next: PickerAt) => void>()
    render(<Picker at={{ brand: model.tableId, model: model.key }} goTo={goTo} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    for (const group of model.materials) {
      expect(
        within(panel).getByRole('button', {
          name: `${group.label}, ${colours(group.variants.length)}`,
        }),
      ).toBeInTheDocument()
    }
    /* no colour is on the plate until a material has been chosen */
    expect(within(panel).queryByText(/^Colour ·/)).toBeNull()

    const first = model.materials[0]
    await userEvent.click(
      within(panel).getByRole('button', {
        name: `${first.label}, ${colours(first.variants.length)}`,
      }),
    )
    /* pressing it chooses that material's first colour, so the act is
       live from that moment and the colour is a refinement */
    expect(goTo).toHaveBeenCalledWith({
      brand: model.tableId,
      model: model.key,
      row: first.variants[0].rowId,
    })
  })

  it('lists every colour of the chosen material as the code the file carries', () => {
    const model = manyMaterials()
    const group = model.materials[0]
    render(<Picker at={{ brand: model.tableId, model: model.key, row: group.variants[0].rowId }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(
      within(panel).getByText(new RegExp(`^Colour · ${group.variants.length} `)),
    ).toBeInTheDocument()
    for (const variant of group.variants) {
      expect(within(panel).getAllByText(variant.code).length).toBeGreaterThan(0)
    }
  })

  /* THE SENTENCE NAMES WHAT IS IN THE LIST IT SITS UNDER, so the case
     is built the same way: the first version whose own material's codes
     really do carry a token nothing decodes. */
  it('prints an undecoded colour as the code it is, and says it is a question for the dealer', () => {
    const found = fleet.brands
      .flatMap((b) => b.models)
      .flatMap((m) => m.variants.map((v) => ({ model: m, row: v })))
      .find(({ model, row }) => unreadIn(variantsIn(model, row.material)).length > 0) as {
      model: Model
      row: { rowId: string; material: string }
    }
    expect(found).toBeDefined()
    const { model, row } = found
    const shown = unreadIn(variantsIn(model, row.material))
    render(<Picker at={{ brand: model.tableId, model: model.key, row: row.rowId }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const note = within(panel).getByText(/question for the dealer, never a guess/)
    expect(shown.length).toBeGreaterThan(0)
    for (const token of shown) {
      expect(token).toMatch(/^[A-Z]+$/)
      expect(note.textContent).toContain(token)
    }
    expect(
      within(panel).getAllByRole('button', { name: /a code with no colour name on file/ }).length,
    ).toBeGreaterThan(0)
  })

  it('becomes live once one is chosen, at that version’s own price', () => {
    const model = manyMaterials()
    const row = model.variants[0]
    render(<Picker at={{ brand: model.tableId, model: model.key, row: row.rowId }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Start the quote' })
    expect(act).not.toHaveAttribute('aria-disabled', 'true')
    expect(panel.querySelector('.picker-money__fig')).toHaveTextContent(money(row.amount as number))
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

  it('holds the question, the price and the act together, and scrolls only the picture', () => {
    const model = manyMaterials()
    const row = model.variants[0]
    render(<Picker at={{ brand: model.tableId, model: model.key, row: row.rowId }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Start the quote' })
    const foot = act.closest('.picker-stage__foot')
    expect(foot).not.toBeNull()
    expect(foot).toContainElement(
      within(foot as HTMLElement).getByText(money(row.amount as number), {
        selector: '.picker-money__fig *',
      }),
    )
    const first = model.materials[0]
    const material = within(panel).getByRole('button', {
      name: `${first.label}, ${first.variants.length} ${first.variants.length === 1 ? 'colour' : 'colours'}`,
    })
    expect(foot).toContainElement(material)
    for (const variant of variantsIn(model, row.material)) {
      const chip = within(foot as HTMLElement)
        .getAllByText(variant.code)
        .find((el) => el.closest('button') !== null)
      expect(chip, `the colour ${variant.code} is not in the foot`).toBeDefined()
    }
    /* while the boat's own picture is in the body, which may scroll */
    expect(
      panel.querySelector('img.picker-shot__img')?.closest('.picker-stage__body'),
    ).not.toBeNull()
  })

  it('stands a one-material model’s colours in the foot too — the ADV7 case', () => {
    /* found, not named: a model of several versions in ONE material,
       whose colour is the only question and the gate on the act */
    const model = fleet.brands
      .flatMap((b) => b.models)
      .find((m) => m.splits && m.materials.length === 1) as Model
    expect(model).toBeDefined()
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Start the quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(act).toHaveAccessibleDescription(
      `A quote is for one ${model.shown} in one colour, so choose a colour above first.`,
    )
    const foot = act.closest('.picker-stage__foot') as HTMLElement
    const first = model.variants[0]
    const chip = within(foot)
      .getAllByText(first.code)
      .map((el) => el.closest('button'))
      .find((el) => el !== null) as HTMLElement
    expect(chip).toBeDefined()
    /* ABOVE, and in the same block that never scrolls */
    expect(chip.compareDocumentPosition(act) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  /* THE M2-CLOSE CRITIQUE, FINDING 11: Home sells the Stacer 519 Sea
     Ranger SDF with its photograph on the water, and this plate drew
     "No photograph of the 519 Sea Ranger SDF … is held yet" for both of
     its versions — the row's own address is one nobody holds, and the
     picker never read the heroes ledger Home and the build stand it on. */
  it('draws the photograph Home sells on both versions of the Stacer 519, card and plate', () => {
    const stacer = fleet.brands.find((b) => b.id === 'boat_stacer') as Brand
    const both = stacer.models.filter((m) => m.name.includes('519 Sea Ranger SDF'))
    expect(both.map((m) => m.shown)).toHaveLength(2)
    for (const model of both) {
      /* the reason the old screen said no photograph: the row's own copy */
      expect(heldCopy(model.img?.src), model.shown).toBeNull()
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
      expect(within(panel).queryByText(/No photograph of the/)).toBeNull()
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
    expect(
      within(panel).getByText(`No photograph of the ${model.shown} is held yet.`),
    ).toBeInTheDocument()
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

  it('counts the makers rather than saying seven, when nothing matches what was typed', async () => {
    render(<Picker />)
    await userEvent.type(screen.getByLabelText(/Find a model/), 'zzzzqx')
    expect(
      screen.getByText(`No model from the ${fleet.brands.length} makers is called that.`),
    ).toBeInTheDocument()
  })

  it('has a singular: one model MATCHES', async () => {
    const only = fleet.brands
      .flatMap((b) => b.models)
      .find((m) => matchModels(modelsOf(fleet, null), m.name).length === 1) as Model
    expect(only).toBeDefined()
    render(<Picker />)
    await userEvent.type(screen.getByLabelText(/Find a model/), only.name)
    expect(screen.getByText('1 model matches.')).toBeInTheDocument()
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
    expect(screen.getByText(/Looking for a price file in this browser/)).toBeInTheDocument()
    expect(screen.queryByText(/No boats to choose from yet/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Load the Master Price File' })).toBeNull()
    catalogue.setState({ status: 'ready' })
  })

  it('says there is nothing to choose and offers the door back to the file', async () => {
    const openTheFile = vi.fn<() => void>()
    render(<Picker openTheFile={openTheFile} />)
    expect(screen.getByText(/No boats to choose from yet/)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Makers' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Load the Master Price File' }))
    expect(openTheFile).toHaveBeenCalled()
  })
})

/** A literal string, safe inside a RegExp. */
const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
