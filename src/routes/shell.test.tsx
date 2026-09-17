import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { session } from '@/state/session'

/* ============================================================
   THE FIRST-VISIT RULE, ASKED OF THE REAL ROUTER.

   Not of a predicate: the whole point of putting the rule in
   `beforeLoad` is that it runs before a screen is drawn, and a test
   that called the function itself would pass just as happily if the
   router never called it. So this mounts the app's own route tree at
   an address and asks which screen arrived, by role and by the words
   on it.

   NOTHING IS SERVED. `fetch` answers 404 to everything, which is what
   the entry screen looks like on a half-published build: it still
   draws its question and its two doors and says what it could not
   read. The screens' own suites serve a small pack and assert the
   figures; here the question is only which screen a visitor lands on.
   ============================================================ */

const app = (at = '/') =>
  render(
    <RouterProvider
      router={createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [at] }) })}
    />,
  )

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('nothing here', { status: 404 })),
  )
  prefs.getState().forgetAll()
  session.getState().signOut()
  /* the sheet is a module singleton, and a test that inherited the
     previous test's tables would be drawing a Home nobody opened */
  void catalogue.getState().load({ entities: [], rowsByEntity: {} })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the first visit', () => {
  test('a browser with no name lands on the door, not on Home', async () => {
    app()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Put a name to this desk.' }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('home')).toBeNull()
  })

  test('a name given at the door is remembered, and Home greets it', async () => {
    session.getState().signIn('Asaf')
    app()
    const greeting = await screen.findByRole('heading', { level: 1 })
    expect(greeting).toHaveTextContent(/Asaf/)
    expect(screen.queryByTestId('entry')).toBeNull()
  })

  test('a named visitor who types the door’s address is sent to Home', async () => {
    session.getState().signIn('Asaf')
    app('/sign-in')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Asaf/)
    expect(screen.queryByTestId('entry')).toBeNull()
  })

  test('…unless they asked for it, which is what ?again is for', async () => {
    session.getState().signIn('Asaf')
    app('/sign-in?again=true')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Put a name to this desk.' }),
    ).toBeInTheDocument()
  })

  test('a word that is not the flag is not the flag', async () => {
    session.getState().signIn('Asaf')
    app('/sign-in?again=later')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Asaf/)
  })
})

describe('a desk with no price file in it', () => {
  test('says so, and offers the door back to the file', async () => {
    session.getState().signIn('Asaf')
    app()
    expect(
      await screen.findByText('A blank sheet. No price file has been read into it yet.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/No price file is open/)).toBeInTheDocument()

    /* THE PROMISE THE BLANK DOOR MAKES, KEPT. Pressing it goes back to
       the entry screen with the name already given — the one address
       that reaches the door with a name in the session. */
    await userEvent.click(screen.getByRole('button', { name: 'Load the Master Price File' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Put a name to this desk.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Put a name to this desk.' })).toHaveValue('Asaf')
  })
})
