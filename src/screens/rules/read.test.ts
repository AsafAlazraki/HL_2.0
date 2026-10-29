/* ============================================================
   THE RULES SCREEN'S READING, against the real pack: the opening
   sentence is the price list's own, in the dealer's words, its values
   are on rows of the file, every line of the price list's rules is
   the ledger's own, and what a rule costs is true in every state.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { PAIRING_RULES, ledgerFor } from '@/domain/rules/constraints/ruleLedger'
import { WORKBOOK_RULES } from '@/domain/rules/constraints/workbookRules'
import { pairReach, pairSaid } from '@/domain/rules/constraints/pairRules'
import {
  blankDraft,
  costSaid,
  draftChanged,
  houseOf,
  houseSaid,
  modelsSaid,
  onSale,
  partsOf,
  standingSaid,
  verbLine,
  draftFromPriceList,
  draftMissing,
  draftOf,
  readColumns,
  ruleOfDraft,
  shapeOfDraft,
  sideMovedTo,
  statedRules,
  yourRules,
  type Draft,
} from './read'

const pack = await loadPack()
const world = pack.ctx
const cols = readColumns(world)

/** A tiller boat must take a tiller motor: 45 of the 540 the list makes, on five models. */
const tillerDraft = (): Draft => ({
  ...blankDraft(),
  boatKey: 'boat::steering',
  boatValue: 'Tiller',
  partnerKey: 'motor::controls',
  partnerValue: 'Tiller handle',
  because: 'a tiller boat has no helm to steer a remote motor from',
})

describe('the sentence the plate opens on', () => {
  it('is F7, in the dealer’s words, with the values the ledger names, each on a row of the file', () => {
    const words = ledgerFor('F7')!.sentence!
    const boat = cols.boat.find((c) => c.key === words.boat)!
    const motor = cols.motor.find((c) => c.key === words.partner)!
    expect(boat.values.find((v) => v.value === words.boatValue)?.count).toBe(228)
    expect(motor.values.find((v) => v.value === words.partnerValue)?.count).toBe(38)
    const seed = WORKBOOK_RULES.find((s) => s.ref === 'F7')!
    expect(seed.statement).toMatch(/remote helm.*tiller-handle motor/)
    const draft = draftFromPriceList('F7', cols)!
    expect(draft.because).toBe(seed.because)
    expect(pairSaid(shapeOfDraft(draft, cols))).toBe(
      'When the boat’s steering is remote, the motor’s controls must not be Tiller handle.',
    )
  })

  it('no other price-list rule is said by a sentence here', () => {
    expect(
      statedRules(cols)
        .filter((s) => s.sayable)
        .map((s) => s.ref),
    ).toEqual(['F7'])
  })
})

describe('the price list’s rules', () => {
  it('are its ten pairing rules, each line and each measure read from the ledger, never typed', () => {
    const stated = statedRules(cols)
    expect(stated.map((s) => s.ref)).toEqual(PAIRING_RULES.map((e) => e.ref))
    expect(stated).toHaveLength(10)
    for (const s of stated) {
      expect(s.said).toBe(ledgerFor(s.ref)!.said)
      expect(s.measure).toEqual(ledgerFor(s.ref)!.measure)
    }
    expect(stated.filter((s) => s.noticed).map((s) => s.ref)).toEqual(['F7', 'F16', 'F12'])
  })

  it('never says the build flags what it does not: F9 and A2 name where they ARE said', () => {
    const stated = statedRules(cols)
    for (const s of stated) expect(s.said).not.toMatch(/flagged/)
    expect(stated.find((s) => s.ref === 'F9')!.said).toMatch(/never refused\. Fitment says/)
    expect(stated.find((s) => s.ref === 'A2')!.said).toMatch(/never refused\. On a quote/)
  })
})

describe('what the census says', () => {
  it('where the price list loses nothing, says so once and names no boat beside a list of motors', () => {
    const reach = pairReach(shapeOfDraft(draftFromPriceList('F7', cols)!, cols), world)
    expect(costSaid(reach, 'refuses')).toBe(
      'No sale. Nothing the price list makes for these boats breaks it; a search past the list finds 38 fewer motors.',
    )
  })

  it('names a real model and what it loses, the same model on every reading', () => {
    const reach = pairReach(shapeOfDraft(tillerDraft(), cols), world)
    expect(costSaid(reach, 'refuses')).toBe(
      'The Highfield Classic 340 loses the Yamaha F25SWTC, and 4 more models lose one too.',
    )
  })

  it('switched off, it costs nothing today, and says what it would in the conditional', () => {
    const reach = pairReach(shapeOfDraft(tillerDraft(), cols), world)
    const off = costSaid(reach, 'off')
    expect(off).toBe(
      'Nothing today: it is off. Switched on, the Highfield Classic 340 would lose the Yamaha F25SWTC, and 4 more models would lose one too.',
    )
    expect(off).not.toMatch(/ loses /)
    expect(costSaid(reach, 'warns')).toMatch(/^No sale: the Highfield Classic 340 keeps/)
  })

  it('says nothing until every word is chosen, and the act says what is missing', () => {
    const draft = blankDraft()
    expect(costSaid(pairReach(shapeOfDraft(draft, cols), world), 'refuses')).toBe('')
    expect(draftMissing(draft, cols)).toBe('Choose which of the boat’s specs this rule looks at.')
  })
})

describe('the house rules, by part', () => {
  it('numbers the price list’s clauses first and Northside’s after, and boxes the noticed apart', () => {
    const rule = ruleOfDraft(tillerDraft(), cols, 'northside', '2026-10-28T09:00:00.000Z')
    const parts = partsOf(statedRules(cols), yourRules([rule], world))
    expect(
      parts.map((p) => [p.name, p.stated.map((c) => c.at), p.noticed.map((n) => n.ref)]),
    ).toEqual([
      ['Trailers', ['1.1', '1.2'], []],
      ['Motors', ['2.1', '2.2', '2.3'], ['F7']],
      ['Rigging and pre-delivery', ['3.1', '3.2'], ['F16', 'F12']],
    ])
    expect(parts[1]!.yours.map((y) => y.at)).toEqual(['2.4'])
    expect(parts[1]!.next).toBe('2.5')
    expect(parts[0]!.next).toBe('1.3')
    /* nothing is written under rigging: no sentence here names a kit */
    expect(parts[2]!.writes).toBeNull()
  })

  /* built-critique-m3-2.md, blocker 1: the lede's three figures were summed in the component */
  it('counts the lede off the parts it numbers: seven kept, and Northside’s own with how many are off', () => {
    const rule = ruleOfDraft(tillerDraft(), cols, 'northside', '2026-10-28T09:00:00.000Z')
    const none = houseOf(partsOf(statedRules(cols), []))
    expect(none).toEqual({ kept: 7, written: 0, off: 0 })
    expect(houseSaid(none)).toBe(
      'Your price list keeps 7 of these on its own, each measured on it. Northside has written none yet.',
    )
    const one = houseOf(partsOf(statedRules(cols), yourRules([rule], world)))
    expect(one).toEqual({ kept: 7, written: 1, off: 0 })
    expect(houseSaid(one)).toMatch(/Northside has written 1.$/)
    const off = houseOf(partsOf(statedRules(cols), yourRules([{ ...rule, enabled: false }], world)))
    expect(off.off).toBe(1)
    expect(houseSaid(off)).toMatch(/Northside has written 1, and it is off.$/)
    expect(houseSaid({ kept: 7, written: 3, off: 1 })).toMatch(/written 3, 1 of them off.$/)
    expect(houseSaid({ kept: 7, written: 2, off: 2 })).toMatch(/written 2, all of them off.$/)
  })

  it('counts what is on sale as the census does', () => {
    expect(onSale(world, 'motor')).toBe(241)
    expect(onSale(world, 'trailer')).toBe(434)
  })

  it('says an off rule kept and not enforced, its verb in the same place as on', () => {
    expect(verbLine('refuses', 'motor')).toEqual({
      lead: 'Otherwise the build',
      tail: 'the motor, because',
    })
    expect(verbLine('off', 'trailer', 'warn').tail).toBe(
      '— kept, not enforced. Switched on, the build would warn about the trailer, because',
    )
  })

  it('names one maker’s models once, and the drafts it would hold in the verb’s own terms', () => {
    expect(modelsSaid(['Classic 340', 'Classic 360', 'Classic 380 LS'])).toBe(
      'the Classic 340, 360 and 380 LS',
    )
    expect(modelsSaid(['ADV7'])).toBe('the ADV7')
    expect(standingSaid('refuses', 3, 1, 'motor')).toBe(
      'From the next pick. One of your 3 drafts carries a motor it refuses: the build says so there, and it cannot be given until it is off.',
    )
    /* never "None of your 1 draft" (built-critique-m3-2.md, minor) */
    expect(standingSaid('refuses', 1, 0, 'motor')).toBe(
      'From the next pick. Your one draft carries no motor it refuses.',
    )
    expect(standingSaid('refuses', 4, 0, 'trailer')).toBe(
      'From the next pick. None of your 4 drafts carries a trailer it refuses.',
    )
    expect(standingSaid('refuses', 0, 0, 'motor')).toBe(
      'From the next pick. No draft is standing today, so none waits on it.',
    )
    expect(standingSaid('off', 3, 1, 'motor')).toBe(
      'Nothing changes while it is off: no pick and no quote.',
    )
  })
})

describe('a maker, a model and a figure', () => {
  it('a figure is typed, and a side moved to one keeps no word it cannot say', () => {
    const length = cols.boat.find((c) => c.key === 'boat::length')!
    expect(sideMovedTo(length, 'boat', 'eq', 'Tiller')).toEqual({ op: 'gt', value: '' })
    const draft: Draft = {
      ...tillerDraft(),
      boatKey: 'boat::length',
      boatOp: 'gt',
      boatValue: '',
      partnerKey: 'motor::hp',
      partnerOp: 'gte',
      partnerValue: '90',
    }
    expect(draftMissing(draft, cols)).toBe('Type the boat’s length, in metres.')
    const typed = { ...draft, boatValue: '6' }
    expect(draftMissing(typed, cols)).toBeNull()
    expect(pairSaid(shapeOfDraft(typed, cols))).toBe(
      'When the boat’s length is over 6 m, the motor’s horsepower must be at least 90 hp.',
    )
  })

  it('a maker is chosen like any word: "a Haines Signature boat"', () => {
    const maker = cols.boat.find((c) => c.key === 'boat::maker')!
    expect(maker.values.map((v) => v.value)).toContain('Haines Signature')
    const draft: Draft = {
      ...tillerDraft(),
      boatKey: 'boat::maker',
      boatValue: 'Haines Signature',
      partnerKey: 'motor::maker',
      partnerValue: 'Yamaha',
    }
    expect(pairSaid(shapeOfDraft(draft, cols))).toBe(
      'When the boat’s maker is Haines Signature, the motor’s maker must be Yamaha.',
    )
  })
})

describe('a filed rule, opened again', () => {
  it('reads back as the draft it was written from; what it does is never a change of words', () => {
    const draft = draftFromPriceList('F7', cols)!
    const rule = ruleOfDraft(draft, cols, 'northside', '2026-10-22T09:00:00.000Z')
    const back = draftOf(rule, world)!
    expect(back.boatValue).toBe('Remote')
    expect(back.partnerValue).toBe('Tiller handle')
    expect(draftChanged(back, rule, world)).toBe(false)
    expect(draftChanged({ ...back, verb: 'warns' }, rule, world)).toBe(false)
    expect(draftChanged({ ...back, because: 'another reason' }, rule, world)).toBe(true)
  })

  it('a figure reads back as the figure typed', () => {
    const draft: Draft = {
      ...tillerDraft(),
      boatKey: 'boat::length',
      boatOp: 'gt',
      boatValue: '6.5',
      partnerKey: 'motor::hp',
      partnerOp: 'lte',
      partnerValue: '150',
    }
    const rule = ruleOfDraft(draft, cols, 'northside', '2026-10-22T09:00:00.000Z')
    expect(rule.if.clauses[0]!.right).toEqual({ kind: 'literal', value: 6.5 })
    const back = draftOf(rule, world)!
    expect(back.boatValue).toBe('6.5')
    expect(draftChanged(back, rule, world)).toBe(false)
  })
})
