export const meta = {
  name: 'hl2-northside',
  description:
    "Make the built app Northside Marine's and nobody else's: remove what exists only for a business that is not Northside, simplify what that leaves, and prove the whole sale still works cold",
  phases: [
    {
      title: 'Simplify',
      detail: 'audit the built screens and remove what serves somebody other than Northside',
    },
    { title: 'Check', detail: 'walk the app cold and confirm nothing Northside uses was lost' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    removed: { type: 'array', items: { type: 'string' } },
    kept: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['files', 'gateGreen', 'removed', 'kept', 'notes'],
}

const CONTEXT = `CONTEXT. HL_2.0 (repo: ${NEW}) is a quoting and configuration app built on Northside Marine's real Master Price File. The owner, 2026-09-23: "this is a northside marine app yeah so we can remove the unnecessary stuff that is like for anyone that isn't northside marine. remember also simple wins. this app is complex topics made beautiful." Read docs/STATUS.md (top sections), docs/SCREENS.md, CLAUDE.md (in your context) and docs/DECISIONS.md's entry of 2026-09-23 on narrowing to Northside.

WHAT STAYS, because it is Northside's or it is invisible plumbing: the organisation key on every stored record (\`orgId\`) — it is how the shared backend of Milestone 6 will file Northside's records, it costs nothing and nobody sees it; the sub-dealer PRICE RUNGS, which are Northside's own levels in its own price file; customisation, which is Northside's staff setting Northside's own look; and every honesty rule in CLAUDE.md.

WHAT GOES: anything a person can see or press that exists only for a business that is not Northside, or for Northside before it has its own price file. Known: the door's second option, "start a blank sheet" (src/screens/entry/), and the states it leads to — a Home, picker or register drawn over a sheet with nothing on it, told to a person who chose it; the starting-point blurb "Start from a blank sheet and build your own tables" (src/domain/model/tables.ts) wherever it reaches a screen. Find the rest yourself: read every screen under src/screens/ and grep for "blank", "your own tables", "any dealership", "your business", "a business", "organisation", "tenant", "initials" and similar, and judge each by the owner's sentence. A state that happens to Northside for real (the price file not yet loaded on a fresh browser, a register with nothing filed yet) is NOT this — it stays, and it must still teach.

HOW. The door becomes one act: open Northside's price file. When the pack cannot be read (offline, or the file missing), say so in a sentence with what to do — never offer a blank business instead. Remove the code, the route branches, the copy and the tests that pin only the removed behaviour; a test that pinned something Northside still uses is kept or moved. Keep the engine's pure modules if something else calls them; delete a module only when nothing does, and say which. Record each removal as a dated one-liner appended to docs/DECISIONS.md (cat >>) naming what lost. Every colour, face and size still comes from tokens; every figure is counted; nothing is invented.

GATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src tools e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run; npx tsx tools/check.ts; npm run build; then the Playwright flows and rulers for every screen you touched (HL2_PREVIEW_PORT=5781 npx playwright test e2e/flows/<screen>.spec.ts e2e/rulers -g "<route>" --workers 1). Do not commit.`

phase('Simplify')
const simplify = await agent(
  `You are making HL_2.0 Northside Marine's app and nobody else's.\n\n${CONTEXT}\n\nDo it, gate it, and report every removal and every thing you judged should stay, with its reason.`,
  { label: 'simplify', phase: 'Simplify', schema: REPORT },
)

phase('Check')
const check = await agent(
  `You are checking that making HL_2.0 Northside-only removed nothing Northside uses.\n\n${CONTEXT}\n\nThe simplifier's report: ${JSON.stringify(simplify)}\n\n1. Read the diff (git diff; git status for new and deleted files). For every removal, confirm nothing Northside does needed it; for anything that did, put it back and say so.\n2. Serve the built app (npm run build && npx vite preview --port 5791) and walk it COLD with the browser tools at 1440×900 and 390×844: the door → a name → open the price file → Home → the pill to every door → a full quote from the picker to the issued document. Also: the door with the pack unreachable (block data/northside/manifest.json with the browser tools' network interception if you can, or read the code path) — it must say what is wrong and what to do, and offer nothing else.\n3. Grep once more for anything reader-facing that serves a business other than Northside.\n4. The gate: npm test and the e2e flows for every screen the diff touched. Report what you checked, what you restored, and the gate.`,
  { label: 'check', phase: 'Check', schema: REPORT },
)

return { simplify, check }
