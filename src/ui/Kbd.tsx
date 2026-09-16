/**
 * A key or a chord, one cap per key: `<Kbd>Mod K</Kbd>`. "Mod" is the platform's command
 * key, so a shortcut reads as ⌘ K on a Mac and Ctrl K everywhere else.
 */
export function Kbd({ children }: { children: string }) {
  const keys = children.trim().split(/\s+/).filter(Boolean)
  return (
    <kbd className="ui-kbd">
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
