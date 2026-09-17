/**
 * Binding the vanilla stores to React, in one place.
 *
 * The four stores in `src/state` are vanilla zustand: they are created outside React so the
 * pure domain and the node test suites can drive them without a renderer. React reads them
 * through zustand's own `useStore`, which is the sanctioned subscription. Nothing here hand
 * rolls `useSyncExternalStore`; `tools/check.ts` refuses that, and the reason is the old app,
 * which had twenty-nine hand-rolled external stores and no single place to look when a screen
 * did not update.
 */
import { useStore } from 'zustand'
import { catalogue, type CatalogueState } from '@/state/catalogue'
import { session, type SessionState } from '@/state/session'
import { prefs, type PrefsState } from '@/state/prefs'

export function useCatalogue<T>(select: (state: CatalogueState) => T): T {
  return useStore(catalogue, select)
}

export function useSession<T>(select: (state: SessionState) => T): T {
  return useStore(session, select)
}

export function usePrefs<T>(select: (state: PrefsState) => T): T {
  return useStore(prefs, select)
}
