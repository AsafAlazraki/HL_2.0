/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- the measure runs INSIDE the page:
   Playwright serialises it and evaluates it with no closure, so its helpers cannot be hoisted
   out of it (the overlap ruler's measure says the same). */
import type { Page } from '@playwright/test'

/* ============================================================
   WHAT STANDS ACROSS THE TAB BAR'S TOP EDGE, AT REST, IN A HAND.

   Added 2026-10-21 for refine-critique.md, major 5: at 390 × 844 the
   picker's "from $2,770", the build's "$25,355", Customers' "Given ·
   today" and Data's "Yamaha Outboards" each stood half over the tab
   bar and half under it with nothing scrolled. The overlap ruler
   passes that, on purpose and for a reason it writes down: a scroll
   frees them. What the owner sees is the half that shows. So the
   build, the picker, Customers and Data each end their first window on
   a seam, and their flows ask this: is any line of the screen's own
   words, or any picture, begun above the bar's top edge and ended
   under it.

   Read off the page, never a figure about the shell: the bar is the
   pill's own box, and where the pill is not at the foot of the window
   there is no bar to stand across and the answer is empty. What a
   person cannot see is not counted: an element hidden, transparent,
   or clipped out of its scroller, and a box under 2px (a label kept
   for a reader).
   ============================================================ */
export function acrossTheBar(page: Page, screen: string): Promise<string[]> {
  return page.evaluate((selector) => {
    const pill = document.querySelector('[data-testid="shell-pill"]')?.getBoundingClientRect()
    const root = document.querySelector(selector)
    if (!pill || !root || pill.top + pill.height / 2 < innerHeight / 2) return []
    const edge = pill.top
    const seen = (el: Element, r: DOMRect): boolean => {
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false
      for (let at = el.parentElement; at && at !== document.body; at = at.parentElement) {
        const style = getComputedStyle(at)
        if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
        const box = at.getBoundingClientRect()
        if (r.bottom <= box.top + 2 || r.top >= box.bottom - 2) return false
      }
      return true
    }
    const across = (r: DOMRect): boolean =>
      r.height > 2 && r.width > 2 && r.top < edge - 2 && r.bottom > edge + 2
    const faults: string[] = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const words = node.textContent?.trim() ?? ''
      const el = node.parentElement
      if (words === '' || !el) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const r of range.getClientRects())
        if (across(r) && seen(el, r))
          faults.push(`"${words.slice(0, 40)}" at ${Math.round(r.top)}–${Math.round(r.bottom)}`)
    }
    for (const el of root.querySelectorAll('img, svg, video, canvas, [role="img"]')) {
      const r = el.getBoundingClientRect()
      if (across(r) && seen(el, r))
        faults.push(`a ${el.tagName.toLowerCase()} at ${Math.round(r.top)}–${Math.round(r.bottom)}`)
    }
    return faults.map((f) => `${f}, across the bar's edge at ${Math.round(edge)}`)
  }, screen)
}
