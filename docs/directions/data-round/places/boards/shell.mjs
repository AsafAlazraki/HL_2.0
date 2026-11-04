/* What the three places boards share: the icons (Phosphor, the app's own set, rendered to SVG),
   the floating bar as the app draws it (Data lit, since a maker's page is a room of Data), the
   page skeleton, the kit's own button, chip and segmented markup, the maker's mark as the
   livery draws it, and the notes' jobs table. Tokens only: every colour, size, radius and shadow
   is a role read through kit.css, the app's own built stylesheet (e2e/out/dist-6280, the build
   the judge measured), and board.css. */
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
<link rel="stylesheet" href="board.css">
<style>
${PLACE_CSS}
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

/* THE KIT'S OWN CONTROLS, as src/ui/Button.tsx, Chip.tsx and Segmented.tsx render them */
export const btn = (label, { intent = 'quiet', size, icon, href = '#', cls = '', aria } = {}) => {
  const disc =
    intent === 'act' && icon
      ? `<span class="ui-button-disc" aria-hidden="true">${ic(icon)}</span>`
      : ''
  const lead = intent !== 'act' && icon ? ic(icon) : ''
  return `<span class="ui-button-frame ${cls}" data-intent="${intent}"${size ? ` data-size="${size}"` : ''}><a class="ui-button" data-intent="${intent}"${size ? ` data-size="${size}"` : ''}${['act', 'secondary', 'veiled'].includes(intent) ? ' data-ground="plate"' : ''} href="${href}"${aria ? ` aria-label="${esc(aria)}"` : ''}>${lead}${label}${disc}</a></span>`
}
export const chip = (label, { on = false, count, icon } = {}) =>
  `<span class="ui-chip-frame"><button class="ui-chip" aria-pressed="${on}">${icon ? ic(icon) : ''}${label}${count != null ? ` <span class="ui-chip-count">${count}</span>` : ''}</button></span>`
export const seg = (
  name,
  legend,
  options,
  value,
) => `<div class="ui-segmented-frame"><fieldset class="ui-segmented"><legend class="ui-segmented-legend">${esc(legend)}</legend>
${options
  .map(
    (o, i) =>
      `<label class="ui-segmented-option"${o === value ? ' data-checked' : ''}>${i === 0 ? '<span class="ui-segmented-thumb"></span>' : ''}<input class="ui-segmented-input" type="radio" name="${name}"${o === value ? ' checked' : ''}><span class="ui-segmented-face">${esc(o)}</span></label>`,
  )
  .join('')}
</fieldset></div>`

/* THE MARK, as the livery draws it: white ink on the ground, or its own colours on an inset
   plate; a place with no mark has its name set as a wordmark. Never initials. */
export const mark = (place, cls = '') => {
  const m = place.mark
  if (!m.drawn) return `<span class="pm-word ${cls}">${esc(place.name)}</span>`
  const img = `<img src="${m.mark.src}" alt="" width="${m.mark.width}" height="${m.mark.height}">`
  /* ONE OPTICAL SIZE (livery.ts markScale): a mark of another proportion covers a 4 : 1 mark's area */
  const scale = Math.min(
    1.6,
    Math.max(0.75, Math.sqrt(4 / (m.mark.width / m.mark.height))),
  ).toFixed(3)
  return m.mark.on === 'plate'
    ? `<span class="pm-plate ${cls}" style="--mark-scale:${scale}">${img}</span>`
    : `<span class="pm-mark ${cls}" style="--aspect:${(m.mark.width / m.mark.height).toFixed(3)};--mark-scale:${scale}">${img}</span>`
}

/* THE JOBS TABLE every board carries: J1 to J19 and the judge's missing items, each answered where */
export const jobsTable = (rows) => `
<section><h3>Every job and every missing item the judge named, on this board</h3>
<table><thead><tr><th>Job</th><th>Where it is done</th></tr></thead><tbody>
${rows.map(([j, w]) => `<tr><td>${j}</td><td>${w}</td></tr>`).join('')}
</tbody></table></section>`

export const specimen = (rows) =>
  `<div class="specimen">${rows
    .map(([k, style, text]) => `<div><span>${k}</span><span style="${style}">${text}</span></div>`)
    .join('')}</div>`

/* Board-wide, for a place: the mark at one optical size, the plate, the wordmark, the livery
   ground (kit.css's [data-livery] sets --livery and --grain). */
export const PLACE_CSS = `
.pm-mark { display: inline-block; block-size: calc(var(--mark-h, 44px) * var(--mark-scale, 1)); aspect-ratio: var(--aspect); max-inline-size: 100%; }
.pm-mark img { display: block; inline-size: 100%; block-size: 100%; object-fit: contain; object-position: left center; }
.pm-plate { display: inline-grid; place-items: center; padding: 6px 10px; border-radius: var(--radius-md); background: var(--color-white); box-shadow: var(--shadow-sm); }
.pm-plate img { display: block; block-size: calc(var(--mark-h, 44px) * var(--mark-scale, 1) - 12px); inline-size: auto; max-inline-size: 100%; }
.pm-word { font-weight: 800; font-size: var(--text-3xl); letter-spacing: var(--tracking-wordmark, -0.01em); line-height: 1.05; }
.livery { color: var(--color-white); background: var(--grain), linear-gradient(125deg, var(--livery), oklch(from var(--livery) calc(l - 0.1) c h)); }
.kindword { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.fig { font-variant-numeric: tabular-nums lining-nums; }
.cap { position: absolute; inset-inline-end: 10px; inset-block-start: 10px; padding: 3px 9px; border-radius: var(--radius-pill); background: var(--color-veil-72); color: var(--color-white); font-size: var(--text-xs); font-weight: 600; }
.quiet-say { font-size: var(--text-sm); color: var(--color-ink-reason); }
.mono { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-3); }
.ui-chip .ui-icon { margin-inline-end: 4px; }
`
