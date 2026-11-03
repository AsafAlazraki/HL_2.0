/* BOARD C — TWO ROOMS: SHOW AND KEEP. /catalogue?room=show&aisle=radios · ?room=keep
   One segmented control over the same aisles. Show is the customer's: the photographs large,
   then every other part as type with its two prices, and no code, no supplier, no to-do. Keep
   is Northside's: the work the list is waiting on, grouped by the work, each counted. */
import {
  AISLES,
  DIFFER,
  FITTED_ONLY,
  MARKS,
  NO_PRICE,
  ON_SALE,
  PARTS,
  PICS,
  PICTURED,
  UNPICTURED,
  ZERO_BOTH,
  boatsOf,
  caseTwins,
  find,
  headingSaid,
  headingsOf,
  inAisle,
  makerProposals,
  money,
  n,
  twoPrices,
} from './facts.mjs'
import { AISLE_GLYPH, esc, ic, jobsTable, page, prices } from './shell.mjs'

const AISLE = 'radios'
const aisle = AISLES.find((a) => a.id === AISLE)
const parts = inAisle(AISLE)
const shot = parts.filter((p) => p.pictured)
const rest = parts.filter(
  (p) => !p.pictured && twoPrices(p).kind !== 'none' && !/^NB:/i.test(p.product),
)
const restHeads = headingsOf(rest)

const card = (p) => `
<article class="c-card">
  <div class="c-card-pic"><img class="ui-picture" data-fit="contain" data-landed src="${PICS}${p.pic.file}" alt="${esc(p.name)}" loading="lazy">
    <button class="ui-button c-zoom" data-intent="veiled" data-size="sm" aria-label="See ${esc(p.name)} larger">${ic('ArrowsOutSimple')}</button></div>
  <h3>${esc(p.name)}</h3>
  <div class="c-card-pr">${prices(p)}</div>
</article>`

const typeLine = (p) =>
  `<li class="c-tl"><span class="c-tl-name">${esc(p.name)}</span><span class="c-tl-pr">${prices(p)}</span></li>`

const head = (room) => `
<header class="c-head">
  <img class="c-mark" src="${MARKS}northside-marine.png" alt="Northside Marine">
  <h1>Chandlery</h1>
  <div class="ui-segmented-frame c-rooms"><fieldset class="ui-segmented"><legend class="ui-segmented-legend">Room</legend>
    <label class="ui-segmented-option"${room === 'show' ? ' data-checked' : ''}>${room === 'show' ? '<span class="ui-segmented-thumb"></span>' : ''}<input class="ui-segmented-input" type="radio" name="c-room-${room}"${room === 'show' ? ' checked' : ''}><span class="ui-segmented-face">${ic('Storefront')}Show <small>for the customer</small></span></label>
    <label class="ui-segmented-option"${room === 'keep' ? ' data-checked' : ''}>${room === 'keep' ? '<span class="ui-segmented-thumb"></span>' : ''}<input class="ui-segmented-input" type="radio" name="c-room-${room}"${room === 'keep' ? ' checked' : ''}><span class="ui-segmented-face">${ic('Toolbox')}Keep <small>for Northside</small></span></label>
  </fieldset></div>
  <label class="find c-find">${ic('MagnifyingGlass', { size: 'md' })}<span class="sr">Find a part</span><input placeholder="Name, code, maker or heading"><kbd class="ui-kbd ui-kbd--quiet"><span class="ui-kbd-key">/</span></kbd></label>
</header>`

const body = `
<main class="c-page frame" id="main">
  ${head('show')}
  <section class="c-aisle" aria-labelledby="c-aisle-h">
    <div class="c-aisle-head">
      <button class="ui-button c-change" data-intent="quiet" data-size="sm">${ic('ArrowLeft')}Change aisle</button>
      <h2 id="c-aisle-h">${esc(aisle.name)}</h2>
      <p class="c-count"><b>${parts.length}</b> parts · <b>${shot.length}</b> photographed</p>
      <span class="c-boat"><span class="ui-chip-frame"><button class="ui-chip" aria-pressed="false">${ic('Boat')}For a boat…</button></span></span>
    </div>
    <div class="c-shots">${shot.map(card).join('')}</div>
    <section class="c-rest" aria-labelledby="c-rest-h">
      <h3 id="c-rest-h">Also in ${esc(aisle.name)} <span class="num">${rest.length}</span></h3>
      <div class="c-rest-cols">
        ${restHeads
          .map(
            (h) =>
              `<div class="c-rest-group"><h4>${esc(headingSaid(h.k))}</h4><ul>${rest
                .filter((p) => p.heading === h.k)
                .map(typeLine)
                .join('')}</ul></div>`,
          )
          .join('')}
      </div>
    </section>
    <p class="said c-quote">A part is quoted on its own only where Northside lets it, and Parts &amp; Accessories is sold only with a boat today. <a class="door" href="#">Let it be quoted on its own ${ic('ArrowRight')}</a></p>
  </section>
</main>`

/* THE KEEP ROOM, drawn as the second state */
const twins = caseTwins()[0]
const props = makerProposals()
const unsorted = inAisle('unsorted')
const noPrice = PARTS.filter((p) => twoPrices(p).kind === 'none')
const notes_ = PARTS.filter((p) => /^NB:/i.test(p.product))
const anchoring = inAisle('anchoring')
const sg = find('SG002')[0]
const bar = (a) => {
  const not = a.parts - a.pictured
  return `<li><span class="k-aisle">${ic(AISLE_GLYPH[a.id])}${esc(a.name)}</span><span class="k-bar" aria-hidden="true"><span style="inline-size:${((a.pictured / a.parts) * 100).toFixed(1)}%"></span></span><span class="k-n num">${not ? `<b>${n(not)}</b> of ${n(a.parts)}` : 'done'}</span></li>`
}
const keep = () => `
<div class="k">
  ${head('keep')}
  <p class="k-lede">What the chandlery is waiting on Northside for. Each list is counted off the price list, and each count falls as the work is done.</p>
  <div class="k-grid">
    <section class="k-card k-wide">
      <header><h3>${ic('ImageSquare')}To picture</h3><p><b class="num">${n(UNPICTURED)}</b> of ${n(ON_SALE)} parts have no picture</p></header>
      <ul class="k-bars">${AISLES.map(bar).join('')}</ul>
      <div class="k-drop" role="group" aria-label="Pictures by code">
        <p><b>Drop many pictures at once.</b> Each lands only on the part whose code its file name carries: <code>${esc(sg.code)}.jpg</code> lands on ${esc(sg.name)}. A file whose name carries no code on the list is refused, by name, in this box.</p>
        <button class="ui-button" data-intent="secondary" data-size="sm">${ic('UploadSimple')}Choose pictures</button>
      </div>
      <h4>Anchoring &amp; mooring <span class="num">${anchoring.length} to picture</span></h4>
      <ul class="k-list">${anchoring
        .slice(0, 5)
        .map(
          (p) =>
            `<li><span class="k-name">${esc(p.name)}</span><span class="code">${esc(p.code)}</span><span class="k-sup">${esc(p.maker)}</span><button class="ui-button" data-intent="quiet" data-size="sm">${ic('ImageSquare')}Add a picture</button></li>`,
        )
        .join('')}</ul>
      <p class="k-more"><a class="door" href="#">All ${anchoring.length} in Anchoring &amp; mooring ${ic('ArrowRight')}</a></p>
    </section>
    <section class="k-card">
      <header><h3>${ic('Question')}To place in an aisle</h3><p><b class="num">${unsorted.length}</b> parts under ${headingsOf(unsorted).length} headings no aisle gathers</p></header>
      <ul class="k-place">${headingsOf(unsorted)
        .map(
          (h) =>
            `<li><div><b>${esc(headingSaid(h.k))}</b> <span class="num">${h.c}</span><p>${unsorted
              .filter((p) => p.heading === h.k)
              .slice(0, 4)
              .map((p) => esc(p.name))
              .join(
                ' · ',
              )}${h.c > 4 ? ` · and ${h.c - 4} more` : ''}</p></div><span class="k-select">Put in an aisle${ic('CaretDown')}</span></li>`,
        )
        .join('')}</ul>
      <p class="said">The 25 under no heading cannot be placed by heading: each is placed on its own, with Undo.</p>
    </section>
    <section class="k-card">
      <header><h3>${ic('IdentificationCard')}To name</h3><p><b class="num">0</b> of 78 supplier codes named</p></header>
      <ul class="k-names">
        <li><span><b>${esc(twins[0].code)}</b> and <b>${esc(twins[1].code)}</b> differ only in capitals · ${twins[0].lines} + ${twins[1].lines} lines</span><a class="door" href="#">Make them one</a></li>
        ${props.map((p) => `<li><span><span class="code">${esc(p.code)}</span> → <b>${esc(p.word)}</b> · ${p.of} of ${p.lines} lines under ${esc(p.word.toUpperCase())}</span><a class="door" href="#">Name it</a></li>`).join('')}
      </ul>
    </section>
    <section class="k-card">
      <header><h3>${ic('Tag')}To price</h3><p><b class="num">${NO_PRICE}</b> parts with no price at either level</p></header>
      <ul class="k-plain">${noPrice
        .slice(0, 4)
        .map((p) => `<li>${esc(p.name)} <span class="code">${esc(p.code)}</span></li>`)
        .join('')}<li>and ${NO_PRICE - 4} more</li></ul>
      <p><a class="door" href="#">Settle them in Review ${ic('ArrowRight')}</a></p>
      <p class="said">${FITTED_ONLY} more are priced fitted only. That is not work: Show says <i>fitted only</i> beside the fitted figure.</p>
    </section>
    <section class="k-card">
      <header><h3>${ic('NotePencil')}Notes, not parts</h3><p><b class="num">${notes_.length}</b> lines are notes in the price list</p></header>
      <ul class="k-plain">${notes_.map((p) => `<li><i>${esc(p.product)}</i> · ${esc(headingSaid(p.heading))}</li>`).join('')}</ul>
      <p class="said">Show draws them as notes beside their aisle, never as parts with a price.</p>
    </section>
    <section class="k-card">
      <header><h3>${ic('FileText')}To quote on its own</h3><p>Parts &amp; Accessories: <b>off</b></p></header>
      <p class="said">Until it is on, a part is sold only on a quote that has a boat. One press, with Undo.</p>
      <button class="ui-button" data-intent="secondary" data-size="sm">${ic('ToggleLeft')}Let parts be quoted on their own</button>
    </section>
  </div>
</div>`

const notes = `
<section class="notes" aria-label="About this board">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Board C · the chandlery redrawn</span><h2>Two rooms: Show and Keep</h2></div>
  <p><b>The screen’s one job:</b> show a customer at the desk what Northside sells, as well as it can be shown, and keep the list behind it whole.</p>
  <p><b>What this screen does that no other does:</b> it separates what the customer sees from the work the list needs, over the same aisles, with one control. Show has no code, no supplier and no <i>Add a picture</i>; Keep has every one of them, as six counted worklists that fall as the work is done.</p>
  <div class="cols">
    <div>
      <h3>Order and grouping</h3>
      <ol class="dash">
        <li>— Northside’s mark, the room (<b>Show | Keep</b>) and find, at the top of both rooms.</li>
        <li>— <b>Show</b>: the aisle held large with <i>Change aisle</i>; its photographs as large cards; then every other part as type, grouped by heading, with its two prices.</li>
        <li>— <b>Keep</b>: grouped by the work, not by the aisle: to picture (by aisle, with the drop by code), to place, to name, to price, notes, and the quote switch.</li>
      </ol>
    </div>
    <div>
      <h3>References new to this board</h3>
      <ul class="dash">
        <li>— Akeneo’s product grid: <i>Display · List | Gallery</i> over one set of products, and <i>Picture is not empty</i> as a filter. <code>docs/research/refs/choosing/round-2/live/akeneo-grid-filters.png</code>.</li>
        <li>— Akeneo’s product link rules: a file name carries the code, and a picture finds its own product. <code>live/akeneo-product-link-rules.png</code>.</li>
        <li>— Supporting: Akeneo’s <i>Unclassified products</i> bucket. <code>live/akeneo-grid-columns.png</code>.</li>
      </ul>
    </div>
  </div>
  <div class="state"><span class="eyebrow">Second state · the Keep room, <code>/catalogue?room=keep</code></span>${keep()}</div>
  <div class="cols">
    <div>
      <h3>The two prices</h3>
      <p>On Show every part says supply and fitted in words beside the figures. They differ on ${n(DIFFER)} of ${n(ON_SALE)}. ${FITTED_ONLY} read <i>fitted only</i> and their fitted figure, never $0: <i>Trailer Adjustment · 15 to 17ft</i> reads $206 fitted. <i>Supply only</i> is said where the Install Type says so. ${NO_PRICE} with no price at either level are not shown on Show at all; they stand in Keep’s <i>To price</i>, so a customer never reads “no price”. ${ZERO_BOTH} carry $0 at both levels, as the file writes them. TTF hours are a cost column and never drawn.</p>
      <h3>The mark</h3>
      <p>Northside’s mark leads both rooms at the size of a shop sign, because Show is the room a customer looks at: the chandlery is Northside’s shop, and Show is its window. Keep keeps the mark so the two rooms read as one place.</p>
    </div>
    <div>
      <h3>What a dealer can replace</h3>
      <p>The mark, the accent, the aisle names and their headings, the supplier names, and every picture. With no pictures at all, Show is the type lists, and the room still reads as a price list set well. Show and Keep themselves are fixed: they are the honesty of the screen.</p>
      <h3>Honest constraints</h3>
      <ul class="dash">
        <li>— Only 4 of 19 aisles hold a photograph: Sounders 161, Electric 14, Radios 12, Stereo 10. Show for Anchoring is type only, the truth.</li>
        <li>— <i>Fitted</i> on the handheld radios equals supply, as the file writes it.</li>
        <li>— Supplier names are proposals measured off the headings; nothing is named without Northside.</li>
        <li>— Cost, margin and hours appear on no surface of this board; Keep shows codes and supplier codes, never cost.</li>
      </ul>
    </div>
  </div>
  <div class="cols">
    <div>
      <h3>Type, at 1:1</h3>
      <div class="specimen">
        <div><span>room · 2xl/800</span><span style="font-size:var(--text-2xl);font-weight:800">Chandlery</span></div>
        <div><span>aisle · 5xl/800</span><span style="font-size:var(--text-5xl);font-weight:800;line-height:1.05">Radios &amp; beacons</span></div>
        <div><span>card · lg/700</span><span style="font-size:var(--text-lg);font-weight:700">VHF Fixed Mount Marine Radio · White</span></div>
        <div><span>type line · base/500</span><span>VHF Handheld Marine Radio · 5/1 Watt</span></div>
        <div><span>price · lg/700</span><span class="num" style="font-size:var(--text-lg);font-weight:700">$249 <small style="font-size:var(--text-xs);color:var(--color-ink-3)">supply</small> $660 <small style="font-size:var(--text-xs);color:var(--color-ink-3)">fitted</small></span></div>
      </div>
    </div>
    <div>
      <h3>Motion</h3>
      <p>Changing room: the segment’s thumb slides 180 ms on the kit’s settle curve; the room below is replaced, not animated. <i>Change aisle</i> opens the 19 aisles as a sheet over the room (a dialog at a desk), each with its photographs counted; choosing one closes it and the room starts at the aisle’s top. A card’s expand opens the gallery. In Keep a count falls as a picture lands, without a flourish: the number changes and the aisle’s bar fills.</p>
      <p><b>Reduced motion:</b> the thumb jumps; the sheet appears in place.</p>
      <p><b>Keyboard:</b> <kbd>/</kbd> finds; the room control is a radio group (arrows move); Tab then reaches <i>Change aisle</i>, the boat chip, each card’s expand, and in Keep each list’s door.</p>
    </div>
  </div>
  <div class="cols">
    <div>
      <h3>How it reflows</h3>
      <table><tbody>
        <tr><td>1920 × 1080</td><td>Cards six a row; the other parts in three columns by heading. Keep is a 3-column grid with <i>To picture</i> two wide.</td></tr>
        <tr><td>1440 × 900 · 1280 × 800</td><td>As drawn: cards five (four at 1280) a row; the type lists in three columns. Keep in three columns.</td></tr>
        <tr><td>834 × 1112</td><td>Cards three a row; the type lists in two columns. Keep in two columns.</td></tr>
        <tr><td>844 × 390</td><td>The bar at the foot; the mark, the room and find on one line; the aisle’s name in one line; cards four a row, short. Keep in two columns.</td></tr>
        <tr><td>390 × 844</td><td>As drawn: mark and room over find; cards two a row; the type list one column, the two prices under each name. Keep is one column.</td></tr>
      </tbody></table>
    </div>
    ${jobsTable([
      [
        'J1 show an aisle',
        'Show holds the aisle large; the photographs first, everything else under them; <i>Change aisle</i> never pushes the parts down.',
      ],
      [
        'J2 fitted price',
        'Both prices on every card and type line, said in words; never $0 where fitted.',
      ],
      ['J3 maker word', 'Find reads supplier and heading in both rooms: <i>lowrance</i> 144.'],
      ['J4 code', 'Find reads codes; Keep prints them; <i>SG002</i> answers.'],
      ['J5 picture large', 'Every Show card’s expand opens the gallery.'],
      ['J6 his boat', 'The boat chip on Show; paired parts lead.'],
      ['J7 quote a part', 'The sentence on Show and the switch in Keep.'],
      [
        'J8 own picture',
        'Keep, <i>To picture</i>: one per part, or many at once by code; a refusal is said in the drop box.',
      ],
      ['J9 no-picture worklist', 'Keep, <i>To picture</i>: 2,041, by aisle, each count falling.'],
      [
        'J10 open its line',
        'Keep’s lists name the line; each part’s line is one press from Keep; no price → Review.',
      ],
      ['J11 place the unsorted', 'Keep, <i>To place</i>: <i>Put in an aisle</i>, with Undo.'],
      ['J12 narrow by maker', 'Keep names suppliers; Show then narrows by name.'],
      [
        'J13 447 propellers',
        'Show for Propellers: no photographs, so ten headed type lists, 447 lines on one page.',
      ],
      ['J14 no file', 'Unchanged: the sentence and the door.'],
      ['J15 wrong address', 'A wrong aisle opens <i>Change aisle</i> with the sentence.'],
    ])}
  </div>
</div>
</section>`

const css = `
.c-head { display: grid; grid-template-columns: auto auto minmax(0, 1fr) minmax(0, 440px); align-items: center; gap: 12px 24px; padding-block: 10px 18px; }
.c-mark { display: block; block-size: 52px; inline-size: auto; max-inline-size: 220px; object-fit: contain; }
.c-head h1 { font-size: var(--text-2xl); padding-inline-start: 20px; border-inline-start: 1px solid var(--color-rule-strong); }
.c-rooms .ui-segmented-option { min-block-size: 44px; padding-inline: 18px; font-size: var(--text-base); }
.c-rooms small { font-weight: 500; color: var(--color-ink-3); font-size: var(--text-xs); }
.c-find { min-inline-size: 0; }
.c-aisle { display: grid; gap: 22px; }
.c-aisle-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'change change' 'name boat' 'count boat'; align-items: end; gap: 2px 16px;
  padding-block: 18px 6px; border-block-start: 1px solid var(--color-rule-strong); }
.c-change { grid-area: change; justify-self: start; margin-inline-start: -10px; }
.c-aisle-head h2 { grid-area: name; font-size: var(--text-5xl); line-height: 1.05; letter-spacing: -0.02em; }
.c-count { grid-area: count; color: var(--color-ink-2); }
.c-boat { grid-area: boat; align-self: end; }
.c-shots { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 18px; }
.c-card { display: grid; grid-template-rows: auto 1fr auto; gap: 10px; padding: 12px 12px 14px; border-radius: var(--radius-tile); background: var(--color-plate);
  box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
.c-card-pic { position: relative; aspect-ratio: 1; border-radius: var(--radius-md); background: var(--color-white); overflow: hidden; padding: 10px; }
.c-zoom { position: absolute; inset-block-start: 8px; inset-inline-end: 8px; inline-size: 34px; padding: 0; }
.c-card h3 { font-size: var(--text-lg); line-height: 1.25; }
.c-card-pr { display: flex; gap: 20px; align-items: center; }
.c-card-pr .pc { justify-items: start; }
.c-card-pr .pc b { font-size: var(--text-lg); }
.c-rest { display: grid; gap: 14px; padding-block-start: 10px; }
.c-rest h3 { font-size: var(--text-xl); display: flex; gap: 10px; align-items: baseline; }
.c-rest h3 .num { color: var(--color-ink-3); font-size: var(--text-base); }
.c-rest-cols { columns: 3 300px; column-gap: 36px; }
.c-rest-group { break-inside: avoid; padding-block: 4px 16px; }
.c-rest-group h4 { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-ink-3); padding-block-end: 6px; border-block-end: 1px solid var(--color-rule-strong); }
.c-tl { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 14px; align-items: center; padding-block: 7px; border-block-end: 1px solid var(--color-rule); }
.c-tl-name { font-weight: 500; }
.c-tl-pr { display: grid; grid-template-columns: 4.2rem 4.2rem; gap: 6px; }
.c-tl-pr .pc b { font-size: var(--text-sm); }
.c-quote { margin-block-start: 4px; }

/* KEEP */
.k { display: grid; gap: 18px; }
.k .c-head { padding-block-start: 0; }
.k-lede { color: var(--color-ink-2); }
.k-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; align-items: start; }
.k-card { display: grid; gap: 12px; padding: 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); min-inline-size: 0; }
.k-wide { grid-column: span 2; grid-row: span 2; }
.k-card header { display: grid; gap: 4px; }
.k-card h3 { display: flex; align-items: center; gap: 8px; font-size: var(--text-xl); margin: 0; }
.k-card h3 .ui-icon { color: var(--color-ink-file); }
.k-card header p { font-size: var(--text-base); color: var(--color-ink-2); }
.k-card h4 { font-size: var(--text-base); display: flex; gap: 10px; align-items: baseline; }
.k-card h4 .num { font-size: var(--text-sm); color: var(--color-ink-3); font-weight: 600; }
.k-bars { columns: 2 280px; column-gap: 28px; }
.k-bars li { display: grid; grid-template-columns: minmax(0, 1fr) 70px 7.5rem; gap: 10px; align-items: center; padding-block: 3px; font-size: var(--text-sm); break-inside: avoid; margin: 0; max-inline-size: none; }
.k-aisle { display: flex; align-items: center; gap: 6px; min-inline-size: 0; color: var(--color-ink); }
.k-aisle .ui-icon { color: var(--color-ink-file); flex: none; }
.k-bar { block-size: 6px; border-radius: var(--radius-pill); background: var(--color-wash); overflow: hidden; }
.k-bar span { display: block; block-size: 100%; background: var(--color-leaf-600); }
.k-n { text-align: end; color: var(--color-ink-2); white-space: nowrap; }
.k-drop { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 14px; border-radius: var(--radius-md); background: var(--color-ground); box-shadow: inset 0 0 0 1px var(--color-control-edge); }
.k-drop p { font-size: var(--text-sm); color: var(--color-ink-2); }
.k-list li { display: grid; grid-template-columns: minmax(0, 1fr) 7rem 3rem auto; gap: 10px; align-items: center; padding-block: 4px; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); margin: 0; max-inline-size: none; }
.k-name { font-weight: 600; }
.k-sup { color: var(--color-ink-2); }
.k-place li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: start; padding-block: 8px; border-block-end: 1px solid var(--color-rule); margin: 0; max-inline-size: none; }
.k-place p { font-size: var(--text-sm); color: var(--color-ink-2); }
.k-select { display: inline-flex; align-items: center; gap: 6px; min-block-size: 32px; padding-inline: 10px; border-radius: var(--radius-field); box-shadow: inset 0 0 0 1px var(--color-control-edge); background: var(--color-plate); font-size: var(--text-sm); font-weight: 600; white-space: nowrap; }
.k-names li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; padding-block: 6px; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); margin: 0; max-inline-size: none; }
.k-plain li { font-size: var(--text-sm); margin: 0; padding-block: 3px; }
.k-card .said { font-size: var(--text-sm); }

/* REFLOW */
@media (min-width: 1600px) { .c-shots { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); } }
@media (max-width: 1279px) { .k-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .k-wide { grid-row: auto; } }
@media (max-width: 1100px) {
  .c-head { grid-template-columns: auto auto minmax(0, 1fr); } .c-find { grid-column: 1 / -1; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .c-head { grid-template-columns: auto auto auto minmax(0, 1fr); padding-block: 4px 8px; } .c-find { grid-column: auto; }
  .c-mark { block-size: 36px; } .c-head h1 { font-size: var(--text-xl); padding-inline-start: 12px; }
  .c-rooms small { display: none; } .c-rooms .ui-segmented-option { min-block-size: 36px; padding-inline: 12px; }
  .c-aisle-head { grid-template-areas: 'change change' 'name boat'; padding-block-start: 8px; } .c-count { display: none; }
  .c-aisle-head h2 { font-size: var(--text-3xl); }
  .c-shots { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .c-card h3 { font-size: var(--text-sm); } .c-card-pic { padding: 6px; }
}
@media (max-width: 760px) { .k-grid { grid-template-columns: minmax(0, 1fr); } .k-wide { grid-column: auto; } .k-list li { grid-template-columns: minmax(0, 1fr) auto; } .k-list .code, .k-list .k-sup { display: none; } }
@media (max-width: 599px) {
  .c-head { grid-template-columns: auto minmax(0, 1fr); gap: 12px; }
  .c-mark { block-size: 38px; }
  .c-head h1 { font-size: var(--text-xl); padding-inline-start: 12px; }
  .c-rooms { grid-column: 1 / -1; } .c-rooms .ui-segmented { display: grid; inline-size: 100%; } .c-rooms { display: grid; }
  .c-rooms .ui-segmented-option { padding-inline: 8px; }
  .c-find .ui-kbd { display: none; }
  .c-aisle-head { grid-template-areas: 'change' 'name' 'count' 'boat'; grid-template-columns: minmax(0, 1fr); }
  .c-boat { justify-self: start; margin-block-start: 8px; }
  .c-aisle-head h2 { font-size: var(--text-4xl); }
  .c-shots { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .c-card { padding: 8px 8px 10px; gap: 8px; } .c-card-pic { padding: 6px; }
  .c-card h3 { font-size: var(--text-sm); } .c-card-pr { gap: 12px; } .c-card-pr .pc b { font-size: var(--text-base); }
  .c-tl { grid-template-columns: minmax(0, 1fr); }
  .c-tl-pr { grid-template-columns: auto auto; justify-content: start; gap: 18px; }
  .c-tl-pr .pc { justify-items: start; }
  .k-drop { grid-template-columns: minmax(0, 1fr); }
  .k-bars li { grid-template-columns: minmax(0, 1fr) 6.5rem; } .k-bar { display: none; }
}
`

export const html = page({ title: 'Chandlery · C', id: 'c', css, body, notes })
