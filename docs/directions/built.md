# What is actually on screen

Written 2026-09-17 by driving the running app — `npm run dev` on port 5100 — as a person does:
land cold with an empty browser, type a name, press the blue door, wait, arrive at Home, read it,
press **New quote**, come back, reload. Each step was screenshotted and the screenshot was opened
and looked at. Every measurement below was taken off the live DOM, not off the board and not off a
stylesheet comment.

The shots are under `entry/built/` and `home/built/`. The boards they are built from are
`entry/b-veil-and-card.html` and `home/b-one-photograph.html`; both screens remain **provisional**
in `docs/SCREENS.md` because the owner has not looked.

**The Entry half was rewritten later the same day**, after `built-critique.md` measured a 4.1:1
caption on it and four other faults, and after they were fixed: it now reports the screen as it
stands at all six ruler viewports, with every ratio measured off the painted pixels rather than off
the token pair. The shots at `entry/built/entry-390x844.png`, `-844x390.png` and `-1920x1080.png`
are the screen AFTER those fixes — the re-shoot overwrote the three the critique had cited, which
is a real loss of before-evidence; `entry-1440x900-cold.png` and `entry-390x844-full.png` survive
as the before, and every figure the critique measured is written down in it. The Home half below
is unchanged and is still the account of 2026-09-17 morning.

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
(`entry-1440x900-loading.png`, `entry-1440x900-read.png`). **That busy state was the one thing at
this size that failed by eye:** the added sentences grew the page from 900 to **952 px**, the foot
line ran 873 → 912, and its second line was sliced by the bottom of the window for the ~400 ms the
read takes. It is fixed, and how is below. Coming back from Home (`entry-1440x900-again.png`) the
field already holds the remembered name and the foot changes to "You have been here before, so this
is the door back to the file."

**The caption under the panel measured 4.0:1 at this size** and the blocker was real. Measured off
`entry-1440x900-cold.png` with the critic's own method — 24 × 13 px tiles, the tile's median painted
pixel taken as the ground — the four lines ran 4.0 4.1 4.1 4.1 4.2 4.4 4.6 4.7 4.9 5.1 5.3 5.5, and
bare water 20 px lower measured 3.4:1. The same block on the board measures 5.4–6.7. **It now
measures 6.8–8.7**, and it is still the board's four facts on the board's own water: the screen
carries its own dark quarter with it, a 30% wash — entry B's own `.veil-flat` value — drawn as an
ellipse with no edge, wider than the block it sits under and centred on the caption rather than on
the block, because the 22 px row name above it is large text and clears 3:1 on bare water anyway.
The wash is drawn only where there is a photograph under it. The busy state no longer moves the
page: **900 px before the press and 900 px while it reads** (`entry-1440x900-reading.png`), because
the step list was taken out of the flow and put in the water the composition leaves empty under the
blank door, opposite the foot sentence; the two refusals stay in the flow under the doors they
belong to and cost 29 px of the 28 px of slack the page had. Reserving the room instead was tried
and measured first: this composition has no 52 px to give, so holding it open moved the card up nine
and the foot down twenty-four, at rest, for a state that lasts four tenths of a second.

**At 390 × 844** (`entry/built/entry-390x844.png`) **the photograph is a band across the top**, and
that is the one width where this direction gives up its own device on purpose. The card is 358 of
390 px wide and the two doors fill the rest of the first screen, so a full-bleed picture had nowhere
to be seen: the first build measured **0.0066** of luminance where the picture was against **0.0068**
for no picture at all — the same screen twice. So the picture takes 390 × 208 of its own at the top,
under a 20% wash instead of a 60% one, with the pennant hanging into it exactly as the board hangs
it off the top edge, dissolving into the room at its foot. Measured after: **0.0409** in the band
beside the flag, six times the flat ground. The caption goes on printing the size it is really drawn
at — "390 × 261" — because the band crops it. Under the band, on the room's own ground at 14.95:1:
the card 208–583, the blue door 603–714, the blank door 726–836, so both doors are still on the
first screen of an 844 px window. The mark's note leaves the masthead and joins the provenance below
the doors, which is where a sentence about where a wordmark came from belongs on a phone. The page is
1,214 px and `scrollWidth` is 390.

**At 1920 × 1080** (`entry/built/entry-1920x1080.png`) the band stops growing at 1,440 and centres,
and **the picture now hangs in the room rather than ending in it.** The held copy is 1,771 px wide
and the screen still refuses to enlarge it, so the 149 px the window has left over is split — 74 px
of room on each side — and the picture's two vertical edges fade out over exactly that distance.
Measured across the left edge at y = 200, in luminance, tile by tile of 10 px: 0.0030 0.0030 0.0030
0.0030 0.0033 0.0040 0.0052 0.0066 0.0081 0.0103 0.0122 0.0145 0.0159 — a 75 px ramp where there was
a step from (1,11,19) to (25,33,41) at a single pixel. At 2560 the room is 394 px each side and the
fade is capped at 96, so the photograph reads as hung rather than cropped.

**At 844 × 390** (`entry/built/entry-844x390.png`), the sideways phone the rulers also run, the
special rule fires as written: the doors take a column of their own on the right and both of them,
plus the field, are on the first screen. The picture stays the ground here rather than becoming a
band — 390 px of window has no room to spend on one — and everything that scrolls past it (the
stamp, the panel, the foot) lands on the room's own flat ground.

**At 834 × 1112 and 1280 × 800**, the two viewports nothing had ever been shot or measured at
(`entry-834x1112.png`, `entry-1280x800.png`): both fit exactly — `scrollHeight` 1,112 in 1,112 and
800 in 800 — and neither scrolls sideways. At 834 the panel is back above the ask, which is the
board's reading order, and its caption measures 7.2–13.9:1; at 1280 the board's composition holds at
a 56 px gutter and the caption measures **5.95–8.2:1**, which is the worst of the six because the
water behind it is the brightest there. Both were found to overflow sideways by 8 to 24 px while
this was being measured — the new wash bleeds past the block so its fade lands outside the words,
and where the panel is the full content column that bleed reached past the window. `.entry`
clips it on the inline axis only.

**A second dealership's ledger has no picture for this screen, and that now costs the picture and
nothing else** (`entry-1440x900-no-picture.png`). It used to cost everything: `readEntryFacts` threw,
the screen caught it into one sentence, and the pennant hung EMPTY — the business's name off its own
front door, with the stamp, the counts and the mark note gone with it. Now the flag carries the name,
the stamp its date and fingerprint, the blue door its 53 tables and 15,691 rows, and the panel says
`No photograph here` with the reason under it. The four washes and the wash behind the panel are not
drawn at all in that state: a 30% veil over bare ground darkens it by a third and reads as a smudge
in the corner.

**And a manifest that cannot be read says so where the flag would have hung**
(`entry-1440x900-unread.png`) rather than hanging an empty flag: "The business's own name is in the
price file's manifest, and it could not be read: manifest.json answered 404. Nothing is drawn in its
place." The door still works, and still says that pressing it reads the file itself.

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

---

# The whole selling flow, driven end to end

Written 2026-09-17 evening, by driving `npm run dev` on port 5100 in a real Chromium as a sales
manager would: land cold with an emptied IndexedDB and an empty `localStorage`, type a name, press
the blue door, arrive at Home, try to start a quote, pick a brand and a model, walk every chapter,
swap the motor, keep the trailer the file pairs, add a part, address it, force both cascades, issue
it, read the document, press Print, find it again in the register, make a new version, and reload.
The same walk was then repeated at 390 × 844 and at 1920 × 1080. Every figure below was read off
the live DOM with `getBoundingClientRect` or off the saved screenshot's own pixels. Nothing here is
taken from a board or from a stylesheet comment.

Shots are under `<screen>/built/flow-<width>-<step>-<name>.png`. One measurement caveat: the browser
driving this walk is desktop Chromium, so at a 390 px viewport a 15 px classic scrollbar takes its
width and the page lays out at **375**. A real phone gives an overlay scrollbar and the full 390, so
every phone figure below is 15 px harsher than the hand it stands for.

## The gate, on this tree

| command | result |
|---|---|
| `npm test` | typecheck clean · `oxlint --max-warnings 0` clean · `prettier --check .` clean · **164 test files, 2,642 tests, all passed** in 182.69 s of vitest · `check` **14 rules, no failures**, every rule reading between 1 and 577 real files |
| `npm run build` | **built in 4.76 s**, 21 chunks, largest `images` 312.12 kB (43.23 kB gzipped) |
| `npm run e2e` | **366 passed, 1 failed, 95 skipped, 19.0 minutes** |

The one red check is `density — quotes` at `[laptop]` 1280 × 800: **6 rows against a requirement of
18**. It is the failure `docs/STATUS.md` already names — every ruler opens a browser nobody has used,
so the register is honestly empty and the six things a grid exposes are three band heads and three
notices. What has changed since that note was written is that the walk below *did* mint two quotes,
so the third `arrive` mode that would let the ruler measure a worked register is now buildable and is
still not built. **`npm run e2e` is red on this tree**, and STATUS's "both green" line is stale by
that one check.

## Where the flow actually breaks

A sales manager who reads nothing cannot complete this sale. Four separate controls refuse with a
sentence that is no longer true, and the app has no `<a>` element anywhere — every move between
screens is a `button` that calls the router, so there is nothing to middle-click, nothing to copy,
and nothing at all where a link would be.

1. **Home's `New quote` is dead and its reason is false.** `src/screens/home/Home.tsx:490` says *"The
   picker is not built yet, so there is nowhere for this to go."* The picker is built and live at
   `/quote/new`. The button is correctly `aria-disabled` with `tabindex="0"` and carries its sentence
   — the primitive behaves — but the sentence is a lie and the act is the only act on the screen.
   **A cold visitor cannot start a quote from Home at all.**
2. **The register's `New quote` says the same false thing** (`src/screens/quotes/Quotes.tsx:133`).
3. **The register's `Open it` says the document has no screen** (`Quotes.tsx:131`). It does:
   `/quote/$id/document`, walked below. So after making a version 2 there is no way to open it.
4. **The configurator's finale says the document is not built** (`Configurator.tsx:113`), printed
   under `Give it to the customer`. Pressing it issues the quote correctly and then strands you.
5. **Home never shows the draft it just counted.** With one draft filed it prints *"1 drafts are
   open, and the register that lists them is not built yet."* (`Home.tsx:818`) over the empty
   skeleton card that says *"when one does, it lands in this card."* Two falsehoods and a plural bug
   in one block.
6. **Home's photograph caption still says** *"Neither plate opens yet: a register has no screen until
   the picker is built."* (`Home.tsx:365`).
7. **There is no route from Home to the register.** Home has exactly two controls: the dead
   `New quote` and the search field. `/quotes` carries a `Home` button; Home carries nothing back.
   The document screen likewise has two controls, `Back to the build` and `Print`, and no way to the
   register or Home.
8. **An unknown address gives TanStack Router's stock `Not Found`** — small blue text on a plain
   white page, no token, no dealership, no way back
   (`quotes/built/flow-1440-35-unknown-route.png`). `src/routes/__root.tsx` sets no `errorComponent`
   and `src/main.tsx` sets no `defaultErrorComponent` or `defaultNotFoundComponent`, so a screen that
   throws lands there too.
9. **A stale quote link is a dead end.** `/quote/doesnotexist` prints one honest sentence — *"No
   quote is filed at this address."* — centred on an otherwise empty dark field with no control on
   it (`configurator/built/flow-1440-34-bad-id.png`).
10. **Picking a second motor adds it instead of replacing it.** On the SP560, pressing `F115XB` while
    `F90XB` was fitted took the total from **$66,584 to $83,453** and the chapter head to
    *"chosen: Yamaha - F90XB · +1 more"*. Two outboards on a 5.66 m RIB, with nothing said. Undo put
    it back exactly. Removing the first and then adding the second gives the swap a manager meant.

## Entry (`/sign-in`)

**1440 × 900** (`flow-1440-00-entry-cold.png`). A cleared browser typing `/` is redirected to
`/sign-in` before anything paints, and the screen is the board: the Stacer 481 at dusk, the pennant,
the card at left holding the instruction, one white field and the no-password paragraph, two doors
low across the water, the caption naming `boat_stacer · 91 rows` and *"drawn here at 1,440 × 962,
never enlarged"*. Typing a name and pressing the blue door leaves the page at **900 px in a 900 px
window** while it reads (`flow-1440-02-entry-reading.png`): the two refusal sentences appear under
the doors they belong to and the two-item step list sits in the water opposite the foot, so nothing
moves. It arrives on Home in about three seconds. Nothing is cut, nothing overlaps, nothing scrolls.

**390 × 844** (`flow-390-01-entry.png`). The photograph becomes a band at the top, then the card,
then the two doors as full-width bars, then the pennant note, the stamp, the row panel and the foot.
The page is **1,253 px** with no horizontal scroll and no clipped run. The foot is counted, not
typed: *"2 quotes are already in this browser, waiting on Home."*

**1920 × 1080** (`flow-1920-01-entry.png`). The photograph is drawn at its held **1,771 × 1,183** and
is never enlarged; the right edge is a gradient into the dark ground rather than a seam, which is the
fix the earlier critique asked for and it holds. The one thing still visible is the caption's own
wash: a soft rectangle with a crisp top-left corner over the water at about x = 1,640. Everything
fits in 1,080 with no scroll.

## Home (`/`)

**1440 × 900** (`flow-1440-03-home.png`, `flow-1440-33-home-with-quotes.png`). Four columns under two
photographs: the desk with the greeting and the amber act, the six counted figures, the seven makers
with their marks and row counts, the drafts card. Every figure is read: 810 boats, 241 motors, 444
trailers, 1,866 packages, 3,587 parts, 64 labour rates; 7,012 sellable rows and 8,679 joins. The
stamp changes honestly between visits — *read from the file* after the door, *read from this browser*
after a reload, with the read time printed. **And then the screen has nothing you can press.** The
act refuses falsely; the search field counts and cannot open; the drafts card is a wireframe.
Searching `Highfield SP560` prints **"1 rows carry that word."** — `Home.tsx:603` has no singular
branch, and neither does the picker's `Picker.tsx:265` (*"1 of 67 models carry those words"*), while
the configurator's `Configurator.tsx:325` gets it right with `rail.hits === 1 ? 'row carries' :
'rows carry'`. One screen of three.

**390 × 844** (`flow-390-02-home.png`, `flow-390-03-home-full.png`). Single column, page **2,688 px**.
The greeting, the act and the search come first and the photographs follow, so the primary act is at
the top of the screen and is never a floating bar. The makers' shelf stacks two-up and the Jeanneau
wordmark is the one mark that reads badly at this width. The `Ctrl K` chips are drawn on a screen
with no Ctrl key.

**1920 × 1080** (`flow-1920-02-home.png`). The whole screen fits with no scroll; the two photographs
grow to 1,002 × 668 and 786 × 520, both still under their held size. The four columns hold their
proportions. This is the best Home looks.

## Picker (`/quote/new`)

**1440 × 900** (`flow-1440-05` … `flow-1440-11`). Three tiers at once, and the counting is genuinely
good: 810 rows · 289 models · 42 series · 7 registers in the masthead, a row count beside every
register, *"4 rows · 3 figures"* under every model, and *"792 of those rows carry a figure at the
Cash rung; the other 18 hold a zero there, and a zero is not a price."* Searching `SP560` narrows to
one model in one series. Choosing it opens a panel with the held picture at 1,100 × 619, the spec
strip, the from price and the material and colourway tiles, each with its own figure and count.

**And the primary act is below the fold at every desk width.** Measured on the SP560 with a row
chosen, `Start the quote` sits at **top 1119, bottom 1171** — inside a `.picker-stage` that is
**1,093 px tall in a 592–692 px scrollport** — which puts it 371 px below an 800 px window, 271 px
below a 900 px window and 91 px below a 1,080 px window. At 1280 × 800 and at 1920 × 1080 **not one
pixel of it is on screen on first paint**, and the page itself does not scroll: only the inner panel
does, behind a 17 px classic light-grey scrollbar on a dark screen. Before a material is picked the
act is at 857–909 in a 900 px window, so 9 px of it is sliced; choosing a material pushes it further
away. The sentence under it reads *"Choose a material below and this becomes live"* while the
material tiles are **above** it. Meanwhile the middle column is empty from y ≈ 430 down — about half
the window is unused while the act is hidden in a 470 px scroller.

**390 × 844** (`flow-390-04-picker.png`). The best reflow in the app: the panel takes the whole screen
with a `← All the models` control at its head, the page scrolls normally, and the act is **static at
y = 1,339 of a 1,548 px page** — reachable, in the flow, not a floating bar.

**1920 × 1080** (`flow-1920-03-picker.png`). Two classic scrollbars at once (15 px on the register
index, 17 px on the panel), both light grey on the dark ground, and the act still off screen.

## Configurator (`/quote/$id`)

**1440 × 900** (`flow-1440-12` … `flow-1440-21`, `flow-1440-36`). This screen is the strongest thing
in the app. Six chapters, four of them the price file's own bands, each shut head stating its answer
and its subtotal, so the whole build reads in six lines. The masthead's running total is right at
every step and is never animated: **$66,584 → $83,453 → $52,053 → $68,922 → $69,320 → $67,017**, and
the line count moves with it. Undo appears on every pick, pinned to the event, and put every one of
those figures back exactly. Chapter 01 draws 15 finishes with seven PVC at *no change* and the HYP
rows at `+$6,659` at Trade. Chapter 03 holds two headings and says the refusal once, above the list —
*"Nothing from GFAB Trailers is paired with this one yet"* — with `Show all 32 in GFAB Trailers`
staying live beneath it, which is the house rule done properly. Search reaches every chapter at once:
`battery` reported **172 rows**, bolded the match, printed the dealer's code beside every name and
marked the chapters that had none with *"nothing here matches"* rather than hiding them.

**Two faults at this size.** First, a **3.31 px slit between the two sticky bars.** `.cfg-mast` ends
at 108.69 and `.cfg-find` begins at 112, both `position: sticky`, both opaque — so a 3 px band of the
rows scrolling underneath is painted between them. Magnified three times out of the screenshot it is
plainly the tops and tails of letters moving across a gap (`flow-1440-18-config-fit.png`; the same
3.31 px measured at 1920 in `flow-1920-05-config-slit.png`). Second, **the issued refusal is printed
on every row.** After `Give it to the customer` the sentence *"This quote has been given to the
customer, so nothing can go back on it. Make a new version to change it."* appears **5 times** on the
one open chapter — once in the rail, once per row — set as a three-line paragraph wedged *between*
rows, so it reads as though it belongs to the row below it
(`flow-1440-27-config-issued-refusal.png`). On `Show all 209 in Yamaha Outboards` that would be 209
copies. The fitment refusal one chapter above says its reason **once**, above the list. The same
screen holds both patterns.

**390 × 844** (`flow-390-06-config.png`). The masthead stacks, the total drops under its label, each
chapter head puts its figure on its own line, and `.cfg-find` goes `static`, which is why the slit
does not exist here. Page **2,587 px**, no horizontal scroll, no clipped run. The placeholder still
offers `Ctrl K`.

**1920 × 1080** (`flow-1920-04-config.png`). The rail widens and the whole build is legible without
scrolling past chapter 04. The left stage draws the boat at 412 × 232 against a held 1,100 × 619.
About 150 px of ground sits unused at the right.

## Cascade (`/quote/$id/cascade`)

**1440 × 900** (`flow-1440-22` … `flow-1440-24`, `flow-1440-37`). Both channels fire from one press
and both are routes, so Back and a refresh behave. The level sheet, on a quote of four lines, gave
**two re-priced cards and two held cards, grouped by cause in the engine's own words** — `now priced
at Trade`, `now priced at Trade Price`, `no Trade column — stays at Sell inc Rego`, `no Trade column
— stays at Sell` — then *"Every line on this quote is accounted for above."* and a static decision
block: **−$2,303**, *"$69,320 today · $67,017 if you accept."* Accepting rewrote the heading to
*"Priced at Trade."*, the figure to **$67,017**, and offered `Back to the build` and `Undo`. The
finish channel is as good: the hull's own from→to at `+$6,659`, a `NOT CHECKED` card saying *"No load
column has been named for this project, so the capacity floor cannot run"* with the towing-weight row
printed as two em-dashes, and six paired trailers from $10,713. Nothing on either sheet is a sentence
the screen wrote.

What it costs is space. The blurred stage is **540 px of grey at 1440**, the page runs to 1,258 px,
and the decision block is 358 px below the fold, so the act must be scrolled to.

**390 × 844** (`flow-390-07-cascade.png`). The best responsive decision in the app: the blur becomes a
band at the top and the two held cards collapse into one sentence, *"2 other lines stay exactly as
they are."* The census survives; the cards do not. The act is static at the end of a 1,366 px page.

**1920 × 1080** (`flow-1920-06-cascade.png`). Everything fits with the act on screen — and the blur is
now **895 px, 47 % of the window**, with a further 180 px of empty ground between the last card and
the decision block. It is the reference's own composition and it is a lot of nothing on an office
monitor.

## Document (`/quote/$id/document`)

**1440 × 900** (`flow-1440-28-document.png`, `flow-1440-29-document-full.png`). The sheet measures
**793.7 × 1122.5 CSS px** — A4 to within a rounding — on the dark floor with crop marks and `PAGE 1`
in the gutter, **3 sheets in the DOM** for the 3 the header claims. Page 1 is the cover, page 2 the
four bands with `Optional` counted off the register (*"3 more were offered from Yamaha Outboards and
are not on this quote"*), page 3 the terms and the provenance. Every money cell is a figure or one of
the three words. `Print` calls `window.print()` exactly once, verified by stubbing it before the
press. Nothing is invented: with no organisation on this pack the sheet says *"This business has not
been named yet"* and *"No terms are printed, because this business has not typed any."*

**Two things the owner should look at, because they are decisions and not bugs.** The sheet handed to
the customer prints **`TOTAL AT TRADE, TAX INCLUDED`** and, lower, *"Priced at Trade, which 2 of the 4
lines carry."* `Trade` is the dealer's own rung name. It is not a cost column and no guard is wrong,
but it tells Marcus Webb which internal column he is being priced from. And page 2 carries a
`HOW TO READ A LINE` glossary explaining `Included`, `Optional` and `Not priced at this level`,
ending *"On this document: 0 lines are included, 11 rows were offered and not taken, and 0 lines
carry no price at this level."* — a sentence about the register, printed to the buyer.

**390 × 844** (`flow-390-08-document.png`). The sheet stops pretending to be A4 and becomes one
full-width column at 375 px with `PAGE 1 OF 3 · A4` as a label; 3 sheets, 3,394 px, no overflow. The
white ground goes edge to edge under the dark chrome, which is abrupt but honest.

**1920 × 1080** (`flow-1920-07-document.png`). The sheet is at true size in the middle with about
550 px of floor on each side. *"Every line below carries a figure, and this is their sum."* wraps with
`sum.` alone on its line.

## Quotes register (`/quotes`)

**1440 × 900** (`flow-1440-30-quotes.png`, `flow-1440-31-quotes-peek.png`,
`flow-1440-32-quotes-version.png`). The register found the quote and the structure really is the
state: `DRAFT 0` · `ISSUED 1 $67,017` · `SUPERSEDED 0`, with the row carrying the boat, `Marcus
Webb`, `$67,017`, `20260917-01` and `2 minutes ago`, and no state column and no coloured pill.
Clicking the row peeks it in place and writes `?at=20260917-01` into the address; a full reload
restored both the row and the open peek. `Make a new version` worked perfectly — `DRAFT 1` carrying
*"replaces 20260917-01"*, `SUPERSEDED 1` carrying *"replaced by 20260917-02"*, and a version rail
with `20260917-01 Issued` and `20260917-02 Draft LATEST`. **And then three of the peek's six controls
are refused**, two of them falsely, so the version you just made cannot be opened. The find field is
correctly absent: `domain/quote/find` carries `FIND_FIELD_AT = 8` and this browser holds two, which
is why the masthead says *"and all of them are on this screen"*. That masthead line wraps badly at
1440 and at 1920, leaving `THIS SCREEN` alone on a right-aligned second line.

**390 × 844** (`flow-390-05-quotes.png`). Each row becomes three lines, the bands keep their
fractions, the act stays in the flow. The `J K Space Enter Esc` legend is drawn on a device with none
of them.

**1920 × 1080** (`flow-1920-08-quotes.png`). Six rows and roughly 750 px of empty ledger. This is the
same emptiness the `density` ruler fails on, seen by eye.

## Smaller things measured on the walk

- **Classic light-grey scrollbars on a dark app**, unstyled: 15 px inside `.picker-index`, 17 px
  inside `.picker-stage`, and one inside the register's peek panel. They cut the rounded corner of
  the card they sit in.
- **An accessible name loses its head.** Two rigging-kit rows in chapter 04 report
  `aria-label="(Left Hand) Mount w 6Y5 2 Gauges, 5m Harness, 15' Cables & Filter, not on the quote"`
  — the visible name begins *"Mech Rigging Kit - 6X3 Concealed"* and the label does not.
- **`one` and `where`** are two empty files tracked at the repo root, almost certainly shell
  accidents (`git … > one`, `where node`). They are committed.
- **Console:** no error was produced by any step of this walk on this tree. The long-lived browser's
  history carries a `ReferenceError: quoteTotals is not defined` in `Cascade.tsx` from a module
  served before this session under a different HMR timestamp; `quoteTotals` does not appear in
  `src/screens/cascade/Cascade.tsx` on this tree and the screen rendered correctly at all three
  sizes, so it is recorded here as noise rather than as a defect.
- **`npm test` is not under two minutes.** Vitest alone runs 182.69 s, and typecheck, lint and format
  run before it. CLAUDE.md's "Under two minutes" is no longer true.

## One note on the evidence itself

Seventeen of the shots this walk took were swept into commit `f734fc1` ("The document, built — the
selling flow is whole") at 23:04 while the walk was still running — `flow-1440-02` through
`flow-1440-18`. They were not written for that commit and they are not evidence for it; they are the
first half of this walk. That commit's message also says *"A dealer can sign in, load the file, pick
a hull, build a rig … and look at the document it would print."* On this tree a dealer cannot: Home's
`New quote` refuses, and neither the configurator's finale nor the register's `Open it` will open the
document. The message's `Measured: 164 test files, 2,642 tests, 0 failed` is true of `npm test` and
says nothing about `npm run e2e`, which is red on `density — quotes`.

---

# Home, after the second critique. 2026-09-18

Written by driving `npm run dev` on port 5100 in a real Chromium at all six ruler widths — cold
browser, name typed at the door, the file read, a Highfield SP560 quoted through the picker, then
Home opened again with that document filed. Every figure below was read off the live DOM with
`getBoundingClientRect` or computed from the painted colours. Shots: `home/built/*-wired*.png`.
Home is still **provisional**: the owner has not looked.

**The blocker is gone, and it was a routing change.** The critique measured it in one line — "a
dealer who lands on Home cannot start a quote, cannot reach the register, and cannot reach the
drafts the same screen is counting" — and every address it wanted already existed. Measured now,
press by press:

| press | lands at |
|---|---|
| `New quote` | `/quote/new` |
| `Open Highfield Inflatables`, on the left plate | `/quote/new?brand=boat_highfield` |
| `Open Stacer`, on the right plate | `/quote/new?brand=boat_stacer` |
| `All quotes`, under the card | `/quotes` |
| the card itself | `/quote/<the id the card drew>` |

`e2e/flows/home.spec.ts` follows all four at every viewport rather than asserting they are present,
because a control that is merely present is what shipped last time. **18 checks pass** there (3
tests × 6 viewports).

**Three false sentences were deleted rather than corrected.** `NO_PICKER` ("the picker is not built
yet"), the film line's "NEITHER PLATE OPENS YET: A REGISTER HAS NO SCREEN UNTIL THE PICKER IS
BUILT", and "1 drafts are open, and the register that lists them is not built yet" — all three named
a screen that has existed since the day before. The flow now asserts their absence by regex.

**The act has the live amber back.** `--color-act` at 8.21:1 under its ink, 380 × 52 at 1440, 440 ×
52 at 1920, 328 × 52 at 1280 and full width at 358 × 52 in a hand. `--color-act-refused` keeps its
job for an act that genuinely cannot act; nothing on this screen is in that state any more.

**A filed document lands in the card the empty one draws.** The regions are the diagram's own:
photograph, who it is for, what is on it, the total at its rung, when it was last touched. Measured
on the SP560 quoted through the picker: `DRAFT · 20260918-01`, `Highfield - SP560 (PVC) W-W-WB`,
`Nobody is named on it yet`, **$66,584**, `TOTAL AT CASH`, `3 lines · just now`. Every word of it was
frozen onto the document when the lines were picked — the card renders identically on a desk whose
price file has never been opened, which is why `src/screens/home/filed.ts` reads
`domain/quote/register` and never the catalogue.

**The photograph on it is the ledger's or nothing.** The hero ledger holds an SP560, so the card
draws it at **112 × 84 from `highfield-sp560-…-640.webp`** — the narrowest copy the ledger holds,
chosen at all six widths by a `sizes` of the plate's own measure — never enlarged. A boat the ledger
holds nothing for keeps the same well and says `NO PHOTOGRAPH HELD FOR THIS MODEL`. Nothing stands
in.

**The plural bug and its neighbour.** `1 draft is open.` where it printed `1 drafts are open`, and
`1 row carries that word` in the search line where it printed `1 rows carry`. The census beside them
is the register's own words and is printed only when it says something the sentence does not:
`1 draft is open. 2 filed in all — 1 draft · 1 issued.`

**Geometry, with a real document on the screen** (`overflow` counts elements whose right edge is
past the window):

| viewport | page × window | act top, size, `position` | card | `All quotes` | overflow |
|---|---|---|---|---|---|
| 390 × 844 | 2,493 in 844 | 233 · 358 × 52 · static | 358 × 191 at 2,175 | 2,383 | 0 |
| 844 × 390 | 2,001 in 390 | 239 · 780 × 52 · static | 780 × 188 at 1,702 | 1,906 | 0 |
| 834 × 1112 | 2,016 in 1,112 | 239 · 770 × 52 · static | 770 × 188 at 1,717 | 1,921 | 0 |
| 1280 × 800 | **800 in 800** | 502 · 328 × 52 · static | 372 × 191 at 441 | 648 | 0 |
| 1440 × 900 | **900 in 900** | 618 · 380 × 52 · static | 336 × 191 at 559 | 766 | 0 |
| 1920 × 1080 | **1,080 in 1,080** | 790 · 440 × 52 · static | 400 × 191 at 752 | 959 | 0 |

The three desk widths still end exactly on the window with the card and the register door added, and
`scrollWidth` equals `clientWidth` at every one of the six. The act is `position: static`
everywhere — never a floating bottom bar — and in a hand it is still on the first screen at 233 of
844. This is also the first record of Home at 834 × 1112 and 844 × 390, which the critique noted had
never been shot.

**Contrast, on the one thing the rulers cannot open.** The contrast ruler walks Home through
`e2e/routes.ts`, which arrives on a browser with no quote in it, so the card is not in front of it —
the same gap `/quote/$id` has. Measured by hand instead, compositing each text node's real ancestor
chain through a canvas at 1440 × 900 with the document filed: **the worst pair in the whole drafts
column is 7.49 : 1** (`Total at Cash` and the kept note, neutral-400 on the ground) and the smallest
type is **11px**, the floor. The boat is 18.43:1, the figure 18.43:1, the customer line and the age
8.74:1, `All quotes` 18.44:1. The rulers themselves pass on Home at every viewport they run —
contrast × 6, cut × 6, overlap — with the plate doors in front of them.

**What was deliberately not changed.** The film line keeps its provenance and loses only its false
clause. The empty card is untouched: it is still the true state of a browser nobody has quoted from,
and it is still drawn with every region named. The makers' shelf, the six counts, the stamp and the
search are as they were.
