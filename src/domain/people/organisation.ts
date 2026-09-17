/* ============================================================
   THE ORGANISATION'S OWN IDENTITY — minted once, kept through
   everything a person does to the business afterwards.

   WHY THIS FILE EXISTS AT ALL, when nothing in Milestone 1 writes an
   `OrgProfile`. Three separate suites in the old repo were about one
   property, and all three of them were about to be lost in the port
   for the same reason — the property lived in a store action, and
   this build has no project-meta store yet:

     · `features/constraints/tenantKey.test.ts` (14) — "RENAMING THE
       BUSINESS ORPHANED ITS BUSINESS RULES." Everything scoped to a
       dealership was keyed on the lowercased NAME, so a dealership
       that corrected its own name in settings lost every rule it had
       written. Not deleted: filed under a key nothing asked for
       again, and the pane went quiet with no way to tell that from
       never having written one.
     · `store/undo.test.ts`, "when the business was set up" (4) —
       TENANCY §4.6, "OrgProfile.createdAt cannot survive a replace."
     · `features/quote/quoteTerms.test.ts`, "SURVIVE A RENAME" (1) —
       the third field to fall into the same trap.

   Three suites, one sentence: WHAT A BUSINESS WROTE IS STILL THERE
   AFTER IT CHANGES WHAT IT IS CALLED. So the act itself is here, as
   a pure function over the profile it is given, rather than deferred
   a fourth time to an admin screen that does not exist. The screen,
   when it arrives, calls this; the store action that used to hold
   this reasoning is the only thing that was left behind.

   WHAT THE STORE ACTION HAD THAT THIS DOES NOT. The old
   `setOrganisation` also wrote `meta.name` — the SHEET's name, which
   it defaulted from the business name — and fell back to it when
   minting a slug for an empty name. There is no project meta in
   `src/domain` and a pure function may not invent one, so the
   fallback is `orgSlug`'s own: it never returns an empty key.
   ============================================================ */

import { nowIso } from '@/domain/id'
import { orgSlug } from '@/domain/model'
import type { IndustryKey, OrgProfile } from '@/domain/model'

/**
 * The business, named. Returns the profile the sheet should now
 * carry; `previous` is the one it carries today, or undefined on a
 * sheet that has never been through onboarding.
 *
 * `createdAt` is only passed when RESTORING a profile across a
 * project swap; omitted, the existing date is kept and only a sheet
 * that never had one is stamped.
 *
 * `now` is injected because a pure module never reads the clock
 * itself — the app hands in `ctx.now`, a test hands in a fixed
 * instant, and the default is here only so a caller that genuinely
 * means "now" does not have to say so twice.
 */
export function setOrganisation(
  previous: OrgProfile | undefined,
  name: string,
  industry: IndustryKey,
  createdAt?: string,
  now: () => string = nowIso,
): OrgProfile {
  return {
    name: name.trim(),
    industry,
    /* WHEN THE BUSINESS WAS SET UP, NOT WHEN THIS RAN.
       TENANCY §4.6: "OrgProfile.createdAt cannot survive a
       replace." It stamped `nowIso()` unconditionally, so
       every call reset it — and `Shell.tsx` calls this after
       EVERY project swap to put the organisation back, which
       means loading a prepared set silently re-dated the
       business to today.

       Three sources, in the order they can be trusted: what
       the caller restored (the Shell hands back the profile
       it remembered across the swap), what is already on the
       sheet, and only then now. A RENAME KEEPS THE DATE —
       changing what a business is called does not change when
       it started, and this app holds one organisation per
       sheet, so there is no reading where a new name is a new
       organisation. */
    createdAt: createdAt ?? previous?.createdAt ?? now(),
    /* THE TENANT KEY, minted once and then kept — TENANCY
       §4.1, and the same rule as `createdAt` above it. Every
       store scoped to a business was keyed on the lowercased
       NAME, so a rename orphaned its business rules. The slug
       is derived from the FIRST name and never recomputed;
       re-deriving it on a rename would be the bug it exists
       to fix. */
    slug: previous?.slug ?? orgSlug(name.trim()),
    /* AND THE THIRD FIELD TO FALL INTO THE SAME TRAP. This
       function REBUILDS `org` from its arguments, so anything
       it does not carry forward is erased by the next rename
       or project swap — which is exactly how `createdAt` came
       to be re-dated and how the slug would have been
       re-derived. A dealership's standing quote terms are not
       part of its name. */
    ...(previous?.quoteTerms === undefined ? {} : { quoteTerms: previous.quoteTerms }),
  }
}

/**
 * The sentence every new quote starts with. Empty clears it, and a
 * cleared one is a real answer — a dealership that prints no terms
 * is not a dealership that forgot to type them.
 *
 * IT WRITES ONLY THE TERMS, and does not go through
 * `setOrganisation`: that function rebuilds the whole profile from a
 * name and an industry, and routing a terms edit through it would
 * make every save of a sentence also a re-assertion of the
 * business's name. An empty string CLEARS the field rather than
 * storing one, because a document with no note and a document with
 * an empty note print the same thing and only one of them survives a
 * round trip honestly.
 *
 * A sheet with no organisation gets none: this returns `undefined`
 * rather than conjuring a profile out of a sentence, which is the
 * guard the old store setter opened with.
 */
export function setQuoteTerms(
  previous: OrgProfile | undefined,
  terms: string,
): OrgProfile | undefined {
  if (!previous) return undefined
  const kept = terms.trim()
  const next = { ...previous }
  if (kept === '') delete next.quoteTerms
  else next.quoteTerms = kept
  return next
}
