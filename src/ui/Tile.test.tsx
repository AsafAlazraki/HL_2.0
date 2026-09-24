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

  /* A TILE THAT OPENS SOMETHING IS NOT A TOGGLE. Home's filed-quote
     card is the first caller that presses through to another screen
     rather than choosing one of several, and `aria-pressed="false"` on
     it would promise a state it never enters. */
  test('says nothing about a state it does not have', () => {
    render(<Tile onSelect={vi.fn<() => void>()}>Quote NQ-1</Tile>)
    expect(screen.getByRole('button', { name: 'Quote NQ-1' })).not.toHaveAttribute('aria-pressed')
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

/* ============================================================
   ONE REASON, MANY CONTROLS. Added 2026-09-18, after the built
   configurator printed `ISSUED_REFUSAL` five times on one chapter —
   four of them wedged between rows, each reading as though it
   belonged to the row beneath. `refusedBy` is the same refusal with
   the sentence said once, in the screen's own element above the list.
   ============================================================ */
describe('a whole list refused for one reason', () => {
  test('is dimmed, focusable, silent about the press, and described by the one sentence', async () => {
    const onSelect = vi.fn<() => void>()
    render(
      <>
        <p id="shut">This quote has been given to the customer.</p>
        <Tile onSelect={onSelect} refusedBy="shut">
          Yamaha F115
        </Tile>
        <Tile onSelect={onSelect} refusedBy="shut">
          Yamaha F90
        </Tile>
      </>,
    )
    /* the sentence is on the screen ONCE, however many controls it
       refuses — which is the whole point of the prop */
    expect(screen.getAllByText('This quote has been given to the customer.')).toHaveLength(1)

    const one = screen.getByRole('button', { name: 'Yamaha F115' })
    expect(one).toHaveAttribute('aria-disabled', 'true')
    expect(one).toHaveAccessibleDescription('This quote has been given to the customer.')
    expect(screen.getByRole('button', { name: 'Yamaha F90' })).toHaveAccessibleDescription(
      'This quote has been given to the customer.',
    )
    await userEvent.tab()
    expect(one).toHaveFocus()
    await userEvent.click(one)
    expect(onSelect).not.toHaveBeenCalled()
  })

  test('a tile with its own sentence keeps it, and hears it only once', () => {
    render(
      <>
        <p id="shut">The list is shut.</p>
        <Tile refusedBecause="This hull takes 90 hp at most." refusedBy="shut">
          Yamaha F115
        </Tile>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Yamaha F115' })).toHaveAccessibleDescription(
      'This hull takes 90 hp at most.',
    )
  })
})

/* THE SHAPE THE REFUSAL RULER PLANTS — `Button.test.tsx` says why this is pinned. A tile's
   sentence is inked by its frame's `tone`. */
describe('a refused tile, as the refusal board draws it', () => {
  test.each([
    ['room', 'row'],
    ['room', 'card'],
    ['paper', 'chip'],
    ['paper', 'card'],
  ] as const)('%s %s: a frame with both attributes, the tile, then the sentence', (tone, shape) => {
    const { container } = render(
      <Tile tone={tone} shape={shape} refusedBecause="This hull takes 90 hp at most.">
        Yamaha F115
      </Tile>,
    )
    const frame = container.firstElementChild as HTMLElement
    expect(frame.className).toBe('ui-tile-frame')
    expect(frame.dataset.tone).toBe(tone)
    expect(frame.dataset.shape).toBe(shape)
    expect(frame.children).toHaveLength(2)
    const tile = frame.children[0] as HTMLElement
    const reason = frame.children[1] as HTMLElement
    expect(tile.className).toBe('ui-tile')
    expect(tile.dataset.tone).toBe(tone)
    expect(tile.dataset.shape).toBe(shape)
    expect(tile).toHaveAttribute('aria-disabled', 'true')
    expect(reason.className).toBe('ui-refusal')
    expect(reason).toHaveTextContent('This hull takes 90 hp at most.')
  })
})
