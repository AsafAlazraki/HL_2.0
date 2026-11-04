/* ============================================================
   ONE BOAT, AND WHAT CAN BE FITTED TO IT — the reading the fitment
   screen draws, with every struck thing carrying the reason it was
   struck.

   WHAT THIS FILE IS. Not a new engine. Every reason on it comes out of
   one that already exists, called the way the build already calls it:

     · what the price list makes for this boat — `relatedRows` over the
       boat page's own blocks, the call `candidateOffer` makes, priced
       by `mintLine` at the boat's own price, so a figure here is the
       figure the build would put on the quote;
     · which trailers are built for it — `selectPartners` (F8, the
       series banner) with the ATM floor (F9), which RECORDS THE REASON
       AT THE MOMENT IT DECIDES: built for this maker, built for
       another, names no maker, held back;
     · which motors its own row says it takes — `envelope.ts`;
     · what a dealer's own rule refuses — `readRig`, the solver that
       records `{ constraintId, because }` the moment it prunes a value;
     · which trailer goes on a new quote — `whatComesAcross`.

   and every sentence comes from `say.ts`. The screen writes none.

   ONE UNIVERSE PER LIST, AND THE PARTS ADD UP TO IT (the fitment
   verdict's must-change). Board C said "12 of 434" and "the other 432"
   over four counted reasons that summed to 442, because the ten trailers
   no longer sold sit outside the 434 on sale. Here the universe is what
   is ON SALE, and `made + Σ groups = onSale` is asserted by the test on
   the real price list; what is no longer sold is said separately and
   never added in.
   ============================================================ */

import { isDiscontinued, isRetired, readCell, rowLabel } from '@/domain/model'
import type {
  CatalogueCtx,
  ConstraintDef,
  EntityDef,
  RowData,
  TableKind,
  ViewBlock,
} from '@/domain/model'
import { joinRefFor, makeEngine, relatedRows, type JoinRef } from '@/domain/catalogue/views'
import { defaultBlocksFor } from '@/domain/catalogue/views/relations'
import { defaultLevelKey } from '@/domain/quote/pricing'
import { mintLine } from '@/domain/quote/freeze'
import { lineLevelSaid } from '@/domain/quote/levelSaid'
import { lineSaid, spokenBoat, spokenModel } from '@/domain/quote/spoken'
import { modelKeyOf } from '@/domain/quote/boats'
import { makerOfTable } from '@/domain/catalogue/makers'
import { trailOf } from '@/domain/modules/read'
import { goodsFacts } from '@/domain/quote/goodsFacts'
import { nameOnPaper } from '@/domain/quote/paperWords'
import { envelopeOf, measureRig, rigOf, type HullEnvelope } from './envelope'
import {
  NAMES_NO_MAKER,
  NOT_MADE_FOR_IT,
  ONE_TRAILER,
  RULE_REFUSES,
  envelopeSaid,
  floorSaid,
  hullEnvelopeSaid,
  motorHeldSaid,
  seriesSaid,
  sayVerdict,
  type MotorHeldId,
} from './say'
import { whatComesAcross } from './oneTrailer'
import {
  TRAILER_ATM_FLOOR,
  TRAILER_FITMENT,
  loadFieldFor,
  marqueVocabulary,
  selectPartners,
  type FloorVerdict,
  type Marque,
  type PartnerVerdict,
} from './trailerFitment'
import { readRig } from './rigReading'
import { finishSaid } from './finish'
import { pairRuling } from '@/domain/rules/constraints/pairRules'
import { PAIR_SPECS, specValue, type PairSpec } from '@/domain/rules/constraints/pairSpecs'
import { unchosenOn, type SellFigure } from '@/domain/pricing/unchosen'
import { readFanOut } from './reading'

/* ---------------------------------------------------------- */
/* The shapes a screen draws                                   */
/* ---------------------------------------------------------- */

/** Where a thing lives on the price list, so the sheet can open on it. */
export interface Place {
  tableId: string
  rowId: string
}

/** A dealer's own rule that disagrees with a thing, by its own words. */
export interface RuleSaid {
  constraintId: string
  /** the rule's own clause; '' where it was written without one */
  because: string
  /** 'blocked' takes it off the build; 'warned' leaves it on */
  severity: 'blocked' | 'warned'
}

/**
 * ONE READING OF "A DEALER'S RULE REFUSES IT" (built-critique-m3.md, blocker 2). The plate's
 * count, the list drawn under it and the struck mark all ask this, so the figure and the list
 * cannot drift apart. A rule that only warns leaves a thing offered, as the build offers it.
 */
export const refusedByRule = (m: { rule: RuleSaid | null }): boolean =>
  m.rule?.severity === 'blocked'

/** What the build offers of a made list: everything no rule in force refuses, in its order. */
export const offeredIn = <T extends { rule: RuleSaid | null }>(made: readonly T[]): T[] =>
  made.filter((m) => !refusedByRule(m))

/** What a dealer's rule refuses of a made list, in its order. */
export const refusedIn = <T extends { rule: RuleSaid | null }>(made: readonly T[]): T[] =>
  made.filter(refusedByRule)

/** One thing the price list makes for this boat. */
export interface Made {
  /** the pairing where there is one, the row otherwise — unique in a list */
  key: string
  /** its place in the price list's own order for this boat, before the recommended is put first:
   *  what a row of tiles keeps, so a press of Recommend it never moves a tile under the pointer */
  at: number
  place: Place
  /** the pairing that makes it this boat's, for "open it on the price list" */
  pairing: Place | null
  /** as a dealer says it: "Yamaha F175XC" */
  name: string
  /** the price list's own string, for the workshop and for search */
  label: string
  /** what decides it, from its own row: "175 hp · 228 kg · 25″ shaft" */
  facts: string
  /** at this boat's own price, null where the line has no figure */
  price: number | null
  starred: boolean
  /** what the pairing carries beside it — the rigging kit, the prop */
  goesWith: Array<{ label: string; value: string }>
  /** a dealer's rule that refuses or flags it; null where none does */
  rule: RuleSaid | null
  /** THE PRICE NORTHSIDE HAS NOT CHOSEN (`unchosenOn`, the build's and Prices' one reading): the
   *  list names no price and the line holds sell figures. Null where it is priced, or holds none. */
  unchosen: SellFigure[] | null
}

/** What the price list makes for one of the boat's places, as the build offers it. */
export interface Offered {
  /** made for this boat and not refused by a rule in force — what the build offers. A thing a
   *  rule only warns about is offered, as the build offers it, with the warning. */
  offered: number
  /** made for this boat, and refused by one of the dealer's rules in force */
  refused: number
  /** how many of the dealer's rules do the refusing */
  rules: number
}

/**
 * THE COUNT OVER A LIST IS THE COUNT THE BUILD OFFERS (built-critique-m3.md, blocker 4). Fitment
 * said "3 of 209 made for this boat" over the Classic 340 while striking the F25SWTC with the
 * dealer's own rule in the same list, and the build's "Back to the 3 made for this boat" opened
 * on 2 offered. What a rule refuses is still drawn, struck, with its because — it is counted
 * apart, never as made for this boat, so the two screens say one number.
 */
export function offeredOf(made: readonly Made[]): Offered {
  const refusing = refusedIn(made)
  return {
    offered: offeredIn(made).length,
    refused: refusing.length,
    rules: new Set(refusing.map((m) => m.rule!.constraintId)).size,
  }
}

/** Every single-motor Yamaha, placed on the boat's horsepower axis. Inside the range and not made
 *  for it, a motor whose shaft is not the boat's own (`shaft`), or whose controls are not how the
 *  boat is steered (`steering`), is said as that: the file carries both cells (the fitment judge,
 *  2026-11-03: 10 of the SP660's 30 were a 20″ leg on a 25″ transom, said as "not made for it"). */
export type DotStanding = 'made' | 'inside' | 'shaft' | 'steering' | 'under' | 'over' | 'unplaced'

export interface MotorDot {
  key: string
  place: Place
  name: string
  hp: number
  standing: DotStanding
  starred: boolean
  /** why it is not offered on this boat; '' for one that is made for it */
  because: string
  /** a dealer's rule that refuses it, where one does */
  rule: RuleSaid | null
}

export interface MotorFit {
  tableId: string
  tableName: string
  /** the list that says which motors go with this boat */
  pairingTableId: string | null
  envelope: HullEnvelope | null
  /** "150–200 hp", '' where the boat's row states none */
  takes: string
  made: Made[]
  /** THE RIGGING KIT EACH MOTOR'S OWN PAIRING NAMES, keyed by the pairing (`Made.key`): the list
   *  the boat's page reads through the motor's own pairing, priced as the build prices it */
  kits: Map<string, Made>
  /** THE RIGGING KIT A PAIRING NAMES THAT THE PRICE LIST MARKS NO LONGER SOLD, keyed the same way
   *  (the fitment verifier, 2026-11-03: 146 Yamaha pairings on 30 boats name one, and the tile said
   *  the pairing named no kit). Never offered and never priced: named, so a tile can say so. */
  retiredKits: Map<string, Made>
  /** the boat's own shaft and steering, as the trade says them: "extra-long (25″)", "remote" */
  boatShaft: string
  boatSteering: string
  /** every live single motor with a horsepower, lightest first */
  dots: MotorDot[]
  counts: {
    live: number
    /** made for this boat and offered: a motor a dealer's rule refuses is counted in `refused` */
    made: number
    /** made for this boat, and refused by one of the dealer's rules in force */
    refused: number
    inside: number
    /** inside the range, not made for it, and a shaft the boat's transom does not take */
    shaft: number
    /** inside the range, not made for it, and controls that are not how the boat is steered */
    steering: number
    under: number
    over: number
    /** single motors on a boat whose figures name no single-motor envelope */
    unplaced: number
    /** twin and triple rigs, which the boat's envelope cannot place
     *  unless its row names an envelope for that many motors */
    rigs: number
    /** rows whose rating is not a horsepower ("Electric") */
    unrated: number
  }
  /** why the twin and triple rigs are counted rather than drawn */
  rigsSay: string
  /** twin and triple rigs the price list makes for this boat, offered with the single motors */
  madeRigs: number
}

export interface TrailerMember {
  key: string
  place: Place
  name: string
  /** the series banner, verbatim: the price list's own deciding cell */
  series: string
  because: string
  /** 'another' only: the maker its series names — a range a maker sells under ("Cap Camarat")
   *  is counted under its maker ("Jeanneau"), never as a maker of its own; '' elsewhere */
  maker: string
}

export interface TrailerMaker {
  maker: string
  count: number
  /** the first of its trailers in the price list's own order (series, then name), so the struck
   *  example is the same one on every load */
  example: TrailerMember
  /** the reason none of its trailers is offered, said once over them in Show all */
  because: string
}

export interface TrailerGroup {
  id: 'this' | 'unnamed' | 'another'
  count: number
  /** the reason, said once for the whole group */
  head: string
  /** every trailer in it, for Show all and for search */
  members: TrailerMember[]
  /** 'another' only: the makers its series name, most first */
  makers: TrailerMaker[]
}

export interface TrailerMade extends Made {
  floor: FloorVerdict['kind']
  /** "Rated 1,990 kg · the boat weighs 740 kg · clears it by 1,250 kg" */
  floorSays: string
  capacity: number | null
  /** this one starts a new quote — the star, or the one alone */
  crosses: boolean
}

export interface TrailerFit {
  lists: Array<{ tableId: string; name: string }>
  made: TrailerMade[]
  /** the one-trailer rule, said where a second trailer is offered; '' with one or none */
  oneTrailer: string
  /** the maker the boat's own rows name, as its trailers' series spell it */
  maker: string | null
  /** every trailer on sale: made.length + Σ groups.count */
  onSale: number
  groups: TrailerGroup[]
  /** the trailers on sale that are not offered for this boat: Σ groups.count */
  others: number
  /** no longer sold: said separately, never added into onSale */
  held: { count: number; lists: string[] }
  /** the same, as one sentence; '' where nothing is held back */
  heldSays: string
  boatWeight: number | null
}

export interface ListFit {
  tableId: string
  name: string
  kind: TableKind
  pairingTableId: string | null
  made: Made[]
  /** live rows of the list */
  live: number
}

export interface BoatFit {
  place: Place
  /** "Highfield SP660" */
  name: string
  /** "PVC · White / White / White-Black" */
  detail: string
  /** the price list's own string for it, which is what its lists are found by */
  label: string
  /** the maker's own words for where it sits: Sport › SP660 › PVC W-W-WB */
  path: string[]
  code: string
  /** the boat's own Image Link, for the one picture reader */
  imageAddress: string
  /** the price these figures are at, by its declared name ("Cash") */
  priceName: string
  /** the boat itself at that price, as the build's first line would carry it; null where none */
  price: number | null
  /** no longer sold: the boat itself says so, once */
  retired: boolean
  motor: MotorFit | null
  trailer: TrailerFit | null
  /** dealer fit, parts, and anything else the boat's page lists */
  lists: ListFit[]
  /** rules a dealer has written that are switched on */
  rulesInForce: number
}

/* ---------------------------------------------------------- */
/* Reading                                                     */
/* ---------------------------------------------------------- */

const AU = new Intl.NumberFormat('en-AU')
const count = (n: number): string => AU.format(n)

function blocksFor(ctx: CatalogueCtx, tableId: string): ViewBlock[] {
  const view = Object.values(ctx.views).find((v) => v.rootTableId === tableId)
  return view ? view.blocks : defaultBlocksFor(ctx.entities, tableId)
}

const textCell = (entity: EntityDef, row: RowData, name: string): string => {
  const field = entity.fields.find((f) => f.name.trim().toLowerCase() === name.toLowerCase())
  const v = field ? readCell(row, field.id) : null
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
}

export function imageAddressOf(entity: EntityDef, row: RowData): string {
  const field = entity.fields.find((f) => f.type === 'image')
  const v = field ? readCell(row, field.id) : null
  if (!Array.isArray(v)) return ''
  const first = v[0] as { src?: unknown } | undefined
  return typeof first?.src === 'string' ? first.src : ''
}

/** What a dealer's rules in force say about each row, keyed by row id.
 *  Empty, and nothing solved, where no rule is switched on. */
function rulesSay(ctx: CatalogueCtx, place: Place): Map<string, RuleSaid> {
  const out = new Map<string, RuleSaid>()
  const enabled = (ctx.constraintDefs ?? []).filter((c: ConstraintDef) => c.enabled !== false)
  if (enabled.length === 0) return out

  /* A RULE WRITTEN ON /rules IS READ THE WAY THE BUILD READS IT. Since 2026-10-22 such a rule
     names a spec — the boat's maker, steering, shaft or length, the motor's horsepower — which no
     single column carries (`pairSpecs.ts`), so the solver below cannot read it. `pairRuling` is
     the build's own reading, so Fitment strikes exactly what the build refuses, with the same
     because. Every other rule still goes to the solver as it always did. */
  const ruling = pairRuling(ctx, enabled)
  const paired = new Set(ruling.rules.map((r) => r.rule.id))
  const boatTable = ctx.entities[place.tableId]
  const boatRow = (ctx.rowsByEntity[place.tableId] ?? []).find((r) => r.id === place.rowId)
  if (ruling.rules.length > 0 && boatTable && boatRow) {
    const boat = { table: boatTable, row: boatRow }
    for (const table of Object.values(ctx.entities)) {
      if ((table.kind !== 'motor' && table.kind !== 'trailer') || isRetired(table)) continue
      for (const row of ctx.rowsByEntity[table.id] ?? []) {
        const said = ruling.pick(boat, { table, row })
        const by = said.refusedBy ?? said.warnedBy[0]
        if (!by) continue
        out.set(row.id, {
          constraintId: by.id,
          because: by.because,
          severity: said.refusedBy ? 'blocked' : 'warned',
        })
      }
    }
  }
  const rest = enabled.filter((c) => !paired.has(c.id))
  if (rest.length === 0) return out
  const reading = readRig({
    project: ctx,
    constraints: rest,
    reading: readFanOut(ctx),
    hull: place,
    chosen: {},
  })
  for (const catalogue of reading.catalogues) {
    for (const c of catalogue.candidates) {
      const first = c.reasons[0]
      if (c.verdict === 'offered' || !first || out.has(c.rowId)) continue
      out.set(c.rowId, {
        constraintId: first.constraintId,
        because: first.because,
        severity: c.verdict === 'refused' ? 'blocked' : 'warned',
      })
    }
  }
  return out
}

/* ONE COLLATOR EACH, made once: a `localeCompare` with a locale builds one per call, and the
   trailer order below sorts four hundred lines for every boat a whole-list check reads */
const WORDS = new Intl.Collator('en-AU')
/** "Classic 240" before "Classic 1000", as a person counts */
const COUNTED = new Intl.Collator('en-AU', { numeric: true, sensitivity: 'base' })

/* THE MARQUE VOCABULARY, READ ONCE PER PRICE LIST. It reads every boat and every trailer (about
   30ms), it is the same for every boat on one file, and a catalogue write replaces the lists it
   is keyed on, so a changed file is read afresh. */
const MARQUES = new WeakMap<object, WeakMap<object, Marque[]>>()
function marquesOf(ctx: CatalogueCtx): Marque[] {
  const byRows = MARQUES.get(ctx.entities) ?? new WeakMap<object, Marque[]>()
  MARQUES.set(ctx.entities, byRows)
  const had = byRows.get(ctx.rowsByEntity)
  if (had) return had
  const read = marqueVocabulary(ctx, TRAILER_FITMENT)
  byRows.set(ctx.rowsByEntity, read)
  return read
}

/**
 * Everything one boat can be fitted with, and why each thing it cannot
 * is struck. Null where the boat is not on the price list.
 */
export function readBoatFit(ctx: CatalogueCtx, place: Place): BoatFit | null {
  const root = ctx.entities[place.tableId]
  if (!root || root.kind !== 'boat') return null
  const row = (ctx.rowsByEntity[root.id] ?? []).find((r) => r.id === place.rowId)
  if (!row) return null

  const engine = makeEngine(ctx)
  const levelKey = defaultLevelKey(root)
  const rules = rulesSay(ctx, place)
  const spoken = spokenBoat(root.id, rowLabel(root, row))
  const path = (root.hierarchy ?? [])
    .map((id) => readCell(row, id))
    .filter((v): v is string => typeof v === 'string' && v.trim() !== '')

  /* every list the boat's page draws, read once */
  const read = blocksFor(ctx, root.id).flatMap((block) => {
    const target = ctx.entities[block.tableId]
    if (!target) return []
    const join = joinRefFor(ctx.entities, block.joinTableId, root.id, target.id)
    const result = relatedRows({
      ctx,
      engine,
      sourceEntity: root,
      sourceRow: row,
      targetEntityId: target.id,
      rule: block.rule,
      join,
    })
    return [{ block, target, join, result }]
  })

  /* the boat's own line, minted as the quote's first line is (`mintQuoteFromView`) */
  const subject = mintLine({ ctx, engine, entity: root, row, levelKey })
  let priceName = subject.unitPrice === null ? '' : lineLevelSaid(subject)
  /** One thing on one of the boat's lists, minted at the boat's own price through its pairing. */
  const madeFrom = (
    target: EntityDef,
    join: JoinRef | null,
    thing: RowData,
    joinRow: RowData | undefined,
    recommended: boolean,
    at: number,
  ): Made => {
    const line = mintLine({
      ctx,
      engine,
      entity: target,
      row: thing,
      levelKey,
      join,
      ...(joinRow ? { joinRow } : {}),
      recommended,
    })
    if (priceName === '' && line.unitPrice !== null) priceName = lineLevelSaid(line)
    return {
      key: joinRow?.id ?? thing.id,
      at,
      place: { tableId: target.id, rowId: thing.id },
      pairing: join && joinRow ? { tableId: join.entityId, rowId: joinRow.id } : null,
      /* the file's shorthand said in full, as the build and the paper say it (`nameOnPaper`;
         the fitment verifier, 2026-11-03: "6.6 Mtr" here, "6.6 m" on the build) */
      name: nameOnPaper(lineSaid(line.label, target.name)),
      label: line.label,
      facts: goodsFacts(target, thing),
      price: line.unitPrice,
      starred: recommended,
      goesWith: line.pairFacts ?? [],
      rule: rules.get(thing.id) ?? null,
      unchosen: line.unitPrice === null ? unchosenOn(target, thing) : null,
    }
  }
  const madeOf = (entry: (typeof read)[number]): Made[] => {
    const { target, join, result } = entry
    return result.rows
      .map((r, at) => {
        const joinRow =
          join && r.pair
            ? (ctx.rowsByEntity[join.entityId] ?? []).find((j) => j.id === r.pair?.rowId)
            : undefined
        return madeFrom(target, join ?? null, r.row, joinRow, r.recommended, at)
      })
      .sort((a, b) => Number(b.starred) - Number(a.starred))
  }

  /* ── the motor ── */
  const motorEntry = read.find((e) => e.target.kind === 'motor')
  const motorJoin = motorEntry?.join?.entityId
  /* the rigging kits ride on the motor's own pairing: one kit per pairing, keyed by it */
  const kitEntry = read.find(
    (e) => e.target.kind !== 'motor' && motorJoin !== undefined && e.join?.entityId === motorJoin,
  )
  const motorMade = motorEntry ? madeOf(motorEntry) : []
  /* EACH PAIRING'S OWN KIT, READ OFF ITS OWN ROW (the fitment verifier, 2026-11-03: on the
     Stabicraft 2350 the F225UCB's and the F250UCB's pairings both name kit 625, and a list read
     kit by kit holds one pairing per kit, so one of them "named no rigging kit"). A kit the price
     list no longer sells is kept apart: named, never priced, never offered. */
  const kits = new Map<string, Made>()
  const retiredKits = new Map<string, Made>()
  const kitJoin = kitEntry?.join ?? null
  if (kitEntry && kitJoin) {
    const kitTable = kitEntry.target
    const kitRows = new Map((ctx.rowsByEntity[kitTable.id] ?? []).map((r) => [r.id, r]))
    const joinRows = new Map((ctx.rowsByEntity[kitJoin.entityId] ?? []).map((r) => [r.id, r]))
    const joinTable = ctx.entities[kitJoin.entityId]
    const historic = isRetired(kitTable) || (joinTable !== undefined && isRetired(joinTable))
    for (const m of motorMade) {
      const joinRow = m.pairing ? joinRows.get(m.pairing.rowId) : undefined
      const kitId = joinRow ? readCell(joinRow, kitJoin.targetFieldId) : null
      const kitRow = typeof kitId === 'string' ? kitRows.get(kitId) : undefined
      if (!kitRow || !joinRow) continue
      const gone = historic || isDiscontinued(kitRow)
      const kit = madeFrom(kitTable, kitJoin, kitRow, joinRow, false, m.at)
      ;(gone ? retiredKits : kits).set(m.key, gone ? { ...kit, price: null, unchosen: null } : kit)
    }
  }
  const motor = motorEntry
    ? readMotor(ctx, root, row, motorEntry, motorMade, rules, kits, retiredKits)
    : null

  /* ── the trailers ── */
  const trailerEntries = read.filter((e) => e.target.kind === 'trailer')
  const trailer = readTrailers(ctx, root, row, place, trailerEntries, madeOf)

  /* ── everything else the page lists; a list carried on the motor's own
        pairing (the rigging kits) goes with the motor and is not its own ── */
  const lists: ListFit[] = read
    .filter((e) => e.target.kind !== 'motor' && e.target.kind !== 'trailer')
    .filter((e) => !(motorJoin && e.join?.entityId === motorJoin))
    .map((e) => ({
      tableId: e.target.id,
      name: e.target.name,
      kind: e.target.kind ?? 'custom',
      pairingTableId: e.join?.entityId ?? null,
      made: madeOf(e),
      live: isRetired(e.target)
        ? 0
        : (ctx.rowsByEntity[e.target.id] ?? []).filter((r) => !isDiscontinued(r)).length,
    }))
    /* ONE ORDER ON EVERY LOAD, so callout 3 is the same list at every window and every visit
       (built-critique-m3.md: 3 and 4 swapped between 1280 and 1920). The page's blocks arrive in
       the order the lists were loaded; the dealer's own fit-out comes first, then by name. */
    .toSorted(
      (a, b) =>
        Number(b.kind === 'package') - Number(a.kind === 'package') ||
        a.name.localeCompare(b.name, 'en-AU'),
    )

  return {
    place,
    name: spoken.name,
    detail: spoken.detail,
    label: rowLabel(root, row),
    path,
    code: textCell(root, row, 'Model Code'),
    imageAddress: imageAddressOf(root, row),
    priceName,
    price: subject.unitPrice,
    retired: isRetired(root) || isDiscontinued(row),
    motor,
    trailer,
    lists,
    rulesInForce: (ctx.constraintDefs ?? []).filter((c) => c.enabled !== false).length,
  }
}

type Entry = {
  block: ViewBlock
  target: EntityDef
  join: ReturnType<typeof joinRefFor>
  result: ReturnType<typeof relatedRows>
}

function readMotor(
  ctx: CatalogueCtx,
  root: EntityDef,
  row: RowData,
  entry: Entry,
  made: Made[],
  rules: Map<string, RuleSaid>,
  kits: Map<string, Made>,
  retiredKits: Map<string, Made>,
): MotorFit {
  const { target } = entry
  const envelope = envelopeOf(root, row)
  const madeRows = new Map(made.map((m) => [m.place.rowId, m]))
  const live = isRetired(target)
    ? []
    : (ctx.rowsByEntity[target.id] ?? []).filter((r) => !isDiscontinued(r))

  /* THE BOAT'S OWN SHAFT AND STEERING, read the way a dealer's rule reads them (`pairSpecs.ts`:
     one fold of a transom's letters and a leg's inches), so Rules and Fitment never read one
     cell two ways. An unread cell never splits a reason out. */
  const spec = (kind: 'boat' | 'motor', id: string): PairSpec =>
    PAIR_SPECS.find((s) => s.kind === kind && s.id === id)!
  const boatShaft = specValue(spec('boat', 'shaft'), root, row)
  const boatSteering = specValue(spec('boat', 'steering'), root, row)
  const tillerBoat = typeof boatSteering === 'string' && /tiller/i.test(boatSteering)
  const misfit = (r: RowData): 'shaft' | 'steering' | null => {
    const shaft = specValue(spec('motor', 'shaft'), target, r)
    if (boatShaft !== null && shaft !== null && shaft !== boatShaft) return 'shaft'
    const controls = specValue(spec('motor', 'controls'), target, r)
    if (typeof boatSteering !== 'string' || typeof controls !== 'string') return null
    return /tiller/i.test(controls) === tillerBoat ? null : 'steering'
  }

  const dots: MotorDot[] = []
  let rigs = 0
  let unrated = 0
  for (const r of live) {
    const rig = rigOf(target, r)
    /* a multi-motor rig or an unrated row the price list MAKES for this boat is one of the made,
       never also one of the reasons (the Stabicraft 2350 counted its two twin rigs twice) */
    if (!rig) {
      if (!madeRows.has(r.id)) unrated += 1
      continue
    }
    if (rig.count > 1) {
      if (!madeRows.has(r.id)) rigs += 1
      continue
    }
    const mine = madeRows.get(r.id)
    const measured = measureRig(envelope, rig)
    /* 'unplaced': the boat's own figures name no envelope for one motor
       (a Jeanneau that takes 2 × 300–350 hp), so a single is neither in
       nor out of it, and is not drawn as either */
    const standing: DotStanding = mine
      ? 'made'
      : measured.kind === 'outside'
        ? measured.side
        : measured.kind === 'inside'
          ? (misfit(r) ?? 'inside')
          : 'unplaced'
    const rule = rules.get(r.id) ?? null
    dots.push({
      key: mine?.key ?? r.id,
      place: { tableId: target.id, rowId: r.id },
      name: lineSaid(rowLabel(target, r), target.name),
      hp: rig.each,
      standing,
      starred: mine?.starred ?? false,
      because:
        standing === 'made'
          ? ''
          : measured.kind === 'outside'
            ? sayVerdict(measured.verdict)
            : measured.kind === 'inside' && envelope
              ? `${NOT_MADE_FOR_IT.replace(/\.$/, '')}, though it is inside the ${hullEnvelopeSaid(envelope)} it takes.`
              : NOT_MADE_FOR_IT,
      rule,
    })
  }
  dots.sort((a, b) => a.hp - b.hp || a.name.localeCompare(b.name, 'en-AU'))

  /* a "made" motor outside a single-motor envelope still counts as made:
     the price list chose it, and the dot says what the envelope says */
  const single = envelope?.rigs.find((e) => e.count === 1) ?? null
  const offer = offeredOf(made)
  const counts = {
    live: live.length,
    made: offer.offered,
    refused: offer.refused,
    inside: dots.filter((d) => d.standing === 'inside').length,
    shaft: dots.filter((d) => d.standing === 'shaft').length,
    steering: dots.filter((d) => d.standing === 'steering').length,
    under: dots.filter((d) => d.standing === 'under').length,
    over: dots.filter((d) => d.standing === 'over').length,
    unplaced: dots.filter((d) => d.standing === 'unplaced').length,
    rigs,
    unrated,
  }
  const twins = envelope?.rigs.filter((e) => e.count > 1) ?? []
  /* ONE PLATE THAT DOES NOT CONTRADICT ITSELF (the fitment judge, major 7): the Stabicraft 2350's
     own figures name one motor, and the price list makes two twin rigs for it. Those two are
     offered and drawn as tiles; the sentence speaks of the others, and says why they are not. */
  const madeRigs = made.filter((m) => {
    const r = live.find((x) => x.id === m.place.rowId)
    return r !== undefined && (rigOf(target, r)?.count ?? 1) > 1
  }).length
  const rigsSay =
    rigs === 0
      ? ''
      : twins.length > 0
        ? `Twin and triple rigs. This boat takes ${twins.map(envelopeSaid).join(', or ')}.`
        : madeRigs > 0
          ? `More twin and triple rigs. This boat’s own figures name one motor, so a rig goes on it only where the price list makes it for this boat, as it makes ${count(madeRigs)}.`
          : `Twin and triple rigs. This boat’s own figures name ${single ? 'one motor' : 'no horsepower'}, so they are not placed on it.`

  return {
    tableId: target.id,
    tableName: target.name,
    pairingTableId: entry.join?.entityId ?? null,
    envelope,
    takes: envelope ? hullEnvelopeSaid(envelope) : '',
    made,
    kits,
    retiredKits,
    boatShaft: boatShaft === null ? '' : spec('boat', 'shaft').say(String(boatShaft)),
    boatSteering: boatSteering === null ? '' : spec('boat', 'steering').say(String(boatSteering)),
    dots,
    counts,
    rigsSay,
    madeRigs,
  }
}

function readTrailers(
  ctx: CatalogueCtx,
  root: EntityDef,
  row: RowData,
  place: Place,
  entries: Entry[],
  madeOf: (entry: Entry) => Made[],
): TrailerFit | null {
  const marques = marquesOf(ctx)
  const fitment = selectPartners(ctx, TRAILER_FITMENT, place.tableId, place.rowId, {
    floor: TRAILER_ATM_FLOOR,
    marques,
  })
  /* A MARQUE IS NOT ALWAYS A MAKER. The engine selects on whatever a banner names, and on the
     Northside file that includes two Jeanneau RANGES (`from: 'level'`): Cap Camarat and Merry
     Fisher. The engine is right to select on them; a dealer told "across 7 makers" is told
     something false (built-critique-m3.md). So a range is said with its maker in front of it,
     and counted under that maker. */
  const spokenOf = new Map<string, { maker: string; said: string }>()
  for (const m of marques) {
    const maker =
      m.from === 'level'
        ? spokenBoat(m.subjectTableId, '').maker || (ctx.entities[m.subjectTableId]?.name ?? m.name)
        : m.name
    const said =
      m.from === 'level' && !m.name.toLowerCase().startsWith(maker.toLowerCase())
        ? `${maker} ${m.name}`
        : m.name
    spokenOf.set(m.name, { maker, said })
  }
  const saidOf = (name: string | null): string | null =>
    name === null ? null : (spokenOf.get(name)?.said ?? name)
  const makerOfMarque = (name: string | null): string =>
    name === null ? '' : (spokenOf.get(name)?.maker ?? name)
  if (entries.length === 0 && !fitment) return null

  const verdictOf = new Map<string, PartnerVerdict>()
  for (const v of [
    ...(fitment?.selected ?? []),
    ...(fitment?.unnamed ?? []),
    ...(fitment?.rejected ?? []),
  ]) {
    verdictOf.set(v.rowId, v)
  }

  const across = whatComesAcross(
    entries.map((e) => ({
      id: e.block.id,
      kind: e.target.kind,
      starred: e.result.rows.map((r) => r.recommended),
    })),
  )
  const crossing = new Set<string>()
  for (const e of entries) {
    for (const i of across.get(e.block.id) ?? []) {
      const r = e.result.rows[i]
      if (r) crossing.add(r.row.id)
    }
  }

  const loadField = loadFieldFor(root, TRAILER_ATM_FLOOR)
  const load = loadField ? readCell(row, loadField.id) : null
  const boatWeight = typeof load === 'number' ? load : null
  const weighed = boatWeight !== null

  const made: TrailerMade[] = entries
    .flatMap((e) => madeOf(e))
    .map((m) => {
      const v = verdictOf.get(m.place.rowId)
      const floor: FloorVerdict = v?.floor ?? {
        kind: 'not-evaluable',
        why: '',
      }
      return {
        ...m,
        floor: floor.kind,
        floorSays: floorSaid(floor, weighed),
        capacity: floor.kind === 'not-evaluable' ? null : floor.capacity,
        crosses: crossing.has(m.place.rowId),
      }
    })
    .sort((a, b) => Number(b.crosses) - Number(a.crosses) || Number(b.starred) - Number(a.starred))

  const madeRows = new Set(made.map((m) => m.place.rowId))
  const marque = saidOf(fitment?.marque?.name ?? null)
  const boat = spokenBoat(root.id, rowLabel(root, row))
  const member = (v: PartnerVerdict, because: string, maker = ''): TrailerMember => {
    const entity = ctx.entities[v.partnerTableId]
    return {
      key: v.rowId,
      place: { tableId: v.partnerTableId, rowId: v.rowId },
      name: lineSaid(v.label, entity?.name ?? ''),
      series: v.banner,
      because,
      maker,
    }
  }

  /* THE PRICE LIST'S OWN ORDER, whatever order its lists arrived in: by series, then by name.
     The engine walks the lists as they were loaded, which is not the same from load to load, and
     the struck example under each reason is the first of its group (built-critique-m3.md). */
  const inOrder = (list: readonly PartnerVerdict[]): PartnerVerdict[] =>
    list.toSorted(
      (a, b) =>
        WORDS.compare(a.banner, b.banner) ||
        WORDS.compare(a.label, b.label) ||
        a.rowId.localeCompare(b.rowId),
    )
  const forThis = inOrder((fitment?.selected ?? []).filter((v) => !madeRows.has(v.rowId)))
  const unnamed = inOrder((fitment?.unnamed ?? []).filter((v) => !madeRows.has(v.rowId)))
  const another = inOrder((fitment?.rejected ?? []).filter((v) => !madeRows.has(v.rowId)))

  /* not "not made for it": the walk read that beside a trailer whose own name is for this boat */
  const notMade = `Built for ${marque ?? 'this maker'} boats, and the price list does not list them for the ${boat.model || boat.name}.`
  const groups: TrailerGroup[] = []
  if (forThis.length > 0) {
    groups.push({
      id: 'this',
      count: forThis.length,
      head: notMade,
      members: forThis.map((v) => member(v, notMade)),
      makers: [],
    })
  }
  if (another.length > 0) {
    const members = another.map((v) =>
      member(
        v,
        sayVerdict({
          kind: 'built-for-another',
          bannerMarque: saidOf(v.bannerMarque) ?? '',
          subjectMarque: marque,
        }),
        makerOfMarque(v.bannerMarque),
      ),
    )
    const byMaker = new Map<string, TrailerMember[]>()
    for (const m of members) {
      const list = byMaker.get(m.maker) ?? []
      list.push(m)
      byMaker.set(m.maker, list)
    }
    const makers = [...byMaker.entries()]
      .map(([maker, list]): TrailerMaker => {
        const said = [...new Set(list.map((m) => m.because))]
        /* a maker reached through two ranges says both, once: "Built for Jeanneau Cap Camarat
           and Merry Fisher, not Highfield." */
        const ranges = [
          ...new Set(
            another
              .filter((v) => makerOfMarque(v.bannerMarque) === maker)
              .map((v) => v.bannerMarque ?? ''),
          ),
        ].toSorted((a, b) => a.localeCompare(b, 'en-AU'))
        return {
          maker,
          count: list.length,
          example: list[0]!,
          because:
            said.length === 1
              ? said[0]!
              : sayVerdict({
                  kind: 'built-for-another',
                  bannerMarque: `${maker} ${ranges.join(' and ')}`,
                  subjectMarque: marque,
                }),
        }
      })
      .sort((a, b) => b.count - a.count || a.maker.localeCompare(b.maker, 'en-AU'))
    groups.push({
      id: 'another',
      count: another.length,
      head: `Built for another boat, across ${count(makers.length)} ${makers.length === 1 ? 'maker' : 'makers'}.`,
      members,
      makers,
    })
  }
  if (unnamed.length > 0) {
    groups.push({
      id: 'unnamed',
      count: unnamed.length,
      head: `${NAMES_NO_MAKER.replace(/\.$/, '')}: not ruled out, and the price list does not list it for this boat.`,
      members: unnamed.map((v) => member(v, NAMES_NO_MAKER)),
      makers: [],
    })
  }

  const onSale = fitment?.catalogue ?? 0
  const heldCount = (fitment?.heldBack.retiredRows ?? 0) + (fitment?.heldBack.discontinued ?? 0)

  return {
    lists: entries.map((e) => ({ tableId: e.target.id, name: e.target.name })),
    made,
    oneTrailer: made.length > 1 ? ONE_TRAILER : '',
    maker: marque,
    onSale,
    groups,
    others: groups.reduce((n, g) => n + g.count, 0),
    held: { count: heldCount, lists: fitment?.heldBack.retiredTables ?? [] },
    heldSays: heldSaid(heldCount, fitment?.heldBack.retiredTables ?? []),
    boatWeight,
  }
}

/** What is no longer sold, said once and never counted in. */
/* the retired list is not named: its own name is the price list's capitals ("OBSOLETE Trailers —
   No Longer Available"), and the sentence already says what it means (the fitment judge, minor 18) */
const heldSaid = (n: number, _lists: readonly string[]): string =>
  n === 0 ? '' : `${count(n)} more ${n === 1 ? 'is' : 'are'} no longer sold, and never offered.`

/* ---------------------------------------------------------- */
/* Finding a boat                                              */
/* ---------------------------------------------------------- */

export interface BoatFound {
  place: Place
  name: string
  detail: string
  maker: string
  code: string
}

/**
 * The boats a few typed words find, every word somewhere in the boat's
 * name, its finish or its code — word by word, for the reason
 * `curation/reach.ts` gives. Boats no longer sold are left out: the
 * fitment of a boat nobody can buy is not a question a dealer asks.
 */
export function findBoats(
  world: { entities: Record<string, EntityDef>; rowsByEntity: Record<string, RowData[]> },
  query: string,
  limit = 12,
): { found: BoatFound[]; matched: number } {
  const needles = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  if (needles.length === 0) return { found: [], matched: 0 }
  const found: BoatFound[] = []
  let matched = 0
  for (const entity of Object.values(world.entities)) {
    if (entity.kind !== 'boat' || isRetired(entity)) continue
    for (const row of world.rowsByEntity[entity.id] ?? []) {
      if (isDiscontinued(row)) continue
      const label = rowLabel(entity, row)
      const spoken = spokenBoat(entity.id, label)
      const code = textCell(entity, row, 'Model Code')
      const hay = `${spoken.say} ${label} ${code} ${entity.name}`.toLowerCase()
      if (!needles.every((n) => hay.includes(n))) continue
      matched += 1
      if (found.length < limit) {
        found.push({
          place: { tableId: entity.id, rowId: row.id },
          name: spoken.name,
          detail: spoken.detail,
          maker: spoken.maker || entity.name,
          code,
        })
      }
    }
  }
  return { found, matched }
}

export interface BoatModel {
  /** the model as `countBoats` keys it (`modelKeyOf`), stable across reads */
  key: string
  /** "Highfield Classic 340", "Formosa GRT 455" — the model as a person says it */
  name: string
  /** what the file adds after a one-line model's name — "Side Console", "HS"; '' for a model
   *  filed with versions under it */
  trim: string
  /** every version of it still sold — a Highfield's materials and colourways — in the price
   *  list's own order; the boat itself where there is only one */
  versions: BoatFound[]
  /** named by the price list's own code, because the names ledger holds no name the maker gives
   *  it ("SP300": Highfield's site has no Sport 300); absent or false where it is spoken */
  coded?: boolean
}

export interface BoatMaker {
  /** the maker as Home's door names it ("Highfield", not its list's filed name) */
  maker: string
  models: BoatModel[]
  /** models a person could be sold — `countBoats`' figure: Highfield 67, Stacer 91 */
  boats: number
  /** lines of the price list behind them: Highfield's 588 */
  lines: number
}

/**
 * EVERY BOAT STILL SOLD, BY MAKER AND THEN BY MODEL — what the chooser offers before a word is
 * typed (built-critique-m3.md: "one field on an empty page"). Counted, never sampled.
 *
 * ONE PRICE LIST, ONE SIZE (built-critique-m3-2.md, major 4). This chooser said "Highfield 69
 * models · 588 versions" and "Stacer 73 models · 91 versions" beside a Home, a Data and a picker
 * that say Highfield 67 and 289 boats in all, because it grouped versions by the name a person
 * says rather than by the model the file files. A model here is `modelKeyOf`'s — the one place
 * that decides what a model is — so every maker counts exactly what `countBoats` counts: a list
 * that files Series ▸ Model ▸ Variant collapses onto its trail (Highfield's three Coasters are
 * its one Coaster), and on every other list a line is a model ("Stacer 319 Skimma" and its HS
 * are two). The maker is `makerOfTable`, the word Home's door carries. Makers A to Z; models in
 * the order a person counts them ("Classic 240" before "Classic 1000").
 */
export function boatMakers(world: {
  entities: Record<string, EntityDef>
  rowsByEntity: Record<string, RowData[]>
}): BoatMaker[] {
  const out: BoatMaker[] = []
  for (const entity of Object.values(world.entities)) {
    if (entity.kind !== 'boat' || isRetired(entity)) continue
    const deep = (entity.hierarchy ?? []).length >= 3
    const maker = makerOfTable(entity)
    const models = new Map<string, BoatModel>()
    let lines = 0
    for (const row of world.rowsByEntity[entity.id] ?? []) {
      if (isDiscontinued(row)) continue
      lines += 1
      const spoken = spokenBoat(entity.id, rowLabel(entity, row))
      const key = modelKeyOf(entity, row)
      let model = models.get(key)
      if (!model) {
        const filed = deep ? (trailOf(entity, row).split(' ▸ ').at(-1) ?? '') : ''
        const words = filed === '' ? null : spokenModel(entity.id, filed)
        const name = words ? words.name : spoken.name
        model = {
          key,
          name,
          trim: deep ? '' : spoken.detail,
          versions: [],
          coded: (words ? words.from : spoken.from) === 'code',
        }
        models.set(key, model)
      }
      model.versions.push({
        place: { tableId: entity.id, rowId: row.id },
        name: spoken.name,
        detail: finishSaid(spoken),
        maker: spoken.maker || maker,
        code: textCell(entity, row, 'Model Code'),
      })
    }
    if (models.size === 0) continue
    const list = [...models.values()].toSorted(
      (a, b) => COUNTED.compare(a.name, b.name) || COUNTED.compare(a.trim, b.trim),
    )
    out.push({ maker, models: list, boats: list.length, lines })
  }
  return out.toSorted((a, b) => COUNTED.compare(a.maker, b.maker))
}

/** Every model on the list, across its makers — the figure Home and the picker print (289). */
export const boatsOnTheList = (makers: readonly BoatMaker[]): number =>
  makers.reduce((n, m) => n + m.boats, 0)

/* ---------------------------------------------------------- */
/* Show all — one list, the whole of it, grouped by reason      */
/* ---------------------------------------------------------- */

/** Where a press opens the price list: one line of one list (`at`), or
 *  a list narrowed by what is typed into its find field (`find`). The
 *  sheet's own two words for a position (`src/routes/data.$table.tsx`). */
export interface Opens {
  tableId: string
  at?: string
  find?: string
}

export interface WholeRow {
  key: string
  /** the thing itself, on its own list — what a put-on or take-off press changes */
  place: Place
  name: string
  /** its own deciding facts: "175 hp · 220 kg · 25″ shaft", a trailer's series */
  facts: string
  price: number | null
  made: boolean
  starred: boolean
  /** this one goes on a new quote */
  crosses: boolean
  /** a dealer's rule that refuses or flags it, in its own words */
  rule: RuleSaid | null
  /** the line of the price list that decides it */
  opens: Opens | null
  /** lower-cased, for the find field */
  hay: string
}

export interface WholeGroup {
  id: string
  /** the reason, said once for the group */
  head: string
  /** a second sentence the whole group shares — the one-trailer rule */
  note: string
  rows: WholeRow[]
}

export interface WholeList {
  slot: string
  /** the list's own name: "Yamaha Outboards", "Trailers" */
  title: string
  /** every one on sale: made + refused + every group below */
  total: number
  /** made for this boat and offered, as the build offers it (`offeredOf`) */
  made: number
  /** made for this boat and refused by one of the dealer's rules: their own group, struck */
  refused: number
  groups: WholeGroup[]
  /** what is no longer sold, said once and never counted in */
  held: string
}

const hayOf = (...parts: string[]): string => parts.join(' ').toLowerCase()

/** Everything on sale for one of the boat's places, grouped by the reason
 *  it is or is not offered. `slot` is 'motor', 'trailer' or the id of one
 *  of `fit.lists`. Null where the boat has no such place. */
export function readWhole(ctx: CatalogueCtx, fit: BoatFit, slot: string): WholeList | null {
  if (slot === 'motor') return wholeMotor(ctx, fit)
  if (slot === 'trailer') return wholeTrailer(ctx, fit)
  return wholeList(ctx, fit, slot)
}

const offeredCounts = (made: readonly Made[]): { made: number; refused: number } => {
  const o = offeredOf(made)
  return { made: o.offered, refused: o.refused }
}

const madeRow = (m: Made, extra: Partial<WholeRow> = {}): WholeRow => ({
  key: m.key,
  place: m.place,
  name: m.name,
  facts: m.facts,
  price: m.price,
  made: true,
  starred: m.starred,
  crosses: false,
  rule: m.rule,
  opens: m.pairing ? { tableId: m.pairing.tableId, at: m.pairing.rowId } : null,
  hay: hayOf(m.name, m.label, m.facts),
  ...extra,
})

/** THE MADE GROUP, AND WHAT A DEALER'S RULE REFUSES OF IT, APART (`offeredOf`): the first holds
 *  what the build offers, the second is struck with each rule's own because beside it. */
function madeGroups(rows: WholeRow[], note = ''): WholeGroup[] {
  const refused = refusedIn(rows)
  const offered = offeredIn(rows)
  const groups: WholeGroup[] = [{ id: 'made', head: 'Offered on this boat.', note, rows: offered }]
  if (refused.length > 0) groups.push({ id: 'ruled', head: RULE_REFUSES, note: '', rows: refused })
  return groups
}

const struckRow = (
  key: string,
  place: Place,
  name: string,
  facts: string,
  opens: Opens | null,
): WholeRow => ({
  key,
  place,
  name,
  facts,
  price: null,
  made: false,
  starred: false,
  crosses: false,
  rule: null,
  opens,
  hay: hayOf(name, facts),
})

function wholeMotor(ctx: CatalogueCtx, fit: BoatFit): WholeList | null {
  const motor = fit.motor
  const table = motor ? ctx.entities[motor.tableId] : undefined
  if (!motor || !table) return null
  const boatTable = ctx.entities[fit.place.tableId]
  const boatRow = (ctx.rowsByEntity[fit.place.tableId] ?? []).find((r) => r.id === fit.place.rowId)
  const boatAt: Opens = { tableId: fit.place.tableId, at: fit.place.rowId }
  const pairingList: Opens | null =
    motor.pairingTableId && boatTable && boatRow
      ? { tableId: motor.pairingTableId, find: rowLabel(boatTable, boatRow) }
      : null
  const rows = new Map((ctx.rowsByEntity[motor.tableId] ?? []).map((r) => [r.id, r]))
  const price = pricer(ctx, fit)
  const dotRow = (d: MotorDot, opens: Opens | null): WholeRow => {
    const r = rows.get(d.place.rowId)
    return {
      ...struckRow(d.key, d.place, d.name, r ? goodsFacts(table, r) : '', opens),
      price: r ? price(table, r) : null,
      rule: d.rule,
    }
  }
  const of = (standing: DotStanding): MotorDot[] =>
    motor.dots.filter((d) => d.standing === standing)

  const groups: WholeGroup[] = madeGroups(motor.made.map((m) => madeRow(m)))
  const push = (id: string, head: string, list: WholeRow[]): void => {
    if (list.length > 0) groups.push({ id, head, note: '', rows: list })
  }
  /* ONE ORDER AND ONE SENTENCE PER REASON, the plate's and this list's alike (`motorHeldSaid`):
     under the boat's range, over it, inside it and not made for it, then what the boat's figures
     cannot place. Every motor on sale lands in exactly one of them. */
  const said = (id: MotorHeldId): string =>
    motorHeldSaid(id, motor.takes, motor.rigsSay, {
      shaft: motor.boatShaft,
      steering: motor.boatSteering,
    })
  const live = [...rows.values()].filter((r) => !isDiscontinued(r))
  const ofRows = (list: RowData[]): WholeRow[] =>
    list.map((r) => ({
      ...struckRow(
        r.id,
        { tableId: table.id, rowId: r.id },
        lineSaid(rowLabel(table, r), table.name),
        goodsFacts(table, r),
        pairingList,
      ),
      price: price(table, r),
    }))
  const madeIds = new Set(motor.made.map((m) => m.place.rowId))
  for (const id of ['under', 'over', 'shaft', 'steering', 'inside', 'unplaced'] as const) {
    push(
      id,
      said(id),
      of(id).map((d) => dotRow(d, id === 'inside' ? pairingList : boatAt)),
    )
  }
  push(
    'rigs',
    said('rigs'),
    ofRows(live.filter((r) => !madeIds.has(r.id) && (rigOf(table, r)?.count ?? 1) > 1)),
  )
  push(
    'unrated',
    said('unrated'),
    ofRows(live.filter((r) => !madeIds.has(r.id) && rigOf(table, r) === null)),
  )
  return {
    slot: 'motor',
    title: motor.tableName,
    total: motor.counts.live,
    ...offeredCounts(motor.made),
    groups,
    held: '',
  }
}

/**
 * A LINE'S PRICE AT THE BOAT'S OWN LEVEL, for a line not made for it — `mintLine` with no pairing,
 * the one door every price on a quote goes through, so a figure in Show all is the figure the
 * build would put on the quote. Null where the line has none (a list whose price Northside has not
 * chosen). Show all priced only the offered seven (the fitment judge, major 11).
 */
export function pricer(
  ctx: CatalogueCtx,
  fit: BoatFit,
): (entity: EntityDef, row: RowData) => number | null {
  const root = ctx.entities[fit.place.tableId]
  const levelKey = root ? defaultLevelKey(root) : ''
  const engine = makeEngine(ctx)
  return (entity, row) => {
    if (levelKey === '') return null
    return mintLine({ ctx, engine, entity, row, levelKey }).unitPrice
  }
}

function wholeTrailer(ctx: CatalogueCtx, fit: BoatFit): WholeList | null {
  const trailer = fit.trailer
  if (!trailer) return null
  const price = pricer(ctx, fit)
  const groups: WholeGroup[] = madeGroups(
    trailer.made.map((m) =>
      /* ITS ATM ALONE: the bare-hull "clears it by" set the ATM against the boat without its
         motor or the trailer's own weight, which the plate corrected; the whole weigh is the
         plate's, where the load is said */
      madeRow(m, {
        facts: m.capacity === null ? '' : `ATM ${count(m.capacity)} kg`,
        crosses: m.crosses,
        hay: hayOf(m.name, m.label),
      }),
    ),
    trailer.oneTrailer,
  )
  const memberRow = (m: TrailerMember): WholeRow => {
    const entity = ctx.entities[m.place.tableId]
    const row = (ctx.rowsByEntity[m.place.tableId] ?? []).find((r) => r.id === m.place.rowId)
    return {
      ...struckRow(m.key, m.place, m.name, seriesSaid(m.series), {
        tableId: m.place.tableId,
        at: m.place.rowId,
      }),
      price: entity && row ? price(entity, row) : null,
      hay: hayOf(m.name, m.series),
    }
  }
  for (const g of trailer.groups) {
    if (g.id !== 'another') {
      groups.push({ id: g.id, head: g.head, note: '', rows: g.members.map(memberRow) })
      continue
    }
    for (const maker of g.makers) {
      groups.push({
        id: `another:${maker.maker}`,
        head: maker.because,
        note: '',
        rows: g.members.filter((m) => m.maker === maker.maker).map(memberRow),
      })
    }
  }
  return {
    slot: 'trailer',
    title: 'Trailers',
    total: trailer.onSale,
    ...offeredCounts(trailer.made),
    groups,
    held: trailer.heldSays,
  }
}

function wholeList(ctx: CatalogueCtx, fit: BoatFit, slot: string): WholeList | null {
  const list = fit.lists.find((l) => l.tableId === slot)
  const table = list ? ctx.entities[list.tableId] : undefined
  if (!list || !table) return null
  const mine = new Set(list.made.map((m) => m.place.rowId))
  const price = pricer(ctx, fit)
  const rest = isRetired(table)
    ? []
    : (ctx.rowsByEntity[table.id] ?? [])
        .filter((r) => !isDiscontinued(r) && !mine.has(r.id))
        .map((r) => {
          const label = rowLabel(table, r)
          return {
            ...struckRow(
              r.id,
              { tableId: table.id, rowId: r.id },
              lineSaid(label, table.name),
              '',
              { tableId: table.id, at: r.id },
            ),
            price: price(table, r),
            hay: hayOf(lineSaid(label, table.name), label),
          }
        })
  const groups: WholeGroup[] = madeGroups(list.made.map((m) => madeRow(m)))
  if (rest.length > 0) groups.push({ id: 'rest', head: NOT_MADE_FOR_IT, note: '', rows: rest })
  return {
    slot,
    title: list.name,
    total: list.live,
    ...offeredCounts(list.made),
    groups,
    held: '',
  }
}
