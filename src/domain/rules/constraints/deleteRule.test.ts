/* ============================================================
   A RULE CAN BE DELETED — the owner's decision, 2026-09-11.

   It could not, by design, until then. CONFIGURATOR_SPEC §4b said
   "rules toggle off, they are never deleted — the experiment is
   reversible and the authoring survives", `constraintDefs.ts`
   implemented exactly that in a comment reading "Never a delete", and
   CLUELESS_USER_TESTS Finding 15 disagreed. The cost of the spec as
   written was real: a bad rule could only ever be switched off, so
   dead rules accumulated for the life of the sheet, and
   `clearConstraints` — the only removal there was — took the good
   ones with them.

   WHAT IS ASSERTED IS THE DECISIONS THE ACT IS MADE OF:

     · the rule goes, and the ones beside it do not
     · THE SWITCH IS UNTOUCHED. Deleting is the other act, not a
       replacement for pausing one, and the whole "ask why → switch
       it off → watch the option come back" loop still works
     · IT IS UNDOABLE. The delete hands the definition BACK and the
       restore puts it there — dates and all, because undoing a
       delete did not edit the rule
     · one business's delete is not another's
     · a second press finds nothing, and says so by handing back
       nothing rather than by throwing

   HOW IT IS DRIVEN NOW. In the old app the registry was a module-level
   map that read the LIVE store to know whose rules to hand back, so
   the only honest way to test it was through the store and a mocked
   repository. HL_2.0's registry is pure: the rules come in on a
   `CatalogueCtx` and a write is a callback. `registry()` below is that
   pair — one list, one context over it, one put and one remove — which
   is the whole of what the store used to supply. The last block, two
   businesses, was two organisation slugs computed outside the record;
   it is two contexts now, because `ConstraintDef.orgId` says whose a
   rule is itself.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { makeCtx, type CatalogueCtx, type ConstraintDef } from '@/domain/model'
import {
  clearConstraints,
  createConstraint,
  deleteConstraint,
  getConstraint,
  getConstraints,
  loadConstraints,
  putConstraint,
  registerConstraints,
  restoreConstraint,
  setConstraintEnabled,
  type PutConstraint,
  type RemoveConstraint,
} from './constraintDefs'
import { OBSERVED_ID_PREFIX, OBSERVED_SOURCE } from '@/domain/rules/adopt'

const EMPTY = { combinator: 'AND' as const, clauses: [] }

/** The list, the snapshot over it and the two writes — what the store
 *  used to be. The clock ADVANCES a second per read, so an assertion
 *  about a date that must not move has something to catch. */
function registry(orgId = 'northside') {
  let list: ConstraintDef[] = []
  let tick = 0
  const now = (): string => new Date(Date.UTC(2026, 8, 17, 0, 0, (tick += 1))).toISOString()
  const ctx = (): CatalogueCtx => makeCtx({ orgId, constraintDefs: list, now })
  const put: PutConstraint = (c) => {
    list = [...list.filter((x) => x.id !== c.id), c]
  }
  const remove: RemoveConstraint = (id) => {
    list = list.filter((x) => x.id !== id)
  }
  return {
    ctx,
    put,
    remove,
    /** A rule written the way the pane writes one. */
    write: (because: string): ConstraintDef => createConstraint({ if: EMPTY, because }, ctx(), put),
  }
}

/* ---------------------------------------------------------- */

describe('taking one rule out', () => {
  it('TAKES THAT ONE, and leaves the ones beside it', () => {
    const reg = registry()
    const a = reg.write('the hull is not rated for that much power')
    const b = reg.write('that trailer cannot carry that hull')
    expect(getConstraints(reg.ctx())).toHaveLength(2)

    deleteConstraint(a.id, reg.ctx(), reg.remove)

    expect(getConstraint(reg.ctx(), a.id)).toBeUndefined()
    expect(getConstraint(reg.ctx(), b.id)?.because).toBe('that trailer cannot carry that hull')
    expect(getConstraints(reg.ctx())).toHaveLength(1)
  })

  it('hands the rule back, which is what makes the toast possible', () => {
    /* Returning the definition is the whole mechanism: the caller can
       put it back without anything here knowing about toasts. */
    const reg = registry()
    const rule = reg.write('the hull is not rated for that much power')
    const gone = deleteConstraint(rule.id, reg.ctx(), reg.remove)
    expect(gone?.id).toBe(rule.id)
    expect(gone?.because).toBe('the hull is not rated for that much power')
  })

  it('hands back nothing on a second press, rather than throwing', () => {
    const reg = registry()
    const rule = reg.write('the hull is not rated for that much power')
    expect(deleteConstraint(rule.id, reg.ctx(), reg.remove)).toBeDefined()
    expect(deleteConstraint(rule.id, reg.ctx(), reg.remove)).toBeUndefined()
  })

  it('hands back nothing for a rule that was never written', () => {
    const reg = registry()
    expect(deleteConstraint('c-nobody', reg.ctx(), reg.remove)).toBeUndefined()
  })
})

describe('the way back', () => {
  it('PUTS IT BACK AS IT WAS, dates and all — an undo is not an edit', () => {
    const reg = registry()
    const rule = reg.write('the hull is not rated for that much power')
    const gone = deleteConstraint(rule.id, reg.ctx(), reg.remove)
    expect(gone).toBeDefined()
    if (!gone) return

    restoreConstraint(gone, reg.put)

    const back = getConstraint(reg.ctx(), rule.id)
    expect(back).toEqual(gone)
    /* the dates in particular: `putConstraint` would have re-stamped
       `updatedAt`, which is right for a rewording and wrong here */
    expect(back?.createdAt).toBe(rule.createdAt)
    expect(back?.updatedAt).toBe(rule.updatedAt)
  })

  it('brings back a rule that was switched off, still switched off', () => {
    /* Its state is part of the authoring: a rule paused when it was
       deleted must not come back live and start biting. */
    const reg = registry()
    const rule = reg.write('the hull is not rated for that much power')
    setConstraintEnabled(rule.id, false, reg.ctx(), reg.put)
    const gone = deleteConstraint(rule.id, reg.ctx(), reg.remove)
    expect(gone?.enabled).toBe(false)
    if (!gone) return

    restoreConstraint(gone, reg.put)
    expect(getConstraint(reg.ctx(), rule.id)?.enabled).toBe(false)
  })
})

describe('the switch is not what changed', () => {
  it('STILL PAUSES A RULE RATHER THAN REMOVING IT', () => {
    /* The everyday control, and the one the "ask why → switch it off
       → watch the option come back" loop depends on. */
    const reg = registry()
    const rule = reg.write('the hull is not rated for that much power')
    setConstraintEnabled(rule.id, false, reg.ctx(), reg.put)

    expect(getConstraint(reg.ctx(), rule.id)).toBeDefined()
    expect(getConstraint(reg.ctx(), rule.id)?.enabled).toBe(false)
    expect(getConstraints(reg.ctx())).toHaveLength(1)
  })

  it('and switching one off does not delete it however many times it is pressed', () => {
    const reg = registry()
    const rule = reg.write('the hull is not rated for that much power')
    setConstraintEnabled(rule.id, false, reg.ctx(), reg.put)
    setConstraintEnabled(rule.id, true, reg.ctx(), reg.put)
    setConstraintEnabled(rule.id, false, reg.ctx(), reg.put)
    expect(getConstraints(reg.ctx())).toHaveLength(1)
  })
})

describe('whose rule it was', () => {
  it('DELETES IT FOR ONE BUSINESS AND NOT THE OTHER', () => {
    /* A delete that reached across would be the orphaning bug pointing
       the other way — destructive instead of merely quiet.

       THE KEY IS ON THE RECORD NOW. The old test made a second
       business by minting a second slug on the project's meta, and
       carried a long note about renaming a sheet not making a new
       tenant; `ConstraintDef.orgId` retires all of that, so the second
       business is simply a second context that never sees the first
       one's rules. */
    const mine = registry('northside')
    const theirs = registry('brisbane-boats')

    const ours = mine.write('the hull is not rated for that much power')
    const yours = theirs.write('that trailer cannot carry that hull')
    expect(ours.orgId).toBe('northside')
    expect(yours.orgId).toBe('brisbane-boats')

    deleteConstraint(yours.id, theirs.ctx(), theirs.remove)
    expect(getConstraints(theirs.ctx())).toHaveLength(0)

    expect(getConstraint(mine.ctx(), ours.id)?.because).toBe(
      'the hull is not rated for that much power',
    )
  })

  it('clears one business and hands back what it cleared', () => {
    const reg = registry()
    reg.write('the hull is not rated for that much power')
    reg.write('that trailer cannot carry that hull')
    expect(clearConstraints(reg.ctx(), reg.remove)).toHaveLength(2)
    expect(getConstraints(reg.ctx())).toHaveLength(0)
  })
})

/* ============================================================
   THE OBSERVED COERCION, AT EVERY SEAM A RULE CAN ENTER BY.

   Nothing carrying observed provenance may ever hold severity
   'block' — the rule, and the reason, are `src/domain/rules/adopt.ts`.
   The guarantee is only as good as the number of doors it is applied
   at, so each door gets a case.

   The storage door used to be `localStorage` and is now the
   repository read, which is why `loadConstraints` exists and takes
   parsed rows rather than a key: a record a person edited by hand is
   still the seam that matters most.
   ============================================================ */

const observed = (severity: 'block' | 'warn' | undefined): ConstraintDef =>
  ({
    id: `${OBSERVED_ID_PREFIX}dx:bound:hand-edited`,
    orgId: 'northside',
    kind: 'implies',
    if: EMPTY,
    because: 'somebody edited this file',
    ...(severity ? { severity } : {}),
    enabled: true,
    createdAt: '2026-09-17T00:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  }) as ConstraintDef

describe('the registry seams', () => {
  it('coerces on the way OUT OF STORAGE — the seam a person can edit by hand', () => {
    const loaded = loadConstraints([observed('block'), observed(undefined), null, { id: '' }])
    expect(loaded.length).toBeGreaterThan(0)
    for (const c of loaded) expect(c.severity).toBe('warn')
  })

  it('coerces on registerConstraints', () => {
    const reg = registry()
    registerConstraints([observed('block')], reg.put)
    expect(getConstraint(reg.ctx(), observed('block').id)?.severity).toBe('warn')
  })

  it('coerces on putConstraint, so rewording is not a way in', () => {
    const reg = registry()
    const adopted = { ...observed('warn'), source: OBSERVED_SOURCE }
    registerConstraints([adopted], reg.put)
    putConstraint({ ...adopted, severity: 'block', because: 'reworded' }, reg.ctx(), reg.put)
    const back = getConstraint(reg.ctx(), adopted.id)
    expect(back?.because).toBe('reworded')
    expect(back?.severity).toBe('warn')
  })

  it('leaves a rule with no observed provenance exactly as it came in', () => {
    /* Absent means 'block', and every rule written before `severity`
       existed must keep its meaning. */
    const reg = registry()
    const authored = reg.write('the hull is not rated for that much power')
    expect(getConstraint(reg.ctx(), authored.id)?.severity).toBeUndefined()
  })
})
