/* ============================================================
   RENAMING THE BUSINESS ORPHANED ITS BUSINESS RULES.

   TENANCY §4.1, and the doc is blunt about it: "This is the
   smallest change on the list and the only one that fixes a bug
   that exists today, so it should not wait for the rest."

   `orgKeyOf` returned the lowercased NAME, because the name was
   the only identity `OrgProfile` carried. So a dealership that
   corrected its own name in settings lost every rule it had
   written — not deleted, filed under a key nothing asked for
   again, and the pane went quiet with no way to tell that from
   never having written one.

   These assert the FACT the slug exists for: what a business
   wrote is still there after it changes what it is called.
   ============================================================ */

/* ============================================================
   PORTED 2026-09-17, AND IT IS THREE SUITES ARRIVING AT ONCE.

   The round-2 audit found that one property had been deferred by
   three separate ports, each of them to an admin screen that does
   not exist, and that nothing in the tree measured it as a result.
   The three, and what came across:

   1. `features/constraints/tenantKey.test.ts`, 14 cases. THREE come
      across whole — the minting group, which is `orgSlug` and which
      this build exports untouched. ONE comes across rewritten and
      says so below: 'THE RULE SURVIVES THE RENAME THAT USED TO LOSE
      IT', end to end, because the mechanism changed and the fact did
      not. The other TEN cannot and never will: they drive
      `orgKeyOf`, `legacyOrgKeyOf` and `adoptSlugKey` — a key computed
      from OUTSIDE the record, a fallback for sheets saved before
      slugs existed, and the migration that moved a business's rules
      from one key to the other. HL_2.0 has none of the three by
      decision: every record carries `orgId` itself
      (`src/domain/rules/constraints/constraintDefs.ts`, header
      point 1), and "no boot-time migrations or adoptions"
      (docs/DECISIONS.md, 2026-09-16). A test for a key that does not
      exist would be a test of nothing.

   2. `store/undo.test.ts`, the group "when the business was set up",
      4 cases. Whole, below, against the pure `setOrganisation` this
      round wrote for them. They are not in `src/domain/undo.test.ts`
      because they were never about the history stack: they were in
      that file because the store action was.

   3. `features/quote/quoteTerms.test.ts`, 5 cases. Three of them
      assert what the DOCUMENT does with the sentence and are in
      `src/domain/quote/quoteTerms.test.ts`, where the round-1 port
      put them. The two that belong to the SETTER are here, under
      their own names, and they are the two that file said it could
      not port.

   WHAT DRIVES THEM NOW. The old subject was
   `useProjectStore.setOrganisation` / `.setQuoteTerms`. There is no
   project-meta store in this milestone, so the reasoning moved to
   `src/domain/people/organisation.ts` as pure functions over the
   profile — same bodies, same comments, the clock injected. Every
   assertion below is the old one; where a call had to change shape,
   the case says so in its own words.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { makeCtx, orgSlug, type ConstraintDef, type OrgProfile } from '@/domain/model'
import { createConstraint, getConstraints } from '@/domain/rules/constraints/constraintDefs'
import { setOrganisation, setQuoteTerms } from './organisation'

/* A clock a test can drive, so 'stamped once' is a fact and not a
   race with the machine. */
const AT = '2026-09-17T09:00:00.000Z'
const now = () => AT

describe('minting a slug', () => {
  it('is a name reduced to a key', () => {
    expect(orgSlug('Northside Marine')).toBe('northside-marine')
  })

  it('collapses punctuation and runs of separators rather than keeping them', () => {
    expect(orgSlug('  Bob & Sons  Marine, Pty Ltd.  ')).toBe('bob-sons-marine-pty-ltd')
  })

  it('never returns an empty key, because a key of nothing files nothing', () => {
    expect(orgSlug('***')).toBe('sheet')
    expect(orgSlug('')).toBe('sheet')
  })
})

describe('which key a business is filed under', () => {
  it('is the slug, minted from the first name it was given', () => {
    const org = setOrganisation(undefined, 'Northside Marine', 'marine', undefined, now)
    expect(org.slug).toBe('northside-marine')
  })

  it('IGNORES THE NAME once a slug exists — that is the whole bug', () => {
    /* The same business, a different name: still one key. In the old
       app this was `orgKeyOf` refusing to re-derive; here it is
       `setOrganisation` refusing to re-mint, which is the same
       refusal one step earlier. */
    const before = setOrganisation(undefined, 'Northside Marine', 'marine', undefined, now)
    const after = setOrganisation(before, 'Northside Marine Group', 'marine', undefined, now)
    expect(after.slug).toBe(before.slug)
    expect(after.name).toBe('Northside Marine Group')
  })

  it('is minted from the name a business is given, never from the one it is renamed to', () => {
    const before = setOrganisation(undefined, 'Bob & Sons Marine', 'marine', undefined, now)
    const after = setOrganisation(before, 'Northside Marine', 'marine', undefined, now)
    expect(after.slug).toBe('bob-sons-marine')
  })
})

/* ============================================================
   TENANCY §4.6 — "OrgProfile.createdAt cannot survive a replace."

   It stamped `nowIso()` on every call, and `Shell.tsx` calls
   `setOrganisation` after EVERY project swap to put the business
   back on the masthead. So the one effect written to survive a
   swap was itself re-dating the business to the moment of the
   swap, and loading a prepared set quietly moved the date to
   today.

   These assert WHEN THE BUSINESS STARTED, which is the fact the
   field is for — not the shape of the object holding it.
   ============================================================ */

describe('when the business was set up', () => {
  const WAS = '2019-04-01T00:00:00.000Z'

  it('is stamped once on a sheet that never had one', () => {
    const org = setOrganisation(undefined, 'Northside Marine', 'marine')
    const at = org.createdAt
    expect(at).toBeTruthy()
    expect(Number.isNaN(Date.parse(at ?? ''))).toBe(false)
  })

  it('SURVIVES A RENAME — a new name is not a new business', () => {
    const first = setOrganisation(undefined, 'Northside Marine', 'marine', WAS, now)
    const renamed = setOrganisation(first, 'Northside Marine Group', 'marine', undefined, now)
    expect(renamed.createdAt).toBe(WAS)
    expect(renamed.name).toBe('Northside Marine Group')
  })

  it('survives a change of industry', () => {
    const first = setOrganisation(undefined, 'Northside', 'marine', WAS, now)
    const moved = setOrganisation(first, 'Northside', 'automotive', undefined, now)
    expect(moved.createdAt).toBe(WAS)
  })

  it('is restored across a project swap rather than re-stamped', () => {
    /* What the Shell did: remember the profile, let the swap drop
       it, hand the whole thing back — including the date. The swap
       is expressed here as the profile going to `undefined`, which
       is exactly what `replaceProject` did to it. */
    const first = setOrganisation(undefined, 'Northside', 'marine', WAS, now)
    const remembered: OrgProfile | undefined = first
    expect(remembered).toBeDefined()

    const dropped: OrgProfile | undefined = undefined
    const back = setOrganisation(
      dropped,
      remembered.name,
      remembered.industry,
      remembered.createdAt,
      now,
    )

    expect(back.createdAt).toBe(WAS)
  })
})

describe('the rule a business wrote, after it renamed itself', () => {
  /** The world, with this profile on it and these rules in it. The
   *  `orgId` is the slug, which is what makes this the same test the
   *  old one was: the key the rules are filed under is the one the
   *  profile minted once. */
  const worldWith = (org: OrgProfile, constraintDefs: ConstraintDef[]) =>
    makeCtx({ orgId: org.slug ?? '', org, constraintDefs, now })

  it('THE RULE SURVIVES THE RENAME THAT USED TO LOSE IT', () => {
    /* The whole point, end to end: onboarding sets the organisation,
       a rule is written, the business corrects its own name, and the
       rule is still there.

       REWRITTEN, AND HERE IS WHAT CHANGED. The old case went through
       `registerConstraints(rules, orgKeyOf(meta))` and read them back
       with `getConstraints()`, which resolved the key off the live
       store every time it was called — so a rename moved the reader
       and left the rules behind. In HL_2.0 the rule carries `orgId`
       itself and the reader is handed a context, so the failure mode
       is not "the reader looks in the wrong drawer" but "the profile
       mints a second key". The assertion is the same one: after the
       rename, the rule is still there and still filed under the
       business that wrote it. */
    const org = setOrganisation(undefined, 'Northside Marine', 'marine', undefined, now)
    expect(org.slug).toBe('northside-marine')

    const written: ConstraintDef[] = []
    createConstraint(
      {
        if: { combinator: 'AND', clauses: [] },
        because: 'the hull is not rated for that much power',
      },
      worldWith(org, written),
      (c) => written.push(c),
    )
    expect(getConstraints(worldWith(org, written))).toHaveLength(1)

    const renamed = setOrganisation(org, 'Northside Marine Group', 'marine', undefined, now)
    expect(renamed.name).toBe('Northside Marine Group')
    expect(renamed.slug).toBe(org.slug)
    expect(getConstraints(worldWith(renamed, written))).toHaveLength(1)
    expect(written[0]?.orgId).toBe('northside-marine')
  })
})

/* ============================================================
   THE SENTENCE A DEALERSHIP PUTS ON EVERY QUOTE, at the setter.

   `src/domain/quote/quoteTerms.test.ts` asserts what the DOCUMENT
   does with it — copied at the mint, never resolved, so rewriting
   the terms leaves a quote already written alone. These two are the
   ones that file named and could not carry: they are about the
   PROFILE, and the profile had no writer until this round.
   ============================================================ */

describe('the standing terms', () => {
  const ORG = () => setOrganisation(undefined, 'Northside', 'marine', undefined, now)

  it('SURVIVE A RENAME, which is the trap `createdAt` and the slug both fell into', () => {
    const typed = setQuoteTerms(ORG(), 'Valid 30 days.')
    const renamed = setOrganisation(typed, 'Northside Marine', 'marine', undefined, now)
    expect(renamed.name).toBe('Northside Marine')
    expect(renamed.quoteTerms).toBe('Valid 30 days.')
  })

  it('ARE CLEARED RATHER THAN STORED EMPTY, so a document with no note round-trips honestly', () => {
    const typed = setQuoteTerms(ORG(), 'Valid 30 days.')
    const cleared = setQuoteTerms(typed, '   ')
    expect(cleared?.quoteTerms).toBeUndefined()
    expect('quoteTerms' in (cleared ?? {})).toBe(false)
  })

  it('do not write a profile onto a sheet that has no organisation yet', () => {
    expect(setQuoteTerms(undefined, 'Valid 30 days.')).toBeUndefined()
  })
})
