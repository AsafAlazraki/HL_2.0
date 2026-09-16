/* ============================================================
   THE ESCAPE PRECEDENCE LADDER, AS A PURE FUNCTION.

   Ported from the old shell's `stageKeys.ts` (HL_Playground, src/app):
   the ladder's logic and its reasons only. The old module also bound
   the ladder to a window listener and stopped Delete/Backspace at a
   stage root; both were that shell's machinery and stay behind. Where
   the old text says "stage", read "the surface a route draws".

   THE RESOLUTION ORDER, highest first. Nothing here is new machinery:
   each rung is a claim the code already makes, and this module only
   agrees to stand behind them.

     1. A WIDGET THAT OWNS THE KEYBOARD TAKES IT AND STOPS THE EVENT.
        A dialog, a popover, a menu, a select, a command palette all
        listen before the surface does and stop the keystroke. A menu
        closes and returns focus to the button that opened it; the
        keystroke never reaches us. Nothing below runs.

     2. A FIELD OWNS ITS OWN ESCAPE. A key typed into an input, a
        textarea, a select or a contenteditable belongs to that
        control — the same rule the sheet's own window-level handler
        has always applied, and `isField` below is lifted from it. This
        is what keeps a live cell editor's Escape meaning REVERT THIS
        EDIT: while a cell is being edited the focus is inside the
        cell's input, so the grid gets it and we do not. It is also
        what keeps Escape in a search box meaning "clear the search"
        rather than "throw the page away", which matters most on a
        quote, where nearly everything a person does is typing.

     3. AN EVENT THAT ARRIVES ALREADY HANDLED IS NOT OURS.
        `defaultPrevented` is the second half of the grid's claim:
        the grid answers Escape-while-editing with a cancel and calls
        `preventDefault()` before reverting. The grid deliberately
        lets that keystroke keep bubbling — something above may need
        to drop a copy marquee — so it arrives here flagged rather
        than absent.

     4. OTHERWISE THE SURFACE CLOSES. Bare Escape only: a modifier makes
        it somebody else's shortcut.

   The listener that binds this must run LAST — React dispatches its
   whole synthetic tree from one listener on the root container, so
   only `window` in the bubble phase is downstream of every widget and
   every field. That binding is a screen's, not this module's.
   ============================================================ */

/** One keydown, reduced to the four facts the order turns on. Nothing
 *  here is a DOM type, so the decision below is a pure function and has
 *  a test — the same shape `resolveKey` uses for the grid, and for the
 *  same reason: a precedence order nobody can exercise is a precedence
 *  order that drifts. */
export interface StageKey {
  key: string
  alt: boolean
  ctrl: boolean
  meta: boolean
  shift: boolean
  /** something nearer has already answered it — `defaultPrevented` */
  handled: boolean
  /** the focus is in an input, textarea, select or contenteditable */
  inField: boolean
}

/** THE ORDER, AS ONE EXPRESSION. Rung 1 is not here because it cannot
 *  be: a widget that stops the event means this is never called. */
export function closesStage(k: StageKey): boolean {
  if (k.key !== 'Escape') return false
  /* rung 4 — a modifier makes it somebody else's shortcut */
  if (k.alt || k.ctrl || k.meta || k.shift) return false
  /* rung 3 — the grid's cell editor has already answered this */
  if (k.handled) return false
  /* rung 2 — a field owns its own Escape */
  if (k.inField) return false
  return true
}

/** Rung 2's other half. Lifted from the sheet's own window-level
 *  handler, so a stage and the canvas underneath it agree about what a
 *  field is.
 *
 *  EXPORTED so that anything else asking the same question about a
 *  different event — a surface arriving must not take the focus out of
 *  a control somebody is typing into — means by "typing into" what
 *  Escape means three rungs above. Two definitions of a field is two
 *  answers to the same question. */
export function isField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/** Reduce a real keydown to the facts the ladder turns on. */
export function stageKeyOf(e: KeyboardEvent): StageKey {
  return {
    key: e.key,
    alt: e.altKey,
    ctrl: e.ctrlKey,
    meta: e.metaKey,
    shift: e.shiftKey,
    handled: e.defaultPrevented,
    inField: isField(e.target),
  }
}
