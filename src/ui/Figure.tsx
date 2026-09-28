import NumberFlow, { useIsSupported, type Format } from '@number-flow/react'
import { useMemo } from 'react'
import { useStill } from './MotionRoot'
import { effect } from './motion'

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
 *
 * ADOPTED, NOT ONLY INSTALLED (2026-09-29, the components critique, major 12). Three things
 * make it the kit's figure rather than the library's defaults:
 *   · IT HOLDS STILL UNDER A CARET. A count that narrows as a dealer types lands at once while
 *     the caret is in the field — "nothing moves while a caret is in a text field", and
 *     emil-design-eng's "never animate keyboard-initiated actions" — and rolls when a press
 *     changes it: a maker chosen, a customer filed, a quote made.
 *   · IT MOVES ON THE KIT'S CLOCK. The digits roll on the travel spring (441ms, the curve
 *     tokens.css samples) and a digit arriving or leaving fades on the enter tween, where
 *     NumberFlow's own default is 900ms on a curve of its own.
 *   · IT READS AS TEXT. NumberFlow draws its digits in a shadow root as a picture labelled with
 *     the value; measured on Home, the sentence's accessible text was "1 1 6 lines answer to
 *     that", and its `innerText` — what a copy takes — was " lines answer to that", with no
 *     number at all. The figure now carries its value once as text for a reader and a copy,
 *     and the moving digits are hidden from the accessibility tree.
 * Where the browser cannot move digits (NumberFlow's own `canAnimate`: no CSS `mod()` or no
 * `linear()` easing), the figure is that text and nothing else.
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

const ROLL = effect('travel')
const FADE = effect('enter')

export function Figure({ value, format, prefix, suffix, locales = 'en-AU' }: FigureProps) {
  const still = useStill()
  const moves = useIsSupported()
  const said = useMemo(
    () => `${prefix ?? ''}${new Intl.NumberFormat(locales, format).format(value)}${suffix ?? ''}`,
    [value, format, prefix, suffix, locales],
  )
  if (!moves) return <span className="ui-figure">{said}</span>
  return (
    <span className="ui-figure">
      <span className="ui-figure__said">{said}</span>
      <NumberFlow
        className="ui-figure__digits"
        aria-hidden="true"
        value={value}
        format={format}
        prefix={prefix}
        suffix={suffix}
        locales={locales}
        animated={!still}
        respectMotionPreference
        transformTiming={ROLL}
        spinTiming={ROLL}
        opacityTiming={FADE}
      />
    </span>
  )
}
