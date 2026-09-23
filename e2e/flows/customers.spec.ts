import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { CUSTOMER, issueIt, startAQuote, written } from '../mint'

/* ============================================================
   THE BOOK, IN A REAL BROWSER, AT EVERY SIZE.

   NOBODY IS PLANTED. The register `/customers` draws does not exist in
   a fresh browser, and nothing in this file reaches into IndexedDB to
   make it: every person below is filed by walking in and pressing the
   screen's own act, and the one name that arrives on its own arrives
   the way a real one does — somebody typed it at the desk, under "Who
   it is for" on the build, and the quote it was typed on was given to
   the customer. That walk is `e2e/mint.ts`'s, shared with four other
   screens.

   WHAT THIS FILE ASKS THAT THE RULERS CANNOT. The rulers measure
   contrast, overlap, cut, the type ramp and the row count. They cannot
   see that the paper carries the same lines the A4 will carry, that
   the yard's note is on neither, that the first filing makes the table
   and one press unmakes it, or that filing a name off a draft
   addresses that draft. Those are here.

   THE DENSITY HALF IS SPLIT, the register's way: `e2e/rulers/
   density.spec.ts` counts the rows that are actually on screen, and
   the case at the bottom of this file measures the GEOMETRY — the room
   the list is given and this screen's own `--row-h` — which is
   answerable at every desk width and is the arithmetic `customers.css`
   states in its header.
   ============================================================ */

const BOOK = '/customers'

/** Walk the whole sale, so a name exists at the desk, and land on the
 *  book. It is the recipe's own `raise: 'the sale'` walk, written here
 *  because a flow may press things a ruler may not. */
async function withANameTyped(page: Page): Promise<void> {
  test.setTimeout(120_000)
  await startAQuote(page)
  await issueIt(page)
  await written(page)
  await page.goto(BOOK)
  await expect(page.getByTestId('customers')).toBeVisible()
}

test('the book teaches on the day it does not exist, and draws no empty table', async ({
  page,
  hasTouch,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await throughTheDoor(page)
  await page.goto(BOOK)
  await expect(page.getByTestId('customers')).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Nobody is filed yet.' })).toBeVisible()
  for (const question of ['What a customer is here', 'Why it is empty today', 'What to do']) {
    await expect(page.getByText(question)).toBeVisible()
  }

  /* THE HONEST ABSENCE: not a table with no rows in it. */
  expect(await page.getByRole('grid').count(), 'no grid until there is a book').toBe(0)
  await expect(
    page.getByText(/Made as a table on the Master Price File sheet the day the first person/),
  ).toBeVisible()

  /* nothing stands in for a photograph */
  expect(await page.locator('main img').count(), 'no picture on an empty book').toBe(0)
  await expect(page.getByText(/No photograph stands on this screen/)).toBeVisible()

  /* the act is live and is the screen's one amber */
  const act = page.getByRole('button', { name: /^File the first customer$/ })
  await expect(act).toBeVisible()
  await expect(act).toHaveAttribute('data-intent', 'act')

  /* the shortcut is printed where there is a key to press, and not
     where there is not — the register's rule, both halves asserted */
  const legend = page.locator('.cu-keys').first()
  if (hasTouch) {
    await expect(legend, 'no key legend on a device with no keys').toBeHidden()
  } else if ((await legend.count()) > 0) {
    await expect(legend).toBeVisible()
  }

  expect(errors, 'no page error').toEqual([])
})

test('a browser with no name in it never reaches the book', async ({ page }) => {
  await page.goto(BOOK)
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
})

test('the first filing makes the table, and one press unmakes it', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto(BOOK)
  await expect(page.getByTestId('customers')).toBeVisible()

  const form = page.getByRole('form', { name: 'File the first customer' })
  await form.getByLabel('Name', { exact: true }).fill('Sarah Jones')
  await form.getByLabel('Phone', { exact: true }).fill('0400 123 456')
  await form.getByRole('button', { name: /^File the first customer$/ }).click()

  const step = page.getByTestId('last-step')
  await expect(step).toContainText('Sarah Jones is filed, and the book was made to hold them.')

  /* the letter is the resting state, and the plate carries what prints */
  await expect(page.locator('.cu-paper')).toContainText('Sarah Jones')
  await expect(page.locator('.cu-paper')).toContainText('0400 123 456')
  await expect(page.locator('.cu-paper')).toContainText('Prepared for')

  /* ONE STEP BACK, and the table goes with the row */
  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('heading', { name: 'Nobody is filed yet.' })).toBeVisible()
  await expect(page.getByTestId('last-step')).toContainText('Put it back')
})

test('a name typed at the desk is filed from here, and the register is born', async ({ page }) => {
  await withANameTyped(page)

  const pile = page.getByRole('region', { name: 'Names typed on quotes, not filed' })
  await expect(pile).toContainText(CUSTOMER)
  /* the quote was GIVEN, so it keeps the name it was given — said
     where the press is, rather than found out after pressing */
  await expect(pile).toContainText(/A given quote keeps what it was given/)

  await pile
    .getByRole('button', { name: new RegExp(`^File ${CUSTOMER.replace('.', '\\.')}`) })
    .click()

  await expect(page.locator('.cu-paper')).toContainText(CUSTOMER)
  await expect(page.getByTestId('customers')).toHaveAttribute('data-mode', 'letter')
  await expect(page.getByText(/1 person in the book/i)).toBeVisible()
})

test('the book is a door off the letter, and the position is in the address', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto(BOOK)
  const form = page.getByRole('form', { name: 'File the first customer' })
  await form.getByLabel('Name', { exact: true }).fill('Sarah Jones')
  await form.getByRole('button', { name: /^File the first customer$/ }).click()
  await expect(page.locator('.cu-paper')).toContainText('Sarah Jones')

  await page.getByRole('button', { name: /^Everyone in the book/ }).click()
  await expect(page).toHaveURL(/book=all/)
  const grid = page.getByRole('grid', { name: 'Customers' })
  await expect(grid).toBeVisible()
  await expect(grid.getByRole('row').first()).toContainText('Sarah Jones')

  /* the alphabet is a press, and the address says it was pressed */
  await page.getByRole('button', { name: 'A to Z' }).click()
  await expect(page).toHaveURL(/order=name/)
  await expect(page.getByText('A to Z', { exact: true }).last()).toBeVisible()
})

test('the letter goes home, and the book opens as a sheet by address', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto(BOOK)
  const form = page.getByRole('form', { name: 'File the first customer' })
  await form.getByLabel('Name', { exact: true }).fill('Sarah Jones')
  await form.getByRole('button', { name: /^File the first customer$/ }).click()
  await expect(page.locator('.cu-paper')).toContainText('Sarah Jones')

  await expect(page.getByRole('link', { name: /Open the book as a sheet/ })).toHaveAttribute(
    'href',
    '/data/__customers',
  )

  await page.getByRole('button', { name: 'Home' }).click()
  await expect(page.getByTestId('home')).toBeVisible()
})

test('no horizontal scroll, at whatever size this window is', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto(BOOK)
  await expect(page.getByTestId('customers')).toBeVisible()
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(over, 'the letter fits the window it is drawn in').toBeLessThanOrEqual(0)
})

test.describe('the density this book owes', () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1280,
    'the 18-row requirement is stated at 1280x800',
  )

  test('has room for eighteen rows at 1280x800', async ({ page }) => {
    await throughTheDoor(page)
    await page.goto(`${BOOK}?book=all`)
    await expect(page.getByTestId('customers')).toBeVisible()

    const form = page.getByRole('form', { name: 'File the first customer' })
    await form.getByLabel('Name', { exact: true }).fill('Sarah Jones')
    await form.getByRole('button', { name: /^File the first customer$/ }).click()
    /* A PERSON FILED BY HAND IS OPENED, which is the screen's own rule
       and the reason the book is a door back rather than the state the
       filing leaves you in. The ruler reaches the book the other way —
       from the pile, which files without leaving the list. */
    await expect(page.locator('.cu-paper')).toContainText('Sarah Jones')
    await page.getByRole('button', { name: /^Everyone in the book/ }).click()
    const grid = page.getByRole('grid', { name: 'Customers' })
    await expect(grid).toBeVisible()

    /* THE ROOM THE LIST GETS, not the box it is drawn in today — the
       register's own finding: a bare list takes the height of what is
       in it, and the body track is the same height either way. The two
       lengths are RESOLVED by a probe laid in this screen's cascade,
       because `--spacing(7)` compiles to a calc that `parseFloat`
       reads as NaN. */
    const read = await page.evaluate(() => {
      const body = document.querySelector('.cu-body')
      const act = document.querySelector('.cu-act')
      const list = document.querySelector('.cu-list')
      if (!body || !act || !list) return null
      const resolve = (token: string): number => {
        const probe = document.createElement('div')
        probe.style.height = `var(${token})`
        list.append(probe)
        const height = probe.getBoundingClientRect().height
        probe.remove()
        return height
      }
      const row = document.querySelector('.cu-row')
      return {
        room: body.getBoundingClientRect().height - act.getBoundingClientRect().height,
        row: resolve('--row-h'),
        group: resolve('--group-h'),
        drawn: row ? row.getBoundingClientRect().height : 0,
      }
    })

    expect(read, 'the book, its list and its act row are all on the page').not.toBeNull()
    const { room, row, group, drawn } = read!
    const fits = Math.floor(room / row)
    const grouped = Math.floor((room - 4 * group) / row)
    // eslint-disable-next-line no-console
    console.log(
      `  customers    ${room.toFixed(0)}px for the list, ${row}px rows, ${group}px group heads → ` +
        `${fits} rows ungrouped, ${grouped} cut four ways`,
    )
    expect(row, 'the row height the register measured and this screen kept').toBe(28)
    expect(drawn, 'the drawn row is the token, so the arithmetic is about the real row').toBe(row)
    expect(
      fits,
      'eighteen rows fit in the room the list is given at 1280x800',
    ).toBeGreaterThanOrEqual(18)
    expect(
      grouped,
      'and eighteen still fit with every one of the four desk groups standing',
    ).toBeGreaterThanOrEqual(18)
  })
})
