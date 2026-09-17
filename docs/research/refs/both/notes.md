# Both screens — the follow-up round on counting, the load, and the empty register

Driven and read 2026-09-17. **37 sources driven, 29 frames landed, 27 distinct images** (two pairs
are byte-identical — the exact arithmetic this round exists to fix). Every frame named below was
opened and looked at. Frames: `docs/research/refs/both/live2/`, gitignored, mirrored to
`C:\Users\Asaf\dev\hl-refs\hl2\both\live2\`. Ledger and the full census: `sources-index.md` beside
this file.

**Why this round.** A critic found that both screens' syntheses and indexes were reporting *ledger
rows* as *frames* — `entry/notes.md`'s "101 frames" and "50 gallery-mined", `home/notes.md`'s "199
frames, 196 distinct", and, written while this round was running, `home/sources-index.md`'s "261
frames, 258 distinct". Small numbers, but they are the sweeps' own measured figures, and the
standard here is that a figure is counted from the thing itself. Recounting exposed three further
things the syntheses could not have known, and each of them is a reason a frame does not exist —
which is why this round is a *capture* round, not an editing pass.

---

## 1. The three findings behind the wrong numbers

**A ledger row is a source driven, not a picture taken.** 29 of 456 rows across the three screens
produced no frame. The failures are honest and named in each ledger; what was wrong was adding them
into a picture count.

**A row can be re-driven after it has already left a picture behind.** `capture.ts` keys the ledger
by `id` and rewrites the row; it never deletes the `.png`. So `home/live/peloton-home.png` and
`home/gallery/icebug-home.png` sit on disk under a row that records a click timeout — **the frame is
from an earlier run and the row no longer describes it**. Both were re-driven clean this round, so
each now has a frame whose row matches it.

**Nine frames are a byte-for-byte copy of another frame because a capture step did nothing.** The
full list is in `sources-index.md` §1. The ones that matter to a board:
`home/gallery/grafana-play-scrolled.png`, `home/gallery/trek-scrolled.png`,
`home/gallery/westmarine-home-scrolled.png` and `home/live2/fjord-configurator-scrolled.png` are
**identical to their unscrolled twin — the scroll never happened**, and
`entry/gallery/excalidraw-blank-full.png` is identical to the viewport frame, so `fullPage: true`
returned no full page. Nothing may be claimed from any of them as a second view. It also sharpens
home's own motion test: "two captures differ" is a proof of motion, and four pairs here return the
opposite answer cleanly.

---

## 2. The load itself — the gap `entry/notes.md` §7 named, now closed

§7 ended: *"no frame anywhere shows a progress state mid-load — a bar, a step ticking over, a count
climbing… A board that wants a progress state is inventing it."* Two frames now show it, and a third
shows what happens after.

**A wait explained as a named step that ticks.** `live2/stackblitz-boot.png`. The preview pane holds
a lightbulb glyph, **"Booting WebContainer"** as a heading, and directly beneath it *the same words
again as a checklist line with a filled tick*. Not a spinner and not a percentage: the machine names
the one thing it is doing and marks it done. For our file door that is "Reading the manifest ✓ ·
Writing 53 tables · Indexing 15,691 rows" — every line a real step of the load, each ticked as it
lands, nothing invented.

**A layout that exists before its numbers do.** `live2/cloudflare-speed.png` is the strongest single
find of the round. The whole measurement screen is drawn *empty*: every figure slot — Download,
Latency, Jitter, Packet Loss — holds an **em-dash**, the three score chips hold grey skeleton pills,
the two latency panels hold grey blocks, and the progress strip is a row of about ninety **hollow
discrete ticks** with the state word "Paused" beside it. Three lessons, all measured: the unknown
figure is a dash and never a zero; the progress is countable units, not a smooth bar; and the wait
has a state word next to it. On top sits a white card that does what our file door must do —
**it says what the act will cost before it runs**: "When you run Speed Test, your IP address will be
shared with Cloudflare…", one blue Start, and in bold, "Note: A speed test can consume up to 200MB
of data."

**And the negative, from the same URL 25 s apart.** `live2/stackblitz-ready.png`: the panel that said
"Booting WebContainer" is **blank**. The thing that explained itself while it worked says nothing
when it is done. Our load must not do that — the state that replaces the progress is the
confirmation, and it is written.

**What the confirmation sounds like when someone has written it.** Three shipping products, three
registers, all short:
- `live2/sqlime-demo.png` — the file door pressed, the document named in the title bar
  (`SQLite Playground // demo.db ✎`), and one line of body text above the result: **"10 rows, took
  2 ms."** The figure and what it cost, in eight words. `sqlite 3.45.0` sits grey in the editor's
  corner — the engine stamped quietly, as our `sourceFingerprint` and `packedAt` should be.
- `live2/duckdb-shell-loading.png` — three mono lines on landing: "DuckDB Web Shell running…",
  "**DuckDB v1.5.2 (Variegata)**", `Enter ".help" for usage hints.` — and the prompt's gutter reads
  **`memory`** in orange. Where the data lives, stated as a label on the working surface rather than
  as a paragraph. That is "in this browser", said once, in the product's own voice.
- `live2/pyodide-console-loading.png` — the engine names its version and its build date on the first
  line it prints.

**One number as the whole answer.** `live2/fast-com.png`: "Your Internet speed is" at ~34 px over
**58** at ~230 px with "Mbps" at ~62 px beside it, and one quiet outlined "Show more info". Roughly
6.8× head-to-figure — far past the 6× head the owner called awful — and it works for exactly one
reason: **the 6× is spent on the answer, not on a title**, and there is only one figure on the page.
That is the licence for the price figure being the largest number on a selling screen, measured
rather than asserted.

**A position with its denominator.** `live2/pdfjs-viewer.png` keeps `1 of 14` in the toolbar: the
current page editable in a small field, the total beside it as plain text. The shape for "chapter 3
of 6" and for any count we show with its measured denominator.

---

## 3. A register with nothing in it — driven here in parallel with the home round

Home must carry open drafts, and on day one there are none. This round drove two registers to zero
without knowing that the home round was doing the same thing an hour earlier (its frames are
`home/live2/empty-github-search.png`, `empty-arena.png`, `empty-huggingface.png`,
`empty-npm-search.png`, `empty-shadcn.png` and eight more). **These are second, independent captures
of two of those sites, from different URLs**; where they add a reading the home round's frames do not
carry, it is named below. What follows is what is in *these* two frames.

**The count stays, and every facet keeps its zero.** `live2/github-search-zero.png`. The head reads
**"0 results (32 ms)"** — the zero written as a figure, with what it cost. Down the left rail every
facet keeps its own pill: Repositories 0, Issues 0, Pull requests 0, Discussions 0, Users 0, Commits
0, Packages 0, Wikis 0, Topics 0, Marketplace 0. **The shape does not collapse at zero; the counts
do not disappear.** The body then carries one headline sentence ("Your search did not match any
repositories"), one grey line ("You could try one of the tips below.") and two collapsed rows
offering the next act.

**The empty state is the title, and the controls stay standing.** `live2/arena-search-zero.png`. The
page title itself becomes the answer — "Are.na / **No results for "…"**" at ~28 px — the four filter
columns (Where · Types · Fields · Order) stay fully drawn with **unavailable options greyed in place
rather than removed**, so the question can be changed without hunting, and the body holds one small
bordered box with an info glyph reading **"Nothing yet"**. Two words, at body size, in a box: the
exact register CLAUDE.md asks of an empty state.

**The counter-example, and it is the default.** `live2/jupyterlite-loading.png`: a file register with
column heads (Name · Modified), **no rows, and not one word saying so**; two bare zeros in the status
bar. This is what an empty table looks like when nobody wrote it — and it is what our drafts strip
becomes if the empty state is left to the grid.

**Still not found: a boat register at zero.** The home round tried Boatsales and was refused at the
edge ("You have been blocked" — its frame is `home/live2/empty-boatsales.png`). Two more were tried
here and neither landed either. `live2/boattrader-stacer-zero.png` did not go to zero —
the make filter was dropped and the page fell back to the whole register. It is worth keeping for two
other reasons: the count as a plain line above the grid (**"110,398 boats"**, Sort at the right), and
**a failure written as a band above the results that says what happened and what is shown instead**
("The link you clicked has expired. Please see the updated list of boats below.") — which is our
refusal sentence, in a marketplace. `live2/yachtworld-stacer-zero.png` painted its header and nothing
else. The gap narrows to: *no marine marketplace was seen at zero rows.*

---

## 4. Two price-file brands driven for the first time

**Surtees** — `live2/surtees-boats.png`. `surtees.co.nz` serves a certificate for another name on
both hosts; `surteesboats.com` answers. A hard black italic wordmark on white, a blue announcement
strip, then a full-bleed photograph of a hull leaping clear at golden hour, and **the type sits
straight on the water in the quiet lower-left** — "SURTEES BOATS" at ~52 px condensed white caps over
one sentence ("Incredibly smooth ride, stability at rest and simply built to fish! Est. 1993") and
one outlined white pill. No panel, no veil. Two arrow buttons bottom right: a rotating hero. And the
detail worth stealing for the register: **the cart states its count even at zero — "( 0 )"**.

**Yamaha Australia** — `live2/yamaha-motor-au.png`. Full-bleed photograph, caption top-left
("ROAD MOTORCYCLES" ~30 px caps over "Our Unique Advantage ›"), **eight pager dots centred at the
foot with the second lit**, then a black band of four photographic tiles with condensed caps laid on
them. A moving hero on a brand the price file carries — an eighth for entry's motion census, which
listed seven. Worth one honest note for home: Yamaha leads with motorcycles; **the manufacturer's
order of kinds is not the dealer's**, and Northside's kinds come from the file, not from the brand.

**Raymarine** — `live2/raymarine-account.png`. A dark archipelago at dusk, ~40 px letterspaced caps
left, one magenta primary. There is **no account door anywhere in the navigation** — a marine
electronics brand that simply has no consumer sign-in to study. It does state its locale as a
control rather than guessing it: "AUD" and an Australian flag, top right.

---

## 5. Patterns worth taking, named

**The act says its cost before it runs.** `live2/cloudflare-speed.png` ("up to 200MB of data"),
`live2/sqlime-demo.png` ("10 rows, took 2 ms" after). Our file door names 53 tables and 15,691 rows
*before* the press and repeats the measured figure after it.

**The dash is the honest empty figure.** `live2/cloudflare-speed.png` puts an em-dash in every number
slot before the measurement. Never a zero standing in for "not yet", never a spinner where the figure
will be.

**Progress as countable units with a state word.** `live2/cloudflare-speed.png`'s tick strip labelled
"Paused"; `live2/stackblitz-boot.png`'s single ticked step. Both name *what* is happening; neither
claims a percentage it cannot know.

**The zero is a figure, not an absence.** `live2/github-search-zero.png` (every facet keeps its `0`),
`live2/surtees-boats.png` (the cart reads "( 0 )"). Against `live2/jupyterlite-loading.png`, where
the empty register says nothing at all.

**The welcome is drawn onto the app and dies when work starts.** `live2/excalidraw-loading.png` is
the fullest instance found: three hand-lettered honesty lines under the wordmark, a four-row menu
with each shortcut printed on its own row (`Open  Ctrl+O`), **three hand-drawn arrows with
hand-lettered labels pointing at the real controls** ("Export, preferences, languages, …" at the
burger; "Pick a tool & Start drawing!" at the toolbar; "Shortcuts & help" at the corner), and one
plain line stating the canvas gesture. `live2/vscode-dev-loading.png` is the same idea in a
product-shaped layout: an Explorer panel reading "No Folder Opened / You have not yet opened a
folder." over **two filled buttons**, Start beside Recent, Recent written as a sentence with the act
inlined as a link, and — at the foot — **a checkbox for whether the welcome appears at all**, which
is "a returning visitor lands on Home" as a thing the person controls rather than a silent cookie.
`live2/diagrams-doors.png` is the third position: no welcome at all, straight into a blank document
named "Untitled Diagram" in the title bar.

**A register grouped by time, each group carrying its count.** `live2/amie-home.png` shows the
product's own list as the hero: Yesterday / Last week / Previous 30 days / Past, each row with a
small right-aligned figure. That is the quotes register's "diary" direction, shipping. (Its figures
are the vendor's; ours are the seed's or nothing.)

**A brand shelf ranked by focus rather than levelled.** `live2/raycast-store.png` arcs app marks in
two rows, the centre ones bright and the outer ones dimmed and blurred — a genuine alternative to
`ref/tables/linear-homepage-2.png`'s one optical weight. **Not usable as drawn**: a brand the file
carries but has no picture for must be *named*, never faded to nothing.

**`⌘K` printed inside the field.** `live2/raycast-store.png` puts two keycaps in the search field's
right edge, on the page's primary search rather than in a rail — a fourth instance for home §2.

---

## 6. What to avoid, each with its frame

- **The panel that explains itself going blank when it succeeds** — `live2/stackblitz-ready.png`
  against `live2/stackblitz-boot.png`, the same URL 25 s apart. Replace a progress state with a
  written confirmation, not with nothing.
- **An empty register with no sentence** — `live2/jupyterlite-loading.png`: column heads, no rows,
  no words.
- **The refusal as the quietest control on the consent card** — `live2/beneteau-my.png` again
  (a small underlined "CONTINUE WITHOUT ACCEPTING" *above* four paragraphs, two filled buttons
  below). Now measured on three sites: Peloton puts Accept All and Reject All as **two equal dark
  buttons side by side** (`live2/peloton-home.png`); Icebug gives the refusal a full-width button but
  leaves it outlined under a filled ACCEPT ALL (`live2/icebug-home.png`); Bénéteau hides it. Ours has
  no consent card, but the ranking is the rule for any pair of acts: equal weight unless one is
  genuinely primary.
- **Three modals on first paint** — `live2/peloton-home.png` (a country modal, a cookie notice and a
  chat promotion at once) and `live2/icebug-home.png` (a consent panel taking 41 % of the window over
  a "WELCOME!" country modal). Neither page was ever seen.
- **A blurred, dimmed mark in a shelf** — `live2/raycast-store.png`'s outer icons. Beautiful, and
  dishonest for a dealer's brands.
- **A route that returns a title and no pixels** — `live2/whaler-configurator.png` (pure white),
  `live2/bmw-au-login.png` (nav only). Recorded as evidence; neither is a reference.

---

## 7. What this adds to the directions

**Entry direction D, "the sheet already open"** gains its load and its confirmation, which it did not
have: `live2/stackblitz-boot.png` (the ticked step) and `live2/sqlime-demo.png` ("10 rows, took
2 ms", the document named in the title bar). With `live2/excalidraw-loading.png`'s arrows drawn onto
the real controls, D is now the only entry direction whose *three* states — before, during and after
the press — are all drawn from frames rather than invented.

**Home direction D, "The file, open" — corroborated, not rescued.** When this round was planned, D
rested on `gallery/huggingface-home.png` alone: the other two references named beside it (Collecting
Cars' state tabs, Stabicraft's two doors) are shared with A and B, so D had **no second exclusive**.
That gap was closed by the home round itself at 11:11 on 2026-09-17, with
`home/live2/github-repos-register.png`, `home/live2/empty-github-search.png` and
`home/live2/empty-excalidraw.png`. This round drove GitHub search at zero and Are.na at zero
**independently, without knowledge of that**, which is worth exactly one thing and no more: two of
D's references are now **two captures each, taken by two agents from different URLs**, and they
agree. `both/live2/github-search-zero.png` adds one reading the home round's frame does not carry —
the head states **the count *and what it cost*, "0 results (32 ms)"** — and
`both/live2/arena-search-zero.png` adds the greying-in-place of unavailable filter options. Neither
is a new exclusive; both are second opinions on an answered question.

**Entry §3's motion census** goes from seven moving heroes to eight: add `live2/yamaha-motor-au.png`
(eight pager dots, the second lit). `live2/surtees-boats.png` carries two arrow controls, which is a
ninth on the same standard. Both are brands the price file carries. The sentence the census licenses
is unchanged and still only one sentence: *heroes in this trade move.* No still here licenses an
easing, a duration or a sequence.

---

## 8. What remains open, and why

- **A progress state with a climbing figure.** Closed only in part. A *ticked step*
  (`stackblitz-boot`) and an *empty, dash-filled layout with a tick strip* (`cloudflare-speed`) were
  caught. A determinate bar filling, or a count climbing table by table, was not: every engine driven
  (DuckDB, Pyodide, Photopea, Excalidraw, VS Code, JupyterLite) finished inside the tool's own
  network-idle wait, and the two byte-identical pairs prove it. A board wanting a filling bar is still
  inventing it; a board spending the load on the manifest's counts appearing as they land now has two
  frames to draw from.
- **A marine marketplace at zero rows.** Boat Trader dropped the filter; YachtWorld never painted its
  body; Boatsales was blocked in the home round. The zero-row references are GitHub and Are.na, and
  no board may claim a boat register has been seen empty.
- **Boston Whaler's configurator** (`whaler-configurator`, second attempt) and **BMW Australia's own
  login** (`bmw-au-login`, second attempt) return a title and no pixels in headless Chromium. Not
  fought. `live/whaler-build-and-price-scrolled.png` and `live/bmw-oneid.png` remain the only frames
  for those two doors.
- **Highfield's burger menu** — three attempts, three different selector sets, three timeouts. The
  menu state of a brand the file carries has never been captured.
- **height.app** refuses the connection outright on both its login and its home; **christies.com**
  times out at 45 s on both paths (four attempts across two rounds); **my.yamaha-motor.com.au** and
  **my.yamaha-motor.com** do not resolve; **owners.beneteau.com** does not resolve and
  `beneteau.com/en/my-beneteau` redirects to the home. Bot protection and dead hosts were not fought.
- **draw.io's two-door dialog** was never reached: the click times out and the app opens straight
  into a blank named document.
- **Raymarine has no consumer account door to study.** Not a failure — a finding.
- Nothing here is an image the app may use. Every frame is a reference; the app's pictures come from
  the pack's own addresses and `heroes-ledger.json`.
