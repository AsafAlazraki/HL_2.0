/* ============================================================
   NORTHSIDE'S SETTINGS, CHANGED AS EVERY OTHER CHANGE IS: one command,
   a sentence, an exact way back, and a typed step in the history.

   They ride the catalogue's own stack (`src/state/catalogue.ts`) rather
   than a fifth store (CLAUDE.md: four stores), so the Undo a manager is
   offered after setting the ABN is the same Undo that follows a price,
   and a settings change refused for a person set apart is refused by
   the same door (`changeRefusal`).

   THE PROFILE IS WRITTEN WHOLE AND PUT BACK WHOLE. The way back closes
   over the profile as it stood, by reference: undoing "Phone set"
   restores the phone and nothing else can have moved, because the
   profile is one value.
   ============================================================ */

import { newId } from '@/domain/id'
import type { OrgProfile } from '@/domain/model'
import type { CatalogueChange, CatalogueCommand, CatalogueEvent } from './commands'
import type { CatalogueData } from './sheet'

/** Said when there is no business named to keep details for. */
export const NO_BUSINESS =
  'No price list is open here, so there is no business to keep these details for. Open the Master Price File first.'

const LABEL = 'Settings changed'

/** The profile a first change starts from: the business as the price list names it. */
export function profileToChange(data: CatalogueData): OrgProfile | null {
  if (data.org) return data.org
  const name = data.business?.trim() ?? ''
  if (name === '') return null
  return {
    name,
    industry: 'marine',
    /* the price list does not say when the business was set up, and a date here would be one
       nobody said (the same reasoning as `orgNamedByTheFile`) */
    createdAt: '',
    ...(data.orgId ? { slug: data.orgId } : {}),
  }
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)

const value = (v: unknown): string | number | boolean | null =>
  v === undefined || v === null
    ? null
    : typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
      ? v
      : JSON.stringify(v).length > 120
        ? 'changed'
        : JSON.stringify(v)

/** Put the profile back exactly as it was — the way back from every settings change. */
function putBack(was: OrgProfile | undefined, said: string): CatalogueCommand {
  return (data, now) => {
    if (same(data.org, was)) return { refused: '' }
    /* THE KEY STAYS, EMPTY: the store merges what a command hands it, so a profile undone to
       none has to be said as none, or the one before it would stand */
    const next: CatalogueData = { ...data, org: was }
    return {
      next,
      said,
      inverse: putBack(data.org, said),
      event: eventOf(now, said, [
        { path: 'org', from: value(data.org?.name), to: value(was?.name) },
      ]),
    }
  }
}

function eventOf(at: string, said: string, changed: CatalogueChange[]): CatalogueEvent {
  return { id: newId(), kind: 'settings-changed', at, said, label: LABEL, changed }
}

/**
 * ONE SETTINGS CHANGE. `change` returns the profile as it should now stand, or a sentence that
 * refuses it. `path` names what moved for the history. A change that changes nothing is no step.
 */
export function changeOrg(
  said: string,
  path: string,
  change: (org: OrgProfile) => OrgProfile | string,
): CatalogueCommand {
  return (data, now) => {
    const base = profileToChange(data)
    if (!base) return { refused: NO_BUSINESS }
    const next = change(base)
    if (typeof next === 'string') return { refused: next }
    if (same(next, data.org)) return { refused: '' }
    const from = (data.org as Record<string, unknown> | undefined)?.[path.split('.')[0]!]
    const to = (next as unknown as Record<string, unknown>)[path.split('.')[0]!]
    return {
      next: { ...data, org: next },
      said,
      inverse: putBack(data.org, `${said}, undone`),
      event: eventOf(now, said, [{ path: `org.${path}`, from: value(from), to: value(to) }]),
    }
  }
}

/** A profile with one key set, or cleared where the value is undefined. */
export function withKey<K extends keyof OrgProfile>(
  org: OrgProfile,
  key: K,
  v: OrgProfile[K] | undefined,
): OrgProfile {
  const next = { ...org }
  if (v === undefined) delete next[key]
  else next[key] = v
  return next
}
