import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { MODEL, startAQuote, written } from '../mint'

/* ============================================================
   THE DIARY, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   Nothing is planted in IndexedDB. A document exists here because the
   walk in `e2e/mint.ts` pressed the act on the picker, which is how a
   document comes to exist for a dealer too — and the diary's first
   line is that press, read back off the document the store kept it
   on. What the rulers cannot see is asserted here: that the empty
   state teaches rather than apologises, that a line opens in place to
   the sentence the app said, that Enter lands where it says, that the
   act on a past thing writes a new document and takes it back, and
   that the geometry the screen owes at 1280×800 is the geometry it
   has.

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

  /* the legend is drawn where there is a keyboard and not where there is none */
  const legend = page.locator('.hy-keys')
  if (hasTouch) await expect(legend).toBeHidden()
  else await expect(legend).toBeVisible()

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
  await expect(line).toContainText(MODEL)
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
  await expect(fold).toContainText(`${MODEL}`)
  await expect(fold).toContainText(/— quote \d{8}-\d{2}/)
  await expect(fold).toContainText(/Today · \d\d:\d\d/)
  await expect(fold).toContainText('1 event in all · 1 on Today')
  expect(await line.getAttribute('aria-expanded')).toBe('true')

  /* the act opens the document where it belongs: a draft, where it is written */
  const open = fold.getByRole('button', { name: 'Open the build' })
  await expect(open).toHaveAttribute('aria-disabled', 'false')
  await expect(fold).toContainText('It opens where it is written')
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
  await expect(page.getByRole('status')).toContainText('Today:')

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

test('the diary goes back to Home, and a browser with no name never reaches it', async ({
  page,
}) => {
  await page.goto('/history')
  await expect(page).toHaveURL(/\/sign-in$/)
  await throughTheDoor(page)
  await page.goto('/history')
  await expect(page.locator('[data-testid="history"][data-read]')).toBeVisible()
  await page.getByRole('button', { name: 'Home' }).click()
  await expect(page.getByTestId('home')).toBeVisible()
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

test.describe('the density this diary owes', () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1280,
    'the 18-line requirement is stated at 1280x800',
  )

  test('has room for eighteen lines under Today’s node at 1280x800, measured in its own cascade', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    await arriveWithOne(page)

    /* THE ROOM THE SPINE GETS, not the box it is drawn in today: the
       body track less the legend under it — the same two boxes
       `e2e/routes.ts` names for the density ruler — and the two
       lengths resolved in the screen's own cascade rather than parsed
       out of a calc() string. */
    const read = await page.evaluate(() => {
      const body = document.querySelector('.hy-body')
      const keys = document.querySelector('.hy-keys')
      const spine = document.querySelector('.hy-spine')
      const head = document.querySelector('.hy-day[data-today] .hy-dayhead')
      const line = document.querySelector('.hy-line')
      if (!body || !keys || !spine || !head || !line) return null
      const resolve = (token: string): number => {
        const probe = document.createElement('div')
        probe.style.height = `var(${token})`
        spine.append(probe)
        const height = probe.getBoundingClientRect().height
        probe.remove()
        return height
      }
      return {
        room: body.getBoundingClientRect().height - keys.getBoundingClientRect().height,
        todayHead: head.getBoundingClientRect().height,
        line: resolve('--line-h'),
        day: resolve('--day-h'),
        drawnLine: line.getBoundingClientRect().height,
      }
    })
    expect(read, 'the diary, its spine and its legend are all on the page').not.toBeNull()
    const { room, todayHead, line, day, drawnLine } = read!
    const fits = Math.floor((room - todayHead) / line)
    const fitsWithTwoMoreDays = Math.floor((room - todayHead - 2 * day) / line)
    // eslint-disable-next-line no-console
    console.log(
      `  history      ${room.toFixed(0)}px for the spine, ${line}px lines (drawn ${drawnLine.toFixed(0)}), ${todayHead.toFixed(0)}px Today node, ${day}px day nodes → ${fits} lines under Today, ${fitsWithTwoMoreDays} under three nodes`,
    )
    expect(line, 'the line pitch the sweep chose').toBe(28)
    expect(drawnLine, 'and the drawn line is that pitch').toBe(28)
    expect(fits, 'eighteen lines fit under Today’s node at 1280x800').toBeGreaterThanOrEqual(18)
    expect(
      fitsWithTwoMoreDays,
      'and still with two more day nodes on the spine',
    ).toBeGreaterThanOrEqual(18)
  })
})
