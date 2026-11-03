import { useState } from 'react'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { ONE_TRAILER, RULE_REFUSES } from '@/domain/fitment/say'
import { makeCtx, rowLabel } from '@/domain/model'
import { readBoatFit } from '@/domain/fitment/boat'
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

  /* REWRITTEN 2026-11-03 (the fitment judge, blocker 2): a tile is the motor RIGGED — its figure,
     the rigging kit, prop and engine hole its pairing names, and the kit's price said not chosen */
  it('opens the motor line: the seven made for it rigged and priced, the recommended starred', () => {
    draw()
    const motor = screen.getByRole('region', { name: /^Motor/ })
    const tiles = within(within(motor).getByRole('list', { name: 'Made for it' })).getAllByRole(
      'listitem',
    )
    expect(tiles).toHaveLength(7)
    expect(tiles[0]).toHaveTextContent(/^F175XC\$25,355175 hp · 220 kg/)
    expect(tiles[0]).toHaveTextContent('Rigging kitMech Rigging Kit · 703 Side Mount')
    expect(tiles[0]).toHaveTextContent('Price not chosen')
    /* what all seven pairings name alike is said once above them, never seven times */
    expect(tiles[0]).not.toHaveTextContent('Engine hole')
    const every = within(motor).getByLabelText('What every one of them is rigged with')
    expect(every).toHaveTextContent('Engine holeNot yet known: the price list says TBA')
    expect(every).toHaveTextContent('PropPropeller - Reliance SDS M Series (F150 to F300)')
    expect(within(motor).getByRole('link', { name: 'Choose it on Prices' })).toHaveAttribute(
      'href',
      '/levels?list=rig_kits',
    )
    expect(within(tiles[0]!).getByLabelText('Recommended')).toBeInTheDocument()
    expect(within(motor).getByRole('button', { name: 'Show all 209, each with its reason' }))
  })

  /* REWRITTEN 2026-11-03 (the fitment judge, major 6 and minor 15): the shaft is a reason of its
     own, and the doors say what they open */
  it('gives the other 202 motors five counted reasons, each in the engine’s words', () => {
    draw()
    expect(screen.getByRole('heading', { name: 'The other 202, and why' })).toBeInTheDocument()
    for (const [n, because] of [
      ['74', 'Under the 150–200 hp this boat takes.'],
      ['51', 'Over the 150–200 hp this boat takes.'],
      [
        '10',
        'Inside the 150–200 hp this boat takes, but its shaft is not the extra-long (25″) this boat’s transom takes.',
      ],
      ['20', 'Inside the 150–200 hp this boat takes, and not made for it.'],
    ] as const) {
      expect(screen.getByText(because)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: `Show these ${n}: ${because}` }),
      ).toBeInTheDocument()
    }
    /* the door to what decides it: the boat's own horsepower, and the list of what fits it */
    const doors = screen.getAllByRole('link', { name: /Open the Highfield Sport 660’s line/ })
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
    /* the GFAB, 750 kg over its ATM, is offered but put on no quote (the fitment verifier) */
    expect(screen.getByText('Over its ATM, so not for a quote')).toBeInTheDocument()
  })

  it('refuses the GFAB, over its ATM, for the quote and the recommended, where it is pressed', async () => {
    draw({ line: 'trailer' })
    const before = positions.length
    await userEvent.click(screen.getByRole('button', { name: /^Put the GFAB .* on the quote/ }))
    expect(positions.length).toBe(before)
    /* said under the weighing that holds its figures, never the figures again (the verifier) */
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Not put on the quote: its ATM, weighed above, decides that.',
    )
    await userEvent.click(screen.getByRole('button', { name: /^Make the GFAB .* the recommended/ }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Not made the recommended trailer: its ATM, weighed above, decides that.',
    )
  })

  it('leaves the GFAB off the quote the plate starts, even asked for by its address, and says why', () => {
    const fit = readBoatFit(makeCtx({ ...pack.ctx, orgId: 'northside' }), {
      tableId: 'boat_highfield',
      rowId: SP660,
    })!
    const gfab = fit.trailer!.made.find((t) => !t.starred)!
    draw({ line: 'trailer', trailer: gfab.key })
    expect(screen.getByText(/so it is left off this quote\. Its ATM decides that\.$/)).toBeVisible()
    /* the quote the plate starts names no trailer, and the GFAB tile is not marked on it */
    expect(screen.getByText(/^This Highfield Sport 660 and the Yamaha F175XC/)).toBeVisible()
    expect(screen.queryByRole('button', { name: /^The GFAB .* is on the quote/ })).toBeNull()
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
