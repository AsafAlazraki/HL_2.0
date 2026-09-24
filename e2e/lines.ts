/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs
   INSIDE the page: Playwright serialises it and evaluates it with no closure, so its helpers
   cannot be hoisted out of it without breaking at runtime. */
import { expect, type Locator, type Page } from '@playwright/test'
import { cardName, escapeRe } from './mint'

/* ============================================================
   THE LINES A NAME IS SET IN, AS THE BROWSER BROKE THEM.

   m2-last-critique.md, minor 8: at 834 the cascade's card read
   "Highfield ADV7 · Hypalon /" over "· Black / Grey / Black", at 1440
   the register's peek "…Black / Grey /" over "/ Black", and a chip
   "Black / Grey /" over "/ White/Blue". A string cannot show that: the
   break is the browser's, made at the width it had. So this reads it
   back the way a reader meets it — each character's own box, off a
   Range, a new line wherever a box starts below the one before it —
   and it reads each of the name's parts (`jointsOf`,
   src/domain/quote/wrap.ts) the same way, with whether that part is as
   wide as the line it stands in.
   ============================================================ */

export interface SetName {
  /** the name's lines, whitespace as a reader reads it */
  lines: string[]
  /** each part of the name drawn as one box: its lines, and whether it is as wide as its line */
  parts: { text: string; lines: number; full: boolean }[]
}

/** Every element's name, read back line by line; `part` is the selector of its parts' boxes. */
export async function setNames(names: Locator, part: string): Promise<SetName[]> {
  return names.evaluateAll((all, selector) => {
    const linesIn = (element: Element): string[] => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      const lines: string[] = []
      let top: number | null = null
      for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        const text = node.textContent ?? ''
        for (let i = 0; i < text.length; i += 1) {
          const range = document.createRange()
          range.setStart(node, i)
          range.setEnd(node, i + 1)
          const box = range.getClientRects()[0]
          if (box === undefined || (box.width === 0 && /\s/.test(text[i] ?? ''))) continue
          if (top === null || box.top - top > box.height / 2) {
            lines.push('')
            top = box.top
          }
          lines[lines.length - 1] += text[i]
        }
      }
      return lines.map((line) => line.replace(/\s+/g, ' ').trim())
    }
    return all.map((name) => ({
      lines: linesIn(name),
      parts: [...name.querySelectorAll(selector)].map((box) => {
        /* the line a part stands in is its nearest box that is not
             inline, less that box's own padding */
        let holder: Element = box.parentElement ?? name
        while (getComputedStyle(holder).display === 'inline' && holder.parentElement)
          holder = holder.parentElement
        const pad = getComputedStyle(holder)
        const line = holder.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight)
        return {
          text: (box.textContent ?? '').replace(/\s+/g, ' '),
          lines: linesIn(box).length,
          full: box.getBoundingClientRect().width >= line - 1,
        }
      }),
    }))
  }, part)
}

/** The lines after the first that open on a "·" or a "/". */
export const openingOnASeparator = (lines: string[]): string[] =>
  lines.slice(1).filter((line) => /^[·/]/.test(line))

/**
 * THE CRITIC'S OWN BOAT, IN A COLOUR THE DECODE NAMES. The walk the finding
 * was made on: a model chosen on the picker by the name its card says, the
 * first of its colours drawn as colour pressed (so its name has a boat, a
 * material and a colourway), and the quote started. Nothing is typed but
 * the model's code, and no colour is named here: the chip is found by its
 * swatches. Arrives on the build at its own address.
 */
export async function startInANamedColour(page: Page, tableId: string, model: string) {
  await page.goto(`/quote/new?brand=${tableId}`)
  await expect(page.getByTestId('picker-counts')).toBeVisible()
  await page.getByLabel(/Find a model/).fill(model)
  await page
    .getByRole('button', { name: new RegExp(`^${escapeRe(cardName(tableId, model))}\\b`) })
    .first()
    .click()
  const panel = page.getByRole('complementary', { name: 'What is chosen' })
  await panel.locator('.picker-chip--colour[data-drawn]').first().click()
  await panel
    .getByRole('button', { name: /Start the quote|Open the draft already standing/ })
    .click()
  await expect(page).toHaveURL(/\/quote\/[^/]+$/, { timeout: 15_000 })
  await expect(page.getByTestId('configurator')).toBeVisible()
}
