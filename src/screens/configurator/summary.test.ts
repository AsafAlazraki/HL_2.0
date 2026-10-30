/* The summary's list and its one act that reads a person's words, against the real pack. */
import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { rowLabel, type QuoteDef, type RowData } from '@/domain/model'
import { mintQuoteFromView } from '@/domain/quote'
import { readRail } from './chapters'
import { emailIn, summaryItems } from './summary'

const pack = await loadPack()
const ctx = pack.ctx

function sp560(): QuoteDef {
  const table = pack.byKey('boat_highfield')
  const row = (pack.rowsByEntity[table.id] ?? []).find((r: RowData) =>
    rowLabel(table, r).includes('SP560 (PVC) W-W-WB'),
  )!
  const view = createViewFor(ctx, table.id)
  return mintQuoteFromView(ctx, { viewId: view.id, rowId: row.id, reference: 'NSM-TEST' })!
}

describe('what the summary lists', () => {
  it('leads with the boat, then every line on the quote with its own figure, once', () => {
    const quote = sp560()
    const rail = readRail(ctx, quote)
    const fitted = rail.chapters
      .filter((c) => c.kind === 'band')
      .flatMap((c) => c.tables.flatMap((t) => [...t.rows.filter((r) => r.fitted), ...t.also]))
    const items = summaryItems(rail, {
      name: 'Highfield Sport 560',
      amount: 41340,
      picture: null,
      chapter: 'The hull',
      kind: 'boat',
    })
    expect(items[0]!.chapter).toBe('The hull')
    /* the boat, and every other line on the quote: no line twice, none left out */
    expect(items.length).toBe(1 + fitted.length)
    expect(items.length).toBe(quote.lines.length)
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length)
  })
})

describe('the address the email act opens', () => {
  it('finds an email among the other words of a contact line, and nothing where there is none', () => {
    expect(emailIn('0400 000 000 · jordan.avery@example.com')).toBe('jordan.avery@example.com')
    expect(emailIn('0400 000 000')).toBe('')
    expect(emailIn('12 Wharf St, Brisbane')).toBe('')
  })
})
