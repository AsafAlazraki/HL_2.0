/* ============================================================
   WHAT A PERSON DECIDED ABOUT A DISCOVERED PATTERN — kept, or
   dismissed, and either way it stays decided.

   ── THE FIELD ARRIVED, AND A KEPT PATTERN CAN NOW GO HOME ────

   This file used to open by explaining why a kept pattern is NOT a
   `ConstraintDef` and must never become one. The argument was:

     · `ConstraintDef` has no severity. Its four kinds — implies,
       excludes, requires, table — all PRUNE, so writing a measured
       pattern into that store would hand it exactly the power this
       engine exists to withhold;
     · so a kept pattern lives here, in a register nothing in the
       configurator reads; it cannot delete a row from anybody's list
       because there is no code path from this file to a domain.

   That was true and it was also the whole problem. A kept pattern
   was LISTED AND INERT — it could not be edited, switched off,
   exported or reasoned about like a rule, and the panel that offered
   to keep it promised a warning that nothing anywhere delivered.

   The paragraph that used to end this section said what would change
   it: "One field on `ConstraintDef` — `severity: 'block' | 'warn'` —
   with the configurator honouring 'warn' by annotating rather than
   blocking." BOTH NOW EXIST. `severity` is on the type (absent means
   'block', so nothing already written changed meaning) and
   `src/domain/rules/configure/solve.ts` honours 'warn' on its own
   channel, `warned`, which never overlaps `blocked`.

   SO A KEPT PATTERN IS ADOPTED AS A REAL RULE — see
   `adoptKeptPatterns` at the foot of this file and the door it goes
   through, `src/domain/rules/adopt.ts`.

   THE GUARANTEE DID NOT MOVE, IT GOT STRONGER. It used to rest on
   there being no code path; it now rests on a coercion applied at
   every seam a ConstraintDef can enter the registry — adoption,
   `registerConstraints`, `putConstraint` and the read out of
   storage. Nothing carrying observed provenance can hold 'block',
   including a rule hand-edited in storage, and `adopt.test.ts`
   proves it by trying.

   THIS REGISTER STILL EXISTS AND IS STILL THE DECISION OF RECORD.
   Adoption does not replace it: it holds the MEASUREMENT that earned
   the decision (see `DiscoveredRule` in the contract on why the
   figures are copied rather than referenced), it holds dismissals,
   which are not rules at all, and it holds every kept pattern whose
   shape this app cannot yet state as a sentence — with the blocker,
   in words, the same way `RULE_LEDGER` draws the sixteen workbook
   seeds.

   DISMISSED STAYS DISMISSED. A dismissal is a decision about a
   finding, not a filter on a list: the candidate is still measured
   on every run and still counted, it simply does not come back to
   the top of the page asking again. `forget` is the way back and it
   is what UNDO on the toast calls.

   ── WHERE THE REGISTRY WENT ──────────────────────────────────

   The shape used to be `constraintDefs.ts`'s: a module-level map
   keyed by organisation, a synchronous snapshot, a microtask notify
   and a debounced mirror in the browser's key-value store (named in
   words, because `tools/check.ts` reserves the word itself for
   `src/state/prefs.ts`), with its own header promising that "when the
   store grows a slice for either, both swap the same way".
   HL_2.0 has that slice — `src/data/repository.ts` —
   so both swapped, together, and what is left in both files is the
   part that was never about storage. The decisions are read off
   `CatalogueCtx.discoveredRules`; a write is a callback the caller
   passes beside it; nothing here holds state between calls.
   ============================================================ */

import { nowIso } from '@/domain/id'
import type {
  CatalogueCtx,
  ConstraintDef,
  DiscoveredRule,
  DiscoveryDecision,
  EntityDef,
} from '@/domain/model'
import {
  adoptObserved,
  OBSERVED_ID_PREFIX,
  type Adoption,
  type ObservedPattern,
} from '@/domain/rules/adopt'
import { MAY_PRUNE } from './discover'
import type { Candidate } from './discover'
import { buildConcepts, representativeFieldId, type ColumnConcept } from './columns'
import {
  getConstraint,
  registerConstraints,
  setConstraintEnabled,
  type PutConstraint,
} from './constraintDefs'

/* ---------------------------------------------------------- */
/* What is stored                                              */
/* ---------------------------------------------------------- */

/* THE RECORD IS THE CONTRACT'S NOW, NOT THIS FILE'S. `KeptPattern`
   was declared here, beside the registry that held it; a persisted
   record belongs to `src/domain/model` and `DiscoveredRule` is that
   same shape with `orgId` added, because every persisted record in
   HL_2.0 carries the tenant key. The old name stays as an alias
   because this feature reads in its own words — a decision about a
   pattern somebody KEPT — and because forking the shape locally is
   the one thing the contract asks nobody to do. */
export type KeptPattern = DiscoveredRule
export type { DiscoveryDecision }

/** Re-asserted at this end of the wire as well. A register that
 *  stores rules has to say, in its own file, that none of them may
 *  prune — otherwise the guarantee lives only in the engine and the
 *  next person to add a consumer here never reads it. */
export const KEPT_MAY_PRUNE = MAY_PRUNE

/* ---------------------------------------------------------- */
/* Writing — the callbacks that replace `publish()`             */
/* ---------------------------------------------------------- */

/** Where a decision goes. `put` replaces the decision sharing an id;
 *  `remove` is what `forget` calls. Both are the caller's, so this
 *  file stays pure — see the header. */
export type PutDecision = (decision: DiscoveredRule) => void
export type RemoveDecision = (id: string) => void

/** The two writes recording a decision performs, handed in together
 *  because keeping a pattern touches BOTH registers: the decision is
 *  filed here and the rule it makes is filed in the constraints. */
export interface DecisionWrites {
  decision: PutDecision
  constraint: PutConstraint
}

/* ---------------------------------------------------------- */
/* Reading                                                     */
/* ---------------------------------------------------------- */

const EMPTY: DiscoveredRule[] = []

/** Every decision this context's organisation has made. */
export function getDecisions(ctx: CatalogueCtx): DiscoveredRule[] {
  return ctx.discoveredRules.length === 0 ? EMPTY : ctx.discoveredRules
}

/**
 * WHAT COMES BACK FROM STORAGE, SIFTED.
 *
 * The old `load()` read one key out of the browser's key-value store
 * and dropped any row claiming to prune: "storage is editable by hand
 * and this is the one property that may not be acquired by editing a
 * JSON file". The
 * repository is that seam now and the sifting still has to happen at
 * it, so it lives here where the reason is written down.
 *
 * A row is dropped, not repaired. A decision whose enforcement was
 * edited to something that filters is not a decision this app can
 * honour, and quietly rewriting it to 'warn' would be inventing a
 * decision nobody made.
 */
export function loadDecisions(rows: readonly unknown[]): DiscoveredRule[] {
  const out: DiscoveredRule[] = []
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const k = row as DiscoveredRule
    if (typeof k.id !== 'string' || k.id === '') continue
    if (k.enforcement !== 'warn' && k.enforcement !== 'report') continue
    if (k.evidence !== 'observed') continue
    out.push(k)
  }
  return out
}

/* ---------------------------------------------------------- */
/* Writing                                                     */
/* ---------------------------------------------------------- */

/** Fold a measured candidate into a stored decision. Exported so the
 *  test can build one without a React tree.
 *
 *  `orgId` and `now` are parameters rather than store and clock
 *  reads: every persisted record carries the tenant key, and a pure
 *  module never asks the machine what time it is when a caller can
 *  say. Both default to the honest empty a context with no
 *  organisation has, so a test may build a decision with neither. */
export function decisionFrom(
  c: Candidate,
  decision: DiscoveryDecision,
  orgId = '',
  now: string = nowIso(),
): DiscoveredRule {
  return {
    id: c.id,
    orgId,
    decision,
    shape: c.shape,
    relationship: c.relationship,
    statement: c.statement,
    because: c.because,
    source: c.source,
    evidence: 'observed',
    enforcement: c.enforcement,
    binds: c.binds ?? null,
    hits: c.hits,
    tested: c.tested,
    meanLeft: c.discrimination ? c.discrimination.meanLeft : null,
    catalogue: c.discrimination ? c.discrimination.catalogue : null,
    counterExampleTotal: c.counterExampleTotal,
    decidedAt: now,
  }
}

/** Record a decision. Returns what was stored, so a caller can put
 *  the same figures on the toast it raises. */
export function decide(
  ctx: CatalogueCtx,
  c: Candidate,
  decision: DiscoveryDecision,
  writes: DecisionWrites,
): DiscoveredRule {
  const stored = decisionFrom(c, decision, ctx.orgId, ctx.now())
  writes.decision(stored)
  /* KEEPING IT IS WHAT MAKES THE RULE. The toast says the pattern now
     flags a pairing that disagrees; this is the line that makes that
     sentence true. It is safe to fail — `adoptKeptPatterns` reports
     rather than throws, and the decision above is already stored.

     IT IS ADOPTED FROM A CONTEXT THAT ALREADY HOLDS IT. The decision
     was just written through a callback and the snapshot in hand
     predates it, so the pattern is spliced in here rather than read
     back; the caller's next snapshot carries it for real. */
  if (decision === 'kept') {
    const withIt = ctx.discoveredRules.filter((k) => k.id !== stored.id)
    adoptKeptPatterns({ ...ctx, discoveredRules: [...withIt, stored] }, writes.constraint)
  }
  return stored
}

/** The way back — what UNDO calls. Returns the rule id it switched
 *  off, or undefined when there was no decision to forget. */
export function forget(
  ctx: CatalogueCtx,
  id: string,
  remove: RemoveDecision,
  put: PutConstraint,
): string | undefined {
  const held = ctx.discoveredRules.find((k) => k.id === id)
  if (!held) return undefined
  remove(id)
  /* STOP KEEPING IT AND THE RULE STOPS, but it is switched OFF rather
     than deleted, and that is now a choice rather than the only
     option: `deleteConstraint` exists as of 2026-09-11. It stays a
     switch here because UNDO on this toast has to bring the rule back
     with the person's own edits and wording intact, and because
     un-keeping a DISCOVERED pattern is a statement about the pattern
     rather than about the rule somebody may have since reworded. A
     person who wants the rule gone deletes it on its own card. */
  const ruleId = `${OBSERVED_ID_PREFIX}${id}`
  return setConstraintEnabled(ruleId, false, ctx, put) ? ruleId : undefined
}

/** For `resetProject()`, beside `clearConstraints()`. A wiped project
 *  that comes back carrying the last organisation's decisions is the
 *  same fault the constraint registry records. Returns the ids it
 *  removed, so a caller can say how many. */
export function clearDecisions(ctx: CatalogueCtx, remove: RemoveDecision): string[] {
  const ids = ctx.discoveredRules.map((k) => k.id)
  for (const id of ids) remove(id)
  return ids
}

/* ---------------------------------------------------------- */
/* Adoption — the register's one door into the rule store      */
/* ---------------------------------------------------------- */

/**
 * conceptKey -> the field id a clause may point at.
 *
 * NOT `conceptIndex`, which is keyed by FIELD ID. A finding names a
 * column the way `buildConcepts` mints keys — `kind::normalised name`,
 * e.g. 'trailer::atm (kg)' — and `conceptByKey` is what reads one.
 * Getting this wrong does not throw: every adoption simply comes back
 * blocked with "no table carries that column any more", which is a
 * sentence about the project rather than about the code. Hence the
 * note, and hence `adoptKept.test.ts` resolving a real one.
 */
function resolverFor(entities: Record<string, EntityDef>): (key: string) => string | undefined {
  const byKey = new Map<string, ColumnConcept>()
  for (const c of buildConcepts(entities)) byKey.set(c.key, c)
  return (conceptKey) => {
    const concept = byKey.get(conceptKey)
    return concept ? representativeFieldId(concept) : undefined
  }
}

/** What one call did, in the shape `SeedReport` already uses, so the
 *  two seeding surfaces read the same. */
export interface AdoptionReport {
  /** ids adopted as rules by THIS call */
  adopted: string[]
  /** already in the rule store — left exactly as they are, so an edit
   *  survives and a rule switched off stays off */
  alreadyAdopted: string[]
  /** kept, but this app cannot state it as a sentence yet; the reason
   *  is the value, in the words a card prints */
  blocked: Array<{ id: string; why: string }>
}

/**
 * Every kept pattern this organisation holds, offered to the rule
 * store as a real `ConstraintDef` carrying severity 'warn'.
 *
 * IDEMPOTENT, AND NON-DESTRUCTIVE IN BOTH DIRECTIONS. A pattern
 * whose rule already exists is never rebuilt — the wording a person
 * changed and the switch they threw are theirs — except that
 * re-keeping something they had stopped keeping switches its rule
 * back on, which is the only thing "keep it again" can honestly
 * mean.
 *
 * Safe to call on every load and every time the tables change: a
 * pattern whose columns are not in this project yet comes back under
 * `blocked` and is tried again next time, rather than being written
 * bound to nothing. That is `seedWorkbookConstraints`'s contract,
 * deliberately.
 *
 * THE ORGANISATION GUARD LEFT WITH THE KEY. The old function took an
 * `orgKey` and refused to adopt into an organisation other than the
 * current one, because the registry it wrote to always wrote to the
 * current one — "adopting into a different one from here would put
 * rules somewhere nobody asked for them". A context IS one
 * organisation, so there is no second one to adopt into by mistake
 * and nothing left for the guard to catch.
 */
export function adoptKeptPatterns(ctx: CatalogueCtx, put: PutConstraint): AdoptionReport {
  const report: AdoptionReport = { adopted: [], alreadyAdopted: [], blocked: [] }

  const kept = ctx.discoveredRules.filter((k) => k.decision === 'kept')
  if (kept.length === 0) return report

  const resolve = resolverFor(ctx.entities)

  const now = ctx.now()
  const fresh: ConstraintDef[] = []
  for (const k of kept) {
    const id = `${OBSERVED_ID_PREFIX}${k.id}`
    const existing = getConstraint(ctx, id)
    if (existing) {
      report.alreadyAdopted.push(k.id)
      /* re-keeping switches it back on; nothing else about it moves */
      if (existing.enabled === false) setConstraintEnabled(id, true, ctx, put)
      continue
    }
    const result: Adoption = adoptObserved(asObservedPattern(k), resolve, now, ctx.orgId)
    if (result.adopted) {
      fresh.push(result.adopted)
      report.adopted.push(k.id)
    } else {
      report.blocked.push({ id: k.id, why: result.blocked })
    }
  }

  if (fresh.length > 0) registerConstraints(fresh, put)
  return report
}

/** The register's record, reduced to what the door takes. Written out
 *  rather than spread, so a field added here is a decision and not an
 *  accident. */
function asObservedPattern(k: DiscoveredRule): ObservedPattern {
  return {
    id: k.id,
    shape: k.shape,
    statement: k.statement,
    because: k.because,
    source: k.source,
    binds: k.binds ?? null,
    hits: k.hits,
    tested: k.tested,
  }
}

/**
 * WHY ONE KEPT PATTERN IS NOT A RULE, or undefined when it is one.
 *
 * Rule 10 in one function: a card listing a kept pattern that this
 * app cannot state has to say so IN PLACE, in words a person can
 * argue with, rather than leaving a row that quietly does nothing.
 * `RULE_LEDGER` already draws exactly this for the sixteen
 * workbook seeds; this is the same answer for a measured one.
 *
 * PURE — it takes the tables rather than reading the store, so a
 * render may ask it and a test may prove it. It answers "could this
 * be stated as a rule at all", which is the question the card asks;
 * whether it already HAS been is `adoptKeptPatterns`'s report.
 */
export function adoptionBlocker(
  k: DiscoveredRule,
  entities: Record<string, EntityDef>,
): string | undefined {
  if (!k || k.decision !== 'kept') return undefined
  return adoptObserved(asObservedPattern(k), resolverFor(entities), k.decidedAt, k.orgId).blocked
}
