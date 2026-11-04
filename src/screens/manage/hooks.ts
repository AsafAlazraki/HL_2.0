/* ============================================================
   TWO SMALL READINGS OF THE WINDOW, for Settings alone: whether it is a
   desk (the two halves side by side, the stage standing beside its
   choices, the quote's own pages drawn), and which part of the page a
   person is reading, for the index's lit word in a hand.
   ============================================================ */

import { useEffect, useState } from 'react'

/** The width the two halves stand side by side from (manage.css, "A DESK"). */
export const DESK = '(min-width: 1200px)'

/** Whether the window matches; a window with no `matchMedia` (a test) is a narrow one. */
export function useMedia(query: string): boolean {
  const [hit, setHit] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const q = window.matchMedia(query)
    const on = (): void => setHit(q.matches)
    on()
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [query])
  return hit
}

/**
 * THE PART BEING READ: the last of these sections whose head has passed under `edge` (a selector
 * for the bar the index stands in), read on scroll, once a frame. The first where none has.
 */
export function useReading(ids: readonly string[], edge: string, on: boolean): string | null {
  const [at, setAt] = useState<string | null>(null)
  useEffect(() => {
    if (!on || typeof window === 'undefined') return
    let frame = 0
    const read = (): void => {
      frame = 0
      const bar = document.querySelector(edge)?.getBoundingClientRect()
      const line = (bar ? bar.bottom : 0) + 24
      let current: string | null = ids[0] ?? null
      let passed = false
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const box = el.getBoundingClientRect()
        /* between two parts (the water's head and its stage), the next part down is lit */
        if (box.top <= line || passed) {
          current = id
          passed = box.top <= line && box.bottom < line
          if (!passed && box.top > line) break
        }
      }
      setAt((was) => (was === current ? was : current))
    }
    const soon = (): void => {
      if (frame === 0) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', soon, { passive: true })
    window.addEventListener('resize', soon)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', soon)
      window.removeEventListener('resize', soon)
    }
  }, [ids, edge, on])
  return at
}

/** AN ELEMENT'S OWN HEIGHT, written on the root as a custom property while it stands, so a rule
 *  elsewhere (the toaster's lift, a part's landing margin) can keep clear of it. */
export function useHeightOnRoot(el: HTMLElement | null, name: string): void {
  useEffect(() => {
    if (!el || typeof document === 'undefined') return
    const root = document.documentElement
    const write = (): void => root.style.setProperty(name, `${el.offsetHeight}px`)
    write()
    const watch = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(write)
    watch?.observe(el)
    return () => {
      watch?.disconnect()
      root.style.removeProperty(name)
    }
  }, [el, name])
}
