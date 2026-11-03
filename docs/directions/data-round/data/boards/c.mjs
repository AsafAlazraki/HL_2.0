/* DIRECTION C, "Ask the file". The find is the head, over the whole file. Empty, the page is
   a pulse since the file landed: six counted cells that are doors, one sentence, then the
   holdings under sentence heads, the 28 lists of what fits drawn as a maker-by-kind matrix.
   Filled, the rail of rooms becomes the answer's kinds. */
import * as F from './facts.mjs'
import { ic, kind, page, ROOM_GLYPH, MARKS } from './shell.mjs'

const f = F.fmt
const oldest = F.DATED[0]

const ROOMS = [
  ['Review', F.REVIEW.open, 'to settle'],
  ['Prices', F.PRICES.open, 'to choose'],
  ['Rules', F.RULES.noticed, 'noticed'],
  ['Fitment', F.MODELS, 'models'],
  ['Catalogue', f(F.CATALOGUE.onSale), 'on sale'],
  ['Shelf', F.SHELF.copies, 'copies saved'],
]
const rail = `
<aside class="c-rail" aria-label="The price list">
  <h1>Data</h1>
  <p class="c-stamp">The price list of <b class="nw">16 September 2026</b><br><b>${F.LISTS}</b> lists · <b>${f(F.LINES)}</b> lines</p>
  <nav class="c-rooms" aria-label="Its rooms">
    <a class="c-room is-on" href="#" aria-current="page">${ic('Pulse')}<span>The file, since it landed</span></a>
    ${ROOMS.map(([n, c, w]) => `<a class="c-room" href="#">${ic(ROOM_GLYPH[n])}<span>${n} <i>${w}</i></span><b>${c}</b></a>`).join('')}
  </nav>
  <button class="ui-button c-new" data-intent="secondary" type="button">${ic('Plus')}New list</button>
</aside>`

const cell = (fig, say, of, door) =>
  `<li><a class="c-cell" href="#"><b>${fig}</b><span class="c-cell-say">${say}</span><span class="c-cell-of">${of}</span><span class="c-cell-door">${door} ${ic('ArrowRight')}</span></a></li>`

const pulse = `
<section class="c-pulse" aria-labelledby="c-pulse-h">
  <header class="c-pulse-head"><h2 id="c-pulse-h">Since the price list of 16&nbsp;September&nbsp;2026</h2><p>What only Northside can settle, counted. Each is a door.</p></header>
  <ul class="c-cells plate">
    ${cell(F.REVIEW.open, 'to settle in Review', `0 of ${F.REVIEW.open} settled · ${F.REVIEW.tidy} to tidy after`, 'Settle')}
    ${cell(F.PRICES.open, 'prices to choose', `they price ${f(F.PRICE_LINES)} lines`, 'Choose')}
    ${cell(F.DATED.length, 'sections dated by their heading', `of ${F.DATED_HEADINGS_IN_THOSE} headings · oldest ${F.day(oldest.iso)}`, 'Oldest first')}
    ${cell(f(F.UNNAMED_LINES), 'lines named by no boat', `in ${F.UNNAMED.length} of the 18 lists you sell from`, 'Show')}
    ${cell(F.RULES.noticed, 'rules noticed, not written', `${F.RULES.kept} kept by the file · ${F.RULES.written} by Northside`, 'Rules')}
    ${cell(F.CHANGED, 'lines changed by Northside', `of ${f(F.LINES)} · ${F.MADE_HERE} lists made here`, 'Shelf')}
  </ul>
  <p class="c-summary">The file holds <b>${f(F.LINES)}</b> lines in <b>${F.LISTS}</b> lists: <b>${f(F.BOAT_LINES)}</b> boat lines from <b>${F.MAKERS.length}</b> makers, <b>${f(F.BASE_LINES)}</b> in <b>${F.base.length}</b> lists you sell from, and <b>${f(F.JOIN_LINES)}</b> in <b>${F.joins.length}</b> lists of what fits. Northside has changed <b>${F.CHANGED}</b> of them and brought in no new price list. Its oldest dated price says <b>${F.day(oldest.iso)}</b>.</p>
</section>`

const ruled = (id, words) => `<h2 class="c-ruled" id="${id}"><span>${words}</span></h2>`
const markOf = (m, cls = '') =>
  m.mark ? `<img class="mark-img ${cls}" src="${MARKS}${m.mark}" alt="${m.name}">` : `<span class="mark-word ${cls}">${m.name}</span>`

const makers = `
<section aria-labelledby="c-mk">
  ${ruled('c-mk', `<b>${F.MAKERS.length}</b> makers, <b>${F.MODELS}</b> models, in <b>${f(F.BOAT_LINES)}</b> lines`)}
  <ul class="c-makers">${F.MAKERS.map((m) => `<li><a href="#" class="c-maker"><span class="c-maker-mark">${markOf(m)}</span><span>${m.models} models${m.series ? ` · ${m.series} series` : ''}</span></a></li>`).join('')}</ul>
</section>`

/* the matrix: each maker against what its lists of what fits pair it with */
const COLS = [
  ['Motors', ['Yamaha', 'Factory Packages'], 'motor'],
  ['NSM Custom', ['NSM Custom'], 'trailer'],
  ['GFAB', ['GFAB'], 'trailer'],
  ['Own trailers', ['Stacer Trailers', 'Dunbier/Haines BMT', 'OBSOLETE Trailers'], 'trailer'],
  ['Dealer Fit', ['Dealer Fit'], 'package'],
  ['P/D Parts', ['P/D Parts'], 'accessory'],
]
const short = { Yamaha: 'Yamaha', 'Factory Packages': 'packages', 'Stacer Trailers': 'Stacer', 'Dunbier/Haines BMT': 'BMT', 'OBSOLETE Trailers': 'obsolete' }
const matrix = `
<section aria-labelledby="c-mx">
  ${ruled('c-mx', `<b>${F.joins.length}</b> lists of what fits, <b>${f(F.JOIN_LINES)}</b> lines across <b>${F.MAKERS.length}</b> makers`)}
  <div class="c-matrix plate">
  <table>
    <thead><tr><th scope="col">Maker</th>${COLS.map(([c, , k]) => `<th scope="col">${kind(k)}<span>${c}</span></th>`).join('')}<th scope="col" class="n">Lines</th></tr></thead>
    <tbody>${F.MAKERS.map((m) => {
      const j = F.joinsOf(m.key)
      const tds = COLS.map(([c, sides]) => {
        const hit = j.filter((t) => sides.includes(F.farSide(t)))
        if (!hit.length) return `<td class="c-none" data-col="${c}"><span aria-label="no list">·</span></td>`
        return `<td data-col="${c}">${hit
          .map((t) => `<a href="#" class="c-pair"><b>${f(t.rowCount)}</b>${sides.length > 1 ? `<span>${short[F.farSide(t)]}</span>` : ''}</a>`)
          .join('')}</td>`
      }).join('')
      return `<tr><th scope="row"><span class="c-mx-mark">${markOf(m, 'c-sm')}</span><span class="c-mx-n">${j.length} lists</span></th>${tds}<td class="n c-mx-total"><b>${f(j.reduce((a, t) => a + t.rowCount, 0))}</b></td></tr>`
    }).join('')}</tbody>
  </table>
  </div>
  <p class="c-mx-say">Each figure is the pairings in one list, and opens it on the sheet. A dot means the maker has no list of that kind.</p>
</section>`

const fitsSay = (r) =>
  r.gone ? '<span class="none">no longer sold</span>' : r.fits === 'own' ? '<span class="none">not tied to a boat</span>' : r.fits === 0 ? '<span class="zero">named by no boat</span>' : `fits ${r.fits} boats`
const base = `
<section aria-labelledby="c-bs">
  ${ruled('c-bs', `<b>${F.base.length}</b> lists you sell from, <b>${f(F.BASE_LINES)}</b> lines`)}
  <div class="c-base">${F.BASE.map(
    (g) => `<div class="c-bgroup"><h3 class="eyebrow">${g.group}</h3><ul>${g.rows
      .map((r) => {
        const t = F.byKey[r.key]
        return `<li><a href="#" class="c-brow${r.gone ? ' is-gone' : ''}">${kind(t.kind)}<span class="c-bname">${t.name}</span><span class="c-bn"><b>${f(t.rowCount)}</b></span><span class="c-bfits">${r.noun}${r.in ? ` in ${r.in}` : ''} · ${fitsSay(r)}</span></a></li>`
      })
      .join('')}</ul></div>`,
  ).join('')}</div>
</section>`

const body = `
<div class="frame c">
  ${rail}
  <main class="c-main" id="main">
    <label class="find c-find">${ic('MagnifyingGlass', { size: 'lg' })}<span class="sr">Ask the price file</span><input placeholder="Ask: a maker, a list, a section or a code"><kbd class="ui-kbd"><span class="ui-kbd-key">/</span></kbd></label>
    ${pulse}
    ${makers}
    ${matrix}
    ${base}
  </main>
</div>`

/* THE SECOND STATE: F115 typed. Every line whose own words name it, by kind. */
const hits = F.linesNaming('F115')
const by = (pred) => hits.filter(pred)
const joinHits = by((h) => h.role === 'join')
const joinLines = joinHits.reduce((a, h) => a + h.n, 0)
const total = hits.reduce((a, h) => a + h.n, 0)
const baseHits = by((h) => h.role === 'base')
const kinds = [
  ['Motors', F.yamahaF115.length, 'motor'],
  ['Lists of what fits', joinLines, 'boat'],
  ...baseHits.filter((h) => h.key !== 'mot_yamaha').map((h) => [h.name, h.n, h.kind]),
]
const answer = `
<div class="state">
  <span class="eyebrow">Typed: F115 · /data?find=F115</span>
  <div class="c-ans">
    <aside class="c-kinds plate">
      <p class="c-kinds-h"><b>${f(total)}</b> lines name F115</p>
      <ul>${kinds.map(([n, c, k], i) => `<li><a href="#" class="c-kind${i === 0 ? ' is-on' : ''}">${kind(k)}<span>${n}</span><b>${f(c)}</b></a></li>`).join('')}</ul>
      <p class="c-kinds-say">Counted over every list’s own words, codes included. Nothing on the price list is a maker or a section called F115.</p>
    </aside>
    <div class="c-results">
      <div class="c-desk plate">${ic('Info', { size: 'md' })}<p><b>At the desk with a customer?</b> The bar’s Find puts an F115 straight on a quote. The Catalogue holds the parts that go with it.</p><a class="door" href="#">Find on the bar ${ic('ArrowRight')}</a></div>
      <section class="plate c-res">
        <p class="c-crumb">${kind('motor')} Yamaha Outboards › Four Stroke Models, Twin Rig Options, VMAX SHO</p>
        <h3>${F.yamahaF115.length} motors <a class="door" href="#">Open them on the sheet ${ic('ArrowRight')}</a></h3>
        <table class="c-rtable"><thead><tr><th>Code</th><th>On the price list as</th><th>Shaft</th><th>Steering</th></tr></thead><tbody>
        ${F.yamahaF115.slice(0, 8).map((m) => `<tr><td><b>${m.code}</b></td><td>${m.name}</td><td>${m.shaft}</td><td>${m.steer}</td></tr>`).join('')}
        </tbody></table>
        <p class="c-more"><a class="door" href="#">The other ${F.yamahaF115.length - 8}: twin rigs and VMAX SHO ${ic('ArrowRight')}</a></p>
      </section>
      <section class="plate c-res">
        <p class="c-crumb">${kind('boat')} Lists of what fits</p>
        <h3>${joinHits.length} lists pair it with a boat, in ${f(joinLines)} lines</h3>
        <ul class="c-jl">${joinHits.map((h) => `<li><a href="#"><span>${h.name.replace(' — Motor Fitment', '')}</span><b>${h.n}</b></a></li>`).join('')}</ul>
      </section>
    </div>
  </div>
</div>`

const css = `
.c { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 36px; align-items: start; }
.c-rail { position: sticky; top: 72px; display: grid; gap: 16px; }
.c-rail h1 { font-size: var(--text-6xl); line-height: 1; letter-spacing: -0.02em; }
.c-stamp { color: var(--color-ink-2); }
.c-stamp b { color: var(--color-ink); }
.c-rooms { display: grid; gap: 2px; border-block: 1px solid var(--color-rule-strong); padding-block: 8px; }
.c-room { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 8px 10px; border-radius: var(--radius-field); font-weight: 600; color: var(--color-ink); }
.c-room .ui-icon { color: var(--color-ink-file); }
.c-room i { font-style: normal; font-weight: 400; color: var(--color-ink-3); font-size: var(--text-sm); }
.c-room b { min-inline-size: 26px; padding: 1px 8px; border-radius: var(--radius-pill); background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule-strong); text-align: center; font-size: var(--text-sm); }
.c-room:hover { background: var(--color-wash); }
.c-room.is-on { background: var(--color-plate); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); grid-template-columns: auto minmax(0, 1fr); }
.c-room.is-on::before { content: ''; position: absolute; inset-block: 8px; inset-inline-start: -1px; inline-size: 3px; border-radius: 2px; background: var(--color-ink-file); }
.c-new { justify-self: start; }

.c-main { display: grid; gap: 30px; min-inline-size: 0; }
.c-find { min-block-size: 60px; border-radius: var(--radius-lg); box-shadow: inset 0 0 0 1.5px var(--color-control-edge), var(--shadow-plate); padding-inline: 18px 12px; }
.c-find input { font-size: var(--text-xl); }
.c-pulse { display: grid; gap: 14px; }
.c-pulse-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 4px 16px; }
.c-pulse-head h2 { font-size: var(--text-3xl); letter-spacing: -0.01em; }
.c-pulse-head p { color: var(--color-ink-3); }
.c-cells { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); overflow: hidden; }
.c-cells li { border-inline-end: 1px solid var(--color-rule); border-block-end: 1px solid var(--color-rule); }
.c-cells li:nth-child(3n) { border-inline-end: 0; }
.c-cells li:nth-last-child(-n+3) { border-block-end: 0; }
.c-cell { display: grid; gap: 2px; padding: 18px 20px; block-size: 100%; }
.c-cell:hover { background: var(--color-wash); }
.c-cell b { font-size: var(--text-5xl); line-height: 1; font-weight: 800; letter-spacing: -0.02em; }
.c-cell-say { font-weight: 700; font-size: var(--text-lg); }
.c-cell-of { color: var(--color-ink-3); font-size: var(--text-sm); }
.c-cell-door { display: inline-flex; gap: 6px; align-items: center; margin-block-start: 8px; color: var(--color-ink-file); font-weight: 600; }
.c-summary { font-size: var(--text-lg); color: var(--color-ink-2); max-inline-size: 90ch; line-height: 1.6; }
.c-summary b { color: var(--color-ink); }

.c-ruled { display: flex; align-items: center; gap: 16px; font-size: var(--text-lg); font-weight: 400; color: var(--color-ink-2); margin-block-end: 14px; }
.c-ruled::before, .c-ruled::after { content: ''; flex: 1; block-size: 1px; background: var(--color-rule-strong); }
.c-ruled::before { flex: 0 0 24px; }
.c-ruled b { color: var(--color-ink); font-weight: 800; }
.c-makers { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; }
.c-maker { display: grid; gap: 8px; padding: 12px 10px; border-radius: var(--radius-tile); background: var(--color-plate); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); font-size: var(--text-sm); color: var(--color-ink-2); block-size: 100%; }
.c-maker-mark { block-size: 26px; display: flex; align-items: center; }
.c-maker-mark .mark-img { max-inline-size: 100%; }

.c-matrix { overflow: hidden; }
.c-matrix table { inline-size: 100%; border-collapse: collapse; }
.c-matrix th, .c-matrix td { padding: 10px 12px; border-block-end: 1px solid var(--color-rule); text-align: start; vertical-align: middle; }
.c-matrix thead th { white-space: nowrap; font-size: var(--text-sm); color: var(--color-ink-2); font-weight: 700; background: var(--color-plate-tint); }
.c-matrix thead th .ui-kind { margin-inline-end: 6px; }
.c-matrix thead th > span { vertical-align: middle; }
.c-matrix tbody th { display: flex; align-items: center; gap: 10px; font-weight: 400; }
.c-mx-mark { inline-size: 110px; display: flex; }
.c-sm.mark-img { max-block-size: 20px; max-inline-size: 104px; }
.c-sm.mark-word { font-size: var(--text-base); }
.c-mx-n { color: var(--color-ink-3); font-size: var(--text-sm); }
.c-pair { display: inline-flex; gap: 4px; align-items: baseline; padding: 3px 8px; border-radius: var(--radius-xs); margin: 1px 4px 1px -8px; }
.c-pair:hover { background: var(--color-wash); color: var(--color-ink-file); }
.c-pair span { color: var(--color-ink-3); font-size: var(--text-sm); }
.c-none { color: var(--color-ink-3); }
.c-matrix .n { text-align: end; }
.c-mx-say { color: var(--color-ink-3); font-size: var(--text-sm); margin-block-start: 8px; }
.c-matrix tbody tr:last-child > * { border-block-end: 0; }

.c-base { columns: 3; column-gap: 16px; }
.c-bgroup { break-inside: avoid; margin-block-end: 16px; display: block; background: var(--color-plate); border-radius: var(--radius-tile); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); padding: 12px 0 6px; }
.c-bgroup h3 { padding-inline: 14px; margin-block-end: 4px; }
.c-brow { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0 10px; align-items: center; padding: 6px 14px; }
.c-brow:hover { background: var(--color-wash); }
.c-brow > .ui-kind { grid-row: 1 / span 2; }
.c-bname { font-weight: 600; }
.c-bfits { grid-column: 2 / -1; color: var(--color-ink-3); font-size: var(--text-sm); }
.c-brow.is-gone .c-bname { color: var(--color-ink-3); }
.none { color: var(--color-ink-3); }
.zero { color: var(--accent-ochre); font-weight: 600; }

/* the answer, in the notes */
.c-ans { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 20px; align-items: start; }
.c-kinds { padding: 14px 8px; }
.c-kinds-h { padding: 0 10px 8px; font-size: var(--text-lg); }
.c-kinds-h b { font-size: var(--text-2xl); font-weight: 800; }
.c-kind { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 7px 10px; border-radius: var(--radius-field); font-weight: 600; }
.c-kind.is-on { background: var(--color-chosen-wash); box-shadow: inset 3px 0 0 var(--color-ink-file); }
.c-kinds-say { padding: 10px 10px 0; color: var(--color-ink-3); font-size: var(--text-sm); }
.c-results { display: grid; gap: 14px; min-inline-size: 0; }
.c-desk { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 14px 18px; background: var(--color-plate-tint); }
.c-desk > .ui-icon { color: var(--color-ink-file); }
.c-res { padding: 16px 18px; }
.c-crumb { display: flex; align-items: center; gap: 8px; color: var(--color-ink-3); font-size: var(--text-sm); }
.c-res h3 { display: flex; flex-wrap: wrap; gap: 4px 16px; align-items: baseline; font-size: var(--text-xl); margin-block: 6px 8px; }
.c-res h3 .door { font-size: var(--text-base); }
.c-rtable { inline-size: 100%; border-collapse: collapse; }
.c-rtable th, .c-rtable td { text-align: start; padding: 6px 8px 6px 0; border-block-end: 1px solid var(--color-rule); }
.c-rtable th { font-size: var(--text-sm); color: var(--color-ink-3); }
.c-more { margin-block-start: 8px; }
.c-jl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 24px; }
.c-jl a { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-block-end: 1px solid var(--color-rule); }

@media (min-width: 1600px) {
  .c { grid-template-columns: 280px minmax(0, 1fr); gap: 48px; }
  .c-cells { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .c-cells li { border-block-end: 0; }
  .c-cells li:nth-child(3n) { border-inline-end: 1px solid var(--color-rule); }
  .c-cells li:last-child { border-inline-end: 0; }
}
@media (max-width: 1365px) {
  .c-base { columns: 2; }
}
@media (max-width: 1099px) {
  .c { grid-template-columns: minmax(0, 1fr) auto; gap: 24px 16px; }
  .c-rail, .c-main { display: contents; }
  .c-rail > *, .c-main > * { grid-column: 1 / -1; order: 4; min-inline-size: 0; }
  .c-rail h1 { grid-column: 1; grid-row: 1; }
  .c-new { grid-column: 2; grid-row: 1; align-self: center; }
  .c-stamp { grid-row: 2; margin-block-start: -16px; }
  .c-find { order: 1; }
  .c-pulse { order: 2; }
  .c-rooms { order: 3; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 0; padding: 0; gap: 6px; }
  .c-room { background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule); }
  .c-room.is-on { display: none; }
  .c-main { gap: 24px; }
  .c-matrix { overflow-x: auto; }
  .c-matrix table { min-inline-size: 760px; }
  .c-ans { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 599px) {
  .c-rail h1 { font-size: var(--text-5xl); }
  .c-find { position: sticky; top: 8px; z-index: 5; min-block-size: 52px; }
  .c-find input { font-size: var(--text-base); }
  .c-find .ui-kbd { display: none; }
  .c-rooms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .c-room { padding: 8px; gap: 6px; }
  .c-room i { display: none; }
  .c-pulse-head h2 { font-size: var(--text-2xl); }
  .c-cells { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .c-cells li:nth-child(3n) { border-inline-end: 1px solid var(--color-rule); }
  .c-cells li:nth-child(2n) { border-inline-end: 0; }
  .c-cells li:nth-last-child(-n+3) { border-block-end: 1px solid var(--color-rule); }
  .c-cells li:nth-last-child(-n+2) { border-block-end: 0; }
  .c-cell { padding: 12px; }
  .c-cell b { font-size: var(--text-4xl); }
  .c-cell-say { font-size: var(--text-base); }
  .c-summary { font-size: var(--text-base); }
  .c-makers { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .c-makers li:last-child { grid-column: 1 / -1; }
  .c-base { columns: 1; }
  .c-matrix { overflow: visible; background: none; box-shadow: none; }
  .c-matrix table { min-inline-size: 0; }
  .c-matrix table, .c-matrix tbody, .c-matrix tr, .c-matrix td, .c-matrix tbody th { display: block; }
  .c-matrix thead { display: none; }
  .c-matrix tbody { display: grid; gap: 10px; }
  .c-matrix tr { background: var(--color-plate); border-radius: var(--radius-tile); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); padding: 10px 14px; display: grid; grid-template-columns: minmax(0, 1fr) auto; }
  .c-matrix tbody th { grid-column: 1; border: 0; padding: 0 0 6px; }
  .c-matrix td { border: 0; padding: 3px 0; display: flex; justify-content: space-between; gap: 12px; grid-column: 1 / -1; }
  .c-matrix td::before { content: attr(data-col); flex: 1; color: var(--color-ink-3); font-size: var(--text-sm); }
  .c-matrix td { justify-content: flex-start; }
  .c-matrix td.c-none { display: none; }
  .c-matrix td.c-mx-total { grid-column: 2; grid-row: 1; padding: 0; }
  .c-matrix td.c-mx-total::before { content: none; }
  .c-pair { margin: 0 0 0 8px; padding: 0; }
  .c-desk { grid-template-columns: auto minmax(0, 1fr); }
  .c-desk .door { grid-column: 2; }
  .c-jl { grid-template-columns: minmax(0, 1fr); }
  .c-rtable th:nth-child(4), .c-rtable td:nth-child(4) { display: none; }
}
`

const notes = `
<section class="notes" aria-label="The board">
  <div class="frame">
    <header class="board-name"><span class="eyebrow">Data · Direction C</span><h2>Ask the file</h2></header>
    <div class="cols">
      <div>
        <h3>The one job</h3>
        <p>The Master Price File as one place: what needs Northside, what is new, the rooms, and every list it carries, each a door (docs/SCREENS.md, the owner on 2026-10-31).</p>
        <h3 style="margin-top:18px">What only this screen does</h3>
        <p>It is the only screen that answers “where is it?” across the whole file at once. Makers, the 28 lists of what fits, sections and lines are counted by kind in one answer. It also draws the 28 lists of what fits as what they are: a table of each maker against what it is paired with. The bar’s Find answers for a quote, Fitment for one boat. Only Data answers for the file.</p>
      </div>
      <div>
        <h3>Order and grouping</h3>
        <ol>
          <li>1. A rail at the left: the title, the file’s stamp, and the six rooms as counted rows (“The file, since it landed” lit).</li>
          <li>2. The find, as the head of the page and the widest control on it.</li>
          <li>3. <b>The pulse</b>: six counted cells since 16 September 2026, each a door, then one sentence with every figure in bold.</li>
          <li>4. The holdings under ruled sentence heads: the makers, then the <b>matrix</b> of the 28 lists of what fits (makers against motors, trailers, Dealer Fit and P/D parts), then the 18 lists you sell from in their groups.</li>
          <li>Typed into, the rail becomes the answer’s kinds and the main column becomes the answer (drawn below).</li>
        </ol>
      </div>
    </div>
    <div class="cols">
      <div>
        <h3>References new to this board</h3>
        <ul class="dash">
          <li><b>GitHub search, “Filter by”</b>, at <code>docs/research/refs/data/round-2/live/github-search-facets.png</code>. The kinds are counted in a left column, with the current one tinted and barred. This is the rail, both at rest and answering.</li>
          <li><b>GitHub Insights, Pulse</b>, at <code>live/github-pulse.png</code>. Its period summary runs as counted cells, then a sentence with bold figures, then lists under ruled sentence heads. This is the pulse and the “28 lists of what fits, 8,679 lines across 7 makers” heads.</li>
        </ul>
        <p>It also draws on <code>live/mdn-search.png</code> (each result’s kind as a crumb over its title) and on <code>hand/plausible-390.png</code> (the whole state in the first window of a phone, 2-up).</p>
      </div>
      <div>
        <h3>The mark</h3>
        <p>The marks appear twice, and at two jobs. They sit in a row of seven tiles under the makers’ ruled head, and at 20 px down the matrix’s first column, where they name each row. A wordless matrix would make a reader decode a code, so the mark is the row label. Stabicraft is set as a word.</p>
        <h3 style="margin-top:18px">What a dealer can replace</h3>
        <p>The accent (the rail’s lit bar, the doors and the room glyphs) and the kind inks in the matrix’s heads. The figures carry the page, so there is no photograph to lose.</p>
      </div>
    </div>
    ${answer}
    <div class="cols">
      <div>
        <h3>Type, at 1:1</h3>
        <div class="specimen">
          <div><span>6xl 40 800</span><span style="font-size:var(--text-6xl);font-weight:800;line-height:1">Data</span></div>
          <div><span>5xl 34 800</span><span style="font-size:var(--text-5xl);font-weight:800;line-height:1">37</span></div>
          <div><span>3xl 26 700</span><span style="font-size:var(--text-3xl);font-weight:700">Since the price list of 16 September 2026</span></div>
          <div><span>xl 18 400</span><span style="font-size:var(--text-xl)">Ask the price file: a maker, a list…</span></div>
          <div><span>lg 16 400/800</span><span style="font-size:var(--text-lg)">The file holds <b>15,691</b> lines in <b>53</b> lists</span></div>
          <div><span>sm 13 400</span><span style="font-size:var(--text-sm);color:var(--color-ink-3)">0 of 37 settled · 138 to tidy after</span></div>
        </div>
        <p style="margin-top:10px">One face. The cells’ figures are the largest type on the page. The find’s placeholder is 18 px, because the find is the head.</p>
      </div>
      <div>
        <h3>Motion</h3>
        <p>Typing a first letter does three things. The pulse fades out over 120 ms. The rail’s rooms crossfade to the answer’s kinds over 160 ms, in place, with nothing sliding. The answer’s groups appear in their final positions with no stagger. Clearing the field reverses it. The rail never moves, and the find stays put (sticky at 390). A count that changes swaps in place. Reduced motion: no fades, only the swap.</p>
        <h3 style="margin-top:18px">Keyboard</h3>
        <p><kbd>/</kbd> or typing from anywhere lands in the find. ↓ moves from the field into the answer’s kinds, then into its results. Esc clears the field and returns to the pulse. At rest, Tab goes from the find to the six cells, then the matrix (a grid, arrows inside), then the lists.</p>
      </div>
    </div>
    <div>
      <h3>How it reflows</h3>
      <table>
        <tr><th>Size</th><th>What the composition becomes</th></tr>
        <tr><td>390×844</td><td>The title, the stamp and New list, then the find, which sticks to the top as the page scrolls. The cells go 2-up, three rows of two, and fill the first window. Then come the sentence and the rooms as a 2-up counted grid, so the state comes before the doors. The makers go 2-up with Haines across. The matrix becomes one card per maker, listing only the kinds it has. The lists you sell from are stacked. Typed into, the kinds become a counted row above the answer.</td></tr>
        <tr><td>844×390</td><td>One column: the rail’s title becomes the head, then the find, the cells 3-up, and the rooms 3-up after them. The matrix scrolls inside its own card, so the page itself never scrolls sideways.</td></tr>
        <tr><td>834×1112</td><td>As 844, with more height. The first window holds the head, the find, all six cells and the rooms.</td></tr>
        <tr><td>1280×800</td><td>A rail of 260 px and the main column. The cells are 3×2, the seven makers stay one row of seven (never 4 + 3 with a hole), and the lists go 2 columns. The first window holds the find and the six cells.</td></tr>
        <tr><td>1440×900</td><td>As drawn, with the seven makers in one row and the lists 3-up.</td></tr>
        <tr><td>1920×1080</td><td>The six cells make one row, so the pulse is one band. The matrix and the makers sit in the first window, and the floor is used.</td></tr>
      </table>
    </div>
    <div class="cols">
      <div>
        <h3>Honest constraints</h3>
        <ul class="dash">
          <li>The F115 answer is counted over every list’s own words, codes included: ${f(total)} lines. The build counts through <code>src/domain/catalogue/search</code>, and the board says this answer is the file’s own text and not an index.</li>
          <li>“Nothing on the price list is a maker or a section called F115” is true. The answer says what it is not, as well as what it is.</li>
          <li>The cells are doors, never trends. There is no arrow and no “since last week”, because the file has one date.</li>
          <li>No cost or margin appears in the answer. The motors table shows code, name, shaft and steering, the file’s own facts.</li>
        </ul>
      </div>
      <div>
        <h3>Its risk</h3>
        <p>The needs read as figures, not as a list to finish. Nothing turns to a tick, and a dealer sees 37 beside 0 without being told which matters more. The sticky rail also makes the screen a two-part layout that other screens do not have.</p>
        <h3 style="margin-top:18px">Owed whatever wins</h3>
        <p>The same three fixes as A: no sideways scroll on the OBSOLETE spread at 390, <i>Make it</i> refusing an empty name in a sentence, and a 72 px scroll margin under the bar at 844×390.</p>
      </div>
    </div>
  </div>
</section>`

export const html = page({ title: 'Data C · Ask the file', id: 'c', css, body, notes })
