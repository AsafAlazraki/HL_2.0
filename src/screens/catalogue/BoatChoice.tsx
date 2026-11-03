import { useMemo, useState } from 'react'
import { BoatIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { findBoats } from '@/domain/fitment/boat'
import type { CatalogueCtx } from '@/domain/model'
import { Icon, Input, Popover } from '@/ui'
import type { BoatSaid } from './read'

/* ============================================================
   THE CUSTOMER'S BOAT, CHOSEN ON THE CHANDLERY ITSELF (the judge of
   the chandlery, J6: "'Fitting no boat' is a sentence, not a
   control"). Mazda's BT-50 accessories hold the vehicle at the head
   with "Change model" (docs/research/refs/choosing/round-2/live/
   mazda-bt50-accessories-top.png); here the boat is one control at
   the head of every aisle, written into the address (`boat`), and the
   parts the price list makes for it come first.

   Pressed with no boat, it opens a find over every boat still sold
   (`findBoats`, the same reading Fitment's chooser makes); with a
   boat, it says the boat and offers to fit none.
   ============================================================ */

export function BoatChoice({
  ctx,
  boat,
  made,
  onBoat,
}: {
  ctx: CatalogueCtx
  boat: BoatSaid | null
  /** how many parts the price list makes for the chosen boat */
  made: number
  onBoat: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const found = useMemo(
    () => (query.trim().length < 2 ? null : findBoats(ctx, query, 8)),
    [ctx, query],
  )

  if (boat) {
    return (
      <span className="chd-boat" data-on="">
        <span className="chd-boat__glyph" aria-hidden="true">
          <Icon glyph={BoatIcon} size="sm" />
        </span>
        <span className="chd-boat__name">
          {boat.full}
          <span className="chd-boat__count">
            {made === 0
              ? ' · nothing made for it'
              : ` · ${made.toLocaleString('en-AU')} made for it`}
          </span>
        </span>
        <button
          type="button"
          className="chd-boat__off"
          aria-label={`Fit no boat: stop putting the ${boat.name}’s parts first`}
          onClick={() => onBoat('')}
        >
          <Icon glyph={XIcon} size="sm" />
        </button>
      </span>
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery('')
      }}
      side="bottom"
      align="end"
      title="The customer’s boat"
      trigger={
        <button type="button" className="chd-boat" data-ground="plate">
          <span className="chd-boat__glyph" aria-hidden="true">
            <Icon glyph={BoatIcon} size="sm" />
          </span>
          <span className="chd-boat__name">For a boat…</span>
        </button>
      }
    >
      <div className="chd-boats">
        <p className="chd-boats__lead">
          Choose the customer’s boat, and the parts the price list makes for it come first.
        </p>
        <Input
          type="search"
          icon={MagnifyingGlassIcon}
          value={query}
          onValueChange={setQuery}
          placeholder="Stacer 529, Sport 560, a model code"
          aria-label="Find the boat"
        />
        {found === null ? null : found.found.length === 0 ? (
          <p className="chd-boats__none">No boat still sold answers to “{query.trim()}”.</p>
        ) : (
          <ul className="chd-boats__list">
            {found.found.map((b) => (
              <li key={b.place.rowId}>
                <button
                  type="button"
                  className="chd-boats__one"
                  onClick={() => {
                    setOpen(false)
                    setQuery('')
                    onBoat(b.place.rowId)
                  }}
                >
                  <span className="chd-boats__name">{b.name}</span>
                  {b.detail === '' ? null : <span className="chd-boats__detail">{b.detail}</span>}
                </button>
              </li>
            ))}
            {found.matched > found.found.length ? (
              <li className="chd-boats__more">
                {`${(found.matched - found.found.length).toLocaleString('en-AU')} more answer to it: add a word to narrow them.`}
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </Popover>
  )
}
