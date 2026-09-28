import { afterEach, describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from './Button'
import { Chapter } from './Chapter'
import { Picture } from './Picture'
import { Plate } from './Plate'
import { StatusDot } from './Status'
import { morph, own, ownTransitions } from './transition'

/**
 * WHAT THE SCREENS ASKED THE KIT FOR, 2026-09-28 (the verify round): each adopter worked around
 * a primitive and said so; each ask is made once here, for every screen, and asked for by role
 * and text like the rest of the kit's tests.
 */
afterEach(() => {
  vi.unstubAllGlobals()
})

function Harness({ total }: { total: number | null }) {
  const [open, setOpen] = useState(false)
  return (
    <Chapter
      number="05"
      title="Who it is for"
      total={total}
      empty="Nothing on it yet"
      level="h2"
      open={open}
      onOpenChange={setOpen}
    >
      <p>The customer</p>
    </Chapter>
  )
}

describe('Chapter, asked for by the build', () => {
  test('a chapter with no subtotal says why where the figure would stand', () => {
    render(<Harness total={null} />)
    expect(screen.getByText('Nothing on it yet')).toBeInTheDocument()
    expect(screen.queryByText('—')).toBeNull()
  })

  test('its head can stand in a heading, and the heading holds the button', async () => {
    render(<Harness total={null} />)
    const heading = screen.getByRole('heading', { level: 2, name: /Who it is for/ })
    const head = screen.getByRole('button', { name: /Who it is for/ })
    expect(heading).toContainElement(head)
    await userEvent.click(head)
    expect(head).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('StatusDot, asked for by the cascade', () => {
  test('a state can take the size of the words it stands in', () => {
    const { container } = render(
      <StatusDot state="given" size="inherit">
        given to the customer
      </StatusDot>,
    )
    expect(screen.getByText('given to the customer')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute('data-size', 'inherit')
  })
})

describe('Button, asked for by the cascade', () => {
  test('an act that goes back leads with its disc, and is named by its words', () => {
    render(
      <Button intent="act" icon={ArrowLeftIcon} back>
        Back to the build
      </Button>,
    )
    const act = screen.getByRole('button', { name: 'Back to the build' })
    expect(act).toHaveAttribute('data-way', 'back')
    expect(act.firstElementChild).toHaveClass('ui-button-disc')
  })

  test('a way back on any other intent changes nothing', () => {
    render(
      <Button intent="secondary" icon={ArrowLeftIcon} back>
        Back
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Back' })).not.toHaveAttribute('data-way')
  })
})

describe('Plate and Picture, asked for by the cascade and the sale', () => {
  test('a plate can be one item of a list', () => {
    render(
      <ul>
        <Plate as="li">A cause</Plate>
      </ul>,
    )
    expect(screen.getByRole('listitem')).toHaveTextContent('A cause')
  })

  test('a picture carries the ledger’s smaller copies and how wide it is drawn', () => {
    render(
      <Picture
        src="/hero-2560.webp"
        srcSet="/hero-640.webp 640w, /hero-2560.webp 2560w"
        sizes="(max-width: 640px) 100vw, 480px"
        alt="The 529 on the water"
        width={2560}
        height={1440}
      />,
    )
    const img = screen.getByRole('img', { name: 'The 529 on the water' })
    expect(img).toHaveAttribute('srcset', '/hero-640.webp 640w, /hero-2560.webp 2560w')
    expect(img).toHaveAttribute('sizes', '(max-width: 640px) 100vw, 480px')
  })
})

const skip = (): Promise<never> => Promise.reject(new DOMException('skipped', 'AbortError'))
function skipped() {
  return { ready: skip(), finished: skip(), updateCallbackDone: Promise.resolve() }
}

describe('A skipped view transition, asked for by every register', () => {
  test('its promises are held, so a skip is not a page error', async () => {
    const lost = vi.fn<(event: PromiseRejectionEvent) => void>()
    globalThis.addEventListener('unhandledrejection', lost)
    own(skipped())
    await new Promise((done) => setTimeout(done, 0))
    globalThis.removeEventListener('unhandledrejection', lost)
    expect(lost).not.toHaveBeenCalled()
  })

  test('every call to the browser’s own start is owned once, the router’s included', () => {
    const start = vi.fn<(update: () => void) => ReturnType<typeof skipped>>(() => skipped())
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = start
    ownTransitions()
    ownTransitions()
    const t = document.startViewTransition(() => undefined)
    expect(start).toHaveBeenCalledOnce()
    expect(t).toBeDefined()
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
  })

  test('a morph may be typed, where the browser knows types', () => {
    const start = vi.fn<(arg: unknown) => ReturnType<typeof skipped>>(() => skipped())
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }))
    vi.stubGlobal('CSS', { supports: () => true })
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = start
    morph(() => undefined, ['turn'])
    expect(start).toHaveBeenCalledWith(expect.objectContaining({ types: ['turn'] }))
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
  })
})
