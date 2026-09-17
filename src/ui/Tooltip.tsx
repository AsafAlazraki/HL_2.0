import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import type { ReactElement, ReactNode } from 'react'
import type { PopoverSide } from './Popover'

/**
 * A tooltip delays before it opens, so a passing cursor does not open one; once one is
 * open, its neighbours open at once. That skip lives in the provider, so `TooltipProvider`
 * is mounted once, above the routes.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <BaseTooltip.Provider delay={500} closeDelay={0}>
      {children}
    </BaseTooltip.Provider>
  )
}

/**
 * A tooltip is VISUAL ONLY, and Base UI means that literally: the popup carries no role and
 * the trigger gains no `aria-describedby`, on its own argument that a tooltip "is not a
 * replacement for labeling the trigger" (Base UI 1.8, tooltip accessibility). So the sentence
 * here repeats or extends a name the trigger already has — a `Button` with text, or an icon
 * button with an `aria-label` that matches. A tooltip carrying the only copy of a fact is a
 * fact only a cursor can reach. `Tooltip.test.tsx` asserts both halves.
 */
export interface TooltipProps {
  /** The sentence. A tooltip is text; anything richer is a popover. */
  content: string
  /** The element that carries the tooltip, usually a `Button`. */
  children: ReactElement
  side?: PopoverSide
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={6}>
          <BaseTooltip.Popup className="ui-tooltip">{content}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}
