import { RESPONSE, settlesIn } from '@/ui/motion'

/* ============================================================
   THE SEAL ON A GIVEN QUOTE, AND THE STAMP THAT PUTS IT THERE.

   The components critique (2026-09-28, major 8): "Giving the quote,
   the moment the sale exists, is a dot turning green", and "Rive and
   Lottie are not installed, though the plan named the issue as the
   place for an authored moment" (PLAN.md: "Rive or Lottie for
   authored motion … Showroom moments happen once per quote; that is
   where the budget lives").

   So the moment is AUTHORED, as a Lottie timeline, and this module is
   its source: one drawing, written once, that both the still seal and
   the stamp are made from — so a quote given a moment ago and a quote
   given last week wear the same seal, point for point.

     · the rim, a rosette of twelve lobes, filled in the given leaf;
     · the tick, stroked across it in the plate's own white;
     · one ring and eight short rays, which exist only while it is
       stamped and are gone at its last frame.

   It tells one thing in order: the seal comes down, it meets the
   paper, it is ticked, and it is done.

   THE TIMELINE IS THE KIT'S OWN MOTION, not a curve chosen here. The
   rim lands on the SETTLE spring (critically damped, response 0.2 s —
   nothing in this app bounces), sampled a frame at a time exactly as
   tokens.css samples `--ease-spring`; it fades in over the PRESS
   (100 ms), the ring it presses into the paper leaves on the same
   spring, and the tick draws itself over the ENTER tween (200 ms) on
   `--ease-out`'s curve. At 60 frames a second:

       0 ─ 6    the rim fades in                         press   100 ms
       0 ─ 18   the rim lands, 1.35× and −10° to rest    settle  294 ms
       5 ─ 14   the ring leaves the rim and fades         settle
       8 ─ 20   the tick draws itself                     enter   200 ms
      14 ─ 32   the rays go out, as the tick ends, and are gone
      36        the last frame: the rim and the tick, and nothing else

   Drawn frame by frame on 2026-09-28 before it was kept: a ring and
   rays on screen together read as the ticks of a dial, so the ring
   belongs to the landing and is gone before the first ray is drawn.

   NO COLOUR LIVES HERE. Lottie needs a colour on every fill and
   stroke, so each carries black, and configurator.css paints every
   one from tokens by the class its layer is given — the leaf is
   `--status-given` and the tick is `--color-panel`, day and night.
   Northside's own accent is not in it: given is a state, and a state
   has its own ink (tokens.css, THE KIT).
   ============================================================ */

/** The side of the drawing, in its own units. configurator.css sets the box it is drawn in
 *  (`.cfg-seal`, 64px), so one unit is half a pixel there. */
export const SEAL_BOX = 128
const MID = SEAL_BOX / 2

const LOBES = 12
/** the rim's lobes reach this far from the middle, and its valleys this far */
const PEAK = 44
const VALLEY = 40.5
/** the tick, as three points about the middle, and the width it is stroked at */
const TICK: readonly Pt[] = [
  [-16, 1],
  [-5, 12],
  [17, -11],
]
export const TICK_WIDTH = 8
/** the rays: how many, where each starts and ends, and their stroke */
const RAYS = 8
const RAY_FROM = 50
const RAY_TO = 61
const RAY_WIDTH = 4
/** the ripple's first diameter and its stroke */
const RIPPLE = 92
const RIPPLE_WIDTH = 3

const FPS = 60
/** the last frame, when only the rim and the tick are left */
export const LAST_FRAME = 36

type Pt = readonly [number, number]
interface Bezier {
  v: Pt[]
  i: Pt[]
  o: Pt[]
}

const round = (n: number): number => Math.round(n * 1000) / 1000

/** The rim, about the middle: a vertex at every lobe and every valley, each leaving along the
 *  circle it sits on, so the edge undulates and never corners. */
function rosette(): Bezier {
  const steps = LOBES * 2
  const arc = (2 * Math.PI) / steps
  const v: Pt[] = []
  const i: Pt[] = []
  const o: Pt[] = []
  for (let k = 0; k < steps; k++) {
    const angle = k * arc - Math.PI / 2
    const radius = k % 2 === 0 ? PEAK : VALLEY
    /* a circle's own handle for this arc, so between two vertices it is an arc of that circle */
    const handle = (4 / 3) * Math.tan(arc / 4) * radius
    const along: Pt = [-Math.sin(angle), Math.cos(angle)]
    v.push([round(Math.cos(angle) * radius), round(Math.sin(angle) * radius)])
    o.push([round(along[0] * handle), round(along[1] * handle)])
    i.push([round(-along[0] * handle), round(-along[1] * handle)])
  }
  return { v, i, o }
}

const RIM = rosette()

const add = (p: Pt, q: Pt): Pt => [p[0] + q[0], p[1] + q[1]]

/** The rim as an SVG path, in the drawing's own units. */
export const RIM_D = ((): string => {
  const at = (p: Pt): string => `${round(p[0] + MID)} ${round(p[1] + MID)}`
  const n = RIM.v.length
  let d = `M${at(RIM.v[0]!)}`
  for (let k = 0; k < n; k++) {
    const from = RIM.v[k]!
    const to = RIM.v[(k + 1) % n]!
    d += ` C${at(add(from, RIM.o[k]!))} ${at(add(to, RIM.i[(k + 1) % n]!))} ${at(to)}`
  }
  return `${d}Z`
})()

/** The tick as an SVG path, in the drawing's own units. */
export const TICK_D = TICK.map((p, k) => `${k === 0 ? 'M' : 'L'}${p[0] + MID} ${p[1] + MID}`).join(
  ' ',
)

/* ---------------------------------------------------------- */
/* The timeline                                                */
/* ---------------------------------------------------------- */

/** A critically damped spring's progress from 0 to 1 at `seconds`, for a response. */
function spring(response: number, seconds: number): number {
  const omega = (2 * Math.PI) / response
  return 1 - (1 + omega * seconds) * Math.exp(-omega * seconds)
}

type Value = number[]
interface Key {
  t: number
  s: Value
  o?: { x: number[]; y: number[] }
  i?: { x: number[]; y: number[] }
}

/** Keys joined by straight lines — how a sampled spring is handed over, a frame at a time. */
function linear(keys: { t: number; s: Value }[]): { a: 1; k: Key[] } {
  return {
    a: 1,
    k: keys.map((key, n) => {
      if (n === keys.length - 1) return key
      const d = key.s.length
      return {
        ...key,
        o: { x: Array<number>(d).fill(0), y: Array<number>(d).fill(0) },
        i: { x: Array<number>(d).fill(1), y: Array<number>(d).fill(1) },
      }
    }),
  }
}

/** Two keys on the kit's `--ease-out` curve, cubic-bezier(0.2, 0, 0, 1). */
function easedOut(from: number, to: number, start: number, end: number): { a: 1; k: Key[] } {
  return {
    a: 1,
    k: [
      { t: start, s: [from], o: { x: [0.2], y: [0] }, i: { x: [0], y: [1] } },
      { t: end, s: [to] },
    ],
  }
}

/** A value that follows a spring from `from` to `to`, one key a frame, from `start`. */
function sprung(
  response: number,
  start: number,
  from: Value,
  to: Value,
): { t: number; s: Value }[] {
  const frames = Math.ceil((settlesIn(response) / 1000) * FPS)
  const keys: { t: number; s: Value }[] = []
  for (let f = 0; f <= frames; f++) {
    const p = f === frames ? 1 : spring(response, f / FPS)
    keys.push({ t: start + f, s: from.map((a, n) => round(a + (to[n]! - a) * p)) })
  }
  return keys
}

const still = <T>(k: T): { a: 0; k: T } => ({ a: 0, k })

const INK = still([0, 0, 0, 1])

function place(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    o: still(100),
    r: still(0),
    p: still([MID, MID, 0]),
    a: still([0, 0, 0]),
    s: still([100, 100, 100]),
    ...extra,
  }
}

const GROUP_PLACE = {
  ty: 'tr',
  p: still([0, 0]),
  a: still([0, 0]),
  s: still([100, 100]),
  r: still(0),
  o: still(100),
  sk: still(0),
  sa: still(0),
}

function stroke(width: number): Record<string, unknown> {
  return { ty: 'st', c: INK, o: still(100), w: still(width), lc: 2, lj: 2, ml: 4 }
}

function layer(
  ind: number,
  name: string,
  ks: Record<string, unknown>,
  items: Record<string, unknown>[],
): Record<string, unknown> {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    /* the class configurator.css paints this layer's ink by */
    cl: `cfg-seal__${name}`,
    sr: 1,
    ks,
    ao: 0,
    shapes: [{ ty: 'gr', nm: name, it: [...items, GROUP_PLACE] }],
    ip: 0,
    op: LAST_FRAME,
    st: 0,
    bm: 0,
  }
}

/** The stamp, as Lottie's own JSON. Built once per press; it is small. */
export function stampData(): Record<string, unknown> {
  const rim = layer(
    2,
    'rim',
    place({
      o: easedOut(0, 100, 0, 6),
      r: linear(sprung(RESPONSE.settle, 0, [-10], [0])),
      s: linear(sprung(RESPONSE.settle, 0, [135, 135, 100], [100, 100, 100])),
    }),
    [
      { ty: 'sh', ks: still({ ...RIM, c: true }) },
      { ty: 'fl', c: INK, o: still(100), r: 1 },
    ],
  )

  const tick = layer(1, 'tick', place(), [
    {
      ty: 'sh',
      ks: still({
        v: TICK.map((p) => [...p]),
        i: TICK.map(() => [0, 0]),
        o: TICK.map(() => [0, 0]),
        c: false,
      }),
    },
    { ty: 'tm', s: still(0), e: easedOut(0, 100, 8, 20), o: still(0), m: 1 },
    stroke(TICK_WIDTH),
  ])

  const rays = layer(3, 'rays', place(), [
    ...Array.from({ length: RAYS }, (_, k) => {
      const angle = ((k + 0.5) / RAYS) * 2 * Math.PI - Math.PI / 2
      const at = (r: number): number[] => [round(Math.cos(angle) * r), round(Math.sin(angle) * r)]
      return {
        ty: 'sh',
        ks: still({
          v: [at(RAY_FROM), at(RAY_TO)],
          i: [
            [0, 0],
            [0, 0],
          ],
          o: [
            [0, 0],
            [0, 0],
          ],
          c: false,
        }),
      }
    }),
    /* the dash leaves the rim and runs out: its head is drawn first, then its tail follows */
    { ty: 'tm', s: easedOut(0, 100, 18, 32), e: easedOut(0, 100, 14, 26), o: still(0), m: 1 },
    stroke(RAY_WIDTH),
  ])

  /* the ring the stamp presses into the paper as it lands: it appears at the moment of contact,
     when the rim is within a tenth of its rest size, and is gone before the first ray is drawn */
  const ripple = layer(
    4,
    'ripple',
    place({
      o: linear([
        { t: 4, s: [0] },
        { t: 5, s: [60] },
        { t: 14, s: [0] },
      ]),
      s: linear([
        { t: 0, s: [100, 100, 100] },
        ...sprung(RESPONSE.settle, 5, [100, 100, 100], [118, 118, 100]),
      ]),
    }),
    [{ ty: 'el', p: still([0, 0]), s: still([RIPPLE, RIPPLE]), d: 1 }, stroke(RIPPLE_WIDTH)],
  )

  return {
    v: '5.7.0',
    nm: 'The seal on a given quote',
    fr: FPS,
    ip: 0,
    op: LAST_FRAME,
    w: SEAL_BOX,
    h: SEAL_BOX,
    ddd: 0,
    assets: [],
    /* the first layer is drawn on top */
    layers: [tick, rim, rays, ripple],
  }
}
