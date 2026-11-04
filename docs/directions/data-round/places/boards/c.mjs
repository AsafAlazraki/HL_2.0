/* BOARD C — THE SPEC SHEET. /places/boat_highfield?series=Sport&compare=boat_highfield:497,boat_highfield:481,boat_highfield:513
   The models of a series as a ladder by length, every rung its three figures and its price; the
   chosen two or three set side by side as a banded spec sheet, as Apple sets its compare and
   Quicksilver its specifications. The head is three figures for the maker, as Arc heads a boat.
   The question this page answers on its own is the second one at the desk: "the 600 or the 660?" */
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
const CMP = ['Sport 560', 'Sport 600', 'Sport 660'].map((s) => model(HF, s))
const ladder = shown.list.toSorted(
  (a, b) => a.spec.length.lo - b.spec.length.lo || (at(a).lo ?? 0) - (at(b).lo ?? 0),
)
const maxLen = Math.max(...shown.list.map((m) => m.spec.length.hi))

const rung = (m) => {
  const on = CMP.includes(m)
  const [L, Pp, H] = three(m)
  const pct = Math.round((m.spec.length.hi / maxLen) * 100)
  return `<li class="c-rung${on ? ' on' : ''}">
    <label class="c-tick"><input type="checkbox"${on ? ' checked' : ''} aria-label="Compare the ${esc(m.spoken)}"></label>
    <span class="c-rname"><b>${esc(m.said)}</b><span class="fig">${esc(Pp ? Pp.replace(' people', ' ppl') : 'people —')} · ${esc(H)}</span></span>
    <span class="c-bar" style="--len:${pct}%"><i></i><b class="fig">${esc(L)}</b></span>
    <span class="c-rprice fig">${at(m).said}</span>
  </li>`
}

const rows = [
  [
    'Price',
    [
      ['From, at Cash', (m) => at(m).said],
      ['From, at Trade', (m) => `from ${money(m.levels.find((l) => l.key === 'trade').lo)}`],
      ['Versions', (m) => `${m.rows} · ${m.materials.map((x) => x.label).join(' or ')}`],
    ],
  ],
  [
    'Specifications',
    [
      ['Length', (m) => metres(m.spec.length)],
      ['Beam', (m) => metres(m.spec.beam) ?? '—'],
      ['People', (m) => (people(m.spec.people) ?? '—').replace(' people', '')],
      ['Max load', (m) => kg(m.spec.load) ?? '—'],
      ['Boat weight', (m) => kg(m.spec.weight) ?? '—'],
      ['Fuel', (m) => words(m.spec.fuel) ?? '—'],
      ['Tube diameter', (m) => (m.spec.tube ? `${words(m.spec.tube)} cm` : '—')],
      ['Air chambers', (m) => words(m.spec.chambers) ?? '—'],
    ],
  ],
  [
    'What fits',
    [
      ['Horsepower', (m) => hp(m.spec)],
      ['Shaft', (m) => m.spec.shaft ?? '—'],
      ['Motors that fit', (m) => `${carries(m).motors}`],
      ['Recommended', (m) => (carries(m).starred ? esc(carries(m).starred.name) : '—')],
      ['Trailers that fit', (m) => `${carries(m).trailers}`],
      ['Dealer fit', (m) => `${carries(m).dealerFit}`],
      ['Parts', (m) => `${carries(m).parts}`],
    ],
  ],
]

const sheet = `
<section class="c-sheet" aria-labelledby="c-sheet-h">
  <div class="c-sheethead">
    <h2 id="c-sheet-h">${CMP.length} side by side</h2>
    ${chip('Highlight differences', { on: true, icon: 'Highlighter' })}
  </div>
  <table class="c-spec fig">
    <thead><tr><th scope="col"><span class="sr">Row</span></th>${CMP.map(
      (m, i) => `<th scope="col" class="c-col${i === 0 ? ' c-col--third' : ''}">
      <span class="c-colpic">${m.catalogue ? `<img src="${m.catalogue.src}" alt="${esc(m.spoken)}">` : ''}</span>
      <b>${esc(m.said)}</b><span class="c-colprice">${at(m).said}</span>
      <span class="c-colacts">${btn('What fits', { size: 'sm', icon: 'Wrench', href: `/fitment?boat=${m.key}`, aria: `What fits the ${m.spoken}` })}${btn('Quote', { size: 'sm', intent: 'secondary', icon: 'FilePlus', aria: `Quote the ${m.spoken}` })}</span>
    </th>`,
    ).join('')}</tr></thead>
    ${rows
      .map(
        ([band, list]) =>
          `<tbody><tr class="c-band"><th colspan="${CMP.length + 1}">${band}</th></tr>${list
            .map(([lab, f]) => {
              const vals = CMP.map(f)
              const same = vals.every((v) => v === vals[0])
              return `<tr class="${same ? 'same' : 'differs'}"><th scope="row">${lab}</th>${vals.map((v, i) => `<td class="${i === 0 ? 'c-col--third' : ''}">${v}</td>`).join('')}</tr>`
            })
            .join('')}</tbody>`,
      )
      .join('')}
  </table>
  <p class="c-said">${ic('Info')}<span>Measured from the price list: the Sport 600 and the Sport 660 carry the same length, beam, people, load, weight, fuel and horsepower, so only their price and versions are lit between them. What comes standard on each is not held yet: it waits on Northside's Boat Module and Factory Options workbooks.</span></p>
</section>`

const body = `
<main class="c frame" data-testid="place">
  <nav class="c-trail">${btn('Back to the price list', { icon: 'ArrowLeft', size: 'sm', href: '/data?at=boat_highfield' })}</nav>
  <header class="c-head livery" data-livery="${P.ground.key}">
    <div class="c-id"><span class="kindword">Boats</span><h1>${mark(P)}<span class="sr">${esc(P.name)}</span></h1></div>
    <dl class="c-three fig">
      <div><dt>models in ${SERIES.length} series</dt><dd>${HF.models.length}</dd></div>
      <div><dt>long</dt><dd>${LEN.lo}–${LEN.hi}<small>m</small></dd></div>
      <div><dt>at Cash, ${n(ALL.priced)} of ${n(ALL.of)} priced</dt><dd><small>$</small>${n(ALL.lo)}–${n(ALL.hi)}</dd></div>
    </dl>
    <div class="c-acts">${btn('Quote a Highfield', { intent: 'act', icon: 'FilePlus', href: '/quote/new?brand=boat_highfield' })}${btn(`${HEROES.length} on the water`, { intent: 'veiled', icon: 'Images', cls: 'c-gal' })}</div>
  </header>

  <nav class="c-series" aria-label="Highfield's series">${seg('c-ser', 'Series', ['Every series', ...SERIES.map((s) => s.label)], ON)}</nav>
  <button class="c-pick">${ic('Boat')}<span><small>Series</small><b>${ON}</b></span><span class="fig">${plural(shown.list.length, 'model')}</span>${ic('CaretDown')}</button>

  <div class="c-split">
    <section class="c-ladder" aria-labelledby="c-lad-h">
      <div class="c-ladhead">
        <h2 id="c-lad-h">${esc(ON)} by length <span class="fig">${plural(shown.list.length, 'model')}</span></h2>
        ${seg('c-ord', 'Order', ['Length', 'Price', 'File order'], 'Length')}
      </div>
      <p class="said fig">${metres(lengthSpan(shown.list))} · from ${money(spanAt(shown.list, 'cash').lo)} to ${money(spanAt(shown.list, 'cash').hi)} at Cash · ${n(spanAt(shown.list, 'cash').priced)} of ${n(spanAt(shown.list, 'cash').of)} versions priced · tick up to three to set them side by side</p>
      <ol class="c-rungs">${ladder.map(rung).join('')}</ol>
      ${btn(`Open ${ON} in the price list`, { icon: 'Database', size: 'sm', href: `/data/boat_highfield?in=${ON}` })}
    </section>
    ${sheet}
  </div>

  <section class="c-after">
    <div class="c-plate"><h3>${ic('Tag')} Its prices, by series</h3><ul class="c-spans">${SERIES.map(
      (s) => {
        const c = spanAt(s.list, 'cash')
        const t = spanAt(s.list, 'trade')
        return `<li${s.label === ON ? ' class="on"' : ''}><b>${esc(s.label)}</b><span class="fig">${money(c.lo)}–${money(c.hi)}</span><span class="fig">Trade ${money(t.lo)}–${money(t.hi)}</span><small class="fig">${n(c.priced)}/${n(c.of)}</small></li>`
      },
    ).join(
      '',
    )}</ul><p class="quiet-say">Cash, then Trade; the figure after is versions priced of versions. Warranty carries a figure on all ${n(ALL.of)}.</p>${btn('Decide Highfield’s prices', { icon: 'ArrowRight', size: 'sm', href: P.pricesHref })}</div>
    <div class="c-plate"><h3>${ic('FileText')} Quotes on a Highfield <span class="fig">0</span></h3><p class="quiet-say">No quote on a Highfield is held in this browser yet. Each will read “Sport 660”, its customer, its total and whether it is given.</p>
      <h3>${ic('ClockCounterClockwise')} Changed here</h3><p class="quiet-say">No line of Highfield Inflatables has been changed since the price list came in.</p></div>
    <div class="c-plate"><h3>${ic('LinkSimple')} Goes with</h3><ul class="c-partners">${P.partners.map((g) => `<li data-livery="${g.ground.key}"><span class="c-pchip livery">${g.mark.drawn ? mark(g) : ic(g.kind === 'accessory' ? 'Toolbox' : g.kind === 'package' ? 'Package' : 'TruckTrailer')}</span><b>${esc(g.name)}</b><span class="fig">${n(g.fits)}</span></li>`).join('')}</ul>
      ${btn('Highfield’s settings', { icon: 'SlidersHorizontal', size: 'sm', href: '?tab=settings' })}</div>
  </section>
</main>`

const css = `
.c { display: grid; gap: 14px; }
.c-head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px 36px; padding: 20px 28px; border-radius: var(--radius-plate); box-shadow: var(--shadow-plate); --mark-h: 52px; }
.c-id { display: grid; gap: 4px; }
.c-id h1 { display: flex; }
.c-three { display: flex; flex-wrap: wrap; gap: 6px 36px; margin: 0; justify-content: center; }
.c-three div { display: flex; flex-direction: column-reverse; }
.c-three dd { margin: 0; font-size: var(--text-5xl); font-weight: 800; line-height: 1; letter-spacing: -0.01em; }
.c-three dd small { font-size: var(--text-lg); margin-inline: 2px; }
.c-three dt { font-size: var(--text-sm); opacity: 0.9; }
.c-acts { display: flex; flex-wrap: wrap; gap: 8px; justify-content: end; }
.c-series .ui-segmented-frame { max-inline-size: 100%; }
.c-series .ui-segmented { flex-wrap: wrap; }
.c-pick { display: none; }

.c-split { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 18px; align-items: start; }
.c-ladder { display: grid; gap: 8px; align-content: start; }
.c-ladhead { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; }
.c-ladhead h2 { font-size: var(--text-2xl); display: flex; gap: 8px; align-items: baseline; }
.c-ladhead h2 span { font-size: var(--text-sm); color: var(--color-ink-3); font-weight: 600; }
.c-rungs { display: grid; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); overflow: hidden; }
.c-rung { display: grid; grid-template-columns: 28px minmax(0, 1.2fr) minmax(0, 1fr) 7.5em; gap: 10px; align-items: center; padding: 5px 12px 5px 8px; border-block-end: 1px solid var(--color-rule); }
.c-rung.on { background: var(--color-chosen-wash); }
.c-tick { display: grid; place-items: center; min-block-size: 28px; }
.c-tick input { inline-size: 18px; block-size: 18px; accent-color: var(--color-blue-800); }
.c-rname { display: grid; min-inline-size: 0; line-height: 1.25; }
.c-rname b { font-size: var(--text-sm); }
.c-rname span { font-size: var(--text-xs); color: var(--color-ink-3); }
.c-bar { position: relative; display: flex; align-items: center; block-size: 22px; }
.c-bar i { display: block; block-size: 10px; inline-size: var(--len); border-radius: var(--radius-pill); background: var(--color-blue-300); }
.c-rung.on .c-bar i { background: var(--color-blue-800); }
.c-bar b { margin-inline-start: 6px; font-size: var(--text-xs); white-space: nowrap; }
.c-rprice { font-size: var(--text-sm); font-weight: 700; text-align: end; white-space: nowrap; }

.c-sheet { position: sticky; top: 72px; display: grid; gap: 8px; }
.c-sheethead { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.c-sheethead h2 { font-size: var(--text-2xl); }
.c-spec { border-collapse: separate; border-spacing: 0; inline-size: 100%; table-layout: fixed; background: var(--color-plate); border-radius: var(--radius-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); overflow: hidden; font-size: var(--text-sm); }
.c-spec th, .c-spec td { text-align: start; padding: 5px 10px; vertical-align: top; }
.c-spec thead th { vertical-align: bottom; padding-block: 12px 8px; border-block-end: 1px solid var(--color-rule-strong); }
.c-spec thead th:first-child { inline-size: 24%; }
.c-col { display: table-cell; }
.c-colpic { display: block; aspect-ratio: 16 / 8; margin-block-end: 6px; border-radius: var(--radius-sm); background: var(--color-white); overflow: hidden; }
.c-colpic img { inline-size: 100%; block-size: 100%; object-fit: contain; }
.c-col b { display: block; font-size: var(--text-lg); }
.c-colprice { display: block; font-weight: 700; font-size: var(--text-base); }
.c-colacts { display: flex; flex-wrap: wrap; gap: 2px 4px; margin-block-start: 6px; }
.c-band th { padding-block: 10px 4px; font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-file); background: var(--color-plate); }
.c-spec tbody th { font-weight: 600; color: var(--color-ink-3); font-size: var(--text-xs); }
.c-spec tbody tr:not(.c-band):nth-child(odd) { background: var(--color-plate-tint); }
.c-spec tr.same td { color: var(--color-ink-3); }
.c-spec tr.differs td { font-weight: 700; color: var(--color-ink); }
.c-spec tr.differs th { color: var(--color-ink); }
.c-said { display: flex; gap: 8px; font-size: var(--text-sm); color: var(--color-ink-reason); }
.c-said .ui-icon { flex: none; margin-block-start: 2px; }

.c-after { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 14px; align-items: start; }
.c-plate { display: grid; gap: 10px; padding: 16px 18px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-rule); }
.c-plate h3 { display: flex; gap: 8px; align-items: center; font-size: var(--text-lg); }
.c-plate h3 .fig { margin-inline-start: auto; font-size: var(--text-sm); color: var(--color-ink-3); }
.c-spans li { display: grid; grid-template-columns: 84px minmax(0, 1fr) minmax(0, 1.2fr) auto; gap: 8px; padding: 5px 0; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); }
.c-spans li.on b { color: var(--color-ink-file); }
.c-spans small { font-size: var(--text-xs); color: var(--color-ink-3); }
.c-partners li { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 5px 0; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); }
.c-pchip { display: grid; place-items: center; block-size: 28px; border-radius: var(--radius-sm); --mark-h: 22px; }
.c-pchip .pm-plate { padding: 2px 4px; } .c-pchip .pm-plate img { block-size: 14px; }

${STATE_CSS}
.st-ladder .st-step { flex-direction: column; align-items: center; gap: 0; border-radius: var(--radius-sm); padding: 4px 8px; }

@media (max-width: 1599px) { .c-head { gap: 12px 24px; } .c-three { gap: 6px 24px; } .c-three dd { font-size: var(--text-4xl); } }
@media (max-width: 1279px) { .c-split { grid-template-columns: 1fr; } .c-sheet { position: static; } .c-after { grid-template-columns: 1fr 1fr; } }
@media (max-width: 1100px) { .c-head { grid-template-columns: 1fr auto; } .c-three { grid-column: 1 / -1; grid-row: 2; justify-content: start; } }
@media (max-width: 899px) { .c-series { display: none; } .c-pick { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; gap: 12px; align-items: center; min-block-size: 50px; padding-inline: 14px; border: 0; border-radius: var(--radius-field); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-control-edge); font: inherit; color: var(--color-ink); text-align: start; }
  .c-pick span { display: grid; } .c-pick small { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 700; } .c-pick .fig { color: var(--color-ink-3); font-size: var(--text-sm); } }
@media (max-width: 599px), (max-height: 480px) {
  .c-trail, .c-gal { display: none; }
  .c-head { grid-template-columns: 1fr; padding: 14px 16px; gap: 10px; --mark-h: 32px; }
  .c-three { grid-row: auto; gap: 4px 20px; }
  .c-three dd { font-size: var(--text-2xl); }
  .c-three dt { font-size: var(--text-xs); }
  .c-acts { justify-content: start; }
  .c-ladhead .ui-segmented-frame { display: none; }
  .c-rung { grid-template-columns: 28px minmax(0, 1fr) 7.5em; grid-template-areas: "t n p" "t b b"; row-gap: 0; }
  .c-tick { grid-area: t; } .c-rname { grid-area: n; } .c-bar { grid-area: b; } .c-rprice { grid-area: p; }
  .c-col--third { display: none; }
  .c-spec thead th:first-child { inline-size: 30%; }
  .c-colacts .ui-button-frame[data-intent="secondary"] { display: none; }
  .c-after { grid-template-columns: 1fr; }
}
@media (max-height: 480px) and (min-width: 600px) {
  .c-head { grid-template-columns: auto minmax(0, 1fr) auto; padding: 8px 14px; --mark-h: 26px; }
  .c-head .kindword { display: none; }
  .c-three { grid-row: auto; grid-column: auto; }
  .c-three { gap: 2px 18px; }
  .c-three dd { font-size: var(--text-xl); }
}
`

const notes = `
<section class="notes" aria-label="The board's notes">
<div class="frame">
  <div class="board-name"><span class="eyebrow">Board C · a maker's own page</span><h2>The spec sheet</h2></div>
  <p><b>The screen's one job:</b> one maker as Northside sells it: its line, its mark, its photographs and colour, <b>its models and what each carries</b>.</p>
  <p><b>What only this screen does.</b> It answers the second question at the desk on the page, “the 600 or the 660?”: two or three models of one maker set side by side, row by row, with every row that is the same quieted. No other screen in the app sets two boats beside each other.</p>
  <div class="cols">
    <section><h3>Order and grouping</h3><ul class="dash">
      <li>A head that is three figures for the maker (${HF.models.length} models · ${LEN.lo}–${LEN.hi} m · ${money(ALL.lo)}–${money(ALL.hi)} at Cash), the same height with or without a photograph.</li>
      <li>The series as one segmented row (<code>?series=Sport</code>).</li>
      <li>Left, the ladder: the series' models <b>by length</b>, each rung its people, horsepower, a bar for its length and its from-price; tick up to three (<code>?compare=</code>).</li>
      <li>Right, the spec sheet: the ticked models in columns, banded Price → Specifications → What fits, with Highlight differences on. Each column's own What fits and Quote.</li>
      <li>Then prices by series, quotes, changes, the places it goes with and Settings.</li>
    </ul></section>
    <section><h3>References new to this board</h3><ul class="dash">
      <li><b>Porsche's compare picker</b> (<code>live/porsche-compare-select.png</code>): models chosen into named slots from a list with counts, the compare disabled until two are chosen.</li>
      <li><b>Arc's model head</b> (<code>live/arc-sport.png</code>): three figures under the name and nothing else.</li>
      <li>Also: <code>live/quicksilver-605-open-specs.png</code> (banded label and value), <code>live/apple-iphone-compare-rows.png</code> (a dash for absent, never a blank), <code>live/carexpert-specs-scrolled.png</code> (Highlight differences), <code>live/honda-marine-scrolled.png</code> (families by their HP span, for Yamaha).</li>
    </ul><p>No earlier board cites Porsche's compare or Arc.</p></section>
  </div>
  <div class="cols">
    <section><h3>The mark and the photograph</h3><p>The mark is the showpiece on the left of the head; the three figures stand where the photograph stood, so 18 places with no photograph lose nothing. The ${HEROES.length} photographs are one press (“${HEROES.length} on the water”) into the lightbox. The models are seen in the sheet's column heads, each its own catalogue render at one scale.</p>
    <h3>What a dealer can replace</h3><p>Ground, mark ink, line and photograph, as now. The ladder's bar and the lit rows read the room's blues, so a new ground changes only the head.</p></section>
    <section><h3>Where it is weak</h3><p>The first screen shows 16 models as rungs of text, not 16 pictures: the customer at the desk sees figures before boats. On a phone the sheet sits under the ladder, so a compare is a scroll away.</p></section>
  </div>

  <section><h3>Further states, drawn from the file</h3>
  <div class="cols">
    <div class="state"><span class="eyebrow">Yamaha · the ladder by horsepower</span>${yamaha('ladder', '200')}</div>
    <div class="state"><span class="eyebrow">Jeanneau · 4 under no series</span>${jeanneau('ladder')}</div>
  </div>
  <div class="cols">
    <div class="state"><span class="eyebrow">Labour Rates</span>${labour('ladder')}</div>
    <div class="state"><span class="eyebrow">OBSOLETE Trailers</span>${obsolete('ladder')}</div>
  </div>
  <div class="cols"><div class="state"><span class="eyebrow">Parts and Dealer Fit · the hand-off</span>${handoff()}</div></div></section>

  <div class="cols">
    <section><h3>Type, at 1:1</h3>${specimen([
      ['Maker figure, 34 / 800', 'font-size:var(--text-5xl);font-weight:800;line-height:1', '67'],
      ['Column name, 16 / 700', 'font-size:var(--text-lg);font-weight:700', 'Sport 660'],
      [
        'Band, 12 caps',
        'font-size:var(--text-xs);font-weight:700;letter-spacing:.08em;text-transform:uppercase',
        'Specifications',
      ],
      ['Value lit, 13 / 700', 'font-size:var(--text-sm);font-weight:700', 'from $61,700'],
      ['Value same, 13 / 400', 'font-size:var(--text-sm);color:var(--color-ink-3)', '6.52 m'],
      ['Rung, 13 / 700', 'font-size:var(--text-sm);font-weight:700', 'Sport 520'],
    ])}</section>
    <section><h3>Motion</h3><p>A rung ticked: its bar fills to the room's deep blue in <code>--duration-press</code>; a column enters the sheet from the right edge, 12 px, in <code>--duration-enter</code>, and the other columns close up in <code>--duration-settle</code>. Highlight differences: the quiet rows' ink fades in <code>--duration-hover</code>. The ladder never re-orders under the pointer.</p>
    <p><b>Reduced motion:</b> cuts.</p><p><b>Keyboard:</b> the series row (arrow keys), the ladder's ticks in order, then the sheet's column acts, then the plates. Space on a rung ticks it.</p></section>
  </div>

  <section><h3>How it reflows</h3>
  <table><thead><tr><th>Size</th><th>The page</th></tr></thead><tbody>
    <tr><td>1920 × 1080</td><td>Ladder and sheet side by side, three columns with room; the sheet sticks under the bar as the ladder scrolls.</td></tr>
    <tr><td>1440 × 900</td><td>Drawn. The head, the series row, the ladder's first rungs and the sheet's heads and Price band inside the first screen.</td></tr>
    <tr><td>1280 × 800</td><td>The sheet moves under the ladder, three columns full width.</td></tr>
    <tr><td>834 × 1112</td><td>The series becomes one chooser; ladder, then the sheet with three columns.</td></tr>
    <tr><td>844 × 390</td><td>Head one line (mark, figures, act); the ladder; the sheet with two columns.</td></tr>
    <tr><td>390 × 844</td><td>Drawn. Head with three smaller figures, the series chooser, the ladder as two-line rungs, then the sheet with two columns (the third ticked model is kept and named, not drawn).</td></tr>
  </tbody></table></section>

  <section><h3>Honest constraints</h3><ul class="dash">
    <li>All figures read through the app's readers (<code>boards/extract.facts.ts</code>). No cost or margin is read.</li>
    <li>A row the file does not fill prints a dash, never a blank: SP300's people, every Jeanneau's tube diameter.</li>
    <li>${jeanneauSentence}</li>
    <li>${labourSentence}</li>
  </ul></section>

  ${jobsTable([
    [
      'J1 What Highfield makes',
      'The ladder: every model of the series by length with its price; Every series lists all 67.',
    ],
    [
      'J2 Budget, family, tow car',
      "The ladder's people, horsepower, length and price; the sheet's load, weight and fuel.",
    ],
    [
      'J3 What goes on one model',
      "The sheet's What fits band (motors, recommended, trailers, dealer fit, parts) and What fits → /fitment?boat=.",
    ],
    ['J4 On the water', `“${HEROES.length} on the water” opens the lightbox.`],
    ['J5 Start the quote', 'Quote a Highfield; Quote in each column.'],
    ['J6–J11', 'Quotes (empty, true), Settings unchanged.'],
    [
      'J12 Every model',
      "The head's 67 = the rungs under Every series; Jeanneau's 4 under their sentence.",
    ],
    ['J13 Its prices', 'Spans by series at Cash and Trade with n/n, door to Prices.'],
    [
      'J14–J19',
      "Changed here; Open Sport in the price list; Goes with; Labour Rates' sentence; the ten trailers; the unknown address.",
    ],
    ['Missing: compare', 'The spine of the page.'],
    [
      'Missing: series in place, phone, hand-off, non-boat ranges',
      '?series=; the ladder first at 390; Parts → /catalogue; Yamaha by horsepower.',
    ],
  ])}
</div>
</section>`

export const html = page({ title: 'The spec sheet', id: 'c', css, body, notes })
