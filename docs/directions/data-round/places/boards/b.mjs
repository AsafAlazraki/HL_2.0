/* BOARD B — THE LOOKUP. /places/boat_highfield?model=boat_highfield:513
   The maker's page as a dealer's own fitment lookup, read-only. A compact head that is the same
   with or without a photograph; on the left the question (series, then model, each model with its
   from-price); on the right the answer, titled by its count: the model's own picture and three
   figures, then what fits it as kit cards — motors first with the recommended one marked, then
   trailers, dealer-fit packages and parts — and a census of the maker across the price list at
   the foot. Changing what fits stays on Fitment: a press here reads, a press there changes. */
import {
  HF,
  PL,
  HEROES,
  PACKED,
  at,
  carries,
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
import { btn, chip, esc, ic, jobsTable, mark, page, specimen } from './shell.mjs'
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
const OPEN = 'Sport'
const M = model(HF, 'Sport 660')
const C = carries(M)
const ALL = spanAt(HF.models, 'cash')

const pick = (s) => `
<li class="b-series${s.label === OPEN ? ' open' : ''}">
  <button class="b-series-head" aria-expanded="${s.label === OPEN}">${ic(s.label === OPEN ? 'CaretDown' : 'CaretRight')}<b>${esc(s.label)}</b><span class="fig">${plural(s.list.length, 'model')}</span><span class="fig b-from">from ${money(spanAt(s.list, 'cash').lo)}</span></button>
  ${
    s.label === OPEN
      ? `<ul class="b-models">${s.list
          .map(
            (m) =>
              `<li><a href="?model=${encodeURIComponent(m.key)}"${m === M ? ' aria-current="true" class="on"' : ''}><span>${esc(m.said)}</span><span class="fig">${at(m).said}</span></a></li>`,
          )
          .join('')}</ul>`
      : ''
  }
</li>`

const kit = (kind, name, facts, price, { star, note, tag } = {}) => `
<li class="b-kit${star ? ' star' : ''}">
  <span class="b-kind">${kind}${star ? `<span class="b-rec">${ic('Star', { weight: 'fill' })} Recommended</span>` : ''}${tag ? `<span class="b-tag">${tag}</span>` : ''}</span>
  <b class="b-kname">${esc(name)}</b>
  ${facts ? `<span class="b-kfacts fig">${facts}</span>` : ''}
  <span class="b-kprice fig">${price != null ? `<b>${money(price)}</b><small>at this boat's Cash</small>` : `<i>${note}</i>`}</span>
</li>`

const motors = M.fit.motorList.map((x) =>
  kit('Outboard', x.name, x.facts, x.price, { star: x.starred }),
)
const trailers = M.fit.trailerList.map((t) =>
  kit(
    'Trailer',
    t.name,
    `ATM ${n(t.capacity)} kg · carries the ${n(M.fit.boatWeight)} kg boat`,
    t.price,
    { star: t.starred },
  ),
)
const dealer = C.df.first.map((d) =>
  kit('Dealer fit', d.name, '', d.price, {
    note: 'No price chosen for Dealer Fit yet. <a class="door" href="/levels?list=dealer_fit">Prices</a>',
  }),
)
const parts = C.pd.first.map((d) => kit('Part', d.name, '', d.price))
const pic = M.hero ?? M.catalogue
const [L, Pp, H] = three(M)

const body = `
<main class="b frame" data-testid="place">
  <nav class="b-trail">${btn('Back to the price list', { icon: 'ArrowLeft', size: 'sm', href: '/data?at=boat_highfield' })}</nav>

  <header class="b-head livery" data-livery="${P.ground.key}">
    <div class="b-id"><span class="kindword">Boats</span><h1>${mark(P)}<span class="sr">${esc(P.name)}</span></h1></div>
    <p class="b-facts fig"><b>${P.figure.holds}</b><span>from ${money(ALL.lo)} to ${money(ALL.hi)} at Cash</span><span>${n(ALL.priced)} of ${n(ALL.of)} priced</span><span class="b-stamp">${ic('Calendar')} price list of ${PACKED}</span></p>
    <div class="b-acts">${btn('Quote a Highfield', { intent: 'act', icon: 'FilePlus', href: '/quote/new?brand=boat_highfield' })}${btn(`${HEROES.length} photographs`, { intent: 'veiled', icon: 'Images', cls: 'b-gal' })}</div>
  </header>

  <div class="b-look">
    <aside class="b-ask" aria-label="Which Highfield">
      <h2 class="b-q">Which Highfield?</h2>
      <label class="find b-find">${ic('MagnifyingGlass')}<input placeholder="Find a model or its code"></label>
      <ul class="b-tree">${SERIES.map(pick).join('')}</ul>
    </aside>
    <button class="b-change" aria-haspopup="dialog">${ic('Boat')}<span><small>Showing</small><b>${esc(M.said)}</b></span><span class="b-change-say">Change boat · ${HF.models.length} models</span>${ic('CaretDown')}</button>

    <section class="b-answer" aria-labelledby="b-ans-h">
      <div class="b-model">
        <figure class="b-pic">${pic ? `<img src="${pic.src}" alt="${esc(pic.subject || M.spoken)}"><figcaption class="cap">${esc((pic.subject || '').replace(/^Highfield /, ''))}</figcaption>` : ''}</figure>
        <div class="b-mwords">
          <span class="eyebrow">${esc(M.seriesLabel)} · <span class="code">${esc(M.code)}</span></span>
          <h2 id="b-ans-h">${esc(M.said)}</h2>
          <p class="b-mprice fig"><b>${at(M).said}</b> at Cash · ${plural(M.rows, 'version')} in ${M.materials.map((x) => x.label).join(' or ')}</p>
          <dl class="b-three fig"><div><dt>Length</dt><dd>${esc(L)}</dd></div><div><dt>People</dt><dd>${esc((Pp ?? '—').replace(' people', ''))}</dd></div><div><dt>Horsepower</dt><dd>${esc(H.replace(' hp', ''))}<small>hp</small></dd></div></dl>
          <div class="b-macts">${btn(`Quote the ${M.said}`, { intent: 'act', icon: 'FilePlus', size: 'sm' })}${btn('Compare with…', { intent: 'secondary', icon: 'Scales', size: 'sm' })}${btn('Change what fits', { icon: 'Wrench', size: 'sm', href: `/fitment?boat=${M.key}` })}</div>
        </div>
      </div>

      <div class="b-fitshead">
        <h3><span class="fig">${C.total}</span> things fit the ${esc(M.said)}</h3>
        <p class="said">From the price list's own lists of what fits which boat, read for this model. ${esc(M.fit.motorTakes ? `It takes ${M.fit.motorTakes}.` : '')}</p>
        <div class="b-facets">${chip('Everything', { on: true, count: C.total })}${chip('Motors', { count: C.motors, icon: 'Engine' })}${chip('Trailers', { count: C.trailers, icon: 'TruckTrailer' })}${chip('Dealer fit', { count: C.dealerFit, icon: 'Package' })}${chip('Parts', { count: C.parts, icon: 'Toolbox' })}</div>
      </div>
      <h4 class="b-group">${ic('Engine')} Motors <span class="fig">${C.motors} from ${esc(M.fit.motorTable)}</span></h4>
      <ul class="b-kits">${motors.join('')}</ul>
      <h4 class="b-group">${ic('TruckTrailer')} Trailers <span class="fig">${C.trailers} of ${n(M.fit.trailerOnSale)} on sale</span></h4>
      <ul class="b-kits">${trailers.join('')}</ul>
      <h4 class="b-group">${ic('Package')} Dealer fit packages <span class="fig">${C.dealerFit}</span></h4>
      <ul class="b-kits">${dealer.join('')}</ul>
      <h4 class="b-group">${ic('Toolbox')} Parts <span class="fig">${C.parts}</span></h4>
      <ul class="b-kits">${parts.join('')}</ul>
      <p class="b-std">${ic('Info')}<span>What comes standard on the ${esc(M.said)} is not held yet: it waits on Northside's Boat Module and Factory Options workbooks.</span></p>
    </section>
  </div>

  <footer class="b-census" aria-label="Highfield across the price list">
    <h3>Highfield across the price list</h3>
    <ul>
      <li><b class="fig">${HF.models.length}</b><span>models</span></li>
      <li><b class="fig">${n(HF.rows)}</b><span>versions</span></li>
      ${P.partners.map((g) => `<li data-livery="${g.ground.key}"><b class="fig">${n(g.fits)}</b><span>fits with ${esc(g.name)}</span></li>`).join('')}
      <li><b class="fig">${P.edited}</b><span>lines changed since the price list came in</span></li>
    </ul>
  </footer>

  <section class="b-after">
    <div class="b-plate"><h3>${ic('Tag')} Its prices</h3>
      <ul class="b-spans">${SERIES.map((s) => {
        const c = spanAt(s.list, 'cash')
        const t = spanAt(s.list, 'trade')
        return `<li><b>${esc(s.label)}</b><span class="fig">${money(c.lo)}–${money(c.hi)} Cash</span><span class="fig">${money(t.lo)}–${money(t.hi)} Trade</span><small class="fig">${n(c.priced)} of ${n(c.of)} priced</small></li>`
      }).join('')}</ul>
      <p class="quiet-say">Warranty carries a figure on all ${n(ALL.of)} versions.</p>${btn('Decide Highfield’s prices', { icon: 'ArrowRight', size: 'sm', href: P.pricesHref })}</div>
    <div class="b-plate"><h3>${ic('FileText')} Quotes on a Highfield <span class="fig">0</span></h3><p class="quiet-say">No quote on a Highfield is held in this browser yet. Each one will read as a person says it: the customer, “Sport 660”, the total at its level, given or draft.</p></div>
    <div class="b-plate"><h3>${ic('SlidersHorizontal')} How it is dressed</h3><p class="quiet-say">Its line, mark, photograph and colour, each one step with Undo.</p>${btn('Highfield’s settings', { icon: 'ArrowRight', size: 'sm', href: '?tab=settings' })}</div>
  </section>
</main>`

/* ---- compare in B: two answers side by side, the differences counted ---- */
const A6 = model(HF, 'Sport 600')
const sameMotors =
  A6.fit.motorList.map((x) => x.name).join() === M.fit.motorList.map((x) => x.name).join()
const sameTrailers =
  A6.fit.trailerList.map((x) => x.name).join() === M.fit.trailerList.map((x) => x.name).join()
const compareState = `
<div class="b-cmp">
  <p class="said">${esc(`Sport 600 beside Sport 660: ${sameMotors ? 'the same 7 motors' : 'different motors'}, ${sameTrailers ? 'the same 2 trailers (both filed “t/s Highfield Sport 660”)' : 'different trailers'}, and dealer fit that differs only in the tube covers' length (6.0 m and 6.6 m).`)}</p>
  <div class="b-cmpcols">${[A6, M]
    .map(
      (m) => `<div><b>${m.said}</b><span class="fig">${at(m).said} at Cash</span><ul>
      <li>${carries(m).motors} motors · ${esc(carries(m).starred.name)} recommended</li>
      <li>${carries(m).trailers} trailers</li>
      <li>${esc(carries(m).df.first[0].name)}</li>
      <li>${esc(carries(m).pd.first[0].name)} · ${money(carries(m).pd.first[0].price)}</li></ul></div>`,
    )
    .join('')}</div>
</div>`

const css = `
.b { display: grid; gap: 16px; }
.b-head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px 28px; padding: 18px 24px; border-radius: var(--radius-plate); box-shadow: var(--shadow-plate); --mark-h: 48px; }
.b-id { display: grid; gap: 4px; }
.b-id h1 { display: flex; }
.b-facts { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: var(--text-base); }
.b-facts b { font-weight: 800; }
.b-stamp { display: inline-flex; gap: 6px; align-items: center; opacity: 0.9; }
.b-acts { display: flex; gap: 8px; flex-wrap: wrap; justify-content: end; }

.b-look { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 20px; align-items: start; }
.b-ask { position: sticky; top: 72px; display: grid; gap: 10px; padding: 14px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); }
.b-q { font-size: var(--text-xl); }
.b-tree { display: grid; }
.b-series-head { all: unset; box-sizing: border-box; display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; grid-template-areas: "c n k" "c f f"; gap: 0 8px; inline-size: 100%; padding: 8px 4px; border-block-end: 1px solid var(--color-rule); cursor: pointer; }
.b-series-head .ui-icon { grid-area: c; align-self: center; color: var(--color-ink-3); }
.b-series-head b { grid-area: n; }
.b-series-head .fig { grid-area: k; font-size: var(--text-sm); color: var(--color-ink-3); }
.b-series-head .b-from { grid-area: f; font-size: var(--text-xs); }
.b-models { display: grid; padding: 4px 0 8px 22px; border-block-end: 1px solid var(--color-rule); }
.b-models a { display: flex; justify-content: space-between; gap: 10px; padding: 5px 8px; border-radius: var(--radius-sm); font-size: var(--text-sm); }
.b-models a .fig { color: var(--color-ink-3); white-space: nowrap; }
.b-models a.on { background: var(--color-blue-800); color: var(--color-white); font-weight: 700; }
.b-models a.on .fig { color: var(--color-blue-100); }
.b-change { display: none; }

.b-answer { display: grid; gap: 12px; }
.b-model { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); overflow: hidden; }
.b-pic { position: relative; margin: 0; min-block-size: 250px; }
.b-pic img { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; object-fit: cover; }
.b-mwords { display: grid; align-content: center; gap: 8px; padding: 18px 22px; }
.b-mwords h2 { font-size: var(--text-5xl); line-height: 1; letter-spacing: -0.01em; }
.b-mprice { font-size: var(--text-base); color: var(--color-ink-2); }
.b-mprice b { font-size: var(--text-xl); color: var(--color-ink); }
.b-three { display: grid; grid-template-columns: repeat(3, auto); justify-content: start; gap: 22px; margin: 4px 0; }
.b-three div { display: flex; flex-direction: column-reverse; }
.b-three dd { margin: 0; font-size: var(--text-3xl); font-weight: 800; line-height: 1.05; }
.b-three dd small { font-size: var(--text-base); margin-inline-start: 3px; }
.b-three dt { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
.b-macts { display: flex; flex-wrap: wrap; gap: 8px; }

.b-fitshead { display: grid; gap: 6px; padding-block-start: 6px; }
.b-fitshead h3 { font-size: var(--text-3xl); letter-spacing: -0.01em; }
.b-fitshead h3 .fig { color: var(--color-blue-800); }
.b-facets { display: flex; flex-wrap: wrap; gap: 6px; }
.b-group { display: flex; align-items: center; gap: 8px; font-size: var(--text-lg); margin-block-start: 6px; }
.b-group .fig { font-size: var(--text-sm); color: var(--color-ink-3); font-weight: 600; }
.b-kits { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); }
.b-kit { display: grid; align-content: start; gap: 4px; padding: 12px 14px; border-radius: var(--radius-tile); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); }
.b-kit.star { box-shadow: 0 0 0 2px var(--color-act), var(--shadow-sm); }
.b-kind { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-3); }
.b-rec { display: inline-flex; gap: 4px; align-items: center; padding: 1px 8px; border-radius: var(--radius-pill); background: var(--color-act); color: var(--color-ink-on-act); letter-spacing: 0; text-transform: none; }
.b-kname { font-size: var(--text-base); line-height: 1.3; }
.b-kfacts { font-size: var(--text-sm); color: var(--color-ink-2); }
.b-kprice { display: flex; gap: 6px; align-items: baseline; margin-block-start: 2px; }
.b-kprice b { font-size: var(--text-lg); }
.b-kprice small { font-size: var(--text-xs); color: var(--color-ink-3); }
.b-kprice i { font-style: normal; font-size: var(--text-sm); color: var(--color-ink-reason); }
.b-std { display: flex; gap: 8px; align-items: flex-start; font-size: var(--text-sm); color: var(--color-ink-reason); }
.b-std .ui-icon { flex: none; margin-block-start: 2px; }

.b-census { display: grid; gap: 10px; padding: 16px 20px; border-radius: var(--radius-plate); background: var(--color-panel); box-shadow: inset 0 0 0 1px var(--color-rule-strong); }
.b-census h3 { font-size: var(--text-sm); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-3); }
.b-census ul { display: flex; flex-wrap: wrap; gap: 10px 32px; }
.b-census li { display: grid; }
.b-census b { font-size: var(--text-3xl); font-weight: 800; line-height: 1.1; }
.b-census span { font-size: var(--text-sm); color: var(--color-ink-2); }
.b-after { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 14px; align-items: start; }
.b-plate { display: grid; gap: 10px; padding: 16px 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); }
.b-plate h3 { display: flex; gap: 8px; align-items: center; font-size: var(--text-lg); }
.b-plate h3 .fig { margin-inline-start: auto; font-size: var(--text-sm); color: var(--color-ink-3); }
.b-spans li { display: grid; grid-template-columns: 90px repeat(2, minmax(0, 1fr)) auto; gap: 8px; padding: 5px 0; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); align-items: baseline; }
.b-spans small { font-size: var(--text-xs); color: var(--color-ink-3); }
.b-cmp { display: grid; gap: 10px; }
.b-cmpcols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.b-cmpcols > div { display: grid; gap: 4px; padding: 12px; border-radius: var(--radius-md); background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule); font-size: var(--text-sm); }
.b-cmpcols ul { display: grid; gap: 3px; color: var(--color-ink-2); }

${STATE_CSS}

@media (min-width: 1600px) { .b-look { grid-template-columns: 360px minmax(0, 1fr); } .b-pic { min-block-size: 300px; } }
@media (max-width: 1100px) {
  .b-head { grid-template-columns: 1fr auto; }
  .b-facts { grid-column: 1 / -1; grid-row: 2; }
  .b-after { grid-template-columns: 1fr 1fr; }
}
/* 834 and below: the question folds into one chooser line, and the answer comes first */
@media (max-width: 899px), (max-height: 480px) {
  .b-look { grid-template-columns: 1fr; }
  .b-ask { display: none; }
  .b-change { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 12px; min-block-size: 52px; padding-inline: 14px; border: 0; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-control-edge); font: inherit; color: var(--color-ink); text-align: start; }
  .b-change span { display: grid; }
  .b-change small { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 700; }
  .b-change-say { font-size: var(--text-sm); color: var(--color-ink-file); font-weight: 600; }
}
@media (max-width: 599px), (max-height: 480px) {
  .b-trail, .b-gal { display: none; }
  .b-head { grid-template-columns: 1fr; padding: 14px 16px; gap: 8px; --mark-h: 32px; }
  .b-facts { grid-row: auto; font-size: var(--text-sm); gap: 2px 12px; }
  .b-acts { justify-content: start; }
  .b-model { grid-template-columns: 1fr; }
  .b-pic { min-block-size: 0; aspect-ratio: 16 / 9; }
  .b-mwords { padding: 14px 16px; }
  .b-mwords h2 { font-size: var(--text-4xl); }
  .b-three dd { font-size: var(--text-2xl); }
  .b-fitshead h3 { font-size: var(--text-2xl); }
  .b-after { grid-template-columns: 1fr; }
  .b-change-say { display: none; }
  .b-census b { font-size: var(--text-2xl); }
  .b-spans li { grid-template-columns: 1fr 1fr; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .b-head { grid-template-columns: auto minmax(0, 1fr) auto; padding: 8px 14px; --mark-h: 26px; }
  .b-head .kindword, .b-stamp { display: none; }
  .b-facts { grid-row: auto; grid-column: auto; }
  .b-model { grid-template-columns: 40% 1fr; }
  .b-pic { aspect-ratio: auto; }
}
`

const notes = `
<section class="notes" aria-label="The board's notes">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Board B · a maker's own page</span><h2>The lookup</h2></div>
  <p><b>The screen's one job:</b> one maker as Northside sells it: its line, its mark, its photographs and colour, <b>its models and what each carries</b>.</p>
  <p><b>What only this screen does.</b> It reads everything one model carries, across every list that fits it (motors, trailers, dealer fit, parts), as one answer with its count, without changing anything. Fitment answers the same question for one boat in order to change it (“Take it off”, “Put it on”); the picker answers nothing about fit. The risk is plain: B is the closest of the three to an existing screen, and a judge may call its spine Fitment's.</p>
  <div class="cols">
    <section><h3>Order and grouping</h3><ul class="dash">
      <li>One compact head for every place, photograph or not: mark, ${P.figure.holds}, the span, n of n priced, <b>the price list's date</b> (as Rhino-Rack stamps its data), the act and the gallery.</li>
      <li>Left, the question: a find, then the series, each folded to its count and from-price; the open series lists its models with their from-price (the range is here, as a list).</li>
      <li>Right, the answer: the model's own photograph and its three figures; then <b>“16 things fit the Sport 660”</b> as the title, the facets, and kit cards grouped motors → trailers → dealer fit → parts, the recommended motor and trailer marked.</li>
      <li>A census of the maker across the price list, then prices, quotes and Settings.</li>
      <li>The model is in the address (<code>?model=boat_highfield:513</code>); a facet is <code>?only=motors</code>.</li>
    </ul></section>
    <section><h3>References new to this board</h3><ul class="dash">
      <li><b>Rhino-Rack's dealer fitment lookup</b> (<code>live/rhinorack-dealer-model.png</code>, <code>rhinorack-dealer-model-year.png</code>, <code>rhinorack-dealer-tool.png</code>): the count as the answer's title (165 FITS), facets only for what the answer holds, kit cards with their kind in small caps, the data's date in the head, a census foot that prints its zero.</li>
      <li><b>Easytow's trailers by hull length</b> (<code>live/easytow-trailers.png</code>, <code>easytow-hull-51-56.png</code>): a trailer read by the boat it carries; here, ATM against the boat's own weight.</li>
      <li>Also: <code>live/ryco-vehicle-type.png</code> (the cascade asks only what the answer needs), and <code>live/rhinorack-dealer-390.png</code> as what to avoid: filters before answers on a phone.</li>
    </ul><p>No earlier board cites Rhino-Rack or Easytow.</p></section>
  </div>
  <div class="cols">
    <section><h3>The mark, the photograph</h3><p>The mark stays the showpiece in white on cobalt, but the head is one height for all 25 places (about 110 px), so the 18 with no photograph are never a band of empty colour. The photograph moves to where it belongs: on the answer, the open model's own (the Sport 660 on the water, its caption printed). A model with no held photograph shows its catalogue render; with neither, the answer's left half closes and the figures take the width.</p>
    <h3>What a dealer can replace</h3><p>Ground, mark ink, line and photograph from Settings, unchanged; the head reads the same in any of the eight grounds because it carries no picture.</p></section>
    <section><h3>Dealer Fit's price, said where it would print</h3><p>Dealer Fit Packages declares no price level (Prices names none for it), so every package card says “No price chosen for Dealer Fit yet” in the price's own place, with the door to Prices, as CarExpert prints “Price not available”. Parts and motors carry the figure the build would put on the quote, at this boat's Cash.</p></section>
  </div>

  <section><h3>Further states, drawn from the file</h3>
  <div class="cols">
    <div class="state"><span class="eyebrow">Compare with… · Sport 600 beside Sport 660</span>${compareState}</div>
    <div class="state"><span class="eyebrow">Jeanneau · the question lists its 4 with no series first</span>${jeanneau('rows')}</div>
  </div>
  <div class="cols">
    <div class="state"><span class="eyebrow">Yamaha · the lookup turns round: by horsepower, then the boats a motor fits</span>${yamaha('rows', '175')}</div>
    <div class="state"><span class="eyebrow">Labour Rates · no declared price</span>${labour('rows')}</div>
  </div>
  <div class="cols">
    <div class="state"><span class="eyebrow">OBSOLETE Trailers</span>${obsolete('rows')}</div>
    <div class="state"><span class="eyebrow">Parts and Dealer Fit · the hand-off</span>${handoff()}</div>
  </div></section>

  <div class="cols">
    <section><h3>Type, at 1:1</h3>${specimen([
      ['Model, 34 / 800', 'font-size:var(--text-5xl);font-weight:800;line-height:1', 'Sport 660'],
      [
        'Three figures, 26 / 800',
        'font-size:var(--text-3xl);font-weight:800',
        '6.52 m · 13 · 150–200',
      ],
      [
        'Answer title, 26 / 700',
        'font-size:var(--text-3xl);font-weight:700',
        '16 things fit the Sport 660',
      ],
      [
        'Kind, 12 caps',
        'font-size:var(--text-xs);font-weight:700;letter-spacing:.08em;text-transform:uppercase',
        'Outboard',
      ],
      ['Kit name, 14 / 700', 'font-size:var(--text-base);font-weight:700', 'Yamaha F175XC'],
      ['Kit facts, 13', 'font-size:var(--text-sm)', '175 hp · 220 kg · 25″ shaft'],
    ])}</section>
    <section><h3>Motion</h3><p>A model chosen on the left: the answer's words cross-fade in <code>--duration-enter</code>, the photograph cross-fades in <code>--duration-reveal</code>, the count in the title changes in place (16 → 13 for the Sport 560), and the left list does not move. A facet: cards that leave fade in <code>--duration-exit</code>, the remaining ones close the gap with <code>--duration-settle</code>.</p>
    <p><b>Reduced motion:</b> cuts; the count changes in place with no ticking.</p>
    <p><b>Keyboard:</b> Back, the act, the find, the series (Enter opens one), its models, then the answer: its acts, the facets, the kit cards; the census and plates last. At 834 and below, “Change boat” opens the same list as a dialog that returns focus to it.</p></section>
  </div>

  <section><h3>How it reflows</h3>
  <table><thead><tr><th>Size</th><th>The page</th></tr></thead><tbody>
    <tr><td>1920 × 1080</td><td>Question 360 px, answer to the right with a 300 px photograph; kit cards five to a row.</td></tr>
    <tr><td>1440 × 900</td><td>Drawn. The question beside the answer; the model and the title of its fits inside the first screen.</td></tr>
    <tr><td>1280 × 800</td><td>The same, kit cards three to a row.</td></tr>
    <tr><td>834 × 1112</td><td>The question folds to one “Change boat” line under the head; the answer takes the width.</td></tr>
    <tr><td>844 × 390</td><td>Head one line; “Change boat”; the answer with photograph left and figures right; the act inside the first screen.</td></tr>
    <tr><td>390 × 844</td><td>Drawn. The answer comes first (the opposite of Rhino-Rack at 390): head, “Showing Sport 660”, the photograph, the figures. The range of 67 is a press away, not on the screen: B's cost on a phone.</td></tr>
  </tbody></table></section>

  <section><h3>Honest constraints</h3><ul class="dash">
    <li>Every figure is read through the app's own readers (<code>boards/extract.facts.ts</code>): <code>readBoatFit</code> for the kit cards (the same reading Fitment and the build offer), <code>fleetOf</code> for from-prices, <code>readPlace</code> for partners.</li>
    <li>No cost or margin is read. Prices on kit cards are at this boat's Cash, the figure the build would freeze.</li>
    <li>${jeanneauSentence}</li>
    <li>${labourSentence}</li>
    <li>The census counts the maker across the price list; the answer counts one model. They never share a figure.</li>
  </ul></section>

  ${jobsTable([
    [
      'J1 What Highfield makes',
      "The question column: every series and its models with from-prices. On a phone it is behind “Change boat”: B's weakest answer.",
    ],
    [
      'J2 Budget, family, tow car',
      "From-price on every model in the list; the answer's three figures; trailers say ATM against the boat's weight.",
    ],
    [
      'J3 What goes on one model',
      'The spine: every motor, trailer, package and part as a card, recommended marked; Change what fits → /fitment?boat=.',
    ],
    ['J4 On the water', "The open model's own photograph; the head's gallery opens all 18."],
    ['J5 Start the quote', 'Quote a Highfield; Quote the Sport 660 on the answer.'],
    ['J6 An earlier quote', 'Quotes on a Highfield, empty today, read as a person says it.'],
    ['J7–J11 Settings', "Unchanged, one press from How it is dressed; the judge's words fixed."],
    [
      'J12 Every model',
      "The question lists every model; Jeanneau's 4 head its list under their sentence.",
    ],
    ['J13 Its prices', 'Spans by series at Cash and Trade, n of n priced, door to Prices.'],
    ['J14 What changed', 'The census prints “0 lines changed”; a figure above 0 opens History.'],
    [
      'J15 A series in the price list',
      "From the series row's own menu (not drawn here): Open in the price list.",
    ],
    ['J16 Go to Yamaha', 'The census names each partner; a press opens its page.'],
    ['J17–J19', "Labour Rates' sentence; OBSOLETE's ten; the unknown address unchanged."],
    [
      'Missing: compare',
      'Compare with… sets two answers side by side, the differences said in a sentence.',
    ],
    [
      'Missing: series in place, phone first, hand-off, non-boat ranges',
      'The open series in the address; the answer first at 390; Parts opens /catalogue; Yamaha by horsepower.',
    ],
  ])}
</div>
</section>`

export const html = page({ title: 'The lookup', id: 'b', css, body, notes })
