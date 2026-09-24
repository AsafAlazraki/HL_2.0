/* ============================================================
   THE SHEET CANNOT GO STALE QUIETLY.

   A hand-kept list of "every shortcut in the app" is a list that is
   wrong the first week and confidently wrong the second. This reads
   the screens off disk — the same way `tools/check.ts`'s rules read
   the real tree rather than a fixture — pulls out every literal
   `<Kbd>…</Kbd>` a screen prints, and fails if one of them is not on
   the sheet.

   IT READS LITERALS ONLY. `History.tsx` prints `<Kbd>{SPAN_KEY[s]}</Kbd>`
   and the sheet's own rows print `<Kbd>{shortcut}</Kbd>`; a regular
   expression cannot evaluate either, and pretending it can is how a
   guard comes to measure nothing. What it can do is prove it read
   something: the count of files and of distinct chords is asserted to
   be non-zero, which is the same non-vacuity `tools/check.ts` learned
   to demand after a rule was found scoped to a folder that did not
   exist.
   ============================================================ */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { EVERY_KEY, VOCABULARY, findShortcuts, NO_SHORTCUT } from './vocabulary'

const SCREENS = fileURLToPath(new URL('..', import.meta.url))

function everyScreenFile(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...everyScreenFile(path))
    else if (entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) out.push(path)
  }
  return out
}

describe('the ? sheet holds every key a screen teaches', () => {
  const files = everyScreenFile(SCREENS)

  it('read the screens at all', () => {
    expect(files.length).toBeGreaterThan(5)
    expect(EVERY_KEY.size).toBeGreaterThan(10)
  })

  it('lists every literal keycap printed anywhere under src/screens', () => {
    const missing: string[] = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      for (const hit of source.matchAll(/<Kbd>([^<{]+)<\/Kbd>/g)) {
        const keys = hit[1]!.trim()
        if (keys !== '' && !EVERY_KEY.has(keys)) {
          missing.push(`${file.slice(SCREENS.length)} prints ${keys}`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})

describe('narrowing the sheet', () => {
  it('answers a key, a word and a screen, and drops an empty group', () => {
    const byKey = findShortcuts('Mod Z')
    expect(byKey).toHaveLength(1)
    expect(byKey[0]?.keys).toHaveLength(1)

    const byWord = findShortcuts('undo')
    expect(byWord.flatMap((g) => g.keys.map((k) => k.keys))).toContain('Mod Z')

    /* A SCREEN'S NAME TAKES THE WHOLE SCREEN, and any other line that
       names it too, which is a true answer to "history" and not a stray
       one. */
    const byScreen = findShortcuts('history')
    const diary = byScreen.find((g) => g.where === 'History')
    expect(diary?.keys.length).toBeGreaterThan(4)
    for (const group of byScreen) {
      if (group.where === 'History') continue
      expect(group.keys.every((k) => /history/i.test(k.act))).toBe(true)
    }
  })

  it('gives the whole sheet back for an empty query, and says so when nothing matches', () => {
    expect(findShortcuts('')).toHaveLength(VOCABULARY.length)
    expect(findShortcuts('zzzz')).toHaveLength(0)
    expect(NO_SHORTCUT('zzzz')).toContain('zzzz')
  })
})
