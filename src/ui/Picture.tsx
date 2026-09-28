import { useState } from 'react'

/**
 * A PICTURE THE APP SHIPS, drawn at no more than its own size, fading in once its bytes have
 * landed rather than a dark box becoming a photograph in one frame (Home's `--duration-reveal`
 * reveal, made the primitive's).
 *
 * AND THE ONE THING IN THE APP THAT TRAVELS BETWEEN SCREENS. `shared` gives the picture a
 * view-transition name — the model's own, "boat-SA529APTR" — so when the same name stands on
 * the next screen the browser morphs one into the other (PLAN.md § "Motion choreography for
 * the flow": the picker tile's photograph becomes the build's stage becomes the paper's cover).
 * ONLY A PICTURE IS EVER SHARED: a name on a box would carry the words and the price inside it
 * along the morph, and a price never travels. Two pictures on one screen must not share a
 * name; the screen that draws two of one model names one of them.
 *
 * `fit` is `cover` for a scene that fills its frame and `contain` for a studio render on white,
 * which is laid on the plate by multiply so its white is the plate's.
 */
export interface PictureProps {
  src: string
  alt: string
  /** The held copy's own pixel size, so the frame keeps its proportion before it lands. */
  width: number
  height: number
  fit?: 'cover' | 'contain'
  /** A view-transition name for the model this picture depicts. */
  shared?: string
  /** A picture above the fold, fetched first. */
  priority?: boolean
  /**
   * FETCHED ONLY AS IT NEARS THE WINDOW — for a long list of pictures (a maker's 289 boats),
   * never the default: a picture a person scrolls to should be there when they arrive, and a
   * picture that has not been asked for cannot be waited on by anything that waits for the
   * page's pictures to land (e2e/shots/recipe.ts, `settle`).
   */
  lazy?: boolean
  /**
   * THE SMALLER COPIES THE LEDGER HOLDS, and how wide the picture is drawn, so a 2,560px
   * photograph is never fetched for a 200px card — the picker's plate, the build's stage and the
   * register's room each kept their own `<img>` for this alone until 2026-09-28 (the verify
   * round). `src` stays the copy a browser without them takes.
   */
  srcSet?: string
  sizes?: string
}

/** A view-transition name is an identifier: letters, digits, hyphens and underscores. */
export function sharedName(name: string): string {
  const clean = name.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return /^[A-Za-z_]/.test(clean) ? clean : `p-${clean}`
}

export function Picture({
  src,
  alt,
  width,
  height,
  fit = 'cover',
  shared,
  priority,
  lazy,
  srcSet,
  sizes,
}: PictureProps) {
  const [landed, setLanded] = useState(false)
  return (
    <img
      className="ui-picture"
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      data-fit={fit}
      data-landed={landed ? '' : undefined}
      decoding="async"
      loading={lazy && !priority ? 'lazy' : 'eager'}
      fetchPriority={priority ? 'high' : undefined}
      onLoad={() => setLanded(true)}
      ref={(el) => {
        /* an image already in the cache fires `load` before React has listened */
        if (el?.complete && el.naturalWidth > 0) setLanded(true)
      }}
      style={shared ? { viewTransitionName: sharedName(shared) } : undefined}
    />
  )
}
