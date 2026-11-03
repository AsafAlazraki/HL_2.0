import { useCallback, useState } from 'react'
import { makeCtx } from '@/domain/model'
import { addLine } from '@/domain/quote/commands'
import { pickedLines, type Pick } from '@/domain/fitment/rigged'
import type { Place } from '@/domain/fitment/boat'
import { catalogue, ctxFrom } from '@/state/catalogue'
import { quotes } from '@/state/quotes'
import { session } from '@/state/session'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { startQuote } from '@/screens/picker/mint'
import { say } from '@/ui'

/* ============================================================
   FROM THE ANSWER INTO THE SALE (the fitment judge, 2026-11-03,
   blocker 3: "nothing on Fitment starts a quote").

   One press starts the quote the picker would start for this very
   version — its own mint, the boat alone, and its guard against a
   second draft for a boat already standing with nobody named — and
   then puts on it, one step each with the build's own sentence, the
   motor with its rigging kit and the trailer chosen here, as the
   build's own candidates (`pickedLines`). Then it opens the build.

   Nothing here phrases a figure; a refusal is the mint's sentence,
   said by the press.
   ============================================================ */

export function useStart(openQuote: (quoteId: string) => void) {
  const [refused, setRefused] = useState('')

  const start = useCallback(
    (boat: Place, picks: readonly Pick[]): void => {
      const store = quotes.getState()
      const sheet = catalogue.getState()
      const outcome = startQuote(
        {
          tableId: boat.tableId,
          rowId: boat.rowId,
          sheet,
          orgId: PACK_ORG_ID,
          filed: store.quotes,
          preparedBy: session.getState().name,
        },
        (tableId, rowId) => store.unaddressedDraftFor(tableId, rowId),
      )
      if (!outcome.ok) {
        setRefused(outcome.refused)
        return
      }
      setRefused('')
      if (outcome.event) store.file(outcome.quote, outcome.event)
      /* A COPY of the views: the build's reading files the page it rebuilds into the map */
      const ctx = makeCtx({ ...ctxFrom(sheet), views: { ...sheet.views }, orgId: PACK_ORG_ID })
      const { adds, kept } = pickedLines(ctx, outcome.quote, picks)
      for (const add of adds)
        quotes.getState().apply(outcome.quote.id, addLine(add.blockId, add.line))
      say([outcome.said, ...kept].join(' '))
      openQuote(outcome.quote.id)
    },
    [openQuote],
  )

  return { start, refused }
}
