import type { PrefValue, PrefsStore } from '@/state/prefs'

/* ============================================================
   THE THEME — day unless a person chose night.

   PLAN.md's standing rule: "Blue and white was the brief… dark mode is
   offered, not default". src/styles/tokens.css declares the day as the
   tokens themselves and the night as a narrower scope over the same
   names, `:root[data-theme='night']`, so a screen never knows which
   theme it is in. This is the one place that decides which scope is on.

   THE CHOICE IS A PREF, because it is a per-browser convenience and
   nothing a second person needs (src/state/prefs.ts says what belongs
   there). Nothing in the app writes it yet: the control that offers it
   is the appearance panel docs/CUSTOMISATION.md describes. What IS here
   is the part that makes an offer honest — a chosen night is on at the
   first paint after boot, and anything but the exact word `night` is
   the day, so a stale or foreign value can never darken the app.
   ============================================================ */

/** The pref key, under the store's own prefix. */
export const THEME_KEY = 'theme'

export type Theme = 'day' | 'night'

/** What a stored value means. Only the exact word chooses night. */
export function themeOf(value: PrefValue | undefined): Theme {
  return value === 'night' ? 'night' : 'day'
}

/** The part of <html> this touches, so a test can hand in a plain object. */
export interface ThemeRoot {
  dataset: DOMStringMap
  style: { colorScheme: string }
}

/** Put the theme on the root, now and whenever the pref changes. Day removes the attribute
 *  rather than writing `day`, so the tokens' own defaults are what a page with no choice
 *  reads. `color-scheme` follows, which is what the browser draws its own scrollbars and
 *  form controls from. Returns the unsubscribe. */
export function bindTheme(root: ThemeRoot, store: PrefsStore): () => void {
  let shown: Theme | null = null
  const apply = (): void => {
    const theme = themeOf(store.getState().get(THEME_KEY))
    if (theme === shown) return
    shown = theme
    if (theme === 'night') root.dataset.theme = 'night'
    else delete root.dataset.theme
    root.style.colorScheme = theme === 'night' ? 'dark' : 'light'
  }
  apply()
  return store.subscribe(apply)
}
