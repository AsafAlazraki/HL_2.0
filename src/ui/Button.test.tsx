import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

/**
 * A refusal is never a disabled control. Every assertion here is by role and text, because
 * that is what a dealer's screen reader reaches: if the reason cannot be found that way it
 * is not a refusal, it is a dead button.
 */
describe('Button', () => {
  test('is a button carrying its own label', () => {
    render(<Button>Give it to the customer</Button>)
    expect(screen.getByRole('button', { name: 'Give it to the customer' })).toBeInTheDocument()
  })

  test('presses', async () => {
    const onClick = vi.fn<() => void>()
    render(<Button onClick={onClick}>Add the motor</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Add the motor' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  test('a refusal is a sentence, found on the page and tied to the control', async () => {
    render(
      <Button refusedBecause="This quote was issued on 14 March. Issued quotes do not change.">
        Add the motor
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Add the motor' })
    expect(
      screen.getByText('This quote was issued on 14 March. Issued quotes do not change.'),
    ).toBeInTheDocument()
    expect(button).toHaveAccessibleDescription(
      'This quote was issued on 14 March. Issued quotes do not change.',
    )
  })

  test('a refused button is still reachable by keyboard, and says it will not act', async () => {
    const onClick = vi.fn<() => void>()
    render(
      <Button refusedBecause="Pick a hull first." onClick={onClick}>
        Add the motor
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Add the motor' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    // The point of the whole design: a disabled button cannot be focused, so the reason
    // could never be read. This one can.
    await userEvent.tab()
    expect(button).toHaveFocus()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  test('refuses a className or a style, even when one is forced past the type', () => {
    const forced = { className: 'home-button', style: { color: 'rebeccapurple' } } as object
    render(<Button {...forced}>Start the quote</Button>)
    const button = screen.getByRole('button', { name: 'Start the quote' })
    expect(button.getAttribute('class')).toBe('ui-button')
    expect(button.getAttribute('style')).toBeNull()
  })
})
