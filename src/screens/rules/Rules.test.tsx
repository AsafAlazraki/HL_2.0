/* ============================================================
   RULES, by role and text, on the real pack. What the screen says is
   read the way a person reads it; what it files is read back out of
   the store it filed it in.
   ============================================================ */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { catalogue } from '@/state/catalogue'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { engineWordsIn } from '@/screens/configurator/say'
import { Rules } from './Rules'

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
})

const F7_SAID =
  'When the boat’s steering is remote, the motor’s controls must not be Tiller handle.'

function draw(open = '') {
  const onOpen = vi.fn<(open: string) => void>()
  const openTheFile = vi.fn<() => void>()
  const view = render(<Rules open={open} onOpen={onOpen} openTheFile={openTheFile} />)
  return { onOpen, openTheFile, ...view }
}

describe('the first day', () => {
  it('opens on the price list’s own rule, and nothing is a rule until it is added', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1, name: 'Say what may be sold with what.' }))
    expect(screen.getByTestId('rule-from').textContent).toContain('From your price list')
    expect(screen.getByTestId('rule-sentence').textContent).toBe(F7_SAID)
    expect(screen.getByText(/^None yet\./)).toBeTruthy()
    expect(catalogue.getState().constraintDefs).toHaveLength(0)
  })

  it('counts what it would do before it is on, off the file', () => {
    draw()
    const census = within(screen.getByRole('region', { name: 'What it would do' }))
    /* the boats are the 289 models the picker and Home count, never the 810 lines behind them
       (built-critique-m3-2.md, major 4) */
    expect(census.getByText('of 289 boats it is about')).toBeTruthy()
    expect(census.getByText('of 241 motors it refuses on them')).toBeTruthy()
    expect(
      census.getByText('of 3,144 motors the price list makes for them, taken away'),
    ).toBeTruthy()
    expect(screen.getByTestId('rule-cost').textContent).toBe(
      'What it costs a sale todayNo sale. Nothing the price list makes for these boats breaks it; a search past the list finds 38 fewer motors.',
    )
  })

  it('draws the three owners, each counted once at its head', () => {
    draw()
    const owned = within(screen.getByRole('region', { name: 'The rules' }))
    expect(owned.getByRole('heading', { name: /^Yours\s*0$/ })).toBeTruthy()
    expect(owned.getByRole('heading', { name: /^Stated in your price list\s*7$/ })).toBeTruthy()
    expect(owned.getByRole('heading', { name: /^Noticed in your price list\s*3$/ })).toBeTruthy()
    /* the measure is the ledger's own, numerator and denominator */
    expect(owned.getByLabelText('Holds on 581 of 581')).toBeTruthy()
    expect(owned.getByRole('button', { name: 'Say it as yours' })).toBeTruthy()
  })

  it('says nothing in the engine’s words', () => {
    const { container } = draw()
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })
})

describe('writing one', () => {
  it('files the sentence as a rule that refuses, opens it, and lists it with what it reaches', async () => {
    const user = userEvent.setup()
    const { onOpen, rerender, openTheFile } = draw()
    await user.click(screen.getByRole('button', { name: 'Add it, refusing' }))

    const filed = catalogue.getState().constraintDefs
    expect(filed).toHaveLength(1)
    expect(filed[0]!.severity).toBe('block')
    expect(filed[0]!.enabled).toBe(true)
    expect(filed[0]!.because).toBe(
      'the hull is set up for a remote helm, and a tiller motor is steered from the engine',
    )
    expect(onOpen).toHaveBeenLastCalledWith(filed[0]!.id)

    rerender(<Rules open={filed[0]!.id} onOpen={onOpen} openTheFile={openTheFile} />)
    const mine = within(screen.getByTestId('your-rules'))
    expect(mine.getByRole('button', { name: new RegExp(`^${F7_SAID}`) })).toBeTruthy()
    expect(mine.getByText('Costs no sale: it refuses only past the price list.')).toBeTruthy()
    expect(screen.getByTestId('rule-from').textContent).toMatch(/^Your rule, written/)
    /* the price list's noticed rule is now said in Northside's own words */
    expect(screen.getByText('Yours now')).toBeTruthy()
  })

  it('switched off, it keeps its full sentence and says what it would do', async () => {
    const user = userEvent.setup()
    const { onOpen, rerender, openTheFile } = draw()
    await user.click(screen.getByRole('button', { name: 'Add it, refusing' }))
    const id = catalogue.getState().constraintDefs[0]!.id
    rerender(<Rules open={id} onOpen={onOpen} openTheFile={openTheFile} />)

    await user.click(within(screen.getByTestId('your-rules')).getByRole('switch', { name: 'On' }))
    expect(catalogue.getState().constraintDefs[0]!.enabled).toBe(false)
    const mine = within(screen.getByTestId('your-rules'))
    expect(mine.getByRole('button', { name: new RegExp(`^${F7_SAID}`) })).toBeTruthy()
    expect(mine.getByText('Switched on, it would cost no sale.')).toBeTruthy()
    /* the switch says what it is, and so does the plate: off, said once, never "On" beside it */
    const sw = mine.getByRole('switch', { name: 'Off' })
    expect(sw.getAttribute('aria-checked')).toBe('false')
    expect((screen.getByRole('radio', { name: 'off' }) as HTMLInputElement).checked).toBe(true)
    expect(screen.getByTestId('rule-cost').textContent).toMatch(/Nothing today: it is off\./)
  })

  it('refuses, warns and off act at once on a written rule, like its switch', async () => {
    const user = userEvent.setup()
    const { onOpen, rerender, openTheFile } = draw()
    await user.click(screen.getByRole('button', { name: 'Add it, refusing' }))
    const id = catalogue.getState().constraintDefs[0]!.id
    rerender(<Rules open={id} onOpen={onOpen} openTheFile={openTheFile} />)

    await user.click(screen.getByRole('radio', { name: 'warns' }))
    expect(catalogue.getState().constraintDefs[0]!).toMatchObject({
      enabled: true,
      severity: 'warn',
    })
    /* nothing waits to be kept: what it does is not a change of words */
    expect(screen.queryByRole('button', { name: 'Keep the change' })).toBeNull()
    await user.click(screen.getByRole('radio', { name: 'off' }))
    expect(catalogue.getState().constraintDefs[0]!.enabled).toBe(false)
    expect(
      within(screen.getByTestId('your-rules')).getByRole('switch', { name: 'Off' }),
    ).toBeTruthy()
  })

  it('words written and not kept are still on the plate after leaving and coming back', async () => {
    const user = userEvent.setup()
    const { onOpen, rerender, openTheFile, unmount } = draw()
    await user.click(screen.getByRole('button', { name: 'Add it, refusing' }))
    const id = catalogue.getState().constraintDefs[0]!.id
    rerender(<Rules open={id} onOpen={onOpen} openTheFile={openTheFile} />)
    const because = screen.getByRole('textbox', { name: 'Because' })
    await user.clear(because)
    await user.type(because, 'a remote hull has no tiller to reach')
    expect(screen.getByRole('button', { name: 'Keep the change' })).toBeTruthy()
    unmount()

    draw(id)
    expect((screen.getByRole('textbox', { name: 'Because' }) as HTMLTextAreaElement).value).toBe(
      'a remote hull has no tiller to reach',
    )
    await user.click(screen.getByRole('button', { name: 'Keep the change' }))
    expect(catalogue.getState().constraintDefs[0]!.because).toBe(
      'a remote hull has no tiller to reach',
    )
  })

  it('a new sentence says what is still to choose, and the act adds nothing', async () => {
    const user = userEvent.setup()
    draw('new')
    expect(screen.getByTestId('rule-sentence').textContent).toBe(
      'When the boat’s spec is …, the motor’s spec must be ….',
    )
    expect(screen.getByText('Choose which of the boat’s specs this rule looks at.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Add it, refusing/ }))
    expect(catalogue.getState().constraintDefs).toHaveLength(0)
  })
})

describe('without the price list', () => {
  it('says the price list is not here, and offers the one way to load it', async () => {
    await catalogue.getState().load({ entities: [], rowsByEntity: {} })
    const user = userEvent.setup()
    const { openTheFile } = draw()
    await user.click(screen.getByRole('button', { name: 'Load the Master Price File' }))
    expect(openTheFile).toHaveBeenCalledTimes(1)
  })
})
