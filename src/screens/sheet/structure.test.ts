/* ============================================================
   A STRUCTURAL CHANGE IS NEVER A SIDE EFFECT — the guard docs/LATER.md
   named as owed by the first screen that can add structure, ported
   from the old repo's `features/views/structureAsk.test.ts` and
   pointed at this one.

   The old finding: "One click on an accessory, on a view page, moved
   the selection onto a brand-new join table … and took TABLES 21 → 22."
   The rule that came out of it, for the whole app: a new table, a
   new column or a new join is OFFERED, in a sentence that names it,
   and is undoable. Never authored behind a browse or a pick.

   WHY THIS GUARD READS SOURCE. The rule is about how a call is
   REACHED, and no behavioural test can see it: a cell edit that
   called `addField` on its way to a commit would render identically
   and be the bug. So this reads `Sheet.tsx` as text — the same move
   `curation/applied.test.ts` makes — and holds the one structural
   call to the one place it may be made from.

   A NEW CALLER MEANS A NEW LINE HERE. `addField` and `createTable`
   are exported from `@/domain/catalogue/commands`, so another screen
   can reach them; if one ever does, its source belongs in a file like
   this with the same three assertions, which is the friction that
   keeps the list honest.
   ============================================================ */
import { describe, expect, it } from 'vitest'
/* `?raw`, not `node:fs` — `src/` carries no node types except the pack
   fixture, and `curation/applied.test.ts` reads its surfaces the same
   way, through the alias, which is also what keeps the import linter
   from resolving a text file as a module */
/* oxlint's import plugin resolves the specifier with the query stripped
   and reports the default the real module does not have — a false
   positive about a module that exists only at build time, silenced
   here exactly as `curation/applied.test.ts` silences it */
// oxlint-disable-next-line import/default
import sheetSource from '@/screens/sheet/Sheet.tsx?raw'
// oxlint-disable-next-line import/default
import outlineSource from '@/screens/sheet/Outline.tsx?raw'
// oxlint-disable-next-line import/default
import recordSource from '@/screens/sheet/Record.tsx?raw'
// oxlint-disable-next-line import/default
import readSource from '@/screens/sheet/read.ts?raw'

/** Text with comments taken out — every assertion is about the CODE,
 *  and this file's own header quotes the calls it is guarding. */
const code = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const sheet = code(sheetSource)

describe('the one call that adds a column', () => {
  it('is made from exactly one place in the whole screen', () => {
    expect(sheet.match(/addField\(/g) ?? []).toHaveLength(1)
    for (const other of [outlineSource, recordSource, readSource]) {
      expect(code(other)).not.toContain('addField(')
    }
  })

  it('and that place is the act under the offer, not a gesture on the grid', () => {
    const at = sheet.indexOf('const acceptColumn')
    expect(at).toBeGreaterThan(-1)
    const body = sheet.slice(at, sheet.indexOf('\n  }\n', at))
    expect(body).toContain('addField(')
  })

  it('names what it would do in a sentence that counts the rows, before anything is written', () => {
    /* the sentence names the table, the column and how many rows it
       lands empty on, from the same variables the act reads */
    expect(sheet).toContain('This adds a column called “${clean}” to ${table.name}')
    expect(sheet).toContain('empty on all ${countLabel(rowCount, noun)}')
    expect(sheet).toContain('Nothing is written until the act under it is pressed')
  })

  it('goes through the store, so it is one step with a way back', () => {
    const at = sheet.indexOf('const acceptColumn')
    const body = sheet.slice(at, sheet.indexOf('\n  }\n', at))
    /* `apply` is the screen's one door to `catalogue.apply`, which
       pushes every step onto the undo stack */
    expect(body).toContain('apply(')
  })
})

describe('what the sheet never authors', () => {
  it('makes no table and deletes none', () => {
    for (const src of [sheetSource, outlineSource, recordSource, readSource]) {
      const c = code(src)
      expect(c).not.toContain('createTable(')
      expect(c).not.toContain('deleteTable(')
      expect(c).not.toContain('deleteField(')
    }
  })

  it('never writes a cell on a browse: the grid’s pointer handlers read and never apply', () => {
    const outline = code(outlineSource)
    const at = outline.indexOf('const onCellDown')
    const body = outline.slice(at, outline.indexOf('const onCellPress'))
    expect(body).not.toContain('write(')
    expect(body).not.toContain('commit(')
  })
})
