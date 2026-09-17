import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Failure, Rule, SourceFile } from './run'
import { eachLine } from './run'
import { makeNoOldSystemRule, oldValues } from './oldSystem'

const under = (prefix: string) => (path: string) => path.startsWith(prefix)
const code = (path: string) => /\.(ts|tsx)$/.test(path) && !/\.test\.tsx?$/.test(path)
const styles = (path: string) => path.endsWith('.css')
const TOKENS = 'src/styles/tokens.css'

/* ============================================================
   READING THE REPO ONCE, AT LOAD.

   Three of the visual rules are cross-file: a token is declared in one
   file and read in another, a face is declared in one stylesheet and
   named in another, and the cost columns are a fact of the pack, not
   of any source file. Each of those is built here as a plain value and
   handed to a rule factory, so the rule itself stays a pure function of
   one file and its fixture test can hand it a fabricated world. A guard
   that can only be exercised against the real tree is a guard whose
   failure nobody has ever seen.
   ============================================================ */

const ROOT = fileURLToPath(new URL('../..', import.meta.url))

function readIfPresent(path: string): string | null {
  try {
    return readFileSync(join(ROOT, path), 'utf8')
  } catch {
    return null
  }
}

/** Every `.css` file in the repo, repo-relative, for the cross-file scans. */
function stylesheets(dir: string, acc: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return acc
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) stylesheets(full, acc)
    else if (entry.endsWith('.css')) acc.push(relative(ROOT, full).split(sep).join('/'))
  }
  return acc
}

// ---- text helpers ------------------------------------------------------------------

/** Blank out CSS comments, keeping every newline so line numbers stay true. */
export function stripCssComments(text: string): string {
  return text.replaceAll(/\/\*[\s\S]*?\*\//g, (m) => m.replaceAll(/[^\n]/g, ' '))
}

/**
 * The value half of every declaration, with `var(…)` reads removed. A rule about literal
 * values must not read `var(--color-white)` as the word "white", and a rule about pixels
 * must not read a selector.
 */
export function declarationValues(text: string): { value: string; line: number }[] {
  const out: { value: string; line: number }[] = []
  stripCssComments(text)
    .split('\n')
    .forEach((line, i) => {
      const at = line.indexOf(':')
      if (at < 0) return
      out.push({ value: line.slice(at + 1).replaceAll(/var\([^)]*\)/g, ' '), line: i + 1 })
    })
  return out
}

/**
 * Blank out the string literals and comments of a TS/TSX file, keeping length and newlines,
 * and return both the mask and the strings that were taken out. One pass, because the
 * questions "is this text in a string" and "is this text between two tags" are the same
 * scan asked twice, and two scanners would eventually disagree.
 */
export function maskCode(text: string): {
  masked: string
  strings: { text: string; line: number }[]
} {
  const strings: { text: string; line: number }[] = []
  let masked = ''
  let i = 0
  let line = 1
  const push = (ch: string) => {
    masked += ch === '\n' ? '\n' : ' '
    if (ch === '\n') line++
  }
  while (i < text.length) {
    const ch = text[i]!
    const next = text[i + 1]
    if (ch === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') push(text[i++]!)
      continue
    }
    if (ch === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2)
      const stop = end === -1 ? text.length : end + 2
      while (i < stop) push(text[i++]!)
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      const startLine = line
      let body = ''
      push(text[i++]!)
      while (i < text.length) {
        const c = text[i]!
        if (c === '\\') {
          body += text.slice(i, i + 2)
          push(text[i++]!)
          if (i < text.length) push(text[i++]!)
          continue
        }
        if (c === ch) {
          push(text[i++]!)
          break
        }
        body += c
        push(text[i++]!)
      }
      strings.push({ text: body, line: startLine })
      continue
    }
    masked += ch
    if (ch === '\n') line++
    i++
  }
  return { masked, strings }
}

/**
 * The text a reader sees between two tags. Approximate by design: it reads `>…<` out of the
 * masked source, so a generic argument written across two comparisons could be mistaken for
 * prose. The words it looks for are rare enough that the approximation has never cost
 * anything, and the alternative is a parser this guard does not need.
 */
export function jsxText(masked: string): { text: string; line: number }[] {
  const out: { text: string; line: number }[] = []
  for (const m of masked.matchAll(/>([^<>{}]+)</g)) {
    const body = m[1]!
    if (!/[A-Za-z]/.test(body)) continue
    out.push({ text: body, line: masked.slice(0, m.index).split('\n').length })
  }
  return out
}

// ---- 1. no literal colour ----------------------------------------------------------

/**
 * The CSS named colours. `transparent` and `currentColor` are deliberately not here:
 * neither names a colour, they name the absence of one and "whatever the ink already is".
 */
const NAMED_COLOURS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue
   blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk
   crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki
   darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
   darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue
   dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite
   gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki
   lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
   lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen
   lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen
   magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
   mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream
   mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
   palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum
   powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown
   seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen
   steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow
   yellowgreen`
    .split(/\s+/)
    .filter(Boolean),
)

const HEX = /#[0-9a-fA-F]{3,8}\b/
const COLOUR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/

/**
 * Every colour has one name, in `src/styles/tokens.css`, and nowhere else. A screen that
 * needs a colour the tokens do not carry has found a token the design is missing, which is
 * a conversation and not a hex literal.
 *
 * In a stylesheet only declaration VALUES are read, so an id selector is not mistaken for a
 * hex and `white-space: nowrap` is not mistaken for white. In TS/TSX only string literals
 * are read, for the same reason: a comment that mentions red is prose.
 *
 * Scope is `src/`. The rulers under `e2e/` parse `rgb(…)` for a living and tools/ writes no
 * pixels; a guard that fires on the instrument measuring it is a guard nobody keeps.
 */
export const noLiteralColour: Rule = {
  name: 'no-literal-colour',
  applies: (p) =>
    under('src/')(p) &&
    p !== TOKENS &&
    (styles(p) || (p.endsWith('.tsx') && !p.includes('.test.'))),
  check: (f) => {
    const out: Failure[] = []
    const say = (line: number, what: string): void => {
      out.push({
        rule: 'no-literal-colour',
        file: f.path,
        line,
        message: `${what} is a literal colour; every colour is named in ${TOKENS}`,
      })
    }
    if (styles(f.path)) {
      for (const { value, line } of declarationValues(f.text)) {
        const hex = HEX.exec(value)
        if (hex) say(line, hex[0])
        const fn = COLOUR_FN.exec(value)
        if (fn) say(line, fn[0].trim())
        for (const word of value.toLowerCase().match(/[a-z]+/g) ?? []) {
          if (NAMED_COLOURS.has(word)) say(line, word)
        }
      }
      return out
    }
    for (const { text, line } of maskCode(f.text).strings) {
      const hex = HEX.exec(text)
      if (hex) say(line, hex[0])
      const fn = COLOUR_FN.exec(text)
      if (fn) say(line, fn[0].trim())
      if (NAMED_COLOURS.has(text.trim().toLowerCase())) say(line, text.trim())
    }
    return out
  },
}

// ---- 2. no undeclared token --------------------------------------------------------

/**
 * Tailwind 4's own theme namespaces. A `var(--tracking-tight)` is real even though nothing
 * in tokens.css declares it, because Tailwind's default theme does — EXCEPT where tokens.css
 * has reset the namespace (`--color-*: initial`), which is precisely a statement that the
 * defaults are gone and the reachable set is the declared one.
 */
const TAILWIND_NAMESPACES = [
  'color',
  'font',
  'font-weight',
  'text',
  'tracking',
  'leading',
  'breakpoint',
  'container',
  'spacing',
  'radius',
  'shadow',
  'inset-shadow',
  'drop-shadow',
  'text-shadow',
  'blur',
  'perspective',
  'aspect',
  'ease',
  'animate',
  'default',
]

/**
 * The variables Base UI writes onto its own positioners and popups at runtime. They are
 * declared — by the library, on the element, while it is open — and a popover that scales
 * from the trigger's edge has to read one.
 */
const BASE_UI_RUNTIME = new Set([
  '--transform-origin',
  '--available-width',
  '--available-height',
  '--anchor-width',
  '--anchor-height',
  '--positioner-width',
  '--positioner-height',
  '--popup-width',
  '--popup-height',
])

export function declaredIn(text: string): Set<string> {
  const out = new Set<string>()
  for (const m of stripCssComments(text).matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) out.add(m[1]!)
  return out
}

function resetNamespaces(tokens: string): Set<string> {
  const out = new Set<string>()
  for (const m of tokens.matchAll(/--([a-zA-Z0-9-]+)-\*\s*:\s*initial/g)) out.add(m[1]!)
  return out
}

/**
 * A `var(--x)` whose `--x` nothing declares comes back empty and paints nothing — the old
 * app had seventeen reads of `var(--row-h)` with no declaration and no fallback. A name
 * counts as declared if tokens.css declares it, if the file declares it itself (a local or
 * a library's own variable, as the Sonner colours are), if Base UI writes it at runtime, or
 * if it belongs to a Tailwind namespace tokens.css has not reset.
 */
export function makeNoUndeclaredToken(tokensText: string): Rule {
  const declared = declaredIn(tokensText)
  const reset = resetNamespaces(tokensText)
  const namespaceOk = (name: string): boolean =>
    TAILWIND_NAMESPACES.some(
      (ns) => (name === `--${ns}` || name.startsWith(`--${ns}-`)) && !reset.has(ns),
    )
  return {
    name: 'no-undeclared-token',
    applies: (p) =>
      under('src/')(p) &&
      p !== TOKENS &&
      (styles(p) || (p.endsWith('.tsx') && !p.includes('.test.'))),
    check: (f) => {
      const local = styles(f.path) ? declaredIn(f.text) : new Set<string>()
      const body = styles(f.path) ? stripCssComments(f.text) : f.text
      const out: Failure[] = []
      body.split('\n').forEach((line, i) => {
        for (const m of line.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
          const name = m[1]!
          if (declared.has(name) || local.has(name) || BASE_UI_RUNTIME.has(name)) continue
          if (namespaceOk(name)) continue
          out.push({
            rule: 'no-undeclared-token',
            file: f.path,
            line: i + 1,
            message: `${name} is declared nowhere; a var() with no declaration paints nothing`,
          })
        }
      })
      return out
    },
  }
}

// ---- 3. nothing under 11px ---------------------------------------------------------

/** 11px, the floor the type scale states, in rem at the browser's 16px root. */
const FLOOR_REM = 0.6875

/**
 * No pixel value between 1 and 11. Two things live behind that one sentence: a type step
 * under 11px is unreadable at arm's length on a dealer's screen, and a spacing written in
 * raw pixels is a spacing outside the 4px grid — `--spacing(1)` is what a screen asks for.
 * 0 and 1px are allowed, because a hairline border is 1px and nothing else is.
 *
 * tokens.css is read too, but only its type steps: the radii and shadows there ARE small
 * pixel values and are meant to be.
 */
export const noTinyPx: Rule = {
  name: 'no-tiny-px',
  applies: (p) => under('src/')(p) && (styles(p) || (p.endsWith('.tsx') && !p.includes('.test.'))),
  check: (f) => {
    const out: Failure[] = []
    const tokens = f.path === TOKENS
    const source = styles(f.path)
      ? declarationValues(f.text).map((d) => ({ text: d.value, line: d.line, prop: propOf(f, d) }))
      : maskCode(f.text).strings.map((s) => ({ text: s.text, line: s.line, prop: '' }))
    for (const { text, line, prop } of source) {
      const typeStep = prop.startsWith('--text-') || prop === 'font-size'
      if (!tokens || typeStep) {
        for (const m of text.matchAll(/(-?\d*\.?\d+)px\b/g)) {
          const px = Math.abs(Number(m[1]))
          if (px > 1 && px < 11)
            out.push({
              rule: 'no-tiny-px',
              file: f.path,
              line,
              message: `${m[0]} is under the 11px floor; spacing is --spacing(n), a border is 1px`,
            })
        }
      }
      if (!typeStep) continue
      for (const m of text.matchAll(/(-?\d*\.?\d+)rem\b/g)) {
        const rem = Math.abs(Number(m[1]))
        if (rem > 0 && rem < FLOOR_REM)
          out.push({
            rule: 'no-tiny-px',
            file: f.path,
            line,
            message: `${m[0]} is under the 11px floor for a type step`,
          })
      }
    }
    return out
  },
}

/** The property a declaration set, for the two rules that care which one it was. */
function propOf(f: SourceFile, d: { line: number }): string {
  const line = stripCssComments(f.text).split('\n')[d.line - 1] ?? ''
  return line.slice(0, line.indexOf(':')).trim()
}

// ---- 4. no .ui- selector outside src/ui --------------------------------------------

/**
 * The mechanical half of "a primitive refuses className and style". The TypeScript half is
 * each primitive's props; this is the one the old app needed and did not have — ten feature
 * stylesheets reached into primitive internals through parent selectors, so a primitive
 * could not be changed without reading every screen.
 */
export const noUiSelectorOutsideUi: Rule = {
  name: 'no-ui-selector-outside-ui',
  applies: (p) => styles(p) && !under('src/ui/')(p),
  check: (f) =>
    eachLine(
      stripCssCommentsFile(f),
      /\.ui-[a-zA-Z0-9-]+/,
      'no-ui-selector-outside-ui',
      'only src/ui styles the primitives; a screen draws its own layout around them',
    ),
}

function stripCssCommentsFile(f: SourceFile): SourceFile {
  return { path: f.path, text: stripCssComments(f.text) }
}

// ---- 5. no reader-facing "entity" or "UID" -----------------------------------------

/**
 * `EntityDef` keeps its name in the model, because that is what the contract has always
 * called a table and renaming a type is how a port stops being a port. The word never
 * reaches a reader: a dealer has boats, motors and trailers, not entities, and an id shown
 * as a "UID" is an apology for a screen that could have shown a name.
 */
const READER_FACING = /\bentit(?:y|ies)\b|\bUID\b/i

export const noReaderFacingEntity: Rule = {
  name: 'no-reader-facing-entity',
  applies: (p) =>
    (under('src/screens/')(p) || under('src/ui/')(p)) && /\.tsx?$/.test(p) && !p.includes('.test.'),
  check: (f) => {
    const { masked, strings } = maskCode(f.text)
    const out: Failure[] = []
    for (const piece of [...strings, ...jsxText(masked)]) {
      const hit = READER_FACING.exec(piece.text)
      if (!hit) continue
      out.push({
        rule: 'no-reader-facing-entity',
        file: f.path,
        line: piece.line,
        message: `"${hit[0]}" is a word from the model, not a word for a reader`,
      })
    }
    return out
  },
}

// ---- 6. no cost column under src/screens -------------------------------------------

/**
 * Cost and margin never reach a customer-facing surface. The pack knows which columns are
 * cost — the packer measured them and the manifest names 139 — so the guard reads the
 * manifest rather than carrying a list that would go stale the day a column is renamed.
 *
 * Two shapes are refused: the field id (`boat_stacer.im`, which is how a screen would reach
 * one in code) and the workbook's own column name, but only where the name cannot be
 * ordinary English. `Total Nett CTD`, `Base Cost` and `GP` are refused; `Dealer`, `Labour`,
 * `Freight` and `Discount` are not, because a screen may legitimately say any of them and a
 * guard that cries wolf on the word "dealer" is a guard a reader learns to skip. The
 * mechanical test is: a name with a space in it, or a name in workbook capitals.
 */
export function costNamesFrom(manifest: unknown, entities: unknown): string[] {
  const m = manifest as { tables?: { costColumns?: string[] }[] } | null
  const ids = new Set<string>()
  for (const t of m?.tables ?? []) for (const id of t.costColumns ?? []) ids.add(id)
  const names = new Map<string, string>()
  const list = entities as { fields?: { id?: string; name?: string }[] }[] | null
  for (const e of list ?? [])
    for (const f of e.fields ?? []) if (f.id && f.name) names.set(f.id, f.name)
  const unmistakable = new Set<string>()
  for (const id of ids) {
    const name = names.get(id)
    if (!name) continue
    if (name.includes(' ') || name === name.toUpperCase()) unmistakable.add(name)
  }
  return [...ids, ...unmistakable]
}

export function makeNoCostColumn(costNames: string[]): Rule {
  const sorted = costNames.toSorted((a, b) => b.length - a.length)
  return {
    name: 'no-cost-column-in-a-screen',
    applies: (p) => under('src/screens/')(p) && /\.(tsx?|css)$/.test(p) && !p.includes('.test.'),
    check: (f) => {
      const out: Failure[] = []
      f.text.split('\n').forEach((line, i) => {
        for (const name of sorted) {
          if (!line.includes(name)) continue
          out.push({
            rule: 'no-cost-column-in-a-screen',
            file: f.path,
            line: i + 1,
            message: `"${name}" is a cost column; cost and margin never reach a customer-facing surface`,
          })
          break
        }
      })
      return out
    },
  }
}

// ---- 7. font tokens and @font-face agree -------------------------------------------

export interface FaceDecl {
  family: string
  file: string
  line: number
}

/** The families a stylesheet's `@font-face` blocks declare. */
export function facesIn(f: SourceFile): FaceDecl[] {
  const out: FaceDecl[] = []
  const text = stripCssComments(f.text)
  for (const block of text.matchAll(/@font-face\s*{[^}]*}/g)) {
    const family = /font-family\s*:\s*([^;}]+)/.exec(block[0])
    if (!family) continue
    out.push({
      family: family[1]!.trim().replaceAll(/^['"]|['"]$/g, ''),
      file: f.path,
      line: text.slice(0, block.index).split('\n').length,
    })
  }
  return out
}

/**
 * The generic and system families. A stack that starts with one of these ships no file, so
 * it needs no `@font-face`; a stack that starts with a name does.
 */
const SYSTEM_FAMILIES = new Set([
  'system-ui',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  'ui-rounded',
  '-apple-system',
  'blinkmacsystemfont',
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'inherit',
])

/** The family a token's stack asks for first — the one the browser will actually use. */
function firstFamily(value: string): string {
  return (value.split(',')[0] ?? '').trim().replaceAll(/^['"]|['"]$/g, '')
}

/**
 * Both directions of the same question, because the old app got both wrong at once: it
 * shipped Inter, Archivo and Bricolage that nothing referenced, and its tokens named faces
 * it never loaded. A token names a face that is loaded or is the system's; a face that is
 * loaded is named by a token. `--font-weight-*` is a Tailwind weight namespace, not a
 * family, and is not read here.
 */
export function fontFaceFailures(tokensText: string, faces: FaceDecl[]): Failure[] {
  const out: Failure[] = []
  const wanted = new Set<string>()
  const lines = stripCssComments(tokensText).split('\n')
  lines.forEach((line, i) => {
    const m = /(--font-[a-zA-Z0-9-]+)\s*:\s*([^;]+)/.exec(line)
    if (!m) return
    if (m[1]!.startsWith('--font-weight')) return
    const first = firstFamily(m[2]!)
    if (first.endsWith('*') || first === 'initial') return
    wanted.add(first.toLowerCase())
    if (SYSTEM_FAMILIES.has(first.toLowerCase())) return
    if (faces.some((f) => f.family.toLowerCase() === first.toLowerCase())) return
    out.push({
      rule: 'font-tokens-and-faces-agree',
      file: TOKENS,
      line: i + 1,
      message: `${m[1]} names "${first}", which is neither a system stack nor loaded by an @font-face`,
    })
  })
  for (const face of faces) {
    if (wanted.has(face.family.toLowerCase())) continue
    out.push({
      rule: 'font-tokens-and-faces-agree',
      file: face.file,
      line: face.line,
      message: `"${face.family}" is loaded but no font token names it; the old app shipped three faces nothing used`,
    })
  }
  return out
}

export function makeFontFaceRule(readFaces: () => FaceDecl[]): Rule {
  return {
    name: 'font-tokens-and-faces-agree',
    // The rule hangs off the token file so it runs exactly once; it reads the faces itself.
    applies: (p) => p === TOKENS,
    check: (f) => fontFaceFailures(f.text, readFaces()),
  }
}

/* ============================================================
   A SOURCE FILE IS TEXT, AND NOW SOMETHING CHECKS IT.

   HL_Playground's `SearchField.tsx` carried three raw U+0000 bytes,
   typed straight into the template literals that built a lookup key,
   and CRLF endings on all 931 of its lines. Every gate was green the
   whole time: `tsc` clean, 1,914 tests passing, the linter reporting
   the same warnings it always had, the style checker clean. Nothing
   about the PROGRAM was wrong — a NUL inside a template literal is a
   perfectly valid separator. What broke was every tool that reads the
   file as text:

     · `grep` classifies a file containing NUL as binary and prints
       "Binary file … matches" instead of the matching lines, so the
       file silently vanished from every search of the repo;
     · git's `text=auto` does the same, so the `eol=lf` in
       .gitattributes — which the file DID match — never applied, and
       that is why the CRLF survived.

   HL_2.0 has `.gitattributes` and `prettier --check`, and neither of
   them fails on a NUL inside a string. This is the one class of
   defect the guards could not see, so it is a rule.

   ONE FINDING PER FILE PER KIND, with the count in the sentence: the
   file that prompted this would have produced 931 CRLF failures and
   drowned everything else in the run.
   ============================================================ */

const NUL = String.fromCharCode(0)
const CR = String.fromCharCode(13)

export function textHygiene(file: SourceFile): Failure[] {
  const out: Failure[] = []
  const lines = file.text.split('\n')

  const nulAt = lines.findIndex((l) => l.includes(NUL))
  if (nulAt >= 0) {
    const count = file.text.split(NUL).length - 1
    out.push({
      rule: 'source-is-text',
      file: file.path,
      line: nulAt + 1,
      message: `carries ${count} raw U+0000 byte${count === 1 ? '' : 's'}, so grep and git read this file as binary — write the escape instead`,
    })
  }

  const crAt = lines.findIndex((l) => l.endsWith(CR))
  if (crAt >= 0) {
    const count = lines.filter((l) => l.endsWith(CR)).length
    out.push({
      rule: 'source-is-text',
      file: file.path,
      line: crAt + 1,
      message: `ends ${count} line${count === 1 ? '' : 's'} with CR; .gitattributes says eol=lf`,
    })
  }

  return out
}

export const sourceIsText: Rule = {
  name: 'source-is-text',
  /* Everything a person writes, tests included — the defect this
     exists for was in a component and could as easily be in a suite.
     `data/` is deliberately out: it is 11 MB of packed JSON that no
     hand types, and reading it on every run would make the guard slow
     enough to skip. */
  applies: (p) =>
    (under('src/')(p) || under('tools/')(p) || under('e2e/')(p)) &&
    /\.(ts|tsx|css|html|json)$/.test(p),
  check: textHygiene,
}

// ---- the set ------------------------------------------------------------------------

const tokensText = readIfPresent(TOKENS) ?? ''
const manifestText = readIfPresent('data/northside/manifest.json')
const entitiesText = readIfPresent('data/northside/entities.json')
if (!manifestText) {
  console.log(
    'check: data/northside/manifest.json is not packed, so no-cost-column-in-a-screen has nothing to refuse. Run `npm run pack`.',
  )
}
const costNames = costNamesFrom(
  manifestText ? JSON.parse(manifestText) : null,
  entitiesText ? JSON.parse(entitiesText) : null,
)

const readFaces = (): FaceDecl[] =>
  stylesheets(join(ROOT, 'src')).flatMap((path) =>
    facesIn({ path, text: readIfPresent(path) ?? '' }),
  )

/**
 * Layering rules (from the plan's "Guards that keep the seam honest") and the visual rules
 * that land with `src/ui` in Milestone 0 step 7. Every one has a fixture test in
 * `rules.test.ts` proving it can fail: a rule that has never fired measures nothing.
 */
/**
 * A GUARD THAT FIRES ON PROSE IS A GUARD PEOPLE ROUTE AROUND. Both rules below used to scan
 * the raw file, so they fired on the comments that explain why a module does NOT do the thing
 * — `src/domain/io/shelf.ts`'s header, which exists to say that the browser's store is handed
 * in rather than reached for, and `src/app/useStores.ts`'s, which says it hand-rolls no
 * subscription. Both were correct code failing on their own explanation, measured 2026-09-17.
 * They now read `maskCode`'s masked source, where every string literal and comment is blanked
 * and the line numbers still hold, so only real code can trip them.
 */
const codeOnly = (file: SourceFile): SourceFile => ({
  path: file.path,
  text: maskCode(file.text).masked,
})

export const rules: Rule[] = [
  {
    name: 'domain-is-pure',
    applies: (p) => under('src/domain/')(p) && code(p),
    check: (f) =>
      eachLine(
        f,
        /^\s*import\b.*\bfrom\s+['"](react|react-dom|zustand|motion|dexie|@xyflow\/react|@phosphor-icons\/react|lucide-react|@\/state\/|@\/data\/|@\/ui\/|@\/screens\/)/,
        'domain-is-pure',
        'src/domain imports no React, store, DOM, Dexie, icons or app layers',
      ),
  },
  {
    /* THE OTHER HALF OF "src/domain IS PURE", and until round 2 it was
       nobody's. The rule above matches IMPORT LINES, so it can see
       `import { useState } from 'react'` and cannot see
       `document.querySelector`, `window.matchMedia`, `new Image()` or
       `indexedDB.open` written inside a domain function — none of
       which is imported from anywhere. The plan put the globals on the
       agent rather than on the guard ("tools/check.ts enforces the
       imports; you enforce the globals"), which held for one port and
       would not hold for the many sessions that will touch this folder
       next. A rule that cannot catch the regression is the kind of
       tidiness-measuring guard the plan's own diagnosis warns about.

       Measured when it was written: zero findings over 300-odd domain
       files. Every `document` and `window` in the folder is prose
       inside an argued comment, which is why this reads `codeOnly`
       like the two text rules beside it. */
    name: 'domain-touches-no-dom',
    applies: (p) => under('src/domain/')(p) && code(p),
    check: (f) =>
      eachLine(
        codeOnly(f),
        /\b(document|window|navigator|indexedDB|requestAnimationFrame|cancelAnimationFrame|getComputedStyle|matchMedia|FileReader|HTMLElement|HTMLCanvasElement|new\s+Image)\b/,
        'domain-touches-no-dom',
        'src/domain reads no DOM global — the browser is handed in as a port, never reached for',
      ),
  },
  {
    name: 'only-data-imports-dexie',
    applies: (p) => under('src/')(p) && !under('src/data/')(p) && code(p),
    check: (f) =>
      eachLine(
        f,
        /^\s*import\b.*\bfrom\s+['"]dexie['"]/,
        'only-data-imports-dexie',
        'only src/data imports Dexie',
      ),
  },
  {
    name: 'only-prefs-uses-localstorage',
    applies: (p) => under('src/')(p) && p !== 'src/state/prefs.ts' && code(p),
    check: (f) =>
      eachLine(
        codeOnly(f),
        /\b(localStorage|sessionStorage)\b/,
        'only-prefs-uses-localstorage',
        'only src/state/prefs.ts touches localStorage',
      ),
  },
  {
    name: 'no-usesyncexternalstore',
    applies: (p) => under('src/')(p) && code(p),
    check: (f) =>
      eachLine(
        codeOnly(f),
        /\buseSyncExternalStore\b/,
        'no-usesyncexternalstore',
        'state lives in the four zustand stores, not in hand-rolled external stores',
      ),
  },
  noLiteralColour,
  makeNoUndeclaredToken(tokensText),
  noTinyPx,
  noUiSelectorOutsideUi,
  noReaderFacingEntity,
  makeNoCostColumn(costNames),
  makeFontFaceRule(readFaces),
  sourceIsText,
  /* Read once, at load: the old repo's stylesheets are on disk and do not change under us. */
  makeNoOldSystemRule(oldValues()),
]
