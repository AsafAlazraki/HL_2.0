/* ============================================================
   CLEAR SHEET, THEN BRING THE BACKUP BACK.

   THE TRAP, MEASURED. `resetProject` wipes meta including the
   organisation. Measured immediately after: entities 0, rows 0, views
   0, modules 0, rules 0, meta 0 — and the shell's gate is
   `!org && tableCount === 0`, so the next frame is onboarding. The
   ONLY import door in the app was on Home's toolbar, behind that
   gate. Somebody who cleared the sheet in order to restore a backup
   could not restore it. There was no way out of the app's own front
   door.

   WHAT THIS PINS is the data path that door walks, end to end and
   through the real functions: save a copy of a full sheet, clear it,
   confirm the shell would show onboarding, then open the saved copy
   the way `OpenSavedCopy` does — and land back on a sheet with
   everything on it, including the organisation, so the person is not
   asked to name their business a second time.

   The screen itself cannot be rendered here (this suite is `node`
   with no DOM by deliberate choice — see vitest.config.ts), so what
   is asserted is the seam: the validated envelope, `applyReplace`,
   and the gate's two conditions.

   TWO THINGS MOVED WITH THE REBUILD, AND NEITHER IS THE SUBJECT.
   The seed is the pack, read off `data/northside/`, rather than a
   demo loader writing into a store; and the sheet an apply is driven
   into is `memoryApply`, which is the store's own contract with four
   maps behind it. The trip is the same trip, through the same two
   functions, and every count below is read off the real file.

   A THIRD THING, AND IT IS A LIMIT RATHER THAN A MOVE. The sheet
   below has its nine PLACES set aside (`modules: {}`). Restoring a
   place goes through `createModule`, one of the five design-layer
   commands `src/state/catalogue.ts` does not have until Milestone 2,
   and `memoryApply` refuses those doors out loud rather than guessing
   at them. Nothing this test asserts is about a place — it counts
   tables, rows and the business name — so what is set aside is not
   what is being pinned; it is named here so the day the commands land
   somebody puts the places back and asserts them too.

   AND THE SEED STAMP IS NOT HERE. The old file's second test asserted
   that a replace forgets which build of the prepared set this browser
   was seeded with. That machinery is dropped by the plan — the pack's
   version is one string in its manifest — so there is no record for a
   replace to forget and nothing left for the test to assert. Said
   here rather than left as a silence.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { makeCtx, type CatalogueCtx, type OrgProfile, type RowData } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { buildExportPayload } from './exportPayload'
import { validateEnvelope } from './envelope'
import { applyReplace } from './apply'
import { memoryApply } from './memoryApply'

const ORG = 'northside'

const NORTHSIDE: OrgProfile = {
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: '2026-01-01T00:00:00.000Z',
  slug: ORG,
}

const PROJECT = { name: 'Test Sheet', rev: 1 }

/** the gate in the shell, quoted rather than paraphrased */
const wouldShowOnboarding = (s: CatalogueCtx): boolean =>
  !s.org && Object.keys(s.entities).length === 0

const rowsIn = (rows: Record<string, RowData[]>): number =>
  Object.values(rows).reduce((n, l) => n + l.length, 0)

describe('a saved copy survives CLEAR SHEET', () => {
  it('comes back through the same envelope the onboarding door reads', async () => {
    const pack = await loadPack()
    /* `modules: {}` — see the third paragraph of this file's header */
    const seeded = makeCtx({ ...pack.ctx, org: NORTHSIDE, modules: {} })

    const tables = Object.keys(seeded.entities).length
    const rows = rowsIn(seeded.rowsByEntity)
    expect(tables).toBeGreaterThan(0)
    expect(rows).toBeGreaterThan(0)

    /* the file the person keeps — the exact payload the Everything
       card writes */
    const saved = buildExportPayload(seeded, PROJECT, true)

    /* CLEAR SHEET */
    const cleared = memoryApply(makeCtx({ orgId: ORG }), PROJECT)
    expect(Object.keys(cleared.ctx().entities)).toHaveLength(0)
    expect(rowsIn(cleared.ctx().rowsByEntity)).toBe(0)
    expect(cleared.ctx().org).toBeUndefined()
    /* and this is the trap: the only import door in the app is now
       behind the wizard */
    expect(wouldShowOnboarding(cleared.ctx())).toBe(true)

    /* THE WAY OUT. Onboarding reads the file through the same
       validator the menu uses, and applies it the same way. */
    const res = validateEnvelope(JSON.parse(JSON.stringify(saved)), ORG)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    applyReplace(res.data, cleared.ports)

    const after = cleared.ctx()
    expect(Object.keys(after.entities)).toHaveLength(tables)
    expect(rowsIn(after.rowsByEntity)).toBe(rows)
    /* the business is named again, out of the file, so nobody is asked
       to answer onboarding twice */
    expect(after.org?.name).toBe('Northside Marine')
    expect(wouldShowOnboarding(after)).toBe(false)
  })
})
