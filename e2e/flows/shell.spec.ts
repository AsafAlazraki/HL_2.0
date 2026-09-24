import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { AT_THE_DESK, FILE_DOOR, throughTheDoor, withoutTheFile } from '../door'
import { issueIt, openTheDocument, raiseTheRung, startAQuote } from '../mint'
import { APP_NAME, DOORS } from '../../src/app/ways'
import { initialsOf } from '../../src/domain/shell/crest'

/** One of the file's own tables, read off the pack as the browser reads it — never typed here. */
const TABLE = (id: string): Array<{ id: string; values: Record<string, unknown> }> =>
  JSON.parse(
    readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '..',
        '..',
        'data',
        'northside',
        'tables',
        `${id}.json`,
      ),
      'utf8',
    ),
  ) as Array<{ id: string; values: Record<string, unknown> }>

/** What the file calls its business — read off the pack's own manifest, never typed here. */
const BUSINESS = (
  JSON.parse(
    readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '..',
        '..',
        'data',
        'northside',
        'manifest.json',
      ),
      'utf8',
    ),
  ) as { name: string }
).name

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
  await throughTheDoor(page)
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

/* A BROWSER THAT REMEMBERS THE NAME AND HOLDS NO COPY OF THE FILE — read once and not kept,
   or let go by the browser. Until 2026-09-25 this was reached by Entry's second door, "Start a
   blank sheet", for a business with no price file; that door is gone, and this state is
   Northside's own, walked to by losing the copy (`withoutTheFile`). */
test('a browser that has lost its copy of the file says so on Home, and the way back to it', async ({
  page,
}) => {
  await withoutTheFile(page)

  /* THE TABLES, counted from here on: what matters is that Home does not quietly fetch the
     file it no longer holds, and a row of the price file lives in a table. */
  let tableRequests = 0
  await page.route('**/data/northside/tables/**', (route) => {
    tableRequests += 1
    return route.continue()
  })

  await expect(page.getByText('The Master Price File is not in this browser yet.')).toBeVisible()
  await expect(page.getByTestId('pack-counts')).toHaveCount(0)
  await expect(page.getByText(/No price file is open/)).toBeVisible()
  /* nothing is said about a business nobody named: Northside is named by its file */
  await expect(page.getByTestId('home')).not.toContainText(/not been named|blank sheet/i)

  /* THE CREST IS NEVER A HOLE (critique #21). No file has named a business, so the medallion
     carries the app's own sign — the helm — and says the app's name; before 2026-09-23 it was
     an empty blue disc on exactly this desk. */
  const crest = page.getByTestId('shell-pill').locator('.way-crest')
  await expect(crest).toHaveAttribute('data-crest', 'helm')
  await expect(crest).toHaveAccessibleName(`${APP_NAME} — Home`)
  await expect(crest.locator('svg')).toBeVisible()

  /* AND HOME DID NOT QUIETLY LOAD IT. Home reads this browser and never the file; the door
     is where the file is read, and it is offered right here. */
  expect(tableRequests, 'not one table of the file was fetched').toBe(0)

  /* a reload does not change that: an empty database is an empty sheet */
  await page.reload()
  await expect(page.getByText('The Master Price File is not in this browser yet.')).toBeVisible()
  expect(tableRequests).toBe(0)

  /* the door is reachable from here */
  await page.getByRole('button', { name: 'Load the Master Price File' }).click()
  await expect(page).toHaveURL(/\/sign-in\?again=true$/)
  await expect(page.getByTestId('entry')).toBeVisible()
  /* and it does not ask for a name it already has */
  await expect(page.getByRole('textbox')).toHaveValue(AT_THE_DESK)

  await page.getByRole('button', { name: FILE_DOOR }).click()
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 })
  await expect(page.getByTestId('pack-counts')).toBeVisible()
  expect(tableRequests, 'this time the file really was read').toBeGreaterThan(0)

  /* and the file names its business, so the business's initials take the medallion */
  await expect(crest).toHaveAttribute('data-crest', 'initials')
  await expect(crest).toHaveAccessibleName(`${BUSINESS} — Home`)
  await expect(crest).toHaveText(initialsOf(BUSINESS))
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
    const finder = page.getByTestId('shell-finder')
    /* A MODEL IS A BOAT TO SELL (critique of Milestone 2's close, #8): "adv9" is every ADV9
       line of the file, and they answer as ONE line onto the picker, not as eight lines for
       the sheet */
    await page.keyboard.type('adv9')
    await expect(finder.getByRole('option').first()).toContainText('Choose the version')
    /* and ONE line of the file — typed by the code it is ordered by — keeps the sheet one row
       below the sale, as the file spells it. The code is read off the pack: the first ADV9 whose
       code is inside no other code, so exactly one line answers it */
    const highfield = TABLE('boat_highfield')
    const codes = highfield.map((r) => String(r.values['boat_highfield.d'] ?? ''))
    const adv9 = highfield.find((r) => {
      const code = String(r.values['boat_highfield.d'] ?? '')
      return (
        r.values['boat_highfield.model'] === 'ADV9' &&
        code !== '' &&
        codes.filter((c) => c.toLowerCase().includes(code.toLowerCase())).length === 1
      )
    })!
    const label = String(adv9.values['boat_highfield.c'])
    await page.keyboard.press('Control+a')
    await page.keyboard.type(String(adv9.values['boat_highfield.d']))
    const row = finder.getByRole('option', { name: /Open it on the sheet/ }).first()
    await expect(row).toContainText(label)
    const found = await row.innerText()
    await row.click()
    /* `?at=` is the sheet's own word for the row a record is open on,
       so a found row opens showing rather than at the top of a table */
    await expect(page).toHaveURL(/\/data\/boat_highfield\?.*at=/)
    /* AND IT IS THE ROW, NOT THE PARAMETER (critique §1): the record that
       opens is the one the finder named, and the grid's own cursor is on
       the row the address names — until 2026-09-23 this case was green
       while row 1 of 588 opened */
    const record = page.getByTestId('sheet-record')
    await expect(record).toBeVisible({ timeout: 30_000 })
    const name = (await record.getByRole('heading', { level: 2 }).innerText()).trim()
    expect(name).toMatch(/ADV9/)
    expect(found).toContain(name)
    const at = decodeURIComponent(new URL(page.url()).searchParams.get('at') ?? '')
    expect(at).not.toBe('')
    await expect(page.getByRole('grid', { name: /Highfield/ })).toHaveAttribute(
      'aria-activedescendant',
      new RegExp(`^sh-cell-${at.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-`),
    )
  })

  /* WHAT A DEALER TYPES (critique of Milestone 2's close, #8). Driven cold on the built app:
     "HBS126" answered "Nothing in this browser matches", "trailer for sp560" answered nothing,
     "yamaha f90" put four Pre-Delivery packages above the F90 motors, and every boat's only
     verb was "Open it on the sheet". Each is asked again here, in the real app, at every
     viewport, and the code is read off the pack rather than typed. */
  test('a boat found by its code is quoted from the finder, and the build opens on it', async ({
    page,
  }) => {
    test.setTimeout(180_000)
    await throughTheDoor(page)
    const target = TABLE('boat_highfield').find((r) => r.values['boat_highfield.d'] === 'HBS126')!
    await page.keyboard.press('Control+k')
    const finder = page.getByTestId('shell-finder')
    await page.keyboard.type('HBS126')
    const sell = finder.getByRole('option', { name: /Start a quote/ }).first()
    await expect(sell).toContainText('HBS126')
    await expect(sell).toContainText(/\$[\d,]+/)
    /* the version as the finder says it — "Sport 560 · Hypalon · Black / Black / Black" —
       read off the row, never typed here */
    const said = (await sell.locator('.way-row__name').innerText()).trim()
    await sell.click()
    await expect(page).toHaveURL(/\/quote\/[^/?]+$/, { timeout: 30_000 })
    await expect(page.getByTestId('running-total')).toBeVisible({ timeout: 30_000 })
    await expect(finder).toHaveCount(0)
    /* THE BUILD IS ON THAT BOAT: the one the row named, in the same words. Until 2026-09-25
       this asked for the file's model code ("SP560"), which the build no longer prints: the
       boat is "Highfield Sport 560", and the trailer that carried the code in its own name
       ("REDCO Custom / Highfield SP560 Aluminium") now says it the same way. */
    expect(said).toMatch(/^Sport 560 · /)
    expect(String(target.values['boat_highfield.model'])).toBe('SP560')
    await expect(page.getByTestId('configurator')).toContainText(`Highfield ${said}`)
  })

  test('a model of many versions opens the picker on it', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.keyboard.press('Control+k')
    await page.keyboard.type('sp560')
    const model = page
      .getByTestId('shell-finder')
      .getByRole('option', { name: /Choose the version/ })
      .first()
    /* the boat as a person says it: Highfield's own page for SP560 is headed "Sport 560" */
    await expect(model).toContainText('Sport 560')
    await model.click()
    await expect(page).toHaveURL(/\/quote\/new\?model=/)
    await expect(page.getByTestId('picker')).toHaveAttribute('data-stage', 'boat')
  })

  /* THE NAMES THE SCREENS PRINT ARE THE NAMES IT FINDS (m2-last-critique.md, blocker 2).
     Driven cold on 2026-09-24: "sport 560", "haines signature fisher 525f" and "jeanneau
     merry fisher 605" answered "Nothing matches", and "adv7 black" found no boat — the names
     the picker, the build and the paper print. Each is typed again here, at every viewport. */
  test('the names the screens print are the names it finds', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.keyboard.press('Control+k')
    const finder = page.getByTestId('shell-finder')
    for (const [typed, shown] of [
      ['adv7 black', 'ADV7'],
      ['haines signature fisher 525f', 'Signature Fisher 525F'],
      ['jeanneau merry fisher 605', 'Merry Fisher 605'],
      ['sport 560', 'Sport 560'],
    ] as const) {
      await page.keyboard.press('Control+a')
      await page.keyboard.type(typed)
      await expect(finder.getByRole('option').first(), typed).toContainText(shown)
      await expect(finder.getByText(/^Nothing matches/), typed).toHaveCount(0)
    }
    /* and the one line for the Sport 560 opens the picker on it, as "sp560" does */
    const model = finder.getByRole('option', { name: /Choose the version/ }).first()
    await expect(model).toContainText('Sport 560')
    await model.click()
    await expect(page).toHaveURL(/\/quote\/new\?model=/)
    await expect(page.getByTestId('picker')).toHaveAttribute('data-stage', 'boat')
  })

  test('yamaha f90 answers the Yamaha motors first, and trailer for sp560 answers trailers', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.keyboard.press('Control+k')
    const finder = page.getByTestId('shell-finder')
    await page.keyboard.type('yamaha f90')
    await expect(finder.locator('[cmdk-group-heading]').first()).toHaveText(/Yamaha Outboards/i)
    await expect(finder.getByRole('option').first()).toContainText(/Yamaha - F90/)

    await page.keyboard.press('Control+a')
    await page.keyboard.type('trailer for sp560')
    await expect(finder.locator('[cmdk-group-heading]').first()).toHaveText(/Trailers for sp560/i)
    await expect(finder.getByRole('option').first()).toContainText(/fits (all \d+|\d+ of \d+|it)/)
    await expect(finder.getByText(/^Nothing matches/)).toHaveCount(0)
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

  test('no letter is a door, with or without a G in front of it', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    const at = page.url()
    /* WCAG 2.2 SC 2.1.4 (2026-09-25): until then G then D went to Data from
       anywhere. No character on its own is a shortcut in this app now; the
       pill's doors and Mod K are the ways between screens. */
    await page.keyboard.press('g')
    await page.keyboard.press('d')
    await page.keyboard.press('c')
    await page.waitForTimeout(300)
    await expect(page).toHaveURL(at)
    /* and the finder prints no key on a door's row, since none opens it */
    await page.keyboard.press('Control+k')
    const finder = page.getByTestId('shell-finder')
    await expect(finder).toBeVisible()
    await expect(finder.getByRole('option', { name: /^Data\b/ })).toBeVisible()
    await expect(finder.locator('[cmdk-item] kbd')).toHaveCount(0)
  })

  test('the ? sheet holds the whole vocabulary, and is searchable', async ({ page }) => {
    test.setTimeout(120_000)
    await throughTheDoor(page)
    /* OFFERED UNDER pointer: fine ONLY — a finger has none of these keys, and on one `?`
       opens nothing (asserted here too, rather than skipped past) */
    if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches)) {
      await page.keyboard.press('?')
      await page.waitForTimeout(200)
      await expect(page.getByRole('dialog')).toHaveCount(0)
      return
    }
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

  test('it covers none of the three screens of the sale either', async ({ page }) => {
    /* THE OTHER THREE ADDRESSES. A build, a decision and a printed
       quote have no address until somebody mints one, which is why
       `e2e/mint.ts` exists and why the eight typed addresses above
       cannot reach them. They are the screens with the most drawn on
       them, so the clearance is measured on all three. */
    test.setTimeout(240_000)
    const clear = async (where: string) => {
      await page.waitForTimeout(300)
      if ((page.viewportSize()?.width ?? 0) < 600) return
      const read = await underThePill(page)
      expect(read, where + ' draws a pill').not.toBeNull()
      expect(read!.covered, where + ": the pill is painted over the screen's own words").toEqual([])
    }

    await startAQuote(page)
    await expect(page.getByTestId('running-total')).toBeVisible()
    await clear('the build')

    await raiseTheRung(page)
    await expect(page.getByTestId('decision')).toBeVisible()
    await clear('the cascade')

    await page.goBack()
    await expect(page.getByTestId('running-total')).toBeVisible()
    await issueIt(page)
    await openTheDocument(page)
    await expect(page.getByTestId('document-total')).toBeVisible()
    await clear('the document')
  })

  test('from a sheet, the lit door is the one way back, and the pill says it once', async ({
    page,
  }) => {
    /* RULE (a), critique #13: on a sheet the pill carried `‹ Data`, `Home` and `Data 53` —
       the word "Data" twice on one bar, to one address. The pill now carries the doors and
       nothing else; the lit one is the way back to its register. */
    test.setTimeout(120_000)
    await throughTheDoor(page)
    await page.goto('/data/boat_highfield')
    await expect(page.getByTestId('sheet')).toBeVisible()
    const pill = page.getByTestId('shell-pill')
    const hrefs = await pill
      .getByRole('link')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href')))
    expect(hrefs).toEqual(['/', ...DOORS.map((d) => d.href)])
    const data = pill.getByRole('link', { name: /^Data( |$)/ })
    await expect(data).toHaveAttribute('aria-current', 'page')
    await data.click()
    await expect(page).toHaveURL(/\/data$/)
  })

  test('the Quotes door counts what the register counts', async ({ page }) => {
    /* CRITIQUE #9: the door printed OPEN DRAFTS, so with one issued quote the pill read
       `Quotes 0` beside a register whose first line is "1 quote is filed in this browser".
       Walked: a quote is minted and ISSUED — so no draft is open, which is exactly the desk
       the critique photographed — and the two figures are read off the two surfaces. */
    test.setTimeout(240_000)
    await startAQuote(page)
    await expect(page.getByTestId('running-total')).toBeVisible()
    await issueIt(page)
    /* THROUGH THE PILL'S OWN DOOR, not a typed address: a press goes through the router with
       the issued document in memory, where a reload can race the 300 ms write-behind and
       arrive on a desk where the quote is still a draft — which would not be the desk the
       critique photographed, and on which the old count would have agreed by accident. */
    await page
      .getByTestId('shell-pill')
      .getByRole('link', { name: /^Quotes( |$)/ })
      .click()
    await expect(page).toHaveURL(/\/quotes$/)
    await expect(page.getByTestId('quotes')).toBeVisible()

    const said = await page
      .getByTestId('quotes')
      .getByText(/filed in this browser/)
      .first()
      .innerText()
    const onTheRegister = Number(
      /([\d,]+)\s+quotes?\s+(?:is|are)\s+filed/i.exec(said)?.[1]?.replace(/,/g, ''),
    )
    expect(onTheRegister, `the register said "${said}"`).toBeGreaterThanOrEqual(1)

    const door = page.getByTestId('shell-pill').getByRole('link', { name: /^Quotes — / })
    const name = (await door.getAttribute('aria-label')) ?? ''
    const onTheDoor = Number(/— ([\d,]+) filed/.exec(name)?.[1]?.replace(/,/g, ''))
    expect(onTheDoor, `the door is named "${name}"`).toBe(onTheRegister)
    /* AND NO DRAFT IS OPEN, so this is the critique's desk: the old door, which counted open
       drafts, would have printed 0 here. The name carries no draft clause, and on a phone
       there is no dot. */
    expect(name).toBe(`Quotes — ${onTheRegister.toLocaleString('en-AU')} filed`)
    await expect(door.locator('[data-waiting]')).toHaveCount(0)
    /* and at every width over 600 the figure is printed, not only said */
    if ((page.viewportSize()?.width ?? 0) >= 600) {
      await expect(door.locator('.way-door__count')).toHaveText(
        onTheRegister.toLocaleString('en-AU'),
      )
    }
  })

  test('no keycap and no key word on a coarse pointer, anywhere the pill stands', async ({
    page,
  }) => {
    /* RULE (b), critique #18: `Ctrl` and `K` were printed on the tab bar at 390 because the
       shell's own rule lost to the primitive's on source order. The primitive now takes its
       caps away itself (`src/ui/kbd.css`), so on a finger no screen draws one — counted here
       at every address a person can type, which is the app-wide half of the rule. The finder's
       own sentence switches to touch words. On a desk nothing changes and nothing is asserted. */
    test.setTimeout(180_000)
    await throughTheDoor(page)
    const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches)
    test.skip(!coarse, 'a fine pointer has a keyboard, and the caps are drawn for it')

    for (const address of TYPED) {
      await page.goto(address)
      await expect(page.getByTestId('shell-pill')).toBeVisible()
      const drawn = await page.evaluate(
        () =>
          [...document.querySelectorAll('kbd')].filter(
            (k) => (k as HTMLElement).offsetParent !== null || k.getClientRects().length > 0,
          ).length,
      )
      expect(drawn, address + ': a keycap is drawn on a coarse pointer').toBe(0)
    }

    await page.getByTestId('shell-pill').getByRole('button', { name: 'Find' }).click()
    const finder = page.getByTestId('shell-finder')
    await expect(finder).toBeVisible()
    await page.keyboard.type('highfield')
    await expect(
      finder.getByText(/Press a row and it opens: a boat starts its quote/),
    ).toBeVisible()
    await expect(finder.getByText(/Enter does what the row says/)).toBeHidden()
    const said = await finder.innerText()
    expect(said, 'the finder names a key on a finger').not.toMatch(/\bCtrl\b|⌘|\bEsc\b|\bEnter\b/)
  })
})
