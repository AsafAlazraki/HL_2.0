import { existsSync } from 'node:fs'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE SHELF, EVERY STATE AT EVERY SIZE, ON NORTHSIDE'S OWN WORKBOOK —
   the screenshots the data round reads by eye, taken only when
   `HL2_SHELF_SHOTS` is set (the folder under docs/directions/
   data-round/shelf/, `after` when it is "1"), so the gate never writes
   into docs. The workbook is the real `Parts Module (2).xlsx` from
   the owner's machine (docs/directions/data-round/shelf/directions.md);
   where it is not, the walk is skipped rather than faked.

   Each state is measured as it is shot: sideways scroll, text under
   12px, a visible control under 24px, text cut by its own box, Apply
   out of the window, and page errors.
   ============================================================ */

const FOLDER = process.env.HL2_SHELF_SHOTS ?? ''
const OUT = `docs/directions/data-round/shelf/${FOLDER === '1' || FOLDER === '' ? 'after' : FOLDER}`
const WORKBOOK = 'C:/Users/Asaf/dev/mpf-workbooks/Parts Module (2).xlsx'

test.skip(!process.env.HL2_SHELF_SHOTS, 'screenshots are taken on request')
test.skip(!existsSync(WORKBOOK), 'Northside’s own workbook is not on this computer')
test.use({ actionTimeout: 20_000 })

async function press(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded()
  await target.click()
}

/** Move within the open page, as the app's own links do: a reload would forget the workbook. */
async function go(page: Page, path: string) {
  await page.evaluate((to) => {
    window.history.pushState({}, '', to)
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }))
  }, path)
  await page.waitForTimeout(300)
}

test('every state of the shelf, on Northside’s own workbook, photographed and measured', async ({
  page,
}) => {
  test.setTimeout(900_000)
  await throughTheDoor(page)
  const size = `${page.viewportSize()!.width}x${page.viewportSize()!.height}`
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const faults: string[] = []

  const measure = async (label: string, dock: boolean) => {
    const m = await page.evaluate(() => {
      const main = document.querySelector('main')
      const seen = (el: Element) => {
        if (!main?.contains(el)) return false
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return false
        const cs = getComputedStyle(el)
        return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.clipPath !== 'inset(50%)'
      }
      const leaves = [...(main?.querySelectorAll('*') ?? [])].filter(
        (el) =>
          el instanceof HTMLElement &&
          [...el.childNodes].some((c) => c.nodeType === 3 && (c.textContent ?? '').trim() !== '') &&
          !el.closest('kbd') &&
          seen(el),
      ) as HTMLElement[]
      const small = leaves
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 12)
        .map((el) => (el.textContent ?? '').trim().slice(0, 30))
      const cut = leaves
        .filter((el) => {
          const cs = getComputedStyle(el)
          const clips = cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis'
          return (
            clips && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 2)
          )
        })
        .map((el) => (el.textContent ?? '').trim().slice(0, 30))
      const tiny = [...(main?.querySelectorAll('a, button, select, input[type=search]') ?? [])]
        .filter((el) => seen(el))
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width < 24 || r.height < 24
        })
        .map((el) => (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 30))
      const dockEl = document.querySelector('.sf-dock')
      const d = dockEl?.getBoundingClientRect()
      return {
        sideways: document.documentElement.scrollWidth - window.innerWidth,
        small,
        cut,
        tiny,
        height: document.documentElement.scrollHeight,
        dockOut: d ? d.bottom > window.innerHeight + 1 || d.top < 0 : null,
      }
    })
    const bad = [
      m.sideways > 0 ? `${m.sideways}px sideways` : '',
      m.small.length ? `small: ${m.small.join(' | ')}` : '',
      m.cut.length ? `cut: ${m.cut.join(' | ')}` : '',
      m.tiny.length ? `tiny: ${m.tiny.join(' | ')}` : '',
      dock && m.dockOut !== false ? 'Apply is out of the window' : '',
    ].filter(Boolean)
    console.log(`[${size}] ${label}: page ${m.height}px ${bad.length ? bad.join(' ; ') : 'clean'}`)
    if (bad.length) faults.push(`${label}: ${bad.join(' ; ')}`)
  }
  const shot = async (name: string, dock = false) => {
    await page.waitForTimeout(400)
    await measure(name, dock)
    await page.screenshot({ path: `${OUT}/${name}--${size}.png` })
  }

  /* ---- the rest page, on the true day one ---- */
  await page.goto('/shelf')
  await expect(page.locator('[data-testid="shelf"][data-read]')).toBeVisible({ timeout: 30_000 })
  await shot('01-rest')

  /* ---- the workbook, as it arrives ---- */
  const t0 = Date.now()
  await page.getByTestId('shelf-workbook').setInputFiles(WORKBOOK)
  await expect(
    page.getByText('Parts Module (2).xlsx is read. Nothing is written yet.'),
  ).toBeVisible({
    timeout: 120_000,
  })
  console.log(`[${size}] read and planned in ${Date.now() - t0} ms`)
  await shot('02-read')
  await press(page, page.getByRole('button', { name: 'See every change' }))
  await expect(page.locator('[data-see="changes"]')).toBeVisible()
  await shot('03-changes-top', true)

  /* scrolled into the lines: the toolbar and Apply stay */
  await page.evaluate(() => {
    const top = document.querySelector('.sf-table')!.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + 1400)
  })
  await shot('04-changes-scrolled', true)

  /* ---- supplier IBC: the tube covers, found ---- */
  await go(page, '/shelf?see=changes&who=IBC')
  await expect(page.getByText(/TUBE COVERS/).first()).toBeVisible()
  await shot('05-supplier-ibc', true)

  /* ---- Dealer Fit, its figures named ---- */
  await go(page, '/shelf?see=changes&list=dealer_fit')
  await expect(page.getByRole('heading', { name: /What moves on Dealer Fit/ })).toBeVisible()
  await shot('06-dealer-fit', true)
  await page.evaluate(() => {
    const top = document.querySelector('.sf-table')!.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + 600)
  })
  await shot('07-dealer-fit-lines', true)

  /* ---- the 61 that cannot be placed, settled ---- */
  await go(page, '/shelf?see=changes&way=cannot')
  await expect(page.getByText(/are named by the workbook’s own Code/)).toBeVisible()
  await shot('08-cannot', true)
  await press(page, page.getByRole('button', { name: /^Place the \d+ the Code names$/ }))
  await page.waitForTimeout(300)
  await shot('09-cannot-placed', true)

  /* ---- the doubled or halved, the Dee Shackle left out ---- */
  await go(page, '/shelf?see=changes&twice=1')
  await expect(page.getByText(/looked at/).first()).toBeVisible()
  const shackle = page.locator('.sf-line', { hasText: /Dee Shackle.*Captive Bolt 6/ }).first()
  await press(page, shackle.getByRole('button', { name: 'Leave out' }))
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot('10-doubled-one-out', true)

  /* ---- find ---- */
  await go(page, '/shelf?see=changes&q=GX700')
  await shot('11-find', true)

  /* ---- Apply, and the next safe act ---- */
  await go(page, '/shelf?see=changes')
  const apply = page.getByRole('button', { name: /^Apply [\d,]+ changes$/ })
  const said = await apply.innerText()
  const t1 = Date.now()
  await apply.click()
  await expect(page.getByText(/changes are on the price list\.$/)).toBeVisible({ timeout: 60_000 })
  console.log(`[${size}] ${said.trim()} in ${Date.now() - t1} ms`)
  await shot('12-applied', true)

  /* ---- the rest page after: the account and the date ---- */
  await press(page, page.getByRole('button', { name: 'Back to the shelf' }).first())
  await expect(page.locator('[data-testid="shelf"][data-read]')).toBeVisible()
  await shot('13-rest-after')

  /* ---- a reload forgets the workbook and says so; the account stays ---- */
  await page.goto('/shelf?see=changes')
  await expect(page.getByText(/a workbook read before that is not kept/)).toBeVisible({
    timeout: 30_000,
  })
  await shot('14-rest-reloaded')

  /* ---- the paste, with the workbook's own heading ---- */
  await go(page, '/shelf?see=paste')
  await page.getByRole('combobox', { name: 'The list they belong on' }).click()
  await page.getByRole('option', { name: /^Parts & Accessories/ }).click()
  await page
    .getByRole('textbox', { name: 'The lines, pasted from Excel' })
    .fill(
      'Parts & Accessories Module\tSupplier\tCode\tSell\nTube Covers to suit PVC Boat - 2.0 Mtr\tIBC\tIBC-TCPVC - 2.0 Mtr\t1300',
    )
  await expect(page.getByText(/read as the name/)).toBeVisible()
  await shot('15-paste')

  /* ---- clearing, its page ---- */
  await go(page, '/shelf?see=clear')
  await shot('16-clear')

  expect(errors, 'page errors').toEqual([])
  if (faults.length) console.log(`[${size}] FAULTS\n${faults.join('\n')}`)
})
