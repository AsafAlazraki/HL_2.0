import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { pickAndStart, startAQuote, tables } from '../mint'
import { openingOnASeparator, setNames, startInANamedColour } from '../lines'

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

   THE EIGHTEEN ROWS ARE NOT ASKED HERE. A Cockpit screen owes 18
   readable rows at 1280x800, and the one reading of that is
   `e2e/rulers/density.spec.ts`, which reaches this register with a
   document the walk minted and asks the layout how many rows a full
   list would show. This file asks what the ruler cannot: that the
   absence is said, that nothing is invented, and that a press lands.
   ============================================================ */

/** A row's reference, as the row prints it. */
const referenceOf = async (row: Locator): Promise<string> =>
  (await row.locator('.qr-cell--ref').innerText()).trim()

/** The three bands, in the order `domain/quote/register` fixes. */
const BANDS = ['Draft', 'Given', 'Replaced'] as const

test('the register teaches on the day it is empty, and invents nothing to fill it', async ({
  page,
  viewport,
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
  /* each band at 0, its head alone: the count is said on the band's head and nowhere else on
     the screen — no dash under it saying it again (the refine round's second pass), and the
     pill counts the quotes, so the page's head does not (docs/WORDS.md) */
  for (const word of BANDS) {
    const band = grid.getByRole('rowgroup', { name: word })
    await expect(band.getByRole('row')).toHaveCount(1)
    await expect(band).toContainText('0')
    await expect(band).not.toContainText('—')
  }
  await expect(page.getByText(/filed in this browser/)).toHaveCount(0)
  await expect(page.getByText(/\bIssued\b|\bSuperseded\b/)).toHaveCount(0)

  /* ---- the panel says what is true and what to do, once ---- */
  const panel = page.getByRole('complementary', { name: 'The quote you are on' })
  await expect(panel.getByRole('heading', { name: 'No quotes yet' })).toBeVisible()
  await expect(panel.getByText(/Quotes stay on this computer/)).toBeVisible()
  await expect(panel.getByText(/A quote is a draft until it is given/)).toBeVisible()

  /* ---- the act acts, on the day there is nothing to list ---- */
  const act = page.getByRole('button', { name: 'New quote' })
  await expect(act).toBeVisible()
  await expect(act, 'the act is live, not a chip under a false sentence').toHaveAttribute(
    'aria-disabled',
    'false',
  )
  await expect(act, 'and it is the register’s one amber').toHaveAttribute('data-intent', 'act')
  await expect(page.getByText(/The picker is not built yet/)).toHaveCount(0)

  /* ---- nothing stands in for a photograph, and the panel does not explain itself to a
         critic (M2-close minor 17) ---- */
  await expect(panel.getByText(/A row will read like this/i)).toHaveCount(0)

  /* ---- and at a desk the room under the bands offers where a quote starts: every boat
         maker the file carries, as a door into the picker on that maker (the M2-close
         critique's finding 6, rule (e)). A maker's mark is not a picture of a boat, and it
         is the only picture drawn. ---- */
  if ((viewport?.width ?? 0) >= 1200) {
    const doors = page.getByRole('region', { name: 'Start the first quote with a maker' })
    await expect(doors).toBeVisible()
    const makers = tables.filter((t) => t.kind === 'boat')
    await expect(doors.getByRole('button', { name: /^Start a quote on a .+ boat$/ })).toHaveCount(
      makers.length,
    )
    await doors.getByRole('button', { name: `Start a quote on a ${makers[0]!.name} boat` }).click()
    await expect(page).toHaveURL(new RegExp(`/quote/new\\?brand=${makers[0]!.id}$`))
    await page.goBack()
    await expect(page.getByTestId('quotes')).toBeVisible()
  }
  expect(
    await page.locator('main img:not(.qr-maker__mark)').count(),
    'no picture of a boat on an empty register',
  ).toBe(0)

  /* ---- no keycap, on a desk or in a hand (m2-last-critique.md major 7,
         2026-09-25): the legend of J K Space Enter Esc and the N on the act
         taught single-letter keys WCAG 2.1.4 asks to be switchable ---- */
  const caps = await page
    .locator('main kbd')
    .evaluateAll((all) => all.filter((k) => (k as HTMLElement).offsetParent !== null).length)
  expect(caps, 'no keycap is drawn').toBe(0)

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
  /* THE ONE WALK, `e2e/mint.ts`, rather than a second copy of it here:
     until 2026-09-23 this file pressed the picker's first model button by
     its class, and at 390x844 that button was never visible — measured,
     a 30-second wait. `startAQuote` finds its model by name, the way a
     person does, and is the walk every ruler already takes. */
  await startAQuote(page)

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
     row — and a press on that is a press on nothing. A real row carries
     its reference, which the notice above it cannot. */
  const grid = page.getByRole('grid', { name: 'Quotes' })
  const draft = grid
    .getByRole('rowgroup', { name: 'Draft' })
    .getByRole('row', { name: /\d{8}-\d{2}/ })
  await draft.click()

  const panel = page.getByRole('complementary', { name: 'The quote you are on' })
  const act = panel.getByRole('button', { name: 'Open the build' })
  await expect(act, 'the act that opens is live, not a chip under a sentence').toHaveAttribute(
    'aria-disabled',
    'false',
  )
  /* WHAT IT OPENS, SAID BEFORE IT IS PRESSED, by the act's own name: a draft opens in the
     build, a given quote as the printed quote. Said once — no sentence under it repeats it. */
  await expect(panel).not.toContainText('It opens where it is written')

  /* AND THE PEEK'S LAST ACT IS WHOLE, inside the panel's foot (the refine round, 2026-10-21:
     at 1280 × 800 "Make a new version" stood half under the panel's bottom edge, y 788 of 787) */
  const last = panel.locator('.qr-acts button').last()
  await expect(last).toBeVisible()
  const edge = await page.evaluate(() => {
    const plate = document.querySelector('.qr-panel')!.getBoundingClientRect()
    const acts = [...document.querySelectorAll('.qr-acts button')]
    const foot = acts[acts.length - 1]!.getBoundingClientRect()
    return { plate: plate.bottom, act: foot.bottom, window: window.innerHeight }
  })
  if (await page.evaluate(() => innerWidth >= 1200))
    expect(edge.act, 'the last act stands inside the panel').toBeLessThanOrEqual(edge.plate)

  /* AND THE MISSING NAME IS SAID ONCE, in the refusal (the refine round, 2026-10-21): it stood
     on the row as "Addressed to nob…", on the peek's own line and in the refusal. The row says
     only the boat, and the boat is drawn whole in the room the name would have taken. */
  await expect(draft.locator('.qr-customer')).toHaveCount(0)
  await expect(panel.getByText(/No customer’s name is on this quote/)).toHaveCount(1)
  await expect(panel).not.toContainText('No name yet')
  expect(
    await draft.locator('.qr-boat').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    'the boat is drawn whole',
  ).toBe(true)

  await act.click()
  await expect(page).toHaveURL(new RegExp(`/quote/${id}$`))
  await expect(page.getByTestId('configurator')).toBeVisible()
})

test('the peek never opens a line of the boat on its separator, and breaks between its parts first', async ({
  page,
}) => {
  /* m2-last-critique.md, minor 8: at 1440 the peek read "…Black / Grey /"
     over "/ Black". Read back as the browser set it, at this size. */
  await throughTheDoor(page)
  await startInANamedColour(page, 'boat_highfield', 'ADV7')
  await page.waitForTimeout(600)
  await page.goto('/quotes')
  await expect(page.getByTestId('quotes')).toBeVisible()
  await page
    .getByRole('grid', { name: 'Quotes' })
    .getByRole('rowgroup', { name: 'Draft' })
    .getByRole('row', { name: /\d{8}-\d{2}/ })
    .click()

  const panel = page.getByRole('complementary', { name: 'The quote you are on' })
  await expect(panel.locator('.qr-peek__boat')).toBeVisible()
  const [name] = await setNames(panel.locator('.qr-peek__boat'), '.qr-peek__joint')
  expect(name.parts.length, 'the boat, its material and its colourway').toBeGreaterThan(2)
  expect(openingOnASeparator(name.lines), name.lines.join(' ⏎ ')).toEqual([])
  for (const part of name.parts)
    expect(part.lines === 1 || part.full, `"${part.text}" broke inside itself`).toBe(true)
})

test('the register starts a new quote from its own last row', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto('/quotes')
  await expect(page.getByTestId('quotes')).toBeVisible()

  await page.getByRole('button', { name: 'New quote' }).click()
  await expect(page).toHaveURL(/\/quote\/new$/)
  await expect(page.getByTestId('picker-counts')).toBeVisible()
})

test('the pill goes home, and the register’s head does not repeat it', async ({ page }) => {
  await throughTheDoor(page)
  await page.goto('/quotes')
  await expect(page.getByTestId('quotes')).toBeVisible()

  /* RULE (a): THE PILL CARRIES THE DOORS. The register's own Home was
     "the one duplication this shell leaves standing" until 2026-09-23. */
  await expect(page.locator('.qr-head').getByRole('button', { name: 'Home' })).toHaveCount(0)
  await expect(page.locator('.qr-head').getByRole('link', { name: 'Home' })).toHaveCount(0)
  await page.getByRole('navigation').getByRole('link', { name: /^Home/ }).click()
  await expect(page.getByTestId('home')).toBeVisible({ timeout: 15_000 })
})

test.describe('the window it is drawn at', () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 1200,
    'under 1200 the page is the scrollport, on purpose (quotes.css, the ladder)',
  )

  test('fits the window, and with one quote on it shows no floor under the register', async ({
    page,
    viewport,
  }) => {
    const at = `${viewport?.width}x${viewport?.height}`
    /* THE SPORT 560, because the heroes ledger holds a photograph of it
       (the hero tier of `data/northside/pictures.json`), and the room under the rows
       shows the boat on the newest quote only when its exact model is held */
    await throughTheDoor(page)
    const id = await pickAndStart(page, 'boat_highfield', 'SP560')
    /* the write-behind, waited out before a page load (see mintOne) */
    await page.waitForTimeout(900)
    await page.goto('/quotes')
    await expect(page.locator('[data-testid="quotes"][data-read]')).toBeVisible()
    await expect(
      page.getByRole('grid', { name: 'Quotes' }).getByRole('row', { name: /\d{8}-\d{2}/ }),
    ).toBeVisible()

    /* RULE (d): 800 in 800, 900 in 900, 1080 in 1080 */
    const fit = await page.evaluate(() => ({
      scroll: document.scrollingElement!.scrollHeight,
      inner: window.innerHeight,
    }))
    expect(fit.scroll, `the register fits the window at ${at}`).toBeLessThanOrEqual(fit.inner)

    /* RULE (e), critique #17: with one row, the register is a page that
       runs to the foot of the body, and the panel beside it runs to the
       same foot — no dark floor under either */
    const feet = await page.evaluate(() => ({
      body: document.querySelector('.qr-body')!.getBoundingClientRect().bottom,
      ledger: document.querySelector('.qr-ledger')!.getBoundingClientRect().bottom,
      panel: document.querySelector('.qr-panel')!.getBoundingClientRect().bottom,
    }))
    expect(
      Math.abs(feet.ledger - feet.body),
      `the register reaches the foot at ${at}`,
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(feet.panel - feet.body),
      `the panel reaches the foot at ${at}`,
    ).toBeLessThanOrEqual(1)

    /* and the room under the rows shows the boat on that quote — the walk
       starts the deepest model on the file, whose photograph the heroes
       ledger holds — captioned as the hull, never as the rig */
    const shown = page.getByRole('button', { name: /on the water: \d{8}-\d{2}$/ })
    await expect(shown).toBeVisible()
    await expect(shown.locator('img')).toBeVisible()
    await shown.click()
    const panel = page.getByRole('complementary', { name: 'The quote you are on' })
    await expect(panel.getByRole('button', { name: 'Open the build' })).toBeVisible()
    await expect(page).toHaveURL(/[?&]at=/)
    expect(id).toBeTruthy()
  })

  test('with one quote whose boat is not photographed, the room holds its cover and the panel says what it is for', async ({
    page,
    viewport,
  }) => {
    test.setTimeout(120_000)
    const at = `${viewport?.width}x${viewport?.height}`
    /* THE STACER 589 REBEL, because the file names no picture for it and no picture of it
       is held (the 539 Rebel was this boat until a person attached its render, 2026-10-20):
       the ladder's third rung, the maker's own mark (`src/screens/quotes/cover.ts`).
       The M2-close critique measured this state as an empty bordered frame about
       690px tall beside a panel whose middle 500px was empty, at 1920; the second
       components critique then found the tiles that filled that middle repeating the
       band heads' counts and sums (finding 10). */
    await throughTheDoor(page)
    await pickAndStart(page, 'boat_stacer', '589 Rebel')
    await page.waitForTimeout(900)
    await page.goto('/quotes')
    await expect(page.locator('[data-testid="quotes"][data-read]')).toBeVisible()

    const cover = page.getByRole('button', { name: /Rebel: \d{8}-\d{2}$/ })
    await expect(cover).toBeVisible()
    await expect(cover).toHaveAttribute('data-rung', 'mark')
    await expect(cover.locator('.qr-shown__mark')).toBeVisible()
    await expect(cover).toContainText('No photograph of this boat yet.')
    /* and the stand-in names no boat over it: the row names it (the refine round) */
    await expect(cover).not.toContainText('Rebel')

    const read = await page.evaluate(() => {
      const plate = document.querySelector('.qr-panel')!.getBoundingClientRect()
      const first = document.querySelector('.qr-standing__disc')!.getBoundingClientRect()
      const last = document.querySelector('.qr-standing__head')!.getBoundingClientRect()
      return {
        scroll: document.scrollingElement!.scrollHeight,
        inner: window.innerHeight,
        room: document.querySelector('.qr-room')!.getBoundingClientRect().height,
        cover: document.querySelector('.qr-shown')!.getBoundingClientRect().height,
        above: first.top - plate.top,
        below: plate.bottom - last.bottom,
      }
    })
    expect(read.scroll, `the register fits the window at ${at}`).toBeLessThanOrEqual(read.inner)
    /* the cover IS the room: no frame with nothing in it */
    expect(
      Math.abs(read.cover - read.room),
      `the cover fills the room at ${at}`,
    ).toBeLessThanOrEqual(1)
    /* AND THE PANEL AT REST SAYS WHAT IT IS FOR IN ITS MIDDLE: what it says is one block,
       as far from the plate's top as from its foot, so no band of the plate is a hole at
       the top or the foot of it */
    expect(
      Math.abs(read.above - read.below),
      `the panel's words stand in its middle at ${at}`,
    ).toBeLessThanOrEqual(4)
    /* and it counts nothing: every count is on the head of the band it counts */
    const panel = page.getByRole('complementary', { name: 'The quote you are on' })
    await expect(panel.getByRole('heading', { name: 'Press a quote to see it' })).toBeVisible()
    expect(await panel.innerText(), 'no figure in the panel at rest').not.toMatch(/\d/)

    await cover.click()
    await expect(panel.getByRole('button', { name: 'Open the build' })).toBeVisible()
  })

  test('the picture beside the quote being read is that quote’s boat, and each figure is said once', async ({
    page,
    viewport,
  }) => {
    /* THE SECOND COMPONENTS CRITIQUE, FINDING 10, walked as the critic walked it: two quotes,
       the newer one's boat not photographed and the older one's photographed. The room showed
       the newest PHOTOGRAPHED quote whatever was pressed, so with one quote read in the panel
       the photograph under the list named the other quote and its total; and the panel at rest
       repeated every band's count and sum in three tiles beside the band heads that say them. */
    test.setTimeout(240_000)
    const at = `${viewport?.width}x${viewport?.height}`
    await throughTheDoor(page)
    await pickAndStart(page, 'boat_highfield', 'SP560')
    await page.waitForTimeout(900)
    await pickAndStart(page, 'boat_stacer', '589 Rebel')
    await page.waitForTimeout(900)
    await page.goto('/quotes')
    await expect(page.locator('[data-testid="quotes"][data-read]')).toBeVisible()

    const register = page.getByTestId('quotes')
    const drafts = page
      .getByRole('grid', { name: 'Quotes' })
      .getByRole('rowgroup', { name: 'Draft' })
      .getByRole('row', { name: /\d{8}-\d{2}/ })
    await expect(drafts).toHaveCount(2)
    const room = page.locator('.qr-shown')
    const panel = page.getByRole('complementary', { name: 'The quote you are on' })

    /* AT REST the room is the row the cursor stands on, the register's first */
    await expect(room).toHaveAccessibleName(new RegExp(`: ${await referenceOf(drafts.first())}$`))

    /* EACH FIGURE ONCE, AT REST: a quote's total is on its row and nowhere else on the
       screen — not on the room's band, not on a tile, not on a head of one — and the panel
       counts nothing */
    for (const row of await drafts.all()) {
      const total = (await row.locator('.qr-cell--total').innerText()).trim()
      expect(total, 'a fresh mint is priced').toMatch(/^\$[\d,]+$/)
      const said = (await register.innerText()).split(total).length - 1
      expect(said, `${total} is said ${said} times at ${at}`).toBe(1)
    }
    expect(await panel.innerText(), 'no figure in the panel at rest').not.toMatch(/\d/)

    /* PRESSED, EACH IN TURN: the panel reads it and the room is its boat, never the other's */
    for (const hull of [/Sport 560/, /Rebel/]) {
      const row = drafts.filter({ hasText: hull })
      await row.click()
      const reference = await referenceOf(row)
      await expect(panel.locator('.qr-peek__ref')).toHaveText(reference)
      await expect(room, `the room beside ${reference}`).toHaveAccessibleName(
        new RegExp(`: ${reference}$`),
      )
    }
    /* and the one whose model is photographed shows its photograph, on the water */
    await drafts.filter({ hasText: /Sport 560/ }).click()
    await expect(room).toHaveAttribute('data-rung', 'photo')
    await expect(room.locator('img')).toBeVisible()
    await expect(room).toHaveAccessibleName(/on the water: \d{8}-\d{2}$/)
  })
})

test('a browser with no name in it never reaches the register', async ({ page }) => {
  await page.goto('/quotes')
  /* the shell's first-visit rule, which belongs to every screen and
     not only to Home */
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
})

/* THE DENSITY THIS REGISTER OWES is measured in one place, `e2e/rulers/density.spec.ts`, on
   the register the walk mints a document onto. Until 2026-09-23 this file added up its own
   room out of `--row-h` and `--band-h` on an EMPTY register, and a second arithmetic for
   one requirement is how the ruler and three flows came to disagree about one tree. */
