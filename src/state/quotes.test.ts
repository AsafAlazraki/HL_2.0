/* ============================================================
   THE UNDO ON A PICK, PRESSED.

   `DECISIONS.md` §1 settled that a pick with no surviving
   alternative gets a toast with UNDO, and that the toast is raised
   after Accept as well. The dangerous half of that decision is not
   the sentence — it is the button. **A toast with an UNDO that does
   not undo is worse than no toast**, because it is a promise made at
   the one moment a person has stopped watching the total.

   So this suite does not assert that a note was raised. It PRESSES
   THE BUTTON and reads the document afterwards.

   WHY THAT NEEDED SAYING TWICE. `sayUndoable` — the helper every
   other feature in the old app used for rule 9 — pinned a
   `HistoryEntry` off `useProjectStore().past`, and a quote is not in
   that stack. Wired there it would have offered to undo a pick and
   undone the last unrelated project step instead, or drawn no button
   at all. The cases below are what standing on the act's own inverse
   buys instead.

   HOW A TOAST IS HEARD WITHOUT A SCREEN. `onApplied` is what the
   shell subscribes with, and it is all a test needs. No React, no
   DOM, node project — and no sonner anywhere near this file.

   WHAT THE PORT CHANGED IN THE ASSERTIONS: NOTHING. Two things moved
   around them. The note is `onApplied` rather than a `say` bus, and
   an act refused on an issued quote now RETURNS its sentence to the
   caller instead of only falling silent — so "says nothing at all
   when the quote has been issued" is still exactly true of what a
   listener hears, and the caller additionally gets the reason to
   print where the press happened.
   ============================================================ */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { FrozenLevel, QuoteDef, QuoteEvent, QuoteLine } from '@/domain/model'
import {
  addLine,
  isDone,
  removeLine,
  setLevel,
  setLineLevel,
  ISSUED_REFUSAL,
  type Outcome,
} from '@/domain/quote/commands'
import { money } from '@/domain/quote/pricing'
import { repositories } from '@/data'
import { createQuotesStore, GONE, type Applied, type QuotesStore } from './quotes'

/* ---------------------------------------------------------- */
/* Listening                                                   */
/* ---------------------------------------------------------- */

let store: QuotesStore
let heard: Applied[] = []
let stop: (() => void) | undefined

beforeEach(() => {
  /* a fresh store per case, with a fixed clock: vitest gives one
     process's module state to every case in a file, and a document
     seeded in one case is in for the rest of it otherwise */
  store = createQuotesStore({ now: () => '2026-09-09T00:00:00.000Z', writeBehindMs: 0 })
  heard = []
  stop = store.getState().onApplied((a) => heard.push(a))
})

afterEach(() => {
  stop?.()
})

/** The last step that CAN be gone back on — the offer a person would
 *  actually be able to press. */
const offer = (): Applied => {
  const undoable = heard.filter((n) => n.undoable)
  expect(undoable.length).toBeGreaterThan(0)
  return undoable[undoable.length - 1]
}

const said = (): string[] => heard.map((n) => n.said)
const quote = (): QuoteDef | undefined => store.getState().get('q1')
const press = (note: Applied) => store.getState().undo(note.quoteId, note.event.id)
const refusalOf = (outcome: Outcome): string => (isDone(outcome) ? '' : outcome.refused)

/* ---------------------------------------------------------- */
/* A quote                                                     */
/* ---------------------------------------------------------- */

const rung = (
  key: string,
  label: string,
  value: number | null,
  scope: 'quote' | 'line' = 'quote',
): FrozenLevel => ({ key, label, fieldId: `fld_${key}`, value, scope })

function ln(id: string, label: string, levels: FrozenLevel[], at: string): QuoteLine {
  const on = levels.find((l) => l.key === at)
  return {
    id,
    entityId: 'tbl_x',
    rowId: `row_${id}`,
    label,
    qty: 1,
    unitPrice: on ? on.value : null,
    priceFieldId: on ? on.fieldId : null,
    priceColumnName: on ? on.label : null,
    levelKey: at,
    levelResolved: on ? on.key : at,
    levels,
  }
}

const hull = (): QuoteLine =>
  ln(
    'l-hull',
    'Highfield SP 560',
    [rung('cash', 'Cash', 62_000), rung('trade', 'Trade', 58_000)],
    'cash',
  )

/** A motor whose table carries no trade column — the line a level
 *  change cannot reach, and the one an undo must put back on the
 *  column it really used. */
const motor = (): QuoteLine =>
  ln('l-motor', 'Yamaha F150XC', [rung('cash', 'Cash', 29_000)], 'cash')

const minted = (at: string): QuoteEvent => ({
  id: 'ev-minted',
  kind: 'minted',
  at,
  said: 'Highfield SP 560 — quote 20260909-01',
  changed: [],
})

function seed(state: QuoteDef['state'] = 'draft'): QuoteDef {
  const at = new Date(2026, 8, 9).toISOString()
  const q: QuoteDef = {
    id: 'q1',
    orgId: 'northside',
    reference: '20260909-01',
    state,
    viewId: 'view_1',
    rootTableId: 'tbl_boats',
    rootRowId: 'row_1',
    subjectLabel: 'Highfield SP 560',
    subjectSpecs: [],
    sections: [
      { blockId: '__subject', tableId: 'tbl_boats', title: 'Boats', lineIds: ['l-hull'] },
      { blockId: 'blk_motor', tableId: 'tbl_motors', title: 'Motors', lineIds: [] },
    ],
    chapters: [
      { id: '__subject', title: 'Boats', tableId: 'tbl_boats' },
      { id: 'blk_motor', title: 'Motors', tableId: 'tbl_motors' },
    ],
    lines: [hull()],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: '' },
    createdAt: at,
    updatedAt: at,
  }
  store.getState().file(q, minted(at))
  heard = []
  return q
}

/* ---------------------------------------------------------- */
/* PUTTING ONE ON — the defect DECISIONS.md §1 named             */
/* ---------------------------------------------------------- */

describe('addLine says what it did and offers the way back', () => {
  it('names the item and the amount, as the playbook asks', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    expect(said()).toEqual([`Yamaha F150XC put on the quote · ${money(29_000)}`])
  })

  it('says the line has no price rather than printing a zero', () => {
    seed()
    store
      .getState()
      .apply('q1', addLine('blk_motor', ln('l-free', 'Delivery to Cairns', [], 'cash')))
    expect(said()[0]).toBe('Delivery to Cairns put on the quote · no price on it')
  })

  /* THE WHOLE POINT. The button is pressed, and the document is
     read afterwards — the line off the quote AND off its section,
     which are two writes and were two chances to leave a dangling
     id behind. */
  it('takes the line back off when UNDO is pressed', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    expect(quote()?.lines.map((l) => l.id)).toEqual(['l-hull', 'l-motor'])

    press(offer())

    const back = quote()
    expect(back?.lines.map((l) => l.id)).toEqual(['l-hull'])
    expect(back?.sections[1].lineIds).toEqual([])
    expect(said()).toContain('Yamaha F150XC is off the quote again')
  })

  /* THE UNDO IS THE RAW WRITE AND NOT `removeLine`, which would
     raise its own toast offering to undo the undo. One press, one
     confirmation, and no second button. */
  it('does not chain a second offer off the undo', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    press(offer())
    expect(heard.filter((n) => n.undoable)).toHaveLength(1)
    expect(said()).not.toContain('Yamaha F150XC taken off the quote')
  })

  it('is harmless when the line has already been taken off by hand', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    const note = offer()
    store.getState().apply('q1', removeLine('l-motor'))
    heard = []

    press(note)
    expect(quote()?.lines.map((l) => l.id)).toEqual(['l-hull'])
    expect(said()).toEqual([])
  })

  /* A NOTE REPORTS A WRITE THAT HAPPENED. `apply` refuses an issued
     quote, so a toast here would announce a line that is not on the
     document — the exact failure the old file's header records
     production shipping ("refuses the edit, toasts Saved"). */
  it('says nothing at all when the quote has been issued', () => {
    seed('issued')
    const outcome = store.getState().apply('q1', addLine('blk_motor', motor()))
    expect(said()).toEqual([])
    expect(quote()?.lines).toHaveLength(1)
    /* and the caller is handed the reason, to print where the press
       happened rather than leaving a control that does nothing */
    expect(refusalOf(outcome)).toBe(ISSUED_REFUSAL)
  })
})

/* ---------------------------------------------------------- */
/* TAKING ONE OFF — unchanged, except that it names the amount */
/* ---------------------------------------------------------- */

describe('removeLine still puts the line back, by value', () => {
  it('names the amount now, the same shape as putting one on', () => {
    seed()
    store.getState().apply('q1', removeLine('l-hull'))
    expect(said()[0]).toBe(`Highfield SP 560 taken off the quote · ${money(62_000)}`)
  })

  it('restores the frozen line to the position it held', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    heard = []
    store.getState().apply('q1', removeLine('l-hull'))
    press(offer())

    const back = quote()
    expect(back?.lines.map((l) => l.id)).toEqual(['l-hull', 'l-motor'])
    expect(back?.sections[0].lineIds).toEqual(['l-hull'])
    expect(back?.lines[0].unitPrice).toBe(62_000)
  })
})

/* ---------------------------------------------------------- */
/* ACCEPT — DECISIONS.md §1's third clause                     */
/* ---------------------------------------------------------- */

describe('setLevel raises the toast the sheet’s Accept needs', () => {
  it('names the rung in the business’s own word, not the key', () => {
    seed()
    store.getState().apply('q1', setLevel('trade'))
    expect(said()).toEqual(['Priced at Trade'])
  })

  it('says nothing when the quote is already on that rung', () => {
    seed()
    const outcome = store.getState().apply('q1', setLevel('cash'))
    expect(said()).toEqual([])
    /* NOTHING HAPPENED, SO NOTHING IS SAID — '' is the empty refusal
       and it is a different state from a sentence */
    expect(refusalOf(outcome)).toBe('')
  })

  /* THE FIGURES GO BACK TO THE FROZEN ONES, not to a recomputed
     guess — including the motor, whose table has no trade column and
     which must land back on the column it really used. */
  it('puts every line back on the figure it carried', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    heard = []

    store.getState().apply('q1', setLevel('trade'))
    expect(quote()?.lines[0].unitPrice).toBe(58_000)
    expect(quote()?.lines[0].levelKey).toBe('trade')

    press(offer())

    const back = quote()
    expect(back?.levelKey).toBe('cash')
    expect(back?.lines[0].unitPrice).toBe(62_000)
    expect(back?.lines[0].priceColumnName).toBe('Cash')
    expect(back?.lines[0].levelKey).toBe('cash')
    expect(back?.lines[1].unitPrice).toBe(29_000)
    expect(back?.lines[1].levelResolved).toBe('cash')
    expect(said()).toContain('Priced at Cash again')
  })

  /* AN UNDO MUST NOT THROW AWAY WORK DONE AFTER THE ACT IT UNDOES.
     The motor was picked while the note stood: it stays, and it is
     priced at the rung the quote goes back to rather than left
     behind at the other one. */
  it('keeps a line added while the note was standing', () => {
    seed()
    store.getState().apply('q1', setLevel('trade'))
    const levelNote = heard.find((n) => n.undoable) as Applied
    store.getState().apply('q1', addLine('blk_motor', motor()))

    /* the level note is no longer the top of the stack, so pressing
       it is refused BY NAME rather than undoing the pick above it —
       the pinning the old toast could not do at all */
    expect(refusalOf(press(levelNote))).not.toBe('')

    /* the way back that IS offered takes the pick off, and a second
       press then takes the rung back with the motor gone */
    store.getState().undo('q1')
    store.getState().undo('q1')

    const back = quote()
    expect(back?.levelKey).toBe('cash')
    expect(back?.lines.map((l) => l.id)).toEqual(['l-hull'])
  })

  it('does nothing when the rung has moved on since', () => {
    seed()
    store.getState().apply('q1', setLevel('trade'))
    store.getState().apply('q1', setLevel('cash'))
    heard = []

    /* the newest step back is the second setLevel; the document is
       already on cash, so its inverse has nothing to do and says
       nothing */
    store.getState().undo('q1')
    store.getState().undo('q1')
    expect(quote()?.levelKey).toBe('cash')
  })
})

/* ---------------------------------------------------------- */
/* THE REFUSAL, SAID WHERE IT HAPPENS                          */
/* ---------------------------------------------------------- */

describe('an UNDO pressed on a quote that has since been issued', () => {
  it('says why rather than silently doing nothing', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    const note = offer()

    /* the only way to reach this: the quote goes to the customer
       with the note still up */
    const now = quote() as QuoteDef
    store.getState().file({ ...now, state: 'issued' }, minted(now.createdAt))
    heard = []

    expect(refusalOf(press(note))).toBe(ISSUED_REFUSAL)
    expect(said()).toEqual([])
    expect(quote()?.lines).toHaveLength(2)
  })

  it('says so when the quote is gone entirely', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    const note = offer()
    store.getState().discard('q1')
    heard = []

    expect(refusalOf(press(note))).toBe(GONE)
    expect(said()).toEqual([])
  })
})

/* ---------------------------------------------------------- */
/* ONE LINE, RE-PRICED — the pick that was still silent          */
/* ---------------------------------------------------------- */

describe('setLineLevel says what it did, like setLevel one level up', () => {
  /* CONFIGURATOR §C: every pick is a toast with UNDO, never a
     confirmation. `setLevel` re-prices the whole quote and has
     toasted since it was written; this re-prices ONE line and said
     nothing at all — so moving a hull from Cash to Trade changed a
     figure a customer is about to be handed, silently, with no way
     back but remembering which rung it had been on. */

  it('NAMES THE LINE AND THE RUNG, in the business’s own word', () => {
    seed()
    store.getState().apply('q1', setLineLevel('l-hull', 'trade'))
    expect(offer().said).toBe('Highfield SP 560 priced at Trade')
    expect(quote()?.lines[0].unitPrice).toBe(58_000)
  })

  it('PUTS THE LINE BACK ON THE FIGURE IT CARRIED when UNDO is pressed', () => {
    seed()
    store.getState().apply('q1', setLineLevel('l-hull', 'trade'))
    press(offer())

    const line = quote()?.lines[0]
    expect(line?.levelResolved).toBe('cash')
    expect(line?.unitPrice).toBe(62_000)
    expect(said().at(-1)).toBe('Highfield SP 560 is priced at Cash again')
  })

  it('says nothing when the line is already on that rung', () => {
    seed()
    store.getState().apply('q1', setLineLevel('l-hull', 'cash'))
    expect(said()).toEqual([])
  })

  it('does not chain a second offer off the undo', () => {
    /* The way back is an answer, not a new act to reverse — the same
       rule the three acts above keep. */
    seed()
    store.getState().apply('q1', setLineLevel('l-hull', 'trade'))
    const first = offer()
    press(first)
    expect(heard.filter((n) => n.undoable)).toHaveLength(1)
  })

  it('is harmless when the line has gone since the note was raised', () => {
    /* Putting a price back on a line that is off the quote would be
       writing to nothing. */
    seed()
    store.getState().apply('q1', setLineLevel('l-hull', 'trade'))
    const note = offer()
    store.getState().apply('q1', removeLine('l-hull'))
    press(note)
    expect(quote()?.lines).toHaveLength(0)
  })

  it('says nothing at all on a quote that has been issued', () => {
    seed('issued')
    store.getState().apply('q1', setLineLevel('l-hull', 'trade'))
    expect(said()).toEqual([])
    expect(quote()?.lines[0].unitPrice).toBe(62_000)
  })
})

/* ============================================================
   WHAT THE STORE ADDS TO WHAT THE COMMANDS ALREADY DID.
   ============================================================ */

describe('the stack is per document, bounded, and pinned', () => {
  it('goes back one step per press, and refuses when there are none left', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    store.getState().apply('q1', setLevel('trade'))
    expect(quote()?.levelKey).toBe('trade')

    store.getState().undo('q1')
    expect(quote()?.levelKey).toBe('cash')
    store.getState().undo('q1')
    expect(quote()?.lines).toHaveLength(1)

    expect(refusalOf(store.getState().undo('q1'))).not.toBe('')
  })

  it('puts an undone step back, and clears the redo on any new change', () => {
    seed()
    store.getState().apply('q1', setLevel('trade'))
    store.getState().undo('q1')
    expect(quote()?.levelKey).toBe('cash')

    store.getState().redo('q1')
    expect(quote()?.levelKey).toBe('trade')

    store.getState().undo('q1')
    store.getState().apply('q1', addLine('blk_motor', motor()))
    expect(refusalOf(store.getState().redo('q1'))).not.toBe('')
  })

  it('keeps no more than UNDO_DEPTH steps', () => {
    seed()
    for (let i = 1; i <= 60; i += 1) {
      store.getState().apply('q1', addLine('blk_motor', ln(`l-${i}`, `Thing ${i}`, [], 'cash')))
    }
    expect(quote()?.lines).toHaveLength(61)
    for (let i = 0; i < 50; i += 1) store.getState().undo('q1')
    /* fifty steps back out of sixty: ten picks survive, because that
       is what a bounded stack means */
    expect(quote()?.lines).toHaveLength(11)
    expect(refusalOf(store.getState().undo('q1'))).not.toBe('')
  })
})

describe('every step is on the document, as an event', () => {
  it('writes one event per act, in order, with the sentence it said', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    store.getState().apply('q1', setLevel('trade'))

    const events = quote()?.events ?? []
    expect(events.map((e) => e.kind)).toEqual(['line-added', 'level-set'])
    expect(events[0].said).toBe(`Yamaha F150XC put on the quote · ${money(29_000)}`)
    expect(events[0].lineId).toBe('l-motor')
    expect(events[1].changed).toEqual([{ path: 'levelKey', from: 'cash', to: 'trade' }])
  })

  it('records a step back as UNDONE, naming the event it reverses', () => {
    seed()
    store.getState().apply('q1', addLine('blk_motor', motor()))
    const put = quote()?.events.at(-1)
    store.getState().undo('q1')

    const back = quote()?.events.at(-1)
    expect(back?.kind).toBe('undone')
    expect(back?.undoes).toBe(put?.id)
    /* and the history is never trimmed: both are on the document */
    expect(quote()?.events).toHaveLength(2)
  })

  it('records a step put back again as REDONE', () => {
    seed()
    store.getState().apply('q1', setLevel('trade'))
    store.getState().undo('q1')
    store.getState().redo('q1')
    expect(quote()?.events.map((e) => e.kind)).toEqual(['level-set', 'undone', 'redone'])
  })

  it('stamps who did it when the session has a name', () => {
    const named = createQuotesStore({
      now: () => '2026-09-09T00:00:00.000Z',
      by: () => 'R. Kelleher',
      writeBehindMs: 0,
    })
    const at = new Date(2026, 8, 9).toISOString()
    const q = { ...seed(), events: [] }
    named.getState().file(q, minted(at))
    named.getState().apply('q1', setLevel('trade'))
    expect(named.getState().get('q1')?.events.at(-1)?.by).toBe('R. Kelleher')
  })
})

/* ============================================================
   THE WRITE-BEHIND — the 400 ms a person could lose, closed at 300.

   A quote lost on reload is a document a customer was promised. The
   pick reaches the store synchronously and the repository a moment
   later; the promise only holds if the pending write is forced out
   when the page goes away, which is exactly when a person leaves —
   they have just made the last pick and are done.
   ============================================================ */
describe('every change reaches the repository', () => {
  it('writes the document through, and reads it back on the next open', async () => {
    const repo = repositories('northside').quotes
    const filed = createQuotesStore({ now: () => '2026-09-09T00:00:00.000Z', writeBehindMs: 5 })
    await filed.getState().open(repo)

    const at = new Date(2026, 8, 9).toISOString()
    const q = { ...seed(), events: [] }
    filed.getState().file(q, minted(at))
    filed.getState().apply('q1', addLine('blk_motor', motor()))

    /* nothing is owed once it has been flushed, and the flush is
       what `pagehide` calls */
    await filed.getState().flush()

    const reopened = createQuotesStore({ writeBehindMs: 5 })
    await reopened.getState().open(repositories('northside').quotes)
    const back = reopened.getState().get('q1')
    expect(back?.lines.map((l) => l.id)).toEqual(['l-hull', 'l-motor'])
    expect(back?.events.map((e) => e.kind)).toEqual(['line-added'])
    expect(back?.orgId).toBe('northside')
  })

  it('holds the write behind rather than writing once per keystroke', async () => {
    const repo = repositories('northside').quotes
    const filed = createQuotesStore({ now: () => '2026-09-09T00:00:00.000Z', writeBehindMs: 50 })
    await filed.getState().open(repo)
    const at = new Date(2026, 8, 9).toISOString()
    filed.getState().file({ ...seed(), id: 'q-behind', events: [] }, minted(at))

    /* three acts in one turn owe ONE write, not three */
    filed.getState().apply('q-behind', setLevel('trade'))
    filed.getState().apply('q-behind', setLevel('cash'))
    filed.getState().apply('q-behind', setLevel('trade'))
    expect(await repo.get('q-behind')).toBeUndefined()

    await filed.getState().flush()
    expect((await repo.get('q-behind'))?.levelKey).toBe('trade')
  })

  it('takes a discarded draft out of the repository too', async () => {
    const repo = repositories('northside').quotes
    const filed = createQuotesStore({ now: () => '2026-09-09T00:00:00.000Z', writeBehindMs: 0 })
    await filed.getState().open(repo)
    const at = new Date(2026, 8, 9).toISOString()
    filed.getState().file({ ...seed(), id: 'q-gone', events: [] }, minted(at))
    await filed.getState().flush()
    expect(await repo.get('q-gone')).toBeDefined()

    filed.getState().discard('q-gone')
    await filed.getState().flush()
    expect(await repo.get('q-gone')).toBeUndefined()
  })
})

describe('a draft can be thrown away and an issued quote cannot', () => {
  it('discards a draft', () => {
    seed()
    expect(refusalOf(store.getState().discard('q1'))).toBe('')
    expect(quote()).toBeUndefined()
  })

  it('refuses to discard a quote that was given to a customer', () => {
    seed('issued')
    expect(refusalOf(store.getState().discard('q1'))).not.toBe('')
    expect(quote()).toBeDefined()
  })
})
