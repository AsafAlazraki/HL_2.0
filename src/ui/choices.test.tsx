import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EngineIcon, HandshakeIcon, MoneyIcon, MoonIcon } from '@phosphor-icons/react'
import { Chip } from './Chip'
import { Segmented } from './Segmented'
import { Toggle } from './Toggle'

/**
 * The three small choices the kit adds — a chip, a segmented choice and a toggle — asked for
 * by role and name, the way a dealer's screen reader reaches them. Each is never disabled: a
 * refusal is a sentence, found on the page and heard on the control.
 */
describe('Chip', () => {
  test('is a toggle named by its word and its count, its glyph hidden', async () => {
    const onSelect = vi.fn<() => void>()
    render(
      <Chip icon={EngineIcon} count={2} selected={false} onSelect={onSelect}>
        90 hp
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: '90 hp 2' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(chip)
    expect(onSelect).toHaveBeenCalledOnce()
  })

  test('says it is chosen', () => {
    render(<Chip selected>The file’s blue</Chip>)
    expect(screen.getByRole('button', { name: 'The file’s blue' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('a refused chip keeps its focus, says why, and does not act', async () => {
    const onSelect = vi.fn<() => void>()
    render(
      <Chip onSelect={onSelect} refusedBecause="Amber is the one thing a person presses.">
        Amber
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Amber' })
    expect(chip).toHaveAttribute('aria-disabled', 'true')
    expect(chip).toHaveAccessibleDescription('Amber is the one thing a person presses.')
    await userEvent.tab()
    expect(chip).toHaveFocus()
    await userEvent.click(chip)
    expect(onSelect).not.toHaveBeenCalled()
  })

  test('refuses a className or a style forced past the type', () => {
    const forced = { className: 'x', style: { color: 'rebeccapurple' } } as object
    render(<Chip {...forced}>Plum</Chip>)
    const chip = screen.getByRole('button', { name: 'Plum' })
    expect(chip.getAttribute('class')).toBe('ui-chip')
    expect(chip.getAttribute('style')).toBeNull()
  })
})

describe('Segmented', () => {
  const options = [
    { value: 'cash', label: 'Cash', icon: MoneyIcon },
    { value: 'trade', label: 'Trade', icon: HandshakeIcon },
  ] as const

  test('is a group of radios named by its question, one of them checked', () => {
    render(<Segmented label="Price level" options={options} value="cash" />)
    expect(screen.getByRole('group', { name: 'Price level' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Cash' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Trade' })).not.toBeChecked()
  })

  test('choosing an answer hands the caller its value', async () => {
    const onValueChange = vi.fn<(v: 'cash' | 'trade') => void>()
    render(
      <Segmented
        label="Price level"
        options={options}
        value="cash"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Trade' }))
    expect(onValueChange).toHaveBeenCalledWith('trade')
  })

  test('the keyboard enters on the chosen answer', async () => {
    render(<Segmented label="Price level" options={options} value="trade" />)
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Trade' })).toHaveFocus()
  })

  test('a refused answer is reached, says why, and is not chosen', async () => {
    const onValueChange = vi.fn<(v: 'cash' | 'trade') => void>()
    render(
      <Segmented
        label="Price level"
        options={[
          { value: 'cash', label: 'Cash' },
          { value: 'trade', label: 'Trade', refusedBecause: 'Trade is not declared on this list.' },
        ]}
        value="cash"
        onValueChange={onValueChange}
      />,
    )
    const trade = screen.getByRole('radio', { name: 'Trade' })
    expect(trade).toHaveAttribute('aria-disabled', 'true')
    expect(trade).toHaveAccessibleDescription('Trade is not declared on this list.')
    expect(screen.getByText('Trade is not declared on this list.')).toBeInTheDocument()
    await userEvent.click(trade)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Toggle', () => {
  test('is a switch named by its word, and turns', async () => {
    const onCheckedChange = vi.fn<(on: boolean) => void>()
    render(
      <Toggle
        label="Night ground"
        icon={MoonIcon}
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    )
    const on = screen.getByRole('switch', { name: 'Night ground' })
    expect(on).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(on)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  test('pressing its word turns it too', async () => {
    const onCheckedChange = vi.fn<(on: boolean) => void>()
    render(<Toggle label="The file’s codes" checked onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByText('The file’s codes'))
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  test('Space turns it from the keyboard', async () => {
    const onCheckedChange = vi.fn<(on: boolean) => void>()
    render(<Toggle label="Night ground" checked={false} onCheckedChange={onCheckedChange} />)
    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  test('a refused toggle says why and stays as it was', async () => {
    const onCheckedChange = vi.fn<(on: boolean) => void>()
    render(
      <Toggle
        label="Night ground"
        checked={false}
        onCheckedChange={onCheckedChange}
        refusedBecause="The paper is always day."
      />,
    )
    const on = screen.getByRole('switch', { name: 'Night ground' })
    expect(on).toHaveAccessibleDescription('The paper is always day.')
    await userEvent.click(on)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})
