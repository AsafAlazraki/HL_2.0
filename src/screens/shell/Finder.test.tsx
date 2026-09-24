import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ModuleDef, RowData } from '@/domain/model'
import { createMemoryDatabase } from '@/data/memory/database'
import { memoryQuotes } from '@/data/memory/repositories'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { setCustomer } from '@/domain/quote'
import { NO_DESK, Shell } from './Shell'

/* ============================================================
   THE FINDER WITH THE PRICE FILE OPEN, PRESSED AS A DEALER PRESSES IT.

   The critique of Milestone 2's close (#8): "every boat the finder
   answers has one verb, 'Open it on the sheet'. There is no way to
   quote the boat you just found." Here a boat is found by its code and
   quoted from the finder, twice — the second press hands the same
   draft back — and a model is opened on the picker. Nothing is seeded:
   the file is the real pack, the quote is written by the press, and
   every figure compared is read off the store.

   Its own file, apart from `Shell.test.tsx`, because vitest hands one
   module instance to a file and the pill's own cases are about a desk
   with NO file open.
   ============================================================ */

const ORG = 'northside'
let pack: PackFixture

const rowCoded = (code: string): RowData => {
  const table = pack.entities.find((e) => e.id === 'boat_highfield')!
  const field = table.fields.find((f) => f.name === 'Model Code')!
  return pack.rowsByEntity[table.id]!.find((r) => r.values[field.id] === code)!
}

beforeAll(async () => {
  pack = await loadPack()
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
  session.getState().signIn('Asaf')
})

beforeEach(async () => {
  prefs.getState().forgetAll()
  await quotes.getState().open(memoryQuotes(ORG, { db: createMemoryDatabase() }))
})

const find = async (user: ReturnType<typeof userEvent.setup>, words: string) => {
  await user.keyboard('{Control>}k{/Control}')
  const sheet = await screen.findByRole('dialog')
  await user.keyboard(words)
  return sheet
}

describe('a boat found is a boat to sell', () => {
  it('HBS126 starts a quote on that boat and opens the build on it', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} org={ORG} />)
    const sheet = await find(user, 'HBS126')
    const row = await within(sheet).findByRole('option', { name: /Start a quote/ })
    expect(row).toHaveTextContent('HBS126')
    await user.click(row)

    const filed = quotes.getState().quotes
    expect(filed).toHaveLength(1)
    expect(filed[0]!.rootRowId).toBe(rowCoded('HBS126').id)
    expect(go).toHaveBeenCalledWith(`/quote/${filed[0]!.id}`)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('pressed again, hands the same draft back rather than writing a second', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} org={ORG} />)
    for (let i = 0; i < 2; i += 1) {
      const sheet = await find(user, 'HBS126')
      await user.click(await within(sheet).findByRole('option', { name: /Start a quote/ }))
    }
    expect(quotes.getState().quotes).toHaveLength(1)
    expect(go.mock.calls.map((c) => c[0])).toEqual([
      `/quote/${quotes.getState().quotes[0]!.id}`,
      `/quote/${quotes.getState().quotes[0]!.id}`,
    ])
  })

  it('refuses in a sentence, where it was pressed, when no dealership is at the desk', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} />)
    const sheet = await find(user, 'HBS126')
    await user.click(await within(sheet).findByRole('option', { name: /Start a quote/ }))
    expect(within(sheet).getByRole('alert')).toHaveTextContent(NO_DESK)
    expect(go).not.toHaveBeenCalled()
    expect(quotes.getState().quotes).toHaveLength(0)
    /* and typing again takes the sentence away */
    await user.keyboard('{Backspace}')
    expect(within(sheet).queryByRole('alert')).not.toBeInTheDocument()
  })

  it('a model of many versions opens the picker on it, to choose one', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} org={ORG} />)
    const sheet = await find(user, 'sp560')
    const row = await within(sheet).findByRole('option', { name: /Choose the version/ })
    await user.click(row)
    expect(go).toHaveBeenCalledTimes(1)
    expect(go.mock.calls[0]![0]).toMatch(/^\/quote\/new\?model=/)
    expect(quotes.getState().quotes).toHaveLength(0)
  })
})

describe('a name typed on a quote is a customer, on the door and in the finder', () => {
  /* Customers reads everyone a quote names as a customer the moment the name is typed
     (`readEveryone`, 2026-09-24). The door and the finder read the same function: before, the
     door counted the book alone and Ctrl K found nobody a quote named until the book kept them. */
  it('counts them on the Customers door and finds them by name', async () => {
    const user = userEvent.setup()
    const go = vi.fn<(href: string) => void>()
    render(<Shell at="/" go={go} org={ORG} />)
    const sheet = await find(user, 'HBS126')
    await user.click(await within(sheet).findByRole('option', { name: /Start a quote/ }))
    const quote = quotes.getState().quotes[0]!
    /* a name typed at the desk — the person at the keyboard, played by the test */
    quotes.getState().apply(quote.id, setCustomer({ name: 'R. Kelleher' }))

    expect(await screen.findByRole('link', { name: 'Customers — 1 customer' })).toBeInTheDocument()
    const again = await find(user, 'kelleher')
    /* the quote that carries the name answers too, under Quotes; the person is under Customers */
    const [person] = await within(again).findAllByRole('option', { name: /Open their page/ })
    expect(person).toHaveTextContent('R. Kelleher')
    await user.click(person!)
    expect(go).toHaveBeenLastCalledWith(expect.stringMatching(/^\/customers\?who=/))
  })
})

describe('the question that is not a name', () => {
  it('trailer for sp560 answers the trailers the file pairs with it', async () => {
    const user = userEvent.setup()
    render(<Shell at="/" go={() => {}} org={ORG} />)
    const sheet = await find(user, 'trailer for sp560')
    expect(await within(sheet).findByText('Trailers for sp560')).toBeInTheDocument()
    const rows = within(sheet).getAllByRole('option')
    expect(rows[0]).toHaveTextContent(/fits (all \d+|\d+ of \d+|it)/)
    expect(rows[0]).toHaveTextContent('Open it on the sheet')
  })
})
