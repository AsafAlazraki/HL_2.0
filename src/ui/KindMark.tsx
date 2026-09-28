import type { TableKind } from '@/domain/model'
import { KIND_GLYPH, kindInk } from './glyphs'
import { Icon } from './Icon'

/**
 * WHAT A THING IS, AS A GLYPH IN ITS OWN INK: a boat's hull in cobalt, a motor's engine in
 * carmine, a trailer in ochre — board C's `.kind`, a filled glyph in a small square washed with
 * the same ink. The audit found kinds told apart by a 6px dot and an 11px caps word, or not at
 * all (audit.md rows 34, 43, 73); this is the one drawing of a kind the app has.
 *
 * It stands BESIDE a word that says the same thing, never instead of it, so it is hidden from
 * a reader unless `label` names it. The ink is the model's (`TABLE_KINDS`), fixed: Northside
 * moving its accent does not move a motor.
 */
export interface KindMarkProps {
  kind: TableKind
  size?: 'sm' | 'md' | 'lg'
  /** Only where the mark is the only statement of the kind. */
  label?: string
}

export function KindMark({ kind, size = 'md', label }: KindMarkProps) {
  return (
    <span
      className="ui-kind"
      data-kind={kind}
      data-ink={kindInk(kind)}
      data-size={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon glyph={KIND_GLYPH[kind]} weight="fill" size={size === 'lg' ? 'md' : 'sm'} />
    </span>
  )
}
