import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { cardName } from '../mint'
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
  await page.getByRole('button', { name: /The finale/ }).click()
  const act = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(act).toBeVisible()
  await expect(act).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('configurator')).toContainText('This quote is addressed to nobody.')
})

/* THE COMPONENT CRITIQUE'S MAJOR 10, walked as the critic walked it: a name typed,
   Tab, and The finale opened without pressing Address this quote. The name was
   thrown away and the finale said the quote was addressed to nobody. Closing the
   chapter is the press now, said in the toast with its way back. */
test('a name typed and left goes on the quote when its chapter closes', async ({ page }) => {
  await startAQuote(page)
  await page.getByRole('button', { name: /Who it is for/ }).click()
  const field = page.getByLabel(/Who the quote is addressed to/)
  await field.click()
  await page.keyboard.type('R. Kelleher')
  await expect(page.getByTestId('configurator')).toContainText(
    'What is typed goes on the quote when you press this, or when this chapter closes.',
  )
  await page.keyboard.press('Tab')

  await page.getByRole('button', { name: /The finale/ }).click()
  const act = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(act).toBeVisible()
  await expect(act).not.toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('configurator')).not.toContainText('addressed to nobody')
  await expect(page.getByTestId('last-step')).toContainText('For R. Kelleher')
  await expect(page.getByRole('button', { name: /Who it is for/ })).toContainText('for R. Kelleher')

  /* it is on the document, not only on the screen */
  await written(page)
  await page.reload()
  await expect(page.getByRole('button', { name: /Who it is for/ })).toContainText('for R. Kelleher')
})

/* THE SECOND VERIFY ROUND (2026-09-29). A caret that arrived while a chapter was still
   opening stopped its height where it stood: "Who it is for" pressed and the name typed at
   once left the chapter open with its body folded to a sliver under the finale's head, and
   "Address this quote" could not be pressed for two minutes (the Customers flow at 1920 on
   the ADV7, three runs of three on the old build). The body lands whole when the caret
   arrives, and only its opacity fades. Walked on the ADV7, where it was found. */
test('a name typed the moment its chapter opens lands in a chapter open to its whole height', async ({
  page,
}) => {
  await startAQuote(page, { table: 'boat_highfield', model: 'ADV7' })
  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is addressed to/).fill('R. Kelleher')
  const body = page.locator('[data-chapter="handover"] .cfg-body')
  await expect
    .poll(() =>
      body.evaluate((el) => Math.round(el.scrollHeight - el.getBoundingClientRect().height)),
    )
    .toBeLessThanOrEqual(1)
  await page.getByRole('button', { name: /Address this quote/ }).click({ timeout: 15_000 })
  await expect(page.getByTestId('last-step')).toContainText('R. Kelleher')
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
  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is addressed to/).fill('R. Kelleher')
  await page.getByRole('button', { name: /Address this quote|Save the name/ }).click()
  await expect(page.getByTestId('last-step')).toContainText('R. Kelleher')
  await page.getByRole('button', { name: /The finale/ }).click()
}

const standing = (page: Page) =>
  page.evaluate(() => ({
    mast: document.querySelector('.cfg-mast')!.getBoundingClientRect().height,
    finale: [...document.querySelectorAll('.cfg-head__press')]
      .find((b) => /The finale/.test(b.textContent ?? ''))!
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
  await give.click()
  await expect(page.getByTestId('given-seal')).toBeVisible()
  const after = await standing(page)
  expect(after.mast, 'the head grew at the press').toBeCloseTo(before.mast, 0)
  expect(Math.abs(after.finale - before.finale), 'the finale moved under the press').toBeLessThan(
    1.5,
  )
  await expect(page.locator('.cfg-mast').getByRole('button')).toHaveCount(0)

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

  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is addressed to/).fill('R. Kelleher')
  await page.getByRole('button', { name: /Address this quote|Save the name/ }).click()
  await page.getByRole('button', { name: /The finale/ }).click()
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

test('what passes under a bar that sticks is veiled at its foot, never cut', async ({
  page,
}, info) => {
  await startAQuote(page)
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
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
      return {
        name: bar.className,
        clip: {
          x: Math.ceil(left),
          y: Math.ceil(r.bottom),
          width: Math.floor(right - left) - 1,
          height: 1,
        },
        ground: [...pen.getImageData(0, 0, 1, 1).data].slice(0, 3),
      }
    })
  })
  expect(bars.length, 'no bar sticks on this build').toBeGreaterThan(0)

  let read = 0
  for (const bar of bars) {
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
   126px down under the pointer. The step is the kit's toast now, and the build
   moves the window by what the press moved, so the tile is where it was
   pressed — and where it was read when the toast's Undo takes it back. */
test('a press leaves what was pressed where it was pressed', async ({ page }) => {
  await startAQuote(page)
  const motor = page.getByRole('button', { name: /^02 Motor/ })
  if ((await motor.getAttribute('aria-expanded')) === 'false') await motor.click()
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

  /* THE STEP IS SAID IN THE KIT'S TOAST (the component critique, major 9): nothing grows
     between the field and the chapters, and the sentence and its Undo are in the window
     wherever the press was — in a hand the rail's head is far above it. */
  expect(
    await field.evaluate((el) => el.getBoundingClientRect().height),
    'the rail head grew at the press',
  ).toBeCloseTo(fieldBefore, 0)
  await expect(step).toHaveAttribute('data-sonner-toast', '')
  await expect(step).toBeInViewport({ ratio: 1 })

  /* ITS UNDO IS PRESSED IN THE CORNER, away from the list, and the list holds still under
     the reader: taking a second motor back takes the engine's sentence from over it */
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

   A way back in a toast is only a way back if a person reading the list
   with a keyboard can reach it before it leaves. Sonner's own answer:
   Alt T takes the caret to the stack and holds every toast's clock
   while it is there, and leaving the stack hands the caret back to where
   it was taken from. So this presses a motor by keyboard, reaches the
   Undo, takes the pick back and finds the caret on the row again.
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
  /* and leaving the stack, either way, puts the caret back on the row it was taken from */
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Shift+Tab')
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

/** The act of the chapter now open is in the window whenever the chapter
 *  fits between the bars — a chapter taller than that is brought in by its
 *  head, which is all the least move can promise. */
async function broughtIn(page: Page, chapter: string, act: string): Promise<boolean> {
  const section = page.locator(`[data-chapter="${chapter}"]`)
  const head = section.locator('.cfg-head__press')
  if (!(await uncovered(head))) return false
  const fits = await section.evaluate((el) => {
    const cover = Math.max(
      ...[...document.querySelectorAll('.cfg-mast, .cfg-find')]
        .filter((bar) => getComputedStyle(bar).position === 'sticky')
        .map((bar) => bar.getBoundingClientRect().bottom),
    )
    /* the shell's pill, where it is the tab bar at the foot of a phone */
    const pill = document.querySelector('.way-pill')?.getBoundingClientRect()
    const foot = pill && pill.top > innerHeight / 2 ? innerHeight - pill.top : 0
    return el.getBoundingClientRect().height <= innerHeight - cover - foot
  })
  return !fits || uncovered(section.getByRole('button', { name: act }))
}

test('pressing a motor moves the build on to the name, then the finale — never back to the hull', async ({
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
  /* the one band the picker leaves empty on this boat */
  await expect(head(/^02 Motor/)).toHaveAttribute('aria-expanded', 'true')

  await page.locator('[data-chapter="motor"] .cfg-opt button[aria-pressed="false"]').first().click()
  await expect(page.getByTestId('last-step')).toContainText('put on the quote')
  await expect(head(/^Who it is for/)).toHaveAttribute('aria-expanded', 'true')
  await expect(head(/^01 The hull/)).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('.cfg-head__press[aria-expanded="true"]')).toHaveCount(1)
  await expect(head(/^Who it is for/)).toBeFocused()
  await expect(page).not.toHaveURL(/at=/)
  await expect.poll(() => broughtIn(page, 'handover', 'Address this quote')).toBe(true)

  await page.getByLabel(/Who the quote is addressed to/).fill('R. Kelleher')
  await page.getByRole('button', { name: 'Address this quote' }).click()
  await expect(head(/^The finale/)).toHaveAttribute('aria-expanded', 'true')
  await expect(head(/^The finale/)).toBeFocused()
  await expect.poll(() => broughtIn(page, 'finale', 'Give it to the customer')).toBe(true)
  await expect(page.getByRole('button', { name: 'Give it to the customer' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  )
})
