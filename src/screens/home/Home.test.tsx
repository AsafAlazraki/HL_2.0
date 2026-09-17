import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ModuleDef } from '@/domain/model'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { holdingsOf, modelRowsOf } from './holdings'
import { markLedgerFacts, pictureById } from './ledgers'
import { Home, NO_PICKER, greetingFor } from './Home'

/* ============================================================
   Home, rendered against the real pack, read by role and by text.

   No test here asserts a number that was typed into it. Each figure is
   computed from the fixture and then looked for on the screen, so a
   test cannot agree with a screen that has drifted from the file: both
   have to agree with `data/northside/`.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const loadTheFile = async (): Promise<void> => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
}

const loadNothing = async (): Promise<void> => {
  await catalogue.getState().load({ entities: [], rowsByEntity: {} })
}

const held = () =>
  holdingsOf(
    Object.fromEntries(pack.entities.map((e) => [e.id, e])),
    pack.rowsByEntity,
    pack.ctx.modules,
  )

describe('the greeting', () => {
  it('reads the clock, and says nothing about a person nobody has named', () => {
    expect(greetingFor(9, null)).toBe('Good morning.')
    expect(greetingFor(13, null)).toBe('Good afternoon.')
    expect(greetingFor(21, null)).toBe('Good evening.')
    expect(greetingFor(9, 'Asaf')).toBe('Good morning, Asaf.')
  })
})

describe('home with the Master Price File open', () => {
  beforeAll(async () => {
    await loadTheFile()
    await quotes.getState().openFor('northside')
    session.getState().signOut()
  })

  it('greets the desk and says why the greeting has no name', async () => {
    render(<Home business="Northside Marine" from="pack" ms={412} hour={9} />)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Good morning.')
    expect(screen.getByText(/No one has typed a name at this desk yet/)).toBeInTheDocument()
    expect(screen.getByText('Northside Marine')).toBeInTheDocument()
  })

  it('stamps the file with the tables, rows and joins that actually loaded', () => {
    const facts = held()
    render(<Home business="Northside Marine" from="pack" ms={412} />)
    const stamp = screen.getByTestId('pack-counts')
    expect(within(stamp).getByText(facts.tables.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(stamp).getByText(facts.rows.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(stamp).getByText(facts.joins.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(stamp).getByText(/read from the file/)).toBeInTheDocument()
  })

  it('counts every kind off the file, labelled with the places that hold it', () => {
    const facts = held()
    render(<Home business="Northside Marine" />)
    const panel = screen.getByRole('region', { name: 'What this business sells' })
    for (const kind of facts.kinds) {
      expect(within(panel).getByText(kind.rows.toLocaleString('en-AU'))).toBeInTheDocument()
      expect(within(panel).getByText(kind.label)).toBeInTheDocument()
    }
    expect(facts.kinds).toHaveLength(6)
  })

  it('names every boat maker with its own row count', () => {
    const facts = held()
    render(<Home business="Northside Marine" />)
    const shelf = screen.getByRole('region', { name: 'The boat makers' })
    for (const register of facts.boats) {
      expect(
        within(shelf).getByText(`${register.rows.toLocaleString('en-AU')} rows`),
      ).toBeInTheDocument()
    }
    expect(within(shelf).getAllByRole('listitem')).toHaveLength(facts.boats.length)
  })

  /* THE LEDGER'S OWN GAP, on the screen. Stabicraft's mark was looked
     for and not found, so its cell keeps its place and its count and
     sets the name in type — and the reason is printed under the shelf,
     in the ledger's own words. */
  it('sets a maker with no mark in type, and says why under the shelf', () => {
    render(<Home business="Northside Marine" />)
    const shelf = screen.getByRole('region', { name: 'The boat makers' })
    const cell = within(shelf).getByText('Stabicraft').closest('li')
    expect(cell).not.toBeNull()
    expect(cell?.querySelector('img')).toBeNull()
    expect(within(cell as HTMLElement).getByText('No mark held')).toBeInTheDocument()
    expect(within(shelf).getByText(/Stabicraft: no public wordmark verified/)).toBeInTheDocument()

    /* and the makers that do hold one are drawn, not described */
    const drawn = within(shelf).getAllByRole('presentation', { hidden: true })
    expect(drawn.length).toBe(held().boats.length - 1)
  })

  it('captions each photograph with its register and how many rows are that model', () => {
    const facts = held()
    const picture = pictureById('highfield-adv7')
    expect(picture).toBeDefined()
    const register = pack.byKey(picture?.table ?? '')
    const rows = pack.rowsByEntity[register.id] ?? []
    const ofThisModel = modelRowsOf(register, rows, picture?.model ?? '')

    render(<Home business="Northside Marine" />)
    const fold = screen.getByRole('region', { name: 'Two boats from the file' })
    expect(within(fold).getByText(register.name)).toBeInTheDocument()
    expect(within(fold).getByText(picture?.model ?? '')).toBeInTheDocument()
    expect(
      within(fold).getByText(
        new RegExp(`${ofThisModel.toLocaleString('en-AU')} of them are this model`),
      ),
    ).toBeInTheDocument()
    expect(within(fold).getByAltText(picture?.subject ?? '')).toBeInTheDocument()
    expect(facts.boats.some((b) => b.id === register.id)).toBe(true)
  })

  it('refuses New quote with the reason, and keeps the control reachable', () => {
    render(<Home business="Northside Marine" />)
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText(NO_PICKER)).toBeInTheDocument()
    expect(act).toHaveAttribute('aria-describedby')
  })

  it('says no draft exists, because none does', () => {
    render(<Home business="Northside Marine" />)
    const panel = screen.getByRole('region', { name: 'Open drafts' })
    expect(within(panel).getByTestId('draft-count')).toHaveTextContent('0')
    expect(
      within(panel).getByText(/No customer, no quote and no draft exists in this browser yet/),
    ).toBeInTheDocument()
    /* the card a draft will land in is a diagram, not a control */
    expect(within(panel).queryByRole('button')).toBeNull()
  })

  it('searches the file from the field, and says what it cannot do yet', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    expect(field).toHaveAttribute(
      'placeholder',
      `Search ${held().rows.toLocaleString('en-AU')} rows`,
    )

    fireEvent.change(field, { target: { value: 'crossfire' } })
    expect(screen.getByText(/rows carry that word/)).toBeInTheDocument()
    expect(screen.getByText(/that screen is not built yet/)).toBeInTheDocument()

    fireEvent.change(field, { target: { value: 'zzzzzz' } })
    expect(screen.getByText('Nothing on the sheet is called that.')).toBeInTheDocument()
  })

  it('puts the cursor in the field on Ctrl K', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    expect(document.activeElement).not.toBe(field)
    fireEvent.keyDown(globalThis.window, { key: 'k', ctrlKey: true })
    expect(document.activeElement).toBe(field)
  })

  /* NO FIGURE ON THIS SCREEN IS INVENTED, and this is the case that
     proves it rather than asserting it. Every number drawn is gathered
     off the rendered page and has to be one the file, the picture
     ledger or the mark ledger actually carries. A total of boats for
     sale — the figure the price file does not hold and CLAUDE.md
     forbids — could not pass it. */
  it('prints no figure the file does not carry', () => {
    const facts = held()
    const marks = markLedgerFacts()
    const allowed = new Set<number>([
      0,
      412,
      facts.tables,
      facts.rows,
      facts.joins,
      facts.joinRows,
      facts.baseRows,
      facts.baseTables,
      facts.boats.length,
      marks.checked,
      marks.held,
      marks.files,
    ])
    for (const kind of facts.kinds) allowed.add(kind.rows)
    for (const register of facts.boats) allowed.add(register.rows)
    for (const id of ['highfield-adv7', 'stacer-519-sea-ranger']) {
      const picture = pictureById(id)
      if (!picture) continue
      allowed.add(picture.width)
      allowed.add(picture.height)
      const register = pack.byKey(picture.table)
      allowed.add(modelRowsOf(register, pack.rowsByEntity[picture.table] ?? [], picture.model))
      /* A NAME IS NOT A FIGURE. "519 Sea Ranger SDF" is what the
         register calls that boat, so the 519 on the screen is the
         file's own spelling and is allowed by reading it back out of
         the file rather than by being typed here. */
      for (const word of `${picture.model} ${register.name}`.matchAll(/\d[\d,]*/g)) {
        allowed.add(Number(word[0].replaceAll(',', '')))
      }
    }

    render(<Home business="Northside Marine" from="pack" ms={412} />)
    const text = screen.getByTestId('home').textContent ?? ''
    const printed = [...text.matchAll(/(?<![\w,.])\d[\d,]*(?![\w])/g)].map((m) =>
      Number(m[0].replaceAll(',', '')),
    )
    expect(printed.length).toBeGreaterThan(10)
    const invented = printed.filter((n) => !allowed.has(n))
    expect(invented).toEqual([])
  })
})

describe('home against a blank sheet', () => {
  beforeAll(async () => {
    await loadNothing()
  })

  it('draws the same composition with nothing counted, and says so', async () => {
    /* a file packed without a name hands the screen an empty string,
       which is not a name: it reads as nobody, everywhere */
    render(<Home business="   " from="pack" ms={3} />)

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/A blank sheet/)).toBeInTheDocument()
    expect(screen.getByText(/No price file is open/)).toBeInTheDocument()
    expect(screen.queryByTestId('pack-counts')).toBeNull()

    /* the fold keeps its two frames and neither pretends */
    const fold = screen.getByRole('region', { name: 'Two boats from the file' })
    expect(within(fold).queryAllByRole('img')).toHaveLength(0)
    expect(within(fold).getAllByText(/Nothing stands in for it/)).toHaveLength(2)
    expect(within(fold).getAllByText('No photograph here')).toHaveLength(2)

    /* and the business that has not been named is not invented */
    expect(screen.getByText('This business has not been named yet')).toBeInTheDocument()
    expect(screen.getByText('What this business sells')).toBeInTheDocument()
    expect(
      screen.getByText(/Nothing is counted here until a price file is read in/),
    ).toBeInTheDocument()
    expect(
      screen.getByText('There is nothing to search until a price file is read in.'),
    ).toBeInTheDocument()
  })

  /* THE ONE THING A BLANK SHEET CAN OFFER is the door, because this
     screen reads what this browser has kept and never the file. The
     way there is handed in, so a render with no router simply has no
     door to offer — and says nothing it cannot do. */
  it('offers the door back to the file, and presses it', async () => {
    const openTheFile = vi.fn<() => void>()
    render(<Home business="Northside Marine" openTheFile={openTheFile} />)

    const door = await screen.findByRole('button', { name: 'Load the Master Price File' })
    await userEvent.click(door)
    expect(openTheFile).toHaveBeenCalledTimes(1)
  })

  it('offers no door where nothing handed it one', async () => {
    render(<Home business="Northside Marine" />)
    expect(await screen.findByText(/A blank sheet/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load the Master Price File' })).toBeNull()
  })

  /* AND IT NEVER SAYS IT IS READING THE FILE, because it is not: the
     file is read at the door, and this screen reads what this browser
     kept. */
  it('never claims to be reading the Master Price File', async () => {
    render(<Home business="Northside Marine" openTheFile={vi.fn<() => void>()} />)
    expect(await screen.findByText(/A blank sheet/)).toBeInTheDocument()
    expect(screen.queryByText(/Reading the Master Price File/)).toBeNull()
  })
})
