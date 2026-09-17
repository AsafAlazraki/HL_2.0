/**
 * THE ADDRESSES THIS APP HAS A SCREEN FOR, in one list, in the order a person needs them.
 *
 * Written 2026-09-18 for the screen that draws a dead end. The critique measured `/nope` and
 * found a white page with the words "Not Found" on it, no dealership, no controls and no way
 * back — in an app that is otherwise entirely dark and named. A screen can only offer a way
 * out if something knows what the ways ARE, and until this file nothing did: every address in
 * the app was a string literal inside the one route that owns it.
 *
 * WHY IT IS HERE AND NOT IN A SCREEN. Which address a press lands on is a fact about the
 * app's shape, not about any one screen's layout — the same argument `src/routes/index.tsx`
 * makes when it says a document's address belongs to the route. Three screens need this list
 * (the lost screen, and the two "no quote is filed at this address" states, which were dead
 * ends of their own), and three copies of it would drift the first time an address moved.
 *
 * WHAT KEEPS IT HONEST. `src/routes/shell.test.tsx` mounts the real route tree at every href
 * below and asserts a real screen arrives — not the lost screen. So a door that stopped
 * existing, or an address that was renamed underneath this file, fails the suite instead of
 * printing an invitation to nowhere. No figure is quoted in any sentence here: what each
 * screen counts is counted on that screen, off the store.
 */

/** A way out of where somebody is: a real address, what is there, and what it does. */
export interface Way {
  /** the address, exactly as a person would type it */
  href: string
  /** what is there, as the screen itself is named */
  title: string
  /** one sentence saying what that screen does */
  say: string
}

export const FRONT_DOORS: readonly Way[] = [
  {
    href: '/',
    title: 'Home',
    say: 'The showroom: what this dealership sells, photographed, with every draft that is open.',
  },
  {
    href: '/quotes',
    title: 'The register',
    say: 'Every draft, issued and superseded quote in this browser, found by reference, customer or boat.',
  },
  {
    href: '/quote/new',
    title: 'Start a quote',
    say: 'The picker: every model the Master Price File carries, by register, with what each one holds.',
  },
]

/**
 * NO WAYS AT ALL, as one stable reference. A component that wrote
 * `ways = []` in its own signature would mint a fresh array on every
 * render and break referential equality for everything below it; this
 * is the same empty list every time, and a screen handed it draws the
 * sentence it has for being given nowhere to go.
 */
export const NO_WAYS: readonly Way[] = []
