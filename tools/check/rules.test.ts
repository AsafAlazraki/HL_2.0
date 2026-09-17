import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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
  textHygiene,
} from './rules'
import { CITED, OLD_REPO, isDecision, makeNoOldSystemRule, oldValues } from './oldSystem'
import { blindRules, runRules, type Rule } from './run'

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

describe('domain-touches-no-dom', () => {
  const rule = byName['domain-touches-no-dom']!

  test('applies to code under src/domain, not to its tests and not to the app', () => {
    expect(rule.applies('src/domain/quote/freeze.ts')).toBe(true)
    expect(rule.applies('src/domain/quote/freeze.test.ts')).toBe(false)
    expect(rule.applies('src/ui/keys.ts')).toBe(false)
  })

  test('fires on the globals an import guard cannot see', () => {
    const lines = [
      'const el = document.querySelector(".row")',
      'const wide = window.innerWidth > 900',
      'const img = new Image()',
      'const db = indexedDB.open("x")',
      'const m = matchMedia("(prefers-reduced-motion: reduce)")',
    ]
    for (const line of lines) {
      expect(rule.check({ path: 'src/domain/x.ts', text: `${line}\n` }), line).toHaveLength(1)
    }
  })

  test('reports the line the global is on', () => {
    const hits = rule.check({
      path: 'src/domain/x.ts',
      text: 'const a = 1\nconst b = 2\nconst c = window.scrollY\n',
    })
    expect(hits).toHaveLength(1)
    expect(hits[0]!.line).toBe(3)
  })

  test('a comment arguing that the DOM is handed in is not a use of it', () => {
    /* the real header of `src/domain/io/shelf.ts` is this shape, and
       the folder is full of them: the rule would be useless if
       explaining the constraint tripped it */
    const text = [
      '/* The browser `window` and its `document` are handed in as ports,',
      '   never reached for here — see the note on `localStorage` below. */',
      'export const shelf = (store: Shelf) => store',
    ].join('\n')
    expect(rule.check({ path: 'src/domain/io/shelf.ts', text })).toHaveLength(0)
  })

  test('a name that merely starts with a global is not one', () => {
    const text = 'const windowSeats = 4\nconst documentId = "q-1"\nconst ImageValue = 0\n'
    expect(rule.check({ path: 'src/domain/x.ts', text })).toHaveLength(0)
  })

  test('ordinary domain code says nothing', () => {
    expect(rule.check({ path: 'src/domain/x.ts', text: 'export const two = 1 + 1\n' })).toEqual([])
  })
})

describe('source-is-text', () => {
  const rule = byName['source-is-text']!
  /* built from char codes, never typed literally — a test that asserts
     "no raw NUL in the tree" must not smuggle one into its own file */
  const NUL = String.fromCharCode(0)
  const CR = String.fromCharCode(13)

  test('reads what a person writes and leaves the packed seed alone', () => {
    expect(rule.applies('src/ui/Button.tsx')).toBe(true)
    expect(rule.applies('src/domain/quote/freeze.test.ts')).toBe(true)
    expect(rule.applies('tools/check/rules.ts')).toBe(true)
    expect(rule.applies('e2e/rulers/ramp.spec.ts')).toBe(true)
    expect(rule.applies('data/northside/tables/boat_stacer.json')).toBe(false)
    expect(rule.applies('public/seed-images/x.jpg')).toBe(false)
  })

  test('fires on a raw NUL and counts every one of them', () => {
    const text = `const key = \`\${a}${NUL}\${b}\`\nconst other = \`\${c}${NUL}\${d}\`\n`
    const hits = textHygiene({ path: 'src/x.ts', text })
    expect(hits).toHaveLength(1)
    expect(hits[0]!.line).toBe(1)
    expect(hits[0]!.message).toContain('2 raw U+0000')
  })

  test('tells the escape apart from the raw byte, which is the whole fix', () => {
    const escaped = 'const key = `${a}\\0${b}`\n'
    expect(textHygiene({ path: 'src/x.ts', text: escaped })).toHaveLength(0)
  })

  test('fires on CRLF and counts the lines, not the files', () => {
    const text = `const a = 1${CR}\nconst b = 2${CR}\nconst c = 3\n`
    const hits = textHygiene({ path: 'src/x.ts', text })
    expect(hits).toHaveLength(1)
    expect(hits[0]!.line).toBe(1)
    expect(hits[0]!.message).toContain('2 lines')
  })

  test('reports both kinds when a file carries both, as SearchField.tsx did', () => {
    const text = `const key = \`\${a}${NUL}\${b}\`${CR}\n`
    expect(textHygiene({ path: 'src/x.ts', text }).map((f) => f.message.slice(0, 7))).toEqual([
      'carries',
      'ends 1 ',
    ])
  })

  test('an ordinary LF file says nothing', () => {
    expect(textHygiene({ path: 'src/x.ts', text: 'const a = 1\nconst b = 2\n' })).toEqual([])
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
  test('reads a route file too — the document is a surface, wherever it is mounted', () => {
    expect(noReaderFacingEntity.applies('src/routes/quote.$id.document.tsx')).toBe(true)
    expect(noReaderFacingEntity.applies('src/ui/Select.tsx')).toBe(true)
    expect(
      noReaderFacingEntity.check({
        path: 'src/routes/index.tsx',
        text: '<p>No entity selected</p>\n',
      }),
    ).toHaveLength(1)
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

  test('fires on a screen that reaches for one, and not on the engine that prices it', () => {
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

  /* THE SCOPE IS EVERY RENDERED SURFACE, not the one folder the plan's layout names. The
     round-3 critic found this rule scoped to `src/screens/`, which does not exist on this
     tree — so it read nothing at all, and the plan puts the quote DOCUMENT, the surface
     CLAUDE.md names by name, under `routes/`. */
  test('covers the route that renders the document and the primitive that draws the figure', () => {
    const rule = makeNoCostColumn(costNamesFrom(manifest, entities))
    expect(rule.applies('src/routes/quote.$id.document.tsx')).toBe(true)
    expect(rule.applies('src/routes/index.tsx')).toBe(true)
    expect(rule.applies('src/ui/PriceFigure.tsx')).toBe(true)
    expect(rule.applies('src/routes/foundation.css')).toBe(true)
    expect(rule.applies('src/routes/index.test.tsx')).toBe(false)
    expect(
      rule.check({ path: 'src/routes/quote.$id.document.tsx', text: '<td>Total Nett CTD</td>\n' }),
    ).toHaveLength(1)
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

describe('no-old-design-system', () => {
  const rule = byName['no-old-design-system']!
  /* A fabricated old-repo set, so the test does not depend on that repo being on the disk. */
  const asIfOld = makeNoOldSystemRule(new Set(['cubic-bezier(0.23, 1, 0.32, 1)']))

  test('applies to a stylesheet and to the code under src that could carry the same value', () => {
    expect(rule.applies('src/styles/tokens.css')).toBe(true)
    expect(rule.applies('src/ui/motion.ts')).toBe(true)
    /* its own fixture fabricates an old value, so a test file is out of reach */
    expect(rule.applies('src/ui/motion.test.ts')).toBe(false)
    expect(rule.applies('tools/check/rules.test.ts')).toBe(false)
  })

  test('catches the other half of the round-2 defect: a curve lifted into a .ts file', () => {
    const hits = asIfOld.check({
      path: 'src/ui/motion.ts',
      text: [
        'export const springs = {',
        "  gentle: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)',",
        '}',
      ].join('\n'),
    })
    expect(hits).toHaveLength(1)
    expect(hits[0]!.line).toBe(2)
  })

  test('and stays quiet on a .ts file that chose its own', () => {
    expect(
      asIfOld.check({
        path: 'src/ui/motion.ts',
        text: "export const gentle = 'transform 200ms cubic-bezier(0.2, 0, 0, 1)'\n",
      }),
    ).toHaveLength(0)
  })

  test('catches a curve copied from the old repo, on its line', () => {
    const hits = asIfOld.check({
      path: 'src/styles/tokens.css',
      text: ['/* motion */', '  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);'].join('\n'),
    })
    expect(hits).toHaveLength(1)
    expect(hits[0]!.line).toBe(2)
    expect(hits[0]!.message).toContain('HL_Playground')
  })

  test('a different curve is ours and passes', () => {
    expect(
      asIfOld.check({
        path: 'src/styles/tokens.css',
        text: '  --ease-out: cubic-bezier(0.2, 0, 0, 1);',
      }),
    ).toHaveLength(0)
  })

  test('a value nobody could choose differently is never compared', () => {
    for (const v of ['0', '1', '16px', 'none', 'auto', '100%']) expect(isDecision(v), v).toBe(false)
    expect(isDecision('cubic-bezier(0.4, 0, 0.2, 1)')).toBe(true)
  })

  /* THE FALSE POSITIVE THIS RULE HAD, measured 2026-09-17 on the entry screen. Both halves
     are here: the fragment a multi-line declaration produces, and the shell a gradient
     becomes once its var() reads are blanked out. Three findings on a screen that had lifted
     nothing is how a guard gets routed around. */
  test('a fragment of a multi-line declaration is not a value', () => {
    expect(isDecision('linear-gradient(')).toBe(false)
    expect(isDecision('linear-gradient(to bottom, var(--color-veil-82), transparent)')).toBe(true)
  })

  test('a wash made only of this repo’s own tokens is not the old repo', () => {
    const asIfOldGradient = makeNoOldSystemRule(
      new Set(['linear-gradient(to bottom, var(--t-ink), transparent)']),
    )
    expect(
      asIfOldGradient.check({
        path: 'src/screens/entry/entry.css',
        text: '  background: linear-gradient(to bottom, var(--color-veil-82), transparent);',
      }),
    ).toHaveLength(0)
  })

  test('and the same var() lifted out of the old ramp still fails', () => {
    const asIfOldGradient = makeNoOldSystemRule(
      new Set(['linear-gradient(to bottom, var(--t-ink), transparent)']),
    )
    const hits = asIfOldGradient.check({
      path: 'src/screens/entry/entry.css',
      text: '  background: linear-gradient(to bottom, var(--t-ink), transparent);',
    })
    expect(hits).toHaveLength(1)
    expect(hits[0]!.message).toContain('HL_Playground')
  })

  test('with no old repo on the machine it finds nothing rather than failing', () => {
    const none = makeNoOldSystemRule(new Set())
    expect(
      none.check({
        path: 'src/styles/tokens.css',
        text: '  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);',
      }),
    ).toHaveLength(0)
    expect(oldValues('C:/no/such/repo').size).toBe(0)
  })
})

describe('the published-standard exemption', () => {
  test('every exempt value carries the spec it comes from', () => {
    expect(CITED.size).toBeGreaterThan(0)
    for (const [value, source] of CITED) {
      expect(isDecision(value), value).toBe(true)
      expect(source.length, value).toBeGreaterThan(20)
      expect(source, value).toMatch(/material\.io|w3\.org|developer\.mozilla|spec/i)
    }
  })

  test('the exemption is narrow: a handful, not a ramp re-imported one line at a time', () => {
    expect(CITED.size).toBeLessThanOrEqual(8)
  })

  test('an exempt value passes even though the old repo declares it too', () => {
    const rule = makeNoOldSystemRule(new Set(['cubic-bezier(0.4, 0, 0.2, 1)']))
    expect(
      rule.check({
        path: 'src/styles/tokens.css',
        text: '  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);',
      }),
    ).toHaveLength(0)
  })

  test('a value not on the list still fails, exemption or no', () => {
    const rule = makeNoOldSystemRule(new Set(['cubic-bezier(0.23, 1, 0.32, 1)']))
    expect(
      rule.check({
        path: 'src/styles/tokens.css',
        text: '  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);',
      }),
    ).toHaveLength(1)
  })
})

/* ============================================================
   THE GUARD ON THE GUARDS.

   Everything above proves a rule CAN fire. None of it can prove a rule
   is pointed at anything, because every case hands the rule a
   fabricated path: `makeNoCostColumn(...).check({ path:
   'src/screens/quote/Quote.tsx' })` passes identically whether or not
   `src/screens/` exists. Measured by the round-3 critic, it did not,
   and the highest-stakes honesty guard in the repo — the one that
   keeps cost off a customer's page — had been reading zero files while
   the run printed `check: 14 rules, no failures`.

   So the tests here walk the real tree, and `blindRules` — the refusal
   itself — gets the same fixture treatment every rule above gets.
   ============================================================ */
describe('every rule is pointed at something', () => {
  const ROOT = fileURLToPath(new URL('../..', import.meta.url))

  /*
   * THESE TWO WALK THE WHOLE REPOSITORY, which is not a unit of work a default timeout was
   * ever sized for. Measured 2026-09-17 by the verify pass: the file takes 5.53 s alone and
   * 34 s then 53 s inside a full run, where 151 isolated workers compete for four cores — so
   * it failed on two runs out of three at the project-wide 20 s, always on these two, always
   * with "Test timed out" and never with a wrong answer. A budget that fires on load rather
   * than on a hang teaches people to re-run a red gate, which is the same lesson the node
   * project learnt at 5 s and the reason it now sits at 20. These two get their own.
   */
  test('the run reports how many files each rule read, and none of them read none', async () => {
    const { read } = await runRules(rules, ROOT)
    expect(read.map((r) => r.rule).toSorted()).toEqual(rules.map((r) => r.name).toSorted())
    const blind = read.filter((r) => r.files === 0).map((r) => r.rule)
    expect(blind, 'a rule scoped to a folder that is not in this tree measures nothing').toEqual([])
  }, 120_000)

  test('and a rule whose scope matches nothing is refused by name', async () => {
    const aimedAtNothing: Rule = {
      name: 'aimed-at-nothing',
      applies: (p) => p.startsWith('src/a-folder-that-is-not-here/'),
      check: () => [],
    }
    const { read, failures } = await runRules([aimedAtNothing], ROOT)
    expect(failures, 'it found nothing wrong, because it read nothing at all').toEqual([])
    expect(read).toEqual([{ rule: 'aimed-at-nothing', files: 0 }])
    const blind = blindRules(read)
    expect(blind).toHaveLength(1)
    expect(blind[0]!.rule).toBe('aimed-at-nothing')
    expect(blind[0]!.message).toContain('read no files at all')
  })

  test('and says nothing about a rule that did read something', async () => {
    const { read } = await runRules([rules[0]!], ROOT)
    expect(read[0]!.files).toBeGreaterThan(0)
    expect(blindRules(read)).toEqual([])
  }, 120_000)
})

describe('the old repo is evidence, and the run says how much of it there was', () => {
  test('on a machine that has HL_Playground, the rule has values to compare against', () => {
    const here = existsSync(OLD_REPO)
    const values = oldValues(OLD_REPO)
    if (here) {
      /* If this ever reads zero on a machine where the folder IS there, the checkout has
         moved or `stylesheetsUnder` has broken, and the guard has gone silent. */
      expect(
        values.size,
        `${OLD_REPO} is on this machine but declares no authored value`,
      ).toBeGreaterThan(0)
    } else {
      /* CI runs on ubuntu-latest and has never had the old repo. The rule finds nothing,
         which is correct, and `tools/check.ts` prints that it found nothing. */
      expect(values.size).toBe(0)
    }
  })
})
