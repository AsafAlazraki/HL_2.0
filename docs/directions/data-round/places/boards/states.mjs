/* The places every board must also draw beside Highfield, each from the real file: Jeanneau (4
   models filed under no series, no photograph), Yamaha (209 motors, no picture), Labour Rates (no
   declared price), OBSOLETE Trailers (10, none still sold) and the two accessory lists that hand
   off. The words are the file's and the readers'; each board lays them out its own way through
   `look`. */
import {
  JE,
  PL,
  MOTORS,
  LABOUR,
  OBS,
  money,
  n,
  plural,
  three,
  at,
  carries,
  seriesOf,
} from './facts.mjs'
import { esc, ic, mark, btn } from './shell.mjs'

/* ---- a compact head: what 18 of 25 places stand on, with no photograph ---- */
export const compactHead = (place, { facts, act, kind }) => `
<header class="st-head livery" data-livery="${place.ground.key}">
  <span class="kindword">${kind}</span>
  <div class="st-head-row">
    <h4 class="st-title">${mark(place)}${place.mark.drawn ? `<span class="sr">${esc(place.name)}</span>` : ''}</h4>
    ${act ?? ''}
  </div>
  <p class="st-facts">${facts}</p>
</header>`

/* ---- Jeanneau: 27 in the head, 27 drawn; the 4 with no series under their sentence ---- */
export const NO_SERIES = JE.models.filter((m) => m.series === '')
export const jeanneauSentence = `${NO_SERIES.length} Jeanneau models are filed under no series in the price list: ${NO_SERIES.map((m) => m.said).join(', ')}. They stand here under their own heading, so the ${JE.models.length} in the head are the ${JE.models.length} drawn.`

export const jeanneau = (look) => {
  const P = PL.boat_jeanneau
  const groups = seriesOf(JE)
  const row = (m) => {
    const [L, , H] = three(m)
    const c = carries(m)
    return `<li class="st-model"><span class="st-model-pic">${m.catalogue ? `<img src="${m.catalogue.src}" alt="${esc(m.spoken)}" loading="lazy">` : ''}</span>
      <span class="st-model-words"><b>${esc(m.said)}</b><span class="st-sub">${[L, H].filter(Boolean).join(' · ')}</span><span class="st-sub">${plural(c.motors, 'motor')} · ${plural(c.trailers, 'trailer')}</span></span>
      <span class="st-model-price"><b>${at(m).said}</b><small>Cash</small></span></li>`
  }
  const g0 = groups.find((g) => g.name === '')
  const named = groups.filter((g) => g.name !== '')
  return `
${compactHead(P, { kind: 'Boats', facts: `<b>${JE.models.length} models</b> · ${named.length} series and ${NO_SERIES.length} under none · from ${money(JE.from)} to ${money(JE.to)} at Cash · No photograph on the water yet`, act: btn('Quote a Jeanneau', { intent: 'act', icon: 'FilePlus', size: 'sm' }) })}
<div class="st-body st-${look}">
  <section class="st-group st-unfiled"><h5>Filed under no series <span>${NO_SERIES.length}</span></h5><p class="quiet-say">${jeanneauSentence}</p>
  <ul class="st-models">${g0.list.map(row).join('')}</ul></section>
  ${named.map((g) => `<section class="st-group"><h5>${esc(g.label)} <span>${g.list.length}</span></h5><ul class="st-models">${g.list.slice(0, 3).map(row).join('')}</ul><p class="st-more">and ${g.list.length - 3} more ${g.label} models, each drawn the same way</p></section>`).join('')}
</div>`
}

/* ---- Yamaha: 209 motors read by their own HP Rating; twin and triple rigs by theirs ---- */
const hpKey = (m) => String(m.hp).trim()
export const HP_STEPS = (() => {
  const map = new Map()
  for (const m of MOTORS) {
    const k = hpKey(m)
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(m)
  }
  const num = (k) => {
    const parts = k.split(/\s*x\s*/i)
    return parts.length === 2 ? Number(parts[0]) * 1000 + Number(parts[1]) : Number(k)
  }
  return [...map.entries()]
    .map(([k, list]) => ({
      k,
      said: k.replace(/\s*x\s*/i, ' × ') + ' hp',
      rig: /x/i.test(k),
      list,
      from: Math.min(...list.map((m) => m.sell).filter((v) => typeof v === 'number' && v > 0)),
    }))
    .sort((a, b) => num(a.k) - num(b.k))
})()
export const SINGLES = HP_STEPS.filter((s) => !s.rig)
export const RIGS = HP_STEPS.filter((s) => s.rig)

export const yamaha = (look, on = '150') => {
  const P = PL.mot_yamaha
  const step = HP_STEPS.find((s) => s.k === on)
  const singleN = SINGLES.reduce((a, s) => a + s.list.length, 0)
  const rigN = RIGS.reduce((a, s) => a + s.list.length, 0)
  return `
${compactHead(P, { kind: 'Motors', facts: `<b>${MOTORS.length} motors</b> · ${SINGLES.length} ratings from ${SINGLES[0].said} to ${SINGLES.at(-1).said} · ${rigN} twin and triple rigs · priced at ${P.prices.map((p) => `${p.said} (the file's “${p.filed}”)`).join(' and ')} · ${plural(MOTORS.length, 'motor')} priced, none unpriced` })}
<div class="st-body st-${look}">
  <p class="quiet-say">By horsepower, the file's own HP Rating: ${singleN} single motors in ${SINGLES.length} ratings, then ${rigN} rigs. No Yamaha picture is held, so every motor is its figures.</p>
  <div class="st-ladder" role="list">${HP_STEPS.map((s) => `<span role="listitem" class="st-step${s.k === on ? ' on' : ''}${s.rig ? ' rig' : ''}"><b>${s.said}</b><small>${s.list.length}</small></span>`).join('')}</div>
  <h5>${step.said} <span>${step.list.length} motors · from ${money(step.from)} at Cash</span></h5>
  <table class="st-table"><thead><tr><th>Motor</th><th>Shaft</th><th>Control</th><th>Weight</th><th>Cash</th></tr></thead><tbody>
  ${step.list
    .slice(0, 6)
    .map(
      (m) =>
        `<tr><td><b>${esc(m.code)}</b></td><td>${esc(m.shaft)}</td><td>${esc(m.control)}</td><td>${m.weight ? n(m.weight) + ' kg' : '—'}</td><td>${money(m.sell)}</td></tr>`,
    )
    .join('')}
  </tbody></table>
  <p class="st-more">and ${step.list.length - 6} more at ${step.said}; Shaft and Control narrow the step, as Suzuki's filters do</p>
</div>`
}

/* ---- Labour Rates: no declared price, said where the figure would be ---- */
export const labourSentence = `Labour Rates names no price level, so no rate is printed here. Its Rate (inc GST) column is not declared as what a customer pays, and Prices does not carry Labour Rates yet.`
export const labour = (look) => {
  const P = PL.labour_rates
  return `
${compactHead(P, { kind: 'Other lists', facts: `<b>${LABOUR.length} rates</b> · no price level declared` })}
<div class="st-body st-${look}">
  <p class="st-refusal">${ic('Info')}<span>${labourSentence}</span></p>
  <ul class="st-rates">${LABOUR.map((r) => `<li><span>${esc(r.label)}</span><span class="mono">${esc(r.code)}</span><span class="st-dash" aria-label="no price declared">—</span></li>`).join('')}</ul>
  ${btn('Open Labour Rates in the price list', { icon: 'Database', size: 'sm' })}
</div>`
}

/* ---- OBSOLETE Trailers: the ten shown, each with its state word ---- */
export const obsolete = (look) => {
  const P = PL.trl_obsolete
  return `
${compactHead(P, { kind: 'Trailers', facts: `<b>${OBS.length} trailers</b> · none still sold, so none is offered on a new quote` })}
<div class="st-body st-${look}">
  <ul class="st-trailers">${OBS.map((t) => `<li><span class="st-tag">No longer sold</span><b>${esc(t.label)}</b><span class="st-sub">ATM ${n(t.atm)} kg · ${esc(t.supplier)} · <span class="mono">${esc(t.code)}</span></span></li>`).join('')}</ul>
</div>`
}

/* ---- the two accessory lists: the chandlery is where Parts is read ---- */
export const handoff = () => {
  const P = PL.parts
  const D = PL.dealer_fit
  return `
<div class="st-hand">
  ${compactHead(P, { kind: 'Accessories', facts: `<b>2,238 products still sold</b> · ${esc(P.figure.held)}`, act: btn('Open the chandlery', { intent: 'act', icon: 'Storefront', size: 'sm' }) })}
  <p class="quiet-say">The chandlery holds the same 2,238 with find, aisles and pictures, so this page opens it rather than drawing 179 headings again. 25 of them carry no heading in the price list, and the chandlery files them where a person looks.</p>
  ${compactHead(D, { kind: 'Packages', facts: `<b>1,576 packages still sold</b> in 90 headings · ${esc(D.figure.held)}` })}
  <p class="quiet-say">No chandlery aisle holds packages, so Dealer Fit keeps its own page: a find over its 90 headings, folded, and its 74 packages with no heading under “Filed under no heading”, so the 1,576 in the head are the 1,576 drawn. Dealer Fit names no price yet; it is chosen on Prices.</p>
</div>`
}

/* the CSS the states share, in the room's own tokens; each board adds its `look` */
export const STATE_CSS = `
.st-head { position: relative; display: grid; gap: 6px; padding: 16px 18px; border-radius: var(--radius-plate); box-shadow: var(--shadow-plate); --mark-h: 34px; }
.st-head-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; }
.st-title { display: flex; align-items: center; min-inline-size: 0; }
.st-title .pm-word { font-size: var(--text-2xl); }
.st-facts { font-size: var(--text-sm); color: var(--color-white); opacity: 0.92; }
.st-body { display: grid; gap: 12px; padding-block: 14px 0; }
.st-group h5, .st-body > h5 { font-weight: 700; font-size: var(--text-lg); display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.st-group h5 span, .st-body > h5 span { font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-3); }
.st-unfiled { padding: 12px 14px; border-radius: var(--radius-plate); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-rule-strong); display: grid; gap: 8px; }
.st-models { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.st-model { display: grid; grid-template-columns: 76px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 8px; border-radius: var(--radius-md); background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule); }
.st-model-pic { inline-size: 76px; aspect-ratio: 3 / 2; border-radius: var(--radius-sm); overflow: hidden; background: var(--color-white); }
.st-model-pic img { inline-size: 100%; block-size: 100%; object-fit: cover; display: block; }
.st-model-words { display: grid; min-inline-size: 0; }
.st-model-words b { font-size: var(--text-base); }
.st-sub { font-size: var(--text-xs); color: var(--color-ink-3); }
.st-model-price { display: grid; justify-items: end; line-height: 1.15; }
.st-model-price small { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 600; }
.st-more { font-size: var(--text-sm); color: var(--color-ink-3); }
.st-ladder { display: flex; flex-wrap: wrap; gap: 6px; }
.st-step { display: inline-flex; gap: 6px; align-items: baseline; padding: 4px 10px; border-radius: var(--radius-pill); background: var(--color-plate); box-shadow: inset 0 0 0 1px var(--color-rule-strong); font-size: var(--text-sm); }
.st-step small { font-size: var(--text-xs); color: var(--color-ink-3); font-weight: 700; }
.st-step.rig { background: var(--color-plate-tint); }
.st-step.on { background: var(--color-blue-800); color: var(--color-white); box-shadow: none; }
.st-step.on small { color: var(--color-blue-100); }
.st-table { border-collapse: collapse; inline-size: 100%; font-size: var(--text-sm); background: var(--color-plate); border-radius: var(--radius-md); overflow: hidden; }
.st-table th, .st-table td { text-align: start; padding: 7px 10px; border-block-end: 1px solid var(--color-rule); }
.st-table th { font-size: var(--text-xs); color: var(--color-ink-3); }
.st-table td:last-child, .st-table th:last-child { text-align: end; }
.st-refusal { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: var(--radius-md); background: var(--color-plate); box-shadow: inset 3px 0 0 var(--color-ink-reason); color: var(--color-ink-reason); font-size: var(--text-sm); }
.st-rates { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 0 18px; }
.st-rates li { display: grid; grid-template-columns: minmax(0, 1fr) auto 24px; gap: 10px; padding: 6px 0; border-block-end: 1px solid var(--color-rule); font-size: var(--text-sm); }
.st-dash { color: var(--color-ink-3); text-align: end; }
.st-trailers { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.st-trailers li { display: grid; gap: 4px; padding: 10px 12px; border-radius: var(--radius-md); background: var(--color-plate); box-shadow: 0 0 0 1px var(--color-rule); }
.st-trailers b { font-size: var(--text-sm); }
.st-tag { justify-self: start; padding: 1px 8px; border-radius: var(--radius-pill); background: var(--color-hush); color: var(--color-ink-2); font-size: var(--text-xs); font-weight: 700; }
.st-hand { display: grid; gap: 10px; }
.notes .state .st-head h4 { font-size: inherit; }
`
