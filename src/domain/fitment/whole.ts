/* ============================================================
   SHOW ALL, NARROWED AND FOUND — what the whole list draws once a
   reason's "Show these" has narrowed it or a few words have been typed
   into its find field.

   The screen used to sum these in its component (built-critique-m3-2.md,
   blocker 1, the same class as the first critique's B2): the narrowed
   count, the found count and each group's "more here" were all added up
   in `Whole.tsx`. They are read here, once, and the screen prints them.
   ============================================================ */

import type { WholeGroup, WholeList, WholeRow } from './boat'

/** One group of the whole list as it is drawn: what the words found in it, and the first of them. */
export interface FoundGroup extends WholeGroup {
  /** every line of the group the typed words find; all of it where nothing is typed */
  found: WholeRow[]
  /** the first `limit` of them, drawn */
  drawn: WholeRow[]
  /** found but not drawn: "1,204 more here" */
  more: number
}

export interface Found {
  /** the typed words, lower-cased, one per entry; empty where nothing is typed */
  needles: string[]
  /** a reason's "Show these" narrowed the list to its group */
  narrowed: boolean
  /** how many lines that group holds, of the whole list; 0 where not narrowed */
  narrowedTo: number
  groups: FoundGroup[]
  /** every line the typed words find, across the groups drawn */
  matched: number
}

/** A group belongs to a reason's "Show these" when it is that reason, or one of its makers
 *  ('another:Stacer' under 'another'). */
const inReason = (only: string, group: string): boolean =>
  only === '' || group === only || group.startsWith(`${only}:`)

/**
 * The whole list as it is drawn: narrowed to one reason where `only` names one, and found by
 * every typed word somewhere in a line's words. The made group stays drawn with nothing typed,
 * even empty, so "nothing is made for this boat here" is said where it is true.
 */
export function findInWhole(list: WholeList, only: string, words: string, limit: number): Found {
  const needles = words
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  const narrowed = only !== ''
  const mine = list.groups.filter((g) => inReason(only, g.id))
  const groups = mine
    .map((g): FoundGroup => {
      const found =
        needles.length === 0
          ? g.rows
          : g.rows.filter((r) => needles.every((n) => r.hay.includes(n)))
      const drawn = found.slice(0, limit)
      return { ...g, found, drawn, more: found.length - drawn.length }
    })
    .filter((g) => g.found.length > 0 || (needles.length === 0 && g.id === 'made'))
  return {
    needles,
    narrowed,
    narrowedTo: narrowed ? mine.reduce((n, g) => n + g.rows.length, 0) : 0,
    groups,
    matched: groups.reduce((n, g) => n + g.found.length, 0),
  }
}
