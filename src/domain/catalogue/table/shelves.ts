/* ============================================================
   THE PICTURES DOOR'S SHELVES — how a table's cards stand when the
   table is read by its pictures. Pure: no React, no DOM, no store.

   ONE SHELF PER HEADING, IN THE FILE'S ORDER, and on each shelf the
   cards this browser holds a picture of stand apart from the ones it
   does not. The second critique found the door drawing every model
   with no picture as a grey tile printing the same 22 words — on
   Highfield's Roll-Up, 7 of 8 tiles were one refusal, repeated
   (docs/directions/built-critique-m2-close.md §9). So a shelf is two
   things, never one grid of both: its PICTURES, drawn as pictures, and
   its NAMES, the models with no picture, drawn as a short price list
   beside them — each still a press onto the price list, and the reason
   said once for the whole door.

   THE SHAPE FOLLOWS WHAT THE SHELF HOLDS, so honest emptiness is
   composed rather than left over (the app's rule (e)):

     feature   one picture and nothing else — Highfield's Coaster is one
               model — drawn as one wide plate with its words beside it,
               not one small card on an empty floor;
     spread    one or two pictures and some names — Roll-Up is 1 and 7 —
               the pictures large on the left, the names beside them;
     wall      three pictures or more, and the names (if any) beside;
     names     no picture at all on this shelf: the names alone.

   THE LEAD A SHELF'S NAMES SHARE IS SAID ONCE. Stacer names every row
   "Stacer - 309 Skimma" and Mackay "MACKAY MLKR Series Trailer -
   MLKR4250-13"; the maker's mark heads the sheet and the series heads
   the shelf, so a card prints what is its own ("309 Skimma",
   "MLKR4250-13") and its accessible name keeps the whole. The lead is
   cut only at a spaced dash, only where every name on the shelf carries
   it, and never so that a name is left empty. Measured on 2026-09-24
   at 1440 × 900 before this: 43 of Stacer's 91 card names and 122 of
   Mackay's 125 ended in "…".
   ============================================================ */

/** What a shelf needs to know of a card. */
export interface ShelfItem {
  name: string
  /** the heading it is filed under, or '' */
  under: string
  /** the picture this browser holds of it, or null */
  picture: unknown
  /** true when the file gives an address this browser holds no copy of */
  linkedOnly: boolean
}

export type ShelfShape = 'feature' | 'spread' | 'wall' | 'names'

export interface Shelf<C> {
  under: string
  /** the cards drawn as pictures, in the file's order */
  pictured: C[]
  /** the cards with no picture here, in the file's order */
  bare: C[]
  shape: ShelfShape
  /** what every name on the shelf begins with, which each card drops */
  lead: string
}

export interface Tally {
  cards: number
  pictured: number
  bare: number
  /** of the bare, how many the file gives an address for */
  linked: number
  /** how many shelves hold a card with no picture */
  shelvesWithBare: number
}

/** The dashes a price file separates a maker's words from a model's with. */
const SEPARATORS = [' - ', ' – ', ' — '] as const

/**
 * The longest lead every name shares that ends at a spaced dash and
 * leaves every name something of its own. '' when there are fewer than
 * two names, or no such lead.
 */
export function sharedLead(names: readonly string[]): string {
  if (names.length < 2) return ''
  const first = names[0]!
  let best = ''
  for (const sep of SEPARATORS) {
    for (let at = first.indexOf(sep); at >= 0; at = first.indexOf(sep, at + 1)) {
      const lead = first.slice(0, at + sep.length)
      if (lead.length <= best.length) continue
      if (names.every((n) => n.startsWith(lead) && n.slice(lead.length).trim() !== '')) best = lead
    }
  }
  return best
}

/** A name with its shelf's lead taken off; the whole name where the lead is not its own. */
export function shortName(name: string, lead: string): string {
  if (lead === '' || !name.startsWith(lead)) return name
  const rest = name.slice(lead.length).trim()
  return rest === '' ? name : rest
}

export function shapeOf(pictured: number, bare: number): ShelfShape {
  if (pictured === 0) return 'names'
  if (pictured >= 3) return 'wall'
  if (bare > 0) return 'spread'
  return pictured === 1 ? 'feature' : 'wall'
}

/**
 * The cards on shelves: one per heading, in the order the file gives
 * them, a heading that recurs after another starting a shelf of its
 * own. A shelf of one card drops the lead the whole door shares.
 */
export function shelvesOf<C extends ShelfItem>(cards: readonly C[]): Shelf<C>[] {
  const groups: { under: string; cards: C[] }[] = []
  for (const card of cards) {
    const last = groups[groups.length - 1]
    if (last && last.under === card.under) last.cards.push(card)
    else groups.push({ under: card.under, cards: [card] })
  }
  const doorLead = sharedLead(cards.map((c) => c.name))
  return groups.map(({ under, cards: on }) => {
    const pictured = on.filter((c) => c.picture !== null && c.picture !== undefined)
    const bare = on.filter((c) => c.picture === null || c.picture === undefined)
    const own = sharedLead(on.map((c) => c.name))
    return {
      under,
      pictured,
      bare,
      shape: shapeOf(pictured.length, bare.length),
      lead: own.length >= doorLead.length ? own : doorLead,
    }
  })
}

/** What the door holds, counted once for its one sentence. */
export function tallyOf(shelves: readonly Shelf<ShelfItem>[]): Tally {
  let pictured = 0
  let bare = 0
  let linked = 0
  let shelvesWithBare = 0
  for (const s of shelves) {
    pictured += s.pictured.length
    bare += s.bare.length
    linked += s.bare.filter((c) => c.linkedOnly).length
    if (s.bare.length > 0) shelvesWithBare += 1
  }
  return { cards: pictured + bare, pictured, bare, linked, shelvesWithBare }
}
