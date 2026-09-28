import { ArrowRightIcon } from '@phosphor-icons/react'
import type { MouseEvent, ReactNode } from 'react'
import type { TableKind } from '@/domain/model'
import { Icon } from './Icon'
import { KindMark } from './KindMark'

/**
 * A LINE IN A LIST THAT OPENS SOMETHING: a register in Data, a quote on a customer's page, a
 * maker in a rail. Board C's `.reg`: the kind's glyph in its ink, the name bold with a quiet
 * note after it, a count in a small well, and an arrow at the end that slides forward under
 * the pointer. The current one is washed with the plate's blue and carries the accent's edge,
 * because "where you are" is the accent's job.
 *
 * The audit counted a dozen of these drawn by hand, whose press changed nothing (audit.md
 * rows 57, 63, 70, 73): here a press is answered, and a row with an address is a real link
 * a person can open in a new tab (the `href` rule `Button` states).
 *
 * A register that holds the keyboard itself — a grid pointing at its cursor row with
 * `aria-activedescendant` — draws its rows with `as="div"`: the same drawing, no focus of its
 * own, and `current` then marks the cursor.
 */
export interface RowProps {
  title: string
  note?: string
  kind?: TableKind
  count?: number
  current?: boolean
  onPress?: () => void
  href?: string
  as?: 'button' | 'div'
  /** Anything the screen prints before the arrow in place of a count — a figure, a dot. */
  trail?: ReactNode
  id?: string
}

const COUNT = new Intl.NumberFormat('en-AU')

export function Row({
  title,
  note,
  kind,
  count,
  current,
  onPress,
  href,
  as = 'button',
  trail,
  id,
}: RowProps) {
  const face = (
    <>
      {kind ? <KindMark kind={kind} size="sm" /> : <span aria-hidden="true" />}
      <span className="ui-row-title">
        {title}
        {note ? <span className="ui-row-note">{note}</span> : null}
      </span>
      {trail ??
        (count === undefined ? (
          <span />
        ) : (
          <span className="ui-row-count">{COUNT.format(count)}</span>
        ))}
      <span className="ui-row-go" aria-hidden="true">
        <Icon glyph={ArrowRightIcon} />
      </span>
    </>
  )
  if (as === 'div')
    return (
      <div className="ui-row" id={id} data-current={current ? '' : undefined}>
        {face}
      </div>
    )
  if (href !== undefined)
    return (
      <a
        className="ui-row"
        id={id}
        href={href}
        aria-current={current ? 'page' : undefined}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (!onPress || event.button !== 0) return
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          onPress()
        }}
      >
        {face}
      </a>
    )
  return (
    <button
      type="button"
      className="ui-row"
      id={id}
      aria-current={current ? 'true' : undefined}
      onClick={onPress}
    >
      {face}
    </button>
  )
}
