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
const TILLER_SAID =
  'When the boat’s steering is tiller, the motor’s controls must be Tiller handle.'
const BECAUSE = 'a tiller boat has no helm to steer a remote motor from'

function draw(open = '') {
  const onOpen = vi.fn<(open: string) => void>()
  const openTheFile = vi.fn<() => void>()
  const view = render(<Rules open={open} onOpen={onOpen} openTheFile={openTheFile} />)
  const again = (next: string) =>
    view.rerender(<Rules open={next} onOpen={onOpen} openTheFile={openTheFile} />)
  return { onOpen, openTheFile, again, ...view }
}

const part = (name: RegExp) => within(screen.getByRole('region', { name }))

async function choose(user: ReturnType<typeof userEvent.setup>, word: string, choice: RegExp) {
  await user.click(screen.getByRole('combobox', { name: word }))
  await user.click(await screen.findByRole('option', { name: choice }))
}

/** Write the tiller rule in the Motors part, as a person does. */
async function writeTiller(user: ReturnType<typeof userEvent.setup>) {
  await choose(user, 'Which of the boat’s specs', /^steering$/)
  await choose(user, 'The boat’s steering', /^tiller\b/)
  await choose(user, 'Which of the motor’s specs', /^controls$/)
  await choose(user, 'The motor’s controls', /^Tiller handle\b/)
  /* words written and not kept are held for the visit, so a clause may open with a because */
  const because = screen.getByRole('textbox', { name: 'Because' })
  await user.clear(because)
  await user.type(because, BECAUSE)
}

describe('the first day', () => {
  it('reads as the house rules, by what the customer is buying, with nothing open', () => {
    draw()
    expect(screen.getByRole('heading', { level: 1, name: 'What may be sold with what' }))
    expect(screen.getByRole('heading', { level: 2, name: /Trailers/ })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: /Motors/ })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: /Rigging and pre-delivery/ })).toBeTruthy()
    expect(screen.getByText(/Northside has written none yet\./)).toBeTruthy()
    expect(screen.queryByTestId('open-rule')).toBeNull()
    expect(catalogue.getState().constraintDefs).toHaveLength(0)
  })

  it('numbers the price list’s seven clauses, each with its measure off the file', () => {
    draw()
    expect(screen.getAllByTestId('stated-rule')).toHaveLength(7)
    const trailers = part(/Trailers/)
    expect(trailers.getByText('1.1')).toBeTruthy()
    expect(
      trailers.getByLabelText(
        'Holds on 581 of 581 trailer offers on today’s boats whose series names a boat maker',
      ),
    ).toBeTruthy()
    /* A CLAUSE THAT IS NEVER REFUSED IS MEASURED ON WHAT IT SAYS: how many sit under it, never
       how many hold, which read as the rest refused (built-critique-m3.md, major 4) */
    expect(
      trailers.getByLabelText(
        '0 of 530 trailer offers on today’s boats that state both weights are rated under the boat',
      ),
    ).toBeTruthy()
    expect(
      part(/Motors/).getByLabelText(
        '72 of 757 standard motor offers on today’s boats sit under it, on purpose',
      ),
    ).toBeTruthy()
    expect(screen.queryByLabelText(/685 of 757/)).toBeNull()
    /* the parts count what is on sale, as every screen counts it */
    expect(trailers.getByText('434 on sale')).toBeTruthy()
    expect(part(/Motors/).getByText('241 on sale')).toBeTruthy()
  })

  it('boxes what the price list was noticed doing, beside its part, and never as a rule', () => {
    draw()
    const noticed = screen.getAllByTestId('noticed')
    expect(noticed).toHaveLength(3)
    const motors = part(/Motors/)
    const f7 = within(motors.getByTestId('noticed'))
    expect(f7.getByText('A boat steered from a remote helm is never given a tiller motor.'))
    expect(
      f7.getByText(
        'It holds on 7,830 of 7,830 motor offers on a remote boat, discontinued boats included. Nobody wrote it down, so the build does nothing with it.',
      ),
    ).toBeTruthy()
    expect(f7.getByRole('button', { name: 'Say it as Northside’s' })).toBeTruthy()
    expect(f7.getByText('It opens as 2.4, to read before it is added.')).toBeTruthy()
  })

  it('offers a rule to write in the parts a sentence can write, and says why not in the third', () => {
    const { onOpen } = draw()
    expect(part(/Trailers/).getByRole('button', { name: 'Write a rule about trailers' }))
    expect(part(/Motors/).getByRole('button', { name: 'Write a rule about motors' }))
    expect(part(/Rigging/).queryByRole('button', { name: /Write a rule/ })).toBeNull()
    expect(
      part(/Rigging/).getByText(
        'A rule here is written about a motor or a trailer, so this part is your price list’s alone.',
      ),
    ).toBeTruthy()
    screen.getByRole('button', { name: 'Write a rule about motors' }).click()
    expect(onOpen).toHaveBeenLastCalledWith('new:motor')
  })

  it('says nothing in the engine’s words', () => {
    const { container } = draw()
    expect(engineWordsIn(container.textContent ?? '')).toEqual([])
  })
})

describe('writing one', () => {
  it('opens a new clause as 2.4, counted before it is added, and the act says what is missing', async () => {
    const user = userEvent.setup()
    draw('new:motor')
    const open = within(screen.getByTestId('open-rule'))
    expect(open.getByText('2.4')).toBeTruthy()
    expect(screen.getByTestId('rule-sentence').textContent).toBe(
      'When the boat’s spec is …, the motor’s spec must be ….',
    )
    expect(screen.getByText('Choose which of the boat’s specs this rule looks at.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Add it as 2.4' }))
    expect(catalogue.getState().constraintDefs).toHaveLength(0)
  })

  it('counts the tiller rule off the file, draws its boats, and names the sale it costs', async () => {
    const user = userEvent.setup()
    draw('new:motor')
    await writeTiller(user)
    expect(screen.getByTestId('rule-sentence').textContent).toBe(TILLER_SAID)
    const census = within(screen.getByRole('region', { name: 'Counted now, before it is added' }))
    expect(census.getByText('models it is about')).toBeTruthy()
    expect(census.getByText('offers your price list makes for them, taken away')).toBeTruthy()
    expect(
      census.getByText(
        'motors it refuses on them; the 32 ePropulsion carry no controls, so it says nothing of them',
      ),
    ).toBeTruthy()
    /* one line of marks a maker, every model the picker counts */
    expect(census.getAllByTestId('field-maker')).toHaveLength(7)
    expect(census.getByText('29 of 67')).toBeTruthy()
    expect(screen.getByTestId('rule-cost').textContent).toBe(
      'The Classic 340, 360, 380, 360 LS and 380 LS lose the Yamaha F25SWTC.',
    )
    expect(
      census.getByText('From the next pick. No draft is standing today, so none waits on it.'),
    ).toBeTruthy()
  })

  it('adds a refusing rule as 2.4 in one press, and it stands as Northside’s clause', async () => {
    const user = userEvent.setup()
    const { onOpen, again } = draw('new:motor')
    await writeTiller(user)
    await user.click(screen.getByRole('button', { name: 'Add it as 2.4' }))

    const filed = catalogue.getState().constraintDefs
    expect(filed).toHaveLength(1)
    expect(filed[0]!).toMatchObject({ severity: 'block', enabled: true, because: BECAUSE })
    expect(onOpen).toHaveBeenLastCalledWith('')

    again('')
    const mine = within(screen.getByTestId('your-rule'))
    expect(mine.getByText('2.4')).toBeTruthy()
    expect(mine.getByText(TILLER_SAID)).toBeTruthy()
    expect(mine.getByRole('combobox', { name: 'What 2.4 does' }).textContent).toBe('refuses')
    expect(
      mine.getByLabelText('45 of 540 offers your price list makes for them, taken away'),
    ).toBeTruthy()
    expect(screen.getByText(/Northside has written 1\./)).toBeTruthy()
    /* the next new one is 2.5 */
    expect(screen.getByText('It opens as 2.5, to read before it is added.')).toBeTruthy()
  })

  it('switched off in its own sentence, it reads kept and not enforced, at full ink', async () => {
    const user = userEvent.setup()
    const { again } = draw('new:motor')
    await writeTiller(user)
    await user.click(screen.getByRole('button', { name: 'Add it as 2.4' }))
    again('')

    await choose(user, 'What 2.4 does', /^is off/)
    expect(catalogue.getState().constraintDefs[0]!.enabled).toBe(false)
    const mine = screen.getByTestId('your-rule')
    expect(mine.getAttribute('data-does')).toBe('off')
    expect(mine.textContent).toContain(
      'This rule is off — kept, not enforced. Switched on, the build would refuse the motor, because a tiller boat has no helm to steer a remote motor from.',
    )
    expect(within(mine).getByRole('combobox', { name: 'What 2.4 does' })).toHaveAttribute(
      'data-ink',
      'full',
    )
    /* and back on, it refuses again */
    await choose(user, 'What 2.4 does', /^refuses/)
    expect(catalogue.getState().constraintDefs[0]!).toMatchObject({
      enabled: true,
      severity: 'block',
    })
  })

  it('said as Northside’s from the price list’s noticed pattern, its edge is ochre until added', async () => {
    const user = userEvent.setup()
    const { again, onOpen } = draw()
    await user.click(screen.getByRole('button', { name: 'Say it as Northside’s' }))
    expect(onOpen).toHaveBeenLastCalledWith('F7')
    again('F7')
    const open = screen.getByTestId('open-rule')
    expect(open.getAttribute('data-owner')).toBe('noticed')
    expect(screen.getByTestId('rule-sentence').textContent).toBe(F7_SAID)
    await user.click(screen.getByRole('button', { name: 'Add it as 2.4' }))
    again('')
    expect(within(screen.getByTestId('your-rule')).getByText(F7_SAID)).toBeTruthy()
    expect(screen.getByText('Said as Northside’s, 2.4.')).toBeTruthy()
  })

  it('arriving on a written rule, as from the build, it is read first and the knife is last', async () => {
    /* built-critique-m3-2.md, minor: "See the rule" opened 2.4 as "being rewritten" with
       "Delete 2.4" its first act, though the dealer came to read it */
    const user = userEvent.setup()
    const { again } = draw('new:motor')
    await writeTiller(user)
    await user.click(screen.getByRole('button', { name: 'Add it as 2.4' }))
    again(catalogue.getState().constraintDefs[0]!.id)

    const open = within(screen.getByTestId('open-rule'))
    expect(open.getByText(/^Northside’s, written /)).toBeTruthy()
    expect(open.queryByText(/being rewritten/)).toBeNull()
    expect(open.queryByRole('button', { name: 'Keep the change' })).toBeNull()
    const acts = open.getAllByRole('button').map((b) => b.textContent)
    expect(acts.indexOf('Close')).toBeLessThan(acts.indexOf('Delete 2.4'))
    expect(acts.at(-1)).toBe('Delete 2.4')

    /* a word changed, and now it is being rewritten, with its act first */
    const because = open.getByRole('textbox', { name: 'Because' })
    await user.type(because, ' at all')
    expect(open.getByText(/· being rewritten$/)).toBeTruthy()
    expect(open.getAllByRole('button')[0]!.textContent).toBe('Keep the change')
  }, 60_000)

  it('words rewritten and not kept are still there after leaving and coming back', async () => {
    const user = userEvent.setup()
    const { again, unmount } = draw('new:motor')
    await writeTiller(user)
    await user.click(screen.getByRole('button', { name: 'Add it as 2.4' }))
    const id = catalogue.getState().constraintDefs[0]!.id
    again(id)
    const because = screen.getByRole('textbox', { name: 'Because' })
    await user.clear(because)
    await user.type(because, 'a tiller hull has nowhere to mount a helm')
    expect(screen.getByRole('button', { name: 'Keep the change' })).toBeTruthy()
    unmount()

    draw(id)
    expect((screen.getByRole('textbox', { name: 'Because' }) as HTMLInputElement).value).toBe(
      'a tiller hull has nowhere to mount a helm',
    )
    await user.click(screen.getByRole('button', { name: 'Keep the change' }))
    expect(catalogue.getState().constraintDefs[0]!.because).toBe(
      'a tiller hull has nowhere to mount a helm',
    )
  }, 60_000) /* five choices, a sentence typed twice and a remount: the slowest walk here */
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
