/* ============================================================
   EVERY SHORTCUT IN THE APP, IN ONE SEARCHABLE SHEET.

   `?` opens it, from anywhere, under `pointer: fine` only — a phone
   has none of these keys and a sheet listing them would be a wall of
   things that cannot be pressed.

   THE REFERENCE. Linear ships a searchable Keyboard Shortcuts panel
   (`docs/research/refs/shell/live/linear-keyboard-help.png`) and
   Stripe tells a reader in as many words to "press the question mark
   key (?) for a list of available keyboard shortcuts"
   (`hand/stripe-docs-390.png`). The sweep's §2 takes both, and
   PLAN's Milestone 2 exit asks for "every act keyboard-reachable
   with its shortcut inline" — which every screen already does on its
   own controls. What no screen can do is say what the OTHER screens
   answer to, and that is the whole job of this file.

   IT CANNOT GO STALE QUIETLY. `vocabulary.test.ts` reads every
   `.tsx` under `src/screens` off disk, pulls out every literal
   `<Kbd>…</Kbd>` a screen prints, and fails if one of them is not
   listed here. So a screen that teaches a key this sheet has never
   heard of is a red test rather than a sheet that is confidently
   incomplete. The reverse — a key listed here that no screen prints —
   is not an error: the shell's own five are printed by the shell, and
   a key handled on a grid with no room to print it is still a key.
   ============================================================ */

export interface Shortcut {
  /** the keys, exactly as `src/ui/Kbd.tsx` renders them — `Mod` is the
   *  platform's own modifier, Ctrl on Windows and ⌘ on a Mac */
  keys: string
  /** what it does, in the dealer's words */
  act: string
}

export interface ShortcutGroup {
  /** the screen, as the app names it */
  where: string
  /** its address, so a reader can go and try one */
  href?: string
  keys: Shortcut[]
}

export const VOCABULARY: readonly ShortcutGroup[] = [
  {
    where: 'Anywhere',
    keys: [
      { keys: 'Mod K', act: 'Open the finder' },
      { keys: '?', act: 'Open this sheet' },
      {
        keys: 'G',
        act: 'Then a door’s letter: H Home · Q Quotes · C Customers · D Data · Y History',
      },
      { keys: 'Esc', act: 'Close what is open, one layer at a time' },
    ],
  },
  {
    where: 'The finder',
    keys: [
      { keys: '↓', act: 'Down a row — the arrows and not J K, because the field is taking type' },
      { keys: '↑', act: 'Up a row' },
      { keys: 'Enter', act: 'Do what the row says it does' },
      { keys: 'Esc', act: 'Close it, and leave the screen where it was' },
    ],
  },
  {
    where: 'Home',
    href: '/',
    keys: [{ keys: '/', act: 'Into the desk’s own search of the file' }],
  },
  {
    where: 'The quotes register',
    href: '/quotes',
    keys: [
      { keys: 'J', act: 'Down a row' },
      { keys: 'K', act: 'Up a row' },
      { keys: 'Space', act: 'Peek at the one under the cursor — hold it to glance' },
      { keys: 'Enter', act: 'Open it: a draft where it is written, an issued quote as the paper' },
      { keys: '/', act: 'Into the find field' },
      { keys: 'N', act: 'Start a new quote' },
      { keys: 'V', act: 'Make a new version of an issued quote' },
      { keys: 'Esc', act: 'Close the peek, then clear the query' },
    ],
  },
  {
    where: 'The build',
    keys: [{ keys: '/', act: 'Into the field that reaches every chapter' }],
  },
  {
    where: 'Customers',
    href: '/customers',
    keys: [
      { keys: 'J', act: 'Down a row' },
      { keys: 'K', act: 'Up a row' },
      { keys: 'Enter', act: 'Open their page' },
      { keys: '/', act: 'Into the find field' },
      { keys: 'B', act: 'Open the whole book' },
      { keys: 'N', act: 'File a new person' },
      { keys: 'Esc', act: 'Back, then clear the query' },
    ],
  },
  {
    where: 'Data',
    href: '/data',
    keys: [
      { keys: 'J', act: 'Down a row' },
      { keys: 'K', act: 'Up a row' },
      { keys: 'Space', act: 'Open the table’s page in place' },
      { keys: 'Enter', act: 'Open the sheet' },
      { keys: '/', act: 'Into the find field' },
      { keys: 'N', act: 'Make a new table' },
      { keys: '←', act: 'To the makers' },
      { keys: '→', act: 'To the makers' },
      { keys: '↓', act: 'To their pairings' },
      { keys: 'Esc', act: 'Close the page' },
    ],
  },
  {
    where: 'A sheet',
    keys: [
      { keys: 'J', act: 'Down a row' },
      { keys: 'K', act: 'Up a row' },
      { keys: 'Shift ↕', act: 'Extend the selection' },
      { keys: 'X', act: 'Take the whole row' },
      { keys: 'Space', act: 'Peek at the record' },
      { keys: 'Enter', act: 'Edit the cell' },
      { keys: 'Mod D', act: 'Fill down' },
      { keys: 'Mod Z', act: 'Undo the last change' },
      { keys: '/', act: 'Into the find field' },
      { keys: 'Esc', act: 'Close the record, then the edit' },
    ],
  },
  {
    where: 'History',
    href: '/history',
    keys: [
      { keys: 'J', act: 'Down a line' },
      { keys: 'K', act: 'Up a line' },
      { keys: 'Space', act: 'Open a line in place' },
      { keys: 'Enter', act: 'Open the document' },
      { keys: '/', act: 'Into the find field' },
      { keys: 'N', act: 'Start a new quote' },
      { keys: 'Q', act: 'Quote that again, at today’s prices' },
      { keys: 'Esc', act: 'Close the line' },
    ],
  },
]

/** Every distinct chord this app teaches, for the guard next door. */
export const EVERY_KEY: ReadonlySet<string> = new Set(
  VOCABULARY.flatMap((g) => g.keys.map((k) => k.keys)),
)

const fold = (s: string): string => s.trim().toLowerCase()

/**
 * The sheet, narrowed. It matches the KEYS and the ACT and the SCREEN,
 * because a person looking for "undo" does not know it is on the sheet
 * and a person looking for "sheet" wants everything on it.
 *
 * A group with nothing left in it is dropped, so what is drawn is
 * never a heading over nothing.
 */
export function findShortcuts(query: string): ShortcutGroup[] {
  const q = fold(query)
  if (q === '') return [...VOCABULARY]
  const out: ShortcutGroup[] = []
  for (const group of VOCABULARY) {
    const whole = fold(group.where).includes(q)
    const keys = group.keys.filter(
      (k) => whole || fold(k.keys).includes(q) || fold(k.act).includes(q),
    )
    if (keys.length > 0) out.push({ ...group, keys })
  }
  return out
}

export const NO_SHORTCUT = (query: string): string =>
  `No shortcut matches “${query.trim()}”. Every key this app answers to is on this sheet.`
