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
