/* eslint-disable unicorn/consistent-function-scoping -- measured in the page */
import { expect, test, type Page } from '@playwright/test'
import { startAQuote, written } from '../mint'

/* A TEMPORARY PROBE of Settings for the round's builder; removed before the report. */
const OUT = process.env.HL2_PROBE_OUT ?? 'test-results-probe'
test.skip(!process.env.HL2_PROBE_OUT, 'probe on request')
const sizeOf = (page: Page) => `${page.viewportSize()!.width}x${page.viewportSize()!.height}`

async function to(page: Page, query = '') {
  await page.goto(`/manage${query}`)
  await expect(page.locator('[data-testid="manage"][data-read]')).toBeVisible({ timeout: 30_000 })
}

const probe = (page: Page) =>
  page.evaluate(() => {
    const r = (el: Element | null | undefined) => {
      const b = el?.getBoundingClientRect()
      return b
        ? `${Math.round(b.left)},${Math.round(b.top)}-${Math.round(b.right)},${Math.round(b.bottom)}`
        : ''
    }
    const lit = document.querySelector('.mg-proof[data-lit]')
    const litPart = lit
      ? [...lit.querySelectorAll('*')].find((el) => getComputedStyle(el).outlineStyle === 'solid')
      : null
    const band = [52, 60, 70, 76].map((y) => {
      const el = document.elementFromPoint(window.innerWidth * 0.75, y)
      return `${y}:${el?.className.toString().slice(0, 40) ?? ''}`
    })
    const bandL = [52, 60, 70].map((y) => {
      const el = document.elementFromPoint(window.innerWidth * 0.25, y)
      return `${y}:${el?.className.toString().slice(0, 40) ?? ''}`
    })
    const chip = document.querySelector('.mg-index [aria-current]')
    return {
      scrollY: Math.round(window.scrollY),
      editor: r(
        document.querySelector('[data-testid="manage-editor"],[data-testid="manage-person"]'),
      ),
      lens: r(document.querySelector('.mg-proof-lens[data-lens]')),
      lit: r(litPart),
      stage: r(document.querySelector('.mg-stage-wrap')),
      stuck: document.querySelector('.mg-stage-wrap')?.hasAttribute('data-stuck') ?? false,
      index: r(document.querySelector('.mg-index')),
      indexStuck: document.querySelector('.mg-index')?.hasAttribute('data-stuck') ?? false,
      chip: `${chip?.textContent ?? ''} ${r(chip)}`,
      dock: r(document.querySelector('[data-testid="manage-dock"]')),
      toast: r(document.querySelector('[data-sonner-toast]')),
      band,
      bandL,
      sideways: document.documentElement.scrollWidth > window.innerWidth,
      page: document.documentElement.scrollHeight,
      small: [...document.querySelectorAll('.mg *')]
        .filter((el) => {
          if (!(el instanceof HTMLElement) || el.closest('.mg-proof, .mg-mini')) return false
          if (![...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim()))
            return false
          const b = el.getBoundingClientRect()
          if (b.width === 0 || b.height === 0) return false
          return parseFloat(getComputedStyle(el).fontSize) < 12
        })
        .map((el) => el.className + ' ' + el.textContent?.slice(0, 20)),
    }
  })

test('probe', async ({ page }) => {
  test.setTimeout(300_000)
  const size = sizeOf(page)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const shot = async (name: string, full = false) => {
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage: full })
    console.log(`[${size}] ${name}: ${JSON.stringify(await probe(page))}`)
  }
  await startAQuote(page)
  await written(page)
  await to(page)
  await shot('a-rest')
  await shot('a-full', true)
  await to(page, '?line=deposit')
  await page.waitForTimeout(1200)
  await shot('b-deposit-open')
  await page.locator('.ui-segmented-face', { hasText: /^A share$/ }).click()
  await page.getByRole('textbox', { name: 'Share of the total, in %' }).fill('10')
  await page.getByTestId('manage-editor').getByRole('button', { name: 'Keep' }).click()
  await shot('c-deposit-kept')
  await page.mouse.wheel(0, 900)
  await shot('d-scrolled')
  await page.locator('.mg-index').getByRole('link', { name: 'Pictures' }).click()
  await shot('e-pictures')
  await page.locator('.mg-index').getByRole('link', { name: 'Shape' }).click()
  await page
    .getByRole('group', { name: 'Shadow' })
    .locator('.ui-segmented-face', { hasText: /^Deep$/ })
    .click()
  await shot('f-shape-deep')
  await page.keyboard.press('End')
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await shot('g-foot')
  await to(page)
  await page.getByRole('button', { name: /^From the mark, #0066CC/ }).click()
  await shot('h-colour-staged')
  await to(page, '?line=quoteTerms')
  await page.waitForTimeout(1200)
  await shot('i-terms')
  expect(errors).toEqual([])
})
