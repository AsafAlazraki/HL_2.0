import { Picture } from '@/ui'
import { srcSetOf } from '@/data/pictures'
import type { LiveryHero, LiveryMark } from '@/domain/modules/livery'

/* ============================================================
   THE TWO THINGS EVERY PLACE WEARS, drawn the one way on the index,
   the page head and the rail: its mark and its photograph.

   THE MARK. In white ink it stands straight on the place's ground; a
   maker shipped only in its own colours stands on a small white plate
   inset in the ground (Formosa, Yamaha, GFAB …); a place with no mark
   has its NAME set as a wordmark in the display weight — never
   initials, never another maker's mark. Its `alt` is empty because the
   place's name is printed beside it once, in text.

   THE PHOTOGRAPH. Only ever one of the place's own boats (livery.ts),
   fading into the ground, its caption — the model it shows — always
   printed, on a veil so it reads over any water.
   ============================================================ */

export type MarkSize = 'page' | 'card' | 'small' | 'chip'

export function Mark({ mark, name, size }: { mark: LiveryMark; name: string; size: MarkSize }) {
  if (!mark.drawn) {
    return (
      <span className="pl-word" data-size={size}>
        {name}
      </span>
    )
  }
  const m = mark.mark
  const img = (
    <img
      className="pl-mark"
      data-size={size}
      data-on={m.on}
      src={m.src}
      alt=""
      width={m.width}
      height={m.height}
      decoding="async"
    />
  )
  return m.on === 'plate' ? (
    <span className="pl-plate" data-size={size}>
      {img}
    </span>
  ) : (
    img
  )
}

/** Whether a mark is drawn as artwork, so the place's name is printed beside it in text. */
export const markIsArt = (mark: LiveryMark): boolean => mark.drawn

/** The photograph a place stands on, fading into its ground, with its caption. Nothing at
 *  all where it stands on none: the ground holds on its own. */
export function Hero({
  hero,
  sizes,
  priority,
}: {
  hero: LiveryHero
  sizes: string
  priority?: boolean
}) {
  if (!hero.shown) return null
  const picture =
    hero.from === 'maker' ? (
      <Picture
        src={hero.picture.src}
        srcSet={srcSetOf(hero.picture)}
        sizes={sizes}
        alt=""
        width={hero.picture.width}
        height={hero.picture.height}
        priority={priority}
        lazy={!priority}
      />
    ) : (
      <Picture
        src={hero.image.src}
        alt=""
        width={hero.image.w ?? 1600}
        height={hero.image.h ?? 1000}
        priority={priority}
        lazy={!priority}
      />
    )
  return (
    <span className="pl-hero">
      <span className="pl-hero__shot">{picture}</span>
      <span className="pl-hero__caption">{hero.caption}</span>
    </span>
  )
}
