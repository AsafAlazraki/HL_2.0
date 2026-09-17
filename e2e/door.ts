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
   ============================================================ */

/** The name given at the desk. A test harness typing a name is not
 *  seeded data: nothing is written to the repository, and the app
 *  itself invents no one — this is a person at a keyboard, played by
 *  a test. */
export const AT_THE_DESK = 'Asaf'

export const FILE_DOOR = /Load the Master Price File/
export const BLANK_DOOR = /Start a blank sheet/

export interface DoorOptions {
  /** the blue door reads the file; the veiled one loads nothing */
  door?: 'file' | 'blank'
  who?: string
}

/** Give a name, press a door, and arrive on Home. */
export async function throughTheDoor(page: Page, options: DoorOptions = {}): Promise<void> {
  const { door = 'file', who = AT_THE_DESK } = options
  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()
  await page.getByRole('textbox').fill(who)
  await page.getByRole('button', { name: door === 'file' ? FILE_DOOR : BLANK_DOOR }).click()
  /* thirty seconds because the blue door reads 53 tables and 15,691
     rows over the network before it navigates; the blank door arrives
     immediately and is not slowed by waiting for the same URL */
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
}
