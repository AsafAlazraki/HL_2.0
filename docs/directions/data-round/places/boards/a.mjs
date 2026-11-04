/* BOARD A — THE LINE-UP. /places/boat_highfield?series=Sport&compare=boat_highfield:481,boat_highfield:513
   The range is the page. Under a short livery head that says the span once, the seven series
   stand as picture tiles that filter in place; under them, every model of the chosen series as
   one configuration card: its own picture, its spoken name, its from-price at Cash, length ·
   people · horsepower, and what it carries in one line. A card's Compare collects into a tray
   at the foot. Prices, quotes, partners and Settings follow the range, never before it. */
import {
  HF,
  PL,
  HEROES,
  PACKED,
  at,
  carries,
  lengthSpan,
  model,
  money,
  n,
  plural,
  seriesOf,
  spanAt,
  three,
  metres,
  people,
  hp,
  kg,
  words,
} from './facts.mjs'
import { btn, chip, esc, ic, jobsTable, mark, page, seg, specimen } from './shell.mjs'
import {
  STATE_CSS,
  handoff,
  jeanneau,
  labour,
  obsolete,
  yamaha,
  jeanneauSentence,
  labourSentence,
} from './states.mjs'

const P = PL.boat_highfield
const SERIES = seriesOf(HF)
const ON = 'Sport'
const shown = SERIES.find((s) => s.label === ON)
const ALL = spanAt(HF.models, 'cash')
const LEN = lengthSpan(HF.models)
const PICKED = ['Sport 600', 'Sport 660']
const fitHref = (m) => `/fitment?boat=${encodeURIComponent(m.key)}`
const quoteHref = (m) => `/quote/new?brand=boat_highfield&amp;model=${encodeURIComponent(m.key)}`

const card = (m) => {
  const c = carries(m)
  const pic = m.catalogue
  const price = at(m)
  const [L, Pp, H] = three(m)
  const picked = PICKED.includes(m.said)
  const mats = m.materials.map((x) => x.label).join(' or ')
  return `
<li class="a-card${picked ? ' is-picked' : ''}">
  <div class="a-well${pic ? '' : ' a-well--type'}">
    ${
      pic
        ? `<img src="${pic.src}" alt="${esc(m.spoken)}, ${esc(m.materials.length > 1 ? 'one of its colourways' : 'its render')}" width="${pic.w}" height="${pic.h}" loading="lazy">`
        : `<span class="a-type"><b>${esc(L)}</b><b>${esc(H)}</b><small>No picture of the ${esc(m.said)} is held</small></span>`
    }
  </div>
  <div class="a-words">
    <div class="a-nameline"><h3 class="a-name">${esc(m.said)}</h3><span class="a-price fig"><b>${price.said}</b><small>Cash</small></span></div>
    <p class="a-sub"><span class="mono">${esc(m.code)}</span> · ${plural(m.rows, 'version')} in ${esc(mats)}</p>
    <p class="a-facts fig">${[L, Pp ?? '<span class="a-gap">people not in the price list</span>', H].join('<i aria-hidden="true">·</i>')}</p>
    <p class="a-rec">${ic('Engine')}<span>${c.starred ? `<b>${esc(c.starred.name)}</b> recommended` : 'No motor marked recommended'}</span></p>
    <dl class="a-kit fig" aria-label="What fits the ${esc(m.spoken)}">
      <div><dt>motors</dt><dd>${n(c.motors)}</dd></div><div><dt>trailers</dt><dd>${n(c.trailers)}</dd></div><div><dt>dealer fit</dt><dd>${n(c.dealerFit)}</dd></div><div><dt>parts</dt><dd>${n(c.parts)}</dd></div>
    </dl>
  </div>
  <div class="a-foot">
    <label class="a-cmp"><input type="checkbox"${picked ? ' checked' : ''}><span>Compare</span></label>
    ${btn('What fits', { icon: 'Wrench', size: 'sm', href: fitHref(m), aria: `What fits the ${m.spoken}` })}
    ${btn('Quote it', { intent: 'secondary', size: 'sm', icon: 'FilePlus', href: quoteHref(m), aria: `Quote the ${m.spoken}` })}
  </div>
</li>`
}

const tile = (s) => {
  const pic = s.list.find((m) => m.catalogue)?.catalogue
  const sp = spanAt(s.list, 'cash')
  const on = s.label === ON
  return `<a class="a-tile${on ? ' on' : ''}" href="?series=${encodeURIComponent(s.name)}"${on ? ' aria-current="true"' : ''}>
    <span class="a-thumb">${pic ? `<img src="${pic.src}" alt="" loading="lazy">` : ''}</span>
    <b>${esc(s.label)}</b><span class="fig">${plural(s.list.length, 'model')}</span><span class="fig">from ${money(sp.lo)}</span></a>`
}

const hero = P.hero
const heroCaption = hero.subject.replace(/^Highfield /, '')

const body = `
<main class="a frame" data-testid="place">
  <nav class="a-trail">${btn('Back to the price list', { icon: 'ArrowLeft', size: 'sm', href: '/data?at=boat_highfield' })}</nav>

  <header class="a-head livery" data-livery="${P.ground.key}">
    <div class="a-face">
      <span class="kindword">Boats</span>
      <h1 class="a-title">${mark(P)}<span class="sr">${esc(P.name)}</span></h1>
      <p class="a-span fig"><b>${P.figure.holds}</b><span>from ${money(ALL.lo)} to ${money(ALL.hi)} at Cash</span><span>${LEN.lo} to ${LEN.hi} m</span></p>
      <p class="a-priced">${n(ALL.priced)} of ${n(ALL.of)} versions priced at Cash · price list of ${PACKED}</p>
      <div class="a-acts">
        ${btn('Quote a Highfield', { intent: 'act', icon: 'FilePlus', href: '/quote/new?brand=boat_highfield' })}
        ${btn(`See the ${HEROES.length} photographs`, { intent: 'veiled', icon: 'Images', cls: 'a-gallery' })}
      </div>
    </div>
    <figure class="a-hero"><img src="${hero.src}" alt="${esc(hero.subject)}" width="${hero.w}" height="${hero.h}"><figcaption class="cap">${esc(heroCaption)}</figcaption></figure>
  </header>

  <nav class="a-series" aria-label="Highfield's series">
    <a class="a-tile a-tile--all" href="?series="><span class="a-thumb a-thumb--fig"><b class="fig">${HF.models.length}</b></span><b>Every model</b><span class="fig">${plural(SERIES.length, 'series', 'series')}</span><span class="fig">from ${money(ALL.lo)}</span></a>
    ${SERIES.map(tile).join('')}
  </nav>
  <button class="a-pick" aria-haspopup="listbox"><span class="a-pick-lab">Series</span><b>${esc(ON)}</b><span class="fig">${plural(shown.list.length, 'model')}</span>${ic('CaretDown')}</button>

  <section class="a-range" aria-labelledby="a-range-h">
    <div class="a-rangehead">
      <div class="a-rh-words">
        <h2 id="a-range-h">${esc(ON)} <span class="fig">${plural(shown.list.length, 'model')}</span></h2>
        <p class="fig">${btn(`Open ${ON} in the price list`, { icon: 'Database', size: 'sm', href: `/data/boat_highfield?in=${ON}`, cls: 'a-sheetdoor' })} from ${money(spanAt(shown.list, 'cash').lo)} to ${money(spanAt(shown.list, 'cash').hi)} at Cash · ${n(spanAt(shown.list, 'cash').priced)} of ${n(spanAt(shown.list, 'cash').of)} versions priced · in the price list's own order</p>
      </div>
      <div class="a-tools">
        ${seg('a-order', 'Order the models', ['File order', 'Price', 'Length'], 'File order')}
        <div class="a-tray" role="region" aria-label="Compare">
          <span class="a-tray-lab">${ic('Scales')} Compare</span>
          ${PICKED.map((p) => chip(`${p} <span aria-hidden="true">×</span>`, { on: true })).join('')}
          ${btn(`Compare ${PICKED.length}`, { intent: 'primary', size: 'sm', icon: 'ArrowRight' })}
        </div>
      </div>
    </div>
    <ul class="a-grid">${shown.list.map(card).join('')}</ul>
    <p class="a-std">${ic('Info')}<span>What comes standard on each boat is not held yet: it waits on Northside's Boat Module and Factory Options workbooks. Every count above is what the price list says <em>fits</em>.</span></p>
  </section>

  <section class="a-after" aria-label="Highfield at Northside">
    <div class="a-plate a-prices">
      <h2>${ic('Tag')} Its prices</h2>
      <table class="a-ptab fig"><thead><tr><th>Series</th><th>Cash</th><th>Trade</th></tr></thead><tbody>
      ${SERIES.map((s) => {
        const c = spanAt(s.list, 'cash')
        const t = spanAt(s.list, 'trade')
        return `<tr${s.label === ON ? ' class="on"' : ''}><td>${esc(s.label)}<small>${n(c.priced)} of ${n(c.of)} priced</small></td><td>${money(c.lo)}–${money(c.hi)}</td><td>${money(t.lo)}–${money(t.hi)}</td></tr>`
      }).join('')}
      </tbody></table>
      <p class="quiet-say">Warranty, the third level, carries a figure on all ${n(ALL.of)} versions. Northside decides what each level means on Prices.</p>
      ${btn('Decide Highfield’s prices', { icon: 'ArrowRight', size: 'sm', href: P.pricesHref })}
    </div>
    <div class="a-plate a-quotes">
      <h2>${ic('FileText')} Quotes on a Highfield <span class="fig">0</span></h2>
      <p class="quiet-say">No quote on a Highfield is held in this browser yet. A quote begun from a card above is listed here by its customer, its boat as a person says it (“Sport 660”), its total at its level and whether it is given, with a find once there are any.</p>
    </div>
    <div class="a-plate a-partners">
      <h2>${ic('LinkSimple')} Goes with</h2>
      <p class="quiet-say">The lines that say what fits, for all ${HF.models.length} models. Each card counts its own.</p>
      <ul>${P.partners
        .map(
          (g) =>
            `<li data-livery="${g.ground.key}"><a href="/places/${g.address ?? ''}"><span class="a-pchip livery">${g.mark.drawn ? mark(g) : ic(g.kind === 'accessory' ? 'Toolbox' : g.kind === 'package' ? 'Package' : 'TruckTrailer', { size: 'md' })}</span><span><b>${esc(g.name)}</b><small class="fig">${n(g.fits)} fits</small></span>${ic('ArrowRight')}</a></li>`,
        )
        .join('')}</ul>
    </div>
    <div class="a-plate a-changed">
      <h2>${ic('ClockCounterClockwise')} Changed here</h2>
      <p class="quiet-say">No line of Highfield Inflatables has been changed since the price list came in. Once one is, the count opens those lines in History.</p>
      <h2>${ic('SlidersHorizontal')} How it is dressed</h2>
      <p class="quiet-say">Its line, its mark, its photograph and its colour, each one step with Undo.</p>
      ${btn('Highfield’s settings', { icon: 'ArrowRight', size: 'sm', href: '?tab=settings' })}
    </div>
  </section>

</main>`

/* ---- the compare, opened: three Sport models in columns; a row the same for all is quiet ---- */
const CMP = ['Sport 560', 'Sport 600', 'Sport 660'].map((s) => model(HF, s))
const cmpRows = [
  ['From, at Cash', (m) => at(m).said],
  ['At Trade', (m) => `from ${money(m.levels.find((l) => l.key === 'trade').lo)}`],
  ['Versions', (m) => `${m.rows} in ${m.materials.map((x) => x.label).join(' or ')}`],
  ['Length', (m) => metres(m.spec.length)],
  ['Beam', (m) => metres(m.spec.beam)],
  ['People', (m) => people(m.spec.people) ?? '—'],
  ['Max load', (m) => kg(m.spec.load) ?? '—'],
  ['Boat weight', (m) => kg(m.spec.weight) ?? '—'],
  ['Fuel', (m) => words(m.spec.fuel) ?? '—'],
  ['Horsepower', (m) => hp(m.spec)],
  ['Shaft', (m) => m.spec.shaft ?? '—'],
  [
    'Motors that fit',
    (m) =>
      `${carries(m).motors}${carries(m).starred ? ` · ${carries(m).starred.name.replace(/^Yamaha /, '')} recommended` : ''}`,
  ],
  ['Trailers that fit', (m) => String(carries(m).trailers)],
  ['Dealer fit · parts', (m) => `${carries(m).dealerFit} · ${carries(m).parts}`],
]
const compareState = `
<div class="a-cmpsheet">
  <div class="a-cmphead"><b>Compare 3 Sport models</b>${chip('Highlight differences', { on: true, icon: 'Highlighter' })}</div>
  <table class="a-cmptab fig"><thead><tr><th></th>${CMP.map((m) => `<th>${m.catalogue ? `<img src="${m.catalogue.src}" alt="">` : ''}<b>${m.said}</b></th>`).join('')}</tr></thead>
  <tbody>${cmpRows
    .map(([lab, f]) => {
      const vals = CMP.map(f)
      const same = vals.every((v) => v === vals[0])
      return `<tr class="${same ? 'same' : 'differs'}"><th>${lab}</th>${vals.map((v) => `<td>${v}</td>`).join('')}</tr>`
    })
    .join('')}</tbody></table>
  <p class="quiet-say">Measured: the price list gives the Sport 600 and the Sport 660 the same length, beam, people, load, weight, fuel and horsepower. Only the price and the versions differ, so “Highlight differences” leaves two rows lit between them.</p>
</div>`

const css = `
.a { display: grid; gap: 16px; }
.a-trail { margin-block-end: -4px; }
.a-head { position: relative; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); border-radius: var(--radius-plate); overflow: hidden; box-shadow: var(--shadow-plate); min-block-size: 220px; --mark-h: 56px; }
.a-face { display: grid; align-content: center; justify-items: start; gap: 8px; padding: 24px 32px; }
.a-title { display: flex; }
.a-span { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: var(--text-lg); }
.a-span b { font-weight: 800; }
.a-priced { font-size: var(--text-sm); opacity: 0.9; }
.a-acts { display: flex; flex-wrap: wrap; gap: 10px; margin-block-start: 6px; }
.a-hero { position: relative; margin: 0; -webkit-mask-image: linear-gradient(90deg, transparent, #000 22%); mask-image: linear-gradient(90deg, transparent, #000 22%); }
.a-hero img { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; object-fit: cover; }

.a-series { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 10px; }
.a-tile { display: grid; gap: 2px; padding: 8px 8px 10px; border-radius: var(--radius-tile); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); min-inline-size: 0; }
.a-tile b { font-size: var(--text-base); }
.a-tile span.fig { font-size: var(--text-xs); color: var(--color-ink-3); }
.a-tile.on { box-shadow: 0 0 0 2px var(--color-blue-800), var(--shadow-md); }
.a-thumb { display: grid; place-items: center; aspect-ratio: 16 / 6; border-radius: var(--radius-sm); background: var(--color-white); overflow: hidden; margin-block-end: 4px; }
.a-thumb img { inline-size: 100%; block-size: 100%; object-fit: contain; }
.a-thumb--fig { background: var(--color-plate-tint); }
.a-thumb--fig b { font-size: var(--text-3xl); font-weight: 800; color: var(--color-blue-800); }
.a-pick { display: none; }

.a-range { display: grid; gap: 14px; padding-block-end: 8px; }
.a-rangehead { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 10px 20px; }
.a-rangehead h2 { font-size: var(--text-3xl); letter-spacing: -0.01em; display: flex; gap: 10px; align-items: baseline; }
.a-rangehead h2 span { font-size: var(--text-base); color: var(--color-ink-3); font-weight: 600; }
.a-rangehead p { font-size: var(--text-sm); color: var(--color-ink-2); display: flex; flex-wrap: wrap; align-items: center; gap: 0 10px; }
.a-rangehead p .ui-button-frame { order: 2; }
.a-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.a-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); }
.a-card { display: grid; grid-template-rows: auto 1fr auto; border-radius: var(--radius-tile); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); overflow: hidden; }
.a-card.is-picked { box-shadow: 0 0 0 2px var(--color-blue-800), var(--shadow-md); }
.a-well { aspect-ratio: 16 / 7; background: var(--color-white); display: grid; place-items: center; overflow: hidden; }
.a-well img { inline-size: 92%; block-size: 92%; object-fit: contain; }
.a-well--type { background: linear-gradient(160deg, var(--color-plate-tint), var(--color-wash)); }
.a-type { display: grid; justify-items: center; gap: 2px; text-align: center; padding: 8px; }
.a-type b { font-size: var(--text-2xl); font-weight: 800; color: var(--color-ink-2); }
.a-type small { font-size: var(--text-xs); color: var(--color-ink-3); margin-block-start: 4px; }
.a-words { display: grid; align-content: start; gap: 5px; padding: 12px 14px 8px; }
.a-nameline { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.a-name { font-size: var(--text-xl); line-height: 1.2; }
.a-price { display: inline-flex; gap: 5px; align-items: baseline; white-space: nowrap; }
.a-price b { font-size: var(--text-lg); }
.a-price small { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 700; }
.a-sub { font-size: var(--text-xs); color: var(--color-ink-3); }
.a-facts { font-size: var(--text-base); font-weight: 600; color: var(--color-ink); display: flex; flex-wrap: wrap; gap: 0 7px; }
.a-facts i { font-style: normal; color: var(--color-ink-3); }
.a-gap { color: var(--color-ink-reason); font-weight: 500; font-size: var(--text-sm); }
.a-rec { display: flex; gap: 6px; align-items: center; font-size: var(--text-sm); color: var(--color-ink-2); }
.a-rec .ui-icon { flex: none; color: var(--color-ink-3); }
.a-kit { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 2px 0 0; padding: 6px 0 0; border-block-start: 1px dashed var(--color-rule-strong); }
.a-kit div { display: flex; flex-direction: column-reverse; }
.a-kit dd { margin: 0; font-size: var(--text-lg); font-weight: 800; line-height: 1.1; }
.a-kit dt { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 600; }
.a-foot { display: flex; align-items: center; gap: 4px; padding: 6px 8px 8px 12px; border-block-start: 1px solid var(--color-rule); }
.a-cmp { display: inline-flex; align-items: center; gap: 6px; min-block-size: 32px; font-size: var(--text-sm); font-weight: 600; margin-inline-end: auto; color: var(--color-ink-2); }
.a-cmp input { inline-size: 18px; block-size: 18px; accent-color: var(--color-blue-800); }
.a-std { display: flex; gap: 8px; align-items: flex-start; font-size: var(--text-sm); color: var(--color-ink-reason); }
.a-std .ui-icon { flex: none; margin-block-start: 2px; }

.a-after { display: grid; gap: 14px; grid-template-columns: 1.3fr 1fr 1fr 1fr; align-items: start; }
.a-plate { display: grid; gap: 10px; padding: 16px 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); }
.a-plate h2 { font-size: var(--text-lg); display: flex; align-items: center; gap: 8px; }
.a-plate h2 .fig { margin-inline-start: auto; font-size: var(--text-sm); color: var(--color-ink-3); }
.a-ptab { border-collapse: collapse; font-size: var(--text-sm); inline-size: 100%; }
.a-ptab th, .a-ptab td { text-align: start; padding: 5px 6px 5px 0; border-block-end: 1px solid var(--color-rule); vertical-align: top; }
.a-ptab th { font-size: var(--text-xs); color: var(--color-ink-3); }
.a-ptab td small { display: block; font-size: var(--text-xs); color: var(--color-ink-3); }
.a-ptab tr.on td:first-child { font-weight: 700; }
.a-partners ul { display: grid; }
.a-partners a { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 6px 0; border-block-end: 1px solid var(--color-rule); }
.a-partners b { display: block; font-size: var(--text-sm); }
.a-partners small { font-size: var(--text-xs); color: var(--color-ink-3); }
.a-pchip { display: grid; place-items: center; block-size: 32px; border-radius: var(--radius-sm); --mark-h: 26px; }
.a-pchip .pm-plate { padding: 2px 4px; }
.a-pchip .pm-plate img { block-size: 16px; }

.a-tray { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 4px 4px 4px 12px; border-radius: var(--radius-pill); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-rule-strong); }
.a-tray-lab { display: inline-flex; gap: 6px; align-items: center; font-weight: 700; font-size: var(--text-sm); }
.a-slot { padding: 4px 12px; border-radius: var(--radius-pill); box-shadow: inset 0 0 0 1px var(--color-rule-strong); color: var(--color-ink-3); font-size: var(--text-sm); border: 1px dashed transparent; }

/* the compare sheet, as a state in the notes */
.a-cmpsheet { display: grid; gap: 10px; }
.a-cmphead { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.a-cmptab { border-collapse: collapse; inline-size: 100%; font-size: var(--text-sm); background: var(--color-plate); }
.a-cmptab th, .a-cmptab td { text-align: start; padding: 6px 8px; border-block-end: 1px solid var(--color-rule); vertical-align: top; }
.a-cmptab thead th { vertical-align: bottom; }
.a-cmptab thead img { display: block; inline-size: 100%; max-inline-size: 160px; aspect-ratio: 16 / 9; object-fit: contain; }
.a-cmptab tbody th { color: var(--color-ink-3); font-weight: 600; font-size: var(--text-xs); white-space: nowrap; }
.a-cmptab tr.same td { color: var(--color-ink-3); }
.a-cmptab tr.differs td { background: var(--color-chosen-wash); font-weight: 700; }

${STATE_CSS}

/* REFLOW */
@media (min-width: 1600px) { .a-head { min-block-size: 260px; } }
@media (max-width: 1279px) { .a-after { grid-template-columns: 1fr 1fr; } }
@media (max-width: 1100px) { .a-series { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 899px) { .a-face { padding: 20px 22px; } }
/* a phone, and a phone held sideways: boats first, the series as one chooser */
@media (max-width: 599px), (max-height: 480px) {
  .a-hero { display: none; }
  .a-head { grid-template-columns: 1fr; min-block-size: 0; --mark-h: 36px; }
  .a-face { padding: 16px 18px; gap: 6px; }
  .a-span { font-size: var(--text-base); }
  .a-series { display: none; }
  .a-pick { display: flex; align-items: center; gap: 10px; inline-size: 100%; min-block-size: 48px; padding-inline: 14px; border: 0; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-control-edge); font: inherit; color: var(--color-ink); text-align: start; }
  .a-pick-lab { font-size: var(--text-xs); font-weight: 700; color: var(--color-ink-3); text-transform: uppercase; letter-spacing: 0.08em; }
  .a-pick span.fig { color: var(--color-ink-3); margin-inline-end: auto; font-size: var(--text-sm); }
  .a-rangehead h2 { font-size: var(--text-2xl); }
  .a-tools .ui-segmented-frame { display: none; }
  .a-after { grid-template-columns: 1fr; }
  .a-trail { display: none; }
}
@media (max-width: 599px) {
  .a-acts .a-gallery { display: none; }
  .a-card { grid-template-columns: 116px minmax(0, 1fr); grid-template-rows: auto auto; }
  .a-well { grid-row: 1; aspect-ratio: auto; block-size: 100%; min-block-size: 96px; }
  .a-type b { font-size: var(--text-base); }
  .a-type small { display: none; }
  .a-words { padding: 10px 10px 6px; }
  .a-nameline { flex-direction: column; gap: 0; }
  .a-name { font-size: var(--text-lg); }
  .a-foot { grid-column: 1 / -1; }
  .a-sub { display: none; }
  .a-tray .ui-chip-frame, .a-tray-lab { display: none; }
  .a-tray { padding: 4px; }
  .a-tools { inline-size: 100%; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .a-head { --mark-h: 30px; }
  .a-face { grid-template-columns: auto 1fr auto; align-items: center; padding: 10px 16px; gap: 4px 16px; }
  .a-face .kindword, .a-priced { display: none; }
  .a-acts { margin: 0; }
  .a-acts .a-gallery { display: none; }
  .a-span { font-size: var(--text-sm); }
  .a-pick { min-block-size: 40px; }
}
`

const notes = `
<section class="notes" aria-label="The board's notes">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Board A · a maker's own page</span><h2>The line-up</h2><span class="rec">Recommended</span></div>
  <p><b>The screen's one job</b> (docs/SCREENS.md, the judge): one maker as Northside sells it: its line, its mark, its photographs and colour, <b>its models and what each carries</b>.</p>
  <p><b>What only this screen does.</b> It is the one place every model of one maker stands with its price, its three facts and what it carries, and where two or three of them are set side by side. The picker shows a picture and a from-price to start a quote; Fitment changes what goes on one boat; the sheet edits lines. None of them answers “which Highfield is right for this customer” on one page.</p>

  <div class="cols">
    <section><h3>Order and grouping</h3><ul class="dash">
      <li>A short livery head: the mark, <b>${P.figure.holds}</b>, the span <b>${money(ALL.lo)} to ${money(ALL.hi)}</b> at Cash, ${LEN.lo} to ${LEN.hi} m, ${n(ALL.priced)} of ${n(ALL.of)} versions priced, the act, and the gallery of ${HEROES.length} photographs as one press.</li>
      <li>The seven series as picture tiles, plus <b>Every model</b>. A tile filters in place; the series is in the address (<code>?series=Sport</code>).</li>
      <li>The models of the series, one card each, in the price list's own order (Price and Length re-order it, <code>?order=</code>).</li>
      <li>One sentence, once, that standard inclusions are not held.</li>
      <li>Then, after the range and never before it: prices by series, quotes, the places it goes with, what changed, and Settings.</li>
      <li>The compare tray in the range's own head, beside the order, filled by each card's Compare (<code>?compare=</code>); the range head docks under the bar once the page scrolls, so the tray is always one press away and never floats over a card.</li>
    </ul></section>
    <section><h3>References new to this board</h3><ul class="dash">
      <li><b>CarExpert's configurations</b> (<code>docs/research/refs/places/round-2/live/carexpert-specs.png</code>, <code>carexpert-specs-390.png</code>): each version as one card with its price and <i>+ Compare</i>, and “Price not available” printed in the price's own place.</li>
      <li><b>Quicksilver's selector</b> (<code>live/quicksilver-selector.png</code>, <code>quicksilver-selector-390.png</code>): the series as picture tiles that narrow the list in place.</li>
      <li>Also drawn on: <code>live/mazda-range.png</code> (side-on cut-outs at one scale, a second-tone fact line under each name).</li>
    </ul>
    <p>Neither CarExpert nor Quicksilver is cited by any earlier board in <code>docs/directions/</code>.</p></section>
  </div>

  <div class="cols">
    <section><h3>A card</h3><p>Its own catalogue picture where the ledger holds one: ${HF.models.filter((m) => m.catalogue).length} of Highfield's ${HF.models.length} models. Its spoken name and Model Code, how many versions and in what. <b>From $X at Cash</b>, or one figure where every version costs the same. Length · people · horsepower as the file writes them. Then what it carries, from the fitment reading: the recommended motor where the join marks one (${HF.models.filter((m) => carries(m).starred).length} of ${HF.models.length}), then motors, trailers, dealer fit and parts counted. Three presses: Compare, <b>What fits</b> (<code>/fitment?boat=</code> that model, one press, not the chooser) and <b>Quote it</b> (<code>/quote/new?brand=boat_highfield&amp;model=</code>).</p>
    <p>A card with no picture (Sport 700 WL, Sport 760 WL, Patrol 600 …) is <b>typographic by design</b>: its length and horsepower set large in the well, and “No picture of the Sport 700 WL is held”. Never a sibling's picture, never a grey box, the same height as its neighbours.</p></section>
    <section><h3>The mark, and the head</h3><p>The mark stays the showpiece, in white ink on Highfield's cobalt at one optical size, and the name is not printed under it again (the judge's “name twice”). The head is 220 px, not 300: the span sits where the empty right 60% was. For the 18 places with no photograph, the same head is drawn without the picture and needs no band of empty colour (Jeanneau, Yamaha and Labour Rates below).</p>
    <h3>What a dealer can replace</h3><p>The ground (one of eight bounded colours), the mark's ink, the photograph and its line: all four from Settings, unchanged. The cards read only the price list and the ledger, so a new photograph changes the head and nothing else.</p></section>
  </div>

  <section><h3>Further states, drawn from the file</h3>
  <div class="cols">
    <div class="state"><span class="eyebrow">The compare, opened · ?compare=Sport 560, 600, 660</span>${compareState}</div>
    <div class="state"><span class="eyebrow">Jeanneau · no photograph, 4 under no series</span>${jeanneau('cards')}</div>
  </div>
  <div class="cols">
    <div class="state"><span class="eyebrow">Yamaha · the series tiles become its horsepower ladder</span>${yamaha('cards')}</div>
    <div class="state"><span class="eyebrow">Labour Rates · no declared price</span>${labour('cards')}</div>
  </div>
  <div class="cols">
    <div class="state"><span class="eyebrow">OBSOLETE Trailers · the ten shown</span>${obsolete('cards')}</div>
    <div class="state"><span class="eyebrow">Parts &amp; Accessories and Dealer Fit · the hand-off</span>${handoff()}</div>
  </div></section>

  <div class="cols">
    <section><h3>Type, at 1:1</h3>${specimen([
      ['Span, 16 / 800', 'font-size:var(--text-lg);font-weight:800', `${P.figure.holds}`],
      ['Series, 26 / 800', 'font-size:var(--text-3xl);font-weight:800', 'Sport'],
      ['Card name, 18 / 700', 'font-size:var(--text-xl);font-weight:700', 'Sport 660'],
      [
        'Price, 16 / 700 tabular',
        'font-size:var(--text-lg);font-weight:700;font-variant-numeric:tabular-nums',
        'from $61,700',
      ],
      [
        'Facts, 14 / 600',
        'font-size:var(--text-base);font-weight:600',
        '6.52 m · 13 people · 150–200 hp',
      ],
      [
        'Carries, 13 / 400',
        'font-size:var(--text-sm)',
        'F175XC recommended · 7 motors · 2 trailers',
      ],
      ['Code, 12 mono', 'font-family:var(--font-mono);font-size:var(--text-xs)', 'HBS145'],
    ])}<p>System sans (<code>--font-sans</code>), measure 34–40 characters on a card, 72ch in sentences. Nothing under 12 px.</p></section>
    <section><h3>Motion</h3><p>A series tile pressed: the grid's cards leave by fading 8 px down in <code>--duration-exit</code>, the new series' cards arrive by fading 8 px up in <code>--duration-enter</code>, 20 ms apart, the first eight only. The head, the tiles and the tray stay still. A card's Compare: the chip flies nothing; it appears in the tray with <code>--duration-pop</code> and the card's ring draws in <code>--duration-press</code>. The compare sheet opens from the foot in <code>--duration-sheet</code> on <code>--ease-drawer</code>.</p>
    <p><b>Reduced motion:</b> every change is a cut; the tray's count changes in place.</p>
    <p><b>Keyboard:</b> Back, the act, the gallery, the series tiles (arrow keys move between them), then the cards in reading order, each card's Compare, What fits and Quote it, then the plates after the range come last, so focus never goes right before it goes down.</p></section>
  </div>

  <section><h3>How it reflows</h3>
  <table><thead><tr><th>Size</th><th>The page</th></tr></thead><tbody>
    <tr><td>1920 × 1080</td><td>Head 260 px with the photograph; eight series tiles in a row; five cards to a row, so Sport's 16 are four rows; four plates after the range in one row.</td></tr>
    <tr><td>1440 × 900</td><td>Drawn. Four cards to a row; the range head with its tray and the first row of pictures stand inside the first screen.</td></tr>
    <tr><td>1280 × 800</td><td>Four cards to a row (296 px); the plates after the range two by two.</td></tr>
    <tr><td>834 × 1112</td><td>Head with the photograph narrowed; series tiles four by two; two cards to a row; plates two by two.</td></tr>
    <tr><td>844 × 390</td><td>The head becomes one line (mark, span, act); the series is one chooser; two cards to a row begin inside the first screen, and the act is above the fold.</td></tr>
    <tr><td>390 × 844</td><td>Drawn. Boats first: the head (mark, span, act) is about 250 px, then one Series chooser, then the cards as rows (picture left, words right). The tray keeps only its press, “Compare 2”, under the range head.</td></tr>
  </tbody></table></section>

  <section><h3>Honest constraints</h3><ul class="dash">
    <li>Every figure is read through the app's own readers (<code>boards/extract.facts.ts</code>): the picker's <code>fleetOf</code> for models, from-prices and series; <code>readBoatFit</code> for what each carries; <code>readPlace</code> for the livery and partners; <code>pictureBook</code> for pictures.</li>
    <li>No cost and no margin is read: Base Cost, Landed Hull Cost, Nett CTD and MU % never reach the board. Trade is a declared price level, shown on a staff page; the compare sheet is a staff surface too.</li>
    <li>The Max People column is filled on 567 of Highfield's 588 versions, not all of them; SP300 carries none, and its card says so where the figure would be. Min HP is on 581 of 588 (ADV7 has none: “up to 250 hp”).</li>
    <li>${jeanneauSentence}</li>
    <li>${labourSentence}</li>
    <li>Highfield's pictures are Highfield's own renders and photographs, each with its ledger entry; Jeanneau's are the price file's own Image Link copies (the row's own picture), with no person-marked hero, so its head has no photograph.</li>
    <li>No quote is held in the seed, so Quotes is drawn empty: that is the true state.</li>
  </ul></section>

  ${jobsTable([
    [
      'J1 What Highfield makes',
      'Every model of the chosen series as a card, with its picture where held; Every model shows all 67.',
    ],
    [
      'J2 Budget, family, tow car',
      'From $X at Cash on every card, with length · people · horsepower; the compare sheet adds load, weight, fuel and shaft.',
    ],
    [
      'J3 What goes on one model',
      "The card's carries line (recommended motor, motors, trailers, dealer fit, parts) and What fits → /fitment?boat= that model.",
    ],
    [
      'J4 On the water',
      `“See the ${HEROES.length} photographs” in the head opens all of them in the lightbox (unchanged).`,
    ],
    [
      'J5 Start the quote',
      'Quote a Highfield in the head; Quote it on each card lands on that model.',
    ],
    [
      'J6 An earlier quote',
      'Quotes on a Highfield: spoken name, customer, total, given or draft, find once there are any; empty today.',
    ],
    [
      'J7–J11 Settings',
      'Carried over unchanged, one press from “How it is dressed”; the words the judge named are fixed (“on its card” goes, one REDCO sentence, “Inflatables’”).',
    ],
    [
      'J12 Every model on the page',
      "Head figure = cards drawn; Jeanneau's 4 stand under “Filed under no series”.",
    ],
    [
      'J13 Its prices',
      'Its prices: Cash and Trade spans by series with n of n priced, Warranty said, door to /levels?list=boat_highfield.',
    ],
    ['J14 What changed', 'Changed here: the sentence, and the count opens those lines in History.'],
    ['J15 A series in the price list', 'Open Sport in the price list, beside the range head.'],
    ['J16 Go to Yamaha', 'Goes with: each partner by its mark, a press away.'],
    ['J17 An hour of labour', 'Labour Rates says why no figure prints, in its place.'],
    ['J18 OBSOLETE trailers', 'The ten shown, each “No longer sold”.'],
    ['J19 Unknown address', 'Unchanged: the sentence and the way back.'],
    ['Missing: compare', 'The tray and the compare sheet, three columns, Highlight differences.'],
    ['Missing: a series in place', '?series= filters the cards; no door off the page.'],
    [
      'Missing: finished without a photograph',
      'The compact head (Jeanneau, Yamaha, Labour Rates).',
    ],
    ['Missing: non-boat ranges', 'Yamaha by horsepower; trailers by ATM and the boat they carry.'],
    [
      'Missing: boats first on a phone',
      'At 390 the cards begin under a 250 px head and one chooser.',
    ],
    [
      'Missing: chandlery hand-off',
      'Parts opens /catalogue; Dealer Fit keeps a folded, found page.',
    ],
  ])}
</div>
</section>`

export const html = page({ title: 'Line-up', id: 'a', css, body, notes })
