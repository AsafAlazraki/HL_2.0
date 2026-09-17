import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FRONT_DOORS } from '@/app/ways'
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
})

describe('whose app this is', () => {
  it('names the dealership when this browser knows one', () => {
    render(<Lost address="/nope" business="Northside Marine" ways={ways} />)
    expect(screen.getByText('Northside Marine')).toBeInTheDocument()
  })

  it('says so honestly when it does not, and invents no name', () => {
    render(<Lost address="/nope" ways={ways} />)
    expect(screen.getByText('This business has not been named yet')).toBeInTheDocument()
  })
})

describe('the ways out', () => {
  it('draws the first as the act and the rest as doors, all of them real links', () => {
    render(<Lost address="/nope" ways={ways} />)
    for (const way of ways) {
      expect(screen.getByRole('link', { name: new RegExp(way.title) })).toHaveAttribute(
        'href',
        way.href,
      )
    }
  })

  it('hands a plain press to the app, so nothing reloads', async () => {
    const go = vi.fn<(href: string) => void>()
    render(<Lost address="/nope" ways={ways} go={go} />)

    await userEvent.click(screen.getByRole('link', { name: new RegExp(ways[0]!.title) }))
    expect(go).toHaveBeenCalledWith(ways[0]!.href)
  })

  it('leaves a ctrl-click to the browser, which is the whole reason for a link', () => {
    const go = vi.fn<(href: string) => void>()
    render(<Lost address="/nope" ways={ways} go={go} />)

    const link = screen.getByRole('link', { name: new RegExp(ways[1]!.title) })
    const handled = fireEvent.click(link, { ctrlKey: true })
    /* not prevented, and the app was not asked to navigate: the new tab
       is the browser's to open */
    expect(handled).toBe(true)
    expect(go).not.toHaveBeenCalled()
  })

  it('still draws real addresses with no navigator behind them, and never a dead control', () => {
    render(<Lost address="/nope" ways={ways} />)
    const link = screen.getByRole('link', { name: new RegExp(ways[0]!.title) })
    expect(link).toHaveAttribute('href', ways[0]!.href)
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

  it('still offers every way out, because a screen that stopped is still a dead end', () => {
    render(<Lost address="/quote/XaRRxt2eZF" ways={ways} thrown={{ message: 'it stopped' }} />)
    expect(screen.getAllByRole('link')).toHaveLength(ways.length)
  })

  it('does not print the not-found sentence over an error', () => {
    render(<Lost address="/quote/XaRRxt2eZF" ways={ways} thrown={{ message: 'it stopped' }} />)
    expect(screen.queryByText(/Every position in this app is a real address/)).toBeNull()
  })
})
