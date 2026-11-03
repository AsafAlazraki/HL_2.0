/* ============================================================
   THE RIG, PRICED — and the boat's own facts, the motors set side by
   side, and the lines a quote started here begins with (the fitment
   judge, 2026-11-03: blockers 2 and 3, majors 4 and 5).

   A MOTOR ON THIS BOAT IS NOT THE MOTOR ALONE. Every pairing names a
   rigging kit, a prop and an engine hole, and the tile showed the
   motor's figure: a figure quoted from Fitment was a kit short. Here
   each offered motor is read with what its own pairing names beside it
   (`MotorFit.kits`, the list the boat's page reads through the motor's
   pairing, priced by `mintLine` as the build prices it). Where
   Northside has not chosen which of the kit list's figures is its price
   (`unchosenOn`), nothing is added and the sentence says so; a figure
   the price list does not carry is never made up, and "TBA" is said as
   not yet known.

   THE BOAT'S FACTS are its own row's, read by the trade's word across
   seven makers' column names, never money and never a cost.

   THE QUOTE STARTED HERE is the picker's own mint (the boat alone),
   then the build's own candidates (`candidateOffer`) keyed by the
   pairing — so a line on it is exactly the line the build would have
   put there with one press.

   Pure: no React, no store.
   ============================================================ */

import { readCell } from '@/domain/model'
import type { CatalogueCtx, EntityDef, QuoteDef, QuoteLine, RowData } from '@/domain/model'
import { PAIR_SPECS, specValue, valueSaid } from '@/domain/rules/constraints/pairSpecs'
import { candidateOffer, mintLine } from '@/domain/quote/freeze'
import { joinRefFor, makeEngine } from '@/domain/catalogue/views'
import { makerOfTable } from '@/domain/catalogue/makers'
import { offeredIn, type BoatFit, type Made, type Place } from './boat'
import { TRAILER_ATM_FLOOR, loadFieldFor } from './trailerFitment'
import type { SellFigure } from '@/domain/pricing/unchosen'
import { figure, seriesSaid } from './say'
import { modelOf } from './plate'
import { rigOf } from './envelope'

const rowOf = (ctx: CatalogueCtx, place: Place): RowData | undefined =>
  (ctx.rowsByEntity[place.tableId] ?? []).find((r) => r.id === place.rowId)

/* ---------------------------------------------------------- */
/* One motor, rigged                                           */
/* ---------------------------------------------------------- */

export interface RigKit {
  /** the kit as the price list names it */
  name: string
  place: Place
  /** at the boat's own price; null where Northside has not chosen the list's price */
  price: number | null
  /** the sell figures the line holds where its price is not chosen; null where it is priced */
  unchosen: SellFigure[] | null
  /** THE PRICE LIST MARKS IT NO LONGER SOLD (the fitment verifier, 2026-11-03: 146 Yamaha
   *  pairings on 30 boats name one). Never priced, never put on a quote: named, and said so. */
  retired: boolean
}

export interface RigFact {
  label: string
  value: string
}

export interface Rigged {
  /** the pairing: the identity of "this motor on this boat" */
  key: string
  motor: Made
  /** "F175XC", the maker said once above */
  model: string
  hp: number | null
  /** two or more motors on one pairing: a twin rig */
  rig: number
  /** the rigging kit its pairing names; null where it names none */
  kit: RigKit | null
  /** the prop and the engine hole, as the pairing names them */
  with: RigFact[]
  /** the motor and its kit, where both are priced (or no kit is named); null otherwise, and null
   *  where the kit it names is no longer sold: the motor alone is not the rig */
  total: number | null
}

/** "TBA" on the price list is not a measure: it is said as not yet known. */
const unknown = (v: string): boolean => /^(tba|tbc|n\/?a|-|—)$/i.test(v.trim())

/** What one pairing names beside its motor, in the dealer's words. */
function pairFacts(made: Made): RigFact[] {
  const of = (label: string): string =>
    made.goesWith.find((g) => g.label.trim().toLowerCase() === label)?.value.trim() ?? ''
  const out: RigFact[] = []
  /* the description in its own case, the part number as the maker prints it: "6CE-45976-20",
     never "6Ce-45976-20" (round 2 of the fitment fixes, 2026-11-03) */
  const description = of('prop description')
  const prop = [description === '' ? '' : seriesSaid(description), of('prop part no.')].filter(
    (s) => s !== '',
  )
  if (prop.length > 0) out.push({ label: 'Prop', value: prop.join(' · ') })
  const hole = of('engine hole')
  if (hole !== '') {
    out.push({
      label: 'Engine hole',
      value: unknown(hole) ? `Not yet known: the price list says ${hole}` : hole,
    })
  }
  return out
}

/** Every motor offered on this boat, with its rigging kit, prop and engine hole, and the price of
 *  the two together where the price list prices both. In the plate's own order. */
export function riggedOf(ctx: CatalogueCtx, fit: BoatFit): Rigged[] {
  const motor = fit.motor
  const table = motor ? ctx.entities[motor.tableId] : undefined
  if (!motor || !table) return []
  const maker = makerOfTable(table)
  /* IN THE PRICE LIST'S OWN ORDER, the recommended where the file puts it (the fitment verifier,
     2026-11-03: Recommend it moved the pressed tile to the front, and another tile's Recommend it
     landed under the pointer). The star marks it; the row stands still. */
  return offeredIn(motor.made)
    .toSorted((a, b) => a.at - b.at)
    .map((made): Rigged => {
      const row = rowOf(ctx, made.place)
      const rig = row ? rigOf(table, row) : null
      const kitMade = motor.kits.get(made.key) ?? null
      const gone = kitMade ? null : (motor.retiredKits.get(made.key) ?? null)
      const kit: RigKit | null = kitMade
        ? {
            name: kitMade.name,
            place: kitMade.place,
            price: kitMade.price,
            unchosen: kitMade.unchosen,
            retired: false,
          }
        : gone
          ? { name: gone.name, place: gone.place, price: null, unchosen: null, retired: true }
          : null
      const total =
        made.price === null
          ? null
          : kit === null
            ? made.price
            : kit.price === null
              ? null
              : made.price + kit.price
      return {
        key: made.key,
        motor: made,
        model: modelOf(made.name, maker),
        hp: rig ? rig.each : null,
        rig: rig ? rig.count : 1,
        kit,
        with: pairFacts(made),
        total,
      }
    })
}

/** A kit no longer sold, said of one pairing. */
const RETIRED_KIT =
  'The rigging kit its pairing names is no longer sold, so the figure is the motor alone and a quote takes the motor without it.'

/**
 * THE KITS NO LONGER SOLD, SAID ONCE OVER THE TILES (the fitment verifier, 2026-11-03: on the
 * Stabicraft 2350 Ultra Centrecab, 10 of 11 tiles said "Its pairing names no rigging kit." while
 * each names one the price list marks discontinued). Counted, with its denominator; '' where
 * none is.
 */
export function retiredKitsSaid(rigs: readonly Rigged[]): string {
  const n = rigs.filter((r) => r.kit?.retired).length
  if (n === 0) return ''
  if (rigs.length === 1) return RETIRED_KIT
  const of = n === rigs.length ? `All ${figure(n)}` : `${figure(n)} of the ${figure(rigs.length)}`
  return `${of} name a rigging kit the price list marks no longer sold, so ${n === 1 ? 'its figure is' : 'their figures are'} the motor alone and a quote takes the motor without it.`
}

/** The sentence under a rig's figures: what is in the figure, and what is not. */
export function rigSaid(r: Rigged): string {
  if (r.motor.price === null) return 'The motor has no price on the price list.'
  if (!r.kit) return 'Its pairing names no rigging kit.'
  if (r.kit.retired) return RETIRED_KIT
  if (r.kit.price !== null) return 'The motor and its rigging kit, on this boat.'
  return r.kit.unchosen
    ? 'The rigging kit’s price is not chosen yet, so it is not added in.'
    : 'The rigging kit has no price on the price list, so it is not added in.'
}

/* ---------------------------------------------------------- */
/* The motors, side by side                                    */
/* ---------------------------------------------------------- */

export interface CompareRow {
  label: string
  /** one per motor, in the rigs' order; '—' where the price list carries nothing */
  cells: string[]
  /** a figure row, drawn in figures and set to the right */
  money: boolean
}

const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
})

/**
 * THE OFFERED MOTORS AS COLUMNS (the fitment judge, major 4; the sweep's direction D, never built
 * until now): horsepower, weight, shaft, controls, starting, tilt and trim, colour, the kit and
 * the money, every cell the motor's own row or its pairing, a dash where the file says nothing.
 */
export function compareOf(ctx: CatalogueCtx, rigs: readonly Rigged[]): CompareRow[] {
  const spec = (id: string) => PAIR_SPECS.find((s) => s.kind === 'motor' && s.id === id)!
  const said =
    (id: string) =>
    (r: Rigged): string => {
      const table = ctx.entities[r.motor.place.tableId]
      const row = rowOf(ctx, r.motor.place)
      const v = table && row ? specValue(spec(id), table, row) : null
      if (v === null) return '—'
      /* a cell begins a sentence, as the plate's own facts do: "Extra-long (25″)" (the fitment
         verifier, 2026-11-03: the compare said "extra-long (25″)" under the plate's capital) */
      const words = valueSaid(spec(id), String(v))
      return words.charAt(0).toUpperCase() + words.slice(1)
    }
  const money = (n: number | null): string => (n === null ? '—' : AUD.format(n))
  const rows: CompareRow[] = [
    {
      label: 'Horsepower',
      cells: rigs.map((r) =>
        r.hp === null ? '—' : `${r.rig > 1 ? `${r.rig} × ` : ''}${figure(r.hp)} hp`,
      ),
      money: false,
    },
    { label: 'Weight', cells: rigs.map(said('weight')), money: false },
    { label: 'Shaft', cells: rigs.map(said('shaft')), money: false },
    { label: 'Controls', cells: rigs.map(said('controls')), money: false },
    { label: 'Starting', cells: rigs.map(said('starting')), money: false },
    { label: 'Tilt and trim', cells: rigs.map(said('tilt')), money: false },
    { label: 'Colour', cells: rigs.map(said('colour')), money: false },
    { label: 'Rigging kit', cells: rigs.map((r) => r.kit?.name ?? '—'), money: false },
    { label: 'Motor', cells: rigs.map((r) => money(r.motor.price)), money: true },
    {
      label: 'Rigging kit price',
      cells: rigs.map((r) =>
        r.kit === null
          ? '—'
          : r.kit.retired
            ? 'No longer sold'
            : r.kit.price === null
              ? 'Not chosen'
              : money(r.kit.price),
      ),
      money: true,
    },
    { label: 'On this boat', cells: rigs.map((r) => money(r.total)), money: true },
  ]
  /* a row the price list leaves empty for every motor is not drawn */
  return rows.filter((row) => row.cells.some((c) => c !== '—'))
}

/* ---------------------------------------------------------- */
/* The boat's own facts                                        */
/* ---------------------------------------------------------- */

const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, ' ')

/** The columns each fact is read from, in the order the seven makers' lists write them. */
const FACTS: ReadonlyArray<{ label: string; columns: readonly string[]; unit: string }> = [
  {
    label: 'Length',
    columns: ['oa length', 'hull length (mtr)', 'hull length', 'length (mtr)', 'loa'],
    unit: 'm',
  },
  { label: 'Beam', columns: ['beam', 'beam (mtr)', 'hull beam (mtr)'], unit: 'm' },
  { label: 'People', columns: ['max people'], unit: '' },
  { label: 'Load', columns: ['max load kg'], unit: 'kg' },
  { label: 'Berths', columns: ['berths'], unit: '' },
  { label: 'Fuel', columns: ['fuel capacity', 'fuel capcity l'], unit: 'L' },
]

/* a length as the file writes it, to the centimetre: 6.52 m, never 6.5 */
const METRES = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 })

const FIGURE = /\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/

/**
 * THE BOAT'S OWN FACTS (the fitment judge, major 5: the SP660 carries 6.52 m, 2.59 m, 13 people,
 * 1,287 kg, 140 litres, an extra-long shaft and remote steering, and the plate showed only its
 * horsepower). Each read off the boat's own row by the trade's word, across the makers' column
 * names; its weight as the trailer's ATM reads it; its shaft and steering as a dealer's rule reads
 * them. Never money, never a cost; a fact the row does not carry is not drawn.
 */
export function boatFacts(ctx: CatalogueCtx, place: Place): RigFact[] {
  const entity: EntityDef | undefined = ctx.entities[place.tableId]
  const row = rowOf(ctx, place)
  if (!entity || !row) return []
  const out: RigFact[] = []
  const cell = (columns: readonly string[]) => {
    for (const c of columns) {
      const f = entity.fields.find((x) => norm(x.name) === c)
      const v = f ? readCell(row, f.id) : null
      if (v !== null && v !== undefined && String(v).trim() !== '') return v
    }
    return null
  }
  for (const fact of FACTS) {
    const v = cell(fact.columns)
    if (v === null) continue
    const hit = FIGURE.exec(String(v))
    if (!hit) continue
    const n = Number(hit[0].replace(/,/g, ''))
    if (!Number.isFinite(n) || n <= 0) continue
    const shown = fact.unit === 'm' ? METRES.format(n) : figure(n)
    out.push({ label: fact.label, value: fact.unit === '' ? shown : `${shown} ${fact.unit}` })
  }
  const weight = loadFieldFor(entity, TRAILER_ATM_FLOOR)
  const kg = weight ? readCell(row, weight.id) : null
  if (typeof kg === 'number' && kg > 0) {
    const towed = /tow|bmt/i.test(weight!.name)
    out.push({ label: towed ? 'On the road' : 'Weight', value: `${figure(kg)} kg` })
  }
  for (const id of ['shaft', 'steering'] as const) {
    const spec = PAIR_SPECS.find((s) => s.kind === 'boat' && s.id === id)!
    const v = specValue(spec, entity, row)
    if (v === null) continue
    const said = valueSaid(spec, String(v))
    out.push({
      label: id === 'shaft' ? 'Shaft' : 'Steering',
      value: said.charAt(0).toUpperCase() + said.slice(1),
    })
  }
  return out
}

/* ---------------------------------------------------------- */
/* The lines a quote started here begins with                  */
/* ---------------------------------------------------------- */

/** One thing chosen on Fitment for the quote: the list it is on and its pairing with the boat. */
export interface Pick {
  tableId: string
  /** the pairing's row id (`Made.key`), which is also the build's candidate key */
  key: string
  /** a rigging kit's own row and the motor's pairing that names it: where several pairings name one
   *  kit, the build offers it once, under one of them, and this mints it under the right one */
  rowId?: string
  pairing?: Place | null
}

export interface PickedLines {
  adds: Array<{ blockId: string; line: QuoteLine }>
  /** a pick the quote could not take, as a sentence each */
  kept: string[]
}

/**
 * THE BUILD'S OWN LINES FOR WHAT WAS CHOSEN HERE: for each pick, the candidate the build offers
 * under its section with the same pairing, minted at the quote's own price. A pick already on
 * the quote is not added twice, and a section that already holds a line of its own keeps it,
 * said: a draft handed back is somebody's work.
 */
export function pickedLines(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  picks: readonly Pick[],
): PickedLines {
  const adds: PickedLines['adds'] = []
  const kept: string[] = []
  for (const pick of picks) {
    const section = quote.sections.find((s) => s.tableId === pick.tableId)
    if (!section) continue
    const offer = candidateOffer(ctx, quote, section)
    const hit = offer.candidates.find((c) => c.key === pick.key)
    /* ONE KIT, NAMED BY SEVERAL PAIRINGS (803 live pairings on 311 boats, measured 2026-11-03):
       the build offers it once, keyed by one of them, so the kit of the motor chosen here is the
       same thing the build offers, minted through this motor's own pairing */
    const line = hit
      ? hit.alreadyLineId
        ? null
        : hit.line
      : pick.rowId && pick.pairing && offer.candidates.some((c) => c.line.rowId === pick.rowId)
        ? sameKitLine(ctx, quote, pick.tableId, pick.rowId, pick.pairing)
        : null
    if (!line) continue
    if (quote.lines.some((l) => l.pairRowId === pick.key && l.entityId === pick.tableId)) continue
    if (section.lineIds.length > 0) {
      kept.push(`${section.title} already holds a line on this quote, so it is kept as it was.`)
      continue
    }
    adds.push({ blockId: section.blockId, line })
  }
  return { adds, kept }
}

/** The build's own line for a kit, minted through the pairing that names it, at the quote's price. */
function sameKitLine(
  ctx: CatalogueCtx,
  quote: QuoteDef,
  tableId: string,
  rowId: string,
  pairing: Place,
): QuoteLine | null {
  const entity = ctx.entities[tableId]
  const row = (ctx.rowsByEntity[tableId] ?? []).find((r) => r.id === rowId)
  const joinRow = (ctx.rowsByEntity[pairing.tableId] ?? []).find((r) => r.id === pairing.rowId)
  const join = joinRefFor(ctx.entities, pairing.tableId, quote.rootTableId, tableId)
  if (!entity || !row || !joinRow || !join) return null
  return mintLine({
    ctx,
    engine: makeEngine(ctx),
    entity,
    row,
    levelKey: quote.levelKey,
    join,
    joinRow,
    recommended: false,
  })
}

/**
 * WHAT EVERY MOTOR'S PAIRING NAMES ALIKE, said once over the tiles rather than seven times on
 * them: on the SP660 all seven name one prop and an engine hole the price list says is TBA.
 * Only facts every rig carries with the same words; a model of one motor shares nothing.
 */
export function sharedFacts(rigs: readonly Rigged[]): RigFact[] {
  if (rigs.length < 2) return []
  const [first, ...rest] = rigs
  return first!.with.filter((f) =>
    rest.every((r) => r.with.some((g) => g.label === f.label && g.value === f.value)),
  )
}
