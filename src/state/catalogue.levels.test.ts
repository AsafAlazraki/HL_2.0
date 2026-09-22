/* ============================================================
   APPLYING A LEVEL, AGAINST THE REAL STORE.

   `domain/pricing/levels.test.ts` proves the arithmetic. This proves
   the three claims `apply.ts` makes about the store, because each of
   them is a promise to somebody who is not in this file:

     · ONE ACT IS ONE UNDO STEP, and undoing it puts back EVERY row
       it touched. That is the promise rule 9 rests on — a toast
       with UNDO is a lie if UNDO gives back one cell out of six.
     · IT WRITES REAL CELLS, so anything that reads rows — a quote,
       a view page, a module tile, an export — is correct without
       being told. There is no propagation step to test, and that
       is the point.
     · A REFUSAL WRITES NOTHING AND SAYS NOTHING, because the
       reason is already on screen where the act was refused.

   PORT NOTE — `features/levels/apply.test.ts`, twelve cases. What
   moved around the assertions, and not one assertion's substance:

     · the old store's `past` is `undoStack()`; an entry keeps its
       `label` and also the sentence the act `said`;
     · the old history closed a burst on the next microtask, so the
       suite turned the event loop between acts. The batch is one
       command, so nothing is awaited between an act and its step;
     · the note is `onApplied` rather than a push strip; "the note
       carries UNDO" is `undoable: true` on what was heard, and
       pressing it is `undo(event.id)`. A press refused — the wrong
       act, after the sheet moved on — now RETURNS its sentence to
       the caller, the same mechanical change `quotes.test.ts`
       records, and the words are the old note's own: "Something
       else has happened since".
   ============================================================ */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { EntityDef, FieldDef, RowData } from '@/domain/model'
import { isDone, updateCell, type Outcome } from '@/domain/catalogue/commands'
import { buildLevelModel, planReset, planSet } from '@/domain/pricing/levels'
import { applyLevelPlan } from '@/domain/pricing/apply'
import { memoryCatalogue } from '@/data/memory/repositories'
import { createCatalogueStore, type Applied, type CatalogueStore } from './catalogue'

const ISO = '2026-01-01T00:00:00.000Z'

const boats = (): EntityDef => ({
  id: 'e-boats',
  orgId: 'test',
  name: 'Highfield Inflatables',
  accent: 'blue',
  kind: 'boat',
  hierarchy: ['f-series', 'f-model', 'f-variant'],
  fields: [
    { id: 'f-series', name: 'Series', type: 'text' },
    { id: 'f-model', name: 'Model', type: 'text' },
    { id: 'f-variant', name: 'Variant', type: 'text' },
    { id: 'f-shaft', name: 'Shaft Lgth', type: 'text' },
  ],
  displayFieldId: 'f-variant',
  position: { x: 0, y: 0 },
  createdAt: ISO,
  updatedAt: ISO,
})

const row = (id: string, series: string, model: string, shaft: string | null): RowData => ({
  id,
  orgId: 'test',
  entityId: 'e-boats',
  values: { 'f-series': series, 'f-model': model, 'f-variant': id, 'f-shaft': shaft },
  createdAt: ISO,
  updatedAt: ISO,
})

/* Ocean Master holds six boats: three blank, two already XL, one L. */
const seed = (): RowData[] => [
  row('a', 'Ocean Master', 'OM 540', null),
  row('b', 'Ocean Master', 'OM 540', null),
  row('c', 'Ocean Master', 'OM 660', null),
  row('d', 'Ocean Master', 'OM 660', 'XL'),
  row('e', 'Ocean Master', 'OM 760', 'XL'),
  row('f', 'Ocean Master', 'OM 760', 'L'),
  row('g', 'Sport', 'SP 460', 'S'),
]

let store: CatalogueStore
let heard: Applied[]
let stop: () => void

const state = () => store.getState()
const rows = (): RowData[] => state().rows['e-boats'] ?? []
const shaftOf = (id: string): unknown => rows().find((r) => r.id === id)?.values['f-shaft']
const shaftField = (): FieldDef => boats().fields[3]
const refusalOf = (o: Outcome): string => (isDone(o) ? '' : o.refused)

const modelNow = () => buildLevelModel(boats(), rows())
const oceanMaster = (): string => {
  const node = modelNow().root.children.find((c) => c.value === 'Ocean Master')
  if (!node) throw new Error('no Ocean Master level')
  return node.key
}

beforeEach(async () => {
  store = createCatalogueStore({ now: () => ISO, writeBehindMs: 0 })
  heard = []
  stop = store.getState().onApplied((a) => heard.push(a))
  await store
    .getState()
    .load(
      { entities: [boats()], rowsByEntity: { 'e-boats': seed() } },
      { writeTo: memoryCatalogue('test') },
    )
})

afterEach(() => stop())

describe('setting a level writes real cells, and only the ones it counted', () => {
  it('fills the blanks and leaves the exception alone', () => {
    const plan = planSet({
      model: modelNow(),
      levelKey: oceanMaster(),
      field: shaftField(),
      value: 'XL',
    })
    expect(plan.writes).toEqual(['a', 'b', 'c'])
    expect(plan.differing).toEqual(['f'])

    const done = applyLevelPlan(plan, modelNow().noun, state().apply)
    expect(done.written).toBe(3)
    expect(done.refusal).toBeNull()

    expect(shaftOf('a')).toBe('XL')
    expect(shaftOf('b')).toBe('XL')
    expect(shaftOf('c')).toBe('XL')
    /* the exception is untouched — the whole point of the default */
    expect(shaftOf('f')).toBe('L')
    /* and the boat in another Series never entered the act */
    expect(shaftOf('g')).toBe('S')
  })

  it('overwrites the exception only when Replace is on', () => {
    const plan = planSet({
      model: modelNow(),
      levelKey: oceanMaster(),
      field: shaftField(),
      value: 'XL',
      replace: true,
    })
    applyLevelPlan(plan, modelNow().noun, state().apply)
    expect(shaftOf('f')).toBe('XL')
    expect(shaftOf('g')).toBe('S')
  })

  it('says the act in the dealer’s own words, past tense', () => {
    const plan = planSet({
      model: modelNow(),
      levelKey: oceanMaster(),
      field: shaftField(),
      value: 'XL',
    })
    const done = applyLevelPlan(plan, modelNow().noun, state().apply)
    expect(done.said).toBe('Shaft Lgth set to “XL” on 3 variants in Ocean Master')
  })
})

describe('it is ONE undo step, and the step gives back every row', () => {
  it('records one entry for six writes, not six', () => {
    const before = state().undoStack().length
    const plan = planSet({
      model: modelNow(),
      levelKey: '',
      field: shaftField(),
      value: 'XL',
      replace: true,
    })
    expect(plan.writes).toHaveLength(5) /* a b c f g — d and e already hold XL */
    applyLevelPlan(plan, modelNow().noun, state().apply)
    expect(state().undoStack().length).toBe(before + 1)
    const top = state().undoStack()[state().undoStack().length - 1]
    expect(top.label).toBe('5 cell edits · Highfield Inflatables')
    /* and the step also carries the act's own sentence, which is
       what the note said */
    expect(top.said).toBe('Shaft Lgth set to “XL” on 5 variants in Highfield Inflatables')
    const event = state().events[state().events.length - 1]
    expect(event.kind).toBe('batch')
    expect(event.events).toHaveLength(5)
    expect(event.tableName).toBe('Highfield Inflatables')
  })

  it('undo puts back all five, exactly as they were', () => {
    const plan = planSet({
      model: modelNow(),
      levelKey: '',
      field: shaftField(),
      value: 'XL',
      replace: true,
    })
    applyLevelPlan(plan, modelNow().noun, state().apply)
    expect(rows().map((r) => r.values['f-shaft'])).toEqual([
      'XL',
      'XL',
      'XL',
      'XL',
      'XL',
      'XL',
      'XL',
    ])

    state().undo()
    expect(rows().map((r) => r.values['f-shaft'])).toEqual([null, null, null, 'XL', 'XL', 'L', 'S'])
  })

  it('two separate acts are two separate steps', () => {
    const before = state().undoStack().length
    applyLevelPlan(
      planSet({ model: modelNow(), levelKey: oceanMaster(), field: shaftField(), value: 'XL' }),
      modelNow().noun,
      state().apply,
    )
    applyLevelPlan(
      planSet({
        model: modelNow(),
        levelKey: oceanMaster(),
        field: shaftField(),
        value: 'L',
        replace: true,
      }),
      modelNow().noun,
      state().apply,
    )
    expect(state().undoStack().length).toBe(before + 2)
  })
})

describe('the note carries UNDO, and UNDO undoes the whole act', () => {
  it('offers one act on the note, and pressing it restores every row', () => {
    const plan = planSet({
      model: modelNow(),
      levelKey: oceanMaster(),
      field: shaftField(),
      value: 'XL',
    })
    applyLevelPlan(plan, modelNow().noun, state().apply)

    expect(heard).toHaveLength(1)
    expect(heard[0].said).toBe('Shaft Lgth set to “XL” on 3 variants in Ocean Master')
    expect(heard[0].undoable).toBe(true)

    state().undo(heard[0].event.id)
    expect(shaftOf('a')).toBeNull()
    expect(shaftOf('b')).toBeNull()
    expect(shaftOf('c')).toBeNull()
    /* and it says what it undid, through the same strip */
    expect(heard[heard.length - 1].said).toContain('Undone')
  })

  it('refuses to undo the wrong act when something else has happened since', () => {
    applyLevelPlan(
      planSet({ model: modelNow(), levelKey: oceanMaster(), field: shaftField(), value: 'XL' }),
      modelNow().noun,
      state().apply,
    )

    /* somebody types a cell after reading the note */
    state().apply(updateCell('e-boats', 'g', 'f-shaft', 'M'))

    expect(refusalOf(state().undo(heard[0].event.id))).toContain(
      'Something else has happened since',
    )
    /* and the level's own rows are still set — nothing was reverted */
    expect(shaftOf('a')).toBe('XL')
  })
})

describe('a refusal writes nothing and says nothing', () => {
  it('does not touch a row when the plan carries a refusal', () => {
    const plan = planSet({
      model: modelNow(),
      levelKey: oceanMaster(),
      field: shaftField(),
      value: '   ',
    })
    expect(plan.refusal).not.toBeNull()
    const done = applyLevelPlan(plan, modelNow().noun, state().apply)
    expect(done.written).toBe(0)
    expect(done.refusal).toBe(plan.refusal)
    expect(heard).toHaveLength(0)
    expect(shaftOf('a')).toBeNull()
  })
})

describe('reset to inherit, end to end', () => {
  it('puts the exception back onto the level and fills the blanks', () => {
    /* Ocean Master: 2 hold XL, 1 holds L, 3 blank. XL is the answer. */
    const plan = planReset(modelNow(), oceanMaster(), shaftField())
    expect(plan.text).toBe('XL')
    applyLevelPlan(plan, modelNow().noun, state().apply)
    expect(
      rows()
        .filter((r) => r.values['f-series'] === 'Ocean Master')
        .map((r) => r.values['f-shaft']),
    ).toEqual(['XL', 'XL', 'XL', 'XL', 'XL', 'XL'])
  })

  it('resets one boat on its own without touching its neighbours', () => {
    const plan = planReset(modelNow(), oceanMaster(), shaftField(), ['f'])
    applyLevelPlan(plan, modelNow().noun, state().apply)
    expect(shaftOf('f')).toBe('XL')
    expect(shaftOf('a')).toBeNull()
  })
})

describe('the value is on the rows, which is how it reaches a quote', () => {
  it('any reader of the rows sees it, with no propagation step', () => {
    applyLevelPlan(
      planSet({
        model: modelNow(),
        levelKey: oceanMaster(),
        field: shaftField(),
        value: 'XL',
        replace: true,
      }),
      modelNow().noun,
      state().apply,
    )
    /* this is what a quote line, a view page and a CSV export all
       do: read the row out of the store by id */
    const sold = state().rows['e-boats']?.find((r) => r.id === 'f')
    expect(sold?.values['f-shaft']).toBe('XL')
    /* and the level now agrees with itself — nothing overrides */
    const after = buildLevelModel(boats(), rows())
    const node = after.root.children.find((c) => c.value === 'Ocean Master')
    expect(node).toBeDefined()
  })
})
