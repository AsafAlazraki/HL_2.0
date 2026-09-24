/// <reference lib="dom" />

/* ============================================================
   THE TWO THEMES, AND HOW A RULER WEARS ONE.

   Added 2026-09-24, after the second close's critic measured the
   sentence under a refused act at 1.23 : 1 while the contrast ruler
   reported "0 below threshold" on fourteen routes at six sizes. One of
   the two reasons it could not see it: THE RULER HAD ONLY EVER READ ONE
   THEME. `src/styles/tokens.css` declares the day as the tokens and
   the night as `:root[data-theme='night']` over the same names; the
   night was the default until that morning and the day after it, and
   neither time did a ruler read the other. A rule inked for one theme
   and never turned (src/ui/button.css, "neutral-100 on the ground
   measures 14.95:1") is invisible to a ruler that reads only the theme
   it was right in.

   WHAT WEARING ONE MEANS is exactly what `bindTheme` in
   src/app/theme.ts does to <html> when a person has chosen the night —
   the attribute and `color-scheme`, and nothing else — so the page
   measured is the page that person sees. It is done IN PLACE rather
   than by writing the pref and walking the route again: the tokens are
   the only thing that differ, and a second walk would double every
   ruler's time to measure the same DOM. The function cannot import
   `bindTheme` (it runs inside the page, serialised with no closure),
   so the two lines are repeated here and `refusal.spec.ts` proves they
   took: the room's own token must differ between the two readings, or
   the ruler has measured the day twice and says so.

   A TRANSITION IS FINISHED, NOT WAITED FOR. `.ui-button` eases its
   colour and fill over `--duration-press`; flipping the theme under a
   running ruler would otherwise catch an ink half-way between two
   themes and measure a colour nobody painted.
   ============================================================ */

export const THEMES = ['day', 'night'] as const
export type Theme = (typeof THEMES)[number]

/** Runs IN THE PAGE. Puts `theme` on the root the way the app does, finishes whatever it
 *  set moving, and returns the room's token as computed — the proof the theme took. */
export function wear(theme: Theme): string {
  const root = document.documentElement
  if (theme === 'night') root.dataset.theme = 'night'
  else delete root.dataset.theme
  root.style.colorScheme = theme === 'night' ? 'dark' : 'light'
  const ground = getComputedStyle(root).getPropertyValue('--color-ground').trim()
  for (const moving of document.getAnimations()) {
    try {
      moving.finish()
    } catch {
      /* an infinite animation cannot be finished, and is not a colour change */
    }
  }
  return ground
}
