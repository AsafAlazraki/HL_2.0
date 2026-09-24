import { describe, expect, it } from 'vitest'
import type { QuoteDef } from '@/domain/model'
import type { RegisterRow } from '@/domain/quote/register'
import { pictureForSubject } from '@/screens/home/ledgers'
import { newestPictured } from './latest'

/* ============================================================
   WHICH BOAT THE REGISTER PHOTOGRAPHS, AND WHEN IT PHOTOGRAPHS NONE.

   Three quotes written by hand, the way a unit test writes the shape it
   is about — never a fixture passed off as a dealer's day. The picture
   reader is Home's own, over the real heroes ledger, so the last case
   holds the register to the ledger's exact-model rule rather than to a
   rule written here.
   ============================================================ */

const row = (over: Partial<RegisterRow>): RegisterRow => ({
  id: 'q',
  reference: '20260923-01',
  state: 'draft',
  boat: 'A boat',
  label: 'A boat',
  customer: null,
  total: null,
  insteadOfTotal: null,
  unpriced: 0,
  lines: 1,
  createdAt: '2026-09-23T00:00:00.000Z',
  updatedAt: '2026-09-23T00:00:00.000Z',
  issuedAt: null,
  preparedBy: null,
  supersedesId: null,
  supersedes: null,
  supersededById: null,
  supersededBy: null,
  ...over,
})

const quote = (id: string, rootTableId: string, subjectLabel: string): QuoteDef =>
  ({ id, rootTableId, subjectLabel }) as unknown as QuoteDef

/** a picture reader that holds every boat labelled "held" and no other */
const reader = (_table: string, label: string) => (label === 'held' ? 'picture' : undefined)

describe('the newest quote whose boat is photographed', () => {
  const rows = [
    row({ id: 'a', reference: '20260921-01', updatedAt: '2026-09-21T01:00:00.000Z' }),
    row({
      id: 'b',
      reference: '20260922-01',
      state: 'issued',
      updatedAt: '2026-09-20T01:00:00.000Z',
      issuedAt: '2026-09-22T01:00:00.000Z',
    }),
    row({ id: 'c', reference: '20260923-01', updatedAt: '2026-09-23T01:00:00.000Z' }),
  ]
  const quotes = [quote('a', 't', 'held'), quote('b', 't', 'held'), quote('c', 't', 'not held')]

  it('is the newest by the act that dates it, passing over a boat with no photograph', () => {
    /* c is newest and its boat is not held; b was GIVEN on the 22nd, which
       dates it after a's last touch on the 21st, though b was last touched
       on the 20th */
    expect(newestPictured(rows, quotes, reader)?.row.id).toBe('b')
  })

  it('is nothing at all when no quote here has its boat held', () => {
    expect(newestPictured(rows, quotes, () => undefined)).toBeNull()
    expect(newestPictured([], quotes, reader)).toBeNull()
  })

  it('answers only for the exact model the heroes ledger holds', () => {
    const one = [row({ id: 'x' })]
    /* the Sport 560 is held; the Sport 560X is another boat, and a
       picture of the one is never a picture of the other */
    expect(
      newestPictured(
        one,
        [quote('x', 'boat_highfield', 'Highfield - SP560 (PVC) W-W-WB')],
        pictureForSubject,
      )?.picture.model,
    ).toBe('SP560')
    expect(
      newestPictured(
        one,
        [quote('x', 'boat_highfield', 'Highfield - SP560X (PVC)')],
        pictureForSubject,
      ),
    ).toBeNull()
    expect(
      newestPictured(
        one,
        [quote('x', 'boat_stacer', 'Highfield - SP560 (PVC)')],
        pictureForSubject,
      ),
    ).toBeNull()
  })
})
