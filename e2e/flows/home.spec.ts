import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { DEEPEST, MODEL, pickAndStart, written } from '../mint'

/* ============================================================
   HOME, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   The figures asserted here are not typed into this file: they are
   computed from `data/northside/` — the same files the browser fetches
   — and then looked for on the screen. So this fails when the screen
   drifts from the file, when the file drifts from the screen, and when
   a table does not arrive at all, which is the one case a unit test
   cannot see.

   It runs under all six viewport projects, so every assertion is one
   that must hold in a hand as well as on a desk. Positions are the
   rulers' to measure, with ONE exception written below: whether the
   screen fits the window it was drawn for, which no ruler asks.
   ============================================================ */

const DATA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'data',
  'northside',
)
const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(DATA, file), 'utf8')) as T

interface ManifestTable {
  id: string
  rowCount: number
}
interface Manifest {
  name: string
  tables: ManifestTable[]
}
interface Table {
  id: string
  name: string
  kind: string
  role: string
}

const manifest = readJson<Manifest>('manifest.json')
const tables = readJson<Table[]>('entities.json')
const rowsOf = (id: string): number => manifest.tables.find((t) => t.id === id)?.rowCount ?? 0
const sum = (list: Table[]): number => list.reduce((n, t) => n + rowsOf(t.id), 0)

/** The photographs Home stands on, as the heroes ledger records them. */
interface Hero {
  id: string
  table: string
  model: string
  file: string
}
const heroes = readJson<Hero[]>('heroes-ledger.json')
const heroById = (id: string): Hero => {
  const found = heroes.find((h) => h.id === id)
  if (!found) throw new Error(`the heroes ledger holds no ${id}`)
  return found
}
/** The held copy's own name without its extension: every narrower copy
 *  of it (`-640`, `-1280`) begins the same way. */
const stem = (hero: Hero): string => hero.file.replace(/\.[a-z0-9]+$/i, '')

const base = tables.filter((t) => t.role !== 'join')
const joins = tables.filter((t) => t.role === 'join')
const boats = base.filter((t) => t.kind === 'boat')
const au = (n: number): string => n.toLocaleString('en-AU')

/* ============================================================
   THE THREE WINDOWS HOME IS DRAWN TO FIT — rule (d) of 2026-09-23.

   The critique of Milestone 2 (#10) measured Home at 915 in a 900
   window, 822 in 800 and 1,084 in 1,080, with the last line of the
   drafts sliced by the bottom edge — against a status file that said
   "800 in 800, 900 in 900 and 1,080 in 1,080", because no test had ever
   asked. These three sizes are the ones home.css says are one screen;
   the other three scroll on purpose (a hand, a phone on its side, and
   a tablet taking the one-column page) and are not asked to fit.
   ============================================================ */
const FITS = new Set(['1280x800', '1440x900', '1920x1080'])
const windowOf = (page: Page): string => {
  const size = page.viewportSize()
  return size ? `${size.width}x${size.height}` : ''
}

/** How tall the document is against the window, and the lowest edge of
 *  anything Home draws — so a column sliced by the bottom edge fails
 *  even where the page itself was clipped rather than scrolled. */
async function fitOf(page: Page) {
  return page.evaluate(() => {
    let lowest = 0
    for (const column of document.querySelectorAll('.home-col')) {
      for (const child of column.children) {
        lowest = Math.max(lowest, child.getBoundingClientRect().bottom)
      }
    }
    return {
      scrollHeight: document.scrollingElement?.scrollHeight ?? Number.POSITIVE_INFINITY,
      innerHeight: window.innerHeight,
      lowest: Math.ceil(lowest),
    }
  })
}

async function expectOneScreen(page: Page, state: string): Promise<void> {
  const fit = await fitOf(page)
  expect(
    fit.scrollHeight,
    `${state} at ${windowOf(page)}: the page is ${fit.scrollHeight} in a ${fit.innerHeight} window`,
  ).toBeLessThanOrEqual(fit.innerHeight)
  expect(
    fit.lowest,
    `${state} at ${windowOf(page)}: a column ends at ${fit.lowest}, past the ${fit.innerHeight} window`,
  ).toBeLessThanOrEqual(fit.innerHeight)
}

/** Both photographs have arrived and the lights are up on them: loaded,
 *  marked arrived, and at full opacity once the reveal has run. */
async function picturesUp(page: Page): Promise<void> {
  const fold = page.getByRole('region', { name: 'Two boats from the file' })
  const pictures = fold.locator('img')
  await expect(pictures).toHaveCount(2)
  for (const index of [0, 1]) {
    await expect(pictures.nth(index)).toHaveAttribute('data-arrived', '')
    await expect(pictures.nth(index)).toHaveCSS('opacity', '1')
  }
}

test('home counts the file it actually loaded, and says what it cannot do yet', async ({
  page,
}) => {
  const errors: string[] = []
  const missed: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('requestfailed', (r) => missed.push(r.url()))

  /* Home is reached the way a person reaches it: a name at the door
     and the blue door pressed. There is no other way — this screen
     reads what this browser has kept, never the file. */
  await throughTheDoor(page)
  await expect(page.getByTestId('home')).toBeVisible()

  /* ---- the stamp: the sheet, as it arrived ---------------- */
  const stamp = page.getByTestId('pack-counts')
  await expect(stamp).toBeVisible({ timeout: 30_000 })
  await expect(stamp.getByText(au(tables.length), { exact: true })).toBeVisible()
  await expect(stamp.getByText(au(sum(tables)), { exact: true })).toBeVisible()
  await expect(stamp.getByText(au(joins.length), { exact: true })).toBeVisible()

  /* the business is named from what was opened, never typed in */
  await expect(page.getByText(manifest.name, { exact: true }).first()).toBeVisible()

  /* ---- what they sell: one figure per kind, counted ------- */
  const sells = page.getByRole('region', { name: 'What this business sells' })
  const kinds = ['boat', 'motor', 'trailer', 'package', 'accessory', 'custom']
  for (const kind of kinds) {
    const rows = sum(base.filter((t) => t.kind === kind))
    await expect(sells.getByText(au(rows), { exact: true }).first()).toBeVisible()
  }
  /* and no invented total: the sum of the six is a row count, never a
     count of boats for sale */
  await expect(
    sells.getByText(/^Each figure counts lines of the price file: a boat listed in four colours/),
  ).toBeVisible()

  /* ---- the makers, with the ledger's own gap -------------- */
  const shelf = page.getByRole('region', { name: 'The boat makers' })
  for (const boat of boats) {
    await expect(shelf.getByText(`${au(rowsOf(boat.id))} lines`).first()).toBeVisible()
  }
  await expect(shelf.getByRole('listitem')).toHaveCount(boats.length)
  /* Stabicraft has no mark in the ledger, so it is named in type and
     the reason is printed under the shelf */
  const stabicraft = shelf.getByRole('listitem').filter({ hasText: 'Stabicraft' })
  await expect(stabicraft.locator('img')).toHaveCount(0)
  await expect(shelf.getByText(/no public wordmark verified/)).toBeVisible()
  /* the makers that do hold one draw it, and no mark is enlarged */
  const marks = shelf.locator('img')
  await expect(marks).toHaveCount(boats.length - 1)
  for (let i = 0; i < boats.length - 1; i += 1) {
    const mark = marks.nth(i)
    const drawn = await mark.evaluate((el) => {
      const image = el as HTMLImageElement
      return { natural: image.naturalWidth, width: image.getBoundingClientRect().width }
    })
    expect(drawn.natural, 'the mark loaded').toBeGreaterThan(0)
    expect(drawn.width).toBeLessThanOrEqual(drawn.natural)
  }

  /* ---- the two photographs, neither enlarged -------------- */
  /* THIS IS WHERE "NEITHER DRAWN PAST ITS OWN SIZE" LIVES NOW. The
     caption under the fold printed it until 2026-09-23 with the pixel
     arithmetic beside it; the screen now names the boats, and the
     promise is measured here, off each element, at six sizes. */
  await picturesUp(page)
  const pictures = page.getByRole('region', { name: 'Two boats from the file' }).locator('img')
  for (const index of [0, 1]) {
    const drawn = await pictures.nth(index).evaluate((el) => {
      const image = el as HTMLImageElement
      const box = image.getBoundingClientRect()
      return {
        natural: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        width: box.width,
        height: box.height,
      }
    })
    expect(drawn.natural, 'the photograph loaded').toBeGreaterThan(0)
    expect(drawn.width).toBeLessThanOrEqual(drawn.natural)
    expect(drawn.height).toBeLessThanOrEqual(drawn.naturalHeight)
  }

  /* ---- the act, which acts -------------------------------- */
  const act = page.getByRole('button', { name: 'New quote' })
  await expect(act).toBeVisible()
  await expect(act).toHaveAttribute('aria-disabled', 'false')
  /* THE SENTENCE THAT OUTLIVED THE SCREEN IT WAS ABOUT. It said the
     picker was not built for a whole day after the picker was built,
     and it was the blocker the critique of 2026-09-17 opened with. */
  await expect(page.getByText(/The picker is not built yet/)).toHaveCount(0)
  await expect(page.getByText(/Neither plate opens yet/)).toHaveCount(0)

  /* ---- the drafts: the true empty state, TAUGHT ----------- */
  /* THE CRITIQUE OF MILESTONE 2, #23: the empty card was a wireframe of
     labelled boxes where every other empty state is a sentence. It is
     the true state in a sentence and the sale in three steps. */
  const drafts = page.getByRole('region', { name: 'Open drafts' })
  await expect(drafts.getByTestId('draft-count')).toHaveText('0')
  await expect(drafts.getByText('No quote has been started in this browser yet.')).toBeVisible()
  const steps = drafts.getByRole('list', { name: 'How a quote is made' })
  await expect(steps.getByRole('listitem')).toHaveCount(3)
  await expect(steps).toContainText('Choose the boat')
  await expect(steps).toContainText('Give it to the customer')
  await expect(drafts.getByText(/Where the act that opens it will sit/i)).toHaveCount(0)
  await expect(drafts.getByText(/the register that lists them is not built yet/)).toHaveCount(0)
  /* and an empty desk does not point at an empty register */
  await expect(drafts.getByRole('button', { name: 'All quotes' })).toHaveCount(0)

  /* ---- no plan word and no address as text: rule (c) ------ */
  const home = page.getByTestId('home')
  await expect(home.getByText(/\/quote\/|\/quotes\b|\$id|Milestone \d/)).toHaveCount(0)

  /* ---- the search field is real ------------------------- */
  const field = page.getByRole('searchbox', { name: /Search the file/ })
  await expect(field).toHaveAttribute('placeholder', `Search ${au(sum(tables))} lines`)
  /* ITS KEY IS `/`. The shell took Ctrl K for the finder on 2026-09-23
     (docs/DECISIONS.md) and this field kept the key every other find
     field in the app answers to. Until today this case pressed Ctrl K,
     waited for the field, and stopped there at all six sizes — so the
     search below, the page-error check and the picture check never ran.
     Ctrl K is asserted as what it is now: the finder, not this field. */
  await page.keyboard.press('Control+k')
  await expect(page.getByTestId('shell-finder')).toBeVisible()
  await expect(field).not.toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('shell-finder')).toHaveCount(0)
  await page.keyboard.press('/')
  await expect(field).toBeFocused()
  await field.fill('crossfire')
  await expect(page.getByText(/lines carry that word/)).toBeVisible()

  /* ENTER HANDS THE WORDS TO THE FINDER. The critique of Milestone 2's close (#12): "Type
     SP560 and it answers '35 rows carry that word'… Press Enter and nothing happens." Still
     true when this round was driven cold on 2026-09-24. The finder now opens with the words
     typed, answering them, and Escape leaves the desk as it was. */
  await field.press('Enter')
  const finder = page.getByTestId('shell-finder')
  await expect(finder).toBeVisible()
  await expect(finder.getByRole('combobox')).toHaveValue('crossfire')
  await expect(finder.getByRole('option').first()).toBeVisible({ timeout: 15_000 })
  await page.keyboard.press('Escape')
  await expect(finder).toHaveCount(0)
  await expect(field).toHaveValue('crossfire')

  /* ---- no key is named to a finger: rule (b) ------------- */
  /* THE CRITIQUE'S #18: "Ctrl K opens the finder" was printed at 390 on a
     device with no Ctrl key. The sentence has two twins and one is drawn;
     which one is the browser's own answer about the pointer. */
  const said = page.locator('#home-search-said')
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches)
  if (coarse) {
    await expect(said.locator('[data-say="touch"]')).toBeVisible()
    await expect(said.locator('[data-say="keys"]')).toBeHidden()
    /* what is DRAWN, not what is in the tree: the keyboard twin stays in
       the document under `display: none`, and textContent would read it */
    await expect(said).not.toContainText(/Ctrl|⌘/, { useInnerText: true })
    /* and no keycap anywhere on the screen a finger is holding */
    await expect(home.locator('kbd:visible')).toHaveCount(0)
  } else {
    await expect(said.locator('[data-say="keys"]')).toBeVisible()
    await expect(said.locator('[data-say="touch"]')).toBeHidden()
  }

  /* ---- and it is one screen where it was drawn as one ----- */
  if (FITS.has(windowOf(page))) {
    await page.keyboard.press('Escape')
    await field.fill('')
    await expectOneScreen(page, 'an empty desk')
  }

  expect(errors, 'no page error').toEqual([])
  expect(missed, 'every picture and every table arrived').toEqual([])
})

/* ============================================================
   EVERY CONTROL ON HOME GOES SOMEWHERE, at every ruler width.

   The critique of 2026-09-17 measured the opposite: "Home has exactly
   one button on it" and pressing it left `location.pathname` at `/`.
   Each press below is followed to the address it claims, because a
   control that is merely present is what shipped last time.
   ============================================================ */
test('every control on home reaches the screen it names', async ({ page }) => {
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })

  /* the one act: the picker */
  await page.getByRole('button', { name: 'New quote' }).click()
  await expect(page).toHaveURL(/\/quote\/new$/)
  await page.goBack()
  await expect(page.getByTestId('home')).toBeVisible()

  /* each photograph: the picker, opened AT the boat it shows — its
     maker's list with that boat on the plate — rather than at the top of
     a list of 67 (the M2-close critique, finding 18) */
  const fold = page.getByRole('region', { name: 'Two boats from the file' })
  const doors = fold.getByRole('button', { name: /^Quote the / })
  await expect(doors).toHaveCount(2)
  const adv7 = heroById('highfield-adv7')
  await fold.getByRole('button', { name: `Quote the ${adv7.model}` }).click()
  await expect(page).toHaveURL(new RegExp(`/quote/new\\?brand=${adv7.table}&model=`))
  const plate = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(plate.getByRole('heading', { level: 2 })).toHaveText(adv7.model)
})

/* ============================================================
   THE PHOTOGRAPH HOME SELLS IS THE PHOTOGRAPH THE SALE STANDS ON — the
   M2-close critique, finding 11: "Home's second hero reads STACER · 519
   Sea Ranger SDF … Quote either of those two rows (Centre or Side
   Console) and both the picker and the build say 'The row names a
   picture and no copy of it is held here'. The same photograph is sold
   on Home and missing from the sale." Walked by pressing, from the
   photograph to the build, and read at each step off the pixels that
   arrived: the file each <img> actually loaded.
   ============================================================ */
test('the Stacer on Home is the Stacer on the picker and on the build', async ({ page }) => {
  const hero = heroById('stacer-519-sea-ranger')
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })

  const fold = page.getByRole('region', { name: 'Two boats from the file' })
  const onHome = fold.getByAltText(new RegExp(hero.model))
  await expect(onHome).toBeVisible()
  await expect
    .poll(() => onHome.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toContain(stem(hero))

  await fold.getByRole('button', { name: `Quote the ${hero.model}` }).click()
  await expect(page).toHaveURL(new RegExp(`/quote/new\\?brand=${hero.table}&model=`))
  const plate = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(plate.getByRole('heading', { level: 2 })).toContainText(hero.model)
  const onPlate = plate.locator('img.picker-shot__img')
  await expect(onPlate).toBeVisible()
  await expect
    .poll(() => onPlate.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toContain(stem(hero))
  await expect(plate.getByText(/No photograph of the/)).toHaveCount(0)

  await plate
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()
  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  const stage = page.locator('figure.cfg-shot')
  await expect(stage).toHaveAttribute('data-art', 'photograph')
  await expect
    .poll(() => stage.locator('img').evaluate((img: HTMLImageElement) => img.currentSrc))
    .toContain(stem(hero))
  /* the photograph is the model's; the console this quote is, in words */
  await expect(page.getByTestId('stage-caption')).toContainText('This quote: Centre Console')
  await expect(page.getByText(/No photograph of this boat is held/)).toHaveCount(0)
})

/* ============================================================
   A DESK WITH A QUOTE ON IT: the card, the way to the register, and
   the fit held with the tallest thing the drafts column can draw.

   The quote is MINTED by the walk every other flow uses (`e2e/mint.ts`):
   a name at the door, the file loaded, a model chosen on the picker and
   its act pressed. Nothing is planted, and the card reads what that
   press froze.
   ============================================================ */
test('a quote started here comes back to the desk as a card that opens it', async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  const id = await pickAndStart(page, DEEPEST.table.id, MODEL)

  /* back to the desk the way a dealer goes back: the pill's Home */
  await page.getByTestId('shell-pill').getByRole('link', { name: /^Home/ }).first().click()
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })

  const drafts = page.getByRole('region', { name: 'Open drafts' })
  await expect(drafts.getByTestId('draft-count')).toHaveText('1')
  await expect(drafts.getByText('1 draft is open.')).toBeVisible()
  /* the lesson is for an empty desk; with a quote on it, the card is it */
  await expect(drafts.getByRole('list', { name: 'How a quote is made' })).toHaveCount(0)
  const card = drafts.getByRole('button').filter({ hasText: /Draft/ }).first()
  await expect(card).toBeVisible()

  if (FITS.has(windowOf(page))) {
    await picturesUp(page)
    await expectOneScreen(page, 'a desk with a draft on it')
  }

  /* the card opens the build it drew, where it is still being written */
  await card.click()
  await expect(page).toHaveURL(new RegExp(`/quote/${id}$`))
  await page.goBack()
  await expect(page.getByTestId('home')).toBeVisible()

  /* and the register is one press from the column that counts it */
  await page
    .getByRole('region', { name: 'Open drafts' })
    .getByRole('button', { name: 'All quotes' })
    .click()
  await expect(page).toHaveURL(/\/quotes$/)
})

/* ============================================================
   A TABLE MADE AT THIS DESK IS NOT THE PRICE FILE — the critique of
   Milestone 2's close, blocker 2, in a real browser.

   The critic filed M. Duffy and Home read 65 Labour Rates, 54 tables and
   15,692 rows, "Search 15,692 rows", and the pill's Data door 54: the
   customers book, a table on the sheet, counted as the file. The rule
   that tells the two apart is one rule (`domain/catalogue/priceFile.ts`)
   and a table made on Data's own "New register" is the same case as the
   book — a base table no place files — so it is made here by Data's own
   act, and every figure Home and the pill print about the file is held
   to the file on disk: on the same visit, and again after a reload reads
   the sheet, book and all, back out of this browser. The book itself is
   held to the same figures by `Home.test.tsx`, through the very command
   Customers applies.
   ============================================================ */
test('a table made at this desk changes nothing home counts about the file', async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })

  await page.goto('/data')
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'New register' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox').first().fill('Boat show leads')
  await dialog.getByRole('button', { name: 'Make it' }).click()
  await expect(page.getByTestId('last-step')).toContainText('Boat show leads')
  /* Data lists it under the desk's own place, and its head still counts the file */
  await expect(page.getByTestId('data-counts')).toContainText(`${au(tables.length)} tables`)

  const pill = page.getByTestId('shell-pill')
  const theFile = async (when: string): Promise<void> => {
    const stamp = page.getByTestId('pack-counts')
    await expect(stamp, when).toBeVisible({ timeout: 30_000 })
    await expect(stamp.getByText(au(tables.length), { exact: true }), when).toBeVisible()
    await expect(stamp.getByText(au(sum(tables)), { exact: true }), when).toBeVisible()
    const sells = page.getByRole('region', { name: 'What this business sells' })
    for (const kind of ['boat', 'motor', 'trailer', 'package', 'accessory', 'custom']) {
      const rows = sum(base.filter((t) => t.kind === kind))
      await expect(sells.getByText(au(rows), { exact: true }).first(), when).toBeVisible()
    }
    await expect(sells, when).toContainText(`${au(sum(joins))} pairings say`)
    await expect(page.getByRole('searchbox', { name: /Search the file/ }), when).toHaveAttribute(
      'placeholder',
      `Search ${au(sum(tables))} lines`,
    )
    /* and the door counts what Data's head counts: the file */
    await expect(
      pill.getByRole('link', { name: `Data — ${au(tables.length)} tables` }),
      when,
    ).toHaveCount(1)
  }

  await pill.getByRole('link', { name: /^Home/ }).first().click()
  await expect(page.getByTestId('home')).toBeVisible()
  await theFile('on the same visit')

  await written(page)
  await page.reload()
  await expect(page.locator('[data-testid="pack-counts"] [data-from="repository"]')).toBeVisible({
    timeout: 30_000,
  })
  await theFile('read back out of this browser')
})

test('the second visit draws the same screen without reading the file again', async ({ page }) => {
  let packRequests = 0
  await page.route('**/data/northside/**', (route) => {
    packRequests += 1
    return route.continue()
  })

  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('[data-testid="pack-counts"] [data-from="pack"]')).toBeVisible()
  const onFirstVisit = packRequests

  await page.reload()
  const stamp = page.getByTestId('pack-counts')
  await expect(stamp).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('[data-testid="pack-counts"] [data-from="repository"]')).toBeVisible()
  await expect(stamp.getByText(au(sum(tables)), { exact: true })).toBeVisible()

  /* THE PICTURE LEDGERS RIDE IN THE BUNDLE, which is what makes this
     pass: a screen that fetched them on every paint would read the
     file again on a visit that is supposed to read nothing. */
  expect(packRequests, 'the second visit fetched nothing').toBe(onFirstVisit)

  /* AND THE SECOND VISIT FITS TOO. It is the one a dealer sees every
     morning after the first, read out of this browser rather than the
     file, and it has to be the same one screen. */
  if (FITS.has(windowOf(page))) {
    await picturesUp(page)
    await expectOneScreen(page, 'the second visit')
  }
})
