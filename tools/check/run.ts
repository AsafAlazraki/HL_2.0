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

export async function runRules(rules: Rule[], root: string): Promise<Failure[]> {
  const failures: Failure[] = []
  for await (const path of walk(root, root)) {
    const wanted = rules.filter((r) => r.applies(path))
    if (wanted.length === 0) continue
    const text = await readFile(join(root, path), 'utf8')
    for (const rule of wanted) failures.push(...rule.check({ path, text }))
  }
  return failures
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
