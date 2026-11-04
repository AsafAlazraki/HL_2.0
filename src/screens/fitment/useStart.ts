import { useCallback, useState } from 'react'
import { makeCtx } from '@/domain/model'
import { addLine } from '@/domain/quote/commands'
import { pickedLines, type Pick } from '@/domain/fitment/rigged'
import type { Place } from '@/domain/fitment/boat'
import { handsBack, keptSaid } from '@/domain/fitment/handBack'
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
   second draft for a boat already standing with nobody named, asked
   only of a draft nobody has touched (`handsBack`) — and
   then puts on it, one step each with the build's own sentence, the
   motor with its rigging kit and the trailer chosen here, as the
   build's own candidates (`pickedLines`). Then it opens the build.

   Nothing here phrases a figure; a refusal is the mint's sentence,
   said by the press.
   ============================================================ */

/**
 * SAID ON THE BUILD, NOT HERE (fit flow, round 2): a card raised at this address is taken away the
 * moment the address changes (`src/ui/Toaster.tsx`), so the press's sentence — which quote it
 * opened, and the earlier draft kept as it was — was gone before it could be read at five of the
 * six sizes. It waits for the build's own address, four seconds at most, and is said there;
 * where the address never changes (a render with no router) it is said where the press was.
 */
function sayOnArrival(text: string, address: string): void {
  if (text === '') return
  const until = Date.now() + 4000
  const there = (): boolean =>
    typeof window === 'undefined' || window.location.pathname.endsWith(address)
  const tick = (): void => {
    if (there() || Date.now() >= until || typeof requestAnimationFrame !== 'function') say(text)
    else requestAnimationFrame(tick)
  }
  tick()
}

export function useStart(openQuote: (quoteId: string) => void) {
  const [refused, setRefused] = useState('')

  const start = useCallback(
    (boat: Place, picks: readonly Pick[]): void => {
      const store = quotes.getState()
      const sheet = catalogue.getState()
      const standing = (tableId: string, rowId: string) => store.unaddressedDraftFor(tableId, rowId)
      const before = standing(boat.tableId, boat.rowId)
      const outcome = startQuote(
        {
          tableId: boat.tableId,
          rowId: boat.rowId,
          sheet,
          orgId: PACK_ORG_ID,
          filed: store.quotes,
          preparedBy: session.getState().name,
        },
        /* ONLY A DRAFT NOBODY HAS TOUCHED IS HANDED BACK (fit flow, round 2, walk 1, major 1):
           a draft already carrying a motor came back and the F115XB the bar named was ignored.
           Any other standing draft is kept as it was, said, and a new quote takes the choice. */
        (tableId, rowId) => handsBack(standing(tableId, rowId)),
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
      /* SAID ONLY WHERE THERE IS NEWS: the build's head already names the quote it opened, so
         the press speaks when an earlier draft was kept as it was or a pick could not go on */
      const news = [outcome.already ? '' : keptSaid(before), ...kept].filter((w) => w !== '')
      const said =
        news.length === 0
          ? ''
          : [outcome.said, ...news].map((w) => (/[.!?]$/.test(w) ? w : `${w}.`)).join(' ')
      openQuote(outcome.quote.id)
      sayOnArrival(said, outcome.goTo)
    },
    [openQuote],
  )

  return { start, refused }
}
