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
   real Master Price File; the two values it types (2850 and 850 into a
   Cash cell, 4 into a rise) are a person at a keyboard, taken back
   with Undo before the next state.
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

async function open(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({ timeout: 30_000 })
  await page.waitForTimeout(600)
}

test('sheet — every state at this size', async ({ page }, info) => {
  test.setTimeout(600_000)
  const size = info.project.name
  const shot = async (name: string): Promise<void> => {
    await page.waitForTimeout(350)
    await page.screenshot({ path: path.join(OUT, `${name}-${size}.png`) })
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
    await page.keyboard.press('Escape')
  }

  const first = await page.evaluate(async () => {
    const res = await fetch('/data/northside/tables/boat_highfield.json')
    const rows = (await res.json()) as { id: string }[]
    return rows[0]!.id
  })
  await open(page, `/data/boat_highfield?at=${encodeURIComponent(first)}`)
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
