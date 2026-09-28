import { describe, expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BoatIcon } from '@phosphor-icons/react'
import { Band } from './Band'
import { Dashes } from './Dashes'
import { Icon } from './Icon'
import { KindMark } from './KindMark'
import { Plate } from './Plate'
import { PriceFigure } from './PriceFigure'
import { Refusal } from './Refusal'
import { Row } from './Row'
import { Stat } from './Stat'
import { BandHead, StatusDot } from './Status'

/**
 * The kit's surfaces and marks, asked for by role and text. A glyph is never the only name a
 * thing has; a count is part of what a reader hears; a price is one string whatever its size.
 */
describe('Icon and KindMark', () => {
  test('a glyph beside its word is hidden from a reader', () => {
    const { container } = render(<Icon glyph={BoatIcon} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  test('a glyph that is the only name is named', () => {
    render(<Icon glyph={BoatIcon} label="Boat" />)
    expect(screen.getByRole('img', { name: 'Boat' })).toBeInTheDocument()
  })

  test('a kind wears the model’s own ink for it', () => {
    const { container } = render(<KindMark kind="motor" />)
    const mark = container.firstElementChild as HTMLElement
    expect(mark.dataset.ink).toBe('carmine')
    expect(mark).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('StatusDot and BandHead', () => {
  test('a state is its word, with the dot hidden', () => {
    render(<StatusDot state="given">Given</StatusDot>)
    expect(screen.getByText('Given')).toBeInTheDocument()
  })

  test('a band head is a heading that says its count', () => {
    render(
      <BandHead state="draft" count={3} level="h2">
        Drafts
      </BandHead>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Drafts 3' })).toBeInTheDocument()
  })
})

describe('Stat', () => {
  test('a count and what it counts, in the words', () => {
    render(<Stat kind="motor" value={1234} label="motors in the file" />)
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('motors in the file')).toBeInTheDocument()
  })
})

describe('Plate', () => {
  test('a named section is a landmark a reader can find', () => {
    render(
      <Plate as="section" label="The build">
        <p>Motor</p>
      </Plate>,
    )
    expect(screen.getByRole('region', { name: 'The build' })).toHaveTextContent('Motor')
  })

  test('is the day wherever it stands', () => {
    render(<Plate>Motor</Plate>)
    expect(screen.getByText('Motor')).toHaveAttribute('data-ground', 'plate')
  })
})

describe('Row', () => {
  test('is a button named by its title and its count, and answers a press', async () => {
    const onPress = vi.fn<() => void>()
    render(<Row title="Yamaha Outboards" kind="motor" count={209} onPress={onPress} />)
    await userEvent.click(screen.getByRole('button', { name: 'Yamaha Outboards 209' }))
    expect(onPress).toHaveBeenCalledOnce()
  })

  test('with an address it is a real link, and says it is where you are', () => {
    render(<Row title="Stacer" count={91} href="/data/boat_stacer" current />)
    const link = screen.getByRole('link', { name: 'Stacer 91' })
    expect(link).toHaveAttribute('href', '/data/boat_stacer')
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  test('drawn for a list that holds the keyboard itself, it takes no focus of its own', () => {
    render(<Row as="div" title="Stacer Trailers" count={34} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Stacer Trailers')).toBeInTheDocument()
  })
})

describe('PriceFigure', () => {
  test('is one string at every size, never split, and carries its value', () => {
    render(<PriceFigure amount={28530} size="display" />)
    const price = screen.getByText('$28,530')
    expect(price).toHaveAttribute('value', '28530')
    expect(price).toHaveAttribute('data-size', 'display')
  })
})

describe('Refusal', () => {
  test('is its sentence, its glyph hidden', () => {
    render(<Refusal id="why">This quote is addressed to nobody.</Refusal>)
    const said = screen.getByText('This quote is addressed to nobody.')
    expect(said.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Band', () => {
  test('is named by the business, set as its words', () => {
    render(<Band name="Northside Marine" say="The name in type, until Northside adds its mark." />)
    const band = screen.getByRole('region', { name: 'Northside Marine' })
    expect(within(band).getByText('Northside')).toBeInTheDocument()
    expect(within(band).getByText('Marine')).toBeInTheDocument()
    expect(band.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  test('once Northside has a mark, the mark stands where the first word stood', () => {
    render(<Band name="Northside Marine" mark={{ src: '/mark.svg', alt: 'Northside Marine' }} />)
    expect(screen.getByRole('img', { name: 'Northside Marine' })).toBeInTheDocument()
  })
})

describe('Dashes', () => {
  test('says where you are in words; the dashes are hidden', () => {
    const { container } = render(
      <Dashes chapters={['Hull', 'Motor', 'Trailer']} at={1} through={0.5} />,
    )
    expect(screen.getByText('02 / 03')).toBeInTheDocument()
    expect(screen.getByText('Motor')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  test('a chapter handed its own number says it, and one handed none says its name alone', () => {
    const chapters = [
      { name: 'Hull', number: '01' },
      { name: 'Trailer', number: '03' },
      { name: 'Who it is for' },
    ]
    const { rerender } = render(<Dashes chapters={chapters} at={1} through={0} />)
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.queryByText(/\/ 03/)).toBeNull()
    rerender(<Dashes chapters={chapters} at={2} through={0} />)
    expect(screen.getByText('Who it is for')).toBeInTheDocument()
    expect(screen.queryByText('03')).toBeNull()
  })
})
