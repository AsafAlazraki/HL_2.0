import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE CASCADE, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   NOTHING HERE IS TYPED INTO AN ASSERTION. The figures are read off
   the screen that produced them — the configurator's own running
   total before and after — and off the sheet's own arithmetic, so a
   sheet that promised one total and an act that produced another
   fails here, which is the worst defect this screen could have and
   the one no unit test over a single module can see.

   AND IT WALKS IN THROUGH THE FRONT DOOR, because there is no way to
   seed a quote: a document exists only because somebody pressed the
   act on the picker. Every case below signs in, loads the file,
   chooses a hull, starts the quote and then raises the decision from
   the build — which is also why this file is the proof that the two
   screens are joined at all.

   WHAT IT IS REALLY FOR: this screen's whole claim is that it is a
   ROUTE and not a modal state. Only a browser can test that. Back, a
   refresh and a typed address are three separate cases below and not
   one of them can be written against a rendered component.

   WHY THIS SCREEN IS NOT IN `e2e/routes.ts` YET. The same reason the
   configurator is not: every ruler opens a browser nobody has used
   and arrives either `fresh` or `through-the-door`, and neither
   reaches a document. The geometry it owes is measured here instead,
   at the six widths.
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
  tables: { id: string; file: string; rowCount: number }[]
}
interface Table {
  id: string
  name: string
  kind: string
  hierarchy?: string[]
}
interface Row {
  id: string
  values: Record<string, unknown>
}

const manifest = readJson<Manifest>('manifest.json')
const tables = readJson<Table[]>('entities.json')
const rowsOf = (id: string): Row[] =>
  readJson<Row[]>(manifest.tables.find((t) => t.id === id)?.file ?? '')
const cell = (row: Row, id: string): string => String(row.values[id] ?? '').trim()

/** The register with the most rows per model on this file, which is
 *  the one whose hull chapter has finishes to choose between. Found by
 *  measuring rather than named. */
function deepest(): { table: Table; model: string; rows: Row[] } {
  let best: { table: Table; model: string; rows: Row[] } | null = null
  for (const table of tables.filter((t) => t.kind === 'boat')) {
    const levels = table.hierarchy ?? []
    if (levels.length < 3) continue
    const groups = new Map<string, Row[]>()
    for (const row of rowsOf(table.id)) {
      const key = levels
        .slice(0, -1)
        .map((f) => cell(row, f))
        .join(' ▸ ')
      groups.set(key, [...(groups.get(key) ?? []), row])
    }
    for (const [key, rows] of groups) {
      if (!best || rows.length > best.rows.length) best = { table, model: key, rows }
    }
  }
  expect(best, 'no boat register on this file groups to three levels').not.toBeNull()
  return best!
}

const deep = deepest()
const MODEL = deep.model.slice(deep.model.lastIndexOf('▸') + 1).trim()
const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Sign in, load the file, choose the deepest model and start the
 *  quote — arriving on the configurator at its own address. */
async function startAQuote(page: Page): Promise<void> {
  await throughTheDoor(page)
  await page.goto(`/quote/new?brand=${deep.table.id}`)
  await expect(page.getByTestId('picker-counts')).toBeVisible()

  await page.getByLabel(/Find a model/).fill(MODEL)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(MODEL)}\\b`) })
    .first()
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()

  await panel
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()

  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('configurator')).toBeVisible()
}

/** The document's own total, off the running price the configurator
 *  draws. `data` carries the value verbatim, which is how a test can
 *  read a figure rather than parse a string. */
async function totalOnTheBuild(page: Page): Promise<number> {
  const figure = page.getByTestId('running-total').locator('data.ui-price')
  await expect(figure).toHaveCount(1)
  return Number(await figure.getAttribute('value'))
}

/** Raise the rung decision from the build, and arrive on the sheet. */
async function raiseTheRung(page: Page): Promise<string> {
  const other = page.getByRole('button', { name: /^See what .* does$/ }).first()
  await expect(other).toBeVisible()
  const label = (await other.innerText()).replace(/^See what /, '').replace(/ does$/, '')
  await other.click()
  await expect(page).toHaveURL(/\/cascade\?/)
  await expect(page.getByTestId('cascade')).toBeVisible()
  return label
}

/** The write-behind, waited out, for the one case that reloads. */
const WRITE_BEHIND_MS = 300
const written = (page: Page): Promise<void> => page.waitForTimeout(WRITE_BEHIND_MS * 2)

test('the build raises it at its own address, with the pick and the chapter in it', async ({
  page,
}) => {
  await startAQuote(page)
  const rung = await raiseTheRung(page)

  /* THE ADDRESS IS THE STATE. Both facts are in it: what was picked
     and where it was picked. */
  expect(page.url()).toContain('fix=level%3A')
  expect(page.url()).toContain('from=')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(rung)
})

test('it tells a causal story: every card is headed by a reason, and owns its rows', async ({
  page,
}) => {
  await startAQuote(page)
  await raiseTheRung(page)

  const causes = page.locator('.csc-cause')
  expect(await causes.count()).toBeGreaterThan(0)
  for (const cause of await causes.all()) {
    /* NOT ONE HEADING IS EMPTY, and not one card is a list with no
       reason over it. That is the whole difference from the sheet
       this one was drawn against. */
    const why = await cause.locator('.csc-cause__why').innerText()
    expect(why.trim().length).toBeGreaterThan(0)
    expect(await cause.locator('.csc-row').count()).toBeGreaterThan(0)
  }

  /* and the reasons really differ from one another — a sheet where
     every row reads one sentence is the failure §5 counts */
  const said = await page.locator('.csc-cause__why').allInnerTexts()
  expect(new Set(said.map((s) => s.trim())).size).toBe(said.length)
})

test('every row is priced, and the whole change has one figure', async ({ page }) => {
  await startAQuote(page)
  await raiseTheRung(page)

  for (const row of await page.locator('.csc-row').all()) {
    const money = await row.locator('.csc-row__money').innerText()
    expect(money.trim().length).toBeGreaterThan(0)
  }

  const decision = page.getByTestId('decision')
  await expect(decision).toContainText('Change to the total')
  await expect(decision).toContainText(/today/)
  await expect(decision.locator('.csc-arith__fig')).toContainText(/[+−]?\$/)
})

test('declining leaves the quote exactly as it was, and lands on the chapter it came from', async ({
  page,
}) => {
  await startAQuote(page)
  const before = await totalOnTheBuild(page)
  await page.getByRole('button', { name: /^01 The hull/ }).click()
  await raiseTheRung(page)

  await page.getByRole('button', { name: 'Leave it as it is' }).click()
  await expect(page.getByTestId('configurator')).toBeVisible()
  await expect(page).toHaveURL(/at=hull/)
  expect(await totalOnTheBuild(page)).toBe(before)
})

test('it is a route and not a modal state: Back, a refresh and a typed address all behave', async ({
  page,
}) => {
  await startAQuote(page)
  const build = page.url()
  await raiseTheRung(page)
  const sheet = page.url()

  /* BACK LEAVES IT, because it was a navigation and not a layer */
  await page.goBack()
  await expect(page.getByTestId('configurator')).toBeVisible()
  expect(page.url()).toBe(build)

  /* A REFRESH ON THE SHEET IS STILL THE SHEET, with the same decision
     in front of it — the teardown's finding, and the reason the pick
     is in the address rather than in a component. */
  await page.goto(sheet)
  await written(page)
  await page.reload()
  await expect(page.getByTestId('cascade')).toBeVisible()
  await expect(page.locator('.csc-cause').first()).toBeVisible()
})

test('accepting moves the document to the figure it promised, and the way back is on the screen', async ({
  page,
}) => {
  await startAQuote(page)
  const before = await totalOnTheBuild(page)
  await raiseTheRung(page)

  /* WHAT THE SHEET PROMISES, read off the sheet itself */
  const said = await page.locator('.csc-arith__say').innerText()
  const promised = Number(
    /·\s*−?\$([\d,]+(?:\.\d+)?)\s*if you accept/.exec(said)?.[1]?.replace(/,/g, '') ?? 'x',
  )
  expect(Number.isFinite(promised)).toBe(true)
  expect(promised).not.toBe(before)

  await page.getByRole('button', { name: /^Price it at / }).click()
  await expect(page.getByTestId('decision')).toContainText('The total now')
  /* the document's own total, after the act */
  const now = page.getByTestId('decision').locator('data.ui-price')
  expect(Number(await now.getAttribute('value'))).toBe(promised)

  /* AND THE WAY BACK STANDS HERE, not in a toast that has gone */
  await page.getByRole('button', { name: 'Undo' }).click()
  expect(Number(await now.getAttribute('value'))).toBe(before)
  await page.getByRole('button', { name: 'Put it back' }).click()
  expect(Number(await now.getAttribute('value'))).toBe(promised)

  await page.getByRole('button', { name: 'Back to the build' }).click()
  await expect(page.getByTestId('configurator')).toBeVisible()
  expect(await totalOnTheBuild(page)).toBe(promised)
})

test('an address the document has moved past says so, and offers the way back', async ({
  page,
}) => {
  await startAQuote(page)
  const build = page.url()

  /* THE RUNG THIS QUOTE IS ALREADY ON, typed as a link somebody
     shared — which is the case `cars/porsche-feasibility-direct.png`
     answers with a redirect to "Select a Model Series". */
  const here = await page.locator('.cfg-rung__on').innerText()
  const key = here.split('\n')[0].trim().toLowerCase()
  /* A TYPED ADDRESS IS A COLD PAGE LOAD, and a document written 200 ms
     ago is still owed to the database — `src/state/quotes.ts` coalesces
     writes on a 300 ms interval and says why. A test that reloaded
     inside that window would be asserting the timer. */
  await written(page)
  await page.goto(`${build}/cascade?fix=level%3A${key}&from=hull`)
  await expect(page.getByTestId('cascade')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('This quote has moved on.')
  await expect(page.getByTestId('cascade')).toContainText('already priced at')
  await page.getByRole('button', { name: 'Back to the build' }).click()
  await expect(page.getByTestId('configurator')).toBeVisible()
})

test('an address that names no decision says that instead of drawing a sheet', async ({ page }) => {
  await startAQuote(page)
  const build = page.url()
  await written(page)
  await page.goto(`${build}/cascade?fix=not-a-decision&from=hull`)
  await expect(page.getByTestId('cascade')).toContainText('This address names no decision')
})

test('a finish that moves the total is decided here, and one that does not is not', async ({
  page,
}) => {
  await startAQuote(page)
  await page.getByRole('button', { name: /^01 The hull/ }).click()

  /* A FINISH THAT COSTS SOMETHING RAISES THE SHEET. A finish row's
     accessible name is its material, its colourway and what the press
     would move the total by, so both rows below are found by what the
     screen says about them rather than by position. */
  const costs = page.getByRole('button', { name: /, \+\$[\d,]+$/ }).first()
  await expect(costs).toBeVisible()
  await costs.click()
  await expect(page).toHaveURL(/fix=finish%3A/)
  await expect(page.getByTestId('cascade')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('The hull becomes')
  await page.getByRole('button', { name: 'Leave it as it is' }).click()
  await expect(page.getByTestId('configurator')).toBeVisible()

  /* AND ONE THAT MOVES NOTHING IS APPLIED IN PLACE, because a sheet
     that opens to say "nothing happens" is a full stop in the middle
     of somebody's work. `aria-pressed="false"` is what keeps this off
     the finish already on the quote, which also moves nothing and
     would refuse rather than act. */
  const free = page
    .getByRole('button', { name: /, no change to the total$/, pressed: false })
    .first()
  await expect(free).toBeVisible()
  await free.click()
  await expect(page).not.toHaveURL(/cascade/)
  await expect(page.getByTestId('last-step')).toBeVisible()
})

test('no cost column reaches this screen', async ({ page }) => {
  await startAQuote(page)
  await raiseTheRung(page)
  const said = await page.getByTestId('cascade').innerText()
  /* the manifest names 139 of them; these are the ones whose spelling
     could not be ordinary English, which is the same test
     tools/check.ts applies to the source */
  for (const name of [
    'Landed Hull Cost',
    'Total Nett CTD',
    'Nett Price',
    'Dealer List Price',
    'Base Cost',
    'Landed CTD',
    'Total PD Allowance',
  ]) {
    expect(said, `${name} is on a customer-facing surface`).not.toContain(name)
  }
})

test('the sheet holds its shape at this width: nothing overflows and the act is in the flow', async ({
  page,
}) => {
  await startAQuote(page)
  await raiseTheRung(page)

  /* NO HORIZONTAL SCROLL AT ANY WIDTH — the one geometry failure a
     reflow ladder is written to prevent. */
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)

  /* THE PRIMARY ACT IS NEVER A FLOATING BOTTOM BAR. It sits in the
     page, under the arithmetic it performs, so scrolling moves it. */
  const position = await page
    .getByTestId('decision')
    .evaluate((el) => globalThis.getComputedStyle(el).position)
  expect(position).toBe('static')
})
