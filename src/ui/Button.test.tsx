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

/* One reason, many controls — `Tile.test.tsx` holds the measurement
   that asked for this; the configurator's three refused price rungs
   are the button's own case. */
describe('a set of buttons refused for one reason', () => {
  test('is dimmed and described by the one sentence, which is drawn once', async () => {
    const onClick = vi.fn<() => void>()
    render(
      <>
        <p id="shut">This quote has been given to the customer.</p>
        <Button onClick={onClick} refusedBy="shut">
          See what Cash does
        </Button>
        <Button onClick={onClick} refusedBy="shut">
          See what Trade does
        </Button>
      </>,
    )
    expect(screen.getAllByText('This quote has been given to the customer.')).toHaveLength(1)
    const one = screen.getByRole('button', { name: 'See what Cash does' })
    expect(one).toHaveAttribute('aria-disabled', 'true')
    expect(one).toHaveAccessibleDescription('This quote has been given to the customer.')
    await userEvent.click(one)
    expect(onClick).not.toHaveBeenCalled()
  })
})

/* THE SHAPE THE REFUSAL RULER PLANTS. `e2e/rulers/measure/refusals.ts` draws every refused
   context the primitives declare on a board, without React, and reads each sentence in both
   themes — which is how the 1.23 : 1 reason under a refused act (2026-09-24) can never ship
   again. The board is only as true as its markup, so this pins that markup from the
   primitive's side: the sentence's ink is chosen by the FRAME's two attributes, the control
   carries the same two and is `aria-disabled`, and the sentence is the frame's own
   `.ui-refusal` child. A change here that the board did not follow would fail one of the two. */
describe('a refused button, as the refusal board draws it', () => {
  test.each([
    ['act', 'md'],
    ['act', 'sm'],
    ['veiled', 'md'],
    ['primary', 'sm'],
    ['secondary', 'md'],
    ['quiet', 'sm'],
    ['veiled', 'door'],
  ] as const)(
    '%s at %s: a frame with both attributes, the control, then the sentence',
    (intent, size) => {
      const { container } = render(
        <Button intent={intent} size={size} refusedBecause="This quote is addressed to nobody.">
          Give it to the customer
        </Button>,
      )
      const frame = container.firstElementChild as HTMLElement
      expect(frame.className).toBe('ui-button-frame')
      expect(frame.dataset.intent).toBe(intent)
      expect(frame.dataset.size).toBe(size)
      expect(frame.children).toHaveLength(2)
      const control = frame.children[0] as HTMLElement
      const reason = frame.children[1] as HTMLElement
      expect(control.className).toBe('ui-button')
      expect(control.dataset.intent).toBe(intent)
      expect(control.dataset.size).toBe(size)
      expect(control).toHaveAttribute('aria-disabled', 'true')
      expect(reason.className).toBe('ui-refusal')
      expect(reason).toHaveTextContent('This quote is addressed to nobody.')
    },
  )
})
