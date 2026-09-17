/* ============================================================
   THE PLACES IN THIS BUSINESS.

   WHY THE LIST LIVES HERE AND NOWHERE ELSE. A module name is a
   BUSINESS string: "Boats", "Rates & Charges". The pack is the price
   file and nothing else — 53 tables and 15,691 rows — so the nine
   places are MINTED BY APP CODE FROM TABLE KEYS, which is what the
   plan settles in as many words ("Modules and the two seeded flow
   rules are NOT data"). A pharmacy loading its own set mints its own
   places from its own keys with no code change, and nothing below is
   invented: every name is a seeded table's own name or a heading from
   the specs, and every figure on a card is counted off the rows.

   ONE PLACE IS ONE SORT OF THING, and that is what split this list
   from five names into nine. Two of the five were bags, and both were
   bags for a reason the app can state without knowing what a boat is:

     Parts & Accessories held the parts library and the rigging kits,
     which are `kind: "accessory"`, beside Dealer Fit Packages, which
     is `kind: "package"`. Different sorts of thing, so different
     places — and the dealer fit library is 1,777 rows in its own
     right, filed under 91 of its own banners.

     Rates & Charges held labour rates, oils and consumables, and
     registration bands. All three are `kind: "custom"` — which is not
     agreement, it is the absence of a kind. The hourly rate of a
     workshop, the price of a litre of oil and a government fee
     schedule share no column but Source, are read by different people
     and are maintained on different days. Three tables, three
     registers.

     Motors held Yamaha and ePropulsion, which are `kind: "motor"`,
     beside the two Factory Packages files, which are `kind: "package"`
     and whose own seed note says in capitals that they are NOT motors.

   `split.ts` is that rule as code, and it reads this list back: every
   module below is coherent under it. It is not consulted at mint time
   — a mint that computed its own names would have nothing to call
   them — but a module an admin builds by hand gets the same reading
   in the designer, with the parts named.

   THE BRAND IS THE SECTION, which is the owner's ruling taken
   literally: Boats holds all seven brand price files rather than one
   flattened list of hulls, because the workbook reads each brand's
   columns from THAT brand's banner row — "Max People" on Highfield is
   a different column on Stacer. The index cuts itself by table and
   then by that table's own hierarchy, so seven tables draw seven
   brand heads with the levels each brand declares underneath.

   JOINS AND VIEWS ARE NEVER DOORS. Only `role: "base"` tables are
   named here; the 28 join tables appear INSIDE a module as related
   blocks on an item's page.

   EVERY BASE TABLE BELONGS TO SOME MODULE. That includes the retired
   OBSOLETE Trailers table, which is why it is in the Trailers list:
   `sellableTables` then drops it from the catalogue and the index
   says so in words. A table nobody filed would be a table nobody
   could reach except through the sheet.

   THE DESCRIPTION IS PASSED EXPLICITLY, and that is not decoration.
   The fall-back is the primary table's own description, and
   Highfield's is a 202-character note about which spreadsheet row its
   columns came from — the exact string the old module stage's header
   records as the failure that taught this.
   ============================================================ */

import {
  canBeModuleMaster,
  DEFAULT_CAPABILITIES,
  type EntityDef,
  type ModuleCapability,
  type ModuleDef,
  type RowData,
} from '@/domain/model'
import { newId, nowIso } from '@/domain/id'
import { moduleFace } from './read'

export interface SeedModule {
  name: string
  /**
   * One line under the name — what is in here and why, and NEVER a
   * count.
   *
   * A COUNT IN PROSE IS A LIE WAITING TO HAPPEN, and two of these five
   * had already told it. Rates & Charges read "64 charges" beside a live
   * badge saying 65 the moment a row was added, and Parts & Accessories
   * read "719 lines" against 738 actually seeded — nobody wrote a wrong
   * number, the rows moved and the sentence could not. The card already
   * counts its own rows, live, one line above this one, so a figure
   * typed here is duplication that can only ever drift out of true.
   *
   * Every fact these sentences do carry is a fact that does not move:
   * which workbook sheet the tables came from, and what kind of thing
   * is in them.
   */
  desc: string
  /** seed keys, primary first. A key that does not resolve is skipped. */
  tables: string[]
  /** what may be DONE here. Omitted = DEFAULT_CAPABILITIES. */
  can?: ModuleCapability[]
}

/* The verbs, and why each module has the ones it has. `browse`,
   `search` and `open` are DEFAULT_CAPABILITIES — look, do not touch —
   and nothing that writes is switched on anywhere, deliberately.

   `relate` is on where this side of the relationship OWNS the
   decision: a boat is the source of every fitment join, and a motor's
   page turns those round. It is OFF on trailers and parts because the
   fitment rules put the selector on the boat's series banner — the
   pair is written on the boat's join, so a relate verb here would
   promise a decision this side does not make.

   `quote` is on where the table declares a selling price. It is off
   on Parts & Accessories because a part is quoted as a LINE on a
   boat's quote, off on Dealer Fit Packages because that sheet's own
   sell column is not one `priceReadOf` will print, and off on
   Registration Costs because registration is a third-party recovery
   the service rules forbid marking up — a quote verb over a fee
   register invites the double charge that document rules out.

   `open` is off on the three registers, and that is measured rather
   than preferred: no join names Labour Rates, Oils & Consumables or
   Registration Costs, so an item page for a labour rate would carry
   zero blocks and be a row shown twice. The service notes call these
   "a register that other places read". */
export const NORTHSIDE_MODULES: readonly SeedModule[] = [
  {
    name: 'Boats',
    desc: 'Seven brand price files off the Boat Module sheet, each brand keeping its own columns.',
    tables: [
      'boat_highfield',
      'boat_stabicraft',
      'boat_stacer',
      'boat_formosa',
      'boat_jeanneau',
      'boat_surtees',
      'boat_haines',
    ],
    can: ['browse', 'search', 'open', 'relate', 'quote'],
  },
  {
    name: 'Motors',
    desc: 'The outboards themselves, off the Motor Library sheet — Yamaha and ePropulsion, and nothing that is a boat as well.',
    tables: ['mot_yamaha', 'mot_epropulsion'],
    can: ['browse', 'search', 'open', 'relate', 'quote'],
  },
  {
    name: 'Factory Packages',
    desc: 'Boat-plus-engine bundles the Motor Library files under the boat row’s motor slot. The workbook keeps them as their own price files because they are not motors.',
    tables: ['mot_pkg_haines', 'mot_pkg_jeanneau'],
    /* NO `relate`. A bundle is chosen ON a hull, so the decision and
       the join both belong to the boat's side — the same reason
       trailers do not carry it. `quote` is on because both files
       declare a selling price. */
    can: ['browse', 'search', 'open', 'quote'],
  },
  {
    name: 'Trailers',
    desc: 'Seven trailer brands off the Trailer Module sheet, plus the obsolete band kept so an old quote still opens and never offered here.',
    tables: [
      'trl_nsmcustom',
      'trl_dunbier',
      'trl_bmt',
      'trl_mackay',
      'trl_redco',
      'trl_gfab',
      'trl_stacertrailers',
      'trl_obsolete',
    ],
    can: ['browse', 'search', 'open', 'quote'],
  },
  {
    name: 'Parts & Accessories',
    desc: 'The parts library and the rigging kits — the lines that go ONTO a boat rather than being one, looked up by name because a customer is asking for one.',
    tables: ['parts', 'rig_kits'],
  },
  {
    name: 'Dealer Fit Packages',
    desc: 'The Parts Module’s own Dealer Fit sheet — a bundle of parts and the labour to put them on, which the workbook resolves against its own column and not against the parts library.',
    tables: ['dealer_fit'],
  },
  {
    name: 'Labour Rates',
    desc: 'The price of an hour of workshop time, off the Service Module sheet. Nobody browses it; sheets in four workbooks reach into it by cell.',
    tables: ['labour_rates'],
    can: ['browse', 'search'],
  },
  {
    name: 'Oils & Consumables',
    desc: 'The price of a litre, off the Service Module sheet — oils, lubes and the fuel a pre-delivery build reads, each with its unit stated.',
    tables: ['oils_lubes'],
    can: ['browse', 'search'],
  },
  {
    name: 'Registration Costs',
    desc: 'The government fees and the bands they fall in, off the Registration Module sheet. A third-party recovery the workbook forbids marking up.',
    tables: ['registration'],
    can: ['browse', 'search'],
  },
]

/** Everything the mint needs that is not the sheet.
 *
 *  THE CLOCK AND THE IDS ARE INJECTED, because a pure module calls
 *  neither `Date` nor a random source of its own. The defaults are the
 *  real ones, so a caller that does not care writes nothing. */
export interface MintOptions {
  /** the tenant key every persisted record carries */
  orgId: string
  /** ISO now; one stamp for `createdAt` and `updatedAt`, exactly as a
   *  freshly loaded pack stamps every one of its rows */
  now?: () => string
  /** the module's own id. Defaults to a fresh one, which is what the
   *  old store action minted; a caller that wants the places to be the
   *  same records across two loads hands its own in. */
  id?: (seed: SeedModule, index: number) => string
  /**
   * THE ITEM PAGE, WHEN THERE IS ONE. The old store action minted a
   * view per member table and named the primary's on the module. A
   * view is a persisted record and minting one is a WRITE, so it
   * arrives here as a callback the caller supplies with its own
   * store's `createView`.
   *
   * Absent means no `viewId`, which the contract already calls a
   * legitimate module rather than a broken one: it lists, and it does
   * not open.
   */
  viewIdFor?: (primaryTableId: string) => string | undefined
}

/** Is this table allowed to be a door?
 *
 *  A JOIN OR A VIEW IS NEVER ONE. `canBeModuleMaster` admits role
 *  'view', which the ruling forbids, so the second half is written
 *  here rather than borrowed — exactly as the old seed wrote it, and
 *  for the reason it gave. */
const canBeADoor = (e: EntityDef): boolean =>
  canBeModuleMaster(e) && (e.role === undefined || e.role === 'base')

/**
 * The places, minted from table keys.
 *
 * ON THE PACK A TABLE'S ID IS ITS SEED KEY, so `tables` above resolves
 * straight against `entities` and the old `idByKey` inversion is gone
 * with the id scheme that needed it.
 *
 * A KEY THAT DOES NOT RESOLVE IS SKIPPED and a module left with no
 * table at all is not minted — a blank sheet therefore mints nothing,
 * which is the honest answer and is what keeps the empty state a real
 * dealer's first screen rather than collateral damage.
 *
 * THE FACE IS COUNTED OFF THE ROWS, NOT GUESSED OFF ONE TABLE'S
 * COLUMN LIST. The old action once asked whether `tableIds[0]`
 * declared a picture column — the right question asked of the wrong
 * thing, because a module spans its tables and a column existing is
 * not the same fact as the rows carrying anything in it. Motors runs
 * Yamaha (203 pictured of 209) beside ePropulsion (no picture column
 * at all); Boats runs Highfield beside Formosa, which pictures 18 of
 * its 39. `moduleFace` counts the whole module and says so in a
 * sentence the designer shows. It is a DEFAULT: `index` is stored and
 * the designer still writes it.
 */
export function mintModules(
  entities: Record<string, EntityDef>,
  rowsByEntity: Record<string, RowData[]>,
  options: MintOptions,
  seeds: readonly SeedModule[] = NORTHSIDE_MODULES,
): ModuleDef[] {
  const now = options.now ?? nowIso
  const mintId = options.id ?? (() => newId())

  const out: ModuleDef[] = []
  for (const seed of seeds) {
    const tableIds = seed.tables.filter((key) => {
      const e = entities[key]
      return e !== undefined && canBeADoor(e)
    })
    if (tableIds.length === 0) continue
    const primary = entities[tableIds[0]]
    const stamp = now()
    const viewId = options.viewIdFor?.(tableIds[0])

    out.push({
      id: mintId(seed, out.length),
      orgId: options.orgId,
      name: seed.name.trim() || primary.name,
      description: seed.desc.trim() || primary.description?.trim() || '',
      tableIds,
      capabilities: seed.can ? [...seed.can] : [...DEFAULT_CAPABILITIES],
      index: moduleFace(
        tableIds.map((id) => entities[id]),
        rowsByEntity,
      ).mode,
      ...(viewId ? { viewId } : {}),
      accent: primary.accent,
      /* THE ORDER IS THE POSITION ON THE DASHBOARD, ascending, and it
         is the count of what has already been minted — so a seed key
         that resolves to nothing leaves no gap in the numbering. */
      order: out.length,
      createdAt: stamp,
      updatedAt: stamp,
    })
  }
  return out
}

/** The places keyed by id, which is the shape `CatalogueCtx.modules`
 *  and every reader in this folder index them by. */
export function mintModuleMap(
  entities: Record<string, EntityDef>,
  rowsByEntity: Record<string, RowData[]>,
  options: MintOptions,
  seeds: readonly SeedModule[] = NORTHSIDE_MODULES,
): Record<string, ModuleDef> {
  const map: Record<string, ModuleDef> = {}
  for (const m of mintModules(entities, rowsByEntity, options, seeds)) map[m.id] = m
  return map
}
