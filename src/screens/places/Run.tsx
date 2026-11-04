import type { ReactNode } from 'react'

/* ============================================================
   A RUN OF FACTS, a dot between each two, that NEVER BEGINS A LINE ON A
   DOT AND NEVER ENDS ONE ON IT.

   The verifier of round 1 found "· 25–30 hp" opening a wrapped line on
   the SP300's card and "· 250 hp to 350" on the Sport 800's, though a
   dot held to the fact before it had been reported fixed: a dot either
   side of a break is still a dot at a line's edge. Here each fact
   carries its dot in the gap before it, and the run is drawn one gap
   to the left of its own box, which clips sideways: the fact that
   starts a line has its dot in that gap, outside the box, and it is
   never painted (`.pl-run` in places.css).
   ============================================================ */

export function Run({
  items,
  className,
  as: Tag = 'span',
}: {
  /** each fact; a null is no fact and is not drawn */
  items: readonly ReactNode[]
  className?: string
  as?: 'span' | 'p'
}) {
  const shown = items.filter((i) => i !== null && i !== undefined && i !== false && i !== '')
  if (shown.length === 0) return null
  return (
    <Tag className={['pl-run', className].filter(Boolean).join(' ')}>
      <span className="pl-run__in">
        {shown.map((item, i) => (
          // the facts are fixed for a line and never reorder, so their place is their key
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className="pl-run__item">
            {item}
          </span>
        ))}
      </span>
    </Tag>
  )
}
