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

  /* AND THE ARROW KEYS REACH IT, which is the half the test above cannot see. A described
     refusal nobody can move to is a silently disabled control wearing a sentence: the reason
     is announced when focus lands on the item, and if the arrow walk skipped disabled items
     it would never land. Base UI's `useMenuItem` passes `focusableWhenDisabled` internally
     today, so this holds — but it holds because of a library internal nobody outside the
     library asserts, and "Base UI APIs move — each wrapped once in src/ui" is the plan's own
     reason for the wrapper. One minor version could turn the refusal silent on exactly the
     control a dealer meets it on, with the suite green. So it is asserted here. */
  test('the arrow keys reach the refused item, and it still refuses to act', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    const item = screen.getByRole('menuitem', { name: /Rename/ })
    expect(item, 'the walk lands on the refused item rather than stepping over it').toHaveFocus()
    expect(item).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeInTheDocument()
  })

  test('Escape closes it and the focus goes back to the trigger', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveFocus()
  })
})
