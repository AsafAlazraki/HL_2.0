import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
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
    .getByRole('button', { name: new RegExp(`^${escapeRe(on.model)}\\b`) })
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
    await panel.locator('.picker-chip__code').first().click()
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
  /* four decisions the price file can carry, plus the two it cannot */
  for (const name of ['The hull', 'Motor', 'Who it is for', 'The finale']) {
    await expect(
      page.getByRole('button', { name: new RegExp(escapeRe(name)) }).first(),
    ).toBeVisible()
  }
  const heads = page.locator('.cfg-head__press')
  expect(await heads.count()).toBeGreaterThanOrEqual(5)
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
  await expect(said).toContainText(/options? match/)
  const text = (await said.innerText()).replace(/,/g, '')
  const hits = Number(/(\d+) options? match/.exec(text)?.[1])
  const beyond = Number(/(\d+) of them not paired with this hull/.exec(text)?.[1] ?? '0')
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
    /never recorded that pairing|Nobody has picked it/,
  )

  /* and a chapter the words did not reach says so rather than
     disappearing */
  await field.fill('zzzzqq')
  await expect(said).toContainText('Nothing on this quote is called that, in any chapter.')
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
  const row = page.locator('.cfg-opt .ui-tile[aria-pressed="false"]').first()
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
  await page.getByRole('button', { name: /The finale/ }).click()
  const act = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(act).toBeVisible()
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('configurator')).toContainText('This quote is addressed to nobody.')
})

test('addressing it, issuing it, and then every edit refusing', async ({ page }) => {
  await startAQuote(page)

  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is addressed to/).fill('R. Kelleher')
  await page.getByRole('button', { name: /Address this quote|Save the name/ }).click()
  await expect(page.getByTestId('last-step')).toContainText('R. Kelleher')

  await page.getByRole('button', { name: /The finale/ }).click()
  const act = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  await act.click()
  await expect(page.getByTestId('configurator')).toContainText('given to the customer')

  /* AN ISSUED QUOTE REFUSES AN EDIT WITH A SENTENCE, and it is the
     engine's line that makes it true rather than a hidden control. */
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  const row = page.locator('.cfg-opt .ui-tile').first()
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
  const refused = page.locator('.cfg button[aria-disabled="true"]')
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

  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is addressed to/).fill('R. Kelleher')
  await page.getByRole('button', { name: /Address this quote|Save the name/ }).click()
  await page.getByRole('button', { name: /The finale/ }).click()

  /* A DRAFT HAS NO SHEET TO OPEN — a document renders from FROZEN
     lines and a draft's are still moving — so the control appears
     when there is something to open rather than standing refused. */
  await expect(page.getByRole('button', { name: 'Open the document' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Give it to the customer' }).click()
  const open = page.getByRole('button', { name: 'Open the document' })
  /* one in the finale, one in the masthead of every chapter */
  await expect(open).toHaveCount(2)
  await open.first().click()

  await expect(page).toHaveURL(/\/quote\/[^/]+\/document$/, { timeout: 15_000 })
  await expect(page.getByRole('button', { name: /Back to the build/ })).toBeVisible()
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
test('the masthead, the search field and the stage never cover each other', async ({
  page,
}, info) => {
  await startAQuote(page)
  const width = page.viewportSize()?.width ?? 0
  test.skip(width < 1200, `the field is static at ${width}, so there are not two sticky bars`)

  await page.mouse.wheel(0, 400)
  await page.waitForTimeout(200)

  const bars = await page.evaluate(() => {
    const mast = document.querySelector('.cfg-mast')!.getBoundingClientRect()
    const find = document.querySelector('.cfg-find')!.getBoundingClientRect()
    const stage = document.querySelector('.cfg-stage')!.getBoundingClientRect()
    const rail = document.querySelector('.cfg-rail')!.getBoundingClientRect()
    return {
      mastEnd: mast.bottom,
      findTop: find.top,
      stageTop: stage.top,
      x: rail.x,
      width: rail.width,
      scrolled: scrollY,
    }
  })
  expect(bars.scrolled, 'the page did not move, so nothing is stuck yet').toBeGreaterThan(0)
  /* half a pixel of rounding either way is the measure and not the fault */
  expect(
    bars.findTop - bars.mastEnd,
    'the search field runs up behind the masthead',
  ).toBeGreaterThanOrEqual(-0.5)
  expect(
    bars.stageTop - bars.mastEnd,
    'the stage runs up behind the masthead',
  ).toBeGreaterThanOrEqual(-0.5)

  /* and whatever sliver is left is ground: one colour means the
     ground, several mean letters moving through the gap */
  const gap = bars.findTop - bars.mastEnd
  if (gap > 2) {
    const shot = await page.screenshot({
      clip: { x: bars.x, y: bars.mastEnd + 1, width: bars.width, height: gap - 2 },
    })
    await info.attach('the band between the two sticky bars', {
      body: shot,
      contentType: 'image/png',
    })
    const seen = new Set<string>()
    const img = decodePng(shot)
    for (let i = 0; i < img.data.length; i += 4) {
      seen.add(`${img.data[i]},${img.data[i + 1]},${img.data[i + 2]}`)
    }
    expect([...seen], 'the rows are painted in the gap between the two sticky bars').toHaveLength(1)
  }
})

/* THE CUSTOMER READS THE PICTURE (built-critique-m2.md #24). The
   caption under the stage photograph says whose rig is in it and names
   the motor on THIS quote — read here off the motor chapter's own head,
   so the two cannot disagree.

   On a hull the hero ledger holds a photograph of, found in the ledger
   rather than named here: the deepest model on the sheet has no held
   picture at all, and a stage that draws a maker's mark shows no boat
   anybody could mistake, so it carries no such caption. */
const hero = readJson<{ table: string; model: string }[]>('heroes-ledger.json').find(
  (h) => tables.find((t) => t.id === h.table)?.kind === 'boat',
)

test('the stage caption names this quote’s motor, where the photograph has another', async ({
  page,
}) => {
  expect(hero, 'the hero ledger holds no photograph of a boat').toBeDefined()
  await startAQuote(page, { table: hero!.table, model: hero!.model })
  await expect(page.locator('.cfg-shot[data-art="photograph"]')).toHaveCount(1)
  const caption = page.getByTestId('stage-caption')
  await expect(caption).toBeVisible()
  await expect(caption).toContainText('the maker’s own finish and rig')
  const head = page.locator('.cfg-head__press').filter({
    has: page.locator('.cfg-head__name', { hasText: /^Motor$/ }),
  })
  await expect(head).toHaveCount(1)
  const where = `${(await head.locator('.cfg-head__num').innerText()).trim()} Motor`
  const fact = (await head.locator('.cfg-head__fact').innerText()).trim()
  const chosen = /chosen: ([^·]+)/.exec(fact)?.[1]?.trim()
  if (chosen) await expect(caption).toContainText(chosen)
  else await expect(caption).toContainText('no motor yet')
  await expect(caption).toContainText(where)
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
