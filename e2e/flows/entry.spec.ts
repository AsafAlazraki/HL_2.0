import { expect, test, type Page } from '@playwright/test'

/* ============================================================
   THE FIRST THING THAT HAPPENS: somebody puts a name to the desk and
   opens Northside's price file. One door since 2026-09-25: "Start a
   blank sheet" opened the app on no file for a business with no price
   file, and is gone.

   Every figure asserted here is read off the screen, and the screen
   reads it off `data/northside/manifest.json` — so a pack that lost a
   table fails this test with a smaller number rather than showing the
   number we hoped for. Nothing is stubbed: this is the built app, the
   real file, and a real browser.
   ============================================================ */

const FILE_DOOR = /Load the Master Price File/

test('the door states what it will load, and says nothing is checked', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()

  /* no password field anywhere: a password that protects nothing is fake data */
  await expect(page.getByText('There is no password.')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
  await expect(page.getByRole('textbox')).toHaveCount(1)

  const door = page.getByRole('button', { name: FILE_DOOR })
  await expect(door).toContainText('53')
  await expect(door).toContainText('15,691')
  await expect(door).toContainText('28')
  /* and it is the one door: nothing on the screen offers the app without the file */
  await expect(page.getByRole('button')).toHaveCount(1)
  await expect(page.getByTestId('entry')).not.toContainText(/blank sheet|Loads nothing/)

  /* the photograph's own row in the file, named beside it — by the table's own name, never
     the packer's key for it */
  await expect(page.getByText(/lines in the file/)).toContainText('Stacer')
  await expect(page.getByTestId('entry')).not.toContainText('boat_stacer')
  await expect(page.getByRole('heading', { name: 'Stacer 481 SeaMaster' })).toBeVisible()

  /* RULE (c) OF THE MILESTONE 2 FIX ROUND: no plan word on a screen. "…arrives with the
     backend at Milestone 6" was the fourth line of the first screen anyone sees (critique of
     Milestone 2, #14); what will happen is said in the dealer's words instead. */
  await expect(page.getByTestId('entry')).not.toContainText(/Milestone|backend|\brepo\b/)
  /* and no promise of a thing no screen does (built-critique-m2-close-2.md, major 4) */
  await expect(page.getByText(/the name stays on this computer/)).toBeVisible()
  await expect(page.getByTestId('entry')).not.toContainText(/kept online|sign-in of their own/)

  expect(errors).toEqual([])
})

/* ============================================================
   RULE (d): A SCREEN FITS THE WINDOW IT IS DRAWN AT, OR SCROLLS ON PURPOSE.

   `entry.css` claims the composition fits at the laptop, the desk and the showroom — "a
   composition that has to be scrolled to is not the composition" — and until this round
   nothing held it to that: the critique of Milestone 2 (#10) found three screens that had
   quietly stopped fitting. The phone, the turned phone and the tablet scroll on purpose and
   say so in the same header, so they are not asserted here.
   ============================================================ */

const CLAIMS_TO_FIT = new Set(['1280x800', '1440x900', '1920x1080'])

test('fits the window it is drawn at, where it claims to', async ({ page, viewport }) => {
  const size = `${viewport?.width}x${viewport?.height}`
  test.skip(!CLAIMS_TO_FIT.has(size), `entry scrolls on purpose at ${size}`)

  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()
  /* the three small files have landed: the door says what it will load */
  await expect(page.getByRole('button', { name: FILE_DOOR })).toContainText('15,691')

  const { scroll, inner } = await page.evaluate(() => ({
    scroll: document.scrollingElement!.scrollHeight,
    inner: innerHeight,
  }))
  expect(scroll, `entry is ${scroll}px in a ${inner}px window at ${size}`).toBeLessThanOrEqual(
    inner,
  )
})

test('every act is reachable from the keyboard, in the order it is read', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()

  /* NOTHING TAKES THE CARET ON ARRIVAL (2026-09-28): a caret stills the flag, and an
     autofocused field stilled it for the whole visit. The field is the first stop, the door
     the second. */
  await expect(page.getByRole('textbox')).not.toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('textbox')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: FILE_DOOR })).toBeFocused()
})

test('a letter typed on arrival begins the name, in the field', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page.getByRole('button', { name: FILE_DOOR })).toContainText('15,691')
  await page.keyboard.type('Asaf')
  await expect(page.getByRole('textbox')).toBeFocused()
  await expect(page.getByRole('textbox')).toHaveValue('Asaf')
})

/* ============================================================
   THE SHOWPIECE MOVES, AND HOLDS FOR A CARET (the components critique, 2026-09-28, major 7).

   The critic's own measure: the flag's canvas read twice 700ms apart. With an autofocused
   field it read 0 of 7,726 pixels changed, because nothing moves while a caret is in a field
   and the caret was in the field from arrival until the file was read. Now it must flow at
   rest, hold on one frame while a caret is in the field, and flow again once the caret has
   gone. Where the browser has no WebGL there is no canvas and the band's gradient stands, and
   this says so rather than passing.
   ============================================================ */

async function flagMoves(page: Page): Promise<{ changed: number; of: number }> {
  const read = (): Promise<number[] | null> =>
    page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>('[data-mark="flag"] canvas')
      if (!c || c.width === 0) return null
      const copy = document.createElement('canvas')
      copy.width = c.width
      copy.height = c.height
      const x = copy.getContext('2d')!
      x.drawImage(c, 0, 0)
      return Array.from(x.getImageData(0, 0, copy.width, copy.height).data)
    })
  const a = await read()
  await page.waitForTimeout(700)
  const b = await read()
  if (!a || !b) return { changed: 0, of: 0 }
  let changed = 0
  for (let i = 0; i < a.length; i += 4)
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) changed += 1
  return { changed, of: a.length / 4 }
}

test('the flag’s water flows on arrival, holds while a caret is in the field, and flows again', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await expect(page.getByRole('button', { name: FILE_DOOR })).toContainText('15,691')
  const hasGl = await page.evaluate(
    () => document.createElement('canvas').getContext('webgl') !== null,
  )
  test.skip(!hasGl, 'this browser draws no WebGL, so the flag is the band’s gradient')
  /* the flag has hung and the name has come out of its blur */
  await page.waitForTimeout(1200)

  const resting = await flagMoves(page)
  expect(resting.of, 'the flag carries its water').toBeGreaterThan(0)
  expect(resting.changed, 'the water moves at rest').toBeGreaterThan(resting.of / 4)

  await page.getByRole('textbox').click()
  await page.waitForTimeout(200)
  expect((await flagMoves(page)).changed, 'nothing moves while a caret is in the field').toBe(0)

  await page.getByRole('textbox').blur()
  await page.waitForTimeout(200)
  expect((await flagMoves(page)).changed, 'the water flows again').toBeGreaterThan(resting.of / 4)
})

/* ============================================================
   PRESSED, THE DOOR IS ITS OWN PROGRESS (the components critique, 2026-09-28, major 11).

   It was a refusal while the file was read — navy, the warning glyph, "The Master Price File is
   being read now." — with the two steps that ticked 600px away in the corner of the water, and
   the refusal's row moved the card and the door under the press. The file is held at the wire
   so the state stands still long enough to read; nothing is planted.
   ============================================================ */

test('pressed, the door says what it is doing on its own face, and nothing moves under it', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.goto('/sign-in')
  const door = page.getByRole('button', { name: FILE_DOOR })
  await expect(door).toContainText('15,691')
  await page.getByRole('textbox').fill('Asaf')

  const boxes = () =>
    page.evaluate(() =>
      ['.entry-ask', '.entry-door', '.entry-empty', '.entry-aside'].map((s) => {
        const r = document.querySelector(s)!.getBoundingClientRect()
        return `${s} ${Math.round(r.y)} ${Math.round(r.height)}`
      }),
    )
  const before = await boxes()

  let release: (() => void) | undefined
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/data/northside/**', async (route) => {
    await held
    await route.continue().catch(() => {})
  })
  await door.focus()
  await page.keyboard.press('Enter')

  const reading = page.getByRole('button', { name: /^Reading the Master Price File/ })
  await expect(reading).toBeVisible()
  await expect(reading).toHaveAttribute('aria-busy', 'true')
  await expect(reading).not.toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('entry')).not.toContainText('being read now')
  await expect(page.getByRole('status')).toContainText('Reading the Master Price File')
  expect(await boxes(), 'the card, the door, the foot and the panel stand still').toEqual(before)

  release?.()
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
})

test('a name, Enter, and the whole Master Price File is in the app on Home', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  /* counted rather than assumed: the door promises 53 tables, so 53 table files are what
     pressing it fetches. The count is the door's own claim, checked on the wire. */
  let tableRequests = 0
  await page.route('**/data/northside/tables/**', (route) => {
    tableRequests += 1
    return route.continue()
  })

  await page.goto('/sign-in')
  const field = page.getByRole('textbox')
  await field.fill('Asaf')
  /* Enter in the field presses the first door, which is the file */
  await field.press('Enter')

  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
  await expect(page.getByTestId('entry')).toHaveCount(0)
  expect(tableRequests).toBe(53)

  expect(errors).toEqual([])
})

/* THE PILL ARRIVES WITH HOME (the components critique, 2026-09-28, major 11: "the pill is then
   drawn over Entry's 'packed…' stamp for a moment"). The router draws the shell for `/` a few
   frames before Entry leaves; measured on the built app at 1440 × 900, the two were on the page
   together for 70ms outside any transition, and the crossfade carried the pill over the stamp.
   Every frame from the press to Home is read here. */
test('the pill arrives with Home and is never drawn over the door', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page.getByRole('button', { name: FILE_DOOR })).toContainText('15,691')
  await page.getByRole('textbox').fill('Asaf')
  await page.evaluate(() => {
    const seen = { frames: 0, over: 0, pillAfter: 0 }
    ;(window as unknown as { entrySeen: typeof seen }).entrySeen = seen
    const tick = (): void => {
      const entry = document.querySelector('[data-testid="entry"]')
      const pill = document.querySelector('[data-testid="shell-pill"]')
      const drawn = pill?.checkVisibility({ visibilityProperty: true }) ?? false
      seen.frames += 1
      if (entry && drawn) seen.over += 1
      if (!entry && drawn) seen.pillAfter += 1
      if (seen.pillAfter < 10) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.getByRole('textbox').press('Enter')
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
  await expect(page.getByTestId('shell-pill')).toBeVisible()
  const seen = await page.evaluate(
    () => (window as unknown as { entrySeen: { frames: number; over: number } }).entrySeen,
  )
  expect(seen.frames, 'the frames from the press to Home were read').toBeGreaterThan(10)
  expect(seen.over, 'frames with the pill drawn over the door').toBe(0)
})

test('a returning visitor never sees the door again', async ({ page }) => {
  await page.goto('/sign-in')
  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: FILE_DOOR }).click()
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })

  /* the name is remembered through prefs, so the address itself now sends them to Home */
  await page.goto('/sign-in')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByTestId('entry')).toHaveCount(0)
})

test('a file that cannot be reached is refused in a sentence that says what to do', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()

  /* the request never reaches a server after the screen has read the manifest, which is what
     a dropped connection looks like from the browser */
  await page.route('**/data/northside/entities.json', (route) => route.abort('failed'))

  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: FILE_DOOR }).click()

  const said = page.getByRole('alert')
  await expect(said).toContainText('The Master Price File was not loaded')
  await expect(said).toContainText('Check the computer is online, then press the door again.')
  /* still on the door, and the door is still a door: not disabled, not silent, and nothing
     else offered in its place */
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: FILE_DOOR })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  )
  await expect(page.getByRole('button')).toHaveCount(1)

  /* AND NO NAME WAS KEPT (2026-09-25): the name is given with the file, so a read that failed
     leaves the next visit on this door — never on a Home with no file on it */
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.goto('/')
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
})

test('a file missing from where the app keeps it says pressing again will not find it', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await expect(page.getByTestId('entry')).toBeVisible()

  /* the server answers and hands nothing over, which is what a half-published build is */
  await page.route('**/data/northside/entities.json', (route) =>
    route.fulfill({ status: 404, body: 'not here' }),
  )

  await page.getByRole('textbox').fill('Asaf')
  await page.getByRole('button', { name: FILE_DOOR }).click()

  const said = page.getByRole('alert')
  await expect(said).toContainText('part of it (entities.json) is missing')
  await expect(said).toContainText('whoever looks after this app has to put the file back')
  await expect(page).toHaveURL(/\/sign-in$/)
})
