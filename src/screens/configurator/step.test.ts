/* ============================================================
   THE WAY BACK IS OFFERED EXACTLY WHEN IT WORKS.

   built-critique-m2-close-2.md, major 2: after `Give it to the
   customer` the build pinned "20260924-01 is issued · Undo", and the
   press could only ever be refused. Each case below walks a real
   document through the real store — minted by the engine from a row of
   `data/northside/`, as the picker mints one — and holds `wayBack`'s
   answer against what the store then does with the press. An offer
   the store refuses, or a refusal the store would have accepted, fails
   here.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { rowLabel, type QuoteDef, type RowData } from '@/domain/model'
import {
  ISSUED_REFUSAL,
  issue,
  isDone,
  mintQuote,
  newVersionOf,
  setCustomer,
  type Outcome,
} from '@/domain/quote'
import { createQuotesStore, STEP_MOVED_ON } from '@/state/quotes'
import { wayBack, type Step } from './step'

const pack = await loadPack()
const ctx = pack.ctx

const NOW = '2026-09-24T09:00:00.000Z'

/** A store holding one freshly minted Stacer 529 Assault Pro, filed the
 *  way the picker files one. */
function aDraft() {
  const table = pack.byKey('boat_stacer')
  const row = (pack.rowsByEntity[table.id] ?? []).find((r: RowData) =>
    rowLabel(table, r).includes('529 Assault Pro'),
  )
  expect(row, 'the Stacer register has no 529 Assault Pro').toBeDefined()
  const view = createViewFor(ctx, table.id)
  const minted = mintQuote(ctx, { viewId: view.id, rowId: row!.id, reference: '20260924-01' })
  expect(minted).not.toBeNull()
  const store = createQuotesStore({ now: () => NOW, writeBehindMs: 0 })
  store.getState().file(minted!.quote, minted!.event)
  return { store, id: minted!.quote.id }
}

/** The step the screen pins for an outcome, exactly as `Build` does. */
function stepOf(outcome: Outcome, wasUndo = false): Step {
  if (!isDone(outcome)) throw new Error(`refused: ${outcome.refused}`)
  return { said: outcome.said, eventId: outcome.event.id, wasUndo }
}

const refusalOf = (outcome: Outcome): string => (isDone(outcome) ? '' : outcome.refused)

describe('the way back from the last step', () => {
  it('offers Undo on a draft’s last step, and the store takes it', () => {
    const { store, id } = aDraft()
    const named = stepOf(store.getState().apply(id, setCustomer({ name: 'R. Kelleher' })))
    const doc = (): QuoteDef => store.getState().get(id)!

    expect(wayBack(named, doc())).toBe('Undo')
    const undone = store.getState().undo(id, named.eventId)
    expect(isDone(undone)).toBe(true)
    expect(doc().customer.name).toBe('')

    /* AND THE WAY BACK FROM THE WAY BACK, which is also real */
    const back = stepOf(undone, true)
    expect(wayBack(back, doc())).toBe('Put it back')
    expect(isDone(store.getState().redo(id))).toBe(true)
    expect(doc().customer.name).toBe('R. Kelleher')
  })

  it('offers nothing on a step something else has happened since, which the store would refuse', () => {
    const { store, id } = aDraft()
    const first = stepOf(store.getState().apply(id, setCustomer({ name: 'R. Kelleher' })))
    store.getState().apply(id, setCustomer({ name: 'M. Duffy' }))

    expect(wayBack(first, store.getState().get(id)!)).toBeNull()
    expect(refusalOf(store.getState().undo(id, first.eventId))).toBe(STEP_MOVED_ON)
  })

  /* THE FAULT ITSELF. `issue` hands the store NO_WAY_BACK, so the step
     it leaves has no way back that could ever succeed. */
  it('offers nothing on the step giving it to the customer leaves, which the store would refuse', () => {
    const { store, id } = aDraft()
    store.getState().apply(id, setCustomer({ name: 'R. Kelleher' }))
    const given = stepOf(store.getState().apply(id, issue()))
    const issued = store.getState().get(id)!
    expect(issued.state).toBe('issued')

    expect(wayBack(given, issued)).toBeNull()
    expect(refusalOf(store.getState().undo(id, given.eventId))).toBe(ISSUED_REFUSAL)
    expect(store.getState().get(id)!.state).toBe('issued')
  })

  it('offers nothing on an issued quote even where the step is its last, because it takes no command', () => {
    const { store, id } = aDraft()
    const named = stepOf(store.getState().apply(id, setCustomer({ name: 'R. Kelleher' })))
    /* the same diary, issued with the naming as its last entry: the
       state alone refuses, whatever the diary says */
    const issued: QuoteDef = { ...store.getState().get(id)!, state: 'issued' }
    expect(wayBack(named, issued)).toBeNull()
  })

  /* THE WAY THAT GENUINELY WORKS FROM AN ISSUED QUOTE: a new version,
     a draft of its own, where a step offers its Undo again — and the
     given quote's step is not on it at all. */
  it('offers Undo again on a new version, and never the given quote’s step', () => {
    const { store, id } = aDraft()
    store.getState().apply(id, setCustomer({ name: 'R. Kelleher' }))
    const given = stepOf(store.getState().apply(id, issue()))

    const next = newVersionOf(store.getState().get(id)!, '20260924-02', NOW)
    store.getState().file(next.quote, next.event)
    const draft = store.getState().get(next.quote.id)!
    expect(draft.state).toBe('draft')
    expect(wayBack(given, draft)).toBeNull()

    const renamed = stepOf(store.getState().apply(draft.id, setCustomer({ name: 'M. Duffy' })))
    expect(wayBack(renamed, store.getState().get(draft.id)!)).toBe('Undo')
    expect(isDone(store.getState().undo(draft.id, renamed.eventId))).toBe(true)
    expect(store.getState().get(draft.id)!.customer.name).toBe('R. Kelleher')
  })
})
