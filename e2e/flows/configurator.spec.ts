import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { acrossTheBar } from '../fold'
import { cameToRest, cardName, nameTheCustomer, pickAndStart, priceWhatWaits } from '../mint'
import { decodePng } from '../rulers/measure/pixels'

/* ============================================================
   THE CONFIGURATOR, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   NOTHING HERE IS TYPED INTO AN ASSERTION. Every figure is walked out
   of `data/northside/` — the same files the browser fetches — and then
   looked for on the screen, so this fails when the screen drifts from
   the file, when the file drifts from the screen, and when a chapter
   does not arrive at all, which is the case no unit test can see.

   AND IT WALKS IN THROUGH THE FRONT DOOR. There is no way to seed a
   quote: a document only exists because somebody pressed the act on
   the picker, and that press is the join between the two screens. So
   every case below signs in, loads the file, chooses a hull and starts
   the quote — which is also why this file is the proof that the two
   screens are joined at all.

   IT RUNS UNDER ALL SIX VIEWPORT PROJECTS, so every assertion is one
   that has to hold in a hand as well as on a desk. Under 1200px the
   stage stops being a column and becomes a band, and under 640 — or in
   any window shorter than 700 — the rail comes before it; that is the
   screen's own ladder, written in `configurator.css`. Nothing here
   asserts a position: the reflow is the rulers' job.

   THE RULERS REACH THIS SCREEN TOO, since 2026-09-18: `e2e/routes.ts`
   gained the `with-a-document` mode, which walks the same front door
   and presses the same act, so contrast, overlap, cut and ramp all
   open a real build. What they cannot see is a page that has been
   SCROLLED — the two sticky bars only meet once it moves — so that
   geometry is measured here, at the widths where both bars stick.
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
 *  measuring rather than named: the day the file changes, this finds
 *  whatever now answers the question. */
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
/** the model's own name, which is the last level of its grouping key */
const MODEL = deep.model.slice(deep.model.lastIndexOf('▸') + 1).trim()

const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Sign in, load the file, choose a model and start the quote —
 * arriving on the configurator at its own address. The deepest model on
 * the sheet unless a case names the register and model it needs.
 */
async function startAQuote(
  page: Page,
  on: { table: string; model: string } = { table: deep.table.id, model: MODEL },
): Promise<void> {
  await throughTheDoor(page)
  await page.goto(`/quote/new?brand=${on.table}`)
  await expect(page.getByTestId('picker-counts')).toBeVisible()

  await page.getByLabel(/Find a model/).fill(on.model)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(cardName(on.table, on.model))}\\b`) })
    .first()
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  /* a model built in more than one material asks that question first,
     and the act comes live the moment it is answered; a model of one
     material and several colourways asks the colourway instead */
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()
  const act = panel.getByRole('button', { name: /Start the quote|Open the draft already standing/ })
  if ((await act.getAttribute('aria-disabled')) === 'true') {
    /* the first colour, whether the decode names it or not */
    await panel.locator('.picker-chips--codes button').first().click()
  }
  await act.click()

  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('configurator')).toBeVisible()
}

/**
 * THE WRITE-BEHIND, WAITED OUT — for the one case that then RELOADS.
 *
 * `src/state/quotes.ts` coalesces writes on a 300 ms interval, and its
 * header argues for it: typing a customer's name must be one write and
 * not one per keystroke. Nothing in the app loses by it, because the
 * picker reaches this screen through the router and never through a
 * page load — the document is in memory the whole way. A TEST that
 * reloads inside that window is racing a promise it cannot see, and
 * what it would then be asserting is the timer rather than the screen.
 *
 * So the one case that really is about surviving a reload waits it out
 * and says so. Every other case navigates the way a person does: by
 * pressing the chapter it wants.
 */
const WRITE_BEHIND_MS = 300
async function written(page: Page): Promise<void> {
  await page.waitForTimeout(WRITE_BEHIND_MS * 2)
}

/**
 * A CHAPTER PRESSED OPEN HAS ARRIVED. Since 2026-09-29 a chapter pressed open low in the window
 * is brought up to the hand once the chapter it replaced has folded (`useBroughtIn`), so a case
 * that opens one and then measures where something in it stands waits for the window to have
 * stood still for as long as that move takes to start — rather than measuring the move.
 */
async function arrived(page: Page): Promise<void> {
  let last = await page.evaluate(() => scrollY)
  await expect
    .poll(async () => {
      await page.waitForTimeout(300)
      const now = await page.evaluate(() => scrollY)
      const same = now === last
      last = now
      return same
    })
    .toBe(true)
}

test('the picker opens the configurator on the document it just wrote', async ({ page }) => {
  await startAQuote(page)
  /* the reference the day stamped, on the masthead of the screen the
     act navigated to. NOT `getByRole('banner')`: a `header` scoped
     inside `main` is not a banner, and asserting on a role the markup
     does not carry is a test that starts passing for the wrong reason
     the day somebody gives it one. */
  await expect(page.getByTestId('configurator')).toContainText(/\d{8}-\d{2}/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(deep.table.name.split(' ')[0])
})

test('the running price is on screen from the first paint and never counts up', async ({
  page,
}) => {
  await startAQuote(page)
  const total = page.getByTestId('running-total')
  await expect(total).toBeVisible()
  await expect(total).toContainText('$')

  /* IT IS A `PriceFigure` AND NOT A COUNTER. `data` carries the value
     verbatim, which is how a test can tell a set figure from an
     animated one: a NumberFlow figure is a shadow root of moving
     digits and has no such attribute. */
  const figure = total.locator('data.ui-price')
  await expect(figure).toHaveCount(1)
  const before = await figure.getAttribute('value')
  expect(Number(before)).toBeGreaterThan(0)
  await page.waitForTimeout(400)
  expect(await figure.getAttribute('value')).toBe(before)
})

test('every chapter states its own answer while it is shut', async ({ page }) => {
  await startAQuote(page)
  /* the decisions the price file can carry, and the finale; whom it is for is the bar's */
  for (const name of ['The hull', 'Motor', 'The summary']) {
    await expect(
      page.getByRole('button', { name: new RegExp(escapeRe(name)) }).first(),
    ).toBeVisible()
  }
  const heads = page.locator('.cfg-head__press')
  expect(await heads.count()).toBeGreaterThanOrEqual(4)
  await expect(page.getByRole('button', { name: /^Who it is for/ })).toHaveCount(0)
  /* and not one of them is empty: a shut head that says nothing is the
     thing this pattern exists to replace */
  for (const fact of await page.locator('.cfg-head__fact').allInnerTexts()) {
    expect(fact.trim().length).toBeGreaterThan(0)
  }
})

test('the search reaches every chapter at once, and past each shortlist', async ({ page }) => {
  await startAQuote(page)
  const field = page.getByRole('searchbox')
  await field.fill('battery')

  const said = page.locator('#cfg-find-said')
  await expect(said).toContainText(/\d found/)
  const text = (await said.innerText()).replace(/,/g, '')
  const hits = Number(/(\d+) found/.exec(text)?.[1])
  const beyond = Number(/(\d+) of them not made for this boat/.exec(text)?.[1] ?? '0')
  /* THE TWO FIGURES HAVE TO BE COMPARABLE. They were not: the screen
     counted the rows it DREW and then said how many of them were past
     the narrowing, a figure computed over the whole selection. */
  expect(hits).toBeGreaterThan(0)
  expect(beyond).toBeLessThanOrEqual(hits)

  /* A ROW THE PAIRINGS LEFT OUT STAYS VISIBLE AND STAYS LIVE. */
  const outside = page.locator('.cfg-opt[data-outside]').first()
  await expect(outside).toBeVisible()
  await expect(outside.getByRole('button').first()).not.toHaveAttribute('aria-disabled', 'true')
  await expect(page.locator('.cfg-shared, .cfg-opt__why').first()).toContainText(
    /Nothing is wrong with it|Nobody has picked it/,
  )

  /* and a chapter the words did not reach says so rather than
     disappearing */
  await field.fill('zzzzqq')
  await expect(said).toContainText('Nothing on this quote is called that.')
  await expect(page.locator('.cfg-head__fact').first()).toContainText('nothing here matches')
})

test('a pick moves the engine’s total, and the way back is on the screen', async ({ page }) => {
  await startAQuote(page)
  const figure = page.getByTestId('running-total').locator('data.ui-price')
  const before = Number(await figure.getAttribute('value'))

  /* THE CHAPTER IS OPENED FIRST, because the screen opens on the first
     decision still outstanding — and on a hull whose starred motor,
     starred trailer and parts are all already on the document there is
     none, so it opens on 01, where the rows are the hull's own
     finishes rather than options. */
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  /* a motor with a held picture is the kit's option tile and a part is a row: either way, the
     press is the button that says whether it is on the quote */
  const row = page.locator('.cfg-opt button[aria-pressed="false"]').first()
  await expect(row).toBeVisible()
  await row.click()

  const step = page.getByTestId('last-step')
  await expect(step).toBeVisible()
  await expect(step).toContainText('put on the quote')

  const after = Number(await figure.getAttribute('value'))
  expect(after).not.toBe(before)

  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(step).toContainText('off the quote again')
  expect(Number(await figure.getAttribute('value'))).toBe(before)

  /* and the way back from the way back */
  await step.getByRole('button', { name: 'Put it back' }).click()
  expect(Number(await figure.getAttribute('value'))).toBe(after)
})

test('the chapter is an address that survives a reload and a shared link', async ({ page }) => {
  await startAQuote(page)
  const url = page.url()
  await page.getByRole('button', { name: /^01 The hull/ }).click()
  await expect(page).toHaveURL(/at=hull/)

  await written(page)
  await page.reload()
  await expect(page.getByRole('button', { name: /^01 The hull/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  )

  /* A CHAPTER THAT MATCHES NOTHING OPENS THE FIRST ONE WITH A DECISION
     LEFT IN IT, rather than a screen with every card shut — the
     sweep's own counted failure is a configurator whose moved chapter
     address returns an error page. */
  await page.goto(`${url}?at=nothing-like-this`)
  /* THE RUNNING TOTAL AND NOT THE SCREEN'S OWN NAME, because the
     screen is also what draws "no quote is filed at this address" —
     and for the first few hundred milliseconds of a cold load that is
     honestly what it does not yet know. The total exists only once a
     document is really in hand. */
  await expect(page.getByTestId('running-total')).toBeVisible()
  await expect(page.locator('.cfg-head__press[aria-expanded="true"]')).toHaveCount(1)
})

test('an unaddressed quote is refused, with the engine’s own sentence', async ({ page }) => {
  await startAQuote(page)
  await page.getByRole('button', { name: /The summary/ }).click()
  await priceWhatWaits(page)
  const act = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(act).toBeVisible()
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('configurator')).toContainText(
    'No customer’s name is on this quote yet, so it cannot be given.',
  )
  /* SAID ONCE, AND ANSWERED WHERE IT IS SAID (the refine round, 2026-10-21): the card does not
     say "nobody named yet" over the refusal; it offers the way to the name */
  await expect(page.getByTestId('configurator')).not.toContainText(/nobody named yet/)
  /* and the way to it is the bar's: the customer's details open under their cell */
  await page.locator('.cfg-hand').getByRole('button', { name: 'Add their name' }).click()
  const panel = page.getByRole('dialog', { name: 'The customer' })
  await expect(panel).toBeVisible()
  await expect(panel.getByLabel(/Who the quote is for/)).toBeFocused()
})

/* THE COMPONENT CRITIQUE'S MAJOR 10, walked in the bar (the owner, 2026-10-30: "customer details
   i live in the top bar"): a name typed and the panel left without pressing its act. The name
   was thrown away once and the finale said the quote was addressed to nobody; leaving the panel
   is the press now, said in the toast with its way back. */
test('a name typed and left goes on the quote when its panel closes', async ({ page }) => {
  await startAQuote(page)
  const bar = page.locator('.cfg-mast')
  await bar.getByRole('button', { name: 'Name the customer' }).click()
  const panel = page.getByRole('dialog', { name: 'The customer' })
  await panel.getByLabel(/Who the quote is for/).click()
  await page.keyboard.type('R. Kelleher')
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()

  await expect(page.getByTestId('last-step')).toContainText('For R. Kelleher')
  await expect(bar).toContainText('R. Kelleher')
  await page.getByRole('button', { name: /The summary/ }).click()
  await expect(page.getByTestId('configurator')).not.toContainText(
    'No customer’s name is on this quote',
  )
  /* the kit's price is chosen on Prices, so the only thing that stopped the give was the name */
  await priceWhatWaits(page)
  const act = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(act).toBeVisible()
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')

  /* it is on the document, not only on the screen */
  await written(page)
  await page.reload()
  await expect(page.locator('.cfg-mast')).toContainText('R. Kelleher')
})

/* THE SECOND VERIFY ROUND (2026-09-29) found a name typed the moment its chapter opened landing
   in a body folded to a sliver. The name is the bar's panel now, which opens whole: typed the
   moment it opens, its act is pressed at once. Walked on the ADV7, where it was found. */
test('a name typed the moment its panel opens goes on at the first press', async ({ page }) => {
  await startAQuote(page, { table: 'boat_highfield', model: 'ADV7' })
  await page.locator('.cfg-mast').getByRole('button', { name: 'Name the customer' }).click()
  const panel = page.getByRole('dialog', { name: 'The customer' })
  await panel.getByLabel(/Who the quote is for/).fill('R. Kelleher')
  await panel.getByRole('button', { name: 'Put their name on it' }).click({ timeout: 15_000 })
  await expect(page.getByTestId('last-step')).toContainText('R. Kelleher')
})

test('addressing it, issuing it, and then every edit refusing', async ({ page }) => {
  await startAQuote(page)

  await nameTheCustomer(page, 'R. Kelleher')
  await expect(page.getByTestId('last-step')).toContainText('R. Kelleher')

  await page.getByRole('button', { name: /The summary/ }).click()

  await priceWhatWaits(page)
  const act = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  await act.click()
  await expect(page.getByTestId('given-seal')).toBeVisible()

  /* AN ISSUED QUOTE REFUSES AN EDIT WITH A SENTENCE, and it is the
     engine's line that makes it true rather than a hidden control. Back to the build from the
     summary first, which at a desk stands over it. */
  await page.getByRole('button', { name: 'Back to the build' }).click()
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  const row = page.locator('.cfg-opt button[aria-pressed]').first()
  await expect(row).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('configurator')).toContainText(
    'so nothing can go back on it. Make a new version to change it.',
  )

  /* AND IT IS SAID ONCE ABOVE EACH LIST, NEVER ONCE PER ROW. Measured
     on the built screen on 2026-09-17: five copies on one open
     chapter, four of them 58.5px tall wedged BETWEEN rows, so each
     read as though it belonged to the row beneath it. The count of
     copies must not move with the count of rows, which is the whole
     claim — so both are read and compared here rather than a number
     being typed in. */
  /* the build's own controls: below a desk the summary is always the page's end (2026-10-31), and
     its "Email it" is refused for its own reason, the customer's line holding no address */
  const refused = page.locator('.cfg-edit button[aria-disabled="true"]')
  const copies = page.locator('.cfg-shut')
  expect(await refused.count()).toBeGreaterThan(await copies.count())
  /* and not one refused control lost its reason: `refusedBy` points
     `aria-describedby` at the one sentence, so a reader still hears
     it on the control */
  for (const control of await refused.all()) {
    const ids = ((await control.getAttribute('aria-describedby')) ?? '')
      .split(/\s+/)
      .filter(Boolean)
    expect(ids.length, 'a refused control with no reason').toBeGreaterThan(0)
    let heard = false
    for (const id of ids) {
      /* BY ATTRIBUTE AND NOT BY `#id`. React's own ids are `_r_22_`
         and a CSS id selector will not take one; `CSS.escape` is a
         browser global and this half of the test runs in node. */
      const said = await page.locator(`[id="${id}"]`).innerText()
      if (said.includes('given to the customer')) heard = true
    }
    expect(heard, 'a refused control whose description is not the refusal').toBe(true)
  }
})

/* A GIVEN QUOTE'S MOTOR TILES SAY WHAT THE CHANGE WOULD BE, NOT EACH MOTOR'S WHOLE PRICE (the
   refine round, 2026-10-21, blocker): with the F115LB on, a draft read "F90LB −$2,337" and the
   same quote given read "+$14,330", as if the customer would carry two motors. Every figure on
   the chapter reads the same before the quote is given and after. */
test('a given quote’s motors are priced as the change they would be, as the draft priced them', async ({
  page,
}) => {
  await startAQuote(page)
  /* THE KIT'S PRICE IS CHOSEN FIRST (built-critique-m3.md, blocker 1): a quote carrying a kit
     whose price Northside has not chosen is not given, and choosing it moves what each motor's
     change would be, since its kit changes with it — so the draft is read once it is chosen */
  await nameTheCustomer(page, 'R. Kelleher')
  await page.getByRole('button', { name: /The summary/ }).click()
  await priceWhatWaits(page)
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  const figures = page.locator('[data-chapter="motor"] .cfg-opt .ui-price')
  const read = async (): Promise<string[]> => {
    if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
    await expect(figures.first()).toBeVisible()
    return figures.allInnerTexts()
  }
  const draft = await read()
  /* a quote whose boat carries a motor, with others offered in its place: the finding's case */
  const on = page.locator('[data-chapter="motor"] .cfg-opt button[aria-pressed="true"]')
  await expect(on).toHaveCount(1)
  expect(draft.length).toBeGreaterThan(1)

  const finale = page.getByRole('button', { name: /^The summary/ })
  if ((await finale.getAttribute('aria-expanded')) !== 'true') await finale.click()
  await page.getByRole('button', { name: 'Give it to the customer' }).click()
  await expect(page.getByTestId('given-seal')).toBeVisible()

  expect(await read()).toEqual(draft)
})

/* ============================================================
   THE ACT OF SELLING LEADS TO THE THING YOU HAND OVER.

   This is the seam a unit test cannot prove: the finale calls a
   callback and the ROUTE decides where it goes. Until 2026-09-18 it
   went nowhere and said so in a sentence that had stopped being true
   — the document is built at `/quote/$id/document` — so issuing a
   quote correctly left a dealer on a read-only screen whose only
   onward control was `Make a new version`.
   ============================================================ */
test('issuing it opens the sheet you hand over', async ({ page }) => {
  await startAQuote(page)

  await nameTheCustomer(page, 'R. Kelleher')
  await page.getByRole('button', { name: /The summary/ }).click()
  await priceWhatWaits(page)

  /* A DRAFT HAS NO SHEET TO OPEN — a document renders from FROZEN
     lines and a draft's are still moving — so the control appears
     when there is something to open rather than standing refused. */
  await expect(page.getByRole('button', { name: 'Open the printed quote' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Give it to the customer' }).click()
  const open = page.getByRole('button', { name: 'Open the printed quote' })
  /* one, the finale's, where the press was: the masthead's own copy grew the head by a
     row under the pointer (the component critique, 2026-09-28, major 8) */
  await expect(open).toHaveCount(1)
  await open.click()

  await expect(page).toHaveURL(/\/quote\/[^/]+\/document$/, { timeout: 15_000 })
  await expect(page.getByRole('button', { name: /Back to the build/ })).toBeVisible()
})

/* ============================================================
   GIVING IT IS STAMPED, AND NOTHING MOVES UNDER THE PRESS (the
   component critique, 2026-09-28, major 8).

   "Pressing 'Give it to the customer' turns the masthead's dot green
   and prints a step line … The masthead also grows an 'Open the
   document' row, so the page drops 28 px under the pointer at the
   press. There is no authored moment." Measured on the Stacer 519
   before: the head 160.8px as a draft and 188.8 given at 1440, 176.7
   and 219.5 at 390. Now the head is read before and after the press
   and must not change by a pixel, the finale's head must stand where
   it stood, and the seal must be the authored stamp — lottie-web's
   drawing in the kit's inks, never the black the timeline carries.
   ============================================================ */
async function toTheFinale(page: Page): Promise<void> {
  await startAQuote(page)
  /* the kit's price chosen on Prices first, so the step standing at the give is the name's, as
     it was before a quote with an unchosen price was refused (built-critique-m3.md, blocker 1) */
  /* the name is the bar's, named before the summary rises over the bar at a desk */
  await nameTheCustomer(page, 'R. Kelleher')
  await page.getByRole('button', { name: /The summary/ }).click()
  await priceWhatWaits(page)
  await arrived(page)
}

const standing = (page: Page) =>
  page.evaluate(() => ({
    mast: document.querySelector('.cfg-mast')!.getBoundingClientRect().height,
    finale: [...document.querySelectorAll('.cfg-head__press')]
      .find((b) => /The summary/.test(b.textContent ?? ''))!
      .getBoundingClientRect().top,
  }))

/** Where things stand once the finale has finished opening: two reads a moment apart agree. */
async function settled(page: Page): Promise<{ mast: number; finale: number }> {
  let last = await standing(page)
  await expect
    .poll(async () => {
      await page.waitForTimeout(150)
      const now = await standing(page)
      const same = now.mast === last.mast && now.finale === last.finale
      last = now
      return same
    })
    .toBe(true)
  return last
}

test('giving it is stamped, and the head and the finale stand still under the press', async ({
  page,
}) => {
  await toTheFinale(page)
  const give = page.getByRole('button', { name: 'Give it to the customer' })
  await give.scrollIntoViewIfNeeded()
  await expect(give).not.toHaveAttribute('aria-disabled', 'true')
  const before = await settled(page)

  /* THE MOMENT, READ EVERY FRAME from the press to its end (the components critique,
     2026-09-29, major 3): where both totals stand and what they say, and which of the
     handover's own animations run. The totals never move and never change; the moment is
     authored — the leaf, the words, the way on — and it is over. */
  await page.evaluate(() => {
    const w = window as unknown as {
      moment: { run: boolean; tops: number[][]; said: Set<string>; played: Set<string> }
    }
    w.moment = { run: true, tops: [[], []], said: new Set(), played: new Set() }
    const read = (): void => {
      if (!w.moment.run) return
      /* the masthead's total and the card's: where each stands and what they say */
      const figures = ['[data-testid="running-total"] data', '.cfg-hand__fig data'].map(
        (selector) => document.querySelector(selector),
      )
      figures.forEach((el, i) => {
        if (el) w.moment.tops[i]!.push(el.getBoundingClientRect().top)
      })
      w.moment.said.add(figures.map((el) => el?.textContent ?? 'gone').join(' '))
      for (const running of document.getAnimations()) {
        if (running.playState === 'running' && 'animationName' in running)
          w.moment.played.add(
            String((running as unknown as { animationName: string }).animationName),
          )
      }
      requestAnimationFrame(read)
    }
    requestAnimationFrame(read)
  })
  await give.click()
  await expect(page.getByTestId('given-seal')).toBeVisible()
  const after = await standing(page)
  expect(after.mast, 'the head grew at the press').toBeCloseTo(before.mast, 0)
  expect(Math.abs(after.finale - before.finale), 'the finale moved under the press').toBeLessThan(
    1.5,
  )
  await expect(page.locator('.cfg-mast').getByRole('button')).toHaveCount(0)
  await page.waitForTimeout(1500)
  const moment = await page.evaluate(() => {
    const w = window as unknown as {
      moment: { run: boolean; tops: number[][]; said: Set<string>; played: Set<string> }
    }
    w.moment.run = false
    return {
      moved: w.moment.tops.map((tops) => Math.max(...tops) - Math.min(...tops)),
      said: [...w.moment.said],
      played: [...w.moment.played],
      still: document
        .getAnimations()
        .filter((a) => a.playState === 'running')
        .map((a) => (a as unknown as { animationName?: string }).animationName ?? '')
        .filter((name) => name.startsWith('cfg-')),
    }
  })
  expect(moment.said, 'a total changed while the quote was given').toHaveLength(1)
  for (const moved of moment.moved) {
    expect(moved, 'a total moved while the quote was given').toBeLessThan(0.5)
  }
  expect(moment.played).toEqual(expect.arrayContaining(['cfg-leaf', 'cfg-word', 'cfg-arrive']))
  expect(moment.still, 'the moment is still running after a second and a half').toEqual([])
  /* and it ends on the way to the paper, which holds the keyboard */
  await expect(page.getByRole('button', { name: 'Open the printed quote' })).toBeFocused()
  await expect(page.getByRole('button', { name: 'Open the printed quote' })).toBeInViewport()

  /* the stamp, played by the authored timeline, standing at its last frame in the kit's inks */
  const seal = page.locator('.cfg-seal')
  await expect(seal).toHaveAttribute('data-drawn', 'stamp')
  await expect(seal.locator('.cfg-seal__stage svg')).toHaveCount(1)
  await expect(seal.locator('.cfg-seal__still')).toHaveCount(0)
  await expect
    .poll(() =>
      seal.evaluate((el) => {
        const rim = el.querySelector('.cfg-seal__rim path')
        const tick = el.querySelector('.cfg-seal__tick path')
        return rim && tick ? [getComputedStyle(rim).fill, getComputedStyle(tick).stroke] : null
      }),
    )
    .toEqual([
      expect.not.stringMatching(/^rgb\(0, 0, 0\)$/),
      expect.not.stringMatching(/^rgb\(0, 0, 0\)$/),
    ])
})

test.describe('under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the seal is drawn still and its player is never fetched', async ({ page }) => {
    const fetched: string[] = []
    page.on('request', (request) => fetched.push(request.url()))
    await toTheFinale(page)
    const give = page.getByRole('button', { name: 'Give it to the customer' })
    await give.scrollIntoViewIfNeeded()
    const before = await settled(page)
    await give.click()
    const seal = page.locator('.cfg-seal')
    await expect(seal).toHaveAttribute('data-drawn', 'still')
    await expect(seal.locator('.cfg-seal__still')).toBeVisible()
    await expect(seal.locator('.cfg-seal__stage svg')).toHaveCount(0)
    expect((await standing(page)).mast).toBeCloseTo(before.mast, 0)
    expect(fetched.filter((url) => /\/stamp-[^/]*\.js$/.test(url))).toEqual([])

    /* A CLEAN CUT TO THE SAME END STATE: nothing of the handover runs, the card is the leaf
       at once, and the way to the paper is there and holds the keyboard */
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === 'running')
        .map((a) => (a as unknown as { animationName?: string }).animationName ?? '')
        .filter((name) => name.startsWith('cfg-')),
    )
    expect(running).toEqual([])
    expect(
      await page
        .getByTestId('given-seal')
        .evaluate((el) => [getComputedStyle(el).clipPath, getComputedStyle(el).opacity]),
    ).toEqual(['none', '1'])
    const onward = page.getByRole('button', { name: 'Open the printed quote' })
    await expect(onward).toBeFocused()
    expect(
      await onward.evaluate((el) => getComputedStyle(el.parentElement!.parentElement!).opacity),
    ).toBe('1')
  })
})

/* ============================================================
   AN ACT THAT CANNOT WORK IS NEVER OFFERED.

   built-critique-m2-close-2.md, major 2: "After `Give it to the
   customer` the build pins '20260924-01 is issued · Undo' … Pressing
   it raises a banner that says 'nothing can go back on it'." Issuing
   has no way back, so its step is a sentence with nothing beside it.
   The way on is a new version — and on 2026-09-24 that opened under
   the given quote's step and refusal, because the route keeps this
   screen and hands it the new id, and its Undo answered "There is
   nothing to go back to on this quote." So the new version is walked
   too, and its own Undo is pressed and has to work.
   ============================================================ */
test('a given quote offers no way back, and its new version starts clean with an Undo that works', async ({
  page,
}) => {
  await startAQuote(page)
  const build = page.getByTestId('configurator')
  const step = page.getByTestId('last-step')

  await nameTheCustomer(page, 'R. Kelleher')
  await page.getByRole('button', { name: /The summary/ }).click()
  await priceWhatWaits(page)
  await page.getByRole('button', { name: 'Give it to the customer' }).click()

  /* the seal says it, and the toast that offered the name's Undo is taken away with it: an
     act that cannot work is never on the screen, in the build or in the corner */
  await expect(page.getByTestId('given-seal')).toContainText('Given to R. Kelleher')
  await expect(step).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^(Undo|Put it back)$/ })).toHaveCount(0)
  await expect(build.getByRole('alert')).toHaveCount(0)

  const given = /\/quote\/([^/?]+)/.exec(page.url())?.[1] ?? ''
  expect(given).not.toBe('')
  await page.getByRole('button', { name: 'Make a new version' }).click()
  await page.waitForURL((url) => {
    const id = /^\/quote\/([^/]+)$/.exec(url.pathname)?.[1]
    return id !== undefined && id !== given
  })
  await expect(page.locator('.cfg-eyebrow').first()).toContainText('· draft')
  await expect(step).toHaveCount(0)
  await expect(build.getByRole('alert')).toHaveCount(0)

  /* and the way back is offered again where it works: a pick on the
     new draft, taken back by its own Undo */
  const figure = page.getByTestId('running-total').locator('data.ui-price')
  const before = Number(await figure.getAttribute('value'))
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await page.locator('.cfg-opt button[aria-pressed="false"]').first().click()
  await expect(step).toContainText('put on the quote')
  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(step).toContainText('off the quote again')
  expect(Number(await figure.getAttribute('value'))).toBe(before)
  await expect(build.getByRole('alert')).toHaveCount(0)
})

/* ============================================================
   THE TWO STICKY BARS MEET, AND NEITHER COVERS THE OTHER.

   Two faults, one geometry. First (2026-09-17): `.cfg-mast` ended at
   108.69 and `.cfg-find` began at 112, both opaque and both sticky, so
   a 3.31px band of the rows scrolling underneath was painted between
   them. Then (built-critique-m2.md #8): the masthead grew to clear the
   shell's pill, to 144.69px, while the field was still pinned at a
   typed 112 — so it ran 32.69px up BEHIND the head at 1280, 1440 and
   1920, and the stage's photograph lost its top 33px the same way.

   The screen now measures its own head and sticks both under it. So
   this asserts all three facts once the page has moved: the field
   begins where the head ends (never above it), the stage begins below
   it, and if any sliver of gap is left by rounding, what is painted in
   it is ground and never a row.

   Only where both bars are sticky, which is 1200 and up; below that
   the field goes static and there is no pair to measure.
   ============================================================ */
test('the masthead, the search field and the stage never cover each other', async ({ page }) => {
  await startAQuote(page)
  const size = page.viewportSize()!
  test.skip(
    size.width < 1200 || size.height < 700,
    `the page scrolls as one column at ${size.width} × ${size.height}, and nothing sticks`,
  )

  /* AT A DESK ONLY THE CHAPTERS SCROLL (the owner, 2026-10-30): a wheel over them moves their
     column, the page stands still, and the column's top edge stands under the search, so what
     passes up the column goes out of sight under the field's foot and never behind the bar */
  /* the motor open, so the column holds more than it shows */
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
  await arrived(page)
  const column = page.locator('.cfg-scroll')
  const over = (await column.boundingBox())!
  await page.mouse.move(over.x + over.width / 2, over.y + over.height / 2)
  await page.mouse.wheel(0, 400)
  await expect.poll(() => column.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)

  const bars = await page.evaluate(() => {
    const [mast, find, stage, scroller] = [
      '.cfg-mast',
      '.cfg-find',
      '.cfg-stage',
      '.cfg-scroll',
    ].map((sel) => document.querySelector(sel)!.getBoundingClientRect())
    return {
      mastEnd: mast!.bottom,
      findTop: find!.top,
      findEnd: find!.bottom,
      stageTop: stage!.top,
      columnTop: scroller!.top,
      scrolled: scrollY,
    }
  })
  expect(bars.scrolled, 'the page itself moved').toBe(0)
  expect(bars.findTop - bars.mastEnd, 'the search runs up behind the bar').toBeGreaterThanOrEqual(0)
  expect(bars.stageTop - bars.mastEnd, 'the stage runs up behind the bar').toBeGreaterThanOrEqual(0)
  expect(
    bars.columnTop - bars.findEnd,
    'the chapters run up behind the search',
  ).toBeGreaterThanOrEqual(-0.5)
})

/* ============================================================
   WHAT PASSES UNDER A BAR THAT STICKS GOES SOFT AT ITS FOOT, AND IS
   NEVER CUT (components critique, major 15: the build's sticky search
   cut "PRE-DELIVERY INCLUDED" in half at its lower edge, over a
   hairline). Each bar that sticks casts the kit's scroll edge.

   Read off the pixels, at every size: with the chapters brought up
   under the bars, the pixel row just under each bar's foot is shot with
   the edge, and again at the same scroll with the edge taken away. Taken
   away, it is whatever is passing — which proves something is really
   there to veil; with the edge, it is the bar's own ground but for a
   quarter of that at most. Where another bar meets a bar's foot (the
   field under the head at a desk) only the part of the foot it leaves
   open is read, since the field's own label and keycap stand there; a
   bar with nothing passing under its foot at this scroll is read and
   set aside, and at least one bar must have been read.

   EXCEPT THE SEARCH FIELD WHERE IT STICKS, AT A DESK (the refine round,
   2026-10-21): its veil was a window onto the rail — half of a price
   chip, the tops of the motor photographs, "for Jordan Avery" with half
   its glyph, soft and cut, standing in the bar. So the field is solid
   to its foot and ends on the strong rule while it is stuck, and what
   passes goes under that line with nothing of it seen through the bar.
   Read off the same pixels: the field's foot row is the rule over its
   ground and one colour along its length, the rows just inside it are
   the field's ground and nothing else, and the row under it is exactly
   what passes, the same with the field's edge drawn or taken away.

   AND THE HEAD BELOW A DESK, the same way (the refine round, 2026-10-21,
   refine-critique.md majors 7 and 8): at 390, 834 and 844 × 390 the page
   itself passes under the head — the stage's photograph, the chapter
   heads, the boat's facts — and its veil showed them half-faded under
   the bar ("Formosa GRT 425 · Tiller" loose under it, "535 kg", the
   ADV9's "9.2 m" without its label). There the head casts no edge, its
   foot row is its strong rule, and the rows inside it are its ground.
   ============================================================ */

/** How far a shot strays from one colour: the largest difference in any channel, 0–255. */
function strayFrom(shot: Buffer, ground: number[]): number {
  const img = decodePng(shot)
  let worst = 0
  for (let i = 0; i < img.data.length; i += 4) {
    for (let c = 0; c < 3; c++) worst = Math.max(worst, Math.abs(img.data[i + c]! - ground[c]!))
  }
  return worst
}

/** How far two shots of one place stray from each other: the largest difference in any channel. */
function apart(one: Buffer, two: Buffer): number {
  const a = decodePng(one).data
  const b = decodePng(two).data
  let worst = 0
  for (let i = 0; i < a.length; i += 4) {
    for (let c = 0; c < 3; c++) worst = Math.max(worst, Math.abs(a[i + c]! - b[i + c]!))
  }
  return worst
}

test('what passes under a bar that sticks goes under a line, and is veiled only under a desk’s head', async ({
  page,
}, info) => {
  await startAQuote(page)
  const size = page.viewportSize()!
  /* AT A DESK NOTHING STICKS: the page stands still and the chapters scroll in their own column,
     which cuts what passes cleanly at its top edge under the search (the test above) */
  test.skip(
    size.width >= 1200 && size.height >= 700,
    'at a desk the page does not scroll, so no bar sticks over it',
  )
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
  await arrived(page)
  await expect(page.locator('.cfg-tiles .cfg-opt').first()).toBeVisible()

  /* the chapters' plate brought up to the top of the window, under every bar that sticks */
  await page.evaluate(() => {
    const plate = document.querySelector('[data-testid="configurator"] .cfg-chapters')!
    window.scrollTo({ top: plate.getBoundingClientRect().top + scrollY, behavior: 'instant' })
  })
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )
  expect(await page.evaluate(() => scrollY), 'the page did not move').toBeGreaterThan(0)

  const bars = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const pen = canvas.getContext('2d') as CanvasRenderingContext2D
    const sticky = [...document.querySelectorAll<HTMLElement>('.cfg-mast, .cfg-find')].filter(
      (bar) => getComputedStyle(bar).position === 'sticky',
    )
    return sticky.map((bar) => {
      const r = bar.getBoundingClientRect()
      let [left, right] = [r.left, r.right]
      for (const other of sticky) {
        const o = other.getBoundingClientRect()
        if (other === bar || Math.abs(o.top - r.bottom) > 1.5) continue
        /* the other bar meets this foot: keep the wider part it leaves open */
        if (o.left - left >= right - o.right) right = Math.min(right, o.left)
        else left = Math.max(left, o.right)
      }
      pen.clearRect(0, 0, 1, 1)
      pen.fillStyle = getComputedStyle(bar).backgroundColor
      pen.fillRect(0, 0, 1, 1)
      const ground = [...pen.getImageData(0, 0, 1, 1).data].slice(0, 3)
      /* the line the bar draws at its foot, laid over its own ground as the page paints it: the
         field's one-pixel edge, or below a desk the head's own foot rule, where it casts no edge */
      const edge = getComputedStyle(bar, '::after')
      const head = bar.classList.contains('cfg-mast')
      const footRule = getComputedStyle(bar).borderBlockEndColor
      pen.fillStyle = head ? footRule : edge.backgroundColor
      pen.fillRect(0, 0, 1, 1)
      const rule = [...pen.getImageData(0, 0, 1, 1).data].slice(0, 3)
      const x = Math.ceil(left)
      const width = Math.floor(right - left) - 1
      return {
        name: bar.className,
        /* a bar that ends on a line rather than a veil: the field's edge is one pixel deep, and a
           head below a desk casts no edge at all */
        lined: head ? edge.display === 'none' : edge.blockSize === '1px',
        ruleShown: head ? footRule !== 'rgba(0, 0, 0, 0)' : edge.visibility === 'visible',
        clip: { x, y: Math.ceil(r.bottom), width, height: 1 },
        foot: { x, y: Math.round(r.bottom) - 1, width, height: 1 },
        inside: { x, y: Math.round(r.bottom) - 9, width, height: 8 },
        ground,
        rule,
      }
    })
  })
  expect(bars.length, 'no bar sticks on this build').toBeGreaterThan(0)

  let read = 0
  for (const bar of bars) {
    if (bar.lined) {
      /* stuck, the bar draws its rule; and the rule is one colour, the strong rule on ground */
      expect.soft(bar.ruleShown, `${bar.name}: stuck, its foot draws no line`).toBe(true)
      const foot = await page.screenshot({ clip: bar.foot })
      expect
        .soft(strayFrom(foot, bar.rule), `${bar.name}: its foot is not one line`)
        .toBeLessThanOrEqual(3)
      /* nothing of what passes is seen inside the bar */
      const inside = await page.screenshot({ clip: bar.inside })
      expect
        .soft(strayFrom(inside, bar.ground), `${bar.name}: what passes shows through the bar`)
        .toBeLessThanOrEqual(3)
      /* and under the line it is exactly what passes: no veil laid over it */
      const shown = await page.screenshot({ clip: bar.clip })
      const hush = await page.addStyleTag({
        content: '.cfg-mast::after, .cfg-find::after { display: none !important; }',
      })
      const bare = await page.screenshot({ clip: bar.clip })
      await hush.evaluate((el) => (el as Element).remove())
      if (strayFrom(bare, bar.ground) <= 8) continue
      read++
      expect
        .soft(apart(shown, bare), `${bar.name}: something is laid over what passes under its foot`)
        .toBeLessThanOrEqual(1)
      continue
    }
    const soft = await page.screenshot({ clip: bar.clip })
    const hush = await page.addStyleTag({
      content: '.cfg-mast::after, .cfg-find::after { display: none !important; }',
    })
    const cut = await page.screenshot({ clip: bar.clip })
    await hush.evaluate((el) => (el as Element).remove())
    const under = strayFrom(cut, bar.ground)
    const veiled = strayFrom(soft, bar.ground)
    await info.attach(`${bar.name}: under its foot, ${under} without the edge, ${veiled} with it`, {
      body: cut,
      contentType: 'image/png',
    })
    if (under <= 8) continue
    read++
    /* soft, so a head that fails does not hide whether the field under it fails too */
    expect
      .soft(veiled, `${bar.name}: what passes under its foot is cut, not veiled`)
      .toBeLessThanOrEqual(Math.max(3, under / 4))
  }
  expect(
    read,
    'nothing was passing under any bar that sticks, so nothing was read',
  ).toBeGreaterThan(0)
})

/* THE CUSTOMER READS THE PICTURE (built-critique-m2.md #24). The
   caption under the stage photograph says whose rig is in it and names
   the motor on THIS quote — read here off the motor chapter's own head,
   so the two cannot disagree.

   On a hull the hero ledger holds a photograph of, found in the ledger
   rather than named here: the deepest model on the sheet has no held
   picture at all, and a stage that draws a maker's mark shows no boat
   anybody could mistake, so it carries no such caption. */
const hero = readJson<{
  pictures: (Omit<{ table: string; model: string }, 'model'> & { tier: string; models: string[] })[]
}>('pictures.json')
  .pictures.filter((p) => p.tier === 'hero')
  .map((p) => ({ ...p, model: p.models[0]! }))
  /* on the register this file quotes deepest, whose cards name a model by its code (2026-10-20:
     pictures.json lists heroes by id, and the first is now a Formosa, whose card says "GRT 425 ·
     Tiller" for the file's "Formosa - GRT 425 (Tiller)") */
  .find((h) => h.table === deep.table.id)

test('the boat drawn large names this quote’s motor, where the photograph has another', async ({
  page,
}) => {
  expect(hero, 'the hero ledger holds no photograph of a boat').toBeDefined()
  await startAQuote(page, { table: hero!.table, model: hero!.model })
  await expect(page.locator('.cfg-shot[data-art="photograph"]')).toHaveCount(1)
  /* NOTHING IS PRINTED UNDER THE PHOTOGRAPH (the owner, 2026-10-30: "We dont need that little
     text under the photo"): what it shows and what this quote carries are its caption drawn
     large, with where it came from */
  await expect(page.getByTestId('stage-caption')).toHaveCount(0)
  await page.getByRole('button', { name: 'See the boat larger' }).click()
  const caption = page.getByRole('dialog')
  await expect(caption).toBeVisible()
  await expect(caption).toContainText('the maker’s own finish and rig')
  const head = page.locator('.cfg-head__press').filter({
    has: page.locator('.cfg-head__name', { hasText: /^Motor$/ }),
  })
  await expect(head).toHaveCount(1)
  const where = `${(await head.locator('.cfg-head__num').innerText()).trim()} Motor`
  /* the head's answer, as a person says it: what is on the quote leads (2026-09-29) */
  const said = head.locator('.cfg-head__said')
  const chosen = (await said.count()) > 0 ? (await said.innerText()).trim() : ''
  if (chosen) await expect(caption).toContainText(chosen)
  else await expect(caption).toContainText('no motor yet')
  /* the boat, not the app (the refine critique, 18): the motor is said, and the chapter the
     screen keeps it in is not ("… from 02 Motor") */
  await expect(caption).not.toContainText(where)
})

/* THE MOTORS ARE THE KIT'S PHOTOGRAPHED TILES, AND IN A HAND THE BOAT STANDS
   ABOVE THE WORK (the component critique, 2026-09-28, blocker 1). The build
   drew the Yamaha F90LB as a paragraph of rigging kit while /kit drew it
   photographed; and at 390 the stage's photograph was 1,499px down, below
   every chapter. Asserted in a real browser because both are about what
   lands on the screen: a picture that decodes, and where it stands. */
test('a motor carries its own picture, and in a hand the boat is above the chapters', async ({
  page,
}) => {
  expect(hero, 'the hero ledger holds no photograph of a boat').toBeDefined()
  await startAQuote(page, { table: hero!.table, model: hero!.model })
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
  await arrived(page)
  const tiles = page.locator('.cfg-tiles .cfg-opt')
  await expect(tiles.first()).toBeVisible()
  const pictures = page.locator('.cfg-tiles .cfg-opt img')
  expect(await pictures.count()).toBeGreaterThan(0)
  await pictures.first().scrollIntoViewIfNeeded()
  await expect
    .poll(() => pictures.first().evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0)
  /* the facts its own row carries: the F250XCB's names no weight, so none is said */
  await expect(tiles.first()).toContainText(/\d hp( · [\d,]+ kg)? · \d+″ shaft/)

  const size = page.viewportSize()!
  if (size.width >= 640) return
  await page.evaluate(() => window.scrollTo(0, 0))
  const at = await page.evaluate(() => ({
    shot: document.querySelector('.cfg-shot')!.getBoundingClientRect().top,
    find: document.querySelector('#cfg-find')!.getBoundingClientRect().bottom,
    rail: document.querySelector('.cfg-rail')!.getBoundingClientRect().top,
  }))
  expect(at.shot, 'the photograph stands above the chapters').toBeLessThan(at.rail)
  expect(at.find, 'the search field is still on the first screen').toBeLessThanOrEqual(size.height)
})

/* WHAT WAS PRESSED STAYS UNDER THE FINGER (the component critique, 2026-09-28,
   major 9). The step line and the engine's "2 lines from …" arrived above the
   press; measured on the Stacer 519 at 1440 before, the pressed F115LB moved
   126px down under the pointer. The step is said where it covers nothing — the
   kit's toast from 1440, the head's own line below it (the refine round,
   2026-10-20: below 1440 the toast lay over the rail it was about) — and the
   tile is where it was pressed, and where it was read when the Undo takes it
   back. */
test('a press leaves what was pressed where it was pressed', async ({ page }) => {
  await startAQuote(page)
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
  await arrived(page)
  const row = page.locator('.cfg-opt button[aria-pressed="false"]').first()
  await expect(row).toBeVisible()
  await row.scrollIntoViewIfNeeded()
  /* held as the element itself: once pressed it is no longer "not on the quote" */
  const pressed = (await row.elementHandle())!
  const before = await pressed.evaluate((el) => el.getBoundingClientRect().top)
  const field = page.locator('.cfg-find')
  const fieldBefore = await field.evaluate((el) => el.getBoundingClientRect().height)
  await pressed.click()
  const step = page.getByTestId('last-step')
  await expect(step).toContainText('put on the quote')
  expect(await pressed.getAttribute('aria-pressed')).toBe('true')
  const after = await pressed.evaluate((el) => el.getBoundingClientRect().top)
  expect(
    Math.abs(after - before),
    'the pressed option moved under the pointer',
  ).toBeLessThanOrEqual(1.5)

  /* NOTHING GROWS BETWEEN THE FIELD AND THE CHAPTERS, and the sentence and its Undo are in the
     window wherever the press was — in a hand the rail's head is far above it. From 1440 it is
     the kit's toast, in the band beside the pill; narrower it is the head's own line, and
     nothing stands over the rail (the refine round, 2026-10-20). */
  expect(
    await field.evaluate((el) => el.getBoundingClientRect().height),
    'the rail head grew at the press',
  ).toBeCloseTo(fieldBefore, 0)
  const wide = (page.viewportSize()?.width ?? 0) >= 1440
  if (wide) await expect(step).toHaveAttribute('data-sonner-toast', '')
  else await expect(page.locator('.cfg-mast').getByTestId('last-step')).toHaveCount(1)
  await expect(step).toBeInViewport({ ratio: 1 })
  /* and below 1440 nothing is drawn over the rail: no toast stands anywhere */
  if (!wide) await expect(page.locator('[data-sonner-toast]')).toHaveCount(0)

  /* ITS UNDO IS PRESSED AWAY FROM THE LIST, and the list holds still under the reader:
     taking a second motor back takes the engine's sentence from over it */
  const read = await pressed.evaluate((el) => el.getBoundingClientRect().top)
  await step.getByRole('button', { name: 'Undo' }).click()
  await expect(step).toContainText('off the quote again')
  expect(await pressed.getAttribute('aria-pressed')).toBe('false')
  expect(
    Math.abs((await pressed.evaluate((el) => el.getBoundingClientRect().top)) - read),
    'the list moved under the reader at the Undo',
  ).toBeLessThanOrEqual(1.5)
})

/* ============================================================
   THE STEP'S UNDO IS REACHED BY A KEYBOARD, and the caret comes back.

   A way back is only a way back if a person reading the list with a
   keyboard can reach it. Sonner's own answer, kept for the head's line
   that stands in the toast's place below 1440: Alt T takes the caret to
   the way back, and leaving it hands the caret back to where it was
   taken from — Shift Tab out of the toast's stack, Escape out of the
   head's line. So this presses a motor by keyboard, reaches the Undo,
   takes the pick back and finds the caret on the row again.
   ============================================================ */
test('the step’s Undo is reached by a keyboard, and hands the caret back', async ({ page }) => {
  await startAQuote(page)
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
  const figure = page.getByTestId('running-total').locator('data.ui-price')
  const before = Number(await figure.getAttribute('value'))
  const row = page.locator('.cfg-opt button[aria-pressed="false"]').first()
  await row.focus()
  const held = (await row.elementHandle())!
  await page.keyboard.press('Enter')
  const step = page.getByTestId('last-step')
  await expect(step).toContainText('put on the quote')

  await page.keyboard.press('Alt+KeyT')
  const undo = step.getByRole('button', { name: 'Undo' })
  for (let i = 0; i < 4 && !(await undo.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab')
  }
  await expect(undo).toBeFocused()
  expect(
    await undo.evaluate((el) => getComputedStyle(el).boxShadow),
    'the Undo has no ring',
  ).not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(step).toContainText('off the quote again')
  expect(Number(await figure.getAttribute('value'))).toBe(before)

  /* the press turned it into its own way back, where the caret still is */
  await expect(step.getByRole('button', { name: 'Put it back' })).toBeFocused()
  /* and leaving it puts the caret back on the row it was taken from */
  if ((page.viewportSize()?.width ?? 0) >= 1440) {
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Shift+Tab')
  } else {
    await page.keyboard.press('Escape')
  }
  await expect.poll(() => held.evaluate((el) => el === document.activeElement)).toBe(true)
})

test('no cost column reaches this screen', async ({ page }) => {
  await startAQuote(page)
  /* the whole rail opened, chapter by chapter, and then read */
  for (const head of await page.locator('.cfg-head__press').all()) {
    if ((await head.getAttribute('aria-expanded')) === 'false') await head.click()
  }
  const said = await page.getByTestId('configurator').innerText()
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

/* ============================================================
   THE BUILD MOVES ON TO WHAT IS LEFT, AND BRINGS IT TO THE HAND
   (m2-last-critique.md, major 3).

   "Arriving from the picker (no ?at=), the motor chapter is open.
   After the F250XCB is pressed, the default chapter falls back to
   chapters[0] … so 'ADV7 — 7 finishes' opens under the hand. It does
   not move on to 'Who it is for'. Seen at 1440, 834 and 390."

   The critic's own walk, at every size: the Highfield ADV7 in Black /
   Grey / Black from the picker, a motor pressed, then a name. Each time
   the chapter the build moves on to must be open, must hold the
   keyboard (the pressed tile folded away with its list and left the
   focus on the page's body), and must be in the window — its head and,
   where the chapter fits, its act — with nothing drawn over either: the
   masthead, the sticky search field and the phone's tab bar are all
   read by asking the page what is under the point.
   ============================================================ */

/** Whether an element's centre is the element itself, and not a bar over it. */
const uncovered = (target: ReturnType<Page['locator']>): Promise<boolean> =>
  target.evaluate((el) => {
    const box = el.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    if (y < 0 || y > innerHeight) return false
    const hit = document.elementFromPoint(x, y)
    return hit !== null && (hit === el || el.contains(hit))
  })

test('the hull opens first, a motor pressed stays where it was pressed, and the finale comes by its head', async ({
  page,
}) => {
  await throughTheDoor(page)
  await page.goto('/quote/new?brand=boat_highfield')
  await expect(page.getByTestId('picker-counts')).toBeVisible()
  await page.getByLabel(/Find a model/).fill('ADV7')
  await page
    .getByRole('button', {
      name: new RegExp(`^${escapeRe(cardName('boat_highfield', 'ADV7'))}\\b`),
    })
    .first()
    .click()
  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await panel
    .getByRole('button', { name: /Black \/ Grey \/ Black|B-G-B/ })
    .first()
    .click()
  await panel
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()
  await expect(page).toHaveURL(/\/quote\/[^/?]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('running-total')).toBeVisible()

  const head = (name: RegExp) => page.getByRole('button', { name })
  /* THE HULL FIRST, AND NOTHING MOVES ON BY ITSELF (the owner, 2026-10-30: "always hull expanded
     first"; opening.ts, rule 3): the dealer opens the motor, and it stays open under the press */
  await expect(head(/^01 The hull/)).toHaveAttribute('aria-expanded', 'true')
  await head(/^02 Motor/).click()
  await cameToRest(page)
  await page.locator('[data-chapter="motor"] .cfg-opt button[aria-pressed="false"]').first().click()
  await expect(page.getByTestId('last-step')).toContainText('put on the quote')
  await expect(head(/^02 Motor/)).toHaveAttribute('aria-expanded', 'true')
  await expect(head(/^01 The hull/)).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('.cfg-head__press[aria-expanded="true"]')).toHaveCount(1)

  /* the name in the bar, and the summary brought in by its door: the window's top, and its give
     in sight */
  await nameTheCustomer(page, 'R. Kelleher')
  await head(/^The summary/).click()
  await expect(page.getByTestId('summary')).toBeVisible()
  await cameToRest(page)
  await expect
    .poll(async () => Math.abs((await page.getByTestId('summary').boundingBox())!.y))
    .toBeLessThanOrEqual(1)
  await expect(page.getByRole('button', { name: 'Give it to the customer' })).toBeInViewport()
  await priceWhatWaits(page)
  await expect(page.getByRole('button', { name: 'Give it to the customer' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  )
})

/* THE COMPONENTS CRITIQUE'S FIRST BLOCKER (2026-09-29), measured as the critic measured it:
   "F115" typed with the caret held in the search the whole time, every frame read. Two
   chapters' carets turned through 26 transforms and their accent bars grew through 25, over
   441 ms, as the search opened the chapters that match. Under a caret each of them — and the
   dashes beside the field, which the build took the same day — is at its rest or at its end,
   and at nothing between. */
test('nothing turns or grows while a caret is in the search', async ({ page }) => {
  await startAQuote(page)
  const field = page.getByRole('searchbox')
  await field.click()
  await page.evaluate(() => {
    const seen = new Map<Element, Set<string>>()
    const note = (el: Element, value: string): void => {
      const values = seen.get(el) ?? new Set<string>()
      values.add(value)
      seen.set(el, values)
    }
    /* WHAT A RUNNING ANIMATION MOVES, read off the animation itself: a CSS transition names its
       property, and a keyframe animation or the Web Animations API's own names every property
       in its keyframes. Colour and opacity are allowed under a caret; movement is not. */
    const MOVES = /^(transform|translate|scale|rotate|height|width|inset|top|left|clip-?path)$/i
    const moving = new Set<string>()
    const w = window as unknown as {
      stillRead: { run: boolean; caret: boolean; seen: typeof seen; moving: Set<string> }
    }
    w.stillRead = { run: true, caret: true, seen, moving }
    const build = document.querySelector('[data-testid="configurator"]')!
    const read = (): void => {
      if (!w.stillRead.run) return
      if (!(document.activeElement instanceof HTMLInputElement)) w.stillRead.caret = false
      for (const el of document.querySelectorAll('.cfg-head__chev'))
        note(el, getComputedStyle(el).transform)
      for (const el of document.querySelectorAll('.cfg-chapter'))
        note(el, getComputedStyle(el, '::before').transform)
      for (const el of document.querySelectorAll('.cfg-where [aria-hidden] > *'))
        note(el, String(Math.round(el.getBoundingClientRect().width)))
      /* a chapter's body is grown by `motion` a frame at a time, which no animation list
         shows: under a caret it is at no height or at its whole height, never between */
      for (const el of document.querySelectorAll<HTMLElement>('.cfg-body'))
        note(el, el.style.height)
      for (const running of document.getAnimations()) {
        if (running.playState !== 'running') continue
        const effect = running.effect as KeyframeEffect | null
        const target = effect?.target
        if (!(target instanceof Element) || !build.contains(target)) continue
        const props =
          'transitionProperty' in running
            ? [String((running as unknown as { transitionProperty: string }).transitionProperty)]
            : (effect?.getKeyframes() ?? []).flatMap((frame) => Object.keys(frame))
        for (const prop of props) {
          if (MOVES.test(prop)) moving.add(`${target.className} ${prop}`)
        }
      }
      requestAnimationFrame(read)
    }
    requestAnimationFrame(read)
  })
  await page.keyboard.type('F115', { delay: 60 })
  await page.waitForTimeout(700)
  const read = await page.evaluate(() => {
    const w = window as unknown as {
      stillRead: {
        run: boolean
        caret: boolean
        seen: Map<Element, Set<string>>
        moving: Set<string>
      }
    }
    w.stillRead.run = false
    return {
      caret: w.stillRead.caret,
      most: Math.max(...[...w.stillRead.seen.values()].map((values) => values.size)),
      moving: [...w.stillRead.moving],
    }
  })
  expect(read.caret, 'the caret left the field while the search was typed').toBe(true)
  expect(read.moving, 'an animation moved something while the caret was in the field').toEqual([])
  expect(
    read.most,
    'something passed through a state between its rest and its end',
  ).toBeLessThanOrEqual(2)
  await expect(page.locator('.cfg-head__press[aria-expanded="true"]').first()).toBeVisible()
})

/* ============================================================
   IN A HAND THE BUILD IS ONE COLUMN, THE PRICE IS ALWAYS THERE AND
   COVERS NOTHING, AND A PRESSED CHAPTER COMES TO THE HAND (the
   components critique, 2026-09-29, major 8: "the build's sticky head
   is 193 px of 844 … With the foot pill, about 30% of the screen is
   chrome", and "pressing '02 Motor' opened it where it stood, with its
   head at the foot under the pill and its tiles below the fold").

   At every size a chapter pressed low in the room is brought up under
   the bars that stick, its head uncovered and the start of its body in
   the window. In a hand, the head that sticks is the one row of the
   boat's name and the total — the total always on the screen — and it
   and the pill together are under a fifth of the window.
   ============================================================ */
test('a chapter pressed low in the room is brought up to the hand, and in a hand the price stays in one row', async ({
  page,
}) => {
  await startAQuote(page)
  const size = page.viewportSize()!
  await page.evaluate(() => window.scrollTo(0, 0))
  const head = (id: string) => page.locator(`[data-chapter="${id}"] .cfg-head__press`)

  /* the lowest chapter head still on the first screen, and shut */
  const low = await page.evaluate(() => {
    const room = innerHeight
    const heads = [...document.querySelectorAll<HTMLElement>('.cfg-head__press')]
      .filter((h) => h.getAttribute('aria-expanded') === 'false')
      .map((h) => ({
        id: h.closest('[data-chapter]')!.getAttribute('data-chapter')!,
        top: h.getBoundingClientRect().top,
      }))
      .filter((h) => h.top > room * 0.55 && h.top < room - 80)
    return heads.at(-1)?.id ?? null
  })
  if (low !== null) {
    await head(low).click()
    await expect(head(low)).toHaveAttribute('aria-expanded', 'true')
    await expect
      .poll(async () =>
        head(low).evaluate((el) => {
          const top = el.getBoundingClientRect().top
          const cover = Math.max(
            0,
            ...[...document.querySelectorAll('.cfg-mast, .cfg-find')]
              .filter((bar) => getComputedStyle(bar).position === 'sticky')
              .map((bar) => bar.getBoundingClientRect().bottom),
          )
          return top >= cover - 1 && top < cover + (innerHeight - cover) * 0.4
        }),
      )
      .toBe(true)
    expect(await uncovered(head(low)), 'the pressed head is under a bar').toBe(true)
  }

  if (size.width >= 640) return
  /* moved, a hand's head is the one row of the boat's name and the total */
  await page.mouse.wheel(0, 600)
  await expect
    .poll(() =>
      page.evaluate(() => document.querySelector('.cfg-mast')!.getBoundingClientRect().top),
    )
    .toBeLessThan(0)
  const chrome = await page.evaluate(() => {
    const mast = document.querySelector('.cfg-mast')!.getBoundingClientRect()
    const name = document.querySelector('.cfg-mast__name')!.getBoundingClientRect()
    const figure = document
      .querySelector('[data-testid="running-total"] data')!
      .getBoundingClientRect()
    const pill = document.querySelector('.way-pill')?.getBoundingClientRect()
    return {
      head: mast.bottom,
      foot: pill ? innerHeight - pill.top : 0,
      nameTop: name.top,
      figureTop: figure.top,
      figureBottom: figure.bottom,
    }
  })
  expect(chrome.nameTop, 'the boat’s name went up with the eyebrow').toBeGreaterThanOrEqual(0)
  expect(chrome.figureTop, 'the total went up with the eyebrow').toBeGreaterThanOrEqual(0)
  expect(chrome.figureBottom).toBeLessThanOrEqual(chrome.head)
  expect(
    (chrome.head + chrome.foot) / size.height,
    `the head (${chrome.head}px) and the pill (${chrome.foot}px) are more than a fifth of the window`,
  ).toBeLessThan(0.2)
})

/* PAST THE MOTOR THE BUILD IS NOT TEXT IN BOXES (the components critique, 2026-09-29, blocker
   2). A motor tile says the motor — its picture, its name, its power, weight and shaft and its
   figure — and the pairing's rigging kit, prop and code are the workshop's, one press away
   under it; the shut heads say what is on the quote, never a code first. Walked on the boat
   the hero ledger photographs, at every size. */
test('a motor tile says the motor, and its rigging kit is one press away', async ({ page }) => {
  expect(hero, 'the hero ledger holds no photograph of a boat').toBeDefined()
  await startAQuote(page, { table: hero!.table, model: hero!.model })
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
  const option = page.locator('[data-chapter="motor"] .cfg-tiles .cfg-opt').first()
  await expect(option).toBeVisible()
  const tile = option.getByRole('button').first()
  await expect(tile).toContainText(/\d hp/)
  await expect(tile).not.toContainText(/Rigging Kit Option|Prop Part No/)
  /* ONE "FOR THE WORKSHOP" FOR THE CHAPTER, over its tiles, never one under each (the refine
     round, 2026-10-21) */
  const shop = page.locator('[data-chapter="motor"]').getByRole('button', {
    name: 'For the workshop',
  })
  expect(await shop.count()).toBeLessThanOrEqual(1)
  if ((await shop.count()) > 0) {
    await shop.scrollIntoViewIfNeeded()
    await expect(shop).toHaveAttribute('aria-expanded', 'false')
    await shop.click()
    await expect(shop).toHaveAttribute('aria-expanded', 'true')
    await expect(option.locator('.cfg-shop__facts')).toBeVisible()
  }
  for (const fact of await page.locator('.cfg-head__fact').allInnerTexts()) {
    expect(fact).not.toMatch(/^chosen:/)
  }
})

/* THE FIRST WINDOW ENDS BETWEEN TWO CHAPTERS (refine-critique.md, major 5): at 390 a chapter's
   figure stood half over the tab bar and half under it with nothing scrolled — the Highfield's
   "$25,355", the Stacer's "$8,703", the Formosa's "03 Trailer" head. The photograph now takes
   the height that ends a chapter above the bar (`fitTheBoat` in Configurator.tsx). */
test('in a hand, the build arrives ending between two chapters, never through one', async ({
  page,
}) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(size.width >= 600, `the pill is not at the foot at ${size.width}`)
  await startAQuote(page)
  /* and the two the critic read it on: the Stacer's trailer, the Formosa's "03 Trailer" head */
  for (const on of [
    { table: 'boat_stacer', model: '519 Sea Ranger SDF' },
    { table: 'boat_formosa', model: 'GRT 425' },
    null,
  ]) {
    await expect(page.getByTestId('running-total')).toBeVisible()
    await expect
      .poll(() => acrossTheBar(page, '[data-testid="configurator"]'), { message: page.url() })
      .toEqual([])
    if (on) await pickAndStart(page, on.table, on.model)
  }
})

/* THE HEAD BELOW A DESK, SCROLLED, CARRIES ONLY WHAT IT HAS (refine-critique.md, majors 7 and 8,
   2026-10-21). On a tablet a boat with no photograph kept the photograph's 280px column empty at
   the head's start once the stage had scrolled away (the Stacer 519), and a boat with one hung
   the plate's shadow past the head's foot over the specification strip (the ADV9). On a phone
   turned over the stuck head was the pill's clearance and two lines more, "Total" over its
   figure. Read on the Stacer 519, whose stage draws Stacer's mark, and on the Formosa GRT 425,
   whose stage is a photograph. */
test('scrolled below a desk, the head carries no empty column and nothing past its foot', async ({
  page,
}) => {
  const size = page.viewportSize() as { width: number; height: number }
  test.skip(size.width >= 1200, `the head is not a bar over the page at ${size.width}`)
  await startAQuote(page, { table: 'boat_stacer', model: '519 Sea Ranger SDF' })
  for (const on of [
    { table: 'boat_stacer', model: '519 Sea Ranger SDF' },
    { table: 'boat_formosa', model: 'GRT 425' },
  ]) {
    /* the door is walked once; the next boat is started from the picker, as a person does */
    if (on.table !== 'boat_stacer') await pickAndStart(page, on.table, on.model)
    await expect(page.getByTestId('running-total')).toBeVisible()
    /* the stage's picture brought up under the head, then a step more */
    await page.evaluate(() => {
      const shot = document.querySelector('.cfg-shot')!.getBoundingClientRect()
      window.scrollTo({ top: shot.bottom + scrollY + 40, behavior: 'instant' })
    })
    await arrived(page)
    const head = await page.evaluate(() => {
      const mast = document.querySelector<HTMLElement>('.cfg-mast')!
      const r = mast.getBoundingClientRect()
      const name = mast.querySelector('.cfg-mast__name')!.getBoundingClientRect()
      const pic = mast.querySelector<HTMLElement>('.cfg-mast__pic')
      const lab = mast.querySelector('.cfg-money__lab')!.getBoundingClientRect()
      const fig = mast.querySelector('.cfg-money__fig, .cfg-money__none')!.getBoundingClientRect()
      return {
        scrolled: scrollY,
        start: r.left + Number.parseFloat(getComputedStyle(mast).paddingInlineStart),
        nameLeft: name.left,
        pic:
          pic && getComputedStyle(pic).display !== 'none'
            ? { right: pic.getBoundingClientRect().right, shadow: getComputedStyle(pic).boxShadow }
            : null,
        foot: r.bottom,
        labOverFigure: lab.bottom <= fig.top + 0.5,
      }
    })
    expect(head.scrolled, 'the page did not move').toBeGreaterThan(0)
    if (head.pic === null) {
      /* no picture in the head, so its words start at its own padding */
      expect(
        head.nameLeft - head.start,
        `${on.model}: an empty column opens the head`,
      ).toBeLessThan(1)
    } else {
      expect(head.pic.shadow, `${on.model}: the head's photograph casts past the head`).toBe('none')
      expect(head.nameLeft, `${on.model}: the name stands over the photograph`).toBeGreaterThan(
        head.pic.right,
      )
    }
    if (size.height <= 700)
      expect(
        head.labOverFigure,
        `${on.model}: "Total" takes a line of its own over the figure`,
      ).toBe(false)
  }
})

/* THE EXIT CRITERION, ON A RULE THAT REFUSES A BOAT'S STAR (built-critique-m3-2.md, blocker 1).
   The tiller walk on Rules passes because the Classic 340's star is not the motor it refuses;
   this is the rule the critic wrote — "When the boat's maker is Stacer, the motor's horsepower
   must be at most 20 hp" — on the Stacer 659 Ocean Ranger, whose starred motor is the F130XA.
   Written on Rules through its own words, and the next draft started on the picker's own act. */
test('a rule refusing the boat’s starred motor: the next draft leaves it off, and an older draft cannot be given', async ({
  page,
}) => {
  test.setTimeout(240_000)
  const STACER = 'boat_stacer'
  const MODEL_659 = '659 Ocean Ranger Cen Cab'
  const BECAUSE = 'a Stacer this size is sold with a small motor'
  const motorButton = (name: RegExp) =>
    page.locator('[data-chapter="motor"]').getByRole('button', { name })

  /* a draft made BEFORE the rule carries the price list's star, and is named so the picker
     does not hand it back as the draft already standing */
  await throughTheDoor(page)
  const before = await pickAndStart(page, STACER, MODEL_659)
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await expect(motorButton(/^Yamaha F130XA, recommended, on the quote$/)).toHaveCount(1)
  await nameTheCustomer(page, 'R. Kelleher')
  await expect(page.getByTestId('last-step')).toContainText('R. Kelleher')
  await written(page)

  /* the rule, in the dealer's words on Rules */
  await page.goto('/rules?open=new')
  await expect(page.locator('[data-testid="rules"][data-read]')).toBeVisible({ timeout: 30_000 })
  const choose = async (word: string, choice: RegExp) => {
    await page.getByRole('combobox', { name: word }).click()
    await page.getByRole('option', { name: choice }).click()
    await expect(page.getByRole('listbox')).toBeHidden()
  }
  await choose('Which of the boat’s specs', /^maker$/)
  await choose('The boat’s maker', /^Stacer\b/)
  await choose('Which of the motor’s specs', /^horsepower$/)
  await choose('Must be over or under', /^must be at most$/)
  await page.getByRole('textbox', { name: 'The motor’s horsepower, as a figure' }).fill('20')
  await page.getByRole('textbox', { name: 'Because' }).fill(BECAUSE)
  await page.getByRole('button', { name: 'Add it as 2.4' }).click()
  await expect(page.getByTestId('your-rule')).toContainText(
    'When the boat’s maker is Stacer, the motor’s horsepower must be at most 20 hp.',
  )
  await written(page)

  /* THE NEXT PICK: the F130XA is not put on, and the list says once why it is not there */
  const after = await pickAndStart(page, STACER, MODEL_659)
  expect(after).not.toBe(before)
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  const said = page.getByTestId('ruled-here')
  await expect(said).toHaveCount(1)
  await expect(said).toContainText('Not offered on this boat:')
  await expect(said).toContainText('Yamaha F130XA')
  await expect(said).toContainText(`because ${BECAUSE}`)
  await expect(said).not.toContainText('on this quote already')
  await expect(motorButton(/^Yamaha F130XA,/)).toHaveCount(0)
  /* nor its rigging kit, anywhere on the build */
  await expect(page.getByTestId('configurator')).not.toContainText('Rigging kit for the F130XA')

  /* THE OLDER DRAFT: its F130XA stands, and the give is refused with the rule's because */
  await page.goto(`/quote/${before}?at=finale`)
  await expect(page.getByTestId('configurator')).toBeVisible()
  const act = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('configurator')).toContainText(
    `The Yamaha F130XA is on this quote, and your rule refuses it on this boat, because ${BECAUSE}. Take it off before it goes to the customer.`,
  )
  await act.click({ force: true })
  await expect(page.getByTestId('given-seal')).toHaveCount(0)

  /* taken off, it can be given */
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  /* the tile, by its name — no longer "recommended" beside the rule that refuses it */
  const kept = motorButton(/^Yamaha F130XA, on the quote$/)
  await expect(kept).toHaveCount(1)
  await kept.click()
  await expect(page.getByTestId('last-step')).toContainText('F130XA')
  await page.getByRole('button', { name: /The summary/ }).click()
  await priceWhatWaits(page)
  await expect(page.getByRole('button', { name: 'Give it to the customer' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  )
})

/* ============================================================
   THE FIRST QUOTE ON A FRESH LINK (built-critique-m3-2.md, major 5). The Classic 340's draft
   carries the recommended Tube Covers, whose list names no price, and has no name yet. The
   finale ran both refusals into one paragraph, each ending "cannot be given". Now it says what
   they stop once, over one line per cause; with the name on, the one cause left is said whole.
   ============================================================ */
test('the Classic 340’s finale says each reason the give waits once, under one lead', async ({
  page,
}) => {
  test.setTimeout(150_000)
  await throughTheDoor(page)
  await pickAndStart(page, 'boat_highfield', 'CL340')
  await page.getByRole('button', { name: /The summary/ }).click()
  await cameToRest(page)

  const give = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(give).toHaveAttribute('aria-disabled', 'true')
  const waits = page.getByTestId('give-waits')
  await expect(waits).toHaveCount(1)
  await waits.scrollIntoViewIfNeeded()
  await expect(waits).toBeInViewport()
  await expect(waits).toContainText('It cannot be given yet, for two reasons:')
  await expect(waits.getByRole('listitem')).toHaveText([
    'No customer’s name is on it yet.',
    /^Northside has not chosen which figure prices Dealer Fit Packages, so the Tube Covers .+ has no price\. Put one on it above, or choose it on Prices\.$/,
  ])
  /* "cannot be given" is said once on the whole build */
  await expect(page.getByTestId('configurator').getByText(/cannot be given/)).toHaveCount(1)
  /* and the act points a reader at the reasons it waits for */
  const described = await give.getAttribute('aria-describedby')
  expect(described).toBeTruthy()
  await expect(page.locator(`[id="${described}"]`)).toContainText('for two reasons')

  /* the name on, the one cause left is said whole, as the give's one refusal */
  await page.locator('.cfg-hand').getByRole('button', { name: 'Add their name' }).click()
  const panel = page.getByRole('dialog', { name: 'The customer' })
  await panel.getByLabel(/Who the quote is for/).fill('R. Kelleher')
  await panel.getByRole('button', { name: 'Put their name on it' }).click()
  await cameToRest(page)
  await expect(waits.getByRole('listitem')).toHaveCount(0)
  await expect(waits).toHaveText(
    /^Northside has not chosen which figure prices Dealer Fit Packages, so the Tube Covers .+ has no price and this quote cannot be given\. Choose it on Prices, or put a price on the line here\.$/,
  )
})
