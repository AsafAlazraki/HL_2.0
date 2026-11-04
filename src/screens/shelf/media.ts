import { useEffect, useState } from 'react'

/* ============================================================
   WHETHER THE WINDOW IS WIDE ENOUGH FOR A LAYOUT THAT IS NOT ONLY
   STYLE: the change sheet draws a table from 1,200px and cards below,
   and how many figures stand as their own columns depends on the
   width. A window with no `matchMedia` (a test) is a narrow one.
   ============================================================ */
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
