# Home — what the four boards actually render

Screenshot pass: `npx tsx tools/research/shots.ts home`, 1440 × 900, deviceScaleFactor 1. All four boards clean — no page error, no failed request, nothing scrolling its own frame. Shots in `docs/directions/home/shots/`. Written by opening each PNG, not by reading the HTML. This pass replaces the 11:04 one: all four boards were revised after the critique and three of them changed substantially.

Canvas: `npx tsx tools/research/board.ts home` → `docs/directions/home/canvas.html`, 4.49 MB, 4 directions, **B carries the recommended pill**.

---

## A — A shelf of kinds
`a-shelf-of-kinds.html` — 50,212 bytes (49.0 KB) · shot 499,091 bytes (487 KB)

Still white and still six horizontal bands — desk bar, greeting, kind shelf, grey brand band, drafts strip, provenance foot — but two of the three things the last pass called weak are fixed and one new thing is the board's best moment.

The six kind tiles remain at exactly one size, and **Packages no longer prints a flat zero**. Its well now reads `NO PACKAGE PICTURED` over "61 rows do carry one. All 61 are the motor's cut-out, shown under Motors." with `61 OF 1,866 ROWS PICTURED` under a rule. That is a far more honest cell than the old one: it distinguishes "nothing held" from "held, but it is the motor's picture, not the package's." Parts & accessories (`0 OF 3,587`) and Rates & costs (`0 OF 64`, "Figures, not objects. There is nothing here to photograph.") still carry true empties at the same size and weight as the three photographed kinds — Boats (Stacer on green water), Motors (Yamaha F90 cut-out on white), Trailers (Stabicraft on a GFAB trailer against a mountain). No word sits on a photograph anywhere.

The right-hand provenance block is fixed: it is now ranged right into the corner as three tight lines (`MASTER PRICE FILE` / `53 tables · 15,691 rows · 28 of them fitment joins` / the joins-and-packed line), instead of the ragged 560px slab that hung off the corner before. Above the shelf, right: "**860** of the **7,012** rows carry a picture the file actually holds."

The brand band is the real change. The seven makers now carry **their own wordmarks** under the photographs — Stacer in red, `SURTEES` in heavy black italic, the Jeanneau compass, the Haines Signature script, `HIGHFIELD`, `FORMOSA` — and Stabicraft, which has none, is set in plain type at the same size with "No public wordmark verified" as its line. The head states it: `marks-ledger.json` holds 17 files for 12 makers with address and sha256, "Stabicraft's is recorded 'no public wordmark verified', so its column keeps its name at the size the marks are." Six marks, one refusal, shown as six marks and one refusal.

That band is also the board's new weakness, and it is a contrast one. The seven marks are real files at their real proportions, so they arrive at wildly different optical weights: `SURTEES` is a heavy black slab, while the Haines Signature script is a pale grey hairline and the "JEANNEAU" wordmark under the compass is about six pixels tall. Those two are the lowest-contrast objects on any of the four boards — legible at 1440 × 900 on this display, but they are the first thing that would fail a ruler. The old complaint about the band not being optically level is gone: every column now takes one provenance line and the baseline holds across all seven.

Density is still this board's cost. The top third carries three and four lines of 11px grey under each of six tiles plus the eight-figure corner block, and the foot adds two more full-width 11px lines. Nothing is clipped, truncated or overlapping; there is simply more small grey type here than on the other three.

## B — Cinema day *(recommended)*
`b-one-photograph.html` — 38,170 bytes (37.3 KB) · shot 801,161 bytes (782 KB)

The direction changed shape. It is **no longer one photograph**: two now share the fold, butted on a 4px navy gutter — the Highfield Adventure 7 running left-to-right with four aboard (drawn 768 × 512) and a Stacer 519 Sea Ranger SDF shot from above over clear green water with two men fishing (drawn 574 × 380). The whole screen is near-black navy rather than white, which is also new, and it is the change that makes the board work: the pictures are now objects on a dark ground instead of a hero with furniture bolted to it.

Both plates are **fully opaque**. I zoomed the top-right one to check: solid navy, no veil, no gradient, no type composited on the picture. Each names its boat and ties it to a count — "OPEN STACER → / **519 Sea Ranger SDF** / **91 rows**, and two of them are this model — centre and side console." The provenance strip runs under both in tracked caps: held 2560 × 1706 drawn 768 × 512, held 2560 × 1694 drawn 574 × 380, "TWO OF THE EIGHT IN HEROES-LEDGER.JSON, NEITHER ENLARGED."

Below, four columns. **THE DESK** carries "Good morning." at ~44px light, the 7,012/8,679 sentence, and the amber **New quote →** beside a white search field — the only two bright objects on the screen, with the amber correctly the loudest. **WHAT NORTHSIDE MARINE SELLS** sets the six figures 2 × 3 at large size. **THE BOAT MAKERS** is a new warm-white card holding all seven marks 3-up with row counts, Stabicraft again in type with "No mark verified". **OPEN DRAFTS** is now navy like the rest, with a large `0`, the "Nothing is open" sentence, and a wireframe of the card a draft will land in.

Every flaw the last pass named is gone. The drafts panel is no longer the brightest object on the screen; the brand line no longer wraps into two ragged groups; the bottom panels no longer float clear of the window edge — all four columns now foot within ~25–60px of the bottom on a consistent line.

Two new things, both honest and both small. The white maker card is the one light object in the lower half and it competes with the amber button for the eye; inside it, "Haines Signature" is the only name that wraps to two lines, so its "9 rows" drops a line below its neighbours and the 3-up grid ends with Formosa alone. And the wireframe's `OPEN THIS DRAFT →` is drawn at full button width inside a zero state — it is captioned "DRAWN EMPTY, EVERY REGION NAMED", so it is a diagram and says so, but it is the most button-shaped object in that column and there is no draft to open. The muted-blue body type on navy (column one's "No one has typed a name at this desk yet") and the tracked-caps provenance strip are the thinnest contrast margin on the board.

**Note against `canvas.json`:** B's `axis` still says "One photograph takes the whole fold" and "square opaque mattes pushed into the four corners". The board now holds two photographs and two plates. The opacity claim is true; the count is not.

## C — Rails of counts
`c-rails-of-counts.html` — 44,867 bytes (43.8 KB) · shot 587,132 bytes (573 KB)

The biggest change of the four, and the one that breaks its own written premise. **The three rails of pure type are gone.** C is now a *measure* board, and it carries a large photograph and two wordmarks.

What replaced the rails is the strongest single device on any of the four. The six kinds are drawn as **one full-width bar in six segments, each segment's width its true share of the 7,012 base rows and its tone following the same count**: Boats 810 light and marked active by a black tick above, a narrow unlabelled Motors segment, Trailers 444, Packages 1,866, Parts and rigging 3,587 widest and darkest, and a bare sliver at the far right for Labour. Where a segment is too narrow to hold a word, the label goes on paper below with a leader — "Motors 241 · 2 registers · Sell Price, Trade Price" left, "Labour, oils, registration 64 · 3 registers · no price level declared" right. The rule is printed under it: "A segment too narrow to hold a word keeps its width and puts its label on paper instead; **none is widened to make room**." This is the only place in the set where the file's real shape is a shape rather than a list of numbers, and where a kind cannot carry a price the segment itself says so.

The same rule runs again for makers: Highfield takes roughly 72% of the bar with its wordmark and "588 rows · 7 series · 67 models · 5,765 paired rows across 5 joins", Stacer gets a narrow cell with its mark and `91`, and the remaining five are blank segments named on paper — "The tail — Formosa 39 · Stabicraft 37 · Jeanneau 27 · Surtees 19 · Haines Signature 9", right-noted "five makers · 131 rows · 16.2% of the 810". True and well stated, but those five empty blue boxes are the one inert area on the board.

Lower left: a Highfield Patrol 600 at 840 × 309, fully provenanced (held 2560 × 1707, media.highfieldboats.com, fetched 2026-09-16, one of the eight in `heroes-ledger.json`) and, crucially, justified by count rather than taste — "Highfield is 588 of the 810 boat rows, the largest register in the file." The argument is right; **the frame is not**. It is a dock scene: a `BARBUOY COCKTAILS` bar sign and a run of railings crowd the left third, people stand around with drinks, and the 840 × 309 crop cuts the bow. It is the weakest photograph used on any of the four boards.

The old right-rail density complaint is fixed — that column now breathes, three short paragraphs with air between them, ending on "No total of boats for sale appears anywhere here. The file carries no such figure, so this screen does not print one." The old `DRAWN FROM` annotation block is gone from the artboard. But the same fault reappeared in a new place: the top-right of the board now sets the direction's own pitch as page copy — "Home is the only screen that shows the whole file at once … and turns one of those counts into a quote." That is board annotation inside the artboard, and at a glance it reads as a line of the product.

**Note against `canvas.json`:** C's `axis` and `only` are now false. They say "no photograph and no mark anywhere and not one external request on the board" and "the only board with no external request at all". The board renders one photograph and two marks. The shots run reports zero failed requests, so the pictures load — the description is what is stale, not the board.

## D — The file, open
`d-the-file-open.html` — 40,982 bytes (40.0 KB) · shot 289,431 bytes (283 KB)

Still the calmest and most conventional, still the clearest, and both faults the last pass named are fixed.

The headline is unchanged and still the best sentence on the set: "**Nothing of yours is open yet.** The file is." — 27px, two-tone, the whole screen's job in seven words, over a line counting 53 tables and 15,691 rows from `data/northside/manifest.json`.

**The five grey "not held" plates are gone.** Every one of the seven makers now carries a real photograph at 105 × 58 beside its mark, its name, a mono identity line (`boat_stacer:27 · Stacer — 519 Assault Pro`), a grey fact line (60 of 91 rows pictured · 3 joins · 939 paired rows), and its row count set large and right-aligned with "rows" stacked beneath. A Dense / Default / Comfortable control sits at the panel head with Default selected. Stabicraft's mark cell is an **em dash** and its fact line ends "· no mark held" — the refusal stated twice, in the cell and in the sentence, which is the clearest handling of a missing mark anywhere in the set.

**The left/right imbalance is fixed.** The left door now runs to y≈810 against a right panel ending at y≈805; the ~85px of bare white is gone, filled by WHERE YOUR WORK IS KEPT (IndexedDB behind `src/data/repository.ts`, "Nothing has been sent anywhere and there is no server yet") and the five-row leadered list of what a card will carry, ending "The total at the cash rung — never a cost, never a margin" and "When it was last touched — a date, not '2 days ago' alone". Under it: "Nothing on this half is a placeholder: no ghost row, no sample customer, no demo quote. The three tabs read zero because zero is the number."

Three small things. The Stabicraft thumbnail is a boat on a trailer under a Yamaha dealership awning — the only forecourt shot among six on-water frames, and it reads as a snapshot beside them. The Jeanneau and Haines Signature marks are, as on board A, the faintest objects in the panel. And the em dash in Stabicraft's mark cell, read for half a second before the fact line, looks like a missing value rather than a stated refusal — the line rescues it, but the cell alone does not.

The foot remains the most complete statement of what the screen does not know on any of the four: 453 addresses, 329 held, 118 never fetched, 6 refused, "four of the refusals are the file's own logo addresses behind a SharePoint sign-in, so every mark above came from the maker's own site", 12 makers across 17 files, seven of the 25 base tables declaring no price level, and at the right — "Home has no total to show, so it shows none. Every figure here is a count read from the file, and no text on this screen sits on a photograph."

---

## Two things to settle before the pick is acted on

1. **`canvas.json` is stale for B and C.** Both boards were redrawn past their written axis: B holds two photographs where its axis says one; C holds a photograph and two marks where its axis and its `only` both claim none and claim it as the board's distinguishing virtue. The canvas publishes those sentences above each frame, so the owner reads a claim the picture contradicts.
2. **D has an empty `references` array**, so the canvas prints a bare "**Drawn from:**" with nothing after it. The other three name eight, five and eight references.
