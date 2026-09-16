import type { Rule } from './run'
import { eachLine } from './run'

const under = (prefix: string) => (path: string) => path.startsWith(prefix)
const code = (path: string) => /\.(ts|tsx)$/.test(path) && !/\.test\.tsx?$/.test(path)

/**
 * Layering rules (from the plan's "Guards that keep the seam honest"). The visual rules
 * (literal colour, undeclared token, px floor, `.ui-` reach) land with `src/ui` in step 7.
 */
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
        f,
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
        f,
        /\buseSyncExternalStore\b/,
        'no-usesyncexternalstore',
        'state lives in the four zustand stores, not in hand-rolled external stores',
      ),
  },
]
