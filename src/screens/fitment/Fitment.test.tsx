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
      all=""
      find=""
      at=""
      onPosition={(p) => positions.push(p)}
      openBoat={(id) => boats.push(id)}
      sheetHref={sheetHref}
      openSheet={(o) => opened.push(sheetHref(o))}
      openTheFile={() => {}}
      {...over}
    />,
  )

describe('one boat, at rest', () => {
  it('names the boat and stars the motor the price list recommends', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Highfield Sport 660')
    expect(screen.getByText('Yamaha F175XC', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('Takes')).toBeInTheDocument()
  })

  it('counts each place against its whole list, with the way past the narrowing', () => {
    draw()
    for (const total of ['209', '434', '1,576', '2,238']) {
      expect(screen.getByRole('button', { name: `Show all ${total}` })).toBeInTheDocument()
    }
  })

  it('gives the other 432 trailers three counted reasons, each with a struck example', () => {
    draw()
    expect(screen.getByText('The other 432, and why each is not offered')).toBeInTheDocument()
    /* six makers: Cap Camarat and Merry Fisher are Jeanneau's ranges (built-critique-m3.md) */
    expect(screen.getByText('Built for another boat, across 6 makers.')).toBeInTheDocument()
    expect(screen.getByText(/Haines 16 · Jeanneau 9$/)).toBeInTheDocument()
    expect(screen.queryByText(/Cap Camarat \d/)).toBeNull()
    expect(screen.getByText(/Stacer 34 · Stabicraft 26/)).toBeInTheDocument()
    expect(screen.getByText(/^10 more are no longer sold/)).toBeInTheDocument()
    expect(screen.getAllByText(ONE_TRAILER)).toHaveLength(1)
  })

  it('opens a motor’s note with the engine’s reason when its dot is pressed', async () => {
    draw()
    const dot = screen.getByRole('button', { name: /^Yamaha F150XC, 150 hp, in its range/ })
    await userEvent.click(dot)
    expect(positions.at(-1)?.at).toBeTruthy()
  })

  it('says the reason on the note, from the domain', () => {
    draw({ at: 'mot_yamaha:72' })
    expect(
      screen.getByText('Not made for this boat, though it is inside the 150–200 hp it takes.'),
    ).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /See what fits on the price list/ })
    expect(link.getAttribute('href')).toMatch(/^\/data\/join_hf_yam\?find=/)
  })
})

describe('show all', () => {
  it('draws the trailers grouped by why, on one tab stop, and opens the line it is on', async () => {
    draw({ all: 'trailer' })
    const grid = screen.getByRole('grid', { name: /Trailers, every one, grouped by why/ })
    const heads = within(grid)
      .getAllByRole('columnheader')
      .map((h) => h.textContent ?? '')
    expect(heads[0]).toContain('Made for this boat.')
    expect(heads.some((h) => h.includes('Built for Stacer, not Highfield.'))).toBe(true)
    grid.focus()
    await userEvent.keyboard('{Enter}')
    expect(opened.at(-1)).toMatch(/^\/data\/join_hf_(trl|gfab)\?at=/)
  })

  it('finds a struck trailer by its words', async () => {
    draw({ all: 'trailer' })
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find in Trailers' }), 'TALS650S13')
    expect(screen.getByRole('status')).toHaveTextContent('1 of 434 carries those words.')
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
    draw({ boat: '' })
    expect(
      screen.getByText('Every boat on the price list, by maker · 289 boats'),
    ).toBeInTheDocument()
    for (const maker of ['Formosa', 'Highfield', 'Jeanneau', 'Stacer']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${maker}`) })).toBeInTheDocument()
    }
    /* ONE PRICE LIST, ONE SIZE (built-critique-m3-2.md, major 4): a maker counts its models as
       Home, Data and the picker do, in one unit — Highfield 67, Stacer 91 */
    expect(screen.getByRole('button', { name: /^Stacer 91 models$/ })).toBeInTheDocument()
    expect(screen.queryByText(/versions/)).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /^Highfield 67 models$/ }))
    expect(screen.getByText('Highfield · 67 models')).toBeInTheDocument()
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

describe('a boat with no photograph', () => {
  it('draws no ring round nothing: no stage, no discs, the callouts still numbered', () => {
    const highfield = pack.byKey('boat_highfield')
    const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
      (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
    )!
    const { container } = draw({ boat: cl340.id })
    expect(screen.queryByText(/No photograph/)).toBeNull()
    expect(screen.queryByRole('img', { name: /^The Highfield Classic 340/ })).toBeNull()
    expect(container.querySelector('[data-photo="none"]')).not.toBeNull()
    expect(container.querySelectorAll('.ft-pin')).toHaveLength(0)
    /* the dealer's own fit-out is 3 and the parts 4, on every load */
    const heads = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '')
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

  it('is struck with the rule’s because, and is not counted as made for this boat', () => {
    drawRuled()
    const motor = screen.getByRole('region', { name: 'Motor' })
    expect(within(motor).getByText('Yamaha F25SWTC')).toBeInTheDocument()
    expect(
      within(motor).getByText('a tiller boat has no helm to steer a remote motor from'),
    ).toBeInTheDocument()
    expect(within(motor).getByText('2 of 209')).toBeInTheDocument()
    expect(within(motor).queryByText('3 of 209')).toBeNull()
    expect(within(motor).getByText('2 made for this boat')).toBeInTheDocument()
    expect(within(motor).getByText('1 refused by your rule')).toBeInTheDocument()
  })

  it('opens the whole list on the two, with the refused one apart under its reason', () => {
    const highfield = pack.byKey('boat_highfield')
    const cl340 = (pack.rowsByEntity[highfield.id] ?? []).find(
      (r) => rowLabel(highfield, r) === 'Highfield - CL340 (PVC) W-W-WD',
    )!
    drawRuled().unmount()
    draw({ boat: cl340.id, all: 'motor' })
    expect(screen.getByText('2 of 209 made for this boat')).toBeInTheDocument()
    expect(screen.getByText(RULE_REFUSES)).toBeInTheDocument()
  })
})
