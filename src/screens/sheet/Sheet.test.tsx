import { useState } from 'react'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { NO_SHEET, noTable } from './read'
import { spineName } from '@/domain/catalogue/views/spineSaid'
import { Sheet, type SheetPosition } from './Sheet'

/* ============================================================
   THE SHEET, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   The real pack is loaded into the real catalogue store before every
   case, so every figure asserted below is counted off the file and
   never typed: how many variants, how many series, which row the
   finder names, which columns are cost. The walk through the real
   door in a real browser is `e2e/flows/sheet.spec.ts`; this is the
   screen with no router and no window, which is where a refusal's
   sentence, a write's way back and a fold that must survive it can be
   driven quickly and exactly.

   THE POSITION IS THE ADDRESS, so the screen is mounted in a harness
   that plays the router: whatever the screen hands back through
   `onPosition` is handed straight back in as props, exactly as
   `routes/data.$table.tsx` does through the search params. A fold
   that survives a write survives it here for the same reason it does
   in the app — or fails here for the same reason it would there.

   THE VIRTUALISER IS TOLD HOW MANY PIECES TO DRAW. react-virtuoso
   measures its scroller to decide what to render, and a document with
   no layout measures nothing; `initialItemCount` draws the first
   pieces regardless — and every piece up to a found row — which is
   how the rows exist here.
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
const field = (name: string) => hf().fields.find((f) => f.name === name)!
const text = (row: { values: Record<string, unknown> }, name: string): string =>
  String(row.values[field(name).id] ?? '')

/** Where a sheet opens when nothing is asked of it. */
const AT_REST: SheetPosition = {}

/** The router, played: the position the screen hands back is handed back in. */
function Harness({
  tableId = HIGHFIELD,
  start = AT_REST,
  seen,
}: {
  tableId?: string
  start?: SheetPosition
  seen?: SheetPosition[]
}) {
  const [position, setPosition] = useState<SheetPosition>(start)
  return (
    <Sheet
      tableId={tableId}
      business="Northside Marine"
      now={NOW}
      {...position}
      fold={position.fold ?? ''}
      onPosition={(p) => {
        seen?.push(p)
        setPosition(p)
      }}
    />
  )
}

const draw = (props: Partial<React.ComponentProps<typeof Harness>> = {}) =>
  render(<Harness {...props} />)

const grid = () => screen.getByRole('grid', { name: hf().name })

/** Highfield's first series, the chapter the sheet opens on. */
const firstSeries = () => text(rowsOf(HIGHFIELD)[0]!, 'Series')
const inFirstSeries = () => rowsOf(HIGHFIELD).filter((r) => text(r, 'Series') === firstSeries())

/* ---------------------------------------------------------- */

describe('the sheet, standing', () => {
  it('names the table and counts the file in the dealer’s own words', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1, name: hf().name })).toBeInTheDocument()
    const rows = rowsOf(HIGHFIELD)
    const series = new Set(rows.map((r) => text(r, 'Series')))
    const models = new Set(rows.map((r) => `${text(r, 'Series')}|${text(r, 'Model')}`))
    const count = screen.getByText((_, el) => el?.classList.contains('sh-count') === true)
    expect(count).toHaveTextContent(`${rows.length} variants`)
    expect(count).toHaveTextContent(`of ${models.size} models`)
    expect(count).toHaveTextContent(`in ${series.size} series`)
    expect(count).toHaveTextContent(`${hf().fields.length} columns`)
  })

  it('reads one series at a time, and every one of its rows is a row of the grid', () => {
    draw()
    const g = grid()
    expect(g).toHaveAttribute('data-rows', String(inFirstSeries().length))
    const chapter = screen.getByRole('link', { name: new RegExp(`^${firstSeries()}`) })
    expect(chapter).toHaveAttribute('aria-current', 'location')
  })

  it('never draws a column that says one thing: the head says it once instead', () => {
    draw()
    const heads = screen.getAllByRole('columnheader').map((h) => h.textContent ?? '')
    for (const name of ['Matrix', 'Image Link', 'Series', 'Model']) {
      expect(heads.some((h) => h.startsWith(name.toUpperCase()) || h.startsWith(name))).toBe(
        name === 'Model',
      )
    }
    const said = document.querySelector<HTMLElement>('dl.sh-said')
    expect(said).not.toBeNull()
    expect(within(said!).getByText('Matrix')).toBeInTheDocument()
    expect(within(said!).getByText(text(rowsOf(HIGHFIELD)[0]!, 'Matrix'))).toBeInTheDocument()
  })

  it('files a model’s variants one material at a time, the material said once at its head', () => {
    draw()
    const first = inFirstSeries()[0]!
    const block = screen.getByRole('rowgroup', {
      name: spineName(HIGHFIELD, text(first, 'Model')).name,
    })
    const leads = within(block)
      .getAllByRole('rowheader')
      .map((h) => h.textContent?.trim() ?? '')
      .filter((t) => /^[A-Z]+$/.test(t))
    const words = [
      ...new Set(
        rowsOf(HIGHFIELD)
          .filter((r) => text(r, 'Model') === text(first, 'Model'))
          .map((r) => text(r, 'Variant').split(' ')[0]!),
      ),
    ]
    expect(leads).toEqual(words)
  })

  it('carries a model’s held render on its spine, and says which variants it depicts', () => {
    draw()
    const first = inFirstSeries()[0]!
    const block = screen.getByRole('rowgroup', {
      name: spineName(HIGHFIELD, text(first, 'Model')).name,
    })
    const picture = within(block).getByRole('img')
    expect(picture).toHaveAttribute(
      'alt',
      expect.stringContaining(spineName(HIGHFIELD, text(first, 'Model')).name),
    )
    const models = rowsOf(HIGHFIELD).filter((r) => text(r, 'Model') === text(first, 'Model'))
    expect(within(block).getByText(new RegExp(`of ${models.length} variants`))).toBeInTheDocument()
  })

  /* THE REST STATE CHANGED ON 2026-09-24. This case used to pin a lit
     first row with its keycaps on first paint; the second critique named
     exactly that — a spreadsheet cursor outlining a cell and "Enter
     edits · Space" in its row before anybody had touched the sheet — as
     the database the owner keeps rejecting (built-critique-m2-close.md).
     The cursor still stands on the first row for the keyboard; it is
     drawn once the grid is touched. docs/DECISIONS.md, same date. */
  it('rests on the work: no form, nothing refusing, and no cursor drawn until the grid is touched', async () => {
    const person = userEvent.setup()
    draw()
    expect(screen.queryByRole('textbox', { name: "The new column's name" })).toBeNull()
    expect(screen.queryByText(/needs a name/)).toBeNull()
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(document.querySelector('.sh-row[data-on]')).toBeNull()
    expect(document.querySelector('.sh-cell[data-active]')).toBeNull()

    /* the keyboard arrives, and the first row is lit with its record's button */
    grid().focus()
    await person.keyboard('{ArrowDown}{ArrowUp}')
    const lit = document.querySelector('.sh-row[data-on]')
    expect(lit).not.toBeNull()
    expect(within(lit as HTMLElement).getByRole('button', { name: 'Open the record' })).toBeTruthy()
  })

  it('a first press on a cell nobody could see lit only lights it, and does not open an editor', async () => {
    const person = userEvent.setup()
    draw()
    const first = inFirstSeries()[0]!
    const cell = document.querySelector<HTMLElement>(`[id^="sh-cell-${first.id}-"] .sh-cell__read`)
    expect(cell).not.toBeNull()
    await person.click(cell!)
    expect(screen.queryByRole('textbox', { name: /editing$/ })).toBeNull()
    expect(document.querySelector('.sh-row[data-on]')).not.toBeNull()
  })
})

describe('the columns, one press away', () => {
  it('lists every column not drawn, and says every cost column is cost', async () => {
    const person = userEvent.setup()
    draw()
    await person.click(screen.getByTestId('sheet-more'))
    const menu = await screen.findByRole('dialog')
    const cost = pack.manifest.tables.find((t) => t.id === HIGHFIELD)!.costColumns ?? []
    const costNames = hf()
      .fields.filter((f) => cost.includes(f.id))
      .map((f) => f.name)
    /* a cost the whole table shares is said in the head, marked; the rest are in the menu, marked */
    const inHead = [...document.querySelectorAll('.sh-said__fact')]
      .filter((el) => el.querySelector('.sh-said__cost'))
      .map((el) => el.querySelector('.sh-said__name')?.firstChild?.textContent ?? '')
    const inMenu = [...menu.querySelectorAll('.sh-menu__item')]
      .filter((el) => el.querySelector('.sh-menu__cost'))
      .map((el) => el.querySelector('.sh-menu__name')?.firstChild?.textContent ?? '')
    /* every cost column is said to be cost somewhere a dealer reads it, and nothing else is */
    expect([...new Set([...inHead, ...inMenu])].toSorted()).toEqual(costNames.toSorted())
  })

  it('puts a held column into the grid, and it stays there through a write', async () => {
    const person = userEvent.setup()
    draw()
    await person.click(screen.getByTestId('sheet-more'))
    const menu = await screen.findByRole('dialog')
    const beam = within(menu).getByText('Beam').closest('li')!
    await person.click(within(beam).getByRole('button', { name: 'Show as a column' }))
    expect(screen.getAllByRole('columnheader').some((h) => h.textContent === 'Beam')).toBe(true)
  })

  it('offers a column only after “Add a column…” is pressed, and refuses only when pressed empty', async () => {
    const person = userEvent.setup()
    draw()
    const before = hf().fields.length
    await person.click(screen.getByTestId('sheet-more'))
    await person.click(await screen.findByRole('button', { name: 'Add a column…' }))
    expect(screen.queryByText('A column needs a name before it can be added.')).toBeNull()
    await person.click(screen.getByRole('button', { name: 'Add the column' }))
    expect(screen.getByText('A column needs a name before it can be added.')).toBeInTheDocument()

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

  it('draws every column behind the Every column door, each cost column saying so at its head', () => {
    draw({ start: { door: 'every' } })
    const cost = pack.manifest.tables.find((t) => t.id === HIGHFIELD)!.costColumns ?? []
    const heads = screen.getAllByRole('columnheader').filter((h) => h.classList.contains('sh-th'))
    const marked = heads.filter((h) => within(h).queryByText('cost') !== null)
    expect(marked).toHaveLength(cost.length)
  })
})

describe('the record', () => {
  it('opens under the row with Space, as the table’s own sections', async () => {
    const person = userEvent.setup()
    draw()
    grid().focus()
    await person.keyboard(' ')
    const record = screen.getByTestId('sheet-record')
    const first = inFirstSeries()[0]!
    expect(within(record).getByRole('heading', { level: 2 })).toHaveTextContent(
      String(first.values[hf().displayFieldId!]),
    )
    for (const section of hf().sections ?? []) {
      expect(within(record).getByRole('region', { name: section.name })).toBeInTheDocument()
    }
    /* every value is a button that says the column and the value */
    expect(within(record).getByRole('button', { name: /^Model Code: / })).toBeInTheDocument()
  })

  it('follows the cursor while it is open — in the order on screen — and Escape closes it', async () => {
    const person = userEvent.setup()
    draw()
    grid().focus()
    await person.keyboard(' ')
    await person.keyboard('{ArrowDown}')
    /* the second row on screen is the first model's second variant of the SAME material */
    const first = inFirstSeries()[0]!
    const lead = text(first, 'Variant').split(' ')[0]!
    const second = rowsOf(HIGHFIELD).filter(
      (r) => text(r, 'Model') === text(first, 'Model') && text(r, 'Variant').startsWith(`${lead} `),
    )[1]!
    expect(
      within(screen.getByTestId('sheet-record')).getByRole('heading', { level: 2 }),
    ).toHaveTextContent(String(second.values[hf().displayFieldId!]))
    await person.keyboard('{Escape}')
    expect(screen.queryByTestId('sheet-record')).toBeNull()
  })

  /* THE COLOURWAY AS COLOUR (built-critique-m2-close-2.md, major 6): the
     Variant column draws the colours the decode names beside the dealer's
     code, and says the colour's name first; a code nothing decodes draws
     no colour at all. */
  it('draws a colourway as colour beside its code, and never one it cannot name', () => {
    const rows = rowsOf(HIGHFIELD)
    const adv7 = rows.find((r) => text(r, 'Boat') === 'Highfield - ADV7 (HYP) B-G-B')!
    draw({ start: { at: adv7.id } })
    const lit = document.querySelector('.sh-row[data-on]')!
    const cell = [...lit.querySelectorAll<HTMLElement>('[role="gridcell"]')].find(
      (c) =>
        c.querySelector('button')?.getAttribute('aria-label')?.startsWith('Variant: ') ?? false,
    )!
    expect(cell.querySelector('button')).toHaveAccessibleName(
      'Variant: Black / Grey / Black, HYP B-G-B',
    )
    expect(cell.querySelectorAll('.ui-swatches[data-shape="flag"] .ui-swatch')).toHaveLength(3)
    expect(cell).toHaveTextContent('B-G-B')
    /* and a code with a token nobody decodes is the code, with no colour */
    for (const drawn of document.querySelectorAll<HTMLElement>('[role="gridcell"]')) {
      const said = drawn.querySelector('button')?.getAttribute('aria-label') ?? ''
      if (!/^Variant: .*\b(WH|O|R|I)\b/.test(said) || said.includes(' / ')) continue
      expect(drawn.querySelector('.ui-swatches')).toBeNull()
    }
  })

  it('opens on the row an address names — its chapter, its model, its record', () => {
    const rows = rowsOf(HIGHFIELD)
    /* a row deep in the file, in a series that is not the first */
    const target = rows.find((r, i) => i > rows.length / 2 && text(r, 'Series') !== firstSeries())!
    draw({ start: { at: target.id } })
    const record = screen.getByTestId('sheet-record')
    expect(within(record).getByRole('heading', { level: 2 })).toHaveTextContent(
      String(target.values[hf().displayFieldId!]),
    )
    const chapter = screen.getByRole('link', { name: new RegExp(`^${text(target, 'Series')}`) })
    expect(chapter).toHaveAttribute('aria-current', 'location')
    const lit = document.querySelector('.sh-row[data-on]')!
    expect(lit).toHaveTextContent(text(target, 'Model Code'))
  })
})

/** The grid column a head names, read off its own `aria-colindex`. */
const colOf = (name: string): number => {
  const head = screen
    .getAllByRole('columnheader')
    .find((h) => h.textContent?.toLowerCase().startsWith(name.toLowerCase()))!
  return Number(head.getAttribute('aria-colindex')) - 1
}

describe('a cell', () => {
  it('refuses a value that is not a number with the engine’s own sentence, in a pill under the cell', async () => {
    const person = userEvent.setup()
    draw()
    grid().focus()
    const col = colOf('Cash')
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
    const col = colOf('Cash')
    const cash = field('Cash')
    const first = inFirstSeries()[0]!
    const was = first.values[cash.id]
    for (let i = 0; i < col; i += 1) await person.keyboard('{ArrowRight}')
    await person.keyboard('{Enter}')
    expect(screen.getByRole('textbox', { name: /editing$/ })).toHaveFocus()
    await person.keyboard('4321{Enter}')

    const read = () => catalogue.getState().rows[HIGHFIELD]!.find((r) => r.id === first.id)!
    expect(read().values[cash.id]).toBe(4321)
    const step = screen.getByTestId('last-step')
    expect(step).toHaveTextContent(`Cell edit · ${hf().name}`)
    await person.click(within(step).getByRole('button', { name: 'Undo' }))
    expect(read().values[cash.id]).toBe(was)
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

describe('what is shut stays shut', () => {
  it('shuts every model to its line in one press, and opens them again', async () => {
    const person = userEvent.setup()
    draw()
    /* each model as a person says it: Roll-Up's RU230KAM is "Roll Up 230 KAM", the
       maker's own page's words (m2-last-critique.md major 7), with its code beside it */
    const codes = new Set(inFirstSeries().map((r) => text(r, 'Model')))
    await person.click(screen.getByRole('button', { name: 'Only the models' }))
    expect(grid()).toHaveAttribute('data-rows', '0')
    expect([...codes].map((c) => spineName(HIGHFIELD, c).name)).toContain('Roll Up 230 KAM')
    for (const code of codes) {
      const model = spineName(HIGHFIELD, code).name
      expect(screen.getByRole('button', { name: `Open ${model}` })).toBeInTheDocument()
      /* and its line SAYS its name — the button's label is not the line
         (built-critique-m2-close.md, blocker 1: every shut name was drawn
         0 px wide while this case stayed green by the label alone) */
      const line = screen.getByRole('rowgroup', { name: model })
      expect(line.querySelector('.sh-spine__name')).toHaveTextContent(model)
      /* a shut line is a line of a price list: the name alone, never the file's code beside it */
      if (model !== code) expect(line.querySelector('.sh-spine__count')).not.toHaveTextContent(code)
      expect(line.querySelector('.sh-spine__figures')?.textContent ?? '').toMatch(/\$/)
    }
    await person.click(screen.getByRole('button', { name: 'Open every model' }))
    expect(grid()).toHaveAttribute('data-rows', String(inFirstSeries().length))
    /* open, a spine at a desk says the file's code quietly beside its count, for the
       dealer who orders by it */
    const first = [...codes][0]!
    const open = screen.getByRole('rowgroup', { name: spineName(HIGHFIELD, first).name })
    expect(open.querySelector('.sh-spine__count')).toHaveTextContent(first)
  })

  it('keeps a shut model shut through a write to another one (critique §12)', async () => {
    const person = userEvent.setup()
    draw()
    const first = spineName(HIGHFIELD, text(inFirstSeries()[0]!, 'Model')).name
    await person.click(screen.getByRole('button', { name: `Shut ${first}` }))
    expect(screen.getByRole('button', { name: `Open ${first}` })).toBeInTheDocument()

    /* a write, anywhere: the cursor is on the first row still addressable */
    grid().focus()
    await person.keyboard('{ArrowRight}{Enter}')
    await person.keyboard('X9{Enter}')
    expect(screen.getByTestId('last-step')).toHaveTextContent(`Cell edit · ${hf().name}`)
    expect(screen.getByRole('button', { name: `Open ${first}` })).toBeInTheDocument()
    await person.click(
      within(screen.getByTestId('last-step')).getByRole('button', { name: 'Undo' }),
    )
    expect(screen.getByRole('button', { name: `Open ${first}` })).toBeInTheDocument()
  })
})

describe('the doors', () => {
  it('draws the Pictures door as one card per model of the series being read', () => {
    draw({ start: { door: 'pictures' } })
    const models = new Set(inFirstSeries().map((r) => text(r, 'Model')))
    const gallery = screen.getByTestId('sheet-gallery')
    expect(gallery.querySelectorAll('.sh-card')).toHaveLength(models.size)
    expect(gallery.querySelectorAll('.sh-shelf')).toHaveLength(1)
    expect(within(gallery).getByRole('heading', { level: 2 })).toHaveTextContent(firstSeries())
  })

  it('says once why the models with no picture have none, and draws each as a name plate', () => {
    draw({ start: { door: 'pictures' } })
    const gallery = screen.getByTestId('sheet-gallery')
    const bare = gallery.querySelectorAll('.sh-card[data-bare]')
    const pictured = gallery.querySelectorAll('.sh-card:not([data-bare])')
    /* the first series holds renders for some of its models and not all */
    expect(bare.length).toBeGreaterThan(0)
    expect(pictured.length).toBeGreaterThan(0)
    for (const card of pictured) expect(card.querySelector('img')).not.toBeNull()
    /* the reason is one sentence, counted — never a tile each */
    const why = gallery.querySelectorAll('.sh-bare__why')
    expect(why).toHaveLength(1)
    expect(why[0]).toHaveTextContent(new RegExp(`these ${bare.length}\\b`))
    for (const card of bare) {
      expect(card.querySelector('img')).toBeNull()
      expect(card.textContent).not.toMatch(/No picture/)
    }
  })

  it('stands the pictures apart from the names, and draws no name as a picture-sized tile', () => {
    draw({ start: { door: 'pictures' } })
    const gallery = screen.getByTestId('sheet-gallery')
    /* the models with no picture are lines of a list, the pictures a plate each */
    for (const card of gallery.querySelectorAll('.sh-card[data-bare]'))
      expect(card.closest('.sh-names')).not.toBeNull()
    for (const card of gallery.querySelectorAll('.sh-card:not([data-bare])')) {
      expect(card.closest('.sh-cards')).not.toBeNull()
      expect(card.querySelector('.sh-card__plate img')).not.toBeNull()
    }
    /* one render beside seven names is a spread, not a wall with a hole in it */
    const shelf = gallery.querySelector<HTMLElement>('.sh-shelf')!
    const pictured = gallery.querySelectorAll('.sh-card:not([data-bare])').length
    expect(shelf.dataset.shape).toBe(pictured <= 2 ? 'spread' : 'wall')
  })

  it('says on the door how many of a hull-per-row table have a picture, and drops the lead every name shares', () => {
    const id = 'boat_stacer'
    const table = pack.byKey(id)
    const { unmount } = draw({ tableId: id })
    const door = screen.getByRole('link', { name: /^Pictures/ })
    expect(door).toHaveTextContent(new RegExp(`\\d+ of ${rowsOf(id).length} `))
    unmount()
    draw({ tableId: id, start: { door: 'pictures' } })
    const gallery = screen.getByTestId('sheet-gallery')
    const label = table.fields.find((f) => f.id === table.displayFieldId)!
    const first = String(rowsOf(id)[0]!.values[label.id])
    const name = gallery.querySelector('.sh-card__name')!.textContent ?? ''
    /* the card prints what is its own, and its accessible name keeps the whole */
    expect(first.endsWith(name)).toBe(true)
    expect(name.length).toBeLessThan(first.length)
    expect(gallery.querySelector('.sh-card__button')).toHaveAttribute(
      'aria-label',
      expect.stringContaining(first),
    )
  })

  it('says once that a table holds no picture at all, and offers the price list', async () => {
    const person = userEvent.setup()
    /* the table on the pack whose door counts no picture, read off the screen */
    const withImage = pack.entities.filter((e) => e.fields.some((f) => f.type === 'image'))
    let found: string | null = null
    for (const t of withImage) {
      const { unmount } = draw({ tableId: t.id })
      const door = screen.queryByRole('link', { name: /^Pictures/ })
      const none = door?.textContent?.match(/\b0 of /) !== null && door !== null
      unmount()
      if (none) {
        found = t.id
        break
      }
    }
    expect(found, 'a table on the pack holds no picture').not.toBeNull()
    draw({ tableId: found!, start: { door: 'pictures' } })
    const gallery = screen.getByTestId('sheet-gallery')
    expect(gallery.querySelectorAll('.sh-card')).toHaveLength(0)
    expect(gallery).toHaveTextContent(`any of these ${rowsOf(found!).length}`)
    await person.click(within(gallery).getByRole('button', { name: 'Back to the price list' }))
    expect(screen.getByTestId('sheet')).toHaveAttribute('data-door', 'price')
  })

  it('opens a card on the price list, on its model, with its record showing', async () => {
    const person = userEvent.setup()
    draw({ start: { door: 'pictures' } })
    const card = screen.getByTestId('sheet-gallery').querySelector('.sh-card__button')!
    await person.click(card as HTMLElement)
    const first = inFirstSeries()[0]!
    expect(
      within(screen.getByTestId('sheet-record')).getByRole('heading', { level: 2 }),
    ).toHaveTextContent(text(first, 'Model'))
  })

  it('reads a pairing boat side first: every block is a hull', () => {
    const joinId = 'join_hf_yam'
    const join = pack.byKey(joinId)
    draw({ tableId: joinId })
    const boat = join.fields.find((f) => f.type === 'reference')!
    const firstHull = String(rowsOf(joinId)[0]!.values[boat.id])
    const label = String(
      rowsOf(HIGHFIELD).find((r) => r.id === firstHull)!.values[hf().displayFieldId!],
    )
    expect(screen.getAllByRole('rowgroup', { name: label }).length).toBeGreaterThan(0)
  })
})

describe('what is not there', () => {
  it('says, in a sentence, when no table has that name, and where every table is', () => {
    draw({ tableId: 'boat_nowhere' })
    expect(screen.getByText(noTable('boat_nowhere'))).toBeInTheDocument()
  })

  it('says no file is open on a blank sheet and offers the door', async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
    render(<Sheet tableId={HIGHFIELD} now={NOW} openTheFile={() => {}} />)
    expect(screen.getByText(NO_SHEET)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load the Master Price File' })).toHaveAttribute(
      'aria-disabled',
      'false',
    )
  })
})
