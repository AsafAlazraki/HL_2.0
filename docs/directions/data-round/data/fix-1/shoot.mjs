/* DATA, ROUND 1'S FIXES, SHOT AND MEASURED at the six sizes, through the real door with the real
   Master Price File. It starts its own Vite server on PORT (default 6237) and stops it when done:
     node docs/directions/data-round/data/fix-1/shoot.mjs
   SIZES=<390x844,...> and ONLY=<state prefixes, comma> narrow a run. Every figure printed is
   measured on the page; nothing is typed but the walk's own presses. */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'

const OUT = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 6237)
const ALL = ['390x844', '844x390', '834x1112', '1280x800', '1440x900', '1920x1080']
const SIZES = (process.env.SIZES ?? ALL.join(',')).split(',')
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = (id) => !ONLY || ONLY.some((o) => id.startsWith(o))

const server = await createServer({
  server: { port: PORT, strictPort: true, hmr: false },
  logLevel: 'error',
})
await server.listen()
const BASE = `http://localhost:${PORT}`

const measure = () => {
  const doc = document.documentElement
  const cuts = []
  for (const el of document.querySelectorAll('main *')) {
    if (!(el instanceof HTMLElement) || el.children.length > 0) continue
    if (!el.textContent || el.textContent.trim() === '') continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none') continue
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && cs.textOverflow !== 'ellipsis')
      cuts.push(`${el.className}: ${el.textContent.trim().slice(0, 40)}`)
  }
  const pill = document.querySelector('[data-testid="shell-pill"]')?.getBoundingClientRect()
  const spread = document.querySelector('[data-testid="data-page"]')?.getBoundingClientRect()
  return {
    sideways: doc.scrollWidth - doc.clientWidth,
    cuts: cuts.slice(0, 6),
    pill: pill ? `${Math.round(pill.top)}-${Math.round(pill.bottom)}` : null,
    spread: spread ? `${Math.round(spread.top)}-${Math.round(spread.bottom)}` : null,
    page: doc.scrollHeight,
    scrollY: Math.round(scrollY),
    url: location.pathname + location.search,
    active: document.activeElement
      ? `${document.activeElement.tagName}.${(document.activeElement.className || '').toString().slice(0, 30)} "${(document.activeElement.textContent || '').trim().slice(0, 40)}"`
      : null,
  }
}

const say = (size, id, m, extra = '') =>
  console.log(
    `${size} ${id}: sideways ${m.sideways}, cut ${m.cuts.length}${m.cuts.length ? ' ' + JSON.stringify(m.cuts) : ''}, pill ${m.pill}, spread ${m.spread}, page ${m.page}, y ${m.scrollY}, url ${m.url}, focus ${m.active}${extra}`,
  )

const browser = await chromium.launch()
try {
  for (const size of SIZES) {
    const [w, h] = size.split('x').map(Number)
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      locale: 'en-AU',
      timezoneId: 'Australia/Brisbane',
      hasTouch: w < 900,
      isMobile: w < 900,
    })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    const shot = (id, full = false) =>
      page.screenshot({ path: path.join(OUT, `${size}-${id}.png`), fullPage: full, animations: 'disabled' })
    const onData = async (url = '/data') => {
      await page.goto(`${BASE}${url}`, { timeout: 120_000, waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="data"][data-read][data-rested]', { timeout: 60_000 })
      if (!url.includes('find=')) await page.waitForSelector('[data-need="review"]:not([data-counting])', { timeout: 60_000 })
      await page.waitForTimeout(500)
    }
    await page.goto(`${BASE}/sign-in`, { timeout: 180_000, waitUntil: 'domcontentloaded' })
    await page.getByRole('textbox').fill('Asaf')
    await page.getByRole('button', { name: /Load the Master Price File/ }).click()
    await page.waitForURL(/\/$/, { timeout: 90_000 })

    if (want('01')) {
      await onData()
      const head = await page.evaluate(() => {
        const lines = (sel) => {
          const el = document.querySelector(sel)
          if (!el) return null
          return [...el.querySelectorAll('.dt-clause')].map((c) => {
            const r = c.getBoundingClientRect()
            return `${Math.round(r.top)}:${c.textContent.trim().slice(0, 30)}`
          })
        }
        const years = [...document.querySelectorAll('.dt-years li')].map((li) => Math.round(li.getBoundingClientRect().top))
        const marks = [...document.querySelectorAll('.dt-maker .dt-mark__img')].map((i) => {
          const r = i.getBoundingClientRect()
          return `${i.closest('button').getAttribute('aria-label').split(' ·')[0].split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}`
        })
        const tiles = document.querySelector('.dt-makers').getBoundingClientRect()
        const firstRow = document.querySelector('.dt-row')?.getBoundingClientRect().top + scrollY
        return { stamp: lines('.dt-stamp'), dates: lines('.dt-dates'), years, marks, tiles: `${Math.round(tiles.top + scrollY)}+${Math.round(tiles.height)}`, firstRow: Math.round(firstRow) }
      })
      say(size, '01-arrive', await page.evaluate(measure), ` ${JSON.stringify(head)}`)
      await shot('01-arrive')
      await shot('02-full', true)
    }

    if (want('03')) {
      await onData()
      await page.evaluate(() => {
        const h = document.querySelector('.dt-holds')
        scrollTo(0, h.getBoundingClientRect().top + scrollY)
      })
      await page.waitForTimeout(300)
      const strip = await page.evaluate(() => {
        const m = document.querySelector('.dt-makers').getBoundingClientRect()
        return `makers ${Math.round(m.width)}x${Math.round(m.height)}, scrolls ${document.querySelector('.dt-makers').scrollWidth}`
      })
      say(size, '03-makers', await page.evaluate(measure), ` ${strip}`)
      await shot('03-makers')
    }

    if (want('04')) {
      await onData()
      await page.getByRole('button', { name: /^Highfield Inflatables · / }).click()
      await page.waitForTimeout(800)
      const floor = await page.evaluate(() => {
        const main = document.querySelector('main').getBoundingClientRect()
        return `main ends ${Math.round(main.bottom)} of ${innerHeight}`
      })
      say(size, '04-highfield', await page.evaluate(measure), ` ${floor}`)
      await shot('04-highfield')
    }

    if (want('12')) {
      await onData()
      await page.getByRole('button', { name: 'New list' }).click()
      await page.getByRole('dialog').getByRole('button', { name: 'Make it' }).click()
      await page.waitForTimeout(400)
      const acts = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]').getBoundingClientRect()
        const b = [...document.querySelectorAll('[role="dialog"] .ui-dialog-actions button')].map((x) => {
          const r = x.getBoundingClientRect()
          return `${x.textContent.trim()} ${Math.round(r.top)}-${Math.round(r.bottom)}`
        })
        return `dialog ${Math.round(d.top)}-${Math.round(d.bottom)} acts ${b.join(', ')}`
      })
      say(size, '12-empty-name', await page.evaluate(measure), ` ${acts}`)
      await shot('12-empty-name')
    }

    if (want('19')) {
      await onData('/data?at=parts')
      await shot('19-parts')
      const more = page.getByRole('button', { name: /^The other \d+/ })
      await more.focus()
      await page.keyboard.press('Enter')
      await page.waitForTimeout(600)
      const bars = async () => page.locator('.dt-bar').count()
      say(size, '19-parts-expanded', await page.evaluate(measure), ` bars ${await bars()}`)
      await shot('19-parts-expanded')
      await page.mouse.wheel(0, 1500)
      await page.waitForTimeout(400)
      await shot('19-parts-expanded-scrolled')
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="data-page"]', { timeout: 60_000 })
      await page.waitForTimeout(800)
      say(size, '19-parts-reloaded', await page.evaluate(measure), ` bars ${await bars()}`)
      const fold = page.getByRole('button', { name: /^Fold back/ })
      await fold.focus()
      await page.keyboard.press('Enter')
      await page.waitForTimeout(600)
      say(size, '19-parts-folded', await page.evaluate(measure), ` bars ${await bars()}`)
      await shot('19-parts-folded')
    }

    if (want('21')) {
      await onData()
      await page.getByTestId('data-needs').getByRole('button', { name: /Oldest first/ }).click()
      await page.waitForURL(/\/data\/rig_kits/, { timeout: 30_000 })
      await page.waitForTimeout(2500)
      const seen = await page.evaluate(() => {
        const t = 'RIGGING KITS - Jeanneau DB/43 OB (as at 19/5/2022)'
        const hits = [...document.querySelectorAll('main *')].filter(
          (e) => e.children.length === 0 && (e.textContent || '').includes('Jeanneau DB/43 OB'),
        )
        const r = hits[0]?.getBoundingClientRect()
        return `heading in DOM ${hits.length}, at y ${r ? Math.round(r.top) : '-'}; "${t}"`
      })
      say(size, '21-oldest-on-sheet', await page.evaluate(measure), ` ${seen}`)
      await shot('21-oldest-on-sheet')
    }

    if (want('26')) {
      await onData()
      const matrix = page.locator('.dt-matrix')
      await matrix.scrollIntoViewIfNeeded()
      await page.evaluate(() => {
        const m = document.querySelector('.dt-matrix')
        scrollTo(0, m.getBoundingClientRect().top + scrollY - 80)
      })
      await page.waitForTimeout(400)
      const fit = await page.evaluate(() => {
        const card = document.querySelector('.dt-matrix').getBoundingClientRect()
        const table = document.querySelector('.dt-matrix__table').getBoundingClientRect()
        const n = document.querySelector('td.dt-matrix__n')
        const marks = [...document.querySelectorAll('.dt-matrix .dt-mark__img')].map((i) => {
          const r = i.getBoundingClientRect()
          return `${i.alt.split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}`
        })
        return `card ${Math.round(card.left)}-${Math.round(card.right)}, table ${Math.round(table.left)}-${Math.round(table.right)}, lines rule ${n ? getComputedStyle(n).borderTopWidth : '-'}, marks ${marks.join(' | ')}`
      })
      say(size, '26-matrix', await page.evaluate(measure), ` ${fit}`)
      await shot('26-matrix')
    }

    if (want('08')) {
      await onData('/data?find=F115')
      await page.waitForSelector('[data-testid="data-answer"]')
      say(size, '08-find-f115', await page.evaluate(measure))
      await shot('08-find-f115')
      await shot('08-find-f115-full', true)
    }

    if (want('30') && w >= 1100) {
      await page.goto(`${BASE}/data/labour_rates`, { waitUntil: 'domcontentloaded' })
      const grid = page.getByRole('grid').first()
      await grid.waitFor({ timeout: 60_000 })
      await page.waitForTimeout(800)
      await grid.focus()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.type('123')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(600)
      await onData()
      const dates = await page.evaluate(() =>
        [...document.querySelectorAll('.dt-dates .dt-clause')].map((c) => `${Math.round(c.getBoundingClientRect().top)}:${c.textContent.trim()}`),
      )
      say(size, '30-new-since-changed', await page.evaluate(measure), ` ${JSON.stringify(dates)}`)
      await shot('30-new-since-changed')
      const door = page.getByTestId('data-new').locator('.dt-fresh__list').first()
      await door.click()
      await page.waitForURL(/\/data\/labour_rates/)
      await page.waitForTimeout(1200)
      say(size, '31-changed-door', await page.evaluate(measure))
      await shot('31-changed-door')
    }

    if (errors.length) console.log(`${size} page errors: ${errors.join(' | ')}`)
    await ctx.close()
  }
} finally {
  await browser.close()
  await server.close()
}
