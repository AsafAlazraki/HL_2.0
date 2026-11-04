/* eslint-disable unicorn/consistent-function-scoping -- the measuring functions run inside the page, where Playwright evaluates them with no closure */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { startAQuote, written } from '../mint'
import { overlapsInEveryState } from '../rulers/measure/overlap'

/* ============================================================
   SETTINGS, EVERY STATE AT EVERY SIZE — the screenshots the data round
   reads by eye, taken only when `HL2_MANAGE_SHOTS` is set, so the gate
   never writes into docs. `HL2_MANAGE_SHOTS` names the folder under
   docs/directions/data-round/manage/ (`after` when it is just "1").
   Every press is a person's press, through the real door on the real
   price list; nothing is planted. The only things typed are test values:
   the Australian Business Register's published example ABN, a refused
   ABN, a 10% deposit, a title, one made-up second person on
   `example.test`, and a refused colour.
   ============================================================ */

const FOLDER = process.env.HL2_MANAGE_SHOTS ?? ''
const OUT = `docs/directions/data-round/manage/${FOLDER === '1' || FOLDER === '' ? 'after' : FOLDER}`
const READY = '[data-testid="manage"][data-read]'

test.skip(!process.env.HL2_MANAGE_SHOTS, 'screenshots are taken on request')

const sizeOf = (page: Page) => `${page.viewportSize()!.width}x${page.viewportSize()!.height}`

async function to(page: Page, query = '') {
  await page.goto(`/manage${query}`)
  await expect(page.locator(READY)).toBeVisible({ timeout: 30_000 })
}

/** A person's press: Playwright brings it into view and presses where nothing covers it. */
async function pressOn(_page: Page, target: Locator) {
  await target.click()
}

test('every state of Settings, photographed and measured', async ({ page }) => {
  test.setTimeout(600_000)
  const size = sizeOf(page)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage })
  }
  /** what the window holds, for the record */
  const measure = async (label: string) => {
    const m = await page.evaluate(() => {
      const r = (sel: string) => {
        const b = document.querySelector(sel)?.getBoundingClientRect()
        return b ? `${Math.round(b.top)}-${Math.round(b.bottom)}` : ''
      }
      const end = (sel: string) => {
        const el = document.querySelector(sel)
        if (!el) return 0
        let last = 0
        for (const c of el.children) last = Math.max(last, c.getBoundingClientRect().bottom)
        return Math.round(last + window.scrollY)
      }
      const small = [...document.querySelectorAll('.mg *')].filter((el) => {
        if (!(el instanceof HTMLElement) || el.closest('.mg-proof, .mg-mini')) return false
        if (![...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim()))
          return false
        const b = el.getBoundingClientRect()
        if (b.width === 0 || b.height === 0) return false
        return parseFloat(getComputedStyle(el).fontSize) < 12
      }).length
      const toast = document.querySelector('[data-sonner-toast]')?.getBoundingClientRect()
      const dock = document.querySelector('[data-testid="manage-dock"]')?.getBoundingClientRect()
      return {
        sideways: document.documentElement.scrollWidth > window.innerWidth,
        page: document.documentElement.scrollHeight,
        paperEnds: end('.mg-paper'),
        waterEnds: end('.mg-water'),
        small,
        index: r('.mg-index'),
        stage: r('.mg-stage-wrap'),
        dock: r('[data-testid="manage-dock"]'),
        toast: toast ? `${Math.round(toast.top)}-${Math.round(toast.bottom)}` : '',
        toastOverDock:
          toast && dock ? toast.bottom > dock.top + 2 && toast.top < dock.bottom - 2 : false,
        h1: document.querySelector('h1')?.textContent ?? '',
      }
    })
    console.log(`[${size}] ${label}: ${JSON.stringify(m)}`)
    return m
  }
  const overlaps: string[] = []
  const overlapAt = async (label: string) => {
    for (const { state, r } of await overlapsInEveryState(page))
      for (const p of r.pairs)
        overlaps.push(`[${size}] ${label} [${state}] ${p.kind}: ${p.a} × ${p.b}`)
  }

  await throughTheDoor(page)
  await to(page)
  await shot('01-rest')
  await shot('02-full', true)
  const rest = await measure('rest')
  expect(rest.sideways).toBe(false)
  expect(rest.h1).toBe('Settings')

  /* the index: a part pressed lands under it, and in a hand it stands at the head while read */
  await pressOn(page, page.locator('.mg-index').getByRole('link', { name: 'Pictures' }))
  await page.waitForTimeout(600)
  await shot('03-index-pictures')
  await measure('index → pictures')

  /* the ABN refused in place, then the register's own example kept */
  await to(page, '?line=abn')
  await page.getByRole('textbox', { name: 'ABN', exact: true }).fill('12 345')
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await shot('04-abn-refused')
  await page.getByRole('textbox', { name: 'ABN', exact: true }).fill('51 824 753 556')
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByTestId('manage-editor')).toHaveCount(0)
  await shot('05-abn-kept')

  /* the deposit as a rule: refused, then 10% of the total, with words under it */
  await pressOn(page, page.getByRole('button', { name: 'Set deposit' }))
  await expect(page.getByTestId('manage-editor')).toBeVisible()
  await pressOn(page, page.locator('.ui-segmented-face', { hasText: /^A share$/ }))
  await page.getByRole('textbox', { name: 'Share of the total, in %' }).fill('0')
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await shot('06-deposit-refused')
  await page.getByRole('textbox', { name: 'Share of the total, in %' }).fill('10')
  await page
    .getByRole('textbox', { name: 'Deposit wording' })
    .fill('The deposit secures the boat; the balance is paid on delivery.')
  await shot('07-deposit-open')
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByTestId('manage-editor')).toHaveCount(0)
  await shot('08-deposit-kept')
  await overlapAt('deposit kept')

  /* people: Asaf kept with a title; the last who may refused; a second added, and the refusal
     gone because it is no longer true */
  await pressOn(page, page.getByRole('button', { name: 'Keep Asaf as a person' }))
  await page.getByRole('textbox', { name: 'Title' }).fill('Sales manager')
  await shot('09-person-open')
  await measure('person open (toast over the editor?)')
  await page.getByTestId('manage-person').getByRole('button', { name: 'Keep' }).click()
  await pressOn(page, page.getByRole('switch', { name: 'May change prices and settings' }))
  await shot('10-person-refused')
  await pressOn(page, page.getByRole('button', { name: 'Add a person' }))
  await page.getByRole('textbox', { name: 'Name' }).fill('Jordan Ellis-Whitcombe')
  await page.getByRole('textbox', { name: 'Title' }).fill('Finance and insurance manager')
  await page.getByRole('textbox', { name: 'Email' }).fill('jordan@example.test')
  await page.getByTestId('manage-person').getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByText('this is the last person who may')).toHaveCount(0)
  await shot('11-two-people')

  /* colour: refused at the floor; the mark's chosen, docked at the foot, the field following */
  await to(page)
  await page.getByRole('textbox', { name: 'Any other colour' }).fill('#FFEA28')
  await pressOn(page, page.getByRole('button', { name: 'Try it' }))
  await shot('12-colour-refused')
  await pressOn(page, page.getByRole('button', { name: /^From the mark, #0066CC/ }))
  await expect(page.getByTestId('manage-staged')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Any other colour' })).toHaveValue('#0066CC')
  await shot('13-colour-staged')
  const staged = await measure('colour staged')
  expect(staged.dock).not.toBe('')
  await pressOn(page, page.getByTestId('manage-staged').getByRole('button', { name: 'Keep' }))
  await expect(page.getByTestId('manage-staged')).toHaveCount(0)

  /* a photograph for Home, staged right after a kept step, so the Undo stands while it docks */
  await pressOn(page, page.getByRole('button', { name: /^Home: Highfield Sport 560/ }))
  await expect(page.getByTestId('manage-staged')).toBeVisible()
  await shot('14-picture-staged')
  const pic = await measure('picture staged, toast standing')
  expect(pic.toastOverDock).toBe(false)
  await overlapAt('picture staged')
  await pressOn(page, page.getByRole('button', { name: /^Sign-in: Highfield Sport 560/ }))
  await shot('15-door-staged')
  await pressOn(page, page.getByTestId('manage-staged').getByRole('button', { name: 'Put back' }))

  /* Home: a section hidden and the boats chosen from, one put first, named once */
  await to(page, '?at=home')
  await page.waitForTimeout(800)
  await shot('16-at-home')
  await pressOn(page, page.getByRole('button', { name: /^Choose from all \d+ boats/ }))
  await pressOn(page, page.getByRole('button', { name: /^Haines Signature Fisher 525F/ }).first())
  await expect(page.getByText(/Haines Signature Signature/)).toHaveCount(0)
  await shot('17-boats-choosing')

  /* shape, with what the steps do drawn beside them */
  await pressOn(page, page.locator('.mg-index').getByRole('link', { name: 'Shape' }))
  await pressOn(
    page,
    page
      .getByRole('group', { name: 'Shadow' })
      .locator('.ui-segmented-face', { hasText: /^Deep$/ }),
  )
  await shot('18-shape-deep')
  await pressOn(
    page,
    page
      .getByRole('group', { name: 'Shadow' })
      .locator('.ui-segmented-face', { hasText: /^Lifted$/ }),
  )

  /* everything decided elsewhere, at the page's end */
  await pressOn(page, page.locator('.mg-index').getByRole('link', { name: 'Elsewhere' }))
  await page.waitForTimeout(600)
  await shot('19-elsewhere')
  await shot('20-full-after', true)
  await measure('after')

  expect(errors).toEqual([])
  console.log(`[${size}] overlaps: ${overlaps.length}\n${overlaps.join('\n')}`)
})

test('Settings on a real draft: the quote’s own pages, the line being set lit where it lands', async ({
  page,
}) => {
  test.setTimeout(300_000)
  const size = sizeOf(page)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await startAQuote(page)
  await written(page)
  await to(page)
  /* the pages' own pictures decoded before they are photographed */
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('.mg-proof img')].every(
        (img) => (img as HTMLImageElement).complete,
      ),
    undefined,
    { timeout: 20_000 },
  )
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/21-on-a-draft-${size}.png` })
  await page.screenshot({ path: `${OUT}/22-on-a-draft-full-${size}.png`, fullPage: true })
  await to(page, '?line=deposit')
  await pressOn(page, page.locator('.ui-segmented-face', { hasText: /^A share$/ }))
  await page.getByRole('textbox', { name: 'Share of the total, in %' }).fill('10')
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/23-deposit-on-a-draft-${size}.png` })
  /* AT A DESK THE LINE BEING SET IS LIT IN THE SAME WINDOW AS ITS FIELD: the pages stand at the
     window's foot while it is open, and the line kept stays lit there while its Undo stands */
  const sum = page.locator('.mg-proof .doc-page:first-of-type .doc-money__sum')
  const desk = (await page.getByTestId('manage-lens').count()) > 0
  const where = async (label: string) =>
    console.log(
      `[${size}] ${label}: ${JSON.stringify(
        await page.evaluate(() => {
          const r = (sel: string) => {
            const b = document.querySelector(sel)?.getBoundingClientRect()
            return b ? `${Math.round(b.top)}-${Math.round(b.bottom)}` : ''
          }
          return {
            window: window.innerHeight,
            editor: r('[data-testid="manage-editor"]'),
            lens: r('.mg-proof-lens[data-lens]'),
            lit: r('.mg-proof .doc-page:first-of-type .doc-money__sum'),
          }
        }),
      )}`,
    )
  if (desk) {
    await expect(page.getByTestId('manage-editor')).toBeInViewport()
    await expect(sum).toBeInViewport({ ratio: 1 })
    await where('deposit open')
    /* the field, its Keep included, stands above the pages, never under them */
    const field = await page.getByTestId('manage-editor').boundingBox()
    const pages = await page.locator('.mg-proof-lens[data-lens]').boundingBox()
    expect((field?.y ?? 0) + (field?.height ?? 0)).toBeLessThanOrEqual(pages?.y ?? 0)
  }
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  if (desk) {
    await expect(sum.locator('[data-deposit="figure"]')).toContainText(/Deposit, 10% of the total/)
    await expect(sum).toBeInViewport({ ratio: 1 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/23b-deposit-kept-lit-${size}.png` })
    await where('deposit kept')
  }
  await written(page)
  await to(page, '?line=quoteTerms')
  const proof = page.getByTestId('manage-proof')
  if ((await proof.count()) > 0) {
    await proof.scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}/24-terms-lit-${size}.png` })
    await expect(proof.locator('[data-deposit="figure"]')).toContainText(
      /Deposit, 10% of the total: \$/,
    )
  }
  const title = await page.title()
  console.log(`[${size}] tab title on Settings with the pages drawn: ${title}`)
  expect(errors).toEqual([])
})

test('the route the rulers walk with a line open, on a real draft, photographed', async ({
  page,
}) => {
  test.setTimeout(240_000)
  await startAQuote(page)
  await written(page)
  await to(page, '?line=abn')
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/25-line-open-on-a-draft-${sizeOf(page)}.png` })
  const at = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent === 'Legal name')
    const r = b?.getBoundingClientRect()
    return {
      scrollY: Math.round(window.scrollY),
      legal: r ? `${Math.round(r.top)}-${Math.round(r.bottom)}` : '',
    }
  })
  console.log(`[${sizeOf(page)}] line open: ${JSON.stringify(at)}`)
})

test('a decision kept in another room, counted under Decided elsewhere, photographed', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await throughTheDoor(page)
  await page.goto(
    `/review?case=${encodeURIComponent('none:parts:TRAILER PARTS - Trailer Plugs:zero')}`,
  )
  await expect(page.locator('[data-testid="review"][data-read] .rv-stage__title')).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole('button', { name: 'Leave them at $0' }).click()
  await written(page)
  await to(page)
  await page.locator('.mg-index').getByRole('link', { name: 'Elsewhere' }).click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/26-elsewhere-counted-${sizeOf(page)}.png` })
  const left = page.locator('.mg-decided').filter({ hasText: 'Left alone on Review' })
  console.log(
    `[${sizeOf(page)}] counted: ${(await left.innerText()).replaceAll(String.fromCharCode(10), ' | ')}`,
  )
})
