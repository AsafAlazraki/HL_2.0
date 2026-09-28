import { motion } from 'motion/react'
import { useId } from 'react'
import { Icon, type Glyph } from './Icon'
import { move } from './motion'
import { Refusal } from './Refusal'

/**
 * A SEGMENTED CHOICE: two to five answers to one question, side by side, one of them chosen —
 * Cash or Trade, a range of days, a door of the sheet. The audit found each drawn as buttons
 * standing apart whose chosen one jumped (audit.md rows 42, 61, 78); Geist's rule for it is
 * "wide enough to prevent jumping when active" (notes.md §2, *the segment that does not
 * jump*), and every answer here is the same width.
 *
 * Board C's segment: a pale well with a white thumb that TRAVELS to the chosen answer on the
 * travel spring (critically damped, 441ms — `motion`'s shared layout, so it springs from where
 * it was and can be turned mid-way), the chosen answer in the plate's blue, and a glyph beside
 * each word. Under reduced motion, or while a caret is in a field, the thumb is simply there
 * (src/ui/MotionRoot.tsx).
 *
 * IT IS A GROUP OF REAL RADIO BUTTONS under a legend that names the question, so the browser
 * gives it everything a radio group owes: the arrow keys move between answers and choose as
 * they go, Tab enters on the chosen one and leaves the group. An answer can be refused with a
 * sentence: it is still reached by the arrows, it says it will not be chosen, the reason is
 * set beneath the group, and the choice does not move.
 */
export interface SegmentedOption<V extends string> {
  value: V
  label: string
  icon?: Glyph
  refusedBecause?: string
}

export interface SegmentedProps<V extends string> {
  options: readonly SegmentedOption<V>[]
  value: V
  onValueChange?: (value: V) => void
  /** The question the answers answer: "Price level". It is the group's legend. */
  label: string
}

export function Segmented<V extends string>({
  options,
  value,
  onValueChange,
  label,
}: SegmentedProps<V>) {
  const group = useId()
  return (
    <span className="ui-segmented-frame">
      <fieldset className="ui-segmented" data-ground="plate">
        <legend className="ui-segmented-legend">{label}</legend>
        {options.map((option) => {
          const checked = option.value === value
          const refused = Boolean(option.refusedBecause)
          return (
            <label
              key={option.value}
              className="ui-segmented-option"
              data-checked={checked ? '' : undefined}
              data-refused={refused ? '' : undefined}
            >
              <input
                type="radio"
                className="ui-segmented-input"
                name={group}
                value={option.value}
                checked={checked}
                aria-disabled={refused || undefined}
                aria-describedby={refused ? `${group}-${option.value}` : undefined}
                onChange={() => {
                  if (!refused && !checked) onValueChange?.(option.value)
                }}
              />
              {checked ? (
                <motion.span
                  className="ui-segmented-thumb"
                  layoutId={`${group}-thumb`}
                  transition={move.travel}
                  aria-hidden="true"
                />
              ) : null}
              <span className="ui-segmented-face">
                {option.icon ? <Icon glyph={option.icon} /> : null}
                {option.label}
              </span>
            </label>
          )
        })}
      </fieldset>
      {options.map((option) =>
        option.refusedBecause ? (
          <Refusal key={option.value} id={`${group}-${option.value}`}>
            {option.refusedBecause}
          </Refusal>
        ) : null,
      )}
    </span>
  )
}
