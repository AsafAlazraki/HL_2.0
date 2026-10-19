import { useEffect } from 'react'
import type { Crest } from '@/domain/shell/crest'

/* ============================================================
   THE TAB WEARS THE CREST.

   `/favicon.ico` answered 404 on every load and `index.html` declared
   no icon, so Northside's tab wore the browser's blank globe beside
   "HelmLogic" (components-critique-2 minor 19, build-close-critique
   minor 19). The pill's crest is the one mark this app draws, so the
   tab draws the same one: the business's initials in a roundel on the
   accent once the file names the business, the helm this app is named
   for until then. One identity, in the pill and in the tab, and when
   `crestOf` changes its drawing the tab changes with it.

   IN THE TOKENS' OWN INKS. A favicon is a picture the browser draws
   outside the page, where no stylesheet reaches, so the roundel is
   written as an SVG with its colours read off the page's tokens at the
   moment it is drawn (`--color-accent`, `--color-ink-on-accent`,
   `--font-sans`) and redrawn when the theme changes them. No colour is
   written here. `index.html` declares an empty icon, so the browser
   asks for no `/favicon.ico` before this runs.
   ============================================================ */

/** The inks the tab's roundel is drawn in, as the page's tokens resolve them. */
export interface TabInks {
  ground: string
  ink: string
  face: string
}

/** THE HELM, as `Pill.tsx` draws it in the crest: the same spokes, rim and hub on a 24 grid. */
const HELM =
  '<path d="M12 2.5v19M2.5 12h19M5.28 5.28l13.44 13.44M18.72 5.28 5.28 18.72" fill="none" stroke-width="1.8" stroke-linecap="round"/>' +
  '<circle cx="12" cy="12" r="6.2" fill="none" stroke-width="1.8"/>' +
  '<circle cx="12" cy="12" r="2.1" stroke="none"/>'

/** A string set inside an SVG attribute or text, with nothing in it that could end either. */
const escaped = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * The crest as an SVG document: a roundel in the accent, a hairline ring inside its edge as the
 * pill's crest wears one, and the initials or the helm in the ink that stands on the accent.
 */
export function tabIconSvg(crest: Crest, inks: TabInks): string {
  const ground = escaped(inks.ground)
  const ink = escaped(inks.ink)
  const mark =
    crest.kind === 'initials'
      ? `<text x="32" y="33" text-anchor="middle" dominant-baseline="central" font-size="${
          crest.initials.length > 1 ? 27 : 34
        }" font-weight="700" letter-spacing="1" fill="${ink}" style="font-family: ${escaped(
          inks.face,
        )}">${escaped(crest.initials)}</text>`
      : `<g transform="translate(12 12) scale(1.6667)" stroke="${ink}" fill="${ink}">${HELM}</g>`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<circle cx="32" cy="32" r="32" fill="${ground}"/>` +
    `<circle cx="32" cy="32" r="27.5" fill="none" stroke="${ink}" stroke-opacity=".55" stroke-width="1.5"/>` +
    mark +
    `</svg>`
  )
}

/** The SVG as an address a `<link rel="icon">` can carry. */
export const tabIconHref = (crest: Crest, inks: TabInks): string =>
  `data:image/svg+xml,${encodeURIComponent(tabIconSvg(crest, inks))}`

/** THE DEALERSHIP'S OWN MARK, when `--shell-crest` names one (docs/CUSTOMISATION.md, layer 2).
 *  The pill's crest draws it over the band, so the tab carries the same picture rather than the
 *  initials under it. The token resolves to `none` in the seeded case, and that is no mark. */
export function markOfCrest(backgroundImage: string): string | null {
  const url = /^url\((["']?)(.+)\1\)$/.exec(backgroundImage.trim())
  return url ? url[2]! : null
}

/** What a token resolves to on this page, read through a probe so a `var()` chain and a
 *  relative colour arrive as the colour the browser would paint. */
function inksOfPage(): (TabInks & { mark: string | null }) | null {
  const body = document.body as HTMLElement | null
  if (!body) return null
  const probe = document.createElement('span')
  probe.hidden = true
  body.append(probe)
  try {
    probe.style.color = 'var(--color-accent)'
    const ground = getComputedStyle(probe).color
    probe.style.color = 'var(--color-ink-on-accent)'
    const ink = getComputedStyle(probe).color
    probe.style.backgroundImage = 'var(--shell-crest)'
    const mark = markOfCrest(getComputedStyle(probe).backgroundImage)
    const face = getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim()
    return ground && ink ? { ground, ink, face: face || 'sans-serif', mark } : null
  } finally {
    probe.remove()
  }
}

/** THE TAB'S ICON, KEPT TO THE CREST: drawn when the crest is, and again when the theme or a
 *  dealership's own appearance changes the tokens it is drawn in. */
export function useTabIcon(crest: Crest): void {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const draw = (): void => {
      const inks = inksOfPage()
      if (!inks) return
      let link = document.head.querySelector<HTMLLinkElement>('link[rel~="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.append(link)
      }
      /* the dealership's own picture where it has one, as its own type; the roundel otherwise */
      if (inks.mark) link.removeAttribute('type')
      else link.type = 'image/svg+xml'
      const href = inks.mark ?? tabIconHref(crest, inks)
      if (link.getAttribute('href') !== href) link.setAttribute('href', href)
    }
    draw()
    const watch = new MutationObserver(draw)
    watch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style', 'class'],
    })
    return () => watch.disconnect()
  }, [crest])
}
