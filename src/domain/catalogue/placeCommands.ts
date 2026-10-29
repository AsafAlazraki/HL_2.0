/* ============================================================
   A PLACE'S LIVERY, CHANGED THE WAY EVERYTHING IN THE PRICE LIST
   IS CHANGED — one command with its inverse, the sentence the step
   says, and the event the audit keeps (Milestone 4, /places).

   A place is a table of a module (or the whole module, when it holds
   one table), so its livery lives on the module under the table's
   id: `ModuleDef.dress[tableId]`, '' for a module that is one place.
   The module record is what the store already persists and what a
   backup already carries, so a place's line, mark, picture and ground
   travel with nothing new to file.

   ONE ACT, ONE STEP. `dressPlace` replaces one place's whole livery
   with the one handed in, and its inverse puts back exactly the one
   that was there — so "Undo" after choosing a photograph gives back
   the photograph before it, and nothing else on the module moves.
   A livery that ends up with nothing set is REMOVED rather than kept
   as an empty object, so day one and "everything put back" are the
   same record.

   Pure: no React, no store. The clock is the one the store hands in.
   ============================================================ */
import { newId } from '@/domain/id'
import type { ModuleDef, PlaceDress } from '@/domain/model'
import type { CatalogueCommand, CatalogueEvent, Done } from './commands'
import type { CatalogueData } from './sheet'

/** Said where a press finds its place gone (a module deleted underneath it). */
export const PLACE_GONE = 'That place is no longer in the business.'

/** The longest line a place may carry: one line on a card, never a paragraph. */
export const LINE_MAX = 90

/** Said when a line is longer than a card can hold, with the figure it must come under. */
export const lineTooLong = (n: number): string =>
  `A place’s line is one line on its card: ${n} characters is ${n - LINE_MAX} over ${LINE_MAX}.`

/** The livery as it should be stored: trimmed, and every empty part left out. */
export function tidyDress(dress: PlaceDress | undefined): PlaceDress | undefined {
  if (!dress) return undefined
  const line = dress.line?.replace(/\s+/g, ' ').trim() ?? ''
  const out: PlaceDress = {
    ...(line !== '' ? { line } : {}),
    ...(dress.mark ? { mark: dress.mark } : {}),
    ...(dress.hero ? { hero: dress.hero } : {}),
    ...(dress.ground ? { ground: dress.ground } : {}),
  }
  return Object.keys(out).length === 0 ? undefined : out
}

const same = (a: PlaceDress | undefined, b: PlaceDress | undefined): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

function withDress(module: ModuleDef, key: string, dress: PlaceDress | undefined, now: string) {
  const all = { ...module.dress }
  if (dress) all[key] = dress
  else delete all[key]
  const next: ModuleDef = { ...module, updatedAt: now }
  if (Object.keys(all).length > 0) next.dress = all
  else delete next.dress
  return next
}

/**
 * Set one place's livery whole.
 *
 * `key` is the table the place stands for, or '' when the module is one place. `said` is the
 * sentence the step says — the screen knows what was pressed ("Stacer stands on its
 * photograph of the 309 Skimma"), and the inverse says it was taken back in the store's own
 * words. A line over `LINE_MAX` is refused with the figure; nothing changing is silence.
 */
export function dressPlace(
  moduleId: string,
  key: string,
  dress: PlaceDress | undefined,
  said: string,
  name?: string,
): CatalogueCommand {
  return (data: CatalogueData, now: string) => {
    const module = data.modules[moduleId]
    if (!module) return { refused: PLACE_GONE }
    const wanted = tidyDress(dress)
    const line = wanted?.line ?? ''
    if (line.length > LINE_MAX) return { refused: lineTooLong(line.length) }
    const was = module.dress?.[key]
    if (same(was, wanted)) return { refused: '' }

    const next: CatalogueData = {
      ...data,
      modules: { ...data.modules, [moduleId]: withDress(module, key, wanted, now) },
    }
    const where = name ?? module.name
    const event: CatalogueEvent = {
      id: newId(),
      kind: 'place-dressed',
      at: now,
      said,
      label: `Place changed · ${where}`,
      ...(key !== '' ? { tableId: key, tableName: where } : {}),
      changed: [
        {
          path: `modules.${moduleId}.dress.${key === '' ? '-' : key}`,
          from: was ? JSON.stringify(was) : null,
          to: wanted ? JSON.stringify(wanted) : null,
        },
      ],
    }
    const done: Done = {
      next,
      said,
      event,
      inverse: dressPlace(moduleId, key, was, `${where} is back as it was.`, name),
    }
    return done
  }
}
