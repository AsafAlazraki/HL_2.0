import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { DEEPEST, MODEL, boatsIn, issueIt, pickAndStart, written } from '../mint'

/* ============================================================
   HOME, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN — built from
   board D, "Who is at the desk", with board A's maker doors (2026-10-20),
   and redrawn after the cold critique so day one's composition holds
   a week in: the work joins the sea as one row, nothing is replaced.

   Every figure asserted here is computed from `data/northside/` — the
   files the browser fetches — and then looked for on the screen. Every
   act on the screen is pressed and followed to the address it names.
   The one position this file measures itself is whether the page fits
   the window it is drawn for, which no ruler asks: 800 in 800, 900 in
   900 and 1,080 in 1,080, on day one and a week in.
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

interface Manifest {
  name: string
  tables: { id: string; rowCount: number }[]
}
interface Table {
  id: string
  name: string
  kind: string
  role: string
  retired?: boolean
}
interface Hero {
  id: string
  person: boolean
  table: string
  model: string
  file: string
  subject: string
}
interface NamesLedger {
  makers: { table: string; maker: string }[]
  models: { table: string; code: string; name: string; fileCodes: string[] }[]
}

const manifest = readJson<Manifest>('manifest.json')
const tables = readJson<Table[]>('entities.json')
const everyHero = readJson<{
  pictures: (Omit<Hero, 'model'> & { tier: string; models: string[] })[]
}>('pictures.json')
  .pictures.filter((p) => p.tier === 'hero')
  /* a hull's photograph (two consoles, three packages) is named by what its models share */
  .map((p) => ({
    ...p,
    model: p.models
      .reduce((a, b) => {
        let i = 0
        while (i < a.length && a[i] === b[i]) i += 1
        return a.slice(0, i)
      })
      .replace(/[\s([\-–—,:/]+$/u, '')
      .trim(),
  }))
/* HOME'S ROW IS EIGHT (src/screens/home/ledgers.ts, `boatsForHome`): one maker at a time, a
   photograph a person marked before one the machine chose, otherwise in the ledger's order */
const heroes = ((): Hero[] => {
  const byMaker = new Map<string, Hero[]>()
  for (const h of everyHero.toSorted((a, b) => Number(b.person) - Number(a.person)))
    byMaker.set(h.table, [...(byMaker.get(h.table) ?? []), h])
  const out: Hero[] = []
  for (let pass = 0; out.length < Math.min(8, everyHero.length); pass += 1)
    for (const list of byMaker.values()) if (list[pass] && out.length < 8) out.push(list[pass]!)
  return out
})()
const names = readJson<NamesLedger>('names.json')
const rowsOf = (id: string): number => manifest.tables.find((t) => t.id === id)?.rowCount ?? 0
const sum = (list: Table[]): number => list.reduce((n, t) => n + rowsOf(t.id), 0)
const au = (n: number): string => n.toLocaleString('en-AU')
const stem = (hero: Hero): string => hero.file.replace(/\.[a-z0-9]+$/i, '')
const heroById = (id: string): Hero => {
  const found = heroes.find((h) => h.id === id)
  if (!found) throw new Error(`the heroes ledger holds no ${id}`)
  return found
}
/** The model as the picker and Home say it: the maker's page's own words for a code. */
const modelSaid = (hero: Hero): string =>
  names.models.find((m) => m.table === hero.table && m.code === hero.model)?.name ??
  /* a row's own name, less the maker it repeats, its bracket said after a dot (Home's own rule) */
  hero.model
    .replace(/^[^-]+ - /, '')
    .replace(/\s*\(([^()]+)\)$/, ' · $1')
    .trim()
const makerSaid = (tableId: string): string =>
  names.makers.find((m) => m.table === tableId)?.maker ??
  tables.find((t) => t.id === tableId)?.name ??
  ''
const boatTile = (hero: Hero): string => `${modelSaid(hero)}, ${makerSaid(hero.table)} — quote it`

const boats = tables.filter((t) => t.kind === 'boat' && t.role !== 'join' && !t.retired)
const motors = tables.filter((t) => t.kind === 'motor' && t.role !== 'join' && !t.retired)

/* ============================================================
   THE THREE WINDOWS HOME IS DRAWN TO FIT. The other three scroll on
   purpose — a hand, a phone on its side, a tablet's one column.
   ============================================================ */
const FITS = new Set(['1280x800', '1440x900', '1920x1080'])
const windowOf = (page: Page): string => {
  const size = page.viewportSize()
  return size ? `${size.width}x${size.height}` : ''
}

/** How tall the document is against the window, and the lowest edge of anything Home draws,
 *  so a row sliced by the bottom edge fails even where the page was clipped, not scrolled. */
async function expectOneScreen(page: Page, state: string): Promise<void> {
  const fit = await page.evaluate(() => {
    let lowest = 0
    for (const el of document.querySelectorAll('[data-testid="home"] > *')) {
      lowest = Math.max(lowest, el.getBoundingClientRect().bottom)
    }
    return {
      scrollHeight: document.scrollingElement?.scrollHeight ?? Number.POSITIVE_INFINITY,
      innerHeight: window.innerHeight,
      lowest: Math.ceil(lowest),
    }
  })
  expect(
    fit.scrollHeight,
    `${state} at ${windowOf(page)}: the page is ${fit.scrollHeight} in a ${fit.innerHeight} window`,
  ).toBeLessThanOrEqual(fit.innerHeight)
  expect(
    fit.lowest,
    `${state} at ${windowOf(page)}: a row ends at ${fit.lowest}, past the ${fit.innerHeight} window`,
  ).toBeLessThanOrEqual(fit.innerHeight)
}

/** Every photograph on the row has arrived, and none is drawn past the pixels it came with. */
async function photographsUp(region: ReturnType<Page['getByRole']>): Promise<void> {
  const pictures = region.locator('img')
  const count = await pictures.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i += 1) {
    await expect(pictures.nth(i)).toHaveAttribute('data-landed', '')
    const drawn = await pictures.nth(i).evaluate((el) => {
      const image = el as HTMLImageElement
      const box = image.getBoundingClientRect()
      return { natural: image.naturalWidth, width: box.width }
    })
    expect(drawn.natural, 'the photograph loaded').toBeGreaterThan(0)
    expect(drawn.width).toBeLessThanOrEqual(drawn.natural)
  }
}

const boatsRegion = (page: Page) => page.getByRole('region', { name: 'Start from the boat' })
const doorsRegion = (page: Page) =>
  page.getByRole('region', { name: `What ${manifest.name} sells` })

test('day one: Northside on the water, the find beside the act, the boats and the makers', async ({
  page,
}) => {
  const errors: string[] = []
  const missed: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('requestfailed', (r) => missed.push(r.url()))

  await throughTheDoor(page)
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByTestId('home')).toHaveAttribute('data-state', 'day-one')

  /* ---- the sea: the business named by its file, on the live water ---- */
  const sea = page.getByRole('region', { name: manifest.name, exact: true })
  await expect(sea).toBeVisible()
  await expect(sea.locator('canvas')).toHaveCount(1)
  await expect(sea.getByRole('heading', { level: 1 })).toHaveText(
    /^Good (morning|afternoon|evening), /,
  )

  /* ---- the price list, said once by its date; its size is Data's (docs/WORDS.md) ---- */
  const stamp = page.getByTestId('pack-counts')
  await expect(stamp).toBeVisible({ timeout: 30_000 })
  await expect(stamp).toHaveText(/^Price list of \d{1,2} [A-Z][a-z]+ \d{4}$/)
  await expect(stamp).not.toContainText(au(sum(tables)))
  await expect(page.getByText('No quotes and no customers yet.')).toBeVisible()
  await expect(page, 'the tab names the dealership').toHaveTitle('Northside Marine')

  /* ---- the eight boats the ledger photographs ---- */
  const row = boatsRegion(page)
  await expect(row.getByRole('listitem')).toHaveCount(heroes.length)
  for (const hero of heroes)
    await expect(row.getByRole('button', { name: boatTile(hero) })).toBeVisible()
  await photographsUp(row)

  /* ---- the boat makers' doors, all on screen at once and still; the motors and the
          trailers said once beside them, never a door that opens a list not naming them ---- */
  const doors = doorsRegion(page)
  await expect(doors.getByRole('listitem')).toHaveCount(boats.length)
  for (const boat of boats) {
    const n = boatsIn(boat.id)
    await expect(
      doors.getByRole('button', {
        name: `${makerSaid(boat.id)} ${au(n)} ${n === 1 ? 'model' : 'models'}`,
      }),
    ).toBeVisible()
  }
  for (const motor of motors) {
    const maker = motor.name.replace(/\s+(outboards?|motors?|engines?)$/i, '').trim()
    await expect(doors.getByRole('button', { name: new RegExp(`^${maker} `) })).toHaveCount(0)
    await expect(doors).toContainText(maker)
  }
  await expect(doors).toContainText(
    /trailers from \d+ makers, are chosen in the build, on the boat\./,
  )
  /* a mark is never drawn past the copy held, and Stabicraft, with none held, is set in type */
  const marks = doors.locator('img')
  for (let i = 0; i < (await marks.count()); i += 1) {
    const drawn = await marks.nth(i).evaluate((el) => {
      const image = el as HTMLImageElement
      return {
        natural: image.naturalWidth,
        width: image.getBoundingClientRect().width,
        /* a drawing in vectors has no pixels to run out of: a browser reports an SVG with no
           size of its own as 300 wide, which is not the size of anything held */
        vector: /\.svg(\?|$)/i.test(image.currentSrc),
      }
    })
    expect(drawn.natural, 'the mark loaded').toBeGreaterThan(0)
    if (!drawn.vector) expect(drawn.width).toBeLessThanOrEqual(drawn.natural)
  }
  await expect(doors.getByRole('button', { name: /^Stabicraft / }).locator('img')).toHaveCount(0)
  /* STILL: no door moves at rest — two reads a second apart find every door where it was */
  const at = async () =>
    doors
      .getByRole('listitem')
      .evaluateAll((items) => items.map((li) => Math.round(li.getBoundingClientRect().left)))
  const first = await at()
  await page.waitForTimeout(1000)
  expect(await at()).toEqual(first)

  /* ---- the act, live, and never a bar at the foot ---- */
  const act = page.getByRole('button', { name: 'New quote' })
  await expect(act).toHaveAttribute('aria-disabled', 'false')
  const box = await act.boundingBox()
  expect(box!.y + box!.height, 'New quote is on the first screen').toBeLessThanOrEqual(
    page.viewportSize()!.height,
  )
  const fixed = await act.evaluate((el) => {
    for (let n: Element | null = el; n; n = n.parentElement) {
      if (getComputedStyle(n).position === 'fixed') return true
    }
    return false
  })
  expect(fixed, 'the act is not a floating bar').toBe(false)
  /* NOTHING FLOATS AT THE FOOT OF HOME, in a hand included (the critique, blocker 2): the
     shell's bar stands at the head, over no word of Home's */
  const bar = await page.getByTestId('shell-pill').boundingBox()
  const top = await page.getByRole('region', { name: manifest.name, exact: true }).boundingBox()
  expect(bar!.y + bar!.height, 'the bar stands above the sea').toBeLessThanOrEqual(top!.y)

  /* ---- no invented figure, no cost, no address as text ---- */
  const home = page.getByTestId('home')
  await expect(home).not.toContainText(/\$|%|margin|revenue|target/i)
  await expect(home.getByText(/\/quote\/|\/quotes\b|\$id|Milestone \d/)).toHaveCount(0)

  /* ---- one find, and it is the finder's door ---- */
  await expect(home.getByRole('searchbox')).toHaveCount(1)
  const field = page.getByRole('searchbox', { name: 'Find a boat or a customer' })
  await page.keyboard.press('/')
  await expect(field).toBeFocused()
  /* what is typed opens the one finder with those words, which answers the name the screens
     print (m2-last-critique.md, blocker 2), and the field is left empty behind it */
  await field.fill('sport 560')
  const finder = page.getByTestId('shell-finder')
  await expect(finder).toBeVisible()
  await expect(finder.getByRole('combobox')).toHaveValue('sport 560')
  await expect(finder.getByRole('option').first()).toBeVisible({ timeout: 15_000 })
  await page.keyboard.press('Escape')
  await expect(finder).toHaveCount(0)
  /* the cursor comes back to the field it left (the critique, minor 11) */
  await expect(field).toBeFocused()

  if (FITS.has(windowOf(page))) await expectOneScreen(page, 'day one')

  expect(errors, 'no page error').toEqual([])
  expect(missed, 'every picture and every table arrived').toEqual([])
})

/* ============================================================
   EVERY ACT ON DAY ONE REACHES THE SCREEN IT NAMES, at every width.
   ============================================================ */
test('every act on day one reaches the screen it names', async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  const back = async (): Promise<void> => {
    await page.goBack()
    await expect(page.getByTestId('home')).toBeVisible()
    await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  }

  /* the one act: the picker */
  await page.getByRole('button', { name: 'New quote' }).click()
  await expect(page).toHaveURL(/\/quote\/new$/)
  await back()

  /* a photograph: the picker AT that boat, with it on the plate (the ADV9: the ADV7's
     photograph is one no person marked, so it is not on Home's row of eight) */
  const adv9 = heroById('highfield-adv9')
  await boatsRegion(page)
    .getByRole('button', { name: boatTile(adv9) })
    .click()
  await expect(page).toHaveURL(new RegExp(`/quote/new\\?brand=${adv9.table}&model=`))
  const plate = page.getByRole('complementary', { name: 'What is chosen' })
  await expect(plate.getByRole('heading', { level: 2 })).toHaveText(modelSaid(adv9))
  await back()

  /* a boat maker's door: its boats in the picker */
  const first = boats.find((b) => b.id === 'boat_stacer') ?? boats[0]!
  await doorsRegion(page)
    .getByRole('button', { name: new RegExp(`^${makerSaid(first.id)} \\d`) })
    .click()
  await expect(page).toHaveURL(new RegExp(`/quote/new\\?brand=${first.id}(&|$)`))
  await back()
})

/* ============================================================
   BEFORE THE SALE (built-critique-m3-2.md, major 5): a stakeholder opening the link starts on
   an empty browser, so the first quote is everybody's first quote, and it carries a line whose
   price Northside has not chosen. Home says the price questions once, under the file, with the
   count Prices itself prints, and its door lands on Prices.
   ============================================================ */
test('the price questions are said once on Home, with Prices’ own count, and the door lands there', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  const asks = page.getByTestId('price-asks')
  await expect(asks).toHaveCount(1)
  /* under the sea's fold on a phone held sideways, so it is brought in, and then must be seen */
  await asks.scrollIntoViewIfNeeded()
  await expect(asks).toBeInViewport()
  const said = (await asks.innerText()).trim()
  const count = /^(\d+) price questions? waits? for you\./.exec(said)?.[1]
  expect(count, `Home said "${said}"`).toBeDefined()
  await expect(page.getByTestId('home')).toContainText(
    /priced by hand before the quote can be given/,
  )

  await asks.getByRole('button', { name: /^Answer (them|it) on Prices$/ }).click()
  await expect(page).toHaveURL(/\/levels$/)
  await expect(page.getByTestId('levels')).toBeVisible({ timeout: 30_000 })
  /* the same figure, read off Prices' own head */
  await expect(page.locator('#lv-choose')).toHaveText(new RegExp(`^Yours to choose\\s*${count}$`))
})

/* ============================================================
   THE PHOTOGRAPH HOME SELLS IS THE PHOTOGRAPH THE SALE STANDS ON — read off the pixels
   that arrived at each step, from Home's card to the picker's plate to the build's stage.
   ============================================================ */
test('the Stacer on Home is the Stacer on the picker and on the build', async ({ page }) => {
  const hero = heroById('stacer-409-assault-pro')
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })

  const onHome = boatsRegion(page).getByAltText(hero.subject)
  await expect(onHome).toBeVisible()
  await expect
    .poll(() => onHome.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toContain(stem(hero))

  await boatsRegion(page)
    .getByRole('button', { name: boatTile(hero) })
    .click()
  await expect(page).toHaveURL(new RegExp(`/quote/new\\?brand=${hero.table}&model=`))
  const plate = page.getByRole('complementary', { name: 'What is chosen' })
  const onPlate = plate.locator('img.picker-shot__img')
  await expect(onPlate).toBeVisible()
  await expect
    .poll(() => onPlate.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toContain(stem(hero))

  await plate
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()
  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  const stage = page.locator('figure.cfg-shot')
  await expect(stage).toHaveAttribute('data-art', 'photograph')
  await expect
    .poll(() => stage.locator('img').evaluate((img: HTMLImageElement) => img.currentSrc))
    .toContain(stem(hero))
})

/* ============================================================
   A WEEK IN, WALKED: a quote given to R. Kelleher, a draft standing,
   J. Harrow kept with a number and no quote. Nothing is planted; every
   card reads what the walk froze. The work joins day one's sea as one
   row, every card is followed to its address, and the page still fits
   where it was drawn to — with the mark at its day-one size.
   ============================================================ */
test('a week in: the work on the water, day one kept, and every card to its address', async ({
  page,
}) => {
  test.setTimeout(300_000)
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  const markOnDayOne = await page
    .locator('.home-mark')
    .evaluate((el) => Math.round(el.getBoundingClientRect().height))

  const given = await pickAndStart(page, DEEPEST.table.id, MODEL)
  await issueIt(page)
  await written(page)
  const draft = await pickAndStart(page, 'boat_highfield', 'SP560')
  await written(page)
  await page.goto('/customers')
  const form = page.getByRole('form', { name: 'Add a customer' })
  if ((await form.count()) === 0) {
    await page
      .getByRole('button', { name: /Add a customer/ })
      .first()
      .click()
  }
  await form.getByLabel('Name', { exact: true }).fill('J. Harrow')
  await form.getByLabel(/Phone/).first().fill('0412 345 678')
  await form.getByRole('button', { name: /^Add them$/ }).click()
  await written(page)

  const home = async (): Promise<void> => {
    await page.getByTestId('shell-pill').getByRole('link', { name: /^Home/ }).first().click()
    await expect(page.getByTestId('home')).toHaveAttribute('data-state', 'week')
    await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  }
  await home()

  /* the showpiece keeps its day-one size: the work joined it and shrank nothing */
  expect(
    await page
      .locator('.home-mark')
      .evaluate((el) => Math.round(el.getBoundingClientRect().height)),
  ).toBe(markOnDayOne)
  await expect(boatsRegion(page).getByRole('listitem')).toHaveCount(heroes.length)

  /* today, in one line, off the diary: what no card says, since the giving is its card's */
  await expect(page.getByText(/^2 quotes started today\.$/)).toBeVisible()
  await expect(page.getByText(/^Today: .* given\.$/)).toHaveCount(0)

  const desk = page
    .getByRole('region', { name: manifest.name, exact: true })
    .getByRole('region', { name: 'Work in hand' })
  await expect(desk.getByRole('listitem')).toHaveCount(3)
  /* no card sets a customer's total where another customer may be sitting */
  await expect(desk).not.toContainText('$')
  const writing = desk.getByRole('button', { name: /^Highfield Sport 560 Draft/ })
  await expect(writing).toBeVisible()
  await photographsUp(desk.getByRole('listitem').first())
  const paper = desk.getByRole('button', { name: /Given today at \d\d:\d\d To R\. Kelleher$/ })
  await expect(paper).toBeVisible()
  const harrow = desk.getByRole('button', { name: /^J\. Harrow No quote yet\. 0412 345 678$/ })
  await expect(harrow).toBeVisible()

  if (FITS.has(windowOf(page))) await expectOneScreen(page, 'a week in')

  /* the draft opens where it is written */
  await writing.click()
  await expect(page).toHaveURL(new RegExp(`/quote/${draft}$`))
  await home()

  /* the quote given today opens as the paper */
  await paper.click()
  await expect(page).toHaveURL(new RegExp(`/quote/${given}/document$`))
  await home()

  /* a person with no quote opens on their own page */
  await harrow.click()
  await expect(page).toHaveURL(/\/customers\?who=/)
  await expect(page.getByTestId('customers')).toContainText('J. Harrow')

  /* AN ORDINARY TUESDAY, NOT A LIGHT DAY (the second cold critique, blocker 1): two more drafts,
     one with the longest boat name a card carries, and a person with no number. The row stays
     one row of one card's height, the rest fold into its last card, and the page still fits —
     the sea is the height it was with three jobs. */
  const seaWith = async (): Promise<number> =>
    page
      .getByRole('region', { name: manifest.name, exact: true })
      .evaluate((el) => Math.round(el.getBoundingClientRect().height))
  await home()
  const seaAtThree = await seaWith()
  await pickAndStart(page, 'boat_stacer', '519 Sea Ranger SDF')
  await written(page)
  await pickAndStart(page, 'boat_formosa', 'GRT 425')
  await written(page)
  await page.goto('/customers')
  const again = page.getByRole('form', { name: 'Add a customer' })
  if ((await again.count()) === 0) {
    await page
      .getByRole('button', { name: /Add a customer/ })
      .first()
      .click()
  }
  await again.getByLabel('Name', { exact: true }).fill('M. Tran')
  await again.getByRole('button', { name: /^Add them$/ }).click()
  await written(page)
  await home()
  const more = desk.getByRole('button', { name: /^\d+ more In (Quotes|Customers)/ })
  const drawn = await desk.getByRole('listitem').count()
  if (drawn < 6) await expect(more).toBeVisible()
  else await expect(more).toHaveCount(0)
  await expect(desk.getByText(/more, in Quotes/)).toHaveCount(0)
  if (FITS.has(windowOf(page))) {
    expect(await seaWith(), 'the sea holds its height with six jobs').toBe(seaAtThree)
    await expectOneScreen(page, 'an ordinary Tuesday')
  }
  /* the folded card opens where what it folds is kept: Customers where it folds only people */
  if (drawn < 6) {
    const onlyPeople = (await more.innerText()).includes('In Customers')
    await more.click()
    /* Customers opens on a person of its own choosing, and says so in its address */
    await expect(page).toHaveURL(onlyPeople ? /\/customers(\?|$)/ : /\/quotes(\?|$)/)
  }
})

/* ============================================================
   A TABLE MADE AT THIS DESK IS NOT THE PRICE FILE (the critique of
   Milestone 2's close, blocker 2): made by Data's own act, and the file
   Home says once is still the file on disk, on the same visit and read
   back out of this browser.
   ============================================================ */
test('a table made at this desk changes nothing home says about the file', async ({ page }) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  await page.goto('/data')
  await expect(page.locator('[data-testid="data"][data-read]')).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'New list' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox').first().fill('Boat show leads')
  await dialog.getByRole('button', { name: 'Make it' }).click()
  await expect(page.getByTestId('last-step')).toContainText('Boat show leads')

  const theFile = async (when: string): Promise<void> => {
    const stamp = page.getByTestId('pack-counts')
    await expect(stamp, when).toBeVisible({ timeout: 30_000 })
    await expect(stamp, when).toHaveText(/^Price list of /)
    await expect(doorsRegion(page).getByRole('listitem'), when).toHaveCount(boats.length)
    await expect(boatsRegion(page).getByRole('listitem'), when).toHaveCount(heroes.length)
  }
  await page.getByTestId('shell-pill').getByRole('link', { name: /^Home/ }).first().click()
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
  await expect(page.locator('[data-testid="pack-counts"] [data-from="repository"]')).toBeVisible({
    timeout: 30_000,
  })
  await expect(doorsRegion(page).getByRole('listitem')).toHaveCount(boats.length)
  expect(packRequests, 'the second visit fetched nothing').toBe(onFirstVisit)

  if (FITS.has(windowOf(page))) {
    await photographsUp(boatsRegion(page))
    await expectOneScreen(page, 'the second visit')
  }
})

/* ============================================================
   EVERY NAME IS SAID WHOLE WHERE THERE IS ROOM FOR IT (2026-10-29, built-critique-m3-2.md
   major 8: "Signature Fisher 5…" and "GRT 455 · Side Con…" at 1440, beside empty room). The
   cut ruler passes a deliberate ellipsis, so this asks the question it does not: with one
   draft on the desk — the row far from full — is any word on a boat's card or the draft's
   card cut? The draft is the longest-named boat Home photographs, read off the ledger.
   ============================================================ */
test('no boat name and no line on a lone draft is cut short, at any size', async ({ page }) => {
  test.setTimeout(150_000)
  await throughTheDoor(page)
  await expect(page.getByTestId('pack-counts')).toBeVisible({ timeout: 30_000 })
  const longest = heroes.toSorted((a, b) => modelSaid(b).length - modelSaid(a).length)[0]!
  await boatsRegion(page)
    .getByRole('button', { name: boatTile(longest) })
    .click()
  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()
  await panel.getByRole('button', { name: /Start the quote/ }).click()
  await expect(page).toHaveURL(/\/quote\/[^/?]+$/, { timeout: 15_000 })
  await written(page)
  await page.getByTestId('shell-pill').getByRole('link', { name: /^Home/ }).first().click()
  await expect(page.getByTestId('home')).toHaveAttribute('data-state', 'week')
  await expect(page.locator('.home-job')).toHaveCount(1)
  await page.waitForTimeout(2_000)

  const cut = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        '.home-boat-model, .home-boat-maker, .home-job-title, .home-job-said, .home-job-who',
      ),
    ]
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => `"${el.textContent?.trim()}" needs ${el.scrollWidth}, has ${el.clientWidth}`),
  )
  expect(cut, `cut at ${windowOf(page)}`).toEqual([])
  if (FITS.has(windowOf(page))) await expectOneScreen(page, 'with one draft')
})
