import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { move, transition } from './motion'

/**
 * A LIST WHOSE ITEMS MOVE TO THEIR NEW PLACES — when it is narrowed, re-sorted or grows —
 * instead of jumping: each item travels from where it stood on the travel spring (`motion`'s
 * layout animation, so an interrupted move turns round from where it is), a new one fades in
 * and a leaving one fades out faster than it came.
 *
 * WHILE A CARET IS IN A FIELD NOTHING TRAVELS: a list narrowing under a dealer who is typing
 * only fades, because src/ui/MotionRoot.tsx tells `motion` to reduce while a caret is in a field
 * — the rule the old app kept on one screen of five. Under reduced motion, the same.
 *
 * It is a real list (`ul`, or `ol` where the order is the point), named when it is a thing a
 * reader should be able to find. How it lays out is one of two shapes, never a screen's
 * stylesheet: a `stack` of full-width items or `tiles` that fill the width at a readable
 * measure.
 */
export interface MovingProps<T> {
  items: readonly T[]
  keyOf: (item: T) => string
  children: (item: T) => ReactNode
  as?: 'ul' | 'ol'
  flow?: 'stack' | 'tiles'
  label?: string
}

export function Moving<T>({
  items,
  keyOf,
  children,
  as = 'ul',
  flow = 'stack',
  label,
}: MovingProps<T>) {
  const List = as === 'ol' ? motion.ol : motion.ul
  return (
    <List className="ui-moving" data-flow={flow} aria-label={label}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <motion.li
            key={keyOf(item)}
            className="ui-moving-item"
            layout="position"
            transition={move.travel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: transition('enter', false) }}
            exit={{ opacity: 0, transition: transition('exit', false) }}
          >
            {children(item)}
          </motion.li>
        ))}
      </AnimatePresence>
    </List>
  )
}
