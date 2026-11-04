import { useState } from 'react'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { RULE_REFUSES } from '@/domain/fitment/say'
import { rowLabel } from '@/domain/model'
import { pairColumns, pairRule } from '@/domain/rules/constraints/pairRules'
import { Fitment, type FitmentPosition } from './Fitment'

/* ============================================================
   WHAT FITS ONE BOAT, BY ROLE AND TEXT, OVER THE REAL PRICE LIST —
   direction A of the fit flow, "Two doors, one page" (rewritten
   2026-11-05 for the owner's new journey).

   The screen writes no reason of its own: every sentence asserted
   below is a count read off the price list or the domain's own words
   (`@/domain/fitment`), found where a salesperson would find it.
   ============================================================ */

const PA600 = 'boat_highfield:298'
const SP560 = 'boat_highfield:483'
const SP660 = 'boat_highfield:513'
let pack: PackFixture
let positions: FitmentPosition[] = []
let boats: string[] = []

beforeAll(async () => {
  pack = await loadPack()
})

beforeEach(async () => {
  positions = []
  boats = []
  catalogue.setState({ constraintDefs: [] })
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
})

const draw = (over: Partial<Parameters<typeof Fitment>[0]> = {}) =>
  render(
    <Fitment
      boat={PA600}
      onPosition={(p) => positions.push(p)}
      openBoat={(id) => boats.push(id)}
      openTheFile={() => {}}
      {...over}
    />,
  )

/** THE CHOOSER'S POSITION KEPT THE WAY THE ROUTE KEEPS IT (`?maker=&model=`) */
function Addressed() {
  const [at, setAt] = useState<{ maker: string; model: string }>({ maker: '', model: '' })
  return (
    <Fitment
      boat=""
      maker={at.maker}
      model={at.model}
      onPosition={(p) => {
        positions.push(p)
        if (p.maker !== undefined || p.model !== undefined)
          setAt({ maker: p.maker ?? '', model: p.model ?? '' })
      }}
      openBoat={(id) => boats.push(id)}
      openTheFile={() => {}}
    />
  )
}

/** THE PAGE WITH ITS CHOICES KEPT THE WAY THE ROUTE KEEPS THEM */
function Chosen({ boat, changing = false }: { boat: string; changing?: boolean }) {
  const [at, setAt] = useState<FitmentPosition>({ change: changing ? 1 : 0 })
  return (
    <Fitment
      boat={boat}
      motor={at.motor ?? ''}
      trailer={at.trailer ?? ''}
      fit={at.fit ? at.fit.split(',') : []}
      changing={at.change === 1}
      onPosition={(p) => {
        positions.push(p)
        setAt((was) => ({ ...was, ...p }))
      }}
      openBoat={(id) => boats.push(id)}
      openTheFile={() => {}}
    />
  )
}

describe('one boat, one page', () => {
  it('names the model, its version under it, and what it takes in one row', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Highfield Patrol 600$/)
    /* never an ordinal (walk 2, F12): what the versions cost, and that this one is the lowest */
    expect(screen.getByText(/^10 versions,/)).toHaveTextContent(
      '10 versions, $30,190 to $40,670. This one is the lowest.',
    )
    const takes = screen.getByLabelText('What the boat takes, and its own figures')
    expect(takes).toHaveTextContent('Motor115–150 hpone motor')
    expect(takes).toHaveTextContent('ShaftExtra-long (25″)')
    /* nothing on the page opens or closes */
    expect(document.querySelectorAll('[aria-expanded="true"]')).toHaveLength(0)
  })

  it('offers the five motors as one choice, the recommended chosen, and never says "On the quote"', () => {
    draw()
    const motors = screen.getByRole('radiogroup', { name: 'The motor for the quote' })
    const radios = within(motors).getAllByRole('radio')
    expect(radios).toHaveLength(6)
    expect(radios[0]).toBeChecked()
    expect(motors).toHaveTextContent(
      /^Yamaha F115XBRecommended115 hp · 176 kg · 25″ shaft · with its rigging kitEngine Colour: Grey\$16,869Chosen for the quote/,
    )
    expect(document.body.textContent).not.toMatch(/On the quote|Take it off|Show these/)
    expect(
      screen.getByRole('heading', { name: 'Why the other 204 Yamahas do not go on it' }),
    ).toBeInTheDocument()
  })

  it('says the trailer named for the boat as named for it, and counts the other 433 apart', () => {
    draw()
    const trailer = screen.getByRole('region', { name: 'Trailer' })
    expect(trailer).toHaveTextContent('No trailer on the price list is listed for the Patrol 600.')
    const named = within(trailer).getByRole('complementary', {
      name: 'Named for it, not listed for it',
    })
    expect(named).toHaveTextContent('GFAB Tandem Axel Trailer t/s Highfield Patrol 600$23,063')
    expect(
      within(trailer).getByRole('heading', { name: 'Why the other 433 trailers do not go on it' }),
    ).toBeInTheDocument()
    expect(trailer.textContent).not.toMatch(/not made for/)
  })

  it('ticks a fit-out line onto the quote this starts, and the bar counts it', async () => {
    render(<Chosen boat={SP560} />)
    const bar = screen.getByRole('region', { name: 'The quote this starts' })
    expect(bar).toHaveTextContent('The quote this starts · 4 lines')
    expect(bar).toHaveTextContent('$66,584')
    await userEvent.click(screen.getByRole('checkbox', { name: /2 x MFM50 Batteries/ }))
    expect(positions.at(-1)).toEqual({ fit: 'join_hf_pd:1284' })
    expect(bar).toHaveTextContent('The quote this starts · 5 lines')
    expect(bar).toHaveTextContent('$66,982')
    expect(bar).toHaveTextContent('at Cash, before the rigging kit')
  })
})

describe('change mode', () => {
  it('takes a motor off in its place, tags it, and Undo it gives the step back', async () => {
    render(<Chosen boat={PA600} changing />)
    expect(
      screen.getByRole('region', { name: 'Changing what Northside offers' }),
    ).toHaveTextContent('on the Highfield Patrol 600, on all 10 of its versions')
    const ledger = screen.getByRole('region', { name: 'The changes made here' })
    expect(ledger).toHaveTextContent('No change made here yet')
    await userEvent.click(
      screen.getByRole('button', { name: 'Take the Yamaha F150XC off the Patrol 600' }),
    )
    expect(screen.getByText('Taken off today')).toBeInTheDocument()
    expect(ledger).toHaveTextContent('1 change made here')
    await userEvent.click(within(ledger).getByRole('button', { name: 'Undo it' }))
    expect(
      screen.getByRole('button', { name: 'Take the Yamaha F150XC off the Patrol 600' }),
    ).toBeInTheDocument()
    /* what is so again, said as what is so (walk 2, F7), and no change counted as standing */
    expect(ledger).toHaveTextContent(
      'Undone: the Yamaha F150XC goes on the Highfield Patrol 600 again, on all 10 of its versions.',
    )
    expect(ledger).toHaveTextContent('No change stands')
  })

  it('offers only the motors the boat takes by its own figures to put on', () => {
    render(<Chosen boat={PA600} changing />)
    expect(screen.queryByRole('button', { name: /Yamaha F175LB/ })).toBeNull()
    expect(
      screen.getAllByRole('button', { name: /^Offer the Yamaha .+ on the Patrol 600$/ }),
    ).toHaveLength(14)
  })
})

describe('no boat chosen', () => {
  it('asks which boat, and a code finds it', async () => {
    draw({ boat: '' })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Which boat?')
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find a boat' }), 'HBS145{Enter}')
    expect(boats).toEqual([SP660])
  })

  /* NOT ONE FIELD ON AN EMPTY PAGE (built-critique-m3.md): before a word is typed, every maker
     on the price list, counted, and a maker opens its models and a model its versions */
  /* REWRITTEN 2026-11-03 (the fitment judge, blocker 1 and major 12): two questions, not three —
     the maker, then the model under its series with its own picture; a model opens on its first
     version, and the plate offers the others */
  it('offers every maker before a word is typed, and walks maker, then model under its series, to the boat', async () => {
    render(<Addressed />)
    /* one unit on one line (built-critique-m3.md, major 7): "289 models", never "289 boats"
       beside "67 models" */
    expect(screen.getByText('Or by maker · 289 models')).toBeInTheDocument()
    expect(screen.queryByText(/289 boats/)).toBeNull()
    for (const maker of ['Formosa', 'Highfield', 'Jeanneau', 'Stacer']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${maker}`) })).toBeInTheDocument()
    }
    /* ONE PRICE LIST, ONE SIZE (built-critique-m3-2.md, major 4): a maker counts its models as
       Home, Data and the picker do, in one unit — Highfield 67, Stacer 91 */
    expect(screen.getByRole('button', { name: /^Stacer 91 models$/ })).toBeInTheDocument()
    expect(screen.queryByText(/versions/)).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /^Highfield 67 models$/ }))
    expect(screen.getByText('Highfield · 67 models')).toBeInTheDocument()
    /* the maker is in the address, so a reload keeps it (walk.md, 2026-10-30) */
    expect(positions.at(-1)).toEqual({ maker: 'Highfield', model: '' })
    expect(screen.getByRole('button', { name: /^Highfield 67 models$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    /* the models under the series the price list files them in */
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent?.replace(/\d+$/, '')),
    ).toEqual(['Roll-Up', 'Ultralite', 'Classic', 'Coaster', 'Patrol', 'Sport', 'Adventure'])
    const classic = screen.getByRole('region', { name: 'Classic' })
    await userEvent.click(within(classic).getByRole('link', { name: /^Classic 340\s*9 versions/ }))
    expect(boats).toHaveLength(1)
    const highfield = pack.byKey('boat_highfield')
    expect(
      rowLabel(
        highfield,
        pack.rowsByEntity[highfield.id]!.find((r) => r.id === boats[0])!,
      ),
    ).toMatch(/^Highfield - CL340 /)
  })
})

/* built-critique-m3.md, major 7: a stakeholder pressing Fitment saw nothing of the plate until
   a boat was chosen, and every maker wore one generic glyph */
describe('the plate, asking', () => {
  it('stands the plate with the question as its name, each maker as its own mark', () => {
    draw({ boat: '' })
    const plate = screen.getByRole('region', { name: 'Which boat?' })
    expect(within(plate).getByRole('searchbox', { name: 'Find a boat' })).toBeInTheDocument()
    const makers = within(plate).getByRole('list', { name: 'Every maker on the price list' })
    expect(within(makers).getAllByRole('button')).toHaveLength(7)
    /* a mark the ledger holds is drawn; Stabicraft publishes white ink only, so it is type */
    expect(plate.querySelectorAll('.ft-mk__img').length).toBe(6)
    expect(within(makers).getByText('Stabicraft')).toBeInTheDocument()
    /* the three lines a boat answers, said and counting nothing */
    for (const word of ['Motor', 'Trailer', 'Fit-out']) {
      expect(within(plate).getByText(word)).toBeInTheDocument()
    }
    expect(within(plate).queryByText(/ of \d+ offered/)).toBeNull()
  })

  it('says a boat that is not on the price list on the plate itself', () => {
    draw({ boat: 'boat_highfield:no-such-line' })
    expect(
      within(screen.getByRole('region', { name: 'Which boat?' })).getByText(
        'That boat is not on the price list. Choose another.',
      ),
    ).toBeInTheDocument()
  })
})

/* THE COUNT IS THE BUILD'S (built-critique-m3.md, blocker 4): "a tiller boat must take a tiller
   motor" in force on the Classic 340. The F25SWTC is said with the rule's reason, never offered. */
describe('a motor the dealer’s rule refuses', () => {
  it('is left out of the choice and said once, as the rule’s reason', () => {
    const boatCols = pairColumns(pack.ctx, 'boat')
    const motorCols = pairColumns(pack.ctx, 'motor')
    catalogue.setState({
      constraintDefs: [
        pairRule({
          orgId: 'northside',
          boat: { column: boatCols.find((c) => c.name === 'steering')!, op: 'eq', value: 'Tiller' },
          partnerKind: 'motor',
          partner: {
            column: motorCols.find((c) => c.name === 'controls')!,
            op: 'eq',
            value: 'Tiller handle',
          },
          because: 'a tiller boat has no helm to steer a remote motor from',
          severity: 'block',
          enabled: true,
          now: '2026-10-22T09:00:00.000Z',
        }),
      ],
    })
    const highfield = pack.byKey('boat_highfield')
    const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
      (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
    )!
    draw({ boat: cl340.id })
    const motors = screen.getByRole('radiogroup', { name: 'The motor for the quote' })
    expect(within(motors).getAllByRole('radio')).toHaveLength(3)
    const motor = screen.getByRole('region', { name: 'Motor' })
    expect(motor.textContent).toContain(RULE_REFUSES)
    expect(screen.getByText(/1 of Northside’s rules is switched on/)).toBeInTheDocument()
  })
})

describe('a boat with no picture', () => {
  it('has no photograph, and its head closes to its words', () => {
    const highfield = pack.byKey('boat_highfield')
    const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
      (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
    )!
    const { container } = draw({ boat: cl340.id })
    expect(screen.queryByRole('img', { name: /^The Highfield Classic 340/ })).toBeNull()
    expect(container.querySelector('.fp-photo')).toBeNull()
  })
})
