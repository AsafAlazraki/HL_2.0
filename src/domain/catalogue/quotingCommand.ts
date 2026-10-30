/* ============================================================
   A PLACE THAT CAN BE QUOTED ON ITS OWN — switched on by Northside,
   the way every other part of a place is changed (the flow round,
   2026-10-30).

   The owner, 2026-10-30: "quotes are not just boats - also motors or
   trailers or even dealer fit things as well and you can sell those
   as well." A quote starts from any place whose verbs include
   `quote` (`src/domain/quote/start.ts`), and the verbs were written
   once, when the place was made (`modules/mint.ts`): Parts &
   Accessories and Dealer Fit Packages took the defaults, browse,
   search and open, and nothing could ever change them
   (exposure.md, blocker).

   ONE ACT, ONE STEP, ITS WAY BACK. `letQuote` adds or takes away the
   one verb `quote` on one place and nothing else, and its inverse
   puts the verbs back exactly as they were. It is a place's own
   setting, kept on the module the store persists and the backup
   carries, never an edit of the seed.

   Pure: no React, no store. The clock is the one the store hands in.
   ============================================================ */
import { newId } from '@/domain/id'
import type { ModuleCapability } from '@/domain/model'
import type { CatalogueCommand, CatalogueEvent, Done } from './commands'
import { PLACE_GONE } from './placeCommands'

/** Can a quote start from this place today? */
export const quotesOnItsOwn = (capabilities: readonly ModuleCapability[]): boolean =>
  capabilities.includes('quote')

/**
 * Let a place be quoted on its own, or stop it.
 *
 * The sentence names the place: "Parts & Accessories can now be quoted on its own." Nothing
 * changing is silence, the store's own way of saying a press did nothing.
 */
export function letQuote(moduleId: string, on: boolean): CatalogueCommand {
  return (data, now) => {
    const module = data.modules[moduleId]
    if (!module) return { refused: PLACE_GONE }
    const was = module.capabilities
    if (quotesOnItsOwn(was) === on) return { refused: '' }
    const next: ModuleCapability[] = on ? [...was, 'quote'] : was.filter((c) => c !== 'quote')
    const said = on
      ? `${module.name} can now be quoted on its own.`
      : `${module.name} is now sold only with a boat.`
    return verbs(moduleId, next, said)(data, now)
  }
}

/** The place's verbs set whole; its inverse sets back exactly the list that was there. */
function verbs(moduleId: string, next: ModuleCapability[], said: string): CatalogueCommand {
  return (data, now) => {
    const module = data.modules[moduleId]
    if (!module) return { refused: PLACE_GONE }
    const was = module.capabilities
    const event: CatalogueEvent = {
      id: newId(),
      kind: 'place-dressed',
      at: now,
      said,
      label: `Place changed · ${module.name}`,
      changed: [
        { path: `modules.${moduleId}.capabilities`, from: was.join(' '), to: next.join(' ') },
      ],
    }
    const done: Done = {
      next: {
        ...data,
        modules: { ...data.modules, [moduleId]: { ...module, capabilities: next, updatedAt: now } },
      },
      said,
      event,
      inverse: verbs(
        moduleId,
        was,
        quotesOnItsOwn(was)
          ? `${module.name} can be quoted on its own again.`
          : `${module.name} is sold only with a boat again.`,
      ),
    }
    return done
  }
}
