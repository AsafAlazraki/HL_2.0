import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tile } from './Tile'

describe('Tile', () => {
  test('"selected" is what a reader is told, not just what the paint shows', () => {
    render(
      <Tile selected label="Stacer 529 Assault Pro">
        <span>529 Assault Pro</span>
      </Tile>,
    )
    expect(screen.getByRole('button', { name: 'Stacer 529 Assault Pro' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('presses', async () => {
    const onSelect = vi.fn<() => void>()
    render(<Tile onSelect={onSelect}>529 Assault Pro</Tile>)
    await userEvent.click(screen.getByRole('button', { name: '529 Assault Pro' }))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  test('a refused tile keeps its focus and says why, like every other refusal', async () => {
    const onSelect = vi.fn<() => void>()
    render(
      <Tile onSelect={onSelect} refusedBecause="This hull takes 90 hp at most.">
        Yamaha F115
      </Tile>,
    )
    const tile = screen.getByRole('button', { name: 'Yamaha F115' })
    expect(tile).toHaveAttribute('aria-disabled', 'true')
    expect(tile).toHaveAccessibleDescription('This hull takes 90 hp at most.')
    await userEvent.tab()
    expect(tile).toHaveFocus()
    await userEvent.click(tile)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
