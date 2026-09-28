import { Select as BaseSelect } from '@base-ui/react/select'
import { CaretUpDownIcon, CheckIcon } from '@phosphor-icons/react'
import { useId } from 'react'
import type { TableKind } from '@/domain/model'
import { Icon } from './Icon'
import { KindMark } from './KindMark'
import { Refusal } from './Refusal'
import { describedBy } from './refuse'

/**
 * A select is never native. The old app's hand-built listbox listed what a native
 * `<select>` gives free and must be repaid: arrows, Home/End, Escape, type-ahead,
 * `aria-expanded`, focus back to the trigger. Base UI's Select pays it once, and the popup
 * is ours to draw.
 *
 * IN THE KIT (board C, 2026-09-28) the trigger is a white field that carries the KIND of what
 * it chooses as a glyph in its own ink — a motor's carmine engine — and a caret that says it
 * opens both ways; the list is a white plate whose rows can carry a figure at their end (a
 * motor's Sell Price), set in tabular figures so a column of them lines up, and the chosen row
 * a tick in the plate's blue. The list opens from its trigger and leaves faster than it came.
 */
export interface SelectOption<V extends string> {
  value: V
  label: string
  /** A figure printed at the row's end — a price at a declared level, a count. Never a cost. */
  trail?: string
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
  /** What kind of thing is being chosen, drawn as its glyph on the trigger. */
  kind?: TableKind
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
  kind,
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
      <BaseSelect.Trigger className="ui-select-trigger" aria-label={ariaLabel} data-ground="plate">
        {kind ? <KindMark kind={kind} size="sm" /> : null}
        <BaseSelect.Value className="ui-select-value" placeholder={placeholder} />
        <BaseSelect.Icon className="ui-select-icon">
          <Icon glyph={CaretUpDownIcon} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        {/* THE POSITIONER CARRIES THE STACKING, not the popup: Base UI positions the
            positioner, and a z-index on the static popup inside it did nothing — the list of
            the Select in Data's "A new register" dialog was drawn under the dialog
            (audit.md, defect 1). */}
        <BaseSelect.Positioner
          className="ui-positioner"
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          <BaseSelect.Popup className="ui-select-popup" data-ground="plate">
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
      <BaseSelect.ItemIndicator className="ui-select-item-indicator">
        <Icon glyph={CheckIcon} />
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText className="ui-select-item-text">{option.label}</BaseSelect.ItemText>
      {option.trail ? <span className="ui-select-item-trail">{option.trail}</span> : null}
      {option.refusedBecause ? <Refusal id={reasonId}>{option.refusedBecause}</Refusal> : null}
    </BaseSelect.Item>
  )
}
