/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs
   INSIDE the page: Playwright serialises it and evaluates it with no closure, so its helpers
   cannot be hoisted out of it without breaking at runtime. */
import { expect, test } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'

/* ============================================================
   overlap — nothing is painted on top of anything else at 1440×900.

   The failure this catches is a sentence printed across another
   sentence: a label that grew, a figure that did not have room, a
   two-column layout that collapsed one column onto the other. It is
   the cheapest of the visual failures to find automatically and the
   most embarrassing to find in front of a customer.

   WHAT IS AND IS NOT AN OVERLAP, stated before the first measurement,
   because a naive box-intersection test reports hundreds of them and
   is then ignored:

     - Only elements that hold their OWN text are compared. A card's
       box contains its text by design; two runs of text sharing pixels
       do not.
     - An ancestor and its descendant are never a pair. `<p>Hull only
       <b>$20,900</b></p>` is one sentence, and the bold sits inside
       the paragraph's box by construction.
     - Anything inside a positioned layer — `position: absolute`,
       `fixed` or `sticky`, or a descendant of one — is set aside. A
       menu, a tooltip, a dialog and a sticky header are DELIBERATELY
       over what they cover; that is what they are for. They are
       counted so the exemption stays legible.
     - The intersection must be real: more than 25% of the smaller
       box, and at least 2px on both axes. A one-pixel kiss between two
       adjacent baselines is subpixel layout, not a defect.
   ============================================================ */

interface Pair {
  a: string
  b: string
  area: number
}

interface Overlaps {
  leaves: number
  layered: number
  pairs: Pair[]
}

function findOverlaps(): Overlaps {
  const describe = (el: Element): string => {
    const cls = (el.getAttribute('class') || '').slice(0, 30)
    let s = ''
    for (const n of el.childNodes) if (n.nodeType === 3) s += (n as Text).data
    return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''} "${s.trim().slice(0, 32)}"`
  }
  const ownText = (el: Element): string => {
    let s = ''
    for (const n of el.childNodes) if (n.nodeType === 3) s += (n as Text).data
    return s.trim()
  }
  const layered = (el: Element): boolean => {
    for (let n: Element | null = el; n; n = n.parentElement) {
      const p = getComputedStyle(n).position
      if (p === 'absolute' || p === 'fixed' || p === 'sticky') return true
    }
    return false
  }

  const leaves: { el: Element; r: DOMRect }[] = []
  let layeredCount = 0
  for (const el of document.querySelectorAll('*')) {
    if (!ownText(el)) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.display === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    if (layered(el)) {
      layeredCount++
      continue
    }
    leaves.push({ el, r })
  }

  const pairs: Pair[] = []
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i]!
      const b = leaves[j]!
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)
      if (w <= 2 || h <= 2) continue
      const smaller = Math.min(a.r.width * a.r.height, b.r.width * b.r.height)
      const area = w * h
      if (area <= smaller * 0.25) continue
      pairs.push({ a: describe(a.el), b: describe(b.el), area: Math.round(area) })
    }
  }
  return { leaves: leaves.length, layered: layeredCount, pairs }
}

test.describe('overlap', () => {
  /* Measured once, at the width the plan names for this ruler, by skipping
     everywhere else rather than by forcing a viewport: a forced viewport
     would run the same measurement twice and report it twice. */
  test.skip(({ viewport }) => viewport?.width !== 1440, 'measured at 1440×900')

  for (const route of routes) {
    test(`nothing overlaps — ${route.name}`, async ({ page }) => {
      await open(page, route)
      const r = await page.evaluate(findOverlaps)
      console.log(
        `  ${route.name.padEnd(12)} ${String(r.leaves).padStart(4)} runs of text compared, ${r.layered} in positioned layers set aside, ${r.pairs.length} overlapping`,
      )
      for (const p of r.pairs.slice(0, 10)) console.log(`      ${p.area}px²  ${p.a}  ×  ${p.b}`)
      expect(r.leaves, 'the route rendered text to compare').toBeGreaterThan(0)
      expect(r.pairs.map((p) => `${p.a} × ${p.b}`)).toEqual([])
    })
  }
})
