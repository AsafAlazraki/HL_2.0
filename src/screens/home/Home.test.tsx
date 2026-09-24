import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { boatOfQuote, spokenBoat } from '@/domain/quote/spoken'
import { countBoats } from '@/domain/quote/boats'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { isDiscontinued, type ModuleDef, type QuoteDef, type QuoteLine } from '@/domain/model'
import { addRow, batch, createTable } from '@/domain/catalogue/commands'
import { depictionOfRow } from '@/domain/catalogue/depicts'
import { cellsFor, registerShape } from '@/domain/people/book'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { money } from '@/domain/money'
import { quoteTotals } from '@/domain/quote/totals'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { holdingsOf, modelRowsOf } from './holdings'
import { heldPictures, markLedgerFacts, pictureById, pictureForSubject } from './ledgers'
import { ScopeSeat, useLendFinder } from '@/screens/shell/scope'
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
    render(<Home business="Northside Marine" from="pack" hour={9} />)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Good morning.')
    expect(screen.getByText(/No one has typed a name at this desk yet/)).toBeInTheDocument()
    expect(screen.getByText('Northside Marine')).toBeInTheDocument()
  })

  it('stamps the file with the tables, rows and joins that actually loaded', () => {
    const facts = held()
    render(<Home business="Northside Marine" from="pack" />)
    const stamp = screen.getByTestId('pack-counts')
    expect(within(stamp).getByText(facts.tables.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(stamp).getByText(facts.rows.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(stamp).getByText(facts.joins.toLocaleString('en-AU'))).toBeInTheDocument()
    /* where the copy came from is data on the line, not words on it:
       "read from this browser" sat beside the stopwatch in the critique's
       quote (#4) */
    expect(within(stamp).getByText('Master Price File')).toHaveAttribute('data-from', 'pack')
    expect(stamp).not.toHaveTextContent(/read from/)
    /* and no stopwatch: "· in 438 ms" was a developer's figure on the
       showroom (the critique of Milestone 2's close, #4) */
    expect(stamp).not.toHaveTextContent(/\bms\b/)
    /* the file's size in Data's figures and the showroom's nouns — lists
       and lines, never "tables · rows" (M2-close critique #4) */
    expect(stamp).toHaveTextContent(
      `${facts.tables.toLocaleString('en-AU')} lists · ${facts.rows.toLocaleString('en-AU')} lines · ${facts.joins.toLocaleString('en-AU')} of the lists say what fits what`,
    )
    expect(stamp).not.toHaveTextContent(/\b(tables?|rows?)\b/)
  })

  it('counts every kind off the file, labelled with the places that hold it', () => {
    const facts = held()
    render(<Home business="Northside Marine" />)
    const panel = screen.getByRole('region', { name: 'What this business sells' })
    for (const kind of facts.kinds) {
      expect(within(panel).getByText(kind.figure.toLocaleString('en-AU'))).toBeInTheDocument()
      expect(within(panel).getByText(kind.label)).toBeInTheDocument()
    }
    expect(facts.kinds).toHaveLength(6)
    /* BOATS AS A PERSON COUNTS THEM (built-critique-m2-close-2.md, major
       1): the models the picker opens on, never the lines behind them */
    const boats = facts.kinds.find((k) => k.kind === 'boat')!
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    expect(boats.figure).toBe(countBoats(tables, pack.rowsByEntity).boats)
    expect(boats.figure).toBeLessThan(boats.rows)
    expect(within(panel).queryByText(boats.rows.toLocaleString('en-AU'))).toBeNull()
    /* what goes with what, said in a dealer's words and not the file's
       anatomy — "25 registers hold those 7,012 rows, and 28 fitment joins
       carry the other 8,679" was the engine talking on the showroom */
    expect(panel).toHaveTextContent(
      `${facts.joinRows.toLocaleString('en-AU')} pairings say which motor, which trailer and which part goes on which hull.`,
    )
    expect(panel).not.toHaveTextContent(/registers hold|fitment joins/)
  })

  it('names every boat maker with its own count of models, as the picker counts them', () => {
    const facts = held()
    render(<Home business="Northside Marine" />)
    const shelf = screen.getByRole('region', { name: 'The boat makers' })
    const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
    const count = countBoats(tables, pack.rowsByEntity)
    for (const register of facts.boats) {
      expect(register.boats).toBe(count.byMaker.find((m) => m.id === register.id)?.boats)
      expect(
        within(shelf).getByText(
          `${register.boats.toLocaleString('en-AU')} ${register.boats === 1 ? 'model' : 'models'}`,
        ),
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
    /* the versions of THIS boat the file prices — never "588 rows in that
       register" (M2-close critique #3, #4) */
    const doors = [...fold.querySelectorAll('.home-plate-door')].map((p) => p.textContent)
    expect(doors).toContain(
      `${ofThisModel.toLocaleString('en-AU')} ${ofThisModel === 1 ? 'version' : 'versions'} of this boat on the price file.`,
    )
    expect(fold).not.toHaveTextContent(/\brows?\b|register/)
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

  /* THE PHOTOGRAPH OPENS ITS OWN BOAT (the M2-close critique, finding 18:
     "Open Highfield Inflatables opens a list of 67 models, not the ADV7
     in the photograph"), on a row the build will draw the same
     photograph for (finding 11). */
  it('opens the boat in each photograph, on a version the file still sells', async () => {
    const openBoat = vi.fn<(tableId: string, rowId: string) => void>()
    const openBoatRegister = vi.fn<(tableId: string) => void>()
    render(
      <Home business="Northside Marine" openBoat={openBoat} openBoatRegister={openBoatRegister} />,
    )
    const fold = screen.getByRole('region', { name: 'Two boats from the file' })
    for (const id of ['highfield-adv7', 'stacer-519-sea-ranger']) {
      const picture = pictureById(id)!
      const register = pack.byKey(picture.table)
      await userEvent.click(
        within(fold).getByRole('button', { name: `Quote the ${picture.model}` }),
      )
      const [tableId, rowId] = openBoat.mock.calls.at(-1)!
      expect(tableId).toBe(picture.table)
      const row = (pack.rowsByEntity[register.id] ?? []).find((r) => r.id === rowId)
      expect(row, id).toBeDefined()
      expect(isDiscontinued(row!)).toBe(false)
      expect(depictionOfRow(heldPictures(), register, row!)?.picture).toBe(picture)
    }
    expect(openBoat).toHaveBeenCalledTimes(2)
    expect(openBoatRegister).not.toHaveBeenCalled()
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

  /* THE CAPTION NAMES WHAT THE PHOTOGRAPHS SHOW, and nothing else
     (2026-09-23). It carried "held 2,560 × 1,706, drawn 770 × 513 · …
     neither drawn past its own size" — true, measured, and the most
     database-looking line on the showroom. The promise it printed is
     measured where a promise can be: `e2e/flows/home.spec.ts` reads each
     photograph's drawn box against the pixels it arrived with. */
  it('captions the two photographs with what they show, and no pixel arithmetic', () => {
    const left = pictureById('highfield-adv7')
    const right = pictureById('stacer-519-sea-ranger')
    render(<Home business="Northside Marine" />)
    const film = screen.getByText(`${left?.subject ?? ''} · ${right?.subject ?? ''}.`)
    expect(film.textContent).not.toMatch(/held|drawn|×/)
    /* AND IT NEVER CARRIES THE ONE FALSE CLAUSE IT EVER HAD. "Neither
       plate opens yet: a register has no screen until the picker is
       built" outlived the picker; both plates open. */
    expect(film.textContent).not.toContain('Neither plate opens')
  })

  /* THE CRITIQUE OF MILESTONE 2, #23: the empty card was "a wireframe" —
     labelled empty boxes where every other empty state in the app is a
     sentence. An empty desk now says the true state and teaches the sale
     in three steps, in the words the screens that make a quote use. */
  it('says no quote exists, and teaches the three steps that make one', () => {
    render(<Home business="Northside Marine" />)
    const panel = screen.getByRole('region', { name: 'Open drafts' })
    expect(within(panel).getByTestId('draft-count')).toHaveTextContent('0')
    expect(
      within(panel).getByText('No quote has been started in this browser yet.'),
    ).toBeInTheDocument()

    const steps = within(panel).getByRole('list', { name: 'How a quote is made' })
    const items = within(steps).getAllByRole('listitem')
    expect(items.map((item) => item.querySelector('.home-step-title')?.textContent)).toEqual([
      'Choose the boat',
      'Build it',
      'Give it to the customer',
    ])
    expect(within(panel).getByText(/starts the first/)).toHaveTextContent(/New quote/)

    /* no box is drawn in the shape of a document nobody has filled */
    for (const label of [
      /boat.s own photograph/i,
      /Where the act that opens it/i,
      /every region/,
    ]) {
      expect(within(panel).queryByText(label)).toBeNull()
    }
    /* and this render was handed no way to the register, so nothing
       stands here to press — absent rather than dead */
    expect(within(panel).queryByRole('button')).toBeNull()
  })

  /* AN EMPTY DESK DOES NOT POINT AT AN EMPTY REGISTER. The way to every
     quote is drawn once there is a quote; before that it led to three
     zeros, and the pill's own Quotes is there either way. */
  it('offers no way to the register while nothing is filed', () => {
    render(<Home business="Northside Marine" openQuotes={vi.fn<() => void>()} />)
    const panel = screen.getByRole('region', { name: 'Open drafts' })
    expect(within(panel).queryByRole('button', { name: 'All quotes' })).toBeNull()
  })

  it('searches the file from the field, and says where a result opens', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    expect(field).toHaveAttribute(
      'placeholder',
      `Search ${held().rows.toLocaleString('en-AU')} lines`,
    )

    fireEvent.change(field, { target: { value: 'crossfire' } })
    expect(screen.getByText(/lines answer to that/)).toBeInTheDocument()
    /* THE FINDER IS BUILT, so the sentence is no longer about an unbuilt
       screen: this field counts, and the shell's finder opens what it
       finds (src/screens/shell). */
    expect(screen.getByText(/opens the finder/)).toBeInTheDocument()

    fireEvent.change(field, { target: { value: 'zzzzzz' } })
    expect(screen.getByText('Nothing on the price file is called that.')).toBeInTheDocument()
  })

  /* THE NAME THE APP PRINTS IS A NAME IT FINDS (m2-last-critique.md, blocker 2): "sport
     560" answered "Nothing on the price file is called that." while the picker, the build
     and the paper all said Sport 560. The count is every boat line whose name the app says
     that way — read off the pack by `spokenBoat`, never typed here. */
  it('counts the boats by the name the screens print, and never says nothing is called that', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    const said = pack.entities
      .filter((t) => t.kind === 'boat')
      .flatMap((t) =>
        (pack.ctx.rowsByEntity[t.id] ?? []).filter((r) =>
          /\bSport 560\b/.test(spokenBoat(t.id, String(r.values[t.displayFieldId ?? ''])).say),
        ),
      )
    expect(said.length).toBeGreaterThan(0)
    fireEvent.change(field, { target: { value: 'sport 560' } })
    expect(screen.queryByText('Nothing on the price file is called that.')).toBeNull()
    expect(document.getElementById('home-search-said')).toHaveTextContent(
      /* the figure is NumberFlow's, whose own stylesheet rides in the text */
      new RegExp(`\\b${said.length} lines answer to that`),
    )
  })

  /* A COUNTER UNDER A SEARCH LABEL (the critique of Milestone 2's close, #12): Enter did
     nothing. It hands the words to the finder the shell lends — and where no shell stands,
     as in every case above, it has nothing to hand them to and does nothing. */
  it('hands what was typed to the finder on Enter', () => {
    const asked: string[] = []
    const onFind = (query: string): void => {
      asked.push(query)
    }
    function Lend() {
      useLendFinder(onFind)
      return null
    }
    render(
      <ScopeSeat>
        <Lend />
        <Home business="Northside Marine" />
      </ScopeSeat>,
    )
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    fireEvent.change(field, { target: { value: 'crossfire' } })
    /* said twice, to a keyboard and to a finger; home.css draws one of them */
    expect(screen.getAllByText(/opens them in the finder/)).toHaveLength(2)
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(asked).toEqual(['crossfire'])

    /* a word too short to search is not handed over */
    fireEvent.change(field, { target: { value: 'c' } })
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(asked).toEqual(['crossfire'])
  })

  /* RULE (b), 2026-09-23, and the critique's #18: "Ctrl K opens the
     finder" was printed at 390 on a device with no Ctrl key. The sentence
     is written twice — keys and touch — and home.css draws one per
     pointer. This case holds what each twin SAYS; which one is drawn is a
     media query, and `e2e/flows/home.spec.ts` reads it in a real browser
     on a touch screen and on a desk. */
  it('says where a found row opens in keys to a keyboard and in touch to a finger', () => {
    render(<Home business="Northside Marine" />)
    const said = document.getElementById('home-search-said')
    expect(said).not.toBeNull()
    const keys = said?.querySelector('[data-say="keys"]')
    const touch = said?.querySelector('[data-say="touch"]')
    /* the keyboard twin carries the chord as a cap, so it is ⌘ K on a Mac */
    expect(keys?.querySelector('kbd')).not.toBeNull()
    /* and the touch twin names the bubble a finger presses, and no key */
    expect(touch?.querySelector('kbd')).toBeNull()
    expect(touch?.textContent).toMatch(/Find, on the bar, opens what it finds/)
    expect(touch?.textContent).not.toMatch(/Ctrl|⌘|Mod|press \//i)
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
    for (const kind of facts.kinds) allowed.add(kind.figure)
    for (const register of facts.boats) allowed.add(register.boats)
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

    render(<Home business="Northside Marine" from="pack" />)
    /* EVERY TEXT NODE, READ ON ITS OWN. `textContent` runs one element's
       last word into the next one's first — "Inflatables588 rows" — and
       the lookbehind below then skipped the 588, so this case was
       quietly reading fewer figures than the screen prints. Joined with a
       space, every figure on the screen is read, which is the stronger
       form of the same question. */
    const walker = document.createTreeWalker(screen.getByTestId('home'), NodeFilter.SHOW_TEXT)
    const parts: string[] = []
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      parts.push(node.textContent ?? '')
    }
    const text = parts.join(' ')
    const printed = [...text.matchAll(/(?<![\w,.])\d[\d,]*(?![\w])/g)].map((m) =>
      Number(m[0].replaceAll(',', '')),
    )
    expect(printed.length).toBeGreaterThan(10)
    const invented = printed.filter((n) => !allowed.has(n))
    expect(invented).toEqual([])
  })
})

/* ============================================================
   THE CRITIQUE OF MILESTONE 2'S CLOSE, BLOCKER 2, AS IT WAS DRIVEN.

   "File M. Duffy from the pile, then open Home": the Labour Rates figure
   read 65 where the file carries 64, the masthead 54 tables and 15,692
   rows, and the field "Search 15,692 rows". The person is filed below
   through the catalogue store by the one command Customers applies the
   day the first person is filed — the book made by `registerShape()`
   and the row added, in one batch — and Home is then read for every
   figure it prints about the file, each held to what the file carries.
   ============================================================ */
describe('home after a customer is filed', () => {
  beforeAll(async () => {
    await loadTheFile()
    const shape = registerShape()
    const nameId = shape.fields?.[0]?.id ?? ''
    const outcome = catalogue
      .getState()
      .apply(batch([createTable(shape), addRow(CUSTOMER_TABLE_ID, cellsFor(nameId, 'M. Duffy'))]))
    if ('refused' in outcome) throw new Error(outcome.refused)
  })

  it('counts the price file, and never the book of people beside it', () => {
    /* the book IS on the sheet: the case below is not passing on a
       filing that did not happen */
    expect(catalogue.getState().rows[CUSTOMER_TABLE_ID]).toHaveLength(1)

    const facts = held()
    expect(facts.tables).toBe(pack.manifest.counts.tables)
    expect(facts.rows).toBe(pack.manifest.counts.rows)

    render(<Home business="Northside Marine" from="repository" />)
    const stamp = screen.getByTestId('pack-counts')
    expect(within(stamp).getByText(facts.tables.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(stamp).getByText(facts.rows.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(stamp).queryByText((facts.rows + 1).toLocaleString('en-AU'))).toBeNull()

    const panel = screen.getByRole('region', { name: 'What this business sells' })
    const custom = facts.kinds.find((k) => k.kind === 'custom')!
    expect(within(panel).getByText(custom.label)).toBeInTheDocument()
    expect(within(panel).getByText(custom.rows.toLocaleString('en-AU'))).toBeInTheDocument()
    expect(within(panel).queryByText((custom.rows + 1).toLocaleString('en-AU'))).toBeNull()
    /* every figure the panel prints is one of the file's own: the six,
       and the pairings, which are the file's join rows */
    for (const kind of facts.kinds) {
      expect(within(panel).getByText(kind.figure.toLocaleString('en-AU'))).toBeInTheDocument()
    }
    expect(panel).toHaveTextContent(`${facts.joinRows.toLocaleString('en-AU')} pairings say`)

    expect(screen.getByRole('searchbox', { name: /Search the file/ })).toHaveAttribute(
      'placeholder',
      `Search ${pack.manifest.counts.rows.toLocaleString('en-AU')} lines`,
    )
  })

  it('searches the file from the field, and not the book', () => {
    render(<Home business="Northside Marine" />)
    const field = screen.getByRole('searchbox', { name: /Search the file/ })
    fireEvent.change(field, { target: { value: 'Duffy' } })
    expect(screen.queryByText(/carr(y|ies) that word/)).toBeNull()
  })
})

/* A BROWSER THAT HOLDS NO COPY OF THE FILE — read once and not kept, or let go by the
   browser. It is Northside's own state and it stays, and it teaches. Until 2026-09-25 this
   group was "home against a blank sheet", the state a second door on Entry opened for a
   business with no price file; that door is gone (docs/DECISIONS.md). */
describe('home in a browser that holds no copy of the file', () => {
  beforeAll(async () => {
    await loadNothing()
  })

  it('draws the same composition with nothing counted, and says so', async () => {
    /* a file packed without a name hands the screen an empty string,
       which is not a name: it reads as nobody, everywhere */
    render(<Home business="   " from="pack" />)

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(
      screen.getByText('The Master Price File is not in this browser yet.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/No price file is open/)).toBeInTheDocument()
    expect(screen.queryByTestId('pack-counts')).toBeNull()

    /* the fold keeps its two frames and neither pretends */
    const fold = screen.getByRole('region', { name: 'Two boats from the file' })
    expect(within(fold).queryAllByRole('img')).toHaveLength(0)
    expect(within(fold).getAllByText(/Nothing stands in for it/)).toHaveLength(2)
    expect(within(fold).getAllByText('No photograph here')).toHaveLength(2)

    /* no name is invented, and none is said to be missing: Northside is named by its own
       file, and this browser has not read it (the sentence "This business has not been
       named yet" went on 2026-09-25) */
    expect(screen.queryByText(/not been named/)).toBeNull()
    expect(screen.queryByText(/blank sheet/i)).toBeNull()
    expect(screen.getByText('What this business sells')).toBeInTheDocument()
    expect(
      screen.getByText(/Nothing is counted here until a price file is read in/),
    ).toBeInTheDocument()
    expect(
      screen.getByText('There is nothing to search until a price file is read in.'),
    ).toBeInTheDocument()
  })

  /* THE ONE THING THIS DESK CAN OFFER is the door, because this
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
    expect(
      await screen.findByText('The Master Price File is not in this browser yet.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load the Master Price File' })).toBeNull()
  })

  /* AND IT NEVER SAYS IT IS READING THE FILE, because it is not: the
     file is read at the door, and this screen reads what this browser
     kept. */
  it('never claims to be reading the Master Price File', async () => {
    render(<Home business="Northside Marine" openTheFile={vi.fn<() => void>()} />)
    expect(
      await screen.findByText('The Master Price File is not in this browser yet.'),
    ).toBeInTheDocument()
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
    /* the lesson is for an empty desk: once a quote exists, the card is it */
    expect(within(panel()).queryByRole('list', { name: 'How a quote is made' })).toBeNull()
  })

  it('offers the register once something is filed, and presses it', async () => {
    fileIt(doc())
    const openQuotes = vi.fn<() => void>()
    render(<Home business="Northside Marine" now={clock} openQuotes={openQuotes} />)
    await userEvent.click(within(panel()).getByRole('button', { name: 'All quotes' }))
    expect(openQuotes).toHaveBeenCalledTimes(1)
  })

  it('draws the newest document as a card, from what the document froze', () => {
    const quote = fileIt(doc())
    render(<Home business="Northside Marine" now={clock} />)

    const card = within(panel()).getByRole('button', { name: new RegExp(quote.reference) })
    /* the boat as a person says it, off the string the document froze */
    expect(within(card).getByText(boatOfQuote(quote).say)).toBeInTheDocument()
    expect(card.textContent).not.toContain(quote.subjectLabel)
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
    const card = within(panel()).getByRole('button', { name: /Sport 560/ })
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
    const card = within(panel()).getByRole('button', { name: /Sport 560/ })
    expect(card).toHaveAttribute('aria-disabled', 'true')
    expect(card).toHaveAccessibleDescription(NO_WAY_TO_A_FILED_QUOTE)
    expect(within(panel()).getByText(NO_WAY_TO_A_FILED_QUOTE)).toBeInTheDocument()
  })
})
