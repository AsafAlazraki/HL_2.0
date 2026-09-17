import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from './Field'
import { Input } from './Input'

describe('Field and Input', () => {
  test('the label names the control, so a reader can ask for it by name', () => {
    render(
      <Field label="Who it is for">
        <Input name="customer" />
      </Field>,
    )
    expect(screen.getByRole('textbox', { name: 'Who it is for' })).toBeInTheDocument()
  })

  test('a description is heard with the control', () => {
    render(
      <Field label="Who it is for" description="The name that goes on the quotation.">
        <Input name="customer" />
      </Field>,
    )
    expect(screen.getByRole('textbox', { name: 'Who it is for' })).toHaveAccessibleDescription(
      'The name that goes on the quotation.',
    )
  })

  test('an error is a sentence, on the page and on the control', () => {
    render(
      <Field label="Who it is for" error="A quotation needs a name on it.">
        <Input name="customer" />
      </Field>,
    )
    expect(screen.getByText('A quotation needs a name on it.')).toBeInTheDocument()
    const input = screen.getByRole('textbox', { name: 'Who it is for' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('A quotation needs a name on it.')
  })

  test('typing reaches the caller as the value, not as an event', async () => {
    const onValueChange = vi.fn<(value: string) => void>()
    render(
      <Field label="Who it is for">
        <Input name="customer" onValueChange={onValueChange} />
      </Field>,
    )
    await userEvent.type(screen.getByRole('textbox', { name: 'Who it is for' }), 'Mark')
    expect(onValueChange).toHaveBeenCalledTimes(4)
    expect(onValueChange).toHaveBeenLastCalledWith('Mark')
  })

  test('readOnly keeps a value legible and copyable; there is no disabled', () => {
    render(
      <Field label="Quote number">
        <Input name="number" value="Q-1042" readOnly mono />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Quote number' })
    expect(input).toHaveValue('Q-1042')
    expect(input).toHaveAttribute('readonly')
    expect(input).not.toHaveAttribute('disabled')
  })

  test('refuses a className or a style forced past the type', () => {
    const forced = { className: 'home-input', style: { color: 'rebeccapurple' } } as object
    render(
      <Field label="Who it is for">
        <Input name="customer" {...forced} />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Who it is for' })
    expect(input.getAttribute('class')).toBe('ui-input')
    expect(input.getAttribute('style')).toBeNull()
  })
})
