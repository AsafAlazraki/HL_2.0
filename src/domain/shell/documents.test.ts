/* ============================================================
   A DOCUMENT IS FOUND BY THE BOAT TWO WAYS (m2-last-critique.md,
   blocker 2).

   The register prints the boat as a person says it, so the finder's
   Quotes group had only that string to match: a quote remembered by the
   code on the order sheet was found by the register's own field and not
   by Ctrl K. The document below is built in this file, on the file's own
   label for a real boat read off the pack — the shape the engine
   freezes, and nothing the app would show a person.
   ============================================================ */
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import type { QuoteDef } from '@/domain/model'
import { buildSearchIndex, search } from '@/domain/catalogue/search'
import { readRegister } from '@/domain/quote/register'
import { spokenBoat } from '@/domain/quote/spoken'
import { quoteFactsOf } from './documents'

let label = ''
let tableId = ''

beforeAll(async () => {
  const pack = await loadPack()
  /* the first boat whose name the app says differently from the file —
     found by asking, not named here */
  for (const table of pack.entities) {
    if (table.kind !== 'boat') continue
    for (const row of pack.rowsByEntity[table.id] ?? []) {
      const said = spokenBoat(table.id, String(row.values[table.displayFieldId ?? '']))
      if (said.colour?.read && said.from === 'maker') {
        label = said.label
        tableId = table.id
        return
      }
    }
  }
})

const draft = (): QuoteDef => ({
  id: 'q1',
  orgId: 'northside',
  reference: '20260924-01',
  state: 'draft',
  viewId: 'view_1',
  rootTableId: tableId,
  rootRowId: 'row_1',
  subjectLabel: label,
  subjectSpecs: [],
  sections: [],
  chapters: [],
  lines: [],
  adjustments: [],
  events: [],
  levelKey: 'cash',
  customer: { name: '' },
  createdAt: '2026-09-24T00:00:00.000Z',
  updatedAt: '2026-09-24T00:00:00.000Z',
})

describe('quoteFactsOf — the register read into the finder’s index', () => {
  it('carries the boat as the register prints it and the file’s own string beside it', () => {
    const [facts] = quoteFactsOf(readRegister([draft()]))
    const said = spokenBoat(tableId, label)
    expect(facts!.subject).toBe(said.say)
    expect(facts!.label).toBe(label)
    expect(facts!.issued).toBe(false)
  })

  it('is found in the finder by the said name, by the file’s code, and by words apart', () => {
    const index = buildSearchIndex({}, {}, { quotes: quoteFactsOf(readRegister([draft()])) })
    const said = spokenBoat(tableId, label)
    /* the model as the maker names it — "Sport 560" — which the file never writes */
    expect(search(index, said.model).quotes).toHaveLength(1)
    /* the file's own colourway code, which the register no longer prints */
    const code = label.split(' ').at(-1)!
    expect(said.say).not.toContain(code)
    expect(search(index, code).quotes).toHaveLength(1)
    /* the model and one colour the app names, not side by side on the line */
    const colour = said.colour!.say.split(' / ').at(-1)!
    expect(search(index, `${said.model} ${colour}`).quotes).toHaveLength(1)
  })
})
