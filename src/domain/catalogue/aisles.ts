/* ============================================================
   THE CHANDLERY'S AISLES — the price list's own section headings,
   gathered under a dealer's word for what the parts are for
   (docs/directions/choosing.md, direction B, picked 2026-10-30).

   The parts register files 2,238 live parts under 180 headings as the
   workbook writes them ("GME - VHF MARINE RADIOS", "LOWRANCE",
   "PROPELLERS - Yamaha"). A salesperson thinks "something for the
   anchor", not "SARCA ANCHORS", so each heading is put in one of
   eighteen aisles named in the dealer's words, after Toyota's and
   BCF's aisles (docs/research/refs/choosing/notes.md). NOTHING IS
   INVENTED: an aisle is only a name over headings the file already
   carries, every part keeps its own heading, and a heading this list
   does not name is counted as "Not sorted yet" — never guessed into an
   aisle. The 25 parts with no heading and the 3 DFO kits stand there
   today, as the board measured.

   A HEADING IS NAMED BY ITS START, in capitals, so "BATTERIES -
   Supercharge (As at 30.06.2025)" is a battery when the date in it
   moves. The list is checked against the real pack in its test: every
   aisle holds what the board measured, and the eighteen and the
   unsorted add up to every live part.

   PURE: headings in, aisles and counts out. No React, no store.
   ============================================================ */

/** One aisle: its id (a position in an address), its dealer's name, and the headings it holds. */
export interface Aisle {
  id: string
  name: string
  /** what it is for, in a line under its name */
  holds: string
  /** the starts of the headings it gathers, in capitals */
  headings: readonly string[]
}

export const UNSORTED = 'unsorted'

export const AISLES: readonly Aisle[] = [
  {
    id: 'sounders',
    name: 'Sounders & chartplotters',
    holds: 'Fish finders, chartplotters, transducers, maps',
    headings: [
      'GARMIN STRIKER',
      'GARMIN ECHOMAP',
      'GARMIN GPSMAP',
      'GARMIN RANGE',
      'GARMIN TRANSDUCERS',
      'GARMIN - BLUECHART',
      'LOWRANCE',
      'SIMRAD',
      'RAYMARINE',
      'NAVIONICS',
      'RADAR MOUNTS',
      'NMEA 2000',
    ],
  },
  {
    id: 'radios',
    name: 'Radios & beacons',
    holds: 'VHF radios, aerials, AIS, EPIRBs and beacons',
    headings: [
      'GARMIN VHF',
      'GARMIN AIS',
      'GME - EPIRB',
      'GME - PERSONAL LOCATOR',
      'GME - VHF',
      'GME - HANDHELD',
      'GME - EXTENSION SPEAKERS',
      'GME - AIS',
      'GME - AERIAL',
      'GME - MARINE RADIO',
    ],
  },
  {
    id: 'stereo',
    name: 'Stereo & TV',
    holds: 'Head units, speakers, amplifiers, TV',
    headings: [
      'FUSION',
      'GME - MARINE ENTERTAINMENT',
      'GME - AM/FM',
      'TELEVISIONS',
      'MARINE EXTENSION CABLES',
    ],
  },
  {
    id: 'safety',
    name: 'Safety gear & life jackets',
    holds: 'Safety sets and life jackets',
    headings: ['SAFETY GEAR', "PFD'S"],
  },
  {
    id: 'anchoring',
    name: 'Anchoring & mooring',
    holds: 'Anchors, winches, fenders, lines, shackles',
    headings: ['ANCHOR', 'SARCA', 'MMX ANCHORS', 'FENDERS', 'DECK HARDWARE - SHACKLES'],
  },
  {
    id: 'power',
    name: 'Batteries & power',
    holds: 'Batteries, boxes, switches, chargers, solar',
    headings: ['BATTERIES', 'BATTERY MONITORS', 'ELECTRICAL - ', 'SOLAR'],
  },
  {
    id: 'lights',
    name: 'Lights',
    holds: 'Navigation, deck, strip and underwater lights',
    headings: ['LIGHTING'],
  },
  {
    id: 'trailer',
    name: 'Trailer parts',
    holds: 'Tie-downs, jockey wheels, spares, winches',
    headings: ['TRAILER PARTS', 'TRAILER ADJUSTMENTS'],
  },
  {
    id: 'covers',
    name: 'Covers & canopies',
    holds: 'Boat, motor and tube covers, biminis',
    headings: [
      'BIMINI',
      'REAR AWNING',
      'BOAT COVERS',
      'OUTBOARD COVERS',
      'TUBE COVERS',
      'COVER OPTIONS',
      'OUTBOARD COWL COVERS',
    ],
  },
  {
    id: 'fishing',
    name: 'Fishing & mounts',
    holds: 'Rod holders, mounts and fishing gear',
    headings: ['FISHING', 'RAM BRACKETS', 'RAILBLAZA', 'HOOK LINE'],
  },
  {
    id: 'electric',
    name: 'Electric & trolling motors',
    holds: 'Trolling motors, electric outboards, their parts',
    headings: [
      'GARMIN - TROLLING',
      'POWERDRIVE',
      'TERROVA',
      'INSTINCT',
      'BRACKETS & STABILIZERS',
      'MINN KOTA',
      'QUICK RELEASE BRACKETS',
      'REPLACEMENT REMOTES',
      'I PILOT',
      'ACCESSORIES',
      'PROPELLERS, NUTS',
      'WIRING HARNESSES',
      'MOMENTUM',
      'E PROPULSION',
      'THRUSTME',
    ],
  },
  {
    id: 'propellers',
    name: 'Propellers & motor care',
    holds: 'Propellers, service parts, oils, flushers',
    headings: ['PROPELLERS - YAMAHA', 'YAMAHA', 'YAMALUBE', 'FLUSHERS', 'TILT LIMIT'],
  },
  {
    id: 'steering',
    name: 'Steering, controls & rigging',
    holds: 'Controls, cables, harnesses, gauges, steering',
    headings: [
      'CONTROL BOX',
      'KEY SWITCHES',
      'GAUGE KITS',
      'TILLER HANDLE',
      'AUTOPILOT',
      'BOW THRUSTER',
      'STEERING KIT',
      'HELM',
      'PROP LIGHT',
      'MAIN HARNESSES',
      'CONTROL CABLES',
      'PIGTAIL',
      'MAIN BUS',
      'SCU LINK',
      'DES ACTUATOR',
      '2ND STATION',
      'JOYSTICK STATION',
      'RIGGING COMPONENTS',
    ],
  },
  {
    id: 'plumbing',
    name: 'Fuel, water & plumbing',
    holds: 'Tanks, fuel lines, hose, pumps, fittings',
    headings: [
      'FUEL TANKS',
      'FUEL LINE',
      'FUEL WATER',
      'WATER TANKS',
      'PLUMBING',
      'HOSE',
      'GAS COMPONENTS',
    ],
  },
  {
    id: 'deck',
    name: 'Deck & hardware',
    holds: 'Stainless fittings, seats, trim tabs, hydrofoils',
    headings: [
      'GENERAL HARDWARE',
      'VENTILATION',
      'WINDSCREEN',
      'BBQS',
      'TRANSOM SPACERS',
      'SALTY CAPTAIN',
      'HYDROFOILS',
      'SEATS',
      'TRIM TABS',
      'BOWEYES',
    ],
  },
  {
    id: 'highfield',
    name: 'Highfield parts & consoles',
    holds: 'Highfield consoles, factory options and spares',
    headings: ['HIGHFIELD'],
  },
  {
    id: 'decals',
    name: 'Decals & registration',
    holds: 'Graphics, decals and registration holders',
    headings: ['REGISTRATION', 'DECALS'],
  },
  {
    id: 'workshop',
    name: 'Workshop, labour & notes',
    holds: 'Labour, sublets, antifouling, notes',
    headings: [
      'ANTIFOULING',
      'MISC SUBLETS',
      'BOAT SALES PROMO',
      'SUBLET WORK',
      'LABOUR',
      'ELECTRICAL COMPLIANCE',
      'CREDIT ALLOCATIONS',
      'SPECIAL NOTES',
      'OPTIONAL FUEL TANK NOT REQUIRED',
    ],
  },
]

/** The aisle "Not sorted yet": what no aisle names, said as such and never guessed. */
export const UNSORTED_AISLE: Aisle = {
  id: UNSORTED,
  name: 'Not sorted yet',
  holds: 'Parts the price list files under no heading an aisle names',
  headings: [],
}

/** The aisle by its id, or undefined. */
export const aisleById = (id: string): Aisle | undefined =>
  id === UNSORTED ? UNSORTED_AISLE : AISLES.find((a) => a.id === id)

/** THE ONE AISLE A HEADING GOES IN: the aisle whose longest named start the heading begins with,
 *  so "PROPELLERS - Yamaha" is a propeller and not a Yamaha part, and "ELECTRICAL COMPLIANCE" is
 *  the workshop's and not a battery's. A heading nothing names is unsorted. */
export function aisleOf(heading: string | null | undefined): string {
  const said = (heading ?? '').trim().toUpperCase()
  if (said === '') return UNSORTED
  let best = ''
  let at = UNSORTED
  for (const aisle of AISLES) {
    for (const start of aisle.headings) {
      if (said.startsWith(start) && start.length > best.length) {
        best = start
        at = aisle.id
      }
    }
  }
  return at
}

/** One aisle, counted. */
export interface AisleCount {
  aisle: Aisle
  /** how many live parts it holds */
  parts: number
  /** of those, how many have a picture of that exact part */
  pictured: number
  /** how many headings of the price list it gathers */
  headings: number
}

/** One part as the chandlery counts it: its id and its heading. */
export interface PartIn {
  id: string
  heading: string | null | undefined
}

/**
 * EVERY AISLE, COUNTED OFF THE PARTS HANDED IN — the eighteen in their order, then "Not sorted
 * yet" where anything is. `pictured` says whether a part has its own picture (the reader's, so
 * this stays pure). An aisle with no parts is still an aisle, with its count of nothing.
 */
export function aislesOf(
  parts: readonly PartIn[],
  pictured: (id: string) => boolean = () => false,
): AisleCount[] {
  const counts = new Map<string, { parts: number; pictured: number; headings: Set<string> }>()
  for (const part of parts) {
    const id = aisleOf(part.heading)
    const at = counts.get(id) ?? { parts: 0, pictured: 0, headings: new Set<string>() }
    at.parts += 1
    if (pictured(part.id)) at.pictured += 1
    at.headings.add((part.heading ?? '').trim())
    counts.set(id, at)
  }
  const out: AisleCount[] = AISLES.map((aisle) => {
    const at = counts.get(aisle.id)
    return {
      aisle,
      parts: at?.parts ?? 0,
      pictured: at?.pictured ?? 0,
      headings: at?.headings.size ?? 0,
    }
  })
  const unsorted = counts.get(UNSORTED)
  if (unsorted)
    out.push({
      aisle: UNSORTED_AISLE,
      parts: unsorted.parts,
      pictured: unsorted.pictured,
      headings: unsorted.headings.size,
    })
  return out
}

/** One maker in an aisle, counted: the price list's supplier as it writes it. */
export interface MakerCount {
  maker: string
  parts: number
}

/** THE MAKERS IN A RUN OF PARTS, most parts first and then by name; a part with no supplier is
 *  counted under no maker and never under a guessed one. */
export function makersOf(suppliers: readonly (string | null | undefined)[]): MakerCount[] {
  const counts = new Map<string, number>()
  for (const s of suppliers) {
    const maker = (s ?? '').trim()
    if (maker === '') continue
    counts.set(maker, (counts.get(maker) ?? 0) + 1)
  }
  return [...counts]
    .map(([maker, parts]) => ({ maker, parts }))
    .toSorted((a, b) => b.parts - a.parts || a.maker.localeCompare(b.maker))
}
