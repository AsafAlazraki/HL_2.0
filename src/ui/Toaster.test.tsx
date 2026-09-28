import { describe, expect, test, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster, say, undo, unsay } from './Toaster'

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

  test('one place’s latest word changes where it stands, and a way back offers to put it back', async () => {
    const first = vi.fn<() => void>()
    const second = vi.fn<() => void>()
    render(<Toaster />)
    act(() => {
      undo('Yamaha F115LB put on the quote', first, { id: 'step:one', testId: 'said-here' })
    })
    expect(await screen.findByTestId('said-here')).toHaveTextContent('F115LB put on')
    act(() => {
      undo('Yamaha F115LB off the quote again', second, {
        id: 'step:one',
        testId: 'said-here',
        way: 'Put it back',
      })
    })
    await waitFor(() => expect(screen.getByTestId('said-here')).toHaveTextContent('off the quote'))
    // one card, and only the latest step's way back on it
    expect(screen.getAllByTestId('said-here')).toHaveLength(1)
    await userEvent.click(
      within(screen.getByTestId('said-here')).getByRole('button', { name: 'Put it back' }),
    )
    expect(second).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
  })

  test('a place that no longer holds what it said takes its toast away', async () => {
    render(<Toaster />)
    act(() => {
      undo('Addressed to R. Kelleher', () => undefined, { id: 'step:two', testId: 'taken' })
    })
    expect(await screen.findByTestId('taken')).toBeInTheDocument()
    act(() => {
      unsay('step:two')
    })
    await waitFor(() => expect(screen.queryByTestId('taken')).not.toBeInTheDocument())
  })
})
