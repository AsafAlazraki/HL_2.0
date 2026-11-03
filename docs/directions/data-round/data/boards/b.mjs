/* DIRECTION B, "Every list dated". The price file drawn as a published dataset: an About
   card (when, how big, what it waits on), the rooms as the page's own counted tabs, then ONE
   table of every list, each row carrying its own date and its own state. */
import * as F from './facts.mjs'
import { ic, kind, page, ROOM_GLYPH, MARKS } from './shell.mjs'

const f = F.fmt
const oldest = F.DATED[0]
const newest = F.DATED.at(-1)
const short = (iso) => F.day(iso)

const TABS = [
  ['Review', F.REVIEW.open, 'to settle'],
  ['Prices', F.PRICES.open, 'to choose'],
  ['Rules', F.RULES.noticed, 'noticed'],
  ['Fitment', F.MODELS, 'models'],
  ['Catalogue', f(F.CATALOGUE.onSale), 'on sale'],
  ['Shelf', F.SHELF.copies, 'copies'],
]
const tabs = `
<nav class="b-tabs" aria-label="The price list and its rooms">
  <a class="b-tab is-on" href="#" aria-current="page">${ic('Database')}<span>About the file</span></a>
  ${TABS.map(([n, c, w]) => `<a class="b-tab" href="#">${ic(ROOM_GLYPH[n])}<span>${n}</span><b class="b-tab-n">${c}</b><span class="b-tab-w">${w}</span></a>`).join('')}
</nav>`

const share = (n) => ((n / F.LINES) * 100).toFixed(2)
const about = `
<section class="b-about plate" aria-labelledby="b-about-h">
  <h2 id="b-about-h" class="sr">About the file</h2>
  <div class="b-when">
    <p class="b-lab">Updated</p>
    <p class="b-date">16 September 2026</p>
    <dl class="b-dl">
      <div><dt>Packed from the workbook</dt><dd>16 September 2026</dd></div>
      <div><dt>Northside’s last change</dt><dd>None yet</dd></div>
      <div><dt>Oldest price a heading dates</dt><dd>${short(oldest.iso)}</dd></div>
      <div><dt>Newest price a heading dates</dt><dd>${short(newest.iso)}</dd></div>
    </dl>
  </div>
  <div class="b-size">
    <div class="b-census">
      <p><span class="b-lab">Lists</span><b>${F.LISTS}</b></p>
      <p><span class="b-lab">Lines</span><b>${f(F.LINES)}</b></p>
    </div>
    <p class="b-each">A line is a boat, a motor, a trailer, a part or a rate Northside sells, or one pairing of what fits a boat.</p>
    <div class="b-split" role="img" aria-label="${f(F.BOAT_LINES)} boat lines, ${f(F.BASE_LINES)} lines in the lists you sell from, ${f(F.JOIN_LINES)} lines of what fits">
      <span style="--w:${share(F.BOAT_LINES)}%" data-k="boat"></span><span style="--w:${share(F.BASE_LINES)}%" data-k="base"></span><span style="--w:${share(F.JOIN_LINES)}%" data-k="join"></span>
    </div>
    <ul class="b-key">
      <li data-k="boat"><b>${f(F.BOAT_LINES)}</b> boats, in 7 lists</li>
      <li data-k="base"><b>${f(F.BASE_LINES)}</b> in ${F.base.length} lists you sell from</li>
      <li data-k="join"><b>${f(F.JOIN_LINES)}</b> in ${F.joins.length} lists of what fits</li>
    </ul>
  </div>
  <div class="b-needs">
    <h3>What needs Northside</h3>
    <dl class="b-ask">
      <div><dt>${ic('SealCheck')}To settle</dt><dd><b>${F.REVIEW.open}</b> cases in ${Object.keys(F.REVIEW_BY_LIST).length} lists, the most money first. ${F.REVIEW.tidy} to tidy after them.</dd><dd class="b-ask-door"><a class="door" href="#">Review ${ic('ArrowRight')}</a></dd></div>
      <div><dt>${ic('Tag')}To choose</dt><dd><b>${F.PRICES.open}</b> answers about price, by ${f(F.PRICE_LINES)} lines. Until then each quotes as it does today.</dd><dd class="b-ask-door"><a class="door" href="#">Prices ${ic('ArrowRight')}</a></dd></div>
      <div><dt>${ic('CalendarBlank')}Dated</dt><dd><b>${F.DATED.length}</b> of ${F.DATED_HEADINGS_IN_THOSE} headings in ${F.DATED_LISTS.length} lists say when they were priced. ${F.datedByYear[0].headings} say ${F.datedByYear[0].year}, the oldest ${short(oldest.iso)}.</dd><dd class="b-ask-door"><a class="door" href="#">Oldest first ${ic('ArrowRight')}</a></dd></div>
      <div><dt>${ic('LinkBreak')}Named by no boat</dt><dd><b>${F.UNNAMED.length}</b> lists, ${f(F.UNNAMED_LINES)} lines: ${F.UNNAMED.map((r) => F.byKey[r.key].name.replace(/ (Trailers|Outboards)$/, '')).join(', ')}.</dd><dd class="b-ask-door"><a class="door" href="#">Show them ${ic('ArrowRight')}</a></dd></div>
      <div><dt>${ic('Scales')}Rules</dt><dd><b>${F.RULES.noticed}</b> noticed in the file and not written. ${F.RULES.kept} kept by the file, ${F.RULES.written} by Northside.</dd><dd class="b-ask-door"><a class="door" href="#">Rules ${ic('ArrowRight')}</a></dd></div>
      <div><dt>${ic('Sparkle')}New here</dt><dd><b>${F.CHANGED}</b> of ${f(F.LINES)} lines changed, <b>${F.MADE_HERE}</b> lists made. No new price list brought in, no copy saved.</dd><dd class="b-ask-door"><a class="door" href="#">Shelf ${ic('ArrowRight')}</a></dd></div>
    </dl>
  </div>
</section>`

/* one row of the table */
const datedCell = (key) => {
  const d = F.datedOf(key)
  if (!d.length) return '<span class="none">not dated</span>'
  const heads = key === 'parts' ? 187 : key === 'rig_kits' ? 26 : key === 'trl_gfab' ? 5 : key === 'boat_haines' ? 3 : 1
  return `<span class="b-asat"><b>${short(d[0].iso)}</b> <span>${d.length} of ${heads} headings</span></span>`
}
const settleCell = (key) => (F.REVIEW_BY_LIST[key] ? `<a class="b-chip is-settle" href="#">${F.REVIEW_BY_LIST[key]} to settle</a>` : '<span class="none">none</span>')
const NO_PRICE = ['labour_rates', 'oils_lubes'] /* /review: these declare no price */
const priceCell = (key) => (F.priceAsk(key) ? `<a class="b-chip is-price" href="#">to choose</a>` : NO_PRICE.includes(key) ? '<span class="none">declares none</span>' : '<span class="none">settled</span>')
const stateChips = (key) => {
  const out = []
  const d = F.datedOf(key)
  if (F.REVIEW_BY_LIST[key]) out.push(`<span class="b-chip is-settle">${F.REVIEW_BY_LIST[key]} to settle</span>`)
  if (F.priceAsk(key)) out.push(`<span class="b-chip is-price">price to choose</span>`)
  if (d.length) out.push(`<span class="b-chip is-dated">priced as at ${short(d[0].iso)}</span>`)
  return out.length ? out.join('') : '<span class="none">nothing open</span>'
}
const row = ({ key, lead, sub, inn, fits, gone }) => {
  const t = F.byKey[key]
  return `<tr class="${gone ? 'is-gone' : ''}">
    <th scope="row"><a href="#" class="b-name">${lead}<span><span class="b-name-t">${t.name}</span>${sub ? `<span class="b-name-s">${sub}</span>` : ''}</span></a></th>
    <td class="n"><b>${f(t.rowCount)}</b></td>
    <td class="c-in">${inn}</td>
    <td class="c-fits">${fits}</td>
    <td class="c-asat">${datedCell(key)}</td>
    <td class="n c-chg">${F.CHANGED}</td>
    <td class="c-set">${settleCell(key)}</td>
    <td class="c-price">${priceCell(key)}</td>
    <td class="c-src">${F.tabOf(key)}</td>
    <td class="c-state">${stateChips(key)}</td>
  </tr>`
}
const group = (title, n, lines, rows) =>
  `<tbody><tr class="b-group"><th colspan="10" scope="rowgroup"><span>${title}</span><span class="b-group-n">${n} lists · ${f(lines)} lines</span></th></tr>${rows}</tbody>`

const markSm = (m) =>
  m.mark ? `<img class="mark-img b-mark" src="${MARKS}${m.mark}" alt="">` : `<span class="b-mark-word" aria-hidden="true">${m.name}</span>`

const boatRows = F.MAKERS.map((m) => {
  const j = F.joinsOf(m.key)
  return row({
    key: m.key,
    lead: `<span class="b-markbox">${markSm(m)}</span>`,
    sub: `${m.models} models`,
    inn: m.series ? `${m.series} series` : '1 series',
    fits: `${j.length} lists of what fits`,
  })
}).join('')

const fitsSay = (r) =>
  r.gone ? '<span class="none">no longer sold</span>' : r.fits === 'own' ? '<span class="none">not tied to a boat</span>' : r.fits === 0 ? '<span class="zero">named by no boat</span>' : `${r.fits} boats`

const baseGroups = F.BASE.map((g) =>
  group(
    g.group,
    g.rows.length,
    g.rows.reduce((a, r) => a + F.byKey[r.key].rowCount, 0),
    g.rows.map((r) => row({ key: r.key, lead: kind(F.byKey[r.key].kind), sub: `${r.noun}`, inn: r.in || '—', fits: fitsSay(r), gone: r.gone })).join(''),
  ),
).join('')

const joinGroup = `<tbody class="b-joins"><tr class="b-group"><th colspan="10" scope="rowgroup"><span>Lists of what fits which boat</span><span class="b-group-n">${F.joins.length} lists · ${f(F.JOIN_LINES)} lines · none dated, none to settle</span></th></tr>
${F.MAKERS.map((m, i) => {
  const j = F.joinsOf(m.key)
  const open = i === 0
  const head = `<tr class="b-jmaker"><th colspan="10" scope="rowgroup"><button type="button" class="b-jbtn" aria-expanded="${open}">${ic(open ? 'CaretDown' : 'CaretRight')}<span class="b-markbox">${markSm(m)}</span><span class="b-jsum"><b>${j.length} lists · ${f(j.reduce((a, t) => a + t.rowCount, 0))} lines</b>${open ? '' : `<span> · ${j.map((t) => `${F.farSide(t)} ${f(t.rowCount)}`).join(' · ')}</span>`}</span></button></th></tr>`
  const rows = open
    ? j
        .map(
          (t) => `<tr class="b-jrow"><th scope="row"><a href="#" class="b-name"><span class="x">×</span><span><span class="b-name-t">${F.farSide(t)}</span><span class="b-name-s">${t.name}</span></span></a></th><td class="n"><b>${f(t.rowCount)}</b></td><td class="c-in">pairings</td><td class="c-fits">${m.models} models</td><td class="c-asat"><span class="none">—</span></td><td class="n c-chg">0</td><td class="c-set"><span class="none">none</span></td><td class="c-price"><span class="none">—</span></td><td class="c-src">Boat Module</td><td class="c-state"><span class="none">nothing open</span></td></tr>`,
        )
        .join('')
    : ''
  return head + rows
}).join('')}</tbody>`

const table = `
<section class="b-every" aria-labelledby="b-every-h">
  <header class="b-every-head">
    <h2 id="b-every-h">Every list <span>${F.LISTS} lists · ${f(F.LINES)} lines</span></h2>
    <button class="ui-button" data-intent="secondary" type="button">${ic('Plus')}New list</button>
  </header>
  <div class="b-tablebox plate">
  <table class="b-table">
    <thead><tr>
      <th scope="col">List</th><th scope="col" class="n">Lines</th><th scope="col" class="c-in">Held in</th><th scope="col" class="c-fits">Fits</th>
      <th scope="col" class="c-asat">Priced as at</th><th scope="col" class="n c-chg">Changed here</th><th scope="col" class="c-set">Review</th><th scope="col" class="c-price">Price</th><th scope="col" class="c-src">Where from</th><th scope="col" class="c-state">What is open</th>
    </tr></thead>
    ${group('Boats', 7, F.BOAT_LINES, boatRows)}
    ${baseGroups}
    ${joinGroup}
  </table>
  </div>
</section>`

const body = `
<main class="frame b" id="main">
  <header class="b-head">
    <div><p class="eyebrow">Data</p><h1>The Master Price File</h1></div>
    <label class="find b-find">${ic('MagnifyingGlass', { size: 'md' })}<span class="sr">Find in the price list</span><input placeholder="Find a maker, a list, a section or a code"></label>
  </header>
  ${tabs}
  ${about}
  ${table}
</main>`

/* THE SECOND STATE: the Parts row pressed. Its 187 categories, every one reachable. */
const secs = F.sectionsOf('parts')
const partsDated = F.datedOf('parts')
const lineup = `
<div class="state">
  <span class="eyebrow">Pressed: Parts &amp; Accessories · /data?at=parts</span>
  <div class="b-open plate">
    <div class="b-open-head">
      <h3>${kind('accessory')} Parts &amp; Accessories</h3>
      <p>${f(F.byKey.parts.rowCount)} products in ${secs.length} categories, from the workbook’s ${F.tabOf('parts')} tab. ${F.REVIEW_BY_LIST.parts} to settle · ${partsDated.length} categories dated · ${F.CHANGED} changed here.</p>
      <div class="b-open-acts"><a class="ui-button" data-intent="primary" href="#">Open the list ${ic('ArrowRight')}</a><a class="ui-button" data-intent="quiet" href="#">Its ${F.REVIEW_BY_LIST.parts} Review cases</a></div>
    </div>
    <div class="b-open-cols">
      <div>
        <p class="eyebrow">Its categories, largest first · each opens the sheet at its heading</p>
        <ol class="b-secs">${secs.slice(0, 12).map(([s, n]) => `<li><a href="#"><span>${s}</span><b>${n}</b></a></li>`).join('')}</ol>
        <button class="ui-button" data-intent="secondary" type="button">All ${secs.length} categories, largest first</button>
      </div>
      <div>
        <p class="eyebrow">The ${partsDated.length} that say when they were priced, oldest first</p>
        <ol class="b-secs is-dated">${partsDated.map((d) => `<li><a href="#"><span>${d.heading.replace(/\s*\((as at|As at)[^)]*\)/, '')}</span><span class="b-asat-s">${short(d.iso)}</span><b>${d.lines}</b></a></li>`).join('')}</ol>
      </div>
    </div>
  </div>
</div>`

const css = `
.b { display: grid; gap: 22px; }
.b-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 480px); gap: 16px 32px; align-items: end; }
.b-head h1 { font-size: var(--text-5xl); line-height: 1.05; letter-spacing: -0.02em; margin-block-start: 4px; }

.b-tabs { display: flex; gap: 4px; border-block-end: 1px solid var(--color-rule-strong); overflow: visible; flex-wrap: wrap; }
.b-tab { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px 12px; margin-block-end: -1px; color: var(--color-ink-2); font-weight: 600; border-block-end: 3px solid transparent; }
.b-tab .ui-icon { color: var(--color-ink-file); }
.b-tab.is-on { color: var(--color-ink); border-block-end-color: var(--color-ink-file); }
.b-tab-n { min-inline-size: 24px; padding: 1px 8px; border-radius: var(--radius-pill); background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule-strong); font-size: var(--text-sm); text-align: center; color: var(--color-ink); }
.b-tab-w { color: var(--color-ink-3); font-weight: 400; font-size: var(--text-sm); margin-inline-start: -4px; }

.b-about { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
.b-about { grid-template-areas: "when needs" "size needs"; }
.b-when { grid-area: when; padding: 22px 24px 4px; border-inline-end: 1px solid var(--color-rule); display: grid; gap: 14px; align-content: start; }
.b-size { grid-area: size; padding: 0 24px 22px; border-inline-end: 1px solid var(--color-rule); display: grid; gap: 14px; align-content: start; }
.b-needs { grid-area: needs; }
.b-lab { font-size: var(--text-sm); color: var(--color-ink-3); font-weight: 600; }
.b-date { font-size: var(--text-4xl); font-weight: 800; color: var(--color-ink-file); line-height: 1; margin-block-start: -8px; letter-spacing: -0.01em; }
.b-dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 20px; }
.b-dl dt { font-size: var(--text-sm); color: var(--color-ink-3); }
.b-dl dd { margin: 0; font-weight: 700; }
.b-census { display: flex; gap: 32px; border-block-start: 1px solid var(--color-rule); padding-block-start: 14px; }
.b-census p { display: grid; }
.b-census b { font-size: var(--text-3xl); font-weight: 800; line-height: 1.1; }
.b-each { color: var(--color-ink-2); }
.b-split { display: flex; block-size: 10px; border-radius: 5px; overflow: hidden; gap: 2px; }
.b-split span { inline-size: var(--w); }
[data-k='boat'] { --k: var(--accent-blue); } [data-k='base'] { --k: var(--accent-viridian); } [data-k='join'] { --k: var(--accent-ochre); }
.b-split span { background: var(--k); }
.b-key { display: flex; flex-wrap: wrap; gap: 4px 16px; color: var(--color-ink-2); font-size: var(--text-sm); }
.b-key li::before { content: ''; display: inline-block; inline-size: 10px; block-size: 10px; border-radius: 3px; background: var(--k); margin-inline-end: 6px; }
.b-key b { color: var(--color-ink); }

.b-needs { padding: 22px 24px 10px; }
.b-needs h3 { font-size: var(--text-xl); margin-block-end: 6px; }
.b-ask div { display: grid; grid-template-columns: 170px minmax(0, 1fr) auto; gap: 4px 16px; padding-block: 10px; border-block-start: 1px solid var(--color-rule); align-items: baseline; }
.b-ask dt { display: flex; gap: 8px; align-items: center; font-weight: 700; color: var(--color-ink-2); }
.b-ask dt .ui-icon { color: var(--accent-ochre); }
.b-ask dd { margin: 0; color: var(--color-ink-2); }
.b-ask dd b { font-size: var(--text-lg); color: var(--color-ink); font-weight: 800; }
.b-ask-door { justify-self: end; }

.b-every { display: grid; gap: 12px; }
.b-every-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.b-every-head h2 { font-size: var(--text-2xl); }
.b-every-head h2 span { font-size: var(--text-base); font-weight: 400; color: var(--color-ink-3); margin-inline-start: 10px; }
.b-tablebox { overflow: hidden; }
.b-table { inline-size: 100%; border-collapse: collapse; }
.b-table thead th { background: var(--color-plate); font-size: var(--text-sm); color: var(--color-ink-3); font-weight: 700; text-align: start; padding: 12px 12px 8px; border-block-end: 1px solid var(--color-rule-strong); white-space: nowrap; }
.b-table td, .b-table tbody th { padding: 7px 12px; border-block-end: 1px solid var(--color-rule); text-align: start; vertical-align: middle; font-weight: 400; }
.b-table .n { text-align: end; }
.b-table td.n b { font-weight: 700; }
.b-group th { background: var(--color-plate-tint); padding: 9px 12px !important; }
.b-group th { display: table-cell; }
.b-group span:first-child { font-weight: 800; font-size: var(--text-sm); letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-2); }
.b-group-n { color: var(--color-ink-3); margin-inline-start: 12px; font-size: var(--text-sm); }
.b-name { display: flex; align-items: center; gap: 10px; }
.b-name > span:last-child { display: grid; }
.b-name-t { font-weight: 600; }
.b-name-s { font-size: var(--text-sm); color: var(--color-ink-3); }
.b-markbox { display: inline-flex; align-items: center; inline-size: 96px; flex: none; }
.b-mark { max-block-size: 18px; max-inline-size: 92px; }
.b-mark-word { font-weight: 800; }
tr.is-gone .b-name-t { color: var(--color-ink-3); }
.none { color: var(--color-ink-3); }
.zero { color: var(--accent-ochre); font-weight: 600; }
.b-asat b { font-weight: 700; }
.b-asat span { color: var(--color-ink-3); font-size: var(--text-sm); }
.b-chip { display: inline-flex; padding: 2px 10px; border-radius: var(--radius-pill); font-size: var(--text-sm); font-weight: 700; white-space: nowrap; }
.b-chip.is-settle { background: oklch(from var(--accent-ochre) l c h / 14%); color: var(--color-ink); box-shadow: inset 0 0 0 1px oklch(from var(--accent-ochre) l c h / 40%); }
.b-chip.is-price { background: oklch(from var(--accent-violet) l c h / 12%); color: var(--color-ink); box-shadow: inset 0 0 0 1px oklch(from var(--accent-violet) l c h / 35%); }
.b-chip.is-dated { background: var(--color-wash); color: var(--color-ink-2); }
.c-state { display: none; }
.c-src { color: var(--color-ink-2); }
.b-jmaker th { padding: 0 !important; }
.b-jbtn { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 10px; inline-size: 100%; padding: 8px 12px; cursor: pointer; }
.b-jbtn:hover { background: var(--color-wash); }
.b-jbtn > .ui-icon { color: var(--color-ink-file); }
.b-jsum { color: var(--color-ink-3); font-size: var(--text-sm); min-inline-size: 0; }
.b-jsum b { color: var(--color-ink); font-size: var(--text-base); }
.b-jrow th { padding-inline-start: 34px !important; }
.x { color: var(--color-ink-3); font-weight: 700; inline-size: 16px; text-align: center; }

/* the open list, in the notes */
.b-open { padding: 22px; display: grid; gap: 18px; }
.b-open-head h3 { display: flex; align-items: center; gap: 10px; font-size: var(--text-3xl); }
.b-open-head p { color: var(--color-ink-2); margin-block-start: 6px; }
.b-open-acts { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 12px; }
.b-open-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; }
.b-open-cols .eyebrow { margin-block-end: 6px; }
.b-secs { margin-block-end: 12px; }
.b-secs a { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; padding: 6px 0; border-block-end: 1px solid var(--color-rule); }
.b-secs.is-dated a { grid-template-columns: minmax(0, 1fr) auto 40px; }
.b-secs b { text-align: end; }
.b-asat-s { color: var(--color-ink-2); font-size: var(--text-sm); }

@media (min-width: 1600px) { .b-about { grid-template-columns: minmax(0, 4fr) minmax(0, 7fr); } }
@media (max-width: 1599px) { .c-src { display: none; } }
@media (max-width: 1365px) { .c-in { display: none; } .b-tab-w { display: none; } .b-tab { padding-inline: 12px; } .b-ask div { grid-template-columns: 150px minmax(0, 1fr) auto; } }
@media (max-width: 1099px) {
  .b-head { grid-template-columns: minmax(0, 1fr); }
  .b-about { grid-template-columns: minmax(0, 1fr); grid-template-areas: "when" "needs" "size"; }
  .b-when { border-inline-end: 0; padding-block-end: 18px; }
  .b-size { border-inline-end: 0; border-block-start: 1px solid var(--color-rule); padding-block-start: 4px; }
  .b-needs { border-block-start: 1px solid var(--color-rule); }
  .c-fits, .c-asat, .c-chg, .c-set, .c-price { display: none; }
  .c-state { display: table-cell; }
  .c-state .b-chip { margin: 2px 4px 2px 0; }
  .b-open-cols { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 599px) {
  .b-head h1 { font-size: var(--text-4xl); }
  .b-find input { font-size: var(--text-base); }
  .b-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; border: 0; }
  .b-tab { border: 0; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule); padding: 8px 10px; margin: 0; gap: 6px; flex-wrap: wrap; }
  .b-tab.is-on { grid-column: 1 / -1; box-shadow: inset 0 0 0 2px var(--color-ink-file); }
  .b-tab-w { display: none; }
  .b-tab-n { margin-inline-start: auto; }
  .b-when, .b-needs { padding: 16px 14px; }
  .b-size { padding: 4px 14px 16px; }
  .b-date { font-size: var(--text-3xl); }
  .b-ask div { grid-template-columns: minmax(0, 1fr) auto; }
  .b-ask dd:not(.b-ask-door) { grid-column: 1 / -1; grid-row: 2; }
  .b-ask-door { grid-row: 1; grid-column: 2; }
  .b-table, .b-table tbody, .b-table tr, .b-table th, .b-table td { display: block; }
  .b-table thead { display: none; }
  .b-table tr:not(.b-group):not(.b-jmaker) { display: grid; grid-template-columns: minmax(0, 1fr) auto; padding: 8px 14px; border-block-end: 1px solid var(--color-rule); }
  .b-table tr td, .b-table tr th { border: 0; padding: 0 !important; }
  .b-table td.n:not(.c-chg) { grid-column: 2; grid-row: 1; }
  .b-table td.c-state { display: block; grid-column: 1 / -1; margin-block-start: 4px; }
  .b-table td.c-chg, .b-table td.c-in, .b-table td.c-src, .b-table td.c-asat, .b-table td.c-set, .b-table td.c-price { display: none; }
  .b-table td.c-fits { grid-column: 1 / -1; color: var(--color-ink-3); font-size: var(--text-sm); }
  .b-table tr.b-group th { padding: 8px 14px !important; }
  .b-table tr.b-jmaker .b-jbtn { padding-inline: 14px; }
  .b-markbox { inline-size: 80px; }
  .b-mark { max-inline-size: 76px; }
  .b-jsum span { display: none; }
  .b-jrow { padding-inline-start: 30px !important; }
  .b-open { padding: 14px; }
  .b-open-head h3 { font-size: var(--text-2xl); }
}
`

const notes = `
<section class="notes" aria-label="The board">
  <div class="frame">
    <header class="board-name"><span class="eyebrow">Data · Direction B</span><h2>Every list dated</h2></header>
    <div class="cols">
      <div>
        <h3>The one job</h3>
        <p>The Master Price File as one place: what needs Northside, what is new, the rooms, and every list it carries, each a door (docs/SCREENS.md, the owner on 2026-10-31).</p>
        <h3 style="margin-top:18px">What only this screen does</h3>
        <p>It is the only screen that sets all 53 lists side by side, each with its own date, its own open work and its own source tab. The sheet reads one list. Review, Prices and Fitment each read one question across lists. Only Data answers “which list is behind, and in what?” in a single column.</p>
      </div>
      <div>
        <h3>Order and grouping</h3>
        <ol>
          <li>1. The title, with the six rooms as the page’s own counted tabs. The rooms come first, as a published dataset’s tabs do.</li>
          <li>2. An <b>About</b> card. On the left is when: the large date, then packed, last change, and the oldest and newest prices a heading dates. Beside it is how big: lists, lines, and what a line is, split three ways. On the right is <b>What needs Northside</b> as a labelled table (label, sentence, door), with the new-here row last.</li>
          <li>3. <b>Every list</b>: one table of 53. The 7 boat makers come first, then the 18 lists you sell from by kind, then the 28 lists of what fits, folded by maker. Every row carries its lines, what it fits, its oldest as-at date, the lines changed here, its Review cases, whether its price waits on Northside, and where in the workbook it came from.</li>
        </ol>
      </div>
    </div>
    <div class="cols">
      <div>
        <h3>References new to this board</h3>
        <ul class="dash">
          <li><b>NYC Open Data, a dataset’s About</b>, at <code>docs/research/refs/data/round-2/live/nyc-open-data.png</code>. “Updated” sits over a large coloured date, with the other dates kept apart beneath it, and a census card says what one row is. This is the About card.</li>
          <li><b>data.gov.uk, Price Paid Data</b>, at <code>live/datagovuk-price-paid.png</code>. A labelled key–value table (Publisher, Updated, Licence) gives every data link its own Updated column. This is the needs table and the “Priced as at” column.</li>
        </ul>
        <p>It also draws on <code>live/nyc-open-data-scrolled.png</code> (“Each row is a…”), on <code>hand/dolthub-repo-390.png</code> for the tabs at 390, and on <code>live/npm-versions.png</code> for tabs that print a zero rather than hide it.</p>
      </div>
      <div>
        <h3>The mark</h3>
        <p>Each maker’s mark stands at the start of its own row, 18 px tall in a 96 px box, so the seven boat rows line up as a column of marks. The marks appear in the table once, in the Boats group and in each maker’s fold of what fits. No plates and no cover. Stabicraft is set as a word.</p>
        <h3 style="margin-top:18px">What a dealer can replace</h3>
        <p>The accent (the date, the tab underline and the doors), the three inks of the split (the kind accents), and the density. A dealer who wants fewer columns hides “Where from” and “Held in” first, the same as the narrower widths do.</p>
      </div>
    </div>
    ${lineup}
    <div class="cols">
      <div>
        <h3>Type, at 1:1</h3>
        <div class="specimen">
          <div><span>5xl 34 800</span><span style="font-size:var(--text-5xl);font-weight:800;line-height:1.05">The Master Price File</span></div>
          <div><span>4xl 30 800 accent</span><span style="font-size:var(--text-4xl);font-weight:800;color:var(--color-ink-file)">16 September 2026</span></div>
          <div><span>3xl 26 800</span><span style="font-size:var(--text-3xl);font-weight:800">15,691</span></div>
          <div><span>base 14 600</span><span style="font-weight:600">Parts &amp; Accessories</span></div>
          <div><span>sm 13 700 chip</span><span><span class="b-chip is-settle">19 to settle</span> <span class="b-chip is-price">to choose</span></span></div>
          <div><span>sm 13 400</span><span style="font-size:var(--text-sm);color:var(--color-ink-3)">11 of 187 headings</span></div>
        </div>
        <p style="margin-top:10px">One face. The table is set at 14 px with tabular figures. Its column heads are 13 px.</p>
      </div>
      <div>
        <h3>Motion</h3>
        <p>The tabs do not slide. The underline moves to the chosen tab over 160 ms, and the room opens as its own screen. Opening a maker’s fold of what fits draws its rows from height 0 over 200 ms. The rows below move down with them, the caret turns 90° over the same 200 ms, and the rest stays still. Pressing a row opens its lineup under the row (as drawn above), and the table scrolls to the row’s head, clear of the bar. Reduced motion: the fold and the lineup are simply there, and the caret swaps.</p>
        <h3 style="margin-top:18px">Keyboard</h3>
        <p>The tabs are one stop, with arrows inside. The needs table’s doors come in order. The table is a grid: arrows move between rows, Enter opens the sheet and Space opens the lineup. On a fold, Space opens and closes it. <kbd>/</kbd> focuses the find.</p>
      </div>
    </div>
    <div>
      <h3>How it reflows</h3>
      <table>
        <tr><th>Size</th><th>What the composition becomes</th></tr>
        <tr><td>390×844</td><td>The title, the find, then the tabs as a 2-column grid of counted doors, with About the file across the top. The About card stacks the when and the needs. The table becomes rows: the name with its line count at the right, then the open work as chips under the name (“19 to settle”, “price to choose”, “priced as at 27 September 2022”). The first window holds the title, the rooms and the date.</td></tr>
        <tr><td>844×390</td><td>Tablet columns under the bar. The tabs fit on one line or wrap to two, and the About card stacks. The first window holds the title, the tabs and the big date.</td></tr>
        <tr><td>834×1112</td><td>The table becomes three columns: List, Lines, and What is open (the chips). The About card stacks, with the needs table at full width.</td></tr>
        <tr><td>1280×800</td><td>The About card is side by side. The table drops “Held in” and “Where from” and keeps the dates, changes, Review and Price as columns.</td></tr>
        <tr><td>1440×900</td><td>As drawn. Every column but “Where from” shows.</td></tr>
        <tr><td>1920×1080</td><td>Every column, “Where from” included (the workbook’s tab for each list), so the right half of each row carries state rather than blank. The About card runs 4:7.</td></tr>
      </table>
    </div>
    <div class="cols">
      <div>
        <h3>Honest constraints</h3>
        <ul class="dash">
          <li>“Priced as at” prints only where a heading says a date in its own words. 20 of the 25 lists you sell from and boat lists read “not dated”, and the 28 lists of what fits carry no headings to date. That is true. No date is inferred.</li>
          <li>Review cases by list come from the Review reader’s own 37, split by the list each case is on (Parts 19, GFAB 4, Dunbier 3, Mackay 3, Rigging Kits 3, REDCO 2, Dealer Fit 2, Formosa 1).</li>
          <li>“Changed here” is 0 on every row today, because every <code>updatedAt</code> equals <code>packedAt</code>. The column is kept because it is the column that moves first.</li>
          <li>Cost and margin are not columns. “Price” says only whether the sale price waits on Northside.</li>
        </ul>
      </div>
      <div>
        <h3>Its risk</h3>
        <p>It is the densest of the three. The needs are a table rather than a list of work to finish, and at 390 a reader scrolls through 53 rows to reach the lists of what fits. Folding those lists by maker keeps the table to 32 rows until a maker is opened.</p>
        <h3 style="margin-top:18px">Owed whatever wins</h3>
        <p>The same three fixes as A: no sideways scroll on the OBSOLETE spread at 390, <i>Make it</i> refusing an empty name in a sentence, and a 72 px scroll margin under the bar at 844×390.</p>
      </div>
    </div>
  </div>
</section>`

export const html = page({ title: 'Data B · Every list dated', id: 'b', css, body, notes })
