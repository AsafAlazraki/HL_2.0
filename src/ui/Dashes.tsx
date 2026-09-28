import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect } from 'react'

/**
 * WHERE YOU ARE IN THE BUILD, as a row of dashes that fills — Saxdor's white foot pill
 * (docs/research/refs/components/notes.md §2, *the foot pill whose dash fills*), which the
 * plan already promised: "the foot pill's dash fills on the chapter you are in". Every
 * chapter before this one is a full dash, this one fills as it is read, the ones after are
 * empty; then "02 / 04" and the chapter's name, which is what a reader is told — the dashes
 * are hidden from a reader, who hears the words.
 *
 * It is drawn from what it is handed (`useChapterProgress` in '@/ui/scroll' reads it off the
 * scroll with GSAP's ScrollTrigger) and it moves nothing itself but the current dash's fill,
 * which follows the scroll exactly and so is not an animation at all. `through` may be the
 * hook's motion value, and then the fill follows it without this re-rendering on a frame.
 *
 * A CHAPTER MAY CARRY ITS OWN NUMBER, OR NONE (2026-09-28, the verify round). Counted by
 * place, the build would have printed "05 / 06 Who it is for" beside a head that carries no
 * number on purpose, and "02 / 05 Trailer" beside "03 Trailer" on a quote with no motor. A
 * chapter handed as `{ name, number }` says its own number where the count stood, and one
 * handed as `{ name }` says its name alone; a plain string is counted by its place.
 */
export type DashChapter = string | { name: string; number?: string }

export interface DashesProps {
  chapters: readonly DashChapter[]
  /** the chapter a person is in, from 0 */
  at: number
  /** how far through it, 0 to 1 */
  through: number | MotionValue<number>
}

const two = (n: number): string => String(n).padStart(2, '0')

const nameOf = (chapter: DashChapter): string =>
  typeof chapter === 'string' ? chapter : chapter.name

export function Dashes({ chapters, at, through }: DashesProps) {
  const here = Math.min(Math.max(0, at), chapters.length - 1)
  const chapter = chapters[here]
  const where =
    chapter === undefined
      ? null
      : typeof chapter === 'string'
        ? `${two(here + 1)} / ${two(chapters.length)}`
        : (chapter.number ?? null)
  return (
    <div className="ui-dashes" data-ground="plate">
      <span className="ui-dashes-row" aria-hidden="true">
        {chapters.map((c, i) => (
          <span key={nameOf(c)} className="ui-dash" data-here={i === here ? '' : undefined}>
            {i === here ? (
              <Filling through={through} />
            ) : (
              <span className="ui-dash-fill" data-full={i < here ? '' : undefined} />
            )}
          </span>
        ))}
      </span>
      {where === null ? null : <span className="ui-dashes-where">{where}</span>}
      {chapter === undefined ? null : <span className="ui-dashes-name">{nameOf(chapter)}</span>}
    </div>
  )
}

/** The dash being read: its fill follows the scroll, a figure or a motion value. */
function Filling({ through }: { through: number | MotionValue<number> }) {
  const own = useMotionValue(typeof through === 'number' ? through : 0)
  useEffect(() => {
    if (typeof through === 'number') own.set(through)
  }, [through, own])
  const scaleX = useTransform(typeof through === 'number' ? own : through, (v) =>
    Math.min(1, Math.max(0, v)),
  )
  return <motion.span className="ui-dash-fill" style={{ scaleX }} />
}
