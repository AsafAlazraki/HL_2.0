import { beforeAll, describe, expect, it } from 'vitest'
import type { EntityDef, QuoteDef, RowData } from '@/domain/model'
import { makeCtx, rowLabel } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { apply, isDone, issue, mintQuote, setCustomer, setPaperSection } from './commands'
import { NO_WAY_TO_REACH, readDocument, sheetOnPaper, unreachableSay } from './document'
import { lineFactsOf } from './lineFacts'
import { keyFacts, specSheet } from './specSheet'
import { quietCaps, specLabel } from './specSay'

/* ============================================================
   THE PRINTED QUOTE'S OWN FACTS, ON THE REAL FILE (2026-10-31): the
   full specification and each item's facts frozen at mint, the
   sections a salesperson takes on and off before the give, and
   Northside's GST rate and terms reaching a draft at the moment it is
   given. Every figure below is read off `data/northside/`; none is
   written here.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

const NOW = '2026-10-31T00:00:00.000Z'

function minted(key: string, find: string): QuoteDef {
  const table = pack.byKey(key)
  const rows = (pack.rowsByEntity[table.id] ?? []) as RowData[]
  const row = rows.find((r) => rowLabel(table, r).includes(find))
  expect(row, `${key} has no row matching ${find}`).toBeDefined()
  const ctx = makeCtx({ ...pack.ctx, views: { ...pack.ctx.views } })
  const view = createViewFor(ctx, table.id)
  const made = mintQuote(ctx, { viewId: view.id, rowId: row!.id, reference: 'NSM-PAPER' })
  expect(made).not.toBeNull()
  return made!.quote
}

function run(quote: QuoteDef, command: Parameters<typeof apply>[1]): QuoteDef {
  const out = apply(quote, command, NOW)
  if (!isDone(out)) throw new Error(`refused: ${out.refused}`)
  return out.next
}

/** Every column of a register whose name says it is money or cost — never a fact. */
const MONEY = /cost|ctd|nett|landed|price|sell|rrp|margin|mu\b|gp|freight|allowance|rego|trade/i

describe('an item’s own facts, frozen at the pick', () => {
  it('says a motor by its power, weight and shaft, as its own row states them', () => {
    const quote = minted('boat_highfield', 'SP560 (HYP)')
    const motor = quote.lines.find((l) => /F90XB/.test(l.label))
    expect(motor, 'the SP560 offers no F90XB on this file').toBeDefined()
    const said = Object.fromEntries((motor!.facts ?? []).map((f) => [f.label, f.value]))
    expect(said.Power).toMatch(/^\d+ hp$/)
    expect(said.Weight).toMatch(/^\d[\d,]* kg$/)
    expect(said.Shaft).toMatch(/^\d+ in$/)
  })

  it('never reads a money or cost column, on any motor or trailer row of the file', () => {
    for (const entity of Object.values(pack.ctx.entities) as EntityDef[]) {
      if (entity.kind !== 'motor' && entity.kind !== 'trailer' && entity.kind !== 'package')
        continue
      const rows = (pack.rowsByEntity[entity.id] ?? []) as RowData[]
      for (const row of rows.slice(0, 40)) {
        for (const fact of lineFactsOf(entity, (id) => row.values[id] ?? null)) {
          expect(fact.label).not.toMatch(MONEY)
          expect(fact.value).not.toMatch(/\$/)
        }
      }
    }
  })

  it('leaves a trailer length out, because this file writes it in millimetres under "(Mtr)"', () => {
    const entity = pack.byKey('trl_redco')
    const row = (pack.rowsByEntity[entity.id] as RowData[])[0]!
    const facts = lineFactsOf(entity, (id) => row.values[id] ?? null)
    expect(facts.map((f) => f.label)).not.toContain('Trailer length')
    expect(facts.find((f) => f.label === 'Rated to (ATM)')?.value).toMatch(/ kg$/)
  })

  it('gives a part no facts: its name says what it is', () => {
    const entity = pack.byKey('parts')
    const row = (pack.rowsByEntity[entity.id] as RowData[])[0]!
    expect(lineFactsOf(entity, (id) => row.values[id] ?? null)).toEqual([])
  })
})

describe('the full specification', () => {
  it('freezes every specification the file holds, beyond the five the build leads with', () => {
    const quote = minted('boat_highfield', 'SP560 (HYP)')
    expect(quote.subjectSpecs.length).toBe(5)
    expect(quote.subjectSpecsAll!.length).toBeGreaterThan(quote.subjectSpecs.length)
  })

  it('says it in a buyer’s words, grouped, with one unit for a length', () => {
    const doc = readDocument(minted('boat_highfield', 'SP560 (HYP)'))
    const labels = doc.subject.sheet.flatMap((g) => g.rows.map((r) => r.label))
    for (const file of [
      'OA Length',
      'Tube Dia',
      'Int Length',
      'Bottomsides',
      'Model Code',
      'Matrix',
    ])
      expect(labels).not.toContain(file)
    expect(labels).toContain('Length overall')
    const size = doc.subject.sheet.find((g) => g.id === 'size')!
    /* 382 cm inside is 3.82 m, the same length said in the unit beside it */
    expect(size.rows.find((r) => r.label === 'Inside length')?.value).toBe('3.82 m')
    expect(size.rows.find((r) => r.label === 'Tube diameter')?.value).toBe('52 cm')
    /* no money, no registration band */
    expect(
      doc.subject.sheet
        .flatMap((g) => g.rows)
        .some((r) => /\$|registration/i.test(r.label + r.value)),
    ).toBe(false)
  })

  it('sets at most four on the cover', () => {
    const doc = readDocument(minted('boat_stacer', 'Sea Ranger'))
    expect(doc.subject.key.length).toBeLessThanOrEqual(4)
    expect(keyFacts(specSheet([])).length).toBe(0)
  })

  it('specifies a quote that is not a boat by its item’s own facts', () => {
    const doc = readDocument(minted('mot_yamaha', 'F115'))
    expect(doc.subject.kind).toBe('motor')
    const labels = doc.subject.sheet.flatMap((g) => g.rows.map((r) => r.label))
    expect(labels).toContain('Power')
    expect(labels).not.toContain('HP rating')
    expect(labels).not.toContain('Prop')
    expect(doc.subject.key[0]?.label).toBe('Power')
  })
})

describe('the file’s capitals, said in a name’s case', () => {
  it('quiets a shouted series and keeps an acronym', () => {
    expect(quietCaps('SEA RANGER SDF (CENTRE CONSOLES)')).toBe('Sea Ranger SDF (Centre Consoles)')
    expect(quietCaps('OUTLAW (SIDE CONSOLES)')).toBe('Outlaw (Side Consoles)')
    expect(quietCaps('SEASPRITE DINGHYS')).toBe('Seasprite Dinghys')
    expect(quietCaps('Sport')).toBe('Sport')
    expect(specLabel('WEIGHT')).toBe('Weight')
    expect(specLabel('Bottomsides')).toBe('Bottom sides')
  })

  it('freezes a Stacer’s series and the paper says it quietly', () => {
    const quote = minted('boat_stacer', 'Sea Ranger')
    expect(quote.subjectSeries).toMatch(/^[A-Z ()]+$/)
    expect(readDocument(quote).subject.series).not.toBe(quote.subjectSeries)
  })
})

describe('the sections a salesperson chooses (quote-spec §7a)', () => {
  it('prints every optional section until one is taken off, and puts it back with its inverse', () => {
    const quote = minted('boat_highfield', 'SP560 (HYP)')
    /* every section the panel offers (the owner, 2026-10-30: "add/remove sections"), all in */
    expect(readDocument(quote).chosen).toEqual({
      specs: true,
      pictures: true,
      motor: true,
      trailer: true,
      terms: true,
      deposit: true,
      details: true,
    })
    const out = apply(quote, setPaperSection('specs', false), NOW)
    expect(isDone(out)).toBe(true)
    if (!isDone(out)) return
    expect(out.next.paperOff).toEqual(['specs'])
    expect(readDocument(out.next).chosen.specs).toBe(false)
    expect(out.event.kind).toBe('paper-set')
    const back = apply(out.next, out.inverse, NOW)
    expect(isDone(back) && back.next.paperOff).toBeUndefined()
  })

  it('is kept with the given quote, and a given quote refuses a change with its sentence', () => {
    let quote = minted('boat_highfield', 'SP560 (HYP)')
    quote = run(quote, setCustomer({ name: 'R. Kelleher' }))
    quote = run(quote, setPaperSection('pictures', false))
    quote = run(quote, issue())
    expect(readDocument(quote).chosen).toEqual({
      specs: true,
      pictures: false,
      motor: true,
      trailer: true,
      terms: true,
      deposit: true,
      details: true,
    })
    const refused = apply(quote, setPaperSection('pictures', true), NOW)
    expect(isDone(refused)).toBe(false)
    expect('refused' in refused && refused.refused).toMatch(/\S/)
  })
})

describe('Northside’s rate and terms reach a draft at the give', () => {
  it('a draft started before GST was set is given at Northside’s rate, and the paper says it', () => {
    let quote = minted('boat_stacer', 'Sea Ranger')
    expect(quote.taxRate).toBeUndefined()
    quote = run(quote, setCustomer({ name: 'R. Kelleher' }))
    const given = run(quote, issue({ taxRate: 10, terms: 'Deposit on order.' }))
    expect(given.taxRate).toBe(10)
    expect(given.note).toBe('Deposit on order.')
    const doc = readDocument(given)
    expect(doc.totals.taxRate).toBe(10)
    expect(doc.totals.taxAmount).toBeCloseTo(doc.totals.total / 11, 6)
    expect(doc.terms).toBe('Deposit on order.')
  })

  it('a give with no rate and no terms set changes neither', () => {
    let quote = minted('boat_stacer', 'Sea Ranger')
    quote = run(quote, setCustomer({ name: 'R. Kelleher' }))
    const given = run(quote, issue())
    expect(given.taxRate).toBeUndefined()
    expect(given.note).toBe(quote.note)
  })
})

describe('the printed quote’s critic, 2026-10-31: the file’s words, the sheet and the way to reach Northside', () => {
  it('says a repower’s motor in full, its facts once and none of them a code', () => {
    const doc = readDocument(minted('mot_yamaha', 'F115LB'))
    const rows = doc.subject.sheet.flatMap((g) => g.rows)
    const said = Object.fromEntries(rows.map((r) => [r.label, r.value]))
    expect(said.Engine).toBe('In-line 4, 1,832 cc')
    expect(said.Control).toBe('Mechanical remote')
    expect(said['Trim and tilt']).toBe('Power')
    /* no label twice, no group of one */
    expect(new Set(rows.map((r) => r.label)).size).toBe(rows.length)
    for (const group of doc.subject.sheet) expect(group.rows.length).toBeGreaterThan(1)
    expect(doc.subject.kind).toBe('motor')
  })

  it('leaves the file’s "Opt" off the specification and names it to the dealer', () => {
    const doc = readDocument(minted('boat_stabicraft', '1850 Fisher'))
    const rows = doc.subject.sheet.flatMap((g) => g.rows)
    expect(rows.find((r) => /fuel/i.test(r.label))).toBeUndefined()
    expect(doc.subject.unsaid).toContainEqual({ label: 'Fuel capacity', value: 'Opt' })
    /* the shaft is said in words, never the file's letters */
    const shaft = rows.find((r) => /shaft/i.test(r.label))
    expect(shaft?.value).toMatch(/^(Short|Long|Extra long|Ultra long|Twin extra long)/)
  })

  it('never heads a group of one row on the specification', () => {
    for (const [key, find] of [
      ['boat_highfield', 'SP560 (HYP)'],
      ['boat_stacer', '481 SeaMaster'],
      ['boat_stacer', '499 Sea Ranger'],
      ['boat_stabicraft', '1850 Fisher'],
    ] as const) {
      const headed = readDocument(minted(key, find)).subject.sheet.filter((g) => g.name !== '')
      const lone = headed.filter((g) => g.rows.length < 2).map((g) => g.name)
      expect(lone, find).toEqual([])
    }
  })

  it('folds a sheet of lone groups into one list, and gathers a long sheet’s lone facts', () => {
    const row = (label: string) => ({ label, value: '1' })
    expect(
      sheetOnPaper([
        { id: 'size', name: 'Size', rows: [row('Length'), row('Beam')] },
        { id: 'weight', name: 'Weight', rows: [row('Weight')] },
      ]),
    ).toEqual([{ id: 'more', name: '', rows: [row('Length'), row('Beam'), row('Weight')] }])
    const long = sheetOnPaper([
      { id: 'size', name: 'Size', rows: ['a', 'b', 'c', 'd', 'e', 'f'].map(row) },
      { id: 'power', name: 'Power', rows: ['g', 'h', 'i', 'j', 'k'].map(row) },
      { id: 'weight', name: 'Weight', rows: [row('Weight')] },
      { id: 'capacity', name: 'Capacity', rows: [row('Fuel')] },
    ])
    expect(long.map((g) => [g.name, g.rows.length])).toEqual([
      ['Size', 6],
      ['Power', 5],
      ['Details', 2],
    ])
  })

  it('says when nothing on the paper reaches Northside, and is silent once something does', () => {
    expect(unreachableSay(null, null)).toBe(NO_WAY_TO_REACH)
    expect(unreachableSay({ name: 'Northside Marine' }, { name: 'Asaf' })).toBe(NO_WAY_TO_REACH)
    expect(unreachableSay({ name: 'Northside Marine', phone: '07' }, null)).toBe('')
    /* taken off this quote, Northside's phone does not print, so it does not reach anyone */
    expect(unreachableSay({ name: 'Northside Marine', phone: '07' }, null, false)).toBe(
      NO_WAY_TO_REACH,
    )
    expect(unreachableSay(null, { name: 'Asaf', email: 'a@b' })).toBe('')
  })
})
