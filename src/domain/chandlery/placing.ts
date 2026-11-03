/* ============================================================
   PLACING WHAT NO AISLE NAMES — a Northside setting with its way back
   (the judge of the chandlery, J11 and major 11: "28 parts sit
   unsorted and only a code change can move them").

   An aisle gathers headings of the price list by their start
   (`src/domain/catalogue/aisles.ts`), and a heading it does not name
   stands in "Not sorted yet" — the true state, never a guess. On the
   live list that is the 3 DFO kits and 25 lines filed under no heading
   at all: batteries, trailer plugs, a fender, ropes.

   NORTHSIDE MAY PUT THEM IN AN AISLE. A heading is placed whole, so a
   heading's next line lands where its others are; a line with no
   heading is placed on its own, because "no heading" is not a group.
   The placing is kept on Northside's own profile (`OrgProfile.aisles`)
   by one command with its sentence and its exact way back, empty on
   day one. Taking a placing back returns the line to the aisle its
   heading names, or to "Not sorted yet".

   PURE: a line and the placings in, its aisle out.
   ============================================================ */
import type { OrgProfile } from '@/domain/model'
import type { CatalogueCommand } from '@/domain/catalogue/commands'
import { changeOrg, withKey } from '@/domain/catalogue/orgCommands'
import { aisleById, aisleOf, UNSORTED } from '@/domain/catalogue/aisles'

/** Northside's placings: `heading:<heading>` or `line:<id>` → an aisle's id. */
export type Placings = Readonly<Record<string, string>>

/** WHAT IS PLACED WHEN A LINE IS PLACED: its heading, or the line itself where it has none. */
export function placeKeyOf(line: { id: string; heading: string | null | undefined }): string {
  const h = (line.heading ?? '').trim()
  return h === '' ? `line:${line.id}` : `heading:${h}`
}

/** A LINE'S AISLE: where Northside placed it, else where its heading's start names. */
export function aisleWithPlacings(
  line: { id: string; heading: string | null | undefined },
  placed: Placings | undefined,
): string {
  const at = placed?.[placeKeyOf(line)]
  if (at && at !== UNSORTED && aisleById(at)) return at
  return aisleOf(line.heading)
}

/** Whether this line stands where it does because Northside placed it there. */
export const isPlaced = (
  line: { id: string; heading: string | null | undefined },
  placed: Placings | undefined,
): boolean => {
  const at = placed?.[placeKeyOf(line)]
  return Boolean(at && at !== UNSORTED && aisleById(at))
}

/**
 * NORTHSIDE PUTS A HEADING, OR A LINE WITH NONE, IN AN AISLE — or takes the placing back (`aisle`
 * null). `said` is what is placed, as the screen says it: "DFO kits", "Battery · 12V 100Ah".
 */
export function placeInAisle(key: string, aisle: string | null, said: string): CatalogueCommand {
  const to = aisle === null ? undefined : aisleById(aisle)
  const sentence =
    aisle === null
      ? `${said} is back where the price list puts it`
      : `${said} is now in ${to?.name ?? 'an aisle'}`
  return changeOrg(sentence, 'aisles', (org: OrgProfile) => {
    if (!/^(heading|line):./.test(key)) return 'Only a heading or a line can be put in an aisle.'
    if (aisle !== null && (!to || aisle === UNSORTED))
      return `There is no aisle called “${aisle}” to put ${said} in.`
    const next: Record<string, string> = { ...org.aisles }
    if (aisle === null) delete next[key]
    else next[key] = aisle
    return withKey(org, 'aisles', Object.keys(next).length > 0 ? next : undefined)
  })
}
