import {
  BarcodeIcon,
  DatabaseIcon,
  EyeSlashIcon,
  ImageIcon,
  InfoIcon,
  LockSimpleIcon,
  PercentIcon,
  ScrollIcon,
  StackIcon,
  TextAaIcon,
  UserIcon,
  WrenchIcon,
} from '@phosphor-icons/react'
import type { Glyph } from '@/ui'
import { levelGlyph } from '@/screens/configurator/glyphs'

/* ============================================================
   THE DESK NOTE'S GLYPHS (the component kit, 2026-09-28).

   THE NOTE IS A LIST A DEALER SCANS, NOT READS: a customer at the
   desk asks "what about tax?" or "who is it made out to?", and the
   eye has to land on that fact among a dozen. So each fact's word is
   led by the glyph of what it is about — a person, the drum of the
   price file, a lock on figures that can no longer move — in the
   file's blue, the way the kit leads a band's name with its glyph.
   Nothing is drawn on the paper: the printed page stays paper.

   THE LEVEL IS THE BUILD'S OWN GLYPH (money for Cash, a handshake for
   Trade), imported rather than chosen again, so the rung reads the
   same on the build, the cascade and beside the paper.

   A picture travels under the name the build's stage gives it, from
   the picker's own spelling (src/screens/picker/travel.ts), so the
   photograph the finale was showing lands on the paper's cover.
   ============================================================ */

export const DESK_GLYPH = {
  addressed: UserIcon,
  leftOff: EyeSlashIcon,
  alsoOffered: StackIcon,
  why: InfoIcon,
  workshop: WrenchIcon,
  file: DatabaseIcon,
  codes: BarcodeIcon,
  tax: PercentIcon,
  terms: ScrollIcon,
  figures: LockSimpleIcon,
  letterhead: TextAaIcon,
  picture: ImageIcon,
} as const satisfies Record<string, Glyph>

/** The glyph of the level a quote is priced at, by its key: the build's own pairing. */
export const pricedAtGlyph = (key: string | undefined): Glyph => levelGlyph(key ?? '')

export { boatTravel } from '@/screens/picker/travel'
