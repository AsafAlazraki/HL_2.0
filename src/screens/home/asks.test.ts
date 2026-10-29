/* ============================================================
   THE PRICE QUESTIONS HOME SAYS BEFORE THE SALE, read off the real
   price list and held to Prices' own count (built-critique-m3-2.md,
   major 5). The count is asserted against `readDesk` a second time
   rather than typed, so Home and Prices are one figure.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { catalogue } from '@/state/catalogue'
import { isDone } from '@/domain/catalogue/commands'
import { CASH, namePrice } from '@/domain/catalogue/priceCommands'
import { readDesk, readLadder, type Sheet } from '@/screens/levels/read'
import { priceAsksOf, priceAsksSay } from './asks'

const sheet = (): Sheet => {
  const s = catalogue.getState()
  return { tables: s.tables, rows: s.rows, priceLevels: s.priceLevels }
}

beforeAll(async () => {
  const pack = await loadPack()
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules),
  })
})

describe('the price questions on Home', () => {
  it('counts what Prices lists under "Yours to choose", and names the lists that stop a quote', () => {
    const asks = priceAsksOf(sheet())
    expect(asks).not.toBeNull()
    expect(asks!.count).toBe(readDesk(sheet(), readLadder(sheet())).choose.length)
    /* the motor's two figures do not stop a quote, so the Yamahas are counted and not named */
    expect(asks!.stopping).toEqual(['dealer fit package', 'rigging kit', 'factory package'])
    expect(priceAsksSay(asks!)).toBe(
      `${asks!.count} price questions wait for you. Until they are answered, a dealer fit package, rigging kit or factory package on a quote is priced by hand before the quote can be given.`,
    )
  })

  it('says one question in the singular, and only what it stops', () => {
    expect(priceAsksSay({ count: 1, stopping: ['rigging kit'] })).toBe(
      '1 price question waits for you. Until it is answered, a rigging kit on a quote is priced by hand before the quote can be given.',
    )
    expect(priceAsksSay({ count: 1, stopping: [] })).toBe('1 price question waits for you.')
  })

  it('stops naming a list once its price is chosen on Prices', () => {
    const before = priceAsksOf(sheet())!
    const fit = Object.values(sheet().tables).find((t) => t.name === 'Dealer Fit Packages')
    expect(fit).toBeDefined()
    const sell = fit!.fields.find((f) => f.name === 'Sell')
    expect(sell).toBeDefined()
    const outcome = catalogue.getState().apply(namePrice(fit!.id, CASH, sell!.id))
    expect(isDone(outcome)).toBe(true)
    const after = priceAsksOf(sheet())!
    expect(after.count).toBe(before.count - 1)
    expect(after.stopping).not.toContain('dealer fit package')
  })
})
