import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDndContext,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core'
import { getEventCoordinates } from '@dnd-kit/utilities'
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { money } from '@/domain/money'
import { reducedMotion } from '@/ui'

/* ============================================================
   A PART TAKEN TO THE QUOTE BY HAND — dnd kit, the owner's named
   library (2026-10-28: "think images drag drop"), with the same act by
   a press and by the keyboard, and each said aloud in the same words.

     · BY POINTER: a part's tile is lifted after 8px of travel (so a
       press on its Add or its picture is still a press), carried as a
       small ghost that keeps up and to the left of the pointer, and
       put on the quote by letting go over the total at the bottom left.
     · BY KEYBOARD: the tile's grip takes the caret; Space lifts it, →
       (or ↓) takes it straight to the quote, Space puts it on, ← takes
       it off the quote again and Escape puts it back where it was. It is
       this file's own path rather than dnd kit's keyboard sensor, whose
       arithmetic assumes a drop scrolls with the page: the total is a
       sticky card that does not, and the sensor's drop missed it at 834
       and 1440 (measured 2026-10-30).
     · BY PRESS: Add on the tile does the same in one press.

   THE GHOST NEVER COVERS THE WORDS IT IS DROPPED ON (the chandlery's
   must-change 3): it stands beside the pointer, never under it, so
   "Drop it here to put it on the quote" stays readable while a part is
   over it. Under reduced motion it lands without the drop's glide.
   ============================================================ */

/** The one place a part can be dropped: the quote, at its total. */
export const QUOTE_DROP = 'the-quote'

/** What a lifted part carries: how it is said, and the act that puts it on. */
export interface Carried {
  /** which part, so the keyboard's lift is this card's and no other's of the same name */
  id?: string
  name: string
  amount: number | null
  put: () => void
}

const said = (c: Carried | undefined): string =>
  c ? `${c.name}${c.amount === null ? '' : `, ${money(c.amount)}`}` : 'The part'

/** The words a reader hears at every turn of a drag, in the same sentences as the press. */
const ANNOUNCED: Announcements = {
  onDragStart: ({ active }) =>
    `${said(active.data.current as Carried | undefined)} is lifted. Press the right arrow to take it to the quote, Space to put it on, Escape to put it back where it was.`,
  onDragOver: ({ active, over }) =>
    over?.id === QUOTE_DROP
      ? `${said(active.data.current as Carried | undefined)} is over the quote. Space puts it on.`
      : `${said(active.data.current as Carried | undefined)} is not over the quote.`,
  onDragEnd: ({ active, over }) =>
    over?.id === QUOTE_DROP
      ? `${said(active.data.current as Carried | undefined)} is on the quote.`
      : `${said(active.data.current as Carried | undefined)} is back where it was.`,
  onDragCancel: ({ active }) =>
    `${said(active.data.current as Carried | undefined)} is back where it was.`,
}

export const DRAG_HOW =
  'Space lifts it, the right arrow takes it to the quote, Space puts it on, and Escape puts it back where it was. Or press Add.'

/** The pointer's own place first, then the overlap of the boxes — the keyboard has no pointer. */
const collides: CollisionDetection = (args) => {
  const under = pointerWithin(args)
  return under.length > 0 ? under : rectIntersection(args)
}

/** THE GHOST STANDS UP AND TO THE LEFT OF THE POINTER, its foot corner 12px off it, so what is
 *  under the pointer — the drop's own words — is never under the ghost. */
const besidePointer: Modifier = ({
  activatorEvent,
  activeNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (!activatorEvent || !activeNodeRect) return transform
  const start = getEventCoordinates(activatorEvent)
  if (!start || activatorEvent instanceof KeyboardEvent) return transform
  const ghost = overlayNodeRect ?? activeNodeRect
  return {
    ...transform,
    x: transform.x + (start.x - activeNodeRect.left) - ghost.width - 12,
    y: transform.y + (start.y - activeNodeRect.top) - ghost.height - 12,
  }
}

/** THE DRAG ITSELF, wrapped round everything a part can travel between: the chandlery and the
 *  quote's total. A drop anywhere else puts nothing on. */
export function PartDrag({ children }: { children: ReactNode }) {
  const [lifted, setLifted] = useState<Carried | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  /* THE KEYBOARD'S OWN LIFT: what is held, whether it is over the quote, and the sentence said */
  const [held, setHeld] = useState<Carried | null>(null)
  const [overByKey, setOverByKey] = useState(false)
  const [aloud, setAloud] = useState('')
  const keys = useMemo<KeyLift>(
    () => ({
      held,
      over: overByKey,
      lift: (c) => {
        setHeld(c)
        setOverByKey(false)
        setAloud(
          `${said(c)} is lifted. Press the right arrow to take it to the quote, Space to put it on, Escape to put it back where it was.`,
        )
      },
      toward: (quote) => {
        if (!held) return
        setOverByKey(quote)
        setAloud(
          quote
            ? `${said(held)} is over the quote. Space puts it on.`
            : `${said(held)} is not over the quote.`,
        )
      },
      drop: () => {
        if (!held) return
        if (overByKey) {
          held.put()
          setAloud(`${said(held)} is on the quote.`)
        } else setAloud(`${said(held)} is back where it was.`)
        setHeld(null)
        setOverByKey(false)
      },
      cancel: () => {
        if (!held) return
        setAloud(`${said(held)} is back where it was.`)
        setHeld(null)
        setOverByKey(false)
      },
    }),
    [held, overByKey],
  )
  const start = (event: DragStartEvent): void => {
    setLifted((event.active.data.current as Carried | undefined) ?? null)
  }
  const end = (event: DragEndEvent): void => {
    const carried = event.active.data.current as Carried | undefined
    setLifted(null)
    if (event.over?.id === QUOTE_DROP) carried?.put()
  }
  return (
    <KeyLiftContext value={keys}>
      <DndContext
        sensors={sensors}
        collisionDetection={collides}
        onDragStart={start}
        onDragEnd={end}
        onDragCancel={() => setLifted(null)}
        accessibility={{
          announcements: ANNOUNCED,
          screenReaderInstructions: { draggable: DRAG_HOW },
        }}
      >
        {children}
        <DragOverlay modifiers={[besidePointer]} dropAnimation={reducedMotion() ? null : undefined}>
          {lifted ? (
            <div className="cat-ghost">
              <span className="cat-ghost__name">{lifted.name}</span>
              {lifted.amount === null ? null : (
                <span className="cat-ghost__fig">{money(lifted.amount)}</span>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <output className="cat-aloud" aria-live="assertive">
        {aloud}
      </output>
    </KeyLiftContext>
  )
}

/** The keyboard's lift, shared by the grip that holds a part and the total it is put on. */
interface KeyLift {
  held: Carried | null
  over: boolean
  lift: (carried: Carried) => void
  toward: (quote: boolean) => void
  drop: () => void
  cancel: () => void
}
const NO_LIFT: KeyLift = {
  held: null,
  over: false,
  lift: () => {},
  toward: () => {},
  drop: () => {},
  cancel: () => {},
}
const KeyLiftContext = createContext<KeyLift>(NO_LIFT)

/** A part's tile, liftable: the pointer anywhere on it, the keyboard on its grip. */
export function usePart(id: string, carried: Carried, live: boolean) {
  const drag = useDraggable({ id: `part:${id}`, data: carried, disabled: !live })
  const { onPointerDown } = (drag.listeners ?? {}) as {
    onPointerDown?: (e: React.PointerEvent) => void
  }
  const keys = use(KeyLiftContext)
  const mine = keys.held !== null && keys.held.id === id
  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (!live) return
      const key = event.key
      if (!mine) {
        if (key === ' ' || key === 'Enter') {
          event.preventDefault()
          keys.lift({ ...carried, id })
        }
        return
      }
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        event.preventDefault()
        keys.toward(true)
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        event.preventDefault()
        keys.toward(false)
      } else if (key === ' ' || key === 'Enter') {
        event.preventDefault()
        keys.drop()
      } else if (key === 'Escape') {
        event.preventDefault()
        keys.cancel()
      }
    },
    [live, mine, keys, carried, id],
  )
  return {
    tile: {
      place: drag.setNodeRef,
      onPointerDown,
      'data-lifted': drag.isDragging || mine ? '' : undefined,
    },
    grip: { place: drag.setActivatorNodeRef, onKeyDown, 'aria-pressed': mine },
    lifted: drag.isDragging || mine,
  }
}

/** The quote's total as the place a part is dropped: whether one is lifted, and whether over it. */
export function useQuoteDrop() {
  const drop = useDroppable({ id: QUOTE_DROP })
  const { active } = useDndContext()
  const keys = use(KeyLiftContext)
  return {
    place: drop.setNodeRef,
    carrying: (active !== null && String(active.id).startsWith('part:')) || keys.held !== null,
    over: drop.isOver || (keys.held !== null && keys.over),
  }
}
