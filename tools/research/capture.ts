/**
 * Capture reference frames for a screen's research sweep.
 *
 *   npx tsx tools/research/capture.ts <screen> <list.json> [--width 1440 --height 900]
 *
 * `list.json` is an array of sources:
 *   { id, url, note?, wait?: ms, fullPage?: boolean,
 *     steps?: ({ click: selector } | { text: string } | { scroll: px } | { wait: ms } | { key: string })[] }
 *
 * Frames land in `docs/research/refs/<screen>/<id>.png` (gitignored; the durable copy is
 * mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\<screen>\`) and every capture is appended to
 * `docs/research/refs/<screen>/sources.json` with the date, the final URL and the page
 * title, so a board can cite what it drew from. Consent banners are answered with the most
 * privacy-preserving button present (reject / decline / necessary only), else closed.
 */
import { chromium, type Page } from '@playwright/test'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

interface Step {
  click?: string
  text?: string
  scroll?: number
  wait?: number
  key?: string
}
interface Source {
  id: string
  url: string
  note?: string
  wait?: number
  fullPage?: boolean
  steps?: Step[]
}
interface Captured extends Source {
  capturedAt: string
  finalUrl: string
  title: string
  file: string
  error?: string
}

const [screen, listPath, ...rest] = process.argv.slice(2)
if (!screen || !listPath) {
  console.error('usage: capture.ts <screen> <list.json> [--width N --height N]')
  process.exit(2)
}
const arg = (name: string, fallback: number) => {
  const i = rest.indexOf(`--${name}`)
  return i >= 0 ? Number(rest[i + 1]) : fallback
}
const width = arg('width', 1440)
const height = arg('height', 900)

const outDir = join('docs', 'research', 'refs', screen)
const mirror = join('C:\\Users\\Asaf\\dev\\hl-refs\\hl2', screen)
await mkdir(outDir, { recursive: true })
await mkdir(mirror, { recursive: true })

const sources = JSON.parse(await readFile(listPath, 'utf8')) as Source[]
const ledgerPath = join(outDir, 'sources.json')
const ledger: Captured[] = existsSync(ledgerPath)
  ? (JSON.parse(await readFile(ledgerPath, 'utf8')) as Captured[])
  : []

const CONSENT = [
  /reject all/i,
  /decline/i,
  /only necessary/i,
  /necessary only/i,
  /essential only/i,
  /refuse/i,
  /deny/i,
  /reject/i,
  /close/i,
]

async function answerConsent(page: Page) {
  for (const pattern of CONSENT) {
    const button = page.getByRole('button', { name: pattern }).first()
    try {
      if (await button.isVisible({ timeout: 300 })) {
        await button.click({ timeout: 1000 })
        await page.waitForTimeout(400)
        return
      }
    } catch {
      /* not there; try the next wording */
    }
  }
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  locale: 'en-AU',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
})

for (const s of sources) {
  const page = await context.newPage()
  const file = `${s.id}.png`
  const entry: Captured = {
    ...s,
    capturedAt: new Date().toISOString().slice(0, 10),
    finalUrl: s.url,
    title: '',
    file,
  }
  try {
    await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
    await answerConsent(page)
    for (const step of s.steps ?? []) {
      if (step.click) await page.locator(step.click).first().click({ timeout: 8_000 })
      if (step.text)
        await page.getByText(step.text, { exact: false }).first().click({ timeout: 8_000 })
      if (step.scroll) await page.mouse.wheel(0, step.scroll)
      if (step.key) await page.keyboard.press(step.key)
      if (step.wait) await page.waitForTimeout(step.wait)
      await page.waitForTimeout(300)
    }
    await page.waitForTimeout(s.wait ?? 1500)
    entry.finalUrl = page.url()
    entry.title = await page.title()
    await page.screenshot({ path: join(outDir, file), fullPage: s.fullPage ?? false })
    await copyFile(join(outDir, file), join(mirror, file))
    console.log(`ok   ${s.id}  ${entry.title || entry.finalUrl}`)
  } catch (e) {
    entry.error = e instanceof Error ? e.message.split('\n')[0] : String(e)
    console.log(`FAIL ${s.id}  ${entry.error}`)
  } finally {
    await page.close()
  }
  const i = ledger.findIndex((x) => x.id === s.id)
  if (i >= 0) ledger[i] = entry
  else ledger.push(entry)
}

await browser.close()
await writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + '\n')
console.log(`${ledger.length} sources in ${ledgerPath}`)
