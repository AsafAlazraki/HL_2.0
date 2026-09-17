/* ============================================================
   NOTHING OBSERVED MAY EVER BE STORED AS 'block'.

   That is the one sentence this file exists to make unfalsifiable.
   A measured pattern is not a stated rule: the discovery engine
   reads a price file and proposes the rules the file already
   follows, every proposal is read off VALUES rather than off a
   formula, and an observed pattern can be a coincidence. Pruning on
   a coincidence deletes real business.

   The guarantee used to rest on there being no code path from the
   register to a domain. It now rests on a coercion, which is a
   stronger thing to rest on only if it is applied at every seam —
   at the registry itself and on the way out of storage, which is the
   seam that matters most because storage is a text file a person can
   edit by hand. Those three seam cases are now asserted where the
   registry lives, against the pure API it became; the note at the
   foot of this file says where they went and why.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import type { ConstraintDef } from '@/domain/model'
import {
  NOT_EXPRESSIBLE,
  OBSERVED_ID_PREFIX,
  OBSERVED_SEVERITY,
  OBSERVED_SOURCE,
  adoptObserved,
  isObservedConstraint,
  sanitiseAllObserved,
  sanitiseObserved,
  type ObservedPattern,
} from './adopt'

const NOW = '2026-08-21T00:00:00.000Z'

const bound = (over: Partial<ObservedPattern> = {}): ObservedPattern => ({
  id: 'dx:bound:boat·trailer:trailer·Length>=boat·Hull Length',
  shape: 'numeric-bound',
  statement: 'A trailer’s “Length” is never below the boat’s “Hull Length”.',
  because: '530 of 530 pairings the price file writes hold it',
  source: '“Length” on 3 trailer tables against “Hull Length” on 7 boat tables',
  binds: {
    far: { conceptKey: 'trailer::length', name: 'Length' },
    near: { conceptKey: 'boat::hull length', name: 'Hull Length' },
  },
  hits: 530,
  tested: 530,
  ...over,
})

const resolve = (key: string): string | undefined =>
  ({ 'trailer::length': 'f_trailer_len', 'boat::hull length': 'f_boat_len' })[key]

/* ---------------------------------------------------------- */

describe('a numeric bound becomes a real rule', () => {
  const result = adoptObserved(bound(), resolve, NOW)
  const c = result.adopted as ConstraintDef

  it('is adopted', () => {
    expect(result.blocked).toBeUndefined()
    expect(c).toBeDefined()
  })

  it('carries severity warn, and could not carry anything else', () => {
    expect(c.severity).toBe('warn')
    expect(OBSERVED_SEVERITY).toBe('warn')
  })

  it('carries both provenance markers, so stripping one does not launder it', () => {
    expect(c.id.startsWith(OBSERVED_ID_PREFIX)).toBe(true)
    expect(c.source).toBe(OBSERVED_SOURCE)
    expect(isObservedConstraint({ ...c, source: 'something else' })).toBe(true)
    expect(isObservedConstraint({ ...c, id: 'plain-id' })).toBe(true)
  })

  it('points the comparison the way the finding measured it — far is never below near', () => {
    const clause = c.then?.clauses[0]
    expect(clause?.left.fieldId).toBe('f_trailer_len')
    expect(clause?.op).toBe('gte')
    expect(clause?.right).toEqual({ kind: 'field', path: { fieldId: 'f_boat_len' } })
  })

  it('guards on the near side being filled in, because that is all that was measured', () => {
    expect(c.if.clauses).toHaveLength(1)
    expect(c.if.clauses[0].left.fieldId).toBe('f_boat_len')
    expect(c.if.clauses[0].op).toBe('notEmpty')
  })

  it('keeps the measurement in the words a person reads', () => {
    expect(c.because).toBe('530 of 530 pairings the price file writes hold it')
    expect(c.why).toContain('530 of 530')
    expect(c.why).toContain('warns and never removes')
  })

  it('is stable — the same finding adopted twice is the same rule', () => {
    const again = adoptObserved(bound(), resolve, NOW)
    expect(again.adopted?.id).toBe(c.id)
  })

  /* NEW IN HL_2.0, because the contract is new: every persisted record
     carries the tenant key, so the adoption has to be told whose rule
     it is minting. Told nothing, it says nothing — it does not claim
     an organisation it was never given. */
  it('files the rule under the organisation it was told, and under none when it was told none', () => {
    expect(adoptObserved(bound(), resolve, NOW, 'northside').adopted?.orgId).toBe('northside')
    expect(c.orgId).toBe('')
  })
})

describe('a shape this app cannot state is held back, with the reason in words', () => {
  const shapes = [
    'categorical-selector',
    'join-key',
    'functional-dependency',
    'uniqueness',
  ] as const

  for (const shape of shapes) {
    it(`refuses ${shape} and says why`, () => {
      const r = adoptObserved(bound({ shape }), resolve, NOW)
      expect(r.adopted).toBeUndefined()
      expect(r.blocked).toBe(NOT_EXPRESSIBLE[shape])
      expect(r.blocked?.length).toBeGreaterThan(20)
    })
  }

  it('refuses a shape it has never heard of without throwing', () => {
    const r = adoptObserved(bound({ shape: 'something-new' }), resolve, NOW)
    expect(r.adopted).toBeUndefined()
    expect(r.blocked).toContain('something-new')
  })

  it('refuses a decision stored before the columns were recorded on it', () => {
    const r = adoptObserved(bound({ binds: null }), resolve, NOW)
    expect(r.adopted).toBeUndefined()
    expect(r.blocked).toContain('re-run discovery')
  })

  it('refuses when the project no longer carries the column, and names it', () => {
    const r = adoptObserved(bound(), (k) => (k === 'trailer::length' ? 'f' : undefined), NOW)
    expect(r.adopted).toBeUndefined()
    expect(r.blocked).toContain('Hull Length')
  })

  it('refuses to compare a column with itself', () => {
    const r = adoptObserved(bound(), () => 'same_field', NOW)
    expect(r.adopted).toBeUndefined()
    expect(r.blocked).toContain('itself')
  })

  it('refuses a finding with no id', () => {
    const r = adoptObserved(bound({ id: '' }), resolve, NOW)
    expect(r.blocked).toContain('no id')
  })
})

describe('THE GUARANTEE — no input produces a blocking observed rule', () => {
  /* Every shape, and every severity somebody could try to smuggle in,
     including the absent one that MEANS 'block'. */
  const shapes = [
    'numeric-bound',
    'categorical-selector',
    'join-key',
    'functional-dependency',
    'uniqueness',
    'invented-by-a-later-version',
  ]
  const severities: Array<'block' | 'warn' | undefined> = ['block', 'warn', undefined]

  it('is exhaustive over shape × severity', () => {
    let adopted = 0
    for (const shape of shapes) {
      for (const severity of severities) {
        /* severity is not an input to adoption at all — that is the
           point. It is asserted anyway, because a future signature
           that accepted one would silently pass every other test. */
        const pattern = { ...bound({ shape }), severity } as ObservedPattern
        const r = adoptObserved(pattern, resolve, NOW)
        if (!r.adopted) continue
        adopted++
        expect(r.adopted.severity).toBe('warn')
      }
    }
    /* and the sweep really did adopt something, or it proved nothing */
    expect(adopted).toBe(severities.length)
  })

  it('coerces a hand-written observed rule that claims to block', () => {
    const smuggled: ConstraintDef = {
      id: `${OBSERVED_ID_PREFIX}dx:bound:whatever`,
      orgId: 'org-a',
      kind: 'implies',
      if: { combinator: 'AND', clauses: [] },
      because: 'anything',
      severity: 'block',
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    }
    expect(sanitiseObserved(smuggled).severity).toBe('warn')
  })

  it('coerces one that claims nothing at all, because absent MEANS block', () => {
    const silent: ConstraintDef = {
      id: 'plain',
      orgId: 'org-a',
      kind: 'implies',
      if: { combinator: 'AND', clauses: [] },
      because: 'anything',
      source: OBSERVED_SOURCE,
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    }
    expect(silent.severity).toBeUndefined()
    expect(sanitiseObserved(silent).severity).toBe('warn')
  })

  it('leaves a rule a PERSON wrote exactly as they wrote it', () => {
    const authored: ConstraintDef = {
      id: 'authored-1',
      orgId: 'org-a',
      kind: 'implies',
      if: { combinator: 'AND', clauses: [] },
      because: 'the hull is not rated for that much power',
      source: 'You, just now',
      enabled: true,
      createdAt: NOW,
      updatedAt: NOW,
    }
    /* absent severity survives — every rule written before the field
       existed has to keep meaning 'block' */
    expect(sanitiseObserved(authored)).toBe(authored)
    expect(sanitiseObserved(authored).severity).toBeUndefined()
    expect(sanitiseObserved({ ...authored, severity: 'block' }).severity).toBe('block')
  })

  it('sanitises a whole list', () => {
    const list: ConstraintDef[] = [
      { ...(adoptObserved(bound(), resolve, NOW).adopted as ConstraintDef), severity: 'block' },
    ]
    expect(sanitiseAllObserved(list)[0].severity).toBe('warn')
  })

  it('is not fooled by junk', () => {
    expect(isObservedConstraint(undefined)).toBe(false)
    expect(isObservedConstraint({} as ConstraintDef)).toBe(false)
  })
})

/* ============================================================
   THE SEAMS — the registry, and the storage behind it — MOVED, NOT
   DROPPED, at the integration stage.

   Three cases lived here: the coercion on the way OUT OF STORAGE, on
   `registerConstraints`, and on `putConstraint` so rewording is not a
   way in. Each drove `constraintDefs` as the old app had it — a
   module-level registry with a mirror in the browser's key-value
   store, reached in a test by stubbing a window.

   `src/domain/rules/constraints/constraintDefs.ts` is not that any
   more, and cannot be: `src/domain` is pure, so the registry reads a
   `CatalogueCtx` and writes through callbacks, and the storage seam
   is `src/data/repository.ts`. So the three cases moved to the file
   whose subject they now are —
   `src/domain/rules/constraints/deleteRule.test.ts`, under the same
   `describe('the registry seams')` name, with the same assertions
   word for word, plus a fourth that pins what they never covered: an
   authored rule keeps its absent severity.

   Nothing is lost and nothing is duplicated. What stays here is what
   this file is the subject of: `adopt.ts` itself, and the coercion
   functions every seam calls.
   ============================================================ */
