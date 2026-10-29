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
  /**
   * WHAT CHOOSING IT DOES, one line under its name (Rules, 2026-10-28: the verb of a rule pressed
   * open in place, "refuses / warns / is off", each with its consequence — board A of
   * docs/directions/rules-boards/). Read with the option, never instead of its name.
   */
  say?: string
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
  /**
   * `word` IS A CHOICE INSIDE A SENTENCE (Rules, 2026-10-22): the trigger is the chosen word
   * itself, set in the sentence's own size and face, in the file's blue with a dotted
   * underline, and no field, caret or glyph around it — the natural-language form the rules
   * sweep found (`docs/research/refs/rules/live/natural-language-form-rest.png`). Pressed, it
   * opens the same list every select opens, its rows carrying their counts. Added to the kit
   * rather than drawn by the screen, because a word that opens a list is a select.
   */
  look?: 'field' | 'word'
  /**
   * THE WORD'S INK, for `look="word"` only (Rules, 2026-10-28). A word is the file's blue, the
   * ink of words a person can change; a rule's verb is set in the ink of its state, so a rule
   * that warns reads in the warning's ink (`--color-act-ink`, the build's own "worth knowing")
   * and one that is off reads at full ink (`--color-ink`), kept and never greyed. The screen
   * puts the state's glyph beside it, because an ink is never a colour alone.
   */
  ink?: 'file' | 'warn' | 'full'
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
  look = 'field',
  ink = 'file',
  'aria-label': ariaLabel,
}: SelectProps<V>) {
  const word = look === 'word'
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
      <BaseSelect.Trigger
        className="ui-select-trigger"
        aria-label={ariaLabel}
        data-ground={word ? undefined : 'plate'}
        data-look={word ? 'word' : undefined}
        data-ink={word && ink !== 'file' ? ink : undefined}
      >
        {kind && !word ? <KindMark kind={kind} size="sm" /> : null}
        <BaseSelect.Value className="ui-select-value" placeholder={placeholder} />
        {word ? null : (
          <BaseSelect.Icon className="ui-select-icon">
            <Icon glyph={CaretUpDownIcon} />
          </BaseSelect.Icon>
        )}
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
      {option.say ? <span className="ui-select-item-say">{option.say}</span> : null}
      {option.refusedBecause ? <Refusal id={reasonId}>{option.refusedBecause}</Refusal> : null}
    </BaseSelect.Item>
  )
}
