/* ============================================================
   SETTINGS, RENDERED AND PRESSED, BY ROLE AND BY TEXT.

   NOTHING HERE IS SEEDED AND NOBODY IS INVENTED. The business is the
   one the price list names, the one name known is the one given at the
   door, and every change is made by pressing the screen's own controls,
   through the catalogue's own commands. Northside's settings are
   forgotten before every case, because the memory database lives as
   long as the file.
   ============================================================ */
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, RowData } from '@/domain/model'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { repositories } from '@/data'
import { catalogue } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { Manage, NOTHING_OPEN } from './Manage'

const ORG = 'northside'
const ISO = '2026-01-01T00:00:00.000Z'

const aSheet = (): EntityDef => ({
  id: 'boat_stacer',
  orgId: ORG,
  name: 'Stacer',
  accent: 'blue',
  kind: 'boat',
  role: 'base',
  position: { x: 0, y: 0 },
  fields: [{ id: 'f-model', name: 'Model', type: 'text' }],
  createdAt: ISO,
  updatedAt: ISO,
})

async function open(named = true): Promise<void> {
  await repositories(ORG).org.clear()
  await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
  await catalogue.getState().load({
    entities: [aSheet()],
    rowsByEntity: { boat_stacer: [] as RowData[] },
    ...(named ? { manifest: { name: 'Northside Marine' } as never } : {}),
  })
}

let place: { line?: string; person?: string } = {}
function draw() {
  const view = render(<Manage place={place} onPlace={(next) => (place = next)} />)
  const again = () => view.rerender(<Manage place={place} onPlace={(next) => (place = next)} />)
  return { again }
}
const press = (name: RegExp | string) => userEvent.click(screen.getByRole('button', { name }))

beforeEach(async () => {
  place = {}
  session.getState().signIn('Asaf')
  await open()
})

describe('day one: nothing is written for Northside', () => {
  it('splits into what prints and what shows, and draws the letterhead with every empty line dashed', () => {
    draw()
    expect(screen.getByRole('heading', { name: 'What prints' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What shows' })).toBeInTheDocument()
    const strip = screen.getByTestId('letterhead')
    for (const line of ['ABN', 'Phone', 'Email', 'Website', 'Street address', 'Legal name'])
      expect(
        within(strip).getByRole('button', { name: `${line} — none given, so none prints. Add it` }),
      ).toBeInTheDocument()
    expect(
      screen.getByText(
        /No quote has been started on this computer yet, so the letterhead is drawn on its own\./,
      ),
    ).toBeInTheDocument()
  })

  it('says what an empty line prints, value first, and draws the one name known as given at sign-in', () => {
    draw()
    expect(
      screen.getByText('None is assumed, so a quote says every price includes it'),
    ).toBeInTheDocument()
    expect(screen.getByText('No number of days, so no date prints')).toBeInTheDocument()
    expect(screen.getByText('given at sign-in')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep Asaf as a person' })).toBeInTheDocument()
    expect(screen.queryByTestId('manage-staged')).toBeNull()
  })

  it('says why nothing can be set where no price list names a business', async () => {
    await open(false)
    draw()
    expect(screen.getByText(NOTHING_OPEN)).toBeInTheDocument()
  })
})

describe('a line set where it prints', () => {
  it('refuses an ABN whose digits do not add up, and keeps one that does', async () => {
    const { again } = draw()
    await press('ABN — none given, so none prints. Add it')
    again()
    const field = screen.getByRole('textbox', { name: 'ABN' })
    await userEvent.type(field, '51 824 753 557')
    await press('Keep')
    expect(screen.getByRole('alert')).toHaveTextContent(/do not add up the way every ABN’s do/)
    await userEvent.clear(field)
    await userEvent.type(field, '51824753556')
    await press('Keep')
    again()
    expect(catalogue.getState().org?.abn).toBe('51 824 753 556')
    expect(
      within(screen.getByTestId('letterhead')).getByRole('button', {
        name: 'ABN, ABN 51 824 753 556 — change it',
      }),
    ).toBeInTheDocument()
  })

  it('sets the GST rate value first, and says it as a rate', async () => {
    const { again } = draw()
    await press('Set gst rate')
    again()
    await userEvent.type(screen.getByRole('textbox', { name: 'GST rate' }), '10')
    await press('Keep')
    again()
    expect(catalogue.getState().org?.gstRate).toBe(10)
    expect(screen.getByText('10%')).toBeInTheDocument()
  })
})

describe('who prepares it', () => {
  it('keeps the name at the door as a person, with a title that prints under it', async () => {
    const { again } = draw()
    await press('Keep Asaf as a person')
    again()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Asaf')
    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Sales manager')
    await press('Keep')
    again()
    expect(catalogue.getState().org?.people).toEqual([
      expect.objectContaining({ name: 'Asaf', title: 'Sales manager' }),
    ])
    expect(screen.getByText('Sales manager')).toBeInTheDocument()
    expect(screen.getByText('at the keyboard')).toBeInTheDocument()
  })

  it('refuses to set apart the last person who may change prices and settings, in a sentence', async () => {
    const { again } = draw()
    await press('Keep Asaf as a person')
    again()
    await press('Keep')
    again()
    await userEvent.click(screen.getByRole('switch', { name: 'May change prices and settings' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Somebody has to be able to change prices and settings, and this is the last person who may.',
    )
    expect(catalogue.getState().org?.people?.[0]?.mayChange).toBeUndefined()
  })
})

describe('colour, measured and tried before it is kept', () => {
  it('refuses the yellow at the floor with the nearest colours that pass', async () => {
    draw()
    await userEvent.type(screen.getByRole('textbox', { name: 'Any other colour' }), '#FFEA28')
    await press('Try it')
    const refused = screen.getByTestId('manage-colour-refused')
    expect(refused).toHaveTextContent('White on #FFEA28 is 1.23 : 1, under the 4.5 : 1')
    expect(refused).toHaveTextContent('The nearest that read:')
    /* the machinery stays out of sight: no count of colours tried, no ratio on a chip */
    expect(refused).not.toHaveTextContent(/colours tried|\d : 1.*\d : 1.*\d : 1/)
    expect(within(refused).getAllByRole('button')).toHaveLength(2)
    expect(screen.queryByTestId('manage-staged')).toBeNull()
    /* said on the water in the room's reason ink, never the paper's grey on navy (2.18 : 1) */
    expect(within(refused).getByRole('alert').querySelector('.ui-refusal')).toHaveAttribute(
      'data-on',
      'room',
    )
  })

  it('says the one measured fact once, for the colour on the stage, and no ramp of steps', () => {
    draw()
    expect(screen.getByTestId('manage-colour-reads')).toHaveTextContent(
      'White words on #1A65BD read at',
    )
    expect(screen.queryByText(/Eleven steps/)).toBeNull()
    expect(screen.queryByText(/veil/)).toBeNull()
    expect(screen.queryByText(/Northside to confirm/)).toBeNull()
    expect(screen.queryByText(/not built yet/)).toBeNull()
  })

  it('shows the mark’s blue on the stage as changed, not kept, and keeps it in one press', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: /^From the mark, #0066CC/ }))
    const staged = screen.getByTestId('manage-staged')
    expect(staged).toHaveTextContent('Changed, not kept')
    expect(staged).toHaveTextContent('Colour #0066CC in place of #1A65BD')
    expect(catalogue.getState().org?.look?.brand).toBeUndefined()
    await userEvent.click(within(staged).getByRole('button', { name: 'Keep' }))
    expect(catalogue.getState().org?.look?.brand).toBe('#0066cc')
    expect(screen.queryByTestId('manage-staged')).toBeNull()
  })

  it('puts a tried colour back without keeping anything', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: /^From the mark, #0066CC/ }))
    await press('Put back')
    expect(screen.queryByTestId('manage-staged')).toBeNull()
    expect(catalogue.getState().org).toBeUndefined()
  })
})

describe('Home, arranged', () => {
  it('hides a section without forgetting it, and moves one by a place', async () => {
    draw()
    const makers = screen.getByText('What Northside sells', { selector: '.mg-section__name' })
    const row = makers.closest('li')!
    await userEvent.click(within(row).getByRole('switch', { name: 'Shown' }))
    expect(catalogue.getState().org?.home?.hidden).toEqual(['makers'])
    expect(
      within(makers.closest('li')!).getByRole('switch', { name: 'Hidden' }),
    ).toBeInTheDocument()
    await press('Move What Northside sells up')
    expect(catalogue.getState().org?.home?.order).toEqual(['desk', 'makers', 'boats'])
    await userEvent.click(
      within(
        screen.getByText('What Northside sells', { selector: '.mg-section__name' }).closest('li')!,
      ).getByRole('switch', { name: 'Hidden' }),
    )
    expect(catalogue.getState().org?.home?.hidden).toBeUndefined()
  })
})

describe('shape, spacing and motion', () => {
  it('names each step above its answers, and a press changes Northside’s corners', async () => {
    draw()
    for (const name of ['Corners', 'Shadow', 'Spacing in lists', 'Motion']) {
      expect(screen.getByRole('group', { name })).toBeInTheDocument()
      expect(screen.getByText(name, { selector: '.mg-step__lab' })).toBeInTheDocument()
    }
    await userEvent.click(
      within(screen.getByRole('group', { name: 'Corners' })).getByRole('radio', { name: 'Square' }),
    )
    expect(catalogue.getState().org?.look?.corners).toBe('square')
  })
})
