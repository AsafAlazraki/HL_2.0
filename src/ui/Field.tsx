import { Field as BaseField } from '@base-ui/react/field'
import type { ReactNode } from 'react'

/**
 * A labelled control. The label is associated with whatever control sits inside (an
 * `Input`, a `Select`) through Base UI's field context, and an `error` is a sentence, shown
 * beneath and announced with the control.
 */
export interface FieldProps {
  label: string
  description?: string
  /** The reason the value is not accepted, as a sentence. */
  error?: string
  name?: string
  children: ReactNode
}

export function Field({ label, description, error, name, children }: FieldProps) {
  return (
    <BaseField.Root className="ui-field" name={name} invalid={Boolean(error)}>
      <BaseField.Label className="ui-field-label">{label}</BaseField.Label>
      {children}
      {description ? (
        <BaseField.Description className="ui-field-description">
          {description}
        </BaseField.Description>
      ) : null}
      {error ? (
        <BaseField.Error className="ui-field-error" match>
          {error}
        </BaseField.Error>
      ) : null}
    </BaseField.Root>
  )
}
