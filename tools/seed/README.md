# The seed pack

`data/northside/` is **generated**. `manifest.json` + `entities.json` + `tables/<key>.json`
(an array of rows, one row per line) + `images.json` (the provenance ledger). Never edit it
by hand and never text-process it with a shell tool: the seed and the pictures are bytes.
Change the generator; run the generator.

```bash
npm run pack                               # rebuilds data/northside and docs/data/*.md
npx tsx tools/seed/fetch-images.ts         # asks the network about unheld pictures
```

## The packer

`pack.ts` imports the OLD repository's committed `buildNorthsideProject()` — the same
function the old app called — and re-keys what it builds:

| what     | id                                   |
| -------- | ------------------------------------ |
| table    | the seed key, `boat_stacer`          |
| row      | key `:` 1-based ordinal, `boat_stacer:12` |
| field    | key `.` column key, `boat_stacer.qr` |

except the four `__` columns (`__origin`, `__recommended`, `__order`, `__discontinued`),
which keep their literal ids because the model reads them by string. Every reference is
rewritten; `orgId` is `northside` on every record; every row keeps its `Source`.

The old seed only resolves under the old repository's tsconfig, so the packer has two
halves: `pack.worker.ts` runs under `tsx --tsconfig <old>/tsconfig.app.json` with the
preload `pack.hooks.mjs` (a stub for the old store's stylesheet import and for
`import.meta.env`; Dexie needs no `indexedDB` to construct, measured) and writes a
snapshot; `pack.ts` re-keys it, declares
each priced table's ladder (`levels.ts` — the old resolver run once, refusing a cost band by
throwing), asserts 53 tables / 15,691 rows / 28 joins and the Surtees fidelity checks
against the old repository's own holds BEFORE writing, judges every held picture
(`verdict.ts`, the old `scene.ts` judge over pixels), and writes the pack and
`docs/data/SEED.md` / `IMAGES.md`. The old repository is read only: `HL_PLAYGROUND` or
`~/dev/HL_Playground`. The manifest records the source file's sha256 and the old app's
fingerprint of it; `src/data/pack.test.ts` recomputes the fingerprint over the pack.

The one read of the source TEXT is `source.ts`, which takes the column keys off the
`TABLES` literal (the old builder keeps them private) and verifies every key list against
the built table — count, names, types — before it is used.

## The pictures

`fetch-images.ts` is the port of `legacy/fetch_images.py`: one request per unheld address,
paused, within a budget; WebP at long edge 1100, quality 74; provenance on every copy; the
dealer's `mpf-mirror` by `sha1(address)[:16]` when a host refuses, with the declared-size
check; nothing substituted. Originals cache in `.imgcache/` (gitignored). Flags are in the
file's header.

`marks.ts` holds the brand marks and, first, Northside Marine's own (`--only=northside-marine`,
`role: "organisation"` in `marks-ledger.json`), byte-for-byte, with its ink measured.

`propose-images.ts` counts what the file carries against what is held and proposes — never
holds — the measured candidates that would fill the gaps, one contact sheet per group under
`docs/research/imagery/proposals/`, with `docs/research/imagery/gaps.md` beside them. It runs
the picker's own `fleetOf` in Node through `app.hooks.mjs` (the packer's stub hook pointed at
this repository's `src/`):

```bash
npx tsx --tsconfig tsconfig.app.json --import ./tools/seed/app.hooks.mjs tools/seed/propose-images.ts [--count|--sheets]
```

A person judges each sheet into `<group>.verdicts.json`. Only what a verdict accepts is held, in
`data/northside/pictures.json` (the pictures of MODELS — the rows' own addresses stay in
`images.json`), by the same tools, reading the verdicts through `accepted.ts`:

```bash
npx tsx --tsconfig tsconfig.app.json --import ./tools/seed/app.hooks.mjs tools/seed/fetch-images.ts --accepted  # catalogue tier + findings + IMAGES.md
npx tsx --tsconfig tsconfig.app.json --import ./tools/seed/app.hooks.mjs tools/seed/heroes.ts                   # hero tier, 2560
npx tsx tools/seed/hero-widths.ts                                                                              # 640 and 1280 under each hero
npx tsx tools/seed/marks.ts                                                                                    # a mark a verdict accepted
```

Each is idempotent: a second run fetches nothing it holds and rewrites only the verdict's words.
A verdict with a licence line (Jeanneau's) is accepted and not held. The app reads all of it
through one reader, `src/domain/model/pictures.ts`.

## Served how

`servePack.ts` is the Vite plugin: in dev it streams `data/northside/` at
`/data/northside/…`; at build it emits the same files into `dist/data/northside/`. The
browser reads them through `src/data/pack/load.ts`; a node test reads them through
`src/test/fixtures/pack.ts`.

`legacy/` is the Python pipeline the old seed was derived with, kept as evidence. Nothing
in the app depends on it.
