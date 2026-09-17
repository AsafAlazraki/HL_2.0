# Home — the four boards, judged

Independent critique, 2026-09-17. Written by opening the four PNGs in `docs/directions/home/shots/`
and the four in `docs/directions/entry/shots/`, then measuring every figure the boards print against
`data/northside/manifest.json`, `images.json`, `heroes-ledger.json`, `marks-ledger.json` and the
53 tables under `data/northside/tables/`. The pictures were judged, not the prose.

**Ranking, best first: B · A · D · C. Recommended: B — Cinema day.**

B is the only one of the four that looks like a boat business instead of a spreadsheet with a
greeting on it: one real Highfield on open water, six figures big enough to read across the desk,
and one amber button that is unmistakably the thing you press. It is also the only board with any
colour on it at all, which is what "blue and white, and a bit more colour usage" asks for — but it
must stop borrowing entry B's composition, and the Northside mark at 12.5px in a nav bar is the
opposite of "the logo is the showpiece thing".

**C is dull.** It is a database with a serif-free headline. No picture, no mark, no colour, fifteen
buttons at one weight, and its own research notes printed inside the artboard. It is the screen the
owner has already rejected five times, drawn a sixth time.

---

## What was checked and passed, on all four

Worth saying plainly, because these are the usual failures and none of them fired:

- **Contrast.** Every sustained small-type passage measures 5.2–6.8:1 on its real ground. C's muted
  blue-grey right rail is `rgb(91,102,117)` on white — 5.83:1. B's 11px provenance is
  `rgb(143,169,184)` on `rgb(6,32,51)` — 6.76:1. D's tinted panel body is 5.21:1. Nothing under 4.5.
- **Type size.** Nothing under 11px on any board.
- **Photograph scale.** Nothing enlarged. B draws the ADV7 (held 2560 × 1706) at 1440 × 960;
  A's shelf tiles are 184 × 123 off 1024–1100px sources; D's thumbnails are 132 × 72 off 2560.
- **Drafts.** All four print zero and all four say why. No invented draft, no ghost row, no demo quote.
- **Counts.** 53 tables · 15,691 rows · 28 joins · 8,679 join rows · 810/241/444/1,866/3,587/64 ·
  91/37/19/27/9/588/39 — all true of the manifest, on every board that prints them.
- **Provenance.** All seven photographs on A's brand shelf are bound to a real row and captioned with
  that row's model: `boat_jeanneau:4` is the TH38, `boat_stacer:54` is the 449 CrossFire SC,
  `boat_stabicraft` is the 2050 Frontier FT, `boat_haines` is the Signature Fisher 640F. No stand-ins.
- **Clipping and overlap.** None found on any of the four.

---

## Gaps

### Blockers

**A · "0 OF 1,866 ROWS PICTURED" is a measured-looking figure that is not measured.**
Sixty-one package rows carry a held picture — 39 in `mot_pkg_haines`, 22 in `mot_pkg_jeanneau`,
every one of them resolving to a file in `public/seed-images/`. The true ratio is 61 of 1,866. The
tile contradicts itself: one line under the zero, its own caption says "the other two tables carry
the motor's cut-out". A ratio that names its numerator and denominator and gets the numerator wrong
is worse than no ratio, because it looks audited.

**A · "its 588 catalogue pictures are renders" invents a picture count out of a row count.**
588 is `boat_highfield`'s `rowCount`. The file carries 212 Highfield addresses, 115 held, 0 scenes.
The sentence is true in spirit and false in its only figure.

**All four · every board refuses to draw a manufacturer's mark for a reason the repo contradicts.**
A: "`public/brand-marks/` does not exist in this build". B: "No maker's mark has been fetched, so
none is drawn." C: "there is no marks directory in this build". D: "because `public/brand-marks/`
holds none." It exists. Seventeen files for eleven makers — Stacer, Stabicraft, Surtees, Jeanneau,
Haines Signature, Highfield, Formosa, Yamaha, ePropulsion, Mercury, GFAB, Dunbier, Mackay — each
with address, page, licence note, pixel size and sha256 in `data/northside/marks-ledger.json`,
committed at 10:49, before C and D were last saved at 10:55 and before every shot at 10:59. A
refusal is meant to be a sentence with its reason; here the reason is untrue on all four boards at
once, and it is the reason the owner's showpiece is missing from every one of them.

**B · three of its five cited references are not on the board.**
`gallery/rapha-home.png` is two photographs as one fold with a heavy-caps headline on the calmer
half; B has one photograph and a 38px light headline. `ref/boats/stabicraft-2.png` is two named
doors over one hull; B has four corner mattes and no doors. `gallery/hagerty-marketplace.png` is the
split card — a 625px photograph, a column of three thumbnails, a fact stack, one full-width black
button; B's drafts panel is an empty white box with a `0` in the corner. Only Sotheby's (the opaque
panel with its own ground) and MarineMax (the fold given to one photograph) are actually drawn.

**A · cites `gallery/grafana-play-home.png`, which is on the avoid list, and Framework for a device it did not draw.**
`notes.md` §4 files Grafana Play under "a wall of panels as a welcome — the rejected home dashboard,
shipping." Citing it as a source is either a slip or an argument nobody made. Framework marketplace
is cited for rows that carry a count with a bar marking the active one; A has counts and an
underline, no bars. C is the board that drew the bars.

### Majors

**All four · no board says how it reflows.**
Strip the embedded images and the strings `390`, `834` and `1920` appear nowhere in
`a-shelf-of-kinds.html`, `b-one-photograph.html`, `c-rails-of-counts.html`, `d-the-file-open.html`
or `canvas.html`. Responsive at every size is a hard requirement and four boards are silent on it.
A is six fixed horizontal bands and a six-across shelf; B is four corner mattes on a 3:2 hero; C is
three rails, the densest of which already runs to y≈851 of 900; D is two doors at 508px and 810px.
Every one of them has a real answer to give and none gives it.

**B · converged with entry B.**
Full-bleed held on-water photograph, opaque dark-navy panel laid on it carrying the heading and the
two acts, letterspaced caps wordmark top-left, provenance in small type at the bottom of the picture.
That is entry B's composition with the card squared off and pushed into the corners. The second
screen the dealer ever sees should not be the first one rearranged.

**C · converged with D.**
Same white ground, same left index of six kinds with right-aligned counts and a table count beneath,
same seven makers in a column with row counts right-aligned, same panel saying no draft exists and
why. C swaps D's two photographs for nothing and adds fourteen buttons. They are one direction, not two.

**D · cites no reference at all.**
`canvas.json`'s `references` array for D is `[]`, and the board prints none. `notes.md` §6 named
three that are D's alone — `live2/github-repos-register.png`, `live2/empty-github-search.png` (the
same register full and empty, which only D needs) and `live2/empty-excalidraw.png` (the local-first
first run). D is the board those frames were found for and it claims none of them.

**A · the replaceable answer does not survive a second dealership.**
A's only customisation answer is a CSS comment naming a 24px mark slot. The composition is seven
photographs on the shelf plus three picture wells above it. A dealership with no photographs gets
ten empty wells and a screen that is nothing but its own apology. C's answer survives trivially
(no external request at all) and B's is the strongest — the six blocks are opaque, `--hero` falls
back to `--panel-deep`, no text is ever composited on a picture, so nothing moves and no contrast
changes. A needs that answer and does not have it.

**C · the primary act is not obvious.**
One navy New quote in the top-right corner, against seven "Open register" links and seven "Quote ›"
buttons stacked down the middle rail at one weight. Fifteen controls, one of them primary, and the
fourteen are the loudest thing on the screen because they repeat. "I can't stress enough how easy
this system has to be to use" is not served by a column of identical buttons.

**C · reads as a database, not a showroom.**
Not one photograph, not one mark, no colour beyond navy and one link blue on white. The file holds
329 held pictures, 122 of them scenes, and this board draws none of them. It is the shape the owner
has already called a database.

**C · the board's own annotation is printed inside the artboard.**
The right rail ends with a `DRAWN FROM` block naming `live/framework-marketplace.png` and
`gallery/figma-community.png`, and a line reading "System grotesk here. Wanted: Söhne or Inter
Display". That is a note to the designer rendered as screen content, at the same size and colour as
the sentences about the real file beside it. The screen the owner would be picking is not the screen
that gets built.

**All four · the logo is never the showpiece.**
The dealership's name is set as letterspaced caps at 12.5px (B) or 13px (A, C, D), in a 56px nav bar
on three of them. "I want the logo to be the showpiece thing" is a standing instruction and not one
of the four boards treats the mark as anything but a label. Pinned to B because B has 1440 × 900 of
photograph to place it on and still puts it at 12.5px.

**D · five "not held" plates understate the file.**
D reads only `heroes-ledger.json` — eight pictures — and so draws Stabicraft, Surtees, Jeanneau,
Haines Signature and Formosa as blank grey plates. Board A draws all seven makers with real,
row-bound photographs out of `public/seed-images/`. Both boards are reading the same file; D has
chosen the tier that makes the dealership look emptier than it is. The caption scopes the claim
("the only boats among the eight in `heroes-ledger.json`"), but the picture is five grey holes in a
row and the picture is what the owner sees.

**A · the argument is carried in 11px grey.**
Sixteen separate `font-size:11px` declarations against a single 26px headline — three and four lines
of 11px provenance under each kind tile, more under each brand, more across the foot. It is all
true and it is all small, and the cumulative effect is the reference manual the owner called too
complicated. B carries the same honesty in six figures and four sentences.

### Minors

**A · the brand shelf is not optically level.** Highfield's provenance wraps to two lines where the
other six take one, so that column alone drops below the shared baseline of the best object on any
of the four boards.

**A · the drafts strip is prose where its own reference says it should be an object.**
A cites `live2/empty-arena.png`, where the strip keeps its frame and its filters and a bordered
`ⓘ Nothing yet` chip sits in the first row's place. A draws three lines of grey paragraph in an
empty band instead, with the tabs marooned in a narrow column at the left.

**B · the emptiest thing on the screen is the brightest.** The bottom-right "Open drafts / 0" panel
is warm white where the other three mattes are navy, so the eye is pulled off the hull by the one
panel with nothing in it. Read as accident, not emphasis.

**B · the brand line rags into two groups.** "Stacer 91 · Stabicraft 37 · Surtees 19 · Jeanneau 27"
breaks and "Haines Signature 9 · Highfield Inflatables 588 · Formosa 39" starts the next line, so
seven makers read as two sets. Both bottom mattes also float ~40px clear of the window edge, leaving
a strip of water under them that no other edge of the composition has.

**C · cites `gallery/carsandbids-scrolled.png`, another avoid-list frame,** as a source. C obeys the
lesson (no bottom bar) but a frame you drew from is not the same as a frame you avoided.

**D · the left door runs out before the right one does.** Content stops at about y≈690 and roughly
85px of bare white follows before an 11px footnote, against a right panel that reaches its own
bottom edge. The imbalance reads as unfinished rather than as calm.

**D · the Stacer thumbnail is cropped past legibility.** At 132 × 72 both bow and stern are cut and
the boat stops being readable as a boat — from a source held at 2560 × 1694, so the crop is a choice.

---

## What each board should keep

- **B:** the composition. One held photograph, the hull left alone in the middle third, every panel
  fully opaque so nothing is ever composited on water. It is the answer to the Riviera failure in
  the notes and it is the only board with a warm accent.
- **A:** the brand shelf, unchanged. Seven real photographs at one optical weight on one rule, each
  bound to its row. It is the best single object in the set and it belongs on whichever board wins.
  Keep the NO PICTURE well too — absence at the same size as presence — once its ratios are true.
- **D:** the sentence. "Nothing of yours is open yet. The file is." does the whole screen's job in
  seven words and no other board comes close to it.
- **C:** the bars drawn to each kind's true share of the 7,012 base rows. That is the one thing C
  shows that nothing else does, and it is a strip, not a screen.
