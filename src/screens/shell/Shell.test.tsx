import { useMemo } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { quotes } from '@/state/quotes'
import { prefs } from '@/state/prefs'
import { DOORS } from '@/app/ways'
import { RECENT_KEY } from './recent'
import { Shell, ShellAround, addressOf, nameOf } from './Shell'
import { initialsOf } from './Pill'
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

  it('names the way back for where it goes, and draws none from a door', () => {
    render(<Shell at="/quote/abc/cascade" go={() => {}} />)
    expect(screen.getByRole('link', { name: 'Back to The build' })).toBeInTheDocument()
  })

  it('draws no way back from a door', () => {
    render(<Shell at="/history" go={() => {}} />)
    expect(screen.queryByText('‹')).not.toBeInTheDocument()
  })

  it('takes a plain press through the router rather than the browser', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} />)
    await user.click(screen.getByRole('link', { name: /^Quotes/ }))
    expect(go).toHaveBeenCalledWith('/quotes')
  })

  it('prints a zero draft count as zero once the store has answered', async () => {
    render(<Shell at="/" go={() => {}} org={ORG} />)
    const quotesDoor = await screen.findByRole('link', { name: 'Quotes — 0 open drafts' })
    expect(quotesDoor).toHaveTextContent('Quotes0')
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
    /* a business nobody has named yet gets nothing rather than a guess */
    expect(initialsOf(null)).toBe('')
    expect(initialsOf('   ')).toBe('')
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
    expect(await screen.findByText(/Nothing in this browser matches/)).toHaveTextContent('zzzqqq')
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
      { href: '/data', name: 'Data', fact: 'The tables' },
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
