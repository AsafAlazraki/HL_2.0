import {
  ArrowsClockwiseIcon,
  BoatIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  EngineIcon,
  PackageIcon,
  StorefrontIcon,
  TableIcon,
  ToolboxIcon,
  TruckTrailerIcon,
} from '@phosphor-icons/react'
import { TABLE_KINDS, type AccentKey, type TableKind } from '@/domain/model'
import type { Glyph } from './Icon'

/* ============================================================
   THE KIT'S GLYPHS FOR WHAT A THING IS AND WHERE A QUOTE STANDS.

   One glyph per kind and per state, app-wide, so a motor is the same
   engine in a chapter, a select, a register row and an undo toast —
   the audit's change 2 and change 7 (docs/research/refs/components/
   audit.md). The kind's INK is the model's own: `TABLE_KINDS` gives
   each kind an accent key, and `--accent-<key>` is its colour
   (tokens.css), so nothing here chooses a colour.
   ============================================================ */

export const KIND_GLYPH: Record<TableKind, Glyph> = {
  boat: BoatIcon,
  motor: EngineIcon,
  trailer: TruckTrailerIcon,
  accessory: ToolboxIcon,
  package: PackageIcon,
  dealer: StorefrontIcon,
  custom: TableIcon,
}

/** The ink a kind wears: its accent key from the model's own table of kinds. */
export function kindInk(kind: TableKind): AccentKey {
  return TABLE_KINDS[kind].accent
}

/** Where a quote stands: written, given to its customer, or replaced by a newer version. */
export type QuoteState = 'draft' | 'given' | 'superseded'

/** A draft is a circle still being drawn, a given quote is ticked, a superseded one has
 *  been turned over by the version after it. */
export const STATE_GLYPH: Record<QuoteState, Glyph> = {
  draft: CircleDashedIcon,
  given: CheckCircleIcon,
  superseded: ArrowsClockwiseIcon,
}
