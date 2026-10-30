/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- the measuring functions below run
   INSIDE the page: Playwright serialises them and evaluates them with no closure, so their
   helpers cannot be hoisted out of them without breaking at runtime. */
import type { Page } from '@playwright/test'

/* ============================================================
   overlap — nothing a person can see is painted over anything else
   a person needs to see, in any state a person scrolls the screen to.

   REWRITTEN 2026-10-20, BECAUSE THE FIRST RULER WAS BLIND WHERE OVERLAP
   HAPPENS. Until this date it set aside every element that was
   `position: absolute`, `fixed` or `sticky`, and every descendant of
   one — the shell's pill, every sticky head, the build's stage and
   masthead, every panel — and it measured once, at 1440, scrolled to
   the top, and only text against text. The build's two sticky bars
   overlapped by 33px while it was green (built-critique-m2.md §8): at
   rest neither bar is stuck, so they are not even near each other, and
   both were set aside anyway. The pill, `fixed`, could cover a word on
   every screen and never be in a pair. The owner, 2026-09-24: "seeing
   overlap of info and things on some screens".

   WHAT IS MEASURED NOW, in four kinds of thing a person sees:

     - RUNS OF TEXT — each line of an element's OWN text, as the em box
       its glyphs stand in: the line's rect, trimmed to one font-size
       tall about its middle. The element's whole box is not the text:
       a block 1,000px wide holding "Hull" is four letters, not a wall.
       A figure drawn in a shadow root (NumberFlow's digits) is one run,
       its host's box, because it has no text in the page to read.
     - CONTROLS — buttons, links, fields, selects and every ARIA role a
       person presses or types into.
     - PICTURES — img, video, canvas, svg and role="img".
     - CHROME — anything `position: fixed`, and anything
       `position: sticky` that is STUCK (standing at its `top` or
       `bottom` against its scrollport). A sticky head at its natural
       place is just content that has not been scrolled yet; once it is
       stuck it is chrome, and everything under it moves while it stays.
       Horizontal stickiness (a frozen first column) moves with the page
       vertically and is content for this ruler.

   WHAT IS A FAILURE, six ways:

     1. text over text — two runs of text from elements neither of which
        holds the other.
     2. control over control — two controls' boxes, neither inside the
        other.
     3. control over text — a control's box over a run of text that is
        neither inside the control nor holding it.
     4. text over picture — a run of text over a picture, with no ground
        behind the text: no element that paints one (a background at
        half opacity or more, a gradient, or a backdrop blur) covering
        the run without also holding the picture.
     5. chrome over content — chrome painted over a run of text, a
        control or a picture the page CANNOT SCROLL OUT FROM UNDER IT.
        Content passing under a sticky head while a person scrolls is
        what a sticky head is for; content that stays under it at the
        top of the page (or under a foot at the end of it) is content
        nobody can read. So the ruler asks the scrollers between the
        content and the chrome how far they can still move it, down
        (they were scrolled past it) and up (there is more below), and
        passes the pair only if one of those moves carries the strip the
        chrome covers clear of it AND still inside the port it scrolls in
        (the window, or its own scroller's box): a line under the pill at
        the top of a page cannot come down, and going up it leaves the
        screen; a photograph 50px under the pill one window down comes
        back with a 50px scroll.
        AND SEE-THROUGH CHROME FAILS IN ANY STATE: chrome whose words,
        controls or pictures stand over the page's with none of its own
        ground behind them collides wherever the page is scrolled to.
     6. chrome over chrome — two pieces of chrome where what the lower
        one shows (its text, its controls, its pictures) is under what
        the upper one paints. The pill floating over a masthead's empty
        ground is the design; the build's find band slid 33px under its
        masthead is the defect. Which one is on top is read off
        `z-index`, then document order — an approximation of the paint
        order, written down because it is one.

   WHAT IS SET ASIDE, and only this:

     - what a person OPENED ON PURPOSE and closes: a modal, a popover,
       and a dialog, alertdialog, menu, listbox or tooltip, or anything
       with [open] or named by an [aria-expanded="true"] control's
       aria-controls — WHEN IT FLOATS (it or its parent is absolute or
       fixed, or it is in the top layer). Something opened INTO the flow
       — a chapter, a details — pushes the page aside, covers nothing,
       and is measured like any content.
     - decoration marked aria-hidden="true", and everything in it — the
       shapes, the icons, the water. NOT the words in it: a count on a
       door or a key hint is hidden from a screen reader because its
       name is said elsewhere, and it is still a word on the screen.
     - what cannot be seen: visibility hidden, an opacity under 0.05 on
       it or an ancestor, a box under 2px, and whatever an overflow
       ancestor or the window clips away. A run of text scrolled out of
       its list is not covered by the pill hovering where it would be.

   A PIXEL OF TOUCH IS NOT OVERLAP. Every failure needs an intersection
   of MORE THAN 2px on BOTH axes (`TOUCH`), and a scroller that falls
   short of freeing content by 2px or less has freed it. Two adjacent
   boxes sharing a subpixel edge, a focus ring's anti-aliasing, a
   rounding of half a pixel either side, are layout, not a defect. The
   25%-of-the-smaller-box floor the first ruler had is gone: it existed
   because whole element boxes overlapped by design, and em boxes do not.

   AND IN EVERY STATE: `overlapsInEveryState` reads the screen at rest,
   at every half window down and at the end of the page, and the same
   inside the screen's own main scroller where it scrolls in a box —
   because a sticky head only sticks after a scroll, and a foot only
   covers the last line at the end.

   STRENGTHENED AGAIN 2026-10-21 (refine-2), for the two ways the cold
   critique of the refinement round (docs/directions/refine-critique.md,
   "Why the gate missed it") showed it still passed what the owner sees:

     - A SEE-THROUGH GROUND IS NOT A GROUND FOR CHROME. A bar whose foot
       is a gradient falling to nothing, or a blur with no ground of its
       own, shows the words passing under it half-faded and cut — the
       build's search band, the masthead in a hand, the picker's caps.
       This ruler counted any gradient or blur as ground, so all of them
       passed as content a scroll would free. Chrome's ground is now
       read as SOLID (a colour at half opacity or more, a picture, or a
       gradient every stop of which is) or as a VEIL (a gradient with a
       see-through stop, a blur over less than half a colour, or a
       ground faded by a gradient mask), and a run of text, a control
       or a picture under a veil that no solid ground of the same chrome
       covers is a failure in any state: no scroll makes a word legible
       while it passes through glass. A scrim on a photograph is still
       ground for the words standing on it (kind 4): that is what a
       scrim is for, and the contrast ruler reads it. A veil drawn by a
       pseudo-element (::before, ::after) is not an element and is not
       read: the shell's own scroll edge under the pill at a desk is one.
     - THREE SCROLL POSITIONS MISSED THE SEAMS BETWEEN THEM. A sticky
       band's foot moves over different words at every position, so the
       walk now reads every half window, not one window and the end.

   The measurement is a module rather than a closure inside the spec so
   that `fixture.spec.ts` can hand it a page with each failure planted
   on it, next to its near miss.
   ============================================================ */

/** The tolerance, in CSS pixels, on both axes. Repeated inside `findOverlaps` (it runs with
 *  no closure); `fixture.spec.ts` proves the two agree by planting 2px and 3px. */
export const TOUCH = 2

export type Kind =
  | 'text over text'
  | 'control over control'
  | 'control over text'
  | 'text over picture'
  | 'chrome over content'
  | 'chrome over chrome'

export interface Pair {
  kind: Kind
  a: string
  b: string
  /** the intersection, in CSS pixels */
  w: number
  h: number
  area: number
  /** for chrome over content: how far the content would have to move, and how far it can */
  note?: string
}

export interface Overlaps {
  /** runs of text compared (elements with text of their own, on screen) */
  leaves: number
  controls: number
  pictures: number
  /** pieces of chrome: fixed, or sticky and stuck */
  chrome: number
  /** elements set aside as opened layers or aria-hidden decoration */
  aside: number
  pairs: Pair[]
}

export function findOverlaps(): Overlaps {
  const TOL = 2
  const de = document.documentElement
  const vw = de.clientWidth
  const vh = de.clientHeight
  interface Box {
    l: number
    t: number
    r: number
    b: number
  }
  const VIEW: Box = { l: 0, t: 0, r: vw, b: vh }
  const meet = (a: Box, b: Box): Box => ({
    l: Math.max(a.l, b.l),
    t: Math.max(a.t, b.t),
    r: Math.min(a.r, b.r),
    b: Math.min(a.b, b.b),
  })
  const boxOf = (r: DOMRect): Box => ({ l: r.left, t: r.top, r: r.right, b: r.bottom })
  const real = (x: Box): boolean => x.r - x.l >= 2 && x.b - x.t >= 2

  const styles = new Map<Element, CSSStyleDeclaration>()
  const st = (el: Element): CSSStyleDeclaration => {
    let s = styles.get(el)
    if (!s) {
      s = getComputedStyle(el)
      styles.set(el, s)
    }
    return s
  }
  const px = (v: string): number => Number.parseFloat(v) || 0
  const alpha = (c: string): number => {
    if (c === 'transparent') return 0
    const slash = /\/\s*([\d.]+)(%?)\s*\)$/.exec(c)
    if (slash) return slash[2] ? Number(slash[1]) / 100 : Number(slash[1])
    const rgba = /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/.exec(c)
    if (rgba) return Number(rgba[1])
    return 1
  }
  /** a gradient with any stop a person can see through */
  const seeThroughStops = (image: string): boolean =>
    (
      image.match(/transparent|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/g) || []
    ).some((c) => alpha(c) < 0.5)
  /** WHAT AN ELEMENT PAINTS UNDER WHAT STANDS ON IT: a SOLID ground that hides what is under
   *  it, a VEIL that shows it faded or blurred (refine-2), or nothing */
  const groundOf = (el: Element): 'solid' | 'veil' | null => {
    const s = st(el)
    const image = s.backgroundImage
    const picture = /url\(/.test(image)
    const imageSolid = image !== 'none' && (picture || !seeThroughStops(image))
    const blur = !!s.backdropFilter && s.backdropFilter !== 'none'
    const mask = s.maskImage || s.getPropertyValue('-webkit-mask-image') || 'none'
    const faded = /gradient/.test(mask)
    const colour = alpha(s.backgroundColor) >= 0.5
    if (!faded && (colour || imageSolid)) return 'solid'
    if (colour || image !== 'none' || blur) return 'veil'
    return null
  }
  const isRoot = (el: Element): boolean => el === de || el === document.body

  /* ---- clipping: what of a box the window and its overflow ancestors let through ---- */
  const clipsContents = (el: Element): boolean => {
    if (isRoot(el)) return false
    const s = st(el)
    if (s.display === 'inline' || s.display === 'contents') return false
    return (
      s.overflowX !== 'visible' ||
      s.overflowY !== 'visible' ||
      /paint|strict|content/.test(s.contain)
    )
  }
  const paddingBox = (el: Element): Box => {
    const r = el.getBoundingClientRect()
    const s = st(el)
    const l = r.left + px(s.borderLeftWidth)
    const t = r.top + px(s.borderTopWidth)
    return { l, t, r: l + el.clientWidth, b: t + el.clientHeight }
  }
  const contentClips = new Map<Element, Box>()
  const boxClip = (el: Element): Box => {
    if (st(el).position === 'fixed') return VIEW
    const p = el.parentElement
    return p ? contentClip(p) : VIEW
  }
  const contentClip = (el: Element): Box => {
    const known = contentClips.get(el)
    if (known) return known
    let c = boxClip(el)
    if (clipsContents(el)) c = meet(c, paddingBox(el))
    contentClips.set(el, c)
    return c
  }

  /* ---- what is set aside, and what is chrome ---- */
  const expanded = new Set<Element>()
  for (const t of document.querySelectorAll('[aria-expanded="true"][aria-controls]')) {
    for (const id of (t.getAttribute('aria-controls') || '').split(/\s+/)) {
      const target = id ? document.getElementById(id) : null
      if (target) expanded.add(target)
    }
  }
  const matches = (el: Element, sel: string): boolean => {
    try {
      return el.matches(sel)
    } catch {
      return false
    }
  }
  const floatsByItself = (el: Element): boolean => {
    const p = st(el).position
    return p === 'absolute' || p === 'fixed'
  }
  const OPENED_ROLES = new Set(['dialog', 'alertdialog', 'menu', 'listbox', 'tooltip'])
  const opened = (el: Element): boolean => {
    if (matches(el, ':modal') || matches(el, ':popover-open')) return true
    const named =
      OPENED_ROLES.has(el.getAttribute('role') || '') ||
      el.tagName === 'DIALOG' ||
      el.hasAttribute('open') ||
      expanded.has(el)
    if (!named || el.tagName === 'DETAILS') return false
    return floatsByItself(el) || (!!el.parentElement && floatsByItself(el.parentElement))
  }
  /** the scrollport a sticky element sticks against: the nearest ancestor that clips */
  const stickyPort = (el: Element): Box => {
    for (let n = el.parentElement; n && !isRoot(n); n = n.parentElement) {
      const s = st(n)
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') return paddingBox(n)
    }
    return VIEW
  }
  const stuck = (el: Element): boolean => {
    const s = st(el)
    const r = el.getBoundingClientRect()
    const port = stickyPort(el)
    if (s.top !== 'auto' && Math.abs(r.top - (port.t + px(s.top))) <= 1) return true
    if (s.bottom !== 'auto' && Math.abs(r.bottom - (port.b - px(s.bottom))) <= 1) return true
    return false
  }
  interface Ctx {
    faint: boolean
    aside: boolean
    hidden: boolean
    chrome: Element | null
  }
  const ctxs = new Map<Element, Ctx>()
  const ctxOf = (el: Element): Ctx => {
    const known = ctxs.get(el)
    if (known) return known
    const up: Ctx = el.parentElement
      ? ctxOf(el.parentElement)
      : { faint: false, aside: false, hidden: false, chrome: null }
    const s = st(el)
    let chrome = up.chrome
    if (!chrome && (s.position === 'fixed' || (s.position === 'sticky' && stuck(el)))) chrome = el
    const c: Ctx = {
      faint: up.faint || Number.parseFloat(s.opacity) < 0.05,
      aside: up.aside || opened(el),
      hidden: up.hidden || el.getAttribute('aria-hidden') === 'true',
      chrome,
    }
    ctxs.set(el, c)
    return c
  }

  /* ---- describing a thing so a reader can find it ---- */
  const ownText = (el: Element): string => {
    let s = ''
    for (const n of el.childNodes) if (n.nodeType === 3) s += (n as Text).data
    return s.replaceAll(/\s+/g, ' ').trim()
  }
  const describe = (el: Element): string => {
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/)[0] || ''
    const words =
      ownText(el) ||
      el.getAttribute('aria-label') ||
      el.getAttribute('alt') ||
      (el.textContent || '').replaceAll(/\s+/g, ' ').trim()
    return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''} "${words.slice(0, 40)}"`
  }

  /* ---- the things a person sees ---- */
  type Sort = 'text' | 'control' | 'picture'
  interface Item {
    el: Element
    sort: Sort
    boxes: Box[]
    layer: Element | null
  }
  const CONTROL = [
    'button',
    'a[href]',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    'summary',
    ...[
      'button',
      'link',
      'tab',
      'switch',
      'checkbox',
      'radio',
      'option',
      'menuitem',
      'combobox',
      'slider',
      'spinbutton',
      'textbox',
    ].map((r) => `[role="${r}"]`),
  ].join(',')
  const PICTURE = 'img, video, canvas, svg, [role="img"]'

  const items: Item[] = []
  const grounds: { el: Element; box: Box }[] = []
  const chromeSolids = new Map<
    Element,
    { el: Element; box: Box; ground: boolean; veil?: boolean }[]
  >()
  let aside = 0
  for (const el of document.querySelectorAll('body *')) {
    /* a shape inside a drawing is the drawing; only its <text> is read, as text */
    if (el.parentElement?.closest('svg') && el.tagName !== 'text' && el.tagName !== 'svg') continue
    const text = ownText(el)
    /* a figure drawn in a shadow root (NumberFlow's digits) has no text of its own in the page;
       its host is read as one run of text, its box */
    const figure = !text && !!el.shadowRoot && el.tagName.includes('-')
    const sort: Sort | null = matches(el, CONTROL)
      ? 'control'
      : matches(el, PICTURE)
        ? 'picture'
        : text || figure
          ? 'text'
          : null
    /* a veil is ground for the words standing on a photograph (kind 4), where a scrim is
       exactly the ground they were given; for chrome it is remembered as a veil (kind 5) */
    const paints = groundOf(el)
    const ground = paints !== null
    if (!sort && !ground) continue
    const s = st(el)
    if (s.visibility === 'hidden' || s.display === 'none') continue
    const ctx = ctxOf(el)
    if (ctx.faint) continue
    /* aria-hidden sets aside DECORATION: a shape, an icon, the water. Words a person can read
       that are hidden from a screen reader because the name is said elsewhere (a count on a
       door, a key hint) are still words on the screen, and are measured */
    if (ctx.aside || (ctx.hidden && sort !== 'text')) {
      if (sort) aside++
      continue
    }
    const clip = boxClip(el)
    const own = meet(boxOf(el.getBoundingClientRect()), clip)
    if (ground && real(own)) {
      grounds.push({ el, box: own })
      if (ctx.chrome) {
        const list = chromeSolids.get(ctx.chrome) || []
        list.push(
          paints === 'veil'
            ? { el, box: own, ground: false, veil: true }
            : { el, box: own, ground: true },
        )
        chromeSolids.set(ctx.chrome, list)
      }
    }
    const add = (sortOf: Sort, boxes: Box[]): void => {
      if (boxes.length === 0) return
      items.push({ el, sort: sortOf, boxes, layer: ctx.chrome })
      if (ctx.chrome) {
        const list = chromeSolids.get(ctx.chrome) || []
        for (const box of boxes) list.push({ el, box, ground: false })
        chromeSolids.set(ctx.chrome, list)
      }
    }
    if (sort === 'picture' && real(own)) add(sort, [own])
    /* a control by its fragments: a link that wraps is two boxes, not the rectangle round
       both lines — and a control's box stands for its own words against everything else */
    if (sort === 'control') {
      /* an inline control (a link in a sentence) is its words, so it is trimmed to the em
         box the way a run of text is; a block or a button keeps the box a person presses */
      const fs = px(s.fontSize)
      const inline = s.display === 'inline'
      const boxes: Box[] = []
      for (const r of el.getClientRects()) {
        const trim = inline && r.height > fs ? (r.height - fs) / 2 : 0
        const b = meet({ l: r.left, t: r.top + trim, r: r.right, b: r.bottom - trim }, clip)
        if (real(b)) boxes.push(b)
      }
      add(sort, boxes)
    }
    if (sort === 'text') {
      const fs = px(s.fontSize)
      const inside = contentClip(el)
      const runs: Box[] = []
      if (figure) {
        const r = el.getBoundingClientRect()
        const trim = r.height > fs ? (r.height - fs) / 2 : 0
        const em = meet({ l: r.left, t: r.top + trim, r: r.right, b: r.bottom - trim }, inside)
        if (real(em)) runs.push(em)
      }
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !(n as Text).data.trim()) continue
        const range = document.createRange()
        range.selectNodeContents(n)
        for (const r of range.getClientRects()) {
          if (r.width < 1) continue
          const trim = r.height > fs ? (r.height - fs) / 2 : 0
          const em = meet({ l: r.left, t: r.top + trim, r: r.right, b: r.bottom - trim }, inside)
          if (real(em)) runs.push(em)
        }
      }
      add('text', runs)
    }
  }

  /* ---- the pairs ---- */
  const cross = (a: Box, b: Box): { w: number; h: number } => ({
    w: Math.min(a.r, b.r) - Math.max(a.l, b.l),
    h: Math.min(a.b, b.b) - Math.max(a.t, b.t),
  })
  const worst = new Map<string, Pair>()
  const report = (key: string, p: Pair): void => {
    const was = worst.get(key)
    if (!was || was.area < p.area) worst.set(key, p)
  }
  const ids = new Map<Element, number>()
  const id = (el: Element): number => {
    let n = ids.get(el)
    if (n === undefined) {
      n = ids.size
      ids.set(el, n)
    }
    return n
  }
  const related = (a: Element, b: Element): boolean => a.contains(b) || b.contains(a)
  const grounded = (text: Element, run: Box, picture: Element): boolean =>
    grounds.some(
      (g) =>
        g.el !== picture &&
        !g.el.contains(picture) &&
        !picture.contains(g.el) &&
        (g.el === text || g.el.contains(text) || !text.contains(g.el)) &&
        g.box.l <= run.l + 1 &&
        g.box.t <= run.t + 1 &&
        g.box.r >= run.r - 1 &&
        g.box.b >= run.b - 1,
    )

  /* 1–4: within one layer (the page's flow, or one piece of chrome) */
  for (let i = 0; i < items.length; i++) {
    const a = items[i]!
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j]!
      if (a.layer !== b.layer) continue
      if (a.sort === 'picture' && b.sort === 'picture') continue
      if (a.sort === 'control' && b.sort === 'picture') continue
      if (a.sort === 'picture' && b.sort === 'control') continue
      if (related(a.el, b.el)) continue
      const kind: Kind =
        a.sort === 'text' && b.sort === 'text'
          ? 'text over text'
          : a.sort === 'control' && b.sort === 'control'
            ? 'control over control'
            : a.sort === 'picture' || b.sort === 'picture'
              ? 'text over picture'
              : 'control over text'
      const [first, second] =
        kind === 'control over text' && a.sort === 'text'
          ? [b, a]
          : kind === 'text over picture' && a.sort === 'picture'
            ? [b, a]
            : [a, b]
      for (const x of first.boxes) {
        for (const y of second.boxes) {
          const { w, h } = cross(x, y)
          if (w <= TOL || h <= TOL) continue
          if (kind === 'text over picture' && grounded(first.el, x, second.el)) continue
          report(`${kind}|${id(first.el)}|${id(second.el)}`, {
            kind,
            a: describe(first.el),
            b: describe(second.el),
            w: Math.round(w),
            h: Math.round(h),
            area: Math.round(w * h),
          })
        }
      }
    }
  }

  /* 5: chrome over content a person cannot scroll out from under it */
  const scrollsY = (el: Element): boolean => {
    const s = st(el)
    return (
      (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1
    )
  }
  const page = document.scrollingElement || de
  const pageRoom = Math.max(0, page.scrollHeight - innerHeight)
  /** how far the scrollers between `el` and `chrome` can still move `el`: down (it was
   *  scrolled up past) and up (there is more below) */
  const room = (el: Element, chrome: Element): { down: number; up: number } => {
    const fixed = st(chrome).position === 'fixed'
    let stop: Element | null = null
    if (!fixed) {
      for (let n = chrome.parentElement; n && !isRoot(n); n = n.parentElement) {
        const s = st(n)
        if (s.overflowX !== 'visible' || s.overflowY !== 'visible') {
          stop = n
          break
        }
      }
    }
    let down = 0
    let up = 0
    for (let n = el.parentElement; n && !isRoot(n); n = n.parentElement) {
      if (scrollsY(n)) {
        down += n.scrollTop
        up += n.scrollHeight - n.clientHeight - n.scrollTop
      }
      if (n === stop) return { down, up }
    }
    down += page.scrollTop
    up += Math.max(0, pageRoom - page.scrollTop)
    return { down, up }
  }
  /** where a thing can be seen once scrolled: its nearest scroller's port, else the window */
  const portOf = (el: Element): Box => {
    for (let n = el.parentElement; n && !isRoot(n); n = n.parentElement) {
      if (scrollsY(n)) return contentClip(n)
    }
    return VIEW
  }
  const z = (el: Element): number => {
    const v = Number.parseInt(st(el).zIndex, 10)
    return Number.isNaN(v) ? 0 : v
  }
  const roots = [...chromeSolids.keys()]
  for (const item of items) {
    if (item.layer) continue
    for (const chrome of roots) {
      if (related(item.el, chrome)) continue
      for (const box of item.boxes) {
        for (const solid of chromeSolids.get(chrome)!) {
          const { w, h } = cross(box, solid.box)
          if (w <= TOL || h <= TOL) continue
          /* A VEIL (refine-2): the chrome's see-through foot over the page's words, with no
             solid ground of the same chrome over that strip — they show through it faded and
             cut wherever they pass, so no scroll is an answer */
          if (solid.veil) {
            const strip = meet(box, solid.box)
            const hidden = chromeSolids
              .get(chrome)!
              .some(
                (g) =>
                  g.ground &&
                  g.box.l <= strip.l + 1 &&
                  g.box.t <= strip.t + 1 &&
                  g.box.r >= strip.r - 1 &&
                  g.box.b >= strip.b - 1,
              )
            if (!hidden) {
              report(`veil|${id(chrome)}|${id(item.el)}`, {
                kind: 'chrome over content',
                a: describe(solid.el),
                b: `${item.sort} ${describe(item.el)}`,
                w: Math.round(w),
                h: Math.round(h),
                area: Math.round(w * h),
                note: 'seen through its see-through ground',
              })
            }
            continue
          }
          /* SEE-THROUGH CHROME: the chrome's own words or controls drawn straight over the
             page's, with none of its own ground behind them, collide wherever the page is
             scrolled to — no scroll makes that legible while it passes */
          const bare =
            !solid.ground &&
            !chromeSolids
              .get(chrome)!
              .some(
                (g) =>
                  g.ground &&
                  g.box.l <= solid.box.l + 1 &&
                  g.box.t <= solid.box.t + 1 &&
                  g.box.r >= solid.box.r - 1 &&
                  g.box.b >= solid.box.b - 1,
              )
          if (bare) {
            report(`chrome|${id(chrome)}|${id(item.el)}`, {
              kind: 'chrome over content',
              a: describe(solid.el),
              b: `${item.sort} ${describe(item.el)}`,
              w: Math.round(w),
              h: Math.round(h),
              area: Math.round(w * h),
              note: 'drawn over it with no ground of its own',
            })
            continue
          }
          /* OUT FROM UNDER IT, INTO VIEW: the strip the chrome covers, moved down past the
             chrome's foot or up past its head, by scrollers that still have that much room,
             landing inside the port it scrolls in (the window, or its own scroller's box) */
          const can = room(item.el, chrome)
          const seen = portOf(item.el)
          const top = Math.max(box.t, solid.box.t)
          const bottom = Math.min(box.b, solid.box.b)
          const down = solid.box.b - top
          const up = bottom - solid.box.t
          const downOK = can.down + TOL >= down && solid.box.b + (bottom - top) <= seen.b + TOL
          const upOK = can.up + TOL >= up && solid.box.t - (bottom - top) >= seen.t - TOL
          if (downOK || upOK) continue
          report(`chrome|${id(chrome)}|${id(item.el)}`, {
            kind: 'chrome over content',
            a: describe(solid.el),
            b: `${item.sort} ${describe(item.el)}`,
            w: Math.round(w),
            h: Math.round(h),
            area: Math.round(w * h),
            note: `cannot be scrolled out: it needs ${Math.round(down)}px down or ${Math.round(up)}px up, and the page can move it ${Math.round(can.down)}px down and ${Math.round(can.up)}px up`,
          })
        }
      }
    }
  }

  /* 6: chrome over chrome — what the lower one shows, under what the upper one paints */
  for (let i = 0; i < roots.length; i++) {
    for (let j = i + 1; j < roots.length; j++) {
      const p = roots[i]!
      const q = roots[j]!
      if (related(p, q)) continue
      const pAbove =
        z(p) !== z(q)
          ? z(p) > z(q)
          : !!(p.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_PRECEDING)
      const [upper, lower] = pAbove ? [p, q] : [q, p]
      for (const item of items) {
        if (item.layer !== lower) continue
        for (const box of item.boxes) {
          for (const solid of chromeSolids.get(upper)!) {
            const { w, h } = cross(box, solid.box)
            if (w <= TOL || h <= TOL) continue
            report(`chrome2|${id(upper)}|${id(item.el)}`, {
              kind: 'chrome over chrome',
              a: describe(solid.el),
              b: `${item.sort} ${describe(item.el)}`,
              w: Math.round(w),
              h: Math.round(h),
              area: Math.round(w * h),
            })
          }
        }
      }
    }
  }

  return {
    leaves: items.filter((x) => x.sort === 'text').length,
    controls: items.filter((x) => x.sort === 'control').length,
    pictures: items.filter((x) => x.sort === 'picture').length,
    chrome: roots.length,
    aside,
    pairs: [...worst.values()],
  }
}

/* ============================================================
   THE STATES A SCREEN IS READ IN.

   At rest; one window down and at the end of the PAGE, where the page
   scrolls; and one window down and at the end of the screen's MAIN
   SCROLLER, where it scrolls in a box of its own — the largest element
   that scrolls vertically and stands over at least a quarter of the
   window at rest. Each scroller is put back to the top before the next
   is moved, so every state is one scroll away from rest and can be
   reproduced by a person with one gesture.

   "One window down" is skipped when the scroller holds less than two
   windows: then it is the end, and reading it twice reports it twice.
   ============================================================ */

export interface Reading {
  state: string
  r: Overlaps
}

type Which = 'page' | 'box'

/** Find the main scroller, remember it on the window, and say how far each can move. */
function plan(): {
  page: number
  pageWindow: number
  box: number
  boxWindow: number
  name: string
} {
  const de = document.documentElement
  const page = document.scrollingElement || de
  const area = de.clientWidth * de.clientHeight
  let best: Element | null = null
  let bestArea = area / 4
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el)
    if (!(s.overflowY === 'auto' || s.overflowY === 'scroll')) continue
    if (el.scrollHeight <= el.clientHeight + 1) continue
    if (el.closest('[aria-hidden="true"], dialog[open]')) continue
    const r = el.getBoundingClientRect()
    const w = Math.min(r.right, de.clientWidth) - Math.max(r.left, 0)
    const h = Math.min(r.bottom, de.clientHeight) - Math.max(r.top, 0)
    if (w <= 0 || h <= 0 || w * h < bestArea) continue
    best = el
    bestArea = w * h
  }
  ;(window as unknown as { overlapRulerBox?: Element | null }).overlapRulerBox = best
  const cls = best ? (best.getAttribute('class') || '').trim().split(/\s+/)[0] : ''
  return {
    page: Math.max(0, page.scrollHeight - innerHeight),
    pageWindow: innerHeight,
    box: best ? best.scrollHeight - best.clientHeight : 0,
    boxWindow: best ? best.clientHeight : 0,
    name: best ? `${best.tagName.toLowerCase()}${cls ? `.${cls}` : ''}` : '',
  }
}

function scrollOne([which, top]: [Which, number]): void {
  const target =
    which === 'page'
      ? document.scrollingElement || document.documentElement
      : (window as unknown as { overlapRulerBox?: Element | null }).overlapRulerBox
  target?.scrollTo({ top, behavior: 'instant' })
}

/** Let a scroll land: listeners, a virtualiser's next rows, a picture that came into view. */
async function land(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    await Promise.all(
      [...document.images].map(async (img) => {
        if (img.complete) return
        try {
          /* a lazy picture the browser has not fetched (out of the window, or clipped out of a
             shelf that scrolls) never decodes: it is waited for two seconds, not for ever
             (New quote at 1440 × 900, 2026-10-31) */
          await (img.loading === 'lazy'
            ? Promise.race([img.decode(), new Promise((done) => setTimeout(done, 2000))])
            : img.decode())
        } catch {
          /* a picture that cannot decode is the image ledger's problem */
        }
      }),
    )
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}

/** Read the screen at rest and in every scrolled state, and put it back at rest. */
export async function overlapsInEveryState(page: Page): Promise<Reading[]> {
  const readings: Reading[] = [{ state: 'at rest', r: await page.evaluate(findOverlaps) }]
  const p = await page.evaluate(plan)
  const walk = async (which: Which, max: number, window: number, label: string) => {
    if (max <= 2) return
    /* EVERY HALF WINDOW (refine-2), at most sixteen stops spread evenly over a longer page:
       a sticky band's foot lies over different words at every position */
    const half = Math.max(1, Math.round(window / 2))
    const stops = Math.ceil(max / half) - 1
    const count = Math.min(16, stops)
    const stride = stops > 16 ? max / (count + 1) : half
    for (let k = 1; k <= count; k++) {
      const top = Math.round(k * stride)
      if (top >= max) break
      await page.evaluate(scrollOne, [which, top] as [Which, number])
      await land(page)
      readings.push({
        state: top === window ? `${label} one window down` : `${label} ${top}px down`,
        r: await page.evaluate(findOverlaps),
      })
    }
    await page.evaluate(scrollOne, [which, max + 1000] as [Which, number])
    await land(page)
    readings.push({ state: `${label} at its end`, r: await page.evaluate(findOverlaps) })
    await page.evaluate(scrollOne, [which, 0] as [Which, number])
    await land(page)
  }
  await walk('page', p.page, p.pageWindow, 'page')
  await walk('box', p.box, p.boxWindow, `${p.name}`)
  return readings
}
