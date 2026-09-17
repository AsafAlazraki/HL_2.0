import { describe, expect, test, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster, say, undo } from './Toaster'

describe('Toaster', () => {
  test('says what happened, in a sentence', async () => {
    render(<Toaster />)
    act(() => {
      say('The Yamaha F115 was added.')
    })
    expect(await screen.findByText('The Yamaha F115 was added.')).toBeInTheDocument()
  })

  test('offers to take back exactly the thing it just said', async () => {
    const onUndo = vi.fn<() => void>()
    render(<Toaster />)
    act(() => {
      undo('The Yamaha F115 was added.', onUndo)
    })
    const button = await screen.findByRole('button', { name: 'Undo' })
    await userEvent.click(button)
    // The inverse is pinned to this toast: the store hands in the inverse of the command it
    // has just applied, never "undo the latest thing", which by then may be another thing.
    expect(onUndo).toHaveBeenCalledOnce()
  })

  test('a toast with nothing to take back offers no button', async () => {
    render(<Toaster />)
    act(() => {
      say('The price file was read.')
    })
    // Asked of THIS toast, not of the page: Sonner's queue outlives a render, so a
    // page-wide query here would be answered by the toast the test above raised.
    const toast = (await screen.findByText('The price file was read.')).closest(
      '[data-sonner-toast]',
    )
    expect(toast).not.toBeNull()
    expect(within(toast as HTMLElement).queryByRole('button', { name: 'Undo' })).toBeNull()
  })
})
