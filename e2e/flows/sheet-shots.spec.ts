import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE SHEET'S STATES, PHOTOGRAPHED AT EVERY SIZE — the harness the data
   round reads its screenshots from (docs/directions/data-round/sheet/).

   NOT A TEST AND NOT A BASELINE. It asserts only that each state stood
   up before it was photographed, writes into the round's own folder,
   and runs only when asked (`SHEET_SHOTS=1`), so the gate never writes
   into docs/. Every state is reached through the real door with the
   real Master Price File; the values it types (2850 and 850 into a
   Cash cell, 4, −6000 and 2500 into a move) are a person at a keyboard,
   taken back with Undo or Escape before the next state.

   AND IT MEASURES WHAT EACH FRAME CUTS: every run of text in view that
   its box elides or clips, with the width it was drawn at, written
   beside the frames as `cuts-<size>.json` — the reading the verifier's
   own pass made, so a fix is checked against a figure.
   ============================================================ */

const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'docs',
  'directions',
  'data-round',
  'sheet',
  process.env.SHEET_SHOTS_DIR ?? 'after',
)

test.skip(!process.env.SHEET_SHOTS, 'photographs the sheet only when SHEET_SHOTS=1')

interface Cut {
  text: string
  w: number
  by: number
  cls: string
}

/** Every run of text in view whose own box elides or clips it, and by how much. */
async function cutsInView(page: Page): Promise<Cut[]> {
  return page.evaluate(() => {
    const out: { text: string; w: number; by: number; cls: string }[] = []
    const vw = window.innerWidth
    const vh = window.innerHeight
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => (n as Text).data)
        .join('')
        .trim()
      const text = own || (el.children.length === 0 ? (el.textContent ?? '').trim() : '')
      if (!text) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      if (el.closest('.sh-vh, .ui-vh, [aria-hidden="true"]')) continue
      const r = el.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) continue
      if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue
      const across = el.scrollWidth - el.clientWidth
      const down = el.scrollHeight - el.clientHeight
      const clipX = cs.overflowX !== 'visible'
      const clipY = cs.overflowY !== 'visible'
      /* a glyph's descender past a line box of 1 is not a cut: down counts from 4px */
      if ((across > 1 && clipX) || (down > 4 && clipY))
        out.push({
          text: text.slice(0, 60),
          w: Math.round(r.width),
          by: Math.round(Math.max(across, down)),
          cls: (el.getAttribute('class') ?? '').slice(0, 40),
        })
    }
    return out
  })
}

async function open(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({ timeout: 30_000 })
  await page.waitForTimeout(600)
}

async function firstLine(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const res = await fetch('/data/northside/tables/boat_highfield.json')
    const rows = (await res.json()) as { id: string }[]
    return rows[0]!.id
  })
}

test('sheet — every state at this size', async ({ page }, info) => {
  test.setTimeout(600_000)
  /* a state that does not stand up says so in seconds, not at the end of the run */
  page.setDefaultTimeout(20_000)
  const size = info.project.name
  const measured: Record<string, Cut[]> = {}
  mkdirSync(OUT, { recursive: true })
  const shot = async (name: string): Promise<void> => {
    await page.waitForTimeout(350)
    await page.screenshot({ path: path.join(OUT, `${name}-${size}.png`) })
    measured[name] = await cutsInView(page)
    writeFileSync(path.join(OUT, `cuts-${size}.json`), JSON.stringify(measured, null, 1))
  }
  const w = page.viewportSize()?.width ?? 0
  const desk = w >= 640

  await throughTheDoor(page)

  await open(page, '/data/boat_highfield')
  await shot('01-rest')

  await open(page, '/data/boat_highfield?find=Sport%20560')
  await shot('02-find')

  await open(page, '/data/boat_highfield?find=zzqx')
  await shot('03-find-nothing')

  await open(page, '/data/boat_highfield?find=F4SMHA')
  await shot('03b-find-elsewhere')

  if (desk) {
    await open(page, '/data/boat_highfield')
    const grid = page.getByTestId('sheet-grid')
    await grid.focus()
    const heads = await page.getByRole('columnheader').allInnerTexts()
    const cashAt = heads.findIndex((h) => h.trim().toLowerCase().startsWith('cash')) - 1
    for (let i = 0; i < cashAt; i += 1) await page.keyboard.press('ArrowRight')
    await page.keyboard.type('28')
    await shot('04-typing')
    await page.keyboard.type('50')
    await page.keyboard.press('Enter')
    await shot('05-written')
    await page.getByTestId('last-step').getByRole('button', { name: 'Undo' }).click()
    await grid.focus()
    await page.keyboard.press('ArrowUp')
    await page.keyboard.type('850')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('step-warning')).toBeVisible()
    await shot('06-warned')
    await page.getByTestId('last-step').getByRole('button', { name: 'Undo' }).click()
    await grid.focus()
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await page.keyboard.type('12abc')
    await page.keyboard.press('Enter')
    await shot('07-refused')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Shift+ArrowDown')
    await page.keyboard.press('Shift+ArrowDown')
    await page.keyboard.press('Shift+ArrowDown')
    const plate = page.getByTestId('sheet-selection')
    await expect(plate).toBeVisible()
    await plate.getByRole('textbox', { name: 'Cash, By %' }).fill('4')
    await shot('08-selection-move')
    /* a move that would take a line below $0 is refused before the press, in the plate */
    await plate.getByRole('button', { name: 'By $', exact: true }).click()
    await plate.getByRole('textbox', { name: 'Cash, By $' }).fill('-6000')
    await shot('36-move-refused')
    /* Hypalon at its PVC twin's figure and $x more, where the selection holds both */
    const twin = plate.getByRole('button', { name: 'PVC + $', exact: true })
    if ((await twin.count()) > 0) {
      await twin.click()
      await plate.getByRole('textbox', { name: 'Cash, PVC + $' }).fill('2500')
      await shot('39-twin-plan')
    }
    await page.keyboard.press('Escape')

    /* the lit rung is Trade: the spines say so in words, not only in a tooltip */
    await open(page, '/data/boat_highfield')
    const trade = page.getByRole('button', {
      name: "Read every model's head at Trade",
      exact: true,
    })
    if ((await trade.count()) > 0) {
      await trade.click()
      await expect(page).toHaveURL(/rung=/)
      await shot('35-read-at-trade')
    }

    /* a changed cell's record says what the file had, who changed it and when */
    await open(page, '/data/boat_highfield')
    await grid.focus()
    for (let i = 0; i < cashAt; i += 1) await page.keyboard.press('ArrowRight')
    await page.keyboard.type('2850')
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Space')
    const record = page.getByTestId('sheet-record')
    await expect(record).toBeVisible()
    await shot('38-changed-record')
    await page.getByTestId('last-step').getByRole('button', { name: 'Undo' }).click()
    await expect(page.getByTestId('last-step')).toContainText('Undone. No longer so:')
    /* taken back, said as no longer so (the section critic, 2026-11-04) */
    await shot('45-undone')

    /* a variant added from the record: its heading and its picture's offer said whole */
    await record.getByRole('button', { name: /^Add a variant to / }).click()
    await expect(page.getByTestId('sheet-record')).toBeVisible()
    await shot('32-added')
    await page.getByTestId('last-step').getByRole('button', { name: 'Undo' }).click()
    await expect(page.getByTestId('last-step')).toContainText('Undone')
    /* the store writes behind; the next page load reads it back */
    await page.waitForTimeout(1500)

    /* the colour key: the codes the list carries, and the ones nobody has named yet */
    await open(page, '/data/boat_highfield?find=Sport%20560')
    const key = page.getByRole('button', { name: /^The colour key/ })
    if ((await key.count()) > 0) {
      await key.click()
      await shot('44-colour-key')
      await page.keyboard.press('Escape')
    }
  } else {
    /* in a hand: a figure under its cost, written in the record, warned with its Undo */
    await open(page, `/data/boat_highfield?at=${encodeURIComponent(await firstLine(page))}`)
    const over = page.getByTestId('sheet-over')
    await expect(over).toBeVisible()
    await over.getByRole('button', { name: /^Cash: .*Press to change it\.$/ }).click()
    await over.getByRole('textbox', { name: 'Cash, editing' }).fill('850')
    await page.keyboard.press('Enter')
    await expect(over.getByTestId('step-warning')).toBeVisible()
    await shot('40-hand-warned')
    await over.getByTestId('last-step').getByRole('button', { name: 'Undo' }).click()
    await expect(over.getByTestId('last-step')).toContainText('Undone. No longer so:')
    await shot('45-undone')
  }

  /* a record whose line carries its pictures: the gallery beside the facts from 640px, never
     alone under them with the row's right half empty (the section critic, 2026-11-04) */
  await open(page, `/data/boat_formosa?at=${encodeURIComponent('boat_formosa:1')}`)
  await expect(page.getByTestId('sheet-record')).toBeVisible()
  await page.getByTestId('sheet-record').locator('.ui-addpic').scrollIntoViewIfNeeded()
  await shot('46-record-pictured')

  await open(page, `/data/boat_highfield?at=${encodeURIComponent(await firstLine(page))}`)
  await expect(page.getByTestId('sheet-record')).toBeVisible()
  await shot('09-record')

  await open(page, '/data/boat_highfield?read=models')
  await shot('10-models')

  await open(page, '/data/boat_highfield?door=pictures')
  await shot('11-pictures')

  await open(page, '/data/boat_highfield?door=every')
  await shot('12-every')

  await open(page, '/data/boat_highfield')
  await page.getByTestId('sheet-ask').click()
  await expect(page.getByTestId('sheet-asks')).toBeVisible()
  await shot('13-ask')
  await page.keyboard.press('Escape')

  const ids = await page.evaluate(async () => {
    const res = await fetch('/data/northside/entities.json')
    const all = (await res.json()) as { id: string; fields: { id: string; name: string }[] }[]
    const hf = all.find((t) => t.id === 'boat_highfield')!
    const by = (n: string) => hf.fields.find((f) => f.name === n)!.id
    return { cash: by('Cash'), landed: by('Landed Hull Cost'), maxHp: by('Max HP') }
  })
  await open(page, `/data/boat_highfield?only=${encodeURIComponent(`at-least~${ids.maxHp}~150`)}`)
  await shot('14-only')

  await open(
    page,
    `/data/boat_highfield?only=${encodeURIComponent(`under~${ids.cash}~${ids.landed}`)}`,
  )
  await shot('15-only-nothing')

  for (const [name, id] of [
    ['20-parts', 'parts'],
    ['21-dealerfit', 'dealer_fit'],
    ['22-join', 'join_hf_yam'],
    ['23-yamaha', 'mot_yamaha'],
    ['24-dunbier', 'trl_dunbier'],
    ['26-labour', 'labour_rates'],
    ['27-registration', 'registration'],
    ['28-rigkits', 'rig_kits'],
  ] as const) {
    await open(page, `/data/${id}`)
    await shot(name)
  }
})
