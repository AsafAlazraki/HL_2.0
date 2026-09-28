import { afterEach, describe, expect, test, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Chapter } from './Chapter'
import { Button } from './Button'
import { Sheet } from './Dialog'
import { Input } from './Input'
import { MotionRoot, useStill } from './MotionRoot'
import { Moving } from './Moving'
import { OptionTile } from './OptionTile'
import { Picture, sharedName } from './Picture'
import { Select } from './Select'
import { Toast } from './Toaster'
import { canMorph, morph } from './transition'

/**
 * The kit's pieces of the build — a chapter, an option, a picture, a sheet — and the two
 * things every moving primitive leans on: the caret gate and the same-document morph.
 */
afterEach(() => {
  vi.unstubAllGlobals()
})

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <Chapter
      number="02"
      title="Motor"
      kind="motor"
      count="6 paired"
      say="One is chosen."
      total={16667}
      open={open}
      onOpenChange={setOpen}
    >
      <p>Yamaha F115LB</p>
    </Chapter>
  )
}

describe('Chapter', () => {
  test('its head is a button that says whether it is open, and opens the body it names', async () => {
    render(<Harness />)
    const head = screen.getByRole('button', { name: /02 · Motor/ })
    expect(head).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Yamaha F115LB')).toBeNull()
    await userEvent.click(head)
    expect(head).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: 'Motor' })).toHaveTextContent('Yamaha F115LB')
  })

  test('its subtotal is a price, set once', () => {
    render(<Harness />)
    expect(screen.getByText('$16,667')).toHaveAttribute('value', '16667')
  })
})

describe('OptionTile', () => {
  test('is a toggle named by what it is, with its picture, its facts and its figure', async () => {
    const onSelect = vi.fn<() => void>()
    render(
      <OptionTile
        name="Yamaha F115LB"
        facts="115 hp · 171 kg · 20″ shaft"
        picture={{ src: '/f115.webp', width: 800, height: 600 }}
        figure={<span>$16,667</span>}
        figureSay="Cash"
        selected={false}
        onSelect={onSelect}
      />,
    )
    const tile = screen.getByRole('button', { name: /Yamaha F115LB/ })
    expect(tile).toHaveAttribute('aria-pressed', 'false')
    /* the picture shows what the name names, so it does not open the name a second time */
    expect(tile).toHaveAccessibleName(/^Yamaha F115LB 115 hp/)
    expect(tile.querySelector('img')).toHaveAttribute('alt', '')
    await userEvent.click(tile)
    expect(onSelect).toHaveBeenCalledOnce()
  })

  test('takes the build’s name, its pairing’s words and a list’s lazy picture', () => {
    render(
      <OptionTile
        name={
          <>
            Yamaha <b>F115</b>LB
          </>
        }
        facts="115 hp · 171 kg · 20″ shaft"
        detail="Rigging Kit Option Mech Rigging Kit · 704 Binnacle Mount"
        picture={{ src: '/f115.webp', width: 800, height: 600 }}
        selected
        label="Yamaha F115LB, on the quote"
        lazy
      />,
    )
    const tile = screen.getByRole('button', { name: 'Yamaha F115LB, on the quote' })
    expect(tile).toHaveAttribute('aria-pressed', 'true')
    expect(tile).toHaveTextContent('Rigging Kit Option Mech Rigging Kit · 704 Binnacle Mount')
    expect(tile.querySelector('b')).toHaveTextContent('F115')
    expect(tile.querySelector('img')).toHaveAttribute('loading', 'lazy')
  })

  test('refused, it keeps its focus and says why', async () => {
    const onSelect = vi.fn<() => void>()
    render(
      <OptionTile
        name="Yamaha F150LC"
        selected={false}
        onSelect={onSelect}
        refusedBecause="This hull takes 115 hp at most."
      />,
    )
    const tile = screen.getByRole('button', { name: /Yamaha F150LC/ })
    expect(tile).toHaveAccessibleDescription('This hull takes 115 hp at most.')
    await userEvent.click(tile)
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('Picture', () => {
  test('is fetched at once unless it is one of a long list', () => {
    render(
      <>
        <Picture src="/a.webp" alt="The 529 on the water" width={1024} height={676} />
        <Picture src="/b.webp" alt="One of 289" width={1024} height={676} lazy />
      </>,
    )
    expect(screen.getByRole('img', { name: 'The 529 on the water' })).toHaveAttribute(
      'loading',
      'eager',
    )
    expect(screen.getByRole('img', { name: 'One of 289' })).toHaveAttribute('loading', 'lazy')
  })

  test('a shared picture carries the model’s name to the next screen, as an identifier', () => {
    render(<Picture src="/a.webp" alt="The 529" width={10} height={10} shared="boat-SA529APTR" />)
    expect(screen.getByRole('img', { name: 'The 529' }).style.viewTransitionName).toBe(
      'boat-SA529APTR',
    )
    expect(sharedName('boat 529 · Tournament')).toBe('boat-529-Tournament')
    expect(sharedName('529')).toBe('p-529')
  })
})

describe('Sheet', () => {
  test('opens from its trigger, is named, and gives the focus back', async () => {
    render(
      <Sheet title="Stacer 529 Assault Pro (Tournament)" trigger={<Button>Its facts</Button>}>
        <p>5.29 m</p>
      </Sheet>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Its facts' }))
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Stacer 529 Assault Pro (Tournament)')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Its facts' })).toHaveFocus()
  })
})

describe('Input with a glyph', () => {
  test('is still the textbox its label names; the glyph is hidden', () => {
    render(
      <>
        <label htmlFor="find">Find a 529</label>
        <Input id="find" icon={MagnifyingGlassIcon} />
      </>,
    )
    const box = screen.getByRole('textbox', { name: 'Find a 529' })
    expect(box.parentElement?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Select with a kind and a figure', () => {
  test('lists each option with the figure at its end', async () => {
    render(
      <Select
        aria-label="Motor"
        kind="motor"
        options={[
          { value: 'f90', label: 'Yamaha F90LB', trail: '$14,330' },
          { value: 'f115', label: 'Yamaha F115LB', trail: '$16,667' },
        ]}
        defaultValue="f90"
      />,
    )
    await userEvent.click(screen.getByRole('combobox', { name: 'Motor' }))
    expect(await screen.findByRole('option', { name: /Yamaha F115LB/ })).toHaveTextContent(
      '$16,667',
    )
  })
})

describe('Toast', () => {
  test('says what happened and offers its one way back', async () => {
    const onPress = vi.fn<() => void>()
    render(
      <Toast kind="motor" text="Yamaha F150LC taken off" action={{ label: 'Undo', onPress }} />,
    )
    expect(screen.getByText('Yamaha F150LC taken off')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onPress).toHaveBeenCalledOnce()
  })
})

function StillSays() {
  return <p>{useStill() ? 'still' : 'moving'}</p>
}

describe('MotionRoot', () => {
  test('nothing moves while a caret is in a field, and the page is told so', async () => {
    render(
      <MotionRoot>
        <StillSays />
        <label>
          Who it is for
          <input />
        </label>
        <button type="button">Elsewhere</button>
      </MotionRoot>,
    )
    expect(screen.getByText('moving')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('textbox', { name: 'Who it is for' }))
    expect(await screen.findByText('still')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-still')
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))
    await waitFor(() => expect(screen.getByText('moving')).toBeInTheDocument())
    expect(document.documentElement).not.toHaveAttribute('data-still')
  })
})

describe('morph', () => {
  test('without the browser’s API the change simply happens', () => {
    const update = vi.fn<() => void>()
    expect(canMorph()).toBe(false)
    morph(update)
    expect(update).toHaveBeenCalledOnce()
  })

  test('with it, the change runs inside a view transition', () => {
    const start = vi.fn<(update: () => void) => void>((update) => {
      act(() => update())
    })
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }))
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = start
    const update = vi.fn<() => void>()
    morph(update)
    expect(start).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledOnce()
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
  })

  test('under reduced motion it does not morph', () => {
    const start = vi.fn<(update: () => void) => void>()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
    }))
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = start
    const update = vi.fn<() => void>()
    morph(update)
    expect(start).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledOnce()
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
  })
})

describe('Moving', () => {
  test('is a named list whose items leave when it narrows', async () => {
    const { rerender } = render(
      <Moving items={['F90LB', 'F115LB']} keyOf={(m) => m} label="The motors">
        {(m) => <span>{m}</span>}
      </Moving>,
    )
    const list = screen.getByRole('list', { name: 'The motors' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    rerender(
      <Moving items={['F115LB']} keyOf={(m) => m} label="The motors">
        {(m) => <span>{m}</span>}
      </Moving>,
    )
    await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(1))
    expect(within(list).getByText('F115LB')).toBeInTheDocument()
  })
})
