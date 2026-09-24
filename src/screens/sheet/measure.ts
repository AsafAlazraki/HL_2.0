/* ============================================================
   HOW WIDE A SPINE'S WORDS ARE DRAWN — read off the browser, in the
   faces the spine draws them in, so `packFacts` lays whole facts into
   the width a line really has. The critique measured six of eighteen
   spine lines cut with an ellipsis at 1440 × 900 (built-critique-m2-
   close.md §10); a line laid out by guesswork is what cut them, so the
   width is the browser's own.

   ONE PROBE, OUT OF THE FLOW. A hidden span inside the sheet's own
   root, so it inherits the sheet's face and its tabular figures; its
   `data-face` gives it the size and weight of the part it stands in
   for (`sheet.css`, `.sh-probe`), and every reading is kept, because a
   spine's facts repeat from model to model. Until the probe has a box —
   the first paint, and a document with no layout (the unit tests) —
   every width reads 0 and every fact fits, which is how the spine was
   drawn before it was measured at all; the probe's arrival draws again.
   ============================================================ */
import { useCallback, useMemo, useRef, useState } from 'react'

/** The faces a spine draws words in — `sheet.css` gives each the same size and weight. */
export type Face = 'fact' | 'figures' | 'name' | 'shut' | 'count'

export type Measure = (text: string, face: Face) => number

/** Every reading a probe has taken, kept for as long as the probe stands. */
const readings = new WeakMap<HTMLElement, Map<string, number>>()

function read(el: HTMLSpanElement, text: string, face: Face): number {
  let kept = readings.get(el)
  if (!kept) {
    kept = new Map()
    readings.set(el, kept)
  }
  const key = `${face}\u0000${text}`
  const known = kept.get(key)
  if (known !== undefined) return known
  el.dataset.face = face
  el.textContent = text
  /* a pixel over, rounded up: a line the browser draws a fraction wider
     than the reading is a line it cuts */
  const w = Math.ceil(el.getBoundingClientRect().width) + 1
  /* and nothing is left in it for a reader or a ruler to find */
  el.textContent = ''
  kept.set(key, w)
  return w
}

export function useMeasure(): { probe: (el: HTMLSpanElement | null) => void; measure: Measure } {
  const node = useRef<HTMLSpanElement | null>(null)
  const [arrived, setArrived] = useState(0)
  const probe = useCallback((el: HTMLSpanElement | null) => {
    if (node.current === el) return
    node.current = el
    setArrived((n) => n + 1)
  }, [])
  const measure = useMemo((): Measure => {
    const at = arrived
    return (text, face) => {
      const el = node.current
      return !el || at === 0 || text === '' ? 0 : read(el, text, face)
    }
  }, [arrived])
  return { probe, measure }
}
