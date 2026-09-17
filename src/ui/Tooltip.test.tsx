import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'
import { Tooltip, TooltipProvider } from './Tooltip'

/**
 * The delay is the whole point of the provider: a passing cursor must not open a tooltip.
 * Real time, not a fake clock — Base UI's tooltip waits on more than one timer and a faked
 * clock here tested the fake rather than the delay.
 */
const SENTENCE = 'Read from the workbook on 16 September.'

function draw() {
  render(
    <TooltipProvider>
      <Tooltip content={SENTENCE}>
        <Button>Source</Button>
      </Tooltip>
    </TooltipProvider>,
  )
  return screen.getByRole('button', { name: 'Source' })
}

describe('Tooltip', () => {
  test('a passing cursor does not open one', async () => {
    const trigger = draw()
    await userEvent.hover(trigger)
    // The provider's delay is 500ms; nothing like that much time has passed.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  test('a cursor that stays opens one, and it is a sentence', async () => {
    const trigger = draw()
    await userEvent.hover(trigger)
    expect(await screen.findByText(SENTENCE, {}, { timeout: 3000 })).toBeInTheDocument()
  })

  test('the trigger carries its own name, because the tooltip is visual only', () => {
    // Base UI 1.8 renders the popup with no role and no aria-describedby, by design: its
    // own guidance is that a tooltip "is not a replacement for labeling the trigger". So
    // the thing a reader hears is the trigger's name, and a tooltip that says something
    // the trigger does not is a sentence only sighted people get.
    const trigger = draw()
    expect(trigger).toHaveAccessibleName('Source')
  })
})
