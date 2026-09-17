# What is actually on screen

Written 2026-09-17 by driving the running app — `npm run dev` on port 5100 — as a person does:
land cold with an empty browser, type a name, press the blue door, wait, arrive at Home, read it,
press **New quote**, come back, reload. Each step was screenshotted and the screenshot was opened
and looked at. Every measurement below was taken off the live DOM, not off the board and not off a
stylesheet comment.

The shots are under `entry/built/` and `home/built/`. The boards they are built from are
`entry/b-veil-and-card.html` and `home/b-one-photograph.html`; both screens remain **provisional**
in `docs/SCREENS.md` because the owner has not looked.

---

## Entry (`/sign-in`)

**At 1440 × 900** (`entry/built/entry-1440x900-cold.png`) the screen is the board. The window is one
Stacer 481 SeaMaster at dusk under the veil, held 1,771 × 1,183 and drawn 1,440 × 962 — the figure
is printed in the caption and it is measured off the element, so it can never claim an enlargement.
The navy pennant hangs off the top edge at x = 100 with `NORTHSIDE / MARINE` inside it and a
hairline running out of its right side across the band; under it, three lines saying the name is set
in type because the dealership's own mark is not in this repo. Top right: `Master Price File · packed
16 September 2026 · 1qz08ne`. Right of centre, behind a blue rule: `boat_stacer · 91 rows`, **Stacer
481 SeaMaster**, the sentence that ties the boat in the picture to a row, and the provenance. The
card sits left at y = 303–637 holding exactly three things — the instruction, a white field that is
the brightest object in the window, and the no-password paragraph. The two doors lie low across the
water at y = 676–788, the blue one carrying `53 tables · 15,691 rows · 28 of the tables are fitment
joins`. The foot says no customer, no quote and no draft exists. The page is 900 px tall in a 900 px
window: nothing scrolls, nothing overlaps, nothing is cut. Typing a name fills the field
(`entry-1440x900-named.png`); pressing the blue door puts a sentence under **both** doors —
"The Master Price File is being read now." and, on the blank door, "…this door would open the app on
half a sheet." — and a two-item named step list that ticks
(`entry-1440x900-loading.png`, `entry-1440x900-read.png`). **That busy state is the one thing at this
size that fails by eye:** the added sentences grow the page from 900 to **952 px**, the foot line
runs 873 → 912, and its second line is sliced by the bottom of the window for the ~400 ms the read
takes. Coming back from Home (`entry-1440x900-again.png`) the field already holds the remembered
name and the foot changes to "You have been here before, so this is the door back to the file."

**At 390 × 844** (`entry/built/entry-390x844.png`, `-full.png`) the band becomes one column 1,140 px
long: pennant, the mark note, the card, the blue door, the blank door, then the stamp, then the
goods panel, then the foot. Both doors are on the first screen — the blue one starts at y ≈ 578 — so
the act never needs a scroll, and the goods and the stamp are what a thumb finds below it. Nothing
overflows sideways (`scrollWidth` 390 = `innerWidth` 390) and nothing truncates. **What is honestly
gone at this size is the photograph.** It is still there and still measured — the caption reads
"drawn here at 1,264 × 844" — but under the deeper phone veil the picture reads as flat near-black;
a dealer in a hand sees a dark column, not a boat at dusk. That is the stylesheet's stated choice
("deeper on a phone than on a desk") and it is the choice the board's whole idea pays for.

**At 1920 × 1080** (`entry/built/entry-1920x1080.png`) the band stops growing at 1,440, centres, and
the composition is the 1440 one with more water around it — except that **there is no more water on
the left.** The held copy is 1,771 px wide and the screen refuses to enlarge it, so the picture box
is 1,771 × 1,080 placed at x = 149: a **149 px vertical strip of bare ground down the left edge with
a hard seam** where the photograph starts. It is the first thing the eye lands on. The rule that
produced it is the right rule; the composition has no answer for a window wider than its own
picture, and at 2560 the strip would be 789 px.

**At 844 × 390** (`entry/built/entry-844x390.png`), the sideways phone the rulers also run, the
special rule fires as written: the doors take a column of their own on the right and both of them,
plus the field, are on the first screen.

---

## Home (`/`)

**At 1440 × 900** (`home/built/home-1440x900.png`) the screen is a dark room with two daylight
photographs hanging in it and everything a dealer touches beneath them. `Northside Marine` at the
top left; at the right `MASTER PRICE FILE · READ FROM THE FILE` over `53 TABLES · 15,691 ROWS · 28 OF
THEM FITMENT JOINS`. The fold runs y = 80–418: a Highfield Adventure 7 drawn 761 × 336 with its
plate over the bottom-left corner (`HIGHFIELD INFLATABLES / ADV7 / 588 rows in that register, and 7
of them are this model`), and a Stacer 519 Sea Ranger SDF drawn 551 × 336 with its plate top-right
(`91 rows … and 2 of them are this model`). The film line under it names both held sizes and says
neither plate opens yet. Below, four columns: the desk with **Good afternoon, Dave Mercer.**, the
7,012 / 8,679 sentence, **New quote**, and a search field that really searches — typing `assault`
answers "17 rows carry that word", and Ctrl K puts the cursor in it; the six kinds at 810 / 241 /
444 / 1,866 / 3,587 / 64; the warm-white makers card with seven registers and their marks; and Open
drafts at `0` over the empty card diagram. The page is 902 px in a 900 px window — two pixels of
scroll. Nothing overlaps, nothing is cut, and no word sits on a photograph. **On the very first
arrival, with a cold cache, none of that was painted yet**: the fold was two empty dark rectangles
with their captions already set, and every maker cell was a hole above its name, for roughly two
seconds. Nothing shifted when they landed — the frames reserve their boxes — but the first
impression of Home on a cold cache is a dark screen with two voids in it. The cause is arithmetic:
the two heroes are 410,726 and 218,766 bytes of 2,560-wide WebP fetched to be drawn 761 and 551 px
wide, and there is no `srcset`, no `sizes` and no `fetchpriority` anywhere in `src/screens` or
`src/ui`. **What is wrong here is
the act.** `New quote` carries `refusedBecause`, so it renders in its refused state — background
`oklch(0.235 0.0484 243.9)`, a dark navy chip with a 26 %-white border — and the amber
`--color-act` (`oklch(78.3% 0.1453 73)`) that board B spends exactly once is not on the screen at
all. Pressed, it does nothing, which is correct and stated: the sentence "The picker is not built
yet, so there is nowhere for this to go." sits permanently beneath it and the control keeps its
focus. But the one act on the screen is now dimmer than the search field beside it, and the
brightest object on the screen is the makers card. Reloading (`home-1440x900-reload.png`) is the
second visit: the stamp changes to `READ FROM THIS BROWSER · IN 409 MS`, every figure is identical —
**and the seven makers reorder.** First visit they arrive in the file's own order (Stacer,
Stabicraft, Surtees, Jeanneau, Haines Signature, Highfield, Formosa); every visit after, they arrive
alphabetically out of IndexedDB (Formosa, Haines Signature, Highfield, Jeanneau, Stabicraft, Stacer,
Surtees). No figure is wrong; the composition is simply decided by the storage engine rather than by
the screen.

**At 390 × 844** (`home/built/home-390x844.png`, `-full.png`) the sheet becomes one column 2,633 px
long with no horizontal scroll at all. The fold stops being two frames abreast: each photograph
takes the full width at 200 px tall and its caption **steps out of the picture** and sits under it
on solid ground, which is how the rule that no type sits on a photograph is kept at this width. Then
the film line, the desk, the six kinds two-up, the makers card two-up, and the drafts card with its
diagram stacked. Everything is legible and nothing is clipped. **The cost is that the first screen
is entirely pictures:** at 844 px of window a dealer sees the business name, the stamp, both
photographs and the film line, with `THE DESK` arriving at the very bottom edge. **New quote** is
about 950 px down. In a hand, nothing you can press is on the first screen.

**At 1920 × 1080** (`home/built/home-1920x1080.png`) the screen is at its best and it fits exactly:
`scrollHeight` 1080 in a 1080 window, no overflow anywhere, no element past the right edge, no text
box scrolling inside itself. The extra width goes to the gutters and to the fold, which grows to 520
px so both hulls run properly across their frames; the four columns hold their widths rather than
stretching into walls of 11 px labels. Everything said about 1440 is still true, including the act:
**New quote** is still a dim navy chip and still the quietest bright thing on a screen whose loudest
object is a white card of brand marks.

**The blank sheet** (`home/built/home-1440x900-blank.png`) is the other true state and it is drawn,
not faked: `This business has not been named yet`, `A BLANK SHEET. NO PRICE FILE HAS BEEN READ INTO
IT YET.`, a veiled **Load the Master Price File** that really does reach `/sign-in?again=true` with
the remembered name already in the field, both frames kept at full size with `NO PHOTOGRAPH HERE / A
picture belongs to the row it depicts, and no row is open. Nothing stands in for it.`, and every
count replaced by the sentence that says why there is none. It is honest, and it is also 338 px of
empty rectangle at the top of the screen — the largest object on a blank Home is the absence of two
photographs.

---

## Home, after the critique of 2026-09-17

Written the same day by driving the running app again — `npm run dev` on port 5100, Playwright at each
ruler width — and every figure below was read off the live DOM. Shots: `home/built/*-answered.png`.
Home is still **provisional**: the owner has not looked.

**The act has its colour back.** `New quote` is a warm rectangle 380 × 52 at 1440 with the board's
own arrow at the far end and its sentence beneath it. Refused, it is `--color-amber-600`, two steps
down the amber ramp on that ramp's own step, with the room's own dark as its ink — measured through
the cascade at **4.87 : 1** for the label and **4.87 : 1** for the fill against the ground. It is the
only colour on the screen, which is the one sentence board B was recommended on.

**The showpiece is the showpiece.** `Northside Marine` is 40px and `Good evening, Dave Mercer.` is
34; the two sizes are the board's own, swapped. At every step of the ladder the name is one step
above the greeting.

**The page is 900 in a 900 window** — `scrollHeight` 900, `clientWidth` 1440, no scrollbar, where the
first cut ran 902 and carried one permanently. 1280 × 800 is 800 in 800 and 1920 × 1080 is 1080 in
1080, both with nothing past the right edge and nothing scrolling inside itself. The 35px that had to
be found came from the makers' cells, where a subgrid's own `row-gap` now closes the three lines of
one cell to 4px while the shelf's rows stay 12 apart, and from 8px off the foot of the sheet.

**The fold is fetched at the size it is drawn, and asked for at the first paint.** Each photograph
carries a `srcset` of every copy the ledger holds — 640, 1280 and the held 2,560 — a `sizes` that is
the fold's own two percentages, `fetchpriority="high"` and `decoding="async"`, and React's `preload`
runs for both before the sheet is open, where the old `<img>` could not exist until it was. At 1440
the browser takes 122,988 and 77,042 bytes instead of 410,726 and 218,766; at 390, 34,064 and 28,432.

**The film line is a measurement.** `held 2,560 × 1,706, drawn 770 × 513` at 1440, `drawn 695 × 463`
at 1280, `drawn 1,002 × 668` at 1920 — each read off its own element with a `ResizeObserver` and the
`object-fit: cover` arithmetic, the way entry reads its one photograph. "Neither drawn past its own
size" is printed only where both have been measured and both hold; where nothing has been measured
the claim is not made.

**In a hand, the act is on the first screen.** Below 1200 the desk comes before the fold — this
screen's one departure from the board's written reflow, argued in `docs/DECISIONS.md`. At 390 × 844
the act's top edge is at **248** and it is full width at 52px with the field beneath it, which is the
board's own rule for a hand, taken this time; at 844 × 390 it is at **239** of a 390px window. The
photographs keep their full size and follow. `scrollWidth` equals `clientWidth` at every width.

**The shelf reads biggest first** — Highfield 588, Stacer 91, Formosa 39, Stabicraft 37, Jeanneau 27,
Surtees 19, Haines Signature 9 — and the order no longer changes between the first visit and the
second. The marks are drawn at a 28px ceiling rather than 20, which is where Haines Signature's
script, Highfield's strapline and Jeanneau's wordmark resolve; the held files are 368, 111, 466, 225,
288 and 179 pixels tall, so nothing is enlarged.

**The blank sheet's fold is a band, not a void.** With no row open the two frames are 112px of solid
panel with their plates centred and their sentences unchanged, where they were 338px of empty
rectangle with a caption in one corner. What is still true of the blank sheet is that its lower half
is mostly bare: four columns each holding one sentence. That is honest and it is not yet composed.

**What was measured and did not change.** Every figure on the screen is still counted off what
loaded; no cost column reaches it; nothing is under 11px; the contrast, cut, overlap and ramp rulers
pass at all six viewports; and `New quote` still refuses, in a sentence, keeping its focus and its
name.
