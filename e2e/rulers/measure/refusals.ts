/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- `plantRefusals` runs INSIDE the page:
   Playwright serialises it and evaluates it with no closure, so its helpers cannot be hoisted
   out of it without breaking at runtime. */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/* ============================================================
   EVERY REFUSAL THE PRIMITIVES CAN SAY, ON EVERY GROUND THEY STAND
   ON — the board the refusal ruler reads in both themes.

   WHY A BOARD AND NOT ONLY A WALK. The sentence under a refused
   control is inked by ONE rule per context in src/ui — the frame's
   intent and size for a button, its tone for a tile, the popup for a
   menu or a select item — and on 2026-09-24 three of those rules, four contexts, were
   inked for the dark room the morning the day became the default
   (1.23 : 1 on a plate, measured by the second close's critic). A walk
   reaches the refusals a screen says TODAY; most of the app's refusals
   are said only in a state a walk would have to engineer (a file
   being read, a capability a route did not wire, a quote already
   given), and the next screen to put one somewhere new would ship it
   unread. The board puts every context the primitives declare in front
   of the ruler at once, each on the ground it is drawn for — the room
   and a plate, which change with the theme; paper, which does not; the
   popup menus and selects are drawn in — with the app's own stylesheet
   and tokens. So a rule that is wrong for either theme is red the day
   it is written, whichever screen would have said it first.

   THE CONTEXTS ARE READ OFF THE PRIMITIVES' OWN PROPS, not listed
   here: `intent`, `size`, `tone` and `shape` are parsed out of
   src/ui/Button.tsx and src/ui/Tile.tsx, so an intent added there joins
   the board the day it is declared — and stops it, with a sentence,
   until `DRAWN_FOR` below says which ground it is drawn for. The
   markup is the shape those
   primitives render — the frame carrying the same two attributes as
   the control, the control `aria-disabled`, the sentence a `.ui-refusal`
   child of the frame — and `Button.test.tsx` and `Tile.test.tsx` pin
   that shape from the primitives' side, so the board cannot drift from
   what a screen actually draws.

   ONE CONTEXT IS NOT ON THE BOARD, AND IS READ WHERE IT STANDS. A door
   (`size="door"`) that can refuse stands on entry B's dusk photograph,
   and a flat block of the room is not that ground: planting one here
   would measure a colour it never meets. `refusal.spec.ts` reaches the
   real one instead — both of entry's doors refuse while the file is
   being read — and measures its sentence off the pixels.
   ============================================================ */

/**
 * THE GROUNDS A REFUSAL STANDS ON. The room and a plate change with the theme; paper does not
 * (`--color-paper` is the one light sheet in both), and a popup is the white card a menu or a
 * select is drawn in, in both.
 */
export type Ground = 'room' | 'plate' | 'paper' | 'popup'

export interface Specimen {
  primitive: 'button' | 'tile' | 'menu' | 'select'
  /** the frame's own data attributes — the only thing a refusal's ink is chosen by */
  attrs: Record<string, string>
  ground: Ground
}

const ON_THE_ROOM: Ground[] = ['room', 'plate']
const ON_PAPER: Ground[] = ['paper']

/**
 * WHICH GROUND EACH CONTEXT IS DRAWN FOR, in the primitives' own words. It is stated here and
 * not guessed, and a context the primitives declare that is not in this table stops the board
 * with a sentence: a new intent or tone must say where it stands before it can be read.
 *
 *   · Button.tsx: `veiled` and `act` are "drawn for a dark ground", the room — which since
 *     2026-09-24 is the day's blue by default and the night's navy when chosen. A plate is
 *     the white or navy panel cut from that room.
 *   · tokens.css, "the pairs the primitives in src/ui make, on the white surfaces they are
 *     drawn for": every other intent is a paper control — a white fill, navy ink, neither of
 *     which turns with the theme.
 *   · Tile.tsx: `tone` IS "the ground this tile stands on".
 */
const DRAWN_FOR: Record<string, Record<string, Ground[]>> = {
  intent: {
    act: ON_THE_ROOM,
    veiled: ON_THE_ROOM,
    primary: ON_PAPER,
    secondary: ON_PAPER,
    quiet: ON_PAPER,
  },
  tone: { room: ON_THE_ROOM, paper: ON_PAPER },
}

const UI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'src', 'ui')

/**
 * The string members of one optional prop's union, read out of a primitive's source:
 * `intent?: 'primary' | 'secondary'` gives `['primary', 'secondary']`. A prop that is not
 * found is an error, never an empty list — an empty board reports clean.
 */
export function unionOf(source: string, prop: string): string[] {
  const m = new RegExp(String.raw`\b${prop}\?:\s*((?:'[a-z-]+'\s*\|?\s*)+)`).exec(source)
  if (!m) throw new Error(`no \`${prop}?:\` union of string literals in this source`)
  return [...m[1]!.matchAll(/'([a-z-]+)'/g)].map((x) => x[1]!)
}

function groundsFor(prop: string, value: string): Ground[] {
  const grounds = DRAWN_FOR[prop]?.[value]
  if (!grounds)
    throw new Error(
      `The primitives declare ${prop}="${value}" and the refusal board does not know which ground it is drawn for. Say so in DRAWN_FOR (e2e/rulers/measure/refusals.ts) before it can be read.`,
    )
  return grounds
}

/** The two primitives whose props say which contexts exist, as source text. */
export interface Sources {
  button: string
  tile: string
}

export const primitiveSources = (): Sources => ({
  button: readFileSync(path.join(UI, 'Button.tsx'), 'utf8'),
  tile: readFileSync(path.join(UI, 'Tile.tsx'), 'utf8'),
})

/** Every context the primitives declare, each on every ground it is drawn for. */
export function specimens({ button, tile }: Sources = primitiveSources()): Specimen[] {
  const out: Specimen[] = []
  for (const intent of unionOf(button, 'intent'))
    for (const ground of groundsFor('intent', intent))
      for (const size of unionOf(button, 'size').filter((s) => s !== 'door'))
        out.push({ primitive: 'button', attrs: { intent, size }, ground })
  for (const tone of unionOf(tile, 'tone'))
    for (const ground of groundsFor('tone', tone))
      for (const shape of unionOf(tile, 'shape'))
        out.push({ primitive: 'tile', attrs: { tone, shape }, ground })
  out.push({ primitive: 'menu', attrs: {}, ground: 'popup' })
  out.push({ primitive: 'select', attrs: {}, ground: 'popup' })
  return out
}

/**
 * Runs IN THE PAGE. Replaces what the app drew with the board — the stylesheets and the
 * tokens stay, which is the point — and returns how many refusals it planted. The grounds
 * are the tokens themselves, so a theme worn afterwards moves them exactly as it moves a
 * screen.
 */
export function plantRefusals(board: Specimen[]): number {
  const fill: Record<Ground, string> = {
    room: 'var(--color-ground)',
    plate: 'var(--color-panel)',
    paper: 'var(--color-paper)',
    /* the popup paints its own white; the block it floats over is the room */
    popup: 'var(--color-ground)',
  }
  const make = (tag: string, cls: string, attrs: Record<string, string>): HTMLElement => {
    const el = document.createElement(tag)
    if (cls) el.className = cls
    for (const [k, v] of Object.entries(attrs)) el.dataset[k] = v
    return el
  }
  const refusal = (said: string): HTMLElement => {
    const el = make('span', 'ui-refusal', {})
    el.textContent = said
    return el
  }
  const named = (s: Specimen): string =>
    `${s.primitive}${Object.values(s.attrs).length ? ` ${Object.values(s.attrs).join(' ')}` : ''} on the ${s.ground}`

  const root = make('main', '', { refusalBoard: '' })
  root.style.cssText = 'display:grid;gap:0;margin:0'
  const blocks = new Map<Ground, HTMLElement>()
  for (const ground of ['room', 'plate', 'paper', 'popup'] as const) {
    const block = make('section', '', { ground })
    block.style.cssText = `display:grid;gap:24px;padding:24px;background:${fill[ground]}`
    blocks.set(ground, block)
    root.append(block)
  }

  for (const s of board) {
    const said = `The reason a refused ${named(s)} gives, read where it stands.`
    let frame: HTMLElement
    if (s.primitive === 'button' || s.primitive === 'tile') {
      frame = make('span', `ui-${s.primitive}-frame`, s.attrs)
      const control = make('button', `ui-${s.primitive}`, s.attrs)
      control.setAttribute('type', 'button')
      control.setAttribute('aria-disabled', 'true')
      control.textContent = `A refused ${named(s)}`
      frame.append(control, refusal(said))
    } else {
      frame = make('div', s.primitive === 'menu' ? 'ui-menu' : 'ui-select-popup', {})
      const item = make('div', `ui-${s.primitive}-item`, {})
      item.setAttribute('aria-disabled', 'true')
      const label = make(
        'span',
        s.primitive === 'menu' ? 'ui-menu-label' : 'ui-select-item-text',
        {},
      )
      label.textContent = `A refused ${named(s)}`
      item.append(label, refusal(said))
      frame.append(item)
    }
    const cell = document.createElement('div')
    cell.append(frame)
    blocks.get(s.ground)!.append(cell)
  }

  document.body.replaceChildren(root)
  return document.querySelectorAll('[data-refusal-board] .ui-refusal').length
}
