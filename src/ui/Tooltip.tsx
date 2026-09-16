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
