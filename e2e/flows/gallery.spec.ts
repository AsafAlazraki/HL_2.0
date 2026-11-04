import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   EVERY OPTION'S GALLERY, WALKED WHERE A DEALER KEEPS ITS PICTURES —
   the price list's own details for one boat, a part's card in the
   catalogue, the boat on Fitment, and a heading of a place's range —
   at every size the projects run (390 × 844 to 1920 × 1080), with a
   picture of each written under docs/directions/quote-3/.

   THE PICTURES ARE THE ITEMS' OWN. The boat is the Formosa GRT 425
   (Tiller), `boat_formosa:1`, whose photograph on the water and studio
   picture a person marked as that exact boat. The one picture this walk
   adds to it is that boat's own studio picture, read as bytes from
   public/seed-images; the one it adds to a part is the part's own
   catalogue picture, read off its card. So nothing is added that a
   dealer could not truthfully add, and the browser keeps nothing past
   the walk (each test opens a fresh one).
   ============================================================ */

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'docs', 'directions', 'quote-3')
const FORMOSA = 'boat_formosa:1'
const FORMOSA_STUDIO = path.join(
  ROOT,
  'public',
  'seed-images',
  'formosa-grt-tiller-2-5754fe11.webp',
)

test.beforeEach(async ({ page }) => {
  test.setTimeout(150_000)
  await throughTheDoor(page)
})

const shot = async (page: Page, name: string, project: string, at?: Locator): Promise<void> => {
  /* EVERY TRANSITION ON THE PAGE AT REST first — a plate fading in is not the picture it shows;
     a second is far longer than any duration the kit's tokens give */
  await page.evaluate(() =>
    Promise.race([
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
      new Promise((done) => setTimeout(done, 1000)),
    ]),
  )
  const file = path.join(OUT, `gallery-${name}-${project}.png`)
  if (at) await at.screenshot({ path: file })
  else await page.screenshot({ path: file })
}

/** A file given to the chooser the press opens, as a person picks one from their disk. */
async function give(page: Page, press: Locator, file: string): Promise<void> {
  const chooser = page.waitForEvent('filechooser')
  await press.click()
  await (
    await chooser
  ).setFiles({ name: path.basename(file), mimeType: 'image/webp', buffer: readFileSync(file) })
}

/** The toast a press raised, by what it says (its Undo follows the words). */
const toast = (page: Page, said: RegExp | string): Locator =>
  page.locator('.ui-toast', { hasText: said }).last()

test('the price list’s own details: a boat’s gallery is added to, given a cover, ordered, opened large, and a picture taken off and back', async ({
  page,
}, info) => {
  await page.goto(`/data/boat_formosa?at=${encodeURIComponent(FORMOSA)}`)
  await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({ timeout: 30_000 })
  const record = page.getByTestId('sheet-record')
  const pics = record.locator('.ui-addpic')
  await pics.scrollIntoViewIfNeeded()
  const strip = pics.getByRole('list', { name: /’s pictures$/ })
  const thumbs = strip.getByRole('button')

  /* THE HELD ONES, counted off the page: the photograph on the water first, as the boat was
     always drawn, then the price list's own picture and the studio picture */
  await expect(thumbs.first()).toBeVisible()
  const held = await thumbs.count()
  expect(held, 'a photograph and a studio picture at least').toBeGreaterThanOrEqual(2)
  const all = held + 1
  await expect(thumbs.first()).toHaveAccessibleName(`Picture 1 of ${held}, the cover`)
  await expect(pics.locator('.ui-addpic-line')).toHaveText(
    new RegExp(`^Photograph from \\S+ · 1 of ${held}$`),
  )

  /* ONE ADDED BESIDE THEM, never in their place */
  await give(page, pics.getByRole('button', { name: 'Add pictures' }), FORMOSA_STUDIO)
  await expect(thumbs).toHaveCount(all)
  await expect(thumbs.last()).toHaveAccessibleName(`Picture ${all} of ${all}, Northside’s own`)
  await expect(thumbs.last()).toHaveAttribute('aria-pressed', 'true')
  await expect(pics.locator('.ui-addpic-line')).toHaveText(
    new RegExp(`^Added by Asaf, \\d{1,2} [A-Z][a-z]+ \\d{4} · ${all} of ${all}$`),
  )
  await expect(pics.getByRole('status')).toHaveText(/^Kept at \d+ × \d+, /)
  await shot(page, 'sheet-added', info.project.name, pics)

  /* A HELD PICTURE MADE THE COVER, chosen over the photograph */
  await thumbs.nth(1).click()
  await pics.getByRole('button', { name: 'Make it the cover' }).click()
  await expect(toast(page, /’s cover is the maker’s picture now\./)).toBeVisible()
  await expect(thumbs.first()).toHaveAccessibleName(`Picture 1 of ${all}, the cover`)
  await expect(pics.locator('.ui-addpic-cover')).toBeVisible()
  await expect(pics.locator('.ui-addpic-line')).toHaveText(
    new RegExp(`^(Picture|Photograph) from \\S+ · 1 of ${all}$`),
  )

  /* NORTHSIDE'S MOVED EARLIER, behind the cover */
  await thumbs.last().click()
  await pics.getByRole('button', { name: `Earlier, to ${all - 1} of ${all}` }).click()
  await expect(
    toast(page, new RegExp(`^Your picture is ${all - 1} of ${all} on the .+ now\\.`)),
  ).toBeVisible()
  await expect(thumbs.nth(all - 2)).toHaveAccessibleName(
    `Picture ${all - 1} of ${all}, Northside’s own`,
  )
  await shot(page, 'sheet-arranged', info.project.name, pics)

  /* THE WHOLE GALLERY LARGE, on the picture picked, the cover first and marked */
  await pics.locator('.ui-addpic-frame').click()
  /* the picture large, by its own name: in a hand the line's details are a dialog too */
  const large = page.getByRole('dialog').and(page.locator('.ui-lightbox'))
  await expect(large).toBeVisible()
  await expect(large.locator('.ui-lightbox-count')).toHaveText(
    new RegExp(`^${all - 1} of ${all} · `),
  )
  await expect(large).toContainText(/Added by Asaf, /)
  const img = large.locator('.ui-lightbox-img')
  await expect(img).toBeVisible()
  const drawn = (await img.boundingBox())!
  const pixels = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
  expect(drawn.width, 'never past its own pixels').toBeLessThanOrEqual(pixels + 1)
  await shot(page, 'sheet-large', info.project.name)
  await page.keyboard.press('ArrowLeft')
  await expect(large.locator('.ui-lightbox-count')).toHaveText(
    new RegExp(`^${all - 2} of ${all} · `),
  )
  await page.keyboard.press('Escape')
  await expect(large).toBeHidden()

  /* TAKEN OFF, AND BACK WITH UNDO in the place it had */
  await thumbs.nth(all - 2).click()
  await pics.getByRole('button', { name: 'Take it off' }).click()
  await expect(thumbs).toHaveCount(held)
  await toast(page, /^Your picture is off the /)
    .getByRole('button', { name: 'Undo' })
    .click()
  await expect(thumbs).toHaveCount(all)
  await expect(thumbs.nth(all - 2)).toHaveAccessibleName(
    `Picture ${all - 1} of ${all}, Northside’s own`,
  )
})

test('the catalogue: a part’s card opens its own gallery, where a picture is added and the card counts it', async ({
  page,
  viewport,
}, info) => {
  /* THE CHANDLERY REDRAWN (the data round, 2026-11-03): /catalogue is the aisles' front, and a
     pictured part is a card whose expand opens its own gallery */
  await page.goto('/catalogue')
  await expect(page.getByTestId('catalogue-door')).toBeVisible({ timeout: 30_000 })
  /* a part with its own picture, found by its name as a dealer finds one */
  await page
    .getByRole('searchbox', { name: 'Find a part in the catalogue' })
    .fill('transducer extension')
  const card = page
    .locator('.chd-card')
    .filter({ has: page.getByRole('button', { name: /^See the .+ larger$/ }) })
    .first()
  await card.scrollIntoViewIfNeeded()
  const src = (await card.locator('.chd-card__frame img').getAttribute('src')) ?? ''
  expect(src).toMatch(/\/seed-images\/[^/]+\.webp$/)
  const own = path.join(ROOT, 'public', 'seed-images', src.split('/').pop()!)

  await card.getByRole('button', { name: /^See the .+ larger$/ }).click()
  /* the picture large, by its own name: in a hand the line's details are a dialog too */
  const large = page.getByRole('dialog').and(page.locator('.ui-lightbox'))
  await expect(large).toBeVisible()
  /* one picture: no count, and the acts under it */
  await expect(large.locator('.ui-lightbox-count')).toHaveCount(0)
  await give(page, large.getByRole('button', { name: 'Add pictures' }), own)
  await expect(large.locator('.ui-lightbox-count')).toHaveText(/^2 of 2 · /)
  /* the strip of them all, where the window has the height for it; on a phone on its side the
     arrows and the count reach every picture, and the strip would take a third of the picture */
  const every = large.getByRole('list', { name: /^Every picture · / }).getByRole('button')
  if ((viewport?.height ?? 0) > 520) await expect(every).toHaveCount(2)
  else await expect(every.first()).toBeHidden()
  await expect(large).toContainText(/Added by Asaf, /)
  await shot(page, 'catalogue-large', info.project.name)
  await page.keyboard.press('Escape')
  await expect(large).toBeHidden()

  /* THE CARD COUNTS ITS PICTURES, and its press says it opens them all */
  const many = page
    .locator('.chd-card')
    .filter({ has: page.locator('.chd-card__many') })
    .first()
  await expect(many.locator('.chd-card__many')).toHaveText('2')
  await expect(many.getByRole('button', { name: /^See the .+’s 2 pictures larger$/ })).toBeVisible()
  await shot(page, 'catalogue-card', info.project.name, many)
})

test('Fitment: the boat’s window opens its gallery on the picture it draws', async ({
  page,
}, info) => {
  await page.goto(`/fitment?boat=${encodeURIComponent(FORMOSA)}`)
  await expect(page.locator('[data-testid="fitment"][data-read][data-boat]')).toBeVisible({
    timeout: 15_000,
  })
  const press = page.getByRole('button', { name: /^See the .+’s \d+ pictures larger$/ })
  await expect(press).toBeVisible()
  const n = Number(/’s (\d+) pictures/.exec((await press.getAttribute('aria-label')) ?? '')?.[1])
  expect(n).toBeGreaterThan(1)
  /* the count says what it counts (the fit-flow walk: an unlabelled 2 on the picture) */
  await expect(page.locator('.fp-photo__many')).toHaveText(`${n} pictures`)
  await shot(page, 'fitment-window', info.project.name, page.locator('.fp-photo'))
  await press.click()
  /* the picture large, by its own name: in a hand the line's details are a dialog too */
  const large = page.getByRole('dialog').and(page.locator('.ui-lightbox'))
  await expect(large.locator('.ui-lightbox-count')).toHaveText(
    new RegExp(`^(Cover)?\\d of ${n} · `),
  )
  await expect(large.getByRole('button', { name: 'Add pictures' })).toBeVisible()
  await shot(page, 'fitment-large', info.project.name)
  await page.keyboard.press('Escape')
  await expect(press).toBeFocused()
})

test('a maker’s own page: its head opens every one of its photographs on the water, each named by its model', async ({
  page,
}, info) => {
  /* REWRITTEN 2026-11-04 (the data round's line-up): the series tiles that each opened their own
     photographs are gone; the head's one press opens all of the maker's, as the judge asked */
  await page.goto('/places/boat_highfield')
  await expect(page.locator('[data-testid="place"][data-read]')).toBeVisible({ timeout: 30_000 })
  const press = page.getByRole('button', { name: /^See the \d+ photographs$/ })
  await expect(press).toBeVisible()
  const n = Number(/See the (\d+) photographs/.exec((await press.textContent()) ?? '')?.[1])
  expect(n).toBeGreaterThan(1)
  await shot(page, 'range-tile', info.project.name, page.locator('.pl-livery'))
  await press.click()
  /* the picture large, by its own name: in a hand the line's details are a dialog too */
  const large = page.getByRole('dialog').and(page.locator('.ui-lightbox'))
  await expect(large.locator('.ui-lightbox-count')).toHaveText(new RegExp(`^1 of ${n} · `))
  /* a maker's photographs are the maker's: there is nothing here to add to or take off */
  await expect(large.getByRole('button', { name: 'Add pictures' })).toHaveCount(0)
  await page.keyboard.press('ArrowRight')
  await expect(large.locator('.ui-lightbox-count')).toHaveText(new RegExp(`^2 of ${n} · `))
  await shot(page, 'range-large', info.project.name)
})
