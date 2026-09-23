import { expect, test, type Page } from '@playwright/test'
import { AT_THE_DESK, FILE_DOOR, throughTheDoor } from '../door'
import { startAQuote } from '../mint'
import { DOORS } from '../../src/app/ways'

/* ============================================================
   THE TWO SCREENS AS ONE APP.

   Everything here is about the joins rather than about either screen:
   which address a visitor lands on, what the session store remembers
   across a reload, and whether the sheet Entry read is the sheet Home
   counts. The screens' own suites are `entry.spec.ts` and
   `home.spec.ts`; this one would fail if they both passed and the
   wiring between them did not.
   ============================================================ */

test('a visitor with no name lands on the door, wherever they typed', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByTestId('entry')).toBeVisible()
  /* and the redirect is the router's, before Home is drawn: no
     flash of a screen this person has no name for */
  await expect(page.getByTestId('home')).toHaveCount(0)
})

test('a returning visitor lands on Home, and the desk keeps their name', async ({ page }) => {
  await throughTheDoor(page, { door: 'blank' })
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(AT_THE_DESK)

  /* the name is remembered through prefs, so a reload and a typed
     address both open on Home rather than on the door */
  await page.reload()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(AT_THE_DESK)
  await page.goto('/sign-in')
  await expect(page).toHaveURL(/\/$/)
})

test('the blank door leaves Home with nothing counted, and the way back to the file', async ({
  page,
}) => {
  /* THE TABLES, not everything under the pack's address: the entry
     screen reads three small files to say what the door WILL load —
     the manifest and the two picture ledgers — and it reads them
     whichever door is pressed. What "loads nothing" promises is that
     no row of the price file is fetched, and a row lives in a table. */
  let tableRequests = 0
  await page.route('**/data/northside/tables/**', (route) => {
    tableRequests += 1
    return route.continue()
  })

  await throughTheDoor(page, { door: 'blank' })
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(
    page.getByText('A blank sheet. No price file has been read into it yet.'),
  ).toBeVisible()
  await expect(page.getByTestId('pack-counts')).toHaveCount(0)
  await expect(page.getByText(/No price file is open/)).toBeVisible()

  /* AND HOME DID NOT QUIETLY LOAD IT ANYWAY. The blank door's promise
     is "loads nothing", and a Home that fetched the file on arrival
     would break it one navigation later. */
  expect(tableRequests, 'not one table of the file was fetched').toBe(0)

  /* a reload does not change that: an empty database is an empty sheet */
  await page.reload()
  await expect(
    page.getByText('A blank sheet. No price file has been read into it yet.'),
  ).toBeVisible()
  expect(tableRequests).toBe(0)

  /* the door is still reachable, which is what makes "the file can be
     loaded later" a promise and not a line */
  await page.getByRole('button', { name: 'Load the Master Price File' }).click()
  await expect(page).toHaveURL(/\/sign-in\?again=true$/)
  await expect(page.getByTestId('entry')).toBeVisible()
  /* and it does not ask for a name it already has */
  await expect(page.getByRole('textbox')).toHaveValue(AT_THE_DESK)

  await page.getByRole('button', { name: FILE_DOOR }).click()
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
  await expect(page.getByTestId('pack-counts')).toBeVisible()
  expect(tableRequests, 'this time the file really was read').toBeGreaterThan(0)
})

/* ============================================================
   THE SHELL — the pill, the finder and the ? sheet, walked in the real
   app at every one of the six viewports the config declares. Built
   2026-09-23 from direction A of docs/research/refs/shell/notes.md §5.

   WHAT THIS MEASURES THAT NO RULER CAN. `e2e/rulers/overlap.spec.ts`
   sets aside everything inside a positioned layer, with its own reason
   written down: a menu, a tooltip and a sticky header are DELIBERATELY
   over what they cover. The pill is `position: fixed`, so the overlap
   ruler cannot see it by construction — and "nothing of a screen's own
   is painted under the pill" is the one thing this direction has to be
   held to, because floating over everything is the whole of it. So it
   is measured here, against every address a person can type, at
   whatever width this project runs.
   ============================================================ */

/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs
   INSIDE the page: Playwright serialises it and evaluates it with no closure, so its helper
   cannot be hoisted out of it without breaking at runtime. The same exemption
   e2e/rulers/measure/overlap.ts takes, for the same reason. */
/** The pill's box, and every run of a screen's own text it covers. */
async function underThePill(page: Page) {
  return page.evaluate(() => {
    const pill = document.querySelector('.way-pill')
    if (!pill) return null
    const p = pill.getBoundingClientRect()
    const ownText = (el: Element): string => {
      let s = ''
      for (const n of el.childNodes) if (n.nodeType === 3) s += (n as Text).data
      return s.trim()
    }
    const covered: string[] = []
    for (const el of document.querySelectorAll('*')) {
      if (pill.contains(el)) continue
      const text = ownText(el)
      if (!text) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.display === 'none') continue
      const r = el.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) continue
      const w = Math.min(p.right, r.right) - Math.max(p.left, r.left)
      const h = Math.min(p.bottom, r.bottom) - Math.max(p.top, r.top)
      if (w <= 1 || h <= 1) continue
      covered.push(el.tagName.toLowerCase() + ' "' + text.slice(0, 40) + '"')
    }
    return { box: [p.left, p.top, p.width, p.height], covered }
  })
}

/* THE ADDRESSES A PERSON CAN TYPE. The three screens of the sale have
   no address until a quote is minted and are walked separately below;
   these eight are every other one this app answers at, and the pill
   stands on all of them. */
const TYPED = [
  '/',
  '/quotes',
  '/customers',
  '/data',
  '/history',
  '/quote/new',
  '/data/boat_highfield',
  '/nope',
]

test.describe('the shell', () => {
  test('every door reaches the address it names', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    const pill = page.getByTestId('shell-pill')
    await expect(pill).toBeVisible()

    for (const door of DOORS) {
      const word = new RegExp('^' + door.word + '( |$)')
      await pill.getByRole('link', { name: word }).click()
      await expect(page).toHaveURL(door.href === '/' ? /\/$/ : new RegExp(door.href + '$'))
      /* and the highlighted word is the screen that arrived */
      await expect(pill.getByRole('link', { name: word })).toHaveAttribute('aria-current', 'page')
    }
  })

  test('it stands on every screen but the door, and covers none of them', async ({ page }) => {
    test.setTimeout(180_000)
    /* ENTRY HAS NO SHELL. A pill offering five screens to somebody who
       has not said who they are would be five refusals in a row, and
       every board in the sweep says the same (§5). */
    await page.goto('/sign-in')
    await expect(page.getByTestId('entry')).toBeVisible()
    await expect(page.getByTestId('shell-pill')).toHaveCount(0)

    await throughTheDoor(page)
    for (const address of TYPED) {
      await page.goto(address)
      await expect(page.getByTestId('shell-pill')).toBeVisible()
      /* AT PHONE WIDTH THE PILL IS AT THE FOOT and the page scrolls
         UNDER it, which is what a tab bar does on a phone and is HIG's
         own form. What has to be true there is that the END of the
         document clears it — the foot inset every screen reads — so the
         measurement is taken at the bottom of the scroll. Over 600px
         the pill is at the top and must cover nothing at all. */
      await page.waitForTimeout(300)
      if ((page.viewportSize()?.width ?? 0) < 600) {
        /* AT PHONE WIDTH THE PILL IS A TAB BAR AT THE FOOT, and content
           scrolls UNDER it — HIG's own form, and the reason the owner's
           sentence about a bottom bar was about an ACTION bar in a quote
           flow and not about this. So what is measured here is not a
           snapshot of one scroll position: it is that the screen
           RESERVES the bar's height at its foot, which is
           `--shell-foot`, so the last thing on it can be read. */
        const room = await page.evaluate(() => {
          const pill = document.querySelector('.way-pill')
          const main = document.querySelector('main')
          if (!pill || !main) return null
          const box = pill.getBoundingClientRect()
          return {
            bar: Math.round(box.height + (window.innerHeight - box.bottom)),
            reserved: Math.round(Number.parseFloat(getComputedStyle(main).paddingBlockEnd)),
          }
        })
        expect(room, address + ' draws a pill over a screen').not.toBeNull()
        expect(
          room!.reserved,
          address + ': the screen reserves no room for the tab bar at its foot',
        ).toBeGreaterThanOrEqual(room!.bar)
        continue
      }
      const read = await underThePill(page)
      expect(read, address + ' draws a pill').not.toBeNull()
      expect(read!.covered, address + ": the pill is painted over the screen's own words").toEqual(
        [],
      )
    }
  })

  test('Ctrl K opens the finder anywhere, and a row goes where it says', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.goto('/quotes')
    await expect(page.getByTestId('quotes')).toBeVisible()

    await page.keyboard.press('Control+k')
    const finder = page.getByTestId('shell-finder')
    await expect(finder).toBeVisible()

    /* A TABLE BY NAME, and the row says what pressing it does before
       anybody presses it. */
    await page.keyboard.type('highfield')
    const table = finder.getByRole('option', { name: /^Highfield Inflatables/ }).first()
    /* the verb as it is WRITTEN: the caps are the stylesheet's, and a
       test that asserted them would be asserting a text-transform */
    await expect(table).toContainText('Open the sheet')
    await table.click()
    await expect(page).toHaveURL(/\/data\/boat_highfield/)
    await expect(finder).toHaveCount(0)
  })

  test('a row inside a table opens the sheet ON that row', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.keyboard.press('Control+k')
    await page.keyboard.type('adv9')
    const row = page.getByTestId('shell-finder').getByRole('option', { name: /ADV9/ }).first()
    await expect(row).toContainText('Open it on the sheet')
    await row.click()
    /* `?at=` is the sheet's own word for the row a record is open on,
       so a found row opens showing rather than at the top of a table */
    await expect(page).toHaveURL(/\/data\/boat_highfield\?at=/)
  })

  test('Escape shuts the finder and changes nothing', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.goto('/history')
    await expect(page.getByTestId('history')).toBeVisible()
    await page.keyboard.press('Control+k')
    await expect(page.getByTestId('shell-finder')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('shell-finder')).toHaveCount(0)
    await expect(page).toHaveURL(/\/history$/)
  })

  test('G then a letter is a door, and a letter on its own is not', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.keyboard.press('g')
    await page.keyboard.press('d')
    await expect(page).toHaveURL(/\/data$/)
    /* a letter with no G in front of it belongs to the screen, which
       is what keeps five doors out of five registers' own vocabulary */
    await page.keyboard.press('c')
    await page.waitForTimeout(200)
    await expect(page).toHaveURL(/\/data$/)
  })

  test('the ? sheet holds the whole vocabulary, and is searchable', async ({ page }, info) => {
    test.skip(
      info.project.name.startsWith('phone'),
      'the sheet is drawn under pointer: fine only — a phone has none of these keys',
    )
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.keyboard.press('?')
    const sheet = page.getByRole('dialog', { name: /Every key this app answers to/ })
    await expect(sheet).toBeVisible()
    await expect(sheet.getByText('Open the finder')).toBeVisible()
    await sheet.getByRole('searchbox', { name: 'Find a shortcut' }).fill('peek')
    await expect(sheet.getByText('Open the finder')).toHaveCount(0)
    await expect(sheet.getByText(/Peek at the one under the cursor/)).toBeVisible()
  })

  test('the finder opens with the build’s own chapters first', async ({ page }) => {
    test.setTimeout(180_000)
    const id = await startAQuote(page)
    await expect(page.getByTestId('running-total')).toBeVisible()

    await page.keyboard.press('Control+k')
    const finder = page.getByTestId('shell-finder')
    await expect(finder).toBeVisible()
    await expect(finder.getByText('On this build')).toBeVisible()
    await expect(finder.getByRole('option').first()).toContainText('Go to it')
    await page.keyboard.press('Escape')

    /* AND THE BUILD IS BEHIND THE QUOTES DOOR — one of twelve addresses
       and five doors, resolved by the longest prefix. */
    const pill = page.getByTestId('shell-pill')
    await expect(pill.getByRole('link', { name: /^Quotes( |$)/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(page.url()).toContain(id)
  })

  test('the way back is named for its destination, from a sheet', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.goto('/data/boat_highfield')
    await expect(page.getByTestId('sheet')).toBeVisible()
    const pill = page.getByTestId('shell-pill')
    await expect(pill.getByRole('link', { name: 'Back to Data' })).toBeVisible()
    await pill.locator('.way-back').click()
    await expect(page).toHaveURL(/\/data$/)
  })
})
