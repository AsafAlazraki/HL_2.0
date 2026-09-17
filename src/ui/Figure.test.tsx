import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Figure } from './Figure'
import { PriceFigure } from './PriceFigure'

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
})
