import { describe, expect, it } from 'vitest'
import { browserStorage, createPrefsStore, PREFIX, type StorageLike } from './prefs'

/* A Map-backed store with the five calls prefs makes, so the suite
   never needs a browser. `failing` makes every write throw, which is
   what a full disk or a refusing private window does. */
function fakeStorage(
  seed: Record<string, string> = {},
  failing = false,
): StorageLike & {
  map: Map<string, string>
} {
  const map = new Map(Object.entries(seed))
  return {
    map,
    get length() {
      return map.size
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      if (failing) throw new Error('QuotaExceededError')
      map.set(k, v)
    },
    removeItem: (k) => {
      if (failing) throw new Error('refused')
      map.delete(k)
    },
  }
}

describe('prefs', () => {
  it('writes under the hl2. prefix as JSON and reads back the value', () => {
    const storage = fakeStorage()
    const prefs = createPrefsStore(storage)
    prefs.getState().set('sheet.collapsed', ['pricing'])
    expect(storage.map.get(`${PREFIX}sheet.collapsed`)).toBe('["pricing"]')
    expect(prefs.getState().get('sheet.collapsed')).toEqual(['pricing'])
    expect(prefs.getState().persistent).toBe(true)
  })

  it('hydrates from what is already stored under the prefix, skipping foreign keys and non-JSON', () => {
    const storage = fakeStorage({
      [`${PREFIX}tab`]: '"quotes"',
      [`${PREFIX}broken`]: '{not json',
      'somebody-else.key': '"theirs"',
      hl2: '"no dot, not ours"',
    })
    const prefs = createPrefsStore(storage)
    expect(prefs.getState().values).toEqual({ tab: 'quotes' })
  })

  it('removes one pref', () => {
    const storage = fakeStorage()
    const prefs = createPrefsStore(storage)
    prefs.getState().set('a', 1)
    prefs.getState().set('b', 2)
    prefs.getState().remove('a')
    expect(prefs.getState().values).toEqual({ b: 2 })
    expect(storage.map.has(`${PREFIX}a`)).toBe(false)
    expect(storage.map.has(`${PREFIX}b`)).toBe(true)
  })

  it('forgetAll sweeps every hl2. key and nothing else', () => {
    const storage = fakeStorage({ 'other-app.keep': '1', [`${PREFIX}old`]: '1' })
    const prefs = createPrefsStore(storage)
    prefs.getState().set('a', true)
    prefs.getState().set('b', { nested: [1, 2] })
    prefs.getState().forgetAll()
    expect(prefs.getState().values).toEqual({})
    expect([...storage.map.keys()]).toEqual(['other-app.keep'])
  })

  it('works with no storage at all: values live for the tab, persistent is false', () => {
    const prefs = createPrefsStore(null)
    expect(prefs.getState().persistent).toBe(false)
    prefs.getState().set('a', 'kept in memory')
    expect(prefs.getState().get('a')).toBe('kept in memory')
    prefs.getState().remove('a')
    prefs.getState().forgetAll()
    expect(prefs.getState().values).toEqual({})
  })

  it('survives a storage that refuses writes: the value is kept and persistent turns false', () => {
    const storage = fakeStorage({}, true)
    const prefs = createPrefsStore(storage)
    expect(prefs.getState().persistent).toBe(true)
    prefs.getState().set('a', 1)
    expect(prefs.getState().get('a')).toBe(1)
    expect(prefs.getState().persistent).toBe(false)
    expect(() => prefs.getState().remove('a')).not.toThrow()
    expect(() => prefs.getState().forgetAll()).not.toThrow()
  })

  it('finds no browser storage in node', () => {
    expect(browserStorage()).toBeNull()
  })

  it('notifies subscribers like any store', () => {
    const prefs = createPrefsStore(null)
    const seen: unknown[] = []
    prefs.subscribe((s) => seen.push(s.values.tab))
    prefs.getState().set('tab', 'home')
    expect(seen).toEqual(['home'])
  })
})
