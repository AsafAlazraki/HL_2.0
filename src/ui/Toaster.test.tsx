import { describe, expect, test, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster, boundTail, say, undo, unsay } from './Toaster'

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

  test('an Undo whose screen answers in the same place leaves the answer standing', async () => {
    /* built-m3.md: "an undo says nothing". Rules and Review answer an Undo with what came back,
       said under the same id; the press then closed the card, answer and all. */
    render(<Toaster />)
    act(() => {
      undo('Your rule is switched off.', () => say('Your rule is back on.', { id: 'step:three' }), {
        id: 'step:three',
      })
    })
    const card = (await screen.findByText('Your rule is switched off.')).closest(
      '[data-sonner-toast]',
    ) as HTMLElement
    await userEvent.click(within(card).getByRole('button', { name: 'Undo' }))
    expect(await screen.findByText('Your rule is back on.')).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 600))
    expect(screen.getByText('Your rule is back on.')).toBeInTheDocument()
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

  test('a place that speaks again while its last card is leaving is heard', async () => {
    // measured at 1440 and 1920 (the flow round's verify): the motor's step taken away as Who it
    // is for opened, and the name saved in that beat, said nothing and offered no Undo
    render(<Toaster />)
    act(() => {
      undo('Yamaha F8LMHB put on the quote', () => undefined, { id: 'step:three', testId: 'again' })
    })
    expect(await screen.findByTestId('again')).toHaveTextContent('F8LMHB')
    act(() => {
      unsay('step:three')
    })
    // a frame later the card is marked to go and its exit is running: the beat the name lands in
    await act(() => new Promise((r) => setTimeout(r, 60)))
    act(() => {
      undo('For R. Kelleher', () => undefined, { id: 'step:three', testId: 'again' })
    })
    await waitFor(() => expect(screen.getByText('For R. Kelleher')).toBeInTheDocument())
    await new Promise((r) => setTimeout(r, 800))
    expect(screen.getByText('For R. Kelleher')).toBeInTheDocument()
    expect(screen.queryByText('Yamaha F8LMHB put on the quote')).toBeNull()
  })

  test('binds the figure at the end of a step to its words, and changes no word', () => {
    const NB = String.fromCharCode(160)
    const said = 'Yamaha F175XC taken off the quote · $25,355'
    const bound = boundTail(said)
    expect(bound.endsWith('quote' + NB + '·' + NB + '$25,355')).toBe(true)
    expect(bound.replaceAll(NB, ' ')).toBe(said)
    expect(boundTail('Delivery put on the quote · no price on it')).toContain('·' + NB + 'no price')
    /* a name with no figure at its end keeps its line breaks after each separator */
    expect(boundTail('Highfield ADV7 · Hypalon')).toBe('Highfield ADV7' + NB + '· Hypalon')
  })
})
