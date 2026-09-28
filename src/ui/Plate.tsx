import type { ReactNode } from 'react'

/**
 * A PLATE: board C's one material, a white surface lifted off the room on its own shadow —
 * "the day, wherever it stands". Every panel, card and sheet a screen draws for itself was a
 * flat fill or a hairline box, square on nine screens and round on four (audit.md, "The
 * finding"); a screen that needs a surface takes this one, and its shape is the kit's.
 *
 * WHAT IT HOLDS READS THE DAY'S INKS IN BOTH THEMES (`data-ground='plate'`, tokens.css THE
 * PLATE): at night a white plate on the navy room still sets navy words on white, which is
 * the whole idea of "white plates on the navy room".
 *
 * `tint` is the plate's pale blue well, for a surface inside a surface. The padding is one of
 * three steps and the element is the screen's choice of landmark; nothing else about it is.
 */
export interface PlateProps {
  children: ReactNode
  /** `li` for a plate that is one of a list's items (the cascade's cards, 2026-09-28). */
  as?: 'div' | 'section' | 'article' | 'aside' | 'li'
  pad?: 'none' | 'sm' | 'md' | 'lg'
  tint?: boolean
  /** An accessible name, for a `section` or an `aside` that is a landmark. */
  label?: string
  /** The id of the heading that names it, when it has one. */
  labelledBy?: string
}

export function Plate({
  children,
  as: As = 'div',
  pad = 'md',
  tint,
  label,
  labelledBy,
}: PlateProps) {
  return (
    <As
      className="ui-plate"
      data-ground="plate"
      data-pad={pad}
      data-tint={tint ? '' : undefined}
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {children}
    </As>
  )
}
