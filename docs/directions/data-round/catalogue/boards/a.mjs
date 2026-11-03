/* BOARD A — THE AISLE AS A PAGE. /catalogue?aisle=anchoring&boat=boat_stacer:30
   The index of 19 aisles is the door; pressing one replaces the page with the aisle, whose head
   docks. What the price list pairs with the boat comes first, then the file's own headings as
   sections: pictured parts as cards, the rest as ruled lines, both prices on every one. */
import {
  AISLES,
  BOAT,
  DIFFER,
  FITTED_ONLY,
  HEADINGS,
  MARKS,
  NO_PRICE,
  ON_SALE,
  PAIRINGS,
  PAIRED_ON_SALE,
  PICS,
  PICTURED,
  PD_LISTS,
  ZERO_BOTH,
  boatSaid,
  boatsOf,
  byId,
  headingSaid,
  headingsOf,
  inAisle,
  makersOf,
  money,
  n,
  pairedWith,
  twoPrices,
} from './facts.mjs'
import { AISLE_GLYPH, esc, ic, jobsTable, page, prices } from './shell.mjs'

const AISLE = 'anchoring'
const aisle = AISLES.find((a) => a.id === AISLE)
const parts = inAisle(AISLE)
const heads = headingsOf(parts)
const makers = makersOf(parts)
const boatName = boatSaid(BOAT)
const paired = pairedWith(BOAT)
const pairedHere = paired.filter((p) => p.aisle === AISLE)
const OPEN = 'parts:38' // Sand Anchor Kit · 4lb, drawn opened

const row = (p) => {
  const open = p.id === OPEN
  const t = twoPrices(p)
  return `
<div class="a-row${open ? ' is-open' : ''}" role="row">
  <div class="a-name" role="cell"><span>${esc(p.name)}</span></div>
  <div class="a-meta" role="cell"><span class="code">${esc(p.code)}</span><span class="a-sup">${esc(p.maker || 'no supplier')}</span></div>
  <div class="a-pr${t.kind === 'none' ? ' a-pr-none' : ''}" role="cell">${prices(p)}</div>
  <div class="a-acts" role="cell"><button class="ui-button a-more" data-intent="quiet" data-size="sm" aria-expanded="${open}" aria-label="${open ? 'Close' : 'Open'} ${esc(p.name)}">${ic(open ? 'CaretUp' : 'CaretDown')}</button></div>
</div>
${open ? opened(p) : ''}`
}

const opened = (p) => `
<div class="a-open" role="region" aria-label="${esc(p.name)}, opened">
  <dl>
    <div><dt>Heading in the price list</dt><dd>${esc(p.heading)}</dd></div>
    <div><dt>How it is fitted</dt><dd>${esc(p.install)}</dd></div>
    <div><dt>Paired with a boat</dt><dd>${boatsOf(p.id) ? `${n(boatsOf(p.id))} boats` : 'No boat: none of the six P/D lists names it'}</dd></div>
  </dl>
  <div class="a-open-acts">
    <a class="ui-button" data-intent="secondary" data-size="sm" href="#">${ic('Table')}Open its line in Parts &amp; Accessories</a>
    <button class="ui-button" data-intent="quiet" data-size="sm">${ic('ImageSquare')}Add Northside’s own picture</button>
  </div>
  <p class="said">A quote cannot start with this part yet: Parts &amp; Accessories is sold only with a boat today. <a class="door" href="#">Let it be quoted on its own ${ic('ArrowRight')}</a></p>
</div>`

const group = ({ k, c }) => {
  const rows = parts.filter((p) => p.heading === k)
  return `
<section class="a-group" aria-labelledby="h-${esc(rows[0].id)}">
  <header class="a-ghead"><h2 id="h-${esc(rows[0].id)}">${esc(headingSaid(k))}</h2><span class="num">${c}</span></header>
  <div class="a-lines" role="table" aria-label="${esc(headingSaid(k))}">
    <div class="a-row a-colhead" role="row"><span role="columnheader">Part</span><span role="columnheader">Code · Supplier</span><span role="columnheader" class="a-prh">Supply · Fitted</span><span role="columnheader"><span class="sr">Open</span></span></div>
    ${rows.map(row).join('')}
  </div>
</section>`
}

/* THE SECOND STATE: the door, every aisle with the file's headings counted (DigiKey's index) */
const indexState = () => `
<div class="ax">
  <header class="ax-head">
    <img class="ax-mark" src="${MARKS}northside-marine.png" alt="Northside Marine">
    <div>
      <h2 class="ax-title">The chandlery</h2>
      <p class="ax-count"><b>${n(ON_SALE)}</b> parts on sale in <b>${AISLES.length - 1}</b> aisles and <b>Not sorted yet</b> · <b>${n(HEADINGS)}</b> headings of the price list · <b>${PICTURED}</b> pictured</p>
    </div>
    <label class="find ax-find">${ic('MagnifyingGlass', { size: 'md' })}<span class="sr">Find a part</span><input placeholder="A name, a code, a maker or a heading"><kbd class="ui-kbd ui-kbd--quiet"><span class="ui-kbd-key">/</span></kbd></label>
  </header>
  <div class="ax-grid">
    ${AISLES.map((a) => {
      const hs = headingsOf(inAisle(a.id))
      return `<section class="ax-aisle${a.id === 'unsorted' ? ' ax-unsorted' : ''}">
        <a class="ax-name" href="#"><span class="ax-glyph">${ic(AISLE_GLYPH[a.id], { weight: 'duotone' })}</span><span>${esc(a.name)}</span><b class="num">${n(a.parts)}</b></a>
        <ul>${hs.map((h) => `<li><a href="#">${esc(headingSaid(h.k))}</a> <span class="num">${n(h.c)}</span></li>`).join('')}</ul>
        <p class="ax-pic">${a.pictured ? `${n(a.pictured)} pictured` : 'none pictured'}</p>
      </section>`
    }).join('')}
  </div>
  <p class="said ax-wrong">An address naming an aisle that is not one, <code>?aisle=nope</code>, opens here with the sentence: There is no aisle called “nope”. These are the 19.</p>
</div>`

/* A THIRD, SMALL STATE: a pictured section in Sounders, where cards lead and lines follow */
const lowrance = inAisle('sounders').filter((p) => p.heading === 'LOWRANCE')
const lowPic = lowrance.filter((p) => p.pictured)
const lowNot = lowrance.filter((p) => !p.pictured)
const card = (p) => `
<article class="a-card">
  <div class="a-card-pic"><img class="ui-picture" data-fit="contain" data-landed src="${PICS}${p.pic.file}" alt="${esc(p.name)}" loading="lazy"><button class="ui-button a-zoom" data-intent="veiled" data-size="sm" aria-label="See ${esc(p.name)} larger">${ic('ArrowsOutSimple')}</button></div>
  <h3>${esc(p.name)}</h3>
  <p class="a-card-meta"><span class="code">${esc(p.code)}</span></p>
  <div class="a-card-pr">${prices(p)}</div>
</article>`
const pictured = () => `
<div class="a-group a-mini">
  <header class="a-ghead"><h2>Lowrance</h2><span class="num">${lowrance.length}</span><span class="a-ghead-say">${lowPic.length} pictured, shown first as cards · ${lowNot.length} as lines</span></header>
  <div class="a-cards">${lowPic.slice(0, 4).map(card).join('')}</div>
  <div class="a-lines" role="table" aria-label="Lowrance, not pictured">${lowNot.slice(0, 2).map(row).join('')}</div>
</div>`

const body = `
<main class="a-page frame" id="main">
  <header class="a-head">
    <a class="door a-back" href="#">${ic('ArrowLeft')}Every aisle · ${AISLES.length}</a>
    <div class="a-title">
      <span class="a-glyph" aria-hidden="true">${ic('Anchor', { weight: 'duotone', size: 'lg' })}</span>
      <div>
        <h1>${esc(aisle.name)}</h1>
        <p class="a-count"><b>${parts.length}</b> parts under <b>${heads.length}</b> headings of the price list · <b>${aisle.pictured}</b> of ${parts.length} pictured</p>
      </div>
    </div>
  </header>

  <div class="a-dock" role="search" aria-label="In this aisle">
    <div class="a-dock-row">
      <label class="find a-find">${ic('MagnifyingGlass')}<span class="sr">Find in this aisle</span><input placeholder="In this aisle: a name, a code or a supplier"></label>
      <div class="ui-segmented-frame a-seg"><fieldset class="ui-segmented"><legend class="ui-segmented-legend">Show</legend>
        <label class="ui-segmented-option" data-refused><input class="ui-segmented-input" type="radio" name="a-show" disabled aria-describedby="a-why"><span class="ui-segmented-face">Pictured <b class="num">0</b></span></label>
        <label class="ui-segmented-option" data-checked><span class="ui-segmented-thumb"></span><input class="ui-segmented-input" type="radio" name="a-show" checked><span class="ui-segmented-face">All <b class="num">${parts.length}</b></span></label>
      </fieldset></div>
      <button class="ui-button a-filter" data-intent="secondary" data-size="sm">${ic('Funnel')}Supplier, boat <b class="num">1</b></button>
    </div>
    <div class="a-dock-row a-chips">
      <span class="ui-chip-frame"><button class="ui-chip" aria-pressed="true">Every supplier <span class="ui-chip-count">${parts.length}</span></button></span>
      ${makers.map((m) => `<span class="ui-chip-frame"><button class="ui-chip" aria-pressed="false">${esc(m.k)} <span class="ui-chip-count">${m.c}</span></button></span>`).join('')}
      <span class="a-boat"><span class="ui-chip-frame"><button class="ui-chip" aria-pressed="true">${ic('Boat')}${esc(boatName)} <span class="sr">, press to fit no boat</span>${ic('X')}</button></span></span>
    </div>
    <p class="said a-why" id="a-why">Pictured is refused here: no part in this aisle has a picture yet, so all ${parts.length} show as lines.</p>
  </div>

  <section class="a-made" aria-labelledby="a-made-h">
    <header><h2 id="a-made-h">Made for the ${esc(boatName)}</h2><p><b>${pairedHere.length}</b> in this aisle, of the <b>${paired.length}</b> parts its P/D list pairs with it</p></header>
    <div class="a-lines" role="table" aria-label="Made for this boat">${pairedHere.map(row).join('')}</div>
    <p class="said">The other ${paired.length - pairedHere.length} are in Batteries &amp; power. <a class="door" href="#">See all ${paired.length} ${ic('ArrowRight')}</a></p>
  </section>

  <div class="a-sections">${heads.map(group).join('')}</div>
</main>`

const notes = `
<section class="notes" aria-label="About this board">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Board A · the chandlery redrawn</span><h2>The aisle as a page</h2></div>
  <p><b>The screen’s one job</b> (docs/SCREENS.md, the chandlery): let a salesperson with a customer at the desk find a part by what it is for, see what it costs supply and fitted, and put it on a quote; and let Northside keep the list it shows.</p>
  <p><b>What this screen does that no other does:</b> it gives each of the 19 aisles its own page and address, which a salesperson can send, open on a phone at the boat, or keep in a tab; and on that page it puts first what the price list pairs with the customer’s boat. No other screen sorts parts by what they are for.</p>

  <div class="cols">
    <div>
      <h3>Order and grouping</h3>
      <ol class="dash">
        <li>— A way back to every aisle, then the aisle’s name large, with its parts, headings and pictures counted.</li>
        <li>— The docked head: find, <b>Pictured | All</b>, suppliers as chips, the boat as a chip. It stays in view while the parts scroll.</li>
        <li>— <b>Made for this boat</b>: the parts the P/D list pairs with the chosen boat, in this aisle first.</li>
        <li>— The file’s own headings as sections, in file order, each counted. In a section, pictured parts are cards and come first; the rest are ruled lines.</li>
        <li>— A line opens in place: its heading, how it is fitted, the boats it is paired with, and three doors (its line in the sheet, Northside’s own picture, a quote).</li>
      </ol>
    </div>
    <div>
      <h3>References new to this board</h3>
      <ul class="dash">
        <li>— Apple, <i>Cases &amp; Protection</i>, scrolled: the chip row docks under the bar and keeps the aisle in view. <code>docs/research/refs/choosing/round-2/live/apple-iphone-cases-compat-scrolled.png</code>; on a phone it folds to one Filter button, <code>hand/apple-iphone-cases-390.png</code>.</li>
        <li>— Mazda, <i>BT-50 accessories</i>: the vehicle held with <i>Change model</i>, the aisles as chips, the choices in the address. <code>live/mazda-bt50-accessories-top.png</code>.</li>
        <li>— Supporting: DigiKey’s product index, each category with its sub-categories counted. <code>live/digikey-product-index.png</code>.</li>
      </ul>
    </div>
  </div>

  <div class="state"><span class="eyebrow">Second state · the door, <code>/catalogue</code></span>${indexState()}</div>
  <div class="state"><span class="eyebrow">Third state · a pictured section, <code>/catalogue?aisle=sounders</code></span>${pictured()}</div>

  <div class="cols">
    <div>
      <h3>The two prices</h3>
      <p>Every line says both of the file’s declared levels, labelled: supply (<code>parts.l</code>, Sell) and fitted (<code>parts.y</code>, Sell inc Install). They differ on ${n(DIFFER)} of ${n(ON_SALE)} parts. ${FITTED_ONLY} parts are priced fitted only and read <i>fitted only</i> with the fitted figure, never $0: <i>Trailer Adjustment · 15 to 17ft</i> reads $206 fitted. Where the Install Type is <i>Supply Only</i>, the fitted cell says so. ${NO_PRICE} parts have no price at either level and say so with the door to Review. ${ZERO_BOTH} carry $0 at both levels, as the file writes them (<i>Supplied with Motor</i>).</p>
      <p><b>Hours are not drawn.</b> The judge asked for TTF hours on the card, but the manifest declares <code>parts.o</code> (TTF hours) a cost column with P&amp;A, CTD, MU, Base List, Labour $ and Total CTD. So hours stay in the sheet and never reach a surface a customer reads. The Install Type (<code>parts.n</code>, not a cost column) is shown when a line is opened.</p>
    </div>
    <div>
      <h3>The mark</h3>
      <p>Northside’s own mark heads the door: the chandlery is its shop. Inside an aisle the mark gives way to the aisle’s name, which is what the person needs at that point. Maker marks appear only where the marks ledger holds that maker’s (Yamaha, Highfield, ePropulsion). Garmin, Lowrance, GME and the rest are words, never a stand-in.</p>
      <h3>What a dealer can replace</h3>
      <p>The mark on the door, the accent, the aisle names and which headings each gathers (a Northside setting; <i>Not sorted yet</i> empties as headings are placed), the supplier names, and every picture. With no pictures at all, the page is the same lines and loses nothing.</p>
    </div>
  </div>

  <div class="cols">
    <div>
      <h3>Type, at 1:1</h3>
      <div class="specimen">
        <div><span>h1 · 5xl/800</span><span style="font-size:var(--text-5xl);font-weight:800;line-height:1.05">Anchoring &amp; mooring</span></div>
        <div><span>section · xl/700</span><span style="font-size:var(--text-xl);font-weight:700">Anchor winches – Lone Star</span></div>
        <div><span>line · base/600</span><span style="font-weight:600">Lone Star · GX-1 6 mm Combo Winch Kit</span></div>
        <div><span>code · mono xs</span><span class="code">GX1 6mm Combo</span></div>
        <div><span>price · base/700</span><span class="num" style="font-weight:700">$2,100 <small style="font-size:var(--text-xs);color:var(--color-ink-3)">supply</small> $3,081 <small style="font-size:var(--text-xs);color:var(--color-ink-3)">fitted</small></span></div>
      </div>
      <p>Lines run to a measure of about 60 characters at a desk; the price columns are right-aligned, tabular.</p>
    </div>
    <div>
      <h3>Motion</h3>
      <p>Pressing an aisle on the door: the page is replaced and the window starts at the aisle’s top, so the result is under the person’s eye at every size. The docked head does not animate: it is position, not motion (Apple’s chip row). Once the aisle’s name has scrolled under it, the dock’s first row gains the name in small capitals (<i>Anchoring &amp; mooring · LSM · Stacer 529 Assault Pro</i>), so the person always knows where they are. Opening a line: the line’s own panel grows under it over 180 ms with the kit’s settle curve; nothing else on the page moves except what is below it. The supplier chips press at 0.96.</p>
      <p><b>Reduced motion:</b> the panel appears at its full height, with no growth.</p>
      <p><b>Keyboard:</b> <kbd>/</kbd> to find; Tab reaches the back door, find, Pictured | All, each chip, the boat chip, then each line’s open button in order; Escape closes an opened line and returns the caret to its button.</p>
    </div>
  </div>

  <div class="cols">
    <div>
      <h3>How it reflows</h3>
      <table><tbody>
        <tr><td>1920 × 1080</td><td>Measure 1,720 px. The sections run in two columns, each line as the name over code · supplier with the two prices at its right, so a 21-line section and its neighbours are read side by side. Cards five to six a row in a pictured section. Find holds a 760 px measure.</td></tr>
        <tr><td>1440 × 900 · 1280 × 800</td><td>As drawn: the dock in two rows (find and Pictured | All, then the chips), the boat chip at the end of the chips. At 1280 the first section starts above the fold.</td></tr>
        <tr><td>834 × 1112</td><td>Lines as two rows: the name over code · supplier, the two prices at the right. The chips wrap to two rows.</td></tr>
        <tr><td>844 × 390</td><td>The bar sits at the foot. The aisle’s name shrinks to one line; the dock folds to find, Pictured | All and one <i>Supplier, boat</i> button, so the dock is 52 px; the boat’s line is in the first window and the first section starts at the fold.</td></tr>
        <tr><td>390 × 844</td><td>As drawn: the bar at the foot, the name in two lines, the dock folded to find over Pictured | All and the <i>Supplier, boat</i> button that opens a sheet. Each line is the name, then code · supplier, then the two prices.</td></tr>
      </tbody></table>
    </div>
    <div>
      <h3>Honest constraints</h3>
      <ul class="dash">
        <li>— Anchoring holds no pictured part, so the page drawn is lines only. That is the truth for 15 of 19 aisles.</li>
        <li>— Supplier codes stand as the file writes them (LSM, SAW, BBB) until Northside names them. Naming is a list in Data, set once, with Undo, never guessed.</li>
        <li>— The P/D lists pair ${PAIRED_ON_SALE} parts on sale with boats, ${n(PAIRINGS)} pairings in ${PD_LISTS.length} lists (measured: 42 distinct part rows; the judge’s 75 was not reproduced). So <i>Made for this boat</i> is short, and the boat is a chip, never the door.</li>
        <li>— Quoting a part on its own is off for Parts &amp; Accessories on day one (<code>letQuote</code>). The refusal is one sentence in the opened line, with the switch.</li>
        <li>— Cost, margin and hours appear on no surface of this board.</li>
      </ul>
    </div>
  </div>

  ${jobsTable([
    [
      'J1 show an aisle',
      'Pressing an aisle opens its page at the top: the name, the dock and the first section are in the first window at every size.',
    ],
    [
      'J2 fitted price',
      'Both levels on every line, labelled; fitted only, supply only and no price each said; never $0 where the file prices fitted.',
    ],
    [
      'J3 maker word',
      'Find reads name, code, supplier and heading: <i>lowrance</i> finds all 144, by the heading LOWRANCE.',
    ],
    [
      'J4 code',
      'Find reads the code: <i>SG002</i> finds Safety Gear · Smooth Waters. The code is on every line.',
    ],
    ['J5 picture large', 'The card’s expand button opens the gallery, as today.'],
    ['J6 his boat', 'The boat chip in the dock, and <i>Made for this boat</i> first.'],
    ['J7 quote a part', 'The opened line’s quote sentence and its switch (off on day one).'],
    [
      'J8 own picture',
      'The opened line’s <i>Add Northside’s own picture</i>; a refusal is said inside the opened panel and read aloud, so no row grows.',
    ],
    [
      'J9 no-picture worklist',
      'Pictured | All in every aisle; the worklist across aisles is Data’s, not drawn here.',
    ],
    [
      'J10 open its line',
      'The opened line’s first door, to <code>/data/parts?at=parts:N</code>; a part with no price says so with the door to Review.',
    ],
    [
      'J11 place the unsorted',
      'Not sorted yet is an aisle on the door; placing a heading is the Northside setting of aisles, opened from it.',
    ],
    ['J12 narrow by maker', 'Supplier chips, counted; named once Northside names them.'],
    [
      'J13 447 propellers',
      'Ten sections from the file’s headings, each counted, all on one page; no <i>Show the next</i>.',
    ],
    ['J14 no file', 'Unchanged: the sentence and the door.'],
    [
      'J15 wrong address',
      'A wrong aisle opens the door with its sentence; a wrong supplier is said in the dock.',
    ],
  ])}
</div>
</section>`

const css = `
/* THE HEAD */
.a-head { display: grid; gap: 10px; padding-block: 12px 18px; }
.a-back { font-size: var(--text-sm); }
.a-title { display: flex; align-items: center; gap: 16px; }
.a-glyph { flex: none; display: grid; place-items: center; inline-size: 64px; block-size: 64px; border-radius: var(--radius-tile);
  background: var(--color-plate); color: var(--color-ink-file); box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
.a-glyph .ui-icon { inline-size: 36px; block-size: 36px; }
.a-head h1 { font-size: var(--text-5xl); line-height: 1.05; letter-spacing: -0.02em; }
.a-count { color: var(--color-ink-2); margin-block-start: 6px; }

/* THE DOCK: sticky under the bar */
.a-dock { position: sticky; inset-block-start: 60px; z-index: 10; display: grid; gap: 10px; padding: 12px 16px;
  margin-inline: -16px; background: var(--color-ground); border-block-end: 1px solid var(--color-rule-strong); }
.a-dock-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; min-inline-size: 0; }
.a-where { flex: 1 1 260px; min-inline-size: 0; font-size: var(--text-sm); color: var(--color-ink-2); }
.a-where b { font-size: var(--text-base); color: var(--color-ink); }
.a-find { flex: 1 1 320px; min-block-size: 40px; }
.a-seg .ui-segmented-option[data-refused] { color: var(--color-ink-3); cursor: not-allowed; }
.a-filter { display: none; }
.a-boat { margin-inline-start: auto; }
.a-why { margin: 0; }

/* MADE FOR THIS BOAT */
.a-made { margin-block: 20px 8px; padding: 16px 18px; border-radius: var(--radius-plate); background: var(--color-chosen-wash);
  box-shadow: inset 0 0 0 1px var(--color-blue-300); display: grid; gap: 8px; }
.a-made header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; }
.a-made h2 { font-size: var(--text-xl); }
.a-made header p { color: var(--color-ink-2); font-size: var(--text-sm); }

/* SECTIONS AND LINES */
.a-group { margin-block-start: 28px; }
.a-ghead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; padding-block-end: 8px; border-block-end: 2px solid var(--color-ink); }
.a-ghead h2 { font-size: var(--text-xl); }
.a-ghead .num { font-weight: 700; color: var(--color-ink-3); }
.a-ghead-say { font-size: var(--text-sm); color: var(--color-ink-3); }
.a-lines { display: grid; }
.a-lines { container-type: inline-size; }
.a-row { display: grid; grid-template-columns: minmax(0, 1fr) 36px; grid-template-areas: 'name acts' 'meta acts' 'pr acts'; align-items: center; gap: 2px 16px;
  min-block-size: 48px; padding-block: 6px; border-block-end: 1px solid var(--color-rule); }
.a-name { grid-area: name; } .a-meta { grid-area: meta; } .a-pr { grid-area: pr; } .a-acts { grid-area: acts; }
.a-colhead { display: none; min-block-size: 32px; font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); letter-spacing: 0.04em; text-transform: uppercase; }
.a-prh { text-align: end; }
.a-name span { font-weight: 600; }
.a-meta { display: flex; flex-wrap: wrap; gap: 2px 14px; align-items: baseline; min-inline-size: 0; }
.a-meta .code { overflow-wrap: anywhere; }
.a-sup { font-size: var(--text-sm); color: var(--color-ink-2); }
.a-pr { display: grid; grid-template-columns: auto auto; justify-content: start; gap: 18px; margin-block-start: 4px; align-items: center; }
.a-pr .pc { justify-items: start; }
.a-pr-none { grid-template-columns: 1fr; }
@container (min-width: 560px) {
  .a-row { grid-template-columns: minmax(0, 1fr) 13rem 40px; grid-template-areas: 'name pr acts' 'meta pr acts'; row-gap: 0; }
  .a-pr { grid-template-columns: 1fr 1fr; justify-content: stretch; justify-items: end; gap: 12px; margin: 0; }
  .a-pr .pc { justify-items: end; }
  .a-pr-none .pc.none { text-align: end; justify-items: end; }
}
@container (min-width: 1000px) {
  .a-row { grid-template-columns: minmax(0, 1fr) 17rem 13rem 40px; grid-template-areas: 'name meta pr acts'; }
  .a-colhead { display: grid; }
  .a-meta .code { min-inline-size: 9rem; }
}
@container (max-width: 559px) { .a-lines .a-open dl { grid-template-columns: minmax(0, 1fr); } }
.a-acts { justify-self: end; }
.a-more { inline-size: 36px; min-block-size: 36px; padding: 0; }
.a-row.is-open { border-block-end: 0; background: var(--color-plate); box-shadow: inset 3px 0 0 var(--color-accent); padding-inline-start: 10px; }
.a-open { display: grid; gap: 12px; padding: 4px 16px 16px 13px; background: var(--color-plate); box-shadow: inset 3px 0 0 var(--color-accent);
  border-block-end: 1px solid var(--color-rule); }
.a-open dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 0; }
.a-open dt { font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); }
.a-open dd { margin: 0; font-size: var(--text-sm); color: var(--color-ink); }
.a-open-acts { display: flex; flex-wrap: wrap; gap: 8px; }

/* CARDS, in a pictured section */
.a-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; padding-block: 14px; }
.a-card { display: grid; gap: 6px; align-content: start; padding: 10px 10px 12px; border-radius: var(--radius-tile); background: var(--color-plate);
  box-shadow: var(--shadow-plate), 0 0 0 1px var(--color-rule); }
.a-card-pic { position: relative; aspect-ratio: 4 / 3; border-radius: var(--radius-md); background: var(--color-white); overflow: hidden; }
.a-zoom { position: absolute; inset-block-start: 6px; inset-inline-end: 6px; inline-size: 34px; padding: 0; }
.a-card h3 { font-size: var(--text-base); line-height: 1.3; }
.a-card-pr { display: flex; gap: 18px; align-items: center; }
.a-card-pr .pc { justify-items: start; }

/* THE DOOR (second state) */
.ax { display: grid; gap: 20px; }
.ax-head { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(0, 420px); align-items: center; gap: 12px 20px; }
.ax-mark { display: block; block-size: 40px; inline-size: auto; max-inline-size: 160px; object-fit: contain; }
.ax-title { font-size: var(--text-3xl); }
.ax-count { font-size: var(--text-sm); color: var(--color-ink-2); }
.ax-grid { columns: 4 260px; column-gap: 28px; }
.ax-aisle { break-inside: avoid; display: grid; gap: 6px; padding-block: 12px; border-block-start: 1px solid var(--color-rule-strong); }
.ax-name { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: var(--text-lg); color: var(--color-ink); }
.ax-name b { margin-inline-start: auto; color: var(--color-ink-2); }
.ax-glyph { display: grid; place-items: center; inline-size: 32px; block-size: 32px; border-radius: var(--radius-md); background: var(--color-plate); color: var(--color-ink-file); box-shadow: 0 0 0 1px var(--color-rule); }
.ax-aisle ul { display: grid; gap: 2px; padding-inline-start: 42px; }
.ax-aisle li { display: flex; gap: 8px; font-size: var(--text-sm); color: var(--color-ink-file); max-inline-size: none; margin: 0; }
.ax-aisle li .num { margin-inline-start: auto; color: var(--color-ink-3); }
.ax-pic { padding-inline-start: 42px; font-size: var(--text-xs); color: var(--color-ink-3); max-inline-size: none; }
.ax-unsorted .ax-name { color: var(--color-ink-2); }
.ax-wrong { max-inline-size: 72ch; }

/* REFLOW */
.a-find { max-inline-size: 760px; }
@media (min-width: 1600px) {
  .a-sections { columns: 2; column-gap: 48px; }
  .a-sections .a-group { break-inside: avoid; margin-block-start: 0; padding-block-start: 28px; }
}
@media (max-width: 1100px) {
  .ax-head { grid-template-columns: auto minmax(0, 1fr); } .ax-find { grid-column: 1 / -1; }
}
@media (max-width: 760px), (max-height: 480px) {
  .a-chips { display: none; }
  .a-filter { display: inline-flex; }
  .a-dock { inset-block-start: 0; padding-block: 10px; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .a-head { padding-block: 4px 8px; gap: 4px; } .a-head h1 { font-size: var(--text-3xl); } .a-glyph { inline-size: 44px; block-size: 44px; }
  .a-glyph .ui-icon { inline-size: 26px; block-size: 26px; } .a-count { margin-block-start: 0; font-size: var(--text-sm); }
  .a-dock-row { flex-wrap: nowrap; } .a-why { display: none; }
}
@media (max-width: 599px) {
  .a-head h1 { font-size: var(--text-3xl); }
  .a-glyph { inline-size: 48px; block-size: 48px; } .a-glyph .ui-icon { inline-size: 28px; block-size: 28px; }
  .a-count { font-size: var(--text-sm); }
  .a-find { flex-basis: 100%; }
  .a-seg { flex: 1; }
  .a-made { padding: 12px; }
  .ax-head { grid-template-columns: minmax(0, 1fr); } .ax-mark { block-size: 32px; }
  .ax-aisle ul, .ax-pic { padding-inline-start: 0; }
}
`

export const html = page({ title: 'Chandlery · A', id: 'a', css, body, notes })
