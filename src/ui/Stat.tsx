import type { TableKind } from '@/domain/model'
import { Figure } from './Figure'
import { KindMark } from './KindMark'

/**
 * A COUNT AND WHAT IT COUNTS: "289 boats", "6 Yamahas paired". Home's counted kinds, the
 * register's tallies, the book's figures and Data's counts were each "a number over caps"
 * drawn per screen, every one alike whatever it counted (audit.md rows 34, 59, 68). This is
 * one of them: the figure large and bold in tabular figures, what it counts beneath in the
 * room's second ink, and the kind's glyph in its ink where the count is of a kind.
 *
 * A COUNT IS NEVER THE PRICE. `live` hands the figure to NumberFlow, for a count that changes
 * in front of the reader (a find narrowing); a count that is set once when the file lands is
 * plain text, because a figure spinning up from nought on its first paint reads as a figure
 * still being decided (Figure.tsx says the same).
 */
export interface StatProps {
  value: number
  /** What it counts, in words: "boats", "Yamahas paired with the 529". */
  label: string
  kind?: TableKind
  live?: boolean
}

const COUNT = new Intl.NumberFormat('en-AU')

export function Stat({ value, label, kind, live }: StatProps) {
  return (
    <div className="ui-stat">
      {kind ? <KindMark kind={kind} size="lg" /> : null}
      <span className="ui-stat-figure">
        {live ? <Figure value={value} /> : <data value={String(value)}>{COUNT.format(value)}</data>}
      </span>
      <span className="ui-stat-label">{label}</span>
    </div>
  )
}
