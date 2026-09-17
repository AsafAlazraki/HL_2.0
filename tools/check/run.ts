import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

export interface Failure {
  rule: string
  file: string
  line?: number
  message: string
}

export interface SourceFile {
  /** Repo-relative, forward slashes, so a rule can match `src/domain/…` on any OS. */
  path: string
  text: string
}

export interface Rule {
  name: string
  /** Which files the rule reads; a predicate over the repo-relative path. */
  applies: (path: string) => boolean
  check: (file: SourceFile) => Failure[]
}

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.vite-cache', 'test-results', 'legacy'])
const EXTENSIONS = /\.(ts|tsx|css|json|html)$/

async function* walk(root: string, dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const s = await stat(full)
    if (s.isDirectory()) yield* walk(root, full)
    else if (EXTENSIONS.test(entry)) yield relative(root, full).split(sep).join('/')
  }
}

export interface RunReport {
  failures: Failure[]
  /**
   * How many files each rule actually READ, in the order the rules were declared.
   *
   * WHY A RULE'S FILE COUNT IS PART OF THE REPORT. Measured by the round-3 critic:
   * `no-cost-column-in-a-screen` was scoped to `src/screens/`, a folder that does not exist
   * on this tree, so the guard that protects "cost and margin never reach a customer-facing
   * surface" read zero files — and the run printed `check: 14 rules, no failures`, which is
   * exactly what it prints when fourteen rules have really looked. A rule aimed at an empty
   * folder and a rule that passed were indistinguishable, which is the precise failure the
   * plan's fixture tests exist to prevent and which a fixture test structurally cannot see:
   * a fixture hands the rule a fabricated `src/screens/…` path, so it passes either way.
   * Only a walk of the real tree knows.
   */
  read: { rule: string; files: number }[]
}

export async function runRules(rules: Rule[], root: string): Promise<RunReport> {
  const failures: Failure[] = []
  const read = new Map<string, number>(rules.map((r) => [r.name, 0]))
  for await (const path of walk(root, root)) {
    const wanted = rules.filter((r) => r.applies(path))
    if (wanted.length === 0) continue
    const text = await readFile(join(root, path), 'utf8')
    for (const rule of wanted) {
      read.set(rule.name, (read.get(rule.name) ?? 0) + 1)
      failures.push(...rule.check({ path, text }))
    }
  }
  return { failures, read: rules.map((r) => ({ rule: r.name, files: read.get(r.name) ?? 0 })) }
}

/**
 * A rule that read no files at all, stated as a failure of the rule rather than of a file.
 *
 * It is a function here rather than four lines in `tools/check.ts` so that it has a fixture
 * test of its own: the whole point of this report is that a guard which measures nothing must
 * be loud, and a refusal nobody has watched fire is the same shape of problem one rung up.
 */
export function blindRules(read: RunReport['read']): Failure[] {
  return read
    .filter((r) => r.files === 0)
    .map((r) => ({
      rule: r.rule,
      file: '(no file)',
      message:
        'read no files at all — its scope names a folder that is not in this tree, so it is measuring nothing',
    }))
}

/** Helper for rules that flag every line matching a pattern. */
export function eachLine(
  file: SourceFile,
  pattern: RegExp,
  rule: string,
  message: string,
): Failure[] {
  const out: Failure[] = []
  file.text.split('\n').forEach((line, i) => {
    if (pattern.test(line)) out.push({ rule, file: file.path, line: i + 1, message })
  })
  return out
}
