/* ============================================================
   HOME, AS NORTHSIDE ARRANGES IT (the owner, 2026-10-28: "home page
   configurable").

   The sea comes first and is not Northside's to move: it carries the
   greeting, the one find and New quote, which is what Home is for. Below
   it, three sections Northside may order and hide: the work in hand, the
   boats a quote starts from, and the makers it sells. A hidden section
   is hidden, not deleted, and comes back in one press. With nothing set
   Home is exactly as hl2-home built it.
   ============================================================ */

import type { HomeSection, OrgHome } from '@/domain/model'

/** Home's sections below the sea, in the order hl2-home built them. */
export const HOME_SECTIONS: readonly HomeSection[] = ['desk', 'boats', 'makers']

/** What each is called where it is arranged. */
export const SECTION_SAID: Record<HomeSection, { name: string; holds: string }> = {
  desk: { name: 'The work in hand', holds: 'drafts, quotes given today and people owed a call' },
  boats: {
    name: 'Start from the boat',
    holds: 'the boats with a photograph, each a way to quote it',
  },
  makers: { name: 'What Northside sells', holds: 'every maker, each opening its boats' },
}

const isSection = (v: unknown): v is HomeSection =>
  typeof v === 'string' && (HOME_SECTIONS as readonly string[]).includes(v)

/** The order Home draws its sections in: Northside's, with any it never placed at the end. */
export function sectionOrder(home: OrgHome | undefined): HomeSection[] {
  const kept = (home?.order ?? []).filter(isSection)
  const seen = new Set<HomeSection>()
  const out: HomeSection[] = []
  for (const s of [...kept, ...HOME_SECTIONS]) {
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }
  return out
}

/** Whether Home shows this section. */
export const shows = (home: OrgHome | undefined, section: HomeSection): boolean =>
  !(home?.hidden ?? []).includes(section)

/** The arrangement with one section moved by one place, up (−1) or down (+1). */
export function moved(home: OrgHome | undefined, section: HomeSection, by: -1 | 1): OrgHome {
  const order = sectionOrder(home)
  const at = order.indexOf(section)
  const to = at + by
  if (at < 0 || to < 0 || to >= order.length) return { ...home, order }
  const next = [...order]
  next.splice(at, 1)
  next.splice(to, 0, section)
  return { ...home, order: next }
}

/** The arrangement with one section shown or hidden. */
export function shown(home: OrgHome | undefined, section: HomeSection, show: boolean): OrgHome {
  const hidden = new Set((home?.hidden ?? []).filter(isSection))
  if (show) hidden.delete(section)
  else hidden.add(section)
  const out: OrgHome = { ...home, hidden: HOME_SECTIONS.filter((s) => hidden.has(s)) }
  if (out.hidden?.length === 0) delete out.hidden
  return out
}

/** Whether Home is as it was built: nothing moved, nothing hidden, no boat put first. */
export function asBuilt(home: OrgHome | undefined): boolean {
  const order = sectionOrder(home)
  return (
    order.every((s, i) => s === HOME_SECTIONS[i]) &&
    (home?.hidden ?? []).length === 0 &&
    (home?.first ?? []).length === 0
  )
}

/**
 * The boats Home starts from, with Northside's chosen photographs first in its order and the
 * rest as Home would have drawn them. `id` reads a boat's photograph id.
 */
export function boatsFirst<T>(
  boats: readonly T[],
  first: readonly string[] | undefined,
  id: (b: T) => string,
): T[] {
  const wanted = first ?? []
  const lead = wanted
    .map((pid) => boats.find((b) => id(b) === pid))
    .filter((b): b is T => b !== undefined)
  return [...lead, ...boats.filter((b) => !lead.includes(b))]
}
