# Entry — the four boards, judged as pictures

Independent critique, 2026-09-17. Every screenshot in `shots/` was opened and looked at; every
figure on every board was checked against `data/northside/manifest.json`,
`data/northside/heroes-ledger.json` and `data/northside/images.json`; every contrast pair on a
photographic ground was measured off the PNG itself, not read off the CSS comment.

## What passed, so it is not re-litigated below

- **No fake data anywhere.** Every figure on all four boards traces to the file. 53 / 15,691 / 28
  are `counts`. C's six largest tables (2,937 · 2,519 · 1,777 · 1,707 · 1,342 · 650) are the six
  largest of the 53, and "and 47 more tables · 4,759" is arithmetically exact. D's 53 names and 53
  counts match the manifest row for row, base and join, and add to 15,691. `1qz08ne` is
  `sourceFingerprint`; "packed 16 September 2026" is `packedAt`; A's "one of eight photographs in
  the image ledger" is 8 entries in `heroes-ledger.json`; C's "329 catalogue pictures held" is 329
  of 453 in `images.json`.
- **No password field on any board.** The honesty line is present on all four at body size, in
  prose, exactly where a password field would have been, and none of them buries it in a tooltip.
- **No photograph upscaled.** A: 2560 × 1708 covered into 880 × 900 → drawn 1349 × 900, a 0.53×
  downscale. B: 1771 × 1183 drawn at 1600 × 1069, 0.90×. D: 2560 × 1708 drawn 422 wide, 0.165×. No
  stand-ins: A and D are the Highfield SP560, B is the Stacer 481 SeaMaster, all three with
  provenance on the page.
- **Nothing under 11px.** Smallest type: A 11.5px, B 12px, C 11px, D 11px.
- **No text under 4.5:1 on its real ground.** Measured on the pixels, with the background estimated
  by an 11 × 11 median under each text block: A's provenance on the water 10.2:1, A's wordmark
  5.4:1, A's palest paper grey (#616B76 on #FAF8F5) 4.97:1; B's bottom-right provenance 8.95:1 even
  over the spray, B's top-right stamp 6.8:1; C's palest (#5A6873 on white) 5.73:1; D's palest on the
  band (#8496A2 on #10181D) 5.79:1 and on paper (#55666F on #F2F4F5) 5.41:1. `rendered.md` called
  B's provenance "the least legible text on any of the four boards" — it is the busiest ground, but
  it is not a contrast failure.
- **Nothing lifted from the old repo.** Four independent inline token sets, no shared stylesheet, no
  `--t-*` ramp, no accent keys, no "Quiet Precision" language.
- **Every claimed reference frame exists on disk**, including the four stock frames under
  `hl-refs\ref\entry\`. One exception, below.
- **No two boards have converged on the same composition** — split, veil, mirrored columns, register
  under a band are four genuinely different pictures.

---

## Gaps

### Blocker

**d — the hero is clipped flat by the band's own bottom edge.** `.pic` is `top:494; height:140`;
the band is `top:282; height:352`. Both end at y = 634. The Highfield SP560's bow is severed on a
hard horizontal line and the register's next row resumes immediately underneath with no margin,
while every other element in the band has clearance. It reads as a crop that ran out of room rather
than a decision, and it is the single most visible craft failure across the four boards.

### Major

**d — only one reference no other board can claim.** `canvas.json` gives D four: Excalidraw (also
A's), tldraw (D's alone), folk (also C's), Clay (also C's). The rule is two. The sweep itself
offered D exactly those four names in §5, three of them already spoken for, and nobody went back for
more. A carries four exclusives, B five, C five.

**c — a dead-looking screen.** No photograph, no image, no object: 1440 × 900 of white and four
greys, with roughly 600 × 290 px of empty paper sitting between the honesty line and the right-hand
provenance stack. This is the picture the owner has already rejected five times. "It still feels
like a database, it is not beautiful enough, it does not feel alive" describes this board exactly,
and no amount of correctness in the two panels below changes what the eye lands on.

**a — the board's answer to "what only this screen does" is a layout fact, not a job.** Its stated
axis: "the only board where the picture and the question never overlap." That is a description of a
composition. C answers the question properly (it survives a second dealership that has no
photography at all — unchanged, not degraded) and D answers it best (it is the one moment in the
app where the file is *offered* rather than used, and it prints the offer). A and B do not answer
it.

**b — B is A's column re-lit.** Identical content skeleton in identical order: headline → subline →
label → field → honesty block → two doors, each explained → empty-state foot. D runs the same stack
inside its band. Three boards of four are the same six-item ask wearing different clothes; only C
breaks the pattern. The grounds differ, the pictures differ; the thing the user actually reads does
not.

**a — blue and white is absent from the half that was designed.** The column is `#FAF8F5` greige
with `#14181B` ink; the only chromatic object on 560 px is one `#0B3A4A` fill, which is a dark
teal-navy, not blue. Against "blue and white was the brief" and "a bit more colour usage please", the
designed half of A is a monochrome form and the colour on screen is all borrowed from the
photograph.

**a — the mark is an icon in a corner.** 15px tracked caps at the top-left of the photograph over a
44px rule. The sweep gave three answers to "I want the logo to be the showpiece thing" — Riviera's
pennant, Apple's rung mark, Contra's mark photographed in glass — and A took none of them; it took
the move the sweep filed under what to avoid.

**c — the identity is the third-smallest thing on the page, by design.** "HelmLogic" at 17px in a
64px strip; "Northside Marine" at 28px, deliberately set *smaller* than either door headline at
30px, and the board's own comment says so. That is a defensible argument against Herman Miller's
100px head, and it is the wrong argument to win on a screen whose owner asked for the logo to be the
showpiece.

**d — the identity is a 12.5px eyebrow, and there is no blue.** "NORTHSIDE MARINE" tracked caps
inside the band is the smallest mark on any of the four boards; "HelmLogic" does not appear at all.
The palette is charcoal `#10181D`, paper `#F2F4F5` and amber `#E0A33C`. It is a handsome palette. It
is not the brief.

### Minor

**a — the lower third of the column is dead.** From the bottom of the last door sentence to the
fold there is roughly 180px of empty greige, while the top of the column is tight. In a 560px column
that had room, the two doors should have been given the air instead of the foot.

**a — the thing you are asked to do is the quietest object on screen.** The field is `#FFFFFF` on
`#FAF8F5` — three values apart — with a 1px `#CFC7BC` border, beside a photograph holding 61% of the
window. Only the focus ring finds it.

**a — the two doors are drawn in two different hues.** The primary is filled `#0B3A4A`; the
secondary is outlined `#14181B` near-black. The board's own argument is that the primary is said by
fill alone — then it changes the colour too.

**b — the field is the weakest-contrast control on the board.** `rgba(255,255,255,0.08)` on a
`rgba(7,19,31,0.64)` glass card, found only by its 2px `#9FD2FF` ring. The `#1A65BD` door reads as
the thing to click long before the field reads as the thing to type in, on a screen whose whole job
is to collect one name.

**b — two thirds of the window carry nothing.** The card is 520 of 1440 px. From x = 620 to the
right edge there is photograph and two lines of provenance. B has the most beautiful ground of the
four and makes the least use of it.

**b — the 12px provenance sits in out-of-focus spray.** It measures 8.95:1, so it is not a failure,
but the bokeh directly behind the glyphs is the busiest text ground on any of the four boards and it
is the first place a reader's eye will slip.

**c — the field reads as broken rather than focused.** A 2px `#14608F` ring at offset 4 drawn around
a 1.5px near-black bottom border produces a rectangle with a second line floating inside it, and no
caret. The one control the user must touch first is the one control that looks wrong.

**c — PCPartPicker is credited and is not in the sweep.** The board's comment credits "PCPartPicker's
habit" for its provenance margin. PCPartPicker appears only in
`docs/reference/configurator-teardowns-2026.md`, carried read-only from the old repo as evidence,
and has no frame among the 101 captured for entry. Every reference on a board should be a frame
somebody opened for this screen.

**d — 53 leadered rows at 11.5px is the densest surface of the four.** It clears 11px and it clears
4.5:1, and the register is genuinely the board's whole idea — but the first thing the eye scans on
D is a table of contents, and "the tables — still too complicated and hard to use visually" is a
sentence the owner has already written twice.

---

## Ranking, best first

1. **b — Veil and card**
2. **d — The sheet already open**
3. **a — Water and column**
4. **c — Two doors mirrored**

## Recommendation: **b — Veil and card**

B is the only one of the four that is alive on sight: real dusk water, a mark treated as an object
instead of a caption in a corner, one real blue doing the work, and the file's own counts printed
*inside* the door rather than captioned under it — it is the only board that answers "blue and
white was the brief" and "a bit more colour usage" in the same picture. Its faults are all
additive — the field has to stop hiding, the empty right two thirds wants D's register set faintly
into the veil so the goods are visible before you load them, and the pennant wants to become the
showpiece it is currently only gesturing at — whereas C is the database the owner has already
rejected five times, and A is Porsche's frame with the colour drained out of the half that was
actually designed.
