import NumberFlow, { type Format } from '@number-flow/react'

/**
 * A figure that is not the price: a count of rows, a horsepower, a length. NumberFlow
 * moves it digit by digit when it changes and holds still under reduced motion
 * (`respectMotionPreference`). The price never goes through here; see `PriceFigure`.
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
