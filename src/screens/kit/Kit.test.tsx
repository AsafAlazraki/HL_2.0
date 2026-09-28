import { beforeAll, describe, expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { specimenOf, type KitSpecimen } from '@/domain/kit/specimen'
import { ADDRESSED_TO_NOBODY } from '@/domain/quote/totals'
import { loadPack } from '@/test/fixtures/pack'
import { Toaster } from '@/ui'
import { Kit } from './Kit'

/* ============================================================
   THE KIT'S SPECIMEN, DRIVEN AS A PERSON DRIVES IT — on the 529 as the
   real pack holds it. It says what it is doing while it reads, says
   why when it cannot, and every control on it does something true:
   a refusal says the finale's own sentence, a motor chosen can be
   taken back, a hull chosen brings its own motors with it.
   ============================================================ */

let kit: KitSpecimen

beforeAll(async () => {
  const pack = await loadPack()
  const read = specimenOf({
    business: pack.manifest.name,
    entities: pack.entities,
    rows: pack.rowsByEntity,
    images: pack.images,
  })
  if ('refused' in read) throw new Error(read.refused)
  kit = read
})

describe('the kit', () => {
  test('says it is reading while it reads, and why when it cannot', () => {
    const { unmount } = render(<Kit read={null} />)
    expect(screen.getByText('Reading the 529 from the price file…')).toBeInTheDocument()
    unmount()
    render(<Kit read={{ refused: 'The kit could not read the price file: offline.' }} />)
    expect(screen.getByText('The kit could not read the price file: offline.')).toBeInTheDocument()
  })

  test('draws the 529 as the file holds it: its name, its price, its band', () => {
    render(<Kit read={kit} />)
    expect(screen.getByRole('heading', { level: 1, name: 'The kit' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Northside Marine' })).toBeInTheDocument()
    expect(screen.getAllByText('$28,530').length).toBeGreaterThan(0)
    expect(screen.getByText('Cash and Trade are the same figure on this boat.')).toBeInTheDocument()
  })

  test('the refused act says the finale’s own sentence, and then why the kit still gives nothing', async () => {
    render(<Kit read={kit} />)
    const give = screen.getByRole('button', { name: 'Give it to the customer' })
    expect(give).toHaveAccessibleDescription(ADDRESSED_TO_NOBODY)
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Who the quote is addressed to' }),
      'R. Kelleher',
    )
    expect(give).toHaveAccessibleDescription(
      'The kit holds no quote, so there is nothing here to give.',
    )
  })

  test('a motor taken off can be taken back', async () => {
    render(
      <>
        <Kit read={kit} />
        <Toaster />
      </>,
    )
    const motors = screen.getByRole('region', { name: 'Motor' })
    const f90 = within(motors).getByRole('button', { name: /^Yamaha F90LB 90 hp/ })
    expect(f90).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(f90)
    expect(f90).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    expect(f90).toHaveAttribute('aria-pressed', 'true')
  })

  test('a hull chosen brings its own motors, never another’s', async () => {
    render(<Kit read={kit} />)
    const hull = screen.getByRole('button', { name: /01 · Hull/ })
    await userEvent.click(hull)
    const rows = screen.getByRole('region', { name: 'Hull' })
    await userEvent.click(within(rows).getByRole('button', { name: /529 Outlaw \(Side Console\)/ }))
    await userEvent.click(screen.getByRole('button', { name: /02 · Motor/ }))
    const motors = screen.getByRole('region', { name: 'Motor' })
    const outlaw = kit.siblings.find((b) => b.title === 'Stacer 529 Outlaw (Side Console)')!
    const tiles = within(motors).getAllByRole('button', { name: /^Yamaha / })
    expect(tiles).toHaveLength(outlaw.motors.length)
    outlaw.motors.forEach((m, i) =>
      expect(tiles[i]!.textContent).toMatch(
        new RegExp(`^${m.code}|${m.said.replace(/[()]/g, '.')}`),
      ),
    )
  })

  test('an accent that would take another ink’s job is refused with its reason', () => {
    render(<Kit read={kit} />)
    expect(screen.getByRole('button', { name: 'Amber' })).toHaveAccessibleDescription(
      /^The accent cannot be the act’s amber/,
    )
    expect(screen.getByRole('button', { name: 'Plum' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})
