export const meta = {
  name: 'hl2-imagery',
  description:
    'Find every model, motor, trailer and brand the price file carries that has no held picture, source the exact one from the verified candidates, judge every picture by eye, fetch and store it with provenance, and give every screen one reader for pictures',
  phases: [
    {
      title: 'Audit',
      detail:
        'what the file carries, what is held, what is missing, and which verified candidates could fill each gap',
    },
    { title: 'Judge', detail: 'eyes on every proposed picture, brand by brand, on contact sheets' },
    {
      title: 'Store',
      detail: 'fetch at the right sizes, record provenance, one reader for every screen',
    },
    { title: 'Look', detail: 'every screen that shows a picture, before and after, and the gate' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'

const AUDIT = {
  type: 'object',
  properties: {
    carried: { type: 'string' },
    held: { type: 'string' },
    missing: { type: 'string' },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          group: { type: 'string' },
          proposals: { type: 'integer' },
          sheet: { type: 'string' },
          file: { type: 'string' },
        },
        required: ['group', 'proposals', 'sheet', 'file'],
      },
    },
    unfillable: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['carried', 'held', 'missing', 'groups', 'unfillable', 'notes'],
}

const VERDICTS = {
  type: 'object',
  properties: {
    group: { type: 'string' },
    accepted: { type: 'integer' },
    rejected: { type: 'integer' },
    file: { type: 'string' },
    reasons: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['group', 'accepted', 'rejected', 'file', 'reasons', 'notes'],
}

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    measured: { type: 'string' },
    notes: { type: 'string' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'gateGreen', 'measured', 'notes', 'blockers'],
}

const CONTEXT = `THE END GOAL, in the owner's own words (2026-09-23), which every round builds towards and the last round tests: \"when you are done, i need to be able to give the app to stakeholders and have no ui and ux errors and do a full quote that is good enough experience to do so sitting with a customer and it is beautiful and so configurable in the backend and the output can be sent to a customer after downloaded and things and be so beautiful\". Five things define done: stakeholder-ready from a link; NO UI and UX errors; a full quote good enough to drive live beside a buyer; configurable in the backend without a developer; and a downloaded quote a dealer would proudly send. EVERYTHING IS BUILT BEFORE IT IS JUDGED: the owner's words, \"all of it has to be built before we get there!\" — no screen, panel or capability is left for the acceptance round to discover missing.

IT IS NORTHSIDE MARINE'S APP, AND SIMPLE WINS. The owner, 2026-09-23: "this is a northside marine app yeah so we can remove the unnecessary stuff that is like for anyone that isn't northside marine. remember also simple wins. this app is complex topics made beautiful." Build nothing for a hypothetical second dealership, a second organisation or a business with no price file. When two designs both work, the simpler one wins. Every screen's job is to take a complex topic — a price file of 15,691 rows, 8,679 pairings, a ladder of price levels, a rule that excludes a motor — and make it clear and beautiful, never to show how complex it is.

CONTEXT. HL_2.0 (repo: ${NEW}) is a quoting and configuration app for Northside Marine, a Brisbane boat dealership, built on its real Master Price File (data/northside/: manifest.json, entities.json, tables/*.json — 53 tables, 15,691 rows). The owner: "imagery is insanely important… you gotta find the right ones, they are all publicly available… like the original HelmLogic we should have cover images", and now: "if images are missing go and get them and store them."

WHAT IS HELD TODAY: data/northside/images.json is the ledger of the picture addresses the price file's own rows carry — 453 addresses, 329 held as catalogue copies under public/seed-images/ at long edge 1100, 124 not held. data/northside/heroes.json + heroes-ledger.json hold eight on-water heroes under public/hero-images/ at long edge 2560. data/northside/marks-ledger.json holds seventeen brand marks for twelve of thirteen brands under public/brand-marks/ (Mercury white ink only; Stabicraft none). The critique found 32 of Highfield's 67 models and every row of Parts with no picture at all.

NORTHSIDE MARINE'S OWN MARK IS THE MOST IMPORTANT PICTURE IN THIS APP, and it is the one the app does not hold. The owner: "I want the logo to be the showpiece thing". The earlier sweep asked www.northsidemarine.com.au three times and was refused (HTTP 403), so the shell's crest draws initials and the quote has no letterhead mark. FIND IT FIRST, from a public source that honestly carries Northside Marine's own logo: the original HelmLogic's own repository and assets at C:\Users\Asaf\dev\HelmLogic (its organisation record held a primary and a secondary logo — look in public/, its seed data, its storage references and its docs), HL_Playground at C:\Users\Asaf\dev\HL_Playground, and the dealership's own public listings (its Google Business profile, its Facebook or Instagram page image, its dealer page on boatsales.com.au or a manufacturer's dealer locator). Take the highest-resolution honest copy, prefer a vector or a transparent PNG, record its provenance in data/northside/marks-ledger.json as the ORGANISATION's mark (distinct from the thirteen boat brands), store it under public/brand-marks/, and measure its ink with marks.ts (a white-ink mark needs a dark ground). If no honest copy exists anywhere public, say so plainly in docs/research/imagery/gaps.md and name exactly what the owner should send.

WHAT IS AVAILABLE: docs/research/imagery/candidates.json — 4,768 public picture addresses across 18 brands, each measured live on 2026-09-17 (status, content type, pixel size), grouped by brand, series, model and kind (hero, gallery, render, plan, mark); 4,320 answered 2xx. Read docs/research/imagery/README.md and the five group notes beside it (highfield.md, stacer.md, stabicraft-surtees.md, jeanneau-haines-formosa.md, motors-trailers-marks.md) first. The tools that fetch and store are already written and tested: tools/seed/fetch-images.ts (catalogue copies), heroes.ts and pick-heroes.ts (the hero tier at 2560), marks.ts (brand marks, with the white-ink detector), verdict.ts (the scene/studio judge over pixels), ledger.ts. READ THEM and extend them; do not write a second pipeline.

THE RULES THAT MAKE A PICTURE HONEST, none of which bends:
- A picture belongs ONLY TO THE EXACT MODEL IT DEPICTS. Never a stand-in, never a sister model, never "close enough". A series shot is attached to the series, never to one model in it. A Highfield variant row gets a colourway render only if that render is of THAT colourway; otherwise it shows the model's picture and says it is the model's.
- THE FILE'S NAMES ARE THE TRUTH, not the maker's taxonomy. Stacer's site says "over 70 models in 9 ranges" and the file carries 91 rows in 22 series; Highfield's navigation ships ranges the file does not carry. A candidate is matched to a model THE FILE CARRIES, through the file's own hierarchy (src/screens/picker/fleet.ts collapses rows to models through src/domain's trailOf; read it).
- EVERY HELD PICTURE HAS PROVENANCE: the address, the page it was found on, the host, the date fetched, the source pixel size, the held size, sha256, the licence note, the model it depicts, its kind, and WHO VERIFIED IT AND HOW.
- NEVER ENLARGE: a copy is never held larger than its source.
- THE PICTURES ARE BYTES. Fetch and encode with Node and sharp; never pipe an image or the seed through a shell text tool.
- A LESSON THIS REPO PAID FOR: the pixel judge once promoted interior shots and console close-ups as heroes, because "not a render on white" is not "a boat on water". Filenames carry the maker's own convention (Stacer: Lifestyle/EXT vs INT/Internal) and are the first gate; EYES ON A CONTACT SHEET are the last.
- BUDGET: no more than 90 MB of new pictures in the repository in total, because every byte ships to every reviewer on the hosted site. One catalogue copy per model (a render or studio shot preferred, at long edge 1100, webp) and a hero at 2560 only for a verified exterior on-water scene of that exact model (at most 40 new heroes, favouring the models a dealer sells most — the boat tables' row counts say which). Motors and trailers: one catalogue copy per model where the candidate is that exact model.
- Do NOT commit, push, checkout, reset or stash.`

phase('Audit')
const audit = await agent(
  `You are auditing HL_2.0's pictures, and proposing — not fetching — the pictures that would fill its gaps.\n\n${CONTEXT}\n\nTASK.\n0. NORTHSIDE MARINE'S OWN MARK, as the context above says — before anything else, and as its own proposal group ("northside") on its own contact sheet.
1. COUNT WHAT THE FILE CARRIES AND WHAT IS HELD. For every boat model the file carries (the file's own models, per table, through the picker's collapse — Highfield's 588 rows are 67 models), every motor model, every trailer model, and every brand: is a picture held for it today (through the row's own address in images.json, a hero, or a mark), and at what size? Write the result to docs/research/imagery/gaps.md as tables with counts, and say how many of each are missing.\n2. MATCH CANDIDATES TO GAPS. For each gap, find the verified candidates (status 2xx, not tooSmall) in docs/research/imagery/candidates.json that depict THAT EXACT model by name, series and page URL, normalising only what is genuinely spelling (case, spacing, hyphenation) — never "close enough". Where several candidates fit, rank them: for a catalogue copy, the clearest whole-boat render or studio view; for a hero, an exterior on-water scene. Use verdict.ts and the filename convention as the first gates. A gap with no honest candidate stays a gap — say so, and say why.\n3. BUILD CONTACT SHEETS FOR THE JUDGES. Group the proposals into at most seven groups of manageable size (by brand, with Highfield split if it is large), and for each group write docs/research/imagery/proposals/<group>.json (every proposal: the model it would be attached to — table id and the file's own model name — the kind, the candidate address and page URL, pixel size, and your reason) and render a contact sheet PNG per group to docs/research/imagery/proposals/<group>.png: each proposed picture as a thumbnail of at least 280px wide with its proposed model name printed beneath it in large type, so a judge can say yes or no at a glance. Fetch thumbnails into tools/seed/.imgcache/ (it is gitignored) with sharp; never commit a thumbnail.\nReturn the counts, the groups with their files, and what cannot be filled honestly.`,
  { label: 'audit', phase: 'Audit', schema: AUDIT },
)
log('audit: ' + (audit ? `${audit.missing} · ${audit.groups.length} groups` : 'none'))

phase('Judge')
const judged = await parallel(
  ((audit && audit.groups) || []).map(
    (g) => () =>
      agent(
        `You are judging proposed pictures for HL_2.0 by eye. Nothing goes into this app that you did not look at.\n\n${CONTEXT}\n\nYOUR GROUP: ${g.group} — ${g.proposals} proposals in ${g.file}, contact sheet ${g.sheet}.\n\nOpen the contact sheet with the Read tool (it renders PNGs). For every proposal, decide ACCEPT or REJECT, and for a reject say which rule it breaks: not that exact model (a sister model, a different length, a different series); an interior, console or detail shot proposed as a whole boat; a hero that is not an exterior scene on water; a render of a different colourway than the row it would sit on; people or text over the boat that makes it unusable; a watermark; too small once cropped; or the same picture already held. If the sheet is too small to judge a proposal, open the thumbnail itself in tools/seed/.imgcache/. When in doubt, reject — a gap is honest and a wrong picture is not. Budget: open at most 40 pictures.\n\nWrite your verdicts to docs/research/imagery/proposals/<group>.verdicts.json (every proposal with accept or reject and the reason, and "verified by eye, contact sheet, 2026-09-23" as the verification line), and return the counts.`,
        { label: 'judge:' + g.group, phase: 'Judge', schema: VERDICTS },
      ),
  ),
)
const verdicts = judged.filter(Boolean)
log(
  'judged: ' +
    verdicts.map((v) => `${v.group} ${v.accepted}/${v.accepted + v.rejected}`).join(' · '),
)

phase('Store')
const store = await agent(
  `You are fetching and storing the pictures the judges accepted, and giving HL_2.0 one honest reader for every picture it shows.\n\n${CONTEXT}\n\nTHE VERDICTS: ${JSON.stringify(verdicts)}. Read every docs/research/imagery/proposals/*.verdicts.json; fetch ONLY what is marked accept.\n\n1. FETCH AND STORE, extending tools/seed/fetch-images.ts, heroes.ts and marks.ts rather than writing a second pipeline: catalogue copies at long edge 1100 (webp, the quality the existing tools use) under public/seed-images/, heroes at 2560 under public/hero-images/, the Stabicraft mark if one was accepted under public/brand-marks/ (through marks.ts's white-ink detector). Never enlarge. Idempotent: a second run fetches nothing it already holds. Stay inside the 90 MB budget and report the total.\n2. ONE LEDGER FOR PICTURES OF MODELS. The rows' own addresses stay in images.json exactly as they are. Pictures attached to a MODEL (and a motor, a trailer, a series) go in one new ledger — data/northside/pictures.json — keyed by the table id and the file's own model name, each entry carrying the full provenance the rules name, including who verified it and how. The eight existing heroes are migrated into it or referenced from it, so there is ONE place a hero is recorded.\n3. ONE READER. Today eight screens each resolve pictures their own way: src/screens/picker/, configurator/stage.ts, cascade/ground.ts, document/art.ts, home/ledgers.ts, customers/pictures.ts, sheet/pictures.ts, entry/facts.ts. Write one pure reader in src/domain (for example src/domain/model/pictures.ts) that answers "what picture, at what size, with what caption and provenance" for a row, a model, a motor, a trailer, a brand or a series — the row's own address first, then its model's, never a sister model's — with a test that pins the rules (never a stand-in, never enlarged, a colourway render only on its colourway, a gap returned as a gap). Then move every one of those eight screens onto it, keeping each screen's own sizes and captions, so no screen can resolve a picture differently from another. The app fetches pictures under import.meta.env.BASE_URL, as every screen already does, so they work on the hosted site under a sub-path.\n4. TESTS: extend src/data/imagery.test.ts so every entry in pictures.json has a held file that exists, the full provenance, a size no larger than its source, and a model the file actually carries; and a test that no model has a picture attached that the verdicts rejected.\n5. docs/data/IMAGES.md (or wherever the image ledger is documented — find it) gains a section saying what was added on 2026-09-23, from where, how it was verified, and what remains a gap.\n\nGATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src tools e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run; npx tsx tools/check.ts; npm run build. Report the counts added per kind, the megabytes, and the gate.`,
  { label: 'store', phase: 'Store', schema: REPORT },
)

phase('Look')
const look = await agent(
  `You are looking at HL_2.0 after its pictures were filled, as its owner will, and running the gate alone.\n\n${CONTEXT}\n\nThe storer's report: ${JSON.stringify(store)}\n\n1. THE FULL GATE, alone: npm test; npm run build; npm run e2e. Anything red: re-run alone with --last-failed --timeout 120000 --workers 1 and say whether it is the app or the machine; if it is the app — for example a screen that now lays out differently with a picture where there was none — FIX IT and say what you fixed.\n2. Serve the built app (npx vite preview --port 5801) and look, with the browser tools, at every screen that shows a picture — home, the picker (walk several brands, including a Highfield model that had none before), the configurator's stage, the cascade, the document's cover, data's plates, the sheet's gallery, customers — at 1440×900 and 390×844. Photograph each into docs/directions/<screen>/built/ as <screen>-<w>x<h>-pictures.png. For every picture on screen ask: is it the exact model the screen says it is? Is it drawn at a size worth drawing? Is its caption honest? Report anything wrong precisely, and fix what is in the reader or a screen's use of it.\n3. Say in one paragraph what the app looks like now compared with before, screen by screen.`,
  { label: 'look', phase: 'Look', schema: REPORT },
)

return { audit, verdicts, store, look }
