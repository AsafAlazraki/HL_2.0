import { expect, type Page } from '@playwright/test'

/* ============================================================
   THE WALK EVERY BROWSER-SIDE TEST TAKES TO GET PAST THE DOOR.

   From Milestone 1 the app has a first-visit rule: a browser with no
   name in it lands on Entry, and only a browser with one lands on
   Home. So `page.goto('/')` is no longer how a test reaches Home, and
   a test that pretended otherwise would be asserting against a screen
   the app would not have shown a person.

   IT IS A WALK, NOT A SEEDED KEY. Writing `hl2.session` into
   localStorage would be quicker and would prove nothing: the thing
   most worth knowing about this shell is that the name given on Entry
   and the sheet read by Entry both survive the navigation to Home.
   Every ruler, every shot and every flow therefore goes through the
   real door, and the day the handover breaks, fifty-one checks say so
   at once instead of one.

   ONE DOOR, SINCE 2026-09-25. Entry offered a second, "Start a blank
   sheet", which opened the app on no file for a business with no price
   file; it is gone, and so is this walk's `door` option.
   ============================================================ */

/** The name given at the desk. A test harness typing a name is not
 *  seeded data: nothing is written to the repository, and the app
 *  itself invents no one — this is a person at a keyboard, played by
 *  a test. */
export const AT_THE_DESK = 'Asaf'

export const FILE_DOOR = /Load the Master Price File/

export interface DoorOptions {
  who?: string
}

/** Give a name, press the door, and arrive on Home with the file in. */
export async function throughTheDoor(page: Page, options: DoorOptions = {}): Promise<void> {
  const { who = AT_THE_DESK } = options
  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()
  await page.getByRole('textbox').fill(who)
  await page.getByRole('button', { name: FILE_DOOR }).click()
  /* thirty seconds because the door reads 53 tables and 15,691 rows
     over the network before it navigates */
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
}

/** The name this browser files its database under — `DATABASE_NAME` in
 *  `src/data/dexie/database.ts`, repeated because a Playwright walk
 *  does not import the app. */
const DATABASE = 'hl2'

/**
 * A BROWSER THAT REMEMBERS WHO IS AT THE DESK AND HOLDS NO COPY OF THE
 * FILE. It is Northside's own state and a real one: the file was read
 * once and could not be kept (a private window, a full disk), or the
 * browser let its database go while the name stayed. Every screen says
 * so and offers the door.
 *
 * WALKED, NOT PLANTED: the name is given at the real door with the real
 * file, and then this browser's database is deleted, which is exactly
 * what the browser does when it lets it go. Nothing is written in its
 * place. The page is left on Home, reloaded over the empty database.
 */
export async function withoutTheFile(page: Page, options: DoorOptions = {}): Promise<void> {
  await throughTheDoor(page, options)
  await page.evaluate(
    (name) =>
      new Promise<void>((resolve, reject) => {
        /* the app's own connection closes itself on the version change a
           delete raises (Dexie's default), so the delete is never blocked
           for long; a delete that fails says why */
        const asked = indexedDB.deleteDatabase(name)
        asked.addEventListener('success', () => {
          resolve()
        })
        asked.addEventListener('error', () => {
          reject(new Error(`the database ${name} could not be deleted`))
        })
      }),
    DATABASE,
  )
  await page.reload()
  await expect(page.getByTestId('home')).toBeVisible()
}
