/* DIRECTION A, "The Monday list". The work first, then what is new, then the rooms, then
   what the file holds. One column of state over a ledger of inventory. */
import * as F from './facts.mjs'
import { ic, kind, page, ROOM_GLYPH, MARKS } from './shell.mjs'

const f = F.fmt
const oldest = F.DATED[0]
const newest = F.DATED.at(-1)

const need = ({ say, sub, extra = '', fig, of, door, href = '#' }) => `
<li class="need">
  <p class="need-fig"><span class="need-dot" aria-hidden="true"></span><b>${fig}</b></p>
  <div class="need-words"><p class="need-say">${say}</p><p class="need-sub">${sub}</p>${extra}</div>
  <p class="need-of">${of}</p>
  <a class="door need-door" href="${href}">${door} ${ic('ArrowRight')}</a>
</li>`

const years = `<ol class="years" aria-label="The 25 dated headings by the year they say">${F.datedByYear
  .map(
    (y) =>
      `<li style="--n:${y.headings}"><span class="years-bar"></span><span class="years-y">${y.year}</span><span class="years-n">${y.headings} · ${f(y.lines)} lines</span></li>`,
  )
  .join('')}</ol>`

const needs = `
<section class="a-needs plate" aria-labelledby="a-needs-h">
  <header class="a-sec-head">
    <h2 id="a-needs-h">Needs Northside</h2>
    <p class="a-sec-count"><b>5</b> open · <b>1</b> done</p>
  </header>
  <ol>
    ${need({
      say: `to settle in the price list, the most money first`,
      sub: F.REVIEW.kinds.map(([k, n]) => `${n} ${k}`).join(' · ') + `. Then ${F.REVIEW.tidy} to tidy.`,
      extra: `<span class="track" role="img" aria-label="0 of 37 settled"><span style="inline-size:0%"></span></span>`,
      fig: F.REVIEW.open,
      of: `0 of ${F.REVIEW.open} settled`,
      door: 'Settle them',
    })}
    ${need({
      say: `answers about price that only Northside can give`,
      sub: `They decide how ${f(F.PRICE_LINES)} lines price: ${F.PRICES.answers.map(([n, l]) => `${n} ${f(l)}`).join(' · ')}. Until then each quotes as it does today.`,
      fig: F.PRICES.open,
      of: `0 of ${F.PRICES.open} chosen`,
      door: 'Choose',
    })}
    ${need({
      say: `sections say in their heading the date they were priced`,
      sub: `The oldest, <span class="q">${oldest.heading}</span> in ${oldest.listName}, says ${F.day(oldest.iso)}. ${F.datedByYear[0].headings} say ${F.datedByYear[0].year}, over ${f(F.datedByYear[0].lines)} lines.`,
      extra: years,
      fig: F.DATED.length,
      of: `of ${F.DATED_HEADINGS_IN_THOSE} headings in the ${F.DATED_LISTS.length} lists that date any`,
      door: 'Oldest first',
    })}
    ${need({
      say: `lines sit in ${F.UNNAMED.length} lists that no list of what fits names`,
      sub: F.UNNAMED.map((r) => `${F.byKey[r.key].name} ${f(F.byKey[r.key].rowCount)}`).join(' · ') + '. No boat is offered them on Fitment.',
      fig: f(F.UNNAMED_LINES),
      of: `in ${F.UNNAMED.length} of the 18 lists you sell from`,
      door: 'Show them',
    })}
    ${need({
      say: `rules are noticed in the file, and not written`,
      sub: `Your price list keeps ${F.RULES.kept} on its own. Northside has written none, so the build does nothing with these three.`,
      fig: F.RULES.noticed,
      of: `${F.RULES.written} written by Northside`,
      door: 'Read them',
    })}
    <li class="need is-done">
      <p class="need-fig"><span class="need-dot" aria-hidden="true">${ic('Check')}</span><b>${F.LISTS}</b></p>
      <div class="need-words"><p class="need-say">lists of ${F.LISTS} are on this computer, read in full</p><p class="need-sub">${f(F.LINES)} lines, loaded at the door.</p></div>
      <p class="need-of">nothing left to load</p>
      <span class="need-door"></span>
    </li>
  </ol>
</section>`

const fresh = `
<section class="a-new plate" aria-labelledby="a-new-h">
  <header class="a-sec-head"><h2 id="a-new-h">New since ${F.day(F.PACKED.slice(0, 10))}</h2></header>
  <p class="a-zero"><b>${F.CHANGED}</b><span>lines changed by Northside, of ${f(F.LINES)}</span></p>
  <dl class="a-new-list">
    <div><dt>Lists made here</dt><dd><b>${F.MADE_HERE}</b></dd></div>
    <div><dt>A new price list brought in</dt><dd>None yet <a class="door" href="#">Shelf ${ic('ArrowRight')}</a></dd></div>
    <div><dt>A copy of Northside’s work</dt><dd>None saved <a class="door" href="#">Shelf ${ic('ArrowRight')}</a></dd></div>
  </dl>
  <p class="a-new-say">A price changed here is counted by its list, and each list opens its sheet at the lines changed.</p>
</section>`

const ROOMS = [
  ['Review', `<b>${F.REVIEW.open}</b> to settle`, `then ${F.REVIEW.tidy} to tidy`],
  ['Prices', `<b>${F.PRICES.open}</b> to choose`, `${F.PRICES.settled} settled by the price list`],
  ['Rules', `<b>${F.RULES.kept}</b> kept by the file`, `${F.RULES.written} written · ${F.RULES.noticed} noticed`],
  ['Fitment', `<b>${F.MODELS}</b> models`, `from ${F.MAKERS.length} makers, ${F.joins.length} lists of what fits`],
  ['Catalogue', `<b>${f(F.CATALOGUE.onSale)}</b> parts on sale`, `in ${F.CATALOGUE.aisles} aisles · ${F.CATALOGUE.pictured} pictured`],
  ['Shelf', `<b>No</b> copy saved yet`, `no new price list brought in`],
]
const rooms = `
<section class="a-rooms" aria-labelledby="a-rooms-h">
  <h2 id="a-rooms-h" class="eyebrow">The rooms of the price list</h2>
  <ul>${ROOMS.map(
    ([n, a, b]) => `<li><a class="room" href="#"><span class="room-glyph">${ic(ROOM_GLYPH[n], { size: 'md' })}</span><span class="room-name">${n}</span><span class="room-fig">${a}</span><span class="room-sub">${b}</span>${ic('ArrowRight')}</a></li>`,
  ).join('')}</ul>
</section>`

const markOf = (m) =>
  m.mark ? `<img class="mark-img" src="${MARKS}${m.mark}" alt="${m.name}">` : `<span class="mark-word">${m.name}</span>`

const makers = `
<ul class="a-makers">
  ${F.MAKERS.map((m) => {
    const j = F.joinsOf(m.key)
    const jl = j.reduce((a, t) => a + t.rowCount, 0)
    return `<li><a class="maker" href="#"><span class="maker-mark">${markOf(m)}</span>
      <span class="maker-a">${m.models} models${m.series ? ` · ${m.series} series` : ''}</span>
      <span class="maker-b">${j.length} lists of what fits · ${f(jl)} lines</span></a></li>`
  }).join('')}
  <li><a class="maker maker-all" href="#"><span class="maker-mark">${kind('boat')}<span>Every maker</span></span>
    <span class="maker-a">${F.MODELS} models · ${f(F.BOAT_LINES)} lines</span>
    <span class="maker-b">${F.joins.length} lists of what fits · ${f(F.JOIN_LINES)} lines</span></a></li>
</ul>`

const fitsSay = (r) =>
  r.gone ? '<span class="gone">no longer sold</span>' : r.fits === 'own' ? 'not tied to a boat' : r.fits === 0 ? '<span class="zero">named by no boat</span>' : `fits ${r.fits} boats`

const baseLedger = `
<section class="a-ledger plate" aria-labelledby="a-base-h">
  <header class="a-ledger-head"><h3 id="a-base-h">${F.base.length} lists you sell from</h3><p>${f(F.BASE_LINES)} lines</p>
    <button class="ui-button" data-intent="quiet" type="button">${ic('Plus')}New list</button></header>
  ${F.BASE.map(
    (g) => `<h4 class="eyebrow a-group">${g.group}</h4><ul>${g.rows
      .map((r) => {
        const t = F.byKey[r.key]
        return `<li><a class="row${r.gone ? ' is-gone' : ''}" href="#">${kind(t.kind)}<span class="row-name">${t.name}</span><span class="row-n"><b>${f(t.rowCount)}</b> ${r.noun}${r.in ? ` in ${r.in}` : ''}</span><span class="row-fits">${fitsSay(r)}</span></a></li>`
      })
      .join('')}</ul>`,
  ).join('')}
</section>`

const joinLedger = `
<section class="a-ledger plate" aria-labelledby="a-join-h">
  <header class="a-ledger-head"><h3 id="a-join-h">${F.joins.length} lists of what fits which boat</h3><p>${f(F.JOIN_LINES)} lines</p></header>
  ${F.MAKERS.map((m) => {
    const j = F.joinsOf(m.key)
    return `<h4 class="a-group a-group-maker"><span class="maker-mark sm">${markOf(m)}</span><span>${j.length} lists · ${f(j.reduce((a, t) => a + t.rowCount, 0))} lines</span></h4><ul>${j
      .map(
        (t) => `<li><a class="row row-join" href="#"><span class="x" aria-hidden="true">×</span><span class="row-name">${F.farSide(t)}</span><span class="row-n"><b>${f(t.rowCount)}</b> pairings</span></a></li>`,
      )
      .join('')}</ul>`
  }).join('')}
</section>`

const body = `
<main class="frame a" id="main">
  <header class="a-head">
    <div class="a-title">
      <h1>Data</h1>
      <p class="a-stamp">The price list of <b class="nw">16 September 2026</b> · <span class="nw"><b>${F.LISTS}</b> lists · <b>${f(F.LINES)}</b> lines</span></p>
      <p class="a-dates">Prices dated in their own headings from <b>${F.day(oldest.iso).replace(/ /g, '&nbsp;')}</b> to <b>${F.day(newest.iso).replace(/ /g, '&nbsp;')}</b> · Northside’s last change: <b>none&nbsp;yet</b></p>
    </div>
    <label class="find a-find">${ic('MagnifyingGlass', { size: 'md' })}<span class="sr">Find in the price list</span><input placeholder="Find a maker, a list, a section or a code"><kbd class="ui-kbd"><span class="ui-kbd-key">/</span></kbd></label>
  </header>
  <div class="a-state">${needs}<div class="a-side">${fresh}${rooms}</div></div>
  <section class="a-hold" aria-labelledby="a-hold-h">
    <header class="a-hold-head"><h2 id="a-hold-h">What the file holds</h2><p>${F.MAKERS.length} makers · ${F.LISTS} lists · ${f(F.LINES)} lines</p></header>
    ${makers}
    <div class="a-ledgers">${baseLedger}${joinLedger}</div>
  </section>
</main>`

/* THE SECOND STATE: Highfield's plate pressed. The spread opens AT the plate on every size. */
const hf = F.seriesOf('boat_highfield')
const hfMax = Math.max(...hf.map(([, n]) => n))
const spread = `
<div class="state">
  <span class="eyebrow">Pressed: the Highfield plate · /data?at=boat_highfield</span>
  <div class="spread plate">
    <div class="spread-head">
      <p class="eyebrow">${kind('boat')} Boats · from the workbook’s ${F.tabOf('boat_highfield')} tab</p>
      <h3>Highfield Inflatables</h3>
      <p>${f(F.byKey.boat_highfield.rowCount)} lines: 67 models in 7 series. No Review case, no dated heading, ${F.CHANGED} changed here.</p>
      <div class="spread-acts"><a class="ui-button" data-intent="primary" href="#">Open the list ${ic('ArrowRight')}</a><a class="ui-button" data-intent="quiet" href="#">Highfield’s own page</a></div>
    </div>
    <div class="spread-series">
      <p class="eyebrow">Its 7 series · ${f(F.byKey.boat_highfield.rowCount)} lines · each opens the sheet at its heading</p>
      <ul>${hf.map(([s, n]) => `<li><a href="#" class="bar-row"><span>${s}</span><span class="bar-track"><span style="inline-size:${((n / hfMax) * 100).toFixed(1)}%"></span></span><b>${n}</b></a></li>`).join('')}</ul>
    </div>
    <div class="spread-fits">
      <p class="eyebrow">What goes with it · 5 lists of what fits</p>
      <ul>${F.joinsOf('boat_highfield').map((t) => `<li><a class="row row-join" href="#"><span class="x">×</span><span class="row-name">${F.farSide(t)}</span><span class="row-n"><b>${f(t.rowCount)}</b></span></a></li>`).join('')}</ul>
      <p class="spread-choose">What fits one Highfield? <a class="door" href="#">Choose its series, then its boat ${ic('ArrowRight')}</a></p>
    </div>
    <div class="spread-foot"><p><span class="eyebrow">Prices</span> Cash · Trade · Warranty, and 5 costs, never on a quote</p></div>
  </div>
</div>`

const css = `
.a { display: grid; gap: 28px; }
.a-head { display: grid; gap: 16px 32px; grid-template-columns: minmax(0, 1fr) minmax(0, 520px); align-items: end; }
.a-head h1 { font-size: var(--text-6xl); line-height: 1; letter-spacing: -0.02em; }
.a-stamp { margin-block-start: 10px; font-size: var(--text-lg); color: var(--color-ink-2); }
.a-stamp b { color: var(--color-ink); }
.a-dates { margin-block-start: 2px; color: var(--color-ink-3); }
.a-dates b { color: var(--color-ink-2); }
.ui-kbd { margin-inline-start: auto; }

.a-state { display: grid; gap: 20px; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); align-items: start; }
.a-sec-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 18px 22px 10px; }
.a-sec-head h2 { font-size: var(--text-2xl); letter-spacing: -0.01em; }
.a-sec-count { color: var(--color-ink-3); }
.a-sec-count b { color: var(--color-ink); }

.need { display: grid; grid-template-columns: 96px minmax(0, 1fr) 150px 116px; gap: 4px 16px; align-items: start; padding: 14px 22px; border-block-start: 1px solid var(--color-rule); }
.need-dot { flex: none; inline-size: 10px; block-size: 10px; border-radius: 50%; background: var(--accent-ochre); box-shadow: 0 0 0 4px oklch(from var(--accent-ochre) l c h / 18%); }
.need-of { color: var(--color-ink-3); font-size: var(--text-sm); text-align: end; padding-block-start: 4px; }
.need-say { font-size: var(--text-lg); font-weight: 600; }
.need-say b { font-weight: 800; }
.need-sub { color: var(--color-ink-2); margin-block-start: 2px; }
.need-sub .q { font-style: italic; }
.need-fig { display: flex; align-items: center; gap: 12px; }
.need-fig b { font-size: var(--text-4xl); line-height: 1; font-weight: 800; letter-spacing: -0.01em; }
.need-door { justify-self: end; margin-block-start: 4px; }
.need.is-done .need-dot { display: grid; place-items: center; inline-size: 18px; block-size: 18px; margin-inline: -4px; background: var(--accent-viridian); color: var(--color-white); box-shadow: none; }
.need.is-done .need-dot .ui-icon { inline-size: 13px; block-size: 13px; }
.need.is-done .need-say { color: var(--color-ink-2); font-weight: 600; }
.need.is-done .need-fig b { font-size: var(--text-2xl); color: var(--color-ink-2); }
.track { display: block; block-size: 6px; margin-block-start: 10px; border-radius: 3px; background: var(--color-wash); max-inline-size: 360px; }
.years { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-block-start: 10px; }
.years li { display: grid; grid-template-columns: auto auto; gap: 0 6px; align-items: baseline; }
.years-bar { grid-column: 1 / -1; block-size: 6px; inline-size: calc(var(--n) * 14px); border-radius: 3px; background: var(--accent-ochre); opacity: 0.75; }
.years-y { font-weight: 700; font-size: var(--text-sm); }
.years-n { color: var(--color-ink-3); font-size: var(--text-sm); }

.a-new { padding-block-end: 18px; }
.a-zero { display: flex; align-items: baseline; gap: 12px; padding: 4px 22px 14px; }
.a-zero b { font-size: var(--text-mark); line-height: 0.9; font-weight: 800; color: var(--color-ink); }
.a-zero span { color: var(--color-ink-2); font-size: var(--text-lg); max-inline-size: 24ch; }
.a-new-list { display: grid; padding-inline: 22px; }
.a-new-list div { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding-block: 10px; border-block-start: 1px solid var(--color-rule); }
.a-new-list dt { color: var(--color-ink-2); }
.a-new-list dd { margin: 0; display: flex; gap: 12px; align-items: baseline; color: var(--color-ink); font-weight: 600; }
.a-new-say { padding: 10px 22px 0; color: var(--color-ink-3); font-size: var(--text-sm); }

.a-side { display: grid; gap: 20px; }
.a-rooms { display: grid; gap: 10px; }
.a-rooms ul { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); }
.room { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 2px 10px; padding: 14px 16px; border-radius: var(--radius-tile);
  background: var(--color-plate); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); block-size: 100%; }
.room > .ui-icon { position: absolute; inset-block-start: 50%; translate: 0 -50%; inset-inline-end: 14px; color: var(--color-ink-file); }
.room { grid-template-columns: auto minmax(0, 92px) minmax(0, 1fr); align-items: center; gap: 0 10px; padding: 7px 40px 7px 8px; }
.room-glyph { align-self: center; display: grid; place-items: center; inline-size: 36px; block-size: 36px; border-radius: var(--radius-glyph); background: var(--color-plate-tint); color: var(--color-ink-file); }
.room-name { font-weight: 700; color: var(--color-ink-file); font-size: var(--text-lg); }
.room-fig { color: var(--color-ink); }
.room-fig b { font-weight: 800; }
.room-sub { grid-column: 3; color: var(--color-ink-3); font-size: var(--text-sm); line-height: 1.3; }
.room-fig { grid-column: 3; grid-row: 1; line-height: 1.3; }
.room-glyph, .room-name { grid-row: 1 / span 2; }

.a-hold { display: grid; gap: 14px; }
.a-hold-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 6px 16px; }
.a-hold-head h2 { font-size: var(--text-2xl); }
.a-hold-head p { color: var(--color-ink-3); }
.a-makers { display: grid; gap: 12px; grid-template-columns: repeat(8, minmax(0, 1fr)); }
.maker { display: grid; gap: 4px; align-content: start; padding: 14px; border-radius: var(--radius-tile); background: var(--color-plate); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); block-size: 100%; }
.maker-mark { display: flex; align-items: center; gap: 8px; block-size: 30px; margin-block-end: 6px; font-weight: 800; }
.maker-mark.sm { block-size: 22px; margin: 0; }
.maker-mark.sm .mark-img { max-block-size: 18px; max-inline-size: 104px; }
.maker-mark.sm .mark-word { font-size: var(--text-base); line-height: 18px; }
.maker-a { font-weight: 600; font-size: var(--text-sm); }
.maker-b { color: var(--color-ink-3); font-size: var(--text-sm); }
.maker-all { background: var(--color-plate-tint); }

.a-ledgers { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
.a-ledger { padding-block-end: 10px; }
.a-ledger-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; padding: 16px 18px 6px; }
.a-ledger-head h3 { font-size: var(--text-xl); }
.a-ledger-head p { color: var(--color-ink-3); }
.a-ledger-head .ui-button { margin-inline-start: auto; }
.a-group { padding: 12px 18px 4px; }
.a-group-maker { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-weight: 600; font-size: var(--text-sm); color: var(--color-ink-3); border-block-start: 1px solid var(--color-rule); margin-block-start: 6px; padding-block-start: 12px; }
.row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 150px); gap: 12px; align-items: center; padding: 7px 18px; }
.row:hover { background: var(--color-wash); }
.row-name { font-weight: 600; }
.row-n { color: var(--color-ink-2); text-align: end; white-space: nowrap; }
.row-n b { color: var(--color-ink); }
.row-fits { color: var(--color-ink-2); }
.row-fits .zero { color: var(--accent-ochre); font-weight: 600; }
.row-fits .gone, .row.is-gone .row-name { color: var(--color-ink-3); }
.row-join { grid-template-columns: 20px minmax(0, 1fr) auto; }
.x { color: var(--color-ink-3); text-align: center; font-weight: 700; }

/* the spread, drawn in the notes */
.spread { display: grid; gap: 20px 32px; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr); padding: 22px; }
.spread-head h3 { font-size: var(--text-4xl); line-height: 1.1; margin-block: 6px; }
.spread-head p:not(.eyebrow) { color: var(--color-ink-2); }
.spread-head .eyebrow { display: flex; align-items: center; gap: 8px; }
.spread-acts { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 14px; }
.spread .eyebrow { margin-block-end: 8px; }
.bar-row { display: grid; grid-template-columns: 90px minmax(0, 1fr) 40px; gap: 10px; align-items: center; padding-block: 4px; font-weight: 600; }
.bar-row:hover { color: var(--color-ink-file); }
.bar-track { block-size: 8px; border-radius: 4px; background: var(--color-wash); }
.bar-track span { display: block; block-size: 100%; border-radius: 4px; background: var(--accent-blue); }
.bar-row b { text-align: end; }
.spread-fits .row { padding-inline: 0; }
.spread-choose { margin-block-start: 10px; color: var(--color-ink-2); }
.spread-foot { grid-column: 1 / -1; border-block-start: 1px solid var(--color-rule); padding-block-start: 12px; color: var(--color-ink-2); }

@media (min-width: 1600px) {
  .a-state { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); }
  .a-rooms ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .room { grid-template-columns: auto minmax(0, 1fr); }
  .room-glyph { grid-row: 1 / span 3; } .room-name { grid-row: 1; grid-column: 2; } .room-fig { grid-row: 2; grid-column: 2; } .room-sub { grid-row: 3; grid-column: 2; }
  .a-ledgers { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
}
@media (max-width: 1365px) {
  .a-makers { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 1099px) {
  .a-head { grid-template-columns: minmax(0, 1fr); }
  .a-state { grid-template-columns: minmax(0, 1fr); }
  .a-side { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
  .a-ledgers { grid-template-columns: minmax(0, 1fr); }
  .need { grid-template-columns: 84px minmax(0, 1fr) 140px; }
  .need-door { grid-column: 2; justify-self: start; }
  .room { grid-template-columns: auto minmax(0, 1fr); }
  .room-glyph { grid-row: 1 / span 3; } .room-name { grid-row: 1; grid-column: 2; } .room-fig { grid-row: 2; grid-column: 2; } .room-sub { grid-row: 3; grid-column: 2; }
  .spread { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 599px) {
  .a { gap: 20px; }
  .a-head h1 { font-size: var(--text-5xl); }
  .a-stamp { font-size: var(--text-base); }
  .a-dates { font-size: var(--text-sm); }
  .a-find input { font-size: var(--text-base); }
  .a-find .ui-kbd { display: none; }
  .a-sec-head { padding: 14px 14px 8px; }
  .a-side { grid-template-columns: minmax(0, 1fr); }
  .need { grid-template-columns: 64px minmax(0, 1fr); gap: 2px 8px; padding: 12px 14px 12px 10px; }
  .need-fig { grid-column: 1; grid-row: 1 / span 3; align-self: start; gap: 6px; }
  .need-fig b { font-size: var(--text-2xl); }
  .need-dot { inline-size: 8px; block-size: 8px; box-shadow: 0 0 0 3px oklch(from var(--accent-ochre) l c h / 18%); }
  .need-words { grid-column: 2; }
  .need-of { grid-column: 2; grid-row: 2; text-align: start; padding: 0; }
  .need-door { grid-column: 2; grid-row: 3; margin-block-start: 2px; }
  .track { display: none; }
  .need-say { font-size: var(--text-base); }
  .need-sub { font-size: var(--text-sm); }
  .years { display: none; }
  .a-zero { padding-inline: 14px; }
  .a-zero b { font-size: var(--text-6xl); }
  .a-new-list, .a-new-say { padding-inline: 14px; }
  .a-rooms ul { grid-template-columns: minmax(0, 1fr); gap: 0; border-radius: var(--radius-tile); overflow: hidden; box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
  .room { border-radius: 0; box-shadow: none; border-block-end: 1px solid var(--color-rule); border-inline-start: 4px solid var(--color-ink-file); padding: 10px 40px 10px 12px; }
  .room-glyph { inline-size: 30px; block-size: 30px; }
  .a-makers { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .maker { padding: 12px; }
  .maker-mark .mark-img { max-inline-size: 100%; }
  .row { grid-template-columns: auto minmax(0, 1fr); gap: 0 12px; padding-inline: 14px; }
  .row > .ui-kind { grid-row: 1 / span 3; align-self: start; }
  .row-n { grid-column: 2; text-align: start; white-space: normal; font-size: var(--text-sm); }
  .row-fits { grid-column: 2; font-size: var(--text-sm); }
  .row-join { grid-template-columns: 20px minmax(0, 1fr) auto; }
  .row-join .row-n { grid-column: 3; text-align: end; }
  .a-ledger-head, .a-group { padding-inline: 14px; }
  .spread { padding: 14px; }
  .spread-head h3 { font-size: var(--text-3xl); }
}
`

const notes = `
<section class="notes" aria-label="The board">
  <div class="frame">
    <header class="board-name"><span class="eyebrow">Data · Direction A</span><h2>The Monday list</h2><span class="rec">Recommended</span></header>
    <div class="cols">
      <div>
        <h3>The one job</h3>
        <p>The Master Price File as one place: what needs Northside, what is new, the rooms, and every list it carries, each a door (docs/SCREENS.md, the owner on 2026-10-31).</p>
        <h3 style="margin-top:18px">What only this screen does</h3>
        <p>It is the only screen that says, in one list, everything the price file is waiting on Northside for, from five rooms at once, and turns each one to a tick when it is done. Review settles cases one at a time and Prices decides one question at a time. Only Data counts them together over the whole file.</p>
      </div>
      <div>
        <h3>Order and grouping</h3>
        <ol class="dash">
          <li>1. The head: which file, how big, and its three dates (packed, Northside’s last change, and the span its own headings date).</li>
          <li>2. <b>Needs Northside</b>: a checklist of five open items and one done. Each item has a figure, its numerator and denominator, and a door.</li>
          <li>3. <b>New since 16 September 2026</b>: the zero said as a figure.</li>
          <li>4. The six rooms, each a counted door, under New since on a desk and after it on a phone.</li>
          <li>5. What the file holds: eight maker tiles, then the 18 lists you sell from beside the 28 lists of what fits, grouped by maker.</li>
        </ol>
      </div>
    </div>
    <div class="cols">
      <div>
        <h3>References new to this board</h3>
        <ul class="dash">
          <li><b>GitHub Insights, Community standards</b>, at <code>docs/research/refs/data/round-2/live/github-insights-community.png</code>. A checklist where each missing item is a dot with its door and a present one is a tick. This is where Needs Northside comes from.</li>
          <li><b>Wikipedia, Page information</b>, at <code>live/wiki-page-info.png</code>. “Recent number of edits: 0” is printed as a figure under the total. That is the source of “0 lines changed by Northside, of 15,691”.</li>
        </ul>
        <p>It also draws on <code>hand/npm-versions-390.png</code> for the rooms as full-width rows with an edge at 390, and on <code>shelf/live/dolthub-pull-compare.png</code> (stock) for the per-list change count the zero becomes.</p>
      </div>
      <div>
        <h3>The mark</h3>
        <p>Each maker’s own mark sits on its tile, once, at 26 px tall, from <code>public/brand-marks</code>. Stabicraft is set as a word, because the ledger holds only its white mark. On a pressed maker the mark is not drawn a second time. The spread’s head is the maker’s name, and a cover appears only where the heroes ledger holds that maker’s on-water photograph.</p>
        <h3 style="margin-top:18px">What a dealer can replace</h3>
        <p>The accent (the doors and the room glyphs read <code>--color-ink-file</code>), the ochre of an open item, and the type ramp. Nothing here leans on a photograph, so the page holds without one.</p>
      </div>
    </div>
    ${spread}
    <div class="cols">
      <div>
        <h3>Type, at 1:1</h3>
        <div class="specimen">
          <div><span>6xl 40/1 800</span><span style="font-size:var(--text-6xl);font-weight:800;line-height:1">Data</span></div>
          <div><span>mark 72 800</span><span style="font-size:var(--text-mark);font-weight:800;line-height:.9">0</span></div>
          <div><span>3xl 26 800</span><span style="font-size:var(--text-3xl);font-weight:800">37</span></div>
          <div><span>2xl 22 700</span><span style="font-size:var(--text-2xl);font-weight:700">Needs Northside</span></div>
          <div><span>lg 16 600</span><span style="font-size:var(--text-lg);font-weight:600">4 answers about price only Northside can give</span></div>
          <div><span>base 14 400</span><span>Dealer Fit 1,777 · Rigging Kits 650 · Yamaha Outboards 209</span></div>
          <div><span>sm 13 400</span><span style="font-size:var(--text-sm);color:var(--color-ink-3)">of 222 headings in the 5 lists that date any</span></div>
        </div>
        <p style="margin-top:10px">One face, the system sans (<code>--font-sans</code>). Nothing on the page is under 13 px except the eyebrows (12 px caps). The measure of a need’s sentence is 60–75 characters at 1440.</p>
      </div>
      <div>
        <h3>Motion</h3>
        <p>On arrival nothing moves: the state is there when the page is. When a count changes (a case settled in Review, then back here), the figure swaps in place over 160 ms (opacity only), and its row’s dot becomes a tick over 200 ms. Pressing a maker tile opens the spread directly under that tile’s row: the spread grows from 0 to its height over 240 ms on the drawer ease, the tiles above stay still, and the page scrolls only enough to show the spread’s head below the bar. Reduced motion: no growth and no scroll animation. The spread is simply there, and the figure swaps without a fade.</p>
        <h3 style="margin-top:18px">Keyboard</h3>
        <p><kbd>/</kbd> focuses the find. Tab goes through the six needs’ doors in order, then the rooms, then the maker tiles (one stop, arrows inside), then the ledgers’ rows. Enter on a row opens its sheet, and Space opens its spread.</p>
      </div>
    </div>
    <div>
      <h3>How it reflows</h3>
      <table>
        <tr><th>Size</th><th>What the composition becomes</th></tr>
        <tr><td>390×844</td><td>The head, the find, then the needs as tight rows (dot, sentence, figure, door under the words). The year strip is hidden, and its sentence keeps the oldest date. Then the zero, the rooms as six full-width rows with an edge, the makers 2-up (eight tiles fill four rows, with no empty slot), and the two ledgers stacked. The first window holds the head and the first two needs, with the third starting.</td></tr>
        <tr><td>844×390</td><td>The tablet column under the floating bar. The page starts at 72 px, so nothing opens under the bar. The first window holds the head and the start of the first need. The spread scrolls to its own head, with a scroll margin of 72 px.</td></tr>
        <tr><td>834×1112</td><td>One column: the needs at full width, then New since beside the six rooms, the makers 4×2 (the eighth tile is “Every maker”, so no slot is empty), and the ledgers stacked.</td></tr>
        <tr><td>1280×800</td><td>As 1440, with the makers 4×2. The needs sit beside a right column, 2:1, that holds New since over the six rooms.</td></tr>
        <tr><td>1440×900</td><td>As drawn: the head, then the needs beside a right column (2:1) of New since over the six rooms as one-line doors. The eight maker tiles make one row, and the ledgers sit side by side.</td></tr>
        <tr><td>1920×1080</td><td>The frame grows to 1,760 px. The needs and the right column run 7:5, so a need’s sentence keeps its measure. The rooms sit 2×3 under New since, and the makers make one row of eight. The window shows the needs, New since, the rooms and the makers, with no empty floor.</td></tr>
      </table>
    </div>
    <div class="cols">
      <div>
        <h3>Honest constraints</h3>
        <ul class="dash">
          <li>Every figure is read from the file or from the room that owns it (<code>facts.mjs</code> names each source). The 25 dates are the headings’ own words, read by a parser this board carries. The build gets a pure one in <code>src/domain</code> with its tests. No date is inferred.</li>
          <li>0 lines changed is the truth: every row’s <code>updatedAt</code> equals <code>packedAt</code>. No arrow or trend is drawn, because there is no earlier file to compare.</li>
          <li>Cost and margin appear nowhere. Data is the admin’s room, and “5 costs, never on a quote” is the only mention.</li>
          <li>The “1 done” item is true today. The tick pattern is not an invented completion.</li>
        </ul>
      </div>
      <div>
        <h3>Owed whatever wins</h3>
        <ul class="dash">
          <li>The OBSOLETE spread at 390 must not scroll sideways. Its title and buttons wrap, and its own-page button goes under the title.</li>
          <li><i>Make it</i> with no name is refused at the field with “A list needs a name.” A made spread says “lines”, not “rows”.</li>
          <li>A spread opened at 844×390 scrolls with <code>scroll-margin-top: 72px</code>, so its head clears the bar.</li>
          <li>Kept: the spread’s content, counting through <code>register.ts</code>, the one write with its Undo, the shelf’s single tab stop, and reduced motion.</li>
        </ul>
      </div>
    </div>
  </div>
</section>`

export const html = page({ title: 'Data A · The Monday list', id: 'a', css, body, notes })
