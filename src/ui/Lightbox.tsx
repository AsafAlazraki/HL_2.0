import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { ArrowsOutSimpleIcon, CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react'
import {
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Icon } from './Icon'

/**
 * A PICTURE, LARGE (the owner, 2026-10-30: "we need to be able to expand images of products and
 * whatnot … motor trailers etc."). Every product picture on the build opens here on a press: the
 * hull, a motor, a trailer, a part, a colour. It is the kit's one dialog underneath (Base UI:
 * the focus trap, Escape, the scroll lock, the portal), so a person who opened it from a tile
 * is handed back to that tile when it shuts, by Escape or by the close they can see.
 *
 * NEVER PAST ITS OWN PIXELS. The picture is drawn at the held copy's size or smaller — the
 * window's, less the room its words take — and never stretched to fill: a 600px maker's render
 * stays 600px on a 1920 screen, on the plate, with air round it.
 *
 * ITS WORDS ARE THE PICTURE'S OWN: what it is (the caption the tile gives it) and where it came
 * from (the ledger's provenance — the maker's host, or "Added by Asaf, 30 October 2026" for a
 * picture Northside added). Never a stand-in: a set holds only pictures the ledger holds.
 *
 * BETWEEN THE PICTURES OF ONE CHAPTER by the arrows on the screen, the arrow keys, or a swipe.
 * Under reduced motion the picture changes in place and the plate fades; nothing slides.
 */
export interface LightboxPicture {
  src: string
  /** the held copy's own pixels: the ceiling it is drawn at */
  width: number
  height: number
  /** the narrower copies, where the ledger holds them */
  srcSet?: string
  /** what the picture shows, for a reader */
  alt: string
  /** what it is, as the tile says it: "Yamaha F90LB" */
  caption: string
  /** where it came from: "Picture from yamaha-motor.com.au", "Added by Asaf, 30 October 2026" */
  credit: string
}

export interface LightboxProps {
  pictures: readonly LightboxPicture[]
  /** which picture stands open, or null for none */
  at: number | null
  /** where a press, a key or a swipe moves it, and null to shut it */
  onAt: (at: number | null) => void
  /** what the set is, for a reader: "Motor", "The boat" */
  title: string
}

/** How far a finger travels across the picture before it counts as a swipe. */
const SWIPE_PX = 48

export function Lightbox({ pictures, at, onAt, title }: LightboxProps) {
  const open = at !== null && pictures[at] !== undefined
  const picture = open ? pictures[at] : undefined
  const many = pictures.length > 1
  const down = useRef<{ x: number; y: number } | null>(null)

  const step = (by: number): void => {
    if (at === null || !many) return
    onAt((at + by + pictures.length) % pictures.length)
  }
  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
  }
  const onDown = (event: ReactPointerEvent<HTMLElement>): void => {
    down.current = { x: event.clientX, y: event.clientY }
  }
  const onUp = (event: ReactPointerEvent<HTMLElement>): void => {
    const from = down.current
    down.current = null
    if (!from) return
    const dx = event.clientX - from.x
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(event.clientY - from.y)) {
      step(dx < 0 ? 1 : -1)
    }
  }

  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => (next ? undefined : onAt(null))}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="ui-lightbox-backdrop" />
        <BaseDialog.Popup className="ui-lightbox" data-ground="plate" onKeyDown={onKey}>
          <header className="ui-lightbox-head">
            <div className="ui-lightbox-words">
              <BaseDialog.Title className="ui-lightbox-title">
                {picture?.caption ?? title}
              </BaseDialog.Title>
              <BaseDialog.Description className="ui-lightbox-credit">
                {picture?.credit ?? ''}
              </BaseDialog.Description>
            </div>
            <BaseDialog.Close className="ui-lightbox-close">
              <Icon glyph={XIcon} />
              Close
            </BaseDialog.Close>
          </header>
          {picture ? (
            <figure
              className="ui-lightbox-figure"
              onPointerDown={onDown}
              onPointerUp={onUp}
              onPointerCancel={() => {
                down.current = null
              }}
            >
              <img
                key={picture.src}
                className="ui-lightbox-img"
                src={picture.src}
                srcSet={picture.srcSet}
                sizes={picture.srcSet ? `${picture.width}px` : undefined}
                alt={picture.alt}
                width={picture.width}
                height={picture.height}
                draggable={false}
                style={
                  {
                    '--held-w': `${picture.width}px`,
                    '--held-h': `${picture.height}px`,
                  } as CSSProperties
                }
              />
            </figure>
          ) : null}
          {many && at !== null ? (
            <footer className="ui-lightbox-foot">
              <button
                type="button"
                className="ui-lightbox-step"
                onClick={() => step(-1)}
                aria-label="The picture before"
              >
                <Icon glyph={CaretLeftIcon} />
              </button>
              <p className="ui-lightbox-count" aria-live="polite">
                {`${at + 1} of ${pictures.length} · ${title}`}
              </p>
              <button
                type="button"
                className="ui-lightbox-step"
                onClick={() => step(1)}
                aria-label="The picture after"
              >
                <Icon glyph={CaretRightIcon} />
              </button>
            </footer>
          ) : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

/**
 * THE PRESS THAT OPENS A PICTURE LARGE: a small round button over the picture's corner, its
 * glyph the two arrows going out, its name what it opens ("See the Yamaha F90LB larger"). It
 * is a button of its own beside whatever the picture sits in — never inside a tile's own press,
 * which chooses the option.
 */
export function ExpandPicture({ label, onExpand }: { label: string; onExpand: () => void }) {
  return (
    <button type="button" className="ui-expand" aria-label={label} onClick={onExpand}>
      <Icon glyph={ArrowsOutSimpleIcon} />
    </button>
  )
}
