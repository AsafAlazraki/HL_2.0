/**
 * A HELD SPACE IS A GLANCE, A TAPPED ONE A PEEK (Linear's peek: tap Space to open the record and
 * leave it open, hold it to look and let go to shut it).
 *
 * WHAT IS TIMED, AND FROM WHEN (Milestone 3's close, 2026-10-29). The hold was the time between
 * the two key handlers running, read off the clock when each ran. Opening the record is a render
 * of the whole sheet, and on a busy machine the key-up was handled more than a fifth of a second
 * after the key-down even when the key had been tapped: the tap was read as a hold and the record
 * shut the moment it opened: on 6 runs in 40 at desk sizes (the gate, its rerun and two repeated
 * runs of the sheet's Space walk), and in a probe of 30 taps the key-up was handled 82 to 193 ms
 * after the key-down (2026-10-29).
 *
 * So a glance is a hold that outlasts the record's opening. The press that opens it marks when
 * its own work is done (a task queued behind it); the hold is counted from the later of that mark
 * and the key going down, on the events' own time stamps; and a key that comes up before the
 * record has finished opening is a tap, because nobody has glanced at a record that is not there
 * yet. In the probe the key-up was handled before that mark on 24 taps of 30.
 */

/** Under a fifth of a second is a tap. */
export const HOLD_MS = 200

/**
 * True when letting go of Space should shut the record it opened.
 *
 * @param down   the key-down event's time stamp
 * @param opened when the press had finished opening the record, on the same clock; `null` if it
 *               has not yet
 * @param up     the key-up event's time stamp
 */
export function heldAsGlance(down: number, opened: number | null, up: number): boolean {
  if (opened === null) return false
  return up - Math.max(down, opened) >= HOLD_MS
}
