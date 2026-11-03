/* BOARD B — THE RAIL AND THE LEDGER. /catalogue?aisle=propellers&sort=file
   The aisles are a counted rail at a desk and a sheet in a hand, beside one dense ledger: a row
   per part, columns that sort, the file's headings as group rows, both prices in their own
   columns, and every row one press from its line in the sheet. */
import {
  AISLES,
  DIFFER,
  FITTED_ONLY,
  MAKERS,
  PARTS,
  MARKS,
  NO_PRICE,
  ON_SALE,
  PICS,
  PICTURED,
  ZERO_BOTH,
  caseTwins,
  find,
  headingSaid,
  headingsOf,
  inAisle,
  makerProposals,
  makersOf,
  n,
  twoPrices,
} from './facts.mjs'
import { AISLE_GLYPH, esc, ic, jobsTable, page, prices } from './shell.mjs'

const AISLE = 'propellers'
const aisle = AISLES.find((a) => a.id === AISLE)
const parts = inAisle(AISLE)
const heads = headingsOf(parts)
const makers = makersOf(parts)
const twins = caseTwins()[0]
const twinHere = twins.map((t) => ({ ...t, here: parts.filter((p) => p.maker === t.code).length }))
const DRAWN = { 'PROPELLERS - Yamaha': 34, 'YAMAHA SERVICE ITIEMS': 10 }

const isNote = (p) => /^NB:/i.test(p.product)
const row = (p) => {
  if (isNote(p))
    return `<tr class="b-note"><td></td><td colspan="5"><span class="b-note-word">A note in the price list, not a part:</span> ${esc(p.product.replace(/^NB:\s*/i, ''))}</td><td></td></tr>`
  const t = twoPrices(p)
  const pr = prices(p)
  return `<tr>
  <td class="b-th">${p.pic ? `<img class="ui-picture" data-fit="contain" data-landed src="${PICS}${p.pic.file}" alt="">` : ''}</td>
  <th scope="row" class="b-part"><a href="#">${esc(p.name)}</a><span class="b-meta"><span class="code">${esc(p.code)}</span> · ${esc(p.maker || 'no supplier')}</span></th>
  <td class="b-code"><span class="code">${esc(p.code)}</span></td>
  <td class="b-sup">${esc(p.maker || '—')}</td>
  ${t.kind === 'none' ? `<td class="b-n" colspan="2">${pr}</td>` : `<td class="b-n">${pr.split('</span>')[0]}</span></td><td class="b-n">${pr.split('</span>').slice(1).join('</span>')}</td>`}
  <td class="b-go"><a class="ui-button" data-intent="quiet" data-size="sm" href="#" aria-label="Open the line of ${esc(p.name)} in Parts &amp; Accessories">${ic('Table')}<span>Line</span></a></td>
</tr>`
}

const groupRows = ({ k, c }) => {
  const rows = parts.filter((p) => p.heading === k)
  const drawn = DRAWN[k] ?? rows.length
  return `<tbody>
<tr class="b-group"><th colspan="7" scope="rowgroup"><span>${esc(headingSaid(k))}</span> <b class="num">${c}</b></th></tr>
${rows.slice(0, drawn).map(row).join('')}
${drawn < rows.length ? `<tr class="b-more"><td></td><td colspan="6">The board draws ${drawn} of ${rows.length}. The screen draws all ${rows.length} in this one table and keeps its place.</td></tr>` : ''}
</tbody>`
}

const rail = () => `
<nav class="b-rail" aria-label="Aisles">
  <img class="b-mark" src="${MARKS}northside-marine.png" alt="Northside Marine">
  <p class="eyebrow">Aisles · ${AISLES.length}</p>
  <ul>
    ${AISLES.map((a) => {
      const on = a.id === AISLE
      return `<li${a.id === 'unsorted' ? ' class="b-rail-unsorted"' : ''}><a href="#" ${on ? 'aria-current="page" class="on"' : ''}>${ic(AISLE_GLYPH[a.id], { weight: on ? 'fill' : 'regular' })}<span>${esc(a.name)}</span><b class="num">${n(a.parts)}</b></a>
      ${on ? `<ul class="b-heads">${heads.map((h, i) => `<li><a href="#" ${i === 0 ? 'aria-current="true" class="on"' : ''}><span>${esc(headingSaid(h.k))}</span><b class="num">${h.c}</b></a></li>`).join('')}</ul>` : ''}</li>`
    }).join('')}
  </ul>
  <p class="b-rail-foot"><b class="num">${PICTURED}</b> of ${n(ON_SALE)} pictured</p>
</nav>`

const lowrance = find('lowrance')
const sg = find('SG002')

const body = `
<main class="b-page frame" id="main">
  <header class="b-head">
    <h1>Chandlery <span>${n(ON_SALE)} parts on sale</span></h1>
    <label class="find b-find">${ic('MagnifyingGlass', { size: 'md' })}<span class="sr">Find a part</span><input placeholder="A name, a code, a supplier or a heading"><kbd class="ui-kbd ui-kbd--quiet"><span class="ui-kbd-key">/</span></kbd></label>
  </header>
  <div class="b-body">
    ${rail()}
    <section class="b-ledger" aria-labelledby="b-title">
      <div class="b-tools">
        <div class="b-tools-row b-titlerow">
          <button class="ui-button b-aisle-btn" data-intent="secondary">${ic('Fan')}<span>${esc(aisle.name)}</span><b class="num">${parts.length}</b>${ic('CaretDown')}</button>
          <h2 id="b-title" class="b-title">${ic('Fan', { weight: 'duotone' })}${esc(aisle.name)} <span class="num">${parts.length} lines · ${heads.length} headings · ${aisle.pictured} pictured</span></h2>
          <label class="b-sort"><span>Sort</span><span class="b-select">File order${ic('CaretDown')}</span></label>
          <div class="ui-segmented-frame"><fieldset class="ui-segmented"><legend class="ui-segmented-legend">Pictures</legend>
            <label class="ui-segmented-option" data-checked><span class="ui-segmented-thumb"></span><input class="ui-segmented-input" type="radio" name="b-pic" checked><span class="ui-segmented-face">All</span></label>
            <label class="ui-segmented-option"><input class="ui-segmented-input" type="radio" name="b-pic"><span class="ui-segmented-face">With a picture</span></label>
            <label class="ui-segmented-option"><input class="ui-segmented-input" type="radio" name="b-pic"><span class="ui-segmented-face">Without</span></label>
          </fieldset></div>
          <button class="ui-button b-filter" data-intent="secondary" data-size="sm">${ic('Funnel')}Filter</button>
        </div>
        <div class="b-tools-row b-chips">
          <span class="ui-chip-frame"><button class="ui-chip" aria-pressed="true">Every supplier <span class="ui-chip-count">${parts.length}</span></button></span>
          ${makers.map((m) => `<span class="ui-chip-frame"><button class="ui-chip" aria-pressed="false">${esc(m.k || 'no supplier')} <span class="ui-chip-count">${m.c}</span></button></span>`).join('')}
          <span class="b-boat"><span class="ui-chip-frame"><button class="ui-chip" aria-pressed="false">${ic('Boat')}For a boat…</button></span></span>
        </div>
        <p class="b-twin said">${ic('ArrowsMerge')}<span><b>${esc(twins[0].code)}</b> and <b>${esc(twins[1].code)}</b> differ only in their capitals: ${twinHere[0].here} and ${twinHere[1].here} lines here, ${twins[0].lines} and ${twins[1].lines} in the file. One supplier? <a class="door" href="#">Make them one</a></span></p>
      </div>
      <div class="b-scroll">
      <table class="b-table">
        <caption class="sr">${esc(aisle.name)}, every line, in the price list’s order</caption>
        <thead><tr>
          <th scope="col" class="b-th"><span class="sr">Picture</span></th>
          <th scope="col"><button class="b-colsort" aria-sort="none">Part${ic('CaretUpDown')}</button></th>
          <th scope="col" class="b-code"><button class="b-colsort">Code${ic('CaretUpDown')}</button></th>
          <th scope="col" class="b-sup"><button class="b-colsort">Supplier${ic('CaretUpDown')}</button></th>
          <th scope="col" class="b-n"><button class="b-colsort">Supply${ic('CaretUpDown')}</button></th>
          <th scope="col" class="b-n"><button class="b-colsort">Fitted${ic('CaretUpDown')}</button></th>
          <th scope="col" class="b-go"><span class="sr">Its line</span></th>
        </tr></thead>
        ${heads.map(groupRows).join('')}
      </table>
      </div>
      <p class="said b-quote">A part is quoted on its own only where Northside lets it, and Parts &amp; Accessories is sold only with a boat today. <a class="door" href="#">Let it be quoted on its own ${ic('ArrowRight')}</a></p>
    </section>
  </div>
</main>`

/* SECOND STATE: find by a maker word, grouped by aisle (DigiKey's search) */
const found = () => {
  const by = new Map()
  for (const p of lowrance) by.set(p.aisle, [...(by.get(p.aisle) ?? []), p])
  return `
<div class="b-found">
  <label class="find">${ic('MagnifyingGlass', { size: 'md' })}<input value="lowrance" aria-label="Find a part"></label>
  <p><b>${lowrance.length}</b> lines answer <i>lowrance</i>: every one is under the heading LOWRANCE; ${lowrance.filter((p) => /lowrance/i.test(p.product)).length} name it in their own words. By aisle:</p>
  ${[...by]
    .map(
      ([
        a,
        ps,
      ]) => `<p class="b-found-aisle">${ic(AISLE_GLYPH[a])}<b>${esc(AISLES.find((x) => x.id === a).name)}</b> <span class="num">${ps.length}</span></p>
  <table class="b-table b-table-mini"><tbody>${ps.slice(0, 5).map(row).join('')}</tbody></table>`,
    )
    .join('')}
  <p class="said"><i>SG002</i> answers with ${sg.length} line, by its code: ${esc(sg[0].name)}. A code is found, never refused.</p>
</div>`
}

/* THIRD STATE: suppliers named by Northside, each proposal measured off the headings */
const props = makerProposals()
const naming = () => `
<div class="b-names">
  <p>No supplier is named yet: the file writes ${MAKERS - 1} supplier codes and words, and ${PARTS.filter((p) => !p.maker).length} lines carry none. Five codes have every one of their lines under one heading word that starts with the code’s own letters, so the screen proposes that word and Northside approves it.</p>
  <table class="b-table b-table-mini"><thead><tr><th>Code</th><th>Proposed name</th><th>Measured</th><th></th></tr></thead><tbody>
  ${props.map((p) => `<tr><td><span class="code">${esc(p.code)}</span></td><td><b>${esc(p.word)}</b></td><td>${p.of} of ${p.lines} lines sit under headings starting ${esc(p.word.toUpperCase())}</td><td><a class="door" href="#">Name it</a></td></tr>`).join('')}
  </tbody></table>
</div>`

const notes = `
<section class="notes" aria-label="About this board">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Board B · the chandlery redrawn</span><h2>The rail and the ledger</h2></div>
  <p><b>The screen’s one job:</b> find a part by what it is for, read its supply and fitted price, and act on it: quote it, picture it, or open its line.</p>
  <p><b>What this screen does that no other does:</b> it reads the whole parts list as one ledger that keeps its place, so the 447 lines of Propellers &amp; motor care are walked in one table, sorted by any column, under the file’s own ten headings, with no <i>Show the next</i>. The sheet (<code>/data/parts</code>) shows the file’s columns; this shows the parts a person sells, by aisle.</p>
  <div class="cols">
    <div>
      <h3>Order and grouping</h3>
      <ol class="dash">
        <li>— Find for the whole chandlery: a name, a code, a supplier or a heading.</li>
        <li>— The rail: Northside’s mark, the 19 aisles counted, the open aisle’s headings counted under it.</li>
        <li>— The ledger’s tools, which dock: the aisle and its counts, sort, <b>All | With a picture | Without</b>, supplier chips, the boat chip, and the one proposal about suppliers.</li>
        <li>— One table: a group row per heading, then a row per part: picture where held (no box where not), name, code, supplier, supply, fitted, and its line.</li>
      </ol>
    </div>
    <div>
      <h3>References new to this board</h3>
      <ul class="dash">
        <li>— DigiKey’s category table: a thumbnail cell only where a picture is held, the code and maker in the row, every column sortable, nine rows to a window. <code>docs/research/refs/choosing/round-2/live/digikey-toggle-table.png</code>; on a phone the stacked cell, <code>hand/digikey-toggle-390-scrolled.png</code>.</li>
        <li>— Blue Bottle Marine’s counted facet rail beside the grid: <i>Deck Hardware (316)</i>. <code>live/bluebottle-bla-grid-scrolled.png</code>.</li>
        <li>— Supporting: DigiKey’s search by a maker word, grouped by category. <code>live/digikey-search-maker-word.png</code>.</li>
      </ul>
    </div>
  </div>
  <div class="state"><span class="eyebrow">Second state · find by a maker word and by a code</span>${found()}</div>
  <div class="state"><span class="eyebrow">Third state · naming suppliers, in Data</span>${naming()}</div>
  <div class="cols">
    <div>
      <h3>The two prices</h3>
      <p>Supply and fitted are two sortable columns, so “the cheapest fitted” is one press. They differ on ${n(DIFFER)} of ${n(ON_SALE)} parts. ${FITTED_ONLY} parts read <i>fitted only</i> in the supply column and their figure in the fitted one; <i>Supply only</i> is said where the Install Type says so; ${NO_PRICE} with no price say so with the door to Review; ${ZERO_BOTH} carry $0 at both levels as the file writes them. TTF hours are a declared cost column and are never drawn.</p>
      <h3>The mark</h3>
      <p>Northside’s mark heads the rail, at every desk size, above the aisles it owns. On a phone the rail is a sheet and the mark heads the sheet. Maker marks are not used in the ledger: a row is read, not branded.</p>
    </div>
    <div>
      <h3>What a dealer can replace</h3>
      <p>The mark, the accent, the aisle names and what each gathers, the supplier names, the columns shown (a Northside setting: code and supplier can be hidden at the desk), and the pictures. With no pictures at all the thumbnail column is simply empty and the ledger reads the same.</p>
      <h3>Honest constraints</h3>
      <ul class="dash">
        <li>— Propellers &amp; motor care holds no pictured part, so its thumbnail column is empty as drawn. Sounders holds 161.</li>
        <li>— <i>Yamaha service itiems</i> is the file’s spelling; correcting it is Review’s.</li>
        <li>— The two <i>NB:</i> lines are notes in the price list and are drawn as notes, never as parts with a price.</li>
        <li>— Supplier codes stand until named. YAM and Yam are proposed as one, never merged without Northside.</li>
        <li>— Cost, margin and hours appear on no surface of this board.</li>
      </ul>
    </div>
  </div>
  <div class="cols">
    <div>
      <h3>Type, at 1:1</h3>
      <div class="specimen">
        <div><span>title · 2xl/800</span><span style="font-size:var(--text-2xl);font-weight:800">Propellers &amp; motor care</span></div>
        <div><span>group · sm/700 caps</span><span class="eyebrow" style="color:var(--color-ink)">Propellers – Yamaha 260</span></div>
        <div><span>row · sm/600</span><span style="font-size:var(--text-sm);font-weight:600">Propeller · Aluminium 6 1/2" BA Spline</span></div>
        <div><span>code · mono xs</span><span class="code">6E0-45949-00</span></div>
        <div><span>figure · sm/700</span><span class="num" style="font-weight:700;font-size:var(--text-sm)">$104 $129</span></div>
      </div>
      <p>Rows are 40 px at a desk: twice DigiKey’s nine to a window, because a part needs one line where a component needs five.</p>
    </div>
    <div>
      <h3>Motion</h3>
      <p>Nothing animates in the ledger. Pressing an aisle in the rail replaces the table and starts it at its first row; pressing a heading scrolls the table to its group row, and the group row docks under the tools while its rows pass. A column head’s sort is instant. On a phone the rail rises as a sheet from the foot over 240 ms, and the window behind it does not move.</p>
      <p><b>Reduced motion:</b> the sheet appears without rising; scrolling to a heading jumps.</p>
      <p><b>Keyboard:</b> <kbd>/</kbd> finds; the rail is a list of links in Tab order; in the table, Tab reaches each column’s sort and each row’s Line; Enter on a part’s name opens its row’s acts (picture, quote).</p>
    </div>
  </div>
  <div class="cols">
    <div>
      <h3>How it reflows</h3>
      <table><tbody>
        <tr><td>1920 × 1080</td><td>Rail 18rem, ledger the rest of a 1,720 px measure; 22 rows in the window. The headings stay open under the aisle.</td></tr>
        <tr><td>1440 × 900 · 1280 × 800</td><td>As drawn: rail 16rem, the ledger’s seven columns; 13 rows in the window at 1440, 10 at 1280.</td></tr>
        <tr><td>834 × 1112</td><td>The rail folds to the aisle button over the ledger. Code and supplier move under the name; four columns remain: picture, part, supply, fitted, with Line as an icon.</td></tr>
        <tr><td>844 × 390</td><td>As 834, with the bar at the foot and the tools on one line (aisle button, sort, filter), so 5 rows show.</td></tr>
        <tr><td>390 × 844</td><td>As drawn: the aisle button, then sort and Filter (suppliers, boat, pictures). Each row is the stacked cell: name, code · supplier, then the two prices with their levels in words. Never a sideways scroll.</td></tr>
      </tbody></table>
    </div>
    ${jobsTable([
      [
        'J1 show an aisle',
        'Pressing an aisle in the rail replaces the table at its first row; the tools dock with the aisle’s name.',
      ],
      [
        'J2 fitted price',
        'Supply and fitted columns on every row; fitted only, supply only and no price said.',
      ],
      [
        'J3 maker word',
        'Find reads supplier and heading: <i>lowrance</i> 144 of 144, grouped by aisle (second state).',
      ],
      ['J4 code', 'The code is a column and is found: <i>SG002</i> answers.'],
      ['J5 picture large', 'A row’s thumbnail opens the gallery.'],
      ['J6 his boat', 'The boat chip; paired parts lead, said <i>Made for …</i>.'],
      [
        'J7 quote a part',
        'One sentence under the table with the switch; the row’s acts carry it once on.',
      ],
      [
        'J8 own picture',
        'The row’s acts: <i>Add Northside’s own picture</i>; a refusal is said in the row and read aloud.',
      ],
      [
        'J9 no-picture worklist',
        '<i>Without</i> lists the parts with no picture, in any aisle, sortable.',
      ],
      ['J10 open its line', 'Every row’s <i>Line</i>; no price → Review.'],
      [
        'J11 place the unsorted',
        'Not sorted yet stands last in the rail; its headings are placed in Data’s aisle setting.',
      ],
      [
        'J12 narrow by maker',
        'Supplier chips; YAM/Yam proposed as one; names proposed from headings (third state).',
      ],
      ['J13 447 propellers', 'One table, ten group rows, sort by any column; it keeps its place.'],
      ['J14 no file', 'Unchanged: the sentence and the door.'],
      [
        'J15 wrong address',
        'A wrong aisle: the rail stays and the table says “There is no aisle called ‘nope’.”',
      ],
    ])}
  </div>
</div>
</section>`

const css = `
.b-head { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; padding-block: 14px 18px; }
.b-head h1 { font-size: var(--text-3xl); line-height: 1.1; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; }
.b-head h1 span { font-size: var(--text-base); font-weight: 600; color: var(--color-ink-2); }
.b-find { flex: 1 1 360px; max-inline-size: 640px; margin-inline-start: auto; }
.b-body { display: grid; grid-template-columns: 16rem minmax(0, 1fr); gap: 28px; align-items: start; }

/* THE RAIL */
.b-rail { position: sticky; inset-block-start: 64px; max-block-size: calc(100vh - 80px); overflow: auto; display: grid; gap: 8px; padding: 14px 10px 14px 12px;
  border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
.b-mark { display: block; block-size: 30px; inline-size: auto; max-inline-size: 140px; object-fit: contain; margin: 2px 4px 6px; }
.b-rail .eyebrow { padding-inline: 6px; }
.b-rail ul { display: grid; gap: 1px; }
.b-rail a { display: flex; align-items: center; gap: 8px; min-block-size: 32px; padding: 4px 6px; border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-2); }
.b-rail a span { flex: 1; min-inline-size: 0; }
.b-rail a b { font-weight: 600; color: var(--color-ink-3); }
.b-rail a.on { background: var(--color-chosen-wash); color: var(--color-ink); box-shadow: inset 0 0 0 1px var(--color-blue-300); }
.b-rail a.on b { color: var(--color-ink); }
.b-rail a .ui-icon { color: var(--color-ink-file); flex: none; }
.b-heads { padding: 2px 0 6px 26px; }
.b-heads a { min-block-size: 28px; font-weight: 500; font-size: var(--text-sm); }
.b-heads a.on { background: none; box-shadow: inset 2px 0 0 var(--color-accent); border-radius: 0; color: var(--color-ink); font-weight: 700; }
.b-rail-unsorted { margin-block-start: 6px; padding-block-start: 6px; border-block-start: 1px solid var(--color-rule); }
.b-rail-foot { font-size: var(--text-xs); color: var(--color-ink-3); padding-inline: 6px; }

/* THE TOOLS: dock under the bar */
.b-tools { position: sticky; inset-block-start: 56px; z-index: 5; display: grid; gap: 10px; padding-block: 10px 12px; background: var(--color-ground); border-block-end: 1px solid var(--color-rule-strong); }
.b-tools-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; min-inline-size: 0; }
.b-title { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; font-size: var(--text-2xl); font-weight: 800; flex: 1 1 360px; min-inline-size: 0; }
.b-title .ui-icon { color: var(--color-ink-file); inline-size: 26px; block-size: 26px; }
.b-title .num { font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-2); }
.b-sort { display: inline-flex; align-items: center; gap: 8px; font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-2); }
.b-select { display: inline-flex; align-items: center; gap: 8px; min-block-size: 36px; padding-inline: 12px 10px; border-radius: var(--radius-field); background: var(--color-plate);
  box-shadow: inset 0 0 0 1px var(--color-control-edge); color: var(--color-ink); }
.b-aisle-btn, .b-filter { display: none; }
.b-boat { margin-inline-start: auto; }
.b-twin { display: flex; gap: 8px; align-items: flex-start; margin: 0; }
.b-twin .ui-icon { flex: none; margin-block-start: 2px; color: var(--color-ink-file); }

/* THE TABLE */
.b-table { inline-size: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.b-table thead th { position: sticky; inset-block-start: 0; text-align: start; font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); padding: 8px 8px; border-block-end: 2px solid var(--color-ink); background: var(--color-ground); }
.b-colsort { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; letter-spacing: 0.04em; text-transform: uppercase; }
.b-colsort:focus-visible { box-shadow: var(--shadow-focus); border-radius: var(--radius-xs); }
.b-table td, .b-table tbody th { padding: 5px 8px; border-block-end: 1px solid var(--color-rule); vertical-align: middle; text-align: start; font-weight: 400; }
.b-table tbody tr:not(.b-group):hover { background: var(--color-plate); }
.b-th { inline-size: 44px; padding-inline: 0 4px !important; }
.b-th img { display: block; inline-size: 40px; block-size: 40px; border-radius: var(--radius-sm); background: var(--color-white); }
.b-part a { font-weight: 600; color: var(--color-ink); }
.b-part a:hover { text-decoration: underline; }
.b-meta { display: none; }
.b-code { inline-size: 10rem; } .b-sup { inline-size: 7rem; color: var(--color-ink-2); }
.b-n { inline-size: 6.5rem; text-align: end !important; white-space: nowrap; }
.b-n .pc { justify-items: end; }
.b-n .pc b { font-size: var(--text-sm); }
.b-n .pc small { display: none; }
.b-go { inline-size: 5rem; text-align: end !important; }
.b-table .b-group th { padding: 14px 8px 6px !important; text-align: start; font-size: var(--text-sm); font-weight: 800; color: var(--color-ink); border-block-end: 1px solid var(--color-ink) !important;
  background: var(--color-ground); position: sticky; inset-block-start: 34px; }
.b-group b { color: var(--color-ink-3); margin-inline-start: 6px; }
.b-note td { font-style: italic; color: var(--color-ink-2); }
.b-note-word { font-style: normal; font-weight: 700; font-size: var(--text-xs); color: var(--color-ink-3); margin-inline-end: 6px; }
.b-more td { font-size: var(--text-xs); color: var(--color-ink-3); padding-block: 10px !important; }
.b-quote { margin-block-start: 14px; }
.b-table-mini { margin-block: 6px 14px; }
.b-found { display: grid; gap: 10px; }
.b-found .find { max-inline-size: 520px; }
.b-found-aisle { display: flex; align-items: center; gap: 8px; color: var(--color-ink); }
.b-names { display: grid; gap: 10px; }

/* REFLOW */
@media (min-width: 1600px) { .b-body { grid-template-columns: 18rem minmax(0, 1fr); } }
@media (max-width: 1099px) {
  .b-body { grid-template-columns: minmax(0, 1fr); }
  .b-rail { display: none; }
  .b-aisle-btn { display: inline-flex; }
  .b-aisle-btn b { color: var(--color-ink-2); }
  .b-title { display: none; }
  .b-code, .b-sup { inline-size: 0; padding: 0 !important; font-size: 0; }
  .b-code > *, .b-sup > * { display: none; }
  .b-meta { display: block; font-size: var(--text-xs); color: var(--color-ink-2); font-weight: 400; }
  .b-go span { display: none; }
  .b-go { inline-size: 3rem; }
  .b-group th { inset-block-start: 34px; }
}
@media (max-width: 760px), (max-height: 480px) {
  .b-tools { inset-block-start: 0; }
  .b-chips, .b-twin { display: none; }
  .b-filter { display: inline-flex; }
  .b-tools .ui-segmented-frame { display: none; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .b-head { padding-block: 4px 8px; } .b-head h1 { font-size: var(--text-2xl); }
  .b-tools-row { flex-wrap: nowrap; }
}
@media (max-width: 599px) {
  .b-head h1 { font-size: var(--text-2xl); }
  .b-find { flex-basis: 100%; }
  .b-find .ui-kbd { display: none; }
  .b-aisle-btn { flex: 1 1 100%; justify-content: flex-start; }
  .b-aisle-btn span { flex: 1; text-align: start; }
  .b-table thead { display: none; }
  .b-table, .b-table tbody { display: block; }
  .b-table tr:not(.b-group):not(.b-more):not(.b-note) { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; grid-template-areas: 'th part part go' 'th sup fit go'; column-gap: 10px; padding-block: 8px; border-block-end: 1px solid var(--color-rule); }
  .b-table tr > * { border: 0 !important; padding: 0 !important; }
  .b-th { grid-area: th; inline-size: auto; } .b-th:empty { display: none; }
  .b-part { grid-area: part; }
  .b-table tr > td.b-n:nth-of-type(4) { grid-area: sup; text-align: start !important; }
  .b-table tr > td.b-n:nth-of-type(5) { grid-area: fit; }
  .b-table tr > td.b-n[colspan] { grid-area: sup / sup / fit / fit; text-align: start !important; }
  .b-n { inline-size: auto; padding-block-start: 4px !important; }
  .b-n .pc { justify-items: start; grid-auto-flow: column; gap: 4px; align-items: baseline; }
  .b-n .pc small { display: inline; }
  .b-go { grid-area: go; align-self: center; }
  .b-group, .b-more, .b-note { display: block; }
  .b-group th { display: block; inset-block-start: 0; padding: 14px 0 6px !important; }
  .b-more td, .b-note td { display: block; padding: 8px 0 !important; }
  .b-more td:empty, .b-note td:empty { display: none; }
}
`

export const html = page({ title: 'Chandlery · B', id: 'b', css, body, notes })
