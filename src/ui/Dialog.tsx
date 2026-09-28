import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { XIcon } from '@phosphor-icons/react'
import type { ReactElement, ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * The one dialog. Base UI supplies the focus trap, dismissal, portal, scroll lock and
 * return-focus-to-opener (the old app hand-rolled fourteen dialogs and had return focus
 * broken in production). `title` is required because a dialog without an accessible name
 * is a box a screen reader cannot introduce.
 *
 * The close control is always rendered: Base UI asks for a `Dialog.Close` inside a modal
 * popup so touch screen readers can leave it. In the kit it is a quiet capsule, its glyph
 * beside its word.
 *
 * IN THE KIT (2026-09-28) a dialog is a white plate that rises 8px out of a 97% scale and
 * fades in over 300ms, and leaves faster than it came (200ms); the room behind it dims to
 * the navy at 40%. A modal keeps a centred origin — it is anchored to nothing.
 */
export interface DialogProps {
  title: string
  description?: string
  /** The element that opens the dialog. Omit it for a dialog controlled by `open`. */
  trigger?: ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  /** The close control's label. */
  closeLabel?: string
  /** Buttons for the foot of the dialog, usually ending with a `DialogClose`. */
  actions?: ReactNode
  children?: ReactNode
}

export function Dialog(props: DialogProps) {
  return <Overlay {...props} placement="centre" />
}

/**
 * A SHEET: the same dialog, standing at the window's inline end on a desk and rising from its
 * foot in a hand — for a longer read beside the thing it is about (the plan's cascade sheet
 * "springs from the right"). It travels in on the spring and leaves faster than it came. The
 * room behind it dims; everything else a dialog owes a person is the dialog's.
 */
export function Sheet(props: Omit<DialogProps, 'size'>) {
  return <Overlay {...props} placement="side" />
}

function Overlay({
  title,
  description,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  size = 'md',
  closeLabel = 'Close',
  actions,
  children,
  placement,
}: DialogProps & { placement: 'centre' | 'side' }) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
    >
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="ui-dialog-backdrop" />
        <BaseDialog.Popup
          className="ui-dialog"
          data-size={size}
          data-placement={placement}
          data-ground="plate"
        >
          <header className="ui-dialog-head">
            <BaseDialog.Title className="ui-dialog-title">{title}</BaseDialog.Title>
            <BaseDialog.Close className="ui-dialog-close">
              <Icon glyph={XIcon} />
              {closeLabel}
            </BaseDialog.Close>
          </header>
          {description ? (
            <BaseDialog.Description className="ui-dialog-description">
              {description}
            </BaseDialog.Description>
          ) : null}
          {children ? <div className="ui-dialog-body">{children}</div> : null}
          {actions ? <footer className="ui-dialog-actions">{actions}</footer> : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

/** Wraps a button (usually a `Button`) so pressing it closes the dialog it sits in. */
export function DialogClose({ children }: { children: ReactElement }) {
  return <BaseDialog.Close render={children} />
}
