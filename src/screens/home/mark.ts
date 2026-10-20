/* ============================================================
   NORTHSIDE'S OWN MARK — THE SLOT HOME'S SHOWPIECE STANDS IN.

   The owner: "I want the logo to be the showpiece thing." The judge of
   2026-10-20, of every board: "the showpiece is a word, not
   Northside's mark", and before Home is built the organisation's mark
   needs a place to be added. This is that place, read in the order the
   customisation layers override one another (docs/CUSTOMISATION.md):

     1. THE ORGANISATION'S OWN, `--org-mark` — layer 2, the dealership's
        appearance, an `url(...)` set on the root. It wins.
     2. THE PACK'S, a white-ink mark the marks ledger holds under the
        business's own name, with its provenance beside it, exactly as
        every maker's mark is held (`./ledgers.ts`, `markFor`).
     3. NONE — the seeded case. No file of Northside's logo is held in
        this repository, and none is drawn in its place: Home sets the
        name in type, at the mark's own size (`--text-mark`).

   THE MARK STANDS ON THE WATER, so it is asked for in white ink: the
   ledger's `dark` ground answers with a maker's white variant, and the
   organisation's token is declared as the white-ink wordmark.

   READ ONCE PER MOUNT AND AGAIN WHEN THE THEME OR THE ROOT'S STYLE
   CHANGES, the way the tab's icon reads the crest (`src/screens/shell/
   tab.ts`): through a probe, so a `var()` chain arrives as the address
   the browser would paint.
   ============================================================ */
import { useEffect, useState } from 'react'
import { markOfCrest } from '@/screens/shell/tab'
import { markFor } from './ledgers'

/** The picture that stands where the name would, and what it says. */
export interface OrgMark {
  src: string
  /** the business, which is what the mark says */
  alt: string
  /** the held copy's own size, where the ledger records it */
  width?: number
  height?: number
  /** where it came from: the organisation's appearance, or the pack */
  from: 'organisation' | 'pack'
}

/** The address `--org-mark` resolves to on this page, or null. */
function tokenMark(): string | null {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return null
  const body = document.body as HTMLElement | null
  if (!body) return null
  const probe = document.createElement('span')
  probe.hidden = true
  body.append(probe)
  try {
    probe.style.backgroundImage = 'var(--org-mark)'
    return markOfCrest(getComputedStyle(probe).backgroundImage)
  } finally {
    probe.remove()
  }
}

/** The pack's own mark for the business, in white ink, or null. */
export function packMark(business: string | null): OrgMark | null {
  if (!business) return null
  const choice = markFor(business, 'dark')
  if (!choice.drawn) return null
  return {
    src: choice.mark.src,
    alt: business,
    width: choice.mark.width,
    height: choice.mark.height,
    from: 'pack',
  }
}

/** Northside's mark, by the three layers, or null where none is held. */
export function useOrgMark(business: string | null): OrgMark | null {
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    const read = (): void => setToken(tokenMark())
    read()
    const watch = new MutationObserver(read)
    watch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style', 'class'],
      childList: false,
    })
    /* the organisation's layer is a <style> element written into the head */
    const head = new MutationObserver(read)
    head.observe(document.head, { childList: true, subtree: true, characterData: true })
    return () => {
      watch.disconnect()
      head.disconnect()
    }
  }, [])
  if (!business) return null
  if (token) return { src: token, alt: business, from: 'organisation' }
  return packMark(business)
}
