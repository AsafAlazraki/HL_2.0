import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { CUSTOMER, issueIt, startAQuote, written } from '../mint'
import { routes } from '../routes'
import { readDensity } from '../rulers/measure/density'
import { open } from '../shots/recipe'

/* ============================================================
   THE CUSTOMERS, IN A REAL BROWSER, AT EVERY SIZE.

   NOBODY IS PLANTED. Nothing in this file reaches into IndexedDB: the
   one name that arrives on its own arrives the way a real one does —
   somebody typed it at the desk, under "Who it is for" on the build,
   and the quote it was typed on was given to the customer. That walk
   is `e2e/mint.ts`'s, shared with four other screens. Everybody else
   is added by pressing the screen's own act.

   THE PERSON THE DEALER HAS JUST QUOTED IS A CUSTOMER (2026-09-24,
   the M2-close critique's finding 7). The critic gave a quote to
   M. Duffy, pressed Customers, and read "Nobody is filed yet" over
   three paragraphs teaching a second act. The walk below asks the
   browser the same question and wants the person, at once, with
   nothing pressed.

   WHAT THIS FILE ASKS THAT THE RULERS CANNOT. The rulers measure
   contrast, overlap, cut, the type ramp and the row count. They cannot
   see that the paper carries the same lines the A4 will carry, that
   the first keep makes the book and one press unmakes it, or that a
   change on a page reaches the draft it names. Those are here.

   THE DENSITY IS MEASURED ONCE, by `e2e/rulers/density.spec.ts`, on the
   list its route reaches. The case at the bottom of this file reads
   that same measurement to ask the stricter question this screen set
   itself: eighteen with the four desk groups standing.
   ============================================================ */

const BOOK = '/customers'

/* RULE (d), 2026-09-23: WHERE THIS SCREEN CLAIMS TO FIT, IT FITS. `customers.css` claims
   the empty desk and a person's page with one quote on it at every desk width (1280x800,
   1440x900, 1920x1080) — from 2026-09-24 it runs them to the foot of the window, so the
   claim is exactly `scrollHeight === innerHeight` and never a pixel more. Under 1200 the
   page scrolls on purpose and says so in its header. */
const claimsToFit = (width: number | undefined): boolean => (width ?? 0) >= 1200

async function fitsTheWindow(page: Page, what: string): Promise<void> {
  const { scroll, inner, width } = await page.evaluate(async () => {
    await document.fonts.ready
    return {
      scroll: document.scrollingElement!.scrollHeight,
      inner: innerHeight,
      width: innerWidth,
    }
  })
  expect(scroll, `${what} fits the ${width}x${inner} window it is drawn at`).toBeLessThanOrEqual(
    inner,
  )
}

/** Walk the whole sale, so a name exists at the desk, and land on
 *  Customers. It is the recipe's own `raise: 'the sale'` walk, written
 *  here because a flow may press things a ruler may not. */
async function withANameTyped(page: Page): Promise<void> {
  test.setTimeout(120_000)
  await startAQuote(page)
  await issueIt(page)
  await written(page)
  await page.goto(BOOK)
  await expect(page.getByTestId('customers')).toBeVisible()
}

/** Add somebody by hand, through the screen's own form. */
async function addByHand(page: Page, name: string, phone = ''): Promise<void> {
  const form = page.getByRole('form', { name: 'Add a customer' })
  await form.getByLabel('Name', { exact: true }).fill(name)
  if (phone !== '') await form.getByLabel('Phone', { exact: true }).fill(phone)
  await form.getByRole('button', { name: /^Add them$/ }).click()
}

test('a desk where nobody is a customer says where customers come from, and draws no table', async ({
  page,
  viewport,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await throughTheDoor(page)
  await page.goto(BOOK)
  await expect(page.getByTestId('customers')).toBeVisible()

  await expect(
    page.getByRole('heading', { name: 'Everyone you quote appears here.' }),
  ).toBeVisible()
  /* one sentence, not three headed paragraphs teaching a second act (M2-close #7) */
  for (const gone of ['What a customer is here', 'Why it is empty today', 'Nobody is filed yet.']) {
    await expect(page.getByText(gone)).toHaveCount(0)
  }
  expect(await page.getByRole('grid').count(), 'no grid until there is somebody').toBe(0)
  expect(await page.locator('main img').count(), 'no picture on an empty desk').toBe(0)

  /* the act is live and is the screen's one amber — and NOTHING REFUSES BEFORE IT HAS BEEN
     PRESSED (critique-m2 #11) */
  const form = page.getByRole('form', { name: 'Add a customer' })
  const act = form.getByRole('button', { name: /^Add them$/ })
  await expect(act).toBeVisible()
  await expect(act).toHaveAttribute('data-intent', 'act')
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByText('A customer needs a name before they can be added.')).toHaveCount(0)

  /* and the form it adds from is on the first window at a desk */
  if (claimsToFit(viewport?.width)) await fitsTheWindow(page, 'the empty desk')

  /* pressed with no name, it says why WHERE it was pressed, and the caret goes to the Name */
  await act.click()
  await expect(page.getByText('A customer needs a name before they can be added.')).toBeVisible()
  await expect(form.getByLabel('Name', { exact: true })).toBeFocused()

  expect(errors, 'no page error').toEqual([])
})

test('a browser with no name in it never reaches the customers', async ({ page }) => {
  await page.goto(BOOK)
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
})

test('the first person added makes the book, and one press unmakes it', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto(BOOK)
  await expect(page.getByTestId('customers')).toBeVisible()
  await addByHand(page, 'Sarah Jones', '0400 123 456')

  const step = page.getByTestId('last-step')
  await expect(step).toContainText('Sarah Jones is added.')

  /* their page is the resting state, and the plate carries what prints */
  await expect(page.locator('.cu-paper')).toContainText('Sarah Jones')
  await expect(page.locator('.cu-paper')).toContainText('0400 123 456')
  await expect(page.locator('.cu-paper')).toContainText('Prepared for')

  /* ONE STEP BACK, and the book goes with the person */
  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(
    page.getByRole('heading', { name: 'Everyone you quote appears here.' }),
  ).toBeVisible()
  await expect(page.getByTestId('last-step')).toContainText('Put it back')
})

test('the person the dealer has just quoted is a customer at once (M2-close #7)', async ({
  page,
  viewport,
  hasTouch,
}) => {
  await withANameTyped(page)

  /* their page, with nothing pressed and nothing filed */
  const main = page.getByTestId('customers')
  await expect(main).toHaveAttribute('data-mode', 'letter')
  await expect(page.locator('.cu-paper')).toContainText(CUSTOMER)
  await expect(page.locator('.cu-stamp-line').first()).toHaveText(/^1 customer\b/)
  const said = (await main.innerText()).replace(/\s+/g, ' ')
  expect(said, 'the page never calls them nobody, or says filing').not.toMatch(
    /Nobody|\bfiled?\b|typed on a quote|in the book/i,
  )
  await expect(page.getByRole('region', { name: `Quotes for ${CUSTOMER}` })).toContainText('Given')
  if (claimsToFit(viewport?.width)) await fitsTheWindow(page, 'a page with one quote on it')

  /* RULE (b): no keycap where there is no key to press */
  if (hasTouch) {
    expect(await page.locator('main kbd:visible').count(), 'no keycap on a phone').toBe(0)
  }

  /* the first thing their page is given keeps them — one press, with Undo, on the same page */
  await page.getByRole('button', { name: 'Add phone' }).click()
  await page.getByLabel('Phone', { exact: true }).fill('0400 123 456')
  await page.getByRole('button', { name: /^Done/ }).click()
  const step = page.getByTestId('last-step')
  await expect(step).toContainText(`${CUSTOMER}’s phone is 0400 123 456.`)
  await expect(page.locator('.cu-paper')).toContainText('0400 123 456')
  await expect(page.locator('.cu-paper')).toContainText(CUSTOMER)
  /* the sentence the press made stands above the page, and the page still fits under it */
  if (claimsToFit(viewport?.width)) await fitsTheWindow(page, 'a page with the last act said')

  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(step).toContainText('Taken back')
  await expect(page.locator('.cu-paper')).toContainText(CUSTOMER)
  await expect(page.locator('.cu-paper')).not.toContainText('0400 123 456')
})

test('every customer is a door off a page, and the position is in the address', async ({
  page,
  viewport,
}) => {
  await throughTheDoor(page)
  await page.goto(BOOK)
  await addByHand(page, 'Sarah Jones')
  await expect(page.locator('.cu-paper')).toContainText('Sarah Jones')

  await page.getByRole('button', { name: /^Every customer/ }).click()
  await expect(page).toHaveURL(/book=all/)
  const grid = page.getByRole('grid', { name: 'Customers' })
  await expect(grid).toBeVisible()
  await expect(grid.getByRole('row').first()).toContainText('Sarah Jones')

  /* the alphabet is a press, and the address says it was pressed */
  await page.getByRole('button', { name: 'A to Z' }).click()
  await expect(page).toHaveURL(/order=name/)
  await expect(page.getByText('A to Z', { exact: true }).last()).toBeVisible()

  /* RULE (e) AT A DESK (the M2-close critique's finding 6: the book at 1920 ended at 229px of
     1,080). A book of one is its one row and, in the room the rows leave, that person as
     their page begins — the paper their quotes print — with the way onto it. */
  if (claimsToFit(viewport?.width)) {
    const glance = page.getByRole('region', { name: 'Sarah Jones, at a glance' })
    await expect(glance).toBeVisible()
    await expect(glance.locator('.cu-paper')).toContainText('Sarah Jones')
    await fitsTheWindow(page, 'a book of one with its glance')
    await glance.getByRole('button', { name: 'Open their page' }).click()
    await expect(page.getByTestId('customers')).toHaveAttribute('data-mode', 'letter')
  }
})

test('the pill carries Home, and everyone opens on Data by address', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto(BOOK)
  await addByHand(page, 'Sarah Jones')
  await expect(page.locator('.cu-paper')).toContainText('Sarah Jones')

  await expect(page.getByRole('link', { name: /Edit everyone at once/ })).toHaveAttribute(
    'href',
    '/data/__customers',
  )

  /* RULE (a): the screen's own head no longer repeats a door the pill carries
     (critique-m2 #13) — and the pill's Home is the way there */
  const own = page.getByTestId('customers')
  await expect(own.getByRole('button', { name: 'Home', exact: true })).toHaveCount(0)
  await expect(own.getByRole('link', { name: 'Home', exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page.getByTestId('home')).toBeVisible()
})

test('no horizontal scroll, at whatever size this window is', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto(BOOK)
  await expect(page.getByTestId('customers')).toBeVisible()
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(over, 'the page fits the window it is drawn in').toBeLessThanOrEqual(0)
})

/* THE DENSITY THIS BOOK OWES AT REST is measured in one place, `e2e/rulers/density.spec.ts`,
   on the book its route reaches. This file asks the stricter question this screen's builder
   set in `customers.css` — that eighteen still fit with every one of the four desk groups
   standing — and asks it OF THE RULER'S OWN READING, on the same walk, so the two can never
   again disagree about the room. Until 2026-09-23 this case added up its own room on a book
   filed by hand, where the pile of typed names does not stand under the list; the book the
   ruler measures had it — still listing the very name the walk had just filed (critique-m2
   #16) — and a full list there had 131px less: 15 rows, 11 grouped. The same day the pile
   stopped counting a filed person's own name, and the book's act and controls moved above
   the rows, onto the head's line and one bar. The four group heads are not drawn on a book
   of one person, so their height is this screen's own `--group-h`, resolved in the list's
   own cascade. */

test.describe('the density this book owes, grouped', () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1280,
    'the 18-row requirement is stated at 1280x800',
  )

  test('eighteen still fit with the four desk groups standing, by the ruler’s own reading', async ({
    page,
  }) => {
    const route = routes.find((r) => r.name === 'customers-book')!
    await open(page, route)
    const d = await page.evaluate(readDensity, route.density!)
    const group = await page.evaluate(() => {
      const list = document.querySelector('.cu-list')
      if (!list) return 0
      const probe = document.createElement('div')
      probe.style.height = 'var(--group-h)'
      list.append(probe)
      const height = probe.getBoundingClientRect().height
      probe.remove()
      return height
    })
    expect(d.pitch, 'the ruler read its pitch off a real row').not.toBeNull()
    expect(group, 'the group head is this screen’s own token').toBeGreaterThan(0)
    const grouped = Math.floor((d.room - d.heads - 4 * group) / d.pitch!)
    // eslint-disable-next-line no-console
    console.log(
      `  customers      grouped four ways: ${d.room.toFixed(0)}px of room less 4 × ${group}px group heads → holds ${grouped} of 18`,
    )
    expect(
      grouped,
      'eighteen still fit with every one of the four desk groups standing',
    ).toBeGreaterThanOrEqual(18)
  })
})
