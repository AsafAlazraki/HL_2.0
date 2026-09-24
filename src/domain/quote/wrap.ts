/* ============================================================
   A NAME NEVER WRAPS ONTO ITS OWN SEPARATOR.

   "Highfield ADV7 · Hypalon · Black / Grey / Black" is set in a
   column as wide as the screen leaves it, and the browser breaks it
   at any space — so at 834 the cascade's card read "Highfield ADV7 ·
   Hypalon / · Black / Grey / Black", and at 1440 the register's peek
   read "…Black / Grey / / Black": a line starting on the "·" or the
   "/" that belongs to the word before it (m2-last-critique.md,
   minor 8). A reader takes a line that opens on a separator as a
   fragment.

   The space BEFORE a spaced separator becomes a no-break space, so the
   separator travels with the word it follows and a line can only break
   after it. No word changes, every whitespace-blind reading of the
   name (a search, a find in the page, a screen reader) reads it as
   before, and a name with no spaced separator ("White/Blue", "Yamaha
   F250XCB") is handed back as it came.
   ============================================================ */

const NO_BREAK = ' '

/** A spaced "·" or "/" between two words. */
const SPACED_SEPARATOR = /(?<=\S) ([/·]) (?=\S)/g

/** A name set so no line of it can start on "·" or "/". */
export const keepSeparators = (text: string): string =>
  text.replace(SPACED_SEPARATOR, `${NO_BREAK}$1 `)

/* ============================================================
   AND IT BREAKS AT ITS LARGEST JOINT FIRST.

   A name set only by `keepSeparators` still breaks at the last space
   that fits, so at 1440 the register's peek read "Highfield ADV7 ·
   Hypalon · Black /" over "Grey / Black": no line opened on a
   separator, and the colourway was cut in two. A person reading the
   name aloud pauses at the "·" between the boat, its material and its
   colourway, and not inside "Black / Grey / Black".

   `jointsOf` hands a screen the name's parts at its largest joint —
   the spaced "·" where the name has one, else the spaced "/" of a
   colourway said alone — each set by `keepSeparators` and keeping the
   separator that follows it. A screen draws each part as one box that
   breaks inside itself only when it is wider than the whole line, so
   a line breaks between the boat, its material and its colourway
   before it breaks inside any of them. Joined with a space the parts
   ARE `keepSeparators(text)`, so the name's text is unchanged.
   ============================================================ */

const SPACED_DOT = /(?<=\S) · (?=\S)/
const SPACED_SLASH = /(?<=\S) \/ (?=\S)/

/** A name's parts at its largest spaced joint, each keeping the separator after it. */
export const jointsOf = (text: string): string[] => {
  const joint = SPACED_DOT.test(text) ? '·' : SPACED_SLASH.test(text) ? '/' : null
  if (joint === null) return text === '' ? [] : [keepSeparators(text)]
  const at = new RegExp(`(?<=\\S) ${joint === '·' ? '·' : '\\/'} (?=\\S)`, 'g')
  const parts = text.split(at)
  return parts.map((part, i) =>
    keepSeparators(i < parts.length - 1 ? `${part}${NO_BREAK}${joint}` : part),
  )
}
