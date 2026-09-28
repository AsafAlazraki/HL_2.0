import type { ReactNode } from 'react'
import type { TableKind } from '@/domain/model'
import { KIND_GLYPH, STATE_GLYPH, kindInk, type QuoteState } from './glyphs'
import { Icon } from './Icon'

/* ============================================================
   WHERE A QUOTE STANDS, AND WHAT A BAND OF A REGISTER HOLDS.

   The register's bands were ○ ● ⊖ in the system font, all one navy
   (audit.md rows 56, 59), and draft, given and superseded shared one
   ink. In the kit each state has its own ink — draft rose, given leaf,
   superseded graphite (tokens.css, THE KIT) — ALWAYS BESIDE ITS WORD:
   a dot for a row, where the word is short and the row is dense; a
   glyph for a band's head, where the band is named once.
   ============================================================ */

/**
 * A state as a dot with its word: "● Draft". The dot is hidden from a reader; the word is it.
 *
 * `size="inherit"` sets the word in whatever it stands in — an 11px capital eyebrow on the
 * cascade and the build's masthead, which each drew their own dot because the primitive had
 * one size (2026-09-28, the verify round). The dot keeps its own size and ink either way.
 */
export function StatusDot({
  state,
  size = 'sm',
  children,
}: {
  state: QuoteState
  size?: 'sm' | 'inherit'
  children: string
}) {
  return (
    <span className="ui-status" data-state={state} data-size={size}>
      <span className="ui-status-dot" aria-hidden="true" />
      {children}
    </span>
  )
}

const COUNT = new Intl.NumberFormat('en-AU')

/**
 * THE HEAD OF A BAND OF A REGISTER — a state's or a kind's glyph in its ink, the band's name,
 * and how many it holds. A heading, because it names what follows (`h3` unless the screen's
 * outline wants another level). The count is part of the heading a reader hears.
 */
export interface BandHeadProps {
  children: string
  state?: QuoteState
  kind?: TableKind
  count?: number
  level?: 'h2' | 'h3' | 'h4'
  /** A quiet act at the band's end — "Show all 209" — the screen's own. */
  end?: ReactNode
}

export function BandHead({ children, state, kind, count, level = 'h3', end }: BandHeadProps) {
  const H = level
  const glyph = state ? STATE_GLYPH[state] : kind ? KIND_GLYPH[kind] : null
  return (
    <div className="ui-bandhead" data-state={state} data-ink={kind ? kindInk(kind) : undefined}>
      <H className="ui-bandhead-title">
        {glyph ? (
          <span className="ui-bandhead-glyph">
            <Icon glyph={glyph} weight={state ? 'bold' : 'fill'} />
          </span>
        ) : null}
        <span>{children}</span>
        {count === undefined ? null : (
          <span className="ui-bandhead-count">{COUNT.format(count)}</span>
        )}
      </H>
      {end ? <span className="ui-bandhead-end">{end}</span> : null}
    </div>
  )
}
