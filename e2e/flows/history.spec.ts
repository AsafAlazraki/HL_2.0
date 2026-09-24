import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { MODEL_SAID, issueIt, startAQuote, written } from '../mint'
import { routes } from '../routes'
import { readDensity } from '../rulers/measure/density'
import { open as arrive } from '../shots/recipe'

/* ============================================================
   THE DIARY, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   Nothing is planted in IndexedDB. A document exists here because the
   walk in `e2e/mint.ts` pressed the act on the picker, which is how a
   document comes to exist for a dealer too — and the diary's first
   line is that press, read back off the document the store kept it
   on. What the rulers cannot see is asserted here: that the empty
   state teaches rather than apologises, that a line opens in place to
   the sentence the app said, that Enter lands where it says, that the
   act on a past thing writes a new document and takes it back, and —
   reading the density ruler's own measurement — that the spine still
   holds eighteen lines at 1280×800 with three days on it.

   THE WALK IS LONG, so its budget is said out loud rather than left
   at Playwright's thirty seconds: four screens and 15,691 rows through
   the blue door before the first assertion.
   ============================================================ */

const REFERENCE = /\d{8}-\d{2}/

/** Mint a document, wait the write-behind out, and arrive on the diary. */
async function arriveWithOne(page: Page): Promise<string> {
  const id = await startAQuote(page)
  await written(page)
  await page.goto('/history')
  await expect(page.locator('[data-testid="history"][data-read]')).toBeVisible()
  return id
}

test('the diary teaches on the day it is empty, and its one act starts a quote', async ({
  page,
  hasTouch,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await throughTheDoor(page)
  await page.goto('/history')
  await expect(page.locator('[data-testid="history"][data-read]')).toBeVisible()

  const spine = page.getByRole('grid', { name: 'History' })
  const today = spine.getByRole('rowgroup', { name: 'Today' })
  await expect(today).toBeVisible()
  await expect(
    today.getByRole('heading', { name: 'Nothing has been written in this diary yet.' }),
  ).toBeVisible()
  for (const q of ['What will appear here', 'Why it is empty today', 'Where a quote starts']) {
    await expect(today.getByText(q)).toBeVisible()
  }
  await expect(page.getByText('0 quotes · 0 days · 0 events')).toBeVisible()
  /* no spans, no field, no picture: nothing to cut and nothing to stand in */
  await expect(page.getByRole('group', { name: 'Which days' })).toHaveCount(0)
  await expect(page.getByRole('searchbox')).toHaveCount(0)
  expect(await page.locator('main img').count(), 'no picture on an empty diary').toBe(0)

  /* no legend over nothing: every key it teaches acts on a line, and there is none yet —
     and no cap anywhere on a device with no keys (rule (b), critique #18) */
  await expect(page.locator('.hy-keys')).toHaveCount(0)
  if (hasTouch) {
    const caps = await page
      .locator('[data-testid="history"] kbd')
      .evaluateAll((all) => all.filter((k) => (k as HTMLElement).offsetParent !== null).length)
    expect(caps, 'no cap is drawn on a touch screen').toBe(0)
  }

  const act = today.getByRole('button', { name: 'New quote' })
  await expect(act).toHaveAttribute('aria-disabled', 'false')
  await expect(act, 'the diary’s one amber').toHaveAttribute('data-intent', 'act')
  await act.click()
  await expect(page).toHaveURL(/\/quote\/new$/)
  await expect(page.getByTestId('picker-counts')).toBeVisible()

  expect(errors, 'no page error').toEqual([])
})

test('a started quote is the diary’s first line, under Today, and opens in place to the sentence the app said', async ({
  page,
}) => {
  test.setTimeout(120_000)
  const id = await arriveWithOne(page)

  const spine = page.getByRole('grid', { name: 'History' })
  const today = spine.getByRole('rowgroup', { name: 'Today' })
  const line = today.locator('.hy-line')
  await expect(line).toHaveCount(1)
  await expect(line).toContainText('started')
  await expect(line).toContainText(MODEL_SAID)
  await expect(line).toContainText(REFERENCE)
  await expect(line).toContainText('Nobody named on it')
  await expect(line).toContainText('Draft')
  /* the head carries the day's tally, counted */
  await expect(today.locator('.hy-dayhead')).toContainText('1 quote · 1 event')
  await expect(page.getByText(/1 quote · 1 day · 1 event/)).toBeVisible()

  /* one press opens it in place; what it opens into is the mint's own
     sentence, with its time, and the document stays where it is */
  await line.click()
  const fold = page.getByTestId('fold')
  await expect(fold).toBeVisible()
  await expect(fold).toContainText(MODEL_SAID)
  await expect(fold).toContainText(/— quote \d{8}-\d{2}/)
  await expect(fold).toContainText(/Today · \d\d:\d\d/)
  await expect(fold).toContainText('1 event in all · 1 on Today')
  expect(await line.getAttribute('aria-expanded')).toBe('true')

  /* the act opens the document where it belongs: a draft, where it is written */
  const open = fold.getByRole('button', { name: 'Open the build' })
  await expect(open).toHaveAttribute('aria-disabled', 'false')
  await expect(fold).toContainText('It opens on the build, where it is written')
  await open.click()
  await expect(page).toHaveURL(new RegExp(`/quote/${id}$`))
  await expect(page.getByTestId('configurator')).toBeVisible()
})

test('the address carries the open line and the span, and both survive a reload', async ({
  page,
}) => {
  test.setTimeout(120_000)
  const id = await arriveWithOne(page)
  const spine = page.getByRole('grid', { name: 'History' })
  await spine.locator('.hy-line').first().click()
  await expect(page).toHaveURL(new RegExp(`open=${id}`))
  await expect(page).toHaveURL(/day=\d{4}-\d{2}-\d{2}/)

  await page.getByRole('button', { name: /^Today/ }).click()
  await expect(page).toHaveURL(/span=today/)
  await expect(page.getByRole('status')).toContainText(/^Today/)

  await page.reload()
  await expect(page.locator('[data-testid="history"][data-read]')).toBeVisible()
  await expect(page.getByTestId('fold')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Today/ })).toHaveAttribute('aria-pressed', 'true')
})

test('quote this again writes a new document at today’s prices, says so on the head of the spine, and takes it back', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await arriveWithOne(page)
  const spine = page.getByRole('grid', { name: 'History' })
  const today = spine.getByRole('rowgroup', { name: 'Today' })
  await today.locator('.hy-line').first().click()

  const fold = page.getByTestId('fold')
  const again = fold.getByRole('button', { name: 'Quote this again, at today’s prices' })
  await expect(again, 'the row is on the sheet, so the act is live').toHaveAttribute(
    'aria-disabled',
    'false',
  )
  await again.click()

  /* the diary records the act it just did: two lines under Today, the
     newer one first, and the step names the reference it minted */
  await expect(today.locator('.hy-line')).toHaveCount(2)
  const step = page.getByTestId('last-step')
  await expect(step).toContainText(/— quote \d{8}-\d{2}/)
  await expect(today.locator('.hy-line').first()).toContainText('started')
  await expect(today.locator('.hy-dayhead')).toContainText('2 quotes')

  await step.getByRole('button', { name: 'Discard it' }).click()
  await expect(today.locator('.hy-line')).toHaveCount(1)
  await expect(step).toContainText('was discarded')
})

/* THE PILL CARRIES THE DOORS (rule (a) of the 2026-09-23 round, critique #13): the diary's
   own head has no Home, and the way home is the pill's. */
test('the diary goes back to Home by the pill, and a browser with no name never reaches it', async ({
  page,
}) => {
  await page.goto('/history')
  await expect(page).toHaveURL(/\/sign-in$/)
  await throughTheDoor(page)
  await page.goto('/history')
  await expect(page.locator('[data-testid="history"][data-read]')).toBeVisible()
  await expect(page.getByTestId('history').getByRole('button', { name: 'Home' })).toHaveCount(0)
  await page.getByTestId('shell-pill').getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page.getByTestId('home')).toBeVisible()
})

/* THE ORDER A SITTING WENT IN, ON THE REAL WALK (critique #4). The walk's clock is fixed, so
   the start, the name and the issue share one instant, and until 2026-09-23 the line read
   `addressed · started · issued` on one run and `issued · addressed · started` on another.
   It is read twice — once as the store first returns the document, once after a reload
   reads it back out of IndexedDB — and must say the same true thing both times. */
test('a quote given in one sitting reads in the order it happened, on every read', async ({
  page,
}) => {
  test.setTimeout(150_000)
  await startAQuote(page)
  await issueIt(page)
  await written(page)
  for (const read of ['first', 'after a reload']) {
    if (read === 'first') await page.goto('/history')
    else await page.reload()
    await expect(page.locator('[data-testid="history"][data-read]')).toBeVisible()
    const what = page
      .getByRole('grid', { name: 'History' })
      .getByRole('rowgroup', { name: 'Today' })
      .locator('.hy-line .hy-cell--what')
    await expect(what, `the ${read} read`).toHaveText('started · addressed · issued')
  }
})

test('the spine never overflows sideways, and the act is in the flow at every size', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await arriveWithOne(page)
  const read = await page.evaluate(() => {
    const act = document.querySelector('.hy-dayhead__act .ui-button')
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      position: act ? getComputedStyle(act).position : 'missing',
      framePosition: act?.parentElement ? getComputedStyle(act.parentElement).position : 'missing',
    }
  })
  expect(read.scrollWidth, 'no horizontal overflow').toBeLessThanOrEqual(read.clientWidth)
  expect(read.position, 'the act is never a floating bar').toBe('static')
  expect(read.framePosition).toBe('static')
})

/* A SCREEN FITS THE WINDOW IT IS DRAWN AT, OR SCROLLS ON PURPOSE (rule (d), critique #10).
   On a desk — 1280×800, 1440×900, 1920×1080 — the diary claims to fit: the head and the foot
   stay put and the spine is its own scrollport, so the page is exactly the window. Under
   1200px the page IS the scrollport, on purpose, and only sideways overflow is refused. And
   the floor under a young diary is composed rather than left over (rule (e), critique #17):
   the spine runs on from the last line to where the diary began, and ends at the window's
   foot. */
test('fits the window it is drawn at on a desk, with the spine drawn down to where the diary began', async ({
  page,
  viewport,
}) => {
  test.setTimeout(120_000)
  await arriveWithOne(page)
  const end = page.getByRole('region', { name: 'Where this diary begins' })
  await expect(end).toBeVisible()
  const read = await page.evaluate(() => {
    const port = document.querySelector('.hy-spine')!.getBoundingClientRect()
    const origin = document.querySelector('.hy-end')!.getBoundingClientRect()
    return {
      scrollHeight: document.scrollingElement!.scrollHeight,
      innerHeight: window.innerHeight,
      portBottom: port.bottom,
      endBottom: origin.bottom,
    }
  })
  if ((viewport?.width ?? 0) >= 1200) {
    expect(read.scrollHeight, `${read.scrollHeight} in ${read.innerHeight}`).toBeLessThanOrEqual(
      read.innerHeight,
    )
    /* the end of the spine stands at the foot of its port, not under the last line */
    expect(Math.abs(read.portBottom - read.endBottom)).toBeLessThanOrEqual(1)

    /* RULE (e), the M2-close critique's finding 6: "one line, then about 300 px of nothing
       above the rhythm and 280 px below it" at 1920. At a desk the fortnight is a calendar
       that takes the run, so no band of the run between the last line and the ring is
       empty for more than a fifth of the window */
    const run = await page.evaluate(() => {
      const lines = [...document.querySelectorAll('.hy-grid [role="row"]')]
      const lastLine = Math.max(...lines.map((l) => l.getBoundingClientRect().bottom))
      const fortnight = document.querySelector('.hy-rhythm')!.getBoundingClientRect()
      const ring = document.querySelector('.hy-end__lab')!.getBoundingClientRect()
      const shown = [...document.querySelectorAll<HTMLElement>('.hy-rhythm__day')].filter(
        (d) => d.offsetParent !== null,
      )
      return {
        above: fortnight.top - lastLine,
        below: ring.top - fortnight.bottom,
        tile: Math.min(...shown.map((d) => d.getBoundingClientRect().height)),
        /* a tile drawn for a day before the diary began */
        unkept: shown.filter((d) => !d.hasAttribute('data-kept')).length,
      }
    })
    const fifth = read.innerHeight / 5
    expect(run.above, `${Math.round(run.above)}px over the fortnight`).toBeLessThanOrEqual(fifth)
    expect(run.below, `${Math.round(run.below)}px under it`).toBeLessThanOrEqual(fifth)
    /* m2-last-critique.md major 7: thirteen empty dashed boxes, every one a day before the
       diary began. They are one cell in words now, and the kept day is a tile with its boat */
    expect(run.unkept, 'no tile for a day before the diary began').toBe(0)
    expect(run.tile).toBeGreaterThanOrEqual(80)
    await expect(page.locator('.hy-rhythm__before')).toContainText('before this diary began')
    await expect(page.locator('.hy-rhythm__day[data-today] .hy-boat__name').first()).toBeVisible()
  }
  await expect(end.locator('.hy-end__lab')).toHaveText(/^Since \d\d:\d\d, \w+day \d{1,2} \w+$/)
})

/* NO KEYCAP AT ANY SIZE (m2-last-critique.md major 7, 2026-09-25): twenty-three caps taught
   single-letter keys at a desk, and WCAG 2.1.4 asks those to be switchable. None is drawn now,
   on a phone or a desk, and one sentence a finger and a mouse share says how to open a line. */
test('draws no keycap at any size, and says how to open a line in words', async ({ page }) => {
  test.setTimeout(120_000)
  await arriveWithOne(page)
  const visible = await page
    .locator('[data-testid="history"] kbd')
    .evaluateAll((all) => all.filter((k) => (k as HTMLElement).offsetParent !== null).length)
  expect(visible, 'no cap is drawn').toBe(0)
  await expect(page.locator('.hy-touch')).toBeVisible()
  /* and a letter pressed on the spine does nothing */
  const spine = page.getByRole('grid', { name: 'History' })
  await spine.focus()
  await page.keyboard.press('t')
  await expect(page).not.toHaveURL(/span=today/)
})

/* THE DENSITY THIS DIARY OWES AT REST — eighteen lines under Today's node — is measured in
   one place, `e2e/rulers/density.spec.ts`, on the diary its route reaches. This file asks the
   stricter question this screen's builder set: that eighteen still fit with two more day nodes
   on the spine, which is what a diary looks like after a week of use. It asks it OF THE
   RULER'S OWN READING, on the same walk, so the two can never again disagree about the room:
   until 2026-09-23 this case added up its own. The two older nodes are not drawn on a diary
   of one day, so their height is this screen's own `--day-h`, resolved in the spine's own
   cascade. */

test.describe('the density this diary owes, three days deep', () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1280,
    'the 18-line requirement is stated at 1280x800',
  )

  test('eighteen lines still fit with two more day nodes on the spine, by the ruler’s own reading', async ({
    page,
  }) => {
    const route = routes.find((r) => r.name === 'history')!
    await arrive(page, route)
    const d = await page.evaluate(readDensity, route.density!)
    const day = await page.evaluate(() => {
      const spine = document.querySelector('.hy-spine')
      if (!spine) return 0
      const probe = document.createElement('div')
      probe.style.height = 'var(--day-h)'
      spine.append(probe)
      const height = probe.getBoundingClientRect().height
      probe.remove()
      return height
    })
    expect(d.pitch, 'the ruler read its pitch off a real line').not.toBeNull()
    expect(day, 'the day node is this screen’s own token').toBeGreaterThan(0)
    const deeper = Math.floor((d.room - d.heads - 2 * day) / d.pitch!)
    // eslint-disable-next-line no-console
    console.log(
      `  history        three days deep: ${d.room.toFixed(0)}px of room less ${d.heads.toFixed(0)}px for Today and 2 × ${day}px day nodes → holds ${deeper} of 18`,
    )
    expect(
      deeper,
      'eighteen lines still fit with two more day nodes on the spine',
    ).toBeGreaterThanOrEqual(18)
  })
})
