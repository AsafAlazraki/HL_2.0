import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ModuleDef, QuoteDef, QuoteLine } from '@/domain/model'
import { money } from '@/domain/money'
import { quoteTotals } from '@/domain/quote/totals'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { holdingsOf, modelRowsOf } from './holdings'
import { markLedgerFacts, pictureById, pictureForSubject } from './ledgers'
import { Home, NO_WAY_TO_A_FILED_QUOTE, NO_WAY_TO_THE_PICKER, greetingFor } from './Home'

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

  /* THE BLOCKER OF 2026-09-17: "the only control on Home is dead and
     its reason is a lie". It opens the picker now, and it is the LIVE
     amber rather than the quiet step two down the ramp that a refused
     act wears. */
  it('opens the picker from the one act, and is not refused', async () => {
    const newQuote = vi.fn<() => void>()
    render(<Home business="Northside Marine" newQuote={newQuote} />)
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'false')
    expect(act).toHaveAttribute('data-intent', 'act')
    expect(act).toHaveTextContent('→')
    await userEvent.click(act)
    expect(newQuote).toHaveBeenCalledTimes(1)
  })

  /* AND IT IS NEVER A CONTROL THAT DOES NOTHING QUIETLY. A render with
     no router is the only state where this screen has nowhere to send
     anybody, and it says so where the press happens. */
  it('says so where nothing handed it a way to the picker', () => {
    render(<Home business="Northside Marine" />)
    const act = screen.getByRole('button', { name: 'New quote' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    expect(act).toHaveAttribute('aria-describedby')
    expect(screen.getByText(NO_WAY_TO_THE_PICKER)).toBeInTheDocument()
  })

  /* EACH PLATE IS THE DOOR THE BOARD DREW: it opens the picker at the
     register the caption has just counted, by that register's own id. */
  it('opens each maker’s register from its plate', async () => {
    const openBoatRegister = vi.fn<(tableId: string) => void>()
    render(<Home business="Northside Marine" openBoatRegister={openBoatRegister} />)
    const fold = screen.getByRole('region', { name: 'Two boats from the file' })
    for (const id of ['highfield-adv7', 'stacer-519-sea-ranger']) {
      const picture = pictureById(id)
      expect(picture, id).toBeDefined()
      const register = pack.byKey(picture?.table ?? '')
      await userEvent.click(within(fold).getByRole('button', { name: `Open ${register.name}` }))
      expect(openBoatRegister).toHaveBeenCalledWith(picture?.table)
    }
    expect(openBoatRegister).toHaveBeenCalledTimes(2)
  })

  /* THE FOLD IS THE FIRST OBJECT ON THE SCREEN, so each photograph
     offers the browser every width the ledger holds and says how wide
     it expects to be drawn. None of those widths is past the held copy:
     `srcSet` is the ledger's own arithmetic, so a candidate wider than
     the picture could only come from a ledger that recorded one. */
  it('offers every held width of each photograph, and none past the held size', () => {
    render(<Home business="Northside Marine" />)
    const fold = screen.getByRole('region', { name: 'Two boats from the file' })
    for (const id of ['highfield-adv7', 'stacer-519-sea-ranger']) {
      const picture = pictureById(id)
      expect(picture, id).toBeDefined()
      const img = within(fold).getByAltText(picture?.subject ?? '')
      const srcset = img.getAttribute('srcset') ?? ''
      expect(picture?.widths.length, id).toBeGreaterThan(1)
      for (const copy of picture?.widths ?? []) {
        expect(copy.width, `${id} records a copy wider than the picture`).toBeLessThanOrEqual(
          picture?.width ?? 0,
        )
        expect(srcset, id).toContain(`${copy.src} ${copy.width}w`)
      }
      expect(img.getAttribute('sizes'), id).toBeTruthy()
      expect(img.getAttribute('fetchpriority'), id).toBe('high')
    }
  })

  /* "NEITHER DRAWN PAST ITS OWN SIZE" WAS A CONSTANT STRING in the first
     cut — true the day it was written and not checkable after. It is a
     measurement now, taken off each element, so where nothing has been
     measured the claim is simply not made. happy-dom paints nothing, so
     this render is exactly that case. */
  it('claims nothing about the drawn size it has not measured', () => {
    const picture = pictureById('highfield-adv7')
    render(<Home business="Northside Marine" />)
    const film = screen.getByText(new RegExp(`${picture?.subject ?? ''} — held`))
    expect(film).toHaveTextContent(picture?.width.toLocaleString('en-AU') ?? '')
    expect(film.textContent).not.toContain('neither drawn past its own size')
    /* AND IT NO LONGER CARRIES THE ONE FALSE CLAUSE IT EVER HAD.
       "Neither plate opens yet: a register has no screen until the
       picker is built" outlived the picker; both plates open. */
    expect(film.textContent).not.toContain('Neither plate opens')
  })

  it('says no draft exists, because none does', () => {
    render(<Home business="Northside Marine" />)
    const panel = screen.getByRole('region', { name: 'Open drafts' })
    expect(within(panel).getByTestId('draft-count')).toHaveTextContent('0')
    expect(
      within(panel).getByText(/No customer, no quote and no draft exists in this browser yet/),
    ).toBeInTheDocument()
    /* the card a draft will land in is a diagram, not a control — and
       this render was handed no way to the register, so the one
       control that would stand here is simply absent rather than dead */
    expect(within(panel).queryByRole('button')).toBeNull()
  })

  it('offers the register, and presses it', async () => {
    const openQuotes = vi.fn<() => void>()
    render(<Home business="Northside Marine" openQuotes={openQuotes} />)
    const panel = screen.getByRole('region', { name: 'Open drafts' })
    await userEvent.click(within(panel).getByRole('button', { name: 'All quotes' }))
    expect(openQuotes).toHaveBeenCalledTimes(1)
  })

  it('searches the file from the field, and says where a result opens', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    expect(field).toHaveAttribute(
      'placeholder',
      `Search ${held().rows.toLocaleString('en-AU')} rows`,
    )

    fireEvent.change(field, { target: { value: 'crossfire' } })
    expect(screen.getByText(/rows carry that word/)).toBeInTheDocument()
    /* THE FINDER IS BUILT, so the sentence is no longer about an unbuilt
       screen: this field counts, and the shell's finder opens what it
       finds (src/screens/shell). */
    expect(screen.getByText(/opens the finder/)).toBeInTheDocument()

    fireEvent.change(field, { target: { value: 'zzzzzz' } })
    expect(screen.getByText('Nothing on the sheet is called that.')).toBeInTheDocument()
  })

  /* THE FIELD'S KEY IS `/`, AND IT USED TO BE CTRL K. The shell took
     that chord for the finder on 2026-09-23 — one palette over twelve
     screens — and this field keeps the key every other find field in
     this app already answers to. `src/screens/shell/scope.tsx` argues
     it, and the finder opens on this screen with the desk's own rows
     first, so neither is taken away. */
  it('puts the cursor in the field on /, and not on a key typed into a field', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    expect(document.activeElement).not.toBe(field)
    fireEvent.keyDown(globalThis.window, { key: '/' })
    expect(document.activeElement).toBe(field)

    /* a slash typed INTO a field is a slash */
    field.blur()
    fireEvent.keyDown(field, { key: '/', bubbles: true })
    expect(document.activeElement).not.toBe(field)
  })

  it('does not take Ctrl K, which belongs to the finder', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    fireEvent.keyDown(globalThis.window, { key: 'k', ctrlKey: true })
    expect(document.activeElement).not.toBe(field)
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

/* ============================================================
   A DESK WITH DOCUMENTS ON IT.

   Every document below is built in this file, the way the register's
   own suite builds its: these are the shapes `mintQuote` produces,
   written down so the column can be driven without walking the whole
   picker. Nothing is seeded into the app and nothing is invented for
   a person to look at.

   NO FIGURE IS TYPED TWICE. Where a case asserts a total it asks
   `quoteTotals` for it and looks for that on the screen, so a test
   cannot agree with a card that has drifted from the engine — both
   have to agree with the document.

   THE CATALOGUE IS LEFT AS THE BLOCK ABOVE LEFT IT, which is blank,
   and that is deliberate: a card is written from frozen lines, so it
   must draw on a desk whose price file has never been opened.
   ============================================================ */

const ORG = 'northside'
/** a Brisbane morning, fixed, so "2 hours ago" is a fact and not a clock */
const NOW = new Date('2026-09-18T10:00:00+10:00')
const clock = () => NOW

let n = 0

function line(label: string, unitPrice: number | null): QuoteLine {
  n += 1
  return {
    id: `l${n}`,
    entityId: 'boat_highfield',
    rowId: 'row_1',
    label,
    qty: 1,
    unitPrice,
    priceFieldId: 'fld_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: unitPrice, scope: 'quote' }],
  }
}

function doc(over: Partial<QuoteDef> = {}): QuoteDef {
  n += 1
  const hull = line('Highfield SP560', 41_340)
  const at = new Date(NOW.getTime() - n * 3_600_000).toISOString()
  return {
    id: `q${n}`,
    orgId: ORG,
    reference: `2026091${n}-01`,
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'boat_highfield',
    rootRowId: 'row_1',
    subjectLabel: 'Highfield - SP560 PVC',
    subjectSpecs: [],
    sections: [
      { blockId: '__subject', tableId: 'boat_highfield', title: 'Highfield', lineIds: [hull.id] },
    ],
    chapters: [{ id: '__subject', title: 'Highfield', tableId: 'boat_highfield' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: 'R. Kelleher' },
    preparedBy: 'Asaf',
    createdAt: at,
    updatedAt: at,
    ...over,
  }
}

/** File one document the way the app files one: through the store. */
const fileIt = (quote: QuoteDef): QuoteDef => {
  quotes.getState().file(quote, {
    id: `e-${quote.id}`,
    kind: 'minted',
    at: quote.createdAt,
    said: `${quote.subjectLabel} — quote ${quote.reference}`,
    changed: [],
  })
  return quote
}

/** the drafts column, which is the one this block is about */
const panel = () => screen.getByRole('region', { name: 'Open drafts' })

describe('home with documents filed in this browser', () => {
  beforeEach(async () => {
    n = 0
    await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
  })

  /* THE MAJOR OF 2026-09-17, in one case: "1 drafts are open, and the
     register that lists them is not built yet" — a plural bug, over a
     false sentence, over a diagram promising a card that had already
     arrived. */
  it('counts one draft in the singular, and never says the register is unbuilt', () => {
    const draft = fileIt(doc())
    render(<Home business="Northside Marine" now={clock} openQuotes={vi.fn<() => void>()} />)

    expect(within(panel()).getByTestId('draft-count')).toHaveTextContent('1')
    expect(within(panel()).getByText('1 draft is open.')).toBeInTheDocument()
    expect(panel().textContent).not.toContain('1 drafts')
    expect(panel().textContent).not.toContain('is not built yet')
    /* and the empty diagram's promise is not printed over a real one */
    expect(panel().textContent).not.toContain('When one does, it lands in this card')
    expect(within(panel()).getByText(draft.reference)).toBeInTheDocument()
  })

  it('draws the newest document as a card, from what the document froze', () => {
    const quote = fileIt(doc())
    render(<Home business="Northside Marine" now={clock} />)

    const card = within(panel()).getByRole('button', { name: new RegExp(quote.reference) })
    expect(within(card).getByText(quote.subjectLabel)).toBeInTheDocument()
    expect(within(card).getByText(quote.customer.name)).toBeInTheDocument()
    expect(within(card).getByText('Draft')).toBeInTheDocument()
    /* the figure is the engine's, not this file's */
    expect(card).toHaveTextContent(money(quoteTotals(quote).total))
    /* the rung is the document's own declared level, and a card is not
       a toggle: it opens something */
    expect(within(card).getByText('Total at Cash')).toBeInTheDocument()
    expect(card).not.toHaveAttribute('aria-pressed')
    expect(within(card).getByText(/1 line · 2 hours ago/)).toBeInTheDocument()
  })

  /* A PICTURE BELONGS TO THE EXACT MODEL IT DEPICTS. The ledger holds
     an SP560, so the card draws it; it holds nothing for the Stacer
     below, so that card says so and stands in for nothing. */
  it('draws the boat’s own photograph only where the ledger holds that model', () => {
    fileIt(doc())
    const { unmount } = render(<Home business="Northside Marine" now={clock} />)
    const shot = pictureForSubject('boat_highfield', 'Highfield - SP560 PVC')
    expect(shot).toBeDefined()
    const card = within(panel()).getByRole('button', { name: /SP560/ })
    expect(card.querySelector('img')?.getAttribute('src')).toBe(shot?.src)
    unmount()

    n = 0
    fileIt(doc({ rootTableId: 'boat_stacer', subjectLabel: 'Stacer 529 Assault Pro' }))
    render(<Home business="Northside Marine" now={clock} />)
    expect(
      within(panel())
        .getByRole('button', { name: /Assault Pro/ })
        .querySelector('img'),
    ).toBeNull()
    expect(within(panel()).getByText('No photograph held for this model')).toBeInTheDocument()
  })

  /* A DRAFT OPENS WHERE IT IS WRITTEN; AN ISSUED QUOTE OPENS AS THE
     PAPER THE CUSTOMER WAS GIVEN. The card hands back which it is, so
     one press cannot open a read-only screen full of refusals. */
  it('opens a draft and an issued quote by the state each one is in', async () => {
    const openQuote = vi.fn<(id: string, state: string) => void>()
    const draft = fileIt(doc())
    const { unmount } = render(
      <Home business="Northside Marine" now={clock} openQuote={openQuote} />,
    )
    await userEvent.click(
      within(panel()).getByRole('button', { name: new RegExp(draft.reference) }),
    )
    expect(openQuote).toHaveBeenCalledWith(draft.id, 'draft')
    unmount()

    await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
    n = 0
    const issued = fileIt(doc({ state: 'issued', issuedAt: NOW.toISOString() }))
    render(<Home business="Northside Marine" now={clock} openQuote={openQuote} />)
    expect(within(panel()).getByTestId('draft-count')).toHaveTextContent('0')
    /* the register's own sentence for an empty band, not one of ours */
    expect(within(panel()).getByText(/^Nothing is being written right now./)).toBeInTheDocument()
    await userEvent.click(
      within(panel()).getByRole('button', { name: new RegExp(issued.reference) }),
    )
    expect(openQuote).toHaveBeenCalledWith(issued.id, 'issued')
  })

  it('counts every band the register holds, in the register’s own words', () => {
    fileIt(doc())
    fileIt(doc({ state: 'issued', issuedAt: NOW.toISOString() }))
    render(<Home business="Northside Marine" now={clock} />)
    expect(
      within(panel()).getByText(/1 draft is open\. 2 filed in all — 1 draft · 1 issued\./),
    ).toBeInTheDocument()
  })

  /* AND THE CENSUS IS NOT SAID WHERE IT WOULD SAY NOTHING NEW: one
     draft and nothing else is one fact, not three. */
  it('says the census only where something other than a draft is filed', () => {
    fileIt(doc())
    render(<Home business="Northside Marine" now={clock} />)
    expect(within(panel()).getByText('1 draft is open.')).toBeInTheDocument()
    expect(panel().textContent).not.toContain('filed in all')
  })

  it('refuses a card with a sentence where nothing handed it a way to open one', () => {
    fileIt(doc())
    render(<Home business="Northside Marine" now={clock} />)
    const card = within(panel()).getByRole('button', { name: /SP560/ })
    expect(card).toHaveAttribute('aria-disabled', 'true')
    expect(card).toHaveAccessibleDescription(NO_WAY_TO_A_FILED_QUOTE)
    expect(within(panel()).getByText(NO_WAY_TO_A_FILED_QUOTE)).toBeInTheDocument()
  })
})
