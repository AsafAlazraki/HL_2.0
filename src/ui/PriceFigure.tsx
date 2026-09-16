import { money } from '@/domain/money'

/**
 * A price is set once and stays. It never counts up (a figure that moves reads as a figure
 * still being decided) and it is set in tabular figures so a column of prices lines up.
 * The format is the one `domain/money` sets for the whole app; nothing is rounded here.
 */
export interface PriceFigureProps {
  amount: number
  tone?: 'ink' | 'muted'
}

export function PriceFigure({ amount, tone = 'ink' }: PriceFigureProps) {
  return (
    <data className="ui-price" data-tone={tone} value={String(amount)}>
      {money(amount)}
    </data>
  )
}
