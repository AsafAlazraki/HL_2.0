/* The parts every board shares: the icons (Phosphor, the app's own set, rendered to SVG), the
   floating bar as the app draws it, the page frame, and the board's own notes styles. A board
   is a picture of the screen, so the bar is drawn here and not imported from the shell. */
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as P from '@phosphor-icons/react/ssr'

export const ic = (name, { weight = 'bold', size = 'sm', label } = {}) => {
  const svg = renderToStaticMarkup(h(P[name + 'Icon'], { weight }))
  return svg.replace(
    '<svg ',
    `<svg class="ui-icon" data-size="${size}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} `,
  )
}

export const KIND_GLYPH = {
  boat: 'Boat',
  motor: 'Engine',
  trailer: 'TruckTrailer',
  accessory: 'Toolbox',
  package: 'Package',
  custom: 'Table',
}
export const KIND_INK = {
  boat: 'blue',
  motor: 'carmine',
  trailer: 'ochre',
  accessory: 'viridian',
  package: 'violet',
  custom: 'graphite',
}
export const kind = (k, size = 'sm') =>
  `<span class="ui-kind" data-ink="${KIND_INK[k]}" data-size="${size}" aria-hidden="true">${ic(KIND_GLYPH[k], { weight: 'fill' })}</span>`

export const ROOM_GLYPH = {
  Review: 'SealCheck',
  Prices: 'Tag',
  Rules: 'Scales',
  Fitment: 'TruckTrailer',
  Catalogue: 'Package',
  Shelf: 'Vault',
}

export const MARKS = '../../../../../public/brand-marks/'

export const bar = () => `
<nav class="bar" aria-label="The bar">
  <span class="bar-disc" aria-hidden="true">${ic('Waves', { weight: 'bold', size: 'md' })}</span>
  <a class="bar-find" href="#">${ic('MagnifyingGlass')}<span>Find</span></a>
  <a href="#">${ic('House')}<span>Home</span></a>
  <a href="#">${ic('FileText')}<span>Quotes</span><b class="bar-count">0</b></a>
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

/* Board-wide: the room, the bar, the frame, and the notes. Tokens only: every colour is a
   role from src/styles/tokens.css, read through kit.css (the app's own built stylesheet). */
export const SHARED_CSS = `
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--color-ground); color: var(--color-ink); font-family: var(--font-sans);
  font-size: var(--text-base); line-height: 1.45; overflow-wrap: break-word; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, h4, p, ul, ol, dl, dd, figure { margin: 0; padding: 0; }
h1 { font-weight: 800; } h2, h3 { font-weight: 700; } h4 { font-weight: 700; }
.nw { white-space: nowrap; }
ul, ol { list-style: none; }
.num, b, td.n { font-variant-numeric: tabular-nums lining-nums; }

/* THE BAR, as the app floats it: top on a desk, the foot on a phone. */
.bar { position: fixed; z-index: 20; inset-block-start: 8px; inset-inline: 0; margin-inline: auto; inline-size: max-content;
  display: flex; align-items: center; gap: 2px; padding: 4px 6px 4px 4px; border-radius: var(--radius-pill);
  background: var(--color-door); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
.bar a { display: inline-flex; align-items: center; gap: 6px; min-block-size: 36px; padding-inline: 12px; border-radius: var(--radius-pill);
  font-weight: 600; color: var(--color-ink-2); }
.bar a.on { background: var(--color-blue-800); color: var(--color-white); }
.bar .bar-find { box-shadow: inset 0 0 0 1px var(--color-rule-strong); background: var(--color-plate-tint); margin-inline-end: 6px; }
.bar-disc { display: grid; place-items: center; inline-size: 40px; block-size: 40px; border-radius: 50%; background: var(--color-blue-800); color: var(--color-white); margin-inline-end: 4px; box-shadow: 0 0 0 3px var(--color-blue-200); }
.bar-count { min-inline-size: 20px; padding-inline: 6px; border-radius: var(--radius-pill); background: var(--color-wash); font-size: var(--text-xs); text-align: center; color: var(--color-ink); }
body { padding-block: 72px 48px; }
@media (max-width: 599px) {
  .bar { inset-block: auto 8px; inline-size: calc(100% - 16px); justify-content: space-between; padding: 4px; }
  .bar a { flex-direction: column; gap: 0; padding-inline: 4px; min-block-size: 44px; font-size: var(--text-xs); justify-content: center; }
  .bar .bar-find span, .bar .bar-count { display: none; }
  .bar .bar-find { inline-size: 40px; block-size: 40px; border-radius: 50%; padding: 0; margin: 0; }
  .bar-disc { inline-size: 44px; block-size: 44px; margin: 0; }
  body { padding-block: 20px 104px; }
}

/* THE FRAME: one measure that grows with the window, so 1920 is used and 390 holds 16px. */
.frame { inline-size: min(100% - 32px, 1360px); margin-inline: auto; }
@media (min-width: 600px) { .frame { inline-size: min(100% - 48px, 1360px); } }
@media (min-width: 1600px) { .frame { inline-size: min(100% - 96px, 1760px); } }

.plate { background: var(--color-plate); border-radius: var(--radius-plate); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
.eyebrow { font-size: var(--text-xs); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; color: var(--color-ink-3); }
.door { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--color-ink-file); white-space: nowrap; }
.door:hover { text-decoration: underline; }
.find { display: flex; align-items: center; gap: 10px; min-block-size: 44px; padding-inline: 14px 8px; border-radius: var(--radius-field);
  background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-control-edge); color: var(--color-ink-3); }
.find input { all: unset; flex: 1; min-inline-size: 0; color: var(--color-ink); font-size: var(--text-lg); }
.find input::placeholder { color: var(--color-ink-3); }
.mark-img { display: block; max-block-size: 26px; max-inline-size: 132px; inline-size: auto; object-fit: contain; }
.mark-word { font-weight: 800; font-size: var(--text-lg); letter-spacing: -0.01em; color: var(--color-ink); line-height: 26px; }
.sr { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }

/* THE NOTES: the board's own words, under the screen. Paper, so it never reads as the app. */
.notes { margin-block-start: 72px; padding-block: 48px 24px; background: var(--color-paper); border-block-start: 1px solid var(--color-rule-strong); }
.notes .frame { display: grid; gap: 36px; }
.notes h2 { font-size: var(--text-3xl); line-height: 1.15; letter-spacing: -0.01em; }
.notes h3 { font-size: var(--text-xl); margin-block-end: 8px; }
.notes p, .notes li { max-inline-size: 72ch; color: var(--color-ink-2); font-size: var(--text-lg); line-height: 1.55; }
.notes li { margin-block: 4px; }
.notes ul.dash li::before { content: '— '; color: var(--color-ink-3); }
.notes code { font-family: var(--font-mono); font-size: 0.9em; overflow-wrap: anywhere; }
.notes .cols { display: grid; gap: 28px 40px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); }
.notes table { border-collapse: collapse; inline-size: 100%; font-size: var(--text-base); }
.notes th, .notes td { text-align: start; vertical-align: top; padding: 8px 10px 8px 0; border-block-end: 1px solid var(--color-rule); }
.notes th { color: var(--color-ink-3); font-weight: 700; font-size: var(--text-sm); }
.notes td:first-child { white-space: nowrap; font-weight: 700; color: var(--color-ink); }
.notes .state { padding: 24px; border-radius: var(--radius-plate); background: var(--color-ground); box-shadow: inset 0 0 0 1px var(--color-rule-strong); }
.notes .state > .eyebrow { margin-block-end: 14px; display: block; }
.specimen { display: grid; gap: 10px; }
.specimen > div { display: grid; grid-template-columns: minmax(0, 140px) minmax(0, 1fr); gap: 16px; align-items: baseline; border-block-end: 1px solid var(--color-rule); padding-block-end: 8px; }
.specimen span:first-child { font-size: var(--text-sm); color: var(--color-ink-3); font-family: var(--font-mono); }
.board-name { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: baseline; }
.board-name .eyebrow { color: var(--color-ink-file); }
.rec { display: inline-flex; padding: 2px 10px; border-radius: var(--radius-pill); background: var(--color-act); color: var(--color-ink-on-act); font-weight: 700; font-size: var(--text-sm); }
@media (max-width: 599px) { .notes p, .notes li { font-size: var(--text-base); } .notes .state { padding: 14px; } .notes table { font-size: var(--text-sm); } .notes td:first-child { white-space: normal; } }
`
