import { createStore, type StoreApi } from 'zustand/vanilla'

/* ============================================================
   PREFS — THE ONE PLACE THAT TOUCHES THE BROWSER'S KEY-VALUE STORE.

   The old app had sixteen modules writing localStorage on their own
   keys — quotes, rules, the sales board, a seed stamp — and a wiped
   project came back carrying the previous business entire, because
   the wipe emptied the database and not the sixteen. Here exactly
   one module reads and writes it, every key sits under one prefix,
   and `forgetAll()` sweeps the prefix. `tools/check.ts` fails the
   build on `localStorage` anywhere else in `src/`.

   WHAT BELONGS HERE: per-browser conveniences — a remembered tab, a
   collapsed band, the name given at the door. WHAT NEVER DOES: a
   quote, a rule, a row, anything a second person or a second device
   would need. Those are records and they go through the repository.

   SAFE WITHOUT STORAGE. Node has none, a private window may refuse
   one, and a full disk throws on write. In every such case the store
   keeps working for the life of the tab and `persistent` says false,
   so a screen can say "this will not be remembered" instead of
   failing to open.
   ============================================================ */

export const PREFIX = 'hl2.'

/** What a pref may hold: JSON, so a value survives the round trip
 *  through the string store unchanged. */
export type PrefValue =
  string | number | boolean | null | PrefValue[] | { [key: string]: PrefValue }

/** The five calls this module makes of the browser's storage — the
 *  shape of `Storage`, so a test can hand in a Map-backed one. */
export interface StorageLike {
  readonly length: number
  key(index: number): string | null
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface PrefsState {
  /** every pref under the prefix, keyed WITHOUT it */
  values: Readonly<Record<string, PrefValue>>
  /** whether the browser gave us a store; false in node and where
   *  storage is refused. Never a reason to refuse a set. */
  persistent: boolean
  get(key: string): PrefValue | undefined
  set(key: string, value: PrefValue): void
  remove(key: string): void
  /** every pref under the prefix, gone — ours and only ours */
  forgetAll(): void
}

export type PrefsStore = StoreApi<PrefsState>

/** The browser's store, or null where there is none or asking throws
 *  (a document with storage disabled throws on the property itself). */
export function browserStorage(): StorageLike | null {
  try {
    const candidate = (globalThis as { localStorage?: StorageLike }).localStorage
    return candidate && typeof candidate.getItem === 'function' ? candidate : null
  } catch {
    return null
  }
}

/** Everything under the prefix, parsed. A value that is not JSON is
 *  skipped, not repaired: it is either somebody else's or broken, and
 *  neither is ours to rewrite. */
function readAll(storage: StorageLike): Record<string, PrefValue> {
  const out: Record<string, PrefValue> = {}
  try {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i)
      if (!key || !key.startsWith(PREFIX)) continue
      const raw = storage.getItem(key)
      if (raw === null) continue
      try {
        out[key.slice(PREFIX.length)] = JSON.parse(raw) as PrefValue
      } catch {
        /* not JSON — skipped */
      }
    }
  } catch {
    /* storage refused mid-read: what was read stands */
  }
  return out
}

export function createPrefsStore(storage: StorageLike | null): PrefsStore {
  const write = (key: string, value: PrefValue): boolean => {
    if (!storage) return false
    try {
      storage.setItem(PREFIX + key, JSON.stringify(value))
      return true
    } catch {
      /* a full or refusing store: the value lives on in memory */
      return false
    }
  }
  const erase = (key: string): void => {
    try {
      storage?.removeItem(PREFIX + key)
    } catch {
      /* nothing to do: a store that refuses a removal has nothing of ours worth keeping */
    }
  }

  return createStore<PrefsState>()((set, get) => ({
    values: storage ? readAll(storage) : {},
    persistent: storage !== null,
    get: (key) => get().values[key],
    set: (key, value) => {
      const persistent = write(key, value)
      set((s) => ({
        values: { ...s.values, [key]: value },
        persistent: s.persistent && persistent,
      }))
    },
    remove: (key) => {
      erase(key)
      set((s) => {
        const { [key]: _gone, ...rest } = s.values
        return { values: rest }
      })
    },
    forgetAll: () => {
      if (storage) {
        /* collect first: removing while indexing by position skips every second key */
        const ours: string[] = []
        try {
          for (let i = 0; i < storage.length; i += 1) {
            const key = storage.key(i)
            if (key && key.startsWith(PREFIX)) ours.push(key)
          }
        } catch {
          /* what was collected is what gets removed */
        }
        for (const key of ours) {
          try {
            storage.removeItem(key)
          } catch {
            /* a refusing store: the next forgetAll tries again */
          }
        }
      }
      set({ values: {} })
    },
  }))
}

/** The app's prefs, over the browser's store when there is one. */
export const prefs: PrefsStore = createPrefsStore(browserStorage())
