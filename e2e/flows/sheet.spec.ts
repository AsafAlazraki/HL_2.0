import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { throughTheDoor } from '../door'
import { readDensity } from '../rulers/measure/density'
import { cardName } from '../mint'

/* ============================================================
   THE SHEET — THE PRICE LIST — IN A REAL BROWSER, AT EVERY SIZE.

   NOTHING HERE IS TYPED INTO AN ASSERTION. Every figure is walked out
   of `data/northside/` — the same files the browser fetches — and then
   looked for on the screen: how many variants Highfield carries, which
   series it opens on, which row the finder is asked for and what that
   row's code is, which columns the packer marked as cost, which hull a
   pairing names first. The one thing the walk types is a value into a
   cell, which is a person at a keyboard played by a test; it is put
   back with Undo before the case ends.

   WHAT THE CRITIC FOUND, EACH ASSERTED WHERE IT WAS FOUND
   (docs/directions/built-critique-m2.md):
     (1)  a row found in the finder opens THAT row — its record's own
          name and its lit row's own code are read, not only the address;
     (5)  the pairings hold eighteen at 1280 × 800 as well as Highfield
          (Highfield's own figure is the density ruler's);
     (11) no form and no refusal on first paint;
     (12) a shut model stays shut through a write;
     (13) the screen's head repeats none of the pill's doors;
     (20) at 390 nothing the screen says stands under the tab bar;
     (22) no column that says one thing, and a cost said to be cost;
     and the app's rule (d): the sheet fits the window it is drawn at.
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
  fields: { id: string; name: string; type: string; refEntityId?: string }[]
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
const byName = (name: string) => hf.fields.find((f) => f.name === name)!
const cell = (row: Row, name: string): string => String(row.values[byName(name).id] ?? '')
const labelOf = (row: Row): string => String(row.values[hf.displayFieldId ?? ''] ?? '')
const firstSeries = cell(hfRows[0]!, 'Series')
const inFirstSeries = hfRows.filter((r) => cell(r, 'Series') === firstSeries)
/* a model as the spine says it: the maker's own words for a code its page names (RU230KAM is
   "Roll Up 230 KAM", m2-last-critique.md major 7), read off the same ledger the app reads */
const firstModel = cell(hfRows[0]!, 'Model')
const firstModelSaid = cardName(HIGHFIELD, firstModel)
const costIds = new Set(manifest.tables.find((t) => t.id === HIGHFIELD)?.costColumns ?? [])
const costHeads = hf.fields.filter((f) => costIds.has(f.id))

/** A row a dealer would have to look for: five sixths of the way down the file. */
const target = hfRows[Math.floor((hfRows.length * 5) / 6)]!

async function openSheet(page: Page, tableId: string, search = ''): Promise<void> {
  await throughTheDoor(page)
  await page.goto(`/data/${tableId}${search}`)
  await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({ timeout: 30_000 })
}

const desk = (w: number | undefined): boolean => (w ?? 0) >= 640

/** The address a picture cell names: the file stores a list of { src }. */
const pictureAddress = (v: unknown): string =>
  Array.isArray(v) && v[0] && typeof v[0] === 'object'
    ? String((v[0] as { src?: string }).src ?? '')
    : ''

test.describe('the sheet', () => {
  test.beforeEach(() => {
    /* the door reads 53 tables and 15,691 rows before the sheet can
       draw one of them, on top of Playwright's default budget */
    test.setTimeout(120_000)
  })

  test('sheet — counts the file, says once what a column would repeat, and says cost is cost', async ({
    page,
    viewport,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await openSheet(page, HIGHFIELD)

    await expect(page.getByRole('heading', { level: 1, name: hf.name })).toBeVisible()
    const count = page.locator('.sh-count')
    await expect(count).toContainText(`${hfRows.length} variants`)
    await expect(count).toContainText(`${hf.fields.length} columns`)

    /* one series at a time: on a desk the grid's rows are the first
       series' rows; a hand rests shut to that series' models */
    const grid = page.getByRole('grid', { name: hf.name })
    if (desk(viewport?.width)) {
      await expect(grid).toHaveAttribute('data-rows', String(inFirstSeries.length))
    } else {
      const models = new Set(inFirstSeries.map((r) => cell(r, 'Model')))
      await expect(page.locator('.sh-spine__press')).toHaveCount(models.size)
    }

    /* a column that says one thing is not a column: Matrix is said once */
    const heads = await page.getByRole('columnheader').allInnerTexts()
    expect(heads.map((h) => h.trim().toLowerCase())).not.toContain('matrix')

    if (desk(viewport?.width)) {
      /* every column the packer marked as cost says the word at its
         head behind the Every column door, and no other column does */
      await page.getByRole('link', { name: /^Every column/ }).click()
      await expect(page.locator('[data-testid="sheet"][data-door="every"]')).toBeVisible()
      const marked = await page.evaluate(() =>
        [...document.querySelectorAll('.sh-th')]
          .filter((h) => h.querySelector('.sh-th__cost'))
          .map((h) => h.querySelector('.sh-th__name')?.textContent ?? '')
          .toSorted(),
      )
      expect(marked).toEqual(costHeads.map((f) => f.name).toSorted())
    } else {
      /* a hand reads a model's rows and their record, where each cost
         section says the word */
      await page.locator('.sh-spine__press').first().click()
      await page.locator('.sh-row').first().locator('.sh-cell__read').first().click()
      const record = page.getByTestId('sheet-record')
      await expect(record.locator('.sh-fact__cost')).toHaveCount(costHeads.length)
    }

    /* the page never scrolls sideways at any width */
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(over, 'the page itself never scrolls sideways').toBeLessThanOrEqual(0)
    expect(errors, 'no page error').toEqual([])
  })

  test('sheet — fits the window it is drawn at, and its head repeats no door the pill carries', async ({
    page,
  }) => {
    await openSheet(page, HIGHFIELD)
    const fit = await page.evaluate(() => ({
      scroll: document.scrollingElement!.scrollHeight,
      inner: innerHeight,
    }))
    expect(
      fit.scroll,
      'the sheet is drawn to the window, and scrolls inside its list',
    ).toBeLessThanOrEqual(fit.inner)
    /* AND THE PRICE LIST DOES NOT SCROLL SIDEWAYS EITHER. Driven 2026-09-24 on the built
       app: the columns were laid out against the body's box and not the list's inside, so
       at 834, 844, 1280 and 1440 the list carried a sideways scrollbar for the 15 px its
       own vertical scrollbar takes (1,376 px of content in 1,361 at 1440). Every column
       runs off sideways on purpose; the price list never does. */
    await expect
      .poll(() =>
        page.evaluate(() => {
          const grid = document.querySelector<HTMLElement>('.sh-grid')
          return grid ? grid.scrollWidth - grid.clientWidth : Number.MAX_SAFE_INTEGER
        }),
      )
      .toBeLessThanOrEqual(0)
    /* rule (a): Home, Quotes, Customers, Data and History are the pill's */
    const main = page.getByTestId('sheet')
    for (const door of ['Home', 'Quotes', 'Customers', 'Data', 'History']) {
      await expect(main.getByRole('link', { name: door, exact: true })).toHaveCount(0)
      await expect(main.getByRole('button', { name: door, exact: true })).toHaveCount(0)
    }
  })

  test('sheet — the rest state is the work: no form, nothing refusing, before anybody touches it', async ({
    page,
  }) => {
    await openSheet(page, HIGHFIELD)
    const main = page.getByTestId('sheet')
    await expect(main.getByRole('textbox', { name: "The new column's name" })).toHaveCount(0)
    await expect(main.getByText(/needs a name/)).toHaveCount(0)
    await expect(main.locator('[aria-disabled="true"]')).toHaveCount(0)
  })

  test('sheet — a row found in the finder opens THAT row, its record showing', async ({
    page,
    viewport,
  }) => {
    await throughTheDoor(page)
    if (desk(viewport?.width)) await page.keyboard.press('Control+k')
    else await page.locator('.way-find').click()
    const finder = page.getByTestId('shell-finder')
    await expect(finder).toBeVisible()
    await page.keyboard.type(labelOf(target))
    const option = finder
      .getByRole('option', {
        name: new RegExp(labelOf(target).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      })
      .first()
    await expect(option).toContainText('Open it on the sheet')
    await option.click()

    await expect(page).toHaveURL(new RegExp(`/data/${HIGHFIELD}\\?.*at=`))
    const record = page.getByTestId('sheet-record')
    await expect(record).toBeVisible({ timeout: 30_000 })
    await expect(record.getByRole('heading', { level: 2 })).toHaveText(labelOf(target))
    /* the lit row is the found row: its own code, in its own chapter */
    if (desk(viewport?.width)) {
      await expect(page.locator('.sh-row[data-on]')).toContainText(cell(target, 'Model Code'))
      await expect(
        page.getByRole('link', { name: new RegExp(`^${cell(target, 'Series')}`) }),
      ).toHaveAttribute('aria-current', 'location')
    }
  })

  /* FROM INSIDE THE SHEET, AND AFTER A RELOAD. The case above arrives
     from Home on a list drawn from its first paint. Driven cold on the
     built app (2026-09-23), the two other ways to the same address both
     failed at 1440 × 900: a row found while the sheet was already open
     on another chapter landed at scrollTop 460 with SP330 in the window
     (the list's ask used a 28px estimate for every block it had not
     drawn), and the same `?at=` reloaded opened its row and then had
     979 written back over it by the router's scroll restoration. Both
     showed no lit row and no record. */
  test('sheet — a row found from inside the sheet opens that row, and a reload keeps it open', async ({
    page,
    viewport,
  }) => {
    await openSheet(page, HIGHFIELD)
    if (desk(viewport?.width)) await page.keyboard.press('Control+k')
    else await page.locator('.way-find').click()
    const finder = page.getByTestId('shell-finder')
    await expect(finder).toBeVisible()
    await page.keyboard.type(labelOf(target))
    await finder
      .getByRole('option', {
        name: new RegExp(labelOf(target).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      })
      .first()
      .click()

    const record = page.getByTestId('sheet-record')
    await expect(record.getByRole('heading', { level: 2 })).toHaveText(labelOf(target), {
      timeout: 30_000,
    })
    const lit = page.locator('.sh-row[data-on]')
    if (desk(viewport?.width)) {
      await expect(lit).toContainText(cell(target, 'Model Code'))
      await expect(lit.locator('.sh-cell').first()).toBeInViewport()
    }

    await page.reload()
    await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({ timeout: 30_000 })
    await expect(record.getByRole('heading', { level: 2 })).toHaveText(labelOf(target), {
      timeout: 30_000,
    })
    if (desk(viewport?.width)) {
      await expect(lit).toContainText(cell(target, 'Model Code'))
      await expect(lit.locator('.sh-cell').first()).toBeInViewport()
    }
  })

  /* THE FOUND ROW'S MODEL IS HELD OPEN, UNTIL THE DEALER SHUTS IT. Driven
     cold on 2026-09-23: after the finder landed on SP560 (HYP) B-B-B,
     "Shut SP560" wrote `flip=` into the address and left every row
     drawn — a control that silently did nothing. */
  test('sheet — the found row’s own model shuts when its Shut is pressed', async ({
    page,
    viewport,
  }) => {
    test.skip(!desk(viewport?.width), 'in a hand the found row’s record is the whole screen')
    await openSheet(page, HIGHFIELD, `?at=${encodeURIComponent(target.id)}`)
    const record = page.getByTestId('sheet-record')
    await expect(record.getByRole('heading', { level: 2 })).toHaveText(labelOf(target), {
      timeout: 30_000,
    })
    const model = cardName(HIGHFIELD, cell(target, 'Model'))
    await page.getByRole('button', { name: `Shut ${model}`, exact: true }).click()
    /* every row of it leaves the list, and the address says so; the shut
       line itself may stand just above the window, because the cursor that
       stood in the block moves to the next row and the list follows it */
    await expect(page.locator(`[id^="sh-cell-${target.id}-"]`)).toHaveCount(0)
    await expect(page).toHaveURL(/[?&]flip=/)
  })

  /* A SPINE SAYS ITS FIGURE WHOLE, AND ITS PICTURE STAYS IN ITS BLOCK.
     Driven 2026-09-24: at 1280 the render beside the words cut "PVC
     $41,340 · HYP $48,3…", and at 1920 a render's caption stood 7px under
     its block's edge. Every chapter is read, at every size. */
  /* AND EVERY WORD OF IT WHOLE. The second critique counted 5 of 15 spec
     lines cut with an ellipsis at 1280 on Roll-Up, 6 of 18 at 1440, 1 of
     22 at 1920, and 2 of 8 on Sport at every width — "OA Length 2.3 ·
     Beam 1.37 · Tube Di…" — on the lines under the figure, which this case
     had not read (built-critique-m2-close.md §10). Now the name, the
     figure, every fact line and every one-line head are read. */
  test('sheet — every spine says its name, its figure and its facts whole, and its picture stays inside its block', async ({
    page,
    viewport,
  }) => {
    await openSheet(page, HIGHFIELD)
    const series = [...new Set(hfRows.map((r) => cell(r, 'Series')))]
    /* A UNIT SAID ONCE, AFTER ITS FIGURES (m2-last-critique.md minor 10): the ADV7's
       Max HP cell holds "250 HP", and its spine read "Max 250 HP HP". Every fact a spine or
       a band says, on every chapter, is read for a unit said twice, said as a label and
       again in the value ("HP 2 x 300HP–…"), or said before bare figures ("HP 40–60"). */
    const adv7 = hfRows.find((r) => cell(r, 'Model') === 'ADV7')!
    const adv7Max = `Max ${cell(adv7, 'Max HP')}`
    const twice = /\b(hp|kg|cm|mm|ltr|lbs|ft)\s+\1\b/i
    const labelThenCarried = /^(hp|kg|cm|mm|ltr|lbs|ft)\s.*\d\s*\1\b/i
    const unitFirst = /^(hp|kg|cm|mm|ltr|lbs|ft)\s+\d[\d,.]*(–\d[\d,.]*)?$/i
    let read = 0
    for (const chapter of series) {
      await page.goto(`/data/${HIGHFIELD}?in=${encodeURIComponent(chapter)}`)
      /* each chapter is a fresh read of this browser: the same budget openSheet gives the first */
      await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({
        timeout: 30_000,
      })
      await page.waitForTimeout(300)
      /* a run is one section's facts joined by " · "; the band's words follow its "every one" */
      const facts = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.sh-spine__run, .sh-band__says')].flatMap(
          (el) =>
            [...el.childNodes]
              .filter((n) => !(n instanceof HTMLElement && n.matches('.sh-band__every')))
              .map((n) => n.textContent ?? '')
              .join('')
              .replace(/\s+/g, ' ')
              .split(' · ')
              .map((f) => f.trim())
              .filter((f) => f !== ''),
        ),
      )
      expect(
        facts.filter((f) => twice.test(f) || labelThenCarried.test(f) || unitFirst.test(f)),
        `${chapter}: a unit said once, after its figures`,
      ).toEqual([])
      if (chapter === cell(adv7, 'Series') && (viewport?.width ?? 0) >= 834)
        expect(facts, `${chapter}: the ADV7 says ${adv7Max}`).toContain(adv7Max)
      const found = await page.evaluate(() => {
        let lines = 0
        const faults = [...document.querySelectorAll('.sh-spine')].flatMap((spine) => {
          const box = spine.getBoundingClientRect()
          const said: string[] = []
          for (const el of spine.querySelectorAll<HTMLElement>(
            '.sh-spine__name, .sh-spine__figures, .sh-spine__line, .sh-spine__one, .sh-spine__picture img, .sh-spine__caption',
          )) {
            const r = el.getBoundingClientRect()
            if (r.height === 0) continue
            if (r.bottom > box.bottom + 0.5) said.push(`${el.className} under the block`)
            if (el.matches('img, .sh-spine__caption')) continue
            lines += 1
            if (el.scrollWidth > el.clientWidth + 1)
              said.push(`cut: ${el.textContent?.slice(0, 60)}`)
          }
          return said
        })
        return { faults, lines }
      })
      read += found.lines
      expect(found.faults, `${chapter}: every spine whole, inside its block`).toEqual([])
      /* and the lit row's tail holds what it draws: at 1280 its keys were
         clipped to "[nter] edits" by the cell they overflowed. A row is lit
         once the grid is touched, so the grid is touched first. */
      if (desk(viewport?.width)) {
        await page.getByRole('grid', { name: hf.name }).focus()
        await expect(page.locator('.sh-tail[data-on]')).toHaveCount(1)
      }
      const clipped = await page.evaluate(
        () =>
          [...document.querySelectorAll<HTMLElement>('.sh-tail[data-on]')].filter(
            (tail) => tail.scrollWidth > tail.clientWidth + 1,
          ).length,
      )
      expect(clipped, `${chapter}: the lit row's tail holds what it draws`).toBe(0)
    }
    expect(read, 'the spines were read, not skipped').toBeGreaterThan(0)
  })

  /* "ONLY THE MODELS" IS A LIST OF BOATS, NOT OF PRICES FOR NOTHING. The
     second critique's blocker 1: every shut model's name was drawn 0 px
     wide at 834, 1280, 1440 and 1920, so the door drew eight lines of
     "▸ PVC $2,770 · HYP $4,500–$5,320" and no boat — while the unit case
     stayed green by the toggle's label. Here the line itself is read:
     its name is drawn at the width its words need and says the model, on
     every chapter, at every size. */
  test('sheet — every shut line names its model whole, beside its figure and what it shares', async ({
    page,
  }) => {
    await openSheet(page, HIGHFIELD)
    const series = [...new Set(hfRows.map((r) => cell(r, 'Series')))]
    let lines = 0
    for (const chapter of series) {
      const models = new Set(
        hfRows
          .filter((r) => cell(r, 'Series') === chapter)
          .map((r) => cardName(HIGHFIELD, cell(r, 'Model'))),
      )
      await page.goto(`/data/${HIGHFIELD}?in=${encodeURIComponent(chapter)}&read=models`)
      /* each chapter is a fresh read of this browser: the same budget openSheet gives the first */
      await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({
        timeout: 30_000,
      })
      await page.waitForTimeout(300)
      const shut = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.sh-spine[data-shut]')]
          .filter((s) => {
            const r = s.getBoundingClientRect()
            return r.bottom > 0 && r.top < innerHeight
          })
          .map((s) => {
            const name = s.querySelector<HTMLElement>('.sh-spine__name')!
            const words = name.firstChild?.textContent?.trim() ?? ''
            const cut = [
              ...s.querySelectorAll<HTMLElement>(
                '.sh-spine__name, .sh-spine__figures, .sh-spine__one',
              ),
            ].filter((el) => el.scrollWidth > el.clientWidth + 1)
            return {
              words,
              width: name.getBoundingClientRect().width,
              cut: cut.map((el) => el.textContent ?? ''),
            }
          }),
      )
      expect(shut.length, `${chapter}: shut lines in view`).toBeGreaterThan(0)
      for (const line of shut) {
        expect(models.has(line.words), `${chapter}: "${line.words}" is one of its models`).toBe(
          true,
        )
        expect(line.width, `${chapter}: ${line.words} is drawn`).toBeGreaterThan(20)
        expect(line.cut, `${chapter}: ${line.words} whole`).toEqual([])
      }
      lines += shut.length
    }
    expect(lines).toBeGreaterThan(0)
  })

  /* THE REST STATE HAS NO SPREADSHEET CURSOR. The second critique found a
     cell outlined and "Enter edits · Space" in its row on first paint,
     before anybody had touched the sheet. The cursor is drawn once the
     grid is touched. */
  test('sheet — no cursor and no keycap in the list until somebody touches it', async ({
    page,
    viewport,
  }) => {
    test.skip(!desk(viewport?.width), 'a hand rests shut, with no cursor to draw')
    await openSheet(page, HIGHFIELD)
    await expect(page.locator('.sh-row[data-on]')).toHaveCount(0)
    await expect(page.locator('.sh-cell[data-active]')).toHaveCount(0)
    await expect(page.locator('.sh-cell[data-selected]')).toHaveCount(0)
    const keys = await page.evaluate(
      () =>
        [...document.querySelectorAll('.sh-outline kbd')].filter(
          (k) => k.getBoundingClientRect().width > 0,
        ).length,
    )
    expect(keys, 'no keycap in the list at rest').toBe(0)
    await page.getByRole('grid', { name: hf.name }).focus()
    await expect(page.locator('.sh-row[data-on]')).toHaveCount(1)
    await expect(page.locator('.sh-cell[data-active]')).toHaveCount(1)
  })

  test('sheet — Space opens the record under the row, J follows it, Esc closes it', async ({
    page,
    viewport,
  }) => {
    test.skip(!desk(viewport?.width), 'a hand opens a record by a press, which the hand case walks')
    await openSheet(page, HIGHFIELD)
    const grid = page.getByRole('grid', { name: hf.name })
    await grid.focus()
    await page.keyboard.press('Space')

    const record = page.getByTestId('sheet-record')
    await expect(record).toBeVisible()
    await expect(record.getByRole('heading', { level: 2 })).toHaveText(labelOf(hfRows[0]!))
    /* the row stays lit over the record, and the record opens under it, not beside the list */
    await expect(page.locator('.sh-row[data-peeking]')).toHaveCount(1)
    const rowBox = await page.locator('.sh-row[data-peeking] .sh-cell').first().boundingBox()
    const recordBox = await record.boundingBox()
    expect(recordBox!.y).toBeGreaterThanOrEqual(rowBox!.y + rowBox!.height - 1)
    await expect(page).toHaveURL(new RegExp(`at=${encodeURIComponent(hfRows[0]!.id)}`))

    /* the arrow moves the cursor, in the order on screen, and the record follows
       (J did until 2026-09-25: no letter is a shortcut on the sheet) */
    await page.keyboard.press('ArrowDown')
    await expect(record.getByRole('heading', { level: 2 })).not.toHaveText(labelOf(hfRows[0]!))
    await page.keyboard.press('Escape')
    await expect(record).toBeHidden()
  })

  test('sheet — a value that does not fit its column is a pill under the cell, never a toast', async ({
    page,
    viewport,
  }) => {
    test.skip(!desk(viewport?.width), 'a hand edits in the record')
    await openSheet(page, HIGHFIELD)
    await page.getByRole('grid', { name: hf.name }).focus()
    const cash = page.locator('.sh-th', { hasText: 'Cash' }).first()
    const col = Number(await cash.getAttribute('aria-colindex')) - 1
    for (let i = 0; i < col; i += 1) await page.keyboard.press('ArrowRight')

    await page.keyboard.press('Enter')
    const editor = page.getByRole('textbox', { name: 'Cash, editing' })
    await expect(editor).toBeVisible()
    await editor.fill('12abc')
    await page.keyboard.press('Enter')
    await expect(page.locator('.sh-pill')).toHaveText('"12abc" is not a number')
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0)
    await expect(page.getByTestId('last-step')).toHaveCount(0)
  })

  test('sheet — an edit writes through the store, says its sentence with Undo pinned, and Undo puts it back', async ({
    page,
    viewport,
  }) => {
    test.skip(!desk(viewport?.width), 'a hand edits in the record')
    await openSheet(page, HIGHFIELD)
    await page.getByRole('grid', { name: hf.name }).focus()
    const cash = page.locator('.sh-th', { hasText: 'Cash' }).first()
    const col = Number(await cash.getAttribute('aria-colindex')) - 1
    for (let i = 0; i < col; i += 1) await page.keyboard.press('ArrowRight')

    const first = hfRows[0]!
    const theCell = page.locator(`[id="sh-cell-${first.id}-${col}"]`)
    const before = (await theCell.innerText()).trim()
    const was = first.values[byName('Cash').id]
    await page.keyboard.press('Enter')
    await page
      .getByRole('textbox', { name: 'Cash, editing' })
      .fill(typeof was === 'number' ? String(was + 1) : '1')
    await page.keyboard.press('Enter')

    const step = page.getByTestId('last-step')
    await expect(step).toContainText(`Cell edit · ${hf.name}`)
    await expect(theCell).not.toHaveText(before)
    await step.getByRole('button', { name: 'Undo' }).click()
    await expect(step).toContainText('Undone')
    await expect(theCell).toHaveText(before)
    await expect(step.getByRole('button', { name: 'Put it back' })).toBeVisible()
  })

  test('sheet — a shut model stays shut through a write (critique §12)', async ({
    page,
    viewport,
  }) => {
    test.skip(!desk(viewport?.width), 'a hand rests shut, and opens by a press')
    await openSheet(page, HIGHFIELD)
    await page.getByRole('button', { name: `Shut ${firstModelSaid}` }).click()
    await expect(page.getByRole('button', { name: `Open ${firstModelSaid}` })).toBeVisible()
    await expect(page).toHaveURL(/flip=/)

    /* a write to another model */
    await page.getByRole('grid', { name: hf.name }).focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await page.getByRole('textbox', { name: /editing$/ }).fill('X9')
    await page.keyboard.press('Enter')
    const step = page.getByTestId('last-step')
    await expect(step).toContainText(`Cell edit · ${hf.name}`)
    await expect(page.getByRole('button', { name: `Open ${firstModelSaid}` })).toBeVisible()
    await step.getByRole('button', { name: 'Undo' }).click()
    await expect(step).toContainText('Undone')
    await expect(page.getByRole('button', { name: `Open ${firstModelSaid}` })).toBeVisible()
  })

  test('sheet — the Pictures door is one card per model, and a card opens the price list on it', async ({
    page,
  }) => {
    await openSheet(page, HIGHFIELD, '?door=pictures')
    const gallery = page.getByTestId('sheet-gallery')
    await expect(gallery).toBeVisible()
    /* the series being read, the same one the price list opens on */
    const models = new Set(inFirstSeries.map((r) => cell(r, 'Model')))
    await expect(gallery.locator('.sh-card')).toHaveCount(models.size)
    await expect(gallery.locator('.sh-shelf')).toHaveCount(1)

    /* THE REASON ONCE, NOT A GREY TILE EACH (built-critique-m2-close.md §9):
       every card with no picture is a line of the names list, never a
       picture-sized tile, and the one sentence beside them counts them */
    const bare = await gallery.locator('.sh-card[data-bare]').count()
    await expect(gallery.locator('.sh-card', { hasText: /No picture/ })).toHaveCount(0)
    await expect(gallery.locator('.sh-card[data-bare] img')).toHaveCount(0)
    await expect(gallery.locator('.sh-card:not([data-bare]) img')).toHaveCount(models.size - bare)
    if (bare > 0) {
      await expect(gallery.locator('.sh-bare__why')).toHaveCount(1)
      await expect(gallery.locator('.sh-bare__why')).toContainText(
        bare === 1 ? 'this one' : `these ${bare}`,
      )
      /* a name in the list is a line, not a plate: shorter than any picture card */
      const heights = await page.evaluate(() => ({
        name: Math.max(
          ...[...document.querySelectorAll('.sh-card[data-bare]')].map(
            (e) => e.getBoundingClientRect().height,
          ),
        ),
        plate: Math.min(
          ...[...document.querySelectorAll('.sh-card:not([data-bare])')].map(
            (e) => e.getBoundingClientRect().height,
          ),
        ),
      }))
      expect(heights.name).toBeLessThan(heights.plate)
    }

    await gallery.locator('.sh-card__button', { hasText: firstModelSaid }).first().click()
    await expect(page.getByTestId('sheet-gallery')).toHaveCount(0)
    await expect(page.getByTestId('sheet-record').getByRole('heading', { level: 2 })).toContainText(
      firstModel,
    )
  })

  test('sheet — the Pictures door cuts no name, enlarges no picture, and fits its window', async ({
    page,
  }) => {
    /* Highfield's first series (a spread: one render, seven names) and
       Stacer (a card per hull on 22 shelves, where 43 of 91 names ended
       in "…" at 1440 before 2026-09-24) */
    for (const tableId of [HIGHFIELD, 'boat_stacer']) {
      if (tableId === HIGHFIELD) await openSheet(page, tableId, '?door=pictures')
      else {
        await page.goto(`/data/${tableId}?door=pictures`)
        await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({
          timeout: 30_000,
        })
      }
      const gallery = page.getByTestId('sheet-gallery')
      await expect(gallery).toBeVisible()
      /* every picture that is in view has loaded before it is measured */
      await page.evaluate(async () => {
        const imgs = [...document.querySelectorAll<HTMLImageElement>('.sh-card__picture')]
        await Promise.all(
          imgs.map((i) => {
            i.loading = 'eager'
            return i.complete
              ? null
              : new Promise((r) => {
                  i.addEventListener('load', r, { once: true })
                  i.addEventListener('error', r, { once: true })
                })
          }),
        )
      })
      const m = await page.evaluate(() => {
        const names = [...document.querySelectorAll('.sh-card__name')]
        const cut = names
          .filter(
            (e) =>
              e.scrollWidth > e.clientWidth + 1 || getComputedStyle(e).textOverflow === 'ellipsis',
          )
          .map((e) => e.textContent ?? '')
        const enlarged = [...document.querySelectorAll<HTMLImageElement>('.sh-card__picture')]
          .filter((i) => i.naturalWidth > 0)
          .filter((i) => {
            const r = i.getBoundingClientRect()
            const cover = getComputedStyle(i).objectFit === 'cover'
            const x = r.width / i.naturalWidth
            const y = r.height / i.naturalHeight
            return (cover ? Math.max(x, y) : Math.min(x, y)) > 1.001
          })
          .map((i) => i.src)
        const se = document.scrollingElement!
        return {
          names: names.length,
          cut,
          enlarged,
          doc: se.scrollHeight,
          wide: se.scrollWidth,
          h: innerHeight,
          w: innerWidth,
          why: document.querySelectorAll('.sh-bare__why').length,
          bare: document.querySelectorAll('.sh-card[data-bare]').length,
        }
      })
      expect(m.names, `${tableId}: the door drew its cards`).toBeGreaterThan(0)
      expect(m.cut, `${tableId}: a name ends in "…" or runs out of its box`).toEqual([])
      expect(m.enlarged, `${tableId}: a picture drawn larger than the copy held`).toEqual([])
      /* the app's rule (d): the door scrolls inside itself, on purpose,
         and the window never does, either way */
      expect(m.doc, `${tableId}: the page is taller than the window`).toBeLessThanOrEqual(m.h)
      expect(m.wide, `${tableId}: the page is wider than the window`).toBeLessThanOrEqual(m.w)
      /* the reason is said once for the whole door, however many shelves */
      expect(m.why).toBe(m.bare > 0 ? 1 : 0)
    }
  })

  test('sheet — a door with no picture on it says so once, and goes back to the price list', async ({
    page,
  }) => {
    /* the table on the file that holds the fewest pictures: read off the
       pack's image ledger, never named here */
    const images = readJson<{ images: { address: string; file?: string }[] }>('images.json')
    const held = new Set(images.images.filter((i) => i.file).map((i) => i.address))
    const pictured = tables
      .map((t) => {
        const image = t.fields.find((f) => f.type === 'image')
        if (!image) return null
        const rows = rowsOf(t.id)
        return {
          t,
          rows,
          held: rows.filter((r) => held.has(pictureAddress(r.values[image.id]))).length,
        }
      })
      .filter((x): x is { t: Table; rows: Row[]; held: number } => x !== null)
      .toSorted((a, b) => a.held - b.held || b.rows.length - a.rows.length)
    const none = pictured[0]!
    test.skip(none.held > 0, 'every table on this file holds a picture')

    await openSheet(page, none.t.id)
    const door = page.getByRole('link', { name: /^Pictures/ })
    await expect(door).toContainText(`0 of ${none.rows.length}`)
    await door.click()
    const gallery = page.getByTestId('sheet-gallery')
    await expect(gallery.locator('.sh-card')).toHaveCount(0)
    await expect(gallery.locator('.sh-none')).toHaveCount(1)
    await expect(gallery).toContainText(`any of these ${none.rows.length}`)
    await gallery.getByRole('button', { name: 'Back to the price list' }).click()
    await expect(page.locator('[data-testid="sheet"][data-door="price"]')).toBeVisible()
  })

  test('sheet — a pairing is read boat side first, every block a hull', async ({
    page,
    viewport,
  }) => {
    const joinId = 'join_hf_yam'
    const join = tableOf(joinId)
    const joinRows = rowsOf(joinId)
    await openSheet(page, joinId)
    const grid = page.getByRole('grid', { name: join.name })
    /* a desk draws every pairing; a hand rests shut to the hulls */
    await expect(grid).toHaveAttribute(
      'data-rows',
      desk(viewport?.width) ? String(joinRows.length) : '0',
    )
    const boat = join.fields.find((f) => f.type === 'reference')!
    const hull = hfRows.find((r) => r.id === String(joinRows[0]!.values[boat.id]))!
    await expect(page.getByRole('rowgroup', { name: labelOf(hull) }).first()).toBeVisible()
  })

  test('sheet — the pairings hold eighteen rows at 1280 × 800 too', async ({ page, viewport }) => {
    test.skip(viewport?.width !== 1280, 'measured at 1280×800, the dealer’s laptop')
    await throughTheDoor(page)
    for (const joinId of ['join_hf_yam', 'join_hf_trl']) {
      await page.goto(`/data/${joinId}`)
      await expect(page.locator('[data-testid="sheet"][data-read]')).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.locator('.sh-row').first()).toBeVisible()
      const d = await page.evaluate(readDensity, { list: '.sh-grid' })
      console.log(
        `  ${joinId.padEnd(12)} ${d.records} records in view · ${d.pitch}px pitch · ${Math.round(d.room)}px room less ${Math.round(d.heads)}px of heads → holds ${d.capacity}`,
      )
      expect(d.strays).toBe(0)
      expect(d.capacity, `${joinId} holds eighteen`).toBeGreaterThanOrEqual(18)
    }
  })

  test('sheet — in a hand it rests shut to the model, opens in place, and the record is the screen', async ({
    page,
    viewport,
  }) => {
    test.skip(desk(viewport?.width), 'the hand form is under 640px')
    await openSheet(page, HIGHFIELD)
    const heads = page.locator('.sh-spine__press')
    const models = new Set(inFirstSeries.map((r) => cell(r, 'Model')))
    await expect(heads).toHaveCount(models.size)
    await expect(heads.first()).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('.sh-row')).toHaveCount(0)

    /* the sentence saying where the other columns went is above the list, clear of the tab bar */
    const hand = page.getByTestId('sheet-hand')
    await expect(hand).toBeVisible()
    const said = await hand.boundingBox()
    const list = await page.locator('.sh-grid').boundingBox()
    const bar = await page.locator('.way-pill').boundingBox()
    expect(said!.y + said!.height).toBeLessThanOrEqual(list!.y + 1)
    if (bar) expect(said!.y + said!.height).toBeLessThanOrEqual(bar.y)

    /* no keycap in a hand */
    const caps = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-testid="sheet"] .ui-kbd')].filter(
          (k) => (k as HTMLElement).offsetParent !== null,
        ).length,
    )
    expect(caps).toBe(0)

    await heads.first().click()
    await expect(heads.first()).toHaveAttribute('aria-expanded', 'true')
    const inModel = inFirstSeries.filter((r) => cell(r, 'Model') === firstModel).length
    await expect(page.locator('.sh-row')).toHaveCount(inModel)

    await page.locator('.sh-row').first().locator('.sh-cell__read').first().click()
    const over = page.getByTestId('sheet-over')
    await expect(over).toBeVisible()
    const box = await over.boundingBox()
    expect(box?.width, 'the record takes the whole width of a hand').toBeGreaterThanOrEqual(
      (viewport?.width ?? 0) - 1,
    )
    await expect(page.getByRole('button', { name: 'Close the record' })).toHaveText(
      '← Back to the price list',
    )
  })
})
