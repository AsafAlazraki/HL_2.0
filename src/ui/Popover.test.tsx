import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'
import { Popover } from './Popover'

async function open() {
  render(
    <Popover
      trigger={<Button>Where this price comes from</Button>}
      title="Where this price comes from"
    >
      <p>Managers View!D41, read on 16 September.</p>
    </Popover>,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Where this price comes from' }))
}

describe('Popover', () => {
  test('opens from its trigger, named by its title', async () => {
    await open()
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Where this price comes from')
    expect(screen.getByText('Managers View!D41, read on 16 September.')).toBeInTheDocument()
  })

  test('Escape dismisses it and the focus goes back to the trigger', async () => {
    await open()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Where this price comes from' })).toHaveFocus()
  })

  test('is closed until it is opened: a popover costs no height while nobody asked', () => {
    render(
      <Popover trigger={<Button>Details</Button>}>
        <p>Nothing has been asked for yet.</p>
      </Popover>,
    )
    expect(screen.queryByText('Nothing has been asked for yet.')).not.toBeInTheDocument()
  })
})
