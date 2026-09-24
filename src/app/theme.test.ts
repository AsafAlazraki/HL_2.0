import { describe, expect, test } from 'vitest'
import { createPrefsStore, type StorageLike } from '@/state/prefs'
import { bindTheme, THEME_KEY, themeOf, type ThemeRoot } from './theme'

function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(seed))
  return {
    get length() {
      return map.size
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  }
}

function root(): ThemeRoot {
  return { dataset: {}, style: { colorScheme: '' } }
}

describe('themeOf', () => {
  test('nothing chosen is the day, which is the brief', () => {
    expect(themeOf(undefined)).toBe('day')
    expect(themeOf(null)).toBe('day')
  })
  test('only the exact word chooses night', () => {
    expect(themeOf('night')).toBe('night')
    expect(themeOf('Night')).toBe('day')
    expect(themeOf('dark')).toBe('day')
    expect(themeOf(true)).toBe('day')
    expect(themeOf(['night'])).toBe('day')
  })
})

describe('bindTheme', () => {
  test('a browser with no choice paints the day: no attribute, a light scheme', () => {
    const r = root()
    bindTheme(r, createPrefsStore(memoryStorage()))
    expect(r.dataset.theme).toBeUndefined()
    expect(r.style.colorScheme).toBe('light')
  })

  test('a night chosen before boot is on at boot', () => {
    const r = root()
    bindTheme(r, createPrefsStore(memoryStorage({ ['hl2.' + THEME_KEY]: '"night"' })))
    expect(r.dataset.theme).toBe('night')
    expect(r.style.colorScheme).toBe('dark')
  })

  test('choosing and unchoosing follows the pref, and unbinding stops it', () => {
    const r = root()
    const store = createPrefsStore(memoryStorage())
    const stop = bindTheme(r, store)
    store.getState().set(THEME_KEY, 'night')
    expect(r.dataset.theme).toBe('night')
    store.getState().remove(THEME_KEY)
    expect(r.dataset.theme).toBeUndefined()
    expect(r.style.colorScheme).toBe('light')
    stop()
    store.getState().set(THEME_KEY, 'night')
    expect(r.dataset.theme).toBeUndefined()
  })
})
