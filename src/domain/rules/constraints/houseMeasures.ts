/* ============================================================
   THE PRICE LIST'S OWN CLAUSES, MEASURED ON THE SHEET THAT IS LOADED —
   each with the offers that break it, by name, and the line each one
   is written on.

   ── WHY THIS FILE EXISTS ──────────────────────────────────────

   /rules printed each of the price list's clauses with the figure the
   adjudication put on the workbook (`ruleLedger.ts`: "nothing here is
   a new measurement"). That figure is the workbook's, not the sheet's:
   after Shelf brings in a new price list, "581 of 581, each measured
   on it" would still print, and the 16, the 3 and the 127 that break a
   clause could never be named, because a constant names nothing
   (judge.md, data round, 2026-11-03, J2 and missing item 1).

   So each clause this sheet can test is counted HERE, on every call,
   off the price list's own offers — a boat and the motor, trailer, kit
   or part it names beside it — and every offer that breaks it is kept
   with its boat, what it offers, why it breaks, and the line it is
   written on, so a screen can open the clause on its exceptions and
   send the reader to the line.

   ── WHAT IS COUNTED ───────────────────────────────────────────

   An OFFER is one line of a pairing list whose boat and partner are
   both on sale on live lists — the denominator every screen counts by
   (`pairRules.ts`). A clause is TESTED on an offer only where the
   sheet writes both things it compares; a blank is never a break. The
   figure therefore moves with the sheet, and it is the sheet's.

   Two clauses cannot be tested on any sheet this app reads, and are
   said so rather than measured: A3 (a boat's propeller is one the
   motor is offered with — the motor list writes "Opt" for its
   propeller on 181 of 209 Yamahas, so there is nothing to compare
   with) and A4–S2 (not about what may be sold with what, and Review's
   to show). The screen prints the workbook's own figure for A3 and
   names the workbook it was measured on.

   Pure. No React, no store, no DOM.
   ============================================================ */

import { isDiscontinued, isRetired, readCell } from '@/domain/model'
import type { EntityDef, FieldDef, RowData, TableKind } from '@/domain/model'
import {
  TRAILER_ATM_FLOOR,
  bannerOf,
  loadFieldFor,
  marqueOfBanner,
  marqueOfSubject,
  marqueVocabulary,
  type Marque,
} from '@/domain/fitment/trailerFitment'
import { boatSaid, thingSaid, valueText, type PairWorld } from './pairRules'
import { figureOf, specByKey, specCellOf, specValue, valueSaid } from './pairSpecs'
import type { WorkbookRuleRef } from './workbookRules'

/* ---------------------------------------------------------- */
/* The offers                                                  */
/* ---------------------------------------------------------- */

interface Thing {
  table: EntityDef
  row: RowData
}

/** One offer: a boat, what the price list names beside it, and the line that names it. */
interface Offer {
  boat: Thing
  partner: Thing
  /** the pairing list and its line */
  join: Thing
}

const live = (t: EntityDef): boolean => !isRetired(t)

const fieldNamed = (t: EntityDef, name: string): FieldDef | undefined =>
  t.fields.find((f) => f.name.trim().toLowerCase() === name.toLowerCase())

const OFFERS = new WeakMap<PairWorld['rowsByEntity'], Map<string, Offer[]>>()

/** Every offer between a boat and one kind of partner, on sale on both sides — walked once per
 *  sheet and kinds. */
function offersOf(world: PairWorld, kinds: readonly TableKind[]): Offer[] {
  let byKinds = OFFERS.get(world.rowsByEntity)
  if (!byKinds) {
    byKinds = new Map()
    OFFERS.set(world.rowsByEntity, byKinds)
  }
  const key = kinds.join('+')
  const hit = byKinds.get(key)
  if (hit) return hit
  const out = walkOffers(world, kinds)
  byKinds.set(key, out)
  return out
}

function walkOffers(world: PairWorld, kinds: readonly TableKind[]): Offer[] {
  const at = new Map<string, Thing>()
  for (const table of Object.values(world.entities)) {
    if (!live(table) || (table.kind !== 'boat' && !kinds.includes(table.kind ?? 'custom'))) continue
    for (const row of world.rowsByEntity[table.id] ?? [])
      if (!isDiscontinued(row)) at.set(`${table.id}|${row.id}`, { table, row })
  }
  const byRow = new Map<string, Thing>()
  for (const [key, thing] of at) byRow.set(key.split('|')[1]!, thing)
  const out: Offer[] = []
  for (const join of Object.values(world.entities)) {
    if (join.role !== 'join' || !live(join)) continue
    const refs = join.fields.filter((f) => f.type === 'reference' && f.refEntityId)
    const toBoat = refs.find((f) => world.entities[f.refEntityId!]?.kind === 'boat')
    const toPartner = refs.find(
      (f) => f !== toBoat && kinds.includes(world.entities[f.refEntityId!]?.kind ?? 'custom'),
    )
    if (!toBoat || !toPartner) continue
    for (const row of world.rowsByEntity[join.id] ?? []) {
      const boat = byRow.get(valueText(readCell(row, toBoat.id)))
      const partner = byRow.get(valueText(readCell(row, toPartner.id)))
      if (!boat || !partner || boat.table.kind !== 'boat') continue
      if (!kinds.includes(partner.table.kind ?? 'custom')) continue
      out.push({ boat, partner, join: { table: join, row } })
    }
  }
  return out
}

/** Each list's rows by id, read once per sheet: a kit is found by its id on every motor offer. */
const ROWS = new WeakMap<readonly RowData[], Map<string, RowData>>()
function rowById(rows: readonly RowData[], id: string): RowData | undefined {
  let at = ROWS.get(rows)
  if (!at) {
    at = new Map(rows.map((r) => [r.id, r]))
    ROWS.set(rows, at)
  }
  return at.get(id)
}

/** The rigging kit a motor offer names, where it names one that is on sale. */
function kitOf(world: PairWorld, offer: Offer): Thing | null {
  const ref = offer.join.table.fields.find(
    (f) => f.type === 'reference' && world.entities[f.refEntityId ?? '']?.kind === 'accessory',
  )
  if (!ref) return null
  const table = world.entities[ref.refEntityId!]!
  const id = valueText(readCell(offer.join.row, ref.id))
  const row = rowById(world.rowsByEntity[table.id] ?? [], id)
  return row && !isDiscontinued(row) && live(table) ? { table, row } : null
}

/** A thing as every screen names it, said once per row. */
const SAID = new WeakMap<RowData, string>()
function said(t: Thing): string {
  const hit = SAID.get(t.row)
  if (hit !== undefined) return hit
  const out = thingSaid(t.table, t.row)
  SAID.set(t.row, out)
  return out
}

/* ---------------------------------------------------------- */
/* One clause, measured                                        */
/* ---------------------------------------------------------- */

/** One offer that breaks a clause — or, on a clause never refused, one that sits under it. */
export interface Exception {
  /** the boat as a person says its model: "Highfield Classic 340" */
  boat: string
  /** what is offered beside it, as every screen names it: "Yamaha F25SWTC" */
  what: string
  /** why it breaks, in the dealer's words: "a 25″ shaft on a 20″ transom" */
  why: string
  /** the pairing list and the line the offer is written on, for the sheet's `?at=` */
  list: string
  listName: string
  line: string
  /**
   * THE TWO LINES THAT WRITE WHAT IS IN CONFLICT (verify 1, data round, J2: "the door lands on
   * the pairing line, which shows neither the shaft nor the transom in conflict"). The pairing
   * line names the boat and the motor; the transom is written on the boat's own line and the
   * shaft on the motor's, so a fix is made on one of these two — each named by what it writes.
   */
  sides: ExceptionSide[]
}

/** One line of the price list that writes one of the two values a clause compares. */
export interface ExceptionSide {
  /** whose line it is, as the dealer says it: "boat", "motor", "trailer", "kit" */
  noun: string
  /** what that line writes that the clause reads: "transom", "shaft"; '' where the line itself
   *  is the thing (a kit, whose name or range is the reading) */
  what: string
  list: string
  listName: string
  line: string
  /** THE CELL IN CONFLICT, where one cell writes it: the list's own column, its heading and what
   *  it writes there ("Shaft Lgth", "XL"), so the door to the line says what to look for on it (verify 2, data round, J2). Absent for a kit, whose line
   *  itself is the reading. */
  field?: string
  header?: string
  written?: string
}

export interface HouseMeasure {
  ref: WorkbookRuleRef
  /** offers it holds on */
  held: number
  /** offers the sheet writes both sides of, so it can be tested on them */
  tested: number
  /** a clause never refused is drawn by what sits under it: `tested - held` */
  under: boolean
  /** what was counted, as a noun the figure stands in front of */
  counted: string
  /** every offer that breaks it (or sits under it), sorted by boat then what */
  exceptions: Exception[]
}

const byName = (a: string, b: string): number => a.localeCompare(b, 'en-AU', { numeric: true })

/** One of the two lines a clause reads, named by whose it is and what it writes. */
const sideOf = (t: Thing, noun: string, what: string, by?: string | FieldDef): ExceptionSide => {
  const cell =
    typeof by === 'string'
      ? specCellOf(spec(by), t.table, t.row)
      : by
        ? { field: by.id, header: by.name.trim(), written: valueText(readCell(t.row, by.id)) }
        : null
  return {
    noun,
    what,
    list: t.table.id,
    listName: t.table.name.trim(),
    line: t.row.id,
    ...(cell && cell.written !== '' ? cell : {}),
  }
}

function exceptionOf(
  offer: Offer,
  what: string,
  why: string,
  sides: readonly ExceptionSide[],
): Exception {
  return {
    boat: boatSaid(offer.boat.table, offer.boat.row),
    what,
    why,
    list: offer.join.table.id,
    listName: offer.join.table.name.trim(),
    line: offer.join.row.id,
    sides: [...sides],
  }
}

function measured(
  ref: WorkbookRuleRef,
  counted: string,
  tested: number,
  exceptions: Exception[],
  under = false,
): HouseMeasure {
  exceptions.sort((a, b) => byName(a.boat, b.boat) || byName(a.what, b.what))
  return { ref, held: tested - exceptions.length, tested, under, counted, exceptions }
}

const spec = (key: string) => {
  const s = specByKey(key)
  if (!s) throw new Error(`no spec ${key}`)
  return s
}

const read = (key: string, t: Thing): string | number | null => specValue(spec(key), t.table, t.row)

const same = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase()

/* F8 — a boat is offered trailers from a series built for its own brand */
function seriesForBrand(world: PairWorld): HouseMeasure {
  const project = world as unknown as Parameters<typeof marqueVocabulary>[0]
  const marques = marqueVocabulary(project, { subjectKind: 'boat', partnerKind: 'trailer' })
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['trailer'])) {
    const named = marqueOfBanner(bannerOf(offer.partner.table, offer.partner.row), marques)
    if (!named) continue
    tested += 1
    const own = marqueOfSubject(offer.boat.table, offer.boat.row, marques)
    if (own && own.name === named.name) continue
    out.push(
      exceptionOf(offer, said(offer.partner), `its series is built for ${named.name}`, [
        sideOf(offer.partner, 'trailer', 'series', 'trailer::series'),
      ]),
    )
  }
  return measured(
    'F8',
    'trailer offers on today’s boats whose series names a boat maker',
    tested,
    out,
  )
}

/* F9 — a trailer rated under the boat's weight is never refused: what sits under it */
function underTheBoat(world: PairWorld): HouseMeasure {
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['trailer'])) {
    const loadField = loadFieldFor(offer.boat.table, TRAILER_ATM_FLOOR)
    const atmField = fieldNamed(offer.partner.table, TRAILER_ATM_FLOOR.capacity)
    if (!loadField || !atmField) continue
    const load = figureOf(readCell(offer.boat.row, loadField.id))
    const atm = figureOf(readCell(offer.partner.row, atmField.id))
    if (load === null || atm === null) continue
    tested += 1
    if (atm >= load) continue
    out.push(
      exceptionOf(
        offer,
        said(offer.partner),
        `rated ${atm.toLocaleString('en-AU')} kg for a ${load.toLocaleString('en-AU')} kg boat`,
        [
          sideOf(offer.boat, 'boat', 'weight', loadField),
          sideOf(offer.partner, 'trailer', 'ATM', atmField),
        ],
      ),
    )
  }
  return measured(
    'F9',
    'trailer offers on today’s boats that state both weights are rated under the boat',
    tested,
    out,
    true,
  )
}

/** The slot a motor offer stands in: 1 is the boat's standard motor. */
const slotOf = (offer: Offer): number | null => {
  const f = fieldNamed(offer.join.table, 'Order')
  if (!f) return null
  const n = figureOf(readCell(offer.join.row, f.id))
  return n === null ? null : n
}

/** "an extra-long", "a long" */
const an = (word: string): string => `${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}`

const hpSaid = (n: number): string => `${n.toLocaleString('en-AU')} hp`

/* A1 — a boat's standard and first-choice motors are within its max hp */
function withinMaxHp(world: PairWorld): HouseMeasure {
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['motor'])) {
    const slot = slotOf(offer)
    if (slot !== 1 && slot !== 2) continue
    const max = read('boat::max-hp', offer.boat)
    const hp = read('motor::hp', offer.partner)
    if (typeof max !== 'number' || typeof hp !== 'number') continue
    tested += 1
    if (hp <= max) continue
    out.push(
      exceptionOf(offer, said(offer.partner), `${hpSaid(hp)} on a boat rated to ${hpSaid(max)}`, [
        sideOf(offer.boat, 'boat', 'horsepower rating', 'boat::max-hp'),
        sideOf(offer.partner, 'motor', 'horsepower', 'motor::hp'),
      ]),
    )
  }
  return measured('A1', 'standard and first-choice motor offers on today’s boats', tested, out)
}

/* A2 — a motor under the boat's lowest rated horsepower is never refused: what sits under it */
function underMinHp(world: PairWorld): HouseMeasure {
  const minField = (t: Thing): FieldDef | undefined => fieldNamed(t.table, 'Min HP') ?? undefined
  const minHp = (t: Thing): number | null => {
    const f = minField(t)
    return f ? figureOf(readCell(t.row, f.id)) : null
  }
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['motor'])) {
    if (slotOf(offer) !== 1) continue
    const min = minHp(offer.boat)
    const hp = read('motor::hp', offer.partner)
    if (min === null || typeof hp !== 'number') continue
    tested += 1
    if (hp >= min) continue
    out.push(
      exceptionOf(offer, said(offer.partner), `${hpSaid(hp)} on a boat rated from ${hpSaid(min)}`, [
        sideOf(offer.boat, 'boat', 'lowest rating', minField(offer.boat)),
        sideOf(offer.partner, 'motor', 'horsepower', 'motor::hp'),
      ]),
    )
  }
  return measured(
    'A2',
    'standard motor offers on today’s boats sit under it, on purpose',
    tested,
    out,
    true,
  )
}

/* F6 — a motor's shaft is the length the boat's transom is cut for */
function shaftForTransom(world: PairWorld): HouseMeasure {
  const shaft = spec('boat::shaft')
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['motor'])) {
    const boat = read('boat::shaft', offer.boat)
    const motor = read('motor::shaft', offer.partner)
    if (typeof boat !== 'string' || typeof motor !== 'string') continue
    tested += 1
    if (boat === motor) continue
    out.push(
      exceptionOf(
        offer,
        said(offer.partner),
        `${an(valueSaid(shaft, motor))} shaft on ${an(valueSaid(shaft, boat))} transom`,
        [
          sideOf(offer.boat, 'boat', 'transom', 'boat::shaft'),
          sideOf(offer.partner, 'motor', 'shaft', 'motor::shaft'),
        ],
      ),
    )
  }
  return measured('F6', 'motor offers on today’s boats, factory packages aside', tested, out)
}

const TILLER = 'Tiller handle'

/* F7 — a boat steered from a remote helm is never given a tiller motor */
function remoteNoTiller(world: PairWorld): HouseMeasure {
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['motor'])) {
    const steering = read('boat::steering', offer.boat)
    const controls = read('motor::controls', offer.partner)
    if (typeof steering !== 'string' || !same(steering, 'Remote')) continue
    if (typeof controls !== 'string') continue
    tested += 1
    if (!same(controls, TILLER)) continue
    out.push(
      exceptionOf(offer, said(offer.partner), 'a tiller motor on a remote boat', [
        sideOf(offer.boat, 'boat', 'steering', 'boat::steering'),
        sideOf(offer.partner, 'motor', 'controls', 'motor::controls'),
      ]),
    )
  }
  return measured('F7', 'motor offers on today’s remote boats', tested, out)
}

/* F15 — a boat's rigging kit comes from the range built for its brand */
function kitForBrand(world: PairWorld): HouseMeasure {
  /* THE KIT LISTS ONLY: a range is read off the lists a motor offer names its kit from, never
     the 2,937 parts, whose categories name no boat maker's range */
  const kitLists = new Set<string>()
  for (const join of Object.values(world.entities))
    for (const f of join.role === 'join' ? join.fields : [])
      if (f.type === 'reference' && world.entities[f.refEntityId ?? '']?.kind === 'accessory') {
        const motorSide = join.fields.some(
          (g) => g.type === 'reference' && world.entities[g.refEntityId ?? '']?.kind === 'motor',
        )
        if (motorSide) kitLists.add(f.refEntityId!)
      }
  const entities = Object.fromEntries(
    Object.entries(world.entities).filter(([id, t]) => t.kind === 'boat' || kitLists.has(id)),
  )
  /* a vocabulary reads banners only, so each kit list is handed one row per range it writes */
  const rowsByEntity: Record<string, readonly RowData[]> = { ...world.rowsByEntity }
  for (const id of kitLists) {
    const table = world.entities[id]!
    const seen = new Set<string>()
    rowsByEntity[id] = (world.rowsByEntity[id] ?? []).filter((r) => {
      if (isDiscontinued(r)) return false
      const banner = bannerOf(table, r)
      if (seen.has(banner)) return false
      seen.add(banner)
      return true
    })
  }
  const project = { entities, rowsByEntity } as unknown as Parameters<typeof marqueVocabulary>[0]
  const marques: Marque[] = marqueVocabulary(project, {
    subjectKind: 'boat',
    partnerKind: 'accessory',
  })
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['motor', 'package'])) {
    const kit = kitOf(world, offer)
    if (!kit) continue
    const named = marqueOfBanner(bannerOf(kit.table, kit.row), marques)
    if (!named) continue
    tested += 1
    const own = marqueOfSubject(offer.boat.table, offer.boat.row, marques)
    if (own && own.name === named.name) continue
    out.push(
      exceptionOf(offer, said(kit), `a kit from the ${named.name} range`, [sideOf(kit, 'kit', '')]),
    )
  }
  return measured(
    'F15',
    'rigging kit offers on today’s boats whose range names a boat maker',
    tested,
    out,
  )
}

const MECHANICAL = /^(remote\s+)?mech/i
const HELM_MASTER = /helm\s*master/i

/* F16 — a motor with mechanical controls never takes a Helm Master rigging kit */
function mechanicalNoHelmMaster(world: PairWorld): HouseMeasure {
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['motor', 'package'])) {
    const kit = kitOf(world, offer)
    if (!kit) continue
    const controls = read('motor::controls', offer.partner)
    if (typeof controls !== 'string' || !MECHANICAL.test(controls)) continue
    tested += 1
    const words = `${bannerOf(kit.table, kit.row)} ${said(kit)}`
    if (!HELM_MASTER.test(words)) continue
    out.push(
      exceptionOf(offer, said(kit), `a Helm Master kit on a ${controls} motor`, [
        sideOf(offer.partner, 'motor', 'controls', 'motor::controls'),
        sideOf(kit, 'kit', ''),
      ]),
    )
  }
  return measured('F16', 'rigging kit offers on a mechanical-control motor', tested, out)
}

/** A pre-delivery part that is two batteries' worth: "2 x MFM70 Batteries", "(2 pairs)". */
const TWO_BATTERIES = /\b2\s*x\b.*batter|batter.*\(2 pairs\)/i

/* F12 — a tiller boat never gets a two-battery pre-delivery kit */
function tillerOneBattery(world: PairWorld): HouseMeasure {
  let tested = 0
  const out: Exception[] = []
  for (const offer of offersOf(world, ['accessory'])) {
    const what = said(offer.partner)
    if (!TWO_BATTERIES.test(what)) continue
    const steering = read('boat::steering', offer.boat)
    if (typeof steering !== 'string') continue
    tested += 1
    if (!same(steering, 'Tiller')) continue
    out.push(
      exceptionOf(offer, what, 'two batteries’ kit on a tiller boat', [
        sideOf(offer.boat, 'boat', 'steering', 'boat::steering'),
        sideOf(offer.partner, 'kit', ''),
      ]),
    )
  }
  return measured('F12', 'two-battery pre-delivery kit offers on today’s boats', tested, out)
}

const MEASURES: Partial<Record<WorkbookRuleRef, (world: PairWorld) => HouseMeasure>> = {
  F8: seriesForBrand,
  F9: underTheBoat,
  A1: withinMaxHp,
  A2: underMinHp,
  F6: shaftForTransom,
  F7: remoteNoTiller,
  F15: kitForBrand,
  F16: mechanicalNoHelmMaster,
  F12: tillerOneBattery,
}

/**
 * ONE CLAUSE, MEASURED ON THE SHEET AS IT STANDS — or null where this sheet cannot test it at
 * all (A3, and any clause not about what may be sold with what). A clause whose figure the sheet
 * can test on no offer at all (tested 0) is returned as it is: "0 of 0" is the truth about a
 * sheet that writes neither side, and the screen says so.
 */
export function measureClause(ref: WorkbookRuleRef, world: PairWorld): HouseMeasure | null {
  const measure = MEASURES[ref]
  if (!measure) return null
  /* ONCE PER SHEET: the rows are one object per load, so a figure is counted again only when the
     price list it is counted on changes */
  let byRef = MEASURED.get(world.rowsByEntity)
  if (!byRef) {
    byRef = new Map()
    MEASURED.set(world.rowsByEntity, byRef)
  }
  const hit = byRef.get(ref)
  if (hit) return hit
  const out = measure(world)
  byRef.set(ref, out)
  return out
}

const MEASURED = new WeakMap<PairWorld['rowsByEntity'], Map<WorkbookRuleRef, HouseMeasure>>()

/** Whether a clause is measured on the sheet (true) or only on the workbook (false). */
export const measuredLive = (ref: WorkbookRuleRef): boolean => MEASURES[ref] !== undefined

/* ---------------------------------------------------------- */
/* What each clause does in the build                          */
/* ---------------------------------------------------------- */

/**
 * WHAT THE BUILD DOES WITH ONE OF THE PRICE LIST'S CLAUSES (judge.md, J14: "a price-list clause
 * carries its measure and nothing about whether the build enforces it"). Read off what the build
 * is, never typed per figure:
 *
 *   lists    the build's list for the boat IS the price list's own offers (`freeze.ts`,
 *            `outsideWhy`: "the pairings ARE the menu"), so the clause holds in the build where it
 *            holds on the sheet. Something chosen past the list is not checked against it.
 *   says     never refused; the build says so where it is broken.
 *   nothing  nobody wrote it down: a pattern in the values, and the build does nothing with it
 *            until Northside says it as its own.
 */
export type BuildDoes = 'lists' | 'says' | 'nothing'

export const BUILD_DOES: Partial<Record<WorkbookRuleRef, { does: BuildDoes; said: string }>> = {
  F8: {
    does: 'lists',
    said: 'The trailers offered are the ones your price list pairs with the boat. One chosen past the list is said as not paired, never refused.',
  },
  /* A CLAUSE THAT ALREADY SAYS WHAT THE BUILD DOES is not said twice (its own words carry
     "never refused" and where it is said), so its line is the verdict alone */
  F9: { does: 'says', said: '' },
  A1: {
    does: 'lists',
    said: 'The motors offered are the ones your price list pairs with the boat. One chosen past the list over the boat’s horsepower is said as outside it, never refused.',
  },
  A2: { does: 'says', said: '' },
  F6: {
    does: 'lists',
    said: 'The motors offered are the ones your price list pairs with the boat. One chosen past the list is not checked against the transom.',
  },
  F7: { does: 'nothing', said: '' },
  F15: { does: 'lists', said: 'The kit comes with the motor as your price list pairs them.' },
  F16: { does: 'nothing', said: '' },
  A3: { does: 'lists', said: 'The propeller comes with the motor as your price list pairs them.' },
  F12: { does: 'nothing', said: '' },
}

/* ---------------------------------------------------------- */
/* The exceptions, as a reader takes them                      */
/* ---------------------------------------------------------- */

/** One break, said once: a boat, what it is offered and why it breaks — with every line of the
 *  price list that writes it (a model's colourways each write it again). */
export interface ExceptionGroup {
  boat: string
  what: string
  why: string
  lines: { list: string; listName: string; line: string }[]
  /** the lines that write what is in conflict, off the group's first offer — the same first
   *  offer whose pairing line is "Its first line" */
  sides: ExceptionSide[]
}

/** The exceptions said once each, in the measure's own order, every line kept. */
export function groupExceptions(exceptions: readonly Exception[]): ExceptionGroup[] {
  const out: ExceptionGroup[] = []
  const at = new Map<string, ExceptionGroup>()
  for (const e of exceptions) {
    const key = `${e.boat}|${e.what}|${e.why}`
    let group = at.get(key)
    if (!group) {
      group = { boat: e.boat, what: e.what, why: e.why, lines: [], sides: e.sides }
      at.set(key, group)
      out.push(group)
    }
    group.lines.push({ list: e.list, listName: e.listName, line: e.line })
  }
  return out
}
