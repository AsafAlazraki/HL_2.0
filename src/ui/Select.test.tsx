import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const LEVELS = [
  { value: 'cash', label: 'Cash' },
  { value: 'trade', label: 'Trade' },
  { value: 'fleet', label: 'Fleet', refusedBecause: 'Fleet pricing needs a fleet agreement.' },
] as const

describe('Select', () => {
  test('is never native', () => {
    render(<Select options={LEVELS} aria-label="Price level" />)
    expect(document.querySelector('select')).toBeNull()
  })

  test('shows its placeholder until something is chosen', () => {
    render(<Select options={LEVELS} aria-label="Price level" placeholder="Choose a level" />)
    expect(screen.getByRole('combobox', { name: 'Price level' })).toHaveTextContent(
      'Choose a level',
    )
  })

  test('opens, lists its options, and answers with the value that was chosen', async () => {
    const onValueChange = vi.fn<(value: string | null) => void>()
    render(<Select options={LEVELS} aria-label="Price level" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('combobox', { name: 'Price level' }))
    expect(screen.getByRole('option', { name: 'Cash' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('option', { name: 'Trade' }))
    expect(onValueChange).toHaveBeenCalledWith('trade')
    expect(screen.getByRole('combobox', { name: 'Price level' })).toHaveTextContent('Trade')
  })

  test('a refused option says why, rather than being a silently dead row', async () => {
    render(<Select options={LEVELS} aria-label="Price level" />)
    await userEvent.click(screen.getByRole('combobox', { name: 'Price level' }))
    expect(screen.getByRole('option', { name: /Fleet/ })).toHaveAccessibleDescription(
      'Fleet pricing needs a fleet agreement.',
    )
  })

  /* AND THE ARROW KEYS REACH IT. The description above is a DOM fact; this is the fact that
     makes it audible. Base UI's `SelectRoot` hands `useListNavigation` an empty set of
     disabled indices today, so the walk does not step over a refused row — but that is a
     library internal, and the reason `src/ui` wraps each Base UI API once is that those move.
     If a version bump starts skipping disabled options, the sentence stops being reachable on
     exactly the control where a dealer meets it, and this is what turns red. */
  test('the arrow keys reach the refused option, and choosing it changes nothing', async () => {
    const onValueChange = vi.fn<(value: string | null) => void>()
    render(<Select options={LEVELS} aria-label="Price level" onValueChange={onValueChange} />)
    const trigger = screen.getByRole('combobox', { name: 'Price level' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    const fleet = screen.getByRole('option', { name: /Fleet/ })
    expect(fleet, 'the walk lands on the refused row rather than stepping over it').toHaveFocus()
    expect(fleet).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(trigger).not.toHaveTextContent('Fleet')
  })

  test('the keyboard opens it and Escape puts the focus back on the trigger', async () => {
    render(<Select options={LEVELS} aria-label="Price level" />)
    const trigger = screen.getByRole('combobox', { name: 'Price level' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
