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

/**
 * WHETHER A STICKY ELEMENT STANDS STUCK AT ITS OWN `top`, written on it as `data-stuck`, so the
 * band between it and the window's head can be covered while it stands there and only then: at
 * its natural place, under the part before it, the band is that part (the verifier of Settings,
 * 2026-11-04: cut cards showed in the 50–80px between the pill and the stage, and between the pill
 * and the index in a hand). Stuck is read off the element's own place: at its `top`, and further
 * from the part before it than the gap its parent keeps.
 */
export function useStuck(el: HTMLElement | null, on: boolean): void {
  useEffect(() => {
    if (!el || typeof window === 'undefined') return
    if (!on) {
      el.removeAttribute('data-stuck')
      return
    }
    let frame = 0
    const read = (): void => {
      frame = 0
      const style = getComputedStyle(el)
      if (style.position !== 'sticky') {
        el.removeAttribute('data-stuck')
        return
      }
      const top = parseFloat(style.top)
      const box = el.getBoundingClientRect()
      const before = el.previousElementSibling?.getBoundingClientRect()
      const parent = el.parentElement ? getComputedStyle(el.parentElement) : null
      const gap = parent ? parseFloat(parent.rowGap) || 0 : 0
      const stuck =
        Number.isFinite(top) &&
        Math.abs(box.top - top) < 1 &&
        (!before || before.bottom < box.top - gap - 1)
      el.toggleAttribute('data-stuck', stuck)
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
      el.removeAttribute('data-stuck')
    }
  }, [el, on])
}

/**
 * THE CONTROL JUST PRESSED, AND THE CONTROLS OF ITS OWN PART, STAND CLEAR OF THE UNDO IT RAISED:
 * once the step's toast stands, the page is scrolled up by what of that part the toast covers, so
 * the step's own effect and its neighbours are seen while its Undo stands (the verifier of
 * Settings, 2026-11-04: at 1280 the toast stood over Motion after Shadow was pressed, and over the
 * colour field and Pick). Never so far that the press itself goes under what stands at the
 * window's head; nothing moves where nothing is covered. Two frames on, when the toast has its
 * place.
 */
export function clearOfTheToast(): void {
  if (typeof window === 'undefined' || typeof requestAnimationFrame !== 'function') return
  const pressed = document.activeElement
  if (!(pressed instanceof HTMLElement) || pressed === document.body) return
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (!pressed.isConnected) return
      const toasts = [...document.querySelectorAll('[data-sonner-toast]')].map((t) =>
        t.getBoundingClientRect(),
      )
      if (toasts.length === 0) return
      const part = pressed.closest('.mg-editor, .mg-group, .mg-person') ?? pressed
      const controls = [
        pressed,
        ...part.querySelectorAll<HTMLElement>(
          'button, input, textarea, select, a[href], [role="switch"], [role="radio"]',
        ),
      ]
      let need = 0
      for (const c of controls) {
        const a = c.getBoundingClientRect()
        if (a.width === 0 || a.height === 0) continue
        for (const t of toasts)
          if (a.right > t.left && a.left < t.right && a.bottom > t.top - 8 && a.top < t.bottom)
            need = Math.max(need, a.bottom - t.top + 16)
      }
      if (need <= 0) return
      /* what stands at the window's head: the pill, the stage or the index while it stands */
      let roof =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--shell-inset')) ||
        0
      for (const head of document.querySelectorAll('[data-stuck]'))
        roof = Math.max(roof, head.getBoundingClientRect().bottom)
      const most = pressed.getBoundingClientRect().top - roof - 16
      const by = Math.min(need, most)
      if (by > 0) window.scrollBy({ top: by, behavior: 'instant' })
    }),
  )
}
