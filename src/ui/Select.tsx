import { Select as BaseSelect } from '@base-ui/react/select'
import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react'
import { useId } from 'react'
import { Refusal } from './Refusal'
import { describedBy } from './refuse'

/**
 * A select is never native. The old app's hand-built listbox listed what a native
 * `<select>` gives free and must be repaid: arrows, Home/End, Escape, type-ahead,
 * `aria-expanded`, focus back to the trigger. Base UI's Select pays it once, and the popup
 * is ours to draw.
 */
export interface SelectOption<V extends string> {
  value: V
  label: string
  /** Why this option cannot be chosen right now, as a sentence, rendered inside it. */
  refusedBecause?: string
}

export interface SelectProps<V extends string> {
  options: readonly SelectOption<V>[]
  value?: V | null
  defaultValue?: V | null
  onValueChange?: (value: V | null) => void
  /** Shown on the trigger while nothing is chosen. */
  placeholder?: string
  name?: string
  id?: string
  readOnly?: boolean
  'aria-label'?: string
}

export function Select<V extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Choose',
  name,
  id,
  readOnly,
  'aria-label': ariaLabel,
}: SelectProps<V>) {
  return (
    <BaseSelect.Root<V>
      items={options}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
      name={name}
      id={id}
      readOnly={readOnly}
    >
      <BaseSelect.Trigger className="ui-select-trigger" aria-label={ariaLabel}>
        <BaseSelect.Value className="ui-select-value" placeholder={placeholder} />
        <BaseSelect.Icon className="ui-select-icon">
          <CaretDownIcon size={14} aria-hidden />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} alignItemWithTrigger={false}>
          <BaseSelect.Popup className="ui-select-popup">
            <BaseSelect.List>
              {options.map((option) => (
                <SelectItem key={option.value} option={option} />
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}

function SelectItem<V extends string>({ option }: { option: SelectOption<V> }) {
  const reasonId = useId()
  const refused = Boolean(option.refusedBecause)
  return (
    <BaseSelect.Item
      className="ui-select-item"
      value={option.value}
      label={option.label}
      disabled={refused}
      aria-describedby={describedBy(undefined, refused ? reasonId : undefined)}
    >
      <BaseSelect.ItemText className="ui-select-item-text">{option.label}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="ui-select-item-indicator">
        <CheckIcon size={14} aria-hidden />
      </BaseSelect.ItemIndicator>
      {option.refusedBecause ? <Refusal id={reasonId}>{option.refusedBecause}</Refusal> : null}
    </BaseSelect.Item>
  )
}
