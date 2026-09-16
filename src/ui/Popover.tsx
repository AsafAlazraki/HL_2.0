import { Popover as BasePopover } from '@base-ui/react/popover'
import type { ReactElement, ReactNode } from 'react'

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'
export type PopoverAlign = 'start' | 'center' | 'end'

/**
 * The one popover: anchored to its trigger, dismissed by Escape and outside press, and
 * scaled in from the trigger's edge (`--transform-origin`), never from the centre.
 */
export interface PopoverProps {
  trigger: ReactElement
  title?: string
  side?: PopoverSide
  align?: PopoverAlign
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export function Popover({
  trigger,
  title,
  side = 'bottom',
  align = 'center',
  open,
  defaultOpen,
  onOpenChange,
  children,
}: PopoverProps) {
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
    >
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} align={align} sideOffset={6}>
          <BasePopover.Popup className="ui-popover">
            {title ? (
              <BasePopover.Title className="ui-popover-title">{title}</BasePopover.Title>
            ) : null}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  )
}
