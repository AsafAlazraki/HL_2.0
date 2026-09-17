import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'
import { Dialog, DialogClose } from './Dialog'

/**
 * The old app hand-rolled fourteen dialogs and had return-focus-to-opener broken in
 * production. These are the four things a dialog owes a person, asserted once here so that
 * no screen has to assert them again.
 */
async function open() {
  render(
    <Dialog
      title="Forget everything"
      description="Your 3 quotes stay. A quote is a photograph of what was offered on the day."
      trigger={<Button>Forget everything</Button>}
      actions={
        <DialogClose>
          <Button intent="primary">Keep the quotes</Button>
        </DialogClose>
      }
    >
      <p>The sheet goes; the quotes do not.</p>
    </Dialog>,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Forget everything' }))
  return screen.getByRole('dialog')
}

describe('Dialog', () => {
  test('opens from its trigger and is introduced by name', async () => {
    const dialog = await open()
    expect(dialog).toHaveAccessibleName('Forget everything')
    expect(dialog).toHaveAccessibleDescription(
      'Your 3 quotes stay. A quote is a photograph of what was offered on the day.',
    )
    expect(screen.getByText('The sheet goes; the quotes do not.')).toBeInTheDocument()
  })

  test('always offers a way out, and gives the focus back to what opened it', async () => {
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Forget everything' })).toHaveFocus()
  })

  test('Escape closes it — rung 1 of the ladder, where a widget owns the keyboard', async () => {
    await open()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('an action in the foot closes it', async () => {
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Keep the quotes' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
