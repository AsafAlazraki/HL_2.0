# Milestone 1 — completeness critique of the five sweeps

Written 2026-09-17, read-only over `picker`, `configurator`, `cascade`, `document` and `quotes`.
Method: each `notes.md` and `sources-index.md` read whole; a sample of the frames each sweep leans
on opened and looked at; the file claims re-counted against `data/northside/tables/`; two of the
document sweep's pixel measurements re-run; the contract claims read against `src/domain/model/`.
Frames opened for this critique: `picker/porsche-models.png`, `picker/deantonio-builder.png`,
`picker/stabicraft-size-ranges.png`, `home/live/saxdor-models.png`,
`configurator/deep/whaler-engines-chapter.png`, `configurator/deep/porsche-search-open.png`,
`configurator/premium/hermanmiller-aeron-config.png`, `configurator/premium/apple-mac-studio-deep.png`,
`configurator/premium/pcpartpicker-list.png`, `hl-refs/ref/boats/saxdor-deep-09.png`,
`cascade/porsche-cascade.png`, `hl-refs/ref/porsche-modal.png`, `hl-refs/ref/porsche-1440.png`,
`document/live/qwilr-interactive-quote-crop.png`, `quotes/live/linear-filters.png`,
`quotes/live3/things-scrolled.png`.

**The short verdict.** All five are a real advance on the entry round: every one opens with a
correction made by looking, every one has a sources index that names its dead frames, and four of
five cite the old repo's research. The faults below are specific and mostly cheap to fix. The
weakest is **picker**, and the reason is not its quality — its §0 is the best opening of the five —
but that it silently dropped half of its own brief.

---

## 1. Claims that no frame supports

**picker §1 and §5B — "fifteen models".** `home/live/saxdor-models.png` is described as "Six MODEL
LINE headings with fifteen models beneath". Opened and counted: six headings and **eleven** models
(460 GTS/GTC · 400 GTO/GTC/GTS · 340 GTWA · 320 GTO/GTC · 270 GTO · 205 · 200). This matters
because direction B's whole premise rests on that frame — "the only frame here that would survive
289 models without a grid", "only B holds 289 models without a grid". The published proof for a
289-name index is a frame holding eleven names. B may still be the right direction; it needs a
denser reference or an honest sentence that none was found.

**document §3 — the green that is not in the file.** The claim: the `Basic equipment` chip is
"**rgb(89, 163, 83)** — mid green — on the screen summary (`porsche-summary-b`) and
**rgb(183, 183, 186)** — neutral grey — in the PDF … measured." Re-run over the raw pixels: rgb(89,163,83)
occurs **zero times** in `porsche-summary-b.png` at ±3 tolerance. The chip's actual fill is
**rgb(25,126,16)** — 2,889 pixels, the dominant green in the frame. rgb(89,163,83) is exactly
rgb(25,126,16) composited ~72 % over white: an antialiased edge or an eyedropper on a scaled view,
not the chip. The *conclusion* survives and is worth keeping — `porsche-pdf-2` has **zero** greenish
pixels and 179 px of rgb(183,183,186), so print really does drop the meaning — but in a repo whose
first rule is "never invent a figure", a number offered as "measured" has to be the pixel.

**cascade §1 and §5 — the Removed card miscounted twice.** §1: "five rows read `Standard
Equipment`, one `$0.00`". Opened: the Removed card holds **four** `Standard Equipment` rows
(Sports seats, Interior package Diamar Darksilver, Deletion of decorative stitching, Headrests) and
one `$0.00` (Leather package Black). §5 then lists "One sentence for every cause —
`porsche-cascade.png`: five removed rows all reading *'not compatible with your selection'*". No row
carries that sentence. It is **one card-level sentence** covering all five rows, and the rows carry
no reason at all. The point being made — Porsche never says why a particular row went — is right and
is the sweep's best argument for `CascadeRow.because`; the description of the evidence is wrong.

**configurator §5C — a first screen no frame shows.** Direction C: "Its first screen is not a chapter
but the **recommended build, already assembled**, with two doors." `ref/boats/saxdor-deep-09.png` is
chapter **7 / 9** — the progress pill reads `7 / 9` — a pre-answered chapter *inside* the flow, under
a "STEP ON BOARD" hero. §1 ¶4 describes it correctly ("a pre-answered chapter with an explicit door
out"); §5 promotes it to a whole-build first screen that nothing in the sweep evidences. C is a good
idea and is the only direction that lets a dealer finish without choosing; it should say it is an
extrapolation, the way cascade §3 says the causality beam is an invention.

**quotes §5B — a row height read off a marketing mockup.** `live3/things-scrolled.png` is a Things
marketing page: a rendered phone, a Mac window, an iPad and a watch floated on a grey ground. The
content claims hold (Today / This Evening as headings, a grey second line naming the project, one
red `today` tag). "rows run ~23 px" does not — that is the pitch inside a scaled device render, not
a row height. Same class of error as the ones this sweep correctly caught in the stock.

One frame re-checked and found accurate in every particular, worth saying: `porsche-cascade.png`
matches cascade's reading of the sheet's geometry, chips, footer and total; `porsche-modal.png` is
indeed the *Select PDF content* dialog and not the cascade, exactly as cascade's correction 1 says;
`porsche-1440.png` is the discontinued-model refusal picker describes, headline, sentence, black
"→ Choose from the latest models" and Error ID; `hl-refs/ref/porsche-summary.pdf` really is truncated
(no `%%EOF`, 247,525 bytes) while `porsche-configuration.pdf` ends clean; `porsche-pdf-1..6` really
are 952 × 1347 (ratio 1.4149 against A4's 1.4143); and the document sweep's pinned-rail diff
reproduces (right 460 px: a↔b 1.84 %, b↔c 0.00 %, a↔d 28.36 % against its claimed 1.81 / identical /
28.32). The configurator's file census reproduces exactly: `join_hf_yam` is 2,519 rows, the three
GFAB joins are 109 pairings with **zero** starred, `join_stacer_trl` stars 87, `join_surtees_trl`
stars 11, and the seven boat tables total 810 rows.

---

## 2. Directions with fewer than two references no other board could claim

**picker D.** Its two exclusives are `stabicraft-size-ranges.png` and `stabicraft-style-series.png`
— which §2 of the same file calls "the same page shipped on two axes". That is one reference
captured twice, not two. The third it adds, `home/live2/mastercraft-boat-finder.png`, is a frame the
same notes list in §4 under what to avoid ("a dimmed act with nothing saying what would enable it").
D needs a second, unrelated proof that a measurement ladder can be primary navigation.

**document A and D.** A claims `live/saxdor-brochure-pdf.png`; D claims
`live/saxdor-brochure-pdf-late.png`. Per `document/sources-index.md` these are pages 1–8 and 9–18 of
**the same** `SAXDOR_320GTC_BROCHURE.pdf`. Each board therefore holds one genuinely exclusive
reference (`live/pagedjs-home.png` for A, `live/highfield-request-quote.png` for D) and one half of a
shared artefact.

**quotes.** Three of the eight exclusives are one product: `live/linear-filters.png` and
`live4/linear-issue-status.png` for A, `live4/linear-search.png` for D. Linear is claimed by two
boards. And B's `live4/bringatrailer-results.png` is, like picker D's MasterCraft, a frame §4 lists
under what to avoid ("gives every card four chips before a single fact").

Clean on this test: configurator (A hermanmiller + apple-mac-studio, B porsche-search-open +
porsche-911-deep-scroll, C saxdor-deep-09 + whaler-engines-chapter, D pcpartpicker-list +
porsche-summary-a) and cascade (terraform pair, helm-diff + gdocs, wikipedia-diff + vscode-merge,
porsche-summary-b + whaler-engines).

**One cross-sweep note.** `ref/porsche-summary-b.png` is an exclusive for cascade D *and* for
document B; `whaler-engines` is an exclusive for configurator C *and* for cascade D. Cross-screen
reuse is not forbidden, but if the owner picks cascade D and document B the two screens arrive
drawn from the same frame — which is how "one treatment stamped across screens" happens without
anyone deciding it.

---

## 3. Two directions inside one screen that are the same shape — the entry-round fault

**It recurred, in quotes, between A and B.**

- **A "The ledger"** — one full-width column, no rail, no thumbnails; rows under group bands; row =
  glyph · boat (full weight) · customer (grey) · total (right) · reference and age (small grey).
- **B "The day book"** — one centred column, generous air; rows under group bands; row = time · boat
  · customer (small second line) · total; state as one 8 px glyph.

Same composition (a single column of rows under group headers), same fields in the same order, one
figure right-aligned. What differs is the grouping key (state vs day) and the measure width. The
brief's requirement is a different composition **and** a different order; this pair delivers the
second only. That is the exact fault the entry round was caught on.

It is worse than a pair, because **D at rest resolves to A**: "the screen at rest *is* a search field
with the last-touched quotes beneath it; the full register is what Enter on an empty field returns."
The full register is A. So three of four quotes directions are one column of rows, and only C (the
photograph grid) is a different object. Fix: re-draw B as something a day-ordered register can be
that a state-ordered one cannot — a left gutter of dates against a continuous right column, a
calendar spine, a week as a row — or replace it.

**picker A and D** are the weaker instance. A is facets-left, cards-on-stage. D never says where the
length ladder sits or what fills the stage; read plainly it is A with the facet order reversed. D's
*grouping* argument is genuinely its own and is the best idea in the sweep — a 5.37 m Stacer beside a
5.6 m Highfield, which no manufacturer's site can do and the dealer does daily — but the composition
is undrawn, so on a board it will look like A.

**configurator B and C** are both stage-plus-right-rail. They survive, because the navigation models
genuinely differ (one scroll holding every chapter, led by search, versus one chapter in the window
with interstitials between), but it is the thinnest separation in that sweep and the boards will
have to work to show it.

---

## 4. Screens whose own hard questions are not answered

**picker — the Place screen is missing entirely.** The file is titled "Picker and Place". The word
"Place" then appears nowhere else in `picker/notes.md` except inside unrelated phrases. `quote.new.$place`
is a separate route in PLAN's repository layout, and PLAN's "Starting directions per screen" gives
Place its own three axes: A "Highfield's own row", B "Porsche's swatch panel", C "Series chapters".
The sweep produced four directions, all for the model chooser. No references were gathered for the
chosen-model page: the thumbnail strip, the finish grid, the per-variant price, the act.

And it is sharper than an omission. The sweep's own §0 establishes that the colourway is **17
undecoded code tokens** and that `I`, `O`, `R`, `WH` have no decode map, so "**No swatch can be
drawn**". That finding **retires the plan's Place direction B outright** — a swatch grid priced where
finishes differ cannot be built on codes nobody can decode. The sweep is carrying the evidence that
kills one of Place's three planned axes and never spends it.

**configurator — undo, and "who it is for".** The brief is one sentence: "one chapter per decision:
hull/variant → motor → trailer → dealer fit & parts → **who it is for** → finale; a live price;
refusals as sentences with reasons; recommended items starred from the file; **undo on every pick**."
Four of those are answered superbly, with §1 organised as the four hard questions. Two are not asked
at all: the word "undo" appears **zero** times in `configurator/notes.md`, and the customer chapter
has no reference, no named pattern and no place in any direction. Undo is not a detail here — PLAN
sets "Undo over confirm" as a standing rule, every pick is a command with an inverse, and Sonner's
UNDO toast is in the stack. What a reference sweep owes it is: where does the undo live when the
pick happens inside a chapter panel, and what does it look like when the pick fired a cascade. No
frame in 100 was driven for it.

**document — the dealer's terms, and the signature block.** "the dealer's terms" appears twice: once
in the restated job, once inside D's ordering. No reference, no named pattern, no frame. Terms are
the longest prose on a quote and the thing that decides where A4 breaks — and the sweep's own §4
already names "a page 90 % white because the section ended" as the failure a naive break ships.
Signatures are absent too, though PLAN's template section names them as one of four locked sections
inherited from the original HelmLogic. The sweep is otherwise the most rigorous of the five, and it
records its one failed hunt (the included / for-a-fee / not-available matrix) rather than filling it
in — which is exactly right, and makes the silence on terms more conspicuous rather than less.

**cascade and quotes answer their briefs.** Cascade goes further than asked: it read
`src/domain/model/offer.ts`, confirmed `CascadeRow` carries `standard` and `because` and `Cascade`
carries `added`, `removed`, `unchecked` and `accept`, and reported the two holes — no `stays` list,
no named decline — as constraints every board must honour. That is the right relationship between a
sweep and the contract, and the other four should copy it.

---

## 5. Old research leaned on without citing, or cited without checking

**picker cites none of the five.** It is the only sweep that does. Two of the documents answer
questions it re-derived from scratch:

- `configurator-teardowns-2026.md` line 125 already records Dell's from-price framing — the headline
  reading `Starting at $5,599.00` that never moves — which is the negative case for picker §2's "the
  from-price with its meaning attached", re-derived from Framework, Apple and Rivian.
- The same document, line 141, records BMW's own picker-door disclaimer, verbatim. The picker sweep
  drove `bmw-all-models` and reported only the consent card.
- `price-framing-and-bundles.md` settles what a figure must name beside it — the whole point of
  picker's "from $41,340 · cash".

**cascade leans on PCPartPicker without citing the teardown that bought it.** `narrow/pcpartpicker-incompatible.png`
is called "the floor for never blocking", as a fresh finding. PCPartPicker is the principal subject
of `configurator-teardowns-2026.md` (its §"never blocks, always explains, admits its gaps", and the
adoption table row "State what the checker does **not** check — **adopt**"), and that row is *why*
`Cascade.unchecked` exists: the comment at `src/domain/model/offer.ts:246` reads "what stays but
could not be checked — PCPartPicker's disclaimer". Cascade is otherwise the best citer in the set —
it recovered the teardown's lost evidence image as bytes and states that **every claim in the
teardown checks out against it**, which is the standard the others should be held to.

**quotes re-buys the Retool ladder.** §3's density arithmetic stands on
"`live4/retool-row-heights.png`, read directly: X-Small 20 · Small 32 · Medium 48 · Large 60 ·
Dynamic". `dense-tables-and-selection.md` already carries that exact row in its published-numbers
table. Quotes cites that document twice — for Height being dead (and re-drove it to confirm, which is
good practice) and for Superhuman's minimal-animation line and the RAIL 100 ms budget — but not for
the number its whole 18-rows-at-1280×800 case rests on. Re-verifying is not the fault; not crediting
is, because the next sweep will buy it a third time.

**Good practice to keep.** Configurator names `configurator-teardowns-2026.md` for Dell's 237
controls *and says plainly the page was unreachable*, so the claim is carried rather than re-checked
— stated, not hidden. Document names the teardown for the one sentence it needs ("Mercedes' `Copy
Link to Build` + PDF is the dealer leave-behind artefact we do not have") and then goes and proves
the stock's own Porsche PDF is truncated.

---

## 6. A style described, where the doing should be

**cascade B is named for the reference it copies.** "Porsche's right-hand sheet over the blurred
frozen stage" — the composition is wholly the reference's silhouette, and the board's own
contribution (ordered by rule, not by verb; one paragraph per rule closing on the dealer's own last
pick) arrives second, as a modifier. Against the standing rule that no screen is "the same treatment
as X", a direction whose identity is a reference's shape is that fault at one board's scale. The
idea inside it is strong enough to carry the board on its own name.

**document D is described entirely as appearance.** "Full-bleed photographic chapters; a caption
column anchored low against a wide white half; tables small and narrow in a generous page." Every
clause is how it looks; none is what it does for the person holding the quote. The notes concede it —
D "must defend against 'the price beside who it is for'" — which is an argument D has not yet made.
Compare B on the same page, which says what it is for in one clause: "the only one showing a frozen
line beside the rung it was frozen at, and where every `Change` refuses with a sentence."

**picker's "the one to beat" framing** is a style ranking rather than a job statement, though the
section rescues itself by ending each entry in "ours is…". Worth watching rather than fixing.

**The counter-examples, which are the best writing in the five, and which the boards should copy:**
quotes §5 (the day-one empty state, drawn from Primer's published first-run-versus-error distinction
and from two Telwater sites in our own price file answering an absence with "WHAT HAPPENED?" and
"WHAT DO I DO?"); cascade §3 (how the best show causality, and the flat statement that across 110
frames nothing shipping draws the plan's beam, so a board may use it but must own it); and
configurator §1, which is structured as four questions a dealer has rather than four sites to admire.

---

## 7. A second dealership, and 390 px

### The second dealership

**picker A and D owe the answer, by the sweep's own last sentence:** "B passes outright, C with its
panel, **A and D must answer it**." Half the board set is left owing a hard requirement. A's card
grid and D's ladder both currently assume a picture column that a second dealership replaces.

**configurator B has not been asked.** Its stage "fills two thirds with a picture pager". The same
notes record 32 of 67 Highfield models with **no held picture at all**, Stabicraft with no verified
wordmark, Mercury white-ink only, and dealer fit, parts and rigging with **no pictures in the pack**.
§6 states the general degrade rule (photograph → mark → wordmark) and the consequence ("a chapter head
that *needs* a photograph has no Stabicraft chapter"), but never says what B's two thirds become.
B is the strongest answer to the 588-variant scale problem, so this wants fixing, not dropping.

**Answered well, and worth reusing:** cascade — "None depends on a particular photograph", with B's
blur caveated ("it must be the boat in this quote, named from the ledger, and B must also draw itself
once on a flat ground"); document — the cover measured rather than chosen (no held picture reaches
3,508 px, so the cover is a **band, not a bleed**), plus `live/betterproposals-templates` as the token
shape, every cover reading `yourlogo` and `{{brand_company_name}}`; quotes — C designs its
picture-less row first, not last, because a quarter of rows have no held picture.

### 390 px

**No sweep names 390 px, or any phone width, as a measurement.** The brief calls responsive at every
size a hard requirement. What exists: cascade asserts "each reflows to one column on a phone" without
drawing it; quotes C says grid-at-1440 collapsing to 96 px-thumbnail rows "below ~1100", which stops
600 px short of the requirement. Picker, configurator and document are silent.

Three directions have no 390 px story, and one is impossible as written:

- **document A** — "the A4 page is the only object on screen … **at 1:1** where the window allows".
  A4 at 1:1 is ~794 CSS px wide at 96 dpi. At 390 px the direction is not itself, and the hedge
  "where the window allows" means the phone silently gets a second, undrawn design. A also declares
  its ruler is a diff between printed and on-screen DOM — a ruler that cannot run on the phone form.
- **configurator B** — "the boat fills two thirds with a picture pager; the rail is one scroll". At
  390 px there are no thirds. B's whole reason to exist (search over 8,679 pairings) has to become
  the entire screen, which may be the better phone answer — it just has to be drawn.
- **picker B and C** — an index column beside a stage, and three live tiers side by side. C's
  promise, "changing brand re-fills the panel, never blanks it", is the first thing a single column
  breaks.

A useful addition to every board: state the phone form as its own composition, not as a reflow.

---

## Which sweep is weakest, and the one thing that would most improve it

**Weakest: `picker`.**

Not for want of rigour where it looked. Its §0 is the best opening of the five — 810 hulls → 289
models → two material chips and a written colourway count, with the material-versus-variant pricing
split measured (43 of 67 models price on material alone, 24 split further inside a material) and the
17 colourway tokens named as undecoded. I re-counted its row census against the pack: 588 + 91 + 37 +
19 + 27 + 9 + 39 = **810** across seven tables. Exact.

It is weakest on completeness, which is what this critique measures:

1. It is the only sweep that cites **none** of the five old-repo documents it was told to reuse,
   while two of them already answer its from-price question and its BMW frame.
2. Two of its four directions are **admitted** not to survive a second dealership and are then left
   owing.
3. One direction's two "exclusive" references are **one page captured twice**, and its third is a
   frame the same notes list under what to avoid.
4. The frame carrying direction B's central claim holds **eleven** models, not the fifteen claimed
   and nothing near the 289 the claim is about.
5. And the largest hole: **the sweep is titled "Picker and Place" and never designs, references or
   discusses Place at all**, though it is a separate route with its own three starting directions in
   the plan.

**The one thing that would most improve it: give Place its own section — its own references, its own
two or three directions, its own imagery answer — and open it by spending the finding §0 already
made.** Say out loud that the plan's Place direction B, "Porsche's swatch panel … a swatch grid
priced where finishes differ", is **dead**, because four of the seventeen colourway tokens (`I`, `O`,
`R`, `WH`) have no decode map and a drawn swatch would be a guess — and that STATUS question 3 makes
that a question for the dealer, never a design decision. That single paragraph turns an omission into
the sweep's sharpest contribution, and it retires a planned axis on measured evidence instead of
leaving a board to discover it during the build.

Without it, Place gets built by analogy to the picker — "same treatment as X", the one thing the
brief forbids by name.

**Ranked, for what it is worth:** cascade and document strongest (cascade for reading the contract
and checking the recovered teardown image; document for measurements that reproduce), configurator
next (the best file census, two brief items unasked), quotes next (the most frames and the best
empty-state section, but A and B are one shape), picker last.
