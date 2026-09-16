# HL_2.0

HelmLogic, rebuilt. A boat dealership's configurator and quoting system: one table per brand, business rules written as English sentences, motor and trailer fitment with the reason for every refusal, quotes that freeze prices the moment something is picked, and the document a dealer hands a customer.

It is local-first: the price file lives in the browser's IndexedDB behind one repository seam, and a hosted backend is a later adapter, not a rewrite.

## The seed is real, and it is public

`data/northside/` holds Northside Marine's Master Price File — 53 tables and 15,691 rows, 28 of the tables being the fitment joins that pair hulls with motors, trailers and dealer-fit parts — together with the product images the file points at. It includes the dealer's cost columns. It is committed with the owner's decision of 2026-09-16 so that the app is judged on a real business's data rather than an invented one. It is not a licence to use the figures elsewhere, and nothing in the app ever shows a cost on a customer-facing surface.

## Run it

```bash
npm ci
npm run dev
```

The app is on http://localhost:5100. `npm test` runs the typecheck, the linter at zero warnings, the unit suites and the static guard. `npm run build && npm run e2e` drives the built app through Playwright.

## Read next

- `docs/DECISIONS.md` — every decision, dated, naming what lost.
- `docs/LATER.md` — what is deliberately not built yet.
- `docs/SCREENS.md` — each screen, its references and its direction.
- `docs/data/SEED.md` and `docs/data/IMAGES.md` — what the pack holds and where every picture came from.
