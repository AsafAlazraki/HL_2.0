/* ============================================================
   THE PRICE LIST'S OWN CLAUSES, MEASURED ON THE REAL PACK.

   The figures below were measured by `houseMeasures.ts` on the pack
   on 2026-11-03 and read against the adjudication's own: the same 3
   shaft breaks the workbook names as typos (3 of 3,905 there, 3 of
   3,292 offers here, factory packages aside), the same 72 standard
   motors under the boat's lowest rating (72 of 757 there, of 778
   here), F7's 3,144 remote offers counted independently in
   `pairRules.test.ts`. A figure here that moves is a finding about
   the reading or the sheet, never a reason to edit the number.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { pairReach, sideFor } from './pairRules'
import { specByKey, specValue } from './pairSpecs'
import {
  BUILD_DOES,
  groupExceptions,
  measureClause,
  measuredLive,
  type HouseMeasure,
} from './houseMeasures'
import { PAIRING_RULES } from './ruleLedger'

const world = (await loadPack()).ctx
const m = (ref: Parameters<typeof measureClause>[0]): HouseMeasure => {
  const out = measureClause(ref, world)
  if (!out) throw new Error(`${ref} is not measured`)
  return out
}

describe('each clause, counted on the sheet loaded here', () => {
  it('holds the figures measured on the pack, numerator and denominator', () => {
    const figures = Object.fromEntries(
      (['F8', 'F9', 'A1', 'A2', 'F6', 'F7', 'F15', 'F16', 'F12'] as const).map((ref) => [
        ref,
        `${m(ref).held} of ${m(ref).tested}`,
      ]),
    )
    expect(figures).toEqual({
      F8: '626 of 626',
      F9: '351 of 351',
      A1: '1448 of 1448',
      A2: '706 of 778',
      F6: '3289 of 3292',
      F7: '3144 of 3144',
      F15: '501 of 501',
      F16: '1533 of 1541',
      F12: '278 of 278',
    })
  })

  it('every exception is one the figure counts: held and the exceptions make the tested', () => {
    for (const ref of ['F8', 'F9', 'A1', 'A2', 'F6', 'F7', 'F15', 'F16', 'F12'] as const) {
      const x = m(ref)
      expect(x.held + x.exceptions.length).toBe(x.tested)
    }
  })

  it('names the three shaft breaks by boat, motor and why, each on its line', () => {
    expect(m('F6').exceptions.map((e) => `${e.boat} · ${e.what} · ${e.why}`)).toEqual([
      'Stacer 589 Ocean Ranger Cen Cab · Yamaha F115XB2 · White · an extra-long (25″) shaft on a long (20″) transom',
      'Stacer 589 Sea Ranger SDF · Yamaha F115LB · a long (20″) shaft on an extra-long (25″) transom',
      'Stacer 609 Ocean Ranger Cen Cab · Yamaha F115XB2 · White · an extra-long (25″) shaft on a long (20″) transom',
    ])
    for (const e of m('F6').exceptions) {
      const line = (world.rowsByEntity[e.list] ?? []).find((r) => r.id === e.line)
      expect(line, `${e.list} ${e.line}`).toBeTruthy()
    }
  })

  it('names the two lines that write the shaft and the transom in conflict, each a real row', () => {
    for (const e of m('F6').exceptions) {
      expect(e.sides.map((x) => `${x.noun} ${x.what}`)).toEqual(['boat transom', 'motor shaft'])
      const [boat, motor] = e.sides.map((x) => {
        const table = world.entities[x.list]!
        const row = (world.rowsByEntity[x.list] ?? []).find((r) => r.id === x.line)
        expect(row, `${x.list} ${x.line}`).toBeTruthy()
        return { table, row: row! }
      })
      expect(boat!.table.kind).toBe('boat')
      expect(motor!.table.kind).toBe('motor')
      /* the two lines really do write two different lengths: the break is on them */
      const transom = specValue(specByKey('boat::shaft')!, boat!.table, boat!.row)
      const shaft = specValue(specByKey('motor::shaft')!, motor!.table, motor!.row)
      expect(transom).not.toBeNull()
      expect(shaft).not.toBeNull()
      expect(transom).not.toBe(shaft)
    }
  })

  it('every break on every measured clause names at least one line that writes what breaks', () => {
    for (const entry of PAIRING_RULES) {
      const out = measureClause(entry.ref, world)
      for (const e of out?.exceptions ?? []) expect(e.sides.length, entry.ref).toBeGreaterThan(0)
    }
  })

  it('F7 counts what the pair reading counts: every remote offer, none taken', () => {
    const remote = {
      boat: sideFor(specByKey('boat::steering'), 'eq', 'Remote'),
      partnerKind: 'motor' as const,
      partner: sideFor(specByKey('motor::controls'), 'neq', 'Tiller handle'),
    }
    const reach = pairReach(remote, world)
    expect(m('F7').tested).toBe(reach.made)
    expect(m('F7').exceptions).toHaveLength(reach.taken)
  })

  it('a clause never refused is drawn by what sits under it', () => {
    expect(m('F9').under).toBe(true)
    expect(m('A2').under).toBe(true)
    expect(m('A2').exceptions[0]!.why).toMatch(/^\d+(\.\d+)? hp on a boat rated from \d+ hp$/)
  })

  it('says the clause this sheet cannot test, rather than measuring it', () => {
    expect(measureClause('A3', world)).toBeNull()
    expect(measuredLive('A3')).toBe(false)
  })

  it('says what the build does with every pairing clause the page draws', () => {
    for (const entry of PAIRING_RULES) expect(BUILD_DOES[entry.ref], entry.ref).toBeTruthy()
  })
})

describe('the exceptions, as a reader takes them', () => {
  it('says one break once, with every line that writes it', () => {
    const groups = groupExceptions(m('F16').exceptions)
    expect(groups.reduce((n, g) => n + g.lines.length, 0)).toBe(8)
    expect(groups.length).toBeLessThan(8)
  })
})
