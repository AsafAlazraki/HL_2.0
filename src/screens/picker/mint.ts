/* ============================================================
   PRESSING THE ACT — one row of the file becomes a document.

   THIS IS THE ONE PLACE THE PICKER WRITES ANYTHING, and it writes
   through the engine rather than beside it. `mintQuote` is the quote
   feature's own door: it freezes every rung the row carries, brings
   the starred motor across, and hands back the document AND the event
   that made it, so nothing here decides what a quote is.

   WHY A VIEW IS MADE FIRST. A quote's sections are its view's blocks —
   what the hull is joined to decides which chapters exist — and the
   pack ships no views, because a view is a page a dealer sets up.
   `createViewFor` is idempotent per table and derives the default from
   the joins that already exist, which is exactly what the configurator
   will resolve when it opens the document. It writes the view it made
   into `ctx.views`, so the context handed in below carries a COPY of
   the store's map: minting a quote must not quietly mutate the sheet
   in the catalogue store.

   THE PICKER ASKS FIRST, and `src/state/quotes.ts` says why at length:
   stepping back from the configurator to the picker and forward again
   used to mint a SECOND quote for the same boat and strand the first
   with somebody's work on it. So before anything is written this asks
   the store whether an unaddressed draft already stands for this row,
   and hands it back instead.

   NOTHING HERE NAVIGATES AND NOTHING HERE TOASTS. It returns the
   document, the sentence and the address the document would open at;
   the screen decides what to draw and the route decides where to go.
   That is what lets a component test press the act without a router.
   ============================================================ */

import { makeCtx, type QuoteDef, type QuoteEvent } from '@/domain/model'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuote, referenceForNow } from '@/domain/quote'
import { ctxFrom, type CatalogueData } from '@/state/catalogue'

/** Where the configurator will live, per the plan's own route list
 *  (`docs/PLAN.md`: `quote.$id` is the configurator). A document's
 *  address is knowable the moment it is minted, whether or not the
 *  screen at that address has been built — so the act can always say
 *  where the quote went. */
export const addressOf = (quoteId: string): string => `/quote/${quoteId}`

export interface StartArgs {
  tableId: string
  rowId: string
  /** the sheet, as the catalogue store holds it */
  sheet: CatalogueData
  orgId: string
  /** every quote already filed — the reference counts today's */
  filed: readonly QuoteDef[]
  /** the name at the desk, when somebody typed one */
  preparedBy?: string | null
  /** the clock, injected: a test says which instant it is asking about */
  at?: Date
}

export type Started =
  | {
      ok: true
      quote: QuoteDef
      /** absent when the draft was already standing and is handed back */
      event?: QuoteEvent
      /** true when nothing was written — this draft already existed */
      already: boolean
      said: string
      goTo: string
    }
  | { ok: false; refused: string }

/**
 * Start a quote for one row, or say why it cannot be started.
 *
 * `file` is handed in rather than reached for, because the store is a
 * side effect and this function is the part worth testing: given a
 * sheet and a row, does the right document come out, addressed to the
 * right place, exactly once.
 */
export function startQuote(
  args: StartArgs,
  standing: (tableId: string, rowId: string) => QuoteDef | undefined,
): Started {
  const { tableId, rowId, sheet, orgId, filed } = args
  const at = args.at ?? new Date()

  const table = sheet.tables[tableId]
  if (!table) {
    return {
      ok: false,
      refused: 'That maker is no longer in this browser, so there is nothing to quote.',
    }
  }
  if (!sheet.index.rowById[rowId]) {
    return {
      ok: false,
      refused: `That boat is no longer in ${table.name}, so there is nothing to quote.`,
    }
  }

  const already = standing(tableId, rowId)
  if (already) {
    return {
      ok: true,
      quote: already,
      already: true,
      said: `${already.subjectLabel} — quote ${already.reference} is already open and nobody is named on it yet, so it is handed back rather than written twice.`,
      goTo: addressOf(already.id),
    }
  }

  const ctx = makeCtx({
    ...ctxFrom(sheet),
    /* A COPY. `createViewFor` files the view it makes into this map,
       and the map `ctxFrom` hands over is the catalogue store's own. */
    views: { ...sheet.views },
    orgId,
    quotes: [...filed],
    now: () => at.toISOString(),
  })

  const view = createViewFor(ctx, tableId)
  const minted = mintQuote(ctx, {
    viewId: view.id,
    rowId,
    reference: referenceForNow(filed, at),
    ...(args.preparedBy ? { preparedBy: args.preparedBy } : {}),
  })

  if (!minted) {
    return {
      ok: false,
      refused: `${table.name} could not be quoted: the boat was read and the quote came back empty. Nothing was written.`,
    }
  }

  return {
    ok: true,
    quote: minted.quote,
    event: minted.event,
    already: false,
    said: minted.event.said,
    goTo: addressOf(minted.quote.id),
  }
}
