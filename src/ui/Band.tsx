import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { startWater, type Flowing, type Swell } from './water'

/**
 * THE BAND — the ground Northside's name stands on: Entry, the head of Home, the mark. "I want
 * the logo to be the showpiece thing." Board C's saturated blue band, with board A's live water
 * as its ground (the judge's graft) and Northside's name set as board A sets it: the first word
 * large, light and tracked wide, the rest in small tracked capitals beneath, both white on the
 * water at 5.8 : 1 or better by construction (src/ui/water.ts).
 *
 * THE NAME IS TYPE UNTIL NORTHSIDE ADDS ITS MARK, and never an invented logo: `name` is the
 * business the price file names. When a mark exists it is handed in as `mark` and stands where
 * the name's first word stands, with the name beneath.
 *
 * THE ONE AUTHORED MOMENT: the two lines rise 14px out of a 6px blur, 90ms apart, once per
 * mount — board C's reveal. Under reduced motion they are simply there.
 *
 * The water is decoration and is hidden from a reader; the band is named by its words.
 */
export interface BandProps {
  /** The business, as the file names it: "Northside Marine". */
  name: string
  /** One sentence under the name. */
  say?: string
  /** Northside's own mark, once it has one. */
  mark?: { src: string; alt: string }
  /** Acts that stand on the band: the screen's own. */
  children?: ReactNode
}

export function Band({ name, say, mark, children }: BandProps) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0] ?? ''
  const rest = words.slice(1).join(' ')
  return (
    <section className="ui-band" aria-label={name}>
      <Water />
      <div className="ui-band-words">
        {mark ? (
          <img className="ui-band-mark" src={mark.src} alt={mark.alt} />
        ) : (
          <span className="ui-band-first">{first}</span>
        )}
        {rest || mark ? <span className="ui-band-rest">{mark ? name : rest}</span> : null}
        {say ? <span className="ui-band-say">{say}</span> : null}
      </div>
      {children ? <div className="ui-band-acts">{children}</div> : null}
    </section>
  )
}

/**
 * The live ground: a canvas the band draws its water on, or nothing where WebGL is not.
 *
 * `still` HOLDS IT ON ONE FRAME for as long as its screen asks — Entry, while the file is read
 * (2026-09-28, the verify round; Entry took the water off the page for that time, because a
 * window redrawn every frame stalled its read on the 4-core desk, and asked for this instead).
 * A still water is not redrawn at all, so it costs what the band's gradient costs, and the flag
 * keeps its water rather than changing ground under the name when the door is pressed.
 *
 * `swell` SIZES THE WATER TO ITS SURFACE: a band's broad swell, or the close one a flag or a
 * crest needs to hold more than a slice of one swell (src/ui/water.ts, `SWELL`).
 */
export function Water({ still = false, swell = 'broad' }: { still?: boolean; swell?: Swell }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  const held = useRef(false)
  const flowing = useRef<Flowing | null>(null)
  useEffect(() => {
    held.current = Boolean(reduce) || still
    if (!held.current) flowing.current?.wake()
  }, [reduce, still])
  useEffect(() => {
    const el = canvas.current
    if (!el || typeof WebGLRenderingContext === 'undefined') return
    flowing.current = startWater(el, { reduced: () => held.current, swell })
    return () => {
      flowing.current?.stop()
      flowing.current = null
    }
  }, [swell])
  return <canvas ref={canvas} className="ui-water" aria-hidden="true" />
}
