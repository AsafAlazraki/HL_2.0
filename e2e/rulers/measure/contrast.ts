/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs
   INSIDE the page: Playwright serialises it and evaluates it with no closure, so its helpers
   cannot be hoisted out of it without breaking at runtime. */

/* ============================================================
   contrast — every run of text measured against the ground it is
   actually drawn on.

   Ported from HL_Playground's `tools/check-contrast.mjs`, which drove
   system Chrome against a dev server and walked a hand-written list of
   screens. What crosses over is the measurement and the four
   corrections it was built out of; what stays behind is the shell it
   drove (sign-in, the rail, thirteen hand-timed clicks) and the list
   of screens, which is now `e2e/routes.ts` and shared with four other
   rulers.

   THE FOUR THINGS THAT MADE THE EARLIER SWEEPS LIE. The old repo's
   CLAUDE.md records that three contrast sweeps during its redesign
   "reported false catastrophes by skipping one of those":

     1. `color(srgb …)` is not `rgb(…)`. getComputedStyle returns the
        srgb form for tokens declared that way — and every colour in
        src/styles/tokens.css is declared in oklch, so this is not a
        historical curiosity here, it is the common case. A parser that
        only knows rgb() sees null and invents a failure.
     2. The ground is the WHOLE ancestor chain. A tint over a tint over
        the page is three composites, and stopping at the first
        non-transparent parent reads the tint as the ground.
     3. Translucent TEXT must be composited over that ground before it
        is measured. A faint ink at 4.7:1 on white is the floor a
        design contract sets; measured uncomposited it looks worse than
        it is.
     4. A LEAF IS NOT "an element with no element children". The sweep
        that found this had walked `querySelectorAll('*')` and skipped
        anything with `childElementCount`, so `<p>Hull only
        <b>$20,900</b></p>` measured the bold and never the sentence in
        front of it — and a run of text wrapped in `<span>`s is how
        half an app is written. The rule is "an element that holds a
        text node of its own", which is a SUPERSET: measured node for
        node on the old app's ten screens, not one leaf the old test
        found was missing from the new set, and it reached 124 the old
        test could not. 1,158 → 1,282.

   AND A FIFTH, FOUND BY THIS PORT ON ITS FIRST RUN AGAINST THE BUILT
   APP: correction (1) is not enough here. Chrome serialises a computed
   colour in the space it was DECLARED in, and every colour in
   src/styles/tokens.css is declared in oklch, so `getComputedStyle`
   returns `oklch(0.208 0.016 247)` and not an srgb form at all. The old
   parser saw one text node, could not parse its ink, and said so: "0
   text nodes measured, 1 unparsed colours". That is the parser
   behaving exactly as it was built to — refusing to guess — and it is
   also a ruler that measures nothing. Rather than reimplement oklch
   here and risk this file's arithmetic disagreeing with what the screen
   actually paints, the BROWSER is asked to convert: `color-mix(in srgb,
   X, X)` is X, resolved into the space this arithmetic works in, read
   back off a probe element. Results are cached per colour string, so a
   page with 1,200 text nodes and nine inks does nine conversions.

   AND A SIXTH, FOUND BY THE CRITIQUE OF THE FIRST TWO BUILT SCREENS
   (docs/directions/built-critique.md, 2026-09-17). Corrections 1 to 5
   are all about reading a background COLOUR correctly. Entry's ground
   is a photograph: an `<img>` inside a layer that is a sibling of the
   band the words are in, which `groundOf` cannot reach at all. It
   composited the ancestor chain, arrived at the page's own
   `--color-ground` and reported 14.95:1 for a caption measured off the
   screen at 4.1:1 — under the line, on the one screen whose whole
   premise is type over a picture, and green. So this file no longer
   answers a question it cannot answer: a run of text with anything
   picture-shaped painting under it is handed out in `onPicture`, and
   `measure/read.ts` scrolls it into view, screenshots it and measures
   the ground off the pixels with `measure/pixels.ts`. A ruler may be
   wrong about a number; it may not be confident about a ground it has
   never seen.

   AND ONE THING THAT WOULD HAVE MADE IT LIE THE OTHER WAY.
   `aria-hidden="true"` text is set aside, and counted out loud rather
   than swallowed. A `·` separator between two facts may be 2.6:1
   because it carries no meaning; nine of them on one screen turn red
   the moment the walk widens, and you spend an hour fixing an app that
   is fine. Both figures are printed for every route, so the exemption
   is legible and not a hiding place.

   The parser returns null rather than guessing, so an unknown colour
   format is counted as unparsed and reported, never a silent pass.

   WHY THIS SITS IN ITS OWN MODULE RATHER THAN INSIDE THE SPEC, which
   is where it was written. Measured by the round-3 critic: every
   ruler asserted it had measured SOMETHING and none of them could be
   shown to find a defect, so the five corrections above — the whole
   reason this file is longer than twenty lines — were arithmetic
   nobody had ever seen fail. A function passed to `page.evaluate`
   cannot be exercised from a unit test, but it CAN be pointed at a
   page with a known-bad ratio on it. So the measurement lives here,
   the spec walks the real routes with it, and `fixture.spec.ts` feeds
   it a page built to fail in one named way per correction.
   ============================================================ */

export interface Fail {
  text: string
  tag: string
  cls: string
  px: number
  weight: number
  ratio: number
  need: number
  color: string
}

/**
 * A run of text this walk cannot certify, because something that paints a PICTURE is under
 * it. Everything the pixels need is carried out with it: where it is in the document, the
 * ink as rgba, and the threshold it owes. `measure/read.ts` scrolls it into view, shoots it
 * and measures the ground off the screen.
 */
export interface OnPicture {
  text: string
  tag: string
  cls: string
  px: number
  weight: number
  need: number
  color: string
  /** the ink, rgba, to be composited over whatever the pixels say is under it */
  ink: number[]
  /** the box its own glyphs are painted in (6b), in document coordinates: viewport rect
   *  plus the current scroll */
  x: number
  y: number
  width: number
  height: number
}

/**
 * A REFUSAL, READ BY NAME. Every run of text inside the primitives' `.ui-refusal` is reported
 * with its figure whether it passes or not, so a ruler that means to have read the reason a
 * sale is refused can prove it did — rather than inferring it from a clean list of failures,
 * which is exactly what an empty page returns. `ratio` is null where the run is over a
 * picture: its figure is the pixels', and `onPicture` is its index there.
 */
export interface Reason {
  text: string
  ratio: number | null
  need: number
  color: string
  onPicture: number | null
}

export interface Sweep {
  measured: number
  unparsed: number
  decorative: number
  decorativeBelow: number
  fails: Fail[]
  /** how many pictures were found painting behind text, and the runs over them */
  pictures: number
  onPicture: OnPicture[]
  /** every refusal's sentence on the page, passing or not */
  refusals: Reason[]
}

/* The sweep runs INSIDE the page, and is kept as one self-contained
   function so it can be pasted into devtools unchanged when chasing
   one screen. Nothing here may close over a module import: Playwright
   serialises this function and evaluates it with no closure at all,
   which is also why its helpers cannot be hoisted out of it. */
export function sweep(): Sweep {
  /* A SIGNED component is not a parse failure, it is a colour outside
     the sRGB gamut — and half the provisional blue scale is, because
     oklch can name colours a monitor cannot show. Chrome answers
     `color(srgb -0.213 0.398 0.976)` and the screen paints the clamped
     value, so the ratio a person actually sees is the clamped one. The
     old regex accepted `[\d.]+` only, dropped every such step on the
     floor and reported a scale with six missing rungs. */
  const clamp = (v: number): number => Math.max(0, Math.min(255, v))
  const N = String.raw`-?[\d.]+(?:e[-+]?\d+)?`
  const SRGB = new RegExp(
    `^color\\(srgb\\s+(${N})\\s+(${N})\\s+(${N})(?:\\s*/\\s*(${N}))?\\)$`,
    'i',
  )
  const parse = (s: string): number[] | null => {
    if (!s) return null
    let m = SRGB.exec(s)
    if (m)
      return [
        clamp(+m[1]! * 255),
        clamp(+m[2]! * 255),
        clamp(+m[3]! * 255),
        m[4] === undefined ? 1 : +m[4],
      ]
    m = /rgba?\(([^)]+)\)/.exec(s)
    if (m) {
      const p = m[1]!
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map(Number)
      return [clamp(p[0]!), clamp(p[1]!), clamp(p[2]!), p[3] === undefined ? 1 : p[3]]
    }
    if (s === 'transparent') return [0, 0, 0, 0]
    return null /* unknown format — never guess */
  }

  /* (5) ANYTHING ELSE, CONVERTED BY THE BROWSER AND NOT BY THIS FILE.
     An oklch token is the common case here. The sentinel catches a
     value the browser itself rejects: if the mix does not take, the
     probe keeps the sentinel and this returns null, so an unknown
     format is still counted and never guessed at. */
  const SENTINEL = 'rgb(1, 2, 3)'
  const probe = document.createElement('span')
  probe.style.position = 'fixed'
  probe.style.opacity = '0'
  probe.style.pointerEvents = 'none'
  document.body.append(probe)
  const cache = new Map<string, number[] | null>()
  const toRgb = (s: string): number[] | null => {
    const hit = cache.get(s)
    if (hit !== undefined) return hit
    let v = parse(s)
    if (!v) {
      probe.style.color = SENTINEL
      probe.style.color = `color-mix(in srgb, ${s}, ${s})`
      const back = getComputedStyle(probe).color
      v = back === SENTINEL ? null : parse(back)
    }
    cache.set(s, v)
    return v
  }

  const over = (fg: number[], bg: number[]): number[] =>
    [0, 1, 2].map((i) => fg[3]! * fg[i]! + (1 - fg[3]!) * bg[i]!)

  /* (2) the WHOLE ancestor chain, composited outermost-first */
  const groundOf = (el: Element): number[] => {
    const stack: number[][] = []
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = toRgb(getComputedStyle(n).backgroundColor)
      if (c && c[3]! > 0) {
        stack.push(c)
        if (c[3] === 1) break
      }
    }
    let base = [255, 255, 255]
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i]!, base)
    return base
  }

  function ch(v: number): number {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const lum = (c: number[]): number => 0.2126 * ch(c[0]!) + 0.7152 * ch(c[1]!) + 0.0722 * ch(c[2]!)
  const ratio = (a: number[], b: number[]): number => {
    const l1 = lum(a)
    const l2 = lum(b)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }

  /* (4) WHAT THIS ELEMENT ITSELF SAYS — its own text nodes, not its
     descendants'. `textContent` on a wrapper returns the whole
     subtree, which would measure a paragraph's string against the
     wrapper's colour and count the same glyphs once per ancestor. The
     colour a text node is painted in is its PARENT's `color`, so the
     element that owns the text node is the thing to measure. */
  const ownText = (el: Element): string => {
    let s = ''
    for (const n of el.childNodes) if (n.nodeType === 3) s += (n as Text).data
    return s.trim()
  }

  /* (6) A PICTURE IS NOT A BACKGROUND COLOUR, AND THIS WALK CANNOT SEE ONE. Added
     2026-09-17, after the entry screen shipped a 4.1:1 caption green: its photograph is an
     `<img>` inside a `position: fixed` SIBLING of the band the words are in, so the chain
     above reaches the page's own `--color-ground` and reports 14.95:1 for type that is
     really on lit water. `fixture.spec.ts` proved this walk could fail on a background
     COLOUR, which is the one case that screen never presents.

     So anything that paints a picture is collected first — an <img>, a <canvas>, a <video>,
     an <svg>, or any element with a background-image — and a run of text whose box meets one
     of them is not measured here at all. It is handed out with its ink and its box, and the
     spec measures the ground off the PAINTED PIXELS.

     It errs towards measuring: a picture behind an opaque panel the text sits on is handed
     over too, and the pixel measurement then reads the panel, which is the truth anyway. The
     one thing it must never do is report a ratio for a ground it did not see. */
  const PAINTS = new Set(['IMG', 'CANVAS', 'VIDEO', 'SVG', 'PICTURE'])
  const pictures: { el: Element; r: DOMRect }[] = []
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
    if (!PAINTS.has(el.tagName.toUpperCase()) && cs.backgroundImage === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    pictures.push({ el, r })
  }
  const meets = (el: Element, r: DOMRect): boolean =>
    pictures.some(
      (p) =>
        !el.contains(p.el) &&
        p.r.left < r.right &&
        p.r.right > r.left &&
        p.r.top < r.bottom &&
        p.r.bottom > r.top,
    )

  /* (6b) THE BOX THE GLYPHS ARE PAINTED IN, not the element's. Added 2026-09-24, when the
     night was first read: a veiled button's run was its border box, the last 24px tile of
     it was a 2px sliver of its own 55% white border, and a legible label came back 3.01 : 1.
     A run's ground is what is behind its letters, so the pixels are read under its own text
     nodes' line boxes — which leaves out a control's padding and border, and is the same
     box as before for a paragraph. */
  const glyphBox = (el: Element): { x: number; y: number; width: number; height: number } => {
    let left = Number.POSITIVE_INFINITY
    let top = Number.POSITIVE_INFINITY
    let right = Number.NEGATIVE_INFINITY
    let bottom = Number.NEGATIVE_INFINITY
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !(n as Text).data.trim()) continue
      const range = document.createRange()
      range.selectNodeContents(n)
      for (const b of range.getClientRects()) {
        if (b.width < 1 || b.height < 1) continue
        left = Math.min(left, b.left)
        top = Math.min(top, b.top)
        right = Math.max(right, b.right)
        bottom = Math.max(bottom, b.bottom)
      }
    }
    if (right > left && bottom > top)
      return { x: left, y: top, width: right - left, height: bottom - top }
    const r = el.getBoundingClientRect()
    return { x: r.left, y: r.top, width: r.width, height: r.height }
  }

  const fails: Fail[] = []
  const onPicture: OnPicture[] = []
  const refusals: Reason[] = []
  let measured = 0
  let unparsed = 0
  let decorative = 0
  let decorativeBelow = 0

  for (const el of document.querySelectorAll('*')) {
    const t = ownText(el)
    if (!t) continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.display === 'none') continue
    /* DECORATION IS NOT READING TEXT — and the skip is counted twice
       over, once for how much was passed over and once for how much
       of it was under the line, so that a screen quietly hiding real
       text behind `aria-hidden` moves a number somebody can see. A
       guard's exemption is only safe while it is legible. */
    const decoration = Boolean(el.closest('[aria-hidden="true"]'))

    const fg = toRgb(cs.color)
    if (!fg) {
      unparsed++
      continue
    }
    const ground = groundOf(el)
    const text = over(fg, ground) /* (3) composite translucent text */
    const cr = ratio(text, ground)

    const px = Number.parseFloat(cs.fontSize)
    const weight = Number(cs.fontWeight) || 400
    /* WCAG large text: >=24px, or >=18.66px at >=700 */
    const large = px >= 24 || (px >= 18.66 && weight >= 700)
    const need = large ? 3 : 4.5

    if (decoration) {
      decorative++
      if (cr < need) decorativeBelow++
      continue
    }
    measured++

    /* A REFUSAL IS READ BY NAME, pass or fail (see `Reason`). */
    const reason = Boolean(el.closest('.ui-refusal'))
    const onAPicture = meets(el, r)
    if (reason)
      refusals.push({
        text: t.slice(0, 80),
        ratio: onAPicture ? null : +cr.toFixed(2),
        need,
        color: cs.color,
        onPicture: onAPicture ? onPicture.length : null,
      })

    /* (6) OVER A PICTURE: not measured here, handed to the pixels. The
       index is written onto the element so the spec can ask the browser
       itself to bring the run into view — a run inside a scroller of its
       own cannot be reached by scrolling the window. */
    if (onAPicture) {
      el.setAttribute('data-on-picture', String(onPicture.length))
      const g = glyphBox(el)
      onPicture.push({
        text: t.slice(0, 48),
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 40),
        px: +px.toFixed(1),
        weight,
        need,
        color: cs.color,
        ink: fg,
        x: g.x + window.scrollX,
        y: g.y + window.scrollY,
        width: g.width,
        height: g.height,
      })
      continue
    }

    if (cr < need) {
      fails.push({
        text: t.slice(0, 48),
        /* `className` on an SVG node is an SVGAnimatedString, which
           stringifies to "[object SVGAnimatedString]" and names
           nothing. The attribute is the same string on both. */
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 40),
        px: +px.toFixed(1),
        weight,
        ratio: +cr.toFixed(2),
        need,
        color: cs.color,
      })
    }
  }
  probe.remove()
  fails.sort((a, b) => a.ratio - b.ratio)
  return {
    measured,
    unparsed,
    decorative,
    decorativeBelow,
    fails,
    pictures: pictures.length,
    onPicture,
    refusals,
  }
}
