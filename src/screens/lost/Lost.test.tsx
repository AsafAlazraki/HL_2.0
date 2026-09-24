import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DOORS, FRONT_DOORS, START_A_QUOTE } from '@/app/ways'
import { Lost, NO_WAY_OUT } from './Lost'

/* ============================================================
   The lost screen, read by role and by text.

   Nothing here asserts a figure that was typed into it: the addresses
   and the sentences come from `src/app/ways.ts`, which the shell suite
   separately proves are real addresses in the real route tree, and the
   one number on the screen — how long an over-long address is — is
   computed from the string the test handed in.
   ============================================================ */

const ways = FRONT_DOORS
/** the first way is the act, and it is drawn whatever it is */
const act = ways[0]!
/** the doors under it are only those the pill does not already carry */
const own = ways.slice(1).filter((way) => !DOORS.some((door) => door.href === way.href))

describe('the address', () => {
  it('is the subject of the screen, drawn exactly as it was asked for', () => {
    render(<Lost address="/nope?find=stacer" ways={ways} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'There is nothing at this address.' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('lost-address')).toHaveTextContent('/nope?find=stacer')
  })

  it('is cut past the specimen length, and the cut is said out loud with the true length', () => {
    const long = `/${'x'.repeat(400)}`
    render(<Lost address={long} ways={ways} />)

    const shown = screen.getByTestId('lost-address').textContent ?? ''
    expect(shown.length).toBe(120)
    expect(long.startsWith(shown)).toBe(true)
    expect(screen.getByText(new RegExp(String(long.length)))).toBeInTheDocument()
  })

  it('says nothing about a cut when there is none', () => {
    render(<Lost address="/nope" ways={ways} />)
    expect(screen.queryByText(/Cut here/)).toBeNull()
  })

  /* RULE (c) OF 2026-09-23: no route is printed as text. Each door ended
     in its own path in mono — `/quotes`, `/quote/new` — and the one
     address a dealer should see on this screen is the one they typed. */
  it('prints no address but the one that was asked for', () => {
    const { container } = render(<Lost address="/nope" ways={ways} />)
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    const printed: string[] = []
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = (node.textContent ?? '').trim()
      if (text !== '') printed.push(text)
    }
    for (const way of ways) {
      expect(printed, way.href).not.toContain(way.href)
    }
    expect(printed.filter((text) => text.startsWith('/'))).toEqual(['/nope'])
  })

  it('says what probably happened in a dealer’s words, and that nothing is lost', () => {
    render(<Lost address="/nope" ways={ways} />)
    expect(screen.getByText(/may have been mistyped/)).toBeInTheDocument()
    expect(
      screen.getByText(/every quote written in this browser is still filed/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Every position in this app is a real address/)).toBeNull()
  })
})

describe('whose app this is', () => {
  it('names the dealership when this browser knows one', () => {
    render(<Lost address="/nope" business="Northside Marine" ways={ways} />)
    expect(screen.getByText('Northside Marine')).toBeInTheDocument()
  })

  /* NOTHING IS SAID ABOUT A NAME THIS BROWSER HAS NOT READ. A dead end typed on a desk where
     the file WAS open said the business had no name for the length of the read (driven
     2026-09-24); and once a read had found no file it said "This business has not been named
     yet", a sentence for a business nobody named, which Northside is not (gone 2026-09-25). */
  it('invents no name where none is known, and says none is missing', () => {
    render(<Lost address="/nope" ways={ways} />)
    expect(screen.queryByText(/has not been named/)).toBeNull()
    expect(screen.queryByText('Northside Marine')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'There is nothing at this address.',
    )
  })
})

describe('the ways out', () => {
  it('draws the first as the act and the rest as doors, all of them real links', () => {
    render(<Lost address="/nope" ways={ways} />)
    for (const way of [act, ...own]) {
      expect(screen.getByRole('link', { name: new RegExp(way.title) })).toHaveAttribute(
        'href',
        way.href,
      )
    }
  })

  /* RULE (a) OF 2026-09-23, THE PILL CARRIES THE DOORS. The walk counted
     five ways out of a screen whose whole job is one: the pill's Home and
     Quotes, then this screen's Home, register and picker. The act stays
     as the act; a door the pill carries is not drawn again under it. */
  it('repeats no door the pill carries under its act, and keeps the one the pill does not', () => {
    render(<Lost address="/nope" ways={ways} />)
    const doors = screen.getByRole('navigation', { name: 'Also in this app' })
    for (const door of DOORS) {
      expect(doors.querySelector(`a[href="${door.href}"]`), door.href).toBeNull()
    }
    expect(doors.querySelector(`a[href="${START_A_QUOTE.href}"]`)).not.toBeNull()
    expect(own.map((way) => way.href)).toEqual([START_A_QUOTE.href])
  })

  it('hands a plain press to the app, so nothing reloads', async () => {
    const go = vi.fn<(href: string) => void>()
    render(<Lost address="/nope" ways={ways} go={go} />)

    await userEvent.click(screen.getByRole('link', { name: new RegExp(act.title) }))
    expect(go).toHaveBeenCalledWith(act.href)
  })

  it('leaves a ctrl-click to the browser, which is the whole reason for a link', () => {
    const go = vi.fn<(href: string) => void>()
    render(<Lost address="/nope" ways={ways} go={go} />)

    const link = screen.getByRole('link', { name: new RegExp(own[0]!.title) })
    const handled = fireEvent.click(link, { ctrlKey: true })
    /* not prevented, and the app was not asked to navigate: the new tab
       is the browser's to open */
    expect(handled).toBe(true)
    expect(go).not.toHaveBeenCalled()
  })

  it('still draws real addresses with no navigator behind them, and never a dead control', () => {
    render(<Lost address="/nope" ways={ways} />)
    const link = screen.getByRole('link', { name: new RegExp(act.title) })
    expect(link).toHaveAttribute('href', act.href)
    expect(link).not.toHaveAttribute('aria-disabled')
  })

  it('says so when a render is handed nowhere to go', () => {
    render(<Lost address="/nope" />)
    expect(screen.getByText(NO_WAY_OUT)).toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})

describe('a screen that threw', () => {
  it('quotes what it said, word for word, and offers to draw it again', async () => {
    const retry = vi.fn<() => void>()
    render(
      <Lost
        address="/quote/XaRRxt2eZF"
        ways={ways}
        thrown={{ message: 'finishLevels returned the empty set for this table.' }}
        retry={retry}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'This screen stopped.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('finishLevels returned the empty set for this table.'),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Draw it again' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('still offers its act and its door, because a screen that stopped is still a dead end', () => {
    render(<Lost address="/quote/XaRRxt2eZF" ways={ways} thrown={{ message: 'it stopped' }} />)
    expect(screen.getAllByRole('link')).toHaveLength(1 + own.length)
  })

  it('does not print the not-found sentence over an error', () => {
    render(<Lost address="/quote/XaRRxt2eZF" ways={ways} thrown={{ message: 'it stopped' }} />)
    expect(screen.queryByText(/may have been mistyped/)).toBeNull()
  })
})
