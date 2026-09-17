/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs
   INSIDE the page: Playwright serialises it and evaluates it with no closure, so its helpers
   cannot be hoisted out of it without breaking at runtime. */

/* ============================================================
   cut — no word is sliced in half.

   Two different things look alike in a screenshot and are not alike at
   all:

     AN ELISION is a decision. `text-overflow: ellipsis` ends a run at
     a character boundary and prints `…`, so a reader knows there is
     more and can go and get it. A register full of long model names
     needs them. They are counted and printed here, never failed.

     A CUT is an accident. The box clips its content with no ellipsis
     and no scroll, so a glyph is sliced down the middle and the reader
     is not told. `Assault Pr` reads as a model that does not exist.
     That is what this ruler fails on.

   It measures both axes. A single line cut at the right edge and a
   three-line paragraph whose third line is clipped by a fixed height
   are the same defect wearing different clothes, and the second is the
   one that survives a design review.

   The arithmetic is `scrollWidth - clientWidth` against the computed
   `overflow`, and the difference between a cut and an elision is one
   property lookup. `fixture.spec.ts` plants one of each, in both axes,
   because a ruler that has only ever reported zero has not been shown
   to know the difference.
   ============================================================ */

export interface Cut {
  text: string
  tag: string
  cls: string
  axis: 'across' | 'down'
  by: number
}

export interface CutSweep {
  measured: number
  elided: number
  cuts: Cut[]
}

export function findCuts(): CutSweep {
  const ownText = (el: Element): string => {
    let s = ''
    for (const n of el.childNodes) if (n.nodeType === 3) s += (n as Text).data
    return s.trim()
  }

  const cuts: Cut[] = []
  let measured = 0
  let elided = 0

  for (const el of document.querySelectorAll('*')) {
    const t = ownText(el)
    if (!t) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.display === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    measured++

    /* An ellipsis is an elision, and an elision is a decision. Both
       the classic `ellipsis` and the line-clamp form count. */
    const clamp = cs.getPropertyValue('-webkit-line-clamp') || cs.getPropertyValue('line-clamp')
    const ellipsis = cs.textOverflow === 'ellipsis' || (clamp !== '' && clamp !== 'none')

    const across = el.scrollWidth - el.clientWidth
    const down = el.scrollHeight - el.clientHeight
    const clipsX = cs.overflowX === 'hidden' || cs.overflowX === 'clip'
    const clipsY = cs.overflowY === 'hidden' || cs.overflowY === 'clip'

    if (across > 1 && clipsX) {
      if (ellipsis) elided++
      else
        cuts.push({
          text: t.slice(0, 48),
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') || '').slice(0, 40),
          axis: 'across',
          by: Math.round(across),
        })
    }
    if (down > 1 && clipsY) {
      if (ellipsis) elided++
      else
        cuts.push({
          text: t.slice(0, 48),
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') || '').slice(0, 40),
          axis: 'down',
          by: Math.round(down),
        })
    }
  }
  return { measured, elided, cuts }
}
