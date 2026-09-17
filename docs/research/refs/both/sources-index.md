# Both screens — the census, and the follow-up round's own frames

Written 2026-09-17. This file exists because a critic found that both syntheses **counted ledger
rows as frames**. It carries two things: the count, recomputed from the files on disk rather than
from any ledger; and the ledger of the round driven to close the gaps that count exposed.

Frames from this round: `docs/research/refs/both/live2/<id>.png`, gitignored, mirrored to
`C:\Users\Asaf\dev\hl-refs\hl2\both\live2\`. Ledger: `live2/sources.json`. All 1440 × 900, headless
Chromium, `en-AU`; consent answered with the most privacy-preserving control present; **nothing
signed in, nothing typed, no account made**.

---

## 1. The census, measured 2026-09-17 at 11:17

Three figures differ and all three were being reported as one. They are:

- **index rows** — what a ledger or an index table holds. A row is a *source driven*, not a picture.
- **frames** — `.png` files actually on disk. A row whose capture failed has no frame.
- **distinct images** — frames after byte-identical duplicates are collapsed (md5).

| sweep | index rows | rows with no frame | frames | distinct |
|---|---|---|---|---|
| `entry/live` | 46 | 9 | 37 | 37 |
| `entry/live2` | 48 | 6 | 42 | 39 |
| `entry/gallery` | 50 | 2 | 48 | 47 |
| entry stock (`hl-refs\ref\entry`) | 14 | 0 | 14 | 14 |
| **entry, all four** | **158** | **17** | **141** | **137** |
| `home/live` | 87 | 2 | 86 | 86 |
| `home/live2` | 62 | 0 | 62 | 61 |
| `home/gallery` | 75 | 2 | 74 | 70 |
| home stock (`hl-refs\ref`, read in `notes-stock.md`) | 37 | 0 | 37 | 34 |
| **home, all four** | **261** | **4** | **259** | **251** |
| `both/live2` (this round) | 37 | 8 | 29 | 27 |
| **all three screens** | **456** | **29** | **429** | **415** |

Recount at any time, from the repo root:

```
node -e "const fs=require('fs'),cr=require('crypto'),p=require('path');const h=f=>cr.createHash('md5').update(fs.readFileSync(f)).digest('hex');const d=process.argv[1];const f=fs.readdirSync(d).filter(x=>x.endsWith('.png'));console.log('frames',f.length,'distinct',new Set(f.map(x=>h(p.join(d,x)))).size)" docs/research/refs/entry/live2
```

### Two ways a row and a frame come apart, both seen here

1. **The capture failed.** 29 of the 456 rows produced no picture — DNS, an untrusted certificate,
   a bot wall, a click that matched nothing, a screenshot that timed out. Each is named with its
   reason in its own ledger; none was fought.
2. **A row was re-driven after an earlier success.** `capture.ts` keys the ledger by `id` and
   overwrites the row, but it never deletes the `.png`. So `home/live/peloton-home.png` and
   `home/gallery/icebug-home.png` are on disk while their ledger rows record a click timeout: **the
   frame is from an earlier attempt and the row no longer describes it.** Both sites were re-driven
   clean in this round (`both/live2/peloton-home.png`, `both/live2/icebug-home.png`), so the honest
   frame for each now exists with a row that matches it.

### The byte-identical pairs, named

A duplicate is not a second view. Fourteen frames across the three screens are a byte-for-byte copy
of another frame, and in nine of those the *capture step did nothing*:

| pair or group | what it means |
|---|---|
| `entry/live2` `astonmartin-account` = `astonmartin-my` | two URLs, one 404 page |
| `entry/live2` `bentley-my` = `bentley-mybentley` | two URLs, one 404 page |
| `entry/live2` `stackblitz-booting` = `stackblitz-ready` | already named in `entry/sources-index.md`; both are the same 404 |
| `entry/gallery` `excalidraw-blank-full` = `excalidraw-blank` | **`fullPage: true` returned the viewport**; there is no full-page Excalidraw frame |
| `home/gallery` `grafana-play-home` = `grafana-play-scrolled` | **the scroll step did nothing**; there is no scrolled Grafana frame |
| `home/gallery` `trek-home` = `trek-scrolled` | **the scroll step did nothing** |
| `home/gallery` `westmarine-home` = `westmarine-home-scrolled` = `westmarine-brands` | three ids, one picture; neither the scroll nor the brands route landed |
| `home/live2` `fjord-configurator` = `fjord-configurator-scrolled` | **the scroll step did nothing** |
| home stock: `boats/jeanneau-1` = `-2`, `boats/williams-1` = `-2`, `tables/stripe-dashboard-docs` = `-2` | already named in `home/notes-stock.md` |
| `both/live2` `duckdb-shell-loading` = `duckdb-shell-ready` | 14 s apart, no difference: the engine landed before the first shutter |
| `both/live2` `pyodide-console-loading` = `pyodide-console-ready` | 16 s apart, no difference: same |

The consequence for any board: **a `-scrolled` frame in that list is not a second view of the page,
and nothing may be claimed from it as one.** The last two are the opposite — a pair that does not
differ is the one honest thing a still pair can say about motion, and here it says *there was none
left to see*.

---

## 2. This round's ledger — `both/live2/`

37 sources driven, 29 frames landed, 27 distinct. Grouped by what each was driven for.

### 2a. The load itself — the state no frame in either sweep had shown

| id | URL | what landed |
|---|---|---|
| `stackblitz-boot` | stackblitz.com/edit/vitejs-vite-react-ts | **The gap, closed.** "Booting WebContainer" as a heading, and under it the same words again as a **ticked checklist line** |
| `stackblitz-ready` | same URL, 25 s later | The same panel gone **blank** — the thing that explained itself says nothing when it finishes |
| `cloudflare-speed` | speed.cloudflare.com | Every figure slot drawn with an **em-dash**, skeleton pills for the scores, a strip of ~90 hollow ticks beside the word "Paused", and a card saying what the act will cost ("up to 200MB of data") before it runs |
| `fast-com` | fast.com | One figure as the whole page: **58** at ~230 px, "Mbps" at ~62 px, one quiet "Show more info" |
| `duckdb-shell-loading` / `-ready` | shell.duckdb.org | Identical: "DuckDB Web Shell running…", "DuckDB v1.5.2 (Variegata)", and the prompt gutter reading **`memory`** — where the data lives, as a label |
| `pyodide-console-loading` / `-ready` | pyodide.org/en/stable/console.html | Identical: the engine names its own version and build date on landing |
| `vscode-dev-loading` | vscode.dev | Painted, not loading: the fullest VS Code welcome yet — "No Folder Opened / You have not yet opened a folder." over **two filled buttons**, Start beside Recent, and a checkbox for whether the welcome shows at all |
| `photopea-loading` | photopea.com | The marketing page, not the app: "**Fully Local** — There are no uploads…" as the first of four headed blocks |
| `excalidraw-loading` | excalidraw.com | Richer than `entry/gallery/excalidraw-blank.png`: the three honesty lines, a four-row menu with shortcuts printed on each row, and **three hand-drawn arrows labelled onto the real controls** |
| `sqlime-demo` | sqlime.org/#demo.db | The file door's second state: `// demo.db ✎` in the title bar and "**10 rows, took 2 ms**" in body text above the table; `sqlite 3.45.0` as a grey stamp in the editor's corner |
| `pdfjs-viewer` | mozilla.github.io/pdf.js/web/viewer.html | Loaded before the shutter; keeps **`1 of 14`** — position in a field with its denominator beside it |
| `jupyterlite-loading` | jupyter.org/try-jupyter/lab | A register with column heads (Name · Modified) and **no rows and no sentence** — the undesigned empty state |
| `diagrams-doors` | app.diagrams.net | The doors dialog was not reached (third click timeout); what landed is the blank document named **"Untitled Diagram"** in the title bar |

### 2b. A register with nothing in it

| id | URL | what landed |
|---|---|---|
| `github-search-zero` | github.com/search?q=zzqqxxjjvvwwkkmm… | **0 results (32 ms)** as the head, and every facet in the rail keeping its own `0` pill; a headline sentence and two next-act rows in the body |
| `arena-search-zero` | are.na search | The empty state **is the title** — "No results for …" at ~28 px; four filter columns still drawn, unavailable options greyed in place; one small box reading "**Nothing yet**" |
| `boattrader-stacer-zero` | boattrader.com/boats | Did **not** reach zero: the make filter was dropped and a yellow band says so — "The link you clicked has expired. Please see the updated list of boats below." — over "110,398 boats" |
| `yachtworld-stacer-zero` | yachtworld.com/boats-for-sale/make-stacer | Header only; the body never painted. Evidence, not a reference |

### 2c. Re-drives of rows that produced no frame in an earlier sweep

| id | URL | what landed |
|---|---|---|
| `surtees-boats` | surteesboats.com | **A price-file brand, captured at last.** Hull leaping at golden hour, type straight on the quiet lower-left water, one outlined pill; two arrows = a rotating hero; the cart reads **"( 0 )"** |
| `yamaha-motor-au` | yamaha-motor.com.au | A price-file brand: full-bleed photograph, caption top-left, **eight pager dots, the second lit** — an eighth moving hero |
| `raymarine-account` | raymarine.com/en-au | The marine-electronics home. **No account door anywhere in the nav**; "AUD" and a flag stated as a control top-right |
| `beneteau-my` | beneteau.com | Landed on the home, not on My Bénéteau. The consent card again: "CONTINUE WITHOUT ACCEPTING" as a **small underlined link above** four paragraphs, two filled buttons below. Nothing accepted |
| `peloton-home` | onepeloton.com | Three overlays at once; its cookie card is the good case — **Accept All and Reject All as two equal dark buttons side by side** |
| `icebug-home` | icebug.com/en-SE | A full-height consent panel taking 41 % of the window; the refusal is a full-width button but **outlined under a filled ACCEPT ALL**. Nothing accepted |
| `amie-home` | amie.so | Not a door (the login host serves an untrusted certificate). Its hero screenshot is a **register grouped by time** — Yesterday / Last week / Previous 30 days / Past — each row with a right-aligned count |
| `raycast-store` | raycast.com/store | The home still times out; this route landed. A brand shelf drawn as **depth, not a level row**, and `⌘K` printed as two keycaps inside the search field |
| `bmw-au-login` | bmw.com.au/au/s/login | Title returns, **body never paints**. The Australian BMW door is still unseen |
| `whaler-configurator` | bostonwhaler.com/us/en/boat-configurator | Pure white, nothing painted. Boston Whaler's configurator is still unseen |

### 2d. Rows that produced no frame (8) — named, not fought

| id | URL | reason |
|---|---|---|
| `highfield-menu` | highfieldboats.com | `locator.click` timeout, third attempt with three different selector sets. The burger state has never been captured |
| `yamaha-my-au` | my.yamaha-motor.com.au | `ERR_NAME_NOT_RESOLVED` — the host does not exist (nor does `my.yamaha-motor.com`, tried in `entry/live2`) |
| `surtees-home` | www.surtees.co.nz | `ERR_CERT_COMMON_NAME_INVALID` on both the bare and `www` hosts. Closed instead by `surtees-boats` at surteesboats.com |
| `height-login` / `height-home` | height.app | `ERR_CONNECTION_CLOSED` on both the login and the marketing home. Height is gone or refusing at the edge |
| `raycast-home` | raycast.com | `page.screenshot` timeout, fourth attempt. Partly closed by `raycast-store` |
| `christies-home` / `christies-en` | christies.com | `page.goto` timeout at 45 s on both paths, third and fourth attempts |

---

## 3. What this round changes in the other two indexes

- `entry/sources-index.md` and `entry/notes.md`: the first round is **99 frames**, not 101; the
  gallery contributed **48 frames from 50 driven rows**; `live2` contributed **42 frames (39
  distinct) from 48 driven rows**. Corrected in place, 2026-09-17.
- `home/sources-index.md` and `home/notes.md`: **261 index rows, 259 frames, 251 distinct** — not
  "261 frames, 258 distinct". The first sweep's "199 frames" is **199 rows, 197 frames, 190
  distinct**. Corrected in place, 2026-09-17.
- Both: any board citing a `-scrolled` frame from the duplicate list above is citing the unscrolled
  page. See §1.
