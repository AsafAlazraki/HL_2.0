import {
  ClockCounterClockwiseIcon,
  DatabaseIcon,
  FilePlusIcon,
  FileTextIcon,
  HouseIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { DOORS, START_A_QUOTE } from '@/app/ways'
import type { Glyph } from '@/ui'

/* ============================================================
   ONE GLYPH PER PLACE, SO A PLACE LOOKS THE SAME EVERYWHERE IT IS
   OFFERED (the component kit, 2026-09-28).

   The kit's rule for a kind — "a motor is the same engine in a
   chapter, a select, a register row and an undo toast" (src/ui/
   glyphs.ts) — said of a PLACE. The pill prints the five doors, the
   finder offers them as rows, and the dead end offers the one the
   pill does not carry; each reads this map, so Quotes is the same
   paper on all three and a dealer learns it once.

   Keyed by the address `src/app/ways.ts` spells, never by a word, so
   a door renamed on the pill keeps its glyph and a door added there
   without one fails `glyphs.test.ts` rather than standing bare.

   WHY THESE: Home is the house (not the storefront, which is the
   dealer KIND's glyph); Quotes is the paper, the same glyph the kit
   gives "Open the paper"; Data is the file's own drum, the one Entry's
   door opens; History reads back, so it is the clock turning back;
   starting a quote is a new paper.
   ============================================================ */

export const WAY_GLYPH: Readonly<Record<string, Glyph>> = {
  '/': HouseIcon,
  '/quotes': FileTextIcon,
  '/customers': UsersIcon,
  '/data': DatabaseIcon,
  '/history': ClockCounterClockwiseIcon,
  [START_A_QUOTE.href]: FilePlusIcon,
}

/** The glyph a way is drawn with, or null for an address this app offers no glyph for. */
export function glyphOfWay(href: string): Glyph | null {
  return WAY_GLYPH[href] ?? null
}

/** The doors in the pill's order, each with its glyph — the list the pill draws. */
export const DOOR_GLYPHS: readonly { href: string; glyph: Glyph | null }[] = DOORS.map((d) => ({
  href: d.href,
  glyph: glyphOfWay(d.href),
}))
