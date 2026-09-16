import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import type { ReactElement, ReactNode } from 'react'

/**
 * The one dialog. Base UI supplies the focus trap, dismissal, portal, scroll lock and
 * return-focus-to-opener (the old app hand-rolled fourteen dialogs and had return focus
 * broken in production). `title` is required because a dialog without an accessible name
 * is a box a screen reader cannot introduce.
 *
 * The close control is always rendered: Base UI asks for a `Dialog.Close` inside a modal
 * popup so touch screen readers can leave it.
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

export function Dialog({
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
}: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
    >
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="ui-dialog-backdrop" />
        <BaseDialog.Popup className="ui-dialog" data-size={size}>
          <header className="ui-dialog-head">
            <BaseDialog.Title className="ui-dialog-title">{title}</BaseDialog.Title>
            <BaseDialog.Close className="ui-dialog-close">{closeLabel}</BaseDialog.Close>
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
