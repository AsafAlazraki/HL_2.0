/* ============================================================
   NORTHSIDE'S PEOPLE, AND THE ONE SWITCH.

   A handful of people at one dealership: a name, a title, a phone and an
   email, so a quote says who prepared it and how to reach them. No
   roles, no hierarchy, no invites (the owner's narrowing, 2026-09-23).

   ONE DISTINCTION EARNS ITS PLACE: who may change prices and settings.
   Everybody may until somebody is set apart, and the act refused says
   why where it was attempted. IT IS NOT A PASSWORD: the door takes a
   name, and anybody may type any name there (src/state/session.ts).
   What it is for is a salesperson not changing a price by mistake.
   ============================================================ */

import type { OrgPerson, OrgProfile } from '@/domain/model'
import { personNamed } from './letterhead'

/** Whether this person may change prices and settings. */
export const mayChange = (person: OrgPerson): boolean => person.mayChange !== false

/**
 * WHY THE PERSON AT THE KEYBOARD MAY NOT CHANGE PRICES OR SETTINGS, or null when they may.
 * Only a person Northside has set apart is refused; a name nobody has listed is not.
 */
export function changeRefusal(
  org: Pick<OrgProfile, 'people'> | null | undefined,
  who: string | null | undefined,
): string | null {
  const person = personNamed(org?.people, who)
  if (!person || mayChange(person)) return null
  const others = (org?.people ?? []).filter((p) => p.id !== person.id && mayChange(p))
  const ask =
    others.length === 0
      ? ''
      : ` ${others
          .slice(0, 2)
          .map((p) => p.name)
          .join(' or ')} may.`
  return `${person.name} is set apart from changing prices and settings, so nothing was changed.${ask}`
}

/** Why a person cannot be set apart: the last one who may change settings cannot be. */
export function setApartRefusal(
  people: readonly OrgPerson[],
  id: string,
  next: boolean,
): string | null {
  if (next) return null
  const left = people.filter((p) => p.id !== id && mayChange(p))
  return left.length === 0
    ? 'Somebody has to be able to change prices and settings, and this is the last person who may.'
    : null
}

/** Why a name cannot be a person here, or null. */
export function personNameRefusal(
  people: readonly OrgPerson[],
  name: string,
  id?: string,
): string | null {
  const clean = name.trim()
  if (clean === '') return 'A person needs a name: it is what the quote prints as prepared by.'
  const twin = people.find(
    (p) => p.id !== id && p.name.trim().toLowerCase() === clean.toLowerCase(),
  )
  return twin ? `${twin.name} is already one of Northside’s people.` : null
}

/** The names the door offers: Northside's people, in the order they were added. */
export const namesKnown = (org: Pick<OrgProfile, 'people'> | null | undefined): string[] =>
  (org?.people ?? []).map((p) => p.name)
