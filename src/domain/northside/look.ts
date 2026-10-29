/* ============================================================
   HOW THE APP LOOKS — three layers, one set of custom properties.

   docs/CUSTOMISATION.md: the defaults are tokens.css; Northside's layer
   and each person's own layer are written, in that order, into ONE
   <style> element at boot, over the SAME custom properties. A screen
   never reads a choice: it reads `var(--radius-plate)` like everything
   else and the cascade does the work.

   EVERY CHOICE IS A NAMED STEP, never a free number: three corners,
   three shadows, three spacings, two motions, and a colour that is
   measured before it is kept (`./colour.ts`). A brand refused at the
   floor is never written, whatever is stored.
   ============================================================ */

import type { OrgCorners, OrgLook, OrgMotion, OrgShadow, OrgSpacing } from '@/domain/model'
import { brandProperties, parseHex, readBrand } from './colour'

/** What one person keeps for themselves, over Northside's layer: two choices, no more. */
export interface PersonLook {
  spacing?: OrgSpacing
  motion?: OrgMotion
}

export const CORNERS: readonly { value: OrgCorners; word: string }[] = [
  { value: 'square', word: 'Square' },
  { value: 'soft', word: 'Soft' },
  { value: 'round', word: 'Round' },
]
export const SHADOWS: readonly { value: OrgShadow; word: string }[] = [
  { value: 'flat', word: 'Flat' },
  { value: 'lifted', word: 'Lifted' },
  { value: 'deep', word: 'Deep' },
]
export const SPACINGS: readonly { value: OrgSpacing; word: string }[] = [
  { value: 'close', word: 'Close' },
  { value: 'default', word: 'As designed' },
  { value: 'roomy', word: 'Roomy' },
]
export const MOTIONS: readonly { value: OrgMotion; word: string }[] = [
  { value: 'system', word: 'As the computer says' },
  { value: 'less', word: 'Less' },
]

/** The designed step of each, which writes nothing. */
export const AS_DESIGNED = {
  corners: 'round',
  shadow: 'lifted',
  spacing: 'default',
  motion: 'system',
} as const

const RADII: Record<Exclude<OrgCorners, 'round'>, Record<string, string>> = {
  /* the designed radii, halved: 16 → 8 on a plate */
  soft: {
    '--radius-xs': '2px',
    '--radius-sm': '6px',
    '--radius-md': '6px',
    '--radius-lg': '10px',
    '--radius-plate': '8px',
    '--radius-field': '6px',
    '--radius-tile': '7px',
    '--radius-glyph': '4px',
  },
  /* square enough to read as square, round enough that a corner is not a pixel's edge */
  square: {
    '--radius-xs': '2px',
    '--radius-sm': '2px',
    '--radius-md': '2px',
    '--radius-lg': '3px',
    '--radius-plate': '3px',
    '--radius-field': '2px',
    '--radius-tile': '2px',
    '--radius-glyph': '2px',
  },
}

/** The room's navy at a share, by relative colour, so no literal colour is written. */
const navy = (share: number): string => `oklch(from var(--color-neutral-950) l c h / ${share}%)`

const SHADOW_STEPS: Record<Exclude<OrgShadow, 'lifted'>, Record<string, string>> = {
  /* a hairline instead of a shadow: the plate is drawn, not lifted */
  flat: {
    '--shadow-plate': `0 0 0 1px ${navy(12)}`,
    '--shadow-lift': 'none',
  },
  /* the designed lift, twice as far and a little darker */
  deep: {
    '--shadow-plate': `0 2px 4px ${navy(10)}, 0 28px 56px -22px ${navy(48)}`,
    '--shadow-lift': '0 16px 32px -14px oklch(from var(--color-accent) calc(l - 0.2) c h / 70%)',
  },
}

const SPACING_STEPS: Record<Exclude<OrgSpacing, 'default'>, string> = {
  close: '-4px',
  roomy: '8px',
}

/** The custom properties one layer writes, in a stable order. */
export function propertiesOf(look: OrgLook | PersonLook | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!look) return out
  if ('brand' in look && look.brand) {
    const hex = parseHex(look.brand)
    if (hex && readBrand(hex).refused === null) Object.assign(out, brandProperties(hex))
  }
  if ('corners' in look && look.corners && look.corners !== 'round')
    Object.assign(out, RADII[look.corners])
  if ('shadow' in look && look.shadow && look.shadow !== 'lifted')
    Object.assign(out, SHADOW_STEPS[look.shadow])
  if (look.spacing && look.spacing !== 'default') out['--list-step'] = SPACING_STEPS[look.spacing]
  return out
}

/** The motion the app moves with: the person's own word, then Northside's, then the computer's. */
export function motionOf(org: OrgLook | undefined, person: PersonLook | undefined): OrgMotion {
  return person?.motion ?? org?.motion ?? 'system'
}

/**
 * THE ONE STYLE ELEMENT'S TEXT: Northside's layer, then the person's, each as one `:root` rule,
 * so the person's own wins where both speak and the designed value stands where neither does.
 */
export function styleText(org: OrgLook | undefined, person: PersonLook | undefined): string {
  const layer = (name: string, props: Record<string, string>): string => {
    const lines = Object.entries(props).map(([k, v]) => `  ${k}: ${v};`)
    return lines.length === 0 ? '' : `/* ${name} */\n:root {\n${lines.join('\n')}\n}\n`
  }
  return layer('Northside', propertiesOf(org)) + layer('this person', propertiesOf(person))
}

/** A person's own layer as prefs keeps it, read defensively. */
export function personLookOf(raw: unknown): PersonLook {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const v = raw as Record<string, unknown>
  const out: PersonLook = {}
  if (SPACINGS.some((s) => s.value === v.spacing)) out.spacing = v.spacing as OrgSpacing
  if (MOTIONS.some((s) => s.value === v.motion)) out.motion = v.motion as OrgMotion
  return out
}
