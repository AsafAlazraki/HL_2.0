import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   DATA, IN A REAL BROWSER, AT EVERY SIZE — what the five rulers
   cannot see.

   The rulers read contrast, cut, overlap, the type ramp and the row
   count. What they cannot read is whether the figures on this screen
   are the file's own, whether the shelf of makers is the file's seven
   and not a list somebody typed, whether a press reaches the sheet,
   and whether the one write on it can be taken back. That is what is
   below.

   NOTHING IS PLANTED. Every count asserted here is read off the pack
   the blue door loads, and the one table this file makes is made the
   way a dealer makes one — by pressing the act and typing a name —
   and is then undone. No record is written into IndexedDB by hand.
   ============================================================ */

/** What the manifest holds, and therefore what the screen must count:
 *  53 tables · 15,691 rows · 28 of them pairing lists, 25 base tables
 *  of which 7 are boat tables. Asserted rather than read from the
 *  manifest here on purpose — if a repack moves a figure, this file
 *  should say so out loud rather than agree with it silently. */
const TABLES = 53
const ROWS = '15,691'
const JOINS = 28
const MAKERS = 7

/** Sign in, load the file, and stand on the register of tables. */
async function onData(page: Page): Promise<void> {
  await throughTheDoor(page)
  await page.goto('/data')
  /* FIFTEEN SECONDS AND NOT THE DEFAULT FIVE. This screen's route is a
     lazy chunk and its store reads 53 tables back out of IndexedDB
     before it draws a row; on a four-core machine with a second
     builder's browser gate running beside this one, that took longer
     than five seconds twice on 2026-09-23 — which is a measurement
     about the machine, not about the screen. */
  await expect(page.getByTestId('data')).toBeVisible({ timeout: 15_000 })
  /* the screen's own proof that the store has ANSWERED: the same main
     draws "Reading what this browser has kept…" for the first paint */
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible({ timeout: 15_000 })
}

test('the register counts the file it read, and never types a figure', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await onData(page)

  const counts = page.getByTestId('data-counts')
  await expect(counts).toContainText(`${TABLES} tables`)
  await expect(counts).toContainText(`${ROWS} rows`)
  await expect(counts).toContainText(`${JOINS} of them pairing lists`)

  /* THE ONE FINGERPRINT, ONCE, AND ONLY FOR THE FILE IT BELONGS TO.
     There is one file-level sha256 and one `1qz08ne`, not one per
     table (docs/research/refs/critique-m2.md), so it is in the head
     and not in a column. */
  const stamp = page.getByTestId('data-file')
  await expect(stamp).toContainText('Master Price File')
  await expect(stamp).toContainText('1qz08ne')
  expect(
    await page.getByText('1qz08ne').count(),
    'the fingerprint is printed once, in the head',
  ).toBe(1)

  expect(errors, 'no page error').toEqual([])
})

test('the shelf is the file’s own seven makers, and a maker with no mark is set in type', async ({
  page,
}) => {
  await onData(page)

  const plates = page.getByTestId('plate')
  await expect(plates).toHaveCount(MAKERS)

  /* EVERY PLATE NAMES ITS MAKER AND SAYS WHAT IT HOLDS, in the
     table's own noun — 588 variants, 91 models — never "rows". */
  const shelf = page.getByTestId('data-shelf')
  await expect(shelf).toContainText('588 variants in 7 series')
  await expect(shelf).toContainText('91 models in 22 series')
  /* the count lines and not the whole shelf: the workbook sentence a
     plate carries at the showroom width says "rows 4–142", which is
     the file's own words for a range, not this screen calling a boat
     a row */
  for (const line of await shelf.locator('.dt-plate__holds').allTextContents()) {
    expect(line, 'a maker is counted in its own noun').not.toMatch(/\brows?\b/)
  }

  /* STABICRAFT HAS NO MARK — the ledger records "no public wordmark
     verified" — so its name IS the mark, set in type on the same
     paper. Nothing stands in for it. */
  await expect(page.locator('.dt-plate__typed', { hasText: 'Stabicraft' })).toBeVisible()

  /* AND EVERY MARK DRAWN IS A FILE, not a letter in a box: twelve of
     the thirteen brands have one, of which six are boat makers here. */
  const marks = page.locator('.dt-plate__img')
  expect(await marks.count(), 'six of the seven makers have a held mark').toBe(MAKERS - 1)

  /* THE PAIRING CHIPS ARE THE FILE'S OWN JOINS, said in words a dealer
     says. Highfield's five, counted off the manifest by the sweep and
     reproduced by the critic. */
  /* Read by attribute and not by role, because between 640 and 1439 a
     plate draws three of its lines and counts the rest, and a line the
     stylesheet has taken away is not in the accessibility tree. */
  const highfield = page.getByRole('list', { name: 'What pairs with Highfield Inflatables' })
  await expect(highfield.locator('[aria-label="Yamaha Outboards · 2,519 pairings"]')).toHaveCount(1)
  await expect(page.getByText(/\bjoin\b/i)).toHaveCount(0)
})

test('a row says its kind, its count and where it came from, and opens its page', async ({
  page,
}) => {
  await onData(page)

  const grid = page.getByRole('grid', { name: 'Tables' })
  const motors = grid.getByRole('row', { name: /Yamaha Outboards/ })
  await expect(motors).toContainText('Motors')
  await expect(motors).toContainText('209 motors')
  await expect(motors).toContainText('pairs with 6 boats')

  await motors.click()
  const doc = page.getByTestId('data-page')
  await expect(doc).toBeVisible()
  await expect(doc.getByRole('heading', { name: 'Yamaha Outboards' })).toBeVisible()
  /* THE PROVENANCE IS THE WORKBOOK, THE SHEET AND THE ROW RANGE — a
     table has no hash of its own, and inventing one was the critic's
     first correction. */
  await expect(doc).toContainText('Where from')
  await expect(doc).toContainText('Motor Module')
  /* and the file's own hash is here, labelled, once */
  await expect(doc).toContainText('sha256')

  /* A MOTOR'S PAGE LISTS THE BOATS THAT PAIR WITH IT, from its own end
     of the join. */
  await expect(doc.getByText('The boats it pairs with')).toBeVisible()

  /* THE POSITION IS IN THE ADDRESS. */
  await expect(page).toHaveURL(/[?&]at=/)
})

test('the page opens the sheet at the address the sheet owns', async ({ page }) => {
  await onData(page)

  const grid = page.getByRole('grid', { name: 'Tables' })
  await grid.getByRole('row', { name: /NSM Custom Trailers/ }).click()
  const doc = page.getByTestId('data-page')
  const act = doc.getByRole('button', { name: /Open the sheet/ })
  await expect(act, 'the act that opens is live, not a chip under a sentence').toHaveAttribute(
    'aria-disabled',
    'false',
  )
  await expect(doc, 'and it says where it goes before it is pressed').toContainText('/data/')

  await act.click()
  /* THE ADDRESS IS WHAT THIS SCREEN OWES. The sheet at /data/$table is
     another builder's screen in this same round; what this flow can
     honestly assert is that the register hands over the right address
     and that the app does not land on the dead end. */
  await expect(page).toHaveURL(/\/data\/[a-z0-9_]+$/)
  await expect(page.getByTestId('lost')).toHaveCount(0)
})

test('the find field narrows on the four facts a row prints, and says when nothing matches', async ({
  page,
}) => {
  await onData(page)

  const field = page.getByRole('searchbox', { name: 'Find a table' })
  await field.fill('trailer')
  const said = page.locator('#dt-find-said')
  await expect(said).toContainText('tables match')
  const grid = page.getByRole('grid', { name: 'Tables' })
  await expect(grid.getByRole('row', { name: /Dunbier Trailers/ })).toBeVisible()
  await expect(grid.getByRole('row', { name: /Labour Rates/ })).toHaveCount(0)
  await expect(page).toHaveURL(/[?&]find=trailer/)

  await field.fill('zzzz')
  await expect(page.getByText(/Nothing on this sheet is called/)).toBeVisible()
})

test('the one write says what it did and can be taken back, on the screen', async ({ page }) => {
  await onData(page)

  await page.getByRole('button', { name: 'New register' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').first().fill('Boat show leads')
  await dialog.getByRole('button', { name: 'Make it' }).click()

  /* THE SENTENCE THE COMMAND SAID, with its way back pinned beside it
     — the configurator's rail head, never a toast. */
  const step = page.getByTestId('last-step')
  await expect(step).toBeVisible()
  await expect(step).toContainText('Boat show leads')

  /* and the new table is filed at this desk, with the day it was made
     where the others carry a workbook */
  const grid = page.getByRole('grid', { name: 'Tables' })
  await expect(grid.getByRole('row', { name: /Boat show leads/ })).toContainText(
    'Filed at this desk',
  )
  await expect(page.getByTestId('data-counts')).toContainText(`${TABLES + 1} tables`)

  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(grid.getByRole('row', { name: /Boat show leads/ })).toHaveCount(0)
  await expect(page.getByTestId('data-counts')).toContainText(`${TABLES} tables`)
  await expect(step.getByRole('button', { name: 'Put it back' })).toBeVisible()
})

test('the keyboard vocabulary is printed where there are keys to press', async ({
  page,
  hasTouch,
}) => {
  await onData(page)

  const legend = page.locator('.dt-keys')
  if (hasTouch) {
    await expect(legend, 'no key legend on a device with no keys').toBeHidden()
  } else {
    await expect(legend).toBeVisible()
    for (const key of ['J', 'K', 'Space', 'Enter', 'Esc']) {
      await expect(legend.getByText(key, { exact: true }).first()).toBeVisible()
    }
    await expect(legend).toContainText('the makers')

    /* AND IT WORKS. The grid is one tab stop with the whole vocabulary
       on it — the APG `aria-activedescendant` pattern — so the cursor
       moves without a key handler per row. */
    const grid = page.getByRole('grid', { name: 'Tables' })
    await grid.focus()
    await page.keyboard.press('j')
    await page.keyboard.press('Space')
    await expect(page.getByTestId('data-page')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('data-page')).toHaveCount(0)
  }
})

test('a browser with no name in it never reaches the register of tables', async ({ page }) => {
  await page.goto('/data')
  /* the shell's first-visit rule, which belongs to every screen */
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
})

test('a desk with no file open is told so, and offered the door back', async ({ page }) => {
  await throughTheDoor(page, { door: 'blank' })
  await page.goto('/data')
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible()

  await expect(page.getByTestId('data-counts')).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'No price file is open in this browser.' }),
  ).toBeVisible()
  for (const question of ['What lands here', 'Why it is empty today', 'What to do']) {
    await expect(page.getByText(question)).toBeVisible()
  }
  /* NOTHING IS STOOD IN FOR: no plate, no row, no picture. */
  await expect(page.getByTestId('plate')).toHaveCount(0)
  expect(await page.locator('main img').count(), 'no picture on a register with no file').toBe(0)

  await page.getByRole('button', { name: 'Load the Master Price File' }).click()
  await expect(page).toHaveURL(/\/sign-in\?again=true$/)
})

test('the screen goes home, and nothing on it scrolls sideways', async ({ page, viewport }) => {
  await onData(page)

  const over = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(
    over.scroll,
    `nothing runs off the side at ${viewport?.width}x${viewport?.height}`,
  ).toBeLessThanOrEqual(over.client)

  await page.getByRole('button', { name: 'Home' }).click()
  /* fifteen seconds for the same reason `onData` takes them: Home is a
     lazy chunk that reads the whole sheet back before it draws, and
     five is a budget for an idle machine rather than for this one */
  await expect(page.getByTestId('home')).toBeVisible({ timeout: 15_000 })
})

test.describe('the density this register owes', () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1280,
    'the 18-row requirement is stated at 1280x800',
  )

  test('gives its list room for eighteen rows at 1280x800, with the shelf above it', async ({
    page,
  }) => {
    await onData(page)

    /* THE ROOM THE LIST GETS, read the way `e2e/routes.ts` tells the
       density ruler to read it: the body track's own box less the
       legend that stands inside it. The place heads take nothing,
       because on this screen a place is a cell in the margin of its
       run's first row and not a band row of its own.

       THE LENGTH IS RESOLVED, NOT PARSED. `--row-h` is `--spacing(7)`,
       which Tailwind compiles to a `calc()`; reading the custom
       property off `getComputedStyle` hands back that calc as a string
       and `parseFloat` of it is NaN. A probe laid in this screen's own
       cascade is the browser's own answer instead. */
    const read = await page.evaluate(() => {
      const body = document.querySelector('.dt-body')
      const keys = document.querySelector('.dt-keys')
      const list = document.querySelector('.dt-list')
      if (!body || !keys || !list) return null
      const probe = document.createElement('div')
      probe.style.height = 'var(--row-h)'
      list.append(probe)
      const row = probe.getBoundingClientRect().height
      probe.remove()
      return {
        room: body.getBoundingClientRect().height - keys.getBoundingClientRect().height,
        row,
        rows: document.querySelectorAll('.dt-row').length,
        scrolls: list.scrollHeight - list.clientHeight,
      }
    })

    expect(read, 'the screen, its ledger and its legend are all on the page').not.toBeNull()
    const { room, row, rows, scrolls } = read!
    const fits = Math.floor(room / row)
    // eslint-disable-next-line no-console
    console.log(
      `  data         ${room.toFixed(0)}px for the list, ${row}px rows → ${fits} rows; ${rows} on this file, ${scrolls}px to scroll`,
    )
    expect(row, 'the row is the token’s own height').toBeGreaterThan(0)
    expect(fits, 'a Cockpit screen owes 18 rows at 1280x800').toBeGreaterThanOrEqual(18)
    /* AND ON THIS FILE EVERY ONE OF THEM IS DRAWN AT ONCE. 25 base
       tables less the 7 that are plates is 18 rows exactly, so the
       ledger holding them with nothing to scroll is a fact about this
       screen and not a coincidence worth leaving unmeasured. */
    expect(rows, 'the eighteen registers on this file are all rows').toBe(18)
    expect(scrolls, 'and none of them is behind a scroll').toBe(0)
  })
})
