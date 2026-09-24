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
   and be the bug. So this reads the screen's files as text — the same
   move `curation/applied.test.ts` makes — and holds the one structural
   call to the one place it may be made from.

   THE PLACE MOVED ON 2026-09-23, from the record panel's resting form
   to the last line of the columns menu (`More.tsx`), behind a press
   of "Add a column…" — the critic's §11: the form had been the
   brightest thing on the screen, refusing before anybody touched it.
   The three assertions moved with it, unchanged.

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
import gridSource from '@/screens/sheet/Grid.tsx?raw'
// oxlint-disable-next-line import/default
import recordSource from '@/screens/sheet/Record.tsx?raw'
// oxlint-disable-next-line import/default
import readSource from '@/screens/sheet/read.ts?raw'
// oxlint-disable-next-line import/default
import moreSource from '@/screens/sheet/More.tsx?raw'
// oxlint-disable-next-line import/default
import gallerySource from '@/screens/sheet/Gallery.tsx?raw'

/** Text with comments taken out — every assertion is about the CODE,
 *  and this file's own header quotes the calls it is guarding. */
const code = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const more = code(moreSource)
const everySource = [sheetSource, gridSource, recordSource, readSource, moreSource, gallerySource]

describe('the one call that adds a column', () => {
  it('is made from exactly one place in the whole screen', () => {
    expect(more.match(/addField\(/g) ?? []).toHaveLength(1)
    for (const other of [sheetSource, gridSource, recordSource, readSource, gallerySource]) {
      expect(code(other)).not.toContain('addField(')
    }
  })

  it('and that place is the act under the offer, not a gesture on the grid', () => {
    const at = more.indexOf('const acceptColumn')
    expect(at).toBeGreaterThan(-1)
    const body = more.slice(at, more.indexOf('\n  }\n', at))
    expect(body).toContain('addField(')
  })

  it('names what it would do in a sentence that counts the rows, before anything is written', () => {
    /* the sentence names the table, the column and how many rows it
       lands empty on, from the same variables the act reads */
    expect(more).toContain('This adds a column called “${clean}” to ${table.name}')
    expect(more).toContain('empty on all ${countLabel(rowCount, noun)}')
    expect(more).toContain('Nothing is written until the act under it is pressed')
  })

  it('goes through the store, so it is one step with a way back', () => {
    const at = more.indexOf('const acceptColumn')
    const body = more.slice(at, more.indexOf('\n  }\n', at))
    /* `apply` is the screen's one door to `catalogue.apply`, which
       pushes every step onto the undo stack */
    expect(body).toContain('apply(')
  })

  it('is not drawn at all until a person presses “Add a column…”', () => {
    const at = more.indexOf('if (!asked)')
    expect(at).toBeGreaterThan(-1)
    expect(more.indexOf('Add a column…', at)).toBeGreaterThan(at)
    /* and the offer itself is below that return */
    expect(more.indexOf('const acceptColumn')).toBeGreaterThan(at)
  })
})

describe('what the sheet never authors', () => {
  it('makes no table and deletes none', () => {
    for (const src of everySource) {
      const c = code(src)
      expect(c).not.toContain('createTable(')
      expect(c).not.toContain('deleteTable(')
      expect(c).not.toContain('deleteField(')
    }
  })

  it('never writes a cell on a browse: the grid’s pointer handlers read and never apply', () => {
    const grid = code(gridSource)
    const at = grid.indexOf('const onCellDown')
    const body = grid.slice(at, grid.indexOf('const onCellPress'))
    expect(body.length).toBeGreaterThan(0)
    expect(body).not.toContain('write(')
    expect(body).not.toContain('commit(')
  })
})
