import { describe, expect, test } from 'vitest'
import { rules } from './rules'

/** Every guard must be able to fail: a rule that never fires measures nothing. */
const byName = Object.fromEntries(rules.map((r) => [r.name, r]))

describe('domain-is-pure', () => {
  const rule = byName['domain-is-pure']!
  test('applies to code under src/domain, not to its tests', () => {
    expect(rule.applies('src/domain/quote/freeze.ts')).toBe(true)
    expect(rule.applies('src/domain/quote/freeze.test.ts')).toBe(false)
    expect(rule.applies('src/state/quotes.ts')).toBe(false)
  })
  test('fires on a React import and stays quiet on a type import from the model', () => {
    expect(
      rule.check({ path: 'src/domain/x.ts', text: "import { useState } from 'react'\n" }),
    ).toHaveLength(1)
    expect(
      rule.check({ path: 'src/domain/x.ts', text: "import type { Row } from '@/domain/model'\n" }),
    ).toHaveLength(0)
  })
})

describe('only-data-imports-dexie', () => {
  const rule = byName['only-data-imports-dexie']!
  test('fires outside src/data and never applies inside it', () => {
    expect(
      rule.check({ path: 'src/state/x.ts', text: "import Dexie from 'dexie'\n" }),
    ).toHaveLength(1)
    expect(rule.applies('src/data/dexie/db.ts')).toBe(false)
  })
})

describe('only-prefs-uses-localstorage', () => {
  const rule = byName['only-prefs-uses-localstorage']!
  test('fires on localStorage anywhere but prefs', () => {
    expect(
      rule.check({ path: 'src/state/quotes.ts', text: 'localStorage.setItem("a", "b")\n' }),
    ).toHaveLength(1)
    expect(rule.applies('src/state/prefs.ts')).toBe(false)
  })
})

describe('no-usesyncexternalstore', () => {
  const rule = byName['no-usesyncexternalstore']!
  test('fires on the hook name', () => {
    expect(
      rule.check({
        path: 'src/screens/x.tsx',
        text: "import { useSyncExternalStore } from 'react'\n",
      }),
    ).toHaveLength(1)
  })
})
