/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs
   INSIDE the page: Playwright serialises it and evaluates it with no closure, so its helpers
   cannot be hoisted out of it without breaking at runtime. */
import type { Page } from '@playwright/test'

/* ============================================================
   focus — every control a keyboard reaches shows that it is there.

   WHY THIS FILE EXISTS. The components critique of 2026-09-28 pressed
   Tab through the built app and found, with `:focus-visible` true, no
   ring at all on the build's option rows, the picker's maker rail,
   Customers' quotes, the refused "Give it to the customer" and /kit's
   refused accents. The cause was three one-line cascade errors in
   src/ui: a later `box-shadow: none` at the ring's own specificity. No
   ruler had ever pressed Tab, so the five rulers read those screens
   clean — and the controls the refusal rule keeps focusable, so that
   their sentence can be reached, were exactly the ones that lost it.

   WHAT IT READS. The walk presses Tab, as a person does, from wherever
   the screen leaves the caret round to where it began. At every stop
   that matches `:focus-visible` it reads the LOOK of the control, and
   when Tab moves on it reads the same look again, unfocused, with every
   CSS transition finished so neither reading is a frame in between. A
   control passes when focus CHANGED a ring: an outline, a box-shadow
   or a border, visible in the focused reading, on the control itself,
   its ::before or ::after, one of its three nearest ancestors (a frame,
   or the label a visually hidden radio draws its ring on) or one of its
   children.

   WHY A CHANGE AND NOT A PRESENCE. A card wears a hairline and its
   plate's shadow at rest. Had the refused card's hairline won over the
   ring — the critique's own cascade error, on a card — a ruler asking
   "is there a box-shadow?" would read the hairline and pass it. Focus
   is shown only by what focus changes.

   WHAT IT DOES NOT READ. Whether the ring is clipped by a scroller, or
   painted under a neighbour, is a matter of pixels this reading does
   not take; the owner's eye and the shots are that ruler. A control
   the walk never reaches — one inside a closed chapter — is not read,
   and the walk says how many stops it made so an empty walk is red.
   `fixture.spec.ts` plants the critique's error, and the hairline that
   hides it, beside three rings that must pass.
   ============================================================ */

export interface Stop {
  /** What a reader is told, or the control's own words. */
  name: string
  tag: string
  cls: string
}

export interface FocusWalk {
  /** Tab presses that landed on a control. */
  stops: number
  /** Of those, the ones `:focus-visible` matched, which are the ones owed a ring. */
  owed: number
  /** Controls that were read focused and again unfocused. */
  read: number
  /** Controls whose focused look changed no ring. */
  fails: Stop[]
  /** The name of every control read both ways, so a walk can be held to having reached one. */
  names: string[]
  /** Controls that left the page before they could be read unfocused. */
  gone: number
  /** True when the walk came back round to where it began; false when it ran out of presses. */
  cycled: boolean
}

interface StepResult {
  /** The control now focused, or null when focus has left every control. */
  at: Stop | null
  /** True when the control now focused has been visited before. */
  again: boolean
  owed: boolean
  /** The verdict on the control focus has just left, when there was one. */
  left: { stop: Stop; ring: boolean } | { gone: true } | null
}

/**
 * One step of the walk, IN THE PAGE: read the control focus has just left, unfocused, against
 * the look it was read with while focused; then read the control that has it now.
 */
export function focusStep(): StepResult {
  type Edge = { outline: string; shadow: string; border: string; shows: boolean }
  const w = window as unknown as {
    hl2FocusWalk?: {
      prev: Element | null
      prevLook: Edge[]
      prevStop: Stop | null
      seen: Set<Element>
    }
  }
  const state = (w.hl2FocusWalk ??= { prev: null, prevLook: [], prevStop: null, seen: new Set() })

  /* every CSS transition to its end, so neither reading is a frame of the ring arriving */
  for (const a of document.getAnimations())
    if (a instanceof CSSTransition)
      try {
        a.finish()
      } catch {
        /* a transition that cannot finish is still read where it stands */
      }

  const transparent = (c: string): boolean =>
    c === 'transparent' || /rgba?\([^)]*,\s*0\)$/.test(c) || /\/\s*0\)$/.test(c)

  const edgeOf = (cs: CSSStyleDeclaration): Edge => {
    const outline = `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} ${cs.outlineOffset}`
    const shadow = cs.boxShadow
    const sides = ['top', 'right', 'bottom', 'left'].map((side) => ({
      style: cs.getPropertyValue(`border-${side}-style`),
      width: cs.getPropertyValue(`border-${side}-width`),
      color: cs.getPropertyValue(`border-${side}-color`),
    }))
    const border = sides.map((b) => `${b.style} ${b.width} ${b.color}`).join('|')
    const outlines =
      cs.outlineStyle !== 'none' &&
      (cs.outlineStyle === 'auto' || Number.parseFloat(cs.outlineWidth) > 0) &&
      !transparent(cs.outlineColor)
    const shadows = shadow !== 'none' && shadow !== ''
    const borders = sides.some(
      (b) => b.style !== 'none' && Number.parseFloat(b.width) > 0 && !transparent(b.color),
    )
    return { outline, shadow, border, shows: outlines || shadows || borders }
  }

  /* the control, its two pseudo-elements, its three nearest ancestors and its children:
     everywhere a primitive or a screen draws the ring a keyboard is owed */
  const lookOf = (el: Element): Edge[] => {
    const look: Edge[] = [
      edgeOf(getComputedStyle(el)),
      edgeOf(getComputedStyle(el, '::before')),
      edgeOf(getComputedStyle(el, '::after')),
    ]
    let up = el.parentElement
    for (let i = 0; i < 3 && up; i++, up = up.parentElement) look.push(edgeOf(getComputedStyle(up)))
    for (const child of [...el.children].slice(0, 12)) look.push(edgeOf(getComputedStyle(child)))
    return look
  }

  const stopOf = (el: Element): Stop => ({
    name: (el.getAttribute('aria-label') ?? (el as HTMLElement).innerText ?? el.textContent ?? '')
      .replaceAll(/\s+/g, ' ')
      .trim()
      .slice(0, 80),
    tag: el.tagName.toLowerCase(),
    cls: typeof el.className === 'string' ? (el.className.split(/\s+/)[0] ?? '') : '',
  })

  const active = document.activeElement
  const at =
    active && active !== document.body && active !== document.documentElement ? active : null

  /* THE CONTROL JUST LEFT, read unfocused */
  let left: StepResult['left'] = null
  if (state.prev && state.prev !== at && state.prevStop) {
    if (!state.prev.isConnected) left = { gone: true }
    else {
      const rest = lookOf(state.prev)
      const focused = state.prevLook
      /* index by index: the control, its pseudo-elements and its ancestors always line up;
         a child that came or went with focus is simply not compared */
      const ring = focused.some((f, i) => {
        const r = rest[i]
        return (
          r !== undefined &&
          f.shows &&
          (f.outline !== r.outline || f.shadow !== r.shadow || f.border !== r.border)
        )
      })
      left = { stop: state.prevStop, ring }
    }
    state.prev = null
    state.prevStop = null
    state.prevLook = []
  }

  if (!at) return { at: null, again: false, owed: false, left }
  const again = state.seen.has(at)
  state.seen.add(at)
  const owed = at.matches(':focus-visible')
  if (owed && !again) {
    state.prev = at
    state.prevStop = stopOf(at)
    state.prevLook = lookOf(at)
  }
  return { at: stopOf(at), again, owed, left }
}

/**
 * Walk the page by Tab, from where the caret is round to where it began, and read every
 * control it lands on. `presses` is a ceiling, not a target: a walk that reaches it says so
 * (`cycled: false`) rather than claiming the whole page.
 */
export async function walkFocus(page: Page, presses = 250): Promise<FocusWalk> {
  await page.evaluate(() => {
    delete (window as unknown as { hl2FocusWalk?: unknown }).hl2FocusWalk
  })
  const walk: FocusWalk = {
    stops: 0,
    owed: 0,
    read: 0,
    fails: [],
    names: [],
    gone: 0,
    cycled: false,
  }
  let nowhere = 0
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab')
    const r = await page.evaluate(focusStep)
    if (r.left && 'gone' in r.left) walk.gone++
    else if (r.left) {
      walk.read++
      walk.names.push(r.left.stop.name)
      if (!r.left.ring) walk.fails.push(r.left.stop)
    }
    if (r.again) {
      walk.cycled = true
      break
    }
    if (r.at) {
      nowhere = 0
      walk.stops++
      if (r.owed) walk.owed++
    } else if (++nowhere === 2) {
      /* twice on no control at all: the page has nothing further a keyboard reaches */
      walk.cycled = true
      break
    }
  }
  return walk
}
