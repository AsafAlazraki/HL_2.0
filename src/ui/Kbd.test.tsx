import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Kbd, platformKey } from './Kbd'

describe('Kbd', () => {
  test('one cap per key in the chord', () => {
    const { container } = render(<Kbd>Mod K</Kbd>)
    expect(container.querySelectorAll('.ui-kbd-key')).toHaveLength(2)
  })

  test('a chord of the same key twice is two caps, not one', () => {
    const { container } = render(<Kbd>G G</Kbd>)
    expect(container.querySelectorAll('.ui-kbd-key')).toHaveLength(2)
  })

  test('Mod reads as the platform key', () => {
    expect(platformKey('Mod', true)).toBe('⌘')
    expect(platformKey('Mod', false)).toBe('Ctrl')
    expect(platformKey('K', true)).toBe('K')
  })

  test('the cap is text a reader can find', () => {
    render(<Kbd>Escape</Kbd>)
    expect(screen.getByText('Escape')).toBeInTheDocument()
  })
})
