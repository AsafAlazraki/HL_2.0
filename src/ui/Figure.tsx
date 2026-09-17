import NumberFlow, { type Format } from '@number-flow/react'

/**
 * A figure that is not the price: a count of rows, a horsepower, a length. NumberFlow
 * moves it digit by digit when it changes and holds still under reduced motion
 * (`respectMotionPreference`). The price never goes through here; see `PriceFigure`.
 *
 * IT IS FOR A FIGURE THAT CHANGES IN FRONT OF THE READER — a count as a filter narrows, a
 * horsepower as a motor is swapped. A figure that is set once when a file lands and then
 * stays does NOT belong here: it would spin up from zero on first paint, which is the same
 * thing `PriceFigure` refuses, a number that looks like it is still being decided. Home
 * draws its search count through this and its six file counts as plain text, and says so
 * where it does it (`src/screens/home/Home.tsx`).
 */
export interface FigureProps {
  value: number
  /**
   * NumberFlow's own `Format`, not `Intl.NumberFormatOptions`: it animates digit by digit
   * and so accepts only the notations it can draw (`standard` and `compact`), never
   * `scientific` or `engineering`. Taking its type means a caller is told at the call site.
   */
  format?: Format
  prefix?: string
  suffix?: string
  locales?: string
}

export function Figure({ value, format, prefix, suffix, locales = 'en-AU' }: FigureProps) {
  return (
    <NumberFlow
      className="ui-figure"
      value={value}
      format={format}
      prefix={prefix}
      suffix={suffix}
      locales={locales}
      respectMotionPreference
    />
  )
}
