import { useState } from 'react'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { writeWorkbook } from '@/test/fixtures/workbook'
import { Shelf, type ShelfSee } from './Shelf'

/* ============================================================
   THE SHELF, RENDERED AND PRESSED, BY ROLE AND BY TEXT, over the real
   pack in the real catalogue store. The workbook brought in is a real
   .xlsx written from one of the pack's own lines with its Sell changed
   on purpose — the one change this test is about.
   ============================================================ */

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
})

beforeEach(async () => {
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
  await quotes.getState().openFor(PACK_ORG_ID)
})

function Driven() {
  const [see, setSee] = useState<ShelfSee | undefined>(undefined)
  return <Shelf see={see} onSee={setSee} />
}

const lines = () => pack.entities.reduce((n, e) => n + pack.rowsByEntity[e.id].length, 0)

describe('the shelf on the empty day', () => {
  it('counts Northside’s work, says no copy is saved, and keeps the two acts that take things away apart', () => {
    render(<Driven />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/work, kept safe\.$/)
    expect(screen.getByText('A new Master Price File? Bring it in.')).toBeInTheDocument()
    expect(screen.getByText('No copy saved yet')).toBeInTheDocument()
    expect(screen.getByText(lines().toLocaleString('en-AU'))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save a copy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear the price list…' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Forget everything…' })).toBeInTheDocument()
  })

  it('opens a page of its own, listing what goes and what stays, before the price list is cleared', async () => {
    const user = userEvent.setup()
    render(<Driven />)
    await user.click(screen.getByRole('button', { name: 'Clear the price list…' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Clear the price list from this computer',
    )
    expect(screen.getByText('Goes')).toBeInTheDocument()
    expect(screen.getByText('Stays')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save a copy first' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Clear the price list from this computer' }),
    ).toBeInTheDocument()
  })

  it('refuses a workbook that is not one, in a sentence where it was brought', async () => {
    render(<Driven />)
    fireEvent.change(screen.getByTestId('shelf-workbook'), {
      target: { files: [new File(['Code,Sell'], 'prices.csv')] },
    })
    expect(await screen.findByText(/^prices\.csv is not an Excel workbook\./)).toBeInTheDocument()
  })
})

describe('a new price list brought in', () => {
  it('shows the change before it is written, applies it as one step, and undoes it in one', async () => {
    const user = userEvent.setup()
    const tube = pack.rowsByEntity.parts.find(
      (r) => r.values['parts.c'] === 'Tube Covers to suit PVC Boat - 2.0 Mtr',
    )
    if (!tube) throw new Error('no tube cover in the pack')
    const was = tube.values['parts.l']
    const bytes = writeWorkbook([
      {
        name: 'Parts Maintenance',
        lines: [{ at: 597, cells: { C: 'Tube Covers to suit PVC Boat - 2.0 Mtr', L: 1540 } }],
      },
    ])
    render(<Driven />)
    fireEvent.change(screen.getByTestId('shelf-workbook'), {
      target: { files: [new File([bytes.buffer as ArrayBuffer], 'Parts Module (2).xlsx')] },
    })
    expect(
      await screen.findByText('Parts Module (2).xlsx is read. Nothing is written yet.'),
    ).toBeInTheDocument()
    const sell = () =>
      catalogue.getState().rows.parts.find((r) => r.id === tube.id)?.values['parts.l']
    expect(sell()).toBe(was)

    await user.click(screen.getByRole('button', { name: 'See every change' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      `${(lines() - 1).toLocaleString('en-AU')} of ${lines().toLocaleString('en-AU')} lines stay exactly as they are.`,
    )
    expect(screen.getByText('Undo puts all 1 back in one step.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Apply 1 change' }))
    expect(sell()).toBe(1540)
    expect(screen.getByText('1 change is on the price list.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(sell()).toBe(was))
  })
})
