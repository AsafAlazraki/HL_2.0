import { useEffect, useMemo } from 'react'
import { Plate, Segmented, say, undo, unsay } from '@/ui'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { isDone } from '@/domain/catalogue/commands'
import { letQuote, quotesOnItsOwn } from '@/domain/catalogue/quotingCommand'
import type { PlaceCard } from './read'

/* ============================================================
   SOLD ON ITS OWN — whether a quote can start from this place, set
   on the place's own Settings beside its line, mark and photograph
   (the flow round, 2026-10-30).

   The owner: "quotes are not just boats - also motors or trailers or
   even dealer fit things as well and you can sell those as well."
   Parts & Accessories and Dealer Fit Packages "never had Quote
   switched on", and nothing could switch it (exposure.md, blocker).

   A CHOICE YOU CAN SEE, NOT A SWITCH: two answers to one question,
   the chosen one standing. The setting belongs to the whole place in
   the business (a module), so where that place holds more than this
   list the sentence under it names every list it reaches. Boats are
   always quoted: a boat place is not offered the choice, because a
   boat sold only with a boat is not a choice anyone makes.

   One press is one step with its Undo (`letQuote`).
   ============================================================ */

const STEP = 'places-selling'

type Answer = 'with' | 'alone'

export function Selling({ card }: { card: PlaceCard }) {
  const modules = useCatalogue((s) => s.modules)
  const tables = useCatalogue((s) => s.tables)
  const module = modules[card.place.moduleId]
  useEffect(() => () => unsay(STEP), [])

  /* the other lists the same place in the business holds, which this choice reaches too */
  const others = useMemo(
    () =>
      (module?.tableIds ?? [])
        .filter((id) => !card.tableIds.includes(id))
        .map((id) => tables[id]?.name)
        .filter((n): n is string => typeof n === 'string'),
    [module, tables, card.tableIds],
  )
  if (!module || card.kind === 'boat' || card.place.retired) return null

  const alone = quotesOnItsOwn(module.capabilities)
  const choose = (next: Answer): void => {
    const outcome = catalogue.getState().apply(letQuote(module.id, next === 'alone'))
    if (!isDone(outcome)) {
      if (outcome.refused !== '') say(outcome.refused, { id: STEP })
      return
    }
    const eventId = outcome.event.id
    undo(
      outcome.said,
      () => {
        const back = catalogue.getState().undo(eventId)
        say(isDone(back) ? back.said : back.refused || 'Nothing to change.', { id: STEP })
      },
      { id: STEP },
    )
  }

  return (
    <Plate as="section" pad="md" label={`How ${card.name} is sold`}>
      <h3 className="pl-set__head">How it is sold</h3>
      <div className="pl-set__sold">
        <Segmented<Answer>
          label={`Can a quote start from ${card.name}?`}
          options={[
            { value: 'with', label: 'Only with a boat' },
            { value: 'alone', label: 'On its own too' },
          ]}
          value={alone ? 'alone' : 'with'}
          onValueChange={choose}
        />
        <p className="pl-set__say">
          {alone
            ? `A quote can start from ${card.name} with no boat on it: a repower, a trailer, or parts over the counter.`
            : `${card.name} is offered inside a boat’s quote. Choose “On its own too” to sell it with no boat.`}
          {others.length > 0
            ? ` ${others.join(', ')} ${others.length === 1 ? 'is' : 'are'} sold the same way: the choice is for all of ${module.name}.`
            : ''}
        </p>
      </div>
    </Plate>
  )
}
