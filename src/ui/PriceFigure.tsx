import { money } from '@/domain/money'
import { signedMoney } from '@/domain/quote/pricing'

/**
 * A price is set once and stays. It never counts up (a figure that moves reads as a figure
 * still being decided) and it is set in tabular figures so a column of prices lines up.
 * The format is the one `domain/money` sets for the whole app; nothing is rounded here.
 *
 * IN THE KIT (2026-09-28) a price has three sizes and one voice — bold, tabular, tracked
 * tight as it grows — and the largest, `display`, sets its dollar sign small and raised, the
 * way a price on a showroom card is set (board C's `.fig`). The sign is shrunk by the
 * stylesheet (`::first-letter`), never split into an element of its own, so the figure is
 * still one string — "$28,530" — to a reader, to a search and to every test that finds it.
 *
 * IT NEVER MOVES. It carries no transition, no animation and no view-transition name, so a
 * route's crossfade or a photograph's morph around it never takes it along: it is simply in
 * its new place (the kit's rule, and board C's "the price is named apart").
 *
 * `signed` IS A CHANGE TO A PRICE, "+$16,869" or "−$3,437", set by the quote's own
 * `signedMoney`: the cascade's change to the total was plain text styled to look like this
 * figure, because this one could not print a plus (2026-09-28, the verify round). It is the
 * same figure and the same stillness; only the sign is new, and a signed display figure does
 * not shrink its sign the way it shrinks a dollar.
 */
export interface PriceFigureProps {
  amount: number
  tone?: 'ink' | 'muted'
  size?: 'md' | 'lg' | 'display'
  signed?: boolean
}

export function PriceFigure({ amount, tone = 'ink', size = 'md', signed }: PriceFigureProps) {
  return (
    <data
      className="ui-price"
      data-tone={tone}
      data-size={size}
      data-sign={amount < 0 ? 'minus' : signed && amount > 0 ? 'plus' : undefined}
      value={String(amount)}
    >
      {signed ? signedMoney(amount) : money(amount)}
    </data>
  )
}
