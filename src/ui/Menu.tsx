import { Menu as BaseMenu } from '@base-ui/react/menu'
import { useId, type ReactElement, type ReactNode } from 'react'
import { Icon, type Glyph } from './Icon'
import { Kbd } from './Kbd'
import { Refusal } from './Refusal'
import { describedBy } from './refuse'
import type { PopoverAlign, PopoverSide } from './Popover'

/**
 * The one menu. Arrow keys, Home/End, type-ahead, Escape and focus back to the trigger are
 * Base UI's; a menu that owns the keyboard stops Escape before the stage sees it (rung 1 of
 * `keys.ts`).
 */
export interface MenuProps {
  trigger: ReactElement
  /** The accessible name of the menu, for a reader arriving in it. */
  label?: string
  side?: PopoverSide
  align?: PopoverAlign
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export function Menu({
  trigger,
  label,
  side = 'bottom',
  align = 'start',
  open,
  defaultOpen,
  onOpenChange,
  children,
}: MenuProps) {
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
    >
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner className="ui-positioner" side={side} align={align} sideOffset={6}>
          <BaseMenu.Popup className="ui-menu" aria-label={label} data-ground="plate">
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  )
}

export interface MenuItemProps {
  children: string
  onSelect?: () => void
  /** Why this item will not act right now, as a sentence, rendered inside the item. */
  refusedBecause?: string
  /** A keyboard shortcut to show, in `Kbd` notation ("Mod K"). */
  shortcut?: string
  /** The glyph that leads the item's words (board C: an icon on every act). */
  icon?: Glyph
}

export function MenuItem({ children, onSelect, refusedBecause, shortcut, icon }: MenuItemProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause)
  return (
    <BaseMenu.Item
      className="ui-menu-item"
      label={children}
      disabled={refused}
      onClick={onSelect}
      aria-describedby={describedBy(undefined, refused ? reasonId : undefined)}
    >
      <span className="ui-menu-label">
        {icon ? <Icon glyph={icon} /> : null}
        {children}
      </span>
      {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </BaseMenu.Item>
  )
}

export function MenuSeparator() {
  return <BaseMenu.Separator className="ui-menu-separator" />
}

export function MenuGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <BaseMenu.Group className="ui-menu-group">
      <BaseMenu.GroupLabel className="ui-menu-group-label">{label}</BaseMenu.GroupLabel>
      {children}
    </BaseMenu.Group>
  )
}
