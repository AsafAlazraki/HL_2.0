import { sharedName } from '@/ui'

/* ============================================================
   THE NAMES A PICTURE TRAVELS UNDER (the component kit, 2026-09-28).

   The View Transitions API morphs a picture from where it stood to
   where it stands whenever the same `view-transition-name` is on both
   sides of a change (src/ui/Picture.tsx says why only a picture is
   ever named: a name on a box would carry its words and its price
   along the morph, and a price never travels).

   THE BOAT'S NAME IS THE ROW A QUOTE IS WRITTEN AGAINST — its table
   and its row, which every screen of the sale can read off a quote
   (`rootTableId`, `rootRowId`) and the picker reads off the version its
   plate is showing. So the picker's card, its plate and the build's
   stage (src/screens/configurator) name one boat's photograph the same
   way, and a press carries it from one to the next (PLAN.md § "Motion
   choreography for the flow"). The build imports this rather than
   spelling it again, for the reason it imports the cascade's `fix`
   grammar: two screens that must agree on a string must not be able to
   spell it two ways.
   ============================================================ */

/** The name a boat's photograph travels under: the table and the row the quote is for. */
export const boatTravel = (tableId: string, rowId: string): string =>
  sharedName(`boat-${tableId}-${rowId}`)

/** The name a maker's mark travels under, from its door to the head of its boats. */
export const markTravel = (brandId: string): string => sharedName(`mark-${brandId}`)
