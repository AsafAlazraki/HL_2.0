import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { jointsOf } from '@/domain/quote/wrap'
import { KindMark, Picture } from '@/ui'
import { copyOf, itemOf, markOnPaper, pictureOf, srcSetOf } from '@/data/pictures'
import type { TableKind } from '@/domain/model'
import type { Column, Sample, Shelf } from './read'

/* ============================================================
   THE SMALL PIECES PRICES DRAWS IN MORE THAN ONE PLACE — a maker's
   mark, one line's own picture, and the scale a share is drawn on.
   This screen's own; nothing here is shared with another screen.
   ============================================================ */

const COUNT = new Intl.NumberFormat('en-AU')
export const n = (value: number): string => COUNT.format(value)

/** "1 boat", "91 boats". */
export const plural = (count: number, one: string, many: string): string =>
  `${n(count)} ${count === 1 ? one : many}`

export const KIND: Record<Shelf, TableKind> = {
  boats: 'boat',
  trailers: 'trailer',
  motors: 'motor',
  packages: 'package',
  parts: 'accessory',
}

/** A share of one figure in another, to one place: 66.5%. */
export const shareOf = (part: number, whole: number): string =>
  `${(Math.round((part / whole) * 1000) / 10).toLocaleString('en-AU')}%`

/** THE MAKER'S MARK, in the ink paper needs, drawn once, in an opened list; a list with no mark
 *  held in that ink (Stabicraft publishes white ink alone) is its kind and its name in type. */
export function Mark({
  col,
  named = true,
  drawnOnly = false,
}: {
  col: Column
  named?: boolean
  /** nothing where no mark is held: the list's name already stands over it */
  drawnOnly?: boolean
}) {
  const choice = col.markOf ? markOnPaper(col.markOf) : null
  if (drawnOnly && !choice?.drawn) return null
  if (choice?.drawn)
    return (
      <span className="lv-mark" data-drawn="">
        <img
          src={choice.mark.src}
          width={choice.mark.width}
          height={choice.mark.height}
          alt={col.name}
          decoding="async"
        />
      </span>
    )
  return (
    <span className="lv-mark">
      <KindMark kind={KIND[col.shelf]} size="sm" />
      {named ? <span className="lv-mark__name">{col.name}</span> : null}
    </span>
  )
}

/** ONE LINE'S OWN PICTURE, from the one picture reader, as a thumbnail beside its name and never
 *  above its figures; nothing where none is held — never a stand-in. */
export function LinePicture({ sample, maker }: { sample: Sample; maker: string }) {
  if (sample.bare) return null
  const item = itemOf(sample.tableId, sample.rowId, sample.image)
  const shown = copyOf(item) ?? pictureOf(item)
  if (!shown) return null
  return (
    <figure className="lv-pic">
      <Picture
        src={shown.src}
        srcSet={srcSetOf(shown)}
        sizes="(min-width: 834px) 160px, 96px"
        alt={`The ${maker} ${sample.name}`.replace(/\s+/g, ' ')}
        width={shown.width}
        height={shown.height}
        fit="contain"
      />
    </figure>
  )
}

/**
 * A SHARE DRAWN ON ITS SCALE: a band from the lowest share of Cash to the highest across a list,
 * with Cash itself as the rule at 100%. A Warranty above Cash crosses the rule where a reader can
 * see it. The figures stand in words beside it, and the drawing says nothing the words do not,
 * so a reader is handed the words and the drawing is hidden from it.
 */
export function ShareScale({
  low,
  high,
  from,
  to,
  label,
}: {
  /** the lowest and highest share, whole per cent */
  low: number
  high: number
  /** the scale's ends, whole per cent */
  from: number
  to: number
  label: string
}) {
  /* where a share stands on the scale, as a fraction of its width, for the stylesheet */
  const at = (p: number) => Math.max(0, Math.min(1, (p - from) / (to - from)))
  const place = {
    '--lo': at(low),
    '--hi': at(Math.max(high, low + 0.6)),
    '--cash': at(100),
  } as CSSProperties
  return (
    <span className="lv-scale" aria-hidden="true" data-label={label} style={place}>
      <span className="lv-scale__track">
        <span className="lv-scale__band" data-over={high > 100 ? '' : undefined} />
        <span className="lv-scale__cash" />
      </span>
    </span>
  )
}

/** A heading for one group, counted. */
export function GroupHead({
  id,
  title,
  count,
  note,
}: {
  id: string
  title: string
  count?: number
  note: ReactNode
}) {
  return (
    <div className="lv-grouphead">
      <h2 className="lv-grouphead__title" id={id}>
        {title}
        {count !== undefined ? ' ' : null}
        {count !== undefined ? <span className="lv-grouphead__count">{n(count)}</span> : null}
      </h2>
      <p className="lv-grouphead__note">{note}</p>
    </div>
  )
}

/** A LINE'S NAME, BROKEN AT ITS JOINTS FIRST: between the boat, its material and its colourway
 *  before inside any of them (`jointsOf`, the one rule the cascade keeps too) — never
 *  "White / White / ⏎ White/Blue" (the judge, 2026-11-04). */
export function Joints({ text }: { text: string }) {
  return jointsOf(text).map((part, i) => (
    // eslint-disable-next-line react/no-array-index-key -- a part's identity is its place in the name
    <Fragment key={i}>
      {i === 0 ? null : ' '}
      <span className="lv-joint" data-long={part.length > LONG_PART ? '' : undefined}>
        {part}
      </span>
    </Fragment>
  ))
}

/** A part of a name longer than this many characters does not fit one line in a hand, so it
 *  breaks as prose and what follows runs on after it ("… Cables & Filter · up to 70 HP"). */
const LONG_PART = 32
