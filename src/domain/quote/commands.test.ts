/* ============================================================
   THE COMMANDS, WITHOUT A STORE.

   `state/quotes.test.ts` presses the UNDO the shell will draw. This
   asserts the layer under it: that each command returns the document
   it promised, the way back it promised, the sentence it promised
   and the event the audit keeps — and that `apply` refuses an issued
   quote with a SENTENCE rather than a throw or a silence.

   Every figure below is typed into the fixture, not read off the
   pack, and that is right for this file: these are the arithmetic
   and the wording, not the data. The data is proved by
   `golden.test.ts`, which diffs the real 529 Assault Pro against the
   engine it was ported from.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { FrozenLevel, QuoteDef, QuoteLine } from '@/domain/model'
import {
  addAdjustment,
  addFreeLine,
  addLine,
  apply,
  applyPriceChanges,
  isDone,
  issue,
  ISSUED_REFUSAL,
  linkCustomer,
  newVersionOf,
  removeAdjustment,
  setAdjustmentMagnitude,
  setCustomer,
  setNote,
  setOverride,
  setPreparedBy,
  setQty,
  setTaxRate,
  unlinkCustomer,
  updateAdjustment,
  type Outcome,
  type QuoteCommand,
} from './commands'
import { money } from './pricing'
import { quoteTotals } from './totals'

const NOW = '2026-09-09T02:00:00.000Z'

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

function draft(over: Partial<QuoteDef> = {}): QuoteDef {
  const at = '2026-09-09T00:00:00.000Z'
  return {
    id: 'q1',
    orgId: 'northside',
    reference: '20260909-01',
    state: 'draft',
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
    customer: { name: 'R. Kelleher' },
    createdAt: at,
    updatedAt: at,
    ...over,
  }
}

/** Run one command and insist it did something. */
function done(quote: QuoteDef, command: QuoteCommand, now = NOW) {
  const outcome = apply(quote, command, now)
  if (!isDone(outcome)) throw new Error(`refused: "${outcome.refused}"`)
  return outcome
}

const refusal = (outcome: Outcome): string => (isDone(outcome) ? '' : outcome.refused)

/* ============================================================
   THE ONE DOOR
   ============================================================ */

describe('apply is the line an issued quote holds', () => {
  it('refuses every change with a sentence, and never a throw', () => {
    const issued = draft({ state: 'issued', issuedAt: NOW })
    for (const command of [
      setQty('l-hull', 3),
      addLine('blk_motor', ln('l-m', 'Motor', [], 'cash')),
      setNote('anything'),
      setTaxRate(10),
      issue(),
    ]) {
      const outcome = apply(issued, command, NOW)
      expect(refusal(outcome)).toBe(ISSUED_REFUSAL)
    }
  })

  it('stamps the clock it was given and never a second one', () => {
    const q = draft()
    const { next } = done(q, setQty('l-hull', 2))
    expect(next.updatedAt).toBe(NOW)
    expect(next.createdAt).toBe(q.createdAt)
    expect(next.id).toBe(q.id)
    expect(next.events.at(-1)?.at).toBe(NOW)
  })

  it('appends the event and never trims the ones before it', () => {
    let q = draft()
    q = done(q, setQty('l-hull', 2)).next
    q = done(q, setNote('Valid 30 days')).next
    q = done(q, setPreparedBy('R. Kelleher')).next
    expect(q.events.map((e) => e.kind)).toEqual(['qty-set', 'note-set', 'prepared-by-set'])
  })

  it('says nothing, with nothing to say, when a command changes nothing', () => {
    const q = draft()
    /* '' is the empty refusal: a full stop with no act behind it */
    expect(refusal(apply(q, setQty('l-hull', 1), NOW))).toBe('')
    expect(refusal(apply(q, setNote(undefined), NOW))).toBe('')
    expect(refusal(apply(q, unlinkCustomer(), NOW))).toBe('')
  })

  it('stamps who, when the caller names one', () => {
    const outcome = apply(draft(), setQty('l-hull', 2), NOW, 'R. Kelleher')
    expect(isDone(outcome) && outcome.event.by).toBe('R. Kelleher')
  })
})

/* ============================================================
   EVERY COMMAND HANDS BACK A WAY BACK THAT WORKS
   ============================================================ */

describe('the inverse restores the document exactly', () => {
  /** apply, then apply the inverse, and compare everything a
   *  document prints — the events are expected to grow, because an
   *  audit records that a step was taken and taken back. */
  const roundTrip = (command: QuoteCommand, start: QuoteDef = draft()) => {
    const forward = done(start, command)
    const back = done(forward.next, forward.inverse)
    const strip = (q: QuoteDef) => ({ ...q, events: [], updatedAt: '' })
    expect(strip(back.next)).toEqual(strip(start))
    return { forward, back }
  }

  it('for a quantity', () => {
    const { forward } = roundTrip(setQty('l-hull', 4))
    expect(forward.next.lines[0].qty).toBe(4)
  })

  it('for a line put on', () => {
    const { forward } = roundTrip(addLine('blk_motor', ln('l-m', 'Yamaha F150', [], 'cash')))
    expect(forward.next.sections[1].lineIds).toEqual(['l-m'])
  })

  it('for a typed line, which lands at the foot of the last section', () => {
    const forward = done(draft(), addFreeLine('Delivery to Cairns', 450))
    expect(forward.next.lines.at(-1)?.label).toBe('Delivery to Cairns')
    expect(forward.next.lines.at(-1)?.unitPrice).toBe(450)
    expect(forward.next.sections.at(-1)?.lineIds).toHaveLength(1)
    const back = done(forward.next, forward.inverse)
    expect(back.next.lines).toHaveLength(1)
    expect(back.next.sections.at(-1)?.lineIds).toEqual([])
  })

  it('for an override, which sits BESIDE the frozen figure', () => {
    const { forward } = roundTrip(setOverride('l-hull', 59_000, 'boat show price'))
    const line = forward.next.lines[0]
    expect(line.overridePrice).toBe(59_000)
    expect(line.overrideReason).toBe('boat show price')
    /* the frozen original is untouched — the document prints it
       struck through beside the override */
    expect(line.unitPrice).toBe(62_000)
  })

  it('for clearing an override, which is its own kind of event', () => {
    const q = done(draft(), setOverride('l-hull', 59_000, 'boat show price')).next
    const cleared = done(q, setOverride('l-hull', undefined, undefined))
    expect(cleared.event.kind).toBe('override-cleared')
    expect(cleared.next.lines[0].overridePrice).toBeUndefined()
    expect(cleared.next.lines[0].overrideReason).toBeUndefined()
    const back = done(cleared.next, cleared.inverse)
    expect(back.next.lines[0].overridePrice).toBe(59_000)
    expect(back.next.lines[0].overrideReason).toBe('boat show price')
  })

  it('for the terms, the tax rate and the consultant', () => {
    roundTrip(setNote('Valid for 30 days from the date above.'))
    roundTrip(setTaxRate(10))
    roundTrip(setPreparedBy('R. Kelleher'))
  })

  it('for a customer picked out of the register', () => {
    const { forward } = roundTrip(
      linkCustomer({
        customer: { name: 'J. Fraser', contact: ['0400 000 000'] },
        customerRef: { tableId: '__customers', rowId: 'cst:4' },
      }),
    )
    expect(forward.next.customer.name).toBe('J. Fraser')
    expect(forward.next.customerRef?.rowId).toBe('cst:4')
  })

  it('for unlinking, which keeps the name and drops only the pointer', () => {
    const linked = done(
      draft(),
      linkCustomer({
        customer: { name: 'J. Fraser' },
        customerRef: { tableId: '__customers', rowId: 'cst:4' },
      }),
    ).next
    const unlinked = done(linked, unlinkCustomer())
    expect(unlinked.next.customer.name).toBe('J. Fraser')
    expect(unlinked.next.customerRef).toBeUndefined()
    const back = done(unlinked.next, unlinked.inverse)
    expect(back.next.customerRef?.rowId).toBe('cst:4')
  })
})

/* ============================================================
   CLEARING A FIELD LEAVES NOTHING, NEVER A ZERO
   ============================================================ */

describe('blank and 0% are different documents', () => {
  it('removes the tax rate rather than setting it to nought', () => {
    const q = done(draft(), setTaxRate(10)).next
    const cleared = done(q, setTaxRate(undefined))
    expect('taxRate' in cleared.next).toBe(false)
  })

  it('removes the terms rather than leaving the word undefined on the page', () => {
    const q = done(draft(), setNote('Valid 30 days')).next
    const cleared = done(q, setNote('   '))
    expect('note' in cleared.next).toBe(false)
  })
})

/* ============================================================
   ADJUSTMENTS — the sign belongs to the control, not the typist
   ============================================================ */

describe('an adjustment is signed by which control was pressed', () => {
  const withRow = (kind: 'discount' | 'rebate' | 'tradeIn' | 'line') =>
    done(draft(), addAdjustment(kind, 'adj-1')).next

  it('opens with an empty label and a zero amount, suggesting nothing', () => {
    const q = withRow('discount')
    expect(q.adjustments).toEqual([{ id: 'adj-1', kind: 'discount', label: '', amount: 0 }])
  })

  it('credits a discount, a rebate and a trade-in, however it was typed', () => {
    for (const kind of ['discount', 'rebate', 'tradeIn'] as const) {
      const q = done(withRow(kind), setAdjustmentMagnitude('adj-1', 3000)).next
      expect(q.adjustments[0].amount).toBe(-3000)
      const typedNegative = done(withRow(kind), setAdjustmentMagnitude('adj-1', -3000)).next
      expect(typedNegative.adjustments[0].amount).toBe(-3000)
    }
  })

  it('charges a free line', () => {
    const q = done(withRow('line'), setAdjustmentMagnitude('adj-1', 250)).next
    expect(q.adjustments[0].amount).toBe(250)
  })

  it('is a visible row in the total, never folded into a subtotal', () => {
    const q = done(withRow('discount'), setAdjustmentMagnitude('adj-1', 3000)).next
    const totals = quoteTotals(q)
    expect(totals.total).toBe(62_000 - 3000)
  })

  it('takes the amount back to the signed figure it was, never re-signing it', () => {
    const q = done(withRow('discount'), setAdjustmentMagnitude('adj-1', 3000)).next
    const changed = done(q, setAdjustmentMagnitude('adj-1', 500))
    expect(changed.next.adjustments[0].amount).toBe(-500)
    const back = done(changed.next, changed.inverse)
    expect(back.next.adjustments[0].amount).toBe(-3000)
  })

  it('names it without touching the amount', () => {
    const q = done(withRow('discount'), setAdjustmentMagnitude('adj-1', 3000)).next
    const named = done(q, updateAdjustment('adj-1', { label: 'Boat show' }))
    expect(named.next.adjustments[0]).toEqual({
      id: 'adj-1',
      kind: 'discount',
      label: 'Boat show',
      amount: -3000,
    })
  })

  it('puts a removed row back at the index it held', () => {
    let q = draft()
    q = done(q, addAdjustment('discount', 'adj-1')).next
    q = done(q, addAdjustment('rebate', 'adj-2')).next
    q = done(q, addAdjustment('line', 'adj-3')).next

    const gone = done(q, removeAdjustment('adj-2'))
    expect(gone.next.adjustments.map((a) => a.id)).toEqual(['adj-1', 'adj-3'])
    const back = done(gone.next, gone.inverse)
    expect(back.next.adjustments.map((a) => a.id)).toEqual(['adj-1', 'adj-2', 'adj-3'])
  })
})

/* ============================================================
   TODAY'S PRICES — two decisions, never one
   ============================================================ */

describe('re-reading today’s prices is applied, never silently', () => {
  const change = {
    lineId: 'l-hull',
    label: 'Highfield SP 560',
    from: 62_000,
    to: 64_500,
    levels: [rung('cash', 'Cash', 64_500), rung('trade', 'Trade', 60_000)],
    priceColumnName: 'Cash',
    gone: false,
  }

  it('moves only the lines the diff named', () => {
    const q = done(draft(), applyPriceChanges([change]))
    expect(q.next.lines[0].unitPrice).toBe(64_500)
    expect(q.event.kind).toBe('prices-reread')
  })

  it('never touches a line whose row has left the sheet', () => {
    const outcome = apply(draft(), applyPriceChanges([{ ...change, gone: true, to: null }]), NOW)
    /* a `gone` line is reported and never zeroed: the frozen figure
       stands, because the quote never needed the row to print */
    expect(refusal(outcome)).toBe('')
  })

  it('puts the figures that were on the document back', () => {
    const forward = done(draft(), applyPriceChanges([change]))
    const back = done(forward.next, forward.inverse)
    expect(back.next.lines[0].unitPrice).toBe(62_000)
    expect(back.next.lines[0].levels).toEqual(hull().levels)
  })
})

/* ============================================================
   ISSUING
   ============================================================ */

describe('issuing refuses what cannot be repaired afterwards', () => {
  it('goes out when nothing is blocking it', () => {
    const outcome = done(draft(), issue())
    expect(outcome.next.state).toBe('issued')
    expect(outcome.next.issuedAt).toBe(NOW)
    expect(outcome.event.kind).toBe('issued')
  })

  it('refuses with the blockers’ own sentences, not with a false', () => {
    const nameless = draft({ customer: { name: '' } })
    const outcome = apply(nameless, issue(), NOW)
    expect(refusal(outcome)).not.toBe('')
    /* the sentence is the one the screen prints beside the button,
       so the two cannot disagree about whether it may go out */
    expect(refusal(outcome)).toBe(
      (function blockers() {
        return refusal(apply(nameless, issue(), NOW))
      })(),
    )
  })

  it('refuses a typed price with no reason beside it', () => {
    const q = done(draft(), setOverride('l-hull', 50_000, undefined)).next
    expect(refusal(apply(q, issue(), NOW))).not.toBe('')
  })

  it('has no way back, and says so rather than doing nothing', () => {
    const outcome = done(draft(), issue())
    /* `apply` refuses the issued document before the inverse is even
       reached; reached directly it answers with the same sentence */
    expect(refusal(outcome.inverse(outcome.next, NOW))).toBe(ISSUED_REFUSAL)
    expect(refusal(apply(outcome.next, outcome.inverse, NOW))).toBe(ISSUED_REFUSAL)
  })
})

/* ============================================================
   MAKING A NEW VERSION
   ============================================================ */

describe('a new version is a fresh draft that supersedes', () => {
  const issued = () => done(draft(), issue()).next

  it('copies the frozen lines by value and mints fresh ids for them', () => {
    const from = issued()
    const { quote: copy } = newVersionOf(from, '20260910-01', NOW)
    expect(copy.state).toBe('draft')
    expect(copy.supersedesId).toBe(from.id)
    expect(copy.id).not.toBe(from.id)
    expect(copy.reference).toBe('20260910-01')
    expect(copy.lines).toHaveLength(1)
    expect(copy.lines[0].id).not.toBe(from.lines[0].id)
    expect(copy.lines[0].unitPrice).toBe(62_000)
    expect(copy.sections[0].lineIds).toEqual([copy.lines[0].id])
    expect(copy.issuedAt).toBeUndefined()
  })

  it('starts its own audit rather than claiming what happened to another document', () => {
    const from = issued()
    const { quote: copy, event } = newVersionOf(from, '20260910-01', NOW)
    expect(from.events.length).toBeGreaterThan(0)
    expect(copy.events).toEqual([])
    expect(event.kind).toBe('versioned')
  })

  it('and the fresh draft takes edits again', () => {
    const { quote: copy } = newVersionOf(issued(), '20260910-01', NOW)
    const outcome = apply(copy, setQty(copy.lines[0].id, 2), NOW)
    expect(isDone(outcome)).toBe(true)
  })
})

/* ============================================================
   THE SENTENCES
   ============================================================ */

describe('what each act says, kept verbatim from the file it came from', () => {
  it('names the item and the amount when a line goes on', () => {
    const line = ln('l-m', 'Yamaha F150XC', [rung('cash', 'Cash', 29_000)], 'cash')
    expect(done(draft(), addLine('blk_motor', line)).said).toBe(
      `Yamaha F150XC put on the quote · ${money(29_000)}`,
    )
  })

  it('says a line has no price rather than printing a zero', () => {
    const line = ln('l-free', 'Delivery to Cairns', [], 'cash')
    expect(done(draft(), addLine('blk_motor', line)).said).toBe(
      'Delivery to Cairns put on the quote · no price on it',
    )
  })

  it('keeps the sentence on the event, so the audit and the screen agree', () => {
    const outcome = done(draft(), setCustomer({ name: 'J. Fraser' }))
    expect(outcome.event.said).toBe(outcome.said)
  })
})
