/* ============================================================
   NORTHSIDE OVERRULES ONE OF THE PRICE LIST'S CLAUSES, on the real
   price list (verify 2, data round, missing item 3: "no act overrules
   a clause with a because"). 2.3, the shaft for the transom, is broken
   by 3 offers the sheet measures (`houseMeasures.test.ts`); Review
   raises each as a case. Overruled, those 3 are left alone in Review
   as meant, the because is kept with Northside's file and read back
   the way the store reads it, and holding to it again brings exactly
   those 3 back — never a case Review left alone on another day.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { apply, isDone } from '@/domain/catalogue/commands'
import { indexRows, type CatalogueData } from '@/domain/catalogue/sheet'
import type { EntityDef, RowData } from '@/domain/model'
import { houseBreaks } from '@/domain/rules/review/houseBreaks'
import { readOrg } from '@/domain/northside/read'
import {
  BECAUSE_MAX,
  holdAgainCommand,
  overruleCommand,
  overruleKey,
  overruleMissing,
  overruleOf,
} from './overrule'

const pack = await loadPack()
const entities: Record<string, EntityDef> = {}
for (const e of pack.entities) entities[e.id] = e
const world = { entities, rowsByEntity: pack.rowsByEntity }

const sheet = (): CatalogueData => {
  const rows = world.rowsByEntity as Record<string, RowData[]>
  return {
    orgId: 'northside',
    version: null,
    business: 'Northside Marine',
    tables: entities,
    rows,
    rowIndex: indexRows(rows),
    modules: {},
    priceLevels: {},
    constraintDefs: [],
  } as unknown as CatalogueData
}

const AT = '2026-11-04T05:00:00.000Z'
const BECAUSE = 'the three typos are fixed with the supplier, not on our list'
const keysOf = (meant = {}) =>
  houseBreaks(world, meant)
    .clauses.find((c) => c.ref === 'F6')
    ?.breaks.map((b) => b.key) ?? []

describe('overruling 2.3, the shaft for the transom', () => {
  it('leaves its 3 breaks alone in Review, keeps the because, and reads back as overruled', () => {
    const keys = keysOf()
    expect(keys).toHaveLength(3)
    const done = apply(
      sheet(),
      overruleCommand({
        ref: 'F6',
        breakKeys: keys,
        because: BECAUSE,
        at: AT,
        who: 'Asaf',
        said: 's',
      }),
      AT,
    )
    expect(isDone(done)).toBe(true)
    if (!isDone(done)) return
    const left = done.next.org?.leftAlone
    expect(left?.[overruleKey('F6')]).toBe(`overruled ${AT} Asaf | ${BECAUSE}`)
    for (const k of keys) expect(left?.[k]).toBe(`meant ${AT} Asaf`)
    /* Review raises none of them now: F6 has no case */
    expect(keysOf(left)).toEqual([])
    expect(overruleOf('F6', left, keys)).toEqual({
      at: AT,
      who: 'Asaf',
      because: BECAUSE,
      left: 3,
      outside: 0,
    })
    /* read back the way the store reads Northside's profile off this computer */
    expect(readOrg(JSON.parse(JSON.stringify(done.next.org)))?.leftAlone).toEqual(left)
    /* and its Undo puts the profile back as it was */
    const undone = apply(done.next, done.inverse, AT)
    expect(isDone(undone) && undone.next.org?.leftAlone).toBeUndefined()
  })

  it('holding to it again brings back its 3, and only its 3', () => {
    const keys = keysOf()
    const base = sheet()
    const before = {
      ...base,
      org: {
        name: 'Northside Marine',
        industry: 'marine',
        createdAt: '',
        leftAlone: { 'other:case': 'meant 2026-11-01T00:00:00.000Z Sam' },
      },
    } as CatalogueData
    const done = apply(
      before,
      overruleCommand({
        ref: 'F6',
        breakKeys: keys,
        because: BECAUSE,
        at: AT,
        who: 'Asaf',
        said: 's',
      }),
      AT,
    )
    if (!isDone(done)) throw new Error('refused')
    const back = apply(done.next, holdAgainCommand('F6', 'h'), AT)
    if (!isDone(back)) throw new Error('refused')
    expect(back.next.org?.leftAlone).toEqual({ 'other:case': 'meant 2026-11-01T00:00:00.000Z Sam' })
    expect(keysOf(back.next.org?.leftAlone)).toEqual(keys)
    expect(overruleOf('F6', back.next.org?.leftAlone, keys)).toBeNull()
  })

  it('refuses with a sentence where the because is not said, or is too long', () => {
    expect(overruleMissing('  ')).toMatch(/^Say why Northside does not hold to it first/)
    expect(overruleMissing('x'.repeat(BECAUSE_MAX + 1))).toBe(
      `Say it in ${BECAUSE_MAX} characters or fewer: this one is ${BECAUSE_MAX + 1}.`,
    )
    const refused = apply(
      sheet(),
      overruleCommand({ ref: 'F6', breakKeys: keysOf(), because: '', at: AT, who: '', said: 's' }),
      AT,
    )
    expect(isDone(refused)).toBe(false)
  })

  it('says a break it does not cover — one a newer price list brought — as standing outside it', () => {
    const keys = keysOf()
    const left = {
      [overruleKey('F6')]: `overruled ${AT} | ${BECAUSE}`,
      [keys[0]!]: `meant ${AT}`,
      [keys[1]!]: `meant ${AT}`,
    }
    expect(overruleOf('F6', left, keys)).toMatchObject({ who: '', left: 2, outside: 1 })
  })
})
