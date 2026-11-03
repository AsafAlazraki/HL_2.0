/* ============================================================
   WHICH PARTS AN AISLE SHOWS, AND EVERY CHOICE COUNTED UNDER THE
   OTHERS (the verifier of the chandlery, round 2: "With 'Pictured 1'
   on, the chips still say Every supplier 66, LSM 21…").

   An aisle is narrowed three ways — which parts (pictured, all, no
   picture), the supplier, and find — and each choice says how many
   it would show WITH THE OTHER TWO AS THEY STAND, so a count is
   always what a press would draw.

   "No picture" is the parts that could take one and have none: a
   labour line or a note of the workbook is never drawn with a picture
   and offers no way to add one, so it is under All alone.

   PURE: lines and the readers in; the counts out.
   ============================================================ */

export type Show = 'all' | 'pictured' | 'without'

export interface ShowReaders<L> {
  pictured: (line: L) => boolean
  /** whether the line could be given a picture at all */
  takes: (line: L) => boolean
}

/** Whether a line is among the parts shown. */
export function inShow<L>(line: L, show: Show, read: ShowReaders<L>): boolean {
  if (show === 'pictured') return read.pictured(line)
  if (show === 'without') return read.takes(line) && !read.pictured(line)
  return true
}

/** How many lines each of Pictured · All · No picture would show. */
export function showCounts<L>(lines: readonly L[], read: ShowReaders<L>): Record<Show, number> {
  let pictured = 0
  let without = 0
  for (const line of lines) {
    if (read.pictured(line)) pictured += 1
    else if (read.takes(line)) without += 1
  }
  return { pictured, all: lines.length, without }
}

/**
 * THE SUPPLIERS AS THE CHIPS COUNT THEM: those with a line shown, most lines first as given, and
 * the one chosen kept at 0 where none of its lines is shown, so the press that lets it go stays.
 */
export function suppliersShown<S extends { said: string; lines: number }>(
  counted: readonly S[],
  every: readonly S[],
  chosen: string,
): S[] {
  const out = counted.filter((s) => s.lines > 0)
  if (chosen !== '' && !out.some((s) => s.said === chosen)) {
    const was = every.find((s) => s.said === chosen)
    if (was) out.push({ ...was, lines: 0 })
  }
  return out
}
