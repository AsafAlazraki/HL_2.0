import { expect, test, type Page } from '@playwright/test'
import { AT_THE_DESK, FILE_DOOR } from '../door'
import { issueIt, startAQuote, written } from '../mint'
import { FIXED_TIME, settle } from '../shots/recipe'
import { expectClean, readContrast, wearTheme, type Reading } from './measure/read'
import { plantRefusals, specimens } from './measure/refusals'
import { THEMES } from './measure/theme'

/* ============================================================
   THE REFUSAL RULER: every reason this app gives for not acting, read
   where it is said, in both themes.

   WHY THIS FILE EXISTS. On 2026-09-24 the second close's critic opened
   the finale of a quote with no name on it and measured the sentence
   under the refused `Give it to the customer` at 1.23 : 1 — #DDE9F3 on
   a white plate — and the same under `Discard this quote` in the
   register's peek. The contrast ruler had just reported 0 below
   threshold on fourteen routes at six sizes. It was not wrong about
   anything it read. It never read a refusal:

     1. A STATE IT NEVER REACHED. Every route is a screen at rest, and
        a refusal is said only after a press — the finale opened on an
        unaddressed quote, a peek opened on an issued one, a door
        pressed while the file is read. Not one `.ui-refusal` is on any
        page the route walk opens: measured 2026-09-24, none on the
        fourteen routes at six sizes, by day or by night.
     2. A THEME IT NEVER RAN IN. The rule at fault (src/ui/button.css)
        inked the sentence "for the dark room", which was the default
        until that morning. `contrast.spec.ts` now reads every route in
        both themes; this file reads every refusal in both.

   (The third candidate — a colour set on a ground the walk never
   composited — was checked and is not it: pointed at the finale, the
   sweep reads the sentence at 1.23 : 1, the critic's figure, because
   the plate is an ancestor it composites. It could not measure a
   sentence that was not there.)

   WHAT IT READS.
     · The sale's two refusals, at six sizes: the finale of a quote
       addressed to nobody, and the peek of a quote already given.
     · Entry's two doors, which both refuse while the file is read and
       stand on the dusk photograph, at six sizes, measured off the
       pixels. Its first run found one more nobody had read: at
       844 × 390 the file door's sentence falls across the lit hull at
       3.94 : 1 in both themes, which no ruler had ever seen because no
       ruler had ever pressed that door. It now carries its own veil
       (src/ui/button.css).
     · The board (`measure/refusals.ts`): every context the primitives
       declare, on the ground each is drawn for, once.

   Each reading must have READ THE REASON IT CAME FOR, by its text,
   with a figure — `expectReason` — so a walk that arrives somewhere
   the refusal is not said is red, not clean. `fixture.spec.ts` proves
   the board and the theme pass can fail: at 1.23 : 1 they do, and at
   4.5 : 1 they do not.
   ============================================================ */

/** The recipe `open()` applies, for walks that are not a route: the clock and the motion. */
async function recipe(page: Page): Promise<void> {
  await page.clock.setFixedTime(FIXED_TIME)
  await page.emulateMedia({ reducedMotion: 'reduce' })
}

/** Both themes on the page as it stands, then the day again for whatever is pressed next. */
async function inBothThemes(page: Page, label: string): Promise<Reading[]> {
  await settle(page)
  const readings: Reading[] = []
  for (const theme of THEMES) readings.push(await readContrast(page, label, theme))
  await wearTheme(page, 'day')
  return readings
}

/** Every reading read this reason — by its opening words — and it cleared the line. */
function expectReason(readings: Reading[], opens: string): void {
  for (const r of readings) {
    const said = r.reasons.find((x) => x.text.startsWith(opens))
    expect(said, `${r.theme}: "${opens}…" was on the page, under its control`).toBeDefined()
    expect(said!.ratio, `${r.theme}: "${opens}…" was given a figure`).not.toBeNull()
    expect(
      said!.ratio!,
      `${r.theme}: "${opens}…" reads at ${said!.ratio}:1 and owes ${said!.need}`,
    ).toBeGreaterThanOrEqual(said!.need)
  }
}

test('the sale’s refusals — the finale addressed to nobody, and a given quote’s peek', async ({
  page,
}) => {
  /* the mint, the finale, the sale and a reload: four screens long, and the
     blue door reads 53 tables on the way in */
  test.setTimeout(180_000)
  await recipe(page)
  await startAQuote(page)

  /* THE FINALE OF A QUOTE WITH NO NAME ON IT — the critic's first figure. */
  await page.getByRole('button', { name: /The finale/ }).click()
  const give = page.getByRole('button', { name: 'Give it to the customer' })
  await expect(give).toHaveAttribute('aria-disabled', 'true')
  const finale = await inBothThemes(page, 'the finale')
  expectReason(finale, 'This quote is addressed to nobody.')
  expectClean(finale)

  /* A GIVEN QUOTE'S PEEK ON THE REGISTER — the critic's second. The row is
     pressed, which is how a dealer peeks; the write-behind is waited out
     before the reload, the way `e2e/mint.ts` says to. */
  await issueIt(page)
  await written(page)
  await page.goto('/quotes')
  await expect(page.locator('[data-testid="quotes"][data-read]')).toBeVisible()
  await page.locator('.qr-row').first().click()
  const discard = page.getByRole('button', { name: 'Discard this quote' })
  await expect(discard).toHaveAttribute('aria-disabled', 'true')
  const peek = await inBothThemes(page, 'the given peek')
  expectReason(peek, 'This quote has been given to the customer, so it stays.')
  expectClean(peek)
})

test('entry’s doors, refused while the file is read, on the water they stand on', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await recipe(page)
  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()
  /* the counts on the blue door are the file's own, read at the door's first
     paint; once they are there, what the press reads next is the tables */
  await expect(page.getByRole('button', { name: FILE_DOOR })).toContainText(/\d/)
  await page.getByRole('textbox').fill(AT_THE_DESK)

  /* THE FILE IS HELD AT THE WIRE while the doors are read, so the state a
     dealer sees for a second or two stands still long enough to measure.
     Nothing is planted: the press is the real press and the requests are the
     real requests, only late. */
  let release: (() => void) | undefined
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/data/northside/**', async (route) => {
    await held
    await route.continue().catch(() => {})
  })

  await page.getByRole('button', { name: FILE_DOOR }).click()
  await expect(page.getByRole('button', { name: FILE_DOOR })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await expect(page.getByRole('button', { name: /Start a blank sheet/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
  const doors = await inBothThemes(page, 'entry, reading')
  expectReason(doors, 'The Master Price File is being read now.')
  expectClean(doors)

  release?.()
  await page.unrouteAll({ behavior: 'ignoreErrors' })
})

test.describe('the board', () => {
  /* One viewport: a primitive's ink does not change with the window, and the
     walks above already read the real refusals at all six. */
  test.skip(({ viewport }) => viewport?.width !== 1440, 'the board is read once, not per viewport')

  test('every refusal the primitives can say, on every ground they stand on, in both themes', async ({
    page,
  }) => {
    await recipe(page)
    /* ANY PAGE OF THE BUILT APP CARRIES THE WHOLE STYLESHEET: src/ui/ui.css is
       imported by src/styles/app.css, so the door, fresh, is the cheapest
       page that has every primitive's rules and every token on it. */
    await page.goto('/sign-in')
    await expect(page.getByTestId('entry')).toBeVisible()

    const board = specimens()
    const planted = await page.evaluate(plantRefusals, board)
    expect(planted, 'one refusal for every context on every ground').toBe(board.length)
    expect(
      board.filter((s) => s.primitive === 'button').length,
      'the board carries every button context the primitive declares',
    ).toBeGreaterThanOrEqual(10)

    const readings = await inBothThemes(page, 'the board')
    for (const r of readings) {
      expect(r.reasons, `${r.theme}: every planted reason was read`).toHaveLength(board.length)
      expect(
        r.reasons.filter((x) => x.ratio === null).map((x) => x.text),
        `${r.theme}: every reason was given a figure`,
      ).toEqual([])
    }
    expectClean(readings)
  })
})
