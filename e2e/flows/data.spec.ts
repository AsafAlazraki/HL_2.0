import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor, withoutTheFile } from '../door'

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
     plate draws what pairs with it as one line of ink and its named lines
     are taken away, and a list the stylesheet has taken away is not in the
     accessibility tree. */
  const highfield = page.locator('ul[aria-label="What pairs with Highfield Inflatables"]')
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
  /* AND IT SAYS WHAT THE PRESS WILL OPEN, in the dealer's words and never
     as an address (rule (c), 2026-09-23): "/data/trl_nsmcustom" is the
     router's word for what the sentence now says. */
  await expect(doc, 'it says what opens before it is pressed').toContainText(
    'On the sheet, all 73 trailers can be read and changed.',
  )
  await expect(doc).not.toContainText('/data/')

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

  /* the register it made opens as its own spread, and back at the
     tables it is a row filed at this desk, with the day it was made
     where the others carry a workbook */
  const spread = page.getByTestId('data-page')
  await expect(spread.getByRole('heading', { name: 'Boat show leads' })).toBeVisible()
  await spread.getByRole('button', { name: /Back to the tables/ }).click()
  const grid = page.getByRole('grid', { name: 'Tables' })
  await expect(grid.getByRole('row', { name: /Boat show leads/ })).toContainText(
    'Filed at this desk',
  )
  /* THE FILE DID NOT GROW (critique of Milestone 2's close, blocker 2):
     the head counts the price file under its fingerprint, and the table
     made here is the row filed at this desk above */
  await expect(page.getByTestId('data-counts')).toContainText(`${TABLES} tables`)
  await expect(page.getByTestId('data-counts')).toContainText(`${ROWS} rows`)

  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(grid.getByRole('row', { name: /Boat show leads/ })).toHaveCount(0)
  await expect(page.getByTestId('data-counts')).toContainText(`${TABLES} tables`)
  await expect(step.getByRole('button', { name: 'Put it back' })).toBeVisible()
})

/* NO KEYCAP AT ANY SIZE, AND NO LETTER IS A SHORTCUT (m2-last-critique.md major 7,
   2026-09-25): twenty-five caps taught J, K, N and the slash at a desk. One sentence a finger
   and a mouse share says how to open a table; the keys every list has still work. */
test('prints no keycap at any size, and the keys every list has still work', async ({
  page,
  hasTouch,
}) => {
  await onData(page)

  await expect(page.locator('.dt-touchsay')).toBeVisible()
  const caps = await page
    .locator('main kbd')
    .evaluateAll((all) => all.filter((k) => (k as HTMLElement).offsetParent !== null).length)
  expect(caps, 'no keycap is drawn').toBe(0)
  if (!hasTouch) {
    /* AND THEY WORK. The grid is one tab stop — the APG `aria-activedescendant`
       pattern — so the cursor moves without a key handler per row; a letter does nothing */
    const grid = page.getByRole('grid', { name: 'Tables' })
    await grid.focus()
    await page.keyboard.press('n')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.keyboard.press('ArrowDown')
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

/* A BROWSER THAT HOLDS NO COPY OF THE FILE — read once and not kept, or let go. Walked to by
   losing the copy since 2026-09-25, when Entry's second door (a business with no file) went. */
test('a desk with no file open is told so, and offered the door back', async ({ page }) => {
  await withoutTheFile(page)
  await page.goto('/data')
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible()

  await expect(page.getByTestId('data-counts')).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'No price file is open in this browser.' }),
  ).toBeVisible()
  for (const question of ['What lands here', 'Why it is empty today', 'What to do']) {
    await expect(page.getByText(question)).toBeVisible()
  }
  /* why it is empty is said as Northside's own state, never a door nobody has any more, and
     no business is said to be unnamed */
  await expect(page.getByText(/this browser holds no copy of it/)).toBeVisible()
  await expect(page.getByTestId('data')).not.toContainText(/blank door|not been named/)
  /* NOTHING IS STOOD IN FOR: no plate, no row, no picture. */
  await expect(page.getByTestId('plate')).toHaveCount(0)
  expect(await page.locator('main img').count(), 'no picture on a register with no file').toBe(0)

  await page.getByRole('button', { name: 'Load the Master Price File' }).click()
  await expect(page).toHaveURL(/\/sign-in\?again=true$/)
})

test('the pill goes home and the head does not repeat it, and nothing scrolls sideways', async ({
  page,
  viewport,
}) => {
  await onData(page)

  const over = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(
    over.scroll,
    `nothing runs off the side at ${viewport?.width}x${viewport?.height}`,
  ).toBeLessThanOrEqual(over.client)

  /* RULE (a): THE PILL CARRIES THE DOORS. The head's own Home was the
     third way back in one window (critique #13). */
  await expect(page.locator('.dt-head').getByRole('button', { name: 'Home' })).toHaveCount(0)
  await expect(page.locator('.dt-head').getByRole('link', { name: 'Home' })).toHaveCount(0)
  await page.getByRole('navigation').getByRole('link', { name: /^Home/ }).click()
  /* fifteen seconds for the same reason `onData` takes them: Home is a
     lazy chunk that reads the whole sheet back before it draws, and
     five is a budget for an idle machine rather than for this one */
  await expect(page.getByTestId('home')).toBeVisible({ timeout: 15_000 })
})

test('a maker opens as its own spread where the ledger was, and closes back to it', async ({
  page,
}) => {
  await onData(page)

  const highfield = page.getByRole('button', { name: /^Highfield Inflatables · / })
  await highfield.click()
  const spread = page.getByTestId('data-page')
  await expect(spread).toBeVisible()
  await expect(highfield).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL(/[?&]at=boat_highfield/)

  /* NOT A COLUMN BESIDE THE ROWS (critique #6): the ledger steps away and
     the spread takes the whole measure the ledger had. */
  await expect(page.getByRole('grid', { name: 'Tables' })).toHaveCount(0)
  const widths = await page.evaluate(() => ({
    spread: document.querySelector('.dt-spread')!.getBoundingClientRect().width,
    shelf: document.querySelector('.dt-plates__list')!.getBoundingClientRect().width,
  }))
  expect(
    Math.abs(widths.spread - widths.shelf),
    'the spread is as wide as the shelf above it',
  ).toBeLessThanOrEqual(1)

  /* ITS OWN MARK, LARGE, on its own paper — the showpiece */
  await expect(spread.locator('.dt-cover__img')).toBeVisible()
  /* its lineup, the file's own seven series, adding back to 588 */
  const counts = await spread.locator('.dt-bar__n').allTextContents()
  expect(counts).toHaveLength(7)
  expect(counts.reduce((n, c) => n + Number(c.replace(/,/g, '')), 0)).toBe(588)
  /* what pairs with it, five tiles, each a door to that pairing list */
  await expect(spread.getByRole('button', { name: /opens that pairing list/ })).toHaveCount(5)
  await expect(spread.getByRole('button', { name: /Open the sheet/ })).toHaveAttribute(
    'data-intent',
    'act',
  )

  await spread.getByRole('button', { name: /Back to the tables/ }).click()
  await expect(spread).toHaveCount(0)
  await expect(page.getByRole('grid', { name: 'Tables' })).toBeVisible()
})

test('the find field’s own words fit the field', async ({ page, viewport }) => {
  await onData(page)
  /* critique #19: at 390 the placeholder read "…the workbook it came fro".
     The words are measured in the field's own face against the room its
     padding leaves. */
  const fit = await page.evaluate(() => {
    const field = document.querySelector<HTMLInputElement>('#dt-find-field')!
    const cs = getComputedStyle(field)
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    return {
      text: ctx.measureText(field.placeholder).width,
      room: field.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
    }
  })
  expect(
    fit.text,
    `the placeholder fits its field at ${viewport?.width}x${viewport?.height}`,
  ).toBeLessThanOrEqual(fit.room)
})

test.describe('the window it is drawn at', () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 1200,
    'under 1200 the page is the scrollport, on purpose (data.css, the ladder)',
  )

  test('fits the window at rest and with a maker open — rule (d)', async ({ page, viewport }) => {
    await onData(page)
    const height = () =>
      page.evaluate(() => ({
        scroll: document.scrollingElement!.scrollHeight,
        inner: window.innerHeight,
      }))
    const rest = await height()
    expect(rest.scroll, `at rest, ${viewport?.width}x${viewport?.height}`).toBeLessThanOrEqual(
      rest.inner,
    )
    await page.getByRole('button', { name: /^Stacer · / }).click()
    await expect(page.getByTestId('data-page')).toBeVisible()
    const opened = await height()
    expect(opened.scroll, `opened, ${viewport?.width}x${viewport?.height}`).toBeLessThanOrEqual(
      opened.inner,
    )
    /* and the spread holds its whole self in the room it is given, rather
       than a scrollbar's worth of it */
    const spilled = await page.evaluate(() => {
      const s = document.querySelector('.dt-spread')!
      return s.scrollHeight - s.clientHeight
    })
    expect(spilled, 'the spread fits the room under the shelf').toBeLessThanOrEqual(1)
  })
})

/* THE DENSITY THIS REGISTER OWES is measured in one place, `e2e/rulers/density.spec.ts`.
   Until 2026-09-23 this file added up its own room — the body track less the legend, over
   `--row-h` — while the ruler read the same screen as passing, because it counted the two
   rows under the list's own scrollport as readable. Two arithmetics for one requirement gave
   two answers about one tree; there is one now, and this file keeps only the count below,
   which is a fact about the file rather than about the room. */

test.describe('every register the file carries is a row', () => {
  test.skip(({ viewport }) => viewport?.width !== 1280, 'a count of the file, read once')

  test('the ledger draws the eighteen registers that are not plates', async ({ page }) => {
    await onData(page)
    /* 25 base tables less the 7 that are plates is 18 rows exactly — every one of them in
       the ledger, whether or not the room shows them all at once. */
    await expect(page.locator('.dt-row')).toHaveCount(18)
  })
})
