/* What the three catalogue boards share: the icons (Phosphor, the app's own set, rendered to
   SVG), the floating bar as the app draws it, the frame, the board's notes on paper, and the
   way a pair of prices is said. A board is a picture of the screen, so the bar is drawn here
   and not imported from the shell. Tokens only: every colour, size, radius and shadow is a role
   read through kit.css, the app's own built stylesheet (e2e/out/dist-6240). */
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as P from '@phosphor-icons/react/ssr'
import { money, twoPrices } from './facts.mjs'

export const ic = (name, { weight = 'bold', size = 'sm', label } = {}) => {
  const svg = renderToStaticMarkup(h(P[name + 'Icon'], { weight }))
  return svg.replace(
    '<svg ',
    `<svg class="ui-icon" data-size="${size}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} `,
  )
}

/* THE DRAWING EACH AISLE IS NAMED BY: the app's own (src/screens/catalogue/Chandlery.tsx) */
export const AISLE_GLYPH = {
  sounders: 'Waves',
  radios: 'Radio',
  stereo: 'SpeakerHifi',
  safety: 'Lifebuoy',
  anchoring: 'Anchor',
  power: 'BatteryCharging',
  lights: 'Lightbulb',
  trailer: 'TruckTrailer',
  covers: 'Umbrella',
  fishing: 'FishSimple',
  electric: 'Lightning',
  propellers: 'Fan',
  steering: 'SteeringWheel',
  plumbing: 'Drop',
  deck: 'Wrench',
  highfield: 'Boat',
  decals: 'Sticker',
  workshop: 'Toolbox',
  unsorted: 'Question',
}

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

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

/* A PAIR OF PRICES, SAID. Five kinds, from twoPrices in facts.mjs:
     both        "$69 supply" and "$112 fitted"
     supplyOnly  "$29 supply" and "supply only" (the file's Install Type, or no fitted figure)
     fittedOnly  "fitted only" and "$206 fitted" — never $0 where the file prices it fitted
     zero        "$0" twice, as the file writes both levels
     none        "No price on the price list" and the door to Review, where it is fixed */
export function prices(p, { labels = true } = {}) {
  const t = twoPrices(p)
  const lab = (w) => (labels ? `<small>${w}</small>` : '')
  const cell = (cls, inner) => `<span class="pc ${cls}">${inner}</span>`
  switch (t.kind) {
    case 'both':
      return (
        cell('s', `<b>${money(t.supply)}</b>${lab('supply')}`) +
        cell('f', `<b>${money(t.fitted)}</b>${lab('fitted')}`)
      )
    case 'supplyOnly':
      return (
        cell('s', `<b>${money(t.supply)}</b>${lab('supply')}`) +
        cell('f quiet', `<i>supply only</i>`)
      )
    case 'fittedOnly':
      return (
        cell('s quiet', `<i>fitted only</i>`) +
        cell('f', `<b>${money(t.fitted)}</b>${lab('fitted')}`)
      )
    case 'zero':
      return cell('s', `<b>$0</b>${lab('supply')}`) + cell('f', `<b>$0</b>${lab('fitted')}`)
    default:
      return `<span class="pc none">No price on the price list. <a class="door" href="#">Review ${ic('ArrowRight')}</a></span>`
  }
}

/* Board-wide: the room, the bar, the frame, and the notes. */
export const SHARED_CSS = `
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--color-ground); color: var(--color-ink); font-family: var(--font-sans);
  font-size: var(--text-base); line-height: 1.45; overflow-wrap: break-word; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, h4, p, ul, ol, dl, dd, figure { margin: 0; padding: 0; }
h1 { font-weight: 800; } h2, h3, h4 { font-weight: 700; }
ul, ol { list-style: none; }
.num, b { font-variant-numeric: tabular-nums lining-nums; }
.nw { white-space: nowrap; }
.sr { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }

/* THE BAR, as the app floats it: top on a desk, the foot on a phone. */
.bar { position: fixed; z-index: 30; inset-block-start: 8px; inset-inline: 0; margin-inline: auto; inline-size: max-content;
  display: flex; align-items: center; gap: 2px; padding: 4px 6px 4px 4px; border-radius: var(--radius-pill);
  background: var(--color-door); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
.bar a { display: inline-flex; align-items: center; gap: 6px; min-block-size: 36px; padding-inline: 12px; border-radius: var(--radius-pill);
  font-weight: 600; color: var(--color-ink-2); }
.bar a.on { background: var(--color-blue-800); color: var(--color-white); }
.bar .bar-find { box-shadow: inset 0 0 0 1px var(--color-rule-strong); background: var(--color-plate-tint); margin-inline-end: 6px; }
.bar-disc { display: grid; place-items: center; inline-size: 40px; block-size: 40px; border-radius: 50%; background: var(--color-blue-800); color: var(--color-white); margin-inline-end: 4px; box-shadow: 0 0 0 3px var(--color-blue-200); }
.bar-count { min-inline-size: 20px; padding-inline: 6px; border-radius: var(--radius-pill); background: var(--color-wash); font-size: var(--text-xs); text-align: center; color: var(--color-ink); }
body { padding-block: 64px 48px; }
@media (max-width: 599px) {
  .bar { inset-block: auto 8px; inline-size: calc(100% - 16px); justify-content: space-between; padding: 4px; }
  .bar a { flex-direction: column; gap: 0; padding-inline: 4px; min-block-size: 44px; font-size: var(--text-xs); justify-content: center; }
  .bar .bar-find span, .bar .bar-count { display: none; }
  .bar .bar-find { inline-size: 40px; block-size: 40px; border-radius: 50%; padding: 0; margin: 0; }
  .bar-disc { inline-size: 44px; block-size: 44px; margin: 0; }
  body { padding-block: 12px 104px; }
}
/* a phone held sideways is short: the bar sits at the foot and the page starts at the top */
@media (max-height: 480px) and (min-width: 600px) {
  .bar { inset-block: auto 6px; }
  body { padding-block: 10px 72px; }
}

.frame { inline-size: min(100% - 32px, 1360px); margin-inline: auto; }
@media (min-width: 600px) { .frame { inline-size: min(100% - 48px, 1360px); } }
@media (min-width: 1600px) { .frame { inline-size: min(100% - 96px, 1720px); } }

.eyebrow { font-size: var(--text-xs); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; color: var(--color-ink-3); }
.door { display: inline-flex; align-items: center; gap: 4px; font-weight: 600; color: var(--color-ink-file); white-space: nowrap; }
.door:hover { text-decoration: underline; }
.code { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-3); letter-spacing: 0; }
.find { display: flex; align-items: center; gap: 10px; min-block-size: 44px; padding-inline: 14px 8px; border-radius: var(--radius-field);
  background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-control-edge); color: var(--color-ink-3); min-inline-size: 0; }
.find input { all: unset; flex: 1; min-inline-size: 0; color: var(--color-ink); font-size: var(--text-base); }
.find input::placeholder { color: var(--color-ink-3); }
.ui-kbd { flex: none; }
.said { font-size: var(--text-sm); color: var(--color-ink-reason); }

/* A PRICE CELL: the figure, then its level in small words under it */
.pc { display: inline-grid; justify-items: end; line-height: 1.15; }
.pc b { font-weight: 700; font-size: var(--text-base); }
.pc small { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 600; }
.pc.quiet i { font-style: normal; font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 600; white-space: nowrap; }
.pc.f b { color: var(--color-ink); }
.pc.none { justify-items: start; font-size: var(--text-sm); color: var(--color-ink-reason); grid-column: span 2; }

/* THE NOTES: the board's own words, under the screen. Paper, so it never reads as the app. */
.notes { margin-block-start: 72px; padding-block: 48px 24px; background: var(--color-paper); border-block-start: 1px solid var(--color-rule-strong); }
.notes .frame { display: grid; gap: 36px; }
.notes h2 { font-size: var(--text-3xl); line-height: 1.15; letter-spacing: -0.01em; }
.notes h3 { font-size: var(--text-xl); margin-block-end: 8px; }
.notes p:not(.state p), .notes li:not(.state li) { max-inline-size: 72ch; color: var(--color-ink-2); font-size: var(--text-lg); line-height: 1.55; }
.notes li:not(.state li) { margin-block: 4px; }
.notes ul.dash li::before { content: '— '; color: var(--color-ink-3); }
.notes code { font-family: var(--font-mono); font-size: 0.9em; overflow-wrap: anywhere; }
.notes .cols { display: grid; gap: 28px 40px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); }
.notes table:not(.state table) { border-collapse: collapse; inline-size: 100%; font-size: var(--text-base); }
.notes th:not(.state th), .notes td:not(.state td) { text-align: start; vertical-align: top; padding: 8px 10px 8px 0; border-block-end: 1px solid var(--color-rule); }
.notes th:not(.state th) { color: var(--color-ink-3); font-weight: 700; font-size: var(--text-sm); }
.notes td:not(.state td):first-child { white-space: nowrap; font-weight: 700; color: var(--color-ink); }
.notes .state { padding: 24px; border-radius: var(--radius-plate); background: var(--color-ground); box-shadow: inset 0 0 0 1px var(--color-rule-strong); }
.notes .state > .eyebrow { margin-block-end: 14px; display: block; }
.notes .state { font-size: var(--text-base); color: var(--color-ink); }
.notes .state p { margin: 0; }
.specimen { display: grid; gap: 10px; }
.specimen > div { display: grid; grid-template-columns: minmax(0, 150px) minmax(0, 1fr); gap: 16px; align-items: baseline; border-block-end: 1px solid var(--color-rule); padding-block-end: 8px; }
.specimen span:first-child { font-size: var(--text-sm); color: var(--color-ink-3); font-family: var(--font-mono); }
.board-name { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: baseline; }
.board-name .eyebrow { color: var(--color-ink-file); }
.rec { display: inline-flex; padding: 2px 10px; border-radius: var(--radius-pill); background: var(--color-act); color: var(--color-ink-on-act); font-weight: 700; font-size: var(--text-sm); }
@media (max-width: 599px) { .notes p:not(.state p), .notes li:not(.state li) { font-size: var(--text-base); } .notes .state { padding: 14px; } .notes table:not(.state table) { font-size: var(--text-sm); } .notes td:not(.state td):first-child { white-space: normal; } }
`

/* THE JOBS TABLE every board carries: J1 to J15 from the judge, each answered where. */
export const jobsTable = (rows) => `
<section><h3>Every job the judge named, on this board</h3>
<table><thead><tr><th>Job</th><th>Where it is done</th></tr></thead><tbody>
${rows.map(([j, w]) => `<tr><td>${j}</td><td>${w}</td></tr>`).join('')}
</tbody></table></section>`
