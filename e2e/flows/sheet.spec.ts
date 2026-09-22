import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'

/* ============================================================
   THE SHEET, IN A REAL BROWSER, AT EVERY SIZE THE RULERS RUN.

   NOTHING HERE IS TYPED INTO AN ASSERTION. Every figure is walked out
   of `data/northside/` — the same files the browser fetches — and then
   looked for on the screen: how many variants Highfield carries, how
   many series they file under, how many models a gallery draws, which
   columns the packer marked as cost, which hull the first pairing
   names. The one thing the walk types is a value into a cell, which is
   a person at a keyboard played by a test; it is put back with Undo
   before the case ends, and the value it wrote is asserted gone.

   WHAT THE RULERS CANNOT SEE is what this file measures: that the
   record opens on the row under the cursor and says its name, that a
   refused value is a pill under the cell and never a toast, that a
   write says its sentence with Undo pinned to it and Undo puts the
   sheet back, that the gallery's unit is the model, that a pairing is
   filed under its boats, and that a hand gets two columns and a
   sentence rather than a sideways scroll.
   ============================================================ */

const DATA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'data',
  'northside',
)
const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(DATA, file), 'utf8')) as T

interface Manifest {
  tables: { id: string; file: string; rowCount: number; costColumns?: string[] }[]
}
interface Table {
  id: string
  name: string
  hierarchy?: string[]
  displayFieldId?: string
  fields: { id: string; name: string; type: string }[]
}
interface Row {
  id: string
  values: Record<string, unknown>
}

const manifest = readJson<Manifest>('manifest.json')
const tables = readJson<Table[]>('entities.json')
const rowsOf = (id: string): Row[] =>
  readJson<Row[]>(manifest.tables.find((t) => t.id === id)?.file ?? '')
const tableOf = (id: string): Table => {
  const t = tables.find((x) => x.id === id)
  if (!t) throw new Error(`no table ${id} on the pack`)
  return t
}

const HIGHFIELD = 'boat_highfield'
const hf = tableOf(HIGHFIELD)
const hfRows = rowsOf(HIGHFIELD)
const hfLevels = hf.hierarchy ?? []
const seriesId = hfLevels[0]!
const modelId = hfLevels[1]!
const series = new Set(hfRows.map((r) => String(r.values[seriesId] ?? '')))
const models = new Set(
  hfRows.map((r) => `${String(r.values[seriesId] ?? '')}|${String(r.values[modelId] ?? '')}`),
)
const firstName = String(hfRows[0]!.values[hf.displayFieldId ?? ''] ?? '')
const costIds = new Set(manifest.tables.find((t) => t.id === HIGHFIELD)?.costColumns ?? [])
const costHeads = hf.fields.filter((f) => costIds.has(f.id))

async function openSheet(page: Page, tableId: string, search = ''): Promise<void> {
  await throughTheDoor(page)
  await page.goto(`/data/${tableId}${search}`)
  await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({ timeout: 30_000 })
}

test.describe('the sheet', () => {
  test.beforeEach(() => {
    /* the door reads 53 tables and 15,691 rows before the sheet can
       draw one of them, on top of Playwright's default budget */
    test.setTimeout(120_000)
  })

  test('sheet — counts the file, pins the name, and marks the cost columns in words', async ({
    page,
    viewport,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await openSheet(page, HIGHFIELD)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(hf.name)
    const count = page.locator('.sh-count')
    await expect(count).toContainText(`${hfRows.length} variants`)
    await expect(count).toContainText(`in ${series.size} series`)
    await expect(count).toContainText(`${hf.fields.length} columns`)
    await expect(count).toContainText(`${costHeads.length} of them cost`)

    const grid = page.getByRole('grid', { name: hf.name })
    await expect(grid).toBeVisible()
    /* the addressable rows are every variant; the lines the reader is
       told about are those plus one head per series and per model */
    await expect(grid).toHaveAttribute('data-rows', String(hfRows.length))
    await expect(grid).toHaveAttribute(
      'aria-rowcount',
      String(hfRows.length + series.size + models.size),
    )

    /* the name column is pinned, and it is the display column */
    const pinHead = page.locator('.sh-th[data-pin]')
    await expect(pinHead).toHaveCount(1)
    const pinName = hf.fields.find((f) => f.id === hf.displayFieldId)?.name ?? ''
    await expect(pinHead).toContainText(pinName)

    /* every column the packer marked as cost says the word at its head,
       and no other column does. The columns are windowed — only the
       ones in view are in the DOM — so the grid is walked sideways and
       every head that carries the word is collected on the way. */
    if ((viewport?.width ?? 0) >= 640) {
      const seen = await page.evaluate(async () => {
        const scroller = document.querySelector<HTMLElement>('.sh-grid')!
        const found = new Set<string>()
        const step = Math.max(1, Math.floor(scroller.clientWidth / 2))
        for (let x = 0; x <= scroller.scrollWidth; x += step) {
          scroller.scrollLeft = x
          await new Promise((done) => setTimeout(done, 120))
          for (const head of document.querySelectorAll<HTMLElement>('.sh-th')) {
            const name = head.querySelector('.sh-th__name')?.textContent ?? ''
            if (head.querySelector('.sh-th__cost')) found.add(name)
          }
        }
        scroller.scrollLeft = 0
        return [...found].toSorted()
      })
      expect(seen).toEqual(costHeads.map((f) => f.name).toSorted())
    } else {
      /* a hand draws the name and one fact; the cost columns are in the
         record, where their section says the word */
      await page.locator('.sh-row').first().locator('.sh-cell__read').first().click()
      await page.getByRole('grid', { name: hf.name }).focus()
      await page.keyboard.press('Space')
      const record = page.getByTestId('sheet-record')
      await expect(record.locator('.sh-fact__cost')).toHaveCount(costHeads.length)
      await page.keyboard.press('Escape')
    }

    /* no sideways scroll on the PAGE at any width — the grid scrolls inside itself */
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(over, 'the page itself never scrolls sideways').toBeLessThanOrEqual(0)

    expect(errors, 'no page error').toEqual([])
  })

  test('sheet — Space opens the record on the row under the cursor, and Esc closes it', async ({
    page,
  }) => {
    await openSheet(page, HIGHFIELD)
    const grid = page.getByRole('grid', { name: hf.name })
    await grid.focus()
    await page.keyboard.press('Space')

    const record = page.getByTestId('sheet-record')
    await expect(record).toBeVisible()
    await expect(record.getByRole('heading', { level: 2 })).toHaveText(firstName)
    /* the row stays lit under the record */
    await expect(page.locator('.sh-row[data-peeking]')).toHaveCount(1)
    /* the record is the table's own sections, every value a button */
    await expect(record.getByRole('button', { name: /^Series: / })).toBeVisible()
    await expect(record.getByRole('button', { name: /^Model: / })).toBeVisible()

    /* the address carries the open row */
    await expect(page).toHaveURL(new RegExp(`at=${encodeURIComponent(hfRows[0]!.id)}`))

    /* J moves the cursor and the record follows, arrows live inside the peek */
    await page.keyboard.press('j')
    const secondName = String(hfRows[1]!.values[hf.displayFieldId ?? ''] ?? '')
    await expect(record.getByRole('heading', { level: 2 })).toHaveText(secondName)

    await page.keyboard.press('Escape')
    await expect(record).toBeHidden()
  })

  test('sheet — a value that does not fit its column is a pill under the cell, never a toast', async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) < 640, 'a hand draws the name and one fact, no number column')
    await openSheet(page, HIGHFIELD)
    const grid = page.getByRole('grid', { name: hf.name })
    await grid.focus()
    /* walk right to the first number column of the addressable set */
    const number = hf.fields.find((f) => f.type === 'number')!
    const head = page.locator('.sh-th', { hasText: number.name }).first()
    await expect(head).toBeVisible()
    const col = Number(await head.getAttribute('aria-colindex')) - 1
    for (let i = 0; i < col; i += 1) await page.keyboard.press('ArrowRight')

    await page.keyboard.press('Enter')
    const editor = page.getByRole('textbox', { name: `${number.name}, editing` })
    await expect(editor).toBeVisible()
    await editor.fill('12abc')
    await page.keyboard.press('Enter')

    const pill = page.locator('.sh-pill')
    await expect(pill).toHaveText('"12abc" is not a number')
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0)
    /* nothing was written: no step line, no way back offered */
    await expect(page.getByTestId('last-step')).toHaveCount(0)
  })

  test('sheet — an edit writes through the store, says its sentence with Undo pinned, and Undo puts it back', async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) < 640, 'a hand draws the name and one fact, no number column')
    await openSheet(page, HIGHFIELD)
    const grid = page.getByRole('grid', { name: hf.name })
    await grid.focus()
    const number = hf.fields.find((f) => f.type === 'number')!
    const head = page.locator('.sh-th', { hasText: number.name }).first()
    const col = Number(await head.getAttribute('aria-colindex')) - 1
    for (let i = 0; i < col; i += 1) await page.keyboard.press('ArrowRight')

    const cellId = `sh-cell-${hfRows[0]!.id}-${col}`
    const cell = page.locator(`[id="${cellId}"]`)
    const before = (await cell.innerText()).trim()
    const was = hfRows[0]!.values[number.id]
    const typed = typeof was === 'number' ? String(was + 1) : '1'

    await page.keyboard.press('Enter')
    await page.getByRole('textbox', { name: `${number.name}, editing` }).fill(typed)
    await page.keyboard.press('Enter')

    const step = page.getByTestId('last-step')
    await expect(step).toContainText(`Cell edit · ${hf.name}`)
    await expect(cell).not.toHaveText(before)

    await step.getByRole('button', { name: 'Undo' }).click()
    await expect(step).toContainText('Undone')
    await expect(cell).toHaveText(before)
    await expect(step.getByRole('button', { name: 'Put it back' })).toBeVisible()
  })

  test('sheet — the gallery draws one card per model under its series, and opens to its rows', async ({
    page,
  }) => {
    await openSheet(page, HIGHFIELD, '?door=gallery')
    const gallery = page.getByTestId('sheet-gallery')
    await expect(gallery).toBeVisible()
    await expect(gallery.locator('.sh-card')).toHaveCount(models.size)
    await expect(gallery.locator('.sh-shelf')).toHaveCount(series.size)

    const first = gallery.locator('.sh-card__button').first()
    const firstModel = String(hfRows[0]!.values[modelId] ?? '')
    await expect(first).toContainText(firstModel)
    await first.click()
    const opened = page.getByTestId('sheet-model')
    await expect(opened).toBeVisible()
    const inModel = hfRows.filter((r) => String(r.values[modelId] ?? '') === firstModel).length
    await expect(opened.getByRole('grid')).toHaveAttribute('data-rows', String(inModel))
    await expect(page).toHaveURL(/model=/)
  })

  test('sheet — a pairing is filed under its boats, the master being the boat side', async ({
    page,
  }) => {
    const joinId = 'join_hf_yam'
    const join = tableOf(joinId)
    const joinRows = rowsOf(joinId)
    await openSheet(page, joinId)
    const grid = page.getByRole('grid', { name: join.name })
    await expect(grid).toHaveAttribute('data-rows', String(joinRows.length))
    /* one drawer per hull: the lines are the pairings plus one head per boat */
    const boatField = join.fields.find((f) => f.type === 'reference')!
    const hulls = new Set(joinRows.map((r) => String(r.values[boatField.id])))
    await expect(grid).toHaveAttribute('aria-rowcount', String(joinRows.length + hulls.size))
    /* and the first drawer is named by the hull's own label, never an id */
    const firstHead = page.locator('.sh-line__name').first()
    await expect(firstHead).toHaveText(firstName)
    await expect(firstHead).not.toContainText('boat_highfield:')
  })

  test('sheet — in a hand the grid is the name and one fact, and the record is the screen', async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) >= 640, 'the hand form is under 640px')
    await openSheet(page, HIGHFIELD)
    /* two column heads: the pinned name and one fact */
    await expect(page.locator('.sh-th')).toHaveCount(2)
    const hand = page.getByTestId('sheet-hand')
    await expect(hand).toContainText(`The other ${hf.fields.length - hfLevels.length + 1 - 2}`)
    /* sideways scroll is refused rather than offered */
    const over = await page.evaluate(() => {
      const g = document.querySelector('.sh-grid')!
      return g.scrollWidth - g.clientWidth
    })
    expect(over).toBeLessThanOrEqual(1)

    await page.locator('.sh-row').first().locator('.sh-cell__read').first().click()
    await page.getByRole('grid', { name: hf.name }).focus()
    await page.keyboard.press('Space')
    const side = page.locator('.sh-side[data-peeking]')
    await expect(side).toBeVisible()
    const box = await side.boundingBox()
    expect(box?.width, 'the record takes the whole width of a hand').toBeGreaterThanOrEqual(
      (viewport?.width ?? 0) - 1,
    )
    await expect(page.getByRole('button', { name: 'Close the record' })).toHaveText(
      '← Back to the sheet',
    )
  })
})
