export const meta = {
  name: 'hl2-host',
  description:
    'Host HL_2.0 on GitHub Pages so reviewers can open it from a link, make CI green, and prove the live site works end to end on a desk and on a phone',
  phases: [
    {
      title: 'Prepare',
      detail: 'the sub-path build, the router base, deep links, the Pages workflow, and a green CI',
    },
    { title: 'Deploy', detail: 'push, watch the deployment, and read what it served' },
    { title: 'Prove', detail: 'drive the live site cold, as a stranger with a link would' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'
const SITE = 'https://asafalazraki.github.io/HL_2.0/'

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

const PROOF = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    works: { type: 'boolean' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'string' },
          viewport: { type: 'string' },
          ok: { type: 'boolean' },
          detail: { type: 'string' },
        },
        required: ['step', 'viewport', 'ok', 'detail'],
      },
    },
    fixed: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['url', 'works', 'steps', 'fixed', 'notes'],
}

const CONTEXT = `THE END GOAL, in the owner's own words (2026-09-23), which every round builds towards and the last round tests: \"when you are done, i need to be able to give the app to stakeholders and have no ui and ux errors and do a full quote that is good enough experience to do so sitting with a customer and it is beautiful and so configurable in the backend and the output can be sent to a customer after downloaded and things and be so beautiful\". Five things define done: stakeholder-ready from a link; NO UI and UX errors; a full quote good enough to drive live beside a buyer; configurable in the backend without a developer; and a downloaded quote a dealer would proudly send. EVERYTHING IS BUILT BEFORE IT IS JUDGED: the owner's words, \"all of it has to be built before we get there!\" — no screen, panel or capability is left for the acceptance round to discover missing.

IT IS NORTHSIDE MARINE'S APP, AND SIMPLE WINS. The owner, 2026-09-23: "this is a northside marine app yeah so we can remove the unnecessary stuff that is like for anyone that isn't northside marine. remember also simple wins. this app is complex topics made beautiful." Build nothing for a hypothetical second dealership, a second organisation or a business with no price file. When two designs both work, the simpler one wins. Every screen's job is to take a complex topic — a price file of 15,691 rows, 8,679 pairings, a ladder of price levels, a rule that excludes a motor — and make it clear and beautiful, never to show how complex it is.

CONTEXT. HL_2.0 (repo: ${NEW}; GitHub: AsafAlazraki/HL_2.0, public, branch main) is a quoting and configuration app for Northside Marine, a Brisbane boat dealership, built with Vite 8, React 19, TanStack Router (file routes, src/app/router.ts), Tailwind 4, Dexie over IndexedDB, and Playwright. It is LOCAL-FIRST: every visitor's customers, quotes and settings live in their own browser, and the price file is a static pack under data/northside/ that tools/seed/servePack.ts serves in dev and emits into dist at build. Every asset path in src/ is already built from import.meta.env.BASE_URL (the pack loader, and every screen's seed-images, hero-images and brand-marks prefixes), which is the one thing a sub-path host needs and was done from the first commit.

THE OWNER: "use github native hosting to host this so we can send for others to review. reminder it should work perfectly." The site will be ${SITE} — a sub-path, not a root, which is what breaks most single-page apps on GitHub Pages.

WHAT IS KNOWN ABOUT CI TODAY: .github/workflows/ci.yml has failed on every push since the first one. Two causes are known — six workflow scripts under .claude/workflows/ were committed unformatted, so \`prettier --check\` failed before any test ran (fixed on 2026-09-23 by formatting them), and a second, also fixed that day: one unit test read a UTC day on GitHub's runner for a Brisbane morning, and vitest.config.ts now runs the whole unit suite on the dealership's clock (TZ=Australia/Brisbane), as playwright.config.ts already did. CI's e2e step runs the whole suite — about 1,000 checks across six viewports — on a two-core runner inside a 30-minute timeout, which cannot fit.

WHAT IS NOT YOURS: never change the owner's account or repository settings, and never extract, print or pass a credential. Enabling Pages for this repository (Settings → Pages → Source: "GitHub Actions") is the owner's one-click step; if the deployment reports Pages is not enabled, STOP there and say so plainly as the blocker, with the exact setting to change — do not work around it. git push already authenticates through this machine's credential manager and is authorised: the owner chose "push regularly" on 2026-09-23. Commit with a message saying what was measured, ending with the line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>".`

phase('Prepare')
const prepare = await agent(
  `You are preparing HL_2.0 to be hosted on GitHub Pages at a sub-path, and making its CI honest and green.\n\n${CONTEXT}\n\nTASK.\n1. THE SUB-PATH BUILD. vite.config.ts takes its base from an environment variable (HL2_BASE, default '/'), so \`npm run dev\` and every existing test stay at the root and a Pages build is HL2_BASE=/HL_2.0/ npm run build. Add an npm script for it. Check that servePack emits the pack under the base, and that nothing in src/, public/ or index.html reaches an asset by an absolute root path — add a guard to tools/check.ts with a fixture test (every guard here has one that proves it can fail) so a root-absolute asset path can never be committed again.\n2. THE ROUTER BASE. TanStack Router takes basepath from import.meta.env.BASE_URL (trailing slash trimmed) in src/app/router.ts, so every link, redirect and \`navigate\` resolves under /HL_2.0/. Check every place the app builds an address by hand (grep for "location", "href=", "pushState", "window.open", "new URL(") and make each honour the base. The first-visit rule (a nameless browser lands on the door) must still work under the base.\n3. DEEP LINKS. GitHub Pages serves 404.html for any address it does not have, so a reviewer who is sent ${SITE}quotes, or who presses refresh on a quote's own address, must land in the app on that screen. Emit dist/404.html as a copy of index.html in the Pages build only (a small Vite plugin in tools/, not a shell copy), and prove it: a refresh on a deep address under vite preview with the base lands on the right screen.\n4. THE PAGES WORKFLOW: .github/workflows/pages.yml — on push to main and on workflow_dispatch: checkout, setup-node 24 with npm cache, npm ci, npm test, the Pages build, Playwright chromium, a PAGES SMOKE SPEC (e2e/pages/smoke.spec.ts, its own Playwright config or project, baseURL under the sub-path against \`vite preview\` of the Pages build) that opens the door, gives a name, loads the price file, reaches home, the picker, a quote, the document and the register, then refreshes on a deep address — then actions/upload-pages-artifact and actions/deploy-pages with permissions pages: write and id-token: write, concurrency group "pages", and the environment github-pages with its URL. Use current major versions of every action.\n5. A GREEN CI THAT STILL MEANS SOMETHING. The whole e2e cannot fit one two-core runner in 30 minutes. Split it: a matrix of jobs, one per Playwright project (the six viewports) plus one for the ruler fixtures, each with its own timeout that fits, and failures uploaded as artefacts. Nothing is skipped to make it green. Confirm on GitHub that the unit step is now green. If anything still fails only on Linux (a case-sensitive import, a file this machine has that the repository does not), reproduce it with TZ=UTC and HL_PLAYGROUND unset, read the public check-run annotations at https://api.github.com/repos/AsafAlazraki/HL_2.0/check-runs/<id>/annotations (no credential needed), fix it, and say what it was.\n6. docs/HOSTING.md: the address, how it is built and deployed, what a reviewer should know (their quotes and customers live in their own browser and nobody else sees them; opening the link on a second device starts empty; nothing they do reaches the dealership), and how to redeploy.\n\nGATE, locally, before you commit: npx prettier --write <your files>; npm test; npm run build; HL2_BASE=/HL_2.0/ npm run build and the Pages smoke spec against it; and the existing e2e for any file you changed that a screen uses. Then commit and push. Report what you changed and what you measured.`,
  { label: 'prepare', phase: 'Prepare', schema: REPORT },
)

phase('Deploy')
const deploy = await agent(
  `You are deploying HL_2.0 to GitHub Pages and reading back what was served.\n\n${CONTEXT}\n\nThe preparer's report: ${JSON.stringify(prepare)}\n\n1. Confirm the pages workflow and CI ran for the pushed commit, using the public API without a credential: https://api.github.com/repos/AsafAlazraki/HL_2.0/actions/runs?per_page=10 (and each run's jobs_url for its steps, and https://api.github.com/repos/AsafAlazraki/HL_2.0/check-runs/<job id>/annotations for any failure). Wait for them with sensible pauses (a check every few minutes, never a tight loop); a run takes minutes, not seconds.\n2. If the pages workflow fails because Pages is not enabled for the repository, STOP: report it as the blocker, with the exact setting the owner must change (Settings → Pages → Build and deployment → Source: GitHub Actions), and do not attempt to enable it yourself.\n3. If it fails for any other reason, read the annotations, fix the cause locally, gate it as the preparer did, commit, push, and watch again — at most three attempts, and say what each one found.\n4. If CI is red for a reason the preparer did not fix, do the same.\n5. When the deploy is green, fetch ${SITE}, ${SITE}data/northside/manifest.json, one picture under ${SITE}seed-images/ and ${SITE}quotes with curl, and report each status code and content type. ${SITE}quotes must return the app (the 404.html copy), not GitHub's own 404 page.\nReport the run ids, their conclusions, and the four fetches.`,
  { label: 'deploy', phase: 'Deploy', schema: REPORT },
)

phase('Prove')
const PROVE = (round) =>
  `You are a stranger who has just been sent a link to HL_2.0 by the owner of a boat dealership, and you are proving it works — perfectly, as he asked — or finding exactly where it does not.\n\n${CONTEXT}\n\nThe deployer's report: ${JSON.stringify(deploy).slice(0, 4000)}\n\nWith the browser tools (open a fresh tab; the site must be reached cold, with nothing in this browser for it), at 1440×900, then 390×844, then 834×1112:\n1. Open ${SITE}. The door: give a name. Load the Master Price File. Home arrives, with its photographs.\n2. The pill to every door: Quotes, Customers, Data, History — each arrives. The finder (Ctrl K on a desk): type a Highfield model and land on it.\n3. New quote → pick a brand and a model with its colourway → the configurator arrives with its running price → pick a motor and a trailer the file pairs → a change that raises the cascade → accept it → address the quote to a name → give it to the customer → the document: the dealership named on page one, the boat's picture, the price beside who it is for → print it to PDF (the browser's own print; save the PDF to docs/directions/host/quote-${round || 'live'}.pdf and open it to check it is the same sheet).\n4. The register lists it. History shows the day. REFRESH the browser on the document's own address and on /quotes — each must come back to the same screen with the quote still there.\n5. Paste a deep address into a new tab (${SITE}quote/new) and check it lands on the picker, not on GitHub's 404.\n6. Read the console on every screen: any error, any failed request (a 404 for a picture or a pack file is the classic sub-path bug), any warning worth naming.\nRecord every step with its viewport, whether it worked, and what you saw. Photograph the key moments into docs/directions/host/. ANYTHING that fails: find the cause in the source, fix it locally, gate it (npm test; npm run build; the Pages smoke spec), commit, push, wait for the deploy, and walk that step again. Report \`works\` true only if every step worked at every viewport.`

let proof = await agent(PROVE(''), { label: 'prove', phase: 'Prove', schema: PROOF })
if (proof && !proof.works) {
  proof = await agent(
    PROVE('2') +
      `\n\nA FIRST WALK FOUND: ${JSON.stringify(proof.steps.filter((s) => !s.ok))}. Fixes claimed: ${JSON.stringify(proof.fixed)}. Walk the whole site again from cold and say, step by step, whether each is now right.`,
    { label: 'prove2', phase: 'Prove', schema: PROOF },
  )
}

const close = await agent(
  `You are writing the last word on hosting HL_2.0 for its owner.\n\n${CONTEXT}\n\nThe proof: ${JSON.stringify(proof).slice(0, 8000)}\n\nUpdate docs/HOSTING.md with what was proved and at which viewports, and add the link near the top of docs/REVIEW.md (if it exists) and docs/STATUS.md, with one sentence each on what a reviewer will see on a cold browser and that their data stays in their own browser. Gate (npx prettier --write the files you touched; npm test), commit and push. Report the link and whether it works.`,
  { label: 'close', phase: 'Prove', schema: REPORT },
)

return { prepare, deploy, proof, close }
