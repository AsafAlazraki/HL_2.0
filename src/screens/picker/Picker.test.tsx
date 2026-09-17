import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, ModuleDef, RowData } from '@/domain/model'
import { money } from '@/domain/money'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { fleetOf, unreadIn, variantsIn, type Fleet, type Model } from './fleet'
import { NO_CONFIGURATOR, Picker, type PickerAt } from './Picker'

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

  it('counts the whole shelf in the masthead, and names the rung the figures are read at', () => {
    render(<Picker />)
    const counts = screen.getByTestId('picker-counts')
    expect(within(counts).getByText(fleet.rows.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(counts).getByText(fleet.models.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(counts).getByText(fleet.series.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(counts).getByText(fleet.rung)).toBeInTheDocument()
    expect(
      within(counts).getByText(new RegExp(`${fleet.priced.toLocaleString('en-AU')} of those rows`)),
    ).toBeInTheDocument()
  })

  it('draws a counted rail: every register with its own row count, and All with the total', () => {
    render(<Picker />)
    const rail = screen.getByRole('region', { name: 'Registers' })
    expect(
      within(rail).getByRole('button', {
        name: `All registers, ${fleet.rows.toLocaleString('en-AU')} rows`,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    for (const brand of fleet.brands) {
      expect(
        within(rail).getByRole('button', {
          name: `${brand.name}, ${brand.rows.toLocaleString('en-AU')} rows`,
        }),
      ).toBeInTheDocument()
    }
    expect(within(rail).getAllByRole('listitem')).toHaveLength(fleet.brands.length + 1)
  })

  /* Opened on the SHORTEST register on the sheet, because this case is
     about the rail and not about the index: rendering all 289 models to
     press one of eight rail rows is thirty seconds of a suite spent on
     a list nothing here asserts. */
  it('writes the register into the position when one is pressed', async () => {
    const goTo = vi.fn<(next: PickerAt) => void>()
    const smallest = fleet.brands.toSorted((a, b) => a.rows - b.rows)[0]
    const wanted = fleet.brands.find((b) => b.id !== smallest.id) as Fleet['brands'][number]
    render(<Picker at={{ brand: smallest.id }} goTo={goTo} />)
    await userEvent.click(
      screen.getByRole('button', {
        name: `${wanted.name}, ${wanted.rows.toLocaleString('en-AU')} rows`,
      }),
    )
    expect(goTo).toHaveBeenCalledWith({ brand: wanted.id })

    await userEvent.click(
      screen.getByRole('button', {
        name: `All registers, ${fleet.rows.toLocaleString('en-AU')} rows`,
      }),
    )
    expect(goTo).toHaveBeenLastCalledWith({})
  })

  it('narrows the index to the chosen register and re-fills the panel rather than blanking it', () => {
    const brand = fleet.brands.find((b) => b.id === 'boat_highfield') as Fleet['brands'][number]
    render(<Picker at={{ brand: brand.id }} />)

    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent(brand.name)
    expect(within(panel).getByText(brand.models.length.toLocaleString('en-AU'))).toBeInTheDocument()

    const index = screen.getByRole('region', { name: 'Models' })
    /* every series of that register is a heading, and no other
       register's is */
    for (const series of brand.series) {
      expect(
        within(index).getByRole('heading', { name: new RegExp(escape(series.label)) }),
      ).toBeInTheDocument()
    }
  })

  it('collapses a register that files a row per variant onto its models, and says so on each row', () => {
    const brand = fleet.brands.find((b) => b.id === 'boat_highfield') as Fleet['brands'][number]
    render(<Picker at={{ brand: brand.id }} />)
    const index = screen.getByRole('region', { name: 'Models' })
    const many = brand.models.find((m) => m.splits) as Model
    const row = within(index).getByText(many.name).closest('button')
    expect(row).not.toBeNull()
    expect(
      within(row as HTMLElement).getByText(`${many.rows} rows`, { exact: false }),
    ).toBeInTheDocument()
  })

  it('prints a from-price at the rung, and a sentence where a register has no figure', () => {
    const priced = fleet.brands.find((b) => b.from !== null) as Fleet['brands'][number]
    render(<Picker at={{ brand: priced.id }} />)
    const index = screen.getByRole('region', { name: 'Models' })
    const model = priced.models.find((m) => m.from !== null) as Model
    const row = within(index).getByText(model.name).closest('button') as HTMLElement
    expect(within(row).getByText(money(model.from as number))).toBeInTheDocument()
  })

  it('says where the price would be when the file holds only a zero there', () => {
    const none = fleet.brands.find((b) => b.from === null) as Fleet['brands'][number]
    expect(none).toBeDefined()
    const model = none.models[0]
    render(<Picker at={{ brand: none.id, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(
      within(panel).getByText(new RegExp(`No price at the ${none.rung} rung`)),
    ).toBeInTheDocument()
    expect(within(panel).getByText(/a zero is not a price/)).toBeInTheDocument()
    /* and the act is live all the same — never a dimmed control */
    expect(within(panel).getByRole('button', { name: 'Start the quote' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})

describe('a model that is many rows of the file', () => {
  beforeAll(async () => {
    await loadTheFile()
    session.getState().signIn('Asaf')
  })

  const manyRowed = (): Model =>
    fleet.brands.flatMap((b) => b.models).find((m) => m.materials.length > 1) as Model

  it('refuses the act with its reason until one row is chosen, and never with a dead control', () => {
    const model = manyRowed()
    render(<Picker at={{ brand: model.tableId, model: model.key }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Start the quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(
      within(panel).getByText(new RegExp(`This model is ${model.rows} rows`)),
    ).toBeInTheDocument()
    /* refused, and still reachable by a keyboard and still named */
    expect(act).toHaveAccessibleDescription(new RegExp(`${model.rows} rows of the price file`))
  })

  /* TWO QUESTIONS, ASKED ONE AT A TIME. The material is what moves the
     figure, so it is asked first and the colourways of that material
     follow — which is also what keeps fifteen chips off the plate
     before anybody has narrowed anything. */
  it('offers every material with its own figure, and asks the colourway only after one', async () => {
    const model = manyRowed()
    const goTo = vi.fn<(next: PickerAt) => void>()
    render(<Picker at={{ brand: model.tableId, model: model.key }} goTo={goTo} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    for (const group of model.materials) {
      expect(
        within(panel).getByRole('button', {
          name: `${group.label}, ${group.variants.length} rows`,
        }),
      ).toBeInTheDocument()
    }
    /* no colourway is on the plate until a material has been chosen */
    expect(within(panel).queryByText(/^Colourway —/)).toBeNull()

    const first = model.materials[0]
    await userEvent.click(
      within(panel).getByRole('button', {
        name: `${first.label}, ${first.variants.length} rows`,
      }),
    )
    /* pressing it chooses that material's first row, so the act is live
       from that moment and the colourway is a refinement */
    expect(goTo).toHaveBeenCalledWith({
      brand: model.tableId,
      model: model.key,
      row: first.variants[0].rowId,
    })
  })

  it('lists every colourway of the chosen material as the code the file carries', () => {
    const model = manyRowed()
    const group = model.materials[0]
    render(<Picker at={{ brand: model.tableId, model: model.key, row: group.variants[0].rowId }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    expect(
      within(panel).getByText(new RegExp(`^Colourway — ${group.variants.length} `)),
    ).toBeInTheDocument()
    for (const variant of group.variants) {
      expect(within(panel).getAllByText(variant.code).length).toBeGreaterThan(0)
    }
  })

  /* THE SENTENCE NAMES WHAT IS IN THE LIST IT SITS UNDER, so the case
     is built the same way: the first row whose own material's codes
     really do carry a token nothing decodes. */
  it('prints an undecoded colourway as the code it is, and says it is a question for the dealer', () => {
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
      /* a code, in the file's own alphabet, printed as itself */
      expect(token).toMatch(/^[A-Z]+$/)
      expect(note.textContent).toContain(token)
    }
    /* and the chip beside it says what it is: not decoded, not a guess */
    expect(within(panel).getAllByText('not decoded').length).toBeGreaterThan(0)
  })

  it('becomes live once a row is chosen, and says which row it would write against', () => {
    const model = manyRowed()
    const row = model.variants[0]
    render(<Picker at={{ brand: model.tableId, model: model.key, row: row.rowId }} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Start the quote' })
    expect(act).not.toHaveAttribute('aria-disabled', 'true')
    expect(within(panel).getByText(new RegExp(escape(row.label)))).toBeInTheDocument()
  })
})

describe('pressing the act', () => {
  beforeAll(async () => {
    await loadTheFile()
    await quotes.getState().openFor('northside')
    session.getState().signIn('Asaf')
  })

  const oneRowed = (): Model =>
    fleet.brands
      .find((b) => b.id === 'boat_stacer')
      ?.models.find((m) => !m.splits && m.from !== null) as Model

  it('mints a quote, files it in this browser and says plainly where it would go', async () => {
    const model = oneRowed()
    render(<Picker at={{ brand: model.tableId, model: model.key }} now={() => AT} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    await userEvent.click(within(panel).getByRole('button', { name: 'Start the quote' }))

    const made = await screen.findByTestId('picker-made')
    const filed = quotes.getState().quotes.find((q) => q.rootRowId === model.variants[0].rowId)
    expect(filed).toBeDefined()
    expect(within(made).getByText(filed?.reference as string)).toBeInTheDocument()
    expect(within(made).getByText(`/quote/${filed?.id ?? ''}`)).toBeInTheDocument()
    expect(within(made).getByText(new RegExp(escape(NO_CONFIGURATOR)))).toBeInTheDocument()
  })

  it('hands back the draft already standing for that row rather than writing a second', async () => {
    const model = oneRowed()
    const before = quotes.getState().quotes.length
    render(<Picker at={{ brand: model.tableId, model: model.key }} now={() => AT} />)
    const panel = screen.getByRole('complementary', { name: 'What is chosen' })
    const act = within(panel).getByRole('button', { name: 'Open the draft already standing' })
    await userEvent.click(act)
    expect(await screen.findByText(/was already open/)).toBeInTheDocument()
    expect(quotes.getState().quotes.length).toBe(before)
  })
})

describe('the picker with no price file in this browser', () => {
  beforeAll(async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
  })

  /* A SCREEN MAY SAY IT DOES NOT KNOW YET; it may not say the opposite
     of what it is about to say. Reaching this address in a fresh tab
     reads the sheet back out of IndexedDB — about 300 ms, measured —
     and for as long as that takes the honest answer is "looking", not
     "no price file has been read into this browser". */
  it('says it is still looking while this browser is being read', () => {
    catalogue.setState({ status: 'loading', problem: null })
    render(<Picker openTheFile={() => undefined} />)
    expect(screen.getByText(/Looking for a price file in this browser/)).toBeInTheDocument()
    expect(screen.queryByText(/A blank sheet/)).toBeNull()
    /* and the door is not offered against a question nobody has
       answered yet */
    expect(screen.queryByRole('button', { name: 'Load the Master Price File' })).toBeNull()
    catalogue.setState({ status: 'ready' })
  })

  it('says the sheet is blank and offers the door back to the file', async () => {
    const openTheFile = vi.fn<() => void>()
    render(<Picker openTheFile={openTheFile} />)
    expect(screen.getByText(/A blank sheet/)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Registers' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Load the Master Price File' }))
    expect(openTheFile).toHaveBeenCalled()
  })
})

/** A literal string, safe inside a RegExp. */
const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
