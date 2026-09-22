import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { NO_SHEET, noTable } from './read'
import { Sheet } from './Sheet'

/* ============================================================
   THE SHEET, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   The real pack is loaded into the real catalogue store before every
   case, so every figure asserted below is counted off the file and
   never typed: how many variants, how many series, which name the
   first row carries. The walk through the real door in a real browser
   is `e2e/flows/sheet.spec.ts`; this is the screen with no router and
   no window, which is where a refusal's sentence and a write's way
   back can be driven quickly and exactly.

   THE VIRTUALISER IS TOLD HOW MANY PIECES TO DRAW. react-virtuoso
   measures its scroller to decide what to render, and a document with
   no layout measures nothing; `initialItemCount` on the grid draws the
   first pieces regardless, which is how the first rows exist here.
   ============================================================ */

let pack: PackFixture
const HIGHFIELD = 'boat_highfield'

beforeAll(async () => {
  pack = await loadPack()
  /* a box that never measures still has to exist for the virtualiser */
  if (typeof globalThis.ResizeObserver === 'undefined') {
    class Still {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    globalThis.ResizeObserver = Still as unknown as typeof ResizeObserver
  }
})

beforeEach(async () => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
})

const hf = () => pack.byKey(HIGHFIELD)
const rowsOf = (id: string) => pack.rowsByEntity[id] ?? []
const NOW = () => new Date('2026-09-22T09:00:00+10:00')

const draw = (props: Partial<React.ComponentProps<typeof Sheet>> = {}) =>
  render(<Sheet tableId={HIGHFIELD} business="Northside Marine" now={NOW} {...props} />)

const grid = () => screen.getByRole('grid', { name: hf().name })

/* ---------------------------------------------------------- */

describe('the sheet, standing', () => {
  it('names the table and counts the file in the dealer’s own words', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(hf().name)
    const rows = rowsOf(HIGHFIELD)
    const series = new Set(rows.map((r) => String(r.values[hf().hierarchy![0]!] ?? '')))
    const count = screen.getByText((_, el) => el?.classList.contains('sh-count') === true)
    expect(count).toHaveTextContent(`${rows.length} variants`)
    expect(count).toHaveTextContent(`in ${series.size} series`)
    expect(count).toHaveTextContent(`${hf().fields.length} columns`)
  })

  it('is one grid whose rows are the file’s rows, and a reader is told the count', () => {
    draw()
    const g = grid()
    expect(g).toHaveAttribute('data-rows', String(rowsOf(HIGHFIELD).length))
    expect(Number(g.getAttribute('aria-rowcount'))).toBeGreaterThan(rowsOf(HIGHFIELD).length)
    expect(g).toHaveAttribute('aria-colcount', String(hf().fields.length - 2))
  })

  it('pins the display column and marks every cost column with the word', () => {
    draw()
    const heads = screen.getAllByRole('columnheader')
    const pin = heads.find((h) => h.hasAttribute('data-pin') && h.classList.contains('sh-th'))
    const display = hf().fields.find((f) => f.id === hf().displayFieldId)!
    expect(pin).toHaveTextContent(display.name)
    const cost = pack.manifest.tables.find((t) => t.id === HIGHFIELD)!.costColumns
    /* the column heads only: the band over them says the word once more for the run */
    const marked = heads.filter(
      (h) => h.classList.contains('sh-th') && within(h).queryByText('cost') !== null,
    )
    expect(marked).toHaveLength(cost.length)
  })

  it('offers the depth ladder in the file’s own column names, every row pressed at rest', () => {
    draw()
    const every = screen.getByRole('button', { name: 'Every row' })
    expect(every).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Series' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Model' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('teaches the vocabulary and offers a column as a sentence, refused until it is named', () => {
    draw()
    const panel = screen.getByRole('complementary', { name: 'The row under the cursor' })
    expect(within(panel).getByTestId('sheet-keys')).toHaveTextContent('peeks')
    const act = within(panel).getByRole('button', { name: 'Add the column' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(
      within(panel).getByText('A column needs a name before it can be offered.'),
    ).toBeInTheDocument()
  })

  it('says the sentence, counting the rows, once a column is named — and nothing is written yet', async () => {
    const person = userEvent.setup()
    draw()
    const before = hf().fields.length
    await person.type(screen.getByRole('textbox', { name: "The new column's name" }), 'Notes')
    const rows = rowsOf(HIGHFIELD).length
    expect(
      screen.getByText(
        `This adds a column called “Notes” to ${hf().name}, holding text, empty on all ${rows} variants, at the end of the sheet. Nothing else changes, and it can be undone.`,
      ),
    ).toBeInTheDocument()
    expect(catalogue.getState().tables[HIGHFIELD]!.fields).toHaveLength(before)

    await person.click(screen.getByRole('button', { name: 'Add the column' }))
    expect(catalogue.getState().tables[HIGHFIELD]!.fields).toHaveLength(before + 1)
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent(`Column added · ${hf().name}`)
    await person.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(catalogue.getState().tables[HIGHFIELD]!.fields).toHaveLength(before)
  })
})

describe('the record', () => {
  it('opens on the row under the cursor with Space, as the table’s own sections', async () => {
    const person = userEvent.setup()
    draw()
    const g = grid()
    g.focus()
    await person.keyboard(' ')
    const record = screen.getByTestId('sheet-record')
    const first = rowsOf(HIGHFIELD)[0]!
    const name = String(first.values[hf().displayFieldId!])
    expect(within(record).getByRole('heading', { level: 2 })).toHaveTextContent(name)
    for (const section of hf().sections ?? []) {
      expect(within(record).getByRole('region', { name: section.name })).toBeInTheDocument()
    }
    /* every value is a button that says the column and the value */
    expect(within(record).getByRole('button', { name: /^Model Code: / })).toBeInTheDocument()
  })

  it('follows the cursor while it is open, and Escape closes it', async () => {
    const person = userEvent.setup()
    draw()
    grid().focus()
    await person.keyboard(' ')
    await person.keyboard('j')
    const second = String(rowsOf(HIGHFIELD)[1]!.values[hf().displayFieldId!])
    expect(
      within(screen.getByTestId('sheet-record')).getByRole('heading', { level: 2 }),
    ).toHaveTextContent(second)
    await person.keyboard('{Escape}')
    expect(screen.queryByTestId('sheet-record')).toBeNull()
  })
})

describe('a cell', () => {
  const numberCol = () => {
    const levels = new Set(hf().hierarchy!.slice(0, -1))
    const addressable = hf().fields.filter((f) => !levels.has(f.id))
    return addressable.findIndex((f) => f.type === 'number')
  }

  it('refuses a value that is not a number with the engine’s own sentence, in a pill under the cell', async () => {
    const person = userEvent.setup()
    draw()
    grid().focus()
    const col = numberCol()
    for (let i = 0; i < col; i += 1) await person.keyboard('{ArrowRight}')
    await person.keyboard('{Enter}')
    expect(screen.getByRole('textbox', { name: /editing$/ })).toHaveFocus()
    await person.keyboard('12abc{Enter}')
    expect(screen.getByRole('alert')).toHaveTextContent('"12abc" is not a number')
    expect(screen.queryByTestId('last-step')).toBeNull()
  })

  it('writes through the store with Undo pinned to the step, and Undo puts the file back', async () => {
    const person = userEvent.setup()
    draw()
    grid().focus()
    const col = numberCol()
    const levels = new Set(hf().hierarchy!.slice(0, -1))
    const field = hf().fields.filter((f) => !levels.has(f.id))[col]!
    const first = rowsOf(HIGHFIELD)[0]!
    const was = first.values[field.id]
    for (let i = 0; i < col; i += 1) await person.keyboard('{ArrowRight}')
    await person.keyboard('{Enter}')
    expect(screen.getByRole('textbox', { name: /editing$/ })).toHaveFocus()
    await person.keyboard('4321{Enter}')

    const read = () => catalogue.getState().rows[HIGHFIELD]!.find((r) => r.id === first.id)!
    expect(read().values[field.id]).toBe(4321)
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent(`Cell edit · ${hf().name}`)
    await person.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(read().values[field.id]).toBe(was)
    expect(within(step).getByRole('button', { name: 'Put it back' })).toBeInTheDocument()
  })

  it('a commit that changed nothing is not a step', async () => {
    const person = userEvent.setup()
    draw()
    grid().focus()
    await person.keyboard('{Enter}')
    await person.keyboard('{Enter}')
    expect(screen.queryByTestId('last-step')).toBeNull()
  })
})

describe('the doors', () => {
  it('draws the gallery as one card per model, under its series', () => {
    draw({ door: 'gallery' })
    const rows = rowsOf(HIGHFIELD)
    const [seriesId, modelId] = hf().hierarchy!
    const models = new Set(rows.map((r) => `${r.values[seriesId!]}|${r.values[modelId!]}`))
    const series = new Set(rows.map((r) => String(r.values[seriesId!])))
    const gallery = screen.getByTestId('sheet-gallery')
    expect(gallery.querySelectorAll('.sh-card')).toHaveLength(models.size)
    expect(gallery.querySelectorAll('.sh-shelf')).toHaveLength(series.size)
    expect(
      screen.getByRole('button', { name: `Every variants (${rows.length})` }),
    ).toBeInTheDocument()
  })
})

describe('what is not there', () => {
  it('says, in a sentence, when no table has that name, and where every table is', () => {
    draw({ tableId: 'boat_nowhere' })
    expect(screen.getByText(noTable('boat_nowhere'))).toBeInTheDocument()
  })

  it('says no file is open on a blank sheet and offers the door', async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
    draw({ openTheFile: () => {} })
    expect(screen.getByText(NO_SHEET)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load the Master Price File' })).toHaveAttribute(
      'aria-disabled',
      'false',
    )
  })
})
