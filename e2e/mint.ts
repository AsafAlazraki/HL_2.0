import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, type Page } from '@playwright/test'
import { throughTheDoor } from './door'

/* ============================================================
   THE WALK THAT MINTS A DOCUMENT, and the one place it is written.

   `door.ts` gets a browser past the door. This gets it to a QUOTE,
   which from 2026-09-18 is what three rulers need: `/quote/$id`,
   `/quote/$id/cascade` and `/quote/$id/document` have no address until
   somebody has made one, so `fresh` and `through-the-door` could not
   reach them and contrast, cut, overlap and the ramp had never opened
   the three screens the sale actually happens on. `e2e/routes.ts` now
   names a third mode, `with-a-document`, and this is what it runs.

   IT IS A WALK AND NEVER A SEEDED RECORD. Nothing here writes to
   IndexedDB, plants a quote or invents a customer: it signs in, loads
   the Master Price File, finds the deepest model on that file, presses
   the act on the picker and reads the reference the app minted. The
   one thing it types is a name at a keyboard, which is a person played
   by a test and not seeded data — the same argument `door.ts` makes
   for `AT_THE_DESK`.

   IT WAS THREE COPIES BEFORE THIS FILE. `configurator.spec.ts`,
   `cascade.spec.ts` and `document.spec.ts` each carried their own
   `deepest()`, their own `startAQuote` and their own escape helper,
   byte-for-byte the same in two of the three; a fourth copy for the
   rulers would have been the point where they started to drift. The
   figures each spec asserts stay in that spec — this file holds only
   the walk.
   ============================================================ */

const DATA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'northside')

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(DATA, file), 'utf8')) as T

export interface Manifest {
  tables: { id: string; file: string; rowCount: number }[]
}
export interface Table {
  id: string
  name: string
  kind: string
  hierarchy?: string[]
}
export interface Row {
  id: string
  values: Record<string, unknown>
}

export const manifest = readJson<Manifest>('manifest.json')
export const tables = readJson<Table[]>('entities.json')
export const rowsOf = (id: string): Row[] =>
  readJson<Row[]>(manifest.tables.find((t) => t.id === id)?.file ?? '')
export const cell = (row: Row, id: string): string => String(row.values[id] ?? '').trim()

/** The name a model is grouped under, out of its register's own hierarchy. */
const groupKey = (row: Row, levels: string[]): string =>
  levels
    .slice(0, -1)
    .map((f) => cell(row, f))
    .join(' ▸ ')

/**
 * The register with the most rows per model on this file, which is the one whose hull
 * chapter has finishes to choose between. Found by measuring rather than named: the day the
 * file changes, this finds whatever now answers the question.
 */
export function deepest(): { table: Table; model: string; rows: Row[] } {
  let best: { table: Table; model: string; rows: Row[] } | null = null
  for (const table of tables.filter((t) => t.kind === 'boat')) {
    const levels = table.hierarchy ?? []
    if (levels.length < 3) continue
    const groups = new Map<string, Row[]>()
    for (const row of rowsOf(table.id)) {
      const key = groupKey(row, levels)
      groups.set(key, [...(groups.get(key) ?? []), row])
    }
    for (const [key, rows] of groups) {
      if (!best || rows.length > best.rows.length) best = { table, model: key, rows }
    }
  }
  expect(best, 'no boat register on this file groups to three levels').not.toBeNull()
  return best!
}

/**
 * HOW MANY BOATS A REGISTER HOLDS, counted as a person counts them: its
 * models. A register that files three levels groups its rows by the
 * levels above the last (Highfield's Series ▸ Model); every other register
 * is one row, one boat. The same rule `countBoats` in
 * src/domain/quote/boats.ts writes, read here off the files a second way.
 */
export function boatsIn(tableId: string): number {
  const table = tables.find((t) => t.id === tableId)
  const levels = table?.hierarchy ?? []
  const rows = rowsOf(tableId).filter((r) => r.values['__discontinued'] !== true)
  if (levels.length < 3) return rows.length
  return new Set(rows.map((r) => groupKey(r, levels))).size
}

/** Every model in a register, in the file's own order. */
export function modelsOf(tableId: string): string[] {
  const table = tables.find((t) => t.id === tableId)
  const levels = table?.hierarchy ?? []
  const seen: string[] = []
  for (const row of rowsOf(tableId)) {
    const key = groupKey(row, levels)
    const name = key.slice(key.lastIndexOf('▸') + 1).trim()
    if (name !== '' && !seen.includes(name)) seen.push(name)
  }
  return seen
}

export const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/* ============================================================
   THE NAME A CARD SAYS A MODEL BY (2026-09-24). The picker names a
   boat the way a person says it — SP660 is "Sport 660", because
   Highfield's own page for it is headed so — and the maker's words for
   a file's code are recorded in `data/northside/names.json` with the
   page they were read off. A walk that finds a card by the file's code
   finds nothing, so this reads the same ledger: the entry that names
   this code, and the letters after the part it names kept as the file
   writes them (PA600ST is "Patrol 600 ST"). A model the ledger does not
   name is its own words.
   ============================================================ */
interface NamesLedger {
  models: { table: string; code: string; name: string; fileCodes: string[] }[]
}
const names = readJson<NamesLedger>('names.json')

export function cardName(tableId: string, model: string): string {
  const entry = names.models.find((m) => m.table === tableId && m.fileCodes.includes(model))
  if (!entry) return model
  const rest = model
    .slice(entry.code.length)
    .replace(/(\S)\(/g, '$1 (')
    .trim()
  return rest === '' ? entry.name : `${entry.name} ${rest}`
}

export const DEEPEST = deepest()
/** the model's own name, which is the last level of its grouping key */
export const MODEL = DEEPEST.model.slice(DEEPEST.model.lastIndexOf('▸') + 1).trim()
/** and as a person says it, which is what every screen prints for it */
export const MODEL_SAID = cardName(DEEPEST.table.id, MODEL)

/** The customer this walk types at the desk — a person at a keyboard, played by a test. */
export const CUSTOMER = 'R. Kelleher'

/**
 * THE WRITE-BEHIND, WAITED OUT, for anything that then RELOADS.
 *
 * `src/state/quotes.ts` coalesces writes on a 300 ms interval, and its header argues for it:
 * typing a customer's name must be one write and not one per keystroke. Nothing in the app
 * loses by it, because every screen in the flow is reached through the router and the
 * document is in memory the whole way. A test that reloads inside that window is racing a
 * promise it cannot see.
 */
export const WRITE_BEHIND_MS = 300
export async function written(page: Page): Promise<void> {
  await page.waitForTimeout(WRITE_BEHIND_MS * 3)
}

/** Choose a model on the picker and press the act, arriving on the configurator. */
export async function pickAndStart(page: Page, tableId: string, model: string): Promise<string> {
  await page.goto(`/quote/new?brand=${tableId}`)
  await expect(page.getByTestId('picker-counts')).toBeVisible()

  await page.getByLabel(/Find a model/).fill(model)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(cardName(tableId, model))}\\b`) })
    .first()
    .click()

  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  /* a model built in more than one material asks that question first,
     and the act comes live the moment it is answered */
  const materials = panel.locator('.picker-chip__name')
  if ((await materials.count()) > 0) await materials.first().click()

  await panel
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()

  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('configurator')).toBeVisible()
  return idOnScreen(page)
}

/** The reference in the address bar, which the app minted and nobody typed. */
export function idOnScreen(page: Page): string {
  const id = /\/quote\/([^/?#]+)/.exec(page.url())?.[1]
  expect(id, 'this is not a quote address').toBeTruthy()
  return id!
}

/**
 * Sign in, load the file, choose the deepest model on the sheet and start the quote —
 * arriving on the configurator at its own address, with the reference the app gave it.
 */
export async function startAQuote(page: Page): Promise<string> {
  await throughTheDoor(page)
  return pickAndStart(page, DEEPEST.table.id, MODEL)
}

/** Raise the rung decision from the build, and arrive on the sheet. Returns the rung's own label. */
export async function raiseTheRung(page: Page): Promise<string> {
  const other = page.getByRole('button', { name: /^See what .* does$/ }).first()
  await expect(other).toBeVisible()
  const label = (await other.innerText()).replace(/^See what /, '').replace(/ does$/, '')
  await other.click()
  await expect(page).toHaveURL(/\/cascade\?/)
  await expect(page.getByTestId('cascade')).toBeVisible()
  return label
}

/** Address the draft and give it to the customer, on the build. */
export async function issueIt(page: Page, who: string = CUSTOMER): Promise<void> {
  await page.getByRole('button', { name: /Who it is for/ }).click()
  await page.getByLabel(/Who the quote is addressed to/).fill(who)
  await page.getByRole('button', { name: /Address this quote|Save the name/ }).click()
  await expect(page.getByTestId('last-step')).toContainText(who)

  await page.getByRole('button', { name: /The finale/ }).click()
  await page.getByRole('button', { name: 'Give it to the customer' }).click()
  await expect(page.getByTestId('configurator')).toContainText('given to the customer')
}

/**
 * Open the sheet the customer keeps, by pressing the control the finale offers rather than
 * by typing its address: a press goes through the router with the document in memory, which
 * is how a dealer gets here and is not racing the write-behind.
 */
export async function openTheDocument(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open the document' }).first().click()
  await expect(page).toHaveURL(/\/quote\/[^/]+\/document$/, { timeout: 15_000 })
  await expect(page.getByTestId('document')).toBeVisible()
  /* the page assignment is made in a layout effect, so `of N` on the
     foot is the proof it ran */
  await expect(page.locator('.doc-page__foot').first()).toContainText(/Page 1 of \d+/)
}
