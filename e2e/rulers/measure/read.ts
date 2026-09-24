import { expect, type Page } from '@playwright/test'
import { sweep, type OnPicture, type Sweep } from './contrast'
import { decodePng, measureRun, type Tile } from './pixels'
import { wear, type Theme } from './theme'

/* ============================================================
   ONE CONTRAST READING OF ONE PAGE, IN ONE THEME — the half of the
   ruler that runs in node.

   `measure/contrast.ts` is the walk that runs inside the page; this is
   what wraps it: put a theme on, sweep, and measure every run over a
   picture off the painted pixels. It was the body of `contrast.spec.ts`
   until 2026-09-24 and moved here when a second spec needed it —
   `refusal.spec.ts`, which reads the states a refusal is only said in
   — because two copies of the pixel half would be the point at which
   they started to disagree.

   WHY THE SHOT IS A VIEWPORT AND NOT THE WHOLE PAGE. `fullPage` in
   Chromium resizes the viewport to the document, so every `dvh` on the
   page changes and a screen composed against the window is photographed
   in a shape no person could have — entry's photograph is `100dvh`
   tall, so a full-page shot of a scrolling phone would measure a screen
   nobody can open. So each run is brought into view and the window is
   what is measured.
   ============================================================ */

/** Runs that could not be shot, said out loud rather than dropped. */
export interface Skipped {
  run: OnPicture
  why: string
}

export interface PictureFail {
  run: OnPicture
  ratio: number
  tiles: Tile[]
}

/**
 * The worst tile of every run over a picture, measured off the screen.
 *
 * THE BROWSER IS ASKED TO BRING EACH RUN INTO VIEW, rather than the window being scrolled by
 * arithmetic: `scrollIntoView` moves every scroller between the run and the page, so a
 * caption inside a shelf that scrolls on its own is reachable too — which arithmetic on the
 * document's own scroll is not, measured on home at 844x390. A fresh shot is taken only when
 * something actually moved, so a screen whose runs are all on one window costs one.
 *
 * Every run's figure is returned, not only the failures, so a caller that must prove it read
 * one particular run — the reason under a refused door — can find it by its index.
 *
 * THE GROUND IS READ WITH THE GLYPHS TAKEN OFF IT, AND ONLY UNDER THEM. Added 2026-09-24,
 * when the night was first read and two legible runs came back under the line: a paragraph
 * of light 13px text on the night's navy whose densest 24px column was more letter than
 * ground, so its MEDIAN PIXEL was a letter (2.91 : 1 for text measured at 7.9 : 1 in the
 * next column), and a veiled button whose run was its border box, so its last tile was a
 * sliver of its own white border (3.01 : 1). The median is kept — it is what refuses to let
 * one dark patch of a busy photograph vouch for a whole caption — but it is taken of the
 * ground alone: every run over a picture is made transparent for the shot (the page's own
 * layout does not move; only the ink goes), and each run is read inside the box its own
 * glyphs are painted in, not its padding or its border (`measure/contrast.ts`, 6b).
 */
export async function measureOverPictures(
  page: Page,
  runs: OnPicture[],
): Promise<{ fails: PictureFail[]; skipped: Skipped[]; ratios: (number | null)[] }> {
  const fails: PictureFail[] = []
  const skipped: Skipped[] = []
  const ratios: (number | null)[] = runs.map(() => null)
  let image: ReturnType<typeof decodePng> | null = null

  await page.evaluate(() => {
    const hush = document.createElement('style')
    hush.dataset.rulerHush = ''
    hush.textContent = `[data-on-picture], [data-on-picture] * {
      color: transparent !important; -webkit-text-fill-color: transparent !important;
      text-shadow: none !important; text-decoration-color: transparent !important; }`
    document.head.append(hush)
    for (const moving of document.getAnimations()) {
      try {
        moving.finish()
      } catch {
        /* an infinite animation cannot be finished, and is not the ink */
      }
    }
  })

  for (const [i, run] of runs.entries()) {
    const placed = await page.evaluate((at) => {
      const el = document.querySelector(`[data-on-picture="${at}"]`)
      if (!el) return null
      const w = document.documentElement.clientWidth
      const h = document.documentElement.clientHeight
      /* the box its own glyphs are painted in — the sweep's (6b), repeated because this
         runs in the page with no closure */
      const glyphs = (): { left: number; top: number; right: number; bottom: number } => {
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
        if (right > left && bottom > top) return { left, top, right, bottom }
        const r = el.getBoundingClientRect()
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
      }
      /* THE ROOM IS THE WINDOW LESS WHAT THE SHELL HOLDS OVER IT. Added 2026-09-24: on a
         phone the tab bar stands over the last 56px of the window, and a run of the page
         that sat there at the sweep — the register's teaching sentence at 797–836 of 844,
         after a boat's spoken name took a second line — was read off the TAB BAR's pixels
         (1.72 : 1) because it met the helm drawn in the bar's crest. A run under the bar is
         not on its ground; it is brought to the middle of the room like any run outside it. */
      /* the token is a calc() the page resolves, so a box is asked for its height */
      const probe = document.createElement('div')
      probe.style.cssText = 'position:absolute;visibility:hidden;block-size:var(--shell-foot,0px)'
      document.body.append(probe)
      const held = probe.getBoundingClientRect().height
      probe.remove()
      /* a run that stands IN something fixed — the tab bar's own words — goes where its bar
         goes, so for it the room is the whole window */
      let fixedHere = false
      for (let up: Element | null = el; up && !fixedHere; up = up.parentElement)
        fixedHere = getComputedStyle(up).position === 'fixed'
      const foot = fixedHere ? 0 : held
      const inside = (r: { left: number; top: number; right: number; bottom: number }): boolean =>
        r.top >= 0 && r.left >= 0 && r.bottom <= h - foot && r.right <= w
      let r = glyphs()
      let moved = false
      if (!inside(r)) {
        el.scrollIntoView({ block: 'center', inline: 'center' })
        r = glyphs()
        moved = true
      }
      return {
        x: r.left,
        y: r.top,
        width: r.right - r.left,
        height: r.bottom - r.top,
        moved,
        seen: inside(r),
      }
    }, i)

    if (!placed) {
      skipped.push({ run, why: 'the element was gone by the time it was shot' })
      continue
    }
    if (!placed.seen) {
      skipped.push({ run, why: 'could not be brought fully into view' })
      continue
    }
    if (placed.moved || !image) {
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))))
      const shot = await page.screenshot({ animations: 'disabled', caret: 'hide', scale: 'css' })
      image = decodePng(new Uint8Array(shot))
    }
    const m = measureRun(image, placed, run.ink)
    ratios[i] = +m.ratio.toFixed(2)
    if (m.ratio < run.need) fails.push({ run, ratio: m.ratio, tiles: m.tiles })
  }

  await page.evaluate(() => {
    window.scrollTo(0, 0)
    for (const el of document.querySelectorAll('[data-on-picture]'))
      el.removeAttribute('data-on-picture')
    for (const hush of document.querySelectorAll('style[data-ruler-hush]')) hush.remove()
  })
  return { fails, skipped, ratios }
}

/** Put `theme` on the page (`measure/theme.ts`) and return the room's token as computed. */
export const wearTheme = (page: Page, theme: Theme): Promise<string> => page.evaluate(wear, theme)

/** A refusal's sentence with the figure it was finally read at, in the page or off the pixels. */
export interface ReadReason {
  text: string
  ratio: number | null
  need: number
}

export interface Reading {
  theme: Theme
  /** the room's token as computed once the theme was on — the proof it took */
  ground: string
  sweep: Sweep
  pictures: { fails: PictureFail[]; skipped: Skipped[] }
  /** every refusal on the page, each with the figure it was read at */
  reasons: ReadReason[]
  /** everything under the line, in page and on pictures, as sentences naming the theme */
  failures: string[]
  /** runs over a picture nobody could shoot, as sentences naming the theme */
  unshot: string[]
}

/**
 * Put `theme` on the page, sweep it, measure every run over a picture off the screen, and
 * print what was found. Every figure is logged under the theme's name, so a report read later
 * says which theme a failure belongs to.
 */
export async function readContrast(page: Page, label: string, theme: Theme): Promise<Reading> {
  const ground = await wearTheme(page, theme)
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))))
  const r = await page.evaluate(sweep)

  const aside = r.decorative
    ? `, ${r.decorative} aria-hidden set aside (${r.decorativeBelow} of them under the line)`
    : ''
  const note = r.unparsed ? `, ${r.unparsed} unparsed colours` : ''
  const shown = r.pictures
    ? `, ${r.onPicture.length} of them over one of ${r.pictures} pictures and measured off the screen`
    : ''
  console.log(
    `  ${label.padEnd(20)} ${theme.padEnd(5)} ${String(r.measured).padStart(4)} text nodes measured, ${r.fails.length} below threshold${shown}${aside}${note}`,
  )
  for (const f of r.fails.slice(0, 10)) {
    console.log(
      `      ${f.ratio}:1 (needs ${f.need})  ${f.px}px/${f.weight}  ${f.color}  ${f.tag}.${f.cls}  "${f.text}"`,
    )
  }

  const pictures = await measureOverPictures(page, r.onPicture)
  for (const f of pictures.fails) {
    console.log(
      `      ${f.ratio.toFixed(2)}:1 (needs ${f.run.need})  ${f.run.px}px  ON A PICTURE  ${f.run.tag}.${f.run.cls}  "${f.run.text}"`,
    )
    console.log(`         tiles: ${f.tiles.map((t) => t.ratio.toFixed(1)).join(' ')}`)
  }
  for (const s of pictures.skipped) {
    console.log(`      not measured off the screen — ${s.why}: "${s.run.text}"`)
  }

  const reasons: ReadReason[] = r.refusals.map((x) => ({
    text: x.text,
    ratio: x.onPicture === null ? x.ratio : (pictures.ratios[x.onPicture] ?? null),
    need: x.need,
  }))
  for (const x of reasons) {
    console.log(`      a refusal, ${x.ratio ?? 'unread'}:1 (needs ${x.need})  "${x.text}"`)
  }

  return {
    theme,
    ground,
    sweep: r,
    pictures,
    reasons,
    failures: [
      ...r.fails.map(
        (f) => `${theme}: ${f.ratio}:1 needs ${f.need} — ${f.tag}.${f.cls} "${f.text}"`,
      ),
      ...pictures.fails.map(
        (f) =>
          `${theme}: ${f.ratio.toFixed(2)}:1 needs ${f.run.need} on the picture — "${f.run.text}"`,
      ),
    ],
    unshot: pictures.skipped.map((s) => `${theme}: ${s.why} — "${s.run.text}"`),
  }
}

/**
 * The assertions every contrast reading owes, in one place so that the route walk and the
 * refusal walk cannot hold a page to two different standards.
 *
 * THE THEMES MUST HAVE TAKEN. Two readings whose room is the same colour are one theme read
 * twice, which is the blindness this pair of readings exists to end.
 */
export function expectClean(readings: Reading[]): void {
  const grounds = new Set(readings.map((r) => r.ground))
  expect(
    grounds.size,
    `each theme puts its own room on the page: ${[...grounds].join(' / ')}`,
  ).toBe(readings.length)
  for (const r of readings) {
    /* A sweep that measures nothing reports clean and means nothing —
       the same failure a pipeline has when it swallows its own exit
       status. The route proved it arrived; this proves it had words. */
    expect(r.sweep.measured, `the ${r.theme} reading had text to measure`).toBeGreaterThan(0)
    expect(
      r.sweep.unparsed,
      'every colour on the page parsed; an unknown format is never a pass',
    ).toBe(0)
  }
  expect(
    readings.flatMap((r) => r.failures),
    'every run of text, in both themes, in the page and on the pixels it is painted on',
  ).toEqual([])
  /* A run nobody could shoot is not a pass either: it is counted and
     named above, and the day one appears it is a question to answer. */
  expect(readings.flatMap((r) => r.unshot)).toEqual([])
}
