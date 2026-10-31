import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { cameToRest, pickAndStart } from '../mint'

/* ============================================================
   THE BUILD PAGE AS THE OWNER ASKED FOR IT (2026-10-30, two rounds the
   same day). The first: "always hull expanded first and the header
   section should be way nicer … Total should move from top right to
   bottom left … i don't like how the image goes all the way to left on
   big screen … we need to be able to expand images of products". The
   second, word for word in part: "the only thing that should scroll is
   the right hand bar the rest stays as is please … We dont need that
   little text under the photo on the left so we can make the most of the
   space and make image bigger … the experience of viewing all of the
   products and things should be popup please done nicely … in that left
   hand side of that white bar on the top that is where you put
   highfield logo and then have model details and things … for specs,
   ability to open more of them and design that a bit nicer … remove the
   photograph from media.high whatever because not needed. customer
   details i live in the top bar so we can remove who it for in the
   right hand scrolly … also things look a bit blurry sometimes".

   Each measured at every size the rulers run, on the Highfield Sport 560
   started at the picker's act:

     1. the hull opens first, and the quote starts with the boat alone;
     2. the total stands at the bottom left, in sight, over no control
        and clear of the shell's bar, and says what it is made of;
     3. THE TOP WHITE BAR is the quote's identity: the maker's mark, the
        boat's name and finish, its number, where it stands, and the
        customer — named there, and no "Who it is for" chapter;
     4. the photograph stands inside the page's measure with nothing
        under it, its words and provenance in the lightbox;
     5. a product's picture opens large, never past its own pixels, and
        Escape and the close return the caret to the press;
     6. AT A DESK ONLY THE CHAPTERS SCROLL: a wheel over the column moves
        the column and nothing else, a wheel over the boat moves nothing,
        and a reload at a chapter opens the column there;
     7. the specifications open, every one, from a keyboard;
     8. "Show all" opens over the page, with its own find field and the
        total, and a press inside it changes the total in place;
     9. NOTHING IS BLURRY: every picture drawn at or under its own pixels,
        and nothing at rest under a fractional transform or a blur.

   With HL2_LOOK set it also writes screenshots there, for a person.
   ============================================================ */

const LOOK = process.env.HL2_LOOK ?? ''

/** Every picture in the window has its pixels, so a screenshot is the page and not its loading. */
async function picturesIn(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.images]
          .filter((img) => {
            const box = img.getBoundingClientRect()
            return (
              box.bottom > 0 && box.top < innerHeight && box.width > 0 && img.loading !== 'lazy'
            )
          })
          .every((img) => img.complete),
      ),
    )
    .toBe(true)
}

/**
 * WHAT IS SOFT ON THE PAGE, MEASURED: each picture in the window, by the pixels of the file the
 * browser chose (`currentSrc`) against the pixels it paints (its box, scaled as `object-fit`
 * scales it, times the device's pixel ratio); and each element at rest under a transform that is
 * not whole pixels, a filter that blurs, or a backdrop blur.
 */
/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs INSIDE
   the page, so every helper it uses must be declared inside it */
async function softness(page: Page): Promise<{ pictures: string[]; soft: string[] }> {
  return page.evaluate(async () => {
    const pictures: string[] = []
    const soft: string[] = []
    const dpr = devicePixelRatio
    const name = (el: Element): string =>
      `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`
    for (const img of document.images) {
      const box = img.getBoundingClientRect()
      if (box.width < 2 || box.bottom <= 0 || box.top >= innerHeight || !img.complete) continue
      const file = new Image()
      file.src = img.currentSrc || img.src
      await Promise.race([
        file.decode().catch(() => undefined),
        new Promise((done) => setTimeout(done, 3000)),
      ])
      const fw = file.naturalWidth
      const fh = file.naturalHeight
      if (fw === 0 || fh === 0) continue
      const fit = getComputedStyle(img).objectFit
      const scale =
        fit === 'cover'
          ? Math.max(box.width / fw, box.height / fh)
          : fit === 'contain' || fit === 'scale-down'
            ? Math.min(box.width / fw, box.height / fh)
            : box.width / fw
      const painted = scale * dpr
      pictures.push(
        `${name(img)} ${(img.currentSrc || img.src).split('/').pop()} file ${fw}x${fh} box ${Math.round(box.width)}x${Math.round(box.height)} at ${painted.toFixed(2)}x`,
      )
      if (painted > 1.01) soft.push(`${name(img)} drawn at ${painted.toFixed(2)}x its pixels`)
    }
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      const box = el.getBoundingClientRect()
      if (box.width === 0 || box.bottom <= 0 || box.top >= innerHeight) continue
      const style = getComputedStyle(el)
      /* a blur BEHIND a plate of words (the shell's glass pill) softens what passes under the
         plate, never the words on it: said, not counted */
      const behind = style.backdropFilter
      const blurs = (said: string): boolean => /blur\((?!0px\))/.test(said)
      if (behind && blurs(behind))
        pictures.push(`glass: ${name(el)} backdrop ${behind}, its own words drawn sharp over it`)
      if (blurs(style.filter)) soft.push(`${name(el)} filter ${style.filter}`)
      if (style.transform !== 'none') {
        const m = new DOMMatrixReadOnly(style.transform)
        const scaled = Math.abs(m.a - 1) > 0.001 || Math.abs(m.d - 1) > 0.001
        const half = Math.abs(m.e % 1) > 0.01 || Math.abs(m.f % 1) > 0.01
        if ((scaled || half) && (el.textContent ?? '').trim() !== '')
          soft.push(`${name(el)} transform ${style.transform}`)
      }
    }
    return { pictures, soft }
  })
}
/* eslint-enable unicorn/consistent-function-scoping */

test('the build page: the bar, the boat, the column that scrolls, the range over the page', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await pickAndStart(page, 'boat_highfield', 'SP560')
  await cameToRest(page)
  const size = page.viewportSize()!
  const desk = size.width >= 1200 && size.height >= 700
  const shot = async (name: string): Promise<void> => {
    if (LOOK === '') return
    await picturesIn(page)
    await page.screenshot({ path: `${LOOK}/build-${info.project.name}-${name}.png` })
  }
  await shot('01-top')

  /* 1. THE HULL FIRST, AND THE BOAT ALONE */
  await expect(page.getByRole('button', { name: /^01 The hull/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  const tally = page.getByTestId('running-total')
  await expect(tally).toContainText('Not chosen yet: motor')
  await expect(page.getByRole('region', { name: /^02 Motor/ })).toContainText('Nothing on it yet')

  /* 2. THE TOTAL AT THE BOTTOM LEFT, in sight at rest, over no control, clear of the shell */
  const box = (await tally.boundingBox())!
  expect(box.x).toBeLessThan(size.width / 2)
  expect(box.y + box.height).toBeLessThanOrEqual(size.height)
  expect(box.y).toBeGreaterThan(size.height / 3)
  const pill = (await page.getByTestId('shell-pill').boundingBox())!
  const clear = box.y + box.height <= pill.y || pill.y + pill.height <= box.y
  expect(clear, 'the total stands over the shell’s bar').toBe(true)
  await expect(tally).toContainText(/Made of: Hull \$/)

  /* 3. THE TOP WHITE BAR: the mark, the boat, the quote, the customer — and no chapter for them */
  const head = page.locator('.cfg-mast')
  await expect(head.getByRole('img', { name: /Highfield/i })).toBeVisible()
  await expect(head.getByRole('heading', { level: 1 })).toHaveText(/Highfield Sport 560/)
  await expect(head).toContainText(/PVC/)
  await expect(head).toContainText(/Quote\s*\d{8}-\d{2}/)
  await expect(head).toContainText('Draft')
  await expect(page.getByRole('button', { name: /^Who it is for/ })).toHaveCount(0)
  await expect(page.locator('[data-chapter="handover"]')).toHaveCount(0)
  /* the page starts with the bar: nothing of the build stands above it */
  const bar = (await page.locator('.cfg-mast__bar').boundingBox())!
  const chapters = (await page.locator('.cfg-chapters').boundingBox())!
  expect(bar.y).toBeLessThan(chapters.y)

  /* 4. THE PHOTOGRAPH INSIDE THE PAGE'S MEASURE, its start edge on the bar's, nothing under it */
  const photo = (await page.locator('.cfg-shot').boundingBox())!
  expect(photo.x).toBeGreaterThanOrEqual(16)
  expect(Math.abs(photo.x - bar.x)).toBeLessThanOrEqual(4)
  await expect(page.getByTestId('stage-caption')).toHaveCount(0)
  await expect(page.locator('.cfg-stage')).not.toContainText(/media\.highfieldboats\.com/)
  await expect(page.locator('.cfg-stage')).not.toContainText(/maker’s own finish/)

  /* 5. A PICTURE, LARGE, carrying what stood under it */
  const opener = page.getByRole('button', { name: 'See the boat larger' })
  await opener.scrollIntoViewIfNeeded()
  await opener.click()
  const large = page.getByRole('dialog')
  await expect(large).toBeVisible()
  await expect(large).toContainText('Highfield Sport 560')
  await expect(large).toContainText(/from media\.highfieldboats\.com/)
  await expect(large).toContainText(/On this quote: no motor yet/)
  const img = large.locator('img')
  const drawn = (await img.boundingBox())!
  const held = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
  expect(drawn.width).toBeLessThanOrEqual(held + 1)
  await shot('02-large')
  await page.keyboard.press('Escape')
  await expect(large).toBeHidden()
  await expect(opener).toBeFocused()

  /* 6. THE CUSTOMER, NAMED IN THE BAR: the press opens their details under it, the act puts them
     on, and the bar says them */
  await head.getByRole('button', { name: 'Name the customer' }).click()
  await page.getByLabel('Who the quote is for').fill('Jordan Avery')
  await page.getByLabel('One line of contact, as it should print').fill('0400 000 000')
  await shot('03-customer')
  await page.getByRole('button', { name: 'Put their name on it' }).click()
  await expect(page.getByLabel('Who the quote is for')).toBeHidden()
  await expect(head).toContainText('Jordan Avery')
  await expect(head).toContainText('0400 000 000')

  /* 7. THE SPECIFICATIONS, EVERY ONE, FROM A KEYBOARD, over the page, said as a person says them
     (the critic, 2026-10-31, P-2: they opened in the boat's column, took the photograph down to a
     strip, and read "Min 90 HP", "Shaft Lgth", "Matrix", "Model Code") */
  const shotBefore = (await page.locator('.cfg-shot').boundingBox())!
  const more = page.getByRole('button', { name: /^All \d+ specifications$/ })
  await more.focus()
  await page.keyboard.press('Enter')
  const specs = page.getByRole('dialog', { name: /every specification$/ })
  await expect(specs).toBeVisible()
  await expect(specs.getByTestId('specifications')).toContainText('90–115 hp')
  await expect(specs.getByTestId('specifications')).toContainText(/Shaft length/i)
  await expect(specs.getByTestId('specifications')).not.toContainText(/Matrix|Model code|Lgth/i)
  await cameToRest(page)
  await shot('04-specs')
  await page.keyboard.press('Escape')
  await expect(specs).toBeHidden()
  await expect(more).toBeFocused()
  expect((await page.locator('.cfg-shot').boundingBox())!.height).toBe(shotBefore.height)

  /* 8. AT A DESK ONLY THE CHAPTERS SCROLL */
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await cameToRest(page)
  await shot('05-motor')
  const column = page.locator('.cfg-scroll')
  if (desk) {
    const still = async () => ({
      window: await page.evaluate(() => scrollY),
      bar: (await page.locator('.cfg-mast__bar').boundingBox())!.y,
      photo: (await page.locator('.cfg-shot').boundingBox())!.y,
      tally: (await tally.boundingBox())!.y,
    })
    const before = await still()
    const scrolled = await column.evaluate((el) => el.scrollTop)
    const over = (await column.boundingBox())!
    await page.mouse.move(over.x + over.width / 2, over.y + over.height / 2)
    await page.mouse.wheel(0, 700)
    await expect.poll(() => column.evaluate((el) => el.scrollTop)).toBeGreaterThan(scrolled)
    expect(await still()).toEqual(before)
    /* a wheel over the boat moves nothing at all */
    const boat = (await page.locator('.cfg-shot').boundingBox())!
    const at = await column.evaluate((el) => el.scrollTop)
    await page.mouse.move(boat.x + boat.width / 2, boat.y + boat.height / 2)
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(400)
    expect(await still()).toEqual(before)
    expect(await column.evaluate((el) => el.scrollTop)).toBe(at)
    await shot('06-scrolled')
  } else {
    /* below a desk the page scrolls, and a total stays in sight: the floating one while the build
       is worked, and the summary's own once the page has gone on past the build into it (the
       critic, 2026-10-31, P-1: the summary is the page's end, a short build a wheel away) */
    await page.mouse.wheel(0, 900)
    await cameToRest(page)
    const after = (await tally.boundingBox())!
    expect(after.y + after.height).toBeLessThanOrEqual(size.height)
    const floating = after.y >= 0
    const summed = await page
      .getByTestId('summary')
      .locator('.cfg-hand__fig')
      .evaluate((el) => {
        const figure = el.getBoundingClientRect()
        return figure.top >= 0 && figure.bottom <= innerHeight
      })
    expect(floating || summed, 'no total in sight').toBe(true)
    await shot('06-scrolled')
  }

  /* 9. A MOTOR'S PICTURE, LARGE, among its chapter's */
  const motor = page.getByRole('region', { name: /^02 Motor/ })
  const expand = motor.getByRole('button', { name: 'See its picture larger' })
  await expand.first().scrollIntoViewIfNeeded()
  await expand.first().click()
  await expect(large).toBeVisible()
  await expect(large).toContainText(/1 of \d+ · Motor/)
  await page.keyboard.press('ArrowRight')
  await expect(large).toContainText(/2 of \d+ · Motor/)
  await large.getByRole('button', { name: 'Close' }).click()
  await expect(large).toBeHidden()
  await expect(expand.first()).toBeFocused()

  /* 10. SHOW ALL OPENS OVER THE PAGE, with its own find field and the total */
  const all = motor.getByRole('button', { name: /^Show all [\d,]+ in / })
  await all.scrollIntoViewIfNeeded()
  await cameToRest(page)
  await all.click()
  const sheet = page.getByRole('dialog', { name: /^All [\d,]+ in / })
  await expect(sheet).toBeVisible()
  const sheetTotal = sheet.getByTestId('sheet-total')
  await expect(sheetTotal).toContainText('$41,340')
  await expect(sheet.locator('.cfg-tiles > li').first()).toBeVisible()
  const tiles = await sheet.locator('.cfg-tiles > li').count()
  expect(tiles).toBeGreaterThan(4)
  await cameToRest(page)
  await shot('07-range')
  /* THE PAGE BEHIND IS LOCKED: a wheel over the dimmed page moves neither it nor the column */
  const behind = async () =>
    page.evaluate(() => [scrollY, document.querySelector('.cfg-scroll')?.scrollTop ?? 0])
  const still = await behind()
  await page.mouse.move(4, size.height / 2)
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(400)
  expect(await behind()).toEqual(still)
  /* its own find field narrows it */
  await sheet.getByLabel(/^Find in /).fill('F115')
  await expect.poll(() => sheet.locator('.cfg-tiles > li').count()).toBeLessThan(tiles)
  /* a press inside it puts the motor on, and the total on the sheet says so in place */
  await sheet.locator('.cfg-tiles .ui-option').first().click()
  await expect(sheetTotal).not.toContainText('$41,340')
  await expect(tally).not.toContainText('Not chosen yet: motor')
  await shot('08-range-added')
  /* and Escape hands the caret back to the press */
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(all).toBeFocused()

  /* 11. A RELOAD AT A CHAPTER OPENS THE COLUMN THERE (a desk); the page itself never moved */
  if (desk) {
    const url = new URL(page.url())
    url.searchParams.set('at', 'trailer')
    await page.goto(url.toString())
    await expect(page.getByRole('button', { name: /^03 Trailer/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    const trailer = (await page.locator('[data-chapter="trailer"]').boundingBox())!
    const box2 = (await column.boundingBox())!
    expect(trailer.y).toBeGreaterThanOrEqual(box2.y)
    /* its head at the column's top, or as near as the column's end lets it come */
    const end = await column.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop)
    expect(trailer.y < box2.y + 40 || end <= 1).toBe(true)
    /* moved there, wherever the column is long enough to move: at 1920 the open trailer, with its
       empty list now one line at its foot (the critic, P-5), and every other chapter shut fit the
       column whole */
    const scrolls = await column.evaluate((el) => el.scrollHeight > el.clientHeight + 1)
    if (scrolls) expect(await column.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    expect(await page.evaluate(() => scrollY)).toBe(0)
  }

  /* 12. NOTHING IS BLURRY: measured, and said */
  await page.evaluate(() => scrollTo(0, 0))
  await cameToRest(page)
  await picturesIn(page)
  /* AT REST: the reload's chapters have finished rising before anything is measured */
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (motion) =>
          !(motion instanceof CSSAnimation) ||
          motion.animationName !== 'cfg-rise' ||
          motion.playState !== 'running',
      ),
  )
  const measured = await softness(page)
  console.log(`[${info.project.name}] pictures:\n  ${measured.pictures.join('\n  ')}`)
  console.log(`[${info.project.name}] soft: ${measured.soft.length === 0 ? 'none' : ''}`)
  for (const said of measured.soft) console.log(`  ${said}`)
  expect(measured.soft).toEqual([])
})

/* ============================================================
   THE BOAT, CHOSEN IN ITS OWN CHAPTER, AND THE SUMMARY THAT FILLS THE
   SCREEN (the owner, 2026-10-30: "the picking model color and all of
   that nonsense to be done in hull section … so they can see differences
   in real time", and "the finale section should actually take the whole
   page summary when you scroll to that … with print and send").

     1. the hull chapter offers the Sport series' models, its two
        materials and its colours, each with what it does to the total;
     2. a press changes the bar, the total and the photograph at once;
     3. scrolling on past the last chapter (a desk) or the door at the
        rail's foot (below one) brings the summary in, a window tall,
        every line on it with its figure, and the give in it;
     4. given, it offers the printed quote and email from the dealer's
        own mail; and the way back lands on the build.
   ============================================================ */
test('the boat chosen in its chapter, and the summary that fills the screen', async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await pickAndStart(page, 'boat_highfield', 'SP560')
  await cameToRest(page)
  const size = page.viewportSize()!
  const desk = size.width >= 1200 && size.height >= 700
  const shot = async (name: string): Promise<void> => {
    if (LOOK === '') return
    await picturesIn(page)
    await page.screenshot({ path: `${LOOK}/build-${info.project.name}-${name}.png` })
  }
  const head = page.locator('.cfg-mast')
  const tally = page.getByTestId('running-total')

  /* 1. THE AXES OF THE SERIES, EACH A ROW OF PRESSES WITH ITS DIFFERENCE */
  const choices = page.getByTestId('boat-choices')
  await expect(choices).toBeVisible()
  await expect(choices.getByRole('group', { name: /^Model/ })).toBeVisible()
  await expect(choices.getByRole('group', { name: /^Material/ })).toBeVisible()
  await expect(choices.getByRole('group', { name: /^Colour/ })).toBeVisible()
  await expect(
    choices.getByRole('group', { name: /^Model/ }).locator('[aria-pressed]'),
  ).toHaveCount(16)
  await shot('09-hull-choices')

  /* 2. A PRESS ANSWERS EVERYWHERE AT ONCE */
  const before = await tally.locator('.cfg-tally__fig').innerText()
  await choices.getByRole('button', { name: /^Hypalon, \+\$/ }).click()
  await expect(head).toContainText('Hypalon')
  await expect(tally.locator('.cfg-tally__fig')).not.toHaveText(before)
  const photo = page.locator('.cfg-shot__img')
  const was = await photo.getAttribute('src')
  await choices.getByRole('button', { name: /^Sport 520, / }).click()
  await expect(head.getByRole('heading', { level: 1 })).toHaveText(/Highfield Sport 520/)
  await expect(choices.getByRole('button', { name: /^Sport 520, on the quote$/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(await photo.getAttribute('src')).not.toBe(was)
  await cameToRest(page)
  await shot('10-sport-520')

  /* the customer, named in the bar, with a line of contact that holds an email */
  await head.getByRole('button', { name: 'Name the customer' }).click()
  await page.getByLabel('Who the quote is for').fill('Jordan Avery')
  await page.getByLabel('One line of contact, as it should print').fill('jordan.avery@example.com')
  await page.getByRole('button', { name: 'Put their name on it' }).click()
  await expect(head).toContainText('Jordan Avery')

  /* and a motor, so the summary has more than the boat on it */
  await page.getByRole('button', { name: /^02 Motor/ }).click()
  await cameToRest(page)
  await page
    .getByRole('region', { name: /^02 Motor/ })
    .locator('.cfg-tiles .ui-option')
    .first()
    .click()
  await expect(tally).not.toContainText('Not chosen yet: motor')
  await cameToRest(page)

  /* 3. THE SUMMARY: past the last chapter at a desk, the door below one */
  const summary = page.getByTestId('summary')
  if (desk) {
    const column = page.locator('.cfg-scroll')
    const over = (await column.boundingBox())!
    await page.mouse.move(over.x + over.width / 2, over.y + over.height / 2)
    for (let i = 0; i < 12 && !(await summary.isVisible()); i += 1) {
      await page.mouse.wheel(0, 400)
      await page.waitForTimeout(120)
    }
  } else {
    /* BELOW A DESK SCROLLING ON REACHES IT, with no press (the critic, P-1): it is the page's end */
    for (let i = 0; i < 40; i += 1) await page.mouse.wheel(0, 800)
    await cameToRest(page)
    const reached = (await summary.boundingBox())!
    expect(reached.y).toBeLessThan(size.height / 2)
    await page.evaluate(() => scrollTo(0, 0))
    await cameToRest(page)
    const door = page.getByRole('button', { name: /^The summary/ })
    await door.scrollIntoViewIfNeeded()
    await door.click()
  }
  await expect(summary).toBeVisible()
  await expect(page).toHaveURL(/at=finale/)
  await cameToRest(page)
  await page.waitForTimeout(700)
  const box = (await summary.boundingBox())!
  if (desk) {
    /* ONE SCREEN, EXACTLY: the window's height, nothing in it past its foot */
    expect(Math.round(box.y)).toBe(0)
    expect(Math.round(box.height)).toBe(size.height)
    expect(await summary.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1)
  } else {
    /* the page's last screen, brought to the window's top and at least a window tall */
    expect(Math.abs(box.y)).toBeLessThanOrEqual(2)
    expect(box.height).toBeGreaterThanOrEqual(size.height - 1)
  }
  await expect(summary.getByRole('heading', { level: 2 })).toHaveText(/Highfield Sport 520/)
  await expect(summary.locator('.cfg-sum__item')).toHaveCount(2)
  await expect(summary.locator('.cfg-hand')).toContainText('For Jordan Avery')
  /* THE BOAT'S NAME AS THE TITLE AND ON THE LINE THAT PRICES IT, never on the card (the critic,
     P-10; the paper-quote critique, 2026-10-31: the hull's line said its finish alone), AND THE
     CONTACT LINE ON THE CARD */
  expect((await summary.innerText()).match(/Highfield Sport 520/g)?.length).toBe(2)
  await expect(summary.locator('.cfg-sum__item-name').first()).toContainText('Highfield Sport 520')
  await expect(summary.locator('.cfg-hand')).not.toContainText('Highfield Sport 520')
  await expect(summary.locator('.cfg-hand')).toContainText('jordan.avery@example.com')
  await shot('11-summary')

  /* 4. GIVEN: the printed quote, and email from the dealer's own mail */
  await summary.getByRole('button', { name: 'Give it to the customer' }).click()
  await expect(summary.getByTestId('given-seal')).toContainText('Given to Jordan Avery')
  await expect(summary.getByRole('button', { name: 'Open the printed quote' })).toBeVisible()
  await expect(
    summary.getByRole('link', { name: 'Email it to jordan.avery@example.com' }),
  ).toHaveAttribute('href', /^mailto:jordan\.avery@example\.com\?subject=Quote%20/)
  await page.waitForTimeout(1200)
  await shot('12-summary-given')

  /* and the way back lands on the build */
  if (desk) {
    const over = (await summary.boundingBox())!
    await page.mouse.move(over.x + 40, over.y + over.height / 2)
    for (let i = 0; i < 8 && (await summary.isVisible()); i += 1) {
      await page.mouse.wheel(0, -400)
      await page.waitForTimeout(120)
    }
    await expect(summary).toBeHidden()
  } else {
    /* below a desk the summary stays the page's end, and the page goes back up to the build */
    await summary.getByRole('button', { name: 'Back to the build' }).click()
    await expect(page).not.toHaveURL(/at=finale/)
    await cameToRest(page)
  }
  await expect(page.getByRole('button', { name: /^02 Motor/ })).toBeInViewport()
})
