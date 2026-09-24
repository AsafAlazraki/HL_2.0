import { useMemo } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { quotes } from '@/state/quotes'
import { prefs } from '@/state/prefs'
import { APP_NAME, DOORS } from '@/app/ways'
import { RECENT_KEY } from './recent'
import { Shell, ShellAround, addressOf, nameOf } from './Shell'
import { initialsOf } from '@/domain/shell/crest'
import { useSetScope } from './scope'

/* ============================================================
   THE SHELL, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   Nothing is seeded into the app here and no figure is typed: the
   doors come from `src/app/ways.ts`, the counts come from the stores,
   and every assertion below is about what a person can see and press
   on a page with no router in it. The walk through the real app — the
   twelve addresses, at six viewports — is `e2e/flows/shell.spec.ts`.

   THE STORE IS REOPENED ON A FRESH MEMORY DATABASE BEFORE EVERY CASE,
   for the reason `Quotes.test.tsx` gives beside its own: vitest hands
   one module instance to a whole file.
   ============================================================ */

const ORG = 'northside'

beforeEach(async () => {
  prefs.getState().forgetAll()
  await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
})

describe('the pill', () => {
  it('draws the five doors, in the order the app names them', () => {
    render(<Shell at="/quotes" go={() => {}} />)
    const pill = screen.getByRole('navigation')
    const doors = within(pill).getAllByRole('link')
    /* the crest is a link too, and it is the first one: the mark is
       the leading cap and it opens Home */
    expect(doors.map((a) => a.getAttribute('href'))).toEqual(['/', ...DOORS.map((d) => d.href)])
  })

  it('marks the screen a person is on, and only that one', () => {
    render(<Shell at="/data/boat_highfield" go={() => {}} />)
    const here = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page')
    expect(here).toHaveLength(1)
    expect(here[0]).toHaveTextContent('Data')
  })

  it('stands on no screen at the door', () => {
    const { container } = render(<Shell at="/sign-in" go={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('is the same object on every screen: the crest, five doors and nothing else', () => {
    /* rule (a), critique #13. The pill drew a `‹` named for where it went, and each one said a
       destination the same window already said — `‹ Data` beside a lit `Data 53`, `‹ Quotes`
       beside a lit `Quotes 1`, `‹ The build` above the paper's own "Back to the build". Now
       the links are the same six everywhere, and only which door is lit changes. */
    const every = ['/', '/quotes', '/data/boat_highfield', '/quote/abc', '/quote/new']
    for (const at of [...every, '/quote/abc/cascade', '/quote/abc/document', '/nope']) {
      const { unmount } = render(<Shell at={at} go={() => {}} />)
      const pill = screen.getByRole('navigation')
      expect(
        within(pill)
          .getAllByRole('link')
          .map((l) => l.getAttribute('href')),
        at,
      ).toEqual(['/', ...DOORS.map((d) => d.href)])
      expect(within(pill).queryByText('‹')).not.toBeInTheDocument()
      unmount()
    }
  })

  it('lights the register a screen inside it belongs to — that door is the way back', () => {
    for (const [at, word] of [
      ['/data/boat_highfield', 'Data'],
      ['/quote/abc/document', 'Quotes'],
    ] as const) {
      const { unmount } = render(<Shell at={at} go={() => {}} />)
      const lit = screen
        .getAllByRole('link')
        .filter((l) => l.getAttribute('aria-current') === 'page')
      expect(lit.map((l) => l.querySelector('.way-door__word')?.textContent)).toEqual([word])
      unmount()
    }
  })

  it('takes a plain press through the router rather than the browser', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} />)
    await user.click(screen.getByRole('link', { name: /^Quotes/ }))
    expect(go).toHaveBeenCalledWith('/quotes')
  })

  it('counts what the register counts, and prints a real zero once the store has answered', async () => {
    /* critique #9: the door printed OPEN DRAFTS under the word "Quotes", so a desk with one
       issued quote read "Quotes 0" beside "1 quote is filed". The figure is now the
       register's own; `src/domain/shell/doors.ts` holds the arithmetic. */
    render(<Shell at="/" go={() => {}} org={ORG} />)
    const quotesDoor = await screen.findByRole('link', { name: 'Quotes — 0 filed' })
    expect(quotesDoor).toHaveTextContent('Quotes0')
    /* and no dot: nothing is waiting */
    expect(quotesDoor.querySelector('[data-waiting]')).toBeNull()
  })

  it('says nothing at all where there is no figure to say', () => {
    /* THE BOOK IS A TABLE THAT DOES NOT EXIST until the first person is filed, so "0 people"
       would be a count of a register nobody has made. History carries no count at all: every
       event in it is already on a document counted somewhere else. */
    render(<Shell at="/" go={() => {}} />)
    expect(screen.getByRole('link', { name: 'Customers' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'History' })).toBeInTheDocument()
  })
})

describe('the crest', () => {
  it('is the business’s initials where no mark is held', () => {
    expect(initialsOf('Northside Marine')).toBe('NM')
    expect(initialsOf('Whitworths')).toBe('W')
  })

  it('is never an empty disc: before a file names a business it draws the helm (critique #21)', () => {
    render(<Shell at="/" go={() => {}} />)
    const crest = screen.getByRole('link', { name: `${APP_NAME} — Home` })
    expect(crest).toHaveAttribute('data-crest', 'helm')
    expect(crest.querySelector('svg')).not.toBeNull()
    /* it is still the door Home */
    expect(crest).toHaveAttribute('href', '/')
  })
})

describe('the finder', () => {
  it('opens on Ctrl K from any screen, and offers the doors and the acts', async () => {
    const user = userEvent.setup()
    render(<Shell at="/history" go={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.keyboard('{Control>}k{/Control}')
    const sheet = await screen.findByRole('dialog')
    expect(within(sheet).getByRole('option', { name: /Home/ })).toBeInTheDocument()
    expect(within(sheet).getByRole('option', { name: /New quote/ })).toBeInTheDocument()
    expect(within(sheet).getByRole('option', { name: /Load the file/ })).toBeInTheDocument()
  })

  it('every row says what pressing it does', async () => {
    const user = userEvent.setup()
    render(<Shell at="/" go={() => {}} />)
    await user.keyboard('{Control>}k{/Control}')
    const sheet = await screen.findByRole('dialog')
    for (const row of within(sheet).getAllByRole('option')) {
      expect(row.textContent).toMatch(/GO THERE|Go there|Start one|Open the door/i)
    }
  })

  it('goes where the row says, and shuts', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} />)
    await user.keyboard('{Control>}k{/Control}')
    const sheet = await screen.findByRole('dialog')
    await user.click(within(sheet).getByRole('option', { name: /Customers/ }))
    expect(go).toHaveBeenCalledWith('/customers')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on Escape and leaves the screen where it was', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} />)
    await user.keyboard('{Control>}k{/Control}')
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(go).not.toHaveBeenCalled()
  })

  it('says what it could not find, in the words that were typed', async () => {
    const user = userEvent.setup()
    render(<Shell at="/" go={() => {}} />)
    await user.keyboard('{Control>}k{/Control}')
    await user.keyboard('zzzqqq')
    expect(await screen.findByText(/^Nothing matches/)).toHaveTextContent('zzzqqq')
  })

  it('tells how to act on a row in both vocabularies, and the stylesheet draws one', async () => {
    /* rule (b): "Enter" where there is a keyboard, "press a row" where there is a finger.
       happy-dom matches no media query, so both are in the tree here; the phone walk in
       `e2e/flows/shell.spec.ts` asserts which one is seen. */
    const user = userEvent.setup()
    render(<Shell at="/" go={() => {}} />)
    await user.keyboard('{Control>}k{/Control}')
    await user.keyboard('home')
    const say = await screen.findByText(/Enter does what the row says/)
    expect(say).toHaveClass('way-say__keys')
    expect(screen.getByText(/Press a row and it opens: a boat starts its quote/)).toHaveClass(
      'way-say__touch',
    )
  })

  it('puts the screen’s own rows first, under a chip naming the scope', async () => {
    const user = userEvent.setup()
    const went: string[] = []
    render(
      <ShellAround at="/" go={() => {}}>
        <Scoped onGo={(id) => went.push(id)} />
      </ShellAround>,
    )
    await user.keyboard('{Control>}k{/Control}')
    const sheet = await screen.findByRole('dialog')
    expect(within(sheet).getByText('This build')).toBeInTheDocument()
    const rows = within(sheet).getAllByRole('option')
    expect(rows[0]).toHaveTextContent('02 Motor')
    await user.click(rows[0]!)
    expect(went).toEqual(['ch-motor'])
  })
})

describe('the ? sheet', () => {
  it('is not offered on a coarse pointer, where every cap on it is drawn away', async () => {
    const was = globalThis.matchMedia
    globalThis.matchMedia = ((query: string) =>
      ({ matches: query.includes('coarse'), media: query }) as MediaQueryList) as typeof matchMedia
    try {
      const user = userEvent.setup()
      render(<Shell at="/" go={() => {}} />)
      await user.keyboard('?')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    } finally {
      globalThis.matchMedia = was
    }
  })

  it('opens on ?, is searchable, and holds the shell’s own keys', async () => {
    const user = userEvent.setup()
    render(<Shell at="/" go={() => {}} />)
    await user.keyboard('?')
    const sheet = await screen.findByRole('dialog', { name: /Every key this app answers to/ })
    expect(within(sheet).getByText('Open the finder')).toBeInTheDocument()
    await user.type(within(sheet).getByRole('searchbox', { name: 'Find a shortcut' }), 'undo')
    expect(within(sheet).getByText('Undo the last change')).toBeInTheDocument()
    expect(within(sheet).queryByText('Open the finder')).not.toBeInTheDocument()
  })
})

describe('where this browser has been', () => {
  it('remembers an address only when it leaves it, and only when it can name it', async () => {
    const { rerender } = render(<Shell at="/data" go={() => {}} />)
    expect(prefs.getState().get(RECENT_KEY)).toBeUndefined()
    rerender(<Shell at="/history" go={() => {}} />)
    expect(prefs.getState().get(RECENT_KEY)).toEqual([
      { href: '/data', name: 'Data', fact: 'The price file' },
    ])
  })

  it('offers it back, above the doors, and never as the door itself', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Shell at="/data" go={() => {}} />)
    rerender(<Shell at="/history" go={() => {}} />)
    await user.keyboard('{Control>}k{/Control}')
    const sheet = await screen.findByRole('dialog')
    expect(within(sheet).getByText('Back to')).toBeInTheDocument()
    /* one row says "go back to it", the door below says "go there" —
       two questions, two answers, and the five doors are still five */
    expect(within(sheet).getAllByRole('option', { name: /Data/ })).toHaveLength(2)
  })
})

describe('the addresses a row opens', () => {
  it('opens a draft where it is written and an issued quote as the paper', () => {
    expect(addressOf({ at: 'quote', id: 'q1', issued: false })).toBe('/quote/q1')
    expect(addressOf({ at: 'quote', id: 'q1', issued: true })).toBe('/quote/q1/document')
  })

  it('opens a row on the sheet that holds it, at that row', () => {
    expect(addressOf({ at: 'row', tableId: 'boat_stacer', rowId: 'r 1' })).toBe(
      '/data/boat_stacer?at=r%201',
    )
    expect(addressOf({ at: 'table', tableId: 'boat_stacer' })).toBe('/data/boat_stacer')
    expect(addressOf({ at: 'customer', rowId: 'c1' })).toBe('/customers?who=c1')
  })

  it('has no address for a row the screen underneath owns', () => {
    expect(addressOf({ at: 'here', id: 'ch-motor' })).toBeNull()
  })
})

describe('naming a place before remembering it', () => {
  const tables = { boat_stacer: { id: 'boat_stacer', name: 'Stacer' } }

  it('names a door, a sheet and a document, and refuses to name a stranger', () => {
    expect(nameOf('/quotes', [], {})?.name).toBe('Quotes')
    expect(nameOf('/data/boat_stacer', [], tables)?.name).toBe('Stacer')
    expect(nameOf('/data/nothing', [], tables)).toBeNull()
    expect(nameOf('/quote/q1', [{ id: 'q1', reference: '20260923-01' }], {})).toEqual({
      href: '/quote/q1',
      name: '20260923-01',
      fact: 'the build',
    })
    /* a document this browser does not hold cannot be named, so it is
       not remembered */
    expect(nameOf('/quote/q9', [], {})).toBeNull()
  })
})

/** A screen that publishes its own rows, as the configurator and Home do — memoised, because
 *  a scope minted on every render would sit down and stand up on every keystroke. */
function Scoped({ onGo }: { onGo: (id: string) => void }) {
  const scope = useMemo(
    () => ({
      word: 'This build',
      title: 'On this build',
      rows: () => [
        {
          id: 'here:ch-motor',
          name: '02 Motor',
          fact: 'One motor, chosen',
          verb: 'Go to it',
          target: { at: 'here' as const, id: 'ch-motor' },
        },
      ],
      go: onGo,
    }),
    [onGo],
  )
  useSetScope(scope)
  return <main>a screen</main>
}
