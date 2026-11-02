import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { cameToRest, openChapter, pickAndStart } from '../mint'

/* ============================================================
   EVERY ROW'S GALLERY, ON THE BUILD (the owner, 2026-10-31: "per boat
   and product the ability to have more than one image and cover image
   and whatnot"; the galleries, 2026-11-02). At every size the projects
   run, 390 × 844 to 1920 × 1080, with a picture of each under
   docs/directions/quote-3/wire/:

     1. the stage draws the boat's cover and says over its corner how
        many pictures it holds; its press opens every picture of the
        boat, the cover first and marked, with the dealer's acts;
     2. a picture made the cover there is the stage's at once, and the
        final package draws it on the boat's line;
     3. a motor's press opens that motor's own pictures and never the
        chapter's other motors; a picture added there and made its
        cover is the one its tile draws, and the press counts it;
     4. a tile the build draws without a picture offers one in the
        same place, in the kit's own control for it.

   THE PICTURES ARE THE ITEMS' OWN. The one picture this walk adds to a
   motor is that motor's own picture, read as bytes from public/
   seed-images off its own tile, as the gallery walk adds a part's own
   picture to it — so nothing is added that a dealer could not
   truthfully add. Nothing is added to the trailer no picture is held
   for. Each test opens a fresh browser, so nothing outlives the walk.
   ============================================================ */

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'docs', 'directions', 'quote-3', 'wire')

/** Every animation at rest and every picture in the window decoded, then the frame written. */
async function shot(page: Page, name: string, project: string, at?: Locator): Promise<void> {
  await page.evaluate(() =>
    Promise.race([
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
      new Promise((done) => setTimeout(done, 1000)),
    ]),
  )
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
  /* AND DECODED: a 2,560px photograph complete is not yet painted, and a frame taken in that
     beat drew the lightbox's plate empty at 844 × 390 */
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        [...document.images]
          .filter((img) => img.loading !== 'lazy')
          .map((img) => img.decode().catch(() => undefined)),
      ),
      new Promise((done) => setTimeout(done, 3000)),
    ]),
  )
  await page.waitForTimeout(300)
  const file = path.join(OUT, `${name}-${project}.png`)
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

/** How far under a tile its quiet press stands, from the tile's foot to the press's top. */
async function underTheTile(option: Locator): Promise<number> {
  const tile = (await option.locator('.ui-option').boundingBox())!
  const press = (await option.locator('.cfg-opt__look').boundingBox())!
  return press.y - (tile.y + tile.height)
}

/** The picture large, by its own name: a sheet over the page is a dialog too. */
const largeIn = (page: Page): Locator => page.getByRole('dialog').and(page.locator('.ui-lightbox'))

test.beforeEach(async ({ page }) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
})

test('the boat’s gallery from the stage: its cover first, a cover chosen in the build drawn on the stage and in the final package', async ({
  page,
}, info) => {
  await pickAndStart(page, 'boat_highfield', 'SP560')
  await cameToRest(page)
  const stage = page.locator('.cfg-shot__img')
  const was = await stage.getAttribute('src')

  /* 1. THE COUNT OVER THE CORNER, AND THE PRESS THAT SAYS IT */
  const many = page.locator('.cfg-shot__many')
  await expect(many).toBeVisible()
  const n = Number((await many.innerText()).trim())
  expect(n, 'the SP560 holds more than one picture').toBeGreaterThan(1)
  const opener = page.getByRole('button', { name: `See the boat’s ${n} pictures larger` })
  await opener.scrollIntoViewIfNeeded()
  await shot(page, 'w01-stage', info.project.name)
  await opener.click()
  const large = largeIn(page)
  await expect(large).toBeVisible()
  const count = large.locator('.ui-lightbox-count')
  await expect(count).toHaveText(new RegExp(`^Cover1 of ${n} · Highfield Sport 560$`))
  await expect(large.locator('.ui-lightbox-img')).toHaveAttribute('src', was!)
  /* what this quote carries that the picture may not show, said under it as on the stage */
  await expect(large).toContainText(/On this quote: no motor yet/)
  await expect(large.getByRole('button', { name: 'Add pictures' })).toBeVisible()
  await expect(large.getByRole('button', { name: 'Make it the cover' })).toHaveCount(0)
  /* the strip of them all, where the window has the height for it; on a phone on its side the
     arrows and the count reach every picture (the kit's own rule) */
  const strip = large.getByRole('list', { name: /^Every picture · / }).getByRole('button')
  if ((page.viewportSize()?.height ?? 0) > 520) await expect(strip).toHaveCount(n)
  await shot(page, 'w02-boat-gallery', info.project.name)

  /* 2. THE SECOND PICTURE MADE THE COVER, IN THE BUILD */
  await page.keyboard.press('ArrowRight')
  await expect(count).toHaveText(new RegExp(`^2 of ${n} · `))
  const second = await large.locator('.ui-lightbox-img').getAttribute('src')
  expect(second).not.toBe(was)
  await large.getByRole('button', { name: 'Make it the cover' }).click()
  await expect(count).toHaveText(new RegExp(`^Cover1 of ${n} · `))
  await expect(large.locator('.ui-lightbox-img')).toHaveAttribute('src', second!)
  await page.keyboard.press('Escape')
  await expect(large).toBeHidden()
  await expect(opener).toBeFocused()
  /* the stage draws it at once */
  await expect(stage).toHaveAttribute('src', second!)
  await cameToRest(page)
  await shot(page, 'w03-stage-new-cover', info.project.name)

  /* and the final package draws it on the boat's own line */
  const door = page.locator('.cfg-door').getByRole('button', { name: 'View final package' })
  await door.scrollIntoViewIfNeeded()
  await door.click()
  const pkg = page.getByTestId('final-package')
  await expect(pkg).toBeVisible()
  await expect(pkg).not.toHaveAttribute('data-preparing', '', { timeout: 3_000 })
  const boatLine = pkg.locator('.cfg-pkg__item').first()
  await expect(boatLine.locator('.cfg-pkg__item-name')).toContainText('Highfield Sport 560')
  await expect(boatLine.locator('.cfg-pkg__thumb img')).toHaveAttribute('src', second!)
  /* the gallery's step, said in the kit's toast, went with the build: it stood over the package's
     "Print or save the PDF" at 1440 and 1920 */
  await expect(page.locator('.ui-toast')).toHaveCount(0)
  await expect(pkg.getByRole('button', { name: 'Print or save the PDF' })).toBeVisible()
  await page.waitForTimeout(400)
  await shot(page, 'w04-package-cover', info.project.name)
})

test('a motor’s own gallery from its tile: a picture added in the build and made its cover is the one the tile draws', async ({
  page,
}, info) => {
  await pickAndStart(page, 'boat_highfield', 'SP560')
  await cameToRest(page)
  await openChapter(page, /^02 Motor/)
  const motor = page.getByRole('region', { name: /^02 Motor/ })
  const option = motor.locator('.cfg-tiles .cfg-opt').first()
  await option.scrollIntoViewIfNeeded()
  const tile = option.locator('.ui-option')
  const well = tile.locator('.ui-option-well img')
  const src = (await well.getAttribute('src')) ?? ''
  expect(src).toMatch(/\/seed-images\/[^/]+\.webp$/)
  const own = path.join(ROOT, 'public', 'seed-images', src.split('/').pop()!)
  const name = (await tile.locator('.ui-option-name').innerText()).trim()

  /* 3. THE PRESS UNDER THE TILE OPENS THIS MOTOR'S PICTURES, AND NO OTHER MOTOR'S */
  const look = option.getByRole('button', { name: /^See its (\d+ pictures|picture) larger$/ })
  const said = (await look.innerText()).trim()
  const n = Number(/(\d+) pictures/.exec(said)?.[1] ?? 1)
  await look.click()
  const large = largeIn(page)
  await expect(large).toBeVisible()
  await expect(large.locator('.ui-lightbox-title')).toHaveText(name)
  await expect(large).not.toContainText(/ · Motor/)
  if (n === 1) await expect(large.locator('.ui-lightbox-count')).toHaveCount(0)

  /* ITS OWN PICTURE ADDED BESIDE THE ONES HELD, then made its cover */
  await give(page, large.getByRole('button', { name: 'Add pictures' }), own)
  const count = large.locator('.ui-lightbox-count')
  await expect(count).toHaveText(new RegExp(`^${n + 1} of ${n + 1} · `))
  await expect(large).toContainText(/Added by Asaf, \d{1,2} [A-Z][a-z]+ \d{4}/)
  await shot(page, 'w05-motor-added', info.project.name)
  await large.getByRole('button', { name: 'Make it the cover' }).click()
  await expect(count).toHaveText(new RegExp(`^Cover1 of ${n + 1} · `))
  const cover = await large.locator('.ui-lightbox-img').getAttribute('src')
  expect(cover).toMatch(/^data:image\//)
  await page.keyboard.press('Escape')
  await expect(large).toBeHidden()

  /* the tile draws the cover, and its press counts the pictures */
  await expect(well).toHaveAttribute('src', cover!)
  await expect(
    option.getByRole('button', { name: `See its ${n + 1} pictures larger` }),
  ).toBeVisible()
  await cameToRest(page)
  await shot(page, 'w06-motor-tile', info.project.name, option)

  /* put on the quote, the final package draws its line with the same cover */
  await tile.click()
  await expect(page.getByTestId('running-total')).not.toContainText('Not chosen yet: motor')
  await cameToRest(page)
  const door = page.locator('.cfg-door').getByRole('button', { name: 'View final package' })
  await door.scrollIntoViewIfNeeded()
  await door.click()
  const pkg = page.getByTestId('final-package')
  await expect(pkg).not.toHaveAttribute('data-preparing', '', { timeout: 3_000 })
  const line = pkg.locator('.cfg-pkg__item').filter({ hasText: name })
  await expect(line.locator('.cfg-pkg__thumb img')).toHaveAttribute('src', cover!)
  await line.scrollIntoViewIfNeeded()
  await cameToRest(page)
  await shot(page, 'w09-package-motor-line', info.project.name, pkg.locator('.cfg-pkg__lines'))
})

test('a tile drawn without a picture offers one where every other tile opens its own', async ({
  page,
}, info) => {
  /* THE STACER 429 OUTLAW'S TRAILERS (Tiller Steer or Side Console): the price list names one trailer for it that
     no picture is held for, on a list of trailers that are pictured (found off the rail by the
     configurator's own unit test) */
  await pickAndStart(page, 'boat_stacer', '429 Outlaw')
  await cameToRest(page)
  await openChapter(page, /^03 Trailer/)
  const trailer = page.getByRole('region', { name: /^03 Trailer/ })
  const bare = trailer
    .locator('.cfg-tiles .cfg-opt')
    .filter({ has: page.getByRole('button', { name: 'Add a picture' }) })
    .first()
  /* the window as a person sees it there: the tile in the middle of it, the bars over the page */
  await bare.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(bare.locator('.ui-option-well img')).toHaveCount(0)
  await expect(bare.getByRole('button', { name: /^See its/ })).toHaveCount(0)
  await page.mouse.move(0, 0)
  await cameToRest(page)
  await shot(page, 'w07-trailer-door', info.project.name)
  /* the press sits where a pictured tile's "See its picture larger" sits: one height under the
     tile on every tile of the row */
  const pictured = trailer
    .locator('.cfg-tiles .cfg-opt')
    .filter({ has: page.getByRole('button', { name: /^See its/ }) })
    .first()
  if ((await pictured.count()) > 0) {
    /* within the pixel a fractional layout rounds to (measured 1px apart at 844 × 390) */
    expect(Math.abs((await underTheTile(bare)) - (await underTheTile(pictured)))).toBeLessThan(1.5)
  }
  await bare.getByRole('button', { name: 'Add a picture' }).click()
  const dialog = page.getByRole('dialog', { name: /^Pictures of the / })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: /^Add a picture of the / })).toBeVisible()
  await shot(page, 'w08-trailer-add', info.project.name)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
