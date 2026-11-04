import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE CHANDLERY, WALKED — /catalogue, direction A of the data round
   (docs/directions/data-round/catalogue/), with the real Master Price
   File, through the real door. Each test is a job the judge listed
   (judge.md §1), done the way a salesperson or Northside's admin does
   it, and proved by what the screen itself says.
   ============================================================ */

const LOOK = process.env.HL2_LOOK ?? ''
const shot = async (page: Page, name: string, project: string): Promise<void> => {
  if (LOOK !== '') await page.screenshot({ path: `${LOOK}/${project}-${name}.png` })
}

const ready = (page: Page) => page.locator('[data-testid="catalogue"][data-read]')

/* THE ROOM SAYS ITS OWN NAME, AND ITS SHARE OF DATA'S FIGURE (the section critic, 2026-11-04):
   the room Data's head and the finder call Catalogue calls itself Catalogue, and its count of the
   Parts list is said OF the list's 2,937 lines under 187 headings that Data's plate prints, never
   as a second count of one list (src/domain/catalogue/shelfCount.test.ts measures both). */
test('the catalogue calls itself Catalogue and counts what is on sale of Data’s own figure', async ({
  page,
}, info) => {
  test.setTimeout(120_000)
  await throughTheDoor(page)
  await page.goto('/catalogue')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  const head = page.getByRole('heading', { level: 1, name: 'Catalogue' })
  await expect(head).toBeInViewport()
  await expect(page.getByRole('heading', { name: 'Chandlery' })).toHaveCount(0)
  const count = page.getByTestId('catalogue-count')
  await expect(count).toBeInViewport()
  await expect(count).toHaveText(
    /^2,238 of the price list’s 2,937 parts are on sale, under 179 of its 187 headings and 25 under none; the other 699 are no longer sold\. They stand in 18 aisles and \d+ (is|are) not sorted yet; [\d,]+ (is|are) pictured\.$/,
  )
  await expect(page.getByRole('searchbox', { name: 'Find a part in the catalogue' })).toBeVisible()
  /* the plates' photographs in the window have arrived before the window is photographed */
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLImageElement>('.chd-aisle__tile img')]
      .filter((i) => i.getBoundingClientRect().top < window.innerHeight)
      .every((i) => i.complete && i.naturalWidth > 0),
  )
  await shot(page, 'door', info.project.name)
})

test('J1, J2, J10, J7: an aisle opens at the top, every line says both prices, and a line opens its ways on', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  /* through the shell's one list: Data, then its room, as a dealer reaches it */
  await page.getByTestId('shell-pill').getByRole('link', { name: /Data/ }).click()
  await page
    .getByRole('navigation', { name: /The rooms of the price list|Behind the price list/ })
    .getByRole('link', { name: /^Catalogue/ })
    .click()
  await expect(page).toHaveURL(/\/catalogue$/)
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  /* every aisle at once: eighteen and Not sorted yet */
  await expect(page.getByRole('list', { name: 'The aisles' }).locator(':scope > li')).toHaveCount(
    19,
  )

  /* J1: the aisle REPLACES the front and opens at its top, its name in sight at every size */
  await page.getByRole('link', { name: /^Anchoring & mooring/ }).click()
  await expect(page).toHaveURL(/\/catalogue\?aisle=anchoring$/)
  const name = page.getByRole('heading', { level: 1, name: 'Anchoring & mooring' })
  await expect(name).toBeInViewport()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  /* J2: every line of the aisle says what it costs; none reads a bare $0 where the file prices it */
  const lines = page.getByTestId('catalogue-aisle').locator('.chd-line__head')
  const count = await lines.count()
  expect(count).toBeGreaterThan(0)
  for (const text of await lines.allInnerTexts())
    expect(text, 'a line says supply, fitted or why there is no price').toMatch(
      /supply|fitted|No price|\$0/,
    )
  await shot(page, 'aisle', info.project.name)

  /* J10 and J7: a line opens in place with its line in the price list and the quote's sentence */
  await lines.first().click()
  await expect(page).toHaveURL(/open=parts/)
  const opened = page.locator('.chd-line[data-open]')
  await expect(opened.getByRole('link', { name: /^Open its line in / })).toHaveAttribute(
    'href',
    /^\/data\/parts\?at=parts/,
  )
  await expect(
    opened.getByText(/A quote cannot start with this part yet|Start a quote with it/),
  ).toBeVisible()
  await shot(page, 'line-open', info.project.name)

  /* the way back is to the front, at its top */
  await page
    .getByRole('link', { name: /^Every aisle · 19$/ })
    .first()
    .click()
  await expect(page.getByTestId('catalogue-door')).toBeVisible()
})

test('J2, J3, J4: a part priced fitted alone says its fitted figure; find reads codes and headings', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  /* the trailer adjustments, which the old card read as $0 */
  await page.goto('/catalogue?aisle=trailer&find=adjustment')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  const adjust = page.locator('.chd-line__head', { hasText: 'Trailer Adjustment' })
  await expect(adjust.first()).toBeVisible()
  for (const text of await adjust.allInnerTexts()) {
    expect(text).toMatch(/Fitted\s+only/)
    expect(text).not.toMatch(/\$0\b/)
  }

  /* J4: a code finds its part */
  await page.goto('/catalogue?find=SG002')
  await expect(page.locator('.chd-found__said')).toHaveText(/^1 part answers to “SG002”/)
  await expect(page.locator('.chd-found .chd-code', { hasText: /^SG002$/ })).toBeVisible()

  /* J3: a maker's word finds every line under its heading, not only those that name it */
  await page.goto('/catalogue?find=lowrance')
  await expect(page.locator('.chd-found__said')).toHaveText(/^144 parts answer to “lowrance”/)

  /* and on day one the maker's word finds the lines the price list writes as YAM and Yam, which
     its own Yamaha Outboards name in words: 671 of them, and 14 more that only say Yamaha */
  await page.goto('/catalogue?find=yamaha')
  await expect(page.locator('.chd-found__said')).toHaveText(/^685 parts answer to “yamaha”/)
})

test('J6, J15: the customer’s boat is chosen here and what is made for it comes first; a wrong aisle is said', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?aisle=anchoring')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'For a boat…' }).click()
  await page.getByRole('searchbox', { name: 'Find the boat' }).fill('529 Assault Pro')
  await page
    .getByRole('button', { name: /Stacer 529 Assault Pro/ })
    .first()
    .click()
  await expect(page).toHaveURL(/boat=boat_stacer/)
  /* the answer is in sight at every size, under the dock, and holds the caret (the verifier,
     round 2: on a phone it stood under the dock and the caret fell to the page) */
  const madeHead = page.getByRole('heading', { name: /^Made for the Stacer 529 Assault Pro/ })
  await expect(madeHead).toBeInViewport()
  await expect(madeHead).toBeFocused()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const made = document.querySelector('.chd-made')!.getBoundingClientRect()
        const dock = document.querySelector('.chd-dock')!.getBoundingClientRect()
        return Math.round(made.top - dock.bottom)
      }),
    )
    .toBeGreaterThanOrEqual(0)
  await expect(page.locator('.chd-made .chd-line').first()).toBeInViewport()
  await shot(page, 'made-for', info.project.name)
  /* and fitting no boat is one press, which gives the caret back to the press that chooses one */
  await page.getByRole('button', { name: /^Fit no boat/ }).click()
  await expect(page.getByRole('heading', { name: /^Made for the / })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'For a boat…' })).toBeFocused()

  /* on the front too, what is made for it is in sight and holds the caret */
  await page.goto('/catalogue')
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'For a boat…' }).click()
  await page.getByRole('searchbox', { name: 'Find the boat' }).fill('529 Assault Pro')
  await page
    .getByRole('button', { name: /Stacer 529 Assault Pro/ })
    .first()
    .click()
  const frontHead = page.getByRole('heading', { name: /^Made for the Stacer 529 Assault Pro/ })
  await expect(frontHead).toBeInViewport()
  await expect(frontHead).toBeFocused()

  await page.goto('/catalogue?aisle=nope')
  await expect(page.getByText('There is no aisle called “nope”. These are the 19.')).toBeVisible()
})

test('J12, J11: Northside names a supplier and places an unsorted heading, each with its Undo', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  /* DAY ONE: the codes the price list names itself are read so, each with why, and YAM and Yam
     are one maker without a press (the verifier, round 2, J12) */
  await page.goto('/catalogue?aisle=propellers')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  const chips = page.getByRole('group', { name: 'Propellers & motor care by supplier' })
  if (await chips.isVisible()) {
    await expect(chips.getByRole('button', { name: /^Yamaha [\d,]+$/ })).toHaveCount(1)
    await expect(chips.getByRole('button', { name: /^(YAM|Yam) / })).toHaveCount(0)
  } else {
    await page.getByRole('combobox', { name: 'Propellers & motor care by supplier' }).click()
    await expect(page.getByRole('option', { name: /^Yamaha/ })).toHaveCount(1)
    await expect(page.getByRole('option', { name: /^(YAM|Yam)\b/ })).toHaveCount(0)
    await page.keyboard.press('Escape')
  }

  await page.goto('/catalogue?view=suppliers')
  await expect(page.getByTestId('catalogue-suppliers')).toBeVisible({ timeout: 30_000 })
  const read = page.getByRole('region', { name: 'What the price list names itself' })
  await expect(read.getByText('Read as Yamaha')).toBeVisible()
  await expect(read.getByText(/“Yamaha” is the only supplier written in words/)).toBeVisible()
  await expect(read.getByText('Read as Lowrance')).toBeVisible()
  await expect(page.getByRole('region', { name: 'One maker written two ways' })).toHaveCount(0)
  await shot(page, 'suppliers', info.project.name)

  /* NORTHSIDE'S OWN NAME is said over the reading, with its way back to it */
  const epr = page.getByRole('textbox', { name: 'Northside’s name for EPR' })
  await expect(epr).toHaveValue('ePropulsion')
  await epr.fill('ePropulsion Outboards')
  await epr.press('Enter')
  await expect(page.getByText('EPR is named ePropulsion Outboards.')).toBeVisible()
  await expect(read.getByText('Northside calls EPR ePropulsion Outboards')).toBeVisible()
  await page.getByRole('button', { name: 'Take the name back' }).first().click()
  await expect(page.getByText('EPR reads as the price list writes it again.')).toBeVisible()
  await expect(page.getByText('· the price list names it ePropulsion')).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByText(/· named ePropulsion Outboards$/)).toBeVisible()

  /* J11: the three DFO kits put in an aisle, and back */
  await page.goto('/catalogue?aisle=unsorted')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  await page.getByRole('combobox', { name: 'Put this heading in an aisle: DFO kits' }).click()
  await page.getByRole('option', { name: 'Batteries & power' }).click()
  await expect(page.getByText('DFO kits is now in Batteries & power.')).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('heading', { name: 'DFO kits' })).toBeVisible()
})

test('J8, J9: pictures land on the part their file name names by code, anything else is refused', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue')
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  /* a 1 × 1 PNG, named by a code the price list carries once, and a text file */
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  )
  await page.locator('.chd-bycode__input').setInputFiles([
    { name: 'SG002.png', mimeType: 'image/png', buffer: png },
    { name: 'IMG_2041.png', mimeType: 'image/png', buffer: png },
  ])
  await expect(
    page.getByText('“SG002.png” is on the Safety Gear · Smooth Waters (SG002).'),
  ).toBeVisible()
  await expect(page.getByText(/“IMG_2041.png” names no part’s code/)).toBeVisible()
  await expect(page.getByText('1 picture put on its part by code.')).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()

  /* J9: an aisle with pictures offers the parts without one */
  await page.goto('/catalogue?aisle=radios&show=without')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.chd-card')).toHaveCount(0)
  await expect(page.locator('.chd-line').first()).toBeVisible()
})

/* ============================================================
   ROUND 2 — what the verifier of the chandlery found in round 1
   (docs/directions/data-round/catalogue/verify-1.md), each proved by
   where it lands and what the page then says, never by the sentence
   alone.
   ============================================================ */

test('J7: “Let it be quoted on its own” opens the parts’ own settings, not a page that is not there', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?aisle=anchoring&open=parts%3A38')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  const way = page.getByRole('link', { name: /Let it be quoted on its own/ })
  await expect(way).toHaveAttribute('href', '/places/parts?tab=settings')
  await way.click()
  await expect(page).toHaveURL(/\/places\/parts\?tab=settings$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Parts & Accessories' })).toBeVisible({
    timeout: 30_000,
  })
  await expect(page.getByText(/No place is called/)).toHaveCount(0)
})

test('J6: a part says as many boats as it names, and every one is a press away', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?aisle=anchoring&boat=boat_stacer%3A30')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  /* D Shackle · 10 mm Galv, the one part in this aisle made for the 529 Assault Pro */
  await page.locator('.chd-made .chd-line__head').first().click()
  const made = page.locator('.chd-line[data-open] .chd-facts dd').nth(2)
  const said = (await made.innerText()).replace(/\s+/g, ' ')
  const m = /^([\d,]+) boats: (.+?), (.+?), (.+?) and ([\d,]+) more$/.exec(said)
  expect(m, said).not.toBeNull()
  const count = Number(m![1]!.replace(/,/g, ''))
  expect(3 + Number(m![5]!.replace(/,/g, ''))).toBe(count)
  /* the customer's boat leads, marked */
  expect(m![2]).toBe('Stacer 529 Assault Pro')
  await expect(made.locator('.chd-boatsof__yours')).toHaveText('Stacer 529 Assault Pro')
  await made.getByRole('button', { name: /^and [\d,]+ more$/ }).click()
  /* opened, every boat is named once, by maker, across the part, and the caret stays */
  const all = made.locator('.chd-boatsof__list li')
  await expect(all).toHaveCount(count)
  const names = await made.locator('.chd-boatsof').evaluateAll((groups) =>
    groups.flatMap((g) => {
      const maker = g.querySelector('.chd-boatsof__maker')!.firstChild!.textContent!.trim()
      return [...g.querySelectorAll('li')].map((li) => `${maker} ${li.firstChild!.textContent}`)
    }),
  )
  expect(new Set(names).size).toBe(count)
  await expect(all.filter({ hasText: '529 Assault Pro' })).toHaveAttribute('data-chosen', '')
  await expect(made.getByRole('button', { name: 'Show fewer' })).toBeFocused()
  const [fact, facts] = await Promise.all([
    page.locator('.chd-line[data-open] .chd-facts > [data-wide]').boundingBox(),
    page.locator('.chd-line[data-open] .chd-facts').boundingBox(),
  ])
  expect(Math.round(fact!.width)).toBe(Math.round(facts!.width))
  await shot(page, 'boats-all', info.project.name)
  await made.getByRole('button', { name: 'Show fewer' }).click()
  await expect(made.getByRole('button', { name: /^and [\d,]+ more$/ })).toBeFocused()
})

test('the front’s heading links land their heading under the dock, and a heading by address does too', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue')
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('link', { name: 'Flushers', exact: true }).click()
  await expect(page).toHaveURL(/aisle=propellers&heading=FLUSHERS/)
  const under = async (heading: string): Promise<number> =>
    page.evaluate((h) => {
      const head = document
        .querySelector(`.chd-section[data-heading="${CSS.escape(h)}"] h2`)!
        .getBoundingClientRect()
      const dock = document.querySelector('.chd-dock')!.getBoundingClientRect()
      return Math.round(head.top - dock.bottom)
    }, heading)
  await expect.poll(() => under('FLUSHERS'), { timeout: 10_000 }).toBeGreaterThanOrEqual(0)
  expect(await under('FLUSHERS')).toBeLessThan(40)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  /* the dock says the heading it stands over */
  await expect(page.locator('.chd-dock__where')).toHaveText(/Flushers/i)

  await page.goto('/catalogue?aisle=anchoring&heading=SARCA%20ANCHORS')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  await expect.poll(() => under('SARCA ANCHORS'), { timeout: 10_000 }).toBeGreaterThanOrEqual(0)
  expect(await under('SARCA ANCHORS')).toBeLessThan(40)
})

test('J10: a part with no price opens Review on its own case, which names it', async ({ page }) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?aisle=anchoring&find=Reef%20Anchor')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  await page.locator('.chd-line__head').first().click()
  await page.getByRole('link', { name: /Put it right on Review/ }).click()
  await expect(page).toHaveURL(/\/review\?case=none/)
  await expect(page.getByText(/Reef Anchor Kit/).first()).toBeVisible({ timeout: 30_000 })
})

test('J9: the parts with no picture, across every aisle, each aisle a press away', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue')
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('link', { name: /The parts with no picture yet/ }).click()
  await expect(page).toHaveURL(/view=pictures/)
  const pics = page.getByTestId('catalogue-pictures')
  await expect(pics.getByRole('heading', { level: 1, name: 'No picture yet' })).toBeVisible()
  /* a computer with no quote on it ranks nothing, and says so */
  await expect(pics.getByText(/No quote kept on this computer carries a part/)).toBeVisible()
  await pics.getByRole('link', { name: /^Open them: the 66 in Anchoring & mooring/ }).click()
  await expect(page).toHaveURL(/aisle=anchoring&show=without/)
  await expect(page.getByTestId('catalogue-aisle')).toBeVisible()
})

test('the boat’s find stays inside its popover, and a pressed aisle shows a part in the first window', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue')
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('link', { name: /^Anchoring & mooring/ }).click()
  const first = page.getByTestId('catalogue-aisle').locator('.chd-ledger .chd-line').first()
  await expect(first).toBeInViewport({ ratio: 1 })

  await page.getByRole('button', { name: 'For a boat…' }).click()
  const pop = page.locator('.ui-popover')
  await expect(pop).toBeVisible()
  const sideways = await pop.evaluate((p) => p.scrollWidth - p.clientWidth)
  expect(sideways).toBe(0)
  const [box, field] = await Promise.all([
    pop.boundingBox(),
    pop.getByRole('searchbox', { name: 'Find the boat' }).boundingBox(),
  ])
  expect(field!.x).toBeGreaterThanOrEqual(box!.x + 8)
  expect(field!.x + field!.width).toBeLessThanOrEqual(box!.x + box!.width - 8)
})

/* ============================================================
   ROUND 3 — what the verifier of the chandlery found in round 2
   (docs/directions/data-round/catalogue/verify-2.md), each proved by
   what the page draws, measured.
   ============================================================ */

test('the worklist counts only the parts that take a picture, and an aisle offers No picture of them', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?view=pictures')
  const pics = page.getByTestId('catalogue-pictures')
  await expect(pics).toBeVisible({ timeout: 30_000 })
  await expect(
    pics.getByText(/labour lines and notes of the price list take no picture/),
  ).toBeVisible()
  /* Workshop, labour & notes: its labour lines are not on the worklist */
  const workshop = pics.locator('.chd-pics__aisle', { hasText: 'Workshop' })
  await workshop.scrollIntoViewIfNeeded()
  await shot(page, 'worklist-foot', info.project.name)
  const said = await workshop.locator('.chd-pics__count').innerText()
  const m = /^([\d,]+) of ([\d,]+) with no picture$/.exec(said)
  expect(m, said).not.toBeNull()
  const without = Number(m![1]!.replace(/,/g, ''))
  await workshop.getByRole('link', { name: /^Open them/ }).click()
  await expect(page).toHaveURL(/aisle=workshop&show=without/)
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  /* the aisle shows exactly that many, none of them labour */
  await expect(page.locator('.chd-sections .chd-line')).toHaveCount(without)
  await expect(page.locator('.chd-sections .chd-line[data-kind="labour"]')).toHaveCount(0)
  await expect(page.getByRole('radio', { name: `No picture ${without}` })).toBeChecked()
})

test('the supplier chips count what is shown, and a row under SUPPLY and FITTED does not say them again', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?aisle=radios&show=pictured')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  const cards = await page.locator('.chd-card').count()
  expect(cards).toBeGreaterThan(0)
  await expect(page.getByRole('radio', { name: `Pictured ${cards}` })).toBeChecked()
  const chips = page.getByRole('group', { name: 'Radios & beacons by supplier' })
  if (await chips.isVisible()) {
    await expect(chips.getByRole('button', { name: /^Every supplier/ })).toHaveText(
      new RegExp(`${cards}$`),
    )
    let sum = 0
    for (const t of await chips.locator('.ui-chip-count').allInnerTexts())
      sum += Number(t.replace(/,/g, ''))
    /* every supplier's chip, and Every supplier itself: twice the cards */
    expect(sum).toBe(cards * 2)
  }

  /* under the column heads the words are a reader's, not drawn twice */
  await page.goto('/catalogue?aisle=propellers')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  const heads = page.locator('.chd-cols').first()
  const word = page.locator('.chd-sections .chd-line .chd-fig__w[data-col]').first()
  if (await heads.isVisible()) {
    const box = await word.boundingBox()
    expect(box!.width).toBeLessThanOrEqual(1)
  } else await expect(word).toBeVisible()
  await shot(page, 'propellers', info.project.name)

  /* an opened line does not say the heading its section says just above it */
  await page.goto('/catalogue?aisle=anchoring&open=parts%3A38')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  const opened = page.locator('.chd-sections .chd-line[data-open]')
  await expect(opened.getByText('How it is fitted')).toBeVisible()
  await expect(opened.getByText('Under the heading')).toHaveCount(0)
})

test('the aisle’s head keeps each figure with its noun, and the dock stands one gap under the head', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto('/catalogue?aisle=anchoring')
  await expect(ready(page)).toBeVisible({ timeout: 30_000 })
  for (const fig of await page.locator('.chd-head__fig').all()) {
    const rects = await fig.evaluate((el) => {
      const r = document.createRange()
      r.selectNodeContents(el)
      return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size
    })
    expect(rects, await fig.innerText()).toBe(1)
  }
  const gap = await page.evaluate(() => {
    const head = document.querySelector('.chd-head')!.getBoundingClientRect()
    const dock = document.querySelector('.chd-dock')!.getBoundingClientRect()
    return Math.round(dock.top - head.bottom)
  })
  expect(gap).toBeLessThanOrEqual(20)
  await shot(page, 'aisle-head', info.project.name)
})
