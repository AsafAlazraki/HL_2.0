/* BOARD A — "One working table". The change set is one register: a census you can press, a
   find and four filters, one table whose columns are the columns that moved, a tick on every
   line, and a dock that counts the ticks and applies them. Order: census → filter → lines → act. */
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
  colName,
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
  PICTURED,
} from './facts.mjs'

const IN = applyCount({ leftOut: 1 })
const ALL = C.changes + C.cannot

/* the columns a filtered set moved, ordered by how many of its lines moved them */
function columnsOf(lines, list, { min = 0 } = {}) {
  const m = new Map()
  for (const a of lines) for (const c of a.cells) m.set(c.fieldId, (m.get(c.fieldId) ?? 0) + 1)
  const order = list.census.map((c) => c.fieldId)
  return [...m.entries()]
    .filter(([, k]) => k / lines.length >= min)
    .sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([fieldId, k]) => {
      const c = list.census.find((x) => x.fieldId === fieldId)
      return { fieldId, col: c.col, type: c.type, lines: k, ...colName(fieldId, c.col) }
    })
}

const where = (a, list) =>
  `${list === D ? 'Dealer Fit Module' : 'Parts Maintenance'}, line ${n(a.at)}`

const cell = (a, c) => {
  const x = a.cells.find((k) => k.fieldId === c.fieldId)
  if (!x) return `<span class="same" aria-label="not moved">·</span>`
  const up = Number(x.now) > Number(x.was)
  const down = Number(x.now) < Number(x.was)
  const p =
    typeof x.was === 'number' && typeof x.now === 'number' && x.was
      ? Math.round(((x.now - x.was) / x.was) * 100)
      : null
  return `<span class="cellmv">${moved(fig(c.col, x.from), fig(c.col, x.to))}${c.fieldId === 'parts.l' || c.fieldId === 'dealer_fit.r' ? (p === null ? '' : `<span class="dir ${up ? 'up' : down ? 'down' : ''}">${pct(p)}</span>`) : ''}</span>`
}

const headCell = (c) =>
  `<span class="th-col" role="columnheader">${c.top ? `<small>${c.top}</small>` : ''}<span class="th-name">${(c.type === 'number' && isCost(c.col)) || CTD_LIKE(c.col) ? `<span class="own" title="Northside’s own">${ic('LockSimple')}<span class="sr">Northside’s own</span></span>` : ''}${esc(c.name)}</span><span class="th-n">${n(c.lines)}</span></span>`

/* A LINE OF THE TABLE. On a desk a row; under 1200px a card that names each moved figure. */
function row(a, list, cols, { out = false, rest = [] } = {}) {
  const others = a.cells.filter((x) => !cols.some((c) => c.fieldId === x.fieldId))
  const restSaid = others.length
    ? `<p class="others">${others.map((x) => `<span>${esc(colLabel(x.fieldId, x.col))} ${moved(fig(x.col, x.from), fig(x.col, x.to))}</span>`).join('')}</p>`
    : ''
  return `<div class="tr${out ? ' out' : ''}" role="row">
    <span class="td-tick" role="cell">${tick(out ? 'out' : 'in', `Include ${a.name}`)}</span>
    <span class="td-line" role="rowheader"><b class="nm">${esc(a.name)}</b><span class="meta">${a.supplier ? `<span>${esc(a.supplier)}</span>` : ''}${a.code ? `<span class="code">${esc(a.code)}</span>` : ''}<span>${where(a, list)}</span>${out ? '<span class="left">Left out</span>' : ''}</span>${restSaid}</span>
    ${cols.map((c) => `<span class="td" role="cell" data-col="${esc(colLabel(c.fieldId, c.col))}${(c.type === 'number' && isCost(c.col)) || CTD_LIKE(c.col) ? ' · own' : ''}">${cell(a, c)}</span>`).join('')}
  </div>`
}

function table(lines, list, cols, { caption, group, outAt = [], foot } = {}) {
  return `<div class="tbl" role="table" aria-label="${esc(caption)}" style="--cols:${cols.length}">
    <div class="tr th" role="row">
      <span class="td-tick" role="columnheader">${tick(outAt.length ? 'some' : 'in', 'Every line shown')}</span>
      <span class="td-line" role="columnheader">Line<small class="own-key">${ic('LockSimple')} Northside’s own: cost and margin</small></span>
      ${cols.map(headCell).join('')}
    </div>
    ${group ? `<div class="tgroup" role="row"><span role="cell">${group}</span></div>` : ''}
    ${lines.map((a) => row(a, list, cols, { out: outAt.includes(a.at) })).join('')}
    ${foot ? `<p class="tfoot">${foot}</p>` : ''}
  </div>`
}

/* ---------------- STATE 1: supplier IBC found ---------------- */
const ibcCols = columnsOf(IBC, P)
const tiles = () => `
<section class="tiles frame" aria-label="What the workbook would do">
  <button type="button" class="tile" data-kind="change"><span class="tile-n">${n(C.changing)}</span><span class="tile-w">lines change</span><span class="tile-s">${n(P.changing)} Parts · ${n(D.changing)} Dealer Fit</span></button>
  <button type="button" class="tile" data-kind="new"><span class="tile-n">${n(C.adding)}</span><span class="tile-w">new lines</span><span class="tile-s">${n(P.adding)} Parts · ${n(D.adding)} Dealer Fit</span></button>
  <button type="button" class="tile" data-kind="cannot"><span class="tile-n">${n(C.cannot)}</span><span class="tile-w">can’t be placed</span><span class="tile-s">${NAMED.length} named by their own Code</span></button>
  <button type="button" class="tile" data-kind="swing"><span class="tile-n">${CHECK.length}</span><span class="tile-w">doubled or halved</span><span class="tile-s">1 left out</span></button>
  <div class="tile still"><span class="tile-n">${n(C.unmoved)}</span><span class="tile-w"><span class="long">of ${n(C.total)} stay exactly as they are</span><span class="short">unmoved</span></span><span class="tile-bar" aria-hidden="true"><i style="inline-size:${((C.unmoved / C.total) * 100).toFixed(1)}%"></i></span></div>
</section>`

const tools = ({
  found = '',
  list = 'All lists',
  listN = 2,
  supplier,
  kind = 'All',
  count,
  of = ALL,
  swing = false,
}) => `
<div class="tools" role="search">
  <div class="tools-in frame">
    <label class="find"><span class="sr">Find a line by name or code</span>${ic('MagnifyingGlass')}<input value="${esc(found)}" placeholder="Find a name or code">${kbd('/')}</label>
    <div class="facets">
      ${chip(list, { icon: 'Stack', count: list === 'All lists' ? listN : undefined, pressed: list !== 'All lists' })}
      ${chip(supplier ? `Supplier ${supplier}` : `Supplier`, { icon: 'Truck', pressed: Boolean(supplier), count: supplier ? undefined : SUPPLIER_COUNT })}
      <span class="seg" role="radiogroup" aria-label="Kind">${['All', 'Higher', 'Lower', 'New', 'Can’t place', 'Other figures only'].map((k) => `<span role="radio" aria-checked="${k === kind}" tabindex="${k === kind ? 0 : -1}">${k}</span>`).join('')}</span>
      ${chip(swing ? 'Swing 2× or more' : 'Swing', { icon: 'ArrowsDownUp', pressed: swing })}
    </div>
    <p class="showing"><b>${n(count)}</b> of ${n(of)} lines ${count !== of ? `<a class="door" href="#">Clear</a>` : ''}</p>
    <button type="button" class="filters-1">${ic('Funnel')}Filters<span class="ui-chip-count">${[list !== 'All lists', supplier, kind !== 'All', swing].filter(Boolean).length}</span></button>
  </div>
</div>`

const dock = ({
  inCount = IN,
  left = 'Dee Shackle (Forged) w Captive Bolt 6mm',
  outN = 1,
  cannot = C.cannot,
} = {}) => `
<footer class="dock" aria-label="Apply">
  <div class="dock-in frame">
    <p class="dock-say">${tick('some', 'Every change')}<span><b>${n(inCount)} of ${n(inCount + outN)}</b><span class="dock-word"> changes</span> in<span class="dock-more"> · ${outN} left out: ${esc(left)} · ${n(cannot)} can’t be placed and stay out</span></span></p>
    <p class="dock-undo">Undo puts all ${n(inCount)} back in one step. A quote already given never moves.</p>
    ${btn(`Apply ${n(inCount)}<span class="dock-word">&nbsp;changes</span>`, { intent: 'act', icon: 'ArrowRight', cls: 'dock-act' })}
  </div>
</footer>`

const head = () => `
<header class="head frame">
  <span class="xls" aria-hidden="true">${ic('FileXls', { size: 'lg', weight: 'duotone' })}</span>
  <div class="head-words">
    <p class="eyebrow">A new price file · nothing is written until you apply</p>
    <h1>${esc(FILE.name)}</h1>
    <p class="head-meta"><span>${FILE.size}</span><span>saved on this computer ${FILE.saved}</span><span>read in ${FILE.read}</span><span>against the <b>Price list of ${EDITION.day}</b> <span class="code">${EDITION.fp}</span></span></p>
  </div>
  <div class="head-acts">${btn('Paste lines instead', { intent: 'quiet', icon: 'ClipboardText' })}${btn('Put the workbook down', { intent: 'quiet', icon: 'X' })}</div>
</header>`

const state1 = `
<main class="sheet" id="s1">
  ${head()}
  ${tiles()}
  ${tools({ supplier: 'IBC', count: IBC.length })}
  <section class="frame body">
    ${table(IBC.slice(0, 16), P, ibcCols, {
      caption: 'Lines from supplier IBC',
      group: `<b>${esc(IBC[0].cat)}</b> · ${IBC.length} lines · all ${IBC.length} lower at Sell · every one on Parts &amp; Accessories`,
      foot: `Lines 17 to ${IBC.length} follow as the table scrolls. Nothing pages: the table holds every line it is filtered to, ${n(P.lines.length)} at most on Parts, drawn as it comes into view.`,
    })}
  </section>
  ${dock()}
</main>`

/* ---------------- STATE 2: Dealer Fit, every column named ---------------- */
const dfLines = D.lines.slice(0, 9)
const dfCols = columnsOf(
  D.lines.filter((a) => a.fate === 'change'),
  D,
  { min: 0.1 },
)
const dfRare = D.census.filter((c) => !dfCols.some((x) => x.fieldId === c.fieldId))
const state2 = `
${stateHead(2, '/shelf?see=changes&list=dealer_fit', `Dealer Fit Packages pressed in the list filter. Its ${dfCols.length} columns that moved on 1 line in 10 or more each get a column, ordered by how many lines moved them; the ${dfRare.length} that moved on fewer (${dfRare.map((c) => `${colLabel(c.fieldId, c.col)} ${n(c.lines)}`).join(', ')}) are named in the line itself, so no figure is ever “other”.`)}
<main class="sheet">
  ${tools({ list: 'Dealer Fit Packages', count: D.changing + D.adding + D.cannot })}
  <section class="frame body">
    ${table(dfLines, D, dfCols, {
      caption: 'Dealer Fit Packages',
      group: `<b>Dealer Fit Packages</b> · ${n(D.changing)} change · ${n(D.adding)} new · ${n(D.cannot)} can’t be placed · no price a quote reads is declared on this list, so no column leads`,
    })}
  </section>
</main>`

/* ---------------- STATE 3: the 61, settled in the table ---------------- */
const pick = [
  CANNOT.find((c) => /^Battery, Lithium 24v/.test(c.name)),
  CANNOT.find((c) => c.name === 'WR10 Remote Only' && c.namedBy === 'code+supplier'),
  CANNOT.find((c) => c.name === 'Boat Cover - SP360' && !c.namedBy),
  CANNOT.find((c) => /^Yamaha Trailer Support/.test(c.name)),
  CANNOT.find((c) => c.tableId === 'dealer_fit' && !c.namedBy),
]
const WHY = {
  code: (c) =>
    `The workbook’s own Code, <span class="code">${esc(c.fileCode)}</span>, is on one of them.`,
  'code+supplier': (c) =>
    `Both rows carry Code <span class="code">${esc(c.fileCode)}</span>; the workbook’s Supplier, ${esc(c.fileSupplier)}, is on one of them.`,
  'code-on-neither': (c) =>
    `The workbook’s Code, <span class="code">${esc(c.fileCode)}</span>, is on neither row, so only you can say.`,
  'same-row-twice': () =>
    `The two rows are the same line twice, Code and price alike. Either is right; Review can fold them into one.`,
  'said-twice': () => `An earlier line of the workbook already named this row.`,
}
const settleRow = (c) => {
  const why = c.namedBy ?? personWhy(c)
  const named = c.namedRow
  const pic = pictureOf(c.candidates[0]?.id)
  return `<div class="settle" role="row">
    <div class="settle-line">
      ${pic && c.name === 'WR10 Remote Only' ? `<img class="thumb" src="${pic.src}" width="56" height="56" alt="">` : ''}
      <div><b class="nm">${esc(c.name)}</b><span class="meta"><span>${esc(c.list)}</span>${c.fileSupplier ? `<span>${esc(c.fileSupplier)}</span>` : ''}<span class="code">${esc(c.fileCode || 'no Code')}</span><span>${c.tableId === 'dealer_fit' ? 'Dealer Fit Module' : 'Parts Maintenance'}, line ${n(c.at)}</span></span>
      <p class="why">${c.candidates.length} lines here share this name. ${WHY[why](c)}</p></div>
    </div>
    <div class="cands" role="radiogroup" aria-label="Which line it means">
      ${c.candidates.map((x) => `<label class="cand${x.id === named ? ' on' : ''}"><input type="radio" name="c${c.at}${c.tableId}" ${x.id === named ? 'checked' : ''}><span><b>${esc(x.code || '—')}</b>${x.supplier ? ` · ${esc(x.supplier)}` : ''} · ${money(x.sell)}<small>${esc(x.src.replace('!R', ', line '))} when packed${x.id === named ? ' · the Code says this one' : ''}</small></span></label>`).join('')}
      <label class="cand"><input type="radio" name="c${c.at}${c.tableId}" ${named ? '' : 'checked'}><span><b>Leave it out</b><small>${named ? 'it stays out of this apply' : 'it stays out until you choose'}</small></span></label>
    </div>
    ${
      named
        ? `<p class="settle-adds">${
            c.wouldChange.length
              ? `Placed, it changes ${c.wouldChange.length}: ${c.wouldChange
                  .slice(0, 3)
                  .map((x) => `${esc(x.col)} ${moved(fig(x.col, x.from), fig(x.col, x.to))}`)
                  .join(
                    ' · ',
                  )}${c.wouldChange.length > 3 ? ` and ${c.wouldChange.length - 3} more` : ''}`
              : 'Placed, it changes nothing: that row already reads exactly so.'
          }</p>`
        : `<p class="settle-adds"><a class="door" href="#">Every line with this name ${ic('ArrowRight')}</a></p>`
    }
  </div>`
}
const state3 = `
${stateHead(3, '/shelf?see=changes&kind=cannot', `Can’t place pressed. The ${C.cannot} lines stay in workbook order, each with the rows that share its name offered in the line. Measured on this file: the workbook’s own Code names exactly one row for ${NAMED_BY_CODE} of the ${C.cannot}, Code and Supplier together for ${NAMED_BY_BOTH} more, so ${NAMED.length} of ${C.cannot} come with a suggestion that one press takes; ${PERSON.length} need a person.`)}
<main class="sheet">
  ${tools({ kind: 'Can’t place', count: C.cannot })}
  <section class="frame body">
    <div class="bulk">
      <p><b>${NAMED.length} of ${C.cannot}</b> are named by the workbook’s own Code${NAMED_BY_BOTH ? ` (${NAMED_BY_BOTH} with its Supplier)` : ''}. Placing them adds <b>${NAMED_MOVING.length} changes</b> (${NAMED_FIGURES} figures); the other ${NAMED.length - NAMED_MOVING.length} already read exactly so. ${PERSON.length} are yours to choose: ${PERSON_WHY['code-on-neither']} whose Code is on neither row, ${PERSON_WHY['same-row-twice']} where the two rows are one line twice, ${PERSON_WHY['said-twice']} said twice in the workbook.</p>
      ${btn(`Place the ${NAMED.length} the Code names`, { intent: 'secondary', icon: 'Crosshair' })}
    </div>
    <div class="settles" role="table" aria-label="Lines that can’t be placed">${pick.map(settleRow).join('')}</div>
  </section>
</main>`

/* ---------------- STATE 4: the 25, one held back ---------------- */
const swingCols = columnsOf(CHECK, P)
  .filter((c) => c.type === 'number')
  .slice(0, 5)
const state4 = `
${stateHead(4, '/shelf?see=changes&swing=2', `Swing pressed: the ${CHECK.length} lines whose Sell doubled or more, or halved or less (the engine’s rule, a ratio of 2 either way). The Dee Shackle, ${money(DEE.from)} to ${money(DEE.to)}, is ticked out with Space: the dock now counts ${n(IN)} of ${n(C.changes)} and Apply writes the ${n(IN)} as one step with one Undo.`)}
<main class="sheet">
  ${tools({ count: CHECK.length, swing: true })}
  <section class="frame body">
    ${table(CHECK.slice(0, 9), P, swingCols, { caption: 'Lines whose Sell doubled or halved', outAt: [DEE.at] })}
  </section>
  ${dock()}
</main>`

/* ---------------- STATE 5: the shelf at rest, deepened ---------------- */
const KINDS = [
  ['FileText', 'Quotes', 0, '0 given · 0 being written'],
  ['Users', 'Customers', 0, 'the people Northside sells to'],
  ['Scales', 'Rules Northside wrote', 0, 'none yet'],
  ['Sliders', 'Settings', 0, 'none set yet'],
  ['Image', 'Pictures Northside chose', 0, 'none chosen yet'],
  ['Database', 'The price list', EDITION.lines, `${EDITION.lists} lists`],
]
const state5 = `
${stateHead(5, '/shelf', `The rest page, deepened rather than redrawn. Its first line now says which price list this computer holds, and a ledger keeps every file brought in (a record of its own: a schema change, because catalogue events are not kept today). The ledger’s two rows are the only two true ones on this computer: the price list as packed, and the workbook just read.`)}
<main class="rest">
  <section class="edition frame">
    <div class="ed-words">
      <p class="eyebrow">The shelf · this computer holds</p>
      <h2>The price list of ${EDITION.day}</h2>
      <p class="ed-meta"><span>${EDITION.lists} lists</span><span>${n(EDITION.lines)} lines</span><span>fingerprint <span class="code">${EDITION.fp}</span></span><span>no file applied since</span></p>
    </div>
    <div class="ed-copy"><p><b>No copy saved yet.</b> Nothing of Northside’s could come back on another computer.</p>${btn('Save a copy', { intent: 'act', icon: 'DownloadSimple' })}</div>
  </section>
  <section class="frame plate ledger">
    <header class="plate-head"><h3>Files brought in</h3><p>Every workbook read here, what it would do and what was done with it. The newest first.</p><span class="plate-acts">${btn('Bring in a workbook', { intent: 'secondary', icon: 'FileXls' })}${btn('Paste lines', { intent: 'quiet', icon: 'ClipboardText' })}</span></header>
    <div class="lg" role="table" aria-label="Files brought in">
      <div class="lg-r lg-h" role="row"><span role="columnheader">File</span><span role="columnheader">Read</span><span role="columnheader">Change</span><span role="columnheader">New</span><span role="columnheader">Can’t place</span><span role="columnheader">Now</span><span role="columnheader"><span class="sr">Act</span></span></div>
      <div class="lg-r" role="row"><span role="cell" data-l="File"><b>${esc(FILE.name)}</b><small>${FILE.size} · saved on this computer ${FILE.saved}</small></span><span role="cell" data-l="Read">Today</span><span role="cell" data-l="Change" class="fig">${n(C.changing)}</span><span role="cell" data-l="New" class="fig">${n(C.adding)}</span><span role="cell" data-l="Can’t place" class="fig">${n(C.cannot)}</span><span role="cell" data-l="Now"><span class="pill wait">Read, not applied</span></span><span role="cell">${btn('See the changes', { intent: 'secondary', size: 'sm', icon: 'ArrowRight' })}</span></div>
      <div class="lg-r" role="row"><span role="cell" data-l="File"><b>The Master Price File, as packed</b><small>${EDITION.lists} lists · ${n(EDITION.lines)} lines · <span class="code">${EDITION.fp}</span></small></span><span role="cell" data-l="Read">${EDITION.short}</span><span role="cell" data-l="Change" class="fig">—</span><span role="cell" data-l="New" class="fig">${n(EDITION.lines)}</span><span role="cell" data-l="Can’t place" class="fig">0</span><span role="cell" data-l="Now"><span class="pill held">On this computer</span></span><span role="cell"></span></div>
    </div>
    <p class="drafts">${ic('FileText')}<span><b>No quote is being written on this computer</b>, so no file would move one. A quote being written reads the price list as it is, so when one is, its lines a file would move are counted here before Apply, with the sum each moves by. A quote already given never moves.</span></p>
  </section>
  <section class="frame two">
    <div class="plate">
      <header class="plate-head"><h3>Save a copy</h3><p>Everything Northside would need on a new computer, in one file.</p></header>
      <ul class="kinds">${KINDS.map(([g, k, v, s]) => `<li>${ic(g)}<span><b>${k}</b><small>${s}</small></span><span class="fig">${n(v)}</span></li>`).join('')}</ul>
      <p class="quiet small">The copy is one .json file, handed to the browser to save.</p>
    </div>
    <div class="plate">
      <header class="plate-head"><h3>Bring back a copy</h3><p>Choose a copy and it is set beside this computer, kind by kind, before anything is replaced.</p></header>
      <div class="drop">${ic('UploadSimple', { size: 'md' })}<b>Drop a saved copy here</b>${btn('Choose a copy on this computer', { intent: 'secondary' })}</div>
      <p class="quiet small">A copy’s quote already here is said to be already here, never “joins them”.</p>
    </div>
  </section>
</main>`

/* ---------------- STATE 6: paste, the workbook's own heading pointed at ---------------- */
const pasted = 'CDEFGHIJKLMNOPQRSTUVWXY'.split('')
const LIST_COLS = new Set(
  P.columns.filter((c) => /^parts.[a-z]{1,2}$/.test(c.id)).map((c) => c.name),
)
const letters = Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l, i) => [l, i]))
const mapRows = pasted.map((L) => {
  const h = PARTS_HEAD[letters[L]]
  let to,
    note,
    cls = ''
  if (h === 'Parts & Accessories Module') {
    to = 'Product, the name'
    note = 'you pointed: the workbook’s own heading for its name column'
    cls = 'pointed'
  } else if (h === 'MU' && L === 'H') {
    to = 'Left out'
    note = 'the sheet heads three columns MU (H, J, T); the list reads J'
    cls = 'skip'
  } else if (h === 'MU' && L === 'J') {
    to = 'MU'
    note = 'the one of three the list reads'
  } else if (h === 'MU') {
    to = 'Left out'
    note = 'the third of three MU; the list reads J'
    cls = 'skip'
  } else if (h === 'GP') {
    to = 'Left out'
    note = 'not a column of this list (and headed twice, K and U)'
    cls = 'skip'
  } else if (!LIST_COLS.has(h)) {
    to = 'Left out'
    note = 'not a column of this list'
    cls = 'skip'
  } else {
    to = h
    note = 'the same heading'
  }
  return { L, h, to, note, cls }
})
const state6 = `
${stateHead(6, '/shelf?see=paste', `Paste with the workbook’s own heading row. The judge’s refusal (“No pasted heading reads Product”) becomes a sentence with its act: the heading nobody recognised is pointed at, in place, and the line reads. The paste is the judge’s own: Parts Maintenance line 676, the IBC tube cover, as Parts Module (1) carries it, with the sheet’s heading row 1 over it.`)}
<main class="sheet">
  <section class="frame body paste">
    <header class="plate-head"><h3>Pasted lines · Parts &amp; Accessories</h3><p>Read as the sheet heads them. One heading needed you; it is answered.</p></header>
    <div class="map" role="table" aria-label="Your column, and what it becomes">
      <div class="map-r map-h" role="row"><span role="columnheader">Your column</span><span role="columnheader">Becomes</span><span role="columnheader">Why</span></div>
      ${mapRows.map((r) => `<div class="map-r ${r.cls}" role="row"><span role="cell"><span class="code">${r.L}</span> ${esc(r.h)}</span><span role="cell">${r.cls === 'pointed' ? `<span class="sel">${esc(r.to)}${ic('CaretDown')}</span>` : `<b>${esc(r.to)}</b>`}</span><span role="cell" class="quiet">${r.note}</span></div>`).join('')}
    </div>
    <p class="paste-out"><b>1 line read.</b> Tube Covers to suit PVC Boat - 2.0 Mtr · Sell ${moved('$1,640', '$1,300')} <span class="quiet">(the judge’s measured paste)</span> ${btn('Apply 1 change', { intent: 'secondary', size: 'sm' })}</p>
  </section>
</main>`

const css = `
/* ======== BOARD A ======== */
.sheet { position: relative; }
.head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px 18px; align-items: center; padding-block: 18px 14px; }
.xls { display: grid; place-items: center; inline-size: 52px; block-size: 52px; border-radius: var(--radius-tile); background: var(--color-plate); box-shadow: var(--shadow-plate); color: var(--color-viridian-600); }
.xls .ui-icon { inline-size: 30px; block-size: 30px; }
.head h1 { font-size: var(--text-3xl); line-height: 1.1; letter-spacing: -0.01em; }
.head-meta { display: flex; flex-wrap: wrap; gap: 2px 14px; color: var(--color-ink-2); font-size: var(--text-sm); margin-block-start: 4px; }
.head-meta > span:not(:last-child)::after { content: '·'; margin-inline-start: 14px; color: var(--color-ink-3); }
.tile .short { display: none; }
.head-acts { display: flex; gap: 4px; flex-wrap: wrap; justify-content: end; }

.tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(0, 1.6fr); gap: 10px; padding-block: 4px 14px; }
.tile { all: unset; box-sizing: border-box; display: grid; align-content: start; gap: 2px; padding: 12px 14px; border-radius: var(--radius-tile); background: var(--color-plate); box-shadow: var(--shadow-plate); cursor: pointer; min-inline-size: 0; }
.tile:focus-visible { box-shadow: var(--shadow-focus); }
.tile-n { font-size: var(--text-3xl); font-weight: 800; line-height: 1.05; font-variant-numeric: tabular-nums; }
.tile-w { font-weight: 700; font-size: var(--text-sm); }
.tile-s { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 600; }
.tile[data-kind='change'] .tile-n { color: var(--color-ink-file); }
.tile[data-kind='new'] .tile-n { color: var(--color-leaf-600); }
.tile[data-kind='cannot'] .tile-n { color: var(--color-ochre-600); }
.tile[data-kind='swing'] .tile-n { color: var(--color-carmine-600); }
.tile.still { cursor: default; background: transparent; box-shadow: inset 0 0 0 1px var(--color-rule-strong); }
.tile.still .tile-n { color: var(--color-ink); }
.tile-bar { display: block; block-size: 6px; border-radius: 3px; background: var(--color-ochre-300); margin-block-start: 6px; overflow: hidden; }
.tile-bar i { display: block; block-size: 100%; background: var(--color-blue-600); }

.tools { position: sticky; top: 56px; z-index: 20; background: var(--color-ground); padding-block: 8px; box-shadow: 0 1px 0 var(--color-rule); }
.tools-in { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
.find { display: flex; align-items: center; gap: 8px; min-block-size: 40px; padding-inline: 12px 6px; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-control-edge); color: var(--color-ink-3); flex: 0 1 300px; min-inline-size: 180px; }
.find input { all: unset; flex: 1; min-inline-size: 0; color: var(--color-ink); font-size: var(--text-base); }
.find input::placeholder { color: var(--color-ink-3); }
.facets { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.seg { display: inline-flex; padding: 3px; border-radius: var(--radius-pill); background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule-strong); }
.seg [role='radio'] { padding: 4px 10px; border-radius: var(--radius-pill); font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-2); cursor: pointer; white-space: nowrap; }
.seg [aria-checked='true'] { background: var(--color-accent); color: var(--color-ink-on-accent); }
.showing { margin-inline-start: auto; font-size: var(--text-sm); color: var(--color-ink-2); white-space: nowrap; display: flex; gap: 8px; align-items: center; }
.showing b { color: var(--color-ink); font-size: var(--text-base); }
.filters-1 { display: none; }

.body { padding-block: 12px 24px; }
.tbl { border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); overflow: hidden; }
.tr { display: grid; grid-template-columns: 44px minmax(300px, 2.4fr) repeat(var(--cols), minmax(88px, 1fr)); align-items: center; gap: 0 10px; padding: 8px 14px 8px 8px; border-block-end: 1px solid var(--color-rule); }
.tr.th { position: sticky; top: 0; background: var(--color-plate); align-items: end; padding-block: 10px 8px; border-block-end: 1px solid var(--color-rule-strong); }
.td-line { display: grid; gap: 2px; min-inline-size: 0; }
.nm { font-weight: 650; font-size: var(--text-base); line-height: 1.3; }
.meta { display: flex; flex-wrap: wrap; gap: 0 10px; font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 500; }
.meta .left { color: var(--color-carmine-600); font-weight: 700; }
.others { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: var(--text-xs); color: var(--color-ink-2); }
.others > span { display: inline-flex; gap: 4px; align-items: baseline; }
.th-col { display: grid; gap: 1px; justify-items: end; text-align: end; font-size: var(--text-sm); font-weight: 700; line-height: 1.2; }
.th-col small { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 600; }
.th-name { display: block; }
.th-name .own { display: inline-flex; vertical-align: -1px; margin-inline-end: 3px; }
.th-n { font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-file); }
.td { justify-self: end; text-align: end; font-size: var(--text-sm); }
.cellmv { display: inline-grid; grid-template-columns: auto auto; column-gap: 6px; align-items: end; justify-items: end; }
.cellmv > .dir { grid-column: 2; padding-block-end: 2px; }
.cellmv .mv { display: inline-grid; grid-template-columns: auto auto; column-gap: 4px; justify-items: end; }
.cellmv .mv s { grid-column: 1 / -1; font-size: var(--text-xs); }
.cellmv .mv-arrow { display: none; }
.same { color: var(--color-rule-strong); }
.tgroup { padding: 8px 14px 8px 60px; background: var(--color-plate-tint); font-size: var(--text-sm); color: var(--color-ink-2); border-block-end: 1px solid var(--color-rule); }
.tfoot { padding: 12px 14px 14px 60px; font-size: var(--text-sm); color: var(--color-ink-3); }
.tr.out { background: oklch(from var(--color-carmine-600) l c h / 5%); }
.tr.out .nm, .tr.out .td { opacity: 0.62; }

.dock { position: sticky; bottom: calc(var(--dock-gap) + 8px); z-index: 25; margin-block-start: 8px; }
.dock-in { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(220px, 300px); align-items: center; gap: 6px 18px; padding: 8px 8px 8px 12px; border-radius: var(--radius-plate); background: var(--color-door); backdrop-filter: blur(12px); box-shadow: var(--shadow-md), 0 0 0 1px var(--color-rule); }
.dock-say { display: flex; align-items: center; gap: 6px; font-size: var(--text-sm); color: var(--color-ink-2); min-inline-size: 0; }
.dock-say b { color: var(--color-ink); font-size: var(--text-base); }
.dock-undo { font-size: var(--text-sm); color: var(--color-ink-3); max-inline-size: 34ch; }

/* state 3 */
.bulk { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); margin-block-end: 12px; }
.bulk p { max-inline-size: 90ch; color: var(--color-ink-2); }
.settles { display: grid; gap: 0; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); overflow: hidden; }
.settle { display: grid; grid-template-columns: minmax(280px, 1fr) minmax(0, 1.5fr); gap: 8px 20px; padding: 14px 16px; border-block-end: 1px solid var(--color-rule); }
.settle-line { display: flex; gap: 12px; align-items: start; }
.thumb { inline-size: 56px; block-size: 56px; object-fit: contain; border-radius: var(--radius-xs, 6px); background: var(--color-white); box-shadow: inset 0 0 0 1px var(--color-rule); flex: none; }
.why { font-size: var(--text-sm); color: var(--color-ink-reason); margin-block-start: 4px; }
.cands { display: flex; flex-wrap: wrap; gap: 6px; align-content: start; }
.cand { display: flex; gap: 8px; align-items: start; padding: 8px 12px 8px 10px; border-radius: var(--radius-field); box-shadow: inset 0 0 0 1px var(--color-rule-strong); cursor: pointer; font-size: var(--text-sm); min-block-size: 44px; box-sizing: border-box; }
.cand input { margin: 3px 0 0; accent-color: var(--color-accent); }
.cand small { display: block; font-size: var(--text-xs); color: var(--color-ink-3); }
.cand.on { box-shadow: inset 0 0 0 2px var(--color-accent); background: var(--color-chosen-wash); }
.settle-adds { grid-column: 2; font-size: var(--text-sm); color: var(--color-ink-2); display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; }

/* state 5 */
main.rest { display: grid; gap: 16px; }
.edition { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 380px); gap: 16px 28px; align-items: center; padding-block: 18px 6px; }
.edition h2 { font-size: var(--text-4xl); line-height: 1.1; letter-spacing: -0.01em; }
.ed-meta { display: flex; flex-wrap: wrap; gap: 2px 14px; color: var(--color-ink-2); margin-block-start: 6px; }
.ed-meta > span:not(:last-child)::after { content: '·'; margin-inline-start: 14px; color: var(--color-ink-3); }
.ed-copy { display: grid; gap: 10px; padding: 14px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); }
.ed-copy p { color: var(--color-ink-2); font-size: var(--text-sm); }
.plate { padding: 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); box-sizing: border-box; }
.plate-head { display: flex; flex-wrap: wrap; gap: 4px 14px; align-items: baseline; margin-block-end: 12px; }
.plate-head h3 { font-size: var(--text-xl); }
.plate-head p { color: var(--color-ink-2); font-size: var(--text-sm); flex: 1 1 260px; }
.plate-acts { display: flex; gap: 4px; flex-wrap: wrap; }
.lg { display: grid; }
.lg-r { display: grid; grid-template-columns: minmax(220px, 2.2fr) 0.7fr 0.6fr 0.6fr 0.7fr 1.1fr 190px; gap: 6px 14px; align-items: center; padding-block: 10px; border-block-end: 1px solid var(--color-rule); }
.lg-h { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 700; padding-block: 4px 6px; }
.lg-r > :nth-child(3), .lg-r > :nth-child(4), .lg-r > :nth-child(5) { text-align: end; }
.lg-r > :last-child { justify-self: end; }
.own-key { display: flex; gap: 4px; align-items: center; font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-3); }
.own-key .ui-icon { inline-size: 11px; block-size: 11px; }
.lg-r small { display: block; font-size: var(--text-xs); color: var(--color-ink-3); }
.fig { font-variant-numeric: tabular-nums; }
.pill { display: inline-flex; padding: 2px 10px; border-radius: var(--radius-pill); font-size: var(--text-xs); font-weight: 700; white-space: nowrap; }
.pill.wait { background: var(--color-ask-wash); color: var(--color-ink); }
.pill.held { background: var(--color-chosen-wash); color: var(--color-ink-file); }
.drafts { display: flex; gap: 10px; align-items: start; margin-block-start: 14px; color: var(--color-ink-2); font-size: var(--text-sm); }
.drafts .ui-icon { color: var(--color-ink-file); margin-block-start: 2px; flex: none; }
.two { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 16px; }
.kinds { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
.kinds li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; padding-block: 10px; border-block-end: 1px solid var(--color-rule); }
.kinds li > .ui-icon { color: var(--color-ink-file); }
.kinds small { display: block; font-size: var(--text-xs); color: var(--color-ink-3); }
.kinds .fig { font-weight: 800; font-size: var(--text-lg); }
.small { font-size: var(--text-sm); margin-block-start: 10px; }
.drop { display: grid; justify-items: center; gap: 8px; padding: 22px; border-radius: var(--radius-tile); box-shadow: inset 0 0 0 1.5px var(--color-rule-strong); border: 1px dashed transparent; color: var(--color-ink-file); }
.drop b { color: var(--color-ink); }

/* state 6 */
.paste { max-inline-size: 1180px; }
.map-r > :nth-child(3) { grid-column: 1 / -1; font-size: var(--text-xs); }
.paste.body { padding: 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-plate); }
.map { display: grid; grid-template-columns: 1fr 1fr; column-gap: 28px; }
.map-h { display: none !important; }
.map-r { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); grid-template-rows: auto auto; gap: 6px 14px; align-items: center; padding-block: 7px; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); }
.map-h { font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); }
.map-r.pointed { background: var(--color-chosen-wash); box-shadow: -8px 0 0 var(--color-chosen-wash), 8px 0 0 var(--color-chosen-wash); }
.map-r.skip b { color: var(--color-ink-3); font-weight: 600; }
.sel { display: inline-flex; align-items: center; gap: 6px; min-block-size: 36px; padding-inline: 12px 8px; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 2px var(--color-accent); font-weight: 700; }
.paste-out { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; margin-block-start: 14px; }

/* ---- reflow ---- */
@media (min-width: 1600px) {
  .tr { grid-template-columns: 44px minmax(420px, 2.4fr) repeat(var(--cols), minmax(110px, 1fr)); }
  .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(0, 2fr); }
}
@media (max-width: 1199px) {
  .tr { grid-template-columns: 44px minmax(0, 1fr); padding: 10px 12px 10px 4px; }
  .tr.th { display: none; }
  .tr > .td { grid-column: 2; justify-self: start; text-align: start; display: flex; gap: 8px; align-items: baseline; }
  .tr > .td::before { content: attr(data-col); font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); min-inline-size: 9.5em; }
  .tr > .td:has(.same) { display: none; }
  .cellmv { display: inline-flex; gap: 6px; align-items: baseline; }
  .cellmv .mv { display: inline-flex; }
  .cellmv .mv s { font-size: var(--text-sm); }
  .cellmv .mv-arrow { display: inline-flex; }
  .tgroup, .tfoot { padding-inline-start: 16px; }
  .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .tile.still { grid-column: 1 / -1; }
  .settle { grid-template-columns: 1fr; }
  .settle-adds { grid-column: 1; }
  .lg-r { grid-template-columns: minmax(0, 1fr) auto; }
  .lg-h { display: none; }
  .lg-r > [data-l]:not([data-l='File']):not([data-l='Now']) { display: none; }
  .two { grid-template-columns: 1fr; }
}
@media (max-width: 899px) {
  .head { grid-template-columns: auto minmax(0, 1fr); }
  .head-acts { grid-column: 1 / -1; justify-content: start; }
  .facets .seg, .facets > .ui-chip-frame:last-child { display: none; }
  .dock-in { grid-template-columns: minmax(0, 1fr) minmax(200px, 260px); }
  .dock-undo { display: none; }
  .edition { grid-template-columns: 1fr; }
}
@media (max-width: 599px) {
  .head { padding-block: 6px 10px; gap: 10px 12px; }
  .xls { inline-size: 40px; block-size: 40px; }
  .head h1 { font-size: var(--text-2xl); }
  .head-meta { font-size: var(--text-xs); }
  .head-meta > span::after { content: none !important; }
  .head-meta { column-gap: 10px; }
  .head .eyebrow { display: none; }
  .head-meta > span:nth-child(2) { display: none; }
  .head-acts { gap: 0; margin-inline-start: -10px; }
  .tiles { grid-template-columns: 1fr 1fr; gap: 6px; padding-block-end: 10px; }
  .tile { padding: 8px 10px; grid-template-columns: auto minmax(0, 1fr); column-gap: 8px; align-items: baseline; }
  .tile-n { font-size: var(--text-xl); }
  .tile-s { display: none; }
  .tile.still { grid-column: 1 / -1; }
  .tile.still .tile-bar { grid-column: 1 / -1; }
  .tools { top: 0; }
  .find { flex: 1 1 100%; min-block-size: 44px; }
  .find .ui-kbd { display: none; }
  .facets { display: none; }
  .filters-1 { display: inline-flex; align-items: center; gap: 6px; min-block-size: 44px; padding-inline: 12px; border: 0; border-radius: var(--radius-pill); background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule-strong); font-weight: 600; color: var(--color-ink-2); order: 2; }
  .showing { order: 3; }
  .tr > .td::before { min-inline-size: 7.5em; }
  .dock-in { grid-template-columns: minmax(0, 1fr) auto; padding: 6px 6px 6px 8px; gap: 4px 8px; }
  .dock-more, .dock-word { display: none; }
  .dock-say { font-size: var(--text-sm); }
  .dock .ui-button[data-intent='act'] { min-block-size: 44px; font-size: var(--text-base); padding-inline: 14px 6px; }
  .head-acts .ui-button, .cand, .bulk .ui-button { min-block-size: 44px; }
  .settle-line { flex-direction: row; }
  .kinds { grid-template-columns: 1fr; }
  .map { grid-template-columns: 1fr; }
  .edition h2 { font-size: var(--text-2xl); }
}
@media (max-height: 480px) and (min-width: 600px) {
  .head { padding-block: 4px 6px; }
  .head h1 { font-size: var(--text-xl); }
  .head .eyebrow, .head-acts, .xls { display: none; }
  .head { grid-template-columns: 1fr; }
  .tiles { display: flex; overflow-x: auto; gap: 8px; padding-block-end: 8px; }
  .tile { flex: 0 0 auto; padding: 6px 12px; grid-auto-flow: column; align-items: baseline; gap: 6px; }
  .tile-n { font-size: var(--text-xl); }
  .tile-s, .tile-bar, .tile .long { display: none; }
  .tile .short { display: inline; }
  .tools { top: 0; padding-block: 4px; }
  .dock-in { grid-template-columns: minmax(0, 1fr) 240px; padding: 4px 4px 4px 10px; }
  .dock-more, .dock-undo { display: none; }
  .dock .ui-button[data-intent='act'] { min-block-size: 44px; }
}
`

const notes = `
<section class="notes" aria-label="The board’s notes">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Direction A · the shelf, round 2</span><h2>One working table</h2></div>
  <p><b>The screen’s one job</b> (docs/SCREENS.md row 146): see every change a new Master Price File would make before anything is written, and write the ones Northside keeps as one step with one way back.</p>
  <p><b>What this screen does that no other does.</b> It is the only place a figure on the price list moves by the thousand. Any of the ${n(C.changes)} changes in a 39.8 MB workbook is found in two keystrokes (<code>/</code>, a name or a code) and left out with one Space, and the dock counts what Apply will write before it writes it.</p>
  <p><b>The order and grouping.</b> Census → filter → lines → act. Nothing is grouped until the person groups it: the five tiles are the first filters, the toolbar narrows, and the one table’s columns are the columns that moved in whatever is showing. B settles before it shows; C reads columns before lines. A is the register an admin already knows from Excel, with the arithmetic done.</p>

  <div class="cols">
    <div><h3>Two references no earlier board used</h3><ul class="dash">
      <li><b>WorkbookDiff</b> (${REF('live/workbookdiff-result.png')}): counted kinds as tiles, then Search, Worksheet and Change type over one Before/After table, “Showing 10 of 10”. Taken: the tiles that are filters, the find, “Showing N of M”, and its rule that a filter changes the view and never what is written. Left: its sticky header that covers its own result.</li>
      <li><b>GitHub Desktop, partial commit</b> (${REF('live/gh-desktop-partial.png')}): one tick over the changed files and one on each, toggled by Space. Taken: the master tick with its third state, the tick on every line, and the commit button that counts what is ticked (“Apply ${n(IN)} changes”).</li>
    </ul>
    <p>Also drawn on, open to all three boards: UpdraftPlus’s backups with Restore on the row (${REF('live/updraft-dashboard.png')}) for the ledger.</p></div>
    <div><h3>The figures, all measured</h3><ul class="dash">
      <li>Read through the app’s own <code>readWorkbook</code> and <code>planNewFile</code> against the real pack by <code>extract.facts.ts</code>: ${n(C.changing)} change, ${n(C.adding)} new, ${C.cannot} can’t be placed, ${n(C.unmoved)} of ${n(C.total)} unmoved, the judge’s counts exactly.</li>
      <li>Every column name and every old → new is a <code>CellChange</code>. Parts’ ${P.census.length} moved columns: ${census(
        P,
      )
        .map((c) => `${c.label} ${n(c.lines)}`)
        .join(', ')}.</li>
      <li>Dealer Fit’s ${D.census.length}: ${census(D)
        .map((c) => `${c.label} ${n(c.lines)}`)
        .join(', ')}.</li>
      <li>IBC: ${IBC.length} lines, every one on Parts, every one lower at Sell, all in one category.</li>
      <li>${PICTURED} of the ${n(P.lines.length)} Parts lines in the change set have a picture in the ledger. The table stays typographic; a picture appears only where a person must recognise a part to choose between two rows (the WR10 remote, state 3).</li>
    </ul></div>
  </div>

  ${jobsTable([
    [
      'A1 Bring in the .xlsx',
      'The head: the file, its size, the day it was saved on this computer (never called its edition), the read time, and the price list it was read against.',
    ],
    [
      'A2 See what moves first',
      `The tiles, and the fifth: ${n(C.unmoved)} of ${n(C.total)} stay exactly as they are, with its share drawn in two inks that the tiles explain.`,
    ],
    [
      'A3 The price that jumped',
      `The “doubled or halved” tile filters to the ${CHECK.length} (state 4); each line ticks out with Space.`,
    ],
    [
      'A4 One list in full',
      'The list chip; the table’s columns are that list’s moved columns, named and counted (state 2).',
    ],
    [
      'A5 Find a product or supplier',
      'The find (name or code) and the Supplier chip, grouped by the file’s own codes (state 1, IBC).',
    ],
    [
      'A6 Settle the 61',
      `Can’t place (state 3): the rows that share the name, offered in the line; “Place the ${NAMED.length} the Code names” takes the suggestions in one press.`,
    ],
    [
      'A7 Apply and Undo',
      'The dock, pinned in view at every size, with its count and the Undo sentence.',
    ],
    [
      'A8 Apply part of a file',
      'A tick on every line and the master tick; the dock counts what is in.',
    ],
    [
      'A9 Paste the workbook’s own lines',
      'State 6: the unrecognised heading is pointed at in place.',
    ],
    [
      'A10 A wrong file',
      'Unchanged: the refusals the judge found good stay where the file was dropped.',
    ],
    [
      'A11 Which price list, and what came before',
      'State 5: the edition is the rest page’s first line, and the ledger keeps every file.',
    ],
    ['A12 Clear back to the file', 'Unchanged: its own page, below the two plates in state 5.'],
    [
      'S1 to S4 The copy',
      'State 5: six kinds counted; Save beside the edition; Bring back sets the copy beside this computer before replacing; Forget unchanged.',
    ],
    [
      'Salesperson',
      'State 5: the quotes being written that a file would move are counted before Apply. On this computer there are none, and it says so.',
    ],
    [
      'Missing: every figure named',
      'Every moved figure is in a named column or named in its line. No line says “other figures”.',
    ],
    [
      'Missing: a working tool',
      'Find, list, supplier, kind and swing; a virtualised table; tiles and dock pinned.',
    ],
    ['Missing: leave a line out', 'Ticks.'],
    ['Missing: settle a line', 'Radios in the line.'],
    ['Missing: edition and ledger', 'State 5.'],
    ['Missing: drafts a file moves', 'State 5, and the dock’s sentence.'],
  ])}

  <div class="cols">
    <div><h3>How it reflows</h3><ul class="dash">
      <li><b>390 × 844</b>: the head is the file’s name and one line of meta; the tiles become a strip that scrolls sideways inside itself (the page never does); the toolbar is the find and “Filters · 1”; each line is a card with a tick of 44 px and its moved figures as label → figure; the dock sits above the bar as one line, “${n(IN)} of ${n(IN + 1)} in” and Apply.</li>
      <li><b>844 × 390</b>: the bar is at the foot; the head is the name alone, the tiles one line of figures, the toolbar sticks to the top, and the dock is one line of 52 px.</li>
      <li><b>834 × 1112</b>: lines are cards (the table needs 1,200 px); the kind and swing filters fold into the list and supplier chips.</li>
      <li><b>1280 × 800 and 1440 × 900</b>: the table, every moved column a column of its own up to the ten a list moves on one line in ten or more.</li>
      <li><b>1920 × 1080</b>: the frame grows to 1,720 px; the name column and every figure column widen, nothing more is invented to fill it.</li>
    </ul></div>
    <div><h3>Type, motion, keys</h3>
    <div class="specimen">
      <div><span>head 26/1.1 800</span><b style="font-size:var(--text-3xl)">Parts Module (2).xlsx</b></div>
      <div><span>tile figure 26 800</span><b style="font-size:var(--text-3xl)">3,082</b></div>
      <div><span>line 14/1.3 650</span><span style="font-weight:650">Tube Covers to suit PVC Boat - 2.0 Mtr</span></div>
      <div><span>cell 13, old 12</span><span>${moved('$1,640', '$1,540')}</span></div>
      <div><span>meta 12 500</span><span class="meta">IBC · IBC-TCPVC - 2.0 Mtr · Parts Maintenance, line 676</span></div>
    </div>
    <ul class="dash">
      <li><b>Motion.</b> A filter swaps the rows in place, no slide; the “Showing” count and the dock’s count change their figures in place over the settle duration; a ticked-out row dims in 150 ms. Under reduced motion nothing moves; only the figures change.</li>
      <li><b>Keys.</b> <code>/</code> finds; Tab reaches the tiles, the filters, the master tick, the table, then the dock; arrows move between lines; Space ticks a line; Enter opens it on the price list.</li>
    </ul></div>
  </div>

  <div class="cols">
    <div><h3>The honest constraints</h3><ul class="dash">
      <li>Cost shows here because the shelf is never a customer surface; a cost column carries “Northside’s own”, by the app’s own rule. Measured: that rule does not catch Dealer Fit’s GP, Tot Parts CTD, Act CTD and Labour CTD, so the board marks them too and the build must widen the rule.</li>
      <li>MU is printed as the register prints it, a ratio, because the file carries no unit.</li>
      <li>The workbook is not dated inside. “Saved on this computer 12 Sep 2026” is the file’s own modified date, never its edition.</li>
      <li>No quote is on this computer, so the drafts line is drawn empty. No copy has been saved, so the copy line is empty.</li>
      <li>The ledger needs a record of its own; today the applied step lives in memory and catalogue events are not kept.</li>
    </ul></div>
    <div><h3>The mark, and what a dealer replaces</h3><ul class="dash">
      <li>The change sheet carries no mark: it is a working table, and the mark would take a line from the lines. The rest page keeps Northside’s mark, small, in the bar’s disc and nowhere larger, because its first line is now the edition.</li>
      <li>Northside’s accent sets the chosen filter, the chosen row and the master tick; the act stays amber. The tiles’ inks (blue change, green new, ochre can’t place, carmine swing) are tokens a dealer’s appearance can re-ink. No photograph is assumed anywhere, so nothing breaks without one.</li>
    </ul></div>
  </div>
</div>
</section>`

export const html = page({
  title: 'Shelf A · One working table',
  id: 'a',
  css,
  body: state1 + state2 + state3 + state4 + state5 + state6,
  notes,
})
