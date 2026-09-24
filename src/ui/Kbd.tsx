/**
 * A key or a chord, one cap per key: `<Kbd>Mod K</Kbd>`. "Mod" is the platform's command
 * key, so a shortcut reads as ⌘ K on a Mac and Ctrl K everywhere else.
 *
 * IT IS NOT DRAWN ON A COARSE POINTER, by its own stylesheet (`kbd.css`), so a phone is
 * never shown a key it does not have. A screen that puts a cap inside a SENTENCE still owes
 * that sentence a touch twin; the cap going away is the primitive's half of the rule.
 *
 * `tone="quiet"` IS THE CAP FOR A SURFACE WHERE THE KEY IS A HINT AND NOT A LESSON — the
 * shell's pill and its finder, where a light cap on the dark room was the brightest object on
 * the bar, brighter than the door that says where a person is. It is the same cap drawn in the
 * room's own wash and rule rather than in paper; a legend that TEACHES keys keeps the default.
 */
export function Kbd({ children, tone }: { children: string; tone?: 'quiet' }) {
  const keys = children.trim().split(/\s+/).filter(Boolean)
  return (
    <kbd className={tone === 'quiet' ? 'ui-kbd ui-kbd--quiet' : 'ui-kbd'}>
      {keys.map((key, i) => (
        /* A cap's identity IS its place in the chord: "G G" is two caps of the same key,
           so the key alone does not identify one. The list is derived from a string prop
           and never reorders, inserts or filters, which is the reconciliation bug the rule
           exists to catch. */
        // eslint-disable-next-line react/no-array-index-key
        <kbd key={i} className="ui-kbd-key">
          {platformKey(key)}
        </kbd>
      ))}
    </kbd>
  )
}

export function platformKey(key: string, mac: boolean = isMac()): string {
  if (key === 'Mod') return mac ? '⌘' : 'Ctrl'
  return key
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '')
}
