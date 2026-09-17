/* ============================================================
   CONSTRAINT REGISTRY — the acts a person performs on the rules,
   as pure functions over the rules they already have.

   WHAT THIS FILE WAS, AND WHY IT IS NOT THAT ANY MORE.

   In the old app it was a module-level `Map` keyed by organisation,
   with `subscribe`/`publish`, a synchronous snapshot for React's own
   external-store hook, and a mirror in the browser's key-value store
   written behind a 300 ms debounce and read once at module load.
   (Both of those are named here in words rather than in code, because
   `tools/check.ts` reserves the words themselves — the hook for
   nobody, the store for `src/state/prefs.ts`.) Its own header
   called that a TEMPORARY HOME, "deliberately shaped like the one
   the store will replace it with", and named the store action that
   would retire it.

   HL_2.0 has that seam: `src/data/repository.ts`. So the mirror is
   gone, the subscription is gone, and what is left here is the part
   that was never about storage — deciding what a rule becomes when
   somebody creates it, rewords it, switches it off, deletes it or
   puts it back. `CatalogueCtx.constraintDefs` is the read; a write
   is a callback the caller passes beside it. Nothing in this file
   holds state between calls, which is what makes `src/domain` pure.

   TWO THINGS THE OLD FILE ARGUED FOR SURVIVE UNCHANGED:

   1. Constraints are PER ORGANISATION. The old registry was keyed by
      organisation from OUTSIDE the record, through `orgKeyOf(meta)`
      and a legacy-key migration that moved a business's rules onto
      its slug. In HL_2.0 the record says whose it is itself —
      `ConstraintDef.orgId`, required by the contract — so the key,
      the fallback and the migration all go with it. That is the
      plan's own "no boot-time migrations" line: a fresh schema with
      `orgId` on every record needs none.

   2. THE OBSERVED COERCION IS APPLIED AT EVERY SEAM. A rule carrying
      observed provenance may never hold severity 'block' — see
      `src/domain/rules/adopt.ts`, which owns the rule and the reason.
      It is applied on the way in (`registerConstraints`), on an edit
      (`putConstraint`, so rewording is not a way in), on a restore,
      and on the way OUT OF STORAGE (`loadConstraints`), which
      matters most because storage is a text file a person can edit.
   ============================================================ */

import { newId } from '@/domain/id'
import { sanitiseAllObserved, sanitiseObserved } from '@/domain/rules/adopt'
import type { CatalogueCtx, ClauseGroup, ConstraintDef, ConstraintKind } from '@/domain/model'

/* ---------------------------------------------------------- */
/* Writing — the two callbacks that replace `publish()`        */
/* ---------------------------------------------------------- */

/** Where a changed rule goes. The old file wrote it into its own
 *  `Map` and told its subscribers on a microtask; a caller now hands
 *  in the write, which is the repository in the app and an array in
 *  a test. `put` must be idempotent on id — a rule replaces the one
 *  it shares an id with, because two rules with one id are one rule. */
export type PutConstraint = (constraint: ConstraintDef) => void

/** How a rule leaves. Separate from `put` because deletion is the
 *  other act — see the long note over `deleteConstraint`. */
export type RemoveConstraint = (id: string) => void

/* ---------------------------------------------------------- */
/* Reading                                                    */
/* ---------------------------------------------------------- */

const EMPTY: ConstraintDef[] = []

/** Every constraint this context's organisation has, through the
 *  coercion. The context is a snapshot the caller took; nothing is
 *  re-sorted, so the registry's own order reaches the screen. */
export function getConstraints(ctx: CatalogueCtx): ConstraintDef[] {
  const list = ctx.constraintDefs
  if (!list || list.length === 0) return EMPTY
  return sanitiseAllObserved(list)
}

/** One constraint, or undefined when this organisation has no such
 *  rule — which is the answer a second delete gets. */
export function getConstraint(ctx: CatalogueCtx, id: string): ConstraintDef | undefined {
  const hit = ctx.constraintDefs.find((c) => c.id === id)
  return hit ? sanitiseObserved(hit) : undefined
}

/* ---------------------------------------------------------- */
/* The storage seam                                           */
/* ---------------------------------------------------------- */

/**
 * WHAT COMES BACK FROM STORAGE, COERCED AND SIFTED.
 *
 * The old `load()` read one key out of the browser's own key-value
 * store, parsed it, and fed every row through
 * `sanitiseObserved` — "storage is a text file a
 * person can edit, and an observed rule that came back from it
 * claiming to block would have acquired, by hand, the one power
 * adopt.ts exists to withhold". The repository is that seam now, and
 * the coercion still has to happen at it, so the sifting lives here
 * where the reason is written down rather than in the adapter.
 *
 * A row with no id and a row with no condition are dropped, exactly
 * as they were: a rule that cannot be addressed or cannot be
 * evaluated is not a rule. Corrupt storage was never worth a blank
 * screen, so this refuses nothing and simply returns what it could
 * read.
 */
export function loadConstraints(rows: readonly unknown[]): ConstraintDef[] {
  const out: ConstraintDef[] = []
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const c = row as ConstraintDef
    if (typeof c.id !== 'string' || c.id === '' || !c.if) continue
    out.push(sanitiseObserved(c))
  }
  return out
}

/* ---------------------------------------------------------- */
/* Writing                                                    */
/* ---------------------------------------------------------- */

export interface NewConstraint {
  kind?: ConstraintKind
  if: ClauseGroup
  then?: ClauseGroup
  because: string
  why?: string
  source?: string
  priority?: number
}

/** There is no name, and that is the point: the sentence IS the name
 *  (`describeConstraint`). Adding a rule asks for nothing beyond the
 *  words already on screen.
 *
 *  `orgId` comes off the context rather than from a key computed
 *  outside the record — see this file's header, point 1. */
export function createConstraint(
  input: NewConstraint,
  ctx: CatalogueCtx,
  put: PutConstraint,
): ConstraintDef {
  const now = ctx.now()
  const constraint: ConstraintDef = {
    id: newId(),
    orgId: ctx.orgId,
    kind: input.kind ?? 'implies',
    if: input.if,
    ...(input.then ? { then: input.then } : {}),
    because: input.because,
    ...(input.why ? { why: input.why } : {}),
    enabled: true,
    source: input.source ?? 'You, just now',
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    createdAt: now,
    updatedAt: now,
  }
  put(constraint)
  return constraint
}

/** Replace a constraint wholesale — the edit transforms in `edit.ts`
 *  return a finished ConstraintDef, so there is nothing to merge.
 *
 *  Returns what was stored, so a caller can show the rule it now has
 *  rather than the one it sent. */
export function putConstraint(
  constraint: ConstraintDef,
  ctx: CatalogueCtx,
  put: PutConstraint,
): ConstraintDef {
  const current = ctx.constraintDefs.find((c) => c.id === constraint.id)
  /* an EDIT is a seam too: rewording an observed rule may not be a
     way to change what it is allowed to do */
  const next = sanitiseObserved({
    ...constraint,
    createdAt: current?.createdAt ?? constraint.createdAt,
    updatedAt: ctx.now(),
  })
  put(next)
  return next
}

/** The switch, and it is still the everyday control: switching a rule
 *  off is the reversible experiment the whole "ask why → switch it off
 *  → watch the option come back" loop depends on, and it keeps the
 *  authoring. Toggling is NOT an edit, so it does not raise the EDITED
 *  tag. Deleting is the other act, below.
 *
 *  Returns the rule as it now stands, or undefined when there was
 *  nothing to change — no such rule, or it was already that way. */
export function setConstraintEnabled(
  id: string,
  enabled: boolean,
  ctx: CatalogueCtx,
  put: PutConstraint,
): ConstraintDef | undefined {
  const current = ctx.constraintDefs.find((c) => c.id === id)
  if (!current || current.enabled === enabled) return undefined
  const next = { ...current, enabled, updatedAt: ctx.now() }
  put(next)
  return next
}

/** Seeding seam — an import, the workbook seeds, or the repository on
 *  first load. Every rule through the coercion, then out to the
 *  write; the sanitised list comes back so a caller can file exactly
 *  what the registry accepted. */
export function registerConstraints(
  constraints: ConstraintDef[],
  put: PutConstraint,
): ConstraintDef[] {
  const clean = sanitiseAllObserved(constraints)
  for (const c of clean) put(c)
  return clean
}

/** Used by a project reset. Every rule this organisation has, at once
 *  — `deleteConstraint` is the one-at-a-time act. Returns the ids it
 *  removed, so a caller can say how many rather than guess. */
export function clearConstraints(ctx: CatalogueCtx, remove: RemoveConstraint): string[] {
  const ids = ctx.constraintDefs.map((c) => c.id)
  for (const id of ids) remove(id)
  return ids
}

/* ============================================================
   DELETING ONE RULE.

   THIS WAS REFUSED BY DESIGN UNTIL 2026-09-11, and allowing it is the
   owner's decision rather than a deduction. CONFIGURATOR_SPEC §4b
   said "rules toggle off, they are never deleted — the experiment is
   reversible and the authoring survives", and this file implemented
   exactly that. CLUELESS_USER_TESTS Finding 15 disagreed, and the
   cost of the spec as written was real: a dealer who writes a bad
   rule could only ever switch it off, so dead rules accumulate for
   the life of the sheet and `clearConstraints` — the only removal —
   throws away the good ones with them.

   THE SWITCH IS UNCHANGED AND IS STILL THE ORDINARY ACT. What is
   added is a way to be finished with a rule, not a replacement for
   being able to pause one.

   IT IS UNDOABLE. The caller gets the removed definition back, and a
   toast carrying UNDO puts it there again (rule 9 — an undoable act
   gets a toast, never a dialog). Handing the definition back rather
   than a boolean is what lets that happen without this file knowing
   anything about toasts. In the old app the extra note here was that
   the project store's Ctrl+Z could not reach this registry, because
   it was a private map behind a private key; in HL_2.0 the rules are
   a table like any other and that caveat belongs to whichever store
   owns the undo, not to this file.

   A DELETED SEED STAYS DELETED. `workbookRules.ts` keeps a ledger of
   the seed ids it has already written and never rebuilds one. Its own
   words, written long before this existed: "a rule they removed stays
   gone."
   ============================================================ */

/** Take one rule out, and hand it back so the toast can put it back.
 *  `undefined` means there was nothing to delete, which is the answer
 *  a second press gets. */
export function deleteConstraint(
  id: string,
  ctx: CatalogueCtx,
  remove: RemoveConstraint,
): ConstraintDef | undefined {
  const gone = ctx.constraintDefs.find((c) => c.id === id)
  if (!gone) return undefined
  remove(id)
  return gone
}

/** The way back from a delete — the definition as it was, not an edit
 *  of it. `putConstraint` re-stamps `updatedAt`, which is right for a
 *  rewording and wrong here: undoing a delete did not change the rule,
 *  so its own dates travel with it. Still through the observed
 *  coercion, because that guard is about what a definition may claim
 *  rather than about where it arrived from. */
export function restoreConstraint(constraint: ConstraintDef, put: PutConstraint): ConstraintDef {
  const back = sanitiseObserved(constraint)
  put(back)
  return back
}

/* A LAST NOTE ON WHAT LEFT WITH THE STORE, so nobody goes looking:
   `useConstraints`, `useConstraint`, `subscribe`, `getSnapshot` and
   `publish` were React and are not ported — `src/state/` subscribes
   now. `adoptSlugKey` migrated a business's rules from a lowercased
   name onto its slug; `orgId` on the record retires both keys and
   the migration with them. The clock left too: every act above reads
   `ctx.now()`, so a test can date a rule and a caller cannot get two
   different answers about when something happened. */
