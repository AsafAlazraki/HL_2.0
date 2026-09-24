import type { Colourway } from '@/domain/quote/colourway'
import { swatchesOf } from '@/domain/quote/spoken'

/**
 * A COLOURWAY DRAWN AS COLOUR — one small swatch per part of the code, in the code's own
 * order, and both halves of a part the decode names as two ("White/Blue").
 *
 * Only what the decode NAMES is drawn (`swatchesOf`, src/domain/quote/spoken.ts), each from
 * its own token (`--swatch-<name>`, src/styles/tokens.css). A colourway that did not decode —
 * any code with I, O, R or WH in it — draws NOTHING, and the screen prints the code alone: a
 * colour nobody can name is a colour nobody may paint.
 *
 * TWO SHAPES. `squares` is a square per part, for a chip or a heading with room. `flag` is
 * the parts as stripes of one small tile, for a cell of the sheet whose width is the code's:
 * the colour is still drawn, and the column keeps its measure.
 *
 * It is never the only statement of the colour. It is hidden from a reader, and every screen
 * that draws it prints or says the colour's name beside it.
 */
export function Swatches({
  colour,
  size = 'md',
  shape = 'squares',
}: {
  colour: Colourway | null
  size?: 'sm' | 'md'
  shape?: 'squares' | 'flag'
}) {
  const drawn = swatchesOf(colour)
  if (drawn.length === 0) return null
  return (
    <span className="ui-swatches" data-size={size} data-shape={shape} aria-hidden="true">
      {drawn.map((part, i) => (
        /* A part's identity IS its place in the code: B-G-B is two parts of the same black.
           The list is derived from a prop and never reorders. */
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className="ui-swatch" data-halves={part.swatches.length}>
          {part.swatches.map((name, j) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={j} className="ui-swatch-fill" data-swatch={name} />
          ))}
        </span>
      ))}
    </span>
  )
}
