/**
 * NOTHING RULE-LIKE FROM THE OLD REPO, CHECKED RATHER THAN PROMISED.
 *
 * The plan's one non-negotiable is that no stylesheet, token ramp or rule-like value comes
 * across from HL_Playground: the owner spent weeks there, and every session reached for the
 * same ramp and produced the same look he had already rejected five times.
 *
 * It was promised in the brief of every agent that has touched this repo, and it was broken
 * anyway. Measured 2026-09-17 by the second Milestone 0 critic: three easing tokens in
 * src/styles/tokens.css were byte-identical to HL_Playground/src/styles/system.css:820-822,
 * under the same three names and in the same order. The agent that wrote them had the rule
 * in front of it. A rule that depends on remembering is not a rule.
 *
 * So the old repo's stylesheets are read, every authored declaration value in them is
 * collected, and any value that reappears in ours is a finding. It compares VALUES, not
 * names: `--ease-out` is a sensible name anyone would pick, and `cubic-bezier(0.23, 1, 0.32,
 * 1)` is a decision somebody made.
 *
 * WHAT IS DELIBERATELY NOT COMPARED. A value nobody could have chosen differently — 0, 1,
 * 100%, a bare length, a plain keyword — is shared by every stylesheet ever written and says
 * nothing about where it came from. Only values with authored shape are compared.
 *
 * If the old repo is not on this machine the rule finds nothing and passes. It is evidence,
 * not a dependency: a clone on a fresh machine must still build. THAT IS SAID OUT LOUD RATHER
 * THAN ASSUMED, because CI runs on ubuntu-latest where HL_Playground has never existed, so
 * this rule finds nothing on every CI run: `tools/check.ts` prints how many old values were
 * read and from where, so "the guard compared 214 values" and "the guard compared none" are
 * two different lines in the log instead of the same green tick.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Failure, Rule, SourceFile } from './run'
import { declarationValues } from './rules'

/** Where the old app lives. Overridable, because a second machine will differ. */
export const OLD_REPO =
  process.env.HL_PLAYGROUND ?? join(process.env.USERPROFILE ?? '', 'dev', 'HL_Playground')

const CURVE = /cubic-bezier\(/i
const SHADOWY = /(inset\s|blur\(|drop-shadow\(|\d+px\s+\d+px)/i
const COLOURED = /(rgba?|hsla?|oklch|oklab|#[0-9a-f]{3,8})/i
const GRADIENT = /(linear|radial|conic)-gradient\(/i
const THREE_UP = /[a-z][^,;]*,[^,;]+,[^,;]+/i
const GENERIC_FAMILY = /(serif|sans-serif|monospace|system-ui)/i
const NOTHING_SAID = /^(0|1|none|auto|inherit|initial|unset|transparent|currentcolor)$/i

/**
 * THE ONE EXEMPTION, AND WHY IT IS NARROW.
 *
 * A published standard is not the old repo's decision even when the old repo also used it.
 * Material Design's standard curve appears in half the stylesheets on the web; that HL_
 * Playground declared it too is coincidence of both citing the same public spec, not
 * inheritance. Refusing it would push the next person toward a worse curve chosen only for
 * being different, which is the opposite of the point.
 *
 * So the exemption is a list, not a judgement: a value is allowed past only when it is named
 * here WITH the spec it comes from, so a reader can check the source rather than trust this
 * file. Anything not on the list is a finding. Keep it short; if it grows past a handful,
 * the ramp is being re-imported one line at a time.
 */
export const CITED = new Map<string, string>([
  [
    'cubic-bezier(0.2, 0, 0, 1)',
    'md.sys.motion.easing.standard — m3.material.io/styles/motion/easing-and-duration/tokens-specs',
  ],
  [
    'cubic-bezier(0.4, 0, 0.2, 1)',
    'md.sys.motion.easing.legacy (the M2 standard curve) — m3.material.io/styles/motion/easing-and-duration/tokens-specs',
  ],
  [
    'cubic-bezier(0.05, 0.7, 0.1, 1)',
    'md.sys.motion.easing.emphasized.decelerate — m3.material.io/styles/motion/easing-and-duration/tokens-specs',
  ],
])

/** A value worth comparing: one nobody arrives at twice by accident. */
export function isDecision(value: string): boolean {
  const v = value.trim().replace(/;$/, '')
  if (v.length < 8) return false
  if (NOTHING_SAID.test(v)) return false
  if (CURVE.test(v)) return true
  if (SHADOWY.test(v) && COLOURED.test(v)) return true
  if (GRADIENT.test(v)) return true
  if (THREE_UP.test(v) && GENERIC_FAMILY.test(v)) return true
  return false
}

function stylesheetsUnder(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) stylesheetsUnder(full, acc)
    else if (entry.endsWith('.css')) acc.push(full)
  }
  return acc
}

/** Every authored value the old repo's stylesheets declare. Read once, at load. */
export function oldValues(root = OLD_REPO): Set<string> {
  const out = new Set<string>()
  for (const file of stylesheetsUnder(join(root, 'src'))) {
    for (const { value } of declarationValues(readFileSync(file, 'utf8'))) {
      const v = value.trim().replace(/;$/, '')
      if (isDecision(v)) out.add(v)
    }
  }
  return out
}

const SAY = (v: string): string =>
  `"${v}" is byte-identical to a value in HL_Playground's stylesheets. Nothing rule-like comes across from the old repo: choose it here. If it is a published standard and the match is coincidence, add it to CITED in tools/check/oldSystem.ts with the spec it comes from.`

/**
 * A stylesheet is not the only place a ramp lands. The round-2 finding this rule was written
 * for had two halves: three easing tokens in `src/styles/tokens.css` AND `src/ui/motion.ts`'s
 * springs, which were the same old ladder expressed in seconds. The rule as first written saw
 * only the first half, because `applies` was `path.endsWith('.css')`. So a `.ts` or `.tsx`
 * under `src/` is read too — not parsed as CSS, which it is not, but searched for the old
 * values as literal strings, which is the shape a curve takes when it is lifted into a
 * `transition` template or a motion config.
 *
 * `src/` only, and never a test: `tools/check/rules.test.ts` fabricates an old-repo value in
 * order to prove this rule fires, and a guard that refuses its own fixture is a guard that
 * cannot be tested.
 */
const codeUnderSrc = (path: string): boolean =>
  path.startsWith('src/') && /\.(ts|tsx)$/.test(path) && !/\.test\.tsx?$/.test(path)

export function makeNoOldSystemRule(values: Set<string>): Rule {
  /* Sorted longest-first so a file carrying a whole shadow is named by the whole shadow
     rather than by a fragment of it that happens also to be a decision on its own. */
  const lifted = [...values].filter((v) => !CITED.has(v)).toSorted((a, b) => b.length - a.length)
  return {
    name: 'no-old-design-system',
    applies: (path) => path.endsWith('.css') || codeUnderSrc(path),
    check: (file: SourceFile): Failure[] => {
      if (values.size === 0) return []
      const out: Failure[] = []
      if (file.path.endsWith('.css')) {
        for (const { value, line } of declarationValues(file.text)) {
          const v = value.trim().replace(/;$/, '')
          if (isDecision(v) && values.has(v) && !CITED.has(v))
            out.push({ rule: 'no-old-design-system', file: file.path, line, message: SAY(v) })
        }
        return out
      }
      file.text.split('\n').forEach((text, i) => {
        for (const v of lifted) {
          if (!text.includes(v)) continue
          out.push({ rule: 'no-old-design-system', file: file.path, line: i + 1, message: SAY(v) })
          break
        }
      })
      return out
    },
  }
}
