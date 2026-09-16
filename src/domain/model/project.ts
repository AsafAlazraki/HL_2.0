import type { ModuleDef, RoleDef } from './modules'
import type { QuoteDef } from './quote'
import type { RowData } from './rows'
import type { ConstraintDef, RuleDef } from './rules'
import type { EntityDef, GroupDef, IndustryKey } from './tables'
import type { ViewDef } from './views'

/* ---------------------------------------------------------- */
/* The organisation                                           */
/* ---------------------------------------------------------- */

export interface OrgProfile {
  name: string
  industry: IndustryKey
  createdAt: string
  /** THE TENANT KEY, and the one thing about an organisation that
   *  never changes. TENANCY §4.1.
   *
   *  Everything scoped to a business — the constraint registry today,
   *  and every browser-local store §4.3 lists — was keyed on the
   *  LOWERCASED NAME, because the name was the only identity this
   *  type carried. So renaming the business orphaned its business
   *  rules: they are not deleted, they sit in a map under a key
   *  nothing asks for any more, and the screen goes quiet.
   *
   *  MINTED ONCE FROM THE FIRST NAME AND KEPT, exactly like
   *  `createdAt` beside it and for the same reason — a rename is a
   *  rename, not a new business. Two dealerships that happen to pick
   *  the same name are not a collision worth solving here: this is
   *  one organisation per sheet, in one browser.
   *
   *  OPTIONAL, because a sheet saved before this existed has none.
   *  `orgKeyOf` falls back to the old name key for exactly that
   *  case, and the registry rewrites the old key under the slug the
   *  first time it sees both.
   *
   *  IN THIS BUILD EVERY RECORD CARRIES `orgId` ITSELF, and the slug
   *  is that id: on the pack it is 'northside'. The fallback and the
   *  rewrite are history, kept in this note so the next hand knows
   *  why the key is minted once and never re-derived. */
  slug?: string
  /**
   * THE SENTENCE THIS DEALERSHIP PUTS ON EVERY QUOTE — its validity
   * terms, typed once.
   *
   * CONFIG_FINDINGS adopt 10 asks for three-layer content overrides,
   * org default → brand → per-quote. This is the first layer and the
   * third. There is no brand layer: nothing in this app holds content
   * at a brand, and inventing one would be a place for a dealer to
   * maintain something they have not asked for.
   *
   * AND IT IS COPIED, NOT RESOLVED. Adopt 10's stated virtue is that
   * it is "a delta rather than a document copy" — and for a QUOTE
   * that is exactly wrong here. A quote is a photograph: `freeze.ts`
   * copies every price onto it so a number handed to a customer on
   * Monday cannot move on Friday, and a validity sentence resolved at
   * read time would rewrite documents that have already gone out. So
   * this is a STARTING VALUE, written onto the document when it is
   * made and editable there afterwards like every other frozen word.
   *
   * Absent means the document prints no note, which is what every
   * quote did before this existed.
   */
  quoteTerms?: string
}

/** A name, as a key: lowercase, alphanumerics and single hyphens.
 *
 *  It is derived from the name ONCE and then never recomputed — the
 *  point of the slug is that it survives what the name does not, so
 *  a function that re-derives it on every read would be the bug it
 *  exists to fix. `orgSlug` is for MINTING one, nothing else. */
export const orgSlug = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sheet'

/* ---------------------------------------------------------- */
/* Project meta + export format                               */
/* ---------------------------------------------------------- */

export interface ProjectMeta {
  id: 'default'
  name: string
  /** set once during onboarding; absent means onboarding has not run */
  org?: OrgProfile
  /** bumps every export — shown as REV in the title block */
  exportCount: number
  updatedAt: string
}

export const EXPORT_KIND = 'helmlogic-dynamic-config' as const
/* VERSION 2 CARRIES THE DESIGN WORK, and that is the whole reason it
   moved. Version 1 held tables, zones, rules and rows — everything the
   SEED produces and nothing a PERSON makes. So the file the export card
   calls "Everything" carried none of the modules an admin built, none of
   the view pages they curated, none of their quotes and none of their
   business rules, and a round trip silently dropped all four.

   Nothing anybody designs could leave the browser it was made in. That
   is a strange thing to be true of a configurator whose entire purpose
   is letting a dealer design their own system.

   A v1 file still imports: every added key is optional and an older
   file simply arrives with none of them. A v2 file opened by an older
   build is refused by the version check rather than silently losing
   half of itself, which is the correct failure. */
export const EXPORT_VERSION = 2 as const

export interface ProjectExport {
  kind: typeof EXPORT_KIND
  version: typeof EXPORT_VERSION
  exportedAt: string
  project: { name: string; rev: number }
  entities: EntityDef[]
  groups: GroupDef[]
  rules: RuleDef[]
  /** present when "include data" was chosen; keyed by entityId */
  rows?: Record<string, RowData[]>

  /* -- v2: the things a person makes, rather than the seed ---- */

  /** the organisation, so an imported set knows whose it is rather than
   *  arriving unnamed and sending the shell back to onboarding */
  org?: OrgProfile
  /** the pages that say what goes with what */
  views?: ViewDef[]
  /** the places in the business, in dashboard order */
  modules?: ModuleDef[]
  /** limits every row must keep, including the workbook-derived ones a
   *  person has since edited or switched off */
  constraints?: ConstraintDef[]

  /** THE JOBS AT THE DEALERSHIP, so the grants on a module mean
   *  something on the other side of an export.
   *
   *  `ModuleDef.access` names roles by id. Without the roles
   *  travelling beside them, a project exported and re-imported comes
   *  back with every grant intact and nothing to resolve it against —
   *  the grants are not wrong, they are unreadable, which is worse
   *  because it looks like a permission rather than a dangling id.
   *  `orphanRoleIds` in features/modules/access.ts finds exactly that
   *  case and the settings panel says so in words, but the honest fix
   *  is for them not to be orphaned in the first place.
   *
   *  Optional like the rest of v2, so a file written before this
   *  imports exactly as it did. */
  roles?: RoleDef[]

  /** THE DOCUMENTS. `io/envelope.ts` carried this key on its own
   *  extension of the export because the old model had no `quotes`
   *  key and said so; it is on the contract now. Every quote is a
   *  photograph, so writing it out and reading it back cannot change
   *  a number — which is what lets it travel at all. Optional like
   *  the rest of v2: a file written before quotes travelled reads as
   *  a project with no quotes. */
  quotes?: QuoteDef[]
}
