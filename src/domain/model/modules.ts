import type { AccentKey } from './fields'
import type { ImageRef } from './images'
import type { EntityDef } from './tables'

/* ============================================================
   MODULES — a place in the business, made by the person who runs it.

   A module is four things and no more: the TABLES it is about, the
   VERBS a person may use in it, how its list is DRAWN, and where it
   sits on the dashboard. Everything else about it is derived from the
   tables themselves — the row label, the grouping, the picture, the
   price — so a module works the moment it is named and is tuned
   afterwards rather than configured first. See docs/plan/MODULE_SYSTEM.md.

   WHAT IT IS NOT. Not a table: it POINTS at tables, they never move
   and never gain an owner. Not a folder. Not a permission — it says
   what CAN be done here, never who may do it, so roles stay additive
   when they arrive. Not a plugin: no module ships code.

   THE MASTER IS A SET WITH A PRIMARY, not a single id. HelmLogic wrote
   that pointer three separate times — mainVendorId, trailerBrandVendorIds,
   regoVendorIds — and its own create form has to null one and populate
   another. One field with the right arity absorbs every case they
   special-cased. `tableIds[0]` is the primary.
   ============================================================ */

/** The verbs a module offers. Deliberately a closed list: a capability
 *  nobody can name is a capability nobody can switch off. */
export type ModuleCapability =
  | 'browse'
  | 'search'
  | 'open'
  | 'add'
  | 'edit'
  | 'delete'
  | 'relate'
  /* THE TENTH VERB, AND IT WAS HELD OUTSIDE THIS UNION FOR A RELEASE.
     `features/modules/ruleCapability.ts` carried it in a browser-local
     registry because this file was owned by another hand at the time,
     and wrote down the exact two lines it wanted so the day it landed
     would be a deletion rather than a design. This is that day, and
     these are those lines.

     BETWEEN `relate` AND `quote` because this record's order IS the
     display order: a person reads the three reads, then the three
     writes, then the three acts a manager does — say what goes with
     what, set what must always be true, raise a price. */
  | 'configure'
  | 'quote'
  | 'export'
  | 'import'

export const MODULE_CAPABILITIES: Record<ModuleCapability, { label: string; says: string }> = {
  browse: { label: 'Browse', says: 'see everything in it' },
  search: { label: 'Search', says: 'find one by name' },
  open: { label: 'Open one', says: 'look at a single item' },
  add: { label: 'Add', says: 'create a new item' },
  edit: { label: 'Edit', says: 'change what is there' },
  delete: { label: 'Remove', says: 'take an item out' },
  relate: { label: 'Relate', says: 'say what goes with what' },
  configure: { label: 'Set rules', says: 'set what must always be true here' },
  quote: { label: 'Quote', says: 'raise a price for a customer' },
  export: { label: 'Export', says: 'take a copy out' },
  /* THE TENTH VERB, AND THE ONE THE CONTRACT WAS SHORT OF.
     MODULE_SYSTEM §5 lists ten switches and this list carried nine:
     a module could be granted the right to take a copy out and there
     was no way to say whether it may take one back in. Those are
     opposite risks — one leaks a price list, the other overwrites one
     — and a single switch for both would have been the app deciding
     that they are the same decision. */
  import: { label: 'Import', says: 'bring a file of them back in' },
}

/** What a new module can do before anyone configures it: look, do not
 *  touch. Nothing that writes is on by default — an admin turns writing
 *  on deliberately, on the modules where it belongs. */
export const DEFAULT_CAPABILITIES: ModuleCapability[] = ['browse', 'search', 'open']

/** How the index draws each row. Rows for dense data a person scans;
 *  tiles for a catalogue a person shops. */
export type ModuleIndexMode = 'rows' | 'tiles'

export interface ModuleDef {
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  name: string
  /** one line under the name on the dashboard card. The admin's words:
   *  HelmLogic derives its equivalent by substring-matching the name and
   *  therefore tells every trailer and service user they are configuring
   *  boat packages. */
  description: string
  /** the tables this module is about; [0] is the primary. Never a join —
   *  a join is a relationship, not a place to stand. */
  tableIds: string[]
  capabilities: ModuleCapability[]
  index: ModuleIndexMode
  /** the view page used as this module's detail surface, when it has
   *  one. Absent means the module lists but does not open — which is a
   *  legitimate module, not a broken one. */
  viewId?: string
  accent: AccentKey
  /** position on the dashboard, ascending */
  order: number

  /** THE DEALER'S OWN MARK FOR THIS PLACE. A module is a place in a
   *  business and a business has a mark for it — the brand it sells,
   *  the workshop's badge. Optional, and the kind symbol plus the
   *  accent stay the fallback, because a module nobody has given a
   *  logo must still read as itself. */
  logo?: ImageRef

  /** WHO MAY DO WHAT HERE. Absent = unrestricted, which is how every
   *  module written before this behaved and still behaves. See
   *  `ModuleAccess` for why it shares the capability vocabulary. */
  access?: ModuleAccess[]

  createdAt: string
  updatedAt: string
}

/** Can this table be the master of a module? A join records pairs and
 *  has no independent existence, so it appears INSIDE a module as a
 *  related block and never as a module of its own. */
/* ---------------------------------------------------------- */
/* WHO MAY DO WHAT, IN A MODULE                                */
/* ---------------------------------------------------------- */

/** A named job at the dealership — "Salesperson", "Service manager",
 *  "Owner". Roles are DATA, not code: this app's argument is that a
 *  dealer configures their own business without a developer, and a
 *  permission list compiled into the app is the exact thing production
 *  got wrong — docs/plan/hl-admin.md §2.3, "the permission list is
 *  code, not data".
 *
 *  A role says nothing on its own. It becomes real only where a module
 *  grants it capabilities: see `ModuleDef.access`. */
export interface RoleDef {
  id: string
  /** the tenant key — see EntityDef.orgId */
  orgId: string
  /** the dealership's own word for the job */
  name: string
  /** one line: who this is, in the owner's words. Never generated. */
  description?: string
  createdAt: string
  updatedAt: string
}

/** What one role may do in one module.
 *
 *  DELIBERATELY THE SAME VOCABULARY AS THE MODULE ITSELF. A module
 *  already declares what CAN be done in it (`ModuleDef.capabilities`);
 *  this says which of those a role actually gets. Access can therefore
 *  never exceed the module — granting `quote` to a role in a module
 *  that cannot quote is not a smaller permission, it is a
 *  contradiction, and sharing one vocabulary is what makes that
 *  checkable rather than a convention.
 *
 *  ABSENT MEANS UNRESTRICTED. A module with no `access` behaves
 *  exactly as it did before this existed. Access is something a dealer
 *  turns on when more than one kind of person uses the system — not a
 *  wall every new module starts behind. */
export interface ModuleAccess {
  roleId: string
  /** a subset of the module's own capabilities */
  capabilities: ModuleCapability[]
}

export const canBeModuleMaster = (e: EntityDef): boolean => e.role !== 'join'
