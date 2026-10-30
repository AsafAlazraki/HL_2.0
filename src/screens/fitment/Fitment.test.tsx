import { useState } from 'react'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { ONE_TRAILER, RULE_REFUSES } from '@/domain/fitment/say'
import { rowLabel } from '@/domain/model'
import { pairColumns, pairRule } from '@/domain/rules/constraints/pairRules'
import { Fitment, type FitmentPosition } from './Fitment'
import { sheetHref } from './sheet'

/* ============================================================
   FITMENT, BY ROLE AND TEXT, OVER THE REAL PRICE LIST.

   The screen writes no reason of its own: every sentence asserted below
   is either a count read off the file or the domain's own words
   (`@/domain/fitment/say`), and the test finds them where a dealer
   would, by role and by the words on the screen.
   ============================================================ */

const SP660 = 'boat_highfield:513'
let pack: PackFixture
let positions: FitmentPosition[] = []
let opened: string[] = []
let boats: string[] = []

beforeAll(async () => {
  pack = await loadPack()
})

beforeEach(async () => {
  positions = []
  opened = []
  boats = []
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
      boat={SP660}
      line=""
      all=""
      only=""
      find=""
      onPosition={(p) => positions.push(p)}
      openBoat={(id) => boats.push(id)}
      sheetHref={sheetHref}
      openSheet={(o) => opened.push(sheetHref(o))}
      openRules={() => opened.push('/rules')}
      openTheFile={() => {}}
      {...over}
    />,
  )

/** THE CHOOSER'S POSITION KEPT THE WAY THE ROUTE KEEPS IT (`?maker=&model=`), so a press on a
 *  maker or a model is read back as the address would hand it in (walk.md, 2026-10-30) */
function Addressed() {
  const [at, setAt] = useState<{ maker: string; model: string }>({ maker: '', model: '' })
  return (
    <Fitment
      boat=""
      maker={at.maker}
      model={at.model}
      line=""
      all=""
      only=""
      find=""
      onPosition={(p) => {
        positions.push(p)
        if (p.maker !== undefined || p.model !== undefined)
          setAt({ maker: p.maker ?? '', model: p.model ?? '' })
      }}
      openBoat={(id) => boats.push(id)}
      sheetHref={sheetHref}
      openSheet={(o) => opened.push(sheetHref(o))}
      openRules={() => opened.push('/rules')}
      openTheFile={() => {}}
    />
  )
}

describe('one boat, at rest', () => {
  it('names the boat on its plate, and its three lines are the boat’s own facts', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Highfield Sport 660')
    const lines = within(screen.getByRole('list', { name: /What the Highfield Sport 660 takes/ }))
    const pressed = lines.getAllByRole('button').map((b) => b.getAttribute('aria-pressed'))
    expect(pressed).toEqual(['true', 'false', 'false'])
    expect(lines.getByRole('button', { name: /^Motor 150–200 hp one motor/ })).toHaveTextContent(
      '7 of 209 offered',
    )
    expect(lines.getByRole('button', { name: /^Trailer built for Highfield/ })).toHaveTextContent(
      '2 of 434 offered · one on a new quote',
    )
    /* not one word of the price list's own columns or cells on the plate */
    const plate = screen.getByRole('region', { name: 'Highfield Sport 660' })
    expect(plate.textContent).not.toMatch(/Min HP|Max HP|Boat Module|Boat Weight|series/)
  })

  it('opens the motor line: the seven made for it as priced tiles, the recommended starred', () => {
    draw()
    const motor = screen.getByRole('region', { name: /^Motor/ })
    const tiles = within(within(motor).getByRole('list', { name: 'Made for it' })).getAllByRole(
      'listitem',
    )
    expect(tiles).toHaveLength(7)
    expect(tiles[0]).toHaveTextContent('F175XC175 hp$25,355')
    expect(within(tiles[0]!).getByLabelText('Recommended')).toBeInTheDocument()
    expect(within(motor).getByRole('button', { name: 'Show all 209, each with its reason' }))
  })

  it('gives the other 202 motors four counted reasons, each in the engine’s words', () => {
    draw()
    expect(screen.getByRole('heading', { name: 'The other 202, and why' })).toBeInTheDocument()
    for (const [n, because] of [
      ['74', 'Under the 150–200 hp this boat takes.'],
      ['51', 'Over the 150–200 hp this boat takes.'],
      ['30', 'Inside the 150–200 hp this boat takes, and not made for it.'],
    ] as const) {
      expect(screen.getByText(because)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: `Show these ${n}: ${because}` }),
      ).toBeInTheDocument()
    }
    /* the door to what decides it: the boat's own horsepower, and the list of what fits it */
    const doors = screen.getAllByRole('link', { name: /Open the Highfield Sport 660’s horsepower/ })
    expect(doors[0]!.getAttribute('href')).toBe('/data/boat_highfield?at=boat_highfield%3A513')
    expect(
      screen.getByRole('link', { name: /Open the list of what fits the Highfield Sport 660/ }),
    ).toHaveAttribute('href', expect.stringMatching(/^\/data\/join_hf_yam\?find=/))
  })

  it('presses a reason’s Show these, and opens its group of the whole list', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: /^Show these 51:/ }))
    expect(positions.at(-1)).toMatchObject({ all: 'motor', only: 'over' })
  })

  it('opens the trailer line: each ATM against the boat, its motor and the trailer itself', async () => {
    draw()
    await userEvent.click(screen.getByRole('button', { name: /^Trailer built for Highfield/ }))
    expect(positions.at(-1)).toEqual({ line: 'trailer' })
  })
})

describe('the trailer line', () => {
  it('says what goes on the trailer, never the bare hull, and the one-trailer rule once', () => {
    draw({ line: 'trailer' })
    expect(
      screen.getByText(
        'The Highfield Sport 660, 740 kg, and its F175XC, 220 kg: 960 kg on the trailer, before fuel and gear.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/1,340 kg on the road: 650 kg to spare\.$/)).toBeInTheDocument()
    expect(screen.getByText(/2,950 kg on the road: 750 kg over it\.$/)).toBeInTheDocument()
    expect(screen.queryByText(/clears it by/)).toBeNull()
    expect(screen.getAllByText(ONE_TRAILER)).toHaveLength(1)
    expect(screen.getByText('On a new quote')).toBeInTheDocument()
    expect(screen.getByText('Offered in its place')).toBeInTheDocument()
  })

  it('gives the other 432 trailers three counted reasons, the makers counted under one', () => {
    draw({ line: 'trailer' })
    expect(screen.getByRole('heading', { name: 'The other 432, and why' })).toBeInTheDocument()
    /* six makers: Cap Camarat and Merry Fisher are Jeanneau's ranges (built-critique-m3.md) */
    expect(screen.getByText('Built for another boat, across 6 makers.')).toBeInTheDocument()
    expect(screen.getByText(/Haines 16 · Jeanneau 9$/)).toBeInTheDocument()
    expect(screen.queryByText(/Cap Camarat \d/)).toBeNull()
    expect(screen.getByText(/^10 more are no longer sold/)).toBeInTheDocument()
  })

  /* built-critique-m3.md, major 5: a strike means refused, and the 291 whose series names no
     boat maker are "not ruled out" — their example is said plainly, the other two struck */
  it('strikes an example only where its reason holds it off the boat', () => {
    const { container } = draw({ line: 'trailer' })
    const rows = [...container.querySelectorAll('.ft-reason')]
    const of = (words: RegExp) => rows.find((r) => words.test(r.textContent ?? ''))!
    expect(of(/not ruled out/).querySelector('.ft-struck')).toBeNull()
    expect(of(/not ruled out/).textContent).toMatch(/Such as DUNBIER Alloy Centre Line/)
    expect(of(/but not made for the Sport 660/).querySelector('.ft-struck')).not.toBeNull()
    expect(of(/Built for another boat/).querySelector('.ft-struck')).not.toBeNull()
  })

  /* built-critique-m3.md, minor: an inflatable with no trailer made for it was handed the
     434-trailer census and a load for a trailer it never goes on */
  it('says once that no trailer is made for a boat, and leaves the census to Show all', () => {
    const highfield = pack.byKey('boat_highfield')
    const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
      (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
    )!
    draw({ boat: cl340.id, line: 'trailer' })
    expect(
      screen.getByText('No trailer on the price list is made for the Highfield Classic 340.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /^The other \d+, and why$/ })).toBeNull()
    expect(screen.queryByText(/on the trailer, before fuel and gear/)).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Show all 434, each with its reason' }),
    ).toBeInTheDocument()
  })
})

describe('show all', () => {
  it('opens on one reason’s group, named and counted, with Show all past it', async () => {
    draw({ all: 'trailer', only: 'another' })
    expect(screen.getByText('131 of 434')).toBeInTheDocument()
    const grid = screen.getByRole('grid', { name: /Trailers, every one, grouped by why/ })
    const heads = within(grid)
      .getAllByRole('columnheader')
      .map((h) => h.textContent ?? '')
    expect(heads).toHaveLength(6)
    expect(heads.every((h) => h.includes('not Highfield'))).toBe(true)
    await userEvent.click(screen.getByRole('button', { name: 'Show all 434' }))
    expect(positions.at(-1)).toEqual({ only: '' })
  })

  it('draws the trailers grouped by why, on one tab stop, and opens the line it is on', async () => {
    draw({ all: 'trailer' })
    const grid = screen.getByRole('grid', { name: /Trailers, every one, grouped by why/ })
    const heads = within(grid)
      .getAllByRole('columnheader')
      .map((h) => h.textContent ?? '')
    expect(heads[0]).toContain('Offered on this boat.')
    expect(heads.some((h) => h.includes('Built for Stacer, not Highfield.'))).toBe(true)
    grid.focus()
    await userEvent.keyboard('{Enter}')
    expect(opened.at(-1)).toMatch(/^\/data\/join_hf_(trl|gfab)\?at=/)
  })

  it('finds a trailer not made for the boat by its words', async () => {
    draw({ all: 'trailer' })
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find in Trailers' }), 'TALS650S13')
    expect(screen.getByRole('status')).toHaveTextContent('1 of 434 carries those words.')
  })

  /* built-critique-m3.md, major 6: "Show these 74" was seventy-four struck names under a head
     that already said why. Inside a named group the head is the reason; nothing is struck. */
  it('opens one reason’s group as a list to read, its head the reason and nothing struck', () => {
    const { container } = draw({ all: 'motor', only: 'under' })
    const grid = screen.getByRole('grid', { name: /Yamaha Outboards, every one, grouped by why/ })
    expect(within(grid).getAllByRole('columnheader')[0]).toHaveTextContent(
      'Under the 150–200 hp this boat takes.',
    )
    expect(within(grid).getAllByRole('row').length).toBeGreaterThan(70)
    expect(container.querySelector('.ft-line[data-struck], .ft-whole .ft-struck')).toBeNull()
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
  it('offers every maker before a word is typed, and walks maker, model, version to the boat', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: /^Classic 340\s*\d+ versions/ }))
    expect(screen.getByRole('button', { name: /Every Highfield model/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: /^PVC · White \/ White \/ Wood Dark/ }))
    expect(boats).toHaveLength(1)
    const highfield = pack.byKey('boat_highfield')
    expect(
      rowLabel(
        highfield,
        pack.rowsByEntity[highfield.id]!.find((r) => r.id === boats[0])!,
      ),
    ).toBe('Highfield - CL340 (PVC) W-W-WD')
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
    for (const word of ['Motor', 'Trailer', 'Also made for it']) {
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

describe('a boat with no picture', () => {
  it('has no window on its plate, and its name takes the plate’s width', async () => {
    const highfield = pack.byKey('boat_highfield')
    const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
      (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
    )!
    const { container } = draw({ boat: cl340.id, line: 'also' })
    expect(screen.queryByText(/No photograph/)).toBeNull()
    expect(screen.queryByRole('img', { name: /^The Highfield Classic 340/ })).toBeNull()
    expect(container.querySelector('.ft-window')).toBeNull()
    /* the dealer's own fit-out first and the parts after it, on every load */
    const heads = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent ?? '')
    expect(heads.findIndex((h) => h.includes('Dealer Fit Packages'))).toBeLessThan(
      heads.findIndex((h) => h.includes('Parts & Accessories')),
    )
  })
})

/* THE COUNT IS THE BUILD'S (built-critique-m3.md, blocker 4): "a tiller boat must take a tiller
   motor" in force on the Classic 340, whose price list makes three Yamahas for it. The F25SWTC is
   struck with the rule's because, and the motor's count is the two the build offers. */
describe('a motor the dealer’s rule refuses', () => {
  const drawRuled = () => {
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
    return draw({ boat: cl340.id })
  }

  it('is said once, as the rule’s reason with its own because, and not counted as made for it', () => {
    drawRuled()
    const lines = within(screen.getByRole('list', { name: /What the Highfield Classic 340 takes/ }))
    expect(lines.getByRole('button', { name: /^Motor/ })).toHaveTextContent('2 of 209 offered')
    const motor = screen.getByRole('region', { name: /^Motor/ })
    const tiles = within(within(motor).getByRole('list', { name: 'Made for it' })).getAllByRole(
      'listitem',
    )
    expect(tiles).toHaveLength(2)
    expect(motor.textContent).toContain(RULE_REFUSES)
    expect(
      within(motor).getByText(/a tiller boat has no helm to steer a remote motor from/),
    ).toBeInTheDocument()
    expect(within(motor).getAllByText('Yamaha F25SWTC')).toHaveLength(1)
    expect(within(motor).getByRole('link', { name: 'Open your rules' })).toHaveAttribute(
      'href',
      '/rules',
    )
  })

  it('opens the whole list on the two, with the refused one apart under its reason', () => {
    const highfield = pack.byKey('boat_highfield')
    const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
      (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
    )!
    drawRuled().unmount()
    draw({ boat: cl340.id, all: 'motor' })
    expect(screen.getByText('2 of 209 offered on this boat')).toBeInTheDocument()
    expect(screen.getByText(RULE_REFUSES)).toBeInTheDocument()
  })
})

/* THE PLATE CHANGES WHAT GOES ON THE BOAT (the flow round, 2026-10-30; exposure.md, blocker):
   a motor made for it is taken off from its own tile, and one not made for it is put on from
   Show all, each one catalogue step with its Undo */
describe('changing what goes on the boat', () => {
  it('takes a motor off from its tile, and puts one on from the whole list', async () => {
    const { unmount } = draw()
    const made = within(screen.getByRole('list', { name: 'Made for it' }))
    const before = made.getAllByRole('listitem').length
    const off = made.getAllByRole('button', {
      name: /^Take the .* off what goes on the Highfield Sport 660$/,
    })
    await userEvent.click(off[0]!)
    expect(
      within(screen.getByRole('list', { name: 'Made for it' })).getAllByRole('listitem'),
    ).toHaveLength(before - 1)
    unmount()

    draw({ all: 'motor', only: 'inside' })
    const on = screen.getAllByRole('button', { name: /^Put the .* on the Highfield Sport 660$/ })
    expect(on.length).toBeGreaterThan(0)
    await userEvent.click(on[0]!)
    /* the line leaves this reason's group: it is offered on the boat now */
    expect(
      screen.queryAllByRole('button', { name: /^Put the .* on the Highfield Sport 660$/ }),
    ).toHaveLength(on.length - 1)
  })

  it('says why a motor over the horsepower is not put on, on that line', async () => {
    draw({ all: 'motor', only: 'over' })
    const on = screen.getAllByRole('button', { name: /^Put the .* on the Highfield Sport 660$/ })
    await userEvent.click(on[0]!)
    expect(screen.getByRole('alert')).toHaveTextContent(/is over the .* so it is not put on/)
  })
})
