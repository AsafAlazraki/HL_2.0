import { CaretDownIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import type { TableKind } from '@/domain/model'
import { Icon } from './Icon'
import { KindMark } from './KindMark'
import { transition } from './motion'
import { useStill } from './MotionRoot'
import { PriceFigure } from './PriceFigure'

/**
 * A CHAPTER OF THE BUILD, with the head that opens it — "02 · Motor", how many the file pairs,
 * one sentence of what the figure beside each option means, the chapter's subtotal and a
 * caret. The spine of the sale, and the audit's weakest control on it: hover changed 0.4% of
 * its pixels, a press nothing, and it opened by a cut (audit.md row 43).
 *
 * In the kit the head carries the KIND of what the chapter chooses as a glyph in its ink in a
 * disc — a motor's carmine engine — its count in the same ink, and a caret that turns over as
 * it opens; the body OPENS BY HEIGHT AND OPACITY on the travel spring and closes faster, so a
 * chapter grows out of its head instead of appearing below it. Under reduced motion, or while
 * a caret is in a field, it opens at once and only fades.
 *
 * THE SUBTOTAL IS A PRICE and never moves: it is a `PriceFigure`, outside everything that
 * animates. The head is a real button with `aria-expanded` and `aria-controls`, and the body
 * is the region it names.
 *
 * WHAT THE BUILD ASKED OF IT, 2026-09-28 (the verify round): a chapter with no subtotal says
 * WHY in its own words (`empty`: "Nothing on it yet", "Not priced on this quote") where a dash
 * stood, because a dash is a figure's absence and not its reason; and the head can stand in a
 * heading (`level`), the accordion's own pattern — a heading holding its button — so the
 * build's outline still has its chapters in it. It was already the screen's to open: `open`
 * is handed in, so a search can open every chapter with an answer at once.
 */
export interface ChapterProps {
  /** "02" — the chapter's place in the build. */
  number: string
  title: string
  kind?: TableKind
  /** "6 paired" */
  count?: string
  /** One sentence under the title. */
  say?: string
  /** The chapter's subtotal; `null` when nothing in it is priced yet. */
  total?: number | null
  /** Why there is no subtotal, said where it would stand: "Nothing on it yet". */
  empty?: string
  /** The heading the head stands in, when the screen's outline wants one. */
  level?: 'h2' | 'h3' | 'h4'
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Chapter({
  number,
  title,
  kind,
  count,
  say,
  total,
  empty,
  level,
  open,
  onOpenChange,
  children,
}: ChapterProps) {
  const body = useId()
  const reduce = useReducedMotion()
  const still = useStill()
  const quiet = Boolean(reduce) || still
  const head = (
    <button
      type="button"
      className="ui-chapter-head"
      aria-expanded={open}
      aria-controls={open ? body : undefined}
      onClick={() => onOpenChange(!open)}
    >
      {kind ? (
        <KindMark kind={kind} size="lg" />
      ) : (
        <span className="ui-chapter-no" aria-hidden="true">
          {number}
        </span>
      )}
      <span className="ui-chapter-words">
        <span className="ui-chapter-title">
          {kind ? `${number} · ${title}` : title}
          {count ? <span className="ui-chapter-count">{count}</span> : null}
        </span>
        {say ? <span className="ui-chapter-say">{say}</span> : null}
      </span>
      {total === undefined ? null : (
        <span className="ui-chapter-total" data-empty={total === null ? '' : undefined}>
          {total === null ? (empty ?? '—') : <PriceFigure amount={total} size="lg" />}
        </span>
      )}
      <span className="ui-chapter-caret" aria-hidden="true">
        <Icon glyph={CaretDownIcon} />
      </span>
    </button>
  )
  const H = level
  return (
    <section className="ui-chapter" data-open={open ? '' : undefined}>
      {H ? <H className="ui-chapter-heading">{head}</H> : head}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.section
            key="body"
            id={body}
            aria-label={title}
            className="ui-chapter-body"
            initial={quiet ? { opacity: 0 } : { height: 0, opacity: 0 }}
            /* always to its whole height: a caret arriving mid-open once stopped the height
               where it stood (the build's own chapter, 2026-09-29); quiet, it lands at once */
            animate={{ height: 'auto', opacity: 1 }}
            exit={
              quiet
                ? { opacity: 0, transition: transition('exit', true) }
                : { height: 0, opacity: 0, transition: transition('exit', false) }
            }
            transition={transition('travel', quiet)}
          >
            <div className="ui-chapter-inner">{children}</div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
