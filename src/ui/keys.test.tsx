import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { closesStage, isField, stageKeyOf } from './keys'

/**
 * The two halves that do touch the DOM — what counts as a field, and how a real keydown is
 * reduced to the facts the ladder turns on. The ladder itself is proved in `keys.test.ts`,
 * in node, because it owes the DOM nothing.
 */
describe('isField', () => {
  test('an input, a textarea, a select and a contenteditable are all fields', () => {
    render(
      <form>
        <input aria-label="search" />
        <textarea aria-label="notes" />
        {/* No role: a live cell editor in the sheet is a contenteditable box, and `isField`
            has to recognise it by what it is, not by a role somebody remembered to set. */}
        <div contentEditable data-testid="cell" suppressContentEditableWarning />
        <button type="button">Add</button>
      </form>,
    )
    expect(isField(screen.getByLabelText('search'))).toBe(true)
    expect(isField(screen.getByLabelText('notes'))).toBe(true)
    expect(isField(screen.getByTestId('cell'))).toBe(true)
    expect(isField(screen.getByRole('button', { name: 'Add' }))).toBe(false)
  })

  test('nothing at all is not a field', () => {
    expect(isField(null)).toBe(false)
  })
})

describe('stageKeyOf', () => {
  test('reduces a keydown to the five facts, and the ladder answers', () => {
    render(<input aria-label="search" />)
    const target = screen.getByLabelText('search')
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    const reduced = stageKeyOf(event)
    expect(reduced.key).toBe('Escape')
    expect(reduced.inField).toBe(true)
    expect(reduced.handled).toBe(false)
    // Rung 2: the search box clears its own search; the surface stays.
    expect(closesStage(reduced)).toBe(false)
  })

  test('a handled event arrives flagged, not absent', () => {
    render(<div data-testid="surface" />)
    const target = screen.getByTestId('surface')
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    event.preventDefault()
    expect(stageKeyOf(event).handled).toBe(true)
  })
})
