import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { appRouter } from '@/app/router'
import { DOORS, FRONT_DOORS } from '@/app/ways'
import { ScreenThrew } from '@/routes/__root'
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

/* IT IS THE APP'S OWN ROUTER, not a second one built beside it. Until
   2026-09-18 this line called `createRouter({ routeTree, history })`
   directly, so every option `src/main.tsx` set — including the one that
   decides what a person sees when a screen throws — was invisible to
   every test in this file. `appRouter` takes the history and nothing
   else, for that reason. */
const app = (at = '/') =>
  render(
    <RouterProvider
      router={appRouter({ history: createMemoryHistory({ initialEntries: [at] }) })}
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

/* ============================================================
   THE TWO ENDINGS, ASKED OF THE REAL ROUTER.

   Both were measured by the flow critique as one white page with the
   words "Not Found" on it, no dealership, no controls and no way back —
   and, because `defaultErrorComponent` was unset too, as where every
   screen that threw ended up. Neither could have been caught by a
   suite: the not-found case had no test, and the thrown case could not
   have had one, because the router this file built was not the router
   the app shipped.
   ============================================================ */

/** a front door the pill already carries, which the dead end therefore does not draw again */
const onPill = (way: (typeof FRONT_DOORS)[number]) => DOORS.some((d) => d.href === way.href)

describe('an address the app does not have', () => {
  test('draws the lost screen, named, with the address on it', async () => {
    session.getState().signIn('Asaf')
    app('/nope')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'There is nothing at this address.' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('lost-address')).toHaveTextContent('/nope')
    /* the thing the white page had none of */
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })

  test('every way out is a real link with a real address on it', async () => {
    session.getState().signIn('Asaf')
    app('/nope')
    const lost = await screen.findByTestId('lost')

    /* WITHIN THE SCREEN, NOT WITHIN THE PAGE. From 2026-09-23 the shell
       draws its own pill over every screen but Entry, and it carries
       Home and the register as links of its own — so a query over the
       whole document would be asking which of two real ways out this
       screen drew. This is about the screen's.

       AND THE SCREEN NO LONGER REPEATS THE PILL (rule (a) of 2026-09-23,
       `Lost.tsx`): under its act it draws only the ways the pill does not
       carry. So every front door is still a real link with its real
       address in this window — the act and the picker on the screen, the
       register on the pill — and none of them is drawn twice. */
    const pill = await screen.findByTestId('shell-pill')
    const [act, ...rest] = FRONT_DOORS
    for (const way of [act!, ...rest.filter((w) => !onPill(w))]) {
      const link = within(lost).getByRole('link', { name: new RegExp(way.title) })
      expect(link, `${way.title} is an <a> with ${way.href} on it`).toHaveAttribute(
        'href',
        way.href,
      )
    }
    for (const way of rest.filter(onPill)) {
      expect(
        lost.querySelector(`a[href="${way.href}"]`),
        `${way.href} is not drawn twice`,
      ).toBeNull()
      expect(
        pill.querySelector(`a[href="${way.href}"]`),
        `${way.href} is a real link on the pill`,
      ).not.toBeNull()
    }
  })

  test('and every one of those addresses is a screen, not another dead end', async () => {
    for (const way of FRONT_DOORS) {
      session.getState().signIn('Asaf')
      const drawn = app(way.href)
      await screen.findByRole('main')
      expect(screen.queryByTestId('lost'), `${way.href} is a real address`).toBeNull()
      drawn.unmount()
    }
  })

  test('pressing the act lands on Home, without a page load', async () => {
    session.getState().signIn('Asaf')
    app('/nope')
    const screenAt = await screen.findByTestId('lost')

    await userEvent.click(within(screenAt).getByRole('link', { name: /Home/ }))
    expect(await screen.findByTestId('home')).toBeInTheDocument()
    expect(screen.queryByTestId('lost')).toBeNull()
  })
})

describe('a screen that throws', () => {
  test('the app router hands it to the same screen', () => {
    expect(appRouter().options.defaultErrorComponent).toBe(ScreenThrew)
  })

  /* THE OTHER HALF, AND IT IS A FIXTURE THAT REALLY THROWS. The line
     above proves the wire is connected; this proves the thing on the
     end of it works, on a route tree built here whose only screen
     throws on sight. Nothing in the app can be made to throw on demand,
     and a guard nobody has seen fail is the defect this repository
     keeps finding in itself. */
  test('and that screen prints what it said, word for word, with a way back', async () => {
    const root = createRootRoute()
    const boom = createRoute({
      getParentRoute: () => root,
      path: '/',
      component: () => {
        throw new Error('The rung this quote is priced at is not on this table.')
      },
    })
    render(
      <RouterProvider
        router={createRouter({
          routeTree: root.addChildren([boom]),
          history: createMemoryHistory({ initialEntries: ['/'] }),
          defaultErrorComponent: ScreenThrew,
        })}
      />,
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'This screen stopped.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('The rung this quote is priced at is not on this table.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Draw it again' })).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
  })
})
