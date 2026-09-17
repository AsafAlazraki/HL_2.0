/* ============================================================
   THE SENTENCE A DEALERSHIP PUTS ON EVERY QUOTE.

   CONFIG_FINDINGS adopt 10 — three-layer content overrides, org
   default → brand → per-quote. Two of those layers are built here and
   the third is deliberately absent; what is asserted is the part that
   could be silently wrong, which is WHEN the default is read.

   IT IS COPIED AT CREATION AND NEVER RESOLVED. Adopt 10's own virtue
   is being "a delta rather than a document copy", and for a quote
   that is exactly wrong: a document is a photograph. Changing the
   dealership's terms must leave every quote already written alone,
   and that is the property a read-time layer could not keep.

   AND THE PROFILE MUST SURVIVE A RENAME. `setOrganisation` rebuilds
   `org` from its arguments, which is how `createdAt` came to be
   re-dated once and how the slug would have been re-derived. The
   terms are the third field to need carrying forward, so the test is
   here rather than left to the next person to discover.
   ============================================================ */

/* ============================================================
   PORTED 2026-09-17 FROM `features/quote/quoteTerms.test.ts`, and it
   is the one suite in this round that could not come across as five
   cases with five assertions. What it drove was the STORE —
   `useProjectStore.setQuoteTerms` and `setOrganisation`, which write
   `meta.org`. There is no project-meta store in this milestone: the
   admin screen that types the terms is M2, and `OrgProfile` reaches
   the engine as `ctx.org` and nothing else.

   So the three promises that are about the DOCUMENT are asserted
   where the behaviour now lives — `mintQuoteFromView`, which copies
   `ctx.org.quoteTerms` onto the new quote's `note` — and the two that
   are about the store are named below rather than dropped:

   · 'SURVIVE A RENAME, which is the trap `createdAt` and the slug
     both fell into' — `setOrganisation` rebuilding the profile from
     its arguments. Nothing rebuilds a profile in this milestone;
     this case belongs with the admin screen that does, and the trap
     is recorded in `OrgProfile.slug`'s own note in the contract.
   · 'do not write a profile onto a sheet that has no organisation
     yet' — a guard inside the store's setter. The half of it that
     the engine owns IS here: a mint against a context with no
     organisation writes no note and invents no sentence.

   BOTH OF THOSE ARE NOW ASSERTED, and this note is kept rather than
   deleted because it is the record of how they got there. The
   round-2 audit found that three separate ports had each deferred
   "an organisation's identity survives a rename" to the same absent
   admin screen, so nothing in the tree measured it. The act itself
   is `src/domain/people/organisation.ts` — pure, no store — and the
   two cases above are in its suite under their own names. What stays
   here is what the DOCUMENT does with the sentence, which is a
   different question and the one this file was written to ask.

   THE COPY IS A PHOTOGRAPH, WHICH IS THE POINT THE OLD FILE MADE
   FIRST and the one this one keeps: the terms are read at mint and
   never again, so a dealership that rewrites them tomorrow has not
   rewritten the document it handed over today.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { makeCtx, type CatalogueCtx, type OrgProfile } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views/viewFor'
import { mintQuoteFromView } from './freeze'

const pack = await loadPack()

const ORG: OrgProfile = {
  name: 'Northside',
  industry: 'marine',
  createdAt: '2026-01-01T00:00:00.000Z',
  slug: 'northside',
}

/** A world with this organisation on it and nothing else changed. */
function worldWith(org: OrgProfile | undefined): CatalogueCtx {
  return makeCtx({
    ...pack.ctx,
    ...(org ? { org } : {}),
    /* a fresh page registry per case: `createViewFor` files the view
       it mints, and a view left over from another case is a different
       world */
    views: {},
  })
}

/** The first Stacer hull, quoted. The subject is the dealer's own
 *  row off the pack — nothing here is a fixture boat. */
function quoteWith(terms: string | undefined) {
  const org = terms === undefined ? ORG : { ...ORG, quoteTerms: terms }
  const ctx = worldWith(org)
  const table = pack.byKey('boat_stacer')
  const view = createViewFor(ctx, table.id)
  const row = pack.rowsByEntity[table.id][0]
  const quote = mintQuoteFromView(ctx, {
    viewId: view.id,
    rowId: row.id,
    reference: '20260101-01',
  })
  expect(quote).not.toBeNull()
  return quote!
}

describe('the standing terms', () => {
  it('are kept as typed', () => {
    expect(quoteWith('This quote is valid for 30 days.').note).toBe(
      'This quote is valid for 30 days.',
    )
  })

  it('are trimmed, because a trailing space is not part of a sentence', () => {
    expect(quoteWith('  Valid 30 days.  ').note).toBe('Valid 30 days.')
  })

  it('ARE CLEARED RATHER THAN STORED EMPTY, so a document with no note round-trips honestly', () => {
    const quote = quoteWith('   ')
    expect(quote.note).toBeUndefined()
    expect('note' in quote).toBe(false)
  })

  it('do not write a note onto a document raised on a sheet with no organisation yet', () => {
    const ctx = worldWith(undefined)
    const table = pack.byKey('boat_stacer')
    const view = createViewFor(ctx, table.id)
    const row = pack.rowsByEntity[table.id][0]
    const quote = mintQuoteFromView(ctx, {
      viewId: view.id,
      rowId: row.id,
      reference: '20260101-01',
    })
    expect(ctx.org).toBeUndefined()
    expect(quote?.note).toBeUndefined()
    expect('note' in (quote ?? {})).toBe(false)
  })

  it('ARE A PHOTOGRAPH — rewriting them leaves the document already written alone', () => {
    /* the property the old file's header argues for and the reason
       this is a copy rather than a resolved layer: the quote holds
       the sentence it was minted with, and a later organisation is a
       later organisation */
    const quote = quoteWith('Valid 30 days.')
    const later = worldWith({ ...ORG, quoteTerms: 'Valid 14 days.' })
    expect(later.org?.quoteTerms).toBe('Valid 14 days.')
    expect(quote.note).toBe('Valid 30 days.')
  })
})
