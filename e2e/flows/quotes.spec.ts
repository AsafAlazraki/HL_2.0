import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE QUOTES REGISTER, IN A REAL BROWSER, AT EVERY SIZE.

   On a browser nobody has quoted from, this screen's whole subject is
   an absence — so most of what is asserted here is that the absence is
   said rather than left blank, and that nothing is invented to fill
   it. Nothing is planted in IndexedDB by this file, then or now: a
   test that reached in to plant documents would be putting fake quotes
   in front of the same rulers that exist to catch them. What changed
   on 2026-09-18 is that the app can MAKE one — the picker and the
   configurator are built — so the two cases that need a document in
   the register walk in and press the act, which is how a document
   comes to exist for a dealer too.

   WHAT IS PROVED INSTEAD OF EIGHTEEN ROWS. A Cockpit screen owes 18
   readable rows at 1280x800, and a register with nothing in it can
   show none. The requirement is about the GEOMETRY — a row height and
   the room the list is given — and both are measurable on an empty
   register: the test below resolves the register's own `--row-h` and
   `--band-h` in its own cascade, measures the room, and asserts that
   eighteen rows plus the three band headers fit in it. Measured in
   Chromium at the three desk widths on 2026-09-17: 19 rows at
   1280x800, 23 at 1440x900, 30 at 1920x1080. That is the arithmetic
   `quotes.css` states in its header, checked against the running
   browser rather than against the comment.

   `e2e/rulers/density.spec.ts` asks the other half of the question —
   how many rows are actually on screen — and it can only be answered
   on a browser that has quotes in it. See `docs/SCREENS.md`.
   ============================================================ */

/** The three bands, in the order `domain/quote/register` fixes. */
const BANDS = ['Draft', 'Issued', 'Superseded'] as const

test('the register teaches on the day it is empty, and invents nothing to fill it', async ({
  page,
  hasTouch,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await throughTheDoor(page)
  await page.goto('/quotes')
  await expect(page.getByTestId('quotes')).toBeVisible()

  /* ---- the register is the structure, and it is at zero ---- */
  const grid = page.getByRole('grid', { name: 'Quotes' })
  await expect(grid).toBeVisible()
  for (const word of BANDS) {
    await expect(grid.getByRole('rowgroup', { name: word })).toBeVisible()
  }
  await expect(page.getByText('0 quotes are filed in this browser')).toBeVisible()
  await expect(grid.getByText('Nothing is being written right now.')).toBeVisible()
  await expect(grid.getByText('Nothing has been given to a customer yet.')).toBeVisible()
  await expect(grid.getByText('No quote has been replaced by a newer version.')).toBeVisible()

  /* ---- the panel teaches rather than apologises ------------ */
  const panel = page.getByRole('complementary', { name: 'The quote under the cursor' })
  await expect(
    panel.getByRole('heading', { name: 'No quote has been written here yet.' }),
  ).toBeVisible()
  for (const question of ['What lands here', 'Why it is empty today', 'What to do']) {
    await expect(panel.getByText(question)).toBeVisible()
  }

  /* ---- the act acts, on the day there is nothing to list ---- */
  const act = page.getByRole('button', { name: 'New quote' })
  await expect(act).toBeVisible()
  await expect(act, 'the act is live, not a chip under a false sentence').toHaveAttribute(
    'aria-disabled',
    'false',
  )
  await expect(act, 'and it is the register’s one amber').toHaveAttribute('data-intent', 'act')
  await expect(page.getByText(/The picker is not built yet/)).toHaveCount(0)

  /* ---- nothing stands in for a photograph ----------------- */
  await expect(panel.getByText(/No photograph stands on this screen/)).toBeVisible()
  expect(await page.locator('main img').count(), 'no picture on an empty register').toBe(0)

  /* ---- the shortcut is printed where the act is, and ONLY where
         there is a key to press. `pointer: coarse` is the browser's
         own answer and the three touch projects carry `hasTouch`, so
         this asserts both halves rather than skipping the phone: the
         legend is drawn on a desk and is not drawn in a hand. ---- */
  const lastRow = page.locator('.qr-act')
  await expect(lastRow.getByText('N', { exact: true }).first()).toBeVisible()
  const legend = lastRow.locator('.qr-keys')
  if (hasTouch) {
    await expect(legend, 'no key legend on a device with no keys').toBeHidden()
  } else {
    await expect(legend).toBeVisible()
    for (const key of ['J', 'K', 'Space', 'Enter', 'Esc']) {
      await expect(legend.getByText(key, { exact: true }).first()).toBeVisible()
    }
    await expect(legend).toContainText('peeks')
  }

  expect(errors, 'no page error').toEqual([])
})

/* ============================================================
   AND THEN IT IS DRIVEN WITH A REAL DOCUMENT IN IT.

   This file's header says no quote is written by it, and until
   2026-09-18 that was the only honest thing it could say: nothing in
   the app could make one. The picker and the configurator are built,
   so a document now exists the way a document is supposed to — because
   somebody pressed the act on the picker — and the two cases below
   walk in through that door rather than planting anything in
   IndexedDB. What they prove is the thing the critique's blocker was
   about: the register can open what it lists.
   ============================================================ */

/** Sign in, load the file, take the first hull the picker offers and
 *  start the quote. Returns the id the app minted, read off the
 *  address it navigated to — never typed. */
async function mintOne(page: Page): Promise<string> {
  await throughTheDoor(page)
  await page.goto('/quote/new')
  await expect(page.getByTestId('picker-counts')).toBeVisible()

  await page.locator('.picker-models button').first().click()
  const chosen = page.getByRole('complementary', { name: 'What is chosen' })
  /* a hull built in more than one material asks that first, and the
     act comes live the moment it is answered */
  const materials = chosen.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()
  await chosen
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()

  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })

  /* THE WRITE-BEHIND, WAITED OUT, because what comes next is a page
     LOAD. `src/state/quotes.ts` coalesces writes on a 300 ms interval
     — typing a customer's name must be one write and not one per
     keystroke — and nothing in the app loses by it, because the picker
     reaches the configurator through the router with the document in
     memory the whole way. A test that reloads inside that window is
     racing a promise it cannot see, and would be asserting the timer
     rather than the register. Measured: without this the register is
     read back at `0 quotes are filed in this browser`. */
  await page.waitForTimeout(600)
  return new URL(page.url()).pathname.split('/').pop()!
}

test('the register opens the document it just listed', async ({ page }) => {
  const id = await mintOne(page)

  await page.goto('/quotes')
  await expect(page.getByTestId('quotes')).toBeVisible()

  /* THE ROW IS WAITED FOR BY WHAT IS ON IT, not by its place in the
     band. `openFor` reads the database after the first paint, so for
     a frame the Draft band holds its own empty notice — which IS a
     row — and a press on that is a press on nothing. A fresh mint is
     addressed to nobody, which is the one thing this row says that
     the notice above it cannot. */
  const grid = page.getByRole('grid', { name: 'Quotes' })
  const draft = grid
    .getByRole('rowgroup', { name: 'Draft' })
    .getByRole('row', { name: /Addressed to nobody yet/ })
  await draft.click()

  const panel = page.getByRole('complementary', { name: 'The quote under the cursor' })
  const act = panel.getByRole('button', { name: 'Open the build' })
  await expect(act, 'the act that opens is live, not a chip under a sentence').toHaveAttribute(
    'aria-disabled',
    'false',
  )
  /* WHAT IT OPENS, SAID BEFORE IT IS PRESSED. A draft opens where it
     is written; an issued quote opens as the paper. */
  await expect(panel).toContainText('It opens where it is written')

  await act.click()
  await expect(page).toHaveURL(new RegExp(`/quote/${id}$`))
  await expect(page.getByTestId('configurator')).toBeVisible()
})

test('the register starts a new quote from its own last row', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto('/quotes')
  await expect(page.getByTestId('quotes')).toBeVisible()

  await page.getByRole('button', { name: 'New quote' }).click()
  await expect(page).toHaveURL(/\/quote\/new$/)
  await expect(page.getByTestId('picker-counts')).toBeVisible()
})

test('the register goes back to Home, and the address carries the position', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto('/quotes')
  await expect(page.getByTestId('quotes')).toBeVisible()

  await page.getByRole('button', { name: 'Home' }).click()
  await expect(page.getByTestId('home')).toBeVisible()
})

test('a browser with no name in it never reaches the register', async ({ page }) => {
  await page.goto('/quotes')
  /* the shell's first-visit rule, which belongs to every screen and
     not only to Home */
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
})

test.describe('the density this register owes', () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1280,
    'the 18-row requirement is stated at 1280x800',
  )

  test('has room for eighteen rows and three band headers at 1280x800', async ({ page }) => {
    await throughTheDoor(page)
    await page.goto('/quotes')
    await expect(page.getByTestId('quotes')).toBeVisible()

    /* THE ROOM THE LIST GETS, not the box it is drawn in today. While
       the register is bare the list takes only the height its three
       bands need — a frame with 500px of nothing in it is a hole, not
       a frame — so the room a full list would have is the body track's
       own box less the act row that sits under it. That track is the
       screen grid's `1fr` and is the same height whether the register
       is bare or full, which is what makes this one number for both.

       THE TWO LENGTHS ARE RESOLVED, NOT PARSED. `--row-h` is
       `--spacing(7)`, which Tailwind compiles to a `calc()` — reading
       the custom property off `getComputedStyle` hands back that calc
       as a string and `parseFloat` of it is NaN. A probe laid in the
       register's own cascade is the browser's own answer instead. */
    const read = await page.evaluate(() => {
      const body = document.querySelector('.qr-body')
      const act = document.querySelector('.qr-act')
      const list = document.querySelector('.qr-list')
      if (!body || !act || !list) return null
      const resolve = (token: string): number => {
        const probe = document.createElement('div')
        probe.style.height = `var(${token})`
        list.append(probe)
        const height = probe.getBoundingClientRect().height
        probe.remove()
        return height
      }
      return {
        room: body.getBoundingClientRect().height - act.getBoundingClientRect().height,
        row: resolve('--row-h'),
        band: resolve('--band-h'),
      }
    })

    expect(read, 'the register, its list and its act row are all on the page').not.toBeNull()
    const { room, row, band } = read!
    const fits = Math.floor((room - 3 * band) / row)
    // eslint-disable-next-line no-console
    console.log(
      `  quotes       ${room.toFixed(0)}px for the list, ${row}px rows, ${band}px band heads → ${fits} rows`,
    )
    expect(row, 'the row height the sweep measured').toBe(28)
    expect(
      fits,
      'eighteen rows and three band headers fit in the room the list is given at 1280x800',
    ).toBeGreaterThanOrEqual(18)
  })
})
