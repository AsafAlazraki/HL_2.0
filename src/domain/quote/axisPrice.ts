/* ============================================================
   WHETHER EVERY CHOICE ON ONE AXIS OF A BOAT COSTS THE SAME.

   The owner, 2026-10-31: "the hull stuff has heaps in it for all
   brands so let's make it really easy to use". A Highfield's seven
   colourways are one price on the price list, and seven pills each
   reading "no change" said one fact seven times (the critic, the same
   day). Where every other choice on an axis moves the total by
   nothing, the axis says so once, at its head, and its choices carry
   no figure; where any one of them moves it, every choice says what
   it does. A choice the price list gives no price is never "the same
   price": it says so on its own.
   ============================================================ */

export interface AxisChoicePrice {
  /** the choice on the quote now */
  current: boolean
  /** its figure on the price list, or null where the list gives none */
  amount: number | null
  /** what choosing it does to the total */
  delta: number
}

/** True where the axis offers more than one choice and every choice not on the quote is priced and
 *  moves the total by nothing. */
export function axisOnePrice(options: readonly AxisChoicePrice[]): boolean {
  const others = options.filter((o) => !o.current)
  return others.length > 0 && others.every((o) => o.amount !== null && o.delta === 0)
}
