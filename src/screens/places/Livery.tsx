import { useEffect, useState, type CSSProperties } from 'react'
import { Picture } from '@/ui'
import { srcSetOf } from '@/data/pictures'
import {
  MARK_PROPORTION,
  WHOLE_FILE,
  inkBox,
  markScale,
  type DrawnMark,
  type InkBox,
  type LiveryHero,
  type LiveryMark,
} from '@/domain/modules/livery'

/* ============================================================
   THE TWO THINGS EVERY PLACE WEARS, drawn the one way on the index,
   the page head and the rail: its mark and its photograph.

   THE MARK. In white ink it stands straight on the place's ground; a
   maker shipped only in its own colours stands on a small white plate
   inset in the ground (Formosa, Yamaha, GFAB …); a place with no mark
   has its NAME set as a wordmark in the display weight — never
   initials, never another maker's mark. Its `alt` is empty because the
   place's name is printed beside it once, in text.

   ONE OPTICAL SIZE. Each size's height is a 4 : 1 mark's; a mark of
   another proportion is scaled by `markScale` (livery.ts) so it covers
   the same area — Jeanneau's star over its name half as tall again,
   Highfield's long mark a sixth shorter — because a mark held at its
   neighbours' size is the showpiece.

   ITS INK, NOT ITS FILE. A maker's file can carry clear margin
   (Haines Signature's script fills 48% of its height), so the mark is
   a box the shape of its ink, read once per file from its own pixels
   (`inkBox`, livery.ts), with the clear margin cut away. Until it is read, or
   where it cannot be (another site's file), the whole file is drawn.

   THE PHOTOGRAPH. Only ever one of the place's own boats (livery.ts),
   fading into the ground, its caption — the model it shows — always
   printed, on a veil so it reads over any water.
   ============================================================ */

export type MarkSize = 'page' | 'card' | 'small' | 'chip'

/* ---- where each mark's ink sits, read once per file from its own pixels ---- */
interface Inked {
  /** the ink's own proportion, width over height, in the file's pixels */
  aspect: number
  box: InkBox
}
const inked = new Map<string, Inked>()
const READ_WIDTH = 480

/** The ink of a mark file, read in a canvas; the whole file where its pixels cannot be read
 *  (another site's file, a browser with no canvas). */
async function readInk(src: string): Promise<Inked | null> {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  await img.decode()
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  if (nw === 0 || nh === 0) return null
  const w = Math.min(READ_WIDTH, nw)
  const h = Math.max(1, Math.round((w * nh) / nw))
  let box: InkBox = WHOLE_FILE
  try {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ink = canvas.getContext('2d', { willReadFrequently: true })
    if (ink) {
      ink.drawImage(img, 0, 0, w, h)
      box = inkBox(ink.getImageData(0, 0, w, h).data, w, h) ?? WHOLE_FILE
    }
  } catch {
    box = WHOLE_FILE
  }
  return { aspect: (box.w * nw) / (box.h * nh), box }
}

function useInk(src: string, width?: number, height?: number): Inked {
  /* a file already read is drawn by its ink at once; the read below only ever wakes the mark */
  const [, woke] = useState(0)
  useEffect(() => {
    if (inked.has(src)) return
    let live = true
    readInk(src)
      .then((got) => {
        if (!got) return
        inked.set(src, got)
        if (live) woke((n) => n + 1)
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [src])
  return (
    inked.get(src) ?? {
      aspect: width && height ? width / height : MARK_PROPORTION,
      box: WHOLE_FILE,
    }
  )
}

export function Mark({ mark, name, size }: { mark: LiveryMark; name: string; size: MarkSize }) {
  if (!mark.drawn) {
    return (
      <span className="pl-word" data-size={size}>
        {name}
      </span>
    )
  }
  return <MarkArt mark={mark.mark} size={size} />
}

/** A drawn mark: a box the shape of its INK, the file inside it with its clear margin cut
 *  away, at the area every other mark covers. */
function MarkArt({ mark: m, size }: { mark: DrawnMark; size: MarkSize }) {
  const ink = useInk(m.src, m.width, m.height)
  const art = (
    <span
      className="pl-mark"
      data-size={size}
      data-on={m.on}
      style={
        {
          '--mark-scale': markScale(ink.aspect, 1),
          '--ink-aspect': ink.aspect,
          '--ink-x': ink.box.x,
          '--ink-y': ink.box.y,
          '--ink-w': ink.box.w,
          '--ink-h': ink.box.h,
        } as CSSProperties
      }
    >
      <img src={m.src} alt="" width={m.width} height={m.height} decoding="async" />
    </span>
  )
  return m.on === 'plate' ? (
    <span className="pl-plate" data-size={size}>
      {art}
    </span>
  ) : (
    art
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
