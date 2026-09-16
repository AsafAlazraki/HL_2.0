# Decisions

Dated one-liners. Each names what lost, so nobody re-argues it without new evidence.

## 2026-09-16

- **Rebuild from scratch, not refactor.** HL_Playground's engine is good (2,974 passing tests); its interface and working method are not. Lost: another redesign pass on the old tree (five had been rejected on sight).
- **Nothing visual or rule-like comes from the old repo.** No stylesheet, token ramp, font, tile rule, entry frame, `.tsx`, CLAUDE.md constitution, px ratchet or lint baseline. Lost: "reuse the design system to move faster".
- **Local-first, backend-ready.** Dexie behind `src/data/repository.ts`; Supabase is Milestone 6 as an adapter. Lost: Supabase from day one (single user today; the seam costs nothing).
- **The repo is public and the full seed is committed**, cost columns included. Lost: a private repo or a redacted seed (the old repo already publishes it; the owner accepted).
- **Selling flow first.** Entry, home, picker, place, configurator, cascade, document, quotes register; then Cockpit. Lost: breadth-first.
- **Directions first, per major screen, after a reference sweep.** Two or three static directions on real seed content; the owner picks. Lost: build-then-review.
- **Imagery is a first-class workstream** with provenance for every picture. Lost: "pictures later".
- **The original HelmLogic's modules (with marks and heroes), organisation and user management, and document templates are in scope** (Milestones 4–5). Lost: leaving them on the later list.
- **Tailwind 4 with `@theme` tokens** for styling, with per-screen CSS for bespoke work. Lost: plain CSS with cascade layers (all three design proposals preferred it for guard reasons; a one-row swap if the owner prefers).
- **`@base-ui/react` 1.8** for headless primitives, not the older `@base-ui-components/react` release candidate.
- **The packer is Node (`tsx`) importing the old repo's committed `buildNorthsideProject()`.** Python is not installed on this machine; the committed TS seed is byte-reproducible from the extracts, so packing from it loses nothing. Lost: porting the Python generator.
- **Deterministic ids**: table = seed key, row = `key:ordinal`, field = column key. Lost: minted nanoids that would not survive a Postgres import.
- **`freeze.ts` and `pairs.ts` are ported near-verbatim with an injected `Ctx`**, never rewritten. Three judges were unanimous: re-deriving the freeze is where a settled number or refusal gets lost.
- **Quotes change through commands with inverses and `QuoteEvent`s**; an issued quote refuses with a sentence. Lost: mutators on the store.
- **The cascade is a route** (`/quote/$id/cascade?fix=&from=`), so Back, refresh and a shared link behave.
- **One configurator that contains Address.** Lost: two generations behind a hash switch.
- **`priceLevels` are declared per table by the packer.** No Northside column name lives in app code.
- **Chapters ARE the quote's sections**; `buildSteps` derives them from the frozen document. A direction that needs a chapter with nothing behind it draws from the frozen specs and colourways, never by widening the model.
- **`fitmentCascade` is the only cascade builder without a caller in the old repo; Milestone 1 wires it.**
- **The sixteen workbook rules are all blocked on the seed and are carried as data with their measured rates.**
- **A sheet wipe never clears quotes.** A quote is a photograph of what was offered on the day. A separate, explicit "forget everything" in Admin does.
- **No boot-time migrations or adoptions.** A fresh schema with `orgId` on every record and one versioned pack needs none; the first one added is a design smell to argue about.
- **Light theme only until a theme is first-class.** The old toggle produced a light app with dark scrollbars.
- **Sign-in is a name until Milestone 6.** A password that protects nothing is fake data.
- **Ports live in `tools/ports.ts`** (dev 5100, preview 5101). Lost: a port per config file.
- **The scaffold was hand-written.** `npm create vite` cancels itself on a non-interactive shell; the files are the same ones it would have written.
- **Four cost names the old repo never flagged are cost columns in the pack**: `Total Nett CTD` (the workbook's own "true cost"), `Settlement` and `Discount` (two deductions in the dealer's buy ladder, not a customer discount), and `GP` (gross profit, in every spelling). 24 columns across eleven tables were reaching every surface that trusts `costColumns`; 139 are now named. `RRP` and `Sell` stay visible: they are the customer's prices. Evidence in `tools/seed/levels.ts` and `docs/reference/MPF_GROUND_TRUTH.md`. Lost: porting the old list verbatim and calling it safe.
- **The seed's held pictures are 12.1 MB after fetching 109 more addresses** (329 held, 118 unheld, 6 refused). The old repo pinned a 12,000,000-byte ceiling in a test and said whoever crosses it must decide about size first; HL_2.0 carries no such ceiling. The owner decides if a smaller long edge or quality is wanted; nothing is discarded meanwhile.
