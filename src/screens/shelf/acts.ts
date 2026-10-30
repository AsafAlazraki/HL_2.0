/* ============================================================
   THE SHELF'S FOUR ACTS ON THIS COMPUTER'S OWN KEEPING — save a copy,
   bring one back, clear the price list, forget everything.

   NONE OF THEM IS A STEP ON THE PRICE LIST. A change to a figure is a
   command with an inverse (`newFileCommand`, the Undo beside Apply);
   these four put a whole computer's keeping into a state, and a load is
   not a step (`src/state/catalogue.ts`, "A LOAD IS NOT A STEP"). So
   they go to the repositories through `src/data`, exactly as the boot
   does when it files the Master Price File the first time, and then the
   page is opened again so every store reads what is now kept — the one
   way no screen is left holding the computer as it was a moment ago.

   WHAT EACH ONE NEVER DOES, by construction:
     · bringing a copy back never removes a quote already here. A quote
       is a photograph of what was offered on the day: the copy's quotes
       join this computer's, and one already here by the same number is
       left exactly as it was given;
     · clearing the price list never reaches a quote, a customer, a rule
       Northside wrote, a place it dressed, a price it decided, or its
       settings — the catalogue's `wipe` cannot reach the quotes or the
       settings at all, and the rest is put back over the list as it came;
     · forgetting everything forgets this computer only; a copy saved to
       the computer's Downloads is not this app's to touch.

   THE ONE SWITCH REACHES ALL THREE (built-critique-m4.md, blocker 5).
   "May change prices and settings" was checked only in the catalogue
   store's `apply`, and these three write the repositories directly, so
   a person Northside had set apart could still replace every price
   with a copy's, put the price list back, or wipe everything. Each now
   asks `changeRefusal` first, with the same name the store asks it
   with, and answers its sentence instead of writing; and forgetting
   everything also answers `forgetRefusal` until a copy is saved. Each
   returns null when it went ahead (the page is then opened again).
   ============================================================ */
import { repositories } from '@/data'
import { PACK_ORG_ID, openCatalogue } from '@/data/pack/boot'
import { makeCtx, type EntityDef, type ModuleDef } from '@/domain/model'
import { buildExportPayload } from '@/domain/io/exportPayload'
import type { ProjectFile } from '@/domain/io/envelope'
import { changeRefusal } from '@/domain/northside/people'
import { catalogue, ctxFrom, dataOf } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { prefs } from '@/state/prefs'
import { session } from '@/state/session'
import { copyFileName, forgetRefusal, inventoryOf, keptThroughAClear } from './read'
import { download } from './files'

/** Where the day of the last copy saved on this computer is remembered. */
export const LAST_COPY_PREF = 'shelf.lastCopy'

/** Why the person at the keyboard may not do this, or null: the store's own switch, asked here. */
export const apartRefusal = (): string | null =>
  changeRefusal(catalogue.getState().org, session.getState().name)

/** The page, opened again at an address under the app's own base, so every store reads afresh. */
function reopen(path: string): void {
  const base = import.meta.env.BASE_URL
  const root = base.endsWith('/') ? base : `${base}/`
  window.location.assign(`${root}${path.replace(/^\//, '')}`)
}

/**
 * THE COPY, AS ONE FILE. Everything a new computer needs: the price list as it stands here with
 * every change made to it, the customers, the rules Northside wrote, its settings, the places as
 * it dressed them, and every quote. A list's prices are written as Prices last left them.
 */
export async function saveACopy(now: Date = new Date()): Promise<string> {
  await catalogue.getState().flush()
  const state = catalogue.getState()
  const sheet = dataOf(state)
  const tables: Record<string, EntityDef> = {}
  for (const [id, t] of Object.entries(sheet.tables)) {
    const ladder = sheet.priceLevels[id]
    tables[id] = ladder && ladder.length > 0 ? { ...t, priceLevels: ladder } : t
  }
  const { org: _named, ...world } = ctxFrom(sheet)
  const ctx = makeCtx({
    ...world,
    entities: tables,
    ...(state.org ? { org: state.org } : {}),
    orgId: PACK_ORG_ID,
    quotes: [...quotes.getState().quotes],
    now: () => now.toISOString(),
  })
  const payload = buildExportPayload(
    ctx,
    { name: state.org?.name ?? state.business ?? 'Northside Marine', rev: 1 },
    true,
    /* every picture Northside added, standing or not: a copy keeps what this computer keeps */
    Object.values(state.ownPictures ?? {}),
  )
  const name = copyFileName(state.org?.name ?? state.business ?? 'Northside Marine', now)
  download(JSON.stringify(payload), name)
  prefs.getState().set(LAST_COPY_PREF, now.toISOString())
  return name
}

/**
 * A COPY BROUGHT BACK. This computer's price list, customers, rules, places and settings become
 * the copy's; the copy's quotes join the ones here. Then the shelf opens again, reading it.
 */
export async function bringBack(copy: ProjectFile): Promise<string | null> {
  const apart = apartRefusal()
  if (apart) return apart
  await catalogue.getState().flush()
  await quotes.getState().flush()
  const repos = repositories(PACK_ORG_ID)
  const repo = repos.catalogue
  await repo.wipe()
  await repo.loadPack(copy.entities, copy.rows ?? {})
  await repo.groups.putMany(copy.groups)
  await repo.rules.putMany(copy.rules)
  if (copy.modules?.length) await repo.modules.putMany(copy.modules)
  if (copy.views?.length) await repo.views.putMany(copy.views)
  if (copy.roles?.length) await repo.roles.putMany(copy.roles)
  if (copy.constraints?.length) await repo.constraintDefs.saveAll(copy.constraints)
  await repo.meta.put({
    id: PACK_ORG_ID,
    orgId: PACK_ORG_ID,
    packVersion: '1',
    packName: copy.org?.name ?? copy.project.name,
    loadedAt: new Date().toISOString(),
  })
  if (copy.org) await repos.org.put(copy.org)
  /* THE PICTURES NORTHSIDE ADDED become the copy's — unless the copy was saved before pictures
     were kept, in which case the ones here stay as they are (`ProjectExport.ownPictures`) */
  if (copy.ownPictures) await repos.pictures.saveAll(copy.ownPictures)
  for (const q of copy.quotes ?? []) {
    if (!(await repos.quotes.get(q.id))) await repos.quotes.put(q)
  }
  reopen('/shelf?see=back')
  return null
}

/**
 * THE PRICE LIST, PUT BACK TO THE MASTER PRICE FILE AS IT CAME WITH THE APP. Every change made to
 * it here goes — by hand, or from a workbook — and Northside's own work is put back over it.
 */
export async function clearThePriceList(): Promise<string | null> {
  const apart = apartRefusal()
  if (apart) return apart
  await catalogue.getState().flush()
  const kept = keptThroughAClear(dataOf(catalogue.getState()))
  const repo = repositories(PACK_ORG_ID).catalogue
  await repo.wipe()
  await openCatalogue(repo)
  if (kept.customers) {
    await repo.tables.put(kept.customers.table)
    await repo.rows.putMany(kept.customers.rows)
  }
  if (kept.constraintDefs.length) await repo.constraintDefs.saveAll(kept.constraintDefs)
  if (kept.discoveredRules.length) await repo.discoveredRules.saveAll(kept.discoveredRules)
  /* the places land again under the same ids (`placeId`), so the dressed ones go back over them */
  const landed = new Set((await repo.modules.all()).map((m) => m.id))
  const places: ModuleDef[] = kept.modules.filter((m) => landed.has(m.id))
  if (places.length) await repo.modules.putMany(places)
  const tables = new Set((await repo.tables.all()).map((t) => t.id))
  const stamp = new Date().toISOString()
  for (const [tableId, levels] of Object.entries(kept.priceLevels)) {
    if (!tables.has(tableId)) continue
    await repo.priceLevels.put({
      id: tableId,
      orgId: PACK_ORG_ID,
      tableId,
      levels,
      updatedAt: stamp,
    })
  }
  reopen('/shelf?see=cleared')
  return null
}

/** EVERYTHING THIS COMPUTER KEEPS FOR NORTHSIDE, GONE: and the door asks who is at the desk. */
export async function forgetEverything(): Promise<string | null> {
  const apart = apartRefusal()
  if (apart) return apart
  const state = catalogue.getState()
  const unsaved = forgetRefusal(
    inventoryOf(dataOf(state), quotes.getState().quotes),
    typeof prefs.getState().values[LAST_COPY_PREF] === 'string',
  )
  if (unsaved) return unsaved
  const repos = repositories(PACK_ORG_ID)
  await repos.catalogue.wipe()
  await repos.org.clear()
  await repos.pictures.saveAll([])
  for (const q of await repos.quotes.list()) await repos.quotes.delete(q.id)
  prefs.getState().forgetAll()
  reopen('/sign-in')
  return null
}
