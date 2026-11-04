/* BOARD C — "Columns before lines". A review queue by exception: what is risky first (the 25
   that doubled or halved, the 61 that can't be placed), then the structure of the change (each
   list read as its columns, each supplier as a row), and lines only when a column or a supplier
   is pressed. Unmoved lines are a count. Order: risk → structure → lines → act. */
import { page, ic, esc, btn, chip, kbd, tick, moved, stateHead, jobsTable, REF } from './shell.mjs'
import {
  F,
  P,
  D,
  C,
  n,
  money,
  fig,
  isCost,
  CTD_LIKE,
  census,
  colLabel,
  FILE,
  EDITION,
  CHECK,
  DEE,
  IBC,
  SUPPLIERS,
  SUPPLIER_COUNT,
  CANNOT,
  NAMED,
  NAMED_BY_CODE,
  NAMED_BY_BOTH,
  NAMED_MOVING,
  NAMED_FIGURES,
  PERSON,
  PERSON_WHY,
  personWhy,
  applyCount,
  pictureOf,
  swingPct,
  pct,
  PARTS_HEAD,
} from './facts.mjs'

const IN = applyCount({ leftOut: 1 })
const LOOKED = 3
const own = (col, type = 'number') =>
  (type === 'number' && isCost(col)) || CTD_LIKE(col)
    ? `<span class="own">${ic('LockSimple')}<span class="own-w">own</span></span>`
    : ''

const head = () => `
<header class="chead frame">
  <p class="cfile">${ic('FileXls', { weight: 'duotone' })}<span><b>${esc(FILE.name)}</b> · ${FILE.size} · read in ${FILE.read}, against the Price list of ${EDITION.day} <span class="code">${EDITION.fp}</span></span>${btn('Put it down', { intent: 'quiet', size: 'sm', icon: 'X' })}</p>
  <h1><span class="big">${n(C.unmoved)}</span> of ${n(C.total)} lines stay exactly as they are.</h1>
  <div class="share" aria-hidden="true">
    <i class="s-ch" style="flex:${C.changing}"></i><i class="s-new" style="flex:${C.adding}"></i><i class="s-no" style="flex:${C.cannot * 4}"></i><i class="s-un" style="flex:${C.unmoved}"></i>
  </div>
  <ul class="legend">
    <li><i class="s-ch"></i><b>${n(C.changing)}</b> change</li>
    <li><i class="s-new"></i><b>${n(C.adding)}</b> new</li>
    <li><i class="s-no"></i><b>${C.cannot}</b> can’t be placed</li>
    <li><i class="s-un"></i><b>${n(C.unmoved)}</b> unmoved</li>
    <li class="zero"><b>0</b> taken away: a workbook never removes a line</li>
  </ul>
</header>`

const dock = ({ count = IN } = {}) => `
<footer class="dock" aria-label="Apply">
  <div class="dock-in frame">
    <ul class="dock-c"><li><b>${n(count)}</b> in</li><li><b>1</b> left out</li><li><b>${C.cannot}</b> not placed</li><li class="dk-l"><b>${LOOKED} of ${CHECK.length}</b> looked at</li></ul>
    <p class="dock-u">Undo puts all ${n(count)} back in one step.</p>
    ${btn(`Apply ${n(count)}<span class="dw">&nbsp;changes</span>`, { intent: 'act', icon: 'ArrowRight', cls: 'dock-act' })}
  </div>
</footer>`

/* ---- the risk bands ---- */
const verdict = (i) => (i === 0 ? 'out' : i < LOOKED ? 'keep' : null)
const checkRow = (a, i) => {
  const v = verdict(i)
  return `<li class="ck${v === 'out' ? ' out' : ''}">
    <span class="ck-mark" aria-label="${v ? 'looked at' : 'not looked at yet'}">${ic(v ? 'CheckCircle' : 'Circle', { weight: v ? 'fill' : 'regular', size: 'md' })}</span>
    <span class="ck-w"><b class="nm">${esc(a.name)}</b><span class="meta"><span>${esc(a.supplier)}</span><span class="code">${esc(a.code)}</span><span>line ${n(a.at)}</span></span></span>
    <span class="ck-f">${moved(money(a.from), money(a.to))}<span class="dir ${a.to > a.from ? 'up' : 'down'}">${pct(swingPct(a))}</span></span>
    <span class="ck-a" role="radiogroup" aria-label="Keep or leave out"><span role="radio" aria-checked="${v === 'keep'}"${v === 'keep' ? ' data-on' : ''}>Keep</span><span role="radio" aria-checked="${v === 'out'}"${v === 'out' ? ' data-on="out"' : ''}>Leave out</span></span>
  </li>`
}

const risk = () => `
<section class="risk frame">
  <section class="band b-check" aria-labelledby="h-check">
    <header class="band-h"><h2 id="h-check"><span class="bn">${CHECK.length}</span> to look at first</h2><p>Sell doubled or more, or halved or less. <b>${LOOKED} of ${CHECK.length} looked at.</b></p>
      <span class="prog" aria-hidden="true"><i style="inline-size:${(LOOKED / CHECK.length) * 100}%"></i></span></header>
    <ol class="cks">${CHECK.slice(0, 6).map(checkRow).join('')}</ol>
    <p class="band-more"><a class="door" href="#">The other ${CHECK.length - 6} ${ic('ArrowRight')}</a></p>
  </section>
  <section class="band b-cannot" aria-labelledby="h-cannot">
    <header class="band-h"><h2 id="h-cannot"><span class="bn">${C.cannot}</span> can’t be placed</h2><p>Each names a line two lines here share. They stay out of Apply until placed.</p></header>
    <div class="cn-named">
      <p><b>${NAMED.length}</b> the workbook’s own Code names${NAMED_BY_BOTH ? ` (${NAMED_BY_BOTH} with its Supplier)` : ''}. Placed, <b>${NAMED_MOVING.length}</b> add a change and ${NAMED.length - NAMED_MOVING.length} already read exactly so.</p>
      ${btn(`Place the ${NAMED.length}`, { intent: 'secondary', icon: 'Crosshair' })}
    </div>
    <ul class="cn-why">
      <li><span class="bn2">${PERSON_WHY['code-on-neither']}</span><span><b>Code on neither line</b><small>${PERSON.filter(
        (c) => personWhy(c) === 'code-on-neither',
      )
        .map((c) => esc(c.name))
        .slice(0, 4)
        .join(
          ' · ',
        )} …</small></span>${btn('Choose', { intent: 'quiet', size: 'sm', icon: 'ArrowRight' })}</li>
      <li><span class="bn2">${PERSON_WHY['same-row-twice']}</span><span><b>Two lines that are one line twice</b><small>${[...new Set(PERSON.filter((c) => personWhy(c) === 'same-row-twice').map((c) => esc(c.name)))].join(' · ')}</small></span>${btn('Choose', { intent: 'quiet', size: 'sm', icon: 'ArrowRight' })}</li>
      <li><span class="bn2">${PERSON_WHY['said-twice']}</span><span><b>Said twice in the workbook</b><small>${PERSON.filter(
        (c) => personWhy(c) === 'said-twice',
      )
        .map((c) => esc(c.name))
        .join(
          ' · ',
        )}</small></span>${btn('Choose', { intent: 'quiet', size: 'sm', icon: 'ArrowRight' })}</li>
    </ul>
  </section>
</section>`

/* ---- the structure: each list as its columns (Recce's value diff, the moved column first) ---- */
const colTable = (list, { pressed } = {}) => {
  const rows = census(list)
  return `<section class="band b-list">
    <header class="band-h"><h2>${esc(list.name)}</h2><p><b>${n(list.changing)}</b> change · <b>${n(list.adding)}</b> new · <b>${list.cannot}</b> can’t be placed · ${n(list.notInFile)} not in the file, kept as they are${list.readAt ? ` · a quote reads <b>${esc(list.readAt)}</b>` : ' · no price a quote reads is declared here'}</p></header>
    <div class="ct" role="table" aria-label="${esc(list.name)}, column by column">
      <div class="ct-r ct-h" role="row"><span role="columnheader">Column</span><span role="columnheader">Lines it moves</span><span role="columnheader">of ${n(list.changing)}</span><span role="columnheader">Higher</span><span role="columnheader">Lower</span></div>
      ${rows.map((c) => `<button type="button" class="ct-r${pressed === c.fieldId ? ' on' : ''}" role="row" aria-pressed="${pressed === c.fieldId}"><span role="rowheader">${esc(c.label)}${own(c.col, c.type)}</span><span role="cell" class="ct-bar"><i style="inline-size:${(c.share * 100).toFixed(1)}%"></i><b>${n(c.lines)}</b></span><span role="cell" class="fig">${(c.share * 100).toFixed(1)}%</span><span role="cell" class="fig">${c.type === 'number' ? n(c.up) : '—'}</span><span role="cell" class="fig">${c.type === 'number' ? n(c.down) : '—'}</span></button>`).join('')}
    </div>
  </section>`
}

const suppliers = ({ open } = {}) => `
<section class="band b-sup frame" aria-labelledby="h-sup">
  <header class="band-h"><h2 id="h-sup"><span class="bn">${SUPPLIER_COUNT}</span> suppliers on Parts &amp; Accessories</h2><p>The file’s own Supplier codes, read without regard to case (it writes Yamaha’s both “Yam”, ${SUPPLIERS.find((s) => s.code === 'YAM').spellings.get('Yam')} lines, and “YAM”, ${SUPPLIERS.find((s) => s.code === 'YAM').spellings.get('YAM')}). Dealer Fit has no supplier column. Untick a supplier and its lines are left out.</p>
  <label class="find"><span class="sr">Find a supplier, a name or a code</span>${ic('MagnifyingGlass')}<input value="" placeholder="Find a supplier, name or code">${kbd('/')}</label></header>
  <div class="st" role="table" aria-label="Suppliers">
    <div class="st-r st-h" role="row"><span role="columnheader"><span class="sr">In</span></span><span role="columnheader">Supplier</span><span role="columnheader">Lines</span><span role="columnheader">Higher</span><span role="columnheader">Lower</span><span role="columnheader">New</span><span role="columnheader">Can’t place</span><span role="columnheader"></span></div>
    ${SUPPLIERS.slice(0, open ? 11 : 8)
      .map(
        (
          s,
        ) => `<div class="st-r${open === s.code ? ' on' : ''}" role="row"><span role="cell">${tick(s.code === 'LOW' && false ? 'out' : 'in', `Include ${s.code}`)}</span><span role="rowheader"><b>${esc(s.code)}</b></span><span role="cell" class="fig">${n(s.lines)}</span><span role="cell" class="fig">${n(s.higher)}</span><span role="cell" class="fig">${n(s.lower)}</span><span role="cell" class="fig">${n(s.fresh)}</span><span role="cell" class="fig">${n(s.cannot ?? 0)}</span><span role="cell">${open === s.code ? btn('<span class="stw">Fold</span><span class="sr">' + esc(s.code) + '</span>', { intent: 'quiet', size: 'sm', icon: 'CaretDown' }) : btn('<span class="stw">Open</span><span class="sr">' + esc(s.code) + '</span>', { intent: 'quiet', size: 'sm', icon: 'CaretRight' })}</span></div>
    ${open === s.code ? supOpen() : ''}`,
      )
      .join('')}
    <p class="st-more">${SUPPLIER_COUNT - (open ? 11 : 8)} more, by lines</p>
  </div>
</section>`

const supOpen = () => `<div class="sup-open" role="row"><div role="cell">
  <p class="so-h"><b>${esc(IBC[0].cat)}</b> · all ${IBC.length} lines lower at Sell, and at every column they move</p>
  <ol class="so">${IBC.slice(0, 6)
    .map(
      (a) =>
        `<li><span class="so-n"><b class="nm">${esc(a.name)}</b><span class="code">${esc(a.code)} · line ${n(a.at)}</span></span><span class="so-f">${a.cells.map((x) => `<span class="f"><span class="f-col">${esc(colLabel(x.fieldId, x.col))}${own(x.col)}</span>${moved(fig(x.col, x.from), fig(x.col, x.to))}</span>`).join('')}</span></li>`,
    )
    .join('')}</ol>
  <p class="band-more">${IBC.length - 6} more IBC lines, in workbook order</p>
</div></div>`

const state1 = `
<main class="queue" id="s1">
  ${head()}
  ${risk()}
  <section class="lists frame">${colTable(P)}${colTable(D)}</section>
  ${suppliers()}
  <p class="unmoved frame">${ic('Equals')}<span><b>${n(C.unmoved)} lines</b> on ${C.lists} lists stay exactly as they are, ${C.lists - 2} of those lists untouched: the workbook does not feed them. They are a count, not a list.</span></p>
  ${dock()}
</main>`

/* ---- state 2: a column pressed ---- */
const actSell = D.lines.filter((a) => a.cells.some((x) => x.fieldId === 'dealer_fit.r')).slice(0, 7)
const ACT = D.census.find((c) => c.fieldId === 'dealer_fit.r')
const state2 = `
${stateHead(2, '/shelf?see=changes&list=dealer_fit&column=act-sell', `Dealer Fit read column first. Act Sell is pressed in its column table: its ${n(ACT.lines)} lines open under it, Act Sell leading each and every other figure the line moves named after it. The judge’s “9 figures · and 9 other figures” is gone: every figure has its column’s name.`)}
<main class="queue">
  <section class="frame lists one">
    ${colTable(D, { pressed: 'dealer_fit.r' })}
    <section class="band col-open">
      <header class="band-h"><h2>Act Sell · ${n(ACT.lines)} lines</h2><p><b>${n(ACT.up)}</b> higher · <b>${n(ACT.down)}</b> lower, in workbook order.</p></header>
      <ol class="cl">${actSell
        .map((a) => {
          const act = a.cells.find((x) => x.fieldId === 'dealer_fit.r')
          const rest = a.cells.filter((x) => x.fieldId !== 'dealer_fit.r')
          return `<li>${tick('in', `Include ${a.name}`)}<span class="cl-n"><b class="nm">${esc(a.name)}</b><span class="code">${esc(a.code)} · Dealer Fit Module, line ${n(a.at)}</span></span><span class="cl-lead">${moved(fig('Act Sell', act.from), fig('Act Sell', act.to))}</span><span class="cl-f">${rest.map((x) => `<span class="f"><span class="f-col">${esc(colLabel(x.fieldId, x.col))}${own(x.col)}</span>${moved(fig(x.col, x.from), fig(x.col, x.to))}</span>`).join('')}</span></li>`
        })
        .join('')}</ol>
    </section>
  </section>
</main>`

/* ---- state 3: a supplier opened ---- */
const state3 = `
${stateHead(3, '/shelf?see=changes&supplier=IBC', `The supplier band with IBC opened in place: ${IBC.length} lines, one category, all lower. The row’s tick would leave all ${IBC.length} out at once; each line keeps its own tick when opened further.`)}
<main class="queue">${suppliers({ open: 'IBC' })}</main>`

/* ---- state 4: one of the 14, chosen in a compare ---- */
const B1 = PERSON.find((c) => c.name === 'Boat Cover - SP360')
const B2 = PERSON.find((c) => c.name === 'Console Cover - SUS700')
const cmpRow = (c, chosen) => `
<div class="pc">
  <p class="pc-h"><b class="nm">${esc(c.name)}</b> <span class="quiet">· the Code is on neither line</span></p>
  <div class="pc-t" role="radiogroup" aria-label="Which line ${esc(c.name)} means">
    <div class="pc-r pc-hh"><span></span><span>Code</span><span>Supplier</span><span>Sell</span><span>Category</span><span>Line</span></div>
    <div class="pc-r pc-file"><span class="pc-k">${ic('FileXls')}<span>The workbook</span></span><span class="code">${esc(c.fileCode)}</span><span>${esc(c.fileSupplier)}</span><span class="fig">${money(c.fileCells[11])}</span><span class="quiet">—</span><span class="fig">${n(c.at)}</span></div>
    ${c.candidates.map((x, i) => `<label class="pc-r pc-c${chosen === i ? ' on' : ''}"><span class="pc-k"><input type="radio" name="pc${c.at}" ${chosen === i ? 'checked' : ''}><span>Here, ${i === 0 ? 'the first' : 'the second'}</span></span><span class="code">${esc(x.code)}</span><span>${esc(x.supplier)}</span><span class="fig">${money(x.sell)}</span><span class="pc-cat">${esc(x.cat)}</span><span class="fig">${n(Number(x.src.split('!R')[1]))}</span></label>`).join('')}
    <label class="pc-r pc-c"><span class="pc-k"><input type="radio" name="pc${c.at}" ${chosen === undefined ? 'checked' : ''}><span>Leave it out</span></span><span class="quiet pc-span">it stays out of Apply</span></label>
  </div>
</div>`
const state4 = `
${stateHead(4, '/shelf?see=changes&cannot=code-on-neither', `“Code on neither line” opened: ${PERSON_WHY['code-on-neither']} lines, each the workbook’s line set above the two lines here it could mean, in one small table per line. Measured on this file: Highfield’s covers and sundecks appear twice in the workbook, once under an old code and once under a new one, so the later line of each pair is placed by its Code and the earlier one waits here. The second line of the Boat Cover is filed under a Lowrance category on the price list today, as the pack read it: the compare shows it, and Review is where it is fixed.`)}
<main class="queue"><section class="band frame pcs">${cmpRow(B1, 1)}${cmpRow(B2)}</section></main>`

/* ---- state 5: the rest page, after Apply ---- */
const state5 = `
${stateHead(5, '/shelf', `The rest page after Apply, deepened. This computer is an inventory whose first entry is the price list and its edition; the record below is grouped by day (a record of its own, a schema change), each entry with what it did and its Put back. No copy has been saved since the apply, and the plate says that first.`)}
<main class="queue rest">
  <section class="frame inv">
    <div class="inv-pl">
      <p class="eyebrow">The shelf · this computer holds</p>
      <h2>The price list of ${EDITION.day}, with ${esc(FILE.name)} applied today</h2>
      <p class="quiet"><span class="code">${EDITION.fp}</span> as packed · ${n(C.total + C.adding)} lines on ${C.lists} lists · ${n(IN)} changes since it was packed</p>
    </div>
    <div class="inv-warn">${ic('Warning', { size: 'md' })}<p><b>No copy holds today’s ${n(IN)} changes.</b> None has been saved on this computer.</p>${btn('Save a copy now', { intent: 'act', icon: 'DownloadSimple' })}</div>
  </section>
  <section class="frame inv-kinds">
    ${[
      ['FileText', 'Quotes', '0', '0 given · 0 being written'],
      ['Users', 'Customers', '0', ''],
      ['Scales', 'Rules', '0', 'Northside wrote'],
      ['Sliders', 'Settings', '0', ''],
      ['Image', 'Pictures', '0', 'Northside chose'],
      ['Database', 'Price list lines', n(C.total + C.adding), `${C.lists} lists`],
    ]
      .map(
        ([g, k, v, s]) =>
          `<div class="ik">${ic(g)}<b class="fig">${v}</b><span>${k}${s ? `<small>${s}</small>` : ''}</span></div>`,
      )
      .join('')}
  </section>
  <section class="frame hist">
    <h3>What happened to the price list</h3>
    <div class="day"><h4>Today <span class="quiet">· 1</span></h4>
      <div class="ev"><span class="ev-g">${ic('FileXls')}</span><span class="ev-w"><b>${esc(FILE.name)} applied</b><small>${n(IN)} changes on 2 lists · 1 left out (the Dee Shackle) · ${C.cannot} not placed · ${FILE.size}</small></span>${btn('Show the changes', { intent: 'quiet', size: 'sm' })}${btn('Put back', { intent: 'secondary', size: 'sm', icon: 'ArrowCounterClockwise' })}</div>
      <p class="ev-q">${ic('FileText')}No quote was being written, so none moved. A quote already given never moves.</p>
    </div>
    <div class="day"><h4>${EDITION.short} <span class="quiet">· 1</span></h4>
      <div class="ev"><span class="ev-g">${ic('Package')}</span><span class="ev-w"><b>The Master Price File, packed</b><small>${EDITION.lists} lists · ${n(EDITION.lines)} lines · the price list this computer began with</small></span></div>
    </div>
  </section>
  <section class="frame back">
    <div><h3>Bring back a copy</h3><p>A copy is set beside this computer kind by kind, its quotes split into new here and already here, before anything is replaced.</p></div>
    ${btn('Choose a copy', { intent: 'secondary', icon: 'UploadSimple' })}
  </section>
</main>`

/* ---- state 6: a paste, read as a risk band ---- */
const state6 = `
${stateHead(6, '/shelf?see=changes&from=paste', `A paste lands as its own band at the head of the queue, because a heading nobody recognised is the first risk: the judge’s paste (Parts Maintenance line 676 under the sheet’s heading row) with its one unread heading pointed at in place.`)}
<main class="queue">
  <section class="band frame paste">
    <header class="band-h"><h2><span class="bn">1</span> heading to read</h2><p>Pasted: 1 line under ${PARTS_HEAD.filter(Boolean).length} headings. All but two name a column of Parts &amp; Accessories or are left out by name.</p></header>
    <div class="pm"><span class="code">Parts &amp; Accessories Module</span>${ic('ArrowRight')}<span class="sel">Product, the name${ic('CaretDown')}</span><span class="quiet">the sheet’s own title for its name column</span></div>
    <div class="pm"><span class="code">MU · MU · MU</span>${ic('ArrowRight')}<span class="sel">the second (J)${ic('CaretDown')}</span><span class="quiet">the sheet heads three columns MU; the list reads J</span></div>
    <p class="pm-out">Read: Tube Covers to suit PVC Boat - 2.0 Mtr · Sell ${moved('$1,640', '$1,300')} <span class="quiet">(the judge’s measured paste)</span></p>
  </section>
</main>`

const css = `
/* ======== BOARD C ======== */
.chead { display: grid; gap: 10px; padding-block: 14px 18px; }
.cfile { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; color: var(--color-ink-2); font-size: var(--text-sm); }
.cfile > .ui-icon { color: var(--color-viridian-600); inline-size: 20px; block-size: 20px; }
.cfile b { color: var(--color-ink); }
.chead h1 { font-size: var(--text-4xl); line-height: 1.12; letter-spacing: -0.01em; }
.chead h1 .big { color: var(--color-ink-file); }
.share { display: flex; block-size: 10px; border-radius: 5px; overflow: hidden; gap: 2px; }
.share i, .legend i { display: block; }
.s-ch { background: var(--color-blue-600); } .s-new { background: var(--color-leaf-600); } .s-no { background: var(--color-ochre-600); } .s-un { background: var(--color-rule-strong); }
.legend { display: flex; flex-wrap: wrap; gap: 4px 18px; font-size: var(--text-sm); color: var(--color-ink-2); }
.legend li { display: inline-flex; align-items: center; gap: 6px; }
.legend i { inline-size: 10px; block-size: 10px; border-radius: 3px; }
.legend b { color: var(--color-ink); }
.legend .zero { color: var(--color-ink-3); }

.band { border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); padding: 16px 18px; box-sizing: border-box; min-inline-size: 0; }
.band-h { display: grid; gap: 4px; margin-block-end: 12px; }
.band-h h2 { font-size: var(--text-xl); display: flex; align-items: baseline; gap: 8px; }
.band-h p { color: var(--color-ink-2); font-size: var(--text-sm); }
.bn { font-size: var(--text-3xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.b-check .bn { color: var(--color-carmine-600); }
.b-cannot .bn { color: var(--color-ochre-600); }
.prog { display: block; block-size: 6px; border-radius: 3px; background: var(--color-wash); overflow: hidden; }
.prog i { display: block; block-size: 100%; background: var(--color-accent); }
.band-more { font-size: var(--text-sm); margin-block-start: 8px; color: var(--color-ink-3); }

.risk { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.cks { display: grid; }
.ck { display: grid; grid-template-columns: 26px minmax(0, 1fr) auto auto; gap: 4px 12px; align-items: center; padding-block: 8px; border-block-end: 1px solid var(--color-rule); }
.ck-mark { color: var(--color-rule-strong); display: inline-flex; }
.ck-mark .ui-icon[data-size='md'] { inline-size: 20px; block-size: 20px; }
.ck:has([data-on]) .ck-mark { color: var(--color-leaf-600); }
.ck.out .ck-mark { color: var(--color-carmine-600); }
.ck.out .ck-w, .ck.out .ck-f { opacity: 0.62; }
.ck-w { display: grid; min-inline-size: 0; }
.nm { font-weight: 650; line-height: 1.3; }
.meta { display: flex; flex-wrap: wrap; gap: 0 10px; font-size: var(--text-xs); color: var(--color-ink-3); }
.ck-f { display: grid; justify-items: end; font-size: var(--text-base); }
.ck-a { display: inline-flex; padding: 2px; border-radius: var(--radius-pill); box-shadow: inset 0 0 0 1px var(--color-rule-strong); }
.ck-a [role='radio'] { display: inline-flex; align-items: center; min-block-size: 30px; padding-inline: 10px; border-radius: var(--radius-pill); font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-2); cursor: pointer; white-space: nowrap; }
.ck-a [data-on] { background: var(--color-accent); color: var(--color-ink-on-accent); }
.ck-a [data-on='out'] { background: var(--color-carmine-600); color: var(--color-white); }

.cn-named { display: grid; gap: 10px; padding: 12px; border-radius: var(--radius-tile); background: var(--color-plate-tint); margin-block-end: 10px; }
.cn-named p { font-size: var(--text-sm); color: var(--color-ink-2); }
.cn-why li { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding-block: 8px; border-block-end: 1px solid var(--color-rule); }
.bn2 { font-size: var(--text-2xl); font-weight: 800; color: var(--color-ochre-600); text-align: end; font-variant-numeric: tabular-nums; }
.cn-why small { display: block; font-size: var(--text-xs); color: var(--color-ink-3); }

.lists { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; margin-block-start: 14px; align-items: start; }
.lists.one { grid-template-columns: 1fr; }
.ct { display: grid; }
.ct-r { all: unset; box-sizing: border-box; display: grid; grid-template-columns: minmax(130px, 1.2fr) minmax(0, 1.6fr) 56px 52px 52px; gap: 10px; align-items: center; padding: 5px 6px; border-radius: 8px; font-size: var(--text-sm); cursor: pointer; }
.ct-r:not(.ct-h):hover { background: var(--color-plate-tint); }
.ct-r.on { background: var(--color-chosen-wash); box-shadow: inset 0 0 0 2px var(--color-accent); }
.ct-h { cursor: default; font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); }
.ct-r [role='rowheader'] { font-weight: 650; display: inline-flex; align-items: center; gap: 4px; }
.ct-bar { display: flex; align-items: center; gap: 8px; }
.ct-bar i { display: block; block-size: 8px; border-radius: 4px; background: var(--color-blue-600); min-inline-size: 2px; max-inline-size: calc(100% - 52px); }
.ct-bar b { font-variant-numeric: tabular-nums; font-size: var(--text-sm); }
.ct-r .fig { text-align: end; color: var(--color-ink-2); }
.own { display: inline-flex; align-items: center; gap: 2px; font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 600; }
.own .ui-icon { inline-size: 11px; block-size: 11px; }

.b-sup { margin-block-start: 14px; }
.b-sup .band-h { grid-template-columns: minmax(0, 1fr) minmax(220px, 320px); align-items: end; }
.b-sup .band-h h2, .b-sup .band-h p { grid-column: 1; }
.b-sup .find { grid-column: 2; grid-row: 1 / span 2; }
.find { display: flex; align-items: center; gap: 8px; min-block-size: 40px; padding-inline: 12px 6px; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-control-edge); color: var(--color-ink-3); }
.find input { all: unset; flex: 1; min-inline-size: 0; color: var(--color-ink); }
.st-r { display: grid; grid-template-columns: 40px minmax(90px, 1.2fr) repeat(5, minmax(56px, 0.6fr)) 96px; gap: 8px; align-items: center; padding-block: 3px; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); }
.st-r .fig { text-align: end; }
.st-h { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 700; }
.st-h > :nth-child(n+3):nth-child(-n+7) { text-align: end; }
.st-r.on { background: var(--color-chosen-wash); }
.st-more { font-size: var(--text-sm); color: var(--color-ink-3); padding-block: 8px 0; }
.sup-open { padding: 8px 0 12px 48px; border-block-end: 1px solid var(--color-rule); }
.so-h { font-size: var(--text-sm); color: var(--color-ink-2); margin-block-end: 6px; }
.so li { display: grid; grid-template-columns: minmax(220px, 0.8fr) minmax(0, 2fr); gap: 4px 16px; padding-block: 8px; border-block-end: 1px solid var(--color-rule); }
.so-n { display: grid; }
.so-f, .cl-f { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: var(--text-sm); }
.f { display: inline-flex; gap: 6px; align-items: baseline; }
.f-col { font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); display: inline-flex; align-items: center; gap: 2px; }
.f-col .own-w { display: none; }

.unmoved { display: flex; gap: 10px; align-items: center; color: var(--color-ink-2); padding-block: 18px 8px; }
.unmoved .ui-icon { color: var(--color-ink-3); }

.dock { position: sticky; bottom: calc(var(--dock-gap) + 8px); z-index: 25; margin-block-start: 8px; }
.dock-in { display: flex; align-items: center; gap: 8px 18px; padding: 8px 8px 8px 16px; border-radius: var(--radius-plate); background: var(--color-door); backdrop-filter: blur(12px); box-shadow: var(--shadow-md), 0 0 0 1px var(--color-rule); }
.dock-c { display: flex; flex-wrap: wrap; gap: 2px 16px; font-size: var(--text-sm); color: var(--color-ink-2); flex: 1; }
.dock-c b { color: var(--color-ink); font-size: var(--text-base); }
.dock-u { font-size: var(--text-sm); color: var(--color-ink-3); }
.dock-act { inline-size: 280px; }

.col-open .cl li { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; gap: 4px 12px; align-items: center; padding-block: 8px; border-block-end: 1px solid var(--color-rule); }
.cl-n { display: grid; min-inline-size: 0; }
.cl-lead { font-size: var(--text-lg); }
.cl-f { grid-column: 2 / -1; }

.pcs { display: grid; gap: 18px; }
.pc-h { margin-block-end: 6px; }
.pc-t { display: grid; border-radius: var(--radius-tile); box-shadow: inset 0 0 0 1px var(--color-rule-strong); overflow: hidden; }
.pc-r { display: grid; grid-template-columns: minmax(150px, 1fr) minmax(0, 1.1fr) 70px 90px minmax(0, 1.4fr) 70px; gap: 10px; align-items: center; padding: 8px 12px; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); }
.pc-r .fig { text-align: end; }
.pc-hh { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 700; }
.pc-hh > :nth-child(4), .pc-hh > :nth-child(6) { text-align: end; }
.pc-file { background: var(--color-plate-tint); font-weight: 600; }
.pc-k { display: inline-flex; gap: 8px; align-items: center; font-weight: 650; }
.pc-k input { accent-color: var(--color-accent); margin: 0; }
.pc-c { cursor: pointer; min-block-size: 44px; box-sizing: border-box; }
.pc-c.on { background: var(--color-chosen-wash); box-shadow: inset 3px 0 0 var(--color-accent); }
.pc-span { grid-column: 2 / -1; }
.pc-cat { color: var(--color-ink-2); }

.inv { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(300px, 1fr); gap: 16px 24px; align-items: center; padding-block: 18px 12px; }
.inv h2 { font-size: var(--text-3xl); line-height: 1.15; }
.inv-warn { display: grid; grid-template-columns: auto 1fr; gap: 10px 12px; align-items: start; padding: 14px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate), inset 4px 0 0 var(--color-amber-500); }
.inv-warn > .ui-icon { color: var(--color-amber-600); }
.inv-warn .ui-button-frame { grid-column: 1 / -1; }
.inv-warn p { font-size: var(--text-sm); color: var(--color-ink-2); }
.inv-kinds { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.ik { display: grid; grid-template-columns: auto 1fr; gap: 0 8px; padding: 12px; border-radius: var(--radius-tile); background: var(--color-plate); box-shadow: var(--shadow-plate); align-items: center; }
.ik > .ui-icon { color: var(--color-ink-file); }
.ik b { font-size: var(--text-2xl); font-weight: 800; }
.ik span { grid-column: 1 / -1; font-size: var(--text-sm); font-weight: 650; }
.ik small { display: block; font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 500; }
.hist { display: grid; gap: 12px; margin-block-start: 16px; padding: 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); box-sizing: border-box; }
.hist h3 { font-size: var(--text-xl); }
.day h4 { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-ink-file); margin-block-end: 6px; }
.ev { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto auto; gap: 8px 10px; align-items: center; padding: 10px 0; border-block-end: 1px solid var(--color-rule); }
.ev-g { display: grid; place-items: center; inline-size: 32px; block-size: 32px; border-radius: 50%; background: var(--color-plate-tint); color: var(--color-ink-file); }
.ev-w small { display: block; font-size: var(--text-sm); color: var(--color-ink-3); }
.ev-q { display: flex; gap: 8px; align-items: center; font-size: var(--text-sm); color: var(--color-ink-2); padding-block-start: 8px; }
.back { display: flex; flex-wrap: wrap; gap: 10px 20px; align-items: center; justify-content: space-between; margin-block-start: 16px; padding: 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); box-sizing: border-box; }
.back h3 { font-size: var(--text-xl); }
.back p { color: var(--color-ink-2); font-size: var(--text-sm); max-inline-size: 70ch; }

.paste { max-inline-size: 980px; display: grid; gap: 8px; }
.pm { display: grid; grid-template-columns: minmax(0, 1fr) 20px minmax(0, 0.9fr) minmax(0, 1.2fr); gap: 8px 12px; align-items: center; padding-block: 6px; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); }
.pm .code { font-size: var(--text-sm); color: var(--color-ink); }
.sel { display: inline-flex; align-items: center; justify-content: space-between; gap: 6px; min-block-size: 40px; padding-inline: 12px 8px; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 2px var(--color-accent); font-weight: 700; }
.pm-out { font-size: var(--text-sm); display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; }

/* ---- reflow ---- */
@media (min-width: 1600px) {
  .risk { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); }
  .chead h1 { font-size: var(--text-5xl); }
}
@media (max-width: 1199px) {
  .risk, .lists, .lists.one { grid-template-columns: 1fr; }
  .inv { grid-template-columns: 1fr; }
  .inv-kinds { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pc-r { grid-template-columns: minmax(130px, 1fr) minmax(0, 1fr) 60px 80px 60px; }
  .pc-r > .pc-cat, .pc-hh > :nth-child(5) { display: none; }
}
@media (max-width: 899px) {
  .st-r { grid-template-columns: 40px minmax(70px, 1fr) repeat(3, minmax(48px, 0.6fr)) 44px; }
  .st-r > :nth-child(6), .st-r > :nth-child(7) { display: none; }
  .stw { display: none; }
  .sup-open { padding-inline-start: 0; }
  .so li { grid-template-columns: 1fr; }
  .dock-u { display: none; }
  .b-sup .band-h { grid-template-columns: 1fr; }
  .b-sup .find { grid-column: 1; grid-row: auto; }
}
@media (max-width: 599px) {
  .chead { padding-block: 2px 12px; gap: 8px; }
  .cfile > span .code, .cfile .ui-button-frame { display: none; }
  .chead h1 { font-size: var(--text-2xl); }
  .legend { gap: 2px 12px; font-size: var(--text-xs); }
  .band { padding: 14px 12px; }
  .ck { grid-template-columns: 22px minmax(0, 1fr) auto; }
  .ck-a { grid-column: 2 / -1; justify-self: start; }
  .ck-a [role='radio'] { min-block-size: 44px; padding-inline: 16px; font-size: var(--text-sm); }
  .cn-why li { grid-template-columns: 32px minmax(0, 1fr) auto; }
  .ct-r { grid-template-columns: minmax(96px, 1fr) minmax(0, 1.2fr) 48px; gap: 6px; min-block-size: 44px; }
  .ct-r > :nth-child(4), .ct-r > :nth-child(5) { display: none; }
  .ct-bar i { max-inline-size: calc(100% - 44px); }
  .dock-in { padding: 6px 6px 6px 12px; gap: 6px; }
  .dock-c li:not(:first-child) { display: none; }
  .dock-act { inline-size: auto; flex: 0 1 230px; }
  .dw { display: none; }
  .dock .ui-button[data-intent='act'] { min-block-size: 44px; font-size: var(--text-base); padding-inline: 14px 6px; }
  .band-h .ui-button, .cn-why .ui-button, .cn-named .ui-button, .ev .ui-button { min-block-size: 44px; }
  .col-open .cl li { grid-template-columns: 44px minmax(0, 1fr); }
  .cl-lead { grid-column: 2; }
  .pc-r { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 70px; }
  .pc-r > :nth-child(3), .pc-hh > :nth-child(3), .pc-r > :nth-child(6), .pc-hh > :nth-child(6) { display: none; }
  .inv h2 { font-size: var(--text-2xl); }
  .inv-kinds { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ev { grid-template-columns: 32px minmax(0, 1fr); }
  .ev .ui-button-frame { grid-column: 2; }
  .pm { grid-template-columns: 1fr; }
  .pm > .ui-icon { display: none; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .chead { padding-block: 2px 8px; gap: 6px; }
  .chead h1 { font-size: var(--text-xl); }
  .cfile { display: none; }
  .dock-in { padding: 4px 4px 4px 12px; }
  .dock-u, .dk-l { display: none; }
  .dock .ui-button[data-intent='act'] { min-block-size: 44px; }
}
`

const notes = `
<section class="notes" aria-label="The board’s notes">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Direction C · the shelf, round 2</span><h2>Columns before lines</h2></div>
  <p><b>The screen’s one job</b> (docs/SCREENS.md row 146): see every change a new Master Price File would make before anything is written, and write the ones Northside keeps as one step with one way back.</p>
  <p><b>What this screen does that no other does.</b> It reads a re-issue the way the person who wrote it thinks of it: ${n(D.changing)} Dealer Fit changes are first ${D.census.length} columns with a count each, and ${n(P.lines.length)} Parts lines are first ${SUPPLIER_COUNT} suppliers. No other screen summarises a change before showing it.</p>
  <p><b>The order and grouping.</b> Risk → structure → lines → act. Grouped by exception (the ${CHECK.length} and the ${C.cannot}), then by column per list, then by supplier; a line appears only when a column or a supplier is opened. A is one flat register; B is grouped by what a person must decide.</p>

  <div class="cols">
    <div><h3>Two references no earlier board used</h3><ul class="dash">
      <li><b>Recce, value diff and checklist</b> (${REF('live/recce-value-diff.png')}, ${REF('live/recce-checklist.png')}): a model headed by its total, then one row per column with Matched and Matched %, the moved column first; and a checklist of checks each ticked or marked, with Approved. Taken: the column table, sorted by lines moved, figures mono and right-aligned; the “looked at” tick per line with a count of how many.</li>
      <li><b>DockMaster, vendor price book</b> (${REF('live/dockmaster-pricebook-1.png')}, ${REF('live/dockmaster-parts-load.png')}): the marine dealer system loads a price book per vendor, with Update Prices on by default. Taken: suppliers as rows with a tick each, because that is how a marine parts admin already thinks of a re-issue. Left: its ten raw zero-padded sample rows instead of a preview.</li>
    </ul>
    <p>Also drawn on: Obsidian’s version history, revisions grouped under each day (${REF('live/obsidian-version-history.png')}), for the record on the rest page.</p></div>
    <div><h3>The figures, all measured</h3><ul class="dash">
      <li>The column tables are counted from <code>CellChange</code>: on Parts, MU moved on ${n(P.census[0].lines)} of ${n(P.changing)} lines and Sell on ${n(P.census[1].lines)}; on Dealer Fit, MU and GP on ${n(D.census[0].lines)} of ${n(D.changing)} each, Act Sell on ${n(ACT.lines)}.</li>
      <li>Higher and lower are counted per column from the price list’s figure and the file’s; text columns say —.</li>
      <li>Suppliers: ${SUPPLIER_COUNT} codes once case is ignored; the top eight by lines are ${SUPPLIERS.slice(
        0,
        8,
      )
        .map((s) => `${s.code} ${n(s.lines)}`)
        .join(', ')}.</li>
      <li>The ${C.cannot} split ${NAMED.length} named by Code / ${PERSON.length} for a person, measured as on the other boards.</li>
    </ul></div>
  </div>

  ${jobsTable([
    [
      'A1 Bring in the .xlsx',
      'The head’s first line: the file, its size, its read time, the price list it was read against, and Put it down.',
    ],
    [
      'A2 See what moves first',
      `The head is the answer: ${n(C.unmoved)} of ${n(C.total)} unmoved, a bar in the four inks of its legend, and “0 taken away”.`,
    ],
    [
      'A3 The price that jumped',
      `The first band: the ${CHECK.length}, each Keep or Leave out, with ${LOOKED} of ${CHECK.length} looked at.`,
    ],
    [
      'A4 One list in full',
      'Each list’s column table; a column pressed opens its lines (state 2).',
    ],
    ['A5 Find a product or supplier', 'The supplier band and its find (state 3, IBC).'],
    [
      'A6 Settle the 61',
      `The second band: Place the ${NAMED.length}; the ${PERSON.length} by why, each a compare of the workbook’s line over the lines it could mean (state 4).`,
    ],
    ['A7 Apply and Undo', 'The dock, pinned at every size, with its counts and the Undo sentence.'],
    [
      'A8 Apply part of a file',
      'Leave out per line, a tick per supplier, a tick per line once opened.',
    ],
    [
      'A9 Paste the workbook’s own lines',
      'State 6: the unread heading is a band at the head of the queue.',
    ],
    ['A10 A wrong file', 'Unchanged.'],
    [
      'A11 Which price list, and what came before',
      'State 5: the inventory’s first entry is the price list and its edition; the record by day below.',
    ],
    ['A12 Clear back to the file', 'Unchanged, below the record.'],
    [
      'S1 to S4 The copy',
      'State 5: six kinds counted; the warning that no copy holds today’s changes, with Save; Bring back compares before replacing.',
    ],
    [
      'Salesperson',
      'State 5’s record says, under the apply, which quotes being written it moved; on this computer none.',
    ],
    ['Missing: every figure named', 'Column tables, and every opened line names each figure.'],
    [
      'Missing: a working tool',
      'Bands that open in place, a find, the column and supplier filters, the dock pinned.',
    ],
    ['Missing: leave a line out', 'Leave out; supplier and line ticks.'],
    ['Missing: settle a line', 'The compare, state 4.'],
    ['Missing: edition and ledger', 'State 5.'],
    ['Missing: drafts a file moves', 'State 5 and the dock.'],
  ])}

  <div class="cols">
    <div><h3>How it reflows</h3><ul class="dash">
      <li><b>390 × 844</b>: the head is the sentence and its legend; the bands stack, the 25 first; Keep / Leave out drop under each line at 44 px; a column table keeps Column, the bar and its count; the dock is the count in and Apply.</li>
      <li><b>844 × 390</b>: the head is one line; one band is open at a time, the rest folded to their headings; the dock is one line.</li>
      <li><b>834 × 1112</b>: the two risk bands stack, then the two lists stack; the supplier table drops New and Can’t place into the opened row.</li>
      <li><b>1280 and 1440</b>: risk side by side, then the two lists side by side, then suppliers full width.</li>
      <li><b>1920</b>: the head’s figure grows to the display size; the same two-by-two, wider, with no new content invented to fill it.</li>
    </ul></div>
    <div><h3>Type, motion, keys</h3>
    <div class="specimen">
      <div><span>head 30/1.12 800</span><b style="font-size:var(--text-4xl)"><span style="color:var(--color-ink-file)">12,609</span> of 15,691</b></div>
      <div><span>band count 26 800</span><b style="font-size:var(--text-3xl);color:var(--color-carmine-600)">25</b></div>
      <div><span>column row 13 650</span><span style="font-weight:650">Act Sell</span></div>
      <div><span>figure 14</span><span>${moved('$982', '$939')}</span></div>
    </div>
    <ul class="dash">
      <li><b>Motion.</b> A pressed column or supplier opens its lines under it, height eased over the open duration, the rest of the page held still above; the looked-at bar fills in place. Reduced motion: it opens at once.</li>
      <li><b>Keys.</b> Tab: the bands in order; inside the 25, K keeps and L leaves out and the focus steps to the next not looked at; a column row is a button (Enter opens it); <code>/</code> finds a supplier, name or code.</li>
    </ul></div>
  </div>

  <div class="cols">
    <div><h3>The honest constraints</h3><ul class="dash">
      <li>The share bar draws the ${C.cannot} at four times their width so the ochre is visible at all; the legend’s figures are the truth.</li>
      <li>Cost shows because the shelf is never a customer surface, marked “own” by the app’s rule and, for Dealer Fit’s GP and CTDs, by the widening the build needs.</li>
      <li>No quote, customer, rule, setting, picture or copy exists on this computer; each says 0 or none.</li>
      <li>The record by day needs a record of its own: a schema change.</li>
    </ul></div>
    <div><h3>The mark, and what a dealer replaces</h3><ul class="dash">
      <li>The mark stays in the bar; the head’s figure is the screen’s showpiece, set in Northside’s ink, because the first thing an admin needs is how much did <i>not</i> move.</li>
      <li>The accent sets pressed rows and the progress; the four census inks and the band counts are tokens. Nothing depends on a photograph.</li>
    </ul></div>
  </div>
</div>
</section>`

export const html = page({
  title: 'Shelf C · Columns before lines',
  id: 'c',
  css,
  body: state1 + state2 + state3 + state4 + state5 + state6,
  notes,
})
