import { describe, expect, test, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Figure } from './Figure'
import { MotionRoot } from './MotionRoot'
import { PriceFigure } from './PriceFigure'

/* Whether this browser can move digits is NumberFlow's own question (`canAnimate`). The test
   window cannot, so the figure is its text alone unless a test says otherwise. */
const can = vi.hoisted(() => ({ move: false }))
vi.mock('@number-flow/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@number-flow/react')>()),
  useIsSupported: () => can.move,
}))

describe('PriceFigure', () => {
  test('is the whole figure the moment it is painted — it never counts up', () => {
    const { container } = render(<PriceFigure amount={28_530} />)
    expect(screen.getByText('$28,530')).toBeInTheDocument()
    // A price that animates reads as a price still being decided. NumberFlow draws a
    // <number-flow-react> element; this must be a plain <data> with the figure in it.
    expect(container.querySelector('number-flow-react')).toBeNull()
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('data')
  })

  test('carries the unrounded amount as its machine value', () => {
    const { container } = render(<PriceFigure amount={7928.68} />)
    expect(screen.getByText('$7,928.68')).toBeInTheDocument()
    expect(container.querySelector('data')).toHaveAttribute('value', '7928.68')
  })

  test('a negative figure keeps the real minus sign the money format sets', () => {
    render(<PriceFigure amount={-1200} />)
    expect(screen.getByText('−$1,200')).toBeInTheDocument()
  })

  test('the muted tone is a data attribute, not a colour written at the call site', () => {
    const { container } = render(<PriceFigure amount={100} tone="muted" />)
    expect(container.querySelector('data')).toHaveAttribute('data-tone', 'muted')
  })
})

describe('Figure', () => {
  test('a figure that is not the price reads as its number', () => {
    render(<Figure value={15_691} />)
    expect(screen.getByText('15,691')).toBeInTheDocument()
  })

  test('takes a prefix and a suffix without either becoming part of the number', () => {
    render(<Figure value={115} suffix=" hp" />)
    expect(screen.getByText('115 hp')).toBeInTheDocument()
  })

  test('where the browser cannot move digits it is the text and nothing else', () => {
    const { container } = render(<Figure value={209} />)
    expect(container.querySelector('number-flow-react')).toBeNull()
    expect(container.textContent).toBe('209')
  })
})

/* MEASURED on Home before 2026-09-29: NumberFlow alone read "1 1 6 lines answer to that" to
   the accessibility tree and " lines answer to that" to innerText, with no number at all */
describe('Figure, where the digits can move', () => {
  test('carries its value once as text, and hides the moving digits from a reader', () => {
    can.move = true
    try {
      const { container } = render(<Figure value={15_691} />)
      /* the test window renders NumberFlow's server markup, so the digits' own text is in
         the light DOM here too; in a browser it is in the shadow root */
      const said = container.querySelectorAll('.ui-figure__said')
      expect(said).toHaveLength(1)
      expect(said[0]).toHaveTextContent(/^15,691$/)
      const digits = container.querySelector('number-flow-react')
      expect(digits).not.toBeNull()
      expect(digits).toHaveAttribute('aria-hidden', 'true')
    } finally {
      can.move = false
    }
  })

  test('holds still while a caret is in a field, and moves again once it has gone', async () => {
    can.move = true
    try {
      const { container } = render(
        <MotionRoot>
          <input aria-label="Find" />
          <Figure value={4} />
        </MotionRoot>,
      )
      const digits = container.querySelector('number-flow-react') as { animated?: boolean } | null
      expect(digits?.animated).toBe(true)
      const field = screen.getByLabelText('Find')
      act(() => field.focus())
      expect(digits?.animated).toBe(false)
      act(() => field.blur())
      await act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))))
      expect(digits?.animated).toBe(true)
    } finally {
      can.move = false
    }
  })
})

describe('PriceFigure, signed', () => {
  test('a change to a price carries its sign, and is still one still figure', () => {
    const { container, rerender } = render(<PriceFigure amount={16_869} size="display" signed />)
    expect(screen.getByText('+$16,869')).toBeInTheDocument()
    expect(container.querySelector('data')).toHaveAttribute('data-sign', 'plus')
    rerender(<PriceFigure amount={-3_437} size="display" signed />)
    expect(screen.getByText('−$3,437')).toBeInTheDocument()
    rerender(<PriceFigure amount={0} signed />)
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(container.querySelector('number-flow-react')).toBeNull()
  })
})
