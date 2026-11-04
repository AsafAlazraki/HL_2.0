/* What the three shelf boards share as a DRAWING: the app's icons (Phosphor, rendered to SVG),
   the floating bar as the app draws it, the page and its notes on paper, and the small pieces
   of the component language (button, chip, kbd, tick) written as the app's own markup so the
   board can be built as drawn. Every colour, size, radius and shadow is a token read through
   kit.css, the app's own built stylesheet (e2e/out/dist-6290: index, ui and kit). Each board
   composes its own screen in its own file; nothing here decides an order or a grouping. */
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as Ph from '@phosphor-icons/react/ssr'

export const ic = (name, { weight = 'bold', size = 'sm', label } = {}) => {
  const svg = renderToStaticMarkup(h(Ph[name + 'Icon'], { weight }))
  return svg.replace(
    '<svg ',
    `<svg class="ui-icon" data-size="${size}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} `,
  )
}

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/* THE APP'S OWN MARKUP for its controls (src/ui/Button.tsx, Chip.tsx, Kbd.tsx) */
export const btn = (label, { intent = 'secondary', size = 'md', icon, cls = '' } = {}) => {
  const ground = ['veiled', 'secondary', 'act'].includes(intent) ? ' data-ground="plate"' : ''
  const disc =
    icon && intent === 'act'
      ? `<span class="ui-button-disc" aria-hidden="true">${ic(icon)}</span>`
      : ''
  const lead = icon && intent !== 'act' ? ic(icon) : ''
  return `<span class="ui-button-frame ${cls}" data-intent="${intent}" data-size="${size}"><button type="button" class="ui-button" data-intent="${intent}" data-size="${size}"${ground}>${lead}${intent === 'act' ? `<span>${label}</span>` : label}${disc}</button></span>`
}
export const chip = (label, { count, pressed = false, icon } = {}) =>
  `<span class="ui-chip-frame"><button type="button" class="ui-chip" aria-pressed="${pressed}" data-ground="plate">${icon ? ic(icon) : ''}<span class="ui-chip-word">${label}</span>${count === undefined ? '' : `<span class="ui-chip-count">${count}</span>`}</button></span>`
export const kbd = (...keys) =>
  `<kbd class="ui-kbd ui-kbd--quiet">${keys.map((k) => `<kbd class="ui-kbd-key">${k}</kbd>`).join('')}</kbd>`

/* A TICK: in, out, or some of a group (the master tick's third state) */
export const tick = (state = 'in', label = '') => {
  const glyph = state === 'in' ? 'CheckSquare' : state === 'some' ? 'MinusSquare' : 'Square'
  return `<span class="tick" data-state="${state}" role="checkbox" aria-checked="${state === 'in' ? 'true' : state === 'some' ? 'mixed' : 'false'}" tabindex="0"${label ? ` aria-label="${esc(label)}"` : ''}>${ic(glyph, { weight: state === 'out' ? 'regular' : 'fill', size: 'md' })}</span>`
}

/* A FIGURE THAT MOVES: old, struck and quiet; the arrow; new, set firm. */
export const moved = (from, to, { cls = '' } = {}) =>
  `<span class="mv ${cls}"><s>${esc(from)}</s><span class="mv-arrow" aria-label="to">${ic('ArrowRight')}</span><b>${esc(to)}</b></span>`

export const bar = ({ quotes = 0 } = {}) => `
<nav class="bar" aria-label="The bar">
  <span class="bar-disc" aria-hidden="true">${ic('Waves', { size: 'md' })}</span>
  <a class="bar-find" href="#">${ic('MagnifyingGlass')}<span>Find</span></a>
  <a href="#">${ic('House')}<span>Home</span></a>
  <a href="#">${ic('FileText')}<span>Quotes</span><b class="bar-count">${quotes}</b></a>
  <a href="#">${ic('Users')}<span>Customers</span></a>
  <a href="#" class="on" aria-current="page">${ic('Database')}<span>Data</span></a>
  <a href="#">${ic('ClockCounterClockwise')}<span>History</span></a>
</nav>`

export const page = ({ title, id, css, body, notes }) => `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="kit.css">
<style>
${SHARED_CSS}
${css}
</style>
</head>
<body data-board="${id}">
${bar()}
${body}
${notes}
</body>
</html>
`

/* A STATE BELOW THE FIRST: the address it is at, a sentence of what it shows, then the screen. */
export const stateHead = (no, url, say) => `
<header class="state-head frame">
  <span class="state-no">State ${no}</span>
  <code class="state-url">${esc(url)}</code>
  <p>${say}</p>
</header>`

export const SHARED_CSS = `
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--color-ground); color: var(--color-ink); font-family: var(--font-sans);
  font-size: var(--text-base); line-height: 1.45; overflow-wrap: break-word; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, h4, p, ul, ol, dl, dd, figure { margin: 0; padding: 0; }
h1 { font-weight: 800; } h2, h3, h4 { font-weight: 700; }
ul, ol { list-style: none; }
button { font: inherit; }
.num, b, td, .fig { font-variant-numeric: tabular-nums lining-nums; }
.nw { white-space: nowrap; }
.sr { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }

/* THE BAR, as the app floats it: top on a desk, the foot on a phone and on a phone held sideways */
.bar { position: fixed; z-index: 40; inset-block-start: 8px; inset-inline: 0; margin-inline: auto; inline-size: max-content;
  display: flex; align-items: center; gap: 2px; padding: 4px 6px 4px 4px; border-radius: var(--radius-pill);
  background: var(--color-door); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
.bar a { display: inline-flex; align-items: center; gap: 6px; min-block-size: 36px; padding-inline: 12px; border-radius: var(--radius-pill);
  font-weight: 600; color: var(--color-ink-2); }
.bar a.on { background: var(--color-blue-800); color: var(--color-white); }
.bar .bar-find { box-shadow: inset 0 0 0 1px var(--color-rule-strong); background: var(--color-plate-tint); margin-inline-end: 6px; }
.bar-disc { display: grid; place-items: center; inline-size: 40px; block-size: 40px; border-radius: 50%; background: var(--color-blue-800); color: var(--color-white); margin-inline-end: 4px; box-shadow: 0 0 0 3px var(--color-blue-200); }
.bar-count { min-inline-size: 20px; padding-inline: 6px; border-radius: var(--radius-pill); background: var(--color-wash); font-size: var(--text-xs); text-align: center; color: var(--color-ink); }
body { padding-block: 64px 0; --dock-gap: 0px; }
@media (max-width: 599px) {
  .bar { inset-block: auto 8px; inline-size: calc(100% - 16px); justify-content: space-between; padding: 4px; }
  .bar a { flex-direction: column; gap: 0; padding-inline: 4px; min-block-size: 44px; font-size: var(--text-xs); justify-content: center; }
  .bar .bar-find span, .bar .bar-count { display: none; }
  .bar .bar-find { inline-size: 40px; block-size: 40px; border-radius: 50%; padding: 0; margin: 0; }
  .bar-disc { inline-size: 44px; block-size: 44px; margin: 0; }
  body { padding-block: 12px 0; --dock-gap: 68px; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .bar { inset-block: auto 6px; }
  body { padding-block: 10px 0; --dock-gap: 56px; }
}

.frame { inline-size: min(100% - 32px, 1360px); margin-inline: auto; }
@media (min-width: 600px) { .frame { inline-size: min(100% - 48px, 1360px); } }
@media (min-width: 1600px) { .frame { inline-size: min(100% - 96px, 1720px); } }

.eyebrow { font-size: var(--text-xs); letter-spacing: var(--tracking-caps, 0.08em); text-transform: uppercase; font-weight: 700; color: var(--color-ink-3); }
.code { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-3); letter-spacing: 0; }
.quiet { color: var(--color-ink-3); }
.door { display: inline-flex; align-items: center; gap: 4px; font-weight: 600; color: var(--color-ink-file); white-space: nowrap; }

/* THE TICK: 44px to a thumb, 28px drawn */
.tick { display: inline-grid; place-items: center; inline-size: 32px; block-size: 32px; border-radius: var(--radius-xs, 6px); color: var(--color-ink-file); cursor: pointer; flex: none; }
.tick[data-state='out'] { color: var(--color-ink-3); }
.tick .ui-icon { inline-size: 22px; block-size: 22px; }
@media (max-width: 599px) { .tick { inline-size: 44px; block-size: 44px; } }

/* A MOVED FIGURE */
.mv { display: inline-flex; align-items: baseline; gap: 4px; white-space: nowrap; }
.mv s { color: var(--color-ink-3); text-decoration-thickness: 1px; font-weight: 500; }
.mv b { font-weight: 700; color: var(--color-ink); }
.mv-arrow { color: var(--color-ink-3); display: inline-flex; align-self: center; }
.mv-arrow .ui-icon { inline-size: 12px; block-size: 12px; }
.mv.up b { color: var(--color-ink); } .mv.down b { color: var(--color-ink); }
.dir { font-size: var(--text-xs); font-weight: 700; padding-inline: 4px; border-radius: 4px; white-space: nowrap; }
.dir.up { color: var(--color-carmine-600); } .dir.down { color: var(--color-viridian-600); }

/* NORTHSIDE'S OWN: a cost column's mark. Never on a customer surface; the shelf is not one. */
.own { display: inline-flex; align-items: center; gap: 3px; font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-3); white-space: nowrap; }
.own .ui-icon { inline-size: 11px; block-size: 11px; }

/* A STATE BELOW THE FIRST */
.state-head { display: grid; gap: 4px; margin-block: 96px 16px; padding-block-start: 20px; border-block-start: 2px dashed var(--color-rule-strong); }
.state-no { font-size: var(--text-xs); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 800; color: var(--color-ink-file); }
.state-url { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-ink-2); overflow-wrap: anywhere; }
.state-head p { color: var(--color-ink-2); max-inline-size: 80ch; }

/* THE NOTES: the board's own words, under the screen. Paper, so it never reads as the app. */
.notes { margin-block-start: 120px; padding-block: 48px 120px; background: var(--color-paper); border-block-start: 1px solid var(--color-rule-strong); }
.notes .frame { display: grid; gap: 36px; }
.notes h2 { font-size: var(--text-3xl); line-height: 1.15; letter-spacing: -0.01em; }
.notes h3 { font-size: var(--text-xl); margin-block-end: 8px; }
.notes p, .notes li { max-inline-size: 76ch; color: var(--color-ink-2); font-size: var(--text-lg); line-height: 1.55; }
.notes li { margin-block: 4px; }
.notes ul.dash li::before { content: '— '; color: var(--color-ink-3); }
.notes code { font-family: var(--font-mono); font-size: 0.88em; overflow-wrap: anywhere; }
.notes .cols { display: grid; gap: 28px 40px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); }
.notes table { border-collapse: collapse; inline-size: 100%; font-size: var(--text-base); }
.notes th, .notes td { text-align: start; vertical-align: top; padding: 8px 10px 8px 0; border-block-end: 1px solid var(--color-rule); color: var(--color-ink-2); }
.notes th { color: var(--color-ink-3); font-weight: 700; font-size: var(--text-sm); }
.notes td:first-child { font-weight: 700; color: var(--color-ink); white-space: nowrap; }
.specimen { display: grid; gap: 10px; }
.specimen > div { display: grid; grid-template-columns: minmax(0, 170px) minmax(0, 1fr); gap: 16px; align-items: baseline; border-block-end: 1px solid var(--color-rule); padding-block-end: 8px; }
.specimen span:first-child { font-size: var(--text-sm); color: var(--color-ink-3); font-family: var(--font-mono); }
.board-name { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: baseline; }
.board-name .eyebrow { color: var(--color-ink-file); }
.rec { display: inline-flex; padding: 2px 10px; border-radius: var(--radius-pill); background: var(--color-act); color: var(--color-ink-on-act); font-weight: 700; font-size: var(--text-sm); }
@media (max-width: 599px) { .notes p, .notes li { font-size: var(--text-base); } .notes table { font-size: var(--text-sm); } .notes td:first-child { white-space: normal; } .notes { padding-block-end: 140px; } }
`

/* THE JOBS TABLE every board carries: each job and missing item the judge named, answered where. */
export const jobsTable = (rows) => `
<section><h3>Every job and every missing item the judge named, on this board</h3>
<table><thead><tr><th>Job</th><th>Where it is done</th></tr></thead><tbody>
${rows.map(([j, w]) => `<tr><td>${j}</td><td>${w}</td></tr>`).join('')}
</tbody></table></section>`

/* THE RESOURCES a board cites, by path, so the owner can open the frame. */
export const REF = (p) => `<code>docs/research/refs/shelf/round-2/${p}</code>`
