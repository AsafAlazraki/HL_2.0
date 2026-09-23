# HL_2.0

HelmLogic, rebuilt from scratch for Northside Marine, a Brisbane boat dealership, and for nobody else: configurator, fitment, quotes, documents. Nothing is built for a second dealership, a second organisation or a business with no price file. **Simple wins: this app is complex topics made beautiful.** When two designs both work, the simpler one wins. Local-first (IndexedDB behind `src/data/repository.ts`), backend-ready. Decisions and their dates: `docs/DECISIONS.md`. What is deliberately not built yet: `docs/LATER.md`.

## Honesty

- No fake data. Never seed or invent a customer, quote, pairing, photograph or figure. An empty state is the true state.
- Never invent a figure the price file does not carry. A rule shown is measured from the file with its numerator and denominator.
- Cost and margin never reach a customer-facing surface. Price reads go through the declared price levels; a document renders from frozen lines only.
- A refusal is a sentence with its reason, where it is refused. Never a silently disabled control.
- A picture belongs only to the exact model it depicts, with provenance in the image ledger. No stand-ins.
- The seed and the pictures are bytes: copy them, never text-process them with a shell tool.
- Report what was measured. A failing ported test is a packer or port bug, never a reason to edit the assertion.

## How a screen gets built

1. A reference sweep into `docs/research/refs/<screen>/` — boats, cars, premium build flows, the best registers. Never only Porsche.
2. Two or three static directions drawn on real seed content, published as a canvas; the owner picks. Each board names two references no earlier board used and says what this screen does that no other does.
3. Built in its own folder under `src/screens/` with its own styles. No shared page component. Never "same treatment as X".
4. The owner looks at it in the browser (`.claude/launch.json`, port 5100). Rulers stop only honest failures: contrast, overlap, truncation, density.
5. It works at every screen size. The rulers run at six viewports, from a 390px phone to a 1920px wide screen, and a layout that only holds where it was drawn fails the gate. A direction board says how it reflows.
6. It reads tokens, never a literal colour, face or picture path, so a dealership's own appearance can override it later. See `docs/CUSTOMISATION.md`.

A library the owner names is adopted and used well. The only vetoes: it fakes a figure, puts cost on a customer surface, ignores reduced motion, or breaks keyboard reach.

## Shape

- `src/domain` is pure: no React, no store, no DOM, no Dexie. Only `src/data` imports Dexie.
- Four stores in `src/state/`: catalogue, quotes, session, prefs. Only prefs touches localStorage.
- Quotes change through commands with inverses and events. An issued quote refuses edits with a sentence.
- A position inside a screen is a URL search param. A derivation is a pure function in `src/domain`.
- `tools/check.ts` is the one static guard. Every guard has a fixture test proving it can fail.
- Ports live in `tools/ports.ts` and nowhere else.

## Commands

- `npm test` — typecheck, lint at zero warnings, prettier, vitest, check. About 110 s on an idle machine; 145-155 s while a dev server and a browser are also running, measured 2026-09-17. It is not "under two minutes" any more and saying so would be a figure nobody had measured.
- `npm run build && npm run e2e` — Playwright flows, shots and rulers against `vite preview`.
- `npm run dev` — the app on port 5100.

## Working

- Push only when the owner says so. Finish a phase, then start the next without asking.
- A decision is a dated one-liner in `docs/DECISIONS.md` that names what lost.
- The old repo (`C:\Users\Asaf\dev\HL_Playground`) is engine and evidence only. Nothing visual or rule-like is ported from it.
