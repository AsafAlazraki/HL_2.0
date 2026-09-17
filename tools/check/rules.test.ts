import { describe, expect, test } from 'vitest'
import {
  costNamesFrom,
  facesIn,
  fontFaceFailures,
  makeFontFaceRule,
  makeNoCostColumn,
  makeNoUndeclaredToken,
  noLiteralColour,
  noReaderFacingEntity,
  noTinyPx,
  noUiSelectorOutsideUi,
  rules,
} from './rules'

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

const css = (text: string) => noLiteralColour.check({ path: 'src/screens/home/home.css', text })
const tsx = (text: string) => noLiteralColour.check({ path: 'src/screens/home/Home.tsx', text })

describe('no-literal-colour', () => {
  test('the token file is the one place a colour may be written', () => {
    expect(noLiteralColour.applies('src/styles/tokens.css')).toBe(false)
    expect(noLiteralColour.applies('src/ui/button.css')).toBe(true)
    expect(noLiteralColour.applies('e2e/rulers/contrast.spec.ts')).toBe(false)
  })

  test('fires on a hex, a colour function and a named colour', () => {
    expect(css('.a { color: #1d4ed8; }')).toHaveLength(1)
    expect(css('.a { background: rgb(29 78 216); }')).toHaveLength(1)
    expect(css('.a { background: oklch(54.6% 0.245 255); }')).toHaveLength(1)
    expect(css('.a { color: rebeccapurple; }')).toHaveLength(1)
  })

  test('does not mistake a property name, an id selector or a token read for a colour', () => {
    expect(css('.a { white-space: nowrap; }')).toHaveLength(0)
    expect(css('#root { display: grid; }')).toHaveLength(0)
    expect(css('.a { background: var(--color-white); }')).toHaveLength(0)
    expect(css('/* no red exists in the palette yet */')).toHaveLength(0)
    expect(css('.a { border: 1px solid transparent; }')).toHaveLength(0)
  })

  test('in TSX only a string literal counts, so prose about red is prose', () => {
    expect(tsx("const bg = '#ffffff'\n")).toHaveLength(1)
    expect(tsx("const bg = 'red'\n")).toHaveLength(1)
    expect(tsx('// the refusal used to be red\nconst a = 1\n')).toHaveLength(0)
    expect(tsx("const tone = 'ink'\n")).toHaveLength(0)
  })
})

describe('no-undeclared-token', () => {
  const tokens = `@theme static {
  --color-*: initial;
  --color-white: #ffffff;
  --text-*: initial;
  --text-base: 0.875rem;
  --font-sans: system-ui, sans-serif;
  --spacing: 0.25rem;
}`
  const rule = makeNoUndeclaredToken(tokens)
  const at = (text: string) => rule.check({ path: 'src/ui/button.css', text })

  test('fires on a name nothing declares', () => {
    expect(at('.a { height: var(--row-h); }')).toHaveLength(1)
  })
  test('fires on a name in a namespace the token file reset, and not on one it kept', () => {
    // --color-* was reset, so Tailwind's red is gone and asking for it paints nothing.
    expect(at('.a { color: var(--color-red-500); }')).toHaveLength(1)
    // --tracking-* was never reset, so Tailwind's default theme still declares it.
    expect(at('.a { letter-spacing: var(--tracking-tight); }')).toHaveLength(0)
  })
  test('accepts a declared token, a file-local one, and a variable Base UI writes at runtime', () => {
    expect(at('.a { color: var(--color-white); }')).toHaveLength(0)
    expect(at('.a { --mine: 2px; width: var(--mine); }')).toHaveLength(0)
    expect(at('.a { transform-origin: var(--transform-origin); }')).toHaveLength(0)
  })
  test('a comment mentioning a var is not a read', () => {
    expect(at('/* var(--row-h) had no fallback in the old app */')).toHaveLength(0)
  })
})

const px = (text: string) => noTinyPx.check({ path: 'src/ui/button.css', text })
const pxInTokens = (text: string) => noTinyPx.check({ path: 'src/styles/tokens.css', text })

describe('no-tiny-px', () => {
  test('fires between 1 and 11 and allows a hairline', () => {
    expect(px('.a { font-size: 9px; }')).toHaveLength(1)
    expect(px('.a { padding: 4px; }')).toHaveLength(1)
    expect(px('.a { border: 1px solid transparent; }')).toHaveLength(0)
    expect(px('.a { margin: 0px; }')).toHaveLength(0)
    expect(px('.a { min-height: 36px; }')).toHaveLength(0)
  })

  test('in the token file only the type steps are read: a 3px radius is meant', () => {
    expect(pxInTokens('  --radius-xs: 3px;')).toHaveLength(0)
    expect(pxInTokens('  --text-2xs: 0.6875rem;')).toHaveLength(0)
    expect(pxInTokens('  --text-tiny: 0.625rem;')).toHaveLength(1)
    expect(pxInTokens('  --text-tiny: 10px;')).toHaveLength(1)
  })
})

describe('no-ui-selector-outside-ui', () => {
  test('fires in a screen stylesheet and never applies inside src/ui', () => {
    expect(
      noUiSelectorOutsideUi.check({
        path: 'src/screens/home/home.css',
        text: '.home .ui-button { padding: 0; }',
      }),
    ).toHaveLength(1)
    expect(noUiSelectorOutsideUi.applies('src/ui/button.css')).toBe(false)
    expect(
      noUiSelectorOutsideUi.check({
        path: 'src/screens/home/home.css',
        text: '/* the .ui- prefix is refused outside src/ui */\n.home { padding: 0; }',
      }),
    ).toHaveLength(0)
  })
})

const inScreen = (text: string) =>
  noReaderFacingEntity.check({ path: 'src/screens/data/Data.tsx', text })

describe('no-reader-facing-entity', () => {
  test('fires on a string and on text between two tags', () => {
    expect(inScreen("const title = 'No entity selected'\n")).toHaveLength(1)
    expect(inScreen('<p>Copy the row UID</p>\n')).toHaveLength(1)
    expect(inScreen('<p>53 entities</p>\n')).toHaveLength(1)
  })
  test('leaves the model alone: the type keeps its name and identity is not entity', () => {
    expect(inScreen("import type { EntityDef } from '@/domain/model'\n")).toHaveLength(0)
    expect(inScreen('/* a cap’s identity IS its place in the chord */\n')).toHaveLength(0)
    expect(noReaderFacingEntity.applies('src/domain/model/table.ts')).toBe(false)
  })
})

describe('no-cost-column-in-a-screen', () => {
  const manifest = {
    tables: [{ costColumns: ['boat_stacer.im', 'boat_stacer.iq'] }],
  }
  const entities = [
    {
      fields: [
        { id: 'boat_stacer.im', name: 'Total Nett CTD' },
        { id: 'boat_stacer.iq', name: 'Dealer' },
        { id: 'boat_stacer.qr', name: 'RRP' },
      ],
    },
  ]

  test('names a cost field by id, and by name only where the name cannot be ordinary English', () => {
    const names = costNamesFrom(manifest, entities)
    expect(names).toContain('boat_stacer.im')
    expect(names).toContain('Total Nett CTD')
    expect(names).not.toContain('Dealer')
    expect(names).not.toContain('RRP')
  })

  test('fires on a screen that reaches for one, and only under src/screens', () => {
    const rule = makeNoCostColumn(costNamesFrom(manifest, entities))
    expect(
      rule.check({ path: 'src/screens/quote/Quote.tsx', text: "row['boat_stacer.im']\n" }),
    ).toHaveLength(1)
    expect(
      rule.check({ path: 'src/screens/quote/Quote.tsx', text: '<th>Total Nett CTD</th>\n' }),
    ).toHaveLength(1)
    expect(
      rule.check({ path: 'src/screens/quote/Quote.tsx', text: '<p>Ask your dealer</p>\n' }),
    ).toHaveLength(0)
    expect(rule.applies('src/domain/pricing/levels.ts')).toBe(false)
  })

  test('with no pack there is nothing to refuse, and the rule says so by refusing nothing', () => {
    const rule = makeNoCostColumn(costNamesFrom(null, null))
    expect(rule.check({ path: 'src/screens/x.tsx', text: 'anything at all\n' })).toHaveLength(0)
  })

  test('the real pack names the cost columns the packer measured', () => {
    const real = byName['no-cost-column-in-a-screen']!
    expect(real.check({ path: 'src/screens/x.tsx', text: "row['boat_stacer.im']\n" })).toHaveLength(
      1,
    )
  })
})

describe('font-tokens-and-faces-agree', () => {
  const systemOnly =
    '  --font-sans: system-ui, sans-serif;\n  --font-mono: ui-monospace, monospace;'

  test('a system stack needs no face', () => {
    expect(fontFaceFailures(systemOnly, [])).toHaveLength(0)
  })
  test('a token naming a face nobody loads fails', () => {
    const out = fontFaceFailures("  --font-display: 'Söhne', sans-serif;", [])
    expect(out).toHaveLength(1)
    expect(out[0]!.message).toContain('Söhne')
  })
  test('the same token passes once the face is loaded', () => {
    expect(
      fontFaceFailures("  --font-display: 'Söhne', sans-serif;", [
        { family: 'Söhne', file: 'src/styles/faces.css', line: 2 },
      ]),
    ).toHaveLength(0)
  })
  test('a face nothing names fails — the old app shipped three', () => {
    const out = fontFaceFailures(systemOnly, [
      { family: 'Inter', file: 'src/styles/faces.css', line: 2 },
    ])
    expect(out).toHaveLength(1)
    expect(out[0]!.message).toContain('Inter')
  })
  test('the weight namespace is not a family', () => {
    expect(fontFaceFailures('  --font-weight-medium: 500;', [])).toHaveLength(0)
  })
  test('facesIn reads the family out of an @font-face block', () => {
    expect(
      facesIn({
        path: 'src/styles/faces.css',
        text: "@font-face {\n  font-family: 'Söhne';\n  src: url(x.woff2);\n}",
      }),
    ).toEqual([{ family: 'Söhne', file: 'src/styles/faces.css', line: 1 }])
  })
  test('the rule reads the faces itself and fails on a mismatch', () => {
    const rule = makeFontFaceRule(() => [
      { family: 'Archivo', file: 'src/styles/faces.css', line: 1 },
    ])
    expect(rule.applies('src/styles/tokens.css')).toBe(true)
    expect(rule.applies('src/ui/button.css')).toBe(false)
    expect(rule.check({ path: 'src/styles/tokens.css', text: systemOnly })).toHaveLength(1)
  })
})

describe('the two text rules read code, not prose', () => {
  const store = byName['only-prefs-uses-localstorage']!
  const sync = byName['no-usesyncexternalstore']!

  test('a comment explaining that a module does NOT touch localStorage is not a use of it', () => {
    const text = [
      '/* The one file allowed to touch the browser localStorage is prefs.ts,',
      '   so the store is handed in here rather than reached for. */',
      'export const shelf = (store: Shelf) => store',
    ].join('\n')
    expect(store.check({ path: 'src/domain/io/shelf.ts', text })).toHaveLength(0)
  })

  test('real code still fires, on the right line', () => {
    const text = ['// a note', 'const raw = localStorage.getItem("x")'].join('\n')
    const hits = store.check({ path: 'src/state/quotes.ts', text })
    expect(hits).toHaveLength(1)
    expect(hits[0]!.line).toBe(2)
  })

  test('the word inside a string literal is not a use of it either', () => {
    const text = 'const said = "we never reach for localStorage here"'
    expect(store.check({ path: 'src/screens/x.ts', text })).toHaveLength(0)
  })

  test('useSyncExternalStore in a comment is prose; in code it is a finding', () => {
    expect(
      sync.check({ path: 'src/app/useStores.ts', text: '// hand rolls no useSyncExternalStore' }),
    ).toHaveLength(0)
    expect(
      sync.check({ path: 'src/app/x.ts', text: 'const v = useSyncExternalStore(sub, get)' }),
    ).toHaveLength(1)
  })
})
