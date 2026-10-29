/* ============================================================
   THE PLATE — what the fitment screen's one boat says about itself,
   and everything held back from it, grouped by what holds it back.

   NOT A NEW ENGINE. `boat.ts` reads the boat (`readBoatFit`); this file
   only shapes that reading the way direction F draws it
   (docs/directions/fitment-boards/f-the-plate.html, with E's trailer
   answer grafted on):

     · the plate's lines — the motor's range, the trailers it is built
       for, and what else is made for it — each with its own count;
     · the motors made for it as tiles, each pinned on the boat's own
       horsepower range, and the engine's reason on any that sits
       outside it (refine-critique-2.md, finding 11: a motor outside a
       boat's range is never "nothing wrong");
     · what is held back, one group per reason, each with its count, the
       engine's sentence (`say.ts`), its nearest or first struck example
       and the door to the line of the price list that decides it;
     · WHAT GOES ON THE TRAILER, which is the correction the verdict
       carried over with E's ATM bars: "Clears it by 1,250 kg" set the
       trailer's ATM against the bare hull, with the motor and the
       trailer's own weight left out. A trailer's ATM is the most the
       trailer and its load may weigh together, so the honest figure is
       the boat, its motor and the trailer itself, against the ATM —
       each part read off the price list, and what the list does not
       carry (fuel, gear) named as left out.

   Every sentence comes from `say.ts` or is composed here from the
   figures it names. The screen writes none.
   ============================================================ */

import { isDiscontinued, isRetired, readCell, rowLabel } from '@/domain/model'
import type { CatalogueCtx, EntityDef, FieldDef, RowData } from '@/domain/model'
import { goodsFacts, motorFactsOf } from '@/domain/quote/goodsFacts'
import { lineSaid } from '@/domain/quote/spoken'
import { makerOfTable } from '@/domain/catalogue/makers'
import { measureRig, rigOf } from './envelope'
import {
  BOAT_NOT_WEIGHED,
  RULE_REFUSES,
  TRAILER_NOT_RATED,
  figure,
  motorHeldSaid,
  rulesHereSaid,
  sayVerdict,
  type MotorHeldId,
} from './say'
import { TRAILER_ATM_FLOOR, loadFieldFor } from './trailerFitment'
import {
  offeredIn,
  offeredOf,
  refusedByRule,
  refusedIn,
  type BoatFit,
  type Made,
  type Opens,
  type Place,
  type TrailerMade,
} from './boat'

/* ---------------------------------------------------------- */
/* The plate's lines                                           */
/* ---------------------------------------------------------- */

export type LineId = 'motor' | 'trailer' | 'also'

export interface PlateLine {
  id: LineId
  /** "Motor", "Trailer", "Also made for it" */
  word: string
  /** the fact, as a person says it: "150–200 hp", "built for Highfield" */
  value: string
  /** a quieter second word: "one motor" */
  sub: string
  /** made for this boat and offered (`offeredOf`) */
  offered: number
  /** every one on sale in that place */
  of: number
  /** "one on a new quote"; '' where there is nothing more to say */
  note: string
}

const AU = new Intl.NumberFormat('en-AU')

/** A place on the boat whose plate line opens the reasons under it. */
export type HeldPlace = 'motor' | 'trailer'

/**
 * ONE PAIR OF FIGURES PER PLACE: what is offered on this boat, of every one on sale there. The
 * plate's "2 of 209 offered" and the reasons' "The other 207, and why" are both read off this
 * pair, so the two can never drift (built-critique-m3-2.md, blocker 1: the 207 was summed in
 * the screen while the 209 came from here). Null where the boat has no such place.
 */
export function figuresOf(fit: BoatFit, place: HeldPlace): { offered: number; of: number } | null {
  if (place === 'motor') {
    const motor = fit.motor
    return motor ? { offered: motor.counts.made, of: motor.counts.live } : null
  }
  const trailer = fit.trailer
  return trailer ? { offered: offeredOf(trailer.made).offered, of: trailer.onSale } : null
}

/** The boat's lines, in the order the plate draws them. A place the boat has no list for is left
 *  out rather than drawn empty. */
export function plateLines(fit: BoatFit): PlateLine[] {
  const out: PlateLine[] = []
  const motor = fit.motor
  const motorFigures = figuresOf(fit, 'motor')
  if (motor && motorFigures) {
    const single = motor.envelope?.rigs.length === 1 && motor.envelope.rigs[0]!.count === 1
    out.push({
      id: 'motor',
      word: 'Motor',
      value: motor.takes === '' ? 'no horsepower on its line' : motor.takes,
      sub: motor.takes !== '' && single ? 'one motor' : '',
      ...motorFigures,
      note: '',
    })
  }
  const trailer = fit.trailer
  const trailerFigures = figuresOf(fit, 'trailer')
  if (trailer && trailerFigures) {
    const crossing = trailer.made.filter((t) => t.crosses).length
    out.push({
      id: 'trailer',
      word: 'Trailer',
      value: trailer.maker ? `built for ${trailer.maker}` : 'built for this boat',
      sub: '',
      ...trailerFigures,
      note: crossing === 1 && trailer.made.length > 1 ? 'one on a new quote' : '',
    })
  }
  const lists = fit.lists.filter((l) => l.live > 0)
  if (lists.length > 0) {
    out.push({
      id: 'also',
      word: 'Also made for it',
      /* the list's own name, then its count, as the makers' line says "Stacer 34": a list's name
         is the file's own and carries its own plural, so "1 Dealer Fit Packages" is never said
         (built-critique-m3.md, minor) */
      value: lists.map((l) => `${l.name} ${AU.format(offeredOf(l.made).offered)}`).join(' · '),
      sub: '',
      offered: lists.reduce((n, l) => n + offeredOf(l.made).offered, 0),
      of: lists.reduce((n, l) => n + l.live, 0),
      note: '',
    })
  }
  return out
}

/* ---------------------------------------------------------- */
/* The motors made for it, as tiles on the boat's range        */
/* ---------------------------------------------------------- */

export interface MotorTile {
  made: Made
  /** the name without its maker, which the place's head says once: "F175XC" */
  model: string
  hp: number | null
  /** where its horsepower stands on the boat's own single-motor range, 0 to 1; null where the
   *  boat's line names no such range or the motor no horsepower */
  at: number | null
  /** the engine's reason where a motor made for this boat sits outside its range; '' inside */
  outside: string
}

export interface MotorTiles {
  /** "Yamaha", said once over the tiles */
  maker: string
  /** the range the tiles are pinned on, for a reader: "150–200 hp" */
  takes: string
  tiles: MotorTile[]
}

export function motorTiles(ctx: CatalogueCtx, fit: BoatFit): MotorTiles | null {
  const motor = fit.motor
  const table = motor ? ctx.entities[motor.tableId] : undefined
  if (!motor || !table) return null
  const maker = makerOfTable(table)
  const rows = new Map((ctx.rowsByEntity[table.id] ?? []).map((r) => [r.id, r]))
  const single = motor.envelope?.rigs.find((e) => e.count === 1) ?? null
  /* WHAT IS OFFERED, AND ONLY THAT: a motor one of the dealer's rules refuses is said once, as
     the rule's reason below the tiles, with the rule's own because — never also as a struck tile */
  const offered = offeredIn(motor.made)
  const tiles = offered.map((made): MotorTile => {
    const row = rows.get(made.place.rowId)
    const rig = row ? rigOf(table, row) : null
    const measured = measureRig(motor.envelope, rig)
    const hp = rig && rig.count === 1 ? rig.each : null
    let at: number | null = null
    if (hp !== null && single && single.min !== null && single.max !== null) {
      at =
        single.max === single.min
          ? 0.5
          : Math.min(1, Math.max(0, (hp - single.min) / (single.max - single.min)))
    }
    return {
      made,
      model: modelOf(made.name, maker),
      hp,
      at,
      outside: measured.kind === 'outside' ? sayVerdict(measured.verdict) : '',
    }
  })
  return { maker, takes: motor.takes, tiles }
}

/** "Yamaha F175XC" under a head that says Yamaha once is "F175XC". */
export function modelOf(name: string, maker: string): string {
  const lead = `${maker} `
  return maker !== '' && name.startsWith(lead) && name.length > lead.length
    ? name.slice(lead.length)
    : name
}

/* ---------------------------------------------------------- */
/* What is held back, one group per reason                     */
/* ---------------------------------------------------------- */

/** Where what decides a reason is changed on the price list. */
export type Door =
  /** the boat's own line, which carries the horsepower it takes */
  | { kind: 'boat'; opens: Opens }
  /** the list of which motor goes with which boat, found by this boat */
  | { kind: 'pairing'; opens: Opens }
  /** the struck thing's own line */
  | { kind: 'line'; opens: Opens }
  /** a trailer's own line, whose series names the maker it is built for */
  | { kind: 'series'; opens: Opens }
  /** the dealer's own rules */
  | { kind: 'rules' }

export interface HeldExample {
  name: string
  /** its own deciding facts: "225 hp · 30″ shaft", a trailer's series */
  facts: string
  place: Place
}

export interface Held {
  /** the group's id in Show all, so "Show these" opens exactly it */
  id: string
  count: number
  /** the engine's sentence, said once for the whole group */
  because: string
  example: HeldExample | null
  /** the example is the closest miss to the boat's own range, not merely the first */
  nearest: boolean
  /** THE EXAMPLE IS DRAWN STRUCK only where its reason holds it off this boat. A trailer whose
   *  series names no boat maker is not ruled out (`trailerFitment.ts`, `SeriesVerdict`), and a
   *  strike under "not ruled out" said the opposite of its sentence (built-critique-m3.md,
   *  major 5). */
  struck: boolean
  door: Door | null
  /** trailers built for another maker's boat: each maker and how many */
  makers: Array<{ maker: string; count: number }>
}

const ORDER: MotorHeldId[] = ['ruled', 'under', 'over', 'inside', 'unplaced', 'rigs', 'unrated']

/** Every Yamaha on sale that is not offered on this boat, by why. With the motors offered, the
 *  counts add up to every one on sale. */
export function motorHeld(ctx: CatalogueCtx, fit: BoatFit): Held[] {
  const motor = fit.motor
  const table = motor ? ctx.entities[motor.tableId] : undefined
  if (!motor || !table) return []
  const live = isRetired(table)
    ? []
    : (ctx.rowsByEntity[table.id] ?? []).filter((r) => !isDiscontinued(r))
  const rows = new Map(live.map((r) => [r.id, r]))
  const boatAt: Door = {
    kind: 'boat',
    opens: { tableId: fit.place.tableId, at: fit.place.rowId },
  }
  const pairing: Door | null = motor.pairingTableId
    ? { kind: 'pairing', opens: { tableId: motor.pairingTableId, find: fit.label } }
    : null
  const exampleOf = (place: Place, name: string): HeldExample => ({
    name,
    facts: goodsFacts(table, rows.get(place.rowId)),
    place,
  })
  const ofRow = (r: RowData): HeldExample =>
    exampleOf({ tableId: table.id, rowId: r.id }, lineSaid(rowLabel(table, r), table.name))

  const dots = (standing: string) => motor.dots.filter((d) => d.standing === standing)
  const refused = refusedIn(motor.made)
  const under = dots('under')
  const over = dots('over')
  const rigs = live
    .filter((r) => (rigOf(table, r)?.count ?? 1) > 1)
    .toSorted((a, b) => rowLabel(table, a).localeCompare(rowLabel(table, b), 'en-AU'))
  const unrated = live.filter((r) => rigOf(table, r) === null)

  const groups: Record<MotorHeldId, Omit<Held, 'id' | 'because' | 'makers' | 'struck'>> = {
    ruled: {
      count: refused.length,
      /* the rule's own because, quoted, where its first refusal is named */
      example: refused[0]
        ? { name: refused[0].name, facts: refused[0].rule?.because ?? '', place: refused[0].place }
        : null,
      nearest: false,
      door: { kind: 'rules' },
    },
    /* the dots are lightest first, so the nearest under the range is the last of them and the
       nearest over it the first */
    under: {
      count: under.length,
      example: under.at(-1) ? exampleOf(under.at(-1)!.place, under.at(-1)!.name) : null,
      nearest: true,
      door: boatAt,
    },
    over: {
      count: over.length,
      example: over[0] ? exampleOf(over[0].place, over[0].name) : null,
      nearest: true,
      door: boatAt,
    },
    inside: {
      count: dots('inside').length,
      example: dots('inside')[0]
        ? exampleOf(dots('inside')[0]!.place, dots('inside')[0]!.name)
        : null,
      nearest: false,
      door: pairing,
    },
    unplaced: {
      count: dots('unplaced').length,
      example: dots('unplaced')[0]
        ? exampleOf(dots('unplaced')[0]!.place, dots('unplaced')[0]!.name)
        : null,
      nearest: false,
      door: boatAt,
    },
    rigs: {
      count: rigs.length,
      example: rigs[0] ? ofRow(rigs[0]) : null,
      nearest: false,
      door: boatAt,
    },
    unrated: {
      count: unrated.length,
      example: unrated[0] ? ofRow(unrated[0]) : null,
      nearest: false,
      door: unrated[0] ? { kind: 'line', opens: { tableId: table.id, at: unrated[0].id } } : null,
    },
  }
  return ORDER.filter((id) => groups[id].count > 0).map((id) => ({
    id,
    because: motorHeldSaid(id, motor.takes, motor.rigsSay),
    makers: [],
    struck: true,
    ...groups[id],
  }))
}

/** Every trailer on sale that is not offered on this boat, by why. With the trailers offered, the
 *  counts add up to every one on sale; what is no longer sold is never in them. */
export function trailerHeld(fit: BoatFit): Held[] {
  const trailer = fit.trailer
  if (!trailer) return []
  const out: Held[] = []
  const refused = refusedIn(trailer.made)
  if (refused.length > 0) {
    out.push({
      id: 'ruled',
      count: refused.length,
      because: RULE_REFUSES,
      example: {
        name: refused[0]!.name,
        facts: refused[0]!.rule?.because ?? '',
        place: refused[0]!.place,
      },
      nearest: false,
      door: { kind: 'rules' },
      makers: [],
      struck: true,
    })
  }
  for (const g of trailer.groups) {
    const first = g.id === 'another' ? g.makers[0]?.example : g.members[0]
    out.push({
      id: g.id,
      count: g.count,
      because: g.head,
      example: first ? { name: first.name, facts: first.series, place: first.place } : null,
      nearest: false,
      door: first
        ? { kind: 'series', opens: { tableId: first.place.tableId, at: first.place.rowId } }
        : null,
      makers: g.makers.map((m) => ({ maker: m.maker, count: m.count })),
      struck: g.id !== 'unnamed',
    })
  }
  return out
}

/** One reason under a place, with its share of the others for the gauge it is drawn on. */
export interface HeldShare extends Held {
  /** this reason's count as a share of the others, 0 to 1; drawn, never said */
  share: number
}

/** Everything held back from one place on the boat, counted once. */
export interface HeldBack {
  /** every one on sale here that is not offered: `of − offered` of the plate line's own pair
   *  (`figuresOf`), so "The other 207" and "2 of 209" are one subtraction */
  others: number
  /** one group per reason; their counts add up to `others`, asserted on the real price list */
  groups: HeldShare[]
}

/** The reasons under a pressed plate line, and the one figure that heads them. */
export function heldBack(ctx: CatalogueCtx, fit: BoatFit, place: HeldPlace): HeldBack {
  const figures = figuresOf(fit, place)
  const held = place === 'motor' ? motorHeld(ctx, fit) : trailerHeld(fit)
  const others = figures ? Math.max(0, figures.of - figures.offered) : 0
  return {
    others,
    groups: held.map((h) => ({ ...h, share: others > 0 ? h.count / others : 0 })),
  }
}

/** The line at the foot of a place about the dealer's own rules: '' where one of them refuses
 *  something here, since its reason is then one of the groups above it. */
export function rulesHere(fit: BoatFit, held: readonly Held[], place: 'motor' | 'trailer'): string {
  const refusing = held.find((h) => h.id === 'ruled')?.count ?? 0
  return rulesHereSaid(fit.rulesInForce, refusing, place)
}

/* ---------------------------------------------------------- */
/* What goes on the trailer                                    */
/* ---------------------------------------------------------- */

/**
 * THE BOAT'S WEIGHT COLUMNS ARE NOT ALL ONE THING. Two name the boat alone — Highfield's "Boat
 * Weight" and Formosa's "Hull Weight (Dry)" — and the motor and the trailer have to be added to
 * them before they can stand against an ATM. Three already name the whole rig on the road:
 * Stacer's "BMT Weight" is boat, motor and trailer by its own name, and Stabicraft's and
 * Surtees' "Tow Weight" is what is towed. Those are set against the ATM as they stand, and
 * nothing is added twice.
 */
const TOWED = new Set(
  ['BMT Weight (Dry) kg', 'Tow Weight @ (Dry) kg', 'App. Tow Weight kg'].map((n) =>
    n.toLowerCase(),
  ),
)

export interface Load {
  /** what goes on the trailer, each part with its own weight off the price list */
  parts: Array<{ said: string; kg: number }>
  /** their sum; null where the boat is not weighed */
  kg: number | null
  /** the boat's figure is already the whole rig on the road (a tow weight) */
  towed: boolean
  /** the motor counted in, by its model; '' for none */
  motor: string
  /** one sentence: what is counted and what is left out */
  says: string
}

export interface Tow {
  key: string
  /** the trailer's ATM; null where the price list gives none */
  rated: number | null
  /** the trailer's own weight (its tare); null where the price list gives none */
  own: number | null
  /** what stands against the ATM: the load and, where it is not already in, the trailer itself */
  total: number | null
  standing: 'clears' | 'over' | 'unknown'
  says: string
}

const numberIn = (row: RowData | undefined, field: FieldDef | null | undefined): number | null => {
  if (!row || !field) return null
  const v = readCell(row, field.id)
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null
}

const fieldNamed = (entity: EntityDef, name: string): FieldDef | undefined =>
  entity.fields.find((f) => f.name.trim().toLowerCase() === name.toLowerCase())

/** What this boat puts on a trailer: the boat, and the motor that comes on a new quote. */
export function loadOf(ctx: CatalogueCtx, fit: BoatFit): Load {
  const root = ctx.entities[fit.place.tableId]
  const row = (ctx.rowsByEntity[fit.place.tableId] ?? []).find((r) => r.id === fit.place.rowId)
  const field = root ? loadFieldFor(root, TRAILER_ATM_FLOOR) : null
  const boatKg = root && field ? numberIn(row, field) : null
  if (boatKg === null) {
    return { parts: [], kg: null, towed: false, motor: '', says: BOAT_NOT_WEIGHED }
  }
  const boat = fit.name
  if (field && TOWED.has(field.name.trim().toLowerCase())) {
    return {
      parts: [{ said: `the ${boat} on the road`, kg: boatKg }],
      kg: boatKg,
      towed: true,
      motor: '',
      says: `The price list gives the ${boat} on the road, with its motor and trailer, as ${figure(boatKg)} kg dry, before fuel and gear.`,
    }
  }
  const motor = fit.motor
  const table = motor ? ctx.entities[motor.tableId] : undefined
  const star = motor?.made.find((m) => m.starred && !refusedByRule(m)) ?? null
  const motorRow =
    star && table
      ? (ctx.rowsByEntity[table.id] ?? []).find((r) => r.id === star.place.rowId)
      : undefined
  const motorKg = table && motorRow ? motorFactsOf(table, motorRow).kg : null
  const model = star && table ? modelOf(star.name, makerOfTable(table)) : ''
  const parts = [{ said: `the ${boat}`, kg: boatKg }]
  if (star && motorKg !== null) parts.push({ said: `its ${model}`, kg: motorKg })
  const kg = parts.reduce((n, p) => n + p.kg, 0)
  const says = !star
    ? `The ${boat} weighs ${figure(boatKg)} kg. No motor comes on a new quote, so the weight below is the boat alone, before a motor, fuel and gear.`
    : motorKg === null
      ? `The ${boat} weighs ${figure(boatKg)} kg. Its ${model} has no weight on the price list, so the weight below is the boat alone, before its motor, fuel and gear.`
      : `The ${boat}, ${figure(boatKg)} kg, and its ${model}, ${figure(motorKg)} kg: ${figure(kg)} kg on the trailer, before fuel and gear.`
  return { parts, kg, towed: false, motor: model, says }
}

/** One trailer's ATM against what goes on it. A warning and never a removal, as the engine's own
 *  floor is (`trailerFitment.ts`, F9): a trailer made for this boat stays offered. */
export function towOf(ctx: CatalogueCtx, load: Load, trailer: TrailerMade): Tow {
  const entity = ctx.entities[trailer.place.tableId]
  const row = (ctx.rowsByEntity[trailer.place.tableId] ?? []).find(
    (r) => r.id === trailer.place.rowId,
  )
  const rated = entity ? numberIn(row, fieldNamed(entity, TRAILER_ATM_FLOOR.capacity)) : null
  const own = entity ? numberIn(row, fieldNamed(entity, 'Tare (Kg)')) : null
  const key = trailer.key
  if (rated === null) {
    return { key, rated, own, total: null, standing: 'unknown', says: TRAILER_NOT_RATED }
  }
  if (load.kg === null) {
    return { key, rated, own, total: null, standing: 'unknown', says: `Rated ${figure(rated)} kg.` }
  }
  const total = load.towed || own === null ? load.kg : load.kg + own
  const gap = rated - total
  const standing = gap >= 0 ? 'clears' : 'over'
  const margin = gap >= 0 ? `${figure(gap)} kg to spare` : `${figure(-gap)} kg over it`
  const says = load.towed
    ? `Rated ${figure(rated)} kg: ${margin}.`
    : own === null
      ? `Rated ${figure(rated)} kg. Its own weight is not on the price list, so it is left out: ${margin}.`
      : `Rated ${figure(rated)} kg. With its own weight, ${figure(own)} kg by the price list, ${figure(total)} kg on the road: ${margin}.`
  return { key, rated, own, total, standing, says }
}
