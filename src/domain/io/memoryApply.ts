/* ============================================================
   APPLY PORTS, IN MEMORY — the sheet an apply can be driven into
   without a browser, a store or a database.

   `apply.ts` writes through `ApplyPorts`. The browser binds them to
   the catalogue store and the three registries; this binds them to
   four plain maps, which is what a suite needs and what a headless
   restore would use. Same idea as `src/data/memory/`: one contract,
   two adapters, and the tests run against the one with no moving
   parts.

   THE FOUR DESIGN-LAYER DOORS REFUSE, LOUDLY, AND THAT IS THE POINT.
   `createView`, `updateView`, `createModule`, `updateModule` and
   `createRole` are the project store's own commands, and this build
   has none of them yet — `src/state/catalogue.ts` is read-only until
   the commands land. A double that quietly did something plausible
   would let a test about page and module identity PASS against a
   guess at behaviour nobody has written: `createView` is idempotent
   by root table, `createModule` refuses a join as a master and mints
   a page when a module has none, `createRole` refuses an id already
   taken. Every one of those is load-bearing in `restoreDesign`, and
   inventing them here would be inventing the answer.

   So they throw a sentence naming what is missing. A suite that
   reaches one fails and says why, which is the honest state of the
   world; a suite whose file carries no pages, modules, roles or
   business rules never reaches them at all, and those are the trips
   that can be walked today.
   ============================================================ */

import { makeCtx, type CatalogueCtx, type QuoteDef } from '@/domain/model'
import type { ApplyPorts } from './apply'

const NOT_BUILT = (door: string): never => {
  throw new Error(
    `${door} is a project-store command this build does not have yet, so an apply cannot be driven through it here. See src/domain/io/memoryApply.ts.`,
  )
}

export interface MemorySheet {
  ports: ApplyPorts
  /** the sheet as it stands, for an assertion to read */
  ctx: () => CatalogueCtx
  /** the documents on this sheet, newest first is the caller's business */
  quotes: () => QuoteDef[]
}

/** A sheet in memory, started from whatever context is handed in.
 *  The context is copied, never held: a replace swaps the copy. */
export function memoryApply(start: CatalogueCtx, project = { name: 'Sheet', rev: 0 }): MemorySheet {
  let held: CatalogueCtx = makeCtx({ ...start })
  let meta = { ...project }
  const quotes = new Map<string, QuoteDef>(held.quotes.map((q) => [q.id, q]))

  const ports: ApplyPorts = {
    sheet: () => held,
    project: () => meta,
    replaceProject: (next) => {
      /* THE STORE'S OWN CONTRACT, kept: a replace takes tables,
         zones, rules and rows and CLEARS the pages and the modules —
         "a module surviving a swap is worse than a view surviving
         one, because a module is the thing a person navigates by".
         The organisation is not cleared here because
         `keepingOrganisation` is what puts it back, and the quotes
         are not touched at all: a quote does not depend on the
         sheet. */
      const rowsByEntity: Record<string, (typeof next.rowsByEntity)[string]> = {}
      for (const [id, list] of Object.entries(next.rowsByEntity)) rowsByEntity[id] = list
      held = makeCtx({
        ...held,
        entities: Object.fromEntries(next.entities.map((e) => [e.id, e])),
        groups: Object.fromEntries(next.groups.map((g) => [g.id, g])),
        rules: Object.fromEntries(next.rules.map((r) => [r.id, r])),
        rowsByEntity,
        views: {},
        modules: {},
      })
      meta = { name: next.name, rev: next.rev }
    },
    setOrganisation: (name, industry) => {
      held = makeCtx({
        ...held,
        org: { name, industry, createdAt: held.org?.createdAt ?? held.now() },
      })
    },
    createView: () => NOT_BUILT('createView'),
    updateView: () => NOT_BUILT('updateView'),
    createModule: () => NOT_BUILT('createModule'),
    updateModule: () => NOT_BUILT('updateModule'),
    createRole: () => NOT_BUILT('createRole'),
    registerViewDef: () => NOT_BUILT('registerViewDef'),
    registerConstraints: () => NOT_BUILT('registerConstraints'),
    getQuote: (id) => quotes.get(id),
    registerQuote: (quote) => {
      quotes.set(quote.id, quote)
      held = makeCtx({ ...held, quotes: [...quotes.values()] })
    },
  }

  return { ports, ctx: () => held, quotes: () => [...quotes.values()] }
}
