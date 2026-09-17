# Entry — the four boards, as they actually render

**Second pass, re-shot 2026-09-17 after the revisions.** Playwright/Chromium at exactly
**1440 × 900, deviceScaleFactor 1**, served over HTTP by `npx tsx tools/research/shots.ts entry`
(`docs/directions/entry/` at `/`, `public/` under it) so that `/hero-images/…` resolves — a
`file://` open would have turned every photograph into alt text. All four boards reported a
1440 × 900 scroll box: **nothing overflows the window, and there was not one console error, page
error, failed request or 4xx on any board** — `4 boards, 0 with problems`.

PNGs are in `shots/`, all four overwritten in this pass. The canvas is `canvas.html`, assembled by
`npx tsx tools/research/board.ts entry` from `canvas.json`, which printed **2.20 MB (4
directions)** — 2,301,935 bytes, gitignored because it carries the two photographs inlined as data
URIs. `canvas.json` now carries `"recommended": true` on **b**, which the assembler renders as a
blue `b` chip and a `RECOMMENDED` pill on that section.

| Board | Source HTML (was) | Screenshot (was) | Photograph loaded |
| --- | --- | --- | --- |
| a — Water and column | 11,689 B (9,293) | `shots/a-water-and-column.png`, 1,176,075 B (1,391,321) | `highfield-sp560-84445423.webp`, natural 2560 × 1708 |
| b — Veil and card | 14,679 B (7,755) | `shots/b-veil-and-card.png`, 1,028,982 B (1,108,224) | `stacer-481-seamaster-02849fa7.webp`, natural 1771 × 1183 |
| c — Two doors mirrored | 27,235 B (16,626) | `shots/c-two-doors-mirrored.png`, 93,791 B (78,384) | none by design |
| d — The sheet already open | 17,057 B (16,030) | `shots/d-the-sheet-already-open.png`, 257,011 B (289,020) | `highfield-sp560-84445423.webp`, natural 2560 × 1708 |
| — | `canvas.json` 4,470 B (4,443) | `canvas.html` **2,301,935 B (2.20 MB)** — was 2,279,290 | both, inlined |

---

## a — Water and column

**What changed.** The mark is no longer a caption on the photograph. A flat navy band, 1440 × 100,
now runs across the top of the window with **NORTHSIDE MARINE at 42 px in white**, and the split
below it is 880 / 560 of the remaining 800 px. The whole column has gone from warm greige to white,
and one hue — `#22456D`, which the board says it measured off the dealership's own site — now does
every chromatic job on the page: the band, the field panel, the honesty rule, the filled door, the
outlined door's border and the caret. The field has been promoted from the quietest object to the
brightest: a white well with a navy 1.5 px edge, set inside a tinted `#EAF1F8` panel with its label
and the supplied "at Northside Marine" behind a divider, and it is now the only pure-white rectangle
in the column. Both doors are 448 × 58 in the same hue — the primary is filled, the secondary
outlined, nothing else differs — so the two-hue slip is gone. The foot is pinned to the column's
floor with `margin-top:auto` over a hairline, and the 180 px of dead greige under the last door
sentence has closed up. With the wordmark gone from the picture, the photograph now carries only one
veil, 196 px at the bottom, sized to the two provenance lines; the sky and the shore are clean.

**As it reads now.** The eye lands on the navy band, drops to the boat, then crosses to "Who is at
the desk?" — which is still the only large type in the column at 37 px — and then straight to the
white field, which finally competes. The rhythm down the column is question, subline, ask panel,
honesty rule, `TWO WAYS IN`, two doors each with its own sentence, foot. Nothing is clipped, nothing
overlaps, no line truncates.

**Honest weakness.** The band is a single word in 1440 px: from the end of "MARINE" at x≈483 to the
right edge there are roughly 950 px of flat navy carrying nothing, and the band's only job is to be
large. And the board is now two rectangles of solid colour (the band and the primary door) plus a
photograph — the blue is present, but it is present as fill, not as a system.

## b — Veil and card

**What changed, and this is the largest revision of the four.** The six-item ask stack has been
broken up rather than re-ordered. The card is now 560 px wide and holds **three things only** — the
instruction, the field, the honesty sentence — and the headline has changed from "Who is at the
desk?" to **"Put a name to this desk."** at 30 px in a 300 weight; the italic underline and the
in-card label are gone. **The two doors have left the card**: they now lie low across the water as
one 1240 px band at y = 664, a blue `#1A65BD` filled door on the left carrying `53 tables · 15,691
rows · 28 of the tables are fitment joins`, an outlined door on the right, both with a right-hand
arrow. **The field is now the brightest object in the window** — a white well, 66 px tall, on a dark
card on a dark photograph; it is the only white rectangle on the board, which is exactly the inverse
of the first pass. The pennant has grown into a real object: 196 × 154 of navy hung off the top
edge with a notched foot, `NORTHSIDE / MARINE` stacked in tracked caps inside it, and the hairline
rule running out of its right edge across 1240 px. Under it sits a new two-line note saying the
business name is set in type because Northside Marine's own mark is not in this repo with
provenance. The right two thirds are no longer empty: a new **goods block** at x = 942 behind a 3 px
blue rule reads `boat_stacer · 91 rows` in mono over "Stacer – 481 SeaMaster" at 22 px, says the
boat in the photograph is one of those rows, and folds the photograph's provenance into the same
object. The 12 px provenance has left the sunlit spray for the top right, where the ground is a
smooth dusk sky.

**As it reads now.** Mark → the goods → the ask → the two doors → the empty state, in that order, and
the order is legible without being told. The photograph is drawn 1600 × 1069 from a held 1771 × 1183
— still a downscale, never enlarged. Nothing is clipped, nothing overlaps.

**Honest weakness.** The card and the goods block are two dark objects of quite different
construction — one a bordered glass panel, one bare type behind a rule — sitting at the same height
on the same photograph, and the goods block has no floor under it, so the composition's left half is
heavier than its right. The bottom-right quadrant is still just spray.

## c — Two doors mirrored

**What changed.** Two things, and both are structural. First, the identity: a **navy masthead, 1440
× 300**, now carries "HelmLogic" at **56 px** — the largest type on the page — over "Northside
Marine" at 32 px, which is *larger* than either door headline at 28 px, inverting the first draft's
argument. The name field, the honesty sentence and the provenance stack have all moved up into that
band, and the field is now one white well with a single 2 px ring and one drawn caret: the
"rectangle with a second line floating inside it" reading is gone, and it is the brightest object on
the masthead. Second, and this is the answer to "a dead-looking screen": the left panel's seven-row
table has been replaced by **the file drawn to scale** — a squarified treemap of 53 rectangles, one
per table, each rectangle's *area* its row count, the five largest named on the rectangles
themselves (Parts & Accessories 2,937 · Highfield × Yamaha Motor Fitment 2,519 · Dealer Fit Packages
1,777 · Highfield × P/D Parts 1,707 · Highfield × Dealer Fit 1,342). Colour arrives with the
structure rather than as decoration: navy for the 25 base tables, blue for the 28 fitment joins,
with a legend reading `25 base tables · 7,012 rows` and `28 fitment joins · 8,679 rows`. The right
panel is the same frame at the same scale holding "Nothing to draw. No tables, no rows, no joins."
over two zeroed swatches — the comparison is no longer a caption under the picture, it *is* the
picture. Both buttons are still 360 × 52 on the same baseline at y = 780, primary said by fill
alone. The PCPartPicker credit has been removed from the board's comment.

**As it reads now.** Navy band and the wordmark first, then straight to the treemap, then across the
spine to the empty frame answering it. There is still no photograph anywhere, so the board's one
exclusive claim — that it survives a dealership with no photography, unchanged rather than degraded
— is intact.

**Honest weakness.** The treemap's smaller rectangles are unlabelled by necessity: past the five
named, 48 rectangles are areas with no names, and the smallest are a few pixels across. A reader can
see that the file is mostly a handful of large tables and a long tail, which is true and useful, but
cannot read the tail. And the board is still, by construction, the greyest of the four below the
masthead: white paper, two panels, four greys.

## d — The sheet already open

**What changed.** The blocker is fixed. The photograph is now a **plate**, 422 × 118 with the whole
hull inside it, at y = 495 in a band that runs 284 → 642, leaving 29 px of navy under it before the
register resumes at y = 654. Nothing is severed on the band's own edge. The palette has moved off
charcoal and amber onto **marine blue and white** — band `#0A2D4E`, paper `#F6F9FB` — with gold kept
for exactly two jobs, the mark and the honesty well's rule. The identity is no longer a 12.5 px
eyebrow: **"HelmLogic" now appears at all**, at 17 px in gold, over **"Northside Marine" at 40 px**,
which is the largest type on the board — so the question ("Say who is at the desk, then pick a
door.") has become a 16.5 px subline under the name rather than the headline. The provenance under
the honesty well now ties the picture to the register behind it: "Highfield Sport 560 on the water —
its table, Highfield Inflatables, is the 588 above." The keyboard order is still drawn on the page
as a sentence in mono, which no other board does.

**As it reads now.** The register genuinely breaks around the band — three columns of leadered rows
above it to y ≈ 272, sectioned by `25 BASE TABLES` and `28 FITMENT JOINS` rules, resuming below it,
with the two gutter rules disappearing under the band at one x and reappearing at the same x, which
is what says the band is on top. The foot states that the 53 names and 53 counts were read from the
manifest and add to 15,691. The doors are 421 × 54 in the middle column, a paper-filled primary
carrying an `Enter` hint over an outlined secondary. Nothing overlaps, no register row is obscured.

**Honest weakness, unchanged.** Density. 53 leadered rows at 11.5 px on both sides of the band is
still the densest surface of the four, and the first thing the eye scans on D is a table of
contents.

---

## One thing the assembler now prints that the boards have outgrown

`canvas.json`'s `axis` and `only` prose was written for the first pass and is printed above each
frame on the canvas. Three of the four are now stale against the picture underneath them: **a** is
described as "one 560 px warm-white column" with no mention of the 100 px navy band that is now the
first thing on the board; **b** is described as carrying "the two doors as full-width rows" inside
the card, which they have left, and as having an "italic underline", which is gone; **c** is
described as putting the file's counts on screen "as a real table", which is now a treemap, and its
buttons are given at y=782 where they render at y=780. **d**'s four named references are also still
the first pass's, three of which other boards claim, while the board itself now argues from
`gallery/savee-login.png` and `ref/entry/saxdor-login.png`. Left alone in this pass, because the
instruction was to set the recommendation, not to rewrite the copy.
