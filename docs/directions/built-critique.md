# The two built screens, judged against the boards they promised

Independent critique, 2026-09-17. Read-only: nothing outside this file was touched.

What was read: `docs/directions/built.md`; `entry/b-veil-and-card.html` and `home/b-one-photograph.html`
with both board shots opened and looked at; both `critique.md` files; every PNG under
`entry/built/` and `home/built/`; `src/screens/entry/{Entry.tsx,facts.ts,entry.css}`,
`src/screens/home/{Home.tsx,holdings.ts,ledgers.ts,home.css}`, `src/ui/Button.tsx`,
`src/ui/button.css`, `src/styles/tokens.css`, `e2e/rulers/measure/contrast.ts`.

Every figure below was measured. Contrast on a flat ground was computed from the token pair;
contrast on a photograph was measured off the built PNG itself, per 24 × 13 px tile, with the
tile's 25th and 50th percentile luminance taken as the ground under the glyphs.

---

## What passed, so it is not re-litigated

- **No invented figure on either screen.** 53 tables · 15,691 rows · 28 joins · 7,012 base ·
  8,679 join rows · 810 / 241 / 444 / 1,866 / 3,587 / 64 · 91 / 37 / 19 / 27 / 9 / 588 / 39 ·
  `1qz08ne` · 16 September 2026 · 13 makers checked, 12 held, 17 files — every one of them
  reproduced exactly by walking `manifest.json`, `heroes-ledger.json` and `marks-ledger.json`.
  `holdings.ts` counts the store rather than reading `manifest.counts`, which is the stricter
  choice and the right one.
- **No fake state.** Zero drafts, drawn as zero with the card empty and every region named. No
  customer, no quote. The blank sheet is a real second state with its own sentences.
- **No photograph enlarged.** Entry: held 1,771 × 1,183, drawn 1,440 × 962 at 1440, 1,771 × 1,183
  at 1920, 1,264 × 844 at 390 — the arithmetic of `object-fit: cover` against the ledger's own
  pixels, printed on the screen and correct at all three. Home: 2,560 × 1,706 and 2,560 × 1,694
  drawn 761 and 551 wide.
- **No hard-coded colour, face or picture path.** One literal in either stylesheet and it is
  inside a comment quoting the board. Pictures are named by ledger id, marks come from
  `marks-ledger.json` with both of its gaps answered in words, everything else is a token.
- **Nothing under 11px.** `--text-2xs` is 0.6875rem and the root is not resized.
- **No password field.** The honesty paragraph is at body size where the field would have been.
- **No cost or margin anywhere.** "Registration Costs" is the dealership's own register name out
  of `Registration Module.xlsx`; "Total at the cash rung" is a declared price level.
- **No dead control.** Both doors work, search really searches, Ctrl K really focuses, the two
  plates stopped being doors because registers have no screen, and `New quote` carries a
  permanent sentence and keeps its focus.

---

## Blocker

### entry — the provenance caption is under 4.5:1 on the water it is actually drawn on

At 1440 × 900 (`entry/built/entry-1440x900-cold.png`), the four-line caption under the goods
panel measures, tile by tile across its own width:

```
line 1   5.1  5.1  5.1  5.1  5.1  5.2  5.4  5.5  5.7  6.0  6.1  6.3  6.5
line 2   4.8  4.7  4.7  4.7  4.8  4.8  5.0  5.2  5.3  5.6  5.7  5.9  6.2
line 3   4.4  4.4  4.4  4.3  4.4  4.4  4.6  4.7  4.9  5.1  5.2  5.5  5.6
line 4   4.1  4.1  4.1  4.1  4.1  4.2  4.4  4.6  4.7  4.9  5.0  5.2  5.5
```

Lines 3 and 4 — `962, never enlarged · stacer.com.au · in the image ledger` and
`since 16 September 2026` — are 12px at 4.1–4.4:1. Bare ground 20px lower measures 3.5:1, so the
band the caption has drifted into is the brightest water on the screen.

The board did not have this fault: the same block on `shots/b-veil-and-card.png` measures 5.4–6.7:1
by the same method. The build caused it by adding two lines the board did not carry — the measured
drawn size and the ledger date — which pushed the caption down out of the dark quarter Zodiac's
pattern put it in. At 1920 it recovers to 5.1–6.6:1, so the failure is specific to the one
viewport the owner will open.

---

## Major

### entry — the contrast ruler cannot see this screen's ground

`e2e/rulers/measure/contrast.ts` builds its ground in `groundOf`, which walks `parentElement`
reading `backgroundColor` only. Entry's photograph is an `<img>` inside `.entry-ground`, a
`position: fixed` **sibling** of `.entry-band`. So for every word on this screen except the card's,
the ruler composites the ancestor chain, reaches `.entry` at `--color-ground`, and reports
14.95:1 for a caption that is really at 4.1:1.

This is why the blocker above shipped green. CLAUDE.md requires every guard to have a fixture
proving it can fail; `fixture.spec.ts` proves it can fail on a background *colour*, which is the
one case entry never presents. The premise of the picked direction is type over a photograph and
the instrument is blind to exactly that.

### entry — at 390 × 844 the photograph is gone

Median luminance of the lower band at 390 is **0.0066**. The flat ground token `--color-ground`
is **0.0068**. The picture is, to within a rounding error, the same as no picture: a dealer in a
hand sees an empty dark column. Meanwhile the panel below it still reads "The boat in this
photograph is one of those rows", and the caption still prints "drawn here at 1,264 × 844" — a
measurement of something nobody can see.

`entry.css` states this as a decision ("deeper on a phone than on a desk", `--color-veil-60` under
the left gradient and the two 82% bands). It is an honest decision and it costs the direction its
whole idea at one of the six ruler widths. The board is called *Veil and card*; at 390 it is card.

### entry — one missing ledger id takes the business name, the mark and the door's counts with it

`readEntryFacts` reads the manifest, the heroes and the marks in one `Promise.all`, then throws if
the hero id is not in the ledger. `Entry.tsx` catches into `unread` and leaves `facts` null. Render
that state and: the pennant draws **empty** (`facts?.wordmark.lines.map(...)` is undefined, so the
navy flag hangs with nothing in it), the mark note is gone, the stamp loses its date and
fingerprint, the goods panel reads `—`, and the blue door can no longer say what it loads.

That is the second dealership. Their `heroes-ledger.json` will not contain
`stacer-481-seamaster`, and one absent photograph will take the business's name off its own front
door. `docs/CUSTOMISATION.md` asks that nothing make a second dealership expensive; this makes it a
blank flag. Home does this correctly — a missing picture id draws the honest absence and every
other figure survives.

### home — the act loses its amber, and with it the reason board B won

`--color-act` does not appear on the built screen at all. `New quote` carries `refusedBecause`,
and `button.css` drains an act's amber to `--color-panel` with `--color-neutral-200` ink: a dark
navy chip, quieter than the search field beside it and far quieter than the makers' card. The
loudest object on Home is a white rectangle of other companies' logos.

The critic's recommendation was one sentence: "one amber button that is unmistakably the thing you
press… the only board with any colour on it at all, which is what 'blue and white, and a bit more
colour usage' asks for." That sentence is now false of the built screen.

The honesty argument for draining it is not wrong, but the same stylesheet twelve lines above
makes the opposite argument and makes it better: a refused **primary door** keeps the file's blue,
two steps down the same ramp, because "draining the door says 'this is dead' about the act that is
at that instant working." A refused act is in the same position — the sentence beneath it is what
changes the reader's mind. The screen should keep its one warm rectangle, two steps down the amber
ramp, with the sentence under it.

### home — the dealership's name is smaller than the greeting

`.home-name` is `--text-5xl` (34px); `.home-greet` is `--text-6xl` (40px). At 1440 and at 1920,
"Good afternoon, Dave Mercer." out-ranks "Northside Marine" — which is board C's fault, the one the
entry critique named as "the wrong argument to win on a screen whose owner asked for the logo to be
the showpiece". The build is a real improvement on the board's 12.5px eyebrow and it still does not
land: the showpiece is the second-largest thing on its own screen.

### home — on a cold cache the fold is two black holes for about two seconds

`highfield-adv7-c66ad9ec.webp` is 410,726 bytes and `stacer-519-sea-ranger-4ea6e75c.webp` is
218,766 bytes, both 2,560 wide, fetched to be drawn 761 and 551 px wide at 1440. There is no
`srcset`, no `sizes`, no `fetchpriority`, no `decoding` and no preload anywhere in `src/screens`,
`src/ui` or `index.html` — measured by grep, none. The frames reserve their boxes so nothing
shifts, which is correct, and the first impression of the app's main screen is a dark room with
two voids in it.

"It does not feel alive" is the sentence that killed five redesigns. It describes the first two
seconds of this screen exactly, and the cause is 600KB of unsized WebP.

### home — at 390 nothing you can press is on the first screen

844px of window shows the business name, the stamp, both photographs and the film line, with
`THE DESK` arriving at the bottom edge. `New quote` is about 950px down.

The board specified the fix and the build did not take it. `b-one-photograph.html`, reflow, 390:
"NEW QUOTE goes full width at 52px directly under the greeting with the search field beneath it,
because a 176px button beside a 204px field does not survive a 358px measure." Built, it is a small
chip in its refused state and `home.css` has no rule for the act at 390 at all.

### entry — at 1920 a 149px strip of bare ground runs down the left with a hard seam

The picture box is capped at the ledger's 1,771px and pinned right by `margin-inline-start: auto`,
so a 1920 window leaves 149px of `--color-ground` on the left. Measured across the seam at
x = 149/150: `(1,11,19) → (25,33,41)` at y = 200, and `(2,12,19) → (13,22,29)` at y = 900. That is
a visible vertical edge down roughly two-thirds of a 1080px window.

Never enlarging is the right rule. The composition has no answer for a window wider than its own
photograph, and at 2560 the strip is 789px. A held picture with more room on both sides, a mirrored
edge, or a second hero from the ledger's other seven would each answer it.

---

## Minor

- **entry — the busy state slices the foot at the board's own viewport.** Pressing the blue door
  adds two sentences and a two-item step list; the page grows from 900 to 952px, a scrollbar
  appears on the one screen that otherwise fits exactly, and the foot's second line is cut by the
  window for the ~400ms the read takes (`entry-1440x900-read.png`). Honest content, badly timed:
  the space wants reserving before the press, not after it.
- **home — 902px in a 900px window.** A permanent scrollbar at 1440 × 900 for two pixels of
  overflow, visible in every 1440 shot.
- **home — the seven makers reorder between the first visit and every visit after.** First open
  they arrive in the file's order (Stacer first); every open after, alphabetically out of
  IndexedDB (Formosa first). No figure changes; the composition of the brightest object on the
  screen is decided by the storage engine. `held.boats` should take a stated order the way
  `KIND_ORDER` already does.
- **home — "neither drawn past its own size" is asserted, not measured.** Entry measures the drawn
  size off the element and prints it, which is the stronger habit; Home prints the held size and
  appends an English claim. Both are true today. Only one stays checkable.
- **home — the marks are drawn at a 20px ceiling and three of them cannot be read there.** Haines
  Signature's script is a grey squiggle, Highfield's "dare to explore" is illegible, Jeanneau's
  wordmark is a smudge under its star. The cell already sets the name underneath, so nothing is
  lost — but a mark nobody can read is a picture, and the shelf is otherwise the best object on
  either screen.
- **home — the `Figure` primitive is unused on the screen made of six figures,** with no note
  saying why. Its doc comment names this exact case ("a count of rows"). The brief asks that a
  primitive which cannot do the job be named and extended rather than bypassed in silence.
- **both — two of the six ruler viewports have no evidence.** `built.md` reports 1440, 1920, 390
  and 844×390 for entry, and 1440, 1920 and 390 for home. Nothing was shot or measured at
  834 × 1112 or 1280 × 800 on either screen, and nothing at 844 × 390 on home — where `home.css`
  hands a 390px-tall window a 320px-tall photograph as its first object.
- **home — the blank sheet's largest object is the absence of two photographs.** 338px of empty
  rectangle, and a 244px middle column holding one sentence. It is honest and it is the screen a
  second dealership sees on day one.

---

## Would the owner accept these two on sight

**Entry, yes — with the caption fixed.** It is the board: real dusk water, a pennant that is an
object and not an eyebrow, one blue that means the file, the photograph's own row named beside it.
Fix the 4.1:1 caption first, because it is the one line on either screen that fails a rule the repo
wrote down, and it fails at the exact size he will open.

**Home, not yet.** He asked for the logo to be the showpiece and it is the second-biggest thing on
its own screen; he asked for a bit more colour and there is none, because the single amber the
board spent once has been drained out of the only act; and for the first two seconds of a cold
visit his showroom is a dark room with two holes in it. In order: give `New quote` its amber back
two steps down the ramp with the sentence kept beneath it, preload and size the two heroes so the
fold paints on arrival, and set `Northside Marine` above the greeting rather than below it.

---

# The seven built screens, judged as the owner would. 2026-09-17, second round

Independent critique. Read-only: nothing outside this file was touched, no test was edited, nothing
was committed.

**What was read:** `docs/STATUS.md`, `docs/SCREENS.md`, `docs/directions/built.md`; every PNG under
`docs/directions/*/built/`; the sweep notes for picker, configurator, cascade, document and quotes;
`src/screens/*/**` for all seven screens; `src/styles/tokens.css`, `src/styles/app.css`,
`index.html`, `tools/check/rules.ts`, `e2e/routes.ts`, `src/routes/*`.

**What was measured:** the app was driven on `npm run dev`, port 5100, at 1440 x 900, 390 x 844 and
1920 x 1080 — cold browser, name typed, file loaded, hull picked, quote started, motor swapped,
address typed, quote issued, document read, version made — and every figure below was read off the
live DOM with `getBoundingClientRect` or computed from the painted colours. Contrast was computed
per text node by compositing the real ancestor background chain through a canvas (so `oklch()`
resolves to sRGB), not from the token pair and not from the ruler.

## What passed, so it is not re-litigated

- **No hard-coded colour, face or picture path in any of the seven stylesheets.** One hex literal in
  the whole of `src/screens`, inside a comment quoting entry's board. Every `.png` in a `.tsx` is a
  reference-frame citation in a comment. Every `font-family` is `var(--font-*)`.
- **No typed figure.** Grepped: not one numeric literal reaches JSX text on any screen. Every count
  reproduced live — 810 / 241 / 444 / 1,866 / 3,587 / 64, 588 / 91 / 39 / 37 / 27 / 19 / 9,
  53 tables, 15,691 rows, 792 of 810 at the Cash rung, 15 finishes, 172 rows for "battery".
- **No photograph enlarged.** Configurator stage 412 x 232 of a held 1,100 x 619; document cover
  656 x 369 of the same; home 1,002 x 668 of 2,560 x 1,706.
- **No cost column anywhere, and the spec strip cannot leak one.** `domain/modules/tileFacts.ts`
  refuses money and `isCostColumn` before a fact reaches a face; the 139 ids resolve to names like
  `Base Cost`, `GP` and `Total Nett CTD`, none of which is drawn.
- **The refusals that matter come from the engine.** `ISSUED_REFUSAL` is
  `src/domain/quote/commands.ts`'s own sentence; every cascade heading is `cascade.ts`'s `because`,
  asserted by `proposal.test.ts`.
- **Undo is real.** Measured: a second motor took the total 66,584 to 83,453 and `Undo` put it back
  to 66,584 exactly, with `Put it back` offered after it.
- **Contrast is clean on home, picker, cascade, document and the register** at 1440, 390 and 1920 —
  74, 110 and 108 text nodes walked on three of them, zero below threshold, nothing under 11px, no
  horizontal overflow at any of the three widths.

---

## Blockers

### configurator — 11px type at 2.99:1, on a screen no ruler opens

`.cfg-fact__lab` (`configurator.css:666`) is `--color-neutral-500` on `--color-panel`. Measured
through the live cascade: `oklch(0.516 0.0335 237.5)` on `oklch(0.235 0.0484 243.9)` =
**2.99 : 1 at 11px**. These are the labels on every offered row — `Motor`, `Prop Part No.`,
`Prop Description`, `Rigging Kit Option`, `Engine Hole`. **Six instances with one chapter open at
1440, twelve at 390**; `Show all 209 in Yamaha Outboards` multiplies them.

It shipped green because `/quote/$id` is not in `e2e/routes.ts`, so the contrast ruler has never
opened this screen.

### home — the only control on the screen is dead, and its reason is a lie

`Home.tsx:491`: *"The picker is not built yet, so there is nowhere for this to go."* The picker is
live at `/quote/new`. Measured on the running app: pressing `New quote` leaves `location.pathname`
at `/`. **Home has exactly one button on it** — confirmed by enumerating every `<button>` at 1920 on
a Home with two real quotes filed. A dealer who lands on Home cannot start a quote, cannot reach the
register, and cannot reach the drafts the same screen is counting.

### quotes — the register cannot open the document it just listed

`Quotes.tsx:131`: *"The quote document has no screen yet, so there is nowhere for this to open."*
It has one; it was read. Measured: in the peek panel, `Open it` and `New quote` both carry
`aria-disabled="true"` and do nothing. This is not a stale string — `QuotesProps` has **no
`openDocument` and no `newQuote` prop at all**, and `src/routes/quotes.tsx` passes only `goHome` and
`openTheFile`. The seam was never cut.

### configurator — issuing the quote strands the dealer, under a sentence that is false

`Configurator.tsx:113` prints, permanently, under `Give it to the customer`: *"The document is the
next screen of this milestone and it is not built yet, so nothing was opened."* Measured after
pressing it: the quote issues correctly, the masthead turns to `GIVEN TO THE CUSTOMER`, and the only
onward control on the screen is `Make a new version`. There is no route from the act of selling to
the thing you hand over.

---

## Major

### picker — the primary act is off the screen at the moment it becomes live

Measured at **1440 x 900**, SP560 chosen: `Start the quote` at top **857**, bottom **909** — nine
pixels sliced. Then a material is picked, which is what makes the act live, and it moves to top
**1119**: **219px below the window**. At **1920 x 1080** it is at **1119** in a 1080 window, still
off screen. The page does not scroll — `scrollHeight` equals the window at both sizes — only
`.picker-stage` does, 692 (then 872) of 1,093, behind a 17px scrollbar. The act is never a floating
bar, which is right; it is simply not visible. At 390 the same screen puts it static at 1,289 of a
1,483px page, which is correct, so the phone is better than the desk.

### configurator — "Stage and rail" has no stage

Direction B's own words are *"the boat fills two thirds"*. Measured at 1920: `.cfg-stage` is
**512px of 1,920 (27%)** and the boat inside it is **412 x 232**, from a held copy of 1,100 x 619.
The hull the customer is buying occupies **2.6% of the screen** while about 150px of ground sits
unused beside the rail. The owner's note on this screen was *"More like Porsche the right side, not
less. STUDY IT."* — Porsche's left side is a car at full bleed.

### configurator — pressing a second motor fits a second motor, silently

Measured live on the SP560 with `F90XB` fitted: pressing `F115XB` took the total from
**$66,584 to $83,453**, the chapter head to *"chosen: Yamaha - F90XB · +1 more"* and the motor
subtotal to **$31,400**. The rows are `aria-pressed` toggles, so multi-select is the declared
semantic — but nothing on the screen says a 5.66 m RIB now has two outboards on it, and the sweep's
own reference for this chapter (`deep/whaler-engines-chapter.png`) prices alternatives *against what
is fitted*. `Undo` recovers it exactly; a manager who does not notice will not press Undo.

### configurator — the issued refusal is printed once per row

Measured after issuing, with chapter 02 open: **five copies** of *"This quote has been given to the
customer…"*, four of them **58.5px tall wedged between rows**, so each reads as though it belongs to
the row beneath it. One chapter above, the fitment refusal says its reason **once**, above the list,
with every row still live. The same screen holds the right pattern and the wrong one.

### cascade — 46% of the office monitor is a blur of nothing

Measured: `.csc-sheet` starts at x=542 of 1,425 at 1440 (**38%**) and x=881 of 1,905 at 1920
(**46%**), and everything to its left is the boat's catalogue copy under `blur(20px)`. That copy is
a **white-ground studio render**, so blurred it is a near-black smear in which no boat is legible —
look at `cascade/built/flow-1920-06-cascade.png`. Porsche's blurred stage works because there is a
car in a scene behind it. There is also **147px of empty ground** between the last card and the
decision block at 1920.

### app-wide — the app declares itself light and is painted dark

`index.html:6` sets `<meta name="color-scheme" content="light">` and `app.css:19` sets
`body { background: var(--color-white) }`, while every screen paints its own dark ground on `<main>`.
Measured consequences: a **17px classic light-grey scrollbar** inside `.picker-stage` on a dark
panel; light-scheme form controls; and white canvas behind every overscroll and anywhere a screen is
shorter than the window. `:root { color-scheme: dark }` with a dark body background is a two-line fix
that removes the ugliest craft defect in the app.

### app-wide — a mistyped address is a white page that says "Not Found"

Measured at `/nope`: body background `rgb(255,255,255)`, the words `Not Found`, **zero buttons**, no
dealership, no way back. `src/routes/__root.tsx` sets no `errorComponent` and `src/main.tsx` no
`defaultErrorComponent`, so **any screen that throws lands here too** — in an app that is otherwise
entirely dark and named.

### the rulers — three of the seven screens face none of them

`e2e/routes.ts` carries `/`, `/sign-in`, `/quotes` and `/quote/new`. `/quote/$id`,
`/quote/$id/cascade` and `/quote/$id/document` are deliberately absent, so contrast, cut, overlap,
ramp and density have **never opened the three screens the sale actually happens on**. STATUS.md has
named the fix twice — a third `arrive` mode that mints a quote — and it is still not built. The
2.99:1 blocker above is what that gap costs.

### document — the sheet the customer keeps carries instructions for the dealer

Read off the issued document: *"pair it on the subject's own page and it shows here"*, *"Uploading
one puts it here, at this size, and nothing below it moves"*, *"The count is the one frozen when the
quote was raised"*, a `HOW TO READ A LINE` glossary, and *"On this document: 0 lines are included,
12 rows were offered and not taken, and 0 lines carry no price at this level."* — a census of the
register, printed to Marcus Webb. The masthead also prints **`TOTAL AT CASH, TAX INCLUDED`** and
*"Priced at Cash, which 3 of the 3 lines carry."*: `Cash` is a declared level and no guard is wrong,
but it tells the buyer which internal column he is being priced from.

### home — two false sentences and a plural bug over a real draft

Measured at 1920 with one draft and one issued quote filed: *"1 drafts are open, and the register
that lists them is not built yet."* (`Home.tsx:818`) printed over the empty wireframe card that says
*"when one does, it lands in this card"*, and the film line reading *"NEITHER PLATE OPENS YET: A
REGISTER HAS NO SCREEN UNTIL THE PICKER IS BUILT."* (`Home.tsx:365`). Both screens exist. Home has
no control that reaches either.

### cascade — the figure the decision promises is subtracted in `src/screens`

`src/screens/cascade/proposal.ts:467` — `const to = quoteTotals(next).total - lost`, with `lost`
summed in the same file. That file's own header says *"the screen holds no arithmetic and no
phrasing of its own"*, and CLAUDE.md says a derivation is a pure function in `src/domain`.
`proposal.test.ts:262` asserts the applied total equals the promised one, so **no figure on screen
is wrong today**; the rule is broken, not the arithmetic.

---

## Minor

- **configurator — a 3.31px slit between two opaque sticky bars.** Measured at 1440 with the page
  scrolled: `.cfg-mast` ends at 108.69, `.cfg-find` begins at 112. The rows underneath are painted
  in the gap.
- **home and picker have no singular.** *"1 rows carry that word"* (`Home.tsx:603`), *"1 of 67 models
  carry those words"* (`Picker.tsx:265`). `Configurator.tsx:325` gets it right in the same codebase.
- **picker — about 480px of empty register index at 1920** while the act is off screen, and two
  light scrollbars at once.
- **configurator — the sweep said not to draw a star.** §4 of its notes: *"None uses a star, a ribbon
  or a colour."* The build pre-chooses the starred row, which is the substance, and then draws a ★
  anyway.
- **cascade — the act is 13px below the fold at 1440** on a three-line quote (top 913, window 900);
  on a longer quote it is far lower.
- **no `<a>` element exists anywhere in the app.** Every move between screens is a `button` calling
  the router, so nothing can be middle-clicked, copied, or opened in a new tab — on an app whose
  positions are all real addresses.
- **`/quote/<unknown-id>` is one honest sentence with no control on it.** A dead end rather than a
  wrong answer, but a dead end.
- **`Ctrl K` and `J K Space Enter Esc` legends are drawn at 390** on a device with none of those
  keys.
- **two empty files, `one` and `where`, are tracked at the repo root.**

---

## Would the owner accept this selling flow on sight

**No.** He would press the one button on Home, watch nothing happen, read a sentence telling him the
picker is not built — and stop. The flow underneath is genuinely good once you are inside it: the
configurator's six chapters, a running total that never animates, a cascade grouped by the engine's
own causes, an A4 sheet that is the same object on screen and on paper. None of it is reachable
without typing addresses into the bar.

**The one thing to change first: wire the four dead acts to the screens that already exist** —
Home's `New quote` to `/quote/new`, the register's `New quote` and `Open it` to `/quote/new` and
`/quote/$id/document`, and the configurator's finale to the document it just froze — and delete the
four sentences that say those screens do not exist. It is a routing change, not a design one, and
until it lands the app cannot be demonstrated.

**Then, in order:** the 2.99:1 labels in the configurator; `color-scheme: dark` so the scrollbars
stop being light grey; the picker's act where a thumb can reach it; and the configurator's boat
drawn at a size worth photographing.
