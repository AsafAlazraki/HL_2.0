import { expect, test, type Page } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'
import { sweep, type OnPicture } from './measure/contrast'
import { decodePng, measureRun, type Tile } from './measure/pixels'

/* ============================================================
   contrast, walked over every route the app declares.

   The measurement, its six corrections and the reasoning behind each
   of them are in `measure/contrast.ts`; this file is the walk and the
   report. `fixture.spec.ts` points the same function at a page built
   to fail, one planted defect per correction, which is what makes the
   green below mean something.

   THE SIXTH CORRECTION IS HALF IN THIS FILE, because half of it cannot
   run inside the page. Where something picture-shaped paints under a
   run of text, the walk refuses to guess at the ground and hands the
   run out; here it is scrolled into view, shot, and measured off the
   painted pixels by `measure/pixels.ts` — the same method the critic
   used by hand to find the 4.1:1 caption this ruler had called 14.95:1.

   WHY THE SHOT IS A VIEWPORT AND NOT THE WHOLE PAGE. `fullPage` in
   Chromium resizes the viewport to the document, so every `dvh` on the
   page changes and a screen composed against the window is photographed
   in a shape no person could have — entry's photograph is `100dvh`
   tall, so a full-page shot of a scrolling phone would measure a screen
   nobody can open. So each run is brought into view and the window is
   what is measured.
   ============================================================ */

/** Runs that could not be shot, said out loud rather than dropped. */
interface Skipped {
  run: OnPicture
  why: string
}

/**
 * The worst tile of every run over a picture, measured off the screen.
 *
 * THE BROWSER IS ASKED TO BRING EACH RUN INTO VIEW, rather than the window being scrolled by
 * arithmetic: `scrollIntoView` moves every scroller between the run and the page, so a
 * caption inside a shelf that scrolls on its own is reachable too — which arithmetic on the
 * document's own scroll is not, measured on home at 844x390. A fresh shot is taken only when
 * something actually moved, so a screen whose runs are all on one window costs one.
 */
async function measureOverPictures(
  page: Page,
  runs: OnPicture[],
): Promise<{ fails: { run: OnPicture; ratio: number; tiles: Tile[] }[]; skipped: Skipped[] }> {
  const fails: { run: OnPicture; ratio: number; tiles: Tile[] }[] = []
  const skipped: Skipped[] = []
  let image: ReturnType<typeof decodePng> | null = null

  for (const [i, run] of runs.entries()) {
    const placed = await page.evaluate((at) => {
      const el = document.querySelector(`[data-on-picture="${at}"]`)
      if (!el) return null
      const w = document.documentElement.clientWidth
      const h = document.documentElement.clientHeight
      const inside = (r: DOMRect): boolean =>
        r.top >= 0 && r.left >= 0 && r.bottom <= h && r.right <= w
      let r = el.getBoundingClientRect()
      let moved = false
      if (!inside(r)) {
        el.scrollIntoView({ block: 'center', inline: 'center' })
        r = el.getBoundingClientRect()
        moved = true
      }
      return {
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
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
    if (m.ratio < run.need) fails.push({ run, ratio: m.ratio, tiles: m.tiles })
  }

  await page.evaluate(() => {
    window.scrollTo(0, 0)
    for (const el of document.querySelectorAll('[data-on-picture]'))
      el.removeAttribute('data-on-picture')
  })
  return { fails, skipped }
}

for (const route of routes) {
  test(`contrast — ${route.name}`, async ({ page }) => {
    await open(page, route)
    const r = await page.evaluate(sweep)

    const aside = r.decorative
      ? `, ${r.decorative} aria-hidden set aside (${r.decorativeBelow} of them under the line)`
      : ''
    const note = r.unparsed ? `, ${r.unparsed} unparsed colours` : ''
    const shown = r.pictures
      ? `, ${r.onPicture.length} of them over one of ${r.pictures} pictures and measured off the screen`
      : ''
    console.log(
      `  ${route.name.padEnd(12)} ${String(r.measured).padStart(4)} text nodes measured, ${r.fails.length} below threshold${shown}${aside}${note}`,
    )
    for (const f of r.fails.slice(0, 10)) {
      console.log(
        `      ${f.ratio}:1 (needs ${f.need})  ${f.px}px/${f.weight}  ${f.color}  ${f.tag}.${f.cls}  "${f.text}"`,
      )
    }

    const pixels = await measureOverPictures(page, r.onPicture)
    for (const f of pixels.fails) {
      console.log(
        `      ${f.ratio.toFixed(2)}:1 (needs ${f.run.need})  ${f.run.px}px  ON A PICTURE  ${f.run.tag}.${f.run.cls}  "${f.run.text}"`,
      )
      console.log(`         tiles: ${f.tiles.map((t) => t.ratio.toFixed(1)).join(' ')}`)
    }
    for (const s of pixels.skipped) {
      console.log(`      not measured off the screen — ${s.why}: "${s.run.text}"`)
    }

    /* A sweep that measures nothing reports clean and means nothing —
       the same failure a pipeline has when it swallows its own exit
       status. The route proved it arrived; this proves it had words. */
    expect(r.measured, 'the route rendered text to measure').toBeGreaterThan(0)
    expect(r.unparsed, 'every colour on the page parsed; an unknown format is never a pass').toBe(0)
    expect(
      r.fails.map((f) => `${f.ratio}:1 needs ${f.need} — ${f.tag}.${f.cls} "${f.text}"`),
    ).toEqual([])
    expect(
      pixels.fails.map(
        (f) => `${f.ratio.toFixed(2)}:1 needs ${f.run.need} on the picture — "${f.run.text}"`,
      ),
      'every run of text over a photograph, measured on the pixels it is painted on',
    ).toEqual([])
    /* A run nobody could shoot is not a pass either: it is counted and
       named above, and the day one appears it is a question to answer. */
    expect(pixels.skipped.map((s) => `${s.why} — "${s.run.text}"`)).toEqual([])
  })
}
