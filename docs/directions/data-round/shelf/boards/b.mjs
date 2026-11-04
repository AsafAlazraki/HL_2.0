/* BOARD B — "Settle, then look". Four steps at ?step=: Read, Settle, Look, Apply. Settle holds
   only what needs a person — the lines that can't be placed, the prices that doubled or halved,
   a heading nobody recognised — so that by the time the person looks, every line in the plan
   is one somebody could vouch for. Order: problems → preview → act. */
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

const PLAN = applyCount({ leftOut: 1, placed: true })
const movingIn = (t) => NAMED_MOVING.filter((c) => c.tableId === t).length
const P_CHANGE = P.changing - 1 + movingIn('parts')
const D_CHANGE = D.changing + movingIn('dealer_fit')
const LOOKED = 2

const own = (col, type = 'number') =>
  (type === 'number' && isCost(col)) || CTD_LIKE(col)
    ? `<span class="own" title="Northside’s own">${ic('LockSimple')}</span>`
    : ''
const typeOf = (list, fieldId) => list.census.find((c) => c.fieldId === fieldId)?.type ?? 'number'

/* A LINE, read as a sentence of figures: each moved column named, old → new, in census order */
const figures = (a, list, { max = 99 } = {}) => {
  const order = list.census.map((c) => c.fieldId)
  const cells = [...a.cells].sort((x, y) => order.indexOf(x.fieldId) - order.indexOf(y.fieldId))
  const shown = cells.slice(0, max)
  return `<p class="figs">${shown.map((x) => `<span class="f"><span class="f-col">${esc(colLabel(x.fieldId, x.col))}${own(x.col, typeOf(list, x.fieldId))}</span>${moved(fig(x.col, x.from), fig(x.col, x.to))}</span>`).join('')}${cells.length > max ? `<span class="f more">and ${cells.length - max} more, named when the line opens</span>` : ''}</p>`
}

const steps = (at) => {
  const S = [
    ['Read', `${n(C.changes + C.cannot)} lines read`, 'done'],
    ['Settle', `${PERSON.length} to place · ${CHECK.length - LOOKED} to look at`, ''],
    ['Look', `${n(PLAN)} changes, list by list`, ''],
    ['Apply', 'one step, one Undo', ''],
  ]
  return `<nav class="steps frame" aria-label="Bringing in a price file">
    <ol>${S.map(([w, s, done], i) => `<li${i + 1 === at ? ' aria-current="step"' : ''}${done ? ' data-done' : ''}><a href="#"><span class="st-n">${done ? ic('Check') : i + 1}</span><span class="st-w"><b>${w}</b><small>${s}</small></span></a></li>`).join('')}</ol>
  </nav>`
}

const head = () => `
<header class="bhead frame">
  <p class="bfile">${ic('FileXls', { weight: 'duotone' })}<b>${esc(FILE.name)}</b><span>${FILE.size} · read in ${FILE.read} · saved on this computer ${FILE.saved}</span></p>
  <p class="bagainst">against the <b>Price list of ${EDITION.day}</b> <span class="code">${EDITION.fp}</span> · nothing is written until Apply</p>
</header>`

const dock = (at) => `
<footer class="dock" aria-label="Where you are, and Apply">
  <div class="dock-in frame">
    <p class="dock-step"><span class="dock-of">Step ${at} of 4</span><span class="dock-tally"><b>${NAMED.length}</b> placed by Code · <b>${PERSON.length}</b> yours to place · <b>${LOOKED} of ${CHECK.length}</b> swings looked at</span></p>
    ${at < 4 ? btn(`Next: ${['', 'Settle', 'Look', 'Apply'][at]}`, { intent: 'secondary', icon: 'ArrowRight', cls: 'dock-next' }) : ''}
    ${btn(`Apply ${n(PLAN)}<span class="dw">&nbsp;changes</span>`, { intent: 'act', icon: 'ArrowRight', cls: 'dock-act' })}
  </div>
</footer>`

/* ---------------- STATE 1: Settle ---------------- */
const WHY = {
  'code-on-neither': (c) =>
    `The workbook’s Code, <span class="code">${esc(c.fileCode)}</span>, is on neither line here.`,
  'same-row-twice': () =>
    `The two lines here are the same line twice, Code and price alike: either is right, and Review can fold them into one.`,
  'said-twice': () => `An earlier line of the workbook already named this line.`,
}
const card = (c, { chosen } = {}) => {
  const why = personWhy(c)
  const sellAt = c.tableId === 'parts' ? 11 : 17
  return `<article class="card">
    <header class="card-head">
      <div><b class="nm">${esc(c.name)}</b>
      <p class="meta"><span>${esc(c.list)}</span>${c.fileSupplier ? `<span>${esc(c.fileSupplier)}</span>` : ''}<span class="code">${esc(c.fileCode || 'no Code')}</span><span>${c.tableId === 'parts' ? 'Sell' : 'Act Sell'} ${money(c.fileCells[sellAt])} in the workbook</span><span>${c.tableId === 'dealer_fit' ? 'Dealer Fit Module' : 'Parts Maintenance'}, line ${n(c.at)}</span></p></div>
    </header>
    <p class="card-why">${c.candidates.length} lines here share this name. ${WHY[why](c)}</p>
    <ul class="cand-list" role="radiogroup" aria-label="Which line it means">
      ${c.candidates.map((x, i) => `<li class="cand${chosen === i ? ' on' : ''}" role="radio" aria-checked="${chosen === i}" tabindex="${i === 0 ? 0 : -1}"><span class="cand-code code">${esc(x.code || '—')}</span><span class="cand-w">${x.supplier ? `${esc(x.supplier)} · ` : ''}<b>${money(x.sell)}</b> now<small>${esc(x.cat || 'no category')} · ${esc(x.src.replace('!R', ', line '))} when packed</small></span><span class="cand-acts">${chosen === i ? `<span class="pill on">${ic('Check')}This one</span>` : `<span class="pill">This one</span>`}</span></li>`).join('')}
    </ul>
    <p class="card-foot"><a class="door" href="#">Every line with this name ${ic('ArrowRight')}</a><a class="door quiet-door" href="#">Leave it out</a></p>
  </article>`
}
const P1 = PERSON.find((c) => c.name === 'Boat Cover - SP360')
const P2 = PERSON.find((c) => /^Yamaha Trailer Support/.test(c.name))
const P3 = PERSON.find((c) => c.tableId === 'dealer_fit')
const restPerson = PERSON.filter((c) => ![P1, P2, P3].includes(c))

const swingRow = (a, verdict) => `<li class="sw${verdict === 'out' ? ' out' : ''}">
  <div class="sw-line"><b class="nm">${esc(a.name)}</b><p class="meta"><span>${esc(a.supplier)}</span><span class="code">${esc(a.code)}</span><span>Parts Maintenance, line ${n(a.at)}</span></p>${figures(a, P, { max: 4 })}</div>
  <p class="sw-sell"><span class="big">${moved(money(a.from), money(a.to))}</span><span class="dir ${a.to > a.from ? 'up' : 'down'}">${pct(swingPct(a))} Sell</span></p>
  <span class="seg2" role="radiogroup" aria-label="Keep or leave out"><span role="radio" aria-checked="${verdict === 'keep'}"${verdict === 'keep' ? ' data-on' : ''}>Keep</span><span role="radio" aria-checked="${verdict === 'out'}"${verdict === 'out' ? ' data-on' : ''}>Leave out</span></span>
</li>`

const state1 = `
<main class="flow" id="s1">
  ${head()}
  ${steps(2)}
  <section class="frame settle">
    <div class="done-group">
      <span class="dg-mark">${ic('CheckCircle', { weight: 'fill', size: 'md' })}</span>
      <p><b>${NAMED.length} of the ${C.cannot} lines that can’t be placed are placed by the workbook’s own Code.</b> Two lines here share each name; the Code${NAMED_BY_BOTH ? ` (and for ${NAMED_BY_BOTH}, the Supplier)` : ''} is on exactly one. ${NAMED_MOVING.length} of them add a change (${NAMED_FIGURES} figures); ${NAMED.length - NAMED_MOVING.length} already read exactly so.</p>
      <span class="dg-acts">${btn(`See the ${NAMED.length}`, { intent: 'quiet', size: 'sm' })}${btn('Put them back', { intent: 'quiet', size: 'sm', icon: 'ArrowCounterClockwise' })}</span>
    </div>

    <section class="group">
      <header class="g-head"><h2><span class="g-n">${PERSON.length}</span> only you can place</h2><p>${PERSON_WHY['code-on-neither']} carry a Code that is on neither line, ${PERSON_WHY['same-row-twice']} name two lines that are one line twice, ${PERSON_WHY['said-twice']} is said twice in the workbook. Each stays out of Apply until you choose.</p></header>
      <div class="cards">${card(P1, { chosen: 1 })}${card(P2)}${card(P3)}</div>
      <p class="g-more"><b>${restPerson.length} more</b>, in workbook order: ${restPerson.map((c) => esc(c.name)).join(' · ')}</p>
    </section>

    <section class="group">
      <header class="g-head"><h2><span class="g-n">${CHECK.length}</span> prices doubled or halved</h2><p>Each Sell here is twice or more, or half or less, what it is now. Each may be right; each is kept or left out by a person. <b>${LOOKED} of ${CHECK.length} looked at.</b></p></header>
      <ol class="swings">${swingRow(DEE, 'out')}${swingRow(CHECK[1], 'keep')}${swingRow(CHECK[2])}</ol>
      <p class="g-more"><a class="door" href="#">The other ${CHECK.length - 3} ${ic('ArrowRight')}</a></p>
    </section>
  </section>
  ${dock(2)}
</main>`

/* ---------------- STATE 2: Look, Parts, supplier IBC ---------------- */
const look = (list, { supplier, cols = 6 } = {}) => {
  const all = census(list)
  const lines = supplier ? IBC : list.lines.filter((a) => a.fate === 'change')
  const show = lines.slice(0, 8)
  return `
  <div class="look frame">
    <div class="tabs" role="tablist">
      <a role="tab" href="#" aria-selected="${list === P}">Parts &amp; Accessories <span class="ui-chip-count">${n(P.changing + P.adding + P.cannot)}</span></a>
      <a role="tab" href="#" aria-selected="${list === D}">Dealer Fit Packages <span class="ui-chip-count">${n(D.changing + D.adding + D.cannot)}</span></a>
      <p class="will"><span>${ic('ArrowsClockwise')}<b>${n(list === P ? P_CHANGE : D_CHANGE)}</b> will be updated</span><span>${ic('Plus')}<b>${n(list.adding)}</b> will be created</span></p>
    </div>
    <div class="colstrip" aria-label="The columns that move, by how many lines">
      <span class="cs-say">Columns that move</span>
      ${all.map((c, i) => `<button type="button" class="cs${i >= cols ? ' cs-x' : ''}"${c.fieldId === 'parts.l' && supplier ? ' aria-pressed="false"' : ''}><span>${esc(c.label)}${own(c.col, c.type)}</span><b>${n(c.lines)}</b></button>`).join('')}
    </div>
    <div class="look-tools">
      <label class="find"><span class="sr">Find a line by name or code</span>${ic('MagnifyingGlass')}<input value="" placeholder="Find a name or code">${kbd('/')}</label>
      ${list === P ? chip(supplier ? `Supplier ${supplier}` : 'Supplier', { icon: 'Truck', pressed: Boolean(supplier), count: supplier ? undefined : SUPPLIER_COUNT }) : `<span class="nosup">No supplier column on this list: its lines keep the workbook’s categories.</span>`}
      ${chip('Higher')}${chip('Lower')}${chip('New')}
      <p class="showing"><b>${n(supplier ? IBC.length : list.changing + list.adding)}</b> lines${supplier ? ` from ${supplier}, all ${IBC.length} lower` : ''}</p>
    </div>
    <ol class="lines">
      ${supplier ? `<li class="lgroup"><b>${esc(IBC[0].cat)}</b> · ${IBC.length}</li>` : ''}
      ${show.map((a) => `<li class="ln"><span class="gut" aria-label="${a.fate === 'new' ? 'will be created' : 'will be updated'}">${ic(a.fate === 'new' ? 'Plus' : 'ArrowsClockwise')}</span>${tick('in', `Include ${a.name}`)}<div class="ln-w"><b class="nm">${esc(a.name)}</b><p class="meta">${a.supplier ? `<span>${esc(a.supplier)}</span>` : ''}${a.code ? `<span class="code">${esc(a.code)}</span>` : ''}<span>${list === P ? 'Parts Maintenance' : 'Dealer Fit Module'}, line ${n(a.at)}</span>${a.cat && !supplier ? `<span>${esc(a.cat)}</span>` : ''}</p>${figures(a, list)}</div></li>`).join('')}
    </ol>
  </div>`
}
const state2 = `
${stateHead(2, '/shelf?see=changes&step=look&list=parts&supplier=IBC', `Look, on Parts &amp; Accessories, with the Supplier chip set to IBC. The list is a tab with its count; “will be updated · will be created” is said at the head and again by a glyph in every line’s gutter; the columns that move are a strip of counts that are also filters; each line names every figure it moves, old → new. Supplier is the file’s own column (${SUPPLIER_COUNT} codes on this file, Yam and YAM read as one).`)}
<main class="flow">
  ${steps(3)}
  ${look(P, { supplier: 'IBC', cols: 7 })}
  ${dock(3)}
</main>`

/* ---------------- STATE 3: Look, Dealer Fit ---------------- */
const state3 = `
${stateHead(3, '/shelf?see=changes&step=look&list=dealer_fit', `Look, on Dealer Fit Packages: all ${D.census.length} columns that move are named and counted before a line is read, and every line names its own. The judge found “9 figures · and 9 other figures” on all ${n(D.changing)}; here the first reads ${D.lines[0].cells.length} figures by name.`)}
<main class="flow">
  ${look(D, { cols: 10 })}
</main>`

/* ---------------- STATE 4: Apply, and the save that follows ---------------- */
const state4 = `
${stateHead(4, '/shelf?see=changes&step=apply', `Apply restates what the plan holds, what it moves beyond the price list (no quote is being written on this computer, and it says so), and its one Undo. After it, the band offers the next safe act.`)}
<main class="flow">
  ${steps(4)}
  <section class="frame applyp">
    <h2>Apply ${n(PLAN)} changes to 2 lists</h2>
    <ul class="ap-list">
      <li><b>Parts &amp; Accessories</b><span>${n(P_CHANGE)} updated · ${n(P.adding)} created · 1 left out (the Dee Shackle) · ${P.cannotLines.filter((c) => !c.namedBy).length} not placed</span></li>
      <li><b>Dealer Fit Packages</b><span>${n(D_CHANGE)} updated · ${n(D.adding)} created · ${D.cannotLines.filter((c) => !c.namedBy).length} not placed</span></li>
      <li><b>${C.lists - 2} other lists</b><span>untouched: the workbook does not feed them</span></li>
    </ul>
    <p class="ap-q">${ic('FileText')}<span><b>No quote is being written on this computer</b>, so Apply moves none. A quote being written reads the price list as it is; when there are some, each is named here with the sum it would move by. A quote already given never moves.</span></p>
    <p class="ap-undo">Undo puts all ${n(PLAN)} back in one step, from here or from the shelf.</p>
    ${btn(`Apply ${n(PLAN)} changes`, { intent: 'act', icon: 'ArrowRight', cls: 'ap-act' })}
  </section>
  <section class="frame after">
    <span class="after-mark">${ic('CheckCircle', { weight: 'fill', size: 'md' })}</span>
    <p><b>${n(PLAN)} changes are on the price list.</b> No copy holds them yet: a copy saved now would bring them back on another computer.</p>
    <span class="after-acts">${btn('Save a copy now', { intent: 'primary', icon: 'DownloadSimple' })}${btn('Undo', { intent: 'quiet', icon: 'ArrowCounterClockwise' })}</span>
  </section>
</main>`

/* ---------------- STATE 5: the rest page, day by day; and a copy brought back ---------------- */
const KINDS = [
  ['FileText', 'Quotes', 0, 0],
  ['Users', 'Customers', 0, 0],
  ['Scales', 'Rules Northside wrote', 0, 0],
  ['Sliders', 'Settings', 0, 0],
  ['Image', 'Pictures Northside chose', 0, 0],
]
const after = C.total + C.adding
const state5 = `
${stateHead(5, '/shelf?see=restore', `The rest page on a second computer, fresh from the packed file, with the copy saved after state 4 brought to it. The two columns are this computer and the copy, kind by kind, before anything is replaced; the day-by-day record (a record of its own: a schema change) says what each price list is. Every count is derived from the plan above; no quote or customer exists on either side, so each says 0 and nothing more.`)}
<main class="flow">
  <section class="frame days">
    <header class="days-head"><p class="eyebrow">The shelf · this computer</p><h2>Price list of ${EDITION.day}</h2><p class="quiet">${EDITION.lists} lists · ${n(EDITION.lines)} lines · <span class="code">${EDITION.fp}</span> · no file applied on this computer · no copy saved</p></header>
  </section>
  <section class="frame cmp">
    <header class="cmp-head"><h3>Bring back a copy</h3><p><b>Northside Marine copy</b>, saved today on the other computer. Nothing is replaced until you press Replace.</p></header>
    <div class="cmp-t" role="table" aria-label="This computer beside the copy">
      <div class="cmp-r cmp-h" role="row"><span role="columnheader"></span><span role="columnheader">${ic('Desktop')} This computer</span><span role="columnheader">${ic('Copy')} The copy</span><span role="columnheader">After Replace</span></div>
      <div class="cmp-r" role="row"><span role="rowheader"><b>The price list</b></span><span role="cell">${EDITION.short}<small>${n(C.total)} lines</small></span><span role="cell">${EDITION.short} + ${esc(FILE.name)}<small>${n(after)} lines</small></span><span role="cell" class="cmp-diff">${n(P_CHANGE + D_CHANGE)} lines change, ${n(C.adding)} lines join</span></div>
      ${KINDS.map(([g, k, here, copy]) => `<div class="cmp-r" role="row"><span role="rowheader">${ic(g)}<b>${k}</b></span><span role="cell" class="fig">${here}</span><span role="cell" class="fig">${copy}</span><span role="cell" class="quiet">nothing on either side</span></div>`).join('')}
    </div>
    <p class="cmp-q">The copy holds no quote. When it does, each is said to be <b>new here</b> or <b>already here</b> (the same number, kept as it is), never that it “joins them”.</p>
    <span class="cmp-acts">${btn('Replace this computer’s with the copy', { intent: 'primary', icon: 'ArrowsClockwise' })}${btn('Put the copy down', { intent: 'quiet', icon: 'X' })}</span>
  </section>
  <section class="frame plate days-list">
    <h3>The price list, day by day</h3>
    <ol class="dl">
      <li><span class="dl-day">Today</span><span class="dl-w"><b>A copy chosen: Northside Marine copy</b><small>Replace would add ${n(after - C.total)} lines and change ${n(P_CHANGE + D_CHANGE)} · waiting on you</small></span></li>
      <li><span class="dl-day">${EDITION.short}</span><span class="dl-w"><b>The Master Price File, packed</b><small>${EDITION.lists} lists · ${n(EDITION.lines)} lines · the price list this computer began with</small></span></li>
    </ol>
  </section>
</main>`

/* ---------------- STATE 6: a paste whose heading needs a person, in Settle ---------------- */
const state6 = `
${stateHead(6, '/shelf?see=changes&step=settle&from=paste', `The paste door shares Settle. The judge’s paste (Parts Maintenance line 676 under the sheet’s own heading row) has one heading the list does not answer to, so it arrives in Settle as one more thing only a person can say, beside the lines.`)}
<main class="flow">
  ${steps(2).replace('lines read', 'pasted line read')}
  <section class="frame settle">
    <section class="group">
      <header class="g-head"><h2><span class="g-n">1</span> heading only you can read</h2><p>The pasted heading row has ${PARTS_HEAD.filter(Boolean).length} headings. ${PARTS_HEAD.filter(Boolean).length - 4} name a column of Parts &amp; Accessories or are left out by name; three read MU (H, J, T) and the list reads one; one is the sheet’s own title for its names.</p></header>
      <article class="card wide">
        <div class="map1"><span class="code">C</span><b>Parts &amp; Accessories Module</b><span class="mv-arrow">${ic('ArrowRight')}</span><span class="sel">Product, the name${ic('CaretDown')}</span><span class="quiet">the column that names each line</span></div>
        <div class="map1"><span class="code">H · J · T</span><b>MU, three times</b><span class="mv-arrow">${ic('ArrowRight')}</span><span class="sel">J, the second${ic('CaretDown')}</span><span class="quiet">the one Parts &amp; Accessories reads; H and T are left out</span></div>
        <p class="card-foot">Read, it is 1 line: Tube Covers to suit PVC Boat - 2.0 Mtr, Sell ${moved('$1,640', '$1,300')} <span class="quiet">(the judge’s measured paste)</span></p>
      </article>
    </section>
  </section>
</main>`

const css = `
/* ======== BOARD B ======== */
.bhead { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 20px; padding-block: 14px 8px; }
.bfile { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; }
.bfile .ui-icon { color: var(--color-viridian-600); inline-size: 22px; block-size: 22px; }
.bfile b { font-size: var(--text-xl); }
.bfile span, .bagainst { color: var(--color-ink-2); font-size: var(--text-sm); }

.steps { position: sticky; top: 56px; z-index: 20; padding-block: 8px; background: var(--color-ground); }
.steps ol { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); overflow: hidden; counter-reset: s; }
.steps li a { display: flex; align-items: center; gap: 10px; padding: 10px 14px; min-block-size: 56px; box-sizing: border-box; border-inline-end: 1px solid var(--color-rule); }
.steps li:last-child a { border: 0; }
.st-n { display: grid; place-items: center; inline-size: 28px; block-size: 28px; border-radius: 50%; flex: none; font-weight: 800; background: var(--color-plate-tint); color: var(--color-ink-file); box-shadow: inset 0 0 0 1px var(--color-rule-strong); }
.steps li[data-done] .st-n { background: var(--color-leaf-600); color: var(--color-white); box-shadow: none; }
.steps li[aria-current] a { background: var(--color-chosen-wash); box-shadow: inset 0 -3px 0 var(--color-accent); }
.steps li[aria-current] .st-n { background: var(--color-accent); color: var(--color-ink-on-accent); box-shadow: none; }
.st-w { display: grid; min-inline-size: 0; }
.st-w small { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 600; }

.settle { display: grid; gap: 18px; padding-block: 10px 28px; }
.done-group { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 12px 16px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); }
.done-group p { flex: 1 1 520px; color: var(--color-ink-2); font-size: var(--text-sm); }
.done-group p b { color: var(--color-ink); }
.dg-mark { color: var(--color-leaf-600); display: inline-flex; }
.dg-acts { display: flex; gap: 2px; }
.group { display: grid; gap: 12px; }
.g-head { display: grid; gap: 4px; }
.g-head h2 { font-size: var(--text-2xl); display: flex; align-items: baseline; gap: 10px; }
.g-n { font-size: var(--text-4xl); font-weight: 800; color: var(--color-ochre-600); font-variant-numeric: tabular-nums; }
.g-head p { color: var(--color-ink-2); max-inline-size: 100ch; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: start; }
.card { display: grid; gap: 10px; padding: 16px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); min-inline-size: 0; }
.card .nm { font-size: var(--text-lg); line-height: 1.3; }
.nm { font-weight: 650; }
.meta { display: flex; flex-wrap: wrap; gap: 0 10px; font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 500; margin-block-start: 2px; }
.card-why { font-size: var(--text-sm); color: var(--color-ink-reason); }
.cand-list { display: grid; gap: 6px; }
.cand { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'code acts' 'w acts'; gap: 2px 10px; align-items: center; padding: 10px 12px; border-radius: var(--radius-field); box-shadow: inset 0 0 0 1px var(--color-rule-strong); cursor: pointer; }
.cand-code { grid-area: code; font-size: var(--text-sm); color: var(--color-ink); font-weight: 700; }
.cand-w { grid-area: w; font-size: var(--text-sm); color: var(--color-ink-2); }
.cand-w small { display: block; font-size: var(--text-xs); color: var(--color-ink-3); }
.cand-acts { grid-area: acts; }
.cand.on { box-shadow: inset 0 0 0 2px var(--color-accent); background: var(--color-chosen-wash); }
.pill { display: inline-flex; align-items: center; gap: 4px; min-block-size: 32px; padding-inline: 12px; border-radius: var(--radius-pill); font-size: var(--text-sm); font-weight: 700; color: var(--color-ink-on-tint); background: var(--color-plate-tint); box-shadow: inset 0 0 0 1px var(--color-rule); white-space: nowrap; }
.pill.on { background: var(--color-accent); color: var(--color-ink-on-accent); box-shadow: none; }
.card-foot { display: flex; flex-wrap: wrap; gap: 4px 18px; font-size: var(--text-sm); align-items: baseline; }
.quiet-door { color: var(--color-ink-3); }
.g-more { font-size: var(--text-sm); color: var(--color-ink-2); }
.swings { display: grid; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); overflow: hidden; }
.sw { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px 24px; align-items: center; padding: 12px 16px; border-block-end: 1px solid var(--color-rule); }
.sw.out { background: oklch(from var(--color-carmine-600) l c h / 5%); }
.sw.out .sw-line, .sw.out .sw-sell { opacity: 0.66; }
.sw-sell { display: grid; justify-items: end; }
.sw-sell .big { font-size: var(--text-xl); }
.seg2 { display: inline-flex; padding: 3px; border-radius: var(--radius-pill); background: var(--color-plate-tint); box-shadow: inset 0 0 0 1px var(--color-rule); }
.seg2 [role='radio'] { min-block-size: 32px; display: inline-flex; align-items: center; padding-inline: 14px; border-radius: var(--radius-pill); font-size: var(--text-sm); font-weight: 700; color: var(--color-ink-2); cursor: pointer; }
.seg2 [data-on] { background: var(--color-plate); color: var(--color-ink); box-shadow: var(--shadow-plate); }
.sw.out .seg2 [data-on] { color: var(--color-carmine-600); }
.figs { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: var(--text-sm); margin-block-start: 6px; }
.f { display: inline-flex; gap: 6px; align-items: baseline; }
.f-col { font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); display: inline-flex; gap: 2px; align-items: center; }
.f.more { color: var(--color-ink-3); font-size: var(--text-xs); }
.own .ui-icon { inline-size: 11px; block-size: 11px; }

.dock { position: sticky; bottom: calc(var(--dock-gap) + 8px); z-index: 25; }
.dock-in { display: flex; align-items: center; gap: 10px 14px; padding: 8px 8px 8px 16px; border-radius: var(--radius-plate); background: var(--color-door); backdrop-filter: blur(12px); box-shadow: var(--shadow-md), 0 0 0 1px var(--color-rule); }
.dock-step { flex: 1; display: grid; min-inline-size: 0; }
.dock-of { font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-file); }
.dock-tally { font-size: var(--text-sm); color: var(--color-ink-2); }
.dock-tally b { color: var(--color-ink); }
.dock-act { inline-size: 280px; }

.look { display: grid; gap: 10px; padding-block: 8px 24px; }
.tabs { display: flex; flex-wrap: wrap; align-items: end; gap: 4px 6px; border-block-end: 1px solid var(--color-rule-strong); }
.tabs [role='tab'] { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; font-weight: 700; color: var(--color-ink-2); border-radius: 12px 12px 0 0; min-block-size: 44px; box-sizing: border-box; }
.tabs [aria-selected='true'] { background: var(--color-plate); color: var(--color-ink); box-shadow: 0 -2px 0 var(--color-accent) inset, 0 0 0 1px var(--color-rule); }
.will { margin-inline-start: auto; display: flex; gap: 16px; font-size: var(--text-sm); color: var(--color-ink-2); padding-block-end: 10px; }
.will span { display: inline-flex; gap: 6px; align-items: center; }
.will .ui-icon { color: var(--color-ink-file); }
.colstrip { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.cs-say { font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); margin-inline-end: 4px; }
.cs { display: inline-flex; gap: 8px; align-items: baseline; padding: 4px 10px; border: 0; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-rule-strong); font-size: var(--text-sm); color: var(--color-ink-2); cursor: pointer; }
.cs span { display: inline-flex; gap: 3px; align-items: center; }
.cs b { color: var(--color-ink-file); font-variant-numeric: tabular-nums; }
.look-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.find { display: flex; align-items: center; gap: 8px; min-block-size: 40px; padding-inline: 12px 6px; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-control-edge); color: var(--color-ink-3); flex: 0 1 300px; min-inline-size: 180px; }
.find input { all: unset; flex: 1; min-inline-size: 0; color: var(--color-ink); }
.nosup { font-size: var(--text-sm); color: var(--color-ink-3); }
.showing { margin-inline-start: auto; font-size: var(--text-sm); color: var(--color-ink-2); }
.lines { border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); overflow: hidden; }
.lgroup { padding: 8px 16px; background: var(--color-plate-tint); font-size: var(--text-sm); color: var(--color-ink-2); }
.ln { display: grid; grid-template-columns: 28px 36px minmax(0, 1fr); gap: 0 6px; align-items: start; padding: 10px 16px 10px 10px; border-block-end: 1px solid var(--color-rule); }
.gut { display: grid; place-items: center; block-size: 32px; color: var(--color-ink-3); }

.applyp { display: grid; gap: 12px; padding: 22px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); margin-block-start: 10px; max-inline-size: 920px; box-sizing: border-box; }
.applyp h2 { font-size: var(--text-3xl); }
.ap-list li { display: grid; grid-template-columns: minmax(180px, 220px) 1fr; gap: 4px 16px; padding-block: 8px; border-block-end: 1px solid var(--color-rule); color: var(--color-ink-2); }
.ap-list b { color: var(--color-ink); }
.ap-q { display: flex; gap: 10px; color: var(--color-ink-2); font-size: var(--text-sm); }
.ap-q .ui-icon { color: var(--color-ink-file); flex: none; margin-block-start: 2px; }
.ap-undo { color: var(--color-ink-3); font-size: var(--text-sm); }
.ap-act { max-inline-size: 360px; }
.after { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding: 14px 18px; margin-block-start: 16px; border-radius: var(--radius-plate); background: var(--water-deep); color: var(--color-white); box-shadow: var(--shadow-plate); box-sizing: border-box; }
.after p { flex: 1 1 420px; }
.after-mark { color: var(--color-leaf-300, var(--color-white)); display: inline-flex; }
.after-acts { display: flex; gap: 6px; flex-wrap: wrap; }
.after .ui-button[data-intent='quiet'] { color: var(--color-white); }

.days { padding-block: 18px 6px; }
.days-head h2 { font-size: var(--text-4xl); line-height: 1.1; }
.cmp { display: grid; gap: 12px; padding: 20px; margin-block-start: 12px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); box-sizing: border-box; }
.cmp-head h3 { font-size: var(--text-2xl); }
.cmp-head p { color: var(--color-ink-2); }
.cmp-r { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1.2fr); gap: 4px 18px; align-items: center; padding-block: 10px; border-block-end: 1px solid var(--color-rule); }
.cmp-r [role='rowheader'] { display: flex; gap: 8px; align-items: center; }
.cmp-r [role='rowheader'] .ui-icon { color: var(--color-ink-file); }
.cmp-r small { display: block; font-size: var(--text-xs); color: var(--color-ink-3); }
.cmp-h { font-size: var(--text-sm); font-weight: 700; color: var(--color-ink-2); }
.cmp-h span { display: flex; gap: 6px; align-items: center; }
.cmp-diff { font-weight: 700; color: var(--color-ink); }
.cmp-q { color: var(--color-ink-2); font-size: var(--text-sm); }
.cmp-acts { display: flex; flex-wrap: wrap; gap: 6px; }
.plate { padding: 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); box-sizing: border-box; }
.days-list { margin-block-start: 12px; }
.days-list h3 { font-size: var(--text-xl); margin-block-end: 8px; }
.dl li { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 16px; padding-block: 10px; border-block-end: 1px solid var(--color-rule); }
.dl-day { font-weight: 800; color: var(--color-ink-file); }
.dl-w small { display: block; color: var(--color-ink-3); font-size: var(--text-sm); }
.card.wide { max-inline-size: 980px; }
.map1 { display: grid; grid-template-columns: 90px minmax(0, 1fr) 20px minmax(0, 1fr) minmax(0, 1.2fr); gap: 8px 12px; align-items: center; padding-block: 6px; border-block-end: 1px solid var(--color-rule); }
.sel { display: inline-flex; align-items: center; justify-content: space-between; gap: 6px; min-block-size: 40px; padding-inline: 12px 8px; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 2px var(--color-accent); font-weight: 700; }

/* ---- reflow ---- */
@media (min-width: 1600px) {
  .cards { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .ln-w .figs { gap: 4px 22px; }
}
@media (max-width: 1199px) {
  .cards { grid-template-columns: 1fr 1fr; }
  .cards .card:nth-child(3) { grid-column: 1 / -1; }
  .cmp-r { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr); }
  .cmp-r > :nth-child(4) { grid-column: 2 / -1; font-size: var(--text-sm); }
  .cmp-h > :nth-child(4) { display: none; }
}
@media (max-width: 899px) {
  .steps li a { flex-direction: column; align-items: start; gap: 4px; padding: 8px 10px; }
  .st-w small { display: none; }
  .cards { grid-template-columns: 1fr; }
  .sw { grid-template-columns: minmax(0, 1fr) auto; }
  .sw .seg2 { grid-column: 1 / -1; justify-self: start; }
  .map1 { grid-template-columns: 70px minmax(0, 1fr); }
  .map1 > .mv-arrow { display: none; }
  .map1 > .quiet { grid-column: 1 / -1; }
  .dock-next { display: none; }
}
@media (max-width: 599px) {
  .bhead { padding-block: 4px 4px; }
  .bfile span, .bagainst .code { display: none; }
  .bfile b { font-size: var(--text-lg); }
  .bagainst { font-size: var(--text-xs); }
  .steps { top: 0; padding-block: 6px; }
  .steps li a { padding: 6px 8px; min-block-size: 48px; flex-direction: row; gap: 6px; }
  .steps li:not([aria-current]) .st-w { display: none; }
  .steps ol { grid-template-columns: auto 1fr auto auto; }
  .steps li a { border: 0; }
  .g-head h2 { font-size: var(--text-xl); }
  .g-n { font-size: var(--text-3xl); }
  .done-group .dg-acts { inline-size: 100%; }
  .cand { grid-template-columns: 1fr; grid-template-areas: 'code' 'w' 'acts'; min-block-size: 44px; }
  .pill { min-block-size: 44px; }
  .seg2 [role='radio'] { min-block-size: 44px; }
  .sw { grid-template-columns: 1fr; padding: 12px; }
  .sw-sell { justify-items: start; }
  .dock-in { padding: 6px 6px 6px 12px; }
  .dock-tally { display: none; }
  .dock-act { inline-size: auto; flex: 1 1 auto; max-inline-size: 220px; }
  .dw { display: none; }
  .dock .ui-button[data-intent='act'] { min-block-size: 44px; font-size: var(--text-base); padding-inline: 14px 6px; }
  .will { margin-inline-start: 0; inline-size: 100%; }
  .tabs [role='tab'] { flex: 1 1 auto; padding-inline: 10px; font-size: var(--text-sm); }
  .colstrip { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; padding-block-end: 2px; }
  .cs { flex: none; }
  .find { flex: 1 1 100%; min-block-size: 44px; }
  .find .ui-kbd { display: none; }
  .ln { grid-template-columns: 22px 44px minmax(0, 1fr); padding-inline: 6px 12px; }
  .applyp { padding: 16px; }
  .applyp h2 { font-size: var(--text-2xl); }
  .ap-list li { grid-template-columns: 1fr; }
  .cmp { padding: 14px; }
  .cmp-r { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr); gap: 4px 10px; font-size: var(--text-sm); }
  .cmp-h span .ui-icon { display: none; }
  .dl li { grid-template-columns: 1fr; gap: 2px; }
  .days-head h2 { font-size: var(--text-2xl); }
  .after-acts .ui-button, .card-foot .door, .cmp-acts .ui-button { min-block-size: 44px; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .bhead { display: none; }
  .steps { top: 0; padding-block: 4px; }
  .steps li a { min-block-size: 40px; padding-block: 4px; flex-direction: row; align-items: center; }
  .st-w small { display: none; }
  .dock-tally { display: none; }
  .dock-in { padding: 4px 4px 4px 12px; }
  .dock .ui-button[data-intent='act'] { min-block-size: 44px; }
}
`

const notes = `
<section class="notes" aria-label="The board’s notes">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Direction B · the shelf, round 2</span><h2>Settle, then look</h2></div>
  <p><b>The screen’s one job</b> (docs/SCREENS.md row 146): see every change a new Master Price File would make before anything is written, and write the ones Northside keeps as one step with one way back.</p>
  <p><b>What this screen does that no other does.</b> It is the only screen that asks a person to vouch for a file someone else wrote. So it asks for exactly the judgements only a person can make, first, and nothing more: of ${n(C.changes + C.cannot)} lines, ${PERSON.length} to place and ${CHECK.length} to look at. Apply never carries a line nobody placed, and the paste door and the file door share the same Settle.</p>
  <p><b>The order and grouping.</b> Problems → preview → act, in four steps that are URL positions (<code>?step=settle</code>). Grouped by <i>what the person decides</i> (place it, keep it, read a heading), not by list or by column. A is one flat register; C reads columns before lines.</p>

  <div class="cols">
    <div><h3>Two references no earlier board used</h3><ul class="dash">
      <li><b>OpenRefine, reconciliation</b> (${REF('live/openrefine-reconcile-hover.png')}, ${REF('live/openrefine-reconcile-ambiguous.png')}): an ambiguous cell left where it is with its candidates listed under it, and Match this Cell · Match All Identical Cells. Taken: the card of candidates, “This one”, and “Every line with this name”. Its scores are not taken: the workbook’s own Code is the only evidence here, and where it names a line the card does not appear at all.</li>
      <li><b>Airtable, CSV import</b> (${REF('live/airtable-csv-mapping.png')}): a toggle per field and “74 records will be created” said at the head and again beside Save. Taken: “will be updated · will be created” said at the head of Look and by a glyph in every gutter, and the heading mapped by pointing.</li>
    </ul>
    <p>Also drawn on: OneDrive’s restore, “All changes after … will be rolled back”, with a bar per day (${REF('live/onedrive-restore.png')}) for the day-by-day record; DockMaster’s “this routine only calculates” and its call for a backup first (${REF('live/dockmaster-price-factor.png')}) for the save offered after Apply.</p></div>
    <div><h3>The figures, all measured</h3><ul class="dash">
      <li>Of the ${C.cannot} lines that can’t be placed, the workbook’s own Code names exactly one line here for ${NAMED_BY_CODE}, Code and Supplier together for ${NAMED_BY_BOTH} more. Measured by merging each such line against that one line alone through the engine’s own <code>mergeLines</code>: ${NAMED_MOVING.length} add a change, ${NAMED.length - NAMED_MOVING.length} already read exactly so. That is why Apply reads ${n(PLAN)}: ${n(C.changes)} − 1 left out + ${NAMED_MOVING.length} placed.</li>
      <li>The ${PERSON.length} that need a person, by why: ${PERSON_WHY['code-on-neither']} Code on neither line (Highfield’s covers, sundecks and the SP360 boat cover, each carried twice in the workbook under an old and a new code), ${PERSON_WHY['same-row-twice']} two lines that are one line twice, ${PERSON_WHY['said-twice']} said twice.</li>
      <li>Dealer Fit’s first line, the GME GX700W radio, moves ${D.lines[0].cells.length} figures, named on the board in state 3.</li>
    </ul></div>
  </div>

  ${jobsTable([
    [
      'A1 Bring in the .xlsx',
      'The head and step 1, Read, done: the file, its size, the day it was saved here, the read time and the price list it was read against.',
    ],
    [
      'A2 See what moves first',
      'The step strip’s counts; Look’s “will be updated · will be created” and its column strip.',
    ],
    [
      'A3 The price that jumped',
      `Settle: the ${CHECK.length}, each Keep or Leave out, with “${LOOKED} of ${CHECK.length} looked at”.`,
    ],
    [
      'A4 One list in full',
      'Look: a tab per list; every column that moves is named and counted, and every line names its own figures (states 2 and 3).',
    ],
    ['A5 Find a product or supplier', 'Look: the find and the Supplier chip (state 2, IBC).'],
    [
      'A6 Settle the 61',
      `Settle: ${NAMED.length} placed by Code in one act, with Put them back; ${PERSON.length} as cards with This one, Every line with this name, Leave it out.`,
    ],
    ['A7 Apply and Undo', 'The dock, at every step and size; step 4 restates it with its Undo.'],
    ['A8 Apply part of a file', 'Leave out, in Settle; the tick on every line in Look.'],
    [
      'A9 Paste the workbook’s own lines',
      'State 6: the heading is one more thing to settle, pointed at in place.',
    ],
    ['A10 A wrong file', 'Unchanged: the refusal stays where the file was dropped, in step 1.'],
    [
      'A11 Which price list, and what came before',
      'State 5: the price list’s edition at the head and the record day by day.',
    ],
    ['A12 Clear back to the file', 'Unchanged, below the record.'],
    [
      'S1 to S4 The copy',
      'State 4 offers the save after Apply; state 5 sets a copy beside this computer, kind by kind, with what Replace would do.',
    ],
    [
      'Salesperson',
      'Step 4 names the quotes being written that Apply would move; on this computer none, and it says so.',
    ],
    [
      'Missing: every figure named',
      'Look names every moved figure in the line and every moved column in the strip.',
    ],
    [
      'Missing: a working tool',
      'Steps as positions, find, supplier, kind, a virtualised list, the dock pinned.',
    ],
    ['Missing: leave a line out', 'Leave out, and the tick.'],
    ['Missing: settle a line', 'Cards.'],
    ['Missing: edition and ledger', 'State 5.'],
    ['Missing: drafts a file moves', 'Step 4.'],
  ])}

  <div class="cols">
    <div><h3>How it reflows</h3><ul class="dash">
      <li><b>390 × 844</b>: the step strip is four discs with only the current step named, “2 Settle”; the cards stack, each candidate a full-width choice of 44 px or more; Keep / Leave out is a 44 px pair under the figures; the dock above the bar is “Step 2 of 4” and Apply.</li>
      <li><b>844 × 390</b>: the head goes; the strip and the dock are the only chrome, one line each.</li>
      <li><b>834 × 1112</b>: two cards a row, the third full; the strip keeps its words without their counts.</li>
      <li><b>1280 and 1440</b>: three cards a row; Look’s figures flow in a line under each name.</li>
      <li><b>1920</b>: the frame grows to 1,720 px and the figure flow spreads; a card is never set beside a detail of itself.</li>
    </ul></div>
    <div><h3>Type, motion, keys</h3>
    <div class="specimen">
      <div><span>group 22 700 / count 30 800</span><b style="font-size:var(--text-2xl)"><span style="font-size:var(--text-4xl);color:var(--color-ochre-600)">14</span> only you can place</b></div>
      <div><span>card name 16/1.3 650</span><span style="font-size:var(--text-lg);font-weight:650">Boat Cover - SP360</span></div>
      <div><span>candidate code 13 mono</span><span class="code" style="font-size:var(--text-sm);color:var(--color-ink)">HFI-COV-HEE459</span></div>
      <div><span>figure flow 13</span><span>${moved('$1,640', '$1,540')}</span></div>
    </div>
    <ul class="dash">
      <li><b>Motion.</b> A step change cross-fades the body in the route duration and the strip’s current mark slides along it; a placed card folds to its one-line summary over the open duration, and the next card rises into its place. Reduced motion: the body swaps, the card is replaced by its summary, nothing slides.</li>
      <li><b>Keys.</b> Tab: the strip, the current step’s groups in order, the dock. In a card, arrows choose a candidate and Enter takes it; in Look, <code>/</code> finds and Space ticks.</li>
    </ul></div>
  </div>

  <div class="cols">
    <div><h3>The honest constraints</h3><ul class="dash">
      <li>A suggestion is the workbook’s own Code, never a likeness score; where the Code names nothing, the card says so and offers no guess.</li>
      <li>Cost shows because the shelf is never a customer surface, with the lock of Northside’s own on cost columns by the app’s rule, widened here to Dealer Fit’s GP and the CTDs it misses.</li>
      <li>No quote, customer, rule, setting or picture exists on either computer, so the compare says 0 on both sides and draws nothing else.</li>
      <li>The day-by-day record and the copy’s edition need records of their own: a schema change.</li>
    </ul></div>
    <div><h3>The mark, and what a dealer replaces</h3><ul class="dash">
      <li>The mark stays in the bar. The after-Apply band is Northside’s own water (the accent’s deep tone), the one place this flow is allowed a colour moment, because it is where the next safe act is offered.</li>
      <li>A dealer’s accent sets the current step, the chosen candidate and the band; the counts of what needs a person are ochre, a token. Nothing depends on a photograph.</li>
    </ul></div>
  </div>
</div>
</section>`

export const html = page({
  title: 'Shelf B · Settle, then look',
  id: 'b',
  css,
  body: state1 + state2 + state3 + state4 + state5 + state6,
  notes,
})
