import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'
import { Menu, MenuGroup, MenuItem, MenuSeparator } from './Menu'

function draw(onSelect = vi.fn<() => void>()) {
  render(
    <Menu trigger={<Button>Actions</Button>} label="Actions">
      <MenuGroup label="This quote">
        <MenuItem onSelect={onSelect} shortcut="Mod D">
          Duplicate
        </MenuItem>
        <MenuItem refusedBecause="This quote was issued on 14 March.">Rename</MenuItem>
      </MenuGroup>
      <MenuSeparator />
      <MenuItem onSelect={onSelect}>Open the document</MenuItem>
    </Menu>,
  )
  return onSelect
}

describe('Menu', () => {
  test('opens from its trigger and lists its items by name', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Duplicate/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Open the document' })).toBeInTheDocument()
  })

  test('an item acts when it is chosen', async () => {
    const onSelect = draw()
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Open the document' }))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  test('the arrow keys walk it: what a native menu gives free, paid for once', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: /Duplicate/ })).toHaveFocus()
  })

  test('a refused item carries its reason where a reader can hear it', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const item = screen.getByRole('menuitem', { name: /Rename/ })
    expect(item).toHaveAccessibleDescription('This quote was issued on 14 March.')
  })

  test('Escape closes it and the focus goes back to the trigger', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveFocus()
  })
})
