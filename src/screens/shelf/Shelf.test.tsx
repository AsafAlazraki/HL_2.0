import { useState } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { writeWorkbook } from '@/test/fixtures/workbook'
import { session } from '@/state/session'
import { prefs } from '@/state/prefs'
import type { OrgProfile, QuoteDef, QuoteLine } from '@/domain/model'
import { apply as applyToQuote, isDone, issue } from '@/domain/quote/commands'
import { letterheadOf, preparerOf } from '@/domain/northside/letterhead'
import { validateEnvelope } from '@/domain/io/envelope'
import { Shelf, type ShelfSee } from './Shelf'
import { LAST_COPY_PREF, saveACopy } from './acts'

/* THE COPY A SAVE HANDS TO DOWNLOADS, caught instead of handed: the one browser errand a test
   cannot run is the download itself, so it is read here exactly as the browser would be given it */
const handed = vi.hoisted(() => ({ text: '', name: '' }))
vi.mock('./files', async (actual) => ({
  ...(await actual<typeof import('./files')>()),
  download: (text: string, name: string) => {
    handed.text = text
    handed.name = name
  },
}))

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
  it('shows the change before it is written, applies it as one step, and undoes it in one, after leaving the shelf too', async () => {
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
    const first = render(<Driven />)
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

    /* a walk away from the shelf and back: the Undo is still the one to press */
    first.unmount()
    render(<Driven />)
    expect(
      screen.getByText('Parts Module (2).xlsx is on the price list: 1 change.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(sell()).toBe(was))
  })
})

/* ------------------------------------------------------------ */
/* the acts that replace or take away, and the one switch        */
/* ------------------------------------------------------------ */

const NOW = '2026-10-30T00:30:00.000Z'

/** Northside as Settings would have it: two people, one of them set apart. */
const northside: OrgProfile = {
  name: 'Northside Marine',
  industry: 'marine',
  createdAt: NOW,
  abn: '51 824 753 556',
  phone: '07 3000 0000',
  validDays: 30,
  people: [
    { id: 'p-asaf', name: 'Asaf', title: 'Sales manager', phone: '0400 111 222' },
    { id: 'p-sam', name: 'Sam', title: 'Sales', mayChange: false },
  ],
}

/** A quote given to a customer by name, its letterhead and preparer copied on at the give. */
function givenQuote(): QuoteDef {
  const hull: QuoteLine = {
    id: 'l1',
    entityId: 'boat_stacer',
    rowId: 'row_529',
    label: 'Stacer - 529 Assault Pro (Tournament)',
    qty: 1,
    unitPrice: 29030,
    priceFieldId: 'fld_cash',
    priceColumnName: 'Cash',
    levelKey: 'cash',
    levelResolved: 'cash',
    levels: [{ key: 'cash', label: 'Cash', fieldId: 'fld_cash', value: 29030, scope: 'quote' }],
  }
  const draft: QuoteDef = {
    id: 'q-given',
    orgId: PACK_ORG_ID,
    reference: '20261030-01',
    state: 'draft',
    viewId: 'view_1',
    rootTableId: 'boat_stacer',
    rootRowId: 'row_529',
    subjectLabel: hull.label,
    subjectSpecs: [],
    sections: [{ blockId: '__subject', tableId: 'boat_stacer', title: 'Stacer', lineIds: ['l1'] }],
    chapters: [{ id: '__subject', title: 'Stacer', tableId: 'boat_stacer' }],
    lines: [hull],
    adjustments: [],
    events: [],
    levelKey: 'cash',
    customer: { name: 'R. Kelleher' },
    preparedBy: 'Asaf',
    organisation: 'Northside Marine',
    createdAt: NOW,
    updatedAt: NOW,
  }
  const done = applyToQuote(
    draft,
    issue({
      letterhead: letterheadOf(northside, 'Northside Marine', {
        src: '/brand-marks/northside-marine.png',
        width: 1798,
        height: 448,
      }),
      preparer: preparerOf(northside.people, 'Asaf'),
    }),
    NOW,
  )
  if (!isDone(done)) throw new Error(done.refused)
  return done.next
}

describe('the acts that replace or take away', () => {
  afterEach(() => {
    session.getState().signOut()
    prefs.getState().remove(LAST_COPY_PREF)
    catalogue.setState({ org: undefined })
    quotes.setState({ quotes: [] })
  })

  it('counts a customer a given quote names, as the pill and Customers do', () => {
    quotes.setState({ quotes: [givenQuote()] })
    render(<Driven />)
    const kind = screen.getByText('Customers').closest('li')
    expect(kind).toHaveTextContent(/^Customersthe people Northside sells to1$/)
  })

  it('refuses a person set apart from changing prices and settings, where they pressed, and writes nothing', async () => {
    const user = userEvent.setup()
    catalogue.setState({ org: northside })
    session.getState().signIn('Sam')
    const partsBefore = catalogue.getState().rows.parts.length
    render(<Driven />)
    await user.click(screen.getByRole('button', { name: 'Clear the price list…' }))
    await user.click(
      screen.getByRole('button', { name: 'Clear the price list from this computer' }),
    )
    expect(
      await screen.findByText(
        'Sam is set apart from changing prices and settings, so nothing was changed. Asaf may.',
      ),
    ).toBeInTheDocument()
    expect(catalogue.getState().rows.parts.length).toBe(partsBefore)
  })

  it('refuses to forget everything until a copy has been saved, and lets it through once one is', async () => {
    const user = userEvent.setup()
    quotes.setState({ quotes: [givenQuote()] })
    render(<Driven />)
    await user.click(screen.getByRole('button', { name: 'Forget everything…' }))
    const forget = screen.getByRole('button', { name: 'Forget everything on this computer' })
    expect(forget).toHaveAttribute('aria-disabled', 'true')
    expect(
      screen.getByText(
        'Save a copy first: none has been saved on this computer, so nothing of this could come back.',
      ),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save a copy first' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Forget everything on this computer' }),
      ).toHaveAttribute('aria-disabled', 'false'),
    )
    expect(handed.name).toMatch(/^Northside Marine copy \d{4}-\d{2}-\d{2} \d{4}\.json$/)
  })

  it('carries a given quote out and back with the letterhead and the preparer it was given with', async () => {
    const given = givenQuote()
    expect(given.letterhead?.abn).toBe('51 824 753 556')
    expect(given.preparer?.phone).toBe('0400 111 222')
    quotes.setState({ quotes: [given] })
    await saveACopy(new Date(NOW))
    const back = validateEnvelope(JSON.parse(handed.text), PACK_ORG_ID)
    if (!back.ok) throw new Error('the copy did not read back')
    const returned = back.data.quotes?.find((q) => q.id === given.id)
    expect(returned?.letterhead).toEqual(given.letterhead)
    expect(returned?.preparer).toEqual(given.preparer)
    expect(returned?.lines).toEqual(given.lines)
    expect(returned?.reference).toBe(given.reference)
  })
})
